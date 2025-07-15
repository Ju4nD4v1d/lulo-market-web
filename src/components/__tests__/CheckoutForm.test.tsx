import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { CheckoutForm } from '../CheckoutForm';
import { mockUser, mockCartItem } from '../../test/utils';

// Mock Firebase Firestore
const mockAddDoc = vi.fn();
const mockCollection = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date());

vi.mock('firebase/firestore', () => ({
  addDoc: mockAddDoc,
  collection: mockCollection,
  serverTimestamp: mockServerTimestamp,
}));

vi.mock('../../config/firebase', () => ({
  db: {},
}));

// Mock CartContext
const mockCartContext = {
  cart: {
    items: [mockCartItem],
    summary: {
      subtotal: 31.98,
      tax: 3.84,
      deliveryFee: 4.99,
      total: 40.81,
      itemCount: 2,
    },
    storeId: 'store-123',
    storeName: 'Test Restaurant',
  },
  clearCart: vi.fn(),
};

vi.mock('../../context/CartContext', () => ({
  useCart: () => mockCartContext,
}));

// Mock AuthContext
const mockAuthContext = {
  currentUser: mockUser,
  userProfile: {
    displayName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    addresses: [
      {
        id: 'addr-1',
        label: 'Home',
        street: '123 Test St',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        isDefault: true,
      },
    ],
  },
  login: vi.fn(),
  refreshUserProfile: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock LanguageContext
const mockLanguageContext = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      'checkout.title': 'Checkout',
      'checkout.contactInfo': 'Contact Information',
      'checkout.deliveryAddress': 'Delivery Address',
      'checkout.orderSummary': 'Order Summary',
      'checkout.name': 'Full Name',
      'checkout.namePlaceholder': 'Enter your full name',
      'checkout.email': 'Email',
      'checkout.emailPlaceholder': 'Enter your email',
      'checkout.phone': 'Phone',
      'checkout.phonePlaceholder': 'Enter your phone number',
      'checkout.street': 'Street Address',
      'checkout.streetPlaceholder': 'Enter your street address',
      'checkout.city': 'City',
      'checkout.cityPlaceholder': 'Enter your city',
      'checkout.province': 'Province',
      'checkout.postalCode': 'Postal Code',
      'checkout.postalCodePlaceholder': 'Enter postal code',
      'checkout.deliveryInstructions': 'Delivery Instructions',
      'checkout.deliveryInstructionsPlaceholder': 'Special delivery instructions',
      'checkout.selectDeliveryDate': 'Select Delivery Date',
      'checkout.placeOrder': 'Place Order',
      'checkout.processing': 'Processing...',
      'checkout.deliveryOnly': 'All orders are delivered to your address',
      'cart.subtotal': 'Subtotal',
      'cart.tax': 'Tax (HST)',
      'cart.deliveryFee': 'Delivery Fee',
      'cart.total': 'Total',
      'common.required': 'This field is required',
      'checkout.invalidEmail': 'Please enter a valid email address',
      'checkout.invalidPhone': 'Please enter a valid phone number',
      'checkout.invalidPostalCode': 'Please enter a valid postal code',
      'checkout.orderSuccess': 'Order placed successfully!',
      'checkout.orderError': 'Failed to place order. Please try again.',
    };
    return translations[key] || key;
  },
  locale: 'en',
};

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext,
}));

describe('CheckoutForm Component', () => {
  const mockOnBack = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'order-123' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render checkout form with all sections', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Delivery Address')).toBeInTheDocument();
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('should pre-fill form with user profile data', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should pre-fill address with default address', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Vancouver')).toBeInTheDocument();
      expect(screen.getByDisplayValue('V6B 1A1')).toBeInTheDocument();
    });

    it('should display order summary correctly', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('$31.98')).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('$3.84')).toBeInTheDocument();  // Tax
      expect(screen.getByText('$4.99')).toBeInTheDocument();  // Delivery fee
      expect(screen.getByText('$40.81')).toBeInTheDocument(); // Total
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      // Clear required fields
      const nameInput = screen.getByPlaceholderText('Enter your full name');
      fireEvent.change(nameInput, { target: { value: '' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const phoneInput = screen.getByPlaceholderText('Enter your phone number');
      fireEvent.change(phoneInput, { target: { value: '123' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    it('should validate Canadian postal code format', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const postalCodeInput = screen.getByPlaceholderText('Enter postal code');
      fireEvent.change(postalCodeInput, { target: { value: '12345' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid postal code')).toBeInTheDocument();
      });
    });

    it('should accept valid Canadian postal codes', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const postalCodeInput = screen.getByPlaceholderText('Enter postal code');
      fireEvent.change(postalCodeInput, { target: { value: 'V6B 1A1' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid postal code')).not.toBeInTheDocument();
      });
    });
  });

  describe('Order Submission', () => {
    it('should submit order successfully', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalledWith('order-123');
      });
    });

    it('should show loading state during submission', async () => {
      // Make addDoc hang to test loading state
      mockAddDoc.mockImplementation(() => new Promise(() => {}));

      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('should handle order submission errors', async () => {
      mockAddDoc.mockRejectedValue(new Error('Network error'));

      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to place order. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear cart after successful order', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockCartContext.clearCart).toHaveBeenCalled();
      });
    });

    it('should include all order data in submission', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            userId: mockUser.uid,
            storeId: mockCartContext.cart.storeId,
            storeName: mockCartContext.cart.storeName,
            items: mockCartContext.cart.items,
            summary: mockCartContext.cart.summary,
            customerInfo: expect.objectContaining({
              name: 'Test User',
              email: 'test@example.com',
              phone: '+1234567890',
            }),
            deliveryAddress: expect.objectContaining({
              street: '123 Test St',
              city: 'Vancouver',
              province: 'BC',
              postalCode: 'V6B 1A1',
            }),
            status: 'pending',
          })
        );
      });
    });
  });

  describe('Delivery Date Selection', () => {
    it('should render delivery date selector', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Select Delivery Date')).toBeInTheDocument();
    });

    it('should not allow selecting past dates', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      // Date input should have min attribute set to tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const dateInput = screen.getByLabelText(/delivery date/i) || 
                       screen.getByRole('textbox', { name: /date/i });
      expect(dateInput).toHaveAttribute('min', tomorrowString);
    });
  });

  describe('Back Navigation', () => {
    it('should call onBack when back button is clicked', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const backButton = screen.getByRole('button', { name: /back/i }) ||
                        screen.getByLabelText(/back/i);
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Empty Cart Handling', () => {
    it('should handle empty cart gracefully', () => {
      const emptyCartContext = {
        cart: {
          items: [],
          summary: { subtotal: 0, tax: 0, deliveryFee: 0, total: 0, itemCount: 0 },
          storeId: null,
          storeName: null,
        },
        clearCart: vi.fn(),
      };

      vi.mocked(mockCartContext).cart = emptyCartContext.cart;

      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      // Should render but place order button should be disabled or show appropriate message
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
  });

  describe('User Profile Integration', () => {
    it('should handle user without profile data', () => {
      vi.mocked(mockAuthContext).userProfile = null;

      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      // Form should render with empty fields
      expect(screen.getByPlaceholderText('Enter your full name')).toHaveValue('');
    });

    it('should handle user without saved addresses', () => {
      const authContextWithoutAddresses = {
        ...mockAuthContext,
        userProfile: {
          ...mockAuthContext.userProfile!,
          addresses: [],
        },
      };

      vi.mocked(mockAuthContext).userProfile = authContextWithoutAddresses.userProfile;

      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      // Address fields should be empty
      expect(screen.getByPlaceholderText('Enter your street address')).toHaveValue('');
    });
  });

  describe('Special Instructions', () => {
    it('should allow entering delivery instructions', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const instructionsInput = screen.getByPlaceholderText('Special delivery instructions');
      fireEvent.change(instructionsInput, { target: { value: 'Ring doorbell twice' } });

      expect(instructionsInput).toHaveValue('Ring doorbell twice');
    });

    it('should include delivery instructions in order submission', async () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const instructionsInput = screen.getByPlaceholderText('Special delivery instructions');
      fireEvent.change(instructionsInput, { target: { value: 'Ring doorbell twice' } });

      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            deliveryAddress: expect.objectContaining({
              deliveryInstructions: 'Ring doorbell twice',
            }),
          })
        );
      });
    });
  });

  describe('Form Field Interactions', () => {
    it('should update form fields correctly', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(nameInput).toHaveValue('New Name');
    });

    it('should handle province selection', () => {
      render(<CheckoutForm onBack={mockOnBack} onSuccess={mockOnSuccess} />);

      const provinceSelect = screen.getByRole('combobox', { name: /province/i }) ||
                           screen.getByDisplayValue('BC');
      fireEvent.change(provinceSelect, { target: { value: 'ON' } });

      expect(provinceSelect).toHaveValue('ON');
    });
  });
});