import type * as React from 'react';

import { Star, Clock, Users } from 'lucide-react';
import { Product } from '../types/product';
import { AddToCartButton } from './AddToCartButton';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
  showAddToCart?: boolean;
  storeId?: string;
  storeName?: string;
  storeImage?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  showAddToCart = true,
  storeId,
  storeName,
  storeImage
}) => {
  const { t } = useLanguage();
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };


  const formatPrice = (price: number) => {
    return `CAD $${price.toFixed(2)}`;
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'outOfStock':
        return (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {t('products.status.outOfStock')}
          </span>
        );
      case 'draft':
        return (
          <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            {t('products.status.draft')}
          </span>
        );
      default:
        return null;
    }
  };

  const isOutOfStock = product.status === 'outOfStock' || product.stock === 0;

  return (
    <div 
      className={`enhanced-card bg-white border border-gray-200 overflow-hidden cursor-pointer flex flex-col h-full min-w-0 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative flex-shrink-0">
        {/* Product Image */}
        <div className="w-full h-40 md:h-48 lg:h-52 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-sm font-medium">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Popular Badge */}
        {product.isPopular && (
          <span className="absolute top-3 right-3 bg-primary-400 text-gray-800 text-xs px-2 py-1 rounded-full font-bold shadow-md">
            {t('product.popular')}
          </span>
        )}
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        {/* Product Info */}
        <div className="mb-2 md:mb-3 flex-1">
          <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1 text-sm md:text-base leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-600 mb-2 md:mb-3 flex-wrap">
          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="hidden sm:inline text-gray-500 text-xs">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Prep Time */}
          {product.preparationTime && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span className="truncate font-medium text-xs">{product.preparationTime}</span>
            </div>
          )}

          {/* Serving Size */}
          {product.servingSize && (
            <div className="flex items-center gap-1 hidden sm:flex flex-shrink-0">
              <Users className="w-3 h-3" />
              <span className="truncate font-medium text-xs">{product.servingSize}</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="mb-2 md:mb-3">
            <div className="flex flex-wrap gap-1">
              {product.allergens.slice(0, 2).map((allergen) => (
                <span 
                  key={allergen}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex-shrink-0 font-medium"
                >
                  {allergen}
                </span>
              ))}
              {product.allergens.length > 2 && (
                <span className="text-xs text-gray-500 flex-shrink-0 px-2 py-1 font-medium">
                  +{product.allergens.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-end justify-between mt-auto gap-2 min-w-0">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-base md:text-lg font-bold text-primary-400 leading-tight truncate">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && (
              <span className="text-xs text-gray-600 hidden sm:block font-medium leading-tight truncate">
                {product.stock} {t('product.inStock')}
              </span>
            )}
          </div>

          {showAddToCart && !isOutOfStock && (
            <div className="flex-shrink-0 max-w-[120px]">
              <AddToCartButton
                product={product}
                storeId={storeId}
                storeName={storeName}
                storeImage={storeImage}
                size="sm"
                className="w-full"
              />
            </div>
          )}

          {isOutOfStock && (
            <span className="text-red-600 text-xs font-bold flex-shrink-0 bg-red-50 px-2 py-1 rounded-full">
              {t('product.unavailable')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};