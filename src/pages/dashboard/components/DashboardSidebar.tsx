import type * as React from 'react';
import { useState } from 'react';
import {
  Store,
  Package,
  BarChart3,
  ShoppingCart,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useStore } from '../../../context/StoreContext';
import { COMPANY_NAME } from '../../../config/company';
import styles from './DashboardSidebar.module.css';

interface DashboardSidebarProps {
  currentPage: 'store' | 'products' | 'metrics' | 'orders';
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ currentPage }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { hasStore } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(false);

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
    { id: 'metrics' as const, label: t('admin.menu.metrics'), icon: BarChart3, hash: '#dashboard/metrics', disabled: !hasStore },
    { id: 'orders' as const, label: t('admin.menu.orders'), icon: ShoppingCart, hash: '#dashboard/orders', disabled: !hasStore }
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
                <item.icon className={`${styles.menuIcon} ${isCollapsed ? styles.menuIconCollapsed : ''}`} />
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

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={styles.toggleButton}
      >
        {isCollapsed ? (
          <ChevronRight className={styles.toggleIcon} />
        ) : (
          <ChevronLeft className={styles.toggleIcon} />
        )}
      </button>
    </aside>
  );
};
