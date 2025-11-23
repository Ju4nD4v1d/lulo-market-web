# LuloCart - Latino Marketplace

Bilingual e-commerce platform for Latino businesses in Canada.

## Setup

### Prerequisites
- Node.js 18+
- Firebase project (Auth, Firestore, Storage)
- Google Maps API key

### Install

```bash
npm install
```

### Environment Variables

Create `.env` file:

```env
# Required
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional (has fallbacks)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Payment & Cloud Functions (optional - has fallbacks)
VITE_PAYMENT_INTENT_ENDPOINT=https://createpaymentintent-6v2n7ecudq-uc.a.run.app
VITE_RECEIPT_ENDPOINT=https://generatereceiptmanually-6v2n7ecudq-uc.a.run.app
VITE_INVITATION_ENDPOINT=https://sendinvitationrequestemail-6v2n7ecudq-uc.a.run.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Run

```bash
npm run dev          # Development server
npm run build        # Production build
npm test             # Run tests
```

## Tech Stack

- React 18 + TypeScript + Vite
- CSS Modules (mobile-first)
- Firebase + TanStack Query + Zustand
- Stripe payments

## Development

See `CLAUDE.md` for architecture and coding standards.

---

Built for the Latino community in Canada 🇨🇦
