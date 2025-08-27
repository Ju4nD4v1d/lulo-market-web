import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface InvitationCode {
  id?: string;
  code: string;
  isUsed: boolean;
  createdAt: any;
  usedAt?: any;
  deviceFingerprint?: string;
}

// Generate a simple device fingerprint
const generateDeviceFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Check if device has valid invitation
export const checkDeviceInvitation = (): boolean => {
  const storedCode = localStorage.getItem('lulocart_invitation_code');
  const storedFingerprint = localStorage.getItem('lulocart_device_fingerprint');
  const currentFingerprint = generateDeviceFingerprint();
  
  // Valid if code exists and fingerprint matches (or no fingerprint stored for backwards compatibility)
  return !!(storedCode && (!storedFingerprint || storedFingerprint === currentFingerprint));
};

// Validate and claim invitation code
export const validateInvitationCode = async (code: string): Promise<boolean> => {
  try {
    const codesRef = collection(db, 'invitation_codes');
    const upperCode = code.toUpperCase();
    const deviceFingerprint = generateDeviceFingerprint();
    
    // First check if code exists and is valid
    const q = query(
      codesRef, 
      where('code', '==', upperCode)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Invalid invitation code:', code);
      return false;
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data();

    // Check if code is already used by a different device
    if (codeData.isUsed && codeData.deviceFingerprint !== deviceFingerprint) {
      console.log('❌ Invitation code already used by another device:', code);
      return false;
    }

    // If code is valid and not used (or used by same device), proceed
    const updateData: any = {
      isUsed: true,
      usedAt: serverTimestamp(),
      deviceFingerprint
    };

    // Update the invitation code document
    await updateDoc(doc(db, 'invitation_codes', codeDoc.id), updateData);

    // Store in localStorage with device fingerprint
    localStorage.setItem('lulocart_invitation_code', upperCode);
    localStorage.setItem('lulocart_device_fingerprint', deviceFingerprint);

    console.log('✅ Valid invitation code claimed by device:', code);
    return true;
  } catch (error) {
    console.error('❌ Error validating invitation code:', error);
    return false;
  }
};

// Clear invitation data (for testing or logout)
export const clearInvitationData = (): void => {
  localStorage.removeItem('lulocart_invitation_code');
  localStorage.removeItem('lulocart_device_fingerprint');
};