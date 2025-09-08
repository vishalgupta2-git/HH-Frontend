import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { awardMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
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
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const kidGenderOptions = ['Male', 'Female', 'Other'];

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
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDateTime, setShowDateTime] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [rashi, setRashi] = useState('');
  const [gotra, setGotra] = useState('');
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

  // UI States
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMudraModal, setShowMudraModal] = useState(false);
  const [mudrasEarned, setMudrasEarned] = useState(0);
  const router = useRouter();

  const translations = {
    title: { en: 'Profile', hi: 'प्रोफाइल' },
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
    contactInformation: { en: 'Contact Information', hi: 'संपर्क जानकारी' },
    aboutYourself: { en: 'About Yourself', hi: 'अपने बारे में' },
    yourFamily: { en: 'Your Family', hi: 'आपका परिवार' },
    parents: { en: 'Parents', hi: 'माता-पिता' },
    spouseAndKids: { en: 'Spouse and Kids', hi: 'पति/पत्नी और बच्चे' },
    mothersInformation: { en: 'Mother\'s Information', hi: 'माता की जानकारी' },
    fathersInformation: { en: 'Father\'s Information', hi: 'पिता की जानकारी' },
    spousesInformation: { en: 'Spouse\'s Information', hi: 'पति/पत्नी की जानकारी' },
    kidsInformation: { en: 'Kids Information', hi: 'बच्चों की जानकारी' },
    maritalStatus: { en: 'Marital Status', hi: 'वैवाहिक स्थिति' },
    doYouHaveKids: { en: 'Do you have kids?', hi: 'क्या आपके बच्चे हैं?' },
    saveProfile: { en: 'Save Profile', hi: 'प्रोफाइल सहेजें' },
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
      mothersName: { en: 'Mother\'s Name', hi: 'माता का नाम' },
      fathersName: { en: 'Father\'s Name', hi: 'पिता का नाम' },
      spousesName: { en: 'Spouse\'s Name', hi: 'पति/पत्नी का नाम' },
      kidFirstName: { en: 'First Name', hi: 'पहला नाम' },
      kidLastName: { en: 'Last Name', hi: 'अंतिम नाम' },
      kidGender: { en: 'Gender', hi: 'लिंग' },
      kidDateOfBirth: { en: 'Date of Birth', hi: 'जन्म तिथि' }
    },
    options: {
      male: { en: 'Male', hi: 'पुरुष' },
      female: { en: 'Female', hi: 'महिला' },
      other: { en: 'Other', hi: 'अन्य' },
      single: { en: 'Single', hi: 'अविवाहित' },
      married: { en: 'Married', hi: 'विवाहित' },
      divorced: { en: 'Divorced', hi: 'तलाकशुदा' },
      widowed: { en: 'Widowed', hi: 'विधवा/विधुर' },
      yes: { en: 'Yes', hi: 'हाँ' },
      no: { en: 'No', hi: 'नहीं' }
    },
    labels: {
      deceased: { en: 'Deceased', hi: 'स्वर्गवासी' },
      dateOfBirth: { en: 'Date of Birth', hi: 'जन्म तिथि' },
      deathAnniversary: { en: 'Death Anniversary', hi: 'पुण्यतिथि' },
      anniversaryDate: { en: 'Select Anniversary Date', hi: 'विवाह वर्षगांठ की तारीख चुनें' },
      widowDate: { en: 'Select Widow Date', hi: 'विधवा/विधुर की तारीख चुनें' },
      spousesDateOfBirth: { en: 'Spouse\'s Date of Birth', hi: 'पति/पत्नी की जन्म तिथि' },
      selectDateOfBirth: { en: 'Select Date of Birth', hi: 'जन्म तिथि चुनें' },
      selectDeathAnniversary: { en: 'Select Death Anniversary', hi: 'पुण्यतिथि चुनें' },
      spouseAndKids: { en: 'Spouse and Kids', hi: 'पति/पत्नी और बच्चे' },
      maritalStatus: { en: 'Marital Status', hi: 'वैवाहिक स्थिति' },
      doYouHaveKids: { en: 'Do you have kids?', hi: 'क्या आपके बच्चे हैं?' },
      yes: { en: 'Yes', hi: 'हाँ' },
      no: { en: 'No', hi: 'नहीं' }
    },
    kids: {
      kid: { en: 'Kid', hi: 'बच्चा' },
      addAnotherKid: { en: '+ Add Another Kid', hi: '+ एक और बच्चा जोड़ें' },
      remove: { en: 'Remove', hi: 'हटाएं' }
    },
    validation: {
      firstNameMinLength: { en: 'First name must be at least 2 characters', hi: 'पहला नाम कम से कम 2 अक्षर का होना चाहिए' },
      validPhoneNumber: { en: 'Enter a valid phone number', hi: 'एक वैध फोन नंबर दर्ज करें' },
      profileUpdateSuccess: { en: 'Profile updated successfully!', hi: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!' },
      profileUpdateError: { en: 'Failed to update profile:', hi: 'प्रोफाइल अपडेट करने में विफल:' }
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
          setGender(user.gender || '');
          setPlaceOfBirth(user.placeOfBirth || '');
          setRashi(user.rashi || '');
          setGotra(user.gotra || '');
          setMaritalStatus(user.maritalStatus || '');
          
          // Handle date of birth
          const dobValue = user.dob || user.dateOfBirth;
          if (dobValue) {
            const dobDate = new Date(dobValue);
            setDob(dobDate);
          }
          
          // Handle anniversary date
          if (user.anniversaryDate) {
            setAnniversaryDate(new Date(user.anniversaryDate));
          }
          
          // Handle kids
          if (user.kids && Array.isArray(user.kids)) {
            setHasKids(true);
            setKids(user.kids.map((kid: any) => ({
              firstName: kid.firstName || '',
              lastName: kid.lastName || '',
              gender: kid.gender || '',
              dateOfBirth: kid.dateOfBirth ? new Date(kid.dateOfBirth) : null,
            })));
          } else {
            setHasKids(false);
            setKids([]);
          }
          
          // Handle parents
          if (user.parents) {
            // Mother
            if (user.parents.mother) {
              setMotherName(user.parents.mother.name || '');
              if (user.parents.mother.dateOfBirth) {
                setMotherDob(new Date(user.parents.mother.dateOfBirth));
              }
              setMotherDeceased(user.parents.mother.deceased || false);
              if (user.parents.mother.deathAnniversary) {
                setMotherDeathAnniversary(new Date(user.parents.mother.deathAnniversary));
              }
            }
            
            // Father
            if (user.parents.father) {
              setFatherName(user.parents.father.name || '');
              if (user.parents.father.dateOfBirth) {
                setFatherDob(new Date(user.parents.father.dateOfBirth));
              }
              setFatherDeceased(user.parents.father.deceased || false);
              if (user.parents.father.deathAnniversary) {
                setFatherDeathAnniversary(new Date(user.parents.father.deathAnniversary));
              }
            }
            
            // Spouse
            if (user.parents.spouse) {
              setSpouseName(user.parents.spouse.name || '');
              if (user.parents.spouse.dateOfBirth) {
                setSpouseDob(new Date(user.parents.spouse.dateOfBirth));
              }
            }
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
      
      const response = await axios.post(getEndpointUrl('UPDATE_COMPLETE_PROFILE'), profileData, {
        headers: getAuthHeaders()
      });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        ...profileData,
        name: `${trimmedFirstName} ${lastName || ''}`.trim()
      }));
      
      // Award mudras for profile completion
      try {
        const mudraResult = await awardMudras('COMPLETE_PROFILE_PHONE');
        if (mudraResult.success) {
          setMudrasEarned(mudraResult.mudrasEarned || 0);
          setShowMudraModal(true);
          // Auto-dismiss modal after 3 seconds
          setTimeout(() => {
            setShowMudraModal(false);
          }, 3000);
        } else {
          Alert.alert('Success', 'Profile updated successfully!');
        }
      } catch (mudraError) {
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      Alert.alert('Error', `Failed to update profile: ${err.response?.data?.error || err.message}`);
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
          
          <Text style={styles.sectionLabel}>{isHindi ? translations.aboutYourself.hi : translations.aboutYourself.en}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            <TouchableOpacity
              style={[styles.dropdown, { flex: 1 }]}
              onPress={() => setGenderDropdownOpen(true)}
            >
              <Text style={styles.dropdownText}>{gender || (isHindi ? translations.fields.gender.hi : translations.fields.gender.en)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdown, { flex: 1 }]}
              onPress={() => setRashiDropdownOpen(true)}
            >
              <Text style={styles.dropdownText}>{rashi || (isHindi ? translations.fields.rashi.hi : translations.fields.rashi.en)}</Text>
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
                      <Text style={styles.dropdownText}>
                        {option === 'Male' ? (isHindi ? translations.options.male.hi : translations.options.male.en) :
                         option === 'Female' ? (isHindi ? translations.options.female.hi : translations.options.female.en) :
                         option === 'Other' ? (isHindi ? translations.options.other.hi : translations.options.other.en) : option}
                      </Text>
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
                      if (option !== 'Married') setAnniversaryDate(null);
                      if (option !== 'Widowed') setWidowDate(null);
                    }}>
                      <Text style={styles.dropdownText}>
                        {option === 'Single' ? (isHindi ? translations.options.single.hi : translations.options.single.en) :
                         option === 'Married' ? (isHindi ? translations.options.married.hi : translations.options.married.en) :
                         option === 'Divorced' ? (isHindi ? translations.options.divorced.hi : translations.options.divorced.en) :
                         option === 'Widowed' ? (isHindi ? translations.options.widowed.hi : translations.options.widowed.en) : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          
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
                      <Text style={styles.dropdownText}>
                        {option === 'Male' ? (isHindi ? translations.options.male.hi : translations.options.male.en) :
                         option === 'Female' ? (isHindi ? translations.options.female.hi : translations.options.female.en) :
                         option === 'Other' ? (isHindi ? translations.options.other.hi : translations.options.other.en) : option}
                      </Text>
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
              placeholder={isHindi ? translations.fields.placeOfBirth.hi : translations.fields.placeOfBirth.en}
              placeholderTextColor="#888"
              value={placeOfBirth}
              onChangeText={setPlaceOfBirth}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={isHindi ? translations.fields.gotra.hi : translations.fields.gotra.en}
              placeholderTextColor="#888"
              value={gotra}
              onChangeText={setGotra}
            />
          </View>
          
          <Text style={styles.sectionLabel}>{isHindi ? translations.yourFamily.hi : translations.yourFamily.en}</Text>
          
          {/* Parents Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>{isHindi ? translations.parents.hi : translations.parents.en}</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Mother Information */}
          <Text style={styles.subsectionLabel}>{isHindi ? translations.mothersInformation.hi : translations.mothersInformation.en}</Text>
          <TextInput
            style={styles.input}
            placeholder={isHindi ? translations.fields.mothersName.hi : translations.fields.mothersName.en}
            placeholderTextColor="#888"
            value={motherName}
            onChangeText={setMotherName}
          />
          
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={styles.checkboxOption} 
              onPress={() => {
                setMotherDeceased(!motherDeceased);
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
              <Text style={styles.checkboxLabel}>{isHindi ? translations.labels.deceased.hi : translations.labels.deceased.en}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.dateLabel}>
            {motherDeceased ? (isHindi ? translations.labels.deathAnniversary.hi : translations.labels.deathAnniversary.en) : (isHindi ? translations.labels.dateOfBirth.hi : translations.labels.dateOfBirth.en)}
          </Text>
          {!motherDeceased ? (
            <TouchableOpacity style={styles.input} onPress={() => setShowMotherDob(true)}>
              <Text style={styles.dropdownText}>
                {motherDob ? motherDob.toLocaleDateString() : (isHindi ? translations.labels.selectDateOfBirth.hi : translations.labels.selectDateOfBirth.en)}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.input} onPress={() => setShowMotherDeathAnniversary(true)}>
              <Text style={styles.dropdownText}>
                {motherDeathAnniversary ? motherDeathAnniversary.toLocaleDateString() : (isHindi ? translations.labels.selectDeathAnniversary.hi : translations.labels.selectDeathAnniversary.en)}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Father Information */}
          <Text style={styles.subsectionLabel}>{isHindi ? translations.fathersInformation.hi : translations.fathersInformation.en}</Text>
          <TextInput
            style={styles.input}
            placeholder={isHindi ? translations.fields.fathersName.hi : translations.fields.fathersName.en}
            placeholderTextColor="#888"
            value={fatherName}
            onChangeText={setFatherName}
          />
          
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={styles.checkboxOption} 
              onPress={() => {
                setFatherDeceased(!fatherDeceased);
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
              <Text style={styles.checkboxLabel}>{isHindi ? translations.labels.deceased.hi : translations.labels.deceased.en}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.dateLabel}>
            {fatherDeceased ? (isHindi ? translations.labels.deathAnniversary.hi : translations.labels.deathAnniversary.en) : (isHindi ? translations.labels.dateOfBirth.hi : translations.labels.dateOfBirth.en)}
          </Text>
          {!fatherDeceased ? (
            <TouchableOpacity style={styles.input} onPress={() => setShowFatherDob(true)}>
              <Text style={styles.dropdownText}>
                {fatherDob ? fatherDob.toLocaleDateString() : (isHindi ? translations.labels.selectDateOfBirth.hi : translations.labels.selectDateOfBirth.en)}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.input} onPress={() => setShowFatherDeathAnniversary(true)}>
              <Text style={styles.dropdownText}>
                {fatherDeathAnniversary ? fatherDeathAnniversary.toLocaleDateString() : (isHindi ? translations.labels.selectDeathAnniversary.hi : translations.labels.selectDeathAnniversary.en)}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Spouse and Kids Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>{isHindi ? translations.labels.spouseAndKids.hi : translations.labels.spouseAndKids.en}</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Marital Status */}
          <Text style={styles.subsectionLabel}>{isHindi ? translations.maritalStatus.hi : translations.maritalStatus.en}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setMaritalStatusDropdownOpen(true)}
          >
            <Text style={styles.dropdownText}>{maritalStatus || (isHindi ? translations.labels.maritalStatus.hi : translations.labels.maritalStatus.en)}</Text>
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
              <Text style={styles.subsectionLabel}>{isHindi ? translations.spousesInformation.hi : translations.spousesInformation.en}</Text>
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
          <Text style={styles.questionLabel}>{isHindi ? translations.labels.doYouHaveKids.hi : translations.labels.doYouHaveKids.en}</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setHasKids(true)}
            >
              <View style={[styles.radioButton, hasKids === true && styles.radioButtonSelected]}>
                {hasKids === true && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.radioText}>{isHindi ? translations.labels.yes.hi : translations.labels.yes.en}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setHasKids(false)}
            >
              <View style={[styles.radioButton, hasKids === false && styles.radioButtonSelected]}>
                {hasKids === false && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.radioText}>{isHindi ? translations.labels.no.hi : translations.labels.no.en}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Kids Information - Only show if hasKids is true */}
          {hasKids === true && (
            <View style={styles.kidsSection}>
              <Text style={styles.subsectionLabel}>{isHindi ? translations.kidsInformation.hi : translations.kidsInformation.en}</Text>
              {kids.map((kid, index) => (
                <View key={index} style={styles.kidCard}>
                  <View style={styles.kidHeader}>
                    <Text style={styles.kidTitle}>{isHindi ? translations.kids.kid.hi : translations.kids.kid.en} {index + 1}</Text>
                    {kids.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeKidButton}
                        onPress={() => removeKid(index)}
                      >
                        <Text style={styles.removeKidText}>{isHindi ? translations.kids.remove.hi : translations.kids.remove.en}</Text>
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
                <Text style={styles.addKidTextLink}>{isHindi ? translations.kids.addAnotherKid.hi : translations.kids.addAnotherKid.en}</Text>
              </TouchableOpacity>
            </View>
          )}
          
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
              <Text style={styles.mudraTitle}>Congratulations!</Text>
              <Text style={styles.mudraMessage}>
                Profile updated successfully! You earned {mudrasEarned} mudras!
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
  kidsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  kidCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kidTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  removeKidButton: {
    padding: 5,
  },
  removeKidText: {
    color: '#FF6A00',
    fontSize: 14,
  },
  addKidButton: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addKidText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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