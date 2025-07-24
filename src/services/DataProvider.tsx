import React, { createContext, useContext, ReactNode } from 'react';
import { useTestMode } from '../context/TestModeContext';
import { 
  generateAllMockStores, 
  generateMockOrders, 
  generateMockReviews, 
  mockUser, 
  mockUserProfile 
} from '../utils/mockDataGenerators';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StoreData } from '../types/store';

// Mock Firebase-like API responses
const createMockResponse = (data: unknown) => ({
  docs: Array.isArray(data) ? data.map((item, index) => ({
    id: item.id || `mock-${index}`,
    data: () => item,
    exists: () => true
  })) : [],
  empty: Array.isArray(data) ? data.length === 0 : false,
  size: Array.isArray(data) ? data.length : 0
});

interface DataProviderType {
  // Firestore operations
  getStores: () => Promise<unknown>;
  getStore: (storeId: string) => Promise<unknown>;
  getOrders: (userId?: string) => Promise<unknown>;
  getReviews: (storeId: string) => Promise<unknown>;
  getProducts: (storeId: string) => Promise<unknown>;
  
  // Auth operations
  getCurrentUser: () => unknown;
  getUserProfile: (uid: string) => Promise<unknown>;
  
  // Real-time listeners (simplified for mock)
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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isTestMode } = useTestMode();

  // Initialize mock data
  const mockStores = generateAllMockStores();
  const mockOrders = generateMockOrders(15);

  const dataProvider: DataProviderType = {
    // Get all stores
    getStores: async () => {
      if (isTestMode) {
        console.log('🧪 Mock: Fetching stores');
        return createMockResponse(mockStores);
      } else {
        const storesCollection = collection(db, 'stores');
        return await getDocs(storesCollection);
      }
    },

    // Get single store
    getStore: async (storeId: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Fetching store ${storeId}`);
        const store = mockStores.find(s => s.id === storeId);
        return {
          exists: () => !!store,
          data: () => store,
          id: storeId
        };
      } else {
        const storeDoc = doc(db, 'stores', storeId);
        return await getDoc(storeDoc);
      }
    },

    // Get orders
    getOrders: async (userId?: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Fetching orders for user ${userId || 'all'}`);
        const filteredOrders = userId 
          ? mockOrders.filter(order => order.userId === userId)
          : mockOrders;
        return createMockResponse(filteredOrders);
      } else {
        let ordersQuery;
        if (userId) {
          // Try compound query with index
          try {
            ordersQuery = query(
              collection(db, 'orders'),
              where('userId', '==', userId),
              orderBy('createdAt', 'desc')
            );
            return await getDocs(ordersQuery);
          } catch (error) {
            // Fallback to simple query without orderBy if index doesn't exist
            console.warn('Firestore compound query failed, using simple query:', error);
            ordersQuery = query(
              collection(db, 'orders'),
              where('userId', '==', userId)
            );
            return await getDocs(ordersQuery);
          }
        } else {
          ordersQuery = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          return await getDocs(ordersQuery);
        }
      }
    },

    // Get reviews for a store
    getReviews: async (storeId: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Fetching reviews for store ${storeId}`);
        const reviews = generateMockReviews(storeId, 10);
        return createMockResponse(reviews);
      } else {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('storeId', '==', storeId),
          orderBy('createdAt', 'desc')
        );
        return await getDocs(reviewsQuery);
      }
    },

    // Get products for a store
    getProducts: async (storeId: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Fetching products for store ${storeId}`);
        const store = mockStores.find(s => s.id === storeId);
        const products = store?.products || [];
        return createMockResponse(products);
      } else {
        const productsQuery = query(
          collection(db, 'products'),
          where('storeId', '==', storeId)
        );
        return await getDocs(productsQuery);
      }
    },

    // Auth operations
    getCurrentUser: () => {
      if (isTestMode) {
        console.log('🧪 Mock: Getting current user');
        return mockUser;
      } else {
        // This would normally come from Firebase Auth context
        return null;
      }
    },

    getUserProfile: async (uid: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Fetching user profile for ${uid}`);
        return {
          exists: () => true,
          data: () => mockUserProfile,
          id: uid
        };
      } else {
        const userDoc = doc(db, 'users', uid);
        return await getDoc(userDoc);
      }
    },

    // Real-time listeners (simplified)
    listenToStores: (callback: (stores: StoreData[]) => void) => {
      if (isTestMode) {
        console.log('🧪 Mock: Setting up stores listener');
        // Immediately call with mock data
        setTimeout(() => callback(mockStores), 100);
        
        // Return unsubscribe function
        return () => {
          console.log('🧪 Mock: Unsubscribing from stores listener');
        };
      } else {
        // Real Firebase listener would go here
        // This is a simplified implementation
        const storesCollection = collection(db, 'stores');
        getDocs(storesCollection).then(snapshot => {
          const stores = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt
          })) as StoreData[];
          callback(stores);
        });
        
        return () => {}; // Placeholder unsubscribe
      }
    },

    listenToOrders: (userId: string, callback: (orders: unknown[]) => void) => {
      if (isTestMode) {
        console.log(`🧪 Mock: Setting up orders listener for user ${userId}`);
        const userOrders = mockOrders.filter(order => order.userId === userId);
        setTimeout(() => callback(userOrders), 100);
        
        return () => {
          console.log('🧪 Mock: Unsubscribing from orders listener');
        };
      } else {
        // Real Firebase listener would go here
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        getDocs(ordersQuery).then(snapshot => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(orders);
        });
        
        return () => {}; // Placeholder unsubscribe
      }
    }
  };

  return (
    <DataContext.Provider value={dataProvider}>
      {children}
    </DataContext.Provider>
  );
};