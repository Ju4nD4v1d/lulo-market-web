import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, User, Navigation, ShoppingCart, Globe } from 'lucide-react';
import { StoreData } from '../types/store';
import { StoreDetail } from './StoreDetail';
import { CartSidebar } from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Mock data for fallback when no real stores exist
const mockStores: StoreData[] = [
  {
    id: 'mock-1',
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
    isVerified: true
  },
  {
    id: 'mock-2',
    name: 'Casa de Arepas',
    description: 'Venezuelan comfort food with fresh arepas made daily',
    storeImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    averageRating: 4.6,
    totalReviews: 89,
    location: {
      address: '456 Oak Ave, Vancouver, BC',
      coordinates: { lat: 49.2845, lng: -123.1153 }
    },
    deliveryOptions: { delivery: true, pickup: true, shipping: false },
    deliveryCostWithDiscount: 3.99,
    minimumOrder: 20,
    aboutUsSections: [],
    ownerId: 'mock-owner-2',
    isVerified: false
  },
  {
    id: 'mock-3',
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
    isVerified: true
  }
];

export const ShopperDashboard = () => {
  const { cart } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('colombia');
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showStoreDetail, setShowStoreDetail] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [showCart, setShowCart] = useState(false);

  const countries = [
    { id: 'colombia', name: t('shopper.filters.colombia'), active: true },
    { id: 'brazil', name: t('shopper.filters.brazil'), active: false },
    { id: 'venezuela', name: t('shopper.filters.venezuela'), active: false },
    { id: 'mexico', name: t('shopper.filters.mexico'), active: false }
  ];

  const foodTypes = [
    { id: 'hot', name: t('shopper.filters.hotFood'), icon: '🔥' },
    { id: 'frozen', name: t('shopper.filters.frozen'), icon: '❄️' },
    { id: 'baked', name: t('shopper.filters.bakedGoods'), icon: '🥖' },
    { id: 'other', name: t('shopper.filters.other'), icon: '🍽️' }
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
  }, [stores, searchQuery, selectedCountry, selectedFoodTypes, filterStores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const storesCollection = collection(db, 'stores');
      const storesSnapshot = await getDocs(storesCollection);
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoreData[];
      
      // Use real data if available, otherwise use mock data
      setStores(storesData.length > 0 ? storesData : mockStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores(mockStores); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const toggleFoodType = (typeId: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleStoreClick = (store: StoreData) => {
    setSelectedStore(store);
    setShowStoreDetail(true);
  };

  const handleBackToList = () => {
    setShowStoreDetail(false);
    setSelectedStore(null);
  };

  // Function to request user location
  const requestLocation = () => {
    setLocationStatus('requesting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationStatus('denied');
        }
      );
    } else {
      console.error('Geolocation is not supported');
      setLocationStatus('denied');
    }
  };

  // Function to calculate distance between two points
  const calculateDistance = useCallback((store?: StoreData): string => {
    if (!userLocation || !store?.location?.coordinates) {
      return '-- km';
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
      return `${Math.round(distance * 1000)} m`;
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
      {/* Premium Marketplace Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header with Depth */}
          <div className="px-6 py-6">
            {/* Header Content */}
            <div className="space-y-6">
              {/* Premium Title Row */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/logo_lulo.png" 
                      alt="Lulo Marketplace" 
                      className="h-16 w-auto object-contain"
                    />
                    <div>
                      <p className="text-lg text-gray-700 font-medium">
                        {t('shopper.header.tagline')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Language Switcher */}
                  <button 
                    onClick={toggleLanguage}
                    className="group relative text-gray-600 hover:text-[#C8E400] transition-all duration-300 p-2 rounded-xl hover:bg-gray-50"
                  >
                    <span className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('language.toggle')}</span>
                    </span>
                  </button>

                  {/* Location Button */}
                  <button
                    onClick={requestLocation}
                    disabled={locationStatus === 'requesting'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      locationStatus === 'granted' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : locationStatus === 'denied'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {locationStatus === 'requesting' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {locationStatus === 'granted' 
                        ? t('shopper.header.locationActive')
                        : locationStatus === 'denied'
                        ? t('shopper.header.locationDenied')
                        : t('shopper.header.getLocation')
                      }
                    </span>
                  </button>

                  {/* Current Location Display */}
                  <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {userLocation ? t('shopper.header.location') : t('shopper.header.vancouver')}
                    </span>
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Cart Button */}
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:border-[#C8E400] hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('shopper.header.cart')}</span>
                    {cart.summary.itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {cart.summary.itemCount > 99 ? '99+' : cart.summary.itemCount}
                      </span>
                    )}
                  </button>

                  {/* Login Button */}
                  <button 
                    onClick={() => window.location.hash = '#login'}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('shopper.header.login')}</span>
                    <span className="sm:hidden">{t('shopper.header.login')}</span>
                  </button>
                </div>
              </div>

              {/* Premium Search Bar */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={t('shopper.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 border-2 border-gray-200 rounded-2xl 
                    focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none
                    bg-white shadow-lg shadow-gray-100/50 placeholder:text-gray-400 text-base
                    transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
                />
              </div>

              {/* Premium Filter Section */}
              <div className="space-y-4">
                {/* Countries Row */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('shopper.filters.cuisinesByCountry')}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => country.active && setSelectedCountry(country.id)}
                        disabled={!country.active}
                        className={`
                          px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform
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

                {/* Food Types Row */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('shopper.filters.foodCategories')}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {foodTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleFoodType(type.id)}
                        className={`
                          px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform flex items-center gap-2
                          ${selectedFoodTypes.includes(type.id)
                            ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg shadow-[#C8E400]/30 scale-105'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#C8E400] hover:shadow-lg hover:scale-105 shadow-md'
                          }
                        `}
                        aria-label={`Filter by ${type.name}`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Store Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('shopper.featuredRestaurants')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden
                    hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer
                    focus:outline-none focus:ring-4 focus:ring-[#C8E400]/30 transform hover:scale-[1.02]"
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
                  {/* Premium Store Image */}
                  <div className="relative h-56 overflow-hidden">
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
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-3 py-2 rounded-full shadow-lg font-semibold">
                        <div className="flex items-center gap-1">
                          <span>✓</span>
                          <span>{t('shopper.verified')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                      <div className="flex items-center text-sm font-semibold">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-gray-800">{store.averageRating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Store Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-[#C8E400] transition-colors duration-300">
                        {store.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {store.description || 'Experience exceptional cuisine crafted with passion and premium ingredients'}
                      </p>
                    </div>

                    {/* Location and Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-2 text-[#C8E400]" />
                        <span className="text-sm font-medium">{calculateDistance(store)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span className="text-sm font-medium">{store.totalReviews || 0} {t('shopper.reviews')}</span>
                      </div>
                    </div>

                    {/* Premium Delivery Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {store.deliveryOptions?.delivery && (
                          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200">
                            🚚 {t('shopper.delivery')} ${store.deliveryCostWithDiscount || 'Free'}
                          </div>
                        )}
                        {store.deliveryOptions?.pickup && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200">
                            📦 {t('shopper.pickup')}
                          </div>
                        )}
                      </div>
                      
                      {store.minimumOrder && (
                        <div className="text-center">
                          <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">
                            {t('shopper.minimumOrder')}: ${store.minimumOrder}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Call to Action */}
                    <div className="pt-2">
                      <div className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white text-center py-3 rounded-xl font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {t('shopper.viewMenuOrder')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery || selectedFoodTypes.length > 0
                    ? t('shopper.noStoresFound')
                    : t('shopper.noStoresAvailable')}
                </p>
                {(searchQuery || selectedFoodTypes.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFoodTypes([]);
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