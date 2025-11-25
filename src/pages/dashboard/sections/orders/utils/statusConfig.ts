import { OrderStatus } from '../../../../../types/order';

export const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [OrderStatus.PREPARING]: 'bg-purple-100 text-purple-800 border-purple-200',
  [OrderStatus.READY]: 'bg-green-100 text-green-800 border-green-200',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-900 border-green-300',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200'
};
