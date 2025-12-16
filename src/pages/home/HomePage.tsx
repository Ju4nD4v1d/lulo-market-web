import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreData } from '../../types';
import { Product } from '../../types';
import { VibrantBackground } from '../../components/VibrantBackground';
import { MarketplaceHero } from '../../components/MarketplaceHero';
import { Footer } from '../../components/Footer';
import { HomeHeader } from './components/HomeHeader';
import { HowItWorks } from './components/HowItWorks';
import { HorizontalStoreRow } from './components/HorizontalStoreRow';
import { HorizontalProductRow } from './components/HorizontalProductRow';
import { EmptyStateSection } from './components/EmptyStateSection';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useStoreData } from '../../hooks/useStoreData';
import { useMarketplaceStores } from '../../hooks/useMarketplaceStores';
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
  // Router hooks
  const navigate = useNavigate();

  // Context hooks
  const { cart } = useCart();
  const { t, toggleLanguage, locale } = useLanguage();
  const { setRedirectAfterLogin, currentUser, userProfile, logout } = useAuth();
  const { isOffline } = useNetworkStatus();

  // Data fetching hooks
  const { stores, loading, fetchStores } = useStoreData();

  // Filter active stores first
  const activeStores = useMemo(() =>
    stores.filter(store =>
      store.status === undefined || store.status === 'active'
    ), [stores]
  );

  // Filter to marketplace-ready stores (backend sets isMarketplaceReady)
  const { validatedStores } = useMarketplaceStores(activeStores);

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
   * Handle store card click - navigate to store page using slug
   */
  const handleStoreClick = useCallback((store: StoreData) => {
    navigate(`/store/${store.slug}`);
  }, [navigate]);

  /**
   * Handle product card click - navigate to product details page using store slug
   */
  const handleProductClick = useCallback((product: Product, store: StoreData) => {
    navigate(`/product/${product.id}/${store.slug}`);
  }, [navigate]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [logout, navigate]);

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
    localStorage.setItem('backNavigationPath', '/');
    navigate(path);
  }, [navigate]);

  /**
   * Navigate to cart page
   */
  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  // Filter validated stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return validatedStores;
    }

    const query = searchQuery.toLowerCase().trim();
    return validatedStores.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.description?.toLowerCase().includes(query) ||
      store.category?.toLowerCase().includes(query) ||
      store.cuisine?.toLowerCase().includes(query)
    );
  }, [searchQuery, validatedStores]);

  // Loading state from store fetching
  const isLoading = loading;

  return (
    <VibrantBackground overlay="normal" showGrain={true}>
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
          setRedirectAfterLogin(window.location.pathname || '/');
          navigate('/login');
        }}
        t={t}
      />

      {/* Hero Section */}
      <MarketplaceHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Empty State - Show when no stores available */}
        {!isLoading && validatedStores.length === 0 && (
          <EmptyStateSection />
        )}

        {/* Stores Horizontal Row */}
        {!isLoading && validatedStores.length > 0 && (
          <HorizontalStoreRow
            stores={filteredStores}
            onStoreClick={handleStoreClick}
          />
        )}

        {/* Products Horizontal Row */}
        {!isLoading && validatedStores.length > 0 && (
          <HorizontalProductRow
            stores={validatedStores}
            onProductClick={handleProductClick}
            searchQuery={searchQuery}
          />
        )}

        {/* How It Works Section */}
        <HowItWorks t={t} />
      </main>

      {/* Footer */}
      <Footer />
    </VibrantBackground>
  );
};
