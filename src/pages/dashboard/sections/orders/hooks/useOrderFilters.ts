import { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../../../../../types/order';
import { isOrderVisibleToUser } from '../../../../../utils/orderUtils';

/**
 * Hook for filtering store orders with search, status, and visibility checks.
 *
 * Automatically filters out orphan orders (status: pending + paymentStatus: pending)
 * which represent abandoned checkouts that never completed payment.
 */
export const useOrderFilters = (orders: Order[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // First, filter out orphan/abandoned orders - store owners should not see them
      if (!isOrderVisibleToUser(order)) {
        return false;
      }

      const matchesSearch = searchTerm === '' ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  };
};
