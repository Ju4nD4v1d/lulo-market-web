import React, { createContext, useContext, ReactNode } from 'react';
import { StoreData } from '../types/store';
import * as api from './api';

/**
 * DataProvider - Legacy compatibility layer
 *
 * This provider maintains the existing DataProvider interface used throughout the app,
 * but now delegates all operations to the centralized API service.
 *
 * Note: New code should import functions directly from './api' instead of using this provider.
 * This provider exists for backward compatibility with existing code.
 */

interface DataProviderType {
  // Store operations
  getStores: () => Promise<{ docs: unknown[]; empty: boolean; size: number }>;
  getStore: (storeId: string) => Promise<{ exists: () => boolean; data: () => unknown; id: string }>;

  // Order operations
  getOrders: (userId?: string) => Promise<{ docs: unknown[]; empty: boolean; size: number }>;

  // Review operations
  getReviews: (storeId: string) => Promise<{ docs: unknown[]; empty: boolean; size: number }>;

  // Product operations
  getProducts: (storeId: string) => Promise<{ docs: unknown[]; empty: boolean; size: number }>;

  // Auth operations
  getCurrentUser: () => unknown;
  getUserProfile: (uid: string) => Promise<{ exists: () => boolean; data: () => unknown; id: string }>;

  // Real-time listeners
  listenToStores: (callback: (stores: StoreData[]) => void) => () => void;
  listenToOrders: (userId: string, callback: (orders: unknown[]) => void) => () => void;
}

const DataContext = createContext<DataProviderType | null>(null);

export const useDataProvider = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Helper to convert API responses to Firestore-like format
 * This maintains compatibility with existing code expecting Firestore response format
 */
const createFirestoreLikeResponse = (data: unknown[]) => ({
  docs: data.map((item: { id: string }) => ({
    id: item.id,
    data: () => item,
    exists: () => true,
  })),
  empty: data.length === 0,
  size: data.length,
});

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const dataProvider: DataProviderType = {
    // Get all stores
    getStores: async () => {
      const stores = await api.getAllStores();
      return createFirestoreLikeResponse(stores);
    },

    // Get single store
    getStore: async (storeId: string) => {
      try {
        const store = await api.getStoreById(storeId);
        return {
          exists: () => true,
          data: () => store,
          id: storeId,
        };
      } catch (error) {
        return {
          exists: () => false,
          data: () => null,
          id: storeId,
        };
      }
    },

    // Get orders
    getOrders: async (userId?: string) => {
      const orders = await api.getOrders({ userId, limitCount: userId ? undefined : 50 });
      return createFirestoreLikeResponse(orders);
    },

    // Get reviews for a store
    getReviews: async (storeId: string) => {
      const reviews = await api.getReviewsByStoreId(storeId);
      return createFirestoreLikeResponse(reviews);
    },

    // Get products for a store
    getProducts: async (storeId: string) => {
      const products = await api.getProductsByStoreId(storeId);
      return createFirestoreLikeResponse(products);
    },

    // Auth operations
    getCurrentUser: () => {
      // This would normally come from Firebase Auth context
      return null;
    },

    getUserProfile: async (uid: string) => {
      const profile = await api.getUserProfile(uid);
      return {
        exists: () => !!profile,
        data: () => profile,
        id: uid,
      };
    },

    // Real-time listeners - simplified implementation
    // For true real-time updates, consider using onSnapshot from Firestore
    listenToStores: (callback: (stores: StoreData[]) => void) => {
      api.getAllStores().then((stores) => {
        callback(stores);
      });

      return () => {}; // Placeholder unsubscribe
    },

    listenToOrders: (userId: string, callback: (orders: unknown[]) => void) => {
      api.getOrders({ userId }).then((orders) => {
        callback(orders);
      });

      return () => {}; // Placeholder unsubscribe
    },
  };

  return <DataContext.Provider value={dataProvider}>{children}</DataContext.Provider>;
};
