import { useState, useMemo, useCallback } from 'react';
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
  Truck,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useOrdersQuery } from '../../../../hooks/queries/useOrdersQuery';
import { useOrderMutations } from '../../../../hooks/mutations/useOrderMutations';
import { useOrderFilters } from './hooks/useOrderFilters';
import { useOrderSorting, SortOption } from './hooks/useOrderSorting';
import { OrderTimeline } from './components/OrderTimeline';
import { CancelOrderModal } from './components/CancelOrderModal';
import { Order, OrderStatus } from '../../../../types/order';
import { getNextStatus, formatPrice, formatDate } from './utils/orderHelpers';
import { statusColors } from './utils/statusConfig';
import * as paymentApi from '../../../../services/api/paymentApi';
import styles from './OrdersPage.module.css';

const getStatusIcon = (status: OrderStatus, iconClass: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <Clock className={iconClass} />;
    case OrderStatus.CONFIRMED:
      return <CheckCircle2 className={iconClass} />;
    case OrderStatus.PREPARING:
      return <Package className={iconClass} />;
    case OrderStatus.READY:
      return <ShoppingCart className={iconClass} />;
    case OrderStatus.OUT_FOR_DELIVERY:
      return <Truck className={iconClass} />;
    case OrderStatus.DELIVERED:
      return <CheckCircle2 className={iconClass} />;
    case OrderStatus.CANCELLED:
      return <XCircle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
};

export const OrdersPage = () => {
  const { t, locale } = useLanguage();
  const { storeId } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Use TanStack Query hooks
  const { orders, isLoading: loading, error } = useOrdersQuery({ storeId });
  const { updateOrderStatus: updateOrderStatusMutation } = useOrderMutations(storeId || '');
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredOrders } = useOrderFilters(orders);
  const { sortOption, setSortOption, sortOrders } = useOrderSorting();

  // Apply sorting to filtered orders - memoized to avoid recalculation
  const sortedOrders = useMemo(
    () => sortOrders(filteredOrders),
    [sortOrders, filteredOrders]
  );

  // Helper function to calculate urgency level - memoized
  // Uses calendar day comparison instead of hours to correctly identify today/tomorrow
  const getUrgencyLevel = useCallback((order: Order): 'overdue' | 'today' | 'tomorrow' | null => {
    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) return null;

    const now = new Date();
    const deliveryTime = order.preferredDeliveryTime
      ? new Date(order.preferredDeliveryTime)
      : order.estimatedDeliveryTime
        ? new Date(order.estimatedDeliveryTime)
        : null;

    if (!deliveryTime || isNaN(deliveryTime.getTime())) return null;

    // Compare calendar dates, not hours
    // This ensures "today" means same calendar day, "tomorrow" means next calendar day
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deliveryDate = new Date(deliveryTime.getFullYear(), deliveryTime.getMonth(), deliveryTime.getDate());

    const diffDays = Math.floor((deliveryDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return null;
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, order?: Order) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, newStatus, order });
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

    // If payment is authorized, void the authorization first to release held funds
    if (orderToCancel.paymentStatus === 'authorized') {
      console.log('🔄 Voiding payment authorization before cancelling order...');
      try {
        const voidResult = await paymentApi.voidPaymentAuthorization(
          orderToCancel.id,
          'Order cancelled by store'
        );
        if (voidResult.success) {
          console.log('✅ Payment authorization voided successfully');
        } else {
          console.error('⚠️ Failed to void authorization:', voidResult.error);
          // Continue with cancellation - backend will handle cleanup
        }
      } catch (error) {
        console.error('⚠️ Error voiding authorization:', error);
        // Continue with cancellation - backend will handle cleanup
      }
    }

    await updateOrderStatus(orderToCancel.id, OrderStatus.CANCELLED, orderToCancel);
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const cancelCancelOrder = () => {
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const getStatusText = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING:
      case 'pending_payment': // Legacy backward compatibility
        return t('order.status.pending');
      case OrderStatus.PROCESSING:
        return t('order.status.processing');
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
      case 'canceled': // Backend may use US spelling
        return t('order.status.cancelled');
      case OrderStatus.FAILED:
      case 'payment_failed': // Legacy backward compatibility
        return t('order.status.paymentFailed');
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

          <div className={styles.sortWrapper}>
            <ArrowUpDown className={styles.sortIcon} />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={styles.sortSelect}
            >
              <option value="newest">{t('order.sort.newest')}</option>
              <option value="oldest">{t('order.sort.oldest')}</option>
              <option value="urgency">{t('order.sort.urgency')}</option>
              <option value="status">{t('order.sort.byStatus')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {sortedOrders.length === 0 ? (
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
          sortedOrders.map((order) => {
            const urgencyLevel = getUrgencyLevel(order);
            return (
            <div key={order.id} className={styles.orderCard}>
              {/* Order Header */}
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  {getStatusIcon(order.status, styles.statusIcon)}
                  <div>
                    <h3 className={styles.orderId}>
                      {t('order.label')} #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className={styles.orderDate}>{formatDate(order.createdAt, locale === 'es' ? 'es-ES' : 'en-CA')}</p>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <div className={styles.priceInfo}>
                    <p className={styles.price}>{formatPrice(order.summary.finalTotal ?? order.summary.total)}</p>
                    <p className={styles.itemCount}>{order.summary.itemCount} {t('common.items')}</p>
                  </div>

                  <div className={`${styles.statusBadge} ${statusColors[order.status]}`}>
                    {getStatusText(order.status)}
                  </div>

                  {urgencyLevel && (
                    <div className={`${styles.urgencyBadge} ${styles[`urgency${urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}`]}`}>
                      <AlertTriangle className={styles.urgencyIcon} />
                      <span>{t(`order.urgency.${urgencyLevel}`)}</span>
                    </div>
                  )}

                  {/* Quick Action Button - Mobile only */}
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!, order)}
                      disabled={updatingOrderId === order.id}
                      className={styles.quickActionButton}
                    >
                      {updatingOrderId === order.id ? (
                        <Loader2 className={`${styles.quickActionIcon} ${styles.loadingSpinner}`} />
                      ) : (
                        <CheckCircle2 className={styles.quickActionIcon} />
                      )}
                      {getNextActionText(order.status)}
                    </button>
                  )}

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
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!, order)}
                              disabled={updatingOrderId === order.id}
                              className={styles.primaryButton}
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className={styles.buttonIcon} />
                              ) : (
                                getStatusIcon(getNextStatus(order.status)!, styles.buttonIcon)
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
                      <OrderTimeline order={order} t={t} locale={locale} />
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
                              <p className={styles.itemQuantity}>{t('order.quantity')} {item.quantity}</p>
                              {item.specialInstructions && (
                                <p className={styles.specialInstructions}>{item.specialInstructions}</p>
                              )}
                            </div>
                          </div>
                          <div className={styles.itemPrice}>
                            <p className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</p>
                            <p className={styles.itemUnit}>{formatPrice(item.price)} {t('order.each')}</p>
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
                      {(order.summary?.gst ?? 0) > 0 && (
                        <div className={styles.summaryRow}>
                          <span>{t('cart.summary.gst')}</span>
                          <span>{formatPrice(order.summary?.gst || 0)}</span>
                        </div>
                      )}
                      {(order.summary?.pst ?? 0) > 0 && (
                        <div className={styles.summaryRow}>
                          <span>{t('cart.summary.pst')}</span>
                          <span>{formatPrice(order.summary?.pst || 0)}</span>
                        </div>
                      )}
                      <div className={styles.summaryRow}>
                        <span className={styles.deliveryLabel}>
                          {t('order.deliveryFee')}
                          {order.summary?.deliveryFeeDiscount?.isEligible && (
                            <span className={styles.discountBadge}>
                              {t('cart.summary.newCustomerDiscount')}
                            </span>
                          )}
                        </span>
                        <span>
                          {order.summary?.deliveryFeeDiscount?.isEligible ? (
                            <span className={styles.discountedPrice}>
                              <span className={styles.originalPrice}>
                                {formatPrice(order.summary.deliveryFeeDiscount.originalFee)}
                              </span>
                              <span className={styles.finalPrice}>
                                {formatPrice(order.summary.deliveryFeeDiscount.discountedFee)}
                              </span>
                            </span>
                          ) : (
                            formatPrice(order.summary?.deliveryFee || 0)
                          )}
                        </span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>{t('order.platformFee')}</span>
                        <span>{formatPrice(order.summary?.platformFee || 0)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>{t('cart.total')}</span>
                        <span className={styles.totalAmount}>{formatPrice(order.summary?.finalTotal || order.summary?.total || 0)}</span>
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
          );
          })
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
          locale={locale}
        />
      )}
    </div>
  );
};

export default OrdersPage;
