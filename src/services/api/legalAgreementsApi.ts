/**
 * Legal Agreements API - Operations for legal agreement documents
 */

import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS, AgreementType, LegalAgreementDocument } from './types';

// ============================================================================
// Types
// ============================================================================

interface FirestoreLegalAgreement {
  agreementType: AgreementType;
  version: string;
  isLatest: boolean;
  content: {
    en: string;
    es: string;
  };
  title: {
    en: string;
    es: string;
  };
  subtitle: {
    en: string;
    es: string;
  };
  lastUpdated: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformAgreementDocument(
  id: string,
  data: FirestoreLegalAgreement
): LegalAgreementDocument {
  return {
    id,
    agreementType: data.agreementType,
    version: data.version,
    isLatest: data.isLatest,
    content: {
      en: data.content?.en || '',
      es: data.content?.es || '',
    },
    title: {
      en: data.title?.en || '',
      es: data.title?.es || '',
    },
    subtitle: {
      en: data.subtitle?.en || '',
      es: data.subtitle?.es || '',
    },
    lastUpdated: data.lastUpdated || '',
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

// ============================================================================
// Firestore Operations
// ============================================================================

/**
 * Get the latest version of a legal agreement by type
 */
export async function getLatestAgreement(
  type: AgreementType
): Promise<LegalAgreementDocument | null> {
  try {
    const agreementsRef = collection(db, COLLECTIONS.LEGAL_AGREEMENTS);
    const q = query(
      agreementsRef,
      where('agreementType', '==', type),
      where('isLatest', '==', true),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No latest agreement found for type: ${type}`);
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return transformAgreementDocument(
      docSnap.id,
      docSnap.data() as FirestoreLegalAgreement
    );
  } catch (error) {
    console.error(`Error fetching latest agreement for type ${type}:`, error);
    throw new Error('Failed to fetch legal agreement. Please try again.');
  }
}

/**
 * Get a specific version of a legal agreement by document ID
 */
export async function getAgreementById(
  versionId: string
): Promise<LegalAgreementDocument | null> {
  try {
    const agreementRef = doc(db, COLLECTIONS.LEGAL_AGREEMENTS, versionId);
    const docSnap = await getDoc(agreementRef);

    if (!docSnap.exists()) {
      console.warn(`Agreement not found with ID: ${versionId}`);
      return null;
    }

    return transformAgreementDocument(
      docSnap.id,
      docSnap.data() as FirestoreLegalAgreement
    );
  } catch (error) {
    console.error(`Error fetching agreement by ID ${versionId}:`, error);
    throw new Error('Failed to fetch legal agreement. Please try again.');
  }
}

/**
 * Get all versions of a legal agreement by type, ordered by version (newest first)
 */
export async function getAllAgreementVersions(
  type: AgreementType
): Promise<LegalAgreementDocument[]> {
  try {
    const agreementsRef = collection(db, COLLECTIONS.LEGAL_AGREEMENTS);
    const q = query(
      agreementsRef,
      where('agreementType', '==', type),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) =>
      transformAgreementDocument(
        docSnap.id,
        docSnap.data() as FirestoreLegalAgreement
      )
    );
  } catch (error) {
    console.error(`Error fetching agreement versions for type ${type}:`, error);
    throw new Error('Failed to fetch legal agreement versions. Please try again.');
  }
}

/**
 * Get latest versions of all agreement types
 * Returns a map of agreement type to document
 */
export async function getAllLatestAgreements(): Promise<
  Partial<Record<AgreementType, LegalAgreementDocument>>
> {
  try {
    const agreementsRef = collection(db, COLLECTIONS.LEGAL_AGREEMENTS);
    const q = query(agreementsRef, where('isLatest', '==', true));

    const querySnapshot = await getDocs(q);

    const result: Partial<Record<AgreementType, LegalAgreementDocument>> = {};

    querySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreLegalAgreement;
      result[data.agreementType] = transformAgreementDocument(docSnap.id, data);
    });

    return result;
  } catch (error) {
    console.error('Error fetching all latest agreements:', error);
    throw new Error('Failed to fetch legal agreements. Please try again.');
  }
}
