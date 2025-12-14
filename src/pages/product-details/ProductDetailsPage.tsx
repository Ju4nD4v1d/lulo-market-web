import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProductDetailsQuery } from '../../hooks/queries';
import { trackViewContent } from '../../services/analytics';
import {
  ProductHeader,
  ProductImage,
  ProductInfo,
  ProductDescription,
  ProductExtraDetails,
  ProductNutrition,
  ProductIngredients,
} from './components';
import { VibrantBackground } from '../../components/VibrantBackground/VibrantBackground';
import styles from './ProductDetailsPage.module.css';

export const ProductDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId, storeSlug } = useParams<{ productId: string; storeSlug: string }>();
  const { t, locale, toggleLanguage } = useLanguage();
  const { currentUser, userProfile, logout } = useAuth();
  const { cart } = useCart();

  // Data fetching with TanStack Query
  const { product, store, isLoading, isError } = useProductDetailsQuery({
    productId: productId!,
    storeIdentifier: storeSlug!,
  });

  // Track ViewContent event when product loads
  const hasTrackedView = useRef(false);
  useEffect(() => {
    if (product && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackViewContent({
        contentId: product.id,
        contentName: product.name,
        contentType: 'product',
        value: product.price
      });
    }
  }, [product]);

  // UI state
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const languageLabel = locale === 'es' ? 'ES' : 'EN';
  const cartItemCount = cart.summary.itemCount;

  // Combine images array with legacy imageUrl, prioritizing images array
  const productImages = product?.images?.length
    ? product.images
    : (product?.imageUrl ? [product.imageUrl] : []);

  if (isLoading) {
    return (
      <VibrantBackground>
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
      </VibrantBackground>
    );
  }

  if (isError || !product) {
    return (
      <VibrantBackground>
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
      </VibrantBackground>
    );
  }

  return (
    <VibrantBackground>
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
            images={productImages}
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
                storeId={store?.id || ''}
                storeSlug={store?.slug}
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
    </VibrantBackground>
  );
};
