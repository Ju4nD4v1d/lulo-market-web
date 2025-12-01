import type * as React from 'react';

import { Receipt, Download } from 'lucide-react';
import { Order } from '../../../types/order';
import styles from './ReceiptSection.module.css';

interface ReceiptSectionProps {
  order: Order;
  receiptLoading: boolean;
  isReceiptExpired: boolean;
  error: string | null;
  onGenerateReceipt: () => void;
  onDownloadReceipt: () => void;
  t: (key: string) => string;
}

export const ReceiptSection: React.FC<ReceiptSectionProps> = ({
  order,
  receiptLoading,
  isReceiptExpired,
  error,
  onGenerateReceipt,
  onDownloadReceipt,
  t,
}) => {
  const hasValidReceipt = order.receiptUrl && !isReceiptExpired;
  const needsRegeneration = order.receiptUrl && isReceiptExpired;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Receipt className={styles.icon} />
        {t('receipt.title')}
      </h2>

      {needsRegeneration && (
        <p className={styles.expiredWarning}>
          {t('receipt.expired')}
        </p>
      )}

      {error && (
        <p className={styles.errorMessage}>
          {error}
        </p>
      )}

      {!isPaid && !hasValidReceipt && (
        <p className={styles.notPaidMessage}>
          {t('receipt.notPaid')}
        </p>
      )}

      {hasValidReceipt ? (
        <button onClick={onDownloadReceipt} className={styles.downloadButton}>
          <Download className={styles.buttonIcon} />
          {t('receipt.download')}
        </button>
      ) : (
        <button
          onClick={onGenerateReceipt}
          disabled={receiptLoading || !isPaid}
          className={styles.generateButton}
        >
          <Receipt className={styles.buttonIcon} />
          {receiptLoading
            ? t('receipt.generating')
            : needsRegeneration
              ? t('receipt.regenerate')
              : t('receipt.generate')
          }
        </button>
      )}
    </div>
  );
};
