# CLAUDE.md

Guide for Claude Code when working with the LuloCart codebase.

## Critical Requirements

**Before writing ANY code:**

1. **Mobile-First Design** - Start with mobile styles (320px-375px), use `@media (min-width: XXXpx)` for larger screens
2. **Bilingual Text** - All user-facing text must use `t('key')` with translations in both `en` and `es` sections
3. **CSS Modules** - Use scoped `.module.css` files for new components (legacy Tailwind exists but avoid adding more)

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** CSS Modules + Design Tokens (`src/styles/`)
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

## Design Tokens

All colors and typography are centralized:

- **Colors:** `src/styles/colors.css` - Use `var(--color-primary)`, `var(--color-text-primary)`, etc.
- **Typography:** `src/styles/typography.css` - Use CSS variables or `.text-h1`, `.text-body`, etc.

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
- **Delivery Fee:** $3.00 base
- **Platform Fee:** $2.00
- **Currency:** CAD only
- **Cart:** Single store per cart
- **Order Flow:** pending_payment → confirmed → preparing → ready → out_for_delivery → delivered

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

`stores`, `products`, `orders`, `users`, `waitlist`, `drivers`

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
