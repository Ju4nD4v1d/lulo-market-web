# 🎟️ LuloCart Invitation Codes

## Valid Invitation Codes (Hardcoded for Demo)

The following invitation codes will grant access to the LuloCart marketplace:

### 🔑 Active Codes:
- **LULOCART2024** - Main access code
- **LATINMARKET** - Latin market enthusiasts
- **EXCLUSIVE01** - Exclusive early access
- **BETA2024** - Beta testing program
- **EARLYACCESS** - Early access participants

### ✨ Features:
- **Case Insensitive** - Codes work in uppercase, lowercase, or mixed case
- **Persistent Access** - Valid codes are stored in localStorage for future visits
- **Fallback Flow** - Invalid codes redirect users to email request form
- **Email Validation** - Basic email format validation for access requests

### 🧪 Testing:
1. Try entering any valid code above
2. Try an invalid code like `INVALID123` to see the email request flow
3. Test email validation with various formats
4. Refresh the page after entering a valid code to see persistence

### 📝 Implementation Notes:
- Codes are stored in the `InvitationGate` component
- localStorage key: `lulocart_invitation_code`
- Email submissions are currently console logged (Firebase integration pending)
- The gate completely blocks access to the app until valid code is entered

---

*This is a temporary solution for the invitation-only launch. Replace with Firebase-based validation system when ready.*