import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
// import ReferralConnectBlock, { SocialRow } from './ReferralConnectBlock';

interface SpiritualItem {
  label: string;
  image: any;
  isEmoji?: boolean;
  route: string;
}

const getSpiritualItems = (currentLanguage: string): SpiritualItem[] => [
  { 
    label: currentLanguage === 'hindi' ? 'वेद' : 
           currentLanguage === 'bangla' ? 'বেদ' :
           currentLanguage === 'kannada' ? 'ವೇದಗಳು' :
           currentLanguage === 'punjabi' ? 'ਵੇਦ' :
           currentLanguage === 'tamil' ? 'வேதங்கள்' :
           currentLanguage === 'telugu' ? 'వేదాలు' :
           'Vedas', 
    image: require('@/assets/images/icons/home page icons/vedas.png'), 
    route: '/screens/vedas' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'धाम और यात्रा' : 
           currentLanguage === 'bangla' ? 'ধাম ও যাত্রা' :
           currentLanguage === 'kannada' ? 'ಧಾಮಗಳು ಮತ್ತು ಯಾತ್ರೆಗಳು' :
           currentLanguage === 'punjabi' ? 'ਧਾਮ ਅਤੇ ਯਾਤਰਾ' :
           currentLanguage === 'tamil' ? 'தாமங்கள் மற்றும் யாத்திரைகள்' :
           currentLanguage === 'telugu' ? 'ధామాలు మరియు యాత్రలు' :
           'Dhams and Yatras', 
    image: require('@/assets/images/icons/home page icons/dhams.png'), 
    route: '/screens/dhams' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'पवित्र पुस्तकें' : 
           currentLanguage === 'bangla' ? 'পবিত্র গ্রন্থ' :
           currentLanguage === 'kannada' ? 'ಪವಿತ್ರ ಗ್ರಂಥಗಳು' :
           currentLanguage === 'punjabi' ? 'ਪਵਿੱਤਰ ਪੁਸਤਕਾਂ' :
           currentLanguage === 'tamil' ? 'புனித நூல்கள்' :
           currentLanguage === 'telugu' ? 'పవిత్ర గ్రంథాలు' :
           'Holy Books', 
    image: require('@/assets/images/icons/home page icons/HolyBooksIcon.png'), 
    route: '/screens/holy-books' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'देवी-देवता' : 
           currentLanguage === 'bangla' ? 'দেবী-দেবতা' :
           currentLanguage === 'kannada' ? 'ದೇವಿ-ದೇವತೆಗಳು' :
           currentLanguage === 'punjabi' ? 'ਦੇਵੀ-ਦੇਵਤੇ' :
           currentLanguage === 'tamil' ? 'தேவி-தேவர்கள்' :
           currentLanguage === 'telugu' ? 'దేవి-దేవతలు' :
           'Gods & Godesses', 
    image: require('@/assets/images/icons/home page icons/godsAndGodessesIcon.png'), 
    route: '/screens/gods-and-godesses' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'प्रसिद्ध मंदिर' : 
           currentLanguage === 'bangla' ? 'বিখ্যাত মন্দির' :
           currentLanguage === 'kannada' ? 'ಪ್ರಸಿದ್ಧ ದೇವಾಲಯಗಳು' :
           currentLanguage === 'punjabi' ? 'ਪ੍ਰਸਿੱਧ ਮੰਦਰ' :
           currentLanguage === 'tamil' ? 'பிரபல கோவில்கள்' :
           currentLanguage === 'telugu' ? 'ప్రసిద్ధ దేవాలయాలు' :
           'Famous Temples', 
    image: require('@/assets/images/icons/home page icons/FamousTemple.png'), 
    route: '/screens/famous-temples' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'व्रत और त्योहार' : 
           currentLanguage === 'bangla' ? 'ব্রত ও উৎসব' :
           currentLanguage === 'kannada' ? 'ವ್ರತಗಳು ಮತ್ತು ಹಬ್ಬಗಳು' :
           currentLanguage === 'punjabi' ? 'ਵਰਤ ਅਤੇ ਤਿਉਹਾਰ' :
           currentLanguage === 'tamil' ? 'விரதங்கள் மற்றும் திருவிழாக்கள்' :
           currentLanguage === 'telugu' ? 'వ్రతాలు మరియు పండగలు' :
           'Fasts & Festivals', 
    image: require('@/assets/images/icons/home page icons/Fasts&Festivals.png'), 
    route: '/screens/fasts-and-festivals' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'श्लोक' : 
           currentLanguage === 'bangla' ? 'শ্লোক' :
           currentLanguage === 'kannada' ? 'ಶ್ಲೋಕಗಳು' :
           currentLanguage === 'punjabi' ? 'ਸ਼ਲੋਕ' :
           currentLanguage === 'tamil' ? 'சுலோகங்கள்' :
           currentLanguage === 'telugu' ? 'శ్లోకాలు' :
           'Shalokas', 
    image: require('@/assets/images/icons/home page icons/shalokasIcon.png'), 
    route: '/screens/shalokas' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'मंत्र' : 
           currentLanguage === 'bangla' ? 'মন্ত্র' :
           currentLanguage === 'kannada' ? 'ಮಂತ್ರಗಳು' :
           currentLanguage === 'punjabi' ? 'ਮੰਤਰ' :
           currentLanguage === 'tamil' ? 'மந்திரங்கள்' :
           currentLanguage === 'telugu' ? 'మంత్రాలు' :
           'Mantras', 
    image: require('@/assets/images/icons/home page icons/mantrasIcon.png'), 
    route: '/screens/mantras' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'कैलेंडर' : 
           currentLanguage === 'bangla' ? 'পঞ্জিকা' :
           currentLanguage === 'kannada' ? 'ಕ್ಯಾಲೆಂಡರ್' :
           currentLanguage === 'punjabi' ? 'ਕੈਲੰਡਰ' :
           currentLanguage === 'tamil' ? 'காலண்டர்' :
           currentLanguage === 'telugu' ? 'క్యాలెండర్' :
           'Calendar', 
    image: require('@/assets/images/icons/home page icons/hinduCalendarIcon.png'), 
    route: '/screens/hindu-calendar' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'साधु संत' : 
           currentLanguage === 'bangla' ? 'সাধু সন্ত' :
           currentLanguage === 'kannada' ? 'ಸಾಧು ಸಂತರು' :
           currentLanguage === 'punjabi' ? 'ਸਾਧੂ ਸੰਤ' :
           currentLanguage === 'tamil' ? 'சாது சந்தர்கள்' :
           currentLanguage === 'telugu' ? 'సాధు సంతులు' :
           'Sadhu Sant', 
    image: require('@/assets/images/icons/home page icons/Sadhu.png'), 
    route: '/screens/sadhu-sant' 
  },
];

const getAstrologyItems = (currentLanguage: string) => [
  { 
    label: currentLanguage === 'hindi' ? 'कुंडली' : 
           currentLanguage === 'bangla' ? 'কুন্ডলী' :
           currentLanguage === 'kannada' ? 'ಕುಂಡಲಿ' :
           currentLanguage === 'punjabi' ? 'ਕੁੰਡਲੀ' :
           currentLanguage === 'tamil' ? 'குண்டலி' :
           currentLanguage === 'telugu' ? 'కుండలి' :
           'Kundli', 
    image: require('@/assets/images/icons/home page icons/kundli.png'), 
    route: '/screens/kundli' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'अंक ज्योतिष' : 
           currentLanguage === 'bangla' ? 'সংখ্যাতত্ত্ব' :
           currentLanguage === 'kannada' ? 'ಅಂಕ ಜ್ಯೋತಿಷ್ಯ' :
           currentLanguage === 'punjabi' ? 'ਅੰਕ ਜੋਤਿਸ਼' :
           currentLanguage === 'tamil' ? 'எண் ஜோதிடம்' :
           currentLanguage === 'telugu' ? 'అంక జ్యోతిష్యం' :
           'Numerology', 
    image: require('@/assets/images/icons/home page icons/numerology.png'), 
    route: '/screens/numerology' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'ज्योतिष' : 
           currentLanguage === 'bangla' ? 'জ্যোতিষ শাস্ত্র' :
           currentLanguage === 'kannada' ? 'ಜ್ಯೋತಿಷ್ಯ' :
           currentLanguage === 'punjabi' ? 'ਜੋਤਿਸ਼' :
           currentLanguage === 'tamil' ? 'ஜோதிடம்' :
           currentLanguage === 'telugu' ? 'జ్యోతిష్యం' :
           'Astrology', 
    image: require('@/assets/images/icons/home page icons/astrology.png'), 
    route: '/screens/astrology' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'वास्तु' : 
           currentLanguage === 'bangla' ? 'বাস্তু' :
           currentLanguage === 'kannada' ? 'ವಾಸ್ತು' :
           currentLanguage === 'punjabi' ? 'ਵਾਸਤੂ' :
           currentLanguage === 'tamil' ? 'வாஸ்து' :
           currentLanguage === 'telugu' ? 'వాస్తు' :
           'Vastu', 
    image: require('@/assets/images/icons/home page icons/vastu.png'), 
    route: '/screens/vastu' 
  },
  { 
    label: currentLanguage === 'hindi' ? 'पुजारी से बात करें' : 
           currentLanguage === 'bangla' ? 'পুরোহিতের সাথে কথা বলুন' :
           currentLanguage === 'kannada' ? 'ಪುಜಾರಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ' :
           currentLanguage === 'punjabi' ? 'ਪੁਜਾਰੀ ਨਾਲ ਗੱਲ ਕਰੋ' :
           currentLanguage === 'tamil' ? 'பூஜாரியுடன் பேசுங்கள்' :
           currentLanguage === 'telugu' ? 'పూజారితో మాట్లాడండి' :
           'Talk To Priest', 
    image: require('@/assets/images/icons/home page icons/talk-to-priest.jpg'), 
    route: '/screens/talk-to-priest' 
  },
];

const tileWidth = (Dimensions.get('window').width - 60) / 2;

export default function SpiritualAstrologyBlock() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const spiritualItems = getSpiritualItems(currentLanguage);
  const astrologyItems = getAstrologyItems(currentLanguage);
  

  return (
    <View style={styles.container}>
      {/* Spiritual Information Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {currentLanguage === 'hindi' ? 'आध्यात्मिक जानकारी' : 
           currentLanguage === 'bangla' ? 'আধ্যাত্মিক তথ্য' :
           currentLanguage === 'kannada' ? 'ಆಧ್ಯಾತ್ಮಿಕ ಮಾಹಿತಿ' :
           currentLanguage === 'punjabi' ? 'ਆਧਿਆਤਮਿਕ ਜਾਣਕਾਰੀ' :
           currentLanguage === 'tamil' ? 'ஆன்மீக தகவல்' :
           currentLanguage === 'telugu' ? 'ఆధ్యాత్మిక సమాచారం' :
           'Spiritual Information'}
        </Text>
        <View style={styles.sectionLine} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spiritualScrollContent}>
        {spiritualItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.spiritualItem}
            activeOpacity={0.8}
            onPress={() => {
              router.push(item.route as any);
            }}
          >
            {item.isEmoji ? (
              <Text style={styles.spiritualEmoji}>{item.image}</Text>
            ) : (
              <Image source={item.image} style={styles.spiritualImage} />
            )}
            <Text style={styles.spiritualLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Astrology Services Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>
          {currentLanguage === 'hindi' ? 'ज्योतिष सेवाएं' : 
           currentLanguage === 'bangla' ? 'জ্যোতিষ সেবা' :
           currentLanguage === 'kannada' ? 'ಜ್ಯೋತಿಷ್ಯ ಸೇವೆಗಳು' :
           currentLanguage === 'punjabi' ? 'ਜੋਤਿਸ਼ ਸੇਵਾਵਾਂ' :
           currentLanguage === 'tamil' ? 'ஜோதிட சேவைகள்' :
           currentLanguage === 'telugu' ? 'జ్యోతిష్య సేవలు' :
           'Astrology Services'}
        </Text>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.astrologyGrid}>
        {astrologyItems.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.astrologyTile, idx === 4 ? styles.fullWidthTile : null]}
            activeOpacity={0.8}
            onPress={() => {
              router.push(item.route as any);
            }}
          >
            <Image source={item.image} style={styles.astrologyIcon} />
            <Text style={styles.astrologyLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* ReferralConnectBlock and SocialRow removed from here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 4,
  },
  spiritualScrollContent: {
    paddingRight: 12,
  },
  spiritualItem: {
    alignItems: 'center',
    width: 92,
    marginRight: 8,
  },
  spiritualImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#F8F8F8',
  },
  spiritualEmoji: {
    fontSize: 50,
    marginBottom: 4,
    textAlign: 'center',
    width: 50,
    height: 50,
  },
  spiritualLabel: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
    textAlign: 'center',
  },
  astrologyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  astrologyTile: {
    width: tileWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidthTile: {
    width: '100%',
  },
  astrologyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F8F8F8',
  },
  astrologyLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
}); 