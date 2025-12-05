import type * as React from 'react';

import { Check, Clock, MapPin, Package, Phone, Mail, ArrowLeft, FileText, Eye } from 'lucide-react';
import { Order, OrderStatus } from '../types/order';
import { useLanguage } from '../context/LanguageContext';

interface OrderConfirmationProps {
  order: Order;
  onBackToShopping: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToShopping }) => {
  const { t } = useLanguage();

  const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="w-5 h-5 text-amber-500" />;
      case OrderStatus.CONFIRMED:
        return <Check className="w-5 h-5 text-green-500" />;
      case OrderStatus.PREPARING:
        return <Package className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return t('order.status.pending');
      case OrderStatus.CONFIRMED:
        return t('order.status.confirmed');
      case OrderStatus.PREPARING:
        return t('order.status.preparing');
      default:
        return t('order.status.pending');
    }
  };

  const formatEstimatedTime = (time: Date) => {
    const now = new Date();
    const diffInMinutes = Math.ceil((time.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      // Less than 1 hour: show minutes
      return `${diffInMinutes} ${t('order.minutes')}`;
    } else if (diffInMinutes < 1440) {
      // Less than 24 hours: show hours and minutes
      const hours = Math.floor(diffInMinutes / 60);
      const remainingMinutes = diffInMinutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? t('order.hour') : t('order.hours')}`;
      } else {
        return `${hours} ${hours === 1 ? t('order.hour') : t('order.hours')} ${remainingMinutes} ${t('order.minutes')}`;
      }
    } else {
      // 24 hours or more: show days, hours and minutes
      const days = Math.floor(diffInMinutes / 1440);
      const remainingHours = Math.floor((diffInMinutes % 1440) / 60);
      const remainingMinutes = diffInMinutes % 60;
      
      let result = `${days} ${days === 1 ? t('order.day') : t('order.days')}`;
      if (remainingHours > 0) {
        result += ` ${remainingHours} ${remainingHours === 1 ? t('order.hour') : t('order.hours')}`;
      }
      if (remainingMinutes > 0) {
        result += ` ${remainingMinutes} ${t('order.minutes')}`;
      }
      return result;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onBackToShopping}
              className="btn-ghost p-2 md:p-3 rounded-lg md:rounded-xl transition-transform duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-primary-400 transition-colors" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">{t('order.confirmation.title')}</h1>
              <p className="text-sm text-gray-600">{t('order.confirmation.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-green-900">{t('order.confirmation.success')}</h2>
              <p className="text-green-700 text-sm md:text-base">{t('order.confirmation.thankYou')}</p>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">{t('order.number')}</span>
              <span className="text-sm font-mono text-green-900 bg-green-100 px-2 py-1 rounded">{order.id}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="text-sm font-medium text-green-700">{getStatusMessage(order.status)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Order Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Store Information */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.storeInfo')}</h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{order.storeName}</p>
                <p className="text-sm text-gray-600">
                  {t('orderType.delivery')}
                </p>
                {order.estimatedDeliveryTime && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t('order.estimatedTime')}: {formatEstimatedTime(order.estimatedDeliveryTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.customerInfo')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.customerInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.customerInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.deliveryAddress')}</h3>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}</p>
                  <p>{order.deliveryAddress.country}</p>
                  {order.deliveryAddress.deliveryInstructions && (
                    <p className="mt-2 italic text-gray-500">{order.deliveryAddress.deliveryInstructions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.orderNotes && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.orderNotes')}</h3>
                <p className="text-sm text-gray-600 italic">{order.orderNotes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4 md:space-y-6">
            {/* Items */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.items')}</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-600">{t('order.quantity')}: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 italic mt-1">{item.specialInstructions}</p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.paymentSummary')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex-1">{t('order.subtotal')}</span>
                  <span className="font-medium whitespace-nowrap ml-2">{formatPrice(order.summary.subtotal)}</span>
                </div>
                {(order.summary.gst ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex-1">{t('cart.summary.gst')}</span>
                    <span className="font-medium whitespace-nowrap ml-2">{formatPrice(order.summary.gst)}</span>
                  </div>
                )}
                {(order.summary.pst ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex-1">{t('cart.summary.pst')}</span>
                    <span className="font-medium whitespace-nowrap ml-2">{formatPrice(order.summary.pst)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex-1">{t('order.deliveryFee')}</span>
                  <span className="font-medium whitespace-nowrap ml-2">{formatPrice(order.summary.deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex-1">{t('order.platformFee')}</span>
                  <span className="font-medium whitespace-nowrap ml-2">{formatPrice(order.summary.platformFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="flex-1">{t('order.total')}</span>
                    <span className="text-primary-400 whitespace-nowrap ml-2">{formatPrice(order.summary.finalTotal)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('order.paymentStatus')}</span>
                    <span className="text-sm font-medium text-amber-600">{t(`payment.${order.paymentStatus}`)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.nextSteps')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <span>{t('order.nextSteps.confirmation')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">2</span>
                  </div>
                  <span>{t('order.nextSteps.preparation')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">3</span>
                  </div>
                  <span>{t('order.nextSteps.delivery')}</span>
                </div>
              </div>

              <button
                onClick={onBackToShopping}
                className="btn-primary w-full mt-6 font-bold text-sm md:text-base"
              >
                {t('order.continueShopping')}
              </button>
            </div>

            {/* Order Tracking */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl md:rounded-3xl border border-orange-200 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-orange-900">{t('order.tracking.title')}</h3>
              </div>
              <p className="text-sm text-orange-700 mb-4">{t('order.tracking.description')}</p>
              <button 
                onClick={() => {
                  window.location.hash = '#order-history';
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t('order.tracking.action')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
