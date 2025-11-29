// Test utilities for invitation code system
import { clearInvitationData, checkDeviceInvitation } from '../services/invitationService';

// Test helper functions available in browser console
export const invitationTestUtils = {
  // Clear session invitation (requires page refresh to see gate again)
  clearInvitation: () => {
    clearInvitationData();
    console.log('✅ Session invitation cleared');
    console.log('Refresh the page to see the invitation gate again');
  },

  // Check current session invitation status
  checkSession: () => {
    const hasInvitation = checkDeviceInvitation();
    console.log('📱 Session Invitation Status:');
    console.log('  - Has valid invitation:', hasInvitation);
    return hasInvitation;
  }
};

// Attach to window for easy console access (no logging)
if (typeof window !== 'undefined') {
  (window as unknown as { invitationTest: typeof invitationTestUtils }).invitationTest = invitationTestUtils;
}
