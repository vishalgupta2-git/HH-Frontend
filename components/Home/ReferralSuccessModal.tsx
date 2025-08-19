import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReferralSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReferralSuccessModal({ visible, onClose }: ReferralSuccessModalProps) {
  const [mudrasEarned, setMudrasEarned] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  useEffect(() => {
    // Check if user came from signup with referral
    checkReferralStatus();
  }, []);

  const checkReferralStatus = async () => {
    try {
      const referralStatus = await AsyncStorage.getItem('referralStatus');
      if (referralStatus) {
        const status = JSON.parse(referralStatus);
        if (status.fromSignup && status.mudrasEarned) {
          setMudrasEarned(status.mudrasEarned);
          // Clear the referral status after showing
          await AsyncStorage.removeItem('referralStatus');
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!visible || mudrasEarned === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>
              🎉 Welcome to Hindu Heritage!
            </Text>
            
            <Text style={styles.subtitle}>
              You've successfully joined using a referral code!
            </Text>

            <View style={styles.mudraContainer}>
              <Text style={styles.mudraText}>
                +{mudrasEarned} Mudras Earned!
              </Text>
              <Text style={styles.mudraSubtext}>
                Both you and your referrer have earned mudras
              </Text>
            </View>

            <Text style={styles.message}>
              Thank you for joining our spiritual community. Start exploring the app to earn more mudras and enhance your spiritual journey!
            </Text>

            <TouchableOpacity style={styles.okButton} onPress={handleClose}>
              <LinearGradient
                colors={['#FFA040', '#FF6A00']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.okButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  mudraContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  mudraText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 4,
  },
  mudraSubtext: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  okButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
