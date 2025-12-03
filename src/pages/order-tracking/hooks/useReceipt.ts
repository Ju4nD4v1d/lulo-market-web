import { useState } from 'react';
import { Order } from '../../../types/order';
import { generateReceiptAPI } from '../../../config/api';

interface UseReceiptReturn {
  receiptLoading: boolean;
  generateReceipt: () => Promise<void>;
  downloadReceipt: () => Promise<void>;
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

  const downloadReceipt = async () => {
    if (!order?.receiptUrl) return;

    try {
      setReceiptLoading(true);
      setError(null);

      // Try to fetch PDF as blob for direct download
      // This may fail due to CORS if GCS bucket isn't configured
      const response = await fetch(order.receiptUrl, { mode: 'cors' });
      const blob = await response.blob();

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `receipt-${order.id}.pdf`;
      link.click();

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // CORS error or network issue - fall back to opening in new tab
      console.warn('Blob download failed (likely CORS), falling back to new tab:', err);
      window.open(order.receiptUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setReceiptLoading(false);
    }
  };

  return {
    receiptLoading,
    generateReceipt,
    downloadReceipt,
    isReceiptExpired,
    error,
  };
};
