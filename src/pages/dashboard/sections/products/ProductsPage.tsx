import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Grid,
  List,
  Loader2,
  AlertCircle,
  Flame,
  Snowflake,
  Cookie,
  Package2,
  Tag,
  DollarSign,
  Boxes
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { useStore } from '../../../../context/StoreContext';
import { ProductDetails } from './components/ProductDetails';
import { ProductModal } from './components/ProductModal';
import { useProductsQuery } from '../../../../hooks/queries/useProductsQuery';
import { useProductMutations } from '../../../../hooks/mutations/useProductMutations';
import { useProductFilters } from './hooks/useProductFilters';
import { Product } from '../../../../types/product';
import styles from './ProductsPage.module.css';

export const ProductsPage = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  // Use TanStack Query hooks
  const { products, isLoading, error } = useProductsQuery({ storeId });
  const { saveProduct } = useProductMutations(storeId || '');
  const { searchTerm, setSearchTerm, selectedCategories, toggleCategory, filteredProducts } = useProductFilters(products);

  const categories = [
    { id: 'hot', label: t('products.category.hot'), icon: Flame },
    { id: 'frozen', label: t('products.category.frozen'), icon: Snowflake },
    { id: 'baked', label: t('products.category.baked'), icon: Cookie },
    { id: 'other', label: t('products.category.other'), icon: Package2 }
  ];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsViewingDetails(true);
  };

  if (isViewingDetails && selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setIsViewingDetails(false)}
        onEdit={() => {
          setIsViewingDetails(false);
          setIsModalOpen(true);
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('products.title')}</h1>
          <p className={styles.subtitle}>{t('products.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          disabled={!storeId}
          className={styles.addButton}
        >
          <Plus className={styles.addIcon} />
          {t('products.add')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.categories}>
            {categories.map(category => {
              const Icon = category.icon;
              const isDisabled =
                (category.id === 'hot' && selectedCategories.includes('frozen')) ||
                (category.id === 'frozen' && selectedCategories.includes('hot'));
              const isSelected = selectedCategories.includes(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  disabled={isDisabled}
                  className={`${styles.categoryButton} ${isSelected ? styles.categorySelected : ''} ${isDisabled ? styles.categoryDisabled : ''}`}
                >
                  <Icon className={styles.categoryIcon} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.viewToggle}>
          <button
            onClick={() => setViewMode('grid')}
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
          >
            <Grid className={styles.viewIcon} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
          >
            <List className={styles.viewIcon} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingSpinner} />
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} />
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <Package className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>{t('products.noProducts')}</h3>
          <p className={styles.emptyText}>{t('products.noProductsDesc')}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!storeId}
            className={styles.emptyButton}
          >
            <Plus className={styles.addIcon} />
            {t('products.addFirst')}
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className={viewMode === 'grid' ? styles.gridCard : styles.listCard}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className={styles.gridImageWrapper}>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className={styles.gridImage} />
                    ) : (
                      <div className={styles.gridImagePlaceholder}>
                        <Package className={styles.placeholderIcon} />
                      </div>
                    )}
                    <span className={`${styles.status} ${styles[`status${product.status.charAt(0).toUpperCase()}${product.status.slice(1)}`]}`}>
                      {product.status === 'outOfStock' ? t('products.status.outOfStock') : t(`products.status.${product.status}`)}
                    </span>
                  </div>
                  <div className={styles.gridContent}>
                    <h3 className={styles.gridTitle}>{product.name}</h3>
                    <div className={styles.gridFooter}>
                      <span className={styles.price}>${product.price.toFixed(2)}</span>
                      <span className={styles.stock}>Stock: {product.stock}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.listImageWrapper}>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className={styles.listImage} />
                    ) : (
                      <div className={styles.listImagePlaceholder}>
                        <Package className={styles.listPlaceholderIcon} />
                      </div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className={styles.imageBadge}>+{product.images.length - 1}</div>
                    )}
                  </div>

                  <div className={styles.listContent}>
                    <div className={styles.listHeader}>
                      <h3 className={styles.listTitle}>{product.name}</h3>
                      <span className={`${styles.status} ${styles[`status${product.status.charAt(0).toUpperCase()}${product.status.slice(1)}`]}`}>
                        {product.status === 'outOfStock' ? t('products.status.outOfStock') : t(`products.status.${product.status}`)}
                      </span>
                    </div>

                    <p className={styles.listDescription}>
                      {product.description || 'No description available'}
                    </p>

                    <div className={styles.listMeta}>
                      <div className={styles.metaItem}>
                        <Tag className={styles.metaIcon} />
                        <span>{product.category}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <DollarSign className={styles.metaIconPrice} />
                        <span className={styles.priceText}>${product.price.toFixed(2)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Boxes className={styles.metaIcon} />
                        <span>{product.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {storeId && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveProduct}
          product={selectedProduct || undefined}
          storeId={storeId}
          t={t}
        />
      )}
    </div>
  );
};

export default ProductsPage;
