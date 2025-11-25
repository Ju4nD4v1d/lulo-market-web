/**
 * EmptyCartView - Displays when user reaches checkout with empty cart
 *
 * Shows a friendly message and provides a button to return to shopping.
 * This can happen if:
 * - User manually clears cart during checkout
 * - Session expires and cart is lost
 * - Direct navigation to checkout URL
 */

import type * as React from 'react';

interface EmptyCartViewProps {
  onBack: () => void;
  t: (key: string) => string;
}

export const EmptyCartView: React.FC<EmptyCartViewProps> = ({ onBack, t }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '1rem',
        color: 'rgb(17 24 39)'
      }}>
        {t('cart.empty')}
      </h2>
      <p style={{
        color: 'rgb(75 85 99)',
        marginBottom: '1.5rem',
        lineHeight: '1.5'
      }}>
        {t('cart.emptyMessage')}
      </p>
      <button
        onClick={onBack}
        style={{
          backgroundColor: 'var(--primary-400, #C8E400)',
          color: 'rgb(17 24 39)',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontWeight: '700',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
      >
        {t('button.continueShopping')}
      </button>
    </div>
  );
};
