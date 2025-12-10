import type * as React from 'react';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ShoppingCart } from 'lucide-react';
import { UserButton } from '../../../components/UserButton';
import { UserMenuDropdown } from '../../../components/shared/user/UserMenuDropdown';
import styles from './ProductHeader.module.css';

interface ProductHeaderProps {
  onBack: () => void;
  onLanguageToggle: () => void;
  languageLabel: string;
  cartItemCount: number;
  onCartClick: () => void;
  currentUser: unknown;
  userProfile: unknown;
  onUserMenuClick: () => void;
  showUserMenu: boolean;
  onLogout: () => void;
  onSignInClick: () => void;
  t: (key: string) => string;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  onBack,
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
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onUserMenuClick();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left: Back Button */}
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label={t('productDetails.back')}
          >
            <ArrowLeft className={styles.backIcon} />
          </button>

          {/* Right: Actions */}
          <div className={styles.actions}>
            {/* Language Toggle */}
            <button
              onClick={onLanguageToggle}
              className={styles.actionButton}
              aria-label={t('language.toggle')}
            >
              <Globe className={styles.actionIcon} />
              <span className={styles.actionLabel}>{languageLabel}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className={styles.cartButton}
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className={styles.actionIcon} />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User Button */}
            <div className={styles.userMenuContainer}>
              <UserButton
                currentUser={currentUser}
                userProfile={userProfile}
                onClick={currentUser ? onUserMenuClick : onSignInClick}
                size="medium"
                showBorder={true}
              />

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
    </header>
  );
};
