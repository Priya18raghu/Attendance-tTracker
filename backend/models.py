"""
Database models and initialization for the Smart Attendance Tracking System.
Uses SQLite for simplicity — no external DB server needed.
"""

import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), 'attendance.db')


def get_db():
    """Get a database connection with row factory enabled."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Access columns by name
    conn.execute("PRAGMA foreign_keys = ON")  # Enable FK constraints
    return conn


def init_db():
    """Create the database tables if they don't exist."""
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Attendance table with unique constraint to prevent duplicates
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, date)
        )
    ''')

    conn.commit()
    conn.close()
    print("[OK] Database initialized successfully!")


if __name__ == '__main__':
    init_db()
