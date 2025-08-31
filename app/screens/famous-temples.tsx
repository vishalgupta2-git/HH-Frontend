import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image, TextInput } from 'react-native';

export const options = { headerShown: false };

export default function FamousTemplesScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'mostVisited', title: 'The Most Visited Sacred Sites' },
    { key: 'charDham', title: 'The Sacred Char Dham Circuit' },
    { key: 'architectural', title: 'Architectural Marvels and Cultural Treasures' },
    { key: 'jyotirlingas', title: 'Sacred Jyotirlingas' },
    { key: 'regional', title: 'Regional Temple Treasures' },
    { key: 'unique', title: 'Unique and Rare Temples' },
    { key: 'significance', title: 'Spiritual Significance and Cultural Impact' },
    { key: 'pilgrimage', title: 'Pilgrimage Traditions and Modern Accessibility' },
    { key: 'conclusion', title: 'Conclusion' },
    { key: 'references', title: 'References' },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('Topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState('');

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      setShowSearchResults(false);
      setSearchHighlight('');
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
    setSearchHighlight(query);
  };

  // Helper function to get text content for each section
  const getSectionText = (sectionKey: string): string => {
    switch (sectionKey) {
      case 'intro':
        return 'Hindu temples represent some of the world\'s most magnificent architectural achievements and serve as living centers of spiritual devotion, cultural preservation, and divine worship.';
      case 'mostVisited':
        return 'The most visited sacred sites in India attract millions of devotees annually, representing the spiritual heart of Hinduism and serving as major pilgrimage destinations.';
      case 'charDham':
        return 'The Char Dham circuit consists of four sacred sites located in the four corners of India, representing a complete spiritual journey that every Hindu aspires to undertake.';
      case 'architectural':
        return 'Architectural marvels and cultural treasures showcase the incredible skill and devotion of ancient Indian craftsmen and architects who created these magnificent structures.';
      case 'jyotirlingas':
        return 'Sacred Jyotirlingas represent the most sacred abodes of Lord Shiva, where the divine light of consciousness is believed to be eternally present.';
      case 'regional':
        return 'Regional temple treasures reflect the diverse cultural and architectural traditions of different parts of India, each with unique characteristics and significance.';
      case 'unique':
        return 'Unique and rare temples represent extraordinary examples of Hindu architecture and spirituality, often featuring unusual designs or special religious significance.';
      case 'significance':
        return 'Spiritual significance and cultural impact of Hindu temples extends beyond religious worship to influence art, literature, music, and social practices throughout Indian history.';
      case 'pilgrimage':
        return 'Pilgrimage traditions and modern accessibility ensure that these sacred sites remain accessible to devotees while preserving their spiritual and cultural significance.';
      case 'conclusion':
        return 'Famous Hindu temples continue to inspire awe and devotion, serving as living monuments to the spiritual heritage and architectural genius of ancient India.';
      default:
        return '';
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
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

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites_in_India' },
    { id: 2, url: 'https://www.guinnessworldrecords.com/world-records/most-visited-hindu-temple-' },
    { id: 3, url: 'https://www.travelogyindia.com/blog/list-of-famous-temples-in-india/' },
    { id: 4, url: 'https://www.lonelyplanet.com/articles/top-temples-in-india' },
    { id: 5, url: 'https://www.lydiatravels.com/2023/03/the-most-beautiful-temples-in-india.html' },
    { id: 6, url: 'https://karnatakatourism.org/temples-in-karnataka/page/3/' },
    { id: 7, url: 'https://en.wikipedia.org/wiki/List_of_Hindu_temples_in_India' },
    { id: 8, url: 'https://www.holidify.com/collections/temples-of-india' },
    { id: 9, url: 'https://www.trawell.in/best-pilgrimage-sites-near-bangalore' },
    { id: 10, url: 'https://education.vikaspedia.in/viewcontent/education/childrens-corner/places-to-visit/famous-temples-in-india?lgn=en' },
    { id: 11, url: 'https://www.makemytrip.com/tripideas/pilgrimage-domestic-10000_budget-destinations-from-bengaluru' },
    { id: 12, url: 'https://testbook.com/ssc-jobs/famous-temples-in-india' },
    { id: 13, url: 'https://en.wikipedia.org/wiki/List_of_largest_Hindu_temples' },
    { id: 14, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites' },
    { id: 15, url: 'https://www.namasteindiatrip.com/blog/temples-in-india/' },
    { id: 16, url: 'https://www.holidify.com/collections/temples-in-bangalore' },
    { id: 17, url: 'https://www.tourmyindia.com/pilgrimage/hindu-pilgrimage-tour.html' },
    { id: 18, url: 'https://en.wikipedia.org/wiki/Hindu_temple' },
    { id: 19, url: 'https://tripcosmos.co/hindu-pilgrimage-tour-across-india/' },
    { id: 20, url: 'https://www.tripoto.com/india/trips/top-50-most-famous-hindu-temples-to-visit-in-india-6131cfd2efecc' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search temples, circuits, regions..."
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Famous Temples content..."
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
          <Text style={styles.h1}>Famous Hindu Temples: Sacred Architectural Marvels and Spiritual Centers</Text>
          <Text style={styles.p}>
            Hindu temples represent some of the world's most magnificent architectural achievements and serve as living centers of spiritual devotion, cultural preservation, and divine worship. These sacred structures, ranging from ancient cave temples to towering gopurams, embody thousands of years of religious tradition and continue to attract millions of pilgrims and visitors seeking spiritual transformation.
          </Text>
        </LinearGradient>

        {/* Most visited */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['mostVisited'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Most Visited Sacred Sites</Text>

          <Text style={styles.h3}>Tirupati Balaji Temple - The Crown Jewel of Pilgrimage</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Balaji Image.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            The Venkateswara Temple at Tirumala stands as the most visited Hindu temple in the world, attracting 30,000-40,000 visitors daily and up to 75,000 on New Year's Day. Located in the hills of Tirumala in Andhra Pradesh, this temple dedicated to Lord Venkateswara (a form of Vishnu) receives 30-40 million visitors annually, making it not just India's busiest temple but potentially the most visited religious site globally.[1][2]
          </Text>
          <Text style={styles.p}>The temple sits atop seven hills representing the seven heads of Adisesha, the cosmic serpent on which Vishnu rests. Devotees believe that Venkateswara appeared on earth to save mankind from the trials of Kali Yuga, making this pilgrimage especially significant for spiritual seekers.[1]</Text>

          <Text style={styles.h3}>Shirdi Sai Baba Temple - Universal Spiritual Center</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/SaiBaba.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            The Sri Sai Baba Temple in Shirdi, Maharashtra attracts over 60,000 devotees daily, with numbers reaching 2-3 lakh on special occasions. This temple, built in 1922, honors Sai Baba of Shirdi, a spiritual master revered across religious boundaries. The temple receives more than 30 million devotees annually, making it one of the world's top pilgrimage destinations and India's second-richest temple.[1]
          </Text>

          <Text style={styles.h3}>Ayodhya Ram Janmabhoomi - The Sacred Birthplace</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Ram Mandir.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            The newly inaugurated Ram Mandir in Ayodhya represents one of the most significant recent developments in Hindu temple architecture. Consecrated on January 22, 2024, this temple is believed to be located at Ram Janmabhoomi, the birthplace of Lord Rama. Projections suggest it will receive 50 million visitors annually, potentially making it the world's top pilgrimage site.[1]
          </Text>
        </View>

        {/* Char Dham */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['charDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Sacred Char Dham Circuit</Text>
          <Text style={styles.h3}>Jagannath Temple, Puri - The Lord of the Universe</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/JagannathPuri.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Jagannath Temple in Puri, Odisha represents one of the four sacred Char Dham sites and houses the famous wooden idols of Lord Jagannath (Krishna), Balabhadra, and Subhadra. The temple is renowned for its annual Rath Yatra (chariot festival).[1]</Text>
          
          <Text style={styles.h3}>Kashi Vishwanath Temple - The Eternal City's Heart</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/KashiVishwanath.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Kashi Vishwanath Temple in Varanasi holds special significance as one of the twelve sacred Jyotirlingas dedicated to Lord Shiva. Located in the ancient holy city on the banks of the Ganges, this temple recorded 3.35 lakh pilgrims on January 1, 2023.[1]</Text>
          
          <Text style={styles.h3}>Badrinath and Kedarnath - Himalayan Sacred Heights</Text>
          <View style={styles.imageRow}>
            <Image 
              source={require('@/assets/images/FamousTempleImages/BadrinathDham.jpg')} 
              style={styles.halfImage}
              resizeMode="cover"
            />
            <Image 
              source={require('@/assets/images/FamousTempleImages/KedarnathDham.jpg')} 
              style={styles.halfImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.p}>Badrinath Temple sits at 10,400 feet above sea level in the Garhwal Himalayas, positioned between the Nar and Narayan mountain ranges with the magnificent Neelkanth peak as backdrop. Kedarnath Temple serves both as a Char Dham site and one of the twelve Jyotirlingas.[1][3]</Text>
        </View>

        {/* Architectural */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['architectural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Architectural Marvels and Cultural Treasures</Text>
          <Text style={styles.h3}>Meenakshi Amman Temple - South Indian Splendor</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/MeenakshiAmmannTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Meenakshi Amman Temple in Madurai exemplifies the pinnacle of South Indian temple architecture. This 17th-century complex features 12 towering gopurams adorned with over a thousand statues. The temple's Thousand Pillared Hall now houses the Temple Art Museum, while the famous musical pillars produce different notes when struck.[4]</Text>
          <Text style={styles.h3}>Konark Sun Temple - Architectural Wonder</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/KonarkSunTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Konark Sun Temple stands as a UNESCO World Heritage Site designed as a massive stone chariot dedicated to Surya (the Sun God), showcasing intricate carvings and precise astronomical alignments.</Text>
          <Text style={styles.h3}>Khajuraho Temples - Artistic Excellence</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Khajuraho.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Khajuraho temple complex represents medieval Indian temple architecture at its finest, featuring intricate carvings and sculptures that celebrate life in all its forms. These 10th-11th century temples demonstrate sophisticated artistic traditions.[5]</Text>
        </View>

        {/* Jyotirlingas */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['jyotirlingas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Sacred Jyotirlingas - Shiva's Divine Light</Text>
          <Text style={styles.h3}>Somnath Temple - The Eternal Shrine</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/SomnathTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>Somnath Temple in Gujarat stands as the first among the Jyotirlingas, representing Shiva's eternal and indestructible nature. Despite being destroyed and rebuilt multiple times, it symbolizes the undying nature of faith.[1]</Text>
          <Text style={styles.h3}>Mahakaleshwar Temple - The Time Lord</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/MahaKaleshwar.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>Mahakaleshwar Temple in Ujjain is unique as the only south-facing Jyotirlinga and is famous for its Bhasma Aarti ceremony. The temple represents Shiva as Mahakaal, the lord of time and death.[1]</Text>
          <Text style={styles.h3}>Mallikarjuna Temple - Divine Union</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Mallikarjuna.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>Mallikarjuna Temple at Srisailam signifies the divine union of Shiva and Parvati, serving as both a Jyotirlinga and a Shakti Peetha.[1]</Text>
        </View>

        {/* Regional Treasures */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['regional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Regional Temple Treasures</Text>
          <Text style={styles.h3}>Maharashtra's Sacred Sites</Text>
          <Text style={styles.p}>Shirdi Sai Baba Temple leads Maharashtra's spiritual landscape, while Trimbakeshwar and Bhimashankar contribute to the state's Jyotirlinga heritage. Grishneshwar Temple completes the Jyotirlinga circuit in the state.[1]</Text>
          <Text style={styles.h3}>Karnataka's Divine Heritage</Text>
          <Text style={styles.p}>Murudeshwar Temple features the world's second-largest statue of Lord Shiva at 123 feet, situated on the Kanduka hill and surrounded by the Arabian Sea on three sides. Vitthala Temple in Hampi showcases exceptional architecture, renowned for its stone chariot and musical pillars. Gokarna Mahabaleshwar Temple is considered as sacred as Kashi.[6]</Text>
          <Text style={styles.h3}>Tamil Nadu's Temple Grandeur</Text>
          <Text style={styles.p}>Beyond Meenakshi Temple, Tamil Nadu houses Ramanathaswamy Temple at Rameswaram, significant as both a Char Dham site and Jyotirlinga. Kanchipuram serves as one of the seven sacred Sapta Puri cities.[1]</Text>
          <Text style={styles.h3}>Gujarat's Sacred Legacy</Text>
          <Text style={styles.p}>Dwarka represents both a Char Dham site and one of the Sapta Puri cities, marking Lord Krishna's divine kingdom. Somnath and Nageshwar temples contribute to Gujarat's Jyotirlinga heritage.[1]</Text>
        </View>

        {/* Unique */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['unique'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Unique and Rare Temples</Text>
          <Text style={styles.h3}>Brahma Temple, Pushkar - The Creator's Rare Shrine</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/BrahmaTemplePushkar.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>The Brahma Temple in Pushkar, Rajasthan represents one of the world's few temples dedicated to Lord Brahma. This 14th-century structure features a distinctive red pinnacle and vibrant blue-painted pillars. Literature suggests Sage Vishwamitra built the original structure.[3]</Text>
          <Text style={styles.h3}>Vaishno Devi Temple - The Divine Mother's Abode</Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/VaishnoDevi.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>Vaishno Devi Temple in Jammu & Kashmir requires pilgrims to trek 12 kilometers from Katra base camp to reach the sacred cave at 5,200 feet. The main deity appears as three natural rock formations representing different aspects of the Divine Mother.[3]</Text>
        </View>

        {/* Significance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['significance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Spiritual Significance and Cultural Impact</Text>
          <Text style={styles.h3}>Centers of Learning and Culture</Text>
          <Text style={styles.p}>Hindu temples serve as repositories of art, culture, and spiritual knowledge. Many temples maintain traditional music and dance schools, preserve ancient manuscripts, and continue centuries-old crafts and traditions.</Text>
          <Text style={styles.h3}>Economic and Social Impact</Text>
          <Text style={styles.p}>Major temples like Tirupati and Shirdi generate significant economic activity, supporting local communities through employment, tourism, and charitable activities. Temple trusts often run educational institutions, hospitals, and social welfare programs.</Text>
          <Text style={styles.h3}>Architectural Heritage</Text>
          <Text style={styles.p}>These temples represent living museums of Indian architecture, showcasing evolution from cave temples to towering gopurams, and demonstrating knowledge of astronomy, acoustics, mathematics, and engineering.</Text>
        </View>

        {/* Pilgrimage */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['pilgrimage'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Pilgrimage Traditions and Modern Accessibility</Text>
          <Text style={styles.h3}>Traditional Pilgrimage Circuits</Text>
          <Text style={styles.p}>Hindu temples are often organized into spiritual circuits like the Char Dham Yatra, Jyotirlinga circuit, and Shakti Peetha pilgrimage, offering structured paths for spiritual growth.[1]</Text>
          <Text style={styles.h3}>Modern Infrastructure</Text>
          <Text style={styles.p}>Contemporary temple management includes digital darshan booking, transportation, and improved accommodations while maintaining traditional practices. Many temples offer live streaming of ceremonies.</Text>
          <Text style={styles.h3}>Environmental Consciousness</Text>
          <Text style={styles.p}>Temple management increasingly emphasizes eco-friendly practices, waste management, and sustainable tourism to preserve sacred sites for future generations.</Text>
        </View>

        {/* Conclusion */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Conclusion: Living Heritage of Faith</Text>
          <Text style={styles.p}>Hindu temples embody living traditions that continue to evolve while maintaining their spiritual essence. From bustling crowds at Tirupati to the serene heights of Kedarnath, and from the artistic splendor of Meenakshi Temple to village shrines, these sacred spaces offer accessible pathways to the divine.</Text>
          <Text style={styles.p}>Each temple tells a unique story of faith, culture, and human aspiration, serving as bridges between earthly and divine realms. Their enduring popularity shows that humanity's need for sacred space, community worship, and divine connection remains as strong as ever.</Text>
        </View>

        {/* References */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>References</Text>
          {references.map(ref => (
            <Text key={ref.id} style={[styles.p, styles.link]} onPress={() => Linking.openURL(ref.url)}>
              [{ref.id}] {ref.url}
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
  templeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  halfImage: {
    width: '48%',
    height: 150,
    borderRadius: 10,
  },
});