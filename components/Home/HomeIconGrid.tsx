import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const icons = [
  { label: 'My Virtual Temple', image: require('@/assets/images/icons/home page icons/temple.png') },
  { label: 'Puja', image: require('@/assets/images/icons/home page icons/puja.png') },
  { label: 'Donation', image: require('@/assets/images/icons/home page icons/charity.png') },
  { label: 'Mannat', image: require('@/assets/images/icons/home page icons/horoscope.png') },
  { label: 'Virtual Darshan', image: require('@/assets/images/icons/home page icons/virtual-darshan.png') },
  { label: 'Puja Guidance', image: require('@/assets/images/icons/home page icons/puja-guidance.png') },
  { label: 'Special Day Puja', image: require('@/assets/images/icons/home page icons/special-day-puja.png') },
  { label: 'Professional Puja', image: require('@/assets/images/icons/home page icons/professional-puja.jpg') },
];

const numColumns = 4;
const tileSize = (Dimensions.get('window').width - 48) / numColumns;

export default function HomeIconGrid() {
  const router = useRouter();
  return (
    <View style={styles.gridWrapper}>
      <View style={styles.grid}>
        {icons.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={styles.tile}
            activeOpacity={0.8}
            onPress={async () => {
              if (item.label === 'Special Day Puja') {
                router.push('/screens/special-puja');
              } else if (item.label === 'Donation') {
                router.push('/screens/donation');
              } else if (item.label === 'My Virtual Temple') {
                router.push('/screens/create-temple');
              } else if (item.label === 'Puja') {
                router.push('/screens/puja');
              } else if (item.label === 'Mannat') {
                router.push('/screens/mannat');
              } else if (item.label === 'Virtual Darshan') {
                router.push('/screens/virtual-darshan');
              } else if (item.label === 'Puja Guidance') {
                router.push('/screens/puja-guidance');
              } else if (item.label === 'Professional Puja') {
                router.push('/screens/professional-puja');
              }
            }}
          >
            <View style={styles.iconCircle}>
              <Image source={item.image} style={styles.iconImage} resizeMode="contain" />
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