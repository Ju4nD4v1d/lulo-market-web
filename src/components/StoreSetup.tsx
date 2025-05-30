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
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { FormSection } from './FormSection';
import { collection, addDoc, GeoPoint, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { SaveProgressModal } from './SaveProgressModal';
import { ConfirmDialog } from './ConfirmDialog';

const defaultBusinessHours = {
  Sunday: { open: "09:00", close: "18:00", closed: true },
  Monday: { open: "09:00", close: "18:00", closed: false },
  Tuesday: { open: "09:00", close: "18:00", closed: false },
  Wednesday: { open: "09:00", close: "18:00", closed: false },
  Thursday: { open: "09:00", close: "18:00", closed: false },
  Friday: { open: "09:00", close: "18:00", closed: false },
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

interface ValidationStatus {
  passed: boolean;
  message: string;
  details: string[];
}

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete'>('saving');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
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
    aboutSections: [
      { id: '1', title: '', description: '', imageUrl: '', imageFile: null, imagePreview: '' },
      { id: '2', title: '', description: '', imageUrl: '', imageFile: null, imagePreview: '' },
      { id: '3', title: '', description: '', imageUrl: '', imageFile: null, imagePreview: '' }
    ]
  });

  // Add refs for form fields
  const storeImageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const businessHoursRef = useRef<HTMLDivElement>(null);
  const aboutSectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load existing store data
  useEffect(() => {
    const loadStoreData = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const storeData = querySnapshot.docs[0].data();
          
          // Set store image if exists
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
              description: storeData.bodyTabAboutFirst || '',
              imageUrl: storeData.imageTabAboutFirst || '',
              imageFile: null,
              imagePreview: storeData.imageTabAboutFirst || ''
            },
            {
              id: '2',
              title: storeData.titleTabAboutSecond || '',
              description: storeData.bodyTabAboutSecond || '',
              imageUrl: storeData.imageTabAboutSecond || '',
              imageFile: null,
              imagePreview: storeData.imageTabAboutSecond || ''
            },
            {
              id: '3',
              title: storeData.titleTabAboutThird || '',
              description: storeData.bodyTabAboutThird || '',
              imageUrl: storeData.imageTabAboutThird || '',
              imageFile: null,
              imagePreview: storeData.imageTabAboutThird || ''
            }
          ];

          // Set form data with all fields
          setFormData(prev => ({
            ...prev,
            businessHours: storeData.storeBusinessHours || prev.businessHours,
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
        setError('Failed to load store data');
      }
    };

    loadStoreData();
  }, [currentUser]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const validationDetails: string[] = [];
    let firstErrorElement: HTMLElement | null = null;

    // Store image validation
    if (!storeImage.file && !storeImage.url) {
      errors.storeImage = 'Store image is required';
      validationDetails.push('Store image is missing');
      firstErrorElement = firstErrorElement || storeImageRef.current;
    }

    // Basic information validation
    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
      validationDetails.push('Store name is required');
      firstErrorElement = firstErrorElement || nameRef.current;
    }

    if (!formData.description.trim()) {
      errors.description = 'Store description is required';
      validationDetails.push('Store description is required');
      firstErrorElement = firstErrorElement || descriptionRef.current;
    }

    if (!formData.address.trim()) {
      errors.address = 'Store address is required';
      validationDetails.push('Store address is required');
      firstErrorElement = firstErrorElement || addressRef.current;
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
      validationDetails.push('Phone number format is invalid');
      firstErrorElement = firstErrorElement || phoneRef.current;
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      errors.website = 'Invalid website URL format';
      validationDetails.push('Website URL format is invalid');
      firstErrorElement = firstErrorElement || websiteRef.current;
    }

    // Business hours validation
    const hasOpenDay = Object.values(formData.businessHours).some(day => !day.closed);
    if (!hasOpenDay) {
      errors.businessHours = 'At least one day must be open for business';
      validationDetails.push('No business hours set (at least one day must be open)');
      firstErrorElement = firstErrorElement || businessHoursRef.current;
    }

    // About sections validation
    errors.aboutSections = {};
    formData.aboutSections.forEach((section, index) => {
      if (section.title || section.description) {
        const sectionErrors: { title?: string; description?: string; image?: string } = {};
        
        if (!section.title.trim()) {
          sectionErrors.title = 'Section title is required';
          validationDetails.push(`About section ${index + 1}: Title is required`);
          firstErrorElement = firstErrorElement || aboutSectionRefs.current[index];
        }
        if (!section.description.trim()) {
          sectionErrors.description = 'Section description is required';
          validationDetails.push(`About section ${index + 1}: Description is required`);
          firstErrorElement = firstErrorElement || aboutSectionRefs.current[index];
        }
        if (!section.imageFile && !section.imageUrl && !section.imagePreview) {
          sectionErrors.image = 'Section image is required';
          validationDetails.push(`About section ${index + 1}: Image is required`);
          firstErrorElement = firstErrorElement || aboutSectionRefs.current[index];
        }

        if (Object.keys(sectionErrors).length > 0) {
          errors.aboutSections[section.id] = sectionErrors;
        }
      }
    });

    setValidationErrors(errors);
    
    const passed = Object.keys(errors).length === 0;
    setValidationStatus({
      passed,
      message: passed 
        ? 'All fields are valid! You can save your changes.'
        : 'Please fix the following validation errors:',
      details: validationDetails
    });

    // Focus and scroll to first error
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorElement.focus();
      return false;
    }

    return passed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!currentUser) return;
    
    setShowConfirmDialog(false);
    setSaving(true);
    setSaveStep('saving');
    setError(null);

    try {
      // Geocode the address
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await geocoder.geocode({ address: formData.address });
      
      if (!geocodeResult.results[0]) {
        throw new Error('Invalid address. Please enter a valid address.');
      }

      const location = geocodeResult.results[0].geometry.location;
      const coordinates = new GeoPoint(location.lat(), location.lng());

      // Upload store image
      setSaveStep('uploading');
      let storeImageUrl = storeImage.url;
      if (storeImage.file) {
        const storageRef = ref(storage, `stores/${currentUser.uid}/storeImage.png`);
        await uploadBytes(storageRef, storeImage.file);
        storeImageUrl = await getDownloadURL(storageRef);
      }

      // Upload about section images
      const aboutSectionImages = await Promise.all(
        formData.aboutSections.map(async (section, index) => {
          if (section.imageFile) {
            const storageRef = ref(storage, `stores/${currentUser.uid}/about${index + 1}.png`);
            await uploadBytes(storageRef, section.imageFile);
            return getDownloadURL(storageRef);
          }
          return section.imageUrl || '';
        })
      );

      setSaveStep('finalizing');

      const storeData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        location: coordinates,
        phone: formData.phone,
        website: formData.website,
        storeBusinessHours: formData.businessHours,
        titleTabAboutFirst: formData.aboutSections[0]?.title || '',
        bodyTabAboutFirst: formData.aboutSections[0]?.description || '',
        imageTabAboutFirst: aboutSectionImages[0] || '',
        titleTabAboutSecond: formData.aboutSections[1]?.title || '',
        bodyTabAboutSecond: formData.aboutSections[1]?.description || '',
        imageTabAboutSecond: aboutSectionImages[1] || '',
        titleTabAboutThird: formData.aboutSections[2]?.title || '',
        bodyTabAboutThird: formData.aboutSections[2]?.description || '',
        imageTabAboutThird: aboutSectionImages[2] || '',
        ownerId: currentUser.uid,
        updatedAt: new Date(),
        storeImage: storeImageUrl
      };

      // Check if store already exists
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'stores'), {
          ...storeData,
          createdAt: new Date()
        });
      } else {
        // Update existing store
        const storeDoc = querySnapshot.docs[0].ref;
        await updateDoc(storeDoc, storeData);
      }

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

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSectionImageValidation(file, sectionId);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleSectionImageValidation(file, sectionId);
  };

  const handleSectionImageValidation = (file: File, sectionId: string) => {
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
        aboutSections: prev.aboutSections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                imageFile: file,
                imagePreview: e.target?.result as string
              }
            : section
        )
      }));
    };
    reader.readAsDataURL(file);
    setImageErrors(prev => ({ ...prev, [sectionId]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SaveProgressModal
        isOpen={saving}
        currentStep={saveStep}
        onComplete={handleConfirmation}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmDialog(false)}
        title="Save Store Changes"
        message="Are you sure you want to save these changes to your store? This will update your store profile immediately."
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
            <div ref={storeImageRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Image
              </label>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8
                  ${storeImage.preview ? 'border-primary-300' : validationErrors.storeImage ? 'border-red-300' : 'border-gray-300'}
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
                {validationErrors.storeImage && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.storeImage}
                  </p>
                )}
              </div>
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
                className={`w-full ${validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your store name"
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
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
                className={`w-full ${validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Describe your store"
              />
              {validationErrors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
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
                  className={`w-full pl-10 ${validationErrors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your store address"
                />
              </div>
              {validationErrors.address && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
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
                  className={`w-full pl-10 ${validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
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
                  className={`w-full pl-10 ${validationErrors.website ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your website URL"
                />
              </div>
              {validationErrors.website && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.website}
                </p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Business Hours" icon={Clock}>
          <div ref={businessHoursRef} className="space-y-4">
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
                          [day]: { ...formData.businessHours[day], closed: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
            {validationErrors.businessHours && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors.businessHours}
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title="About Us" icon={Building2}>
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
                      className={`w-full ${validationErrors.aboutSections?.[section.id]?.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter a title for this section"
                    />
                    {validationErrors.aboutSections?.[section.id]?.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
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
                      className={`w-full ${validationErrors.aboutSections?.[section.id]?.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Tell your story..."
                    />
                    {validationErrors.aboutSections?.[section.id]?.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
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
                        ${section.imagePreview ? 'border-primary-300' : validationErrors.aboutSections?.[section.id]?.image ? 'border-red-300' : 'border-gray-300'}
                        hover:border-primary-400 transition-colors duration-200
                        flex flex-col items-center justify-center
                        cursor-pointer
                      `}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleSectionDrop(e, section.id)}
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
                                s.id === section.id ? { ...s, imageFile: null, imagePreview: '', imageUrl: '' } : s
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
                                  onChange={(e) => handleSectionImageChange(e, section.id)}
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
                      {validationErrors.aboutSections?.[section.id]?.image && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.aboutSections[section.id].image}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <div className="flex flex-col items-end space-y-4">
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

          {validationStatus && (
            <div className={`
              w-full max-w-md bg-white rounded-lg shadow-sm border
              ${validationStatus.passed ? 'border-green-200' : 'border-red-200'}
              p-4 mt-4
            `}>
              <div className={`
                flex items-center mb-2
                ${validationStatus.passed ? 'text-green-600' : 'text-red-600'}
              `}>
                {validationStatus.passed ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">{validationStatus.message}</span>
              </div>
              
              {!validationStatus.passed && validationStatus.details.length > 0 && (
                <ul className="ml-7 list-disc text-sm text-red-600 space-y-1">
                  {validationStatus.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};