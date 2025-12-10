import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * useAppNavigate Hook
 *
 * A wrapper around React Router's useNavigate that provides
 * convenience methods for common navigation patterns.
 *
 * This hook helps with the migration from hash-based routing
 * to BrowserRouter by providing a consistent API.
 */
export const useAppNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a path
   */
  const goTo = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      navigate(path, options);
    },
    [navigate]
  );

  /**
   * Navigate back in history
   */
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Navigate to home
   */
  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  /**
   * Navigate to login
   */
  const goToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  /**
   * Navigate to a store
   */
  const goToStore = useCallback(
    (storeId: string) => {
      navigate(`/store/${storeId}`);
    },
    [navigate]
  );

  /**
   * Navigate to a product
   */
  const goToProduct = useCallback(
    (productId: string, storeId: string) => {
      navigate(`/product/${productId}/${storeId}`);
    },
    [navigate]
  );

  /**
   * Navigate to an order
   */
  const goToOrder = useCallback(
    (orderId: string) => {
      navigate(`/order/${orderId}`);
    },
    [navigate]
  );

  /**
   * Navigate to dashboard
   */
  const goToDashboard = useCallback(
    (subPath?: string) => {
      navigate(subPath ? `/dashboard/${subPath}` : '/dashboard');
    },
    [navigate]
  );

  /**
   * Navigate to cart
   */
  const goToCart = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  /**
   * Navigate to checkout
   */
  const goToCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  return {
    navigate,
    goTo,
    goBack,
    goHome,
    goToLogin,
    goToStore,
    goToProduct,
    goToOrder,
    goToDashboard,
    goToCart,
    goToCheckout,
    location,
    currentPath: location.pathname,
  };
};

export default useAppNavigate;
