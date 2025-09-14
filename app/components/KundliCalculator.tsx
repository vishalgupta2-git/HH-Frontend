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

const KundliCalculator: React.FC = () => {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  
  // Helper function to get translation
  const getTranslation = (translations: any) => {
    return currentLanguage === 'hindi' ? translations.hi :
           currentLanguage === 'bangla' ? translations.bangla :
           currentLanguage === 'kannada' ? translations.kannada :
           currentLanguage === 'punjabi' ? translations.punjabi :
           currentLanguage === 'tamil' ? translations.tamil :
           currentLanguage === 'telugu' ? translations.telugu :
           translations.en;
  };
  
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

  const translations = {
    title: { 
      en: 'Kundli Calculator', 
      hi: 'कुंडली कैलकुलेटर',
      bangla: 'কুন্ডলী ক্যালকুলেটর',
      kannada: 'ಕುಂಡಲಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
      punjabi: 'ਕੁੰਡਲੀ ਕੈਲਕੁਲੇਟਰ',
      tamil: 'குண்டலி கால்குலேட்டர்',
      telugu: 'కుండలి కాలిక్యులేటర్'
    },
    loading: { 
      en: 'Loading providers...', 
      hi: 'प्रदाता लोड हो रहे हैं...',
      bangla: 'প্রদানকারী লোড হচ্ছে...',
      kannada: 'ಪ್ರದಾತರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਪ੍ਰਦਾਤਾ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
      tamil: 'வழங்குநர்கள் ஏற்றப்படுகின்றனர்...',
      telugu: 'ప్రదాతలు లోడ్ అవుతున్నారు...'
    },
    noProviders: { 
      en: 'No providers available', 
      hi: 'कोई प्रदाता उपलब्ध नहीं',
      bangla: 'কোন প্রদানকারী উপলব্ধ নয়',
      kannada: 'ಯಾವುದೇ ಪ್ರದಾತರು ಲಭ್ಯವಿಲ್ಲ',
      punjabi: 'ਕੋਈ ਪ੍ਰਦਾਤਾ ਉਪਲਬਧ ਨਹੀਂ',
      tamil: 'வழங்குநர்கள் எதுவும் இல்லை',
      telugu: 'ప్రదాతలు లభించలేదు'
    },
    bookAppointment: { 
      en: 'Book Appointment', 
      hi: 'अपॉइंटमेंट बुक करें',
      bangla: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      kannada: 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
      punjabi: 'ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ',
      tamil: 'எப்பாயின்ட்மென்ட் புக் செய்யவும்',
      telugu: 'అపాయింట్మెంట్ బుక్ చేయండి'
    },
    about: { 
      en: 'About', 
      hi: 'के बारे में',
      bangla: 'সম্পর্কে',
      kannada: 'ಬಗ್ಗೆ',
      punjabi: 'ਬਾਰੇ',
      tamil: 'பற்றி',
      telugu: 'గురించి'
    },
    close: { 
      en: 'Close', 
      hi: 'बंद करें',
      bangla: 'বন্ধ করুন',
      kannada: 'ಮುಚ್ಚಿ',
      punjabi: 'ਬੰਦ ਕਰੋ',
      tamil: 'மூடு',
      telugu: 'మూసివేయండి'
    },
    bookingForm: { 
      en: 'Booking Form', 
      hi: 'बुकिंग फॉर्म',
      bangla: 'বুকিং ফর্ম',
      kannada: 'ಬುಕಿಂಗ್ ಫಾರ್ಮ್',
      punjabi: 'ਬੁੱਕਿੰਗ ਫਾਰਮ',
      tamil: 'புகிங் படிவம்',
      telugu: 'బుకింగ్ ఫారమ్'
    },
    name: { 
      en: 'Name', 
      hi: 'नाम',
      bangla: 'নাম',
      kannada: 'ಹೆಸರು',
      punjabi: 'ਨਾਮ',
      tamil: 'பெயர்',
      telugu: 'పేరు'
    },
    phone: { 
      en: 'Phone', 
      hi: 'फोन',
      bangla: 'ফোন',
      kannada: 'ಫೋನ್',
      punjabi: 'ਫੋਨ',
      tamil: 'தொலைபேசி',
      telugu: 'ఫోన్'
    },
    date: { 
      en: 'Date', 
      hi: 'तारीख',
      bangla: 'তারিখ',
      kannada: 'ದಿನಾಂಕ',
      punjabi: 'ਤਾਰੀਖ',
      tamil: 'தேதி',
      telugu: 'తేదీ'
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
      en: 'Submit', 
      hi: 'जमा करें',
      bangla: 'জমা দিন',
      kannada: 'ಸಲ್ಲಿಸಿ',
      punjabi: 'ਜਮ੍ਹਾ ਕਰੋ',
      tamil: 'சமர்ப்பிக்கவும்',
      telugu: 'సమర్పించండి'
    },
    submitting: { 
      en: 'Submitting...', 
      hi: 'जमा किया जा रहा है...',
      bangla: 'জমা দেওয়া হচ্ছে...',
      kannada: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਜਮ੍ਹਾ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      tamil: 'சமர்ப்பிக்கப்படுகிறது...',
      telugu: 'సమర్పించబడుతోంది...'
    },
    success: { 
      en: 'Success', 
      hi: 'सफलता',
      bangla: 'সফলতা',
      kannada: 'ಯಶಸ್ಸು',
      punjabi: 'ਸਫਲਤਾ',
      tamil: 'வெற்றி',
      telugu: 'విజయం'
    },
    error: { 
      en: 'Error', 
      hi: 'त्रुटि',
      bangla: 'ত্রুটি',
      kannada: 'ದೋಷ',
      punjabi: 'ਗਲਤੀ',
      tamil: 'பிழை',
      telugu: 'లోపం'
    },
    bookingSuccess: { 
      en: 'Booking submitted successfully!', 
      hi: 'बुकिंग सफलतापूर्वक जमा हो गई!',
      bangla: 'বুকিং সফলভাবে জমা হয়েছে!',
      kannada: 'ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਬੁੱਕਿੰਗ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ ਹੋ ਗਈ!',
      tamil: 'புகிங் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      telugu: 'బుకింగ్ విజయవంతంగా సమర్పించబడింది!'
    },
    bookingError: { 
      en: 'Failed to submit booking', 
      hi: 'बुकिंग जमा करने में विफल',
      bangla: 'বুকিং জমা দিতে ব্যর্থ',
      kannada: 'ಬುಕಿಂಗ್ ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ',
      punjabi: 'ਬੁੱਕਿੰਗ ਜਮ੍ਹਾ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
      tamil: 'புகிங் சமர்ப்பிக்க முடியவில்லை',
      telugu: 'బుకింగ్ సమర్పించడంలో విఫలమైంది'
    },
    validation: {
      nameRequired: { 
        en: 'Name is required', 
        hi: 'नाम आवश्यक है',
        bangla: 'নাম প্রয়োজন',
        kannada: 'ಹೆಸರು ಅಗತ್ಯ',
        punjabi: 'ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ',
        tamil: 'பெயர் தேவை',
        telugu: 'పేరు అవసరం'
      },
      phoneRequired: { 
        en: 'Phone is required', 
        hi: 'फोन आवश्यक है',
        bangla: 'ফোন প্রয়োজন',
        kannada: 'ಫೋನ್ ಅಗತ್ಯ',
        punjabi: 'ਫੋਨ ਲੋੜੀਂਦਾ ਹੈ',
        tamil: 'தொலைபேசி தேவை',
        telugu: 'ఫోన్ అవసరం'
      },
      dateRequired: { 
        en: 'Date is required', 
        hi: 'तारीख आवश्यक है',
        bangla: 'তারিখ প্রয়োজন',
        kannada: 'ದಿನಾಂಕ ಅಗತ್ಯ',
        punjabi: 'ਤਾਰੀਖ ਲੋੜੀਂਦੀ ਹੈ',
        tamil: 'தேதி தேவை',
        telugu: 'తేదీ అవసరం'
      },
      timeSlotRequired: { 
        en: 'Time slot is required', 
        hi: 'समय स्लॉट आवश्यक है',
        bangla: 'সময় স্লট প্রয়োজন',
        kannada: 'ಸಮಯ ಸ್ಲಾಟ್ ಅಗತ್ಯ',
        punjabi: 'ਸਮਾਂ ਸਲਾਟ ਲੋੜੀਂਦਾ ਹੈ',
        tamil: 'நேர இடைவெளி தேவை',
        telugu: 'సమయ స్లాట్ అవసరం'
      }
    }
  };

  // Fetch providers from API
  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const apiUrl = getEndpointUrl('PROVIDERS') + '/kundli';
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
      Alert.alert(getTranslation({
        en: 'Invalid Name',
        hi: 'अमान्य नाम',
        bangla: 'অবৈধ নাম',
        kannada: 'ಅಮಾನ್ಯ ಹೆಸರು',
        punjabi: 'ਗਲਤ ਨਾਮ',
        tamil: 'தவறான பெயர்',
        telugu: 'చెల్లని పేరు'
      }), getTranslation({
        en: 'Name must be at least 3 characters long.',
        hi: 'नाम कम से कम 3 अक्षर का होना चाहिए।',
        bangla: 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে।',
        kannada: 'ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು।',
        punjabi: 'ਨਾਮ ਘੱਟੋ-ਘੱਟ 3 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
        tamil: 'பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்।',
        telugu: 'పేరు కనీసం 3 అక్షరాలుగా ఉండాలి।'
      }));
      return;
    }
    
    if (!bookingPhone || bookingPhone.length < 10) {
      Alert.alert(getTranslation({
        en: 'Invalid Phone',
        hi: 'अमान्य फोन',
        bangla: 'অবৈধ ফোন',
        kannada: 'ಅಮಾನ್ಯ ಫೋನ್',
        punjabi: 'ਗਲਤ ਫੋਨ',
        tamil: 'தவறான தொலைபேசி',
        telugu: 'చెల్లని ఫోన్'
      }), getTranslation({
        en: 'Please enter a valid phone number.',
        hi: 'कृपया एक वैध फोन नंबर दर्ज करें।',
        bangla: 'অনুগ্রহ করে একটি বৈধ ফোন নম্বর লিখুন।',
        kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ।',
        punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
        tamil: 'தயவுசெய்து சரியான தொலைபேசி எண்ணை உள்ளிடவும்।',
        telugu: 'దయచేసి చెల్లుబాటు అయ్యే ఫోన్ నంబర్‌ను నమోదు చేయండి।'
      }));
      return;
    }
    
    if (!bookingDate) {
      Alert.alert(getTranslation({
        en: 'Invalid Date',
        hi: 'अमान्य तारीख',
        bangla: 'অবৈধ তারিখ',
        kannada: 'ಅಮಾನ್ಯ ದಿನಾಂಕ',
        punjabi: 'ਗਲਤ ਤਾਰੀਖ',
        tamil: 'தவறான தேதி',
        telugu: 'చెల్లని తేదీ'
      }), getTranslation({
        en: 'Please select a preferred date.',
        hi: 'कृपया एक पसंदीदा तारीख चुनें।',
        bangla: 'অনুগ্রহ করে একটি পছন্দের তারিখ নির্বাচন করুন।',
        kannada: 'ದಯವಿಟ್ಟು ಅಪೇಕ್ಷಿತ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
        punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਤਾਰੀਖ ਚੁਣੋ।',
        tamil: 'தயவுசெய்து விருப்பமான தேதியைத் தேர்ந்தெடுக்கவும்।',
        telugu: 'దయచేసి ఇష్టమైన తేదీని ఎంచుకోండి।'
      }));
      return;
    }
    
    if (!isValidFutureDate(bookingDate)) {
      Alert.alert(getTranslation({
        en: 'Invalid Date',
        hi: 'अमान्य तारीख',
        bangla: 'অবৈধ তারিখ',
        kannada: 'ಅಮಾನ್ಯ ದಿನಾಂಕ',
        punjabi: 'ਗਲਤ ਤਾਰੀਖ',
        tamil: 'தவறான தேதி',
        telugu: 'చెల్లని తేదీ'
      }), getTranslation({
        en: 'Please select a date at least 18 hours in the future.',
        hi: 'कृपया भविष्य में कम से कम 18 घंटे की तारीख चुनें।',
        bangla: 'অনুগ্রহ করে ভবিষ্যতে কমপক্ষে ১৮ ঘন্টা পরের তারিখ নির্বাচন করুন।',
        kannada: 'ದಯವಿಟ್ಟು ಭವಿಷ್ಯದಲ್ಲಿ ಕನಿಷ್ಠ 18 ಗಂಟೆಗಳ ನಂತರದ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
        punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਭਵਿੱਖ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 18 ਘੰਟਿਆਂ ਦੀ ਤਾਰੀਖ ਚੁਣੋ।',
        tamil: 'தயவுசெய்து எதிர்காலத்தில் குறைந்தது 18 மணி நேரம் பிறகு தேதியைத் தேர்ந்தெடுக்கவும்।',
        telugu: 'దయచేసి భవిష్యత్తులో కనీసం 18 గంటల తర్వాత తేదీని ఎంచుకోండి।'
      }));
      return;
    }
    
    if (!bookingTimeSlot) {
      Alert.alert(getTranslation({
        en: 'Invalid Time',
        hi: 'अमान्य समय',
        bangla: 'অবৈধ সময়',
        kannada: 'ಅಮಾನ್ಯ ಸಮಯ',
        punjabi: 'ਗਲਤ ਸਮਾਂ',
        tamil: 'தவறான நேரம்',
        telugu: 'చెల్లని సమయం'
      }), getTranslation({
        en: 'Please select a preferred time slot.',
        hi: 'कृपया एक पसंदीदा समय स्लॉट चुनें।',
        bangla: 'অনুগ্রহ করে একটি পছন্দের সময় স্লট নির্বাচন করুন।',
        kannada: 'ದಯವಿಟ್ಟು ಅಪೇಕ್ಷಿತ ಸಮಯ ಸ್ಲಾಟ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
        punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ।',
        tamil: 'தயவுசெய்து விருப்பமான நேர இடைவெளியைத் தேர்ந்தெடுக்கவும்।',
        telugu: 'దయచేసి ఇష్టమైన సమయ స్లాట్‌ను ఎంచుకోండి।'
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestBody = {
        name: bookingName.trim(),
        phone: bookingPhone, // Send as string, let backend handle conversion
        serviceType: 'kundli',
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
          getTranslation({
            en: 'Booking Successful!',
            hi: 'बुकिंग सफल!',
            bangla: 'বুকিং সফল!',
            kannada: 'ಬುಕಿಂಗ್ ಯಶಸ್ವಿ!',
            punjabi: 'ਬੁੱਕਿੰਗ ਸਫਲ!',
            tamil: 'புகிங் வெற்றிகரம்!',
            telugu: 'బుకింగ్ విజయవంతం!'
          }),
          getTranslation({
            en: 'Your appointment has been booked. We will contact you soon.',
            hi: 'आपका अपॉइंटमेंट बुक हो गया है। हम जल्द ही आपसे संपर्क करेंगे।',
            bangla: 'আপনার অ্যাপয়েন্টমেন্ট বুক হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
            kannada: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಆಗಿದೆ। ನಾವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ।',
            punjabi: 'ਤੁਹਾਡਾ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਹੋ ਗਿਆ ਹੈ। ਅਸੀਂ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਾਂਗੇ।',
            tamil: 'உங்கள் எப்பாயின்ட்மென்ட் புக் ஆகிவிட்டது। நாங்கள் விரைவில் உங்களுடன் தொடர்பு கொள்வோம்।',
            telugu: 'మీ అపాయింట్మెంట్ బుక్ అయింది। మేము త్వరలో మీతో సంప్రదిస్తాము।'
          }),
          [
            {
              text: getTranslation({
                en: 'OK',
                hi: 'ठीक है',
                bangla: 'ঠিক আছে',
                kannada: 'ಸರಿ',
                punjabi: 'ਠੀਕ ਹੈ',
                tamil: 'சரி',
                telugu: 'సరే'
              }),
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
       Alert.alert(getTranslation({
         en: 'Error',
         hi: 'त्रुटि',
         bangla: 'ত্রুটি',
         kannada: 'ದೋಷ',
         punjabi: 'ਗਲਤੀ',
         tamil: 'பிழை',
         telugu: 'లోపం'
       }), getTranslation({
         en: 'Failed to book appointment. Please try again.',
         hi: 'अपॉइंटमेंट बुक करने में विफल। कृपया पुनः प्रयास करें।',
         bangla: 'অ্যাপয়েন্টমেন্ট বুক করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
         kannada: 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
         punjabi: 'ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
         tamil: 'எப்பாயின்ட்மென்ட் புக் செய்ய முடியவில்லை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
         telugu: 'అపాయింట్మెంట్ బుక్ చేయడంలో విఫలమైంది। దయచేసి మళ్లీ ప్రయత్నించండి।'
       }));
     } finally {
       setIsSubmitting(false);
     }
   };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
             <View style={styles.providersSection}>
         <View style={styles.titleContainer}>
           <Text style={styles.sectionTitle}>{getTranslation({
             en: 'Kundli Service Providers',
             hi: 'कुंडली सेवा प्रदाता',
             bangla: 'কুন্ডলী সেবা প্রদানকারী',
             kannada: 'ಕುಂಡಲಿ ಸೇವಾ ಪ್ರದಾತರು',
             punjabi: 'ਕੁੰਡਲੀ ਸੇਵਾ ਪ੍ਰਦਾਤਾ',
             tamil: 'குண்டலி சேவை வழங்குநர்கள்',
             telugu: 'కుండలి సేవా ప్రదాతలు'
           })}</Text>
           <TouchableOpacity 
             style={styles.infoIcon}
             onPress={() => setShowInfoModal(true)}
           >
             <Text style={styles.infoIconText}>ℹ️</Text>
           </TouchableOpacity>
         </View>
         <Text style={styles.instructionText}>{getTranslation({
           en: 'Click on any provider to book kundli services',
           hi: 'कुंडली सेवाओं को बुक करने के लिए किसी भी प्रदाता पर क्लिक करें',
           bangla: 'কুন্ডলী সেবা বুক করতে যেকোনো প্রদানকারীর উপর ক্লিক করুন',
           kannada: 'ಕುಂಡಲಿ ಸೇವೆಗಳನ್ನು ಬುಕ್ ಮಾಡಲು ಯಾವುದೇ ಪ್ರದಾತರ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
           punjabi: 'ਕੁੰਡਲੀ ਸੇਵਾਵਾਂ ਬੁੱਕ ਕਰਨ ਲਈ ਕੋਈ ਵੀ ਪ੍ਰਦਾਤਾ \'ਤੇ ਕਲਿੱਕ ਕਰੋ',
           tamil: 'குண்டலி சேவைகளை புக் செய்ய எந்த வழங்குநரையும் கிளிக் செய்யவும்',
           telugu: 'కుండలి సేవలను బుక్ చేయడానికి ఏదైనా ప్రదాతపై క్లిక్ చేయండి'
         })}</Text>
         
         {loadingProviders ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA040" />
            <Text style={styles.loadingText}>{getTranslation(translations.loading)}</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.noProvidersContainer}>
            <Text style={styles.noProvidersText}>{getTranslation(translations.noProviders)}</Text>
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
                   <Text style={styles.modalTitle}>{getTranslation(translations.bookingForm)}</Text>
                   <TouchableOpacity
                     style={styles.closeButton}
                     onPress={() => setShowBookingModal(false)}
                   >
                     <Text style={styles.closeButtonText}>✕</Text>
                   </TouchableOpacity>
                 </View>
                 
                                   <View style={styles.bookingContent}>
                    <Text style={styles.bookingWelcomeText}>
                      {isHindi ? 'हमारी कुंडली सेवाओं में आपकी रुचि के लिए धन्यवाद, कृपया बुकिंग के लिए हमसे संपर्क करने के लिए निम्नलिखित विवरण भरें' : 'Thank you for your interest in our Kundli Services, please fill in the following details for us to contact you for booking'}
                    </Text>
                    
                    <Text style={styles.bookingProviderName}>
                      {selectedProvider.Salutation} {selectedProvider.firstName} {selectedProvider.lastName}
                    </Text>
                    
                    <View style={styles.bookingForm}>
                      <Text style={styles.formLabel}>{getTranslation({
                        en: 'Name *',
                        hi: 'नाम *',
                        bangla: 'নাম *',
                        kannada: 'ಹೆಸರು *',
                        punjabi: 'ਨਾਮ *',
                        tamil: 'பெயர் *',
                        telugu: 'పేరు *'
                      })}</Text>
                      <TextInput
                        style={styles.formInput}
                        value={bookingName}
                        onChangeText={setBookingName}
                        placeholder={getTranslation({
                          en: 'Enter your full name',
                          hi: 'अपना पूरा नाम दर्ज करें',
                          bangla: 'আপনার সম্পূর্ণ নাম লিখুন',
                          kannada: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
                          punjabi: 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
                          tamil: 'உங்கள் முழு பெயரை உள்ளிடவும்',
                          telugu: 'మీ పూర్తి పేరును నమోదు చేయండి'
                        })}
                        placeholderTextColor="#999"
                      />
                      
                      <Text style={styles.formLabel}>{getTranslation({
                        en: 'Phone Number *',
                        hi: 'फोन नंबर *',
                        bangla: 'ফোন নম্বর *',
                        kannada: 'ಫೋನ್ ನಂಬರ್ *',
                        punjabi: 'ਫੋਨ ਨੰਬਰ *',
                        tamil: 'தொலைபேசி எண் *',
                        telugu: 'ఫోన్ నంబర్ *'
                      })}</Text>
                      <TextInput
                        style={styles.formInput}
                        value={bookingPhone}
                        onChangeText={setBookingPhone}
                        placeholder={getTranslation({
                          en: 'Enter your phone number',
                          hi: 'अपना फोन नंबर दर्ज करें',
                          bangla: 'আপনার ফোন নম্বর লিখুন',
                          kannada: 'ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ',
                          punjabi: 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ',
                          tamil: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
                          telugu: 'మీ ఫోన్ నంబర్ నమోదు చేయండి'
                        })}
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                      />
                      
                      <Text style={styles.formLabel}>{getTranslation({
                        en: 'Preferred Date *',
                        hi: 'पसंदीदा तारीख *',
                        bangla: 'পছন্দের তারিখ *',
                        kannada: 'ಅಪೇಕ್ಷಿತ ದಿನಾಂಕ *',
                        punjabi: 'ਪਸੰਦੀਦਾ ਤਾਰੀਖ *',
                        tamil: 'விருப்பமான தேதி *',
                        telugu: 'ఇష్టమైన తేదీ *'
                      })}</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={showDatePickerModal}
                      >
                                            <Text style={styles.datePickerButtonText}>
                      {bookingDate ? bookingDate : getTranslation({
                        en: 'Select Date',
                        hi: 'तारीख चुनें',
                        bangla: 'তারিখ নির্বাচন করুন',
                        kannada: 'ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ',
                        punjabi: 'ਤਾਰੀਖ ਚੁਣੋ',
                        tamil: 'தேதியைத் தேர்ந்தெடுக்கவும்',
                        telugu: 'తేదీని ఎంచుకోండి'
                      })}
                    </Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.formLabel}>{getTranslation({
                        en: 'Preferred Time Slot *',
                        hi: 'पसंदीदा समय स्लॉट *',
                        bangla: 'পছন্দের সময় স্লট *',
                        kannada: 'ಅಪೇಕ್ಷಿತ ಸಮಯ ಸ್ಲಾಟ್ *',
                        punjabi: 'ਪਸੰਦੀਦਾ ਸਮਾਂ ਸਲਾਟ *',
                        tamil: 'விருப்பமான நேர இடைவெளி *',
                        telugu: 'ఇష్టమైన సమయ స్లాట్ *'
                      })}</Text>
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
                          {isSubmitting ? getTranslation(translations.submitting) : getTranslation(translations.bookAppointment)}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* 100px white space at the end */}
                      <View style={styles.modalBottomSpacing} />
                    </View>
                  </View>
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
                <Text style={styles.modalTitle}>{getTranslation({
                  en: 'About Kundli Services',
                  hi: 'कुंडली सेवाओं के बारे में',
                  bangla: 'কুন্ডলী সেবা সম্পর্কে',
                  kannada: 'ಕುಂಡಲಿ ಸೇವೆಗಳ ಬಗ್ಗೆ',
                  punjabi: 'ਕੁੰਡਲੀ ਸੇਵਾਵਾਂ ਬਾਰੇ',
                  tamil: 'குண்டலி சேவைகள் பற்றி',
                  telugu: 'కుండలి సేవల గురించి'
                })}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowInfoModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  {getTranslation({
                    en: 'Avail professional Kundli services for accurate birth chart analysis and life guidance. Discover insights on career, health, relationships, and future opportunities with expert astrologers.',
                    hi: 'सटीक जन्म चार्ट विश्लेषण और जीवन मार्गदर्शन के लिए पेशेवर कुंडली सेवाओं का लाभ उठाएं। विशेषज्ञ ज्योतिषियों के साथ करियर, स्वास्थ्य, रिश्तों और भविष्य के अवसरों पर अंतर्दृष्टि की खोज करें।',
                    bangla: 'নির্ভুল জন্ম চার্ট বিশ্লেষণ এবং জীবন নির্দেশনার জন্য পেশাদার কুন্ডলী সেবা গ্রহণ করুন। বিশেষজ্ঞ জ্যোতিষীদের সাথে কর্মজীবন, স্বাস্থ্য, সম্পর্ক এবং ভবিষ্যতের সুযোগ সম্পর্কে অন্তর্দৃষ্টি আবিষ্কার করুন।',
                    kannada: 'ನಿಖರವಾದ ಜನನ ಚಾರ್ಟ್ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಜೀವನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ವೃತ್ತಿಪರ ಕುಂಡಲಿ ಸೇವೆಗಳನ್ನು ಪಡೆಯಿರಿ। ನಿಪುಣ ಜ್ಯೋತಿಷ್ಯರೊಂದಿಗೆ ವೃತ್ತಿಜೀವನ, ಆರೋಗ್ಯ, ಸಂಬಂಧಗಳು ಮತ್ತು ಭವಿಷ್ಯದ ಅವಕಾಶಗಳ ಬಗ್ಗೆ ಅಂತರ್ದೃಷ್ಟಿಯನ್ನು ಕಂಡುಕೊಳ್ಳಿರಿ।',
                    punjabi: 'ਸਹੀ ਜਨਮ ਚਾਰਟ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਜੀਵਨ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਪੇਸ਼ੇਵਰ ਕੁੰਡਲੀ ਸੇਵਾਵਾਂ ਦਾ ਲਾਭ ਉਠਾਓ। ਮਾਹਿਰ ਜੋਤਿਸ਼ਾਂ ਦੇ ਨਾਲ ਕੈਰੀਅਰ, ਸਿਹਤ, ਰਿਸ਼ਤਿਆਂ ਅਤੇ ਭਵਿੱਖ ਦੇ ਮੌਕਿਆਂ ਬਾਰੇ ਸੂਝ ਦੀ ਖੋਜ ਕਰੋ।',
                    tamil: 'துல்லியமான பிறப்பு விளக்கப்பட பகுப்பாய்வு மற்றும் வாழ்க்கை வழிகாட்டுதலுக்கு தொழில்முறை குண்டலி சேவைகளைப் பெறுங்கள்。 நிபுண ஜோதிடர்களுடன் தொழில், ஆரோக்கியம், உறவுகள் மற்றும் எதிர்கால வாய்ப்புகள் குறித்த நுண்ணறிவுகளைக் கண்டறியுங்கள்।',
                    telugu: 'ఖచ్చితమైన పుట్టిన చార్ట్ విశ్లేషణ మరియు జీవిత మార్గదర్శకత్వం కోసం ప్రొఫెషనల్ కుండలి సేవలను పొందండి। నిపుణ జ్యోతిష్యులతో కెరీర్, ఆరోగ్యం, సంబంధాలు మరియు భవిష్యత్ అవకాశాలపై అంతర్దృష్టులను కనుగొనండి।'
                  })}
                </Text>
              </View>
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
  modalBottomSpacing: {
    height: 100,
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
});

export default KundliCalculator;
