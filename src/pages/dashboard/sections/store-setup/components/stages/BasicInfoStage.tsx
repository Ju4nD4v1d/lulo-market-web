/**
 * BasicInfoStage Component
 *
 * Stage 1: Basic Information
 * Collects store name, category, cuisine, description and image
 */

import type * as React from 'react';
import { useState } from 'react';
import { Star, Zap, Heart, Camera, Upload, X } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import styles from './BasicInfoStage.module.css';

interface BasicInfoStageProps {
  name: string;
  category: string;
  cuisine: string;
  description: string;
  storeImage: {
    file?: File;
    preview?: string;
    url?: string;
  };
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCuisineChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export const BasicInfoStage: React.FC<BasicInfoStageProps> = ({
  name,
  category,
  cuisine,
  description,
  storeImage,
  onNameChange,
  onCategoryChange,
  onCuisineChange,
  onDescriptionChange,
  onImageUpload,
  onImageRemove,
}) => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PNG and JPG files are allowed';
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 2MB';
    }

    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);

      if (error) {
        alert(error);
        return;
      }

      onImageUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);

      if (error) {
        alert(error);
        return;
      }

      onImageUpload(file);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <Star className={styles.labelIcon} />
            {t('store.name')}
          </label>
          <input
            type="text"
            data-auth-input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={styles.input}
            placeholder={t('store.namePlaceholder')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <Zap className={styles.labelIcon} />
            {t('store.category')}
          </label>
          <select
            data-auth-input
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={styles.select}
          >
            <option value="">{t('store.selectCategory')}</option>
            <option value="restaurant">{t('store.category.restaurant')}</option>
            <option value="grocery">{t('store.category.grocery')}</option>
            <option value="bakery">{t('store.category.bakery')}</option>
            <option value="other">{t('store.category.other')}</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <Heart className={styles.labelIcon} />
            {t('store.cuisine')}
          </label>
          <select
            data-auth-input
            value={cuisine}
            onChange={(e) => onCuisineChange(e.target.value)}
            className={styles.select}
          >
            <option value="">{t('store.cuisinePlaceholder')}</option>
            <option value="mexican">{t('store.cuisine.mexican')}</option>
            <option value="colombian">{t('store.cuisine.colombian')}</option>
            <option value="venezuelan">{t('store.cuisine.venezuelan')}</option>
            <option value="peruvian">{t('store.cuisine.peruvian')}</option>
            <option value="ecuadorian">{t('store.cuisine.ecuadorian')}</option>
            <option value="argentinian">{t('store.cuisine.argentinian')}</option>
            <option value="chilean">{t('store.cuisine.chilean')}</option>
            <option value="brazilian">{t('store.cuisine.brazilian')}</option>
            <option value="dominican">{t('store.cuisine.dominican')}</option>
            <option value="guatemalan">{t('store.cuisine.guatemalan')}</option>
            <option value="honduran">{t('store.cuisine.honduran')}</option>
            <option value="salvadoran">{t('store.cuisine.salvadoran')}</option>
            <option value="nicaraguan">{t('store.cuisine.nicaraguan')}</option>
            <option value="costarican">{t('store.cuisine.costarican')}</option>
            <option value="panamanian">{t('store.cuisine.panamanian')}</option>
            <option value="cuban">{t('store.cuisine.cuban')}</option>
            <option value="puerto_rican">{t('store.cuisine.puerto_rican')}</option>
            <option value="fusion">{t('store.cuisine.fusion')}</option>
            <option value="other">{t('store.cuisine.other')}</option>
          </select>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <Heart className={styles.labelIcon} />
          {t('store.description')}
        </label>
        <div className={styles.textareaWrapper}>
          <textarea
            data-auth-input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            className={styles.textarea}
            placeholder={t('store.descriptionPlaceholder')}
          />
          <div className={styles.charCount}>
            {description.length}/200
          </div>
        </div>
      </div>

      {/* Store Image Upload */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <Camera className={styles.labelIcon} />
          {t('store.image')}
        </label>
        <div
          className={`${styles.uploadArea} ${dragActive ? styles.uploadAreaActive : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {storeImage.preview || storeImage.url ? (
            <div className={styles.imagePreviewWrapper}>
              <div className={styles.imagePreviewContainer}>
                <img
                  src={storeImage.preview || storeImage.url}
                  alt="Store"
                  className={styles.imagePreview}
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.overlayContent}>
                    <Camera className={styles.overlayIcon} />
                    <p className={styles.overlayText}>Change Image</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileInput}
                  className={styles.hiddenInput}
                  title="Change store image"
                />
              </div>
              <button
                type="button"
                onClick={onImageRemove}
                className={styles.removeButton}
                title="Remove image"
              >
                <X className={styles.removeIcon} />
              </button>
            </div>
          ) : (
            <div className={styles.uploadContent}>
              <div className={styles.uploadIconWrapper}>
                <Upload className={styles.uploadIcon} />
              </div>
              <div>
                <p className={styles.uploadTitle}>{t('store.uploadImage')}</p>
                <p className={styles.uploadHint}>PNG, JPG up to 2MB</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileInput}
                className={styles.hiddenInput}
                id="store-image"
              />
              <label
                htmlFor="store-image"
                className={styles.selectButton}
              >
                <Camera className={styles.selectButtonIcon} />
                {t('store.selectImage')}
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
