import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+971',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-layout">
        <section className="auth-intro">
          <p className="section-eyebrow">Create membership</p>
          <h1 className="section-heading">Join the UAE’s premium draw platform.</h1>
          <p className="section-copy">
            Open your account to enter luxury competitions, track orders, and receive draw confirmations in one place.
          </p>
        </section>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Start your account</h2>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-grid">
            <label>
              <span>Full name</span>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label>
              <span>Email address</span>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label>
              <span>Phone number</span>
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
            </label>
            <label>
              <span>Confirm password</span>
              <input type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required />
            </label>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create premium account'}
            </button>
          </div>
          <p>
            Already a member?{' '}
            <Link className="btn-linkish" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
