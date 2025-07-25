import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { SocialProof } from './components/SocialProof';
import { ConversionPricing } from './components/ConversionPricing';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { EditProfile } from './pages/EditProfile';
import { StoreMenu } from './components/StoreMenu';
import { Business } from './components/Business';
import { Home } from './components/Home';
import { OrderHistory } from './components/OrderHistory';
import { OrderTracking } from './components/OrderTracking';
import { StoreList } from './components/StoreList';
import { ProductList } from './components/ProductList';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TestModeProvider } from './context/TestModeContext';
import { DataProvider } from './services/DataProvider';
import { MockAuthProvider } from './services/MockAuthService';

// Helper function to update document title
const updateTitle = (title: string) => {
  document.title = title;
};

const AppRoutes = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#');
  const { currentUser, loading, redirectAfterLogin, setRedirectAfterLogin } = useAuth();

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

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderRoute = () => {
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

    if (currentRoute.startsWith('#stores')) {
      updateTitle('Lulo Market - All Stores');
      return <StoreList onBack={() => window.location.hash = '#'} />;
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
            <HowItWorks />
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
      {renderRoute()}
    </div>
  );
};

function App() {
  return (
    <TestModeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MockAuthProvider>
            <DataProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </DataProvider>
          </MockAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </TestModeProvider>
  );
}

export default App;