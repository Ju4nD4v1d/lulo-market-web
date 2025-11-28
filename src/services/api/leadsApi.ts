/**
 * Leads API - Operations for potential business leads
 */

import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ============================================================================
// Types
// ============================================================================

export interface BusinessContactData {
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

export interface LeadData extends BusinessContactData {
  id: string;
  status: string;
  createdAt: unknown;
  source: string;
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Submit a new business contact lead
 */
export async function submitBusinessContact(contactData: BusinessContactData): Promise<LeadData> {
  const leadsRef = collection(db, 'potentialLeads');

  const leadData = {
    ...contactData,
    status: 'new',
    createdAt: serverTimestamp(),
    source: 'business-page',
  };

  const docRef = await addDoc(leadsRef, leadData);

  return {
    id: docRef.id,
    ...leadData,
  } as LeadData;
}
