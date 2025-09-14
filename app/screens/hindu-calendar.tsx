import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

const getTranslation = (translations: any) => {
  const { currentLanguage } = useLanguage();
  return translations[currentLanguage] || translations.en;
};

const getFestivalTranslation = (festivalName: string, festivalTranslations: any) => {
  const { currentLanguage } = useLanguage();
  const translation = festivalTranslations[festivalName];
  if (translation) {
    return translation[currentLanguage] || translation.en;
  }
  return festivalName; // Return original name if no translation found
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

// Responsive sizing system
const getResponsiveFontSize = (baseSize: number) => {
  const scaleFactor = Math.min(screenWidth / 375, 1.5);
  return Math.max(baseSize * scaleFactor, baseSize * 0.8);
};

const getResponsiveDimension = (baseSize: number) => {
  const scaleFactor = Math.min(screenWidth / 375, 1.3);
  return Math.max(baseSize * scaleFactor, baseSize * 0.9);
};

interface HinduMonth {
  name: string;
  gregorianSpan: string;
  festivals: Festival[];
  color: string;
  startDate: Date;
  endDate: Date;
}

interface Festival {
  name: string;
  date: string;
  description?: string;
}

const hinduMonths: HinduMonth[] = [
  {
    name: 'Bhadrapada',
    gregorianSpan: 'Aug 10 – Sept 7, 2025',
    color: '#FFE5E5',
    startDate: new Date(2025, 7, 10),
    endDate: new Date(2025, 8, 7),
    festivals: [
      { name: 'Krishna Janmashtami', date: 'Aug 15', description: 'Shri Krishna' },
      { name: 'Krishna Janmashtami', date: 'Aug 16', description: 'Shri Krishna' },
      { name: 'Ganesh Chaturthi', date: 'Aug 27', description: 'Vighnaharta Ganesh' },
      { name: 'Rishi Panchami', date: 'Aug 28', description: 'Seven Sages' },
      { name: 'Anant Chaturdashi (Visarjan)', date: 'Sep 6', description: 'Vighnaharta Ganesh' }
    ]
  },
  {
    name: 'Ashvina',
    gregorianSpan: 'Sept 8 – Oct 7, 2025',
    color: '#E5F7F4',
    startDate: new Date(2025, 8, 8),
    endDate: new Date(2025, 9, 7),
    festivals: [
      { name: 'Sharad Navratri', date: 'Sep 22', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 23', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 24', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 25', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 26', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 27', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 28', description: 'Maa Kali' },
      { name: 'Sharad Navratri', date: 'Sep 29', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 30', description: 'Durga Maa' },
      { name: 'Vijayadashami (Dussehra)', date: 'Oct 2', description: 'Shri Ram' },
      { name: 'Karva Chauth', date: 'Oct 10', description: '' },
      { name: 'Ahoi Ashtami', date: 'Oct 13', description: '' },
      { name: 'Dhanteras (Diwali Day 1)', date: 'Oct 18', description: 'Lakshmi Maa' },
      { name: 'Naraka Chaturdashi (Chhoti Diwali)', date: 'Oct 19', description: 'Shri Krishna' },
      { name: 'Diwali', date: 'Oct 20', description: 'Lakshmi Maa' },
      { name: 'Govardhan Puja', date: 'Oct 21', description: 'Shri Krishna' },
      { name: 'Bhai Dooj', date: 'Oct 23', description: '' }
    ]
  },
  {
    name: 'Kartika',
    gregorianSpan: 'Oct 8 – Nov 5, 2025',
    color: '#E5F3F8',
    startDate: new Date(2025, 9, 8),
    endDate: new Date(2025, 10, 5),
    festivals: [
      { name: 'Ahoi Ashtami', date: 'Oct 13', description: '' },
      { name: 'Gita Jayanti (Mokshada Ekadashi)', date: 'Nov 4', description: 'Shri Krishna' }
    ]
  },
  {
    name: 'Margashirsha',
    gregorianSpan: 'Nov 6 – Dec 4, 2025',
    color: '#E5F7F4',
    startDate: new Date(2025, 10, 6),
    endDate: new Date(2025, 11, 4),
    festivals: []
  },
  {
    name: 'Pausha',
    gregorianSpan: 'Dec 5, 2025 – Jan 3, 2026',
    color: '#FFF8E5',
    startDate: new Date(2025, 11, 5),
    endDate: new Date(2026, 0, 3),
    festivals: [
      { name: 'Pausha Putrada Ekadashi', date: 'Dec 30', description: 'Vishnu Bhagwan' }
    ]
  },
  {
    name: 'Magha',
    gregorianSpan: 'Jan 4 – Feb 1, 2026',
    color: '#F8E5F8',
    startDate: new Date(2026, 0, 4),
    endDate: new Date(2026, 1, 1),
    festivals: [
      { name: 'Makar Sankranti', date: 'Jan 14', description: 'Surya Dev' },
      { name: 'Vasant Panchami', date: 'Jan 23', description: 'Saraswati Maa' }
    ]
  },
  {
    name: 'Phalguna',
    gregorianSpan: 'Feb 2 – Mar 3, 2026',
    color: '#E5F7F4',
    startDate: new Date(2026, 1, 2),
    endDate: new Date(2026, 2, 3),
    festivals: [
      { name: 'Maha Shivaratri', date: 'Feb 15', description: 'Mahadev Shiv Ji' },
      { name: 'Holika Dahan', date: 'Mar 3', description: 'Shri Krishna' },
      { name: 'Holi (Rangotsav)', date: 'Mar 4', description: 'Shri Krishna' }
    ]
  }
];

const HinduCalendarScreen: React.FC = () => {
  const router = useRouter();
  const { isHindi } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<HinduMonth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFestival, setSelectedFestival] = useState<{ name: string; date: string; description?: string; image?: any } | null>(null);

  const monthTranslations = {
    Bhadrapada: {
      en: 'Bhadrapada',
      hi: 'भाद्रपद',
      bangla: 'ভাদ্রপদ',
      kannada: 'ಭಾದ್ರಪದ',
      punjabi: 'ਭਾਦਰਪਦ',
      tamil: 'புரட்டாசி',
      telugu: 'భాద్రపద'
    },
    Ashvina: {
      en: 'Ashvina',
      hi: 'आश्विन',
      bangla: 'আশ্বিন',
      kannada: 'ಆಶ್ವಿನ',
      punjabi: 'ਆਸ਼ਵਿਨ',
      tamil: 'ஐப்பசி',
      telugu: 'ఆశ్విన'
    },
    Kartika: {
      en: 'Kartika',
      hi: 'कार्तिक',
      bangla: 'কার্তিক',
      kannada: 'ಕಾರ್ತಿಕ',
      punjabi: 'ਕਾਰਤਿਕ',
      tamil: 'கார்த்திகை',
      telugu: 'కార్తిక'
    },
    Margashirsha: {
      en: 'Margashirsha',
      hi: 'मार्गशीर्ष',
      bangla: 'মার্গশীর্ষ',
      kannada: 'ಮಾರ್ಗಶೀರ್ಷ',
      punjabi: 'ਮਾਰਗਸ਼ੀਰਸ਼',
      tamil: 'மார்கழி',
      telugu: 'మార్గశీర్ష'
    },
    Pausha: {
      en: 'Pausha',
      hi: 'पौष',
      bangla: 'পৌষ',
      kannada: 'ಪೌಷ',
      punjabi: 'ਪੌਸ਼',
      tamil: 'தை',
      telugu: 'పౌష'
    },
    Magha: {
      en: 'Magha',
      hi: 'माघ',
      bangla: 'মাঘ',
      kannada: 'ಮಾಘ',
      punjabi: 'ਮਾਘ',
      tamil: 'மாசி',
      telugu: 'మాఘ'
    },
    Phalguna: {
      en: 'Phalguna',
      hi: 'फाल्गुन',
      bangla: 'ফাল্গুন',
      kannada: 'ಫಾಲ್ಗುಣ',
      punjabi: 'ਫਾਲਗੁਣ',
      tamil: 'பங்குனி',
      telugu: 'ఫాల్గుణ'
    },
    Shravana: {
      en: 'Shravana',
      hi: 'श्रावण',
      bangla: 'শ্রাবণ',
      kannada: 'ಶ್ರಾವಣ',
      punjabi: 'ਸ਼੍ਰਾਵਣ',
      tamil: 'ஆடி',
      telugu: 'శ్రావణ'
    }
  };

  const festivalTranslations = {
    'Krishna Janmashtami': {
      en: 'Krishna Janmashtami',
      hi: 'कृष्ण जन्माष्टमी',
      bangla: 'কৃষ্ণ জন্মাষ্টমী',
      kannada: 'ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ',
      punjabi: 'ਕ੍ਰਿਸ਼ਨ ਜਨਮਾਸ਼ਟਮੀ',
      tamil: 'கிருஷ்ண ஜன்மாஷ்டமி',
      telugu: 'కృష్ణ జన్మాష్టమి'
    },
    'Ganesh Chaturthi': {
      en: 'Ganesh Chaturthi',
      hi: 'गणेश चतुर्थी',
      bangla: 'গণেশ চতুর্থী',
      kannada: 'ಗಣೇಶ ಚತುರ್ಥಿ',
      punjabi: 'ਗਣੇਸ਼ ਚਤੁਰਥੀ',
      tamil: 'விநாயகர் சதுர்த்தி',
      telugu: 'గణేశ చతుర్థి'
    },
    'Raksha Bandhan': {
      en: 'Raksha Bandhan',
      hi: 'रक्षा बंधन',
      bangla: 'রক্ষা বন্ধন',
      kannada: 'ರಕ್ಷಾ ಬಂಧನ',
      punjabi: 'ਰੱਖੜਾ ਬੰਨ੍ਹਣ',
      tamil: 'ரக்ஷா பந்தன்',
      telugu: 'రక్షా బంధన్'
    },
    'Sharad Navratri': {
      en: 'Sharad Navratri',
      hi: 'शरद नवरात्रि',
      bangla: 'শরৎ নবরাত্রি',
      kannada: 'ಶರದ್ ನವರಾತ್ರಿ',
      punjabi: 'ਸ਼ਰਦ ਨਵਰਾਤਰੀ',
      tamil: 'சரத் நவராத்திரி',
      telugu: 'శరద్ నవరాత్రి'
    },
    'Vijayadashami (Dussehra)': {
      en: 'Vijayadashami (Dussehra)',
      hi: 'विजयदशमी (दशहरा)',
      bangla: 'বিজয়দশমী (দশহরা)',
      kannada: 'ವಿಜಯದಶಮಿ (ದಸರಾ)',
      punjabi: 'ਵਿਜਯਦਸ਼ਮੀ (ਦਸੇਹਰਾ)',
      tamil: 'விஜயதசமி (தசரா)',
      telugu: 'విజయదశమి (దసరా)'
    },
    'Diwali': {
      en: 'Diwali',
      hi: 'दिवाली',
      bangla: 'দীপাবলি',
      kannada: 'ದೀಪಾವಳಿ',
      punjabi: 'ਦੀਵਾਲੀ',
      tamil: 'தீபாவளி',
      telugu: 'దీపావళి'
    },
    'Holi (Rangotsav)': {
      en: 'Holi (Rangotsav)',
      hi: 'होली (रंगोत्सव)',
      bangla: 'হোলি (রঙোৎসব)',
      kannada: 'ಹೋಳಿ (ರಂಗೋತ್ಸವ)',
      punjabi: 'ਹੋਲੀ (ਰੰਗੋਤਸਵ)',
      tamil: 'ஹோலி (ரங்கோத்ஸவ்)',
      telugu: 'హోళీ (రంగోత్సవం)'
    },
    'Maha Shivaratri': {
      en: 'Maha Shivaratri',
      hi: 'महा शिवरात्रि',
      bangla: 'মহা শিবরাত্রি',
      kannada: 'ಮಹಾ ಶಿವರಾತ್ರಿ',
      punjabi: 'ਮਹਾ ਸ਼ਿਵਰਾਤਰੀ',
      tamil: 'மகா சிவராத்திரி',
      telugu: 'మహా శివరాత్రి'
    },
    'Makar Sankranti': {
      en: 'Makar Sankranti',
      hi: 'मकर संक्रांति',
      bangla: 'মকর সংক্রান্তি',
      kannada: 'ಮಕರ ಸಂಕ್ರಾಂತಿ',
      punjabi: 'ਮਕਰ ਸੰਕ੍ਰਾਂਤੀ',
      tamil: 'மகர் சங்கராந்தி',
      telugu: 'మకర సంక్రాంతి'
    },
    'Vasant Panchami': {
      en: 'Vasant Panchami',
      hi: 'वसंत पंचमी',
      bangla: 'বসন্ত পঞ্চমী',
      kannada: 'ವಸಂತ ಪಂಚಮಿ',
      punjabi: 'ਵਸੰਤ ਪੰਚਮੀ',
      tamil: 'வசந்த பஞ்சமி',
      telugu: 'వసంత పంచమి'
    },
    'Rishi Panchami': {
      en: 'Rishi Panchami',
      hi: 'ऋषि पंचमी',
      bangla: 'ঋষি পঞ্চমী',
      kannada: 'ಋಷಿ ಪಂಚಮಿ',
      punjabi: 'ਰਿਸ਼ੀ ਪੰਚਮੀ',
      tamil: 'ரிஷி பஞ்சமி',
      telugu: 'ఋషి పంచమి'
    },
    'Anant Chaturdashi (Visarjan)': {
      en: 'Anant Chaturdashi (Visarjan)',
      hi: 'अनंत चतुर्दशी (विसर्जन)',
      bangla: 'অনন্ত চতুর্দশী (বিসর্জন)',
      kannada: 'ಅನಂತ ಚತುರ್ದಶಿ (ವಿಸರ್ಜನ)',
      punjabi: 'ਅਨੰਤ ਚਤੁਰਦਸ਼ੀ (ਵਿਸਰਜਨ)',
      tamil: 'அனந்த சதுர்த்தி (விசர்ஜன்)',
      telugu: 'అనంత చతుర్దశి (విసర్జన)'
    },
    'Karva Chauth': {
      en: 'Karva Chauth',
      hi: 'करवा चौथ',
      bangla: 'করবা চৌথ',
      kannada: 'ಕರ್ವಾ ಚೌತ್',
      punjabi: 'ਕਰਵਾ ਚੌਥ',
      tamil: 'கர்வா சௌத்',
      telugu: 'కర్వా చౌత్'
    },
    'Ahoi Ashtami': {
      en: 'Ahoi Ashtami',
      hi: 'अहोई अष्टमी',
      bangla: 'অহোই অষ্টমী',
      kannada: 'ಅಹೋಯಿ ಅಷ್ಟಮಿ',
      punjabi: 'ਅਹੋਈ ਅਸ਼ਟਮੀ',
      tamil: 'அஹோயி அஷ்டமி',
      telugu: 'అహోయి అష్టమి'
    },
    'Naraka Chaturdashi (Chhoti Diwali)': {
      en: 'Naraka Chaturdashi (Chhoti Diwali)',
      hi: 'नरक चतुर्दशी (छोटी दिवाली)',
      bangla: 'নরক চতুর্দশী (ছোট দীপাবলি)',
      kannada: 'ನರಕ ಚತುರ್ದಶಿ (ಚೋಟಿ ದೀಪಾವಳಿ)',
      punjabi: 'ਨਰਕ ਚਤੁਰਦਸ਼ੀ (ਛੋਟੀ ਦੀਵਾਲੀ)',
      tamil: 'நரக சதுர்த்தி (சின்ன தீபாவளி)',
      telugu: 'నరక చతుర్దశి (చిన్న దీపావళి)'
    },
    'Govardhan Puja': {
      en: 'Govardhan Puja',
      hi: 'गोवर्धन पूजा',
      bangla: 'গোবর্ধন পূজা',
      kannada: 'ಗೋವರ್ಧನ ಪೂಜೆ',
      punjabi: 'ਗੋਵਰਧਨ ਪੂਜਾ',
      tamil: 'கோவர்தன் பூஜை',
      telugu: 'గోవర్ధన పూజ'
    },
    'Bhai Dooj': {
      en: 'Bhai Dooj',
      hi: 'भाई दूज',
      bangla: 'ভাই দুজ',
      kannada: 'ಭಾಯಿ ದೂಜ್',
      punjabi: 'ਭਾਈ ਦੂਜ',
      tamil: 'பை தூஜ்',
      telugu: 'భాయి దూజ్'
    },
    'Holika Dahan': {
      en: 'Holika Dahan',
      hi: 'होलिका दहन',
      bangla: 'হোলিকা দহন',
      kannada: 'ಹೋಲಿಕಾ ದಹನ',
      punjabi: 'ਹੋਲਿਕਾ ਦਹਨ',
      tamil: 'ஹோலிகா தஹன்',
      telugu: 'హోలికా దహన్'
    },
    'Shravan Somvar (last)': {
      en: 'Shravan Somvar (last)',
      hi: 'श्रावण सोमवार (अंतिम)',
      bangla: 'শ্রাবণ সোমবার (শেষ)',
      kannada: 'ಶ್ರಾವಣ ಸೋಮವಾರ (ಕೊನೆಯ)',
      punjabi: 'ਸ਼੍ਰਾਵਣ ਸੋਮਵਾਰ (ਆਖਰੀ)',
      tamil: 'ஸ்ராவண சோமவாரம் (கடைசி)',
      telugu: 'శ్రావణ సోమవారం (చివరి)'
    },
    'Putrada Ekadashi': {
      en: 'Putrada Ekadashi',
      hi: 'पुत्रदा एकादशी',
      bangla: 'পুত্রদা একাদশী',
      kannada: 'ಪುತ್ರದಾ ಏಕಾದಶಿ',
      punjabi: 'ਪੁਤਰਦਾ ਏਕਾਦਸ਼ੀ',
      tamil: 'புத்திரதா ஏகாதசி',
      telugu: 'పుత్రదా ఏకాదశి'
    },
    'Pausha Putrada Ekadashi': {
      en: 'Pausha Putrada Ekadashi',
      hi: 'पौष पुत्रदा एकादशी',
      bangla: 'পৌষ পুত্রদা একাদশী',
      kannada: 'ಪೌಷ ಪುತ್ರದಾ ಏಕಾದಶಿ',
      punjabi: 'ਪੌਸ਼ ਪੁਤਰਦਾ ਏਕਾਦਸ਼ੀ',
      tamil: 'தை புத்திரதா ஏகாதசி',
      telugu: 'పౌష పుత్రదా ఏకాదశి'
    },
    'Gita Jayanti (Mokshada Ekadashi)': {
      en: 'Gita Jayanti (Mokshada Ekadashi)',
      hi: 'गीता जयंती (मोक्षदा एकादशी)',
      bangla: 'গীতা জয়ন্তী (মোক্ষদা একাদশী)',
      kannada: 'ಗೀತಾ ಜಯಂತಿ (ಮೋಕ್ಷದಾ ಏಕಾದಶಿ)',
      punjabi: 'ਗੀਤਾ ਜਯੰਤੀ (ਮੋਕਸ਼ਦਾ ਏਕਾਦਸ਼ੀ)',
      tamil: 'கீதா ஜயந்தி (மோக்ஷதா ஏகாதசி)',
      telugu: 'గీతా జయంతి (మోక్షదా ఏకాదశి)'
    }
  };

  const translations = {
    updatedUpTo: { 
      en: 'Updated up to March 2026', 
      hi: 'मार्च 2026 तक अपडेट किया गया',
      bangla: 'মার্চ ২০২৬ পর্যন্ত আপডেট করা হয়েছে',
      kannada: 'ಮಾರ್ಚ್ 2026 ರವರೆಗೆ ನವೀಕರಿಸಲಾಗಿದೆ',
      punjabi: 'ਮਾਰਚ 2026 ਤੱਕ ਅਪਡੇਟ ਕੀਤਾ ਗਿਆ',
      tamil: 'மார்ச் 2026 வரை புதுப்பிக்கப்பட்டது',
      telugu: 'మార్చి 2026 వరకు నవీకరించబడింది'
    },
    festivalsThisMonth: { 
      en: 'Festivals this Month:', 
      hi: 'इस महीने के त्योहार:',
      bangla: 'এই মাসের উৎসব:',
      kannada: 'ಈ ತಿಂಗಳ ಹಬ್ಬಗಳು:',
      punjabi: 'ਇਸ ਮਹੀਨੇ ਦੇ ਤਿਉਹਾਰ:',
      tamil: 'இந்த மாத திருவிழாக்கள்:',
      telugu: 'ఈ నెల పండగలు:'
    },
    calendar: { 
      en: 'Calendar', 
      hi: 'कैलेंडर',
      bangla: 'ক্যালেন্ডার',
      kannada: 'ಕ್ಯಾಲೆಂಡರ್',
      punjabi: 'ਕੈਲੰਡਰ',
      tamil: 'காலண்டர்',
      telugu: 'క్యాలెండర్'
    },
    summary: { 
      en: 'Summary', 
      hi: 'सारांश',
      bangla: 'সারসংক্ষেপ',
      kannada: 'ಸಾರಾಂಶ',
      punjabi: 'ਸਾਰ',
      tamil: 'சுருக்கம்',
      telugu: 'సారాంశం'
    },
    hinduCalendar: { 
      en: 'Hindu Calendar 2025-2026', 
      hi: 'हिंदू कैलेंडर 2025-2026',
      bangla: 'হিন্দু ক্যালেন্ডার ২০২৫-২০২৬',
      kannada: 'ಹಿಂದೂ ಕ್ಯಾಲೆಂಡರ್ 2025-2026',
      punjabi: 'ਹਿੰਦੂ ਕੈਲੰਡਰ 2025-2026',
      tamil: 'இந்து காலண்டர் 2025-2026',
      telugu: 'హిందూ క్యాలెండర్ 2025-2026'
    },
    keyFestivals: { 
      en: 'Key Festivals / Vrats:', 
      hi: 'मुख्य त्योहार / व्रत:',
      bangla: 'প্রধান উৎসব / ব্রত:',
      kannada: 'ಪ್ರಮುಖ ಹಬ್ಬಗಳು / ವ್ರತಗಳು:',
      punjabi: 'ਮੁੱਖ ਤਿਉਹਾਰ / ਵਰਤ:',
      tamil: 'முக்கிய திருவிழாக்கள் / விரதங்கள்:',
      telugu: 'ప్రధాన పండగలు / వ్రతాలు:'
    },
    noMajorFestivals: { 
      en: '(No major pan-Indian festivals listed in this period)', 
      hi: '(इस अवधि में कोई प्रमुख पैन-भारतीय त्योहार सूचीबद्ध नहीं)',
      bangla: '(এই সময়কালে কোন প্রধান প্যান-ভারতীয় উৎসব তালিকাভুক্ত নেই)',
      kannada: '(ಈ ಅವಧಿಯಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಪ್ಯಾನ್-ಭಾರತೀಯ ಹಬ್ಬಗಳು ಪಟ್ಟಿಮಾಡಲಾಗಿಲ್ಲ)',
      punjabi: '(ਇਸ ਸਮੇਂ ਦੌਰਾਨ ਕੋਈ ਪ੍ਰਮੁੱਖ ਪੈਨ-ਭਾਰਤੀ ਤਿਉਹਾਰ ਸੂਚੀਬੱਧ ਨਹੀਂ)',
      tamil: '(இந்த காலகட்டத்தில் முக்கியமான பான்-இந்திய திருவிழாக்கள் பட்டியலிடப்படவில்லை)',
      telugu: '(ఈ కాలంలో ప్రధాన పాన్-భారతీయ పండగలు జాబితా చేయబడలేదు)'
    },
    tellMeMore: { 
      en: 'Tell me more', 
      hi: 'और बताएं',
      bangla: 'আরও বলুন',
      kannada: 'ಇನ್ನಷ್ಟು ಹೇಳಿ',
      punjabi: 'ਹੋਰ ਦੱਸੋ',
      tamil: 'மேலும் சொல்லுங்கள்',
      telugu: 'మరింత చెప్పండి'
    }
  };

  // Function to get festival image based on festival name
  const getFestivalImage = (festivalName: string): any => {
    const lowerName = festivalName.toLowerCase();
    
    if (lowerName.includes('ganesh chaturthi')) {
      return require('@/assets/images/fastsAndFestivals/GaneshChaturthi1.jpg');
    } else if (lowerName.includes('raksha bandhan')) {
      return require('@/assets/images/fastsAndFestivals/RakshaBandhan1.jpg');
    } else if (lowerName.includes('krishna janmashtami') || lowerName.includes('janmashtami')) {
      return require('@/assets/images/fastsAndFestivals/Janmashtami1.jpg');
    } else if (lowerName.includes('navratri')) {
      return require('@/assets/images/fastsAndFestivals/Navratri1.jpg');
    } else if (lowerName.includes('diwali')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('dusshera') || lowerName.includes('dussehra') || lowerName.includes('vijayadashami')) {
      return require('@/assets/images/fastsAndFestivals/Dusshera1.jpg');
    } else if (lowerName.includes('karva chauth') || lowerName.includes('karwachauth')) {
      return require('@/assets/images/fastsAndFestivals/KarvaChauth1.jpg');
    } else if (lowerName.includes('makar sankranti')) {
      return require('@/assets/images/fastsAndFestivals/MakarSakranti1.jpg');
    } else if (lowerName.includes('govardhan puja')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('bhai dooj')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('dhanteras')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('naraka chaturdashi') || lowerName.includes('chhoti diwali')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    }
    
    return null;
  };

  // Set initial date to August 2025 (earliest allowed month)
  useEffect(() => {
    const now = new Date();
    const august2025 = new Date(2025, 7, 1);
    
    if (now < august2025) {
      setCurrentDate(august2025);
    } else {
      setCurrentDate(now);
    }
  }, []);

  // Generate marked dates for the calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    // Add Shravana festivals (Aug 1-9, 2025)
    const shravanaFestivals = [
      { name: 'Shravan Somvar (last)', date: 'Aug 4', description: 'Mahadev Shiv Ji' },
      { name: 'Putrada Ekadashi', date: 'Aug 5', description: 'Vishnu Bhagwan' },
      { name: 'Raksha Bandhan', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
    ];
    
    shravanaFestivals.forEach(festival => {
      const dateKey = `2025-08-${festival.date.split(' ')[1].padStart(2, '0')}`;
      markedDates[dateKey] = {
        marked: true,
        dotColor: '#FF6A00',
        text: festival.name,
        description: festival.description,
        // Enhanced highlighting
        selected: true,
        selectedColor: '#FFE5CC',
        textColor: '#FF6A00',
        fontWeight: 'bold'
      };
    });
    
         // Add all other festivals from hinduMonths
     hinduMonths.forEach(month => {
       month.festivals.forEach(festival => {
         const [monthName, day] = festival.date.split(' ');
         const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
         const monthIndex = monthNames.indexOf(monthName);
         const year = monthIndex >= 7 ? 2025 : 2026; // Aug-Sep 2025, rest 2026
         
         const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
         markedDates[dateKey] = {
           marked: true,
           dotColor: '#FF6A00',
           text: festival.name,
           description: festival.description,
           // Enhanced highlighting
           selected: true,
           selectedColor: '#FFE5CC',
           textColor: '#FF6A00',
           fontWeight: 'bold'
         };
       });
     });
     
     // Special handling for March 2026 festivals to ensure they appear
     if (!markedDates['2026-03-03']) {
       markedDates['2026-03-03'] = {
         marked: true,
         dotColor: '#FF6A00',
         text: 'Holika Dahan',
         description: 'Shri Krishna',
         selected: true,
         selectedColor: '#FFE5CC',
         textColor: '#FF6A00',
         fontWeight: 'bold'
       };
     }
     
     if (!markedDates['2026-03-04']) {
       markedDates['2026-03-04'] = {
         marked: true,
         dotColor: '#FF6A00',
         text: 'Holi (Rangotsav)',
         description: 'Shri Krishna',
         selected: true,
         selectedColor: '#FFE5CC',
         textColor: '#FF6A00',
         fontWeight: 'bold'
       };
     }
    
    return markedDates;
  };

  const openMonthDetails = (month: HinduMonth) => {
    setSelectedMonth(month);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMonth(null);
    setSelectedFestival(null);
  };

  const getHinduMonthTitle = (date: Date): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    // Special case for August 2025
    if (month === 'August' && year === 2025) {
      return `${month} (Shravana - Bhadrapada)`;
    }
    
    // Special cases for February and March 2026
    if (month === 'February' && year === 2026) {
      return `${month} ${year} (Magha - Phalguna)`;
    }
    
    if (month === 'March' && year === 2026) {
      return `${month} ${year} (Phalguna)`;
    }
    
    // Find which Hindu months this Gregorian month spans
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const spanningMonths: string[] = [];
    for (const hinduMonth of hinduMonths) {
      if ((hinduMonth.startDate <= monthEnd && hinduMonth.endDate >= monthStart)) {
        spanningMonths.push(hinduMonth.name);
      }
    }
    
    if (spanningMonths.length > 0) {
      return `${month} ${year} (${spanningMonths.join(' - ')})`;
    }
    
    return `${month} ${year}`;
  };

     const onMonthChange = (month: DateData) => {
     const newDate = new Date(month.timestamp);
     if (newDate >= new Date(2025, 7, 1) && newDate <= new Date(2026, 2, 31)) {
       setCurrentDate(newDate);
     }
   };

  const getMonthFestivals = (date: Date): Festival[] => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthFestivals: Festival[] = [];
    
    // Add Shravana festivals for August 2025 (only if we're in August)
    if (date.getFullYear() === 2025 && date.getMonth() === 7) {
      const shravanaFestivals: Festival[] = [
        { name: 'Shravan Somvar (last)', date: 'Aug 4', description: 'Mahadev Shiv Ji' },
        { name: 'Putrada Ekadashi', date: 'Aug 5', description: 'Vishnu Bhagwan' },
        { name: 'Raksha Bandhan', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
      ];
      monthFestivals.push(...shravanaFestivals);
    }
    
    // Special handling for February and March 2026
    if (date.getFullYear() === 2026 && date.getMonth() === 1) { // February 2026
      // February should show festivals from both Magha (Jan 4 - Feb 1) and Phalguna (Feb 2 - Mar 3)
      const februaryFestivals: Festival[] = [
        { name: 'Maha Shivaratri', date: 'Feb 15', description: 'Mahadev Shiv Ji' }
      ];
      monthFestivals.push(...februaryFestivals);
    }
    
         if (date.getFullYear() === 2026 && date.getMonth() === 2) { // March 2026
       // March should show festivals from Phalguna (Feb 2 - Mar 3)
       const marchFestivals: Festival[] = [
         { name: 'Holika Dahan', date: 'Mar 3', description: 'Shri Krishna' },
         { name: 'Holi (Rangotsav)', date: 'Mar 4', description: 'Shri Krishna' }
       ];
       monthFestivals.push(...marchFestivals);
       return monthFestivals; // Return early to avoid duplicate festivals
     }
    
    // Only add festivals that fall within the current English month for other months
    for (const month of hinduMonths) {
      if ((month.startDate <= monthEnd && month.endDate >= monthStart)) {
        const currentMonthFestivals = month.festivals.filter(festival => {
          let festivalDay: number;
          let festivalMonth: number;
          
          if (festival.date.includes('–') || festival.date.includes('-')) {
            const startDate = festival.date.split(/[–-]/)[0].trim();
            const [monthName, day] = startDate.split(' ');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            festivalMonth = monthNames.indexOf(monthName);
            festivalDay = parseInt(day);
          } else {
            const [monthName, day] = festival.date.split(' ');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            festivalMonth = monthNames.indexOf(monthName);
            festivalDay = parseInt(day);
          }
          
          return festivalMonth === date.getMonth();
        });
        
        monthFestivals.push(...currentMonthFestivals);
      }
    }
    
    return monthFestivals;
  };

  const monthFestivals = getMonthFestivals(currentDate);

  const renderCalendarTab = () => (
            <ScrollView 
          style={styles.calendarTab} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
             {/* Update notice */}
       <Text style={styles.updateNotice}>{getTranslation(translations.updatedUpTo)}</Text>
       
       {/* Month Title */}
       <Text style={styles.monthTitle}>{getHinduMonthTitle(currentDate)}</Text>
      
      {/* Calendar with Built-in Swipe Support */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentDate.toISOString().split('T')[0]}
          onMonthChange={onMonthChange}
          markedDates={getMarkedDates()}
                     minDate={'2025-08-01'}
           maxDate={'2026-03-31'}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#FF6A00',
            selectedDayBackgroundColor: '#FF6A00',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF6A00',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#FF6A00',
            indicatorColor: '#FF6A00',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: getResponsiveFontSize(16),
            textMonthFontSize: getResponsiveFontSize(18),
            textDayHeaderFontSize: getResponsiveFontSize(14)
          }}
          markingType={'period'}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={0}
          hideDayNames={false}
          showWeekNumbers={false}
          enableSwipeMonths={true}
          onDayPress={(day) => {
            const dateKey = day.dateString;
            const markedDate = getMarkedDates()[dateKey];
            if (markedDate) {
              const festivalImage = getFestivalImage(markedDate.text);
              setSelectedFestival({
                name: markedDate.text,
                date: markedDate.text,
                description: markedDate.description,
                image: festivalImage
              });
              setModalVisible(true);
            }
          }}
        />
      </View>

      {/* Month Festivals List */}
      {monthFestivals.length > 0 && (
        <View style={styles.monthFestivalsList}>
          <Text style={styles.monthFestivalsTitle}>{getTranslation(translations.festivalsThisMonth)}</Text>
          {monthFestivals.map((festival, index) => (
            <View key={index} style={styles.monthFestivalItem}>
              <Text style={styles.monthFestivalName}>{getFestivalTranslation(festival.name, festivalTranslations)}</Text>
              <Text style={styles.monthFestivalDate}>{festival.date}</Text>
              {festival.description && (
                <Text style={styles.monthFestivalDescription}>
                  {festival.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Bottom white space for easy scrolling */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderSummaryTab = () => (
         <ScrollView 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
       {/* Update notice */}
       <Text style={styles.updateNotice}>{getTranslation(translations.updatedUpTo)}</Text>
       
       {/* Hindu Months Overview */}
       <Text style={styles.sectionTitle}>{getTranslation(translations.hinduCalendar)}</Text>
      
      {hinduMonths.map((month, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.monthCard, { borderLeftColor: month.color.replace('#', '#80') }]}
          onPress={() => openMonthDetails(month)}
        >
          <View style={styles.monthHeader}>
            <Text style={styles.monthName}>{getTranslation(monthTranslations[month.name as keyof typeof monthTranslations] || { en: month.name, hi: month.name, bangla: month.name, kannada: month.name, punjabi: month.name, tamil: month.name, telugu: month.name })}</Text>
            <Text style={styles.gregorianSpan}>({month.gregorianSpan})</Text>
          </View>
          
          {month.festivals.length > 0 ? (
            <View style={styles.festivalsContainer}>
              <Text style={styles.festivalsTitle}>{getTranslation(translations.keyFestivals)}</Text>
              {month.festivals.map((festival, fIndex) => (
                <Text key={fIndex} style={styles.festivalText}>
                  {getFestivalTranslation(festival.name, festivalTranslations)} – {festival.date}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.noFestivals}>
              {getTranslation(translations.noMajorFestivals)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Numerology screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
              {getTranslation(translations.calendar)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
              {getTranslation(translations.summary)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'calendar' ? renderCalendarTab() : renderSummaryTab()}
      </View>

      {/* Festival Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              {selectedFestival && (
                <View style={styles.modalBody}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{getFestivalTranslation(selectedFestival.name, festivalTranslations)}</Text>
                    <Text style={styles.modalSubtitle}>{selectedFestival.date}</Text>
                  </View>
                  
                  {/* Festival Image */}
                  {selectedFestival.image && (
                    <View style={styles.festivalImageContainer}>
                      <Image 
                        source={selectedFestival.image} 
                        style={styles.festivalImage} 
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  
                                       {/* Festival Description */}
                     {selectedFestival.description && (
                       <View style={styles.modalFestivalItem}>
                         <Text style={styles.modalFestivalDescription}>
                           {selectedFestival.description}
                         </Text>
                       </View>
                     )}
                     
                     {/* Tell me more button for Diwali and related festivals */}
                     {(selectedFestival.name.toLowerCase().includes('diwali') || 
                       selectedFestival.name.toLowerCase().includes('govardhan puja') || 
                       selectedFestival.name.toLowerCase().includes('bhai dooj') ||
                       selectedFestival.name.toLowerCase().includes('dhanteras') ||
                       selectedFestival.name.toLowerCase().includes('naraka chaturdashi') ||
                       selectedFestival.name.toLowerCase().includes('chhoti diwali')) && (
                       <TouchableOpacity style={styles.tellMeMoreButton} onPress={() => {
                         closeModal();
                         // Route to specific festival pages based on the festival name
                         if (selectedFestival.name.toLowerCase().includes('dhanteras')) {
                           router.push('/screens/dhanteras-2025');
                         } else if (selectedFestival.name.toLowerCase().includes('naraka chaturdashi') || 
                                   selectedFestival.name.toLowerCase().includes('chhoti diwali')) {
                           router.push('/screens/chhoti-diwali-2025');
                         } else if (selectedFestival.name.toLowerCase().includes('diwali')) {
                           router.push('/screens/diwali-2025');
                         } else if (selectedFestival.name.toLowerCase().includes('govardhan puja')) {
                           router.push('/screens/govardhan-puja-2025');
                         } else if (selectedFestival.name.toLowerCase().includes('bhai dooj')) {
                           router.push('/screens/bhai-dooj-2025');
                         } else {
                           // Fallback to generic diwali page
                           router.push('/screens/diwali');
                         }
                       }}>
                         <Text style={styles.tellMeMoreButtonText}>{getTranslation(translations.tellMeMore)}</Text>
                       </TouchableOpacity>
                     )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    width: Math.min(screenWidth * 1.125 * 0.8, screenWidth),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  temple: {
    position: 'absolute',
    width: screenWidth * 1.5 * 0.8 * 1.2,
    height: 120 * 0.8 * 1.2,
    left: screenWidth * -0.25 * 0.8,
    bottom: 0,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: 'white',
    marginTop: CARD_MARGIN_TOP,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF6A00',
  },
  calendarTab: {
    flex: 1,
  },
  monthTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateNotice: {
    textAlign: 'center',
    fontSize: getResponsiveFontSize(16),
    color: '#FF6A00',
    fontWeight: 'bold',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  monthCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: getResponsiveDimension(20),
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthHeader: {
    marginBottom: 15,
  },
  monthName: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 5,
  },
  gregorianSpan: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    fontStyle: 'italic',
  },
  festivalsContainer: {
    marginTop: 10,
  },
  festivalsTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  festivalText: {
    fontSize: getResponsiveFontSize(14),
    color: '#555',
    marginBottom: 5,
    paddingLeft: 10,
  },
  noFestivals: {
    fontSize: getResponsiveFontSize(14),
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthFestivalsList: {
    marginTop: 20,
    padding: getResponsiveDimension(15),
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
  },
  monthFestivalsTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthFestivalItem: {
    backgroundColor: 'white',
    padding: getResponsiveDimension(12),
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthFestivalName: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  monthFestivalDate: {
    fontSize: getResponsiveFontSize(12),
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 4,
  },
  monthFestivalDescription: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: getResponsiveDimension(20),
    margin: getResponsiveDimension(20),
    maxWidth: screenWidth - 40,
    maxHeight: '80%',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    fontStyle: 'italic',
  },
  modalFestivals: {
    width: '100%',
    marginBottom: 20,
  },
  modalFestivalsTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalFestivalItem: {
    backgroundColor: '#F8F9FA',
    padding: getResponsiveDimension(15),
    borderRadius: 10,
    marginBottom: 10,
  },
  modalFestivalName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalFestivalDate: {
    fontSize: getResponsiveFontSize(14),
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 5,
  },
  modalFestivalDescription: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    fontStyle: 'italic',
  },
  modalNoFestivals: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: getResponsiveDimension(30),
    paddingVertical: getResponsiveDimension(12),
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  festivalImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  festivalImage: {
    height: 150,
    width: 200,
    borderRadius: 12,
  },
  bottomSpacing: {
    height: 200,
  },
  tellMeMoreButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tellMeMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HinduCalendarScreen;
