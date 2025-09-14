import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useLanguage } from '@/contexts/LanguageContext';

const deityList = [
  'Lord Agni',
  'Lord Brahma',
  'Lord Ganesha',
  'Lord Hanuman',
  'Lord Indra',
  'Lord Krishna',
  'Lord Rama',
  'Lord Shiva',
  'Lord Skanda (also known as Kartikeya or Murugan)',
  'Lord Vishnu',
  'Khatu Shyam Ji',
  'Goddess Durga',
  'Goddess Kali',
  'Goddess Lakshmi',
  'Goddess Parvati',
  'Goddess Saraswati',
];

const timeSlots = [
  '8:00-10:00 AM', '10:00-12:00 PM', '12:00-2:00 PM', '2:00-4:00 PM',
  '4:00-6:00 PM', '6:00-8:00 PM', '8:00-10:00 PM'
];

interface PujaData {
  createdAt?: string;
  pujaId?: string;
  pujaName?: string;
  mainDeity?: string;
  purpose?: string;
  days?: number;
  hours?: number;
  price?: number;
  details?: string;
}

function extractYouTubeId(url: string): string | null {
  let videoId: string | null = null;
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  const embedMatch = url.match(/embed\/([\w-]+)/);
  if (embedMatch) videoId = embedMatch[1];
  return videoId;
}

// Helper function to safely convert any value to string
function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  // Handle ObjectId and other complex types
  if (value && typeof value === 'object') {
    if (value.toString) return value.toString();
    return JSON.stringify(value);
  }
  return String(value);
}

export const options = { headerShown: false };

export default function ProfessionalPujaScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [currentPuja, setCurrentPuja] = useState<PujaData | null>(null);
  const [pujaFiles, setPujaFiles] = useState<PujaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [deityDropdownOpen, setDeityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('8:00-10:00 AM');

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
      en: 'Search professional pujas...', 
      hi: 'पेशेवर पूजाओं की खोज करें...',
      bangla: 'পেশাদার পুজো খুঁজুন...',
      kannada: 'ವೃತ್ತಿಪರ ಪೂಜೆಗಳನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਪੇਸ਼ੇਵਰ ਪੂਜਾਵਾਂ ਖੋਜੋ...',
      tamil: 'தொழில்முறை பூஜைகளைத் தேடுங்கள்...',
      telugu: 'వృత్తిపరమైన పూజలను వెతకండి...'
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
      en: 'No professional pujas found.', 
      hi: 'कोई पेशेवर पूजा नहीं मिली।',
      bangla: 'কোনো পেশাদার পুজো পাওয়া যায়নি।',
      kannada: 'ವೃತ್ತಿಪರ ಪೂಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ।',
      punjabi: 'ਕੋਈ ਪੇਸ਼ੇਵਰ ਪੂਜਾ ਨਹੀਂ ਮਿਲੀ।',
      tamil: 'தொழில்முறை பூஜைகள் கிடைக்கவில்லை।',
      telugu: 'వృత్తిపరమైన పూజలు కనుగొనబడలేదు।'
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
        en: 'Book Professional Puja', 
        hi: 'पेशेवर पूजा बुक करें',
        bangla: 'পেশাদার পুজো বুক করুন',
        kannada: 'ವೃತ್ತಿಪರ ಪೂಜೆ ಬುಕ್ ಮಾಡಿ',
        punjabi: 'ਪੇਸ਼ੇਵਰ ਪੂਜਾ ਬੁਕ ਕਰੋ',
        tamil: 'தொழில்முறை பூஜை புக்கிங்',
        telugu: 'వృత్తిపరమైన పూజ బుక్ చేయండి'
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
        en: 'Book Puja', 
        hi: 'पूजा बुक करें',
        bangla: 'পুজো বুক করুন',
        kannada: 'ಪೂಜೆ ಬುಕ್ ಮಾಡಿ',
        punjabi: 'ਪੂਜਾ ਬੁਕ ਕਰੋ',
        tamil: 'பூஜை புக்கிங்',
        telugu: 'పూజ బుక్ చేయండి'
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
      slot1: { en: '8:00-10:00 AM', hi: 'सुबह 8:00-10:00' },
      slot2: { en: '10:00-12:00 PM', hi: 'सुबह 10:00-दोपहर 12:00' },
      slot3: { en: '12:00-2:00 PM', hi: 'दोपहर 12:00-2:00' },
      slot4: { en: '2:00-4:00 PM', hi: 'दोपहर 2:00-4:00' },
      slot5: { en: '4:00-6:00 PM', hi: 'शाम 4:00-6:00' },
      slot6: { en: '6:00-8:00 PM', hi: 'शाम 6:00-8:00' },
      slot7: { en: '8:00-10:00 PM', hi: 'रात 8:00-10:00' }
    },
    success: { 
      en: 'Professional puja booking submitted successfully!', 
      hi: 'पेशेवर पूजा बुकिंग सफलतापूर्वक जमा हो गई!',
      bangla: 'পেশাদার পুজো বুকিং সফলভাবে জমা হয়েছে!',
      kannada: 'ವೃತ್ತಿಪರ ಪೂಜಾ ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਪੇਸ਼ੇਵਰ ਪੂਜਾ ਬੁਕਿੰਗ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ ਹੋ ਗਈ!',
      tamil: 'தொழில்முறை பூஜை புக்கிங் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      telugu: 'వృత్తిపరమైన పూజ బుకింగ్ విజయవంతంగా సమర్పించబడింది!'
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
    pujaLibrary: { 
      en: 'Puja Library', 
      hi: 'पूजा लाइब्रेरी',
      bangla: 'পুজো লাইব্রেরি',
      kannada: 'ಪೂಜಾ ಗ್ರಂಥಾಲಯ',
      punjabi: 'ਪੂਜਾ ਲਾਇਬ੍ਰੇਰੀ',
      tamil: 'பூஜை நூலகம்',
      telugu: 'పూజ లైబ్రరీ'
    },
    deity: { 
      en: 'Deity', 
      hi: 'देवता',
      bangla: 'দেবতা',
      kannada: 'ದೇವತೆ',
      punjabi: 'ਦੇਵਤਾ',
      tamil: 'தெய்வம்',
      telugu: 'దేవుడు'
    },
    mainDeity: { 
      en: 'Main Deity', 
      hi: 'मुख्य देवता',
      bangla: 'প্রধান দেবতা',
      kannada: 'ಮುಖ್ಯ ದೇವತೆ',
      punjabi: 'ਮੁੱਖ ਦੇਵਤਾ',
      tamil: 'முதன்மை தெய்வம்',
      telugu: 'ప్రధాన దేవుడు'
    }
  };

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await axios.get(getEndpointUrl('PROFESSIONAL_PUJAS'), {
          headers: getAuthHeaders()
        });
        // Filter out any items with null/undefined values that might cause rendering issues
        const filteredData = res.data.filter((puja: any) => puja && typeof puja === 'object');
        setPujaFiles(filteredData);
      } catch (e) {
        Alert.alert(
          getTranslation({en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం'}),
          getTranslation({en: 'Failed to fetch professional pujas', hi: 'पेशेवर पूजाओं को प्राप्त करने में विफल', bangla: 'পেশাদার পুজো আনতে ব্যর্থ', kannada: 'ವೃತ್ತಿಪರ ಪೂಜೆಗಳನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ', punjabi: 'ਪੇਸ਼ੇਵਰ ਪੂਜਾਵਾਂ ਲਿਆਉਣ ਵਿੱਚ ਅਸਫਲ', tamil: 'தொழில்முறை பூஜைகளைப் பெற முடியவில்லை', telugu: 'వృత్తిపరమైన పూజలను పొందడంలో విఫలమైంది'})
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);



  const handlePlay = (puja: PujaData) => {
    // Validate puja object before setting
    if (!puja || typeof puja !== 'object') {
      return;
    }
    
    setCurrentPuja(puja);
    setModalVisible(true);
    // Note: No Link field in Supabase data, so removing YouTube functionality
    // if (puja.Link && (puja.Link.includes('youtube.com') || puja.Link.includes('youtu.be'))) {
    //   setYoutubePlaying(true);
    // }
  };

  const handleBookPuja = () => {
    setModalVisible(false);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!name.trim() || phone.length < 7) {
      Alert.alert(
        getTranslation({en: 'Invalid Input', hi: 'अमान्य इनपुट', bangla: 'অবৈধ ইনপুট', kannada: 'ಅಮಾನ್ಯ ಇನ್ಪುಟ್', punjabi: 'ਗਲਤ ਇਨਪੁੱਟ', tamil: 'தவறான உள்ளீடு', telugu: 'చెల్లని ఇన్పుట్'}),
        getTranslation({en: 'Please enter a valid name and phone number.', hi: 'कृपया एक वैध नाम और फोन नंबर दर्ज करें।', bangla: 'অনুগ্রহ করে একটি বৈধ নাম এবং ফোন নম্বর লিখুন।', kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಹೆಸರು ಮತ್ತು ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ।', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਨਾਮ ਅਤੇ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।', tamil: 'தயவுசெய்து சரியான பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும்।', telugu: 'దయచేసి చెల్లుబాటు అయ్యే పేరు మరియు ఫోన్ నంబర్ నమోదు చేయండి।'})
      );
      return;
    }
    
    if (!currentPuja?.pujaName) {
      Alert.alert(getTranslation({en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం'}), getTranslation({en: 'No puja selected. Please try again.', hi: 'कोई पूजा चयनित नहीं। कृपया पुनः प्रयास करें।', bangla: 'কোনো পুজো নির্বাচিত হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।', kannada: 'ಯಾವುದೇ ಪೂಜೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।', punjabi: 'ਕੋਈ ਪੂਜਾ ਚੁਣੀ ਨਹੀਂ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', tamil: 'பூஜை தேர்ந்தெடுக்கப்படவில்லை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।', telugu: 'పూజ ఎంచుకోబడలేదు। దయచేసి మళ్లీ ప్రయత్నించండి।'}));
      return;
    }
    
    const bookingData = {
      name,
      phone: parseInt(phone) || phone, // Convert to number if possible
      date: date.toISOString(), // Convert Date to ISO string for backend
      slot,
      pujaName: currentPuja?.pujaName, // Send puja name instead of pujaType
      pujaId: currentPuja?.pujaId,
      price: currentPuja?.price,
    };
    
    try {
      const response = await axios.post(getEndpointUrl('PROFESSIONAL_PUJA_BOOKING'), bookingData, {
        headers: getAuthHeaders()
      });
      setBookingModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert(getTranslation({en: 'Success', hi: 'सफलता', bangla: 'সফলতা', kannada: 'ಯಶಸ್ಸು', punjabi: 'ਸਫਲਤਾ', tamil: 'வெற்றி', telugu: 'విజయం'}), getTranslation({en: 'Your puja booking request has been submitted successfully!', hi: 'आपका पूजा बुकिंग अनुरोध सफलतापूर्वक जमा हो गया!', bangla: 'আপনার পুজো বুকিং অনুরোধ সফলভাবে জমা হয়েছে!', kannada: 'ನಿಮ್ಮ ಪೂಜಾ ಬುಕಿಂಗ್ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!', punjabi: 'ਤੁਹਾਡਾ ਪੂਜਾ ਬੁਕਿੰਗ ਬੇਨਤੀ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ ਹੋ ਗਈ!', tamil: 'உங்கள் பூஜை புக்கிங் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!', telugu: 'మీ పూజ బుకింగ్ అభ్యర్థన విజయవంతంగా సమర్పించబడింది!'}));
    } catch (err: any) {
      Alert.alert(getTranslation({en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం'}), getTranslation({en: 'Failed to save booking:', hi: 'बुकिंग सहेजने में विफल:', bangla: 'বুকিং সংরক্ষণ করতে ব্যর্থ:', kannada: 'ಬುಕಿಂಗ್ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ:', punjabi: 'ਬੁਕਿੰਗ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ:', tamil: 'புக்கிங் சேமிக்க முடியவில்லை:', telugu: 'బుకింగ్ సేవ్ చేయడంలో విఫలమైంది:'}) + ` ${err.response?.data?.error || err.message}`);
    }
  };

  const iconRowAndDropdown = (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={getTranslation(translations.searchPlaceholder)}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color="#666" 
          style={styles.searchIcon}
        />
      </View>
      
      <View style={styles.deityDropdownWrapper}>
        <TouchableOpacity
          style={styles.deityDropdown}
          onPress={() => setDeityDropdownOpen(open => !open)}
        >
          <Text style={styles.deityDropdownText}>
            {selectedDeity || getTranslation(translations.deity)}
          </Text>
          <MaterialCommunityIcons
            name={deityDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
        <Modal
          visible={deityDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeityDropdownOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setDeityDropdownOpen(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <View style={styles.deityDropdownModalList}>
                <ScrollView style={{ maxHeight: 320 }}>
                  {deityList.map(deity => (
                    <TouchableOpacity
                      key={deity}
                      style={[
                        styles.deityDropdownItem,
                        selectedDeity === deity && styles.deityDropdownItemSelected
                      ]}
                      onPress={() => {
                        if (selectedDeity === deity) {
                          setSelectedDeity(null);
                        } else {
                          setSelectedDeity(deity);
                        }
                        setDeityDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.deityDropdownItemText,
                          selectedDeity === deity && styles.deityDropdownItemTextSelected
                        ]}
                      >
                        {deity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );

  // Filter pujas based on selected type and deity
  const filteredPujas = pujaFiles.filter(puja => {
    // Ensure puja is a valid object
    if (!puja || typeof puja !== 'object') {
      return false;
    }
    
    // Filter by deity
    if (selectedDeity) {
      const deity = safeString(puja.mainDeity || '');
      if (deity !== selectedDeity) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        (puja.pujaName && safeString(puja.pujaName).toLowerCase().includes(q)) ||
        (puja.details && safeString(puja.details).toLowerCase().includes(q)) ||
        (puja.mainDeity && safeString(puja.mainDeity).toLowerCase().includes(q)) ||
        (puja.purpose && safeString(puja.purpose).toLowerCase().includes(q)) ||
        (puja.days && safeString(puja.days).toLowerCase().includes(q)) ||
        (puja.hours && safeString(puja.hours).toLowerCase().includes(q)) ||
        (puja.price && safeString(puja.price).toLowerCase().includes(q))
      );
    }
    
    return true;
  });

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder={getTranslation(translations.searchPlaceholder)} extraContent={iconRowAndDropdown} showDailyPujaButton={false} showSearchBar={false} showLanguageToggle={false} />
      {/* Puja List */}
              <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
        <Text style={styles.sectionHeader}>{getTranslation(translations.pujaLibrary)}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{getTranslation(translations.loading)}</Text>
        ) : filteredPujas.length === 0 ? (
          <Text style={styles.noDataText}>
            {searchQuery.trim() || selectedDeity 
              ? getTranslation({en: 'No pujas found matching your current filters. Try adjusting your search or deity selection.', hi: 'आपके वर्तमान फिल्टर से मेल खाने वाली कोई पूजा नहीं मिली। अपनी खोज या देवता चयन को समायोजित करने का प्रयास करें।', bangla: 'আপনার বর্তমান ফিল্টারের সাথে মিলে যাওয়া কোনো পুজো পাওয়া যায়নি। আপনার অনুসন্ধান বা দেবতা নির্বাচন সামঞ্জস্য করার চেষ্টা করুন।', kannada: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್ಗಳೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಪೂಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ। ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ದೇವತೆ ಆಯ್ಕೆಯನ್ನು ಸರಿಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ।', punjabi: 'ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਫਿਲਟਰਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਕੋਈ ਵੀ ਪੂਜਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ। ਆਪਣੀ ਖੋਜ ਜਾਂ ਦੇਵਤਾ ਚੋਣ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', tamil: 'உங்கள் தற்போதைய வடிகட்டிகளுடன் பொருந்தக்கூடிய பூஜைகள் எதுவும் கிடைக்கவில்லை। உங்கள் தேடல் அல்லது தெய்வத் தேர்வை சரிசெய்ய முயற்சிக்கவும்।', telugu: 'మీ ప్రస్తుత ఫిల్టర్లతో సరిపోలే పూజలు కనుగొనబడలేదు। మీ శోధన లేదా దేవుడు ఎంపికను సరిచేయడానికి ప్రయత్నించండి।'})
              : getTranslation({en: 'No pujas found. Please check the database.', hi: 'कोई पूजा नहीं मिली। कृपया डेटाबेस जांचें।', bangla: 'কোনো পুজো পাওয়া যায়নি। অনুগ্রহ করে ডেটাবেস চেক করুন।', kannada: 'ಪೂಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ। ದಯವಿಟ್ಟು ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲಿಸಿ।', punjabi: 'ਕੋਈ ਪੂਜਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ। ਕਿਰਪਾ ਕਰਕੇ ਡੇਟਾਬੇਸ ਚੈਕ ਕਰੋ।', tamil: 'பூஜைகள் கிடைக்கவில்லை। தயவுசெய்து தரவுத்தளத்தை சரிபார்க்கவும்।', telugu: 'పూజలు కనుగొనబడలేదు। దయచేసి డేటాబేస్ తనిఖీ చేయండి।'})
            }
          </Text>
        ) : (
                     filteredPujas.map((puja, idx) => {
             // Additional safety check
             if (!puja || typeof puja !== 'object') {
               return null;
             }
            
            return (
              <TouchableOpacity
                key={puja.pujaId || idx}
                style={styles.pujaCard}
                onPress={() => handlePlay(puja)}
              >
                <View style={styles.pujaHeader}>
                  <Text style={styles.pujaName}>{safeString(puja.pujaName || getTranslation({en: 'Puja Name', hi: 'पूजा का नाम', bangla: 'পুজোর নাম', kannada: 'ಪೂಜೆಯ ಹೆಸರು', punjabi: 'ਪੂਜਾ ਦਾ ਨਾਮ', tamil: 'பூஜை பெயர்', telugu: 'పూజ పేరు'}))}</Text>
                </View>
                
                <View style={styles.pujaDetails}>
                  {puja.mainDeity && puja.mainDeity !== '' && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                      {' '}{safeString(puja.mainDeity)}
                    </Text>
                  )}
                  {puja.purpose && puja.purpose !== '' && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="target" size={16} color="#666" />
                      {' '}{safeString(puja.purpose)}
                    </Text>
                  )}
                  {typeof puja.days === 'number' && puja.days > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                      {' '}{safeString(puja.days)} days
                    </Text>
                  )}
                  {typeof puja.hours === 'number' && puja.hours > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="clock" size={16} color="#666" />
                      {' '}{safeString(puja.hours)} hours
                    </Text>
                  )}
                  {typeof puja.price === 'number' && puja.price > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="currency-inr" size={16} color="#FF6A00" />
                      {' '}₹{safeString(puja.price)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      {/* Puja Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setCurrentPuja(null);
          setYoutubePlaying(false);
        }}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
          setModalVisible(false);
          setCurrentPuja(null);
          setYoutubePlaying(false);
        }}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false);
              setCurrentPuja(null);
              setYoutubePlaying(false);
            }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
                    {currentPuja && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{safeString(currentPuja.pujaName || getTranslation({en: 'Puja Name', hi: 'पूजा का नाम', bangla: 'পুজোর নাম', kannada: 'ಪೂಜೆಯ ಹೆಸರು', punjabi: 'ਪੂਜਾ ਦਾ ਨਾਮ', tamil: 'பூஜை பெயர்', telugu: 'పూజ పేరు'}))}</Text>
              
              {currentPuja.details && currentPuja.details !== '' && (
                <Text style={styles.modalDescription}>{safeString(currentPuja.details)}</Text>
              )}
              
              {currentPuja.mainDeity && currentPuja.mainDeity !== '' && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>{getTranslation(translations.mainDeity)}: </Text>
                  {safeString(currentPuja.mainDeity)}
                </Text>
              )}
              
              {currentPuja.purpose && currentPuja.purpose !== '' && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Purpose: </Text>
                  {safeString(currentPuja.purpose)}
                </Text>
              )}
              
              {typeof currentPuja.days === 'number' && currentPuja.days > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Duration: </Text>
                  {safeString(currentPuja.days)} days
                </Text>
              )}
              
              {typeof currentPuja.hours === 'number' && currentPuja.hours > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Hours: </Text>
                  {safeString(currentPuja.hours)} hours
                </Text>
              )}
              
              {typeof currentPuja.price === 'number' && currentPuja.price > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Price: </Text>
                  ₹{safeString(currentPuja.price)}
                </Text>
              )}
              
              {/* Note: No Link field in Supabase data */}
              {/* {currentPuja.Link && currentPuja.Link !== '' && (
                <Text style={styles.modalLink}>Link: {safeString(currentPuja.Link)}</Text>
              )} */}
              
              <TouchableOpacity style={styles.bookPujaButton} onPress={handleBookPuja}>
                <Text style={styles.bookPujaButtonText}>{getTranslation(translations.bookingForm.submit)}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setBookingModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setBookingModalVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitlePrefix}>{getTranslation({en: 'Thanks for requesting ', hi: 'अनुरोध के लिए धन्यवाद ', bangla: 'অনুরোধের জন্য ধন্যবাদ ', kannada: 'ವಿನಂತಿಗೆ ಧನ್ಯವಾದಗಳು ', punjabi: 'ਬੇਨਤੀ ਲਈ ਧੰਨਵਾਦ ', tamil: 'கோரிக்கைக்கு நன்றி ', telugu: 'అభ్యర్థనకు ధన్యవాదాలు '})}</Text>
                <Text style={styles.modalTitleBold}>"{currentPuja?.pujaName}"</Text>
                <Text style={styles.modalTitleSuffix}>{getTranslation({en: ' please enter the following to let us contact you', hi: ' कृपया हमसे संपर्क करने के लिए निम्नलिखित दर्ज करें', bangla: ' অনুগ্রহ করে আমাদের সাথে যোগাযোগের জন্য নিম্নলিখিত লিখুন', kannada: ' ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ನಮೂದಿಸಿ', punjabi: ' ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਭਰੋ', tamil: ' எங்களைத் தொடர்புகொள்ள தயவுசெய்து பின்வரும் உள்ளிடவும்', telugu: ' మమ్మల్ని సంప్రదించడానికి దయచేసి క్రింది నమోదు చేయండి'})}</Text>
              </View>
            <TextInput
              style={styles.modalInput}
              placeholder={getTranslation({en: "Full Name", hi: "पूरा नाम", bangla: "পুরো নাম", kannada: "ಪೂರ್ಣ ಹೆಸರು", punjabi: "ਪੂਰਾ ਨਾਮ", tamil: "முழு பெயர்", telugu: "పూర్తి పేరు"})}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={getTranslation(translations.bookingForm.phone)}
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.datePickerBtn}>
              <Text style={styles.datePickerText}>{getTranslation(translations.bookingForm.date)}: {date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, d) => {
                  setShowDate(false);
                  if (d) setDate(d);
                }}
              />
            )}
            <View style={styles.slotRow}>
              {timeSlots.map(ts => (
                <TouchableOpacity
                  key={ts}
                  style={[styles.slotBtn, slot === ts && styles.slotBtnSelected]}
                  onPress={() => setSlot(ts)}
                >
                  <Text style={[styles.slotText, slot === ts && styles.slotTextSelected]}>{ts}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalConfirmBtn, {flex: 1, marginRight: 8}]} onPress={handleConfirmBooking}>
                <Text style={styles.modalConfirmText}>{getTranslation(translations.bookingForm.submit)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, {flex: 1, marginLeft: 8}]} onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.modalCancelText}>{getTranslation(translations.bookingForm.cancel)}</Text>
              </TouchableOpacity>
            </View>
            
            {/* 300px white space at the end */}
            <View style={{ height: 300 }} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  iconRowTight: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#FFF6EE',
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  iconButtonSelected: {
    backgroundColor: '#FF6A00',
  },
  deityDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownModalList: {
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 320,
    paddingVertical: 4,
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  deityDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  content: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  pujaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00',
  },
  pujaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pujaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pujaDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  pujaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pujaDetail: {
    fontSize: 13,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pujaPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoModalBackground: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  nonYouTubeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
                modalLink: {
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
              },
              modalDetail: {
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                marginBottom: 12,
                lineHeight: 24,
              },
              modalDetailLabel: {
                fontWeight: 'bold',
                color: '#222',
              },
  modalContent: {
    width: '100%',
    paddingTop: 20,
  },
  bookPujaButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookPujaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitlePrefix: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#222',
    textAlign: 'center',
  },
  modalTitleBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  modalTitleSuffix: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#222',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#222',
    backgroundColor: '#FAFAFA',
    width: '100%',
  },
  datePickerBtn: {
    backgroundColor: '#FFF6EE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  slotBtn: {
    borderWidth: 1,
    borderColor: '#FFD6A0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#FFF6EE',
  },
  slotBtnSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFE0B2',
  },
  slotText: {
    color: '#888',
    fontSize: 15,
  },
  slotTextSelected: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    backgroundColor: '#3A3939',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  searchInputContainer: {
    position: 'relative',
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
}); 