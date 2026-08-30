import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

const LAMBORGHINI_BACKGROUND_URL = 'https://github.com/user-attachments/assets/63e54c11-99db-45fd-bef3-c909ab378ccc';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert(`Demo signup complete for ${fullName || email}`);
  };

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${LAMBORGHINI_BACKGROUND_URL})` }}>
      <div className="signup-overlay" />
      <div className="signup-shell">
        <header className="signup-header">
          <Link to="/" className="signup-brand">UK Luxe Prize Draw</Link>
          <Link to="/" className="signup-back-link">← Back to draws</Link>
        </header>

        <main className="signup-card" role="main" aria-label="Sign up">
          <p className="signup-kicker">Create your account</p>
          <h1>Sign up to enter draws</h1>
          <p className="signup-subtext">Booking-style quick signup demo with luxury background preview.</p>

          <form className="signup-form" onSubmit={handleSubmit}>
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

            <label className="signup-terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <span>I confirm I am 18+ and accept the competition terms.</span>
            </label>

            <button type="submit" className="signup-submit">Create account</button>
          </form>

          <p className="signup-footer-note">
            Already registered? <a href="#">Log in</a>
          </p>
        </main>
      </div>
    </div>
  );
}

export default Signup;
