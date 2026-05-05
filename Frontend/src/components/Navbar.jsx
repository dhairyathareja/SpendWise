import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CloudLightning, Gauge, LogOut } from 'lucide-react';
import { logoutUser } from '../store/authSlice';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <Link to="/" className="brand-lockup" aria-label="SpendWise home">
        <img src="/Logo.png" alt="SpendWise Logo" className="brand-logo" />
        <span>SpendWise</span>
      </Link>

      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <div className="user-chip">
              <Gauge size={16} />
              <span>{user?.name || 'User'}</span>
            </div>
            <button type="button" className="icon-button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary compact-button">Login</Link>
            <Link to="/signup" className="btn-primary compact-button">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
