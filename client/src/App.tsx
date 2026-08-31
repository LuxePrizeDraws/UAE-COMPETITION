import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">🏆 UAE Competition Platform</Link>
          <nav>
            <Link to="/" className={`nav-link${path === '/' ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${path === '/dashboard' ? ' nav-link--active' : ''}`}>📊 Dashboard</Link>
            <Link to="/gallery/supercars" className={`nav-link${path.startsWith('/gallery') ? ' nav-link--active' : ''}`}>🏎️ Gallery</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
