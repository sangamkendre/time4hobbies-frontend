import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      setError('Registered email is required');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(form.email.trim());
      notify('Password reset OTP sent', 'ok');
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send password reset OTP';
      setError(message);
      notify(message, 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.otp.trim() || !form.password || !form.confirm) {
      setError('OTP and new password are required');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(form.email.trim(), form.otp.trim(), form.password);
      notify('Password reset successful', 'ok');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.error || 'Password reset failed';
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

        {step === 1 ? (
          <form className="auth-box" onSubmit={handleRequestOTP}>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-sub">Use the email registered with your account</p>

            <div className="auth-field">
              <label htmlFor="reset-email">Registered Email</label>
              <input
                id="reset-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>

            <div className="auth-err">{error}</div>
            <p className="auth-switch">
              Remembered it? <button type="button" onClick={() => navigate('/login')}>Sign in</button>
            </p>
          </form>
        ) : (
          <form className="auth-box" onSubmit={handleReset}>
            <h1 className="auth-title">Enter OTP</h1>
            <p className="auth-sub">Set a new password for <b>{form.email}</b></p>

            <div className="auth-field">
              <label htmlFor="reset-otp">One-Time Password (OTP)</label>
              <input
                id="reset-otp"
                type="text"
                value={form.otp}
                onChange={(e) => update('otp', e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reset-password">New Password</label>
              <input
                id="reset-password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="min 4 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reset-confirm">Confirm Password</label>
              <input
                id="reset-confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                placeholder="repeat password"
                autoComplete="new-password"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button className="auth-btn-alt" type="button" onClick={() => setStep(1)}>
              Back to Email
            </button>

            <div className="auth-err">{error}</div>
          </form>
        )}
      </main>
    </div>
  );
}
