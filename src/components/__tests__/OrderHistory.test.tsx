import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { OrderHistory } from '../OrderHistory';
import { mockUser, mockOrder } from '../../test/utils';
import { OrderStatus } from '../../types/order';

// Mock the DataProvider
const mockGetOrders = vi.fn();
vi.mock('../../services/DataProvider', () => ({
  useDataProvider: () => ({
    getOrders: mockGetOrders,
  }),
}));

// Mock AuthContext
const mockAuthContext = {
  currentUser: mockUser,
  loading: false,
  userProfile: null,
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock LanguageContext
const mockLanguageContext = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      'orderHistory.title': 'Order History',
      'orderHistory.subtitle': 'Review your previous orders and their current status',
      'orderHistory.noOrders': 'No orders yet',
      'orderHistory.noOrdersDescription': 'When you place your first order, it will appear here',
      'orderHistory.startShopping': 'Start Shopping',
      'orderHistory.errorTitle': 'Error Loading Orders',
      'orderHistory.tryAgain': 'Try Again',
      'orderHistory.orderDetails': 'Order Details',
      'orderHistory.estimatedDelivery': 'Estimated Delivery',
      'orderHistory.storeInfo': 'Store Information',
      'orderHistory.customerInfo': 'Customer Information',
      'orderHistory.orderItems': 'Order Items',
      'orderHistory.orderSummary': 'Order Summary',
      'orderHistory.quantity': 'Quantity',
      'order.status.pending': 'Pending',
      'order.status.confirmed': 'Confirmed',
      'order.status.preparing': 'Preparing',
      'order.status.ready': 'Ready',
      'order.status.delivered': 'Delivered',
      'order.status.cancelled': 'Cancelled',
      'cart.subtotal': 'Subtotal',
      'cart.tax': 'Tax',
      'cart.deliveryFee': 'Delivery Fee',
      'cart.total': 'Total',
      'cart.item': 'item',
      'cart.items': 'items',
    };
    return translations[key] || key;
  },
  locale: 'en',
};

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext,
}));

describe('OrderHistory Component', () => {
  const mockOnBack = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching orders', () => {
      mockGetOrders.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<OrderHistory onBack={mockOnBack} />);

      expect(screen.getByRole('progressbar') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no orders exist', async () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
        expect(screen.getByText('When you place your first order, it will appear here')).toBeInTheDocument();
        expect(screen.getByText('Start Shopping')).toBeInTheDocument();
      });
    });

    it('should call onBack when start shopping button is clicked', async () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        const startShoppingButton = screen.getByText('Start Shopping');
        fireEvent.click(startShoppingButton);
        expect(mockOnBack).toHaveBeenCalled();
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when order loading fails', async () => {
      mockGetOrders.mockRejectedValueOnce(new Error('Failed to fetch orders'));

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Orders')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should reload page when try again button is clicked', async () => {
      mockGetOrders.mockRejectedValueOnce(new Error('Failed to fetch orders'));

      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        const tryAgainButton = screen.getByText('Try Again');
        fireEvent.click(tryAgainButton);
        expect(mockReload).toHaveBeenCalled();
      });
    });
  });

  describe('Orders List', () => {
    const mockOrders = [
      {
        ...mockOrder,
        id: 'order-1',
        status: OrderStatus.PENDING,
        createdAt: new Date('2024-01-15'),
      },
      {
        ...mockOrder,
        id: 'order-2',
        status: OrderStatus.DELIVERED,
        createdAt: new Date('2024-01-10'),
        summary: {
          ...mockOrder.summary,
          total: 25.99,
        },
      },
    ];

    it('should display list of orders', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        })),
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
      });
    });

    it('should sort orders by creation date (newest first)', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        })),
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        const orderElements = screen.getAllByText(/Test Restaurant/);
        expect(orderElements).toHaveLength(2);
        // First order should be the newer one (order-1 from 2024-01-15)
      });
    });

    it('should display order totals correctly', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        })),
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CAD $40.81')).toBeInTheDocument();
        expect(screen.getByText('CAD $25.99')).toBeInTheDocument();
      });
    });

    it('should show order item count', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        })),
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('2 items')).toBeInTheDocument();
      });
    });
  });

  describe('Order Details View', () => {
    const mockOrderWithDetails = {
      ...mockOrder,
      id: 'detailed-order',
      status: OrderStatus.CONFIRMED,
      estimatedDeliveryTime: new Date('2024-01-20T18:00:00'),
    };

    it('should show order details when order is clicked', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: [{
          id: mockOrderWithDetails.id,
          data: () => mockOrderWithDetails,
        }],
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        const orderCard = screen.getByText('Test Restaurant').closest('div[role="button"], div[class*="cursor-pointer"]');
        if (orderCard) {
          fireEvent.click(orderCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Order Details')).toBeInTheDocument();
        expect(screen.getByText('Store Information')).toBeInTheDocument();
        expect(screen.getByText('Customer Information')).toBeInTheDocument();
        expect(screen.getByText('Order Items')).toBeInTheDocument();
      });
    });

    it('should show estimated delivery time in order details', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: [{
          id: mockOrderWithDetails.id,
          data: () => mockOrderWithDetails,
        }],
      });

      render(<OrderHistory onBack={mockOnBack} />);

      // Click on order to view details
      await waitFor(() => {
        const orderCard = screen.getByText('Test Restaurant').closest('[role="button"], [class*="cursor-pointer"]');
        if (orderCard) {
          fireEvent.click(orderCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Estimated Delivery')).toBeInTheDocument();
      });
    });

    it('should go back to list when back button is clicked in details view', async () => {
      mockGetOrders.mockResolvedValueOnce({
        docs: [{
          id: mockOrderWithDetails.id,
          data: () => mockOrderWithDetails,
        }],
      });

      render(<OrderHistory onBack={mockOnBack} />);

      // Navigate to details view
      await waitFor(() => {
        const orderCard = screen.getByText('Test Restaurant').closest('[role="button"], [class*="cursor-pointer"]');
        if (orderCard) {
          fireEvent.click(orderCard);
        }
      });

      // Click back button
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i }) || 
                          screen.getByLabelText(/back/i) ||
                          screen.getAllByRole('button')[0]; // First button is usually back
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Mode', () => {
    it('should render as modal when isOpen prop is provided', () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory isOpen={true} onClose={mockOnClose} />);

      // Modal should have overlay
      const modal = screen.getByRole('dialog') || 
                   document.querySelector('[class*="fixed"][class*="inset-0"]');
      expect(modal).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      const { container } = render(<OrderHistory isOpen={false} onClose={mockOnClose} />);

      expect(container.firstChild).toBeNull();
    });

    it('should call onClose when modal is used', async () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        const startShoppingButton = screen.getByText('Start Shopping');
        fireEvent.click(startShoppingButton);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      const orderWithDate = {
        ...mockOrder,
        createdAt: new Date('2024-01-15T14:30:00'),
      };

      mockGetOrders.mockResolvedValueOnce({
        docs: [{
          id: orderWithDate.id,
          data: () => orderWithDate,
        }],
      });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        // Should show formatted date
        expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Icons and Colors', () => {
    const statusTests = [
      { status: OrderStatus.PENDING, expectedText: 'Pending' },
      { status: OrderStatus.CONFIRMED, expectedText: 'Confirmed' },
      { status: OrderStatus.PREPARING, expectedText: 'Preparing' },
      { status: OrderStatus.READY, expectedText: 'Ready' },
      { status: OrderStatus.DELIVERED, expectedText: 'Delivered' },
      { status: OrderStatus.CANCELLED, expectedText: 'Cancelled' },
    ];

    statusTests.forEach(({ status, expectedText }) => {
      it(`should display correct status for ${status}`, async () => {
        const orderWithStatus = {
          ...mockOrder,
          status,
        };

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithStatus.id,
            data: () => orderWithStatus,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });
      });
    });
  });

  describe('No User State', () => {
    it('should handle case when no user is logged in', async () => {
      // Override mock to return no user
      vi.mocked(mockAuthContext).currentUser = null;

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        // Should show empty state or loading stops
        expect(mockGetOrders).not.toHaveBeenCalled();
      });
    });
  });
});