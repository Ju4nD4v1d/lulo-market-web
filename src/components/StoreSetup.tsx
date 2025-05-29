import React, { useState, useEffect } from 'react';
import { Store, Upload, AlertCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface StoreData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  deliveryCostWithDiscount?: number;
  imageUrl?: string;
  ownerId: string;
}

interface AboutUsSection {
  title: string;
  description: string;
  image: File | null;
  imagePreview?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [userStore, setUserStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aboutUsErrors, setAboutUsErrors] = useState<(string | null)[]>([null, null, null]);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    deliveryCostWithDiscount: 0,
    imageUrl: ''
  });

  const [aboutUsSections, setAboutUsSections] = useState<AboutUsSection[]>([
    { title: '', description: '', image: null },
    { title: '', description: '', image: null },
    { title: '', description: '', image: null }
  ]);

  const [mainImagePreview, setMainImagePreview] = useState<string | undefined>();
  const [mainImage, setMainImage] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      aboutUsSections.forEach(section => {
        if (section.imagePreview) {
          URL.revokeObjectURL(section.imagePreview);
        }
      });
    };
  }, []);

  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        const storesRef = collection(db, 'Stores');
        const q = query(storesRef, where('ownerId', '==', currentUser?.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          const storeData = { id: storeDoc.id, ...storeDoc.data() } as StoreData;
          setUserStore(storeData);
          setFormData({
            name: storeData.name || '',
            description: storeData.description || '',
            address: storeData.address || '',
            phone: storeData.phone || '',
            deliveryCostWithDiscount: storeData.deliveryCostWithDiscount || 0,
            imageUrl: storeData.imageUrl || ''
          });
        }
      } catch (err) {
        setError('Failed to fetch store data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserStore();
    }
  }, [currentUser]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `Image size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
      setImageError(errorMessage);
      e.target.value = ''; // Reset the input
      
      // Clear preview if it exists
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(undefined);
      setMainImage(null);
      return;
    }

    // Clear any previous errors
    setImageError(null);
    
    // Revoke previous preview URL if it exists
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    // Create new preview URL
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);
    setMainImage(file);
  };

  const handleRemoveMainImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImagePreview(undefined);
    setMainImage(null);
    setImageError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `Image size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
      setImageError(errorMessage);
      e.target.value = ''; // Reset the input
      setFormData(prev => ({
        ...prev,
        imageUrl: '' // Clear the preview
      }));
      return;
    }

    // Clear any previous errors
    setImageError(null);
    
    // Handle the valid file
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAboutUsChange = (index: number, field: keyof AboutUsSection, value: string | File | null) => {
    const newSections = [...aboutUsSections];
    const newErrors = [...aboutUsErrors];
    
    if (field === 'image') {
      // Handle file selection
      if (value instanceof File) {
        if (value.size > MAX_FILE_SIZE) {
          const errorMessage = `Image size must be less than 1MB. Current size: ${(value.size / (1024 * 1024)).toFixed(2)}MB`;
          newErrors[index] = errorMessage;
          setAboutUsErrors(newErrors);
          
          // Clear the preview and file input
          if (newSections[index].imagePreview) {
            URL.revokeObjectURL(newSections[index].imagePreview);
          }
          newSections[index] = {
            ...newSections[index],
            image: null,
            imagePreview: undefined
          };
          setAboutUsSections(newSections);
          return;
        }

        // Revoke previous preview URL if it exists
        if (newSections[index].imagePreview) {
          URL.revokeObjectURL(newSections[index].imagePreview);
        }

        // Create new preview URL
        const previewUrl = URL.createObjectURL(value);
        newSections[index] = {
          ...newSections[index],
          image: value,
          imagePreview: previewUrl
        };
        newErrors[index] = null;
      }
      // Handle remove button click
      else if (value === null && !newSections[index].image) {
        if (newSections[index].imagePreview) {
          URL.revokeObjectURL(newSections[index].imagePreview);
        }
        newSections[index] = {
          ...newSections[index],
          image: null,
          imagePreview: undefined
        };
        newErrors[index] = null;
      }
    } else if (field === 'description' && typeof value === 'string') {
      if (value.length > MAX_DESCRIPTION_LENGTH) {
        return;
      }
      newSections[index] = {
        ...newSections[index],
        [field]: value
      };
    } else {
      newSections[index] = {
        ...newSections[index],
        [field]: value
      };
    }
    
    setAboutUsSections(newSections);
    setAboutUsErrors(newErrors);
  };

  const handleRemoveImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleAboutUsChange(index, 'image', null);
  };

  const validateAboutUs = () => {
    const newErrors = [...aboutUsErrors];
    let isValid = true;

    for (let i = 0; i < aboutUsSections.length; i++) {
      const section = aboutUsSections[i];
      if (!section.title || !section.description || !section.image) {
        newErrors[i] = `Please fill all fields in section ${i + 1}`;
        isValid = false;
      } else if (section.description.length > MAX_DESCRIPTION_LENGTH) {
        newErrors[i] = `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters`;
        isValid = false;
      } else if (section.image && section.image.size > MAX_FILE_SIZE) {
        newErrors[i] = `Image exceeds 1MB size limit`;
        isValid = false;
      } else {
        newErrors[i] = null;
      }
    }

    setAboutUsErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateAboutUs()) {
      return;
    }
    
    setSaving(true);

    try {
      if (userStore) {
        const storeRef = doc(db, 'Stores', userStore.id);
        await updateDoc(storeRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        setSuccess('Store updated successfully!');
      } else {
        const storeData = {
          ...formData,
          ownerId: currentUser?.uid,
          createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'Stores'), storeData);
        setUserStore({ id: docRef.id, ...storeData } as StoreData);
        setSuccess('Store created successfully!');
      }
    } catch (err) {
      setError('Failed to save store data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {userStore ? 'Update Store' : 'Create Store'}
        </h1>
        <Store className="w-8 h-8 text-primary-600" />
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg text-green-600">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter store name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter store description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter store address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Image (Max 1MB)
            </label>
            <div className="mt-1 flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleMainImageChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
                {mainImagePreview && (
                  <div className="relative">
                    <img
                      src={mainImagePreview}
                      alt="Store preview"
                      className="h-16 w-16 object-cover rounded-lg cursor-pointer"
                      onClick={handleRemoveMainImage}
                    />
                  </div>
                )}
              </div>
              {imageError && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {imageError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">About Us</h2>
          
          {aboutUsSections.map((section, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">Section {index + 1}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleAboutUsChange(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter section title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description * ({section.description.length}/{MAX_DESCRIPTION_LENGTH})
                </label>
                <textarea
                  value={section.description}
                  onChange={(e) => handleAboutUsChange(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter section description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image * (Max 1MB)
                </label>
                <div className="mt-1 flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      onChange={(e) => handleAboutUsChange(index, 'image', e.target.files?.[0] || null)}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                      required={!section.image}
                    />
                    {section.imagePreview && (
                      <div className="relative">
                        <img
                          src={section.imagePreview}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-lg"
                          onClick={(e) => handleRemoveImage(e, index)}
                        />
                      </div>
                    )}
                  </div>
                  {aboutUsErrors[index] && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {aboutUsErrors[index]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <input
          type="hidden"
          value={formData.deliveryCostWithDiscount}
          onChange={(e) => setFormData({ ...formData, deliveryCostWithDiscount: Number(e.target.value) })}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`
              px-6 py-2 bg-primary-600 text-white rounded-lg
              hover:bg-primary-700 transition-colors
              flex items-center
              ${saving ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              userStore ? 'Update Store' : 'Create Store'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};