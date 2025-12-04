import Stripe from 'stripe';
import { calculatePlatformFees, STRIPE_CONFIG } from '../config/stripe';
import { Order } from '../types/order';

// Note: This service is for server-side use only (Firebase Functions)
// Client-side payment intent creation should use Firebase Functions
let stripe: Stripe | null = null;

const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Stripe secret key not found');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }
  return stripe;
};

export interface CreatePaymentIntentRequest {
  order: Order;
  storeStripeAccountId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  platformFeeAmount: number;
  storeAmount: number;
}

/**
 * Create a payment intent with platform fee structure
 * Customer pays: order total + 2 CAD platform fee
 * Platform keeps: 2 CAD + 10% of order total
 * Store receives: remaining amount after platform fees
 */
export async function createPaymentIntent({
  order,
  storeStripeAccountId
}: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
  try {
    // Calculate fees using the final total (what customer pays)
    const customerTotal = order.summary.finalTotal;
    const orderTotal = order.summary.total; // Base order total without platform fee
    
    // Calculate platform fees
    const feeCalculation = calculatePlatformFees(orderTotal);
    
    // Create payment intent
    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(customerTotal * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      metadata: {
        orderId: order.id,
        storeId: order.storeId,
        storeName: order.storeName,
        customerEmail: order.customerInfo.email,
        orderType: order.isDelivery ? 'delivery' : 'pickup',
        customerTotal: customerTotal.toString(),
        orderTotal: orderTotal.toString(),
        platformFee: feeCalculation.totalPlatformFee.toString(),
        storeAmount: feeCalculation.storeAmount.toString(),
      },
      application_fee_amount: feeCalculation.totalPlatformFeeCents,
      transfer_data: {
        destination: storeStripeAccountId,
      },
      description: `Order ${order.id} from ${order.storeName}`,
      receipt_email: order.customerInfo.email,
      shipping: order.isDelivery ? {
        name: order.customerInfo.name,
        phone: order.customerInfo.phone,
        address: {
          line1: order.deliveryAddress.street,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.province,
          postal_code: order.deliveryAddress.postalCode,
          country: order.deliveryAddress.country,
        },
      } : undefined,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      platformFeeAmount: feeCalculation.totalPlatformFee,
      storeAmount: feeCalculation.storeAmount,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await getStripe().paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update payment intent (if needed before confirmation)
 */
export async function updatePaymentIntent(
  paymentIntentId: string, 
  updates: Partial<Stripe.PaymentIntentUpdateParams>
): Promise<Stripe.PaymentIntent> {
  try {
    return await getStripe().paymentIntents.update(paymentIntentId, updates);
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw new Error(`Failed to update payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle webhook events from Stripe
 */
export async function handleWebhookEvent(
  payload: string | Buffer, 
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  try {
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process successful payment webhook
 */
export async function processSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  const storeId = paymentIntent.metadata.storeId;
  
  if (!orderId || !storeId) {
    throw new Error('Order ID or Store ID not found in payment intent metadata');
  }

  // Return data for order update
  return {
    orderId,
    storeId,
    paymentIntentId: paymentIntent.id,
    transferId: paymentIntent.transfer_data?.destination,
    amountReceived: paymentIntent.amount_received,
    currency: paymentIntent.currency,
    paymentMethod: paymentIntent.payment_method_types[0],
    receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
  };
}

/**
 * Get Stripe account information for a store
 */
export async function getStripeAccountInfo(accountId: string) {
  try {
    return await getStripe().accounts.retrieve(accountId);
  } catch (error) {
    console.error('Error retrieving Stripe account:', error);
    throw new Error(`Failed to retrieve Stripe account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { getStripe };