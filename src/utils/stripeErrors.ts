/**
 * Centralized Stripe error handling utilities
 *
 * Maps Stripe error codes to user-friendly, translatable messages.
 * Use this module to ensure consistent error handling across the checkout flow.
 */

/**
 * Stripe error codes that we handle specifically
 */
export type StripeErrorCode =
  | 'card_declined'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'incorrect_number'
  | 'insufficient_funds'
  | 'invalid_expiry_month'
  | 'invalid_expiry_year'
  | 'invalid_number'
  | 'processing_error'
  | 'rate_limit'
  | 'authentication_required'
  | 'payment_intent_authentication_failure'
  | 'payment_method_not_available'
  | 'setup_intent_authentication_failure'
  | 'generic_decline'
  | 'fraudulent'
  | 'lost_card'
  | 'stolen_card'
  | 'do_not_honor'
  | 'try_again_later';

/**
 * Map of Stripe error codes to translation keys
 */
const ERROR_CODE_TO_TRANSLATION_KEY: Record<string, string> = {
  // Card validation errors
  'card_declined': 'stripeError.cardDeclined',
  'generic_decline': 'stripeError.cardDeclined',
  'expired_card': 'stripeError.expiredCard',
  'incorrect_cvc': 'stripeError.incorrectCvc',
  'incorrect_number': 'stripeError.incorrectNumber',
  'invalid_number': 'stripeError.invalidNumber',
  'invalid_expiry_month': 'stripeError.invalidExpiry',
  'invalid_expiry_year': 'stripeError.invalidExpiry',
  'insufficient_funds': 'stripeError.insufficientFunds',

  // Processing errors
  'processing_error': 'stripeError.processingError',
  'rate_limit': 'stripeError.rateLimited',

  // Authentication errors
  'authentication_required': 'stripeError.authenticationRequired',
  'payment_intent_authentication_failure': 'stripeError.authenticationFailed',
  'setup_intent_authentication_failure': 'stripeError.authenticationFailed',
  'payment_method_not_available': 'stripeError.paymentMethodUnavailable',

  // Fraud and security
  'fraudulent': 'stripeError.cardDeclined',
  'lost_card': 'stripeError.cardDeclined',
  'stolen_card': 'stripeError.cardDeclined',
  'do_not_honor': 'stripeError.cardDeclined',

  // Temporary errors
  'try_again_later': 'stripeError.tryAgainLater',
};

/**
 * Stripe decline codes that map to specific messages
 */
const DECLINE_CODE_TO_TRANSLATION_KEY: Record<string, string> = {
  'generic_decline': 'stripeError.cardDeclined',
  'insufficient_funds': 'stripeError.insufficientFunds',
  'lost_card': 'stripeError.cardDeclined',
  'stolen_card': 'stripeError.cardDeclined',
  'expired_card': 'stripeError.expiredCard',
  'incorrect_cvc': 'stripeError.incorrectCvc',
  'processing_error': 'stripeError.processingError',
  'incorrect_number': 'stripeError.incorrectNumber',
  'card_velocity_exceeded': 'stripeError.tooManyAttempts',
  'do_not_honor': 'stripeError.cardDeclined',
  'try_again_later': 'stripeError.tryAgainLater',
  'not_permitted': 'stripeError.cardDeclined',
  'service_not_allowed': 'stripeError.cardDeclined',
  'transaction_not_allowed': 'stripeError.cardDeclined',
};

/**
 * Interface for Stripe error object
 */
export interface StripeErrorInfo {
  type?: string;
  code?: string;
  decline_code?: string;
  message?: string;
  param?: string;
}

/**
 * Get the appropriate translation key for a Stripe error
 *
 * @param error - The Stripe error object or error code
 * @returns Translation key for the error message
 */
export function getStripeErrorTranslationKey(error: StripeErrorInfo | string): string {
  // If it's just a string code
  if (typeof error === 'string') {
    return ERROR_CODE_TO_TRANSLATION_KEY[error] || 'stripeError.generic';
  }

  // Check decline code first (more specific)
  if (error.decline_code && DECLINE_CODE_TO_TRANSLATION_KEY[error.decline_code]) {
    return DECLINE_CODE_TO_TRANSLATION_KEY[error.decline_code];
  }

  // Then check error code
  if (error.code && ERROR_CODE_TO_TRANSLATION_KEY[error.code]) {
    return ERROR_CODE_TO_TRANSLATION_KEY[error.code];
  }

  // Fallback to generic error
  return 'stripeError.generic';
}

/**
 * Get a user-friendly error message for a Stripe error
 *
 * @param error - The Stripe error object
 * @param t - Translation function
 * @returns User-friendly error message
 */
export function getStripeErrorMessage(
  error: StripeErrorInfo | string | null | undefined,
  t: (key: string) => string
): string {
  if (!error) {
    return t('stripeError.generic');
  }

  const translationKey = getStripeErrorTranslationKey(error);
  return t(translationKey);
}

/**
 * Check if an error is a retryable Stripe error
 *
 * @param error - The Stripe error object
 * @returns Whether the error is retryable
 */
export function isRetryableStripeError(error: StripeErrorInfo): boolean {
  const retryableCodes = [
    'processing_error',
    'rate_limit',
    'try_again_later',
  ];

  return (
    (error.code && retryableCodes.includes(error.code)) ||
    (error.decline_code === 'try_again_later')
  );
}

/**
 * Check if an error requires user action (e.g., updating card info)
 *
 * @param error - The Stripe error object
 * @returns Whether user action is required
 */
export function requiresUserAction(error: StripeErrorInfo): boolean {
  const actionRequiredCodes = [
    'expired_card',
    'incorrect_cvc',
    'incorrect_number',
    'invalid_number',
    'invalid_expiry_month',
    'invalid_expiry_year',
    'insufficient_funds',
    'authentication_required',
  ];

  return (
    (error.code && actionRequiredCodes.includes(error.code)) ||
    (error.decline_code && ['insufficient_funds', 'expired_card', 'incorrect_cvc'].includes(error.decline_code))
  );
}

/**
 * Log Stripe error for debugging (sanitized for production)
 *
 * @param error - The Stripe error object
 * @param context - Additional context for the error
 */
export function logStripeError(error: StripeErrorInfo, context: string): void {
  // In production, we'd send this to an error tracking service
  console.error(`[Stripe Error] ${context}:`, {
    type: error.type,
    code: error.code,
    decline_code: error.decline_code,
    // Don't log the full message as it might contain sensitive info
  });
}
