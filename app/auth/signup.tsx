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

const genderOptions = ['Male', 'Female', 'Other'];
const rashiOptions = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const kidGenderOptions = ['Male', 'Female', 'Other'];

export const options = { headerShown: false };

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    if (numbersOnly.length < 7) {
      setPhoneError('Enter a valid phone number');
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
    if (!valid) return;
    
         const signupData = {
       firstName: trimmedFirstName,
       lastName: trimmedLastName,
       email,
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
          <View style={styles.phoneRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCode}>+91</Text>
            </View>
                                                   <TextInput
                style={styles.phoneInput}
                placeholder="Enter Your Phone No *"
                placeholderTextColor="#888"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
              />
          </View>
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
           <TouchableOpacity style={styles.input} onPress={() => setShowDateTime(true)}>
             <Text style={styles.dropdownText}>{dob ? dob.toLocaleString() : 'Select Date & Time of Birth'}</Text>
           </TouchableOpacity>
          <DateTimePickerModal
            isVisible={showDateTime}
            mode="date"
            date={dob || new Date()}
            onConfirm={(date) => { setDob(date); setShowDateTime(false); }}
            onCancel={() => setShowDateTime(false)}
          />
          
          {/* Anniversary Date Picker */}
          <DateTimePickerModal
            isVisible={showAnniversaryDate}
            mode="date"
            date={anniversaryDate || new Date()}
            maximumDate={new Date()}
            onConfirm={(date) => { setAnniversaryDate(date); setShowAnniversaryDate(false); }}
            onCancel={() => setShowAnniversaryDate(false)}
          />
          
          {/* Widow Date Picker */}
          <DateTimePickerModal
            isVisible={showWidowDate}
            mode="date"
            date={widowDate || new Date()}
            maximumDate={new Date()}
            onConfirm={(date) => { setWidowDate(date); setShowWidowDate(false); }}
            onCancel={() => setShowWidowDate(false)}
          />
          
          {/* Kid Date of Birth Picker */}
          <DateTimePickerModal
            isVisible={showKidDob !== null}
            mode="date"
            date={showKidDob !== null && kids[showKidDob]?.dateOfBirth ? kids[showKidDob].dateOfBirth : new Date()}
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
             onConfirm={(date) => { setMotherDob(date); setShowMotherDob(false); }}
             onCancel={() => setShowMotherDob(false)}
           />
           
           {/* Mother Death Anniversary Picker */}
           <DateTimePickerModal
             isVisible={showMotherDeathAnniversary}
             mode="date"
             date={motherDeathAnniversary || new Date()}
             maximumDate={new Date()}
             onConfirm={(date) => { setMotherDeathAnniversary(date); setShowMotherDeathAnniversary(false); }}
             onCancel={() => setShowMotherDeathAnniversary(false)}
           />
           
           {/* Father Date of Birth Picker */}
           <DateTimePickerModal
             isVisible={showFatherDob}
             mode="date"
             date={fatherDob || new Date()}
             onConfirm={(date) => { setFatherDob(date); setShowFatherDob(false); }}
             onCancel={() => setShowFatherDob(false)}
           />
           
           {/* Father Death Anniversary Picker */}
           <DateTimePickerModal
             isVisible={showFatherDeathAnniversary}
             mode="date"
             date={fatherDeathAnniversary || new Date()}
             maximumDate={new Date()}
             onConfirm={(date) => { setFatherDeathAnniversary(date); setShowFatherDeathAnniversary(false); }}
             onCancel={() => setShowFatherDeathAnniversary(false)}
           />
           
           {/* Spouse Date of Birth Picker */}
           <DateTimePickerModal
             isVisible={showSpouseDob}
             mode="date"
             date={spouseDob || new Date()}
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
           <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
             <Text style={styles.buttonText}>Create Account</Text>
           </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.replace('/auth/login')}>Login</Text>
          </Text>
        </ScrollView>
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
}); 