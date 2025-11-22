import type * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface StoreContextType {
  hasStore: boolean;
  storeId: string | null;
  refreshStoreStatus: () => Promise<void>;
  setHasStore: React.Dispatch<React.SetStateAction<boolean>>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [hasStore, setHasStore] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStoreStatus = async () => {
    if (!currentUser) {
      setHasStore(false);
      setStoreId(null);
      setLoading(false);
      return;
    }
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('ownerId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      setHasStore(true);
      setStoreId(snapshot.docs[0].id);
    } else {
      setHasStore(false);
      setStoreId(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshStoreStatus();
  }, [currentUser]);

  return (
    <StoreContext.Provider value={{ hasStore, storeId, refreshStoreStatus, setHasStore }}>
      {!loading && children}
    </StoreContext.Provider>
  );
};
