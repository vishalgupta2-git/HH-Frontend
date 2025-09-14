import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface VastuResult {
  mainEntrance: string;
  bedroom: string;
  kitchen: string;
  livingRoom: string;
  bathroom: string;
  studyRoom: string;
  poojaRoom: string;
  overallScore: number;
  recommendations: string[];
}

interface DirectionAnalysis {
  direction: string;
  element: string;
  color: string;
  deity: string;
  suitableFor: string[];
  avoidFor: string[];
  remedies: string[];
}

const VastuCalculator: React.FC = () => {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  
  // Helper function to get translations
  const getTranslation = (translations: any) => {
    return currentLanguage === 'hindi' ? translations.hi :
           currentLanguage === 'bangla' ? translations.bangla :
           currentLanguage === 'kannada' ? translations.kannada :
           currentLanguage === 'punjabi' ? translations.punjabi :
           currentLanguage === 'tamil' ? translations.tamil :
           currentLanguage === 'telugu' ? translations.telugu :
           translations.en;
  };

  const translations = {
    calculator: {
      en: 'Calculator',
      hi: 'कैलकुलेटर',
      bangla: 'ক্যালকুলেটর',
      kannada: 'ಕ್ಯಾಲ್ಕುಲೇಟರ್',
      punjabi: 'ਕੈਲਕੁਲੇਟਰ',
      tamil: 'கால்குலேட்டர்',
      telugu: 'కాలిక్యులేటర్'
    },
    directions: {
      en: 'Directions',
      hi: 'दिशाएं',
      bangla: 'দিকনির্দেশনা',
      kannada: 'ದಿಕ್ಕುಗಳು',
      punjabi: 'ਦਿਸ਼ਾਵਾਂ',
      tamil: 'திசைகள்',
      telugu: 'దిశలు'
    },
    remedies: {
      en: 'Remedies',
      hi: 'उपाय',
      bangla: 'প্রতিকার',
      kannada: 'ಪರಿಹಾರಗಳು',
      punjabi: 'ਉਪਾਅ',
      tamil: 'பரிகாரங்கள்',
      telugu: 'పరిహారాలు'
    },
    houseInfo: {
      en: 'Your House Information',
      hi: 'आपकी घर की जानकारी',
      bangla: 'আপনার বাড়ির তথ্য',
      kannada: 'ನಿಮ್ಮ ಮನೆಯ ಮಾಹಿತಿ',
      punjabi: 'ਤੁਹਾਡੇ ਘਰ ਦੀ ਜਾਣਕਾਰੀ',
      tamil: 'உங்கள் வீட்டு தகவல்',
      telugu: 'మీ ఇంటి సమాచారం'
    },
    houseFacing: {
      en: 'House Facing',
      hi: 'घर का मुख',
      bangla: 'বাড়ির মুখ',
      kannada: 'ಮನೆಯ ಮುಖ',
      punjabi: 'ਘਰ ਦਾ ਮੂੰਹ',
      tamil: 'வீட்டின் முகம்',
      telugu: 'ఇంటి ముఖం'
    },
    mainEntrance: {
      en: 'Main Entrance',
      hi: 'मुख्य प्रवेश द्वार',
      bangla: 'প্রধান প্রবেশদ্বার',
      kannada: 'ಮುಖ್ಯ ಪ್ರವೇಶ',
      punjabi: 'ਮੁੱਖ ਪ੍ਰਵੇਸ਼',
      tamil: 'முதன்மை நுழைவு',
      telugu: 'ప్రధాన ప్రవేశం'
    },
    bedroom: {
      en: 'Bedroom',
      hi: 'शयनकक्ष',
      bangla: 'বেডরুম',
      kannada: 'ಹಾಸಿಗೆ ಕೋಣೆ',
      punjabi: 'ਬੈੱਡਰੂਮ',
      tamil: 'படுக்கை அறை',
      telugu: 'బెడ్ రూమ్'
    },
    kitchen: {
      en: 'Kitchen',
      hi: 'रसोई',
      bangla: 'রান্নাঘর',
      kannada: 'ಅಡುಗೆ ಮನೆ',
      punjabi: 'ਰਸੋਈ',
      tamil: 'சமையலறை',
      telugu: 'వంటగది'
    },
    livingRoom: {
      en: 'Living Room',
      hi: 'ड्रॉइंग रूम',
      bangla: 'বসার ঘর',
      kannada: 'ಅತಿಥಿ ಕೋಣೆ',
      punjabi: 'ਡਰਾਇੰਗ ਰੂਮ',
      tamil: 'வாழ்க்கை அறை',
      telugu: 'లివింగ్ రూమ్'
    },
    bathroom: {
      en: 'Bathroom',
      hi: 'स्नानघर',
      bangla: 'স্নানাগার',
      kannada: 'ಸ್ನಾನಗೃಹ',
      punjabi: 'ਬਾਥਰੂਮ',
      tamil: 'குளியலறை',
      telugu: 'బాత్ రూమ్'
    },
    studyRoom: {
      en: 'Study Room',
      hi: 'अध्ययन कक्ष',
      bangla: 'পড়ার ঘর',
      kannada: 'ಅಧ್ಯಯನ ಕೋಣೆ',
      punjabi: 'ਪੜ੍ਹਾਈ ਕਮਰਾ',
      tamil: 'படிப்பறை',
      telugu: 'స్టడీ రూమ్'
    },
    poojaRoom: {
      en: 'Puja Room',
      hi: 'पूजा कक्ष',
      bangla: 'পূজার ঘর',
      kannada: 'ಪೂಜೆ ಕೋಣೆ',
      punjabi: 'ਪੂਜਾ ਕਮਰਾ',
      tamil: 'பூஜை அறை',
      telugu: 'పూజ గది'
    },
    notSelected: {
      en: 'Not selected',
      hi: 'चयनित नहीं',
      bangla: 'নির্বাচিত নয়',
      kannada: 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ',
      punjabi: 'ਚੁਣਿਆ ਨਹੀਂ',
      tamil: 'தேர்ந்தெடுக்கப்படவில்லை',
      telugu: 'ఎంచుకోలేదు'
    },
    calculateVastu: {
      en: 'Calculate Vastu',
      hi: 'वास्तु की गणना करें',
      bangla: 'ভাস্টু গণনা করুন',
      kannada: 'ವಾಸ್ತು ಲೆಕ್ಕಾಚಾರ',
      punjabi: 'ਵਾਸਤੂ ਗਣਨਾ',
      tamil: 'வாஸ்து கணக்கிடு',
      telugu: 'వాస్తు లెక్కించు'
    },
    overallScore: {
      en: 'Overall Vastu Score',
      hi: 'समग्र वास्तु स्कोर',
      bangla: 'মোট ভাস্টু স্কোর',
      kannada: 'ಒಟ್ಟಾರೆ ವಾಸ್ತು ಸ್ಕೋರ್',
      punjabi: 'ਕੁੱਲ ਵਾਸਤੂ ਸਕੋਰ',
      tamil: 'மொத்த வாஸ்து மதிப்பெண்',
      telugu: 'మొత్తం వాస్తు స్కోర్'
    },
    recommendations: {
      en: 'Recommendations',
      hi: 'सुझाव',
      bangla: 'সুপারিশ',
      kannada: 'ಶಿಫಾರಸುಗಳು',
      punjabi: 'ਸਿਫਾਰਸ਼ਾਂ',
      tamil: 'பரிந்துரைகள்',
      telugu: 'సిఫారసులు'
    },
    excellentVastu: {
      en: 'Excellent Vastu - Your home has very good energy flow',
      hi: 'उत्कृष्ट वास्तु - आपके घर में बहुत अच्छा ऊर्जा प्रवाह है',
      bangla: 'চমৎকার ভাস্টু - আপনার বাড়িতে খুব ভালো শক্তি প্রবাহ আছে',
      kannada: 'ಅತ್ಯುತ್ತಮ ವಾಸ್ತು - ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಶಕ್ತಿ ಹರಿವು',
      punjabi: 'ਸ਼ਾਨਦਾਰ ਵਾਸਤੂ - ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਬਹੁਤ ਵਧੀਆ ਊਰਜਾ ਪ੍ਰਵਾਹ ਹੈ',
      tamil: 'சிறந்த வாஸ்து - உங்கள் வீட்டில் மிகவும் நல்ல ஆற்றல் ஓட்டம் உள்ளது',
      telugu: 'అద్భుతమైన వాస్తు - మీ ఇంటిలో చాలా మంచి శక్తి ప్రవాహం ఉంది'
    },
    goodVastu: {
      en: 'Good Vastu - Your home has good energy flow with minor issues',
      hi: 'अच्छा वास्तु - आपके घर में अच्छा ऊर्जा प्रवाह है लेकिन कुछ छोटी समस्याएं हैं',
      bangla: 'ভালো ভাস্টু - আপনার বাড়িতে ভালো শক্তি প্রবাহ আছে কিন্তু কিছু ছোট সমস্যা আছে',
      kannada: 'ಒಳ್ಳೆಯ ವಾಸ್ತು - ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಒಳ್ಳೆಯ ಶಕ್ತಿ ಹರಿವು ಆದರೆ ಸ್ವಲ್ಪ ಸಮಸ್ಯೆಗಳು',
      punjabi: 'ਵਧੀਆ ਵਾਸਤੂ - ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਵਧੀਆ ਊਰਜਾ ਪ੍ਰਵਾਹ ਹੈ ਪਰ ਕੁਝ ਛੋਟੀਆਂ ਸਮੱਸਿਆਵਾਂ',
      tamil: 'நல்ல வாஸ்து - உங்கள் வீட்டில் நல்ல ஆற்றல் ஓட்டம் உள்ளது ஆனால் சில சிறிய பிரச்சினைகள்',
      telugu: 'మంచి వాస్తు - మీ ఇంటిలో మంచి శక్తి ప్రవాహం ఉంది కానీ కొన్ని చిన్న సమస్యలు'
    },
    moderateVastu: {
      en: 'Moderate Vastu - Your home has some energy imbalances',
      hi: 'मध्यम वास्तु - आपके घर में कुछ ऊर्जा असंतुलन हैं',
      bangla: 'মাঝারি ভাস্টু - আপনার বাড়িতে কিছু শক্তি ভারসাম্যহীনতা আছে',
      kannada: 'ಮಧ್ಯಮ ವಾಸ್ತು - ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಕೆಲವು ಶಕ್ತಿ ಅಸಮತೋಲನಗಳು',
      punjabi: 'ਦਰਮਿਆਨਾ ਵਾਸਤੂ - ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਕੁਝ ਊਰਜਾ ਅਸੰਤੁਲਨ ਹਨ',
      tamil: 'மிதமான வாஸ்து - உங்கள் வீட்டில் சில ஆற்றல் சமநிலையின்மை உள்ளது',
      telugu: 'మధ్యస్థ వాస్తు - మీ ఇంటిలో కొన్ని శక్తి అసమతుల్యతలు ఉన్నాయి'
    },
    poorVastu: {
      en: 'Poor Vastu - Your home needs significant energy corrections',
      hi: 'खराब वास्तु - आपके घर को महत्वपूर्ण ऊर्जा सुधार की आवश्यकता है',
      bangla: 'খারাপ ভাস্টু - আপনার বাড়িতে উল্লেখযোগ্য শক্তি সংশোধন প্রয়োজন',
      kannada: 'ಕಳಪೆ ವಾಸ್ತು - ನಿಮ್ಮ ಮನೆಗೆ ಗಮನಾರ್ಹ ಶಕ್ತಿ ತಿದ್ದುಪಡಿಗಳು ಬೇಕು',
      punjabi: 'ਮਾੜਾ ਵਾਸਤੂ - ਤੁਹਾਡੇ ਘਰ ਨੂੰ ਮਹੱਤਵਪੂਰਨ ਊਰਜਾ ਸੁਧਾਰ ਦੀ ਲੋੜ ਹੈ',
      tamil: 'மோசமான வாஸ்து - உங்கள் வீட்டிற்கு குறிப்பிடத்தக்க ஆற்றல் திருத்தங்கள் தேவை',
      telugu: 'చెడ్డ వాస్తు - మీ ఇంటికి గణనీయమైన శక్తి సరిదిద్దుబాట్లు అవసరం'
    },
    errorTitle: {
      en: 'Error',
      hi: 'त्रुटि',
      bangla: 'ত্রুটি',
      kannada: 'ದೋಷ',
      punjabi: 'ਗਲਤੀ',
      tamil: 'பிழை',
      telugu: 'లోపం'
    },
    errorMessage: {
      en: 'Please enter house facing direction and main entrance location',
      hi: 'कृपया घर का मुख दिशा और मुख्य प्रवेश द्वार स्थान दर्ज करें',
      bangla: 'অনুগ্রহ করে বাড়ির মুখের দিক এবং প্রধান প্রবেশদ্বারের অবস্থান লিখুন',
      kannada: 'ದಯವಿಟ್ಟು ಮನೆಯ ಮುಖದ ದಿಕ್ಕು ಮತ್ತು ಮುಖ್ಯ ಪ್ರವೇಶದ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਘਰ ਦਾ ਮੂੰਹ ਦਿਸ਼ਾ ਅਤੇ ਮੁੱਖ ਪ੍ਰਵੇਸ਼ ਸਥਾਨ ਦਰਜ ਕਰੋ',
      tamil: 'தயவுசெய்து வீட்டின் முகம் திசை மற்றும் முதன்மை நுழைவு இடம் உள்ளிடவும்',
      telugu: 'దయచేసి ఇంటి ముఖం దిశ మరియు ప్రధాన ప్రవేశ స్థానాన్ని నమోదు చేయండి'
    },
    directionAnalysis: {
      en: 'Direction Analysis',
      hi: 'दिशा विश्लेषण',
      bangla: 'দিকনির্দেশনা বিশ্লেষণ',
      kannada: 'ದಿಕ್ಕು ವಿಶ್ಲೇಷಣೆ',
      punjabi: 'ਦਿਸ਼ਾ ਵਿਸ਼ਲੇਸ਼ਣ',
      tamil: 'திசை பகுப்பாய்வு',
      telugu: 'దిశ విశ్లేషణ'
    },
    directionAnalysisSubtitle: {
      en: 'Click any direction to learn about its properties and suitable uses',
      hi: 'इसके गुणों और उपयुक्त उपयोगों के बारे में जानने के लिए किसी भी दिशा पर क्लिक करें',
      bangla: 'এর বৈশিষ্ট্য এবং উপযুক্ত ব্যবহার সম্পর্কে জানতে যে কোন দিকে ক্লিক করুন',
      kannada: 'ಅದರ ಗುಣಲಕ್ಷಣಗಳು ಮತ್ತು ಸೂಕ್ತ ಬಳಕೆಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಯಾವುದೇ ದಿಕ್ಕನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ',
      punjabi: 'ਇਸ ਦੇ ਗੁਣਾਂ ਅਤੇ ਢੁਕਵੇਂ ਵਰਤੋਂ ਬਾਰੇ ਜਾਣਨ ਲਈ ਕੋਈ ਵੀ ਦਿਸ਼ਾ \'ਤੇ ਕਲਿਕ ਕਰੋ',
      tamil: 'அதன் பண்புகள் மற்றும் பொருத்தமான பயன்பாடுகளைப் பற்றி அறிய எந்த திசையையும் கிளிக் செய்யவும்',
      telugu: 'దాని లక్షణాలు మరియు సరైన వినియోగాల గురించి తెలుసుకోవడానికి ఏ దిశను క్లిక్ చేయండి'
    },
    vastuRemedies: {
      en: 'Vastu Remedies',
      hi: 'वास्तु उपाय',
      bangla: 'ভাস্টু প্রতিকার',
      kannada: 'ವಾಸ್ತು ಪರಿಹಾರಗಳು',
      punjabi: 'ਵਾਸਤੂ ਉਪਾਅ',
      tamil: 'வாஸ்து பரிகாரங்கள்',
      telugu: 'వాస్తు పరిహారాలు'
    },
    generalRemedies: {
      en: 'General Remedies',
      hi: 'सामान्य उपाय',
      bangla: 'সাধারণ প্রতিকার',
      kannada: 'ಸಾಮಾನ್ಯ ಪರಿಹಾರಗಳು',
      punjabi: 'ਆਮ ਉਪਾਅ',
      tamil: 'பொதுவான பரிகாரங்கள்',
      telugu: 'సాధారణ పరిహారాలు'
    },
    colorRemedies: {
      en: 'Color Remedies',
      hi: 'रंग उपाय',
      bangla: 'রঙের প্রতিকার',
      kannada: 'ಬಣ್ಣದ ಪರಿಹಾರಗಳು',
      punjabi: 'ਰੰਗ ਦੇ ਉਪਾਅ',
      tamil: 'நிற பரிகாரங்கள்',
      telugu: 'రంగు పరిహారాలు'
    },
    aboutVastuShastra: {
      en: 'About Vastu Shastra',
      hi: 'वास्तु शास्त्र के बारे में',
      bangla: 'ভাস্টু শাস্ত্র সম্পর্কে',
      kannada: 'ವಾಸ್ತು ಶಾಸ್ತ್ರದ ಬಗ್ಗೆ',
      punjabi: 'ਵਾਸਤੂ ਸ਼ਾਸਤਰ ਬਾਰੇ',
      tamil: 'வாஸ்து சாஸ்திரம் பற்றி',
      telugu: 'వాస్తు శాస్త్రం గురించి'
    },
    vastuDescription1: {
      en: 'Vastu Shastra is an ancient Indian science of architecture and design that aims to create harmony between nature and human dwellings. It is based on the principle that everything in the universe has energy, and the proper placement of rooms and objects can enhance positive energy flow.',
      hi: 'वास्तु शास्त्र वास्तुकला और डिजाइन का एक प्राचीन भारतीय विज्ञान है जिसका उद्देश्य प्रकृति और मानव निवास के बीच सामंजस्य बनाना है। यह इस सिद्धांत पर आधारित है कि ब्रह्मांड में सब कुछ में ऊर्जा है, और कमरों और वस्तुओं का उचित स्थान सकारात्मक ऊर्जा प्रवाह को बढ़ा सकता है।',
      bangla: 'ভাস্টু শাস্ত্র হল স্থাপত্য ও নকশার একটি প্রাচীন ভারতীয় বিজ্ঞান যা প্রকৃতি ও মানব বাসস্থানের মধ্যে সম্প্রীতি সৃষ্টির লক্ষ্যে। এটি এই নীতির উপর ভিত্তি করে যে মহাবিশ্বের সব কিছুতেই শক্তি রয়েছে, এবং কক্ষ ও বস্তুর সঠিক স্থাপনা ইতিবাচক শক্তি প্রবাহকে বাড়াতে পারে।',
      kannada: 'ವಾಸ್ತು ಶಾಸ್ತ್ರವು ಸಾಮರಸ್ಯವನ್ನು ಸೃಷ್ಟಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿರುವ ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ವಿನ್ಯಾಸದ ಪ್ರಾಚೀನ ಭಾರತೀಯ ವಿಜ್ಞಾನವಾಗಿದೆ। ಇದು ಬ್ರಹ್ಮಾಂಡದಲ್ಲಿರುವ ಎಲ್ಲದಕ್ಕೂ ಶಕ್ತಿ ಇದೆ ಎಂಬ ತತ್ವದ ಮೇಲೆ ಆಧಾರಿತವಾಗಿದೆ, ಮತ್ತು ಕೋಣೆಗಳು ಮತ್ತು ವಸ್ತುಗಳ ಸರಿಯಾದ ಹುದ್ದೆ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹರಿವನ್ನು ಹೆಚ್ಚಿಸಬಹುದು.',
      punjabi: 'ਵਾਸਤੂ ਸ਼ਾਸਤਰ ਇੱਕ ਪ੍ਰਾਚੀਨ ਭਾਰਤੀ ਆਰਕੀਟੈਕਚਰ ਅਤੇ ਡਿਜ਼ਾਈਨ ਦਾ ਵਿਗਿਆਨ ਹੈ ਜਿਸਦਾ ਟੀਚਾ ਕੁਦਰਤ ਅਤੇ ਮਨੁੱਖੀ ਰਿਹਾਇਸ਼ਾਂ ਦੇ ਵਿਚਕਾਰ ਤਾਲਮੇਲ ਬਣਾਉਣਾ ਹੈ। ਇਹ ਇਸ ਸਿਧਾਂਤ \'ਤੇ ਆਧਾਰਿਤ ਹੈ ਕਿ ਬ੍ਰਹਿਮੰਡ ਵਿੱਚ ਹਰ ਚੀਜ਼ ਵਿੱਚ ਊਰਜਾ ਹੈ, ਅਤੇ ਕਮਰਿਆਂ ਅਤੇ ਵਸਤੂਆਂ ਦੀ ਸਹੀ ਜਗ੍ਹਾ ਸਕਾਰਾਤਮਕ ਊਰਜਾ ਪ੍ਰਵਾਹ ਨੂੰ ਵਧਾ ਸਕਦੀ ਹੈ।',
      tamil: 'வாஸ்து சாஸ்திரம் என்பது இயற்கை மற்றும் மனித குடியிருப்புகளுக்கு இடையே ஒத்திசைவை உருவாக்குவதை நோக்கமாகக் கொண்ட கட்டிடக்கலை மற்றும் வடிவமைப்பின் பண்டைய இந்திய அறிவியல் ஆகும். பிரபஞ்சத்தில் உள்ள அனைத்திற்கும் ஆற்றல் உள்ளது என்ற கொள்கையின் அடிப்படையில் இது அமைந்துள்ளது, மேலும் அறைகள் மற்றும் பொருட்களின் சரியான இடம் நேர்மறை ஆற்றல் ஓட்டத்தை மேம்படுத்தலாம்.',
      telugu: 'వాస్తు శాస్త్రం అనేది ప్రకృతి మరియు మానవ నివాసాల మధ్య సామరస్యాన్ని సృష్టించడాన్ని లక్ష్యంగా చేసుకున్న వాస్తుశిల్పం మరియు డిజైన్ యొక్క ప్రాచీన భారతీయ శాస్త్రం. విశ్వంలోని ప్రతిదానికీ శక్తి ఉంది అనే సూత్రంపై ఇది ఆధారపడి ఉంది, మరియు గదులు మరియు వస్తువుల సరైన ఉంచడం సానుకూల శక్తి ప్రవాహాన్ని పెంచగలదు.'
    },
    vastuDescription2: {
      en: 'The eight directions (Ashtadik) play a crucial role in Vastu, each having specific elements, colors, and deities associated with them. Proper room placement according to Vastu principles can bring health, wealth, and happiness to the residents.',
      hi: 'आठ दिशाएं (अष्टदिक) वास्तु में महत्वपूर्ण भूमिका निभाती हैं, प्रत्येक के साथ विशिष्ट तत्व, रंग और देवता जुड़े हुए हैं। वास्तु सिद्धांतों के अनुसार उचित कमरे का स्थान निवासियों के लिए स्वास्थ्य, धन और खुशी ला सकता है।',
      bangla: 'আটটি দিক (অষ্টদিক) ভাস্টুতে গুরুত্বপূর্ণ ভূমিকা পালন করে, প্রতিটির সাথে নির্দিষ্ট উপাদান, রং এবং দেবতা যুক্ত। ভাস্টু নীতির অনুযায়ী সঠিক ঘরের অবস্থান বাসিন্দাদের জন্য স্বাস্থ্য, সম্পদ এবং সুখ আনতে পারে।',
      kannada: 'ಎಂಟು ದಿಕ್ಕುಗಳು (ಅಷ್ಟದಿಕ್) ವಾಸ್ತುವಿನಲ್ಲಿ ಪ್ರಮುಖ ಪಾತ್ರವನ್ನು ವಹಿಸುತ್ತವೆ, ಪ್ರತಿಯೊಂದಕ್ಕೂ ನಿರ್ದಿಷ್ಟ ಅಂಶಗಳು, ಬಣ್ಣಗಳು ಮತ್ತು ದೇವತೆಗಳು ಸಂಬಂಧಿಸಿವೆ. ವಾಸ್ತು ತತ್ವಗಳ ಪ್ರಕಾರ ಸರಿಯಾದ ಕೋಣೆಯ ಹುದ್ದೆ ನಿವಾಸಿಗಳಿಗೆ ಆರೋಗ್ಯ, ಸಂಪತ್ತು ಮತ್ತು ಸಂತೋಷ ತರಬಹುದು.',
      punjabi: 'ਅੱਠ ਦਿਸ਼ਾਵਾਂ (ਅਸ਼ਟਦਿਕ) ਵਾਸਤੂ ਵਿੱਚ ਮਹੱਤਵਪੂਰਨ ਭੂਮਿਕਾ ਨਿਭਾਉਂਦੀਆਂ ਹਨ, ਹਰ ਇੱਕ ਨਾਲ ਖਾਸ ਤੱਤ, ਰੰਗ ਅਤੇ ਦੇਵਤੇ ਜੁੜੇ ਹੋਏ ਹਨ। ਵਾਸਤੂ ਸਿਧਾਂਤਾਂ ਦੇ ਅਨੁਸਾਰ ਸਹੀ ਕਮਰੇ ਦੀ ਜਗ੍ਹਾ ਨਿਵਾਸੀਆਂ ਲਈ ਸਿਹਤ, ਦੌਲਤ ਅਤੇ ਖੁਸ਼ੀ ਲਿਆ ਸਕਦੀ ਹੈ।',
      tamil: 'எட்டு திசைகள் (அஷ்டதிக்) வாஸ்துவில் முக்கிய பங்கு வகிக்கின்றன, ஒவ்வொன்றும் குறிப்பிட்ட கூறுகள், நிறங்கள் மற்றும் தெய்வங்கள் தொடர்புடையவை. வாஸ்து கொள்கைகளின்படி சரியான அறை வைப்பு குடியிருப்பாளர்களுக்கு ஆரோக்கியம், செல்வம் மற்றும் மகிழ்ச்சியைக் கொண்டு வரலாம்.',
      telugu: 'ఎనిమిది దిశలు (అష్టదిక్) వాస్తువులో కీలక పాత్ర పోషిస్తాయి, ప్రతి దానికి నిర్దిష్ట అంశాలు, రంగులు మరియు దేవతలు సంబంధం కలిగి ఉంటాయి. వాస్తు సూత్రాల ప్రకారం సరైన గది ఉంచడం నివాసులకు ఆరోగ్యం, సంపద మరియు ఆనందాన్ని తీసుకురాగలదు.'
    }
  };

  const [houseFacing, setHouseFacing] = useState('');
  const [mainEntrance, setMainEntrance] = useState('');
  const [bedroomLocation, setBedroomLocation] = useState('');
  const [kitchenLocation, setKitchenLocation] = useState('');
  const [livingRoomLocation, setLivingRoomLocation] = useState('');
  const [bathroomLocation, setBathroomLocation] = useState('');
  const [studyRoomLocation, setStudyRoomLocation] = useState('');
  const [poojaRoomLocation, setPoojaRoomLocation] = useState('');
  const [results, setResults] = useState<VastuResult | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'directions' | 'remedies'>('calculator');
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    houseFacing: false,
    mainEntrance: false,
    bedroom: false,
    kitchen: false,
    livingRoom: false,
    bathroom: false,
    studyRoom: false,
    poojaRoom: false
  });
  
  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoDescription, setInfoDescription] = useState('');

  // ScrollView reference for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Direction analysis data
  const directionAnalysis: { [key: string]: DirectionAnalysis } = {
    'North': {
      direction: 'North',
      element: 'Water',
      color: 'Blue/Black',
      deity: 'Kubera (God of Wealth)',
      suitableFor: ['Entrance', 'Kitchen', 'Study Room', 'Treasury'],
      avoidFor: ['Bedroom', 'Bathroom'],
      remedies: ['Place water fountain', 'Use blue/black colors', 'Keep clean and organized']
    },
    'South': {
      direction: 'South',
      element: 'Fire',
      color: 'Red/Orange',
      deity: 'Yama (God of Death)',
      suitableFor: ['Bedroom', 'Kitchen', 'Fireplace'],
      avoidFor: ['Main Entrance', 'Puja Room'],
      remedies: ['Use red/orange colors', 'Place fire elements', 'Keep well-lit']
    },
    'East': {
      direction: 'East',
      element: 'Air',
      color: 'Green/Yellow',
      deity: 'Indra (God of Rain)',
      suitableFor: ['Main Entrance', 'Pooja Room', 'Study Room', 'Living Room'],
      avoidFor: ['Bathroom', 'Kitchen'],
      remedies: ['Use green/yellow colors', 'Place wind chimes', 'Keep windows open']
    },
    'West': {
      direction: 'West',
      element: 'Earth',
      color: 'Brown/Yellow',
      deity: 'Varuna (God of Water)',
      suitableFor: ['Bedroom', 'Bathroom', 'Storage'],
      avoidFor: ['Main Entrance', 'Puja Room'],
      remedies: ['Use brown/yellow colors', 'Place heavy furniture', 'Keep stable']
    },
    'North-East': {
      direction: 'North-East',
      element: 'Water + Air',
      color: 'Light Blue/White',
      deity: 'Ishanya (God of Knowledge)',
      suitableFor: ['Puja Room', 'Study Room', 'Entrance'],
      avoidFor: ['Kitchen', 'Bathroom', 'Bedroom'],
      remedies: ['Keep clean and pure', 'Use light colors', 'Place religious items']
    },
    'North-West': {
      direction: 'North-West',
      element: 'Air + Earth',
      color: 'Grey/White',
      deity: 'Vayu (God of Wind)',
      suitableFor: ['Bedroom', 'Guest Room', 'Storage'],
      avoidFor: ['Kitchen', 'Puja Room'],
      remedies: ['Use grey/white colors', 'Place wind chimes', 'Keep well-ventilated']
    },
    'South-East': {
      direction: 'South-East',
      element: 'Fire + Air',
      color: 'Red/Orange',
      deity: 'Agni (God of Fire)',
      suitableFor: ['Kitchen', 'Fireplace', 'Generator Room'],
      avoidFor: ['Bedroom', 'Puja Room'],
      remedies: ['Use red/orange colors', 'Place fire elements', 'Keep well-lit']
    },
    'South-West': {
      direction: 'South-West',
      element: 'Earth + Fire',
      color: 'Brown/Red',
      deity: 'Nairutya (God of Demons)',
      suitableFor: ['Master Bedroom', 'Heavy Furniture', 'Storage'],
      avoidFor: ['Main Entrance', 'Puja Room', 'Kitchen'],
      remedies: ['Use brown/red colors', 'Place heavy items', 'Keep stable and quiet']
    }
  };

  // Room placement guidelines
  const roomGuidelines = {
    'Main Entrance': {
      'North': 'Excellent - Brings wealth and prosperity',
      'North-East': 'Excellent - Brings knowledge and wisdom',
      'East': 'Very Good - Brings health and happiness',
      'North-West': 'Good - Brings success in business',
      'West': 'Moderate - May cause delays',
      'South-East': 'Poor - May cause financial issues',
      'South': 'Poor - May cause health issues',
      'South-West': 'Very Poor - May cause conflicts'
    },
    'Bedroom': {
      'South-West': 'Excellent - Best for master bedroom',
      'South': 'Very Good - Good for sleep',
      'West': 'Good - Peaceful sleep',
      'North-West': 'Good - Good for guests',
      'North': 'Moderate - May cause restlessness',
      'North-East': 'Poor - May cause health issues',
      'East': 'Poor - May cause early rising',
      'South-East': 'Very Poor - May cause insomnia'
    },
    'Kitchen': {
      'South-East': 'Excellent - Best for kitchen',
      'North-West': 'Very Good - Good for cooking',
      'East': 'Good - Good for health',
      'South': 'Moderate - May cause health issues',
      'North': 'Poor - May cause financial issues',
      'North-East': 'Very Poor - May cause health problems',
      'West': 'Poor - May cause digestive issues',
      'South-West': 'Very Poor - May cause family conflicts'
    },
         'Puja Room': {
       'North-East': 'Excellent - Best for spiritual activities',
       'East': 'Very Good - Good for morning prayers',
       'North': 'Good - Good for meditation',
       'North-West': 'Moderate - Acceptable',
       'West': 'Poor - Not ideal for prayers',
       'South': 'Poor - May cause negative energy',
       'South-East': 'Very Poor - May cause spiritual issues',
       'South-West': 'Very Poor - May cause negative thoughts'
     }
  };

  // Show info modal
  const showInfo = (title: string, description: string) => {
    setInfoTitle(title);
    setInfoDescription(description);
    setShowInfoModal(true);
  };

  // Toggle expandable section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Close info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  // Handle modal overlay click
  const handleModalOverlayClick = () => {
    closeInfoModal();
  };

  // Calculate Vastu score and recommendations
  const calculateVastu = () => {
    if (!houseFacing.trim() || !mainEntrance.trim()) {
      Alert.alert(getTranslation(translations.errorTitle), getTranslation(translations.errorMessage));
      return;
    }

    let score = 100;
    const recommendations: string[] = [];

    // Analyze main entrance
    const entranceScore = getDirectionScore('Main Entrance', mainEntrance);
    score += entranceScore.score;
    if (entranceScore.recommendations.length > 0) {
      recommendations.push(...entranceScore.recommendations);
    }

    // Analyze bedroom
    if (bedroomLocation.trim()) {
      const bedroomScore = getDirectionScore('Bedroom', bedroomLocation);
      score += bedroomScore.score;
      if (bedroomScore.recommendations.length > 0) {
        recommendations.push(...bedroomScore.recommendations);
      }
    }

    // Analyze kitchen
    if (kitchenLocation.trim()) {
      const kitchenScore = getDirectionScore('Kitchen', kitchenLocation);
      score += kitchenScore.score;
      if (kitchenScore.recommendations.length > 0) {
        recommendations.push(...kitchenScore.recommendations);
      }
    }

    // Analyze other rooms
    const rooms = [
      { name: 'Living Room', location: livingRoomLocation },
      { name: 'Bathroom', location: bathroomLocation },
      { name: 'Study Room', location: studyRoomLocation },
      { name: 'Pooja Room', location: poojaRoomLocation }
    ];

    rooms.forEach(room => {
      if (room.location.trim()) {
        const roomScore = getDirectionScore(room.name, room.location);
        score += roomScore.score;
        if (roomScore.recommendations.length > 0) {
          recommendations.push(...roomScore.recommendations);
        }
      }
    });

    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));

    const result: VastuResult = {
      mainEntrance: mainEntrance,
      bedroom: bedroomLocation,
      kitchen: kitchenLocation,
      livingRoom: livingRoomLocation,
      bathroom: bathroomLocation,
      studyRoom: studyRoomLocation,
      poojaRoom: poojaRoomLocation,
      overallScore: score,
      recommendations: recommendations
    };

    setResults(result);
    
    // No scrolling - results will appear below naturally
  };

  // Get direction score for a specific room
  const getDirectionScore = (roomName: string, direction: string) => {
    const guidelines = roomGuidelines[roomName as keyof typeof roomGuidelines];
    if (!guidelines || !guidelines[direction as keyof typeof guidelines]) {
      return { score: -10, recommendations: [`${roomName} placement in ${direction} direction needs analysis`] };
    }

    const placement = guidelines[direction as keyof typeof guidelines];
    let score = 0;
    const recommendations: string[] = [];

    if (placement.includes('Excellent')) {
      score = 15;
    } else if (placement.includes('Very Good')) {
      score = 10;
    } else if (placement.includes('Good')) {
      score = 5;
    } else if (placement.includes('Moderate')) {
      score = 0;
    } else if (placement.includes('Poor')) {
      score = -10;
      recommendations.push(`Consider relocating ${roomName} from ${direction} direction`);
    } else if (placement.includes('Very Poor')) {
      score = -20;
      recommendations.push(`Strongly recommend relocating ${roomName} from ${direction} direction`);
    }

    // Add specific recommendations based on direction analysis
    const directionInfo = directionAnalysis[direction];
    if (directionInfo) {
      if (!directionInfo.suitableFor.includes(roomName)) {
        recommendations.push(`Use ${directionInfo.remedies.join(', ')} for ${roomName} in ${direction}`);
      }
    }

    return { score, recommendations };
  };

  // Clear all inputs and results
  const clearAll = () => {
    setHouseFacing('');
    setMainEntrance('');
    setBedroomLocation('');
    setKitchenLocation('');
    setLivingRoomLocation('');
    setBathroomLocation('');
    setStudyRoomLocation('');
    setPoojaRoomLocation('');
    setResults(null);
    
    // Reset expanded sections
    setExpandedSections({
      houseFacing: false,
      mainEntrance: false,
      bedroom: false,
      kitchen: false,
      livingRoom: false,
      bathroom: false,
      studyRoom: false,
      poojaRoom: false
    });
    
    // Scroll to top after clearing
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderCalculatorTab = () => (
    <>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{getTranslation(translations.houseInfo)}</Text>
        
        {/* House Facing - Required */}
        <View style={styles.expandableSection}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('houseFacing')}
          >
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionLabel}>
                                 {getTranslation(translations.houseFacing)} <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.selectedValue}>
                {houseFacing || getTranslation(translations.notSelected)}
              </Text>
            </View>
            <Text style={[
              styles.expandArrow,
              expandedSections.houseFacing && styles.expandArrowUp
            ]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {expandedSections.houseFacing && (
            <View style={styles.sectionContent}>
              <View style={styles.directionGrid}>
                {Object.keys(directionAnalysis).map((direction) => (
                  <TouchableOpacity
                    key={direction}
                    style={[
                      styles.directionButton,
                      houseFacing === direction && styles.selectedDirection
                    ]}
                    onPress={() => {
                      setHouseFacing(direction);
                      toggleSection('houseFacing');
                    }}
                  >
                    <Text style={[
                      styles.directionButtonText,
                      houseFacing === direction && styles.selectedDirectionText
                    ]}>
                      {direction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main Entrance - Required */}
        <View style={styles.expandableSection}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('mainEntrance')}
          >
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionLabel}>
                Main Entrance <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.selectedValue}>
                {mainEntrance || 'Not selected'}
              </Text>
            </View>
            <Text style={[
              styles.expandArrow,
              expandedSections.mainEntrance && styles.expandArrowUp
            ]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {expandedSections.mainEntrance && (
            <View style={styles.sectionContent}>
              <View style={styles.directionGrid}>
                {Object.keys(directionAnalysis).map((direction) => (
                  <TouchableOpacity
                    key={direction}
                    style={[
                      styles.directionButton,
                      mainEntrance === direction && styles.selectedDirection
                    ]}
                    onPress={() => {
                      setMainEntrance(direction);
                      toggleSection('mainEntrance');
                    }}
                  >
                    <Text style={[
                      styles.directionButtonText,
                      mainEntrance === direction && styles.selectedDirectionText
                    ]}>
                      {direction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Optional Rooms */}
        {[
          { key: 'bedroom', label: getTranslation(translations.bedroom), state: bedroomLocation, setter: setBedroomLocation },
          { key: 'kitchen', label: getTranslation(translations.kitchen), state: kitchenLocation, setter: setKitchenLocation },
          { key: 'livingRoom', label: getTranslation(translations.livingRoom), state: livingRoomLocation, setter: setLivingRoomLocation },
          { key: 'bathroom', label: getTranslation(translations.bathroom), state: bathroomLocation, setter: setBathroomLocation },
          { key: 'studyRoom', label: getTranslation(translations.studyRoom), state: studyRoomLocation, setter: setStudyRoomLocation },
                     { key: 'poojaRoom', label: getTranslation(translations.poojaRoom), state: poojaRoomLocation, setter: setPoojaRoomLocation }
        ].map((room) => (
          <View key={room.key} style={styles.expandableSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection(room.key as keyof typeof expandedSections)}
            >
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionLabel}>{room.label}</Text>
                  <Text style={styles.selectedValue}>
                    {room.state || getTranslation(translations.notSelected)}
                  </Text>
              </View>
              <Text style={[
                styles.expandArrow,
                expandedSections[room.key as keyof typeof expandedSections] && styles.expandArrowUp
              ]}>
                ▼
              </Text>
            </TouchableOpacity>
            
            {expandedSections[room.key as keyof typeof expandedSections] && (
              <View style={styles.sectionContent}>
                <View style={styles.directionGrid}>
                  {Object.keys(directionAnalysis).map((direction) => (
                    <TouchableOpacity
                      key={direction}
                      style={[
                        styles.directionButton,
                        room.state === direction && styles.selectedDirection
                      ]}
                      onPress={() => {
                        room.setter(direction);
                        toggleSection(room.key as keyof typeof expandedSections);
                      }}
                    >
                      <Text style={[
                        styles.directionButtonText,
                        room.state === direction && styles.selectedDirectionText
                      ]}>
                        {direction}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateVastu}
        >
          <View style={styles.calculateButtonGradient}>
            <Text style={styles.calculateButtonText}>{getTranslation(translations.calculateVastu)}</Text>
          </View>
        </TouchableOpacity>

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAll}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Vastu Analysis Results</Text>
          
          {/* Overall Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{getTranslation(translations.overallScore)}</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{results.overallScore}%</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {results.overallScore >= 80 ? getTranslation(translations.excellentVastu) :
               results.overallScore >= 60 ? getTranslation(translations.goodVastu) :
               results.overallScore >= 40 ? getTranslation(translations.moderateVastu) :
               getTranslation(translations.poorVastu)}
            </Text>
          </View>

          {/* Room Analysis */}
          <View style={styles.roomAnalysisCard}>
            <Text style={styles.analysisTitle}>Room Placement Analysis</Text>
            
            {[
              { name: 'Main Entrance', location: results.mainEntrance },
              { name: 'Bedroom', location: results.bedroom },
              { name: 'Kitchen', location: results.kitchen },
              { name: 'Living Room', location: results.livingRoom },
              { name: 'Bathroom', location: results.bathroom },
              { name: 'Study Room', location: results.studyRoom },
                             { name: 'Puja Room', location: results.poojaRoom }
            ].map((room) => {
              if (!room.location) return null;
              const guidelines = roomGuidelines[room.name as keyof typeof roomGuidelines];
              const placement = guidelines?.[room.location as keyof typeof guidelines] || 'Analysis needed';
               
              return (
                <View key={room.name} style={styles.roomAnalysisItem}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomLocation}>{room.location}</Text>
                  <Text style={styles.roomPlacement}>{placement}</Text>
                </View>
              );
            })}
          </View>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.analysisTitle}>{getTranslation(translations.recommendations)}</Text>
              {results.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );

  const renderDirectionsTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{getTranslation(translations.directionAnalysis)}</Text>
        <Text style={styles.sectionSubtitle}>{getTranslation(translations.directionAnalysisSubtitle)}</Text>
        
        {Object.entries(directionAnalysis).map(([direction, info]) => (
          <TouchableOpacity
            key={direction}
            style={styles.directionCard}
            onPress={() => showInfo(direction, 
              `${direction} Direction Analysis:\n\n` +
              `Element: ${info.element}\n` +
              `Color: ${info.color}\n` +
              `Deity: ${info.deity}\n\n` +
              `Suitable for: ${info.suitableFor.join(', ')}\n` +
              `Avoid for: ${info.avoidFor.join(', ')}\n\n` +
              `Remedies: ${info.remedies.join(', ')}`
            )}
          >
            <View style={styles.directionCardHeader}>
              <Text style={styles.directionCardTitle}>{direction}</Text>
              <Text style={styles.dropdownButtonText}>i</Text>
            </View>
            <Text style={styles.directionCardElement}>Element: {info.element}</Text>
            <Text style={styles.directionCardDeity}>Deity: {info.deity}</Text>
            <Text style={styles.directionCardSuitable}>
              Best for: {info.suitableFor.slice(0, 2).join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderRemediesTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{getTranslation(translations.vastuRemedies)}</Text>
        
        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>{getTranslation(translations.generalRemedies)}</Text>
          <Text style={styles.remedyText}>
            • Keep your home clean and clutter-free{'\n'}
            • Ensure proper ventilation in all rooms{'\n'}
            • Use natural light whenever possible{'\n'}
            • Place mirrors strategically to enhance positive energy{'\n'}
            • Use appropriate colors for each direction{'\n'}
            • Keep the center of your home open and clean{'\n'}
            • Place heavy furniture in South-West direction{'\n'}
            • Avoid placing kitchen and bathroom in North-East
          </Text>
        </View>

        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>Color Remedies</Text>
          <Text style={styles.remedyText}>
            • North: Blue/Black for wealth{'\n'}
            • South: Red/Orange for energy{'\n'}
            • East: Green/Yellow for health{'\n'}
            • West: Brown/Yellow for stability{'\n'}
            • North-East: Light Blue/White for purity{'\n'}
            • South-East: Red/Orange for fire{'\n'}
            • South-West: Brown/Red for grounding{'\n'}
            • North-West: Grey/White for balance
          </Text>
        </View>

        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>Element Remedies</Text>
          <Text style={styles.remedyText}>
            • Water: Place water fountains in North{'\n'}
            • Fire: Use red colors and fire elements in South-East{'\n'}
            • Earth: Place heavy items in South-West{'\n'}
            • Air: Use wind chimes and keep East well-ventilated{'\n'}
            • Space: Keep center of home open and clean
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calculator' && styles.activeTab]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabText, activeTab === 'calculator' && styles.activeTabText]}>
            {getTranslation(translations.calculator)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'directions' && styles.activeTab]}
          onPress={() => setActiveTab('directions')}
        >
          <Text style={[styles.tabText, activeTab === 'directions' && styles.activeTabText]}>
            {getTranslation(translations.directions)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'remedies' && styles.activeTab]}
          onPress={() => setActiveTab('remedies')}
        >
          <Text style={[styles.tabText, activeTab === 'remedies' && styles.activeTabText]}>
            {getTranslation(translations.remedies)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'directions' && renderDirectionsTab()}
        {activeTab === 'remedies' && renderRemediesTab()}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Vastu Shastra</Text>
          <Text style={styles.infoText}>
            Vastu Shastra is an ancient Indian science of architecture and design that aims to create harmony between nature and human dwellings. It is based on the principle that everything in the universe has energy, and the proper placement of rooms and objects can enhance positive energy flow.
          </Text>
          <Text style={styles.infoText}>
            The eight directions (Ashtadik) play a crucial role in Vastu, each having specific elements, colors, and deities associated with them. Proper room placement according to Vastu principles can bring health, wealth, and happiness to the residents.
          </Text>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeInfoModal}
        onDismiss={closeInfoModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleModalOverlayClick}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoTitle}</Text>
              <TouchableOpacity
                onPress={closeInfoModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{infoDescription}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeInfoModal}
            >
              <View style={styles.modalCloseButtonGradient}>
                <Text style={styles.modalCloseButtonText}>Got it!</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFA040',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  directionButton: {
    width: (screenWidth - 80) / 4 - 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDirection: {
    backgroundColor: '#FFA040',
    borderColor: '#FFA040',
  },
  directionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  selectedDirectionText: {
    color: 'white',
  },
  roomInput: {
    marginBottom: 15,
  },
  roomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  calculateButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFA040',
    borderRadius: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    padding: 18,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  roomAnalysisCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  roomAnalysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  roomLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  roomPlacement: {
    fontSize: 12,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  directionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  directionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  directionCardElement: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  directionCardDeity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  directionCardSuitable: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  remedyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  remedyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  remedyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'left',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalCloseButtonGradient: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFA040',
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandableSection: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  selectedValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  required: {
    color: 'red',
    fontSize: 16,
  },
  expandArrow: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  expandArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  sectionContent: {
    paddingTop: 15,
    paddingHorizontal: 5,
  },
});

export default VastuCalculator;
