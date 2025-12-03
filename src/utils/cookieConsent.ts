/**
 * Cookie Consent Utility
 *
 * Manages user consent for analytics cookies (Meta Pixel).
 * Stores preference in localStorage for persistence across sessions.
 */

const CONSENT_KEY = 'lulocart_analytics_consent';
const META_PIXEL_ID = '366537997530463';

export type ConsentValue = 'accepted' | 'declined';

/**
 * Get the current analytics consent value
 */
export const getAnalyticsConsent = (): ConsentValue | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
};

/**
 * Set the analytics consent value
 */
export const setAnalyticsConsent = (value: ConsentValue): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, value);
};

/**
 * Check if user has made a consent decision
 */
export const hasConsentDecision = (): boolean => {
  return getAnalyticsConsent() !== null;
};

/**
 * Check if analytics is consented
 */
export const isAnalyticsConsented = (): boolean => {
  return getAnalyticsConsent() === 'accepted';
};

/**
 * Initialize Meta Pixel if user has consented
 * Called when user accepts cookies or on page load if already accepted
 */
export const initializePixelIfConsented = (): void => {
  if (typeof window === 'undefined') return;
  if (getAnalyticsConsent() !== 'accepted') return;
  if (typeof window.fbq !== 'function') return;

  try {
    window.fbq('consent', 'grant');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[CookieConsent] Error initializing pixel:', error);
    }
  }
};

/**
 * Handle user accepting cookies
 */
export const acceptAnalyticsCookies = (): void => {
  setAnalyticsConsent('accepted');
  initializePixelIfConsented();
};

/**
 * Handle user declining cookies
 */
export const declineAnalyticsCookies = (): void => {
  setAnalyticsConsent('declined');
};
