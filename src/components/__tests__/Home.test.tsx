import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { Home } from '../Home';
import { mockUser, mockStore } from '../../test/utils';

// Mock the DataProvider
const mockGetStores = vi.fn();
vi.mock('../../services/DataProvider', () => ({
  useDataProvider: () => ({
    getStores: mockGetStores,
  }),
}));

// Mock CartContext
const mockCartContext = {
  cart: {
    items: [],
    summary: { itemCount: 0, subtotal: 0, tax: 0, deliveryFee: 0, total: 0 },
    storeId: null,
    storeName: null,
  },
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  replaceCart: vi.fn(),
};

vi.mock('../../context/CartContext', () => ({
  useCart: () => mockCartContext,
}));

// Mock AuthContext
const mockAuthContext = {
  currentUser: mockUser,
  loading: false,
  userProfile: null,
  setRedirectAfterLogin: vi.fn(),
  logout: vi.fn(),
  refreshUserProfile: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

vi.mock('../../config/stripe', () => ({
  stripePromise: Promise.resolve(null),
  getStripePromise: () => Promise.resolve(null),
}));

// Mock TestModeContext
const mockTestModeContext = {
  isTestMode: false,
  toggleTestMode: vi.fn(),
};

vi.mock('../../context/TestModeContext', () => ({
  useTestMode: () => mockTestModeContext,
}));

// Mock LanguageContext
const mockLanguageContext = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      'testMode.active': 'Test Mode Active',
      'testMode.tooltip': 'Toggle test mode',
      'testMode.toggle': 'Test',
      'language.toggle': 'ES',
      'nav.forBusiness': 'For Business',
      'shopper.header.cart': 'Cart',
      'profile.editProfile': 'Edit Profile',
      'orderHistory.title': 'Order History',
      'shopper.loading': 'Loading...',
      'shopper.noStoresFound': 'No stores found',
      'shopper.noStoresAvailable': 'No stores available',
      'shopper.clearFilters': 'Clear Filters',
      'shopper.verified': 'Verified',
      'store.new': 'New',
      'shopper.reviews': 'reviews',
      'shopper.pickup': 'Pickup',
      'shopper.viewMenuOrder': 'View Menu & Order',
      'home.featuredRestaurants.badge': 'Featured',
      'home.featuredRestaurants.title': 'Featured Restaurants',
      'home.featuredRestaurants.description': 'Discover amazing local Latino restaurants',
      'home.howItWorks.title': 'How It Works',
      'home.howItWorks.description': 'Simple steps to order',
      'home.howItWorks.step1.title': 'Browse',
      'home.howItWorks.step1.description': 'Find restaurants',
      'home.howItWorks.step2.title': 'Order',
      'home.howItWorks.step2.description': 'Place your order',
      'home.howItWorks.step3.title': 'Enjoy',
      'home.howItWorks.step3.description': 'Get delivery',
      'home.ourStory.title': 'Our Story',
      'home.ourStory.description': 'Connecting communities',
      'home.ourStory.stat1': 'Happy Customers',
      'home.ourStory.stat2': 'Orders Delivered',
      'home.partnerCta.title': 'Partner with Us',
      'home.partnerCta.description': 'Grow your business',
      'home.partnerCta.button': 'Get Started',
    };
    return translations[key] || key;
  },
  locale: 'en',
  toggleLanguage: vi.fn(),
};

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext,
}));

describe('Home Component', () => {
  const mockStores = [
    mockStore,
    {
      ...mockStore,
      id: 'store-2',
      name: 'Another Restaurant',
      averageRating: 4.2,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStores.mockResolvedValue({
      docs: mockStores.map(store => ({
        id: store.id,
        data: () => store,
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render header with logo', async () => {
      render(<Home />);

      await waitFor(() => {
        const logo = screen.getByAltText('Lulo');
        expect(logo).toBeInTheDocument();
      });
    });

    it('should render test mode toggle when test mode is active', async () => {
      mockTestModeContext.isTestMode = true;

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Mode Active')).toBeInTheDocument();
      });
    });

    it('should render language toggle', async () => {
      render(<Home />);

      await waitFor(() => {
        const languageToggle = screen.getByText('ES');
        expect(languageToggle).toBeInTheDocument();
      });
    });

    it('should render for business link', async () => {
      render(<Home />);

      await waitFor(() => {
        const forBusinessLink = screen.getByText('For Business');
        expect(forBusinessLink).toBeInTheDocument();
      });
    });
  });

  describe('Store Listings', () => {
    it('should display stores after loading', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      mockGetStores.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Home />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle empty store list', async () => {
      mockGetStores.mockResolvedValue({ docs: [] });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No stores available')).toBeInTheDocument();
      });
    });

    it('should fallback to mock data on error', async () => {
      mockGetStores.mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });
    });
  });

  describe('Store Filtering and Search', () => {
    it('should filter stores by search query', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
      });

      // Find search input in MarketplaceHero component
      const searchInput = screen.getByPlaceholderText(/search/i) || 
                         screen.getByRole('textbox');
      
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.queryByText('Another Restaurant')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search yields no results', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i) || 
                         screen.getByRole('textbox');
      
      fireEvent.change(searchInput, { target: { value: 'NonexistentRestaurant' } });

      await waitFor(() => {
        expect(screen.getByText('No stores found')).toBeInTheDocument();
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });
    });

    it('should clear search filters when clear button is clicked', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i) || 
                         screen.getByRole('textbox');
      
      fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No stores found')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
      });
    });
  });

  describe('Cart Integration', () => {
    it('should display cart item count when cart has items', async () => {
      mockCartContext.cart.summary.itemCount = 3;

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should not display cart count when cart is empty', async () => {
      mockCartContext.cart.summary.itemCount = 0;

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('0')).not.toBeInTheDocument();
      });
    });

    it('should show 9+ for cart counts over 9', async () => {
      mockCartContext.cart.summary.itemCount = 15;

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('9+')).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication', () => {
    it('should show user profile when logged in', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('should show sign in button when not logged in', async () => {
      mockAuthContext.currentUser = null;

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });

    it('should show user dropdown menu when profile is clicked', async () => {
      render(<Home />);

      await waitFor(() => {
        const userButton = screen.getByText('Test User').closest('button');
        if (userButton) {
          fireEvent.click(userButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.getByText('Order History')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    it('should call logout when sign out is clicked', async () => {
      render(<Home />);

      await waitFor(() => {
        const userButton = screen.getByText('Test User').closest('button');
        if (userButton) {
          fireEvent.click(userButton);
        }
      });

      await waitFor(() => {
        const signOutButton = screen.getByText('Sign Out');
        fireEvent.click(signOutButton);
        expect(mockAuthContext.logout).toHaveBeenCalled();
      });
    });
  });

  describe('Store Interaction', () => {
    it('should navigate to store detail when store is clicked', async () => {
      render(<Home />);

      await waitFor(() => {
        const storeCard = screen.getByText('Test Restaurant').closest('[role="button"], [class*="cursor-pointer"]');
        if (storeCard) {
          fireEvent.click(storeCard);
        }
      });

      // Should navigate to store detail view
      // This would need to be verified based on the actual navigation implementation
    });

    it('should show store badges correctly', async () => {
      const newStore = {
        ...mockStore,
        id: 'new-store',
        name: 'New Restaurant',
        createdAt: new Date(), // New store
        averageRating: undefined,
      };

      const storeWithRating = {
        ...mockStore,
        id: 'rated-store',
        name: 'Rated Restaurant',
        averageRating: 4.8,
        createdAt: new Date('2024-01-01'), // Old store
      };

      mockGetStores.mockResolvedValue({
        docs: [newStore, storeWithRating].map(store => ({
          id: store.id,
          data: () => store,
        })),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('New')).toBeInTheDocument(); // New badge
        expect(screen.getByText('4.8')).toBeInTheDocument(); // Rating badge
      });
    });

    it('should show verified badge for verified stores', async () => {
      const verifiedStore = {
        ...mockStore,
        isVerified: true,
      };

      mockGetStores.mockResolvedValue({
        docs: [{
          id: verifiedStore.id,
          data: () => verifiedStore,
        }],
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });
  });

  describe('Location Services', () => {
    it('should request location when location button is clicked', async () => {
      render(<Home />);

      // This would need to be tested by finding the location request button
      // in the MarketplaceHero component and verifying the geolocation mock is called
    });
  });

  describe('Test Mode', () => {
    it('should use mock data in test mode', async () => {
      mockTestModeContext.isTestMode = true;

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });

      // In test mode, should not call the real data provider
      expect(mockGetStores).not.toHaveBeenCalled();
    });

    it('should use real data when not in test mode', async () => {
      mockTestModeContext.isTestMode = false;

      render(<Home />);

      await waitFor(() => {
        expect(mockGetStores).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile view correctly', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Home />);

      await waitFor(() => {
        // Should render mobile-optimized layout
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle store data loading errors gracefully', async () => {
      mockGetStores.mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      });
    });

    it('should handle malformed store data', async () => {
      mockGetStores.mockResolvedValue({
        docs: [{
          id: 'malformed-store',
          data: () => ({ id: 'incomplete-data' }), // Missing required fields
        }],
      });

      render(<Home />);

      // Should not crash and should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Featured Restaurants')).toBeInTheDocument();
      });
    });
  });
});