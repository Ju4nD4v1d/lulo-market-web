/**
 * Invitation API - Operations for invitation codes
 *
 * Note: Device caching has been removed. Users must enter a valid
 * invitation code each session to access the app.
 */

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ============================================================================
// Types
// ============================================================================

export interface InvitationCode {
  id?: string;
  code: string;
  isUsed: boolean;
  createdAt: unknown;
  usedAt?: unknown;
}

// ============================================================================
// Session State (persisted in sessionStorage)
// ============================================================================

const SESSION_KEY = 'lulo_invitation_valid';

/**
 * Check if current session has a valid invitation
 * Uses sessionStorage - persists for browser tab but clears when tab is closed
 */
export function checkDeviceInvitation(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Clear invitation for current session
 */
export function clearInvitationData(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Mark session as having valid invitation
 */
function setSessionInvitationValid(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Firestore Operations
// ============================================================================

/**
 * Validate an invitation code
 * Returns true if valid, false otherwise
 * Note: Codes can be reused - we only check if the code exists
 */
export async function validateInvitationCode(code: string): Promise<boolean> {
  try {
    const codesRef = collection(db, 'invitation_codes');
    const upperCode = code.toUpperCase();

    // Check if code exists
    const q = query(
      codesRef,
      where('code', '==', upperCode)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    // Code exists and is valid - mark session as valid
    setSessionInvitationValid();
    return true;
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return false;
  }
}
