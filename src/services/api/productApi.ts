/**
 * Product API - CRUD operations for products
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product } from '../../types/product';
import { COLLECTIONS } from './types';

// ============================================================================
// Types
// ============================================================================

export interface CreateProductData {
  name: string;
  category: string;
  storeId: string;
  ownerId?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: string;
  images?: string[];
  pstPercentage?: number;
  gstPercentage?: number;
  ingredients?: {
    main: string[];
    contains?: string[];
  };
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  status?: string;
  images?: string[];
  pstPercentage?: number;
  gstPercentage?: number;
  ingredients?: {
    main: string[];
    contains?: string[];
  };
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all products for a specific store
 * Includes deduplication to prevent duplicate key errors
 */
export async function getProductsByStoreId(storeId: string): Promise<Product[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, where('storeId', '==', storeId));
  const snapshot = await getDocs(q);

  const productsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // Deduplicate products by ID to prevent duplicate key errors
  const uniqueProducts = Array.from(
    new Map(productsData.map(product => [product.id, product])).values()
  );

  return uniqueProducts;
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<Product> {
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

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new product with explicit field handling
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  if (!data.name || !data.category || !data.storeId) {
    throw new Error('Product name, category, and store ID are required');
  }

  const productsRef = collection(db, COLLECTIONS.PRODUCTS);

  // Explicitly define fields to avoid serialization issues
  const productData = {
    name: data.name,
    description: data.description || '',
    price: data.price || 0,
    category: data.category,
    stock: data.stock || 0,
    status: data.status || 'active',
    images: data.images || [],
    pstPercentage: data.pstPercentage || 0,
    gstPercentage: data.gstPercentage || 0,
    ingredients: data.ingredients || { main: [], contains: [] },
    ownerId: data.ownerId,
    storeId: data.storeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(productsRef, productData);

  return { id: docRef.id, ...productData } as Product;
}

/**
 * Update an existing product with explicit field handling
 */
export async function updateProduct(productId: string, data: UpdateProductData): Promise<Product> {
  if (!productId) {
    throw new Error('Product ID is required for updates');
  }

  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

  // Explicitly define fields to avoid serialization issues
  const updateData = {
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    stock: data.stock,
    status: data.status,
    images: data.images,
    pstPercentage: data.pstPercentage,
    gstPercentage: data.gstPercentage,
    ingredients: data.ingredients,
    updatedAt: new Date(),
  };

  await updateDoc(productRef, updateData);

  return { id: productId, ...updateData } as Product;
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  if (!productId) {
    throw new Error('Product ID is required for deletion');
  }

  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(productRef);
}

/**
 * Get all active products across all stores
 * Used for homepage product display and search
 * Includes deduplication to prevent duplicate key errors
 */
export async function getAllActiveProducts(): Promise<Product[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, where('status', '==', 'active'));
  const snapshot = await getDocs(q);

  const productsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // Deduplicate products by ID to prevent duplicate key errors
  const uniqueProducts = Array.from(
    new Map(productsData.map(product => [product.id, product])).values()
  );

  return uniqueProducts;
}

// ============================================================================
// Real-Time Subscriptions
// ============================================================================

/**
 * Subscribe to real-time updates for all products of a store
 * Used for dashboard inventory and product pages
 *
 * @param storeId - The store ID to subscribe to
 * @param onUpdate - Callback function called when products change
 * @param onError - Optional error callback
 * @returns Unsubscribe function to stop listening
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToProductsByStore(
 *   storeId,
 *   (products) => setProducts(products),
 *   (error) => console.error(error)
 * );
 *
 * // When component unmounts
 * unsubscribe();
 * ```
 */
export function subscribeToProductsByStore(
  storeId: string,
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, where('storeId', '==', storeId));

  return onSnapshot(
    q,
    (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Deduplicate products by ID to prevent duplicate key errors
      const uniqueProducts = Array.from(
        new Map(productsData.map(product => [product.id, product])).values()
      );

      onUpdate(uniqueProducts);
    },
    (error) => {
      console.error('Error listening to store products:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}
