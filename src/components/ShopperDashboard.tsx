import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, User, Navigation, ShoppingCart, Globe, LogOut, FileText, Shield, Settings, History, ChevronDown } from 'lucide-react';
import { StoreData } from '../types/store';
import { StoreDetail } from './StoreDetail';
import { CartSidebar } from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper function to check if a store is new (created less than a month ago)
const isStoreNew = (createdAt?: Date): boolean => {
  if (!createdAt) return false;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return createdAt > oneMonthAgo;
};

// Mock data for testing all badge scenarios
const mockStores: StoreData[] = [
  // TEST CASE 1: Old store WITH rating - Should show rating badge (4.8)
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
    createdAt: new Date('2024-01-15') // Old store (more than a month ago)
  },
  // TEST CASE 2: New store WITHOUT rating - Should show "New" badge
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
    createdAt: new Date() // New store (just created)
  },
  // TEST CASE 3: New store WITH rating - Should show "New" badge (priority over rating)
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
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // New store (15 days ago) WITH rating
  },
  // TEST CASE 4: Old store WITHOUT rating - Should show NO badge
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
    createdAt: new Date('2024-05-01') // Old store (more than a month ago) WITHOUT rating
  }
];

export const ShopperDashboard = () => {
  const { cart } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const { setRedirectAfterLogin, currentUser, userProfile, logout, refreshUserProfile } = useAuth();
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

  const countries = [
    { id: 'colombia', name: t('shopper.filters.colombia'), active: true },
    { id: 'brazil', name: t('shopper.filters.brazil'), active: false },
    { id: 'venezuela', name: t('shopper.filters.venezuela'), active: false },
    { id: 'mexico', name: t('shopper.filters.mexico'), active: false }
  ];


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

    // TODO: Add country filtering when country field is added to StoreData
    // TODO: Add food type filtering based on store categories

    setFilteredStores(filtered);
  }, [stores, searchQuery]);

  // Fetch stores from Firestore
  useEffect(() => {
    fetchStores();
  }, []);

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

  const fetchStores = async () => {
    try {
      setLoading(true);
      const storesCollection = collection(db, 'stores');
      const storesSnapshot = await getDocs(storesCollection);
      const storesData = storesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firebase Timestamp to JavaScript Date
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        };
      }) as StoreData[];
      
      console.log('Firebase stores data:', storesData);
      
      // Use real data if available, otherwise use mock data
      setStores(storesData.length > 0 ? storesData : mockStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores(mockStores); // Fallback to mock data
    } finally {
      setLoading(false);
    }
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
      // Redirect to shopper dashboard
      window.location.hash = '#shopper-dashboard';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleMenuNavigation = (path: string) => {
    setShowUserMenu(false);
    // Store back navigation path in localStorage instead of redirectAfterLogin
    localStorage.setItem('backNavigationPath', '#shopper-dashboard');
    window.location.hash = path;
  };

  // Function to get city name from coordinates
  const getCityName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDrqIE1Zs8YVmaZUdrJgCaOiKIczdz5Hag`);
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
    // Simulate a location in downtown Vancouver
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
          // Fallback to Vancouver for demo
          simulateVancouverLocation();
        }
      );
    } else {
      console.error('Geolocation is not supported');
      // Fallback to Vancouver for demo
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
          // TODO: Implement cart functionality
          console.log('Add to cart:', product);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section - Logo & Tagline */}
            <div className="flex items-center gap-3 lg:gap-6">
              <div className="flex items-center gap-2 lg:gap-3">
                <button
                  onClick={() => {
                    // Clear back navigation path since we're going to landing page
                    localStorage.removeItem('backNavigationPath');
                    window.location.hash = '#';
                  }}
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <img 
                    src="/logo_lulo.png" 
                    alt="Lulo" 
                    className="h-12 lg:h-14 w-auto object-contain"
                  />
                </button>
              </div>
              <div className="hidden lg:block h-6 w-px bg-gray-300"></div>
              <div className="hidden lg:block">
                <p className="text-sm text-gray-600 font-light">
                  {t('shopper.header.tagline')}
                </p>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{t('language.toggle')}</span>
              </button>

              {/* Location */}
              <button
                onClick={requestLocation}
                disabled={locationStatus === 'requesting'}
                className={`flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  locationStatus === 'granted' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                    : locationStatus === 'denied'
                    ? 'bg-red-50 text-red-700 border border-red-200/60'
                    : 'bg-gray-50 text-gray-700 border border-gray-200/60 hover:bg-gray-100'
                }`}
              >
                {locationStatus === 'requesting' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">
                  {locationStatus === 'granted' 
                    ? locationName || 'Location Set'
                    : locationStatus === 'denied'
                    ? 'Location Denied'
                    : 'Get Location'
                  }
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-1.5 bg-white border border-gray-200/60 text-gray-700 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-medium hover:border-[#C8E400]/50 hover:shadow-md transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{t('shopper.header.cart')}</span>
                {cart.summary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cart.summary.itemCount > 9 ? '9+' : cart.summary.itemCount}
                  </span>
                )}
              </button>

              {/* User Account */}
              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={handleUserMenuClick}
                    className="flex items-center gap-2 bg-white border border-gray-200/60 text-gray-700 px-3 py-2 rounded-lg font-medium hover:border-[#C8E400]/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
                      {userProfile?.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#C8E400] to-[#A3C700] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm">
                      {userProfile?.displayName || currentUser.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                        {/* User Info Header */}
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
                                <div className="w-full h-full bg-gradient-to-br from-[#C8E400] to-[#A3C700] flex items-center justify-center">
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

                        {/* Menu Items */}
                        <div className="py-2">
                          <button 
                            onClick={() => handleMenuNavigation('#profile/edit')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              // TODO: Implement Order History functionality
                              alert('Order History feature coming soon!');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-50 transition-colors cursor-not-allowed"
                          >
                            <History className="w-4 h-4" />
                            <span>Order History</span>
                            <span className="text-xs ml-auto bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>
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
                    setRedirectAfterLogin(window.location.hash || '#shopper-dashboard');
                    window.location.hash = '#login';
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="pb-4 lg:pb-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={t('shopper.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 lg:h-14 pl-12 pr-4 border border-gray-200/60 rounded-2xl 
                    focus:ring-2 focus:ring-[#C8E400]/30 focus:border-[#C8E400]/50 focus:outline-none
                    bg-white/80 backdrop-blur-sm shadow-sm placeholder:text-gray-400 text-sm lg:text-base
                    transition-all duration-300 hover:shadow-md hover:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Country Filter Section */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
          <div className="text-center mb-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Cuisines by Country</h2>
            <div className="flex justify-center gap-3 flex-wrap">
              {countries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => country.active && setSelectedCountry(country.id)}
                  disabled={!country.active}
                  className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-medium text-sm transition-all duration-500 ${
                    country.active
                      ? selectedCountry === country.id
                        ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg scale-105'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:border-[#C8E400]/50 hover:shadow-md hover:scale-105'
                      : 'bg-gray-100/60 border border-gray-200/40 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label={`Filter by ${country.name}${!country.active ? ' (coming soon)' : ''}`}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Restaurants Section */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 lg:pb-20">
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8E400]/10 rounded-full border border-[#C8E400]/20 mb-4">
            <span className="text-xs font-semibold text-[#C8E400]">✨ Featured Restaurants</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-3 leading-tight">
            {t('shopper.featuredRestaurants')}
          </h2>
          <p className="text-sm lg:text-base text-gray-600 max-w-xl mx-auto font-light">
            {t('shopper.featuredDescription')}
          </p>
        </div>

        {/* Premium Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8E400] border-t-transparent"></div>
              <span className="text-gray-600 font-light text-sm">{t('shopper.loading')}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden
                    hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-[#C8E400]/30 transform hover:scale-105"
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
                  {/* Compact Store Image */}
                  <div className="relative h-24 lg:h-32 overflow-hidden">
                    {(store.storeImage || store.imageUrl) ? (
                      <img
                        src={store.storeImage || store.imageUrl}
                        alt={store.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // If storeImage fails, try imageUrl as fallback
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
                    
                    {/* Premium Overlays */}
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
                    
                    {/* Badge Logic: New stores get "New" badge, rated stores get rating badge, old unrated stores get no badge */}
                    {isStoreNew(store.createdAt) ? (
                      /* New Badge for stores created less than a month ago */
                      <div className="absolute bottom-2 left-2 bg-[#C8E400] text-gray-800 rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center text-xs font-semibold">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          <span>{t('store.new')}</span>
                        </div>
                      </div>
                    ) : store.averageRating ? (
                      /* Rating Badge for stores with ratings */
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                        <div className="flex items-center text-xs font-semibold">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-gray-800">
                            {store.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ) : null /* No badge for old stores without ratings */}
                  </div>

                  {/* Compact Store Info */}
                  <div className="p-2 lg:p-3 space-y-2">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm lg:text-base text-gray-900 leading-tight group-hover:text-[#C8E400] transition-colors duration-300 line-clamp-1">
                        {store.name}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 font-light">
                        {store.description || 'Experience exceptional cuisine crafted with passion and premium ingredients'}
                      </p>
                    </div>

                    {/* Compact Location and Reviews */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 text-[#C8E400]" />
                        <span className="font-medium">{calculateDistance(store)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span className="font-medium">{store.totalReviews || 0} {t('shopper.reviews')}</span>
                      </div>
                    </div>

                    {/* Compact Delivery Info */}
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

                    {/* Compact Call to Action */}
                    <div className="pt-1">
                      <div className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white text-center py-1.5 rounded-lg font-medium text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {t('shopper.viewMenuOrder')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? t('shopper.noStoresFound')
                    : t('shopper.noStoresAvailable')}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {t('shopper.clearFilters')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

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