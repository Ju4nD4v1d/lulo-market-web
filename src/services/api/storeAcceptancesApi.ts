/**
 * Store Acceptances API - Operations for legal agreement acceptances
 */

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from './types';

// ============================================================================
// Types
// ============================================================================

export interface StoreAcceptance {
  storeId: string;
  ownerId: string;
  sellerAgreement: {
    accepted: boolean;
    acceptedAt: Date | null;
  };
  payoutPolicy: {
    accepted: boolean;
    acceptedAt: Date | null;
  };
  refundPolicy: {
    accepted: boolean;
    acceptedAt: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreAcceptanceInput {
  storeId: string;
  ownerId: string;
  sellerAgreementAccepted: boolean;
  payoutPolicyAccepted: boolean;
  refundPolicyAccepted: boolean;
}

interface FirestoreAcceptance {
  storeId: string;
  ownerId: string;
  sellerAgreement: {
    accepted: boolean;
    acceptedAt: Timestamp | null;
  };
  payoutPolicy: {
    accepted: boolean;
    acceptedAt: Timestamp | null;
  };
  refundPolicy: {
    accepted: boolean;
    acceptedAt: Timestamp | null;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformAcceptanceDocument(data: FirestoreAcceptance): StoreAcceptance {
  return {
    storeId: data.storeId,
    ownerId: data.ownerId,
    sellerAgreement: {
      accepted: data.sellerAgreement?.accepted || false,
      acceptedAt: data.sellerAgreement?.acceptedAt?.toDate() || null,
    },
    payoutPolicy: {
      accepted: data.payoutPolicy?.accepted || false,
      acceptedAt: data.payoutPolicy?.acceptedAt?.toDate() || null,
    },
    refundPolicy: {
      accepted: data.refundPolicy?.accepted || false,
      acceptedAt: data.refundPolicy?.acceptedAt?.toDate() || null,
    },
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

// ============================================================================
// Firestore Operations
// ============================================================================

/**
 * Save or update store acceptances
 * Uses storeId as document ID for easy lookup
 * Preserves existing acceptedAt timestamps to maintain audit trail
 */
export async function saveStoreAcceptances(input: StoreAcceptanceInput): Promise<void> {
  // Input validation
  if (!input.storeId) {
    throw new Error('Store ID is required');
  }
  if (!input.ownerId) {
    throw new Error('Owner ID is required');
  }

  try {
    const acceptanceRef = doc(db, COLLECTIONS.STORE_ACCEPTANCES, input.storeId);
    const existingDoc = await getDoc(acceptanceRef);
    const existingData = existingDoc.exists() ? existingDoc.data() as FirestoreAcceptance : null;

    const now = serverTimestamp();

    // Preserve existing timestamps if agreement was already accepted
    const getAcceptedAt = (
      newAccepted: boolean,
      existingAcceptance?: { accepted: boolean; acceptedAt: Timestamp | null }
    ) => {
      // If already accepted before, preserve the original timestamp
      if (existingAcceptance?.accepted && existingAcceptance?.acceptedAt) {
        return existingAcceptance.acceptedAt;
      }
      // If newly accepting, set current timestamp
      if (newAccepted) {
        return now;
      }
      // Not accepted
      return null;
    };

    const acceptanceData = {
      storeId: input.storeId,
      ownerId: input.ownerId,
      sellerAgreement: {
        accepted: input.sellerAgreementAccepted,
        acceptedAt: getAcceptedAt(input.sellerAgreementAccepted, existingData?.sellerAgreement),
      },
      payoutPolicy: {
        accepted: input.payoutPolicyAccepted,
        acceptedAt: getAcceptedAt(input.payoutPolicyAccepted, existingData?.payoutPolicy),
      },
      refundPolicy: {
        accepted: input.refundPolicyAccepted,
        acceptedAt: getAcceptedAt(input.refundPolicyAccepted, existingData?.refundPolicy),
      },
      updatedAt: now,
      ...(existingDoc.exists() ? {} : { createdAt: now }),
    };

    await setDoc(acceptanceRef, acceptanceData, { merge: true });
  } catch (error) {
    console.error('Error saving store acceptances:', error);
    throw new Error('Failed to save legal agreements. Please try again.');
  }
}

/**
 * Get store acceptances by store ID
 */
export async function getStoreAcceptances(storeId: string): Promise<StoreAcceptance | null> {
  try {
    const acceptanceRef = doc(db, COLLECTIONS.STORE_ACCEPTANCES, storeId);
    const docSnap = await getDoc(acceptanceRef);

    if (!docSnap.exists()) {
      return null;
    }

    return transformAcceptanceDocument(docSnap.data() as FirestoreAcceptance);
  } catch (error) {
    console.error('Error fetching store acceptances:', error);
    throw new Error('Failed to fetch legal agreements status.');
  }
}

/**
 * Check if all agreements are accepted for a store
 */
export async function areAllAgreementsAccepted(storeId: string): Promise<boolean> {
  const acceptances = await getStoreAcceptances(storeId);

  if (!acceptances) {
    return false;
  }

  return (
    acceptances.sellerAgreement.accepted &&
    acceptances.payoutPolicy.accepted &&
    acceptances.refundPolicy.accepted
  );
}
