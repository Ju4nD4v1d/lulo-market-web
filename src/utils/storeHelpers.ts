import { StoreData } from '../types/store';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Check if a store is new (created less than a month ago)
 */
export const isStoreNew = (createdAt?: Date): boolean => {
  if (!createdAt) return false;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return createdAt > oneMonthAgo;
};

/**
 * Fetch store ID by owner ID
 * @param ownerId - The owner's user ID
 * @returns The store ID if found, null otherwise
 * @throws Error if there's a Firebase error
 */
export const fetchStoreIdByOwnerId = async (ownerId: string): Promise<string | null> => {
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error fetching store by owner ID:', error);
    throw error;
  }
};

/**
 * Calculate distance between user location and store
 * Uses the Haversine formula to calculate distance on Earth's surface
 */
export const calculateDistance = (
  userLocation: { lat: number; lng: number } | null,
  store?: StoreData
): string => {
  if (!userLocation || !store?.location?.coordinates) {
    return 'Near you';
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (store.location.coordinates.lat - userLocation.lat) * Math.PI / 180;
  const dLon = (store.location.coordinates.lng - userLocation.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLocation.lat * Math.PI / 180) *
      Math.cos(store.location.coordinates.lat * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return 'Less than 1 km';
  } else {
    return `${distance.toFixed(1)} km`;
  }
};
