# Development Guidelines - LuloCart

This document provides comprehensive guidelines for developers and AI assistants working on the LuloCart web application.

## 🏗 Project Overview

LuloCart is a bilingual Latino marketplace built with modern web technologies:
- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with Latino-inspired theme
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Integrations**: Google Maps, Stripe, Leaflet
- **Testing**: Vitest + Testing Library

## 📁 Project Structure & Organization

```
src/
├── components/         # React components (PascalCase)
├── pages/             # Route-level components (PascalCase)
├── context/           # React context providers
├── services/          # API/SDK wrappers (Firebase, Stripe, etc.)
├── utils/            # Pure helper functions
├── types/            # TypeScript type definitions
├── test/             # Test setup and utilities
├── config/           # Configuration files
└── hooks/            # Custom React hooks
```

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `StoreDetail.tsx`)
- **Utils/Types**: `camelCase.ts` or `lowercase.ts` (e.g., `order.ts`, `badgeLogic.ts`)
- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_CASE`
- **CSS Classes**: Follow Tailwind utility patterns

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start local development server
npm run build            # Production build to dist/
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # ESLint TypeScript/JavaScript
npm run lint:fix         # Auto-fix linting issues

# Testing
npm test                 # Run all tests with Vitest
npm run test:coverage    # Generate coverage reports
npm run test:ui          # Launch Vitest UI
npm run test:watch       # Run tests in watch mode
```

## 📝 Coding Standards

### TypeScript
- Use **strict mode** with explicit types at public boundaries
- Prefer interfaces over types for object shapes
- Use proper generics instead of `any` types
- Add return types to functions for clarity

```typescript
// ✅ Good
interface StoreData {
  id: string;
  name: string;
  location: StoreLocation;
}

const fetchStore = async (id: string): Promise<StoreData> => {
  // implementation
}

// ❌ Avoid
const fetchStore = async (id: any): Promise<any> => {
  // implementation
}
```

### React Patterns
- Use **function components** with hooks
- Follow hooks rules (ESLint will enforce)
- Prefer composition over inheritance
- Use React Context for global state

```typescript
// ✅ Good
const StoreDetail: React.FC<StoreDetailProps> = ({ storeId }) => {
  const [store, setStore] = useState<StoreData | null>(null);
  // ...
}

// Use custom hooks for business logic
const useStoreData = (storeId: string) => {
  // logic here
}
```

### Styling Guidelines
- Use **Tailwind CSS** utility classes
- Follow mobile-first responsive design
- Use theme tokens from `tailwind.config.js`
- Prefer utility classes over custom CSS

```tsx
// ✅ Good - Mobile-first responsive
<div className="w-full max-w-md mx-auto p-4 md:max-w-lg lg:max-w-xl">
  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
    Store Name
  </h1>
</div>
```

## 🧪 Testing Guidelines

### Framework Setup
- **Vitest** for unit/integration tests
- **Testing Library** for React component testing
- **jsdom** environment for DOM testing
- Global test setup in `src/test/setup.ts`

### Test Organization
- Co-locate simple tests: `src/utils/badgeLogic.test.ts`
- Complex tests in: `src/test/components/`
- Use descriptive test names

```typescript
// ✅ Good test structure
describe('badgeLogic', () => {
  describe('shouldShowNewBadge', () => {
    it('should show new badge for stores created within 30 days', () => {
      const recentStore = { createdAt: new Date() };
      expect(shouldShowNewBadge(recentStore)).toBe(true);
    });
  });
});
```

### Testing Priorities
1. **Core business logic** (cart calculations, badge logic)
2. **User interactions** (form submissions, button clicks)
3. **Error handling** (API failures, validation errors)
4. **Edge cases** (empty states, boundary conditions)

## 🔧 Code Quality

### ESLint Configuration
Follow the existing ESLint setup with these key rules:
- `@typescript-eslint/no-explicit-any`: Prevent `any` usage
- `react-hooks/exhaustive-deps`: Ensure proper hook dependencies
- `@typescript-eslint/no-unused-vars`: Remove unused variables

### Pre-commit Standards
- All code must pass linting
- TypeScript must compile without errors
- Tests must pass
- Commit messages must follow conventional format

## 📦 State Management

### Context Architecture
- **AuthContext**: User authentication and authorization
- **CartContext**: Shopping cart state with localStorage persistence
- **LanguageContext**: Internationalization (English/Spanish)
- **StoreContext**: Store ownership and management

### Local State Guidelines
```typescript
// ✅ Good - Use proper typing
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ✅ Good - Handle loading and error states
const fetchOrders = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await orderService.getOrders();
    setOrders(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## 🌍 Internationalization

### Translation System
- All user-facing text must be translatable
- Use the `useLanguage` hook: `const { t } = useLanguage();`
- Add translations to both English and Spanish sections
- Use descriptive translation keys

```typescript
// ✅ Good
const { t } = useLanguage();
return (
  <button>{t('cart.addToCart')}</button>
);

// ❌ Avoid hardcoded strings
return (
  <button>Add to Cart</button>
);
```

### Translation Key Structure
- Use dot notation: `'section.component.action'`
- Be descriptive: `'orderHistory.errorTitle'` not `'error'`
- Group related translations together

## 🔐 Security & Environment

### Environment Variables
- Use `VITE_*` prefix for client-side variables
- Never commit secrets to the repository
- Required variables: `VITE_FIREBASE_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`
- Optional variables: Stripe keys, platform fees

### Firebase Security
- Follow Firebase Security Rules best practices
- Validate data on both client and server
- Use proper authentication checks
- Implement proper error handling

## 📋 Commit Guidelines

### Conventional Commits
Use these prefixes:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates
- `style:` - Code style changes
- `test:` - Testing improvements

### Commit Message Format
```
type(scope): description

- Keep the description concise and in imperative mood
- Include the scope when relevant (e.g., auth, cart, ui)
- Add breaking change notes if applicable

Examples:
feat(cart): add quantity controls to cart sidebar
fix(auth): resolve portal login for storeOwners
refactor(i18n): consolidate translation keys
```

## 🚀 Deployment Guidelines

### Build Process
- Ensure all environment variables are set
- Run `npm run build` to create production build
- Test production build with `npm run preview`
- Verify no hardcoded API keys in build output

### Environment Setup
- **Development**: Use local `.env` file
- **Production**: Configure environment variables in deployment platform
- **Testing**: Use Firebase emulators when possible

## 🎯 Business Logic

### E-commerce Features
- **Canadian compliance**: 12% HST tax calculation
- **Single-store cart**: Users can only order from one store at a time
- **Delivery fees**: $4.99 base fee structure
- **Currency**: All prices in CAD

### Authentication Flow
- **Invitation system**: Device fingerprinting for access control
- **Portal login**: Business owners verified by userType
- **Password recovery**: Complete Firebase password reset flow

## 📞 Support & Communication

### Contact Information
- All customer-facing communications use: `support@lulocart.com`
- Update email addresses consistently across all components
- Maintain bilingual support for all communications

### Error Handling
- Provide clear, actionable error messages
- Include both English and Spanish error text
- Log errors appropriately for debugging
- Implement graceful degradation

## 🔍 Code Review Checklist

Before submitting code:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] Tests pass and cover new functionality
- [ ] Translations added for any new user-facing text
- [ ] Mobile responsiveness verified
- [ ] Error handling implemented
- [ ] Environment variables properly configured
- [ ] No hardcoded strings or secrets
- [ ] Commit message follows conventional format
- [ ] Documentation updated if needed

---

**Remember**: This is a platform built for the Latino community. Always consider cultural context, language preferences, and inclusive design in your implementations.
