import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpointUrl } from '@/constants/ApiConfig';

// Save temple configuration to database
export const saveTempleToDatabase = async (templeInformation: any): Promise<boolean> => {
  try {
    // Get user data from AsyncStorage
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.log('🔍 [DEBUG] No user data found, cannot save temple');
      return false;
    }

    const user = JSON.parse(userData);
    console.log('🔍 [DEBUG] User data from AsyncStorage:', user);
    
    // Get userId from users table using email
    const email = user.email;
    if (!email) {
      console.log('🔍 [DEBUG] No email found in user data');
      console.log('🔍 [DEBUG] Available user fields:', Object.keys(user));
      return false;
    }

    console.log('🔍 [DEBUG] Getting userId for email:', email);
    
    // First, get the userId from users table
    const userResponse = await axios.get(getEndpointUrl('USER'), {
      params: { email }
    });

    console.log('🔍 [DEBUG] User response:', userResponse.data);

    if (!userResponse.data || !userResponse.data.user || !userResponse.data.user.userId) {
      console.log('🔍 [DEBUG] No userId found for email:', email);
      console.log('🔍 [DEBUG] Response data:', userResponse.data);
      return false;
    }

    const userId = userResponse.data.user.userId;
    console.log('🔍 [DEBUG] Found userId:', userId, 'for email:', email);

    console.log('🔍 [DEBUG] Saving temple configuration:', { userId, templeInformation });

    // Test with a simpler structure first
    const testTempleInfo = {
      selectedStyle: templeInformation.selectedStyle,
      bgGradient: templeInformation.bgGradient,
      selectedDeities: templeInformation.selectedDeities,
      deityState: templeInformation.deityState
    };

    console.log('🔍 [DEBUG] Test temple info:', testTempleInfo);

    const response = await axios.post(getEndpointUrl('SAVE_USER_TEMPLE'), {
      userId,
      templeInformation: testTempleInfo
    });

    console.log('✅ Temple saved successfully:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Error saving temple configuration:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    console.error('❌ Full error response:', error.response?.data);
    return false;
  }
};

// Load temple configuration from database
export const loadTempleFromDatabase = async (): Promise<any | null> => {
  try {
    // Get user data from AsyncStorage
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.log('🔍 [DEBUG] No user data found, cannot load temple');
      return null;
    }

    const user = JSON.parse(userData);
    
    // Get userId from users table using email
    const email = user.email;
    if (!email) {
      console.log('🔍 [DEBUG] No email found in user data');
      return null;
    }

    console.log('🔍 [DEBUG] Getting userId for email:', email);
    
    // First, get the userId from users table
    const userResponse = await axios.get(getEndpointUrl('USER'), {
      params: { email }
    });

    console.log('🔍 [DEBUG] User response:', userResponse.data);

    if (!userResponse.data || !userResponse.data.user || !userResponse.data.user.userId) {
      console.log('🔍 [DEBUG] No userId found for email:', email);
      console.log('🔍 [DEBUG] Response data:', userResponse.data);
      return null;
    }

    const userId = userResponse.data.user.userId;
    console.log('🔍 [DEBUG] Found userId:', userId, 'for email:', email);

    console.log('🔍 [DEBUG] Loading temple configuration for:', userId);

    const response = await axios.get(getEndpointUrl('GET_USER_TEMPLE'), {
      params: { userId }
    });

    console.log('✅ Temple loaded successfully:', response.data);
    return response.data.temple.templeInformation;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('🔍 [DEBUG] No temple configuration found for user');
      return null;
    }
    console.error('❌ Error loading temple configuration:', error);
    return null;
  }
};

// Save temple configuration to both database and AsyncStorage (for backward compatibility)
export const saveTempleConfiguration = async (templeConfig: any): Promise<boolean> => {
  try {
    // Save to database
    const dbSuccess = await saveTempleToDatabase(templeConfig);
    
    // Also save to AsyncStorage for backward compatibility
    await AsyncStorage.setItem('templeConfig', JSON.stringify(templeConfig));
    
    console.log('✅ Temple configuration saved to both database and AsyncStorage');
    return dbSuccess;
  } catch (error) {
    console.error('❌ Error saving temple configuration:', error);
    return false;
  }
};

// Load temple configuration from database first, fallback to AsyncStorage
export const loadTempleConfiguration = async (): Promise<any | null> => {
  try {
    // Try to load from database first
    const dbConfig = await loadTempleFromDatabase();
    if (dbConfig) {
      console.log('✅ Temple configuration loaded from database');
      return dbConfig;
    }

    // Fallback to AsyncStorage
    const storageConfig = await AsyncStorage.getItem('templeConfig');
    if (storageConfig) {
      console.log('✅ Temple configuration loaded from AsyncStorage (fallback)');
      return JSON.parse(storageConfig);
    }

    console.log('🔍 [DEBUG] No temple configuration found');
    return null;
  } catch (error) {
    console.error('❌ Error loading temple configuration:', error);
    return null;
  }
}; 