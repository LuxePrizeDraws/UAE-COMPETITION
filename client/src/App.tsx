import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';

function App() {
  const location = useLocation();
  const path = location.pathname;
  const [gamesOpen, setGamesOpen] = useState(false);

  const isTournaments = path.startsWith('/tournaments');

  useEffect(() => {
    if (!AD_CLIENT) return;
    if (document.querySelector('script[data-adsense]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    s.setAttribute('data-adsense', 'true');
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    setGamesOpen(false);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">🏆 UAE Competition Platform</Link>
          <nav>
            <Link to="/" className={`nav-link${path === '/' ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${path === '/dashboard' ? ' nav-link--active' : ''}`}>📊 Dashboard</Link>
            <Link to="/gallery/supercars" className={`nav-link${path.startsWith('/gallery') ? ' nav-link--active' : ''}`}>🏎️ Gallery</Link>

            {/* Games dropdown */}
            <div
              className={`nav-dropdown ${gamesOpen ? 'nav-dropdown--open' : ''}`}
              onMouseEnter={() => setGamesOpen(true)}
              onMouseLeave={() => setGamesOpen(false)}
            >
              <button className={`nav-link nav-dropdown__trigger ${isTournaments ? 'nav-link--active' : ''}`}>
                🎮 Games ▾
              </button>
              {gamesOpen && (
                <div className="nav-dropdown__menu">
                  <Link to="/tournaments" className="nav-dropdown__item" onClick={() => setGamesOpen(false)}>
                    🎮 All Tournaments
                  </Link>
                  <Link to="/tournaments/chess" className="nav-dropdown__item" onClick={() => setGamesOpen(false)}>
                    <span className="nav-game-badge nav-game-badge--chess">♟️ Chess</span>
                    <span className="nav-game-badge-sub">Blitz &amp; Classical</span>
                  </Link>
                  <Link to="/tournaments/connect4" className="nav-dropdown__item" onClick={() => setGamesOpen(false)}>
                    <span className="nav-game-badge nav-game-badge--connect4">🔴 Connect 4</span>
                    <span className="nav-game-badge-sub">Weekly &amp; Masters</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
