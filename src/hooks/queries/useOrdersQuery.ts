import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, OrderStatus } from '../../types/order';
import { queryKeys } from './queryKeys';

// Helper function to validate OrderStatus values
const isValidOrderStatus = (status: any): status is OrderStatus => {
  return Object.values(OrderStatus).includes(status);
};

// Helper to safely convert Firestore timestamps to dates
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

// Transform Firestore document to Order type
const transformOrderDocument = (doc: any): Order => {
  const data = doc.data();

  return {
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

    // Create summary from Firestore fields
    summary: {
      subtotal: data.summary?.subtotal || data.subtotal || data.totalOrderPrice || 0,
      tax: data.summary?.tax || (data.gstTax || 0) + (data.pstTax || 0),
      deliveryFee: data.summary?.deliveryFee || 0,
      total: data.summary?.total || data.totalOrderPrice || 0,
      itemCount: data.summary?.itemCount || data.quantity || 1
    },

    // Order status - ensure we use valid OrderStatus enum values
    status: (() => {
      if (isValidOrderStatus(data.status)) {
        return data.status;
      }

      // Handle case where payment status was incorrectly stored in status field
      if (data.status === 'paid') {
        return OrderStatus.CONFIRMED;
      }

      // Fallback based on payment status
      if (data.paymentStatus === 'paid') {
        return OrderStatus.CONFIRMED;
      } else if (data.paymentStatus === 'processing') {
        return OrderStatus.PENDING;
      }

      return OrderStatus.PENDING;
    })(),
    orderNotes: data.orderNotes || data.notes || '',

    // Timestamps
    createdAt: safeDate(data.createdAt || data.createdDate),
    updatedAt: safeDate(data.updatedAt || data.createdDate),
    estimatedDeliveryTime: data.estimatedDeliveryTime ? safeDate(data.estimatedDeliveryTime) : undefined,
    deliveredAt: data.deliveredAt ? safeDate(data.deliveredAt) : undefined,

    // Payment info
    paymentStatus: (() => {
      if (data.paymentStatus && ['pending', 'processing', 'paid', 'failed', 'refunded'].includes(data.paymentStatus)) {
        return data.paymentStatus;
      }
      if (data.status === 'paid') {
        return 'paid';
      }
      return 'pending';
    })(),
    paymentMethod: data.paymentMethod || '',
    paymentId: data.paymentId || '',

    // Additional info
    isDelivery: data.isDelivery !== undefined ? data.isDelivery : true,
    language: data.language || 'en'
  };
};

interface UseOrdersQueryOptions {
  storeId: string | null;
  pageSize?: number;
  enabled?: boolean;
}

interface OrdersQueryResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOrdersQuery = ({
  storeId,
  pageSize = 50,
  enabled = true
}: UseOrdersQueryOptions): OrdersQueryResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.orders.byStore(storeId || ''),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      console.log('🔍 Loading orders for storeId:', storeId);

      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('storeId', '==', storeId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      const ordersSnapshot = await getDocs(ordersQuery);

      console.log('🎯 Orders found for this store:', ordersSnapshot.size);

      const ordersData: Order[] = ordersSnapshot.docs.map(transformOrderDocument);

      return ordersData;
    },
    enabled: enabled && !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2,
  });

  return {
    orders: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
