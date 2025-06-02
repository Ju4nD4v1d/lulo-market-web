import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Products
      </button>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-800">
              ${product.price.toFixed(2)}
            </span>
            {product.stock !== undefined && (
              <span className="text-sm text-gray-600">
                In Stock: {product.stock}
              </span>
            )}
          </div>
          {product.category && (
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
              {product.category}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;