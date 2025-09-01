import HomeHeader from '@/components/Home/HomeHeader';
import HomeIconGrid from '@/components/Home/HomeIconGrid';
import ReferralConnectBlock, { SocialRow } from '@/components/Home/ReferralConnectBlock';
import SpiritualAstrologyBlock from '@/components/Home/SpiritualAstrologyBlock';

import SpecialDaysModal from '@/components/Home/SpecialDaysModal';
import ReferralSuccessModal from '@/components/Home/ReferralSuccessModal';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasVisitedDailyPujaToday, getUserFirstName } from '@/utils/dailyPujaUtils';
import { getUpcomingSpecialPujas, UpcomingPuja } from '@/utils/specialDaysUtils';
import { shouldShowSpecialDaysModal } from '@/utils/bookingUtils';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();

  const [showSpecialDaysModal, setShowSpecialDaysModal] = useState(false);
  const [showReferralSuccessModal, setShowReferralSuccessModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [upcomingPujas, setUpcomingPujas] = useState<UpcomingPuja[]>([]);
  // const [buttonBackgroundColor, setButtonBackgroundColor] = useState('#FF9800');
  // const [buttonTextColor, setButtonTextColor] = useState('#fff');
  
  // Check if user should see daily puja reminder and special days
  useEffect(() => {
    const checkReminders = async () => {
      try {
        // Check if user is logged in and hasn't visited daily puja today
        const hasVisitedToday = await hasVisitedDailyPujaToday();
        const firstName = await getUserFirstName();
        
        // Set user first name for other modals
        if (firstName) {
          setUserFirstName(firstName);
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

  // Check for referral success status
  useEffect(() => {
    const checkReferralStatus = async () => {
      try {
        const referralStatus = await AsyncStorage.getItem('referralStatus');
        if (referralStatus) {
          const status = JSON.parse(referralStatus);
          if (status.fromSignup && status.mudrasEarned) {
            setShowReferralSuccessModal(true);
          }
        }
      } catch (error) {
        // Handle error silently
      }
    };

    // Check referral status after a delay to ensure screen is loaded
    const timer = setTimeout(checkReferralStatus, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Color animation for Eco friendly Ganesha button - Commented out for future use
  // useEffect(() => {
  //   const colorInterval = setInterval(() => {
  //     setButtonBackgroundColor(prevColor => 
  //       prevColor === '#FF9800' ? '#FFB74D' : '#FFB74D'
  //     );
  //     setButtonTextColor(prevColor => 
  //       prevColor === '#fff' ? '#000' : '#fff'
  //     );
  //   }, 3000); // Change every 3 seconds

  //   return () => clearInterval(colorInterval);
  // }, []);
  


  const handleCloseSpecialDaysModal = () => {
    setShowSpecialDaysModal(false);
  };

  const handleCloseReferralSuccessModal = () => {
    setShowReferralSuccessModal(false);
  };
  
  return (
    <View style={styles.root}>
      {/* Fixed Header with Gradient Background */}
      <HomeHeader enableSpiritualSearch={false} showSearchBar={false} showDailyPujaButton={true} />
      
      {/* Empty white box with rounded top corners - positioned on top of everything */}
      <View style={styles.topWhiteBox} />
      
      {/* Scrollable Content that scrolls in front of the gradient */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Top spacing to account for header height */}
        <View style={styles.headerSpacer} />
        
        {/* Icon Grid Section */}
        <View style={styles.section}>
          <HomeIconGrid />
        </View>
        

        
        {/* Spiritual & Astrology Block Section */}
        <View style={styles.section}>
          <SpiritualAstrologyBlock />
        </View>
        
        {/* Referral & Social Section */}
        <View style={styles.referralSection}>
          <ReferralConnectBlock />
          <SocialRow />
        </View>
        
        {/* Bottom Spacer for Global Navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      

      
      {/* Special Days Modal */}
      <SpecialDaysModal
        visible={showSpecialDaysModal}
        onClose={handleCloseSpecialDaysModal}
        upcomingPujas={upcomingPujas}
      />
      
      {/* Referral Success Modal */}
      <ReferralSuccessModal
        visible={showReferralSuccessModal}
        onClose={handleCloseReferralSuccessModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  topWhiteBox: {
    position: 'absolute',
    top: 212,
    left: '6%', // 4% left margin to center the 92% width box
    width: '88%', // Same width as icon grid
    height: 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 999, // Much higher z-index to ensure it's on top
    elevation: 999, // For Android
  },
  scrollView: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: '2.5%', // 2.5% left margin to center the 95% width content
    width: '95%', // Increased to 95% screen width
    bottom: 0,
    zIndex: 0, // Lower z-index so content scrolls behind header elements
  },
  contentContainer: {
    paddingBottom: 32,
  },
  headerSpacer: {
    height: 300, // 280px header height + 20px top margin
  },
  section: {
    marginTop: 20,
  },
  referralSection: {
    marginTop: 6,
  },
  bottomSpacer: {
    height: 150,
  },

  // ecoGaneshaButton: {
  //   width: '92%',
  //   alignSelf: 'center',
  //   borderRadius: 8,
  //   paddingVertical: 12,
  //   paddingHorizontal: 16,
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  // ecoGaneshaButtonText: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  // },
});
