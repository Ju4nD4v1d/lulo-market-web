import { useState, useEffect } from 'react';
import { DashboardLayout } from './components';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// Import migrated sections
import { MetricsPage } from './sections/metrics';
import { StoreSetupPage } from './sections/store-setup';
import { ProductsPage } from './sections/products';
import { OrdersPage } from './sections/orders';
import { MessagesSection } from './sections/messages';

export const DashboardPage = () => {
  const { currentUser, userType } = useAuth();
  const { t } = useLanguage();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      // Check if user has business owner permissions
      if (!currentUser) {
        window.location.hash = '#login';
        return;
      }

      // Check user type - allow both storeOwner and admin
      if (userType !== 'storeOwner' && userType !== 'admin') {
        setHasPermissions(false);
        setIsChecking(false);
        return;
      }

      setHasPermissions(true);
      setIsChecking(false);
    };

    checkPermissions();
  }, [currentUser, userType]);

  // Determine current page from hash
  const hash = window.location.hash;
  let currentPage: 'store' | 'products' | 'metrics' | 'orders' | 'messages' = 'store';

  if (hash.includes('/products')) {
    currentPage = 'products';
  } else if (hash.includes('/metrics')) {
    currentPage = 'metrics';
  } else if (hash.includes('/orders')) {
    currentPage = 'orders';
  } else if (hash.includes('/messages')) {
    currentPage = 'messages';
  }

  // Show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show access denied if no permissions
  if (!hasPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('admin.accessDenied')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('admin.accessDeniedMessage')}
          </p>
          <button
            onClick={() => window.location.hash = '#'}
            className="btn-primary"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  // Render current section based on route
  const renderSection = () => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'metrics':
        return <MetricsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'messages':
        return <MessagesSection />;
      case 'store':
      default:
        return <StoreSetupPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage}>
      {renderSection()}
    </DashboardLayout>
  );
};

export default DashboardPage;
