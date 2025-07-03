import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, User, Navigation, ShoppingCart, Globe } from 'lucide-react';
import { StoreData } from '../types/store';
import { StoreDetail } from './StoreDetail';
import { CartSidebar } from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="px-3 md:px-6 py-3 md:py-4">
            {/* Header Content */}
            <div className="space-y-3 md:space-y-4">
              {/* Mobile Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <img 
                    src="/logo_lulo.png" 
                    alt="Lulo Marketplace" 
                    className="h-8 md:h-12 w-auto object-contain"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm md:text-lg text-gray-700 font-medium">
                      {t('shopper.header.tagline')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Language Switcher - Mobile: Icon only */}
                  <button 
                    onClick={toggleLanguage}
                    className="text-gray-600 hover:text-[#C8E400] transition-all duration-300 p-1.5 md:p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only md:not-sr-only md:ml-1 text-sm font-medium">{t('language.toggle')}</span>
                  </button>

                  {/* Location Button - Mobile: Icon only */}
                  <button
                    onClick={requestLocation}
                    disabled={locationStatus === 'requesting'}
                    className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                      locationStatus === 'granted' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : locationStatus === 'denied'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {locationStatus === 'requesting' ? (
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-gray-400 border-t-transparent"></div>
                    ) : (
                      <Navigation className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                    <span className="hidden lg:inline">
                      {locationStatus === 'granted' 
                        ? t('shopper.header.locationActive')
                        : locationStatus === 'denied'
                        ? t('shopper.header.locationDenied')
                        : t('shopper.header.getLocation')
                      }
                    </span>
                  </button>

                  {/* Cart Button - Mobile: Icon only */}
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative flex items-center gap-1 md:gap-2 bg-white border border-gray-200 text-gray-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold hover:border-[#C8E400] hover:shadow-lg transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden md:inline text-xs md:text-sm">{t('shopper.header.cart')}</span>
                    {cart.summary.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                        {cart.summary.itemCount > 9 ? '9+' : cart.summary.itemCount}
                      </span>
                    )}
                  </button>

                  {/* Login Button */}
                  <button 
                    onClick={() => window.location.hash = '#login'}
                    className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-xs md:text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('shopper.header.login')}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Location Display */}
              <div className="md:hidden flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">
                  {locationName || t('shopper.header.vancouver')}
                </span>
              </div>

              {/* Mobile-First Search Bar */}
              <div className="relative">
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <input
                  type="text"
                  placeholder={t('shopper.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-4 md:pr-6 border-2 border-gray-200 rounded-xl md:rounded-2xl 
                    focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none
                    bg-white shadow-lg shadow-gray-100/50 placeholder:text-gray-400 text-sm md:text-base
                    transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
                />
              </div>

              {/* Mobile-First Filter Section */}
              <div className="space-y-3">
                {/* Countries Row */}
                <div className="space-y-2">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('shopper.filters.cuisinesByCountry')}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => country.active && setSelectedCountry(country.id)}
                        disabled={!country.active}
                        className={`
                          px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all duration-300 transform
                          ${country.active
                            ? selectedCountry === country.id
                              ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg shadow-[#C8E400]/30 scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#C8E400] hover:shadow-lg hover:scale-105 shadow-md'
                            : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                          }
                        `}
                        aria-label={`Filter by ${country.name}${!country.active ? ' (coming soon)' : ''}`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Store Grid */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {t('shopper.featuredRestaurants')}
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              {t('shopper.featuredDescription')}
            </p>
          </div>
        </div>

        {/* Premium Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#C8E400] border-t-transparent"></div>
              <span className="text-gray-600 font-medium">{t('shopper.loading')}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="group bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-gray-100 overflow-hidden
                    hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 md:duration-500 cursor-pointer
                    focus:outline-none focus:ring-4 focus:ring-[#C8E400]/30 transform hover:scale-[1.01] md:hover:scale-[1.02]"
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
                  {/* Mobile-First Store Image */}
                  <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
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
                          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                          <span className="text-gray-500 font-medium">Image Coming Soon</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Premium Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Verification Badge */}
                    {store.isVerified && (
                      <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg font-semibold">
                        <div className="flex items-center gap-1">
                          <span>✓</span>
                          <span className="hidden md:inline">{t('shopper.verified')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge Logic: New stores get "New" badge, rated stores get rating badge, old unrated stores get no badge */}
                    {isStoreNew(store.createdAt) ? (
                      /* New Badge for stores created less than a month ago */
                      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-[#C8E400] text-gray-800 rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-lg">
                        <div className="flex items-center text-xs md:text-sm font-semibold">
                          <Star className="w-3 h-3 md:w-4 md:h-4 fill-current mr-1" />
                          <span>{t('store.new')}</span>
                        </div>
                      </div>
                    ) : store.averageRating ? (
                      /* Rating Badge for stores with ratings */
                      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-white/95 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-lg">
                        <div className="flex items-center text-xs md:text-sm font-semibold">
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-gray-800">
                            {store.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ) : null /* No badge for old stores without ratings */}
                  </div>

                  {/* Mobile-First Store Info */}
                  <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 leading-tight group-hover:text-[#C8E400] transition-colors duration-300">
                        {store.name}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2">
                        {store.description || 'Experience exceptional cuisine crafted with passion and premium ingredients'}
                      </p>
                    </div>

                    {/* Location and Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#C8E400]" />
                        <span className="text-xs md:text-sm font-medium">{calculateDistance(store)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span className="text-xs md:text-sm font-medium">{store.totalReviews || 0} {t('shopper.reviews')}</span>
                      </div>
                    </div>

                    {/* Mobile-First Delivery Info */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {store.deliveryOptions?.delivery && (
                          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs font-semibold border border-emerald-200">
                            🚚 {t('shopper.delivery')} ${store.deliveryCostWithDiscount || 'Free'}
                          </div>
                        )}
                        {store.deliveryOptions?.pickup && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs font-semibold border border-blue-200">
                            📦 {t('shopper.pickup')}
                          </div>
                        )}
                      </div>
                      
                      {store.minimumOrder && (
                        <div className="text-center">
                          <span className="bg-gray-100 text-gray-600 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs font-medium">
                            {t('shopper.minimumOrder')}: ${store.minimumOrder}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Call to Action */}
                    <div className="pt-1 md:pt-2">
                      <div className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white text-center py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
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
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};