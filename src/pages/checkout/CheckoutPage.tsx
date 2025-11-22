import type * as React from 'react';
/**
 * CheckoutPage - Main checkout flow orchestrator
 * Integrates all custom hooks and step components
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStripePromise } from '../../config/stripe';
import { theme } from '../../config/theme';
import { Order } from '../../types/order';
import { useCheckoutForm } from './hooks/useCheckoutForm';
import { useCheckoutWizard } from './hooks/useCheckoutWizard';
import { usePaymentFlow } from './hooks/usePaymentFlow';
import { useOrderMonitoring } from './hooks/useOrderMonitoring';
import { useStoreReceiptQuery } from '../../hooks/queries/useStoreReceiptQuery';
import { useCheckoutMutations } from '../../hooks/mutations/useCheckoutMutations';
import { buildEnhancedOrderData } from './utils/orderDataBuilder';
import { CheckoutWizard } from './components/CheckoutWizard';
import { CustomerInfoStep } from './components/CustomerInfoStep';
import { DeliveryAddressStep } from './components/DeliveryAddressStep';
import { ReviewStep } from './components/ReviewStep';
import { PaymentStep } from './components/PaymentStep';
import { OrderStatus } from '../../types/order';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderComplete }) => {
  const { cart, clearCart } = useCart();
  const { t, locale } = useLanguage();
  const { currentUser } = useAuth();

  // State for payment flow
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isMonitoringOrder, setIsMonitoringOrder] = useState(false);

  // Ref to prevent double order completion (webhook + fallback)
  const orderCompletedRef = useRef(false);

  // Stripe promise
  const stripePromise = useMemo(
    () => getStripePromise(locale === 'es' ? 'es-419' : 'en'),
    [locale]
  );

  // Initialize form with user profile data if available
  const initialFormData = useMemo(() => {
    if (currentUser) {
      return {
        customerInfo: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: currentUser.phoneNumber || ''
        }
      };
    }
    return undefined;
  }, [currentUser]);

  // Custom hooks
  const {
    formData,
    errors,
    updateField,
    setEntireFormData,
    validateCustomerInfoStep,
    validateAddressStep,
    validateReviewStep,
  } = useCheckoutForm({ t, initialData: initialFormData });

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep
  } = useCheckoutWizard();

  const { data: storeReceiptInfo } = useStoreReceiptQuery({
    storeId: cart.storeId,
    enabled: !!cart.storeId
  });

  const { createOrder, recordFailedOrder } = useCheckoutMutations();

  // Payment flow
  const { proceedToPayment } = usePaymentFlow({
    cart,
    formData,
    onPaymentIntentCreated: (clientSecret, _intentId, orderId) => {
      setPaymentClientSecret(clientSecret);
      setPendingOrderId(orderId);
      goToStep('payment');
    },
    onError: (error) => {
      console.error('Payment flow error:', error);
    }
  });

  // Order monitoring callback - memoized to prevent unnecessary re-renders
  const handleOrderConfirmed = useCallback((order: Order) => {
    if (orderCompletedRef.current) {
      console.log('Order already completed, skipping duplicate completion');
      return;
    }
    orderCompletedRef.current = true;
    console.log('Order confirmed!', order);
    clearCart();
    onOrderComplete(order);
  }, [clearCart, onOrderComplete]);

  useOrderMonitoring({
    orderId: pendingOrderId,
    enabled: isMonitoringOrder,
    onOrderConfirmed: handleOrderConfirmed
  });

  // Auto-fill form from user profile
  useEffect(() => {
    if (currentUser && formData.useProfileAsDeliveryContact) {
      setEntireFormData({
        customerInfo: {
          name: currentUser.displayName || formData.customerInfo.name,
          email: currentUser.email || formData.customerInfo.email,
          phone: currentUser.phoneNumber || formData.customerInfo.phone
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, formData.useProfileAsDeliveryContact]);

  // Handle step navigation with validation
  const handleContinueFromCustomerInfo = () => {
    if (validateCustomerInfoStep()) {
      goToNextStep();
    }
  };

  const handleContinueFromAddress = () => {
    if (validateAddressStep()) {
      goToNextStep();
    }
  };

  const handleContinueFromReview = async () => {
    if (validateReviewStep()) {
      await proceedToPayment();
    }
  };

  // Payment handlers
  const handlePaymentSuccess = async (intentId: string) => {
    try {
      const orderIdToUse = pendingOrderId || `fallback_${Date.now()}`;

      if (!storeReceiptInfo) {
        throw new Error('Store information not loaded');
      }

      // Build order data
      const orderData = buildEnhancedOrderData(
        orderIdToUse,
        cart,
        formData,
        { uid: currentUser?.uid || '', email: currentUser?.email },
        locale,
        storeReceiptInfo,
        intentId,
        OrderStatus.PROCESSING
      );

      // Create order
      await createOrder.mutateAsync({ orderId: orderIdToUse, orderData });

      // Start monitoring
      setIsMonitoringOrder(true);

      // Fallback: if webhook doesn't update within 7 seconds, complete the order
      setTimeout(() => {
        // Check if order hasn't been completed yet (by webhook callback)
        if (!orderCompletedRef.current) {
          orderCompletedRef.current = true;
          console.log('Webhook fallback triggered - completing order');
          clearCart();
          onOrderComplete({
            ...orderData,
            id: orderIdToUse,
            status: OrderStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Order);
        }
      }, 7000);
    } catch (error) {
      console.error('Error creating order after payment:', error);
    }
  };

  const handlePaymentFailure = async (intentId: string, error: string) => {
    try {
      if (!pendingOrderId) return;

      await recordFailedOrder.mutateAsync({
        orderId: pendingOrderId,
        userId: currentUser?.uid || '',
        storeId: cart.storeId || '',
        error,
        paymentIntentId: intentId,
        createdAt: new Date(),
        orderData: formData
      });
    } catch (recordError) {
      console.error('Error recording failed payment:', recordError);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  // Empty cart check
  if (cart.items.length === 0) {
    return (
      <CheckoutWizard currentStep={currentStep} onBack={onBack} t={t}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            {t('cart.empty')}
          </h2>
          <p style={{ color: 'rgb(75 85 99)', marginBottom: '1.5rem' }}>
            {t('cart.emptyMessage')}
          </p>
          <button
            onClick={onBack}
            style={{
              backgroundColor: 'var(--primary-400, #C8E400)',
              color: 'rgb(17 24 39)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('button.continueShopping')}
          </button>
        </div>
      </CheckoutWizard>
    );
  }

  // Render payment step with Stripe Elements
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
        <CheckoutWizard currentStep={currentStep} onBack={onBack} t={t}>
          <PaymentStep
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
            onPaymentError={handlePaymentError}
            onBack={goToPreviousStep}
            t={t}
          />
        </CheckoutWizard>
      </Elements>
    );
  }

  // Render appropriate step
  return (
    <CheckoutWizard currentStep={currentStep} onBack={onBack} t={t}>
      {currentStep === 'info' && (
        <CustomerInfoStep
          customerInfo={formData.customerInfo}
          errors={errors}
          currentUserEmail={currentUser?.email}
          useProfileAsDeliveryContact={formData.useProfileAsDeliveryContact}
          onChange={(field, value) => updateField('customerInfo', field, value)}
          onUseProfileToggle={(value) => updateField('useProfileAsDeliveryContact', '', value)}
          onContinue={handleContinueFromCustomerInfo}
          t={t}
        />
      )}

      {currentStep === 'address' && (
        <DeliveryAddressStep
          deliveryAddress={formData.deliveryAddress}
          errors={errors}
          onChange={(field, value) => updateField('deliveryAddress', field, value)}
          onContinue={handleContinueFromAddress}
          onBack={goToPreviousStep}
          t={t}
        />
      )}

      {currentStep === 'review' && (
        <ReviewStep
          onContinue={handleContinueFromReview}
          onBack={goToPreviousStep}
          t={t}
        />
      )}
    </CheckoutWizard>
  );
};
