/**
 * Test utilities for validating analytics alignment
 * Use this to verify frontend-backend compatibility
 */

import { 
  validateAnalyticsData, 
  getCurrentWeekMetrics, 
  getTopProductsByStore 
} from './analytics';
import { getCurrentWeekKey, getCurrentMonthKey } from './dateUtils';

/**
 * Test function to create a sample order and verify analytics update
 * Use in development to verify the analytics pipeline works
 */
export async function testAnalyticsFlow(storeId: string) {
  console.log('🧪 Testing Analytics Flow...');
  console.log('==================================');
  
  // Step 1: Check current state
  console.log('📊 Current Analytics State:');
  const beforeMetrics = await getCurrentWeekMetrics(storeId);
  console.log('Before metrics:', {
    revenue: beforeMetrics.totalRevenue,
    orders: beforeMetrics.totalOrders,
    products: beforeMetrics.totalProducts,
    customers: beforeMetrics.activeCustomers,
    dataSource: beforeMetrics.lastUpdated ? 'new' : 'legacy'
  });

  // Step 2: Validate week key calculation
  console.log('\n📅 Week Calculation Validation:');
  const currentWeekKey = getCurrentWeekKey();
  const monthKey = getCurrentMonthKey();
  console.log('Current week key:', currentWeekKey);
  console.log('Current month key:', monthKey);
  console.log('Expected format: "2025-W35" for weeks, "2025-08" for months');

  // Step 3: Test top products
  console.log('\n🏆 Top Products Test:');
  try {
    const topProducts = await getTopProductsByStore(storeId);
    console.log('Top products by quantity:', topProducts.byQuantity.slice(0, 3));
    console.log('Top products by current week:', topProducts.byCurrentWeek.slice(0, 3));
    console.log('Data source:', topProducts.lastUpdated ? 'new analytics' : 'legacy products');
  } catch (error) {
    console.error('Top products error:', error);
  }

  // Step 4: Validate complete system
  console.log('\n🔍 System Validation:');
  const validation = await validateAnalyticsData(storeId);
  console.log('Data sources used:', validation.dataSource);
  console.log('Current week summary:', {
    revenue: validation.currentWeekMetrics.totalRevenue,
    orders: validation.currentWeekMetrics.totalOrders,
    products: validation.currentWeekMetrics.totalProducts,
    customers: validation.activeCustomers
  });

  // Step 5: Instructions for manual testing
  console.log('\n📝 Manual Testing Instructions:');
  console.log('1. Create a test order in Firestore with these fields:');
  console.log(`   - storeId: "${storeId}"`);
  console.log('   - status: "paid"');
  console.log('   - orderStatus: "paid"');
  console.log('   - userId: "test_user_123"');
  console.log('   - customerId: "test_user_123"');
  console.log('   - createdDate: new Date()');
  console.log('   - createdAt: new Date()');
  console.log('   - totalOrderPrice: 99.99');
  console.log('   - total: 99.99');
  console.log('   - items: [{ productId, productName, quantity, price }]');
  console.log('\n2. Wait 2-5 seconds for Cloud Functions to process');
  console.log('3. Run testAnalyticsFlow() again to see changes');
  console.log('4. Check these collections in Firebase:');
  console.log(`   - currentWeekMetrics (weekKey: ${currentWeekKey})`);
  console.log('   - analytics/topProducts');
  console.log(`   - activeCustomers/weekly_${currentWeekKey}`);

  return {
    beforeMetrics,
    currentWeekKey,
    monthKey,
    validation
  };
}

/**
 * Compare new vs legacy analytics data
 */
export async function compareAnalyticsSources(storeId: string) {
  console.log('🔬 Comparing Analytics Sources...');
  console.log('=====================================');

  try {
    // Get data from both sources
    const validation = await validateAnalyticsData(storeId);
    
    console.log(`\n📈 Data Source Analysis: ${validation.dataSource}`);
    console.log('Current week metrics:');
    console.log('  Revenue:', validation.currentWeekMetrics.totalRevenue);
    console.log('  Orders:', validation.currentWeekMetrics.totalOrders);
    console.log('  Products:', validation.currentWeekMetrics.totalProducts);
    console.log('  Active customers:', validation.activeCustomers);
    
    console.log('\n🏆 Top Products:');
    validation.topProducts.byQuantity.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.productName}: ${product.totalQuantitySold} units`);
    });

    if (validation.topProducts.byCurrentWeek.length > 0) {
      console.log('\n📅 This Week\'s Top Products:');
      validation.topProducts.byCurrentWeek.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.productName}: ${product.weekSales || 0} units this week`);
      });
    }

    console.log('\n💡 Recommendations:');
    if (validation.dataSource === 'new') {
      console.log('✅ Using new analytics system - all good!');
    } else if (validation.dataSource === 'legacy') {
      console.log('⚠️  Using legacy system only - new backend may not be populated yet');
      console.log('   Create test orders to populate new analytics collections');
    } else {
      console.log('🔄 Mixed data sources - transitioning between systems');
      console.log('   Some metrics use new system, others fall back to legacy');
    }

    return validation;
  } catch (error) {
    console.error('❌ Error comparing analytics sources:', error);
    throw error;
  }
}

/**
 * Monitor real-time analytics updates
 * Call this and then create orders to see live updates
 */
export function monitorAnalyticsUpdates(storeId: string, durationMs: number = 30000) {
  console.log('👁️  Monitoring real-time analytics updates...');
  console.log(`Duration: ${durationMs / 1000} seconds`);
  console.log('Now create test orders and watch for updates!\n');

  let lastMetrics = { revenue: 0, orders: 0, products: 0, customers: 0 };
  
  const interval = setInterval(async () => {
    try {
      const metrics = await getCurrentWeekMetrics(storeId);
      const current = {
        revenue: metrics.totalRevenue,
        orders: metrics.totalOrders,
        products: metrics.totalProducts,
        customers: metrics.activeCustomers
      };

      // Check for changes
      const changes = {
        revenue: current.revenue - lastMetrics.revenue,
        orders: current.orders - lastMetrics.orders,
        products: current.products - lastMetrics.products,
        customers: current.customers - lastMetrics.customers
      };

      const hasChanges = Object.values(changes).some(change => change !== 0);
      
      if (hasChanges) {
        console.log(`🔔 ${new Date().toLocaleTimeString()} - Analytics Updated!`);
        console.log('   Changes:', {
          revenue: changes.revenue ? `+$${changes.revenue.toFixed(2)}` : 'no change',
          orders: changes.orders ? `+${changes.orders}` : 'no change',
          products: changes.products ? `+${changes.products}` : 'no change',
          customers: changes.customers ? `+${changes.customers}` : 'no change'
        });
        console.log('   Current totals:', current);
        console.log('');
      }

      lastMetrics = current;
    } catch (error) {
      console.error('Monitor error:', error);
    }
  }, 2000); // Check every 2 seconds

  // Stop monitoring after specified duration
  setTimeout(() => {
    clearInterval(interval);
    console.log('📊 Monitoring complete.');
  }, durationMs);

  return () => clearInterval(interval); // Return cleanup function
}

/**
 * Validate that week calculations match backend expectations
 */
export function validateWeekCalculations() {
  console.log('📅 Validating Week Calculations...');
  console.log('==================================');

  const testDates = [
    new Date('2025-01-01'), // New Year
    new Date('2025-01-06'), // First Monday
    new Date('2025-08-25'), // Today's date
    new Date('2025-12-31')  // End of year
  ];

  testDates.forEach(date => {
    const weekKey = getCurrentWeekKey(); // Would need to modify to accept date
    console.log(`Date: ${date.toISOString().split('T')[0]} → Week: ${weekKey}`);
  });

  console.log('\n✅ Expected format: "YYYY-WNN" (e.g., "2025-W35")');
  console.log('🔍 Verify these match your backend week calculations');
  
  // Test current week boundaries
  const now = new Date();
  console.log(`\n🗓️  Current date: ${now.toISOString().split('T')[0]}`);
  console.log(`📊 Current week key: ${getCurrentWeekKey()}`);
  console.log(`📅 Current month key: ${getCurrentMonthKey()}`);
}

// Export test functions for use in browser console
if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.testAnalytics = {
    testAnalyticsFlow,
    compareAnalyticsSources,
    monitorAnalyticsUpdates,
    validateWeekCalculations
  };
  
  console.log('🧪 Analytics test functions available in window.testAnalytics');
  console.log('Usage examples:');
  console.log('  window.testAnalytics.testAnalyticsFlow("your-store-id")');
  console.log('  window.testAnalytics.compareAnalyticsSources("your-store-id")');
  console.log('  window.testAnalytics.monitorAnalyticsUpdates("your-store-id", 30000)');
  console.log('  window.testAnalytics.validateWeekCalculations()');
}