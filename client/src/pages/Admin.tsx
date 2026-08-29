import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Entry, User } from '../types';

interface Stats {
  totalUsers: number;
  totalEntries: number;
  totalRevenue: number;
  activeCompetitions: number;
}

interface AdminEntry extends Entry {
  userName?: string;
  userEmail?: string;
}

const Admin = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const headers = token ? { Authorization: 'Bearer ' + token } : undefined;

    const loadAdminData = async () => {
      try {
        const [statsResponse, usersResponse, entriesResponse] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/entries', { headers }),
        ]);

        if (!statsResponse.ok || !usersResponse.ok || !entriesResponse.ok) {
          throw new Error('Unable to load admin data');
        }

        const [statsData, usersData, entriesData] = await Promise.all([
          statsResponse.json(),
          usersResponse.json(),
          entriesResponse.json(),
        ]);

        setStats(statsData);
        setUsers(usersData);
        setEntries(entriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData().catch(() => setError('Unable to load admin data'));
  }, [token]);

  if (loading) {
    return <div className="container page-header"><div className="notice">Loading admin command centre…</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <p className="section-eyebrow">Admin dashboard</p>
          <h1 className="section-heading">Luxury platform command centre</h1>
          <p className="section-copy">Review top-line health, member activity and transaction-ready entry flow data.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {stats && (
          <section className="kpi-grid">
            <div className="admin-card dashboard-kpi"><div className="metric-value">{stats.totalUsers}</div><div className="metric-label">Members</div></div>
            <div className="admin-card dashboard-kpi"><div className="metric-value">{stats.totalEntries}</div><div className="metric-label">Orders</div></div>
            <div className="admin-card dashboard-kpi"><div className="metric-value">{stats.totalRevenue.toLocaleString()} AED</div><div className="metric-label">Gross revenue</div></div>
            <div className="admin-card dashboard-kpi"><div className="metric-value">{stats.activeCompetitions}</div><div className="metric-label">Live competitions</div></div>
          </section>
        )}

        <div className="admin-grid">
          <section className="admin-card">
            <h2>Members</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card">
            <h2>Entries</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Competition</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.competitionTitle}</td>
                      <td>{entry.userName || entry.userEmail || entry.id}</td>
                      <td>{entry.quantity}</td>
                      <td>{entry.totalCost.toLocaleString()} AED</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
