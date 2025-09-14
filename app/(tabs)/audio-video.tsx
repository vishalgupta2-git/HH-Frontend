import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Audio } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useLanguage } from '@/contexts/LanguageContext';

interface MediaFile {
  avld: string;
  Type: string;
  Classification: string;
  VideoName: string;
  Link: string;
  Deity: string;
  Language: string;
  Artists: string;
  Duration: string;
  MediaType: string;
  CreatedAt: string;
  famous?: boolean; // Optional boolean field for famous content
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

export default function AudioVideoScreen() {
  const { isHindi, isBangla, isKannada, isPunjabi, isTamil, isTelugu, currentLanguage } = useLanguage();
  
  // Debug: Log current language
  console.log('🔍 [AUDIO-VIDEO] Current language:', currentLanguage);
  
  // Helper function to get translation
  const getTranslation = (translations: any) => {
    const result = currentLanguage === 'hindi' ? (translations.hi || translations.en) :
           currentLanguage === 'bangla' ? (translations.bangla || translations.en) :
           currentLanguage === 'kannada' ? (translations.kannada || translations.en) :
           currentLanguage === 'punjabi' ? (translations.punjabi || translations.en) :
           currentLanguage === 'tamil' ? (translations.tamil || translations.en) :
           currentLanguage === 'telugu' ? (translations.telugu || translations.en) :
           translations.en;
    
    // Debug: Log translation result
    console.log('🔍 [AUDIO-VIDEO] Translation for', Object.keys(translations)[0], ':', result);
    return result;
  };
  
  const translations = {
    searchPlaceholder: { 
      en: 'Search for music, artists, or deities...', 
      hi: 'संगीत, कलाकार या देवताओं की खोज करें...',
      bangla: 'সংগীত, শিল্পী বা দেবতাদের খুঁজুন...',
      kannada: 'ಸಂಗೀತ, ಕಲಾವಿದರು ಅಥವಾ ದೇವತೆಗಳನ್ನು ಹುಡುಕಿ...',
      punjabi: 'ਸੰਗੀਤ, ਕਲਾਕਾਰ ਜਾਂ ਦੇਵਤਿਆਂ ਦੀ ਖੋਜ ਕਰੋ...',
      tamil: 'இசை, கலைஞர்கள் அல்லது தெய்வங்களைத் தேடுங்கள்...',
      telugu: 'సంగీతం, కళాకారులు లేదా దేవతలను వెతకండి...'
    },
    audio: { 
      en: 'Audio', 
      hi: 'ऑडियो',
      bangla: 'অডিও',
      kannada: 'ಆಡಿಯೋ',
      punjabi: 'ਆਡੀਓ',
      tamil: 'ஆடியோ',
      telugu: 'ఆడియో'
    },
    video: { 
      en: 'Video', 
      hi: 'वीडियो',
      bangla: 'ভিডিও',
      kannada: 'ವೀಡಿಯೊ',
      punjabi: 'ਵੀਡੀਓ',
      tamil: 'வீடியோ',
      telugu: 'వీడియో'
    },
    stopMusic: { 
      en: '⏹️ Stop Music', 
      hi: '⏹️ संगीत बंद करें',
      bangla: '⏹️ সংগীত বন্ধ করুন',
      kannada: '⏹️ ಸಂಗೀತವನ್ನು ನಿಲ್ಲಿಸಿ',
      punjabi: '⏹️ ਸੰਗੀਤ ਬੰਦ ਕਰੋ',
      tamil: '⏹️ இசையை நிறுத்து',
      telugu: '⏹️ సంగీతాన్ని ఆపండి'
    },
    loading: { 
      en: 'Loading...', 
      hi: 'लोड हो रहा है...',
      bangla: 'লোড হচ্ছে...',
      kannada: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      tamil: 'லோட் செய்கிறது...',
      telugu: 'లోడ్ అవుతోంది...'
    },
    noMediaFound: { 
      en: 'No media files found. Please check the database.', 
      hi: 'कोई मीडिया फाइल नहीं मिली। कृपया डेटाबेस जांचें।',
      bangla: 'কোনো মিডিয়া ফাইল পাওয়া যায়নি। অনুগ্রহ করে ডেটাবেস চেক করুন।',
      kannada: 'ಮೀಡಿಯಾ ಫೈಲ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ। ದಯವಿಟ್ಟು ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲಿಸಿ।',
      punjabi: 'ਕੋਈ ਮੀਡੀਆ ਫਾਈਲ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਡੇਟਾਬੇਸ ਚੈਕ ਕਰੋ।',
      tamil: 'எந்த மீடியா கோப்புகளும் கிடைக்கவில்லை. தயவுசெய்து தரவுத்தளத்தை சரிபார்க்கவும்।',
      telugu: 'మీడియా ఫైళ్లు కనుగొనబడలేదు. దయచేసి డేటాబేస్‌ను తనిఖీ చేయండి।'
    },
    noMatches: { 
      en: 'No media files match your current filters. Try adjusting your search or filters.', 
      hi: 'आपके वर्तमान फिल्टर से कोई मीडिया फाइल मेल नहीं खाती। अपनी खोज या फिल्टर को समायोजित करने का प्रयास करें।',
      bangla: 'আপনার বর্তমান ফিল্টারের সাথে কোনো মিডিয়া ফাইল মিলছে না। অনুগ্রহ করে আপনার অনুসন্ধান বা ফিল্টার সামঞ্জস্য করুন।',
      kannada: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಮೀಡಿಯಾ ಫೈಲ್‌ಗಳಿಲ್ಲ। ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਫਿਲਟਰਾਂ ਨਾਲ ਕੋਈ ਮੀਡੀਆ ਫਾਈਲ ਮੈਚ ਨਹੀਂ ਹੁੰਦੀ। ਆਪਣੀ ਖੋਜ ਜਾਂ ਫਿਲਟਰਾਂ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'உங்கள் தற்போதைய வடிகட்டிகளுடன் பொருந்தும் மீடியா கோப்புகள் இல்லை. உங்கள் தேடல் அல்லது வடிகட்டிகளை சரிசெய்ய முயற்சிக்கவும்।',
      telugu: 'మీ ప్రస్తుత ఫిల్టర్‌లతో సరిపోయే మీడియా ఫైళ్లు లేవు. మీ శోధన లేదా ఫిల్టర్‌లను సర్దుబాటు చేయడానికి ప్రయత్నించండి।'
    },
    loadingAudio: { 
      en: 'Loading audio...', 
      hi: 'ऑडियो लोड हो रहा है...',
      bangla: 'অডিও লোড হচ্ছে...',
      kannada: 'ಆಡಿಯೋ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      punjabi: 'ਆਡੀਓ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      tamil: 'ஆடியோ லோட் செய்கிறது...',
      telugu: 'ఆడియో లోడ్ అవుతోంది...'
    },
    unsupportedMedia: { 
      en: 'Unsupported media type', 
      hi: 'असमर्थित मीडिया प्रकार',
      bangla: 'অসমর্থিত মিডিয়া টাইপ',
      kannada: 'ಬೆಂಬಲಿಸದ ಮೀಡಿಯಾ ಪ್ರಕಾರ',
      punjabi: 'ਅਸਮਰਥਿਤ ਮੀਡੀਆ ਕਿਸਮ',
      tamil: 'ஆதரிக்கப்படாத மீடியா வகை',
      telugu: 'మద్దతు లేని మీడియా రకం'
    },
    by: { 
      en: 'by', 
      hi: 'द्वारा',
      bangla: 'দ্বারা',
      kannada: 'ದ್ವಾರಾ',
      punjabi: 'ਦੁਆਰਾ',
      tamil: 'மூலம்',
      telugu: 'ద్వారా'
    },
    untitled: {
      en: 'Untitled',
      hi: 'बिना शीर्षक',
      bangla: 'শিরোনামহীন',
      kannada: 'ಶೀರ್ಷಿಕೆಯಿಲ್ಲದ',
      punjabi: 'ਸਿਰਲੇਖ ਰਹਿਤ',
      tamil: 'தலைப்பு இல்லாத',
      telugu: 'శీర్షిక లేని'
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
    failedToLoadAudio: {
      en: 'Failed to load audio file. Please try again.',
      hi: 'ऑडियो फाइल लोड करने में विफल। कृपया पुनः प्रयास करें।',
      bangla: 'অডিও ফাইল লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
      kannada: 'ಆಡಿಯೋ ಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਆਡੀਓ ਫਾਈਲ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'ஆடியோ கோப்பை லோட் செய்ய முடியவில்லை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      telugu: 'ఆడియో ఫైల్‌ను లోడ్ చేయడంలో విఫలమైంది। దయచేసి మళ్లీ ప్రయత్నించండి।'
    },
    failedToPlayAudio: {
      en: 'Failed to play audio',
      hi: 'ऑडियो चलाने में विफल',
      bangla: 'অডিও চালাতে ব্যর্থ',
      kannada: 'ಆಡಿಯೋ ಪ್ಲೇ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ',
      punjabi: 'ਆਡੀਓ ਚਲਾਉਣ ਵਿੱਚ ਅਸਫਲ',
      tamil: 'ஆடியோவை இயக்க முடியவில்லை',
      telugu: 'ఆడియో ప్లే చేయడంలో విఫలమైంది'
    },
    failedToFetchMedia: {
      en: 'Failed to fetch media files',
      hi: 'मीडिया फाइलें प्राप्त करने में विफल',
      bangla: 'মিডিয়া ফাইল আনতে ব্যর্থ',
      kannada: 'ಮೀಡಿಯಾ ಫೈಲ್‌ಗಳನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ',
      punjabi: 'ਮੀਡੀਆ ਫਾਈਲਾਂ ਲਿਆਉਣ ਵਿੱਚ ਅਸਫਲ',
      tamil: 'மீடியா கோப்புகளைப் பெற முடியவில்லை',
      telugu: 'మీడియా ఫైళ్లను పొందడంలో విఫలమైంది'
    },
    filterButtons: {
      all: { 
        en: 'All', 
        hi: 'सभी',
        bangla: 'সব',
        kannada: 'ಎಲ್ಲಾ',
        punjabi: 'ਸਭ',
        tamil: 'அனைத்தும்',
        telugu: 'అన్నీ'
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
      bhajan: { 
        en: 'Bhajan', 
        hi: 'भजन',
        bangla: 'ভজন',
        kannada: 'ಭಜನೆ',
        punjabi: 'ਭਜਨ',
        tamil: 'பஜன்',
        telugu: 'భజన'
      },
      chalisa: { 
        en: 'Chalisa', 
        hi: 'चालीसा',
        bangla: 'চালিশা',
        kannada: 'ಚಾಲೀಸಾ',
        punjabi: 'ਚਾਲੀਸਾ',
        tamil: 'சாலிசா',
        telugu: 'చాలీసా'
      },
      katha: { 
        en: 'Katha', 
        hi: 'कथा',
        bangla: 'কথা',
        kannada: 'ಕಥೆ',
        punjabi: 'ਕਥਾ',
        tamil: 'கதை',
        telugu: 'కథ'
      },
      paath: { 
        en: 'Paath / Strotam', 
        hi: 'पाठ / स्तोत्र',
        bangla: 'পাঠ / স্তোত্র',
        kannada: 'ಪಾಠ / ಸ್ತೋತ್ರ',
        punjabi: 'ਪਾਠ / ਸਤੋਤਰ',
        tamil: 'பாடம் / ஸ்தோத்ரம்',
        telugu: 'పాఠం / స్తోత్రం'
      },
      famous: { 
        en: 'Famous', 
        hi: 'प्रसिद्ध',
        bangla: 'বিখ্যাত',
        kannada: 'ಪ್ರಸಿದ್ಧ',
        punjabi: 'ਪ੍ਰਸਿੱਧ',
        tamil: 'பிரபலமான',
        telugu: 'ప్రసిద్ధ'
      }
    },
    deityNames: {
      brahma: { 
        en: 'Brahma Ji', 
        hi: 'ब्रह्मा जी',
        bangla: 'ব্রহ্মা জী',
        kannada: 'ಬ್ರಹ್ಮ ಜಿ',
        punjabi: 'ਬ੍ਰਹਮਾ ਜੀ',
        tamil: 'பிரம்மா ஜி',
        telugu: 'బ్రహ్మ జీ'
      },
      brihaspati: { 
        en: 'Brihaspati Dev', 
        hi: 'बृहस्पति देव',
        bangla: 'বৃহস্পতি দেব',
        kannada: 'ಬೃಹಸ್ಪತಿ ದೇವ',
        punjabi: 'ਬ੍ਰਿਹਸਪਤੀ ਦੇਵ',
        tamil: 'பிரஹஸ்பதி தேவ்',
        telugu: 'బృహస్పతి దేవ్'
      },
      durga: { 
        en: 'Durga Maa', 
        hi: 'दुर्गा मां',
        bangla: 'দুর্গা মা',
        kannada: 'ದುರ್ಗಾ ಮಾ',
        punjabi: 'ਦੁਰਗਾ ਮਾਂ',
        tamil: 'துர்கா மா',
        telugu: 'దుర్గా మా'
      },
      ganga: { 
        en: 'Ganga Maiya', 
        hi: 'गंगा मैया',
        bangla: 'গঙ্গা মাইয়া',
        kannada: 'ಗಂಗಾ ಮೈಯಾ',
        punjabi: 'ਗੰਗਾ ਮਾਈਆ',
        tamil: 'கங்கா மையா',
        telugu: 'గంగా మైయా'
      },
      khatuShyam: { 
        en: 'Khatu Shyam Ji', 
        hi: 'खाटू श्याम जी',
        bangla: 'খাটু শ্যাম জী',
        kannada: 'ಖಾಟು ಶ್ಯಾಮ ಜಿ',
        punjabi: 'ਖਾਟੂ ਸ਼ਿਆਮ ਜੀ',
        tamil: 'காட்டு ஷ்யாம் ஜி',
        telugu: 'ఖాటు శ్యామ్ జీ'
      },
      lakshmi: { 
        en: 'Lakshmi Maa', 
        hi: 'लक्ष्मी मां',
        bangla: 'লক্ষ্মী মা',
        kannada: 'ಲಕ್ಷ್ಮೀ ಮಾ',
        punjabi: 'ਲਕਸ਼ਮੀ ਮਾਂ',
        tamil: 'லட்சுமி மா',
        telugu: 'లక్ష్మీ మా'
      },
      kali: { 
        en: 'Maa Kali', 
        hi: 'मां काली',
        bangla: 'মা কালী',
        kannada: 'ಮಾ ಕಾಳಿ',
        punjabi: 'ਮਾਂ ਕਾਲੀ',
        tamil: 'மா காளி',
        telugu: 'మా కాళి'
      },
      shiv: { 
        en: 'Mahadev Shiv Ji', 
        hi: 'महादेव शिव जी',
        bangla: 'মহাদেব শিব জী',
        kannada: 'ಮಹಾದೇವ ಶಿವ ಜಿ',
        punjabi: 'ਮਹਾਦੇਵ ਸ਼ਿਵ ਜੀ',
        tamil: 'மஹாதேவ் ஷிவ் ஜி',
        telugu: 'మహాదేవ్ శివ్ జీ'
      },
      hanuman: { 
        en: 'Mahaveer Hanuman', 
        hi: 'महावीर हनुमान',
        bangla: 'মহাবীর হনুমান',
        kannada: 'ಮಹಾವೀರ ಹನುಮಾನ್',
        punjabi: 'ਮਹਾਵੀਰ ਹਨੂਮਾਨ',
        tamil: 'மஹாவீர் ஹனுமான்',
        telugu: 'మహావీర్ హనుమాన్'
      },
      navgrah: { 
        en: 'Navgrah', 
        hi: 'नवग्रह',
        bangla: 'নবগ্রহ',
        kannada: 'ನವಗ್ರಹ',
        punjabi: 'ਨਵਗ੍ਰਹ',
        tamil: 'நவக்ரஹ்',
        telugu: 'నవగ్రహ్'
      },
      rahuKetu: { 
        en: 'Rahu Ketu', 
        hi: 'राहु केतु',
        bangla: 'রাহু কেতু',
        kannada: 'ರಾಹು ಕೇತು',
        punjabi: 'ਰਾਹੁ ਕੇਤੁ',
        tamil: 'ராகு கேது',
        telugu: 'రాహు కేతు'
      },
      saraswati: { 
        en: 'Saraswati Maa', 
        hi: 'सरस्वती मां',
        bangla: 'সরস্বতী মা',
        kannada: 'ಸರಸ್ವತಿ ಮಾ',
        punjabi: 'ਸਰਸਵਤੀ ਮਾਂ',
        tamil: 'சரஸ்வதி மா',
        telugu: 'సరస్వతి మా'
      },
      shani: { 
        en: 'Shani Dev', 
        hi: 'शनि देव',
        bangla: 'শনি দেব',
        kannada: 'ಶನಿ ದೇವ',
        punjabi: 'ਸ਼ਨੀ ਦੇਵ',
        tamil: 'ஷனி தேவ்',
        telugu: 'శని దేవ్'
      },
      krishna: { 
        en: 'Shri Krishna', 
        hi: 'श्री कृष्ण',
        bangla: 'শ্রী কৃষ্ণ',
        kannada: 'ಶ್ರೀ ಕೃಷ್ಣ',
        punjabi: 'ਸ਼੍ਰੀ ਕ੍ਰਿਸ਼ਨ',
        tamil: 'ஸ்ரீ கிருஷ்ணா',
        telugu: 'శ్రీ కృష్ణ'
      },
      ram: { 
        en: 'Shri Ram', 
        hi: 'श्री राम',
        bangla: 'শ্রী রাম',
        kannada: 'ಶ್ರೀ ರಾಮ',
        punjabi: 'ਸ਼੍ਰੀ ਰਾਮ',
        tamil: 'ஸ்ரீ ராமா',
        telugu: 'శ్రీ రామ్'
      },
      ganesh: { 
        en: 'Vighnaharta Ganesh', 
        hi: 'विघ्नहर्ता गणेश',
        bangla: 'বিঘ্নহর্তা গণেশ',
        kannada: 'ವಿಘ್ನಹರ್ತಾ ಗಣೇಶ',
        punjabi: 'ਵਿਘਨਹਰਤਾ ਗਣੇਸ਼',
        tamil: 'விக்னஹர்தா கணேஷ்',
        telugu: 'విఘ్నహర్తా గణేష్'
      },
      vishnu: { 
        en: 'Vishnu Bhagwan', 
        hi: 'विष्णु भगवान',
        bangla: 'বিষ্ণু ভগবান',
        kannada: 'ವಿಷ್ಣು ಭಗವಾನ್',
        punjabi: 'ਵਿਸ਼ਨੂ ਭਗਵਾਨ',
        tamil: 'விஷ்ணு பகவான்',
        telugu: 'విష్ణు భగవాన్'
      }
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  // Audio playback state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    // Configure audio session for background playback
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
        console.error('❌ Failed to configure audio session:', error);
      }
    };

    configureAudioSession();
    
    const fetchMedia = async () => {
      try {
        const url = getEndpointUrl('MEDIA_FILES');
        
        const res = await axios.get(url, {
          headers: getAuthHeaders()
        });
        
        if (Array.isArray(res.data)) {
          // Process the media files
          setMediaFiles(res.data || []);
        } else {
          console.log('📱 [AUDIO-VIDEO] Response is not an array, actual type:', typeof res.data);
        }
      } catch (e: any) {
        console.error('❌ [AUDIO-VIDEO] Failed to fetch media files:', e.message);
        
        if (e.response) {
          console.error('❌ [AUDIO-VIDEO] Response status:', e.response.status);
        }
        
        Alert.alert(getTranslation(translations.failedToFetchMedia), e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  // Handle app state changes for background audio
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Resume audio if it was playing before going to background
        if (sound && isPlaying) {
          sound.playAsync();
        }
      }
      // Audio will continue playing in background due to staysActiveInBackground: true
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, isPlaying]);



  // Timer effect to track elapsed time and detect song end
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && sound) {
      interval = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setElapsedTime(status.positionMillis || 0);
            setAudioDuration(status.durationMillis || 0);
            
            // Check if song has ended
            if (status.positionMillis && status.durationMillis && status.positionMillis >= status.durationMillis) {
              setIsPlaying(false);
              setElapsedTime(0);
              // Auto-play next song
              playNextSong();
            }
          }
        } catch (error) {
          console.error('❌ [AUDIO-VIDEO] Error getting audio status:', error);
        }
      }, 1000); // Update every second
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, sound]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlay = (media: MediaFile) => {
    if (media.Link && (media.Link.includes('youtube.com') || media.Link.includes('youtu.be'))) {
      setCurrentMedia(media);
      setModalVisible(true);
      setYoutubePlaying(true);
    } else if (media.MediaType === 'mp3') {
      // For MP3 files, play inline without opening modal
      if (currentMedia?.avld === media.avld && sound) {
        // If same audio is already loaded, toggle play/pause
        if (isPlaying) {
          pauseAudio();
        } else {
          playAudio();
        }
      } else {
        // Load new audio
        setCurrentMedia(media);
        loadAndPlayAudio(media);
      }
    }
  };

  const loadAndPlayAudio = async (media: MediaFile) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      
      // Get presigned URL from backend API
      const apiUrl = getEndpointUrl('S3_AUDIO_URL');
      const response = await axios.get(apiUrl, {
        params: { filename: media.Link },
        headers: getAuthHeaders()
      });
      
              if (response.data.success && response.data.presignedUrl) {
          const presignedUrl = response.data.presignedUrl;
        
        // Load the audio using the presigned URL
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: presignedUrl },
          { shouldPlay: true } // Auto-play when loaded
        );
        
        // Get initial duration
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setAudioDuration(status.durationMillis || 0);
        }
        
        setSound(newSound);
        setIsPlaying(true); // Set playing state to true
        setCurrentlyPlaying(media.avld);
        setIsLoading(false);
      } else {
        throw new Error('Failed to get presigned URL from API');
      }
      
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error loading MP3:', error);
      setIsLoading(false);
      Alert.alert(getTranslation(translations.error), getTranslation(translations.failedToLoadAudio));
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error playing audio:', error);
      Alert.alert(getTranslation(translations.error), getTranslation(translations.failedToPlayAudio));
    }
  };

  const pauseAudio = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error pausing audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error stopping audio:', error);
    }
  };

  // Function to stop current music (for global music control)
  const stopCurrentMusic = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      }
      setSound(null);
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      setCurrentMedia(null);
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error stopping current music:', error);
    }
  };

  const rewindAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, (status.positionMillis || 0) - 10000); // 10 seconds back
          await sound.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error rewinding audio:', error);
    }
  };

  const forwardAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.min((status.durationMillis || 0), (status.positionMillis || 0) + 10000); // 10 seconds forward
          await sound.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error forwarding audio:', error);
    }
  };

  const playPreviousSong = () => {
    // Get the current filtered list for navigation
    const currentFilteredList = getCurrentFilteredList();
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    handlePreviousSong(currentFilteredList);
  };

  const playNextSong = () => {
    // Get the current filtered list for navigation
    const currentFilteredList = getCurrentFilteredList();
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    handleNextSong(currentFilteredList);
  };

  // Helper function to get current filtered list
  const getCurrentFilteredList = () => {
    return mediaFiles
      .filter(media => !selectedDeity || media.Deity === selectedDeity)
      .filter(media => {
        // Filter by selected filter button
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Famous') return media.famous === true;
        return media.Type === selectedFilter;
      })
      .filter(media => {
        // If both toggles are off, show nothing
        if (!audioEnabled && !videoEnabled) return false;
        // If only audio is enabled, show only audio items
        if (audioEnabled && !videoEnabled) return media.Classification === 'Audio';
        // If only video is enabled, show only video items
        if (!audioEnabled && videoEnabled) return media.Classification === 'Video';
        // If both are enabled, show both audio and video items
        return media.Classification === 'Audio' || media.Classification === 'Video';
      })
      .filter(media => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (
          (media.VideoName && media.VideoName.toLowerCase().includes(q)) ||
          (media.Artists && media.Artists.toLowerCase().includes(q)) ||
          (media.Deity && media.Deity.toLowerCase().includes(q)) ||
          (media.Language && media.Language.toLowerCase().includes(q)) ||
          (media.Type && media.Type.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Sort audio first, then video
        if (a.Classification === 'Audio' && b.Classification === 'Video') return -1;
        if (a.Classification === 'Video' && b.Classification === 'Audio') return 1;
        // If both are same type, sort by name
        return (a.VideoName || '').localeCompare(b.VideoName || '');
      });
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeitySelect = (deity: string) => {
    const newDeity = selectedDeity === deity ? null : deity;
    setSelectedDeity(newDeity);
  };

  // Navigation functions for next/previous in filtered list (MP3 only)
  const getCurrentMediaIndex = (filteredList: MediaFile[]) => {
    if (!currentMedia) return -1;
    return filteredList.findIndex(media => media.avld === currentMedia.avld);
  };

  const handleNextSong = (filteredList: MediaFile[]) => {
    if (!currentMedia || filteredList.length === 0) return;
    
    // Get only MP3 files from the filtered list
    const mp3OnlyList = filteredList.filter(media => media.MediaType === 'mp3');
    if (mp3OnlyList.length === 0) return;
    
    const currentIndex = mp3OnlyList.findIndex(media => media.avld === currentMedia.avld);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % mp3OnlyList.length;
    const nextMedia = mp3OnlyList[nextIndex];
    
    handlePlay(nextMedia);
  };

  const handlePreviousSong = (filteredList: MediaFile[]) => {
    if (!currentMedia || filteredList.length === 0) return;
    
    // Get only MP3 files from the filtered list
    const mp3OnlyList = filteredList.filter(media => media.MediaType === 'mp3');
    if (mp3OnlyList.length === 0) return;
    
    const currentIndex = mp3OnlyList.findIndex(media => media.avld === currentMedia.avld);
    if (currentIndex === -1) return;
    
    const previousIndex = currentIndex === 0 ? mp3OnlyList.length - 1 : currentIndex - 1;
    const previousMedia = mp3OnlyList[previousIndex];
    
    handlePlay(previousMedia);
  };

  const filterContent = (
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
      
      <View style={styles.filterRow}>
        {/* Audio/Video Toggle Controls */}
        <View style={styles.toggleContainer}>
          {/* Audio Toggle */}
          <TouchableOpacity 
            style={styles.toggleItem}
            onPress={() => setAudioEnabled(!audioEnabled)}
          >
            <LinearGradient
              colors={audioEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
              style={styles.toggleTrack}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View
                style={[
                  styles.toggleThumb,
                  audioEnabled && styles.toggleThumbActive
                ]}
              />
            </LinearGradient>
            <Text style={styles.toggleLabel}>{getTranslation(translations.audio)}</Text>
          </TouchableOpacity>

          {/* Video Toggle */}
          <TouchableOpacity 
            style={styles.toggleItem}
            onPress={() => setVideoEnabled(!videoEnabled)}
          >
            <LinearGradient
              colors={videoEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
              style={styles.toggleTrack}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View
                style={[
                  styles.toggleThumb,
                  videoEnabled && styles.toggleThumbActive
                ]}
              />
            </LinearGradient>
            <Text style={styles.toggleLabel}>{getTranslation(translations.video)}</Text>
          </TouchableOpacity>
        </View>

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
          ]}>{getTranslation(translations.stopMusic)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder={getTranslation(translations.searchPlaceholder)} 
        extraContent={filterContent} 
        showDailyPujaButton={false}
        onSearchChange={handleSearchChange}
        showSearchBar={false}
        showLanguageToggle={false}
      />
      
      {/* Deity Icons - Horizontal Scrollable */}
      <View style={styles.deityIconsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deityIconsContent}
        >
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Brahma Ji' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Brahma Ji')}
          >
            <Image source={require('@/assets/images/temple/Brahma1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel} numberOfLines={1}>{getTranslation(translations.deityNames.brahma)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Brihaspati Dev' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Brihaspati Dev')}
          >
            <Image source={require('@/assets/images/temple/BrihaspatiIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.brihaspati)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Durga Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Durga Maa')}
          >
            <Image source={require('@/assets/images/temple/Durga1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.durga)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Ganga Maiya' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Ganga Maiya')}
          >
            <Image source={require('@/assets/images/temple/gangaMaiyaaIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.ganga)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Khatu Shyam Ji' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Khatu Shyam Ji')}
          >
            <Image source={require('@/assets/images/temple/KhatuShyamIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.khatuShyam)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Lakshmi Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Lakshmi Maa')}
          >
            <Image source={require('@/assets/images/temple/Lakshmi1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.lakshmi)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Maa Kali' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Maa Kali')}
          >
            <Image source={require('@/assets/images/temple/maaKaliIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.kali)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Mahadev Shiv Ji' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Mahadev Shiv Ji')}
          >
            <Image source={require('@/assets/images/temple/New folder/Shiv4.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.shiv)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Mahaveer Hanuman' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Mahaveer Hanuman')}
          >
            <Image source={require('@/assets/images/temple/Hanuman1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.hanuman)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Navgrah' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Navgrah')}
          >
            <Image source={require('@/assets/images/temple/navgrahIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.navgrah)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Rahu Ketu' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Rahu Ketu')}
          >
            <Image source={require('@/assets/images/temple/RahuKetuIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.rahuKetu)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Saraswati Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Saraswati Maa')}
          >
            <Image source={require('@/assets/images/temple/Saraswati1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.saraswati)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shani Dev' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shani Dev')}
          >
            <Image source={require('@/assets/images/temple/shaniDevIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.shani)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shri Krishna' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shri Krishna')}
          >
            <Image source={require('@/assets/images/temple/Krishna1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.krishna)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shri Ram' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shri Ram')}
          >
            <Image source={require('@/assets/images/temple/Rama1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.ram)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Vighnaharta Ganesh' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Vighnaharta Ganesh')}
          >
            <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.ganesh)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Vishnu Bhagwan' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Vishnu Bhagwan')}
          >
            <Image source={require('@/assets/images/temple/VishnuIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>{getTranslation(translations.deityNames.vishnu)}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Filter Buttons Row */}
      <View style={styles.filterButtonsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsContent}
        >
          {[
            { key: 'All', label: getTranslation(translations.filterButtons.all) },
            { key: 'Aarti', label: getTranslation(translations.filterButtons.aarti) },
            { key: 'Bhajan', label: getTranslation(translations.filterButtons.bhajan) },
            { key: 'Chalisa', label: getTranslation(translations.filterButtons.chalisa) },
            { key: 'Katha', label: getTranslation(translations.filterButtons.katha) },
            { key: 'Paath / Strotam', label: getTranslation(translations.filterButtons.paath) },
            { key: 'Famous', label: getTranslation(translations.filterButtons.famous) }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Media List */}
      <ScrollView style={styles.content}>
         {loading ? (
           <Text>{getTranslation(translations.loading)}</Text>
         ) : (
           <>
             {mediaFiles.length === 0 && (
               <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                 {getTranslation(translations.noMediaFound)}
               </Text>
             )}
             {(() => {
               
               // Create filtered media list for navigation
               const filteredMedia = mediaFiles
                 .filter(media => !selectedDeity || media.Deity === selectedDeity)
                 .filter(media => {
                   // Filter by selected filter button
                   if (selectedFilter === 'All') return true;
                   if (selectedFilter === 'Famous') return media.famous === true;
                   return media.Type === selectedFilter;
                 })
                 .filter(media => {
                   // If both toggles are off, show nothing
                   if (!audioEnabled && !videoEnabled) return false;
                   // If only audio is enabled, show only audio items
                   if (audioEnabled && !videoEnabled) return media.Classification === 'Audio';
                   // If only video is enabled, show only video items
                   if (!audioEnabled && videoEnabled) return media.Classification === 'Video';
                   // If both are enabled, show both audio and video items
                   return media.Classification === 'Audio' || media.Classification === 'Video';
                 })
                 .filter(media => {
                   if (!searchQuery.trim()) return true;
                   const q = searchQuery.trim().toLowerCase();
                   return (
                     (media.VideoName && media.VideoName.toLowerCase().includes(q)) ||
                     (media.Artists && media.Artists.toLowerCase().includes(q)) ||
                     (media.Deity && media.Deity.toLowerCase().includes(q)) ||
                     (media.Language && media.Language.toLowerCase().includes(q)) ||
                     (media.Type && media.Type.toLowerCase().includes(q))
                   );
                 })
                 .sort((a, b) => {
                   // Sort audio first, then video
                   if (a.Classification === 'Audio' && b.Classification === 'Video') return -1;
                   if (a.Classification === 'Video' && b.Classification === 'Audio') return 1;
                   // If both are same type, sort by name
                   return (a.VideoName || '').localeCompare(b.VideoName || '');
                 });
               
               if (filteredMedia.length === 0) {
                 return (
                   <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                     {getTranslation(translations.noMatches)}
                   </Text>
                 );
               }
               
               return filteredMedia.map((media, idx) => {
                 return (
                   <TouchableOpacity
                     key={media.Link || idx}
                     style={[
                       styles.mediaTile,
                       media.Classification === 'Audio' && styles.audioTile,
                       media.Classification === 'Video' && styles.videoTile
                     ]}
                     onPress={() => handlePlay(media)}
                   >
                     {/* Audio/Video Icon with Type and Language */}
                     <View style={styles.mediaIconContainer}>
                       {media.Classification === 'Audio' ? (
                         <MaterialCommunityIcons name="music-note" size={20} color="#FF6A00" />
                       ) : (
                         <MaterialCommunityIcons name="video" size={20} color="#FF6A00" />
                       )}
                       <Text style={styles.mediaIconType}>{media.Type}</Text>
                       <Text style={styles.mediaIconLanguage}>{media.Language}</Text>
                     </View>
                     
                     {/* Media Content */}
                     <View style={styles.mediaContent}>
                       <Text style={styles.mediaTitle}>{media.VideoName || getTranslation(translations.untitled)}</Text>
                       <Text style={styles.mediaType}>
                         {media.Deity ? media.Deity : ''}
                       </Text>
                       {(media.Duration || media.Artists) && (
                         <Text style={styles.mediaDetails}>
                           {media.Duration ? media.Duration : ''}
                           {media.Duration && media.Artists ? ' | ' : ''}
                           {media.Artists ? media.Artists : ''}
                         </Text>
                       )}
                     </View>
                     
                     {/* Play Button - Different for MP3 vs Other Media */}
                     <View style={styles.playButtonContainer}>
                       {media.MediaType === 'mp3' ? (
                         // Inline audio controls for MP3
                         <View style={styles.audioControlsInline}>
                           {currentMedia?.avld === media.avld && isLoading ? (
                             <Text style={styles.loadingTextInline}>{getTranslation(translations.loading)}</Text>
                           ) : currentMedia?.avld === media.avld && sound ? (
                             <View style={styles.audioControlsContainer}>
                               {/* Timer Display - Above Audio Controls */}
                               <Text style={styles.elapsedTimeText}>
                                 {formatTime(elapsedTime)}
                               </Text>
                               
                               {/* Main Audio Controls - Middle */}
                               <View style={styles.audioControlsInline}>
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={rewindAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name="rewind-10"
                                     size={18}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={isPlaying ? pauseAudio : playAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name={isPlaying ? 'pause' : 'play'}
                                     size={24}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={forwardAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name="fast-forward-10"
                                     size={18}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                               </View>
                               
                               {/* Forward/Back Navigation - Below Audio Controls */}
                               <View style={styles.navigationControlsInline}>
                                 <TouchableOpacity
                                   style={styles.navigationButtonInline}
                                   onPress={playPreviousSong}
                                 >
                                   <MaterialCommunityIcons
                                     name="skip-previous"
                                     size={16}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.navigationButtonInline}
                                   onPress={playNextSong}
                                 >
                                   <MaterialCommunityIcons
                                     name="skip-next"
                                     size={16}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                               </View>
                             </View>
                           ) : (
                             <MaterialCommunityIcons name="play-circle" size={32} color="#FF6A00" />
                           )}
                         </View>
                       ) : (
                         // Regular play button for non-MP3 media
                         <MaterialCommunityIcons name="play-circle" size={32} color="#FF6A00" />
                       )}
                     </View>
                   </TouchableOpacity>
                 );
               });
             })()}
          </>
        )}
      </ScrollView>
      {/* YouTube Modal - Only for YouTube videos */}
      <Modal
        animationType="slide"
        visible={modalVisible && !!currentMedia?.Link && (currentMedia.Link.includes('youtube.com') || currentMedia.Link.includes('youtu.be'))}
        onRequestClose={() => {
          setModalVisible(false);
          setCurrentMedia(null);
          setYoutubePlaying(false);
        }}
      >
        <View style={styles.videoModalBackground}>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setCurrentMedia(null);
              setYoutubePlaying(false);
              // Stop and unload audio if playing
              if (sound) {
                sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
                setIsLoading(false);
              }
            }}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {currentMedia && currentMedia.Link && (
            currentMedia.Link.includes('youtube.com') || currentMedia.Link.includes('youtu.be') ? (
              <YoutubePlayer
                height={300}
                play={youtubePlaying}
                videoId={extractYouTubeId(currentMedia.Link)}
                forceAndroidAutoplay
                webViewProps={{ allowsInlineMediaPlayback: true }}
              />
            ) : currentMedia.MediaType === 'mp3' ? (
              <View style={styles.audioPlayerContainer}>
                <View style={styles.audioInfo}>
                  <MaterialCommunityIcons name="music-note" size={48} color="#FF6A00" />
                  <Text style={styles.audioTitle}>{currentMedia.VideoName}</Text>
                  <Text style={styles.audioDetails}>
                    {currentMedia.Type} | {currentMedia.Language}
                    {currentMedia.Deity ? ` | ${currentMedia.Deity}` : ''}
                  </Text>
                  {currentMedia.Artists && (
                    <Text style={styles.audioArtist}>{getTranslation(translations.by)} {currentMedia.Artists}</Text>
                  )}
                </View>
                
                <View style={styles.audioControls}>
                  {isLoading ? (
                    <Text style={styles.loadingText}>{getTranslation(translations.loadingAudio)}</Text>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.audioControlButton}
                        onPress={isPlaying ? pauseAudio : playAudio}
                      >
                        <MaterialCommunityIcons
                          name={isPlaying ? 'pause' : 'play'}
                          size={32}
                          color="#FF6A00"
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.audioControlButton}
                        onPress={stopAudio}
                      >
                        <MaterialCommunityIcons
                          name="stop"
                          size={32}
                          color="#FF6A00"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>{getTranslation(translations.unsupportedMedia)}</Text>
            )
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  // Deity Icons Styles
  deityIconsContainer: {
    position: 'absolute',
    top: 170, // Moved up 10px from 180 to 170
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  deityIconsContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  deityIconItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    minWidth: 60,
    minHeight: 60,
  },
  deityIconImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  deityIconLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  deityIconItemSelected: {
    backgroundColor: 'rgba(255, 106, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  filterStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 0, 0.3)',
  },
  filterStatusText: {
    fontSize: 12,
    color: '#FF6A00',
    fontWeight: '500',
  },
  clearFilterButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearFilterText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  filterButtonsContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  filterButtonsContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  stopMusicButton: {
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    alignSelf: 'center',
  },
  stopMusicButtonActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  stopMusicButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  stopMusicButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopMusicButtonTextActive: {
    color: 'white',
  },
  stopMusicButtonTextDisabled: {
    color: '#999',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topContent: {
    backgroundColor: '#fff',
    paddingBottom: 0,
    paddingTop: 0,
  },
  filterContainer: {
    marginBottom: 20,
    marginTop: -10, // Moved up 10px
    position: 'relative',
    width: '88%',
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  toggleItem: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 21,
  },
  toggleLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },

  content: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  videoModalBackground: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  // Media Tile Styles
  mediaTile: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioTile: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  videoTile: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  mediaIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    padding: 6,
  },
  mediaIconType: {
    fontSize: 11,
    color: '#FF6A00',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  mediaIconLanguage: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 1,
  },
  mediaContent: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mediaType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  mediaDetails: {
    fontSize: 10,
    color: '#888',
  },
  playButtonContainer: {
    marginLeft: 16,
  },
  // Audio Player Styles
  audioPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  audioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  audioDetails: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
  },
  audioArtist: {
    fontSize: 18,
    color: '#FF6A00',
    textAlign: 'center',
    fontWeight: '600',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  audioControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  // Inline Audio Controls Styles
  audioControlsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  audioControlButtonInline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  loadingTextInline: {
    fontSize: 12,
    color: '#FF6A00',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Additional inline audio styles
  elapsedTimeText: {
    fontSize: 8,
    color: '#FF6A00',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  navigationControlsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  navigationButtonInline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  audioControlsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
}); 