# Legacy Analytics Cleanup Instructions

This document outlines the legacy analytics code that should be removed after the new backend system has been validated and is running successfully for 2-3 weeks.

## ⚠️ **IMPORTANT: Do Not Remove Until New System is Validated**

**Timeline**: Only proceed with cleanup after:
- [ ] New backend analytics have been running successfully for 2-3 weeks
- [ ] All dashboard metrics are showing correct data from new collections
- [ ] Real-time updates are working consistently
- [ ] No fallbacks to legacy system are being used

## 🧹 **Files to Remove Completely**

### 1. Legacy Hook Files
```
src/hooks/useProductsTrend.ts
src/hooks/useOrdersTrend.ts
src/hooks/useActiveCustomersTrend.ts
src/hooks/useRevenueTrend.ts
```

**Reason**: These hooks query old `monthlyRevenueSummary` structure and are replaced by `useCurrentWeekMetrics.ts`

**How to verify before removal**:
```bash
# Search for any remaining imports
grep -r "useProductsTrend\|useOrdersTrend\|useActiveCustomersTrend\|useRevenueTrend" src/
```

### 2. Legacy Utility Functions (Partial Cleanup)

**File**: `src/utils/analytics.ts`

**Functions to remove**:
- `getLegacyWeekMetrics()` (lines ~95-125)
- `getLegacyTopProducts()` (lines ~165-195)
- All fallback logic in main functions

**How to identify legacy code**:
```javascript
// Look for these patterns and remove them:
try {
  // New system code
} catch (error) {
  // REMOVE: Fallback to legacy system
  return getLegacyWeekMetrics(storeId);
}
```

## 🔧 **Files to Modify (Remove Legacy Parts)**

### 1. `src/utils/analytics.ts`

**Remove these functions**:
```javascript
async function getLegacyWeekMetrics(storeId: string): Promise<CurrentWeekMetrics>
async function getLegacyTopProducts(storeId: string): Promise<TopProductsResult>
```

**Simplify these functions** (remove try/catch fallback blocks):
```javascript
// BEFORE (with fallback):
export async function getCurrentWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
  try {
    // New backend code
    if (snapshot.docs.length > 0) {
      return aggregatedData;
    }
  } catch (error) {
    console.warn('New currentWeekMetrics unavailable, falling back to legacy:', error);
  }
  
  // REMOVE THIS: Fallback to legacy
  return getLegacyWeekMetrics(storeId);
}

// AFTER (new system only):
export async function getCurrentWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
  const weekKey = getCurrentWeekKey();
  const q = query(
    collection(db, 'currentWeekMetrics'),
    where('storeId', '==', storeId),
    where('weekKey', '==', weekKey)
  );

  const snapshot = await getDocs(q);
  // ... return aggregated data directly
}
```

### 2. `src/hooks/useCurrentWeekMetrics.ts`

**Remove data source detection**:
```javascript
// REMOVE these lines:
const [dataSource, setDataSource] = useState<'new' | 'legacy' | 'unknown'>('unknown');

// REMOVE dataSource logic from return:
return {
  // ... other properties
  dataSource, // REMOVE
  // ... other properties  
};
```

### 3. `src/components/MetricsDashboard.tsx`

**Check for any remaining legacy imports**:
```javascript
// REMOVE if found:
import { useRevenueTrend } from '../hooks/useRevenueTrend';
import { useOrdersTrend } from '../hooks/useOrdersTrend';
import { useProductsTrend } from '../hooks/useProductsTrend';
import { useActiveCustomersTrend } from '../hooks/useActiveCustomersTrend';
```

## 📊 **Collections to Monitor Before Cleanup**

### Backend Collections (DO NOT REMOVE)
These should remain in Firebase:
- ✅ `currentWeekMetrics` - New system primary data
- ✅ `analytics/topProducts` - New analytics collection  
- ✅ `activeCustomers` - New customer tracking
- ⚠️ `monthlyRevenueSummary` - Keep for historical data

### Legacy Collections (Monitor Usage)
Before removing code that queries these:
- 📊 `monthlyRevenueSummary` - Check if still being used for historical trends
- 📊 `products` collection - Verify if `totalSold` field is still needed

## 🧪 **Validation Steps Before Cleanup**

### 1. Data Validation Script
```javascript
// Run this in browser console before cleanup:
window.testAnalytics.compareAnalyticsSources('your-store-id').then(result => {
  console.log('Data source:', result.dataSource);
  if (result.dataSource === 'new') {
    console.log('✅ Ready for legacy cleanup');
  } else {
    console.log('❌ Still using legacy data - DO NOT clean up yet');
  }
});
```

### 2. Check Dashboard Functionality
- [ ] All metric cards load without errors
- [ ] Trends show correct percentages
- [ ] Real-time updates work when creating test orders
- [ ] Top products display current week data
- [ ] No "Building insights" messages on established stores

### 3. Monitor Error Logs
```bash
# Check browser console for these errors:
"New currentWeekMetrics unavailable, falling back to legacy"
"New analytics/topProducts unavailable, falling back to legacy"

# If these appear frequently, delay cleanup
```

## 📝 **Cleanup Process**

### Phase 1: Remove Unused Hook Files
1. Confirm no imports exist: `grep -r "useProductsTrend\|useOrdersTrend\|useActiveCustomersTrend\|useRevenueTrend" src/`
2. Delete the 4 legacy hook files
3. Test dashboard functionality

### Phase 2: Remove Fallback Functions  
1. Remove `getLegacyWeekMetrics()` and `getLegacyTopProducts()` from `analytics.ts`
2. Simplify main functions to remove try/catch fallbacks
3. Test with various edge cases (no data, new stores, etc.)

### Phase 3: Clean Up State Management
1. Remove `dataSource` tracking from hooks
2. Remove legacy-related props from components
3. Update TypeScript interfaces if needed

### Phase 4: Final Validation
1. Run full test suite: `npm run test`
2. Run linting: `npm run lint` 
3. Build production bundle: `npm run build`
4. Test on staging environment with real data

## 🚨 **Rollback Plan**

If issues arise after cleanup:

### Quick Rollback
```bash
# Restore from git (assuming you committed before cleanup)
git checkout HEAD~1 -- src/hooks/useProductsTrend.ts
git checkout HEAD~1 -- src/hooks/useOrdersTrend.ts
git checkout HEAD~1 -- src/hooks/useActiveCustomersTrend.ts
git checkout HEAD~1 -- src/hooks/useRevenueTrend.ts
git checkout HEAD~1 -- src/utils/analytics.ts
```

### Alternative: Feature Flag
Consider adding a feature flag before cleanup:
```javascript
const USE_LEGACY_ANALYTICS = false; // Set to true to rollback

export async function getCurrentWeekMetrics(storeId: string) {
  if (USE_LEGACY_ANALYTICS) {
    return getLegacyWeekMetrics(storeId);
  }
  // New system code...
}
```

## 📋 **Cleanup Checklist**

- [ ] New analytics running successfully for 2+ weeks
- [ ] All dashboard metrics showing correct data  
- [ ] Real-time updates working consistently
- [ ] No error messages about fallbacks
- [ ] Data validation script shows "new" source only
- [ ] Remove 4 legacy hook files
- [ ] Remove legacy fallback functions from analytics.ts
- [ ] Remove dataSource tracking from useCurrentWeekMetrics.ts
- [ ] Remove legacy imports from MetricsDashboard.tsx
- [ ] Run tests and linting
- [ ] Test on staging environment
- [ ] Deploy and monitor for issues
- [ ] Update documentation if needed

## 📞 **Support Information**

If issues arise during cleanup:
1. Check browser console for specific error messages
2. Verify Firebase collections have expected data structure  
3. Test with different store IDs and edge cases
4. Consider reverting specific files rather than entire cleanup
5. Monitor user reports of missing/incorrect analytics data

Remember: **It's better to keep working legacy code longer than to break analytics entirely.**