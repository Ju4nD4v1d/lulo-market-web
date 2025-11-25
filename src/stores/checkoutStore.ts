import { create } from 'zustand';

interface CheckoutState {
  shouldOpenCheckout: boolean;
  triggerCheckout: () => void;
  closeCheckout: () => void;
  reset: () => void;
}

/**
 * Checkout Store
 * Manages checkout flow state, replacing window event-based communication
 *
 * Usage:
 * - triggerCheckout(): Call after login to auto-open checkout
 * - closeCheckout(): Reset checkout trigger state
 * - shouldOpenCheckout: Boolean flag to check if checkout should open
 */
export const useCheckoutStore = create<CheckoutState>((set) => ({
  shouldOpenCheckout: false,

  triggerCheckout: () => set({ shouldOpenCheckout: true }),

  closeCheckout: () => set({ shouldOpenCheckout: false }),

  reset: () => set({ shouldOpenCheckout: false }),
}));
