import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import {
  getLatestAgreement,
  getAgreementById,
  getAllLatestAgreements,
} from '../../services/api/legalAgreementsApi';
import type { AgreementType, LegalAgreementDocument } from '../../services/api/types';

/**
 * Fetch the latest version of a legal agreement by type
 *
 * Use this hook when displaying agreements to new users who haven't
 * signed yet, or when viewing the current version of an agreement.
 *
 * @param type - The agreement type (sellerAgreement, payoutPolicy, refundPolicy)
 * @returns Agreement document and query state
 */
export const useLatestAgreementQuery = (type: AgreementType | null) => {
  return useQuery({
    queryKey: queryKeys.legalAgreements.latest(type || ''),
    queryFn: () => getLatestAgreement(type!),
    enabled: !!type,
    staleTime: Infinity, // Agreement content rarely changes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Fetch a specific version of a legal agreement by document ID
 *
 * Use this hook when displaying the version a store has already signed.
 * Pass the versionId stored in store_acceptances.
 *
 * @param versionId - The Firestore document ID of the agreement version
 * @returns Agreement document and query state
 */
export const useAgreementByIdQuery = (versionId: string | null) => {
  return useQuery({
    queryKey: queryKeys.legalAgreements.byId(versionId || ''),
    queryFn: () => getAgreementById(versionId!),
    enabled: !!versionId,
    staleTime: Infinity, // Specific versions never change
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Fetch all latest agreements at once
 *
 * Use this hook during store setup to get all latest agreement versions
 * in a single query, reducing network requests.
 *
 * @returns Map of agreement type to document and query state
 */
export const useAllLatestAgreementsQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.legalAgreements.allLatest(),
    queryFn: getAllLatestAgreements,
    enabled,
    staleTime: Infinity, // Agreement content rarely changes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Fetch a legal agreement - either a specific version or latest
 *
 * This is a convenience hook that automatically fetches:
 * - The specific signed version if versionId is provided
 * - The latest version if only type is provided
 *
 * @param type - The agreement type
 * @param versionId - Optional specific version ID (from store acceptances)
 * @returns Agreement document and query state
 */
export const useLegalAgreementQuery = (
  type: AgreementType,
  versionId?: string | null
) => {
  // If we have a versionId, fetch that specific version
  const specificVersionQuery = useAgreementByIdQuery(versionId || null);

  // Otherwise, fetch the latest version
  const latestVersionQuery = useLatestAgreementQuery(versionId ? null : type);

  // Return the appropriate query result
  if (versionId) {
    return {
      agreement: specificVersionQuery.data as LegalAgreementDocument | null,
      isLoading: specificVersionQuery.isLoading,
      isError: specificVersionQuery.isError,
      error: specificVersionQuery.error,
      refetch: specificVersionQuery.refetch,
    };
  }

  return {
    agreement: latestVersionQuery.data as LegalAgreementDocument | null,
    isLoading: latestVersionQuery.isLoading,
    isError: latestVersionQuery.isError,
    error: latestVersionQuery.error,
    refetch: latestVersionQuery.refetch,
  };
};
