import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

function WorkspaceWelcome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="workspace-placeholder">
      <div className="workspace-box">
        <span className="auth-promo-footer">
          CREDLENS WORKSPACE
        </span>
        <h1>Welcome, {user?.name}</h1>
        <p>
          You are signed in as {user?.role}. Your dashboard
          is being built in the next step.
        </p>

        <div className="workspace-actions">
          <Link className="btn btn-outline" to="/">
            Homepage
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/app/dashboard" element={<WorkspaceWelcome />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<WorkspaceWelcome />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}