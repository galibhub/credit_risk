import { Link } from 'react-router-dom';
import { FilePlus2, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick, title, subtitle }) {
  const { user } = useAuth();

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'User';

  return (
    <header className="dashboard-topbar">
      <div className="topbar-heading">
        <button
          type="button"
          className="topbar-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div>
          <span className="topbar-eyebrow">CREDLENS WORKSPACE</span>
          <h1>{title}</h1>
          <p>{subtitle || `Welcome back, ${firstName}`}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <Link to="/app/new-assessment" className="topbar-create-button">
          <FilePlus2 size={17} />
          <span>New assessment</span>
        </Link>

        <span className="topbar-user-avatar" title={user?.name || 'User'}>
          {firstName[0].toUpperCase()}
        </span>
      </div>
    </header>
  );
}