/**
 * Order utilities for consistent ID generation and handling
 */

/**
 * Generate a consistent order ID that will be used for both:
 * - Firestore document ID (the path)  
 * - id field inside the document
 * 
 * Format: order_[timestamp]_[randomString]
 * Example: order_1753222065065_i3hwfxx7w
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  let randomString = Math.random().toString(36).substring(2, 10);
  
  // Ensure the random string is exactly 8 characters by padding with more random chars if needed
  while (randomString.length < 8) {
    randomString += Math.random().toString(36).substring(2, 3);
  }
  randomString = randomString.substring(0, 8); // Ensure it's exactly 8 characters
  
  return `order_${timestamp}_${randomString}`;
}

/**
 * Validate that an order ID follows the expected format
 */
export function isValidOrderId(orderId: string): boolean {
  const orderIdRegex = /^order_\d{13}_[a-z0-9]{6,10}$/;
  return orderIdRegex.test(orderId);
}

/**
 * Extract timestamp from order ID
 */
export function getTimestampFromOrderId(orderId: string): number | null {
  try {
    const parts = orderId.split('_');
    if (parts.length === 3 && parts[0] === 'order') {
      const timestamp = parseInt(parts[1], 10);
      return isNaN(timestamp) ? null : timestamp;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a user-friendly receipt number from order ID
 * Example: order_1753222065065_i3hwfxx7w -> #2065-I3HW
 */
export function generateReceiptNumber(orderId: string): string {
  try {
    const parts = orderId.split('_');
    if (parts.length === 3 && parts[0] === 'order') {
      // Get last 4 digits of timestamp
      const timestamp = parts[1];
      const last4 = timestamp.slice(-4);
      
      // Get first 4 characters of random string, uppercase
      const randomPart = parts[2].substring(0, 4).toUpperCase();
      
      return `#${last4}-${randomPart}`;
    }
    
    // Fallback for non-standard order IDs
    return `#${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  } catch {
    return `#${Date.now().toString().slice(-4)}-XXXX`;
  }
}

/**
 * Calculate tax breakdown for Canadian provinces
 */
export function calculateTaxBreakdown(subtotal: number, province: string = 'BC') {
  const gstRate = 0.05; // 5% GST everywhere in Canada
  const gst = subtotal * gstRate;
  
  let pst = 0;
  let hst = 0;
  
  switch (province.toUpperCase()) {
    case 'BC':
      pst = subtotal * 0.07; // 7% PST in BC
      break;
    case 'ON':
    case 'NB':
    case 'NL':
    case 'NS':
    case 'PE':
      hst = subtotal * 0.13; // 13% HST
      break;
    case 'SK':
    case 'MB':
      pst = subtotal * 0.06; // 6% PST
      break;
    case 'QC':
      pst = subtotal * 0.09975; // 9.975% QST
      break;
    // AB, YT, NT, NU only have GST
    default:
      break;
  }
  
  return {
    gst: Math.round(gst * 100) / 100,
    pst: Math.round(pst * 100) / 100,
    hst: Math.round(hst * 100) / 100,
    total: Math.round((gst + pst + hst) * 100) / 100
  };
}