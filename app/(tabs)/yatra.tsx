import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';

export default function YatraScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'pilgrimage', title: 'Pilgrimage Traditions' },
    { key: 'sacred', title: 'Sacred Sites' },
    { key: 'spiritual', title: 'Spiritual Journey' },
    { key: 'conclusion', title: 'Conclusion' },
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
        return 'Yatra represents the sacred journey of spiritual pilgrimage in Hinduism. These journeys connect devotees to divine energy centers and sacred sites, allowing them to experience spiritual transformation through physical travel and ritual observance. The concept of yatra encompasses both physical journeys to sacred sites and the inner spiritual journey of the soul.';
      case 'pilgrimage':
        return 'Pilgrimage traditions in Hinduism date back thousands of years and continue to be a vital part of spiritual practice for millions of devotees worldwide. The concept of yatra encompasses both physical journeys to sacred sites and the inner spiritual journey of the soul. These traditions have been preserved and passed down through generations, maintaining their spiritual significance.';
      case 'sacred':
        return 'Sacred sites serve as important centers for spiritual practice and cultural preservation. These destinations maintain ancient traditions and knowledge, offering devotees a direct connection to divine energy and spiritual wisdom. Each sacred site has its own unique spiritual energy and historical significance.';
      case 'spiritual':
        return 'The spiritual significance of pilgrimage extends beyond mere physical travel, representing the inner journey of the soul toward divine realization. Each step of the yatra is a step closer to spiritual enlightenment and self-realization. The journey transforms the pilgrim both externally and internally.';
      case 'conclusion':
        return 'Yatra remains a fundamental aspect of Hindu spiritual practice, offering devotees a path to spiritual growth and divine connection. Through these sacred journeys, individuals can experience the transformative power of spiritual pilgrimage and deepen their connection to the divine. The tradition continues to inspire millions of devotees worldwide.';
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
      setDropdownLabel('Topic');
    });
  };

  return (
    <View style={styles.root}>
      <HomeHeader 
        searchPlaceholder="Search for Yatra" 
        showDailyPujaButton={false}
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Yatra content..."
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
        contentContainerStyle={[styles.content, { paddingBottom: 150 }]} 
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>Yatra: The Sacred Journey of Spiritual Pilgrimage</Text>
          <HighlightedText 
            text="Yatra represents the sacred journey of spiritual pilgrimage in Hinduism. These journeys connect devotees to divine energy centers and sacred sites, allowing them to experience spiritual transformation through physical travel and ritual observance."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['pilgrimage'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Pilgrimage Traditions</Text>
          <HighlightedText 
            text="Pilgrimage traditions in Hinduism date back thousands of years and continue to be a vital part of spiritual practice for millions of devotees worldwide. The concept of yatra encompasses both physical journeys to sacred sites and the inner spiritual journey of the soul."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['sacred'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Sacred Sites</Text>
          <HighlightedText 
            text="Sacred sites serve as important centers for spiritual practice and cultural preservation. These destinations maintain ancient traditions and knowledge, offering devotees a direct connection to divine energy and spiritual wisdom."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Spiritual Journey</Text>
          <HighlightedText 
            text="The spiritual significance of pilgrimage extends beyond mere physical travel, representing the inner journey of the soul toward divine realization. Each step of the yatra is a step closer to spiritual enlightenment and self-realization."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Conclusion</Text>
          <HighlightedText 
            text="Yatra remains a fundamental aspect of Hindu spiritual practice, offering devotees a path to spiritual growth and divine connection. Through these sacred journeys, individuals can experience the transformative power of spiritual pilgrimage and deepen their connection to the divine."
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