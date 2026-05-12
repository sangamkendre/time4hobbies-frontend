import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: info, 2: otp
  const { register, sendOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('All fields required');
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
      await sendOTP(form.email.trim());
      notify('OTP sent to your email', 'ok');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
      notify(err.response?.data?.error || 'Failed to send OTP', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password, form.otp.trim());
      notify('Account created successfully', 'ok');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      notify(err.response?.data?.error || 'Registration failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="screen active">
      <NavBar compact />
      <main className="auth-center">
        <div className="auth-glow" />
        
        {step === 1 ? (
          <form className="auth-box" onSubmit={handleSendOTP}>
            <h1 className="auth-title">Join the Quiz</h1>
            <p className="auth-sub">Create your free TIME4HOBBIES account</p>

            <div className="auth-field">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="choose_a_username"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="min 4 characters"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                placeholder="repeat password"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
            
            <div className="auth-err">{error}</div>
            <p className="auth-switch">
              Already have one? <button type="button" onClick={() => navigate('/login')}>Sign in</button>
            </p>
          </form>
        ) : (
          <form className="auth-box" onSubmit={handleRegister}>
            <h1 className="auth-title">Verify Email</h1>
            <p className="auth-sub">Enter the 6-digit code sent to <b>{form.email}</b></p>

            <div className="auth-field">
              <label htmlFor="reg-otp">One-Time Password (OTP)</label>
              <input
                id="reg-otp"
                type="text"
                value={form.otp}
                onChange={(e) => update('otp', e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="otp-input-field"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            
            <button 
              type="button" 
              className="auth-btn-alt" 
              onClick={() => setStep(1)} 
              style={{ marginTop: '10px', background: 'transparent', border: '1px solid #444', color: '#ccc' }}
            >
              Back to Edit Info
            </button>

            <div className="auth-err">{error}</div>
          </form>
        )}
      </main>
    </div>
  );
}

