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
import { createContext, useContext, useMemo } from 'react';
import { Stripe } from '@stripe/stripe-js';
import { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { useCheckoutWizard, CheckoutStep } from '../hooks/useCheckoutWizard';
import { useStoreReceiptQuery, StoreReceiptInfo } from '../../../hooks/queries/useStoreReceiptQuery';
import { useStoreQuery } from '../../../hooks/queries/useStoreQuery';
import { useCheckoutDeliverySchedule } from '../hooks/useCheckoutDeliverySchedule';
import { useCheckoutProfileAddress } from '../hooks/useCheckoutProfileAddress';
import { useCheckoutDeliveryFee } from '../hooks/useCheckoutDeliveryFee';
import { useCheckoutPaymentState } from '../hooks/useCheckoutPaymentState';
import { DeliveryDateOption } from '../utils/dateHelpers';
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

  // Delivery fee calculation
  /** Calculated delivery fee (null if not yet calculated) */
  deliveryFee: number | null;
  /** Distance in km between store and customer (null if not yet calculated) */
  deliveryDistance: number | null;
  /** Error message if delivery fee calculation failed */
  deliveryFeeError: string | null;
  /** Whether delivery fee is currently being calculated */
  isCalculatingDeliveryFee: boolean;
  /** Calculate delivery fee based on current address - call when address step is complete */
  calculateDeliveryFeeForAddress: () => Promise<boolean>;
  /** Reset delivery fee calculation state */
  resetDeliveryFee: () => void;
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
  onOrderComplete,
}) => {
  const { cart, clearCart, setDeliveryFee: setCartDeliveryFee } = useCart();
  const { t, locale } = useLanguage();
  const { currentUser, userProfile } = useAuth();

  // Note: Platform fee is now fetched in CartContext so it's available everywhere
  // No need to fetch it again here

  // Initialize form with user profile data if available
  // Prioritize userProfile (Firestore) over currentUser (Firebase Auth)
  const initialFormData = useMemo(() => {
    if (currentUser || userProfile) {
      return {
        customerInfo: {
          name: userProfile?.displayName || currentUser?.displayName || '',
          email: userProfile?.email || currentUser?.email || '',
          phone: userProfile?.phoneNumber || currentUser?.phoneNumber || '',
        },
      };
    }
    return undefined;
  }, [
    // Include specific properties to ensure updates when they change
    currentUser?.displayName,
    currentUser?.email,
    currentUser?.phoneNumber,
    userProfile?.displayName,
    userProfile?.email,
    userProfile?.phoneNumber,
  ]);

  // Core hooks
  const checkoutForm = useCheckoutForm({ t, initialData: initialFormData });
  const checkoutWizard = useCheckoutWizard();

  // Store data queries
  const { data: storeReceiptInfo } = useStoreReceiptQuery({
    storeId: cart.storeId,
    enabled: !!cart.storeId,
  });

  const { store: storeData, isLoading: isLoadingStore } = useStoreQuery(cart.storeId);

  // Get store coordinates for delivery fee calculation
  const storeCoordinates = useMemo(() => {
    const coords = storeData?.location?.coordinates;
    if (coords?.lat && coords?.lng) {
      return { lat: coords.lat, lng: coords.lng };
    }
    return null;
  }, [
    // Include specific coordinate properties for accurate dependency tracking
    storeData?.location?.coordinates?.lat,
    storeData?.location?.coordinates?.lng,
  ]);

  // Delivery schedule hook
  const {
    availableDeliveryDates,
    isLoadingSchedule,
    hasNoDeliveryDates,
  } = useCheckoutDeliverySchedule({
    storeData: storeData || null,
    isLoadingStore,
    locale,
    formData: checkoutForm.formData,
    setEntireFormData: checkoutForm.setEntireFormData,
  });

  // Profile address hook
  const {
    hasSavedAddress,
    applyProfileAddressAndSkipToReview,
  } = useCheckoutProfileAddress({
    currentUser,
    userProfile,
    formData: checkoutForm.formData,
    setEntireFormData: checkoutForm.setEntireFormData,
    goToStep: checkoutWizard.goToStep,
  });

  // Delivery fee hook
  const {
    deliveryFee,
    deliveryDistance,
    deliveryFeeError,
    isCalculatingDeliveryFee,
    calculateDeliveryFeeForAddress,
    resetDeliveryFee,
  } = useCheckoutDeliveryFee({
    deliveryAddress: checkoutForm.formData.deliveryAddress,
    storeCoordinates,
    setCartDeliveryFee,
  });

  // Payment state hook
  const {
    paymentClientSecret,
    pendingOrderId,
    stripePromise,
    isPaymentReady,
    isCreatingPaymentIntent,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentError,
    proceedToPayment,
  } = useCheckoutPaymentState({
    cart,
    formData: checkoutForm.formData,
    currentUser,
    locale,
    storeReceiptInfo: storeReceiptInfo || null,
    estimatedDistance: deliveryDistance,
    goToStep: checkoutWizard.goToStep,
    onOrderComplete,
    clearCart,
  });

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
      proceedToPayment,

      // Delivery fee
      deliveryFee,
      deliveryDistance,
      deliveryFeeError,
      isCalculatingDeliveryFee,
      calculateDeliveryFeeForAddress,
      resetDeliveryFee,
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
      handlePaymentSuccess,
      handlePaymentFailure,
      handlePaymentError,
      proceedToPayment,
      deliveryFee,
      deliveryDistance,
      deliveryFeeError,
      isCalculatingDeliveryFee,
      calculateDeliveryFeeForAddress,
      resetDeliveryFee,
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
