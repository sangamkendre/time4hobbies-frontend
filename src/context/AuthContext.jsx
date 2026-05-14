import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('user');
    
    if (token && cached) {
      setUser(JSON.parse(cached));
      // Verify token
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (username, email, password, otp) => {
    const res = await api.post('/auth/register', { username, email, password, otp });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const sendOTP = async (email) => {
    return api.post('/auth/send-otp', { email });
  };

  const requestPasswordReset = async (email) => {
    return api.post('/auth/password-reset/request', { email });
  };

  const resetPassword = async (email, otp, password) => {
    return api.post('/auth/password-reset/confirm', { email, otp, password });
  };

  const forgotUsername = async (email) => {
    return api.post('/auth/forgot-username', { email });
  };

  const requestAccountDelete = async () => {
    return api.post('/auth/account-delete/request');
  };

  const deleteMyAccount = async (otp) => {
    const res = await api.delete('/auth/account', { data: { otp } });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        sendOTP,
        requestPasswordReset,
        resetPassword,
        forgotUsername,
        requestAccountDelete,
        deleteMyAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
