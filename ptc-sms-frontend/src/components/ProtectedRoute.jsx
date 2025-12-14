// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component protects routes that only students should access.
const ProtectedRoute = ({ allowedRole = 'student' }) => {
  const { isAuthenticated, user } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role doesn't match, redirect to a safe page (e.g., dashboard or home)
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  // If authenticated and role matches, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;