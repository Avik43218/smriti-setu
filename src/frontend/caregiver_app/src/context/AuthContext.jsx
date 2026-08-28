import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  verifyOtp as apiVerifyOtp,
  requestOtp as apiRequestOtp,
} from '../services/authService';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'caregiver_auth_token',
  USER: 'caregiver_user_data',
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
    } catch (err) {
      console.error('Failed to read auth token from storage:', err);
      return null;
    }
  });

  const [caregiver, setCaregiver] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error('Failed to read caregiver data from storage:', err);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    } catch (err) {
      console.error('Failed to persist auth token:', err);
    }
  }, [token]);

  useEffect(() => {
    try {
      if (caregiver) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(caregiver));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (err) {
      console.error('Failed to persist caregiver user:', err);
    }
  }, [caregiver]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestOtp = useCallback(async (email) => {
    return await apiRequestOtp(email);
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setLoading(true);
    try {
      const response = await apiVerifyOtp(email, otp);
      setToken(response.token);
      setCaregiver(response.caregiver);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setCaregiver(null);
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(token && caregiver);

  const value = {
    caregiver,
    token,
    login,
    requestOtp,
    verifyOtp,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
