/**
 * StoreOrdersTab - View-only orders list for admin dashboard
 *
 * ADMIN VIEW: Displays ALL store orders including orphan/abandoned orders.
 * This differs from the store owner view which hides orphans.
 *
 * Orphan orders (status='pending' + paymentStatus='pending') are shown
 * with a visual indicator so admins can identify them for cleanup.
 */

import { useState, useMemo } from 'react';
import {
  Package,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Truck,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useOrdersQuery } from '../../../../hooks/queries/useOrdersQuery';
import { Order, OrderStatus } from '../../../../types/order';
import { filterOrdersForAdmin, isOrphanOrder } from '../../../../utils/orderUtils';
import styles from './StoreOrdersTab.module.css';

interface StoreOrdersTabProps {
  storeId: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(price);
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <Clock className={styles.statusIconSmall} />;
    case OrderStatus.CONFIRMED:
      return <CheckCircle2 className={styles.statusIconSmall} />;
    case OrderStatus.PREPARING:
      return <Package className={styles.statusIconSmall} />;
    case OrderStatus.READY:
      return <ShoppingCart className={styles.statusIconSmall} />;
    case OrderStatus.OUT_FOR_DELIVERY:
      return <Truck className={styles.statusIconSmall} />;
    case OrderStatus.DELIVERED:
      return <CheckCircle2 className={styles.statusIconSmall} />;
    case OrderStatus.CANCELLED:
      return <XCircle className={styles.statusIconSmall} />;
    default:
      return <Clock className={styles.statusIconSmall} />;
  }
};

export const StoreOrdersTab = ({ storeId }: StoreOrdersTabProps) => {
  const { t, locale } = useLanguage();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { orders: rawOrders, isLoading, error } = useOrdersQuery({ storeId });

  // ADMIN VIEW: Show ALL orders including orphans (for debugging/cleanup)
  // Use filterOrdersForAdmin which returns all orders without filtering
  const orders = useMemo(() => filterOrdersForAdmin(rawOrders), [rawOrders]);

  // Count orphan orders for display in header
  const orphanCount = useMemo(
    () => orders.filter(isOrphanOrder).length,
    [orders]
  );

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

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return styles.statusPending;
      case OrderStatus.CONFIRMED:
      case OrderStatus.PREPARING:
        return styles.statusProcessing;
      case OrderStatus.READY:
      case OrderStatus.OUT_FOR_DELIVERY:
        return styles.statusReady;
      case OrderStatus.DELIVERED:
        return styles.statusDelivered;
      case OrderStatus.CANCELLED:
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((order: Order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(term) ||
      order.customerInfo.name.toLowerCase().includes(term) ||
      order.customerInfo.email.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{t('common.loading')}</p>
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
      {/* Header with search */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>
            <Package className={styles.titleIcon} />
            {t('admin.storeOrders.title')}
          </h2>
          <div className={styles.orderCounts}>
            <span className={styles.orderCount}>
              {orders.length} {t('admin.storeOrders.orders')}
            </span>
            {/* Show orphan count if any exist (admin-only visibility) */}
            {orphanCount > 0 && (
              <span className={styles.orphanCount}>
                <AlertTriangle className={styles.orphanIcon} />
                {orphanCount} {t('admin.storeOrders.orphans')}
              </span>
            )}
          </div>
        </div>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('admin.storeOrders.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Orders list */}
      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>{t('admin.storeOrders.noOrders')}</h3>
            <p className={styles.emptyText}>
              {searchTerm
                ? t('admin.storeOrders.noSearchResults')
                : t('admin.storeOrders.noOrdersYet')}
            </p>
          </div>
        ) : (
          filteredOrders.map((order: Order) => {
            // Check if this is an orphan order (admin-only visibility)
            const isOrphan = isOrphanOrder(order);

            return (
            <div
              key={order.id}
              className={`${styles.orderCard} ${isOrphan ? styles.orphanCard : ''}`}
            >
              {/* Orphan indicator banner (admin-only) */}
              {isOrphan && (
                <div className={styles.orphanBanner}>
                  <AlertTriangle className={styles.orphanBannerIcon} />
                  <span>{t('admin.storeOrders.orphanOrder')}</span>
                </div>
              )}

              {/* Order header */}
              <button
                className={styles.orderHeader}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className={styles.orderInfo}>
                  {getStatusIcon(order.status)}
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.orderRight}>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <span className={styles.orderTotal}>
                    {formatPrice(order.summary.total)}
                  </span>
                  {expandedOrder === order.id ? (
                    <ChevronDown className={styles.expandIcon} />
                  ) : (
                    <ChevronRight className={styles.expandIcon} />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className={styles.orderDetails}>
                  {/* Customer info */}
                  <div className={styles.section}>
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
                      <div className={styles.infoRow}>
                        <MapPin className={styles.infoIcon} />
                        <div className={styles.addressText}>
                          <span>{order.deliveryAddress.street}</span>
                          <span>{order.deliveryAddress.city}, {order.deliveryAddress.province}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>{t('admin.orders.orderItems')}</h4>
                    <div className={styles.itemsList}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.item}>
                          <div className={styles.itemInfo}>
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className={styles.itemImage}
                              />
                            ) : (
                              <div className={styles.itemImagePlaceholder}>
                                <Package className={styles.placeholderIcon} />
                              </div>
                            )}
                            <div className={styles.itemDetails}>
                              <span className={styles.itemName}>{item.productName}</span>
                              <span className={styles.itemQuantity}>
                                {t('admin.storeOrders.qty')}: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className={styles.itemPrice}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                      <span>{t('cart.subtotal')}</span>
                      <span>{formatPrice(order.summary.subtotal)}</span>
                    </div>
                    {(order.summary.gst ?? 0) > 0 && (
                      <div className={styles.summaryRow}>
                        <span>{t('cart.summary.gst')}</span>
                        <span>{formatPrice(order.summary.gst)}</span>
                      </div>
                    )}
                    {(order.summary.pst ?? 0) > 0 && (
                      <div className={styles.summaryRow}>
                        <span>{t('cart.summary.pst')}</span>
                        <span>{formatPrice(order.summary.pst)}</span>
                      </div>
                    )}
                    <div className={styles.summaryRow}>
                      <span>{t('cart.deliveryFee')}</span>
                      <span>{formatPrice(order.summary.deliveryFee)}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>{t('cart.total')}</span>
                      <span>{formatPrice(order.summary.total)}</span>
                    </div>
                  </div>

                  {/* Payment status */}
                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentLabel}>{t('admin.storeOrders.paymentStatus')}:</span>
                    <span className={`${styles.paymentBadge} ${styles[`payment${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}`]}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};
