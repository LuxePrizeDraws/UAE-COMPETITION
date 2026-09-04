import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'ownerAdminToken';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Login failed');
      }

      setChallengeId(payload.challengeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFA = async (e: FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, twoFACode }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '2FA verification failed');
      }

      localStorage.setItem(TOKEN_KEY, payload.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-login">
      <div className="owner-login__card">
        <h1>Owner Portal</h1>
        <p>Secure owner-only financial dashboard access.</p>

        {!challengeId ? (
          <form onSubmit={handleLogin} className="owner-login__form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyTwoFA} className="owner-login__form">
            <label>
              2FA Code
              <input
                type="text"
                value={twoFACode}
                onChange={(event) => setTwoFACode(event.target.value.trim())}
                required
                maxLength={6}
                inputMode="numeric"
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Enter'}
            </button>
          </form>
        )}

        {error && <div className="owner-login__error">{error}</div>}
      </div>
    </div>
  );
}
