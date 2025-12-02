/**
 * Meta Pixel Service
 *
 * Provides methods to track events with the Meta (Facebook) Pixel.
 * The base pixel code is loaded in index.html.
 */

import {
  analyticsConfig,
  MetaStandardEvent,
  MetaEventParams,
  PurchaseParams,
  AddToCartParams,
  ViewContentParams,
  SearchParams,
} from '../../config/analytics';

// Default currency for the platform
const DEFAULT_CURRENCY = 'CAD';

/**
 * Check if Meta Pixel is available
 */
const isPixelAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Track a standard Meta Pixel event
 */
export const trackEvent = (
  eventName: MetaStandardEvent,
  params?: MetaEventParams
): void => {
  if (!analyticsConfig.meta.enabled) return;

  if (!isPixelAvailable()) {
    if (import.meta.env.DEV) {
      console.log(`[Meta Pixel] Event queued (pixel not loaded): ${eventName}`, params);
    }
    return;
  }

  try {
    if (params) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Meta Pixel] Error tracking event:', error);
    }
  }
};

/**
 * Track a custom event (non-standard)
 */
export const trackCustomEvent = (
  eventName: string,
  params?: MetaEventParams
): void => {
  if (!analyticsConfig.meta.enabled) return;

  if (!isPixelAvailable()) {
    if (import.meta.env.DEV) {
      console.log(`[Meta Pixel] Custom event queued: ${eventName}`, params);
    }
    return;
  }

  try {
    if (params) {
      window.fbq('trackCustom', eventName, params);
    } else {
      window.fbq('trackCustom', eventName);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Meta Pixel] Error tracking custom event:', error);
    }
  }
};

/**
 * Track page view - called automatically on route changes
 */
export const trackPageView = (): void => {
  trackEvent('PageView');
};

/**
 * Track when a user views a product or store
 */
export const trackViewContent = ({
  contentId,
  contentName,
  contentType,
  value,
  currency = DEFAULT_CURRENCY,
}: ViewContentParams): void => {
  trackEvent('ViewContent', {
    content_ids: [contentId],
    content_name: contentName,
    content_type: contentType === 'product' ? 'product' : 'product_group',
    value,
    currency,
  });
};

/**
 * Track when a user adds an item to cart
 */
export const trackAddToCart = ({
  productId,
  productName,
  price,
  quantity,
  currency = DEFAULT_CURRENCY,
}: AddToCartParams): void => {
  trackEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency,
    contents: [{ id: productId, quantity, item_price: price }],
  });
};

/**
 * Track when a user initiates checkout
 */
export const trackInitiateCheckout = (
  value: number,
  contentIds: string[],
  numItems: number,
  currency = DEFAULT_CURRENCY
): void => {
  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value,
    currency,
    num_items: numItems,
  });
};

/**
 * Track when a user adds payment info
 */
export const trackAddPaymentInfo = (): void => {
  trackEvent('AddPaymentInfo');
};

/**
 * Track a completed purchase
 */
export const trackPurchase = ({
  orderId,
  value,
  currency = DEFAULT_CURRENCY,
  contentIds,
  contents,
  numItems,
}: PurchaseParams): void => {
  trackEvent('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value,
    currency,
    num_items: numItems,
    contents,
    // Custom parameter for order reference
    order_id: orderId,
  });
};

/**
 * Track search queries
 */
export const trackSearch = ({
  searchString,
  contentCategory,
}: SearchParams): void => {
  trackEvent('Search', {
    search_string: searchString,
    content_category: contentCategory,
  });
};

/**
 * Track user registration
 */
export const trackCompleteRegistration = (
  method: 'email' | 'google' | 'facebook' = 'email'
): void => {
  trackEvent('CompleteRegistration', {
    content_name: method,
    status: 'complete',
  });
};

/**
 * Track lead generation (e.g., waitlist signup, store owner signup)
 */
export const trackLead = (leadType: string): void => {
  trackEvent('Lead', {
    content_name: leadType,
  });
};

/**
 * Track contact form submissions
 */
export const trackContact = (): void => {
  trackEvent('Contact');
};
