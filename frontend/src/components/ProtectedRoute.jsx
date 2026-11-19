import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect authenticated users to their own role dashboard if unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;