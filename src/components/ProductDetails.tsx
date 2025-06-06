import React from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock';
  images: string[];
  pstPercentage?: number;
  gstPercentage?: number;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit }) => {
  const { t } = useLanguage();
  const totalTaxPercentage = (product.pstPercentage || 0) + (product.gstPercentage || 0);
  const taxAmount = (product.price * totalTaxPercentage) / 100;
  const totalPrice = product.price + taxAmount;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('products.back')}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg 
            hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-5 h-5 mr-2" />
          {t('products.edit')}
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
              <span className="text-gray-500">{t('products.noImage')}</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('products.description')}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('products.basePrice')}</span>
              <span className="text-2xl font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            {(product.pstPercentage || product.gstPercentage) && (
              <>
                {product.pstPercentage > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('products.pst')} ({product.pstPercentage}%)</span>
                    <span className="text-gray-900">
                      ${((product.price * product.pstPercentage) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                
                {product.gstPercentage > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('products.gst')} ({product.gstPercentage}%)</span>
                    <span className="text-gray-900">
                      ${((product.price * product.gstPercentage) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-800 font-medium">{t('products.totalWithTax')}</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-gray-600">{t('products.stock')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {product.stock} {t('products.units')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};