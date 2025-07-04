import React from 'react';

export const ShopperDashboardSimple = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Shopper Dashboard Test
      </h1>
      <p className="text-gray-600">
        This is a simple test component to verify routing works.
      </p>
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <p>Location hash: {window.location.hash}</p>
        <p>Component loaded successfully!</p>
      </div>
    </div>
  );
};