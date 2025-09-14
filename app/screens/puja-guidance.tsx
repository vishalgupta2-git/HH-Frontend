import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEndpointUrl, getAuthHeaders, API_CONFIG } from '../../constants/ApiConfig';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

// Time slots for booking
const timeSlots = [
  '8AM-10AM',
  '10AM-12PM',
  '12PM-2PM',
  '2PM-4PM',
  '4PM-6PM',
  '6PM-8PM'
];

interface Provider {
  providerId: string;
  Salutation: string;
  firstName: string;
  lastName: string;
  Gender: string;
  city: string;
  state: string;
  country: string;
  phoneNumber: string;
  photoLibrary: string;
  kundli: boolean;
  astrology: boolean;
  vastu: boolean;
  numerology: boolean;
  createdAt: string;
  updatedAt: string;
  email: string;
  areasServiced: any;
  aboutProvider?: string; // New field for provider description
  imageUrl?: string; // Optional presigned URL for the provider's image
}

const PujaGuidanceScreen: React.FC = () => {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  // Provider states
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
     const [showProviderModal, setShowProviderModal] = useState(false);
   const [showBookingModal, setShowBookingModal] = useState(false);
   const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Booking form states
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Translations
  const translations = {
    searchPlaceholder: { 
      en: 'Search puja guidance providers...', 
      hi: 'पूजा मार्गदर्शन प्रदाताओं की खोज करें...',
      bangla: 'পুজো নির্দেশনা প্রদানকারীদের খুঁজুন...',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಒದಗಿಸುವವರನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਖੋਜੋ...',
      tamil: 'பூஜை வழிகாட்டுதல் வழங்குநர்களைத் தேடுங்கள்...',
      telugu: 'పూజ మార్గదర్శన అందించేవారిని వెతకండి...'
    },
    loading: { 
      en: 'Loading...', 
      hi: 'लोड हो रहा है...',
      bangla: 'লোড হচ্ছে...',
      kannada: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      tamil: 'ஏற்றப்படுகிறது...',
      telugu: 'లోడ్ అవుతోంది...'
    },
    noDataFound: { 
      en: 'No puja guidance providers found.', 
      hi: 'कोई पूजा मार्गदर्शन प्रदाता नहीं मिला।',
      bangla: 'কোনো পুজো নির্দেশনা প্রদানকারী পাওয়া যায়নি।',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಒದಗಿಸುವವರು ಕಂಡುಬಂದಿಲ್ಲ।',
      punjabi: 'ਕੋਈ ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਤਾ ਨਹੀਂ ਮਿਲਿਆ।',
      tamil: 'பூஜை வழிகாட்டுதல் வழங்குநர்கள் கிடைக்கவில்லை।',
      telugu: 'పూజ మార్గదర్శన అందించేవారు కనుగొనబడలేదు।'
    },
    errorLoading: { 
      en: 'Error loading data. Please try again.', 
      hi: 'डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।',
      bangla: 'ডেটা লোড করার সময় ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      kannada: 'ಡೇಟಾ ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'தரவை ஏற்றுவதில் பிழை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      telugu: 'డేటా లోడ్ చేయడంలో లోపం। దయచేసి మళ్లీ ప్రయత్నించండి।'
    },
    pullToRefresh: { 
      en: 'Pull to refresh', 
      hi: 'रिफ्रेश करने के लिए खींचें',
      bangla: 'রিফ্রেশ করতে টানুন',
      kannada: 'ರಿಫ್ರೆಶ್ ಮಾಡಲು ಎಳೆಯಿರಿ',
      punjabi: 'ਰਿਫਰੈਸ਼ ਕਰਨ ਲਈ ਖਿੱਚੋ',
      tamil: 'புதுப்பிக்க இழுக்கவும்',
      telugu: 'రిఫ్రెష్ చేయడానికి లాగండి'
    },
    bookingForm: {
      title: { 
        en: 'Book Puja Guidance', 
        hi: 'पूजा मार्गदर्शन बुक करें',
        bangla: 'পুজো নির্দেশনা বুক করুন',
        kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಬುಕ್ ಮಾಡಿ',
        punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਬੁਕ ਕਰੋ',
        tamil: 'பூஜை வழிகாட்டுதல் புக்கிங்',
        telugu: 'పూజ మార్గదర్శన బుక్ చేయండి'
      },
      name: { 
        en: 'Your Name', 
        hi: 'आपका नाम',
        bangla: 'আপনার নাম',
        kannada: 'ನಿಮ್ಮ ಹೆಸರು',
        punjabi: 'ਤੁਹਾਡਾ ਨਾਮ',
        tamil: 'உங்கள் பெயர்',
        telugu: 'మీ పేరు'
      },
      phone: { 
        en: 'Phone Number', 
        hi: 'फोन नंबर',
        bangla: 'ফোন নম্বর',
        kannada: 'ಫೋನ್ ನಂಬರ್',
        punjabi: 'ਫੋਨ ਨੰਬਰ',
        tamil: 'தொலைபேசி எண்',
        telugu: 'ఫోన్ నంబర్'
      },
      date: { 
        en: 'Preferred Date', 
        hi: 'पसंदीदा तारीख',
        bangla: 'পছন্দের তারিখ',
        kannada: 'ಅಭಿಮತ ದಿನಾಂಕ',
        punjabi: 'ਪਸੰਦੀਦਾ ਤਾਰੀਖ',
        tamil: 'விருப்பமான தேதி',
        telugu: 'అభిమత తేదీ'
      },
      timeSlot: { 
        en: 'Time Slot', 
        hi: 'समय स्लॉट',
        bangla: 'সময় স্লট',
        kannada: 'ಸಮಯ ಸ್ಲಾಟ್',
        punjabi: 'ਸਮਾਂ ਸਲਾਟ',
        tamil: 'நேர இடைவெளி',
        telugu: 'సమయ స్లాట్'
      },
      submit: { 
        en: 'Book Guidance', 
        hi: 'मार्गदर्शन बुक करें',
        bangla: 'নির্দেশনা বুক করুন',
        kannada: 'ಮಾರ್ಗದರ್ಶನ ಬುಕ್ ಮಾಡಿ',
        punjabi: 'ਮਾਰਗਦਰਸ਼ਨ ਬੁਕ ਕਰੋ',
        tamil: 'வழிகாட்டுதல் புக்கிங்',
        telugu: 'మార్గదర్శన బుక్ చేయండి'
      },
      cancel: { 
        en: 'Cancel', 
        hi: 'रद्द करें',
        bangla: 'বাতিল করুন',
        kannada: 'ರದ್ದುಮಾಡಿ',
        punjabi: 'ਰੱਦ ਕਰੋ',
        tamil: 'ரத்துசெய்',
        telugu: 'రద్దు చేయండి'
      }
    },
    timeSlots: {
      slot1: { 
        en: '8AM-10AM', 
        hi: 'सुबह 8-10 बजे',
        bangla: 'সকাল 8-10টা',
        kannada: 'ಬೆಳಿಗ್ಯೆ 8-10',
        punjabi: 'ਸਵੇਰੇ 8-10 ਵਜੇ',
        tamil: 'காலை 8-10 மணி',
        telugu: 'ఉదయం 8-10 గంటలు'
      },
      slot2: { 
        en: '10AM-12PM', 
        hi: 'सुबह 10-दोपहर 12 बजे',
        bangla: 'সকাল 10টা-দুপুর 12টা',
        kannada: 'ಬೆಳಿಗ್ಯೆ 10-ಮಧ್ಯಾಹ್ನ 12',
        punjabi: 'ਸਵੇਰੇ 10-ਦੁਪਹਿਰ 12 ਵਜੇ',
        tamil: 'காலை 10-மதியம் 12 மணி',
        telugu: 'ఉదయం 10-మధ్యాహ్నం 12 గంటలు'
      },
      slot3: { 
        en: '12PM-2PM', 
        hi: 'दोपहर 12-2 बजे',
        bangla: 'দুপুর 12-2টা',
        kannada: 'ಮಧ್ಯಾಹ್ನ 12-2',
        punjabi: 'ਦੁਪਹਿਰ 12-2 ਵਜੇ',
        tamil: 'மதியம் 12-2 மணி',
        telugu: 'మధ్యాహ్నం 12-2 గంటలు'
      },
      slot4: { 
        en: '2PM-4PM', 
        hi: 'दोपहर 2-4 बजे',
        bangla: 'দুপুর 2-4টা',
        kannada: 'ಮಧ್ಯಾಹ್ನ 2-4',
        punjabi: 'ਦੁਪਹਿਰ 2-4 ਵਜੇ',
        tamil: 'மதியம் 2-4 மணி',
        telugu: 'మధ్యాహ్నం 2-4 గంటలు'
      },
      slot5: { 
        en: '4PM-6PM', 
        hi: 'शाम 4-6 बजे',
        bangla: 'বিকেল 4-6টা',
        kannada: 'ಸಂಜೆ 4-6',
        punjabi: 'ਸ਼ਾਮ 4-6 ਵਜੇ',
        tamil: 'மாலை 4-6 மணி',
        telugu: 'సాయంత్రం 4-6 గంటలు'
      },
      slot6: { 
        en: '6PM-8PM', 
        hi: 'शाम 6-8 बजे',
        bangla: 'সন্ধ্যা 6-8টা',
        kannada: 'ಸಂಜೆ 6-8',
        punjabi: 'ਸ਼ਾਮ 6-8 ਵਜੇ',
        tamil: 'மாலை 6-8 மணி',
        telugu: 'సాయంత్రం 6-8 గంటలు'
      }
    },
    success: { 
      en: 'Puja guidance booking submitted successfully!', 
      hi: 'पूजा मार्गदर्शन बुकिंग सफलतापूर्वक जमा हो गई!',
      bangla: 'পুজো নির্দেশনা বুকিং সফলভাবে জমা হয়েছে!',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਬੁਕਿੰਗ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ ਹੋ ਗਈ!',
      tamil: 'பூஜை வழிகாட்டுதல் புக்கிங் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      telugu: 'పూజ మార్గదర్శన బుకింగ్ విజయవంతంగా సమర్పించబడింది!'
    },
    error: { 
      en: 'Error submitting booking. Please try again.', 
      hi: 'बुकिंग जमा करने में त्रुटि। कृपया पुनः प्रयास करें।',
      bangla: 'বুকিং জমা করার সময় ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      kannada: 'ಬುಕಿಂಗ್ ಸಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਬੁਕਿੰਗ ਜਮ੍ਹਾ ਕਰਨ ਵਿੱਚ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'புக்கிங் சமர்ப்பிப்பதில் பிழை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      telugu: 'బుకింగ్ సమర్పించడంలో లోపం। దయచేసి మళ్లీ ప్రయత్నించండి।'
    },
    instructionText: { 
      en: 'Click on any provider to book puja guidance services', 
      hi: 'पूजा मार्गदर्शन सेवाओं के लिए किसी भी प्रदाता पर क्लिक करें',
      bangla: 'পুজো নির্দেশনা সেবার জন্য যেকোনো প্রদানকারীর উপর ক্লিক করুন',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಸೇವೆಗಳಿಗಾಗಿ ಯಾವುದೇ ಒದಗಿಸುವವರ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
      punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਸੇਵਾਵਾਂ ਲਈ ਕਿਸੇ ਵੀ ਪ੍ਰਦਾਤਾ \'ਤੇ ਕਲਿਕ ਕਰੋ',
      tamil: 'பூஜை வழிகாட்டுதல் சேவைகளுக்கு எந்தவொரு வழங்குநர் மீதும் கிளிக் செய்யுங்கள்',
      telugu: 'పూజ మార్గదర్శన సేవల కోసం ఏదైనా అందించేవారిపై క్లిక్ చేయండి'
    },
    bookAppointment: { 
      en: 'Book Appointment', 
      hi: 'अपॉइंटमेंट बुक करें',
      bangla: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      kannada: 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
      punjabi: 'ਅਪੌਇੰਟਮੈਂਟ ਬੁਕ ਕਰੋ',
      tamil: 'அப்பாயின்ட்மென்ட் புக்கிங்',
      telugu: 'అపాయింట్మెంట్ బుక్ చేయండి'
    },
    bookingFormTitle: { 
      en: 'Book Appointment', 
      hi: 'अपॉइंटमेंट बुक करें',
      bangla: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      kannada: 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
      punjabi: 'ਅਪੌਇੰਟਮੈਂਟ ਬੁਕ ਕਰੋ',
      tamil: 'அப்பாயின்ட்மென்ட் புக்கிங்',
      telugu: 'అపాయింట్మెంట్ బుక్ చేయండి'
    },
    thankYouText: { 
      en: 'Thank you for your interest in our Puja Guidance Services, please fill in the following details for us to contact you for booking', 
      hi: 'हमारी पूजा मार्गदर्शन सेवाओं में आपकी रुचि के लिए धन्यवाद, कृपया बुकिंग के लिए हमसे संपर्क करने के लिए निम्नलिखित विवरण भरें',
      bangla: 'আমাদের পুজো নির্দেশনা সেবায় আগ্রহের জন্য ধন্যবাদ, অনুগ্রহ করে বুকিংয়ের জন্য আমাদের সাথে যোগাযোগের জন্য নিম্নলিখিত বিবরণ পূরণ করুন',
      kannada: 'ನಮ್ಮ ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಸೇವೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಆಸಕ್ತಿಗೆ ಧನ್ಯವಾದಗಳು, ಬುಕಿಂಗ್ ಗಾಗಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ',
      punjabi: 'ਸਾਡੀਆਂ ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਸੇਵਾਵਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਦਿਲਚਸਪੀ ਲਈ ਧੰਨਵਾਦ, ਕਿਰਪਾ ਕਰਕੇ ਬੁਕਿੰਗ ਲਈ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਵੇਰਵੇ ਭਰੋ',
      tamil: 'எங்கள் பூஜை வழிகாட்டுதல் சேவைகளில் உங்கள் ஆர்வத்திற்கு நன்றி, புக்கிங் செய்ய நாங்கள் உங்களைத் தொடர்புகொள்வதற்கு தயவுசெய்து பின்வரும் விவரங்களை நிரப்பவும்',
      telugu: 'మా పూజ మార్గదర్శన సేవలలో మీ ఆసక్తికి ధన్యవాదాలు, బుకింగ్ కోసం మేము మీతో సంప్రదించడానికి దయచేసి క్రింది వివరాలను నింపండి'
    },
    nameField: { 
      en: 'Name', 
      hi: 'नाम',
      bangla: 'নাম',
      kannada: 'ಹೆಸರು',
      punjabi: 'ਨਾਮ',
      tamil: 'பெயர்',
      telugu: 'పేరు'
    },
    enterFullName: { 
      en: 'Enter your full name', 
      hi: 'अपना पूरा नाम दर्ज करें',
      bangla: 'আপনার পুরো নাম লিখুন',
      kannada: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் முழு பெயரை உள்ளிடவும்',
      telugu: 'మీ పూర్తి పేరును నమోదు చేయండి'
    },
    pujaGuidanceServices: { 
      en: 'Puja Guidance Services', 
      hi: 'पूजा मार्गदर्शन सेवाएं',
      bangla: 'পুজো নির্দেশনা সেবা',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನ ಸೇವೆಗಳು',
      punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਸੇਵਾਵਾਂ',
      tamil: 'பூஜை வழிகாட்டுதல் சேவைகள்',
      telugu: 'పూజ మార్గదర్శన సేవలు'
    },
    aboutPujaGuidance: { 
      en: 'About Puja Guidance', 
      hi: 'पूजा मार्गदर्शन के बारे में',
      bangla: 'পুজো নির্দেশনা সম্পর্কে',
      kannada: 'ಪೂಜಾ ಮಾರ್ಗದರ್ಶನದ ಬಗ್ಗೆ',
      punjabi: 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ ਬਾਰੇ',
      tamil: 'பூஜை வழிகாட்டுதல் பற்றி',
      telugu: 'పూజ మార్గదర్శన గురించి'
    },
    pujaGuidanceInfo: { 
      en: 'If you need guidance with any Puja you want to do at home, please book an appointment and our expert Pandit Ji will provide you detailed guidance including Samagri, Puja setup and how to do Puja yourself.', 
      hi: 'यदि आपको घर पर करने वाली किसी भी पूजा के लिए मार्गदर्शन की आवश्यकता है, तो कृपया एक अपॉइंटमेंट बुক करें और हमारे विशेषज्ञ पंडित जी आपको सामग्री, पूजा सेटअप और पूजा कैसे करें सहित विस্তृत मार्गदर्शन प्रदान करेंगे।',
      bangla: 'আপনি যদি বাড়িতে যে কোন পুজো করার জন্য নির্দেশনার প্রয়োজন হয়, অনুগ্রহ করে একটি অ্যাপয়েন্টমেন্ট বুক করুন এবং আমাদের বিশেষজ্ঞ পন্ডিত জি আপনাকে সামগ্রী, পুজো সেটআপ এবং কীভাবে নিজে পুজো করতে হবে তার বিস্তারিত নির্দেশনা প্রদান করবেন।',
      kannada: 'ನೀವು ಮನೆಯಲ್ಲಿ ಮಾಡಲು ಬಯಸುವ ಯಾವುದೇ ಪೂಜೆಗೆ ಮಾರ್ಗದರ್ಶನದ ಅಗತ್ಯವಿದ್ದರೆ, ದಯವಿಟ್ಟು ಒಂದು ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ ತಜ್ಞ ಪಂಡಿತ ಜಿ ನಿಮಗೆ ಸಾಮಗ್ರಿ, ಪೂಜಾ ಸೆಟಪ್ ಮತ್ತು ಪೂಜೆಯನ್ನು ಹೇಗೆ ಮಾಡಬೇಕು ಎಂಬುದರ ಸಹಿತ ವಿವರವಾದ ಮಾರ್ಗದರ್ಶನವನ್ನು ಒದಗಿಸುತ್ತಾರೆ।',
      punjabi: 'ਜੇਕਰ ਤੁਹਾਨੂੰ ਘਰ ਵਿੱਚ ਕਰਨ ਵਾਲੀ ਕਿਸੇ ਵੀ ਪੂਜਾ ਲਈ ਮਾਰਗਦਰਸ਼ਨ ਦੀ ਲੋੜ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਅਪੌਇੰਟਮੈਂਟ ਬੁਕ ਕਰੋ ਅਤੇ ਸਾਡੇ ਮਾਹਿਰ ਪੰਡਿਤ ਜੀ ਤੁਹਾਨੂੰ ਸਾਮਗਰੀ, ਪੂਜਾ ਸੈੱਟਅੱਪ ਅਤੇ ਪੂਜਾ ਕਿਵੇਂ ਕਰਨੀ ਹੈ ਸਹਿਤ ਵਿਸਤ੍ਰਿਤ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਨਗੇ।',
      tamil: 'நீங்கள் வீட்டில் செய்ய விரும்பும் எந்த பூஜைக்கும் வழிகாட்டுதல் தேவைப்பட்டால், தயவுசெய்து ஒரு அப்பாயின்ட்மென்ட் புக்கிங் செய்யுங்கள் மற்றும் எங்கள் நிபுணர் பண்டித ஜி உங்களுக்கு சாமகிரி, பூஜை அமைப்பு மற்றும் பூஜையை எப்படி செய்வது என்பதை உட்பட விரிவான வழிகாட்டுதலை வழங்குவார்।',
      telugu: 'మీరు ఇంట్లో చేయాలనుకునే ఏదైనా పూజకు మార్గదర్శన అవసరమైతే, దయచేసి ఒక అపాయింట్మెంట్ బుక్ చేయండి మరియు మా నిపుణుడు పండిత జి మీకు సామగ్రి, పూజ సెటప్ మరియు పూజను ఎలా చేయాలో సహా వివరణాత్మక మార్గదర్శనను అందిస్తారు।'
    }
  };

  // Fetch providers from API
  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const apiUrl = getEndpointUrl('PROVIDERS') + '/vastu';
      const headers = getAuthHeaders();
      
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
      });
      
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
      if (data.success) {
        setProviders(data.providers || []);
      } else {
        throw new Error(`API error: ${data.error}`);
      }
    } catch (error: any) {
      // Don't set any providers - let the UI show the error state
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Load providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Show provider details
  const showProviderDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  // Show booking modal
  const openBookingModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  // Validate date is at least 18 hours in future
  const isValidFutureDate = (dateString: string) => {
    const selectedDate = new Date(dateString);
    const now = new Date();
    const minDate = new Date(now.getTime() + (18 * 60 * 60 * 1000)); // 18 hours from now
    return selectedDate >= minDate;
  };

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setBookingDate(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Submit booking
  const submitBooking = async () => {
    if (!selectedProvider) return;
    
    // Validation
    if (bookingName.trim().length < 3) {
      Alert.alert(getTranslation({en: 'Invalid Name', hi: 'अमान्य नाम', bangla: 'অবৈধ নাম', kannada: 'ಅಮಾನ್ಯ ಹೆಸರು', punjabi: 'ਗਲਤ ਨਾਮ', tamil: 'தவறான பெயர்', telugu: 'చెల్లని పేరు'}), getTranslation({en: 'Name must be at least 3 characters long.', hi: 'नाम कम से कम 3 अक्षर का होना चाहिए।', bangla: 'নাম কমপক্ষে 3 অক্ষরের হতে হবে।', kannada: 'ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು ಇರಬೇಕು।', punjabi: 'ਨਾਮ ਘੱਟੋ-ਘੱਟ 3 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।', tamil: 'பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்।', telugu: 'పేరు కనీసం 3 అక్షరాలు ఉండాలి।'}));
      return;
    }
    
    if (!bookingPhone || bookingPhone.length < 10) {
      Alert.alert(getTranslation({en: 'Invalid Phone', hi: 'अमान्य फोन', bangla: 'অবৈধ ফোন', kannada: 'ಅಮಾನ್ಯ ಫೋನ್', punjabi: 'ਗਲਤ ਫੋਨ', tamil: 'தவறான தொலைபேசி', telugu: 'చెల్లని ఫోన్'}), getTranslation({en: 'Please enter a valid phone number.', hi: 'कृपया एक वैध फोन नंबर दर्ज करें।', bangla: 'অনুগ্রহ করে একটি বৈধ ফোন নম্বর লিখুন।', kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ।', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।', tamil: 'தயவுசெய்து சரியான தொலைபேசி எண்ணை உள்ளிடவும்।', telugu: 'దయచేసి చెల్లుబాటు అయ్యే ఫోన్ నంబర్ నమోదు చేయండి।'}));
      return;
    }
    
    if (!bookingDate) {
      Alert.alert(getTranslation({en: 'Invalid Date', hi: 'अमान्य तारीख', bangla: 'অবৈধ তারিখ', kannada: 'ಅಮಾನ್ಯ ದಿನಾಂಕ', punjabi: 'ਗਲਤ ਤਾਰੀਖ', tamil: 'தவறான தேதி', telugu: 'చెల్లని తేదీ'}), getTranslation({en: 'Please select a preferred date.', hi: 'कृपया एक पसंदीदा तारीख चुनें।', bangla: 'অনুগ্রহ করে একটি পছন্দের তারিখ নির্বাচন করুন।', kannada: 'ದಯವಿಟ್ಟು ಒಂದು ಅಭಿಮತ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ।', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਤਾਰੀਖ ਚੁਣੋ।', tamil: 'தயவுசெய்து ஒரு விருப்பமான தேதியைத் தேர்ந்தெடுக்கவும்।', telugu: 'దయచేసి ఒక అభిమత తేదీని ఎంచుకోండి।'}));
      return;
    }
    
    if (!isValidFutureDate(bookingDate)) {
      Alert.alert(getTranslation({en: 'Invalid Date', hi: 'अमान्य तारीख', bangla: 'অবৈধ তারিখ', kannada: 'ಅಮಾನ್ಯ ದಿನಾಂಕ', punjabi: 'ਗਲਤ ਤਾਰੀਖ', tamil: 'தவறான தேதி', telugu: 'చెల్లని తేదీ'}), getTranslation({en: 'Please select a date at least 18 hours in the future.', hi: 'कृपया भविष्य में कम से कम 18 घंटे की तारीख चुनें।', bangla: 'অনুগ্রহ করে ভবিষ্যতে কমপক্ষে 18 ঘন্টা আগের তারিখ নির্বাচন করুন।', kannada: 'ದಯವಿಟ್ಟು ಭವಿಷ್ಯದಲ್ಲಿ ಕನಿಷ್ಠ 18 ಗಂಟೆಗಳ ನಂತರದ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ।', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਭਵਿੱਖ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 18 ਘੰਟਿਆਂ ਬਾਅਦ ਦੀ ਤਾਰੀਖ ਚੁਣੋ।', tamil: 'தயவுசெய்து எதிர்காலத்தில் குறைந்தது 18 மணிநேரம் முன்னதாக தேதியைத் தேர்ந்தெடுக்கவும்।', telugu: 'దయచేసి భవిష్యత్తులో కనీసం 18 గంటల తర్వాత తేదీని ఎంచుకోండి।'}));
      return;
    }
    
    if (!bookingTimeSlot) {
      Alert.alert(getTranslation({en: 'Invalid Time', hi: 'अमान्य समय', bangla: 'অবৈধ সময়', kannada: 'ಅಮಾನ್ಯ ಸಮಯ', punjabi: 'ਗਲਤ ਸਮਾਂ', tamil: 'தவறான நேரம்', telugu: 'చెల్లని సమయం'}), getTranslation({en: 'Please select a preferred time slot.', hi: 'कृपया एक पसंदीदा समय स्लॉट चुनें।', bangla: 'অনুগ্রহ করে একটি পছন্দের সময় স্লট নির্বাচন করুন।', kannada: 'ದಯವಿಟ್ಟು ಒಂದು ಅಭಿಮತ ಸಮಯ ಸ್ಲಾಟ್ ಆಯ್ಕೆ ಮಾಡಿ।', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ।', tamil: 'தயவுசெய்து ஒரு விருப்பமான நேர இடைவெளியைத் தேர்ந்தெடுக்கவும்।', telugu: 'దయచేసి ఒక అభిమత సమయ స్లాట్ ఎంచుకోండి।'}));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestBody = {
        name: bookingName.trim(),
        phone: bookingPhone, // Send as string, let backend handle conversion
        serviceType: 'pujaGuidance',
        providerId: selectedProvider.providerId,
        dateTimeToContact: new Date(bookingDate).toISOString(),
        timeslotToContact: bookingTimeSlot,
      };
      
      
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(requestBody),
      });
      
      
      const responseText = await response.text();
      
      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
        }
        
        
        Alert.alert(
          'Booking Successful!',
          'Your appointment has been booked. We will contact you soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowBookingModal(false);
                setBookingName('');
                setBookingPhone('');
                setBookingDate('');
                setBookingTimeSlot('');
                setSelectedDate(new Date());
              },
            },
          ]
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert(getTranslation({en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం'}), getTranslation(translations.error));
    } finally {
      setIsSubmitting(false);
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
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.providersSection}>
                         <View style={styles.titleContainer}>
               <Text style={styles.sectionTitle}>{getTranslation(translations.pujaGuidanceServices)}</Text>
               <TouchableOpacity 
                 style={styles.infoIcon}
                 onPress={() => setShowInfoModal(true)}
               >
                 <Text style={styles.infoIconText}>ℹ️</Text>
               </TouchableOpacity>
             </View>
            <Text style={styles.instructionText}>{getTranslation(translations.instructionText)}</Text>
        
        {loadingProviders ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA040" />
            <Text style={styles.loadingText}>{getTranslation(translations.loading)}</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.noProvidersContainer}>
            <Text style={styles.noProvidersText}>{getTranslation(translations.noDataFound)}</Text>
            <Text style={styles.debugText}>Debug: Loading state: {loadingProviders.toString()}</Text>
            <Text style={styles.debugText}>Debug: Providers count: {providers.length}</Text>
            <Text style={styles.debugText}>Debug: API URL: {getEndpointUrl('PROVIDERS') + '/vastu'}</Text>
          </View>
        ) : (
          <View style={styles.providersGrid}>
            {providers.map((provider) => (
              <View key={provider.providerId} style={styles.providerCard}>
                <TouchableOpacity
                  style={styles.providerCardHeader}
                  onPress={() => setExpandedProvider(expandedProvider === provider.providerId ? null : provider.providerId)}
                >
                  <View style={styles.providerCardContent}>
                    {/* Left side - Image/Icon */}
                    <View style={styles.providerImageContainer}>
                      {provider.imageUrl ? (
                        <Image 
                          source={{ uri: provider.imageUrl }} 
                          style={styles.providerImage}
                          resizeMode="cover"
                          onError={() => {
                          }}
                        />
                      ) : null}
                      {/* Fallback placeholder - will show if image fails or no presigned URL */}
                      <View style={[styles.providerPlaceholder, { position: 'absolute', zIndex: -1 }]}>
                        <Text style={styles.providerPlaceholderText}>
                          {provider.firstName?.charAt(0) || 'P'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Right side - Content */}
                    <View style={styles.providerContent}>
                      {/* Title: Name */}
                      <Text style={styles.providerName}>
                        {provider.Salutation} {provider.firstName} {provider.lastName}
                      </Text>
                      
                      {/* Services Icons */}
                      <View style={styles.providerServices}>
                        {provider.kundli && <Text style={styles.serviceTag}>Kundli</Text>}
                        {provider.astrology && <Text style={styles.serviceTag}>Astrology</Text>}
                        {provider.vastu && <Text style={styles.serviceTag}>Vastu</Text>}
                        {provider.numerology && <Text style={styles.serviceTag}>Numerology</Text>}
                      </View>
                      
                      {/* Areas Served */}
                      {provider.areasServiced && provider.areasServiced.length > 0 && (
                        <View style={styles.areasServedContainer}>
                          <Text style={styles.areasServedLabel}>Areas served:</Text>
                          <Text style={styles.areasServedText}>
                            {provider.areasServiced.map((area: any) => area.city || area).join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Expanded Details */}
                {expandedProvider === provider.providerId && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.providerDetailRow}>
                      <Text style={styles.detailLabel}>📍 Location:</Text>
                      <Text style={styles.detailValue}>{provider.city}, {provider.state}, {provider.country}</Text>
                    </View>
                    
                    {provider.aboutProvider && (
                      <View style={styles.providerDetailRow}>
                        <Text style={styles.detailLabel}>ℹ️ About:</Text>
                        <Text style={styles.detailValue}>{provider.aboutProvider}</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => openBookingModal(provider)}
                    >
                      <Text style={styles.bookButtonText}>{getTranslation(translations.bookAppointment)}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Provider Details Modal */}
      <Modal
        visible={showProviderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProvider && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Provider Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowProviderModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.providerDetailContent}>
                  <View style={styles.providerDetailImageContainer}>
                    {selectedProvider.imageUrl ? (
                      <Image 
                        source={{ uri: selectedProvider.imageUrl }} 
                        style={styles.providerDetailImage}
                        resizeMode="cover"
                        onError={() => {
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder for modal */}
                    <View style={[styles.providerDetailPlaceholder, { position: 'absolute', zIndex: -1 }]}>
                      <Text style={styles.providerDetailPlaceholderText}>
                        {selectedProvider.firstName?.charAt(0) || 'P'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.providerDetailName}>
                    {selectedProvider.Salutation} {selectedProvider.firstName} {selectedProvider.lastName}
                  </Text>
                  
                  <Text style={styles.providerDetailLocation}>
                    📍 {selectedProvider.city}, {selectedProvider.state}, {selectedProvider.country}
                  </Text>
                  
                  {selectedProvider.phoneNumber && (
                    <Text style={styles.providerDetailContact}>
                      📞 {selectedProvider.phoneNumber}
                    </Text>
                  )}
                  
                  {selectedProvider.email && (
                    <Text style={styles.providerDetailContact}>
                      ✉️ {selectedProvider.email}
                    </Text>
                  )}
                  
                  <View style={styles.providerDetailServices}>
                    <Text style={styles.servicesTitle}>Services Offered:</Text>
                    <View style={styles.servicesList}>
                      {selectedProvider.kundli && <Text style={styles.serviceDetailTag}>🔮 Kundli</Text>}
                      {selectedProvider.astrology && <Text style={styles.serviceDetailTag}>⭐ Astrology</Text>}
                      {selectedProvider.vastu && <Text style={styles.serviceDetailTag}>🏠 Vastu</Text>}
                      {selectedProvider.numerology && <Text style={styles.serviceDetailTag}>🔢 Numerology</Text>}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      Alert.alert('Contact', `Contact ${selectedProvider.firstName} at ${selectedProvider.phoneNumber || selectedProvider.email}`);
                    }}
                  >
                    <Text style={styles.contactButtonText}>Contact Provider</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProvider && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{getTranslation(translations.bookingFormTitle)}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowBookingModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.bookingContent} contentContainerStyle={styles.bookingContentContainer} showsVerticalScrollIndicator={false}>
                  <Text style={styles.bookingWelcomeText}>
                    {getTranslation(translations.thankYouText)}
                  </Text>
                  
                  <Text style={styles.bookingProviderName}>
                    {selectedProvider.Salutation} {selectedProvider.firstName} {selectedProvider.lastName}
                  </Text>
                  
                  <View style={styles.bookingForm}>
                    <Text style={styles.formLabel}>{getTranslation(translations.nameField)} *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={bookingName}
                      onChangeText={setBookingName}
                      placeholder={getTranslation(translations.enterFullName)}
                      placeholderTextColor="#999"
                    />
                    
                    <Text style={styles.formLabel}>{getTranslation(translations.bookingForm.phone)} *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={bookingPhone}
                      onChangeText={setBookingPhone}
                      placeholder={getTranslation({en: "Enter your phone number", hi: "अपना फोन नंबर दर्ज करें", bangla: "আপনার ফোন নম্বর লিখুন", kannada: "ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ", punjabi: "ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ", tamil: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்", telugu: "మీ ఫోన్ నంబర్ నమోదు చేయండి"})}
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />
                    
                    <Text style={styles.formLabel}>{getTranslation(translations.bookingForm.date)} *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={showDatePickerModal}
                    >
                      <Text style={styles.datePickerButtonText}>
                        {bookingDate ? bookingDate : getTranslation({en: 'Select Date', hi: 'तारीख चुनें', bangla: 'তারিখ নির্বাচন করুন', kannada: 'ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ', punjabi: 'ਤਾਰੀਖ ਚੁਣੋ', tamil: 'தேதியைத் தேர்ந்தெடுக்கவும்', telugu: 'తేదీని ఎంచుకోండి'})}
                      </Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.formLabel}>{getTranslation(translations.bookingForm.timeSlot)} *</Text>
                    <View style={styles.timeSlotContainer}>
                      {timeSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.timeSlotButton,
                            bookingTimeSlot === slot && styles.timeSlotButtonSelected
                          ]}
                          onPress={() => setBookingTimeSlot(slot)}
                        >
                          <Text style={[
                            styles.timeSlotButtonText,
                            bookingTimeSlot === slot && styles.timeSlotButtonTextSelected
                          ]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                      onPress={submitBooking}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.submitButtonText}>
                        {isSubmitting ? getTranslation({en: 'Booking...', hi: 'बुकिंग...', bangla: 'বুকিং হচ্ছে...', kannada: 'ಬುಕಿಂಗ್ ಆಗುತ್ತಿದೆ...', punjabi: 'ਬੁਕਿੰਗ ਹੋ ਰਿਹਾ ਹੈ...', tamil: 'புக்கிங் செய்யப்படுகிறது...', telugu: 'బుకింగ్ అవుతోంది...'}) : getTranslation(translations.bookingForm.submit)}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* 300px white space at the end */}
                    <View style={styles.modalBottomSpacing} />
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date(Date.now() + 18 * 60 * 60 * 1000)} // 18 hours from now
                 />
       )}
       
               {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowInfoModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{getTranslation(translations.aboutPujaGuidance)}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowInfoModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  {getTranslation(translations.pujaGuidanceInfo)}
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
         </ScrollView>
      </View>
    </View>
  );
};

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
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  // Provider styles
  providersSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
     titleContainer: {
     flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
     marginBottom: 20,
  },
       sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
      color: '#FFA040',
      textAlign: 'center',
    },
   infoIcon: {
     marginLeft: 10,
     padding: 5,
   },
   infoIconText: {
     fontSize: 20,
     color: '#FFA040',
   },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noProvidersContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noProvidersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  providersGrid: {
    flexDirection: 'column',
    gap: 15,
  },
  providerCard: {
    width: screenWidth - 40, // Full width minus margins
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 15,
  },
  providerCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-start',
  },
  providerImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  providerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  providerPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerPlaceholderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  providerInfo: {
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  providerLocation: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 5,
    marginBottom: 8,
  },
  serviceTag: {
    fontSize: 10,
    backgroundColor: '#FFA040',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  areasServedContainer: {
    marginTop: 8,
  },
  areasServedLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
  },
  areasServedText: {
    fontSize: 11,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
     modalTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#FFA040',
   },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  providerDetailContent: {
    alignItems: 'center',
  },
  providerDetailImageContainer: {
    marginBottom: 15,
  },
  providerDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  providerDetailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerDetailPlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  providerDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  providerDetailLocation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerDetailContact: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerDetailServices: {
    marginTop: 15,
    alignItems: 'center',
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  serviceDetailTag: {
    fontSize: 12,
    backgroundColor: '#FFA040',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  contactButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Booking modal styles
  bookingContent: {
    // ScrollView container styles
  },
  bookingContentContainer: {
    alignItems: 'center',
  },
  bookingProviderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookingForm: {
    width: '100%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Expanded provider details styles
  providerCardHeader: {
    width: '100%',
  },
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 15,
  },
  providerDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Additional booking modal styles
  bookingWelcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  timeSlotButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  timeSlotButtonSelected: {
    borderColor: '#FFA040',
    backgroundColor: '#FFA040',
  },
  timeSlotButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Date picker styles
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
     datePickerButtonText: {
     fontSize: 16,
     color: '#333',
     textAlign: 'left',
   },
   infoContent: {
     alignItems: 'center',
     paddingHorizontal: 10,
   },
   infoText: {
     fontSize: 16,
     color: '#333',
     textAlign: 'center',
     lineHeight: 24,
  },
  modalBottomSpacing: {
    height: 300,
  },
}); 

export default PujaGuidanceScreen; 