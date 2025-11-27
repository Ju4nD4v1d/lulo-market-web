import { useMutation } from '@tanstack/react-query';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface BusinessContactData {
  fullName: string;
  businessEmail: string;
  phoneNumber: string | null;
  businessName: string;
  preferredContactMethod: string;
  privacyConsent: {
    accepted: boolean;
    version: string;
  };
}

export const useBusinessContactMutation = () => {
  const submitContact = useMutation({
    mutationFn: async (contactData: BusinessContactData) => {
      const leadsRef = collection(db, 'potentialLeads');

      const leadData = {
        ...contactData,
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'business-page',
      };

      const docRef = await addDoc(leadsRef, leadData);

      return { id: docRef.id, ...leadData };
    },
  });

  return {
    submitContact,
    isSubmitting: submitContact.isPending,
    error: submitContact.error,
    isSuccess: submitContact.isSuccess,
  };
};
