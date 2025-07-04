import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BusinessOwners } from './components/BusinessOwners';
import { Shoppers } from './components/Shoppers';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { EditProfile } from './pages/EditProfile';
import { Pricing } from './components/Pricing';
import { ShopperDashboard } from './components/ShopperDashboard';
import { StoreMenu } from './components/StoreMenu';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#');
  const { currentUser, userType, loading, redirectAfterLogin, setRedirectAfterLogin } = useAuth();

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
    // Check for dashboard routes first - redirect based on userType
    if (currentRoute.startsWith('#dashboard')) {
      if (!currentUser) {
        window.location.hash = '#login';
        return <Login />;
      }

      // Route based on userType
      switch (userType) {
        case 'admin':
          // TODO: Create AdminDashboard component
          return <Dashboard />; // Temporary fallback
        case 'storeOwner':
          return <Dashboard />;
        case 'shopper':
          window.location.hash = '#shopper-dashboard';
          return <ShopperDashboard />;
        default:
          // Legacy users without userType - default to shopper
          window.location.hash = '#shopper-dashboard';
          return <ShopperDashboard />;
      }
    }

    // Check for shopper dashboard routes
    if (currentRoute.startsWith('#shopper-dashboard/')) {
      return <StoreMenu />;
    }

    if (currentRoute.startsWith('#shopper-dashboard')) {
      return <ShopperDashboard />;
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

    return (
      <>
        <Header />
        <main>
          <Hero />
          <BusinessOwners />
          <Shoppers />
          <Pricing />
          <About />
        </main>
        <Footer />
      </>
    );
  };

  return (
    <div className="font-sans">
      {renderRoute()}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;