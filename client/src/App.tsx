import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav className="app-nav">
            <Link to="/" className={`nav-link${!isDashboard ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight nav-link--active' : ''}`}>📊 Live Dashboard</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
