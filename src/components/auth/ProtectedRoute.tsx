import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-genesis-soft flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-genesis-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <p className="text-genesis-medium font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
