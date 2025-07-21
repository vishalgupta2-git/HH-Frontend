import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [statusMsg, setStatusMsg] = useState('');
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const router = useRouter();
  const { email, name } = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '']);
      if (inputs[0].current) {
        inputs[0].current.focus();
      }
    }, [])
  );

  const handleChange = (text, idx) => {
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < 3) {
        inputs[idx + 1].current.focus();
      }
    }
  };

  const handleVerify = async () => {
    if (otp.every((digit) => digit.length === 1)) {
      try {
        await axios.post('http://192.168.1.5:3000/api/verify-otp', {
          email,
          otp: otp.join(''),
        });
        // Save user info to AsyncStorage for login state
        await AsyncStorage.setItem('user', JSON.stringify({ name, email }));
        setStatus('success');
        setStatusMsg('OTP Verified! Redirecting to Home...');
        setTimeout(() => {
          setStatus('');
          setStatusMsg('');
          router.replace('/(tabs)');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setStatusMsg('Invalid OTP. Please try again.');
      }
    } else {
      setStatus('error');
      setStatusMsg('Please enter the 4-digit OTP.');
    }
  };

  const handleResend = () => {
    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    setOtp(['', '', '', '']);
    inputs[0].current.focus();
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
        <Text style={styles.title}>OTP Verify</Text>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={inputs[idx]}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null, idx === otp.findIndex(d => d === '') ? styles.otpInputActive : null]}
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={idx === 0}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && idx > 0) {
                  inputs[idx - 1].current.focus();
                }
              }}
            />
          ))}
        </View>
        {statusMsg ? (
          <Text style={[styles.statusMsg, status === 'success' ? styles.statusSuccess : styles.statusError]}>{statusMsg}</Text>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
          <Text style={styles.resendText}>Resend OTP</Text>
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
    marginBottom: 18,
    textAlign: 'left',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  otpInput: {
    width: 54,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 8,
    fontSize: 22,
    color: '#FF6A00',
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },
  otpInputActive: {
    borderColor: '#FF9800',
  },
  otpInputFilled: {
    borderColor: '#FF9800',
    color: '#FF9800',
  },
  button: {
    backgroundColor: '#3A3939',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 2,
  },
  resendText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  successText: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusMsg: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSuccess: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  statusError: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
}); 