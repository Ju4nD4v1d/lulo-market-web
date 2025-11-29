import type * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Shield, Lock } from 'lucide-react';
import { Order } from '../../../types/order';
import { formatCurrency } from '../../../config/stripe';
import { useLanguage } from '../../../context/LanguageContext';
import { OrderProcessingFeedback } from './OrderProcessingFeedback';
import { getStripeErrorMessage, logStripeError } from '../../../utils/stripeErrors';

interface StripePaymentFormProps {
  order: Order;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentFailure?: (paymentIntentId: string, error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  order,
  onPaymentSuccess,
  onPaymentError,
  onPaymentFailure,
  onProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Scroll to form top when there's an error so user can see Stripe's inline error
  const scrollToFormTop = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    onProcessing(isProcessing);
  }, [isProcessing, onProcessing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Ensure minimum 5-second processing time for better UX
    const startTime = Date.now();

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: order.customerInfo.email,
          payment_method_data: {
            billing_details: {
              name: order.customerInfo.name,
              email: order.customerInfo.email,
              phone: order.customerInfo.phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        // Use centralized error handling for user-friendly messages
        logStripeError({ code: error.code, decline_code: error.decline_code, type: error.type }, 'Payment confirmation');
        const errorMessage = getStripeErrorMessage(
          { code: error.code, decline_code: error.decline_code },
          t
        );
        onPaymentError(errorMessage);
        scrollToFormTop();

        // If we have a payment intent ID, record this as a failed payment
        if (error.payment_intent?.id && onPaymentFailure) {
          onPaymentFailure(error.payment_intent.id, errorMessage);
        }
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setPaymentComplete(true);
          onPaymentSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_payment_method') {
          const errorMessage = getStripeErrorMessage('card_declined', t);
          onPaymentError(errorMessage);
          scrollToFormTop();
          if (onPaymentFailure) {
            onPaymentFailure(paymentIntent.id, errorMessage);
          }
        } else if (paymentIntent.status === 'processing') {
          onPaymentError(t('payment.processing'));
        } else {
          const errorMessage = t('payment.notCompleted');
          onPaymentError(errorMessage);
          scrollToFormTop();
          if (onPaymentFailure) {
            onPaymentFailure(paymentIntent.id, errorMessage);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('stripeError.generic');
      onPaymentError(errorMessage);
      scrollToFormTop();
    } finally {
      // Ensure minimum 5-second processing time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);
      
      setTimeout(() => {
        setIsProcessing(false);
      }, remainingTime);
    }
  };

  if (paymentComplete) {
    return <OrderProcessingFeedback t={t} />;
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {/* Billing Address */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t('payment.billingAddress')}
        </label>
        <AddressElement
          options={{
            mode: 'billing',
            allowedCountries: ['CA'],
            defaultValues: {
              name: order.customerInfo.name,
              address: {
                line1: order.deliveryAddress.street,
                city: order.deliveryAddress.city,
                state: order.deliveryAddress.province,
                postal_code: order.deliveryAddress.postalCode,
                country: 'CA',
              },
            },
          }}
        />
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mt-4">
        <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-800 text-sm flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {t('payment.secure')}
          </h4>
          <p className="text-green-700 text-xs mt-1">
            {t('payment.encryptedProtected')}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className={`w-full mt-4 font-bold ${
          isProcessing || !stripe || !elements
            ? 'bg-gray-400 text-white cursor-not-allowed py-3 px-6 rounded-lg'
            : 'btn-primary'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          {isProcessing ? t('payment.processing') : `Pay ${formatCurrency(order.summary.finalTotal)}`}
        </span>
      </button>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center mt-2">
        {t('payment.termsNotice')}
      </p>
    </form>
  );
};
