import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className={`nav-link${path === '/' ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${path === '/dashboard' ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
            <Link to="/mission" className={`nav-link${path === '/mission' ? ' nav-link--active' : ''}`}>🧠 Mission</Link>
            <Link to="/terms" className={`nav-link${path === '/terms' ? ' nav-link--active' : ''}`}>Terms</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
