import './styles/globals.css';
import './styles/complete-ui.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ForgotUsername from './pages/ForgotUsername';
import Dashboard from './pages/Dashboard';
import Magazine from './pages/Magazine';
import Quiz from './pages/Quiz';
import Admin from './pages/Admin';
import TechTracks from './pages/TechTracks';
import WallOfFame from './pages/WallOfFame';
import Loader from './components/Loader';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="grid-bg" />
        <div id="notif-stack" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/magazine" element={<Magazine />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/wall-of-fame" element={<WallOfFame />} />
          <Route path="/tech-tracks" element={<PrivateRoute><TechTracks /></PrivateRoute>} />
          <Route path="/quiz/:category" element={<PrivateRoute><Quiz /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
