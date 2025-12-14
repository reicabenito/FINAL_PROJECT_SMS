// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api'; // Import the new API service
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Login with backend data
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    // Optionally, store in localStorage to persist after refresh
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ptc_sms_user');
    localStorage.removeItem('ptc_sms_token');
  };

  // Load from localStorage if present (on page refresh)
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const isAuthenticated = user !== null;
  const isStudent = user && user.role === 'student';
  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, token, isAuthenticated, isStudent, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
