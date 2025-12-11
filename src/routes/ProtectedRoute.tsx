import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, saves the current path for redirect after login */
  saveRedirect?: boolean;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication.
 * If user is not authenticated, redirects to appropriate login page.
 * - Dashboard/admin routes → Business portal login (/business?portal=true)
 * - Other routes → Regular login page (/login)
 * Optionally saves the current path for redirect after login.
 */
export const ProtectedRoute = ({ children, saveRedirect = false }: ProtectedRouteProps) => {
  const { currentUser, loading, setRedirectAfterLogin } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Save redirect path if needed (for checkout, order tracking, etc.)
    if (saveRedirect) {
      const fullPath = location.pathname + location.search;
      setRedirectAfterLogin(fullPath);
    }

    // Dashboard and admin routes should go to business portal login
    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin-login';

    if (isDashboardRoute || isAdminRoute) {
      return <Navigate to="/business?portal=true" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
