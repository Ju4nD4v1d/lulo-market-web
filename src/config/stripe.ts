import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Stripe publishable key is required. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.');
}

// Initialize Stripe
export const stripePromise: Promise<Stripe | null> = loadStripe(stripePublishableKey);

// Platform fee configuration
export const PLATFORM_FEE = {
  FIXED_AMOUNT: parseFloat(import.meta.env.VITE_PLATFORM_FEE_FIXED || '2.00'), // 2 CAD
  PERCENTAGE: parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || '0.10'), // 10%
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  webhookEndpoint: import.meta.env.VITE_STRIPE_WEBHOOK_ENDPOINT,
  currency: 'cad',
  country: 'CA',
};

/**
 * Calculate platform fees for an order
 * Platform gets: Fixed fee (2 CAD) + percentage of order total (10%)
 * Store gets: Remaining amount after platform fees
 */
export function calculatePlatformFees(orderTotal: number) {
  const fixedFee = PLATFORM_FEE.FIXED_AMOUNT;
  const percentageFee = orderTotal * PLATFORM_FEE.PERCENTAGE;
  const totalPlatformFee = fixedFee + percentageFee;
  const storeAmount = orderTotal - totalPlatformFee;
  
  return {
    orderTotal,
    fixedFee,
    percentageFee,
    totalPlatformFee,
    storeAmount,
    // Convert to cents for Stripe
    orderTotalCents: Math.round(orderTotal * 100),
    totalPlatformFeeCents: Math.round(totalPlatformFee * 100),
    storeAmountCents: Math.round(storeAmount * 100),
  };
}

/**
 * Format amount to display in CAD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
}

/**
 * Calculate the final order total including platform fee
 * This is what the customer pays: original order total + 2 CAD platform fee
 */
export function calculateCustomerTotal(orderSubtotal: number, tax: number, deliveryFee: number) {
  const baseOrderTotal = orderSubtotal + tax + deliveryFee;
  const platformFeeForCustomer = PLATFORM_FEE.FIXED_AMOUNT; // Customer pays 2 CAD extra
  const finalCustomerTotal = baseOrderTotal + platformFeeForCustomer;
  
  return {
    baseOrderTotal,
    platformFeeForCustomer,
    finalCustomerTotal,
    // For Stripe (in cents)
    finalCustomerTotalCents: Math.round(finalCustomerTotal * 100)
  };
}