/**
 * Store API - CRUD operations for stores
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
  GeoPoint,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StoreData } from '../../types';
import { COLLECTIONS, safeDate } from './types';

// ============================================================================
// Types
// ============================================================================

export interface CreateStoreData {
  name: string;
  description: string;
  category: string;
  cuisine: string;
  location: {
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  socialMedia?: Record<string, string>;
  businessHours?: Record<string, unknown>;
  deliveryHours?: Record<string, unknown>;
  deliveryOptions?: Record<string, boolean>;
  paymentMethods?: string[];
  cuisineType?: string[];
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  storeImage?: string;
  imageUrl?: string;
  aboutUs?: Array<{ title: string; content: string; imageUrl: string }>;
  ownerId: string;
  lowStockThreshold?: number;
}

export interface UpdateStoreData {
  name?: string;
  description?: string;
  category?: string;
  cuisine?: string;
  location?: {
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  socialMedia?: Record<string, string>;
  businessHours?: Record<string, unknown>;
  deliveryHours?: Record<string, unknown>;
  deliveryOptions?: Record<string, boolean>;
  paymentMethods?: string[];
  cuisineType?: string[];
  priceRange?: string;
  images?: string[];
  storeImage?: string;
  imageUrl?: string;
  aboutUs?: Array<{ title: string; content: string; imageUrl: string }>;
  lowStockThreshold?: number;
}

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Transform raw Firestore data to normalized StoreData
 * Handles missing fields and legacy data structures
 */
export function transformStoreDocument(docId: string, data: Record<string, unknown>): StoreData {
  return {
    id: docId,
    name: (data.name as string) || '',
    description: (data.description as string) || '',
    category: (data.category as string) || '',
    cuisine: (data.cuisine as string) || (data.category as string) || '',
    country: (data.country as string) || 'Canada',
    location: (data.location as StoreData['location']) || {
      address: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
      coordinates: { lat: 0, lng: 0 }
    },
    address: (data.address as string) || (data.location as Record<string, unknown>)?.address as string || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
    website: (data.website as string) || '',
    instagram: (data.instagram as string) || (data.socialMedia as Record<string, string>)?.instagram || '',
    facebook: (data.facebook as string) || (data.socialMedia as Record<string, string>)?.facebook || '',
    twitter: (data.twitter as string) || (data.socialMedia as Record<string, string>)?.twitter || '',
    socialMedia: (data.socialMedia as Record<string, string>) || {},
    businessHours: (data.businessHours as Record<string, unknown>) || {},
    deliveryHours: (data.deliveryHours as Record<string, unknown>) || (data.businessHours as Record<string, unknown>) || {},
    deliveryOptions: (data.deliveryOptions as StoreData['deliveryOptions']) || {
      delivery: false,
      pickup: false,
      dineIn: false
    },
    paymentMethods: (data.paymentMethods as string[]) || [],
    cuisineType: (data.cuisineType as string[]) || [],
    priceRange: (data.priceRange as string) || '$$',
    rating: (data.rating as number) || 0,
    reviewCount: (data.reviewCount as number) || 0,
    images: (data.images as string[]) || [],
    storeImage: (data.storeImage as string) || (data.imageUrl as string) || ((data.images as string[]) && (data.images as string[])[0]) || '',
    imageUrl: (data.imageUrl as string) || (data.storeImage as string) || ((data.images as string[]) && (data.images as string[])[0]) || '',
    aboutUs: (data.aboutUs as StoreData['aboutUs']) || [],
    aboutUsSections: (data.aboutUsSections as StoreData['aboutUs']) || (data.aboutUs as StoreData['aboutUs']) || [],
    verified: (data.verified as boolean) || false,
    featured: (data.featured as boolean) || false,
    ownerId: (data.ownerId as string) || '',
    ownerEmail: (data.ownerEmail as string) || '',
    createdAt: safeDate(data.createdAt),
    updatedAt: safeDate(data.updatedAt),
    // Stripe Connect fields
    stripeAccountId: (data.stripeAccountId as string) || undefined,
    stripeEnabled: (data.stripeEnabled as boolean) || false,
    stripePayoutsEnabled: (data.stripePayoutsEnabled as boolean) || false,
    stripeDetailsSubmitted: (data.stripeDetailsSubmitted as boolean) || false,
    stripeAccountStatus: (data.stripeAccountStatus as string) || undefined,
    // Inventory settings
    lowStockThreshold: (data.lowStockThreshold as number) ?? 10,
    // Founder program
    isFounderStore: (data.isFounderStore as boolean) ?? false,
  };
}

/**
 * Prepare store data for Firestore write
 * Converts coordinates to GeoPoint and filters undefined values
 */
export function prepareStoreForFirestore(
  data: CreateStoreData | UpdateStoreData,
  isCreate: boolean = false
): Record<string, unknown> {
  const firestoreData: Record<string, unknown> = {};

  // Core fields
  if (data.name !== undefined) firestoreData.name = data.name;
  if (data.description !== undefined) firestoreData.description = data.description;
  if (data.category !== undefined) firestoreData.category = data.category;
  if (data.cuisine !== undefined) firestoreData.cuisine = data.cuisine;

  // Location with GeoPoint
  if (data.location) {
    firestoreData.location = {
      address: data.location.address,
      city: data.location.city || '',
      province: data.location.province || '',
      postalCode: data.location.postalCode || '',
      coordinates: new GeoPoint(
        data.location.coordinates.lat,
        data.location.coordinates.lng
      ),
      placeId: data.location.placeId || '',
    };
  }

  // Contact info
  if (data.phone !== undefined) firestoreData.phone = data.phone || '';
  if (data.email !== undefined) firestoreData.email = data.email || '';
  if (data.website !== undefined) firestoreData.website = data.website || '';

  // Social media - only add if present
  if (data.instagram) firestoreData.instagram = data.instagram;
  if (data.facebook) firestoreData.facebook = data.facebook;
  if (data.twitter) firestoreData.twitter = data.twitter;
  if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
    firestoreData.socialMedia = data.socialMedia;
  }

  // Business settings
  if (data.businessHours !== undefined) firestoreData.businessHours = data.businessHours || {};
  if (data.deliveryHours !== undefined) firestoreData.deliveryHours = data.deliveryHours || {};
  if (data.deliveryOptions !== undefined) firestoreData.deliveryOptions = data.deliveryOptions || {};
  if (data.paymentMethods !== undefined) firestoreData.paymentMethods = data.paymentMethods || [];
  if (data.cuisineType !== undefined) firestoreData.cuisineType = data.cuisineType || [];
  if (data.priceRange !== undefined) firestoreData.priceRange = data.priceRange || '$$';

  // Images
  if (data.images !== undefined) firestoreData.images = data.images || [];
  if (data.storeImage !== undefined) firestoreData.storeImage = data.storeImage || '';
  if (data.imageUrl !== undefined) firestoreData.imageUrl = data.imageUrl || '';

  // About sections
  if (data.aboutUs !== undefined) firestoreData.aboutUs = data.aboutUs || [];

  // Inventory settings
  if ('lowStockThreshold' in data && data.lowStockThreshold !== undefined) {
    firestoreData.lowStockThreshold = data.lowStockThreshold;
  }

  // Timestamps
  firestoreData.updatedAt = new Date();
  if (isCreate) {
    firestoreData.createdAt = new Date();
  }

  // Create-only fields
  if (isCreate && 'ownerId' in data) {
    firestoreData.ownerId = (data as CreateStoreData).ownerId;
    firestoreData.verified = false;
    firestoreData.featured = false;
    firestoreData.rating = (data as CreateStoreData).rating || 0;
    firestoreData.reviewCount = (data as CreateStoreData).reviewCount || 0;
    // New stores automatically get founder status
    firestoreData.isFounderStore = true;
  }

  return firestoreData;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all stores from the database
 */
export async function getAllStores(): Promise<StoreData[]> {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const snapshot = await getDocs(storesRef);

  return snapshot.docs.map((doc) =>
    transformStoreDocument(doc.id, doc.data())
  );
}

/**
 * Get a single store by ID
 */
export async function getStoreById(storeId: string): Promise<StoreData> {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const snapshot = await getDoc(storeRef);

  if (!snapshot.exists()) {
    throw new Error(`Store with ID ${storeId} not found`);
  }

  return transformStoreDocument(snapshot.id, snapshot.data());
}

/**
 * Get store by owner ID - returns null if not found
 */
export async function getStoreByOwner(ownerId: string): Promise<StoreData | null> {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const q = query(storesRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const storeDoc = snapshot.docs[0];
  return transformStoreDocument(storeDoc.id, storeDoc.data());
}

/**
 * Get store ID by owner ID - returns just the ID or null
 */
export async function getStoreIdByOwner(ownerId: string): Promise<string | null> {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const q = query(storesRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].id;
}

/**
 * Get store by owner ID with full data - returns both storeId and storeData
 * Used by useStoreByOwnerQuery for dashboard
 */
export async function getStoreByOwnerWithData(
  ownerId: string
): Promise<{ storeId: string | null; storeData: StoreData | null }> {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const q = query(storesRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { storeId: null, storeData: null };
  }

  const storeDoc = snapshot.docs[0];
  return {
    storeId: storeDoc.id,
    storeData: transformStoreDocument(storeDoc.id, storeDoc.data())
  };
}

// ============================================================================
// Count Operations (for stats)
// ============================================================================

/**
 * Get product count for a store
 */
export async function getProductCountByStore(storeId: string): Promise<number> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, where('storeId', '==', storeId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Get order count for a store
 */
export async function getOrderCountByStore(storeId: string): Promise<number> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(ordersRef, where('storeId', '==', storeId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new store with explicit field handling
 */
export async function createStore(data: CreateStoreData): Promise<StoreData> {
  if (!data.name || !data.ownerId) {
    throw new Error('Store name and owner ID are required');
  }

  const storesRef = collection(db, COLLECTIONS.STORES);
  const firestoreData = prepareStoreForFirestore(data, true);
  const docRef = await addDoc(storesRef, firestoreData);

  return {
    id: docRef.id,
    ...transformStoreDocument(docRef.id, firestoreData as Record<string, unknown>)
  };
}

/**
 * Update an existing store with explicit field handling
 */
export async function updateStore(storeId: string, data: UpdateStoreData): Promise<StoreData> {
  if (!storeId) {
    throw new Error('Store ID is required for updates');
  }

  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const firestoreData = prepareStoreForFirestore(data, false);
  await updateDoc(storeRef, firestoreData);

  // Fetch updated store to return
  return getStoreById(storeId);
}

/**
 * Delete a store
 */
export async function deleteStore(storeId: string): Promise<void> {
  if (!storeId) {
    throw new Error('Store ID is required for deletion');
  }

  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  await deleteDoc(storeRef);
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

  const stores = snapshot.docs.map((doc) =>
    transformStoreDocument(doc.id, doc.data())
  );

  return stores.filter((store) => {
    const nameMatch = store.name?.toLowerCase().includes(normalizedSearch);
    const descriptionMatch = store.description?.toLowerCase().includes(normalizedSearch);
    return nameMatch || descriptionMatch || false;
  });
}

// ============================================================================
// Payment Operations
// ============================================================================

/**
 * Get store's Stripe account ID for payment processing
 * Returns null if store doesn't have Stripe configured
 */
export async function getStoreStripeAccountId(storeId: string): Promise<string | null> {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const snapshot = await getDoc(storeRef);

  if (!snapshot.exists()) {
    throw new Error(`Store with ID ${storeId} not found`);
  }

  const data = snapshot.data();
  return (data.stripeAccountId as string) || null;
}

/**
 * Store Stripe account information
 */
export interface StoreStripeAccount {
  stripeAccountId: string | null;
  stripeEnabled: boolean;
  stripeAccountStatus: string | null;
}

/**
 * Get store's Stripe account information
 */
export async function getStoreStripeAccount(storeId: string): Promise<StoreStripeAccount> {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const snapshot = await getDoc(storeRef);

  if (!snapshot.exists()) {
    return { stripeAccountId: null, stripeEnabled: false, stripeAccountStatus: null };
  }

  const data = snapshot.data();
  return {
    stripeAccountId: (data.stripeAccountId as string) || null,
    stripeEnabled: (data.stripeEnabled as boolean) || false,
    stripeAccountStatus: (data.stripeAccountStatus as string) || null
  };
}

/**
 * Store receipt information
 */
export interface StoreReceiptInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website: string;
  businessNumber: string;
}

/**
 * Get store information for receipt generation
 */
export async function getStoreReceiptInfo(storeId: string): Promise<StoreReceiptInfo> {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  const snapshot = await getDoc(storeRef);

  if (!snapshot.exists()) {
    return {
      name: '',
      address: '',
      phone: '',
      email: '',
      logo: '',
      website: 'https://lulocart.com',
      businessNumber: ''
    };
  }

  const data = snapshot.data();
  return {
    name: (data.name as string) || '',
    address: (data.location as { address?: string })?.address || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
    logo: (data.logo as string) || (data.storeImage as string) || '',
    website: (data.website as string) || 'https://lulocart.com',
    businessNumber: (data.businessNumber as string) || ''
  };
}
