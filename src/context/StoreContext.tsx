import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface StoreContextType {
  hasStore: boolean;
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
  const [loading, setLoading] = useState(true);

  const refreshStoreStatus = async () => {
    if (!currentUser) {
      setHasStore(false);
      setLoading(false);
      return;
    }
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('ownerId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    setHasStore(!snapshot.empty);
    setLoading(false);
  };

  useEffect(() => {
    refreshStoreStatus();
  }, [currentUser]);

  return (
    <StoreContext.Provider value={{ hasStore, refreshStoreStatus, setHasStore }}>
      {!loading && children}
    </StoreContext.Provider>
  );
};
