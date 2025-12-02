import { useQuery } from '@tanstack/react-query';
import { Driver } from '../../types/driver';
import { queryKeys } from './queryKeys';
import * as driverApi from '../../services/api/driverApi';

interface UseDriversQueryOptions {
  activeOnly?: boolean;
  enabled?: boolean;
}

interface DriversQueryResult {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch drivers from Firestore
 * @param options.activeOnly - If true, only fetch active drivers
 * @param options.enabled - Whether the query should run
 */
export const useDriversQuery = ({
  activeOnly = false,
  enabled = true,
}: UseDriversQueryOptions = {}): DriversQueryResult => {
  const queryKey = activeOnly
    ? queryKeys.drivers.active()
    : queryKeys.drivers.lists();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: activeOnly ? driverApi.getActiveDrivers : driverApi.getAllDrivers,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    drivers: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

/**
 * Convenience hook to fetch only active drivers
 * Used by customer-facing components for effective hours calculation
 */
export const useActiveDriversQuery = (
  enabled: boolean = true
): DriversQueryResult => {
  return useDriversQuery({ activeOnly: true, enabled });
};
