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
  Loader2
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  gstTax: number;
  pstTax: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderId: string;
  userName: string;
  userPhoneNumber: string;
  createdDate: Date;
  status: 'created' | 'headingToStore' | 'orderDelivered';
  deliveryAddress: string;
  deliverySchedule: string;
  storeName: string;
  storeId: string;
  subtotal: number;
  gstTotal: number;
  pstTotal: number;
  taxes: number;
  platformFee: number;
  totalOrderPrice: number;
  headingToStoreTime?: Date;
  pickupCompletedTime?: Date;
  headingToDestinationTime?: Date;
  orderDeliveredTime?: Date;
  items?: OrderItem[];
}

const statusColors = {
  created: 'bg-yellow-100 text-yellow-800',
  headingToStore: 'bg-blue-100 text-blue-800',
  orderDelivered: 'bg-green-100 text-green-800'
};

const OrderTimeline = ({ order }: { order: Order }) => {
  const timelineSteps = [
    { time: order.createdDate, label: 'Order Created', icon: Package },
    { time: order.headingToStoreTime, label: 'Heading to Store', icon: Truck },
    { time: order.pickupCompletedTime, label: 'Pickup Completed', icon: ShoppingCart },
    { time: order.headingToDestinationTime, label: 'Heading to Destination', icon: Truck },
    { time: order.orderDeliveredTime, label: 'Order Delivered', icon: CheckCircle2 }
  ];

  const lastCompletedIndex = timelineSteps.findIndex(step => !step.time) - 1;

  return (
    <div className="space-y-4">
      {timelineSteps.map((step, index) => {
        if (!step.time && index > lastCompletedIndex + 1) return null;
        const Icon = step.icon;
        
        return (
          <div key={step.label} className="flex items-start space-x-3">
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${step.time 
                ? 'bg-primary-100 text-primary-600' 
                : index === lastCompletedIndex + 1
                  ? 'bg-blue-100 text-blue-600 animate-pulse'
                  : 'bg-gray-100 text-gray-400'
              }
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1">
              <p className={`text-sm font-medium ${step.time ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </p>
                {step.time && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(step.time, { addSuffix: true })}
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
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});
  const [storeId, setStoreId] = useState<string | null>(null);

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
        setError(t('orders.noStoreError'));
        setLoading(false);
        return;
      }

      setStoreId(snapshot.docs[0].id);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError(t('orders.storeError'));
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('storeId', '==', storeId),
        orderBy('createdDate', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdDate: doc.data().createdDate?.toDate(),
        headingToStoreTime: doc.data().headingToStoreTime?.toDate(),
        pickupCompletedTime: doc.data().pickupCompletedTime?.toDate(),
        headingToDestinationTime: doc.data().headingToDestinationTime?.toDate(),
        orderDeliveredTime: doc.data().orderDeliveredTime?.toDate(),
      })) as Order[];

      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(t('orders.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    if (!orderId) return;
    if (orders.find(o => o.id === orderId)?.items) return;

    setLoadingDetails(prev => ({ ...prev, [orderId]: true }));
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDetailsRef = collection(orderRef, 'orderDetails');
      const snapshot = await getDocs(orderDetailsRef);
      
      if (snapshot.empty) return;

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderItem[];

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, items } 
          : order
      ));
    } catch (err) {
      console.error(`Error loading order details for order ${orderId}:`, err);
      setError(t('orders.detailsError'));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      await loadOrderDetails(orderId);
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userPhoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 text-red-700 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('orders.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            {Object.entries(statusColors).map(([status]) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium
                  ${statusFilter.includes(status)
                    ? statusColors[status as keyof typeof statusColors]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {t(`orders.status.${status === 'headingToStore' ? 'inProgress' : status === 'orderDelivered' ? 'delivered' : 'created'}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {storeId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TotalWeeklyRevenueCard storeId={storeId} />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orders.noOrders')}</h3>
          <p className="text-gray-500">{t('orders.noOrdersDesc')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('orders.order')} #{order.orderId}
                    </h3>
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${statusColors[order.status]}
                    `}>
                      {t(`orders.status.${order.status === 'headingToStore' ? 'inProgress' : order.status === 'orderDelivered' ? 'delivered' : 'created'}`)}
                    </span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{t('orders.customer')}</p>
                      <p className="font-medium text-gray-900">{order.userName}</p>
                      <p className="text-gray-600">{order.userPhoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('orders.delivery')}</p>
                      <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                      <p className="text-gray-600">{order.deliverySchedule}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end">
                  <p className="text-2xl font-bold text-primary-600">
                    ${order.totalOrderPrice.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleExpandOrder(order.id)}
                    className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    {expandedOrder === order.id ? (
                      <>{t('orders.hideDetails')} <ChevronDown className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>{t('orders.viewDetails')} <ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">{t('orders.orderTimeline')}</h4>
                      <OrderTimeline order={order} />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">{t('orders.orderSummary')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('orders.subtotal')}</span>
                          <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('orders.gst')}</span>
                          <span className="text-gray-900">${order.gstTotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('orders.pst')}</span>
                          <span className="text-gray-900">${order.pstTotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('orders.platformFee')}</span>
                          <span className="text-gray-900">${order.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                          <span className="text-gray-900">{t('orders.total')}</span>
                          <span className="text-gray-900">${order.totalOrderPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">{t('orders.orderItems')}</h4>
                    {loadingDetails[order.id] ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                      </div>
                    ) : order.items ? (
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-500">{t('orders.quantity')}: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ${item.subtotal.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${item.price.toFixed(2)} {t('orders.each')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        {t('orders.detailsError')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};