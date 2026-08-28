import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, entries, wins } = useAuth();
  const totalSpent = entries.reduce((sum, entry) => sum + entry.totalCost, 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <p className="section-eyebrow">Member dashboard</p>
          <h1 className="section-heading">Welcome back, {user?.name?.split(' ')[0]}.</h1>
          <p className="section-copy">Track premium entries, spending, and draw outcomes across your account.</p>
        </div>

        <section className="kpi-grid">
          <div className="dashboard-card dashboard-kpi"><div className="metric-value">{entries.length}</div><div className="metric-label">Orders placed</div></div>
          <div className="dashboard-card dashboard-kpi"><div className="metric-value">{entries.reduce((sum, item) => sum + item.quantity, 0)}</div><div className="metric-label">Entries secured</div></div>
          <div className="dashboard-card dashboard-kpi"><div className="metric-value">{totalSpent.toLocaleString()} AED</div><div className="metric-label">Member spend</div></div>
          <div className="dashboard-card dashboard-kpi"><div className="metric-value">{wins}</div><div className="metric-label">Wins recorded</div></div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>Recent entries</h2>
            {entries.length === 0 ? (
              <div>
                <p className="section-copy">You have not secured entries yet.</p>
                <Link className="btn" to="/">
                  Explore competitions
                </Link>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Competition</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <strong>{entry.competitionTitle}</strong>
                          <div>{new Date(entry.createdAt).toLocaleString()}</div>
                        </td>
                        <td>{entry.quantity}</td>
                        <td>{entry.totalCost.toLocaleString()} AED</td>
                        <td><span className={`status-chip ${entry.status}`}>{entry.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="dashboard-card">
            <h2>Account overview</h2>
            <div className="info-list compact">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Member since:</strong> {user ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            <div className="notice">Every successful checkout adds a confirmed entry to this dashboard automatically.</div>
            <Link className="btn-secondary" to="/">
              Enter another competition
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
