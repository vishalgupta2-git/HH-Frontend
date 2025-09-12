import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAudioVideoModal } from '@/contexts/AudioVideoModalContext';

const getIcons = (isHindi: boolean, showAudioVideoModal?: () => void) => [
  { 
    label: isHindi ? 'मेरा मंदिर' : 'My Virtual Temple', 
    image: require('@/assets/images/icons/home page icons/temple.png'),
    route: '/screens/testtemple'
  },
  { 
    label: isHindi ? 'पूजा' : 'Puja', 
    image: require('@/assets/images/icons/home page icons/puja.png'),
    route: '/screens/puja'
  },
  { 
    label: isHindi ? 'दान' : 'Donation', 
    image: require('@/assets/images/icons/home page icons/charity.png'),
    route: '/screens/donation'
  },
  { 
    label: isHindi ? 'मन्नत' : 'Mannat', 
    image: require('@/assets/images/icons/home page icons/horoscope.png'),
    route: '/screens/mannat'
  },
  { 
    label: isHindi ? 'भक्ति संगीत' : 'Divine Music', 
    icon: 'music',
    route: showAudioVideoModal ? 'modal' : '/audio-video',
    onPress: showAudioVideoModal
  },
  { 
    label: isHindi ? 'पूजा मार्गदर्शन' : 'Puja Guidance', 
    image: require('@/assets/images/icons/home page icons/puja-guidance.png'),
    route: '/screens/puja-guidance'
  },
  { 
    label: isHindi ? 'विशेष दिन पूजा' : 'Special Day Puja', 
    image: require('@/assets/images/icons/home page icons/special-day-puja.png'),
    route: '/screens/special-puja'
  },
  { 
    label: isHindi ? 'प्रोफेशनल पूजा' : 'Professional Puja', 
    image: require('@/assets/images/icons/home page icons/professional-puja.jpg'),
    route: '/screens/professional-puja'
  },
];

const numColumns = 4;
const tileSize = (Dimensions.get('window').width - 72) / numColumns;

export default function HomeIconGrid({ isHindi = false }: { isHindi?: boolean }) {
  const router = useRouter();
  const { showAudioVideoModal } = useAudioVideoModal();
  const icons = getIcons(isHindi, showAudioVideoModal);
  
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