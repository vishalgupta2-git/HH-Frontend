import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_PUJA_VISIT_KEY = 'dailyPujaVisitDate';

// Check if user has visited daily puja screen today
export const hasVisitedDailyPujaToday = async (): Promise<boolean> => {
  try {
    const visitDate = await AsyncStorage.getItem(DAILY_PUJA_VISIT_KEY);
    if (!visitDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return visitDate === today;
  } catch (error) {
    console.error('Error checking daily puja visit:', error);
    return false;
  }
};

// Mark that user has visited daily puja screen today
export const markDailyPujaVisited = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(DAILY_PUJA_VISIT_KEY, today);
  } catch (error) {
    console.error('Error marking daily puja visit:', error);
  }
};

// Get user's first name from AsyncStorage
export const getUserFirstName = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return user.firstName || user.name?.split(' ')[0] || null;
  } catch (error) {
    console.error('Error getting user first name:', error);
    return null;
  }
}; 