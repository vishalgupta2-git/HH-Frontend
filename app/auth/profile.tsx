import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { awardMudras, MUDRA_ACTIVITIES, hasEarnedDailyMudras } from '@/utils/mudraUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

function validateEmail(email: string) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/.test(email);
}

const genderOptions = ['Male', 'Female', 'Other'];
const rashiOptions = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const options = { headerShown: false };

export default function ProfileScreen() {
  const { isHindi } = useLanguage();
  // Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDateTime, setShowDateTime] = useState(false);

  // UI States
  const [loading, setLoading] = useState(true);
  const [showMudraModal, setShowMudraModal] = useState(false);
  const [mudrasEarned, setMudrasEarned] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const translations = {
    title: { en: 'Profile', hi: 'प्रोफाइल' },
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
    contactInformation: { en: 'Contact Information', hi: 'संपर्क जानकारी' },
    aboutYourself: { en: 'About Yourself', hi: 'अपने बारे में' },
    saveProfile: { en: 'Update Profile', hi: 'प्रोफाइल अपडेट करें' },
    congratulations: { en: 'Congratulations!', hi: 'बधाई हो!' },
    profileUpdatedSuccessfully: { en: 'Profile updated successfully! You earned', hi: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया! आपने कमाए' },
    mudras: { en: 'mudras!', hi: 'मुद्राएं!' },
    fields: {
      firstName: { en: 'First Name *', hi: 'पहला नाम *' },
      lastName: { en: 'Last Name', hi: 'अंतिम नाम' },
      emailId: { en: 'E-mail ID (cannot be changed)', hi: 'ई-मेल आईडी (बदला नहीं जा सकता)' },
      phoneNumber: { en: 'Enter Your Phone No', hi: 'अपना फोन नंबर दर्ज करें' },
      gender: { en: 'Gender', hi: 'लिंग' },
      rashi: { en: 'Rashi', hi: 'राशि' },
      placeOfBirth: { en: 'Place of Birth', hi: 'जन्म स्थान' },
      gotra: { en: 'Gotra', hi: 'गोत्र' },
      dateTimeOfBirth: { en: 'Select Date & Time of Birth', hi: 'जन्म की तारीख और समय चुनें' },
    },
    options: {
      male: { en: 'Male', hi: 'पुरुष' },
      female: { en: 'Female', hi: 'महिला' },
      other: { en: 'Other', hi: 'अन्य' },
    },
    validation: {
      firstNameMinLength: { en: 'First name must be at least 2 characters', hi: 'पहला नाम कम से कम 2 अक्षर का होना चाहिए' },
      validPhoneNumber: { en: 'Enter a valid phone number', hi: 'एक वैध फोन नंबर दर्ज करें' },
      profileUpdateSuccess: { en: 'Profile updated successfully!', hi: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!' },
      profileUpdateError: { en: 'Failed to update profile:', hi: 'प्रोफाइल अपडेट करने में विफल:' }
    },
    success: {
      title: { en: 'Success', hi: 'सफलता' },
      message: { en: 'Profile updated successfully!', hi: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!' }
    },
    error: {
      title: { en: 'Error', hi: 'त्रुटि' },
      message: { en: 'Failed to update profile:', hi: 'प्रोफाइल अपडेट करने में विफल:' }
    }
  };

  // Cleanup mudra modal timeout on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (showMudraModal) {
        setShowMudraModal(false);
      }
    };
  }, []);

  useEffect(() => {
    // Load user data from AsyncStorage and fetch latest from backend
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      let emailToFetch = '';
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setEmail(user.email || '');
          emailToFetch = user.email || '';
        } catch {}
      }
      if (emailToFetch) {
        try {
          const res = await axios.get(`${getEndpointUrl('USER')}?email=${encodeURIComponent(emailToFetch)}`, {
            headers: getAuthHeaders()
          });
          const user = res.data.user;
          setFirstName(user.firstName || user.name?.split(' ')[0] || '');
          setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
          setPhone(user.phone?.toString() || '');
          
          // Handle date of birth
          const dobValue = user.dob || user.dateOfBirth;
          if (dobValue) {
            const dobDate = new Date(dobValue);
            setDob(dobDate);
          }
          
          
          
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleFirstNameChange = (text: string) => {
    const trimmedLeading = text.replace(/^\s+/, '');
    setFirstName(trimmedLeading);
    if (firstNameError) {
      setFirstNameError('');
    }
  };

  const handlePhoneChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    setPhone(numbersOnly);
    if (numbersOnly.length < 7) {
      setPhoneError(isHindi ? translations.validation.validPhoneNumber.hi : translations.validation.validPhoneNumber.en);
    } else {
      setPhoneError('');
    }
  };


  const handleSave = async () => {
    let valid = true;
    
    const trimmedFirstName = firstName.trim();
    if (trimmedFirstName.length < 2) {
      setFirstNameError(isHindi ? translations.validation.firstNameMinLength.hi : translations.validation.firstNameMinLength.en);
      valid = false;
    }
    
    if (!valid) return;
    
    try {
      const profileData = {
        email,
        firstName: trimmedFirstName,
        lastName: lastName ? lastName.trim() : null,
        phone,
        dateOfBirth: dob ? dob.toISOString() : null,
      };
      
      const response = await axios.post(getEndpointUrl('UPDATE_COMPLETE_PROFILE'), profileData, {
        headers: getAuthHeaders()
      });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        ...profileData,
        name: `${trimmedFirstName} ${lastName || ''}`.trim()
      }));
      
      // Award mudras for profile completion (only once per day)
      try {
        if (!hasEarnedDailyMudras('COMPLETE_PROFILE_PHONE')) {
          const mudraResult = await awardMudras('COMPLETE_PROFILE_PHONE');
          if (mudraResult.success) {
            setMudrasEarned(mudraResult.mudrasEarned || 0);
            setShowMudraModal(true);
            // Auto-dismiss modal after 3 seconds
            setTimeout(() => {
              setShowMudraModal(false);
            }, 3000);
          } else {
            // Show success message that auto-closes in 2 seconds
            setShowSuccessModal(true);
            setTimeout(() => {
              setShowSuccessModal(false);
            }, 2000);
          }
        } else {
          // Show success message that auto-closes in 2 seconds
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
          }, 2000);
        }
      } catch (mudraError) {
        // Show success message that auto-closes in 2 seconds
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      Alert.alert(
        isHindi ? translations.error.title.hi : translations.error.title.en, 
        `${isHindi ? translations.error.message.hi : translations.error.message.en} ${err.response?.data?.error || err.message}`
      );
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{isHindi ? translations.loading.hi : translations.loading.en}</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#FFA040", "#FF6A00"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
          <Image
            source={require('@/assets/images/temple illustration.png')}
            style={styles.temple}
          />
        </LinearGradient>
      </View>
      <View style={[styles.card, { marginTop: CARD_TOP + CARD_MARGIN_TOP, marginBottom: 12, zIndex: 2, flex: 1 }]}> 
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{isHindi ? translations.title.hi : translations.title.en}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 400 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>{isHindi ? translations.contactInformation.hi : translations.contactInformation.en}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={isHindi ? translations.fields.firstName.hi : translations.fields.firstName.en}
              placeholderTextColor="#888"
              value={firstName}
              onChangeText={handleFirstNameChange}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={isHindi ? translations.fields.lastName.hi : translations.fields.lastName.en}
              placeholderTextColor="#888"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
          <TextInput
            style={[styles.input, { backgroundColor: '#EEE', color: '#AAA' }]}
            placeholder={isHindi ? translations.fields.emailId.hi : translations.fields.emailId.en}
            placeholderTextColor="#888"
            value={email}
            editable={false}
          />
          <View style={styles.phoneRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={isHindi ? translations.fields.phoneNumber.hi : translations.fields.phoneNumber.en}
              placeholderTextColor="#888"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          
          
          
          
                     {/* Date-Time Picker */}
                       <TouchableOpacity style={styles.input} onPress={() => setShowDateTime(true)}>
              <Text style={styles.dropdownText}>{dob ? dob.toLocaleString() : (isHindi ? translations.fields.dateTimeOfBirth.hi : translations.fields.dateTimeOfBirth.en)}</Text>
            </TouchableOpacity>
          
                     {/* Date of Birth Picker */}
                                               <DateTimePickerModal
               isVisible={showDateTime}
               mode="datetime"
               date={dob || new Date()}
               maximumDate={new Date()}
               minimumDate={new Date('1900-01-01')}
               onConfirm={(date) => { setDob(date); setShowDateTime(false); }}
               onCancel={() => setShowDateTime(false)}
             />
           
          
          
          
          
          
          
          
          
          
          
          
          
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>{isHindi ? translations.saveProfile.hi : translations.saveProfile.en}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Mudra Earning Modal */}
      <Modal
        visible={showMudraModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setShowMudraModal(false)}>
          <View style={styles.mudraModalOverlay}>
            <View style={styles.mudraModalContent}>
              <View style={styles.mudraIconContainer}>
                <Text style={styles.mudraIcon}>🏆</Text>
              </View>
              <Text style={styles.mudraTitle}>{isHindi ? translations.congratulations.hi : translations.congratulations.en}</Text>
              <Text style={styles.mudraMessage}>
                {isHindi ? translations.profileUpdatedSuccessfully.hi : translations.profileUpdatedSuccessfully.en} {mudrasEarned} {isHindi ? translations.mudras.hi : translations.mudras.en}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setShowSuccessModal(false)}>
          <View style={styles.mudraModalOverlay}>
            <View style={styles.mudraModalContent}>
              <View style={styles.mudraIconContainer}>
                <Text style={styles.mudraIcon}>✅</Text>
              </View>
              <Text style={styles.mudraTitle}>{isHindi ? translations.success.title.hi : translations.success.title.en}</Text>
              <Text style={styles.mudraMessage}>
                {isHindi ? translations.success.message.hi : translations.success.message.en}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    bottom: CARD_TOP + CARD_MARGIN_TOP - 120 - 60, // move down by 60px
    resizeMode: 'contain',
    pointerEvents: 'none',
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
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  countryCodeBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#222',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 15,
    marginTop: 8,
  },
  loginLink: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  errorText: { color: '#FF6A00', fontSize: 13, marginBottom: 6, marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  dropdownList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF9800', marginBottom: 8, marginTop: 2 },
  subsectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 6, marginTop: 10 },
  questionLabel: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 8, marginTop: 10 },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#FF6A00',
    backgroundColor: '#FF6A00',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  radioText: {
    fontSize: 16,
    color: '#222',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  dividerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
  },
     dateLabel: {
     fontSize: 14,
     color: '#555',
     marginTop: 4,
   },
   checkboxLabel: {
     fontSize: 16,
     color: '#222',
   },
   kidRow: {
     flexDirection: 'row',
     marginBottom: 14,
   },
   // Mudra Modal Styles
   mudraModalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   mudraModalContent: {
     backgroundColor: '#fff',
     borderRadius: 20,
     padding: 30,
     alignItems: 'center',
     marginHorizontal: 20,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.25,
     shadowRadius: 10,
     elevation: 8,
   },
   mudraIconContainer: {
     width: 80,
     height: 80,
     borderRadius: 40,
     backgroundColor: '#FFD700',
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 20,
     shadowColor: '#FFD700',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 8,
     elevation: 6,
   },
   mudraIcon: {
     fontSize: 40,
   },
   mudraTitle: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#222',
     marginBottom: 15,
     textAlign: 'center',
   },
   mudraMessage: {
     fontSize: 16,
     color: '#666',
     textAlign: 'center',
     lineHeight: 22,
   },
   title: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#FF6A00',
     marginBottom: 18,
     textAlign: 'center',
   },
   // New styles for contentHeader
   contentHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingTop: 20,
     paddingBottom: 16,
     borderBottomWidth: 1,
     borderBottomColor: '#E0E0E0',
     marginBottom: 20,
   },
   backButton: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: '#F0F0F0',
     alignItems: 'center',
     justifyContent: 'center',
     marginRight: 16,
     position: 'absolute',
     left: -15,
     top: -10,
   },
   titleContainer: {
     position: 'absolute',
     left: 0,
     right: 0,
     alignItems: 'center',
     justifyContent: 'center',
   },

}); 