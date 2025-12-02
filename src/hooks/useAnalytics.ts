/**
 * useAnalytics Hook
 *
 * Provides analytics tracking functions for React components.
 * Wraps the analytics services for easy use in components.
 */

import { useCallback } from 'react';
import {
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
  trackCustomEvent,
  AddToCartParams,
  ViewContentParams,
  SearchParams,
  PurchaseParams,
} from '../services/analytics';

export const useAnalytics = () => {
  // Page view - typically called on route changes
  const logPageView = useCallback(() => {
    trackPageView();
  }, []);

  // View content - product or store detail pages
  const logViewContent = useCallback((params: ViewContentParams) => {
    trackViewContent(params);
  }, []);

  // Add to cart
  const logAddToCart = useCallback((params: AddToCartParams) => {
    trackAddToCart(params);
  }, []);

  // Initiate checkout
  const logInitiateCheckout = useCallback(
    (value: number, contentIds: string[], numItems: number) => {
      trackInitiateCheckout(value, contentIds, numItems);
    },
    []
  );

  // Add payment info
  const logAddPaymentInfo = useCallback(() => {
    trackAddPaymentInfo();
  }, []);

  // Purchase complete
  const logPurchase = useCallback((params: PurchaseParams) => {
    trackPurchase(params);
  }, []);

  // Search
  const logSearch = useCallback((params: SearchParams) => {
    trackSearch(params);
  }, []);

  // Registration complete
  const logCompleteRegistration = useCallback(
    (method: 'email' | 'google' | 'facebook' = 'email') => {
      trackCompleteRegistration(method);
    },
    []
  );

  // Lead generation
  const logLead = useCallback((leadType: string) => {
    trackLead(leadType);
  }, []);

  // Contact form
  const logContact = useCallback(() => {
    trackContact();
  }, []);

  // Custom event for platform-specific tracking
  const logCustomEvent = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      trackCustomEvent(eventName, params);
    },
    []
  );

  return {
    logPageView,
    logViewContent,
    logAddToCart,
    logInitiateCheckout,
    logAddPaymentInfo,
    logPurchase,
    logSearch,
    logCompleteRegistration,
    logLead,
    logContact,
    logCustomEvent,
  };
};
