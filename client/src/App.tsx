import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isLegendsLeague = location.pathname === '/legends-league';
  const isDreamApp = location.pathname.startsWith('/prize/dream-app');
  const isGallery = location.pathname === '/supercar-gallery';
  const isHome = !isDashboard && !isLegendsLeague && !isDreamApp && !isGallery;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className={`nav-link${isHome ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/supercar-gallery" className={`nav-link${isGallery ? ' nav-link--active' : ''}`}>🏎️ Supercars</Link>
            <Link to="/prize/dream-app" className={`nav-link${isDreamApp ? ' nav-link--active' : ''}`}>🚀 Dream App</Link>
            <Link to="/legends-league" className={`nav-link nav-link--legends${isLegendsLeague ? ' nav-link--legends-active' : ''}`}>👑 Legends League</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
