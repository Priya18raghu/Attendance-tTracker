# 📋 Smart Attendance Tracking System

A full-stack web application for tracking, managing, and analyzing attendance with AI-powered insights — built with Python Flask and React.

---

## ✨ Features

- **User Management** — Register users with name and email (duplicate email prevention).
- **Mark Attendance** — Mark users as Present or Absent with auto-filled date and time; duplicate entries for the same user on the same day are automatically blocked.
- **Attendance History** — View all attendance records with user-level filtering and the ability to delete records.
- **Real-Time Dashboard** — Live analytics showing total records, present/absent counts, and attendance percentage.
- **AI-Powered Summary** — Generate intelligent attendance summaries using Claude AI (with automatic fallback to a basic summary if no API key is configured).
- **Dark Glassmorphic UI** — Modern, responsive interface with glassmorphism design, smooth animations, and Inter typography.

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| **Backend**  | Python, Flask, Flask-CORS           |
| **Frontend** | React 18 (via CDN), Babel, HTML, CSS |
| **Database** | SQLite                              |
| **AI**       | Claude API (Anthropic) — optional   |
| **Styling**  | Vanilla CSS (glassmorphism, dark theme, Inter font) |

---

## 📁 Project Structure

```
Task/
├── backend/
│   ├── app.py            # Flask server with REST API endpoints
│   ├── models.py         # Database schema and initialization
│   └── attendance.db     # SQLite database (auto-created on first run)
├── frontend/
│   ├── index.html        # Entry point — loads React via CDN
│   ├── App.js            # Root component with tab navigation
│   ├── style.css         # Dark glassmorphic theme styles
│   └── components/
│       ├── AddUser.js            # User registration form
│       ├── MarkAttendance.js     # Mark attendance form
│       ├── AttendanceHistory.js  # Attendance records table
│       └── Dashboard.js         # Analytics dashboard with AI summary
└── README.md
```

---

## 🚀 How to Run

### Prerequisites

- **Python 3.8+** installed on your system
- **pip** (Python package manager)

### Step 1 — Clone the Project

```bash
git clone https://github.com/Priya18raghu/Attendance-tTracker.git
cd Attendance-tTracker
```

### Step 2 — Install Backend Dependencies

```bash
pip install flask flask-cors
```

> **Optional:** If you want AI-powered summaries, also install the Anthropic SDK and set your API key:
> ```bash
> pip install anthropic
> set ANTHROPIC_API_KEY=your-api-key-here    # Windows
> export ANTHROPIC_API_KEY=your-api-key-here  # macOS/Linux
> ```

### Step 3 — Start the Server

```bash
cd backend
python app.py
```

You should see:

```
[OK] Database initialized successfully!

>>> Server running at http://localhost:5000
```

### Step 4 — Open the App

Open your browser and navigate to:

```
http://localhost:5000
```

The frontend is served directly by Flask — no separate frontend server needed!

---

## 📡 API Endpoints

| Method   | Endpoint                     | Description                       |
| -------- | ---------------------------- | --------------------------------- |
| `GET`    | `/api/users`                 | Get all registered users          |
| `POST`   | `/api/users`                 | Add a new user (`name`, `email`)  |
| `GET`    | `/api/attendance`            | Get attendance records            |
| `POST`   | `/api/attendance`            | Mark attendance (`user_id`, `status`) |
| `DELETE` | `/api/attendance/<record_id>`| Delete an attendance record       |
| `GET`    | `/api/dashboard`             | Get dashboard statistics          |
| `GET`    | `/api/summary`               | Get AI-generated attendance summary |

---
