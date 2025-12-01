import { useMemo } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Order, OrderStatus } from '../../../../../types/order';
import styles from './OrderTimeline.module.css';

interface OrderTimelineProps {
  order: Order;
  t: (key: string) => string;
  locale?: string;
}

export const OrderTimeline = ({ order, t, locale = 'en' }: OrderTimelineProps) => {
  const dateLocale = locale === 'es' ? es : enUS;

  // Memoize timelineSteps to avoid recreation on every render
  const timelineSteps = useMemo(() => [
    {
      status: OrderStatus.PENDING,
      label: t('order.timeline.received'),
      icon: Package,
      time: order.createdAt,
      active: true
    },
    {
      status: OrderStatus.CONFIRMED,
      label: t('order.timeline.confirmed'),
      icon: CheckCircle2,
      time: order.status === OrderStatus.CONFIRMED ? order.updatedAt : undefined,
      active: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    {
      status: OrderStatus.PREPARING,
      label: t('order.timeline.preparing'),
      icon: Package,
      time: order.status === OrderStatus.PREPARING ? order.updatedAt : undefined,
      active: [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    {
      status: OrderStatus.READY,
      label: t('order.timeline.ready'),
      icon: ShoppingCart,
      time: order.status === OrderStatus.READY ? order.updatedAt : undefined,
      active: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      label: t('order.timeline.outForDelivery'),
      icon: Truck,
      time: order.status === OrderStatus.OUT_FOR_DELIVERY ? order.updatedAt : undefined,
      active: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)
    },
    {
      status: OrderStatus.DELIVERED,
      label: t('order.timeline.delivered'),
      icon: CheckCircle2,
      time: order.deliveredAt,
      active: order.status === OrderStatus.DELIVERED
    }
  ], [order.status, order.createdAt, order.updatedAt, order.deliveredAt, t]);

  const getIconWrapperClass = (isActive: boolean, isCurrent: boolean) => {
    if (!isActive) return `${styles.iconWrapper} ${styles.inactive}`;
    if (isCurrent) return `${styles.iconWrapper} ${styles.current}`;
    return `${styles.iconWrapper} ${styles.completed}`;
  };

  return (
    <div className={styles.container}>
      {timelineSteps.map((step) => {
        const Icon = step.icon;
        const isCurrentStep = order.status === step.status;

        return (
          <div key={step.status} className={styles.step}>
            <div className={getIconWrapperClass(step.active, isCurrentStep)}>
              <Icon className={styles.icon} />
            </div>
            <div className={styles.content}>
              <p className={`${styles.label} ${step.active ? styles.active : styles.inactive}`}>
                {step.label}
              </p>
              {step.time && (
                <p className={styles.time}>
                  {(() => {
                    try {
                      const date = step.time instanceof Date ? step.time : new Date(step.time);
                      if (isNaN(date.getTime())) return t('common.invalidTime');
                      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
                    } catch (error) {
                      console.error('Error formatting timeline time:', error);
                      return t('common.invalidTime');
                    }
                  })()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
