import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const { width: screenWidth } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

// Responsive sizing system
const getResponsiveFontSize = (baseSize: number) => {
  const scaleFactor = Math.min(screenWidth / 375, 1.5);
  return Math.max(baseSize * scaleFactor, baseSize * 0.8);
};

const getResponsiveDimension = (baseSize: number) => {
  const scaleFactor = Math.min(screenWidth / 375, 1.3);
  return Math.max(baseSize * scaleFactor, baseSize * 0.9);
};

interface HinduMonth {
  name: string;
  gregorianSpan: string;
  festivals: Festival[];
  color: string;
  startDate: Date;
  endDate: Date;
}

interface Festival {
  name: string;
  date: string;
  description?: string;
}

const hinduMonths: HinduMonth[] = [
  {
    name: 'Bhadrapada',
    gregorianSpan: 'Aug 10 – Sept 7, 2025',
    color: '#FFE5E5',
    startDate: new Date(2025, 7, 10),
    endDate: new Date(2025, 8, 7),
    festivals: [
      { name: 'Krishna Janmashtami', date: 'Aug 15', description: 'Shri Krishna' },
      { name: 'Krishna Janmashtami', date: 'Aug 16', description: 'Shri Krishna' },
      { name: 'Ganesh Chaturthi', date: 'Aug 27', description: 'Vighnaharta Ganesh' },
      { name: 'Rishi Panchami', date: 'Aug 28', description: 'Seven Sages' },
      { name: 'Anant Chaturdashi (Visarjan)', date: 'Sep 6', description: 'Vighnaharta Ganesh' }
    ]
  },
  {
    name: 'Ashvina',
    gregorianSpan: 'Sept 8 – Oct 7, 2025',
    color: '#E5F7F4',
    startDate: new Date(2025, 8, 8),
    endDate: new Date(2025, 9, 7),
    festivals: [
      { name: 'Sharad Navratri (Day 1 – Shailaputri)', date: 'Sep 22', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 2 – Brahmacharini)', date: 'Sep 23', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 3 – Chandraghanta)', date: 'Sep 24', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 4 – Kushmanda)', date: 'Sep 25', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 5 – Skandamata)', date: 'Sep 26', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 6 – Katyayani)', date: 'Sep 27', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 7 – Kalaratri)', date: 'Sep 28', description: 'Maa Kali' },
      { name: 'Sharad Navratri (Day 8 – Mahagauri)', date: 'Sep 29', description: 'Durga Maa' },
      { name: 'Sharad Navratri (Day 9 – Siddhidatri)', date: 'Sep 30', description: 'Durga Maa' },
      { name: 'Vijayadashami (Dussehra)', date: 'Oct 2', description: 'Shri Ram' },
      { name: 'Karva Chauth', date: 'Oct 10', description: '' },
      { name: 'Dhanteras (Diwali Day 1)', date: 'Oct 18', description: 'Lakshmi Maa' },
      { name: 'Naraka Chaturdashi (Chhoti Diwali)', date: 'Oct 19', description: 'Shri Krishna' },
      { name: 'Lakshmi Puja (Diwali)', date: 'Oct 20', description: 'Lakshmi Maa' },
      { name: 'Govardhan Puja', date: 'Oct 21', description: 'Shri Krishna' },
      { name: 'Bhai Dooj', date: 'Oct 23', description: '' }
    ]
  },
  {
    name: 'Kartika',
    gregorianSpan: 'Oct 8 – Nov 5, 2025',
    color: '#E5F3F8',
    startDate: new Date(2025, 9, 8),
    endDate: new Date(2025, 10, 5),
    festivals: [
      { name: 'Gita Jayanti (Mokshada Ekadashi)', date: 'Nov 4', description: 'Shri Krishna' }
    ]
  },
  {
    name: 'Margashirsha',
    gregorianSpan: 'Nov 6 – Dec 4, 2025',
    color: '#E5F7F4',
    startDate: new Date(2025, 10, 6),
    endDate: new Date(2025, 11, 4),
    festivals: []
  },
  {
    name: 'Pausha',
    gregorianSpan: 'Dec 5, 2025 – Jan 3, 2026',
    color: '#FFF8E5',
    startDate: new Date(2025, 11, 5),
    endDate: new Date(2026, 0, 3),
    festivals: [
      { name: 'Pausha Putrada Ekadashi', date: 'Dec 30', description: 'Vishnu Bhagwan' }
    ]
  },
  {
    name: 'Magha',
    gregorianSpan: 'Jan 4 – Feb 1, 2026',
    color: '#F8E5F8',
    startDate: new Date(2026, 0, 4),
    endDate: new Date(2026, 1, 1),
    festivals: [
      { name: 'Makar Sankranti / Pongal / Magh Bihu', date: 'Jan 14', description: 'Surya Dev' },
      { name: 'Vasant Panchami', date: 'Jan 23', description: 'Saraswati Maa' }
    ]
  },
  {
    name: 'Phalguna',
    gregorianSpan: 'Feb 2 – Mar 3, 2026',
    color: '#E5F7F4',
    startDate: new Date(2026, 1, 2),
    endDate: new Date(2026, 2, 3),
    festivals: [
      { name: 'Maha Shivaratri', date: 'Feb 15', description: 'Mahadev Shiv Ji' },
      { name: 'Holika Dahan', date: 'Mar 3', description: '' },
      { name: 'Holi (Rangotsav)', date: 'Mar 4', description: 'Shri Krishna' }
    ]
  }
];

const HinduCalendarScreen: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<HinduMonth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Set initial date to August 2025 (earliest allowed month)
  useEffect(() => {
    const now = new Date();
    const august2025 = new Date(2025, 7, 1);
    
    if (now < august2025) {
      setCurrentDate(august2025);
    } else {
      setCurrentDate(now);
    }
  }, []);

  // Generate marked dates for the calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    // Add Shravana festivals (Aug 1-9, 2025)
    const shravanaFestivals = [
      { name: 'Shravan Somvar (last)', date: 'Aug 4', description: 'Mahadev Shiv Ji' },
      { name: 'Putrada Ekadashi', date: 'Aug 5', description: 'Vishnu Bhagwan' },
      { name: 'Raksha Bandhan (Shravana Purnima)', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
    ];
    
    shravanaFestivals.forEach(festival => {
      const dateKey = `2025-08-${festival.date.split(' ')[1].padStart(2, '0')}`;
      markedDates[dateKey] = {
        marked: true,
        dotColor: '#FF6A00',
        text: festival.name,
        description: festival.description,
        // Enhanced highlighting
        selected: true,
        selectedColor: '#FFE5CC',
        textColor: '#FF6A00',
        fontWeight: 'bold'
      };
    });
    
    // Add all other festivals from hinduMonths
    hinduMonths.forEach(month => {
      month.festivals.forEach(festival => {
        const [monthName, day] = festival.date.split(' ');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = monthNames.indexOf(monthName);
        const year = monthIndex >= 7 ? 2025 : 2026; // Aug-Sep 2025, rest 2026
        
        const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
        markedDates[dateKey] = {
          marked: true,
          dotColor: '#FF6A00',
          text: festival.name,
          description: festival.description,
          // Enhanced highlighting
          selected: true,
          selectedColor: '#FFE5CC',
          textColor: '#FF6A00',
          fontWeight: 'bold'
        };
      });
    });
    
    return markedDates;
  };

  const openMonthDetails = (month: HinduMonth) => {
    setSelectedMonth(month);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMonth(null);
  };

  const getHinduMonthTitle = (date: Date): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    // Special case for August 2025
    if (month === 'August' && year === 2025) {
      return `${month} (Shravana - Bhadrapada)`;
    }
    
    // Find which Hindu months this Gregorian month spans
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const spanningMonths: string[] = [];
    for (const hinduMonth of hinduMonths) {
      if ((hinduMonth.startDate <= monthEnd && hinduMonth.endDate >= monthStart)) {
        spanningMonths.push(hinduMonth.name);
      }
    }
    
    if (spanningMonths.length > 0) {
      return `${month} ${year} (${spanningMonths.join(' - ')})`;
    }
    
    return `${month} ${year}`;
  };

  const onMonthChange = (month: DateData) => {
    const newDate = new Date(month.timestamp);
    if (newDate >= new Date(2025, 7, 1) && newDate <= new Date(2026, 1, 1)) {
      setCurrentDate(newDate);
    }
  };

  const getMonthFestivals = (date: Date): Festival[] => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthFestivals: Festival[] = [];
    
    // Add Shravana festivals for August 2025 (only if we're in August)
    if (date.getFullYear() === 2025 && date.getMonth() === 7) {
      const shravanaFestivals: Festival[] = [
        { name: 'Shravan Somvar (last)', date: 'Aug 4', description: 'Mahadev Shiv Ji' },
        { name: 'Putrada Ekadashi', date: 'Aug 5', description: 'Vishnu Bhagwan' },
        { name: 'Raksha Bandhan (Shravana Purnima)', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
      ];
      monthFestivals.push(...shravanaFestivals);
    }
    
    // Only add festivals that fall within the current English month
    for (const month of hinduMonths) {
      if ((month.startDate <= monthEnd && month.endDate >= monthStart)) {
        const currentMonthFestivals = month.festivals.filter(festival => {
          let festivalDay: number;
          let festivalMonth: number;
          
          if (festival.date.includes('–') || festival.date.includes('-')) {
            const startDate = festival.date.split(/[–-]/)[0].trim();
            const [monthName, day] = startDate.split(' ');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            festivalMonth = monthNames.indexOf(monthName);
            festivalDay = parseInt(day);
          } else {
            const [monthName, day] = festival.date.split(' ');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            festivalMonth = monthNames.indexOf(monthName);
            festivalDay = parseInt(day);
          }
          
          return festivalMonth === date.getMonth();
        });
        
        monthFestivals.push(...currentMonthFestivals);
      }
    }
    
    return monthFestivals;
  };

  const monthFestivals = getMonthFestivals(currentDate);

  const renderCalendarTab = () => (
    <ScrollView style={styles.calendarTab} showsVerticalScrollIndicator={false}>
      {/* Update notice */}
      <Text style={styles.updateNotice}>Updated up to February 2026</Text>
      
      {/* Month Title */}
      <Text style={styles.monthTitle}>{getHinduMonthTitle(currentDate)}</Text>
      
      {/* Calendar with Built-in Swipe Support */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentDate.toISOString().split('T')[0]}
          onMonthChange={onMonthChange}
          markedDates={getMarkedDates()}
          minDate={'2025-08-01'}
          maxDate={'2026-02-28'}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#FF6A00',
            selectedDayBackgroundColor: '#FF6A00',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF6A00',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#FF6A00',
            indicatorColor: '#FF6A00',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: getResponsiveFontSize(16),
            textMonthFontSize: getResponsiveFontSize(18),
            textDayHeaderFontSize: getResponsiveFontSize(14)
          }}
          markingType={'period'}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={0}
          hideDayNames={false}
          showWeekNumbers={false}
          enableSwipeMonths={true}
          onDayPress={(day) => {
            const dateKey = day.dateString;
            const markedDate = getMarkedDates()[dateKey];
            if (markedDate) {
              setSelectedMonth({
                name: 'Festival Details',
                gregorianSpan: new Date(day.timestamp).toDateString(),
                color: '#FF6A00',
                startDate: new Date(day.timestamp),
                endDate: new Date(day.timestamp),
                festivals: [{
                  name: markedDate.text,
                  date: markedDate.text,
                  description: markedDate.description
                }]
              });
              setModalVisible(true);
            }
          }}
        />
      </View>

      {/* Month Festivals List */}
      {monthFestivals.length > 0 && (
        <View style={styles.monthFestivalsList}>
          <Text style={styles.monthFestivalsTitle}>Festivals this Month:</Text>
          {monthFestivals.map((festival, index) => (
            <View key={index} style={styles.monthFestivalItem}>
              <Text style={styles.monthFestivalName}>{festival.name}</Text>
              <Text style={styles.monthFestivalDate}>{festival.date}</Text>
              {festival.description && (
                <Text style={styles.monthFestivalDescription}>
                  {festival.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Bottom white space for easy scrolling */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderSummaryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Update notice */}
      <Text style={styles.updateNotice}>Updated up to February 2026</Text>
      
      {/* Hindu Months Overview */}
      <Text style={styles.sectionTitle}>Hindu Calendar 2025-2026</Text>
      
      {hinduMonths.map((month, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.monthCard, { borderLeftColor: month.color.replace('#', '#80') }]}
          onPress={() => openMonthDetails(month)}
        >
          <View style={styles.monthHeader}>
            <Text style={styles.monthName}>{month.name}</Text>
            <Text style={styles.gregorianSpan}>{month.gregorianSpan}</Text>
          </View>
          
          {month.festivals.length > 0 ? (
            <View style={styles.festivalsContainer}>
              <Text style={styles.festivalsTitle}>Key Festivals / Vrats:</Text>
              {month.festivals.map((festival, fIndex) => (
                <Text key={fIndex} style={styles.festivalText}>
                  {festival.name} – {festival.date}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.noFestivals}>
              (No major pan-Indian festivals listed in this period)
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Numerology screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
              Summary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'calendar' ? renderCalendarTab() : renderSummaryTab()}
      </View>

      {/* Month Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              {selectedMonth && (
                <View style={styles.modalBody}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedMonth.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedMonth.gregorianSpan}</Text>
                  </View>
                  
                  {selectedMonth.festivals.length > 0 ? (
                    <View style={styles.modalFestivals}>
                      <Text style={styles.modalFestivalsTitle}>Festivals & Vrats:</Text>
                      {selectedMonth.festivals.map((festival, index) => (
                        <View key={index} style={styles.modalFestivalItem}>
                          <Text style={styles.modalFestivalName}>{festival.name}</Text>
                          <Text style={styles.modalFestivalDate}>{festival.date}</Text>
                          {festival.description && (
                            <Text style={styles.modalFestivalDescription}>
                              {festival.description}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.modalNoFestivals}>
                      This month has no major pan-Indian festivals listed. 
                      It may include regional observances and solar events.
                    </Text>
                  )}
                  
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    width: Math.min(screenWidth * 1.125 * 0.8, screenWidth),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  temple: {
    position: 'absolute',
    width: screenWidth * 1.5 * 0.8 * 1.2,
    height: 120 * 0.8 * 1.2,
    left: screenWidth * -0.25 * 0.8,
    bottom: 0,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: 'white',
    marginTop: CARD_MARGIN_TOP,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF6A00',
  },
  calendarTab: {
    flex: 1,
  },
  monthTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateNotice: {
    textAlign: 'center',
    fontSize: getResponsiveFontSize(16),
    color: '#FF6A00',
    fontWeight: 'bold',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  monthCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: getResponsiveDimension(20),
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthHeader: {
    marginBottom: 15,
  },
  monthName: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  gregorianSpan: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    fontStyle: 'italic',
  },
  festivalsContainer: {
    marginTop: 10,
  },
  festivalsTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  festivalText: {
    fontSize: getResponsiveFontSize(14),
    color: '#555',
    marginBottom: 5,
    paddingLeft: 10,
  },
  noFestivals: {
    fontSize: getResponsiveFontSize(14),
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthFestivalsList: {
    marginTop: 20,
    padding: getResponsiveDimension(15),
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
  },
  monthFestivalsTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthFestivalItem: {
    backgroundColor: 'white',
    padding: getResponsiveDimension(12),
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthFestivalName: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  monthFestivalDate: {
    fontSize: getResponsiveFontSize(12),
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 4,
  },
  monthFestivalDescription: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: getResponsiveDimension(20),
    margin: getResponsiveDimension(20),
    maxWidth: screenWidth - 40,
    maxHeight: '80%',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    fontStyle: 'italic',
  },
  modalFestivals: {
    width: '100%',
    marginBottom: 20,
  },
  modalFestivalsTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalFestivalItem: {
    backgroundColor: '#F8F9FA',
    padding: getResponsiveDimension(15),
    borderRadius: 10,
    marginBottom: 10,
  },
  modalFestivalName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalFestivalDate: {
    fontSize: getResponsiveFontSize(14),
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 5,
  },
  modalFestivalDescription: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    fontStyle: 'italic',
  },
  modalNoFestivals: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: getResponsiveDimension(30),
    paddingVertical: getResponsiveDimension(12),
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 200,
  },
});

export default HinduCalendarScreen;
