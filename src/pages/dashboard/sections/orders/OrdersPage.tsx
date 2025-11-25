import { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  XCircle,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useOrdersQuery } from '../../../../hooks/queries/useOrdersQuery';
import { useOrderMutations } from '../../../../hooks/mutations/useOrderMutations';
import { useOrderFilters } from './hooks/useOrderFilters';
import { OrderTimeline } from './components/OrderTimeline';
import { CancelOrderModal } from './components/CancelOrderModal';
import { Order, OrderStatus } from '../../../../types/order';
import { getNextStatus, formatPrice, formatDate } from './utils/orderHelpers';
import { statusColors } from './utils/statusConfig';
import styles from './OrdersPage.module.css';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <Clock className="w-4 h-4" />;
    case OrderStatus.CONFIRMED:
      return <CheckCircle2 className="w-4 h-4" />;
    case OrderStatus.PREPARING:
      return <Package className="w-4 h-4" />;
    case OrderStatus.READY:
      return <ShoppingCart className="w-4 h-4" />;
    case OrderStatus.OUT_FOR_DELIVERY:
      return <Truck className="w-4 h-4" />;
    case OrderStatus.DELIVERED:
      return <CheckCircle2 className="w-4 h-4" />;
    case OrderStatus.CANCELLED:
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export const OrdersPage = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Use TanStack Query hooks
  const { orders, isLoading: loading, error } = useOrdersQuery({ storeId });
  const { updateOrderStatus: updateOrderStatusMutation } = useOrderMutations(storeId || '');
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredOrders } = useOrderFilters(orders);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, newStatus });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirmation(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    await updateOrderStatus(orderToCancel.id, OrderStatus.CANCELLED);
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const cancelCancelOrder = () => {
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const getStatusText = (status: OrderStatus) => {
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
        return status;
    }
  };

  const getNextActionText = (currentStatus: OrderStatus): string => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return t('admin.orders.confirmOrder');
      case OrderStatus.CONFIRMED:
        return t('admin.orders.startPreparing');
      case OrderStatus.PREPARING:
        return t('admin.orders.markReady');
      case OrderStatus.READY:
        return t('admin.orders.markOutForDelivery');
      case OrderStatus.OUT_FOR_DELIVERY:
        return t('admin.orders.markDelivered');
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>{t('admin.orders.title')}</h1>
            <p className={styles.subtitle}>{t('admin.orders.subtitle')}</p>
          </div>
          <div className={styles.totalOrders}>
            <p className={styles.totalLabel}>{t('admin.orders.totalOrders')}</p>
            <p className={styles.totalCount}>{orders.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('admin.orders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterWrapper}>
            <Filter className={styles.filterIcon} />
            <select
              value={statusFilter.length > 0 ? statusFilter[0] : ''}
              onChange={(e) => setStatusFilter(e.target.value ? [e.target.value as OrderStatus] : [])}
              className={styles.filterSelect}
            >
              <option value="">{t('admin.orders.allStatus')}</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>{t('admin.orders.noOrdersFound')}</h3>
            <p className={styles.emptyText}>
              {searchTerm || statusFilter.length > 0
                ? t('admin.orders.adjustFilters')
                : t('admin.orders.newOrdersMessage')}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              {/* Order Header */}
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className={styles.orderId}>
                      {t('order.label')} #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <div className={styles.priceInfo}>
                    <p className={styles.price}>{formatPrice(order.summary.total)}</p>
                    <p className={styles.itemCount}>{order.summary.itemCount} items</p>
                  </div>

                  <div className={`${styles.statusBadge} ${statusColors[order.status]}`}>
                    {getStatusText(order.status)}
                  </div>

                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className={styles.expandButton}
                  >
                    {expandedOrder === order.id ? (
                      <ChevronDown className={styles.expandIcon} />
                    ) : (
                      <ChevronRight className={styles.expandIcon} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className={styles.orderDetails}>
                  <div className={styles.detailsGrid}>
                    {/* Customer Info */}
                    <div className={styles.customerSection}>
                      <h4 className={styles.sectionTitle}>{t('admin.orders.customerInfo')}</h4>
                      <div className={styles.customerInfo}>
                        <div className={styles.infoRow}>
                          <User className={styles.infoIcon} />
                          <span>{order.customerInfo.name}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <Mail className={styles.infoIcon} />
                          <span>{order.customerInfo.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <Phone className={styles.infoIcon} />
                          <span>{order.customerInfo.phone}</span>
                        </div>
                        <div className={styles.addressRow}>
                          <MapPin className={styles.infoIcon} />
                          <div>
                            <p>{order.deliveryAddress.street}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}</p>
                            {order.deliveryAddress.deliveryInstructions && (
                              <p className={styles.deliveryInstructions}>{order.deliveryAddress.deliveryInstructions}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className={styles.orderActions}>
                        <h4 className={styles.sectionTitle}>{t('admin.orders.orderActions')}</h4>
                        <div className={styles.actions}>
                          {getNextStatus(order.status) && (
                            <button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              disabled={updatingOrderId === order.id}
                              className={styles.primaryButton}
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className={styles.buttonIcon} />
                              ) : (
                                getStatusIcon(getNextStatus(order.status)!)
                              )}
                              {getNextActionText(order.status)}
                            </button>
                          )}

                          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              disabled={updatingOrderId === order.id}
                              className={styles.cancelButton}
                            >
                              <XCircle className={styles.buttonIcon} />
                              {t('admin.orders.cancelOrder')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className={styles.timelineSection}>
                      <h4 className={styles.sectionTitle}>{t('admin.orders.orderTimeline')}</h4>
                      <OrderTimeline order={order} t={t} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.itemsSection}>
                    <h4 className={styles.sectionTitle}>{t('admin.orders.orderItems')}</h4>
                    <div className={styles.items}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.item}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemImage}>
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className={styles.productImage} />
                              ) : (
                                <Package className={styles.placeholderIcon} />
                              )}
                            </div>
                            <div>
                              <h5 className={styles.itemName}>{item.productName}</h5>
                              <p className={styles.itemQuantity}>Quantity: {item.quantity}</p>
                              {item.specialInstructions && (
                                <p className={styles.specialInstructions}>{item.specialInstructions}</p>
                              )}
                            </div>
                          </div>
                          <div className={styles.itemPrice}>
                            <p className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</p>
                            <p className={styles.itemUnit}>{formatPrice(item.price)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                      <div className={styles.summaryRow}>
                        <span>{t('cart.subtotal')}</span>
                        <span>{formatPrice(order.summary?.subtotal || 0)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>{t('cart.tax')}</span>
                        <span>{formatPrice(order.summary?.tax || 0)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>{t('cart.deliveryFee')}</span>
                        <span>{formatPrice(order.summary?.deliveryFee || 0)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>{t('cart.total')}</span>
                        <span className={styles.totalAmount}>{formatPrice(order.summary?.total || 0)}</span>
                      </div>
                    </div>

                    {order.orderNotes && (
                      <div className={styles.orderNotes}>
                        <h5 className={styles.notesTitle}>{t('admin.orders.orderNotes')}</h5>
                        <p className={styles.notesText}>{order.orderNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirmation && orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          isUpdating={updatingOrderId === orderToCancel.id}
          onConfirm={confirmCancelOrder}
          onCancel={cancelCancelOrder}
          t={t}
        />
      )}
    </div>
  );
};

export default OrdersPage;
