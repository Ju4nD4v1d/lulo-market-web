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
  Building2,
  Plus
} from 'lucide-react';
import { FormSection } from './FormSection';
import { collection, addDoc, GeoPoint, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SaveProgressModal } from './SaveProgressModal';

interface BusinessHours {
  [day: string]: { open: string; close: string; closed: boolean };
}

interface AboutSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  imagePreview: string;
}

export interface StoreData {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  businessHours: BusinessHours;
  aboutSections: AboutSection[];
  storeImage?: string;
}

const defaultBusinessHours = {
  Sunday: { open: "09:00", close: "18:00", closed: true },
  Monday: { open: "09:00", close: "18:00", closed: false },
  Tuesday: { open: "09:00", close: "18:00", closed: false },
  Wednesday: { open: "09:00", close: "18:00", closed: false },
  Thursday: { open: "09:00", close: "18:00", closed: false },
  Friday: { open: "09:00", close: "18:00", closed: false },
  Saturday: { open: "09:00", close: "18:00", closed: true }
};

const initialStoreData: StoreData = {
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
  ],
  storeImage: ''
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

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<'saving' | 'uploading' | 'finalizing' | 'complete'>('saving');
  const [error, setError] = useState<string | null>(null);
  const [storeImage, setStoreImage] = useState<{
    file?: File;
    preview?: string;
    url?: string;
  }>({});
  const [storeData, setStoreData] = useState<StoreData>(initialStoreData);
  const [isEditing, setIsEditing] = useState(false);
  const [draftValues, setDraftValues] = useState<StoreData>(initialStoreData);
  const hasStore = storeData.name.trim() !== '';

  const validateFields = (values: StoreData) => {
    if (
      !values.name.trim() ||
      !values.description.trim() ||
      !values.address.trim() ||
      !values.phone.trim() ||
      !values.website.trim()
    ) {
      return false;
    }

    if (values.aboutSections.some(section => !section.title.trim() || !section.description.trim())) {
      return false;
    }

    return true;
  };

  // Load existing store data
  useEffect(() => {
    const loadStoreData = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();

          if (data.storeImage) {
            setStoreImage(prev => ({
              ...prev,
              preview: data.storeImage,
              url: data.storeImage
            }));
          }

          const aboutSections = [
            {
              id: '1',
              title: data.titleTabAboutFirst || '',
              description: data.bodyTabAboutFirst || '',
              imageUrl: data.imageTabAboutFirst || '',
              imageFile: null,
              imagePreview: data.imageTabAboutFirst || ''
            },
            {
              id: '2',
              title: data.titleTabAboutSecond || '',
              description: data.bodyTabAboutSecond || '',
              imageUrl: data.imageTabAboutSecond || '',
              imageFile: null,
              imagePreview: data.imageTabAboutSecond || ''
            },
            {
              id: '3',
              title: data.titleTabAboutThird || '',
              description: data.bodyTabAboutThird || '',
              imageUrl: data.imageTabAboutThird || '',
              imageFile: null,
              imagePreview: data.imageTabAboutThird || ''
            }
          ];

          const loadedData: StoreData = {
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            website: data.website || '',
            businessHours: data.storeBusinessHours || defaultBusinessHours,
            aboutSections,
            storeImage: data.storeImage || ''
          };

          setStoreData(loadedData);
        }
      } catch (err) {
        console.error('Error loading store data:', err);
        setError('Failed to load store data');
      }
    };

    loadStoreData();
  }, [currentUser]);

  useEffect(() => {
    if (isEditing) {
      setDraftValues(storeData);
    }
  }, [isEditing, storeData]);

  const saveStoreToFirestore = async (values: StoreData) => {
    if (!currentUser) return;

    setSaving(true);
    setSaveStep('saving');
    setError(null);

    try {
      // Geocode the address if provided
      let coordinates = new GeoPoint(0, 0);
      if (values.address.trim()) {
        const geocoder = new google.maps.Geocoder();
        const geocodeResult = await geocoder.geocode({ address: values.address });
        
        if (geocodeResult.results[0]) {
          const location = geocodeResult.results[0].geometry.location;
          coordinates = new GeoPoint(location.lat(), location.lng());
        }
      }

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
        values.aboutSections.map(async (section, index) => {
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
        name: values.name,
        description: values.description,
        address: values.address,
        location: coordinates,
        phone: values.phone,
        website: values.website,
        storeBusinessHours: values.businessHours,
        titleTabAboutFirst: values.aboutSections[0]?.title || '',
        bodyTabAboutFirst: values.aboutSections[0]?.description || '',
        imageTabAboutFirst: aboutSectionImages[0] || '',
        titleTabAboutSecond: values.aboutSections[1]?.title || '',
        bodyTabAboutSecond: values.aboutSections[1]?.description || '',
        imageTabAboutSecond: aboutSectionImages[1] || '',
        titleTabAboutThird: values.aboutSections[2]?.title || '',
        bodyTabAboutThird: values.aboutSections[2]?.description || '',
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
    const reader = new FileReader();
    reader.onload = (e) => {
      setStoreImage({
        file,
        preview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      setDraftValues(prev => ({
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
            <h1 className="text-2xl font-bold text-gray-900">{t('store.setup.title')}</h1>
            <p className="text-gray-600 mt-1">{t('store.setup.subtitle')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isEditing ? (
        <form className="space-y-6">
          <FormSection title={t('store.setup.basicInfo')} icon={Store}>
            <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('store.setup.storeImage')}
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-8 border-gray-300
                  hover:border-primary-400 transition-colors duration-200
                  flex flex-col items-center justify-center cursor-pointer"
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
                          <span>{t('store.setup.uploadFile')}</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleStoreImageChange}
                          />
                        </label>
                        <p className="pl-1">{t('store.setup.dragDrop')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('store.setup.uploadHint')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={draftValues.name}
                onChange={(e) => setDraftValues(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
                placeholder="Enter your store name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Description
              </label>
              <textarea
                value={draftValues.description}
                onChange={(e) => setDraftValues(prev => ({ ...prev, description: e.target.value }))}
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
                  value={draftValues.address}
                  onChange={(e) => setDraftValues(prev => ({ ...prev, address: e.target.value }))}
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
                  value={draftValues.phone}
                  onChange={(e) => setDraftValues(prev => ({ ...prev, phone: e.target.value }))}
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
                  value={draftValues.website}
                  onChange={(e) => setDraftValues(prev => ({ ...prev, website: e.target.value }))}
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
                    value={draftValues.businessHours[day].open}
                    onChange={(e) => setDraftValues({
                      ...draftValues,
                      businessHours: {
                        ...draftValues.businessHours,
                        [day]: { ...draftValues.businessHours[day], open: e.target.value }
                      }
                    })}
                    className="w-40"
                    disabled={draftValues.businessHours[day].closed}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={draftValues.businessHours[day].close}
                    onChange={(e) => setDraftValues({
                      ...draftValues,
                      businessHours: {
                        ...draftValues.businessHours,
                        [day]: { ...draftValues.businessHours[day], close: e.target.value }
                      }
                    })}
                    className="w-40"
                    disabled={draftValues.businessHours[day].closed}
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={draftValues.businessHours[day].closed}
                      onChange={(e) => setDraftValues({
                        ...draftValues,
                        businessHours: {
                          ...draftValues.businessHours,
                          [day]: { ...draftValues.businessHours[day], closed: e.target.checked }
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

        <FormSection title="About Us" icon={Building2}>
          <div className="space-y-8">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6">
              <p className="text-sm text-primary-800">
                <InfoIcon className="w-5 h-5 inline-block mr-2" />
                These sections will be prominently featured in your store profile. 
                A compelling story helps attract customers and builds trust.
              </p>
            </div>

            {draftValues.aboutSections.map((section) => (
              <div
                key={section.id}
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
                      onChange={(e) => setDraftValues(prev => ({
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
                      onChange={(e) => setDraftValues(prev => ({
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
                      className="border-2 border-dashed rounded-lg p-8 border-gray-300
                        hover:border-primary-400 transition-colors duration-200
                        flex flex-col items-center justify-center cursor-pointer"
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
                            onClick={() => setDraftValues(prev => ({
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
                                <span>{t('store.setup.uploadFile')}</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => handleSectionImageChange(e, section.id)}
                                />
                              </label>
                              <p className="pl-1">{t('store.setup.dragDrop')}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {t('store.setup.uploadHint')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              className={`
                inline-flex items-center px-6 py-3 rounded-lg text-white
                ${saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 transform transition-all duration-200 hover:scale-105'}
                shadow-lg hover:shadow-xl
              `}
              onClick={async () => {
                if (!validateFields(draftValues)) {
                  setError('Please fill in all required fields');
                  return;
                }
                await saveStoreToFirestore(draftValues);
                setStoreData(draftValues);
                setIsEditing(false);
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('store.setup.saving')}
                </>
              ) : (
                <>
                  <Store className="w-5 h-5 mr-2" />
                  {t('store.setup.saveStore')}
                </>
              )}
            </button>
            <button
              type="button"
              className="mt-6 ml-4 px-4 py-2 border border-gray-300 text-gray-700 rounded"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : hasStore ? (
        <div className="space-y-4">
          <div className="bg-white border rounded p-4">
            <h4 className="font-medium text-gray-700">Store Name</h4>
            <p className="text-gray-900">{storeData.name}</p>
          </div>
          <div className="bg-white border rounded p-4">
            <h4 className="font-medium text-gray-700">Description</h4>
            <p className="text-gray-900">{storeData.description}</p>
          </div>
          <div className="bg-white border rounded p-4">
            <h4 className="font-medium text-gray-700">Address</h4>
            <p className="text-gray-900">{storeData.address}</p>
          </div>
          <div className="bg-white border rounded p-4">
            <h4 className="font-medium text-gray-700">Phone</h4>
            <p className="text-gray-900">{storeData.phone}</p>
          </div>
          <button
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded"
            onClick={() => {
              setDraftValues(storeData);
              setIsEditing(true);
            }}
          >
            Edit Store
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h3>
            <p className="text-gray-600 mb-6">Let's set up your store to start selling online.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};