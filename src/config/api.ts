/**
 * API Configuration
 * Centralized management of API endpoints and configurations
 */

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isStaging = import.meta.env.VITE_ENV === 'staging';
export const isProduction = import.meta.env.VITE_ENV === 'production';

// Development fallback URLs (only used when VITE_ENV is not 'production')
const DEV_FALLBACK_ENDPOINTS = {
  receiptGeneration: 'https://generatereceiptmanually-6v2n7ecudq-uc.a.run.app',
  paymentIntent: 'https://createpaymentintent-6v2n7ecudq-uc.a.run.app',
  invitationRequest: 'https://sendinvitationrequestemail-6v2n7ecudq-uc.a.run.app',
  webhook: 'https://handlepaymentwebhook-6v2n7ecudq-uc.a.run.app',
};

// API Base URLs
const API_BASE_URLS = {
  development: 'http://localhost:3000', // Local development server
  staging: 'https://us-central1-lulop-eds249.cloudfunctions.net',
  production: 'https://us-central1-lulocart-prod.cloudfunctions.net', // Production project
};

// Get current environment base URL
const getCurrentBaseURL = (): string => {
  if (isDevelopment) return API_BASE_URLS.development;
  if (isProduction) return API_BASE_URLS.production;
  return API_BASE_URLS.staging; // Default to staging
};

// API Endpoints configuration
// In production, all endpoints MUST come from environment variables
// In development, fallbacks are allowed for convenience
export const API_ENDPOINTS = {
  // Receipt generation endpoint
  receiptGeneration:
    import.meta.env.VITE_RECEIPT_ENDPOINT ||
    (isProduction ? '' : DEV_FALLBACK_ENDPOINTS.receiptGeneration),

  // Payment intent endpoint
  paymentIntent:
    import.meta.env.VITE_PAYMENT_INTENT_ENDPOINT ||
    (isProduction ? '' : DEV_FALLBACK_ENDPOINTS.paymentIntent),

  // Invitation request endpoint
  invitationRequest:
    import.meta.env.VITE_INVITATION_ENDPOINT ||
    (isProduction ? '' : DEV_FALLBACK_ENDPOINTS.invitationRequest),

  // Webhook endpoint
  webhook:
    import.meta.env.VITE_STRIPE_WEBHOOK_ENDPOINT ||
    (isProduction ? '' : DEV_FALLBACK_ENDPOINTS.webhook),
};

// Validate required endpoints in production
if (isProduction) {
  const missingEndpoints = Object.entries(API_ENDPOINTS)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEndpoints.length > 0) {
    console.error(
      `Production API endpoints missing: ${missingEndpoints.join(', ')}. Check environment variables.`
    );
  }
}

// Default fetch configuration
export const DEFAULT_FETCH_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  mode: 'cors' as RequestMode
};

// CORS-safe fetch wrapper
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const config = {
    ...DEFAULT_FETCH_CONFIG,
    ...options,
    headers: {
      ...DEFAULT_FETCH_CONFIG.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(endpoint, config);
    
    // Handle API errors (both development and production)
    if (!response.ok) {
      console.error(`❌ API call failed to ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Try to get error details from response body
      try {
        const errorText = await response.text();
        console.error(`📄 Error response body:`, errorText);
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(errorText);
          console.error(`🔍 Parsed error data:`, errorData);
        } catch (jsonError) {
          const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown error';
          console.error(`⚠️ Response is not JSON:`, errorMessage);
        }
        
        // Create a new response with the error body for further processing
        const errorResponse = new Response(errorText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        // For development with receipt generation, provide fallback only for CORS/network issues
        if (isDevelopment && endpoint.includes('generateReceiptManually') && response.status === 0) {
          console.log('🔧 Development mode: Network issue detected, using fallback');
          
          const mockResponse = {
            success: true,
            message: 'Mock signed URL generated due to network issue (24-hour expiration)',
            receiptUrl: `https://example.com/receipts/signed_fallback_${Date.now()}_receipt.pdf?expires=24h`,
            orderId: 'development-fallback',
            generatedAt: new Date().toISOString()
          };
          
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return errorResponse;
      } catch (readError) {
        console.error(`❌ Could not read error response:`, readError);
        return response;
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Network error calling ${endpoint}:`, error);
    
    // In development, provide fallback for CORS issues
    if (isDevelopment && endpoint.includes('generateReceiptManually')) {
      console.log('🔧 Development mode: CORS blocked, using mock response');
      
      // Match the signed URL API response structure
      const mockResponse = {
        success: true,
        message: 'Mock signed URL generated for development (24-hour expiration)',
        receiptUrl: `https://example.com/receipts/signed_mock_${Date.now()}_receipt.pdf?expires=24h`,
        orderId: 'development-mock-order',
        generatedAt: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
};

// Receipt generation specific API call
export const generateReceiptAPI = async (
  orderId: string,
  language: 'en' | 'es' = 'en'
): Promise<Response> => {
  const endpoint = API_ENDPOINTS.receiptGeneration;
  const requestBody = JSON.stringify({ orderId, language });

  return apiCall(endpoint, {
    method: 'POST',
    body: requestBody
  });
};

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  environment: import.meta.env.VITE_ENV || 'development',
  isDevelopment,
  isStaging,
  isProduction,
  baseURL: getCurrentBaseURL(),
  receiptEndpoint: API_ENDPOINTS.receiptGeneration
});

