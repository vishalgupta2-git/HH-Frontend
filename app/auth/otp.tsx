import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function OTPScreen() {
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
      setMessage('Please enter a valid 4-digit OTP');
      setMessageType('error');
      return;
    }

    if (isLockedOut) {
      setMessage('Account is temporarily locked. Please wait before trying again.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
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
        console.log('User data stored in AsyncStorage:', completeUserData);
        
        // Force a re-render of the HomeHeader by triggering a storage event
        // This ensures the HomeHeader component updates its user state
        
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        
        // Navigate after a short delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        setMessage(response.data.message || 'Invalid OTP');
        setMessageType('error');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Lockout error
        const lockoutMessage = error.response?.data?.error || 'Too many failed attempts. Please try again in 30 minutes.';
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
        setMessage(error.response?.data?.message || 'Failed to verify OTP');
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || isLockedOut) return;
    
    try {
      const response = await axios.post(getEndpointUrl('SEND_OTP'), { email }, {
        headers: getAuthHeaders()
      });
      setResendTimer(10);
      setMessage('OTP has been resent to your email');
      setMessageType('success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to resend OTP';
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
        <Text style={styles.headerTitle}>Hindu Heritage</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to {email}
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
          <Text style={styles.clearButtonText}>Clear</Text>
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
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        {/* Resend section - simple 30 second timer */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {resendTimer > 0 
              ? `Didn't receive the code? You can resend in ${resendTimer} seconds` 
              : 'Didn\'t receive the code? '
            }
          </Text>
          {resendTimer === 0 && (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            {from === 'signup' ? 'Back to Sign-Up' : 'Back to Login'}
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