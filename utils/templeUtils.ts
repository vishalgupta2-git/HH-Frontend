import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

// Check if user is authenticated
export const checkUserAuthentication = async (): Promise<{ isAuthenticated: boolean; userData?: any }> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.log('❌ [AUTH] No user data found in AsyncStorage');
      return { isAuthenticated: false };
    }
    
    const parsedUserData = JSON.parse(userData);
    console.log('✅ [AUTH] User authenticated:', parsedUserData.email || 'No email');
    return { isAuthenticated: true, userData: parsedUserData };
  } catch (error) {
    console.error('❌ [AUTH] Error checking authentication:', error);
    return { isAuthenticated: false };
  }
};

// Get user ID from AsyncStorage or fetch from database
export const getUserId = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.log('❌ [USER ID] No user data found');
      return null;
    }

    const user = JSON.parse(userData);
    
    // Check if userId is already in AsyncStorage
    if (user.userId) {
      console.log('✅ [USER ID] Found userId in AsyncStorage:', user.userId);
      return user.userId;
    }

    // If no userId, get it from database using email
    if (!user.email) {
      console.log('❌ [USER ID] No email found in user data');
      return null;
    }

    console.log('🔄 [USER ID] Getting userId from database for email:', user.email);
    const userResponse = await axios.get(getEndpointUrl('USER'), {
      params: { email: user.email },
      headers: getAuthHeaders()
    });

    if (!userResponse.data || !userResponse.data.user || !userResponse.data.user.userId) {
      console.log('❌ [USER ID] No userId found in database for email:', user.email);
      return null;
    }

    const userId = userResponse.data.user.userId;
    console.log('✅ [USER ID] Found userId from database:', userId);

    // Update AsyncStorage with userId
    const updatedUser = { ...user, userId };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ [USER ID] Updated AsyncStorage with userId');

    return userId;
  } catch (error) {
    console.error('❌ [USER ID] Error getting userId:', error);
    return null;
  }
};

// Load temple configuration from database (for authenticated users)
export const loadTempleFromDatabase = async (): Promise<any | null> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log('❌ [DB LOAD] No userId available');
      return null;
    }

    console.log('🔄 [DB LOAD] Loading temple configuration for userId:', userId);
    const response = await axios.get(getEndpointUrl('GET_USER_TEMPLE'), {
      params: { userId },
      headers: getAuthHeaders()
    });

    console.log('✅ [DB LOAD] Temple loaded successfully from database');
    console.log('🔍 [DB LOAD] Response data structure:', JSON.stringify(response.data, null, 2));
    console.log('🔍 [DB LOAD] Temple object:', response.data.temple);
    console.log('🔍 [DB LOAD] Temple information:', response.data.temple?.templeInformation);
    
    // Return the entire temple object, not just templeInformation
    return response.data.temple;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('🔍 [DB LOAD] No temple configuration found in database');
      return null;
    }
    console.error('❌ [DB LOAD] Error loading temple from database:', error);
    return null;
  }
};

// Load temple configuration from AsyncStorage (for non-authenticated users)
export const loadTempleFromAsyncStorage = async (): Promise<any | null> => {
  try {
    const templeConfig = await AsyncStorage.getItem('templeConfig');
    if (templeConfig) {
      console.log('✅ [STORAGE LOAD] Temple configuration loaded from AsyncStorage');
      const parsed = JSON.parse(templeConfig);
      console.log('🔍 [STORAGE LOAD] Parsed temple config:', JSON.stringify(parsed, null, 2));
      return parsed;
    }
    console.log('🔍 [STORAGE LOAD] No temple configuration found in AsyncStorage');
    return null;
  } catch (error) {
    console.error('❌ [STORAGE LOAD] Error loading temple from AsyncStorage:', error);
    return null;
  }
};

// Save temple configuration to database (for authenticated users)
export const saveTempleToDatabase = async (templeConfig: any): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log('❌ [DB SAVE] No userId available');
      return false;
    }

    console.log('🔄 [DB SAVE] Saving temple configuration to database for userId:', userId);
    const response = await axios.post(getEndpointUrl('SAVE_USER_TEMPLE'), {
      userId,
      templeInformation: templeConfig
    }, {
      headers: getAuthHeaders()
    });

    console.log('✅ [DB SAVE] Temple saved successfully to database');
    return true;
  } catch (error) {
    console.error('❌ [DB SAVE] Error saving temple to database:', error);
    return false;
  }
};

// Save temple configuration to AsyncStorage (for non-authenticated users)
export const saveTempleToAsyncStorage = async (templeConfig: any): Promise<boolean> => {
  try {
    console.log('🔄 [STORAGE SAVE] Saving temple configuration to AsyncStorage');
    await AsyncStorage.setItem('templeConfig', JSON.stringify(templeConfig));
    console.log('✅ [STORAGE SAVE] Temple saved successfully to AsyncStorage');
    return true;
  } catch (error) {
    console.error('❌ [STORAGE SAVE] Error saving temple to AsyncStorage:', error);
    return false;
  }
};

// Main function to load temple configuration based on authentication status
export const loadTempleConfiguration = async (): Promise<any | null> => {
  try {
    const { isAuthenticated } = await checkUserAuthentication();
    
    if (isAuthenticated) {
      console.log('🔄 [LOAD] User authenticated, loading from database...');
      return await loadTempleFromDatabase();
    } else {
      console.log('🔄 [LOAD] User not authenticated, loading from AsyncStorage...');
      return await loadTempleFromAsyncStorage();
    }
  } catch (error) {
    console.error('❌ [LOAD] Error loading temple configuration:', error);
    return null;
  }
};

// Main function to save temple configuration based on authentication status
export const saveTempleConfiguration = async (templeConfig: any): Promise<boolean> => {
  try {
    const { isAuthenticated } = await checkUserAuthentication();
    
    if (isAuthenticated) {
      console.log('🔄 [SAVE] User authenticated, saving to database and AsyncStorage...');
      const dbSuccess = await saveTempleToDatabase(templeConfig);
      const storageSuccess = await saveTempleToAsyncStorage(templeConfig);
      return dbSuccess && storageSuccess;
    } else {
      console.log('🔄 [SAVE] User not authenticated, saving to AsyncStorage only...');
      return await saveTempleToAsyncStorage(templeConfig);
    }
  } catch (error) {
    console.error('❌ [SAVE] Error saving temple configuration:', error);
    return false;
  }
}; 