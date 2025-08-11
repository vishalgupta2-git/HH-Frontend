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


export default function HomeScreen() {
  const [showDailyPujaModal, setShowDailyPujaModal] = useState(false);
  const [showSpecialDaysModal, setShowSpecialDaysModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [upcomingPujas, setUpcomingPujas] = useState<UpcomingPuja[]>([]);
  
  // Check if user should see daily puja reminder and special days
  useEffect(() => {
    const checkReminders = async () => {
      try {
        // Check if user is logged in and hasn't visited daily puja today
        const hasVisitedToday = await hasVisitedDailyPujaToday();
        const firstName = await getUserFirstName();
        
        // Only show daily puja modal if user is logged in and hasn't visited today
        if (!hasVisitedToday && firstName) {
          setUserFirstName(firstName);
          setShowDailyPujaModal(true);
        }

        // Check for upcoming special pujas (show for all users)
        const upcomingPujas = await getUpcomingSpecialPujas();
        
        if (upcomingPujas.length > 0) {
          // Check if user has already booked the closest upcoming puja in last 30 days
          const closestPuja = upcomingPujas[0];
          const shouldShow = await shouldShowSpecialDaysModal(closestPuja.pujaName);
          
          if (shouldShow) {
            setUpcomingPujas(upcomingPujas);
            setShowSpecialDaysModal(true);
          }
        }
      } catch (error) {
        // Handle error silently
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
  
  return (
    <View style={styles.root}>
      <HomeHeader enableSpiritualSearch={false} showSearchBar={false} showDailyPujaButton={true} />
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
    marginTop: 8,
  },
  referralSection: {
    marginTop: 6,
  },
});
