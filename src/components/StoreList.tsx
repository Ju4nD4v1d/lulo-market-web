import React, { useEffect, useState, useCallback } from 'react';
// import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Star, ShoppingCart, Search } from 'lucide-react';
import { useTestMode } from '../context/TestModeContext';
import { useDataProvider } from '../services/DataProvider';
import { generateAllMockStores } from '../utils/mockDataGenerators';

interface StoreData {
  id: string;
  name: string;
  description?: string;
  storeImage?: string;
  imageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  deliveryOptions?: { delivery: boolean; pickup: boolean; shipping: boolean };
  deliveryCostWithDiscount?: number;
  minimumOrder?: number;
  isVerified?: boolean;
  createdAt?: Date;
}

// Helper function to check if a store is new
const isStoreNew = (createdAt?: Date): boolean => {
  if (!createdAt) return false;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return createdAt > oneMonthAgo;
};

interface StoreListProps {
  onBack?: () => void;
  onStoreClick?: (store: StoreData) => void;
}

export const StoreList: React.FC<StoreListProps> = ({ onBack, onStoreClick }) => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // const { t } = useLanguage();
  const { isTestMode } = useTestMode();
  const dataProvider = useDataProvider();

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isTestMode) {
        // Use mock data in test mode
        const mockStores = generateAllMockStores();
        setStores(mockStores);
      } else {
        // Use real Firebase data
        const storesSnapshot = await dataProvider.getStores();
        const storesData = storesSnapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as { toDate?: () => Date })?.toDate ? (data.createdAt as { toDate: () => Date }).toDate() : data.createdAt
          };
        }) as StoreData[];
        
        setStores(storesData);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to fetch stores. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isTestMode, dataProvider]);

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

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    filterStores();
  }, [stores, searchQuery, filterStores]);

  const handleStoreClick = (store: StoreData) => {
    if (onStoreClick) {
      onStoreClick(store);
    }
  };

  const calculateDistance = (): string => {
    // Simple distance calculation or default
    return 'Near you';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-[#16726B] text-white sticky top-0 z-50 enhanced-navbar">
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
                <span className="text-xl font-bold">All Stores</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-10 pr-4 py-2 bg-white text-gray-900 placeholder-gray-500"
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
        ) : error ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stores</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchStores}
                className="btn-primary focus-ring px-6 py-3"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden cursor-pointer"
              >
                {/* Store Image */}
                <div className="aspect-square p-4">
                  <div className="relative w-full h-full">
                    {(store.storeImage || store.imageUrl) ? (
                      <img
                        src={store.storeImage || store.imageUrl}
                        alt={store.name}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (store.storeImage && store.imageUrl && target.src === store.storeImage) {
                            target.src = store.imageUrl;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Status badges */}
                    {store.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Verified
                      </div>
                    )}
                    
                    {isStoreNew(store.createdAt) ? (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        New
                      </div>
                    ) : store.averageRating ? (
                      <div className="absolute top-2 left-2 bg-white text-gray-900 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {store.averageRating.toFixed(1)}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* Store Info */}
                <div className="p-4 pt-0">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                    {store.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    ({store.totalReviews || 0} reviews)
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    {calculateDistance()}
                  </p>
                  
                  {/* Delivery info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">
                        ${store.deliveryCostWithDiscount || '4'}.
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        99 delivery
                      </span>
                    </div>
                  </div>
                  
                  {/* View Store Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoreClick(store);
                    }}
                    className="w-full py-2 rounded-xl font-medium text-sm transition-colors bg-gray-100 hover:bg-[#C8E400] hover:text-white"
                  >
                    <span className="text-sm font-bold">View Store</span>
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
                  {searchQuery ? 'No stores found' : 'No stores available'}
                </h4>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {searchQuery 
                    ? `We couldn't find any stores matching "${searchQuery}"`
                    : 'There are no stores available at the moment. Check back soon!'
                  }
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-primary focus-ring inline-flex items-center gap-2 px-6 py-3"
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