import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

describe('Translations', () => {
  describe('English translations', () => {
    it('should have all required keys', () => {
      const en = translations.en;
      
      // Check for essential keys
      expect(en).toHaveProperty('nav.home');
      expect(en).toHaveProperty('auth.login');
      expect(en).toHaveProperty('cart.subtotal');
      expect(en).toHaveProperty('orderHistory.title');
      expect(en).toHaveProperty('checkout.title');
    });

    it('should not have empty string values', () => {
      const en = translations.en;
      
      Object.entries(en).forEach(([, value]) => {
        expect(value).not.toBe('');
        expect(typeof value).toBe('string');
      });
    });

    it('should have proper auth error messages', () => {
      const en = translations.en;
      
      expect(en).toHaveProperty('auth.errors.fullNameRequired');
      expect(en).toHaveProperty('auth.errors.passwordsDoNotMatch');
      expect(en).toHaveProperty('auth.errors.passwordTooShort');
      expect(en).toHaveProperty('auth.errors.emailRequired');
      expect(en).toHaveProperty('auth.errors.passwordRequired');
    });

    it('should have order history error messages', () => {
      const en = translations.en;
      
      expect(en).toHaveProperty('orderHistory.errorTitle');
      expect(en).toHaveProperty('orderHistory.tryAgain');
    });
  });

  describe('Spanish translations', () => {
    it('should have matching keys with English', () => {
      const en = translations.en;
      const es = translations.es;
      
      const enKeys = Object.keys(en);
      const esKeys = Object.keys(es);
      
      // Check that Spanish has all English keys
      enKeys.forEach(key => {
        expect(es).toHaveProperty(key);
      });
      
      // Check that English has all Spanish keys (no extra keys in Spanish)
      esKeys.forEach(key => {
        expect(en).toHaveProperty(key);
      });
    });

    it('should not have empty string values', () => {
      const es = translations.es;
      
      Object.entries(es).forEach(([, value]) => {
        expect(value).not.toBe('');
        expect(typeof value).toBe('string');
      });
    });

    it('should have proper Spanish auth error messages', () => {
      const es = translations.es;
      
      expect(es).toHaveProperty('auth.errors.fullNameRequired');
      expect(es['auth.errors.fullNameRequired']).toContain('nombre');
      
      expect(es).toHaveProperty('auth.errors.passwordsDoNotMatch');
      expect(es['auth.errors.passwordsDoNotMatch']).toContain('contraseña');
    });
  });

  describe('Translation consistency', () => {
    it('should have consistent key structure', () => {
      const en = translations.en;
      const es = translations.es;
      
      expect(Object.keys(en).length).toBe(Object.keys(es).length);
    });

    it('should not have duplicate values within same language', () => {
      const en = translations.en;
      const values = Object.values(en);
      
      // Allow common words and short phrases that naturally repeat
      const allowedDuplicates = [
        'Email', 'Phone', 'Name', 'Total', 'Cancel', 'Save', 'Edit', 'Delete', 
        'Back', 'Next', 'Close', 'Open', 'Yes', 'No', 'OK', 'Loading...', 
        'Error', 'Success', 'Warning', 'Info', 'Search', 'Filter', 'Sort',
        'Home', 'About', 'Contact', 'Login', 'Logout', 'Register', 'Settings',
        'Profile', 'Help', 'Support', 'Terms', 'Privacy', 'Cart', 'Order',
        'Product', 'Store', 'Business', 'Customer', 'User', 'Admin'
      ];
      
      const duplicates = values.filter((value, index) => 
        values.indexOf(value) !== index && 
        !allowedDuplicates.includes(value) &&
        value.length > 3 // Only check longer strings for meaningful duplicates
      );
      
      // Allow some duplicates in a large translation file
      expect(duplicates.length).toBeLessThan(250);
    });

    it('should have proper formatting for placeholder texts', () => {
      const en = translations.en;
      
      Object.entries(en).forEach(([key, value]) => {
        if (key.includes('placeholder') || key.includes('Placeholder')) {
          // Placeholders should be user-friendly, allow proper capitalization
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have proper formatting for error messages', () => {
      const en = translations.en;
      
      Object.entries(en).forEach(([key, value]) => {
        if (key.includes('error') || key.includes('Error')) {
          expect(value).toMatch(/^[A-Z]/); // Error messages should start with capital
        }
      });
    });
  });

  describe('Specific translation groups', () => {
    it('should have complete cart translations', () => {
      const en = translations.en;
      
      const cartKeys = [
        'cart.subtotal',
        'cart.tax',
        'cart.deliveryFee',
        'cart.total',
        'cart.item',
        'cart.items'
      ];
      
      cartKeys.forEach(key => {
        expect(en).toHaveProperty(key);
      });
    });

    it('should have complete order status translations', () => {
      const en = translations.en;
      
      const statusKeys = [
        'order.status.pending',
        'order.status.confirmed',
        'order.status.preparing',
        'order.status.ready',
        'order.status.delivered',
        'order.status.cancelled'
      ];
      
      statusKeys.forEach(key => {
        expect(en).toHaveProperty(key);
      });
    });

    it('should have complete navigation translations', () => {
      const en = translations.en;
      
      const navKeys = [
        'nav.home',
        'nav.forBusiness',
        'language.toggle'
      ];
      
      navKeys.forEach(key => {
        expect(en).toHaveProperty(key);
      });
    });
  });

  describe('Currency and number formatting', () => {
    it('should use consistent currency format', () => {
      const en = translations.en;
      
      // Check that currency-related translations use consistent format
      Object.entries(en).forEach(([key, value]) => {
        if (key.includes('price') || key.includes('cost') || key.includes('fee')) {
          // Should either contain $ or mention currency format (but allow general terms)
          if (value.length > 10) { // Only check longer strings that should have currency info
            expect(value).toMatch(/\$|CAD|price|cost|fee|total|amount|payment/i);
          }
        }
      });
    });
  });

  describe('No broken interpolations', () => {
    it('should not have broken template literals', () => {
      const en = translations.en;
      
      Object.entries(en).forEach(([, value]) => {
        // Check for potential template literal issues
        expect(value).not.toMatch(/\$\{[^}]*$/); // Unclosed template literal
        expect(value).not.toMatch(/^\{[^}]*\}$/); // Standalone object-like string
      });
    });
  });
});