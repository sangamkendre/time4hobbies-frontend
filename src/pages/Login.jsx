import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password required');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      notify('Login successful', 'ok');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      notify(message, 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <NavBar compact />
      <main className="auth-center">
        <div className="auth-glow" />
        <form className="auth-box" onSubmit={handleSubmit}>
          <div className="auth-logos">
            <div className="auth-logo" style={{ background: 'var(--red)' }} />
            <div className="auth-logo" style={{ background: 'var(--green)' }} />
            <div className="auth-logo" style={{ background: 'var(--blue)' }} />
          </div>
          <h1 className="auth-title">TIME4HOBBIES</h1>
          <p className="auth-sub">Sign in to compete and track your score</p>

          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="auth-err">{error}</div>
          <p className="auth-switch">
            <button type="button" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
          </p>
          <p className="auth-switch">
            No account? <button type="button" onClick={() => navigate('/register')}>Create one free</button>
          </p>
        </form>
      </main>
    </div>
  );
}
