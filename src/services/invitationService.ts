/**
 * Invitation Service - Re-exports from invitationApi for backward compatibility
 */

export type { InvitationCode } from './api/invitationApi';

export {
  checkDeviceInvitation,
  clearInvitationData,
  validateInvitationCode,
} from './api/invitationApi';
