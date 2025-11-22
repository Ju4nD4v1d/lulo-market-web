import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product } from '../../types/product';
import { queryKeys } from '../queries/queryKeys';

export const useProductMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { id: docRef.id, ...product } as Product;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: Partial<Product> }) => {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...product,
        updatedAt: new Date(),
      });

      return { id: productId, ...product } as Product;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const saveProduct = async (product: Partial<Product>, productId?: string) => {
    if (productId) {
      return updateProduct.mutateAsync({ productId, product });
    } else {
      return createProduct.mutateAsync(product);
    }
  };

  return {
    createProduct,
    updateProduct,
    saveProduct,
    isLoading: createProduct.isPending || updateProduct.isPending,
    error: createProduct.error || updateProduct.error,
  };
};
