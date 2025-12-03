/**
 * Analytics Configuration
 *
 * Centralized configuration for all analytics platforms.
 * Add new tracking pixels/services here as the platform grows.
 */

import { getAnalyticsConsent } from '../utils/cookieConsent';

/**
 * Check if we're in production environment
 * Meta Pixel should ONLY fire in production to avoid polluting analytics data
 */
const isProduction = import.meta.env.VITE_ENV === 'production' || import.meta.env.PROD;

/**
 * Check if analytics is enabled (production + user consent)
 */
const isAnalyticsEnabled = (): boolean => {
  return isProduction && getAnalyticsConsent() === 'accepted';
};

export const analyticsConfig = {
  meta: {
    pixelId: '366537997530463',
    get enabled() {
      return isAnalyticsEnabled();
    },
  },
  // Future analytics platforms can be added here:
  // google: {
  //   measurementId: 'G-XXXXXXXXXX',
  //   enabled: true,
  // },
  // tiktok: {
  //   pixelId: 'XXXXXXXXXX',
  //   enabled: false,
  // },
};

/**
 * Meta Pixel Standard Events
 * https://developers.facebook.com/docs/meta-pixel/reference
 */
export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe';

/**
 * Event parameters for Meta Pixel
 */
export interface MetaEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  status?: string;
  // Custom parameters
  [key: string]: unknown;
}

/**
 * Purchase event specific parameters
 */
export interface PurchaseParams {
  orderId: string;
  value: number;
  currency?: string;
  contentIds: string[];
  contents: Array<{ id: string; quantity: number; item_price: number }>;
  numItems: number;
}

/**
 * Add to cart event parameters
 */
export interface AddToCartParams {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  currency?: string;
}

/**
 * View content event parameters
 */
export interface ViewContentParams {
  contentId: string;
  contentName: string;
  contentType: 'product' | 'store';
  value?: number;
  currency?: string;
}

/**
 * Search event parameters
 */
export interface SearchParams {
  searchString: string;
  contentCategory?: string;
}
