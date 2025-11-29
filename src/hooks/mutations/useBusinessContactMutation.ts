import { useMutation } from '@tanstack/react-query';
import * as leadsApi from '../../services/api/leadsApi';

// Re-export types
export type { BusinessContactData, LeadData } from '../../services/api/leadsApi';

export const useBusinessContactMutation = () => {
  const submitContact = useMutation({
    mutationFn: leadsApi.submitBusinessContact,
  });

  return {
    submitContact,
    isSubmitting: submitContact.isPending,
    error: submitContact.error,
    isSuccess: submitContact.isSuccess,
  };
};
