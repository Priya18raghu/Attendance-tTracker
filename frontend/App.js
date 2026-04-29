/**
 * App — Root Component
 * Provides tab navigation between Dashboard, Mark Attendance, History, and Add User.
 */
const App = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [users, setUsers] = React.useState([]);
    const [refreshKey, setRefreshKey] = React.useState(0);

    // Fetch users on mount and whenever refreshKey changes
    const fetchUsers = () => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error('Failed to fetch users:', err));
    };

    React.useEffect(() => {
        fetchUsers();
    }, [refreshKey]);

    // Trigger a data refresh (e.g., after marking attendance or adding a user)
    const refresh = () => setRefreshKey(k => k + 1);

    const tabs = [
        { id: 'dashboard',  label: '📊 Dashboard' },
        { id: 'mark',       label: '📋 Mark Attendance' },
        { id: 'history',    label: '📜 History' },
        { id: 'add-user',   label: '👤 Add User' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key={refreshKey} />;
            case 'mark':
                return <MarkAttendance users={users} onAttendanceMarked={refresh} />;
            case 'history':
                return <AttendanceHistory key={refreshKey} users={users} />;
            case 'add-user':
                return <AddUser onUserAdded={refresh} />;
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <h1>Smart Attendance Tracker</h1>
                <p>Track, analyze, and summarize attendance with AI</p>
            </header>

            {/* Navigation */}
            <nav className="nav-tabs" id="main-nav">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Page Content */}
            <main>
                {renderContent()}
            </main>
        </div>
    );
};
