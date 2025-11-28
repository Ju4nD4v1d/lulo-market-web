import { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProductDetailsQuery } from '../../hooks/queries';
import {
  ProductHeader,
  ProductImage,
  ProductInfo,
  ProductDescription,
  ProductExtraDetails,
  ProductNutrition,
  ProductIngredients,
} from './components';
import styles from './ProductDetailsPage.module.css';

interface ProductDetailsPageProps {
  productId: string;
  storeId: string;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  storeId,
}) => {
  const { t, locale, toggleLanguage } = useLanguage();
  const { currentUser, userProfile, logout } = useAuth();
  const { cart } = useCart();

  // Data fetching with TanStack Query
  const { product, store, isLoading, isError } = useProductDetailsQuery({
    productId,
    storeId,
  });

  // UI state
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleSignInClick = () => {
    window.location.hash = '#login';
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleCartClick = useCallback(() => {
    window.location.hash = '#cart';
  }, []);

  const languageLabel = locale === 'es' ? 'ES' : 'EN';
  const cartItemCount = cart.summary.itemCount;
  const productImage = product?.imageUrl || (product?.images && product.images.length > 0 ? product.images[0] : null);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <ProductHeader
          onBack={handleBack}
          onLanguageToggle={toggleLanguage}
          languageLabel={languageLabel}
          cartItemCount={cartItemCount}
          onCartClick={handleCartClick}
          currentUser={currentUser}
          userProfile={userProfile}
          onUserMenuClick={() => setShowUserMenu(!showUserMenu)}
          showUserMenu={showUserMenu}
          onLogout={handleLogout}
          onSignInClick={handleSignInClick}
          t={t}
        />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>{t('productDetails.loading')}</p>
        </div>
              </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.page}>
        <ProductHeader
          onBack={handleBack}
          onLanguageToggle={toggleLanguage}
          languageLabel={languageLabel}
          cartItemCount={cartItemCount}
          onCartClick={handleCartClick}
          currentUser={currentUser}
          userProfile={userProfile}
          onUserMenuClick={() => setShowUserMenu(!showUserMenu)}
          showUserMenu={showUserMenu}
          onLogout={handleLogout}
          onSignInClick={handleSignInClick}
          t={t}
        />
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>📦</span>
          <h2 className={styles.errorTitle}>{t('productDetails.notFound')}</h2>
          <button onClick={handleBack} className={styles.backButton}>
            {t('productDetails.back')}
          </button>
        </div>
              </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProductHeader
        onBack={handleBack}
        onLanguageToggle={toggleLanguage}
        languageLabel={languageLabel}
        cartItemCount={cartItemCount}
        onCartClick={handleCartClick}
        currentUser={currentUser}
        userProfile={userProfile}
        onUserMenuClick={() => setShowUserMenu(!showUserMenu)}
        showUserMenu={showUserMenu}
        onLogout={handleLogout}
        onSignInClick={handleSignInClick}
        t={t}
      />

      <main className={styles.main}>
        <div className={styles.container}>
          <ProductImage
            imageUrl={productImage}
            productName={product.name}
          />

          <div className={styles.content}>
            {/* Main info - spans full width on desktop */}
            <div className={styles.infoSection}>
              <ProductInfo
                storeName={store?.name || ''}
                productName={product.name}
                price={product.price}
                category={product.category}
                stock={product.stock}
                status={product.status}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
                t={t}
                product={product}
                storeId={storeId}
                storeImage={store?.storeImage || store?.imageUrl}
              />
            </div>

            {/* Description - spans full width */}
            <div className={styles.infoSection}>
              <ProductDescription
                description={product.description}
                t={t}
              />
            </div>

            {/* Details grid - 2 columns on desktop */}
            <ProductExtraDetails
              preparationTime={product.preparationTime}
              servingSize={product.servingSize}
              allergens={product.allergens}
              t={t}
            />

            <ProductNutrition
              nutritionInfo={product.nutritionInfo}
              t={t}
            />

            {/* Ingredients section - only shown when product has ingredients data */}
            {product.ingredients && product.ingredients.main.length > 0 && (
              <ProductIngredients
                main={product.ingredients.main}
                contains={product.ingredients.contains}
                t={t}
              />
            )}
          </div>
        </div>
      </main>

          </div>
  );
};
