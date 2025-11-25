import type * as React from 'react';
import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  DollarSign,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { Product } from '../../../../../types/product';
import { useImageUpload } from '../hooks/useImageUpload';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { PRODUCT_CATEGORIES } from '../../../../../constants/productCategories';
import styles from './ProductModal.module.css';

const defaultFormData = {
  name: '',
  description: '',
  price: '' as any, // Empty string for new products to avoid "0" prefix issue
  category: '',
  stock: '' as any, // Empty string for new products to avoid "0" prefix issue
  status: 'active' as const,
  images: [],
  pstPercentage: 0,
  gstPercentage: 0
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>, productId?: string) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
  product?: Product;
  storeId: string;
  isSaving?: boolean;
  t: (key: string) => string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  product,
  storeId,
  isSaving = false,
  t
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<Product>>(defaultFormData);
  const [dragActive, setDragActive] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { uploadImages, isLoading, error, setError } = useImageUpload(currentUser?.uid);

  useEffect(() => {
    if (isOpen) {
      // Ensure all numeric fields have valid values (not NaN or undefined)
      const safeProduct = product ? {
        ...product,
        price: typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0,
        stock: typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0,
        pstPercentage: typeof product.pstPercentage === 'number' && !isNaN(product.pstPercentage) ? product.pstPercentage : 0,
        gstPercentage: typeof product.gstPercentage === 'number' && !isNaN(product.gstPercentage) ? product.gstPercentage : 0,
      } : defaultFormData;

      setFormData(safeProduct);
      setError('');
      setSaveError('');
    }
  }, [isOpen, product]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    try {
      const imageUrls = await uploadImages(files, formData.images || []);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls]
      }));
    } catch (err: any) {
      setError(err.message || t('products.uploadError'));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !storeId) return;

    try {
      setSaveError('');

      // Convert empty strings to 0 for numeric fields before saving
      const productData = {
        ...formData,
        price: formData.price === '' ? 0 : Number(formData.price),
        stock: formData.stock === '' ? 0 : Number(formData.stock),
        pstPercentage: formData.pstPercentage === '' ? 0 : Number(formData.pstPercentage),
        gstPercentage: formData.gstPercentage === '' ? 0 : Number(formData.gstPercentage),
        ownerId: currentUser.uid,
        storeId: storeId
      };

      await onSave(productData, product?.id); // Pass the product ID for updates
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product. Please try again.';
      setSaveError(errorMessage);
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async () => {
    if (!product?.id || !onDelete) return;

    try {
      setSaveError('');
      await onDelete(product.id);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product. Please try again.';
      setSaveError(errorMessage);
      console.error('Error deleting product:', err);
    }
  };

  if (!isOpen) return null;

  const imagesLimitReached = (formData.images?.length || 0) >= 5;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {product ? t('products.editModal') : t('products.addNew')}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        {(error || saveError) && (
          <div className={styles.errorBanner}>
            <AlertCircle className={styles.errorIcon} />
            {error || saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Image Upload */}
          <div>
            <label className={styles.label}>{t('products.imagesLabel')}</label>
            <div
              className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${imagesLimitReached ? styles.disabled : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className={styles.loadingState}>
                  <Loader2 className={styles.loadingSpinner} />
                  <p className={styles.loadingText}>{t('store.saveProgress.uploadingImages')}</p>
                </div>
              ) : imagesLimitReached ? (
                <div className={styles.maxImagesText}>
                  <p>{t('products.maxImages')}</p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleFileInput}
                    id="file-upload"
                    disabled={imagesLimitReached}
                  />
                  <label htmlFor="file-upload" className={`${styles.uploadLabel} ${imagesLimitReached ? styles.disabled : ''}`}>
                    <Upload className={styles.uploadIcon} />
                    <p className={styles.uploadText}>{t('products.dragDrop')}</p>
                    <p className={styles.uploadHint}>
                      {t('products.uploadHint')} ({5 - (formData.images?.length || 0)} remaining)
                    </p>
                  </label>
                </>
              )}
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className={styles.imageGrid}>
                {formData.images.map((image, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={image} alt={`Preview ${index + 1}`} className={styles.image} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeButton}
                    >
                      <X className={styles.removeIcon} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Name and Category */}
          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="name" className={styles.label}>{t('products.name')}</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className={styles.label}>{t('products.category')}</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={styles.select}
                required
              >
                <option value="">{t('products.selectCategory')}</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {t(category.translationKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={styles.label}>{t('products.descriptionLabel')}</label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.textarea}
            />
          </div>

          {/* Price and Stock */}
          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="price" className={styles.label}>{t('products.price')}</label>
              <div className={styles.inputWithIcon}>
                <DollarSign className={styles.inputIcon} />
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid number
                    setFormData({ ...formData, price: value === '' ? '' : parseFloat(value) });
                  }}
                  className={styles.inputWithPadding}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock" className={styles.label}>{t('products.stockLabel')}</label>
              <input
                type="number"
                id="stock"
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid number
                  setFormData({ ...formData, stock: value === '' ? '' : parseInt(value) });
                }}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Tax Percentages */}
          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="pstPercentage" className={styles.label}>{t('products.pstPercentage')}</label>
              <div className={styles.inputWithSuffix}>
                <input
                  type="number"
                  id="pstPercentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.pstPercentage}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, pstPercentage: isNaN(val) ? 0 : val });
                  }}
                  className={styles.input}
                  placeholder="0.00"
                />
                <span className={styles.suffix}>%</span>
              </div>
            </div>

            <div>
              <label htmlFor="gstPercentage" className={styles.label}>{t('products.gstPercentage')}</label>
              <div className={styles.inputWithSuffix}>
                <input
                  type="number"
                  id="gstPercentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.gstPercentage}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, gstPercentage: isNaN(val) ? 0 : val });
                  }}
                  className={styles.input}
                  placeholder="0.00"
                />
                <span className={styles.suffix}>%</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={styles.label}>{t('products.status')}</label>
            <div className={styles.radioGroup}>
              {['active', 'draft', 'outOfStock'].map((status) => (
                <label key={status} className={styles.radioLabel}>
                  <input
                    type="radio"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>
                    {status === 'outOfStock'
                      ? t('products.status.outOfStock')
                      : t(`products.status.${status}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <div className={styles.leftActions}>
              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className={styles.deleteButton}
                  disabled={isSaving}
                >
                  <Trash2 className={styles.deleteIcon} />
                  {t('products.delete')}
                </button>
              )}
            </div>
            <div className={styles.rightActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isSaving}
              >
                {t('dialog.cancel')}
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className={styles.buttonSpinner} />
                    {t('store.saving')}
                  </>
                ) : (
                  product ? t('products.update') : t('products.add')
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('products.deleteConfirmTitle')}
        message={t('products.deleteConfirmMessage')}
        confirmText={t('products.confirmDelete')}
        cancelText={t('dialog.cancel')}
        variant="danger"
      />
    </div>
  );
};
