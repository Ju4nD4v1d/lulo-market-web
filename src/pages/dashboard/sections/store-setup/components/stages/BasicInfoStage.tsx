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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary-400" />
            {t('store.name')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 group-hover:shadow-md"
              placeholder={t('store.namePlaceholder')}
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            {t('store.category')}
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 group-hover:border-gray-300 bg-white"
            >
              <option value="">{t('store.selectCategory')}</option>
              <option value="restaurant">{t('store.category.restaurant')}</option>
              <option value="grocery">{t('store.category.grocery')}</option>
              <option value="bakery">{t('store.category.bakery')}</option>
              <option value="other">{t('store.category.other')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary-400" />
            {t('store.cuisine')}
          </label>
          <div className="relative">
            <select
              value={cuisine}
              onChange={(e) => onCuisineChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 group-hover:border-gray-300 bg-white"
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
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary-400" />
          {t('store.description')}
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 resize-none"
            placeholder={t('store.descriptionPlaceholder')}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {description.length}/200
          </div>
        </div>
      </div>

      {/* Store Image Upload */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary-400" />
          {t('store.image')}
        </label>
        <div
          className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary-400 bg-gradient-to-br from-primary-400/10 to-primary-500/5 shadow-lg'
              : 'border-gray-300 hover:border-primary-400/50 hover:bg-gray-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {storeImage.preview || storeImage.url ? (
            <div className="relative inline-block">
              <div className="relative group cursor-pointer">
                <img
                  src={storeImage.preview || storeImage.url}
                  alt="Store"
                  className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Change Image</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Change store image"
                />
              </div>
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-2xl">
                <Upload className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">{t('store.uploadImage')}</p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileInput}
                className="hidden"
                id="store-image"
              />
              <label
                htmlFor="store-image"
                className="btn-primary inline-flex items-center gap-2 cursor-pointer font-medium"
              >
                <Camera className="w-4 h-4" />
                {t('store.selectImage')}
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
