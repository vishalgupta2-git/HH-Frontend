import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator, Alert } from 'react-native';
import { getEndpointUrl } from '@/constants/ApiConfig';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function AstrologyScreen() {
  const { isHindi } = useLanguage();
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [rashifalModalVisible, setRashifalModalVisible] = useState(false);
  const [rashifalData, setRashifalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rashiCalculatorModalVisible, setRashiCalculatorModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [calculatedRashi, setCalculatedRashi] = useState<string | null>(null);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const translations = {
    headline: { en: 'Discover the timeless wisdom of the stars.', hi: 'तारों के कालातीत ज्ञान की खोज करें।' },
    content1: { en: 'Astrology isn\'t just about predicting the future. It\'s a guide to understanding yourself, your relationships, and the energies shaping your life.', hi: 'ज्योतिष केवल भविष्य की भविष्यवाणी के बारे में नहीं है। यह अपने आप को समझने, अपने रिश्तों को समझने और आपके जीवन को आकार देने वाली ऊर्जाओं के लिए एक मार्गदर्शक है।' },
    content2: { en: 'In our astrology section, you\'ll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.', hi: 'हमारे ज्योतिष अनुभाग में, आपको जल्द ही व्यक्तिगत अंतर्दृष्टि मिलेगी — आपके जन्म चार्ट से लेकर दैनिक ब्रह्मांडीय अपडेट तक — जो आपको ब्रह्मांड की लय के साथ अपने विचारों और कार्यों को संरेखित करने में मदद करेगी।' },
    content3: { en: 'Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.', hi: 'चाहे आप अपने करियर, रिश्तों पर स्पष्टता चाहते हों, या बस अपने राशि चिन्ह के रहस्यों का पता लगाना चाहते हों, यह स्थान आपका भरोसेमंद आध्यात्मिक साथी बन जाएगा।' },
    selectRashi: { en: 'Select Rashi', hi: 'राशि चुनें' },
    duration: { en: 'Duration', hi: 'अवधि' },
    selectRashiFirst: { en: 'Select Rashi first', hi: 'पहले राशि चुनें' },
    selectDurationFirst: { en: 'Select Duration first', hi: 'पहले अवधि चुनें' },
    showMyRashifal: { en: 'Show my rashifal now', hi: 'अब मेरा राशिफल दिखाएं' },
    dontKnowRashi: { en: 'Don\'t know your Rashi?', hi: 'अपनी राशि नहीं जानते?' },
    clickHere: { en: 'Click here', hi: 'यहाँ क्लिक करें' },
    fetchingRashifal: { en: 'Fetching your rashifal...', hi: 'आपका राशिफल लाया जा रहा है...' },
    compatibility: { en: 'Compatibility', hi: 'अनुकूलता' },
    mood: { en: 'Mood', hi: 'मनोदशा' },
    color: { en: 'Color', hi: 'रंग' },
    luckyNumber: { en: 'Lucky Number', hi: 'भाग्यशाली संख्या' },
    luckyTime: { en: 'Lucky Time', hi: 'भाग्यशाली समय' },
    close: { en: 'Close', hi: 'बंद करें' },
    findYourRashi: { en: 'Find Your Rashi', hi: 'अपनी राशि खोजें' },
    enterDateMonth: { en: 'Enter your date and month of birth to find your Rashi (Zodiac Sign)', hi: 'अपनी राशि (राशि चिन्ह) खोजने के लिए अपनी जन्म तिथि और महीना दर्ज करें' },
    dateOfBirth: { en: 'Date of Birth:', hi: 'जन्म तिथि:' },
    monthOfBirth: { en: 'Month of Birth:', hi: 'जन्म का महीना:' },
    calculateMyRashi: { en: 'Calculate My Rashi', hi: 'मेरी राशि की गणना करें' },
    yourRashiIs: { en: 'Your Rashi is:', hi: 'आपकी राशि है:' },
    useThisRashi: { en: 'Use This Rashi', hi: 'इस राशि का उपयोग करें' },
    daily: { en: 'Daily', hi: 'दैनिक' },
    weekly: { en: 'Weekly', hi: 'साप्ताहिक' },
    monthly: { en: 'Monthly', hi: 'मासिक' },
    todaysHoroscope: { en: 'Today\'s Horoscope', hi: 'आज का राशिफल' },
    horoscopeForWeek: { en: 'Horoscope for the Week', hi: 'सप्ताह का राशिफल' },
    horoscopeForMonth: { en: 'Horoscope for the Month', hi: 'महीने का राशिफल' },
    months: {
      january: { en: 'January', hi: 'जनवरी' },
      february: { en: 'February', hi: 'फरवरी' },
      march: { en: 'March', hi: 'मार्च' },
      april: { en: 'April', hi: 'अप्रैल' },
      may: { en: 'May', hi: 'मई' },
      june: { en: 'June', hi: 'जून' },
      july: { en: 'July', hi: 'जुलाई' },
      august: { en: 'August', hi: 'अगस्त' },
      september: { en: 'September', hi: 'सितंबर' },
      october: { en: 'October', hi: 'अक्टूबर' },
      november: { en: 'November', hi: 'नवंबर' },
      december: { en: 'December', hi: 'दिसंबर' }
    }
  };

  const rashiList = [
    'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
    'Leo (Singh)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
    'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
  ];

  const frequencyList = [
    isHindi ? translations.daily.hi : translations.daily.en,
    isHindi ? translations.weekly.hi : translations.weekly.en,
    isHindi ? translations.monthly.hi : translations.monthly.en
  ];

  // Function to calculate Rashi based on date and month
  const calculateRashi = (date: number, month: number): string => {
    if ((month === 3 && date >= 21) || (month === 4 && date <= 19)) return 'Aries (Mesh)';
    if ((month === 4 && date >= 20) || (month === 5 && date <= 20)) return 'Taurus (Vrishabh)';
    if ((month === 5 && date >= 21) || (month === 6 && date <= 20)) return 'Gemini (Mithun)';
    if ((month === 6 && date >= 21) || (month === 7 && date <= 22)) return 'Cancer (Kark)';
    if ((month === 7 && date >= 23) || (month === 8 && date <= 22)) return 'Leo (Singh)';
    if ((month === 8 && date >= 23) || (month === 9 && date <= 22)) return 'Virgo (Kanya)';
    if ((month === 9 && date >= 23) || (month === 10 && date <= 22)) return 'Libra (Tula)';
    if ((month === 10 && date >= 23) || (month === 11 && date <= 21)) return 'Scorpio (Vrishchik)';
    if ((month === 11 && date >= 22) || (month === 12 && date <= 21)) return 'Sagittarius (Dhanu)';
    if ((month === 12 && date >= 22) || (month === 1 && date <= 19)) return 'Capricorn (Makar)';
    if ((month === 1 && date >= 20) || (month === 2 && date <= 18)) return 'Aquarius (Kumbh)';
    if ((month === 2 && date >= 19) || (month === 3 && date <= 20)) return 'Pisces (Meen)';
    return 'Aries (Mesh)'; // Default fallback
  };

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
    if (frequency === translations.daily.hi || frequency === translations.daily.en) return 'daily';
    if (frequency === translations.weekly.hi || frequency === translations.weekly.en) return 'weekly';
    if (frequency === translations.monthly.hi || frequency === translations.monthly.en) return 'monthly';
    return 'daily';
  };

  // Function to get horoscope title based on frequency
  const getHoroscopeTitle = (frequency: string) => {
    if (frequency === translations.daily.hi || frequency === translations.daily.en) {
      return isHindi ? translations.todaysHoroscope.hi : translations.todaysHoroscope.en;
    }
    if (frequency === translations.weekly.hi || frequency === translations.weekly.en) {
      return isHindi ? translations.horoscopeForWeek.hi : translations.horoscopeForWeek.en;
    }
    if (frequency === translations.monthly.hi || frequency === translations.monthly.en) {
      return isHindi ? translations.horoscopeForMonth.hi : translations.horoscopeForMonth.en;
    }
    return isHindi ? translations.todaysHoroscope.hi : translations.todaysHoroscope.en;
  };

  // Function to fetch rashifal from FreeAstrologyAPI
  const fetchRashifal = async () => {
    if (!selectedRashi) {
      Alert.alert(isHindi ? translations.selectRashiFirst.hi : translations.selectRashiFirst.en);
      return;
    }

    if (!selectedFrequency) {
      Alert.alert(isHindi ? translations.selectDurationFirst.hi : translations.selectDurationFirst.en);
      return;
    }

    // Award mudras for checking rashifal
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('CHECK_RASHIFAL');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('CHECK_RASHIFAL');
        // Silent mudra awarding
      }
    } catch (mudraError) {
      // Silent error handling
    }

    setLoading(true);
    setRashifalModalVisible(true);

    try {
      const zodiacSign = getZodiacSign(selectedRashi);
      const frequency = selectedFrequency || 'Daily';
      
      // FreeAstrologyAPI endpoint (external API, not part of our backend)
      const endpoint = getEndpoint(frequency);
      const apiUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/${endpoint}?sign=${zodiacSign}&day=today`;
      
      // API request details removed for cleaner logging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      // API response details removed for cleaner logging

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
      // API response data details removed for cleaner logging
      
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
      
      // Transformed data details removed for cleaner logging
      
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
              {selectedRashi || (isHindi ? translations.selectRashi.hi : translations.selectRashi.en)}
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
              {selectedFrequency || (isHindi ? translations.duration.hi : translations.duration.en)}
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
           {!selectedRashi ? (isHindi ? translations.selectRashiFirst.hi : translations.selectRashiFirst.en) : 
            !selectedFrequency ? (isHindi ? translations.selectDurationFirst.hi : translations.selectDurationFirst.en) : 
            (isHindi ? translations.showMyRashifal.hi : translations.showMyRashifal.en)}
         </Text>
       </TouchableOpacity>
             <View style={styles.rashifalHelpText}>
         <Text style={styles.rashifalHelpTextRegular}>{isHindi ? translations.dontKnowRashi.hi : translations.dontKnowRashi.en} </Text>
         <TouchableOpacity onPress={() => setRashiCalculatorModalVisible(true)}>
           <Text style={styles.rashifalHelpTextLink}>{isHindi ? translations.clickHere.hi : translations.clickHere.en}</Text>
         </TouchableOpacity>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader extraContent={filterRow} showDailyPujaButton={false} showSearchBar={false} />
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <Text style={styles.headline}>{isHindi ? translations.headline.hi : translations.headline.en}</Text>
          <ScrollView 
            style={styles.contentScrollView} 
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.contentText}>
              {isHindi ? translations.content1.hi : translations.content1.en}
            </Text>
            <Text style={styles.contentText}>
              {isHindi ? translations.content2.hi : translations.content2.en}
            </Text>
            <Text style={styles.contentText}>
              {isHindi ? translations.content3.hi : translations.content3.en}
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
                   <Text style={styles.loadingText}>{isHindi ? translations.fetchingRashifal.hi : translations.fetchingRashifal.en}</Text>
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
                     <Text style={styles.rashifalSectionTitle}>{isHindi ? translations.compatibility.hi : translations.compatibility.en}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.compatibility}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{isHindi ? translations.mood.hi : translations.mood.en}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.mood}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{isHindi ? translations.color.hi : translations.color.en}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.color}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{isHindi ? translations.luckyNumber.hi : translations.luckyNumber.en}</Text>
                     <Text style={styles.rashifalText}>{rashifalData.lucky_number}</Text>
                   </View>

                   <View style={styles.rashifalSection}>
                     <Text style={styles.rashifalSectionTitle}>{isHindi ? translations.luckyTime.hi : translations.luckyTime.en}</Text>
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
               <Text style={styles.modalCloseButtonText}>{isHindi ? translations.close.hi : translations.close.en}</Text>
                           </TouchableOpacity>
            </View>
          </View>
        </Modal>

                 {/* Rashi Calculator Modal */}
         <Modal
           visible={rashiCalculatorModalVisible}
           transparent={true}
           animationType="slide"
           onRequestClose={() => setRashiCalculatorModalVisible(false)}
         >
           <TouchableWithoutFeedback onPress={() => setRashiCalculatorModalVisible(false)}>
             <View style={styles.modalOverlay}>
               <TouchableWithoutFeedback onPress={() => {}}>
                 <View style={styles.modalContent}>
                             {/* Header with X button */}
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>{isHindi ? translations.findYourRashi.hi : translations.findYourRashi.en}</Text>
                 <TouchableOpacity 
                   style={styles.closeButton}
                   onPress={() => setRashiCalculatorModalVisible(false)}
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
                <View style={styles.calculatorContent}>
                  <Text style={styles.calculatorDescription}>
                    {isHindi ? translations.enterDateMonth.hi : translations.enterDateMonth.en}
                  </Text>

                                     {/* Date Selection */}
                   <View style={styles.selectionSection}>
                     <Text style={styles.selectionLabel}>{isHindi ? translations.dateOfBirth.hi : translations.dateOfBirth.en}</Text>
                     <View style={styles.calculatorDropdownWrapper}>
                       <TouchableOpacity
                         style={styles.calculatorDropdown}
                         onPress={() => setDateDropdownOpen(open => !open)}
                       >
                         <Text style={styles.calculatorDropdownText}>
                           {selectedDate}
                         </Text>
                         <MaterialCommunityIcons
                           name={dateDropdownOpen ? 'chevron-up' : 'chevron-down'}
                           size={22}
                           color="#333"
                         />
                       </TouchableOpacity>
                       <Modal
                         visible={dateDropdownOpen}
                         transparent
                         animationType="fade"
                         onRequestClose={() => setDateDropdownOpen(false)}
                       >
                         <TouchableWithoutFeedback onPress={() => setDateDropdownOpen(false)}>
                           <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                             <View style={styles.calculatorDropdownModalList}>
                               <ScrollView style={{ maxHeight: 320 }}>
                                 {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                                   <TouchableOpacity
                                     key={date}
                                     style={[
                                       styles.calculatorDropdownItem,
                                       selectedDate === date && styles.calculatorDropdownItemSelected
                                     ]}
                                     onPress={() => {
                                       setSelectedDate(date);
                                       setDateDropdownOpen(false);
                                     }}
                                   >
                                     <Text
                                       style={[
                                         styles.calculatorDropdownItemText,
                                         selectedDate === date && styles.calculatorDropdownItemTextSelected
                                       ]}
                                     >
                                       {date}
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

                   {/* Month Selection */}
                   <View style={styles.selectionSection}>
                     <Text style={styles.selectionLabel}>{isHindi ? translations.monthOfBirth.hi : translations.monthOfBirth.en}</Text>
                     <View style={styles.calculatorDropdownWrapper}>
                       <TouchableOpacity
                         style={styles.calculatorDropdown}
                         onPress={() => setMonthDropdownOpen(open => !open)}
                       >
                         <Text style={styles.calculatorDropdownText}>
                           {[
                             { num: 1, name: isHindi ? translations.months.january.hi : translations.months.january.en }, 
                             { num: 2, name: isHindi ? translations.months.february.hi : translations.months.february.en }, 
                             { num: 3, name: isHindi ? translations.months.march.hi : translations.months.march.en },
                             { num: 4, name: isHindi ? translations.months.april.hi : translations.months.april.en }, 
                             { num: 5, name: isHindi ? translations.months.may.hi : translations.months.may.en }, 
                             { num: 6, name: isHindi ? translations.months.june.hi : translations.months.june.en },
                             { num: 7, name: isHindi ? translations.months.july.hi : translations.months.july.en }, 
                             { num: 8, name: isHindi ? translations.months.august.hi : translations.months.august.en }, 
                             { num: 9, name: isHindi ? translations.months.september.hi : translations.months.september.en },
                             { num: 10, name: isHindi ? translations.months.october.hi : translations.months.october.en }, 
                             { num: 11, name: isHindi ? translations.months.november.hi : translations.months.november.en }, 
                             { num: 12, name: isHindi ? translations.months.december.hi : translations.months.december.en }
                           ].find(m => m.num === selectedMonth)?.name || (isHindi ? translations.months.january.hi : translations.months.january.en)}
                         </Text>
                         <MaterialCommunityIcons
                           name={monthDropdownOpen ? 'chevron-up' : 'chevron-down'}
                           size={22}
                           color="#333"
                         />
                       </TouchableOpacity>
                       <Modal
                         visible={monthDropdownOpen}
                         transparent
                         animationType="fade"
                         onRequestClose={() => setMonthDropdownOpen(false)}
                       >
                         <TouchableWithoutFeedback onPress={() => setMonthDropdownOpen(false)}>
                           <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                             <View style={styles.calculatorDropdownModalList}>
                               <ScrollView style={{ maxHeight: 320 }}>
                                 {[
                                   { num: 1, name: isHindi ? translations.months.january.hi : translations.months.january.en }, 
                                   { num: 2, name: isHindi ? translations.months.february.hi : translations.months.february.en }, 
                                   { num: 3, name: isHindi ? translations.months.march.hi : translations.months.march.en },
                                   { num: 4, name: isHindi ? translations.months.april.hi : translations.months.april.en }, 
                                   { num: 5, name: isHindi ? translations.months.may.hi : translations.months.may.en }, 
                                   { num: 6, name: isHindi ? translations.months.june.hi : translations.months.june.en },
                                   { num: 7, name: isHindi ? translations.months.july.hi : translations.months.july.en }, 
                                   { num: 8, name: isHindi ? translations.months.august.hi : translations.months.august.en }, 
                                   { num: 9, name: isHindi ? translations.months.september.hi : translations.months.september.en },
                                   { num: 10, name: isHindi ? translations.months.october.hi : translations.months.october.en }, 
                                   { num: 11, name: isHindi ? translations.months.november.hi : translations.months.november.en }, 
                                   { num: 12, name: isHindi ? translations.months.december.hi : translations.months.december.en }
                                 ].map(month => (
                                   <TouchableOpacity
                                     key={month.num}
                                     style={[
                                       styles.calculatorDropdownItem,
                                       selectedMonth === month.num && styles.calculatorDropdownItemSelected
                                     ]}
                                     onPress={() => {
                                       setSelectedMonth(month.num);
                                       setMonthDropdownOpen(false);
                                     }}
                                   >
                                     <Text
                                       style={[
                                         styles.calculatorDropdownItemText,
                                         selectedMonth === month.num && styles.calculatorDropdownItemTextSelected
                                       ]}
                                     >
                                       {month.name}
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

                  {/* Calculate Button */}
                  <TouchableOpacity 
                    style={styles.calculateButton}
                    onPress={() => {
                      const rashi = calculateRashi(selectedDate, selectedMonth);
                      setCalculatedRashi(rashi);
                    }}
                  >
                    <Text style={styles.calculateButtonText}>{isHindi ? translations.calculateMyRashi.hi : translations.calculateMyRashi.en}</Text>
                  </TouchableOpacity>

                  {/* Result */}
                  {calculatedRashi && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>{isHindi ? translations.yourRashiIs.hi : translations.yourRashiIs.en}</Text>
                      <Text style={styles.resultRashi}>{calculatedRashi}</Text>
                      <TouchableOpacity 
                        style={styles.useRashiButton}
                        onPress={() => {
                          setSelectedRashi(calculatedRashi);
                          setRashiCalculatorModalVisible(false);
                          setCalculatedRashi(null);
                        }}
                      >
                        <Text style={styles.useRashiButtonText}>{isHindi ? translations.useThisRashi.hi : translations.useThisRashi.en}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                                     {/* Extra space at bottom for better scrolling */}
                   <View style={{ height: 100 }} />
                 </View>
               </ScrollView>

               
                 </View>
               </TouchableWithoutFeedback>
             </View>
           </TouchableWithoutFeedback>
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
   // Rashi Calculator Modal styles
   calculatorContent: {
     paddingVertical: 20,
     paddingBottom: 60,
   },
   calculatorDescription: {
     fontSize: 16,
     lineHeight: 24,
     color: '#555',
     textAlign: 'center',
     marginBottom: 25,
     paddingHorizontal: 10,
   },
   selectionSection: {
     marginBottom: 25,
   },
   selectionLabel: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#333',
     marginBottom: 15,
     textAlign: 'center',
   },
   
   calculateButton: {
     backgroundColor: '#FF6A00',
     marginHorizontal: 20,
     marginVertical: 20,
     paddingVertical: 15,
     borderRadius: 10,
     alignItems: 'center',
   },
   calculateButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
   },
   resultSection: {
     alignItems: 'center',
     marginTop: 20,
     paddingVertical: 20,
     backgroundColor: '#f9f9f9',
     borderRadius: 12,
     marginHorizontal: 20,
   },
   resultTitle: {
     fontSize: 16,
     color: '#666',
     marginBottom: 10,
   },
   resultRashi: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FF6A00',
     marginBottom: 20,
     textAlign: 'center',
   },
   useRashiButton: {
     backgroundColor: '#28a745',
     paddingHorizontal: 30,
     paddingVertical: 12,
     borderRadius: 8,
   },
       useRashiButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Calculator Dropdown styles
    calculatorDropdownWrapper: {
      position: 'relative',
      marginTop: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      padding: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      zIndex: 1000,
      elevation: 20,
    },
    calculatorDropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    calculatorDropdownText: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    calculatorDropdownModalList: {
      position: 'absolute',
      top: 80,
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
    calculatorDropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    calculatorDropdownItemSelected: {
      backgroundColor: '#e0e0e0',
    },
    calculatorDropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
    calculatorDropdownItemTextSelected: {
      fontWeight: 'bold',
      color: '#FF6A00',
    },
 }); 