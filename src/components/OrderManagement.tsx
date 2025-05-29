import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const OrderManagement = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No orders yet.</p>
          <p className="text-gray-500 text-sm">Orders will appear here once customers start purchasing.</p>
        </div>
      </div>
    </div>
  );
};