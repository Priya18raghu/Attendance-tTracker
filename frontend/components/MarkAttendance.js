/**
 * MarkAttendance Component
 * Select a user, choose Present/Absent, and submit.
 * Date & time are auto-filled server-side; duplicates are rejected.
 */
const MarkAttendance = ({ users, onAttendanceMarked }) => {
    const [selectedUser, setSelectedUser] = React.useState('');
    const [status, setStatus] = React.useState('Present');
    const [msg, setMsg] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            setMsg({ type: 'error', text: 'Please select a user.' });
            return;
        }

        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: parseInt(selectedUser), status })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: data.message });
                setSelectedUser('');
                setStatus('Present');
                if (onAttendanceMarked) onAttendanceMarked();
            } else {
                setMsg({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Could not connect to server.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <h2 className="card-title">📋 Mark Attendance</h2>
            <p className="card-subtitle">
                Select a user and mark them as present or absent. Today's date and current time are recorded automatically.
            </p>

            {msg && (
                <div className={`msg msg-${msg.type}`}>
                    {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="attendance-user">Select User</label>
                    <select
                        id="attendance-user"
                        className="form-select"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">— Choose a user —</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <div className="status-toggle">
                        <div className="status-option">
                            <input
                                type="radio"
                                id="status-present"
                                name="status"
                                value="Present"
                                checked={status === 'Present'}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <label htmlFor="status-present" className="present-label">✅ Present</label>
                        </div>
                        <div className="status-option">
                            <input
                                type="radio"
                                id="status-absent"
                                name="status"
                                value="Absent"
                                checked={status === 'Absent'}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <label htmlFor="status-absent" className="absent-label">❌ Absent</label>
                        </div>
                    </div>
                </div>

                <button id="btn-mark-attendance" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Submitting...</> : '📝 Mark Attendance'}
                </button>
            </form>
        </div>
    );
};
