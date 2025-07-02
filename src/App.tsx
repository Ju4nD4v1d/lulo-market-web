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
import { Pricing } from './components/Pricing';
import { ShopperDashboard } from './components/ShopperDashboard';
import { StoreMenu } from './components/StoreMenu';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderRoute = () => {
    // Check for dashboard routes first
    if (currentRoute.startsWith('#dashboard')) {
      return <Dashboard />;
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
    <LanguageProvider>
      <div className="font-sans">
        {renderRoute()}
      </div>
    </LanguageProvider>
  );
}

export default App;