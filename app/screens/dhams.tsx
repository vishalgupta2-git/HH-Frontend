import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Linking, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = { headerShown: false };

export default function DhamsScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'charDham', title: 'Char Dham: The Four Sacred Abodes' },
    { key: 'chotaCharDham', title: 'Chota Char Dham: Sacred Sites in Uttarakhand' },
    { key: 'amarnath', title: 'Amarnath Yatra: Sacred Cave Pilgrimage' },
    { key: 'vaishnoDevi', title: 'Vaishno Devi: Divine Mother Pilgrimage' },
    { key: 'kailash', title: 'Kailash Mansarovar: Sacred Mountain and Lake' },
    { key: 'varanasi', title: 'Varanasi: City of Spiritual Enlightenment' },
    { key: 'haridwar', title: 'Haridwar: Gateway to the Gods' },
    { key: 'rishikesh', title: 'Rishikesh: Yoga Capital of the World' },
    { key: 'significance', title: 'Spiritual Significance of Pilgrimage' },
    { key: 'cultural', title: 'Cultural and Religious Importance' },
    { key: 'historical', title: 'Historical Background of Sacred Sites' },
    { key: 'conclusion', title: 'Conclusion' },
    { key: 'references', title: 'References' },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('Topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Check for search context when component mounts
  useEffect(() => {
    const checkSearchContext = async () => {
      try {
        const searchContext = await AsyncStorage.getItem('spiritualSearchContext');
        if (searchContext) {
          const context = JSON.parse(searchContext);
          if (context.pageId === 'dhams' && context.query) {
            setSearchHighlight(context.query);
            // Clear the context after using it
            await AsyncStorage.removeItem('spiritualSearchContext');
          }
        }
      } catch (error) {
        console.error('Error checking search context:', error);
      }
    };

    checkSearchContext();
  }, []);

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
        return 'The concept of Dhams (sacred abodes) and Yatras (pilgrimages) represents one of the most profound aspects of Hindu spiritual practice. These sacred journeys connect devotees to divine energy centers, allowing them to experience spiritual transformation through physical travel and ritual observance. The tradition of pilgrimage in Hinduism dates back thousands of years and continues to be a vital part of spiritual practice for millions of devotees worldwide.';
      case 'charDham':
        return 'The Char Dham (Four Sacred Abodes) represents the four most important pilgrimage sites in Hinduism. These sacred destinations are located in the four cardinal directions of India and are considered essential for achieving moksha (liberation). The four sites are: Badrinath in the North (Uttarakhand), Dwarka in the West (Gujarat), Rameshwaram in the South (Tamil Nadu), and Puri in the East (Odisha). Each of these sacred sites is associated with different aspects of the divine and offers unique spiritual experiences.';
      case 'chotaCharDham':
        return 'The Chota Char Dham (Small Four Sacred Abodes) consists of four sacred sites located in the Garhwal region of Uttarakhand. These sites are: Yamunotri (source of Yamuna River), Gangotri (source of Ganga River), Kedarnath (abode of Lord Shiva), and Badrinath (abode of Lord Vishnu). This circuit is particularly popular among devotees seeking spiritual purification and connection with the divine through nature.';
      case 'amarnath':
        return 'The Amarnath Yatra is one of the most challenging and spiritually significant pilgrimages in Hinduism. Located in the Kashmir Valley, this sacred cave houses a naturally formed ice lingam that represents Lord Shiva. The journey to Amarnath involves trekking through difficult terrain at high altitudes, symbolizing the spiritual discipline required for divine realization.';
      case 'vaishnoDevi':
        return 'Vaishno Devi is one of the most visited pilgrimage sites in India, dedicated to the Divine Mother in her form as Vaishno Devi. Located in the Trikuta Mountains of Jammu and Kashmir, this sacred cave temple attracts millions of devotees annually. The pilgrimage involves a challenging trek that symbolizes the spiritual journey toward divine grace and protection.';
      case 'kailash':
        return 'Mount Kailash and Lake Mansarovar represent the ultimate pilgrimage destination for many Hindu devotees. Located in Tibet, this sacred mountain is believed to be the abode of Lord Shiva and represents the pinnacle of spiritual achievement. The journey to Kailash Mansarovar is considered one of the most spiritually transformative experiences in Hinduism.';
      case 'varanasi':
        return 'Varanasi, also known as Kashi, is one of the oldest continuously inhabited cities in the world and represents the spiritual heart of Hinduism. This sacred city is located on the banks of the Ganga River and is considered the ultimate destination for spiritual seekers. Varanasi is famous for its ghats, temples, and the spiritual atmosphere that permeates every aspect of life in the city.';
      case 'haridwar':
        return 'Haridwar, meaning "Gateway to the Gods," is one of the seven holiest cities in Hinduism. Located where the Ganga River enters the plains from the mountains, this sacred city is famous for its ghats, temples, and the Kumbh Mela festival. Haridwar serves as a major center for spiritual learning and practice.';
      case 'rishikesh':
        return 'Rishikesh, known as the "Yoga Capital of the World," is a sacred city located in the foothills of the Himalayas. This spiritual center is famous for its ashrams, yoga schools, and the peaceful atmosphere that attracts spiritual seekers from around the world. Rishikesh represents the perfect environment for spiritual practice and self-realization.';
      case 'significance':
        return 'The spiritual significance of pilgrimage in Hinduism extends beyond mere physical travel. These sacred journeys represent the inner journey of the soul toward divine realization. Through pilgrimage, devotees develop qualities such as patience, discipline, humility, and devotion, which are essential for spiritual progress.';
      case 'cultural':
        return 'Pilgrimage sites serve as important centers for cultural preservation and transmission. These sacred destinations maintain ancient traditions, rituals, and knowledge that might otherwise be lost. The cultural significance of pilgrimage extends beyond religious boundaries and contributes to the preservation of India\'s rich cultural heritage.';
      case 'historical':
        return 'The historical background of sacred sites reveals the deep roots of Hindu spiritual practice. Many of these sites have been centers of spiritual activity for thousands of years, serving as meeting points for sages, scholars, and devotees. The historical significance of these sites adds to their spiritual value and authenticity.';
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

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Char_Dham' },
    { id: 2, url: 'https://www.badrinath-kedarnath.gov.in/' },
    { id: 3, url: 'https://www.shrijagannathtemplepuri.com/' },
    { id: 4, url: 'https://www.rameshwaramtemple.tn.gov.in/' },
    { id: 5, url: 'https://www.amarnath.org/' },
    { id: 6, url: 'https://www.maavaishnodevi.org/' },
    { id: 7, url: 'https://kailashmansarovar.org/' },
    { id: 8, url: 'https://varanasi.nic.in/' },
    { id: 9, url: 'https://haridwar.nic.in/' },
    { id: 10, url: 'https://rishikesh.nic.in/' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search for Dhams"
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Dhams content..."
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

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>Dhams and Yatras: Sacred Pilgrimage Sites of Hinduism</Text>
          <HighlightedText 
            text="Sacred pilgrimage sites and spiritual journeys hold immense significance in Hinduism, serving as powerful conduits for spiritual transformation and divine connection. These holy destinations, known as Dhams, represent the physical manifestations of divine energy and provide devotees with opportunities to experience profound spiritual awakening."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['foundation'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Divine Foundation</Text>
          <Text style={styles.p}>
            Hindu tradition recognizes several types of sacred sites called "Dhams" (meaning "abodes"), which serve as divine dwelling places and pilgrimage destinations central to spiritual practice. These holy sites represent the physical manifestations of divine energy across the Indian subcontinent and form the backbone of Hindu pilgrimage culture. The yatra (Sanskrit for "journey") tradition connects these sacred spaces through transformative spiritual journeys.
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['charDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Char Dham: Four Sacred Abodes and Their Yatras</Text>

          <Text style={styles.h3}>Bada Char Dham - The Primary Four Dhams</Text>
          <Text style={styles.p}>
            The Char Dham or Chatur Dhama is a set of four primary Hindu pilgrimage sites established by Adi Shankaracharya in the 8th century. These four sacred destinations are strategically located in the four cardinal directions of India, representing cosmic balance and spiritual completeness:[1]
          </Text>

          <Text style={styles.h4}>Badrinath - The Northern Sanctuary</Text>
          <Text style={styles.p}>
            Badrinath is situated at 10,400 feet above sea level in the Garhwal Himalayas of Uttarakhand. Built in the early ninth century AD, this temple is one of India's most revered Hindu shrines. The Badrinath temple is positioned between the Nar and Narayan mountain ranges with the magnificent Neelkanth peak as its backdrop. This shrine of Lord Vishnu represents Satya Yuga (the age of truth). The temple features the Tap Kund, a hot spring believed to wash away sins of devotees who take a sacred dip.[1]
          </Text>

          <Text style={styles.h4}>Dwarka - The Western Divine City</Text>
          <Text style={styles.p}>
            Dwarka in Gujarat serves as the western pilgrimage point, representing Lord Krishna's divine kingdom. This shrine of Lord Vishnu symbolizes Dvapara Yuga (the third cosmic age). According to Hindu mythology, Lord Vishnu retires at Dwarka after completing his daily cosmic duties.[1]
          </Text>

          <Text style={styles.h4}>Puri - The Eastern Sacred Center</Text>
          <Text style={styles.p}>
            Jagannath Puri in Odisha holds tremendous religious significance due to its famous Jagannath Temple. This eastern shrine represents Kali Yuga (the current age) and is where Lord Vishnu is believed to dine. The temple is renowned for its annual Rath Yatra (chariot festival) that attracts millions of devotees. The temple features the world's largest kitchen and houses idols of Lord Jagannath (Krishna), Lord Balabhadra, and Goddess Subhadra.[1]
          </Text>

          <Text style={styles.h4}>Rameswaram - The Southern Holy Island</Text>
          <Text style={styles.p}>
            Rameswaram in Tamil Nadu is unique as the only Shiva temple among the four Dhams. Located on an island, it represents Treta Yuga (the second cosmic age). The Ramanathaswamy Temple features forty wells where each well's water tastes different from the others. The temple boasts the world's longest corridor, measuring 690 feet east-west and 435 feet north-south, supported by 1,212 intricately carved pillars. According to Hindu mythology, Lord Vishnu takes his sacred bath at Rameswaram. The temple has many holy water bodies called tirthams, where taking a bath is considered highly auspicious.[1]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['chotaCharDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h3}>Chota Char Dham - The Himalayan Circuit</Text>
          <Text style={styles.p}>
            The Chota Char Dham (meaning "Small Four Dhams") comprises four sacred sites nestled in the Himalayan region of Uttarakhand. This circuit includes:[2][3]
          </Text>
          <Text style={styles.li}>• Yamunotri - Dedicated to Goddess Yamuna, the source of the Yamuna River</Text>
          <Text style={styles.li}>• Gangotri - Sacred to Goddess Ganga, the origin of the Ganges River</Text>
          <Text style={styles.li}>• Kedarnath - A revered Shiva temple and one of the twelve Jyotirlingas</Text>
          <Text style={styles.li}>• Badrinath - The Vishnu shrine also part of the main Char Dham</Text>
          <Text style={styles.p}>
            The Chota Char Dham pilgrimage typically follows the sequence of Yamunotri, Gangotri, Kedarnath, and Badrinath. These temples remain closed during winter months and open with summer's arrival, welcoming thousands of pilgrims annually. The Kedarnath Temple is particularly significant as it remains open for only six months each year due to heavy snowfall, yet attracts millions of devotees during this short period.[4][2]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['amarnath'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Amarnath Yatra - The Sacred Ice Lingam Pilgrimage</Text>
          <Text style={styles.p}>
            The Amarnath Yatra is one of the most challenging and revered pilgrimages in Hinduism. Located in Jammu and Kashmir, the Amarnath Cave is dedicated to Lord Shiva. Every year, an ice Shiva Lingam forms naturally inside the cave, along with two other ice formations representing Ganesha and Mother Parvati. The main Shiva lingam waxes and wanes with the phases of the moon, reaching its peak during summer. Over 600,000 devotees visit during the season, undertaking a physically demanding 5-day journey on foot from Srinagar or Pahalgam.[5][3]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['vaishnoDevi'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Vaishno Devi Yatra - The Divine Mother's Call</Text>
          <Text style={styles.p}>
            The Vaishno Devi Yatra in Jammu and Kashmir is one of India's most popular pilgrimages. Millions of devotees trek to the sacred cave shrine of Mata Vaishno Devi, believed to fulfill the wishes of sincere devotees. The journey involves a trek through mountainous terrain to reach the holy cave where the goddess is worshipped in the form of three natural rock formations (pindies).[3]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['kailash'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Kailash Mansarovar Yatra - The Ultimate Shiva Pilgrimage</Text>
          <Text style={styles.p}>
            The Kailash Mansarovar Yatra is considered the most sacred and challenging pilgrimage for devotees of Lord Shiva. Mount Kailash in Tibet is believed to be Shiva's heavenly abode, while Lake Mansarovar is considered the most sacred lake. This high-altitude pilgrimage requires significant physical preparation and is considered the ultimate spiritual journey for Shiva devotees.[3]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['varanasi'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Varanasi: City of Spiritual Enlightenment</Text>
          <Text style={styles.p}>
            Varanasi, also known as Kashi, is one of the oldest continuously inhabited cities in the world. It is considered the spiritual capital of India and is revered as the holiest city for Hindus. The city is home to numerous sacred sites, including the Ganga Aarti at the Dashashwamedh Ghat, the Kashi Vishwanath Temple, and the Sankat Mochan Hanuman Temple. Varanasi is believed to be the birthplace of Lord Shiva and is associated with Lord Krishna's divine birth. The city's spiritual significance is further enhanced by the fact that Lord Vishnu, Lord Shiva, and Lord Brahma are believed to have appeared here in different avatars.[8]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['haridwar'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Haridwar: Gateway to the Gods</Text>
          <Text style={styles.p}>
            Haridwar is one of the four most important pilgrimage sites in India, known as Pancha Bhoota Stalam (Five Abodes of the Elements). It is situated on the banks of the River Ganga, which is considered the most sacred river in Hinduism. The city is home to the famous Har Ki Pauri, where Lord Vishnu is believed to have appeared as a child. Haridwar is also known for its numerous temples, including the Mansa Devi Temple, the Neelkanth Mahadev Temple, and the Bharat Mata Mandir. It is considered a gateway to the Himalayas and is a place of pilgrimage for both Hindus and Buddhists.[9]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['rishikesh'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Rishikesh: Yoga Capital of the World</Text>
          <Text style={styles.p}>
            Rishikesh is a holy city located in the Himalayan foothills of Uttarakhand, known for its association with Lord Vishnu's incarnation as Lord Rama. It is also a renowned center for yoga and meditation. The city is home to the famous Laxman Jhula, a suspension bridge over the River Ganga, and the famous Beatles Ashram. Rishikesh is considered a gateway to the Himalayas and is a place of pilgrimage for devotees of Lord Rama and Lord Shiva.[10]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['significance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Spiritual Significance and Benefits</Text>

          <Text style={styles.h3}>The Path to Moksha</Text>
          <Text style={styles.p}>Visiting these various Dhams and completing their associated yatras is believed to help devotees achieve moksha (liberation from the cycle of birth and death). Each type of sacred journey offers unique spiritual benefits:</Text>
          <Text style={styles.li}>• Char Dham completion brings overall spiritual purification and divine blessings</Text>
          <Text style={styles.li}>• Jyotirlinga circuits provide connection with Shiva's infinite light and protection</Text>
          <Text style={styles.li}>• Shakti Peetha pilgrimages offer access to divine feminine energy and transformation</Text>
          <Text style={styles.li}>• Seasonal yatras like Kumbh Mela provide collective spiritual energy and community bonding</Text>

          <Text style={styles.h3}>Transformative Journey Experience</Text>
          <Text style={styles.p}>Hindu yatras represent more than mere travel - they are transformative spiritual experiences that:</Text>
          <Text style={styles.li}>• Test devotion through physical and mental challenges</Text>
          <Text style={styles.li}>• Purify consciousness through sacred rituals and holy site visits</Text>
          <Text style={styles.li}>• Build community through shared pilgrimage experiences</Text>
          <Text style={styles.li}>• Develop surrender by placing trust in divine providence during the journey</Text>

          <Text style={styles.h3}>Modern Pilgrimage Infrastructure</Text>
          <Text style={styles.p}>Contemporary yatra infrastructure includes:</Text>
          <Text style={styles.li}>• Organized tour circuits facilitating group pilgrimages[9]</Text>
          <Text style={styles.li}>• Government support for safety and accessibility</Text>
          <Text style={styles.li}>• Digital platforms for registration and information</Text>
          <Text style={styles.li}>• Transportation improvements making remote sites more accessible</Text>
          <Text style={styles.li}>• Accommodation facilities along pilgrimage routes</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Cultural and Religious Impact</Text>
          <Text style={styles.p}>The Hindu yatra system creates a vast network of spiritual connectivity across India, promoting:</Text>
          <Text style={styles.li}>• National integration through inter-regional pilgrimage</Text>
          <Text style={styles.li}>• Cultural preservation of ancient traditions and practices</Text>
          <Text style={styles.li}>• Economic development of pilgrimage centers and routes</Text>
          <Text style={styles.li}>• Spiritual democracy making divine access available to all social levels</Text>
          <Text style={styles.p}>This comprehensive system of Dhams and yatras represents one of humanity's most extensive sacred geography, offering multiple pathways to spiritual fulfillment and divine realization. Whether through the cosmic completeness of the Char Dham, the transformative power of Himalayan yatras, or the community experience of festival pilgrimages, these sacred journeys continue to provide millions of Hindus with profound spiritual experiences and lasting transformation.</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['historical'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Historical Background of Sacred Sites</Text>
          <Text style={styles.p}>The Char Dham, Chota Char Dham, and other major yatras have deep historical roots. Many of these sites were established by revered Hindu saints and sages, and their significance has been documented in ancient texts and scriptures. The yatra tradition itself is believed to have originated from the teachings of Lord Rama and Lord Krishna, who themselves undertook extensive pilgrimages. Over time, these sacred journeys evolved into organized pilgrimages, with specific rituals, timings, and routes. The yatra system is not only a means of spiritual purification but also a means of preserving and promoting ancient Hindu traditions and cultural heritage.</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Conclusion</Text>
          <Text style={styles.p}>The Hindu yatra system is a comprehensive and intricate network of sacred pilgrimage sites and spiritual journeys. These holy destinations, known as Dhams, represent the physical manifestations of divine energy and provide devotees with opportunities to experience profound spiritual awakening. The yatra tradition, with its diverse range of sites and rituals, serves as a powerful tool for spiritual transformation, community bonding, and cultural preservation. Whether one undertakes a simple pilgrimage to a local temple or a challenging journey to a remote sacred site, the experience is transformative and deeply meaningful for those who undertake it with devotion and sincerity.</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>References</Text>
          {references.map(ref => (
            <Text
              key={ref.id}
              style={[styles.p, styles.link]}
              onPress={() => Linking.openURL(ref.url)}
            >
              [{ref.id}] {ref.url}
            </Text>
          ))}
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
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginTop: 6,
    marginBottom: 4,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  p: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  li: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginLeft: 8,
    marginBottom: 2,
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
    color: '#333',
  },
  dropdownChevron: {
    color: '#666',
    fontSize: 20,
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
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});