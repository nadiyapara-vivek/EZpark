import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../utils/auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;