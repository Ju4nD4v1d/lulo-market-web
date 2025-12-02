import { XCircle, Loader2 } from 'lucide-react';
import { Order } from '../../../../../types/order';
import { formatPrice, formatDate } from '../utils/orderHelpers';
import styles from './CancelOrderModal.module.css';

interface CancelOrderModalProps {
  order: Order;
  isUpdating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: (key: string) => string;
  locale?: string;
}

export const CancelOrderModal = ({ order, isUpdating, onConfirm, onCancel, t, locale = 'en' }: CancelOrderModalProps) => {
  const dateLocaleStr = locale === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <XCircle className={styles.icon} />
          </div>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>{t('admin.orders.confirmCancelTitle')}</h3>
            <p className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{t('admin.orders.confirmCancelMessage')}</p>
          <div className={styles.details}>
            <p className={styles.detailRow}><strong>{t('admin.orders.customer')}:</strong> {order.customerInfo.name}</p>
            <p className={styles.detailRow}><strong>{t('admin.orders.total')}:</strong> {formatPrice(order.summary.total)}</p>
            <p className={styles.detailRow}><strong>{t('admin.orders.orderTime')}:</strong> {formatDate(order.createdAt, dateLocaleStr)}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={onCancel}
            className={styles.keepButton}
          >
            {t('button.keepOrder')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className={styles.cancelButton}
          >
            {isUpdating ? (
              <>
                <Loader2 className={`${styles.buttonIcon} ${styles.spinner}`} />
                {t('button.canceling')}
              </>
            ) : (
              <>
                <XCircle className={styles.buttonIcon} />
                {t('button.confirmCancel')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
