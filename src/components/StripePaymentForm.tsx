import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/order';
import { formatCurrency } from '../config/stripe';

interface StripePaymentFormProps {
  order: Order;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  order,
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  onProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    onProcessing(isProcessing);
  }, [isProcessing, onProcessing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

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
        setPaymentError(error.message || 'Payment failed. Please try again.');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setPaymentComplete(true);
          onPaymentSuccess(paymentIntent.id);
        } else {
          setPaymentError('Payment was not completed. Please try again.');
          onPaymentError('Payment was not completed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600">
          Your order has been confirmed and you will receive an email receipt shortly.
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
      />

      {/* Billing Address */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Billing Address
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
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Payment Error</h4>
              <p className="text-red-600 text-sm mt-1">{paymentError}</p>
            </div>
          </div>
        )}

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mt-4">
        <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-800 text-sm flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure Payment
          </h4>
          <p className="text-green-700 text-xs mt-1">
            Your payment information is encrypted and secure.
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
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Pay {formatCurrency(order.summary.finalTotal)}
          </span>
        )}
      </button>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center mt-2">
        By completing your purchase, you agree to our terms of service and privacy policy.
      </p>
    </form>
  );
};