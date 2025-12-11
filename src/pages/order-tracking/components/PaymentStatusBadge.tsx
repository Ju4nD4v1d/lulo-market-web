import type * as React from 'react';

import { CreditCard, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { PaymentStatus } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './PaymentStatusBadge.module.css';

interface PaymentStatusBadgeProps {
  paymentStatus: PaymentStatus;
  showMessage?: boolean;
}

/**
 * PaymentStatusBadge Component
 *
 * Displays the payment status with appropriate styling for delayed capture flow.
 * Shows informative messages about authorization status.
 */
export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  paymentStatus,
  showMessage = true,
}) => {
  const { t } = useLanguage();

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'authorized':
        return {
          icon: <CreditCard className={styles.icon} />,
          label: t('order.payment.authorized'),
          message: t('order.payment.authorizedMessage'),
          variant: 'authorized' as const,
        };
      case 'captured':
      case 'paid':
        return {
          icon: <CheckCircle className={styles.icon} />,
          label: t('order.payment.captured'),
          message: t('order.payment.capturedMessage'),
          variant: 'captured' as const,
        };
      case 'voided':
        return {
          icon: <XCircle className={styles.icon} />,
          label: t('order.payment.voided'),
          message: t('order.payment.voidedMessage'),
          variant: 'voided' as const,
        };
      case 'expired':
        return {
          icon: <AlertTriangle className={styles.icon} />,
          label: t('order.payment.expired'),
          message: t('order.payment.expiredMessage'),
          variant: 'expired' as const,
        };
      case 'failed':
        return {
          icon: <XCircle className={styles.icon} />,
          label: t('order.status.paymentFailed'),
          message: t('order.payment.failedMessage'),
          variant: 'failed' as const,
        };
      case 'refunded':
        return {
          icon: <CheckCircle className={styles.icon} />,
          label: t('order.payment.refunded'),
          message: t('order.payment.refundedMessage'),
          variant: 'voided' as const,
        };
      case 'canceled':
        return {
          icon: <XCircle className={styles.icon} />,
          label: t('order.payment.canceled'),
          message: t('order.payment.canceledMessage'),
          variant: 'voided' as const,
        };
      case 'pending':
      case 'processing':
      default:
        return {
          icon: <Clock className={styles.icon} />,
          label: t('order.status.processing'),
          message: '',
          variant: 'pending' as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${styles.container} ${styles[config.variant]}`}>
      <div className={styles.header}>
        {config.icon}
        <span className={styles.label}>{config.label}</span>
      </div>

      {showMessage && config.message && (
        <p className={styles.message}>{config.message}</p>
      )}

    </div>
  );
};
