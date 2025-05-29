import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { StoreSetup } from '../components/StoreSetup';
import { ProductManagement } from '../components/ProductManagement';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { OrderManagement } from '../components/OrderManagement';

export const Dashboard = () => {
  // Get the current route hash
  const hash = window.location.hash;
  let currentPage: 'store' | 'products' | 'metrics' | 'orders' = 'store';

  // Determine which page to show based on the hash
  if (hash.includes('/products')) {
    currentPage = 'products';
  } else if (hash.includes('/metrics')) {
    currentPage = 'metrics';
  } else if (hash.includes('/orders')) {
    currentPage = 'orders';
  }

  // Render the appropriate component based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case 'products':
        return <ProductManagement />;
      case 'metrics':
        return <MetricsDashboard />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <StoreSetup />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage}>
      {renderContent()}
    </AdminLayout>
  );
};