import React from 'react';
import { User } from 'lucide-react';
import styles from './UserButton.module.css';
import avatarStyles from '../styles/avatar.module.css';

interface UserButtonProps {
  currentUser: any;
  userProfile: any;
  onClick: () => void;
  showBorder?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const UserButton: React.FC<UserButtonProps> = ({
  currentUser,
  userProfile,
  onClick,
  showBorder = true,
  size = 'medium',
}) => {
  const buttonClass = `${styles.userButton} ${showBorder ? styles.withBorder : ''} ${styles[size]}`;

  return (
    <button onClick={onClick} className={buttonClass} aria-label="User menu">
      <div className={`${avatarStyles.container} ${avatarStyles[size]}`}>
        {currentUser && userProfile?.avatar ? (
          <img
            src={userProfile.avatar}
            alt="Profile"
            className={avatarStyles.image}
          />
        ) : (
          <div className={avatarStyles.placeholder}>
            <User className={styles.userIcon} />
          </div>
        )}
      </div>
    </button>
  );
};
