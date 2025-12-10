import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HashRedirect Component
 *
 * Handles backward compatibility for hash-based URLs during migration
 * from custom hash routing to BrowserRouter.
 *
 * This component:
 * 1. Detects if the page was loaded with a hash-based URL
 * 2. Extracts the path from the hash
 * 3. Redirects to the clean URL equivalent
 * 4. Preserves query parameters if present
 *
 * Example migrations:
 * - /#store/abc123 → /store/abc123
 * - /#product/xyz/store123 → /product/xyz/store123
 * - /#dashboard?stripe=success → /dashboard?stripe=success
 * - /#shopper-dashboard/abc → /store/abc (legacy redirect)
 */
export const HashRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    // Only process if there's a hash that looks like a route
    if (!hash || hash === '#' || hash.length <= 1) {
      return;
    }

    // Extract path from hash (remove leading #)
    // Split pathname and query string to handle them separately
    const hashContent = hash.substring(1);
    const queryIndex = hashContent.indexOf('?');
    let pathname = queryIndex >= 0 ? hashContent.substring(0, queryIndex) : hashContent;
    const search = queryIndex >= 0 ? hashContent.substring(queryIndex) : '';

    // Handle legacy shopper-dashboard routes
    if (pathname.startsWith('/shopper-dashboard/')) {
      pathname = pathname.replace('/shopper-dashboard/', '/store/');
    } else if (pathname === '/shopper-dashboard') {
      pathname = '/';
    }

    // Handle hash without leading slash (e.g., #store/123 vs #/store/123)
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    // Handle legacy #landing route
    if (pathname === '/landing') {
      pathname = '/';
    }

    // Log in development mode
    if (import.meta.env.DEV) {
      console.log(`[HashRedirect] Migrating from ${hash} to ${pathname}${search}`);
    }

    // Clear the hash and navigate to clean URL
    // Use replace to avoid adding to history
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    // Navigate with proper pathname and search separation
    // This ensures React Router correctly parses query parameters
    if (search) {
      navigate({ pathname, search }, { replace: true });
    } else {
      navigate(pathname, { replace: true });
    }
  }, [navigate]);

  return null;
};

export default HashRedirect;
