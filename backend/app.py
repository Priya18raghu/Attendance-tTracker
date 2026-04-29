"""
Smart Attendance Tracking System — Flask Backend
=================================================
REST API with 6 endpoints for user management, attendance tracking,
dashboard analytics, and Claude AI-powered summaries.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import get_db, init_db
from datetime import datetime, date
import os

# Serve frontend files from the ../frontend folder
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend')
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)  # Allow cross-origin requests if needed


# ──────────────────────────────────────────────
# USER ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all registered users."""
    conn = get_db()
    users = conn.execute('SELECT * FROM users ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])


@app.route('/api/users', methods=['POST'])
def add_user():
    """Register a new user. Expects JSON: { name, email }"""
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    conn = get_db()
    try:
        conn.execute('INSERT INTO users (name, email) VALUES (?, ?)', (name, email))
        conn.commit()
        return jsonify({'message': f'User "{name}" added successfully!'}), 201
    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({'error': 'A user with this email already exists'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ──────────────────────────────────────────────
# ATTENDANCE ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    """
    Mark attendance for a user. Expects JSON: { user_id, status }
    - Date and time are auto-filled (server-side).
    - Duplicate attendance for the same user on the same day is rejected.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    status = data.get('status')

    if not user_id or status not in ('Present', 'Absent'):
        return jsonify({'error': 'user_id and status (Present/Absent) are required'}), 400

    today = date.today().isoformat()       # e.g. "2026-04-27"
    now = datetime.now().strftime('%H:%M:%S')  # e.g. "13:30:00"

    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO attendance (user_id, date, time, status) VALUES (?, ?, ?, ?)',
            (user_id, today, now, status)
        )
        conn.commit()
        return jsonify({'message': 'Attendance marked successfully!'}), 201
    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({'error': 'Attendance already marked for this user today'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """
    Get attendance history.
    Optional query param: ?user_id=1 to filter by user.
    """
    user_id = request.args.get('user_id')
    conn = get_db()

    if user_id:
        records = conn.execute('''
            SELECT a.id, u.name, u.email, a.date, a.time, a.status
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?
            ORDER BY a.date DESC, a.time DESC
        ''', (user_id,)).fetchall()
    else:
        records = conn.execute('''
            SELECT a.id, u.name, u.email, a.date, a.time, a.status
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.date DESC, a.time DESC
        ''').fetchall()

    conn.close()
    return jsonify([dict(r) for r in records])


@app.route('/api/attendance/<int:record_id>', methods=['DELETE'])
def delete_attendance(record_id):
    """Delete a specific attendance record by its ID."""
    conn = get_db()
    try:
        result = conn.execute('DELETE FROM attendance WHERE id = ?', (record_id,))
        conn.commit()
        if result.rowcount == 0:
            return jsonify({'error': 'Record not found'}), 404
        return jsonify({'message': 'Record deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ──────────────────────────────────────────────
# DASHBOARD ENDPOINT
# ──────────────────────────────────────────────

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics: total, present, absent, percentage."""
    conn = get_db()

    total = conn.execute('SELECT COUNT(*) FROM attendance').fetchone()[0]
    present = conn.execute(
        "SELECT COUNT(*) FROM attendance WHERE status = 'Present'"
    ).fetchone()[0]
    absent = conn.execute(
        "SELECT COUNT(*) FROM attendance WHERE status = 'Absent'"
    ).fetchone()[0]

    percentage = round((present / total * 100), 1) if total > 0 else 0

    conn.close()
    return jsonify({
        'total_records': total,
        'total_present': present,
        'total_absent': absent,
        'attendance_percentage': percentage
    })


# ──────────────────────────────────────────────
# CLAUDE AI SUMMARY ENDPOINT  (Step 4)
# ──────────────────────────────────────────────

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """
    Generate a short attendance summary using Claude AI.
    Falls back to a basic summary if no API key is configured.
    """
    conn = get_db()

    total = conn.execute('SELECT COUNT(*) FROM attendance').fetchone()[0]
    present = conn.execute(
        "SELECT COUNT(*) FROM attendance WHERE status = 'Present'"
    ).fetchone()[0]
    absent = total - present
    percentage = round((present / total * 100), 1) if total > 0 else 0

    # Get the 10 most recent records for context
    recent = conn.execute('''
        SELECT u.name, a.date, a.status
        FROM attendance a JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC LIMIT 10
    ''').fetchall()
    conn.close()

    recent_text = '\n'.join(
        [f"- {r['name']}: {r['status']} on {r['date']}" for r in recent]
    )

    # Try Claude AI — gracefully fall back if no key
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)

            prompt = (
                f"You are an attendance analyst. Summarize this data in 2-3 short sentences.\n\n"
                f"Total records: {total}\n"
                f"Present: {present}, Absent: {absent}\n"
                f"Attendance rate: {percentage}%\n\n"
                f"Recent records:\n{recent_text}"
            )

            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            summary = message.content[0].text
            return jsonify({'summary': summary, 'source': 'claude-ai'})

        except Exception as e:
            print(f"Claude API error: {e}")
            # Fall through to basic summary

    # Fallback: generate a basic summary without AI
    summary = (
        f"Total of {total} attendance records logged. "
        f"{present} marked present and {absent} marked absent, "
        f"yielding an overall attendance rate of {percentage}%."
    )
    return jsonify({'summary': summary, 'source': 'basic'})


# ──────────────────────────────────────────────
# SERVE FRONTEND
# ──────────────────────────────────────────────

@app.route('/')
def serve_frontend():
    """Serve the React frontend."""
    return send_from_directory(FRONTEND_DIR, 'index.html')


# ──────────────────────────────────────────────
# START SERVER
# ──────────────────────────────────────────────

if __name__ == '__main__':
    init_db()  # Create tables on first run
    print('\n>>> Server running at http://localhost:5000\n')
    app.run(debug=True, port=5000)
