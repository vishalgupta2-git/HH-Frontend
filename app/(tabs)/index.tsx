import HomeHeader from '@/components/Home/HomeHeader';
import HomeIconGrid from '@/components/Home/HomeIconGrid';
import ReferralConnectBlock, { SocialRow } from '@/components/Home/ReferralConnectBlock';
import SpiritualAstrologyBlock from '@/components/Home/SpiritualAstrologyBlock';
import DailyPujaReminderModal from '@/components/Home/DailyPujaReminderModal';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { hasVisitedDailyPujaToday, getUserFirstName } from '@/utils/dailyPujaUtils';

export default function HomeScreen() {
  console.log('🔍 [DEBUG] HomeScreen: Starting...');
  
  const [showDailyPujaModal, setShowDailyPujaModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  
  // Check if user should see daily puja reminder
  useEffect(() => {
    const checkDailyPujaReminder = async () => {
      try {
        // Check if user is logged in and hasn't visited daily puja today
        const hasVisitedToday = await hasVisitedDailyPujaToday();
        const firstName = await getUserFirstName();
        
        console.log('🔍 [DEBUG] HomeScreen: Daily puja check:', { 
          hasVisitedToday, 
          firstName: firstName || 'not logged in' 
        });
        
        // Only show modal if user is logged in and hasn't visited today
        if (!hasVisitedToday && firstName) {
          setUserFirstName(firstName);
          setShowDailyPujaModal(true);
        }
      } catch (error) {
        console.error('🔍 [DEBUG] HomeScreen: Error checking daily puja reminder:', error);
      }
    };
    
    // Add a small delay to ensure the screen is fully loaded
    const timer = setTimeout(checkDailyPujaReminder, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleCloseModal = () => {
    setShowDailyPujaModal(false);
  };
  
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
      
      {/* Daily Puja Reminder Modal */}
      <DailyPujaReminderModal
        visible={showDailyPujaModal}
        onClose={handleCloseModal}
        firstName={userFirstName}
      />
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
