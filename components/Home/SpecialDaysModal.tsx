import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { UpcomingPuja, formatPujaDate, getDaysUntilText } from '@/utils/specialDaysUtils';
import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';

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
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(10);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('9:00 AM');
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Please enter a valid name and phone number.');
      return;
    }
    
    if (!upcomingPujas[0]?.pujaName) {
      Alert.alert('Error', 'No puja selected. Please try again.');
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
      console.log('🔄 Submitting special puja booking:', bookingData);
      const response = await axios.post(getEndpointUrl('SPECIAL_PUJA'), bookingData);
      console.log('✅ Booking response:', response.data);
      setBookingModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert('Success', 'Your special puja booking request has been submitted successfully!');
    } catch (err: any) {
      console.error('❌ Booking error:', err.message);
      console.error('❌ Booking error response:', err.response?.data);
      Alert.alert('Error', `Failed to save booking: ${err.response?.data?.error || err.message}`);
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
                <Text style={styles.timerText}>Auto-closes in {timeLeft}s</Text>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Puja Details:</Text>
                <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailsText}>
                    {nextPuja.pujaDetails || 'Special puja details will be available soon.'}
                  </Text>
                </ScrollView>
              </View>

              {upcomingPujas.length > 1 && (
                <View style={styles.morePujasContainer}>
                  <Text style={styles.morePujasText}>
                    +{upcomingPujas.length - 1} more special pujas coming up
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
                  <Text style={styles.bookPujaButtonText}>Book Puja</Text>
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
                  <Text style={styles.viewButtonText}>View All Special Pujas</Text>
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
              <Text style={styles.modalTitlePrefix}>Thanks for requesting </Text>
              <Text style={styles.modalTitleBold}>"{upcomingPujas[0]?.pujaName}"</Text>
              <Text style={styles.modalTitleSuffix}> please enter the following to let us contact you</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.datePickerBtn}>
              <Text style={styles.datePickerText}>Date: {date.toLocaleDateString()}</Text>
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
                <Text style={styles.modalConfirmText}>{loading ? 'Submitting...' : 'Confirm'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, {flex: 1, marginLeft: 8}]} onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
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