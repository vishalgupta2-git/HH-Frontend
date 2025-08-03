import HomeHeader from '@/components/Home/HomeHeader';
import HomeIconGrid from '@/components/Home/HomeIconGrid';
import ReferralConnectBlock, { SocialRow } from '@/components/Home/ReferralConnectBlock';
import SpiritualAstrologyBlock from '@/components/Home/SpiritualAstrologyBlock';
import DailyPujaReminderModal from '@/components/Home/DailyPujaReminderModal';
import SpecialDaysModal from '@/components/Home/SpecialDaysModal';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { hasVisitedDailyPujaToday, getUserFirstName } from '@/utils/dailyPujaUtils';
import { getUpcomingSpecialPujas, UpcomingPuja } from '@/utils/specialDaysUtils';
import { shouldShowSpecialDaysModal } from '@/utils/bookingUtils';
import { testSpecialDaysLogic } from '@/utils/testSpecialDays';

export default function HomeScreen() {
  console.log('🔍 [DEBUG] HomeScreen: Starting...');
  
  const [showDailyPujaModal, setShowDailyPujaModal] = useState(false);
  const [showSpecialDaysModal, setShowSpecialDaysModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [upcomingPujas, setUpcomingPujas] = useState<UpcomingPuja[]>([]);
  
  // Check if user should see daily puja reminder and special days
  useEffect(() => {
    const checkReminders = async () => {
      try {
        // Run test to debug date logic
        testSpecialDaysLogic();
        
        // Check if user is logged in and hasn't visited daily puja today
        const hasVisitedToday = await hasVisitedDailyPujaToday();
        const firstName = await getUserFirstName();
        
        console.log('🔍 [DEBUG] HomeScreen: Daily puja check:', { 
          hasVisitedToday, 
          firstName: firstName || 'not logged in' 
        });
        
        // Only show daily puja modal if user is logged in and hasn't visited today
        if (!hasVisitedToday && firstName) {
          setUserFirstName(firstName);
          setShowDailyPujaModal(true);
        }

        // Check for upcoming special pujas (show for all users)
        const upcomingPujas = await getUpcomingSpecialPujas();
        console.log('🔍 [DEBUG] HomeScreen: Upcoming pujas found:', upcomingPujas.length);
        
        if (upcomingPujas.length > 0) {
          // Check if user has already booked the closest upcoming puja in last 30 days
          const closestPuja = upcomingPujas[0];
          const shouldShow = await shouldShowSpecialDaysModal(closestPuja.pujaName);
          
          console.log('🔍 [DEBUG] HomeScreen: Should show special days modal for', closestPuja.pujaName, ':', shouldShow);
          
          if (shouldShow) {
            console.log('🔍 [DEBUG] HomeScreen: Setting special days modal to show');
            setUpcomingPujas(upcomingPujas);
            setShowSpecialDaysModal(true);
          } else {
            console.log('🔍 [DEBUG] HomeScreen: User has already booked this puja recently, modal will not show');
          }
        } else {
          console.log('🔍 [DEBUG] HomeScreen: No upcoming pujas found, modal will not show');
        }
      } catch (error) {
        console.error('🔍 [DEBUG] HomeScreen: Error checking reminders:', error);
      }
    };
    
    // Add a small delay to ensure the screen is fully loaded
    const timer = setTimeout(checkReminders, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleCloseDailyPujaModal = () => {
    setShowDailyPujaModal(false);
  };

  const handleCloseSpecialDaysModal = () => {
    setShowSpecialDaysModal(false);
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
        onClose={handleCloseDailyPujaModal}
        firstName={userFirstName}
      />
      
      {/* Special Days Modal */}
      <SpecialDaysModal
        visible={showSpecialDaysModal}
        onClose={handleCloseSpecialDaysModal}
        upcomingPujas={upcomingPujas}
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
