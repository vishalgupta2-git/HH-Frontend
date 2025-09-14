import React from 'react';
import { SafeAreaView, StatusBar, Dimensions, Image, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NumerologyCalculator from '../components/NumerologyCalculator';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

export const options = { headerShown: false };

const NumerologyScreen: React.FC = () => {
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
  
  const translations = {
    headerTitle: { 
      en: 'Hindu Heritage', 
      hi: 'द हिंदू हेरिटेज',
      bangla: 'হিন্দু হেরিটেজ',
      kannada: 'ಹಿಂದೂ ಹೆರಿಟೇಜ್',
      punjabi: 'ਹਿੰਦੂ ਹੈਰੀਟੇਜ',
      tamil: 'ஹிந்து ஹெரிடேஜ்',
      telugu: 'హిందూ హెరిటేజ్'
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Vastu screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>{getTranslation(translations.headerTitle)}</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        <NumerologyCalculator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8 * 1.2, // 120% size
    height: 120 * 0.8 * 1.2, // 120% size
    left: width * -0.25 * 0.8,
    bottom: 0, // Same positioning as home screen
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 0, // Remove padding since NumerologyCalculator has its own
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flex: 1, // Allow the card to expand
  },
});

export default NumerologyScreen; 