import React from 'react';
import { ArrowLeft, Edit } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock';
  images: string[];
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <button
          onClick={onEdit}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
            hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-5 h-5 mr-2" />
          Edit Product
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex items-center space-x-2">
              <span className={`
                px-2 py-1 rounded-full text-sm font-medium
                ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'}
              `}>
                {product.status}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-full text-sm text-gray-600">
                {product.category}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Price</span>
              <span className="text-2xl font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Stock</span>
              <span className="text-lg font-semibold text-gray-900">
                {product.stock} units
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};