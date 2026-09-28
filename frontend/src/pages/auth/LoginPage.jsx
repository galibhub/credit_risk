import { useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import getApiError from '../../utils/getApiError';


export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const registered = location.state?.registered === true;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      const destination =
        loggedInUser.role === 'admin'
          ? '/admin/dashboard'
          : '/app/dashboard';

      const requestedPath = location.state?.from?.pathname;
      const allowedPath =
        loggedInUser.role === 'admin'
          ? requestedPath?.startsWith('/admin')
          : requestedPath?.startsWith('/app');

      navigate(allowedPath ? requestedPath : destination, {
        replace: true,
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

 if (user) {
  return (
    <Navigate
      to={user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard'}
      replace
    />
  );
}

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to CredLens"
      subtitle="Access your credit risk assessment workspace."
      footerText="Don't have an account?"
      footerLinkText="Create account"
      footerLink="/register"
    >
      {registered && (
        <div className="auth-success" role="status">
          Registration successful. You can now sign in.
        </div>
      )}

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
          {!submitting && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="auth-note">
        Your account access is determined by your assigned role.
      </p>
      <div className="auth-form-bottom">
        <Link to="/" className="auth-home-link">
          Return to homepage
        </Link>
      </div>
    </AuthLayout>
  );
}