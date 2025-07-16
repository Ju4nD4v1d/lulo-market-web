import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/order';
import { formatCurrency } from '../config/stripe';
import { useLanguage } from '../context/LanguageContext';

interface StripePaymentFormProps {
  order: Order;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentFailure?: (paymentIntentId: string, error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
  externalError?: string; // External error from parent component
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  order,
  onPaymentSuccess,
  onPaymentError,
  onPaymentFailure,
  onProcessing,
  externalError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Combined error state (internal + external)
  const displayError = externalError || paymentError;

  useEffect(() => {
    onProcessing(isProcessing);
  }, [isProcessing, onProcessing]);

  const handlePaymentElementChange = (event: { complete?: boolean; value?: string }) => {
    // Clear errors when user starts typing
    if (event.complete || event.value) {
      setPaymentError(null);
      // Clear external error by calling onPaymentError with empty string
      if (externalError) {
        onPaymentError('');
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError(t('payment.stripeNotLoaded'));
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    
    // Clear external error when starting a new payment attempt
    if (externalError) {
      onPaymentError('');
    }
    
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
        const errorMessage = error.message || t('payment.failed');
        setPaymentError(errorMessage);
        onPaymentError(errorMessage);
        
        // If we have a payment intent ID, record this as a failed payment
        if (error.payment_intent?.id && onPaymentFailure) {
          onPaymentFailure(error.payment_intent.id, errorMessage);
        }
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setPaymentComplete(true);
          onPaymentSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_payment_method') {
          const errorMessage = t('payment.failed') + ' - ' + t('payment.cardDeclined');
          setPaymentError(errorMessage);
          onPaymentError(errorMessage);
          if (onPaymentFailure) {
            onPaymentFailure(paymentIntent.id, errorMessage);
          }
        } else if (paymentIntent.status === 'processing') {
          setPaymentError(t('payment.processing'));
          onPaymentError(t('payment.processing'));
        } else {
          const errorMessage = t('payment.notCompleted');
          setPaymentError(errorMessage);
          onPaymentError(errorMessage);
          if (onPaymentFailure) {
            onPaymentFailure(paymentIntent.id, errorMessage);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('payment.unexpectedError');
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
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
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('payment.successful')}
        </h3>
        <p className="text-gray-600">
          {t('payment.confirmationMessage')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
        onChange={handlePaymentElementChange}
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

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">{t('payment.error')}</h4>
              <p className="text-red-600 text-sm mt-1">{displayError}</p>
            </div>
          </div>
        )}

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
        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 mt-4 ${
          isProcessing || !stripe || !elements
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#C8E400] to-[#A3C700] hover:shadow-lg transform hover:scale-[1.02]'
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