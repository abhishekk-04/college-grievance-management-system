import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on load
  useEffect(() => {
    const restoreSession = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

    const login = async (email, password, portalTab) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data;
      
      // Enforce portal boundaries based on current portal tab
      if (portalTab === 'Student' && userData.role !== 'Student') {
        throw new Error('Access denied. Please use the Faculty / Admin login portal.');
      }
      
      if (portalTab === 'Staff' && userData.role === 'Student') {
        throw new Error('Access denied. Please use the Student login portal.');
      }
      
      localStorage.setItem('accessToken', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      
      const cleanUser = { ...userData };
      delete cleanUser.accessToken;
      delete cleanUser.refreshToken;
      
      localStorage.setItem('user', JSON.stringify(cleanUser));
      setUser(cleanUser);
      return cleanUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (studentData) => {
    try {
      const res = await api.post('/auth/register', studentData);
      const userData = res.data;

      localStorage.setItem('accessToken', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);

      const cleanUser = { ...userData };
      delete cleanUser.accessToken;
      delete cleanUser.refreshToken;

      localStorage.setItem('user', JSON.stringify(cleanUser));
      setUser(cleanUser);
      return cleanUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
