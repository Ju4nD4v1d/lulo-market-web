import React, { useState, useEffect } from 'react';
import { LogOut, User, Plus, Store, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/company';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface StoreData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  ownerId: string;
}

export const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userStore, setUserStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        const storesRef = collection(db, 'Stores');
        const q = query(storesRef, where('ownerId', '==', currentUser?.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          setUserStore({ id: storeDoc.id, ...storeDoc.data() } as StoreData);
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

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#login';
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim()) {
      setFormError('Store name is required');
      return;
    }

    try {
      const storeData = {
        ...formData,
        ownerId: currentUser?.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'Stores'), storeData);
      setUserStore({ id: docRef.id, ...storeData } as StoreData);
      setFormSuccess('Store created successfully!');
      setShowCreateForm(false);
    } catch (err) {
      setFormError('Failed to create store. Please try again.');
    }
  };

  if (!currentUser) {
    window.location.hash = '#login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{COMPANY_NAME}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-2" />
                <span>{currentUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Store Management</h2>
            {!userStore && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          ) : showCreateForm ? (
            <form onSubmit={handleCreateStore} className="space-y-6">
              {formError && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">{formError}</div>
              )}
              {formSuccess && (
                <div className="text-green-600 bg-green-50 p-4 rounded-lg">{formSuccess}</div>
              )}
              
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
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter store phone"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Store
                </button>
              </div>
            </form>
          ) : userStore ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {userStore.name}
                  </h3>
                  {userStore.description && (
                    <p className="text-gray-600 mb-4">{userStore.description}</p>
                  )}
                </div>
                <Store className="w-6 h-6 text-primary-600" />
              </div>
              
              {userStore.address && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{userStore.address}</span>
                </div>
              )}
              
              {userStore.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{userStore.phone}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You haven't created a store yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};