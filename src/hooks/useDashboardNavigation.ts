import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/**
 * Hook for navigating within the dashboard with storeId-aware URLs.
 * Returns helper functions to navigate to dashboard sections.
 */
export const useDashboardNavigation = () => {
  const navigate = useNavigate();
  const { storeId } = useStore();

  // Build the dashboard base path with storeId
  const dashboardBase = storeId ? `/dashboard/${storeId}` : '/dashboard';

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
