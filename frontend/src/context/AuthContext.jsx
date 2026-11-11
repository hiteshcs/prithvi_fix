import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  CUSTOMER: { email: 'customer@demo.local', password: 'demo123', label: 'Customer (Ananya Patel)' },
  WORKER: { email: 'ramesh.w@demo.local', password: 'demo123', label: 'Worker (Ramesh Kumar - Electrician)' },
  ADMIN: { email: 'fedhead@demo.local', password: 'demo123', label: 'Apex Federation Head (Arun Pattnaik)' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((data) => {
        setUser(data.user);
        setWorkerProfile(data.workerProfile || null);
      })
      .catch((err) => {
        console.warn('Session check failed:', err.message);
        localStorage.removeItem('token');
        setUser(null);
        setWorkerProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, portalRole = null) => {
    setError(null);
    try {
      const data = await api.login({ email, password, portalRole });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      // Fetch profile if worker
      if (data.user.role === 'WORKER') {
        const meData = await api.getMe();
        setWorkerProfile(meData.workerProfile || null);
      } else {
        setWorkerProfile(null);
      }
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const demoLogin = async (roleType) => {
    const account = DEMO_ACCOUNTS[roleType];
    if (!account) throw new Error('Invalid demo role');
    return login(account.email, account.password);
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await api.register(userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      if (data.user.role === 'WORKER') {
        const meData = await api.getMe();
        setWorkerProfile(meData.workerProfile || null);
      }
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        setWorkerProfile(data.workerProfile || null);
      }
      return data;
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    localStorage.removeItem('token');
    setUser(null);
    setWorkerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        loading,
        error,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'CUSTOMER',
        isWorker: user?.role === 'WORKER',
        isAdmin: user?.role === 'COOPERATIVE_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
