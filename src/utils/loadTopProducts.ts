import { getTopProductsByStore } from './analytics';

/**
 * Load top products for dashboard display
 * Uses new analytics backend with fallback to legacy
 */
export async function loadTopProducts(storeId: string) {
  try {
    const topProducts = await getTopProductsByStore(storeId);
    
    // Return top 5 products by current week sales (preferred)
    // Fall back to quantity if no current week data
    const productsToShow = topProducts.byCurrentWeek.length > 0 
      ? topProducts.byCurrentWeek 
      : topProducts.byQuantity;

    return productsToShow.slice(0, 5).map(product => ({
      label: product.productName,
      value: product.weekSales || product.totalQuantitySold,
      color: undefined // Will be set by the component
    }));
  } catch (error) {
    console.error('Error loading top products:', error);
    return [];
  }
}