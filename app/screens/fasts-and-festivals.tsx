import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HomeHeader from '@/components/Home/HomeHeader';
import HighlightedText from '@/components/Home/HighlightedText';

export const options = { headerShown: false };

export default function FastsAndFestivalsScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'majorFestivals', title: 'Major Hindu Festivals' },
    { key: 'sacredFasting', title: 'Sacred Fasting Days' },
    { key: 'seasonalRegional', title: 'Seasonal and Regional Festivals' },
    { key: 'spiritualSignificance', title: 'Spiritual Significance of Fasting' },
    { key: 'modernRelevance', title: 'Modern Relevance' },
    { key: 'references', title: 'References' },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('Topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      setShowSearchResults(false);
      return;
    }

    const results: Array<{section: string, text: string, index: number, sectionKey: string}> = [];
    const searchTerm = query.toLowerCase();

    // Search through all sections
    sections.forEach(section => {
      const sectionElement = sectionY.current[section.key];
      if (sectionElement !== undefined) {
        // Search through the actual text content for this section
        const sectionText = getSectionText(section.key);
        if (sectionText && sectionText.toLowerCase().includes(searchTerm)) {
          results.push({
            section: section.title,
            text: `Found "${query}" in ${section.title}`,
            index: results.length,
            sectionKey: section.key
          });
        }
      }
    });

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    setShowSearchResults(results.length > 0);
  };

  // Helper function to get text content for each section
  const getSectionText = (sectionKey: string): string => {
    switch (sectionKey) {
      case 'intro':
        return 'Hindu festivals and fasts are deeply rooted in the lunar calendar and astronomical calculations. These sacred observances mark important spiritual milestones, honor deities, and celebrate the eternal cycle of creation, preservation, and dissolution.';
      case 'majorFestivals':
        return 'Major Hindu festivals include Diwali, Holi, Navratri, and many others that celebrate different aspects of divine energy and spiritual significance. These festivals bring communities together in celebration and devotion.';
      case 'sacredFasting':
        return 'Sacred fasting days are observed to purify the body and mind, enhance spiritual awareness, and demonstrate devotion to specific deities. Fasting practices vary from complete abstinence to partial restrictions.';
      case 'seasonalRegional':
        return 'Seasonal and regional festivals reflect the diverse cultural traditions across India, celebrating harvests, seasonal changes, and local deities with unique customs and practices.';
      case 'spiritualSignificance':
        return 'The spiritual significance of fasting extends beyond physical discipline to include mental purification, increased concentration, and deeper connection with divine consciousness.';
      case 'modernRelevance':
        return 'Modern relevance of Hindu festivals and fasts continues to grow as people seek spiritual meaning, community connection, and cultural preservation in contemporary society.';
      default:
        return '';
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchHighlight(text);
    performSearch(text);
  };

  const handleNextResult = () => {
    if (currentResultIndex < searchResults.length - 1) {
      const newIndex = currentResultIndex + 1;
      setCurrentResultIndex(newIndex);
      navigateToSearchResult(newIndex);
    }
  };

  const handlePreviousResult = () => {
    if (currentResultIndex > 0) {
      const newIndex = currentResultIndex - 1;
      setCurrentResultIndex(newIndex);
      navigateToSearchResult(newIndex);
    }
  };

  const navigateToSearchResult = (resultIndex: number) => {
    if (resultIndex >= 0 && resultIndex < searchResults.length) {
      const result = searchResults[resultIndex];
      const sectionYPosition = sectionY.current[result.sectionKey];
      
      if (sectionYPosition !== undefined) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ 
            y: Math.max(0, sectionYPosition - 8), 
            animated: true 
          });
        });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentResultIndex(-1);
    setShowSearchResults(false);
    setSearchHighlight('');
  };

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel('Topic');
    });
  };

  const references = [
    "https://en.wikipedia.org/wiki/Hindu_festivals",
    "https://www.britannica.com/topic/Hindu-festivals",
    "https://www.hinduwebsite.com/hinduism/h_festivals.asp",
    "https://www.exoticindiaart.com/blog/hindu-festivals-and-celebrations/",
    "https://www.hinduismtoday.com/modules/smartsection/item.php?itemid=5076",
    "https://www.sanskritimagazine.com/hindu-festivals/",
    "https://www.hinduism.co.za/festival.htm",
    "https://www.hinduismfacts.org/hindu-festivals/",
    "https://www.hinduwebsite.com/hinduism/h_fasting.asp",
    "https://www.speakingtree.in/allslides/hindu-fasting-days",
    "https://www.hinduismtoday.com/modules/smartsection/item.php?itemid=5077",
    "https://www.hinduwebsite.com/hinduism/h_calendar.asp",
    "https://www.drikpanchang.com/festivals/festivals.html",
    "https://www.hinduism.co.za/calendar.htm",
    "https://www.hinduwebsite.com/hinduism/h_astrology.asp"
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search festivals, fasts, traditions..."
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Fasts and Festivals content..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              
              {/* Navigation controls inside search box */}
              {showSearchResults && searchResults.length > 0 && (
                <View style={styles.searchNavigationInline}>
                  <Text style={styles.resultsCount}>
                    {currentResultIndex + 1}/{searchResults.length}
                  </Text>
                  <TouchableOpacity 
                    onPress={handlePreviousResult}
                    disabled={currentResultIndex === 0}
                    style={[styles.navButtonInline, currentResultIndex === 0 && styles.navButtonDisabled]}
                  >
                    <Text style={[styles.navButtonTextInline, currentResultIndex === 0 && styles.navButtonTextDisabled]}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleNextResult}
                    disabled={currentResultIndex === searchResults.length - 1}
                    style={[styles.navButtonInline, currentResultIndex === searchResults.length - 1 && styles.navButtonDisabled]}
                  >
                    <Text style={[styles.navButtonTextInline, currentResultIndex === searchResults.length - 1 && styles.navButtonTextDisabled]}>›</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownOpen(true)}
              style={[styles.dropdownTrigger, { marginTop: 15 }]}
            >
              <Text style={styles.dropdownText}>{dropdownLabel}</Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>
            <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
              <View style={styles.dropdownOverlay}>
                <View style={styles.dropdownCard}>
                  {sections.map((s) => (
                    <TouchableOpacity key={s.key} style={styles.dropdownItem} onPress={() => handleSelect(s.key)}>
                      <Text style={styles.dropdownItemText}>{s.title}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: '#EEE' }]} onPress={() => setDropdownOpen(false)}>
                    <Text style={[styles.dropdownItemText, { color: '#999' }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        }
      />

              <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={[styles.content, { paddingBottom: 200 }]} 
          showsVerticalScrollIndicator={false}
        >
        {/* Intro */}
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>Fasts and Festivals: Sacred Traditions Based on Lunar Calendar</Text>
          <HighlightedText 
            text="Hindu festivals and fasts are deeply rooted in the lunar calendar and astronomical calculations. These sacred observances mark important spiritual milestones, honor deities, and celebrate the eternal cycle of creation, preservation, and dissolution. Each festival carries profound spiritual significance and connects devotees to divine consciousness."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        {/* Major Festivals */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['majorFestivals'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Major Hindu Festivals</Text>
          
          <Text style={styles.h3}>Diwali - Festival of Lights</Text>
          <HighlightedText 
            text="Celebrated on the new moon day of Kartik month, Diwali symbolizes the victory of light over darkness and knowledge over ignorance. It commemorates Lord Rama's return to Ayodhya and the triumph of good over evil. Homes are illuminated with diyas, rangolis are created, and families gather for prayers and celebrations."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Holi - Festival of Colors</Text>
          <HighlightedText 
            text="Observed on the full moon day of Phalgun month, Holi celebrates divine love between Radha and Krishna. It represents the victory of devotion over ego and the arrival of spring. People play with colors, sing devotional songs, and share sweets, symbolizing unity and joy."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Makar Sankranti - Sun's Journey</Text>
          <HighlightedText 
            text="Celebrated when the sun enters Capricorn (Makar), this festival marks the beginning of Uttarayan (northward journey of the sun). It symbolizes spiritual awakening and the triumph of light. Kite flying, sesame sweets, and holy dips in sacred rivers are traditional practices."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Raksha Bandhan - Bond of Protection</Text>
          <HighlightedText 
            text="Observed on the full moon day of Shravan month, this festival celebrates the sacred bond between brothers and sisters. Sisters tie rakhi (sacred thread) on brothers' wrists, symbolizing love, protection, and the eternal bond of family."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Janmashtami - Birth of Krishna</Text>
          <HighlightedText 
            text="Celebrated on the eighth day of the dark fortnight of Bhadrapada month, Janmashtami commemorates Lord Krishna's birth. Devotees observe fasts, sing bhajans, and perform special pujas to honor the divine incarnation who delivered the Bhagavad Gita."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        {/* Sacred Fasting */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['sacredFasting'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Sacred Fasting Days</Text>
          
          <Text style={styles.h3}>Ekadashi - Eleventh Day Fast</Text>
          <HighlightedText 
            text="Observed on the eleventh day of both lunar fortnights, Ekadashi is dedicated to Lord Vishnu. Fasting on this day purifies the body and mind, enhances spiritual awareness, and helps overcome negative tendencies. Different Ekadashis have unique significance and benefits."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Pradosha - Thirteenth Day Fast</Text>
          <HighlightedText 
            text="Observed on the thirteenth day of both lunar fortnights, Pradosha is dedicated to Lord Shiva."
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>Sankashti Chaturthi - Ganesha Fast</Text>
          <Text style={styles.p}>
            Observed on the fourth day of the waning moon, this fast is dedicated to Lord Ganesha. 
            It helps remove obstacles, brings success, and fulfills wishes. Devotees break their fast 
            after sighting the moon and offering prayers to Ganesha.
          </Text>

          <Text style={styles.h3}>Mondays - Shiva Fasting</Text>
          <Text style={styles.p}>
            Monday fasts are dedicated to Lord Shiva and Goddess Parvati. This practice helps control 
            emotions, brings mental peace, and strengthens marital harmony. Devotees consume only fruits, 
            milk, and light meals while focusing on spiritual practices.
          </Text>
        </View>

        {/* Seasonal and Regional */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['seasonalRegional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Seasonal and Regional Festivals</Text>
          
          <Text style={styles.h3}>Navratri - Nine Nights of Goddess</Text>
          <Text style={styles.p}>
            Celebrated twice a year (Chaitra and Ashwin months), Navratri honors the divine feminine 
            energy. For nine nights, devotees worship different forms of Goddess Durga, observe fasts, 
            and perform traditional dances like Garba and Dandiya. The festival culminates with 
            Dussehra, celebrating the victory of good over evil.
          </Text>

          <Text style={styles.h3}>Ganesh Chaturthi - Ganesha Festival</Text>
          <Text style={styles.p}>
            Celebrated on the fourth day of Bhadrapada month, this festival honors Lord Ganesha's birth. 
            Clay idols are installed in homes and public places, worshipped for ten days, and then 
            immersed in water bodies. It symbolizes the cycle of creation and dissolution.
          </Text>

          <Text style={styles.h3}>Karthigai Deepam - Festival of Lamps</Text>
          <Text style={styles.p}>
            Observed on the full moon day of Karthigai month, this festival involves lighting numerous 
            lamps to dispel darkness and ignorance. It commemorates the divine light that emerged from 
            the cosmic ocean and represents the eternal flame of knowledge and wisdom.
          </Text>
        </View>

        {/* Spiritual Significance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritualSignificance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Spiritual Significance of Fasting</Text>
          <Text style={styles.p}>
            Fasting in Hinduism is not merely abstaining from food but a comprehensive spiritual practice. 
            It helps control the senses, purify the mind, and develop willpower. Different types of fasts 
            (Nirjala, Phalahara, Ekabhukta) serve various spiritual purposes and help devotees progress 
            on their spiritual journey.
          </Text>
        </View>

        {/* Modern Relevance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['modernRelevance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Modern Relevance</Text>
          <Text style={styles.p}>
            In today's fast-paced world, Hindu festivals and fasts provide much-needed spiritual 
            grounding and cultural continuity. They remind us of our ancient wisdom, strengthen 
            community bonds, and offer opportunities for spiritual growth. These traditions continue 
            to inspire millions worldwide, preserving the rich cultural heritage of Hinduism.
          </Text>
        </View>

        {/* References */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>References</Text>
          {references.map((url, index) => (
            <Text key={index} style={[styles.p, styles.link]} onPress={() => Linking.openURL(url)}>
              [{index + 1}] {url}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { padding: 16, paddingBottom: 32 },
  cardTop: { borderRadius: 16, padding: 16, marginBottom: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  h1: { fontSize: 20, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: '600', color: '#FF9800', marginTop: 6, marginBottom: 4 },
  p: { fontSize: 14, color: '#555', lineHeight: 20 },
  link: { color: '#1a73e8', textDecorationLine: 'underline' },
  dropdownTrigger: {
    width: '88%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 6,
  },
  dropdownText: { 
    fontSize: 14,
    fontWeight: '500',
    color: '#333' 
  },
  dropdownChevron: { 
    color: '#666',
    fontSize: 20 
  },
  dropdownOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24 
  },
  dropdownCard: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingVertical: 0, 
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: { 
    fontSize: 14, 
    color: '#333' 
  },
  searchInputContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 0,
  },
  searchNavigationInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#fff',
    marginRight: 10,
  },
  navButtonInline: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navButtonTextInline: {
    fontSize: 18,
    color: '#fff',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#fff',
  },
}); 