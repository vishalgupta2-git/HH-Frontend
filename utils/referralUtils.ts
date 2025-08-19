import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { awardMudras } from './mudraUtils';

// Function to verify referral code against users database
export const verifyReferralCode = async (referralCode: string): Promise<{ 
  isValid: boolean; 
  referrerId?: string; 
  error?: string 
}> => {
  try {
    const response = await axios.post(getEndpointUrl('VERIFY_REFERRAL_CODE'), {
      referralCode: referralCode.trim()
    }, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      return {
        isValid: true,
        referrerId: response.data.referrerId
      };
    } else {
      return {
        isValid: false,
        error: response.data.error || 'Invalid referral code'
      };
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.response?.data?.error || 'Failed to verify referral code'
    };
  }
};

// Function to process referral after successful signup
export const processReferral = async (
  referralCode: string, 
  newUserEmail: string
): Promise<{ 
  success: boolean; 
  mudrasAwarded?: number; 
  error?: string 
}> => {
  try {
    // First verify the referral code
    const verification = await verifyReferralCode(referralCode);
    
    if (!verification.isValid) {
      return {
        success: false,
        error: verification.error || 'Invalid referral code'
      };
    }

    // Process the referral and award mudras to both users
    const response = await axios.post(getEndpointUrl('PROCESS_REFERRAL'), {
      referralCode: referralCode.trim(),
      newUserEmail,
      referrerId: verification.referrerId
    }, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Award mudras to the new user for using a referral code
      try {
        await awardMudras('REFER_FRIEND');
      } catch (mudraError) {
        // Silent error handling for mudra awarding
      }

      return {
        success: true,
        mudrasAwarded: response.data.mudrasAwarded || 1000
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to process referral'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to process referral'
    };
  }
};

// Function to generate a unique referral code for a user
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
