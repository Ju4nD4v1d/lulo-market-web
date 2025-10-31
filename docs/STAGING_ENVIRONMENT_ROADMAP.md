# 🚀 STAGING ENVIRONMENT IMPLEMENTATION ROADMAP

> **Last Updated**: 2025-10-20
> **Project**: Lulo Market Web
> **Estimated Time**: 8-12 hours over 1-2 days

## Overview

This roadmap provides a comprehensive guide for implementing a complete staging environment that mirrors your production setup. The staging environment will work with:

- **Firebase & Firestore** - Authentication, database, storage
- **Firebase Cloud Functions** - Backend API endpoints
- **Google Maps API** - Location services
- **Stripe** - Payment processing
- **Brevo** - Email notifications (future implementation)
- **Netlify** - Static site hosting and deployment

---

## Table of Contents

1. [Phase 1: Firebase & Firestore Setup](#phase-1-firebase--firestore-setup)
2. [Phase 2: Firebase Functions Setup](#phase-2-firebase-functions-setup)
3. [Phase 3: Stripe Setup](#phase-3-stripe-setup)
4. [Phase 4: Google Maps API Setup](#phase-4-google-maps-api-setup)
5. [Phase 5: Brevo (Email) Setup](#phase-5-brevo-email-setup)
6. [Phase 6: Netlify Deployment Setup](#phase-6-netlify-deployment-setup)
7. [Phase 7: Codebase Configuration](#phase-7-codebase-configuration)
8. [Phase 8: Git Workflow Setup](#phase-8-git-workflow-setup)
9. [Phase 9: Testing & Validation](#phase-9-testing--validation)
10. [Phase 10: Documentation & Maintenance](#phase-10-documentation--maintenance)
11. [Phase 11: Monitoring & Observability](#phase-11-monitoring--observability)
12. [Cloud Functions Repository Integration](#cloud-functions-repository-integration)
13. [Complete Checklist](#complete-checklist)
14. [Important Notes](#important-notes)

---

## PHASE 1: FIREBASE & FIRESTORE SETUP

**⏱️ Estimated Time**: 2-3 hours

### Step 1.1: Create Staging Firebase Project

**Option A: Separate Project (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Name it `lulo-market-staging`
3. Enable Google Analytics (optional for staging)
4. Complete project creation

**Option B: Use Existing Project with Different Database**
- Use your current project but with a staging database namespace
- Less isolation but simpler setup

### Step 1.2: Enable Firebase Services

In your new staging project:

**1. Authentication**
- Click Authentication → Get Started
- Enable the same sign-in methods as production (Email/Password, Google, etc.)
- Note: Staging will have separate user accounts

**2. Firestore Database**
- Click Firestore Database → Create Database
- Start in **test mode** initially (we'll add security rules later)
- Choose same region as production (likely `us-central1`)

**3. Storage**
- Click Storage → Get Started
- Start in **test mode**
- Same region as Firestore

### Step 1.3: Copy Security Rules

```bash
# If you have existing rules, export from production:
firebase firestore:rules:get > firestore.staging.rules
firebase storage:rules:get > storage.staging.rules

# Then deploy to staging (we'll set this up later)
```

### Step 1.4: Get Staging Firebase Config

1. Project Settings → General → Your apps
2. Click "Add app" → Web (</>) icon
3. Register app as "Lulo Market Staging"
4. **Copy the configuration object** - you'll need these values:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
}
```

### Step 1.5: Seed Staging Data (Optional)

- Manually create test stores, products, and orders
- Or use Firebase Admin SDK to copy sanitized production data
- Create test user accounts for QA

### Collections to Seed

Based on your current setup:
- `waitlist` - Test invitation gate emails
- `stores` - Test store data with locations, hours, products
- `orders` - Sample order data
- `products` - Product catalog
- `invitations` - Test invitation codes

---

## PHASE 2: FIREBASE FUNCTIONS SETUP

**⏱️ Estimated Time**: 1-2 hours

### Step 2.1: Set Up Functions for Staging

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login
firebase login

# Initialize functions (if not already done)
firebase init functions

# Add staging project
firebase use --add
# Enter project ID: lulo-market-staging
# Alias: staging
```

### Step 2.2: Configure Multiple Environments in .firebaserc

Your `.firebaserc` should look like:

```json
{
  "projects": {
    "default": "lulop-eds249",
    "production": "lulop-eds249",
    "staging": "lulo-market-staging"
  }
}
```

### Step 2.3: Configure Functions Environment Variables

```bash
# Switch to staging
firebase use staging

# Set Stripe keys (from Step 3)
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Set Brevo API key (from Step 5)
firebase functions:config:set brevo.api_key="your-brevo-staging-key"

# Environment identifier
firebase functions:config:set app.environment="staging"

# Any other backend environment variables
firebase functions:config:set app.platform_fee_fixed="2.00"
firebase functions:config:set app.platform_fee_percentage="0.10"

# View config
firebase functions:config:get
```

### Step 2.4: Deploy Functions to Staging

```bash
# Deploy to staging
firebase use staging
firebase deploy --only functions

# Note the deployed function URLs:
# - https://us-central1-lulo-market-staging.cloudfunctions.net/generateReceiptManually
# - https://us-central1-lulo-market-staging.cloudfunctions.net/createPaymentIntent
# - https://us-central1-lulo-market-staging.cloudfunctions.net/handlePaymentWebhook
```

### Step 2.5: Cloud Functions Repository Integration

**Important**: If you have a separate cloud functions repository, you'll need to:

1. **Clone/Update the Functions Repo**:
   ```bash
   # If separate repo
   cd /path/to/lulo-market-functions
   git checkout -b staging
   ```

2. **Configure Environment-Specific Code**:
   ```typescript
   // In your functions code
   const environment = functions.config().app?.environment || 'production';

   const config = {
     development: {
       apiUrl: 'http://localhost:5173',
       allowedOrigins: ['http://localhost:5173']
     },
     staging: {
       apiUrl: 'https://lulo-market-staging.netlify.app',
       allowedOrigins: ['https://lulo-market-staging.netlify.app']
     },
     production: {
       apiUrl: 'https://lulo-market.netlify.app',
       allowedOrigins: ['https://lulo-market.netlify.app']
     }
   };

   export const currentConfig = config[environment];
   ```

3. **Update CORS Settings**:
   ```typescript
   // Allow staging frontend to call functions
   const corsOptions = {
     origin: currentConfig.allowedOrigins,
     credentials: true
   };
   ```

4. **Deploy Functions from Separate Repo**:
   ```bash
   # In functions repository
   firebase use staging
   firebase deploy --only functions
   ```

5. **Keep Functions in Sync**:
   - Tag function releases
   - Deploy same version to staging first
   - Test thoroughly before production deploy

---

## PHASE 3: STRIPE SETUP

**⏱️ Estimated Time**: 30 minutes

### Step 3.1: Use Stripe Test Mode

- Staging should **always** use Stripe's **test mode**
- Your existing test keys work perfectly for staging
- No need to create a separate Stripe account

### Step 3.2: Get Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle "Test mode" ON (top right)
3. Click Developers → API keys
4. Copy:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend/functions)

### Step 3.3: Set Up Staging Webhook

1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://us-central1-lulo-market-staging.cloudfunctions.net/handlePaymentWebhook`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - Any other events your app uses
4. Copy the **Signing secret**: `whsec_...`

### Step 3.4: Test Payment Flow

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

Full list: [Stripe Testing Cards](https://stripe.com/docs/testing)

---

## PHASE 4: GOOGLE MAPS API SETUP

**⏱️ Estimated Time**: 15 minutes

### Step 4.1: Create Separate API Key (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one for staging)
3. APIs & Services → Credentials
4. Create Credentials → API Key
5. Name it "Lulo Market Staging - Maps"

### Step 4.2: Restrict API Key

1. Click on the key to edit
2. **Application restrictions**:
   - Select "HTTP referrers"
   - Add your staging URL: `https://lulo-market-staging.netlify.app/*`
   - Add localhost for testing: `http://localhost:5173/*`
3. **API restrictions**:
   - Select "Restrict key"
   - Enable only:
     - Maps JavaScript API
     - Places API
     - Geocoding API
     - Any other APIs your app uses
4. Save

### Step 4.3: Set Usage Quotas (Optional)

- Set lower quotas for staging to avoid unexpected costs
- APIs & Services → Quotas
- Configure daily limits

---

## PHASE 5: BREVO (EMAIL) SETUP

**⏱️ Estimated Time**: 20 minutes

> **Note**: Brevo integration is for future implementation, but setting it up now ensures you're ready.

### Step 5.1: Create Staging Sender

1. Go to [Brevo Dashboard](https://app.brevo.com/)
2. Senders → Add a new sender
3. Use a staging-specific email: `staging@yourdomain.com` or `dev+staging@yourdomain.com`
4. Verify the sender email

### Step 5.2: Get API Key

1. Settings → SMTP & API
2. Create a new API key
3. Name it "Lulo Market Staging"
4. Copy the key (starts with `xkeysib-...`)

### Step 5.3: Create Staging Templates

- Duplicate your production email templates
- Add "[STAGING]" prefix to subject lines
- Optionally add a banner indicating it's a test email

### Step 5.4: Configure Contact Lists

- Create separate contact lists for staging
- **Important**: Never send staging emails to real customer lists!

---

## PHASE 6: NETLIFY DEPLOYMENT SETUP

**⏱️ Estimated Time**: 45 minutes

### Step 6.1: Create Staging Site

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Add new site → Import existing project
3. Connect to your Git repository
4. **Configure build settings**:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Deploy settings**:
   - Deploy only from specific branch: `staging` (create this branch if it doesn't exist)

### Step 6.2: Configure Site Name

1. Site settings → General → Site details
2. Change site name to: `lulo-market-staging`
3. Your site will be: `https://lulo-market-staging.netlify.app`

### Step 6.3: Set Environment Variables

Go to Site settings → Environment variables → Add variables:

```bash
# Environment Identifier
VITE_ENV=staging

# Firebase Configuration (from Phase 1, Step 1.4)
VITE_FIREBASE_API_KEY=your-staging-api-key
VITE_FIREBASE_AUTH_DOMAIN=lulo-market-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lulo-market-staging
VITE_FIREBASE_STORAGE_BUCKET=lulo-market-staging.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Google Maps (from Phase 4)
VITE_GOOGLE_MAPS_API_KEY=your-staging-maps-key

# Stripe (from Phase 3)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Platform Configuration (same as prod or different for testing)
VITE_PLATFORM_FEE_FIXED=2.00
VITE_PLATFORM_FEE_PERCENTAGE=0.10

# API Endpoints
VITE_RECEIPT_GENERATION_ENDPOINT=https://us-central1-lulo-market-staging.cloudfunctions.net/generateReceiptManually

# Brevo (if using)
VITE_API_INVITATION_REQUEST_ENDPOINT=https://api.brevo.com/v3/...
```

### Step 6.4: Configure Deploy Contexts

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Redirect all routes to index.html for SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Production context
[context.production]
  environment = { VITE_ENV = "production" }

# Staging context
[context.staging]
  environment = { VITE_ENV = "staging" }

# Deploy previews (PRs)
[context.deploy-preview]
  environment = { VITE_ENV = "staging" }

# Branch deploys
[context.branch-deploy]
  environment = { VITE_ENV = "staging" }
```

### Step 6.5: Set Up Deploy Notifications (Optional)

- Site settings → Build & deploy → Deploy notifications
- Add Slack, email, or webhook notifications for deploy status

---

## PHASE 7: CODEBASE CONFIGURATION

**⏱️ Estimated Time**: 30 minutes

### Step 7.1: Create Environment Files

**Create `.env.staging`** (for local staging testing):

```bash
# .env.staging
VITE_ENV=staging

# Firebase
VITE_FIREBASE_API_KEY=your-staging-api-key
VITE_FIREBASE_AUTH_DOMAIN=lulo-market-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lulo-market-staging
VITE_FIREBASE_STORAGE_BUCKET=lulo-market-staging.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-staging-maps-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Platform
VITE_PLATFORM_FEE_FIXED=2.00
VITE_PLATFORM_FEE_PERCENTAGE=0.10
```

**Create `.env.example`** (for documentation):

```bash
# .env.example - Copy to .env.local and fill in values

# Environment (development | staging | production)
VITE_ENV=development

# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# Platform Configuration
VITE_PLATFORM_FEE_FIXED=2.00
VITE_PLATFORM_FEE_PERCENTAGE=0.10
```

### Step 7.2: Update .gitignore

Verify these entries exist in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.staging
.env.production
.env.*.local
```

### Step 7.3: Add Build Scripts

Update `package.json` to include staging-specific scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "preview:staging": "vite preview --mode staging",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:staging": "VITE_ENV=staging vitest"
  }
}
```

### Step 7.4: Verify API Configuration

Your `/src/config/api.ts` already has environment detection. Verify it includes staging:

```typescript
// src/config/api.ts
export const isDevelopment = import.meta.env.DEV;
export const isStaging = import.meta.env.VITE_ENV === 'staging';
export const isProduction = import.meta.env.VITE_ENV === 'production';

const API_BASE_URLS = {
  development: 'http://localhost:3000',
  staging: 'https://us-central1-lulo-market-staging.cloudfunctions.net',
  production: 'https://us-central1-lulop-eds249.cloudfunctions.net'
};

export const API_BASE_URL = isStaging
  ? API_BASE_URLS.staging
  : isProduction
    ? API_BASE_URLS.production
    : API_BASE_URLS.development;
```

### Step 7.5: Update Firebase Config (If Needed)

Ensure `/src/config/firebase.ts` properly reads environment variables:

```typescript
// Already correctly configured in your codebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lulop-eds249.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lulop-eds249",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lulop-eds249.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "137283240286",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:137283240286:web:79986988846a946637cfcf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RY9ZQYTHQW"
};
```

---

## PHASE 8: GIT WORKFLOW SETUP

**⏱️ Estimated Time**: 20 minutes

### Step 8.1: Create Staging Branch

```bash
# From development branch
git checkout development
git pull origin development

# Create staging branch
git checkout -b staging
git push -u origin staging
```

### Step 8.2: Set Up Branch Protection Rules

On GitHub/GitLab/Bitbucket:

**For `staging` branch**:
1. Repository Settings → Branches
2. Add branch protection rule for `staging`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass (if you have CI/CD)
   - ✅ Require branches to be up to date
   - ✅ Include administrators (optional)

**For `main`/`production` branch**:
1. Add branch protection rule for `main`:
   - ✅ Same as staging
   - ✅ Require linear history (optional)
   - ✅ Require deployments to succeed before merging (optional)

### Step 8.3: Define Git Workflow

**Recommended Branch Strategy**:
```
feature branches → development → staging → main (production)
```

**Workflow Process**:

1. **Feature Development**:
   ```bash
   git checkout development
   git checkout -b feature/new-feature
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   # Create PR to development
   ```

2. **Merge to Development**:
   - Create Pull Request: `feature/new-feature` → `development`
   - Review & approve
   - Merge to `development`

3. **Deploy to Staging**:
   ```bash
   git checkout staging
   git merge development
   git push origin staging
   # Netlify auto-deploys staging site
   ```

4. **QA Testing on Staging**:
   - Test all functionality on `https://lulo-market-staging.netlify.app`
   - Verify integration with staging services
   - Run automated tests

5. **Promote to Production**:
   ```bash
   git checkout main
   git merge staging
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin main --tags
   # Netlify auto-deploys production site
   ```

### Step 8.4: Create Release Tags

```bash
# After successful staging test
git checkout staging
git tag -a v1.0.0-rc.1 -m "Release candidate 1.0.0"
git push origin v1.0.0-rc.1

# After production deploy
git checkout main
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

---

## PHASE 9: TESTING & VALIDATION

**⏱️ Estimated Time**: 1-2 hours

### Step 9.1: Test Local Staging Build

```bash
# Switch to staging branch
git checkout staging
git pull origin staging

# Test local staging build
npm run build:staging
npm run preview:staging

# Open http://localhost:4173 and test
```

### Step 9.2: Smoke Tests Checklist

Run these tests on staging deployment (`https://lulo-market-staging.netlify.app`):

**Authentication & Authorization**:
- [ ] User registration works
- [ ] User login works (email/password, Google, etc.)
- [ ] Password reset functionality
- [ ] User logout
- [ ] Protected routes redirect correctly
- [ ] Invitation code system works

**Firebase Integration**:
- [ ] Firestore reads data correctly
- [ ] Firestore writes data correctly
- [ ] Firebase Storage uploads images
- [ ] Firebase Storage serves images
- [ ] Firebase Authentication persists sessions

**Store & Product Management**:
- [ ] Can browse stores
- [ ] Store locations display on map
- [ ] Can view store details
- [ ] Can browse products
- [ ] Product images load correctly
- [ ] Can filter/search products

**Shopping Cart & Orders**:
- [ ] Can add items to cart
- [ ] Can modify cart quantities
- [ ] Can remove items from cart
- [ ] Cart persists across page reloads

**Payment Processing (Stripe)**:
- [ ] Payment form loads correctly
- [ ] Can enter test card information
- [ ] Payment succeeds with test card `4242 4242 4242 4242`
- [ ] Payment fails appropriately with decline card
- [ ] 3D Secure authentication works
- [ ] Order created in Firestore after payment
- [ ] Stripe webhook processes correctly

**Google Maps Integration**:
- [ ] Maps load without errors
- [ ] Store markers appear correctly
- [ ] Can interact with map (zoom, pan)
- [ ] Store location search works
- [ ] Geolocation works (if implemented)

**Email Notifications (Brevo - if implemented)**:
- [ ] Invitation emails sent
- [ ] Order confirmation emails sent
- [ ] Emails have [STAGING] prefix
- [ ] No real customer emails sent

**Cloud Functions**:
- [ ] `generateReceiptManually` function works
- [ ] `createPaymentIntent` function works
- [ ] `handlePaymentWebhook` function works
- [ ] All functions return expected responses
- [ ] Error handling works correctly

**UI/UX**:
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] Tailwind styles apply correctly
- [ ] Images load properly
- [ ] Navigation works correctly
- [ ] Forms validate correctly

**Performance**:
- [ ] Page load time < 3 seconds
- [ ] Images optimized and load quickly
- [ ] No memory leaks
- [ ] Bundle size reasonable

### Step 9.3: Test Data Separation

**Verify isolation**:
- [ ] Staging data doesn't appear in production Firebase
- [ ] Production data doesn't appear in staging Firebase
- [ ] User accounts are separate between environments
- [ ] Staging payments only in Stripe test mode
- [ ] No cross-environment data leakage

### Step 9.4: Automated Testing

```bash
# Run unit tests with staging config
npm run test:staging

# Run E2E tests (if configured)
npm run test:e2e:staging

# Check test coverage
npm run test:coverage
```

### Step 9.5: Performance Testing

```bash
# Build and analyze bundle
npm run build:staging

# Run Lighthouse audit
npx lighthouse https://lulo-market-staging.netlify.app --view

# Check for performance issues
# Target scores:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

---

## PHASE 10: DOCUMENTATION & MAINTENANCE

**⏱️ Estimated Time**: 1 hour

### Step 10.1: Create Environment Documentation

Create `docs/ENVIRONMENTS.md`:

```markdown
# Environment Configuration Guide

## Available Environments

### Development (Local)
- **URL**: http://localhost:5173
- **Firebase**: Development project or staging
- **Stripe**: Test mode
- **Purpose**: Local development and testing

### Staging
- **URL**: https://lulo-market-staging.netlify.app
- **Firebase**: lulo-market-staging
- **Stripe**: Test mode
- **Purpose**: QA testing, pre-production validation
- **Auto-deploys from**: `staging` branch

### Production
- **URL**: https://lulo-market.netlify.app (or your custom domain)
- **Firebase**: lulop-eds249
- **Stripe**: Live mode
- **Purpose**: Live customer-facing application
- **Auto-deploys from**: `main` branch

## Environment Variables

See `.env.example` for required variables.

### Development Setup
1. Copy `.env.example` to `.env.local`
2. Fill in development values
3. Run `npm run dev`

### Staging Setup
1. Configure in Netlify dashboard
2. All variables prefixed with `VITE_`
3. Must include `VITE_ENV=staging`

### Production Setup
1. Configure in Netlify dashboard
2. All variables prefixed with `VITE_`
3. Must include `VITE_ENV=production`

## Access & Credentials

**Firebase Console**:
- Staging: https://console.firebase.google.com/project/lulo-market-staging
- Production: https://console.firebase.google.com/project/lulop-eds249

**Netlify Dashboard**:
- Staging: [Link to staging site]
- Production: [Link to production site]

**Stripe Dashboard**:
- Test Mode: https://dashboard.stripe.com/test/dashboard
- Live Mode: https://dashboard.stripe.com/dashboard

## Deployment Workflow

1. Develop features in feature branches
2. Merge to `development` branch
3. Merge `development` → `staging` for QA
4. Test on staging environment
5. Merge `staging` → `main` for production
6. Monitor production deployment

## Troubleshooting

### Environment variables not working
- Ensure variables start with `VITE_`
- Redeploy after changing variables in Netlify
- Clear browser cache

### Firebase connection issues
- Verify project ID matches environment
- Check API key is correct
- Ensure Firebase services are enabled

### Stripe webhook failures
- Check webhook endpoint URL
- Verify signing secret is correct
- Check Firebase Functions logs
```

### Step 10.2: Create Deployment Runbook

Create `docs/DEPLOYMENT_RUNBOOK.md`:

```markdown
# Deployment Runbook

## Quick Reference

| Task | Command |
|------|---------|
| Deploy to Staging | Merge to `staging` branch |
| Deploy to Production | Merge to `main` branch |
| Rollback Production | Netlify → Deploys → Publish old deploy |
| View Function Logs | Firebase Console → Functions → Logs |
| Test Staging Locally | `npm run build:staging && npm run preview:staging` |

## Standard Deployment Process

### Deploying to Staging

1. **Ensure all changes are in development**:
   ```bash
   git checkout development
   git pull origin development
   ```

2. **Merge to staging**:
   ```bash
   git checkout staging
   git merge development
   git push origin staging
   ```

3. **Wait for deployment**:
   - Monitor Netlify dashboard
   - Check deploy logs for errors
   - Deployment typically takes 2-3 minutes

4. **Verify deployment**:
   - Visit https://lulo-market-staging.netlify.app
   - Run smoke tests (see TESTING.md)
   - Check browser console for errors

### Deploying to Production

1. **Ensure staging is tested**:
   - All smoke tests pass
   - QA approval received
   - No critical bugs

2. **Create release tag**:
   ```bash
   git checkout staging
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. **Merge to production**:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

4. **Monitor deployment**:
   - Watch Netlify deploy logs
   - Monitor error tracking (if configured)
   - Check Firebase Functions logs
   - Monitor Stripe dashboard for payment issues

5. **Post-deployment verification**:
   - Visit production site
   - Test critical user flows
   - Monitor for errors

## Emergency Procedures

### Rollback Production Deployment

If production has critical issues:

1. **In Netlify Dashboard**:
   - Go to Deploys tab
   - Find last working deployment
   - Click "Publish deploy"
   - Confirm rollback

2. **Revert code** (if needed):
   ```bash
   git checkout main
   git revert HEAD
   git push origin main
   ```

3. **Communicate**:
   - Notify team of rollback
   - Document what went wrong
   - Plan fix in staging

### Firebase Functions Issues

**View logs**:
```bash
firebase use production
firebase functions:log
```

**Redeploy specific function**:
```bash
firebase deploy --only functions:functionName
```

### Environment Variable Updates

1. **In Netlify Dashboard**:
   - Site Settings → Environment Variables
   - Update/Add variable
   - Save changes

2. **Trigger redeploy**:
   - Deploys → Trigger deploy → Deploy site

3. **Verify**:
   - Check application uses new value
   - Test affected functionality

### Database Migrations

**IMPORTANT**: Always test on staging first!

1. **Test on staging**:
   ```bash
   firebase use staging
   # Run migration script
   # Verify data integrity
   ```

2. **Backup production** (if possible):
   - Use Firebase Console export
   - Or create snapshot

3. **Apply to production**:
   ```bash
   firebase use production
   # Run same migration script
   # Verify data integrity
   ```

## Monitoring Checklist

After each deployment, monitor:

- [ ] Netlify deploy status (success/failure)
- [ ] Browser console (no new errors)
- [ ] Firebase Functions logs (no errors)
- [ ] Stripe dashboard (payments processing)
- [ ] Error tracking service (if configured)
- [ ] User reports/feedback

## Common Issues

### Build Failures

**Symptom**: Netlify build fails
**Solution**:
- Check build logs in Netlify
- Verify all dependencies installed
- Check for TypeScript errors
- Ensure environment variables set

### Firebase Connection Errors

**Symptom**: "Firebase: Error (auth/invalid-api-key)"
**Solution**:
- Verify `VITE_FIREBASE_API_KEY` is correct
- Check Firebase project is active
- Ensure API key restrictions allow your domain

### Stripe Webhook Failures

**Symptom**: Payments succeed but orders not created
**Solution**:
- Check Firebase Functions logs
- Verify webhook signing secret
- Test webhook endpoint manually
- Check Stripe webhook delivery attempts

### Environment Variable Not Available

**Symptom**: `import.meta.env.VITE_XXX` is undefined
**Solution**:
- Variable must start with `VITE_`
- Redeploy after adding variable
- Check variable is set in correct environment (staging vs production)
```

### Step 10.3: Update Main README

Add section to `/README.md`:

```markdown
## Environments

This project uses multiple environments for development, testing, and production:

- **Development**: Local development (`http://localhost:5173`)
- **Staging**: QA and testing (`https://lulo-market-staging.netlify.app`)
- **Production**: Live site (`https://lulo-market.netlify.app`)

For detailed environment configuration, see [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).

For deployment procedures, see [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md).

## Deployment

Deployments are automated via Netlify:

- Push to `staging` branch → Deploys to staging
- Push to `main` branch → Deploys to production

See [docs/STAGING_ENVIRONMENT_ROADMAP.md](docs/STAGING_ENVIRONMENT_ROADMAP.md) for initial setup.
```

---

## PHASE 11: MONITORING & OBSERVABILITY (OPTIONAL)

**⏱️ Estimated Time**: 1-2 hours

### Step 11.1: Set Up Error Tracking with Sentry

**Install Sentry**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configure Sentry** in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_ENV !== 'development') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: import.meta.env.VITE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Add environment variables**:
- `VITE_SENTRY_DSN=https://...@sentry.io/...`

### Step 11.2: Set Up Analytics

**Configure Google Analytics**:
```typescript
// src/utils/analytics.ts
export const initAnalytics = () => {
  if (import.meta.env.VITE_ENV === 'production') {
    // Production GA property
    gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  } else if (import.meta.env.VITE_ENV === 'staging') {
    // Staging GA property (separate)
    gtag('config', import.meta.env.VITE_GA_STAGING_MEASUREMENT_ID);
  }
};

export const trackEvent = (eventName: string, params?: object) => {
  gtag('event', eventName, {
    ...params,
    environment: import.meta.env.VITE_ENV,
  });
};
```

### Step 11.3: Enhanced Logging

Create `src/utils/logger.ts`:
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private environment = import.meta.env.VITE_ENV;

  private shouldLog(level: LogLevel): boolean {
    if (this.environment === 'development') return true;
    if (this.environment === 'staging') return true;
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, ...args: any[]): any[] {
    const prefix = `[${this.environment?.toUpperCase()}][${level.toUpperCase()}]`;
    return [prefix, ...args];
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', ...args));
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', ...args));
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', ...args));
    }
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', ...args));
      // Send to error tracking service
      if (this.environment !== 'development') {
        // Sentry.captureException(args[0]);
      }
    }
  }
}

export const logger = new Logger();
```

### Step 11.4: Set Up Alerts

**Netlify Deploy Notifications**:
- Slack integration for failed deploys
- Email notifications for deploy status

**Firebase Monitoring**:
- Set up Cloud Monitoring alerts
- Budget alerts to prevent cost overruns

**Stripe Monitoring**:
- Enable email notifications for failed payments
- Monitor webhook delivery failures

---

## CLOUD FUNCTIONS REPOSITORY INTEGRATION

**⏱️ Estimated Time**: Ongoing

> **Important**: If your Firebase Cloud Functions are in a separate repository, follow these additional steps.

### Repository Structure

If you have a separate cloud functions repo:
```
lulo-market-web/          # Frontend repo
lulo-market-functions/    # Cloud Functions repo (separate)
```

### Step 1: Configure Functions Repository

In your functions repository, create environment-aware configuration:

**Create `src/config/environment.ts`**:
```typescript
import * as functions from 'firebase-functions';

export type Environment = 'development' | 'staging' | 'production';

export const environment: Environment =
  (functions.config().app?.environment as Environment) || 'production';

export const config = {
  development: {
    frontendUrl: 'http://localhost:5173',
    allowedOrigins: ['http://localhost:5173'],
    stripeKey: functions.config().stripe?.secret_key || '',
    brevoApiKey: functions.config().brevo?.api_key || '',
  },
  staging: {
    frontendUrl: 'https://lulo-market-staging.netlify.app',
    allowedOrigins: ['https://lulo-market-staging.netlify.app'],
    stripeKey: functions.config().stripe?.secret_key || '',
    brevoApiKey: functions.config().brevo?.api_key || '',
  },
  production: {
    frontendUrl: 'https://lulo-market.netlify.app',
    allowedOrigins: ['https://lulo-market.netlify.app'],
    stripeKey: functions.config().stripe?.secret_key || '',
    brevoApiKey: functions.config().brevo?.api_key || '',
  },
};

export const currentConfig = config[environment];
```

### Step 2: Update CORS Configuration

**Update all HTTP functions**:
```typescript
import * as cors from 'cors';
import { currentConfig } from './config/environment';

const corsHandler = cors({
  origin: currentConfig.allowedOrigins,
  credentials: true,
});

export const myFunction = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    // Your function logic
  });
});
```

### Step 3: Deploy Functions to Multiple Environments

**Set up .firebaserc in functions repo**:
```json
{
  "projects": {
    "default": "lulop-eds249",
    "production": "lulop-eds249",
    "staging": "lulo-market-staging"
  }
}
```

**Deploy to staging**:
```bash
# In functions repository
cd lulo-market-functions

# Set environment config
firebase use staging
firebase functions:config:set app.environment="staging"
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Deploy
firebase deploy --only functions
```

**Deploy to production**:
```bash
firebase use production
firebase functions:config:set app.environment="production"
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Deploy
firebase deploy --only functions
```

### Step 4: Keep Function URLs in Sync

After deploying functions, update frontend environment variables:

**In frontend `.env.staging`**:
```bash
VITE_RECEIPT_GENERATION_ENDPOINT=https://us-central1-lulo-market-staging.cloudfunctions.net/generateReceiptManually
```

**In Netlify staging environment variables**:
- Update all function URLs to point to staging functions

### Step 5: Version Control for Functions

**Use git tags to track function deployments**:
```bash
# In functions repo
git tag -a functions-v1.0.0-staging -m "Deploy to staging"
git push origin functions-v1.0.0-staging

# After staging testing
git tag -a functions-v1.0.0 -m "Deploy to production"
git push origin functions-v1.0.0
```

### Step 6: Testing Functions Locally

**Use Firebase Emulator Suite**:
```bash
# In functions repository
npm install -g firebase-tools
firebase init emulators

# Start emulators
firebase emulators:start
```

**Update frontend for local function testing**:
```typescript
// src/config/api.ts
const API_BASE_URLS = {
  development: 'http://localhost:5001/lulop-eds249/us-central1', // Emulator
  staging: 'https://us-central1-lulo-market-staging.cloudfunctions.net',
  production: 'https://us-central1-lulop-eds249.cloudfunctions.net'
};
```

### Step 7: CI/CD for Functions (Optional)

**Create GitHub Actions workflow** (`.github/workflows/deploy-functions-staging.yml`):
```yaml
name: Deploy Functions to Staging

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          npm install -g firebase-tools
          firebase use staging
          firebase deploy --only functions --token $FIREBASE_TOKEN
```

---

## COMPLETE CHECKLIST

Use this comprehensive checklist to track your progress through the staging environment setup:

### ✅ Firebase & Firestore
- [ ] Create staging Firebase project (or decide to use existing with namespace)
- [ ] Enable Firebase Authentication
- [ ] Enable Firestore Database
- [ ] Enable Firebase Storage
- [ ] Copy/configure security rules
- [ ] Get Firebase config values (apiKey, authDomain, etc.)
- [ ] Seed test data (stores, products, users)
- [ ] Test Firebase connection from local dev environment

### ✅ Firebase Functions
- [ ] Initialize Firebase CLI with staging project
- [ ] Configure .firebaserc with staging alias
- [ ] Set functions environment variables (stripe, brevo, environment)
- [ ] Deploy functions to staging
- [ ] Test function endpoints
- [ ] Note function URLs for frontend configuration
- [ ] (If separate repo) Configure environment-aware code
- [ ] (If separate repo) Set up version tagging

### ✅ Stripe
- [ ] Get Stripe test mode publishable key
- [ ] Get Stripe test mode secret key
- [ ] Create staging webhook endpoint in Stripe
- [ ] Configure webhook events
- [ ] Copy webhook signing secret
- [ ] Set Stripe keys in Firebase Functions config
- [ ] Test payment flow with test cards
- [ ] Verify webhook delivery

### ✅ Google Maps
- [ ] Create staging API key in Google Cloud Console
- [ ] Configure HTTP referrer restrictions
- [ ] Add staging URL to allowed referrers
- [ ] Add localhost to allowed referrers
- [ ] Configure API restrictions
- [ ] Set usage quotas (optional)
- [ ] Test map functionality

### ✅ Brevo (If Using)
- [ ] Create staging sender email
- [ ] Verify sender email
- [ ] Get staging API key
- [ ] Create staging email templates
- [ ] Add [STAGING] prefix to templates
- [ ] Set up test contact lists
- [ ] Test email sending
- [ ] Verify no real customers in staging lists

### ✅ Netlify
- [ ] Create new staging site in Netlify
- [ ] Connect to Git repository
- [ ] Configure build settings (npm run build, dist/)
- [ ] Set deployment branch to `staging`
- [ ] Change site name to lulo-market-staging
- [ ] Add all environment variables (Firebase, Maps, Stripe, etc.)
- [ ] Set VITE_ENV=staging
- [ ] Configure deploy notifications (optional)
- [ ] Test manual deploy

### ✅ Codebase Configuration
- [ ] Create .env.staging file
- [ ] Create .env.example file
- [ ] Update .gitignore for environment files
- [ ] Add build:staging script to package.json
- [ ] Add dev:staging script to package.json
- [ ] Add preview:staging script to package.json
- [ ] Verify API configuration includes staging
- [ ] Verify Firebase config reads env variables correctly
- [ ] Create netlify.toml with deploy contexts
- [ ] Test local staging build

### ✅ Git Workflow
- [ ] Create staging branch from development
- [ ] Push staging branch to remote
- [ ] Set up branch protection for staging
- [ ] Set up branch protection for main/production
- [ ] Document git workflow for team
- [ ] Test merge flow (feature → dev → staging)
- [ ] Set up release tagging strategy

### ✅ Testing & Validation
- [ ] Test local staging build
- [ ] Deploy to staging environment
- [ ] Run authentication smoke tests
- [ ] Run Firebase integration tests
- [ ] Run store/product management tests
- [ ] Run shopping cart tests
- [ ] Run payment processing tests (Stripe)
- [ ] Run Google Maps tests
- [ ] Test email notifications (if using Brevo)
- [ ] Test all Cloud Functions
- [ ] Verify UI/UX functionality
- [ ] Run performance tests
- [ ] Verify data separation from production
- [ ] Run automated tests
- [ ] Run Lighthouse audit

### ✅ Documentation
- [ ] Create docs/ENVIRONMENTS.md
- [ ] Create docs/DEPLOYMENT_RUNBOOK.md
- [ ] Update main README.md with environment info
- [ ] Document test credentials (securely)
- [ ] Document common issues and solutions
- [ ] Create team onboarding guide
- [ ] Document cloud functions deployment (if separate repo)

### ✅ Monitoring (Optional)
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Implement enhanced logging
- [ ] Set up deploy notifications
- [ ] Configure Firebase monitoring alerts
- [ ] Set up Stripe monitoring alerts
- [ ] Set up budget alerts

### ✅ Cloud Functions (If Separate Repo)
- [ ] Create environment-aware configuration
- [ ] Update CORS settings for staging
- [ ] Configure .firebaserc in functions repo
- [ ] Deploy functions to staging
- [ ] Update frontend with staging function URLs
- [ ] Set up function version tagging
- [ ] Test functions locally with emulator
- [ ] Set up CI/CD for functions (optional)

---

## IMPORTANT NOTES

### 🔒 Security Considerations

1. **Never Mix Environment Credentials**
   - Production API keys should NEVER be used in staging
   - Staging API keys should NEVER be used in production
   - Always verify which environment you're deploying to

2. **Stripe Safety**
   - **Always** use Stripe test mode for staging
   - Never use live Stripe keys in staging
   - Test mode data is completely separate from live mode

3. **Data Isolation**
   - Keep staging data completely separate from production
   - Never query production database from staging
   - Never send staging emails to real customers
   - Use test user accounts for staging

4. **API Key Security**
   - Restrict API keys by domain/IP when possible
   - Use environment variables, never hardcode credentials
   - Rotate keys periodically
   - Monitor API key usage for anomalies

5. **Access Control**
   - Limit who has access to production credentials
   - Use different Firebase/Netlify accounts for different environments if needed
   - Enable 2FA on all service accounts
   - Regularly audit access logs

6. **Git Security**
   - Never commit .env files to git
   - Never commit credentials in code
   - Use .gitignore properly
   - Review PRs for accidental credential commits

### 💰 Cost Management

1. **Firebase**
   - Spark (free) plan may be sufficient for staging
   - Set up budget alerts in Firebase Console
   - Monitor Firestore reads/writes
   - Monitor Storage usage
   - Monitor Functions invocations

2. **Google Maps**
   - Set usage quotas to avoid unexpected costs
   - Lower quotas for staging than production
   - Monitor daily usage in Google Cloud Console
   - Consider using map tiles with caching

3. **Netlify**
   - Free tier includes 300 build minutes/month
   - Monitor build minutes usage
   - Optimize build process to save time
   - Consider using build caching

4. **Stripe**
   - Test mode is completely free
   - No charges for test transactions
   - Unlimited test transactions

5. **Brevo**
   - Free tier includes 300 emails/day
   - Monitor email sending volume
   - Use staging-specific sender to track usage

### ⚡ Best Practices

1. **Always Test on Staging First**
   - Never deploy directly to production
   - Run full test suite on staging
   - Get QA approval before production deploy
   - Test edge cases and error scenarios

2. **Keep Environments in Sync**
   - Use same dependency versions
   - Keep security rules synchronized
   - Mirror production configuration
   - Document any intentional differences

3. **Automated Testing**
   - Run tests on every staging deploy
   - Use CI/CD to enforce quality gates
   - Maintain high test coverage
   - Include E2E tests for critical flows

4. **Version Control**
   - Tag releases consistently
   - Document changes in each release
   - Keep clear git history
   - Use semantic versioning

5. **Monitoring**
   - Monitor staging for errors
   - Track performance metrics
   - Set up alerts for failures
   - Review logs regularly

6. **Documentation**
   - Keep runbooks up to date
   - Document all configuration changes
   - Maintain troubleshooting guides
   - Share knowledge with team

7. **Regular Maintenance**
   - Clean up old test data periodically
   - Update dependencies regularly
   - Review and update security rules
   - Audit environment variables

### 🚨 Common Pitfalls to Avoid

1. **Environment Variable Mistakes**
   - Forgetting `VITE_` prefix
   - Not redeploying after changing variables
   - Using wrong environment's variables

2. **Branch Confusion**
   - Merging wrong branches
   - Deploying from wrong branch
   - Not keeping branches in sync

3. **Data Leakage**
   - Accidentally using production database in staging
   - Sending staging emails to real customers
   - Mixing test and live Stripe data

4. **Configuration Drift**
   - Staging and production becoming too different
   - Forgetting to update staging after production changes
   - Not synchronizing security rules

5. **Testing Shortcuts**
   - Skipping staging tests
   - Not testing payment flows thoroughly
   - Assuming staging works like production

---

## ESTIMATED TIMELINE

| Phase | Time Required | Dependencies | Can Start |
|-------|---------------|--------------|-----------|
| **Phase 1**: Firebase & Firestore Setup | 2-3 hours | None | Immediately |
| **Phase 2**: Firebase Functions Setup | 1-2 hours | Phase 1 complete | After Phase 1 |
| **Phase 3**: Stripe Setup | 30 minutes | None | Immediately (parallel) |
| **Phase 4**: Google Maps API Setup | 15 minutes | None | Immediately (parallel) |
| **Phase 5**: Brevo Setup | 20 minutes | None | Immediately (parallel) |
| **Phase 6**: Netlify Deployment | 45 minutes | All credentials from previous phases | After credentials ready |
| **Phase 7**: Codebase Configuration | 30 minutes | None | Immediately (parallel) |
| **Phase 8**: Git Workflow Setup | 20 minutes | None | Immediately |
| **Phase 9**: Testing & Validation | 1-2 hours | Phase 6 complete | After deployment |
| **Phase 10**: Documentation | 1 hour | All phases understood | Anytime |
| **Phase 11**: Monitoring (Optional) | 1-2 hours | Phase 6 complete | After deployment |
| **Cloud Functions Integration** | Ongoing | Phase 2 complete | After Functions setup |

**Total Estimated Time**: **8-12 hours** spread over **1-2 days**

### Recommended Execution Order

**Day 1 - Setup (6-8 hours)**:
1. Start Phase 1 (Firebase) - 2-3 hours
2. While Firebase is being set up, work on:
   - Phase 3 (Stripe) - 30 min
   - Phase 4 (Google Maps) - 15 min
   - Phase 5 (Brevo) - 20 min
   - Phase 7 (Codebase config) - 30 min
3. Complete Phase 2 (Firebase Functions) - 1-2 hours
4. Complete Phase 6 (Netlify) - 45 min
5. Start Phase 8 (Git workflow) - 20 min

**Day 2 - Testing & Documentation (2-4 hours)**:
1. Phase 9 (Testing) - 1-2 hours
2. Phase 10 (Documentation) - 1 hour
3. Phase 11 (Monitoring - optional) - 1-2 hours

---

## NEXT STEPS

Now that you have the complete roadmap, here's how to get started:

### Immediate Actions

1. **Review this roadmap** with your team
   - Discuss timeline and resource allocation
   - Assign responsibilities
   - Schedule implementation windows

2. **Gather existing credentials**
   - Current Firebase project details
   - Existing Stripe account info
   - Google Cloud Console access
   - Netlify account

3. **Decide on approach**
   - Separate Firebase project vs. namespace?
   - Separate functions repository?
   - Which team members need access?

### Week 1: Foundation

- [ ] Create Firebase staging project
- [ ] Set up Netlify staging site
- [ ] Configure external API keys (Stripe, Maps)
- [ ] Create staging branch
- [ ] Deploy initial staging version

### Week 2: Testing & Refinement

- [ ] Run comprehensive tests on staging
- [ ] Document any issues and solutions
- [ ] Train team on new workflow
- [ ] Set up monitoring (if using)

### Week 3: Production Ready

- [ ] Finalize documentation
- [ ] Complete team training
- [ ] Establish deployment cadence
- [ ] Plan first staging → production release

### Ongoing

- Maintain staging environment parity with production
- Regular testing on staging before production deploys
- Keep documentation updated
- Review and improve workflow based on team feedback

---

## ADDITIONAL RESOURCES

### Documentation Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Google Maps Platform](https://developers.google.com/maps/documentation)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Brevo API Documentation](https://developers.brevo.com/)

### Tools & Services

- **Firebase CLI**: `npm install -g firebase-tools`
- **Netlify CLI**: `npm install -g netlify-cli`
- **Stripe CLI**: For webhook testing locally
- **Firebase Emulator Suite**: For local function testing

### Support

If you encounter issues during implementation:
1. Check the troubleshooting section in docs/DEPLOYMENT_RUNBOOK.md
2. Review service-specific documentation
3. Check Firebase/Netlify/Stripe status pages
4. Consult with team members
5. Reach out to service support if needed

---

## CONCLUSION

This roadmap provides a comprehensive guide to implementing a staging environment for your Lulo Market application. By following these phases systematically, you'll create a robust testing environment that:

✅ Mirrors your production setup
✅ Enables safe testing before production deploys
✅ Supports multiple team members working in parallel
✅ Provides clear deployment workflows
✅ Maintains security and data isolation
✅ Scales with your application

**Remember**: The key to successful staging is keeping it as close to production as possible while maintaining complete separation of data and credentials.

Good luck with your implementation! 🚀

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Maintained By**: Development Team
**Next Review**: After initial implementation
