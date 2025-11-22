import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getCurrentUser());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cc_user' || e.key === 'cc_token') {
        setUser(authApi.getCurrentUser());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function login(credentials) {
    const u = await authApi.login(credentials);
    setUser(u);
    return u;
  }

  async function register(payload) {
    return authApi.register(payload);
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout, register, isAuthenticated: !!user }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
