import type * as React from 'react';
/**
 * LegalSection - Reusable section component for legal pages
 */


import { LucideIcon } from 'lucide-react';
import styles from './LegalSection.module.css';

interface LegalSectionProps {
  icon?: LucideIcon;
  iconColor?: 'primary';
  iconBgColor?: 'primary';
  number?: string | number;
  title: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({
  icon: Icon,
  iconColor = 'primary',
  iconBgColor = 'primary',
  number,
  title,
  children
}) => {
  const iconColorClass = iconColor === 'primary' ? styles.iconPrimary : styles.iconPrimary;
  const iconBgColorClass = iconBgColor === 'primary' ? styles.iconWrapperPrimary : styles.iconWrapperPrimary;
  const numberColorClass = iconColor === 'primary' ? styles.numberPrimary : styles.numberPrimary;

  return (
    <section className={styles.section}>
      <h2 className={styles.header}>
        <div className={`${styles.iconWrapper} ${iconBgColorClass}`}>
          {Icon ? (
            <Icon className={`${styles.icon} ${iconColorClass}`} />
          ) : (
            <span className={`${styles.number} ${numberColorClass}`}>{number}</span>
          )}
        </div>
        {title}
      </h2>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
};
