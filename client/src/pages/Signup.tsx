import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

const HERO_CAR_BACKGROUND_URL = '/white-lamborghini-bg.svg';

type SignupProps = {
  mode?: 'signup' | 'login';
};

function Signup({ mode = 'signup' }: SignupProps) {
  const isLoginMode = mode === 'login';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert(isLoginMode ? `Demo login complete for ${email}` : `Demo signup complete for ${fullName || email}`);
  };

  return (
    <div
      className="signup-page"
      style={{ backgroundImage: `url(${HERO_CAR_BACKGROUND_URL})` }}
    >
      <div className="signup-overlay" />
      <div className="signup-shell">
        <header className="signup-header">
          <Link to="/" className="signup-brand">UK Luxe Prize Draw</Link>
          <Link to="/" className="signup-back-link">← Back to draws</Link>
        </header>

        <main className="signup-card" role="main" aria-label={isLoginMode ? 'Log in' : 'Sign up'}>
          <p className="signup-kicker">{isLoginMode ? 'Welcome back' : 'Create your account'}</p>
          <h1>{isLoginMode ? 'Log in to your account' : 'Sign up to enter draws'}</h1>
          <p className="signup-subtext">
            {isLoginMode
              ? 'Log in to manage your entries and track draw results securely.'
              : 'Create your account to enter live draws, track tickets, and manage your entries securely.'}
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <label>
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Taylor"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder="Minimum 8 characters"
                required
              />
            </label>

            {!isLoginMode && (
              <label className="signup-terms">
                <input
                  type="checkbox"
                  required
                />
                <span>I confirm I am 18+ and accept the competition terms.</span>
              </label>
            )}

            <button type="submit" className="signup-submit">{isLoginMode ? 'Log in' : 'Create account'}</button>
          </form>

          <p className="signup-footer-note">
            {isLoginMode ? (
              <>Need an account? <Link to="/signup">Sign up</Link></>
            ) : (
              <>Already registered? <Link to="/login">Log in</Link></>
            )}
          </p>
        </main>
      </div>
    </div>
  );
}

export default Signup;
