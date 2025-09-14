import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: screenWidth } = Dimensions.get('window');

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  birthDayNumber: number;
  lifePathMeaning: string;
  destinyMeaning: string;
  soulMeaning: string;
  personalityMeaning: string;
  birthDayMeaning: string;
}

interface CompatibilityResult {
  compatibility: number;
  meaning: string;
  advice: string;
}

const NumerologyCalculator: React.FC = () => {
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
    title: { 
      en: 'Numerology Calculator', 
      hi: 'अंक ज्योतिष कैलकुलेटर',
      bangla: 'সংখ্যা জ্যোতিষ ক্যালকুলেটর',
      kannada: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
      punjabi: 'ਨਿਊਮਰੋਲੋਜੀ ਕੈਲਕੁਲੇਟਰ',
      tamil: 'எண் கணித கால்குலேட்டர்',
      telugu: 'సంఖ్యాశాస్త్ర కాలిక్యులేటర్'
    },
    fullName: { 
      en: 'Full Name', 
      hi: 'पूरा नाम',
      bangla: 'পুরো নাম',
      kannada: 'ಪೂರ್ಣ ಹೆಸರು',
      punjabi: 'ਪੂਰਾ ਨਾਮ',
      tamil: 'முழு பெயர்',
      telugu: 'పూర్తి పేరు'
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
    birthDate: { 
      en: 'Birth Date', 
      hi: 'जन्म तिथि',
      bangla: 'জন্ম তারিখ',
      kannada: 'ಜನ್ಮ ದಿನಾಂಕ',
      punjabi: 'ਜਨਮ ਮਿਤੀ',
      tamil: 'பிறந்த தேதி',
      telugu: 'పుట్టిన తేదీ'
    },
    selectBirthDate: { 
      en: 'Select Birth Date', 
      hi: 'जन्म तिथि चुनें',
      bangla: 'জন্ম তারিখ নির্বাচন করুন',
      kannada: 'ಜನ್ಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਜਨਮ ਮਿਤੀ ਚੁਣੋ',
      tamil: 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'పుట్టిన తేదీని ఎంచుకోండి'
    },
    calculate: { 
      en: 'Calculate', 
      hi: 'गणना करें',
      bangla: 'গণনা করুন',
      kannada: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
      punjabi: 'ਗਣਨਾ ਕਰੋ',
      tamil: 'கணக்கிடு',
      telugu: 'లెక్కించండి'
    },
    calculating: { 
      en: 'Calculating...', 
      hi: 'गणना की जा रही है...',
      bangla: 'গণনা করা হচ্ছে...',
      kannada: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਗਣਨਾ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
      tamil: 'கணக்கிடப்படுகிறது...',
      telugu: 'లెక్కించబడుతోంది...'
    },
    lifePathNumber: { 
      en: 'Life Path Number', 
      hi: 'जीवन पथ संख्या',
      bangla: 'জীবন পথ সংখ্যা',
      kannada: 'ಜೀವನ ಮಾರ್ಗ ಸಂಖ್ಯೆ',
      punjabi: 'ਜੀਵਨ ਪੱਥ ਨੰਬਰ',
      tamil: 'வாழ்க்கை பாதை எண்',
      telugu: 'జీవిత మార్గ సంఖ్య'
    },
    destinyNumber: { 
      en: 'Destiny Number', 
      hi: 'भाग्य संख्या',
      bangla: 'ভাগ্য সংখ্যা',
      kannada: 'ಭಾಗ್ಯ ಸಂಖ್ಯೆ',
      punjabi: 'ਭਾਗ ਨੰਬਰ',
      tamil: 'விதி எண்',
      telugu: 'భాగ్య సంఖ్య'
    },
    soulNumber: { 
      en: 'Soul Number', 
      hi: 'आत्मा संख्या',
      bangla: 'আত্মা সংখ্যা',
      kannada: 'ಆತ್ಮ ಸಂಖ್ಯೆ',
      punjabi: 'ਆਤਮਾ ਨੰਬਰ',
      tamil: 'ஆன்மா எண்',
      telugu: 'ఆత్మ సంఖ్య'
    },
    personalityNumber: { 
      en: 'Personality Number', 
      hi: 'व्यक्तित्व संख्या',
      bangla: 'ব্যক্তিত্ব সংখ্যা',
      kannada: 'ವ್ಯಕ್ತಿತ್ವ ಸಂಖ್ಯೆ',
      punjabi: 'ਵਿਅਕਤਿਤਵ ਨੰਬਰ',
      tamil: 'ஆளுமை எண்',
      telugu: 'వ్యక్తిత్వ సంఖ్య'
    },
    birthDayNumber: { 
      en: 'Birth Day Number', 
      hi: 'जन्म दिन संख्या',
      bangla: 'জন্ম দিন সংখ্যা',
      kannada: 'ಜನ್ಮ ದಿನ ಸಂಖ್ಯೆ',
      punjabi: 'ਜਨਮ ਦਿਨ ਨੰਬਰ',
      tamil: 'பிறந்த நாள் எண்',
      telugu: 'పుట్టిన రోజు సంఖ్య'
    },
    compatibility: { 
      en: 'Compatibility', 
      hi: 'अनुकूलता',
      bangla: 'সামঞ্জস্য',
      kannada: 'ಹೊಂದಾಣಿಕೆ',
      punjabi: 'ਅਨੁਕੂਲਤਾ',
      tamil: 'பொருந்தக்கூடிய தன்மை',
      telugu: 'అనుకూలత'
    },
    partnerName: { 
      en: 'Partner Name', 
      hi: 'साथी का नाम',
      bangla: 'সঙ্গীর নাম',
      kannada: 'ಭಾಗೀದಾರರ ಹೆಸರು',
      punjabi: 'ਭਾਗੀਦਾਰ ਦਾ ਨਾਮ',
      tamil: 'பங்காளி பெயர்',
      telugu: 'భాగస్వామి పేరు'
    },
    enterPartnerName: { 
      en: 'Enter partner\'s full name', 
      hi: 'साथी का पूरा नाम दर्ज करें',
      bangla: 'সঙ্গীর পুরো নাম লিখুন',
      kannada: 'ಭಾಗೀದಾರರ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਭਾਗੀਦਾਰ ਦਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      tamil: 'பங்காளியின் முழு பெயரை உள்ளிடவும்',
      telugu: 'భాగస్వామి పూర్తి పేరును నమోదు చేయండి'
    },
    partnerBirthDate: { 
      en: 'Partner Birth Date', 
      hi: 'साथी की जन्म तिथि',
      bangla: 'সঙ্গীর জন্ম তারিখ',
      kannada: 'ಭಾಗೀದಾರರ ಜನ್ಮ ದಿನಾಂಕ',
      punjabi: 'ਭਾਗੀਦਾਰ ਦੀ ਜਨਮ ਮਿਤੀ',
      tamil: 'பங்காளியின் பிறந்த தேதி',
      telugu: 'భాగస్వామి పుట్టిన తేదీ'
    },
    selectPartnerBirthDate: { 
      en: 'Select Partner Birth Date', 
      hi: 'साथी की जन्म तिथि चुनें',
      bangla: 'সঙ্গীর জন্ম তারিখ নির্বাচন করুন',
      kannada: 'ಭಾಗೀದಾರರ ಜನ್ಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਭਾਗੀਦਾਰ ਦੀ ਜਨਮ ਮਿਤੀ ਚੁਣੋ',
      tamil: 'பங்காளியின் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'భాగస్వామి పుట్టిన తేదీని ఎంచుకోండి'
    },
    calculateCompatibility: { 
      en: 'Calculate Compatibility', 
      hi: 'अनुकूलता की गणना करें',
      bangla: 'সামঞ্জস্য গণনা করুন',
      kannada: 'ಹೊಂದಾಣಿಕೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
      punjabi: 'ਅਨੁਕੂਲਤਾ ਦੀ ਗਣਨਾ ਕਰੋ',
      tamil: 'பொருந்தக்கூடிய தன்மையைக் கணக்கிடு',
      telugu: 'అనుకూలతను లెక్కించండి'
    },
    dailyNumber: { 
      en: 'Daily Number', 
      hi: 'दैनिक संख्या',
      bangla: 'দৈনিক সংখ্যা',
      kannada: 'ದೈನಂದಿನ ಸಂಖ್ಯೆ',
      punjabi: 'ਰੋਜ਼ਾਨਾ ਨੰਬਰ',
      tamil: 'தினசரி எண்',
      telugu: 'రోజువారీ సంఖ్య'
    },
    todayDate: { 
      en: 'Today\'s Date', 
      hi: 'आज की तारीख',
      bangla: 'আজকের তারিখ',
      kannada: 'ಇಂದಿನ ದಿನಾಂಕ',
      punjabi: 'ਅੱਜ ਦੀ ਮਿਤੀ',
      tamil: 'இன்றைய தேதி',
      telugu: 'ఈ రోజు తేదీ'
    },
    calculateDaily: { 
      en: 'Calculate Daily Number', 
      hi: 'दैनिक संख्या की गणना करें',
      bangla: 'দৈনিক সংখ্যা গণনা করুন',
      kannada: 'ದೈನಂದಿನ ಸಂಖ್ಯೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
      punjabi: 'ਰੋਜ਼ਾਨਾ ਨੰਬਰ ਦੀ ਗਣਨਾ ਕਰੋ',
      tamil: 'தினசரி எண்ணைக் கணக்கிடு',
      telugu: 'రోజువారీ సంఖ్యను లెక్కించండి'
    },
    aboutNumerology: { 
      en: 'About Numerology', 
      hi: 'अंक ज्योतिष के बारे में',
      bangla: 'সংখ্যা জ্যোতিষ সম্পর্কে',
      kannada: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಬಗ್ಗೆ',
      punjabi: 'ਨਿਊਮਰੋਲੋਜੀ ਬਾਰੇ',
      tamil: 'எண் கணிதம் பற்றி',
      telugu: 'సంఖ్యాశాస్త్రం గురించి'
    },
    aboutNumerologyText: { 
      en: 'Numerology is the mystical study of numbers and their influence on human life. Discover your life path, destiny, and personality through the power of numbers.', 
      hi: 'अंक ज्योतिष संख्याओं का रहस्यमय अध्ययन है और मानव जीवन पर उनके प्रभाव का। संख्याओं की शक्ति के माध्यम से अपने जीवन पथ, भाग्य और व्यक्तित्व की खोज करें।',
      bangla: 'সংখ্যা জ্যোতিষ হল সংখ্যার রহস্যময় অধ্যয়ন এবং মানব জীবনে তাদের প্রভাব। সংখ্যার শক্তির মাধ্যমে আপনার জীবন পথ, ভাগ্য এবং ব্যক্তিত্ব আবিষ্কার করুন।',
      kannada: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರವು ಸಂಖ್ಯೆಗಳ ರಹಸ್ಯ ಅಧ್ಯಯನ ಮತ್ತು ಮಾನವ ಜೀವನದ ಮೇಲೆ ಅವುಗಳ ಪ್ರಭಾವ. ಸಂಖ್ಯೆಗಳ ಶಕ್ತಿಯ ಮೂಲಕ ನಿಮ್ಮ ಜೀವನ ಮಾರ್ಗ, ಭಾಗ್ಯ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವವನ್ನು ಅನ್ವೇಷಿಸಿ.',
      punjabi: 'ਨਿਊਮਰੋਲੋਜੀ ਸੰਖਿਆਵਾਂ ਦਾ ਰਹੱਸਮਈ ਅਧਿਐਨ ਹੈ ਅਤੇ ਮਨੁੱਖੀ ਜੀਵਨ \'ਤੇ ਉਹਨਾਂ ਦੇ ਪ੍ਰਭਾਵ ਦਾ। ਸੰਖਿਆਵਾਂ ਦੀ ਸ਼ਕਤੀ ਰਾਹੀਂ ਆਪਣੇ ਜੀਵਨ ਪੱਥ, ਭਾਗ ਅਤੇ ਵਿਅਕਤਿਤਵ ਦੀ ਖੋਜ ਕਰੋ।',
      tamil: 'எண் கணிதம் என்பது எண்களின் மர்ம ஆய்வு மற்றும் மனித வாழ்க்கையில் அவற்றின் தாக்கம். எண்களின் சக்தியின் மூலம் உங்கள் வாழ்க்கை பாதை, விதி மற்றும் ஆளுமையைக் கண்டறியவும்.',
      telugu: 'సంఖ్యాశాస్త్రం అనేది సంఖ్యల మరియు మానవ జీవితంపై వాటి ప్రభావం యొక్క మర్మ అధ్యయనం. సంఖ్యల శక్తి ద్వారా మీ జీవిత మార్గం, భాగ్యం మరియు వ్యక్తిత్వాన్ని కనుగొనండి.'
    },
    close: { 
      en: 'Close', 
      hi: 'बंद करें',
      bangla: 'বন্ধ করুন',
      kannada: 'ಮುಚ್ಚಿ',
      punjabi: 'ਬੰਦ ਕਰੋ',
      tamil: 'மூடு',
      telugu: 'మూసివేయి'
    },
    nameRequired: { 
      en: 'Name is required', 
      hi: 'नाम आवश्यक है',
      bangla: 'নাম প্রয়োজন',
      kannada: 'ಹೆಸರು ಅಗತ್ಯ',
      punjabi: 'ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ',
      tamil: 'பெயர் தேவை',
      telugu: 'పేరు అవసరం'
    },
    birthDateRequired: { 
      en: 'Birth date is required', 
      hi: 'जन्म तिथि आवश्यक है',
      bangla: 'জন্ম তারিখ প্রয়োজন',
      kannada: 'ಜನ್ಮ ದಿನಾಂಕ ಅಗತ್ಯ',
      punjabi: 'ਜਨਮ ਮਿਤੀ ਜ਼ਰੂਰੀ ਹੈ',
      tamil: 'பிறந்த தேதி தேவை',
      telugu: 'పుట్టిన తేదీ అవసరం'
    },
    partnerNameRequired: { 
      en: 'Partner name is required', 
      hi: 'साथी का नाम आवश्यक है',
      bangla: 'সঙ্গীর নাম প্রয়োজন',
      kannada: 'ಭಾಗೀದಾರರ ಹೆಸರು ಅಗತ್ಯ',
      punjabi: 'ਭਾਗੀਦਾਰ ਦਾ ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ',
      tamil: 'பங்காளி பெயர் தேவை',
      telugu: 'భాగస్వామి పేరు అవసరం'
    },
    partnerBirthDateRequired: { 
      en: 'Partner birth date is required', 
      hi: 'साथी की जन्म तिथि आवश्यक है',
      bangla: 'সঙ্গীর জন্ম তারিখ প্রয়োজন',
      kannada: 'ಭಾಗೀदಾರರ ಜನ್ಮ ದಿನಾಂಕ ಅಗತ್ಯ',
      punjabi: 'ਭਾਗੀਦਾਰ ਦੀ ਜਨਮ ਮਿਤੀ ਜ਼ਰੂਰੀ ਹੈ',
      tamil: 'பங்காளியின் பிறந்த தேதி தேவை',
      telugu: 'భాగస్వామి పుట్టిన తేదీ అవసరం'
    }
  };

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [results, setResults] = useState<NumerologyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'compatibility' | 'daily'>('calculator');
  
  // Compatibility inputs
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState(new Date());
  const [showPartnerDatePicker, setShowPartnerDatePicker] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);

  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoDescription, setInfoDescription] = useState('');

  // ScrollView reference for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Numerology meanings
  const numberMeanings = {
    1: {
      lifePath: "Natural born leader with strong individuality and determination. You're ambitious, independent, and have a pioneering spirit.",
      destiny: "Destined for leadership roles. Your path involves creating new opportunities and inspiring others.",
      soul: "You seek independence and recognition. Your inner self craves achievement and being first.",
      personality: "Others see you as confident, ambitious, and sometimes aggressive. You appear strong-willed and determined.",
      birthDay: "You're a natural leader with strong willpower and determination."
    },
    2: {
      lifePath: "Diplomatic and peaceful nature. You're cooperative, supportive, and excel in partnerships and teamwork.",
      destiny: "Your destiny involves bringing harmony and balance. You're meant to work with others and create peace.",
      soul: "Your inner self seeks harmony, love, and cooperation. You value relationships deeply.",
      personality: "You appear gentle, diplomatic, and cooperative. Others see you as a peacemaker.",
      birthDay: "You're diplomatic, peaceful, and excel in partnerships and cooperation."
    },
    3: {
      lifePath: "Creative and expressive individual. You're artistic, optimistic, and have a natural ability to communicate.",
      destiny: "Your destiny involves creative expression and communication. You're meant to inspire and entertain others.",
      soul: "Your inner self craves self-expression, creativity, and joy. You're naturally optimistic.",
      personality: "Others see you as creative, expressive, and enthusiastic. You appear vibrant and inspiring.",
      birthDay: "You're creative, expressive, and have natural communication abilities."
    },
    4: {
      lifePath: "Practical and organized person. You're reliable, hardworking, and excel in building solid foundations.",
      destiny: "Your destiny involves creating stability and structure. You're meant to build lasting foundations.",
      soul: "Your inner self seeks security, order, and practical achievement. You value stability.",
      personality: "You appear reliable, practical, and organized. Others see you as dependable and methodical.",
      birthDay: "You're practical, organized, and excel in building solid foundations."
    },
    5: {
      lifePath: "Adventurous and freedom-loving individual. You're versatile, adaptable, and seek new experiences.",
      destiny: "Your destiny involves exploration and change. You're meant to experience life's variety and freedom.",
      soul: "Your inner self craves freedom, adventure, and new experiences. You're naturally restless.",
      personality: "Others see you as adventurous, versatile, and sometimes unpredictable. You appear dynamic.",
      birthDay: "You're adventurous, freedom-loving, and seek new experiences and change."
    },
    6: {
      lifePath: "Nurturing and responsible person. You're caring, compassionate, and excel in service to others.",
      destiny: "Your destiny involves caring for others and creating harmony. You're meant to be a nurturer.",
      soul: "Your inner self seeks to love and care for others. You're naturally compassionate and responsible.",
      personality: "You appear caring, responsible, and nurturing. Others see you as reliable and loving.",
      birthDay: "You're nurturing, responsible, and excel in caring for others and creating harmony."
    },
    7: {
      lifePath: "Analytical and spiritual individual. You're introspective, wise, and seek deeper understanding.",
      destiny: "Your destiny involves spiritual growth and intellectual pursuits. You're meant to seek wisdom.",
      soul: "Your inner self craves knowledge, wisdom, and spiritual understanding. You're naturally introspective.",
      personality: "Others see you as analytical, spiritual, and sometimes mysterious. You appear wise and thoughtful.",
      birthDay: "You're analytical, spiritual, and seek deeper understanding and wisdom."
    },
    8: {
      lifePath: "Ambitious and material-oriented person. You're powerful, efficient, and excel in business and finance.",
      destiny: "Your destiny involves material success and achievement. You're meant to build wealth and power.",
      soul: "Your inner self seeks material success, recognition, and achievement. You're naturally ambitious.",
      personality: "You appear powerful, ambitious, and efficient. Others see you as a natural leader in business.",
      birthDay: "You're ambitious, material-oriented, and excel in business, finance, and achievement."
    },
    9: {
      lifePath: "Humanitarian and compassionate individual. You're idealistic, generous, and seek to help humanity.",
      destiny: "Your destiny involves humanitarian work and universal love. You're meant to serve humanity.",
      soul: "Your inner self craves to help others and make the world better. You're naturally compassionate.",
      personality: "Others see you as humanitarian, generous, and idealistic. You appear caring and wise.",
      birthDay: "You're humanitarian, compassionate, and seek to help others and make the world better."
    },
    11: {
      lifePath: "Intuitive and spiritually gifted person. You're a master number with heightened intuition and spiritual awareness.",
      destiny: "Your destiny involves spiritual leadership and enlightenment. You're meant to inspire spiritual growth.",
      soul: "Your inner self is highly intuitive and spiritually aware. You have a deep connection to the divine.",
      personality: "Others see you as spiritually gifted, intuitive, and sometimes mysterious. You appear enlightened.",
      birthDay: "You're spiritually gifted with heightened intuition and spiritual awareness."
    },
    22: {
      lifePath: "Master builder and visionary. You're a master number with the ability to manifest dreams into reality.",
      destiny: "Your destiny involves building great things and manifesting grand visions. You're meant to create on a large scale.",
      soul: "Your inner self has grand visions and the power to manifest them. You're naturally ambitious and capable.",
      personality: "Others see you as a visionary and master builder. You appear capable of great achievements.",
      birthDay: "You're a master builder with the ability to manifest grand visions into reality."
    },
    33: {
      lifePath: "Master teacher and healer. You're a master number with the highest spiritual calling.",
      destiny: "Your destiny involves teaching, healing, and spiritual leadership. You're meant to guide others spiritually.",
      soul: "Your inner self is deeply spiritual and compassionate. You have a calling to heal and teach.",
      personality: "Others see you as a spiritual master, teacher, and healer. You appear enlightened and wise.",
      birthDay: "You're a master teacher and healer with the highest spiritual calling."
    }
  };

  // Number type explanations
  const numberTypeExplanations = {
    lifePath: {
      title: "Life Path Number",
      description: "The Life Path Number is the most important number in numerology, calculated from your birth date. It represents your life's purpose, the path you're meant to follow, and the lessons you need to learn in this lifetime. This number reveals your natural talents, abilities, and the direction your life should take to fulfill your destiny."
    },
    destiny: {
      title: "Destiny Number",
      description: "The Destiny Number, also known as the Expression Number, is calculated from your full name at birth. It represents your life's mission and what you're destined to accomplish. This number reveals your natural abilities, talents, and the ultimate goal you're working toward in this lifetime."
    },
    soul: {
      title: "Soul Number",
      description: "The Soul Number, also called the Heart's Desire Number, is calculated from the vowels in your full name. It represents your inner self, your true desires, and what your soul truly wants to experience. This number reveals your deepest motivations, emotional needs, and the inner drive that guides your decisions."
    },
    personality: {
      title: "Personality Number",
      description: "The Personality Number is calculated from the consonants in your full name. It represents how others see you and the impression you make on the world. This number reveals your outer personality, social behavior, and the way you present yourself to others in various situations."
    },
    birthDay: {
      title: "Birth Day Number",
      description: "The Birth Day Number is simply the day of the month you were born, reduced to a single digit (unless it's 11, 22, or 33). It represents your natural talents and abilities, as well as the specific gifts you bring to the world. This number influences your approach to life and the unique qualities that make you special."
    }
  };

  // Show info modal
  const showInfo = (numberType: keyof typeof numberTypeExplanations) => {
    setInfoTitle(numberTypeExplanations[numberType].title);
    setInfoDescription(numberTypeExplanations[numberType].description);
    setShowInfoModal(true);
  };

  // Close info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  // Handle modal overlay click
  const handleModalOverlayClick = () => {
    closeInfoModal();
  };

  // Calculate single digit from number (unless it's a master number)
  const reduceToSingleDigit = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) return num;
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  // Calculate Life Path Number from birth date
  const calculateLifePathNumber = (date: Date): number => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const daySum = reduceToSingleDigit(day);
    const monthSum = reduceToSingleDigit(month);
    const yearSum = reduceToSingleDigit(year);
    
    const total = daySum + monthSum + yearSum;
    return reduceToSingleDigit(total);
  };

  // Calculate Destiny Number from full name
  const calculateDestinyNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
      'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      total += letterValues[cleanName[i]] || 0;
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Soul Number (vowels only)
  const calculateSoulNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      const letter = cleanName[i];
      if (letterValues[letter]) {
        total += letterValues[letter];
      }
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Personality Number (consonants only)
  const calculatePersonalityNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'B': 2, 'C': 3, 'D': 4, 'F': 6, 'G': 7, 'H': 8, 'J': 1, 'K': 2, 'L': 3,
      'M': 4, 'N': 5, 'P': 7, 'Q': 8, 'R': 9, 'S': 1, 'T': 2, 'V': 4, 'W': 5, 'X': 6, 'Z': 8
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      const letter = cleanName[i];
      if (letterValues[letter]) {
        total += letterValues[letter];
      }
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Birth Day Number
  const calculateBirthDayNumber = (date: Date): number => {
    return reduceToSingleDigit(date.getDate());
  };

  // Calculate compatibility between two people
  const calculateCompatibility = () => {
    if (!fullName.trim() || !partnerName.trim()) {
      Alert.alert(
        getTranslation({ en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం' }),
        getTranslation({ en: 'Please enter both names', hi: 'कृपया दोनों नाम दर्ज करें', bangla: 'দয়া করে উভয় নাম লিখুন', kannada: 'ದಯವಿಟ್ಟು ಎರಡೂ ಹೆಸರುಗಳನ್ನು ನಮೂದಿಸಿ', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਦੋਵੇਂ ਨਾਮ ਦਰਜ ਕਰੋ', tamil: 'தயவுசெய்து இரண்டு பெயர்களையும் உள்ளிடவும்', telugu: 'దయచేసి రెండు పేర్లను నమోదు చేయండి' })
      );
      return;
    }

    const person1LifePath = calculateLifePathNumber(birthDate);
    const person2LifePath = calculateLifePathNumber(partnerBirthDate);
    
    // Simple compatibility calculation based on life path numbers
    const difference = Math.abs(person1LifePath - person2LifePath);
    let compatibility = 0;
    let meaning = '';
    let advice = '';

    if (difference === 0) {
      compatibility = 95;
      meaning = 'Excellent compatibility! You share the same life path number, indicating a deep spiritual connection.';
      advice = 'This relationship has great potential for growth and understanding. Focus on supporting each other\'s life purpose.';
    } else if (difference <= 2) {
      compatibility = 85;
      meaning = 'Very good compatibility. Your life path numbers are close, suggesting harmony and mutual understanding.';
      advice = 'Your differences complement each other well. Embrace the variety and learn from each other.';
    } else if (difference <= 4) {
      compatibility = 70;
      meaning = 'Good compatibility. You have moderate differences that can create balance in the relationship.';
      advice = 'Communication is key. Work on understanding each other\'s perspectives and life goals.';
    } else if (difference <= 6) {
      compatibility = 55;
      meaning = 'Moderate compatibility. Your life paths are quite different, which may require more effort to understand each other.';
      advice = 'Focus on finding common ground and respecting each other\'s individual paths. Patience and compromise are essential.';
    } else {
      compatibility = 40;
      meaning = 'Challenging compatibility. Your life paths are very different, which may lead to misunderstandings.';
      advice = 'This relationship will require significant effort, understanding, and compromise. Consider if your goals align.';
    }

    setCompatibilityResult({ compatibility, meaning, advice });
    
    // Scroll to results after a short delay to ensure they're rendered
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 400, animated: true });
    }, 100);
  };

  // Get daily lucky numbers
  const getDailyLuckyNumbers = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    const luckyNumbers = [
      reduceToSingleDigit(dayOfYear),
      reduceToSingleDigit(today.getDate()),
      reduceToSingleDigit(today.getMonth() + 1),
      reduceToSingleDigit(today.getFullYear())
    ];

    return [...new Set(luckyNumbers)]; // Remove duplicates
  };

  // Main calculation function
  const calculateNumerology = () => {
    if (!fullName.trim()) {
      Alert.alert(
        getTranslation({ en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం' }),
        getTranslation({ en: 'Please enter your full name', hi: 'कृपया अपना पूरा नाम दर्ज करें', bangla: 'দয়া করে আপনার পুরো নাম লিখুন', kannada: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ', punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ', tamil: 'தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்', telugu: 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి' })
      );
      return;
    }

    setIsCalculating(true);

    try {
      const lifePathNumber = calculateLifePathNumber(birthDate);
      const destinyNumber = calculateDestinyNumber(fullName);
      const soulNumber = calculateSoulNumber(fullName);
      const personalityNumber = calculatePersonalityNumber(fullName);
      const birthDayNumber = calculateBirthDayNumber(birthDate);

      const result: NumerologyResult = {
        lifePathNumber,
        destinyNumber,
        soulNumber,
        personalityNumber,
        birthDayNumber,
        lifePathMeaning: numberMeanings[lifePathNumber as keyof typeof numberMeanings]?.lifePath || 'Meaning not available',
        destinyMeaning: numberMeanings[destinyNumber as keyof typeof numberMeanings]?.destiny || 'Meaning not available',
        soulMeaning: numberMeanings[soulNumber as keyof typeof numberMeanings]?.soul || 'Meaning not available',
        personalityMeaning: numberMeanings[personalityNumber as keyof typeof numberMeanings]?.personality || 'Meaning not available',
        birthDayMeaning: numberMeanings[birthDayNumber as keyof typeof numberMeanings]?.birthDay || 'Meaning not available',
      };

      setResults(result);
      
      // Scroll to results after a short delay to ensure they're rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 100);
    } catch (error) {
      Alert.alert(
        getTranslation({ en: 'Error', hi: 'त्रुटि', bangla: 'ত্রুটি', kannada: 'ದೋಷ', punjabi: 'ਗਲਤੀ', tamil: 'பிழை', telugu: 'లోపం' }),
        getTranslation({ en: 'An error occurred while calculating. Please try again.', hi: 'गणना के दौरान त्रुटि हुई। कृपया पुनः प्रयास करें।', bangla: 'গণনার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।', kannada: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।', punjabi: 'ਗਣਨਾ ਦੌਰਾਨ ਇੱਕ ਗਲਤੀ ਹੋਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', tamil: 'கணக்கிடும் போது பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.', telugu: 'లెక్కించేటప్పుడు లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.' })
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Handle partner date change
  const onPartnerDateChange = (event: any, selectedDate?: Date) => {
    setShowPartnerDatePicker(false);
    if (selectedDate) {
      setPartnerBirthDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCalculatorTab = () => (
    <>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{getTranslation({ en: 'Your Information', hi: 'आपकी जानकारी', bangla: 'আপনার তথ্য', kannada: 'ನಿಮ್ಮ ಮಾಹಿತಿ', punjabi: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ', tamil: 'உங்கள் தகவல்', telugu: 'మీ సమాచారం' })}</Text>
        
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation(translations.fullName)}</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder={getTranslation(translations.enterFullName)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Birth Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation(translations.birthDate)}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(birthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateNumerology}
          disabled={isCalculating}
        >
          <LinearGradient
            colors={['#FFA040', '#FF6A00']}
            style={styles.calculateButtonGradient}
          >
            <Text style={styles.calculateButtonText}>
              {isCalculating ? getTranslation(translations.calculating) : getTranslation({ en: 'Calculate Numerology', hi: 'अंक ज्योतिष की गणना करें', bangla: 'সংখ্যা জ্যোতিষ গণনা করুন', kannada: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರವನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ', punjabi: 'ਨਿਊਮਰੋਲੋਜੀ ਦੀ ਗਣਨਾ ਕਰੋ', tamil: 'எண் கணிதத்தைக் கணக்கிடு', telugu: 'సంఖ్యాశాస్త్రాన్ని లెక్కించండి' })}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* {getTranslation({ en: 'Clear', hi: 'साफ करें', bangla: 'পরিষ্কার করুন', kannada: 'ಸ್ಪಷ್ಟವಾಗಿ', punjabi: 'ਸਾਫ਼ ਕਰੋ', tamil: 'அழிக்க', telugu: 'క్లియర్' })} Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setFullName('');
            setBirthDate(new Date());
            setResults(null);
            // Scroll to top after clearing
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Text style={styles.clearButtonText}>{getTranslation({ en: 'Clear', hi: 'साफ करें', bangla: 'পরিষ্কার করুন', kannada: 'ಸ್ಪಷ್ಟವಾಗಿ', punjabi: 'ਸਾਫ਼ ਕਰੋ', tamil: 'அழிக்க', telugu: 'క్లియర్' })}</Text>
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>{getTranslation({ en: 'Your Numerology Numbers', hi: 'आपकी अंक ज्योतिष संख्याएं', bangla: 'আপনার সংখ্যা জ্যোতিষ সংখ্যা', kannada: 'ನಿಮ್ಮ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸಂಖ್ಯೆಗಳು', punjabi: 'ਤੁਹਾਡੇ ਨਿਊਮਰੋਲੋਜੀ ਨੰਬਰ', tamil: 'உங்கள் எண் கணித எண்கள்', telugu: 'మీ సంఖ్యాశాస్త్ర సంఖ్యలు' })}</Text>
          <Text style={styles.clickInstruction}>{getTranslation({ en: 'Click any tile to know more', hi: 'अधिक जानने के लिए किसी भी टाइल पर क्लिक करें', bangla: 'আরও জানতে যেকোনো টাইল ক্লিক করুন', kannada: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಲು ಯಾವುದೇ ಟೈಲ್ ಕ್ಲಿಕ್ ಮಾಡಿ', punjabi: 'ਹੋਰ ਜਾਣਨ ਲਈ ਕੋਈ ਵੀ ਟਾਈਲ ਕਲਿੱਕ ਕਰੋ', tamil: 'மேலும் அறிய எந்த டைலைக் கிளிக் செய்யவும்', telugu: 'మరింత తెలుసుకోవడానికి ఏదైనా టైల్ క్లిక్ చేయండి' })}</Text>
          
          {/* Life Path Number */}
          <TouchableOpacity onPress={() => showInfo('lifePath')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>{getTranslation(translations.lifePathNumber)}</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.lifePathNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.lifePathMeaning}</Text>
          </TouchableOpacity>

          {/* Destiny Number */}
          <TouchableOpacity onPress={() => showInfo('destiny')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>{getTranslation(translations.destinyNumber)}</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.destinyNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.destinyMeaning}</Text>
          </TouchableOpacity>

          {/* Soul Number */}
          <TouchableOpacity onPress={() => showInfo('soul')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>{getTranslation(translations.soulNumber)}</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.soulNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.soulMeaning}</Text>
          </TouchableOpacity>

          {/* Personality Number */}
          <TouchableOpacity onPress={() => showInfo('personality')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>{getTranslation(translations.personalityNumber)}</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.personalityNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.personalityMeaning}</Text>
          </TouchableOpacity>

          {/* Birth Day Number */}
          <TouchableOpacity onPress={() => showInfo('birthDay')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>{getTranslation(translations.birthDayNumber)}</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.birthDayNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.birthDayMeaning}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderCompatibilityTab = () => (
    <>
      <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>{getTranslation({ en: 'Compatibility Calculator', hi: 'अनुकूलता कैलकुलेटर', bangla: 'সামঞ্জস্য ক্যালকুলেটর', kannada: 'ಹೊಂದಾಣಿಕೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್', punjabi: 'ਅਨੁਕੂਲਤਾ ਕੈਲਕੁਲੇਟਰ', tamil: 'பொருந்தக்கூடிய தன்மை கால்குலேட்டர்', telugu: 'అనుకూలత కాలిక్యులేటర్' })}</Text>
        
        {/* Person 1 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation({ en: 'Your Name', hi: 'आपका नाम', bangla: 'আপনার নাম', kannada: 'ನಿಮ್ಮ ಹೆಸರು', punjabi: 'ਤੁਹਾਡਾ ਨਾਮ', tamil: 'உங்கள் பெயர்', telugu: 'మీ పేరు' })}</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder={getTranslation(translations.enterFullName)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation({ en: 'Your Birth Date', hi: 'आपकी जन्म तिथि', bangla: 'আপনার জন্ম তারিখ', kannada: 'ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ', punjabi: 'ਤੁਹਾਡੀ ਜਨਮ ਮਿਤੀ', tamil: 'உங்கள் பிறந்த தேதி', telugu: 'మీ పుట్టిన తేదీ' })}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(birthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Person 2 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation(translations.partnerName)}</Text>
          <TextInput
            style={styles.textInput}
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder={getTranslation(translations.enterPartnerName)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getTranslation(translations.partnerBirthDate)}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPartnerDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(partnerBirthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateCompatibility}
        >
          <LinearGradient
            colors={['#FFA040', '#FF6A00']}
            style={styles.calculateButtonGradient}
          >
            <Text style={styles.calculateButtonText}>{getTranslation(translations.calculateCompatibility)}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* {getTranslation({ en: 'Clear', hi: 'साफ करें', bangla: 'পরিষ্কার করুন', kannada: 'ಸ್ಪಷ್ಟವಾಗಿ', punjabi: 'ਸਾਫ਼ ਕਰੋ', tamil: 'அழிக்க', telugu: 'క్లియర్' })} Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setFullName('');
            setPartnerName('');
            setBirthDate(new Date());
            setPartnerBirthDate(new Date());
            setCompatibilityResult(null);
            // Scroll to top after clearing
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Text style={styles.clearButtonText}>{getTranslation({ en: 'Clear', hi: 'साफ करें', bangla: 'পরিষ্কার করুন', kannada: 'ಸ್ಪಷ್ಟವಾಗಿ', punjabi: 'ਸਾਫ਼ ਕਰੋ', tamil: 'அழிக்க', telugu: 'క్లియర్' })}</Text>
        </TouchableOpacity>
      </View>

      {compatibilityResult && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>{getTranslation({ en: 'Compatibility Results', hi: 'अनुकूलता परिणाम', bangla: 'সামঞ্জস্য ফলাফল', kannada: 'ಹೊಂದಾಣಿಕೆ ಫಲಿತಾಂಶಗಳು', punjabi: 'ਅਨੁਕੂਲਤਾ ਨਤੀਜੇ', tamil: 'பொருந்தக்கூடிய தன்மை முடிவுகள்', telugu: 'అనుకూలత ఫలితాలు' })}</Text>
          
          <View style={styles.compatibilityCard}>
            <View style={styles.compatibilityHeader}>
              <Text style={styles.compatibilityScore}>{compatibilityResult.compatibility}%</Text>
              <Text style={styles.compatibilityLabel}>{getTranslation(translations.compatibility)}</Text>
            </View>
            <Text style={styles.compatibilityMeaning}>{compatibilityResult.meaning}</Text>
            <Text style={styles.compatibilityAdvice}>{compatibilityResult.advice}</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderDailyTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{getTranslation({ en: 'Daily Numerology', hi: 'दैनिक अंक ज्योतिष', bangla: 'দৈনিক সংখ্যা জ্যোতিষ', kannada: 'ದೈನಂದಿನ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ', punjabi: 'ਰੋਜ਼ਾਨਾ ਨਿਊਮਰੋਲੋਜੀ', tamil: 'தினசரி எண் கணிதம்', telugu: 'రోజువారీ సంఖ్యాశాస్త్రం' })}</Text>
        
        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>{getTranslation({ en: 'Today\'s Lucky Numbers', hi: 'आज के भाग्यशाली नंबर', bangla: 'আজকের ভাগ্যবান সংখ্যা', kannada: 'ಇಂದಿನ ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು', punjabi: 'ਅੱਜ ਦੇ ਖੁਸ਼ਕਿਸਮਤ ਨੰਬਰ', tamil: 'இன்றைய அதிர்ஷ்ட எண்கள்', telugu: 'ఈ రోజు అదృష్ట సంఖ్యలు' })}</Text>
          <View style={styles.luckyNumbersContainer}>
            {getDailyLuckyNumbers().map((number, index) => (
              <View key={index} style={styles.luckyNumberCircle}>
                <Text style={styles.luckyNumberText}>{number}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.dailyInfo}>
            {getTranslation({ en: 'These numbers are calculated based on today\'s date and may bring you good fortune throughout the day.', hi: 'ये नंबर आज की तारीख के आधार पर गणना किए गए हैं और पूरे दिन आपके लिए सौभाग्य ला सकते हैं।', bangla: 'এই সংখ্যাগুলি আজকের তারিখের ভিত্তিতে গণনা করা হয়েছে এবং সারাদিন আপনার জন্য সৌভাগ্য আনতে পারে।', kannada: 'ಈ ಸಂಖ್ಯೆಗಳು ಇಂದಿನ ದಿನಾಂಕದ ಆಧಾರದ ಮೇಲೆ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಸಂಪೂರ್ಣ ದಿನ ನಿಮಗೆ ಅದೃಷ್ಟ ತರಬಹುದು.', punjabi: 'ਇਹ ਨੰਬਰ ਅੱਜ ਦੀ ਮਿਤੀ ਦੇ ਆਧਾਰ \'ਤੇ ਗਣਨਾ ਕੀਤੇ ਗਏ ਹਨ ਅਤੇ ਪੂਰੇ ਦਿਨ ਤੁਹਾਡੇ ਲਈ ਖੁਸ਼ਕਿਸਮਤੀ ਲਿਆ ਸਕਦੇ ਹਨ।', tamil: 'இந்த எண்கள் இன்றைய தேதியின் அடிப்படையில் கணக்கிடப்படுகின்றன மற்றும் முழு நாளும் உங்களுக்கு அதிர்ஷ்டத்தைக் கொண்டு வரலாம்.', telugu: 'ఈ సంఖ్యలు ఈ రోజు తేదీ ఆధారంగా లెక్కించబడ్డాయి మరియు మొత్తం రోజు మీకు అదృష్టాన్ని తీసుకురావచ్చు.' })}
          </Text>
        </View>

        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>{getTranslation({ en: 'Daily Affirmation', hi: 'दैनिक पुष्टि', bangla: 'দৈনিক নিশ্চিতকরণ', kannada: 'ದೈನಂದಿನ ದೃಢೀಕರಣ', punjabi: 'ਰੋਜ਼ਾਨਾ ਪੁਸ਼ਟੀ', tamil: 'தினசரி உறுதிப்படுத்தல்', telugu: 'రోజువారీ ధృడీకరణ' })}</Text>
          <Text style={styles.dailyAffirmation}>
            {getTranslation({ en: '"Today I align with the positive vibrations of the universe and embrace the opportunities that come my way."', hi: '"आज मैं ब्रह्मांड की सकारात्मक कंपन के साथ संरेखित होता हूं और अपने रास्ते में आने वाले अवसरों को अपनाता हूं।"', bangla: '"আজ আমি মহাবিশ্বের ইতিবাচক কম্পনের সাথে সারিবদ্ধ হই এবং আমার পথে আসা সুযোগগুলি গ্রহণ করি।"', kannada: '"ಇಂದು ನಾನು ಬ್ರಹ್ಮಾಂಡದ ಧನಾತ್ಮಕ ಕಂಪನಗಳೊಂದಿಗೆ ಸಮಂಜಸವಾಗುತ್ತೇನೆ ಮತ್ತು ನನ್ನ ದಾರಿಯಲ್ಲಿ ಬರುವ ಅವಕಾಶಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೇನೆ."', punjabi: '"ਅੱਜ ਮੈਂ ਬ੍ਰਹਿਮੰਡ ਦੀਆਂ ਸਕਾਰਾਤਮਕ ਕੰਪਨਾਂ ਨਾਲ ਸੰਬੰਧਿਤ ਹੁੰਦਾ ਹਾਂ ਅਤੇ ਆਪਣੇ ਰਸਤੇ ਵਿੱਚ ਆਉਣ ਵਾਲੇ ਮੌਕਿਆਂ ਨੂੰ ਅਪਣਾਉਂਦਾ ਹਾਂ।"', tamil: '"இன்று நான் பிரபஞ்சத்தின் நேர்மறையான அதிர்வுகளுடன் சீரமைக்கிறேன் மற்றும் என்னுடைய வழியில் வரும் வாய்ப்புகளை ஏற்றுக்கொள்கிறேன்."', telugu: '"ఈరోజు నేను విశ్వం యొక్క సానుకూల కంపనాలతో సమన్వయం చేసుకుంటాను మరియు నా మార్గంలో వచ్చే అవకాశాలను అంగీకరిస్తాను."' })}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 200 }}
      showsVerticalScrollIndicator={false} 
      ref={scrollViewRef}
    >
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calculator' && styles.activeTab]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabText, activeTab === 'calculator' && styles.activeTabText]}>
            {getTranslation({ en: 'Calculator', hi: 'कैलकुलेटर', bangla: 'ক্যালকুলেটর', kannada: 'ಕ್ಯಾಲ್ಕುಲೇಟರ್', punjabi: 'ਕੈਲਕੁਲੇਟਰ', tamil: 'கால்குலேட்டர்', telugu: 'కాలిక్యులేటర్' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compatibility' && styles.activeTab]}
          onPress={() => setActiveTab('compatibility')}
        >
          <Text style={[styles.tabText, activeTab === 'compatibility' && styles.activeTabText]}>
            {getTranslation(translations.compatibility)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
            {getTranslation({ en: 'Daily', hi: 'दैनिक', bangla: 'দৈনিক', kannada: 'ದೈನಂದಿನ', punjabi: 'ਰੋਜ਼ਾਨਾ', tamil: 'தினசரி', telugu: 'రోజువారీ' })}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'compatibility' && renderCompatibilityTab()}
        {activeTab === 'daily' && renderDailyTab()}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{getTranslation(translations.aboutNumerology)}</Text>
          <Text style={styles.infoText}>
            {getTranslation(translations.aboutNumerologyText)}
          </Text>
          <Text style={styles.infoText}>
            {getTranslation({ en: 'Your Life Path Number is the most important number in numerology, calculated from your birth date. It reveals your life\'s purpose and the path you\'re meant to follow.', hi: 'आपकी जीवन पथ संख्या अंक ज्योतिष में सबसे महत्वपूर्ण संख्या है, जो आपकी जन्म तिथि से गणना की जाती है। यह आपके जीवन के उद्देश्य और आपके अनुसरण करने वाले मार्ग को प्रकट करती है।', bangla: 'আপনার জীবন পথ সংখ্যা সংখ্যা জ্যোতিষে সবচেয়ে গুরুত্বপূর্ণ সংখ্যা, যা আপনার জন্ম তারিখ থেকে গণনা করা হয়। এটি আপনার জীবনের উদ্দেশ্য এবং আপনি যে পথ অনুসরণ করবেন তা প্রকাশ করে।', kannada: 'ನಿಮ್ಮ ಜೀವನ ಮಾರ್ಗ ಸಂಖ್ಯೆಯು ಸಂಖ್ಯಾಶಾಸ್ತ್ರದಲ್ಲಿ ಅತ್ಯಂತ ಪ್ರಮುಖ ಸಂಖ್ಯೆಯಾಗಿದೆ, ಇದು ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕದಿಂದ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಜೀವನದ ಉದ್ದೇಶ ಮತ್ತು ನೀವು ಅನುಸರಿಸಬೇಕಾದ ಮಾರ್ಗವನ್ನು ಬಹಿರಂಗಪಡಿಸುತ್ತದೆ.', punjabi: 'ਤੁਹਾਡਾ ਜੀਵਨ ਪੱਥ ਨੰਬਰ ਨਿਊਮਰੋਲੋਜੀ ਵਿੱਚ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਨੰਬਰ ਹੈ, ਜੋ ਤੁਹਾਡੀ ਜਨਮ ਮਿਤੀ ਤੋਂ ਗਣਨਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਇਹ ਤੁਹਾਡੇ ਜੀਵਨ ਦੇ ਮਕਸਦ ਅਤੇ ਤੁਹਾਨੂੰ ਅਨੁਸਰਣ ਕਰਨ ਵਾਲੇ ਮਾਰਗ ਨੂੰ ਪ੍ਰਕਟ ਕਰਦਾ ਹੈ।', tamil: 'உங்கள் வாழ்க்கை பாதை எண் எண் கணிதத்தில் மிக முக்கியமான எண்ணாகும், இது உங்கள் பிறந்த தேதியிலிருந்து கணக்கிடப்படுகிறது. இது உங்கள் வாழ்க்கையின் நோக்கம் மற்றும் நீங்கள் பின்பற்ற வேண்டிய பாதையை வெளிப்படுத்துகிறது.', telugu: 'మీ జీవిత మార్గ సంఖ్య సంఖ్యాశాస్త్రంలో అత్యంత ముఖ్యమైన సంఖ్య, ఇది మీ పుట్టిన తేదీ నుండి లెక్కించబడుతుంది. ఇది మీ జీవితం యొక్క ప్రయోజనం మరియు మీరు అనుసరించాల్సిన మార్గాన్ని బహిర్గతం చేస్తుంది.' })}
          </Text>
        </View>
      </View>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={new Date()}
        />
      )}
      
      {showPartnerDatePicker && (
        <DateTimePicker
          value={partnerBirthDate}
          mode="date"
          display="default"
          onChange={onPartnerDateChange}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={new Date()}
        />
      )}

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
              <LinearGradient
                colors={['#FFA040', '#FF6A00']}
                style={styles.modalCloseButtonGradient}
              >
                <Text style={styles.modalCloseButtonText}>{getTranslation({ en: 'Got it!', hi: 'समझ गया!', bangla: 'বুঝেছি!', kannada: 'ತಿಳಿದುಬಂದಿದೆ!', punjabi: 'ਸਮਝ ਗਿਆ!', tamil: 'புரிந்தது!', telugu: 'తెలుసుకున్నాను!' })}</Text>
              </LinearGradient>
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  calculateButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    padding: 18,
    alignItems: 'center',
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
  numberCard: {
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
  numberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  numberTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  numberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberMeaning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  clickInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  compatibilityCard: {
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
  compatibilityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compatibilityScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFA040',
  },
  compatibilityLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  compatibilityMeaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  compatibilityAdvice: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dailyCard: {
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
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  luckyNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  luckyNumberCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  luckyNumberText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  dailyAffirmation: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
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
    width: '80%',
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
    textAlign: 'center',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalCloseButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NumerologyCalculator;
