import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail,
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
  AlertCircle,
  Camera,
  CheckCircle2,
  Heart,
  Star,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../config/theme';
import { StoreData } from '../types/store';

interface StoreFormProps {
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  storeImage: {
    file?: File;
    preview?: string;
    url?: string;
  };
  handleImageUpload: (file: File) => void;
  removeStoreImage?: () => void;
  updateAboutSection: (index: number, field: string, value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  saving: boolean;
  error: string | null;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  storeData,
  setStoreData,
  storeImage,
  handleImageUpload,
  removeStoreImage,
  updateAboutSection,
  onSave,
  onCancel,
  saving,
  error
}) => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PNG and JPG files are allowed';
    }
    
    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 2MB';
    }
    
    return null;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleRemoveStoreImage = () => {
    if (removeStoreImage) {
      removeStoreImage();
    }
  };

  const addAboutSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: ''
    };
    setStoreData({
      ...storeData,
      aboutUsSections: [...storeData.aboutUsSections, newSection]
    });
  };

  const removeAboutSection = (index: number) => {
    const updatedSections = storeData.aboutUsSections.filter((_, i) => i !== index);
    setStoreData({ ...storeData, aboutUsSections: updatedSections });
  };

  const handleSectionImageUpload = (index: number, file: File) => {
    const error = validateFile(file);
    
    if (error) {
      alert(error);
      return;
    }
    
    const updatedSections = [...storeData.aboutUsSections];
    const imageUrl = URL.createObjectURL(file);
    updatedSections[index] = { 
      ...updatedSections[index], 
      image: file,
      imagePreview: imageUrl
    };
    setStoreData({ ...storeData, aboutUsSections: updatedSections });
  };

  const removeSectionImage = (index: number) => {
    const updatedSections = [...storeData.aboutUsSections];
    updatedSections[index] = { 
      ...updatedSections[index], 
      image: undefined,
      imagePreview: undefined,
      imageUrl: ''
    };
    setStoreData({ ...storeData, aboutUsSections: updatedSections });
  };

  const nextStage = () => {
    if (currentStage < 3) {
      setCurrentStage(currentStage + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const isStageComplete = (stage: number) => {
    switch (stage) {
      case 1:
        return storeData.name.trim() !== '' && 
               storeData.description.trim() !== '' && 
               storeData.cuisine && 
               storeData.cuisine.trim() !== '';
      case 2:
        return storeData.phone && storeData.phone.trim() !== '' && 
               storeData.email && storeData.email.trim() !== '' &&
               storeData.address && storeData.address.trim() !== '';
      case 3:
        return storeData.aboutUsSections.some(section => 
          (section.title && section.title.trim() !== '') || 
          (section.description && section.description.trim() !== '')
        );
      default:
        return false;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Enhanced Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Store Setup Progress</h2>
            <div className="text-sm text-gray-500">
              Stage {currentStage} of 3
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            {/* Stage 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                currentStage >= 1 
                  ? isStageComplete(1)
                    ? 'bg-green-500 shadow-lg scale-110'
                    : 'bg-primary-400 shadow-lg scale-110'
                  : 'bg-gray-200'
              }`}>
                {isStageComplete(1) ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <Store className={`w-6 h-6 ${currentStage >= 1 ? 'text-white' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="text-center">
                <p className={`font-semibold text-sm ${currentStage >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('store.basicInfo')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('store.basicInfoSubtitle')}</p>
              </div>
            </div>

            {/* Connector 1 */}
            <div className={`h-1 flex-1 mx-4 rounded transition-colors duration-300 ${
              currentStage > 1 ? 'bg-primary-400' : 'bg-gray-200'
            }`}></div>

            {/* Stage 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                currentStage >= 2 
                  ? isStageComplete(2)
                    ? 'bg-green-500 shadow-lg scale-110'
                    : 'bg-primary-400 shadow-lg scale-110'
                  : 'bg-gray-200'
              }`}>
                {isStageComplete(2) ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <Phone className={`w-6 h-6 ${currentStage >= 2 ? 'text-white' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="text-center">
                <p className={`font-semibold text-sm ${currentStage >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('store.contactInfo')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('store.contactInfoSubtitle')}</p>
              </div>
            </div>

            {/* Connector 2 */}
            <div className={`h-1 flex-1 mx-4 rounded transition-colors duration-300 ${
              currentStage > 2 ? 'bg-primary-400' : 'bg-gray-200'
            }`}></div>

            {/* Stage 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                currentStage >= 3 
                  ? isStageComplete(3)
                    ? 'bg-green-500 shadow-lg scale-110'
                    : 'bg-primary-400 shadow-lg scale-110'
                  : 'bg-gray-200'
              }`}>
                {isStageComplete(3) ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <Heart className={`w-6 h-6 ${currentStage >= 3 ? 'text-white' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="text-center">
                <p className={`font-semibold text-sm ${currentStage >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('store.aboutSections')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('store.aboutSectionsSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 1: Basic Information */}
        {currentStage === 1 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden animate-[slideInRight_0.5s_ease-out]">
          <div className="bg-gradient-to-r from-primary-400/5 to-primary-500/5 px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl shadow-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('store.basicInfo')}</h2>
                <p className="text-sm text-gray-600">Tell customers about your amazing store</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary-400" />
                  {t('store.name')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={storeData.name}
                    onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 group-hover:shadow-md"
                    placeholder={t('store.namePlaceholder')}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  {t('store.category')}
                </label>
                <div className="relative">
                  <select
                    value={storeData.category || ''}
                    onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 group-hover:border-gray-300 bg-white"
                  >
                    <option value="">{t('store.selectCategory')}</option>
                    <option value="restaurant">{t('store.category.restaurant')}</option>
                    <option value="grocery">{t('store.category.grocery')}</option>
                    <option value="bakery">{t('store.category.bakery')}</option>
                    <option value="other">{t('store.category.other')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary-400" />
                  {t('store.cuisine')}
                </label>
                <div className="relative">
                  <select
                    value={storeData.cuisine || ''}
                    onChange={(e) => setStoreData({ ...storeData, cuisine: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 group-hover:border-gray-300 bg-white"
                  >
                    <option value="">{t('store.cuisinePlaceholder')}</option>
                    <option value="mexican">{t('store.cuisine.mexican')}</option>
                    <option value="colombian">{t('store.cuisine.colombian')}</option>
                    <option value="venezuelan">{t('store.cuisine.venezuelan')}</option>
                    <option value="peruvian">{t('store.cuisine.peruvian')}</option>
                    <option value="ecuadorian">{t('store.cuisine.ecuadorian')}</option>
                    <option value="argentinian">{t('store.cuisine.argentinian')}</option>
                    <option value="chilean">{t('store.cuisine.chilean')}</option>
                    <option value="brazilian">{t('store.cuisine.brazilian')}</option>
                    <option value="dominican">{t('store.cuisine.dominican')}</option>
                    <option value="guatemalan">{t('store.cuisine.guatemalan')}</option>
                    <option value="honduran">{t('store.cuisine.honduran')}</option>
                    <option value="salvadoran">{t('store.cuisine.salvadoran')}</option>
                    <option value="nicaraguan">{t('store.cuisine.nicaraguan')}</option>
                    <option value="costarican">{t('store.cuisine.costarican')}</option>
                    <option value="panamanian">{t('store.cuisine.panamanian')}</option>
                    <option value="cuban">{t('store.cuisine.cuban')}</option>
                    <option value="puerto_rican">{t('store.cuisine.puerto_rican')}</option>
                    <option value="fusion">{t('store.cuisine.fusion')}</option>
                    <option value="other">{t('store.cuisine.other')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary-400" />
                {t('store.description')}
              </label>
              <div className="relative">
                <textarea
                  value={storeData.description}
                  onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 resize-none"
                  placeholder={t('store.descriptionPlaceholder')}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {storeData.description.length}/200
                </div>
              </div>
            </div>

            {/* Store Image Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary-400" />
                {t('store.image')}
              </label>
              <div
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-primary-400 bg-gradient-to-br from-primary-400/10 to-primary-500/5 shadow-lg' 
                    : 'border-gray-300 hover:border-primary-400/50 hover:bg-gray-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {storeImage.preview || storeImage.url ? (
                  <div className="relative inline-block">
                    <div className="relative group cursor-pointer">
                      <img
                        src={storeImage.preview || storeImage.url}
                        alt="Store"
                        className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Change Image</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Change store image"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveStoreImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-2xl">
                      <Upload className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">{t('store.uploadImage')}</p>
                      <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileInput}
                      className="hidden"
                      id="store-image"
                    />
                    <label
                      htmlFor="store-image"
                      className="btn-primary inline-flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Camera className="w-4 h-4" />
                      {t('store.selectImage')}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Stage 2: Contact Information */}
        {currentStage === 2 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden animate-[slideInRight_0.5s_ease-out]">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('store.contactInfo')}</h2>
                <p className="text-sm text-gray-600">How customers can reach you</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-400" />
                  {t('store.phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={storeData.phone || ''}
                    onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
                    placeholder={t('store.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-400" />
                  {t('store.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={storeData.email || ''}
                    onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-400/20 focus:border-primary-400 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
                    placeholder={t('store.emailPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                {t('store.address')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeData.address || ''}
                  onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
                  placeholder={t('store.addressPlaceholder')}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                {t('store.website')}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={storeData.website || ''}
                  onChange={(e) => setStoreData({ ...storeData, website: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300"
                  placeholder={t('store.websitePlaceholder')}
                />
              </div>
            </div>

            {/* Delivery Hours */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                {t('store.deliveryHours')}
              </label>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {Object.entries(storeData.deliveryHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-700">
                      {t(`day.${day.toLowerCase()}`)}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => {
                          const updatedHours = {
                            ...storeData.deliveryHours,
                            [day]: { ...hours, closed: !e.target.checked }
                          };
                          setStoreData({ ...storeData, deliveryHours: updatedHours });
                        }}
                        className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400" style={{accentColor: theme.colors.primary400}}
                      />
                      <span className="text-sm text-gray-600 w-12">{t('store.open')}</span>
                    </div>
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => {
                            const updatedHours = {
                              ...storeData.deliveryHours,
                              [day]: { ...hours, open: e.target.value }
                            };
                            setStoreData({ ...storeData, deliveryHours: updatedHours });
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-colors"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => {
                            const updatedHours = {
                              ...storeData.deliveryHours,
                              [day]: { ...hours, close: e.target.value }
                            };
                            setStoreData({ ...storeData, deliveryHours: updatedHours });
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-colors"
                        />
                      </>
                    )}
                    {hours.closed && (
                      <span className="text-red-600 text-sm font-medium">{t('store.closed')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Stage 3: About Sections */}
        {currentStage === 3 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden animate-[slideInRight_0.5s_ease-out]">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('store.aboutSections')}</h2>
                  <p className="text-sm text-gray-600">Share your story with customers</p>
                </div>
              </div>
              {storeData.aboutUsSections.length < 3 && (
                <button
                  type="button"
                  onClick={addAboutSection}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t('store.addSection')}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {storeData.aboutUsSections.map((section, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 relative border border-gray-200/50 shadow-sm">
                <button
                  type="button"
                  onClick={() => removeAboutSection(index)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-4 pr-12">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      {t('store.sectionTitle')}
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateAboutSection(index, 'title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 bg-white"
                      placeholder={t('store.sectionTitlePlaceholder')}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-purple-500" />
                      {t('store.sectionDescription')}
                    </label>
                    <textarea
                      value={section.description}
                      onChange={(e) => updateAboutSection(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-gray-300 bg-white resize-none"
                      placeholder={t('store.sectionDescriptionPlaceholder')}
                    />
                  </div>

                  {/* Section Image Upload */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-purple-500" />
                      {t('store.sectionImage')}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
                      {section.imagePreview || section.imageUrl ? (
                        <div className="relative inline-block">
                          <div className="relative group cursor-pointer">
                            <img
                              src={section.imagePreview || section.imageUrl}
                              alt="Section"
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                              <div className="text-center text-white">
                                <Camera className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs font-medium">Change</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleSectionImageUpload(index, e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title="Change section image"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSectionImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">{t('store.uploadSectionImage')}</p>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSectionImageUpload(index, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            id={`section-image-${index}`}
                          />
                          <label
                            htmlFor={`section-image-${index}`}
                            className="inline-flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors text-sm"
                          >
                            <Upload className="w-4 h-4" />
                            Select Image
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {storeData.aboutUsSections.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No sections added yet</p>
                <button
                  type="button"
                  onClick={addAboutSection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add your first section
                </button>
              </div>
            )}
            
            {storeData.aboutUsSections.length === 3 && (
              <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <Heart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-600 font-medium">Maximum 3 sections reached</p>
                <p className="text-sm text-purple-500">You can edit or remove existing sections</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Enhanced Navigation Buttons */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStage > 1 && (
                <button
                  type="button"
                  onClick={prevStage}
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
{t('store.previous')}
                </button>
              )}
              
              {onCancel && currentStage === 1 && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('store.cancel')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStage < 3 ? (
                <button
                  type="button"
                  onClick={nextStage}
                  disabled={!isStageComplete(currentStage)}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
{t('store.nextStage')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || !isStageComplete(3)}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? t('store.saving') : t('store.save')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
