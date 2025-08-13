// Make sure to run: npx expo install react-native-svg expo-svg-uri
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

export const options = { headerShown: false };

const { width: screenWidth } = Dimensions.get('window');

function ArchSVG(props: { width?: number; height?: number; style?: any }) {
  return (
    <Svg
      width={props.width || screenWidth}
      height={props.height || (screenWidth * 195) / 393}
      viewBox="0 0 393 195"
      fill="none"
      style={props.style}
    >
      <Path
        d="M196.41 50.5308C196.41 50.5308 191.28 93.7515 124.46 91.3237C124.46 91.3237 83.9203 87.722 89.6775 122.405C89.6775 122.405 35.5653 117.176 33.0297 177.151C33.0297 177.151 4.09425 175.444 1.02173 195H-120V0H361.73H513V195H391.799C391.799 195 392.754 176.858 359.791 177.151C359.791 177.151 361.223 121.712 303.143 122.352C303.143 122.352 311.496 95.1389 273.731 91.4838C273.701 91.4838 213.503 101.035 196.41 50.5308Z"
        fill="url(#archGradient)"
      />
      <Defs>
        <SvgLinearGradient id="archGradient" x1="196.5" y1="29.2058" x2="196.5" y2="151.717" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFAE51" />
          <Stop offset="0.9888" stopColor="#E87C00" />
        </SvgLinearGradient>
      </Defs>
    </Svg>
  );
}

export default function TempleScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Bells: left and right, 60px from each side, behind arch */}
      <Image
        source={require('@/assets/images/temple/GoldenBell.png')}
        style={styles.bellLeft}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/temple/GoldenBell.png')}
        style={styles.bellRight}
        resizeMode="contain"
      />
      {/* Arch on top */}
      <ArchSVG width={screenWidth} height={(screenWidth * 195) / 393} style={styles.archImage} />
      {/* TempleStar.png at ~100px from top */}
      <Image
        source={require('@/assets/images/temple/TempleStar.png')}
        style={styles.templeStar}
        resizeMode="contain"
      />
      {/* Temple1.png below arch, above motivational text */}
      <Image
        source={require('@/assets/images/temple/Temple1.png')}
        style={styles.temple1}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <Text style={styles.motivation}>
          Maintain your spirituality by creating{"\n"}a virtual temple with a virtual deity.
        </Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/screens/create-temple')}>
          <Text style={styles.createBtnText}>Create temple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  archImage: {
    marginBottom: 0,
    marginTop: 0,
    alignSelf: 'center',
    zIndex: 2,
  },
  templeStar: {
    position: 'absolute',
    top: 100, // was 120
    left: '2%',
    width: '96%',
    height: undefined,
    aspectRatio: 1,
    zIndex: 3,
    alignSelf: 'center',
  },
  temple1: {
    width: screenWidth * 1.15,
    height: undefined,
    aspectRatio: 1.2,
    alignSelf: 'center',
    marginTop: 30, // was 20
    marginBottom: 16,
    zIndex: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  motivation: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  createBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtnText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bellLeft: {
    position: 'absolute',
    top: 95,
    left: 40, // was 60
    width: 62.4,
    height: 117,
    zIndex: 1,
  },
  bellRight: {
    position: 'absolute',
    top: 95,
    right: 40, // was 60
    width: 62.4,
    height: 117,
    zIndex: 1,
  },
}); 