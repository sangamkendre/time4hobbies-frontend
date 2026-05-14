import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

export default function ForgotUsername() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotUsername } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Registered email is required');
      return;
    }

    setLoading(true);
    try {
      await forgotUsername(email.trim());
      notify('Username retrieval request sent', 'ok');
      setSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to request username';
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
          <h1 className="auth-title">Forgot Username</h1>
          
          {!submitted ? (
            <>
              <p className="auth-sub">Enter the email registered with your account to retrieve your username.</p>

              <div className="auth-field">
                <label htmlFor="forgot-email">Registered Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Send Username'}
              </button>
            </>
          ) : (
            <div className="auth-success-msg">
              <p className="auth-sub" style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                Request processed!
              </p>
              <p className="auth-sub">
                If an account is associated with <b>{email}</b>, we've sent the username to that inbox.
              </p>
              <button className="auth-btn" type="button" onClick={() => navigate('/login')}>
                Back to Sign In
              </button>
            </div>
          )}

          <div className="auth-err">{error}</div>
          
          {!submitted && (
            <p className="auth-switch">
              Remembered it? <button type="button" onClick={() => navigate('/login')}>Sign in</button>
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
