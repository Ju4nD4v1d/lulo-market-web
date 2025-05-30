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
  Sun,
  Moon
} from 'lucide-react';
import { FormSection } from './FormSection';
import { collection, addDoc, GeoPoint, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
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
    storeBusinessHours: {
      Sunday: { open: '', close: '', closed: true },
      Monday: { open: '07:00', close: '19:00', closed: false },
      Tuesday: { open: '07:00', close: '19:00', closed: false },
      Wednesday: { open: '07:00', close: '19:00', closed: false },
      Thursday: { open: '07:00', close: '19:00', closed: false },
      Friday: { open: '07:00', close: '19:00', closed: false },
      Saturday: { open: '07:00', close: '19:00', closed: false }
    },
    aboutSections: [
      { id: '1', title: '', description: '', image: undefined, imageUrl: '', imagePreview: '' },
      { id: '2', title: '', description: '', image: undefined, imageUrl: '', imagePreview: '' },
      { id: '3', title: '', description: '', image: undefined, imageUrl: '', imagePreview: '' }
    ]
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

          const aboutSections = [
            {
              id: '1',
              title: storeData.titleTabAboutFirst || '',
              description: storeData.bodyTabAboutFirst || '',
              imageUrl: storeData.imageTabAboutFirst || '',
              imagePreview: storeData.imageTabAboutFirst || ''
            },
            {
              id: '2',
              title: storeData.titleTabAboutSecond || '',
              description: storeData.bodyTabAboutSecond || '',
              imageUrl: storeData.imageTabAboutSecond || '',
              imagePreview: storeData.imageTabAboutSecond || ''
            },
            {
              id: '3',
              title: storeData.titleTabAboutThird || '',
              description: storeData.bodyTabAboutThird || '',
              imageUrl: storeData.imageTabAboutThird || '',
              imagePreview: storeData.imageTabAboutThird || ''
            }
          ];

          setFormData(prev => ({
            ...prev,
            storeBusinessHours: storeData.storeBusinessHours || prev.storeBusinessHours,
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

  const uploadStoreImage = async (): Promise<string | null> => {
    if (!storeImage.file || !currentUser) return null;

    const storageRef = ref(storage, `stores/${currentUser.uid}/storeImage.png`);
    await uploadBytes(storageRef, storeImage.file);
    return getDownloadURL(storageRef);
  };

  const uploadAboutImage = async (file: File, index: number): Promise<string> => {
    if (!currentUser) throw new Error('No user authenticated');

    const filename = `imageTabAbout${['First', 'Second', 'Third'][index]}.jpg`;
    const storageRef = ref(storage, `stores/${currentUser.uid}/${filename}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      let storeImageUrl = storeImage.url;
      if (storeImage.file) {
        storeImageUrl = await uploadStoreImage();
      }

      const aboutSectionPromises = formData.aboutSections.map(async (section, index) => {
        if (section.image) {
          const imageUrl = await uploadAboutImage(section.image, index);
          return { ...section, imageUrl };
        }
        return section;
      });

      const updatedAboutSections = await Promise.all(aboutSectionPromises);

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
        storeBusinessHours: formData.storeBusinessHours,
        titleTabAboutFirst: updatedAboutSections[0]?.title || '',
        bodyTabAboutFirst: updatedAboutSections[0]?.description || '',
        imageTabAboutFirst: updatedAboutSections[0]?.imageUrl || updatedAboutSections[0]?.imagePreview || '',
        titleTabAboutSecond: updatedAboutSections[1]?.title || '',
        bodyTabAboutSecond: updatedAboutSections[1]?.description || '',
        imageTabAboutSecond: updatedAboutSections[1]?.imageUrl || updatedAboutSections[1]?.imagePreview || '',
        titleTabAboutThird: updatedAboutSections[2]?.title || '',
        bodyTabAboutThird: updatedAboutSections[2]?.description || '',
        imageTabAboutThird: updatedAboutSections[2]?.imageUrl || updatedAboutSections[2]?.imagePreview || '',
        ownerId: currentUser.uid,
        createdAt: new Date(),
        storeImage: storeImageUrl
      };

      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'stores'), storeData);
      } else {
        const storeDoc = querySnapshot.docs[0].ref;
        await updateDoc(storeDoc, storeData);
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error saving store:', error);
      setError(error instanceof Error ? error.message : 'Failed to save store information');
    } finally {
      setSaving(false);
    }
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
          s.id === sectionId ? { 
            ...s, 
            image: file,
            imagePreview: e.target?.result as string 
          } : s
        )
      }));
    };
    reader.readAsDataURL(file);
    setImageErrors(prev => ({ ...prev, [sectionId]: '' }));
  };

  const handleConfirmation = () => {
    window.location.hash = '#dashboard/products';
  };

  const handleSetAllHours = (open: string, close: string, closed: boolean) => {
    const updatedSchedule = { ...formData.storeBusinessHours };
    Object.keys(updatedSchedule).forEach(day => {
      if (day !== 'Sunday') {
        updatedSchedule[day] = { open, close, closed };
      }
    });
    setFormData(prev => ({
      ...prev,
      storeBusinessHours: updatedSchedule
    }));
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-4xl mx-auto">
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Store Created Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your store has been created and saved. You can now start adding products to your store.
            </p>
            <button
              onClick={handleConfirmation}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg
                hover:bg-primary-700 transition-colors"
            >
              Continue to Products
            </button>
          </div>
        </div>
      )}

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
        <FormSection title="Business Hours" icon={Clock}>
          <div className="space-y-6">
            <div className="flex items-center justify-end space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleSetAllHours('07:00', '19:00', false)}
                className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 
                  bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Sun className="w-4 h-4 mr-2" />
                Set All to 7 AM - 7 PM
              </button>
              <button
                type="button"
                onClick={() => handleSetAllHours('00:00', '23:59', false)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 
                  bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Moon className="w-4 h-4 mr-2" />
                Set All to 24/7
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-28">
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.storeBusinessHours[day].open}
                          onChange={(e) => setFormData({
                            ...formData,
                            storeBusinessHours: {
                              ...formData.storeBusinessHours,
                              [day]: { ...formData.storeBusinessHours[day], open: e.target.value }
                            }
                          })}
                          className="w-full"
                          disabled={formData.storeBusinessHours[day].closed}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.storeBusinessHours[day].close}
                          onChange={(e) => setFormData({
                            ...formData,
                            storeBusinessHours: {
                              ...formData.storeBusinessHours,
                              [day]: { ...formData.storeBusinessHours[day], close: e.target.value }
                            }
                          })}
                          className="w-full"
                          disabled={formData.storeBusinessHours[day].closed}
                        />
                      </div>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.storeBusinessHours[day].closed}
                        onChange={(e) => setFormData({
                          ...formData,
                          storeBusinessHours: {
                            ...formData.storeBusinessHours,
                            [day]: { ...formData.storeBusinessHours[day], closed: e.target.checked }
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
                                s.id === section.id ? { ...s, image: undefined, imagePreview: '', imageUrl: '' } : s
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