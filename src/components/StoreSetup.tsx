import React, { useState, useEffect, useRef } from 'react';
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
  Building2,
  AlertCircle
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

const daysOrder = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

interface ValidationErrors {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  storeImage?: string;
  businessHours?: string;
  aboutSections?: {
    [key: string]: {
      title?: string;
      description?: string;
      image?: string;
    };
  };
}

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete'>('saving');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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

  // Add refs for form fields
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const businessHoursRef = useRef<HTMLDivElement>(null);
  const aboutSectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

          const aboutSections = [
            {
              id: '1',
              title: storeData.titleTabAboutFirst || '',
              description: storeData.bodyTabAboutFirst || '',
              imagePreview: storeData.imageTabAboutFirst || undefined
            }
          ];

          if (storeData.titleTabAboutSecond || storeData.bodyTabAboutSecond) {
            aboutSections.push({
              id: '2',
              title: storeData.titleTabAboutSecond || '',
              description: storeData.bodyTabAboutSecond || '',
              imagePreview: storeData.imageTabAboutSecond || undefined
            });
          }

          if (storeData.titleTabAboutThird || storeData.bodyTabAboutThird) {
            aboutSections.push({
              id: '3',
              title: storeData.titleTabAboutThird || '',
              description: storeData.bodyTabAboutThird || '',
              imagePreview: storeData.imageTabAboutThird || undefined
            });
          }

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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let firstErrorElement: HTMLElement | null = null;

    // Validate basic information
    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
      firstErrorElement = firstErrorElement || nameRef.current;
    }

    if (!formData.description.trim()) {
      errors.description = 'Store description is required';
      firstErrorElement = firstErrorElement || descriptionRef.current;
    }

    if (!formData.address.trim()) {
      errors.address = 'Store address is required';
      firstErrorElement = firstErrorElement || addressRef.current;
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
      firstErrorElement = firstErrorElement || phoneRef.current;
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      errors.website = 'Invalid website URL format';
      firstErrorElement = firstErrorElement || websiteRef.current;
    }

    // Validate business hours
    const hasOpenDay = Object.values(formData.businessHours).some(day => !day.closed);
    if (!hasOpenDay) {
      errors.businessHours = 'At least one day must be open for business';
      firstErrorElement = firstErrorElement || businessHoursRef.current;
    }

    // Validate about sections
    errors.aboutSections = {};
    formData.aboutSections.forEach((section, index) => {
      const sectionErrors: { title?: string; description?: string } = {};
      
      if (!section.title.trim()) {
        sectionErrors.title = 'Section title is required';
        firstErrorElement = firstErrorElement || aboutSectionRefs.current[index];
      }
      if (!section.description.trim()) {
        sectionErrors.description = 'Section description is required';
        firstErrorElement = firstErrorElement || aboutSectionRefs.current[index];
      }

      if (Object.keys(sectionErrors).length > 0) {
        errors.aboutSections[section.id] = sectionErrors;
      }
    });

    setValidationErrors(errors);

    // Focus and scroll to first error
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorElement.focus();
      return false;
    }

    return true;
  };

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

  const uploadStoreImage = async (storeId: string): Promise<string | null> => {
    if (!storeImage.file || !currentUser) return null;

    const storageRef = ref(storage, `stores/${storeId}/storeImage.png`);
    await uploadBytes(storageRef, storeImage.file);
    return getDownloadURL(storageRef);
  };

  const uploadSectionImage = async (storeId: string, section: any, index: number): Promise<string | null> => {
    if (!section.image) return null;

    const storageRef = ref(storage, `stores/${storeId}/about_section_${index + 1}.png`);
    await uploadBytes(storageRef, section.image);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);

    try {
      setSaveStep('saving');

      // Geocode the address
      const geocoder = new google.maps.Geocoder();
      let geocodeResult;
      
      try {
        geocodeResult = await geocoder.geocode({ address: formData.address });
        
        if (!geocodeResult.results[0]) {
          throw new Error('Invalid address');
        }
      } catch (error) {
        setError('Failed to validate address. Please enter a valid address.');
        setSaving(false);
        return;
      }

      const location = geocodeResult.results[0].geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      // Check if store already exists
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      let storeId: string;
      let storeDoc;

      if (querySnapshot.empty) {
        // Create new store
        const docRef = await addDoc(collection(db, 'stores'), {
          ownerId: currentUser.uid,
          createdAt: new Date()
        });
        storeId = docRef.id;
        storeDoc = docRef;
      } else {
        storeDoc = querySnapshot.docs[0].ref;
        storeId = querySnapshot.docs[0].id;
      }

      setSaveStep('uploading');

      // Upload store image
      let storeImageUrl = storeImage.url;
      if (storeImage.file) {
        try {
          storeImageUrl = await uploadStoreImage(storeId);
        } catch (error) {
          setError('Failed to upload store image. Please try again.');
          setSaving(false);
          return;
        }
      }

      // Upload section images
      let sectionImageUrls;
      try {
        const sectionImagePromises = formData.aboutSections.map((section, index) => 
          uploadSectionImage(storeId, section, index)
        );
        sectionImageUrls = await Promise.all(sectionImagePromises);
      } catch (error) {
        setError('Failed to upload section images. Please try again.');
        setSaving(false);
        return;
      }

      setSaveStep('finalizing');

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
        imageTabAboutFirst: sectionImageUrls[0] || formData.aboutSections[0]?.imagePreview || '',
        titleTabAboutSecond: formData.aboutSections[1]?.title || '',
        bodyTabAboutSecond: formData.aboutSections[1]?.description || '',
        imageTabAboutSecond: sectionImageUrls[1] || formData.aboutSections[1]?.imagePreview || '',
        titleTabAboutThird: formData.aboutSections[2]?.title || '',
        bodyTabAboutThird: formData.aboutSections[2]?.description || '',
        imageTabAboutThird: sectionImageUrls[2] || formData.aboutSections[2]?.imagePreview || '',
        storeImage: storeImageUrl,
        updatedAt: new Date()
      };

      await updateDoc(storeDoc, storeData);

      setSaveStep('complete');
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
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
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
              {validationErrors.storeImage && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.storeImage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full ${validationErrors.name ? 'border-red-300' : ''}`}
                placeholder="Enter your store name"
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Description
              </label>
              <textarea
                ref={descriptionRef}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full ${validationErrors.description ? 'border-red-300' : ''}`}
                placeholder="Describe your store"
              />
              {validationErrors.description && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.description}
                </p>
              )}
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
                  ref={addressRef}
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full pl-10 ${validationErrors.address ? 'border-red-300' : ''}`}
                  placeholder="Enter your store address"
                />
              </div>
              {validationErrors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={phoneRef}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full pl-10 ${validationErrors.phone ? 'border-red-300' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={websiteRef}
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className={`w-full pl-10 ${validationErrors.website ? 'border-red-300' : ''}`}
                  placeholder="Enter your website URL"
                />
              </div>
              {validationErrors.website && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.website}
                </p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Business Hours" icon={Clock}>
          <div ref={businessHoursRef} className="space-y-4">
            {validationErrors.businessHours && (
              <div className="p-4 bg-red-50 rounded-lg text-red-700 mb-4">
                {validationErrors.businessHours}
              </div>
            )}
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

            {formData.aboutSections.map((section, index) => (
              <div
                key={section.id}
                ref={el => aboutSectionRefs.current[index] = el}
                className="relative bg-gray-50 rounded-lg p-6"
              >
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
                      className={`w-full ${validationErrors.aboutSections?.[section.id]?.title ? 'border-red-300' : ''}`}
                      placeholder="Enter a title for this section"
                    />
                    {validationErrors.aboutSections?.[section.id]?.title && (
                      <p className="mt-2 text-sm text-red-600">
                        {validationErrors.aboutSections[section.id].title}
                      </p>
                    )}
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
                      className={`w-full ${validationErrors.aboutSections?.[section.id]?.description ? 'border-red-300' : ''}`}
                      placeholder="Tell your story..."
                    />
                    {validationErrors.aboutSections?.[section.id]?.description && (
                      <p className="mt-2 text-sm text-red-600">
                        {validationErrors.aboutSections[section.id].description}
                      </p>
                    )}
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