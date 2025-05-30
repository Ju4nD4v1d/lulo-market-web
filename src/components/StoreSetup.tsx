import React from 'react';
import { Check } from 'lucide-react';

export const StoreSetup = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Store Setup Guide</h2>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Basic Information</h3>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600">Enter your store's name, description, and contact information.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Location Settings</h3>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600">Set your store's physical location and delivery radius.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Business Hours</h3>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600">Configure your operating hours and availability.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Payment Methods</h3>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600">Set up your preferred payment methods and processing options.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Product Catalog</h3>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600">Add your products with descriptions, prices, and images.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Start Setup
        </button>
      </div>
    </div>
  );
};