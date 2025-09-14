/**
 * Mannat Screen - Mannat (Wish) Functionality
 * 
 * Features:
 * 1. Temple/Charity listing for mannat
 * 2. Mannat booking with donation amount
 * 3. Date and time slot selection
 * 4. Currency selection
 * 5. Form validation and submission
 */

import HomeHeader from '@/components/Home/HomeHeader';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEndpointUrl, getAuthHeaders, API_CONFIG } from '@/constants/ApiConfig';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

// Time slots for mannat
const timeSlots = [
  '8AM-10AM',
  '10AM-12PM',
  '12PM-2PM',
  '2PM-4PM',
  '4PM-6PM',
  '6PM-8PM'
];

// Mannat options with prices
const mannatOptions = [
  { label: '10 Mandir Archana', price: 'Rs. 251' },
  { label: '51 Mandir Archana', price: 'Rs. 1251' },
  { label: 'Mahaprasad', price: 'Rs. 2100' },
  { label: '1 kg Modak', price: 'Rs. 501' },
  { label: '5 kg Modak', price: 'Rs. 2500' },
  { label: 'Food for 5 poor', price: 'Rs. 501' },
  { label: 'Food for 10 poor', price: 'Rs. 2500' }
];

export const options = { headerShown: false };

interface TempleCharity {
  id: string;
  name: string;
  type: string;
  deity: string;
  cause: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  about: string;
  '80G': string;
  zip_pinCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function MannatScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<TempleCharity[]>([]);
  const [filteredData, setFilteredData] = useState<TempleCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    searchPlaceholder: { 
      en: "Search for 'Temples'", 
      hi: "'मंदिरों' की खोज करें",
      bangla: "'মন্দির' খুঁজুন",
      kannada: "'ದೇವಾಲಯಗಳು' ಹುಡುಕಿ",
      punjabi: "'ਮੰਦਰ' ਖੋਜੋ",
      tamil: "'கோவில்கள்' தேடுங்கள்",
      telugu: "'దేవాలయాలు' వెతకండి"
    },
    loadingTemples: { 
      en: 'Loading temples and charities...', 
      hi: 'मंदिर और धर्मार्थ संस्थाएं लोड हो रही हैं...',
      bangla: 'মন্দির এবং দাতব্য প্রতিষ্ঠান লোড হচ্ছে...',
      kannada: 'ದೇವಾಲಯಗಳು ಮತ್ತು ದಾನ ಸಂಸ್ಥೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਮੰਦਰ ਅਤੇ ਧਰਮਾਰਥ ਸੰਸਥਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...',
      tamil: 'கோவில்கள் மற்றும் தர்மார்த்த நிறுவனங்கள் ஏற்றப்படுகின்றன...',
      telugu: 'దేవాలయాలు మరియు దాన సంస్థలు లోడ్ అవుతున్నాయి...'
    },
    retry: { 
      en: 'Retry', 
      hi: 'पुनः प्रयास करें',
      bangla: 'পুনরায় চেষ্টা করুন',
      kannada: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      punjabi: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
      tamil: 'மீண்டும் முயற்சிக்கவும்',
      telugu: 'మళ్లీ ప్రయత్నించండి'
    },
    noResults: { 
      en: 'No results found for', 
      hi: 'के लिए कोई परिणाम नहीं मिला',
      bangla: 'এর জন্য কোনো ফলাফল পাওয়া যায়নি',
      kannada: 'ಗಾಗಿ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      punjabi: 'ਲਈ ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ',
      tamil: 'க்கு எந்த முடிவுகளும் கிடைக்கவில்லை',
      telugu: 'కోసం ఫలితాలు కనుగొనబడలేదు'
    },
    noTemplesAvailable: { 
      en: 'No temples or charities available', 
      hi: 'कोई मंदिर या धर्मार्थ संस्थाएं उपलब्ध नहीं',
      bangla: 'কোনো মন্দির বা দাতব্য প্রতিষ্ঠান পাওয়া যায়নি',
      kannada: 'ದೇವಾಲಯಗಳು ಅಥವಾ ದಾನ ಸಂಸ್ಥೆಗಳು ಲಭ್ಯವಿಲ್ಲ',
      punjabi: 'ਕੋਈ ਮੰਦਰ ਜਾਂ ਧਰਮਾਰਥ ਸੰਸਥਾਵਾਂ ਉਪਲਬਧ ਨਹੀਂ',
      tamil: 'கோவில்கள் அல்லது தர்மார்த்த நிறுவனங்கள் கிடைக்கவில்லை',
      telugu: 'దేవాలయాలు లేదా దాన సంస్థలు అందుబాటులో లేవు'
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
    noDescription: { 
      en: 'No description available for this location.', 
      hi: 'इस स्थान के लिए कोई विवरण उपलब्ध नहीं।',
      bangla: 'এই অবস্থানের জন্য কোনো বিবরণ পাওয়া যায়নি।',
      kannada: 'ಈ ಸ್ಥಳಕ್ಕೆ ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ।',
      punjabi: 'ਇਸ ਸਥਾਨ ਲਈ ਕੋਈ ਵਿਵਰਣ ਉਪਲਬਧ ਨਹੀਂ।',
      tamil: 'இந்த இடத்திற்கு எந்த விளக்கமும் கிடைக்கவில்லை।',
      telugu: 'ఈ స్థానానికి వివరణ అందుబాటులో లేదు।'
    },
    makeAMannat: { 
      en: 'Make a Mannat', 
      hi: 'मन्नत मांगें',
      bangla: 'মননত করুন',
      kannada: 'ಮನ್ನತ್ ಮಾಡಿ',
      punjabi: 'ਮਨਨਤ ਕਰੋ',
      tamil: 'மன்னதை செய்யுங்கள்',
      telugu: 'మన్నత్ చేయండి'
    },
    mannatForm: { 
      en: 'Mannat Form', 
      hi: 'मन्नत फॉर्म',
      bangla: 'মননত ফর্ম',
      kannada: 'ಮನ್ನತ್ ಫಾರ್ಮ್',
      punjabi: 'ਮਨਨਤ ਫਾਰਮ',
      tamil: 'மன்னத படிவம்',
      telugu: 'మన్నత్ ఫారమ్'
    },
    makeYourMannat: { 
      en: 'Make your mannat (wish) at', 
      hi: 'अपनी मन्नत (इच्छा) मांगें',
      bangla: 'আপনার মননত (ইচ্ছা) করুন',
      kannada: 'ನಿಮ್ಮ ಮನ್ನತ್ (ಆಸೆ) ಮಾಡಿ',
      punjabi: 'ਆਪਣੀ ਮਨਨਤ (ਇੱਛਾ) ਕਰੋ',
      tamil: 'உங்கள் மன்னதை (ஆசை) செய்யுங்கள்',
      telugu: 'మీ మన్నత్ (కోరిక) చేయండి'
    },
    pleaseProvideInfo: { 
      en: 'Please provide the following information for us to contact you', 
      hi: 'कृपया हमसे संपर्क करने के लिए निम्नलिखित जानकारी प्रदान करें',
      bangla: 'আমাদের সাথে যোগাযোগের জন্য অনুগ্রহ করে নিম্নলিখিত তথ্য প্রদান করুন',
      kannada: 'ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನ ಮಾಹಿತಿಯನ್ನು ನೀಡಿ',
      punjabi: 'ਅਸੀਂ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਹੇਠ ਲਿਖੀ ਜਾਣਕਾਰੀ ਦਿਓ',
      tamil: 'உங்களைத் தொடர்பு கொள்ள எங்களுக்கு தயவுசெய்து பின்வரும் தகவலை வழங்கவும்',
      telugu: 'మేము మీతో సంప్రదించడానికి దయచేసి క్రింది సమాచారాన్ని అందించండి'
    },
    nameMin3: { 
      en: 'Name (Min 3 characters) *', 
      hi: 'नाम (न्यूनतम 3 अक्षर) *',
      bangla: 'নাম (সর্বনিম্ন 3 অক্ষর) *',
      kannada: 'ಹೆಸರು (ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು) *',
      punjabi: 'ਨਾਮ (ਘੱਟੋ-ਘੱਟ 3 ਅੱਖਰ) *',
      tamil: 'பெயர் (குறைந்தபட்சம் 3 எழுத்துகள்) *',
      telugu: 'పేరు (కనీసం 3 అక్షరాలు) *'
    },
    enterYourName: { 
      en: 'Enter your name', 
      hi: 'अपना नाम दर्ज करें',
      bangla: 'আপনার নাম লিখুন',
      kannada: 'ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் பெயரை உள்ளிடவும்',
      telugu: 'మీ పేరు నమోదు చేయండి'
    },
    phoneNumber: { 
      en: 'Phone Number *', 
      hi: 'फोन नंबर *',
      bangla: 'ফোন নম্বর *',
      kannada: 'ಫೋನ್ ಸಂಖ್ಯೆ *',
      punjabi: 'ਫੋਨ ਨੰਬਰ *',
      tamil: 'தொலைபேசி எண் *',
      telugu: 'ఫోన్ నంబర్ *'
    },
    enterPhoneNumber: { 
      en: 'Enter your phone number', 
      hi: 'अपना फोन नंबर दर्ज करें',
      bangla: 'আপনার ফোন নম্বর লিখুন',
      kannada: 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
      telugu: 'మీ ఫోన్ నంబర్ నమోదు చేయండి'
    },
    preferredDate: { 
      en: 'Preferred Date *', 
      hi: 'पसंदीदा तारीख *',
      bangla: 'পছন্দের তারিখ *',
      kannada: 'ಅಭಿಮತ ದಿನಾಂಕ *',
      punjabi: 'ਪਸੰਦੀਦਾ ਤਾਰੀਖ *',
      tamil: 'விருப்பமான தேதி *',
      telugu: 'అభిమత తేదీ *'
    },
    selectDate: { 
      en: 'Select Date', 
      hi: 'तारीख चुनें',
      bangla: 'তারিখ নির্বাচন করুন',
      kannada: 'ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਤਾਰੀਖ ਚੁਣੋ',
      tamil: 'தேதியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'తేదీని ఎంచుకోండి'
    },
    timeSlot: { 
      en: 'Time Slot *', 
      hi: 'समय स्लॉट *',
      bangla: 'সময় স্লট *',
      kannada: 'ಸಮಯ ಸ್ಲಾಟ್ *',
      punjabi: 'ਸਮਾਂ ਸਲਾਟ *',
      tamil: 'நேர இடைவெளி *',
      telugu: 'సమయ స్లాట్ *'
    },
    selectTimeSlot: { 
      en: 'Select Time Slot', 
      hi: 'समय स्लॉट चुनें',
      bangla: 'সময় স্লট নির্বাচন করুন',
      kannada: 'ಸಮಯ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ',
      tamil: 'நேர இடைவெளியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'సమయ స్లాట్ ఎంచుకోండి'
    },
    mannatOption: { 
      en: 'Mannat Option *', 
      hi: 'मन्नत विकल्प *',
      bangla: 'মননত বিকল্প *',
      kannada: 'ಮನ್ನತ್ ಆಯ್ಕೆ *',
      punjabi: 'ਮਨਨਤ ਵਿਕਲਪ *',
      tamil: 'மன்னத விருப்பம் *',
      telugu: 'మన్నత్ ఎంపిక *'
    },
    selectMannatOption: { 
      en: 'Select Mannat Option', 
      hi: 'मन्नत विकल्प चुनें',
      bangla: 'মননত বিকল্প নির্বাচন করুন',
      kannada: 'ಮನ್ನತ್ ಆಯ್ಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਮਨਨਤ ਵਿਕਲਪ ਚੁਣੋ',
      tamil: 'மன்னத விருப்பத்தைத் தேர்ந்தெடுக்கவும்',
      telugu: 'మన్నత్ ఎంపికను ఎంచుకోండి'
    },
    yourWish: { 
      en: 'Your Wish (Optional)', 
      hi: 'आपकी इच्छा (वैकल्पिक)',
      bangla: 'আপনার ইচ্ছা (ঐচ্ছিক)',
      kannada: 'ನಿಮ್ಮ ಆಸೆ (ಐಚ್ಛಿಕ)',
      punjabi: 'ਤੁਹਾਡੀ ਇੱਛਾ (ਵਿਕਲਪਿਕ)',
      tamil: 'உங்கள் ஆசை (விருப்பமானது)',
      telugu: 'మీ కోరిక (ఐచ్ఛికం)'
    },
    enterYourWish: { 
      en: 'Enter your wish', 
      hi: 'अपनी इच्छा दर्ज करें',
      bangla: 'আপনার ইচ্ছা লিখুন',
      kannada: 'ನಿಮ್ಮ ಆಸೆಯನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣੀ ਇੱਛਾ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் ஆசையை உள்ளிடவும்',
      telugu: 'మీ కోరికను నమోదు చేయండి'
    },
    submitMannat: { 
      en: 'Submit Mannat', 
      hi: 'मन्नत जमा करें',
      bangla: 'মননত জমা দিন',
      kannada: 'ಮನ್ನತ್ ಸಲ್ಲಿಸಿ',
      punjabi: 'ਮਨਨਤ ਜਮ੍ਹਾ ਕਰੋ',
      tamil: 'மன்னதை சமர்ப்பிக்கவும்',
      telugu: 'మన్నత్ సమర్పించండి'
    },
    submitting: { 
      en: 'Submitting...', 
      hi: 'जमा किया जा रहा है...',
      bangla: 'জমা করা হচ্ছে...',
      kannada: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਜਮ੍ਹਾ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      tamil: 'சமர்ப்பிக்கப்படுகிறது...',
      telugu: 'సమర్పించబడుతోంది...'
    },
    mannatAction: { 
      en: 'Mannat Action', 
      hi: 'मन्नत कार्य',
      bangla: 'মননত কাজ',
      kannada: 'ಮನ್ನತ್ ಕ್ರಿಯೆ',
      punjabi: 'ਮਨਨਤ ਕਾਰਜ',
      tamil: 'மன்னத செயல்',
      telugu: 'మన్నత్ చర్య'
    },
    describeWish: {
      en: 'Describe your wish or prayer...',
      hi: 'अपनी इच्छा या प्रार्थना का वर्णन करें...',
      bangla: 'আপনার ইচ্ছা বা প্রার্থনা বর্ণনা করুন...',
      kannada: 'ನಿಮ್ಮ ಆಸೆ ಅಥವಾ ಪ್ರಾರ್ಥನೆಯನ್ನು ವಿವರಿಸಿ...',
      punjabi: 'ਆਪਣੀ ਇੱਛਾ ਜਾਂ ਪ੍ਰਾਰਥਨਾ ਦਾ ਵਰਣਨ ਕਰੋ...',
      tamil: 'உங்கள் ஆசை அல்லது பிரார்த்தனையை விவரிக்கவும்...',
      telugu: 'మీ కోరిక లేదా ప్రార్థనను వివరించండి...'
    },
    // Error messages
    invalidName: {
      en: 'Invalid Name',
      hi: 'अमान्य नाम',
      bangla: 'অবৈধ নাম',
      kannada: 'ಅಮಾನ್ಯ ಹೆಸರು',
      punjabi: 'ਗਲਤ ਨਾਮ',
      tamil: 'தவறான பெயர்',
      telugu: 'చెల్లని పేరు'
    },
    nameMinLength: {
      en: 'Name must be at least 3 characters long.',
      hi: 'नाम कम से कम 3 अक्षर का होना चाहिए।',
      bangla: 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে।',
      kannada: 'ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು ಇರಬೇಕು।',
      punjabi: 'ਨਾਮ ਘੱਟੋ-ਘੱਟ 3 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
      tamil: 'பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்।',
      telugu: 'పేరు కనీసం 3 అక్షరాలుగా ఉండాలి।'
    },
    invalidPhone: {
      en: 'Invalid Phone',
      hi: 'अमान्य फोन',
      bangla: 'অবৈধ ফোন',
      kannada: 'ಅಮಾನ್ಯ ಫೋನ್',
      punjabi: 'ਗਲਤ ਫੋਨ',
      tamil: 'தவறான தொலைபேசி',
      telugu: 'చెల్లని ఫోన్'
    },
    phoneValidNumber: {
      en: 'Please enter a valid phone number.',
      hi: 'कृपया एक वैध फोन नंबर दर्ज करें।',
      bangla: 'অনুগ্রহ করে একটি বৈধ ফোন নম্বর লিখুন।',
      kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
      tamil: 'தயவுசெய்து சரியான தொலைபேசி எண்ணை உள்ளிடவும்।',
      telugu: 'దయచేసి చెల్లుబాటు అయ్యే ఫోన్ నంబర్ నమోదు చేయండి।'
    },
    invalidWish: {
      en: 'Invalid Wish',
      hi: 'अमान्य इच्छा',
      bangla: 'অবৈধ ইচ্ছা',
      kannada: 'ಅಮಾನ್ಯ ಇಚ್ಛೆ',
      punjabi: 'ਗਲਤ ਇੱਛਾ',
      tamil: 'தவறான ஆசை',
      telugu: 'చెల్లని కోరిక'
    },
    wishMinLength: {
      en: 'Please describe your wish (minimum 5 characters).',
      hi: 'कृपया अपनी इच्छा का वर्णन करें (न्यूनतम 5 अक्षर)।',
      bangla: 'অনুগ্রহ করে আপনার ইচ্ছা বর্ণনা করুন (সর্বনিম্ন ৫ অক্ষর)।',
      kannada: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಚ್ಛೆಯನ್ನು ವಿವರಿಸಿ (ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು)।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਇੱਛਾ ਦਾ ਵਰਣਨ ਕਰੋ (ਘੱਟੋ-ਘੱਟ 5 ਅੱਖਰ)।',
      tamil: 'தயவுசெய்து உங்கள் ஆசையை விவரிக்கவும் (குறைந்தது 5 எழுத்துகள்)।',
      telugu: 'దయచేసి మీ కోరికను వివరించండి (కనీసం 5 అక్షరాలు)।'
    },
    invalidMannatAction: {
      en: 'Invalid Mannat Action',
      hi: 'अमान्य मन्नत कार्य',
      bangla: 'অবৈধ মান্নত ক্রিয়া',
      kannada: 'ಅಮಾನ್ಯ ಮನ್ನತ್ ಕ್ರಿಯೆ',
      punjabi: 'ਗਲਤ ਮੰਨਤ ਕਾਰਵਾਈ',
      tamil: 'தவறான மன்னத் செயல்',
      telugu: 'చెల్లని మన్నత్ చర్య'
    },
    selectMannatAction: {
      en: 'Please select a mannat action.',
      hi: 'कृपया एक मन्नत कार्य चुनें।',
      bangla: 'অনুগ্রহ করে একটি মান্নত ক্রিয়া নির্বাচন করুন।',
      kannada: 'ದಯವಿಟ್ಟು ಮನ್ನತ್ ಕ್ರಿಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਮੰਨਤ ਕਾਰਵਾਈ ਚੁਣੋ।',
      tamil: 'தயவுசெய்து ஒரு மன்னத் செயலைத் தேர்ந்தெடுக்கவும்।',
      telugu: 'దయచేసి ఒక మన్నత్ చర్యను ఎంచుకోండి।'
    },
    invalidDate: {
      en: 'Invalid Date',
      hi: 'अमान्य तारीख',
      bangla: 'অবৈধ তারিখ',
      kannada: 'ಅಮಾನ್ಯ ದಿನಾಂಕ',
      punjabi: 'ਗਲਤ ਤਾਰੀਖ',
      tamil: 'தவறான தேதி',
      telugu: 'చెల్లని తేదీ'
    },
    selectDate: {
      en: 'Please select a preferred date.',
      hi: 'कृपया एक पसंदीदा तारीख चुनें।',
      bangla: 'অনুগ্রহ করে একটি পছন্দের তারিখ নির্বাচন করুন।',
      kannada: 'ದಯವಿಟ್ಟು ಆದ್ಯತೆಯ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਤਾਰੀਖ ਚੁਣੋ।',
      tamil: 'தயவுசெய்து விருப்பமான தேதியைத் தேர்ந்தெடுக்கவும்।',
      telugu: 'దయచేసి ఇష్టమైన తేదీని ఎంచుకోండి।'
    },
    invalidTime: {
      en: 'Invalid Time',
      hi: 'अमान्य समय',
      bangla: 'অবৈধ সময়',
      kannada: 'ಅಮಾನ್ಯ ಸಮಯ',
      punjabi: 'ਗਲਤ ਸਮਾਂ',
      tamil: 'தவறான நேரம்',
      telugu: 'చెల్లని సమయం'
    },
    selectTimeSlot: {
      en: 'Please select a preferred time slot.',
      hi: 'कृपया एक पसंदीदा समय स्लॉट चुनें।',
      bangla: 'অনুগ্রহ করে একটি পছন্দের সময় স্লট নির্বাচন করুন।',
      kannada: 'ದಯವಿಟ್ಟು ಆದ್ಯತೆಯ ಸಮಯ ಸ್ಲಾಟ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਸੰਦੀਦਾ ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ।',
      tamil: 'தயவுசெய்து விருப்பமான நேர இடைவெளியைத் தேர்ந்தெடுக்கவும்।',
      telugu: 'దయచేసి ఇష్టమైన సమయ స్లాట్‌ను ఎంచుకోండి।'
    },
    mannatSuccessful: {
      en: 'Mannat Submitted Successfully!',
      hi: 'मन्नत सफलतापूर्वक जमा!',
      bangla: 'মান্নত সফলভাবে জমা!',
      kannada: 'ಮನ್ನತ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਮੰਨਤ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ!',
      tamil: 'மன்னத் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      telugu: 'మన్నత్ విజయవంతంగా సమర్పించబడింది!'
    },
    thankYouMannat: {
      en: 'Your wish has been submitted. We will contact you soon.',
      hi: 'आपकी इच्छा जमा हो गई है। हम जल्द ही आपसे संपर्क करेंगे।',
      bangla: 'আপনার ইচ্ছা জমা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
      kannada: 'ನಿಮ್ಮ ಇಚ್ಛೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ। ನಾವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ।',
      punjabi: 'ਤੁਹਾਡੀ ਇੱਛਾ ਜਮ੍ਹਾ ਹੋ ਗਈ ਹੈ। ਅਸੀਂ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਾਂਗੇ।',
      tamil: 'உங்கள் ஆசை சமர்ப்பிக்கப்பட்டது। விரைவில் உங்களைத் தொடர்பு கொள்வோம்।',
      telugu: 'మీ కోరిక సమర్పించబడింది। మేము త్వరలో మీతో సంప్రదిస్తాము।'
    },
    failedToSubmit: {
      en: 'Failed to submit mannat. Please try again.',
      hi: 'मन्नत जमा करने में विफल। कृपया पुनः प्रयास करें।',
      bangla: 'মান্নত জমা দিতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
      kannada: 'ಮನ್ನತ್ ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਮੰਨਤ ਜਮ੍ਹਾ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'மன்னத்தை சமர்ப்பிக்க முடியவில்லை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      telugu: 'మన్నత్ సమర్పించడంలో విఫలమైంది। దయచేసి మళ్లీ ప్రయత్నించండి।'
    },
    error: {
      en: 'Error',
      hi: 'त्रुटि',
      bangla: 'ত্রুটি',
      kannada: 'ದೋಷ',
      punjabi: 'ਗਲਤੀ',
      tamil: 'பிழை',
      telugu: 'లోపం'
    }
  };
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TempleCharity | null>(null);
  
  // Mannat modal state
  const [showMannatModal, setShowMannatModal] = useState(false);
  const [mannatForm, setMannatForm] = useState({
    name: '',
    phone: '',
    date: '',
    timeSlot: '',
    mannatOption: '',
    wish: ''
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setMannatForm(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Fetch temples and charities data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = getEndpointUrl('TEMPLES_CHARITIES');
      
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: { limit: 100, offset: 0 }
      });


      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setData(fetchedData);
        setFilteredData(fetchedData);
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.deity.toLowerCase().includes(query) ||
        item.cause.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  // Monitor modal state changes
  useEffect(() => {
  }, [showModal, selectedItem]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Handle tile click - open modal with temple information
  const handleTileClick = (item: TempleCharity) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Handle mannat button click
  const handleMannatButtonClick = () => {
    setShowMannatModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Render loading state
  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={getTranslation(translations.searchPlaceholder)} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A00" />
          <Text style={styles.loadingText}>{getTranslation(translations.loadingTemples)}</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error && data.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={getTranslation(translations.searchPlaceholder)} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
            <Text style={styles.retryButtonText}>{getTranslation(translations.retry)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render empty state
  if (filteredData.length === 0 && !loading) {
  return (
    <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={getTranslation(translations.searchPlaceholder)} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? `${getTranslation(translations.noResults)} "${searchQuery}"`
              : getTranslation(translations.noTemplesAvailable)
            }
          </Text>
      </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder="Search for 'Temples'" 
        showDailyPujaButton={false} 
        onSearchChange={setSearchQuery}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tilesContainer}>
          <View style={styles.tilesGrid}>
            {filteredData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.tile}
                onPress={() => handleTileClick(item)}
                activeOpacity={0.8}
              >
                <View style={styles.tileHeader}>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: item.type === 'Temple' ? '#FF6A00' : '#4CAF50' }
                  ]}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  {item['80G'] === 'Yes' && (
                    <View style={styles.g80Badge}>
                      <Text style={styles.g80Text}>80G</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.tileTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                
                {item.type === 'Temple' && item.deity && (
                  <Text style={styles.tileDeity}>
                    🕉️ {item.deity}
                  </Text>
                )}
                
                {item.type === 'Charity' && item.cause && (
                  <Text style={styles.tileCause}>
                    🎯 {item.cause}
                  </Text>
                )}
                
                <View style={styles.tileLocation}>
                  <Text style={styles.locationText}>
                    📍 {item.city}, {item.state}
                  </Text>
                  {item.zip_pinCode && (
                    <Text style={styles.zipText}>
                      {item.zip_pinCode}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Temple/Charity Details Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
        onShow={() => {
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedItem?.name || 'Temple/Charity'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              {/* About Section */}
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>{getTranslation(translations.about)}</Text>
                <Text style={styles.aboutText}>
                  {selectedItem?.about || getTranslation(translations.noDescription)}
                </Text>
              </View>

              {/* Mannat Button */}
              <TouchableOpacity 
                style={styles.mannatButton}
                onPress={handleMannatButtonClick}
                activeOpacity={0.8}
              >
                <Text style={styles.mannatButtonText}>
                  {getTranslation(translations.makeAMannat)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Mannat Modal */}
      <Modal
        visible={showMannatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMannatModal(false)}
        onShow={() => {
        }}
      >
        <View style={styles.mannatModalOverlay}>
          <View style={styles.mannatModalContent}>
            <View style={styles.mannatModalHeader}>
              <Text style={styles.mannatModalTitle}>{getTranslation(translations.mannatForm)}</Text>
              <TouchableOpacity
                style={styles.mannatCloseButton}
                onPress={() => setShowMannatModal(false)}
              >
                <Text style={styles.mannatCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.mannatModalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.mannatModalScrollContent}
              onContentSizeChange={(width, height) => {
              }}
              onLayout={(event) => {
              }}
            >
              <Text style={styles.mannatModalSubtitle}>
                {getTranslation(translations.makeYourMannat)} {selectedItem?.name}
                {'\n'}{getTranslation(translations.pleaseProvideInfo)}
              </Text>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.nameMin3)}</Text>
                <TextInput
                  style={styles.mannatFormInput}
                  value={mannatForm.name}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, name: text }))}
                  placeholder={getTranslation(translations.enterYourName)}
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.phoneNumber)}</Text>
                <TextInput
                  style={styles.mannatFormInput}
                  value={mannatForm.phone}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, phone: text }))}
                  placeholder={getTranslation(translations.enterPhoneNumber)}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.yourWish)}</Text>
                <TextInput
                  style={styles.mannatFormTextArea}
                  value={mannatForm.wish}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, wish: text }))}
                  placeholder={getTranslation(translations.describeWish)}
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.mannatAction)}</Text>
                <View style={styles.mannatOptionGrid}>
                  {mannatOptions.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.mannatOptionItem,
                        mannatForm.mannatOption === option.label && styles.mannatOptionItemActive
                      ]}
                      onPress={() => setMannatForm(prev => ({ ...prev, mannatOption: option.label }))}
                    >
                      <Text style={[
                        styles.mannatOptionLabel,
                        mannatForm.mannatOption === option.label && styles.mannatOptionLabelActive
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.mannatOptionPrice,
                        mannatForm.mannatOption === option.label && styles.mannatOptionPriceActive
                      ]}>
                        {option.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.preferredDate)}</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={showDatePickerModal}
                >
                  <Text style={[
                    styles.dateSelectorText,
                    mannatForm.date && styles.dateSelectorTextActive
                  ]}>
                    {mannatForm.date ? mannatForm.date : getTranslation(translations.selectDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{getTranslation(translations.timeSlot)}</Text>
                <View style={styles.timeSlotGrid}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlotOption,
                        mannatForm.timeSlot === slot && styles.timeSlotOptionActive
                      ]}
                      onPress={() => setMannatForm(prev => ({ ...prev, timeSlot: slot }))}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        mannatForm.timeSlot === slot && styles.timeSlotTextActive
                      ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={async () => {
                  // Validation
                  if (!mannatForm.name || mannatForm.name.trim().length < 3) {
                    Alert.alert(getTranslation(translations.invalidName), getTranslation(translations.nameMinLength));
                    return;
                  }
                  
                  if (!mannatForm.phone || mannatForm.phone.length < 10) {
                    Alert.alert(getTranslation(translations.invalidPhone), getTranslation(translations.phoneValidNumber));
                    return;
                  }
                  
                  if (!mannatForm.wish || mannatForm.wish.trim().length < 5) {
                    Alert.alert(getTranslation(translations.invalidWish), getTranslation(translations.wishMinLength));
                    return;
                  }
                  
                  if (!mannatForm.mannatOption) {
                    Alert.alert(getTranslation(translations.invalidMannatAction), getTranslation(translations.selectMannatAction));
                    return;
                  }
                  
                  if (!mannatForm.date) {
                    Alert.alert(getTranslation(translations.invalidDate), getTranslation(translations.selectDate));
                    return;
                  }
                  
                  if (!mannatForm.timeSlot) {
                    Alert.alert(getTranslation(translations.invalidTime), getTranslation(translations.selectTimeSlot));
                    return;
                  }
                  
                  try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/mannat-bookings`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders(),
                      },
                      body: JSON.stringify({
                        name: mannatForm.name.trim(),
                        phone: mannatForm.phone,
                        mannatDesire: mannatForm.wish,
                        mannatOption: mannatForm.mannatOption,
                        templeCharityId: selectedItem?.id,
                        dateToContact: mannatForm.date,
                        timeSlot: mannatForm.timeSlot,
                      }),
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      Alert.alert(
                        getTranslation(translations.mannatSuccessful),
                        getTranslation(translations.thankYouMannat),
                        [
                          {
                            text: isHindi ? 'ठीक है' : 'OK',
                            onPress: () => {
                              setShowMannatModal(false);
                              setMannatForm({
                                name: '',
                                phone: '',
                                date: '',
                                timeSlot: '',
                                mannatOption: '',
                                wish: ''
                              });
                              setSelectedDate(new Date());
                            },
                          },
                        ]
                      );
                    } else {
                      const errorData = await response.json();
                      Alert.alert(getTranslation(translations.error), errorData.error || getTranslation(translations.failedToSubmit));
                    }
                  } catch (error) {
                    Alert.alert(getTranslation(translations.error), getTranslation(translations.failedToSubmit));
                  }
                }}
              >
                <Text style={styles.submitButtonText}>{getTranslation(translations.submitMannat)}</Text>
              </TouchableOpacity>
              
              {/* 100px white space at the end */}
              <View style={styles.mannatFormBottomSpacing} />
            </ScrollView>
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
          minimumDate={new Date(Date.now() + 18 * 60 * 60 * 1000)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  tilesContainer: {
    flex: 1,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  tile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
    minHeight: 200,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  g80Badge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  g80Text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 8,
    lineHeight: 20,
  },
  tileDeity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  tileCause: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  tileLocation: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  zipText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6A00',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
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
    width: '85%',
    maxHeight: '85%',
    minHeight: 300,
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
    color: '#FF6A00',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    flex: 1,
    paddingVertical: 10,
    minHeight: 200,
  },
  aboutSection: {
    marginBottom: 25,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  mannatButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mannatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Mannat Modal styles
  mannatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mannatModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '95%',
    minHeight: 400,
  },
  mannatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  mannatModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  mannatCloseButton: {
    padding: 5,
  },
  mannatCloseButtonText: {
    fontSize: 20,
    color: '#666',
  },
  mannatModalSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  mannatFormField: {
    marginBottom: 15,
  },
  mannatFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mannatFormInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  mannatFormTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    height: 80,
    textAlignVertical: 'top',
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#999',
  },
  dateSelectorTextActive: {
    color: '#333',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  timeSlotOptionActive: {
    borderColor: '#FF6A00',
    backgroundColor: '#FF6A00',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mannatFormBottomSpacing: {
    height: 100,
  },
  // Mannat option styles
  mannatOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mannatOptionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9',
    minWidth: '48%',
    alignItems: 'center',
  },
  mannatOptionItemActive: {
    borderColor: '#FF6A00',
    backgroundColor: '#FF6A00',
  },
  mannatOptionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  mannatOptionLabelActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  mannatOptionPrice: {
    fontSize: 16,
    color: '#FF6A00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mannatOptionPriceActive: {
    color: 'white',
  },
  // Mannat modal scroll styles
  mannatModalScrollView: {
    flex: 1,
  },
  mannatModalScrollContent: {
    paddingBottom: 20,
  },
}); 