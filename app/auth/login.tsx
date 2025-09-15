import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showUserNotExistsModal, setShowUserNotExistsModal] = useState(false);
  const router = useRouter();

  // Translations
  const translations = {
    title: { 
      en: 'Welcome Back', 
      hi: 'वापस स्वागत है',
      bangla: 'আবার স্বাগতম',
      kannada: 'ಮತ್ತೆ ಸ್ವಾಗತ',
      punjabi: 'ਵਾਪਸ ਸਵਾਗਤ',
      tamil: 'மீண்டும் வரவேற்கிறோம்',
      telugu: 'మళ్లీ స్వాగతం'
    },
    subtitle: { 
      en: 'Sign in to your account', 
      hi: 'अपने खाते में साइन इन करें',
      bangla: 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
      kannada: 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      punjabi: 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ',
      tamil: 'உங்கள் கணக்கில் உள்நுழையுங்கள்',
      telugu: 'మీ ఖాతాలోకి సైన్ ఇన్ చేయండి'
    },
    email: { 
      en: 'Email', 
      hi: 'ईमेल',
      bangla: 'ইমেইল',
      kannada: 'ಇಮೇಲ್',
      punjabi: 'ਈਮੇਲ',
      tamil: 'மின்னஞ்சல்',
      telugu: 'ఇమెయిల్'
    },
    emailPlaceholder: { 
      en: 'Enter your email', 
      hi: 'अपना ईमेल दर्ज करें',
      bangla: 'আপনার ইমেইল লিখুন',
      kannada: 'ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
      telugu: 'మీ ఇమెయిల్‌ను నమోదు చేయండి'
    },
    loginButton: { 
      en: 'Sign In', 
      hi: 'साइन इन करें',
      bangla: 'সাইন ইন করুন',
      kannada: 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
      punjabi: 'ਸਾਈਨ ਇਨ ਕਰੋ',
      tamil: 'உள்நுழையுங்கள்',
      telugu: 'సైన్ ఇన్ చేయండి'
    },
    sendOtp: { 
      en: 'Send OTP', 
      hi: 'OTP भेजें',
      bangla: 'OTP পাঠান',
      kannada: 'OTP ಕಳುಹಿಸಿ',
      punjabi: 'OTP ਭੇਜੋ',
      tamil: 'OTP அனுப்பவும்',
      telugu: 'OTP పంపండి'
    },
    sendingOtp: { 
      en: 'Sending OTP...', 
      hi: 'OTP भेजा जा रहा है...',
      bangla: 'OTP পাঠানো হচ্ছে...',
      kannada: 'OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
      punjabi: 'OTP ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
      tamil: 'OTP அனுப்பப்படுகிறது...',
      telugu: 'OTP పంపబడుతోంది...'
    },
    signupText: { 
      en: 'Don\'t have an account? Sign Up', 
      hi: 'खाता नहीं है? साइन अप करें',
      bangla: 'অ্যাকাউন্ট নেই? সাইন আপ করুন',
      kannada: 'ಖಾತೆ ಇಲ್ಲ? ಸೈನ್ ಅಪ್ ಮಾಡಿ',
      punjabi: 'ਖਾਤਾ ਨਹੀਂ ਹੈ? ਸਾਈਨ ਅੱਪ ਕਰੋ',
      tamil: 'கணக்கு இல்லையா? பதிவு செய்யுங்கள்',
      telugu: 'ఖాతా లేదా? సైన్ అప్ చేయండి'
    },
    validation: {
      emailRequired: { 
        en: 'Email is required', 
        hi: 'ईमेल आवश्यक है',
        bangla: 'ইমেইল প্রয়োজন',
        kannada: 'ಇಮೇಲ್ ಅಗತ್ಯವಿದೆ',
        punjabi: 'ਈਮੇਲ ਲੋੜੀਂਦਾ ਹੈ',
        tamil: 'மின்னஞ்சல் தேவை',
        telugu: 'ఇమెయిల్ అవసరం'
      },
      emailInvalid: { 
        en: 'Enter a valid email address', 
        hi: 'एक वैध ईमेल पता दर्ज करें',
        bangla: 'একটি বৈধ ইমেইল ঠিকানা লিখুন',
        kannada: 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ',
        punjabi: 'ਇੱਕ ਵੈਧ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ',
        tamil: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
        telugu: 'చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామాను నమోదు చేయండి'
      },
      otpFailed: { 
        en: 'Failed to send OTP. Please try again.', 
        hi: 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।',
        bangla: 'OTP পাঠাতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
        kannada: 'OTP ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        punjabi: 'OTP ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        tamil: 'OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
        telugu: 'OTP పంపడంలో విఫలమయ్యింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
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
      userNotExists: { 
        en: 'User doesn\'t exist', 
        hi: 'उपयोगकर्ता मौजूद नहीं है',
        bangla: 'ব্যবহারকারী বিদ্যমান নেই',
        kannada: 'ಬಳಕೆದಾರ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ',
        punjabi: 'ਵਰਤੋਂਕਾਰ ਮੌਜੂਦ ਨਹੀਂ ਹੈ',
        tamil: 'பயனர் இல்லை',
        telugu: 'వినియోగదారు లేడు'
      }
    },
    terms: { 
      en: 'Terms and Conditions', 
      hi: 'नियम और शर्तें',
      bangla: 'শর্তাবলী',
      kannada: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
      punjabi: 'ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
      tamil: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      telugu: 'నిబంధనలు మరియు షరతులు'
    },
    privacy: { 
      en: 'Privacy Policy', 
      hi: 'गोपनीयता नीति',
      bangla: 'গোপনীয়তা নীতি',
      kannada: 'ಗೌಪ್ಯತೆ ನೀತಿ',
      punjabi: 'ਗੁਪਤਤਾ ਨੀਤੀ',
      tamil: 'தனியுரிமைக் கொள்கை',
      telugu: 'గోప్యతా విధానం'
    },
    acceptTerms: { 
      en: 'By signing in, you agree to our', 
      hi: 'साइन इन करके, आप हमारी',
      bangla: 'সাইন ইন করে, আপনি আমাদের',
      kannada: 'ಸೈನ್ ಇನ್ ಮಾಡುವ ಮೂಲಕ, ನೀವು ನಮ್ಮ',
      punjabi: 'ਸਾਈਨ ਇਨ ਕਰਕੇ, ਤੁਸੀਂ ਸਾਡੇ',
      tamil: 'உள்நுழைவதன் மூலம், நீங்கள் எங்கள்',
      telugu: 'సైన్ ఇన్ చేయడం ద్వారా, మీరు మా'
    },
    and: { 
      en: 'and', 
      hi: 'और',
      bangla: 'এবং',
      kannada: 'ಮತ್ತು',
      punjabi: 'ਅਤੇ',
      tamil: 'மற்றும்',
      telugu: 'మరియు'
    },
    signUp: { 
      en: 'Sign-Up', 
      hi: 'साइन अप',
      bangla: 'সাইন আপ',
      kannada: 'ಸೈನ್ ಅಪ್',
      punjabi: 'ਸਾਈਨ ਅੱਪ',
      tamil: 'பதிவு செய்',
      telugu: 'సైన్ అప్'
    },
    pleaseSignUp: { 
      en: 'Please sign up to continue', 
      hi: 'कृपया साइन अप करें',
      bangla: 'অনুগ্রহ করে সাইন আপ করুন',
      kannada: 'ದಯವಿಟ್ಟು ಸೈನ್ ಅಪ್ ಮಾಡಿ',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਈਨ ਅੱਪ ਕਰੋ',
      tamil: 'தயவுசெய்து பதிவு செய்யுங்கள்',
      telugu: 'దయచేసి సైన్ అప్ చేయండి'
    },
    ofTheHinduHeritage: { 
      en: 'of The Hindu Heritage', 
      hi: 'हिंदू हेरिटेज का',
      bangla: 'হিন্দু হেরিটেজের',
      kannada: 'ಹಿಂದೂ ಹೆರಿಟೇಜ್ ನ',
      punjabi: 'ਹਿੰਦੂ ਹੈਰੀਟੇਜ ਦਾ',
      tamil: 'ஹிந்து ஹெரிடேஜின்',
      telugu: 'హిందూ హెరిటేజ్ యొక్క'
    }
  };

  const validateEmail = (email: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/.test(email);

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

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError(getTranslation(translations.validation.emailInvalid));
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError(getTranslation(translations.validation.emailInvalid));
      valid = false;
    }
    if (!valid) return;
    setIsLoading(true);
    
    // Test user bypass - don't verify if email exists, just go to OTP screen
    if (email === 'playstoreuser@hinduheritage.in') {
      router.push({ pathname: '/auth/otp', params: { email, from: 'login' } });
      setIsLoading(false);
      return;
    }
    
    try {
      // Use new optimized single API call: check user exists + send OTP
      const response = await axios.post(getEndpointUrl('LOGIN_SEND_OTP'), { email }, {
        headers: getAuthHeaders()
      });
      
      if (!response.data.success || !response.data.userExists) {
        // User doesn't exist, show message and redirect to signup
        setShowUserNotExistsModal(true);
        setTimeout(() => {
          setShowUserNotExistsModal(false);
          router.push('/auth/signup');
        }, 2000);
        return;
      }
      
      // User exists and OTP sent successfully, navigate to OTP screen
      router.push({ pathname: '/auth/otp', params: { email, from: 'login' } });
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 429) {
        // Lockout error
        setEmailError(err.response?.data?.error || getTranslation(translations.validation.tooManyAttempts));
      } else {
        setEmailError(getTranslation(translations.validation.otpFailed));
      }
    } finally {
      setIsLoading(false);
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
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getTranslation(translations.title)}</Text>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder={getTranslation(translations.emailPlaceholder)}
          placeholderTextColor="#888"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
            {isLoading ? getTranslation(translations.sendingOtp) : getTranslation(translations.sendOtp)}
          </Text>
        </TouchableOpacity>
        
        {/* Terms and Privacy Policy Text */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            {getTranslation(translations.acceptTerms)}{' '}
            <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
              {getTranslation(translations.terms)}
            </Text>
            {' '}{getTranslation(translations.and)}{' '}
            <Text style={styles.termsLink} onPress={() => setShowPrivacyModal(true)}>
              {getTranslation(translations.privacy)}
            </Text>
            {' '}{getTranslation(translations.ofTheHinduHeritage)}
          </Text>
        </View>
        
        <Text style={styles.loginText}>
          {getTranslation(translations.signupText)}
          <Text style={styles.loginLink} onPress={() => router.replace('/auth/signup')}>{getTranslation(translations.signUp)}</Text>
        </Text>
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
              <Text style={styles.modalTitle}>{getTranslation(translations.terms)}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalHeading}>TERMS OF USE</Text>
              
              <Text style={styles.modalNormalText}>
                PLEASE READ THESE TERMS OF USE CAREFULLY. BY USING THE PLATFORM, YOU AGREE TO BE BOUND BY ALL OF THE BELOW TERMS AND CONDITIONS AND THE PRIVACY POLICY.
              </Text>

              <Text style={styles.modalLevel1}>1. INTRODUCTION</Text>
              
              <Text style={styles.modalNormalText}>
                The website 'hinduheritage.in', mobile applications on Android and iOS Platforms 'The Hindu Heritage' (together "Platform") are owned and operated by Audguide Heritage Travel Private Limited, a private company incorporated in India under the Companies Act, 2013 and having its registered office at #C-127 NDMC SOCIETY, NDMC EMPLOYEES CGHS LTD, Vikas Puri, New Delhi, West Delhi, Delhi, India, 110018. This includes any of our affiliates, associates, assignees or successors-in-interest as determined by us at our sole discretion and without requiring any prior notice or intimation to you ("Company", "we" or "us" or "our"). Your ("you", "your" or "user") use of the Services (as defined herein) is subject to these terms and conditions ("Terms of Use").
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

              <Text style={styles.modalLevel2}>12.4</Text>
              <Text style={styles.modalLevel3}>DISCLAIMER OF CONTENT ACCURACY</Text>
              
              <Text style={styles.modalNormalText}>
                12.4.1. The Company expressly disclaims any responsibility or liability for the accuracy, completeness, reliability, or authenticity of any information, content, data, or materials provided through the Platform or Services, including but not limited to information relating to:
              </Text>
              
              <Text style={styles.modalNormalText}>
                (a) Astrology, horoscopes, predictions, and astrological interpretations;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (b) Numerology, numerological calculations, and related analyses;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (c) Vastu Shastra principles, guidelines, and recommendations;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (d) Vedic texts, interpretations, translations, and commentaries;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (e) Religious sites, pilgrimage destinations (Dhams), and spiritual journeys (Yatras);
              </Text>
              
              <Text style={styles.modalNormalText}>
                (f) Holy books, scriptures, religious texts, and their interpretations;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (g) Information about Gods, Goddesses, deities, and religious figures;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (h) Temple information, histories, significance, and related details;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (i) Religious observances, fasting practices, festivals, and ceremonial procedures;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (j) Shalokas, mantras, chants, and their translations or meanings;
              </Text>
              
              <Text style={styles.modalNormalText}>
                (k) Hindu calendar dates, auspicious timings, and religious scheduling; and
              </Text>
              
              <Text style={styles.modalNormalText}>
                (l) Any other religious, spiritual, cultural, or traditional content or practices.
              </Text>
              
              <Text style={styles.modalNormalText}>
                12.4.2. All such information is provided for general informational and educational purposes only and should not be relied upon as definitive, authoritative, or professional guidance. Users are strongly advised to consult with qualified religious scholars, spiritual advisors, certified practitioners, or other appropriate professionals before making any decisions or taking any actions based on information obtained through the Platform or Services.
              </Text>
              
              <Text style={styles.modalNormalText}>
                12.4.3. The Company makes no representations or warranties, express or implied, regarding the spiritual efficacy, religious validity, cultural authenticity, or traditional accuracy of any content provided through the Platform or Services.
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
              <Text style={styles.modalTitle}>{getTranslation(translations.privacy)}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
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
                Should you have questions about this Privacy Policy or Company's information collection, use and disclosure practices,                 you may contact us at surbhi@hinduheritage.in.
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

      {/* User Not Exists Modal */}
      <Modal
        visible={showUserNotExistsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowUserNotExistsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.userNotExistsModalContent}>
            <View style={styles.userNotExistsIconContainer}>
              <Text style={styles.userNotExistsIcon}>⚠️</Text>
            </View>
            <Text style={styles.userNotExistsTitle}>
              {getTranslation(translations.validation.userNotExists)}
            </Text>
            <Text style={styles.userNotExistsMessage}>
              {getTranslation(translations.pleaseSignUp)}
            </Text>
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
    color: '#FF6A00',
    marginBottom: 18,
    textAlign: 'center',
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
  // Terms and Privacy Policy styles
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    color: '#FF6A00',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // Modal styles for Terms & Privacy Policy
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 20,
  },
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
    textDecorationLine: 'underline',
    color: '#222',
    marginTop: 12,
    marginBottom: 6,
  },
  modalNormalText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 16,
    marginBottom: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  buttonTextDisabled: {
    color: '#888',
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
  // User Not Exists Modal Styles
  userNotExistsModalContent: {
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
  userNotExistsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  userNotExistsIcon: {
    fontSize: 40,
  },
  userNotExistsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  userNotExistsMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 