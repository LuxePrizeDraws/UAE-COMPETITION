import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isInvestorSummary = location.pathname === '/investor-summary';
  const isFeatureCentre = location.pathname === '/feature-centre';
  const isEntryOptions = location.pathname === '/entry-options';
  const isHome = location.pathname === '/';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className={`nav-link${isHome ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
            <Link to="/feature-centre" className={`nav-link${isFeatureCentre ? ' nav-link--highlight' : ''}`}>✨ Feature Centre</Link>
            <Link to="/entry-options" className={`nav-link${isEntryOptions ? ' nav-link--highlight' : ''}`}>🎟️ Entry Options</Link>
            <Link to="/investor-summary" className={`nav-link${isInvestorSummary ? ' nav-link--highlight' : ''}`}>💼 Investor Summary</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
