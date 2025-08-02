import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator, Alert } from 'react-native';
import { getEndpointUrl } from '@/constants/ApiConfig';

export const options = { headerShown: false };

export default function AstrologyScreen() {
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [rashifalModalVisible, setRashifalModalVisible] = useState(false);
  const [rashifalData, setRashifalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rashiList = [
    'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
    'Leo (Singh)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
    'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
  ];

  const frequencyList = ['Daily', 'Weekly', 'Monthly'];

  // Function to get zodiac sign from rashi
  const getZodiacSign = (rashi: string) => {
    const rashiToZodiac: { [key: string]: string } = {
      'Aries (Mesh)': 'aries',
      'Taurus (Vrishabh)': 'taurus',
      'Gemini (Mithun)': 'gemini',
      'Cancer (Kark)': 'cancer',
      'Leo (Singh)': 'leo',
      'Virgo (Kanya)': 'virgo',
      'Libra (Tula)': 'libra',
      'Scorpio (Vrishchik)': 'scorpio',
      'Sagittarius (Dhanu)': 'sagittarius',
      'Capricorn (Makar)': 'capricorn',
      'Aquarius (Kumbh)': 'aquarius',
      'Pisces (Meen)': 'pisces'
    };
    return rashiToZodiac[rashi] || 'aries';
  };

  // Function to get endpoint based on frequency
  const getEndpoint = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return 'daily';
      case 'Weekly': return 'weekly';
      case 'Monthly': return 'monthly';
      default: return 'daily';
    }
  };

  // Function to get horoscope title based on frequency
  const getHoroscopeTitle = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return "Today's Horoscope";
      case 'Weekly': return 'Horoscope for the Week';
      case 'Monthly': return 'Horoscope for the Month';
      default: return "Today's Horoscope";
    }
  };

  // Function to fetch rashifal from FreeAstrologyAPI
  const fetchRashifal = async () => {
    if (!selectedRashi) {
      Alert.alert('Please select your Rashi first');
      return;
    }

    if (!selectedFrequency) {
      Alert.alert('Please select Duration (Daily/Weekly/Monthly) first');
      return;
    }

    setLoading(true);
    setRashifalModalVisible(true);

    try {
      const zodiacSign = getZodiacSign(selectedRashi);
      const frequency = selectedFrequency || 'Daily';
      
      // FreeAstrologyAPI endpoint (external API, not part of our backend)
      const endpoint = getEndpoint(frequency);
      const apiUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/${endpoint}?sign=${zodiacSign}&day=today`;
      
      console.log('=== RASHIFAL API REQUEST ===');
      console.log('Zodiac Sign:', zodiacSign);
      console.log('Frequency:', frequency);
      console.log('Endpoint:', endpoint);
      console.log('Selected Rashi:', selectedRashi);
      console.log('API URL:', apiUrl);
      
      // Try minimal fetch to match curl behavior exactly
      console.log('Starting fetch request...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Fetch completed successfully');

      console.log('=== API RESPONSE DETAILS ===');
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('Response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== API ERROR ===');
        console.error('Error Status:', response.status);
        console.error('Error Text:', errorText);
        Alert.alert('Error', 'Failed to fetch your rashifal. Please try again.');
        setRashifalModalVisible(false);
        return;
      }

      const data = await response.json();
      console.log('=== API RESPONSE DATA ===');
      console.log('Full Response:', JSON.stringify(data, null, 2));
      console.log('Data Object:', data.data);
      console.log('Date:', data.data?.date);
      console.log('Horoscope Data:', data.data?.horoscope_data);
      console.log('Status:', data.status);
      console.log('Success:', data.success);
      
      // Transform the API response to match our expected format
      const transformedData = {
        current_date: data.data?.date || new Date().toLocaleDateString(),
        compatibility: 'Libra', // Default value since API doesn't provide this
        lucky_number: 7, // Default value since API doesn't provide this
        lucky_time: '2pm', // Default value since API doesn't provide this
        mood: 'Optimistic', // Default value since API doesn't provide this
        color: 'Orange', // Default value since API doesn't provide this
        date_range: 'March 21 - April 19', // Default for Aries, would need mapping for others
        description: data.data?.horoscope_data || 'No horoscope data available'
      };
      
      console.log('=== TRANSFORMED DATA ===');
      console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));
      
      setRashifalData(transformedData);
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error Type:', typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : error);
      console.error('Full Error:', error);
      
      let errorMessage = 'Failed to fetch your rashifal. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your internet connection.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Failed to connect to the server. Please try again.';
        }
      }
      
      Alert.alert('Error', errorMessage);
      setRashifalModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // Content from astrologyFixedContent.txt (without the headline)
  const astrologyContent = `Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.`;

  const filterRow = (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setRashiDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedRashi || 'Select Rashi'}
            </Text>
            <MaterialCommunityIcons
              name={rashiDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={rashiDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setRashiDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setRashiDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {rashiList.map(rashi => (
                      <TouchableOpacity
                        key={rashi}
                        style={[
                          styles.filterDropdownItem,
                          selectedRashi === rashi && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedRashi === rashi) {
                            setSelectedRashi(null);
                          } else {
                            setSelectedRashi(rashi);
                          }
                          setRashiDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedRashi === rashi && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {rashi}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>

        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setFrequencyDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedFrequency || 'Duration'}
            </Text>
            <MaterialCommunityIcons
              name={frequencyDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={frequencyDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setFrequencyDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setFrequencyDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {frequencyList.map(frequency => (
                      <TouchableOpacity
                        key={frequency}
                        style={[
                          styles.filterDropdownItem,
                          selectedFrequency === frequency && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedFrequency === frequency) {
                            setSelectedFrequency(null);
                          } else {
                            setSelectedFrequency(frequency);
                          }
                          setFrequencyDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedFrequency === frequency && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {frequency}
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
      
             <TouchableOpacity 
         style={[
           styles.rashifalButton, 
           (!selectedRashi || !selectedFrequency) && styles.rashifalButtonDisabled
         ]} 
         onPress={fetchRashifal}
       >
         <Text style={[
           styles.rashifalButtonText,
           (!selectedRashi || !selectedFrequency) && styles.rashifalButtonTextDisabled
         ]}>
           {!selectedRashi ? 'Select Rashi first' : 
            !selectedFrequency ? 'Select Duration first' : 
            'Show my rashifal now'}
         </Text>
       </TouchableOpacity>
      <View style={styles.rashifalHelpText}>
        <Text style={styles.rashifalHelpTextRegular}>Don't know your Rashi? </Text>
        <TouchableOpacity>
          <Text style={styles.rashifalHelpTextLink}>Click here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader extraContent={filterRow} showDailyPujaButton={false} showSearchBar={false} />
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <Text style={styles.headline}>Discover the timeless wisdom of the stars.</Text>
          <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.contentText}>
              Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
            </Text>
            <Text style={styles.contentText}>
              In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
            </Text>
            <Text style={styles.contentText}>
              Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.
            </Text>
          </ScrollView>
        </View>
      </View>

             {/* Rashifal Modal */}
       <Modal
         visible={rashifalModalVisible}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setRashifalModalVisible(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             {/* Header with X button */}
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>
                 {selectedRashi} - {selectedFrequency || 'Daily'} Rashifal
               </Text>
               <TouchableOpacity 
                 style={styles.closeButton}
                 onPress={() => setRashifalModalVisible(false)}
               >
                 <MaterialCommunityIcons name="close" size={24} color="#333" />
               </TouchableOpacity>
             </View>

             {/* Content */}
             <ScrollView 
               style={styles.modalScrollView} 
               showsVerticalScrollIndicator={true}
               nestedScrollEnabled={true}
             >
               {loading ? (
                 <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#FF6A00" />
                   <Text style={styles.loadingText}>Fetching your rashifal...</Text>
                 </View>
               ) : rashifalData ? (
                 <View style={styles.rashifalContent}>
                   <View style={styles.rashifalHeader}>
                     <Text style={styles.rashifalSign}>{selectedRashi}</Text>
                     <Text style={styles.rashifalDate}>{rashifalData.current_date}</Text>
                   </View>
                   
                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{getHoroscopeTitle(selectedFrequency || 'Daily')}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.description}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>Compatibility</Text>
                     <Text style={styles.rashifalText}>{rashifalData.compatibility}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>Mood</Text>
                     <Text style={styles.rashifalText}>{rashifalData.mood}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>Color</Text>
                     <Text style={styles.rashifalText}>{rashifalData.color}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>Lucky Number</Text>
                     <Text style={styles.rashifalText}>{rashifalData.lucky_number}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>Lucky Time</Text>
                     <Text style={styles.rashifalText}>{rashifalData.lucky_time}</Text>
                   </View>

                   {/* Extra space at bottom for better scrolling */}
                   <View style={{ height: 100 }} />
                 </View>
               ) : null}
             </ScrollView>

             {/* Close button at bottom */}
             <TouchableOpacity 
               style={styles.modalCloseButton}
               onPress={() => setRashifalModalVisible(false)}
             >
               <Text style={styles.modalCloseButtonText}>Close</Text>
             </TouchableOpacity>
           </View>
         </View>
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
  filterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
    marginBottom: 14,
  },
  rashifalButton: {
    width: '80%',
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
     rashifalButtonText: {
     color: '#FF6A00',
     fontSize: 16,
     fontWeight: 'bold',
   },
   rashifalButtonDisabled: {
     backgroundColor: '#f5f5f5',
     opacity: 0.7,
   },
   rashifalButtonTextDisabled: {
     color: '#999',
   },
  rashifalHelpText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  rashifalHelpTextRegular: {
    fontSize: 14,
    color: '#333',
  },
  rashifalHelpTextLink: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  filterDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
    flex: 1,
    marginHorizontal: 8,
  },
  filterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownModalList: {
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
  filterDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  filterDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
     modalContent: {
     backgroundColor: '#fff',
     borderTopLeftRadius: 20,
     borderTopRightRadius: 20,
     height: '85%',
     flexDirection: 'column',
   },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
     modalScrollView: {
     flex: 1,
     paddingHorizontal: 20,
     paddingBottom: 10,
   },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
     rashifalContent: {
     paddingVertical: 20,
     paddingBottom: 60,
   },
  rashifalHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rashifalSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 5,
  },
  rashifalDate: {
    fontSize: 16,
    color: '#666',
  },
  rashifalSection: {
    marginBottom: 20,
  },
  rashifalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rashifalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  modalCloseButton: {
    backgroundColor: '#FF6A00',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 