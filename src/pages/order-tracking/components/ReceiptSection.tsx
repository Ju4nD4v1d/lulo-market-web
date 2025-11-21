import React from 'react';
import { Receipt, Download } from 'lucide-react';
import { Order } from '../../../types/order';
import styles from './ReceiptSection.module.css';

interface ReceiptSectionProps {
  order: Order;
  receiptLoading: boolean;
  onGenerateReceipt: () => void;
  onDownloadReceipt: () => void;
}

export const ReceiptSection: React.FC<ReceiptSectionProps> = ({
  order,
  receiptLoading,
  onGenerateReceipt,
  onDownloadReceipt,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Receipt className={styles.icon} />
        Receipt
      </h2>
      {order.receiptUrl ? (
        <button onClick={onDownloadReceipt} className={styles.downloadButton}>
          <Download className={styles.buttonIcon} />
          Download Receipt
        </button>
      ) : (
        <button
          onClick={onGenerateReceipt}
          disabled={receiptLoading}
          className={styles.generateButton}
        >
          <Receipt className={styles.buttonIcon} />
          {receiptLoading ? 'Generating...' : 'Generate Receipt'}
        </button>
      )}
    </div>
  );
};
