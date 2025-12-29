import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  // Step 1: Login to get OTP
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      // Don't set token here, just return success
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      // Clean up any partial state if needed
      return { success: false, message };
    }
  };

  // Step 2: Verify OTP to get Token
  const verifyOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await authAPI.verifyOtp({ email, otp });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Admin only: Create User
  const createUser = async (userData) => {
    try {
      setError(null);
      await authAPI.createUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'User creation failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    verifyOtp,
    createUser,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
