import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Phone, Globe, Instagram, Facebook, Twitter, Search, ShoppingCart } from 'lucide-react';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [showCart, setShowCart] = useState(false);

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

  const filterAndSortProducts = useCallback(() => {
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

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [store.id, fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, filterAndSortProducts]);

  const formatRating = (rating?: number) => {
    return rating ? rating.toFixed(1) : 'No rating';
  };

  const getBusinessHoursToday = () => {
    const dayMap: { [key: string]: string } = {
      'sunday': 'sunday',
      'monday': 'monday',
      'tuesday': 'tuesday',
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday'
    };
    
    const dayName = Object.keys(dayMap)[new Date().getDay()];
    const todayHours = store.businessHours?.[dayName];
    
    if (!todayHours || todayHours.closed) {
      return 'Closed today';
    }
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Premium Header */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-[#C8E400] transition-colors" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('storeDetail.title')}</h1>
              <p className="text-gray-600 font-medium">{t('storeDetail.subtitle')}</p>
            </div>
            
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Premium Store Info Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-12 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C8E400]/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          
          <div className="relative flex flex-col lg:flex-row gap-8">
            {/* Premium Store Image */}
            <div className="w-full lg:w-80 h-64 rounded-2xl overflow-hidden shadow-xl">
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
                    <span className="text-gray-500 font-medium">Restaurant Image</span>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Store Details */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{store.name}</h2>
                    {store.description && (
                      <p className="text-gray-600 text-lg leading-relaxed">{store.description}</p>
                    )}
                  </div>
                  
                  {/* Premium Badges */}
                  <div className="flex flex-col gap-2">
                    {store.isVerified && (
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                        <div className="flex items-center gap-2">
                          <span>✓</span>
                          <span>{t('storeDetail.verifiedPartner')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Premium Rating Display */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-3 rounded-2xl border border-yellow-200">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <div>
                      <span className="font-bold text-xl text-gray-900">{formatRating(store.averageRating)}</span>
                      {store.totalReviews && (
                        <p className="text-sm text-gray-600 font-medium">({store.totalReviews} reviews)</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 rounded-2xl border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{getBusinessHoursToday()}</p>
                      <p className="text-xs text-gray-600">{t('storeDetail.todaysHours')}</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{getBusinessHoursToday()}</span>
                </div>

                {/* Location */}
                {store.location && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{store.location.address}</span>
                  </div>
                )}
              </div>

              {/* Contact and Social */}
              <div className="flex flex-wrap gap-4">
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Phone className="w-4 h-4" />
                    {store.phone}
                  </a>
                )}
                {store.website && (
                  <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {store.instagram && (
                  <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {store.facebook && (
                  <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                )}
                {store.twitter && (
                  <a href={store.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
              </div>

              {/* Delivery Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {store.deliveryOptions?.delivery && (
                    <div>
                      <span className="text-gray-500">Delivery:</span>
                      <span className="ml-1 font-medium">
                        {store.deliveryCostWithDiscount ? `$${store.deliveryCostWithDiscount}` : 'Available'}
                      </span>
                    </div>
                  )}
                  {store.deliveryOptions?.pickup && (
                    <div>
                      <span className="text-gray-500">Pickup:</span>
                      <span className="ml-1 font-medium">Available</span>
                    </div>
                  )}
                  {store.minimumOrder && (
                    <div>
                      <span className="text-gray-500">Min Order:</span>
                      <span className="ml-1 font-medium">${store.minimumOrder}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span className="ml-1 font-medium">
                      {[
                        store.paymentMethods?.cash && 'Cash',
                        store.paymentMethods?.card && 'Card',
                        store.paymentMethods?.transfer && 'Transfer'
                      ].filter(Boolean).join(', ') || 'Various'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Products Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="mb-8">
            <div className="text-center space-y-4 mb-8">
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{t('storeDetail.ourMenu')}</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('storeDetail.menuDescription')}
              </p>
            </div>
            
            {/* Premium Search and Filters */}
            <div className="space-y-6">
              {/* Premium Search */}
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for your favorite dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 border-2 border-gray-200 rounded-2xl 
                    focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none
                    bg-white shadow-lg placeholder:text-gray-400 text-base
                    transition-all duration-300 hover:shadow-xl"
                />
              </div>

              {/* Premium Filter Section */}
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Category Filter */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide text-center lg:text-left">
                    Categories
                  </h4>
                  <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white shadow-lg shadow-[#C8E400]/30 scale-105'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#C8E400] hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide text-center lg:text-left">
                    Sort By
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none
                      bg-white shadow-lg font-medium text-gray-700 hover:shadow-xl transition-all duration-300"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price">Price Low-High</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#C8E400] border-t-transparent"></div>
                <span className="text-gray-600 font-medium">Loading delicious menu items...</span>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'No dishes found'
                      : 'Menu coming soon'
                    }
                  </h4>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                      : 'This restaurant is still preparing their menu. Check back soon for delicious options!'
                    }
                  </p>
                </div>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};