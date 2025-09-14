import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Image } from 'react-native';
import { getImageSource } from '@/utils/iconMappings';
import { useLanguage } from '@/contexts/LanguageContext';

const timeSlots = [
  '8:00-10:00 AM', '10:00-12:00 PM', '12:00-2:00 PM', '2:00-4:00 PM',
  '4:00-6:00 PM', '6:00-8:00 PM', '8:00-10:00 PM'
];

interface SpecialPujaData {
  createdAt?: string;
  pujaID?: string;
  pujaName?: string;
  icon?: string;
  individual?: boolean;
  couple?: boolean;
  family?: boolean;
  promote?: boolean;
  pujaDetails?: string;
  dateMapping?: string; // Date in YYYY-MM-DD format for fixed date pujas
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

export default function SpecialPujaScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [currentPuja, setCurrentPuja] = useState<SpecialPujaData | null>(null);
  const [pujaFiles, setPujaFiles] = useState<SpecialPujaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('8:00-10:00 AM');
  
  // Filter states
  const [selectedFilter, setSelectedFilter] = useState<string>('puja-for');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

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
      en: 'Search special day pujas...', 
      hi: 'विशेष दिन की पूजाओं की खोज करें...',
      bangla: 'বিশেষ দিনের পুজো খুঁজুন...',
      kannada: 'ವಿಶೇಷ ದಿನದ ಪೂಜೆಗಳನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਖਾਸ ਦਿਨ ਦੀਆਂ ਪੂਜਾਵਾਂ ਖੋਜੋ...',
      tamil: 'சிறப்பு நாள் பூஜைகளைத் தேடுங்கள்...',
      telugu: 'ప్రత్యేక దిన పూజలను వెతకండి...'
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
      en: 'No special day pujas found.', 
      hi: 'कोई विशेष दिन की पूजा नहीं मिली।',
      bangla: 'কোনো বিশেষ দিনের পুজো পাওয়া যায়নি।',
      kannada: 'ವಿಶೇಷ ದಿನದ ಪೂಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ।',
      punjabi: 'ਕੋਈ ਖਾਸ ਦਿਨ ਦੀਆਂ ਪੂਜਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ।',
      tamil: 'சிறப்பு நாள் பூஜைகள் கிடைக்கவில்லை।',
      telugu: 'ప్రత్యేక దిన పూజలు కనుగొనబడలేదు।'
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
        en: 'Book Special Puja', 
        hi: 'विशेष पूजा बुक करें',
        bangla: 'বিশেষ পুজো বুক করুন',
        kannada: 'ವಿಶೇಷ ಪೂಜೆ ಬುಕ್ ಮಾಡಿ',
        punjabi: 'ਖਾਸ ਪੂਜਾ ਬੁਕ ਕਰੋ',
        tamil: 'சிறப்பு பூஜை புக்கிங்',
        telugu: 'ప్రత్యేక పూజ బుక్ చేయండి'
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
    success: { en: 'Puja booking submitted successfully!', hi: 'पूजा बुकिंग सफलतापूर्वक जमा हो गई!' },
    error: { en: 'Error submitting booking. Please try again.', hi: 'बुकिंग जमा करने में त्रुटि। कृपया पुनः प्रयास करें।' },
    heading: { 
      en: 'Mark your milestones with Divine Blessings', 
      hi: 'दिव्य आशीर्वाद के साथ अपने मील के पत्थर को चिह्नित करें',
      bangla: 'দিব্য আশীর্বাদ দিয়ে আপনার মাইলফলকগুলি চিহ্নিত করুন',
      kannada: 'ದಿವ್ಯ ಆಶೀರ್ವಾದಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಮೈಲಿಗಲ್ಲುಗಳನ್ನು ಗುರುತಿಸಿ',
      punjabi: 'ਦਿਵਿਆ ਆਸ਼ੀਰਵਾਦਾਂ ਨਾਲ ਆਪਣੇ ਮੀਲ ਪੱਥਰ ਨੂੰ ਚਿੰਨ੍ਹਿਤ ਕਰੋ',
      tamil: 'தெய்வீக ஆசீர்வாதங்களுடன் உங்கள் மைல்கற்களைக் குறிக்கவும்',
      telugu: 'దివ్య ఆశీర్వాదాలతో మీ మైలురాళ్లను గుర్తించండి'
    },
    searchPlaceholder: { 
      en: 'Search for pujas, details, or categories...', 
      hi: 'पूजाओं, विवरण या श्रेणियों की खोज करें...',
      bangla: 'পুজো, বিবরণ বা বিভাগ খুঁজুন...',
      kannada: 'ಪೂಜೆಗಳು, ವಿವರಗಳು ಅಥವಾ ವರ್ಗಗಳನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਪੂਜਾਵਾਂ, ਵੇਰਵੇ ਜਾਂ ਸ਼੍ਰੇਣੀਆਂ ਖੋਜੋ...',
      tamil: 'பூஜைகள், விவரங்கள் அல்லது பிரிவுகளைத் தேடுங்கள்...',
      telugu: 'పూజలు, వివరాలు లేదా వర్గాలను వెతకండి...'
    },
    pujaFor: { 
      en: 'Puja for', 
      hi: 'पूजा के लिए',
      bangla: 'পুজো জন্য',
      kannada: 'ಪೂಜೆಗಾಗಿ',
      punjabi: 'ਪੂਜਾ ਲਈ',
      tamil: 'பூஜைக்காக',
      telugu: 'పూజ కోసం'
    },
    upcoming: { 
      en: 'Upcoming', 
      hi: 'आगामी',
      bangla: 'আসন্ন',
      kannada: 'ಮುಂಬರುವ',
      punjabi: 'ਆਉਣ ਵਾਲੇ',
      tamil: 'வரவிருக்கும்',
      telugu: 'రాబోయే'
    },
    individual: { 
      en: 'Individual', 
      hi: 'व्यक्तिगत',
      bangla: 'ব্যক্তিগত',
      kannada: 'ವ್ಯಕ್ತಿಗತ',
      punjabi: 'ਵਿਅਕਤੀਗਤ',
      tamil: 'தனிப்பட்ட',
      telugu: 'వ్యక్తిగత'
    },
    couples: { 
      en: 'Couples', 
      hi: 'जोड़े',
      bangla: 'দম্পতি',
      kannada: 'ಜೋಡಿಗಳು',
      punjabi: 'ਜੋੜੇ',
      tamil: 'தம்பதிகள்',
      telugu: 'జంటలు'
    },
    families: { 
      en: 'Families', 
      hi: 'परिवार',
      bangla: 'পরিবার',
      kannada: 'ಕುಟುಂಬಗಳು',
      punjabi: 'ਪਰਿਵਾਰ',
      tamil: 'குடும்பங்கள்',
      telugu: 'కుటుంబాలు'
    }
  };

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        // Fetching special pujas
        const res = await axios.get(getEndpointUrl('SPECIAL_PUJA'), {
          headers: getAuthHeaders()
        });
        // Special puja API response received
        
        // Filter out any items with null/undefined values that might cause rendering issues
        const filteredData = res.data.filter((puja: any) => puja && typeof puja === 'object');
        // Filtered special puja data processed
        setPujaFiles(filteredData);
      } catch (e: any) {
        Alert.alert(isHindi ? 'विशेष पूजाएं लोड करने में विफल' : 'Failed to fetch special pujas', e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  const handlePlay = (puja: SpecialPujaData) => {
    // Validate puja object before setting
    if (!puja || typeof puja !== 'object') {
      return;
    }
    
    setCurrentPuja(puja);
    setModalVisible(true);
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
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'कोई पूजा चयनित नहीं। कृपया पुनः प्रयास करें।' : 'No puja selected. Please try again.');
      return;
    }
    
    const bookingData = {
      name,
      phone: parseInt(phone) || phone, // Convert to number if possible
      date: date.toISOString(), // Convert Date to ISO string for backend
      slot,
      pujaName: currentPuja?.pujaName, // Send puja name instead of pujaType
      pujaId: currentPuja?.pujaID,
    };
    
    try {
      // Submitting special puja booking
      const response = await axios.post(getEndpointUrl('SPECIAL_PUJA'), bookingData, {
        headers: getAuthHeaders()
      });
              // Booking response received
      setBookingModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert(getTranslation({en: 'Success', hi: 'सफलता', bangla: 'সফলতা', kannada: 'ಯಶಸ್ಸು', punjabi: 'ਸਫਲਤਾ', tamil: 'வெற்றி', telugu: 'విజయం'}), getTranslation(translations.success));
    } catch (err: any) {
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? `बुकिंग सेव करने में विफल: ${err.response?.data?.error || err.message}` : `Failed to save booking: ${err.response?.data?.error || err.message}`);
    }
  };

  // Filter pujas based on search query and filters
  const filteredPujas = pujaFiles
    .filter(puja => {
      // Ensure puja is a valid object
      if (!puja || typeof puja !== 'object') {
        return false;
      }
      
      // Filter by selected filter
      if (selectedFilter !== 'puja-for') {
        if (selectedFilter === 'upcoming' && !puja.promote) return false;
        if (selectedFilter === 'individual' && !puja.individual) return false;
        if (selectedFilter === 'couple' && !puja.couple) return false;
        if (selectedFilter === 'family' && !puja.family) return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          (puja.pujaName && safeString(puja.pujaName).toLowerCase().includes(q)) ||
          (puja.pujaDetails && safeString(puja.pujaDetails).toLowerCase().includes(q)) ||
          (puja.individual && safeString(puja.individual).toLowerCase().includes(q)) ||
          (puja.couple && safeString(puja.couple).toLowerCase().includes(q)) ||
          (puja.family && safeString(puja.family).toLowerCase().includes(q)) ||
          (puja.promote && safeString(puja.promote).toLowerCase().includes(q))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort promoted pujas first
      if (a.promote && !b.promote) return -1;
      if (!a.promote && b.promote) return 1;
      return 0;
    });

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder={getTranslation(translations.searchPlaceholder)}
        showDailyPujaButton={false}
        showSearchBar={false}
        showLanguageToggle={false}
        extraContent={
           <View style={styles.filterContainer}>
             {/* Search Input */}
             <View style={styles.searchInputContainer}>
               <TextInput
                 style={styles.searchInput}
                 placeholder="Search for pujas, details, or categories..."
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
             
             <TouchableOpacity 
               style={styles.filterDropdown}
               onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
             >
               <Text style={styles.filterDropdownText}>
                 {selectedFilter === 'puja-for' ? 'Puja for' : 
                  selectedFilter === 'upcoming' ? 'Upcoming' :
                  selectedFilter === 'individual' ? 'Individual' :
                  selectedFilter === 'couple' ? 'Couples' :
                  selectedFilter === 'family' ? 'Families' : 'Puja for'}
               </Text>
               <MaterialCommunityIcons 
                 name={filterDropdownOpen ? "chevron-up" : "chevron-down"} 
                 size={20} 
                 color="#666" 
               />
             </TouchableOpacity>
             
             {filterDropdownOpen && (
               <View style={styles.filterDropdownModal}>
                 <TouchableOpacity 
                   style={[styles.filterDropdownItem, styles.filterDropdownItemDisabled]}
                   disabled={true}
                 >
                   <Text style={styles.filterDropdownItemTextDisabled}>Puja for</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   style={styles.filterDropdownItem}
                   onPress={() => {
                     setSelectedFilter(selectedFilter === 'upcoming' ? 'puja-for' : 'upcoming');
                     setFilterDropdownOpen(false);
                   }}
                 >
                   <MaterialCommunityIcons name="star" size={16} color="#666" />
                   <Text style={styles.filterDropdownItemText}>Upcoming</Text>
                   {selectedFilter === 'upcoming' && (
                     <MaterialCommunityIcons name="check" size={16} color="#FF6A00" style={styles.filterDropdownItemTick} />
                   )}
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   style={styles.filterDropdownItem}
                   onPress={() => {
                     setSelectedFilter(selectedFilter === 'individual' ? 'puja-for' : 'individual');
                     setFilterDropdownOpen(false);
                   }}
                 >
                   <MaterialCommunityIcons name="account" size={16} color="#666" />
                   <Text style={styles.filterDropdownItemText}>Individual</Text>
                   {selectedFilter === 'individual' && (
                     <MaterialCommunityIcons name="check" size={16} color="#FF6A00" style={styles.filterDropdownItemTick} />
                   )}
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   style={styles.filterDropdownItem}
                   onPress={() => {
                     setSelectedFilter(selectedFilter === 'couple' ? 'puja-for' : 'couple');
                     setFilterDropdownOpen(false);
                   }}
                 >
                   <Image 
                     source={require('@/assets/images/icons/specialPujaIcons/coupleIcon.png')}
                     style={{ width: 16, height: 16 }}
                     resizeMode="contain"
                   />
                   <Text style={styles.filterDropdownItemText}>Couples</Text>
                   {selectedFilter === 'couple' && (
                     <MaterialCommunityIcons name="check" size={16} color="#FF6A00" style={styles.filterDropdownItemTick} />
                   )}
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   style={styles.filterDropdownItem}
                   onPress={() => {
                     setSelectedFilter(selectedFilter === 'family' ? 'puja-for' : 'family');
                     setFilterDropdownOpen(false);
                   }}
                 >
                   <Image 
                     source={require('@/assets/images/icons/specialPujaIcons/FamilyIcon.png')}
                     style={{ width: 16, height: 16 }}
                     resizeMode="contain"
                   />
                   <Text style={styles.filterDropdownItemText}>Families</Text>
                   {selectedFilter === 'family' && (
                     <MaterialCommunityIcons name="check" size={16} color="#FF6A00" style={styles.filterDropdownItemTick} />
                   )}
                 </TouchableOpacity>
               </View>
             )}
           </View>
         }
      />
      {/* Puja List */}
              <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
        <Text style={styles.headline}>{getTranslation(translations.heading)}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{getTranslation(translations.loading)}</Text>
        ) : filteredPujas.length === 0 ? (
          <Text style={styles.noDataText}>
            {searchQuery.trim() || selectedFilter !== 'puja-for' 
              ? getTranslation({en: 'No special pujas found matching your current filters. Try adjusting your search or filters.', hi: 'आपके वर्तमान फिल्टर से कोई विशेष पूजा मेल नहीं खाती। अपनी खोज या फिल्टर को समायोजित करने का प्रयास करें।', bangla: 'আপনার বর্তমান ফিল্টারের সাথে মিলে যাওয়া কোনো বিশেষ পুজো পাওয়া যায়নি। আপনার অনুসন্ধান বা ফিল্টার সামঞ্জস্য করার চেষ্টা করুন।', kannada: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್ಗಳೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ ವಿಶೇಷ ಪೂಜೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ। ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್ಗಳನ್ನು ಸರಿಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ।', punjabi: 'ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਫਿਲਟਰਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਕੋਈ ਵੀ ਖਾਸ ਪੂਜਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ। ਆਪਣੀ ਖੋਜ ਜਾਂ ਫਿਲਟਰਾਂ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', tamil: 'உங்கள் தற்போதைய வடிகட்டிகளுடன் பொருந்தக்கூடிய சிறப்பு பூஜைகள் எதுவும் கிடைக்கவில்லை। உங்கள் தேடல் அல்லது வடிகட்டிகளை சரிசெய்ய முயற்சிக்கவும்।', telugu: 'మీ ప్రస్తుత ఫిల్టర్లతో సరిపోలే ప్రత్యేక పూజలు కనుగొనబడలేదు। మీ శోధన లేదా ఫిల్టర్లను సరిచేయడానికి ప్రయత్నించండి।'})
              : getTranslation(translations.noDataFound)
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
                 key={puja.pujaID || idx}
                 style={styles.pujaCard}
                 onPress={() => handlePlay(puja)}
               >
                                   <View style={styles.pujaCardContent}>
                    {/* Puja Icon on the left */}
                    {puja.icon && getImageSource(puja.icon) ? (
                      <View style={styles.pujaIconContainer}>
                        <Image 
                          source={getImageSource(puja.icon)} 
                          style={styles.pujaIcon}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View style={styles.pujaIconContainer}>
                        <View style={styles.pujaIconPlaceholder}>
                          <MaterialCommunityIcons name="image-off" size={32} color="#ccc" />
                        </View>
                      </View>
                    )}
                    
                    {/* Puja Name and Type Icons on the right */}
                    <View style={styles.pujaInfoContainer}>
                     {/* Puja Name */}
                     <Text style={styles.pujaName}>{safeString(puja.pujaName || 'Puja Name')}</Text>
                     
                     {/* Type Icons Row */}
                     <View style={styles.typeIconsRow}>
                       {puja.individual && (
                         <View style={styles.typeIconContainer}>
                           <MaterialCommunityIcons name="account" size={20} color="#666" />
                         </View>
                       )}
                                               {puja.couple && (
                          <View style={styles.typeIconContainer}>
                            <Image 
                              source={require('@/assets/images/icons/specialPujaIcons/coupleIcon.png')}
                              style={{ width: 20, height: 20 }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                                               {puja.family && (
                          <View style={styles.typeIconContainer}>
                            <Image 
                              source={require('@/assets/images/icons/specialPujaIcons/FamilyIcon.png')}
                              style={{ width: 20, height: 20 }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                       {puja.promote && (
                         <View style={styles.typeIconContainer}>
                           <MaterialCommunityIcons name="star" size={20} color="#666" />
                         </View>
                       )}
                     </View>
                   </View>
                 </View>
               </TouchableOpacity>
            );
          })
        )}
        
        {/* Bottom Spacer to prevent clipping */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Puja Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setCurrentPuja(null);
        }}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
          setModalVisible(false);
          setCurrentPuja(null);
        }}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false);
              setCurrentPuja(null);
            }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {currentPuja && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalTitle}>{safeString(currentPuja.pujaName || 'Puja Name')}</Text>
                
                {currentPuja.pujaDetails && currentPuja.pujaDetails !== '' && (
                  <Text style={styles.modalDescription}>{safeString(currentPuja.pujaDetails)}</Text>
                )}
                
                {(() => {
                  const types = [];
                  if (currentPuja.individual) types.push('Individual');
                  if (currentPuja.couple) types.push('Couple');
                  if (currentPuja.family) types.push('Family');
                  if (currentPuja.promote) types.push('Upcoming');
                  
                  if (types.length > 0) {
                    return (
                      <Text style={styles.modalDetail}>
                        <Text style={styles.modalDetailLabel}>Type: </Text>
                        {types.join(', ')}
                      </Text>
                    );
                  }
                  return null;
                })()}
                
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
                <Text style={styles.modalTitlePrefix}>Thanks for requesting </Text>
                <Text style={styles.modalTitleBold}>"{currentPuja?.pujaName}"</Text>
                <Text style={styles.modalTitleSuffix}> please enter the following to let us contact you</Text>
              </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={isHindi ? "फोन नंबर" : "Phone Number"}
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
  content: {
    padding: 15,
    paddingBottom: 50, // Added extra bottom padding to prevent last tiles from getting clipped
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
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
  pujaCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pujaIconContainer: {
    marginRight: 16,
  },
  pujaInfoContainer: {
    flex: 1,
  },
  pujaIcon: {
    width: 64,
    height: 64,
    alignSelf: 'center',
  },
  typeIconsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  typeIconContainer: {
    marginHorizontal: 4,
    padding: 4,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  modalContent: {
    width: '100%',
    paddingTop: 20,
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
      marginBottom: 20,
      position: 'relative',
      width: '82%',
      alignSelf: 'center',
    },
    searchInputContainer: {
      position: 'relative',
      marginBottom: 16,
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
    filterDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      width: '100%',
    },
    filterDropdownText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    filterDropdownModal: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 1000,
      marginTop: 4,
    },
    filterDropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    filterDropdownItemText: {
      fontSize: 14,
      color: '#333',
      marginLeft: 8,
    },
    filterDropdownItemDisabled: {
      opacity: 0.5,
      backgroundColor: '#f5f5f5',
    },
    filterDropdownItemTextDisabled: {
      fontSize: 14,
      color: '#999',
      marginLeft: 8,
    },
    filterDropdownItemTick: {
      marginLeft: 'auto',
    },
    pujaIconPlaceholder: {
      width: 64,
      height: 64,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderStyle: 'dashed',
    },
    bottomSpacer: {
      height: 150, // Creates white space at the bottom to prevent clipping
    },
}); 