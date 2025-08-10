import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = { headerShown: false };

export default function VedasScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'divineNature', title: 'The Divine Nature of Vedic Knowledge' },
    { key: 'historical', title: 'Historical Context and Chronology' },
    { key: 'fourVedas', title: 'The Four Vedas: Structure and Content' },
    { key: 'fourFold', title: 'The Four-Fold Structure of Each Veda' },
    { key: 'spiritual', title: 'Spiritual and Philosophical Significance' },
    { key: 'scientific', title: 'Scientific and Practical Knowledge' },
    { key: 'cultural', title: 'Cultural Impact and Influence' },
    { key: 'modern', title: 'Modern Preservation and Study' },
    { key: 'conclusion', title: 'Conclusion' },
    { key: 'references', title: 'References' },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('Topic');

  // Check for search context when component mounts
  useEffect(() => {
    const checkSearchContext = async () => {
      try {
        const searchContext = await AsyncStorage.getItem('spiritualSearchContext');
        if (searchContext) {
          const context = JSON.parse(searchContext);
          if (context.pageId === 'vedas' && context.query) {
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

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel('Topic');
    });
  };

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Vedas' },
    { id: 2, url: 'https://www.prathaculturalschool.com/post/vedas' },
    { id: 3, url: 'https://www.exoticindiaart.com/blog/the-four-vedas-sacred-scriptures-of-hinduism/' },
    { id: 4, url: 'https://vedicheritage.gov.in/science/' },
    { id: 5, url: 'https://www.humanities.ox.ac.uk/vedas-once-and-future-scriptless-texts' },
    { id: 6, url: 'https://www.worldhistory.org/The_Vedas/' },
    { id: 7, url: 'https://en.wikipedia.org/wiki/Historical_Vedic_religion' },
    { id: 8, url: 'https://courses.lumenlearning.com/suny-hccc-worldcivilization/chapter/the-vedas/' },
    { id: 9, url: 'https://www.britannica.com/topic/Veda' },
    { id: 10, url: 'https://vedicwellnessuniversity.com/significance-of-the-vedas-in-todays-world/' },
    { id: 11, url: 'https://byjus.com/free-ias-prep/types-vedas/' },
    { id: 12, url: 'https://vedicheritage.gov.in/introduction/' },
    { id: 13, url: 'https://www.youtube.com/watch?v=S1-17TeZvV0' },
    { id: 14, url: 'https://www.youtube.com/watch?v=QIAfZZGD3ZU' },
    { id: 15, url: 'https://study.com/academy/lesson/the-vedas-hinduisms-sacred-texts.html' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search Vedas, Samhitas, Upanishads..."
        enableSpiritualSearch={false}
        extraContent={
          <>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownOpen(true)}
              style={styles.dropdownTrigger}
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
          <Text style={styles.h1}>The Vedas: The Sacred Foundation of Hindu Knowledge</Text>
          <HighlightedText 
            text="The Vedas represent the oldest and most sacred scriptures of Hinduism, forming the foundational texts that have guided Hindu spiritual and philosophical thought for millennia. These ancient Sanskrit texts constitute the earliest layer of Sanskrit literature and serve as the bedrock upon which all Hindu religious practice and philosophy is built.[1]"
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['divineNature'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Divine Nature of Vedic Knowledge</Text>

          <Text style={styles.h3}>The Meaning and Origin</Text>
          <Text style={styles.p}>
            The word "Veda" derives from the Sanskrit root "vid," meaning "knowledge" or "wisdom". The Vedas are considered apauruṣeya (not of human origin) and are believed to have been revealed to ancient sages (rishis) through divine inspiration during deep meditation. This divine knowledge was directly received from the ultimate source and represents the cosmic wisdom of the entire universe.[2][3]
          </Text>
          <Text style={styles.p}>
            The Vedas are also referred to as Śruti (meaning "that which is heard"), emphasizing their nature as divine revelation rather than human composition. They are considered eternal and vibrate in the outer dimensions of the world of Brahmans, existing as uncreated, eternal sound syllables.[3][4]
          </Text>

          <Text style={styles.h3}>The Oral Tradition</Text>
          <Text style={styles.p}>
            The Vedas were famously script-averse and were probably the last sacred texts to be written down. For centuries, they were preserved through intricate systems of verbatim memorization, passed down orally from guru to shishya (student) through the guru-shishya parampara tradition. The gurus carefully selected only certain individuals whom they deemed capable of correctly understanding, retaining, and applying these sacred teachings.[5][2]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['historical'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Historical Context and Chronology</Text>

          <Text style={styles.h3}>Dating the Vedas</Text>
          <Text style={styles.p}>
            The composition of the Vedas spans a significant period in ancient Indian history. The bulk of the Rigveda Samhita was composed in the northwestern region (Punjab) of the Indian subcontinent, most likely between c. 1500 and 1200 BCE, although some scholars suggest a wider timeframe of c. 1700–1100 BCE. The other three Samhitas are dated to approximately c. 1200–900 BCE during the time of the Kuru Kingdom.[1]
          </Text>
          <Text style={styles.p}>
            The Vedas were finally documented and compiled by Ved Vyasa between 1500-500 BCE, a period historians refer to as the Vedic Age. The entire Vedic period spans from the mid-2nd to mid-1st millennium BCE, encompassing the Late Bronze Age and Iron Age.[2][1]
          </Text>

          <Text style={styles.h3}>Cultural Context</Text>
          <Text style={styles.p}>
            The Vedic texts emerged during the period when Sanskrit-speaking peoples began to dominate life and thought in the Indus Valley, probably between 2000 and 1500 BCE. These peoples, who called themselves Aryans (meaning "free" or "noble"), brought with them a rich Indo-Iranian cultural tradition that would profoundly shape the Indian subcontinent.[6][7][1]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['fourVedas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Four Vedas: Structure and Content</Text>

          <Text style={styles.h3}>Rigveda - The Foundation of Praise</Text>
          <Text style={styles.p}>The Rigveda (Sanskrit: "Rig" meaning "to praise") is the oldest and most important of the four Vedas. It consists of:</Text>
          <Text style={styles.li}>• 10 books (mandalas)</Text>
          <Text style={styles.li}>• 1,028 hymns</Text>
          <Text style={styles.li}>• 10,600 verses</Text>
          <Text style={styles.li}>• The famous Gayatri Mantra</Text>
          <Text style={styles.p}>
            The Rigveda contains hymns that are reflections of divine vibrations experienced by ancient sages. These verses praise natural forces like Earth (Prithvi), water (Jalam), fire (Agni), wind (Vayu), and sky (Akash), as well as deities such as Indra, Soma, Agni, Varuna, and Mitra. The text addresses fundamental questions about the origin of the universe, the purpose of human existence, and deep existential mysteries.[2]
          </Text>

          <Text style={styles.h3}>Yajurveda - The Knowledge of Sacrifice</Text>
          <Text style={styles.p}>The Yajurveda ("Knowledge of the Sacrifice") contains sacred formulas known as mantras that were recited by the adhvaryu priest responsible for the sacrificial fire and conducting ceremonies. This Veda provides detailed instructions for religious rituals and sacrificial procedures.[9][8]</Text>

          <Text style={styles.h3}>Samaveda - The Knowledge of Chants</Text>
          <Text style={styles.p}>The Samaveda ("Knowledge of the Chants") consists mainly of hymns about religious rituals, drawn almost entirely from the Rigveda but arranged for melodic recitation. These verses were performed by the udgatri ("chanter") and his group of priests during ceremonial chanting.[8][9]</Text>

          <Text style={styles.h3}>Atharvaveda - The Knowledge of the Fire Priest</Text>
          <Text style={styles.p}>The Atharvaveda ("Knowledge of the Fire Priest") includes various local traditions and contains spells against enemies, sorcerers, and diseases. This collection incorporates magic spells, incantations, and practical knowledge that remained partly outside the traditional Vedic sacrifice system.[9][8]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['fourFold'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Four-Fold Structure of Each Veda</Text>
          <Text style={styles.h3}>Samhitas - The Core Mantras</Text>
          <Text style={styles.p}>The Samhitas contain the fundamental mantras, hymns, and benedictions that form the essential verses of each Veda.</Text>
          <Text style={styles.h3}>Brahmanas - Ritual Commentaries</Text>
          <Text style={styles.p}>The Brahmanas provide detailed commentaries and explanations of rituals, ceremonies, and sacrifices (Yajñas), serving as practical guides for priests.</Text>
          <Text style={styles.h3}>Aranyakas - Forest Texts</Text>
          <Text style={styles.p}>The Aranyakas (literally "forest texts") contain instructions on rituals, ceremonies, and symbolic sacrifices, meant for those in the Vanaprastha (forest dweller) stage of life.</Text>
          <Text style={styles.h3}>Upanishads - Philosophical Wisdom</Text>
          <Text style={styles.p}>The Upanishads contain texts discussing meditation, philosophy, and spiritual knowledge, intended for those in the Sannyasa (renunciant) stage of life. These texts explore metaphysical concepts and the nature of ultimate reality (Brahman).</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Spiritual and Philosophical Significance</Text>
          <Text style={styles.h3}>Cosmic Knowledge and Divine Understanding</Text>
          <Text style={styles.p}>
            The Vedas serve as a vast repository of cosmic knowledge, encompassing hymns, rituals, philosophy, and metaphysical insights that have shaped Hindu culture for millennia. They bridge the gap between the supersensuous dimension beyond human intellect and humanity's everyday consciousness.[10][3]
          </Text>
          <Text style={styles.h3}>The Path to Liberation</Text>
          <Text style={styles.p}>The fundamental message of the Vedas centers on achieving moksha (liberation from the cycle of birth and death). They describe:</Text>
          <Text style={styles.li}>• The creation, preservation, and ultimate dissolution of the universe</Text>
          <Text style={styles.li}>• The development of the soul - its evolution, destiny, bondage, and freedom</Text>
          <Text style={styles.li}>• The deep-rooted relationship between matter and soul, the universe and living beings[10]</Text>
          <Text style={styles.h3}>Divine Manifestation</Text>
          <Text style={styles.p}>The Vedas describe God in multiple forms - both as cosmic forces and ultimate reality. Deities like Agni (fire), Surya (sun), Indra (warrior-ruler), and Vayu (wind) symbolize natural and moral principles. Beyond these personified forces, Brahman represents the formless, infinite consciousness underlying all existence.[3]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['scientific'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Scientific and Practical Knowledge</Text>
          <Text style={styles.h3}>Ancient Wisdom for Modern Times</Text>
          <Text style={styles.p}>Beyond their spiritual significance, the Vedas provide mankind with values for everyday life and contain remarkable insights into various fields of knowledge. They include information about:</Text>
          <Text style={styles.li}>• Astronomy and mathematics</Text>
          <Text style={styles.li}>• Medicine and healing practices</Text>
          <Text style={styles.li}>• Agriculture and environmental science</Text>
          <Text style={styles.li}>• Psychology and consciousness studies</Text>
          <Text style={styles.li}>• Social organization and governance</Text>
          <Text style={styles.h3}>Timeless Relevance</Text>
          <Text style={styles.p}>The Vedas continue to be relevant in today's world as they advocate solutions to all worldly problems through their comprehensive understanding of the relationship between matter and consciousness. Modern practitioners and scholars find valuable insights in Vedic approaches to wellness, sustainable living, and spiritual development.[10]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Cultural Impact and Influence</Text>
          <Text style={styles.h3}>Foundation of Hindu Tradition</Text>
          <Text style={styles.p}>The Vedas established the theological and philosophical foundation for what would become Hinduism. The historical Vedic religion (also called Vedism or Brahmanism) constituted the religious ideas and practices of the Indo-Aryan peoples during the Vedic period (c. 1500–500 BCE).[7]</Text>
          <Text style={styles.h3}>Social Structure</Text>
          <Text style={styles.p}>The Vedic texts influenced the development of important social concepts, including the Indian caste system, which is based on a fable from the Vedas about the sacrifice of the deity Purusha. While this system has evolved and been reinterpreted over time, its origins trace back to Vedic social organization.[8]</Text>
          <Text style={styles.h3}>Continuous Tradition</Text>
          <Text style={styles.p}>The Vedic thought and culture reflected in the Rig Veda has maintained a continuous history of dominance in India for the last thirty-five hundred years. This remarkable continuity demonstrates the enduring relevance and adaptability of Vedic wisdom across changing historical periods.[6]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['modern'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Modern Preservation and Study</Text>
          <Text style={styles.h3}>Academic Recognition</Text>
          <Text style={styles.p}>Contemporary scholarship recognizes the Vedas as among the world's most important ancient literary and religious texts. They represent invaluable sources for understanding ancient Indian history, culture, and spiritual development.[10]</Text>
          <Text style={styles.h3}>Living Tradition</Text>
          <Text style={styles.p}>Despite their ancient origins, the Vedas remain living texts within Hindu practice. Some Vedic rituals are still practiced today, maintaining an unbroken chain of tradition spanning thousands of years. Modern practitioners continue to chant Vedic mantras, perform Vedic ceremonies, and study Vedic philosophy as living wisdom rather than historical artifacts.[7]</Text>
          <Text style={styles.h3}>Digital Age Accessibility</Text>
          <Text style={styles.p}>In the modern era, digital platforms and educational institutions work to preserve and disseminate Vedic knowledge, making these ancient texts more accessible to contemporary students and practitioners worldwide.</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Conclusion: The Eternal Wisdom</Text>
          <Text style={styles.p}>The Vedas represent humanity's earliest systematic exploration of cosmic truth, divine reality, and human purpose. As repositories of both spiritual wisdom and practical knowledge, they continue to offer guidance for those seeking understanding of life's deepest questions. For millions of Hindus, the Vedas are not just ancient scriptures but the eternal voice of Dharma, whose verses form the foundation upon which modern Hindu society stands.[3]</Text>
          <Text style={styles.p}>These sacred texts bridge the ancient and modern worlds, offering timeless insights into the nature of existence, consciousness, and the path to spiritual liberation. Their influence extends far beyond religious boundaries, contributing to humanity's understanding of philosophy, science, and the pursuit of wisdom. The Vedas remain a testament to the profound spiritual achievements of ancient India and continue to illuminate the path toward truth and enlightenment for seekers across the globe.</Text>
        </View>

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
  link: {
    color: '#1a73e8',
    textDecorationLine: 'underline',
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
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItem: {
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});