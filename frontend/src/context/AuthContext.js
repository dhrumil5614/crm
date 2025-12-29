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

  // Login (role-based: admin needs OTP, user logs in directly)
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });

      // If user (direct login), token is returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return {
          success: true,
          requiresOtp: false,
          mustChangePassword: response.data.user.mustChangePassword
        };
      }

      // If admin, OTP is required
      return {
        success: true,
        message: response.data.message,
        requiresOtp: true,
        email: response.data.email
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Verify OTP (admin only)
  const verifyOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await authAPI.verifyOtp({ email, otp });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return {
        success: true,
        mustChangePassword: response.data.user.mustChangePassword
      };
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await authAPI.forgotPassword({ email });
      return {
        success: true,
        message: response.data.message,
        isAdmin: response.data.isAdmin
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Request failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Verify Reset OTP (admin only)
  const verifyResetOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await authAPI.verifyResetOtp({ email, otp });
      return {
        success: true,
        resetToken: response.data.resetToken,
        message: response.data.message
      };
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Reset Password (admin only, after OTP)
  const resetPassword = async (newPassword) => {
    try {
      setError(null);
      await authAPI.resetPassword({ newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Change Password (forced or voluntary)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await authAPI.changePassword({ currentPassword, newPassword });

      // Update user state
      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Create User (admin only)
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
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    changePassword,
    createUser,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
