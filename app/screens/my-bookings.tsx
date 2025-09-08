import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Dimensions, StatusBar, Image, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

interface Booking {
  bookingId: string;
  createdAt: string;
  name: string;
  phone: string;
  status: string;
  dateToContact?: string;
  timeSlot?: string;
  dateTimeToContact?: string;
  timeslotToContact?: string;
  // Puja specific fields
  pujaType?: string;
  pujaId?: string;
  price?: number;
  pujaDetails?: string;
  // Donation specific fields
  amount?: number;
  currency?: string;
  templeCharityId?: string;
  templeCharityName?: string;
  // Mannat specific fields
  mannatDesire?: string;
  mannatOption?: string;
  // Service specific fields
  serviceType?: string;
  providerId?: string;
  providerName?: string;
  // Common fields
  bookingType: 'puja' | 'donation' | 'mannat' | 'service';
}

const statusOptions = [
  'All',
  'New Booking',
  'Confirmed',
  'Cancelled',
  'Declined',
  'Scheduled',
  'Done - Evidence Pending',
  'Completed'
];

export default function MyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkUserAccess();
  }, []);

  useEffect(() => {
    if (userEmail === 'vishalgupta2@gmail.com') {
      fetchBookings();
    }
  }, [userEmail]);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus]);

  const checkUserAccess = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
        
        if (user.email !== 'vishalgupta2@gmail.com') {
          Alert.alert('Access Denied', 'This feature is only available for authorized users.');
          router.back();
        }
      } else {
        Alert.alert('Login Required', 'Please login to access this feature.');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error checking user access:', error);
      Alert.alert('Error', 'Unable to verify user access.');
      router.back();
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // First test if backend is accessible
      try {
        const testResponse = await axios.get(getEndpointUrl('PING'), {
          headers: getAuthHeaders()
        });
      } catch (testError) {
        Alert.alert('Error', 'Backend server is not accessible. Please check if the server is running.');
        return;
      }
      
      const response = await axios.get(getEndpointUrl('MY_BOOKINGS'), {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        Alert.alert('Error', `Server error: ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        Alert.alert('Error', 'Network error: Unable to connect to server');
      } else {
        Alert.alert('Error', 'Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!bookings || !Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }
    
    let filtered = [...bookings];
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
    }
    
    // Sort by dateToContact/dateTimeToContact and timeSlot/timeslotToContact (descending)
    filtered.sort((a, b) => {
      const dateA = a.dateToContact || a.dateTimeToContact || '';
      const dateB = b.dateToContact || b.dateTimeToContact || '';
      const timeA = a.timeSlot || a.timeslotToContact || '';
      const timeB = b.timeSlot || b.timeslotToContact || '';
      
      if (dateA !== dateB) {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      return timeB.localeCompare(timeA);
    });
    
    setFilteredBookings(filtered);
  };

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'puja': return '🕉️';
      case 'donation': return '💰';
      case 'mannat': return '🙏';
      case 'service': return '🔧';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New Booking': return '#FFA500';
      case 'Confirmed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      case 'Declined': return '#F44336';
      case 'Scheduled': return '#2196F3';
      case 'Done - Evidence Pending': return '#FF9800';
      case 'Completed': return '#4CAF50';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (userEmail !== 'vishalgupta2@gmail.com') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Mantras screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Hindu Heritage</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>My Bookings</Text>
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowStatusFilter(true)}
          >
            <Text style={styles.filterButtonText}>
              Status: {selectedStatus}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tilesContainer}>
            {filteredBookings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bookings found</Text>
                <Text style={styles.emptySubtext}>
                  {selectedStatus !== 'All' ? `No ${selectedStatus.toLowerCase()} bookings` : 'You haven\'t made any bookings yet'}
                </Text>
              </View>
            ) : (
              filteredBookings.map((booking, index) => (
                <TouchableOpacity
                  key={`${booking.bookingType}-${booking.bookingId}`}
                  style={styles.tile}
                  onPress={() => openBookingModal(booking)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeader}>
                    <Text style={styles.tileIcon}>{getBookingTypeIcon(booking.bookingType)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                      <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.tileTitle} numberOfLines={1}>
                    {booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)} Booking
                  </Text>
                  
                  <Text style={styles.tileDetail} numberOfLines={1}>
                    Name: {booking.name || 'N/A'} | Phone: {booking.phone || 'N/A'}
                  </Text>
                  
                  <Text style={styles.tileDetail} numberOfLines={1}>
                    Date: {formatDate(booking.dateToContact || booking.dateTimeToContact || '')} | Time: {formatTime(booking.timeSlot || booking.timeslotToContact || '')}
                  </Text>
                  
                  {booking.amount && (
                    <Text style={styles.tileDetail} numberOfLines={1}>
                      Amount: {booking.currency || '₹'}{booking.amount}
                    </Text>
                  )}
                  
                  {booking.pujaType && (
                    <Text style={styles.tileDetail} numberOfLines={1}>
                      Puja: {booking.pujaType === 'professional' ? 'prof' : booking.pujaType === 'special' ? 'spl' : booking.pujaType}
                    </Text>
                  )}
                  
                  {booking.mannatDesire && (
                    <Text style={styles.tileDetail} numberOfLines={1}>
                      Mannat: {booking.mannatDesire}
                    </Text>
                  )}
                  
                  {booking.serviceType && (
                    <Text style={styles.tileDetail} numberOfLines={1}>
                      Service: {booking.serviceType}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Status Filter Modal */}
      <Modal
        visible={showStatusFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusFilter(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowStatusFilter(false)}
        >
          <TouchableOpacity 
            style={styles.filterModalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.filterModalTitle}>Filter by Status</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.filterOption}
                onPress={() => {
                  setSelectedStatus(status);
                  setShowStatusFilter(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedStatus === status && styles.filterOptionTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Booking Detail Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeBookingModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeBookingModal}
        >
          <TouchableOpacity 
            style={styles.bookingModalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            {selectedBooking && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedBooking.bookingType.charAt(0).toUpperCase() + selectedBooking.bookingType.slice(1)} Booking Details
                  </Text>
                  <TouchableOpacity onPress={closeBookingModal}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Booking ID:</Text>
                    <Text style={styles.modalValue}>{selectedBooking.bookingId}</Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                      <Text style={styles.modalStatusText}>{selectedBooking.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Name:</Text>
                    <Text style={styles.modalValue}>{selectedBooking.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Phone:</Text>
                    <Text style={styles.modalValue}>{selectedBooking.phone || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>
                      {formatDate(selectedBooking.dateToContact || selectedBooking.dateTimeToContact || '')}
                    </Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Time:</Text>
                    <Text style={styles.modalValue}>
                      {formatTime(selectedBooking.timeSlot || selectedBooking.timeslotToContact || '')}
                    </Text>
                  </View>
                  
                  {selectedBooking.amount && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Amount:</Text>
                      <Text style={styles.modalValue}>
                        {selectedBooking.currency || '₹'}{selectedBooking.amount}
                      </Text>
                    </View>
                  )}
                  
                                     {selectedBooking.pujaType && (
                     <View style={styles.modalDetailRow}>
                       <Text style={styles.modalLabel}>Puja Type:</Text>
                       <Text style={styles.modalValue}>
                         {selectedBooking.pujaType === 'professional' ? 'prof' : selectedBooking.pujaType === 'special' ? 'spl' : selectedBooking.pujaType}
                       </Text>
                     </View>
                   )}
                  
                  {selectedBooking.pujaDetails && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Puja Details:</Text>
                      <Text style={styles.modalValue}>{selectedBooking.pujaDetails}</Text>
                    </View>
                  )}
                  
                  {selectedBooking.mannatDesire && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Mannat Desire:</Text>
                      <Text style={styles.modalValue}>{selectedBooking.mannatDesire}</Text>
                    </View>
                  )}
                  
                  {selectedBooking.mannatOption && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Mannat Option:</Text>
                      <Text style={styles.modalValue}>{selectedBooking.mannatOption}</Text>
                    </View>
                  )}
                  
                  {selectedBooking.serviceType && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Service Type:</Text>
                      <Text style={styles.modalValue}>{selectedBooking.serviceType}</Text>
                    </View>
                  )}
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Created:</Text>
                    <Text style={styles.modalValue}>
                      {formatDate(selectedBooking.createdAt)}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export const options = { headerShown: false };

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
    width: width * 1.5 * 0.8 * 1.2,
    height: 120 * 0.8 * 1.2,
    left: width * -0.25 * 0.8,
    bottom: 0,
    resizeMode: 'contain',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: CARD_MARGIN_TOP,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  tilesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileIcon: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tileDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  bookingModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    padding: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  modalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
