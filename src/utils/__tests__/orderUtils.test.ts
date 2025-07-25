import { describe, it, expect } from 'vitest';
import { generateOrderId, isValidOrderId, getTimestampFromOrderId, generateReceiptNumber, calculateTaxBreakdown } from '../orderUtils';

describe('orderUtils', () => {
  describe('generateOrderId', () => {
    it('should generate order ID with correct format', () => {
      const orderId = generateOrderId();
      expect(orderId).toMatch(/^order_\d{13}_[a-z0-9]{8}$/);
    });

    it('should generate unique order IDs', () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();
      expect(id1).not.toBe(id2);
    });

    it('should start with "order_"', () => {
      const orderId = generateOrderId();
      expect(orderId).toMatch(/^order_/);
    });

    it('should have a timestamp part', () => {
      const orderId = generateOrderId();
      const parts = orderId.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[1]).toMatch(/^\d{13}$/);
    });
  });

  describe('isValidOrderId', () => {
    it('should validate correct order ID format', () => {
      const validId = 'order_1753222065065_i3hwfxx7w';
      expect(isValidOrderId(validId)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidOrderId('invalid')).toBe(false);
      expect(isValidOrderId('order_123_abc')).toBe(false);
      expect(isValidOrderId('order_1753222065065_')).toBe(false);
      expect(isValidOrderId('1753222065065_i3hwfxx7w')).toBe(false);
      expect(isValidOrderId('order_abc_i3hwfxx7w')).toBe(false);
    });

    it('should validate generated order IDs', () => {
      const orderId = generateOrderId();
      expect(isValidOrderId(orderId)).toBe(true);
    });
  });

  describe('getTimestampFromOrderId', () => {
    it('should extract timestamp from valid order ID', () => {
      const testTimestamp = 1753222065065;
      const orderId = `order_${testTimestamp}_i3hwfxx7w`;
      const extractedTimestamp = getTimestampFromOrderId(orderId);
      expect(extractedTimestamp).toBe(testTimestamp);
    });

    it('should return null for invalid order ID', () => {
      expect(getTimestampFromOrderId('invalid')).toBe(null);
      expect(getTimestampFromOrderId('order_abc_def')).toBe(null);
      expect(getTimestampFromOrderId('order_123')).toBe(null);
    });

    it('should extract timestamp from generated order ID', () => {
      const beforeGeneration = Date.now();
      const orderId = generateOrderId();
      const afterGeneration = Date.now();
      
      const extractedTimestamp = getTimestampFromOrderId(orderId);
      expect(extractedTimestamp).not.toBe(null);
      expect(extractedTimestamp!).toBeGreaterThanOrEqual(beforeGeneration);
      expect(extractedTimestamp!).toBeLessThanOrEqual(afterGeneration);
    });
  });

  describe('generateReceiptNumber', () => {
    it('should generate receipt number from order ID', () => {
      const orderId = 'order_1753222065065_i3hwfxx7w';
      const receiptNumber = generateReceiptNumber(orderId);
      expect(receiptNumber).toBe('#5065-I3HW');
    });

    it('should generate receipt number from generated order ID', () => {
      const orderId = generateOrderId();
      const receiptNumber = generateReceiptNumber(orderId);
      expect(receiptNumber).toMatch(/^#\d{4}-[A-Z0-9]{4}$/);
    });

    it('should handle invalid order IDs with fallback', () => {
      const receiptNumber = generateReceiptNumber('invalid-id');
      expect(receiptNumber).toMatch(/^#\d{4}-[A-Z0-9X]{4}$/);
    });
  });

  describe('calculateTaxBreakdown', () => {
    it('should calculate BC taxes correctly', () => {
      const result = calculateTaxBreakdown(100, 'BC');
      expect(result.gst).toBe(5);
      expect(result.pst).toBe(7);
      expect(result.hst).toBe(0);
      expect(result.total).toBe(12);
    });

    it('should calculate Ontario HST correctly', () => {
      const result = calculateTaxBreakdown(100, 'ON');
      expect(result.gst).toBe(5);
      expect(result.pst).toBe(0);
      expect(result.hst).toBe(13);
      expect(result.total).toBe(18); // Note: GST + HST for ON
    });

    it('should calculate Alberta taxes (GST only)', () => {
      const result = calculateTaxBreakdown(100, 'AB');
      expect(result.gst).toBe(5);
      expect(result.pst).toBe(0);
      expect(result.hst).toBe(0);
      expect(result.total).toBe(5);
    });

    it('should default to BC when no province specified', () => {
      const result = calculateTaxBreakdown(100);
      expect(result.gst).toBe(5);
      expect(result.pst).toBe(7);
      expect(result.total).toBe(12);
    });
  });
});