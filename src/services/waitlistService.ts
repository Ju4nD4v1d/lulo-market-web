import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface WaitlistEntry {
  email: string;
  timestamp: any;
  status: 'pending' | 'invited' | 'registered';
  source?: string;
}

export const addToWaitlist = async (email: string): Promise<void> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    
    const waitlistEntry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      timestamp: serverTimestamp(),
      status: 'pending',
      source: 'invitation_gate'
    };

    await addDoc(waitlistRef, waitlistEntry);
    console.log('✅ Email added to waitlist:', email);
  } catch (error) {
    console.error('❌ Error adding email to waitlist:', error);
    throw new Error('Failed to add email to waitlist. Please try again.');
  }
};