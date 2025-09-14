import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export const options = { headerShown: false };

export default function MudrasScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const router = useRouter();
  const [showMudrasModal, setShowMudrasModal] = useState(false);
  const [mudrasCount, setMudrasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper function to get translations
  const getTranslation = (translations: any) => {
    return currentLanguage === 'hindi' ? (translations.hi || translations.en) :
           currentLanguage === 'bangla' ? (translations.bangla || translations.en) :
           currentLanguage === 'kannada' ? (translations.kannada || translations.en) :
           currentLanguage === 'punjabi' ? (translations.punjabi || translations.en) :
           currentLanguage === 'tamil' ? (translations.tamil || translations.en) :
           currentLanguage === 'telugu' ? (translations.telugu || translations.en) :
           translations.en;
  };

  const translations = {
    headerTitle: { 
      en: 'Mudras', 
      hi: 'मुद्राएं',
      bangla: 'মুদ্রা',
      kannada: 'ಮುದ್ರೆಗಳು',
      punjabi: 'ਮੁਦਰਾ',
      tamil: 'முத்திரைகள்',
      telugu: 'ముద్రలు'
    },
    title: { 
      en: 'Mudras', 
      hi: 'मुद्राएं',
      bangla: 'মুদ্রা',
      kannada: 'ಮುದ್ರೆಗಳು',
      punjabi: 'ਮੁਦਰਾ',
      tamil: 'முத்திரைகள்',
      telugu: 'ముద్రలు'
    },
    currentMudras: { 
      en: 'Current Mudras', 
      hi: 'वर्तमान मुद्राएं',
      bangla: 'বর্তমান মুদ্রা',
      kannada: 'ಪ್ರಸ್ತುತ ಮುದ್ರೆಗಳು',
      punjabi: 'ਮੌਜੂਦਾ ਮੁਦਰਾ',
      tamil: 'தற்போதைய முத்திரைகள்',
      telugu: 'ప్రస్తుత ముద్రలు'
    },
    loadingMudras: { 
      en: 'Loading mudras...', 
      hi: 'मुद्राएं लोड हो रही हैं...',
      bangla: 'মুদ্রা লোড হচ্ছে...',
      kannada: 'ಮುದ್ರೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਮੁਦਰਾ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...',
      tamil: 'முத்திரைகள் ஏற்றப்படுகின்றன...',
      telugu: 'ముద్రలు లోడ్ అవుతున్నాయి...'
    },
    mudrasCount: { 
      en: 'Mudras', 
      hi: 'मुद्राएं',
      bangla: 'মুদ্রা',
      kannada: 'ಮುದ್ರೆಗಳು',
      punjabi: 'ਮੁਦਰਾ',
      tamil: 'முத்திரைகள்',
      telugu: 'ముద్రలు'
    },
    viewMudraHistory: { 
      en: 'View Mudra History', 
      hi: 'मुद्रा इतिहास देखें',
      bangla: 'মুদ্রার ইতিহাস দেখুন',
      kannada: 'ಮುದ್ರೆಗಳ ಇತಿಹಾಸವನ್ನು ನೋಡಿ',
      punjabi: 'ਮੁਦਰਾ ਦਾ ਇਤਿਹਾਸ ਦੇਖੋ',
      tamil: 'முத்திரை வரலாற்றைக் காண்க',
      telugu: 'ముద్రల చరిత్రను చూడండి'
    },
    howToEarnMudras: { 
      en: 'How to earn Mudras', 
      hi: 'मुद्राएं कैसे कमाएं',
      bangla: 'মুদ্রা কীভাবে অর্জন করবেন',
      kannada: 'ಮುದ್ರೆಗಳನ್ನು ಹೇಗೆ ಗಳಿಸಬೇಕು',
      punjabi: 'ਮੁਦਰਾ ਕਿਵੇਂ ਕਮਾਓ',
      tamil: 'முத்திரைகளை எவ்வாறு சம்பாதிப்பது',
      telugu: 'ముద్రలను ఎలా సంపాదించాలి'
    },
    modalTitle: { 
      en: 'How to Earn Mudras', 
      hi: 'मुद्राएं कैसे कमाएं',
      bangla: 'মুদ্রা কীভাবে অর্জন করবেন',
      kannada: 'ಮುದ್ರೆಗಳನ್ನು ಹೇಗೆ ಗಳಿಸಬೇಕು',
      punjabi: 'ਮੁਦਰਾ ਕਿਵੇਂ ਕਮਾਓ',
      tamil: 'முத்திரைகளை எவ்வாறு சம்பாதிப்பது',
      telugu: 'ముద్రలను ఎలా సంపాదించాలి'
    },
    closeButton: { 
      en: '✕', 
      hi: '✕',
      bangla: '✕',
      kannada: '✕',
      punjabi: '✕',
      tamil: '✕',
      telugu: '✕'
    },
    pujaActivities: { 
      en: 'Puja activities', 
      hi: 'पूजा गतिविधियां',
      bangla: 'পূজার কার্যক্রম',
      kannada: 'ಪೂಜಾ ಚಟುವಟಿಕೆಗಳು',
      punjabi: 'ਪੂਜਾ ਦੀਆਂ ਗਤਿਵਿਧੀਆਂ',
      tamil: 'பூஜை நடவடிக்கைகள்',
      telugu: 'పూజ కార్యకలాపాలు'
    },
    onetimeActivities: { 
      en: 'Onetime activities', 
      hi: 'एक बार की गतिविधियां',
      bangla: 'এককালীন কার্যক্রম',
      kannada: 'ಒಮ್ಮೆ ಮಾತ್ರದ ಚಟುವಟಿಕೆಗಳು',
      punjabi: 'ਇੱਕ ਵਾਰ ਦੀਆਂ ਗਤਿਵਿਧੀਆਂ',
      tamil: 'ஒரு முறை நடவடிக்கைகள்',
      telugu: 'ఒకసారి కార్యకలాపాలు'
    },
    dailyActivities: { 
      en: 'Daily activities:', 
      hi: 'दैनिक गतिविधियां:',
      bangla: 'দৈনিক কার্যক্রম:',
      kannada: 'ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳು:',
      punjabi: 'ਰੋਜ਼ਾਨਾ ਗਤਿਵਿਧੀਆਂ:',
      tamil: 'தினசரி நடவடிக்கைகள்:',
      telugu: 'రోజువారీ కార్యకలాపాలు:'
    },
    activities: {
      bookPuja: { 
        en: 'Book any Puja:', 
        hi: 'कोई भी पूजा बुक करें:',
        bangla: 'যেকোনো পূজা বুক করুন:',
        kannada: 'ಯಾವುದೇ ಪೂಜೆಯನ್ನು ಬುಕ್ ಮಾಡಿ:',
        punjabi: 'ਕੋਈ ਵੀ ਪੂਜਾ ਬੁੱਕ ਕਰੋ:',
        tamil: 'எந்த பூஜையையும் புக் செய்யுங்கள்:',
        telugu: 'ఏదైనా పూజను బుక్ చేయండి:'
      },
      referFriend: { 
        en: 'Refer a Friend:', 
        hi: 'मित्र को रेफर करें:',
        bangla: 'একজন বন্ধুকে রেফার করুন:',
        kannada: 'ಸ್ನೇಹಿತನನ್ನು ರೆಫರ್ ಮಾಡಿ:',
        punjabi: 'ਇੱਕ ਦੋਸਤ ਨੂੰ ਰੈਫਰ ਕਰੋ:',
        tamil: 'ஒரு நண்பரை ரெஃபர் செய்யுங்கள்:',
        telugu: 'ఒక స్నేహితుడిని రెఫర్ చేయండి:'
      },
      signUp: { 
        en: 'Sign Up:', 
        hi: 'साइन अप करें:',
        bangla: 'সাইন আপ করুন:',
        kannada: 'ಸೈನ್ ಅಪ್ ಮಾಡಿ:',
        punjabi: 'ਸਾਈਨ ਅੱਪ ਕਰੋ:',
        tamil: 'பதிவு செய்யுங்கள்:',
        telugu: 'సైన్ అప్ చేయండి:'
      },
      completeProfile: { 
        en: 'Complete Profile:', 
        hi: 'प्रोफाइल पूरा करें:',
        bangla: 'প্রোফাইল সম্পূর্ণ করুন:',
        kannada: 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ:',
        punjabi: 'ਪ੍ਰੋਫਾਈਲ ਪੂਰਾ ਕਰੋ:',
        tamil: 'சுயவிவரத்தை முடிக்கவும்:',
        telugu: 'ప్రొఫైల్‌ను పూర్తి చేయండి:'
      },
      setupTemple: { 
        en: 'Setup your Temple:', 
        hi: 'अपना मंदिर सेटअप करें:',
        bangla: 'আপনার মন্দির সেটআপ করুন:',
        kannada: 'ನಿಮ್ಮ ದೇವಾಲಯವನ್ನು ಸೆಟಪ್ ಮಾಡಿ:',
        punjabi: 'ਆਪਣਾ ਮੰਦਰ ਸੈੱਟਅੱਪ ਕਰੋ:',
        tamil: 'உங்கள் கோவிலை அமைக்கவும்:',
        telugu: 'మీ ఆలయాన్ని సెటప్ చేయండి:'
      },
      dailyLogin: { 
        en: 'Daily Login:', 
        hi: 'दैनिक लॉगिन:',
        bangla: 'দৈনিক লগইন:',
        kannada: 'ದೈನಂದಿನ ಲಾಗಿನ್:',
        punjabi: 'ਰੋਜ਼ਾਨਾ ਲੌਗਇਨ:',
        tamil: 'தினசரி உள்நுழைவு:',
        telugu: 'రోజువారీ లాగిన్:'
      },
      offerFlowers: { 
        en: 'Offer flowers to god:', 
        hi: 'भगवान को फूल चढ़ाएं:',
        bangla: 'ভগবানকে ফুল অর্পণ করুন:',
        kannada: 'ದೇವರಿಗೆ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ:',
        punjabi: 'ਭਗਵਾਨ ਨੂੰ ਫੁੱਲ ਚੜ੍ਹਾਓ:',
        tamil: 'கடவுளுக்கு பூக்களை அர்ப்பணிக்கவும்:',
        telugu: 'దేవుడికి పూలు అర్పించండి:'
      },
      doAarti: { 
        en: 'Do aarti:', 
        hi: 'आरती करें:',
        bangla: 'আরতি করুন:',
        kannada: 'ಆರತಿ ಮಾಡಿ:',
        punjabi: 'ਆਰਤੀ ਕਰੋ:',
        tamil: 'ஆரத்தி செய்யுங்கள்:',
        telugu: 'ఆరతి చేయండి:'
      },
      ringBell: { 
        en: 'Ring the bell:', 
        hi: 'घंटी बजाएं:',
        bangla: 'ঘণ্টা বাজান:',
        kannada: 'ಗಂಟೆ ಬಾರಿಸಿ:',
        punjabi: 'ਘੰਟੀ ਵਜਾਓ:',
        tamil: 'மணியை அடிக்கவும்:',
        telugu: 'గంటను మోగించండి:'
      },
      playShankh: { 
        en: 'Play Shankh:', 
        hi: 'शंख बजाएं:',
        bangla: 'শঙ্খ বাজান:',
        kannada: 'ಶಂಖವನ್ನು ನುಡಿಸಿ:',
        punjabi: 'ਸ਼ੰਖ ਵਜਾਓ:',
        tamil: 'சங்கு வாசியுங்கள்:',
        telugu: 'శంఖం వాయించండి:'
      },
      offerDhoop: { 
        en: 'Offer Dhoop to God:', 
        hi: 'भगवान को धूप चढ़ाएं:',
        bangla: 'ভগবানকে ধূপ অর্পণ করুন:',
        kannada: 'ದೇವರಿಗೆ ಧೂಪವನ್ನು ಅರ್ಪಿಸಿ:',
        punjabi: 'ਭਗਵਾਨ ਨੂੰ ਧੂਪ ਚੜ੍ਹਾਓ:',
        tamil: 'கடவுளுக்கு தூபம் அர்ப்பணிக்கவும்:',
        telugu: 'దేవుడికి ధూపం అర్పించండి:'
      },
      listenAudioVideo: { 
        en: 'Listen to Audio / Video:', 
        hi: 'ऑडियो / वीडियो सुनें:',
        bangla: 'অডিও / ভিডিও শুনুন:',
        kannada: 'ಆಡಿಯೊ / ವೀಡಿಯೊ ಕೇಳಿ:',
        punjabi: 'ਆਡੀਓ / ਵੀਡੀਓ ਸੁਣੋ:',
        tamil: 'ஆடியோ / வீடியோ கேளுங்கள்:',
        telugu: 'ఆడియో / వీడియో వినండి:'
      },
      checkRashifal: { 
        en: 'Check Rashifal:', 
        hi: 'राशिफल देखें:',
        bangla: 'রাশিফল দেখুন:',
        kannada: 'ರಾಶಿಫಲವನ್ನು ನೋಡಿ:',
        punjabi: 'ਰਾਸ਼ੀਫਲ ਦੇਖੋ:',
        tamil: 'ராசிபலம் பாருங்கள்:',
        telugu: 'రాశిఫలం చూడండి:'
      }
    },
    profileDetails: {
      phoneNumber: { 
        en: 'Phone Number:', 
        hi: 'फोन नंबर:',
        bangla: 'ফোন নম্বর:',
        kannada: 'ಫೋನ್ ಸಂಖ್ಯೆ:',
        punjabi: 'ਫੋਨ ਨੰਬਰ:',
        tamil: 'தொலைபேசி எண்:',
        telugu: 'ఫోన్ నంబర్:'
      },
      dateOfBirth: { 
        en: 'Date of Birth:', 
        hi: 'जन्म तिथि:',
        bangla: 'জন্ম তারিখ:',
        kannada: 'ಜನ್ಮ ದಿನಾಂಕ:',
        punjabi: 'ਜਨਮ ਤਾਰੀਖ:',
        tamil: 'பிறந்த தேதி:',
        telugu: 'పుట్టిన తేదీ:'
      },
      fathersDateOfBirth: { 
        en: 'Father\'s date of birth:', 
        hi: 'पिता की जन्म तिथि:',
        bangla: 'পিতার জন্ম তারিখ:',
        kannada: 'ತಂದೆಯ ಜನ್ಮ ದಿನಾಂಕ:',
        punjabi: 'ਪਿਤਾ ਦੀ ਜਨਮ ਤਾਰੀਖ:',
        tamil: 'தந்தையின் பிறந்த தேதி:',
        telugu: 'తండ్రి పుట్టిన తేదీ:'
      },
      mothersDateOfBirth: { 
        en: 'Mother\'s date of birth:', 
        hi: 'माता की जन्म तिथि:',
        bangla: 'মায়ের জন্ম তারিখ:',
        kannada: 'ತಾಯಿಯ ಜನ್ಮ ದಿನಾಂಕ:',
        punjabi: 'ਮਾਂ ਦੀ ਜਨਮ ਤਾਰੀਖ:',
        tamil: 'தாயின் பிறந்த தேதி:',
        telugu: 'తల్లి పుట్టిన తేదీ:'
      },
      childrensInfo: { 
        en: 'Children\'s name and date of birth:', 
        hi: 'बच्चों का नाम और जन्म तिथि:',
        bangla: 'সন্তানদের নাম এবং জন্ম তারিখ:',
        kannada: 'ಮಕ್ಕಳ ಹೆಸರು ಮತ್ತು ಜನ್ಮ ದಿನಾಂಕ:',
        punjabi: 'ਬੱਚਿਆਂ ਦਾ ਨਾਮ ਅਤੇ ਜਨਮ ਤਾਰੀਖ:',
        tamil: 'குழந்தைகளின் பெயர் மற்றும் பிறந்த தேதி:',
        telugu: 'పిల్లల పేరు మరియు పుట్టిన తేదీ:'
      }
    },
    mudraCounts: {
      mudras: { 
        en: 'Mudras', 
        hi: 'मुद्राएं',
        bangla: 'মুদ্রা',
        kannada: 'ಮುದ್ರೆಗಳು',
        punjabi: 'ਮੁਦਰਾ',
        tamil: 'முத்திரைகள்',
        telugu: 'ముద్రలు'
      },
      perChildren: { 
        en: '/ children', 
        hi: '/ बच्चे',
        bangla: '/ সন্তান',
        kannada: '/ ಮಕ್ಕಳು',
        punjabi: '/ ਬੱਚੇ',
        tamil: '/ குழந்தைகள்',
        telugu: '/ పిల్లలు'
      },
      perAudioVideo: { 
        en: 'per audio / video', 
        hi: 'प्रति ऑडियो / वीडियो',
        bangla: 'প্রতি অডিও / ভিডিও',
        kannada: 'ಪ್ರತಿ ಆಡಿಯೊ / ವೀಡಿಯೊ',
        punjabi: 'ਪ੍ਰਤੀ ਆਡੀਓ / ਵੀਡੀਓ',
        tamil: 'ஒவ்வொரு ஆடியோ / வீடியோவிற்கும்',
        telugu: 'ప్రతి ఆడియో / వీడియోకు'
      },
      maxPerDay: { 
        en: '(Max 25 Mudras per day)', 
        hi: '(प्रतिदिन अधिकतम 25 मुद्राएं)',
        bangla: '(প্রতিদিন সর্বোচ্চ 25 মুদ্রা)',
        kannada: '(ದಿನಕ್ಕೆ ಗರಿಷ್ಠ 25 ಮುದ್ರೆಗಳು)',
        punjabi: '(ਰੋਜ਼ਾਨਾ ਵੱਧ ਤੋਂ ਵੱਧ 25 ਮੁਦਰਾ)',
        tamil: '(ஒரு நாளைக்கு அதிகபட்சம் 25 முத்திரைகள்)',
        telugu: '(రోజుకు గరిష్ఠం 25 ముద్రలు)'
      }
    }
  };

  // Fetch user mudras count
  useEffect(() => {
    const fetchMudras = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const response = await axios.get(getEndpointUrl('USER_MUDRAS'), {
            params: { email: user.email },
            headers: getAuthHeaders()
          });
          
          if (response.data.success) {
            setMudrasCount(response.data.mudras);
          }
        }
      } catch (error) {
        console.error('Error fetching mudras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMudras();
  }, []);
  
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
        <View style={styles.contentHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getTranslation(translations.title)}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{getTranslation(translations.currentMudras)}</Text>
        
        {/* Fixed back button container */}
        <TouchableOpacity style={styles.fixedBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-undo" size={24} color="#666" />
        </TouchableOpacity>
        
        {/* Placeholder for current mudras list */}
                 <View style={styles.mudraListPlaceholder}>
           {loading ? (
             <Text style={{ color: '#888', fontSize: 16 }}>{getTranslation(translations.loadingMudras)}</Text>
           ) : (
             <Text style={styles.mudrasCountText}>{mudrasCount} {getTranslation(translations.mudrasCount)}</Text>
           )}
         </View>
                 <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/auth/mudra-history')}>
           <Text style={styles.historyLinkText}>{getTranslation(translations.viewMudraHistory)}</Text>
         </TouchableOpacity>
        <TouchableOpacity style={styles.historyLink} onPress={() => setShowMudrasModal(true)}>
          <Text style={styles.historyLinkText}>{getTranslation(translations.howToEarnMudras)}</Text>
        </TouchableOpacity>
      </View>
      
      {/* How to Earn Mudras Modal */}
      <Modal
        visible={showMudrasModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMudrasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getTranslation(translations.modalTitle)}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMudrasModal(false)}
              >
                <Text style={styles.closeButtonText}>{getTranslation(translations.closeButton)}</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
                             {/* Puja Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{getTranslation(translations.pujaActivities)}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.bookPuja)} <Text style={styles.mudraCount}>500 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.referFriend)} <Text style={styles.mudraCount}>100 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
               </View>
               
               {/* One-time Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{getTranslation(translations.onetimeActivities)}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.signUp)} <Text style={styles.mudraCount}>100 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.completeProfile)}</Text>
                   <View style={styles.activityDetails}>
                     <Text style={styles.activityDetail}>• {getTranslation(translations.profileDetails.phoneNumber)} <Text style={styles.mudraCount}>10 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                     <Text style={styles.activityDetail}>• {getTranslation(translations.profileDetails.dateOfBirth)} <Text style={styles.mudraCount}>10 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                     <Text style={styles.activityDetail}>• {getTranslation(translations.profileDetails.fathersDateOfBirth)} <Text style={styles.mudraCount}>10 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                     <Text style={styles.activityDetail}>• {getTranslation(translations.profileDetails.mothersDateOfBirth)} <Text style={styles.mudraCount}>10 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                     <Text style={styles.activityDetail}>• {getTranslation(translations.profileDetails.childrensInfo)} <Text style={styles.mudraCount}>15 {getTranslation(translations.mudraCounts.mudras)} {getTranslation(translations.mudraCounts.perChildren)}</Text></Text>
                   </View>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.setupTemple)} <Text style={styles.mudraCount}>50 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
               </View>
               
               {/* Daily Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{getTranslation(translations.dailyActivities)}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.dailyLogin)} <Text style={styles.mudraCount}>10 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.offerFlowers)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.doAarti)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.ringBell)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.playShankh)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.offerDhoop)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.listenAudioVideo)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)} {getTranslation(translations.mudraCounts.perAudioVideo)}</Text></Text>
                   <Text style={styles.activitySubtext}>{getTranslation(translations.mudraCounts.maxPerDay)}</Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{getTranslation(translations.activities.checkRashifal)} <Text style={styles.mudraCount}>5 {getTranslation(translations.mudraCounts.mudras)}</Text></Text>
                 </View>
               </View>
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
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -135,  // Move it to the left side
    top: 5,   // 20px from top
    zIndex: 10, // Ensure it's above other elements
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
    alignItems: 'center',
  },

  mudraListPlaceholder: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  historyLink: {
    marginTop: 8,
    alignSelf: 'center',
  },
  historyLinkText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    height: '80%',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
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
    flex: 1,
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FFF6EE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activityItem: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDetails: {
    marginLeft: 16,
    marginTop: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  mudraCount: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
     activitySubtext: {
     fontSize: 12,
     color: '#888',
     fontStyle: 'italic',
     marginLeft: 16,
     marginTop: 2,
   },
   mudrasCountText: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FF6A00',
     textAlign: 'center',
   },
   title: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#FF6A00',
     marginBottom: 18,
     textAlign: 'center',
   },
   subtitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#222',
     marginBottom: 18,
     textAlign: 'left',
   },
   // New styles for contentHeader
   contentHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingTop: 5,
     paddingBottom: 16,
     borderBottomWidth: 1,
     borderBottomColor: '#E0E0E0',
     marginBottom: 20,
   },
   titleContainer: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
   },
   fixedBackButton: {
     position: 'absolute',
     top: 20,
     left: 20,
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: '#F0F0F0',
     alignItems: 'center',
     justifyContent: 'center',
     zIndex: 10,
   },
 }); 