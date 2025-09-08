import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import { useLanguage } from '@/contexts/LanguageContext';

export default function YatraScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const translations = {
    searchPlaceholder: { en: 'Search for Yatra', hi: 'यात्रा की खोज करें' },
    searchContentPlaceholder: { en: 'Search through Yatra content...', hi: 'यात्रा सामग्री में खोजें...' },
    topic: { en: 'Topic', hi: 'विषय' },
    cancel: { en: 'Cancel', hi: 'रद्द करें' },
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      pilgrimage: { en: 'Pilgrimage Traditions', hi: 'तीर्थयात्रा परंपराएं' },
      sacred: { en: 'Sacred Sites', hi: 'पवित्र स्थल' },
      spiritual: { en: 'Spiritual Journey', hi: 'आध्यात्मिक यात्रा' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' }
    },
    content: {
      title: { en: 'Yatra: The Sacred Journey of Spiritual Pilgrimage', hi: 'यात्रा: आध्यात्मिक तीर्थयात्रा की पवित्र यात्रा' },
      intro: { en: 'Yatra represents the sacred journey of spiritual pilgrimage in Hinduism. These journeys connect devotees to divine energy centers and sacred sites, allowing them to experience spiritual transformation through physical travel and ritual observance.', hi: 'यात्रा हिंदू धर्म में आध्यात्मिक तीर्थयात्रा की पवित्र यात्रा का प्रतिनिधित्व करती है। ये यात्राएं भक्तों को दिव्य ऊर्जा केंद्रों और पवित्र स्थलों से जोड़ती हैं, जिससे वे शारीरिक यात्रा और अनुष्ठानिक पालन के माध्यम से आध्यात्मिक परिवर्तन का अनुभव कर सकते हैं।' },
      pilgrimage: { en: 'Pilgrimage traditions in Hinduism date back thousands of years and continue to be a vital part of spiritual practice for millions of devotees worldwide. The concept of yatra encompasses both physical journeys to sacred sites and the inner spiritual journey of the soul.', hi: 'हिंदू धर्म में तीर्थयात्रा परंपराएं हजारों वर्ष पुरानी हैं और दुनिया भर के लाखों भक्तों के लिए आध्यात्मिक अभ्यास का एक महत्वपूर्ण हिस्सा बनी हुई हैं। यात्रा की अवधारणा में पवित्र स्थलों की शारीरिक यात्राएं और आत्मा की आंतरिक आध्यात्मिक यात्रा दोनों शामिल हैं।' },
      sacred: { en: 'Sacred sites serve as important centers for spiritual practice and cultural preservation. These destinations maintain ancient traditions and knowledge, offering devotees a direct connection to divine energy and spiritual wisdom.', hi: 'पवित्र स्थल आध्यात्मिक अभ्यास और सांस्कृतिक संरक्षण के महत्वपूर्ण केंद्र के रूप में कार्य करते हैं। ये गंतव्य प्राचीन परंपराओं और ज्ञान को बनाए रखते हैं, भक्तों को दिव्य ऊर्जा और आध्यात्मिक ज्ञान से सीधा संबंध प्रदान करते हैं।' },
      spiritual: { en: 'The spiritual significance of pilgrimage extends beyond mere physical travel, representing the inner journey of the soul toward divine realization. Each step of the yatra is a step closer to spiritual enlightenment and self-realization.', hi: 'तीर्थयात्रा का आध्यात्मिक महत्व केवल शारीरिक यात्रा से आगे बढ़कर, दिव्य साक्षात्कार की ओर आत्मा की आंतरिक यात्रा का प्रतिनिधित्व करता है। यात्रा का हर कदम आध्यात्मिक ज्ञानोदय और आत्म-साक्षात्कार के करीब एक कदम है।' },
      conclusion: { en: 'Yatra remains a fundamental aspect of Hindu spiritual practice, offering devotees a path to spiritual growth and divine connection. Through these sacred journeys, individuals can experience the transformative power of spiritual pilgrimage and deepen their connection to the divine.', hi: 'यात्रा हिंदू आध्यात्मिक अभ्यास का एक मौलिक पहलू बनी हुई है, जो भक्तों को आध्यात्मिक विकास और दिव्य संबंध का मार्ग प्रदान करती है। इन पवित्र यात्राओं के माध्यम से, व्यक्ति आध्यात्मिक तीर्थयात्रा की परिवर्तनकारी शक्ति का अनुभव कर सकते हैं और दिव्य के साथ अपने संबंध को गहरा कर सकते हैं।' }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'pilgrimage', title: isHindi ? translations.sections.pilgrimage.hi : translations.sections.pilgrimage.en },
    { key: 'sacred', title: isHindi ? translations.sections.sacred.hi : translations.sections.sacred.en },
    { key: 'spiritual', title: isHindi ? translations.sections.spiritual.hi : translations.sections.spiritual.en },
    { key: 'conclusion', title: isHindi ? translations.sections.conclusion.hi : translations.sections.conclusion.en },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(isHindi ? translations.topic.hi : translations.topic.en);
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
        return isHindi ? translations.content.intro.hi : translations.content.intro.en;
      case 'pilgrimage':
        return isHindi ? translations.content.pilgrimage.hi : translations.content.pilgrimage.en;
      case 'sacred':
        return isHindi ? translations.content.sacred.hi : translations.content.sacred.en;
      case 'spiritual':
        return isHindi ? translations.content.spiritual.hi : translations.content.spiritual.en;
      case 'conclusion':
        return isHindi ? translations.content.conclusion.hi : translations.content.conclusion.en;
      default:
        return '';
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchHighlight(text); // Set the highlight text
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
    setSearchHighlight(''); // Clear the highlight
  };

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel(isHindi ? translations.topic.hi : translations.topic.en);
    });
  };

  return (
    <View style={styles.root}>
      <HomeHeader 
        searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en} 
        showDailyPujaButton={false}
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        showLanguageToggle={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={isHindi ? translations.searchContentPlaceholder.hi : translations.searchContentPlaceholder.en}
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
                    <Text style={[styles.dropdownItemText, { color: '#999' }]}>{isHindi ? translations.cancel.hi : translations.cancel.en}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        }
      />
      <ScrollView 
        ref={scrollRef} 
        contentContainerStyle={[styles.content, { paddingBottom: 150 }]} 
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>{isHindi ? translations.content.title.hi : translations.content.title.en}</Text>
          <HighlightedText 
            text={isHindi ? translations.content.intro.hi : translations.content.intro.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['pilgrimage'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{isHindi ? translations.sections.pilgrimage.hi : translations.sections.pilgrimage.en}</Text>
          <HighlightedText 
            text={isHindi ? translations.content.pilgrimage.hi : translations.content.pilgrimage.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['sacred'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{isHindi ? translations.sections.sacred.hi : translations.sections.sacred.en}</Text>
          <HighlightedText 
            text={isHindi ? translations.content.sacred.hi : translations.content.sacred.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{isHindi ? translations.sections.spiritual.hi : translations.sections.spiritual.en}</Text>
          <HighlightedText 
            text={isHindi ? translations.content.spiritual.hi : translations.content.spiritual.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{isHindi ? translations.sections.conclusion.hi : translations.sections.conclusion.en}</Text>
          <HighlightedText 
            text={isHindi ? translations.content.conclusion.hi : translations.content.conclusion.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  cardTop: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
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
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  p: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  searchInputContainer: {
    width: '88%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchNavigationInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginRight: 4,
  },
  navButtonInline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#CCC',
  },
  navButtonTextInline: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  dropdownTrigger: {
    width: '88%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownChevron: {
    color: '#fff',
    fontSize: 18,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    color: '#333',
  },
}); 