import React from 'react';
import clsx from 'clsx';
import { User, ShoppingCart, Globe } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserMenuDropdown } from './UserMenuDropdown';
import styles from './HomeHeader.module.css';
import avatarStyles from '../../styles/avatar.module.css';
import buttonStyles from '../../styles/button.module.css';

interface UserProfile {
  avatar?: string;
  displayName?: string;
}

interface HomeHeaderProps {
  isTestMode: boolean;
  isOffline: boolean;
  currentUser: FirebaseUser | null;
  userProfile?: UserProfile;
  cartItemCount: number;
  showUserMenu: boolean;
  onToggleLanguage: () => void;
  onCartClick: () => void;
  onUserMenuClick: () => void;
  onUserMenuClose: () => void;
  onLogout: () => void;
  onMenuNavigate: (path: string) => void;
  onLoginRedirect: () => void;
  t: (key: string) => string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  isTestMode,
  isOffline,
  currentUser,
  userProfile,
  cartItemCount,
  showUserMenu,
  onToggleLanguage,
  onCartClick,
  onUserMenuClick,
  onUserMenuClose,
  onLogout,
  onMenuNavigate,
  onLoginRedirect,
  t,
}) => {
  return (
    <header className={styles.header}>
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className={clsx(styles.banner, styles.testModeBanner)}>
          <span className={styles.testModeText}>
            🧪 {t('testMode.active')}
          </span>
        </div>
      )}

      {/* Offline Banner */}
      {isOffline && (
        <div className={clsx(styles.banner, styles.offlineBanner)}>
          <div className={styles.offlineBannerContent}>
            <div className={styles.pulseIndicator}></div>
            <span className={styles.offlineText}>
              You're offline. Please check your internet connection.
            </span>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.nav}>
          {/* Logo */}
          <div className={styles.logo}>
            <button
              onClick={() => (window.location.hash = '#')}
              className={styles.logoButton}
            >
              <span>LuloCart</span>
            </button>
          </div>

          {/* Right side actions */}
          <div className={styles.actions}>
            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className={buttonStyles.header}
            >
              <Globe style={{ width: '20px', height: '20px' }} />
              <span className={styles.languageText}>{t('language.toggle')}</span>
            </button>

            {/* For Business Link */}
            <a
              href="#business"
              className={clsx(buttonStyles.header, styles.businessLink)}
            >
              {t('nav.forBusiness')}
            </a>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className={styles.cartButton}
            >
              <ShoppingCart style={{ width: '20px', height: '20px' }} />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            {currentUser ? (
              <div className={styles.userSection}>
                <button
                  onClick={onUserMenuClick}
                  className={styles.userButton}
                >
                  <div className={avatarStyles.header}>
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt="Profile"
                        className={avatarStyles.image}
                      />
                    ) : (
                      <div className={avatarStyles.placeholder}>
                        <User style={{ width: '16px', height: '16px', color: '#1f2937' }} />
                      </div>
                    )}
                  </div>
                </button>

                {/* User Menu Dropdown */}
                <UserMenuDropdown
                  isOpen={showUserMenu}
                  onClose={onUserMenuClose}
                  userProfile={userProfile}
                  currentUser={currentUser}
                  onLogout={onLogout}
                  onNavigate={onMenuNavigate}
                  t={t}
                />
              </div>
            ) : (
              <button
                onClick={onLoginRedirect}
                className={styles.loginButton}
                title="Sign In"
              >
                <User style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
