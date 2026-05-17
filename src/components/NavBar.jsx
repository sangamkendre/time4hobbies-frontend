import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

export default function NavBar({ compact = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goQuiz = () => {
    if (!user) {
      notify('Please sign in to start the quiz', 'info');
      navigate('/login');
      return;
    }
    navigate('/dashboard');
  };

  const signOut = () => {
    logout();
    notify('Signed out', 'ok');
    navigate('/');
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const startQuiz = () => {
    goQuiz();
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
  };

  return (
    <nav className={`t4h-nav ${menuOpen ? 'menu-open' : ''}`}>
      <button className="nav-logo" type="button" onClick={() => navTo('/')}>
        TIME<span>4</span>HOBBIES
      </button>

      <button className="nav-mobile-toggle" type="button" onClick={toggleMenu} aria-label="Toggle menu">
        <div className="hamburger">
          <span />
          <span />
          <span />
        </div>
      </button>

      <div className={`nav-menu-wrapper ${menuOpen ? 'open' : ''}`}>
        {!compact && (
          <div className="nav-center">
            <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} type="button" onClick={() => navTo('/')}>
              Home
            </button>
            <button
              className={`nav-link ${location.pathname.startsWith('/magazine') ? 'active' : ''}`}
              type="button"
              onClick={() => navTo('/magazine')}
            >
              Magazine
            </button>
            <button
              className={`nav-link ${location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/quiz') ? 'active' : ''}`}
              type="button"
              onClick={startQuiz}
            >
              Quiz
            </button>
            <button
              className={`nav-link ${location.pathname === '/videos' ? 'active' : ''}`}
              type="button"
              onClick={() => navTo('/videos')}
            >
              Videos
            </button>
            <button
              className={`nav-link ${location.pathname === '/wall-of-fame' ? 'active' : ''}`}
              type="button"
              onClick={() => navTo('/wall-of-fame')}
            >
              Wall of Fame
            </button>
            {user?.role === 'admin' && (
              <button className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`} type="button" onClick={() => navTo('/admin')}>
                Admin
              </button>
            )}
          </div>
        )}

        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-chip">
                Welcome <b>{user.username}</b>
              </span>
              <button className="nbtn danger" type="button" onClick={handleSignOut}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nbtn" type="button" onClick={() => navTo('/login')}>
                Login
              </button>
              <button className="nbtn primary" type="button" onClick={() => navTo('/register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
