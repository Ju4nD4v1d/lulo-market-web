import React, { useState, useCallback } from 'react';
import { 
  Store, 
  AlertCircle, 
  CheckCircle2,
  MapPin,
  Phone,
  Globe,
  DollarSign,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

const validateImage = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'Please upload an image file';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image size must be less than 1MB';
  }
  return null;
};

interface AboutUs {
  title: string;
  description: string;
  image?: File;
  imagePreview?: string;
}

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    aboutUs: {
      title: '',
      description: '',
      image: undefined,
      imagePreview: undefined
    } as AboutUs
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setError(error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          aboutUs: {
            ...prev.aboutUs,
            image: file,
            imagePreview: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setError(error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          aboutUs: {
            ...prev.aboutUs,
            image: file,
            imagePreview: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Placeholder for future implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Store information saved successfully');
    } catch (err) {
      setError('Failed to save store information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Setup</h1>
        <p className="text-gray-600">Configure your store information and settings</p>
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
                rows={4}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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

        {/* Business Hours */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
          <div className="space-y-4">
            {Object.entries(formData.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-28">
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
                    className="block w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={hours.closed}
                  />
                  <span className="text-gray-500 w-6 text-center">to</span>
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
                    className="block w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={hours.closed}
                  />
                  <label className="inline-flex items-center ml-4">
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

        {/* About Us Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Us</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="aboutTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="aboutTitle"
                value={formData.aboutUs.title}
                onChange={(e) => setFormData({
                  ...formData,
                  aboutUs: { ...formData.aboutUs, title: e.target.value }
                })}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter a title for your about section"
              />
            </div>

            <div>
              <label htmlFor="aboutDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="aboutDescription"
                value={formData.aboutUs.description}
                onChange={(e) => setFormData({
                  ...formData,
                  aboutUs: { ...formData.aboutUs, description: e.target.value }
                })}
                rows={4}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  ${formData.aboutUs.imagePreview ? 'border-primary-300' : 'border-gray-300'}
                  hover:border-primary-400 transition-colors duration-200
                  flex flex-col items-center justify-center
                  cursor-pointer
                `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {formData.aboutUs.imagePreview ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={formData.aboutUs.imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        aboutUs: { ...formData.aboutUs, image: undefined, imagePreview: undefined }
                      })}
                      className="text-sm text-red-600 hover:text-red-700 block w-full text-center"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="about-image"
                        className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="about-image"
                          name="about-image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
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
                Save Store
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};