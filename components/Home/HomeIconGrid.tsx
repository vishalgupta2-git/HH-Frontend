import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAudioVideoModal } from '@/contexts/AudioVideoModalContext';
import { useLanguage } from '@/contexts/LanguageContext';

const getIcons = (currentLanguage: string, showAudioVideoModal?: () => void) => [
  { 
    label: currentLanguage === 'hindi' ? 'मेरा मंदिर' : 
           currentLanguage === 'bangla' ? 'আমার মন্দির' :
           currentLanguage === 'kannada' ? 'ನನ್ನ ದೇವಾಲಯ' :
           currentLanguage === 'punjabi' ? 'ਮੇਰਾ ਮੰਦਰ' :
           currentLanguage === 'tamil' ? 'என் கோவில்' :
           currentLanguage === 'telugu' ? 'నా దేవాలయం' :
           'My Virtual Temple', 
    image: require('@/assets/images/icons/home page icons/temple.png'),
    route: '/screens/testtemple'
  },
  { 
    label: currentLanguage === 'hindi' ? 'पूजा' : 
           currentLanguage === 'bangla' ? 'পূজা' :
           currentLanguage === 'kannada' ? 'ಪೂಜೆ' :
           currentLanguage === 'punjabi' ? 'ਪੂਜਾ' :
           currentLanguage === 'tamil' ? 'பூஜை' :
           currentLanguage === 'telugu' ? 'పూజ' :
           'Puja', 
    image: require('@/assets/images/icons/home page icons/puja.png'),
    route: '/screens/puja'
  },
  { 
    label: currentLanguage === 'hindi' ? 'दान' : 
           currentLanguage === 'bangla' ? 'দান' :
           currentLanguage === 'kannada' ? 'ದಾನ' :
           currentLanguage === 'punjabi' ? 'ਦਾਨ' :
           currentLanguage === 'tamil' ? 'தானம்' :
           currentLanguage === 'telugu' ? 'దానం' :
           'Donation', 
    image: require('@/assets/images/icons/home page icons/charity.png'),
    route: '/screens/donation'
  },
  { 
    label: currentLanguage === 'hindi' ? 'मन्नत' : 
           currentLanguage === 'bangla' ? 'মননত' :
           currentLanguage === 'kannada' ? 'ಮನ್ನತ್' :
           currentLanguage === 'punjabi' ? 'ਮੰਨਤ' :
           currentLanguage === 'tamil' ? 'மன்னதம்' :
           currentLanguage === 'telugu' ? 'మన్నత్' :
           'Mannat', 
    image: require('@/assets/images/icons/home page icons/horoscope.png'),
    route: '/screens/mannat'
  },
  { 
    label: currentLanguage === 'hindi' ? 'भक्ति संगीत' : 
           currentLanguage === 'bangla' ? 'ভক্তি সঙ্গীত' :
           currentLanguage === 'kannada' ? 'ಭಕ್ತಿ ಸಂಗೀತ' :
           currentLanguage === 'punjabi' ? 'ਭਕਤੀ ਸੰਗੀਤ' :
           currentLanguage === 'tamil' ? 'பக்தி இசை' :
           currentLanguage === 'telugu' ? 'భక్తి సంగీతం' :
           'Divine Music', 
    icon: 'music',
    route: showAudioVideoModal ? 'modal' : '/audio-video',
    onPress: showAudioVideoModal
  },
  { 
    label: currentLanguage === 'hindi' ? 'पूजा मार्गदर्शन' : 
           currentLanguage === 'bangla' ? 'পূজা নির্দেশনা' :
           currentLanguage === 'kannada' ? 'ಪೂಜೆ ಮಾರ್ಗದರ್ಶನ' :
           currentLanguage === 'punjabi' ? 'ਪੂਜਾ ਮਾਰਗਦਰਸ਼ਨ' :
           currentLanguage === 'tamil' ? 'பூஜை வழிகாட்டுதல்' :
           currentLanguage === 'telugu' ? 'పూజ మార్గదర్శనం' :
           'Puja Guidance', 
    image: require('@/assets/images/icons/home page icons/puja-guidance.png'),
    route: '/screens/puja-guidance'
  },
  { 
    label: currentLanguage === 'hindi' ? 'विशेष दिन पूजा' : 
           currentLanguage === 'bangla' ? 'বিশেষ দিন পূজা' :
           currentLanguage === 'kannada' ? 'ವಿಶೇಷ ದಿನ ಪೂಜೆ' :
           currentLanguage === 'punjabi' ? 'ਵਿਸ਼ੇਸ਼ ਦਿਨ ਪੂਜਾ' :
           currentLanguage === 'tamil' ? 'சிறப்பு நாள் பூஜை' :
           currentLanguage === 'telugu' ? 'ప్రత్యేక రోజు పూజ' :
           'Special Day Puja', 
    image: require('@/assets/images/icons/home page icons/special-day-puja.png'),
    route: '/screens/special-puja'
  },
  { 
    label: currentLanguage === 'hindi' ? 'प्रोफेशनल पूजा' : 
           currentLanguage === 'bangla' ? 'পেশাদার পূজা' :
           currentLanguage === 'kannada' ? 'ವೃತ್ತಿಪರ ಪೂಜೆ' :
           currentLanguage === 'punjabi' ? 'ਪੇਸ਼ੇਵਰ ਪੂਜਾ' :
           currentLanguage === 'tamil' ? 'தொழில்முறை பூஜை' :
           currentLanguage === 'telugu' ? 'వృత్తిపరమైన పూజ' :
           'Professional Puja', 
    image: require('@/assets/images/icons/home page icons/professional-puja.jpg'),
    route: '/screens/professional-puja'
  },
];

const numColumns = 4;
const tileSize = (Dimensions.get('window').width - 72) / numColumns;

export default function HomeIconGrid() {
  const router = useRouter();
  const { showAudioVideoModal } = useAudioVideoModal();
  const { currentLanguage } = useLanguage();
  const icons = getIcons(currentLanguage, showAudioVideoModal);
  
  // Debug: Log when isHindi changes
  return (
    <View style={styles.gridWrapper}>
      <View style={styles.grid}>
        {icons.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={styles.tile}
            activeOpacity={0.8}
            onPress={() => {
              if (item.onPress) {
                item.onPress();
              } else {
                router.push(item.route as any);
              }
            }}
          >
            <View style={styles.iconCircle}>
              {item.image ? (
                <Image source={item.image} style={styles.iconImage} resizeMode="contain" />
              ) : item.icon ? (
                <IconSymbol size={36} name={item.icon} color="#FFA040" />
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    marginTop: -90,
    alignItems: 'center',
    zIndex: 2,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '92%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tile: {
    width: tileSize,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF6EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FFD6A0',
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  label: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
  },
}); 