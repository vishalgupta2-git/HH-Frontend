import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEndpointUrl, getAuthHeaders, API_CONFIG } from '../../constants/ApiConfig';
import { useLanguage } from '@/contexts/LanguageContext';

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Time slots for booking
  const timeSlots = [
    '8AM-10AM',
    '10AM-12PM',
    '12PM-2PM',
    '2PM-4PM',
    '4PM-6PM',
    '6PM-8PM'
  ];
  
  interface Provider {
  providerId: string;
  Salutation: string;
  firstName: string;
  lastName: string;
  Gender: string;
  city: string;
  state: string;
  country: string;
  phoneNumber: string;
  photoLibrary: string;
  kundli: boolean;
  astrology: boolean;
  vastu: boolean;
  numerology: boolean;
  createdAt: string;
  updatedAt: string;
  email: string;
  areasServiced: any;
  aboutProvider?: string; // New field for provider description
  imageUrl?: string; // Optional presigned URL for the provider's image
}

const KundliCalculator: React.FC = () => {
  const { isHindi } = useLanguage();
  
  // Provider states
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Booking form states
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const translations = {
    title: { en: 'Kundli Calculator', hi: 'कुंडली कैलकुलेटर' },
    loading: { en: 'Loading providers...', hi: 'प्रदाता लोड हो रहे हैं...' },
    noProviders: { en: 'No providers available', hi: 'कोई प्रदाता उपलब्ध नहीं' },
    bookAppointment: { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें' },
    about: { en: 'About', hi: 'के बारे में' },
    close: { en: 'Close', hi: 'बंद करें' },
    bookingForm: { en: 'Booking Form', hi: 'बुकिंग फॉर्म' },
    name: { en: 'Name', hi: 'नाम' },
    phone: { en: 'Phone', hi: 'फोन' },
    date: { en: 'Date', hi: 'तारीख' },
    timeSlot: { en: 'Time Slot', hi: 'समय स्लॉट' },
    submit: { en: 'Submit', hi: 'जमा करें' },
    submitting: { en: 'Submitting...', hi: 'जमा किया जा रहा है...' },
    success: { en: 'Success', hi: 'सफलता' },
    error: { en: 'Error', hi: 'त्रुटि' },
    bookingSuccess: { en: 'Booking submitted successfully!', hi: 'बुकिंग सफलतापूर्वक जमा हो गई!' },
    bookingError: { en: 'Failed to submit booking', hi: 'बुकिंग जमा करने में विफल' },
    validation: {
      nameRequired: { en: 'Name is required', hi: 'नाम आवश्यक है' },
      phoneRequired: { en: 'Phone is required', hi: 'फोन आवश्यक है' },
      dateRequired: { en: 'Date is required', hi: 'तारीख आवश्यक है' },
      timeSlotRequired: { en: 'Time slot is required', hi: 'समय स्लॉट आवश्यक है' }
    }
  };

  // Fetch providers from API
  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const apiUrl = getEndpointUrl('PROVIDERS') + '/kundli';
      const headers = getAuthHeaders();
      
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
      });
      
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
             if (data.success) {
         setProviders(data.providers || []);
       } else {
        throw new Error(`API error: ${data.error}`);
      }
    } catch (error: any) {
      // Don't set any providers - let the UI show the error state
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };



  // Load providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Show provider details
  const showProviderDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  // Show booking modal
  const openBookingModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  // Validate date is at least 18 hours in future
  const isValidFutureDate = (dateString: string) => {
    const selectedDate = new Date(dateString);
    const now = new Date();
    const minDate = new Date(now.getTime() + (18 * 60 * 60 * 1000)); // 18 hours from now
    return selectedDate >= minDate;
  };

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setBookingDate(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

    // Submit booking
  const submitBooking = async () => {
    if (!selectedProvider) return;
    
    // Validation
    if (bookingName.trim().length < 3) {
      Alert.alert('Invalid Name', 'Name must be at least 3 characters long.');
      return;
    }
    
    if (!bookingPhone || bookingPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    
    if (!bookingDate) {
      Alert.alert('Invalid Date', 'Please select a preferred date.');
      return;
    }
    
    if (!isValidFutureDate(bookingDate)) {
      Alert.alert('Invalid Date', 'Please select a date at least 18 hours in the future.');
      return;
    }
    
    if (!bookingTimeSlot) {
      Alert.alert('Invalid Time', 'Please select a preferred time slot.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestBody = {
        name: bookingName.trim(),
        phone: bookingPhone, // Send as string, let backend handle conversion
        serviceType: 'kundli',
        providerId: selectedProvider.providerId,
        dateTimeToContact: new Date(bookingDate).toISOString(),
        timeslotToContact: bookingTimeSlot,
      };
      
      
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(requestBody),
      });
      
      
      const responseText = await response.text();
      
      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
        }
        
        
        Alert.alert(
          'Booking Successful!',
          'Your appointment has been booked. We will contact you soon.',
          [
            {
              text: 'OK',
                             onPress: () => {
                 setShowBookingModal(false);
                 setBookingName('');
                 setBookingPhone('');
                 setBookingDate('');
                 setBookingTimeSlot('');
                 setSelectedDate(new Date());
               },
            },
          ]
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
     } catch (error) {
       Alert.alert('Error', 'Failed to book appointment. Please try again.');
     } finally {
       setIsSubmitting(false);
     }
   };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
             <View style={styles.providersSection}>
         <View style={styles.titleContainer}>
           <Text style={styles.sectionTitle}>Kundli Service Providers</Text>
           <TouchableOpacity 
             style={styles.infoIcon}
             onPress={() => setShowInfoModal(true)}
           >
             <Text style={styles.infoIconText}>ℹ️</Text>
           </TouchableOpacity>
         </View>
         <Text style={styles.instructionText}>Click on any provider to book kundli services</Text>
         
         {loadingProviders ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA040" />
            <Text style={styles.loadingText}>{isHindi ? translations.loading.hi : translations.loading.en}</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.noProvidersContainer}>
            <Text style={styles.noProvidersText}>{isHindi ? translations.noProviders.hi : translations.noProviders.en}</Text>
          </View>
        ) : (
                     <View style={styles.providersGrid}>
             {providers.map((provider) => (
               <View key={provider.providerId} style={styles.providerCard}>
                 <TouchableOpacity
                   style={styles.providerCardHeader}
                   onPress={() => setExpandedProvider(expandedProvider === provider.providerId ? null : provider.providerId)}
                 >
                   <View style={styles.providerCardContent}>
                     {/* Left side - Image/Icon */}
                     <View style={styles.providerImageContainer}>
                       {provider.imageUrl ? (
                         <Image 
                           source={{ uri: provider.imageUrl }} 
                           style={styles.providerImage}
                           resizeMode="cover"
                           onError={() => {
                           }}
                         />
                       ) : null}
                       {/* Fallback placeholder - will show if image fails or no presigned URL */}
                       <View style={[styles.providerPlaceholder, { position: 'absolute', zIndex: -1 }]}>
                         <Text style={styles.providerPlaceholderText}>
                           {provider.firstName?.charAt(0) || 'P'}
                         </Text>
                       </View>
                     </View>
                     
                     {/* Right side - Content */}
                     <View style={styles.providerContent}>
                       {/* Title: Name */}
                       <Text style={styles.providerName}>
                         {provider.Salutation} {provider.firstName} {provider.lastName}
                       </Text>
                       
                       {/* Services Icons */}
                       <View style={styles.providerServices}>
                         {provider.kundli && <Text style={styles.serviceTag}>Kundli</Text>}
                         {provider.astrology && <Text style={styles.serviceTag}>Astrology</Text>}
                         {provider.vastu && <Text style={styles.serviceTag}>Vastu</Text>}
                         {provider.numerology && <Text style={styles.serviceTag}>Numerology</Text>}
                       </View>
                       
                       {/* Areas Served */}
                       {provider.areasServiced && provider.areasServiced.length > 0 && (
                         <View style={styles.areasServedContainer}>
                           <Text style={styles.areasServedLabel}>Areas served:</Text>
                           <Text style={styles.areasServedText}>
                             {provider.areasServiced.map((area: any) => area.city || area).join(', ')}
                           </Text>
                         </View>
                       )}
                     </View>
                   </View>
                 </TouchableOpacity>
                 
                                   {/* Expanded Details */}
                  {expandedProvider === provider.providerId && (
                    <View style={styles.expandedDetails}>
                      <View style={styles.providerDetailRow}>
                        <Text style={styles.detailLabel}>📍 Location:</Text>
                        <Text style={styles.detailValue}>{provider.city}, {provider.state}, {provider.country}</Text>
                      </View>
                      
                      {provider.aboutProvider && (
                        <View style={styles.providerDetailRow}>
                          <Text style={styles.detailLabel}>ℹ️ About:</Text>
                          <Text style={styles.detailValue}>{provider.aboutProvider}</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => openBookingModal(provider)}
                      >
                        <Text style={styles.bookButtonText}>{isHindi ? translations.bookAppointment.hi : translations.bookAppointment.en}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
               </View>
             ))}
           </View>
        )}
      </View>

      {/* Provider Details Modal */}
      <Modal
        visible={showProviderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProvider && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Provider Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowProviderModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.providerDetailContent}>
                                     <View style={styles.providerDetailImageContainer}>
                     {selectedProvider.imageUrl ? (
                       <Image 
                         source={{ uri: selectedProvider.imageUrl }} 
                         style={styles.providerDetailImage}
                         resizeMode="cover"
                         onError={() => {
                         }}
                       />
                     ) : null}
                     {/* Fallback placeholder for modal */}
                     <View style={[styles.providerDetailPlaceholder, { position: 'absolute', zIndex: -1 }]}>
                       <Text style={styles.providerDetailPlaceholderText}>
                         {selectedProvider.firstName?.charAt(0) || 'P'}
                       </Text>
                     </View>
                   </View>
                  
                  <Text style={styles.providerDetailName}>
                    {selectedProvider.Salutation} {selectedProvider.firstName} {selectedProvider.lastName}
                  </Text>
                  
                  <Text style={styles.providerDetailLocation}>
                    📍 {selectedProvider.city}, {selectedProvider.state}, {selectedProvider.country}
                  </Text>
                  
                  {selectedProvider.phoneNumber && (
                    <Text style={styles.providerDetailContact}>
                      📞 {selectedProvider.phoneNumber}
                    </Text>
                  )}
                  
                  {selectedProvider.email && (
                    <Text style={styles.providerDetailContact}>
                      ✉️ {selectedProvider.email}
                    </Text>
                  )}
                  
                  <View style={styles.providerDetailServices}>
                    <Text style={styles.servicesTitle}>Services Offered:</Text>
                    <View style={styles.servicesList}>
                      {selectedProvider.kundli && <Text style={styles.serviceDetailTag}>🔮 Kundli</Text>}
                      {selectedProvider.astrology && <Text style={styles.serviceDetailTag}>⭐ Astrology</Text>}
                      {selectedProvider.vastu && <Text style={styles.serviceDetailTag}>🏠 Vastu</Text>}
                      {selectedProvider.numerology && <Text style={styles.serviceDetailTag}>🔢 Numerology</Text>}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                      Alert.alert('Contact', `Contact ${selectedProvider.firstName} at ${selectedProvider.phoneNumber || selectedProvider.email}`);
                    }}
                  >
                    <Text style={styles.contactButtonText}>Contact Provider</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
                 </View>
       </Modal>

       {/* Booking Modal */}
       <Modal
         visible={showBookingModal}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowBookingModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             {selectedProvider && (
               <>
                 <View style={styles.modalHeader}>
                   <Text style={styles.modalTitle}>{isHindi ? translations.bookingForm.hi : translations.bookingForm.en}</Text>
                   <TouchableOpacity
                     style={styles.closeButton}
                     onPress={() => setShowBookingModal(false)}
                   >
                     <Text style={styles.closeButtonText}>✕</Text>
                   </TouchableOpacity>
                 </View>
                 
                                   <View style={styles.bookingContent}>
                    <Text style={styles.bookingWelcomeText}>
                      Thank you for your interest in our Kundli Services, please fill in the following details for us to contact you for booking
                    </Text>
                    
                    <Text style={styles.bookingProviderName}>
                      {selectedProvider.Salutation} {selectedProvider.firstName} {selectedProvider.lastName}
                    </Text>
                    
                    <View style={styles.bookingForm}>
                      <Text style={styles.formLabel}>Name *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={bookingName}
                        onChangeText={setBookingName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                      />
                      
                      <Text style={styles.formLabel}>Phone Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={bookingPhone}
                        onChangeText={setBookingPhone}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                      />
                      
                      <Text style={styles.formLabel}>Preferred Date *</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={showDatePickerModal}
                      >
                                            <Text style={styles.datePickerButtonText}>
                      {bookingDate ? bookingDate : 'Select Date'}
                    </Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.formLabel}>Preferred Time Slot *</Text>
                      <View style={styles.timeSlotContainer}>
                        {timeSlots.map((slot) => (
                          <TouchableOpacity
                            key={slot}
                            style={[
                              styles.timeSlotButton,
                              bookingTimeSlot === slot && styles.timeSlotButtonSelected
                            ]}
                            onPress={() => setBookingTimeSlot(slot)}
                          >
                            <Text style={[
                              styles.timeSlotButtonText,
                              bookingTimeSlot === slot && styles.timeSlotButtonTextSelected
                            ]}>
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={submitBooking}
                        disabled={isSubmitting}
                      >
                        <Text style={styles.submitButtonText}>
                          {isSubmitting ? (isHindi ? translations.submitting.hi : translations.submitting.en) : (isHindi ? translations.bookAppointment.hi : translations.bookAppointment.en)}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* 100px white space at the end */}
                      <View style={styles.modalBottomSpacing} />
                    </View>
                  </View>
               </>
             )}
                       </View>
          </View>
        </Modal>
        
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date(Date.now() + 18 * 60 * 60 * 1000)} // 18 hours from now
          />
        )}
        
        {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowInfoModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>About Kundli Services</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowInfoModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  Avail professional Kundli services for accurate birth chart analysis and life guidance. Discover insights on career, health, relationships, and future opportunities with expert astrologers.
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 500,
  },
  // Provider styles
  providersSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA040',
    textAlign: 'center',
  },
  infoIcon: {
    marginLeft: 10,
    padding: 5,
  },
  infoIconText: {
    fontSize: 20,
    color: '#FFA040',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noProvidersContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noProvidersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  providersGrid: {
    flexDirection: 'column',
    gap: 15,
  },
  providerCard: {
    width: screenWidth - 40, // Full width minus margins
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 15,
  },
  providerCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-start',
  },
  providerImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  providerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  providerPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerPlaceholderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  providerInfo: {
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  providerLocation: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 5,
    marginBottom: 8,
  },
  serviceTag: {
    fontSize: 10,
    backgroundColor: '#FFA040',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  areasServedContainer: {
    marginTop: 8,
  },
  areasServedLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
  },
  areasServedText: {
    fontSize: 11,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'left',
    flexWrap: 'wrap',
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
    margin: 20,
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA040',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  providerDetailContent: {
    alignItems: 'center',
  },
  providerDetailImageContainer: {
    marginBottom: 15,
  },
  providerDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  providerDetailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerDetailPlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  providerDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  providerDetailLocation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerDetailContact: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerDetailServices: {
    marginTop: 15,
    alignItems: 'center',
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  serviceDetailTag: {
    fontSize: 12,
    backgroundColor: '#FFA040',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  contactButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Booking modal styles
  bookingContent: {
    alignItems: 'center',
  },
  bookingProviderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookingForm: {
    width: '100%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBottomSpacing: {
    height: 100,
  },
  // Expanded provider details styles
  providerCardHeader: {
    width: '100%',
  },
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 15,
  },
  providerDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#FFA040',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Additional booking modal styles
  bookingWelcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  timeSlotButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  timeSlotButtonSelected: {
    borderColor: '#FFA040',
    backgroundColor: '#FFA040',
  },
  timeSlotButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Date picker styles
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  infoContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default KundliCalculator;
