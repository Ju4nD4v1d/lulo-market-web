/**
 * CheckoutContext - Centralized state management for checkout flow
 *
 * Benefits:
 * - Eliminates prop drilling through step components
 * - Single source of truth for all checkout state
 * - Easy to add new checkout features without modifying CheckoutPage
 * - Step components only access what they need
 *
 * Usage:
 * ```typescript
 * function MyStep() {
 *   const { formData, updateField, goToNextStep } = useCheckoutContext();
 *   // ... component logic
 * }
 * ```
 */

import type * as React from 'react';
import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Stripe } from '@stripe/stripe-js';
import { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { getStripePromise } from '../../../config/stripe';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { useCheckoutWizard, CheckoutStep } from '../hooks/useCheckoutWizard';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { useOrderCreation } from '../hooks/useOrderCreation';
import { useStoreReceiptQuery, StoreReceiptInfo } from '../../../hooks/queries/useStoreReceiptQuery';
import { useStoreQuery } from '../../../hooks/queries/useStoreQuery';
import { useEffectiveHours } from '../../../hooks/useEffectiveHours';
import { getAvailableDeliveryDatesMultiSlot } from '../../../utils/effectiveHours';
import { formatDeliveryDateOptions, DeliveryDateOption, getThreeClosestDeliveryDates } from '../utils/dateHelpers';
import { Order } from '../../../types/order';
import { Cart } from '../../../types/cart';
import { UserProfile } from '../../../types/user';

/**
 * Customer information interface
 */
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

/**
 * Delivery address interface
 */
interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

/**
 * Form data interface
 */
interface CheckoutFormData {
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  isDelivery: boolean;
  orderNotes: string;
  deliveryDate: string;
  useProfileAsDeliveryContact: boolean;
}

/**
 * Context value interface - everything step components need
 */
interface CheckoutContextValue {
  // Cart state
  cart: Cart;
  clearCart: () => void;

  // Form state
  formData: CheckoutFormData;
  errors: Record<string, string>;
  updateField: (section: string, field: string, value: string | boolean | number) => void;
  setEntireFormData: (data: Partial<CheckoutFormData>) => void;

  // Wizard state
  currentStep: CheckoutStep;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: CheckoutStep) => void;

  // Validation
  validateCustomerInfoStep: () => boolean;
  validateAddressStep: () => boolean;
  validateReviewStep: () => boolean;

  // Payment state
  paymentClientSecret: string | null;
  pendingOrderId: string | null;
  stripePromise: Promise<Stripe | null> | null;
  isPaymentReady: boolean;
  isCreatingPaymentIntent: boolean;

  // Store info
  storeReceiptInfo: StoreReceiptInfo | undefined;

  // Auth & language
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  locale: string;
  t: (key: string) => string;

  // Profile address helpers
  hasSavedAddress: boolean;
  applyProfileAddressAndSkipToReview: () => void;

  // Delivery schedule
  availableDeliveryDates: DeliveryDateOption[];
  isLoadingSchedule: boolean;
  hasNoDeliveryDates: boolean;

  // Payment handlers
  handlePaymentSuccess: (intentId: string) => Promise<void>;
  handlePaymentFailure: (intentId: string, error: string) => Promise<void>;
  handlePaymentError: (error: string) => void;
  proceedToPayment: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

/**
 * CheckoutProvider props
 */
interface CheckoutProviderProps {
  children: React.ReactNode;
  onOrderComplete: (order: Order) => void;
}

/**
 * CheckoutProvider - Wraps checkout flow with all necessary state and handlers
 */
export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
  onOrderComplete
}) => {
  const { cart, clearCart } = useCart();
  const { t, locale } = useLanguage();
  const { currentUser, userProfile } = useAuth();

  // Payment flow state
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Stripe promise - memoized by locale
  const stripePromise = useMemo(
    () => getStripePromise(locale === 'es' ? 'es-419' : 'en'),
    [locale]
  );

  // Initialize form with user profile data if available
  // Prioritize userProfile (Firestore) over currentUser (Firebase Auth)
  const initialFormData = useMemo(() => {
    if (currentUser || userProfile) {
      return {
        customerInfo: {
          name: userProfile?.displayName || currentUser?.displayName || '',
          email: userProfile?.email || currentUser?.email || '',
          phone: userProfile?.phoneNumber || currentUser?.phoneNumber || ''
        }
      };
    }
    return undefined;
  }, [currentUser, userProfile]);

  // Custom hooks
  const checkoutForm = useCheckoutForm({ t, initialData: initialFormData });
  const checkoutWizard = useCheckoutWizard();

  const { data: storeReceiptInfo } = useStoreReceiptQuery({
    storeId: cart.storeId,
    enabled: !!cart.storeId
  });

  // Fetch store data for effective hours calculation
  const { store: storeData, isLoading: isLoadingStore } = useStoreQuery(cart.storeId);

  // Get effective hours (intersection of store schedule + driver availability)
  const { effectiveHours, isLoading: isLoadingDrivers } = useEffectiveHours({
    store: storeData || null,
    enabled: !!cart.storeId
  });

  // Combined loading state for schedule (store + drivers)
  const isLoadingSchedule = isLoadingStore || isLoadingDrivers;

  // Compute available delivery dates from effective schedule
  const availableDeliveryDates = useMemo((): DeliveryDateOption[] => {
    // Don't compute dates until both store and drivers are loaded
    if (isLoadingSchedule || !effectiveHours) {
      return [];
    }

    const availableDates = getAvailableDeliveryDatesMultiSlot(effectiveHours, 14, 24);

    if (availableDates.length === 0) {
      return [];
    }

    return formatDeliveryDateOptions(availableDates, locale, 5);
  }, [effectiveHours, locale, isLoadingSchedule]);

  // Check if there are no delivery dates available (after loading is complete)
  const hasNoDeliveryDates = !isLoadingSchedule && effectiveHours && availableDeliveryDates.length === 0;

  // Update delivery date and time window in form when available dates are computed
  useEffect(() => {
    if (availableDeliveryDates.length > 0 && !isLoadingSchedule) {
      const currentDeliveryDate = checkoutForm.formData.deliveryDate;
      const matchingDate = availableDeliveryDates.find(d => d.value === currentDeliveryDate);

      if (!matchingDate) {
        // Current date is not valid, update to first available with its time window
        const firstDate = availableDeliveryDates[0];
        const firstSlot = firstDate.slots?.[0];
        const timeWindow = firstSlot ? { open: firstSlot.open, close: firstSlot.close } : undefined;
        checkoutForm.setEntireFormData({
          deliveryDate: firstDate.value,
          deliveryTimeWindow: timeWindow
        });
      } else {
        // Current date is valid, ensure time window is set
        const firstSlot = matchingDate.slots?.[0];
        if (firstSlot && !checkoutForm.formData.deliveryTimeWindow) {
          checkoutForm.setEntireFormData({
            deliveryTimeWindow: { open: firstSlot.open, close: firstSlot.close }
          });
        }
      }
    }
  }, [availableDeliveryDates, isLoadingSchedule]);

  // Order creation hook - for monitoring order status after payment
  // Note: Order is now created in usePaymentFlow BEFORE payment
  const {
    handlePaymentSuccess: handlePaymentSuccessBase,
    handlePaymentFailure: handlePaymentFailureBase,
    handlePaymentError
  } = useOrderCreation({
    cart,
    currentUser,
    onOrderComplete,
    clearCart
  });

  // Payment flow hook - creates order in Firestore BEFORE payment intent
  const { proceedToPayment, isCreatingPaymentIntent } = usePaymentFlow({
    cart,
    formData: checkoutForm.formData,
    currentUser,
    locale,
    storeReceiptInfo: storeReceiptInfo || null,
    onPaymentIntentCreated: (clientSecret, _intentId, orderId) => {
      setPaymentClientSecret(clientSecret);
      setPendingOrderId(orderId);
      checkoutWizard.goToStep('payment');
    },
    onError: (error) => {
      console.error('Payment flow error:', error);
    }
  });

  // Auto-fill form from user profile
  // Prioritize userProfile (Firestore) over currentUser (Firebase Auth)
  useEffect(() => {
    if ((currentUser || userProfile) && checkoutForm.formData.useProfileAsDeliveryContact) {
      checkoutForm.setEntireFormData({
        customerInfo: {
          name: userProfile?.displayName || currentUser?.displayName || checkoutForm.formData.customerInfo.name,
          email: userProfile?.email || currentUser?.email || checkoutForm.formData.customerInfo.email,
          phone: userProfile?.phoneNumber || currentUser?.phoneNumber || checkoutForm.formData.customerInfo.phone
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, userProfile, checkoutForm.formData.useProfileAsDeliveryContact]);

  // Payment success handler wrapper
  // Note: Order already exists in Firestore - just start monitoring for webhook
  const handlePaymentSuccess = async (intentId: string) => {
    const orderIdToUse = pendingOrderId || `fallback_${Date.now()}`;
    await handlePaymentSuccessBase(intentId, orderIdToUse);
  };

  // Payment failure handler wrapper
  const handlePaymentFailure = async (intentId: string, error: string) => {
    if (!pendingOrderId) {
      console.warn('No pending order ID for failed payment');
      return;
    }
    await handlePaymentFailureBase(intentId, error, pendingOrderId);
  };

  // Check if payment is ready (has all required data)
  const isPaymentReady = !!(paymentClientSecret && pendingOrderId && storeReceiptInfo);

  // Check if user has a saved address in their profile
  const hasSavedAddress = useMemo(() => {
    const location = userProfile?.preferences?.defaultLocation;
    return !!(location?.address && location?.city && location?.province && location?.postalCode);
  }, [userProfile]);

  // Apply profile address to form and skip to review step
  const applyProfileAddressAndSkipToReview = useCallback(() => {
    const location = userProfile?.preferences?.defaultLocation;
    if (!location) return;

    // Parse the address - the location.address may be a full formatted string
    // Extract components if available
    const addressData = {
      street: location.address || '',
      city: location.city || '',
      province: location.province || '',
      postalCode: location.postalCode || '',
      country: 'CA'
    };

    // Update the delivery address form data
    checkoutForm.setEntireFormData({
      deliveryAddress: addressData
    });

    // Skip address step and go directly to review
    checkoutWizard.goToStep('review');
  }, [userProfile, checkoutForm.setEntireFormData, checkoutWizard.goToStep]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<CheckoutContextValue>(
    () => ({
      // Cart
      cart,
      clearCart,

      // Form
      formData: checkoutForm.formData,
      errors: checkoutForm.errors,
      updateField: checkoutForm.updateField,
      setEntireFormData: checkoutForm.setEntireFormData,

      // Wizard
      currentStep: checkoutWizard.currentStep,
      goToNextStep: checkoutWizard.goToNextStep,
      goToPreviousStep: checkoutWizard.goToPreviousStep,
      goToStep: checkoutWizard.goToStep,

      // Validation
      validateCustomerInfoStep: checkoutForm.validateCustomerInfoStep,
      validateAddressStep: checkoutForm.validateAddressStep,
      validateReviewStep: checkoutForm.validateReviewStep,

      // Payment
      paymentClientSecret,
      pendingOrderId,
      stripePromise,
      isPaymentReady,
      isCreatingPaymentIntent,

      // Store
      storeReceiptInfo,

      // Auth & language
      currentUser,
      userProfile,
      locale,
      t,

      // Profile address helpers
      hasSavedAddress,
      applyProfileAddressAndSkipToReview,

      // Delivery schedule
      availableDeliveryDates,
      isLoadingSchedule,
      hasNoDeliveryDates,

      // Handlers
      handlePaymentSuccess,
      handlePaymentFailure,
      handlePaymentError,
      proceedToPayment
    }),
    [
      cart,
      clearCart,
      checkoutForm.formData,
      checkoutForm.errors,
      checkoutForm.updateField,
      checkoutForm.setEntireFormData,
      checkoutForm.validateCustomerInfoStep,
      checkoutForm.validateAddressStep,
      checkoutForm.validateReviewStep,
      checkoutWizard.currentStep,
      checkoutWizard.goToNextStep,
      checkoutWizard.goToPreviousStep,
      checkoutWizard.goToStep,
      paymentClientSecret,
      pendingOrderId,
      stripePromise,
      isPaymentReady,
      isCreatingPaymentIntent,
      storeReceiptInfo,
      currentUser,
      userProfile,
      locale,
      t,
      hasSavedAddress,
      applyProfileAddressAndSkipToReview,
      availableDeliveryDates,
      isLoadingSchedule,
      hasNoDeliveryDates,
      proceedToPayment
    ]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

/**
 * Hook to access checkout context
 * Throws error if used outside CheckoutProvider
 */
export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error('useCheckoutContext must be used within CheckoutProvider');
  }

  return context;
};
