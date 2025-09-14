import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback, ScrollView, Image, Alert, Animated, Easing, PanResponder, GestureResponderEvent, PanResponderGestureState, ActivityIndicator, TextInput, AppState, BackHandler } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient, Line } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { loadTempleConfigurationNewStyle, saveTempleConfigurationNewStyle, checkUserAuthentication } from '@/utils/templeUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { markDailyPujaCompleted, markDailyPujaVisited } from '@/utils/dailyPujaUtils';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { useAudioVideoModal } from '@/contexts/AudioVideoModalContext';

export const options = { headerShown: false };

// Utility function to safely update state and avoid useInsertionEffect warnings
const safeSetState = (setter: () => void) => {
  // Use requestAnimationFrame to defer state updates to the next frame
  requestAnimationFrame(() => {
    setter();
  });
};

// Suppress useInsertionEffect warnings in development
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('useInsertionEffect must not schedule updates')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

const { width: screenWidth, height: screenHeight, scale } = Dimensions.get('window');


// Function to get temple image dimensions
const getTempleImageDimensions = (templeId: string) => {
  const templeImageSources = {
    temple1: require('@/assets/images/temple/Temple1_new.png'),
    temple2: require('@/assets/images/temple/Temple2_new.png'),
    temple3: require('@/assets/images/temple/Temple3.png'),
  };

  return new Promise<{width: number, height: number}>((resolve, reject) => {
    Image.getSize(
      Image.resolveAssetSource(templeImageSources[templeId as keyof typeof templeImageSources]).uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const templeStyles = [
  {
    id: 'temple3',
    image: require('@/assets/images/temple/Temple3.png'),
  },
  {
    id: 'temple1',
    image: require('@/assets/images/temple/Temple1_new.png'),
  },
  {
    id: 'temple2', 
    image: require('@/assets/images/temple/Temple2_new.png'),
  },
];

const gradientPresets = [
  ['#8B5CF6', '#7C3AED', '#6D28D9'], // purple
  ['#43CEA2', '#185A9D'], // green-blue
  ['#FFDEE9', '#B5FFFC'], // pink-blue
  ['#F953C6', '#B91D73'], // pink-violet
  ['#00F2FE', '#4FACFE'], // cyan-blue
  ['#43E97B', '#38F9D7'], // green-turquoise
  ['#667EEA', '#764BA2'], // blue-purple
  ['#9795f0', '#fbc7d4'], // purple-pink
  ['#C33764', '#1D2671'], // magenta-indigo
  ['#11998e', '#38ef7d'], // green
  ['#FF5F6D', '#FFC371'], // red-orange
];

interface DeityData {
  _id?: string;
  'Deity': {
    'Name': string;
    'Statues': string[];
  };
  'Icon': string;
}

// Function to get image source from MongoDB data using static require calls
const getImageSource = (imagePath: string) => {
  // Handle different possible path formats
  let filename = '';
  
  if (imagePath.startsWith('assets/images/temple/')) {
    filename = imagePath.replace('assets/images/temple/', '');
  } else if (imagePath.startsWith('assets/temple/')) {
    filename = imagePath.replace('assets/temple/', '');
  } else if (imagePath.startsWith('temple/')) {
    filename = imagePath.replace('temple/', '');
  } else if (imagePath.includes('/')) {
    // Extract filename from any path
    filename = imagePath.split('/').pop() || '';
  } else {
    filename = imagePath;
  }
  
  // Map MongoDB paths to static require calls
  switch (filename) {
    // Original icons
    case 'VishnuIcon.png':
      return require('@/assets/images/temple/VishnuIcon.png');
    case 'Ganesha1.png':
      return require('@/assets/images/temple/Ganesha1.png');
    case 'Ganesha2.png':
      return require('@/assets/images/temple/Ganesha2.png');
    case 'Krishna1.png':
      return require('@/assets/images/temple/Krishna1.png');
    case 'Krishna2.png':
      return require('@/assets/images/temple/Krishna2.png');
    case 'Vishnu1.png':
      return require('@/assets/images/temple/Vishnu1.png');
    case 'Lakshmi1.png':
      return require('@/assets/images/temple/Lakshmi1.png');
    case 'Saraswati1.png':
      return require('@/assets/images/temple/Saraswati1.png');
    case 'Durga1.png':
      return require('@/assets/images/temple/Durga1.png');
    case 'Durga2.png':
      return require('@/assets/images/temple/Durga2.png');
    case 'Brahma1.png':
      return require('@/assets/images/temple/Brahma1.png');
    case 'Shiv2.png':
      return require('@/assets/images/temple/Shiv2.png');
    case 'ShivParvati1.png':
      return require('@/assets/images/temple/ShivParvati1.png');
    case 'Rama1.png':
      return require('@/assets/images/temple/Rama1.png');
    case 'Hanuman1.png':
      return require('@/assets/images/temple/Hanuman1.png');
    case 'Surya1.png':
      return require('@/assets/images/temple/Surya1.png');
    
    // New icons from "New folder"
    case 'Ganesha3.png':
      return require('@/assets/images/temple/New folder/Ganesha3.png');
    case 'Ganesha4.png':
      return require('@/assets/images/temple/New folder/Ganesha4.png');
    case 'Ganesha5.png':
      return require('@/assets/images/temple/New folder/Ganesha5.png');
    case 'Krishna3.png':
      return require('@/assets/images/temple/New folder/Krishna3.png');
    case 'Krishna4.png':
      return require('@/assets/images/temple/New folder/Krishna4.png');
    case 'Krishna5.png':
      return require('@/assets/images/temple/New folder/Krishna5.png');
    case 'Vishnu2.png':
      return require('@/assets/images/temple/New folder/Vishnu2.png');
    case 'Vishnu3.png':
      return require('@/assets/images/temple/New folder/Vishnu3.png');
    case 'Lakshmi2.png':
      return require('@/assets/images/temple/New folder/Lakshmi2.png');
    case 'Saraswati2.png':
      return require('@/assets/images/temple/New folder/Saraswati2.png');
    case 'Saraswati3.png':
      return require('@/assets/images/temple/New folder/Saraswati3.png');
    case 'Durga3.png':
      return require('@/assets/images/temple/New folder/Durga3.png');
    case 'Shiv3.png':
      return require('@/assets/images/temple/New folder/Shiv3.png');
    case 'Shiv4.png':
      return require('@/assets/images/temple/New folder/Shiv4.png');
    case 'ShivParvati2.png':
      return require('@/assets/images/temple/New folder/ShivParvati2.png');
    case 'Rama2.png':
      return require('@/assets/images/temple/New folder/Rama2.png');
    case 'Rama3.png':
      return require('@/assets/images/temple/New folder/Rama3.png');
    case 'Rama4.png':
      return require('@/assets/images/temple/New folder/Rama4.png');
    case 'Hanuman2.png':
      return require('@/assets/images/temple/New folder/Hanuman2.png');
    case 'Hanuman3.png':
      return require('@/assets/images/temple/New folder/Hanuman3.png');
    case 'Hanuman4.png':
      return require('@/assets/images/temple/New folder/Hanuman4.png');
    case 'Kali1.png':
      return require('@/assets/images/temple/New folder/Kali1.png');
    
    // Temple and other assets
    case 'Temple1.png':
      return require('@/assets/images/temple/Temple1.png');
    case 'Temple2.png':
      return require('@/assets/images/temple/Temple2.png');
    case 'templeBellIcon2.png':
      return require('@/assets/images/temple/templeBellIcon2.png');
    case 'arch.svg':
      return require('@/assets/images/temple/arch.svg');
    default:
      return require('@/assets/images/temple/Ganesha1.png');
  }
};


function ArchSVG(props: { width?: number; height?: number; style?: any }) {
  return (
    <Svg
      width={props.width || screenWidth}
      height={props.height || (screenWidth * 295) / 393}
      viewBox="0 0 393 295"
      fill="none"
      style={props.style}
    >
      <Path
        d="m195.41,144.53c0,0 -5.13,43.22 -71.95,40.79c0,0 -40.54,-3.6 -34.78,31.09c0,0 -54.11,-5.23 -56.65,54.74c0,0 -28.94,-1.71 -32.01,17.85l-121.02,0c0,-65 -1,-283 -1,-348l480.57,-1.99c145.81,0.66 72.76,-0.67 163.57,1l-10.14,348.99l-121.2,0c0,0 0.95,-18.14 -32.01,-17.85c0,0 1.43,-55.44 -56.65,-54.8c0,0 8.36,-27.21 -29.41,-30.87c-0.03,0 -60.23,9.55 -77.32,-40.95z"
        fill="url(#archGradient)"
      />
      <Defs>
        <SvgLinearGradient id="archGradient" x1="0.5" y1="0.15" x2="0.5" y2="0.78" gradientUnits="objectBoundingBox">
          <Stop stopColor="#FFAE51" />
          <Stop offset="0.99" stopColor="#E87C00" />
        </SvgLinearGradient>
      </Defs>
    </Svg>
  );
}

// Draggable Thali component for Aarti
const DraggableThali: React.FC<{ onImageLoad: () => void }> = ({ onImageLoad }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: 0,
        });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.thaliContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Image
        source={require('@/assets/images/icons/own temple/PujaThali1.png')}
        style={styles.thaliImage}
        resizeMode="contain"
        onLoad={onImageLoad}
      />
    </Animated.View>
  );
};

export default function TestTempleScreen() {
  const router = useRouter();
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  const { showAudioVideoModal } = useAudioVideoModal();

  // Translation helper function
  const getTranslation = (translations: any) => {
    return translations[currentLanguage] || translations.en || '';
  };

  // Translations
  const translations = {
    loadingBackground: {
      en: 'Loading background...',
      hi: 'पृष्ठभूमि लोड हो रही है...',
      bangla: 'পটভূমি লোড হচ্ছে...',
      kannada: 'ಹಿನ್ನೆಲೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਬੈਕਗ੍ਰਾਊਂਡ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      tamil: 'பின்னணி ஏற்றப்படுகிறது...',
      telugu: 'బ్యాక్గ్రౌండ్ లోడ్ అవుతోంది...'
    },
    templeSaved: {
      en: 'ॐ Temple Saved ॐ',
      hi: 'ॐ मंदिर सहेजा गया ॐ',
      bangla: 'ॐ মন্দির সংরক্ষিত ॐ',
      kannada: 'ॐ ದೇವಾಲಯ ಉಳಿಸಲಾಗಿದೆ ॐ',
      punjabi: 'ॐ ਮੰਦਰ ਸੇਵ ਕੀਤਾ ਗਿਆ ॐ',
      tamil: 'ॐ கோவில் சேமிக்கப்பட்டது ॐ',
      telugu: 'ॐ దేవాలయం సేవ్ చేయబడింది ॐ'
    },
    musicSearchPlaceholder: {
      en: 'Search for bhajans, aartis, mantras...',
      hi: 'भजन, आरती, मंत्र खोजें...',
      bangla: 'ভজন, আরতি, মন্ত্র খুঁজুন...',
      kannada: 'ಭಜನೆ, ಆರತಿ, ಮಂತ್ರಗಳನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਭਜਨ, ਆਰਤੀ, ਮੰਤਰ ਖੋਜੋ...',
      tamil: 'பஜனை, ஆரத்தி, மந்திரங்களைத் தேடுங்கள்...',
      telugu: 'భజనలు, ఆరతులు, మంత్రాలను వెతకండి...'
    },
    errorPlayingMusic: {
      en: 'Error',
      hi: 'त्रुटि',
      bangla: 'ত্রুটি',
      kannada: 'ದೋಷ',
      punjabi: 'ਗਲਤੀ',
      tamil: 'பிழை',
      telugu: 'లోపం'
    },
    failedToPlayMusic: {
      en: 'Failed to play music file',
      hi: 'संगीत फ़ाइल चलाने में विफल',
      bangla: 'সংগীত ফাইল চালাতে ব্যর্থ',
      kannada: 'ಸಂಗೀತ ಫೈಲ್ ನುಡಿಸಲು ವಿಫಲವಾಗಿದೆ',
      punjabi: 'ਸੰਗੀਤ ਫਾਈਲ ਚਲਾਉਣ ਵਿੱਚ ਅਸਫਲ',
      tamil: 'இசை கோப்பை இயக்க முடியவில்லை',
      telugu: 'సంగీత ఫైల్ ప్లే చేయడంలో విఫలమైంది'
    },
    noDeityMessage: {
      en: 'Please select deities to setup your own temple',
      hi: 'कृपया अपना मंदिर सेटअप करने के लिए देवताओं का चयन करें',
      bangla: 'আপনার নিজের মন্দির সেটআপ করার জন্য দেবতাদের নির্বাচন করুন',
      kannada: 'ನಿಮ್ಮ ಸ್ವಂತ ದೇವಾಲಯವನ್ನು ಸೆಟಪ್ ಮಾಡಲು ದೇವತೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
      punjabi: 'ਆਪਣਾ ਮੰਦਰ ਸੈਟਅੱਪ ਕਰਨ ਲਈ ਦੇਵਤਿਆਂ ਦਾ ਚੋਣ ਕਰੋ',
      tamil: 'உங்கள் சொந்த கோவிலை அமைக்க தெய்வங்களைத் தேர்ந்தெடுக்கவும்',
      telugu: 'మీ స్వంత దేవాలయాన్ని సెటప్ చేయడానికి దేవుళ్లను ఎంచుకోండి'
    },
    selectDeities: {
      en: 'Select Deities',
      hi: 'देवता चुनें',
      bangla: 'দেবতা নির্বাচন করুন',
      kannada: 'ದೇವತೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
      punjabi: 'ਦੇਵਤਿਆਂ ਦਾ ਚੋਣ ਕਰੋ',
      tamil: 'தெய்வங்களைத் தேர்ந்தெடுக்கவும்',
      telugu: 'దేవుళ్లను ఎంచుకోండి'
    },
    temple: {
      en: 'Temple',
      hi: 'मंदिर',
      bangla: 'মন্দির',
      kannada: 'ದೇವಾಲಯ',
      punjabi: 'ਮੰਦਰ',
      tamil: 'கோவில்',
      telugu: 'దేవాలయం'
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
    background: {
      en: 'BG',
      hi: 'बैकग्राउंड',
      bangla: 'পটভূমি',
      kannada: 'ಹಿನ್ನೆಲೆ',
      punjabi: 'ਬੈਕਗ੍ਰਾਊਂਡ',
      tamil: 'பின்னணி',
      telugu: 'బ్యాక్గ్రౌండ్'
    },
    save: {
      en: 'Save',
      hi: 'सहेजें',
      bangla: 'সংরক্ষণ করুন',
      kannada: 'ಉಳಿಸಿ',
      punjabi: 'ਸੇਵ ਕਰੋ',
      tamil: 'சேமி',
      telugu: 'సేవ్ చేయండి'
    },
    flowers: {
      en: 'Flowers',
      hi: 'फूल',
      bangla: 'ফুল',
      kannada: 'ಹೂವುಗಳು',
      punjabi: 'ਫੁੱਲ',
      tamil: 'மலர்கள்',
      telugu: 'పువ్వులు'
    },
    aarti: {
      en: 'Aarti',
      hi: 'आरती',
      bangla: 'আরতি',
      kannada: 'ಆರತಿ',
      punjabi: 'ਆਰਤੀ',
      tamil: 'ஆரத்தி',
      telugu: 'ఆరతి'
    },
    music: {
      en: 'Music',
      hi: 'संगीत',
      bangla: 'সংগীত',
      kannada: 'ಸಂಗೀತ',
      punjabi: 'ਸੰਗੀਤ',
      tamil: 'இசை',
      telugu: 'సంగీతం'
    },
    shankh: {
      en: 'Shankh',
      hi: 'शंख',
      bangla: 'শঙ্খ',
      kannada: 'ಶಂಖ',
      punjabi: 'ਸ਼ੰਖ',
      tamil: 'சங்கு',
      telugu: 'శంఖం'
    },
    ghanti: {
      en: 'Ghanti',
      hi: 'घंटी',
      bangla: 'ঘণ্টা',
      kannada: 'ಗಂಟೆ',
      punjabi: 'ਘੰਟੀ',
      tamil: 'மணி',
      telugu: 'గంట'
    },
    loadingAartiThali: {
      en: 'Loading Aarti Thali...',
      hi: 'आरती थाली लोड हो रही है...',
      bangla: 'আরতি থালি লোড হচ্ছে...',
      kannada: 'ಆರತಿ ಥಾಲಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਆਰਤੀ ਥਾਲੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...',
      tamil: 'ஆரத்தி தாலி ஏற்றப்படுகிறது...',
      telugu: 'ఆరతి థాలి లోడ్ అవుతోంది...'
    },
    divineMusic: {
      en: '🎵 Divine Music',
      hi: '🎵 दिव्य संगीत',
      bangla: '🎵 দিব্য সংগীত',
      kannada: '🎵 ದಿವ್ಯ ಸಂಗೀತ',
      punjabi: '🎵 ਦਿਵਯ ਸੰਗੀਤ',
      tamil: '🎵 தெய்வீக இசை',
      telugu: '🎵 దివ్య సంగీతం'
    },
    stopMusic: {
      en: '⏹️ Stop Music',
      hi: '⏹️ संगीत बंद करें',
      bangla: '⏹️ সংগীত বন্ধ করুন',
      kannada: '⏹️ ಸಂಗೀತ ನಿಲ್ಲಿಸಿ',
      punjabi: '⏹️ ਸੰਗੀਤ ਬੰਦ ਕਰੋ',
      tamil: '⏹️ இசையை நிறுத்து',
      telugu: '⏹️ సంగీతం ఆపండి'
    },
    loadingMusicLibrary: {
      en: 'Loading music library...',
      hi: 'संगीत लाइब्रेरी लोड हो रही है...',
      bangla: 'সংগীত লাইব্রেরি লোড হচ্ছে...',
      kannada: 'ಸಂಗೀತ ಗ್ರಂಥಾಲಯ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਸੰਗੀਤ ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...',
      tamil: 'இசை நூலகம் ஏற்றப்படுகிறது...',
      telugu: 'సంగీత లైబ్రరీ లోడ్ అవుతోంది...'
    },
    noMusicFilesFound: {
      en: 'No music files found in S3',
      hi: 'S3 में कोई संगीत फ़ाइल नहीं मिली',
      bangla: 'S3 এ কোনো সংগীত ফাইল পাওয়া যায়নি',
      kannada: 'S3 ನಲ್ಲಿ ಸಂಗೀತ ಫೈಲ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      punjabi: 'S3 ਵਿੱਚ ਕੋਈ ਸੰਗੀਤ ਫਾਈਲ ਨਹੀਂ ਮਿਲੀ',
      tamil: 'S3 இல் இசை கோப்புகள் கிடைக்கவில்லை',
      telugu: 'S3 లో సంగీత ఫైల్‌లు కనుగొనబడలేదు'
    },
    uploadMusicFiles: {
      en: 'Please upload music files to the \'music/\' folder in S3',
      hi: 'कृपया S3 में \'music/\' फ़ोल्डर में संगीत फ़ाइलें अपलोड करें',
      bangla: 'অনুগ্রহ করে S3 এ \'music/\' ফোল্ডারে সংগীত ফাইল আপলোড করুন',
      kannada: 'ದಯವಿಟ್ಟು S3 ನಲ್ಲಿ \'music/\' ಫೋಲ್ಡರ್‌ಗೆ ಸಂಗೀತ ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ S3 ਵਿੱਚ \'music/\' ਫੋਲਡਰ ਵਿੱਚ ਸੰਗੀਤ ਫਾਈਲਾਂ ਅਪਲੋਡ ਕਰੋ',
      tamil: 'தயவுசெய்து S3 இல் \'music/\' கோப்புறையில் இசை கோப்புகளை பதிவேற்றவும்',
      telugu: 'దయచేసి S3 లో \'music/\' ఫోల్డర్‌లో సంగీత ఫైల్‌లను అప్‌లోడ్ చేయండి'
    },
    performingPuja: {
      en: 'Performing Puja...',
      hi: 'पूजा हो रही है...',
      bangla: 'পুজো হচ্ছে...',
      kannada: 'ಪೂಜೆ ನಡೆಯುತ್ತಿದೆ...',
      punjabi: 'ਪੂਜਾ ਹੋ ਰਹੀ ਹੈ...',
      tamil: 'பூஜை நடைபெறுகிறது...',
      telugu: 'పూజ జరుగుతోంది...'
    },
    performPuja: {
      en: 'Perform Puja',
      hi: 'पूजा करें',
      bangla: 'পুজো করুন',
      kannada: 'ಪೂಜೆ ಮಾಡಿ',
      punjabi: 'ਪੂਜਾ ਕਰੋ',
      tamil: 'பூஜை செய்யுங்கள்',
      telugu: 'పూజ చేయండి'
    },
    myTemple: {
      en: 'My Temple',
      hi: 'मेरा मंदिर',
      bangla: 'আমার মন্দির',
      kannada: 'ನನ್ನ ದೇವಾಲಯ',
      punjabi: 'ਮੇਰਾ ਮੰਦਰ',
      tamil: 'என் கோவில்',
      telugu: 'నా దేవాలయం'
    },
    todaysPujas: {
      en: 'Today\'s Pujas',
      hi: 'आज की पूजा',
      bangla: 'আজকের পুজো',
      kannada: 'ಇಂದಿನ ಪೂಜೆಗಳು',
      punjabi: 'ਅੱਜ ਦੀ ਪੂਜਾ',
      tamil: 'இன்றைய பூஜைகள்',
      telugu: 'ఈ రోజు పూజలు'
    },
    allTemples: {
      en: 'All Temples',
      hi: 'सभी मंदिर',
      bangla: 'সব মন্দির',
      kannada: 'ಎಲ್ಲಾ ದೇವಾಲಯಗಳು',
      punjabi: 'ਸਾਰੇ ਮੰਦਰ',
      tamil: 'அனைத்து கோவில்கள்',
      telugu: 'అన్ని దేవాలయాలు'
    }
  };
  
  // State management for navigation (3 states: myTemple, todaysPuja, allTemples)
  const [currentScreen, setCurrentScreen] = useState<'myTemple' | 'todaysPuja' | 'allTemples'>('myTemple');
  
  // Animation for flashing deity icon
  const flashAnim = useRef(new Animated.Value(1)).current;
  
  // All Temples data with multiple images per deity and their actual dimensions
  const allTemplesData = [
    { 
      id: 'ganesh', 
      name: 'Vighnaharta Ganesh', 
      nameHindi: 'विघ्नहर्ता गणेश', 
      icon: require('@/assets/images/AllTemples/Vighnaharta Ganesh/LordGaneshaTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Vighnaharta Ganesh/LordGaneshaTemple1.png'), width: 845, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vighnaharta Ganesh/LordGaneshaTemple2.png'), width: 897, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vighnaharta Ganesh/LordGaneshaTemple3.png'), width: 703, height: 1000 },
      ]
    },
    { 
      id: 'shiv', 
      name: 'Mahadev Shiv Ji', 
      nameHindi: 'महादेव शिव जी', 
      icon: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple1.png'), width: 904, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple2.png'), width: 688, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple3.png'), width: 906, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple4.png'), width: 702, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple5.png'), width: 936, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahadev Shiv Ji/MahadevTemple6.png'), width: 762, height: 1000 },
      ]
    },
    { 
      id: 'vishnu', 
      name: 'Vishnu Bhagwan', 
      nameHindi: 'विष्णु भगवान', 
      icon: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple1.png'), width: 474, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple2.png'), width: 777, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple3.png'), width: 826, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple4.png'), width: 995, height: 1000 },
        { source: require('@/assets/images/AllTemples/Vishnu Bhagwan/LordVishnuTemple5.png'), width: 1240, height: 1000 },
      ]
    },
    { 
      id: 'durga', 
      name: 'Durga Maa', 
      nameHindi: 'दुर्गा माँ', 
      icon: require('@/assets/images/AllTemples/Durga Maa/MaaDurgaTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Durga Maa/MaaDurgaTemple1.png'), width: 858, height: 1000 },
        { source: require('@/assets/images/AllTemples/Durga Maa/MaaDurgaTemple2.png'), width: 957, height: 1000 },
        { source: require('@/assets/images/AllTemples/Durga Maa/MaaDurgaTemple3.png'), width: 759, height: 1000 },
      ]
    },
    { 
      id: 'lakshmi', 
      name: 'Lakshmi Maa', 
      nameHindi: 'लक्ष्मी माँ', 
      icon: require('@/assets/images/AllTemples/Lakshmi Maa/MaaLaxmiTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Lakshmi Maa/MaaLaxmiTemple1.png'), width: 999, height: 1000 },
        { source: require('@/assets/images/AllTemples/Lakshmi Maa/MaaLaxmiTemple2.png'), width: 708, height: 1000 },
        { source: require('@/assets/images/AllTemples/Lakshmi Maa/MaaLaxmiTemple3.png'), width: 794, height: 1000 },
      ]
    },
    { 
      id: 'hanuman', 
      name: 'Mahaveer Hanuman', 
      nameHindi: 'महावीर हनुमान', 
      icon: require('@/assets/images/AllTemples/Mahaveer Hanuman/VeerHanumanTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Mahaveer Hanuman/VeerHanumanTemple1.png'), width: 810, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahaveer Hanuman/VeerHanumanTemple2.png'), width: 446, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahaveer Hanuman/VeerHanumanTemple3.png'), width: 348, height: 1000 },
      ]
    },
    { 
      id: 'ram', 
      name: 'Shri Ram', 
      nameHindi: 'श्री राम', 
      icon: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple1.png'), width: 706, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple2.png'), width: 614, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple3.png'), width: 770, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple4.png'), width: 659, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Ram/ShreeRamTemple5.jpg'), width: 578, height: 750 },
      ]
    },
    { 
      id: 'krishna', 
      name: 'Shri Krishna', 
      nameHindi: 'श्री कृष्ण', 
      icon: require('@/assets/images/AllTemples/Shri Krishna/SreeKrishnaTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Shri Krishna/SreeKrishnaTemple1.png'), width: 633, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Krishna/SreeKrishnaTemple2.png'), width: 962, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shri Krishna/SreeKrishnaTemple3.png'), width: 902, height: 1000 },
      ]
    },
    { 
      id: 'balgopal', 
      name: 'Bal Gopal', 
      nameHindi: 'बाल गोपाल', 
      icon: require('@/assets/images/AllTemples/Bal Gopal/BalGopalIcon.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Bal Gopal/BalGopalTemple1.png'), width: 727, height: 1000 },
        { source: require('@/assets/images/AllTemples/Bal Gopal/BalGopalTemple2.png'), width: 698, height: 1000 },
        { source: require('@/assets/images/AllTemples/Bal Gopal/BalGopalTemple3.png'), width: 884, height: 1000 },
      ]
    },
    { 
      id: 'kali', 
      name: 'Kali Maa', 
      nameHindi: 'काली माँ', 
      icon: require('@/assets/images/AllTemples/Mahakali Maa/MaaKaliTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Mahakali Maa/MaaKaliTemple1.png'), width: 700, height: 800 },
        { source: require('@/assets/images/AllTemples/Mahakali Maa/MaaKaliTemple2.png'), width: 1333, height: 1000 },
        { source: require('@/assets/images/AllTemples/Mahakali Maa/MaaKaliTemple3.png'), width: 790, height: 1000 },
      ]
    },
    { 
      id: 'saraswati', 
      name: 'Saraswati Maa', 
      nameHindi: 'सरस्वती माँ', 
      icon: require('@/assets/images/AllTemples/Saraswati Maa/MaaSaraswatiTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Saraswati Maa/MaaSaraswatiTemple1.png'), width: 797, height: 1000 },
        { source: require('@/assets/images/AllTemples/Saraswati Maa/MaaSaraswatiTemple2.png'), width: 894, height: 1000 },
        { source: require('@/assets/images/AllTemples/Saraswati Maa/MaaSaraswatiTemple3.png'), width: 1013, height: 1000 },
      ]
    },
    { 
      id: 'ganga', 
      name: 'Ganga Maiyaa', 
      nameHindi: 'गंगा मैया', 
      icon: require('@/assets/images/AllTemples/Ganga Maiyaa/MaaGangaTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Ganga Maiyaa/MaaGangaTemple1.png'), width: 1000, height: 1000 },
        { source: require('@/assets/images/AllTemples/Ganga Maiyaa/MaaGangaTemple2.png'), width: 1224, height: 1000 },
      ]
    },
    { 
      id: 'shani', 
      name: 'Shani Dev', 
      nameHindi: 'शनि देव', 
      icon: require('@/assets/images/AllTemples/Shani Dev/ShaniDevTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Shani Dev/ShaniDevTemple1.png'), width: 841, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shani Dev/ShaniDevTemple2.png'), width: 879, height: 1000 },
        { source: require('@/assets/images/AllTemples/Shani Dev/ShaniDevTemple3.png'), width: 868, height: 1000 },
      ]
    },
    { 
      id: 'surya', 
      name: 'Surya Dev', 
      nameHindi: 'सूर्य देव', 
      icon: require('@/assets/images/AllTemples/Surya Dev/LordSuryaTemple1.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Surya Dev/LordSuryaTemple1.png'), width: 520, height: 1000 },
        { source: require('@/assets/images/AllTemples/Surya Dev/LordSuryaTemple2.png'), width: 794, height: 1000 },
        { source: require('@/assets/images/AllTemples/Surya Dev/LordSuryaTemple3.png'), width: 784, height: 1000 },
      ]
    },
    { 
      id: 'tirupati', 
      name: 'Tirupati Balaji', 
      nameHindi: 'तिरुपति बालाजी', 
      icon: require('@/assets/images/AllTemples/Tirupati Balaji/TirupatiBalajiTemple.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Tirupati Balaji/TirupatiBalajiTemple.png'), width: 667, height: 1000 },
      ]
    },
    { 
      id: 'brihaspati', 
      name: 'Brihaspati Dev', 
      nameHindi: 'बृहस्पति देव', 
      icon: require('@/assets/images/AllTemples/Brihaspati Dev/BrihaspatiTemple.png'), 
      images: [
        { source: require('@/assets/images/AllTemples/Brihaspati Dev/BrihaspatiTemple.png'), width: 656, height: 1000 },
      ]
    },
  ];
  
  // State for selected temple in All Temples mode
  const [selectedAllTemple, setSelectedAllTemple] = useState<string>('ganesh'); // Default to first temple
  
  // State for selected temple in Today's Puja mode
  const [selectedTodaysTemple, setSelectedTodaysTemple] = useState<string>('');
  
  // State to track current image index for each deity
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  
  // Day of the week to deity mapping for Today's Puja
  const dayToDeityMapping: {[key: string]: string[]} = {
    'Sunday': ['surya'],
    'Monday': ['shiv'],
    'Tuesday': ['durga', 'hanuman'], // Note: Kartikeya not in our data, using available deities
    'Wednesday': ['ganesh'],
    'Thursday': ['vishnu', 'brihaspati'],
    'Friday': ['lakshmi'], // Note: Santoshi Mata not in our data, using available deities
    'Saturday': ['shani']
  };
  
  // Function to get current day of the week
  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  
  // Function to get temples for today's puja
  const getTodaysPujaTemples = () => {
    const currentDay = getCurrentDay();
    const todaysDeityIds = dayToDeityMapping[currentDay] || [];
    return allTemplesData.filter(temple => todaysDeityIds.includes(temple.id));
  };
  
  // Function to get image dimensions from hardcoded data
  const getImageDimensions = (templeId: string, imageIndex: number) => {
    const temple = allTemplesData.find(t => t.id === templeId);
    if (temple && temple.images[imageIndex]) {
      return {
        width: temple.images[imageIndex].width,
        height: temple.images[imageIndex].height
      };
    }
    return { width: 400, height: 600 }; // Fallback
  };
  
  // Function to switch to next/previous image with looping
  const switchImage = (direction: 'up' | 'down') => {
    let selectedTempleId: string;
    let selectedTemple: any;
    
    if (currentScreen === 'allTemples') {
      selectedTempleId = selectedAllTemple;
      selectedTemple = allTemplesData.find(t => t.id === selectedAllTemple);
    } else if (currentScreen === 'todaysPuja') {
      selectedTempleId = selectedTodaysTemple;
      const todaysTemples = getTodaysPujaTemples();
      selectedTemple = todaysTemples.find(t => t.id === selectedTodaysTemple);
    } else {
      return;
    }
    
    if (!selectedTemple) return;
    
    const currentIndex = currentImageIndex[selectedTempleId] || 0;
    const totalImages = selectedTemple.images.length;
    
    let newIndex: number;
    if (direction === 'up') {
      // Swipe up: next image
      newIndex = (currentIndex + 1) % totalImages;
    } else {
      // Swipe down: previous image
      newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    }
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [selectedTempleId]: newIndex
    }));
  };
  
  // PanResponder for swipe detection
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to vertical swipes with minimum distance
      return Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.dx) < 50;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dy } = gestureState;
      const swipeThreshold = 50;
      
      if (Math.abs(dy) > swipeThreshold) {
        if (dy < 0) {
          // Swipe up (negative dy)
          switchImage('up');
        } else {
          // Swipe down (positive dy)
          switchImage('down');
        }
      }
    },
  });
  
  // Function to calculate optimal image size and position
  const calculateImageDimensions = (imageWidth: number, imageHeight: number, imageName: string) => {
    const maxWidth = screenWidth * 0.98; // 98% of screen width
    const maxHeight = screenHeight * 0.45; // 45% of screen height
    
    // Calculate scale factor based on height (45% of screen height)
    const heightScale = maxHeight / imageHeight;
    
    // Calculate what the width would be with this scale
    const scaledWidth = imageWidth * heightScale;
    
    let finalWidth: number;
    let finalHeight: number;
    
    if (scaledWidth <= maxWidth) {
      // Use height-based scaling
      finalWidth = scaledWidth;
      finalHeight = maxHeight;
    } else {
      // Use width-based scaling
      const widthScale = maxWidth / imageWidth;
      finalWidth = maxWidth;
      finalHeight = imageHeight * widthScale;
    }
    
    // Calculate position: (76% of screenHeight) - ImageHeight
    const topPosition = (screenHeight * 0.76) - finalHeight;
    
    return {
      width: finalWidth,
      height: finalHeight,
      top: topPosition,
    };
  };
  
  // State management for temple configuration
  const [modal, setModal] = useState<null | 'temple' | 'deities' | 'background' | 'statues'>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [bgGradient, setBgGradient] = useState(gradientPresets[0]);
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({}); // deityId -> statueUrl
  const [deityError, setDeityError] = useState('');

  // Start flashing animation when no deities are selected in My Temple mode
  useEffect(() => {
    if (currentScreen === 'myTemple' && Object.keys(selectedDeities).length === 0) {
      const flashAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      flashAnimation.start();
      
      return () => {
        flashAnimation.stop();
      };
    } else {
      // Reset animation when deities are selected or not in My Temple mode
      flashAnim.setValue(1);
    }
  }, [currentScreen, selectedDeities, flashAnim]);

  const [deityData, setDeityData] = useState<DeityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(true);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [selectedDeityForStatues, setSelectedDeityForStatues] = useState<DeityData | null>(null);
  const [templeDimensions, setTempleDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  // State management: always in puja mode now
  const [templeState] = useState<'puja'>('puja');

  // Flower offering state (aligned with Daily Puja Custom Template)
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [flowers, setFlowers] = useState<Array<{
    id: string;
    type: string;
    x: number;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rotation: number;
    baseY?: number;
    fadeStart?: number;
    fadeEnd?: number;
  }>>([]);
  const flowerIdCounter = useRef(0);

  // Aarti state
  const [showAartiModal, setShowAartiModal] = useState(false);
  const [thaliImageLoaded, setThaliImageLoaded] = useState(false);

  // Music state
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [selectedMusicFilter, setSelectedMusicFilter] = useState('All');
  const [musicFiles, setMusicFiles] = useState<any[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingMusicId, setLoadingMusicId] = useState<string | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Configure audio session for background playback
  useEffect(() => {
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
      }
    };

    configureAudioSession();
  }, []);

  // Handle app state changes for background audio
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Resume audio if it was playing before going to background
        if (sound && currentlyPlaying) {
          sound.playAsync().catch(error => {
          });
        }
      }
      // Audio will continue playing in background due to staysActiveInBackground: true
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, currentlyPlaying]);

  const generateUniqueFlowerId = () => {
    flowerIdCounter.current += 1;
    return `flower_${Date.now()}_${flowerIdCounter.current}`;
  };

  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  // Aarti functions
  const handleAarti = () => {
    setShowAartiModal(true);
    
    // Award mudras for doing aarti (only once per day) - run in parallel
    (async () => {
      try {
        const hasEarnedToday = await hasEarnedDailyMudras('DO_AARTI');
        if (!hasEarnedToday) {
          const mudraResult = await awardMudras('DO_AARTI');
          if (mudraResult.success) {
            // Mudras awarded successfully for aarti
          }
        }
      } catch (error) {
        // Error awarding mudras - continue with aarti
      }
    })();
  };

  const handleCloseAartiModal = () => {
    setShowAartiModal(false);
  };

  // Music functions
  const fetchMusicFiles = async () => {
    try {
      setMusicLoading(true);
      const url = getEndpointUrl('MEDIA_FILES');
      
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Filter for audio files based on Classification or Type
        const audioFiles = data.filter((file: any) => {
          // Check if it's an audio file based on Classification or Type
          const isAudio = file.Classification?.toLowerCase() === 'audio' || 
                         file.Type?.toLowerCase().includes('audio') ||
                         file.MediaType?.toLowerCase() === 'mp3';
          
          return isAudio;
        });
        
        setMusicFiles(audioFiles);
      } else {
        setMusicFiles([]);
      }
    } catch (error) {
      setMusicFiles([]);
    } finally {
      setMusicLoading(false);
    }
  };

  const extractMusicMetadata = (file: any) => {
    return {
      title: file.VideoName || 'Untitled',
      category: file.Type || file.Classification || 'Music',
      duration: file.Duration || '--:--',
      deity: file.Deity || '',
      language: file.Language || '',
      artists: file.Artists || '',
      link: file.Link || ''
    };
  };

  const playMusicFile = async (file: any) => {
    try {
      // Validate file object
      if (!file || !file.avld) {
        return;
      }

      setLoadingMusicId(file.avld);
      const metadata = extractMusicMetadata(file);
      
      // Stop current music if playing
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch (error) {
        }
      }

      // Use the Link field from the API response (contains S3 filename)
      if (!metadata.link) {
        setLoadingMusicId(null);
        return;
      }

      // Get presigned URL from backend API (same as audio-video screen)
      const apiUrl = getEndpointUrl('S3_AUDIO_URL');
      
      const response = await fetch(`${apiUrl}?filename=${encodeURIComponent(metadata.link)}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get presigned URL from API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.presignedUrl) {
        throw new Error(`Invalid API response: ${JSON.stringify(responseData)}`);
      }
      
      const presignedUrl = responseData.presignedUrl;

      // Load and play the music using the presigned URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: presignedUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setCurrentlyPlaying(file.avld);
      setLoadingMusicId(null);

      // Set up auto-play next song when current ends (using proper completion detection)
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Song naturally finished, playing next...
          // Use safeSetState to avoid useInsertionEffect warnings
          safeSetState(() => {
            if (autoPlayEnabled) {
              playNextSong();
            } else {
              setCurrentlyPlaying(null);
              setSound(null);
            }
          });
        }
      });

    } catch (error) {
      
      // Don't show alert for background music restart attempts
      if (!file.avld.includes('background')) {
        Alert.alert(getTranslation(translations.errorPlayingMusic), getTranslation(translations.failedToPlayMusic));
      }
      
      setLoadingMusicId(null);
    }
  };

  const stopCurrentMusic = async () => {
    try {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch (error) {
        }
      }
      setSound(null);
      setCurrentlyPlaying(null);
    } catch (error) {
    }
  };

  const playNextSong = async () => {
    if (currentPlaylist.length === 0) return;
    
    const nextIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
    setCurrentPlaylistIndex(nextIndex);
    
    const nextSong = currentPlaylist[nextIndex];
    if (nextSong) {
      await playMusicFile(nextSong);
    }
  };

  const handleMusic = async () => {
    setShowMusicModal(true);
    // Fetch music files when modal opens
    fetchMusicFiles();
    
    // Award mudras for listening to audio/video (only once per day) - run in parallel
    (async () => {
      try {
        const hasEarnedToday = await hasEarnedDailyMudras('LISTEN_AUDIO_VIDEO');
        if (!hasEarnedToday) {
          const mudraResult = await awardMudras('LISTEN_AUDIO_VIDEO');
          if (mudraResult.success) {
            // Mudras awarded successfully for listening to music
          }
        }
      } catch (error) {
        // Error awarding mudras - continue with music
      }
    })();
  };

  const dropFlowers = async (flowerType: string = 'hibiscus') => {
    if (isFlowerAnimationRunning) return;
    setShowFlowerModal(false);
    setIsFlowerAnimationRunning(true);

    // Start mudra awarding in parallel (don't wait for it)
    (async () => {
      try {
        const hasEarnedToday = await hasEarnedDailyMudras('OFFER_FLOWERS');
        if (!hasEarnedToday) {
          const mudraResult = await awardMudras('OFFER_FLOWERS');
          if (mudraResult.success) {
            // Mudras awarded successfully
          }
        }
      } catch (error) {
        // Error awarding mudras - continue with animation
      }
    })();

    const rows = 5;
    const itemsPerRow = 12;
    const rowDelayMs = 200;
    const edgeClamp = 30; // keep flowers slightly inside the edges

    // Define available flower types for mixing
    const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'sunflower', 'marigold', 'belPatra', 'jasmine', 'yellowShevanthi', 'whiteShevanthi', 'redShevanthi', 'tulsi', 'rajnigandha', 'parajita', 'datura'];

    const makeFlowerAt = (xPos: number) => {
      const id = generateUniqueFlowerId();
      const baseY = 100 + (Math.random() - 0.5) * 40;
      const fadeStart = screenHeight * 0.65;
      const fadeEnd = screenHeight * 0.78;
      
      // If flowerType is 'mix', randomly select from available flower types
      const actualFlowerType = flowerType === 'mix' 
        ? flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
        : flowerType;
      
      return {
        id,
        type: actualFlowerType,
        x: xPos,
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.6 + Math.random() * 0.3),
        rotation: Math.random() * 360,
        baseY,
        fadeStart,
        fadeEnd,
      };
    };

    for (let row = 0; row < rows; row++) {
      const batchRow: typeof flowers = [];
      for (let i = 0; i < itemsPerRow; i++) {
        const baseX = (screenWidth * i) / (itemsPerRow - 1);
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px
        const xPos = Math.max(edgeClamp, Math.min(screenWidth - edgeClamp, baseX + randomOffset));
        batchRow.push(makeFlowerAt(xPos));
      }
      setFlowers(prev => [...prev, ...batchRow]);

      batchRow.forEach((f) => {
        setTimeout(() => {
          const duration = 3000 + Math.random() * 1000 + row * 500; // natural stagger like 3D temple
          Animated.parallel([
            Animated.timing(f.y, {
              toValue: (screenHeight * 0.78) - (f.baseY || 200),
              duration: duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            // Fade from 65% to 78% of screen height
            Animated.timing(f.opacity, {
              toValue: 0,
              duration: Math.max(200, duration * ((screenHeight * 0.78 - (f.fadeStart || screenHeight * 0.65)) / ((screenHeight * 0.78) - (f.baseY || 200)))) ,
              delay: Math.max(0, duration * (((f.fadeStart || screenHeight * 0.65) - (f.baseY || 200)) / ((screenHeight * 0.78) - (f.baseY || 200)))),
              useNativeDriver: true,
            }),
            Animated.timing(f.scale, {
              toValue: 1,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setFlowers(prev => prev.filter(x => x.id !== f.id));
          });
        }, row * rowDelayMs);
      });
    }

    const totalDuration = (3000 + 1000 + (rows - 1) * 500) + (rows - 1) * rowDelayMs + 300;
    setTimeout(() => {
      setIsFlowerAnimationRunning(false);
    }, totalDuration);
  };
  
  // Wizard state management
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDeityForEdit, setSelectedDeityForEdit] = useState<string | null>(null);
  const [showDeityDropdown, setShowDeityDropdown] = useState(false);
  
  // Deity editing state
  const [deityPositions, setDeityPositions] = useState<{[deityId: string]: {x: number, y: number}}>({});
  const [deitySizes, setDeitySizes] = useState<{[deityId: string]: {width: number, height: number}}>({});
  const [deityDragOffsets, setDeityDragOffsets] = useState<{[deityId: string]: {dx: number, dy: number}}>({});
  const gestureStateRef = useRef<{ [deityId: string]: { startX: number; startY: number; startWidth: number; startHeight: number; initialDistance?: number; } }>({});

  // Auto-save on navigation events
  useEffect(() => {
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      autoSaveTempleConfig();
      return false; // Let the default back behavior continue
    });

    return () => {
      backHandler.remove();
    };
  }, [selectedStyle, bgGradient, selectedDeities, deityPositions, deitySizes]);

  // Auto-save when temple configuration changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSaveTempleConfig();
    }, 2000); // Auto-save 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [selectedStyle, bgGradient, selectedDeities, deityPositions, deitySizes]);

  // Auto-save when user navigates away from the screen
  useFocusEffect(
    React.useCallback(() => {
      // This runs when the screen comes into focus
      return () => {
        // This runs when the screen loses focus (user navigates away)
        autoSaveTempleConfig();
      };
    }, [selectedStyle, bgGradient, selectedDeities, deityPositions, deitySizes])
  );
  const deityAnimPosRef = useRef<{ [deityId: string]: Animated.ValueXY }>({});

  const getDeityAnim = (deityId: string, initialX: number, initialY: number) => {
    if (!deityAnimPosRef.current[deityId]) {
      deityAnimPosRef.current[deityId] = new Animated.ValueXY({ x: initialX, y: initialY });
    }
    return deityAnimPosRef.current[deityId];
  };
  
  // Continuous press state
  const [isPressing, setIsPressing] = useState<{
    sizeIncrease: boolean;
    sizeDecrease: boolean;
    positionLeft: boolean;
    positionRight: boolean;
    positionUp: boolean;
    positionDown: boolean;
  }>({
    sizeIncrease: false,
    sizeDecrease: false,
    positionLeft: false,
    positionRight: false,
    positionUp: false,
    positionDown: false,
  });
  
  // Debug modal state changes
  // Removed empty useEffect hooks that were causing useInsertionEffect warnings
  
  // Save temple configuration
  const saveTempleConfig = async () => {
    try {
      const templeConfig = {
        selectedStyle,
        bgGradient,
        selectedDeities,
        deityPositions,
        deitySizes
      };
      
      const success = await saveTempleConfigurationNewStyle(templeConfig);
      if (success) {
        // Show success message
        setShowSaveMessage(true);
        // Hide message after 2 seconds
        setTimeout(() => {
          setShowSaveMessage(false);
        }, 2000);
      } else {
      }
    } catch (error) {
    }
  };

  // Auto-save function (silent save without UI feedback)
  const autoSaveTempleConfig = async () => {
    try {
      const templeConfig = {
        selectedStyle,
        bgGradient,
        selectedDeities,
        deityPositions,
        deitySizes
      };
      
      await saveTempleConfigurationNewStyle(templeConfig);
      console.log('🔄 Auto-saved temple configuration');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };

  // Reset wizard step
  React.useEffect(() => {
      setWizardStep(1);
  }, []);

  // Mark that user has visited daily puja when they open test temple
  React.useEffect(() => {
    const markVisit = async () => {
      try {
        await markDailyPujaVisited();
      } catch (error) {
        console.error('Error marking daily puja visit:', error);
      }
    };
    markVisit();
  }, []);
  
  // Flashing animation state
  const [isFlashing, setIsFlashing] = useState(false);
  const topBellsSwing = useRef(new Animated.Value(0)).current;
  const bottomBellsSwing = useRef(new Animated.Value(0)).current;
  const [isBellAnimationRunning, setIsBellAnimationRunning] = useState(false);
  const bellSoundRef = useRef<Audio.Sound | null>(null);
  const conchSoundRef = useRef<Audio.Sound | null>(null);
  const [isBellSoundPlaying, setIsBellSoundPlaying] = useState(false);
  const [isConchPlaying, setIsConchPlaying] = useState(false);

  // Perform Puja state
  const [isPujaRitualActive, setIsPujaRitualActive] = useState(false);
  const [thaliEllipseAnimation] = useState(new Animated.Value(0));
  const flowerIntervalRef = useRef<any>(null);

  const isPujaTemporarilyDisabled = isFlowerAnimationRunning || isBellAnimationRunning || isBellSoundPlaying || isConchPlaying;

  const preloadBellSound = React.useCallback(async () => {
    try {
      if (!bellSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/TempleBell.mp3'));
        bellSoundRef.current = sound;
      }
    } catch (error) {
    }
  }, []);

  const preloadConchSound = React.useCallback(async () => {
    try {
      if (!conchSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/conch.mp3'));
        conchSoundRef.current = sound;
      }
    } catch (error) {
    }
  }, []);

  React.useEffect(() => {
    preloadBellSound();
    preloadConchSound();
    return () => {
      try { bellSoundRef.current?.unloadAsync(); } catch {}
      try { conchSoundRef.current?.unloadAsync(); } catch {}
    };
  }, [preloadBellSound, preloadConchSound]);


  const playConch = async () => {
    try {
      if (!conchSoundRef.current) {
        await preloadConchSound();
      }
      setIsConchPlaying(true);
      await conchSoundRef.current?.replayAsync();
      // Optional: stop after 4s similar to bell (or let it play through)
      setTimeout(async () => { try { await conchSoundRef.current?.stopAsync(); } catch {} finally { setIsConchPlaying(false); } }, 4000);
      
      // Award mudras for playing shankh (only once per day) - run in parallel
      (async () => {
        try {
          const hasEarnedToday = await hasEarnedDailyMudras('PLAY_SHANKH');
          if (!hasEarnedToday) {
            const mudraResult = await awardMudras('PLAY_SHANKH');
            if (mudraResult.success) {
              // Mudras awarded successfully for shankh
            }
          }
        } catch (error) {
          // Error awarding mudras - continue with shankh
        }
      })();
    } catch (e) {
      console.warn('Conch sound failed', e);
      setIsConchPlaying(false);
    }
  };

  const triggerBells = async () => {
    if (isBellAnimationRunning) return;
    setIsBellAnimationRunning(true);
    
    // Award mudras for ringing bell (only once per day) - run in parallel
    (async () => {
      try {
        const hasEarnedToday = await hasEarnedDailyMudras('RING_BELL');
        if (!hasEarnedToday) {
          const mudraResult = await awardMudras('RING_BELL');
          if (mudraResult.success) {
            // Mudras awarded successfully for bell
          }
        }
      } catch (error) {
        // Error awarding mudras - continue with bell
      }
    })();
    
    try {
      // Play bell from beginning, cap playback to 4s
      if (bellSoundRef.current) {
        try { await bellSoundRef.current.stopAsync(); } catch {}
        setIsBellSoundPlaying(true);
        await bellSoundRef.current.replayAsync();
        setTimeout(async () => { try { await bellSoundRef.current?.stopAsync(); } catch {} finally { setIsBellSoundPlaying(false); } }, 4000);
      }

      // Reset swings
      topBellsSwing.setValue(0);
      bottomBellsSwing.setValue(0);

      // First swing sequence (approx like 3D Ganesha)
      Animated.timing(topBellsSwing, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start(() => {
        Animated.timing(topBellsSwing, { toValue: -1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start(() => {
          Animated.timing(topBellsSwing, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
        });
      });
      setTimeout(() => {
        Animated.timing(bottomBellsSwing, { toValue: -1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start(() => {
          Animated.timing(bottomBellsSwing, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start(() => {
            Animated.timing(bottomBellsSwing, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
          });
        });
      }, 150);

      // Finish
      setTimeout(() => setIsBellAnimationRunning(false), 1200);
    } catch (e) {
      setIsBellAnimationRunning(false);
    }
  };

  // Stop puja ritual function
  const stopPujaRitual = async () => {
    if (!isPujaRitualActive) return;
    
    
    // Stop all animations and intervals
    if (flowerIntervalRef.current) {
      clearInterval(flowerIntervalRef.current);
      flowerIntervalRef.current = null;
    }
    
    // Reset thali animation to starting position
    thaliEllipseAnimation.setValue(0);
    
    // Immediately stop all flower animations and clear them
    setFlowers(prev => {
      // Stop all running animations for existing flowers
      prev.forEach(flower => {
        flower.y.stopAnimation();
        flower.opacity.stopAnimation();
        flower.scale.stopAnimation();
      });
      return []; // Clear all flowers immediately
    });
    
    // Close modal immediately
    setIsPujaRitualActive(false);
    
    // Mark daily puja as completed when manually stopped
    try {
      await markDailyPujaCompleted();
    } catch (error) {
    }
  };

  // Perform Puja Ritual with elliptical thali motion
  const performPujaRitual = async () => {
    if (isPujaRitualActive) return; // Prevent multiple simultaneous rituals
    
    setIsPujaRitualActive(true);
    
    try {
      // Reset animation
      thaliEllipseAnimation.setValue(0);
      
      // Clear any existing flowers
      setFlowers([]);
      
      // Reset bell positions
      topBellsSwing.setValue(0);
      bottomBellsSwing.setValue(0);
      
      // Clear any existing flower interval
      if (flowerIntervalRef.current) {
        clearInterval(flowerIntervalRef.current);
        flowerIntervalRef.current = null;
      }
      
      // THREAD 1: Thali Elliptical Motion (30 seconds)
      const startThaliMotion = () => {
        const animation = Animated.timing(thaliEllipseAnimation, {
          toValue: 5, // 5 complete orbits
          duration: 30000, // 30 seconds
          useNativeDriver: true,
        });
        
        animation.start(async ({ finished }) => {
          
          // Stop flower dropping when thali motion completes
          if (flowerIntervalRef.current) {
            clearInterval(flowerIntervalRef.current);
            flowerIntervalRef.current = null;
          }
          
          // Immediately stop all flower animations and clear them
          setFlowers(prev => {
            // Stop all running animations for existing flowers
            prev.forEach(flower => {
              flower.y.stopAnimation();
              flower.opacity.stopAnimation();
              flower.scale.stopAnimation();
            });
            return []; // Clear all flowers immediately
          });
          
          // Close modal immediately
          setIsPujaRitualActive(false);
          
          // Mark daily puja as completed
          try {
            await markDailyPujaCompleted();
          } catch (error) {
          }
        });
      };
      
      // THREAD 2: Continuous Flower Dropping (stops when thali completes)
      const startFlowerDropping = () => {
        const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'sunflower', 'marigold', 'belPatra', 'jasmine', 'yellowShevanthi', 'whiteShevanthi', 'redShevanthi', 'tulsi', 'rajnigandha', 'parajita', 'datura'];
        
        const createFlowerBatch = () => {
          // Use same effect as mix flower dropping - create staggered rows
          const rows = 2; // Reduced rows for continuous flow
          const itemsPerRow = 8; // 8 flowers per row
          const rowDelayMs = 100; // Faster row delay for continuous flow
          const edgeClamp = 30; // Keep flowers slightly inside edges

          const makeFlowerAt = (xPos: number) => {
            const id = `mixed-${Date.now()}-${Math.random()}`;
            const baseY = 100 + (Math.random() - 0.5) * 40;
            const fadeStart = screenHeight * 0.65;
            const fadeEnd = screenHeight * 0.78;
            
            // Randomly select flower type (same as mix flowers)
            const randomType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            
            return {
              id,
              type: randomType,
              x: xPos,
              y: new Animated.Value(0),
              opacity: new Animated.Value(1),
              scale: new Animated.Value(0.6 + Math.random() * 0.3), // Same scale as mix flowers
              rotation: Math.random() * 360,
              baseY,
              fadeStart,
              fadeEnd,
            };
          };

          for (let row = 0; row < rows; row++) {
            const batchRow: typeof flowers = [];
            for (let i = 0; i < itemsPerRow; i++) {
              const baseX = (screenWidth * i) / (itemsPerRow - 1);
              const randomOffset = (Math.random() - 0.5) * 60; // ±30px
              const xPos = Math.max(edgeClamp, Math.min(screenWidth - edgeClamp, baseX + randomOffset));
              batchRow.push(makeFlowerAt(xPos));
            }
            setFlowers(prev => [...prev, ...batchRow]);

            batchRow.forEach((f) => {
              setTimeout(() => {
                const duration = 3000 + Math.random() * 1000 + row * 500; // Same timing as mix flowers
                Animated.parallel([
                  Animated.timing(f.y, {
                    toValue: (screenHeight * 0.78) - (f.baseY || 200),
                    duration: duration,
                    easing: Easing.out(Easing.cubic), // Same easing as mix flowers
                    useNativeDriver: true,
                  }),
                  // Fade from 65% to 78% of screen height (same as mix flowers)
                  Animated.timing(f.opacity, {
                    toValue: 0,
                    duration: Math.max(200, duration * ((screenHeight * 0.78 - (f.fadeStart || screenHeight * 0.65)) / ((screenHeight * 0.78) - (f.baseY || 200)))) ,
                    delay: Math.max(0, duration * (((f.fadeStart || screenHeight * 0.65) - (f.baseY || 200)) / ((screenHeight * 0.78) - (f.baseY || 200)))),
                    useNativeDriver: true,
                  }),
                  Animated.timing(f.scale, {
                    toValue: 1,
                    duration: 1400, // Same scale animation as mix flowers
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  setFlowers(prev => prev.filter(x => x.id !== f.id));
                });
              }, row * rowDelayMs);
            });
          }
        };
        
        // Start continuous flower dropping every 200ms
        flowerIntervalRef.current = setInterval(createFlowerBatch, 200);
        
        return flowerIntervalRef.current;
      };
      
      // Start both threads - flowers will stop when thali completes
      startThaliMotion();
      startFlowerDropping();
      
    } catch (error) {
      setIsPujaRitualActive(false);
    }
  };
  
  // Flash animation for current step icon
  React.useEffect(() => {
      // Only start flashing if wizardStep is valid
      if (wizardStep < 1 || wizardStep > 4) return;
      
      const interval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
  }, [wizardStep]);
  
  // Initialize deity positions and sizes when NEW deities are selected
  React.useEffect(() => {
    // Skip if no deities are selected or if this is the initial render
    if (Object.keys(selectedDeities).length === 0) return;
    
    const newPositions: {[deityId: string]: {x: number, y: number}} = {...deityPositions};
    const newSizes: {[deityId: string]: {width: number, height: number}} = {...deitySizes};
    
    let hasNewDeities = false;
    
    Object.entries(selectedDeities).forEach(([deityId, statueUrl], index) => {
      // Only initialize if this deity doesn't already have position/size data
      if (!deityPositions[deityId] || !deitySizes[deityId]) {
        hasNewDeities = true;
        
        // Calculate initial position: 10%, 40%, 70% from left
        const leftPositions = [0.1, 0.4, 0.7];
        const leftPosition = leftPositions[index] || 0.1;
        
        // Initial size: 30% screen width
        const initialImageWidth = screenWidth * 0.3;
        const initialImageHeight = initialImageWidth * 1.2;
        
        // Vertical position: 70% screen height - calculated image height
        const initialTopPosition = (screenHeight * 0.7) - initialImageHeight;
        
        newPositions[deityId] = {
          x: screenWidth * leftPosition,
          y: initialTopPosition
        };
        
        newSizes[deityId] = {
          width: initialImageWidth,
          height: initialImageHeight
        };
      }
    });
    
    // Only update state if there are new deities to initialize
    if (hasNewDeities) {
      // Use safeSetState to defer the state update to avoid insertion effect issues
      safeSetState(() => {
      setDeityPositions(newPositions);
      setDeitySizes(newSizes);
      });
    }
  }, [selectedDeities]);
  
  // Control functions
  const handleSizeChange = (direction: 'increase' | 'decrease') => {
    if (!selectedDeityForEdit) return;
    
    const currentSize = deitySizes[selectedDeityForEdit] || { width: screenWidth * 0.3, height: screenWidth * 0.36 };
    const scaleFactor = direction === 'increase' ? 1.05 : 0.95; // 5% change
    
    const newWidth = currentSize.width * scaleFactor;
    const newHeight = currentSize.height * scaleFactor;
    
    setDeitySizes(prev => ({
      ...prev,
      [selectedDeityForEdit]: { width: newWidth, height: newHeight }
    }));
  };
  
  const handlePositionChange = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!selectedDeityForEdit) return;
    
    const currentPosition = deityPositions[selectedDeityForEdit] || { x: screenWidth * 0.1, y: screenHeight * 0.7 };
    const moveAmount = 5; // 5 pixels
    
    let newX = currentPosition.x;
    let newY = currentPosition.y;
    
    switch (direction) {
      case 'left':
        newX = Math.max(0, currentPosition.x - moveAmount);
        break;
      case 'right':
        newX = Math.min(screenWidth - (deitySizes[selectedDeityForEdit]?.width || screenWidth * 0.3), currentPosition.x + moveAmount);
        break;
      case 'up':
        newY = Math.max(0, currentPosition.y - moveAmount);
        break;
      case 'down':
        newY = Math.min(screenHeight - (deitySizes[selectedDeityForEdit]?.height || screenWidth * 0.36), currentPosition.y + moveAmount);
        break;
    }
    
    setDeityPositions(prev => ({
      ...prev,
      [selectedDeityForEdit]: { x: newX, y: newY }
    }));
  };
  
  // Continuous press handlers
  const startContinuousPress = (action: keyof typeof isPressing) => {
    if (!selectedDeityForEdit) return;
    
    setIsPressing(prev => ({ ...prev, [action]: true }));
  };
  
  const stopContinuousPress = (action: keyof typeof isPressing) => {
    setIsPressing(prev => ({ ...prev, [action]: false }));
  };
  
  // Continuous press effect
  React.useEffect(() => {
    if (!selectedDeityForEdit) return;
    
    const interval = setInterval(() => {
      if (isPressing.sizeIncrease) {
        handleSizeChange('increase');
      }
      if (isPressing.sizeDecrease) {
        handleSizeChange('decrease');
      }
      if (isPressing.positionLeft) {
        handlePositionChange('left');
      }
      if (isPressing.positionRight) {
        handlePositionChange('right');
      }
      if (isPressing.positionUp) {
        handlePositionChange('up');
      }
      if (isPressing.positionDown) {
        handlePositionChange('down');
      }
    }, 100); // 100ms interval for smooth continuous action
    
    return () => clearInterval(interval);
  }, [isPressing, selectedDeityForEdit, deitySizes, deityPositions]);


  // Load temple configuration on component mount
  useEffect(() => {
    const loadTempleConfig = async () => {
      try {
        setBackgroundLoading(true);
        const templeConfig = await loadTempleConfigurationNewStyle();
        
        if (templeConfig) {
          // Check if templeConfig has templeInformation field (from database)
          const configData = templeConfig.templeInformation || templeConfig;
          
          // Load temple style
          if (configData.selectedStyle) {
            setSelectedStyle(configData.selectedStyle);
          }
          
          // Load background gradient
          if (configData.bgGradient) {
            setBgGradient(configData.bgGradient);
          }
          
          // Load selected deities
          if (configData.selectedDeities) {
            setSelectedDeities(configData.selectedDeities);
          }
          
          // Load deity positions and sizes
          if (configData.deityPositions) {
            setDeityPositions(configData.deityPositions);
          }
          if (configData.deitySizes) {
            setDeitySizes(configData.deitySizes);
          }
        }
      } catch (error) {
      } finally {
        setBackgroundLoading(false);
      }
    };

    loadTempleConfig();
  }, []);

  // Fetch deity data from MongoDB
  useEffect(() => {
    const fetchDeityData = async () => {
      try {
        const res = await axios.get(getEndpointUrl('DEITY_STATUES'), {
          headers: getAuthHeaders()
        });
        setDeityData(res.data);
      } catch (e: any) {
        Alert.alert(
          'Failed to fetch deity data', 
          `Error: ${e.response?.data?.error || e.message || 'Unknown error'}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDeityData();
  }, []);

  // Load temple image dimensions
  useEffect(() => {
    const loadTempleDimensions = async () => {
      const dimensions: {[key: string]: {width: number, height: number}} = {};
      
      for (const temple of templeStyles) {
        try {
          const dims = await getTempleImageDimensions(temple.id);
          dimensions[temple.id] = dims;
          
        } catch (error) {
        }
      }
      
      setTempleDimensions(dimensions);
    };
    
    loadTempleDimensions();
  }, []);

  // Set default selected temple for Today's Puja mode
  useEffect(() => {
    if (currentScreen === 'todaysPuja') {
      const todaysTemples = getTodaysPujaTemples();
      if (todaysTemples.length > 0 && !selectedTodaysTemple) {
        setSelectedTodaysTemple(todaysTemples[0].id);
      }
    }
  }, [currentScreen, selectedTodaysTemple]);
  

  return (
    <View style={styles.container}>
      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={bgGradient as any}
        style={styles.purpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Loading Indicator */}
      {backgroundLoading && (
        <View style={styles.backgroundLoadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.backgroundLoadingText}>
            {getTranslation(translations.loadingBackground)}
          </Text>
        </View>
      )}
      
      {/* Save Success Message */}
      {showSaveMessage && (
        <View style={styles.saveMessageContainer}>
          <Text style={styles.saveMessageText}>{getTranslation(translations.templeSaved)}</Text>
        </View>
      )}
      
      {/* Arch on top */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 220 }}>
      <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
      </View>
      
      {/* All Temples View - Show when in All Temples mode */}
      {currentScreen === 'allTemples' && (
        <View style={styles.allTemplesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.allTemplesScrollContent}
          >
            {allTemplesData.map((temple, index) => (
              <View key={temple.id} style={styles.allTemplesIconWrapper}>
                <TouchableOpacity 
                  style={styles.allTemplesIcon}
                  onPress={() => {
                    setSelectedAllTemple(temple.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={temple.icon}
                    style={styles.allTemplesIconImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.allTemplesIconLabel} numberOfLines={2}>
                  {isHindi ? temple.nameHindi : temple.name}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Current Deity Name */}
          <View style={styles.currentDeityNameContainer}>
            <Text style={styles.currentDeityName}>
              {(() => {
                const selectedTemple = allTemplesData.find(t => t.id === selectedAllTemple);
                return selectedTemple ? (isHindi ? selectedTemple.nameHindi : selectedTemple.name) : '';
              })()}
            </Text>
          </View>
        </View>
      )}
      
      {/* Today's Puja View - Show when in Today's Puja mode */}
      {currentScreen === 'todaysPuja' && (() => {
        const todaysTemples = getTodaysPujaTemples();
        const currentDay = getCurrentDay();
        
        return (
          <View style={styles.allTemplesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.allTemplesScrollContent}
            >
              {todaysTemples.map((temple, index) => (
                <View key={temple.id} style={styles.allTemplesIconWrapper}>
                  <TouchableOpacity 
                    style={styles.allTemplesIcon}
                    onPress={() => {
                      setSelectedTodaysTemple(temple.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={temple.icon}
                      style={styles.allTemplesIconImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.allTemplesIconLabel} numberOfLines={2}>
                    {isHindi ? temple.nameHindi : temple.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            {/* Current Day and Deity Name */}
            <View style={styles.currentDeityNameContainer}>
              <Text style={styles.currentDeityName}>
                {isHindi ? `${currentDay} - ` : `${currentDay} - `}
                {(() => {
                  const selectedTemple = todaysTemples.find(t => t.id === selectedTodaysTemple);
                  return selectedTemple ? (isHindi ? selectedTemple.nameHindi : selectedTemple.name) : '';
                })()}
              </Text>
            </View>
          </View>
        );
      })()}
      
      {/* All Temples Temple Display - Show when in All Temples mode */}
      {currentScreen === 'allTemples' && (() => {
        const selectedTemple = allTemplesData.find(t => t.id === selectedAllTemple);
        if (!selectedTemple) return null;
        
        const currentIndex = currentImageIndex[selectedAllTemple] || 0;
        const currentImageData = selectedTemple.images[currentIndex];
        
        if (!currentImageData) {
          return null;
        }
        
        const dimensions = calculateImageDimensions(currentImageData.width, currentImageData.height, selectedTemple.name);
        
        return (
          <View style={styles.allTemplesTempleDisplay} {...panResponder.panHandlers}>
            <Image
              source={currentImageData.source}
              style={[styles.allTemplesTempleImage, {
                width: dimensions.width,
                height: dimensions.height,
                top: dimensions.top,
              }]}
              resizeMode="contain"
            />
          </View>
        );
      })()}
      
      {/* Today's Puja Temple Display - Show when in Today's Puja mode */}
      {currentScreen === 'todaysPuja' && (() => {
        const todaysTemples = getTodaysPujaTemples();
        const selectedTemple = todaysTemples.find(t => t.id === selectedTodaysTemple);
        if (!selectedTemple) return null;
        
        const currentIndex = currentImageIndex[selectedTodaysTemple] || 0;
        const currentImageData = selectedTemple.images[currentIndex];
        
        if (!currentImageData) {
          return null;
        }
        
        const dimensions = calculateImageDimensions(currentImageData.width, currentImageData.height, selectedTemple.name);
        
        return (
          <View style={styles.allTemplesTempleDisplay} {...panResponder.panHandlers}>
            <Image
              source={currentImageData.source}
              style={[styles.allTemplesTempleImage, {
                width: dimensions.width,
                height: dimensions.height,
                top: dimensions.top,
              }]}
              resizeMode="contain"
            />
          </View>
        );
      })()}
      
      {/* Temple Display - Hide when in All Temples or Today's Puja mode */}
      {currentScreen === 'myTemple' && templeDimensions[selectedStyle] && (
        <View pointerEvents="none">
        <Image
          source={templeStyles.find(t => t.id === selectedStyle)?.image}
          style={[styles.templeDisplay, {
            width: screenWidth * 0.95,
            height: (() => {
              const availableScreenWidth = screenWidth * 0.95;
              const imageWidth = templeDimensions[selectedStyle].width;
              const imageHeight = templeDimensions[selectedStyle].height;
              const templeScale = availableScreenWidth / imageWidth;
              return templeScale * imageHeight;
            })(),
            left: '50%',
            transform: [
              { translateX: -screenWidth * 0.475 },
              { translateY: (() => {
                const availableScreenWidth = screenWidth * 0.95;
                const imageWidth = templeDimensions[selectedStyle].width;
                const imageHeight = templeDimensions[selectedStyle].height;
                const templeScale = availableScreenWidth / imageWidth;
                const templeHeight = templeScale * imageHeight;
                return (screenHeight * 0.75) - templeHeight;
                })() }
              ]
          }]}
          resizeMode="stretch"
        />
        </View>
      )}

      {/* No Deity Selected Message - Show when in My Temple mode with no deities */}
      {currentScreen === 'myTemple' && Object.keys(selectedDeities).length === 0 && (
        <View style={styles.noDeityMessageContainer}>
          <Text style={styles.noDeityMessage}>
            {getTranslation(translations.noDeityMessage)}
          </Text>
          <TouchableOpacity 
            style={styles.flashingDeityButton}
            onPress={() => setModal('deities')}
          >
            <Animated.View style={[styles.flashingDeityIcon, {
              opacity: flashAnim
            }]}>
              <MaterialCommunityIcons name="plus-circle" size={40} color="#FF6A00" />
            </Animated.View>
            <Text style={styles.flashingDeityText}>
              {getTranslation(translations.selectDeities)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Selected Deities Display - Move outside screen in Today's Puja and All Temples modes */}
              {Object.entries(selectedDeities).map(([deityId, statueUrl], index) => {
          const deity = deityData.find(d => d._id === deityId);
          if (!deity) return null;

          // Get current position and size from state, or use defaults
          const currentPosition = deityPositions[deityId] || { 
            x: screenWidth * 0.1, 
            y: screenHeight * 0.7 
          };
          
          // Move deities outside screen when in Today's Puja or All Temples modes
          const adjustedPosition = {
            x: currentScreen === 'myTemple' ? currentPosition.x : currentPosition.x + 1000,
            y: currentPosition.y
          };
          
          const currentSize = deitySizes[deityId] || { 
            width: screenWidth * 0.3, 
            height: screenWidth * 0.36 
          };
          const dragOffset = deityDragOffsets[deityId] || { dx: 0, dy: 0 };


          return (
            <Animated.View
              key={deityId}
              style={[styles.selectedDeityImageContainer, {
                position: 'absolute',
                width: currentSize.width,
                height: currentSize.height,
                borderWidth: 0,
                borderColor: 'transparent',
                transform: currentScreen === 'myTemple' ? [
                  { translateX: getDeityAnim(deityId, currentPosition.x, currentPosition.y).x },
                  { translateY: getDeityAnim(deityId, currentPosition.x, currentPosition.y).y },
                ] : [
                  { translateX: adjustedPosition.x },
                  { translateY: adjustedPosition.y },
                ]
              }]}
            >
            <View
              style={{ width: '100%', height: '100%' }}
              {...PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (evt, gs) => gs.numberActiveTouches >= 2 || Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
                onPanResponderGrant: (e) => {
                  const touches = (e.nativeEvent as any).touches || [];
                  gestureStateRef.current[deityId] = {
                    startX: currentPosition.x,
                    startY: currentPosition.y,
                    startWidth: currentSize.width,
                    startHeight: currentSize.height,
                    initialDistance: touches.length >= 2 ? Math.hypot(
                      touches[1].pageX - touches[0].pageX,
                      touches[1].pageY - touches[0].pageY
                    ) : undefined,
                  };
                  setSelectedDeityForEdit(deityId);
                  setDeityDragOffsets(prev => ({ ...prev, [deityId]: { dx: 0, dy: 0 } }));
                },
                onPanResponderMove: (e, gs) => {
                  const ref = gestureStateRef.current[deityId];
                  if (!ref) return;
                  const touches = (e.nativeEvent as any).touches || [];
                  if (touches.length <= 1) {
                    const anim = getDeityAnim(deityId, currentPosition.x, currentPosition.y);
                    anim.setValue({ x: ref.startX + gs.dx, y: ref.startY + gs.dy });
                  }
                  if (touches.length >= 2) {
                    const ref2 = gestureStateRef.current[deityId];
                    if (!ref2.initialDistance) {
                      ref2.initialDistance = Math.hypot(
                        touches[1].pageX - touches[0].pageX,
                        touches[1].pageY - touches[0].pageY
                      );
                      ref2.startWidth = currentSize.width;
                      ref2.startHeight = currentSize.height;
                    }
                    const currentDistance = Math.hypot(
                      touches[1].pageX - touches[0].pageX,
                      touches[1].pageY - touches[0].pageY
                    );
                    const scaleFactor = Math.max(0.5, Math.min(2.0, currentDistance / ref2.initialDistance));
                    const newWidth = Math.max(40, Math.min(screenWidth, ref2.startWidth * scaleFactor));
                    const newHeight = Math.max(40, Math.min(screenHeight, ref2.startHeight * scaleFactor));
                    setDeitySizes(prev => ({ ...prev, [deityId]: { width: newWidth, height: newHeight } }));
                  }
                },
                onPanResponderRelease: (e, gs) => { 
                  const ref = gestureStateRef.current[deityId];
                  if (ref) {
                    const latestSize = deitySizes[deityId] || currentSize;
                    const minX = -latestSize.width * 0.5;
                    const maxX = screenWidth - latestSize.width * 0.5;
                    const minY = -latestSize.height * 0.5;
                    const maxY = screenHeight - latestSize.height * 0.5;
                    const unclampedX = ref.startX + gs.dx;
                    const unclampedY = ref.startY + gs.dy;
                    const finalX = Math.max(minX, Math.min(maxX, unclampedX));
                    const finalY = Math.max(minY, Math.min(maxY, unclampedY));
                    setDeityPositions(prev => ({ ...prev, [deityId]: { x: finalX, y: finalY } }));
                    const anim = getDeityAnim(deityId, currentPosition.x, currentPosition.y);
                    anim.setValue({ x: finalX, y: finalY });
                  }
                  delete gestureStateRef.current[deityId]; 
                },
                onPanResponderTerminate: () => { delete gestureStateRef.current[deityId]; },
              }).panHandlers}
            >
              <Image
                source={getImageSource(statueUrl)}
                style={styles.selectedDeityFullImage}
                resizeMode="contain"
              />
          </View>
          </Animated.View>
        );
      })}
      
      {/* Step 4 Edit Modal for Deities - removed as requested */}
      
      {/* Temple Bells */}
      <Animated.Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={[styles.templeBells, { transform: [
          { translateY: -60 },
          { rotate: topBellsSwing.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg'] }) },
          { translateY: 60 },
        ] }]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={[styles.templeBellsLeft, { transform: [
          { translateY: -60 },
          { rotate: bottomBellsSwing.interpolate({ inputRange: [-1, 0, 1], outputRange: ['15deg', '0deg', '-15deg'] }) },
          { translateY: 60 },
        ] }]}
        resizeMode="contain"
      />
      {/* Flowers falling overlay */}
      {flowers.map((flower) => (
        <Animated.View
          key={flower.id}
          style={{
            position: 'absolute',
            left: flower.x,
            top: (flower.baseY || 200),
            opacity: flower.opacity,
            transform: [
              { translateY: flower.y },
              { rotate: `${flower.rotation}deg` },
              { scale: flower.scale },
            ],
            zIndex: 215,
          }}
        >
          {flower.type === 'redRose' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/rose.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'whiteRose' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/whiterose.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'jasmine' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/jasmine.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'yellowShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/YellowShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'whiteShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'redShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/RedShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'rajnigandha' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/rajnigandha.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'parajita' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/parajita.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'datura' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/Datura.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'tulsi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/tulsi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 24 }}>🌸</Text>
          )}
        </Animated.View>
      ))}
      
      {/* Temple Configuration Controls */}
      {/* Configuration Icons - Hide when in All Temples or Today's Puja mode */}
      {currentScreen === 'myTemple' && (
        <View style={styles.configurationIconsContainer}>
        {/* Temple Style Icon */}
              <View style={styles.configIconWrapper}>
                <TouchableOpacity 
            style={styles.configIcon}
                  onPress={() => setModal('temple')}
            activeOpacity={0.7}
                >
                  <Image 
                    source={require('@/assets/images/temple/Temple1.png')} 
                    style={styles.configIconImage} 
                    resizeMode="contain" 
                  />
                  </TouchableOpacity>
          <Text style={styles.configIconLabel}>{getTranslation(translations.temple)}</Text>
              </View>
          
        {/* Deity Icon */}
              <View style={styles.configIconWrapper}>
                  <TouchableOpacity 
            style={styles.configIcon}
                    onPress={() => setModal('deities')}
            activeOpacity={0.7}
                >
                  <Image 
                    source={require('@/assets/images/temple/Ganesha1.png')} 
                    style={styles.configIconImage} 
                    resizeMode="contain" 
                  />
                  </TouchableOpacity>
          <Text style={styles.configIconLabel}>{getTranslation(translations.deity)}</Text>
              </View>

        {/* Background Icon */}
              <View style={styles.configIconWrapper}>
                  <TouchableOpacity 
            style={styles.configIcon}
                    onPress={() => setModal('background')}
            activeOpacity={0.7}
                >
                  <View style={styles.gradientIconContainer}>
                    <LinearGradient
                      colors={bgGradient as any}
                      style={styles.gradientIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  </View>
                  </TouchableOpacity>
          <Text style={styles.configIconLabel}>{getTranslation(translations.background)}</Text>
              </View>
            
          {/* Save Temple Button */}
        <View style={styles.configIconWrapper}>
                <TouchableOpacity
            style={styles.saveTempleConfigButton}
                onPress={async () => {
                    await saveTempleConfig();
            }}
            activeOpacity={0.7}
          >
            <Image 
              source={require('@/assets/images/icons/otherIcons/SaveIcon.png')} 
              style={styles.saveIconImage} 
              resizeMode="contain" 
            />
              </TouchableOpacity>
          <Text style={styles.saveTempleConfigButtonText}>{getTranslation(translations.save)}</Text>
            </View>
          </View>
      )}
      
      {/* Content */}
      <View style={styles.content}>
        </View>



      {/* Puja Icons - Always visible */}
        <>
          {/* Left Puja Icons Column - Flowers, Aarti, Music */}
          <View style={[styles.leftPujaIconsColumn, isPujaTemporarilyDisabled && { opacity: 0.5 }]} pointerEvents={isPujaTemporarilyDisabled ? 'none' : 'auto'}>
            <TouchableOpacity 
              style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
              disabled={isFlowerAnimationRunning}
              onPress={openFlowerModal}
              activeOpacity={0.7}
            >
              <Image 
                source={require('@/assets/images/icons/own temple/jasmine.png')}
                style={styles.pujaIconImage}
                resizeMode="contain"
              />
            <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">{getTranslation(translations.flowers)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]}
              disabled={isFlowerAnimationRunning}
            onPress={handleAarti}
              activeOpacity={0.7}
            >
              <Image 
                source={require('@/assets/images/icons/own temple/PujaThali1.png')}
                style={styles.pujaIconImage}
                resizeMode="contain"
              />
              <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">{getTranslation(translations.aarti)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pujaIconItem}
              onPress={showAudioVideoModal}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="music-note" 
                size={36} 
                color="#FFFFFF" 
              />
              <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">{getTranslation(translations.music)}</Text>
            </TouchableOpacity>
          </View>

          {/* Right Puja Icons Column - Shankh, Ghanti */}
          <View style={[styles.rightPujaIconsColumn, isPujaTemporarilyDisabled && { opacity: 0.5 }]} pointerEvents={isPujaTemporarilyDisabled ? 'none' : 'auto'}>
            <TouchableOpacity 
              style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
              disabled={isFlowerAnimationRunning}
              onPress={playConch}
              activeOpacity={0.7}
            >
              <Image 
                source={require('@/assets/images/icons/own temple/sankha.png')}
                style={styles.pujaIconImage}
                resizeMode="contain"
              />
              <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">{isHindi ? 'शंख' : 'Shankh'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
              disabled={isFlowerAnimationRunning}
              onPress={triggerBells}
              activeOpacity={0.7}
            >
              <Text style={styles.pujaIcon}>🔔</Text>
              <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">{isHindi ? 'घंटी' : 'Ghanti'}</Text>
            </TouchableOpacity>
          </View>
        </>

      {/* Flower Selection Modal */}
      <Modal
        visible={showFlowerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFlowerModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1, width: '100%' }}
            activeOpacity={1}
            onPress={() => setShowFlowerModal(false)}
          >
            <View style={[styles.flowerModalContent, { top: screenHeight * 0.30, height: screenHeight * 0.30, left: 3 }]}>
              <ScrollView 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.flowerOptions}
              >
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('hibiscus')}>
                  <View style={styles.flowerIconContainer}><Text style={styles.flowerOptionEmoji}>🌺</Text></View>
                  <Text style={styles.flowerOptionLabel}>Hibiscus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('redRose')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/rose.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('whiteRose')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/whiterose.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('jasmine')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/jasmine.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Jasmine</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('yellowShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/YellowShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Yellow Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('whiteShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('redShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/RedShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('tulsi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/tulsi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Tulsi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('rajnigandha')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/rajnigandha.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Rajnigandha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('parajita')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/parajita.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Parajita</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('datura')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/Datura.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Datura</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('mix')}>
                  <View style={styles.flowerIconContainer}><Text style={styles.flowerOptionEmoji}>🌸</Text></View>
                  <Text style={styles.flowerOptionLabel}>Mix Flowers</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Aarti Modal */}
      <Modal
        visible={showAartiModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseAartiModal}
        statusBarTranslucent={true}
      >
        <View style={styles.aartiModalOverlay}>
          <TouchableOpacity 
            style={styles.aartiModalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseAartiModal}
          >
            {!thaliImageLoaded && (
              <View style={styles.thaliLoadingContainer}>
                <ActivityIndicator size="large" color="#FF6A00" />
                <Text style={styles.thaliLoadingText}>{isHindi ? 'आरती थाली लोड हो रही है...' : 'Loading Aarti Thali...'}</Text>
              </View>
            )}
            <DraggableThali onImageLoad={() => setThaliImageLoaded(true)} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Music Modal */}
      <Modal
        visible={showMusicModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowMusicModal(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1, width: '100%' }}
            activeOpacity={1}
            onPress={() => setShowMusicModal(false)}
          >
            <View style={styles.musicModalContent}>
              {/* Header */}
              <View style={styles.musicModalHeader}>
                <Text style={styles.musicModalTitle}>{isHindi ? '🎵 दिव्य संगीत' : '🎵 Divine Music'}</Text>
                <View style={styles.musicModalHeaderButtons}>
                  <TouchableOpacity 
                    style={styles.musicModalCloseButton}
                    onPress={() => {
                      setShowMusicModal(false);
                    }}
                  >
                    <Text style={styles.musicModalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.musicSearchContainer}>
                <TextInput
                  style={styles.musicSearchInput}
                  placeholder={getTranslation(translations.musicSearchPlaceholder)}
                  placeholderTextColor="#999"
                  value={musicSearchQuery}
                  onChangeText={setMusicSearchQuery}
                />
                <MaterialCommunityIcons 
                  name="magnify" 
                  size={20} 
                  color="#666" 
                  style={styles.musicSearchIcon}
                />
              </View>

              {/* Filter Buttons */}
              <View style={styles.musicFilterContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.musicFilterContent}
                >
                  {['All', 'Aarti', 'Bhajan', 'Chalisa', 'Katha', 'Paath / Strotam', 'Famous'].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.musicFilterButton,
                        selectedMusicFilter === filter && styles.musicFilterButtonActive
                      ]}
                      onPress={() => setSelectedMusicFilter(filter)}
                    >
                      <Text style={[
                        styles.musicFilterText,
                        selectedMusicFilter === filter && styles.musicFilterButtonActive
                      ]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Stop Music Button */}
                <TouchableOpacity 
                  style={[
                    styles.stopMusicButton,
                    currentlyPlaying ? styles.stopMusicButtonActive : styles.stopMusicButtonDisabled
                  ]}
                  onPress={stopCurrentMusic}
                  disabled={!currentlyPlaying}
                >
                  <Text style={[
                    styles.stopMusicButtonText,
                    currentlyPlaying ? styles.stopMusicButtonTextActive : styles.stopMusicButtonTextDisabled
                  ]}>{isHindi ? '⏹️ संगीत बंद करें' : '⏹️ Stop Music'}</Text>
                </TouchableOpacity>
              </View>

              {/* Music List */}
              <ScrollView 
                style={styles.musicListContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {musicLoading ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6A00" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
                      {isHindi ? 'संगीत लाइब्रेरी लोड हो रही है...' : 'Loading music library...'}
                    </Text>
                  </View>
                ) : musicFiles.length === 0 ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="music-off" size={48} color="#ccc" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
                      {isHindi ? 'S3 में कोई संगीत फ़ाइल नहीं मिली' : 'No music files found in S3'}
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' }}>
                      {isHindi ? 'कृपया S3 में \'music/\' फ़ोल्डर में संगीत फ़ाइलें अपलोड करें' : 'Please upload music files to the \'music/\' folder in S3'}
                    </Text>
                  </View>
                ) : (
                  // Filter music files based on search and category
                  musicFiles
                    .filter(file => {
                      if (!file) return false;
                      
                      // Apply search filter
                      if (musicSearchQuery.trim()) {
                        const searchLower = musicSearchQuery.toLowerCase();
                        const title = file.VideoName?.toLowerCase() || '';
                        const deity = file.Deity?.toLowerCase() || '';
                        const artists = file.Artists?.toLowerCase() || '';
                        return title.includes(searchLower) || deity.includes(searchLower) || artists.includes(searchLower);
                      }
                      
                      // Apply category filter
                      if (selectedMusicFilter !== 'All') {
                        if (selectedMusicFilter === 'Famous') {
                          return file.famous === true;
                        }
                        return file.Type === selectedMusicFilter;
                      }
                      
                      return true;
                    })
                    .map((file, index) => {
                      const metadata = extractMusicMetadata(file);
                      
                      return (
                        <TouchableOpacity key={file.avld || index} style={styles.musicItem}>
                          <View style={styles.musicItemContent}>
                            <Text style={styles.musicItemTitle}>{metadata.title}</Text>
                            <Text style={styles.musicItemSubtitle}>
                              {metadata.deity ? `${metadata.deity} • ${metadata.category}` : metadata.category}
                            </Text>
                            <Text style={styles.musicItemDuration}>
                              {metadata.duration} {metadata.language ? `• ${metadata.language}` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.musicPlayButton}
                            onPress={async () => {
                              // If this music is already playing, stop it
                              if (currentlyPlaying === file.avld) {
                                await stopCurrentMusic();
                                return;
                              }

                              // Otherwise, play this music
                              // Set up playlist for auto-play functionality
                              const filteredFiles = musicFiles.filter(file => {
                                if (!file) return false;
                                
                                // Apply search filter
                                if (musicSearchQuery.trim()) {
                                  const searchLower = musicSearchQuery.trim().toLowerCase();
                                  const title = file.VideoName?.toLowerCase() || '';
                                  const deity = file.Deity?.toLowerCase() || '';
                                  const artists = file.Artists?.toLowerCase() || '';
                                  return title.includes(searchLower) || deity.includes(searchLower) || artists.includes(searchLower);
                                }
                                
                                // Apply category filter
                                if (selectedMusicFilter !== 'All') {
                                  if (selectedMusicFilter === 'Famous') {
                                    return file.famous === true;
                                  }
                                  return file.Type === selectedMusicFilter;
                                }
                                
                                return true;
                              });
                              
                              setCurrentPlaylist(filteredFiles);
                              setCurrentPlaylistIndex(filteredFiles.findIndex(f => f.avld === file.avld));
                              
                              // Play the selected music file
                              await playMusicFile(file);
                            }}
                          >
                            {loadingMusicId === file.avld ? (
                              <ActivityIndicator size="small" color="#FF6A00" />
                            ) : (
                              <MaterialCommunityIcons 
                                name={currentlyPlaying === file.avld ? "pause-circle" : "play-circle"} 
                                size={32} 
                                color="#FF6A00" 
                              />
                            )}
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Perform Puja Thali Modal */}
      <Modal
        visible={isPujaRitualActive}
        transparent={true}
        animationType="none"
        onRequestClose={stopPujaRitual}
      >
        <TouchableWithoutFeedback onPress={stopPujaRitual}>
          <View style={styles.pujaThaliModalOverlay}>
            <View style={styles.pujaThaliModalOverlayTouchable}>
              {/* Puja Thali with Elliptical Motion */}
              {(() => {
                const ellipseWidth = screenWidth * 0.7; // 70% of screen width
                const ellipseHeight = ellipseWidth * 0.6; // Maintain aspect ratio
                const startY = 1000; // Start at 1000px from top
                const centerX = screenWidth / 2;
                const centerY = startY + ellipseHeight / 2;
                
                return (
                  <Animated.View
                    style={[
                      styles.pujaThali,
                      {
                        position: 'absolute',
                        left: (screenWidth - 200) / 2, // Center horizontally (200px width like aarti)
                        top: (screenHeight - 200) / 2 + 100, // Center vertically + 100px lower
                        width: 200, // Same size as aarti thali
                        height: 200,
                        transform: [
                          {
                            translateX: thaliEllipseAnimation.interpolate({
                              inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5],
                              outputRange: [
                                0, // Start at 6 o'clock (bottom)
                                -ellipseWidth / 2, // Quarter at 3 o'clock (right)
                                0, // Half at 12 o'clock (top)
                                ellipseWidth / 2, // 3 quarters at 9 o'clock (left)
                                0, // Complete first orbit at 6 o'clock (bottom)
                                -ellipseWidth / 2, // Start second orbit - 3 o'clock (right)
                                0, // Second orbit - 12 o'clock (top)
                                ellipseWidth / 2, // Second orbit - 9 o'clock (left)
                                0, // Second orbit complete - 6 o'clock (bottom)
                                -ellipseWidth / 2, // Third orbit - 3 o'clock (right)
                                0, // Third orbit - 12 o'clock (top)
                                ellipseWidth / 2, // Third orbit - 9 o'clock (left)
                                0, // Third orbit complete - 6 o'clock (bottom)
                                -ellipseWidth / 2, // Fourth orbit - 3 o'clock (right)
                                0, // Fourth orbit - 12 o'clock (top)
                                ellipseWidth / 2, // Fourth orbit - 9 o'clock (left)
                                0, // Fourth orbit complete - 6 o'clock (bottom)
                                -ellipseWidth / 2, // Fifth orbit - 3 o'clock (right)
                                0, // Fifth orbit - 12 o'clock (top)
                                ellipseWidth / 2, // Fifth orbit - 9 o'clock (left)
                                0, // Fifth orbit complete - 6 o'clock (bottom)
                              ],
                            }),
                          },
                          {
                            translateY: thaliEllipseAnimation.interpolate({
                              inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5],
                              outputRange: [
                                ellipseHeight / 2, // Start at 6 o'clock (bottom)
                                0, // Quarter at 9 o'clock (center)
                                -ellipseHeight / 2, // Half at 12 o'clock (top)
                                0, // 3 quarters at 3 o'clock (center)
                                ellipseHeight / 2, // Complete first orbit at 6 o'clock (bottom)
                                0, // Start second orbit - 9 o'clock (center)
                                -ellipseHeight / 2, // Second orbit - 12 o'clock (top)
                                0, // Second orbit - 3 o'clock (center)
                                ellipseHeight / 2, // Second orbit complete - 6 o'clock (bottom)
                                0, // Third orbit - 9 o'clock (center)
                                -ellipseHeight / 2, // Third orbit - 12 o'clock (top)
                                0, // Third orbit - 3 o'clock (center)
                                ellipseHeight / 2, // Third orbit complete - 6 o'clock (bottom)
                                0, // Fourth orbit - 9 o'clock (center)
                                -ellipseHeight / 2, // Fourth orbit - 12 o'clock (top)
                                0, // Fourth orbit - 3 o'clock (center)
                                ellipseHeight / 2, // Fourth orbit complete - 6 o'clock (bottom)
                                0, // Fifth orbit - 9 o'clock (center)
                                -ellipseHeight / 2, // Fifth orbit - 12 o'clock (top)
                                0, // Fifth orbit - 3 o'clock (center)
                                ellipseHeight / 2, // Fifth orbit complete - 6 o'clock (bottom)
                              ],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={require('@/assets/images/icons/own temple/PujaThali1.png')}
                      style={{ width: '100%', height: '100%' }} // Use full container size
                      resizeMode="contain"
                    />
                  </Animated.View>
                );
              })()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Bottom Action Buttons - Always visible */}
        <>
          {/* Perform Puja Button - 79% from top, 90% width, 5% height */}
          <TouchableOpacity
            style={[styles.performPujaButton, {
              top: screenHeight * 0.77,
              width: screenWidth * 0.90,
              height: screenHeight * 0.05,
              opacity: isPujaRitualActive ? 0.6 : 1,
            }]}
            onPress={performPujaRitual}
            disabled={isPujaRitualActive}
          >
            <Text style={styles.performPujaButtonText}>
              {isPujaRitualActive ? (isHindi ? 'पूजा हो रही है...' : 'Performing Puja...') : (isHindi ? 'पूजा करें' : 'Perform Puja')}
            </Text>
          </TouchableOpacity>
          
          {/* Second Row Buttons - 83% from top (77% + 5% + 1%), 29% width each, 1.5% spacing */}
          <View style={[styles.secondRowContainer, {
            top: screenHeight * 0.83,
            height: screenHeight * 0.05,
            width: screenWidth * 0.90, // Same width as Perform Puja button
            left: '50%',
            transform: [{ translateX: -screenWidth * 0.45 }], // Center the container
          }]}>
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
                backgroundColor: currentScreen === 'myTemple' ? 'rgba(255, 106, 0, 1)' : 'rgba(255, 106, 0, 0.8)',
                borderWidth: currentScreen === 'myTemple' ? 2 : 0,
                borderColor: currentScreen === 'myTemple' ? '#fff' : 'transparent',
              }]}
              onPress={() => {
                setCurrentScreen('myTemple');
              }}
            >
              <Text style={[styles.secondRowButtonText, {
                fontWeight: currentScreen === 'myTemple' ? '700' : '600',
                fontSize: currentScreen === 'myTemple' ? 13 : 12,
              }]}>{isHindi ? 'मेरा मंदिर' : 'My Temple'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
                backgroundColor: currentScreen === 'todaysPuja' ? 'rgba(255, 106, 0, 1)' : 'rgba(255, 106, 0, 0.8)',
                borderWidth: currentScreen === 'todaysPuja' ? 2 : 0,
                borderColor: currentScreen === 'todaysPuja' ? '#fff' : 'transparent',
              }]}
              onPress={() => {
                setCurrentScreen('todaysPuja');
              }}
            >
              <Text style={[styles.secondRowButtonText, {
                fontWeight: currentScreen === 'todaysPuja' ? '700' : '600',
                fontSize: currentScreen === 'todaysPuja' ? 13 : 12,
              }]}>{isHindi ? 'आज की पूजा' : 'Today\'s Pujas'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
                backgroundColor: currentScreen === 'allTemples' ? 'rgba(255, 106, 0, 1)' : 'rgba(255, 106, 0, 0.8)',
                borderWidth: currentScreen === 'allTemples' ? 2 : 0,
                borderColor: currentScreen === 'allTemples' ? '#fff' : 'transparent',
              }]}
              onPress={() => {
                setCurrentScreen('allTemples');
              }}
            >
              <Text style={[styles.secondRowButtonText, {
                fontWeight: currentScreen === 'allTemples' ? '700' : '600',
                fontSize: currentScreen === 'allTemples' ? 13 : 12,
              }]}>{isHindi ? 'सभी मंदिर' : 'All Temples'}</Text>
            </TouchableOpacity>
          </View>
        </>
      
      {/* Modal Implementation for Temple Configuration */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal !== null}
        onRequestClose={() => setModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setModal(null)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 229 }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              {modal === 'temple' ? (
                <View style={[styles.modalContent, { zIndex: 230 }]}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Temple</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModal(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalStyleList}
                  >
                    {templeStyles.map(style => (
                      <TouchableOpacity
                        key={style.id}
                        style={[styles.modalStyleOption, selectedStyle === style.id && styles.modalStyleOptionSelected]}
                        onPress={() => {
                          setSelectedStyle(style.id);
                          setModal(null);
                        }}
                      >
                        <Image source={style.image} style={styles.modalTempleImage} resizeMode="contain" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : modal === 'background' ? (
                <View style={[styles.modalContent, { zIndex: 230 }]}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Background</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModal(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.gradientPresetList}>
                    {gradientPresets.map((preset, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.gradientPresetOption}
                        onPress={() => {
                          setBgGradient(preset);
                          setModal(null);
                        }}
                      >
                        <LinearGradient
                          colors={preset as any}
                          style={styles.gradientPresetCircle}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : modal === 'deities' ? (
                <View style={[styles.modalContent, { height: screenHeight * 0.3, zIndex: 230 }]}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Deities</Text>
                      {Object.keys(selectedDeities).length > 0 && (
                        <Text style={styles.selectionCounter}>
                          {Object.keys(selectedDeities).length}/3 selected
                        </Text>
                      )}
                    </View>
                    <View style={styles.modalHeaderButtons}>
                      {Object.keys(selectedDeities).length > 0 && (
                        <TouchableOpacity 
                          style={styles.clearAllButton}
                          onPress={() => {
                            setSelectedDeities({});
                            setDeityError('');
                          }}
                        >
                          <Text style={styles.clearAllButtonText}>Clear All</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setModal(null)}
                      >
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView 
                    style={styles.deitiesScrollView}
                    showsVerticalScrollIndicator={true}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading deities...</Text>
                      </View>
                    ) : (
                      <View style={styles.deityGrid}>
                        {deityData.map((deity) => {
                        // Add null check for deity.Deity
                        if (!deity.Deity) {
                          return null;
                        }
                        
                        const isSelected = selectedDeities.hasOwnProperty(deity._id || '');
                        const selectedStatueUrl = selectedDeities[deity._id || ''];
                        return (
                          <TouchableOpacity
                            key={deity._id}
                            style={styles.deityOption}
                            onPress={() => {
                              // Add null check before accessing deity.Deity
                              if (!deity.Deity) {
                                return;
                              }
                              
                              if (isSelected) {
                                // Remove this deity from selection
                                const newSelectedDeities = { ...selectedDeities };
                                delete newSelectedDeities[deity._id || ''];
                                setSelectedDeities(newSelectedDeities);
                              } else {
                                // Check if we can add more deities (max 3)
                                if (Object.keys(selectedDeities).length >= 3) {
                                  setDeityError('Maximum 3 deities allowed');
                                  setTimeout(() => setDeityError(''), 2000);
                                  return;
                                }
                                
                                // Handle different possible formats of Statues
                                let statuesArray: string[] = [];
                                if (Array.isArray(deity.Deity.Statues)) {
                                  statuesArray = deity.Deity.Statues as string[];
                                } else if (deity.Deity.Statues && typeof deity.Deity.Statues === 'object') {
                                  // If it's an object, try to convert to array
                                  statuesArray = Object.values(deity.Deity.Statues) as string[];
                                }
                                
                                if (statuesArray.length > 0) {
                                  // Create a copy of deity with processed statues
                                  const deityWithProcessedStatues = {
                                    ...deity,
                                    Deity: {
                                      ...deity.Deity,
                                      Statues: statuesArray
                                    }
                                  };
                                  setSelectedDeityForStatues(deityWithProcessedStatues);
                                  setModal('statues');
                                }
                              }
                            }}
                          >
                            <View style={[styles.deityIconCircle, isSelected && styles.deityIconCircleSelected]}>
                              {deity.Icon ? (
                                <Image 
                                  source={getImageSource(deity.Icon)} 
                                  style={{ width: 36, height: 36, borderRadius: 18 }} 
                                  resizeMode="contain" 
                                />
                              ) : (
                                <Text style={styles.deityIcon}>🕉️</Text>
                              )}
                              {isSelected && (
                                <View style={styles.deityCheckmark}>
                                  <MaterialCommunityIcons name="check-circle" size={22} color="#FF6A00" />
                                </View>
                              )}
                            </View>
                            <Text style={styles.deityLabel}>{deity.Deity?.Name || 'Unknown Deity'}</Text>
                            {isSelected && selectedStatueUrl && (
                              <Text style={styles.selectedStatueText}>✓ Idol Selected</Text>
                            )}
                          </TouchableOpacity>
                        );
                        })}
                      </View>
                    )}
                    {deityError ? (
                      <Text style={styles.deityError}>{deityError}</Text>
                    ) : null}
                  </ScrollView>
                </View>
              ) : modal === 'statues' && selectedDeityForStatues ? (
                <View style={styles.statuesModalContent}>
                  <ScrollView 
                    horizontal
                    style={styles.statuesScrollView}
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.statuesScrollContent}
                  >
                      {selectedDeityForStatues.Deity.Statues.map((statueUrl, index) => {
                        const isSelected = selectedDeities[selectedDeityForStatues._id || ''] === statueUrl;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.statueItemHorizontal, isSelected && styles.statueItemSelected]}
                            onPress={() => {
                              // Add this deity and statue to selection
                              const newSelectedDeities = { ...selectedDeities };
                              newSelectedDeities[selectedDeityForStatues._id || ''] = statueUrl;
                              setSelectedDeities(newSelectedDeities);
                              setModal('deities');
                              setSelectedDeityForStatues(null);
                            }}
                          >
                            <Image 
                              source={getImageSource(statueUrl)} 
                              style={styles.statueImage} 
                              resizeMode="contain" 
                            />
                            {isSelected && (
                              <View style={styles.statueCheckmark}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#FF6A00" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
              ) : null}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Deity Selection Modal for Step 4 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeityDropdown}
        onRequestClose={() => setShowDeityDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeityDropdown(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.deitySelectionModal}>
                <View style={styles.deitySelectionHeader}>
                  <Text style={styles.deitySelectionTitle}>Select Deity to Edit</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowDeityDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.deitySelectionList}>
                  {Object.entries(selectedDeities).map(([deityId, statueUrl]) => {
                    const deity = deityData.find(d => d._id === deityId);
                    return (
                      <TouchableOpacity
                        key={deityId}
                        style={[
                          styles.deitySelectionOption,
                          selectedDeityForEdit === deityId && styles.deitySelectionOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedDeityForEdit(deityId);
                          setShowDeityDropdown(false);
                        }}
                      >
                        <Image 
                          source={getImageSource(statueUrl)} 
                          style={styles.deitySelectionImage} 
                          resizeMode="contain" 
                        />
                        <Text style={[
                          styles.deitySelectionText,
                          selectedDeityForEdit === deityId && styles.deitySelectionTextSelected
                        ]}>
                          {deity ? deity.Deity?.Name || 'Unknown Deity' : 'Unknown Deity'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
  purpleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backgroundLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  saveMessageContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: '#FF9933',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 1001,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMessageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  archImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 220,
  },
  // All Temples Styles
  allTemplesContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 120, // Increased height to accommodate deity name
    zIndex: 250, // Higher than arch to be visible
  },
  allTemplesScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  allTemplesIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  allTemplesIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  allTemplesIconImage: {
    width: 32,
    height: 32,
  },
  allTemplesIconLabel: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  allTemplesTempleDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 212, // As requested
  },
  allTemplesTempleImage: {
    position: 'absolute',
    // Dimensions and position will be calculated dynamically
  },
  currentDeityNameContainer: {
    position: 'absolute',
    top: 90, // Below the icons
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDeityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  templeDisplay: {
    position: 'absolute',
    zIndex: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 220,
    zIndex: 3,
  },
  dimensionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 300,
  },
  dimensionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dimensionRow: {
    marginBottom: 8,
  },
  dimensionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  backButton: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // New Button Styles
  performPujaButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }], // Center the 90% width button
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  performPujaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  secondRowContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 225,
  },
  secondRowButton: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  secondRowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // Temple Configuration Icons Styles
  templeConfigIconsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 230,
    paddingHorizontal: 20,
  },
  configIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  configIconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    height: 50,
  },
  configIconImage: {
    width: 36,
    height: 36,
    marginBottom: 0,
  },
  gradientIconContainer: {
    width: 36,
    height: 36,
    marginBottom: 0,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientIcon: {
    width: '100%',
    height: '100%',
  },
  // Modal Styles
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 101,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalStyleList: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    paddingHorizontal: 20,
  },
  modalStyleOption: {
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  modalStyleOptionSelected: {
    backgroundColor: '#FFEDD2',
    borderColor: '#FF6A00',
  },
  modalTempleImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  modalStyleOptionText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  gradientPresetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  gradientPresetOption: {
    width: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  gradientPresetCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  deityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  deityPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  // Deity Selection Styles
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearAllButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionCounter: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  deityOption: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 18,
  },
  deityIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  deityIconCircleSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  deityIcon: {
    fontSize: 32,
  },
  deityCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  deityLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  deityError: {
    color: '#FF6A00',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 'bold',
  },
  selectedStatueText: {
    fontSize: 10,
    color: '#FF6A00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  // Statue Selection Styles
  statuesScrollView: {
    maxHeight: 400,
  },
  statuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  statueItem: {
    alignItems: 'center',
    width: '45%',
  },
  statueImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  statueLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  statueItemSelected: {
    borderWidth: 3,
    borderColor: '#FF6A00',
    borderRadius: 16,
    padding: 4,
  },
  statueCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  templeBells: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 200,
    left: screenWidth * 0.8 - 60,
    zIndex: 199,
  },
  templeBellsLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 200,
    left: screenWidth * 0.2 - 60,
    zIndex: 199,
  },
  selectedDeityImageContainer: {
    position: 'absolute',
    zIndex: 210,
    // Removed justifyContent and alignItems to avoid interference with sizing
  },
  // Puja Icons Styles
  leftPujaIconsColumn: {
    position: 'absolute',
    left: 10,
    top: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 240,
  },
  rightPujaIconsColumn: {
    position: 'absolute',
    right: 10,
    top: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 240,
  },
  pujaIconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 106, 0, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20, // Space for the label below
  },
  pujaIconItemDisabled: {
    opacity: 0.5,
  },
  pujaIcon: {
    fontSize: 24,
  },
  pujaIconImage: {
    width: 35,
    height: 35,
  },
  pujaIconLabel: {
    position: 'absolute',
    top: 42, // space below the 40x40 icon
    width: 50,
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedDeityFullImage: {
    width: '100%',
    height: '100%',
  },
  flowerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    width: 62,
    paddingVertical: 8,
    paddingHorizontal: 3,
  },
  flowerOptions: {
    paddingHorizontal: 2,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  flowerOption: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  flowerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  flowerOptionEmoji: {
    fontSize: 28,
  },
  flowerOptionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  flowerOptionImage: {
    width: 36,
    height: 36,
  },
  deitiesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    height: screenHeight * 0.3,
    zIndex: 1001,
  },
  deitiesScrollView: {
    flex: 1,
    marginTop: 8,
  },
  statuesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    height: screenHeight * 0.2,
    position: 'absolute',
    top: screenHeight * 0.71,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }], // Center based on screen width
    zIndex: 1001,
  },
  statuesScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statueItemHorizontal: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 100,
  },
  createModifyButton: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.35 }],
    width: screenWidth * 0.7,
    height: 40,
    backgroundColor: 'rgba(255, 106, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 230,
  },
  createModifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  saveTempleButton: {
    position: 'absolute',
    top: 130,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }],
    width: screenWidth * 0.9,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 230,
  },
  saveTempleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  // Wizard Banner Styles
  wizardBanner: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  wizardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  // Controls Styles
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeIcon: {
    width: 30,
    height: 30,
  },
  positionIcon: {
    width: 30,
    height: 30,
  },
  arrowButton: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    width: 30,
    height: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  positionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Deity Dropdown Styles
  deityDropdownContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  deityDropdown: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  deityDropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 150,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deityDropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deityDropdownOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  deityDropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  deityDropdownOptionTextSelected: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  // Action Button Styles
  wizardButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  wizardBackButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
    minWidth: 80,
  },
  wizardBackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  wizardActionButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
  },
  wizardActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  // Flashing Animation
  flashingIcon: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  // Deity Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deitySelectionModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deitySelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deitySelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deitySelectionList: {
    maxHeight: 300,
  },
  deitySelectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deitySelectionOptionSelected: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF6A00',
  },
  deitySelectionImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  deitySelectionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deitySelectionTextSelected: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  // Aarti Modal Styles
  aartiModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // 100% transparent
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200, // Start from 200px
    paddingBottom: screenHeight * 0.2, // End at 80% screen height (20% from bottom)
  },
  aartiModalOverlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thaliContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thaliImage: {
    width: '100%',
    height: '100%',
  },
  thaliLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thaliLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  // Music Modal Styles
  musicModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    height: '80%',
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  musicModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  musicModalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  musicModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  musicModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicModalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  musicSearchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  musicSearchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  musicSearchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  musicFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  musicFilterContent: {
    paddingRight: 16,
  },
  musicFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  musicFilterButtonActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  musicFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stopMusicButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  stopMusicButtonActive: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  stopMusicButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  stopMusicButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stopMusicButtonTextActive: {
    color: '#fff',
  },
  stopMusicButtonTextDisabled: {
    color: '#999',
  },
  musicListContainer: {
    flex: 1,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  musicItemContent: {
    flex: 1,
    marginRight: 16,
  },
  musicItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  musicItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  musicItemDuration: {
    fontSize: 12,
    color: '#999',
  },
  musicPlayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Configuration Icons Styles
  configurationIconsContainer: {
    position: 'absolute',
    top: 40,
    left: '5%',
    right: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
    elevation: 1000,
  },
  configIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 65,
    height: 65,
  },
  configIconLabel: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: 65,
  },
  saveTempleConfigButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 65,
    height: 65,
  },
  saveIconImage: {
    width: 36,
    height: 36,
    marginBottom: 0,
  },
  saveTempleConfigButtonText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: 65,
  },
  // Perform Puja Thali Modal Styles
  pujaThaliModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // 100% transparent
  },
  pujaThaliModalOverlayTouchable: {
    flex: 1,
    width: '100%',
  },
  pujaThali: {
    position: 'absolute',
    zIndex: 9999, // Very high zIndex to ensure visibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  // No Deity Selected Message Styles
  noDeityMessageContainer: {
    position: 'absolute',
    top: screenHeight * 0.35,
    left: '20%',
    right: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  noDeityMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  flashingDeityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderStyle: 'dashed',
  },
  flashingDeityIcon: {
    marginBottom: 8,
  },
  flashingDeityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6A00',
  },
});
