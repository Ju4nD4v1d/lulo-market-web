import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DashboardLayout } from './components';
import { StripeReturnToast } from './components/StripeReturnToast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { useStripeConnectReturn } from './hooks/useStripeConnectReturn';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';

// Import migrated sections
import { MetricsPage } from './sections/metrics';
import { StoreSetupPage } from './sections/store-setup';
import { ProductsPage } from './sections/products';
import { OrdersPage } from './sections/orders';
import { InventoryPage } from './sections/inventory';
import { DocumentsPage } from './sections/documents';

type DashboardPageType = 'store' | 'products' | 'metrics' | 'orders' | 'inventory' | 'documents';

/**
 * Determine current page from pathname
 */
const getPageFromPathname = (pathname: string): DashboardPageType => {
  if (pathname.includes('/products')) return 'products';
  if (pathname.includes('/metrics')) return 'metrics';
  if (pathname.includes('/orders')) return 'orders';
  if (pathname.includes('/inventory')) return 'inventory';
  if (pathname.includes('/documents')) return 'documents';
  return 'store';
};

export const DashboardPage = () => {
  const { currentUser, userType } = useAuth();
  const { t } = useLanguage();
  const { storeId: contextStoreId, storeSlug: contextStoreSlug } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug: urlStoreSlug } = useParams<{ storeSlug: string }>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Use storeId from context (URL slug is just for display, we always use context for actual store operations)
  const storeId = contextStoreId;

  // Track current page based on pathname
  const currentPage = getPageFromPathname(location.pathname);

  // Redirect to URL with storeSlug if not present, or normalize URL to use slug
  useEffect(() => {
    if (!isChecking && contextStoreSlug) {
      if (!urlStoreSlug) {
        // No slug in URL - add it
        const subPath = location.pathname.replace(/^\/dashboard\/?/, '');
        const searchParams = location.search;
        const newPath = `/dashboard/${contextStoreSlug}${subPath ? `/${subPath}` : ''}${searchParams}`;
        navigate(newPath, { replace: true });
      } else if (urlStoreSlug !== contextStoreSlug && userType !== 'admin') {
        // URL doesn't match user's store slug (could be old ID or wrong slug)
        // Redirect to user's actual store to prevent unauthorized access and normalize URL
        const subPath = location.pathname.replace(/^\/dashboard\/[^/]+\/?/, '');
        const searchParams = location.search;
        const newPath = `/dashboard/${contextStoreSlug}${subPath ? `/${subPath}` : ''}${searchParams}`;
        navigate(newPath, { replace: true });
      }
    }
  }, [contextStoreSlug, urlStoreSlug, isChecking, userType, location.pathname, location.search, navigate]);

  // Handle Stripe Connect return from onboarding
  const { status: stripeStatus, message: stripeMessage, clearStatus: clearStripeStatus } = useStripeConnectReturn();

  // Real-time order notifications
  const { unreadCount, markAllAsSeen } = useOrderNotifications({
    storeId,
    storeSlug: contextStoreSlug,
    enabled: hasPermissions && !!storeId,
    onNavigate: navigate,
  });

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      // Check if user has business owner permissions
      if (!currentUser) {
        navigate('/login');
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
  }, [currentUser, userType, navigate]);

  // Mark orders as seen when viewing orders page
  // Must be before any conditional returns to follow React hooks rules
  useEffect(() => {
    if (currentPage === 'orders' && unreadCount > 0 && hasPermissions) {
      markAllAsSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, hasPermissions]); // Only trigger on page change, not on unreadCount/markAllAsSeen changes

  // Render current section based on route
  const renderSection = useCallback(() => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'metrics':
        return <MetricsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'store':
      default:
        return <StoreSetupPage />;
    }
  }, [currentPage]);

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
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <StripeReturnToast
        status={stripeStatus}
        message={stripeMessage}
        onClose={clearStripeStatus}
      />
      <DashboardLayout currentPage={currentPage} ordersBadgeCount={unreadCount}>
        {renderSection()}
      </DashboardLayout>
    </>
  );
};

export default DashboardPage;
