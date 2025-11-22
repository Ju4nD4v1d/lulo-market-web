import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StoreData } from '../../types/store';
import { queryKeys } from './queryKeys';
import { fetchStoreIdByOwnerId } from '../../utils/storeHelpers';

interface UseStoreByOwnerQueryOptions {
  ownerId: string | undefined;
  enabled?: boolean;
}

interface StoreByOwnerQueryResult {
  storeData: StoreData | null;
  storeId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useStoreByOwnerQuery = ({
  ownerId,
  enabled = true
}: UseStoreByOwnerQueryOptions): StoreByOwnerQueryResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.stores.byOwner(ownerId || ''),
    queryFn: async () => {
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }

      // First get the store ID
      const storeId = await fetchStoreIdByOwnerId(ownerId);

      if (!storeId) {
        return { storeData: null, storeId: null };
      }

      // Then fetch the store document
      const storeRef = doc(db, 'stores', storeId);
      const storeDoc = await getDoc(storeRef);

      if (!storeDoc.exists()) {
        return { storeData: null, storeId };
      }

      const data = storeDoc.data();

      const storeData: StoreData = {
        id: storeDoc.id,
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        cuisine: data.cuisine || data.category || '',
        country: data.country || 'Canada',
        location: data.location || {
          address: '',
          city: '',
          province: '',
          postalCode: '',
          country: 'Canada',
          coordinates: { lat: 0, lng: 0 }
        },
        address: data.address || data.location?.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        instagram: data.instagram || data.socialMedia?.instagram || '',
        facebook: data.facebook || data.socialMedia?.facebook || '',
        twitter: data.twitter || data.socialMedia?.twitter || '',
        socialMedia: data.socialMedia || {},
        businessHours: data.businessHours || {},
        deliveryHours: data.deliveryHours || data.businessHours || {},
        deliveryOptions: data.deliveryOptions || {
          delivery: false,
          pickup: false,
          dineIn: false
        },
        paymentMethods: data.paymentMethods || [],
        cuisineType: data.cuisineType || [],
        priceRange: data.priceRange || '$$',
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        images: data.images || [],
        storeImage: data.storeImage || data.imageUrl || (data.images && data.images[0]) || '',
        imageUrl: data.imageUrl || data.storeImage || (data.images && data.images[0]) || '',
        aboutUs: data.aboutUs || [],
        aboutUsSections: data.aboutUsSections || data.aboutUs || [],
        verified: data.verified || false,
        featured: data.featured || false,
        ownerId: data.ownerId || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };

      return { storeData, storeId };
    },
    enabled: enabled && !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  return {
    storeData: data?.storeData || null,
    storeId: data?.storeId || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};
