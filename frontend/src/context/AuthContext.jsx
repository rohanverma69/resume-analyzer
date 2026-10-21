import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
        setTokenState(null);
      }
    } catch (err) {
      // Token invalid or network error
      setUser(null);
      setToken(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener('careerai_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('careerai_auth_expired', handleAuthExpired);
  }, []);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    if (data.token) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (payload) => {
    const data = await api.auth.register(payload);
    if (data.token) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue cleanup regardless
    } finally {
      setToken(null);
      setTokenState(null);
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    await api.auth.deleteAccount();
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        deleteAccount,
        refreshUser: fetchCurrentUser,
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
