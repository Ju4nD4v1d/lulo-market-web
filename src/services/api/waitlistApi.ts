/**
 * Waitlist API - Operations for waitlist management
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

export interface WaitlistEntry {
  email: string;
  timestamp: unknown;
  status: 'pending' | 'invited' | 'registered';
  source?: string;
}

// ============================================================================
// External Notification
// ============================================================================

/**
 * Send notification to support team about new invitation request
 */
export async function sendInvitationRequestNotification(email: string): Promise<void> {
  const endpoint = import.meta.env.VITE_API_INVITATION_REQUEST_ENDPOINT ||
    'https://sendinvitationrequestemail-6v2n7ecudq-uc.a.run.app';

  if (!endpoint) {
    console.warn('Invitation request endpoint not configured');
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Support notification sent:', data.message);
  } catch (error) {
    // Don't throw - we don't want to block waitlist entry if notification fails
    console.error('Failed to send support notification:', error);
  }
}

// ============================================================================
// Firestore Operations
// ============================================================================

/**
 * Add email to waitlist
 */
export async function addToWaitlist(email: string): Promise<void> {
  try {
    const waitlistRef = collection(db, 'waitlist');

    const waitlistEntry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      timestamp: serverTimestamp(),
      status: 'pending',
      source: 'invitation_gate'
    };

    await addDoc(waitlistRef, waitlistEntry);
    console.log('Email added to waitlist:', email);

    // Send notification to support team
    await sendInvitationRequestNotification(email);
  } catch (error) {
    console.error('Error adding email to waitlist:', error);
    throw new Error('Failed to add email to waitlist. Please try again.');
  }
}
