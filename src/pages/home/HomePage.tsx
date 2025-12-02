import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StoreData } from '../../types';
import { Product } from '../../types';
import { MarketplaceHero } from '../../components/MarketplaceHero';
import { Footer } from '../../components/Footer';
import { ChristmasBanner } from '../../components/ChristmasBanner';
import { HomeHeader } from './components/HomeHeader';
import { HowItWorks } from './components/HowItWorks';
import { OurStory } from './components/OurStory';
import { HorizontalStoreRow } from './components/HorizontalStoreRow';
import { HorizontalProductRow } from './components/HorizontalProductRow';
import { EmptyStateSection } from './components/EmptyStateSection';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useStoreData } from '../../hooks/useStoreData';
import styles from './index.module.css';

/**
 * HomePage Component
 *
 * Main marketplace landing page with:
 * - Horizontal scrolling store browse
 * - Horizontal scrolling products
 * - User authentication
 * - Shopping cart
 */
export const HomePage = () => {
  // Context hooks
  const { cart } = useCart();
  const { t, toggleLanguage, locale } = useLanguage();
  const { setRedirectAfterLogin, currentUser, userProfile, logout } = useAuth();
  const { isOffline } = useNetworkStatus();

  // Data fetching hooks
  const { stores, loading, fetchStores } = useStoreData();

  // Local UI state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch stores once on mount using useRef to prevent re-fetch
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      fetchStores();
      hasFetched.current = true;
    }
  }, [fetchStores]);

  /**
   * Handle store card click - navigate to store page
   */
  const handleStoreClick = useCallback((store: StoreData) => {
    window.location.hash = `#store/${store.id}`;
  }, []);

  /**
   * Handle product card click - navigate to product details page
   */
  const handleProductClick = useCallback((product: Product, store: StoreData) => {
    window.location.hash = `#product/${product.id}/${store.id}`;
  }, []);

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
   * Navigate to cart page
   */
  const handleCartClick = useCallback(() => {
    window.location.hash = '#cart';
  }, []);

  // Filter active stores only - memoized to prevent re-renders
  const activeStores = useMemo(() =>
    stores.filter(store =>
      store.status === undefined || store.status === 'active'
    ), [stores]
  );

  // Filter stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeStores;
    }

    const query = searchQuery.toLowerCase().trim();
    return activeStores.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.description?.toLowerCase().includes(query) ||
      store.category?.toLowerCase().includes(query) ||
      store.cuisine?.toLowerCase().includes(query)
    );
  }, [searchQuery, activeStores]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <HomeHeader
        isOffline={isOffline}
        currentUser={currentUser}
        userProfile={userProfile ?? undefined}
        cartItemCount={cart.summary.itemCount}
        showUserMenu={showUserMenu}
        locale={locale}
        onToggleLanguage={toggleLanguage}
        onCartClick={handleCartClick}
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
      />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Empty State - Show when no stores available */}
        {!loading && activeStores.length === 0 && (
          <EmptyStateSection />
        )}

        {/* Stores Horizontal Row */}
        {!loading && activeStores.length > 0 && (
          <HorizontalStoreRow
            stores={filteredStores}
            onStoreClick={handleStoreClick}
          />
        )}

        {/* Products Horizontal Row */}
        {!loading && activeStores.length > 0 && (
          <HorizontalProductRow
            stores={activeStores}
            onProductClick={handleProductClick}
            searchQuery={searchQuery}
          />
        )}

        {/* How It Works Section */}
        <HowItWorks t={t} />

        {/* Our Story Section */}
        <OurStory t={t} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
