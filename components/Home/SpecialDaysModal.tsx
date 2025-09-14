import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { UpcomingPuja, formatPujaDate, getDaysUntilText } from '@/utils/specialDaysUtils';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpecialDaysModalProps {
  visible: boolean;
  onClose: () => void;
  upcomingPujas: UpcomingPuja[];
}

export default function SpecialDaysModal({ 
  visible, 
  onClose, 
  upcomingPujas 
}: SpecialDaysModalProps) {
  const { isHindi, currentLanguage } = useLanguage();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(10);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('9:00 AM');
  const [loading, setLoading] = useState(false);

  const translations = {
    autoClosesIn: { 
      en: 'Auto-closes in', 
      hi: 'स्वचालित रूप से बंद होगा',
      bangla: 'স্বয়ংক্রিয়ভাবে বন্ধ হবে',
      kannada: 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮುಚ್ಚುತ್ತದೆ',
      punjabi: 'ਆਪਣੇ ਆਪ ਬੰਦ ਹੋ ਜਾਵੇਗਾ',
      tamil: 'தானாக மூடப்படும்',
      telugu: 'స్వయంచాలకంగా మూసివేయబడుతుంది'
    },
    pujaDetails: { 
      en: 'Puja Details:', 
      hi: 'पूजा विवरण:',
      bangla: 'পূজার বিবরণ:',
      kannada: 'ಪೂಜೆ ವಿವರಗಳು:',
      punjabi: 'ਪੂਜਾ ਵਿਵਰਣ:',
      tamil: 'பூஜை விவரங்கள்:',
      telugu: 'పూజ వివరాలు:'
    },
    specialPujaDetails: { 
      en: 'Special puja details will be available soon.', 
      hi: 'विशेष पूजा विवरण जल्द ही उपलब्ध होगा।',
      bangla: 'বিশেষ পূজার বিবরণ শীঘ্রই উপলব্ধ হবে।',
      kannada: 'ವಿಶೇಷ ಪೂಜೆ ವಿವರಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತದೆ।',
      punjabi: 'ਵਿਸ਼ੇਸ਼ ਪੂਜਾ ਵਿਵਰਣ ਜਲਦੀ ਹੀ ਉਪਲਬਧ ਹੋਵੇਗਾ।',
      tamil: 'சிறப்பு பூஜை விவரங்கள் விரைவில் கிடைக்கும்।',
      telugu: 'ప్రత్యేక పూజ వివరాలు త్వరలో అందుబాటులో ఉంటాయి।'
    },
    morePujas: { 
      en: 'more special pujas coming up', 
      hi: 'और विशेष पूजाएं आने वाली हैं',
      bangla: 'আরও বিশেষ পূজা আসছে',
      kannada: 'ಇನ್ನಷ್ಟು ವಿಶೇಷ ಪೂಜೆಗಳು ಬರುತ್ತಿವೆ',
      punjabi: 'ਹੋਰ ਵਿਸ਼ੇਸ਼ ਪੂਜਾਵਾਂ ਆ ਰਹੀਆਂ ਹਨ',
      tamil: 'மேலும் சிறப்பு பூஜைகள் வருகின்றன',
      telugu: 'మరిన్ని ప్రత్యేక పూజలు వస్తున్నాయి'
    },
    bookPuja: { 
      en: 'Book Puja', 
      hi: 'पूजा बुक करें',
      bangla: 'পূজা বুক করুন',
      kannada: 'ಪೂಜೆ ಬುಕ್ ಮಾಡಿ',
      punjabi: 'ਪੂਜਾ ਬੁਕ ਕਰੋ',
      tamil: 'பூஜை புக்கிங்',
      telugu: 'పూజ బుక్ చేయండి'
    },
    viewAllSpecialPujas: { 
      en: 'View All Special Pujas', 
      hi: 'सभी विशेष पूजाएं देखें',
      bangla: 'সব বিশেষ পূজা দেখুন',
      kannada: 'ಎಲ್ಲಾ ವಿಶೇಷ ಪೂಜೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      punjabi: 'ਸਾਰੀਆਂ ਵਿਸ਼ੇਸ਼ ਪੂਜਾਵਾਂ ਦੇਖੋ',
      tamil: 'அனைத்து சிறப்பு பூஜைகளையும் பார்க்கவும்',
      telugu: 'అన్ని ప్రత్యేక పూజలను చూడండి'
    },
    thanksForRequesting: { 
      en: 'Thanks for requesting', 
      hi: 'अनुरोध के लिए धन्यवाद',
      bangla: 'অনুরোধের জন্য ধন্যবাদ',
      kannada: 'ವಿನಂತಿಸಿದಕ್ಕೆ ಧನ್ಯವಾದಗಳು',
      punjabi: 'ਅਨੁਰੋਧ ਲਈ ਧੰਨਵਾਦ',
      tamil: 'கோரிக்கைக்கு நன்றி',
      telugu: 'అభ్యర్థనకు ధన్యవాదాలు'
    },
    pleaseEnterFollowing: { 
      en: 'please enter the following to let us contact you', 
      hi: 'कृपया हमसे संपर्क करने के लिए निम्नलिखित दर्ज करें',
      bangla: 'আমাদের সাথে যোগাযোগের জন্য অনুগ্রহ করে নিম্নলিখিত তথ্য দিন',
      kannada: 'ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ನಮೂದಿಸಿ',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਗਏ ਭਰੋ',
      tamil: 'எங்களைத் தொடர்பு கொள்ள தயவுசெய்து பின்வருவனவற்றை உள்ளிடவும்',
      telugu: 'మాతో సంప్రదించడానికి దయచేసి క్రింది వివరాలను నమోదు చేయండి'
    },
    fullName: { 
      en: 'Full Name', 
      hi: 'पूरा नाम',
      bangla: 'পুরো নাম',
      kannada: 'ಪೂರ್ಣ ಹೆಸರು',
      punjabi: 'ਪੂਰਾ ਨਾਮ',
      tamil: 'முழு பெயர்',
      telugu: 'పూర్తి పేరు'
    },
    phoneNumber: { 
      en: 'Phone Number', 
      hi: 'फोन नंबर',
      bangla: 'ফোন নম্বর',
      kannada: 'ಫೋನ್ ನಂಬರ್',
      punjabi: 'ਫੋਨ ਨੰਬਰ',
      tamil: 'தொலைபேசி எண்',
      telugu: 'ఫోన్ నంబర్'
    },
    date: { 
      en: 'Date:', 
      hi: 'तारीख:',
      bangla: 'তারিখ:',
      kannada: 'ದಿನಾಂಕ:',
      punjabi: 'ਤਾਰੀਖ:',
      tamil: 'தேதி:',
      telugu: 'తేదీ:'
    },
    submitting: { 
      en: 'Submitting...', 
      hi: 'जमा हो रहा है...',
      bangla: 'জমা দেওয়া হচ্ছে...',
      kannada: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      punjabi: 'ਜਮ੍ਹਾ ਹੋ ਰਿਹਾ ਹੈ...',
      tamil: 'சமர்ப்பிக்கப்படுகிறது...',
      telugu: 'సమర్పించబడుతోంది...'
    },
    confirm: { 
      en: 'Confirm', 
      hi: 'पुष्टि करें',
      bangla: 'নিশ্চিত করুন',
      kannada: 'ದೃಢೀಕರಿಸಿ',
      punjabi: 'ਪੁਸ਼ਟੀ ਕਰੋ',
      tamil: 'உறுதிப்படுத்தவும்',
      telugu: 'నిర్ధారించండి'
    },
    cancel: { 
      en: 'Cancel', 
      hi: 'रद्द करें',
      bangla: 'বাতিল করুন',
      kannada: 'ರದ್ದುಗೊಳಿಸಿ',
      punjabi: 'ਰੱਦ ਕਰੋ',
      tamil: 'ரத்து செய்',
      telugu: 'రద్దు చేయండి'
    },
    pleaseEnterValidName: { 
      en: 'Please enter a valid name and phone number.', 
      hi: 'कृपया एक वैध नाम और फोन नंबर दर्ज करें।',
      bangla: 'অনুগ্রহ করে একটি বৈধ নাম এবং ফোন নম্বর দিন।',
      kannada: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಹೆಸರು ಮತ್ತು ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ।',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਨਾਮ ਅਤੇ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
      tamil: 'தயவுசெய்து சரியான பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும்।',
      telugu: 'దయచేసి చెల్లుబాటు అయ్యే పేరు మరియు ఫోన్ నంబర్ నమోదు చేయండి।'
    },
    noPujaSelected: { 
      en: 'No puja selected. Please try again.', 
      hi: 'कोई पूजा चयनित नहीं। कृपया पुनः प्रयास करें।',
      bangla: 'কোন পূজা নির্বাচিত হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      kannada: 'ಯಾವುದೇ ಪೂಜೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ। ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      punjabi: 'ਕੋਈ ਪੂਜਾ ਚੁਣੀ ਨਹੀਂ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      tamil: 'பூஜை தேர்ந்தெடுக்கப்படவில்லை। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      telugu: 'పూజ ఎంచుకోబడలేదు। దయచేసి మళ్లీ ప్రయత్నించండి।'
    },
    success: { 
      en: 'Success', 
      hi: 'सफलता',
      bangla: 'সফলতা',
      kannada: 'ಯಶಸ್ಸು',
      punjabi: 'ਸਫਲਤਾ',
      tamil: 'வெற்றி',
      telugu: 'విజయం'
    },
    bookingSubmitted: { 
      en: 'Your special puja booking request has been submitted successfully!', 
      hi: 'आपका विशेष पूजा बुकिंग अनुरोध सफलतापूर्वक जमा हो गया है!',
      bangla: 'আপনার বিশেষ পূজা বুকিং অনুরোধ সফলভাবে জমা দেওয়া হয়েছে!',
      kannada: 'ನಿಮ್ಮ ವಿಶೇಷ ಪೂಜೆ ಬುಕಿಂಗ್ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      punjabi: 'ਤੁਹਾਡਾ ਵਿਸ਼ੇਸ਼ ਪੂਜਾ ਬੁਕਿੰਗ ਅਨੁਰੋਧ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾ ਹੋ ਗਿਆ ਹੈ!',
      tamil: 'உங்கள் சிறப்பு பூஜை புக்கிங் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      telugu: 'మీ ప్రత్యేక పూజ బుకింగ్ అభ్యర్థన విజయవంతంగా సమర్పించబడింది!'
    },
    error: { 
      en: 'Error', 
      hi: 'त्रुटि',
      bangla: 'ত্রুটি',
      kannada: 'ದೋಷ',
      punjabi: 'ਗਲਤੀ',
      tamil: 'பிழை',
      telugu: 'లోపం'
    },
    failedToSave: { 
      en: 'Failed to save booking:', 
      hi: 'बुकिंग सहेजने में विफल:',
      bangla: 'বুকিং সংরক্ষণ করতে ব্যর্থ:',
      kannada: 'ಬುಕಿಂಗ್ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ:',
      punjabi: 'ਬੁਕਿੰਗ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ:',
      tamil: 'புக்கிங் சேமிக்க முடியவில்லை:',
      telugu: 'బుకింగ్ సేవ్ చేయడంలో విఫలమైంది:'
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

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

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
      setTimeLeft(10);
    }
  }, [visible]);

  const handleBookPuja = () => {
    onClose();
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!name.trim() || phone.length < 7) {
      Alert.alert(getTranslation(translations.pleaseEnterValidName));
      return;
    }
    
    if (!upcomingPujas[0]?.pujaName) {
      Alert.alert(getTranslation(translations.error), getTranslation(translations.noPujaSelected));
      return;
    }
    
    const bookingData = {
      name,
      phone: parseInt(phone) || phone,
      date: date.toISOString(),
      slot,
      pujaName: upcomingPujas[0].pujaName,
      pujaId: null,
    };
    
    setLoading(true);
    
    try {
      // Submitting special puja booking
      const response = await axios.post(getEndpointUrl('SPECIAL_PUJA'), bookingData, {
        headers: getAuthHeaders()
      });
              // Booking response received
      setBookingModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert(getTranslation(translations.success), getTranslation(translations.bookingSubmitted));
    } catch (err: any) {
      console.error('❌ Booking error:', err.message);
      console.error('❌ Booking error response:', err.response?.data);
      Alert.alert(getTranslation(translations.error), `${getTranslation(translations.failedToSave)} ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPujas = () => {
    onClose();
    router.push('/screens/special-puja');
  };

  const handleClose = () => {
    onClose();
  };

  if (upcomingPujas.length === 0) {
    return null;
  }

  const nextPuja = upcomingPujas[0]; // Get the closest upcoming puja

  return (
    <>
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
              <Text style={styles.title}>
                ॐ Upcoming {nextPuja.pujaName} on {formatPujaDate(nextPuja.nextDate)} ॐ
              </Text>
              
              <Text style={styles.subtitle}>
                {getDaysUntilText(nextPuja.daysUntil)}
              </Text>

              {/* Timer indicator */}
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{getTranslation(translations.autoClosesIn)} {timeLeft}s</Text>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>{getTranslation(translations.pujaDetails)}</Text>
                <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailsText}>
                    {nextPuja.pujaDetails || getTranslation(translations.specialPujaDetails)}
                  </Text>
                </ScrollView>
              </View>

              {upcomingPujas.length > 1 && (
                <View style={styles.morePujasContainer}>
                  <Text style={styles.morePujasText}>
                    +{upcomingPujas.length - 1} {getTranslation(translations.morePujas)}
                  </Text>
                </View>
              )}

              {/* Book Puja button */}
              <TouchableOpacity style={styles.bookPujaButton} onPress={handleBookPuja}>
                <LinearGradient
                  colors={['#FFA040', '#FF6A00']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.bookPujaButtonText}>{getTranslation(translations.bookPuja)}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* View Pujas button */}
              <TouchableOpacity style={styles.viewButton} onPress={handleViewPujas}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.viewButtonText}>{getTranslation(translations.viewAllSpecialPujas)}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setBookingModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setBookingModalVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitlePrefix}>{getTranslation(translations.thanksForRequesting)} </Text>
              <Text style={styles.modalTitleBold}>"{upcomingPujas[0]?.pujaName}"</Text>
              <Text style={styles.modalTitleSuffix}> {getTranslation(translations.pleaseEnterFollowing)}</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder={getTranslation(translations.fullName)}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={getTranslation(translations.phoneNumber)}
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.datePickerBtn}>
              <Text style={styles.datePickerText}>{getTranslation(translations.date)} {date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, d) => {
                  setShowDate(false);
                  if (d) setDate(d);
                }}
              />
            )}
            <View style={styles.slotRow}>
              {timeSlots.map(ts => (
                <TouchableOpacity
                  key={ts}
                  style={[styles.slotBtn, slot === ts && styles.slotBtnSelected]}
                  onPress={() => setSlot(ts)}
                >
                  <Text style={[styles.slotText, slot === ts && styles.slotTextSelected]}>{ts}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, {flex: 1, marginRight: 8}]} 
                onPress={handleConfirmBooking}
                disabled={loading}
              >
                <Text style={styles.modalConfirmText}>{loading ? getTranslation(translations.submitting) : getTranslation(translations.confirm)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, {flex: 1, marginLeft: 8}]} onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.modalCancelText}>{getTranslation(translations.cancel)}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
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
    maxHeight: '80%',
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
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsScroll: {
    maxHeight: 120,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'justify',
  },
  morePujasContainer: {
    marginBottom: 20,
  },
  morePujasText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  viewButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bookPujaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bookPujaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
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
  modalTitleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitlePrefix: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalTitleBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  modalTitleSuffix: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  slotBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  slotBtnSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  slotText: {
    fontSize: 14,
    color: '#333',
  },
  slotTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalConfirmBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 