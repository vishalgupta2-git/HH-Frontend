import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { processReferral } from '@/utils/referralUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export const options = { headerShown: false };

export default function OTPScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const { email, name, from } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();

  // Helper function to get translation
  const getTranslation = (key: any) => {
    const lang = currentLanguage === 'hindi' ? 'hi' : 
                 currentLanguage === 'bangla' ? 'bangla' : 
                 currentLanguage === 'kannada' ? 'kannada' :
                 currentLanguage === 'punjabi' ? 'punjabi' :
                 currentLanguage === 'tamil' ? 'tamil' :
                 currentLanguage === 'telugu' ? 'telugu' : 'en';
    return key[lang] || key.en;
  };

  const translations = {
    headerTitle: { 
      en: 'Hindu Heritage', 
      hi: 'द हिंदू हेरिटेज',
      bangla: 'হিন্দু হেরিটেজ',
      kannada: 'ಹಿಂದೂ ಹೆರಿಟೇಜ್',
      punjabi: 'ਹਿੰਦੂ ਹੈਰੀਟੇਜ',
      tamil: 'ஹிந்து ஹெரிடேஜ்',
      telugu: 'హిందూ హెరిటేజ్'
    },
    verifyEmail: { 
      en: 'Verify Your Email', 
      hi: 'अपना ईमेल सत्यापित करें',
      bangla: 'আপনার ইমেইল যাচাই করুন',
      kannada: 'ನಿಮ್ಮ ಇಮೇಲ್ ಅನ್ನು ಪರಿಶೀಲಿಸಿ',
      punjabi: 'ਆਪਣਾ ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ',
      tamil: 'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்',
      telugu: 'మీ ఇమెయిల్‌ను ధృవీకరించండి'
    },
    sentCode: { 
      en: 'We\'ve sent a 4-digit code to', 
      hi: 'हमने 4 अंकों का कोड भेजा है',
      bangla: 'আমরা 4 অঙ্কের কোড পাঠিয়েছি',
      kannada: 'ನಾವು 4 ಅಂಕಿಯ ಕೋಡ್ ಕಳುಹಿಸಿದ್ದೇವೆ',
      punjabi: 'ਅਸੀਂ 4 ਅੰਕਾਂ ਦਾ ਕੋਡ ਭੇਜਿਆ ਹੈ',
      tamil: 'நாங்கள் 4 இலக்க குறியீட்டை அனுப்பியுள்ளோம்',
      telugu: 'మేము 4 అంకెల కోడ్‌ను పంపాము'
    },
    clear: { 
      en: 'Clear', 
      hi: 'साफ करें',
      bangla: 'সাফ করুন',
      kannada: 'ಸ್ಪಷ್ಟಗೊಳಿಸಿ',
      punjabi: 'ਸਾਫ ਕਰੋ',
      tamil: 'அழிக்கவும்',
      telugu: 'తొలగించండి'
    },
    verifying: { 
      en: 'Verifying...', 
      hi: 'सत्यापित किया जा रहा है...',
      bangla: 'যাচাই করা হচ্ছে...',
      kannada: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਤਸਦੀਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      tamil: 'சரிபார்க்கப்படுகிறது...',
      telugu: 'ధృవీకరించబడుతోంది...'
    },
    verifyOtp: { 
      en: 'Verify OTP', 
      hi: 'OTP सत्यापित करें',
      bangla: 'OTP যাচাই করুন',
      kannada: 'OTP ಪರಿಶೀಲಿಸಿ',
      punjabi: 'OTP ਤਸਦੀਕ ਕਰੋ',
      tamil: 'OTP சரிபார்க்கவும்',
      telugu: 'OTP ధృవీకరించండి'
    },
    didntReceive: { 
      en: 'Didn\'t receive the code? You can resend in', 
      hi: 'कोड नहीं मिला? आप इसे फिर से भेज सकते हैं',
      bangla: 'কোড পেলেন না? আপনি পুনরায় পাঠাতে পারেন',
      kannada: 'ಕೋಡ್ ಸಿಕ್ಕಿಲ್ಲ? ನೀವು ಮರುಕಳಿಸಬಹುದು',
      punjabi: 'ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ? ਤੁਸੀਂ ਮੁੜ ਭੇਜ ਸਕਦੇ ਹੋ',
      tamil: 'குறியீடு கிடைக்கவில்லையா? நீங்கள் மீண்டும் அனுப்பலாம்',
      telugu: 'కోడ్ రాలేదా? మీరు మళ్లీ పంపవచ్చు'
    },
    seconds: { 
      en: 'seconds', 
      hi: 'सेकंड में',
      bangla: 'সেকেন্ডে',
      kannada: 'ಸೆಕೆಂಡುಗಳಲ್ಲಿ',
      punjabi: 'ਸਕਿੰਟਾਂ ਵਿੱਚ',
      tamil: 'வினாடிகளில்',
      telugu: 'సెకన్లలో'
    },
    didntReceiveSimple: { 
      en: 'Didn\'t receive the code?', 
      hi: 'कोड नहीं मिला?',
      bangla: 'কোড পেলেন না?',
      kannada: 'ಕೋಡ್ ಸಿಕ್ಕಿಲ್ಲ?',
      punjabi: 'ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ?',
      tamil: 'குறியீடு கிடைக்கவில்லையா?',
      telugu: 'కోడ్ రాలేదా?'
    },
    resend: { 
      en: 'Resend', 
      hi: 'फिर से भेजें',
      bangla: 'পুনরায় পাঠান',
      kannada: 'ಮರುಕಳಿಸಿ',
      punjabi: 'ਮੁੜ ਭੇਜੋ',
      tamil: 'மீண்டும் அனுப்பவும்',
      telugu: 'మళ్లీ పంపండి'
    },
    backToSignup: { 
      en: 'Back to Sign-Up', 
      hi: 'साइन-अप पर वापस जाएं',
      bangla: 'সাইন আপে ফিরে যান',
      kannada: 'ಸೈನ್ ಅಪ್‌ಗೆ ಹಿಂತಿರುಗಿ',
      punjabi: 'ਸਾਈਨ ਅੱਪ \'ਤੇ ਵਾਪਸ ਜਾਓ',
      tamil: 'பதிவுக்கு திரும்பவும்',
      telugu: 'సైన్ అప్‌కు తిరిగి వెళ్లండి'
    },
    backToLogin: { 
      en: 'Back to Login', 
      hi: 'लॉगिन पर वापस जाएं',
      bangla: 'লগইনে ফিরে যান',
      kannada: 'ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ',
      punjabi: 'ਲੌਗਿਨ \'ਤੇ ਵਾਪਸ ਜਾਓ',
      tamil: 'உள்நுழைவுக்கு திரும்பவும்',
      telugu: 'లాగిన్‌కు తిరిగి వెళ్లండి'
    },
    validation: {
      validOtp: { 
        en: 'Please enter a valid 4-digit OTP', 
        hi: 'कृपया एक वैध 4 अंकों का OTP दर्ज करें',
        bangla: 'অনুগ্রহ করে একটি বৈধ 4 অঙ্কের OTP লিখুন',
        kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 4 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
        punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ 4 ਅੰਕਾਂ ਦਾ OTP ਦਰਜ ਕਰੋ',
        tamil: 'தயவுசெய்து சரியான 4 இலக்க OTP ஐ உள்ளிடவும்',
        telugu: 'దయచేసి చెల్లుబాటు అయ్యే 4 అంకెల OTP నమోదు చేయండి'
      },
      accountLocked: { 
        en: 'Account is temporarily locked. Please wait before trying again.', 
        hi: 'खाता अस्थायी रूप से लॉक है। कृपया पुनः प्रयास करने से पहले प्रतीक्षा करें।',
        bangla: 'অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। আবার চেষ্টা করার আগে অনুগ্রহ করে অপেক্ষা করুন।',
        kannada: 'ಖಾತೆಯು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಕಾಯಿರಿ.',
        punjabi: 'ਖਾਤਾ ਅਸਥਾਈ ਤੌਰ \'ਤੇ ਲੌਕ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇੰਤਜ਼ਾਰ ਕਰੋ।',
        tamil: 'கணக்கு தற்காலிகமாக பூட்டப்பட்டுள்ளது. மீண்டும் முயற்சிக்கும் முன் தயவுசெய்து காத்திருக்கவும்.',
        telugu: 'ఖాతా తాత్కాలికంగా లాక్ చేయబడింది. మళ్లీ ప్రయత్నించే ముందు దయచేసి వేచి ఉండండి.'
      },
      loginSuccessful: { 
        en: 'Login successful! Redirecting...', 
        hi: 'लॉगिन सफल! पुनर्निर्देशित किया जा रहा है...',
        bangla: 'লগইন সফল! পুনর্নির্দেশিত করা হচ্ছে...',
        kannada: 'ಲಾಗಿನ್ ಯಶಸ್ವಿ! ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...',
        punjabi: 'ਲੌਗਿਨ ਸਫਲ! ਮੁੜ-ਨਿਰਦੇਸ਼ਿਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
        tamil: 'உள்நுழைவு வெற்றிகரமானது! மறுநிர்ணயிக்கப்படுகிறது...',
        telugu: 'లాగిన్ విజయవంతమైంది! మళ్లీ నిర్దేశించబడుతోంది...'
      },
      invalidOtp: { 
        en: 'Invalid OTP', 
        hi: 'अमान्य OTP',
        bangla: 'অবৈধ OTP',
        kannada: 'ಅಮಾನ್ಯ OTP',
        punjabi: 'ਗਲਤ OTP',
        tamil: 'தவறான OTP',
        telugu: 'చెల్లని OTP'
      },
      tooManyAttempts: { 
        en: 'Too many failed attempts. Please try again in 30 minutes.', 
        hi: 'बहुत सारे असफल प्रयास। कृपया 30 मिनट बाद पुनः प्रयास करें।',
        bangla: 'অনেক ব্যর্থ প্রচেষ্টা। অনুগ্রহ করে 30 মিনিট পর আবার চেষ্টা করুন।',
        kannada: 'ಹಲವಾರು ವಿಫಲ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 30 ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        punjabi: 'ਬਹੁਤ ਸਾਰੇ ਅਸਫਲ ਯਤਨ। ਕਿਰਪਾ ਕਰਕੇ 30 ਮਿੰਟ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        tamil: 'பல தோல்வியுற்ற முயற்சிகள். 30 நிமிடங்களுக்குப் பிறகு மீண்டும் முயற்சிக்கவும்.',
        telugu: 'చాలా విఫల ప్రయత్నాలు. 30 నిమిషాల తర్వాత మళ్లీ ప్రయత్నించండి.'
      },
      failedToVerify: { 
        en: 'Failed to verify OTP', 
        hi: 'OTP सत्यापित करने में विफल',
        bangla: 'OTP যাচাই করতে ব্যর্থ',
        kannada: 'OTP ಪರಿಶೀಲಿಸಲು ವಿಫಲವಾಗಿದೆ',
        punjabi: 'OTP ਤਸਦੀਕ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
        tamil: 'OTP சரிபார்க்க முடியவில்லை',
        telugu: 'OTP ధృవీకరించడంలో విఫలమయ్యింది'
      },
      otpResent: { 
        en: 'OTP has been resent to your email', 
        hi: 'OTP आपके ईमेल पर फिर से भेजा गया है',
        bangla: 'OTP আপনার ইমেইলে পুনরায় পাঠানো হয়েছে',
        kannada: 'OTP ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಮರುಕಳಿಸಲಾಗಿದೆ',
        punjabi: 'OTP ਤੁਹਾਡੇ ਈਮੇਲ \'ਤੇ ਮੁੜ ਭੇਜਿਆ ਗਿਆ ਹੈ',
        tamil: 'OTP உங்கள் மின்னஞ்சலுக்கு மீண்டும் அனுப்பப்பட்டது',
        telugu: 'OTP మీ ఇమెయిల్‌కు మళ్లీ పంపబడింది'
      },
      failedToResend: { 
        en: 'Failed to resend OTP', 
        hi: 'OTP फिर से भेजने में विफल',
        bangla: 'OTP পুনরায় পাঠাতে ব্যর্থ',
        kannada: 'OTP ಮರುಕಳಿಸಲು ವಿಫಲವಾಗಿದೆ',
        punjabi: 'OTP ਮੁੜ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ',
        tamil: 'OTP மீண்டும் அனுப்ப முடியவில்லை',
        telugu: 'OTP మళ్లీ పంపడంలో విఫలమయ్యింది'
      }
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isLockedOut && lockoutUntil) {
      // Check if lockout has expired
      const now = new Date();
      if (now >= lockoutUntil) {
        setIsLockedOut(false);
        setLockoutUntil(null);
        setMessage('');
        setMessageType('');
      } else {
        // Calculate remaining time and set timer
        const remainingMs = lockoutUntil.getTime() - now.getTime();
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        setResendTimer(remainingSeconds);
      }
    }
  }, [resendTimer, isLockedOut, lockoutUntil]);


  // Check if OTP is complete
  const isOtpComplete = otp.every(digit => digit !== '');

  // Clear OTP input
  const handleClearOTP = () => {
    setOtp(['', '', '', '']);
    setMessage('');
    setMessageType('');
    // Focus on first input
    inputRefs.current[0]?.focus();
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setMessage(getTranslation(translations.validation.validOtp));
      setMessageType('error');
      return;
    }

    if (isLockedOut) {
      setMessage(getTranslation(translations.validation.accountLocked));
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      // Test user bypass - handle completely in frontend, no backend request
      if (email === 'playstoreuser@hinduheritage.in' && otpString === '4721') {
        // Create test user data
        const testUserData = {
          userId: `test_user_${Date.now()}`,
          firstName: 'Play Store',
          lastName: 'Tester',
          email: 'playstoreuser@hinduheritage.in',
          name: 'Play Store Tester',
          phone: null,
          gender: null,
          dateOfBirth: null,
          dob: null,
          placeOfBirth: null,
          rashi: null,
          gotra: null,
          maritalStatus: null,
          anniversaryDate: null,
          kids: null,
          parents: null,
          createdAt: new Date().toISOString()
        };
        
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(testUserData));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        
        setMessage(getTranslation(translations.validation.loginSuccessful));
        setMessageType('success');
        
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
        
        setIsLoading(false);
        return;
      }
      
      // Only send backend request for non-test users
      const response = await axios.post(getEndpointUrl('VERIFY_OTP'), {
        email,
        otp: otpString,
        name
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        
        // Get user data from response or create basic user object
        const userData = response.data.user || { email, name: name || 'User' };
        
        // Ensure we have the required fields for the user object
        const nameStr = typeof name === 'string' ? name : Array.isArray(name) ? name[0] || 'User' : 'User';
        const completeUserData = {
          ...userData,
          email: userData.email || email,
          name: userData.name || userData.firstName || nameStr,
          firstName: userData.firstName || userData.name?.split(' ')[0] || nameStr.split(' ')[0] || 'User',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || nameStr.split(' ').slice(1).join(' ') || '',
          userId: userData.userId || `user_${Date.now()}`,
          phone: userData.phone || null,
          gender: userData.gender || null,
          dateOfBirth: userData.dateOfBirth || userData.dob || null,
          placeOfBirth: userData.placeOfBirth || null,
          rashi: userData.rashi || null,
          gotra: userData.gotra || null,
          maritalStatus: userData.maritalStatus || null,
          anniversaryDate: userData.anniversaryDate || null,
          kids: userData.kids || null,
          parents: userData.parents || null
        };
        
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(completeUserData));
        
        // Note: Referral processing is now handled in the signup endpoint
        // No need to process referrals here since mudras are awarded immediately after user creation
        
        setMessage(getTranslation(translations.validation.loginSuccessful));
        setMessageType('success');
        
        // Navigate after a short delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        setMessage(response.data.message || getTranslation(translations.validation.invalidOtp));
        setMessageType('error');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Lockout error
        const lockoutMessage = error.response?.data?.error || getTranslation(translations.validation.tooManyAttempts);
        setMessage(lockoutMessage);
        setMessageType('error');
        
        // Set lockout state
        setIsLockedOut(true);
        if (error.response?.data?.lockoutUntil) {
          setLockoutUntil(new Date(error.response.data.lockoutUntil));
        } else {
          // Set 30 minutes from now if lockoutUntil not provided
          const lockoutTime = new Date();
          lockoutTime.setMinutes(lockoutTime.getMinutes() + 30);
          setLockoutUntil(lockoutTime);
        }
        
        // Set timer to 30 minutes
        setResendTimer(1800);
      } else {
        setMessage(error.response?.data?.message || getTranslation(translations.validation.failedToVerify));
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || isLockedOut) return;
    
    // Test user bypass - no backend request needed
    if (email === 'playstoreuser@hinduheritage.in') {
      setResendTimer(10);
      setMessage(getTranslation(translations.validation.otpResent));
      setMessageType('success');
      return;
    }
    
    try {
      const response = await axios.post(getEndpointUrl('SEND_OTP'), { email }, {
        headers: getAuthHeaders()
      });
      setResendTimer(10);
      setMessage(getTranslation(translations.validation.otpResent));
      setMessageType('success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || getTranslation(translations.validation.failedToResend);
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>{getTranslation(translations.headerTitle)}</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      <View style={styles.card}>
        <Text style={styles.title}>{getTranslation(translations.verifyEmail)}</Text>
        <Text style={styles.subtitle}>
          {getTranslation(translations.sentCode)} {email}
        </Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              placeholderTextColor="#888"
            />
          ))}
        </View>

        {/* Message display */}
        {message ? (
          <Text style={[
            styles.messageText,
            messageType === 'success' ? styles.successText : styles.errorText
          ]}>
            {message}
          </Text>
        ) : null}

        {/* Clear button */}
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClearOTP}
        >
          <Text style={styles.clearButtonText}>{getTranslation(translations.clear)}</Text>
        </TouchableOpacity>

        {/* Verify button - always show but disabled until OTP is complete or during lockout */}
        <TouchableOpacity 
          style={[
            styles.button, 
            (!isOtpComplete || isLoading || isLockedOut) && styles.buttonDisabled
          ]} 
          onPress={handleVerifyOTP}
          disabled={!isOtpComplete || isLoading || isLockedOut}
        >
          <Text style={[
            styles.buttonText,
            (!isOtpComplete || isLoading || isLockedOut) && styles.buttonTextDisabled
          ]}>
            {isLoading ? getTranslation(translations.verifying) : getTranslation(translations.verifyOtp)}
          </Text>
        </TouchableOpacity>

        {/* Resend section - simple 30 second timer */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {resendTimer > 0 
              ? `${getTranslation(translations.didntReceive)} ${resendTimer} ${getTranslation(translations.seconds)}` 
              : `${getTranslation(translations.didntReceiveSimple)} `
            }
          </Text>
          {resendTimer === 0 && (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>{getTranslation(translations.resend)}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            {from === 'signup' ? getTranslation(translations.backToSignup) : getTranslation(translations.backToLogin)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8,
    height: 120 * 0.8,
    left: width * -0.25 * 0.8,
    bottom: CARD_TOP + CARD_MARGIN_TOP - 120 - 60,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#3A3939',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#ccc',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: '#999',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#FF6A00',
  },
  clearButton: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
}); 