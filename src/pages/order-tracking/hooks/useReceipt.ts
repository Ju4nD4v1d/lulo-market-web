import { useState } from 'react';
import { Order } from '../../../types/order';
import { generateReceiptAPI } from '../../../config/api';

interface UseReceiptReturn {
  receiptLoading: boolean;
  generateReceipt: () => Promise<void>;
  downloadReceipt: () => void;
  updatedOrder: Order | null;
}

/**
 * Hook for generating and downloading order receipts
 */
export const useReceipt = (order: Order | null): UseReceiptReturn => {
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null);

  const generateReceipt = async () => {
    if (!order) return;

    setReceiptLoading(true);
    try {
      const response = await generateReceiptAPI(order.id);
      const responseData = await response.json();

      if (responseData.success && responseData.receiptUrl) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 24);

        const orderWithReceipt = {
          ...order,
          receiptUrl: responseData.receiptUrl,
          receiptGeneratedAt: new Date(),
          receiptExpiresAt: expirationTime
        };

        setUpdatedOrder(orderWithReceipt);
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const downloadReceipt = () => {
    const currentOrder = updatedOrder || order;
    if (!currentOrder?.receiptUrl) return;

    const link = document.createElement('a');
    link.href = currentOrder.receiptUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `receipt-${currentOrder.id}.pdf`;
    link.click();
  };

  return {
    receiptLoading,
    generateReceipt,
    downloadReceipt,
    updatedOrder,
  };
};
