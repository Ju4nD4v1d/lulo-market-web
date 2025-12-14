# CLAUDE.md

Guide for Claude Code when working with the LuloCart codebase.

## Critical Requirements

**Before writing ANY code:**

1. **Dark Glass Design System** - Use the dark glassmorphism pattern (see UI Toolkit section)
2. **Mobile-First Design** - Start with mobile styles (320px-375px), use `@media (min-width: XXXpx)` for larger screens
3. **Bilingual Text** - All user-facing text must use `t('key')` with translations in both `en` and `es` sections
4. **Tailwind CSS** - Use Tailwind utility classes for styling (legacy CSS Modules exist but new code uses Tailwind)

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Design Tokens (`src/styles/`)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State:** TanStack Query + React Context
- **Payments:** Stripe
- **Maps:** Google Maps + Leaflet

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Vitest tests
```

## Project Structure

```
src/
├── pages/              # Route-level components (page-name/PageName.tsx)
├── components/         # Shared UI components
├── hooks/
│   ├── queries/        # TanStack Query hooks (useOrdersQuery, useStoreQuery, etc.)
│   └── mutations/      # TanStack mutation hooks
├── context/            # React Context (Auth, Cart, Language, Store)
├── stores/             # Zustand stores (searchStore)
├── services/api/       # Firebase API layer (storeApi, productApi, orderApi)
├── styles/             # Design tokens (colors.css, typography.css)
├── types/              # TypeScript interfaces
└── utils/              # Utilities (translations.ts)
```

## UI Toolkit & Branding

### Dark Glass Design System

All new UI components use a dark glassmorphism aesthetic:

**Page Background:**
- Use `<VibrantBackground />` component on all pages
- Background image: `/images/background.jpg` with dark overlay
- Base color: `#050c08`

**Glass Cards:**
```tsx
<div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
  {/* Card content */}
</div>
```

**Text Colors:**
- Headings: `text-white`
- Body text: `text-white/80`
- Muted/placeholders: `text-white/50`

**Input Fields:**
```tsx
<input
  className="bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
  data-auth-input // Exclude from global input overrides
/>

<input
  className="bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
  data-glass-search // For search inputs
/>
```

### Brand Colors

Defined in `src/styles/colors.css`:

- **Accent:** `#C8E400` (`--brand-accent`) - Buttons, icons, bullets
- **CTA Hover:** `#e7ff01` (`--brand-cta`) - Hover states
- **Background:** `#050c08` - Dark base
- **Text on Dark:** `--brand-text-on-dark` - White text
- **Text Muted:** `--brand-text-on-dark-muted` - White/50

Use CSS variables or Tailwind classes:
```tsx
// Tailwind
<button className="bg-[#C8E400] hover:bg-[#e7ff01]">Click me</button>

// CSS variable
<div style={{ color: 'var(--brand-accent)' }}>Text</div>
```

### Shared Components

- **VibrantBackground:** Dark gradient background for all pages
- **LegalSection:** Pre-styled container for legal pages
- **LoadingFallback:** Dark background with brand-colored spinner (`border-[#C8E400]`)

### Design Tokens

All design tokens in `src/styles/`:
- **colors.css:** Brand colors, semantic colors
- **typography.css:** Font families (Poppins), sizes, weights

## State Management

| Type | Location | Use Case |
|------|----------|----------|
| Server state | `hooks/queries/` | Data from Firebase (TanStack Query) |
| App state | `context/` | Auth, Cart, Language, Store ownership |
| UI state | `stores/` | Search, filters (Zustand) |

## Data Flow

```
Component → Page Hook → TanStack Query Hook → API Layer (services/api/) → Firebase
```

**Important:** Never import Firebase SDK directly in components/hooks. Always use the API layer.

## Breakpoints

- Mobile: default (no media query)
- Tablet: `@media (min-width: 768px)`
- Desktop: `@media (min-width: 1024px)`
- Large: `@media (min-width: 1280px)`

## Internationalization

- All text via `t('section.key')` from `useLanguage()`
- Translations in `src/utils/translations.ts` (both `en` and `es` sections)
- Date formatting must use locale: `date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options)`

## Business Rules

- **Tax:** 12% HST (BC, Canada)
- **Delivery Fee:** Dynamic from Firestore (`deliveryFeeConfig`)
- **Platform Fee:** Dynamic from Firestore (`platformFeeConfig`)
- **Commission:** 6% of subtotal (configurable in `platformFeeConfig`)
- **Currency:** CAD only
- **Cart:** Single store per cart
- **Order Flow:** pending → confirmed → preparing → ready → out_for_delivery → delivered

## Code Standards

- TypeScript strict mode, no `any`
- Components under 200 lines
- `interface` over `type` for objects
- PascalCase components, camelCase files/hooks
- Extract logic to custom hooks

## Key Files

- **Routing:** `src/App.tsx` (hash-based)
- **Translations:** `src/utils/translations.ts`
- **Firebase:** `src/config/firebase.ts`
- **API Layer:** `src/services/api/`

## Firebase Collections

`stores`, `products`, `orders`, `users`, `waitlist`, `drivers`, `platformFeeConfig`, `deliveryFeeConfig`, `store_acceptances`, `legal_agreements`

## Firestore Security Rules & Indexes

- **Rules:** `firestore.rules` - Update when adding new collections
- **Indexes:** `firestore.indexes.json` - Add composite indexes for queries with multiple `where` clauses or `where` + `orderBy`

> **IMPORTANT:** The `firestore.rules` file is the **single source of truth** shared with the backend team. If you modify this file, notify the user so they can share the updated version with backend. Backend must deploy this exact file to maintain frontend-backend alignment.

```bash
firebase deploy --only firestore:rules --project <project-id>
firebase deploy --only firestore:indexes --project <project-id>
```

### Analytics Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `currentWeekMetrics` | Weekly KPIs per store | `storeId`, `weekKey` (YYYY-WNN), `revenue`, `orders`, `products` |
| `monthlyRevenueSummary` | Monthly aggregates + weekly breakdown | `storeId`, `month`, `totalRevenue`, `weekly[]` |
| `activeCustomers` | Unique customers tracking | `weekly_{YYYY-WNN}` docs with `customers[]` array |
| `analytics/topProducts` | Platform-wide top sellers (hourly refresh) | `byQuantity[]`, `byRevenue[]`, `byCurrentWeek[]` |
| `productSales` | Per-product sales tracking | `productId`, `totalQuantitySold`, `weeklySales{}` |

**Frontend-Backend Field Mapping** (in `analyticsApi.ts`):
- Backend `revenue` → Frontend `totalRevenue`
- Backend `orders` → Frontend `totalOrders`
- Backend `products` → Frontend `totalProducts`
- Backend `weekly[].products` → Frontend `productsSold`
- Active customers fetched from separate `activeCustomers/weekly_{weekKey}` collection

## Key Flows

### Checkout (`src/pages/checkout/`)
- Multi-step wizard: Customer Info → Address → Review → Payment
- `CheckoutContext` manages all state (form, wizard, payment)
- Delivery dates computed from **effective hours** (store schedule ∩ driver availability)
- Key files: `CheckoutContext.tsx`, `usePaymentFlow.ts`, `orderDataBuilder.ts`

### Order Tracking (`src/pages/order-tracking/`)
- Real-time order status updates via Firestore subscription
- Displays `estimatedDeliveryTime` and `deliveryTimeWindow`
- Receipt generation (PDF via Cloud Function)

### Schedule System
- **Multi-slot schedules:** Stores/drivers can have up to 3 time slots per day
- **Effective hours:** `src/utils/effectiveHours.ts` - Computes intersection of store + driver schedules
- `useEffectiveHours` hook provides available delivery windows
- Type: `MultiSlotSchedule` in `src/types/schedule.ts`

## Environment Variables

Required: `VITE_FIREBASE_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`
