/**
 * API Configuration
 * Centralized management of API endpoints and configurations
 */

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isStaging = import.meta.env.VITE_ENV === 'staging';
export const isProduction = import.meta.env.VITE_ENV === 'production';

// API Base URLs
const API_BASE_URLS = {
  development: 'http://localhost:3000', // Local development server
  staging: 'https://us-central1-lulop-eds249.cloudfunctions.net',
  production: 'https://us-central1-lulop-eds249.cloudfunctions.net'
};

// Get current environment base URL
const getCurrentBaseURL = (): string => {
  if (isDevelopment) return API_BASE_URLS.development;
  if (isProduction) return API_BASE_URLS.production;
  return API_BASE_URLS.staging; // Default to staging
};

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Receipt generation endpoint
  receiptGeneration: import.meta.env.VITE_RECEIPT_GENERATION_ENDPOINT || 
                     `${getCurrentBaseURL()}/generateReceiptManually`,
  
  // Payment intent endpoint (existing)
  paymentIntent: 'https://createpaymentintent-6v2n7ecudq-uc.a.run.app',
  
  // Webhook endpoint (existing)
  webhook: import.meta.env.VITE_STRIPE_WEBHOOK_ENDPOINT || 
           'https://handlepaymentwebhook-6v2n7ecudq-uc.a.run.app'
};

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
export const generateReceiptAPI = async (orderId: string): Promise<Response> => {
  const endpoint = API_ENDPOINTS.receiptGeneration;
  
  console.log(`🧾 Calling receipt generation API: ${endpoint}`);
  console.log(`📦 Request payload:`, { orderId });
  console.log(`🌍 Environment:`, {
    isDevelopment,
    isStaging,
    isProduction,
    env: import.meta.env.VITE_ENV
  });
  
  const requestBody = JSON.stringify({ orderId });
  console.log(`📄 Request body:`, requestBody);
  
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

// Log environment info in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', getEnvironmentInfo());
}