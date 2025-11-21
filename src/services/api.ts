/**
 * API Service Layer
 *
 * Centralized Firebase operations for all backend interactions.
 * This file provides a clean interface for all database operations,
 * keeping Firebase logic separate from UI components.
 *
 * Usage:
 * - Import specific functions from this file instead of using Firebase directly
 * - All functions are async and return Promises
 * - Error handling should be done at the component level
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  UpdateData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StoreData } from '../types/store';
import { Product } from '../types/product';
import { Order } from '../types/order';

// ============================================================================
// Collection References
// ============================================================================

const COLLECTIONS = {
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  USERS: 'users',
  WAITLIST: 'waitlist',
} as const;

// ============================================================================
// Store Operations
// ============================================================================

/**
 * Get all stores from the database
 */
export async function getAllStores() {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const snapshot = await getDocs(storesRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  })) as StoreData[];
}

/**
 * Get a single store by ID
 */
export async function getStoreById(storeId: string) {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const snapshot = await getDoc(storeRef);

  if (!snapshot.exists()) {
    throw new Error(`Store with ID ${storeId} not found`);
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate?.() || snapshot.data().createdAt,
  } as StoreData;
}

/**
 * Create a new store
 */
export async function createStore(storeData: Omit<StoreData, 'id' | 'createdAt'>) {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const docRef = await addDoc(storesRef, {
    ...storeData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Update an existing store
 */
export async function updateStore(storeId: string, updates: Partial<StoreData>) {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  await updateDoc(storeRef, updates);
}

/**
 * Delete a store
 */
export async function deleteStore(storeId: string) {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  await deleteDoc(storeRef);
}

// ============================================================================
// Product Operations
// ============================================================================

/**
 * Get all products for a specific store
 */
export async function getProductsByStoreId(storeId: string) {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, where('storeId', '==', storeId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  const snapshot = await getDoc(productRef);

  if (!snapshot.exists()) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Product;
}

/**
 * Create a new product
 */
export async function createProduct(productData: Omit<Product, 'id'>) {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const docRef = await addDoc(productsRef, productData);

  return docRef.id;
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, updates: Partial<Product>) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await updateDoc(productRef, updates);
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(productRef);
}

// ============================================================================
// Order Operations
// ============================================================================

/**
 * Get all orders (with optional filters)
 */
export async function getOrders(options?: {
  userId?: string;
  storeId?: string;
  status?: string;
  limitCount?: number;
}) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const constraints: QueryConstraint[] = [];

  if (options?.userId) {
    constraints.push(where('userId', '==', options.userId));
  }

  if (options?.storeId) {
    constraints.push(where('storeId', '==', options.storeId));
  }

  if (options?.status) {
    constraints.push(where('status', '==', options.status));
  }

  // Always order by creation date
  constraints.push(orderBy('createdAt', 'desc'));

  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  try {
    const q = query(ordersRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    })) as Order[];
  } catch (error) {
    // Fallback to simple query if compound index doesn't exist
    console.warn('Compound query failed, using simple query:', error);
    const simpleConstraints = constraints.filter((c) => c.type !== 'orderBy');
    const q = query(ordersRef, ...simpleConstraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    })) as Order[];
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate?.() || snapshot.data().createdAt,
  } as Order;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, updates: Partial<Order>) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(orderRef, updates);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  await updateOrder(orderId, { status });
}

// ============================================================================
// Review Operations
// ============================================================================

/**
 * Get all reviews for a specific store
 */
export async function getReviewsByStoreId(storeId: string) {
  const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
  const q = query(
    reviewsRef,
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  }));
}

/**
 * Create a new review
 */
export async function createReview(reviewData: {
  storeId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
  const docRef = await addDoc(reviewsRef, {
    ...reviewData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

// ============================================================================
// User Operations
// ============================================================================

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/**
 * Create or update user profile
 */
export async function setUserProfile(userId: string, profileData: Record<string, unknown>) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, profileData, { merge: true });
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: UpdateData<Record<string, unknown>>) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, updates);
}

// ============================================================================
// Waitlist Operations
// ============================================================================

/**
 * Add email to waitlist
 */
export async function addToWaitlist(email: string, additionalData?: Record<string, unknown>) {
  const waitlistRef = collection(db, COLLECTIONS.WAITLIST);
  const docRef = await addDoc(waitlistRef, {
    email,
    ...additionalData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

// ============================================================================
// Search Operations
// ============================================================================

/**
 * Search stores by name or description
 * Note: For production, consider using a dedicated search service like Algolia
 */
export async function searchStores(searchTerm: string): Promise<StoreData[]> {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const snapshot = await getDocs(storesRef);

  const normalizedSearch = searchTerm.toLowerCase();

  const stores = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  })) as StoreData[];

  return stores.filter((store) => {
    const nameMatch = store.name?.toLowerCase().includes(normalizedSearch);
    const descriptionMatch = store.description?.toLowerCase().includes(normalizedSearch);
    return nameMatch || descriptionMatch || false;
  });
}
