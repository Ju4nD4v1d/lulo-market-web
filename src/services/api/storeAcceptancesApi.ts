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

export interface AgreementAcceptance {
  accepted: boolean;
  acceptedAt: Date | null;
  versionId: string | null;  // Document ID of signed version
  version: string | null;    // Version string for display (e.g., "1.0.0")
}

export interface StoreAcceptance {
  storeId: string;
  ownerId: string;
  sellerAgreement: AgreementAcceptance;
  payoutPolicy: AgreementAcceptance;
  refundPolicy: AgreementAcceptance;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgreementAcceptanceInput {
  accepted: boolean;
  versionId: string | null;
  version: string | null;
}

export interface StoreAcceptanceInput {
  storeId: string;
  ownerId: string;
  sellerAgreement: AgreementAcceptanceInput;
  payoutPolicy: AgreementAcceptanceInput;
  refundPolicy: AgreementAcceptanceInput;
}

interface FirestoreAgreementAcceptance {
  accepted: boolean;
  acceptedAt: Timestamp | null;
  versionId: string | null;
  version: string | null;
}

interface FirestoreAcceptance {
  storeId: string;
  ownerId: string;
  sellerAgreement: FirestoreAgreementAcceptance;
  payoutPolicy: FirestoreAgreementAcceptance;
  refundPolicy: FirestoreAgreementAcceptance;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformAgreementAcceptance(
  agreement: FirestoreAgreementAcceptance | undefined
): AgreementAcceptance {
  return {
    accepted: agreement?.accepted || false,
    acceptedAt: agreement?.acceptedAt?.toDate() || null,
    versionId: agreement?.versionId || null,
    version: agreement?.version || null,
  };
}

function transformAcceptanceDocument(data: FirestoreAcceptance): StoreAcceptance {
  return {
    storeId: data.storeId,
    ownerId: data.ownerId,
    sellerAgreement: transformAgreementAcceptance(data.sellerAgreement),
    payoutPolicy: transformAgreementAcceptance(data.payoutPolicy),
    refundPolicy: transformAgreementAcceptance(data.refundPolicy),
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
 * Preserves existing acceptedAt timestamps and version info to maintain audit trail
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

    // Build agreement acceptance data, preserving existing if already accepted
    const buildAgreementData = (
      newAgreement: AgreementAcceptanceInput,
      existingAgreement?: FirestoreAgreementAcceptance
    ) => {
      // If already accepted before, preserve all original data
      if (existingAgreement?.accepted && existingAgreement?.acceptedAt) {
        return {
          accepted: existingAgreement.accepted,
          acceptedAt: existingAgreement.acceptedAt,
          versionId: existingAgreement.versionId,
          version: existingAgreement.version,
        };
      }
      // If newly accepting, set current data
      if (newAgreement.accepted) {
        return {
          accepted: true,
          acceptedAt: now,
          versionId: newAgreement.versionId,
          version: newAgreement.version,
        };
      }
      // Not accepted
      return {
        accepted: false,
        acceptedAt: null,
        versionId: null,
        version: null,
      };
    };

    const acceptanceData = {
      storeId: input.storeId,
      ownerId: input.ownerId,
      sellerAgreement: buildAgreementData(input.sellerAgreement, existingData?.sellerAgreement),
      payoutPolicy: buildAgreementData(input.payoutPolicy, existingData?.payoutPolicy),
      refundPolicy: buildAgreementData(input.refundPolicy, existingData?.refundPolicy),
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
