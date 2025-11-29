import type * as React from 'react';

import { ArrowLeft, Star, Search, ShoppingCart, Globe } from 'lucide-react';
import { StoreInfo } from '../types';
import { UserButton } from '../../../components/UserButton';
import { UserMenuDropdown } from '../../../components/shared/user/UserMenuDropdown';
import styles from './StoreHeader.module.css';

interface StoreHeaderProps {
  store: StoreInfo;
  onBack: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onLanguageToggle: () => void;
  languageLabel: string;
  cartItemCount: number;
  onCartClick: () => void;
  currentUser: any;
  userProfile: any;
  onUserMenuClick: () => void;
  showUserMenu: boolean;
  onLogout: () => void;
  onSignInClick: () => void;
  t: (key: string) => string;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  store,
  onBack,
  searchTerm,
  onSearchChange,
  onLanguageToggle,
  languageLabel,
  cartItemCount,
  onCartClick,
  currentUser,
  userProfile,
  onUserMenuClick,
  showUserMenu,
  onLogout,
  onSignInClick,
  t,
}) => {
  const handleNavigate = (path: string) => {
    window.location.hash = path;
    onUserMenuClick(); // Close menu
  };
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {/* Single Row Layout */}
        <div className={styles.mainRow}>
          {/* Left Side: Back button and Store Info */}
          <div className={styles.leftSection}>
            <button
              onClick={onBack}
              className={styles.backButton}
              aria-label="Go back to restaurants"
            >
              <ArrowLeft className={styles.backIcon} />
            </button>
            <div className={styles.info}>
              <h1 className={styles.name}>{store.name}</h1>
              <div className={styles.meta}>
                <Star className={styles.starIcon} />
                <span className={styles.metaItem}>
                  {store.rating} ({store.reviewCount})
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Search and Actions */}
          <div className={styles.rightSection}>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t('storeDetail.searchDishes')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {/* Language Toggle */}
              <button onClick={onLanguageToggle} className={styles.actionButton}>
                <Globe className={styles.actionIcon} />
                <span className={styles.actionLabel}>{languageLabel}</span>
              </button>

              {/* Cart Button */}
              <button onClick={onCartClick} className={styles.cartButton}>
                <ShoppingCart className={styles.actionIcon} />
                {cartItemCount > 0 && (
                  <span className={styles.cartBadge}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User Account or Sign In */}
              <div className={styles.userMenuContainer}>
                <UserButton
                  currentUser={currentUser}
                  userProfile={userProfile}
                  onClick={currentUser ? onUserMenuClick : onSignInClick}
                  size="medium"
                  showBorder={true}
                />

                {/* User Menu Dropdown */}
                {currentUser && (
                  <UserMenuDropdown
                    isOpen={showUserMenu}
                    onClose={onUserMenuClick}
                    userProfile={userProfile}
                    currentUser={currentUser}
                    onLogout={onLogout}
                    onNavigate={handleNavigate}
                    t={t}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
