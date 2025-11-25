import { XCircle, Loader2 } from 'lucide-react';
import { Order } from '../../../../../types/order';
import { formatPrice, formatDate } from '../utils/orderHelpers';

interface CancelOrderModalProps {
  order: Order;
  isUpdating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export const CancelOrderModal = ({ order, isUpdating, onConfirm, onCancel, t }: CancelOrderModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('admin.orders.confirmCancelTitle')}</h3>
            <p className="text-sm text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">{t('admin.orders.confirmCancelMessage')}</p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600"><strong>{t('admin.orders.customer')}:</strong> {order.customerInfo.name}</p>
            <p className="text-sm text-gray-600"><strong>{t('admin.orders.total')}:</strong> {formatPrice(order.summary.total)}</p>
            <p className="text-sm text-gray-600"><strong>{t('admin.orders.orderTime')}:</strong> {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1"
          >
            {t('button.keepOrder')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('button.canceling')}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {t('button.confirmCancel')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
