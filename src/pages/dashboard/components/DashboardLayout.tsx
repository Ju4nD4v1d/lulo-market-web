import type * as React from 'react';
import { useState, useEffect } from 'react';

import { DashboardSidebar } from './DashboardSidebar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'store' | 'products' | 'metrics' | 'orders' | 'inventory' | 'documents';
  ordersBadgeCount?: number;
}

const MOBILE_BREAKPOINT = 768;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage, ordersBadgeCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsCollapsed(isMobile);
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <DashboardSidebar
        currentPage={currentPage}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        ordersBadgeCount={ordersBadgeCount}
      />
      <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : styles.mainExpanded}`}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};
