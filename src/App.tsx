import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { queryClient } from './services/queryClient';
import { CookieConsent } from './components/CookieConsent';

// Lazy load route components for code splitting
const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const PayoutPolicy = lazy(() => import('./pages/PayoutPolicy'));
const SellerAgreement = lazy(() => import('./pages/seller-agreement'));
const RefundPolicy = lazy(() => import('./pages/refund-policy'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const StoreMenu = lazy(() => import('./pages/store-menu'));
const Business = lazy(() => import('./pages/business'));
const OrderHistory = lazy(() => import('./pages/order-history'));
const OrderTracking = lazy(() => import('./pages/order-tracking'));
const ProductList = lazy(() => import('./components/ProductList'));
const HelpPage = lazy(() => import('./pages/help'));
const ProductDetails = lazy(() => import('./pages/product-details'));
const CartPage = lazy(() => import('./pages/cart'));
const CheckoutPage = lazy(() => import('./pages/checkout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DispatcherPage = lazy(() => import('./pages/admin/DispatcherPage'));

// Lazy load static landing page components (rarely used)
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const SocialProof = lazy(() => import('./components/SocialProof'));
const ConversionPricing = lazy(() => import('./components/ConversionPricing'));
const Footer = lazy(() => import('./components/Footer'));

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
  const { currentUser, loading, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#');
      // Reset redirect flag when hash changes
      isRedirectingRef.current = false;
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle storing redirect path when accessing protected routes without auth
  useEffect(() => {
    if (!currentUser && !loading) {
      const protectedRoutesWithRedirect = ['#order/', '#checkout'];
      const needsRedirect = protectedRoutesWithRedirect.some(route => currentRoute.startsWith(route));

      if (needsRedirect && !redirectAfterLogin) {
        setRedirectAfterLogin(currentRoute);
      }
    }
  }, [currentRoute, currentUser, loading, redirectAfterLogin, setRedirectAfterLogin]);

  // Handle redirect after successful login
  useEffect(() => {
    // Prevent multiple redirects from racing
    if (isRedirectingRef.current) {
      return;
    }

    if (currentUser && redirectAfterLogin) {
      isRedirectingRef.current = true;
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
    } else if (currentUser && !redirectAfterLogin && currentRoute.startsWith('#login')) {
      // User just logged in from login page with no pending redirect
      // Redirect to home page
      isRedirectingRef.current = true;
      setTimeout(() => {
        window.location.hash = '#';
      }, 100);
    }
  }, [currentUser, redirectAfterLogin, setRedirectAfterLogin, currentRoute]);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderRoute = () => {
    // Admin routes
    if (currentRoute.startsWith('#admin-login')) {
      updateTitle('Lulo Market - Admin Login');
      return <AdminLoginPage />;
    }

    if (currentRoute.startsWith('#admin/dispatcher')) {
      if (!currentUser) {
        window.location.hash = '#admin-login';
        return <AdminLoginPage />;
      }
      updateTitle('Lulo Market - Dispatcher');
      return <DispatcherPage />;
    }

    if (currentRoute.startsWith('#admin')) {
      if (!currentUser) {
        window.location.hash = '#admin-login';
        return <AdminLoginPage />;
      }
      updateTitle('Lulo Market - Admin Dashboard');
      return <AdminDashboard />;
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

    // Store detail route (cleaner URL alias for #shopper-dashboard/)
    if (currentRoute.startsWith('#store/')) {
      return <StoreMenu />;
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
        // Redirect is handled by useEffect
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

    // Product details route
    if (currentRoute.startsWith('#product/')) {
      const parts = currentRoute.replace('#product/', '').split('/');
      const productId = parts[0];
      const storeId = parts[1];
      if (productId && storeId) {
        updateTitle('Lulo Market - Product Details');
        return <ProductDetails productId={productId} storeId={storeId} />;
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

    if (currentRoute.startsWith('#payout-policy')) {
      return <PayoutPolicy />;
    }

    if (currentRoute.startsWith('#seller-agreement')) {
      return <SellerAgreement />;
    }

    if (currentRoute.startsWith('#refund-policy')) {
      return <RefundPolicy />;
    }

    if (currentRoute.startsWith('#help')) {
      updateTitle('Lulo Market - Help & Support');
      return <HelpPage />;
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

    if (currentRoute === '#cart') {
      updateTitle('Lulo Market - Your Cart');
      return <CartPage />;
    }

    if (currentRoute === '#checkout') {
      if (!currentUser) {
        // Redirect is handled by useEffect
        return <Login />;
      }
      updateTitle('Lulo Market - Checkout');
      return <CheckoutPage />;
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
            <CookieConsent />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;