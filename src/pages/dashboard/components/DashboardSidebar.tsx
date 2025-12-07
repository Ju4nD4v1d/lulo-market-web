import type * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Store,
  Package,
  BarChart3,
  ShoppingCart,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Boxes,
  FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useStore } from '../../../context/StoreContext';
import { COMPANY_NAME } from '../../../config/company';
import styles from './DashboardSidebar.module.css';

interface DashboardSidebarProps {
  currentPage: 'store' | 'products' | 'metrics' | 'orders' | 'inventory' | 'documents';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  ordersBadgeCount?: number;
}

const MOBILE_BREAKPOINT = 768;

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentPage,
  isCollapsed,
  onToggleCollapse,
  ordersBadgeCount = 0
}) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { hasStore } = useStore();
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track if we're on mobile to hide toggle button
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#login';
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const menuItems = [
    { id: 'store' as const, label: t('admin.menu.store'), icon: Store, hash: '#dashboard', disabled: false },
    { id: 'products' as const, label: t('admin.menu.products'), icon: Package, hash: '#dashboard/products', disabled: !hasStore },
    { id: 'inventory' as const, label: t('admin.menu.inventory'), icon: Boxes, hash: '#dashboard/inventory', disabled: !hasStore },
    { id: 'orders' as const, label: t('admin.menu.orders'), icon: ShoppingCart, hash: '#dashboard/orders', disabled: !hasStore },
    { id: 'metrics' as const, label: t('admin.menu.metrics'), icon: BarChart3, hash: '#dashboard/metrics', disabled: !hasStore },
    { id: 'documents' as const, label: t('admin.menu.documents'), icon: FileText, hash: '#dashboard/documents', disabled: !hasStore }
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Logo/Brand */}
      <div className={styles.header}>
        {isCollapsed ? (
          logoError ? (
            <div className={styles.logoPlaceholder}>
              <span className={styles.logoText}>
                {COMPANY_NAME.charAt(0)}
              </span>
            </div>
          ) : (
            <img
              src="/logo_lulo.png"
              alt={COMPANY_NAME}
              className={styles.logoSmall}
              onError={handleLogoError}
            />
          )
        ) : (
          <h1 className={styles.brandName}>
            {COMPANY_NAME}
          </h1>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.hash}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                className={`
                  ${styles.menuItem}
                  ${isCollapsed ? styles.menuItemCollapsed : ''}
                  ${item.disabled ? styles.menuItemDisabled : ''}
                  ${currentPage === item.id ? styles.menuItemActive : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={styles.menuIconWrapper}>
                  <item.icon className={`${styles.menuIcon} ${isCollapsed ? styles.menuIconCollapsed : ''}`} />
                  {item.id === 'orders' && ordersBadgeCount > 0 && (
                    <span className={styles.badge}>
                      {ordersBadgeCount > 99 ? '99+' : ordersBadgeCount}
                    </span>
                  )}
                </span>
                <span className={isCollapsed ? styles.hidden : styles.menuLabel}>
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className={styles.userSection}>
        <div className={`${styles.userInfo} ${isCollapsed ? styles.userInfoCollapsed : ''}`}>
          <User className={`${styles.userIcon} ${isCollapsed ? styles.userIconCollapsed : ''}`} />
          <span className={`${styles.userEmail} ${isCollapsed ? styles.hidden : ''}`}>
            {currentUser?.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${isCollapsed ? styles.logoutButtonCollapsed : ''}`}
        >
          <LogOut className={`${styles.logoutIcon} ${isCollapsed ? styles.logoutIconCollapsed : ''}`} />
          <span className={isCollapsed ? styles.hidden : ''}>
            {t('admin.logout')}
          </span>
        </button>
      </div>

      {/* Toggle Button - Only visible on desktop (not mobile) */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          className={styles.toggleButton}
          aria-label={isCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
        >
          {isCollapsed ? (
            <ChevronRight className={styles.toggleIcon} />
          ) : (
            <ChevronLeft className={styles.toggleIcon} />
          )}
        </button>
      )}
    </aside>
  );
};
