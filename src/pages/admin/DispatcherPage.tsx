/**
 * DispatcherPage - Admin page for managing platform-level drivers
 * Accessible at #admin/dispatcher
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DriverCard } from './components/DriverCard';
import { DriverModal } from './components/DriverModal';
import { DeliveryFeeSimulator } from './components/DeliveryFeeSimulator';
import { useDriversQuery } from '../../hooks/queries/useDriversQuery';
import { useDriverMutations } from '../../hooks/mutations/useDriverMutations';
import type { Driver } from '../../types/driver';
import styles from './DispatcherPage.module.css';

type FilterType = 'all' | 'active' | 'inactive';

export const DispatcherPage = () => {
  const { userType } = useAuth();
  const { t } = useLanguage();
  const { drivers, isLoading, error, refetch } = useDriversQuery();
  const { deleteDriver, toggleDriverStatus, isDeleting, isToggling } = useDriverMutations();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Filter and search drivers - memoized for performance
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      if (filter === 'active' && !driver.isActive) return false;
      if (filter === 'inactive' && driver.isActive) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          driver.name.toLowerCase().includes(search) ||
          driver.email?.toLowerCase().includes(search) ||
          driver.phone?.toLowerCase().includes(search) ||
          driver.startingAddress.city.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [drivers, filter, searchTerm]);

  // Stats - memoized to prevent recalculation on every render
  const stats = useMemo(() => {
    const active = drivers.filter((d) => d.isActive).length;
    return {
      total: drivers.length,
      active,
      inactive: drivers.length - active,
    };
  }, [drivers]);

  // Handlers - memoized with useCallback for stable references
  const handleBack = useCallback(() => {
    window.location.hash = '#admin';
  }, []);

  const handleAddDriver = useCallback(() => {
    setEditingDriver(null);
    setIsModalOpen(true);
  }, []);

  const handleEditDriver = useCallback((driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }, []);

  const handleDeleteDriver = useCallback(async (driverId: string) => {
    if (window.confirm(t('dispatcher.confirmDelete'))) {
      await deleteDriver.mutateAsync(driverId);
    }
  }, [deleteDriver, t]);

  const handleToggleStatus = useCallback(async (driverId: string) => {
    await toggleDriverStatus.mutateAsync(driverId);
  }, [toggleDriverStatus]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingDriver(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingDriver(null);
    refetch();
  }, [refetch]);

  // Admin access check
  if (userType !== 'admin') {
    return (
      <div className={styles.page}>
        <div className={styles.accessDenied}>
          <h1>{t('admin.accessDenied')}</h1>
          <p>{t('admin.accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className={styles.backIcon} />
          <span>{t('common.back')}</span>
        </button>
      </header>

      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <div className={styles.titleSection}>
              <Truck className={styles.titleIcon} />
              <div>
                <h1 className={styles.title}>{t('dispatcher.title')}</h1>
                <p className={styles.subtitle}>{t('dispatcher.subtitle')}</p>
              </div>
            </div>
            <button className={styles.addButton} onClick={handleAddDriver}>
              <Plus className={styles.addIcon} />
              <span className={styles.addButtonText}>{t('dispatcher.addDriver')}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <Users className={styles.statIcon} />
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>{t('dispatcher.totalDrivers')}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statActive}`}>
            <UserCheck className={styles.statIcon} />
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>{t('dispatcher.activeDrivers')}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statInactive}`}>
            <UserX className={styles.statIcon} />
            <span className={styles.statValue}>{stats.inactive}</span>
            <span className={styles.statLabel}>{t('dispatcher.inactiveDrivers')}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('dispatcher.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('dispatcher.filterAll')}
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'active' ? styles.filterActive : ''}`}
              onClick={() => setFilter('active')}
            >
              {t('dispatcher.filterActive')}
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'inactive' ? styles.filterActive : ''}`}
              onClick={() => setFilter('inactive')}
            >
              {t('dispatcher.filterInactive')}
            </button>
          </div>
        </div>

        {/* Content */}
        <main className={styles.content}>
          {isLoading ? (
            <div className={styles.stateContainer}>
              <Loader2 className={styles.loadingSpinner} />
              <p className={styles.stateText}>{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className={styles.stateContainer}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.stateText}>{error}</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className={styles.stateContainer}>
              <Truck className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                {drivers.length === 0 ? t('dispatcher.noDrivers') : t('dispatcher.noDriversMatch')}
              </h3>
              {drivers.length === 0 && (
                <>
                  <p className={styles.emptyText}>{t('dispatcher.noDriversDescription')}</p>
                  <button className={styles.emptyButton} onClick={handleAddDriver}>
                    <Plus className={styles.addIcon} />
                    {t('dispatcher.addFirstDriver')}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.driversGrid}>
              {filteredDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onEdit={() => handleEditDriver(driver)}
                  onDelete={() => handleDeleteDriver(driver.id)}
                  onToggleStatus={() => handleToggleStatus(driver.id)}
                  isDeleting={isDeleting}
                  isToggling={isToggling}
                />
              ))}
            </div>
          )}
        </main>

        {/* Delivery Fee Simulator Section */}
        <DeliveryFeeSimulator />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <DriverModal
          driver={editingDriver}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default DispatcherPage;
