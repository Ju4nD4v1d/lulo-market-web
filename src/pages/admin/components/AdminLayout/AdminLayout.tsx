/**
 * AdminLayout - Layout wrapper for admin dashboard
 * Provides header with logo and logout button
 */

import type { ReactNode } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout, currentUser } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    window.location.hash = '#admin-login';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Shield className={styles.brandIcon} />
          <span className={styles.brandText}>{t('admin.dashboard.title')}</span>
        </div>
        <div className={styles.actions}>
          {currentUser && (
            <span className={styles.userEmail}>{currentUser.email}</span>
          )}
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label={t('admin.logout')}
          >
            <LogOut className={styles.logoutIcon} />
            <span className={styles.logoutText}>{t('admin.logout')}</span>
          </button>
        </div>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
