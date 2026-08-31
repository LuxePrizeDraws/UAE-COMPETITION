import { Link, Outlet, useLocation } from 'react-router-dom';
import ToastNotifications from './components/ToastNotifications';
import { luxuryAnimations, palette } from './lib/luxury';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/play', label: 'Play 🎮' },
  { to: '/pay', label: 'Pay £5' },
  { to: '/draws', label: 'Draws' },
  { to: '/winners', label: 'Winners' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', background: palette.nearBlack, color: palette.text, display: 'flex', flexDirection: 'column' }}>
      <style>{luxuryAnimations}</style>
      <header
        style={{
          position: 'sticky',
          top: isHome ? 42 : 0,
          marginTop: isHome ? 42 : 0,
          zIndex: 20,
          background: 'linear-gradient(135deg, rgba(26,26,26,0.96) 0%, rgba(10,10,10,0.96) 100%)',
          borderBottom: `1px solid ${palette.gold}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ fontSize: '1.35rem', fontWeight: 900, color: palette.gold }}>
            🏆 UAE Competition Platform
          </Link>
          <nav style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {navItems.map((item) => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    padding: '0.6rem 0.95rem',
                    borderRadius: 999,
                    border: `1px solid ${isActive ? palette.gold : 'rgba(212,175,55,0.18)'}`,
                    background: isActive ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? palette.goldBright : palette.textSoft,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <ToastNotifications />
    </div>
  );
}
