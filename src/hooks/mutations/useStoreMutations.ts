import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, GeoPoint, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { StoreData } from '../../types/store';
import { queryKeys } from '../queries/queryKeys';

interface StoreMutationVariables {
  storeData: StoreData;
  storeImage?: { file?: File };
  storeId?: string;
  currentUserId: string;
}

// Helper function to upload image and get URL
const uploadImageToStorage = async (
  file: File,
  userId: string,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, `stores/${userId}/${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Helper function to upload multiple section images
const uploadSectionImages = async (
  aboutUs: any[],
  userId: string
): Promise<any[]> => {
  return Promise.all(
    aboutUs.map(async (section) => {
      if (section.imageFile && section.imageFile instanceof File) {
        const imageUrl = await uploadImageToStorage(
          section.imageFile,
          userId,
          'about-sections'
        );
        return {
          title: section.title,
          content: section.content,
          imageUrl,
        };
      }
      return {
        title: section.title,
        content: section.content,
        imageUrl: section.imageUrl || '',
      };
    })
  );
};

export const useStoreMutations = (ownerId: string) => {
  const queryClient = useQueryClient();

  const createStore = useMutation({
    mutationFn: async ({ storeData, storeImage, currentUserId }: StoreMutationVariables) => {
      // Upload main store image if provided
      let mainImageUrl = '';
      if (storeImage?.file) {
        mainImageUrl = await uploadImageToStorage(storeImage.file, currentUserId, 'main');
      }

      // Upload about section images if provided
      const processedAboutUs = await uploadSectionImages(
        storeData.aboutUs || [],
        currentUserId
      );

      // Prepare store data for Firestore (filter out undefined values)
      const firestoreData: any = {
        name: storeData.name,
        description: storeData.description,
        category: storeData.category,
        cuisine: storeData.cuisine,
        location: {
          address: storeData.location.address,
          city: storeData.location?.city || '',
          province: storeData.location?.province || '',
          postalCode: storeData.location?.postalCode || '',
          coordinates: new GeoPoint(
            storeData.location.coordinates.lat,
            storeData.location.coordinates.lng
          ),
          placeId: storeData.location?.placeId || '',
        },
        phone: storeData.phone || '',
        email: storeData.email || '',
        website: storeData.website || '',
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
        verified: false,
        featured: false,
        ownerId: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add optional social media fields only if they have values
      if (storeData.instagram) firestoreData.instagram = storeData.instagram;
      if (storeData.facebook) firestoreData.facebook = storeData.facebook;
      if (storeData.twitter) firestoreData.twitter = storeData.twitter;
      if (storeData.socialMedia && Object.keys(storeData.socialMedia).length > 0) {
        firestoreData.socialMedia = storeData.socialMedia;
      }

      const storesRef = collection(db, 'stores');
      const docRef = await addDoc(storesRef, firestoreData);

      return { id: docRef.id, ...firestoreData };
    },
    onSuccess: () => {
      // Invalidate and refetch store queries immediately
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
        mainImageUrl = await uploadImageToStorage(storeImage.file, currentUserId, 'main');
      }

      // Upload about section images if provided
      const processedAboutUs = await uploadSectionImages(
        storeData.aboutUs || [],
        currentUserId
      );

      // Prepare update data - explicitly list fields to avoid File objects and undefined values
      const updateData: any = {
        name: storeData.name,
        description: storeData.description,
        category: storeData.category,
        cuisine: storeData.cuisine,
        location: {
          address: storeData.location.address,
          city: storeData.location?.city || '',
          province: storeData.location?.province || '',
          postalCode: storeData.location?.postalCode || '',
          coordinates: new GeoPoint(
            storeData.location.coordinates.lat,
            storeData.location.coordinates.lng
          ),
          placeId: storeData.location?.placeId || '',
        },
        phone: storeData.phone || '',
        email: storeData.email || '',
        website: storeData.website || '',
        deliveryHours: storeData.deliveryHours || {},
        deliveryOptions: storeData.deliveryOptions || {},
        paymentMethods: storeData.paymentMethods || [],
        images: mainImageUrl ? [mainImageUrl] : storeData.images || [],
        storeImage: mainImageUrl || storeData.storeImage || (storeData.images?.[0] || ''),
        imageUrl: mainImageUrl || storeData.imageUrl || (storeData.images?.[0] || ''),
        aboutUs: processedAboutUs,
        updatedAt: new Date(),
      };

      // Add optional social media fields only if they have values
      if (storeData.instagram) updateData.instagram = storeData.instagram;
      if (storeData.facebook) updateData.facebook = storeData.facebook;
      if (storeData.twitter) updateData.twitter = storeData.twitter;
      if (storeData.socialMedia && Object.keys(storeData.socialMedia).length > 0) {
        updateData.socialMedia = storeData.socialMedia;
      }

      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, updateData);

      return { id: storeId, ...updateData };
    },
    onSuccess: () => {
      // Invalidate and refetch store queries immediately
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
