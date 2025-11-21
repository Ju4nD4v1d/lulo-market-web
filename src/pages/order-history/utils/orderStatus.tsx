import React from 'react';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '../../../types/order';

export const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <Clock className="w-5 h-5 text-amber-500" />;
    case OrderStatus.CONFIRMED:
    case OrderStatus.PREPARING:
      return <Package className="w-5 h-5 text-blue-500" />;
    case OrderStatus.READY:
    case OrderStatus.OUT_FOR_DELIVERY:
      return <Package className="w-5 h-5 text-green-500" />;
    case OrderStatus.DELIVERED:
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case OrderStatus.CANCELLED:
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case OrderStatus.CONFIRMED:
    case OrderStatus.PREPARING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.READY:
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-900 border-green-300';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: OrderStatus, t: (key: string) => string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return t('order.status.pending');
    case OrderStatus.CONFIRMED:
      return t('order.status.confirmed');
    case OrderStatus.PREPARING:
      return t('order.status.preparing');
    case OrderStatus.READY:
      return t('order.status.ready');
    case OrderStatus.OUT_FOR_DELIVERY:
      return t('order.status.outForDelivery');
    case OrderStatus.DELIVERED:
      return t('order.status.delivered');
    case OrderStatus.CANCELLED:
      return t('order.status.cancelled');
    default:
      return t('order.status.pending');
  }
};
