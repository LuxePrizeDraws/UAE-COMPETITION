import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './App.css';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';
const SHOW_MENTAL_HEALTH_SUPPORT = import.meta.env.VITE_ENABLE_MENTAL_HEALTH_SUPPORT !== 'false';
const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Competitions', to: '/competitions' },
  { label: 'Chess Tournament', to: '/chess-tournament' },
  { label: 'Connect 4 Tournament', to: '/connect4-tournament' },
  { label: 'Gallery', to: '/gallery' },
  ...(SHOW_MENTAL_HEALTH_SUPPORT ? [{ label: 'Mental Health Support', to: '/mental-health' }] : []),
  { label: 'Contact / Help', to: '/help' },
];

function NavigationLinks() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
      <NavLink
        to="/investor-summary"
        className={({ isActive }) => `nav-link nav-link--highlight${isActive ? ' nav-link--active' : ''}`}
      >
        Investor Summary
      </NavLink>
    </>
  );
}

function App() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((value) => !value)}
          >
            ☰
          </button>
          <nav className={`app-nav app-nav--mobile${mobileOpen ? ' app-nav--open' : ''}`}>
            <NavigationLinks />
          </nav>
          <nav className="app-nav app-nav--desktop-only">
            <NavigationLinks />
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
