import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Image } from 'react-native';
import { getImageSource } from '@/utils/iconMappings';

const timeSlots = [
  '8:00-10:00 AM', '10:00-12:00 PM', '12:00-2:00 PM', '2:00-4:00 PM',
  '4:00-6:00 PM', '6:00-8:00 PM', '8:00-10:00 PM'
];

interface SpecialPujaData {
  createdAt?: string;
  pujaID?: string;
  pujaName?: string;
  icon?: string;
  individual?: boolean;
  couple?: boolean;
  family?: boolean;
  promote?: boolean;
  pujaDetails?: string;
}

// Helper function to safely convert any value to string
function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  // Handle ObjectId and other complex types
  if (value && typeof value === 'object') {
    if (value.toString) return value.toString();
    return JSON.stringify(value);
  }
  return String(value);
}



export const options = { headerShown: false };

export default function SpecialPujaScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [currentPuja, setCurrentPuja] = useState<SpecialPujaData | null>(null);
  const [pujaFiles, setPujaFiles] = useState<SpecialPujaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('8:00-10:00 AM');

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        console.log('🔄 Fetching special pujas from:', getEndpointUrl('SPECIAL_PUJA'));
        const res = await axios.get(getEndpointUrl('SPECIAL_PUJA'));
        console.log('✅ Special puja API response:', res.data);
        
        // Filter out any items with null/undefined values that might cause rendering issues
        const filteredData = res.data.filter((puja: any) => puja && typeof puja === 'object');
        console.log('📊 Filtered special puja data:', filteredData.length, 'records');
        setPujaFiles(filteredData);
      } catch (e: any) {
        console.error('❌ Error fetching special pujas:', e.message);
        console.error('❌ Error response:', e.response?.data);
        Alert.alert('Failed to fetch special pujas', e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  const handlePlay = (puja: SpecialPujaData) => {
    // Validate puja object before setting
    if (!puja || typeof puja !== 'object') {
      return;
    }
    
    setCurrentPuja(puja);
    setModalVisible(true);
  };

  const handleBookPuja = () => {
    setModalVisible(false);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!name.trim() || phone.length < 7) {
      Alert.alert('Please enter a valid name and phone number.');
      return;
    }
    
    if (!currentPuja?.pujaName) {
      Alert.alert('Error', 'No puja selected. Please try again.');
      return;
    }
    
    const bookingData = {
      name,
      phone: parseInt(phone) || phone, // Convert to number if possible
      date: date.toISOString(), // Convert Date to ISO string for backend
      slot,
      pujaName: currentPuja?.pujaName, // Send puja name instead of pujaType
      pujaId: currentPuja?.pujaID,
    };
    
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
    }
  };

  // Filter pujas based on search query
  const filteredPujas = pujaFiles.filter(puja => {
    // Ensure puja is a valid object
    if (!puja || typeof puja !== 'object') {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        (puja.pujaName && safeString(puja.pujaName).toLowerCase().includes(q)) ||
        (puja.pujaDetails && safeString(puja.pujaDetails).toLowerCase().includes(q)) ||
        (puja.individual && safeString(puja.individual).toLowerCase().includes(q)) ||
        (puja.couple && safeString(puja.couple).toLowerCase().includes(q)) ||
        (puja.family && safeString(puja.family).toLowerCase().includes(q)) ||
        (puja.promote && safeString(puja.promote).toLowerCase().includes(q))
      );
    }
    
    return true;
  });

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Special Pujas" showDailyPujaButton={false} onSearchChange={setSearchQuery} />
      {/* Puja List */}
      <ScrollView style={styles.content}>
        <Text style={styles.headline}>Mark your milestones with Divine Blessings</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : filteredPujas.length === 0 ? (
          <Text style={styles.noDataText}>No special pujas found matching your criteria</Text>
        ) : (
          filteredPujas.map((puja, idx) => {
            // Additional safety check
            if (!puja || typeof puja !== 'object') {
              return null;
            }
            
            return (
                             <TouchableOpacity
                 key={puja.pujaID || idx}
                 style={styles.pujaCard}
                 onPress={() => handlePlay(puja)}
               >
                 <View style={styles.pujaCardContent}>
                   {/* Puja Icon on the left */}
                   {puja.icon && getImageSource(puja.icon) && (
                     <View style={styles.pujaIconContainer}>
                       <Image 
                         source={getImageSource(puja.icon)} 
                         style={styles.pujaIcon}
                         resizeMode="contain"
                       />
                     </View>
                   )}
                   
                   {/* Puja Name and Type Icons on the right */}
                   <View style={styles.pujaInfoContainer}>
                     {/* Puja Name */}
                     <Text style={styles.pujaName}>{safeString(puja.pujaName || 'Puja Name')}</Text>
                     
                     {/* Type Icons Row */}
                     <View style={styles.typeIconsRow}>
                       {puja.individual && (
                         <View style={styles.typeIconContainer}>
                           <MaterialCommunityIcons name="account" size={20} color="#666" />
                         </View>
                       )}
                                               {puja.couple && (
                          <View style={styles.typeIconContainer}>
                            <Image 
                              source={require('@/assets/images/icons/specialPujaIcons/coupleIcon.png')}
                              style={{ width: 20, height: 20 }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                                               {puja.family && (
                          <View style={styles.typeIconContainer}>
                            <Image 
                              source={require('@/assets/images/icons/specialPujaIcons/FamilyIcon.png')}
                              style={{ width: 20, height: 20 }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                       {puja.promote && (
                         <View style={styles.typeIconContainer}>
                           <MaterialCommunityIcons name="star" size={20} color="#666" />
                         </View>
                       )}
                     </View>
                   </View>
                 </View>
               </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      {/* Puja Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setCurrentPuja(null);
        }}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
          setModalVisible(false);
          setCurrentPuja(null);
        }}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false);
              setCurrentPuja(null);
            }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {currentPuja && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalTitle}>{safeString(currentPuja.pujaName || 'Puja Name')}</Text>
                
                {currentPuja.pujaDetails && currentPuja.pujaDetails !== '' && (
                  <Text style={styles.modalDescription}>{safeString(currentPuja.pujaDetails)}</Text>
                )}
                
                {currentPuja.individual && (
                  <Text style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Type: </Text>
                    Individual
                  </Text>
                )}
                {currentPuja.couple && (
                  <Text style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Type: </Text>
                    Couple
                  </Text>
                )}
                {currentPuja.family && (
                  <Text style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Type: </Text>
                    Family
                  </Text>
                )}
                {currentPuja.promote && (
                  <Text style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Type: </Text>
                    Promote
                  </Text>
                )}
                
                <TouchableOpacity style={styles.bookPujaButton} onPress={handleBookPuja}>
                  <Text style={styles.bookPujaButtonText}>Book Puja</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
              <Text style={styles.modalTitleBold}>"{currentPuja?.pujaName}"</Text>
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
              <TouchableOpacity style={[styles.modalConfirmBtn, {flex: 1, marginRight: 8}]} onPress={handleConfirmBooking}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, {flex: 1, marginLeft: 8}]} onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: {
    padding: 15,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  pujaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00',
  },
  pujaCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pujaIconContainer: {
    marginRight: 16,
  },
  pujaInfoContainer: {
    flex: 1,
  },
  pujaIcon: {
    width: 64,
    height: 64,
    alignSelf: 'center',
  },
  typeIconsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  typeIconContainer: {
    marginHorizontal: 4,
    padding: 4,
  },
  pujaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pujaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  pujaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pujaDetail: {
    fontSize: 13,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  modalContent: {
    width: '100%',
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalDetail: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  modalDetailLabel: {
    fontWeight: 'bold',
    color: '#222',
  },
  bookPujaButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookPujaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitlePrefix: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#222',
    textAlign: 'center',
  },
  modalTitleBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  modalTitleSuffix: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#222',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#222',
    backgroundColor: '#FAFAFA',
    width: '100%',
  },
  datePickerBtn: {
    backgroundColor: '#FFF6EE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  slotBtn: {
    borderWidth: 1,
    borderColor: '#FFD6A0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#FFF6EE',
  },
  slotBtnSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFE0B2',
  },
  slotText: {
    color: '#888',
    fontSize: 15,
  },
  slotTextSelected: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    backgroundColor: '#3A3939',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}); 