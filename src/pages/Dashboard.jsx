import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { categoryMeta, fallbackLeaderboard, fallbackQuestions } from '../data/fallback';
import { notify } from '../utils/notify';

export default function Dashboard() {
  const { user, requestAccountDelete, deleteMyAccount } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [leaderboard, setLeaderboard] = useState(fallbackLeaderboard);
  const [deleteStep, setDeleteStep] = useState('idle');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let live = true;

    api.get('/questions')
      .then((res) => {
        if (live && Array.isArray(res.data.questions)) setQuestions(res.data.questions);
      })
      .catch(() => {});

    api.get('/users/leaderboard')
      .then((res) => {
        if (live && Array.isArray(res.data.leaderboard)) setLeaderboard(res.data.leaderboard);
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);

  const counts = useMemo(() => {
    return Object.keys(categoryMeta).reduce((acc, key) => {
      acc[key] = questions.filter((q) => q.category === key).length;
      return acc;
    }, {});
  }, [questions]);

  const rank = useMemo(() => {
    const idx = leaderboard.findIndex((entry) => entry.username === user?.username);
    return idx >= 0 ? idx + 1 : '-';
  }, [leaderboard, user]);

  const total = user?.score_total || 0;

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleDeleteOtpRequest = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await requestAccountDelete();
      setDeleteStep('otp');
      notify('Account delete OTP sent', 'ok');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send account delete OTP';
      setDeleteError(message);
      notify(message, 'err');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deleteOtp.trim()) {
      setDeleteError('Enter the OTP sent to your registered email');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteMyAccount(deleteOtp.trim());
      notify('Account deleted', 'ok');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error || 'Account deletion failed';
      setDeleteError(message);
      notify(message, 'err');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="screen active">
      <NavBar />
      <main className="page-body">
        <section className="dash-hero">
          <div className="dash-hero-left">
            <h1>
              Welcome, <span>{user?.username}</span>
            </h1>
            <p>Pick a category and climb the leaderboard.</p>
          </div>
          <div className="dash-hero-right">
            <div className="dash-stat">
              <span className="ds-num">{total}</span>
              <span className="ds-lbl">Total</span>
            </div>
            <div className="dash-stat">
              <span className="ds-num">{rank}</span>
              <span className="ds-lbl">Rank</span>
            </div>
          </div>
        </section>

        <section className="cat-grid">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button className={`cat-card cc-${meta.className}`} type="button" key={key} onClick={() => navigate(`/quiz/${key}`)}>
              <div className="cat-logo" style={{ background: meta.accent }} />
              <span className="cc-lbl">{meta.short}</span>
              <div className="cc-name">{meta.label}</div>
              <div className="cc-count">{counts[key] || 0} questions ready</div>
              <div className="cc-ghost">{meta.ghost}</div>
            </button>
          ))}
        </section>

        <section className="dash-bottom">
          <div className="panel">
            <div className="panel-title">Leaderboard</div>
            {leaderboard.slice(0, 6).map((entry, index) => (
              <div className="lb-row" key={entry.id || entry.username}>
                <span className={`rank-num ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                  {index + 1}
                </span>
                <span className="lb-name">{entry.username}</span>
                <div className="lb-score-wrap">
                  <span className="lb-score">{entry.score_total || 0} pts</span>
                  <span className="lb-sep">|</span>
                  <span className="lb-time">{formatTime(entry.time_total)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-title">My Stats</div>
            <div className="stat-row">
              <span className="stat-k">YouTube</span>
              <span className="stat-v">{user?.score_yt || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-k">Aquascaping</span>
              <span className="stat-v">{user?.score_aq || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-k">Tech / Python</span>
              <span className="stat-v">{user?.score_tech || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-k">Total Solved</span>
              <span className="stat-v">{total}</span>
            </div>
            <div className="stat-row">
              <span className="stat-k">Total Time Taken</span>
              <span className="stat-v">{formatTime(user?.time_total)}</span>
            </div>
          </div>
        </section>

        <section className="account-zone">
          <div className="panel account-panel">
            <div>
              <div className="panel-title">Account</div>
              <p className="account-email">{user?.email || 'Registered email unavailable'}</p>
            </div>

            {deleteStep === 'idle' ? (
              <button className="btn-act btn-red" type="button" onClick={handleDeleteOtpRequest} disabled={deleteLoading}>
                {deleteLoading ? 'Sending OTP...' : 'Delete My Account'}
              </button>
            ) : (
              <form className="delete-confirm" onSubmit={handleDeleteAccount}>
                <div className="auth-field delete-otp-field">
                  <label htmlFor="delete-otp">Delete Confirmation OTP</label>
                  <input
                    id="delete-otp"
                    type="text"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="delete-actions">
                  <button className="btn-act btn-red" type="submit" disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button className="btn-act" type="button" onClick={() => setDeleteStep('idle')} disabled={deleteLoading}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="account-error">{deleteError}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
