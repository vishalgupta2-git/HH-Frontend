import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

export const options = { headerShown: false };

export default function HolyBooksScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});

  const sections = [
    { key: 'intro', title: 'Introduction' },
    { key: 'twoTier', title: 'The Two-Tier Classification: Shruti and Smriti' },
    { key: 'epics', title: 'The Great Epics: Mahabharat and Ramayan' },
    { key: 'gita', title: 'The Bhagavad Gita' },
    { key: 'ramcharit', title: 'Ramcharitmanas' },
    { key: 'puranas', title: 'The Puranas' },
    { key: 'additional', title: 'Additional Sacred Literature' },
    { key: 'cultural', title: 'Cultural and Spiritual Significance' },
    { key: 'modern', title: 'Modern Relevance and Global Impact' },
    { key: 'conclusion', title: 'Conclusion' },
    { key: 'references', title: 'References' },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState('Topic');

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel('Topic');
    });
  };

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://factsanddetails.com/world/cat55/sub354/item1357.html' },
    { id: 2, url: 'http://www.fsmitha.com/h1/ch05d-ind.htm' },
    { id: 3, url: 'https://www.scribd.com/document/473340165/RAMAYANA-SUMMARY-docx' },
    { id: 4, url: 'https://books.kdpublications.in/index.php/kdp/catalog/download/415/506/3773?inline=1' },
    { id: 5, url: 'https://en.wikipedia.org/wiki/Bhagavad_Gita' },
    { id: 6, url: 'https://www.exoticindiaart.com/blog/ten-books-you-should-read-to-understand-indian-religion/' },
    { id: 7, url: 'https://www.britannica.com/topic/Bhagavad-Gita' },
    { id: 8, url: 'https://en.wikipedia.org/wiki/List_of_Hindu_texts' },
    { id: 9, url: 'https://www.reddit.com/r/hinduism/comments/gsf9mr/the_order_to_read_hindu_scriptures/' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search Gita, Ramayan, Mahabharat, Puranas..."
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
          <Text style={styles.h1}>Holy Books: The Sacred Literary Foundation of Hinduism</Text>
          <Text style={styles.p}>
            Hindu sacred literature encompasses a vast collection of texts that form the spiritual, philosophical, and cultural backbone of one of the world's oldest religious traditions. These holy books range from ancient hymns and philosophical treatises to epic narratives that continue to guide millions of devotees in their spiritual journey.
          </Text>
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['twoTier'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Two-Tier Classification: Shruti and Smriti</Text>
          <Text style={styles.p}>
            Hindu sacred texts are traditionally classified into two main categories:
          </Text>
          <Text style={styles.p}>
            Shruti ("that which is heard") refers to divine revelation received by ancient sages, including the Vedas and Upanishads. Smriti ("that which is remembered") encompasses texts composed by human authors but based on divine inspiration, including the great epics and Puranas.
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['epics'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Great Epics: Mahabharat and Ramayan</Text>

          <Text style={styles.h3}>Mahabharat - The Great Epic of Bharata</Text>
          <Text style={styles.p}>
            The Mahabharat stands as one of the world's longest epic poems and is considered the most comprehensive repository of Hindu philosophy, ethics, and mythology. Composed between 500 BCE and 100 CE, this monumental work chronicles the wars of the house of Bharata and serves as a cornerstone of Hindu literature.[1]
          </Text>
          <Text style={styles.p}>The epic encompasses:</Text>
          <Text style={styles.li}>• 100,000 verses arranged in 18 books (parvas)</Text>
          <Text style={styles.li}>• Complex family saga centered on the conflict between the Pandavas and Kauravas</Text>
          <Text style={styles.li}>• Philosophical discussions on dharma (righteous duty), karma, and the nature of existence</Text>
          <Text style={styles.li}>• Multiple sub-stories that weave together to create a comprehensive worldview</Text>
          <Text style={styles.p}>
            The Mahabharat is more than just a war narrative - it serves as a dharmic text that explores moral and ethical dilemmas through its characters and their choices. The epic gave greater focus to the gods Vishnu and Shiva and introduced profound theological concepts that continue to influence Hindu thought.[2]
          </Text>

          <Text style={styles.h3}>Ramayan - The Romance of Rama</Text>
          <Text style={styles.p}>
            The Ramayan, attributed to the sage Valmiki, consists of 24,000 verses organized into seven books and tells the story of Prince Rama, an incarnation of Vishnu. This epic, composed around the 2nd century BCE, chronicles the life and adventures of Rama, the King of Ayodhya and embodiment of truth and righteousness.[3][1]
          </Text>
          <Text style={styles.p}>The narrative encompasses:</Text>
          <Text style={styles.li}>• Rama's exile to the forest for fourteen years with his wife Sita and brother Lakshmana</Text>
          <Text style={styles.li}>• Sita's abduction by the demon king Ravana</Text>
          <Text style={styles.li}>• The rescue mission aided by Hanuman and the monkey army</Text>
          <Text style={styles.li}>• The ultimate triumph of good over evil</Text>
          <Text style={styles.p}>
            The Ramayan serves as the story of dharma or duty and presents ideal models of relationships - the perfect king (Rama), the devoted wife (Sita), the loyal brother (Lakshmana), and the faithful devotee (Hanuman). The epic emphasizes themes of justice, sacrifice, loyalty, and the consequences of ethical choices.[4][1][3]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['gita'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Bhagavad Gita - The Divine Song</Text>
          <Text style={styles.h3}>The Crown Jewel of Hindu Philosophy</Text>
          <Text style={styles.p}>
            The Bhagavad Gita ("Song of the Lord") forms part of the sixth book of the Mahabharat and stands as one of the most popular sacred texts of Hinduism. Dated to the second or first century BCE, this dialogue between Prince Arjuna and his charioteer Krishna (an avatar of Vishnu) addresses fundamental questions of duty, action, and spiritual liberation.[5][1]
          </Text>
          <Text style={styles.h3}>The Philosophical Framework</Text>
          <Text style={styles.p}>The Gita presents itself at the moment before the great battle of Kurukshetra, where Arjuna faces a moral crisis about fighting against friends and relatives. Krishna's teachings encompass:</Text>
          <Text style={styles.li}>• Karma Yoga - The path of righteous action</Text>
          <Text style={styles.li}>• Bhakti Yoga - The path of devotion</Text>
          <Text style={styles.li}>• Jnana Yoga - The path of knowledge</Text>
          <Text style={styles.p}>Core Philosophical Concepts:</Text>
          <Text style={styles.li}>• Dharma - Righteous duty according to one's position in life</Text>
          <Text style={styles.li}>• Detached Action - Performing duty without attachment to results</Text>
          <Text style={styles.li}>• Immortality of the Soul - The eternal nature of the atman (soul)</Text>
          <Text style={styles.li}>• Divine Presence - God's accessibility to all sincere devotees</Text>
          <Text style={styles.p}>
            The Gita represents a synthesis of various strands of Indian religious thought, including Vedic concepts of dharma, Samkhya-based yoga and jnana (knowledge), and bhakti (devotion). Krishna reminds Arjuna that it is best to fulfill one's destiny with detachment because detachment leads to liberation.[5][3]
          </Text>
          <Text style={styles.h3}>Universal Appeal and Influence</Text>
          <Text style={styles.p}>
            The Bhagavad Gita became Hinduism's most popular scripture and continues to be read for daily reference - a work that Mahatma Gandhi described as "an infallible guide to conduct". Its messages resonate globally, making it one of the most widely read and translated Indian texts in the world.[6][2]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['ramcharit'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Ramcharitmanas - The Lake of Rama's Deeds</Text>
          <Text style={styles.p}>
            The Ramcharitmanas, composed by the poet-saint Tulsidas in the 16th century, represents a devotional retelling of the Ramayan in the Awadhi dialect of Hindi. This beloved text makes the story of Rama accessible to common people and emphasizes bhakti (devotion) as the primary path to spiritual realization.
          </Text>
          <Text style={styles.p}>The Ramcharitmanas differs from Valmiki's Sanskrit Ramayan by:</Text>
          <Text style={styles.li}>• Devotional emphasis over purely narrative approach</Text>
          <Text style={styles.li}>• Accessibility through vernacular language</Text>
          <Text style={styles.li}>• Emotional connection between devotee and deity</Text>
          <Text style={styles.li}>• Musical composition suitable for congregational singing</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['puranas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Puranas - Mythological Treasures</Text>
          <Text style={styles.p}>
            The Puranas, composed starting from around 300 CE, contain extensive mythologies and are central to distributing common themes of Hinduism through vivid narratives. These eighteen major texts and eighteen sub-puranas, traditionally attributed to Sage Vyasa, include:
          </Text>
          <Text style={styles.h3}>Major Puranas:</Text>
          <Text style={styles.li}>• Bhagavata Purana - Stories of Vishnu's incarnations, especially Krishna</Text>
          <Text style={styles.li}>• Shiva Purana - Tales and teachings related to Lord Shiva</Text>
          <Text style={styles.li}>• Devi Bhagavata Purana - Stories of the Divine Mother</Text>
          <Text style={styles.li}>• Vishnu Purana - Comprehensive account of Vishnu's manifestations</Text>
          <Text style={styles.p}>
            The Puranas generally emphasize valued Hindu morals through stories about Hindu deities fighting to uphold these principles. They serve as accessible repositories of complex philosophical concepts presented through engaging narratives.[1]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['additional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Additional Sacred Literature</Text>
          <Text style={styles.h3}>The Upanishads - Philosophical Wisdom</Text>
          <Text style={styles.p}>The Upanishads form the concluding portion of the Vedas and contain profound philosophical discussions on the nature of reality, consciousness, and liberation. These texts explore concepts like Brahman (ultimate reality), Atman (individual soul), and moksha (liberation).</Text>
          <Text style={styles.h3}>The Agamas - Tantric Literature</Text>
          <Text style={styles.p}>The Agamas represent a collection of Tantric literature and scriptures from various Hindu schools. The term means "tradition" or "that which has come down," and these texts cover philosophical doctrines, meditation practices, deity worship, and temple construction.[1]</Text>
          <Text style={styles.h3}>Regional and Sectarian Texts</Text>
          <Text style={styles.p}>Hindu literature also includes numerous regional works and sectarian texts that preserve local traditions while maintaining connection to the broader Hindu philosophical framework.</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Cultural and Spiritual Significance</Text>
          <Text style={styles.h3}>Living Traditions</Text>
          <Text style={styles.p}>These sacred texts remain living documents that continue to influence contemporary Hindu practice and thought. They are not merely historical artifacts but active guides for:</Text>
          <Text style={styles.li}>• Daily spiritual practice through prayer, meditation, and study</Text>
          <Text style={styles.li}>• Moral guidance in ethical decision-making</Text>
          <Text style={styles.li}>• Cultural identity preservation across diverse communities</Text>
          <Text style={styles.li}>• Philosophical exploration of life's fundamental questions</Text>
          <Text style={styles.h3}>Universal Themes</Text>
          <Text style={styles.p}>The Hindu holy books address universal human concerns:</Text>
          <Text style={styles.li}>• The struggle between good and evil</Text>
          <Text style={styles.li}>• The nature of duty and responsibility</Text>
          <Text style={styles.li}>• The quest for meaning and purpose</Text>
          <Text style={styles.li}>• The relationship between individual and cosmic consciousness</Text>
          <Text style={styles.li}>• The path to spiritual liberation and fulfillment</Text>
          <Text style={styles.h3}>Educational and Literary Value</Text>
          <Text style={styles.p}>Beyond their religious significance, these texts represent:</Text>
          <Text style={styles.li}>• Literary masterpieces showcasing sophisticated narrative techniques</Text>
          <Text style={styles.li}>• Historical documents preserving ancient Indian culture and values</Text>
          <Text style={styles.li}>• Philosophical treatises exploring complex metaphysical concepts</Text>
          <Text style={styles.li}>• Psychological insights into human nature and behavior</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['modern'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Modern Relevance and Global Impact</Text>
          <Text style={styles.h3}>Contemporary Application</Text>
          <Text style={styles.p}>The teachings of these holy books continue to offer guidance for modern challenges:</Text>
          <Text style={styles.li}>• Leadership principles from Rama's ideal kingship</Text>
          <Text style={styles.li}>• Conflict resolution through Krishna's diplomatic wisdom</Text>
          <Text style={styles.li}>• Work-life balance through the Gita's concept of detached action</Text>
          <Text style={styles.li}>• Environmental consciousness reflected in Vedic reverence for nature</Text>
          <Text style={styles.h3}>Global Influence</Text>
          <Text style={styles.p}>Hindu sacred literature has influenced thinkers, writers, and spiritual seekers worldwide, contributing to:</Text>
          <Text style={styles.li}>• Comparative philosophy and religious studies</Text>
          <Text style={styles.li}>• Literary traditions in various cultures</Text>
          <Text style={styles.li}>• Spiritual movements emphasizing meditation and inner transformation</Text>
          <Text style={styles.li}>• Ethical frameworks for personal and social conduct</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Conclusion: The Eternal Wisdom</Text>
          <Text style={styles.p}>The Hindu holy books collectively represent humanity's most comprehensive exploration of spiritual wisdom, ethical conduct, and the quest for ultimate truth. From the cosmic hymns of the Vedas to the intimate devotional poetry of the Ramcharitmanas, these texts offer multiple paths to understanding the divine and achieving human fulfillment.</Text>
          <Text style={styles.p}>For millions of Hindus, these are not just ancient scriptures but living guides that continue to illuminate the path toward truth, righteousness, and liberation. Their enduring relevance lies in their ability to address the eternal questions of human existence while providing practical guidance for navigating life's complexities with wisdom, compassion, and spiritual insight.</Text>
          <Text style={styles.p}>These sacred texts stand as testament to the profound spiritual achievements of ancient India and continue to serve as beacons of wisdom for seekers across the globe, regardless of their cultural or religious background. Their universal messages of duty, devotion, and the ultimate unity of all existence remain as relevant today as they were thousands of years ago.</Text>
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