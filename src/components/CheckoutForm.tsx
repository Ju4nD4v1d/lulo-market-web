import React, { useState } from 'react';
import { ArrowLeft, User, MapPin, CreditCard, ShoppingBag, AlertCircle, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomerInfo, DeliveryAddress, Order, OrderStatus } from '../types/order';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface CheckoutFormProps {
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

interface FormData {
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  orderNotes: string;
  isDelivery: boolean;
  deliveryDate: string;
}

interface FormErrors {
  [key: string]: string;
}


// Helper function to get three closest available delivery dates
const getThreeClosestDeliveryDates = (): Array<{ value: string; label: string }> => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dates: Array<{ value: string; label: string }> = [];
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  // Generate up to 3 dates that are > 24 hours and < 1 week
  for (let i = 0; i < 7 && dates.length < 3; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    // Only include dates within a week
    if (checkDate <= oneWeekFromNow) {
      const dateValue = checkDate.toISOString().split('T')[0];
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Format label based on how far the date is
      let label: string;
      const diffDays = Math.ceil((checkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        label = `Tomorrow, ${monthDay}`;
      } else if (diffDays === 2) {
        label = `${dayName}, ${monthDay}`;
      } else {
        label = `${dayName}, ${monthDay}`;
      }
      
      dates.push({ value: dateValue, label });
    }
  }
  
  return dates;
};

// Helper function to get next available delivery date (more than 24 hours from now)
const getNextAvailableDeliveryDate = (): string => {
  const availableDates = getThreeClosestDeliveryDates();
  if (availableDates.length > 0) {
    return availableDates[0].value;
  }
  
  // Fallback if no dates available within a week
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  return startDate.toISOString().split('T')[0];
};

const initialFormData: FormData = {
  customerInfo: {
    name: '',
    email: '',
    phone: ''
  },
  deliveryAddress: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    deliveryInstructions: ''
  },
  orderNotes: '',
  isDelivery: true,
  deliveryDate: getNextAvailableDeliveryDate()
};

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, onOrderComplete }) => {
  const { cart, clearCart } = useCart();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'address' | 'review'>('info');

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateStep = (step: 'info' | 'address' | 'review'): boolean => {
    const newErrors: FormErrors = {};

    if (step === 'info') {
      if (!formData.customerInfo.name.trim()) {
        newErrors['customerInfo.name'] = t('validation.required');
      }
      if (!formData.customerInfo.email.trim()) {
        newErrors['customerInfo.email'] = t('validation.required');
      } else if (!validateEmail(formData.customerInfo.email)) {
        newErrors['customerInfo.email'] = t('validation.invalidEmail');
      }
      if (!formData.customerInfo.phone.trim()) {
        newErrors['customerInfo.phone'] = t('validation.required');
      } else if (!validatePhone(formData.customerInfo.phone)) {
        newErrors['customerInfo.phone'] = t('validation.invalidPhone');
      }
    }

    if (step === 'address') {
      if (!formData.deliveryAddress.street.trim()) {
        newErrors['deliveryAddress.street'] = t('validation.required');
      }
      if (!formData.deliveryAddress.city.trim()) {
        newErrors['deliveryAddress.city'] = t('validation.required');
      }
      if (!formData.deliveryAddress.province.trim()) {
        newErrors['deliveryAddress.province'] = t('validation.required');
      }
      if (!formData.deliveryAddress.postalCode.trim()) {
        newErrors['deliveryAddress.postalCode'] = t('validation.required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
    
    // Clear error when user starts typing
    const errorKey = typeof formData[section] === 'object' ? `${section}.${field}` : section;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 'info' && validateStep('info')) {
      setCurrentStep('address');
    } else if (currentStep === 'address' && validateStep('address')) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'address') {
      setCurrentStep('info');
    } else if (currentStep === 'review') {
      setCurrentStep('address');
    } else {
      onBack();
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep('review')) return;

    setIsSubmitting(true);
    
    try {
      // Create order object
      const orderData = {
        storeId: cart.storeId!,
        storeName: cart.storeName!,
        customerInfo: formData.customerInfo,
        deliveryAddress: formData.deliveryAddress,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images?.[0],
          price: item.priceAtTime,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        summary: cart.summary,
        status: OrderStatus.PENDING,
        orderNotes: formData.orderNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedDeliveryTime: new Date(formData.deliveryDate),
        paymentStatus: 'pending',
        isDelivery: formData.isDelivery,
        language: t.locale || 'en'
      };

      // Save order to Firebase
      const ordersCollection = collection(db, 'orders');
      const orderDoc = await addDoc(ordersCollection, orderData);
      
      // Create complete order object for callback
      const order: Order = {
        id: orderDoc.id,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDeliveryTime: new Date(formData.deliveryDate)
      };
      
      // Clear cart and redirect to confirmation
      clearCart();
      onOrderComplete(order);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ general: t('order.error.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

  const getErrorMessage = (key: string): string | undefined => {
    return errors[key];
  };

  const StepHeader = () => (
    <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-3xl mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleBack}
            className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 group"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-[#C8E400] transition-colors" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">{t('order.checkout')}</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Step indicators */}
              <div className={`w-2 h-2 rounded-full ${currentStep === 'info' ? 'bg-[#C8E400]' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'address' ? 'bg-[#C8E400]' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-[#C8E400]' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <StepHeader />
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-8 md:py-12">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <StepHeader />
      
      <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6">
              
              {/* Customer Information Step */}
              {currentStep === 'info' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-[#C8E400]" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.customerInfo')}</h2>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.name')} *
                      </label>
                      <input
                        type="text"
                        value={formData.customerInfo.name}
                        onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                          getErrorMessage('customerInfo.name') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.fullName')}
                      />
                      {getErrorMessage('customerInfo.name') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.name')}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.email')} *
                      </label>
                      <input
                        type="email"
                        value={formData.customerInfo.email}
                        onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                          getErrorMessage('customerInfo.email') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.email')}
                      />
                      {getErrorMessage('customerInfo.email') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.email')}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.phone')} *
                      </label>
                      <input
                        type="tel"
                        value={formData.customerInfo.phone}
                        onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                          getErrorMessage('customerInfo.phone') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.phone')}
                      />
                      {getErrorMessage('customerInfo.phone') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('customerInfo.phone')}</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Notice */}
                    <div className="bg-[#C8E400]/10 border border-[#C8E400]/20 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#C8E400]" />
                        <div>
                          <p className="font-medium text-gray-900">{t('orderType.delivery')}</p>
                          <p className="text-sm text-gray-600">{t('checkout.deliveryOnly')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {t('button.continueToDeliveryAddress')}
                  </button>
                </div>
              )}

              {/* Delivery Address Step */}
              {currentStep === 'address' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#C8E400]" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.deliveryAddress')}</h2>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.street')} *
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.street}
                        onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.street') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.street')}
                      />
                      {getErrorMessage('deliveryAddress.street') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.street')}</span>
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.city')} *
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.city}
                        onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                          getErrorMessage('deliveryAddress.city') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder={t('placeholder.city')}
                      />
                      {getErrorMessage('deliveryAddress.city') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage('deliveryAddress.city')}</span>
                        </div>
                      )}
                    </div>

                    {/* Province and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('order.province')} *
                        </label>
                        <select
                          value={formData.deliveryAddress.province}
                          onChange={(e) => handleInputChange('deliveryAddress', 'province', e.target.value)}
                          className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                            getErrorMessage('deliveryAddress.province') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="">{t('placeholder.selectProvince')}</option>
                          <option value="BC">British Columbia</option>
                          <option value="AB">Alberta</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="MB">Manitoba</option>
                          <option value="ON">Ontario</option>
                          <option value="QC">Quebec</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="YT">Yukon</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NU">Nunavut</option>
                        </select>
                        {getErrorMessage('deliveryAddress.province') && (
                          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{getErrorMessage('deliveryAddress.province')}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('order.postalCode')} *
                        </label>
                        <input
                          type="text"
                          value={formData.deliveryAddress.postalCode}
                          onChange={(e) => handleInputChange('deliveryAddress', 'postalCode', e.target.value.toUpperCase())}
                          className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 ${
                            getErrorMessage('deliveryAddress.postalCode') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder={t('placeholder.postalCode')}
                          maxLength={7}
                        />
                        {getErrorMessage('deliveryAddress.postalCode') && (
                          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{getErrorMessage('deliveryAddress.postalCode')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('order.deliveryInstructions')}
                      </label>
                      <textarea
                        value={formData.deliveryAddress.deliveryInstructions}
                        onChange={(e) => handleInputChange('deliveryAddress', 'deliveryInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 resize-none"
                        placeholder={t('placeholder.deliveryInstructions')}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {t('button.reviewOrder')}
                  </button>
                </div>
              )}

              {/* Review Order Step */}
              {currentStep === 'review' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[#C8E400]" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('order.orderSummary')}</h2>
                  </div>

                  {/* Customer Info Review */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('order.customerInfo')}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{formData.customerInfo.name}</p>
                      <p>{formData.customerInfo.email}</p>
                      <p>{formData.customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Delivery Address Review */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('order.deliveryAddress')}</h3>
                    <div className="text-sm text-gray-600">
                      <p>{formData.deliveryAddress.street}</p>
                      <p>{formData.deliveryAddress.city}, {formData.deliveryAddress.province} {formData.deliveryAddress.postalCode}</p>
                      <p>{formData.deliveryAddress.country}</p>
                      {formData.deliveryAddress.deliveryInstructions && (
                        <p className="mt-2 italic">{formData.deliveryAddress.deliveryInstructions}</p>
                      )}
                    </div>
                  </div>


                  {/* Delivery Date Selection */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('checkout.selectDeliveryDate')}
                    </h3>
                    <div className="space-y-2">
                      {getThreeClosestDeliveryDates().length > 0 ? (
                        getThreeClosestDeliveryDates().map((dateOption) => (
                          <label key={dateOption.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryDate"
                              value={dateOption.value}
                              checked={formData.deliveryDate === dateOption.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-blue-300"
                            />
                            <span className="text-sm text-blue-900 font-medium">{dateOption.label}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-blue-700">No delivery dates available within the next week.</p>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Delivery available from tomorrow onwards. Select your preferred date.
                    </p>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order.orderNotes')}
                    </label>
                    <textarea
                      value={formData.orderNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNotes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-4 focus:ring-[#C8E400]/20 focus:border-[#C8E400] focus:outline-none transition-all duration-300 resize-none"
                      placeholder={t('placeholder.orderNotes')}
                    />
                  </div>

                  {getErrorMessage('general') && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getErrorMessage('general')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6 sticky top-24 max-h-[80vh] flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('order.orderSummary')}</h3>
              
              {/* Store Info */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">{cart.storeName}</p>
                <p className="text-sm text-gray-600">{t('orderType.delivery')}</p>
              </div>

              {/* Items - Scrollable */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">{t('order.quantity')}: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.priceAtTime * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('order.subtotal')}</span>
                  <span className="font-medium">{formatPrice(cart.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('order.tax')}</span>
                  <span className="font-medium">{formatPrice(cart.summary.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('order.deliveryFee')}</span>
                  <span className="font-medium">{formatPrice(cart.summary.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>{t('order.total')}</span>
                  <span className="text-[#C8E400]">{formatPrice(cart.summary.total)}</span>
                </div>
              </div>

              {/* Place Order Button - Only show in review step */}
              {currentStep === 'review' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {getErrorMessage('general') && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getErrorMessage('general')}</span>
                    </div>
                  )}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-3 md:py-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    ) : (
                      t('order.placeOrder')
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};