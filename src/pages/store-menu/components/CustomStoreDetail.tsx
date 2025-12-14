import type * as React from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { Product, ProductStatus } from '../../../types/product';
import { StoreHeroSection } from './StoreHeroSection';
import { DeliverySchedule } from './DeliverySchedule';
import { MenuSection } from './MenuSection';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useProductsQuery } from '../../../hooks/queries/useProductsQuery';
import { useAuth } from '../../../context/AuthContext';
import { StoreHeader } from './StoreHeader';
import { VibrantBackground } from '../../../components/VibrantBackground/VibrantBackground';

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

interface CustomStoreDetailProps {
  store: StoreData;
  onBack: () => void;
}

export const CustomStoreDetail: React.FC<CustomStoreDetailProps> = ({ store, onBack }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { t, toggleLanguage } = useLanguage();
  const { currentUser, userProfile, logout, setRedirectAfterLogin } = useAuth();

  // Use TanStack Query to fetch products
  const { products: fetchedProducts, isLoading: loading } = useProductsQuery({ storeId: store.id });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeAboutTab, setActiveAboutTab] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Use fetched products or fallback to mock data - memoized to prevent infinite loop
  // Filter out draft products - only show active products to shoppers
  const products = useMemo(() => {
    if (fetchedProducts && fetchedProducts.length > 0) {
      return fetchedProducts.filter(product =>
        product.status === ProductStatus.ACTIVE || product.status === 'active'
      );
    }
    // Cache the filtered mock products to avoid creating new array on every render
    return mockProducts.filter(product =>
      product.storeId === store.id &&
      (product.status === ProductStatus.ACTIVE || product.status === 'active')
    );
  }, [fetchedProducts, store.id]);

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getDeliveryHoursToday = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];

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

    const businessHours = store.businessHours || (store as unknown as { storeBusinessHours?: Record<string, { open: string; close: string; closed?: boolean }> }).storeBusinessHours;
    const todayHours = businessHours?.[dayName] || businessHours?.[dayName.toLowerCase()];

    return todayHours && !todayHours.closed;
  };

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

  const getNextAvailableDelivery = () => {
    const schedule = getDeliverySchedule();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleMenuNavigation = (path: string) => {
    setShowUserMenu(false);
    localStorage.setItem('backNavigationPath', '/');
    navigate(path);
  };

  return (
    <VibrantBackground>
      <div className="min-h-screen">
        {/* Enhanced StoreHeader with all functionality */}
        <StoreHeader
        store={{
          name: store.name,
          rating: store.averageRating || 0,
          reviewCount: store.totalReviews || store.reviews?.length || 0,
          image: store.storeImage || store.imageUrl || ''
        }}
        onBack={onBack}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLanguageToggle={toggleLanguage}
        languageLabel={t('language.toggle')}
        cartItemCount={cart.summary.itemCount}
        onCartClick={() => { navigate('/cart'); }}
        currentUser={currentUser}
        userProfile={userProfile}
        onUserMenuClick={handleUserMenuClick}
        showUserMenu={showUserMenu}
        onLogout={handleLogout}
        onSignInClick={() => {
          setRedirectAfterLogin(window.location.pathname || '/');
          navigate('/login');
        }}
        t={t}
      />

      {/* Store Hero Section - Full width, extends behind header */}
      <StoreHeroSection store={store} />

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {/* Delivery Schedule Section */}
        <div className="mb-8">
          <DeliverySchedule store={store} />
        </div>

        {/* Menu Section */}
        <div className="mb-8">
          <MenuSection store={store} products={products} loading={loading} searchTerm={searchTerm} />
        </div>

        {/* Story Mode About Us Section (same as original) */}
        {(() => {
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

          if (aboutSections.length === 0) return null;

          return (
            <div className="mt-12 md:mt-16 lg:mt-20">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>

                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl md:rounded-[2rem] lg:rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
                  <div className="relative text-center py-12 md:py-16 lg:py-20 px-6 md:px-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-white/50 to-primary-500/10"></div>
                    <div className="relative space-y-4 md:space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/10 rounded-full border border-primary-400/20">
                        <BookOpen className="w-4 h-4 text-primary-400" />
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

                  <div className="px-6 md:px-8 lg:px-12 pb-12 md:pb-16 lg:pb-20">
                    <div className="max-w-5xl mx-auto">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
                          {aboutSections.length === 1 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                              <div className="p-6 md:p-8 lg:p-12 bg-gradient-to-br from-white to-gray-50 lg:border-r border-gray-200/50">
                                <div className="h-full flex flex-col justify-center space-y-6">
                                  <div className="space-y-4">
                                    <div className="text-xs uppercase tracking-wider text-primary-400 font-semibold">{t('storeDetail.ourStory')}</div>
                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900 leading-tight break-words">
                                      {aboutSections[0].title}
                                    </h3>
                                    <div className="w-16 h-0.5 bg-gradient-to-r from-primary-400 to-primary-500"></div>
                                  </div>
                                  <div className="max-h-64 md:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light break-words pr-2">
                                      {aboutSections[0].body}
                                    </p>
                                  </div>
                                </div>
                              </div>

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
                            <>
                              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                                <div className="p-6 md:p-8 lg:p-12 bg-gradient-to-br from-white to-gray-50 lg:border-r border-gray-200/50">
                                  <div className="h-full flex flex-col justify-center space-y-6">
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs uppercase tracking-wider text-primary-400 font-semibold">{t('storeDetail.ourStory')}</div>
                                        <div className="text-xs text-gray-500">
                                          {activeAboutTab + 1} of {aboutSections.length}
                                        </div>
                                      </div>
                                      <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900 leading-tight break-words">
                                        {aboutSections[activeAboutTab]?.title}
                                      </h3>
                                      <div className="w-16 h-0.5 bg-gradient-to-r from-primary-400 to-primary-500"></div>
                                    </div>
                                    <div className="max-h-64 md:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                      <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light break-words pr-2">
                                        {aboutSections[activeAboutTab]?.body}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                      {aboutSections.map((_, index) => (
                                        <button
                                          key={index}
                                          onClick={() => setActiveAboutTab(index)}
                                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            activeAboutTab === index
                                              ? 'bg-primary-400 w-6'
                                              : 'bg-gray-300 hover:bg-gray-400'
                                          }`}
                                          aria-label={`Go to story ${index + 1}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

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

                  <div className="text-center py-12 md:py-16 px-6 md:px-8 bg-gradient-to-r from-primary-400/5 via-white/50 to-primary-500/5">
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
                        className="btn-primary inline-flex items-center gap-2 text-sm md:text-base"
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
    </div>
    </VibrantBackground>
  );
};
