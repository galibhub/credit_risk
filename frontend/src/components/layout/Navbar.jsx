
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Menu, X } from 'lucide-react';

import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Insights', href: '/#insights' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : '/app/dashboard';

  function closeMenu() {
    setOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
      closeMenu();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <nav
          className={`navbar-links ${open ? 'navbar-open' : ''}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}

          <div className="mobile-navbar-actions">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={handleLogout}
                >
                  Logout <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn btn-accent"
                  onClick={closeMenu}
                >
                  Sign up <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-outline">
                Dashboard
              </Link>

              <button
                type="button"
                className="btn btn-accent"
                onClick={handleLogout}
              >
                Logout <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>

              <Link to="/register" className="btn btn-accent">
                Sign up <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}