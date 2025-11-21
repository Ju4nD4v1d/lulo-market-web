import {useCallback, useEffect, useState} from 'react';
import {StoreData} from '../../types/store';
import {SearchResultStore} from '../../types/search';
import {StoreDetail} from '../../components/StoreDetail';
import {CartSidebar} from '../../components/CartSidebar';
import {MarketplaceHero} from '../../components/MarketplaceHero';
import {Footer} from '../../components/Footer';
import {HomeHeader} from '../../components/home/HomeHeader';
import {StoreGrid} from '../../components/home/StoreGrid';
import {HowItWorks} from '../../components/home/HowItWorks';
import {OurStory} from '../../components/home/OurStory';
import {useCart} from '../../context/CartContext';
import {useLanguage} from '../../context/LanguageContext';
import {useAuth} from '../../context/AuthContext';
import {useTestMode} from '../../context/TestModeContext';
import {useSearch} from '../../hooks/useSearch';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {useGeolocation} from '../../hooks/useGeolocation';
import {useStoreData} from '../../hooks/useStoreData';
import {calculateDistance as calculateStoreDistance, isStoreNew} from '../../utils/storeHelpers';
import styles from './index.module.css';

export const Home = () => {
    const {cart} = useCart();
    const {t, toggleLanguage} = useLanguage();
    const {setRedirectAfterLogin, currentUser, userProfile, logout, refreshUserProfile} = useAuth();
    const {isTestMode} = useTestMode();
    const {isOffline} = useNetworkStatus();

    // Custom hooks for data and location management
    const {stores, loading, hasDataError, errorMessage, fetchStores, retryFetch} = useStoreData();
    const {location: userLocation, locationName, locationStatus, requestLocation} = useGeolocation();

    // Local UI state
    const [selectedCountry, setSelectedCountry] = useState('colombia');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
    const [isUsingSearch, setIsUsingSearch] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
    const [showStoreDetail, setShowStoreDetail] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [shouldOpenCheckout, setShouldOpenCheckout] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isUsingFallbackSearch, setIsUsingFallbackSearch] = useState(false);

    // Search functionality
    const {
        isSearching,
        results: searchResults,
        error: searchError,
        search,
        trackClick,
        clearResults
    } = useSearch({
        enableLocation: true,
        debounceMs: 300,
        minQueryLength: 2
    });

    // Convert search results to StoreData format
    const convertSearchResultToStoreData = useCallback((searchResult: SearchResultStore): StoreData => {
        // Find full store data from our stores array
        const fullStore = stores.find(store => store.id === searchResult.id);

        if (fullStore) {
            return {
                ...fullStore,
                // Add search-specific metadata
                searchMetadata: {
                    matchType: searchResult.matchType,
                    relevanceScore: searchResult.relevanceScore,
                    matchedProducts: searchResult.matchedProducts,
                    distance: searchResult.distance
                }
            };
        }

        // Fallback if store not found in local data
        return {
            id: searchResult.id,
            name: searchResult.name,
            description: searchResult.description,
            location: {address: '', coordinates: {lat: 0, lng: 0}},
            deliveryOptions: {delivery: false, pickup: false, shipping: false},
            ownerId: '',
            searchMetadata: {
                matchType: searchResult.matchType,
                relevanceScore: searchResult.relevanceScore,
                matchedProducts: searchResult.matchedProducts,
                distance: searchResult.distance
            }
        } as StoreData;
    }, [stores]);

    // Search functionality is handled directly in useEffect below

    // Update filtered stores based on search results or traditional filtering
    const updateFilteredStores = useCallback(() => {
        console.log('🔍 Updating filtered stores:', {
            isUsingSearch,
            hasSearchResults: !!searchResults,
            searchResultsCount: searchResults?.stores?.length || 0,
            storesCount: stores.length
        });

        if (isUsingSearch && searchResults) {
            // Use search results
            console.log('🔍 Using search results:', searchResults.stores.length, 'stores');
            const searchBasedStores = searchResults.stores.map(convertSearchResultToStoreData);
            setFilteredStores(searchBasedStores);
        } else {
            // Use traditional filtering or all stores
            let filtered = stores;

            // Traditional client-side filtering for backward compatibility
            if (searchQuery && !isUsingSearch) {
                console.log('🔍 Using traditional filtering for:', searchQuery);
                filtered = filtered.filter(store =>
                    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    store.description?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            } else if (!searchQuery) {
                console.log('🔍 Showing all stores');
            }

            console.log('🔍 Setting filtered stores:', filtered.length);
            setFilteredStores(filtered);
        }
    }, [stores, searchQuery, isUsingSearch, searchResults, convertSearchResultToStoreData]);


    // Handle search query changes
    useEffect(() => {
        console.log('🔍 Search query changed:', searchQuery);

        if (!searchQuery || searchQuery.trim().length < 2) {
            console.log('🔍 Clearing search - query too short');
            setIsUsingSearch(false);
            setIsUsingFallbackSearch(false);
            clearResults();
            return;
        }

        console.log('🔍 Triggering search for:', searchQuery);
        setIsUsingSearch(true);

        // Try API search first, fallback to client-side search if it fails
        search(searchQuery, {
            filters: {
                onlyAvailable: true
            }
        }).catch(error => {
            console.warn('🔍 API search failed, falling back to client-side search:', error);
            setIsUsingFallbackSearch(true);

            // Fallback to client-side search
            const query = searchQuery.toLowerCase().trim();
            const clientSearchResults = stores.filter(store => {
                // Search in store name
                if (store.name.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in store description
                if (store.description?.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in products if available
                if (store.products && Array.isArray(store.products)) {
                    return store.products.some((product: any) =>
                        product.name?.toLowerCase().includes(query) ||
                        product.description?.toLowerCase().includes(query)
                    );
                }

                return false;
            });

            console.log('🔍 Client-side search found:', clientSearchResults.length, 'stores');

            // Add search metadata to indicate this is a fallback result
            const enhancedResults = clientSearchResults.map(store => ({
                ...store,
                searchMetadata: {
                    matchType: store.name.toLowerCase().includes(query) ? 'partial_name' : 'description' as const,
                    relevanceScore: store.name.toLowerCase().includes(query) ? 80 : 60,
                    matchedProducts: [],
                    distance: undefined
                }
            }));

            setFilteredStores(enhancedResults);
        });
    }, [searchQuery, search, clearResults, stores]);

    // Update filtered stores when search results or stores change
    useEffect(() => {
        updateFilteredStores();
    }, [updateFilteredStores]);

    // Listen for checkout event after login redirect
    useEffect(() => {
        const handleOpenCheckout = () => {
            setShouldOpenCheckout(true);
            setShowCart(true);
        };

        window.addEventListener('openCheckout', handleOpenCheckout);
        return () => window.removeEventListener('openCheckout', handleOpenCheckout);
    }, []);

    // Listen for profile updates to refresh user data
    useEffect(() => {
        const handleProfileUpdated = async () => {
            try {
                await refreshUserProfile();
            } catch (error) {
                console.error('Error refreshing profile after profile update event:', error);
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdated);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdated);
    }, [refreshUserProfile]);

    // Fetch stores only once on mount
    useEffect(() => {
        console.log('🚀 Component mounted, fetching stores once');
        fetchStores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty to run only once on mount

    const handleStoreClick = async (store: StoreData, position?: number) => {
        // Track search click if this came from search results
        if (isUsingSearch && searchResults && store.searchMetadata) {
            const searchResultStore: SearchResultStore = {
                id: store.id,
                name: store.name,
                description: store.description || '',
                matchType: store.searchMetadata.matchType,
                matchedProducts: store.searchMetadata.matchedProducts,
                relevanceScore: store.searchMetadata.relevanceScore,
                distance: store.searchMetadata.distance
            };

            await trackClick(searchResultStore, position || 0);
        }

        setSelectedStore(store);
        setShowStoreDetail(true);
    };

    const handleBackToList = () => {
        setShowStoreDetail(false);
        setSelectedStore(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            window.location.hash = '#';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleUserMenuClick = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleMenuNavigation = (path: string) => {
        setShowUserMenu(false);
        localStorage.setItem('backNavigationPath', '#');
        window.location.hash = path;
    };

    // Function to calculate distance between two points
    const calculateDistance = useCallback((store?: StoreData): string => {
        return calculateStoreDistance(userLocation, store);
    }, [userLocation]);

    // Show store detail view if a store is selected
    if (showStoreDetail && selectedStore) {
        return (
            <StoreDetail
                store={selectedStore}
                onBack={handleBackToList}
                onAddToCart={(product) => {
                    console.log('Add to cart:', product);
                }}
            />
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <HomeHeader
                isTestMode={isTestMode}
                isOffline={isOffline}
                currentUser={currentUser}
                userProfile={userProfile}
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

            {/* Hero Section */}
            <MarketplaceHero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                onLocationRequest={requestLocation}
                locationStatus={locationStatus}
                locationName={locationName}
            />

            {/* Featured Restaurants Section */}
            <StoreGrid
                stores={filteredStores}
                loading={loading}
                isSearching={isSearching}
                isUsingSearch={isUsingSearch}
                isUsingFallbackSearch={isUsingFallbackSearch}
                hasDataError={hasDataError}
                searchError={searchError}
                searchQuery={searchQuery}
                searchResults={searchResults}
                isOffline={isOffline}
                errorMessage={errorMessage}
                onStoreClick={handleStoreClick}
                onRetryFetch={retryFetch}
                onClearSearch={() => setSearchQuery('')}
                calculateDistance={calculateDistance}
                isStoreNew={isStoreNew}
                t={t}
            />

            {/* How It Works Section */}
            <HowItWorks t={t}/>

            {/* Our Story Section */}
            <OurStory t={t}/>

            {/* Footer with integrated business CTA */}
            <Footer/>

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={showCart}
                onClose={() => {
                    setShowCart(false);
                    setShouldOpenCheckout(false);
                }}
                openInCheckoutMode={shouldOpenCheckout}
            />

        </div>
    );
};
