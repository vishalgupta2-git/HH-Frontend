import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const deityList = [
  'Lord Agni',
  'Lord Brahma',
  'Lord Ganesha',
  'Lord Hanuman',
  'Lord Indra',
  'Lord Krishna',
  'Lord Rama',
  'Lord Shiva',
  'Lord Skanda (also known as Kartikeya or Murugan)',
  'Lord Vishnu',
  'Khatu Shyam Ji',
  'Goddess Durga',
  'Goddess Kali',
  'Goddess Lakshmi',
  'Goddess Parvati',
  'Goddess Saraswati',
];

const timeSlots = [
  '8:00-10:00 AM', '10:00-12:00 PM', '12:00-2:00 PM', '2:00-4:00 PM',
  '4:00-6:00 PM', '6:00-8:00 PM', '8:00-10:00 PM'
];

interface PujaData {
  createdAt?: string;
  pujaId?: string;
  pujaName?: string;
  mainDeity?: string;
  purpose?: string;
  days?: number;
  hours?: number;
  price?: number;
  details?: string;
}

function extractYouTubeId(url: string): string | null {
  let videoId: string | null = null;
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  const embedMatch = url.match(/embed\/([\w-]+)/);
  if (embedMatch) videoId = embedMatch[1];
  return videoId;
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

export default function ProfessionalPujaScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [currentPuja, setCurrentPuja] = useState<PujaData | null>(null);
  const [pujaFiles, setPujaFiles] = useState<PujaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [deityDropdownOpen, setDeityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState('8:00-10:00 AM');

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await axios.get(getEndpointUrl('PROFESSIONAL_PUJAS'), {
          headers: getAuthHeaders()
        });
        // Filter out any items with null/undefined values that might cause rendering issues
        const filteredData = res.data.filter((puja: any) => puja && typeof puja === 'object');
        setPujaFiles(filteredData);
      } catch (e) {
        Alert.alert('Failed to fetch professional pujas');
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);



  const handlePlay = (puja: PujaData) => {
    // Validate puja object before setting
    if (!puja || typeof puja !== 'object') {
      return;
    }
    
    setCurrentPuja(puja);
    setModalVisible(true);
    // Note: No Link field in Supabase data, so removing YouTube functionality
    // if (puja.Link && (puja.Link.includes('youtube.com') || puja.Link.includes('youtu.be'))) {
    //   setYoutubePlaying(true);
    // }
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
      pujaId: currentPuja?.pujaId,
      price: currentPuja?.price,
    };
    
    try {
      const response = await axios.post(getEndpointUrl('PROFESSIONAL_PUJA_BOOKING'), bookingData, {
        headers: getAuthHeaders()
      });
      setBookingModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert('Success', 'Your puja booking request has been submitted successfully!');
    } catch (err: any) {
      Alert.alert('Error', `Failed to save booking: ${err.response?.data?.error || err.message}`);
    }
  };

  const iconRowAndDropdown = (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for pujas, deities, or purposes..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color="#666" 
          style={styles.searchIcon}
        />
      </View>
      
      <View style={styles.deityDropdownWrapper}>
        <TouchableOpacity
          style={styles.deityDropdown}
          onPress={() => setDeityDropdownOpen(open => !open)}
        >
          <Text style={styles.deityDropdownText}>
            {selectedDeity || 'Deity'}
          </Text>
          <MaterialCommunityIcons
            name={deityDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
        <Modal
          visible={deityDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeityDropdownOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setDeityDropdownOpen(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <View style={styles.deityDropdownModalList}>
                <ScrollView style={{ maxHeight: 320 }}>
                  {deityList.map(deity => (
                    <TouchableOpacity
                      key={deity}
                      style={[
                        styles.deityDropdownItem,
                        selectedDeity === deity && styles.deityDropdownItemSelected
                      ]}
                      onPress={() => {
                        if (selectedDeity === deity) {
                          setSelectedDeity(null);
                        } else {
                          setSelectedDeity(deity);
                        }
                        setDeityDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.deityDropdownItemText,
                          selectedDeity === deity && styles.deityDropdownItemTextSelected
                        ]}
                      >
                        {deity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );

  // Filter pujas based on selected type and deity
  const filteredPujas = pujaFiles.filter(puja => {
    // Ensure puja is a valid object
    if (!puja || typeof puja !== 'object') {
      return false;
    }
    
    // Filter by deity
    if (selectedDeity) {
      const deity = safeString(puja.mainDeity || '');
      if (deity !== selectedDeity) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        (puja.pujaName && safeString(puja.pujaName).toLowerCase().includes(q)) ||
        (puja.details && safeString(puja.details).toLowerCase().includes(q)) ||
        (puja.mainDeity && safeString(puja.mainDeity).toLowerCase().includes(q)) ||
        (puja.purpose && safeString(puja.purpose).toLowerCase().includes(q)) ||
        (puja.days && safeString(puja.days).toLowerCase().includes(q)) ||
        (puja.hours && safeString(puja.hours).toLowerCase().includes(q)) ||
        (puja.price && safeString(puja.price).toLowerCase().includes(q))
      );
    }
    
    return true;
  });

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Pujas" extraContent={iconRowAndDropdown} showDailyPujaButton={false} showSearchBar={false} />
      {/* Puja List */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeader}>Puja Library</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : filteredPujas.length === 0 ? (
          <Text style={styles.noDataText}>
            {searchQuery.trim() || selectedDeity 
              ? 'No pujas found matching your current filters. Try adjusting your search or deity selection.'
              : 'No pujas found. Please check the database.'
            }
          </Text>
        ) : (
                     filteredPujas.map((puja, idx) => {
             // Additional safety check
             if (!puja || typeof puja !== 'object') {
               return null;
             }
            
            return (
              <TouchableOpacity
                key={puja.pujaId || idx}
                style={styles.pujaCard}
                onPress={() => handlePlay(puja)}
              >
                <View style={styles.pujaHeader}>
                  <Text style={styles.pujaName}>{safeString(puja.pujaName || 'Puja Name')}</Text>
                </View>
                
                <View style={styles.pujaDetails}>
                  {puja.mainDeity && puja.mainDeity !== '' && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                      {' '}{safeString(puja.mainDeity)}
                    </Text>
                  )}
                  {puja.purpose && puja.purpose !== '' && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="target" size={16} color="#666" />
                      {' '}{safeString(puja.purpose)}
                    </Text>
                  )}
                  {typeof puja.days === 'number' && puja.days > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                      {' '}{safeString(puja.days)} days
                    </Text>
                  )}
                  {typeof puja.hours === 'number' && puja.hours > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="clock" size={16} color="#666" />
                      {' '}{safeString(puja.hours)} hours
                    </Text>
                  )}
                  {typeof puja.price === 'number' && puja.price > 0 && (
                    <Text style={styles.pujaDetail}>
                      <MaterialCommunityIcons name="currency-inr" size={16} color="#FF6A00" />
                      {' '}₹{safeString(puja.price)}
                    </Text>
                  )}
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
          setYoutubePlaying(false);
        }}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
          setModalVisible(false);
          setCurrentPuja(null);
          setYoutubePlaying(false);
        }}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false);
              setCurrentPuja(null);
              setYoutubePlaying(false);
            }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
                    {currentPuja && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{safeString(currentPuja.pujaName || 'Puja Name')}</Text>
              
              {currentPuja.details && currentPuja.details !== '' && (
                <Text style={styles.modalDescription}>{safeString(currentPuja.details)}</Text>
              )}
              
              {currentPuja.mainDeity && currentPuja.mainDeity !== '' && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Main Deity: </Text>
                  {safeString(currentPuja.mainDeity)}
                </Text>
              )}
              
              {currentPuja.purpose && currentPuja.purpose !== '' && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Purpose: </Text>
                  {safeString(currentPuja.purpose)}
                </Text>
              )}
              
              {typeof currentPuja.days === 'number' && currentPuja.days > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Duration: </Text>
                  {safeString(currentPuja.days)} days
                </Text>
              )}
              
              {typeof currentPuja.hours === 'number' && currentPuja.hours > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Hours: </Text>
                  {safeString(currentPuja.hours)} hours
                </Text>
              )}
              
              {typeof currentPuja.price === 'number' && currentPuja.price > 0 && (
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Price: </Text>
                  ₹{safeString(currentPuja.price)}
                </Text>
              )}
              
              {/* Note: No Link field in Supabase data */}
              {/* {currentPuja.Link && currentPuja.Link !== '' && (
                <Text style={styles.modalLink}>Link: {safeString(currentPuja.Link)}</Text>
              )} */}
              
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
  iconRowTight: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#FFF6EE',
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  iconButtonSelected: {
    backgroundColor: '#FF6A00',
  },
  deityDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownModalList: {
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 320,
    paddingVertical: 4,
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  deityDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  content: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
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
  typeBadge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pujaDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
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
  pujaPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoModalBackground: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  nonYouTubeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
                modalLink: {
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
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
  modalContent: {
    width: '100%',
    paddingTop: 20,
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
  closeButtonText: {
    fontSize: 28,
    color: '#FF6A00',
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  searchInputContainer: {
    position: 'relative',
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
}); 