import { ShoppingCart, Package, Truck, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Order, OrderStatus } from '../../../../../types/order';

interface OrderTimelineProps {
  order: Order;
  t: (key: string) => string;
}

export const OrderTimeline = ({ order, t }: OrderTimelineProps) => {
  const timelineSteps = [
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
  ];

  return (
    <div className="space-y-4">
      {timelineSteps.map((step) => {
        const Icon = step.icon;
        const isCurrentStep = order.status === step.status;

        return (
          <div key={step.status} className="flex items-start space-x-3">
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2
              ${step.active
                ? isCurrentStep
                  ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                  : 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
              }
            `}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <p className={`text-sm font-medium break-words ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </p>
              {step.time && (
                <p className="text-xs text-gray-500 mt-1">
                  {(() => {
                    try {
                      const date = step.time instanceof Date ? step.time : new Date(step.time);
                      if (isNaN(date.getTime())) return 'Invalid time';
                      return formatDistanceToNow(date, { addSuffix: true });
                    } catch (error) {
                      console.error('Error formatting timeline time:', error);
                      return 'Invalid time';
                    }
                  })()
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
