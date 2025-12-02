import { useState } from 'react';
import { Order } from '../../../types/order';
import { generateReceiptAPI } from '../../../config/api';

interface UseReceiptReturn {
  receiptLoading: boolean;
  generateReceipt: () => Promise<void>;
  downloadReceipt: () => void;
  isReceiptExpired: boolean;
  error: string | null;
}

/**
 * Hook for generating and downloading order receipts
 * @param order - The order to generate receipt for
 * @param language - Language for the receipt ('en' | 'es')
 * @param onReceiptGenerated - Callback to refetch order after receipt generation
 */
export const useReceipt = (
  order: Order | null,
  language: 'en' | 'es' = 'en',
  onReceiptGenerated?: () => void
): UseReceiptReturn => {
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if receipt URL is expired
  const isReceiptExpired = order?.receiptExpiresAt
    ? new Date() > new Date(order.receiptExpiresAt)
    : false;

  const generateReceipt = async () => {
    if (!order) return;

    setReceiptLoading(true);
    setError(null);
    try {
      const response = await generateReceiptAPI(order.id, language);
      const responseData = await response.json();

      if (responseData.success && responseData.receiptUrl) {
        onReceiptGenerated?.();
      } else {
        setError(responseData.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
      setError('Failed to generate receipt. Please try again.');
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

  return {
    receiptLoading,
    generateReceipt,
    downloadReceipt,
    isReceiptExpired,
    error,
  };
};
