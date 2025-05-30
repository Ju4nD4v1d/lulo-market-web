import React, { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { FormSection } from './FormSection';

export const StoreSetup = () => {
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    aboutSections: Array<{
      id: string;
      description: string;
      image?: File;
      imagePreview?: string;
    }>;
  }>({ aboutSections: [] });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageValidation(file, sectionId);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageValidation(file, sectionId);
    }
  };

  const handleImageValidation = (file: File, sectionId: string) => {
    if (file.size > 1024 * 1024) {
      setImageErrors(prev => ({
        ...prev,
        [sectionId]: 'File size must be less than 1MB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        aboutSections: prev.aboutSections.map(s =>
          s.id === sectionId ? { ...s, image: file, imagePreview: e.target?.result as string } : s
        )
      }));
    };
    reader.readAsDataURL(file);
    setImageErrors(prev => ({ ...prev, [sectionId]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <form onSubmit={(e) => {
        e.preventDefault();
        setSaving(true);
        // Handle form submission logic here
        setTimeout(() => {
          setSaving(false);
        }, 1500);
      }}>
        <FormSection title="About Sections">
          <div className="space-y-8">
            {formData.aboutSections.map((section) => (
              <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={section.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        aboutSections: prev.aboutSections.map(s =>
                          s.id === section.id ? { ...s, description: e.target.value } : s
                        )
                      }))}
                      rows={4}
                      className="w-full"
                      placeholder="Enter a description for this section"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-6
                        ${section.imagePreview ? 'border-primary-300' : imageErrors[section.id] ? 'border-red-300' : 'border-gray-300'}
                        hover:border-primary-400 transition-colors duration-200
                      `}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, section.id)}
                    >
                      {section.imagePreview ? (
                        <div className="relative">
                          <img
                            src={section.imagePreview}
                            alt="Section preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              aboutSections: prev.aboutSections.map(s =>
                                s.id === section.id ? { ...s, image: undefined, imagePreview: undefined } : s
                              )
                            }))}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label className="relative cursor-pointer">
                              <span className="rounded-md font-medium text-primary-600 hover:text-primary-500">
                                Upload a file
                              </span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, section.id)}
                              />
                            </label>
                            <p className="pl-1 inline-block">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF up to 1MB
                          </p>
                        </div>
                      )}
                      {imageErrors[section.id] && (
                        <p className="mt-2 text-sm text-red-600 text-center">
                          {imageErrors[section.id]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};