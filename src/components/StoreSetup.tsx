import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Upload,
  X,
  InfoIcon,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Clock,
  Building2
} from 'lucide-react';
import { FormSection } from './FormSection';
import { collection, addDoc, GeoPoint, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { SaveProgressModal } from './SaveProgressModal';

const defaultBusinessHours = {
  Sunday: { open: "09:00", close: "18:00", closed: true },
  Monday: { open: "09:00", close: "18:00", closed: true },
  Tuesday: { open: "09:00", close: "18:00", closed: true },
  Wednesday: { open: "09:00", close: "18:00", closed: true },
  Thursday: { open: "09:00", close: "18:00", closed: true },
  Friday: { open: "09:00", close: "18:00", closed: true },
  Saturday: { open: "09:00", close: "18:00", closed: true }
};

// Order of days starting with Sunday
const daysOrder = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete'>('saving');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [storeImage, setStoreImage] = useState<{
    file?: File;
    preview?: string;
    url?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    businessHours: defaultBusinessHours,
    aboutSections: [{ id: '1', title: '', description: '' }]
  });

  useEffect(() => {
    const loadStoreData = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const storeData = querySnapshot.docs[0].data();
          
          if (storeData.storeImage) {
            setStoreImage(prev => ({
              ...prev,
              preview: storeData.storeImage,
              url: storeData.storeImage
            }));
          }

          // Map About Us sections from Firestore fields
          const aboutSections = [
            {
              id: '1',
              title: storeData.titleTabAboutFirst || '',
              description: storeData.bodyTabAboutFirst || ''
            }
          ];

          if (storeData.titleTabAboutSecond || storeData.bodyTabAboutSecond) {
            aboutSections.push({
              id: '2',
              title: storeData.titleTabAboutSecond || '',
              description: storeData.bodyTabAboutSecond || ''
            });
          }

          if (storeData.titleTabAboutThird || storeData.bodyTabAboutThird) {
            aboutSections.push({
              id: '3',
              title: storeData.titleTabAboutThird || '',
              description: storeData.bodyTabAboutThird || ''
            });
          }

          // Map business hours from Firestore
          const businessHours = storeData.storeBusinessHours || defaultBusinessHours;

          setFormData(prev => ({
            ...prev,
            businessHours,
            name: storeData.name || '',
            description: storeData.description || '',
            address: storeData.address || '',
            phone: storeData.phone || '',
            website: storeData.website || '',
            aboutSections
          }));
        }
      } catch (err) {
        console.error('Error loading store data:', err);
      }
    };

    loadStoreData();
  }, [currentUser]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleStoreDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleStoreImageValidation(file);
  };

  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleStoreImageValidation(file);
    }
  };

  const handleStoreImageValidation = (file: File) => {
    if (file.size > 1024 * 1024) {
      setImageErrors(prev => ({
        ...prev,
        storeImage: 'File size must be less than 1MB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setStoreImage({
        file,
        preview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
    setImageErrors(prev => ({ ...prev, storeImage: '' }));
  };

  const simulateProgress = async () => {
    setSaving(true);
    setSaveStep('saving');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStep('uploading');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStep('finalizing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStep('complete');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      await simulateProgress();

      // Upload store image if exists
      let storeImageUrl = storeImage.url;
      if (storeImage.file) {
        storeImageUrl = await uploadStoreImage();
      }

      // Geocode the address
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await geocoder.geocode({ address: formData.address });
      
      if (!geocodeResult.results[0]) {
        throw new Error('Invalid address. Please enter a valid address.');
      }

      const location = geocodeResult.results[0].geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      const storeData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        location: new GeoPoint(coordinates.lat, coordinates.lng),
        phone: formData.phone,
        website: formData.website,
        storeBusinessHours: formData.businessHours,
        titleTabAboutFirst: formData.aboutSections[0]?.title || '',
        bodyTabAboutFirst: formData.aboutSections[0]?.description || '',
        titleTabAboutSecond: formData.aboutSections[1]?.title || '',
        bodyTabAboutSecond: formData.aboutSections[1]?.description || '',
        titleTabAboutThird: formData.aboutSections[2]?.title || '',
        bodyTabAboutThird: formData.aboutSections[2]?.description || '',
        ownerId: currentUser.uid,
        createdAt: new Date(),
        storeImage: storeImageUrl
      };

      // Check if store already exists
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'stores'), storeData);
      } else {
        // Update existing store
        const storeDoc = querySnapshot.docs[0].ref;
        await updateDoc(storeDoc, storeData);
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error saving store:', error);
      setError(error instanceof Error ? error.message : 'Failed to save store information');
      setSaving(false);
    }
  };

  const handleConfirmation = () => {
    window.location.hash = '#dashboard/products';
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
    <div className="max-w-4xl mx-auto">
      <SaveProgressModal
        isOpen={saving}
        currentStep={saveStep}
        onComplete={handleConfirmation}
      />

      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-50 p-3 rounded-lg">
            <Store className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Setup</h1>
            <p className="text-gray-600 mt-1">Configure your store information and settings</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Basic Information" icon={Store}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Image
              </label>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8
                  ${storeImage.preview ? 'border-primary-300' : imageErrors.storeImage ? 'border-red-300' : 'border-gray-300'}
                  hover:border-primary-400 transition-colors duration-200
                  flex flex-col items-center justify-center
                  cursor-pointer
                `}
                onDragOver={handleDragOver}
                onDrop={handleStoreDrop}
              >
                {storeImage.preview ? (
                  <div className="relative w-full">
                    <img
                      src={storeImage.preview}
                      alt="Store preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setStoreImage({})}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleStoreImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 1MB
                      </p>
                    </div>
                  </div>
                )}
                {imageErrors.storeImage && (
                  <p className="mt-2 text-sm text-red-600">
                    {imageErrors.storeImage}
                  </p>
                )}
              </div>
            </div>

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
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contact Information" icon={Phone}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-10"
                  placeholder="Enter your store address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full pl-10"
                  placeholder="Enter your website URL"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Business Hours" icon={Clock}>
          <div className="space-y-4">
            {daysOrder.map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-28">
                  <span className="text-sm font-medium text-gray-700">
                    {day}
                  </span>
                </div>
                <div className="flex-1 flex items-center space-x-4">
                  <input
                    type="time"
                    value={formData.businessHours[day].open}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: { ...formData.businessHours[day], open: e.target.value }
                      }
                    })}
                    className="w-40"
                    disabled={formData.businessHours[day].closed}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.businessHours[day].close}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: { ...formData.businessHours[day], close: e.target.value }
                      }
                    })}
                    className="w-40"
                    disabled={formData.businessHours[day].closed}
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day].closed}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessHours: {
                          ...formData.businessHours,
                          [day]: {
                            open: e.target.checked ? "09:00" : "09:00",
                            close: e.target.checked ? "18:00" : "18:00",
                            closed: e.target.checked
                          }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection title="About Us" icon={Store}>
          <div className="space-y-8">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6">
              <p className="text-sm text-primary-800">
                <InfoIcon className="w-5 h-5 inline-block mr-2" />
                These sections will be prominently featured in your store profile. 
                A compelling story helps attract customers and builds trust.
              </p>
            </div>

            {formData.aboutSections.map((section) => (
              <div key={section.id} className="relative bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
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
                      placeholder="Tell your story..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-8
                        ${section.imagePreview ? 'border-primary-300' : imageErrors[section.id] ? 'border-red-300' : 'border-gray-300'}
                        hover:border-primary-400 transition-colors duration-200
                        flex flex-col items-center justify-center
                        cursor-pointer
                      `}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, section.id)}
                    >
                      {section.imagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={section.imagePreview}
                            alt="Preview"
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
                            className="absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                            <div className="flex items-center">
                              <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e, section.id)}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG, GIF up to 1MB
                            </p>
                          </div>
                        </div>
                      )}
                      {imageErrors[section.id] && (
                        <p className="mt-2 text-sm text-red-600">
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
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Another Section
              </button>
            )}
          </div>
        </FormSection>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`
              inline-flex items-center px-6 py-3 rounded-lg text-white
              ${saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 transform transition-all duration-200 hover:scale-105'}
              shadow-lg hover:shadow-xl
            `}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Store className="w-5 h-5 mr-2" />
                Save Store
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};