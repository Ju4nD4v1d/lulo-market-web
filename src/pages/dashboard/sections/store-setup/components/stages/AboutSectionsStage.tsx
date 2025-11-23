/**
 * AboutSectionsStage Component
 *
 * Stage 4: About Sections
 * Manages multiple about sections with images
 */

import type * as React from 'react';
import { useState } from 'react';
import { Star, Heart, Camera, Upload, X, Plus } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';

interface AboutSection {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imagePreview?: string;
  image?: File;
}

interface AboutSectionsStageProps {
  sections: AboutSection[];
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, field: string, value: string) => void;
  onSectionImageUpload: (index: number, file: File) => void;
  onRemoveSectionImage: (index: number) => void;
}

export const AboutSectionsStage: React.FC<AboutSectionsStageProps> = ({
  sections,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onSectionImageUpload,
  onRemoveSectionImage,
}) => {
  const { t } = useLanguage();

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

  const handleSectionImageUpload = (index: number, file: File) => {
    const error = validateFile(file);

    if (error) {
      alert(error);
      return;
    }

    onSectionImageUpload(index, file);
  };

  return (
    <div className="space-y-6">
      {/* Add Section Button (top) */}
      {sections.length < 3 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddSection}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('store.addSection')}
          </button>
        </div>
      )}

      {/* Sections */}
      {sections.map((section, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 relative border border-gray-200/50 shadow-sm"
        >
          <button
            type="button"
            onClick={() => onRemoveSection(index)}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4 pr-12">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500" />
                {t('store.sectionTitle')}
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdateSection(index, 'title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 bg-white"
                placeholder={t('store.sectionTitlePlaceholder')}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-500" />
                {t('store.sectionDescription')}
              </label>
              <textarea
                value={section.description}
                onChange={(e) => onUpdateSection(index, 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 bg-white resize-none"
                placeholder={t('store.sectionDescriptionPlaceholder')}
              />
            </div>

            {/* Section Image Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-500" />
                {t('store.sectionImage')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
                {section.imagePreview || section.imageUrl ? (
                  <div className="relative inline-block">
                    <div className="relative group cursor-pointer">
                      <img
                        src={section.imagePreview || section.imageUrl}
                        alt="Section"
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-6 h-6 mx-auto mb-1" />
                          <p className="text-xs font-medium">Change</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSectionImageUpload(index, e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Change section image"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSectionImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">{t('store.uploadSectionImage')}</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSectionImageUpload(index, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id={`section-image-${index}`}
                    />
                    <label
                      htmlFor={`section-image-${index}`}
                      className="inline-flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Select Image
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No sections added yet</p>
          <button
            type="button"
            onClick={onAddSection}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('store.addSection')}
          </button>
        </div>
      )}
    </div>
  );
};
