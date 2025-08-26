import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin,
  Phone,
  Globe,
  Clock,
  Building2,
  Edit3,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { StoreForm } from './StoreForm';
import { collection, addDoc, GeoPoint, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SaveProgressModal } from './SaveProgressModal';
import { useStore } from '../context/StoreContext';
import { StoreData } from '../types/store';

const defaultDeliveryHours = {
  Sunday: { open: "09:00", close: "21:00", closed: false },
  Monday: { open: "09:00", close: "18:00", closed: false },
  Tuesday: { open: "09:00", close: "18:00", closed: true },
  Wednesday: { open: "09:00", close: "18:00", closed: true },
  Thursday: { open: "09:00", close: "18:00", closed: true },
  Friday: { open: "09:00", close: "18:00", closed: true },
  Saturday: { open: "09:00", close: "18:00", closed: true }
};

const initialStoreData: StoreData = {
  id: '',
  name: '',
  description: '',
  category: '',
  cuisine: '',
  phone: '',
  email: '',
  website: '',
  aboutUsSections: [
    { id: '1', title: '', description: '', imageUrl: '' },
    { id: '2', title: '', description: '', imageUrl: '' },
    { id: '3', title: '', description: '', imageUrl: '' }
  ],
  ownerId: '',
  deliveryHours: defaultDeliveryHours
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

const getDayName = (day: string, t: (key: string) => string) => {
  const dayMap: { [key: string]: string } = {
    'Sunday': t('day.sunday'),
    'Monday': t('day.monday'),
    'Tuesday': t('day.tuesday'),
    'Wednesday': t('day.wednesday'),
    'Thursday': t('day.thursday'),
    'Friday': t('day.friday'),
    'Saturday': t('day.saturday')
  };
  return dayMap[day] || day;
};

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
  const { hasStore, storeId, refreshStoreStatus } = useStore();
  const [storeStats, setStoreStats] = useState({
    productCount: 0,
    orderCount: 0,
    rating: 0,
    status: 'Active',
    loading: true
  });

  // Load existing store data and stats
  useEffect(() => {
    const loadStoreData = async () => {
      if (!currentUser) return;

      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          const data = storeDoc.data();
          const currentStoreId = storeDoc.id;
          
          // Transform data to match our interface
          const transformedData: StoreData = {
            id: currentStoreId,
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            cuisine: data.cuisine || '',
            country: data.country || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || '',
            address: data.location?.address || '',
            deliveryHours: data.businessHours || defaultDeliveryHours,
            aboutUsSections: data.aboutUsSections?.map((section: { id?: string; title?: string; content?: string; imageUrl?: string }, index: number) => ({
              id: section.id || `${index + 1}`,
              title: section.title || '',
              description: section.content || '',
              imageUrl: section.imageUrl || ''
            })) || initialStoreData.aboutUsSections,
            imageUrl: data.storeImage || data.imageUrl || '',
            storeImage: data.storeImage || data.imageUrl || '',
            ownerId: currentUser.uid
          };

          console.log('Loading store data:', {
            originalData: data,
            transformedData,
            cuisine: transformedData.cuisine,
            country: transformedData.country
          });
          setStoreData(transformedData);
          
          if (transformedData.storeImage) {
            setStoreImage({ url: transformedData.storeImage });
          }

          // Load store statistics
          await loadStoreStats(currentStoreId);
        }
      } catch (error) {
        console.error('Error loading store data:', error);
      }
    };

    loadStoreData();
  }, [currentUser]);

  // Load store statistics
  const loadStoreStats = async (storeId: string) => {
    setStoreStats(prev => ({ ...prev, loading: true }));
    
    try {
      // Get product count
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', storeId));
      const productsSnapshot = await getDocs(productsQuery);
      const productCount = productsSnapshot.size;

      // Get order count
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(ordersRef, where('storeId', '==', storeId));
      const ordersSnapshot = await getDocs(ordersQuery);
      const orderCount = ordersSnapshot.size;

      // Calculate average rating (simplified - using mock data for now)
      const rating = 4.8; // This would typically be calculated from order reviews

      setStoreStats({
        productCount,
        orderCount,
        rating,
        status: 'Active',
        loading: false
      });
    } catch (error) {
      console.error('Error loading store stats:', error);
      setStoreStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStoreImage({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeStoreImage = () => {
    setStoreImage({});
  };

  const saveStore = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError(null);
    setSaveStep('saving');

    try {
      // Small delay to show the saving step
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaveStep('uploading');
      
      let storeImageUrl = storeImage.url || '';
      
      if (storeImage.file) {
        const imageRef = ref(storage, `stores/${currentUser.uid}/main-image`);
        await uploadBytes(imageRef, storeImage.file);
        storeImageUrl = await getDownloadURL(imageRef);
      }

      // Upload section images
      const sectionsWithImages = await Promise.all(
        storeData.aboutUsSections
          .filter(section => section.title || section.description) // Only include sections with content
          .map(async (section, index) => {
            let sectionImageUrl = section.imageUrl || '';
            
            // If there's a new image file, upload it
            if (section.image) {
              const sectionImageRef = ref(storage, `stores/${currentUser.uid}/sections/section-${section.id || index}`);
              await uploadBytes(sectionImageRef, section.image);
              sectionImageUrl = await getDownloadURL(sectionImageRef);
            }
            
            return {
              id: section.id || `section-${index}`,
              title: section.title || '',
              content: section.description || '',
              imageUrl: sectionImageUrl,
              order: index
            };
          })
      );

      // Small delay to show uploading step
      await new Promise(resolve => setTimeout(resolve, 300));
      setSaveStep('finalizing');

      const storeDocData = {
        name: storeData.name || '',
        description: storeData.description || '',
        cuisine: storeData.cuisine || '',
        location: {
          address: storeData.address || '',
          coordinates: new GeoPoint(49.2827, -123.1207) // Default to Vancouver
        },
        phone: storeData.phone || '',
        email: storeData.email || '',
        website: storeData.website || '',
        businessHours: storeData.deliveryHours || {},
        aboutUsSections: sectionsWithImages,
        storeImage: storeImageUrl || '',
        imageUrl: storeImageUrl || '',
        ownerId: currentUser.uid,
        isVerified: false,
        updatedAt: new Date()
      };

      // Double-check we have a valid storeId for existing stores
      let actualStoreId = storeId;
      if (!actualStoreId && hasStore && currentUser) {
        console.log('StoreId missing from context, fetching directly...');
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          actualStoreId = snapshot.docs[0].id;
          console.log('Found storeId from direct query:', actualStoreId);
        }
      }
      
      console.log('Save operation details:', {
        hasStore,
        storeId: actualStoreId,
        operation: hasStore && actualStoreId ? 'UPDATE' : 'CREATE',
        storeDataName: storeData.name
      });
      
      if (hasStore && actualStoreId) {
        // Update existing store
        console.log('Updating existing store with ID:', actualStoreId);
        const storeDocRef = doc(db, 'stores', actualStoreId);
        await updateDoc(storeDocRef, storeDocData);
        console.log('Store updated successfully');
      } else {
        // Create new store
        console.log('Creating new store');
        const storeRef = collection(db, 'stores');
        const docRef = await addDoc(storeRef, {
          ...storeDocData,
          createdAt: new Date()
        });
        console.log('New store created with ID:', docRef.id);
        // The global context will be updated after refreshStoreStatus is called
      }
      
      setSaveStep('complete');
      
      // Ensure context is refreshed with latest store data
      await refreshStoreStatus();
      
      // Keep the success message visible longer
      setTimeout(() => {
        setSaving(false);
        setIsEditing(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving store:', error);
      setError('Failed to save store. Please try again.');
      setSaving(false);
    }
  };

  const updateAboutSection = (index: number, field: string, value: string) => {
    const updatedSections = [...storeData.aboutUsSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setStoreData({ ...storeData, aboutUsSections: updatedSections });
  };

  // Filter out empty about sections for display
  const aboutItems = storeData.aboutUsSections.filter(item => item.title || item.description || item.imageUrl);

  if (saving) {
    return (
      <SaveProgressModal 
        isOpen={saving} 
        currentStep={saveStep} 
        onComplete={() => {
          setSaving(false);
          setSaveStep('saving');
          // Redirect to dashboard after successful creation
          window.location.hash = '#dashboard/products';
        }}
      />
    );
  }

  if (!isEditing && hasStore) {
    // Enhanced Store Profile View
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Store Image */}
                <div className="relative">
                  {storeData.storeImage ? (
                    <img
                      src={storeData.storeImage}
                      alt="Store"
                      className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-2xl shadow-lg border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <Store className="w-8 h-8 lg:w-12 lg:h-12 text-primary-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Store Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{storeData.name}</h1>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      {t('store.dashboard.active')}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 max-w-lg">{storeData.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{storeData.cuisine ? t(`store.cuisine.${storeData.cuisine}`) : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{t('store.dashboard.joined')} 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary inline-flex items-center gap-2 font-semibold"
              >
                <Edit3 className="w-5 h-5" />
                {t('store.dashboard.editStore')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('store.dashboard.storeStatus')}</p>
                  {storeStats.loading ? (
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{t('store.dashboard.active')}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('store.dashboard.products')}</p>
                  {storeStats.loading ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{storeStats.productCount}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('store.dashboard.orders')}</p>
                  {storeStats.loading ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{storeStats.orderCount}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('store.dashboard.rating')}</p>
                  {storeStats.loading ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-yellow-600">{storeStats.rating}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-400/10 to-primary-500/10 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('store.dashboard.basicInfo')}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t('store.dashboard.storeName')}</label>
                      <p className="text-gray-900 font-medium">{storeData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t('store.dashboard.cuisine')}</label>
                      <p className="text-gray-900">{storeData.cuisine ? t(`store.cuisine.${storeData.cuisine}`) : ''}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">{t('store.dashboard.description')}</label>
                    <p className="text-gray-900 leading-relaxed">{storeData.description}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('store.dashboard.contactInfo')}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('store.dashboard.address')}</p>
                      <p className="text-gray-900">{storeData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('store.dashboard.phone')}</p>
                      <p className="text-gray-900">{storeData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('store.dashboard.website')}</p>
                      <a 
                        href={storeData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-500 flex items-center gap-1"
                      >
                        {storeData.website}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Us Section */}
              {aboutItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {aboutItems.map((item, i) => (
                        <div key={i} className="text-center">
                          {(item.imageUrl || item.imagePreview) ? (
                            <img
                              src={item.imageUrl || item.imagePreview}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-2xl mx-auto mb-4 shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Delivery Hours */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('store.dashboard.deliveryHours')}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {daysOrder.map(day => (
                    <div key={day} className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700">{getDayName(day, t)}</span>
                      {storeData.deliveryHours[day].closed ? (
                        <span className="text-red-600 font-medium">{t('store.dashboard.closed')}</span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          {storeData.deliveryHours[day].open} - {storeData.deliveryHours[day].close}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('store.dashboard.quickActions')}</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.hash = '#dashboard/products'}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-md transition-all duration-300"
                  >
                    {t('store.dashboard.manageProducts')}
                  </button>
                  <button 
                    onClick={() => window.location.hash = '#dashboard/orders'}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-md transition-all duration-300"
                  >
                    {t('store.dashboard.viewOrders')}
                  </button>
                  <button 
                    onClick={() => window.location.hash = '#dashboard/metrics'}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:shadow-md transition-all duration-300"
                  >
                    {t('store.dashboard.analytics')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode / Initial Setup Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {hasStore ? t('store.edit.title') : t('store.create.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {hasStore ? t('store.edit.subtitle') : t('store.create.subtitle')}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <StoreForm
            storeData={storeData}
            setStoreData={setStoreData}
            storeImage={storeImage}
            handleImageUpload={handleImageUpload}
            removeStoreImage={removeStoreImage}
            updateAboutSection={updateAboutSection}
            onSave={saveStore}
            onCancel={hasStore ? () => setIsEditing(false) : undefined}
            saving={saving}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
