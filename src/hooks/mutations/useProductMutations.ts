import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product } from '../../types/product';
import { queryKeys } from '../queries/queryKeys';

export const useProductMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      if (!product.name || !product.category || !storeId) {
        throw new Error('Product name, category, and store ID are required');
      }

      const productsRef = collection(db, 'products');

      // Explicitly define fields to avoid serialization issues
      const productData = {
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        category: product.category,
        stock: product.stock || 0,
        status: product.status || 'active',
        images: product.images || [],
        pstPercentage: product.pstPercentage || 0,
        gstPercentage: product.gstPercentage || 0,
        ownerId: product.ownerId,
        storeId: product.storeId || storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(productsRef, productData);

      return { id: docRef.id, ...productData } as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: Partial<Product> }) => {
      if (!productId) {
        throw new Error('Product ID is required for updates');
      }

      const productRef = doc(db, 'products', productId);

      // Explicitly define fields to avoid serialization issues
      const updateData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        images: product.images,
        pstPercentage: product.pstPercentage,
        gstPercentage: product.gstPercentage,
        updatedAt: new Date(),
      };

      await updateDoc(productRef, updateData);

      return { id: productId, ...updateData } as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      if (!productId) {
        throw new Error('Product ID is required for deletion');
      }

      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);

      return productId;
    },
    onSuccess: (deletedProductId) => {
      // Invalidate and refetch immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
        refetchType: 'active',
      });

      // Manually remove the product from cache to ensure immediate UI update
      queryClient.setQueryData(
        queryKeys.products.byStore(storeId),
        (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.filter((product: any) => product.id !== deletedProductId);
          }
          return oldData;
        }
      );
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
    deleteProduct,
    saveProduct,
    isLoading: createProduct.isPending || updateProduct.isPending,
    error: createProduct.error || updateProduct.error,
  };
};
