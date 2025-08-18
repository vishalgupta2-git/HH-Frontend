import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { awardMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';

const { width } = Dimensions.get('window');

function validateEmail(email: string) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/.test(email);
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Test the age calculation function (for development only)
// console.log('Test: 18 years ago today:', calculateAge(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)));
// console.log('Test: 17 years ago today:', calculateAge(new Date(Date.now() - 17 * 365 * 24 * 60 * 60 * 1000)));

const genderOptions = ['Male', 'Female', 'Other'];
const rashiOptions = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const kidGenderOptions = ['Male', 'Female', 'Other'];

// Country data with country codes - Clean version
const countries = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'UAE', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: '🇧🇹' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95', flag: '🇲🇲' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: '🇧🇬' },
  { name: 'Croatia', code: 'HR', dialCode: '+385', flag: '🇭🇷' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', flag: '🇸🇮' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: '🇸🇰' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: '🇪🇪' },
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: '🇱🇻' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: '🇱🇹' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', dialCode: '+47', flag: '🇩🇰' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: '🇮🇸' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺' },
  { name: 'Monaco', code: 'MC', dialCode: '+377', flag: '🇲🇨' },
  { name: 'Liechtenstein', code: 'LI', dialCode: '+423', flag: '🇱🇮' },
  { name: 'Andorra', code: 'AD', dialCode: '+376', flag: '🇦🇩' },
  { name: 'San Marino', code: 'SM', dialCode: '+378', flag: '🇸🇲' },
  { name: 'Vatican City', code: 'VA', dialCode: '+379', flag: '🇻🇦' },
  { name: 'Malta', code: 'MT', dialCode: '+356', flag: '🇲🇹' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: '🇨🇾' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Syria', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222', flag: '🇲🇷' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
  { name: 'Gambia', code: 'GM', dialCode: '+220', flag: '🇬🇲' },
  { name: 'Guinea-Bissau', code: 'GW', dialCode: '+245', flag: '🇬🇼' },
  { name: 'Guinea', code: 'GN', dialCode: '+224', flag: '🇬🇳' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: '🇸🇱' },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: '🇱🇷' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225', flag: '🇨🇮' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: '🇧🇯' },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: '🇳🇪' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: '🇧🇫' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱' },
  { name: 'Chad', code: 'TD', dialCode: '+235', flag: '🇹🇩' },
  { name: 'Central African Republic', code: 'CF', dialCode: '+236', flag: '🇨🇫' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲' },
  { name: 'Equatorial Guinea', code: 'GQ', dialCode: '+240', flag: '🇬🇶' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: '🇬🇦' },
  { name: 'Congo', code: 'CG', dialCode: '+242', flag: '🇨🇬' },
  { name: 'Democratic Republic of Congo', code: 'CD', dialCode: '+243', flag: '🇨🇩' },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: '🇧🇼' },
  { name: 'Namibia', code: 'NA', dialCode: '+264', flag: '🇳🇦' },
  { name: 'Lesotho', code: 'LS', dialCode: '+266', flag: '🇱🇸' },
  { name: 'Eswatini', code: 'SZ', dialCode: '+268', flag: '🇸🇿' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: '🇲🇬' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺' },
  { name: 'Seychelles', code: 'SC', dialCode: '+248', flag: '🇸🇨' },
  { name: 'Comoros', code: 'KM', dialCode: '+269', flag: '🇰🇲' },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253', flag: '🇩🇯' },
  { name: 'Somalia', code: 'SO', dialCode: '+252', flag: '🇸🇴' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
  { name: 'Eritrea', code: 'ER', dialCode: '+291', flag: '🇪🇷' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'South Sudan', code: 'SS', dialCode: '+211', flag: '🇸🇸' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼' },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: '🇧🇮' },
  { name: 'Malawi', code: 'MW', dialCode: '+265', flag: '🇲🇼' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: '🇲🇿' },
];

export const options = { headerShown: false };

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to India
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDateTime, setShowDateTime] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [rashi, setRashi] = useState('');
  const [gotra, setGotra] = useState('');
  const router = useRouter();
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState<Date | null>(null);
  const [widowDate, setWidowDate] = useState<Date | null>(null);
  const [hasKids, setHasKids] = useState<boolean | null>(null);
  const [kids, setKids] = useState<Array<{
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: Date | null;
  }>>([]);
  const [maritalStatusDropdownOpen, setMaritalStatusDropdownOpen] = useState(false);
  const [showAnniversaryDate, setShowAnniversaryDate] = useState(false);
  const [showWidowDate, setShowWidowDate] = useState(false);
  const [showKidDob, setShowKidDob] = useState<number | null>(null);
  const [showKidGender, setShowKidGender] = useState<number | null>(null);
  
  // Family information states
  const [motherName, setMotherName] = useState('');
  const [motherDob, setMotherDob] = useState<Date | null>(null);
  const [motherDeceased, setMotherDeceased] = useState(false);
  const [motherDeathAnniversary, setMotherDeathAnniversary] = useState<Date | null>(null);
  const [showMotherDob, setShowMotherDob] = useState(false);
  const [showMotherDeathAnniversary, setShowMotherDeathAnniversary] = useState(false);
  
  const [fatherName, setFatherName] = useState('');
  const [fatherDob, setFatherDob] = useState<Date | null>(null);
  const [fatherDeceased, setFatherDeceased] = useState(false);
  const [fatherDeathAnniversary, setFatherDeathAnniversary] = useState<Date | null>(null);
  const [showFatherDob, setShowFatherDob] = useState(false);
  const [showFatherDeathAnniversary, setShowFatherDeathAnniversary] = useState(false);
  
  const [spouseName, setSpouseName] = useState('');
  const [spouseDob, setSpouseDob] = useState<Date | null>(null);
  const [showSpouseDob, setShowSpouseDob] = useState(false);
  
  // Terms and Privacy Policy states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleFirstNameChange = (text: string) => {
    // Only trim leading spaces automatically, allow spaces between words
    const trimmedLeading = text.replace(/^\s+/, '');
    setFirstName(trimmedLeading);
    
    // Clear error when user is typing
    if (nameError) {
      setNameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    setPhone(numbersOnly);
    
    // Basic validation - different countries have different phone number lengths
    const minLength = selectedCountry.code === 'IN' ? 10 : 7; // India: 10 digits, others: 7+
    const maxLength = selectedCountry.code === 'IN' ? 10 : 15; // India: 10 digits, others: 15 max
    
    if (numbersOnly.length < minLength) {
      setPhoneError(`Enter a valid phone number (min ${minLength} digits)`);
    } else if (numbersOnly.length > maxLength) {
      setPhoneError(`Phone number too long (max ${maxLength} digits)`);
    } else {
      setPhoneError('');
    }
  };

  const addKid = () => {
    setKids([...kids, {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: null,
    }]);
  };

  const removeKid = (index: number) => {
    setKids(kids.filter((_, i) => i !== index));
  };

  const updateKid = (index: number, field: string, value: any) => {
    const updatedKids = [...kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    setKids(updatedKids);
  };

  const handleCreateAccount = async () => {
    let valid = true;
    
    // Trim trailing spaces and check overall name validation on submit
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (trimmedFirstName.length < 2) {
      setNameError('First name must be at least 2 characters');
      valid = false;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }
    
    // Phone validation
    if (!phone || phone.length === 0) {
      setPhoneError('Please enter your phone number');
      valid = false;
    } else if (phoneError) {
      valid = false; // Phone already has an error
    }
    
    // Age validation - must be 18 or older
    if (!dob) {
      Alert.alert('Age Required', 'Please select your date of birth to continue.');
      valid = false;
    } else {
      const age = calculateAge(dob);
      
      if (age < 18) {
        const yearsUntil18 = 18 - age;
        const message = age === 17 
          ? 'You are currently 17 years old. You need to wait 1 year to create an account.'
          : `You are currently ${age} years old. You need to wait ${yearsUntil18} years to create an account.`;
          
        Alert.alert(
          'Age Restriction', 
          message,
          [{ text: 'OK' }]
        );
        valid = false;
      }
    }
    
    if (!valid) return;
    
         const signupData = {
       firstName: trimmedFirstName,
       lastName: trimmedLastName,
       email,
       phone: selectedCountry.dialCode + phone, // Include country code
       country: selectedCountry.code,
       countryName: selectedCountry.name,
       gender,
       dateOfBirth: dob ? dob.toISOString() : null,
       placeOfBirth,
       gotra,
       rashi,
       maritalStatus,
       anniversaryDate: anniversaryDate ? anniversaryDate.toISOString() : null,
       kids: hasKids === true ? kids.map(kid => ({
         firstName: kid.firstName,
         lastName: kid.lastName,
         gender: kid.gender,
         dateOfBirth: kid.dateOfBirth ? kid.dateOfBirth.toISOString() : null,
       })) : null,
       parents: {
         mother: motherName ? {
           name: motherName,
           dateOfBirth: motherDeceased ? null : (motherDob ? motherDob.toISOString() : null),
           deceased: motherDeceased,
           deathAnniversary: motherDeceased ? (motherDeathAnniversary ? motherDeathAnniversary.toISOString() : null) : null,
         } : null,
         father: fatherName ? {
           name: fatherName,
           dateOfBirth: fatherDeceased ? null : (fatherDob ? fatherDob.toISOString() : null),
           deceased: fatherDeceased,
           deathAnniversary: fatherDeceased ? (fatherDeathAnniversary ? fatherDeathAnniversary.toISOString() : null) : null,
         } : null,
         spouse: maritalStatus === 'Married' && spouseName ? {
           name: spouseName,
           dateOfBirth: spouseDob ? spouseDob.toISOString() : null,
         } : null,
       }
     };
    
    console.log('Sending signup data:', signupData);
    
    try {
      console.log('Calling signup endpoint...');
      const signupRes = await axios.post(getEndpointUrl('SIGNUP'), signupData);
      console.log('Signup response:', signupRes.data);
      
      if (signupRes.data && signupRes.data.error === 'Email already registered.') {
        setEmailError('An account already exists with this ID. Please go to login screen to access your account.');
        return;
      }
      
      console.log('Calling send OTP endpoint...');
      const otpRes = await axios.post(getEndpointUrl('SEND_OTP'), { email });
      console.log('OTP response:', otpRes.data);
      
      // Award mudras for signup
      try {
        const mudraResult = await awardMudras('SIGN_UP');
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for signup:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for signup:', mudraResult.error);
        }
      } catch (mudraError) {
        console.log('⚠️ Error awarding mudras for signup:', mudraError);
      }
      
      router.push({ pathname: '/auth/otp', params: { email, name: trimmedFirstName + ' ' + trimmedLastName, from: 'signup' } });
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response && err.response.data && err.response.data.error === 'Email already registered.') {
        setEmailError('An account already exists with this ID. Please go to login screen to access your account.');
        return;
      }
      
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create account or send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

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
      {/* Single card with all fields, scrollable content inside */}
      <View style={[styles.card, { marginTop: CARD_TOP + CARD_MARGIN_TOP, marginBottom: 12, zIndex: 2, flex: 1 }]}> 
                 <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 400 }} keyboardShouldPersistTaps="handled">
           <Text style={styles.sectionLabel}>Contact Information</Text>
           <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                           <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="First Name *"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={handleFirstNameChange}
              />
             <TextInput
               style={[styles.input, { flex: 1 }]}
               placeholder="Last Name"
               placeholderTextColor="#888"
               value={lastName}
               onChangeText={setLastName}
             />
           </View>
           {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                                           <TextInput
              style={styles.input}
              placeholder="Enter E-mail ID *"
              placeholderTextColor="#888"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <Text style={styles.fieldNote}>
            📱 Phone Number *
          </Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity 
              style={styles.countryCodeBox}
              onPress={() => setCountryDropdownOpen(true)}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter Your Phone No"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
          
          {/* Country Selection Modal */}
          <Modal
            visible={countryDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setCountryDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setCountryDropdownOpen(false)}>
              <View style={styles.countryModalOverlay}>
                <View style={styles.modalDropdownList}>
                  <Text style={styles.countryModalTitle}>Select Country</Text>
                  <ScrollView style={{ maxHeight: 400, marginTop: 4 }}>
                    {countries.map(country => (
                      <TouchableOpacity 
                        key={country.code} 
                        onPress={() => { 
                          setSelectedCountry(country); 
                          setCountryDropdownOpen(false);
                        }}
                      >
                        <View style={styles.countryOption}>
                          <Text style={styles.countryFlag}>{country.flag}</Text>
                          <Text style={styles.countryName}>{country.name}</Text>
                          <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
                     {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
           <Text style={styles.sectionLabel}>About Yourself</Text>
          {/* Gender and Rashi Dropdowns on the same line, no labels */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                         <TouchableOpacity
               style={[styles.dropdown, { flex: 1 }]}
               onPress={() => setGenderDropdownOpen(true)}
             >
               <Text style={styles.dropdownText}>{gender || 'Gender'}</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[styles.dropdown, { flex: 1 }]}
               onPress={() => setRashiDropdownOpen(true)}
             >
               <Text style={styles.dropdownText}>{rashi || 'Rashi'}</Text>
             </TouchableOpacity>
          </View>
          {/* Gender Modal */}
          <Modal
            visible={genderDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setGenderDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setGenderDropdownOpen(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalDropdownList}>
                  {genderOptions.map(option => (
                    <TouchableOpacity key={option} onPress={() => { setGender(option); setGenderDropdownOpen(false); }}>
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {/* Rashi Modal */}
          <Modal
            visible={rashiDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setRashiDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setRashiDropdownOpen(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalDropdownList}>
                  {rashiOptions.map(option => (
                    <TouchableOpacity key={option} onPress={() => { setRashi(option); setRashiDropdownOpen(false); }}>
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          
          {/* Marital Status Modal */}
          <Modal
            visible={maritalStatusDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMaritalStatusDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setMaritalStatusDropdownOpen(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalDropdownList}>
                  {maritalStatusOptions.map(option => (
                    <TouchableOpacity key={option} onPress={() => { 
                      setMaritalStatus(option); 
                      setMaritalStatusDropdownOpen(false);
                      // Clear dates when marital status changes
                      if (option !== 'Married') setAnniversaryDate(null);
                      if (option !== 'Widowed') setWidowDate(null);
                    }}>
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          
                     {/* Date-Time Picker (combined, no label) */}
           <Text style={styles.fieldNote}>
             📅 Date & Time of Birth * (Must be 18 or older to sign up)
           </Text>
           <TouchableOpacity style={styles.input} onPress={() => setShowDateTime(true)}>
             <Text style={styles.dropdownText}>{dob ? dob.toLocaleString() : 'Select Date & Time of Birth'}</Text>
           </TouchableOpacity>
           
           {/* Age Indicator */}
           {dob && (
             <View style={styles.ageIndicator}>
               <Text style={styles.ageText}>
                 Age: {calculateAge(dob)} years old
               </Text>
               {calculateAge(dob) < 18 ? (
                 <Text style={styles.ageWarning}>
                   ⚠️ Must be 18 or older to sign up
                 </Text>
               ) : (
                 <Text style={styles.ageSuccess}>
                   ✅ Age requirement met
                 </Text>
               )}
             </View>
           )}
           
          <DateTimePickerModal
            isVisible={showDateTime}
            mode="datetime"
            date={dob || new Date()}
            maximumDate={new Date()}
            minimumDate={new Date('1900-01-01')}
            onConfirm={(date) => { setDob(date); setShowDateTime(false); }}
            onCancel={() => setShowDateTime(false)}
          />
          
          {/* Anniversary Date Picker */}
          <DateTimePickerModal
            isVisible={showAnniversaryDate}
            mode="date"
            date={anniversaryDate || new Date()}
            maximumDate={new Date()}
            minimumDate={new Date('1900-01-01')}
            onConfirm={(date) => { setAnniversaryDate(date); setShowAnniversaryDate(false); }}
            onCancel={() => setShowAnniversaryDate(false)}
          />
          
          {/* Widow Date Picker */}
          <DateTimePickerModal
            isVisible={showWidowDate}
            mode="date"
            date={widowDate || new Date()}
            maximumDate={new Date()}
            minimumDate={new Date('1900-01-01')}
            onConfirm={(date) => { setWidowDate(date); setShowWidowDate(false); }}
            onCancel={() => setShowWidowDate(false)}
          />
          
          {/* Kid Date of Birth Picker */}
          <DateTimePickerModal
            isVisible={showKidDob !== null}
            mode="date"
            date={showKidDob !== null && kids[showKidDob]?.dateOfBirth ? kids[showKidDob].dateOfBirth : new Date()}
            maximumDate={new Date()}
            minimumDate={new Date('1900-01-01')}
            onConfirm={(date) => { 
              if (showKidDob !== null) {
                updateKid(showKidDob, 'dateOfBirth', date);
              }
              setShowKidDob(null);
            }}
            onCancel={() => setShowKidDob(null)}
          />
          
                     {/* Kid Gender Modal */}
           <Modal
             visible={showKidGender !== null}
             transparent
             animationType="fade"
             onRequestClose={() => setShowKidGender(null)}
           >
             <TouchableWithoutFeedback onPress={() => setShowKidGender(null)}>
               <View style={styles.modalOverlay}>
                 <View style={styles.modalDropdownList}>
                   {kidGenderOptions.map(option => (
                     <TouchableOpacity key={option} onPress={() => { 
                       if (showKidGender !== null) {
                         updateKid(showKidGender, 'gender', option);
                       }
                       setShowKidGender(null);
                     }}>
                       <Text style={styles.dropdownText}>{option}</Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
             </TouchableWithoutFeedback>
           </Modal>
           
           {/* Mother Date of Birth Picker */}
           <DateTimePickerModal
             isVisible={showMotherDob}
             mode="date"
             date={motherDob || new Date()}
             maximumDate={new Date()}
             minimumDate={new Date('1900-01-01')}
             onConfirm={(date) => { setMotherDob(date); setShowMotherDob(false); }}
             onCancel={() => setShowMotherDob(false)}
           />
           
           {/* Mother Death Anniversary Picker */}
           <DateTimePickerModal
             isVisible={showMotherDeathAnniversary}
             mode="date"
             date={motherDeathAnniversary || new Date()}
             maximumDate={new Date()}
             minimumDate={new Date('1900-01-01')}
             onConfirm={(date) => { setMotherDeathAnniversary(date); setShowMotherDeathAnniversary(false); }}
             onCancel={() => setShowMotherDeathAnniversary(false)}
           />
           
           {/* Father Date of Birth Picker */}
           <DateTimePickerModal
             isVisible={showFatherDob}
             mode="date"
             date={fatherDob || new Date()}
             maximumDate={new Date()}
             minimumDate={new Date('1900-01-01')}
             onConfirm={(date) => { setFatherDob(date); setShowFatherDob(false); }}
             onCancel={() => setShowFatherDob(false)}
           />
           
           {/* Father Death Anniversary Picker */}
           <DateTimePickerModal
             isVisible={showFatherDeathAnniversary}
             mode="date"
             date={fatherDeathAnniversary || new Date()}
             maximumDate={new Date()}
             minimumDate={new Date('1900-01-01')}
             onConfirm={(date) => { setFatherDeathAnniversary(date); setShowFatherDeathAnniversary(false); }}
             onCancel={() => setShowFatherDeathAnniversary(false)}
           />
           
           {/* Spouse Date of Birth Picker */}
           <DateTimePickerModal
             isVisible={showSpouseDob}
             mode="date"
             date={spouseDob || new Date()}
             maximumDate={new Date()}
             minimumDate={new Date('1900-01-01')}
             onConfirm={(date) => { setSpouseDob(date); setShowSpouseDob(false); }}
             onCancel={() => setShowSpouseDob(false)}
           />
                     {/* Place of Birth and Gotra in same row */}
           <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
             <TextInput
               style={[styles.input, { flex: 1 }]}
               placeholder="Place of Birth"
               placeholderTextColor="#888"
               value={placeOfBirth}
               onChangeText={setPlaceOfBirth}
             />
             <TextInput
               style={[styles.input, { flex: 1 }]}
               placeholder="Gotra"
               placeholderTextColor="#888"
               value={gotra}
               onChangeText={setGotra}
             />
           </View>
          
                                <Text style={styles.sectionLabel}>Your Family</Text>
           
           {/* Parents Divider */}
           <View style={styles.dividerContainer}>
             <Text style={styles.dividerText}>Parents</Text>
             <View style={styles.dividerLine} />
           </View>
           
           {/* Mother Information */}
           <Text style={styles.subsectionLabel}>Mother's Information</Text>
           <TextInput
             style={styles.input}
             placeholder="Mother's Name"
             placeholderTextColor="#888"
             value={motherName}
             onChangeText={setMotherName}
           />
           
                       <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={styles.checkboxOption} 
                onPress={() => {
                  setMotherDeceased(!motherDeceased);
                  // Reset dates when toggling deceased status
                  if (!motherDeceased) {
                    setMotherDob(null);
                  } else {
                    setMotherDeathAnniversary(null);
                  }
                }}
              >
                <View style={[styles.checkbox, motherDeceased && styles.checkboxSelected]}>
                  {motherDeceased && <Text style={styles.checkboxText}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Deceased</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.dateLabel}>
              {motherDeceased ? 'Death Anniversary' : 'Date of Birth'}
            </Text>
            {!motherDeceased ? (
              <TouchableOpacity style={styles.input} onPress={() => setShowMotherDob(true)}>
                <Text style={styles.dropdownText}>
                  {motherDob ? motherDob.toLocaleDateString() : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.input} onPress={() => setShowMotherDeathAnniversary(true)}>
                <Text style={styles.dropdownText}>
                  {motherDeathAnniversary ? motherDeathAnniversary.toLocaleDateString() : 'Select Death Anniversary'}
                </Text>
              </TouchableOpacity>
            )}
           
           {/* Father Information */}
           <Text style={styles.subsectionLabel}>Father's Information</Text>
           <TextInput
             style={styles.input}
             placeholder="Father's Name"
             placeholderTextColor="#888"
             value={fatherName}
             onChangeText={setFatherName}
           />
           
                       <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={styles.checkboxOption} 
                onPress={() => {
                  setFatherDeceased(!fatherDeceased);
                  // Reset dates when toggling deceased status
                  if (!fatherDeceased) {
                    setFatherDob(null);
                  } else {
                    setFatherDeathAnniversary(null);
                  }
                }}
              >
                <View style={[styles.checkbox, fatherDeceased && styles.checkboxSelected]}>
                  {fatherDeceased && <Text style={styles.checkboxText}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Deceased</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.dateLabel}>
              {fatherDeceased ? 'Death Anniversary' : 'Date of Birth'}
            </Text>
            {!fatherDeceased ? (
              <TouchableOpacity style={styles.input} onPress={() => setShowFatherDob(true)}>
                <Text style={styles.dropdownText}>
                  {fatherDob ? fatherDob.toLocaleDateString() : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.input} onPress={() => setShowFatherDeathAnniversary(true)}>
                <Text style={styles.dropdownText}>
                  {fatherDeathAnniversary ? fatherDeathAnniversary.toLocaleDateString() : 'Select Death Anniversary'}
                </Text>
              </TouchableOpacity>
            )}
           
           {/* Spouse and Kids Divider */}
           <View style={styles.dividerContainer}>
             <Text style={styles.dividerText}>Spouse and Kids</Text>
             <View style={styles.dividerLine} />
           </View>
           
           {/* Marital Status */}
           <Text style={styles.subsectionLabel}>Marital Status</Text>
           <TouchableOpacity
             style={styles.dropdown}
             onPress={() => setMaritalStatusDropdownOpen(true)}
           >
             <Text style={styles.dropdownText}>{maritalStatus || 'Marital Status'}</Text>
           </TouchableOpacity>
           
           {/* Anniversary Date - Only show if Married */}
           {maritalStatus === 'Married' && (
             <TouchableOpacity style={styles.input} onPress={() => setShowAnniversaryDate(true)}>
               <Text style={styles.dropdownText}>
                 {anniversaryDate ? anniversaryDate.toLocaleDateString() : 'Select Anniversary Date'}
               </Text>
             </TouchableOpacity>
           )}
           
           {/* Widow Date - Only show if Widowed */}
           {maritalStatus === 'Widowed' && (
             <TouchableOpacity style={styles.input} onPress={() => setShowWidowDate(true)}>
               <Text style={styles.dropdownText}>
                 {widowDate ? widowDate.toLocaleDateString() : 'Select Widow Date'}
               </Text>
             </TouchableOpacity>
           )}
           
           {/* Spouse Information - Only show if Married */}
           {maritalStatus === 'Married' && (
             <>
               <Text style={styles.subsectionLabel}>Spouse's Information</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Spouse's Name"
                 placeholderTextColor="#888"
                 value={spouseName}
                 onChangeText={setSpouseName}
               />
               
               <TouchableOpacity style={styles.input} onPress={() => setShowSpouseDob(true)}>
                 <Text style={styles.dropdownText}>
                   {spouseDob ? spouseDob.toLocaleDateString() : 'Spouse\'s Date of Birth'}
                 </Text>
               </TouchableOpacity>
             </>
           )}
           
           {/* Do you have kids? */}
           <Text style={styles.questionLabel}>Do you have kids?</Text>
           <View style={styles.radioGroup}>
             <TouchableOpacity 
               style={styles.radioOption} 
               onPress={() => setHasKids(true)}
             >
               <View style={[styles.radioButton, hasKids === true && styles.radioButtonSelected]}>
                 {hasKids === true && <View style={styles.radioButtonInner} />}
               </View>
               <Text style={styles.radioText}>Yes</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.radioOption} 
               onPress={() => setHasKids(false)}
             >
               <View style={[styles.radioButton, hasKids === false && styles.radioButtonSelected]}>
                 {hasKids === false && <View style={styles.radioButtonInner} />}
               </View>
               <Text style={styles.radioText}>No</Text>
             </TouchableOpacity>
           </View>
          
          {/* Kids Information - Only show if hasKids is true */}
          {hasKids === true && (
            <View style={styles.kidsSection}>
              <Text style={styles.subsectionLabel}>Kids Information</Text>
              {kids.map((kid, index) => (
                <View key={index} style={styles.kidCard}>
                  <View style={styles.kidHeader}>
                    <Text style={styles.kidTitle}>Kid {index + 1}</Text>
                    {kids.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeKidButton}
                        onPress={() => removeKid(index)}
                      >
                        <Text style={styles.removeKidText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#888"
                    value={kid.firstName}
                    onChangeText={(text) => updateKid(index, 'firstName', text)}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#888"
                    value={kid.lastName}
                    onChangeText={(text) => updateKid(index, 'lastName', text)}
                  />
                  
                  <View style={styles.kidRow}>
                    <TouchableOpacity
                      style={[styles.dropdown, { flex: 1, marginRight: 8 }]}
                      onPress={() => setShowKidGender(index)}
                    >
                      <Text style={styles.dropdownText}>{kid.gender || 'Gender'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.dropdown, { flex: 1, marginLeft: 8 }]}
                      onPress={() => setShowKidDob(index)}
                    >
                      <Text style={styles.dropdownText}>
                        {kid.dateOfBirth ? kid.dateOfBirth.toLocaleDateString() : 'Date of Birth'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity style={styles.addKidTextButton} onPress={addKid}>
                <Text style={styles.addKidTextLink}>+ Add Another Kid</Text>
              </TouchableOpacity>
            </View>
                     )}
           <Text style={styles.requiredNote}>All fields with * are required</Text>
           
           {/* Terms and Privacy Policy Text */}
           <View style={styles.termsContainer}>
             <Text style={styles.termsText}>
               By proceeding you agree to the{' '}
               <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                 Terms & Conditions
               </Text>
               {' '}and{' '}
               <Text style={styles.termsLink} onPress={() => setShowPrivacyModal(true)}>
                 Privacy Policy
               </Text>
               {' '}of The Hindu Heritage
             </Text>
           </View>
           
           <TouchableOpacity 
             style={styles.button} 
             onPress={handleCreateAccount}
           >
             <Text style={styles.buttonText}>Create Account</Text>
           </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.replace('/auth/login')}>Login</Text>
          </Text>
        </ScrollView>
      </View>
      
      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
                         <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
               <Text style={styles.modalHeading}>TERMS OF USE</Text>
               
               <Text style={styles.modalNormalText}>
                 PLEASE READ THESE TERMS OF USE CAREFULLY. BY USING THE PLATFORM, YOU AGREE TO BE BOUND BY ALL OF THE BELOW TERMS AND CONDITIONS AND THE PRIVACY POLICY.
               </Text>

               <Text style={styles.modalLevel1}>1. INTRODUCTION</Text>
               
               <Text style={styles.modalNormalText}>
                 The mobile applications on Android and iOS Platforms 'The Hindu Heritage' (together "Platform") are owned and operated by Audguide Heritage Travel Private Limited, a private company incorporated in India under the Companies Act, 2013 and having its registered office at #C-127 NDMC SOCIETY, NDMC EMPLOYEES CGHS LTD, Vikas Puri, New Delhi, West Delhi, Delhi, India, 110018. This includes any of our affiliates, associates, assignees or successors-in-interest as determined by us at our sole discretion and without requiring any prior notice or intimation to you ("Company", "we" or "us" or "our"). Your ("you", "your" or "user") use of the Services (as defined herein) is subject to these terms and conditions ("Terms of Use").
               </Text>

               <Text style={styles.modalLevel2}>1.2</Text>
               <Text style={styles.modalNormalText}>
                 Please read these Terms of Use, along with the Privacy Policy available in the app and all other rules and policies made available or published on the Platform as they shall govern your use of the Platform and the services provided thereunder.
               </Text>

               <Text style={styles.modalLevel2}>1.3</Text>
               <Text style={styles.modalNormalText}>
                 By using or visiting the Platform, you signify your agreement to these Terms of Use and the Privacy Policy.
               </Text>

               <Text style={styles.modalLevel2}>1.4</Text>
               <Text style={styles.modalNormalText}>
                 These Terms of Use are an electronic record as per the Information Technology Act, 2000 (as amended/re-enacted) and rules thereunder ("IT Act") and is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics code) Rules, 2021, which mandates the publishing of rules and regulations, privacy policy and terms and conditions for access or usage of any application or website. This electronic record is generated by a computer system and does not require any physical or digital signature. In addition, some of the Services may be subject to additional terms and conditions specified by us from time to time; your use of such solution is subject to those additional terms and conditions, which are incorporated into these Terms of Use by reference.
               </Text>

               <Text style={styles.modalLevel1}>2. OVERVIEW OF THE SERVICES</Text>
               
               <Text style={styles.modalNormalText}>
                 We are, inter alia, engaged in the business of digitizing temples and other religious experiences for our users, providing astrological services and other related services ("Services").
               </Text>

               <Text style={styles.modalLevel1}>3. ACCEPTANCE OF TERMS</Text>
               
               <Text style={styles.modalNormalText}>
                 By downloading and/or by registering or signing up for these Services, or otherwise having access to, receiving, and/or using the Platform, you acknowledge to have read, understood and consented to be governed and bound by these Terms of Use and the Privacy Policy. If you do not accept or agree to any part of these Terms of Use or the Privacy Policy, your usage of the Services will be terminated.
               </Text>

               <Text style={styles.modalLevel1}>4. ACCESS</Text>
               
               <Text style={styles.modalLevel2}>4.1</Text>
               <Text style={styles.modalNormalText}>
                 Subject to these Terms of Use, we may offer to provide you with Services selected by you, solely for your own use, and not for the use or benefit of any third party. Services shall include, but not be limited to, any services we perform for you, any hardware offered by us, or any widgets that you download from the Platform. In case of any discrepancy in the Services, you must bring the same to our notice in writing, within a period of 7 (seven) days from date of performance of the Services, failing which the Services shall be deemed accepted, fulfilled and satisfactorily completed.
               </Text>

               <Text style={styles.modalLevel2}>4.2</Text>
               <Text style={styles.modalNormalText}>
                 You agree not to circumvent, disable or otherwise interfere with security-related features of the Platform or features that prevent or restrict use or copying of any restricted information.
               </Text>

               <Text style={styles.modalLevel1}>5. REGISTRATION AND ELIGIBILITY</Text>
               
               <Text style={styles.modalLevel2}>5.1</Text>
               <Text style={styles.modalNormalText}>
                 Only persons who can form legally binding contracts under the Indian Contract Act, 1872 may access the Platform and avail our Services. Persons who are 'incompetent to contract' within the meaning of the Indian Contract Act, 1872 including without limitation, un-discharged insolvents, are not eligible to avail our Services. If you are a minor i.e., under the age of 18 (eighteen) years, you cannot register and/or avail our Services. We reserve the right to refuse to provide you with access to the Services if it is brought to our notice or if it is discovered that you are incompetent to contract. You represent and warrant to us that you are of legal age to form a binding contract and are not a person barred from availing the Services under applicable laws.
               </Text>

               <Text style={styles.modalLevel2}>5.2</Text>
               <Text style={styles.modalNormalText}>
                 You may, at your sole discretion, log into the application using your Email ("Login Details").
               </Text>

               <Text style={styles.modalLevel2}>5.3</Text>
               <Text style={styles.modalNormalText}>
                 Notwithstanding anything contained herein, you shall not:
               </Text>
               <Text style={styles.modalNormalText}>
                 • 5.3.1 provide any false personal information to us (including false/fraudulent Login Details) or create any account for anyone other than yourself without such person's explicit permission; or
               </Text>
               <Text style={styles.modalNormalText}>
                 • 5.3.2 use the Login Details of another person with the intent to impersonate that person.
               </Text>

               <Text style={styles.modalLevel1}>6. YOUR RESPONSIBILITIES</Text>
               
               <Text style={styles.modalLevel2}>6.1</Text>
               <Text style={styles.modalNormalText}>
                 By using the Platform, you represent and warrant that:
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.1 you have fully read and understood the Terms of Use and Privacy Policy and consent to them;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.2 you will ensure that your use of the Platform and/or Services will not violate any applicable law or regulation;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.3 you have no rights in, or to, the Platform or the technology used or supported by the Platform or any of the Services, other than the right to use each of them in accordance with these Terms of Use;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.4 you will not use the Platform or the Services in any manner inconsistent with these Terms of Use or Privacy Policy;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.5 you will not resell or make any commercial use of the Services or use the Services in any way that is unlawful, for any unlawful purpose, or in a manner that your use harms us, the Platform, or any other person or entity, as determined in our sole discretion, or act fraudulently or maliciously;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.6 you will not decipher, decompile, disassemble, reverse engineer or otherwise attempt to derive any hardware, or source code or underlying ideas or algorithms of any part of the Service (including without limitation any application or widget), except to the limited extent applicable laws specifically prohibit such restriction;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.7 you will not transmit or make available any software or other computer files that contain a virus or other harmful component, or otherwise impair or damage the Platform or any connected network, or otherwise damage, disable, overburden, impair or compromise the Platform, our systems or security or interfere with any person or entity's use or enjoyment of the Platform;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.8 you will not post, publish or transmit any content or messages that (i) are false, misleading, defamatory, harmful, threatening, abusive or constitute harassment (ii) promote racism, entail hateful slurs or promote hateful behavior, associate with hate groups or any violence towards others including terrorism or self-harm or suicide or harm against any individual or group or religion or caste, (iii) infringe another's rights including any intellectual property rights or copyright or trademark, violate or encourage any conduct that would violate any applicable law or regulation or would give rise to civil liability, or (iv) depict or encourage profanity, nudity, inappropriate clothing, sexual acts, sexually suggestive poses or degrade or objectify people, whether in the nature of a prank, entertainment or otherwise.
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.9 you will not promote the use of explosives or firearms, the consumption of psychotropic drugs or any other illegal activities;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.10 you will not disparage, make false or malicious statements against us or in connection with the Services or the Platform;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.11 you will not interfere or attempt to interfere with the proper working of the Platform or any activities conducted on the Platform;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.12 you will not bypass any measures we may use to prevent or restrict access to the Services;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.13 you will not run any form of autoresponder or "spam" on the Platform;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.14 you will not use manual or automated software, devices, or other processes to "crawl" or "spider" any part of the Services;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.15 you will not modify, adapt, appropriate, reproduce, distribute, translate, create derivative works or adaptations of, publicly display, republish, repurpose, sell, trade, or in any way exploit the Service, except as expressly authorized by us;
               </Text>
               <Text style={styles.modalNormalText}>
                 • 6.1.16 you will not delete or modify any content of the Services, including but not limited to, legal notices, disclaimers or proprietary notices such as copyright or trademark symbols, logos, that you do not own or have express permission to modify
               </Text>

               <Text style={styles.modalLevel1}>7. PAYMENT TERMS</Text>
               
               <Text style={styles.modalNormalText}>
                 You hereby acknowledge and agree that in order to avail our services, you explicitly agree to pay the fees in a manner and mode, as notified to you by us. The said fee is subject to a periodic review and may be revised at our sole discretion and such revisions may be intimated to you as and when required. Please note that your network operator may also separately charge you for data and other usage.
               </Text>

               <Text style={styles.modalLevel1}>8. CANCELLATION AND REFUND POLICY</Text>
               
               <Text style={styles.modalNormalText}>
                 At The Hindu Heritage, we are committed to ensuring the best experience for our customers across Special Puja Services, Professional Puja Services, Chadhava Seva, Astrology Consultations, Donation Services etc. We understand that sometimes unforeseen circumstances arise. Therefore, we offer rescheduling and refund options based on the conditions outlined below. Where possible, we encourage users to reschedule instead of canceling to ensure they don't miss out on the sacred benefits of the services.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 For any concerns or queries regarding refunds or rescheduling, you may contact us at:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Email: surbhi@hinduheritage.in
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Phone: +91-63614 96368
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Please read our Refund Policy carefully to understand the conditions under which refunds are processed.
               </Text>

               <Text style={styles.modalLevel1}>9. CONDITIONS TO USE</Text>
               
               <Text style={styles.modalLevel2}>9.1</Text>
               <Text style={styles.modalNormalText}>
                 The Services will be provided on a best-efforts basis. We will make reasonable efforts and shall endeavor that you are able to use the Services without undue disruption, interruption or delay.
               </Text>

               <Text style={styles.modalLevel2}>9.2</Text>
               <Text style={styles.modalNormalText}>
                 Once you login on the Platform, you may receive updates, promotional materials and other information we may send with regards to the Service, or new services we may offer. You hereby consent to receiving all such commercial communications from us. You may opt out of receiving any, or all, of these commercial communications by writing to us at surbhi@hinduheritage.in.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 By agreeing to these Terms of Use, you also hereby unconditionally consent to us arranging a call with you on your mobile number although such number may be availing the DND service provided by your mobile service provider.
               </Text>

               <Text style={styles.modalLevel2}>9.3</Text>
               <Text style={styles.modalNormalText}>
                 We disclaim any responsibility for any harm resulting from anyone's use of or access to the Services. If you avail our Services, you are responsible for taking precautions as necessary to protect yourself and your device (s) from malware, viruses, spyware, trojan horses, worms or trap doors, and other such harmful or destructive software.
               </Text>

               <Text style={styles.modalLevel2}>9.4</Text>
               <Text style={styles.modalNormalText}>
                 We disclaim any responsibility for any harm resulting from anyone's use of or access to the Services. If you avail our Services, you are responsible for taking precautions as necessary to protect yourself and your device (s) from malware, viruses, spyware, trojan horses, worms or trap doors, and other such harmful or destructive software. You also agree that we shall not be liable to you for any damages that may result from your use and/or misuse of our Platform.
               </Text>

               <Text style={styles.modalLevel1}>10. INTELLECTUAL PROPERTY</Text>
               
               <Text style={styles.modalLevel2}>10.1</Text>
               <Text style={styles.modalNormalText}>
                 You agree and acknowledge that we are and we will remain the owner of the Platform and the Services thereunder at all times. You acknowledge that copyright in works contained on the Platform and the Services, including but not limited to all the features, functionality software, design, text, sound recordings and images, are our exclusive property, or licensed by us, except as otherwise expressly stated. You may access the Platform as a bona fide visitor or only for your use of the Services offered.
               </Text>

               <Text style={styles.modalLevel2}>10.2</Text>
               <Text style={styles.modalNormalText}>
                 All trademarks, service marks, trade names, trade dress, and other forms of intellectual property are proprietary to us. No information, code, algorithms, content or material from the Platform or the Services may be copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way without our express written permission.
               </Text>

               <Text style={styles.modalLevel1}>11. THIRD-PARTY LINKS</Text>
               
               <Text style={styles.modalLevel2}>11.1</Text>
               <Text style={styles.modalNormalText}>
                 The Platform includes links to third-party websites and/or applications. You acknowledge that when you access a third-party link that leaves the Platform:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 11.1.1 the website or application you enter into is not controlled by the Company and different terms of use and privacy policies may apply;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 11.1.2 the inclusion of a link does not imply any endorsement by the Company of the third-party website and/or application, the website's and/or application's provider, or the information on the third-party website and/or application; and
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 11.1.3 if you submit any information or details on any of those websites and/or applications, such information is governed by the terms of use and privacy policies of such third-party websites and/or applications and the Company disclaims all responsibility or liability with respect to these terms of use, policies or the websites and/or applications
               </Text>

               <Text style={styles.modalLevel2}>11.2</Text>
               <Text style={styles.modalNormalText}>
                 You are encouraged to carefully read the terms of use and privacy policy of any third-party website and/or application that you visit. The Company reserves the right to disable third-party links from the Platform, although the Company is under no obligation to do so.
               </Text>

               <Text style={styles.modalLevel1}>12. INDEMNITY AND LIMITATION OF LIABILITY</Text>
               
               <Text style={styles.modalLevel2}>12.1</Text>
               <Text style={styles.modalNormalText}>
                 To the extent permitted by law, you agree to indemnify the Company, its officers, directors and employees from and against any losses, damages, costs, expenses and claims arising out of (i) your use of the Services; (ii) any breach of these Terms of Use or Privacy Policy by you; (iii) any infringement of any intellectual property or other rights of the Company or any third- party or (iv) your breach of any applicable laws.
               </Text>

               <Text style={styles.modalLevel2}>12.2</Text>
               <Text style={styles.modalNormalText}>
                 To the fullest extent permitted by law, in no event will the Company or its affiliates be liable in respect of the Platform and/or the Services for any direct, indirect, special, incidental, punitive, exemplary or consequential damages whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not the Company has been warned of the possibility of such damages. You expressly understand that under no circumstances, including negligence, will the Company be liable to you or any other person or entity for any direct, indirect, incidental, special, remote or consequential damages, including, but not limited to damages for loss of profits, goodwill, use, data or other intangible losses, resulting from circumstances, including with respect to:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 12.2.1 the use or the inability to use the Platform and/or the Services;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 12.2.2 your reliance on the statements or claims made by us in the course of rendering our Services; or
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • 12.2.3 any other matter relating to the Platform and/or Services.
               </Text>

               <Text style={styles.modalLevel2}>12.3</Text>
               <Text style={styles.modalNormalText}>
                 Additionally, by using the Platform or any of the Services, you acknowledge and agree that internet transmissions are never completely private or secure. You understand that any message or information you send using the Platform or any of the Services may be read or intercepted by others, even if there is a special notice that a particular transmission is encrypted.
               </Text>

               <Text style={styles.modalLevel1}>13. TERMINATION</Text>
               
               <Text style={styles.modalLevel2}>13.1</Text>
               <Text style={styles.modalNormalText}>
                 We may terminate your access to all or any part of the Service at any time, with or without cause, with or without notice, effective immediately. Any suspected illegal, fraudulent or abusive activity will also be grounds for terminating your access to the Platform and/or Services.
               </Text>

               <Text style={styles.modalLevel2}>13.2</Text>
               <Text style={styles.modalNormalText}>
                 We reserve the right to, at our sole discretion, (a) cease operating the Platform or any of the Services at any time without notice, and/or (b) terminate these Terms of Use.
               </Text>

               <Text style={styles.modalLevel2}>13.3</Text>
               <Text style={styles.modalNormalText}>
                 All provisions of these Terms of Use which by their nature survive termination shall survive termination, including, without limitation, intellectual property (Clause 10), indemnity and limitation of liability (Clause 12) and disclaimer (Clause 14).
               </Text>

               <Text style={styles.modalLevel1}>14. DISCLAIMER</Text>
               
               <Text style={styles.modalLevel2}>14.1</Text>
               <Text style={styles.modalNormalText}>
                 We hereby expressly state that the Services provided on the Platform are solely in relation to the Sanatana Dharma. You hereby agree and acknowledge that such restriction of Services to the Sanatana Dharma is in no manner discriminatory towards other religions or religious practices and shall not, under any circumstances whatsoever be deemed to be a disrespect of other religions or be deemed as favouring of Sanatana Dharma over other religions or religious practices.
               </Text>

               <Text style={styles.modalLevel2}>14.2</Text>
               <Text style={styles.modalNormalText}>
                 We do not in any manner represent or warrant nor do we undertake any responsibility or liability about the reality or reliability of the astrological effects on human physiology or any other products or services represented and sold on the Platform. No advice or information, whether oral or written, obtained by you through the Platform while availing the Services (including from any third-party service provider) shall create any warranty by the Company. We do not encourage or tolerate any content that promotes actions involving black magic, witchcraft, voodoo or tantrism in any manner. We do not commit to treating or providing solutions for users experiencing weak physical and/or mental health nor do we provide any medical advice. Users are advised to seek appropriate medical advice for any issues relating to physical or mental health.
               </Text>

               <Text style={styles.modalLevel2}>14.3</Text>
               <Text style={styles.modalNormalText}>
                 The advisors/consultants/astrologers are not employees of the Platform or the Company and are third party service providers. You agree and acknowledge that you are connecting with third party service providers at your own risk, and we undertake no responsibility or liability with respect to such third-party service providers. We do not refer, endorse, recommend, verify, evaluate or guarantee any advice, information or other services provided by the third-party service providers or by the Company, nor do we warrant the validity, accuracy, completeness, safety, legality, quality, or applicability of the content, anything said or written by, or any advice provided by such third-party service providers. You further agree that in no event will we be made a party to or have any liability with respect to any dispute between you and any third-party service provider. We may terminate the services of any third-party service provider at any time and without any liability, at our sole discretion.
               </Text>

               <Text style={styles.modalLevel2}>14.4</Text>
               <Text style={styles.modalNormalText}>
                 Save to the extent required by law, we have no special relationship with or fiduciary duty to you. You acknowledge that we have no control over, and no duty to take any action regarding the effects the Services may have on you.
               </Text>

               <Text style={styles.modalLevel2}>14.5</Text>
               <Text style={styles.modalNormalText}>
                 You agree and acknowledge that the Services are provided on an "as is" basis, and that we hereby do not guarantee or warrant to the accuracy, adequacy, correctness, validity, completeness, or suitability for any purpose, of the Services and accept no liability or responsibility with respect to your reliance on the statements or claims made by us in the course of rendering our Services.
               </Text>

               <Text style={styles.modalLevel2}>14.6</Text>
               <Text style={styles.modalNormalText}>
                 The Company makes no representation or warranty that the content on the Platform is appropriate to be used or accessed outside the Republic of India. Any users who use or access the Platform or avail the Services from outside the Republic of India, do so at their own risk and are responsible for compliance with the laws of such jurisdiction.
               </Text>

               <Text style={styles.modalLevel2}>14.7</Text>
               <Text style={styles.modalNormalText}>
                 The Hindu Heritage acts as a service provider, facilitating services on behalf of users. Payments charged are solely for fulfilling these services, including but not limited to offerings, puja, and daan services. Payments made to The Hindu Heritage for such services are not eligible for 80G tax deductions.
               </Text>

               <Text style={styles.modalLevel2}>14.8</Text>
               <Text style={styles.modalNormalText}>
                 The Company provides digital spiritual audio and visual content spanning a range of topics, traditions, and practices, including but not limited to meditation, chanting, discourses, and related materials. While we strive to ensure our content is broadly suitable, the nature of spiritual exploration may encompass diverse perspectives and potentially sensitive themes. In accordance with the spirit of Rule 11(4) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and its Schedule, we advise users to exercise their own discretion and judgment in selecting and consuming the content. By accessing our platform(s), you acknowledge the diverse nature of our content and agree to engage with it responsibly.
               </Text>

               <Text style={styles.modalLevel1}>15. GOVERNING LAW</Text>
               
               <Text style={styles.modalLevel2}>15.1</Text>
               <Text style={styles.modalNormalText}>
                 A printed version of these Terms of Use and of any notice given in electronic form shall be admissible in judicial or administrative proceedings based upon or relating to these Terms of Use to the same extent and subject to the same conditions as other business documents and records originally generated and maintained in printed form.
               </Text>

               <Text style={styles.modalLevel2}>15.2</Text>
               <Text style={styles.modalNormalText}>
                 These Terms of Use shall be governed by and construed in accordance with the laws of India. For all purposes of these Terms of Use, you consent to the exclusive jurisdiction of the courts located in New Delhi, India. Use of the Service is not authorized in any jurisdiction that does not give effect to all provisions of these Terms of Use, including without limitation, this section.
               </Text>

               <Text style={styles.modalLevel1}>16. SEVERABILITY</Text>
               
               <Text style={styles.modalNormalText}>
                 If any provision of these Terms of Use is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms of Use will otherwise remain in full force and effect and enforceable. The failure of either party to exercise, in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder. Waiver of compliance in any particular instance does not mean that we will waive compliance in the future. In order for any waiver of compliance with these Terms of Use to be binding, we must provide you with written notice of such waiver through one of our authorized representatives.
               </Text>

               <Text style={styles.modalLevel1}>17. MODIFICATION OF TERMS OF USE</Text>
               
               <Text style={styles.modalNormalText}>
                 We reserve the right, at our sole discretion, to modify or replace any of these Terms of Use, or change, suspend, or discontinue the Services (including without limitation, the availability of any feature, database, or content) or its usage at any time by posting a notice or by sending you notice through our Service or via email/contact details provided as Login Details. We may also impose limits on certain features and services or restrict your access to parts or all of the Services without notice or liability. It is your responsibility to check these Terms of Use periodically for changes. Your continued use of the Services following the posting of any changes to these Terms of Use shall constitute an acceptance of those changes.
               </Text>

               <Text style={styles.modalLevel1}>18. MISCELLANEOUS</Text>
               
               <Text style={styles.modalLevel2}>18.1</Text>
               <Text style={styles.modalNormalText}>
                 Unless otherwise specified in these Terms of Use, all notices hereunder will be in writing and will be deemed to have been duly given when received or when receipt is electronically confirmed, if transmitted by e-mail.
               </Text>

               <Text style={styles.modalLevel2}>18.2</Text>
               <Text style={styles.modalNormalText}>
                 In respect of these Terms of Use and your use of these Services, nothing in these Terms of Use shall be deemed to grant any rights or benefits to any person, other than us and you, or entitle any third party to enforce any provision hereof, and it is agreed that we do not intend that any provision of these Terms of Use should be enforceable by a third party as per any applicable law.
               </Text>

               <Text style={styles.modalLevel1}>19. CONTACT</Text>
               
               <Text style={styles.modalLevel2}>19.1</Text>
               <Text style={styles.modalNormalText}>
                 In the event that you wish to raise a query or complaint with us, please contact our Grievance Officer (contact details set out below) who shall acknowledge your complaint within 24 (twenty four) hours from the time of receipt of such complaint. Kindly note that once your complaint is received, we shall use our best efforts to redress it within a period of 15 (fifteen) days from the date of receipt of such complaint:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Name: Surbhi Gupta
               </Text>
               <Text style={styles.modalNormalText}>
                 Designation: CEO
               </Text>
               <Text style={styles.modalNormalText}>
                 Contact Number: +91 63614 96368
               </Text>
               <Text style={styles.modalNormalText}>
                 Email ID: surbhi@hinduheritage.in
               </Text>

               <Text style={styles.modalNormalText}>
                 Latest Grievance Report is available here.
               </Text>

               <Text style={styles.modalHeading}>YOU HAVE FULLY READ AND UNDERSTOOD THESE TERMS OF USE AND VOLUNTARILY AGREE TO ALL OF THE PROVISIONS CONTAINED ABOVE</Text>
               
               <Text style={styles.modalNormalText}>
                 Last updated on 17th August 2025
               </Text>
               
               <Text style={styles.modalNormalText}>
                 AUDGUIDE HERITAGE TRAVEL PRIVATE LIMITED
               </Text>
               
               <Text style={styles.modalNormalText}>
                 surbhi@hinduheritage.in
               </Text>
             </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
                         <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
               <Text style={styles.modalHeading}>PRIVACY POLICY</Text>
               
               <Text style={styles.modalNormalText}>
                 The mobile applications on Android and iOS Platforms 'The Hindu Heritage' (together "Platform") are owned and operated by Audguide Heritage Travel Private Limited, a private company incorporated in India under the Companies Act, 2013 and having its registered office at C-127 NDMC SOCIETY, NDMC EMPLOYEES CGHS LTD, Vikas Puri, New Delhi, West Delhi, Delhi, India, 110018.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 This includes any of our affiliates, associates, assignees or successors-in-interest as determined by us at our sole discretion and without requiring any prior notice or intimation to you ("Company", "we" or "us" or "our").
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Platform aims to digitize temples and other religious experiences for its users, provide astrological services and other related services ("Services").
               </Text>
               
               <Text style={styles.modalNormalText}>
                 This Privacy Policy ("Privacy Policy") sets out the privacy practices of the Company with respect to the entire content of the Platform.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 This Privacy Policy is an electronic record as per the Information Technology Act, 2000 (as amended/re-enacted) and rules thereunder ("IT Act") and is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics code) Rules, 2021.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 This mandates the publishing of rules and regulations, privacy policy and terms and conditions for access or usage of any application or website. This electronic record is generated by a computer system and does not require any physical or digital signature.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We request you to go through this Privacy Policy and the Terms of Use (https://www.thehinduheritage.com/terms-of-use/) carefully before you decide to access this Platform and avail the Services.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 For the purposes of this Privacy Policy, the words "us", "we", and "our" refer to the Company and all references to "you", "your" or "user", as applicable means the person who accesses, uses and/or participates in the Platform in any manner or capacity.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The protection and security of your personal information is our top priority and we have taken all necessary and reasonable measures to protect the confidentiality of the user information and its transmission through the internet.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 By using our Services and the Platform or by otherwise giving us your information, you agree to the terms of this Privacy Policy. You also expressly consent to our use and disclosure of your Personal Information (as defined below) in the manner prescribed under this Privacy Policy and further signify your agreement to this Privacy Policy and the Terms of Use.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 If you do not agree to this Privacy Policy, do not subscribe to the Services, use the Platform or give us any of your information in any manner whatsoever.
               </Text>

               <Text style={styles.modalLevel1}>1. COLLECTION OF INFORMATION</Text>

               <Text style={styles.modalLevel2}>1.1</Text>
               <Text style={styles.modalNormalText}>
                 We may collect and process information from you, through your use of the Platform, or which is provided to one of our partners or through any engagement with us.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We may collect and process personal information provided by you, including but not limited to:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • information that you voluntarily provide, including but not limited to any information that identifies or can be used to identify, contact or locate the user such as name, phone number, gender, photograph, date of birth, time of birth and place of birth.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • any data that is automatically captured by the Platform such as your mobile phone operating system, every computer/mobile device connected to the internet is given a domain name and a set of numbers that serve as that computer's Internet Protocol or "IP" address. When you request a page from any page within the Platform, our web servers automatically recognize your domain name and IP address to help us identify your location. The domain name and IP address reveal nothing personal about you other than the IP address from which you have accessed the Platform.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • Contacts List. We access the contacts list on your mobile device. We always ask for your consent before accessing your contacts list and you have the option to deny us the access to your contacts list.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 hereinafter, collectively referred to as "Personal Information".
               </Text>

               <Text style={styles.modalLevel2}>1.2</Text>
               <Text style={styles.modalNormalText}>
                 It is clarified that in the event you make any payments through the Platform, we will not store any payment or card related information which you may provide in the course of making such payments, such as card number, account number, validity date, expiry date or CVV number.
               </Text>

               <Text style={styles.modalLevel1}>2. USE OF INFORMATION COLLECTED</Text>

               <Text style={styles.modalLevel2}>2.1 Use of the Information for Services</Text>
               
               <Text style={styles.modalNormalText}>
                 The primary goal of the Company in collecting the information is to provide you a platform for the purpose of providing the Services.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company may use the Personal Information provided by you in the following ways:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To help provide you the Services;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To observe, improve and administer the quality of Service;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To analyze how the Platform is used, diagnose technical problems;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • Remember the basic information provided by you for effective access;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To confirm your identity in order to determine your eligibility to use the Platform and avail the Services;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To notify you about any changes to the Platform;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To enable the Company to comply with its legal and regulatory obligations;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • For the purpose of sending administrative notices and Service-related alerts and similar communication, as detailed under this Privacy Policy, with a view to optimizing the efficiency of the Platform;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • Doing market research, troubleshooting, protection against error, project planning, fraud and other criminal activity; and
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To enforce the Company's Terms of Use.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • To connect you with other Platform users through various features of the Platform;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 • In accordance with TRAI regulations, we would like to inform you that we may reach out to users registered on the National Do Not Call (DND) registry through calls and SMS for essential communications related to our services.
               </Text>

               <Text style={styles.modalLevel2}>2.2 Sale of Assets, Merger, Acquisition, Bankruptcy</Text>
               
               <Text style={styles.modalNormalText}>
                 Information collected from you may be transferred to a third party as a result of a sale or acquisition, merger or bankruptcy involving the Company.
               </Text>

               <Text style={styles.modalLevel2}>2.3 Cookies</Text>
               
               <Text style={styles.modalNormalText}>
                 Cookies are small portions of information saved by your browser onto your computer/mobile. Cookies are used to record various aspects of your visit and assist the Company to provide you with uninterrupted service.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We may use information collected from our Cookies to identify user behavior and to serve content and offers based on your profile, in order to personalize your experience and in order to enhance the convenience of the users of our Platform.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The user acknowledges and agrees that third party service providers may use Cookies or similar technologies to collect information about the user's pattern of availing the Services, in order to inform, optimize, and provide advertisements based on the user's visits on the Platform and general browsing pattern and report how third-party service providers advertisement impressions, other uses of advertisement services, and interactions with these impressions and services are in relation to the user's visits on such third party's website.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We neither have access to, nor do the Privacy Policy or Terms of Use govern the use of Cookies or other tracking technologies that may be placed by third party service providers on the Platform. These parties may permit the user to opt out of tailored advertisement at any time, however, to the extent advertising technology is integrated into the Services, the user may still receive advertisements and related updates even if they choose to opt-out of tailored advertising.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We assume no responsibility or liability whatsoever for the user's receipt or use of such tailored advertisements.
               </Text>

               <Text style={styles.modalLevel1}>3. SHARING OF INFORMATION</Text>

               <Text style={styles.modalLevel2}>3.1 Sharing</Text>
               
               <Text style={styles.modalNormalText}>
                 Other than as mentioned elsewhere in this Privacy Policy, the Company may share aggregated demographic information with the Company's partners or affiliates. This is not linked to any Personal Information that can identify an individual person.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company will not be liable for transfer of any personal identification information resulting from loss or distribution of data, the delineation or corruption of media storage, power failures, natural phenomena, riots, act(s) of vandalism, sabotage, terrorism or any other event beyond Company's control.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Further, the Company's Privacy Policy does not cover the use of Cookies by its partners and affiliates since the Company does not have access or control over such Cookies.
               </Text>

               <Text style={styles.modalLevel2}>3.2 Consulting</Text>
               
               <Text style={styles.modalNormalText}>
                 The Company may partner with another party to provide certain specific services if required. When you sign-up for such services, the Company may share such information, including without limitation, names, or other Personal Information that is necessary for the third party to provide these Services.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company's contractual arrangements with such third parties restrict these parties from using personally identifiable information except for the explicit purpose of assisting in the provision of these Services.
               </Text>

               <Text style={styles.modalLevel2}>3.3 Targeted Advertising</Text>
               
               <Text style={styles.modalNormalText}>
                 You expressly acknowledge and agree that we may also share or transfer information in relation to your browsing history, cache, internet protocol address and domain name to third-party service providers, for the limited purpose of allowing or permitting such third-party service providers, including Google, and other social media websites to display advertisements and notifications on websites across the Internet, based on the information that is collected by us, to optimize and display advertisements based on your past preferences and visits on the Platform as part of its Services.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company does not allow any unauthorized persons or organization to use any information that the Company may collect from you through this Platform.
               </Text>

               <Text style={styles.modalLevel2}>3.4 Regulatory Disclosures</Text>
               
               <Text style={styles.modalNormalText}>
                 We cooperate with government and law enforcement officials and private parties to enforce and comply with the law. Thus, we may access, use, store, transfer and disclose your information (including Personal Information), including disclosure to third parties such as government or law enforcement officials or private parties as we reasonably determine is necessary and appropriate:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 (i) to satisfy any applicable law, regulation, governmental requests or legal process;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 (ii) to protect the safety, rights, property or security of the Company, our Services, the Platform or any third party;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 (iii) to protect the safety of the public for any reason;
               </Text>
               
               <Text style={styles.modalNormalText}>
                 (iv) to detect, prevent or otherwise address fraud, security or technical issues; and/or
               </Text>
               
               <Text style={styles.modalNormalText}>
                 (v) to prevent or stop any activity we consider to be, or to pose a risk of being, an illegal, unethical, or legally actionable activity.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Such disclosures may be carried out without notice to you.
               </Text>

               <Text style={styles.modalLevel2}>3.5 Referrals</Text>
               
               <Text style={styles.modalNormalText}>
                 When you e-mail/message a service available on the Platform to a friend, you and your friend's names and e-mail addresses/numbers are requested. This ensures that your friend will know that you have requested that the Company send them an e-mail/message.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Your email and your friends' e-mail addresses will only be used for this purpose unless permission is otherwise granted.
               </Text>

               <Text style={styles.modalLevel2}>3.6 Link to Third Party Websites</Text>
               
               <Text style={styles.modalNormalText}>
                 This Platform may contain links which may lead you to other Websites. Please note that once you leave the Company's Platform you will be subjected to the privacy policy of such other websites.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The linked websites are not necessarily under the control of the Company. Please be aware that the Company is not responsible for the privacy practices of such other sites.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company encourages you to read the privacy policies of each and every website that collects Personal Information. If you decide to access any of the third-party sites linked to the Platform, you do this entirely at your own risk.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Any links to any partner of the Company should be the responsibility of the linking party, and the Company will not be responsible for notification of any change in name or location of any information on the Platform.
               </Text>

               <Text style={styles.modalLevel2}>3.7</Text>
               <Text style={styles.modalNormalText}>
                 In the event of an error in the app we collect data and information (through third parties) on your phone called Log Data. This Log Data may include information such as your device internet protocol address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other such related statistics.
               </Text>

               <Text style={styles.modalLevel1}>4. SECURITY OF INFORMATION</Text>

               <Text style={styles.modalLevel2}>4.1</Text>
               <Text style={styles.modalNormalText}>
                 The Company has put in place necessary security practices and procedures to safeguard and secure such Personal Information. The Company only processes Personal Information in a way that is compatible with and relevant for the purpose for which it was collected or authorized by the user.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Platform allows users access to their Personal Information and allows them to correct, amend or delete inaccurate information.
               </Text>

               <Text style={styles.modalLevel2}>4.2</Text>
               <Text style={styles.modalNormalText}>
                 The Company uses commercially reasonable precautions to preserve the integrity and security of your information against loss, theft, unauthorised access, disclosure, reproduction, use or amendment.
               </Text>

               <Text style={styles.modalLevel2}>4.3</Text>
               <Text style={styles.modalNormalText}>
                 The information that is collected from you may be transferred to, stored and processed at any destination within and/or outside India. By submitting information on the Platform, you agree to this transfer, storing and/or processing.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company will take such steps as it considers reasonably necessary to ensure that your information is treated securely and in accordance with this Privacy Policy.
               </Text>

               <Text style={styles.modalLevel2}>4.4</Text>
               <Text style={styles.modalNormalText}>
                 In using the Platform, you accept the inherent security implications of data transmission over the internet. Therefore, the use of the Platform will be at your own risk and the Company assumes no liability for any disclosure of information due to errors in transmission, unauthorised third-party access or other acts of third parties, or acts or omissions beyond its reasonable control and you agree not to hold the Company responsible for any breach of security.
               </Text>

               <Text style={styles.modalLevel2}>4.5</Text>
               <Text style={styles.modalNormalText}>
                 In the event the Company becomes aware of any breach of the security of your information, it will promptly notify you and take appropriate action to the best of its ability to remedy such a breach.
               </Text>

               <Text style={styles.modalLevel1}>5. EXCLUSION</Text>

               <Text style={styles.modalLevel2}>5.1</Text>
               <Text style={styles.modalNormalText}>
                 This Privacy Policy does not apply to any information other than information collected by the Company through the Platform including such information collected in accordance with the clause on "Collection of Information" above.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 This Privacy Policy will not apply to any unsolicited information provided by you through this Platform or through any other means. This includes, but not limited to, information posted on any public areas of the Platform.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 All such unsolicited information shall be deemed to be non-confidential and the Company will be free to use, disclose such unsolicited information without limitation.
               </Text>

               <Text style={styles.modalLevel2}>5.2</Text>
               <Text style={styles.modalNormalText}>
                 The Company also protects your Personal Information off-line other than as specifically mentioned in this Privacy Policy. Access to your Personal Information is limited to employees, agents or partners and third parties, who the Company reasonably believes will need that information to enable the Company to provide Services to you.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 However, the Company is not responsible for the confidentiality, security or distribution of your own Personal Information by our partners and third parties outside the scope of our agreement with such partners and third parties.
               </Text>

               <Text style={styles.modalLevel1}>6. DATA RETENTION</Text>
               
               <Text style={styles.modalNormalText}>
                 The Company shall not retain Personal Information longer than is necessary to fulfil the purposes for which it was collected and as permitted by applicable law.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 If you wish to cancel your account or request that the Company no longer use your information to provide you Services, contact us through email at theheritagetour24@gmail.com.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Even after your account is terminated, the Company may retain your Personal Information as needed to comply with our legal and regulatory obligations, resolve disputes, conclude any activities related to cancellation of an account, investigate or prevent fraud and other inappropriate activity, to enforce our agreements, and for other business reason.
               </Text>

               <Text style={styles.modalLevel1}>7. RIGHT TO WITHDRAW CONSENT</Text>
               
               <Text style={styles.modalNormalText}>
                 The consent that you provide for the collection, use and disclosure of your Personal Information will remain valid until such time it is withdrawn by you in writing.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 If you withdraw your consent, the Company will stop processing the relevant Personal Information except to the extent that the Company has other grounds for processing such Personal Information under applicable laws.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company will respond to your request within a reasonable timeframe. You may withdraw your consent at any time by contacting the Company at theheritagetour24@gmail.com.
               </Text>

               <Text style={styles.modalLevel1}>8. RIGHT TO ACCOUNT DELETION</Text>
               
               <Text style={styles.modalNormalText}>
                 You may request deletion of your account at any time through the Settings {'>'} Privacy menus on the Platform. Following an account deletion request, we will delete your account and Personal Information, unless it is required to be retained due to legal or regulatory requirements.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Please note that we may take time to process deletion requests, and after the account is deleted, we will not use your Personal Information for any processing unless required by us to comply with our legal obligations in accordance with this Policy.
               </Text>

               <Text style={styles.modalLevel1}>9. RIGHT TO CORRECTION</Text>
               
               <Text style={styles.modalNormalText}>
                 You are responsible for maintaining the accuracy of the information you submit to us, such as your contact information provided as part of account registration.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 The Company relies on the users to disclose to it all relevant and accurate information and to inform the Company of any changes.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 If you wish to make a request to correct or update any of your personal data which we hold about you, you may submit your request via email at theheritagetour24@gmail.com.
               </Text>

               <Text style={styles.modalLevel1}>10. NOTIFICATION OF CHANGES</Text>
               
               <Text style={styles.modalNormalText}>
                 From time to time, the Company may update this Privacy Policy to reflect changes to its information practices. Any changes will be effective immediately upon the posting of the revised Privacy Policy.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 If the Company makes any material changes, it will notify you by means of a notice on the Services prior to the change becoming effective.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We encourage you to periodically review this page for the latest information on our privacy practices.
               </Text>

               <Text style={styles.modalLevel1}>11. GRIEVANCE OFFICER</Text>
               
               <Text style={styles.modalNormalText}>
                 In the event that you wish to raise a query or complaint with us, please contact our Grievance Officer (contact details set out below) who shall acknowledge your complaint within 24 (twenty four) hours from the time of receipt of such complaint.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Kindly note that once your complaint is received, we shall use our best efforts to redress it within a period of 15 (fifteen) days from the date of receipt of such complaint:
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Name: Surbhi Gupta
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Designation: CEO
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Contact Number: +91 63614 96368
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Email ID: surbhi@hinduheritage.in
               </Text>

               <Text style={styles.modalLevel1}>12. ADDRESS FOR PRIVACY QUESTIONS</Text>
               
               <Text style={styles.modalNormalText}>
                 Should you have questions about this Privacy Policy or Company's information collection, use and disclosure practices,                  you may contact us at surbhi@hinduheritage.in.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 We will use reasonable efforts to respond promptly to requests, questions or concerns you may have regarding our use of Personal Information about you.
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Except where required by law, the Company cannot ensure a response to questions or comments regarding topics unrelated to this policy or Company's privacy practices.
               </Text>

               <Text style={styles.modalHeading}>YOU HAVE READ THIS PRIVACY POLICY AND AGREE TO ALL OF THE PROVISIONS CONTAINED ABOVE</Text>
               
               <Text style={styles.modalNormalText}>
                 Last updated on 17th August 2025
               </Text>
               
               <Text style={styles.modalNormalText}>
                 Registered Office Address: C-127 NDMC SOCIETY, NDMC EMPLOYEES CGHS LTD, Vikas Puri, New Delhi, West Delhi, Delhi, India, 110018
               </Text>
             </ScrollView>
          </View>
        </View>
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
  ageIndicator: {
    marginBottom: 14,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  ageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  ageWarning: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },
  ageSuccess: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  fieldNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  countryDialCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },

  countryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 4,
    paddingHorizontal: 20,
    minWidth: 300,
    maxWidth: '90%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF9800', marginBottom: 8, marginTop: 2 },
  questionLabel: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 8, marginTop: 16 },
  radioGroup: { flexDirection: 'row', marginBottom: 16 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  radioButton: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#DDD', 
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: { borderColor: '#FF9800' },
  radioButtonInner: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#FF9800' 
  },
  radioText: { fontSize: 16, color: '#222' },
  kidsSection: { marginTop: 16 },
  subsectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12 },
  kidCard: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  kidHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  kidTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  removeKidButton: { 
    backgroundColor: '#ff4444', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  removeKidText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  kidRow: { flexDirection: 'row', marginBottom: 14 },
  addKidButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 8,
  },
     addKidText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  addKidTextButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  addKidTextLink: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
   checkboxRow: { flexDirection: 'row', marginBottom: 14 },
   checkboxOption: { flexDirection: 'row', alignItems: 'center' },
   checkbox: { 
     width: 20, 
     height: 20, 
     borderRadius: 4, 
     borderWidth: 2, 
     borderColor: '#DDD', 
     marginRight: 8,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#fff',
   },
   checkboxSelected: { 
     borderColor: '#FF9800', 
     backgroundColor: '#FF9800' 
   },
   checkboxText: { 
     color: '#fff', 
     fontSize: 12, 
     fontWeight: 'bold' 
   },
   checkboxLabel: { 
     fontSize: 16, 
     color: '#222' 
   },
   dividerContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     marginVertical: 16,
   },
       dividerText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
      marginRight: 12,
    },
       dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#DDD',
    },
         requiredNote: {
       fontSize: 14,
       color: '#666',
       textAlign: 'center',
       marginBottom: 16,
       fontStyle: 'italic',
     },
     dateLabel: {
       fontSize: 14,
       fontWeight: 'bold',
       color: '#666',
       marginBottom: 8,
     },
     // Terms and Privacy Policy styles
     termsContainer: {
       marginBottom: 20,
     },
     termsText: {
       fontSize: 14,
       color: '#333',
       lineHeight: 20,
       flex: 1,
     },
     termsLink: {
       color: '#FF6A00',
       fontWeight: 'bold',
       textDecorationLine: 'underline',
     },
     buttonDisabled: {
       backgroundColor: '#ccc',
       opacity: 0.6,
     },
     // Additional modal styles for Terms & Privacy Policy
     modalContent: {
       backgroundColor: '#fff',
       borderRadius: 20,
       margin: 20,
       maxHeight: '90%',
       width: '90%',
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.25,
       shadowRadius: 8,
       elevation: 5,
     },
     modalHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       padding: 20,
       borderBottomWidth: 1,
       borderBottomColor: '#e0e0e0',
     },
     modalTitle: {
       fontSize: 20,
       fontWeight: 'bold',
       color: '#222',
       flex: 1,
     },
     closeButton: {
       width: 30,
       height: 30,
       borderRadius: 15,
       backgroundColor: '#f0f0f0',
       justifyContent: 'center',
       alignItems: 'center',
     },
     closeButtonText: {
       fontSize: 18,
       color: '#666',
       fontWeight: 'bold',
     },
     modalScrollView: {
       padding: 20,
     },
     modalText: {
       fontSize: 11,
       lineHeight: 18,
       color: '#333',
     },
     // Text level styles for Terms & Privacy Policy
     modalHeading: {
       fontSize: 18,
       fontWeight: 'bold',
       color: '#222',
       marginBottom: 16,
       textAlign: 'center',
     },
     modalLevel1: {
       fontSize: 16,
       fontWeight: 'bold',
       textDecorationLine: 'underline',
       color: '#222',
       marginTop: 16,
       marginBottom: 8,
     },
     modalLevel2: {
       fontSize: 14,
       fontWeight: 'bold',
       textDecorationLine: 'underline',
       color: '#222',
       marginTop: 12,
       marginBottom: 6,
     },
     modalLevel3: {
       fontSize: 12,
       fontWeight: 'bold',
       color: '#222',
       marginTop: 8,
       marginBottom: 4,
     },
     modalNormalText: {
       fontSize: 11,
       color: '#333',
       lineHeight: 16,
       marginBottom: 4,
     },
}); 