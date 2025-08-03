// API Configuration for Hindu Heritage App
// Update this URL whenever you redeploy your backend

export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'https://backend-ten-alpha-83.vercel.app',
  
  // API endpoints
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/',
    TEST: '/test',
    API_TEST: '/api/test',
    PING: '/api/ping',
    DEBUG: '/api/debug',
    TEST_CONNECTION: '/api/test-connection',
    STATUS: '/api/status',
    TEST_USERS: '/api/test-users',
    
    // Temple & Deity
    DEITY_STATUES: '/api/deity-statues',
    
    // Puja Booking
    PROFESSIONAL_PUJAS: '/api/professional-pujas',
    SPECIAL_PUJA: '/api/special-puja',
    PROFESSIONAL_PUJA_BOOKING: '/api/professional-puja-booking',
    
    // Authentication & User Management
    SIGNUP: '/api/signup',
    SEND_OTP: '/api/send-otp',
    VERIFY_OTP: '/api/verify-otp',
    USER: '/api/user',
    UPDATE_PROFILE: '/api/update-profile',
    UPDATE_COMPLETE_PROFILE: '/api/update-complete-profile',
    
    // Media & Content
    MEDIA_FILES: '/api/media-files',
    
    // Astrology & Horoscope
    FREE_ASTROLOGY_API: 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
export const getEndpointUrl = (endpointKey: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS[endpointKey]);
}; 