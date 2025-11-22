import type * as React from 'react';

import { DashboardSidebar } from './DashboardSidebar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'store' | 'products' | 'metrics' | 'orders';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage }) => {
  return (
    <div className={styles.container}>
      <DashboardSidebar currentPage={currentPage} />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};
