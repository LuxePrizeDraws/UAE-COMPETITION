import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import MentalHealthModal from './components/MentalHealthModal';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>

          <nav className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'}>
            <Link
              to="/"
              className={`nav-link${!isDashboard ? ' nav-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              📊 Live Dashboard
            </Link>
          </nav>

          <div className="header-actions">
            <button
              className="get-help-button"
              onClick={() => setHelpOpen(true)}
              type="button"
            >
              💚 Get Help
            </button>

            <button
              className="nav-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <Outlet />
      {helpOpen && <MentalHealthModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

export default App;
