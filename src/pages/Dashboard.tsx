import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import { AdminLayout } from '../components/AdminLayout';
import { StoreSetup } from '../components/StoreSetup';
import { ProductManagement } from '../components/ProductManagement';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { OrderManagement } from '../components/OrderManagement';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const hash = window.location.hash;
  
  if (!currentUser) {
    window.location.hash = '#login';
    return null;
  }

  const renderContent = () => {
    switch (hash) {
      case '#dashboard/products':
        return <ProductManagement />;
      case '#dashboard/metrics':
        return <MetricsDashboard />;
      case '#dashboard/orders':
        return <OrderManagement />;
      default:
        return (
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <StoreSetup />
          </LoadScript>
        );
    }
  };

  const getCurrentPage = () => {
    switch (hash) {
      case '#dashboard/products':
        return 'products';
      case '#dashboard/metrics':
        return 'metrics';
      case '#dashboard/orders':
        return 'orders';
      default:
        return 'store';
    }
  };

  return (
    <AdminLayout currentPage={getCurrentPage()}>
      {renderContent()}
    </AdminLayout>
  );
};