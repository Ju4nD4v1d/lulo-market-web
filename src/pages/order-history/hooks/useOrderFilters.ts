import { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../../../types/order';

interface UseOrderFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (status: OrderStatus | 'all') => void;
  sortBy: 'date' | 'amount' | 'status';
  setSortBy: (sort: 'date' | 'amount' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  filteredOrders: Order[];
  availableStatuses: OrderStatus[];
}

/**
 * Custom hook to manage order filtering, searching, and sorting
 */
export const useOrderFilters = (orders: Order[]): UseOrderFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique statuses for filter options
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(orders.map(order => order.status)));
    return statuses.sort();
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
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

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredOrders,
    availableStatuses,
  };
};
