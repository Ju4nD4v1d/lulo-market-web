import { useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { queryClient } from './services/queryClient';
import { CookieConsent } from './components/CookieConsent';
import { HashRedirect } from './components/HashRedirect';
import { AppRoutes } from './routes';

/**
 * AuthRedirectHandler
 *
 * Handles redirect after successful login.
 * Listens for auth state changes and redirects to saved path.
 */
const AuthRedirectHandler = () => {
  const { currentUser, loading, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect after successful login
  useEffect(() => {
    if (loading) return;

    if (currentUser && redirectAfterLogin) {
      const redirectPath = redirectAfterLogin;
      setRedirectAfterLogin(null);

      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        navigate(redirectPath, { replace: true });

        // If redirecting to checkout, trigger checkout view
        if (redirectPath.includes('checkout')) {
          window.dispatchEvent(new CustomEvent('openCheckout'));
        }
      }, 100);
    } else if (currentUser && !redirectAfterLogin && location.pathname === '/login') {
      // User just logged in from login page with no pending redirect
      // Redirect to home page
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [currentUser, loading, redirectAfterLogin, setRedirectAfterLogin, navigate, location.pathname]);

  return null;
};

/**
 * AppContent
 *
 * Main application content wrapped with routing context.
 * Includes HashRedirect for backward compatibility with old URLs.
 */
const AppContent = () => {
  return (
    <>
      {/* Handle legacy hash URLs - redirects /#/path to /path */}
      <HashRedirect />

      {/* Handle auth redirects after login */}
      <AuthRedirectHandler />

      {/* Main application routes */}
      <AppRoutes />

      {/* Cookie consent banner */}
      <CookieConsent />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
