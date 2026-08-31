import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isGallery = location.pathname === '/gallery/supercars';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className={`nav-link${!isDashboard && !isGallery ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/gallery/supercars" className={`nav-link${isGallery ? ' nav-link--highlight' : ''}`}>🏎️ Supercar Gallery</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
