import React from 'react';
import { ArrowLeft, Package, DollarSign, Tag, Box, Clock } from 'lucide-react';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    status: 'active' | 'draft' | 'outOfStock';
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  onBack: () => void;
}

export const ProductDetails = ({ product, onBack }: ProductDetailsProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <div className={`
          px-3 py-1.5 rounded-full text-sm font-medium
          ${product.status === 'active' ? 'bg-green-100 text-green-800' :
            product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'}
        `}>
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          {product.images.map((image, index) => (
            <div
              key={index}
              className={`relative rounded-lg overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <img
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '1 / 1' }}
              />
            </div>
          ))}
        </div>

        {/* Product Information */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Tag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{product.category}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Box className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-semibold text-gray-900">{product.stock} units</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Modified</span>
                  <span className="text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`
                    px-2 py-1 rounded-full text-sm font-medium
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Images</span>
                  <span className="text-gray-900">{product.images.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};