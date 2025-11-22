import { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { queryClient } from './services/queryClient';
import { checkDeviceInvitation } from './services/invitationService';

// Lazy load route components for code splitting
const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const StoreMenu = lazy(() => import('./pages/store-menu'));
const Business = lazy(() => import('./pages/business'));
const OrderHistory = lazy(() => import('./pages/order-history'));
const OrderTracking = lazy(() => import('./pages/order-tracking'));
const InvitationGate = lazy(() => import('./pages/invitation-gate'));
const ProductList = lazy(() => import('./components/ProductList'));

// Lazy load static landing page components (rarely used)
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const SocialProof = lazy(() => import('./components/SocialProof'));
const ConversionPricing = lazy(() => import('./components/ConversionPricing'));
const Footer = lazy(() => import('./components/Footer'));

// Import test utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/testInvitation');
}

// Helper function to update document title
const updateTitle = (title: string) => {
  document.title = title;
};

/**
 * Loading fallback component for lazy-loaded routes
 * Displays a centered spinner while components are loading
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#');
  const [hasValidInvitation, setHasValidInvitation] = useState(false);
  const [invitationChecked, setInvitationChecked] = useState(false);
  const { currentUser, loading, redirectAfterLogin, setRedirectAfterLogin } = useAuth();

  // Check invitation status on mount
  useEffect(() => {
    if (!loading) {
      // Check device-based invitation only
      const hasDeviceInvitation = checkDeviceInvitation();
      setHasValidInvitation(hasDeviceInvitation);
      setInvitationChecked(true);
    }
  }, [loading]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    if (currentUser && redirectAfterLogin) {
      const redirectPath = redirectAfterLogin;
      setRedirectAfterLogin(null);
      
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        window.location.hash = redirectPath;
        
        // If redirecting with checkout parameter, trigger checkout view
        if (redirectPath.includes('checkout=true')) {
          // This will be handled by the cart context or component
          window.dispatchEvent(new CustomEvent('openCheckout'));
        }
      }, 100);
    }
  }, [currentUser, redirectAfterLogin, setRedirectAfterLogin]);

  // Show loading state while auth or invitation is being determined
  if (loading || !invitationChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderRoute = () => {
    // Check invitation gate first - if user doesn't have valid invitation, show gate
    if (!hasValidInvitation) {
      return (
        <InvitationGate 
          onValidCode={() => setHasValidInvitation(true)} 
        />
      );
    }

    // Check for dashboard routes first
    if (currentRoute.startsWith('#dashboard')) {
      if (!currentUser) {
        window.location.hash = '#login';
        return <Login />;
      }

      // Allow any authenticated user to access dashboard
      // The Dashboard component will handle permissions internally
      return <Dashboard />;
    }

    // Check for shopper dashboard routes - redirect to unified home experience
    if (currentRoute.startsWith('#shopper-dashboard/')) {
      return <StoreMenu />;
    }

    if (currentRoute.startsWith('#shopper-dashboard')) {
      // Redirect to unified home experience
      window.location.hash = '#';
      return <Home />;
    }

    // Order tracking route (requires authentication)
    if (currentRoute.startsWith('#order/')) {
      if (!currentUser) {
        // Store the intended destination and redirect to login
        setRedirectAfterLogin(currentRoute);
        return <Login />;
      }
      
      const orderId = currentRoute.replace('#order/', '');
      if (orderId) {
        return (
          <OrderTracking 
            orderId={orderId} 
            onBack={() => window.location.hash = '#'} 
          />
        );
      }
    }

    // Then check other routes
    if (currentRoute.startsWith('#login')) {
      return <Login />;
    }

    if (currentRoute.startsWith('#forgot-password')) {
      return <ForgotPassword />;
    }

    if (currentRoute.startsWith('#terms')) {
      return <TermsOfService />;
    }

    if (currentRoute.startsWith('#privacy')) {
      return <PrivacyPolicy />;
    }

    if (currentRoute.startsWith('#profile/edit')) {
      if (!currentUser) {
        window.location.hash = '#login';
        return <Login />;
      }
      return <EditProfile />;
    }

    if (currentRoute.startsWith('#business')) {
      updateTitle('Lulo Market for Merchants – Partner Program & Pricing');
      return <Business />;
    }

    if (currentRoute.startsWith('#order-history')) {
      if (!currentUser) {
        window.location.hash = '#login';
        return <Login />;
      }
      updateTitle('Lulo Market - Order History');
      return <OrderHistory onBack={() => window.location.hash = '#'} />;
    }

    if (currentRoute.startsWith('#products')) {
      updateTitle('Lulo Market - All Products');
      return <ProductList onBack={() => window.location.hash = '#'} />;
    }

    if (currentRoute.startsWith('#landing')) {
      // Old static landing page, now archived
      return (
        <>
          <Header />
          <main>
            <Hero />
            <SocialProof />
            <ConversionPricing />
          </main>
          <Footer />
        </>
      );
    }

    // Default route now goes to Home (marketplace with hero)
    updateTitle('Lulo Market - Browse Local Latino Stores & Products');
    return <Home />;
  };

  return (
    <div className="font-sans">
      <Suspense fallback={<LoadingFallback />}>
        {renderRoute()}
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;