import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Store, MapPin, Phone } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

export const StoreList = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesCollection = collection(db, 'stores'); // Changed from 'Stores' to 'stores'
        const storesSnapshot = await getDocs(storesCollection);
        const storesData = storesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StoreData));
        setStores(storesData);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to fetch stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('storeList.title')}</h2>
      
      {stores.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('storeList.noStores')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {store.name}
                    </h3>
                    {store.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                  </div>
                  <Store className="w-6 h-6 text-primary-600 flex-shrink-0" />
                </div>
                
                {store.address && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{store.address}</span>
                  </div>
                )}
                
                {store.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{store.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};