import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Star, User, ShoppingCart, Globe, LogOut, FileText, Shield, Settings, Truck, Users, Clock, ChevronRight, Receipt } from 'lucide-react';
import { StoreData } from '../types/store';
import { StoreDetail } from './StoreDetail';
import { CartSidebar } from './CartSidebar';
import { MarketplaceHero } from './MarketplaceHero';
import { Footer } from './Footer';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTestMode } from '../context/TestModeContext';
import { useDataProvider } from '../services/DataProvider';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { generateAllMockStores } from '../utils/mockDataGenerators';

// Helper function to check if a store is new (created less than a month ago)
const isStoreNew = (createdAt?: Date): boolean => {
  if (!createdAt) return false;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return createdAt > oneMonthAgo;
};

// Mock data for testing all badge scenarios
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockStores: StoreData[] = [
  {
    id: 'test-old-with-rating',
    name: 'Sabor Colombiano',
    description: 'Authentic Colombian cuisine with traditional flavors and family recipes passed down through generations',
    storeImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
    averageRating: 4.8,
    totalReviews: 124,
    location: {
      address: '123 Main St, Vancouver, BC',
      coordinates: { lat: 49.2827, lng: -123.1207 }
    },
    deliveryOptions: { delivery: true, pickup: true, shipping: false },
    deliveryCostWithDiscount: 4.99,
    minimumOrder: 25,
    aboutUsSections: [],
    ownerId: 'mock-owner-1',
    isVerified: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'test-new-without-rating',
    name: 'Casa de Arepas',
    description: 'Venezuelan comfort food with fresh arepas made daily',
    storeImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    totalReviews: 0,
    location: {
      address: '456 Oak Ave, Vancouver, BC',
      coordinates: { lat: 49.2845, lng: -123.1153 }
    },
    deliveryOptions: { delivery: true, pickup: true, shipping: false },
    deliveryCostWithDiscount: 3.99,
    minimumOrder: 20,
    aboutUsSections: [],
    ownerId: 'mock-owner-2',
    isVerified: false,
    createdAt: new Date()
  },
  {
    id: 'test-new-with-rating',
    name: 'Empanadas del Valle',
    description: 'Handcrafted empanadas with premium ingredients and bold flavors',
    storeImage: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&crop=center',
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&crop=center',
    averageRating: 4.9,
    totalReviews: 156,
    location: {
      address: '789 Pine St, Vancouver, BC',
      coordinates: { lat: 49.2750, lng: -123.1350 }
    },
    deliveryOptions: { delivery: true, pickup: true, shipping: false },
    deliveryCostWithDiscount: 5.99,
    minimumOrder: 30,
    aboutUsSections: [],
    ownerId: 'mock-owner-3',
    isVerified: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'test-old-without-rating',
    name: 'Mercado Latino',
    description: 'Traditional Latin American grocery and prepared foods - established but still building reputation',
    storeImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center',
    totalReviews: 0,
    location: {
      address: '321 Cedar Rd, Vancouver, BC',
      coordinates: { lat: 49.2611, lng: -123.1139 }
    },
    deliveryOptions: { delivery: true, pickup: true, shipping: false },
    deliveryCostWithDiscount: 6.99,
    minimumOrder: 35,
    aboutUsSections: [],
    ownerId: 'mock-owner-4',
    isVerified: false,
    createdAt: new Date('2024-05-01')
  }
];

export const Home = () => {
  const { cart } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const { setRedirectAfterLogin, currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const { isTestMode, toggleTestMode } = useTestMode();
  const dataProvider = useDataProvider();
  const { isOffline, hasNetworkError } = useNetworkStatus();
  const [selectedCountry, setSelectedCountry] = useState('colombia');
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showStoreDetail, setShowStoreDetail] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [locationName, setLocationName] = useState<string>('');
  const [showCart, setShowCart] = useState(false);
  const [shouldOpenCheckout, setShouldOpenCheckout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasDataError, setHasDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);

  // Define filterStores function first
  const filterStores = useCallback(() => {
    let filtered = stores;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  }, [stores, searchQuery]);


  // Filter stores when search or filters change
  useEffect(() => {
    filterStores();
  }, [stores, searchQuery, selectedCountry, filterStores]);

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

  // Define fetchStores first before any useEffect that uses it
  const fetchStores = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log('🚫 Fetch already in progress, skipping');
      return;
    }
    
    try {
      console.log('🔄 Starting fetchStores');
      setIsFetching(true);
      setLoading(true);
      setHasDataError(false);
      setErrorMessage('');
      
      if (isTestMode) {
        // Use mock data in test mode
        const mockStores = generateAllMockStores();
        setStores(mockStores);
      } else {
        // Check network connectivity first
        if (isOffline || hasNetworkError) {
          setHasDataError(true);
          setErrorMessage('No internet connection. Please check your network and try again.');
          setStores([]);
          setLoading(false);
          setIsFetching(false);
          return;
        }

        // Use real Firebase data
        const storesSnapshot = await dataProvider.getStores();
        const storesData = storesSnapshot.docs.map((doc: { id: string; data: () => unknown }) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
          };
        }) as StoreData[];
        
        if (storesData.length === 0) {
          setHasDataError(true);
          setErrorMessage('No stores available at the moment. Please try again later.');
        }
        
        setStores(storesData);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setHasDataError(true);
      
      // Determine error type and set appropriate message
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setErrorMessage('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('auth')) {
          setErrorMessage('Unable to load stores. Please try refreshing the page.');
        } else {
          setErrorMessage('Something went wrong. Please try again later.');
        }
      } else {
        setErrorMessage('Unable to connect to our services. Please check your internet connection.');
      }
      
      // DO NOT fallback to mock data - this was the problem!
      setStores([]);
    } finally {
      console.log('✅ Fetch complete');
      setLoading(false);
      setIsFetching(false);
    }
  }, [isTestMode, isOffline, hasNetworkError, dataProvider]);

  // Listen for hash changes to handle order history navigation
  useEffect(() => {
    const handleHashChange = () => {
      // Order history is now handled by App.tsx routing
      // No need to handle it here
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch stores only once on mount
  useEffect(() => {
    console.log('🚀 Component mounted, fetching stores once');
    fetchStores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  const handleRetryFetch = () => {
    fetchStores();
  };

  const handleStoreClick = (store: StoreData) => {
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

  // Function to get city name from coordinates
  const getCityName = async (lat: number, lng: number) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        return;
      }
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const city = addressComponents.find((component: { types: string[]; long_name: string }) => 
          component.types.includes('locality') || component.types.includes('administrative_area_level_1')
        );
        return city ? city.long_name : 'Unknown Location';
      }
    } catch (error) {
      console.error('Error getting city name:', error);
    }
    return 'Unknown Location';
  };

  // Function to simulate Vancouver location for testing
  const simulateVancouverLocation = async () => {
    setLocationStatus('requesting');
    const coords = {
      lat: 49.2827,
      lng: -123.1207
    };
    setUserLocation(coords);
    setLocationName('Vancouver, BC');
    setLocationStatus('granted');
  };

  // Function to request user location
  const requestLocation = () => {
    setLocationStatus('requesting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          const cityName = await getCityName(coords.lat, coords.lng);
          setLocationName(cityName);
          setLocationStatus('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          simulateVancouverLocation();
        }
      );
    } else {
      console.error('Geolocation is not supported');
      simulateVancouverLocation();
    }
  };

  // Function to calculate distance between two points
  const calculateDistance = useCallback((store?: StoreData): string => {
    if (!userLocation || !store?.location?.coordinates) {
      return 'Near you';
    }

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (store.location.coordinates.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (store.location.coordinates.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(store.location.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < 1) {
      return 'Less than 1 km';
    } else {
      return `${distance.toFixed(1)} km`;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 text-slate-100 backdrop-blur-md border-b border-white/10">
        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center">
            <span className="text-yellow-800 text-sm font-medium">
              🧪 {t('testMode.active')}
            </span>
          </div>
        )}

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-red-100 border-b border-red-200 px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 text-sm font-medium">
                You're offline. Please check your internet connection.
              </span>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => window.location.hash = '#'}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-xl font-bold">LuloCart</span>
              </button>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 p-2 text-slate-100 hover:text-brand rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{t('language.toggle')}</span>
              </button>

              {/* For Business Link */}
              <a
                href="#business"
                className="hidden md:flex items-center gap-2 p-2 text-slate-100 hover:text-brand rounded-lg transition-colors text-sm focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {t('nav.forBusiness')}
              </a>
              
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-slate-100 hover:text-brand rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.summary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cart.summary.itemCount > 9 ? '9+' : cart.summary.itemCount}
                  </span>
                )}
              </button>
              
              {/* User Account */}
              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={handleUserMenuClick}
                    className="flex items-center gap-2 p-2 text-slate-100 hover:text-brand rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                      {userProfile?.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-900" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                              {userProfile?.avatar ? (
                                <img
                                  src={userProfile.avatar}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {userProfile?.displayName || currentUser.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-sm text-gray-500">{currentUser.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button 
                            onClick={() => handleMenuNavigation('#profile/edit')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>{t('profile.editProfile')}</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              window.location.hash = '#order-history';
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>{t('orderHistory.title') || 'My Orders'}</span>
                          </button>

                          <div className="border-t border-gray-100 my-2"></div>

                          <button 
                            onClick={() => handleMenuNavigation('#terms')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Terms of Service</span>
                          </button>

                          <button 
                            onClick={() => handleMenuNavigation('#privacy')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Privacy Policy</span>
                          </button>

                          <div className="border-t border-gray-100 my-2"></div>

                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setRedirectAfterLogin(window.location.hash || '#');
                    window.location.hash = '#login';
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-100 hover:text-brand transition-colors focus-visible:ring-2 focus-visible:ring-brand/40"
                  title="Sign In"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
              
              {/* Test Mode Toggle */}
              {isTestMode && (
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer" title={t('testMode.tooltip')}>
                    <input
                      type="checkbox"
                      checked={isTestMode}
                      onChange={toggleTestMode}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-400"></div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/10 rounded-full border border-primary-400/20 mb-4">
            <span className="text-xs font-semibold text-primary-400">✨ {t('home.featuredRestaurants.badge')}</span>
          </div>
          <h2 className="text-h2 text-gray-900 mb-3 leading-tight">
            {t('home.featuredRestaurants.title')}
          </h2>
          <p className="body-font text-sm lg:text-base text-gray-600 max-w-xl mx-auto">
            {t('home.featuredRestaurants.description')}
          </p>
        </div>

        {/* Loading State with Shimmer */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="enhanced-card bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-square">
                  <div className="shimmer-loading w-full h-full"></div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="shimmer-loading h-4 rounded"></div>
                  <div className="shimmer-loading h-3 rounded w-3/4"></div>
                  <div className="shimmer-loading h-8 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="enhanced-card focus-ring group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden
                    hover:bg-white cursor-pointer transform"
                  tabIndex={0}
                  role="button"
                  aria-label={`View menu for ${store.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStoreClick(store);
                    }
                  }}
                >
                  {/* Store Image */}
                  <div className="relative h-24 lg:h-32 overflow-hidden">
                    {(store.storeImage || store.imageUrl) ? (
                      <img
                        src={store.storeImage || store.imageUrl}
                        alt={store.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (store.storeImage && store.imageUrl && target.src === store.storeImage) {
                            target.src = store.imageUrl;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1 flex items-center justify-center">
                            <span className="text-lg">🍽️</span>
                          </div>
                          <span className="text-gray-500 font-medium text-xs">Coming Soon</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Verification Badge */}
                    {store.isVerified && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-lg font-semibold">
                        <div className="flex items-center gap-1">
                          <span>✓</span>
                          <span className="hidden lg:inline text-xs">{t('shopper.verified')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge Logic */}
                    {isStoreNew(store.createdAt) ? (
                      <div className="absolute bottom-2 left-2 bg-primary-400 text-gray-800 rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center text-xs font-semibold">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          <span>{t('store.new')}</span>
                        </div>
                      </div>
                    ) : store.averageRating ? (
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center text-xs font-semibold">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-gray-800">
                            {store.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Store Info */}
                  <div className="p-2 lg:p-3 space-y-2">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm lg:text-base text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300 line-clamp-1">
                        {store.name}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 font-light">
                        {store.description || 'Experience exceptional cuisine crafted with passion and premium ingredients'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 text-primary-400" />
                        <span className="font-medium">{calculateDistance(store)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span className="font-medium">{store.totalReviews || 0} {t('shopper.reviews')}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {store.deliveryOptions?.delivery && (
                          <div className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-medium border border-emerald-200">
                            🚚 ${store.deliveryCostWithDiscount || 'Free'}
                          </div>
                        )}
                        {store.deliveryOptions?.pickup && (
                          <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-200">
                            📦 {t('shopper.pickup')}
                          </div>
                        )}
                      </div>
                      
                      {store.minimumOrder && (
                        <div className="text-center">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium">
                            Min: ${store.minimumOrder}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <div className="bg-gradient-to-r from-primary-400 to-primary-500 text-white text-center py-1.5 rounded-lg font-medium text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {t('shopper.viewMenuOrder')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                {hasDataError ? (
                  // Network/Data Error State
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                      {isOffline ? (
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636L5.636 18.364M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 12h8" />
                        </svg>
                      ) : (
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isOffline ? 'You\'re Offline' : 'Connection Problem'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {errorMessage}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={handleRetryFetch}
                        disabled={loading}
                        className="btn-primary focus-ring w-full px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Retrying...' : 'Try Again'}
                      </button>
                      {isOffline && (
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>• Check your internet connection</p>
                          <p>• Make sure you're connected to Wi-Fi or mobile data</p>
                          <p>• Try refreshing the page</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : searchQuery ? (
                  // Search Results Empty State
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any stores matching "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn-primary focus-ring px-6 py-2"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  // No Stores Available (but no error)
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Yet</h3>
                    <p className="text-gray-600">
                      There are no stores available in your area at the moment. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-white/50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-gray-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="body-font text-gray-600 max-w-2xl mx-auto">
              {t('home.howItWorks.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-h3 text-gray-900 mb-3">{t('home.howItWorks.step1.title')}</h3>
              <p className="body-font text-gray-600">{t('home.howItWorks.step1.description')}</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-h3 text-gray-900 mb-3">{t('home.howItWorks.step2.title')}</h3>
              <p className="body-font text-gray-600">{t('home.howItWorks.step2.description')}</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-h3 text-gray-900 mb-3">{t('home.howItWorks.step3.title')}</h3>
              <p className="body-font text-gray-600">{t('home.howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h1 text-gray-900 mb-6">
                {t('home.ourStory.title')}
              </h2>
              <p className="body-font text-lg text-gray-600 mb-6">
                {t('home.ourStory.description')}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-light text-gray-900 mb-2">500+</div>
                  <div className="text-gray-600">{t('home.ourStory.stat1')}</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900 mb-2">50K+</div>
                  <div className="text-gray-600">{t('home.ourStory.stat2')}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center"
                alt="Our Story"
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-primary-400/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with integrated business CTA */}
      <Footer />

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
