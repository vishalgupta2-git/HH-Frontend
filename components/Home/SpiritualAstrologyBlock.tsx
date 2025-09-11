import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import ReferralConnectBlock, { SocialRow } from './ReferralConnectBlock';

interface SpiritualItem {
  label: string;
  image: any;
  isEmoji?: boolean;
  route: string;
}

const getSpiritualItems = (isHindi: boolean): SpiritualItem[] => [
  { label: isHindi ? 'नवरात्रि' : 'Navratri', image: require('@/assets/images/icons/home page icons/Navratri.png'), route: '/screens/navratri-2025' },
  { label: isHindi ? 'वेद' : 'Vedas', image: require('@/assets/images/icons/home page icons/vedas.png'), route: '/screens/vedas' },
  { label: isHindi ? 'धाम और यात्रा' : 'Dhams and Yatras', image: require('@/assets/images/icons/home page icons/dhams.png'), route: '/screens/dhams' },
  { label: isHindi ? 'पवित्र पुस्तकें' : 'Holy Books', image: require('@/assets/images/icons/home page icons/HolyBooksIcon.png'), route: '/screens/holy-books' },
  { label: isHindi ? 'देवी-देवता' : 'Gods & Godesses', image: require('@/assets/images/icons/home page icons/godsAndGodessesIcon.png'), route: '/screens/gods-and-godesses' },
  { label: isHindi ? 'प्रसिद्ध मंदिर' : 'Famous Temples', image: require('@/assets/images/icons/home page icons/FamousTemple.png'), route: '/screens/famous-temples' },
  { label: isHindi ? 'व्रत और त्योहार' : 'Fasts & Festivals', image: require('@/assets/images/icons/home page icons/Fasts&Festivals.png'), route: '/screens/fasts-and-festivals' },
  { label: isHindi ? 'श्लोक' : 'Shalokas', image: require('@/assets/images/icons/home page icons/shalokasIcon.png'), route: '/screens/shalokas' },
  { label: isHindi ? 'मंत्र' : 'Mantras', image: require('@/assets/images/icons/home page icons/mantrasIcon.png'), route: '/screens/mantras' },
  { label: isHindi ? 'कैलेंडर' : 'Calendar', image: require('@/assets/images/icons/home page icons/hinduCalendarIcon.png'), route: '/screens/hindu-calendar' },
  { label: isHindi ? 'साधु संत' : 'Sadhu Sant', image: require('@/assets/images/icons/home page icons/Sadhu.png'), route: '/screens/sadhu-sant' },
];

const getAstrologyItems = (isHindi: boolean) => [
  { label: isHindi ? 'कुंडली' : 'Kundli', image: require('@/assets/images/icons/home page icons/kundli.png'), route: '/screens/kundli' },
  { label: isHindi ? 'अंक ज्योतिष' : 'Numerology', image: require('@/assets/images/icons/home page icons/numerology.png'), route: '/screens/numerology' },
  { label: isHindi ? 'ज्योतिष' : 'Astrology', image: require('@/assets/images/icons/home page icons/astrology.png'), route: '/screens/astrology' },
  { label: isHindi ? 'वास्तु' : 'Vastu', image: require('@/assets/images/icons/home page icons/vastu.png'), route: '/screens/vastu' },
  { label: isHindi ? 'पुजारी से बात करें' : 'Talk To Priest', image: require('@/assets/images/icons/home page icons/talk-to-priest.jpg'), route: '/screens/talk-to-priest' },
];

const tileWidth = (Dimensions.get('window').width - 60) / 2;

export default function SpiritualAstrologyBlock({ isHindi = false }: { isHindi?: boolean }) {
  const router = useRouter();
  const spiritualItems = getSpiritualItems(isHindi);
  const astrologyItems = getAstrologyItems(isHindi);
  

  return (
    <View style={styles.container}>
      {/* Spiritual Information Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {isHindi ? 'आध्यात्मिक जानकारी' : 'Spiritual Information'}
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
          {isHindi ? 'ज्योतिष सेवाएं' : 'Astrology Services'}
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