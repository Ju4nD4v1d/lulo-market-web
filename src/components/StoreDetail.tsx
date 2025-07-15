import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Instagram, Facebook, Twitter, Search, ShoppingCart, Truck, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { StoreData } from '../types/store';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { CartSidebar } from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTestMode } from '../context/TestModeContext';
import { useDataProvider } from '../services/DataProvider';

// Mock products for testing cart functionality
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Bandeja Paisa',
    description: 'Traditional Colombian platter with beans, rice, ground meat, chorizo, fried egg, plantain, and arepa',
    price: 18.99,
    category: 'hot',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-1',
    storeId: 'mock-1',
    averageRating: 4.8,
    reviewCount: 24,
    isPopular: true,
    preparationTime: '25-30 min',
    servingSize: 'Serves 1-2',
    allergens: ['gluten']
  },
  {
    id: 'prod-2',
    name: 'Arepas Rellenas',
    description: 'Fresh corn arepas filled with cheese, shredded beef, and black beans',
    price: 12.50,
    category: 'hot',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-2',
    storeId: 'mock-2',
    averageRating: 4.6,
    reviewCount: 18,
    preparationTime: '15-20 min',
    servingSize: 'Serves 1',
    allergens: ['dairy']
  },
  {
    id: 'prod-3',
    name: 'Empanadas Mixtas',
    description: 'Golden fried empanadas filled with seasoned beef and cheese (pack of 4)',
    price: 8.99,
    category: 'hot',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-3',
    storeId: 'mock-3',
    averageRating: 4.9,
    reviewCount: 32,
    isPopular: true,
    preparationTime: '10-15 min',
    servingSize: 'Serves 2-3',
    allergens: ['gluten', 'dairy']
  },
  {
    id: 'prod-4',
    name: 'Sancocho Tradicional',
    description: 'Hearty traditional soup with chicken, plantain, yuca, and corn',
    price: 15.75,
    category: 'hot',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-1',
    storeId: 'mock-1',
    averageRating: 4.7,
    reviewCount: 19,
    preparationTime: '20-25 min',
    servingSize: 'Serves 1',
    allergens: []
  },
  {
    id: 'prod-5',
    name: 'Tres Leches Cake',
    description: 'Authentic Venezuelan tres leches cake with cinnamon and vanilla',
    price: 6.50,
    category: 'baked',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-2',
    storeId: 'mock-2',
    averageRating: 4.5,
    reviewCount: 14,
    preparationTime: '5 min',
    servingSize: 'Serves 1',
    allergens: ['dairy', 'eggs', 'gluten']
  },
  {
    id: 'prod-6',
    name: 'Frozen Arepas (12 pack)',
    description: 'Pre-made frozen arepas ready to heat and fill at home',
    price: 9.99,
    category: 'frozen',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'],
    status: 'active',
    available: true,
    ownerId: 'mock-owner-3',
    storeId: 'mock-3',
    averageRating: 4.3,
    reviewCount: 8,
    preparationTime: '10 min (at home)',
    servingSize: 'Serves 6-12',
    allergens: ['gluten']
  }
];

interface StoreDetailProps {
  store: StoreData;
  onBack: () => void;
  onAddToCart?: (product: Product) => void;
}

export const StoreDetail: React.FC<StoreDetailProps> = ({ store, onBack, onAddToCart }) => {
  const { cart } = useCart();
  const { t } = useLanguage();
  const { isTestMode, toggleTestMode } = useTestMode();
  const { getProducts } = useDataProvider();
  
  // Debug log to check store location data
  console.log('Store data in StoreDetail:', store);
  console.log('Store location:', store.location);
  console.log('Store delivery hours:', store.deliveryHours || store.businessHours);
  console.log('Test mode:', isTestMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [activeAboutTab, setActiveAboutTab] = useState(0);

  const categories = [
    { id: 'all', name: t('category.all'), icon: '🍽️' },
    { id: 'hot', name: t('category.hot'), icon: '🔥' },
    { id: 'frozen', name: t('category.frozen'), icon: '❄️' },
    { id: 'baked', name: t('category.baked'), icon: '🍪' },
    { id: 'other', name: t('category.other'), icon: '📦' }
  ];

  // Define functions first
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Fetching products for store ${store.id} (Test mode: ${isTestMode})`);
      
      // Use DataProvider which handles both test mode and real data
      const querySnapshot = await getProducts(store.id);
      
      // Handle different response formats
      let productsData: Product[] = [];
      
      if (querySnapshot.docs) {
        // Firebase format
        productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
      } else if (Array.isArray(querySnapshot)) {
        // Direct array format (from DataProvider mock)
        productsData = querySnapshot as Product[];
      }
      
      console.log(`Found ${productsData.length} products for store ${store.id}:`, productsData);
      
      // If no products found and not in test mode, fallback to mock data
      if (productsData.length === 0 && !isTestMode) {
        console.log('No products found, using mock data fallback');
        const storeProducts = mockProducts.filter(product => product.storeId === store.id);
        setProducts(storeProducts);
      } else {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data on error
      const storeProducts = mockProducts.filter(product => product.storeId === store.id);
      setProducts(storeProducts);
    } finally {
      setLoading(false);
    }
  }, [store.id, isTestMode, getProducts]);

  const filterProducts = useCallback(() => {
    let filtered = products;

    // Filter out draft products (only show active and outOfStock products)
    filtered = filtered.filter(product => product.status !== 'draft');

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, filterProducts]);


  // Convert 24-hour time to 12-hour AM/PM format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getDeliveryHoursToday = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];
    
    // Check multiple possible field names and formats
    const businessHours = store.businessHours || (store as unknown as { storeBusinessHours?: Record<string, { open: string; close: string; closed?: boolean }> }).storeBusinessHours;
    const todayHours = businessHours?.[dayName] || businessHours?.[dayName.toLowerCase()];
    
    if (!todayHours || todayHours.closed) {
      return t('delivery.noDeliveryToday');
    }
    
    return `${formatTime12Hour(todayHours.open)} - ${formatTime12Hour(todayHours.close)}`;
  };

  const isDeliveryAvailable = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];
    
    // Check multiple possible field names and formats
    const businessHours = store.businessHours || (store as unknown as { storeBusinessHours?: Record<string, { open: string; close: string; closed?: boolean }> }).storeBusinessHours;
    const todayHours = businessHours?.[dayName] || businessHours?.[dayName.toLowerCase()];
    
    return todayHours && !todayHours.closed;
  };

  // Get all delivery days with formatted hours
  const getDeliverySchedule = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const businessHours = store.businessHours || (store as unknown as { storeBusinessHours?: Record<string, { open: string; close: string; closed?: boolean }> }).storeBusinessHours;
    
    if (!businessHours) return [];
    
    return daysOfWeek.map((day, index) => {
      const dayHours = businessHours[day] || businessHours[day.toLowerCase()];
      const dayKey = `days.${day.toLowerCase()}` as keyof typeof t;
      return {
        day: t(dayKey),
        dayIndex: index,
        isOpen: dayHours && !dayHours.closed,
        hours: dayHours && !dayHours.closed 
          ? `${formatTime12Hour(dayHours.open)} - ${formatTime12Hour(dayHours.close)}`
          : t('delivery.closed'),
        rawHours: dayHours
      };
    });
  };

  // Find next available delivery within 24 hours
  const getNextAvailableDelivery = () => {
    const schedule = getDeliverySchedule();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
    
    // Check today first if delivery is still available
    const todaySchedule = schedule[currentDay];
    if (todaySchedule?.isOpen && todaySchedule.rawHours) {
      const closeTime = todaySchedule.rawHours.close;
      const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
      const closeTimeHHMM = closeHours * 100 + closeMinutes;
      
      if (currentTime < closeTimeHHMM) {
        return {
          ...todaySchedule,
          isToday: true,
          timeUntil: t('delivery.availableNow')
        };
      }
    }
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const daySchedule = schedule[checkDay];
      
      if (daySchedule?.isOpen) {
        const daysUntil = i;
        const timeUntil = daysUntil === 1 ? t('delivery.tomorrow') : t('delivery.inDays').replace('{days}', daysUntil.toString());
        
        return {
          ...daySchedule,
          isToday: false,
          timeUntil,
          daysUntil
        };
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Enhanced Professional Header */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onBack}
              className="p-2 md:p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-105 group border border-gray-200 hover:border-[#C8E400]/50"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-[#C8E400] transition-colors" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 tracking-tight">{store.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base text-gray-500 font-medium hidden md:block">{t('storeDetail.subtitle')}</p>
                {isTestMode && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {t('testMode.active')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Test Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer" title={t('testMode.tooltip')}>
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={toggleTestMode}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C8E400]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8E400]"></div>
                <span className="ml-2 text-xs text-gray-600 font-medium hidden lg:inline">{t('testMode.toggle')}</span>
              </label>
            </div>
            
            {/* Enhanced Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-sm md:text-base">{t('shopper.header.cart')}</span>
              {cart.summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cart.summary.itemCount > 9 ? '9+' : cart.summary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {/* Enhanced Store Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8 relative">
          {/* Sophisticated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#C8E400]/3 via-white to-[#A3C700]/3"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C8E400]/5 to-transparent rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#A3C700]/5 to-transparent rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
          
          <div className="relative">
            {/* Professional Store Image with Overlay */}
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
              {(store.storeImage || store.imageUrl) ? (
                <div className="relative h-full">
                  <img 
                    src={store.storeImage || store.imageUrl} 
                    alt={store.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (store.storeImage && store.imageUrl && target.src === store.storeImage) {
                        target.src = store.imageUrl;
                      }
                    }}
                  />
                  {/* Elegant Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#C8E400]/20 to-[#A3C700]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <span className="text-gray-500 font-medium text-lg">{store.name}</span>
                  </div>
                </div>
              )}
              
              {/* Store Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-2 tracking-tight">{store.name}</h1>
                    {store.description && (
                      <p className="text-white/90 text-base md:text-lg font-light leading-relaxed max-w-2xl">{store.description}</p>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  {store.isVerified && (
                    <div className="bg-white/90 backdrop-blur-sm text-[#C8E400] px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/20">
                      <div className="flex items-center gap-2">
                        <span>✓</span>
                        <span className="hidden md:inline">{t('storeDetail.verifiedPartner')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Store Information Panel */}
            <div className="p-6 md:p-8 bg-white/50 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Rating & Reviews */}
                {store.averageRating && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 fill-white text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{store.averageRating.toFixed(1)}</div>
                        {store.totalReviews && (
                          <p className="text-sm text-gray-600">({store.totalReviews} reviews)</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(store.averageRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Status */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-900">
                        {isDeliveryAvailable() ? t('delivery.openNow') : t('delivery.closed')}
                      </div>
                      <div className="text-xs text-gray-600">{getDeliveryHoursToday()}</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    isDeliveryAvailable() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isDeliveryAvailable() ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    {isDeliveryAvailable() ? t('delivery.delivering') : t('delivery.notDelivering')}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-900">{t('storeDetail.location')}</div>
                      <div className="text-xs text-gray-600 max-w-48 line-clamp-2">
                        {store.location?.address || store.address || 'Address not available'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Social Media & Service Options */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Social Media Links */}
                {(store.instagram || store.facebook || store.twitter) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('storeDetail.followUs')}</h3>
                    <div className="flex flex-wrap gap-3">
                      {store.instagram && (
                        <a 
                          href={store.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                      {store.facebook && (
                        <a 
                          href={store.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </a>
                      )}
                      {store.twitter && (
                        <a 
                          href={store.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Options */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('storeDetail.serviceOptions')}</h3>
                  <div className="space-y-3">
                    {store.deliveryOptions?.delivery && (
                      <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-green-800 font-medium">{t('shopper.delivery')}</span>
                        </div>
                        <span className="text-green-900 font-bold">
                          {store.deliveryCostWithDiscount ? `$${store.deliveryCostWithDiscount}` : 'Available'}
                        </span>
                      </div>
                    )}
                    {store.deliveryOptions?.pickup && (
                      <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📦</span>
                          </div>
                          <span className="text-blue-800 font-medium">{t('shopper.pickup')}</span>
                        </div>
                        <span className="text-blue-900 font-bold">Free</span>
                      </div>
                    )}
                    {store.minimumOrder && (
                      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">$</span>
                          </div>
                          <span className="text-gray-800 font-medium">{t('shopper.minimumOrder')}</span>
                        </div>
                        <span className="text-gray-900 font-bold">${store.minimumOrder}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Delivery Schedule Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8E400]/10 rounded-full border border-[#C8E400]/20 mb-4">
                <Truck className="w-4 h-4 text-[#C8E400]" />
                <span className="text-sm font-medium text-[#C8E400]">{t('delivery.service')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">{t('delivery.schedule')}</h2>
              <p className="text-gray-600 text-sm md:text-base">{t('delivery.scheduleDescription')}</p>
            </div>

            {/* Next Available Delivery Highlight */}
            {(() => {
              const nextDelivery = getNextAvailableDelivery();
              if (nextDelivery) {
                return (
                  <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-semibold text-lg">
                          🚚 {t('delivery.nextAvailable')}
                        </p>
                        <p className="text-green-700 text-sm">
                          {nextDelivery.isToday ? t('delivery.today') : nextDelivery.day} • {nextDelivery.hours}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                          {nextDelivery.timeUntil}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
                    <p className="text-red-700 font-medium text-center">
                      ⚠️ {t('delivery.noService')}
                    </p>
                  </div>
                );
              }
            })()}

            {/* Enhanced Weekly Schedule */}
            <div className="grid gap-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('delivery.weeklySchedule')}</h3>
              <div className="grid gap-2">
                {getDeliverySchedule().map((dayInfo) => {
                  const isToday = dayInfo.dayIndex === new Date().getDay();
                  return (
                    <div 
                      key={dayInfo.day}
                      className={`flex justify-between items-center px-6 py-4 rounded-xl transition-all duration-300 ${
                        isToday 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                          : dayInfo.isOpen 
                          ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-50 border border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          dayInfo.isOpen ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {dayInfo.day}
                          {isToday && <span className="ml-2 text-blue-600 text-xs">({t('delivery.today')})</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          dayInfo.isOpen 
                            ? isToday ? 'text-blue-700' : 'text-gray-700'
                            : 'text-gray-500'
                        }`}>
                          {dayInfo.hours}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Products Section */}
        <div data-menu-section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8E400]/10 rounded-full border border-[#C8E400]/20 mb-6">
                <span className="text-sm font-medium text-[#C8E400]">✨ {t('storeDetail.menu')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 tracking-tight">{t('storeDetail.ourMenu')}</h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {t('storeDetail.menuDescription')}
              </p>
            </div>
            
            {/* Enhanced Search and Filters */}
            <div className="mb-10">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Professional Search Bar */}
                <div className="relative max-w-lg mx-auto">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('storeDetail.searchDishes')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-2xl 
                      focus:ring-2 focus:ring-[#C8E400]/30 focus:border-[#C8E400] focus:outline-none
                      bg-gray-50/50 backdrop-blur-sm shadow-sm placeholder:text-gray-400 text-base
                      transition-all duration-300 hover:shadow-md hover:bg-white"
                  />
                </div>

                {/* Elegant Category Filters */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-500 flex items-center gap-3 border-2 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white border-[#C8E400] shadow-lg scale-105'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:border-[#C8E400]/50 hover:shadow-md hover:scale-105 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          <div className="px-6 md:px-8 pb-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C8E400] border-t-transparent mx-auto"></div>
                  <div className="space-y-2">
                    <p className="text-gray-600 font-medium text-lg">{t('storeDetail.loadingMenu')}</p>
                    <p className="text-gray-500 text-sm">{t('storeDetail.preparingDelicious')}</p>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    storeId={store.id}
                    storeName={store.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-lg mx-auto space-y-6 px-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl md:text-2xl font-semibold text-gray-900">
                      {searchTerm || selectedCategory !== 'all' 
                        ? t('storeDetail.noDishesFound')
                        : t('storeDetail.menuComingSoon')
                      }
                    </h4>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                      {searchTerm || selectedCategory !== 'all' 
                        ? t('storeDetail.adjustSearch')
                        : t('storeDetail.checkBackSoon')
                      }
                    </p>
                  </div>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <span>{t('storeDetail.clearFilters')}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Story Mode About Us Section */}
        {(() => {
          // Map Firestore fields to about sections
          const aboutSections = [
            { 
              title: store.titleTabAboutFirst, 
              body: store.bodyTabAboutFirst, 
              image: store.imageTabAboutFirst 
            },
            { 
              title: store.titleTabAboutSecond, 
              body: store.bodyTabAboutSecond, 
              image: store.imageTabAboutSecond 
            },
            { 
              title: store.titleTabAboutThird, 
              body: store.bodyTabAboutThird, 
              image: store.imageTabAboutThird 
            }
          ].filter(section => section.title && section.body);

          // Don't show About Us section if no stories
          if (aboutSections.length === 0) return null;

          return (
            <div className="mt-12 md:mt-16 lg:mt-20">
              {/* Premium About Us Section - Story Mode Only */}
              <div className="relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8E400]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#A3C700]/5 rounded-full blur-3xl"></div>
                
                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl md:rounded-[2rem] lg:rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
                  {/* Elegant Header */}
                  <div className="relative text-center py-12 md:py-16 lg:py-20 px-6 md:px-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C8E400]/10 via-white/50 to-[#A3C700]/10"></div>
                    <div className="relative space-y-4 md:space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8E400]/10 rounded-full border border-[#C8E400]/20">
                        <BookOpen className="w-4 h-4 text-[#C8E400]" />
                        <span className="text-sm font-medium text-gray-700">{t('storeDetail.ourStory')}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 leading-tight">
                        {t('storeDetail.aboutUs')}
                      </h2>
                      <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        {t('storeDetail.discoverStory')}
                      </p>
                    </div>
                  </div>

                  {/* Book-Style Story Content */}
                  <div className="px-6 md:px-8 lg:px-12 pb-12 md:pb-16 lg:pb-20">
                    <div className="max-w-5xl mx-auto">
                      <div className="relative">
                        {/* Book-style layout */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
                          {aboutSections.length === 1 ? (
                            /* Single Story Layout */
                            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                              {/* Left page - Content */}
                              <div className="p-6 md:p-8 lg:p-12 bg-gradient-to-br from-white to-gray-50 lg:border-r border-gray-200/50">
                                <div className="h-full flex flex-col justify-center space-y-6">
                                  <div className="space-y-4">
                                    <div className="text-xs uppercase tracking-wider text-[#C8E400] font-semibold">{t('storeDetail.ourStory')}</div>
                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900 leading-tight break-words">
                                      {aboutSections[0].title}
                                    </h3>
                                    <div className="w-16 h-0.5 bg-gradient-to-r from-[#C8E400] to-[#A3C700]"></div>
                                  </div>
                                  <div className="max-h-64 md:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light break-words pr-2">
                                      {aboutSections[0].body}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Right page - Image */}
                              <div className="relative bg-gradient-to-br from-gray-50 to-white min-h-[300px] lg:min-h-0">
                                {aboutSections[0].image ? (
                                  <img 
                                    src={aboutSections[0].image} 
                                    alt={aboutSections[0].title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="text-center">
                                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                      <span className="text-gray-500 text-sm">{aboutSections[0].title}</span>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/5"></div>
                              </div>
                            </div>
                          ) : (
                            /* Multiple Stories Layout with Navigation */
                            <>
                              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                                {/* Left page - Content */}
                                <div className="p-6 md:p-8 lg:p-12 bg-gradient-to-br from-white to-gray-50 lg:border-r border-gray-200/50">
                                  <div className="h-full flex flex-col justify-center space-y-6">
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs uppercase tracking-wider text-[#C8E400] font-semibold">{t('storeDetail.ourStory')}</div>
                                        <div className="text-xs text-gray-500">
                                          {activeAboutTab + 1} of {aboutSections.length}
                                        </div>
                                      </div>
                                      <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900 leading-tight break-words">
                                        {aboutSections[activeAboutTab]?.title}
                                      </h3>
                                      <div className="w-16 h-0.5 bg-gradient-to-r from-[#C8E400] to-[#A3C700]"></div>
                                    </div>
                                    <div className="max-h-64 md:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                      <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light break-words pr-2">
                                        {aboutSections[activeAboutTab]?.body}
                                      </p>
                                    </div>
                                    
                                    {/* Story indicators */}
                                    <div className="flex items-center gap-2 pt-4">
                                      {aboutSections.map((_, index) => (
                                        <button
                                          key={index}
                                          onClick={() => setActiveAboutTab(index)}
                                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            activeAboutTab === index 
                                              ? 'bg-[#C8E400] w-6' 
                                              : 'bg-gray-300 hover:bg-gray-400'
                                          }`}
                                          aria-label={`Go to story ${index + 1}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right page - Image */}
                                <div className="relative bg-gradient-to-br from-gray-50 to-white min-h-[300px] lg:min-h-0">
                                  {aboutSections[activeAboutTab]?.image ? (
                                    <img 
                                      src={aboutSections[activeAboutTab].image} 
                                      alt={aboutSections[activeAboutTab].title}
                                      className="w-full h-full object-cover transition-opacity duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                      <div className="text-center">
                                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <span className="text-gray-500 text-sm">{aboutSections[activeAboutTab]?.title}</span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/5"></div>
                                </div>
                              </div>

                              {/* Navigation for multiple stories */}
                              <div className="flex justify-center gap-4 p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                                <button
                                  onClick={() => setActiveAboutTab(activeAboutTab > 0 ? activeAboutTab - 1 : aboutSections.length - 1)}
                                  className="flex items-center gap-2 px-4 py-2 bg-amber-100/80 text-amber-800 rounded-lg hover:bg-amber-200 transition-all duration-300 text-sm font-medium"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="hidden sm:inline">Previous</span>
                                </button>
                                
                                <button
                                  onClick={() => setActiveAboutTab(activeAboutTab < aboutSections.length - 1 ? activeAboutTab + 1 : 0)}
                                  className="flex items-center gap-2 px-4 py-2 bg-amber-100/80 text-amber-800 rounded-lg hover:bg-amber-200 transition-all duration-300 text-sm font-medium"
                                >
                                  <span className="hidden sm:inline">Next</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center py-12 md:py-16 px-6 md:px-8 bg-gradient-to-r from-[#C8E400]/5 via-white/50 to-[#A3C700]/5">
                    <div className="space-y-6">
                      <h4 className="text-xl md:text-2xl font-light text-gray-900">
                        {t('storeDetail.readyToTaste')}
                      </h4>
                      <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
                        {t('storeDetail.exploreMenu')}
                      </p>
                      <button 
                        onClick={() => {
                          const menuSection = document.querySelector('[data-menu-section]');
                          menuSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium text-sm md:text-base hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                      >
                        <span>{t('storeDetail.viewMenu')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};