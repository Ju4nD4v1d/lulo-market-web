import React, { useState, useEffect } from 'react';
import { Store, Upload } from 'lucide-react';
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

export const StoreSetup = () => {
  const { currentUser } = useAuth();
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
    deliveryCostWithDiscount: 0,
    imageUrl: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      if (userStore) {
        // Update existing store
        const storeRef = doc(db, 'Stores', userStore.id);
        await updateDoc(storeRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        setSuccess('Store updated successfully!');
      } else {
        // Create new store
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
            Store Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
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