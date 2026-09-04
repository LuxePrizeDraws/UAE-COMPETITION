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
  { label: '🧠 Mission', to: '/mission' },
  { label: 'Terms', to: '/terms' },
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
    </>
  );
}

function App() {
  const location = useLocation();
<<<<<<< HEAD
  const isDashboard = location.pathname === '/dashboard';
  const isInvestorSummary = location.pathname === '/investor-summary';
  const isFeatureCentre = location.pathname === '/feature-centre';
  const isEntryOptions = location.pathname === '/entry-options';
  const isGameChallenges = location.pathname === '/game-challenges';
  const isWellbeingSupport = location.pathname === '/wellbeing-support';
  const isHome = location.pathname === '/';
=======
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
>>>>>>> origin/main

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
<<<<<<< HEAD
          <nav>
            <Link to="/" className={`nav-link${isHome ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>📊 Live Dashboard</Link>
            <Link to="/feature-centre" className={`nav-link${isFeatureCentre ? ' nav-link--highlight' : ''}`}>✨ Feature Centre</Link>
            <Link to="/game-challenges" className={`nav-link${isGameChallenges ? ' nav-link--highlight' : ''}`}>🎮 Game Challenges</Link>
            <Link to="/entry-options" className={`nav-link${isEntryOptions ? ' nav-link--highlight' : ''}`}>🎟️ Entry Options</Link>
            <Link to="/wellbeing-support" className={`nav-link${isWellbeingSupport ? ' nav-link--highlight' : ''}`}>🧠 Support</Link>
            <Link to="/investor-summary" className={`nav-link${isInvestorSummary ? ' nav-link--highlight' : ''}`}>💼 Investor Summary</Link>
=======
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
>>>>>>> origin/main
          </nav>
        </div>
      </header>
      <Outlet />
      <Link to="/wellbeing-support" className="help-badge">🧠 Help &amp; Awareness</Link>
    </div>
  );
}

export default App;