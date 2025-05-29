import React, { useState, useCallback } from 'react';
import { Store, AlertCircle, CheckCircle2, MapPin, Phone, Globe, DollarSign, Upload, Clock, CreditCard, Truck, ShoppingBag, Building2, BookOpen, Info as InfoIcon, Ban as Bank } from 'lucide-react';
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

interface AboutUsSection {
  id: string;
  title: string;
  description: string;
  image?: File;
  imagePreview?: string;
}

const FormSection = ({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center space-x-3 mb-6">
      <div className="bg-primary-50 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

export const StoreSetup = () => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string }>({});
  const [aboutUsSections, setAboutUsSections] = useState<AboutUsSection[]>([
    { id: '1', title: '', description: '' }
  ]);
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
      delivery: true
    },
    paymentMethods: {
      cash: true,
      card: true
    },
    deliveryCostWithDiscount: 0,
    minimumOrder: 0,
    payoutMethod: 'credit_card',
    payoutDetails: {
      creditCard: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      bankAccount: {
        accountNumber: '',
        transitNumber: '',
        institutionNumber: '',
        accountHolderName: ''
      }
    }
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setImageErrors(prev => ({ ...prev, [sectionId]: '' }));

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageErrors(prev => ({ ...prev, [sectionId]: error }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAboutUsSections(prev => prev.map(section => 
          section.id === sectionId
            ? { ...section, image: file, imagePreview: reader.result as string }
            : section
        ));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    setImageErrors(prev => ({ ...prev, [sectionId]: '' }));
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageErrors(prev => ({ ...prev, [sectionId]: error }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAboutUsSections(prev => prev.map(section => 
          section.id === sectionId
            ? { ...section, image: file, imagePreview: reader.result as string }
            : section
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const addAboutUsSection = () => {
    if (aboutUsSections.length < 3) {
      setAboutUsSections(prev => [
        ...prev,
        { id: String(prev.length + 1), title: '', description: '' }
      ]);
    }
  };

  const removeAboutUsSection = (id: string) => {
    setAboutUsSections(prev => prev.filter(section => section.id !== id));
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setImageErrors({});
    setSuccess(null);

    try {
      // Placeholder for future implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Store information saved successfully');
    } catch (err) {
      setImageErrors({ general: 'Failed to save store information' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      {imageErrors.general && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{imageErrors.general}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Basic Information" icon={Building2}>
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
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  placeholder-gray-400 text-gray-900"
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
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  placeholder-gray-400 text-gray-900"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contact Information" icon={Phone}>
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
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    placeholder-gray-400 text-gray-900"
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
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    placeholder-gray-400 text-gray-900"
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
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    placeholder-gray-400 text-gray-900"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Business Hours" icon={Clock}>
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
                    className="block w-40 px-4 py-2 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      text-gray-900 [color-scheme:light]
                      disabled:bg-gray-100 disabled:text-gray-500"
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
                    className="block w-40 px-4 py-2 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      text-gray-900 [color-scheme:light]
                      disabled:bg-gray-100 disabled:text-gray-500"
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
                      className="rounded border-gray-300 
                        text-primary-500 
                        focus:ring-primary-500 focus:ring-offset-0
                        checked:bg-primary-500 checked:hover:bg-primary-600
                        transition-colors duration-200"
                    />
                    <span className="ml-2 text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Delivery & Payment" icon={Truck}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Options</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
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
                    className="rounded border-gray-300 
                      text-primary-500 
                      focus:ring-primary-500 focus:ring-offset-0
                      checked:bg-primary-500 checked:hover:bg-primary-600
                      transition-colors duration-200"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Store Pickup</span>
                    <span className="block text-sm text-gray-500">Customers pick up orders</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
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
                    className="rounded border-gray-300 
                      text-primary-500 
                      focus:ring-primary-500 focus:ring-offset-0
                      checked:bg-primary-500 checked:hover:bg-primary-600
                      transition-colors duration-200"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Local Delivery</span>
                    <span className="block text-sm text-gray-500">Deliver to local area</span>
                  </div>
                </label>
              </div>
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
                    value={0}
                    disabled
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      placeholder-gray-400 text-gray-900 text-right
                      bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 italic">
                  Delivery cost will be calculated automatically based on the distance between your store and the customer's location.
                </p>
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
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    placeholder-gray-400 text-gray-900 text-right"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 italic">
                Customers must meet this minimum order amount to complete their purchase. Orders below this amount cannot be processed.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
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
                    className="rounded border-gray-300 
                      text-primary-500 
                      focus:ring-primary-500 focus:ring-offset-0
                      checked:bg-primary-500 checked:hover:bg-primary-600
                      transition-colors duration-200"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Cash</span>
                    <span className="block text-sm text-gray-500">Accept cash payments</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
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
                    className="rounded border-gray-300 
                      text-primary-500 
                      focus:ring-primary-500 focus:ring-offset-0
                      checked:bg-primary-500 checked:hover:bg-primary-600
                      transition-colors duration-200"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Credit Card</span>
                    <span className="block text-sm text-gray-500">Accept card payments</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Payout Method" icon={CreditCard}>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Note: This payment method is for setup purposes only. You must complete full onboarding and verification before receiving payouts.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex-1 relative border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="credit_card"
                    checked={formData.payoutMethod === 'credit_card'}
                    onChange={(e) => setFormData({
                      ...formData,
                      payoutMethod: e.target.value
                    })}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="font-medium text-gray-900">Credit Card</span>
                  </div>
                  <div className={`absolute inset-0 rounded-lg border-2 pointer-events-none transition-colors ${
                    formData.payoutMethod === 'credit_card' ? 'border-primary-500' : 'border-transparent'
                  }`} />
                </label>

                <label className="flex-1 relative border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="bank_account"
                    checked={formData.payoutMethod === 'bank_account'}
                    onChange={(e) => setFormData({
                      ...formData,
                      payoutMethod: e.target.value
                    })}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Bank className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="font-medium text-gray-900">Bank Account</span>
                  </div>
                  <div className={`absolute inset-0 rounded-lg border-2 pointer-events-none transition-colors ${
                    formData.payoutMethod === 'bank_account' ? 'border-primary-500' : 'border-transparent'
                  }`} />
                </label>
              </div>

              {formData.payoutMethod === 'credit_card' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      value={formData.payoutDetails.creditCard.cardholderName}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          creditCard: {
                            ...formData.payoutDetails.creditCard,
                            cardholderName: e.target.value
                          }
                        }
                      })}
                      className="block w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={formData.payoutDetails.creditCard.cardNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          creditCard: {
                            ...formData.payoutDetails.creditCard,
                            cardNumber: e.target.value
                          }
                        }
                      })}
                      placeholder="•••• •••• •••• ••••"
                      className="block w-full"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={formData.payoutDetails.creditCard.expiryDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          payoutDetails: {
                            ...formData.payoutDetails,
                            creditCard: {
                              ...formData.payoutDetails.creditCard,
                              expiryDate: e.target.value
                            }
                          }
                        })}
                        placeholder="MM/YY"
                        className="block w-full"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={formData.payoutDetails.creditCard.cvv}
                        onChange={(e) => setFormData({
                          ...formData,
                          payoutDetails: {
                            ...formData.payoutDetails,
                            creditCard: {
                              ...formData.payoutDetails.creditCard,
                              cvv: e.target.value
                            }
                          }
                        })}
                        placeholder="•••"
                        className="block w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.payoutMethod === 'bank_account' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      id="accountHolderName"
                      value={formData.payoutDetails.bankAccount.accountHolderName}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          bankAccount: {
                            ...formData.payoutDetails.bankAccount,
                            accountHolderName: e.target.value
                          }
                        }
                      })}
                      className="block w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="transitNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Transit Number (5 digits)
                    </label>
                    <input
                      type="text"
                      id="transitNumber"
                      value={formData.payoutDetails.bankAccount.transitNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          bankAccount: {
                            ...formData.payoutDetails.bankAccount,
                            transitNumber: e.target.value
                          }
                        }
                      })}
                      placeholder="12345"
                      maxLength={5}
                      className="block w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="institutionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Number (3 digits)
                    </label>
                    <input
                      type="text"
                      id="institutionNumber"
                      value={formData.payoutDetails.bankAccount.institutionNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          bankAccount: {
                            ...formData.payoutDetails.bankAccount,
                            institutionNumber: e.target.value
                          }
                        }
                      })}
                      placeholder="002"
                      maxLength={3}
                      className="block w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      value={formData.payoutDetails.bankAccount.accountNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        payoutDetails: {
                          ...formData.payoutDetails,
                          bankAccount: {
                            ...formData.payoutDetails.bankAccount,
                            accountNumber: e.target.value
                          }
                        }
                      })}
                      placeholder="12345678"
                      className="block w-full"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="About Us" icon={BookOpen}>
          <div className="space-y-8">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6">
              <p className="text-sm text-primary-800">
                <InfoIcon className="w-5 h-5 inline-block mr-2" />
                These sections will be prominently featured in your store profile on the mobile app. 
                A compelling story helps attract customers and builds trust with your Latin American audience.
              </p>
            </div>

            <div className="flex items-center justify-between">
              {aboutUsSections.length < 3 && (
                <button
                  type="button"
                  onClick={addAboutUsSection}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add Another Section
                </button>
              )}
            </div>

            {aboutUsSections.map((section, index) => (
              <div key={section.id} className="relative bg-gray-50 rounded-lg p-6">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeAboutUsSection(section.id)}
                    className="absolute -top-2 -right-2 text-red-600 hover:text-red-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`title-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id={`title-${section.id}`}
                      value={section.title}
                      onChange={(e) => setAboutUsSections(prev => prev.map(s => 
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      ))}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        placeholder-gray-400 text-gray-900"
                      placeholder="Enter a title for this section"
                    />
                  </div>

                  <div>
                    <label htmlFor={`description-${section.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id={`description-${section.id}`}
                      value={section.description}
                      onChange={(e) => setAboutUsSections(prev => prev.map(s => 
                        s.id === section.id ? { ...s, description: e.target.value } : s
                      ))}
                      rows={4}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        placeholder-gray-400 text-gray-900"
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
                        <div className="space-y-4 w-full">
                          <img
                            src={section.imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setAboutUsSections(prev => prev.map(s => 
                                s.id === section.id ? { ...s, image: undefined, imagePreview: undefined } : s
                              ));
                              setImageErrors(prev => ({ ...prev, [section.id]: '' }));
                            }}
                            className="text-sm text-red-600 hover:text-red-700 block w-full text-center"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                            <div className="flex items-center">
                              <label
                                htmlFor={`about-image-${section.id}`}
                                className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id={`about-image-${section.id}`}
                                  name={`about-image-${section.id}`}
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e, section.id)}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              PNG, JPG, GIF
                              <span className="font-semibold text-gray-600"> (max 1MB)</span>
                            </p>
                            {imageErrors[section.id] && (
                              <p className="mt-2 text-sm text-red-600">
                                {imageErrors[section.id]}
                              </p>
                            )}
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

        {/* Submit Button */}
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3">
                </div>
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