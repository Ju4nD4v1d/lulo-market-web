import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle, ArrowLeft, Phone, MapPin, Calendar, Receipt, Search, Filter, SortDesc } from 'lucide-react';
import { Order, OrderStatus } from '../types/order';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDataProvider } from '../services/DataProvider';

interface OrderHistoryProps {
  onBack?: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { getOrders } = useDataProvider();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const ordersSnapshot = await getOrders(currentUser.uid);
        
        let ordersData: Order[] = [];
        if (ordersSnapshot && ordersSnapshot.docs) {
          // Firebase format
          ordersData = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
              estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate ? data.estimatedDeliveryTime.toDate() : data.estimatedDeliveryTime ? new Date(data.estimatedDeliveryTime) : undefined,
              deliveredAt: data.deliveredAt?.toDate ? data.deliveredAt.toDate() : data.deliveredAt ? new Date(data.deliveredAt) : undefined
            };
          }) as Order[];
        } else if (Array.isArray(ordersSnapshot)) {
          // Mock data format
          ordersData = ordersSnapshot as Order[];
        }
        
        // Sort by creation date (newest first)
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, getOrders]);

  // Determine the back handler based on props
  const handleBack = onBack || (() => window.history.back());

  // Filter and sort orders
  const filteredAndSortedOrders = React.useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.summary.total - b.summary.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Get unique statuses for filter options
  const availableStatuses = React.useMemo(() => {
    const statuses = Array.from(new Set(orders.map(order => order.status)));
    return statuses.sort();
  }, [orders]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="w-5 h-5 text-amber-500" />;
      case OrderStatus.CONFIRMED:
      case OrderStatus.PREPARING:
        return <Package className="w-5 h-5 text-blue-500" />;
      case OrderStatus.READY:
      case OrderStatus.OUT_FOR_DELIVERY:
        return <Package className="w-5 h-5 text-green-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case OrderStatus.CONFIRMED:
      case OrderStatus.PREPARING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.READY:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-900 border-green-300';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return t('order.status.pending');
      case OrderStatus.CONFIRMED:
        return t('order.status.confirmed');
      case OrderStatus.PREPARING:
        return t('order.status.preparing');
      case OrderStatus.READY:
        return t('order.status.ready');
      case OrderStatus.OUT_FOR_DELIVERY:
        return t('order.status.outForDelivery');
      case OrderStatus.DELIVERED:
        return t('order.status.delivered');
      case OrderStatus.CANCELLED:
        return t('order.status.cancelled');
      default:
        return t('order.status.pending');
    }
  };

  const formatPrice = (price: number | undefined) => `CAD $${(price || 0).toFixed(2)}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('orderHistory.orderDetails')}</h1>
                <p className="text-gray-600 text-sm">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedOrder.status)}
                <div>
                  <h2 className="font-semibold text-gray-900">{getStatusText(selectedOrder.status)}</h2>
                  <p className="text-gray-600 text-sm">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                {getStatusText(selectedOrder.status)}
              </div>
            </div>
            
            {selectedOrder.estimatedDeliveryTime && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{t('orderHistory.estimatedDelivery')}: {formatDate(selectedOrder.estimatedDeliveryTime)}</span>
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('orderHistory.storeInfo')}</h3>
            <p className="text-gray-800 font-medium">{selectedOrder.storeName}</p>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('orderHistory.customerInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{selectedOrder.customerInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{selectedOrder.deliveryAddress.street}</p>
                  <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.province} {selectedOrder.deliveryAddress.postalCode}</p>
                  {selectedOrder.deliveryAddress.deliveryInstructions && (
                    <p className="text-sm text-gray-500 mt-1">{selectedOrder.deliveryAddress.deliveryInstructions}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('orderHistory.orderItems')}</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-gray-600 text-sm">{t('orderHistory.quantity')}: {item.quantity}</p>
                    {item.specialInstructions && (
                      <p className="text-gray-500 text-sm mt-1 italic">{item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-gray-600 text-sm">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('orderHistory.orderSummary')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(selectedOrder.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.tax')}</span>
                <span>{formatPrice(selectedOrder.summary.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.deliveryFee')}</span>
                <span>{formatPrice(selectedOrder.summary.deliveryFee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>{t('cart.total')}</span>
                <span className="text-[#C8E400]">{formatPrice(selectedOrder.summary.total)}</span>
              </div>
            </div>
          </div>

          {selectedOrder.orderNotes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('orderHistory.orderNotes')}</h3>
              <p className="text-gray-600">{selectedOrder.orderNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('orderHistory.title')}</h1>
              <p className="text-gray-600 text-sm">{t('orderHistory.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col gap-4">
            {/* Search - Full width on all screens */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('orderHistory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8E400] focus:border-transparent"
              />
            </div>
            
            {/* Filters and Sort - Stack on mobile, side by side on desktop */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8E400] focus:border-transparent appearance-none bg-white sm:min-w-[220px]"
                >
                  <option value="all">{t('orderHistory.allStatuses')}</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{getStatusText(status)}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div className="flex items-center gap-3 flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8E400] focus:border-transparent sm:min-w-[180px]"
                >
                  <option value="date">{t('orderHistory.sortByDate')}</option>
                  <option value="amount">{t('orderHistory.sortByAmount')}</option>
                  <option value="status">{t('orderHistory.sortByStatus')}</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                  title={sortOrder === 'asc' ? t('orderHistory.ascending') : t('orderHistory.descending')}
                >
                  <SortDesc className={`w-4 h-4 text-gray-600 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            {filteredAndSortedOrders.length === orders.length ? 
              t('orderHistory.showingAll').replace('{count}', orders.length.toString()) :
              t('orderHistory.showingFiltered')
                .replace('{filtered}', filteredAndSortedOrders.length.toString())
                .replace('{total}', orders.length.toString())
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8E400]"
              role="progressbar"
              aria-label="Loading orders"
              data-testid="loading-spinner"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistory.errorTitle')}</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
{t('orderHistory.tryAgain')}
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistory.noOrders')}</h3>
            <p className="text-gray-600 mb-6">{t('orderHistory.noOrdersDescription')}</p>
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              {t('orderHistory.startShopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.storeName}</h3>
                      <p className="text-gray-600 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(order.summary.total)}</p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{order.summary.itemCount} {order.summary.itemCount === 1 ? t('cart.item') : t('cart.items')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return content;
};