/**
 * Waitlist Service - Re-exports from waitlistApi for backward compatibility
 */

export type { WaitlistEntry } from './api/waitlistApi';

export {
  addToWaitlist,
  sendInvitationRequestNotification,
} from './api/waitlistApi';
