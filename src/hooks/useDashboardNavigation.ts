import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/**
 * Hook for navigating within the dashboard with storeSlug-aware URLs.
 * Returns helper functions to navigate to dashboard sections.
 */
export const useDashboardNavigation = () => {
  const navigate = useNavigate();
  const { storeSlug } = useStore();

  // Build the dashboard base path with storeSlug
  const dashboardBase = storeSlug ? `/dashboard/${storeSlug}` : '/dashboard';

  const goToStore = useCallback(() => {
    navigate(dashboardBase);
  }, [navigate, dashboardBase]);

  const goToProducts = useCallback(() => {
    navigate(`${dashboardBase}/products`);
  }, [navigate, dashboardBase]);

  const goToInventory = useCallback(() => {
    navigate(`${dashboardBase}/inventory`);
  }, [navigate, dashboardBase]);

  const goToOrders = useCallback(() => {
    navigate(`${dashboardBase}/orders`);
  }, [navigate, dashboardBase]);

  const goToMetrics = useCallback(() => {
    navigate(`${dashboardBase}/metrics`);
  }, [navigate, dashboardBase]);

  const goToDocuments = useCallback(() => {
    navigate(`${dashboardBase}/documents`);
  }, [navigate, dashboardBase]);

  return {
    dashboardBase,
    goToStore,
    goToProducts,
    goToInventory,
    goToOrders,
    goToMetrics,
    goToDocuments,
  };
};
