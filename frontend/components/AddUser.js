/**
 * AddUser Component
 * Form to register a new user with name and email.
 */
const AddUser = ({ onUserAdded }) => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [msg, setMsg] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setMsg({ type: 'error', text: 'Please fill in both fields.' });
            return;
        }

        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim() })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: data.message });
                setName('');
                setEmail('');
                if (onUserAdded) onUserAdded();
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
            <h2 className="card-title">👤 Add New User</h2>
            <p className="card-subtitle">Register a student or employee to track their attendance.</p>

            {msg && (
                <div className={`msg msg-${msg.type}`}>
                    {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="user-name">Full Name</label>
                    <input
                        id="user-name"
                        className="form-input"
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="user-email">Email Address</label>
                    <input
                        id="user-email"
                        className="form-input"
                        type="email"
                        placeholder="e.g. priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button id="btn-add-user" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Adding...</> : '➕ Add User'}
                </button>
            </form>
        </div>
    );
};
