/**
 * Utility functions for formatting data display
 */

/**
 * Format a price in Canadian dollars
 * @param price - The price to format
 * @returns Formatted price string (e.g., "CAD $12.99")
 */
export const formatPrice = (price: number | undefined): string => {
  return `CAD $${(price || 0).toFixed(2)}`;
};

/**
 * Format a currency amount using Intl.NumberFormat
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'CAD')
 * @param locale - The locale (default: 'en-CA')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currency = 'CAD', 
  locale = 'en-CA'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format a date in a readable format
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date and time in a readable format
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a number with proper thousands separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-CA').format(num);
};