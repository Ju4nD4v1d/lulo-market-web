import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types/order';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, Package, MapPin, Clock, CreditCard, Receipt, Download } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { generateReceiptAPI } from '../config/api';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!currentUser || !orderId) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        // Query orders collection for this specific order belonging to the current user
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('customerId', '==', currentUser.uid),
          where('__name__', '==', orderId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Order not found or access denied');
          setLoading(false);
          return;
        }

        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        
        const fetchedOrder: Order = {
          id: orderDoc.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt || Date.now()),
          updatedAt: orderData.updatedAt?.toDate ? orderData.updatedAt.toDate() : new Date(orderData.updatedAt || Date.now()),
          estimatedDeliveryTime: orderData.estimatedDeliveryTime?.toDate ? orderData.estimatedDeliveryTime.toDate() : orderData.estimatedDeliveryTime ? new Date(orderData.estimatedDeliveryTime) : undefined,
          deliveredAt: orderData.deliveredAt?.toDate ? orderData.deliveredAt.toDate() : orderData.deliveredAt ? new Date(orderData.deliveredAt) : undefined
        } as Order;

        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [currentUser, orderId]);

  const generateReceipt = async () => {
    if (!order) return;
    
    setReceiptLoading(true);
    try {
      const response = await generateReceiptAPI(order.id);
      const responseData = await response.json();
      
      if (responseData.success && responseData.receiptUrl) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 24);
        
        setOrder({
          ...order,
          receiptUrl: responseData.receiptUrl,
          receiptGeneratedAt: new Date(),
          receiptExpiresAt: expirationTime
        });
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!order?.receiptUrl) return;
    
    const link = document.createElement('a');
    link.href = order.receiptUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `receipt-${order.id}.pdf`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8E400] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}</p>
          <button
            onClick={onBack}
            className="bg-[#C8E400] text-gray-900 px-6 py-2 rounded-lg hover:bg-[#B8D400] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
          <p className="text-gray-600">Placed on {order.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Status
              </h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
              {order.estimatedDeliveryTime && (
                <p className="text-gray-600 mt-2">
                  Estimated delivery: {order.estimatedDeliveryTime.toLocaleString()}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {order.isDelivery ? 'Delivery Address' : 'Pickup Location'}
              </h2>
              <div className="text-gray-600">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
                <p>{order.deliveryAddress.postalCode}</p>
                {order.deliveryAddress.instructions && (
                  <p className="mt-2 text-sm">Instructions: {order.deliveryAddress.instructions}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(order.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(order.summary.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">{formatPrice(order.summary.deliveryFee)}</span>
                </div>
                {order.summary.platformFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="text-gray-900">{formatPrice(order.summary.platformFee)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(order.summary.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Receipt
              </h2>
              {order.receiptUrl ? (
                <button
                  onClick={downloadReceipt}
                  className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              ) : (
                <button
                  onClick={generateReceipt}
                  disabled={receiptLoading}
                  className="w-full bg-[#C8E400] text-gray-900 rounded-lg px-4 py-2 hover:bg-[#B8D400] transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                >
                  <Receipt className="w-4 h-4" />
                  {receiptLoading ? 'Generating...' : 'Generate Receipt'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};