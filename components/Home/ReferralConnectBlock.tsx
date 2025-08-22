import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Linking, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ReferralConnectBlock() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        // Fetch referral code from user data
        // If user doesn't have a referral code, generate one or fetch from backend
        if (user.referralCode) {
          setReferralCode(user.referralCode);
        } else {
          // TODO: Fetch or generate referral code from backend
          // For now, use a placeholder
          setReferralCode('hh2547d6');
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    
    // Show toast message
    setShowToast(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleInviteButton = () => {
    setShowReferralModal(true);
  };

  const handleCopyReferralCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setShowReferralModal(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Refer friends & family</Text>
        <Text style={styles.subtitle}>
          Sign-Up or login to help your friends and family on their spiritual journey.
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayCode = isExpanded ? referralCode : `${referralCode.substring(0, 6)}...`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Refer friends & family</Text>
      <Text style={styles.subtitle}>
        Invite your friends and family enhance their spiritual journey. They will also earn 1000 Mudras when they sign up with your referralCode
      </Text>
      <View style={styles.referralRow}>
        <Text style={styles.referralLabel}>Referral Code: </Text>
        <Text style={styles.referralCode}>{displayCode}</Text>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={toggleExpanded}
        >
          <Text style={styles.expandButtonText}>...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyCode}
        >
          <Feather name="copy" size={20} color="#FF9800" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.inviteButton} onPress={handleInviteButton}>
        <Text style={styles.inviteButtonText}>Invite and Earn 1000 Mudras</Text>
      </TouchableOpacity>
      
      {/* Toast message */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Referral code copied!</Text>
        </View>
      )}
      
      {/* Referral Modal */}
      {showReferralModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refer and Earn Mudras</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowReferralModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                When you refer someone, you not only help them progress on their spiritual journey, both you and them earn Mudras
              </Text>
              
              <Text style={styles.modalText}>
                Please copy the Referral code and share with the person you want to refer.
              </Text>
              
              <Text style={styles.modalText}>
                Request them to download the app and use the referral code during Sign Up
              </Text>
              
              <Text style={styles.modalNote}>
                Please note that the bonus Mudras will be awarded within 3 days of Sign Up
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleCopyReferralCode}
            >
              <Text style={styles.modalButtonText}>Copy referral code!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export function SocialRow() {
  // Use the same icon row as before
  const { FontAwesome, MaterialCommunityIcons, Ionicons } = require('@expo/vector-icons');
  
  // WhatsApp function to open chat with your number
  const openWhatsAppChat = () => {
    const phoneNumber = '916361496368'; // Your number: 91 (India) + 6361496368
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    
    // Try to open WhatsApp app
    Linking.openURL(whatsappUrl).catch(() => {
      // Fallback: open WhatsApp in browser if app not installed
      const webUrl = `https://wa.me/${phoneNumber}`;
      Linking.openURL(webUrl);
    });
  };
  
  // YouTube function to open your channel
  const openYouTubeChannel = () => {
    // Your actual YouTube channel URL
    const youtubeUrl = 'https://www.youtube.com/@TheHinduHeritage_YT';
    
    // Try to open YouTube app first
    const appUrl = `youtube://channel/${youtubeUrl.split('/').pop()}`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(youtubeUrl);
    });
  };
  
  // Twitter function to open your profile
  const openTwitterProfile = () => {
    // Your actual X (Twitter) profile URL
    const twitterUrl = 'https://x.com/HinduHeritage_x';
    
    // Try to open X app first
    const appUrl = `twitter://user?screen_name=HinduHeritage_x`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(twitterUrl);
    });
  };
  
  // LinkedIn function to open your company page
  const openLinkedInCompany = () => {
    // Your LinkedIn company page URL
    const linkedinUrl = 'https://www.linkedin.com/company/thehinduheritage';
    
    // Try to open LinkedIn app first
    const appUrl = `linkedin://company/thehinduheritage`;
    
    Linking.openURL(appUrl).catch(() => {
      // Fallback: open in browser if app not installed
      Linking.openURL(linkedinUrl);
    });
  };
  
  return (
    <View style={styles.socialContainer}>
      <TouchableOpacity style={styles.socialIcon}>
        <FontAwesome name="facebook" size={26} color="#1877F3" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openYouTubeChannel}>
        <FontAwesome name="youtube-play" size={26} color="#FF0000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openTwitterProfile}>
        <MaterialCommunityIcons name="alpha-x-circle" size={26} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openLinkedInCompany}>
        <FontAwesome name="linkedin" size={26} color="#0077B5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon} onPress={openWhatsAppChat}>
        <FontAwesome name="whatsapp" size={26} color="#25D366" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialIcon}>
        <Ionicons name="logo-instagram" size={26} color="#E1306C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 10,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#3A3939',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  referralLabel: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: '500',
  },
  referralCode: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 2,
    flex: 1,
  },
  expandButton: {
    marginLeft: 4,
    padding: 2,
  },
  expandButtonText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  copyButton: {
    marginLeft: 6,
    padding: 2,
  },
  inviteButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  connectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 2,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 2,
  },
  socialIcon: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: '90%',
    marginTop: -200, // Move modal 200 pixels up
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 14,
    color: '#FF9800',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  modalButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 