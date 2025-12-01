import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries';
import * as driverApi from '../../services/api/driverApi';
import { CreateDriverData, UpdateDriverData } from '../../services/api/driverApi';

/**
 * Hook providing mutations for driver CRUD operations
 * Automatically invalidates driver queries on success
 */
export const useDriverMutations = () => {
  const queryClient = useQueryClient();

  const invalidateDriverQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
  };

  const createDriver = useMutation({
    mutationFn: (data: CreateDriverData) => driverApi.createDriver(data),
    onSuccess: invalidateDriverQueries,
  });

  const updateDriver = useMutation({
    mutationFn: ({
      driverId,
      data,
    }: {
      driverId: string;
      data: UpdateDriverData;
    }) => driverApi.updateDriver(driverId, data),
    onSuccess: invalidateDriverQueries,
  });

  const deleteDriver = useMutation({
    mutationFn: (driverId: string) => driverApi.deleteDriver(driverId),
    onSuccess: invalidateDriverQueries,
  });

  const toggleDriverStatus = useMutation({
    mutationFn: (driverId: string) => driverApi.toggleDriverStatus(driverId),
    onSuccess: invalidateDriverQueries,
  });

  return {
    createDriver,
    updateDriver,
    deleteDriver,
    toggleDriverStatus,
    isCreating: createDriver.isPending,
    isUpdating: updateDriver.isPending,
    isDeleting: deleteDriver.isPending,
    isToggling: toggleDriverStatus.isPending,
    error:
      createDriver.error ||
      updateDriver.error ||
      deleteDriver.error ||
      toggleDriverStatus.error,
  };
};
