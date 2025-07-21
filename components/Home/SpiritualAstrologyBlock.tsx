import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import ReferralConnectBlock, { SocialRow } from './ReferralConnectBlock';

const spiritualItems = [
  { label: 'Vedas', image: require('@/assets/images/icons/home page icons/vedas.jpg') },
  { label: 'Dhams', image: require('@/assets/images/icons/home page icons/dhams.png') },
  { label: 'Goddesses', image: require('@/assets/images/icons/home page icons/goddesses.webp') },
  { label: 'God', image: require('@/assets/images/icons/home page icons/god.jpg') },
];

const astrologyItems = [
  { label: 'Kundli', image: require('@/assets/images/icons/home page icons/kundli.png') },
  { label: 'Numerology', image: require('@/assets/images/icons/home page icons/numerology.png') },
  { label: 'Astrology', image: require('@/assets/images/icons/home page icons/astrology.png') },
  { label: 'Vastu', image: require('@/assets/images/icons/home page icons/vastu.png') },
  { label: 'Talk To Priest', image: require('@/assets/images/icons/home page icons/talk-to-priest.jpg') },
];

const tileWidth = (Dimensions.get('window').width - 48) / 2;

export default function SpiritualAstrologyBlock() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Spiritual Information Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Spiritual Information</Text>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.spiritualRow}>
        {spiritualItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.spiritualItem}
            activeOpacity={0.8}
            onPress={() => router.push(`/screens/${item.label.toLowerCase().replace(/ /g, '-').replace('talk to priest', 'talk-to-priest')}`)}
          >
            <Image source={item.image} style={styles.spiritualImage} />
            <Text style={styles.spiritualLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Astrology Services Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }] }>
        <Text style={styles.sectionTitle}>Astrology Services</Text>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.astrologyGrid}>
        {astrologyItems.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.astrologyTile, idx === 4 ? styles.fullWidthTile : null]}
            activeOpacity={0.8}
            onPress={() => router.push(`/screens/${item.label.toLowerCase().replace(/ /g, '-').replace('talk to priest', 'talk-to-priest')}`)}
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
    marginTop: 24,
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
  spiritualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spiritualItem: {
    alignItems: 'center',
    flex: 1,
  },
  spiritualImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#F8F8F8',
  },
  spiritualLabel: {
    fontSize: 13,
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