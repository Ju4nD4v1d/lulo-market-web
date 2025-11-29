import type * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import * as storeApi from '../services/api/storeApi';
import { useAuth } from './AuthContext';
import { StoreData } from '../types/store';

interface StoreContextType {
  hasStore: boolean;
  storeId: string | null;
  store: StoreData | null;
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
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStoreStatus = async () => {
    if (!currentUser) {
      setHasStore(false);
      setStoreId(null);
      setStore(null);
      setLoading(false);
      return;
    }

    try {
      const result = await storeApi.getStoreByOwnerWithData(currentUser.uid);
      if (result.storeId && result.storeData) {
        setHasStore(true);
        setStoreId(result.storeId);
        setStore(result.storeData);
      } else {
        setHasStore(false);
        setStoreId(null);
        setStore(null);
      }
    } catch (error) {
      console.error('Error checking store status:', error);
      setHasStore(false);
      setStoreId(null);
      setStore(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshStoreStatus();
  }, [currentUser]);

  return (
    <StoreContext.Provider value={{ hasStore, storeId, store, refreshStoreStatus, setHasStore }}>
      {!loading && children}
    </StoreContext.Provider>
  );
};
