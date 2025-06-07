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

    // Then check other routes
    switch (currentRoute) {
      case '#login':
        return <Login />;
      case '#forgot-password':
        return <ForgotPassword />;
      case '#terms':
        return <TermsOfService />;
      case '#privacy':
        return <PrivacyPolicy />;
      default:
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
    }
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