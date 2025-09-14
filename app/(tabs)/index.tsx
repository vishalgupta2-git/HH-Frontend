import HomeHeader from '@/components/Home/HomeHeader';
import HomeIconGrid from '@/components/Home/HomeIconGrid';
import ReferralConnectBlock, { SocialRow } from '@/components/Home/ReferralConnectBlock';
import SpiritualAstrologyBlock from '@/components/Home/SpiritualAstrologyBlock';

import SpecialDaysModal from '@/components/Home/SpecialDaysModal';
import ReferralSuccessModal from '@/components/Home/ReferralSuccessModal';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasVisitedDailyPujaToday, getUserFirstName } from '@/utils/dailyPujaUtils';
import { getUpcomingSpecialPujas, UpcomingPuja } from '@/utils/specialDaysUtils';
import { shouldShowSpecialDaysModal } from '@/utils/bookingUtils';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';


export default function HomeScreen() {
  const router = useRouter();
  const { isHindi, toggleLanguage, currentLanguage } = useLanguage();
  const [showSpecialDaysModal, setShowSpecialDaysModal] = useState(false);
  const [showReferralSuccessModal, setShowReferralSuccessModal] = useState(false);
  const [showFestivalsModal, setShowFestivalsModal] = useState(false);
  const [narkaTextIndex, setNarkaTextIndex] = useState(0);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [upcomingPujas, setUpcomingPujas] = useState<UpcomingPuja[]>([]);
  
  // Animation for the Upcoming Festivals button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Text animation for Narka Chaturdashi
  const narkaTexts = currentLanguage === 'hindi' ? ['नरक चतुर्दशी', 'छोटी दीवाली'] : 
                     currentLanguage === 'bangla' ? ['নরক চতুর্দশী', 'ছোট দীপাবলি'] :
                     currentLanguage === 'kannada' ? ['ನರಕ ಚತುರ್ದಶಿ', 'ಚಿಕ್ಕ ದೀಪಾವಳಿ'] :
                     currentLanguage === 'punjabi' ? ['ਨਰਕ ਚਤੁਰਦਸ਼ੀ', 'ਛੋਟੀ ਦੀਵਾਲੀ'] :
                     currentLanguage === 'tamil' ? ['நரக சதுர்தசி', 'சின்ன தீபாவளி'] :
                     currentLanguage === 'telugu' ? ['నరక చతుర్దశి', 'చిన్న దీపావళి'] :
                     ['Narka Chaturdashi', 'Chhoti Diwali'];
  
  useEffect(() => {
    if (showFestivalsModal) {
      const interval = setInterval(() => {
        setNarkaTextIndex(prev => (prev + 1) % narkaTexts.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showFestivalsModal, narkaTexts.length]);

  // Start button animations on component mount
  useEffect(() => {
    // Pulse animation (scale up and down)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation (opacity change)
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [pulseAnim, glowAnim]);
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

        // Note: Special puja modal is now handled in root layout to prevent duplicates
        // This useEffect only handles user first name and daily puja check
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
      <HomeHeader 
        enableSpiritualSearch={false} 
        showSearchBar={false} 
        showDailyPujaButton={true}
      />
      
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
           <HomeIconGrid key={`home-icon-grid-${currentLanguage}`} />
         </View>

         {/* Upcoming Festivals Button */}
         <View style={styles.section}>
           <Animated.View style={[styles.buttonContainer, { transform: [{ scale: pulseAnim }] }]}>
             <Animated.View style={[styles.glowEffect, { opacity: glowAnim }]} />
             <TouchableOpacity
               style={styles.upcomingFestivalsButton}
               onPress={() => setShowFestivalsModal(true)}
               activeOpacity={0.8}
             >
               <View style={styles.festivalsButtonContent}>
                 <IconSymbol name="calendar" size={24} color="#FF6A00" />
                 <Text style={styles.festivalsButtonText}>
                   {currentLanguage === 'hindi' ? 'त्योहारे दिन 2025' : 
                    currentLanguage === 'bangla' ? 'উৎসবের দিন ২০২৫' :
                    currentLanguage === 'kannada' ? 'ಹಬ್ಬದ ದಿನಗಳು 2025' :
                    currentLanguage === 'punjabi' ? 'ਤਿਉਹਾਰ ਦੇ ਦਿਨ 2025' :
                    currentLanguage === 'tamil' ? 'திருவிழா நாட்கள் 2025' :
                    currentLanguage === 'telugu' ? 'పండుగ రోజులు 2025' :
                    'Hindu Festival Season 2025'}
                 </Text>
                 <IconSymbol name="chevron.right" size={20} color="#FF6A00" />
               </View>
             </TouchableOpacity>
           </Animated.View>
         </View>
         
         {/* Test Temple Button - Hidden */}
         {/* <View style={styles.section}>
           <TouchableOpacity
             style={styles.testTempleButton}
             onPress={() => router.push('/screens/testtemple')}
             activeOpacity={0.8}
           >
             <Text style={styles.testTempleButtonText}>
               {currentLanguage === 'hindi' ? 'टेस्ट मंदिर' : 
                currentLanguage === 'bangla' ? 'টেস্ট মন্দির' :
                currentLanguage === 'kannada' ? 'ಪರೀಕ್ಷೆ ದೇವಾಲಯ' :
                currentLanguage === 'punjabi' ? 'ਟੈਸਟ ਮੰਦਰ' :
                currentLanguage === 'tamil' ? 'சோதனை கோவில்' :
                currentLanguage === 'telugu' ? 'పరీక్ష దేవాలయం' :
                'Test Temple'}
             </Text>
           </TouchableOpacity>
         </View> */}

         {/* 3D Ganesha Temple Button - Hidden */}
         {/* <View style={styles.section}>
           <TouchableOpacity
             style={styles.testTempleButton}
             onPress={() => router.push('/screens/3d-ganesha')}
             activeOpacity={0.8}
           >
             <Text style={styles.testTempleButtonText}>
               {currentLanguage === 'hindi' ? '3D गणेश मंदिर' : 
                currentLanguage === 'bangla' ? '3D গণেশ মন্দির' :
                currentLanguage === 'kannada' ? '3D ಗಣೇಶ ದೇವಾಲಯ' :
                currentLanguage === 'punjabi' ? '3D ਗਣੇਸ਼ ਮੰਦਰ' :
                currentLanguage === 'tamil' ? '3D கணேஷ் கோவில்' :
                currentLanguage === 'telugu' ? '3D గణేశ దేవాలయం' :
                '3D Ganesha Temple'}
             </Text>
           </TouchableOpacity>
         </View> */}


        
         {/* Spiritual & Astrology Block Section */}
         <View style={styles.section}>
           <SpiritualAstrologyBlock key={`spiritual-astrology-${currentLanguage}`} />
         </View>
        
         {/* Referral & Social Section */}
         <View style={styles.referralSection}>
           <ReferralConnectBlock key={`referral-connect-${currentLanguage}`} />
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

      {/* Upcoming Festivals Modal */}
      <Modal
        visible={showFestivalsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFestivalsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFestivalsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                   <Text style={styles.modalTitle}>
                     {currentLanguage === 'hindi' ? 'त्योहारे दिन 2025' : 
                      currentLanguage === 'bangla' ? 'উৎসবের দিন ২০২৫' :
                      currentLanguage === 'kannada' ? 'ಹಬ್ಬದ ದಿನಗಳು 2025' :
                      currentLanguage === 'punjabi' ? 'ਤਿਉਹਾਰ ਦੇ ਦਿਨ 2025' :
                      currentLanguage === 'tamil' ? 'திருவிழா நாட்கள் 2025' :
                      currentLanguage === 'telugu' ? 'పండుగ రోజులు 2025' :
                      'Hindu Festival Season 2025'}
                   </Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowFestivalsModal(false)}
                  >
                    <IconSymbol name="xmark" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.festivalsGrid}>
                  {[
                    { 
                      name: currentLanguage === 'hindi' ? 'नवरात्रि' : 
                            currentLanguage === 'bangla' ? 'নবরাত্রি' :
                            currentLanguage === 'kannada' ? 'ನವರಾತ್ರಿ' :
                            currentLanguage === 'punjabi' ? 'ਨਵਰਾਤਰੀ' :
                            currentLanguage === 'tamil' ? 'நவராத்திரி' :
                            currentLanguage === 'telugu' ? 'నవరాత్రి' :
                            'Navratri', 
                      image: require('@/assets/images/icons/home page icons/Navratri.png'),
                      route: '/screens/navratri-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'दशहरा' : 
                            currentLanguage === 'bangla' ? 'দশেরা' :
                            currentLanguage === 'kannada' ? 'ದಸರಾ' :
                            currentLanguage === 'punjabi' ? 'ਦਸੇਹਰਾ' :
                            currentLanguage === 'tamil' ? 'தசரா' :
                            currentLanguage === 'telugu' ? 'దసరా' :
                            'Dusshera', 
                      image: require('@/assets/images/icons/otherIcons/DussheraIcon.png'),
                      route: '/screens/dusshera-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'अहोई अष्टमी' : 
                            currentLanguage === 'bangla' ? 'অহোই অষ্টমী' :
                            currentLanguage === 'kannada' ? 'ಅಹೋಯಿ ಅಷ್ಟಮಿ' :
                            currentLanguage === 'punjabi' ? 'ਅਹੋਈ ਅਸ਼ਟਮੀ' :
                            currentLanguage === 'tamil' ? 'அஹோயி அஷ்டமி' :
                            currentLanguage === 'telugu' ? 'అహోయి అష్టమి' :
                            'Ahoi Ashtami', 
                      image: require('@/assets/images/icons/otherIcons/Ahoi Ashtami.png'),
                      route: '/screens/ahoi-ashtami-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'करवा चौथ' : 
                            currentLanguage === 'bangla' ? 'করব চতুর্থ' :
                            currentLanguage === 'kannada' ? 'ಕರ್ವಾ ಚೌತ್' :
                            currentLanguage === 'punjabi' ? 'ਕਰਵਾ ਚੌਥ' :
                            currentLanguage === 'tamil' ? 'கர்வா சௌத்' :
                            currentLanguage === 'telugu' ? 'కర్వా చౌత్' :
                            'Karva Chauth', 
                      image: require('@/assets/images/icons/otherIcons/KarwaChauthIcon.png'),
                      route: '/screens/karva-chauth-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'धनतेरस' : 
                            currentLanguage === 'bangla' ? 'ধনতেরাস' :
                            currentLanguage === 'kannada' ? 'ಧನತೇರಸ್' :
                            currentLanguage === 'punjabi' ? 'ਧਨਤੇਰਸ' :
                            currentLanguage === 'tamil' ? 'தனதேரஸ்' :
                            currentLanguage === 'telugu' ? 'ధనతేరస్' :
                            'Dhanteras', 
                      image: require('@/assets/images/icons/otherIcons/DhanterasIcon.png'),
                      route: '/screens/dhanteras-2025'
                    },
                    { 
                      name: narkaTexts[narkaTextIndex], 
                      image: require('@/assets/images/icons/otherIcons/NarkaChatrudashiIcon.png'),
                      route: '/screens/chhoti-diwali-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'दीवाली' : 
                            currentLanguage === 'bangla' ? 'দীপাবলি' :
                            currentLanguage === 'kannada' ? 'ದೀಪಾವಳಿ' :
                            currentLanguage === 'punjabi' ? 'ਦੀਵਾਲੀ' :
                            currentLanguage === 'tamil' ? 'தீபாவளி' :
                            currentLanguage === 'telugu' ? 'దీపావళి' :
                            'Diwali', 
                      image: require('@/assets/images/icons/otherIcons/diwaliIcon.jpg'),
                      route: '/screens/diwali-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'गोवर्धन पूजा' : 
                            currentLanguage === 'bangla' ? 'গোবর্ধন পূজা' :
                            currentLanguage === 'kannada' ? 'ಗೋವರ್ಧನ ಪೂಜೆ' :
                            currentLanguage === 'punjabi' ? 'ਗੋਵਰਧਨ ਪੂਜਾ' :
                            currentLanguage === 'tamil' ? 'கோவர்தன் பூஜை' :
                            currentLanguage === 'telugu' ? 'గోవర్ధన పూజ' :
                            'Govardhan Puja', 
                      image: require('@/assets/images/icons/otherIcons/govardhanPujaIcon.jpg'),
                      route: '/screens/govardhan-puja-2025'
                    },
                    { 
                      name: currentLanguage === 'hindi' ? 'भाई दूज' : 
                            currentLanguage === 'bangla' ? 'ভাই দুজ' :
                            currentLanguage === 'kannada' ? 'ಭಾಯಿ ದೂಜ್' :
                            currentLanguage === 'punjabi' ? 'ਭਾਈ ਦੂਜ' :
                            currentLanguage === 'tamil' ? 'பாய் தூஜ்' :
                            currentLanguage === 'telugu' ? 'భాయి దూజ్' :
                            'Bhai Dooj', 
                      image: require('@/assets/images/icons/otherIcons/bhaiDoojIcon.jpg'),
                      route: '/screens/bhai-dooj-2025'
                    },
                  ].map((festival, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.festivalItem}
                      onPress={() => {
                        setShowFestivalsModal(false);
                        router.push(festival.route as any);
                      }}
                    >
                      <View style={styles.festivalIconCircle}>
                        {festival.image ? (
                          <Image source={festival.image} style={styles.festivalImage} resizeMode="contain" />
                        ) : (
                          <IconSymbol name={festival.icon} size={24} color="#FF6A00" />
                        )}
                      </View>
                      <Text style={styles.festivalName}>{festival.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  testTempleButton: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
   testTempleButtonText: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#fff',
     textAlign: 'center',
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
  // Upcoming Festivals Button styles
  buttonContainer: {
    width: '92%',
    alignSelf: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#FF6A00',
    borderRadius: 16,
    opacity: 0.3,
  },
  upcomingFestivalsButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  festivalsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  festivalsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  festivalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  festivalItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  festivalIconCircle: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  festivalName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  festivalImage: {
    width: 45,
    height: 45,
  },
});
