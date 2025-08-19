import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

// Check if user has booked a specific puja in the last 30 days
export const hasBookedPujaRecently = async (pujaName: string): Promise<boolean> => {
  try {
    // Get user data from AsyncStorage
    const userData = await AsyncStorage.getItem('user');
      if (!userData) {
    // No user data found, cannot check booking history
    return false;
  }

    const user = JSON.parse(userData);
    const userPhone = user.phone;

    if (!userPhone) {
      // No phone number found in user data
      return false;
    }

    // Checking booking history

    const response = await axios.get(getEndpointUrl('CHECK_PUJA_BOOKING'), {
      params: {
        phone: userPhone,
        pujaName: pujaName
      },
      headers: getAuthHeaders()
    });

    const { hasBooked, bookingCount } = response.data;
    
    // Booking check result processed

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
    
    // Modal display decision processed
    
    return shouldShow;
  } catch (error) {
    console.error('❌ Error determining if modal should show:', error);
    return true; // Default to showing if there's an error
  }
}; 