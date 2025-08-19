import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

// Mudra earning activity types
export const MUDRA_ACTIVITIES = {
  // Puja activities
  BOOK_PUJA: 'Book any Puja',
  REFER_FRIEND: 'Refer a Friend',
  
  // One-time activities
  SIGN_UP: 'Sign Up',
  COMPLETE_PROFILE_PHONE: 'Complete Profile - Phone Number',
  COMPLETE_PROFILE_DOB: 'Complete Profile - Date of Birth',
  COMPLETE_PROFILE_FATHER_DOB: 'Complete Profile - Father Date of Birth',
  COMPLETE_PROFILE_MOTHER_DOB: 'Complete Profile - Mother Date of Birth',
  COMPLETE_PROFILE_CHILDREN: 'Complete Profile - Children Details',
  SETUP_TEMPLE: 'Setup your Temple',
  
  // Daily activities
  DAILY_LOGIN: 'Daily Login',
  OFFER_FLOWERS: 'Offer flowers to god',
  DO_AARTI: 'Do aarti',
  RING_BELL: 'Ring the bell',
  PLAY_SHANKH: 'Play Shankh',
  OFFER_DHOOP: 'Offer Dhoop to God',
  LISTEN_AUDIO_VIDEO: 'Listen to Audio / Video',
  CHECK_RASHIFAL: 'Check Rashifal',
} as const;

// Mudra amounts for each activity
export const MUDRA_AMOUNTS = {
  [MUDRA_ACTIVITIES.BOOK_PUJA]: 500,
  [MUDRA_ACTIVITIES.REFER_FRIEND]: 1000,
  [MUDRA_ACTIVITIES.SIGN_UP]: 100,
  [MUDRA_ACTIVITIES.COMPLETE_PROFILE_PHONE]: 10,
  [MUDRA_ACTIVITIES.COMPLETE_PROFILE_DOB]: 10,
  [MUDRA_ACTIVITIES.COMPLETE_PROFILE_FATHER_DOB]: 10,
  [MUDRA_ACTIVITIES.COMPLETE_PROFILE_MOTHER_DOB]: 10,
  [MUDRA_ACTIVITIES.COMPLETE_PROFILE_CHILDREN]: 15,
  [MUDRA_ACTIVITIES.SETUP_TEMPLE]: 50,
  [MUDRA_ACTIVITIES.DAILY_LOGIN]: 10,
  [MUDRA_ACTIVITIES.OFFER_FLOWERS]: 5,
  [MUDRA_ACTIVITIES.DO_AARTI]: 5,
  [MUDRA_ACTIVITIES.RING_BELL]: 5,
  [MUDRA_ACTIVITIES.PLAY_SHANKH]: 5,
  [MUDRA_ACTIVITIES.OFFER_DHOOP]: 5,
  [MUDRA_ACTIVITIES.LISTEN_AUDIO_VIDEO]: 5,
  [MUDRA_ACTIVITIES.CHECK_RASHIFAL]: 5,
} as const;

// Function to award mudras for an activity
export const awardMudras = async (
  activityType: keyof typeof MUDRA_ACTIVITIES,
  customAmount?: number
): Promise<{ success: boolean; mudrasEarned?: number; newTotal?: number; error?: string }> => {
  try {
    // Awarding mudras for activity
    
    const userData = await AsyncStorage.getItem('user');
          // User data retrieved from AsyncStorage
    
          if (!userData) {
        // No user data found in AsyncStorage
        return { success: false, error: 'User not logged in' };
      }

    const user = JSON.parse(userData);
          // User data parsed successfully
    
    const mudrasToAward = customAmount || MUDRA_AMOUNTS[MUDRA_ACTIVITIES[activityType]] || 0;
          // Mudras to award calculated

          if (mudrasToAward <= 0) {
        // Invalid mudra amount
        return { success: false, error: 'Invalid mudra amount' };
      }

    const requestData = {
      email: user.email,
      activityType: MUDRA_ACTIVITIES[activityType],
      mudrasEarned: mudrasToAward,
      activityDate: new Date().toISOString().split('T')[0]
    };
          // Sending request to backend

    const response = await axios.post(getEndpointUrl('AWARD_MUDRAS'), requestData, {
      headers: getAuthHeaders()
    });

          // Backend response received
    
    if (response.data.success) {
      // Update local user data with new mudras count
      const updatedUser = { ...user, mudras: response.data.newTotal };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
              // Updated user data in AsyncStorage
      
      return {
        success: true,
        mudrasEarned: response.data.mudrasEarned,
        newTotal: response.data.newTotal
      };
    } else {
      // Backend returned success: false
      return { success: false, error: 'Failed to award mudras' };
    }
  } catch (error) {
    // Error awarding mudras
    return { success: false, error: 'Network error' };
  }
};

// Function to check if user has already earned mudras for a daily activity today
export const hasEarnedDailyMudras = async (
  activityType: keyof typeof MUDRA_ACTIVITIES
): Promise<boolean> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return false;

    const user = JSON.parse(userData);
    const today = new Date().toISOString().split('T')[0];

    const response = await axios.get(getEndpointUrl('MUDRAS_HISTORY'), {
      params: { email: user.email },
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      const todayEntries = response.data.history.filter((entry: any) => 
        entry.activityDate === today && 
        entry.activityType === MUDRA_ACTIVITIES[activityType]
      );
      
      return todayEntries.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking daily mudras:', error);
    return false;
  }
};

// Function to get user's mudra history
export const getMudraHistory = async (): Promise<{ success: boolean; history?: any[]; error?: string }> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      return { success: false, error: 'User not logged in' };
    }

    const user = JSON.parse(userData);
    const response = await axios.get(getEndpointUrl('MUDRAS_HISTORY'), {
      params: { email: user.email },
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      return {
        success: true,
        history: response.data.history
      };
    } else {
      return { success: false, error: 'Failed to fetch history' };
    }
  } catch (error) {
    console.error('Error fetching mudra history:', error);
    return { success: false, error: 'Network error' };
  }
}; 