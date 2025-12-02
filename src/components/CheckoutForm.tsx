import type * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { theme } from '../config/theme';
import { ArrowLeft, User, MapPin, CreditCard, ShoppingBag, AlertCircle, Clock } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CustomerInfo, DeliveryAddress, Order, OrderStatus } from '../types/order';
import { CartState } from '../types/cart';
import { serverTimestamp } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import * as storeApi from '../services/api/storeApi';
import * as orderApi from '../services/api/orderApi';
import { getStripePromise } from '../config/stripe';
import { StripePaymentForm } from './StripePaymentForm';
import { generateOrderId, generateReceiptNumber, calculateTaxBreakdown } from '../utils/orderUtils';

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% hidden platform fee

// Helper function to get store information for receipt
const getStoreInfoForReceipt = async (storeId: string) => {
  try {
    const storeData = await storeApi.getStoreById(storeId);
    return {
      name: storeData.name || '',
      address: storeData.location?.address || '',
      phone: storeData.phone || '',
      email: storeData.email || '',
      logo: storeData.storeImage || '',
      website: storeData.website || 'https://lulocart.com',
      businessNumber: ''
    };
  } catch (error) {
    console.error('Error fetching store info:', error);
  }

  return {
    name: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    website: 'https://lulocart.com',
    businessNumber: ''
  };
};

// Helper function to build enhanced order data
const buildEnhancedOrderData = async (
  orderId: string,
  cart: CartState,
  formData: FormData,
  currentUser: FirebaseUser | null,
  locale: string,
  paymentIntentId?: string,
  orderStatus: OrderStatus = OrderStatus.PENDING
) => {
  // Get store information for receipt
  const storeInfo = await getStoreInfoForReceipt(cart.storeId || '');
  
  // Calculate tax breakdown
  const taxBreakdown = calculateTaxBreakdown(cart.summary.subtotal, formData.deliveryAddress.province);
  
  // Generate receipt number
  const receiptNumber = generateReceiptNumber(orderId);
  
  const now = new Date();
  const orderPlacedAt = now;
  const preferredDeliveryTime = formData.preferredDeliveryTime 
    ? new Date(`${formData.deliveryDate}T${formData.preferredDeliveryTime}`)
    : new Date(formData.deliveryDate);

  return {
    id: orderId,
    userId: currentUser?.uid || '',
    storeId: cart.storeId || '',
    storeName: cart.storeName || '',
    customerInfo: {
      name: formData.customerInfo.name || '',
      email: formData.customerInfo.email || '',
      phone: formData.customerInfo.phone || ''
    },
    deliveryAddress: {
      street: formData.deliveryAddress.street || '',
      city: formData.deliveryAddress.city || '',
      province: formData.deliveryAddress.province || '',
      postalCode: formData.deliveryAddress.postalCode || '',
      country: formData.deliveryAddress.country || 'Canada',
      deliveryInstructions: formData.deliveryAddress.deliveryInstructions || '',
      accessInstructions: formData.accessInstructions || '',
      deliveryZone: formData.deliveryAddress.city || '',
      estimatedDistance: 0 // Could be calculated later
    },
    items: cart.items.map((item) => ({
      id: item.id || '',
      productId: item.product.id || '',
      productName: item.product.name || '',
      productDescription: item.product.description || '',
      productImage: item.product.images?.[0] || '',
      productImageUrl: item.product.images?.[0] || '',
      price: item.priceAtTime || 0,
      quantity: item.quantity || 1,
      specialInstructions: item.specialInstructions || '',
      itemModifications: item.itemModifications || [],
      itemNotes: item.itemNotes || ''
    })),
    summary: {
      ...cart.summary,
      storeAmount: cart.summary?.total ? cart.summary.total * 0.9 : 0,
      platformAmount: cart.summary ? cart.summary.platformFee + (cart.summary.total * 0.1) : 0,
      discountAmount: cart.summary.discountAmount || 0,
      tipAmount: formData.tipAmount || 0,
      serviceFee: 0,
      taxBreakdown
    },
    status: orderStatus,
    orderNotes: formData.orderNotes || '',
    
    // Enhanced: Receipt Information
    receiptNumber,
    orderType: formData.isDelivery ? 'delivery' : 'pickup',
    
    // Enhanced: Delivery Details
    preferredDeliveryTime,
    estimatedDeliveryTime: new Date(formData.deliveryDate),
    deliveryNotes: '',
    deliveryZone: formData.deliveryAddress.city || '',
    
    // Enhanced: Order Experience
    customerNotes: formData.customerNotes || '',
    specialRequests: formData.specialRequests || '',
    promotionalCodes: formData.promotionalCodes || [],
    orderSource: 'web',
    
    // Enhanced: Store Information for Receipt
    storeInfo,
    
    // Enhanced: Timing Information
    orderPlacedAt,
    preparationStartedAt: null,
    readyForPickupAt: null,
    
    // Enhanced: Payment Details for Receipt
    paymentDetails: paymentIntentId ? {
      method: 'credit_card',
      last4Digits: '',
      cardBrand: '',
      authorizationCode: '',
      transactionId: paymentIntentId
    } : {
      method: 'cash',
      last4Digits: '',
      cardBrand: '',
      authorizationCode: '',
      transactionId: orderId
    },
    
    // Existing fields
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    paymentStatus: paymentIntentId ? 'processing' : 'pending',
    paymentId: paymentIntentId,
    isDelivery: formData.isDelivery ?? true,
    language: locale
  };
};

interface CheckoutFormProps {
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

interface FormData {
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  orderNotes: string;
  isDelivery: boolean;
  deliveryDate: string;
  useProfileAsDeliveryContact: boolean;
  // Enhanced: Receipt fields
  customerNotes?: string; // General customer notes
  specialRequests?: string; // Special requests
  preferredDeliveryTime?: string; // Preferred delivery time
  promotionalCodes?: string[]; // Applied promo codes
  tipAmount?: number; // Customer tip
  accessInstructions?: string; // Building access instructions
}

interface FormErrors {
  [key: string]: string;
}


// Helper function to get three closest available delivery dates
const getThreeClosestDeliveryDates = (): Array<{ value: string; label: string }> => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dates: Array<{ value: string; label: string }> = [];
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  // Generate up to 3 dates that are > 24 hours and < 1 week
  for (let i = 0; i < 7 && dates.length < 3; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    // Only include dates within a week
    if (checkDate <= oneWeekFromNow) {
      const dateValue = checkDate.toISOString().split('T')[0];
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Format label based on how far the date is
      let label: string;
      const diffDays = Math.ceil((checkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        label = `Tomorrow, ${monthDay}`;
      } else if (diffDays === 2) {
        label = `${dayName}, ${monthDay}`;
      } else {
        label = `${dayName}, ${monthDay}`;
      }
      
      dates.push({ value: dateValue, label });
    }
  }
  
  return dates;
};

// Helper function to get next available delivery date (more than 24 hours from now)
const getNextAvailableDeliveryDate = (): string => {
  const availableDates = getThreeClosestDeliveryDates();
  if (availableDates.length > 0) {
    return availableDates[0].value;
  }
  
  // Fallback if no dates available within a week
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  return startDate.toISOString().split('T')[0];
};

const initialFormData: FormData = {
  customerInfo: {
    name: '',
    email: '',
    phone: ''
  },
  deliveryAddress: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    deliveryInstructions: ''
  },
  orderNotes: '',
  isDelivery: true,
  deliveryDate: getNextAvailableDeliveryDate(),
  useProfileAsDeliveryContact: true,
  // Enhanced: Receipt fields
  customerNotes: '',
  specialRequests: '',
  preferredDeliveryTime: '',
  promotionalCodes: [],
  tipAmount: 0,
  accessInstructions: ''
};

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, onOrderComplete }) => {
  const { cart, clearCart } = useCart();
  const { t, locale } = useLanguage();
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'address' | 'review' | 'payment'>('info');
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [, setOrderStatus] = useState<string>('pending');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const stripePromise = useMemo(
    () => getStripePromise(locale === 'es' ? 'es-419' : 'en'),
    [locale]
  );
  
  const [, setPaymentError] = useState<string>('');
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  // Auto-fill user data when logged in
  useEffect(() => {
    if (currentUser && userProfile) {
      if (formData.useProfileAsDeliveryContact) {
        setFormData(prev => ({
          ...prev,
          customerInfo: {
            name: userProfile.displayName || currentUser.displayName || '',
            email: userProfile.email || currentUser.email || '',
            phone: userProfile.phoneNumber || ''
          },
          deliveryAddress: {
            ...prev.deliveryAddress,
            ...(userProfile.preferences?.defaultLocation && {
              street: userProfile.preferences.defaultLocation.address || '',
              // Note: StoreLocation only has 'address' field, other fields would need to be
              // added to the user profile structure in a future update
              country: 'Canada'
            })
          }
        }));
      } else {
        // Clear auto-filled data when checkbox is unchecked
        setFormData(prev => ({
          ...prev,
          customerInfo: {
            name: '',
            email: '',
            phone: ''
          },
          deliveryAddress: {
            street: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'Canada',
            deliveryInstructions: ''
          }
        }));
      }
    }
  }, [currentUser, userProfile, formData.useProfileAsDeliveryContact]);

  // Real-time order status monitoring
  useEffect(() => {
    if (!currentOrderId) return;

    console.log('Setting up order status listener for:', currentOrderId);

    const unsubscribe = orderApi.subscribeToOrder(
      currentOrderId,
      (orderDoc) => {
        const status = orderDoc.status || 'pending';

        console.log('Order status update:', status, orderDoc);
        setOrderStatus(status);

        switch (status) {
          case 'processing':
            console.log('Payment processing...');
            setErrors({});
            break;

          case 'paid':
          case OrderStatus.CONFIRMED: {
            console.log('Payment successful! Redirecting...');

            // Show success animation for 2 seconds before redirecting
            console.log('🎉 PAYMENT CONFIRMED BY WEBHOOK - Showing success animation');

            setTimeout(() => {
              // Prevent multiple calls to onOrderComplete
              if (isOrderCompleted) {
                console.log('⚠️ Order already completed, skipping duplicate completion');
                return;
              }

              console.log('🚀 REDIRECTING TO ORDER CONFIRMATION');
              setIsOrderCompleted(true);

              // Create order object for completion
              const completedOrder: Order = {
                id: currentOrderId,
                userId: currentUser?.uid || '',
                storeId: cart.storeId || '',
                storeName: cart.storeName || '',
                customerInfo: formData.customerInfo,
                deliveryAddress: formData.deliveryAddress,
                items: cart.items.map(item => ({
                  id: item.id,
                  productId: item.product.id,
                  productName: item.product.name,
                  productImage: item.product.images?.[0] || '',
                  price: item.priceAtTime,
                  quantity: item.quantity,
                  specialInstructions: item.specialInstructions || ''
                })),
                summary: {
                  ...cart.summary,
                  storeAmount: cart.summary.total * 0.9, // Store gets 90% of base total
                  platformAmount: cart.summary.platformFee + (cart.summary.total * 0.1) // Platform gets fee + 10%
                },
                status: OrderStatus.CONFIRMED,
                orderNotes: formData.orderNotes,
                createdAt: orderDoc.createdAt || new Date(),
                updatedAt: orderDoc.updatedAt || new Date(),
                estimatedDeliveryTime: orderDoc.estimatedDeliveryTime || new Date(),
                paymentStatus: 'paid',
                paymentId: orderDoc.paymentId || '',
                isDelivery: formData.isDelivery,
                language: locale
              };

              clearCart();
              onOrderComplete(completedOrder);
            }, 2000); // Wait 2 seconds to show success animation
            break;
          }

          case 'failed':
          case OrderStatus.CANCELLED: {
            console.log('Payment failed');

            // Show error inline in payment form
            setPaymentError(t('payment.failed'));

            setTimeout(() => {
              setErrors({
                payment: t('payment.failed')
              });
              // Keep payment form mounted - don't reset client secret or payment intent
              // User can correct their card details and retry
              setCurrentOrderId(null);
            }, 2000); // Wait 2 seconds to show error animation
            break;
          }

          case 'canceled': {
            console.log('Payment canceled');
            setErrors({
              payment: t('payment.canceled') || 'Payment was canceled. You can try again or use a different payment method.'
            });
            // Keep payment form mounted - don't reset client secret or payment intent
            setCurrentOrderId(null);
            break;
          }

          default:
            console.log('Unknown order status:', status);
        }
      },
      (error) => {
        setErrors({
          general: 'Failed to monitor payment status. Please contact support if your payment was charged.',
          payment: error.message
        });
      }
    );

    // Cleanup listener when component unmounts or orderId changes
    return () => {
      console.log('Cleaning up order status listener');
      unsubscribe();
    };
  }, [currentOrderId, currentUser, cart, formData, clearCart, onOrderComplete, t, isOrderCompleted, locale]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateStep = (step: 'info' | 'address' | 'review'): boolean => {
    const newErrors: FormErrors = {};

    if (step === 'info') {
      if (!formData.customerInfo.name.trim()) {
        newErrors['customerInfo.name'] = t('validation.required');
      }
      if (!formData.customerInfo.email.trim()) {
        newErrors['customerInfo.email'] = t('validation.required');
      } else if (!validateEmail(formData.customerInfo.email)) {
        newErrors['customerInfo.email'] = t('validation.invalidEmail');
      }
      if (!formData.customerInfo.phone.trim()) {
        newErrors['customerInfo.phone'] = t('validation.required');
      } else if (!validatePhone(formData.customerInfo.phone)) {
        newErrors['customerInfo.phone'] = t('validation.invalidPhone');
      }
    }

    if (step === 'address') {
      if (!formData.deliveryAddress.street.trim()) {
        newErrors['deliveryAddress.street'] = t('validation.required');
      }
      if (!formData.deliveryAddress.city.trim()) {
        newErrors['deliveryAddress.city'] = t('validation.required');
      }
      if (!formData.deliveryAddress.province.trim()) {
        newErrors['deliveryAddress.province'] = t('validation.required');
      }
      if (!formData.deliveryAddress.postalCode.trim()) {
        newErrors['deliveryAddress.postalCode'] = t('validation.required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: keyof FormData, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
    
    // Clear error when user starts typing
    const errorKey = typeof formData[section] === 'object' ? `${section}.${field}` : section;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 'info' && validateStep('info')) {
      setCurrentStep('address');
    } else if (currentStep === 'address' && validateStep('address')) {
      setCurrentStep('review');
    } else if (currentStep === 'review' && validateStep('review')) {
      handleProceedToPayment();
    }
  };

  const handleBack = () => {
    if (currentStep === 'address') {
      setCurrentStep('info');
    } else if (currentStep === 'review') {
      setCurrentStep('address');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    } else {
      onBack();
    }
  };

  // Legacy order submission function - keeping for reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmitOrder_LEGACY = async () => {
    if (!validateStep('review')) return;

    // Ensure user is authenticated
    if (!currentUser?.uid) {
      setErrors({ general: 'You must be logged in to place an order' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate consistent order ID
      const orderId = generateOrderId();
      
      // Create enhanced order data
      const orderData = await buildEnhancedOrderData(
        orderId,
        cart,
        formData,
        currentUser,
        locale
      );

      // Debug: Check for any remaining undefined values
      const checkForUndefined = (obj: Record<string, unknown>, path = ''): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (value === undefined) {
            console.warn(`Undefined value found at: ${currentPath}`);
          } else if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
            checkForUndefined(value, currentPath);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (item && typeof item === 'object') {
                checkForUndefined(item, `${currentPath}[${index}]`);
              }
            });
          }
        }
      };
      
      checkForUndefined(orderData);

      // Save order via API
      await orderApi.createOrderWithId(orderId, orderData);
      
      // Create complete order object for callback
      const order: Order = {
        id: orderId,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDeliveryTime: new Date(formData.deliveryDate)
      };
      
      // Clear cart and redirect to confirmation
      clearCart();
      onOrderComplete(order);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ general: t('order.error.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!validateStep('review')) return;

    setIsCreatingPaymentIntent(true);
    setErrors({});

    try {
      // First, get the store's Stripe account ID
      const storeStripeAccountId = await storeApi.getStoreStripeAccountId(cart.storeId!);

      if (!storeStripeAccountId) {
        throw new Error('Store payment processing is not set up. Please contact the store owner.');
      }


      // Generate a single order ID to use for BOTH Firestore and payment intent
      const orderId = generateOrderId();
      
      // Create payment intent via HTTP endpoint
      const amountInCents = Math.round(cart.summary.finalTotal * 100);
      
      const payloadData = {
        // Core required fields
        amount: cart.summary.finalTotal,
        amountInCents: amountInCents,
        orderId: orderId, // Use the same ID that will be used for Firestore
        storeStripeAccountId: storeStripeAccountId,
        
        // Order details
        storeId: cart.storeId,
        storeName: cart.storeName,
        customerEmail: formData.customerInfo.email,
        customerName: formData.customerInfo.name,
        customerPhone: formData.customerInfo.phone,
        
        // Financial breakdown
        subtotal: cart.summary.subtotal,
        tax: cart.summary.tax,
        deliveryFee: cart.summary.deliveryFee,
        platformFee: cart.summary.platformFee,
        total: cart.summary.total,
        finalTotal: cart.summary.finalTotal,
        
        // Additional data
        currency: 'cad',
        isDelivery: formData.isDelivery,
        orderNotes: formData.orderNotes || '',
        applicationFeeInCents: Math.round((cart.summary.platformFee + (cart.summary.subtotal * PLATFORM_FEE_PERCENTAGE)) * 100),
        
        // Items summary
        itemCount: cart.summary.itemCount,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.priceAtTime,
          quantity: item.quantity,
        })),
        
        // Address
        deliveryAddress: {
          street: formData.deliveryAddress.street,
          city: formData.deliveryAddress.city,
          province: formData.deliveryAddress.province,
          postalCode: formData.deliveryAddress.postalCode,
          country: formData.deliveryAddress.country
        }
      };

      const totalApplicationFee = cart.summary.platformFee + (cart.summary.subtotal * PLATFORM_FEE_PERCENTAGE);
      console.log('Creating payment intent with data:', {
        amount: cart.summary.finalTotal,
        amountInCents,
        applicationFeeInCents: Math.round(totalApplicationFee * 100),
        visiblePlatformFee: cart.summary.platformFee,
        hiddenPlatformFee: cart.summary.subtotal * PLATFORM_FEE_PERCENTAGE,
        totalPlatformFee: totalApplicationFee,
        orderId: orderId,
        storeStripeAccountId
      });

      const paymentIntentEndpoint = import.meta.env.VITE_PAYMENT_INTENT_ENDPOINT ||
        'https://createpaymentintent-6v2n7ecudq-uc.a.run.app';

      const response = await fetch(paymentIntentEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ data: payloadData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment intent response:', result);
      
      // Handle new response format with data wrapper
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.data) {
        throw new Error('Invalid response format from payment service');
      }
      
      const { clientSecret, paymentIntentId } = result.data;

      setPaymentClientSecret(clientSecret);
      setPaymentIntentId(paymentIntentId);
      setPendingOrderId(orderId); // Store the order ID for later use in handlePaymentSuccess
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to initialize payment. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // If it's a Firebase error, try to extract more details
        if ('code' in error) {
          console.error('Firebase error code:', error.code);
        }
        if ('details' in error) {
          console.error('Firebase error details:', error.details);
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePaymentFailure = async (paymentIntentId: string, error: string) => {
    try {
      setIsSubmitting(true);

      // Create failed order record for tracking
      const failedOrderData: orderApi.FailedOrderData = {
        orderId: pendingOrderId || `failed_${Date.now()}`,
        userId: currentUser?.uid || '',
        storeId: cart.storeId || '',
        error: error,
        paymentIntentId: paymentIntentId,
        createdAt: new Date(),
        orderData: {
          storeName: cart.storeName || '',
          customerInfo: formData.customerInfo,
          deliveryAddress: formData.deliveryAddress,
          items: cart.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images?.[0] || '',
            price: item.priceAtTime,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || ''
          })),
          summary: cart.summary,
          orderNotes: formData.orderNotes,
          isDelivery: formData.isDelivery,
          language: locale
        }
      };

      // Save failed order for record keeping via API
      await orderApi.recordFailedOrder(failedOrderData);

      console.log('Failed order recorded:', paymentIntentId);

      // Show error to user inline in the payment form
      setErrors({
        payment: error || t('payment.failed')
      });

      // Keep the payment form mounted - don't reset client secret or payment intent
      // User can correct their card details and retry

    } catch (recordError) {
      console.error('Error recording failed payment:', recordError);
      setErrors({
        general: 'Payment failed and we could not save the error details. Please contact support.',
        payment: error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Keep the payment form mounted and display inline error
    // The StripePaymentForm will handle showing the error inline
    if (error) {
      setErrors({ 
        payment: error
      });
    } else {
      // Clear the payment error when called with empty string
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.payment;
        return newErrors;
      });
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsSubmitting(true);

      // Use the same order ID that was sent to the payment intent
      const orderIdToUse = pendingOrderId || `fallback_${Date.now()}`;

      // Create enhanced order data for payment processing
      const orderData = await buildEnhancedOrderData(
        orderIdToUse,
        cart,
        formData,
        currentUser,
        locale,
        paymentIntentId,
        OrderStatus.PROCESSING
      );

      // Create the order document with the specific ID via API
      await orderApi.createOrderWithId(orderIdToUse, orderData);
      
      // Show processing modal and set up real-time monitoring
      console.log('🎬 SHOWING PAYMENT MODAL - Status: processing');
      console.log('🔍 Current state before modal:', { currentStep });
      setCurrentOrderId(orderIdToUse);
      setOrderStatus('processing');
      console.log('🔍 Modal state set to: processing');
      
      // Fallback mechanism: If webhook doesn't update within 7 seconds, assume success
      // Ensure this triggers after the 5-second Stripe processing time
      setTimeout(() => {
        console.log('⏰ WEBHOOK FALLBACK TIMER - Triggering fallback transition...');
        console.log('🔍 Current modal state: fallback');
        
        // Always transition to success first, then to completion
        console.log('🔄 FALLBACK: Showing success animation');
        
        setTimeout(() => {
          console.log('🚀 FALLBACK: Redirecting to order confirmation');
          const fallbackOrder: Order = {
            id: orderIdToUse,
            userId: currentUser?.uid || '',
            storeId: cart.storeId || '',
            storeName: cart.storeName || '',
            customerInfo: formData.customerInfo,
            deliveryAddress: formData.deliveryAddress,
            items: cart.items.map(item => ({
              id: item.id,
              productId: item.product.id,
              productName: item.product.name,
              productImage: item.product.images?.[0] || '',
              price: item.priceAtTime,
              quantity: item.quantity,
              specialInstructions: item.specialInstructions || ''
            })),
            summary: {
              ...cart.summary,
              storeAmount: cart.summary.total * 0.9,
              platformAmount: cart.summary.platformFee + (cart.summary.total * 0.1)
            },
            status: OrderStatus.CONFIRMED,
            orderNotes: formData.orderNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
            estimatedDeliveryTime: new Date(formData.deliveryDate),
            paymentStatus: 'paid',
            paymentId: paymentIntentId,
            isDelivery: formData.isDelivery,
            language: locale
          };
          
          clearCart();
          onOrderComplete(fallbackOrder);
        }, 2000); // Show success for 2 seconds before redirect
      }, 7000); // 7 second fallback (after the 5-second Stripe processing)
      
      // Force a re-render to ensure modal shows
      setTimeout(() => {
        console.log('🔍 MODAL CHECK AFTER TIMEOUT:', { 
          currentOrderId: orderIdToUse 
        });
      }, 100);
      
      console.log('✅ ORDER ID SYNCHRONIZATION:');
      console.log('📝 Firestore order document ID:', orderIdToUse);
      console.log('💳 Payment intent metadata orderId:', orderIdToUse);
      console.log('🔄 Webhook will update order from "processing" → "paid"');
      console.log('📡 Real-time listener monitoring:', orderIdToUse);
      console.log('🎭 MODAL STATE: modal removed');
      
      // 🚨 IMPORTANT: Do NOT call onOrderComplete here!
      // The real-time listener will handle order completion when webhook updates the status
      // This keeps the modal visible while processing
      
    } catch (error) {
      console.error('Error creating order after payment:', error);
      setErrors({ general: 'Payment succeeded but order creation failed. Please contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

  const getErrorMessage = (key: string): string | undefined => {
    return errors[key];
  };

  const StepHeader = () => (
    <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-3xl mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleBack}
            className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 group"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-primary-400 transition-colors" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">{t('order.checkout')}</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Step indicators */}
              <div className={`w-2 h-2 rounded-full ${currentStep === 'info' ? 'bg-primary-400' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'address' ? 'bg-primary-400' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-primary-400' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-primary-400' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StepHeader />
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-8 md:py-12">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button
              onClick={onBack}
              className="btn-primary font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only render Elements when we have a clientSecret for payment step
  if (currentStep === 'payment' && paymentClientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: paymentClientSecret,
          locale: locale === 'es' ? 'es-419' : 'en',
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: theme.colors.primary400,
              colorBackground: theme.colors.neutralBg,
              colorText: theme.colors.neutralText,
              colorDanger: theme.colors.danger,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        }}
      >
      <div className="min-h-screen bg-gray-50">
        <StepHeader />
        
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              
              {/* Customer Information Step */}
              {currentStep === 'info' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.customerInfo')}</h2>
                  </div>

                  {/* Logged in user confirmation */}
                  {currentUser && (
                    <div className="mb-4 md:mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {t('checkout.loggedInAs')} {currentUser.email}
                          </p>
                          <label className="flex items-center gap-2 mt-2 text-sm text-green-700">
                            <input
                              type="checkbox"
                              checked={formData.useProfileAsDeliveryContact}
                              onChange={(e) => setFormData(prev => ({ ...prev, useProfileAsDeliveryContact: e.target.checked }))}
                              className="rounded border-green-300 text-green-600 focus:ring-green-500"
                            />
                            {t('checkout.useProfileAsDeliveryContact')}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 md:space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customerInfo.name}
                        onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none ${
                          getErrorMessage('customerInfo.name') ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder={t('placeholder.fullName')}
                      />
                      {getErrorMessage('customerInfo.name') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.name')}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.customerInfo.email}
                        onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none ${
                          getErrorMessage('customerInfo.email') ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder={t('placeholder.email')}
                      />
                      {getErrorMessage('customerInfo.email') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.email')}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.customerInfo.phone}
                        onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none ${
                          getErrorMessage('customerInfo.phone') ? 'border-red-300 bg-red-50' : ''
                        }`}
                        placeholder={t('placeholder.phone')}
                      />
                      {getErrorMessage('customerInfo.phone') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.phone')}</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Notice */}
                    <div className="bg-primary-400/10 border border-primary-400/20 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="font-medium text-gray-900">{t('orderType.delivery')}</p>
                          <p className="text-sm text-gray-600">{t('checkout.deliveryOnly')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn-primary focus-ring w-full py-4 rounded-xl font-bold text-base"
                  >
                    {t('button.continueToDeliveryAddress')}
                  </button>
                </div>
              )}

              {/* Delivery Address Step */}
              {currentStep === 'address' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.deliveryAddress')}</h2>
                  </div>

                  {/* Logged in user address confirmation */}
                  {currentUser && (
                    <div className="mb-4 md:mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <label className="flex items-center gap-2 text-sm text-green-700">
                        <input
                          type="checkbox"
                          checked={formData.useProfileAsDeliveryContact}
                          onChange={(e) => setFormData(prev => ({ ...prev, useProfileAsDeliveryContact: e.target.checked }))}
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        {t('checkout.useProfileAsDeliveryAddress')}
                      </label>
                    </div>
                  )}
                  
                  <div className="space-y-3 md:space-y-4">
                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.street')} *
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.street}
                        onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.street') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.street')}
                      />
                      {getErrorMessage('deliveryAddress.street') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.street')}</span>
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.city')} *
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.city}
                        onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.city') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.city')}
                      />
                      {getErrorMessage('deliveryAddress.city') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.city')}</span>
                        </div>
                      )}
                    </div>

                    {/* Province and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('order.province')} *
                        </label>
                        <select
                          value={formData.deliveryAddress.province}
                          onChange={(e) => handleInputChange('deliveryAddress', 'province', e.target.value)}
                          className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                            getErrorMessage('deliveryAddress.province') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="">{t('placeholder.selectProvince')}</option>
                          <option value="BC">British Columbia</option>
                          <option value="AB">Alberta</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="MB">Manitoba</option>
                          <option value="ON">Ontario</option>
                          <option value="QC">Quebec</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="YT">Yukon</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NU">Nunavut</option>
                        </select>
                        {getErrorMessage('deliveryAddress.province') && (
                          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{getErrorMessage('deliveryAddress.province')}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('order.postalCode')} *
                        </label>
                        <input
                          type="text"
                          value={formData.deliveryAddress.postalCode}
                          onChange={(e) => handleInputChange('deliveryAddress', 'postalCode', e.target.value.toUpperCase())}
                          className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                            getErrorMessage('deliveryAddress.postalCode') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder={t('placeholder.postalCode')}
                          maxLength={7}
                        />
                        {getErrorMessage('deliveryAddress.postalCode') && (
                          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{getErrorMessage('deliveryAddress.postalCode')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.deliveryInstructions')}
                      </label>
                      <textarea
                        value={formData.deliveryAddress.deliveryInstructions}
                        onChange={(e) => handleInputChange('deliveryAddress', 'deliveryInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 resize-none"
                        placeholder={t('placeholder.deliveryInstructions')}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn-primary focus-ring w-full py-4 rounded-xl font-bold text-base"
                  >
                    {t('button.reviewOrder')}
                  </button>
                </div>
              )}

              {/* Review Order Step */}
              {currentStep === 'review' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.orderSummary')}</h2>
                  </div>

                  {/* Customer Info Review */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('order.customerInfo')}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{formData.customerInfo.name}</p>
                      <p>{formData.customerInfo.email}</p>
                      <p>{formData.customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Delivery Address Review */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('order.deliveryAddress')}</h3>
                    <div className="text-sm text-gray-600">
                      <p>{formData.deliveryAddress.street}</p>
                      <p>{formData.deliveryAddress.city}, {formData.deliveryAddress.province} {formData.deliveryAddress.postalCode}</p>
                      <p>{formData.deliveryAddress.country}</p>
                      {formData.deliveryAddress.deliveryInstructions && (
                        <p className="mt-2 italic">{formData.deliveryAddress.deliveryInstructions}</p>
                      )}
                    </div>
                  </div>


                  {/* Delivery Date Selection */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('checkout.selectDeliveryDate')}
                    </h3>
                    <div className="space-y-2">
                      {getThreeClosestDeliveryDates().length > 0 ? (
                        getThreeClosestDeliveryDates().map((dateOption) => (
                          <label key={dateOption.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryDate"
                              value={dateOption.value}
                              checked={formData.deliveryDate === dateOption.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                              className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-orange-300"
                            />
                            <span className="text-sm text-orange-900 font-medium">{dateOption.label}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-orange-700">No delivery dates available within the next week.</p>
                      )}
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      Delivery available from tomorrow onwards. Select your preferred date.
                    </p>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.orderNotes')}
                    </label>
                    <textarea
                      value={formData.orderNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNotes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 resize-none"
                      placeholder={t('placeholder.orderNotes')}
                    />
                  </div>

                  {getErrorMessage('general') && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getErrorMessage('general')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Step - Main Form Area */}
              {currentStep === 'payment' && paymentClientSecret && (
                <div className="space-y-4 md:space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl font-bold text-gray-900">Método de Pago</h2>
                  </div>

                  <StripePaymentForm
                    order={{
                      id: paymentIntentId || 'temp',
                      storeId: cart.storeId!,
                      storeName: cart.storeName!,
                      customerInfo: formData.customerInfo,
                      deliveryAddress: formData.deliveryAddress,
                      items: cart.items.map(item => ({
                        id: item.id,
                        productId: item.product.id,
                        productName: item.product.name,
                        productImage: item.product.images?.[0] || '',
                        price: item.priceAtTime,
                        quantity: item.quantity,
                      })),
                      summary: {
                        subtotal: cart.summary.subtotal,
                        tax: cart.summary.tax,
                        deliveryFee: cart.summary.deliveryFee,
                        total: cart.summary.total,
                        platformFee: cart.summary.platformFee,
                        finalTotal: cart.summary.finalTotal,
                        storeAmount: cart.summary.total - (cart.summary.total * 0.10),
                        platformAmount: cart.summary.platformFee + (cart.summary.total * 0.10),
                        itemCount: cart.summary.itemCount,
                      },
                      status: 'pending' as OrderStatus,
                      orderNotes: formData.orderNotes,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      paymentStatus: 'pending',
                      isDelivery: formData.isDelivery,
                      language: locale,
                    }}
                    clientSecret={paymentClientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onPaymentFailure={handlePaymentFailure}
                    onProcessing={(processing) => {
                      setIsSubmitting(processing);
                    }}
                    externalError={errors.payment}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="enhanced-card bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('order.orderSummary')}</h3>
              </div>
              
              {/* Store Info */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-sm">{cart.storeName?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{cart.storeName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {t('orderType.delivery')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items with Images */}
              <div className="space-y-2 mb-5">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{item.product.name}</p>
                      </div>
                      {/* Quantity and Price */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Cant.: {item.quantity}</p>
                        <p className="font-bold text-primary-400 text-sm whitespace-nowrap">
                          {formatPrice(item.priceAtTime * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.subtotal')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.tax')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.deliveryFee')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.platformFee')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.platformFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">{t('order.total')}</span>
                  <span className="text-primary-400 font-bold text-lg">{formatPrice(cart.summary.finalTotal)}</span>
                </div>
              </div>

              {/* Place Order Button - Only show in review step */}
              {currentStep === 'review' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {getErrorMessage('general') && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getErrorMessage('general')}</span>
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={isCreatingPaymentIntent}
                    className="btn-primary focus-ring w-full py-4 rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPaymentIntent ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">{t('payment.preparingPayment')}</span>
                      </div>
                    ) : (
                      t('payment.proceedToPayment')
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        </div>
      </div>
      </Elements>
    );
  }


  // For non-payment steps, render without Elements wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      <StepHeader />
      
      <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              
              {/* Customer Information Step */}
              {currentStep === 'info' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.customerInfo')}</h2>
                  </div>

                  {/* Logged in user confirmation */}
                  {currentUser && (
                    <div className="mb-4 md:mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {t('checkout.loggedInAs')} {currentUser.email}
                          </p>
                          <label className="flex items-center gap-2 mt-2 text-sm text-green-700">
                            <input
                              type="checkbox"
                              checked={formData.useProfileAsDeliveryContact}
                              onChange={(e) => setFormData({
                                ...formData,
                                useProfileAsDeliveryContact: e.target.checked
                              })}
                              className="rounded border-green-300 text-green-600 focus:ring-green-500"
                            />
                            {t('checkout.useProfileAsContact')}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerInfo.name}
                      onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                        getErrorMessage('customerInfo.name') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={t('placeholder.name')}
                    />
                    {getErrorMessage('customerInfo.name') && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage('customerInfo.name')}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.customerInfo.email}
                      onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                        getErrorMessage('customerInfo.email') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={t('placeholder.email')}
                    />
                    {getErrorMessage('customerInfo.email') && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage('customerInfo.email')}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerInfo.phone}
                      onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                        getErrorMessage('customerInfo.phone') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={t('placeholder.phone')}
                    />
                    {getErrorMessage('customerInfo.phone') && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage('customerInfo.phone')}</span>
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-end pt-4 md:pt-6">
                    <button
                      onClick={handleNext}
                      className="btn-primary font-bold text-sm"
                    >
                      {t('order.continue')}
                    </button>
                  </div>
                </div>
              )}

              {/* Address Information Step */}
              {currentStep === 'address' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.deliveryAddress')}</h2>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.streetAddress')} *
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.street}
                      onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                        getErrorMessage('deliveryAddress.street') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={t('placeholder.streetAddress')}
                    />
                    {getErrorMessage('deliveryAddress.street') && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage('deliveryAddress.street')}</span>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.city')} *
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.city}
                      onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                        getErrorMessage('deliveryAddress.city') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={t('placeholder.city')}
                    />
                    {getErrorMessage('deliveryAddress.city') && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage('deliveryAddress.city')}</span>
                      </div>
                    )}
                  </div>

                  {/* Province and Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.province')} *
                      </label>
                      <select
                        value={formData.deliveryAddress.province}
                        onChange={(e) => handleInputChange('deliveryAddress', 'province', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.province') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <option value="">{t('placeholder.selectProvince')}</option>
                        <option value="BC">British Columbia</option>
                        <option value="AB">Alberta</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="MB">Manitoba</option>
                        <option value="ON">Ontario</option>
                        <option value="QC">Quebec</option>
                        <option value="NB">New Brunswick</option>
                        <option value="NS">Nova Scotia</option>
                        <option value="PE">Prince Edward Island</option>
                        <option value="NL">Newfoundland and Labrador</option>
                        <option value="YT">Yukon</option>
                        <option value="NT">Northwest Territories</option>
                        <option value="NU">Nunavut</option>
                      </select>
                      {getErrorMessage('deliveryAddress.province') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.province')}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.postalCode')} *
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.postalCode}
                        onChange={(e) => handleInputChange('deliveryAddress', 'postalCode', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.postalCode') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.postalCode')}
                      />
                      {getErrorMessage('deliveryAddress.postalCode') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.postalCode')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.deliveryInstructions')}
                    </label>
                    <textarea
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({...formData, orderNotes: e.target.value})}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 focus:outline-none transition-all duration-300"
                      placeholder={t('placeholder.deliveryInstructions')}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 md:pt-6">
                    <button
                      onClick={handleBack}
                      className="btn-ghost font-bold text-sm"
                    >
                      {t('order.back')}
                    </button>
                    <button
                      onClick={handleNext}
                      className="btn-primary font-bold text-sm"
                    >
                      {t('order.continue')}
                    </button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.orderSummary')}</h2>
                  </div>

                  {/* Customer Info Review */}
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{t('order.customerInfo')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">{t('order.name')}:</span> {formData.customerInfo.name}</p>
                      <p><span className="font-medium">{t('order.email')}:</span> {formData.customerInfo.email}</p>
                      <p><span className="font-medium">{t('order.phone')}:</span> {formData.customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Delivery Address Review */}
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{t('order.deliveryAddress')}</h3>
                    <div className="text-sm">
                      <p>{formData.deliveryAddress.street}</p>
                      <p>{formData.deliveryAddress.city}, {formData.deliveryAddress.province} {formData.deliveryAddress.postalCode}</p>
                      {formData.orderNotes && (
                        <p className="mt-2 text-gray-600">
                          <span className="font-medium">{t('order.notes')}:</span> {formData.orderNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 md:pt-6">
                    <button
                      onClick={handleBack}
                      className="btn-ghost font-bold text-sm"
                    >
                      {t('order.back')}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="enhanced-card bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('order.orderSummary')}</h3>
              </div>
              
              {/* Store Info */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-sm">{cart.storeName?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{cart.storeName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {t('orderType.delivery')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items with Images */}
              <div className="space-y-2 mb-5">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{item.product.name}</p>
                      </div>
                      {/* Quantity and Price */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Cant.: {item.quantity}</p>
                        <p className="font-bold text-primary-400 text-sm whitespace-nowrap">
                          {formatPrice(item.priceAtTime * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.subtotal')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.tax')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.deliveryFee')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('order.platformFee')}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatPrice(cart.summary.platformFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">{t('order.total')}</span>
                  <span className="text-primary-400 font-bold text-lg">{formatPrice(cart.summary.finalTotal)}</span>
                </div>
              </div>

              {/* Place Order Button - Only show in review step */}
              {currentStep === 'review' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {getErrorMessage('general') && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getErrorMessage('general')}</span>
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={isCreatingPaymentIntent}
                    className="btn-primary focus-ring w-full py-4 rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPaymentIntent ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">{t('payment.preparingPayment')}</span>
                      </div>
                    ) : (
                      t('payment.proceedToPayment')
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
