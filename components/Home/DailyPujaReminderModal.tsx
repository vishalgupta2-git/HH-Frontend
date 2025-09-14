import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { markDailyPujaVisited } from '@/utils/dailyPujaUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DailyPujaReminderModalProps {
  visible: boolean;
  onClose: () => void;
  firstName?: string;
}

export default function DailyPujaReminderModal({ 
  visible, 
  onClose, 
  firstName 
}: DailyPujaReminderModalProps) {
  const { isHindi, currentLanguage } = useLanguage();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(4);

  const translations = {
    title: { 
      en: 'ॐ Daily Puja ॐ', 
      hi: 'ॐ दैनिक पूजा ॐ',
      bangla: 'ॐ দৈনিক পূজা ॐ',
      kannada: 'ॐ ದೈನಂದಿನ ಪೂಜೆ ॐ',
      punjabi: 'ॐ ਰੋਜ਼ਾਨਾ ਪੂਜਾ ॐ',
      tamil: 'ॐ தினசரி பூஜை ॐ',
      telugu: 'ॐ రోజుకు పూజ ॐ'
    },
    message: { 
      en: 'Do your daily puja and earn Divine Blessings', 
      hi: 'अपनी दैनिक पूजा करें और दिव्य आशीर्वाद प्राप्त करें',
      bangla: 'আপনার দৈনিক পূজা করুন এবং দিব্য আশীর্বাদ অর্জন করুন',
      kannada: 'ನಿಮ್ಮ ದೈನಂದಿನ ಪೂಜೆಯನ್ನು ಮಾಡಿ ಮತ್ತು ದಿವ್ಯ ಆಶೀರ್ವಾದಗಳನ್ನು ಗಳಿಸಿ',
      punjabi: 'ਆਪਣੀ ਰੋਜ਼ਾਨਾ ਪੂਜਾ ਕਰੋ ਅਤੇ ਦਿਵਿਆ ਆਸ਼ੀਰਵਾਦ ਪ੍ਰਾਪਤ ਕਰੋ',
      tamil: 'உங்கள் தினசரி பூஜையை செய்து தெய்வீக ஆசீர்வாதங்களைப் பெறுங்கள்',
      telugu: 'మీ రోజుకు పూజ చేసి దివ్య ఆశీర్వాదాలను పొందండి'
    },
    autoCloses: { 
      en: 'Auto-closes in', 
      hi: 'स्वचालित रूप से बंद होगा',
      bangla: 'স্বয়ংক্রিয়ভাবে বন্ধ হবে',
      kannada: 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮುಚ್ಚುತ್ತದೆ',
      punjabi: 'ਆਪਣੇ ਆਪ ਬੰਦ ਹੋ ਜਾਵੇਗਾ',
      tamil: 'தானாக மூடப்படும்',
      telugu: 'స్వయంచాలకంగా మూసివేయబడుతుంది'
    },
    startDailyPuja: { 
      en: 'Start Daily Puja', 
      hi: 'दैनिक पूजा शुरू करें',
      bangla: 'দৈনিক পূজা শুরু করুন',
      kannada: 'ದೈನಂದಿನ ಪೂಜೆ ಪ್ರಾರಂಭಿಸಿ',
      punjabi: 'ਰੋਜ਼ਾਨਾ ਪੂਜਾ ਸ਼ੁਰੂ ਕਰੋ',
      tamil: 'தினசரி பூஜையைத் தொடங்குங்கள்',
      telugu: 'రోజుకు పూజను ప్రారంభించండి'
    }
  };

  // Helper function to get translation
  const getTranslation = (key: any) => {
    const lang = currentLanguage === 'hindi' ? 'hi' : 
                 currentLanguage === 'bangla' ? 'bangla' : 
                 currentLanguage === 'kannada' ? 'kannada' :
                 currentLanguage === 'punjabi' ? 'punjabi' :
                 currentLanguage === 'tamil' ? 'tamil' :
                 currentLanguage === 'telugu' ? 'telugu' : 'en';
    return key[lang] || key.en;
  };

  // Auto-close timer
  useEffect(() => {
    if (visible && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (visible && timeLeft === 0) {
      onClose();
    }
  }, [visible, timeLeft, onClose]);

  // Reset timer when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTimeLeft(4);
    }
  }, [visible]);

  const handleStartDailyPuja = async () => {
    try {
      // Mark that user has visited daily puja today
      await markDailyPujaVisited();
      
      // Navigate to test temple screen
      router.push('/screens/testtemple');
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error starting daily puja:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{getTranslation(translations.title)}</Text>
            
            <Text style={styles.message}>
              {firstName ? `${firstName}, ` : ''}{getTranslation(translations.message)}
            </Text>

            {/* Timer indicator */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{getTranslation(translations.autoCloses)} {timeLeft}s</Text>
            </View>

            {/* Start button */}
            <TouchableOpacity style={styles.startButton} onPress={handleStartDailyPuja}>
              <LinearGradient
                colors={['#FFA040', '#FF6A00']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startButtonText}>{getTranslation(translations.startDailyPuja)}</Text>
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
    maxWidth: 350,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 