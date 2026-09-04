import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './App.css';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';
const SHOW_MENTAL_HEALTH_SUPPORT = import.meta.env.VITE_ENABLE_MENTAL_HEALTH_SUPPORT !== 'false';
const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Competitions', to: '/competitions' },
  { label: 'Feature Centre', to: '/feature-centre' },
  { label: 'Game Challenges', to: '/game-challenges' },
  { label: 'Entry Options', to: '/entry-options' },
  { label: 'Investor Summary', to: '/investor-summary' },
  { label: 'Chess Tournament', to: '/chess-tournament' },
  { label: 'Connect 4 Tournament', to: '/connect4-tournament' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Wellbeing Support', to: '/wellbeing-support' },
  ...(SHOW_MENTAL_HEALTH_SUPPORT ? [{ label: 'Mental Health Support', to: '/mental-health' }] : []),
  { label: 'Contact / Help', to: '/help' },
  { label: 'Mission', to: '/mission' },
  { label: 'Terms', to: '/terms' },
] as const;

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
    </>
  );
}

function App() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!AD_CLIENT) return;
    if (document.querySelector('script[data-adsense]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    script.setAttribute('data-adsense', 'true');
    document.head.appendChild(script);
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
      <NavLink to="/wellbeing-support" className="help-badge">🧠 Help &amp; Awareness</NavLink>
    </div>
  );
}

export default App;
