# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally

## Technology Stack

**Frontend:** React 18.3.1 with TypeScript, Vite build system
**Styling:** Tailwind CSS with custom green theme (#C8E400 primary, coral accents)
**Backend:** Firebase (Authentication, Firestore, Storage)
**Maps:** Google Maps API (@react-google-maps/api) and Leaflet
**Charts:** Recharts for analytics dashboards
**Icons:** Lucide React

## Architecture Overview

### Routing System
- Hash-based routing implemented in App.tsx:19
- Route patterns: `#dashboard/*`, `#shopper-dashboard/*`, `#login`, `#forgot-password`
- Dashboard routes render `<Dashboard />`, shopper routes render `<ShopperDashboard />` or `<StoreMenu />`

### Context Architecture
- **AuthContext** (src/context/AuthContext.tsx): Firebase authentication state management
- **StoreContext**: Store ownership status and data
- **LanguageContext**: Internationalization support
- **CartContext** (src/context/CartContext.tsx): Shopping cart state management with localStorage persistence
- All contexts follow the provider pattern with custom hooks (`useAuth`, `useCart`, etc.)

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

### Firebase Integration
- Configuration in src/config/firebase.ts
- Services: Authentication, Firestore database, Storage for images
- Firebase config includes validation for required environment variables

### Component Architecture
- **AdminLayout**: Dashboard wrapper component
- **ShopperDashboard**: Consumer-facing store discovery with cart integration
- **StoreDetail**: Individual store menu display with product catalog
- **CartSidebar**: Full-featured shopping cart interface with mobile optimization
- **AddToCartButton**: Multi-variant button component with quantity controls
- **CheckoutForm**: Multi-step checkout process with Canadian address support
- **OrderConfirmation**: Complete order confirmation with order tracking
- **ProductCard**: Enhanced product display with cart integration
- Modular components in src/components/ with clear separation of concerns

## Key Development Patterns

### State Management
- React Context for global state (auth, store, language, cart)
- **CartContext with localStorage persistence** for shopping cart state
- Local state with useState for component-specific data
- Firebase real-time listeners for data synchronization
- **Order state management** with Firebase Firestore integration

### Location Services
- Google Maps integration for store location selection
- Coordinate-based store discovery
- Address geocoding and reverse geocoding

### Image Handling
- Firebase Storage for image uploads
- File preview functionality for store images
- Multi-image support for About Us sections
- **Product image integration** in cart and checkout components

### Business Logic
- Store setup flow with location, hours, and business details
- **Complete e-commerce system**: Shopping cart, checkout, order processing
- **Canadian tax system**: 12% HST calculation for British Columbia
- **Delivery fee structure**: $4.99 base delivery fee
- **Single-store cart restriction**: Users can only order from one store at a time
- **Order lifecycle management**: Complete order status tracking
- **Badge logic system**: "New" and rating badges for stores
- Analytics dashboard with metrics visualization
- **Comprehensive internationalization**: Full Spanish translation support (1,209+ translation keys)

## Firebase Project
- Project ID: `lulop-eds249`
- Authentication domain: `lulop-eds249.firebaseapp.com`
- Firestore database and Storage bucket configured

## Deployment
- Vite build system optimized for production
- Static asset handling for Firebase hosting compatibility
- Lucide React excluded from Vite optimization (vite.config.ts:8)

## E-commerce Features
- **Complete shopping cart system** with quantity controls and persistence
- **Multi-step checkout process** with form validation
- **Canadian tax and delivery fee calculation**
- **Order confirmation and tracking**
- **Mobile-first responsive design** throughout
- **Bilingual support** (English/Spanish) for all e-commerce flows
- **Product catalog** with search and filtering capabilities
- **Store badge system** for new stores and ratings