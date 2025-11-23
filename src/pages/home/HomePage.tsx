import { useState, useCallback, useEffect } from 'react';
import { StoreData } from '../../types/store';
import { SearchResultStore, SearchResults } from '../../types/search';
import { CartSidebar } from '../../components/CartSidebar';
import { MarketplaceHero } from '../../components/MarketplaceHero';
import { Footer } from '../../components/Footer';
import { ChristmasBanner } from '../../components/ChristmasBanner';
import { HomeHeader } from './components/HomeHeader';
import { HowItWorks } from './components/HowItWorks';
import { OurStory } from './components/OurStory';
import { StoreListContainer } from './components';
import { useStoreSearch, useStoreFilters, useCheckoutFlow } from './hooks';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useStoreData } from '../../hooks/useStoreData';
import { useSearch } from '../../hooks/useSearch';
import { useSearchStore } from '../../stores/searchStore';
import { calculateDistance as calculateStoreDistance, isStoreNew } from '../../utils/storeHelpers';
import styles from './index.module.css';

/**
 * HomePage Component
 *
 * Main marketplace landing page with:
 * - Store browsing and search
 * - User authentication
 * - Shopping cart
 * - Geolocation services
 *
 * Refactored to use custom hooks and Zustand stores for better maintainability
 */
export const HomePage = () => {
  // Context hooks
  const { cart } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const { setRedirectAfterLogin, currentUser, userProfile, logout } = useAuth();
  const { isOffline } = useNetworkStatus();

  // Data fetching hooks
  const { stores, loading, hasDataError, errorMessage, fetchStores, retryFetch } = useStoreData();
  const { location: userLocation, locationName, locationStatus, requestLocation } = useGeolocation();

  // Zustand stores
  const { searchQuery, setSearchQuery, isUsingFallbackSearch } = useSearchStore();

  // Custom hooks for search and checkout
  const { isSearching, searchError, clearSearch } = useStoreSearch({ stores });

  const { shouldOpenCheckout, closeCheckout } = useCheckoutFlow({
    onOpenCheckout: () => {
      setShowCart(true);
    },
  });

  // Filtering hook
  const { displayedStores } = useStoreFilters({ stores });

  // API search hook (for results metadata)
  const { results: searchResultsArray } = useSearch({
    enableLocation: true,
    debounceMs: 300,
    minQueryLength: 2,
  });

  // Wrap array results in SearchResults object for components
  const searchResults: SearchResults | null = searchResultsArray
    ? {
        stores: searchResultsArray,
        totalCount: searchResultsArray.length,
        query: searchQuery,
      }
    : null;

  // Local UI state
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch stores once on mount
  useEffect(() => {
    fetchStores();
    /**
     * Dependency array explanation:
     * - fetchStores: Stable function from React Query's refetch (useStoreData hook)
     * - React Query ensures refetch has a stable reference that doesn't change between renders
     * - We intentionally want this to run only once on mount, not on every render
     * - Including fetchStores would not cause re-renders, but the empty array makes the intent clearer
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle store card click
   * Tracks analytics if from search results and navigates to store page
   */
  const handleStoreClick = useCallback(async (store: StoreData) => {
    // Track search click if this came from search results
    if (searchQuery && searchResults && store.searchMetadata) {
      // Tracking logic would go here
      // (placeholder implementation)

      // Track click (placeholder implementation)
      // TODO: Implement analytics tracking for search clicks
    }

    // Navigate to store detail page
    window.location.hash = `#shopper-dashboard/${store.id}`;
  }, [searchQuery, searchResults]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowUserMenu(false);
      window.location.hash = '#';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [logout]);

  /**
   * Toggle user menu
   */
  const handleUserMenuClick = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  /**
   * Navigate from user menu
   */
  const handleMenuNavigation = useCallback((path: string) => {
    setShowUserMenu(false);
    localStorage.setItem('backNavigationPath', '#');
    window.location.hash = path;
  }, []);

  /**
   * Calculate distance to store
   */
  const calculateDistance = useCallback(
    (store?: StoreData): string => {
      return calculateStoreDistance(userLocation, store);
    },
    [userLocation]
  );

  /**
   * Check if store is new (wrapper for isStoreNew helper)
   */
  const checkIsStoreNew = useCallback(
    (store: StoreData): boolean => {
      return isStoreNew(store.createdAt);
    },
    []
  );

  /**
   * Handle cart close
   */
  const handleCartClose = useCallback(() => {
    setShowCart(false);
    closeCheckout();
  }, [closeCheckout]);

  /**
   * Handle search clear
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    clearSearch();
  }, [setSearchQuery, clearSearch]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <HomeHeader
        isOffline={isOffline}
        currentUser={currentUser}
        userProfile={userProfile ?? undefined}
        cartItemCount={cart.summary.itemCount}
        showUserMenu={showUserMenu}
        onToggleLanguage={toggleLanguage}
        onCartClick={() => setShowCart(true)}
        onUserMenuClick={handleUserMenuClick}
        onUserMenuClose={() => setShowUserMenu(false)}
        onLogout={handleLogout}
        onMenuNavigate={handleMenuNavigation}
        onLoginRedirect={() => {
          setRedirectAfterLogin(window.location.hash || '#');
          window.location.hash = '#login';
        }}
        t={t}
      />

      {/* Christmas Banner */}
      <ChristmasBanner />

      {/* Hero Section */}
      <MarketplaceHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLocationRequest={requestLocation}
        locationStatus={locationStatus}
        locationName={locationName}
      />

      {/* Store List Container */}
      <StoreListContainer
        stores={displayedStores}
        loading={loading}
        isSearching={isSearching}
        isUsingSearch={!!searchQuery}
        isUsingFallbackSearch={isUsingFallbackSearch}
        hasDataError={hasDataError}
        searchError={searchError}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isOffline={isOffline}
        errorMessage={errorMessage}
        onStoreClick={handleStoreClick}
        onRetryFetch={retryFetch}
        onClearSearch={handleClearSearch}
        calculateDistance={calculateDistance}
        isStoreNew={checkIsStoreNew}
        t={t}
      />

      {/* How It Works Section */}
      <HowItWorks t={t} />

      {/* Our Story Section */}
      <OurStory t={t} />

      {/* Footer */}
      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCart}
        onClose={handleCartClose}
        openInCheckoutMode={shouldOpenCheckout}
      />
    </div>
  );
};
