import type * as React from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrderTrackingQuery } from '../../hooks/queries/useOrderTrackingQuery';
import { useReceipt } from './hooks';
import {
  OrderStatus,
  OrderItems,
  DeliveryInfo,
  OrderSummary,
  ReceiptSection,
  OrderProgressTimeline,
  StoreContactCard,
} from './components';
import styles from './OrderTrackingPage.module.css';

export const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const { order, isLoading: loading, error, refetch } = useOrderTrackingQuery({
    orderId: orderId!,
    userId: currentUser?.uid,
    userEmail: currentUser?.email || '',
    enabled: !!currentUser
  });
  const {
    receiptLoading,
    generateReceipt,
    downloadReceipt,
    isReceiptExpired,
    error: receiptError
  } = useReceipt(order, locale as 'en' | 'es', refetch);

  // Use fetched order directly (receipt data now comes from Firestore)
  const displayOrder = order;

  // Helper function to safely format date from Firestore Timestamp or Date with proper locale
  const formatOrderDate = (date: any): string => {
    if (!date) return 'Unknown';

    const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';

    // Check if it's a Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Check if it's already a Date object
    if (date instanceof Date) {
      return date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Fallback: try to create a Date from the value
    try {
      return new Date(date).toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>{t('order.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !displayOrder) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <Package className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>{t('order.notFound')}</h2>
          <p className={styles.errorMessage}>
            {error || t('order.notFoundMessage')}
          </p>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            {t('order.goBack')}
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
          <button onClick={() => navigate('/')} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            {t('order.back')}
          </button>
          <h1 className={styles.title}>{t('order.id')}{displayOrder.id.slice(-8)}</h1>
          <p className={styles.subtitle}>{t('order.placedOn')} {formatOrderDate(displayOrder.createdAt)}</p>
        </div>

        <div className={styles.grid}>
          {/* Order Details - Left Column */}
          <div className={styles.leftColumn}>
            <OrderStatus order={displayOrder} />
            <OrderProgressTimeline order={displayOrder} />
            <OrderItems order={displayOrder} t={t} />
            <DeliveryInfo order={displayOrder} t={t} />
            <StoreContactCard order={displayOrder} />
          </div>

          {/* Order Summary - Right Column */}
          <div className={styles.rightColumn}>
            <OrderSummary order={displayOrder} />
            <ReceiptSection
              order={displayOrder}
              receiptLoading={receiptLoading}
              isReceiptExpired={isReceiptExpired}
              error={receiptError}
              onGenerateReceipt={generateReceipt}
              onDownloadReceipt={downloadReceipt}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
