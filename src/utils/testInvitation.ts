// Test utilities for invitation code system
import { clearInvitationData, checkDeviceInvitation } from '../services/invitationService';

// Test helper functions available in browser console
export const invitationTestUtils = {
  // Clear all invitation data from localStorage
  clearInvitation: () => {
    clearInvitationData();
    console.log('✅ Invitation data cleared from localStorage');
    console.log('Refresh the page to see the invitation gate again');
  },

  // Check current device invitation status
  checkDevice: () => {
    const hasInvitation = checkDeviceInvitation();
    const storedCode = localStorage.getItem('lulocart_invitation_code');
    const storedFingerprint = localStorage.getItem('lulocart_device_fingerprint');
    
    console.log('📱 Device Invitation Status:');
    console.log('  - Has valid invitation:', hasInvitation);
    console.log('  - Stored code:', storedCode || 'None');
    console.log('  - Device fingerprint:', storedFingerprint || 'None');
    
    return hasInvitation;
  },

  // Simulate device change by modifying fingerprint
  simulateDeviceChange: () => {
    const currentFingerprint = localStorage.getItem('lulocart_device_fingerprint');
    if (currentFingerprint) {
      localStorage.setItem('lulocart_device_fingerprint', currentFingerprint + '_modified');
      console.log('🔄 Device fingerprint modified');
      console.log('Refresh the page to see if invitation is still valid');
    } else {
      console.log('⚠️ No device fingerprint found');
    }
  },

  // Show all localStorage data related to invitations
  showStorageData: () => {
    console.log('💾 LocalStorage Invitation Data:');
    const keys = ['lulocart_invitation_code', 'lulocart_device_fingerprint'];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`  - ${key}:`, value || 'Not set');
    });
  }
};

// Attach to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).invitationTest = invitationTestUtils;
  console.log('🔧 Invitation test utilities loaded. Use window.invitationTest to access:');
  console.log('  - invitationTest.clearInvitation()');
  console.log('  - invitationTest.checkDevice()');
  console.log('  - invitationTest.simulateDeviceChange()');
  console.log('  - invitationTest.showStorageData()');
}