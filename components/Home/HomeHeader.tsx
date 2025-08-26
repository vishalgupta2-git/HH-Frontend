import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import SearchSuggestions from './SearchSuggestions';
import { useSpiritualSearch } from '@/hooks/useSpiritualSearch';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
const TOP_PADDING = (Platform.OS === 'android' ? statusBarHeight : 0) + 24;

// Topic dropdown options
const TOPIC_OPTIONS = [
  { key: 'puja', title: 'Puja & Rituals' },
  { key: 'temple', title: 'Temples & Pilgrimage' },
  { key: 'vedas', title: 'Vedas & Scriptures' },
  { key: 'gods', title: 'Gods & Goddesses' },
  { key: 'festivals', title: 'Festivals & Fasts' },
  { key: 'astrology', title: 'Astrology & Vastu' },
  { key: 'meditation', title: 'Meditation & Yoga' },
  { key: 'mudras', title: 'Mudras & Mantras' },
  { key: 'philosophy', title: 'Philosophy & Ethics' },
  { key: 'history', title: 'History & Culture' }
];

export default function HomeHeader({ 
  searchPlaceholder, 
  extraContent, 
  showDailyPujaButton = true, 
  onSearchChange, 
  showSearchBar = true,
  enableSpiritualSearch = false,
  showTopicDropdown = true
}: { 
  searchPlaceholder?: string, 
  extraContent?: ReactNode, 
  showDailyPujaButton?: boolean, 
  onSearchChange?: (query: string) => void, 
  showSearchBar?: boolean,
  enableSpiritualSearch?: boolean,
  showTopicDropdown?: boolean
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [mudraCount, setMudraCount] = useState(0);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const router = useRouter();
  
  // Use spiritual search hook if enabled
  const spiritualSearch = useSpiritualSearch();

  // Load user data when component mounts
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (data) {
          const user = JSON.parse(data);
          setUserName(user.name || user.firstName || '');
          setMudraCount(user.mudras || 0);
        } else {
          setUserName('');
          setMudraCount(0);
        }
      } catch (error) {
        console.error('🔍 HomeHeader: Error loading user data:', error);
        setUserName('');
      }
    };
    
    loadUserData();
  }, []);

  // Reload user data when modal becomes visible
  React.useEffect(() => {
    if (modalVisible) {
      const loadUserData = async () => {
        try {
          const data = await AsyncStorage.getItem('user');
          if (data) {
            const user = JSON.parse(data);
            setUserName(user.name || user.firstName || '');
            setMudraCount(user.mudras || 0);
          } else {
            setUserName('');
            setMudraCount(0);
          }
        } catch (error) {
          console.error('🔍 HomeHeader: Error loading user data for modal:', error);
          setUserName('');
        }
      };
      
      loadUserData();
    }
  }, [modalVisible]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUserName('');
    setModalVisible(false);
  };

  const handleSearch = (query: string) => {
    // Update local search input state
    setSearchInputValue(query);
    
    // Show suggestions when typing, hide when query is empty
    setShowSuggestions(query.length > 0);
    
    if (enableSpiritualSearch) {
      spiritualSearch.handleSearch(query);
    }
    
    // Call the parent's onSearchChange callback
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handleSearchClear = () => {
    setShowSuggestions(false);
    setSearchInputValue('');
    
    if (enableSpiritualSearch) {
      spiritualSearch.clearSearch();
    }
    
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleResultSelect = (result: any, matchIndex: number) => {
    if (enableSpiritualSearch) {
      spiritualSearch.navigateToResult(result, matchIndex);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setShowSuggestions(false);
    
    if (enableSpiritualSearch) {
      spiritualSearch.handleSearch(suggestion);
    }
    onSearchChange?.(suggestion);
  };

  const handleTopicSelect = (topic: { key: string, title: string }) => {
    setTopicDropdownOpen(false);
    setSelectedTopic(topic.title);
    
    // Navigate to the appropriate screen based on topic
    switch (topic.key) {
      case 'puja':
        router.push('/screens/special-puja');
        break;
      case 'temple':
        router.push('/screens/famous-temples');
        break;
      case 'vedas':
        router.push('/screens/vedas');
        break;
      case 'gods':
        router.push('/screens/gods-and-godesses');
        break;
      case 'festivals':
        router.push('/screens/fasts-and-festivals');
        break;
      case 'astrology':
        router.push('/screens/astrology');
        break;
      case 'meditation':
        router.push('/screens/vedas'); // Using vedas as meditation content
        break;
      case 'mudras':
        router.push('/auth/mudras');
        break;
      case 'philosophy':
        router.push('/screens/vedas'); // Using vedas for philosophy content
        break;
      case 'history':
        router.push('/screens/holy-books'); // Using holy-books for history content
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      {/* Top Row: Hamburger, Title, Language */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.centeredTitle}>The Hindu Heritage</Text>
        <View style={styles.mudraDisplay}>
          <Text style={styles.aumSymbol}>ॐ</Text>
          <Text style={styles.mudraCount}>{mudraCount}</Text>
        </View>
      </View>
      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchSection}>
          {enableSpiritualSearch ? (
            <SearchBar
              placeholder={searchPlaceholder || "Search spiritual content..."}
              onSearch={handleSearch}
              onClear={handleSearchClear}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onResultSelect={handleResultSelect}
              searchResults={spiritualSearch.searchResults}
              currentResultIndex={spiritualSearch.currentResultIndex}
              totalResults={spiritualSearch.totalResults}
              onPrevious={spiritualSearch.handlePrevious}
              onNext={spiritualSearch.handleNext}
              showNavigation={spiritualSearch.hasResults}
              isSearching={spiritualSearch.isSearching}
            />
          ) : (
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder || "Search for 'puja '"}
                placeholderTextColor="#fff"
                value={searchInputValue}
                onChangeText={handleSearch}
              />
              <TouchableOpacity style={styles.micButton}>
                <Feather name="mic" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Daily Puja Button - Separated from search section */}
      {showDailyPujaButton && (
        <View style={styles.dailyPujaButtonContainer}>
          <TouchableOpacity style={styles.dailyPujaButton} onPress={() => router.push('/screens/DailyPujaCustomTemple')}>
            <Text style={styles.dailyPujaButtonText}>Start Your Daily Puja</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Search Suggestions Display */}
      {enableSpiritualSearch && (
        <SearchSuggestions
          query={spiritualSearch.searchQuery}
          onSuggestionSelect={handleSuggestionSelect}
          visible={showSuggestions && !spiritualSearch.hasResults}
        />
      )}
      
      {/* Search Results Display */}
      {enableSpiritualSearch && (
        <>
          <SearchResults
            results={spiritualSearch.searchResults}
            currentResultIndex={spiritualSearch.currentResultIndex}
            totalResults={spiritualSearch.totalResults}
            onResultSelect={handleResultSelect}
            onPrevious={spiritualSearch.handlePrevious}
            onNext={spiritualSearch.handleNext}
            visible={spiritualSearch.hasResults}
          />
        </>
      )}
      
      {/* Topic Dropdown */}
      {enableSpiritualSearch && showTopicDropdown && (
        <View style={styles.topicDropdownContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTopicDropdownOpen(true)}
            style={styles.topicDropdownTrigger}
          >
            <Text style={styles.topicDropdownText}>
              {selectedTopic || 'Choose a Topic'}
            </Text>
            <Text style={styles.topicDropdownChevron}>▾</Text>
          </TouchableOpacity>
          
          <Modal 
            visible={topicDropdownOpen} 
            transparent 
            animationType="fade" 
            onRequestClose={() => setTopicDropdownOpen(false)}
          >
            <View style={styles.topicDropdownOverlay}>
              <View style={styles.topicDropdownCard}>
                {TOPIC_OPTIONS.map((topic) => (
                  <TouchableOpacity 
                    key={topic.key} 
                    style={styles.topicDropdownItem} 
                    onPress={() => handleTopicSelect(topic)}
                  >
                    <Text style={styles.topicDropdownItemText}>{topic.title}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={[styles.topicDropdownItem, { borderTopWidth: 1, borderTopColor: '#EEE' }]} 
                  onPress={() => setTopicDropdownOpen(false)}
                >
                  <Text style={[styles.topicDropdownItemText, { color: '#999' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
      
      {/* Extra content below search bar */}
      {extraContent && <View style={{ width: '100%', alignItems: 'center' }}>{extraContent}</View>}
      {/* Modal for options */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {userName ? (
              <>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF6A00', marginBottom: 12 }}>{userName}</Text>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/auth/profile'); }}>
                  <Text style={styles.modalText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/auth/mudras'); }}>
                  <Text style={styles.modalText}>Mudras</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={handleLogout}>
                  <Text style={styles.modalText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/auth/login'); }}>
                  <Text style={styles.modalText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/auth/signup'); }}>
                  <Text style={styles.modalText}>Sign-Up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 275,
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? -statusBarHeight : 0,
    paddingTop: TOP_PADDING,
    zIndex: 10, // Higher z-index to appear in front of scrolling content
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 275,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    minHeight: 48,
    zIndex: 11, // Higher z-index than headerContainer
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  mudraDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aumSymbol: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  mudraCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  searchSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    zIndex: 11, // Higher z-index to appear in front
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    width: '88%',
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  micButton: {
    marginLeft: 8,
    padding: 4,
  },
  dailyPujaButton: {
    width: '92%',
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
  dailyPujaButtonContainer: {
    width: '88%',
    marginTop: 14,
    alignItems: 'center',
    zIndex: 11, // Higher z-index to appear in front
  },
  dailyPujaButtonText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    marginTop: 60,
    marginLeft: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalText: {
    fontSize: 18,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  topicDropdownContainer: {
    width: '88%',
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topicDropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  topicDropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  topicDropdownChevron: {
    fontSize: 20,
    color: '#999',
  },
  topicDropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topicDropdownCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  topicDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  topicDropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
}); 