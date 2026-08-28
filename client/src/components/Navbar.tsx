import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand-mark">
          <span className="brand-icon">◆</span>
          <div>
            <strong>UAE Luxury Competitions</strong>
            <small>Elite experiences. Transparent draws.</small>
          </div>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <a href="/#competitions">Competitions</a>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="badge-pill">{user.name.split(' ')[0]} · {user.role}</span>
              <button type="button" className="btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-outline">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn">
                Join Now
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
