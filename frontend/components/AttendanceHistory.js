/**
 * AttendanceHistory Component
 * Displays all attendance records in a table with optional user filter.
 */
const AttendanceHistory = ({ users }) => {
    const [records, setRecords] = React.useState([]);
    const [filterUser, setFilterUser] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    const fetchRecords = async (userId) => {
        setLoading(true);
        try {
            const url = userId
                ? `/api/attendance?user_id=${userId}`
                : '/api/attendance';
            const res = await fetch(url);
            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRecords(filterUser);
    }, [filterUser]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const res = await fetch(`/api/attendance/${recordId}`, { method: 'DELETE' });
            if (res.ok) {
                setRecords(prev => prev.filter(r => r.id !== recordId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete record.');
            }
        } catch (err) {
            alert('Could not connect to server.');
        }
    };

    return (
        <div className="glass-card">
            <h2 className="card-title">📜 Attendance History</h2>
            <p className="card-subtitle">View past attendance records. Use the filter to narrow by user.</p>

            <div className="filter-bar">
                <select
                    id="filter-user"
                    className="form-select"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                >
                    <option value="">All Users</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-text">
                    <span className="spinner"></span> Loading records...
                </div>
            ) : records.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <p>No attendance records found.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={r.id}>
                                    <td>{i + 1}</td>
                                    <td>{r.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{r.email}</td>
                                    <td>{formatDate(r.date)}</td>
                                    <td>{formatTime(r.time)}</td>
                                    <td>
                                        <span className={`badge badge-${r.status.toLowerCase()}`}>
                                            {r.status === 'Present' ? '✅' : '❌'} {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-delete"
                                            title="Delete this record"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
