import { OrderStatus } from '../../../../../types/order';

export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return OrderStatus.CONFIRMED;
    case OrderStatus.CONFIRMED:
      return OrderStatus.PREPARING;
    case OrderStatus.PREPARING:
      return OrderStatus.READY;
    case OrderStatus.READY:
      return OrderStatus.OUT_FOR_DELIVERY;
    case OrderStatus.OUT_FOR_DELIVERY:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
};

export const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

export const formatDate = (date: Date | string | number) => {
  try {
    if (!date) return 'Invalid Date';

    let validDate: Date;
    if (date instanceof Date) {
      validDate = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      validDate = new Date(date);
    } else {
      return 'Invalid Date';
    }

    if (isNaN(validDate.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(validDate);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid Date';
  }
};
