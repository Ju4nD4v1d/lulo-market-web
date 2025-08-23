import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface InvitationCode {
  id?: string;
  code: string;
  isUsed: boolean;
  createdAt: any;
  usedAt?: any;
  usedBy?: string;
}

export const validateInvitationCode = async (code: string): Promise<boolean> => {
  try {
    const codesRef = collection(db, 'invitation_codes');
    const q = query(
      codesRef, 
      where('code', '==', code.toUpperCase()),
      where('isUsed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Invalid or already used invitation code:', code);
      return false;
    }

    // Mark the code as used
    const codeDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'invitation_codes', codeDoc.id), {
      isUsed: true,
      usedAt: serverTimestamp()
    });

    console.log('✅ Valid invitation code used:', code);
    return true;
  } catch (error) {
    console.error('❌ Error validating invitation code:', error);
    return false;
  }
};