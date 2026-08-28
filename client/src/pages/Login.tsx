import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@uaeluxury.ae');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = params.get('redirect') || '/dashboard';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-layout">
        <section className="auth-intro">
          <p className="section-eyebrow">Member sign in</p>
          <h1 className="section-heading">Access your luxury competition dashboard.</h1>
          <p className="section-copy">
            View active entries, checkout premium draws, and manage account activity with secure JWT-backed access.
          </p>
          <div className="notice">
            Demo admin login prefilled: <strong>admin@uaeluxury.ae</strong> / <strong>Admin123!</strong>
          </div>
        </section>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-grid">
            <label>
              <span>Email address</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Enter dashboard'}
            </button>
          </div>
          <p>
            New member?{' '}
            <Link className="btn-linkish" to="/signup">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
