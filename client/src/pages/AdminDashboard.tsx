import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

interface ActivityEntry {
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface DashboardData {
  todaysEntries: number;
  todaysRevenue: number;
  todaysOwnerProfit: number;
  publicRingFencedToday: number;
  weeklyOwnerProfit: number;
  monthlyOwnerProfit: number;
  yearlyProjection: number;
  ownerProfitSharePercent: number;
  publicRingFencedPercent: number;
  availableToWithdraw: number;
  pendingWithdrawal: number;
  totalWithdrawn: number;
  autoWithdrawal: {
    enabled: boolean;
    threshold: number;
  };
  recentActivity: ActivityEntry[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'ownerAdminToken';

function formatMoney(value: number): string {
  return value.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login');
      return;
    }

    const refresh = async () => {
      const token = getToken();
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { 'x-admin-token': token },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          navigate('/admin/login');
          return;
        }

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load dashboard');
        }

        setData(payload);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleWithdraw = async () => {
    const token = getToken();
    if (!token) return;
    const amount = Number.parseFloat(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    setWithdrawing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/withdraw`, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Withdrawal failed');
      }

      setWithdrawAmount('');
      setData((current) => (current
        ? {
          ...current,
          availableToWithdraw: payload.availableToWithdraw,
          totalWithdrawn: payload.totalWithdrawn,
        }
        : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      }).catch(() => undefined);
    }

    localStorage.removeItem(TOKEN_KEY);
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="owner-dashboard owner-dashboard--state">Loading owner dashboard…</div>;
  }

  if (error && !data) {
    return <div className="owner-dashboard owner-dashboard--state">{error}</div>;
  }

  if (!data) {
    return <div className="owner-dashboard owner-dashboard--state">No data available.</div>;
  }

  return (
    <div className="owner-dashboard">
      <header className="owner-dashboard__header">
        <div>
          <h1>Owner Financial Dashboard</h1>
          <p>Private owner view with transparent revenue and withdrawal tracking.</p>
        </div>
        <button type="button" className="owner-dashboard__logout" onClick={handleLogout}>Logout</button>
      </header>

      {error && <div className="owner-dashboard__error">{error}</div>}

      <section className="owner-dashboard__metrics">
        <article>
          <h2>Today</h2>
          <p>Entries: <strong>{data.todaysEntries}</strong></p>
          <p>Revenue: <strong>{formatMoney(data.todaysRevenue)}</strong></p>
          <p>Owner profit ({data.ownerProfitSharePercent}%): <strong>{formatMoney(data.todaysOwnerProfit)}</strong></p>
          <p>Ring-fenced prizes ({data.publicRingFencedPercent}%): <strong>{formatMoney(data.publicRingFencedToday)}</strong></p>
        </article>

        <article>
          <h2>Rolling Performance</h2>
          <p>7-day owner profit: <strong>{formatMoney(data.weeklyOwnerProfit)}</strong></p>
          <p>30-day owner profit: <strong>{formatMoney(data.monthlyOwnerProfit)}</strong></p>
          <p>12-month projection: <strong>{formatMoney(data.yearlyProjection)}</strong></p>
        </article>

        <article>
          <h2>Withdrawals</h2>
          <p>Available: <strong>{formatMoney(data.availableToWithdraw)}</strong></p>
          <p>Pending: <strong>{formatMoney(data.pendingWithdrawal)}</strong></p>
          <p>Total withdrawn: <strong>{formatMoney(data.totalWithdrawn)}</strong></p>
          <p>Auto-withdraw: <strong>{data.autoWithdrawal.enabled ? 'Enabled' : 'Disabled'}</strong></p>
          <p>Threshold: <strong>{formatMoney(data.autoWithdrawal.threshold)}</strong></p>
        </article>
      </section>

      <section className="owner-dashboard__withdraw">
        <h2>Initiate Withdrawal</h2>
        <div className="owner-dashboard__withdraw-row">
          <input
            type="number"
            min="0"
            step="0.01"
            value={withdrawAmount}
            onChange={(event) => setWithdrawAmount(event.target.value)}
            placeholder="Enter amount"
          />
          <button type="button" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? 'Processing…' : 'Withdraw'}
          </button>
        </div>
      </section>

      <section className="owner-dashboard__activity">
        <h2>Recent Admin Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p>No activity logged yet.</p>
        ) : (
          <ul>
            {data.recentActivity.map((entry, index) => (
              <li key={`${entry.timestamp}-${index}`}>
                <strong>{entry.action}</strong> — {entry.details} <em>({entry.ipAddress})</em> · {new Date(entry.timestamp).toLocaleString('en-GB')}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
