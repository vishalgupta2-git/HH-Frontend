// Make sure to run: npx expo install react-native-svg expo-svg-uri
import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Arch from '../../components/temple/Arch';

export default function TempleScreen() {
  return (
    <View style={styles.container}>
      <HomeHeader showDailyPujaButton={false} />
      <LinearGradient
        colors={['#FF6A00', '#A259FF', '#3B006A']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.content}>
          {/* <Arch width={260} height={260} style={styles.archImage} /> */}
          <Text style={styles.motivation}>
            Maintain your spirituality by creating{"\n"}a virtual temple with a virtual deity.
          </Text>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create temple</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  gradientBg: { flex: 1, paddingTop: 0 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  archImage: {
    marginBottom: 32,
    marginTop: 32,
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
}); 