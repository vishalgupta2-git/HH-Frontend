/**
 * Donation Screen - Optimized for Performance
 * 
 * Architecture:
 * 1. Initial Load: Uses base /api/temples-charities endpoint to fetch 100 records
 * 2. Local Filtering: Type (Temple/Charity) filtering done locally for instant response
 * 3. Local Search: Text search performed on loaded data for fast results
 * 4. Specific Endpoints: Type and location filtering use dedicated endpoints when needed
 * 5. Pagination: Loads more data as user scrolls (100 records per page)
 * 
 * Performance Benefits:
 * - Faster initial load (single API call)
 * - Instant filtering and search (no API delays)
 * - Progressive loading (only load what's needed)
 * - Reduced server load (fewer API calls)
 */

import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEndpointUrl, getAuthHeaders, API_CONFIG } from '@/constants/ApiConfig';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

// Time slots for donation
const timeSlots = [
  '8AM-10AM',
  '10AM-12PM',
  '12PM-2PM',
  '2PM-4PM',
  '4PM-6PM',
  '6PM-8PM'
];

// Currency options
const currencies = ['Rs', '$', '€', '£'];

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

export default function DonationScreen() {
  const { isHindi } = useLanguage();
  
  const translations = {
    searchPlaceholder: { en: 'Search temples and charities...', hi: 'मंदिर और धर्मार्थ संस्थाओं की खोज करें...' },
    temples: { en: 'Temples', hi: 'मंदिर' },
    charities: { en: 'Charities', hi: 'धर्मार्थ संस्थाएं' },
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
    noDataFound: { en: 'No temples or charities found.', hi: 'कोई मंदिर या धर्मार्थ संस्था नहीं मिली।' },
    errorLoading: { en: 'Error loading data. Please try again.', hi: 'डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।' },
    pullToRefresh: { en: 'Pull to refresh', hi: 'रिफ्रेश करने के लिए खींचें' },
    donationForm: {
      title: { en: 'Donation Form', hi: 'दान फॉर्म' },
      amount: { en: 'Donation Amount', hi: 'दान राशि' },
      currency: { en: 'Currency', hi: 'मुद्रा' },
      date: { en: 'Donation Date', hi: 'दान की तारीख' },
      timeSlot: { en: 'Time Slot', hi: 'समय स्लॉट' },
      name: { en: 'Your Name', hi: 'आपका नाम' },
      phone: { en: 'Phone Number', hi: 'फोन नंबर' },
      email: { en: 'Email', hi: 'ईमेल' },
      message: { en: 'Message (Optional)', hi: 'संदेश (वैकल्पिक)' },
      submit: { en: 'Submit Donation', hi: 'दान जमा करें' },
      cancel: { en: 'Cancel', hi: 'रद्द करें' }
    },
    timeSlots: {
      slot1: { en: '8AM-10AM', hi: 'सुबह 8-10 बजे' },
      slot2: { en: '10AM-12PM', hi: 'सुबह 10-दोपहर 12 बजे' },
      slot3: { en: '12PM-2PM', hi: 'दोपहर 12-2 बजे' },
      slot4: { en: '2PM-4PM', hi: 'दोपहर 2-4 बजे' },
      slot5: { en: '4PM-6PM', hi: 'शाम 4-6 बजे' },
      slot6: { en: '6PM-8PM', hi: 'शाम 6-8 बजे' }
    },
    currencies: {
      rs: { en: 'Rs', hi: 'रुपये' },
      dollar: { en: '$', hi: '$' },
      euro: { en: '€', hi: '€' },
      pound: { en: '£', hi: '£' }
    },
    success: { en: 'Donation submitted successfully!', hi: 'दान सफलतापूर्वक जमा हो गया!' },
    error: { en: 'Error submitting donation. Please try again.', hi: 'दान जमा करने में त्रुटि। कृपया पुनः प्रयास करें।' },
    modal: {
      showingItems: { en: 'Showing', hi: 'दिखा रहे हैं' },
      item: { en: 'item', hi: 'आइटम' },
      items: { en: 'items', hi: 'आइटम' },
      about: { en: 'About', hi: 'के बारे में' },
      gallery: { en: 'Gallery', hi: 'गैलरी' },
      donate: { en: 'Donate', hi: 'दान करें' },
      noImagesAvailable: { en: 'No images available', hi: 'कोई छवि उपलब्ध नहीं' },
      thankYouSupporting: { en: 'Thank you for supporting the', hi: 'का समर्थन करने के लिए धन्यवाद' },
      contactInfo: { en: 'Please provide the following information for us to contact you', hi: 'हमसे संपर्क करने के लिए कृपया निम्नलिखित जानकारी प्रदान करें' },
      thankYouDonation: { en: 'Thank you for your donation. We will contact you soon.', hi: 'आपके दान के लिए धन्यवाद। हम जल्द ही आपसे संपर्क करेंगे।' }
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [templesEnabled, setTemplesEnabled] = useState(true);
  const [charitiesEnabled, setCharitiesEnabled] = useState(true);
  const [data, setData] = useState<TempleCharity[]>([]);
  const [filteredData, setFilteredData] = useState<TempleCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    total: 0,
    hasMore: false
  });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TempleCharity | null>(null);
  const [modalImages, setModalImages] = useState<Array<{key: string, url: string}>>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Image viewer modal state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    name: '',
    phone: '',
    date: '',
    timeSlot: '',
    amount: '',
    currency: 'Rs'
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDonationForm(prev => ({ ...prev, date: date.toISOString().split('T')[0] })); // Format as YYYY-MM-DD
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Debug search query changes
  useEffect(() => {
  }, [searchQuery]);

  // Fetch temples and charities data - always use base endpoint
  const fetchData = async (offset = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const endpoint = getEndpointUrl('TEMPLES_CHARITIES');
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: {
          limit: 100,
          offset: offset
        }
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        const newPagination = response.data.pagination;
        
        if (append) {
          // Append new data for pagination
          setData(prev => [...prev, ...fetchedData]);
        } else {
          // Replace data for fresh load
          setData(fetchedData);
        }
        
        setPagination(newPagination);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Load more data for pagination
  const loadMoreData = async () => {
    if (pagination.hasMore && !loading) {
      await fetchData(pagination.offset + pagination.limit, true);
    }
  };

  // Filter data based on search query and toggle states - LOCAL FILTERING
  useEffect(() => {
    
    let filtered = data;

    // Filter by type (Temple or Charity)
    if (templesEnabled && charitiesEnabled) {
      // Show all
    } else if (templesEnabled) {
      filtered = filtered.filter(item => item.type === 'Temple');
    } else if (charitiesEnabled) {
      filtered = filtered.filter(item => item.type === 'Charity');
    } else {
      filtered = []; // Both disabled
    }

    // Filter by search query - LOCAL SEARCH
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.about?.toLowerCase().includes(query) ||
        item.deity?.toLowerCase().includes(query) ||
        item.cause?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.state?.toLowerCase().includes(query) ||
        item.zip_pinCode?.includes(query)
      );
      
    }

    setFilteredData(filtered);
  }, [data, searchQuery, templesEnabled, charitiesEnabled]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle retry
  const handleRetry = () => {
    fetchData(0, false);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(0, false); // Reset to first page
    setRefreshing(false);
  };

  // Handle tile click - fetch images and open modal
  const handleTileClick = async (item: TempleCharity) => {
    try {
      setModalLoading(true);
      setSelectedItem(item);
      setShowModal(true);
      
      // Fetch images from S3
      const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_IMAGES') + `/${item.id}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setModalImages(response.data.images || []);
      } else {
        setModalImages([]);
      }
    } catch (err: any) {
      setModalImages([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalImages([]);
  };

  // Handle image click to open viewer
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  // Handle next image
  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === modalImages.length - 1 ? 0 : prev + 1
    );
  };

  // Handle previous image
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? modalImages.length - 1 : prev - 1
    );
  };

  // Handle image viewer close
  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImageIndex(0);
  };

  // Handle toggle changes - use specific endpoints for type filtering
  const handleTemplesToggle = async () => {
    const newTemplesEnabled = !templesEnabled;
    setTemplesEnabled(newTemplesEnabled);
    
    // If only temples are enabled, fetch temple-specific data
    if (newTemplesEnabled && !charitiesEnabled) {
      try {
        setLoading(true);
        const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_BY_TYPE') + '/Temple', {
          headers: getAuthHeaders()
        });
        
        if (response.data.success) {
          setData(response.data.data || []);
          setPagination({
            limit: response.data.count || 0,
            offset: 0,
            total: response.data.count || 0,
            hasMore: false
          });
        }
      } catch (err: any) {
        // Fallback to local filtering
      } finally {
        setLoading(false);
      }
    } else if (!newTemplesEnabled && charitiesEnabled) {
      // If only charities are enabled, fetch charity-specific data
      try {
        setLoading(true);
        const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_BY_TYPE') + '/Charity', {
          headers: getAuthHeaders()
        });
        
        if (response.data.success) {
          setData(response.data.data || []);
          setPagination({
            limit: response.data.count || 0,
            offset: 0,
            total: response.data.count || 0,
            hasMore: false
          });
        }
      } catch (err: any) {
        // Fallback to local filtering
      } finally {
        setLoading(false);
      }
    } else {
      // Both or neither enabled, reload all data
      fetchData(0, false);
    }
  };

  const handleCharitiesToggle = async () => {
    const newCharitiesEnabled = !charitiesEnabled;
    setCharitiesEnabled(newCharitiesEnabled);
    
    // Similar logic as temples toggle
    if (newCharitiesEnabled && !templesEnabled) {
      try {
        setLoading(true);
        const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_BY_TYPE') + '/Charity', {
          headers: getAuthHeaders()
        });
        
        if (response.data.success) {
          setData(response.data.data || []);
          setPagination({
            limit: response.data.count || 0,
            offset: 0,
            total: response.data.count || 0,
            hasMore: false
          });
        }
      } catch (err: any) {
        // Fallback to local filtering
      } finally {
        setLoading(false);
      }
    } else if (!newCharitiesEnabled && templesEnabled) {
      try {
        setLoading(true);
        const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_BY_TYPE') + '/Temple', {
          headers: getAuthHeaders()
        });
        
        if (response.data.success) {
          setData(response.data.data || []);
          setPagination({
            limit: response.data.count || 0,
            offset: 0,
            total: response.data.count || 0,
            hasMore: false
          });
        }
      } catch (err: any) {
        // Fallback to local filtering
      } finally {
        setLoading(false);
      }
    } else {
      // Both or neither enabled, reload all data
      fetchData(0, false);
    }
  };

  // Handle location filtering using dedicated endpoint
  const handleLocationFilter = async (country?: string, state?: string, city?: string) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (state) params.append('state', state);
      if (city) params.append('city', city);
      
      const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_BY_LOCATION') + '?' + params.toString(), {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setData(response.data.data || []);
        setPagination({
          limit: response.data.count || 0,
          offset: 0,
          total: response.data.count || 0,
          hasMore: false
        });
      }
    } catch (err: any) {
      // Fallback to local filtering
    } finally {
      setLoading(false);
    }
  };

  // Reset to show all data
  const handleResetFilters = () => {
    fetchData(0, false);
  };

  const toggleControls = (
    <View style={styles.toggleRow}>
      {/* Temples Toggle */}
      <TouchableOpacity 
        style={styles.toggleItem}
        onPress={handleTemplesToggle}
      >
        <LinearGradient
          colors={templesEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
          style={styles.toggleTrack}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            style={[
              styles.toggleThumb,
              templesEnabled && styles.toggleThumbActive
            ]}
          />
        </LinearGradient>
        <Text style={styles.toggleLabel}>{isHindi ? translations.temples.hi : translations.temples.en}</Text>
      </TouchableOpacity>

      {/* Charities Toggle */}
      <TouchableOpacity 
        style={styles.toggleItem}
        onPress={handleCharitiesToggle}
      >
        <LinearGradient
          colors={charitiesEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
          style={styles.toggleTrack}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            style={[
              styles.toggleThumb,
              charitiesEnabled && styles.toggleThumbActive
            ]}
          />
        </LinearGradient>
        <Text style={styles.toggleLabel}>{isHindi ? translations.charities.hi : translations.charities.en}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render individual tile
  const renderTile = (item: TempleCharity) => {
    
    return (
      <View key={item.id} style={{
        width: '48%',
        backgroundColor: 'green',
        height: 150,
        marginBottom: 15,
        padding: 10,
        borderWidth: 2,
        borderColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
          {item.name}
        </Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
          {item.type}
        </Text>
        <Text style={{ color: 'white', fontSize: 12, marginTop: 5, textAlign: 'center' }}>
          {item.city}, {item.state}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en}
        showDailyPujaButton={false} 
        onSearchChange={setSearchQuery}
        extraContent={toggleControls}
        showLanguageToggle={false}
      />

      <View style={styles.content}>
        {/* Show data if available */}
        {filteredData.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                {isHindi ? translations.modal.showingItems.hi : translations.modal.showingItems.en} {filteredData.length} {filteredData.length === 1 ? (isHindi ? translations.modal.item.hi : translations.modal.item.en) : (isHindi ? translations.modal.items.hi : translations.modal.items.en)}
                {searchQuery && ` for "${searchQuery}"`}
                {pagination.total > 0 && ` of ${pagination.total} total`}
              </Text>
              {pagination.hasMore && (
                <Text style={[styles.statsText, { color: '#FF6A00', fontSize: 12 }]}>
                  Scroll down to load more
                </Text>
              )}
            </View>
            
            {/* Grid layout */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 200 }}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={['#FF6A00']}
                  tintColor="#FF6A00"
                  title="Pull to refresh"
                  titleColor="#666"
                />
              }
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 20;
                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                  // User has scrolled to the bottom, load more data
                  loadMoreData();
                }
              }}
              scrollEventThrottle={400}
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}>
                {filteredData.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={{
                      width: '48%',
                      backgroundColor: '#fff',
                      padding: 15,
                      marginBottom: 15,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: '#e0e0e0'
                    }}
                    onPress={() => handleTileClick(item)}
                    activeOpacity={0.8}
                  >
                    {/* Header with type icon */}
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}>
                      <Image 
                        source={item.type === 'Temple' 
                          ? require('@/assets/images/icons/home page icons/temple.png')
                          : require('@/assets/images/icons/home page icons/charityIcon.png')
                        }
                        style={{
                          width: 24,
                          height: 24,
                          resizeMode: 'contain'
                        }}
                      />
                      
                      {item['80G'] && (
                        (() => {
                          const value = item['80G'].toString().toLowerCase();
                          let badgeText = '';
                          let showBadge = false;
                          
                          if (value === 'true' || value === '100' || value === '100%') {
                            badgeText = 'Tax-Free';
                            showBadge = true;
                          } else if (value === '50' || value === '50%') {
                            badgeText = 'Tax-Free-50%';
                            showBadge = true;
                          }
                          
                          return showBadge ? (
                            <View style={{
                              backgroundColor: '#FF6A00',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 5
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                {badgeText}
                              </Text>
                            </View>
                          ) : null;
                        })()
                      )}
                    </View>
                    
                    {/* Title */}
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#FF6A00',
                      marginBottom: 8,
                      lineHeight: 20
                    }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    {/* Show deity for temples, cause for charities */}
                    {item.type === 'Temple' && item.deity && (
                      <Text style={{
                        fontSize: 13,
                        color: '#666',
                        marginBottom: 6,
                        fontWeight: '500'
                      }} numberOfLines={1}>
                        🕉️ {item.deity}
                      </Text>
                    )}
                    
                    {item.type === 'Charity' && item.cause && (
                      <Text style={{
                        fontSize: 13,
                        color: '#4CAF50',
                        marginBottom: 6,
                        fontWeight: '500'
                      }} numberOfLines={1}>
                        🎯 {item.cause}
                      </Text>
                    )}
                    
                    {/* Location */}
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{
                        fontSize: 12,
                        color: '#333',
                        fontWeight: '500',
                        marginBottom: 2
                      }} numberOfLines={1}>
                        📍 {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Pagination loading indicator */}
                {pagination.hasMore && (
                  <View style={{
                    width: '100%',
                    padding: 20,
                    alignItems: 'center'
                  }}>
                    <ActivityIndicator size="small" color="#FF6A00" />
                    <Text style={{
                      color: '#666',
                      fontSize: 14,
                      marginTop: 10
                    }}>
                      Loading more...
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Show empty state if no data */}
        {filteredData.length === 0 && !loading && !error && (
          <View style={{ 
            backgroundColor: 'orange', 
            padding: 20, 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              {isHindi ? 'दिखाने के लिए कोई आइटम नहीं' : 'No items to display'}
            </Text>
            <Text>Data length: {data.length}</Text>
            <Text>Filtered length: {filteredData.length}</Text>
          </View>
        )}

        {/* Show loading state */}
        {loading && (
          <View style={{ 
            padding: 40, 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ActivityIndicator size="large" color="#FF6A00" />
            <Text style={{ 
              color: '#666', 
              fontSize: 16, 
              marginTop: 15,
              textAlign: 'center'
            }}>
              {pagination.hasMore ? (isHindi ? 'और लोड हो रहा है...' : 'Loading more...') : (isHindi ? 'मंदिर और धर्मार्थ संस्थाएं लोड हो रही हैं...' : 'Loading temples and charities...')}
            </Text>
          </View>
        )}

        {/* Show error state */}
        {error && (
          <View style={{ 
            backgroundColor: 'red', 
            padding: 20, 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              {isHindi ? 'त्रुटि:' : 'Error:'}
            </Text>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              {error}
            </Text>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'white', 
                padding: 10, 
                borderRadius: 5, 
                marginTop: 10 
              }} 
              onPress={handleRetry}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Temple/Charity Details Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity 
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxHeight: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FF6A00'
              }}>
                {selectedItem?.name}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={{
                  fontSize: 24,
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            {selectedItem?.about && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: 10
                }}>
                  {isHindi ? translations.modal.about.hi : translations.modal.about.en}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 20,
                  textAlign: 'justify'
                }}>
                  {selectedItem.about}
                </Text>
              </View>
            )}

            {/* Donate Button */}
            <TouchableOpacity 
              style={{
              backgroundColor: '#FF6A00',
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20
              }}
              onPress={() => setShowDonationModal(true)}
            >
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold'
              }}>
                {isHindi ? translations.modal.donate.hi : translations.modal.donate.en}
              </Text>
            </TouchableOpacity>

            {/* Image Gallery */}
            <View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: 15
              }}>
                {isHindi ? translations.modal.gallery.hi : translations.modal.gallery.en}
              </Text>
              
              {modalLoading ? (
                <View style={{
                  alignItems: 'center',
                  padding: 20
                }}>
                  <ActivityIndicator size="large" color="#FF6A00" />
                  <Text style={{
                    marginTop: 10,
                    color: '#666'
                  }}>
                    Loading images...
                  </Text>
                </View>
              ) : modalImages.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: 20
                  }}
                >
                  {modalImages.map((image, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={{
                        marginRight: 15,
                        borderRadius: 10,
                        overflow: 'hidden',
                        alignItems: 'center'
                      }}
                      onPress={() => handleImageClick(index)}
                    >
                      <Image
                        source={{ uri: image.url }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 10
                        }}
                        resizeMode="cover"
                      />
                      <Text style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: '#666',
                        textAlign: 'center',
                        maxWidth: 120
                      }} numberOfLines={2}>
                        {image.key.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Image'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={{
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 10
                }}>
                  <Text style={{
                    color: '#666',
                    fontSize: 14
                  }}>
                    No images available
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseImageViewer}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Close button */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10
            }}
            onPress={handleCloseImageViewer}
          >
            <Text style={{
              color: '#fff',
              fontSize: 30,
              fontWeight: 'bold'
            }}>
              ×
            </Text>
          </TouchableOpacity>

          {/* Image counter */}
          <Text style={{
            position: 'absolute',
            top: 50,
            left: 20,
            color: '#fff',
            fontSize: 16,
            zIndex: 10
          }}>
            {selectedImageIndex + 1} / {modalImages.length}
          </Text>

          {/* Main image */}
          <Image
            source={{ uri: modalImages[selectedImageIndex]?.url }}
            style={{
              width: '90%',
              height: '70%',
              borderRadius: 10,
              resizeMode: 'contain'
            }}
          />

          {/* Image name */}
          <Text style={{
            color: '#fff',
            fontSize: 16,
            marginTop: 20,
            textAlign: 'center',
            paddingHorizontal: 20
          }} numberOfLines={2}>
            {modalImages[selectedImageIndex]?.key.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Image'}
          </Text>

          {/* Navigation buttons */}
          <View style={{
            flexDirection: 'row',
            position: 'absolute',
            bottom: 50,
            justifyContent: 'space-between',
            width: '80%'
          }}>
            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: '#fff'
              }}
              onPress={handlePrevImage}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }}>
                ← Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: '#fff'
              }}
              onPress={handleNextImage}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Donation Modal */}
      <Modal
        visible={showDonationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDonationModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            margin: 20,
            width: '90%',
            maxHeight: '80%'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              paddingBottom: 15
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FF6A00'
              }}>
                {isHindi ? translations.donationForm.title.hi : translations.donationForm.title.en}
              </Text>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => setShowDonationModal(false)}
              >
                <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
              </TouchableOpacity>
    </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{
                fontSize: 16,
                color: '#333',
                textAlign: 'center',
                marginBottom: 20,
                lineHeight: 24
              }}>
                {isHindi ? `${selectedItem?.name} ${translations.modal.thankYouSupporting.hi}` : `${translations.modal.thankYouSupporting.en} ${selectedItem?.name}`}
                {'\n'}{isHindi ? translations.modal.contactInfo.hi : translations.modal.contactInfo.en}
              </Text>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8
              }}>
                {isHindi ? "नाम (न्यूनतम 3 अक्षर) *" : "Name (Min 3 characters) *"}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#f9f9f9'
                }}
                value={donationForm.name}
                onChangeText={(text) => setDonationForm(prev => ({ ...prev, name: text }))}
                placeholder={isHindi ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8
              }}>
                {isHindi ? "फोन नंबर (न्यूनतम 10 अंक) *" : "Phone Number (Min 10 digits) *"}
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#f9f9f9'
                }}
                value={donationForm.phone}
                onChangeText={(text) => setDonationForm(prev => ({ ...prev, phone: text }))}
                placeholder={isHindi ? "अपना फोन नंबर दर्ज करें" : "Enter your phone number"}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8
              }}>
                {isHindi ? translations.donationForm.amount.hi + " *" : translations.donationForm.amount.en + " *"}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10
              }}>
                <View style={{
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  overflow: 'hidden'
                }}>
                  {currencies.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        backgroundColor: donationForm.currency === currency ? '#FF6A00' : '#f9f9f9',
                        borderRightWidth: currency !== currencies[currencies.length - 1] ? 1 : 0,
                        borderRightColor: '#ddd'
                      }}
                      onPress={() => setDonationForm(prev => ({ ...prev, currency }))}
                    >
                      <Text style={{
                        fontSize: 16,
                        color: donationForm.currency === currency ? 'white' : '#666',
                        fontWeight: donationForm.currency === currency ? 'bold' : '500'
                      }}>
                        {currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#f9f9f9'
                  }}
                  value={donationForm.amount}
                  onChangeText={(text) => {
                    // Only allow integers
                    const cleanText = text.replace(/[^0-9]/g, '');
                    setDonationForm(prev => ({ ...prev, amount: cleanText }));
                  }}
                  placeholder={isHindi ? "राशि दर्ज करें" : "Enter amount"}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8
              }}>
                {isHindi ? "पसंदीदा तारीख *" : "Preferred Date *"}
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: '#f9f9f9'
                }}
                onPress={showDatePickerModal}
              >
                <Text style={{
                  fontSize: 16,
                  color: donationForm.date ? '#333' : '#999'
                }}>
                  {donationForm.date ? donationForm.date : (isHindi ? 'तारीख चुनें' : 'Select Date')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8
              }}>
                {isHindi ? "पसंदीदा समय स्लॉट *" : "Preferred Time Slot *"}
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8
              }}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={{
                      borderWidth: 1,
                      borderColor: donationForm.timeSlot === slot ? '#FF6A00' : '#ddd',
                      borderRadius: 15,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: donationForm.timeSlot === slot ? '#FF6A00' : '#f9f9f9'
                    }}
                    onPress={() => setDonationForm(prev => ({ ...prev, timeSlot: slot }))}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: donationForm.timeSlot === slot ? 'white' : '#666',
                      fontWeight: donationForm.timeSlot === slot ? 'bold' : '500'
                    }}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#FF6A00',
                paddingVertical: 15,
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={async () => {
                // Validation
                if (!donationForm.name || donationForm.name.trim().length < 3) {
                  Alert.alert(isHindi ? 'अमान्य नाम' : 'Invalid Name', isHindi ? 'नाम कम से कम 3 अक्षर का होना चाहिए।' : 'Name must be at least 3 characters long.');
                  return;
                }
                
                if (!donationForm.phone || donationForm.phone.length < 10) {
                  Alert.alert(isHindi ? 'अमान्य फोन' : 'Invalid Phone', isHindi ? 'कृपया एक वैध फोन नंबर दर्ज करें।' : 'Please enter a valid phone number.');
                  return;
                }
                
                if (!donationForm.amount || parseFloat(donationForm.amount) <= 0) {
                  Alert.alert(isHindi ? 'अमान्य राशि' : 'Invalid Amount', isHindi ? 'कृपया एक वैध दान राशि दर्ज करें।' : 'Please enter a valid donation amount.');
                  return;
                }
                
                if (!donationForm.date) {
                  Alert.alert(isHindi ? 'अमान्य तारीख' : 'Invalid Date', isHindi ? 'कृपया एक पसंदीदा तारीख चुनें।' : 'Please select a preferred date.');
                  return;
                }
                
                if (!donationForm.timeSlot) {
                  Alert.alert(isHindi ? 'अमान्य समय' : 'Invalid Time', isHindi ? 'कृपया एक पसंदीदा समय स्लॉट चुनें।' : 'Please select a preferred time slot.');
                  return;
                }
                
                try {
                  const response = await fetch(`${API_CONFIG.BASE_URL}/api/donation-bookings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...getAuthHeaders(),
                    },
                    body: JSON.stringify({
                      name: donationForm.name.trim(),
                      phone: donationForm.phone,
                      amount: parseFloat(donationForm.amount),
                      templeCharityId: selectedItem?.id,
                      currency: donationForm.currency,
                      dateToContact: donationForm.date,
                      timeSlot: donationForm.timeSlot,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    Alert.alert(
                      isHindi ? 'दान सफल!' : 'Donation Successful!',
                      'Thank you for your donation. We will contact you soon.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            setShowDonationModal(false);
                            // Reset form
                            setDonationForm({
                              name: '',
                              phone: '',
                              date: '',
                              timeSlot: '',
                              amount: '',
                              currency: 'Rs'
                            });
                            setSelectedDate(new Date());
                          },
                        },
                      ]
                    );
                  } else {
                    const errorData = await response.json();
                    Alert.alert(isHindi ? 'त्रुटि' : 'Error', errorData.error || (isHindi ? 'दान जमा करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to submit donation. Please try again.'));
                  }
                } catch (error) {
                  Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'दान जमा करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to submit donation. Please try again.');
                }
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold'
              }}>
                {isHindi ? translations.donationForm.submit.hi : translations.donationForm.submit.en}
              </Text>
            </TouchableOpacity>
            
            {/* 300px white space at the end */}
            <View style={{ height: 300 }} />
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
          minimumDate={new Date(Date.now() + 18 * 60 * 60 * 1000)} // 18 hours from now
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 40,
  },
  toggleItem: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 21,
  },
  toggleLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  content: {
    padding: 15,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  contentScrollView: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 16,
    marginTop: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF6EE',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD6A0',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6A00',
    textAlign: 'center',
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
    width: '48%', // Two tiles per row
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
  tileAbout: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    fontStyle: 'italic',
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
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 