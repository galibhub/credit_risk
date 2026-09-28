import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import getApiError from '../../utils/getApiError';


export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: email.trim().toLowerCase(),
        },
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
      eyebrow="CREATE YOUR ACCOUNT"
      title="Join CredLens"
      subtitle="Create an account to access your assessment workspace."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLink="/login"
    >
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Full name</span>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </label>

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
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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

        <label className="auth-field">
          <span>Confirm password</span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account...' : 'Create account'}
          {!submitting && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="auth-note">
        Public registration creates a standard user account.
      </p>
      <div className="auth-form-bottom">
        <Link to="/" className="auth-home-link">
          Return to homepage
        </Link>
      </div>
    </AuthLayout>
  );
}