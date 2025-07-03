import React from 'react';
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
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick,
  showAddToCart = true,
  storeId,
  storeName
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
            Out of Stock
          </span>
        );
      case 'draft':
        return (
          <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  const isOutOfStock = product.status === 'outOfStock' || product.stock === 0;

  return (
    <div 
      className={`bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg overflow-hidden transition-transform hover:scale-[1.01] md:hover:scale-[1.02] cursor-pointer ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="w-full h-32 md:h-40 lg:h-48 bg-gray-200 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Popular Badge */}
        {product.isPopular && (
          <span className="absolute top-1 md:top-2 right-1 md:right-2 bg-[#C8E400] text-gray-800 text-xs px-2 py-1 rounded">
            {t('product.popular')}
          </span>
        )}
      </div>

      <div className="p-3 md:p-4">
        {/* Product Info */}
        <div className="mb-2 md:mb-3">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base">
            {product.name}
          </h3>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 mb-2 md:mb-3 flex-wrap">
          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{product.averageRating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="hidden md:inline">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Prep Time */}
          {product.preparationTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="truncate">{product.preparationTime}</span>
            </div>
          )}

          {/* Serving Size */}
          {product.servingSize && (
            <div className="flex items-center gap-1 hidden md:flex">
              <Users className="w-3 h-3" />
              <span>{product.servingSize}</span>
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
                  className="text-xs bg-orange-100 text-orange-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded"
                >
                  {allergen}
                </span>
              ))}
              {product.allergens.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.allergens.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold text-gray-800">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && (
              <span className="text-xs text-gray-500 hidden md:block">
                {product.stock} {t('product.inStock')}
              </span>
            )}
          </div>

          {showAddToCart && !isOutOfStock && (
            <AddToCartButton 
              product={product}
              storeId={storeId}
              storeName={storeName}
              size="sm"
              className="flex-shrink-0"
            />
          )}

          {isOutOfStock && (
            <span className="text-red-500 text-xs md:text-sm font-medium">
              {t('product.unavailable')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};