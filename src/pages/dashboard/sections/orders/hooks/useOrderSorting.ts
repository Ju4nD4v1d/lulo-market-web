import { useState, useCallback } from 'react';
import { Order, OrderStatus } from '../../../../../types/order';

export type SortOption = 'newest' | 'oldest' | 'urgency' | 'status';

interface UseOrderSortingReturn {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortOrders: (orders: Order[]) => Order[];
}

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  [OrderStatus.PENDING]: 1,
  [OrderStatus.CONFIRMED]: 2,
  [OrderStatus.PREPARING]: 3,
  [OrderStatus.READY]: 4,
  [OrderStatus.OUT_FOR_DELIVERY]: 5,
  [OrderStatus.DELIVERED]: 6,
  [OrderStatus.CANCELLED]: 7,
  [OrderStatus.PENDING_PAYMENT]: 0,
  [OrderStatus.PROCESSING]: 1,
  [OrderStatus.PAYMENT_FAILED]: 8,
};

const STORAGE_KEY = 'orders_sort_option';

const getStoredSortOption = (): SortOption => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['newest', 'oldest', 'urgency', 'status'].includes(stored)) {
      return stored as SortOption;
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'newest';
};

const parseDate = (date: Date | string | number | undefined): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const useOrderSorting = (): UseOrderSortingReturn => {
  const [sortOption, setSortOptionState] = useState<SortOption>(getStoredSortOption);

  const setSortOption = useCallback((option: SortOption) => {
    setSortOptionState(option);
    try {
      localStorage.setItem(STORAGE_KEY, option);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const sortOrders = useCallback((orders: Order[]): Order[] => {
    if (!orders || orders.length === 0) return orders;

    const sortedOrders = [...orders];

    switch (sortOption) {
      case 'newest':
        return sortedOrders.sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });

      case 'oldest':
        return sortedOrders.sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateA.getTime() - dateB.getTime();
        });

      case 'urgency':
        // Urgency: Closest delivery time first
        // Orders with preferredDeliveryTime closer to now come first
        // Delivered/Cancelled orders go to the bottom
        return sortedOrders.sort((a, b) => {
          // Push completed/cancelled orders to the end
          const aCompleted = [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(a.status);
          const bCompleted = [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(b.status);
          if (aCompleted && !bCompleted) return 1;
          if (!aCompleted && bCompleted) return -1;
          if (aCompleted && bCompleted) {
            // Both completed, sort by newest
            const dateA = parseDate(a.createdAt);
            const dateB = parseDate(b.createdAt);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
          }

          // For active orders, sort by urgency (closest delivery time)
          const now = Date.now();
          const getUrgencyScore = (order: Order): number => {
            // Try preferredDeliveryTime first
            const deliveryTime = parseDate(order.preferredDeliveryTime) ||
                                 parseDate(order.estimatedDeliveryTime);

            if (deliveryTime) {
              // Time remaining until delivery (negative = overdue)
              return deliveryTime.getTime() - now;
            }

            // If no delivery time, use createdAt - older orders are more urgent
            const createdAt = parseDate(order.createdAt);
            if (createdAt) {
              // Make older orders appear more urgent by returning smaller numbers
              // We add a large offset to distinguish from orders with delivery times
              return now - createdAt.getTime() + 1000000000000;
            }

            return Infinity; // No date info, push to end
          };

          const urgencyA = getUrgencyScore(a);
          const urgencyB = getUrgencyScore(b);

          // Smaller urgency score = more urgent (closer/overdue delivery)
          return urgencyA - urgencyB;
        });

      case 'status':
        return sortedOrders.sort((a, b) => {
          const priorityA = STATUS_PRIORITY[a.status] ?? 99;
          const priorityB = STATUS_PRIORITY[b.status] ?? 99;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Same status, sort by newest
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });

      default:
        return sortedOrders;
    }
  }, [sortOption]);

  return {
    sortOption,
    setSortOption,
    sortOrders
  };
};
