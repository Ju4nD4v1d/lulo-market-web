/**
 * Meta Pixel (Facebook Pixel) Type Definitions
 *
 * These types allow TypeScript to recognize the global fbq function
 * that is loaded via the Meta Pixel script in index.html.
 */

interface MetaPixelEventParams {
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
  [key: string]: unknown;
}

type MetaPixelStandardEvent =
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

interface MetaPixelFunction {
  (command: 'init', pixelId: string): void;
  (command: 'track', eventName: MetaPixelStandardEvent, params?: MetaPixelEventParams): void;
  (command: 'trackCustom', eventName: string, params?: MetaPixelEventParams): void;
  (command: 'trackSingle', pixelId: string, eventName: string, params?: MetaPixelEventParams): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

export {};
