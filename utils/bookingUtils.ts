import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpointUrl } from '@/constants/ApiConfig';

// Check if user has booked a specific puja in the last 30 days
export const hasBookedPujaRecently = async (pujaName: string): Promise<boolean> => {
  try {
    // Get user data from AsyncStorage
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.log('🔍 [DEBUG] No user data found, cannot check booking history');
      return false;
    }

    const user = JSON.parse(userData);
    const userPhone = user.phone;

    if (!userPhone) {
      console.log('🔍 [DEBUG] No phone number found in user data');
      return false;
    }

    console.log('🔍 [DEBUG] Checking booking history for:', { pujaName, userPhone });

    const response = await axios.get(getEndpointUrl('CHECK_PUJA_BOOKING'), {
      params: {
        phone: userPhone,
        pujaName: pujaName
      }
    });

    const { hasBooked, bookingCount } = response.data;
    
    console.log('🔍 [DEBUG] Booking check result:', { 
      pujaName, 
      hasBooked, 
      bookingCount 
    });

    return hasBooked;
  } catch (error) {
    console.error('❌ Error checking booking history:', error);
    return false; // Default to false if there's an error
  }
};

// Check if user should see special days modal (not booked recently)
export const shouldShowSpecialDaysModal = async (pujaName: string): Promise<boolean> => {
  try {
    const hasBooked = await hasBookedPujaRecently(pujaName);
    const shouldShow = !hasBooked;
    
    console.log('🔍 [DEBUG] Should show special days modal for', pujaName, ':', shouldShow);
    
    return shouldShow;
  } catch (error) {
    console.error('❌ Error determining if modal should show:', error);
    return true; // Default to showing if there's an error
  }
}; 