import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  // Lazy-load AdSense script only when client ID is configured
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className={`nav-link${!isDashboard ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
