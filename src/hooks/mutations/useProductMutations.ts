/**
 * TanStack Query mutations for product operations
 * Uses productApi for data mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../../types';
import { queryKeys } from '../queries';
import * as productApi from '../../services/api/productApi';
import { CreateProductData, UpdateProductData } from '../../services/api';

export const useProductMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const createData: CreateProductData = {
        name: product.name!,
        category: product.category!,
        storeId: product.storeId || storeId,
        ownerId: product.ownerId,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        images: product.images,
        pstPercentage: product.pstPercentage,
        gstPercentage: product.gstPercentage,
        ingredients: product.ingredients,
      };
      return productApi.createProduct(createData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: Partial<Product> }) => {
      const updateData: UpdateProductData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        images: product.images,
        pstPercentage: product.pstPercentage,
        gstPercentage: product.gstPercentage,
        ingredients: product.ingredients,
      };
      return productApi.updateProduct(productId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byStore(storeId),
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      await productApi.deleteProduct(productId);
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
        (oldData: unknown) => {
          if (Array.isArray(oldData)) {
            return oldData.filter((product: Product) => product.id !== deletedProductId);
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
