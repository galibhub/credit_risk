import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FilePlus2,
  Gauge,
  LogOut,
  X,
} from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  {
    label: 'Overview',
    to: '/app/dashboard',
    icon: Gauge,
    end: true,
  },
  {
    label: 'New Assessment',
    to: '/app/new-assessment',
    icon: FilePlus2,
  },
  {
    label: 'Assessment History',
    to: '/app/history',
    icon: ClipboardList,
  },
  {
    label: 'Model Insights',
    to: '/app/model-insights',
    icon: BarChart3,
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  function handleLogout() {
    logout();
    onClose();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
        aria-label="Close sidebar"
        tabIndex={open ? 0 : -1}
      />

      <aside className={`dashboard-sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand-row">
          <Logo light />
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation" aria-label="Workspace navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-help-card">
          <span className="sidebar-help-mark">C</span>
          <strong>CredLens</strong>
          <p>Explainable credit risk intelligence.</p>
        </div>

        <div className="sidebar-account">
          <span className="sidebar-avatar">{initials}</span>

          <span className="sidebar-account-details">
            <strong>{user?.name || 'User'}</strong>
            <small>{user?.email || ''}</small>
          </span>

          <button
            type="button"
            className="sidebar-logout"
            aria-label="Sign out"
            title="Sign out"
            onClick={handleLogout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}