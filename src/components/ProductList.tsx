import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Star, ShoppingCart, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
  store?: string;
  category?: string;
}

interface ProductListProps {
  onBack?: () => void;
  onProductClick?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onBack, onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const mockProducts: Product[] = [
    { id: '1', name: 'Bandeja Paisa', price: 18.99, images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'], averageRating: 4.8, reviewCount: 24, store: 'Sabor Colombiano', category: 'Colombian' },
    { id: '2', name: 'Arepas Rellenas', price: 12.50, images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'], averageRating: 4.6, reviewCount: 18, store: 'Casa de Arepas', category: 'Venezuelan' },
    { id: '3', name: 'Empanadas Mixtas', price: 8.99, images: ['https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop'], averageRating: 4.9, reviewCount: 32, store: 'Empanadas del Valle', category: 'Colombian' },
    { id: '4', name: 'Tres Leches Cake', price: 6.50, images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'], averageRating: 4.5, reviewCount: 14, store: 'Sweet Delights', category: 'Dessert' },
    { id: '5', name: 'Sancocho Tradicional', price: 15.75, images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'], averageRating: 4.7, reviewCount: 19, store: 'Sabor Colombiano', category: 'Colombian' },
    { id: '6', name: 'Tequeños', price: 9.99, images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'], averageRating: 4.3, reviewCount: 15, store: 'Casa de Arepas', category: 'Venezuelan' },
    { id: '7', name: 'Tacos al Pastor', price: 11.99, images: ['https://images.unsplash.com/photo-1565299507177-b0ac66763c75?w=400&h=300&fit=crop'], averageRating: 4.6, reviewCount: 28, store: 'Taqueria El Sol', category: 'Mexican' },
    { id: '8', name: 'Churrasco', price: 22.99, images: ['https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop'], averageRating: 4.8, reviewCount: 35, store: 'Parrilla Brasileña', category: 'Brazilian' },
    { id: '9', name: 'Quesadillas', price: 7.99, images: ['https://images.unsplash.com/photo-1565060299790-165169e3ba29?w=400&h=300&fit=crop'], averageRating: 4.4, reviewCount: 21, store: 'Taqueria El Sol', category: 'Mexican' },
    { id: '10', name: 'Feijoada', price: 19.99, images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'], averageRating: 4.7, reviewCount: 26, store: 'Parrilla Brasileña', category: 'Brazilian' },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [mockProducts]);

  const filterProducts = useCallback(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.store?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filterProducts]);

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gromuse-style Header */}
      <div className="bg-[#16726B] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* Back and Logo */}
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-[#C8E400]" />
                <span className="text-xl font-bold">All Products</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C8E400]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden cursor-pointer"
              >
                {/* Product Image */}
                <div className="aspect-square p-4">
                  <div className="relative w-full h-full">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Rating badge */}
                    {product.averageRating && (
                      <div className="absolute top-2 right-2 bg-white text-gray-900 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {product.averageRating}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4 pt-0">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    ({product.store})
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    500 gm.
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">
                        {Math.floor(product.price)}.
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((product.price % 1) * 100).toString().padStart(2, '0')}$
                      </span>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic
                    }}
                    className="w-full py-2 rounded-xl font-medium text-sm transition-colors bg-gray-100 hover:bg-[#C8E400] hover:text-white"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
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
                  {searchQuery ? 'No products found' : 'No products available'}
                </h4>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {searchQuery 
                    ? `We couldn't find any products matching "${searchQuery}"`
                    : 'There are no products available at the moment. Check back soon!'
                  }
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span>Clear Search</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};