import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ause_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ause_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token and refresh user profile on initial app load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        localStorage.setItem('ause_user', JSON.stringify(data));
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ause_token', data.token);
    localStorage.setItem('ause_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('ause_token', data.token);
    localStorage.setItem('ause_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const updateUserProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    localStorage.setItem('ause_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ause_token');
    localStorage.removeItem('ause_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer',
        login,
        register,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};