import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component guards routes requiring caregiver authentication.
 * 
 * - Shows a themed loading indicator while auth status is being evaluated.
 * - Redirects unauthenticated users to /login while capturing their attempted route.
 * - Supports both nested Route definitions (via Outlet) and wrapped children.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-border border-t-terracotta rounded-full animate-spin" />
        <p className="text-sm font-medium text-ink-soft">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
