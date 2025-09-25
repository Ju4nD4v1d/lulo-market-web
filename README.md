# LuloCart - Latino Marketplace Web Application

A comprehensive e-commerce platform designed exclusively for Latino businesses and customers in Canada, featuring bilingual support and authentic cultural experiences.

## 🌟 Features

### For Customers
- **Bilingual Experience**: Full English/Spanish translation support (1,200+ translation keys)
- **Shopping Cart**: Complete cart system with Canadian tax calculation (12% HST)
- **Checkout Flow**: Multi-step checkout with Canadian address validation
- **Store Discovery**: Browse authentic Latino stores with location-based filtering
- **Order Tracking**: Complete order management with status updates
- **Mobile-First**: Responsive design optimized for mobile devices

### For Business Owners
- **Store Management**: Complete store setup with hours, location, and about sections
- **Product Catalog**: Full product management with image uploads
- **Order Processing**: Real-time order management dashboard
- **Analytics**: Business metrics and performance tracking
- **Multi-language**: Create content in both English and Spanish

### Security & Access
- **Invitation System**: Secure access control with device fingerprinting
- **Firebase Authentication**: Complete user management with password recovery
- **Environment Security**: All API keys externalized for secure deployment

## 🛠 Technology Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Latino-inspired theme
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Google Maps API + Leaflet integration
- **Charts**: Recharts for analytics dashboards
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Auth, Firestore, and Storage enabled
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lulo-market-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Required
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Firebase Configuration
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
   
   # Optional - Stripe & Platform Fees
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_PLATFORM_FEE_PERCENTAGE=0.10
   VITE_PLATFORM_FEE_FIXED=2.00
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI interface

## 🏗 Project Structure

```
src/
├── components/         # React components
├── pages/             # Route-level components
├── context/           # React context providers
├── services/          # API and Firebase services
├── utils/            # Helper functions and utilities
├── types/            # TypeScript type definitions
├── test/             # Test setup and utilities
└── config/           # Configuration files
```

## 🌍 Internationalization

The application supports full bilingual functionality:
- **English** (Canadian): Default language
- **Spanish** (Colombian): Complete translation coverage
- All user-facing text is translatable through the centralized translation system

## 🛒 E-commerce Features

### Shopping Experience
- Product browsing with search and filters
- Single-store cart restriction (Canadian compliance)
- Tax calculation: 12% HST (British Columbia)
- Delivery fee: $4.99 base rate
- Canadian address validation with postal codes

### Business Management
- Complete store setup flow
- Product catalog management
- Order processing dashboard
- Analytics and reporting
- Image management with Firebase Storage

## 🔐 Access Control

The platform uses an invitation-based system:
- Device fingerprinting for secure access
- No user account linking required
- Persistent access across browser sessions
- Anti-sharing protection between devices

## 🎨 Design System

- **Primary Color**: Lulo Green (#C8E400)
- **Accent Colors**: Coral accents for highlights
- **Typography**: Modern sans-serif fonts
- **Layout**: Mobile-first responsive design
- **Theme**: Latino-inspired color palette and imagery

## 📊 Demo Data

The application includes 5 complete demo stores:
- **Sabores de Mi Tierra** (Colombian restaurant)
- **Delicias del Barrio** (Mexican bakery)
- **Pan Caliente** (Venezuelan bakery)
- **Señor Café** (Colombian coffee house)
- **+ More** with authentic product catalogs

## 🚢 Deployment

### Environment Setup
Ensure all required environment variables are configured in your deployment platform:
- Firebase configuration keys
- Google Maps API key
- Optional Stripe and platform fee settings

### Build Process
```bash
npm run build
```

The build process:
- Optimizes bundle size
- Generates static assets
- Validates environment variables
- Prepares for CDN deployment

## 🤝 Contributing

1. Follow the coding standards defined in `AGENTS.md`
2. Use Conventional Commit messages (`feat:`, `fix:`, `refactor:`)
3. Ensure TypeScript strict mode compliance
4. Add tests for new functionality
5. Update translations for any new user-facing text

## 📧 Support

For technical support or business inquiries:
- Email: support@lulocart.com
- All customer communications are handled through this consolidated address

## 📄 License

This project is part of the LuloCart platform. All rights reserved.

---

**Built with ❤️ for the Latino community in Canada**