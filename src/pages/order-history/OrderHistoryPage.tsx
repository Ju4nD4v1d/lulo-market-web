import type * as React from 'react';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrderHistory, useOrderFilters } from './hooks';
import { OrderCard, SearchBar, FilterBar, EmptyState } from './components';
import styles from './OrderHistoryPage.module.css';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { orders, loading, error } = useOrderHistory(currentUser?.uid);
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredOrders,
    availableStatuses,
  } = useOrderFilters(orders);

  const handleBack = () => navigate(-1);

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div
          className={styles.spinner}
          role="progressbar"
          aria-label="Loading orders"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
          </button>
          <div>
            <h1 className={styles.title}>{t('orderHistory.title')}</h1>
            <p className={styles.subtitle}>{t('orderHistory.subtitle')}</p>
          </div>
        </div>
        <div className={styles.errorContainer}>
          <XCircle className={styles.errorIcon} />
          <h3 className={styles.errorTitle}>{t('orderHistory.errorTitle')}</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.errorButton}>
            {t('orderHistory.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft className={styles.backIcon} />
            </button>
            <div>
              <h1 className={styles.title}>{t('orderHistory.title')}</h1>
              <p className={styles.subtitle}>{t('orderHistory.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {orders.length > 0 && (
        <div className={styles.filtersSection}>
          <div className={styles.container}>
            <div className={styles.filtersContent}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <FilterBar
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                availableStatuses={availableStatuses}
              />
            </div>

            {/* Results count */}
            <div className={styles.resultsCount}>
              {filteredOrders.length === orders.length
                ? t('orderHistory.showingAll').replace('{count}', orders.length.toString())
                : t('orderHistory.showingFiltered')
                    .replace('{filtered}', filteredOrders.length.toString())
                    .replace('{total}', orders.length.toString())}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={styles.container}>
        {orders.length === 0 ? (
          <EmptyState onStartShopping={handleBack} />
        ) : (
          <div className={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
