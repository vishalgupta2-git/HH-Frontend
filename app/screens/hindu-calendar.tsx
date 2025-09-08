import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

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
      { name: 'Sharad Navratri', date: 'Sep 22', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 23', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 24', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 25', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 26', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 27', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 28', description: 'Maa Kali' },
      { name: 'Sharad Navratri', date: 'Sep 29', description: 'Durga Maa' },
      { name: 'Sharad Navratri', date: 'Sep 30', description: 'Durga Maa' },
      { name: 'Vijayadashami (Dussehra)', date: 'Oct 2', description: 'Shri Ram' },
      { name: 'Karva Chauth', date: 'Oct 10', description: '' },
      { name: 'Ahoi Ashtami', date: 'Oct 13', description: '' },
      { name: 'Dhanteras (Diwali Day 1)', date: 'Oct 18', description: 'Lakshmi Maa' },
      { name: 'Naraka Chaturdashi (Chhoti Diwali)', date: 'Oct 19', description: 'Shri Krishna' },
      { name: 'Diwali', date: 'Oct 20', description: 'Lakshmi Maa' },
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
      { name: 'Ahoi Ashtami', date: 'Oct 13', description: '' },
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
      { name: 'Makar Sankranti', date: 'Jan 14', description: 'Surya Dev' },
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
      { name: 'Holika Dahan', date: 'Mar 3', description: 'Shri Krishna' },
      { name: 'Holi (Rangotsav)', date: 'Mar 4', description: 'Shri Krishna' }
    ]
  }
];

const HinduCalendarScreen: React.FC = () => {
  const router = useRouter();
  const { isHindi } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<HinduMonth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'summary'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFestival, setSelectedFestival] = useState<{ name: string; date: string; description?: string; image?: any } | null>(null);

  const translations = {
    updatedUpTo: { en: 'Updated up to March 2026', hi: 'मार्च 2026 तक अपडेट किया गया' },
    festivalsThisMonth: { en: 'Festivals this Month:', hi: 'इस महीने के त्योहार:' },
    calendar: { en: 'Calendar', hi: 'कैलेंडर' },
    summary: { en: 'Summary', hi: 'सारांश' },
    hinduCalendar: { en: 'Hindu Calendar 2025-2026', hi: 'हिंदू कैलेंडर 2025-2026' },
    keyFestivals: { en: 'Key Festivals / Vrats:', hi: 'मुख्य त्योहार / व्रत:' },
    noMajorFestivals: { en: '(No major pan-Indian festivals listed in this period)', hi: '(इस अवधि में कोई प्रमुख पैन-भारतीय त्योहार सूचीबद्ध नहीं)' },
    tellMeMore: { en: 'Tell me more', hi: 'और बताएं' }
  };

  // Function to get festival image based on festival name
  const getFestivalImage = (festivalName: string): any => {
    const lowerName = festivalName.toLowerCase();
    
    if (lowerName.includes('ganesh chaturthi')) {
      return require('@/assets/images/fastsAndFestivals/GaneshChaturthi1.jpg');
    } else if (lowerName.includes('raksha bandhan')) {
      return require('@/assets/images/fastsAndFestivals/RakshaBandhan1.jpg');
    } else if (lowerName.includes('krishna janmashtami') || lowerName.includes('janmashtami')) {
      return require('@/assets/images/fastsAndFestivals/Janmashtami1.jpg');
    } else if (lowerName.includes('navratri')) {
      return require('@/assets/images/fastsAndFestivals/Navratri1.jpg');
    } else if (lowerName.includes('diwali')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('dusshera') || lowerName.includes('dussehra') || lowerName.includes('vijayadashami')) {
      return require('@/assets/images/fastsAndFestivals/Dusshera1.jpg');
    } else if (lowerName.includes('karva chauth') || lowerName.includes('karwachauth')) {
      return require('@/assets/images/fastsAndFestivals/KarvaChauth1.jpg');
    } else if (lowerName.includes('makar sankranti')) {
      return require('@/assets/images/fastsAndFestivals/MakarSakranti1.jpg');
    } else if (lowerName.includes('govardhan puja')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('bhai dooj')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('dhanteras')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    } else if (lowerName.includes('naraka chaturdashi') || lowerName.includes('chhoti diwali')) {
      return require('@/assets/images/fastsAndFestivals/Diwali6.jpg');
    }
    
    return null;
  };

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
      { name: 'Raksha Bandhan', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
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
     
     // Special handling for March 2026 festivals to ensure they appear
     if (!markedDates['2026-03-03']) {
       markedDates['2026-03-03'] = {
         marked: true,
         dotColor: '#FF6A00',
         text: 'Holika Dahan',
         description: 'Shri Krishna',
         selected: true,
         selectedColor: '#FFE5CC',
         textColor: '#FF6A00',
         fontWeight: 'bold'
       };
     }
     
     if (!markedDates['2026-03-04']) {
       markedDates['2026-03-04'] = {
         marked: true,
         dotColor: '#FF6A00',
         text: 'Holi (Rangotsav)',
         description: 'Shri Krishna',
         selected: true,
         selectedColor: '#FFE5CC',
         textColor: '#FF6A00',
         fontWeight: 'bold'
       };
     }
    
    return markedDates;
  };

  const openMonthDetails = (month: HinduMonth) => {
    setSelectedMonth(month);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMonth(null);
    setSelectedFestival(null);
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
    
    // Special cases for February and March 2026
    if (month === 'February' && year === 2026) {
      return `${month} ${year} (Magha - Phalguna)`;
    }
    
    if (month === 'March' && year === 2026) {
      return `${month} ${year} (Phalguna)`;
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
     if (newDate >= new Date(2025, 7, 1) && newDate <= new Date(2026, 2, 31)) {
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
        { name: 'Raksha Bandhan', date: 'Aug 9', description: '— (traditionally tied to Krishna)' }
      ];
      monthFestivals.push(...shravanaFestivals);
    }
    
    // Special handling for February and March 2026
    if (date.getFullYear() === 2026 && date.getMonth() === 1) { // February 2026
      // February should show festivals from both Magha (Jan 4 - Feb 1) and Phalguna (Feb 2 - Mar 3)
      const februaryFestivals: Festival[] = [
        { name: 'Maha Shivaratri', date: 'Feb 15', description: 'Mahadev Shiv Ji' }
      ];
      monthFestivals.push(...februaryFestivals);
    }
    
         if (date.getFullYear() === 2026 && date.getMonth() === 2) { // March 2026
       // March should show festivals from Phalguna (Feb 2 - Mar 3)
       const marchFestivals: Festival[] = [
         { name: 'Holika Dahan', date: 'Mar 3', description: 'Shri Krishna' },
         { name: 'Holi (Rangotsav)', date: 'Mar 4', description: 'Shri Krishna' }
       ];
       monthFestivals.push(...marchFestivals);
       return monthFestivals; // Return early to avoid duplicate festivals
     }
    
    // Only add festivals that fall within the current English month for other months
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
            <ScrollView 
          style={styles.calendarTab} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
             {/* Update notice */}
       <Text style={styles.updateNotice}>{isHindi ? translations.updatedUpTo.hi : translations.updatedUpTo.en}</Text>
       
       {/* Month Title */}
       <Text style={styles.monthTitle}>{getHinduMonthTitle(currentDate)}</Text>
      
      {/* Calendar with Built-in Swipe Support */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentDate.toISOString().split('T')[0]}
          onMonthChange={onMonthChange}
          markedDates={getMarkedDates()}
                     minDate={'2025-08-01'}
           maxDate={'2026-03-31'}
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
              const festivalImage = getFestivalImage(markedDate.text);
              setSelectedFestival({
                name: markedDate.text,
                date: markedDate.text,
                description: markedDate.description,
                image: festivalImage
              });
              setModalVisible(true);
            }
          }}
        />
      </View>

      {/* Month Festivals List */}
      {monthFestivals.length > 0 && (
        <View style={styles.monthFestivalsList}>
          <Text style={styles.monthFestivalsTitle}>{isHindi ? translations.festivalsThisMonth.hi : translations.festivalsThisMonth.en}</Text>
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
         <ScrollView 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
       {/* Update notice */}
       <Text style={styles.updateNotice}>{isHindi ? translations.updatedUpTo.hi : translations.updatedUpTo.en}</Text>
       
       {/* Hindu Months Overview */}
       <Text style={styles.sectionTitle}>{isHindi ? translations.hinduCalendar.hi : translations.hinduCalendar.en}</Text>
      
      {hinduMonths.map((month, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.monthCard, { borderLeftColor: month.color.replace('#', '#80') }]}
          onPress={() => openMonthDetails(month)}
        >
          <View style={styles.monthHeader}>
            <Text style={styles.monthName}>{month.name}</Text>
            <Text style={styles.gregorianSpan}>({month.gregorianSpan})</Text>
          </View>
          
          {month.festivals.length > 0 ? (
            <View style={styles.festivalsContainer}>
              <Text style={styles.festivalsTitle}>{isHindi ? translations.keyFestivals.hi : translations.keyFestivals.en}</Text>
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
              {isHindi ? translations.calendar.hi : translations.calendar.en}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
              {isHindi ? translations.summary.hi : translations.summary.en}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'calendar' ? renderCalendarTab() : renderSummaryTab()}
      </View>

      {/* Festival Details Modal */}
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
              {selectedFestival && (
                <View style={styles.modalBody}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedFestival.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedFestival.date}</Text>
                  </View>
                  
                  {/* Festival Image */}
                  {selectedFestival.image && (
                    <View style={styles.festivalImageContainer}>
                      <Image 
                        source={selectedFestival.image} 
                        style={styles.festivalImage} 
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  
                                       {/* Festival Description */}
                     {selectedFestival.description && (
                       <View style={styles.modalFestivalItem}>
                         <Text style={styles.modalFestivalDescription}>
                           {selectedFestival.description}
                         </Text>
                       </View>
                     )}
                     
                     {/* Tell me more button for Diwali and related festivals */}
                     {(selectedFestival.name.toLowerCase().includes('diwali') || 
                       selectedFestival.name.toLowerCase().includes('govardhan puja') || 
                       selectedFestival.name.toLowerCase().includes('bhai dooj') ||
                       selectedFestival.name.toLowerCase().includes('dhanteras') ||
                       selectedFestival.name.toLowerCase().includes('naraka chaturdashi') ||
                       selectedFestival.name.toLowerCase().includes('chhoti diwali')) && (
                       <TouchableOpacity style={styles.tellMeMoreButton} onPress={() => {
                         closeModal();
                         router.push('/screens/diwali');
                       }}>
                         <Text style={styles.tellMeMoreButtonText}>Tell me more</Text>
                       </TouchableOpacity>
                     )}
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
    color: '#FF6A00',
    marginBottom: 5,
  },
  gregorianSpan: {
    fontSize: getResponsiveFontSize(14),
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
  festivalImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  festivalImage: {
    height: 150,
    width: 200,
    borderRadius: 12,
  },
  bottomSpacing: {
    height: 200,
  },
  tellMeMoreButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tellMeMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HinduCalendarScreen;
