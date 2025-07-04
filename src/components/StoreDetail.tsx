import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Instagram, Facebook, Twitter, Search, ShoppingCart, Truck, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { StoreData } from '../types/store';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { CartSidebar } from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

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
  
  // Debug log to check store location data
  console.log('Store data in StoreDetail:', store);
  console.log('Store location:', store.location);
  console.log('Store delivery hours:', store.deliveryHours || store.businessHours);
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
      const q = query(
        collection(db, 'products'),
        where('storeId', '==', store.id),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Use real data if available, otherwise use mock data filtered by store
      const storeProducts = productsData.length > 0 
        ? productsData 
        : mockProducts.filter(product => product.storeId === store.id);
      
      setProducts(storeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data on error
      const storeProducts = mockProducts.filter(product => product.storeId === store.id);
      setProducts(storeProducts);
    } finally {
      setLoading(false);
    }
  }, [store.id]);

  const filterProducts = useCallback(() => {
    let filtered = products;

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
  }, [store.id, fetchProducts]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Mobile-First Header */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={onBack}
              className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-[#C8E400] transition-colors" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">{t('storeDetail.title')}</h1>
              <p className="text-sm md:text-base text-gray-600 font-medium hidden md:block">{t('storeDetail.subtitle')}</p>
            </div>
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-1 md:gap-2 bg-white border-2 border-gray-200 text-gray-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold hover:border-[#C8E400] hover:shadow-lg transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline text-xs md:text-sm">{t('shopper.header.cart')}</span>
              {cart.summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                  {cart.summary.itemCount > 9 ? '9+' : cart.summary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {/* Mobile-First Store Info Section */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8 mb-6 md:mb-8 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-br from-[#C8E400]/5 to-transparent rounded-full -translate-y-16 translate-x-16 md:-translate-y-32 md:translate-x-32"></div>
          
          <div className="relative flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Mobile-First Store Image */}
            <div className="w-full lg:w-80 h-48 md:h-56 lg:h-64 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
              {(store.storeImage || store.imageUrl) ? (
                <img 
                  src={store.storeImage || store.imageUrl} 
                  alt={store.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-3xl">🍽️</span>
                    </div>
                    <span className="text-gray-500 font-medium">{t('storeDetail.title')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile-First Store Details */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <div>
                <div className="flex items-start gap-2 md:gap-4 mb-3 md:mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-3 tracking-tight leading-tight">{store.name}</h2>
                    {store.description && (
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light">{store.description}</p>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  {store.isVerified && (
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold shadow-lg">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span>✓</span>
                        <span className="hidden md:inline">{t('storeDetail.verifiedPartner')}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mobile-First Rating Display */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                  {store.averageRating && (
                    <div className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl border border-yellow-200">
                      <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                      <div>
                        <span className="font-bold text-base md:text-lg lg:text-xl text-gray-900">{store.averageRating.toFixed(1)}</span>
                        {store.totalReviews && (
                          <p className="text-xs md:text-sm text-gray-600 font-medium">({store.totalReviews} reviews)</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isDeliveryAvailable() && (
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl border bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-sm md:text-base text-green-900">{getDeliveryHoursToday()}</p>
                        <p className="text-xs text-gray-600">{t('delivery.deliveryHours')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {store.location?.address || store.address || 'Address not available'}
                  </span>
                </div>
              </div>

              {/* Social Media Only */}
              <div className="flex flex-wrap gap-3">
                {store.instagram && (
                  <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs md:text-sm text-pink-600 hover:underline">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {store.facebook && (
                  <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs md:text-sm text-blue-700 hover:underline">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                )}
                {store.twitter && (
                  <a href={store.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs md:text-sm text-blue-500 hover:underline">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
              </div>

              {/* Comprehensive Delivery Service Info */}
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-4 h-4 text-[#C8E400]" />
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">{t('delivery.service')}</h4>
                </div>

                {/* Next Available Delivery Highlight */}
                {(() => {
                  const nextDelivery = getNextAvailableDelivery();
                  if (nextDelivery) {
                    return (
                      <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-800 font-semibold text-sm">
                              🚚 {t('delivery.nextAvailable')}
                            </p>
                            <p className="text-green-700 text-xs">
                              {nextDelivery.isToday ? t('delivery.today') : nextDelivery.day} • {nextDelivery.hours}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              {nextDelivery.timeUntil}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-red-700 font-medium text-sm text-center">
                          ⚠️ {t('delivery.noService')}
                        </p>
                      </div>
                    );
                  }
                })()}

                {/* Full Weekly Delivery Schedule */}
                <div className="mb-4">
                  <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2">{t('delivery.weeklySchedule')}</h5>
                  <div className="space-y-2">
                    {getDeliverySchedule().map((dayInfo) => {
                      const isToday = dayInfo.dayIndex === new Date().getDay();
                      return (
                        <div 
                          key={dayInfo.day}
                          className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                            isToday 
                              ? 'bg-blue-50 border border-blue-200'
                              : dayInfo.isOpen 
                              ? 'bg-gray-50 border border-gray-200'
                              : 'bg-gray-50 border border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs md:text-sm font-medium ${
                              isToday ? 'text-blue-800' : 'text-gray-700'
                            }`}>
                              {dayInfo.day}
                              {isToday && <span className="ml-1 text-blue-600">({t('delivery.today')})</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs md:text-sm ${
                              dayInfo.isOpen 
                                ? isToday ? 'text-blue-700 font-medium' : 'text-gray-700'
                                : 'text-gray-500'
                            }`}>
                              {dayInfo.hours}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${
                              dayInfo.isOpen ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Service Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  {store.deliveryOptions?.delivery && (
                    <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <span className="text-green-700 font-medium">🚚 {t('shopper.delivery')}</span>
                      <span className="text-green-900 font-semibold">
                        {store.deliveryCostWithDiscount ? `$${store.deliveryCostWithDiscount}` : 'Available'}
                      </span>
                    </div>
                  )}
                  {store.deliveryOptions?.pickup && (
                    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <span className="text-blue-700 font-medium">📦 {t('shopper.pickup')}</span>
                      <span className="text-blue-900 font-semibold">Free</span>
                    </div>
                  )}
                  {store.minimumOrder && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 md:col-span-2">
                      <span className="text-gray-700 font-medium">{t('shopper.minimumOrder')}</span>
                      <span className="text-gray-900 font-semibold">${store.minimumOrder}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Products Section */}
        <div data-menu-section className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C8E400]/10 rounded-full border border-[#C8E400]/20 mb-4">
                <span className="text-xs font-medium text-[#C8E400]">✨ Menu</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 tracking-tight leading-tight">{t('storeDetail.ourMenu')}</h3>
              <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-light">
                {t('storeDetail.menuDescription')}
              </p>
            </div>
            
            {/* Mobile-First Search and Filters */}
            <div className="space-y-4 md:space-y-6">
              {/* Enhanced Search */}
              <div className="relative max-w-md mx-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={t('storeDetail.searchDishes')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 border border-gray-200/60 rounded-2xl 
                    focus:ring-2 focus:ring-[#C8E400]/30 focus:border-[#C8E400]/50 focus:outline-none
                    bg-white/80 backdrop-blur-sm shadow-sm placeholder:text-gray-400 text-sm
                    transition-all duration-300 hover:shadow-md hover:bg-white"
                />
              </div>

              {/* Enhanced Category Filter */}
              <div className="space-y-4">
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full font-medium text-xs transition-all duration-500 flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg scale-105'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:border-[#C8E400]/50 hover:shadow-md hover:scale-105 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-sm">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-First Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12 md:py-20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-3 border-[#C8E400] border-t-transparent"></div>
                <span className="text-gray-600 font-medium text-sm md:text-base">{t('storeDetail.loadingMenu')}</span>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
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
            <div className="text-center py-12 md:py-20">
              <div className="max-w-md mx-auto space-y-3 md:space-y-4 px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl md:text-3xl">🍽️</span>
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== 'all' 
                      ? t('storeDetail.noDishesFound')
                      : t('storeDetail.menuComingSoon')
                    }
                  </h4>
                  <p className="text-sm md:text-base text-gray-600">
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
                    className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm md:text-base"
                  >
                    {t('storeDetail.clearFilters')}
                  </button>
                )}
              </div>
            </div>
          )}
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