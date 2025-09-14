import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator, Alert } from 'react-native';
import { getEndpointUrl } from '@/constants/ApiConfig';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function AstrologyScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [rashifalModalVisible, setRashifalModalVisible] = useState(false);
  const [rashifalData, setRashifalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rashiCalculatorModalVisible, setRashiCalculatorModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [calculatedRashi, setCalculatedRashi] = useState<string | null>(null);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

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

  const translations = {
    headline: { 
      en: 'Discover the timeless wisdom of the stars.', 
      hi: 'तारों के कालातीत ज्ञान की खोज करें।',
      bangla: 'তারার চিরন্তন জ্ঞানের সন্ধান করুন।',
      kannada: 'ನಕ್ಷತ್ರಗಳ ಕಾಲಾತೀತ ಜ್ಞಾನವನ್ನು ಆವಿಷ್ಕರಿಸಿ।',
      punjabi: 'ਤਾਰਿਆਂ ਦੇ ਕਾਲਾਤੀਤ ਗਿਆਨ ਦੀ ਖੋਜ ਕਰੋ।',
      tamil: 'நட்சத்திரங்களின் காலமற்ற ஞானத்தைக் கண்டறியுங்கள்।',
      telugu: 'నక్షత్రాల కాలరహిత జ్ఞానాన్ని కనుగొనండి।'
    },
    content1: { 
      en: 'Astrology isn\'t just about predicting the future. It\'s a guide to understanding yourself, your relationships, and the energies shaping your life.', 
      hi: 'ज्योतिष केवल भविष्य की भविष्यवाणी के बारे में नहीं है। यह अपने आप को समझने, अपने रिश्तों को समझने और आपके जीवन को आकार देने वाली ऊर्जाओं के लिए एक मार्गदर्शक है।',
      bangla: 'জ্যোতিষশাস্ত্র শুধু ভবিষ্যৎ ভবিষ্যদ্বাণী নয়। এটি নিজেকে, আপনার সম্পর্ক এবং আপনার জীবনের আকৃতি দেওয়া শক্তিগুলিকে বুঝতে একটি গাইড।',
      kannada: 'ಜ್ಯೋತಿಷ್ಯವು ಭವಿಷ್ಯವನ್ನು ಭವಿಷ್ಯಸೂಚಿಸುವುದರ ಬಗ್ಗೆ ಮಾತ್ರವಲ್ಲ. ಇದು ನಿಮ್ಮನ್ನು, ನಿಮ್ಮ ಸಂಬಂಧಗಳನ್ನು ಮತ್ತು ನಿಮ್ಮ ಜೀವನವನ್ನು ಆಕಾರಗೊಳಿಸುವ ಶಕ್ತಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಒಂದು ಮಾರ್ಗದರ್ಶಿ.',
      punjabi: 'ਜੋਤਿਸ਼ ਭਵਿੱਖ ਦੀ ਭਵਿੱਖਵਾਣੀ ਬਾਰੇ ਹੀ ਨਹੀਂ ਹੈ। ਇਹ ਆਪਣੇ ਆਪ ਨੂੰ ਸਮਝਣ, ਆਪਣੇ ਰਿਸ਼ਤਿਆਂ ਅਤੇ ਤੁਹਾਡੇ ਜੀਵਨ ਨੂੰ ਆਕਾਰ ਦੇਣ ਵਾਲੀਆਂ ਊਰਜਾਵਾਂ ਲਈ ਇੱਕ ਗਾਈਡ ਹੈ।',
      tamil: 'ஜோதிடம் எதிர்காலத்தை கணித்தல் மட்டுமல்ல. இது உங்களை, உங்கள் உறவுகள் மற்றும் உங்கள் வாழ்க்கையை வடிவமைக்கும் ஆற்றல்களை புரிந்துகொள்ள ஒரு வழிகாட்டி.',
      telugu: 'జ్యోతిష్యం భవిష్యత్తును అంచనా వేయడం మాత్రమే కాదు. ఇది మిమ్మల్ని, మీ సంబంధాలు మరియు మీ జీవితాన్ని ఆకృతి చేసే శక్తులను అర్థం చేసుకోవడానికి ఒక మార్గదర్శకం.'
    },
    content2: { 
      en: 'In our astrology section, you\'ll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.', 
      hi: 'हमारे ज्योतिष अनुभाग में, आपको जल्द ही व्यक्तिगत अंतर्दृष्टि मिलेगी — आपके जन्म चार्ट से लेकर दैनिक ब्रह्मांडीय अपडेट तक — जो आपको ब्रह्मांड की लय के साथ अपने विचारों और कार्यों को संरेखित करने में मदद करेगी।',
      bangla: 'আমাদের জ্যোতিষশাস্ত্র বিভাগে, আপনি শীঘ্রই ব্যক্তিগত অন্তর্দৃষ্টি পাবেন — আপনার জন্ম চার্ট থেকে দৈনিক মহাজাগতিক আপডেট পর্যন্ত — যা আপনাকে মহাবিশ্বের ছন্দের সাথে আপনার চিন্তা এবং ক্রিয়াগুলিকে সারিবদ্ধ করতে সাহায্য করবে।',
      kannada: 'ನಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ವಿಭಾಗದಲ್ಲಿ, ನೀವು ಶೀಘ್ರದಲ್ಲೇ ವೈಯಕ್ತಿಕ ಅಂತರ್ದೃಷ್ಟಿಗಳನ್ನು ಕಾಣಬಹುದು — ನಿಮ್ಮ ಜನನ ಚಾರ್ಟ್ನಿಂದ ದೈನಂದಿನ ಬ್ರಹ್ಮಾಂಡೀಯ ಅಪ್ಡೇಟ್ಗಳವರೆಗೆ — ಇದು ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಮತ್ತು ಕ್ರಿಯೆಗಳನ್ನು ಬ್ರಹ್ಮಾಂಡದ ತಾಳಕ್ಕೆ ಸರಿಹೊಂದಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
      punjabi: 'ਸਾਡੇ ਜੋਤਿਸ਼ ਸੈਕਸ਼ਨ ਵਿੱਚ, ਤੁਸੀਂ ਜਲਦੀ ਹੀ ਨਿੱਜੀ ਸੂਝ ਪ੍ਰਾਪਤ ਕਰੋਗੇ — ਤੁਹਾਡੇ ਜਨਮ ਚਾਰਟ ਤੋਂ ਰੋਜ਼ਾਨਾ ਬ੍ਰਹਿਮੰਡੀ ਅਪਡੇਟ ਤੱਕ — ਜੋ ਤੁਹਾਨੂੰ ਬ੍ਰਹਿਮੰਡ ਦੇ ਤਾਲ ਦੇ ਨਾਲ ਆਪਣੇ ਵਿਚਾਰਾਂ ਅਤੇ ਕਿਰਿਆਵਾਂ ਨੂੰ ਸਮਕਾਲੀਨ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੇਗੀ।',
      tamil: 'எங்கள் ஜோதிடப் பிரிவில், நீங்கள் விரைவில் தனிப்பட்ட நுண்ணறிவுகளைப் பெறுவீர்கள் — உங்கள் பிறப்பு விளக்கப்படத்திலிருந்து தினசரி அண்ட அப்டேட்கள் வரை — இது உங்கள் எண்ணங்கள் மற்றும் செயல்களை பிரபஞ்சத்தின் தாளங்களுடன் இணைக்க உதவுகிறது.',
      telugu: 'మా జ్యోతిష్య విభాగంలో, మీరు త్వరలో వ్యక్తిగత అంతర్దృష్టులను కనుగొంటారు — మీ పుట్టిన చార్ట్ నుండి రోజువారీ విశ్వ అప్డేట్ల వరకు — ఇది మీ ఆలోచనలు మరియు చర్యలను విశ్వం యొక్క లయతో సమలేఖనం చేయడంలో సహాయపడుతుంది.'
    },
    content3: { 
      en: 'Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.', 
      hi: 'चाहे आप अपने करियर, रिश्तों पर स्पष्टता चाहते हों, या बस अपने राशि चिन्ह के रहस्यों का पता लगाना चाहते हों, यह स्थान आपका भरोसेमंद आध्यात्मिक साथी बन जाएगा।',
      bangla: 'আপনি আপনার ক্যারিয়ার, সম্পর্কের উপর স্পষ্টতা চান, বা কেবল আপনার রাশিচক্রের রহস্য অন্বেষণ করতে চান, এই স্থানটি আপনার বিশ্বস্ত আধ্যাত্মিক সঙ্গী হয়ে উঠবে।',
      kannada: 'ನೀವು ನಿಮ್ಮ ವೃತ್ತಿಜೀವನ, ಸಂಬಂಧಗಳ ಬಗ್ಗೆ ಸ್ಪಷ್ಟತೆ ಬಯಸುತ್ತೀರಿ, ಅಥವಾ ಕೇವಲ ನಿಮ್ಮ ರಾಶಿಚಕ್ರದ ರಹಸ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಬಯಸುತ್ತೀರಿ, ಈ ಸ್ಥಳವು ನಿಮ್ಮ ನಂಬಲರ್ಹ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಗಾತಿಯಾಗುತ್ತದೆ.',
      punjabi: 'ਭਾਵੇਂ ਤੁਸੀਂ ਆਪਣੇ ਕੈਰੀਅਰ, ਰਿਸ਼ਤਿਆਂ ਬਾਰੇ ਸਪਸ਼ਟਤਾ ਚਾਹੁੰਦੇ ਹੋ, ਜਾਂ ਸਿਰਫ਼ ਆਪਣੇ ਰਾਸ਼ੀ ਚਿੰਨ੍ਹ ਦੇ ਰਹੱਸਾਂ ਦੀ ਖੋਜ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ, ਇਹ ਸਥਾਨ ਤੁਹਾਡਾ ਭਰੋਸੇਮੰਦ ਆਤਮਕ ਸਾਥੀ ਬਣ ਜਾਵੇਗਾ।',
      tamil: 'நீங்கள் உங்கள் தொழில், உறவுகள் குறித்த தெளிவைத் தேடினாலும், அல்லது உங்கள் ராசி அடையாளத்தின் மர்மங்களை ஆராய விரும்பினாலும், இந்த இடம் உங்கள் நம்பகமான ஆன்மீக துணையாக மாறும்.',
      telugu: 'మీరు మీ కెరీర్, సంబంధాలపై స్పష్టత కోరినా, లేదా కేవలం మీ రాశి చిహ్నం యొక్క రహస్యాలను అన్వేషించాలనుకున్నా, ఈ స్థలం మీ విశ్వసనీయ ఆధ్యాత్మిక సహచరుడు అవుతుంది.'
    },
    selectRashi: { 
      en: 'Select Rashi', 
      hi: 'राशि चुनें',
      bangla: 'রাশি নির্বাচন করুন',
      kannada: 'ರಾಶಿ ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਰਾਸ਼ੀ ਚੁਣੋ',
      tamil: 'ராசியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'రాశిని ఎంచుకోండి'
    },
    duration: { 
      en: 'Duration', 
      hi: 'अवधि',
      bangla: 'সময়কাল',
      kannada: 'ಅವಧಿ',
      punjabi: 'ਮਿਆਦ',
      tamil: 'கால அளவு',
      telugu: 'వ్యవధి'
    },
    selectRashiFirst: { 
      en: 'Select Rashi first', 
      hi: 'पहले राशि चुनें',
      bangla: 'প্রথমে রাশি নির্বাচন করুন',
      kannada: 'ಮೊದಲು ರಾಶಿ ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਪਹਿਲਾਂ ਰਾਸ਼ੀ ਚੁਣੋ',
      tamil: 'முதலில் ராசியைத் தேர்ந்தெடுக்கவும்',
      telugu: 'మొదట రాశిని ఎంచుకోండి'
    },
    selectDurationFirst: { 
      en: 'Select Duration first', 
      hi: 'पहले अवधि चुनें',
      bangla: 'প্রথমে সময়কাল নির্বাচন করুন',
      kannada: 'ಮೊದಲು ಅವಧಿ ಆಯ್ಕೆಮಾಡಿ',
      punjabi: 'ਪਹਿਲਾਂ ਮਿਆਦ ਚੁਣੋ',
      tamil: 'முதலில் கால அளவைத் தேர்ந்தெடுக்கவும்',
      telugu: 'మొదట వ్యవధిని ఎంచుకోండి'
    },
    showMyRashifal: { 
      en: 'Show my rashifal now', 
      hi: 'अब मेरा राशिफल दिखाएं',
      bangla: 'এখনই আমার রাশিফল দেখান',
      kannada: 'ಈಗ ನನ್ನ ರಾಶಿಫಲ ತೋರಿಸಿ',
      punjabi: 'ਹੁਣੇ ਮੇਰਾ ਰਾਸ਼ੀਫਲ ਦਿਖਾਓ',
      tamil: 'இப்போது எனது ராசிபலனைக் காட்டுங்கள்',
      telugu: 'ఇప్పుడే నా రాశిఫలాన్ని చూపించండి'
    },
    dontKnowRashi: { 
      en: 'Don\'t know your Rashi?', 
      hi: 'अपनी राशि नहीं जानते?',
      bangla: 'আপনার রাশি জানেন না?',
      kannada: 'ನಿಮ್ಮ ರಾಶಿ ಗೊತ್ತಿಲ್ಲವೇ?',
      punjabi: 'ਤੁਹਾਡੀ ਰਾਸ਼ੀ ਪਤਾ ਨਹੀਂ?',
      tamil: 'உங்கள் ராசி தெரியவில்லையா?',
      telugu: 'మీ రాశి తెలియదా?'
    },
    clickHere: { 
      en: 'Click here', 
      hi: 'यहाँ क्लिक करें',
      bangla: 'এখানে ক্লিক করুন',
      kannada: 'ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ',
      punjabi: 'ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ',
      tamil: 'இங்கே கிளிக் செய்யவும்',
      telugu: 'ఇక్కడ క్లిక్ చేయండి'
    },
    fetchingRashifal: { 
      en: 'Fetching your rashifal...', 
      hi: 'आपका राशिफल लाया जा रहा है...',
      bangla: 'আপনার রাশিফল আনা হচ্ছে...',
      kannada: 'ನಿಮ್ಮ ರಾಶಿಫಲ ತರಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਤੁਹਾਡਾ ਰਾਸ਼ੀਫਲ ਲਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
      tamil: 'உங்கள் ராசிபலன் கொண்டுவரப்படுகிறது...',
      telugu: 'మీ రాశిఫలం తీసుకువస్తున్నది...'
    },
    compatibility: { 
      en: 'Compatibility', 
      hi: 'अनुकूलता',
      bangla: 'সামঞ্জস্যতা',
      kannada: 'ಹೊಂದಾಣಿಕೆ',
      punjabi: 'ਅਨੁਕੂਲਤਾ',
      tamil: 'இணக்கத்தன்மை',
      telugu: 'అనుకూలత'
    },
    mood: { 
      en: 'Mood', 
      hi: 'मनोदशा',
      bangla: 'মেজাজ',
      kannada: 'ಮನಸ್ಥಿತಿ',
      punjabi: 'ਮੂਡ',
      tamil: 'மனநிலை',
      telugu: 'మానసిక స్థితి'
    },
    color: { 
      en: 'Color', 
      hi: 'रंग',
      bangla: 'রঙ',
      kannada: 'ಬಣ್ಣ',
      punjabi: 'ਰੰਗ',
      tamil: 'நிறம்',
      telugu: 'రంగు'
    },
    luckyNumber: { 
      en: 'Lucky Number', 
      hi: 'भाग्यशाली संख्या',
      bangla: 'ভাগ্যবান সংখ্যা',
      kannada: 'ಅದೃಷ್ಟ ಸಂಖ್ಯೆ',
      punjabi: 'ਭਾਗਸ਼ਾਲੀ ਨੰਬਰ',
      tamil: 'அதிர்ஷ்ட எண்',
      telugu: 'అదృష్ట సంఖ్య'
    },
    luckyTime: { 
      en: 'Lucky Time', 
      hi: 'भाग्यशाली समय',
      bangla: 'ভাগ্যবান সময়',
      kannada: 'ಅದೃಷ್ಟ ಸಮಯ',
      punjabi: 'ਭਾਗਸ਼ਾਲੀ ਸਮਾਂ',
      tamil: 'அதிர்ஷ்ட நேரம்',
      telugu: 'అదృష్ట సమయం'
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
    findYourRashi: { 
      en: 'Find Your Rashi', 
      hi: 'अपनी राशि खोजें',
      bangla: 'আপনার রাশি খুঁজুন',
      kannada: 'ನಿಮ್ಮ ರಾಶಿ ಹುಡುಕಿ',
      punjabi: 'ਆਪਣੀ ਰਾਸ਼ੀ ਲੱਭੋ',
      tamil: 'உங்கள் ராசியைக் கண்டறியுங்கள்',
      telugu: 'మీ రాశిని కనుగొనండి'
    },
    enterDateMonth: { 
      en: 'Enter your date and month of birth to find your Rashi (Zodiac Sign)', 
      hi: 'अपनी राशि (राशि चिन्ह) खोजने के लिए अपनी जन्म तिथि और महीना दर्ज करें',
      bangla: 'আপনার রাশি (রাশিচক্র চিহ্ন) খুঁজে পেতে আপনার জন্ম তারিখ এবং মাস লিখুন',
      kannada: 'ನಿಮ್ಮ ರಾಶಿ (ರಾಶಿಚಕ್ರ ಚಿಹ್ನೆ) ಕಂಡುಹಿಡಿಯಲು ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಮತ್ತು ತಿಂಗಳನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਆਪਣੀ ਰਾਸ਼ੀ (ਰਾਸ਼ੀ ਚਿੰਨ੍ਹ) ਲੱਭਣ ਲਈ ਆਪਣਾ ਜਨਮ ਦਿਨ ਅਤੇ ਮਹੀਨਾ ਦਰਜ ਕਰੋ',
      tamil: 'உங்கள் ராசியைக் (ராசி அடையாளம்) கண்டறிய உங்கள் பிறந்த தேதி மற்றும் மாதத்தை உள்ளிடவும்',
      telugu: 'మీ రాశిని (రాశి చిహ్నం) కనుగొనడానికి మీ పుట్టిన తేదీ మరియు నెలను నమోదు చేయండి'
    },
    dateOfBirth: { 
      en: 'Date of Birth:', 
      hi: 'जन्म तिथि:',
      bangla: 'জন্ম তারিখ:',
      kannada: 'ಜನ್ಮ ದಿನಾಂಕ:',
      punjabi: 'ਜਨਮ ਦਿਨ:',
      tamil: 'பிறந்த தேதி:',
      telugu: 'పుట్టిన తేదీ:'
    },
    monthOfBirth: { 
      en: 'Month of Birth:', 
      hi: 'जन्म का महीना:',
      bangla: 'জন্ম মাস:',
      kannada: 'ಜನ್ಮ ತಿಂಗಳು:',
      punjabi: 'ਜਨਮ ਮਹੀਨਾ:',
      tamil: 'பிறந்த மாதம்:',
      telugu: 'పుట్టిన నెల:'
    },
    calculateMyRashi: { 
      en: 'Calculate My Rashi', 
      hi: 'मेरी राशि की गणना करें',
      bangla: 'আমার রাশি গণনা করুন',
      kannada: 'ನನ್ನ ರಾಶಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
      punjabi: 'ਮੇਰੀ ਰਾਸ਼ੀ ਗਣਨਾ ਕਰੋ',
      tamil: 'எனது ராசியைக் கணக்கிடுங்கள்',
      telugu: 'నా రాశిని లెక్కించండి'
    },
    yourRashiIs: { 
      en: 'Your Rashi is:', 
      hi: 'आपकी राशि है:',
      bangla: 'আপনার রাশি:',
      kannada: 'ನಿಮ್ಮ ರಾಶಿ:',
      punjabi: 'ਤੁਹਾਡੀ ਰਾਸ਼ੀ:',
      tamil: 'உங்கள் ராசி:',
      telugu: 'మీ రాశి:'
    },
    useThisRashi: { 
      en: 'Use This Rashi', 
      hi: 'इस राशि का उपयोग करें',
      bangla: 'এই রাশি ব্যবহার করুন',
      kannada: 'ಈ ರಾಶಿಯನ್ನು ಬಳಸಿ',
      punjabi: 'ਇਸ ਰਾਸ਼ੀ ਨੂੰ ਵਰਤੋ',
      tamil: 'இந்த ராசியைப் பயன்படுத்துங்கள்',
      telugu: 'ఈ రాశిని వాడండి'
    },
    daily: { 
      en: 'Daily', 
      hi: 'दैनिक',
      bangla: 'দৈনিক',
      kannada: 'ದೈನಂದಿನ',
      punjabi: 'ਰੋਜ਼ਾਨਾ',
      tamil: 'தினசரி',
      telugu: 'రోజువారీ'
    },
    weekly: { 
      en: 'Weekly', 
      hi: 'साप्ताहिक',
      bangla: 'সাপ্তাহিক',
      kannada: 'ಸಾಪ್ತಾಹಿಕ',
      punjabi: 'ਹਫ਼ਤਾਵਾਰੀ',
      tamil: 'வாராந்திர',
      telugu: 'వారంతటా'
    },
    monthly: { 
      en: 'Monthly', 
      hi: 'मासिक',
      bangla: 'মাসিক',
      kannada: 'ಮಾಸಿಕ',
      punjabi: 'ਮਹੀਨਾਵਾਰੀ',
      tamil: 'மாதாந்திர',
      telugu: 'నెలవారీ'
    },
    todaysHoroscope: { 
      en: 'Today\'s Horoscope', 
      hi: 'आज का राशिफल',
      bangla: 'আজকের রাশিফল',
      kannada: 'ಇಂದಿನ ರಾಶಿಫಲ',
      punjabi: 'ਅੱਜ ਦਾ ਰਾਸ਼ੀਫਲ',
      tamil: 'இன்றைய ராசிபலன்',
      telugu: 'ఈరోజు రాశిఫలం'
    },
    horoscopeForWeek: { 
      en: 'Horoscope for the Week', 
      hi: 'सप्ताह का राशिफल',
      bangla: 'সপ্তাহের রাশিফল',
      kannada: 'ಸಪ್ತಾಹದ ರಾಶಿಫಲ',
      punjabi: 'ਹਫ਼ਤੇ ਦਾ ਰਾਸ਼ੀਫਲ',
      tamil: 'வாரத்தின் ராசிபலன்',
      telugu: 'వారం రాశిఫలం'
    },
    horoscopeForMonth: { 
      en: 'Horoscope for the Month', 
      hi: 'महीने का राशिफल',
      bangla: 'মাসের রাশিফল',
      kannada: 'ತಿಂಗಳ ರಾಶಿಫಲ',
      punjabi: 'ਮਹੀਨੇ ਦਾ ਰਾਸ਼ੀਫਲ',
      tamil: 'மாதத்தின் ராசிபலன்',
      telugu: 'నెల రాశిఫలం'
    },
    months: {
      january: { 
        en: 'January', 
        hi: 'जनवरी',
        bangla: 'জানুয়ারি',
        kannada: 'ಜನವರಿ',
        punjabi: 'ਜਨਵਰੀ',
        tamil: 'ஜனவரி',
        telugu: 'జనవరి'
      },
      february: { 
        en: 'February', 
        hi: 'फरवरी',
        bangla: 'ফেব্রুয়ারি',
        kannada: 'ಫೆಬ್ರವರಿ',
        punjabi: 'ਫ਼ਰਵਰੀ',
        tamil: 'பிப்ரவரி',
        telugu: 'ఫిబ్రవరి'
      },
      march: { 
        en: 'March', 
        hi: 'मार्च',
        bangla: 'মার্চ',
        kannada: 'ಮಾರ್ಚ್',
        punjabi: 'ਮਾਰਚ',
        tamil: 'மார்ச்',
        telugu: 'మార్చి'
      },
      april: { 
        en: 'April', 
        hi: 'अप्रैल',
        bangla: 'এপ্রিল',
        kannada: 'ಏಪ್ರಿಲ್',
        punjabi: 'ਅਪ੍ਰੈਲ',
        tamil: 'ஏப்ரல்',
        telugu: 'ఏప్రిల్'
      },
      may: { 
        en: 'May', 
        hi: 'मई',
        bangla: 'মে',
        kannada: 'ಮೇ',
        punjabi: 'ਮਈ',
        tamil: 'மே',
        telugu: 'మే'
      },
      june: { 
        en: 'June', 
        hi: 'जून',
        bangla: 'জুন',
        kannada: 'ಜೂನ್',
        punjabi: 'ਜੂਨ',
        tamil: 'ஜூன்',
        telugu: 'జూన్'
      },
      july: { 
        en: 'July', 
        hi: 'जुलाई',
        bangla: 'জুলাই',
        kannada: 'ಜುಲೈ',
        punjabi: 'ਜੁਲਾਈ',
        tamil: 'ஜூலை',
        telugu: 'జులై'
      },
      august: { 
        en: 'August', 
        hi: 'अगस्त',
        bangla: 'আগস্ট',
        kannada: 'ಆಗಸ್ಟ್',
        punjabi: 'ਅਗਸਤ',
        tamil: 'ஆகஸ்ட்',
        telugu: 'ఆగస్ట్'
      },
      september: { 
        en: 'September', 
        hi: 'सितंबर',
        bangla: 'সেপ্টেম্বর',
        kannada: 'ಸೆಪ್ಟೆಂಬರ್',
        punjabi: 'ਸਤੰਬਰ',
        tamil: 'செப்டம்பர்',
        telugu: 'సెప్టెంబర్'
      },
      october: { 
        en: 'October', 
        hi: 'अक्टूबर',
        bangla: 'অক্টোবর',
        kannada: 'ಅಕ್ಟೋಬರ್',
        punjabi: 'ਅਕਤੂਬਰ',
        tamil: 'அக்டோபர்',
        telugu: 'అక్టోబర్'
      },
      november: { 
        en: 'November', 
        hi: 'नवंबर',
        bangla: 'নভেম্বর',
        kannada: 'ನವೆಂಬರ್',
        punjabi: 'ਨਵੰਬਰ',
        tamil: 'நவம்பர்',
        telugu: 'నవంబర్'
      },
      december: { 
        en: 'December', 
        hi: 'दिसंबर',
        bangla: 'ডিসেম্বর',
        kannada: 'ಡಿಸೆಂಬರ್',
        punjabi: 'ਦਸੰਬਰ',
        tamil: 'டிசம்பர்',
        telugu: 'డిసెంబర్'
      }
    }
  };

  const getRashiList = () => {
    return [
      getTranslation({
        en: 'Aries (Mesh)',
        hi: 'मेष (Aries)',
        bangla: 'মেষ (Aries)',
        kannada: 'ಮೇಷ (Aries)',
        punjabi: 'ਮੇਸ਼ (Aries)',
        tamil: 'மேஷம் (Aries)',
        telugu: 'మేషం (Aries)'
      }),
      getTranslation({
        en: 'Taurus (Vrishabh)',
        hi: 'वृषभ (Taurus)',
        bangla: 'বৃষ (Taurus)',
        kannada: 'ವೃಷಭ (Taurus)',
        punjabi: 'ਵਿੱਛਭ (Taurus)',
        tamil: 'ரிஷபம் (Taurus)',
        telugu: 'వృషభం (Taurus)'
      }),
      getTranslation({
        en: 'Gemini (Mithun)',
        hi: 'मिथुन (Gemini)',
        bangla: 'মিথুন (Gemini)',
        kannada: 'ಮಿಥುನ (Gemini)',
        punjabi: 'ਮਿਥੁਨ (Gemini)',
        tamil: 'மிதுனம் (Gemini)',
        telugu: 'మిథునం (Gemini)'
      }),
      getTranslation({
        en: 'Cancer (Kark)',
        hi: 'कर्क (Cancer)',
        bangla: 'কর্কট (Cancer)',
        kannada: 'ಕರ್ಕಾಟಕ (Cancer)',
        punjabi: 'ਕਰਕ (Cancer)',
        tamil: 'கடகம் (Cancer)',
        telugu: 'కర్కాటకం (Cancer)'
      }),
      getTranslation({
        en: 'Leo (Singh)',
        hi: 'सिंह (Leo)',
        bangla: 'সিংহ (Leo)',
        kannada: 'ಸಿಂಹ (Leo)',
        punjabi: 'ਸਿੰਘ (Leo)',
        tamil: 'சிம்மம் (Leo)',
        telugu: 'సింహం (Leo)'
      }),
      getTranslation({
        en: 'Virgo (Kanya)',
        hi: 'कन्या (Virgo)',
        bangla: 'কন্যা (Virgo)',
        kannada: 'ಕನ್ಯಾ (Virgo)',
        punjabi: 'ਕੰਨਿਆ (Virgo)',
        tamil: 'கன்னி (Virgo)',
        telugu: 'కన్య (Virgo)'
      }),
      getTranslation({
        en: 'Libra (Tula)',
        hi: 'तुला (Libra)',
        bangla: 'তুলা (Libra)',
        kannada: 'ತುಲಾ (Libra)',
        punjabi: 'ਤੁਲਾ (Libra)',
        tamil: 'துலாம் (Libra)',
        telugu: 'తులా (Libra)'
      }),
      getTranslation({
        en: 'Scorpio (Vrishchik)',
        hi: 'वृश्चिक (Scorpio)',
        bangla: 'বৃশ্চিক (Scorpio)',
        kannada: 'ವೃಶ್ಚಿಕ (Scorpio)',
        punjabi: 'ਵਿੱਛਿਕ (Scorpio)',
        tamil: 'விருச்சிகம் (Scorpio)',
        telugu: 'వృశ్చికం (Scorpio)'
      }),
      getTranslation({
        en: 'Sagittarius (Dhanu)',
        hi: 'धनु (Sagittarius)',
        bangla: 'ধনু (Sagittarius)',
        kannada: 'ಧನು (Sagittarius)',
        punjabi: 'ਧਨੁ (Sagittarius)',
        tamil: 'தனுசு (Sagittarius)',
        telugu: 'ధనుస్సు (Sagittarius)'
      }),
      getTranslation({
        en: 'Capricorn (Makar)',
        hi: 'मकर (Capricorn)',
        bangla: 'মকর (Capricorn)',
        kannada: 'ಮಕರ (Capricorn)',
        punjabi: 'ਮਕਰ (Capricorn)',
        tamil: 'மகரம் (Capricorn)',
        telugu: 'మకరం (Capricorn)'
      }),
      getTranslation({
        en: 'Aquarius (Kumbh)',
        hi: 'कुंभ (Aquarius)',
        bangla: 'কুম্ভ (Aquarius)',
        kannada: 'ಕುಂಭ (Aquarius)',
        punjabi: 'ਕੁੰਭ (Aquarius)',
        tamil: 'கும்பம் (Aquarius)',
        telugu: 'కుంభం (Aquarius)'
      }),
      getTranslation({
        en: 'Pisces (Meen)',
        hi: 'मीन (Pisces)',
        bangla: 'মীন (Pisces)',
        kannada: 'ಮೀನ (Pisces)',
        punjabi: 'ਮੀਨ (Pisces)',
        tamil: 'மீனம் (Pisces)',
        telugu: 'మీనం (Pisces)'
      })
    ];
  };

  const rashiList = getRashiList();

  const frequencyList = [
    getTranslation(translations.daily),
    getTranslation(translations.weekly),
    getTranslation(translations.monthly)
  ];

  // Function to calculate Rashi based on date and month
  const calculateRashi = (date: number, month: number): string => {
    if ((month === 3 && date >= 21) || (month === 4 && date <= 19)) return getTranslation({
      en: 'Aries (Mesh)',
      hi: 'मेष (Aries)',
      bangla: 'মেষ (Aries)',
      kannada: 'ಮೇಷ (Aries)',
      punjabi: 'ਮੇਸ਼ (Aries)',
      tamil: 'மேஷம் (Aries)',
      telugu: 'మేషం (Aries)'
    });
    if ((month === 4 && date >= 20) || (month === 5 && date <= 20)) return getTranslation({
      en: 'Taurus (Vrishabh)',
      hi: 'वृषभ (Taurus)',
      bangla: 'বৃষ (Taurus)',
      kannada: 'ವೃಷಭ (Taurus)',
      punjabi: 'ਵਿੱਛਭ (Taurus)',
      tamil: 'ரிஷபம் (Taurus)',
      telugu: 'వృషభం (Taurus)'
    });
    if ((month === 5 && date >= 21) || (month === 6 && date <= 20)) return getTranslation({
      en: 'Gemini (Mithun)',
      hi: 'मिथुन (Gemini)',
      bangla: 'মিথুন (Gemini)',
      kannada: 'ಮಿಥುನ (Gemini)',
      punjabi: 'ਮਿਥੁਨ (Gemini)',
      tamil: 'மிதுனம் (Gemini)',
      telugu: 'మిథునం (Gemini)'
    });
    if ((month === 6 && date >= 21) || (month === 7 && date <= 22)) return getTranslation({
      en: 'Cancer (Kark)',
      hi: 'कर्क (Cancer)',
      bangla: 'কর্কট (Cancer)',
      kannada: 'ಕರ್ಕಾಟಕ (Cancer)',
      punjabi: 'ਕਰਕ (Cancer)',
      tamil: 'கடகம் (Cancer)',
      telugu: 'కర్కాటకం (Cancer)'
    });
    if ((month === 7 && date >= 23) || (month === 8 && date <= 22)) return getTranslation({
      en: 'Leo (Singh)',
      hi: 'सिंह (Leo)',
      bangla: 'সিংহ (Leo)',
      kannada: 'ಸಿಂಹ (Leo)',
      punjabi: 'ਸਿੰਘ (Leo)',
      tamil: 'சிம்மம் (Leo)',
      telugu: 'సింహం (Leo)'
    });
    if ((month === 8 && date >= 23) || (month === 9 && date <= 22)) return getTranslation({
      en: 'Virgo (Kanya)',
      hi: 'कन्या (Virgo)',
      bangla: 'কন্যা (Virgo)',
      kannada: 'ಕನ್ಯಾ (Virgo)',
      punjabi: 'ਕੰਨਿਆ (Virgo)',
      tamil: 'கன்னி (Virgo)',
      telugu: 'కన్య (Virgo)'
    });
    if ((month === 9 && date >= 23) || (month === 10 && date <= 22)) return getTranslation({
      en: 'Libra (Tula)',
      hi: 'तुला (Libra)',
      bangla: 'তুলা (Libra)',
      kannada: 'ತುಲಾ (Libra)',
      punjabi: 'ਤੁਲਾ (Libra)',
      tamil: 'துலாம் (Libra)',
      telugu: 'తులా (Libra)'
    });
    if ((month === 10 && date >= 23) || (month === 11 && date <= 21)) return getTranslation({
      en: 'Scorpio (Vrishchik)',
      hi: 'वृश्चिक (Scorpio)',
      bangla: 'বৃশ্চিক (Scorpio)',
      kannada: 'ವೃಶ್ಚಿಕ (Scorpio)',
      punjabi: 'ਵਿੱਛਿਕ (Scorpio)',
      tamil: 'விருச்சிகம் (Scorpio)',
      telugu: 'వృశ్చికం (Scorpio)'
    });
    if ((month === 11 && date >= 22) || (month === 12 && date <= 21)) return getTranslation({
      en: 'Sagittarius (Dhanu)',
      hi: 'धनु (Sagittarius)',
      bangla: 'ধনু (Sagittarius)',
      kannada: 'ಧನು (Sagittarius)',
      punjabi: 'ਧਨੁ (Sagittarius)',
      tamil: 'தனுசு (Sagittarius)',
      telugu: 'ధనుస్సు (Sagittarius)'
    });
    if ((month === 12 && date >= 22) || (month === 1 && date <= 19)) return getTranslation({
      en: 'Capricorn (Makar)',
      hi: 'मकर (Capricorn)',
      bangla: 'মকর (Capricorn)',
      kannada: 'ಮಕರ (Capricorn)',
      punjabi: 'ਮਕਰ (Capricorn)',
      tamil: 'மகரம் (Capricorn)',
      telugu: 'మకరం (Capricorn)'
    });
    if ((month === 1 && date >= 20) || (month === 2 && date <= 18)) return getTranslation({
      en: 'Aquarius (Kumbh)',
      hi: 'कुंभ (Aquarius)',
      bangla: 'কুম্ভ (Aquarius)',
      kannada: 'ಕುಂಭ (Aquarius)',
      punjabi: 'ਕੁੰਭ (Aquarius)',
      tamil: 'கும்பம் (Aquarius)',
      telugu: 'కుంభం (Aquarius)'
    });
    if ((month === 2 && date >= 19) || (month === 3 && date <= 20)) return getTranslation({
      en: 'Pisces (Meen)',
      hi: 'मीन (Pisces)',
      bangla: 'মীন (Pisces)',
      kannada: 'ಮೀನ (Pisces)',
      punjabi: 'ਮੀਨ (Pisces)',
      tamil: 'மீனம் (Pisces)',
      telugu: 'మీనం (Pisces)'
    });
    return getTranslation({
      en: 'Aries (Mesh)',
      hi: 'मेष (Aries)',
      bangla: 'মেষ (Aries)',
      kannada: 'ಮೇಷ (Aries)',
      punjabi: 'ਮੇਸ਼ (Aries)',
      tamil: 'மேஷம் (Aries)',
      telugu: 'మేషం (Aries)'
    }); // Default fallback
  };

  // Function to get zodiac sign from rashi
  const getZodiacSign = (rashi: string) => {
    // Check if rashi contains English zodiac names (case insensitive)
    const lowerRashi = rashi.toLowerCase();
    
    if (lowerRashi.includes('aries')) return 'aries';
    if (lowerRashi.includes('taurus')) return 'taurus';
    if (lowerRashi.includes('gemini')) return 'gemini';
    if (lowerRashi.includes('cancer')) return 'cancer';
    if (lowerRashi.includes('leo')) return 'leo';
    if (lowerRashi.includes('virgo')) return 'virgo';
    if (lowerRashi.includes('libra')) return 'libra';
    if (lowerRashi.includes('scorpio')) return 'scorpio';
    if (lowerRashi.includes('sagittarius')) return 'sagittarius';
    if (lowerRashi.includes('capricorn')) return 'capricorn';
    if (lowerRashi.includes('aquarius')) return 'aquarius';
    if (lowerRashi.includes('pisces')) return 'pisces';
    
    // Fallback to aries if no match found
    return 'aries';
  };

  // Function to get endpoint based on frequency
  const getEndpoint = (frequency: string) => {
    if (frequency === translations.daily.hi || frequency === translations.daily.en) return 'daily';
    if (frequency === translations.weekly.hi || frequency === translations.weekly.en) return 'weekly';
    if (frequency === translations.monthly.hi || frequency === translations.monthly.en) return 'monthly';
    return 'daily';
  };

  // Function to get horoscope title based on frequency
  const getHoroscopeTitle = (frequency: string) => {
    if (frequency === getTranslation(translations.daily)) {
      return getTranslation(translations.todaysHoroscope);
    }
    if (frequency === getTranslation(translations.weekly)) {
      return getTranslation(translations.horoscopeForWeek);
    }
    if (frequency === getTranslation(translations.monthly)) {
      return getTranslation(translations.horoscopeForMonth);
    }
    return getTranslation(translations.todaysHoroscope);
  };

  // Function to fetch rashifal from FreeAstrologyAPI
  const fetchRashifal = async () => {
    if (!selectedRashi) {
      Alert.alert(getTranslation(translations.selectRashiFirst));
      return;
    }

    if (!selectedFrequency) {
      Alert.alert(getTranslation(translations.selectDurationFirst));
      return;
    }

    // Award mudras for checking rashifal
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('CHECK_RASHIFAL');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('CHECK_RASHIFAL');
        // Silent mudra awarding
      }
    } catch (mudraError) {
      // Silent error handling
    }

    setLoading(true);
    setRashifalModalVisible(true);

    try {
      const zodiacSign = getZodiacSign(selectedRashi);
      const frequency = selectedFrequency || 'Daily';
      
      // FreeAstrologyAPI endpoint (external API, not part of our backend)
      const endpoint = getEndpoint(frequency);
      const apiUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/${endpoint}?sign=${zodiacSign}&day=today`;
      
      // API request details removed for cleaner logging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      // API response details removed for cleaner logging

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== API ERROR ===');
        console.error('Error Status:', response.status);
        console.error('Error Text:', errorText);
        Alert.alert('Error', 'Failed to fetch your rashifal. Please try again.');
        setRashifalModalVisible(false);
        return;
      }

      const data = await response.json();
      // API response data details removed for cleaner logging
      
      // Transform the API response to match our expected format
      const transformedData = {
        current_date: data.data?.date || new Date().toLocaleDateString(),
        compatibility: 'Libra', // Default value since API doesn't provide this
        lucky_number: 7, // Default value since API doesn't provide this
        lucky_time: '2pm', // Default value since API doesn't provide this
        mood: 'Optimistic', // Default value since API doesn't provide this
        color: 'Orange', // Default value since API doesn't provide this
        date_range: 'March 21 - April 19', // Default for Aries, would need mapping for others
        description: data.data?.horoscope_data || 'No horoscope data available'
      };
      
      // Transformed data details removed for cleaner logging
      
      setRashifalData(transformedData);
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error Type:', typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : error);
      console.error('Full Error:', error);
      
      let errorMessage = 'Failed to fetch your rashifal. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your internet connection.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Failed to connect to the server. Please try again.';
        }
      }
      
      Alert.alert('Error', errorMessage);
      setRashifalModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // Content from astrologyFixedContent.txt (without the headline)
  const astrologyContent = `Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.`;

  const filterRow = (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setRashiDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedRashi || getTranslation(translations.selectRashi)}
            </Text>
            <MaterialCommunityIcons
              name={rashiDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={rashiDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setRashiDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setRashiDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {rashiList.map(rashi => (
                      <TouchableOpacity
                        key={rashi}
                        style={[
                          styles.filterDropdownItem,
                          selectedRashi === rashi && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedRashi === rashi) {
                            setSelectedRashi(null);
                          } else {
                            setSelectedRashi(rashi);
                          }
                          setRashiDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedRashi === rashi && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {rashi}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>

        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setFrequencyDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedFrequency || getTranslation(translations.duration)}
            </Text>
            <MaterialCommunityIcons
              name={frequencyDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={frequencyDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setFrequencyDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setFrequencyDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {frequencyList.map(frequency => (
                      <TouchableOpacity
                        key={frequency}
                        style={[
                          styles.filterDropdownItem,
                          selectedFrequency === frequency && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedFrequency === frequency) {
                            setSelectedFrequency(null);
                          } else {
                            setSelectedFrequency(frequency);
                          }
                          setFrequencyDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedFrequency === frequency && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {frequency}
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
      
             <TouchableOpacity 
         style={[
           styles.rashifalButton, 
           (!selectedRashi || !selectedFrequency) && styles.rashifalButtonDisabled
         ]} 
         onPress={fetchRashifal}
       >
         <Text style={[
           styles.rashifalButtonText,
           (!selectedRashi || !selectedFrequency) && styles.rashifalButtonTextDisabled
         ]}>
           {!selectedRashi ? getTranslation(translations.selectRashiFirst) : 
            !selectedFrequency ? getTranslation(translations.selectDurationFirst) : 
            getTranslation(translations.showMyRashifal)}
         </Text>
       </TouchableOpacity>
             <View style={styles.rashifalHelpText}>
         <Text style={styles.rashifalHelpTextRegular}>{getTranslation(translations.dontKnowRashi)} </Text>
         <TouchableOpacity onPress={() => setRashiCalculatorModalVisible(true)}>
           <Text style={styles.rashifalHelpTextLink}>{getTranslation(translations.clickHere)}</Text>
         </TouchableOpacity>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader extraContent={filterRow} showDailyPujaButton={false} showSearchBar={false} />
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <Text style={styles.headline}>{getTranslation(translations.headline)}</Text>
          <ScrollView 
            style={styles.contentScrollView} 
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.contentText}>
              {getTranslation(translations.content1)}
            </Text>
            <Text style={styles.contentText}>
              {getTranslation(translations.content2)}
            </Text>
            <Text style={styles.contentText}>
              {getTranslation(translations.content3)}
            </Text>
          </ScrollView>
        </View>
      </View>

             {/* Rashifal Modal */}
       <Modal
         visible={rashifalModalVisible}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setRashifalModalVisible(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             {/* Header with X button */}
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>
                 {selectedRashi} - {selectedFrequency || 'Daily'} Rashifal
               </Text>
               <TouchableOpacity 
                 style={styles.closeButton}
                 onPress={() => setRashifalModalVisible(false)}
               >
                 <MaterialCommunityIcons name="close" size={24} color="#333" />
               </TouchableOpacity>
             </View>

             {/* Content */}
             <ScrollView 
               style={styles.modalScrollView} 
               showsVerticalScrollIndicator={true}
               nestedScrollEnabled={true}
             >
               {loading ? (
                 <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#FF6A00" />
                   <Text style={styles.loadingText}>{getTranslation(translations.fetchingRashifal)}</Text>
                 </View>
               ) : rashifalData ? (
                 <View style={styles.rashifalContent}>
                   <View style={styles.rashifalHeader}>
                     <Text style={styles.rashifalSign}>{selectedRashi}</Text>
                     <Text style={styles.rashifalDate}>{rashifalData.current_date}</Text>
                   </View>
                   
                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getHoroscopeTitle(selectedFrequency || 'Daily')}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.description}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getTranslation(translations.compatibility)}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.compatibility}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getTranslation(translations.mood)}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.mood}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getTranslation(translations.color)}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.color}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getTranslation(translations.luckyNumber)}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.lucky_number}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getTranslation(translations.luckyTime)}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.lucky_time}</Text>
                   </View>

                   {/* Extra space at bottom for better scrolling */}
                   <View style={{ height: 100 }} />
                 </View>
               ) : null}
             </ScrollView>

             {/* Close button at bottom */}
             <TouchableOpacity 
               style={styles.modalCloseButton}
               onPress={() => setRashifalModalVisible(false)}
             >
               <Text style={styles.modalCloseButtonText}>{getTranslation(translations.close)}</Text>
                           </TouchableOpacity>
            </View>
          </View>
        </Modal>

                 {/* Rashi Calculator Modal */}
         <Modal
           visible={rashiCalculatorModalVisible}
           transparent={true}
           animationType="slide"
           onRequestClose={() => setRashiCalculatorModalVisible(false)}
         >
           <TouchableWithoutFeedback onPress={() => setRashiCalculatorModalVisible(false)}>
             <View style={styles.modalOverlay}>
               <TouchableWithoutFeedback onPress={() => {}}>
                 <View style={styles.modalContent}>
                             {/* Header with X button */}
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>{getTranslation(translations.findYourRashi)}</Text>
                 <TouchableOpacity 
                   style={styles.closeButton}
                   onPress={() => setRashiCalculatorModalVisible(false)}
                 >
                   <MaterialCommunityIcons name="close" size={24} color="#333" />
                 </TouchableOpacity>
               </View>

              {/* Content */}
              <ScrollView 
                style={styles.modalScrollView} 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <View style={styles.calculatorContent}>
                  <Text style={styles.calculatorDescription}>
                    {getTranslation(translations.enterDateMonth)}
                  </Text>

                                     {/* Date Selection */}
                   <View style={styles.selectionSection}>
                     <Text style={styles.selectionLabel}>{getTranslation(translations.dateOfBirth)}</Text>
                     <View style={styles.calculatorDropdownWrapper}>
                       <TouchableOpacity
                         style={styles.calculatorDropdown}
                         onPress={() => setDateDropdownOpen(open => !open)}
                       >
                         <Text style={styles.calculatorDropdownText}>
                           {selectedDate}
                         </Text>
                         <MaterialCommunityIcons
                           name={dateDropdownOpen ? 'chevron-up' : 'chevron-down'}
                           size={22}
                           color="#333"
                         />
                       </TouchableOpacity>
                       <Modal
                         visible={dateDropdownOpen}
                         transparent
                         animationType="fade"
                         onRequestClose={() => setDateDropdownOpen(false)}
                       >
                         <TouchableWithoutFeedback onPress={() => setDateDropdownOpen(false)}>
                           <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                             <View style={styles.calculatorDropdownModalList}>
                               <ScrollView style={{ maxHeight: 320 }}>
                                 {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                                   <TouchableOpacity
                                     key={date}
                                     style={[
                                       styles.calculatorDropdownItem,
                                       selectedDate === date && styles.calculatorDropdownItemSelected
                                     ]}
                                     onPress={() => {
                                       setSelectedDate(date);
                                       setDateDropdownOpen(false);
                                     }}
                                   >
                                     <Text
                                       style={[
                                         styles.calculatorDropdownItemText,
                                         selectedDate === date && styles.calculatorDropdownItemTextSelected
                                       ]}
                                     >
                                       {date}
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

                   {/* Month Selection */}
                   <View style={styles.selectionSection}>
                     <Text style={styles.selectionLabel}>{getTranslation(translations.monthOfBirth)}</Text>
                     <View style={styles.calculatorDropdownWrapper}>
                       <TouchableOpacity
                         style={styles.calculatorDropdown}
                         onPress={() => setMonthDropdownOpen(open => !open)}
                       >
                         <Text style={styles.calculatorDropdownText}>
                           {[
                             { num: 1, name: getTranslation(translations.months.january) }, 
                             { num: 2, name: getTranslation(translations.months.february) }, 
                             { num: 3, name: getTranslation(translations.months.march) },
                             { num: 4, name: getTranslation(translations.months.april) }, 
                             { num: 5, name: getTranslation(translations.months.may) }, 
                             { num: 6, name: getTranslation(translations.months.june) },
                             { num: 7, name: getTranslation(translations.months.july) }, 
                             { num: 8, name: getTranslation(translations.months.august) }, 
                             { num: 9, name: getTranslation(translations.months.september) },
                             { num: 10, name: getTranslation(translations.months.october) }, 
                             { num: 11, name: getTranslation(translations.months.november) }, 
                             { num: 12, name: getTranslation(translations.months.december) }
                           ].find(m => m.num === selectedMonth)?.name || getTranslation(translations.months.january)}
                         </Text>
                         <MaterialCommunityIcons
                           name={monthDropdownOpen ? 'chevron-up' : 'chevron-down'}
                           size={22}
                           color="#333"
                         />
                       </TouchableOpacity>
                       <Modal
                         visible={monthDropdownOpen}
                         transparent
                         animationType="fade"
                         onRequestClose={() => setMonthDropdownOpen(false)}
                       >
                         <TouchableWithoutFeedback onPress={() => setMonthDropdownOpen(false)}>
                           <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                             <View style={styles.calculatorDropdownModalList}>
                               <ScrollView style={{ maxHeight: 320 }}>
                                 {[
                                   { num: 1, name: getTranslation(translations.months.january) }, 
                                   { num: 2, name: getTranslation(translations.months.february) }, 
                                   { num: 3, name: getTranslation(translations.months.march) },
                                   { num: 4, name: getTranslation(translations.months.april) }, 
                                   { num: 5, name: getTranslation(translations.months.may) }, 
                                   { num: 6, name: getTranslation(translations.months.june) },
                                   { num: 7, name: getTranslation(translations.months.july) }, 
                                   { num: 8, name: getTranslation(translations.months.august) }, 
                                   { num: 9, name: getTranslation(translations.months.september) },
                                   { num: 10, name: getTranslation(translations.months.october) }, 
                                   { num: 11, name: getTranslation(translations.months.november) }, 
                                   { num: 12, name: getTranslation(translations.months.december) }
                                 ].map(month => (
                                   <TouchableOpacity
                                     key={month.num}
                                     style={[
                                       styles.calculatorDropdownItem,
                                       selectedMonth === month.num && styles.calculatorDropdownItemSelected
                                     ]}
                                     onPress={() => {
                                       setSelectedMonth(month.num);
                                       setMonthDropdownOpen(false);
                                     }}
                                   >
                                     <Text
                                       style={[
                                         styles.calculatorDropdownItemText,
                                         selectedMonth === month.num && styles.calculatorDropdownItemTextSelected
                                       ]}
                                     >
                                       {month.name}
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

                  {/* Calculate Button */}
                  <TouchableOpacity 
                    style={styles.calculateButton}
                    onPress={() => {
                      const rashi = calculateRashi(selectedDate, selectedMonth);
                      setCalculatedRashi(rashi);
                    }}
                  >
                    <Text style={styles.calculateButtonText}>{getTranslation(translations.calculateMyRashi)}</Text>
                  </TouchableOpacity>

                  {/* Result */}
                  {calculatedRashi && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>{getTranslation(translations.yourRashiIs)}</Text>
                      <Text style={styles.resultRashi}>{calculatedRashi}</Text>
                      <TouchableOpacity 
                        style={styles.useRashiButton}
                        onPress={() => {
                          setSelectedRashi(calculatedRashi);
                          setRashiCalculatorModalVisible(false);
                          setCalculatedRashi(null);
                        }}
                      >
                        <Text style={styles.useRashiButtonText}>{getTranslation(translations.useThisRashi)}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                                     {/* Extra space at bottom for better scrolling */}
                   <View style={{ height: 100 }} />
                 </View>
               </ScrollView>

               
                 </View>
               </TouchableWithoutFeedback>
             </View>
           </TouchableWithoutFeedback>
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
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  contentScrollView: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 16,
    marginTop: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  filterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
    marginBottom: 14,
  },
  rashifalButton: {
    width: '80%',
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
     rashifalButtonText: {
     color: '#FF6A00',
     fontSize: 16,
     fontWeight: 'bold',
   },
   rashifalButtonDisabled: {
     backgroundColor: '#f5f5f5',
     opacity: 0.7,
   },
   rashifalButtonTextDisabled: {
     color: '#999',
   },
  rashifalHelpText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  rashifalHelpTextRegular: {
    fontSize: 14,
    color: '#333',
  },
  rashifalHelpTextLink: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  filterDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
    flex: 1,
    marginHorizontal: 8,
  },
  filterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownModalList: {
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
  filterDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  filterDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
     modalContent: {
     backgroundColor: '#fff',
     borderTopLeftRadius: 20,
     borderTopRightRadius: 20,
     height: '85%',
     flexDirection: 'column',
   },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
     modalScrollView: {
     flex: 1,
     paddingHorizontal: 20,
     paddingBottom: 10,
   },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
     rashifalContent: {
     paddingVertical: 20,
     paddingBottom: 60,
   },
  rashifalHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rashifalSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 5,
  },
  rashifalDate: {
    fontSize: 16,
    color: '#666',
  },
  rashifalSection: {
    marginBottom: 20,
  },
  rashifalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rashifalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  modalCloseButton: {
    backgroundColor: '#FF6A00',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
     modalCloseButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
   },
   // Rashi Calculator Modal styles
   calculatorContent: {
     paddingVertical: 20,
     paddingBottom: 60,
   },
   calculatorDescription: {
     fontSize: 16,
     lineHeight: 24,
     color: '#555',
     textAlign: 'center',
     marginBottom: 25,
     paddingHorizontal: 10,
   },
   selectionSection: {
     marginBottom: 25,
   },
   selectionLabel: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#333',
     marginBottom: 15,
     textAlign: 'center',
   },
   
   calculateButton: {
     backgroundColor: '#FF6A00',
     marginHorizontal: 20,
     marginVertical: 20,
     paddingVertical: 15,
     borderRadius: 10,
     alignItems: 'center',
   },
   calculateButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
   },
   resultSection: {
     alignItems: 'center',
     marginTop: 20,
     paddingVertical: 20,
     backgroundColor: '#f9f9f9',
     borderRadius: 12,
     marginHorizontal: 20,
   },
   resultTitle: {
     fontSize: 16,
     color: '#666',
     marginBottom: 10,
   },
   resultRashi: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FF6A00',
     marginBottom: 20,
     textAlign: 'center',
   },
   useRashiButton: {
     backgroundColor: '#28a745',
     paddingHorizontal: 30,
     paddingVertical: 12,
     borderRadius: 8,
   },
       useRashiButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Calculator Dropdown styles
    calculatorDropdownWrapper: {
      position: 'relative',
      marginTop: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      padding: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      zIndex: 1000,
      elevation: 20,
    },
    calculatorDropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    calculatorDropdownText: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    calculatorDropdownModalList: {
      position: 'absolute',
      top: 80,
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
    calculatorDropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    calculatorDropdownItemSelected: {
      backgroundColor: '#e0e0e0',
    },
    calculatorDropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
    calculatorDropdownItemTextSelected: {
      fontWeight: 'bold',
      color: '#FF6A00',
    },
 }); 