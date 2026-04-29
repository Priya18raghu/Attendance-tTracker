/**
 * Dashboard Component
 * Shows stat cards (total, present, absent, percentage) and an AI-powered summary.
 */
const Dashboard = () => {
    const [stats, setStats] = React.useState(null);
    const [summary, setSummary] = React.useState(null);
    const [loadingStats, setLoadingStats] = React.useState(true);
    const [loadingSummary, setLoadingSummary] = React.useState(true);

    React.useEffect(() => {
        // Fetch dashboard stats
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => { setStats(data); setLoadingStats(false); })
            .catch(() => setLoadingStats(false));

        // Fetch AI summary
        fetch('/api/summary')
            .then(res => res.json())
            .then(data => { setSummary(data); setLoadingSummary(false); })
            .catch(() => setLoadingSummary(false));
    }, []);

    if (loadingStats) {
        return (
            <div className="glass-card">
                <div className="loading-text">
                    <span className="spinner"></span> Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{stats ? stats.total_records : 0}</div>
                    <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{stats ? stats.total_present : 0}</div>
                    <div className="stat-label">Present</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon">❌</div>
                    <div className="stat-value">{stats ? stats.total_absent : 0}</div>
                    <div className="stat-label">Absent</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon">📈</div>
                    <div className="stat-value">{stats ? stats.attendance_percentage : 0}%</div>
                    <div className="stat-label">Attendance Rate</div>
                </div>
            </div>

            {/* AI Summary */}
            <div className="ai-summary">
                <div className="ai-summary-label">
                    🤖 AI-Powered Summary
                    {summary && summary.source === 'claude-ai' && (
                        <span style={{ opacity: 0.6, fontWeight: 400, textTransform: 'none' }}> — via Claude</span>
                    )}
                </div>
                {loadingSummary ? (
                    <div className="loading-text" style={{ justifyContent: 'flex-start', padding: '8px 0' }}>
                        <span className="spinner"></span> Generating summary...
                    </div>
                ) : summary ? (
                    <p className="ai-summary-text">{summary.summary}</p>
                ) : (
                    <p className="ai-summary-text" style={{ fontStyle: 'italic' }}>
                        Unable to generate summary. Make sure the backend is running.
                    </p>
                )}
            </div>
        </div>
    );
};
