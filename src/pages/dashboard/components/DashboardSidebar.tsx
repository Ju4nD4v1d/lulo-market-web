import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const { hasStore, storeSlug } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
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
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  // Build dashboard base path with storeSlug if available
  const dashboardBase = storeSlug ? `/dashboard/${storeSlug}` : '/dashboard';

  const menuItems = [
    { id: 'store' as const, label: t('admin.menu.store'), icon: Store, path: dashboardBase, disabled: false },
    { id: 'products' as const, label: t('admin.menu.products'), icon: Package, path: `${dashboardBase}/products`, disabled: !hasStore },
    { id: 'inventory' as const, label: t('admin.menu.inventory'), icon: Boxes, path: `${dashboardBase}/inventory`, disabled: !hasStore },
    { id: 'orders' as const, label: t('admin.menu.orders'), icon: ShoppingCart, path: `${dashboardBase}/orders`, disabled: !hasStore },
    { id: 'metrics' as const, label: t('admin.menu.metrics'), icon: BarChart3, path: `${dashboardBase}/metrics`, disabled: !hasStore },
    { id: 'documents' as const, label: t('admin.menu.documents'), icon: FileText, path: `${dashboardBase}/documents`, disabled: !hasStore }
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
          {menuItems.map((item) => {
            // Check if current path matches the menu item
            // Handle both /dashboard and /dashboard/:storeId formats
            // Known dashboard sub-paths that are NOT storeIds
            const knownSubPaths = ['products', 'orders', 'metrics', 'inventory', 'documents'];
            const pathSegments = location.pathname.split('/').filter(Boolean);
            // Check if path is /dashboard/{something} where {something} is NOT a known sub-path
            const isStoreIdPath = pathSegments.length === 2 &&
              pathSegments[0] === 'dashboard' &&
              !knownSubPaths.includes(pathSegments[1]);

            const isStorePageActive = item.id === 'store' && (
              location.pathname === dashboardBase ||
              location.pathname === '/dashboard' ||
              isStoreIdPath // matches /dashboard/:storeId (no sub-path)
            );
            const isActive = location.pathname === item.path || isStorePageActive;
            return (
              <li key={item.id}>
                {item.disabled ? (
                  <div
                    className={`
                      ${styles.menuItem}
                      ${isCollapsed ? styles.menuItemCollapsed : ''}
                      ${styles.menuItemDisabled}
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
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      ${styles.menuItem}
                      ${isCollapsed ? styles.menuItemCollapsed : ''}
                      ${isActive ? styles.menuItemActive : ''}
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
                  </Link>
                )}
              </li>
            );
          })}
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
