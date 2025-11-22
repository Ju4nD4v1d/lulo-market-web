import React from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrderTrackingQuery } from '../../hooks/queries/useOrderTrackingQuery';
import { useReceipt } from './hooks';
import {
  OrderStatus,
  OrderItems,
  DeliveryInfo,
  OrderSummary,
  ReceiptSection,
} from './components';
import styles from './OrderTrackingPage.module.css';

interface OrderTrackingPageProps {
  orderId: string;
  onBack: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onBack }) => {
  const { currentUser } = useAuth();
  const { order, isLoading: loading, error } = useOrderTrackingQuery({
    orderId,
    userEmail: currentUser?.email || '',
    enabled: !!currentUser?.email
  });
  const { receiptLoading, generateReceipt, downloadReceipt, updatedOrder } = useReceipt(order);

  // Use updated order if receipt was generated
  const displayOrder = updatedOrder || order;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !displayOrder) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <Package className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Order Not Found</h2>
          <p className={styles.errorMessage}>
            {error || 'The order you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
          </p>
          <button onClick={onBack} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>
          <h1 className={styles.title}>Order #{displayOrder.id.slice(-8)}</h1>
          <p className={styles.subtitle}>Placed on {displayOrder.createdAt.toLocaleDateString()}</p>
        </div>

        <div className={styles.grid}>
          {/* Order Details - Left Column */}
          <div className={styles.leftColumn}>
            <OrderStatus order={displayOrder} />
            <OrderItems order={displayOrder} />
            <DeliveryInfo order={displayOrder} />
          </div>

          {/* Order Summary - Right Column */}
          <div className={styles.rightColumn}>
            <OrderSummary order={displayOrder} />
            <ReceiptSection
              order={displayOrder}
              receiptLoading={receiptLoading}
              onGenerateReceipt={generateReceipt}
              onDownloadReceipt={downloadReceipt}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
