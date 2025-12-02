/**
 * API Layer - Domain-specific API modules
 *
 * This module provides a clean, domain-driven interface for all database operations.
 * Each domain (stores, products, orders, users) has its own API file with:
 * - Read operations (queries)
 * - Write operations (mutations)
 * - Data transformations
 *
 * Usage:
 *   import { storeApi, productApi, orderApi, userApi } from '../services/api';
 *
 *   // Get all stores
 *   const stores = await storeApi.getAllStores();
 *
 *   // Get product by ID
 *   const product = await productApi.getProductById('abc123');
 *
 *   // Update order status
 *   await orderApi.updateOrderStatus('order123', OrderStatus.DELIVERED);
 */

// Domain APIs
export * as storeApi from './storeApi';
export * as productApi from './productApi';
export * as orderApi from './orderApi';
export * as userApi from './userApi';
export * as storageApi from './storageApi';
export * as analyticsApi from './analyticsApi';
export * as waitlistApi from './waitlistApi';
export * as leadsApi from './leadsApi';
export * as driverApi from './driverApi';

// Shared types and helpers
export { COLLECTIONS, safeDate } from './types';

// Re-export individual functions for backwards compatibility with old api.ts imports
// This allows gradual migration without breaking existing code
export {
  getAllStores,
  getStoreById,
  getStoreByOwner,
  createStore,
  updateStore,
  deleteStore,
  searchStores,
} from './storeApi';

export {
  getProductsByStoreId,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productApi';

export type { CreateProductData, UpdateProductData } from './productApi';

export {
  getOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersByUser,
  createOrder,
  createOrderWithId,
  updateOrder,
  updateOrderStatus,
  transformOrderDocument,
  recordFailedOrder,
} from './orderApi';
export type { FailedOrderData } from './orderApi';

export {
  getUserProfile,
  setUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from './userApi';

export type { CreateStoreData, UpdateStoreData } from './storeApi';
export {
  transformStoreDocument,
  getStoreByOwnerWithData,
  getStoreIdByOwner,
  getProductCountByStore,
  getOrderCountByStore,
} from './storeApi';

export {
  uploadImage,
  uploadStoreImage,
  uploadProductImage,
  uploadAboutSectionImages,
  uploadAvatar,
  deleteImage,
} from './storageApi';
export type { AboutSection, ProcessedAboutSection } from './storageApi';
