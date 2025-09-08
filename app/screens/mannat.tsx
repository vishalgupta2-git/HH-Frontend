/**
 * Mannat Screen - Mannat (Wish) Functionality
 * 
 * Features:
 * 1. Temple/Charity listing for mannat
 * 2. Mannat booking with donation amount
 * 3. Date and time slot selection
 * 4. Currency selection
 * 5. Form validation and submission
 */

import HomeHeader from '@/components/Home/HomeHeader';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEndpointUrl, getAuthHeaders, API_CONFIG } from '@/constants/ApiConfig';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

// Time slots for mannat
const timeSlots = [
  '8AM-10AM',
  '10AM-12PM',
  '12PM-2PM',
  '2PM-4PM',
  '4PM-6PM',
  '6PM-8PM'
];

// Mannat options with prices
const mannatOptions = [
  { label: '10 Mandir Archana', price: 'Rs. 251' },
  { label: '51 Mandir Archana', price: 'Rs. 1251' },
  { label: 'Mahaprasad', price: 'Rs. 2100' },
  { label: '1 kg Modak', price: 'Rs. 501' },
  { label: '5 kg Modak', price: 'Rs. 2500' },
  { label: 'Food for 5 poor', price: 'Rs. 501' },
  { label: 'Food for 10 poor', price: 'Rs. 2500' }
];

export const options = { headerShown: false };

interface TempleCharity {
  id: string;
  name: string;
  type: string;
  deity: string;
  cause: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  about: string;
  '80G': string;
  zip_pinCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function MannatScreen() {
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<TempleCharity[]>([]);
  const [filteredData, setFilteredData] = useState<TempleCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    searchPlaceholder: { en: "Search for 'Temples'", hi: "'मंदिरों' की खोज करें" },
    loadingTemples: { en: 'Loading temples and charities...', hi: 'मंदिर और धर्मार्थ संस्थाएं लोड हो रही हैं...' },
    retry: { en: 'Retry', hi: 'पुनः प्रयास करें' },
    noResults: { en: 'No results found for', hi: 'के लिए कोई परिणाम नहीं मिला' },
    noTemplesAvailable: { en: 'No temples or charities available', hi: 'कोई मंदिर या धर्मार्थ संस्थाएं उपलब्ध नहीं' },
    about: { en: 'About', hi: 'के बारे में' },
    noDescription: { en: 'No description available for this location.', hi: 'इस स्थान के लिए कोई विवरण उपलब्ध नहीं।' },
    makeAMannat: { en: 'Make a Mannat', hi: 'मन्नत मांगें' },
    mannatForm: { en: 'Mannat Form', hi: 'मन्नत फॉर्म' },
    makeYourMannat: { en: 'Make your mannat (wish) at', hi: 'अपनी मन्नत (इच्छा) मांगें' },
    pleaseProvideInfo: { en: 'Please provide the following information for us to contact you', hi: 'कृपया हमसे संपर्क करने के लिए निम्नलिखित जानकारी प्रदान करें' },
    nameMin3: { en: 'Name (Min 3 characters) *', hi: 'नाम (न्यूनतम 3 अक्षर) *' },
    enterYourName: { en: 'Enter your name', hi: 'अपना नाम दर्ज करें' },
    phoneNumber: { en: 'Phone Number *', hi: 'फोन नंबर *' },
    enterPhoneNumber: { en: 'Enter your phone number', hi: 'अपना फोन नंबर दर्ज करें' },
    preferredDate: { en: 'Preferred Date *', hi: 'पसंदीदा तारीख *' },
    selectDate: { en: 'Select Date', hi: 'तारीख चुनें' },
    timeSlot: { en: 'Time Slot *', hi: 'समय स्लॉट *' },
    selectTimeSlot: { en: 'Select Time Slot', hi: 'समय स्लॉट चुनें' },
    mannatOption: { en: 'Mannat Option *', hi: 'मन्नत विकल्प *' },
    selectMannatOption: { en: 'Select Mannat Option', hi: 'मन्नत विकल्प चुनें' },
    yourWish: { en: 'Your Wish (Optional)', hi: 'आपकी इच्छा (वैकल्पिक)' },
    enterYourWish: { en: 'Enter your wish', hi: 'अपनी इच्छा दर्ज करें' },
    submitMannat: { en: 'Submit Mannat', hi: 'मन्नत जमा करें' },
    submitting: { en: 'Submitting...', hi: 'जमा किया जा रहा है...' },
    mannatAction: { en: 'Mannat Action', hi: 'मन्नत कार्य' }
  };
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TempleCharity | null>(null);
  
  // Mannat modal state
  const [showMannatModal, setShowMannatModal] = useState(false);
  const [mannatForm, setMannatForm] = useState({
    name: '',
    phone: '',
    date: '',
    timeSlot: '',
    mannatOption: '',
    wish: ''
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setMannatForm(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Fetch temples and charities data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = getEndpointUrl('TEMPLES_CHARITIES');
      
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: { limit: 100, offset: 0 }
      });


      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setData(fetchedData);
        setFilteredData(fetchedData);
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.deity.toLowerCase().includes(query) ||
        item.cause.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  // Monitor modal state changes
  useEffect(() => {
  }, [showModal, selectedItem]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Handle tile click - open modal with temple information
  const handleTileClick = (item: TempleCharity) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Handle mannat button click
  const handleMannatButtonClick = () => {
    setShowMannatModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Render loading state
  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A00" />
          <Text style={styles.loadingText}>{isHindi ? translations.loadingTemples.hi : translations.loadingTemples.en}</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error && data.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
            <Text style={styles.retryButtonText}>{isHindi ? translations.retry.hi : translations.retry.en}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render empty state
  if (filteredData.length === 0 && !loading) {
  return (
    <View style={styles.container}>
        <HomeHeader 
          searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en} 
          showDailyPujaButton={false} 
          showLanguageToggle={false}
          onSearchChange={setSearchQuery}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? `${isHindi ? translations.noResults.hi : translations.noResults.en} "${searchQuery}"`
              : (isHindi ? translations.noTemplesAvailable.hi : translations.noTemplesAvailable.en)
            }
          </Text>
      </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder="Search for 'Temples'" 
        showDailyPujaButton={false} 
        onSearchChange={setSearchQuery}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tilesContainer}>
          <View style={styles.tilesGrid}>
            {filteredData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.tile}
                onPress={() => handleTileClick(item)}
                activeOpacity={0.8}
              >
                <View style={styles.tileHeader}>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: item.type === 'Temple' ? '#FF6A00' : '#4CAF50' }
                  ]}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  {item['80G'] === 'Yes' && (
                    <View style={styles.g80Badge}>
                      <Text style={styles.g80Text}>80G</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.tileTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                
                {item.type === 'Temple' && item.deity && (
                  <Text style={styles.tileDeity}>
                    🕉️ {item.deity}
                  </Text>
                )}
                
                {item.type === 'Charity' && item.cause && (
                  <Text style={styles.tileCause}>
                    🎯 {item.cause}
                  </Text>
                )}
                
                <View style={styles.tileLocation}>
                  <Text style={styles.locationText}>
                    📍 {item.city}, {item.state}
                  </Text>
                  {item.zip_pinCode && (
                    <Text style={styles.zipText}>
                      {item.zip_pinCode}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Temple/Charity Details Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
        onShow={() => {
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedItem?.name || 'Temple/Charity'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              {/* About Section */}
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>{isHindi ? translations.about.hi : translations.about.en}</Text>
                <Text style={styles.aboutText}>
                  {selectedItem?.about || (isHindi ? translations.noDescription.hi : translations.noDescription.en)}
                </Text>
              </View>

              {/* Mannat Button */}
              <TouchableOpacity 
                style={styles.mannatButton}
                onPress={handleMannatButtonClick}
                activeOpacity={0.8}
              >
                <Text style={styles.mannatButtonText}>
                  {isHindi ? translations.makeAMannat.hi : translations.makeAMannat.en}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Mannat Modal */}
      <Modal
        visible={showMannatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMannatModal(false)}
        onShow={() => {
        }}
      >
        <View style={styles.mannatModalOverlay}>
          <View style={styles.mannatModalContent}>
            <View style={styles.mannatModalHeader}>
              <Text style={styles.mannatModalTitle}>{isHindi ? translations.mannatForm.hi : translations.mannatForm.en}</Text>
              <TouchableOpacity
                style={styles.mannatCloseButton}
                onPress={() => setShowMannatModal(false)}
              >
                <Text style={styles.mannatCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.mannatModalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.mannatModalScrollContent}
              onContentSizeChange={(width, height) => {
              }}
              onLayout={(event) => {
              }}
            >
              <Text style={styles.mannatModalSubtitle}>
                {isHindi ? translations.makeYourMannat.hi : translations.makeYourMannat.en} {selectedItem?.name}
                {'\n'}{isHindi ? translations.pleaseProvideInfo.hi : translations.pleaseProvideInfo.en}
              </Text>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? translations.nameMin3.hi : translations.nameMin3.en}</Text>
                <TextInput
                  style={styles.mannatFormInput}
                  value={mannatForm.name}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, name: text }))}
                  placeholder={isHindi ? translations.enterYourName.hi : translations.enterYourName.en}
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? 'फोन नंबर (न्यूनतम 10 अंक) *' : 'Phone Number (Min 10 digits) *'}</Text>
                <TextInput
                  style={styles.mannatFormInput}
                  value={mannatForm.phone}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, phone: text }))}
                  placeholder={isHindi ? translations.enterPhoneNumber.hi : translations.enterPhoneNumber.en}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? 'आपकी इच्छा (मन्नत) *' : 'Your Wish (Mannat) *'}</Text>
                <TextInput
                  style={styles.mannatFormTextArea}
                  value={mannatForm.wish}
                  onChangeText={(text) => setMannatForm(prev => ({ ...prev, wish: text }))}
                  placeholder={isHindi ? 'अपनी इच्छा या प्रार्थना का वर्णन करें...' : 'Describe your wish or prayer...'}
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? translations.mannatAction.hi : translations.mannatAction.en}</Text>
                <View style={styles.mannatOptionGrid}>
                  {mannatOptions.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.mannatOptionItem,
                        mannatForm.mannatOption === option.label && styles.mannatOptionItemActive
                      ]}
                      onPress={() => setMannatForm(prev => ({ ...prev, mannatOption: option.label }))}
                    >
                      <Text style={[
                        styles.mannatOptionLabel,
                        mannatForm.mannatOption === option.label && styles.mannatOptionLabelActive
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.mannatOptionPrice,
                        mannatForm.mannatOption === option.label && styles.mannatOptionPriceActive
                      ]}>
                        {option.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? translations.preferredDate.hi : translations.preferredDate.en}</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={showDatePickerModal}
                >
                  <Text style={[
                    styles.dateSelectorText,
                    mannatForm.date && styles.dateSelectorTextActive
                  ]}>
                    {mannatForm.date ? mannatForm.date : (isHindi ? translations.selectDate.hi : translations.selectDate.en)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.mannatFormField}>
                <Text style={styles.mannatFormLabel}>{isHindi ? translations.timeSlot.hi : translations.timeSlot.en}</Text>
                <View style={styles.timeSlotGrid}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlotOption,
                        mannatForm.timeSlot === slot && styles.timeSlotOptionActive
                      ]}
                      onPress={() => setMannatForm(prev => ({ ...prev, timeSlot: slot }))}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        mannatForm.timeSlot === slot && styles.timeSlotTextActive
                      ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={async () => {
                  // Validation
                  if (!mannatForm.name || mannatForm.name.trim().length < 3) {
                    Alert.alert(isHindi ? 'अमान्य नाम' : 'Invalid Name', isHindi ? 'नाम कम से कम 3 अक्षर का होना चाहिए।' : 'Name must be at least 3 characters long.');
                    return;
                  }
                  
                  if (!mannatForm.phone || mannatForm.phone.length < 10) {
                    Alert.alert(isHindi ? 'अमान्य फोन' : 'Invalid Phone', isHindi ? 'कृपया एक वैध फोन नंबर दर्ज करें।' : 'Please enter a valid phone number.');
                    return;
                  }
                  
                  if (!mannatForm.wish || mannatForm.wish.trim().length < 5) {
                    Alert.alert(isHindi ? 'अमान्य इच्छा' : 'Invalid Wish', isHindi ? 'कृपया अपनी इच्छा का वर्णन करें (न्यूनतम 5 अक्षर)।' : 'Please describe your wish (minimum 5 characters).');
                    return;
                  }
                  
                  if (!mannatForm.mannatOption) {
                    Alert.alert(isHindi ? 'अमान्य मन्नत कार्य' : 'Invalid Mannat Action', isHindi ? 'कृपया एक मन्नत कार्य चुनें।' : 'Please select a mannat action.');
                    return;
                  }
                  
                  if (!mannatForm.date) {
                    Alert.alert(isHindi ? 'अमान्य तारीख' : 'Invalid Date', isHindi ? 'कृपया एक पसंदीदा तारीख चुनें।' : 'Please select a preferred date.');
                    return;
                  }
                  
                  if (!mannatForm.timeSlot) {
                    Alert.alert(isHindi ? 'अमान्य समय' : 'Invalid Time', isHindi ? 'कृपया एक पसंदीदा समय स्लॉट चुनें।' : 'Please select a preferred time slot.');
                    return;
                  }
                  
                  try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/mannat-bookings`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders(),
                      },
                      body: JSON.stringify({
                        name: mannatForm.name.trim(),
                        phone: mannatForm.phone,
                        mannatDesire: mannatForm.wish,
                        mannatOption: mannatForm.mannatOption,
                        templeCharityId: selectedItem?.id,
                        dateToContact: mannatForm.date,
                        timeSlot: mannatForm.timeSlot,
                      }),
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      Alert.alert(
                        isHindi ? 'मन्नत सफलतापूर्वक जमा!' : 'Mannat Submitted Successfully!',
                        isHindi ? 'आपकी इच्छा जमा हो गई है। हम जल्द ही आपसे संपर्क करेंगे।' : 'Your wish has been submitted. We will contact you soon.',
                        [
                          {
                            text: isHindi ? 'ठीक है' : 'OK',
                            onPress: () => {
                              setShowMannatModal(false);
                              setMannatForm({
                                name: '',
                                phone: '',
                                date: '',
                                timeSlot: '',
                                mannatOption: '',
                                wish: ''
                              });
                              setSelectedDate(new Date());
                            },
                          },
                        ]
                      );
                    } else {
                      const errorData = await response.json();
                      Alert.alert(isHindi ? 'त्रुटि' : 'Error', errorData.error || (isHindi ? 'मन्नत जमा करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to submit mannat. Please try again.'));
                    }
                  } catch (error) {
                    Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'मन्नत जमा करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to submit mannat. Please try again.');
                  }
                }}
              >
                <Text style={styles.submitButtonText}>{isHindi ? translations.submitMannat.hi : translations.submitMannat.en}</Text>
              </TouchableOpacity>
              
              {/* 100px white space at the end */}
              <View style={styles.mannatFormBottomSpacing} />
            </ScrollView>
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
          minimumDate={new Date(Date.now() + 18 * 60 * 60 * 1000)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  tilesContainer: {
    flex: 1,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  tile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
    minHeight: 200,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  g80Badge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  g80Text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 8,
    lineHeight: 20,
  },
  tileDeity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  tileCause: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  tileLocation: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  zipText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6A00',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
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
    width: '85%',
    maxHeight: '85%',
    minHeight: 300,
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
    color: '#FF6A00',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    flex: 1,
    paddingVertical: 10,
    minHeight: 200,
  },
  aboutSection: {
    marginBottom: 25,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  mannatButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mannatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Mannat Modal styles
  mannatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mannatModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '95%',
    minHeight: 400,
  },
  mannatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  mannatModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  mannatCloseButton: {
    padding: 5,
  },
  mannatCloseButtonText: {
    fontSize: 20,
    color: '#666',
  },
  mannatModalSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  mannatFormField: {
    marginBottom: 15,
  },
  mannatFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mannatFormInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  mannatFormTextArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    height: 80,
    textAlignVertical: 'top',
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#999',
  },
  dateSelectorTextActive: {
    color: '#333',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  timeSlotOptionActive: {
    borderColor: '#FF6A00',
    backgroundColor: '#FF6A00',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mannatFormBottomSpacing: {
    height: 100,
  },
  // Mannat option styles
  mannatOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mannatOptionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9',
    minWidth: '48%',
    alignItems: 'center',
  },
  mannatOptionItemActive: {
    borderColor: '#FF6A00',
    backgroundColor: '#FF6A00',
  },
  mannatOptionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  mannatOptionLabelActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  mannatOptionPrice: {
    fontSize: 16,
    color: '#FF6A00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mannatOptionPriceActive: {
    color: 'white',
  },
  // Mannat modal scroll styles
  mannatModalScrollView: {
    flex: 1,
  },
  mannatModalScrollContent: {
    paddingBottom: 20,
  },
}); 