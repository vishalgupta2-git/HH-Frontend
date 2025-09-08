import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export const options = { headerShown: false };

export default function MudrasScreen() {
  const { isHindi } = useLanguage();
  const router = useRouter();
  const [showMudrasModal, setShowMudrasModal] = useState(false);
  const [mudrasCount, setMudrasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const translations = {
    headerTitle: { en: 'Mudras', hi: 'मुद्राएं' },
    title: { en: 'Mudras', hi: 'मुद्राएं' },
    currentMudras: { en: 'Current Mudras', hi: 'वर्तमान मुद्राएं' },
    loadingMudras: { en: 'Loading mudras...', hi: 'मुद्राएं लोड हो रही हैं...' },
    mudrasCount: { en: 'Mudras', hi: 'मुद्राएं' },
    viewMudraHistory: { en: 'View Mudra History', hi: 'मुद्रा इतिहास देखें' },
    howToEarnMudras: { en: 'How to earn Mudras', hi: 'मुद्राएं कैसे कमाएं' },
    modalTitle: { en: 'How to Earn Mudras', hi: 'मुद्राएं कैसे कमाएं' },
    closeButton: { en: '✕', hi: '✕' },
    pujaActivities: { en: 'Puja activities', hi: 'पूजा गतिविधियां' },
    onetimeActivities: { en: 'Onetime activities', hi: 'एक बार की गतिविधियां' },
    dailyActivities: { en: 'Daily activities:', hi: 'दैनिक गतिविधियां:' },
    activities: {
      bookPuja: { en: 'Book any Puja:', hi: 'कोई भी पूजा बुक करें:' },
      referFriend: { en: 'Refer a Friend:', hi: 'मित्र को रेफर करें:' },
      signUp: { en: 'Sign Up:', hi: 'साइन अप करें:' },
      completeProfile: { en: 'Complete Profile:', hi: 'प्रोफाइल पूरा करें:' },
      setupTemple: { en: 'Setup your Temple:', hi: 'अपना मंदिर सेटअप करें:' },
      dailyLogin: { en: 'Daily Login:', hi: 'दैनिक लॉगिन:' },
      offerFlowers: { en: 'Offer flowers to god:', hi: 'भगवान को फूल चढ़ाएं:' },
      doAarti: { en: 'Do aarti:', hi: 'आरती करें:' },
      ringBell: { en: 'Ring the bell:', hi: 'घंटी बजाएं:' },
      playShankh: { en: 'Play Shankh:', hi: 'शंख बजाएं:' },
      offerDhoop: { en: 'Offer Dhoop to God:', hi: 'भगवान को धूप चढ़ाएं:' },
      listenAudioVideo: { en: 'Listen to Audio / Video:', hi: 'ऑडियो / वीडियो सुनें:' },
      checkRashifal: { en: 'Check Rashifal:', hi: 'राशिफल देखें:' }
    },
    profileDetails: {
      phoneNumber: { en: 'Phone Number:', hi: 'फोन नंबर:' },
      dateOfBirth: { en: 'Date of Birth:', hi: 'जन्म तिथि:' },
      fathersDateOfBirth: { en: 'Father\'s date of birth:', hi: 'पिता की जन्म तिथि:' },
      mothersDateOfBirth: { en: 'Mother\'s date of birth:', hi: 'माता की जन्म तिथि:' },
      childrensInfo: { en: 'Children\'s name and date of birth:', hi: 'बच्चों का नाम और जन्म तिथि:' }
    },
    mudraCounts: {
      mudras: { en: 'Mudras', hi: 'मुद्राएं' },
      perChildren: { en: '/ children', hi: '/ बच्चे' },
      perAudioVideo: { en: 'per audio / video', hi: 'प्रति ऑडियो / वीडियो' },
      maxPerDay: { en: '(Max 25 Mudras per day)', hi: '(प्रतिदिन अधिकतम 25 मुद्राएं)' }
    }
  };

  // Fetch user mudras count
  useEffect(() => {
    const fetchMudras = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const response = await axios.get(getEndpointUrl('USER_MUDRAS'), {
            params: { email: user.email },
            headers: getAuthHeaders()
          });
          
          if (response.data.success) {
            setMudrasCount(response.data.mudras);
          }
        }
      } catch (error) {
        console.error('Error fetching mudras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMudras();
  }, []);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>{isHindi ? translations.headerTitle.hi : translations.headerTitle.en}</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      <View style={styles.card}>
        <View style={styles.contentHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{isHindi ? translations.title.hi : translations.title.en}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{isHindi ? translations.currentMudras.hi : translations.currentMudras.en}</Text>
        
        {/* Fixed back button container */}
        <TouchableOpacity style={styles.fixedBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-undo" size={24} color="#666" />
        </TouchableOpacity>
        
        {/* Placeholder for current mudras list */}
                 <View style={styles.mudraListPlaceholder}>
           {loading ? (
             <Text style={{ color: '#888', fontSize: 16 }}>{isHindi ? translations.loadingMudras.hi : translations.loadingMudras.en}</Text>
           ) : (
             <Text style={styles.mudrasCountText}>{mudrasCount} {isHindi ? translations.mudrasCount.hi : translations.mudrasCount.en}</Text>
           )}
         </View>
                 <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/auth/mudra-history')}>
           <Text style={styles.historyLinkText}>{isHindi ? translations.viewMudraHistory.hi : translations.viewMudraHistory.en}</Text>
         </TouchableOpacity>
        <TouchableOpacity style={styles.historyLink} onPress={() => setShowMudrasModal(true)}>
          <Text style={styles.historyLinkText}>{isHindi ? translations.howToEarnMudras.hi : translations.howToEarnMudras.en}</Text>
        </TouchableOpacity>
      </View>
      
      {/* How to Earn Mudras Modal */}
      <Modal
        visible={showMudrasModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMudrasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isHindi ? translations.modalTitle.hi : translations.modalTitle.en}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMudrasModal(false)}
              >
                <Text style={styles.closeButtonText}>{isHindi ? translations.closeButton.hi : translations.closeButton.en}</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
                             {/* Puja Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{isHindi ? translations.pujaActivities.hi : translations.pujaActivities.en}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.bookPuja.hi : translations.activities.bookPuja.en} <Text style={styles.mudraCount}>500 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.referFriend.hi : translations.activities.referFriend.en} <Text style={styles.mudraCount}>100 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
               </View>
               
               {/* One-time Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{isHindi ? translations.onetimeActivities.hi : translations.onetimeActivities.en}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.signUp.hi : translations.activities.signUp.en} <Text style={styles.mudraCount}>100 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.completeProfile.hi : translations.activities.completeProfile.en}</Text>
                   <View style={styles.activityDetails}>
                     <Text style={styles.activityDetail}>• {isHindi ? translations.profileDetails.phoneNumber.hi : translations.profileDetails.phoneNumber.en} <Text style={styles.mudraCount}>10 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                     <Text style={styles.activityDetail}>• {isHindi ? translations.profileDetails.dateOfBirth.hi : translations.profileDetails.dateOfBirth.en} <Text style={styles.mudraCount}>10 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                     <Text style={styles.activityDetail}>• {isHindi ? translations.profileDetails.fathersDateOfBirth.hi : translations.profileDetails.fathersDateOfBirth.en} <Text style={styles.mudraCount}>10 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                     <Text style={styles.activityDetail}>• {isHindi ? translations.profileDetails.mothersDateOfBirth.hi : translations.profileDetails.mothersDateOfBirth.en} <Text style={styles.mudraCount}>10 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                     <Text style={styles.activityDetail}>• {isHindi ? translations.profileDetails.childrensInfo.hi : translations.profileDetails.childrensInfo.en} <Text style={styles.mudraCount}>15 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en} {isHindi ? translations.mudraCounts.perChildren.hi : translations.mudraCounts.perChildren.en}</Text></Text>
                   </View>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.setupTemple.hi : translations.activities.setupTemple.en} <Text style={styles.mudraCount}>50 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
               </View>
               
               {/* Daily Activities */}
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>{isHindi ? translations.dailyActivities.hi : translations.dailyActivities.en}</Text>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.dailyLogin.hi : translations.activities.dailyLogin.en} <Text style={styles.mudraCount}>10 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.offerFlowers.hi : translations.activities.offerFlowers.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.doAarti.hi : translations.activities.doAarti.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.ringBell.hi : translations.activities.ringBell.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.playShankh.hi : translations.activities.playShankh.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.offerDhoop.hi : translations.activities.offerDhoop.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.listenAudioVideo.hi : translations.activities.listenAudioVideo.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en} {isHindi ? translations.mudraCounts.perAudioVideo.hi : translations.mudraCounts.perAudioVideo.en}</Text></Text>
                   <Text style={styles.activitySubtext}>{isHindi ? translations.mudraCounts.maxPerDay.hi : translations.mudraCounts.maxPerDay.en}</Text>
                 </View>
                 
                 <View style={styles.activityItem}>
                   <Text style={styles.activityTitle}>{isHindi ? translations.activities.checkRashifal.hi : translations.activities.checkRashifal.en} <Text style={styles.mudraCount}>5 {isHindi ? translations.mudraCounts.mudras.hi : translations.mudraCounts.mudras.en}</Text></Text>
                 </View>
               </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -135,  // Move it to the left side
    top: 5,   // 20px from top
    zIndex: 10, // Ensure it's above other elements
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8,
    height: 120 * 0.8,
    left: width * -0.25 * 0.8,
    bottom: CARD_TOP + CARD_MARGIN_TOP - 120 - 60,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },

  mudraListPlaceholder: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  historyLink: {
    marginTop: 8,
    alignSelf: 'center',
  },
  historyLinkText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FFF6EE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activityItem: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDetails: {
    marginLeft: 16,
    marginTop: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  mudraCount: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
     activitySubtext: {
     fontSize: 12,
     color: '#888',
     fontStyle: 'italic',
     marginLeft: 16,
     marginTop: 2,
   },
   mudrasCountText: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FF6A00',
     textAlign: 'center',
   },
   title: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#FF6A00',
     marginBottom: 18,
     textAlign: 'center',
   },
   subtitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#222',
     marginBottom: 18,
     textAlign: 'left',
   },
   // New styles for contentHeader
   contentHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingTop: 5,
     paddingBottom: 16,
     borderBottomWidth: 1,
     borderBottomColor: '#E0E0E0',
     marginBottom: 20,
   },
   titleContainer: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
   },
   fixedBackButton: {
     position: 'absolute',
     top: 20,
     left: 20,
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: '#F0F0F0',
     alignItems: 'center',
     justifyContent: 'center',
     zIndex: 10,
   },
 }); 