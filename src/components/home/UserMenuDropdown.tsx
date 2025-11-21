import React from 'react';
import clsx from 'clsx';
import { User, Settings, Receipt, FileText, Shield, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import styles from './UserMenuDropdown.module.css';
import avatarStyles from '../../styles/avatar.module.css';

interface UserProfile {
  avatar?: string;
  displayName?: string;
}

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  currentUser: FirebaseUser;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  t: (key: string) => string;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  onLogout,
  onNavigate,
  t,
}) => {
  if (!isOpen) return null;

  const handleOrderHistory = () => {
    window.location.hash = '#order-history';
    onClose();
  };

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
      />
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <div className={avatarStyles.menu}>
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className={avatarStyles.image}
                />
              ) : (
                <div className={avatarStyles.placeholder}>
                  <User style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
              )}
            </div>
            <div>
              <p className={styles.displayName}>
                {userProfile?.displayName || currentUser.email?.split('@')[0] || 'User'}
              </p>
              <p className={styles.email}>{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className={styles.menuItems}>
          <button
            onClick={() => onNavigate('#profile/edit')}
            className={styles.menuButton}
          >
            <Settings className={styles.icon} />
            <span>{t('profile.editProfile')}</span>
          </button>

          <button
            onClick={handleOrderHistory}
            className={styles.menuButton}
          >
            <Receipt className={styles.icon} />
            <span>{t('orderHistory.title') || 'My Orders'}</span>
          </button>

          <div className={styles.divider}></div>

          <button
            onClick={() => onNavigate('#terms')}
            className={styles.menuButton}
          >
            <FileText className={styles.icon} />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => onNavigate('#privacy')}
            className={styles.menuButton}
          >
            <Shield className={styles.icon} />
            <span>Privacy Policy</span>
          </button>

          <div className={styles.divider}></div>

          <button
            onClick={onLogout}
            className={clsx(styles.menuButton, styles.menuButtonDanger)}
          >
            <LogOut className={styles.icon} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
