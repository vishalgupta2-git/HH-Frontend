// API Configuration for Hindu Heritage App
// This file handles API key authentication and base configuration

export const API_CONFIG = {
  // Your Vercel backend URL
  baseUrl: 'https://backend-jlq04ym9s-surbhi-guptas-projects-4a5bc02c.vercel.app',
  
  // API Key for authentication (store this securely)
  apiKey: '034d55f1add309a2a3cf3794eb8669a3175aaf0ba2290a1c6c3f2f8091084a00',
  
  // Default headers for all API calls
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '034d55f1add309a2a3cf3794eb8669a3175aaf0ba2290a1c6c3f2f8091084a00'
  }
};

// Secure API call function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API call failed: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function for specific HTTP methods
export const apiGet = (endpoint: string) => apiCall(endpoint, { method: 'GET' });
export const apiPost = (endpoint: string, data: any) => apiCall(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(data) 
});
export const apiPut = (endpoint: string, data: any) => apiCall(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(data) 
});
export const apiDelete = (endpoint: string) => apiCall(endpoint, { method: 'DELETE' });
