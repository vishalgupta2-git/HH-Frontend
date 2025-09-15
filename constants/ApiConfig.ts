// API Configuration for Hindu Heritage App
// Update this URL whenever you redeploy your backend

export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'https://backend-ten-alpha-83.vercel.app',
  
  // API Key for authentication
  API_KEY: '034d55f1add309a2a3cf3794eb8669a3175aaf0ba2290a1c6c3f2f8091084a00',
  
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
    CHECK_PUJA_BOOKING: '/api/check-puja-booking',
    
    // Authentication & User Management
    SIGNUP: '/api/signup',
    SEND_OTP: '/api/send-otp',
    VERIFY_OTP: '/api/verify-otp',
    USER: '/api/user',
    UPDATE_PROFILE: '/api/update-profile',
    UPDATE_COMPLETE_PROFILE: '/api/update-complete-profile',
    USER_MUDRAS: '/api/user-mudras',
    AWARD_MUDRAS: '/api/award-mudras',
    MUDRAS_HISTORY: '/api/mudra-history',
    TEST_DB: '/api/test-db',
    
    // Referral System
    VERIFY_REFERRAL_CODE: '/api/verify-referral-code',
    PROCESS_REFERRAL: '/api/process-referral',
    
    // User Temple Management
    SAVE_USER_TEMPLE: '/api/save-user-temple',
    GET_USER_TEMPLE: '/api/get-user-temple',
    SAVE_GANESHA_TEMPLE: '/api/save-temple',
    GET_GANESHA_TEMPLE: '/api/get-ganesha-temple',
    
    // New Style Temple Management
    SAVE_USER_TEMPLE_NEW_STYLE: '/api/save-user-temple-new-style',
    GET_USER_TEMPLE_NEW_STYLE: '/api/get-user-temple-new-style',
    USER_TEMPLE_CONFIG: '/api/user-temple-config', // New single API with LEFT JOIN
    
    // Temples and Charities
    TEMPLES_CHARITIES: '/api/temples-charities',
    TEMPLES_CHARITIES_BY_ID: '/api/temples-charities', // Note: ID is appended to this base path 
    TEMPLES_CHARITIES_FILTERS: '/api/temples-charities/filters/options',
    TEMPLES_CHARITIES_BY_TYPE: '/api/temples-charities/type', // Type is appended
    TEMPLES_CHARITIES_BY_LOCATION: '/api/temples-charities/location',
    TEMPLES_CHARITIES_SEARCH: '/api/temples-charities/search',
    TEMPLES_CHARITIES_IMAGES: '/api/s3/temples-charities-images', // Note: ID is appended to this base path
    
    // Upcoming Pujas
    UPCOMING_PUJAS: '/api/upcoming-pujas',
    UPCOMING_PUJAS_BY_ID: '/api/upcoming-pujas', // Note: ID is appended to this base path
    UPCOMING_PUJAS_FILTERS: '/api/upcoming-pujas/filters/options',
    UPCOMING_PUJAS_BY_TEMPLE: '/api/upcoming-pujas/temple', // Temple ID is appended
    UPCOMING_PUJAS_BY_DATE: '/api/upcoming-pujas/date',
    UPCOMING_PUJAS_SEARCH: '/api/upcoming-pujas/search',
    
    // Media & Content
    MEDIA_FILES: '/api/media-files',
    S3_AUDIO_URL: '/api/s3/audio-url',
    
    // Providers
    PROVIDERS_KUNDLI: '/api/providers/kundli',
    PROVIDERS: '/api/providers',
    
    // My Bookings
    MY_BOOKINGS: '/api/my-bookings',
    
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

// Helper function to get authenticated headers
export const getAuthHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.API_KEY,
  };
};

// Helper function to get authenticated headers with custom content type
export const getAuthHeadersWithContentType = (contentType: string): Record<string, string> => {
  return {
    'Content-Type': contentType,
    'x-api-key': API_CONFIG.API_KEY,
  };
}; 