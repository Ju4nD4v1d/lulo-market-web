import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  XCircle,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
// Removed DataProvider import since we're querying directly
import { Order, OrderStatus } from '../types/order';

const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [OrderStatus.PREPARING]: 'bg-purple-100 text-purple-800 border-purple-200',
  [OrderStatus.READY]: 'bg-green-100 text-green-800 border-green-200',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-900 border-green-300',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200'
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <Clock className="w-4 h-4" />;
    case OrderStatus.CONFIRMED:
      return <CheckCircle2 className="w-4 h-4" />;
    case OrderStatus.PREPARING:
      return <Package className="w-4 h-4" />;
    case OrderStatus.READY:
      return <ShoppingCart className="w-4 h-4" />;
    case OrderStatus.OUT_FOR_DELIVERY:
      return <Truck className="w-4 h-4" />;
    case OrderStatus.DELIVERED:
      return <CheckCircle2 className="w-4 h-4" />;
    case OrderStatus.CANCELLED:
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const OrderTimeline = ({ order }: { order: Order }) => {
  const { t } = useLanguage();
  const timelineSteps = [
    { 
      status: OrderStatus.PENDING, 
      label: t('order.timeline.received'), 
      icon: Package,
      time: order.createdAt,
      active: true
    },
    { 
      status: OrderStatus.CONFIRMED, 
      label: t('order.timeline.confirmed'), 
      icon: CheckCircle2,
      time: order.status === OrderStatus.CONFIRMED ? order.updatedAt : undefined,
      active: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    { 
      status: OrderStatus.PREPARING, 
      label: t('order.timeline.preparing'), 
      icon: Package,
      time: order.status === OrderStatus.PREPARING ? order.updatedAt : undefined,
      active: [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    { 
      status: OrderStatus.READY, 
      label: t('order.timeline.ready'), 
      icon: ShoppingCart,
      time: order.status === OrderStatus.READY ? order.updatedAt : undefined,
      active: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    { 
      status: OrderStatus.OUT_FOR_DELIVERY, 
      label: t('order.timeline.outForDelivery'), 
      icon: Truck,
      time: order.status === OrderStatus.OUT_FOR_DELIVERY ? order.updatedAt : undefined,
      active: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    { 
      status: OrderStatus.DELIVERED, 
      label: t('order.timeline.delivered'), 
      icon: CheckCircle2,
      time: order.deliveredAt,
      active: order.status === OrderStatus.DELIVERED
    }
  ];

  return (
    <div className="space-y-4">
      {timelineSteps.map((step) => {
        const Icon = step.icon;
        const isCurrentStep = order.status === step.status;
        
        return (
          <div key={step.status} className="flex items-start space-x-3">
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2
              ${step.active 
                ? isCurrentStep 
                  ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                  : 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
              }
            `}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <p className={`text-sm font-medium break-words ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </p>
              {step.time && (
                <p className="text-xs text-gray-500 mt-1">
                  {(() => {
                    try {
                      const date = step.time instanceof Date ? step.time : new Date(step.time);
                      if (isNaN(date.getTime())) return 'Invalid time';
                      return formatDistanceToNow(date, { addSuffix: true });
                    } catch (error) {
                      console.error('Error formatting timeline time:', error);
                      return 'Invalid time';
                    }
                  })()
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const OrderManagement = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [storeId, setStoreId] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchStoreId();
  }, [currentUser]);

  useEffect(() => {
    if (storeId) {
      loadOrders();
    }
  }, [storeId]);

  const fetchStoreId = async () => {
    try {
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser?.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('No store found for this user');
        setLoading(false);
        return;
      }

      const foundStoreId = snapshot.docs[0].id;
      console.log('🏪 Found store ID:', foundStoreId);
      setStoreId(foundStoreId);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Error fetching store information');
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      
      console.log('🔍 Loading orders for storeId:', storeId);
      
      // First, let's check all orders to see what's in the database
      const allOrdersRef = collection(db, 'orders');
      const allOrdersSnapshot = await getDocs(allOrdersRef);
      
      console.log('📊 Total orders in database:', allOrdersSnapshot.size);
      
      // Log some sample orders to understand the structure
      allOrdersSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log('📋 Sample order:', {
          id: doc.id,
          storeId: data.storeId,
          storeName: data.storeName,
          hasStoreId: !!data.storeId,
          keys: Object.keys(data)
        });
      });
      
      // Query orders directly from Firebase for this store
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef, 
        where('storeId', '==', storeId)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      console.log('🎯 Orders found for this store:', ordersSnapshot.size);
      
      const ordersData: Order[] = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Safe date conversion helper
        const safeDate = (dateValue: unknown): Date => {
          if (!dateValue) return new Date();
          
          try {
            // If it's a Firestore timestamp
            if (dateValue?.toDate) {
              return dateValue.toDate();
            }
            
            // If it's already a Date object
            if (dateValue instanceof Date) {
              return dateValue;
            }
            
            // If it's a string or number, try to parse
            const parsed = new Date(dateValue);
            if (isNaN(parsed.getTime())) {
              console.warn('Invalid date value:', dateValue, 'using current date');
              return new Date();
            }
            
            return parsed;
          } catch (error) {
            console.error('Error parsing date:', dateValue, error);
            return new Date();
          }
        };
        
        // Map Firestore schema to Order interface
        const order: Order = {
          id: doc.id,
          storeId: data.storeId || '',
          storeName: data.storeName || 'Unknown Store',
          
          // Customer info - handle both new nested format and old flat format
          customerInfo: {
            name: data.customerInfo?.name || data.userName || 'Unknown Customer',
            email: data.customerInfo?.email || data.userEmail || 'unknown@example.com',
            phone: data.customerInfo?.phone || data.userPhoneNumber || ''
          },
          
          // Delivery address - handle both new nested format and old flat format
          deliveryAddress: {
            street: data.deliveryAddress?.street || data.deliveryStreet || 'Address not available',
            city: data.deliveryAddress?.city || data.deliveryCity || 'Vancouver',
            province: data.deliveryAddress?.province || data.deliveryProvince || 'BC',
            postalCode: data.deliveryAddress?.postalCode || data.deliveryPostalCode || 'V6B 1A1',
            country: data.deliveryAddress?.country || data.deliveryCountry || 'Canada',
            deliveryInstructions: data.deliveryAddress?.deliveryInstructions || data.deliveryInstructions || ''
          },
          
          // Create items array - handle both new array format and old single item format
          items: data.items || [{
            id: data.productId || '1',
            productId: data.productId || '',
            productName: data.productName || 'Unknown Product',
            productImage: data.productImage || '',
            price: data.price || 0,
            quantity: data.quantity || 1,
            specialInstructions: data.specialInstructions || ''
          }],
          
          // Create summary from Firestore fields - handle both new and old data formats
          summary: {
            subtotal: data.summary?.subtotal || data.subtotal || data.totalOrderPrice || 0,
            tax: data.summary?.tax || (data.gstTax || 0) + (data.pstTax || 0),
            deliveryFee: data.summary?.deliveryFee || 0,
            total: data.summary?.total || data.totalOrderPrice || 0,
            itemCount: data.summary?.itemCount || data.quantity || 1
          },
          
          // Order status
          status: data.status || OrderStatus.PENDING,
          orderNotes: data.orderNotes || data.notes || '',
          
          // Timestamps - handle both new and old formats
          createdAt: safeDate(data.createdAt || data.createdDate),
          updatedAt: safeDate(data.updatedAt || data.createdDate),
          estimatedDeliveryTime: data.estimatedDeliveryTime ? safeDate(data.estimatedDeliveryTime) : undefined,
          deliveredAt: data.deliveredAt ? safeDate(data.deliveredAt) : undefined,
          
          // Payment info
          paymentStatus: data.paymentStatus || 'pending',
          paymentMethod: data.paymentMethod || '',
          paymentId: data.paymentId || '',
          
          // Additional info
          isDelivery: data.isDelivery !== undefined ? data.isDelivery : true,
          language: data.language || 'en'
        };
        
        return order;
      });

      // Sort manually by creation date (newest first)
      ordersData.sort((a, b) => {
        try {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error sorting orders:', error);
          return 0;
        }
      });

      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirmation(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    await updateOrderStatus(orderToCancel.id, OrderStatus.CANCELLED);
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const cancelCancelOrder = () => {
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === OrderStatus.DELIVERED) {
        updateData.deliveredAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error updating order status');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
        return status;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.OUT_FOR_DELIVERY;
      case OrderStatus.OUT_FOR_DELIVERY:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

  const formatDate = (date: Date | string | number) => {
    try {
      if (!date) return 'Invalid Date';
      
      let validDate: Date;
      if (date instanceof Date) {
        validDate = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        validDate = new Date(date);
      } else {
        return 'Invalid Date';
      }
      
      if (isNaN(validDate.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(validDate);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8E400]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders.title')}</h1>
            <p className="text-gray-600 mt-1">{t('admin.orders.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('admin.orders.totalOrders')}</p>
            <p className="text-2xl font-bold text-[#C8E400]">{orders.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.orders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8E400] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter.length > 0 ? statusFilter[0] : ''}
                onChange={(e) => setStatusFilter(e.target.value ? [e.target.value as OrderStatus] : [])}
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm min-w-[120px]"
              >
                <option value="">{t('admin.orders.allStatus')}</option>
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.orders.noOrdersFound')}</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter.length > 0 
                ? t('admin.orders.adjustFilters')
                : t('admin.orders.newOrdersMessage')}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {t('order.label')} #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.summary.total)}</p>
                      <p className="text-sm text-gray-600">{order.summary.itemCount} items</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}>
                      {getStatusText(order.status)}
                    </div>
                    
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedOrder === order.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">{t('admin.orders.customerInfo')}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{order.customerInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{order.customerInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{order.customerInfo.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-gray-700">
                            <p>{order.deliveryAddress.street}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}</p>
                            {order.deliveryAddress.deliveryInstructions && (
                              <p className="text-sm text-gray-500 mt-1">{order.deliveryAddress.deliveryInstructions}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">{t('admin.orders.orderActions')}</h4>
                        <div className="flex gap-2">
                          {getNextStatus(order.status) && (
                            <button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              disabled={updatingOrders.has(order.id)}
                              className="bg-[#C8E400] text-white px-4 py-2 rounded-lg hover:bg-[#A3C700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {updatingOrders.has(order.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                getStatusIcon(getNextStatus(order.status)!)
                              )}
                              {getStatusText(getNextStatus(order.status)!)}
                            </button>
                          )}
                          
                          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              disabled={updatingOrders.has(order.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              {t('admin.orders.cancelOrder')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">{t('admin.orders.orderTimeline')}</h4>
                      <OrderTimeline order={order} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">{t('admin.orders.orderItems')}</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{item.productName}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              {item.specialInstructions && (
                                <p className="text-sm text-gray-500 italic">{item.specialInstructions}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('cart.subtotal')}</span>
                          <span>{formatPrice(order.summary?.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t('cart.tax')}</span>
                          <span>{formatPrice(order.summary?.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t('cart.deliveryFee')}</span>
                          <span>{formatPrice(order.summary?.deliveryFee || 0)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                          <span>{t('cart.total')}</span>
                          <span className="text-[#C8E400]">{formatPrice(order.summary?.total || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {order.orderNotes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-1">{t('admin.orders.orderNotes')}</h5>
                        <p className="text-blue-800 text-sm">{order.orderNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirmation && orderToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('admin.orders.confirmCancelTitle')}</h3>
                <p className="text-sm text-gray-600">#{orderToCancel.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">{t('admin.orders.confirmCancelMessage')}</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600"><strong>{t('admin.orders.customer')}:</strong> {orderToCancel.customerInfo.name}</p>
                <p className="text-sm text-gray-600"><strong>{t('admin.orders.total')}:</strong> {formatPrice(orderToCancel.summary.total)}</p>
                <p className="text-sm text-gray-600"><strong>{t('admin.orders.orderTime')}:</strong> {formatDate(orderToCancel.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelCancelOrder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('button.keepOrder')}
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={updatingOrders.has(orderToCancel.id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingOrders.has(orderToCancel.id) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('button.canceling')}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    {t('button.confirmCancel')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};