# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Generate test coverage report
- `npm run test:watch` - Run tests in watch mode

## Technology Stack

**Frontend:** React 18.3.1 with TypeScript, Vite build system
**Styling:** Tailwind CSS with custom green theme (#C8E400 primary, coral accents)
**Backend:** Firebase (Authentication, Firestore, Storage)
**Maps:** Google Maps API (@react-google-maps/api) and Leaflet
**Charts:** Recharts for analytics dashboards
**Icons:** Lucide React
**Testing:** Vitest with Testing Library and jsdom

## Architecture Overview

### Routing System
- Hash-based routing implemented in src/App.tsx
- Main route patterns:
  - `#dashboard/*` - Business owner dashboard (requires authentication)
  - `#shopper-dashboard/*` - Redirects to unified home experience
  - `#order/*` - Order tracking (requires authentication)
  - `#order-history` - User's order history (requires authentication)
  - `#stores` - Browse all stores
  - `#products` - Browse all products
  - `#business` - Business owner information and signup
  - `#login`, `#forgot-password` - Authentication flows
  - `#profile/edit` - User profile editing (requires authentication)
  - `#terms`, `#privacy` - Legal pages
- Dashboard routes render `<Dashboard />`, store browsing uses `<Home />`, `<StoreMenu />`, `<StoreList />`

### Context Architecture
- **AuthContext** (src/context/AuthContext.tsx): Firebase authentication state management
- **StoreContext** (src/context/StoreContext.tsx): Store ownership status and data
- **LanguageContext** (src/context/LanguageContext.tsx): Internationalization support
- **CartContext** (src/context/CartContext.tsx): Shopping cart state management with localStorage persistence
- **TestModeContext** (src/context/TestModeContext.tsx): Toggle between real Firebase data and mock data for development
- All contexts follow the provider pattern with custom hooks (`useAuth`, `useCart`, `useTestMode`, etc.)

### Data Models
- **StoreData** (src/types/store.ts): Comprehensive store entity with location, business hours, delivery options, social media links
- **StoreLocation**: Address with Google Maps coordinates and placeId
- **AboutUsSection**: Multi-section content management for store descriptions
- **CartItem** (src/types/cart.ts): Shopping cart item with product details, quantities, and pricing
- **CartSummary**: Financial calculations including subtotal, tax (12% HST), delivery fees
- **Order** (src/types/order.ts): Complete order structure with customer info, delivery address, and order lifecycle
- **OrderStatus**: Enum for order states (pending, confirmed, preparing, ready, delivered, cancelled)
- **CustomerInfo**: Customer contact information for orders
- **DeliveryAddress**: Canadian address structure with postal codes and provinces
- **Product** (src/types/product.ts): Product details with pricing, categories, and images
- **Review** (src/types/review.ts): Customer reviews and ratings

### Firebase Integration
- Configuration in src/config/firebase.ts with fallback values for development
- Services: Authentication, Firestore database, Storage for images
- Firebase config includes validation for required environment variables
- All Firebase credentials should be provided via environment variables

### Component Architecture
Key component categories:
- **Dashboard Components**: AdminLayout, MetricsDashboard, OrderManagement, ProductManagement, StoreSetup
- **Shopping Experience**: Home, StoreMenu, StoreList, ProductList, ProductCard, StoreDetail
- **Cart & Checkout**: CartSidebar, AddToCartButton, CheckoutForm, OrderConfirmation, OrderTracking
- **Authentication**: Login, ForgotPassword, InvitationGate
- **Business Pages**: Business, Pricing, ConversionPricing
- **Shared**: Header, Footer, LocationPicker, ConfirmDialog

All components are in src/components/ with clear separation of concerns and modular design.

### Testing Infrastructure
- **Framework**: Vitest with jsdom environment for React component testing
- **Testing Libraries**: @testing-library/react, @testing-library/user-event, @testing-library/jest-dom
- **Coverage**: V8 coverage provider with HTML, JSON, and text reporters
- **Test Files**: Located in `src/**/__tests__/*.test.tsx`
- **Setup**: Test configuration in vitest.config.ts and setup files in src/test/

### Development Utilities
- **DataProvider** (src/services/DataProvider.tsx): Abstraction layer that switches between real Firebase data and mock data based on TestModeContext
- **MockAuthService** (src/services/MockAuthService.tsx): Mock authentication service for development
- **Mock Data Generators** (src/utils/mockDataGenerators.ts): Generates realistic mock stores, products, orders, and reviews for testing
- **Test Mode**: Toggle test mode to work with mock data without affecting production Firebase

## Key Development Patterns

### State Management
- React Context for global state (auth, store, language, cart, test mode)
- **CartContext with localStorage persistence** for shopping cart state
- Local state with useState for component-specific data
- Firebase real-time listeners for data synchronization
- **Order state management** with Firebase Firestore integration

### Authentication & Access Control
- **Invitation system**: Device fingerprinting for access control (src/services/invitationService.ts)
- **Portal login**: Business owners access based on userType validation
- **Forgot password**: Complete Firebase password reset flow with error handling
- **Environment-based configuration**: All API keys properly externalized

### Location Services
- Google Maps integration for store location selection
- Coordinate-based store discovery
- Address geocoding and reverse geocoding

### Image Handling
- Firebase Storage for image uploads
- File preview functionality for store images
- Multi-image support for About Us sections
- Product image integration in cart and checkout components

### Business Logic
- Store setup flow with location, hours, and business details
- **Complete e-commerce system**: Shopping cart, checkout, order processing
- **Canadian tax system**: 12% HST calculation for British Columbia (defined in src/context/CartContext.tsx)
- **Delivery fee structure**: $3.00 base delivery fee (defined in src/context/CartContext.tsx)
- **Single-store cart restriction**: Users can only order from one store at a time
- **Order lifecycle management**: Complete order status tracking
- **Badge logic system**: "New" and rating badges for stores
- **Analytics dashboard**: Business metrics and performance tracking
- **Comprehensive internationalization**: Full Spanish translation support (1,200+ translation keys in src/utils/translations.ts)

## Environment Configuration

### Required Variables
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Optional Variables
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (has fallback)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID (has fallback)
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket (has fallback)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID (has fallback)
- `VITE_FIREBASE_APP_ID` - Firebase app ID (has fallback)
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (has fallback)
- Stripe-related keys for payment processing
- Platform fee configuration
- Receipt endpoint configuration

### Security
- All API keys must be externalized from source code
- .env file is gitignored
- Environment variables required for deployment (Netlify/Firebase hosting)

## Deployment
- Vite build system optimized for production
- Static asset handling for hosting compatibility
- Environment variables must be configured in deployment platform
- Build output in `dist/` directory

## E-commerce Features
- **Complete shopping cart system** with quantity controls and localStorage persistence
- **Multi-step checkout process** with form validation
- **Canadian tax calculation** (12% HST) and delivery fee ($3.00)
- **Order confirmation and tracking** with real-time status updates
- **Mobile-first responsive design** throughout the application
- **Bilingual support** (English/Spanish) for all e-commerce flows
- **Product catalog** with search and filtering capabilities
- **Store badge system** for highlighting new stores and ratings
- **Invitation gate**: Device-based access control with fingerprinting
- **Password recovery**: Complete forgot password flow with Firebase
- **Portal authentication**: Business owner login with userType validation
- **Stripe integration**: Payment processing with secure checkout

## Contact Information
- **Support email**: `support@lulocart.com`
- All customer-facing communications use the consolidated support address
