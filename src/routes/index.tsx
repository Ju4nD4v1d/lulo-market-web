import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load route components for code splitting
const Home = lazy(() => import('../pages/home'));
const Login = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/dashboard'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const PayoutPolicy = lazy(() => import('../pages/PayoutPolicy'));
const SellerAgreement = lazy(() => import('../pages/seller-agreement'));
const RefundPolicy = lazy(() => import('../pages/refund-policy'));
const EditProfile = lazy(() => import('../pages/EditProfile'));
const StoreMenu = lazy(() => import('../pages/store-menu'));
const Business = lazy(() => import('../pages/business'));
const OrderHistory = lazy(() => import('../pages/order-history'));
const OrderTracking = lazy(() => import('../pages/order-tracking'));
const ProductList = lazy(() => import('../components/ProductList'));
const HelpPage = lazy(() => import('../pages/help'));
const ProductDetails = lazy(() => import('../pages/product-details'));
const CartPage = lazy(() => import('../pages/cart'));
const CheckoutPage = lazy(() => import('../pages/checkout'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const DispatcherPage = lazy(() => import('../pages/admin/DispatcherPage'));

// Lazy load static landing page components (rarely used)
const Header = lazy(() => import('../components/Header'));
const Hero = lazy(() => import('../components/Hero'));
const SocialProof = lazy(() => import('../components/SocialProof'));
const ConversionPricing = lazy(() => import('../components/ConversionPricing'));
const Footer = lazy(() => import('../components/Footer'));

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

/**
 * Legacy Landing Page Component
 * Archived static landing page, rarely used
 */
const LandingPage = () => (
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

/**
 * Order Tracking Wrapper
 * Extracts orderId from URL params
 */
const OrderTrackingWrapper = () => {
  // Note: useParams will be used in the actual component
  // This wrapper handles the navigation callback
  return <OrderTracking />;
};

/**
 * Product Details Wrapper
 * Extracts productId and storeId from URL params
 */
const ProductDetailsWrapper = () => {
  // Note: useParams will be used in the actual component
  return <ProductDetails />;
};

/**
 * AppRoutes Component
 *
 * Defines all application routes using React Router v6.
 * Routes are lazy-loaded for code splitting.
 */
export const AppRoutes = () => {
  return (
    <div className="font-sans">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/business" element={<Business />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/payout-policy" element={<PayoutPolicy />} />
          <Route path="/seller-agreement" element={<SellerAgreement />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          {/* Store & Product Routes - uses slug (or legacy ID for backward compatibility) */}
          <Route path="/store/:storeSlug" element={<StoreMenu />} />
          <Route path="/product/:productId/:storeSlug" element={<ProductDetailsWrapper />} />

          {/* Legacy redirect: shopper-dashboard → store */}
          <Route path="/shopper-dashboard/:storeId" element={<Navigate to="/store/:storeId" replace />} />
          <Route path="/shopper-dashboard" element={<Navigate to="/" replace />} />

          {/* Legacy landing page */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute saveRedirect>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute saveRedirect>
                <OrderTrackingWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <ProtectedRoute saveRedirect>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute saveRedirect>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          {/* Dashboard with storeSlug - the canonical URL format */}
          <Route
            path="/dashboard/:storeSlug/*"
            element={
              <ProtectedRoute saveRedirect>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Dashboard without storeSlug - will redirect to /dashboard/:storeSlug */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute saveRedirect>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute saveRedirect>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dispatcher"
            element={
              <ProtectedRoute saveRedirect>
                <DispatcherPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;
