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
import type { StoreData, AboutUsSection } from '../types/store';

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
  aboutUs?: AboutUsSection[];
}

interface AboutUsSection {
  title: string;
  description: string;
  image: File | null;
  imagePreview?: string;
  imageUrl?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [userStore, setUserStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    imageUrl: '',
    aboutUs: [
      {
        title: 'Our Story',
        description: '',
        image: null,
        imageUrl: ''
      },
      {
        title: 'Our Mission',
        description: '',
        image: null,
        imageUrl: ''
      },
      {
        title: 'Our Values',
        description: '',
        image: null,
        imageUrl: ''
      }
    ]
  });

  useEffect(() => {
    const fetchUserStore = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const storeData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          } as StoreData;
          setUserStore(storeData);
          setFormData({
            ...formData,
            ...storeData
          });
        }
      } catch (err) {
        setError('Failed to fetch store data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStore();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const storeData = {
        ...formData,
        ownerId: currentUser.uid,
        updatedAt: new Date().toISOString()
      };

      if (userStore) {
        // Update existing store
        const storeRef = doc(db, 'stores', userStore.id);
        await updateDoc(storeRef, storeData);
        setSuccess('Store updated successfully');
      } else {
        // Create new store
        const storesRef = collection(db, 'stores');
        const docRef = await addDoc(storesRef, {
          ...storeData,
          createdAt: new Date().toISOString()
        });
        setUserStore({ id: docRef.id, ...storeData });
        setSuccess('Store created successfully');
      }
    } catch (err) {
      setError('Failed to save store data');
    } finally {
      setSaving(false);
    }
  };

  const handleAboutUsChange = (index: number, field: keyof AboutUsSection, value: string) => {
    setFormData(prev => ({
      ...prev,
      aboutUs: prev.aboutUs.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {userStore ? 'Edit Store' : 'Create Your Store'}
        </h1>
        <p className="text-gray-600">
          {userStore 
            ? 'Update your store information and settings'
            : 'Get started by setting up your store profile'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={4}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/{MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="username or page URL"
                />
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
          <div className="space-y-4">
            {Object.entries(formData.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </div>
                <div className="flex-1 flex items-center space-x-4">
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: { ...hours, open: e.target.value }
                      }
                    })}
                    className="block w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={hours.closed}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: { ...hours, close: e.target.value }
                      }
                    })}
                    className="block w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={hours.closed}
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessHours: {
                          ...formData.businessHours,
                          [day]: { ...hours, closed: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.pickup}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryOptions: {
                      ...formData.deliveryOptions,
                      pickup: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Store Pickup</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.delivery}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryOptions: {
                      ...formData.deliveryOptions,
                      delivery: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Local Delivery</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.shipping}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryOptions: {
                      ...formData.deliveryOptions,
                      shipping: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Shipping</span>
              </label>
            </div>

            {formData.deliveryOptions.delivery && (
              <div>
                <label htmlFor="deliveryCost" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Cost
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="deliveryCost"
                    value={formData.deliveryCostWithDiscount}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryCostWithDiscount: parseFloat(e.target.value)
                    })}
                    min="0"
                    step="0.01"
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData({
                    ...formData,
                    minimumOrder: parseFloat(e.target.value)
                  })}
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.paymentMethods.cash}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    cash: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Cash</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.paymentMethods.card}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    card: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Credit/Debit Card</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.paymentMethods.transfer}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    transfer: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Bank Transfer</span>
            </label>
          </div>
        </div>

        {/* About Us Sections */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Us</h2>
          <div className="space-y-8">
            {formData.aboutUs.map((section, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-700">{section.title}</h3>
                  <div className="h-px flex-1 bg-gray-200 mx-4"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={section.description}
                    onChange={(e) => handleAboutUsChange(index, 'description', e.target.value)}
                    rows={4}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Tell us about ${section.title.toLowerCase()}...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={section.imageUrl}
                      onChange={(e) => handleAboutUsChange(index, 'imageUrl', e.target.value)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                  </div>
                  {section.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`
              inline-flex items-center px-6 py-3 rounded-lg text-white
              ${saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'}
              transition-colors duration-200
            `}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Saving...
              </>
            ) : (
              <>
                <Store className="w-5 h-5 mr-2" />
                {userStore ? 'Update Store' : 'Create Store'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};