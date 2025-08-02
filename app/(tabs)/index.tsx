import HomeHeader from '@/components/Home/HomeHeader';
import HomeIconGrid from '@/components/Home/HomeIconGrid';
import ReferralConnectBlock, { SocialRow } from '@/components/Home/ReferralConnectBlock';
import SpiritualAstrologyBlock from '@/components/Home/SpiritualAstrologyBlock';
import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';

export default function HomeScreen() {
  console.log('🔍 [DEBUG] HomeScreen: Starting...');
  
  try {
    console.log('🔍 [DEBUG] HomeScreen: About to render components');
    
    return (
    <View style={styles.root}>
      <HomeHeader />
      <View style={styles.section}>
        <HomeIconGrid />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SpiritualAstrologyBlock />
        </View>
        <View style={styles.referralSection}>
          <ReferralConnectBlock />
          <SocialRow />
        </View>
      </ScrollView>
    </View>
  );
  } catch (error) {
    console.error('🔍 [DEBUG] HomeScreen: Error rendering:', error);
    return (
      <View style={styles.root}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error loading home screen: {error.message}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 16,
  },
  referralSection: {
    marginTop: 6,
  },
});
