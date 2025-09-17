import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Linking, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReferralConnectBlock() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  
  // Translations
  const translations = {
    title: {
      en: 'Refer friends & family',
      hi: 'दोस्तों और परिवार को रेफर करें',
      bangla: 'বন্ধু ও পরিবার কে আমাদের ব্যাপারে উল্লেখ করুন',
      kannada: 'ಸ್ನೇಹಿತರು ಮತ್ತು ಕುಟುಂಬವನ್ನು ರೆಫರ್ ಮಾಡಿ',
      punjabi: 'ਦੋਸਤਾਂ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ਰੈਫਰ ਕਰੋ',
      tamil: 'நண்பர்கள் மற்றும் குடும்பத்தை பரிந்துரைக்கவும்',
      telugu: 'స్నేహితులు మరియు కుటుంబాన్ని రిఫర్ చేయండి'
    },
    subtitle: {
      en: 'Sign-Up or login to help your friends and family on their spiritual journey.',
      hi: 'अपने दोस्तों और परिवार को उनकी आध्यात्मिक यात्रा में मदद करने के लिए साइन-अप या लॉगिन करें।',
      bangla: 'আপনার বন্ধু ও পরিবারকে তাদের আধ্যাত্মিক যাত্রায় সাহায্য করতে সাইন-আপ বা লগইন করুন।',
      kannada: 'ನಿಮ್ಮ ಸ್ನೇಹಿತರು ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ಅವರ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣದಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಸೈನ್-ಅಪ್ ಅಥವಾ ಲಾಗಿನ್ ಮಾಡಿ।',
      punjabi: 'ਆਪਣੇ ਦੋਸਤਾਂ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ਉਨ੍ਹਾਂ ਦੀ ਆਧਿਆਤਮਿਕ ਯਾਤਰਾ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਸਾਈਨ-ਅੱਪ ਜਾਂ ਲੌਗਿਨ ਕਰੋ।',
      tamil: 'உங்கள் நண்பர்கள் மற்றும் குடும்பத்திற்கு அவர்களின் ஆன்மீக பயணத்தில் உதவ சைன்-அப் அல்லது லாகின் செய்யுங்கள்।',
      telugu: 'మీ స్నేహితులు మరియు కుటుంబానికి వారి ఆధ్యాత్మిక ప్రయాణంలో సహాయపడటానికి సైన్-అప్ లేదా లాగిన్ చేయండి।'
    },
    subtitleLoggedIn: {
      en: 'Invite your friends and family to begin their spiritual journey. When they join, both of you will earn 1000 Mudras!',
      hi: 'अपने दोस्तों और परिवार को उनकी आध्यात्मिक यात्रा शुरू करने के लिए आमंत्रित करें। जब वे जुड़ेंगे, तो आप दोनों 1000 मुद्रा कमाएंगे!',
      bangla: 'আপনার বন্ধু ও পরিবারকে তাদের আধ্যাত্বিক যাত্রা তে আসার জন্য উৎসাহিত করুন এবং প্রত্যেক সফল আমন্ত্রণে আপনি অর্জন করতে পারবেন ১০০০ মুদ্রা।',
      kannada: 'ನಿಮ್ಮ ಸ್ನೇಹಿತರು ಮತ್ತು ಕುಟುಂಬವನ್ನು ಅವರ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಆಮಂತ್ರಿಸಿ. ಅವರು ಸೇರಿದಾಗ, ನೀವು ಇಬ್ಬರೂ 1000 ಮುದ್ರೆಗಳನ್ನು ಗಳಿಸುತ್ತೀರಿ!',
      punjabi: 'ਆਪਣੇ ਦੋਸਤਾਂ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ਉਨ੍ਹਾਂ ਦੀ ਆਧਿਆਤਮਿਕ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸੱਦਾ ਦਿਓ. ਜਦੋਂ ਉਹ ਸ਼ਾਮਲ ਹੋਣਗੇ, ਤਾਂ ਤੁਸੀਂ ਦੋਵੇਂ 1000 ਮੁਦਰਾ ਕਮਾਓਗੇ!',
      tamil: 'உங்கள் நண்பர்கள் மற்றும் குடும்பத்தை அவர்களின் ஆன்மீக பயணத்தைத் தொடங்க அழைக்கவும். அவர்கள் சேர்ந்தால், நீங்கள் இருவரும் 1000 முத்திரைகளைப் பெறுவீர்கள்!',
      telugu: 'మీ స్నేహితులు మరియు కుటుంబాన్ని వారి ఆధ్యాత్మిక ప్రయాణాన్ని ప్రారంభించడానికి ఆమంత్రించండి. వారు చేరినప్పుడు, మీరు ఇద్దరూ 1000 ముద్రలను సంపాదిస్తారు!'
    },
    login: {
      en: 'Login',
      hi: 'लॉग इन',
      bangla: 'লগইন',
      kannada: 'ಲಾಗಿನ್',
      punjabi: 'ਲੌਗਿਨ',
      tamil: 'உள்நுழைய',
      telugu: 'లాగిన్'
    },
    signup: {
      en: 'Sign Up',
      hi: 'साइन अप',
      bangla: 'সাইন আপ',
      kannada: 'ಸೈನ್ ಅಪ್',
      punjabi: 'ਸਾਈਨ ਅੱਪ',
      tamil: 'பதிவு செய்',
      telugu: 'సైన్ అప్'
    },
    referralCode: {
      en: 'Referral Code: ',
      hi: 'रेफरल कोड: ',
      bangla: 'রেফারেল কোড: ',
      kannada: 'ರೆಫರಲ್ ಕೋಡ್: ',
      punjabi: 'ਰੈਫਰਲ ਕੋਡ: ',
      tamil: 'பரிந்துரை குறியீடு: ',
      telugu: 'రిఫరల్ కోడ్: '
    },
    inviteEarn: {
      en: 'Invite and Earn 1000 Mudras',
      hi: 'आमंत्रित करें और 1000 मुद्रा कमाएं',
      bangla: 'আমন্ত্রণ করুন এবং ১০০০ মুদ্রা অর্জন করুন',
      kannada: 'ಆಮಂತ್ರಿಸಿ ಮತ್ತು 1000 ಮುದ್ರೆಗಳನ್ನು ಗಳಿಸಿ',
      punjabi: 'ਸੱਦਾ ਦਿਓ ਅਤੇ 1000 ਮੁਦਰਾ ਕਮਾਓ',
      tamil: 'அழைத்து 1000 முத்திரைகளைப் பெறுங்கள்',
      telugu: 'ఆమంత్రించి 1000 ముద్రలను సంపాదించండి'
    },
    codeCopied: {
      en: 'Referral code copied!',
      hi: 'रेफरल कोड कॉपी किया गया!',
      bangla: 'রেফারেল কোড কপি করা হয়েছে!',
      kannada: 'ರೆಫರಲ್ ಕೋಡ್ ನಕಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਰੈਫਰਲ ਕੋਡ ਕਾਪੀ ਕੀਤਾ ਗਿਆ!',
      tamil: 'பரிந்துரை குறியீடு நகலெடுக்கப்பட்டது!',
      telugu: 'రిఫరల్ కోడ్ కాపీ చేయబడింది!'
    },
    referEarn: {
      en: 'Refer and Earn Mudras',
      hi: 'रेफर करें और मुद्रा कमाएं',
      bangla: 'রেফার করুন এবং মুদ্রা অর্জন করুন',
      kannada: 'ರೆಫರ್ ಮಾಡಿ ಮತ್ತು ಮುದ್ರೆಗಳನ್ನು ಗಳಿಸಿ',
      punjabi: 'ਰੈਫਰ ਕਰੋ ਅਤੇ ਮੁਦਰਾ ਕਮਾਓ',
      tamil: 'பரிந்துரைத்து முத்திரைகளைப் பெறுங்கள்',
      telugu: 'రిఫర్ చేసి ముద్రలను సంపాదించండి'
    },
    referDescription: {
      en: 'When you refer someone, you not only help them progress on their spiritual journey, both you and them earn Mudras',
      hi: 'जब आप किसी को रेफर करते हैं, तो आप न केवल उन्हें उनकी आध्यात्मिक यात्रा में प्रगति करने में मदद करते हैं, बल्कि आप दोनों मुद्रा कमाते हैं',
      bangla: 'আপনি যখন কাউকে রেফার করেন, তখন আপনি কেবল তাদের আধ্যাত্মিক যাত্রায় অগ্রগতিতে সাহায্য করেন না, বরং আপনারা দুজনেই মুদ্রা অর্জন করেন',
      kannada: 'ನೀವು ಯಾರನ್ನಾದರೂ ರೆಫರ್ ಮಾಡಿದಾಗ, ನೀವು ಅವರನ್ನು ಅವರ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣದಲ್ಲಿ ಮುಂದುವರಿಯಲು ಸಹಾಯ ಮಾಡುವುದಲ್ಲದೆ, ನೀವು ಮತ್ತು ಅವರು ಇಬ್ಬರೂ ಮುದ್ರೆಗಳನ್ನು ಗಳಿಸುತ್ತೀರಿ',
      punjabi: 'ਜਦੋਂ ਤੁਸੀਂ ਕਿਸੇ ਨੂੰ ਰੈਫਰ ਕਰਦੇ ਹੋ, ਤਾਂ ਤੁਸੀਂ ਨਾ ਸਿਰਫ ਉਨ੍ਹਾਂ ਨੂੰ ਉਨ੍ਹਾਂ ਦੀ ਆਧਿਆਤਮਿਕ ਯਾਤਰਾ ਵਿੱਚ ਤਰੱਕੀ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹੋ, ਬਲਕਿ ਤੁਸੀਂ ਦੋਵੇਂ ਮੁਦਰਾ ਕਮਾਉਂਦੇ ਹੋ',
      tamil: 'நீங்கள் யாரையாவது பரிந்துரைக்கும்போது, நீங்கள் அவர்களின் ஆன்மீக பயணத்தில் முன்னேறுவதற்கு உதவுவது மட்டுமல்லாமல், நீங்கள் இருவரும் முத்திரைகளைப் பெறுகிறீர்கள்',
      telugu: 'మీరు ఎవరినైనా రిఫర్ చేసినప్పుడు, మీరు వారి ఆధ్యాత్మిక ప్రయాణంలో ముందుకు సాగడానికి సహాయపడటమే కాకుండా, మీరు మరియు వారు ఇద్దరూ ముద్రలను సంపాదిస్తారు'
    },
    copyInstructions: {
      en: 'Please copy the Referral code and share with the person you want to refer.',
      hi: 'कृपया रेफरल कोड कॉपी करें और जिस व्यक्ति को आप रेफर करना चाहते हैं उसके साथ साझा करें।',
      bangla: 'অনুগ্রহ করে রেফারেল কোড কপি করুন এবং যাকে আপনি রেফার করতে চান তার সাথে শেয়ার করুন।',
      kannada: 'ದಯವಿಟ್ಟು ರೆಫರಲ್ ಕೋಡ್ ಅನ್ನು ನಕಲಿಸಿ ಮತ್ತು ನೀವು ರೆಫರ್ ಮಾಡಲು ಬಯಸುವ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਰੈਫਰਲ ਕੋਡ ਕਾਪੀ ਕਰੋ ਅਤੇ ਜਿਸ ਵਿਅਕਤੀ ਨੂੰ ਤੁਸੀਂ ਰੈਫਰ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ ਉਸ ਨਾਲ ਸਾਂਝਾ ਕਰੋ।',
      tamil: 'தயவுசெய்து பரிந்துரை குறியீட்டை நகலெடுத்து, நீங்கள் பரிந்துரைக்க விரும்பும் நபருடன் பகிர்ந்து கொள்ளுங்கள்।',
      telugu: 'దయచేసి రిఫరల్ కోడ్‌ను కాపీ చేసి, మీరు రిఫర్ చేయాలనుకునే వ్యక్తితో పంచుకోండి।'
    },
    downloadInstructions: {
      en: 'Request them to download the app and use the referral code during Sign Up',
      hi: 'उनसे अनुरोध करें कि वे ऐप डाउनलोड करें और साइन अप के दौरान रेफरल कोड का उपयोग करें',
      bangla: 'তাদের অ্যাপ ডাউনলোড করতে এবং সাইন আপের সময় রেফারেল কোড ব্যবহার করতে অনুরোধ করুন',
      kannada: 'ಅವರನ್ನು ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಮತ್ತು ಸೈನ್ ಅಪ್ ಸಮಯದಲ್ಲಿ ರೆಫರಲ್ ಕೋಡ್ ಬಳಸಲು ವಿನಂತಿಸಿ',
      punjabi: 'ਉਨ੍ਹਾਂ ਨੂੰ ਐਪ ਡਾਉਨਲੋਡ ਕਰਨ ਅਤੇ ਸਾਈਨ ਅੱਪ ਦੌਰਾਨ ਰੈਫਰਲ ਕੋਡ ਵਰਤਣ ਲਈ ਕਹੋ',
      tamil: 'அவர்களை ஆப்‌பை டவுன்லோட் செய்யவும், பதிவு செய்யும்போது பரிந்துரை குறியீட்டைப் பயன்படுத்துமாறு கேளுங்கள்',
      telugu: 'వారిని అప్‌లోడ్ చేయమని మరియు సైన్ అప్ సమయంలో రిఫరల్ కోడ్‌ను ఉపయోగించమని అడగండి'
    },
    bonusNote: {
      en: 'Please note that the bonus Mudras will be awarded within 3 days of Sign Up',
      hi: 'कृपया ध्यान दें कि बोनस मुद्रा साइन अप के 3 दिनों के भीतर प्रदान की जाएंगी',
      bangla: 'দয়া করে মনে রাখবেন যে বোনাস মুদ্রা সাইন আপের ৩ দিনের মধ্যে প্রদান করা হবে',
      kannada: 'ದಯವಿಟ್ಟು ಗಮನಿಸಿ, ಬೋನಸ್ ಮುದ್ರೆಗಳನ್ನು ಸೈನ್ ಅಪ್‌ನ 3 ದಿನಗಳೊಳಗೆ ನೀಡಲಾಗುತ್ತದೆ',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਦਿਓ ਕਿ ਬੋਨਸ ਮੁਦਰਾ ਸਾਈਨ ਅੱਪ ਦੇ 3 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਦਿੱਤੀ ਜਾਵੇਗੀ',
      tamil: 'தயவுசெய்து கவனிக்கவும், போனஸ் முத்திரைகள் பதிவு செய்த 3 நாட்களுக்குள் வழங்கப்படும்',
      telugu: 'దయచేసి గమనించండి, బోనస్ ముద్రలు సైన్ అప్‌కు 3 రోజులలోపు ఇవ్వబడతాయి'
    },
    copyCode: {
      en: 'Copy referral code!',
      hi: 'रेफरल कोड कॉपी करें!',
      bangla: 'রেফারেল কোড কপি করুন!',
      kannada: 'ರೆಫರಲ್ ಕೋಡ್ ನಕಲಿಸಿ!',
      punjabi: 'ਰੈਫਰਲ ਕੋਡ ਕਾਪੀ ਕਰੋ!',
      tamil: 'பரிந்துரை குறியீட்டை நகலெடுக்கவும்!',
      telugu: 'రిఫరల్ కోడ్‌ను కాపీ చేయండి!'
    }
  };

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
  
  // Debug: Log when currentLanguage changes

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        // Fetch referral code from user data
        // If user doesn't have a referral code, generate one or fetch from backend
        if (user.referralCode) {
          setReferralCode(user.referralCode);
        } else {
          // TODO: Fetch or generate referral code from backend
          // For now, use a placeholder
          setReferralCode('hh2547d6');
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    
    // Show toast message
    setShowToast(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleInviteButton = () => {
    setShowReferralModal(true);
  };

  const handleCopyReferralCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setShowReferralModal(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {getTranslation(translations.title)}
        </Text>
        <Text style={styles.subtitle}>
          {getTranslation(translations.subtitle)}
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>
              {getTranslation(translations.login)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>
              {getTranslation(translations.signup)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayCode = isExpanded ? referralCode : `${referralCode.substring(0, 6)}...`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {getTranslation(translations.title)}
      </Text>
      <Text style={styles.subtitle}>
        {getTranslation(translations.subtitleLoggedIn)}
      </Text>
      <View style={styles.referralRow}>
        <Text style={styles.referralLabel}>
          {getTranslation(translations.referralCode)}
        </Text>
        <Text style={styles.referralCode}>{displayCode}</Text>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={toggleExpanded}
        >
          <Text style={styles.expandButtonText}>...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyCode}
        >
          <Feather name="copy" size={20} color="#FF9800" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.inviteButton} onPress={handleInviteButton}>
        <Text style={styles.inviteButtonText}>
          {getTranslation(translations.inviteEarn)}
        </Text>
      </TouchableOpacity>
      
      {/* Toast message */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            {getTranslation(translations.codeCopied)}
          </Text>
        </View>
      )}
      
      {/* Referral Modal */}
      {showReferralModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getTranslation(translations.referEarn)}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowReferralModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                {getTranslation(translations.referDescription)}
              </Text>
              
              <Text style={styles.modalText}>
                {getTranslation(translations.copyInstructions)}
              </Text>
              
              <Text style={styles.modalText}>
                {getTranslation(translations.downloadInstructions)}
              </Text>
              
              <Text style={styles.modalNote}>
                {getTranslation(translations.bonusNote)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleCopyReferralCode}
            >
              <Text style={styles.modalButtonText}>
                {getTranslation(translations.copyCode)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export function SocialRow() {
  // Use the same icon row as before
  const { FontAwesome, MaterialCommunityIcons } = require('@expo/vector-icons');
  
  // Facebook function to open your profile
  const openFacebookProfile = () => {
    const facebookUrl = 'https://www.facebook.com/profile.php?id=61580880367031';
    
    // Try to open Facebook app first
    const appUrl = `fb://profile/61580880367031`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(facebookUrl);
    });
  };
  
  // WhatsApp function to open chat with your number
  const openWhatsAppChat = () => {
    const phoneNumber = '916361496368'; // Your number: 91 (India) + 6361496368
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    
    // Try to open WhatsApp app
    Linking.openURL(whatsappUrl).catch(() => {
      // Fallback: open WhatsApp in browser if app not installed
      const webUrl = `https://wa.me/${phoneNumber}`;
      Linking.openURL(webUrl);
    });
  };
  
  // YouTube function to open your channel
  const openYouTubeChannel = () => {
    // Your actual YouTube channel URL
    const youtubeUrl = 'https://www.youtube.com/@TheHinduHeritage_YT';
    
    // Try to open YouTube app first
    const appUrl = `youtube://channel/${youtubeUrl.split('/').pop()}`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(youtubeUrl);
    });
  };
  
  // Twitter function to open your profile
  const openTwitterProfile = () => {
    // Your actual X (Twitter) profile URL
    const twitterUrl = 'https://x.com/HinduHeritage_x';
    
    // Try to open X app first
    const appUrl = `twitter://user?screen_name=HinduHeritage_x`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(twitterUrl);
    });
  };
  
  // LinkedIn function to open your company page
  const openLinkedInCompany = () => {
    // Your LinkedIn company page URL
    const linkedinUrl = 'https://www.linkedin.com/company/thehinduheritage';
    
    // Try to open LinkedIn app first
    const appUrl = `linkedin://company/thehinduheritage`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(linkedinUrl);
    });
  };
  
  return (
    <View style={styles.socialContainer}>
      <TouchableOpacity style={styles.socialIcon} onPress={openFacebookProfile}>
        <FontAwesome name="facebook" size={26} color="#1877F3" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openYouTubeChannel}>
        <FontAwesome name="youtube-play" size={26} color="#FF0000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openTwitterProfile}>
        <MaterialCommunityIcons name="alpha-x-circle" size={26} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openLinkedInCompany}>
        <FontAwesome name="linkedin" size={26} color="#0077B5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openWhatsAppChat}>
        <FontAwesome name="whatsapp" size={26} color="#25D366" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 10,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#3A3939',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  referralLabel: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: '500',
  },
  referralCode: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 2,
    flex: 1,
  },
  expandButton: {
    marginLeft: 4,
    padding: 2,
  },
  expandButtonText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  copyButton: {
    marginLeft: 6,
    padding: 2,
  },
  inviteButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  connectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 2,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 2,
  },
  socialIcon: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: '90%',
    marginTop: -200, // Move modal 200 pixels up
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 14,
    color: '#FF9800',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  modalButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 