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
import { collection, addDoc, GeoPoint, getDocs, query, where } from 'firebase/firestore';
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
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
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
          
          // Initialize all days as closed
          const initialBusinessHours = {
            monday: { open: '09:00', close: '18:00', closed: true },
            tuesday: { open: '09:00', close: '18:00', closed: true },
            wednesday: { open: '09:00', close: '18:00', closed: true },
            thursday: { open: '09:00', close: '18:00', closed: true },
            friday: { open: '09:00', close: '18:00', closed: true },
            saturday: { open: '10:00', close: '16:00', closed: true },
            sunday: { open: '10:00', close: '16:00', closed: true }
          };

          // Parse storeDeliverySchedule array
          if (storeData.storeDeliverySchedule && Array.isArray(storeData.storeDeliverySchedule)) {
            storeData.storeDeliverySchedule.forEach(schedule => {
              // Parse schedule string (e.g., "Monday 09:00 to 18:00")
              const [day, time] = schedule.split(' ', 2);
              const [open, close] = time.split(' to ');
              
              // Convert day to lowercase for matching
              const dayKey = day.toLowerCase() as keyof typeof initialBusinessHours;
              
              if (dayKey in initialBusinessHours) {
                initialBusinessHours[dayKey] = {
                  open,
                  close,
                  closed: false // Day is open if it's in the schedule
                };
              }
            });
          }

          setFormData(prevData => ({
            ...prevData,
            name: storeData.name || '',
            description: storeData.description || '',
            address: storeData.address || '',
            phone: storeData.phone || '',
            website: storeData.website || '',
            businessHours: initialBusinessHours
          }));

          if (storeData.storeImage) {
            setStoreImage({
              preview: storeData.storeImage,
              url: storeData.storeImage
            });
          }
        }
      } catch (error) {
        console.error('Error loading store data:', error);
      }
    };

    loadStoreData();
  }, [currentUser]);

  const formatBusinessHours = () => {
    const schedule: string[] = [];
    Object.entries(formData.businessHours).forEach(([day, hours]) => {
      if (!hours.closed) {
        schedule.push(`${day.charAt(0).toUpperCase() + day.slice(1)} ${hours.open} to ${hours.close}`);
      }
    });
    return schedule;
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
    if (!storeImage.file) return null;

    try {
      const storageRef = ref(storage, `stores/${storeId}/storeImage.png`);
      await uploadBytes(storageRef, storeImage.file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading store image:', error);
      throw new Error('Failed to upload store image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
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

      // Get existing store or create new one
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      let storeId = querySnapshot.docs[0]?.id;
      let imageUrl = storeImage.url; // Keep existing URL if no new image

      // Upload new image if provided
      if (storeImage.file) {
        imageUrl = await uploadStoreImage(currentUser.uid);
      }

      const storeData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        location: new GeoPoint(coordinates.lat, coordinates.lng),
        phone: formData.phone,
        website: formData.website,
        storeDeliverySchedule: formatBusinessHours(),
        titleTabAboutFirst: formData.aboutSections[0]?.title || '',
        bodyTabAboutFirst: formData.aboutSections[0]?.description || '',
        titleTabAboutSecond: formData.aboutSections[1]?.title || '',
        bodyTabAboutSecond: formData.aboutSections[1]?.description || '',
        titleTabAboutThird: formData.aboutSections[2]?.title || '',
        bodyTabAboutThird: formData.aboutSections[2]?.description || '',
        ownerId: currentUser.uid,
        storeImage: imageUrl,
        updatedAt: new Date(),
      };

      if (storeId) {
        // Update existing store
        await addDoc(collection(db, 'stores'), {
          ...storeData,
          id: storeId,
        });
      } else {
        // Create new store
        await addDoc(collection(db, 'stores'), {
          ...storeData,
          createdAt: new Date(),
        });
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
              onClick={() => window.location.hash = '#dashboard/products'}
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
        {/* Rest of the form JSX remains unchanged */}
      </form>
    </div>
  );
};