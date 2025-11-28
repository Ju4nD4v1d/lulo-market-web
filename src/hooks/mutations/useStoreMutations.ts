/**
 * TanStack Query mutations for store operations
 * Uses storeApi for data mutations and storageApi for image uploads
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StoreData } from '../../types';
import { queryKeys } from '../queries';
import * as storeApi from '../../services/api/storeApi';
import * as storageApi from '../../services/api/storageApi';

interface StoreMutationVariables {
  storeData: StoreData;
  storeImage?: { file?: File };
  storeId?: string;
  currentUserId: string;
}

export const useStoreMutations = (ownerId: string) => {
  const queryClient = useQueryClient();

  const createStore = useMutation({
    mutationFn: async ({ storeData, storeImage, currentUserId }: StoreMutationVariables) => {
      // Upload main store image if provided
      let mainImageUrl = '';
      if (storeImage?.file) {
        mainImageUrl = await storageApi.uploadStoreImage(storeImage.file, currentUserId);
      }

      // Upload about section images if provided
      const processedAboutUs = await storageApi.uploadAboutSectionImages(
        storeData.aboutUs || [],
        currentUserId
      );

      // Prepare store data for API
      const createData: storeApi.CreateStoreData = {
        name: storeData.name,
        description: storeData.description,
        category: storeData.category,
        cuisine: storeData.cuisine,
        location: {
          address: storeData.location.address,
          city: storeData.location?.city || '',
          province: storeData.location?.province || '',
          postalCode: storeData.location?.postalCode || '',
          coordinates: storeData.location.coordinates,
          placeId: storeData.location?.placeId || '',
        },
        phone: storeData.phone || '',
        email: storeData.email || '',
        website: storeData.website || '',
        instagram: storeData.instagram,
        facebook: storeData.facebook,
        twitter: storeData.twitter,
        socialMedia: storeData.socialMedia,
        businessHours: storeData.businessHours || {},
        deliveryHours: storeData.deliveryHours || {},
        deliveryOptions: storeData.deliveryOptions || {},
        paymentMethods: storeData.paymentMethods || [],
        cuisineType: storeData.cuisineType || [],
        priceRange: storeData.priceRange || '$$',
        rating: storeData.rating || 0,
        reviewCount: storeData.reviewCount || 0,
        images: mainImageUrl ? [mainImageUrl] : [],
        storeImage: mainImageUrl || '',
        imageUrl: mainImageUrl || '',
        aboutUs: processedAboutUs,
        ownerId: currentUserId,
      };

      return storeApi.createStore(createData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.byOwner(ownerId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.lists(),
      });
    },
  });

  const updateStore = useMutation({
    mutationFn: async ({ storeId, storeData, storeImage, currentUserId }: StoreMutationVariables & { storeId: string }) => {
      // Upload new main image if provided
      let mainImageUrl = storeData.images?.[0] || '';
      if (storeImage?.file) {
        mainImageUrl = await storageApi.uploadStoreImage(storeImage.file, currentUserId);
      }

      // Upload about section images if provided
      const processedAboutUs = await storageApi.uploadAboutSectionImages(
        storeData.aboutUs || [],
        currentUserId
      );

      // Prepare update data for API
      const updateData: storeApi.UpdateStoreData = {
        name: storeData.name,
        description: storeData.description,
        category: storeData.category,
        cuisine: storeData.cuisine,
        location: {
          address: storeData.location.address,
          city: storeData.location?.city || '',
          province: storeData.location?.province || '',
          postalCode: storeData.location?.postalCode || '',
          coordinates: storeData.location.coordinates,
          placeId: storeData.location?.placeId || '',
        },
        phone: storeData.phone || '',
        email: storeData.email || '',
        website: storeData.website || '',
        instagram: storeData.instagram,
        facebook: storeData.facebook,
        twitter: storeData.twitter,
        socialMedia: storeData.socialMedia,
        deliveryHours: storeData.deliveryHours || {},
        deliveryOptions: storeData.deliveryOptions || {},
        paymentMethods: storeData.paymentMethods || [],
        images: mainImageUrl ? [mainImageUrl] : storeData.images || [],
        storeImage: mainImageUrl || storeData.storeImage || (storeData.images?.[0] || ''),
        imageUrl: mainImageUrl || storeData.imageUrl || (storeData.images?.[0] || ''),
        aboutUs: processedAboutUs,
      };

      return storeApi.updateStore(storeId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.byOwner(ownerId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.lists(),
      });
    },
  });

  const saveStore = async (
    storeData: StoreData,
    storeImage: { file?: File },
    currentUserId: string,
    storeId?: string
  ) => {
    if (storeId) {
      return updateStore.mutateAsync({ storeId, storeData, storeImage, currentUserId });
    } else {
      return createStore.mutateAsync({ storeData, storeImage, currentUserId });
    }
  };

  return {
    createStore,
    updateStore,
    saveStore,
    isSaving: createStore.isPending || updateStore.isPending,
    error: createStore.error || updateStore.error,
  };
};
