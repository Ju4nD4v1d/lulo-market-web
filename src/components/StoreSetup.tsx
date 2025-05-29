import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { 
  Store, 
  Upload, 
  AlertCircle, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  Info,
  Clock,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  DollarSign,
  Truck,
  CreditCard
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface StoreData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  deliveryOptions?: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
  };
  paymentMethods?: {
    cash: boolean;
    card: boolean;
    transfer: boolean;
  };
  deliveryCostWithDiscount?: number;
  minimumOrder?: number;
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
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const aboutUsImageRefs = useRef<(HTMLInputElement | null)[]>([]);
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
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    deliveryOptions: {
      pickup: true,
      delivery: true,
      shipping: false
    },
    paymentMethods: {
      cash: true,
      card: true,
      transfer: true
    },
    deliveryCostWithDiscount: 0,
    minimumOrder: 0,
    imageUrl: ''
  });

  const [aboutUsSections, setAboutUsSections] = useState<AboutUsSection[]>([
    { title: '', description: '', image: null },
    { title: '', description: '', image: null },
    { title: '', description: '', image: null }
  ]);

  const [mainImagePreview, setMainImagePreview] = useState<string | undefined>();
  const [mainImage, setMainImage] = useState<File | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target.classList.add('border-primary-500', 'bg-primary-50');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target.classList.remove('border-primary-500', 'bg-primary-50');
  };

  const handleMainImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget;
    target.classList.remove('border-primary-500', 'bg-primary-50');

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setImageError('Please drop an image file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `Image size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
      setImageError(errorMessage);
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = '';
      }
      
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(undefined);
      setMainImage(null);
      return;
    }

    setImageError(null);
    
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);
    setMainImage(file);
  };

  const handleSectionDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget;
    target.classList.remove('border-primary-500', 'bg-primary-50');

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      const newErrors = [...aboutUsErrors];
      newErrors[index] = 'Please drop an image file';
      setAboutUsErrors(newErrors);
      return;
    }

    handleAboutUsChange(index, 'image', file);
  };

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
            website: storeData.website || '',
            instagram: storeData.instagram || '',
            facebook: storeData.facebook || '',
            twitter: storeData.twitter || '',
            businessHours: storeData.businessHours || formData.businessHours,
            deliveryOptions: storeData.deliveryOptions || formData.deliveryOptions,
            paymentMethods: storeData.paymentMethods || formData.paymentMethods,
            deliveryCostWithDiscount: storeData.deliveryCostWithDiscount || 0,
            minimumOrder: storeData.minimumOrder || 0,
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
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = '';
      }
      
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(undefined);
      setMainImage(null);
      return;
    }

    setImageError(null);
    
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

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
    
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `Image size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
      setImageError(errorMessage);
      e.target.value = '';
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
      return;
    }

    setImageError(null);
    
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
      if (value instanceof File) {
        if (value.size > MAX_FILE_SIZE) {
          const errorMessage = `Image size must be less than 1MB. Current size: ${(value.size / (1024 * 1024)).toFixed(2)}MB`;
          newErrors[index] = errorMessage;
          setAboutUsErrors(newErrors);
          
          if (aboutUsImageRefs.current[index]) {
            aboutUsImageRefs.current[index]!.value = '';
          }
          
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

        if (newSections[index].imagePreview) {
          URL.revokeObjectURL(newSections[index].imagePreview);
        }

        const previewUrl = URL.createObjectURL(value);
        newSections[index] = {
          ...newSections[index],
          image: value,
          imagePreview: previewUrl
        };
        newErrors[index] = null;
      } else if (value === null) {
        if (newSections[index].imagePreview) {
          URL.revokeObjectURL(newSections[index].imagePreview);
        }
        newSections[index] = {
          ...newSections[index],
          image: null,
          imagePreview: undefined
        };
        newErrors[index] = null;
        
        if (aboutUsImageRefs.current[index]) {
          aboutUsImageRefs.current[index]!.value = '';
        }
      }
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

  const renderBusinessHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-28">
              <span className="capitalize">{day}</span>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!formData.businessHours[day].closed}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    businessHours: {
                      ...formData.businessHours,
                      [day]: {
                        ...formData.businessHours[day],
                        closed: !e.target.checked
                      }
                    }
                  });
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2">Open</span>
            </label>
            {!formData.businessHours[day].closed && (
              <>
                <input
                  type="time"
                  value={formData.businessHours[day].open}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: {
                          ...formData.businessHours[day],
                          open: e.target.value
                        }
                      }
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span>to</span>
                <input
                  type="time"
                  value={formData.businessHours[day].close}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: {
                          ...formData.businessHours[day],
                          close: e.target.value
                        }
                      }
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </>
            )}
          </div>
        ))}
      </div>
    );
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
      <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userStore ? 'Manage Your Store' : 'Create Your Store'}
            </h1>
            <p className="text-gray-600">
              {userStore 
                ? 'Update your store information and keep your business details fresh.'
                : 'Get started by setting up your store profile and sharing your story.'}
            </p>
          </div>
          <Store className="w-12 h-12 text-primary-600" />
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center text-green-700">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Store Profile</h2>
              <p className="text-gray-500 text-sm mt-1">Basic information about your business</p>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your store name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter store address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 h-[calc(100%-2rem)]"
                placeholder="Tell customers about your store..."
                rows={6}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Instagram handle"
                />
              </div>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Facebook page"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Twitter handle"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
              <p className="text-gray-500 text-sm mt-1">Set your store's operating hours</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {renderBusinessHours()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delivery Options</h2>
                <p className="text-gray-500 text-sm mt-1">How customers can receive their orders</p>
              </div>
              <Truck className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {Object.entries({
                pickup: 'Store Pickup',
                delivery: 'Local Delivery',
                shipping: 'Shipping'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.deliveryOptions[key]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        deliveryOptions: {
                          ...formData.deliveryOptions,
                          [key]: e.target.checked
                        }
                      });
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {(formData.deliveryOptions.delivery || formData.deliveryOptions.shipping) && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Cost
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.deliveryCostWithDiscount}
                      onChange={(e) => setFormData({ ...formData, deliveryCostWithDiscount: parseFloat(e.target.value) })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: parseFloat(e.target.value) })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                <p className="text-gray-500 text-sm mt-1">Available payment options</p>
              </div>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {Object.entries({
                cash: 'Cash',
                card: 'Credit/Debit Card',
                transfer: 'Bank Transfer'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods[key]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        paymentMethods: {
                          ...formData.paymentMethods,
                          [key]: e.target.checked
                        }
                      });
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Store Image</h2>
              <p className="text-gray-500 text-sm mt-1">Upload your store's main image</p>
            </div>
            <Camera className="w-5 h-5 text-gray-400" />
          </div>

          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-500 transition-colors duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleMainImageDrop}
          >
            <div className="space-y-2 text-center">
              {mainImagePreview ? (
                <div className="relative inline-block group">
                  <img
                    src={mainImagePreview}
                    alt="Store preview"
                    className="max-h-64 rounded-lg"
                  />
                  <button
                    onClick={handleRemoveMainImage}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full
                      opacity-0 group-hover:opacity-100 transition-all duration-200
                      hover:bg-black/70"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="main-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="main-image-upload"
                        ref={mainImageInputRef}
                        type="file"
                        className="sr-only"
                        onChange={handleMainImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 1MB</p>
                </>
              )}
            </div>
          </div>
          {imageError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {imageError}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">About Us</h2>
              <p className="text-gray-500 text-sm mt-1">Share your story in three engaging sections</p>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutUsSections.map((section, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-6 space-y-4"
              >
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Section {index + 1}</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleAboutUsChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter section description"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image * (Max 1MB)
                    </label>
                    <div 
                      className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors duration-200"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleSectionDrop(e, index)}
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-4">
                          <input
                            ref={el => aboutUsImageRefs.current[index] = el}
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
                        </div>
                        {!section.imagePreview && (
                          <p className="text-sm text-gray-500 text-center">
                            or drag and drop an image here
                          </p>
                        )}
                        {aboutUsErrors[index] && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {aboutUsErrors[index]}
                          </p>
                        )}
                      </div>
                    </div>

                    {section.imagePreview && (
                      <div className="relative group mt-4">
                        <img
                          src={section.imagePreview}
                          alt={`Section ${index + 1} preview`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => handleRemoveImage(e, index)}
                          className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`
              px-8 py-3 bg-primary-600 text-white rounded-xl
              hover:bg-primary-700 transition-all duration-200
              transform hover:scale-105
              flex items-center space-x-2
              ${saving ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>{userStore ? 'Update Store' : 'Create Store'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export { StoreSetup }