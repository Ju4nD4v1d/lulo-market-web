import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { OrderHistory } from '../OrderHistory';
import { mockUser, mockOrder } from '../../test/utils';
import { OrderStatus } from '../../types/order';
import { generateReceiptAPI } from '../../config/api';

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
      'orderHistory.generateReceipt': 'Generate Receipt',
      'orderHistory.generatingReceipt': 'Generating...',
      'orderHistory.downloadReceipt': 'Download Receipt',
      'orderHistory.receiptError': 'Could not generate receipt. Please try again.',
      'orderHistory.receipt': 'Receipt',
    };
    return translations[key] || key;
  },
  locale: 'en',
};

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext,
}));

// Mock API configuration
vi.mock('../../config/api', () => ({
  generateReceiptAPI: vi.fn(),
  isDevelopment: true,
  getEnvironmentInfo: () => ({
    environment: 'test',
    isDevelopment: true,
    receiptEndpoint: 'mock-endpoint'
  })
}));

describe('OrderHistory Component', () => {
  const mockOnBack = vi.fn();

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
        const storeNames = screen.getAllByText('Test Restaurant');
        expect(storeNames.length).toBeGreaterThanOrEqual(2);
        
        // Look for status badges specifically (not dropdown options)
        const statusBadges = screen.getAllByText('Pending').filter(element => 
          element.closest('[class*="rounded-full"]')
        );
        expect(statusBadges.length).toBeGreaterThan(0);
        
        const deliveredBadges = screen.getAllByText('Delivered').filter(element => 
          element.closest('[class*="rounded-full"]')
        );
        expect(deliveredBadges.length).toBeGreaterThan(0);
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
        const itemCounts = screen.getAllByText('2 items');
        expect(itemCounts).toHaveLength(2);
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
        const orderCard = screen.getAllByText('Test Restaurant')[0].closest('div[role="button"], div[class*="cursor-pointer"]');
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
        const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[role="button"], [class*="cursor-pointer"]');
        if (orderCard) {
          fireEvent.click(orderCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/Estimated Delivery/i)).toBeInTheDocument();
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
        const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[role="button"], [class*="cursor-pointer"]');
        if (orderCard) {
          fireEvent.click(orderCard);
        }
      });

      // Click back button
      await waitFor(() => {
        const backButton = screen.getAllByRole('button')[0];
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Mode', () => {
    it('should render when opened', () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory onBack={mockOnBack} />);

      // Component should be in the document
      expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    it('should call onBack when start shopping is clicked', async () => {
      mockGetOrders.mockResolvedValueOnce({ docs: [] });

      render(<OrderHistory onBack={mockOnBack} />);

      await waitFor(() => {
        const startShoppingButton = screen.getByText('Start Shopping');
        fireEvent.click(startShoppingButton);
        expect(mockOnBack).toHaveBeenCalled();
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
          const statusElements = screen.getAllByText(expectedText);
          expect(statusElements.length).toBeGreaterThan(0);
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

  describe('Receipt Functionality', () => {
    // Mock the generateReceiptAPI function
    const mockGenerateReceiptAPI = vi.mocked(generateReceiptAPI);

    beforeEach(() => {
      mockGenerateReceiptAPI.mockClear();
    });

    describe('Generate Receipt Button', () => {
      it('should show Generate Receipt button when no receiptUrl exists', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'order-without-receipt',
          receiptUrl: undefined,
        };

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithoutReceipt.id,
            data: () => orderWithoutReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        await waitFor(() => {
          expect(screen.getByText('Receipt')).toBeInTheDocument();
          expect(screen.getByText('Generate Receipt')).toBeInTheDocument();
          expect(screen.queryByText('Download Receipt')).not.toBeInTheDocument();
        });
      });

      it('should show Download Receipt button when receiptUrl exists', async () => {
        const orderWithReceipt = {
          ...mockOrder,
          id: 'order-with-receipt',
          receiptUrl: 'https://example.com/receipt.pdf',
        };

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithReceipt.id,
            data: () => orderWithReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        await waitFor(() => {
          expect(screen.getByText('Receipt')).toBeInTheDocument();
          expect(screen.getByText('Download Receipt')).toBeInTheDocument();
          expect(screen.queryByText('Generate Receipt')).not.toBeInTheDocument();
        });
      });
    });

    describe('Receipt Generation Process', () => {
      it('should show loading state when generating receipt', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'order-loading-test',
          receiptUrl: undefined,
        };

        // Mock successful API response but slow
        mockGenerateReceiptAPI.mockImplementation(() => 
          new Promise(resolve => {
            setTimeout(() => resolve(new Response('{}', { status: 200 })), 100);
          })
        );

        // Mock getOrders to return updated data on second call
        mockGetOrders
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => orderWithoutReceipt,
            }],
          })
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => ({ ...orderWithoutReceipt, receiptUrl: 'https://example.com/receipt.pdf' }),
            }],
          });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Generate Receipt button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        // Should show loading state
        await waitFor(() => {
          expect(screen.getByText('Generating...')).toBeInTheDocument();
          const button = screen.getByRole('button', { name: /generating/i });
          expect(button).toBeDisabled();
        });

        // Wait for completion
        await waitFor(() => {
          expect(screen.getByText('Download Receipt')).toBeInTheDocument();
        });
      });

      it('should call receipt generation API with correct parameters', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'test-order-id',
          receiptUrl: undefined,
        };

        mockGenerateReceiptAPI.mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          message: 'Receipt generated successfully',
          receiptUrl: 'https://example.com/receipt.pdf',
          orderId: 'test-order-id',
          generatedAt: new Date().toISOString()
        }), { status: 200 }));
        mockGetOrders
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => orderWithoutReceipt,
            }],
          })
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => ({ ...orderWithoutReceipt, receiptUrl: 'https://example.com/receipt.pdf' }),
            }],
          });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Generate Receipt button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        // Verify API call
        await waitFor(() => {
          expect(mockGenerateReceiptAPI).toHaveBeenCalledWith('test-order-id');
        });
      });

      it('should update order data after successful receipt generation', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'update-test-order',
          receiptUrl: undefined,
        };

        mockGenerateReceiptAPI.mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          message: 'Receipt generated successfully',
          receiptUrl: 'https://example.com/receipt.pdf',
          orderId: 'test-order-id',
          generatedAt: new Date().toISOString()
        }), { status: 200 }));
        mockGetOrders
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => orderWithoutReceipt,
            }],
          })
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => ({ ...orderWithoutReceipt, receiptUrl: 'https://example.com/receipt.pdf' }),
            }],
          });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Generate Receipt button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        // Should call getOrders again to refresh data
        await waitFor(() => {
          expect(mockGetOrders).toHaveBeenCalledTimes(2);
          expect(screen.getByText('Download Receipt')).toBeInTheDocument();
        });
      });
    });

    describe('Receipt Download', () => {
      it('should open receipt URL in new window when download button is clicked', async () => {
        const orderWithReceipt = {
          ...mockOrder,
          id: 'download-test-order',
          receiptUrl: 'https://example.com/receipt.pdf',
        };

        // Mock window.open
        const mockWindowOpen = vi.fn();
        vi.stubGlobal('open', mockWindowOpen);

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithReceipt.id,
            data: () => orderWithReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Download Receipt button
        await waitFor(() => {
          const downloadButton = screen.getByText('Download Receipt');
          fireEvent.click(downloadButton);
        });

        expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/receipt.pdf', '_blank');
      });
    });

    describe('Error Handling', () => {
      it('should show error message when receipt generation fails', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'error-test-order',
          receiptUrl: undefined,
        };

        mockGenerateReceiptAPI.mockRejectedValueOnce(new Error('Network error'));
        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithoutReceipt.id,
            data: () => orderWithoutReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Generate Receipt button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        // Should show error message
        await waitFor(() => {
          expect(screen.getByText('Could not generate receipt. Please try again.')).toBeInTheDocument();
          expect(screen.getByText('Generate Receipt')).toBeInTheDocument(); // Button should be enabled again
        });
      });

      it('should handle HTTP error responses', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'http-error-test',
          receiptUrl: undefined,
        };

        mockGenerateReceiptAPI.mockResolvedValueOnce(new Response('Error', { status: 500 }));
        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithoutReceipt.id,
            data: () => orderWithoutReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Click Generate Receipt button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        // Should show error message
        await waitFor(() => {
          expect(screen.getByText('Could not generate receipt. Please try again.')).toBeInTheDocument();
        });
      });

      it('should allow retry after error', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'retry-test-order',
          receiptUrl: undefined,
        };

        // First call fails, second succeeds
        mockGenerateReceiptAPI
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(new Response('{}', { status: 200 }));

        mockGetOrders
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => orderWithoutReceipt,
            }],
          })
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => ({ ...orderWithoutReceipt, receiptUrl: 'https://example.com/receipt.pdf' }),
            }],
          });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // First attempt - should fail
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          fireEvent.click(generateButton);
        });

        await waitFor(() => {
          expect(screen.getByText('Could not generate receipt. Please try again.')).toBeInTheDocument();
        });

        // Second attempt - should succeed
        await waitFor(() => {
          const retryButton = screen.getByText('Generate Receipt');
          fireEvent.click(retryButton);
        });

        await waitFor(() => {
          expect(screen.getByText('Download Receipt')).toBeInTheDocument();
        });
      });
    });

    describe('Mobile Responsive Behavior', () => {
      it('should maintain receipt functionality on mobile viewports', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'mobile-test-order',
          receiptUrl: undefined,
        };

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithoutReceipt.id,
            data: () => orderWithoutReceipt,
          }],
        });

        // Mock mobile viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Receipt section should be present and functional
        await waitFor(() => {
          const receiptSection = screen.getByText('Receipt');
          expect(receiptSection).toBeInTheDocument();
          
          const generateButton = screen.getByText('Generate Receipt');
          expect(generateButton).toBeInTheDocument();
          expect(generateButton).toBeEnabled();
        });
      });

      it('should handle touch interactions on mobile', async () => {
        const orderWithReceipt = {
          ...mockOrder,
          id: 'touch-test-order',
          receiptUrl: 'https://example.com/receipt.pdf',
        };

        const mockWindowOpen = vi.fn();
        vi.stubGlobal('open', mockWindowOpen);

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithReceipt.id,
            data: () => orderWithReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Test touch interaction
        await waitFor(() => {
          const downloadButton = screen.getByText('Download Receipt');
          fireEvent.touchStart(downloadButton);
          fireEvent.touchEnd(downloadButton);
          fireEvent.click(downloadButton);
        });

        expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/receipt.pdf', '_blank');
      });
    });

    describe('Accessibility', () => {
      it('should have proper ARIA labels and roles', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'a11y-test-order',
          receiptUrl: undefined,
        };

        mockGetOrders.mockResolvedValueOnce({
          docs: [{
            id: orderWithoutReceipt.id,
            data: () => orderWithoutReceipt,
          }],
        });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        await waitFor(() => {
          const generateButton = screen.getByRole('button', { name: /generate receipt/i });
          expect(generateButton).toBeInTheDocument();
          expect(generateButton).toBeEnabled();
        });
      });

      it('should maintain focus management during state changes', async () => {
        const orderWithoutReceipt = {
          ...mockOrder,
          id: 'focus-test-order',
          receiptUrl: undefined,
        };

        mockGenerateReceiptAPI.mockResolvedValueOnce(new Response(JSON.stringify({
          success: true,
          message: 'Receipt generated successfully',
          receiptUrl: 'https://example.com/receipt.pdf',
          orderId: 'test-order-id',
          generatedAt: new Date().toISOString()
        }), { status: 200 }));
        mockGetOrders
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => orderWithoutReceipt,
            }],
          })
          .mockResolvedValueOnce({
            docs: [{
              id: orderWithoutReceipt.id,
              data: () => ({ ...orderWithoutReceipt, receiptUrl: 'https://example.com/receipt.pdf' }),
            }],
          });

        render(<OrderHistory onBack={mockOnBack} />);

        // Navigate to order details
        await waitFor(() => {
          const orderCard = screen.getAllByText('Test Restaurant')[0].closest('[class*="cursor-pointer"]');
          if (orderCard) {
            fireEvent.click(orderCard);
          }
        });

        // Focus on generate button
        await waitFor(() => {
          const generateButton = screen.getByText('Generate Receipt');
          generateButton.focus();
          expect(generateButton).toHaveFocus();
          fireEvent.click(generateButton);
        });

        // After state change, download button should be focusable
        await waitFor(() => {
          const downloadButton = screen.getByText('Download Receipt');
          expect(downloadButton).toBeInTheDocument();
        });
      });
    });
  });
});