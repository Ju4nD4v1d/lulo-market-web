/**
 * Analytics Services
 *
 * Export all analytics tracking functions.
 * As new platforms are added (Google Analytics, TikTok Pixel, etc.),
 * their services can be added here.
 */

// Meta Pixel
export {
  trackEvent,
  trackCustomEvent,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackCompleteRegistration,
  trackLead,
  trackContact,
} from './metaPixel';

// Re-export types
export type {
  MetaStandardEvent,
  MetaEventParams,
  PurchaseParams,
  AddToCartParams,
  ViewContentParams,
  SearchParams,
} from '../../config/analytics';
