import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { StoreSetup } from '../components/StoreSetup';
import { ProductManagement } from '../components/ProductManagement';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { OrderManagement } from '../components/OrderManagement';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const Dashboard = () => {
  const { checkStoreOwnerPermissions, currentUser } = useAuth();
  const { t } = useLanguage();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // Get the current route hash
  const hash = window.location.hash;
  let currentPage: 'store' | 'products' | 'metrics' | 'orders' = 'store';

  // Check permissions when component mounts or user changes
  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentUser) {
        setHasPermissions(false);
        setIsChecking(false);
        return;
      }

      try {
        const hasStoreOwnerPermissions = await checkStoreOwnerPermissions();
        setHasPermissions(hasStoreOwnerPermissions);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermissions(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkPermissions();
  }, [currentUser, checkStoreOwnerPermissions]);

  // Determine which page to show based on the hash
  if (hash.includes('/products')) {
    currentPage = 'products';
  } else if (hash.includes('/metrics')) {
    currentPage = 'metrics';
  } else if (hash.includes('/orders')) {
    currentPage = 'orders';
  }

  // Show loading state while checking permissions
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8E400] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permissions
  if (hasPermissions === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {t('business.login.accessDenied')}
            </p>
            <button
              onClick={() => window.location.hash = '#'}
              className="bg-[#C8E400] text-white px-6 py-3 rounded-lg hover:bg-[#A3C700] transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Shopper Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case 'products':
        return <ProductManagement />;
      case 'metrics':
        return <MetricsDashboard />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <StoreSetup />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage}>
      {renderContent()}
    </AdminLayout>
  );
};