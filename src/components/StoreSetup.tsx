import React, { useState } from 'react';
import { Loader2, Upload, X, Store } from 'lucide-react';
import { FormSection } from './FormSection';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    aboutSections: Array<{
      id: string;
      title: string;
      description: string;
      image?: File;
      imagePreview?: string;
    }>;
  }>({
    name: '',
    description: '',
    aboutSections: [{ id: '1', title: '', description: '' }]
  });

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

  const uploadImage = async (file: File, path: string) => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      // Upload images and get URLs
      const sectionPromises = formData.aboutSections.map(async (section) => {
        if (section.image) {
          const imagePath = `stores/${currentUser.uid}/sections/${section.id}/${section.image.name}`;
          const imageUrl = await uploadImage(section.image, imagePath);
          return {
            ...section,
            imageUrl,
            image: undefined,
            imagePreview: undefined
          };
        }
        return section;
      });

      const sectionsWithUrls = await Promise.all(sectionPromises);

      // Save store data to Firestore
      const storeData = {
        name: formData.name,
        description: formData.description,
        aboutSections: sectionsWithUrls,
        ownerId: currentUser.uid,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'stores'), storeData);
      setSuccess(true);
    } catch (error) {
      console.error('Error saving store:', error);
      setImageErrors({ general: 'Failed to save store information' });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (formData.aboutSections.length < 3) {
      setFormData(prev => ({
        ...prev,
        aboutSections: [
          ...prev.aboutSections,
          { id: String(prev.aboutSections.length + 1), title: '', description: '' }
        ]
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit}>
        <FormSection title="Store Information" icon={Store}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
                placeholder="Enter your store name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full"
                placeholder="Describe your store"
                required
              />
            </div>
          </div>
        </FormSection>

        <div className="mt-8">
          <FormSection title="About Sections" icon={Store}>
            <div className="space-y-8">
              {formData.aboutSections.map((section) => (
                <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          aboutSections: prev.aboutSections.map(s =>
                            s.id === section.id ? { ...s, title: e.target.value } : s
                          )
                        }))}
                        className="w-full"
                        placeholder="Enter a title for this section"
                        required
                      />
                    </div>

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
                        required
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

              {formData.aboutSections.length < 3 && (
                <button
                  type="button"
                  onClick={addSection}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add Another Section
                </button>
              )}
            </div>
          </FormSection>
        </div>

        {imageErrors.general && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
            {imageErrors.general}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg text-green-700">
            Store information saved successfully!
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
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