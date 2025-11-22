# CLAUDE.md

Guide for Claude Code when working with the LuloCart codebase.

## ⚠️ Critical Requirements

**Before writing ANY code, remember:**

1. **Mobile-First Design is MANDATORY**
   - Start with mobile styles (320px-375px width)
   - Use `@media (min-width: XXXpx)` for larger screens
   - Test on mobile viewport first

2. **All Text Must Be Bilingual (English + Spanish)**
   - NO hardcoded strings in any language
   - Every text must use `t('translation.key')`
   - Add keys to BOTH `en` and `es` sections in translations.ts
   - Use locale-aware date/number formatting

3. **CSS Modules Only**
   - No inline styles
   - No Tailwind classes
   - Scoped `.module.css` files

## Technology Stack

**Frontend:** React 18 + TypeScript + Vite
**Styling:** CSS Modules (scoped styles)
**Backend:** Firebase (Auth, Firestore, Storage)
**State:** TanStack Query + React Context
**Maps:** Google Maps + Leaflet
**Payments:** Stripe
**Testing:** Vitest + Testing Library

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Run Vitest tests
npm run test:ui      # Test UI
npm run test:coverage # Coverage report
```

## Project Architecture

### Pages-Based Structure

All route-level components live in `src/pages/[page-name]/`:

```
src/pages/
├── home/                    # Landing (stores, products, search)
├── business/                # Business signup/info
├── checkout/                # Multi-step checkout
├── dashboard/               # Business owner portal
│   └── sections/           # metrics, orders, products, store-setup
├── invitation-gate/         # Access control
├── login-page/              # Auth (login/register)
├── forgot-password-page/    # Password reset
├── edit-profile/            # User profile
├── order-history/           # User's past orders
├── order-tracking/          # Track specific order
├── store-menu/              # Store product catalog
├── privacy-policy/          # Legal
└── terms-of-service/        # Legal
```

**Standard page structure:**
```
page-name/
├── PageName.tsx             # Main component (<200 lines)
├── PageName.module.css      # Scoped styles
├── index.tsx                # Export
├── components/              # Page-specific components
│   ├── Component.tsx
│   └── Component.module.css
├── hooks/                   # Page-specific hooks
│   └── usePageLogic.ts
└── utils/                   # Page-specific utilities
```

### Data Fetching (TanStack Query)

All server state managed via TanStack Query:

**Queries** (`src/hooks/queries/`):
```typescript
import { useOrdersQuery } from '@/hooks/queries/useOrdersQuery';
const { orders, isLoading, error } = useOrdersQuery({ storeId });
```

**Mutations** (`src/hooks/mutations/`):
```typescript
import { useOrderMutations } from '@/hooks/mutations/useOrderMutations';
const { updateOrderStatus } = useOrderMutations(storeId);
await updateOrderStatus.mutateAsync({ orderId, newStatus });
```

### Global State Management

**Two state management approaches based on use case:**

#### React Context (`src/context/`) - App-wide shared state
Use for state that needs Provider wrapper and affects entire app:
- **AuthContext** - User authentication & authorization
- **CartContext** - Shopping cart (localStorage persisted)
- **LanguageContext** - i18n (English/Spanish)
- **StoreContext** - Store ownership

#### Zustand Stores (`src/stores/`) - Lightweight UI state
Use for simple client-side state that doesn't need providers:
- **searchStore** - Search query & filtered results (home page)
- **checkoutStore** - Checkout flow triggers

```typescript
// Zustand - No provider needed, import and use anywhere
import { useSearchStore } from '@/stores/searchStore';

const Component = () => {
  const { searchQuery, setSearchQuery } = useSearchStore();
  return <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />;
};
```

**When to use which:**
- **React Context:** Auth, cart, i18n, data that needs provider setup
- **Zustand:** Simple UI state, flags, temporary data, cross-component communication

### Styling (CSS Modules Only)

**CRITICAL: Mobile-First Design is Mandatory**

All styles must be designed for mobile screens first (320px-375px), then enhanced for larger screens.

**No inline styles. No Tailwind.** Use CSS Modules with mobile-first media queries:

```tsx
import styles from './Component.module.css';

export const Component = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Title</h1>
  </div>
);
```

```css
/* Component.module.css - ALWAYS start with mobile styles */

/* Mobile first (default, no media query) */
.container {
  padding: 1rem;
  background: white;
  width: 100%;
}

.title {
  font-size: 1.25rem;  /* Smaller for mobile */
  font-weight: bold;
}

/* Tablet and up */
@media (min-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .title {
    font-size: 2rem;
  }
}
```

**Common breakpoints:**
- Mobile: default (no media query)
- Tablet: `@media (min-width: 768px)`
- Desktop: `@media (min-width: 1024px)`
- Large: `@media (min-width: 1280px)`

### Internationalization

**CRITICAL: All Text Must Be Translated**

Every single piece of user-facing text MUST support both English and Spanish. No hardcoded strings allowed.

```typescript
import { useLanguage } from '@/context/LanguageContext';

const { t, locale } = useLanguage();

// ✅ CORRECT - Translated text
return <button>{t('cart.addToCart')}</button>;

// ❌ WRONG - Hardcoded English
return <button>Add to Cart</button>;

// ✅ CORRECT - Date formatting with locale
const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';
date.toLocaleDateString(dateLocale, { month: 'long', day: 'numeric' });

// ❌ WRONG - Date without locale
date.toLocaleDateString('en-US', { month: 'long' }); // Always English!
```

**Adding new translations** in `src/utils/translations.ts`:

```typescript
// English section
export const translations = {
  en: {
    'cart.addToCart': 'Add to Cart',
    'cart.remove': 'Remove',
    'cart.total': 'Total',
    // ... more keys
  },

  // Spanish section - MUST MATCH English keys
  es: {
    'cart.addToCart': 'Agregar al Carrito',
    'cart.remove': 'Eliminar',
    'cart.total': 'Total',
    // ... same keys, translated
  }
};
```

**Translation rules:**
- Use dot notation: `'section.component.action'`
- Add to BOTH English AND Spanish sections
- Keep keys descriptive and consistent
- Test in both languages before committing

## Code Standards

### TypeScript

- Strict mode enabled
- Explicit types at public boundaries
- Prefer `interface` over `type` for objects
- No `any` - use proper generics

```typescript
// ✅ Good
interface StoreData {
  id: string;
  name: string;
}

const fetchStore = async (id: string): Promise<StoreData> => { }

// ❌ Avoid
const fetchStore = async (id: any): Promise<any> => { }
```

### React Patterns

- Function components with hooks
- No type-only React imports when using JSX runtime features
- Extract business logic to custom hooks
- Keep components under 200 lines

```typescript
// ✅ Good - Proper imports for runtime usage
import { useState, Fragment } from 'react';

// ❌ Avoid - Type-only import fails at runtime
import type * as React from 'react';
<React.Fragment> // This will fail
```

### File Naming

- **Components:** `ComponentName.tsx` (PascalCase)
- **Utils/Types:** `fileName.ts` (camelCase)
- **Hooks:** `useHookName.ts` (camelCase with `use` prefix)
- **CSS Modules:** `Component.module.css`

## Business Logic

### E-commerce Rules

- **Tax:** 12% HST (British Columbia)
- **Delivery Fee:** $3.00 base
- **Currency:** CAD only
- **Cart:** Single store per cart
- **Order Flow:** `pending` → `processing` → `confirmed` → `preparing` → `ready` → `out_for_delivery` → `delivered` (or `cancelled`)

### Order Status Handling

Order statuses use **snake_case** enum values but **camelCase** translation keys:

```typescript
// Enum definition (snake_case)
enum OrderStatus {
  OUT_FOR_DELIVERY = 'out_for_delivery',
}

// Translation helper (converts to camelCase for key)
const getStatusText = (status: OrderStatus, t: Function) => {
  switch (status) {
    case OrderStatus.OUT_FOR_DELIVERY:
      return t('order.status.outForDelivery');  // camelCase key
  }
};
```

## Common Patterns

### Error Handling

```typescript
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
  // Don't throw if non-critical (e.g., analytics, notifications)
}
```

### Loading States

```typescript
if (loading) return <Loader2 className="animate-spin" />;
if (error) return <div>{t('error.message')}</div>;
return <Content data={data} />;
```

### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await submitData(formData);
    onSuccess();
  } catch (err) {
    setError(t('form.error'));
  } finally {
    setLoading(false);
  }
};
```

## Key Files

- **Routing:** `src/App.tsx` - Hash-based routing
- **Translations:** `src/utils/translations.ts` - All i18n keys (1,200+)
- **Types:** `src/types/` - Shared TypeScript types
- **Services:** `src/services/` - Firebase, Stripe, etc.

## Firebase

- Config: `src/config/firebase.ts`
- All credentials via env vars (`VITE_*`)
- Collections: `stores`, `products`, `orders`, `users`, `waitlist`
- Storage: Store/product images

## Environment Variables

**Required:**
- `VITE_FIREBASE_API_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

**Optional:** Stripe keys, Firebase config overrides

## Testing

- Test files: `*.test.tsx` or `*.test.ts`
- Use Testing Library for components
- Focus on user interactions
- Mock external services

## Deployment

- Build output: `dist/`
- Set env vars in deployment platform
- Required env vars must be configured

## Contact

Customer support: `support@lulocart.com`
