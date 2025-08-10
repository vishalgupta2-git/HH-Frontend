import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = { headerShown: false };

export default function GodsAndGodessesScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const sections = [
    { key: 'foundation', title: 'The Divine Foundation' },
    { key: 'trimurti', title: 'The Trimurti: The Core Trinity' },
    { key: 'feminine', title: 'The Divine Feminine: Major Goddesses and Shakti' },
    { key: 'regional', title: 'Regional and Specialized Goddesses' },
    { key: 'popular', title: 'Beloved Popular Deities' },
    { key: 'vedic', title: 'Vedic Solar and Cosmic Deities' },
    { key: 'secondary', title: 'Important Secondary Deities' },
    { key: 'shakti', title: 'The Concept of Shakti' },
    { key: 'couples', title: 'Divine Couples and Their Significance' },
    { key: 'cultural', title: 'Cultural and Spiritual Significance' },
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
          if (context.pageId === 'gods-and-godesses' && context.query) {
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

  const handleSelect = (key: string, title: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      // Reset dropdown label after navigating
      setDropdownLabel('Topic');
    });
  };

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search deities, aspects, stories..."
        enableSpiritualSearch={true}
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
                    <TouchableOpacity key={s.key} style={styles.dropdownItem} onPress={() => handleSelect(s.key, s.title)}>
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
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.card}>
          <Text style={styles.h1}>Hidu Gods & Goddesses</Text>
          <HighlightedText 
            text="This complete guide combines all the divine deities from Hindu mythology, presenting both the major pantheon and the extensive array of specialized gods and goddesses that form the rich tapestry of Hindu theology, with enhanced focus on the divine feminine aspect."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['foundation'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.h2}>The Divine Foundation</Text>
          <HighlightedText 
            text="Hindu mythology presents one of the world's most diverse pantheons, where deities serve as accessible manifestations of the ultimate reality called Brahman. The tradition places equal importance on both masculine and feminine divine aspects, recognizing that cosmic balance requires both energies. Followers can approach divinity through multiple paths - polytheistic, pantheistic, monotheistic, monistic, or even agnostic worship."
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['trimurti'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Trimurti Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/brahma.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Vishnu.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Shiva.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>The Trimurti: The Core Trinity</Text>
          <Text style={styles.h3}>Brahma - The Creator</Text>
          <Text style={styles.p}>
            Lord Brahma creates the universe and all life forms, depicted with four heads representing the four Vedas and four arms. Despite his fundamental role, he receives limited worship today.
          </Text>
          <Text style={styles.h3}>Vishnu - The Preserver</Text>
          <Text style={styles.p}>
            Lord Vishnu maintains cosmic order and dharma, incarnating on Earth as Rama and Krishna when chaos threatens universal balance. He appears with blue skin, four arms, holding a conch, discus, lotus, and mace.
          </Text>
          <Text style={styles.h3}>Shiva - The Destroyer and Transformer</Text>
          <Text style={styles.p}>
            Lord Shiva embodies destruction necessary for regeneration, depicted with a third eye, crescent moon, and snake around his neck. His destruction enables new creation and cosmic renewal.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['feminine'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Divine Feminine Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Lakshmi.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Saraswati.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Parvati.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Durga.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Kali.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Sita.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Radha.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>The Divine Feminine: Major Goddesses and Shakti</Text>
          <Text style={styles.h3}>Lakshmi - Goddess of Wealth and Prosperity</Text>
          <Text style={styles.p}>
            Goddess Lakshmi, Vishnu's consort, embodies wealth and good fortune. She emerged from the Ocean of Milk and is particularly worshipped during Diwali. Lakshmi is typically depicted sitting or standing on a lotus, carrying a lotus in one or two hands, symbolizing purity and prosperity regardless of circumstances.
          </Text>
          <Text style={styles.h3}>Saraswati - Goddess of Knowledge and Arts</Text>
          <Text style={styles.p}>
            Goddess Saraswati governs wisdom, knowledge, and creative arts. Depicted on a white swan holding a veena, she inspires scholars, musicians, and artists. As Brahma's consort, she represents the creative force behind knowledge and learning.
          </Text>
          <Text style={styles.h3}>Parvati - The Divine Mother</Text>
          <Text style={styles.p}>
            Goddess Parvati, Shiva's consort, represents the gentle, nurturing aspect of the divine feminine. She is the universal mother figure and takes many forms including Durga and Kali. Parvati embodies love, fertility, devotion, and divine strength.
          </Text>
          <Text style={styles.h3}>Durga - The Warrior Goddess</Text>
          <Text style={styles.p}>
            Goddess Durga represents fierce divine protection against evil forces. She rides a lion or tiger and carries multiple weapons given by various gods. Durga emerged to defeat the buffalo demon Mahishasura, symbolizing the triumph of good over evil. She is especially revered during Navratri festivals.
          </Text>
          <Text style={styles.h3}>Kali - The Fierce Destroyer of Evil</Text>
          <Text style={styles.p}>
            Goddess Kali, born from Durga's forehead during battle, embodies time, change, and transformative power. Depicted with dark blue or black skin, wearing a skirt of severed arms and a necklace of heads, she represents the fierce aspect of time that devours everything. Despite her fearsome appearance, Kali is deeply loved as a protective mother figure.
          </Text>
          <Text style={styles.h3}>Sita - Goddess of Virtue and Devotion</Text>
          <Text style={styles.p}>
            Goddess Sita, Rama's wife and Lakshmi's incarnation, represents ideal womanhood, purity, and unwavering devotion. Her life story in the Ramayana exemplifies strength through adversity and moral righteousness.
          </Text>
          <Text style={styles.h3}>Radha - Goddess of Divine Love</Text>
          <Text style={styles.p}>
            Goddess Radha, Krishna's beloved, represents pure, selfless divine love (bhakti). She embodies the soul's longing for union with the divine and is worshipped alongside Krishna as the epitome of devotional love.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['regional'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Regional Goddesses Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Ganga.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Yamuna.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Annapurna.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Bhumi.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Chandi.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Ambika.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Gayatri.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Bagalamukhi.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Bhuvaneshwari.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>Regional and Specialized Goddesses</Text>
          <Text style={styles.h3}>Ganga - River Goddess</Text>
          <Text style={styles.p}>
            Goddess Ganga is the personification of the sacred Ganges River. She descended from heaven to purify the earth and is depicted as a beautiful woman riding a crocodile or standing on a lotus. Ganga represents purification, salvation, and the life-giving force of water.
          </Text>
          <Text style={styles.h3}>Yamuna - Sacred River Goddess</Text>
          <Text style={styles.p}>
            Goddess Yamuna, sister of Yama (god of death), is the divine personification of the Yamuna River. She is particularly associated with Krishna's childhood and represents the purifying power of sacred waters.
          </Text>
          <Text style={styles.h3}>Annapurna - Goddess of Food and Nourishment</Text>
          <Text style={styles.p}>
            Goddess Annapurna is the divine provider of food and nourishment. Depicted holding a jeweled vessel containing food, she ensures that no devotee goes hungry. She represents the nurturing aspect of the divine mother who feeds all beings.
          </Text>
          <Text style={styles.h3}>Bhumi Devi - Earth Goddess</Text>
          <Text style={styles.p}>
            Goddess Bhumi Devi (or Prithvi) personifies Mother Earth. She represents fertility, abundance, and the nurturing ground that supports all life. Often depicted as a woman emerging from or standing on the earth, holding vegetation.
          </Text>
          <Text style={styles.h3}>Chandi - The Fierce Protector</Text>
          <Text style={styles.p}>
            Goddess Chandi is a fierce form of Durga who manifests during times of great evil. She represents divine wrath against injustice and is invoked for protection against negative forces. Her worship is particularly prominent in Bengal and Assam.
          </Text>
          <Text style={styles.h3}>Ambika - The Divine Mother</Text>
          <Text style={styles.p}>
            Goddess Ambika is another name for the great mother goddess, representing the source of all creation. She encompasses all feminine divine qualities and is considered the primordial mother of the universe.
          </Text>
          <Text style={styles.h3}>Gayatri - Goddess of Sacred Sound</Text>
          <Text style={styles.p}>
            Goddess Gayatri personifies the most sacred Vedic mantra. She represents divine knowledge, spiritual enlightenment, and the power of sacred sound. Depicted with five heads representing the five elements, she is the mother of the Vedas.
          </Text>
          <Text style={styles.h3}>Bagalamukhi - The Goddess Who Paralyzes Enemies</Text>
          <Text style={styles.p}>
            Goddess Bagalamukhi is one of the ten Mahavidyas (great wisdom goddesses) who represents the power to control and paralyze enemies. She is depicted holding the tongue of a demon, symbolizing control over negative speech and harmful forces.
          </Text>

          <Text style={styles.h3}>Bhuvaneshwari - Goddess of the Universe</Text>
          <Text style={styles.p}>
            Goddess Bhuvaneshwari represents the divine mother as the ruler of the universe. She embodies the cosmic creative power and is depicted sitting on a lotus, symbolizing her role as the supreme creatrix of all worlds.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['popular'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Popular Deities Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Ganesha.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Krishna.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Hanuman.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>Beloved Popular Deities</Text>
          <Text style={styles.h3}>Ganesha - The Remover of Obstacles</Text>
          <Text style={styles.p}>
            Lord Ganesha, the elephant-headed deity, removes obstacles and brings success to new ventures. He represents wisdom, intellect, and auspicious beginnings.
          </Text>
          <Text style={styles.h3}>Krishna - The Divine Cowherd</Text>
          <Text style={styles.p}>
            Lord Krishna, Vishnu's eighth incarnation, remains one of India's most beloved divinities through his stories of divine love, wisdom, and heroic deeds.
          </Text>
          <Text style={styles.h3}>Hanuman - The Devoted Monkey God</Text>
          <Text style={styles.p}>
            Lord Hanuman embodies devotion, strength, and service. As Rama's greatest devotee, he symbolizes unwavering faith and is widely worshipped for protection and courage.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['vedic'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Vedic Deities Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Surya.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/IndraDev.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/AgniDev.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/VayuDev.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/VarunDev.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>Vedic Solar and Cosmic Deities</Text>
          <Text style={styles.h3}>Surya - The Sun God</Text>
          <Text style={styles.p}>
            Lord Surya represents solar energy and cosmic consciousness. He is traditionally depicted as a strong and radiant man riding a golden chariot pulled by seven horses, symbolizing the seven days of the week and the colors of the rainbow.
          </Text>
          <Text style={styles.h3}>Indra - King of Gods</Text>
          <Text style={styles.p}>
            Lord Indra rules heaven and governs weather, storms, and warfare, wielding the thunderbolt Vajra as king of the gods. In temple sculptures, Indra is depicted in human form with four arms, riding the celestial elephant Airavata.
          </Text>
          <Text style={styles.h3}>Agni - God of Fire</Text>
          <Text style={styles.p}>
            Lord Agni serves as the divine fire god and messenger between humans and gods, carrying offerings through sacred sacrificial fires.
          </Text>
          <Text style={styles.h3}>Vayu - Wind God</Text>
          <Text style={styles.p}>
            Lord Vayu controls air and wind, representing life force (prana). Father of Hanuman and Bhima, he appears prominently in epic literature.
          </Text>
          <Text style={styles.h3}>Varuna - Lord of Waters</Text>
          <Text style={styles.p}>
            Lord Varuna governs oceans, rivers, and rain while overseeing cosmic order and moral law. He is depicted riding on a crocodile or in a chariot drawn by seven swans.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['secondary'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Secondary Deities Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Kuber.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Kartikeya.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Kamadeva.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Dhanvantari.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Vishvakarma.jpg')} 
                style={styles.sectionImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>

          <Text style={styles.h2}>Important Secondary Deities</Text>
          <Text style={styles.h3}>Kubera - God of Wealth</Text>
          <Text style={styles.p}>
            Lord Kubera serves as divine treasurer and keeper of wealth. He is typically depicted as a dwarf with a stout body, adorned with jewels, maintaining cosmic prosperity.
          </Text>
          <Text style={styles.h3}>Kartikeya/Skanda - Divine Commander</Text>
          <Text style={styles.p}>
            Lord Kartikeya (Murugan in South India) commands the gods' armies as Shiva's son, representing youth, valor, and spiritual warrior energy.
          </Text>
          <Text style={styles.h3}>Kamadeva - God of Love</Text>
          <Text style={styles.p}>
            Lord Kamadeva governs love and desire with his sugarcane bow and flower arrows, representing the creative force driving cosmic creation.
          </Text>
          <Text style={styles.h3}>Dhanvantari - Divine Physician</Text>
          <Text style={styles.p}>
            Lord Dhanvantari, an incarnation of Vishnu, governs Ayurvedic medicine and emerged from the ocean carrying immortality's nectar.
          </Text>
          <Text style={styles.h3}>Vishvakarma - Divine Architect</Text>
          <Text style={styles.p}>
            Lord Vishvakarma serves as master craftsman of the gods, designing celestial palaces, divine weapons, and cosmic infrastructure.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['shakti'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.h2}>The Concept of Shakti</Text>
          <Text style={styles.p}>
            In Hindu philosophy, Shakti represents the divine feminine creative power that animates the universe. Every male deity is believed to have a female counterpart (Shakti) without whom he remains inactive. This principle emphasizes that:
          </Text>
          <Text style={styles.li}>• Creation requires both masculine and feminine principles</Text>
          <Text style={styles.li}>• The goddess is not subordinate but equal to her male counterpart</Text>
          <Text style={styles.li}>• Feminine energy is the active, dynamic force while masculine energy provides structure</Text>
          <Text style={styles.li}>• The ultimate reality encompasses both aspects in perfect balance</Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['couples'] = e.nativeEvent.layout.y;
          }}
        >
          {/* Divine Couples Image Slider */}
          <View style={styles.imageSliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageSliderContent}
            >
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Shiv-Parvati.jpg')} 
                style={styles.coupleImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Vishnu-Lakshmi.jpg')} 
                style={styles.coupleImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Rama-Sita.jpg')} 
                style={styles.coupleImage} 
                resizeMode="contain"
              />
              <Image 
                source={require('@/assets/images/GodsandGoddessesImages/Radha_Krishna_at_Iskcon_Vrindavan.jpg')} 
                style={styles.coupleImage} 
                resizeMode="contain"
              />
            </ScrollView>
          </View>
          
          <Text style={styles.h2}>Divine Couples and Their Significance</Text>
          <Text style={styles.p}>
            Divine couples in Hinduism represent the perfect balance of masculine and feminine energies, each embodying complementary aspects of the divine:
          </Text>
          <Text style={styles.li}>• Shiva-Parvati: Consciousness and creative energy</Text>
          <Text style={styles.li}>• Vishnu-Lakshmi: Preservation and prosperity</Text>
          <Text style={styles.li}>• Rama-Sita: Dharma and virtue</Text>
          <Text style={styles.li}>• Krishna-Radha: Divine love and devotion</Text>
          <Text style={styles.p}>
            These divine unions symbolize the fundamental principle that creation and cosmic order require both masculine and feminine principles working in harmony.
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['cultural'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.h2}>Cultural and Spiritual Significance</Text>
          <Text style={styles.p}>These deities collectively represent:</Text>
          <Text style={styles.li}>• Moral and ethical guidance through divine examples</Text>
          <Text style={styles.li}>• Cosmic process explanations of creation, preservation, and destruction</Text>
          <Text style={styles.li}>• Spiritual guidance for daily life challenges</Text>
          <Text style={styles.li}>• Universal themes of dharma, karma, and cyclical existence</Text>
          <Text style={styles.li}>• Gender balance recognizing both masculine and feminine divine aspects</Text>
          <Text style={styles.p}>
            Each deity offers specific qualities and powers that devotees invoke for different life situations - whether seeking Saraswati's wisdom, Lakshmi's prosperity, Durga's protection, or Ganesha's obstacle removal.
          </Text>
          <Text style={styles.p}>
            This vast pantheon reflects Hinduism's fundamental belief in unity underlying diversity - that one ultimate reality manifests in countless forms to meet humanity's varied spiritual needs. The inclusion of powerful goddesses demonstrates the religion's recognition that divine feminine energy is equally important and powerful as masculine energy, creating one of the world's most comprehensive and balanced theological systems.
          </Text>
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
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardPlain: {
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

  imageSliderContainer: {
    marginBottom: 16,
  },
  imageSliderContent: {
    paddingHorizontal: 8,
  },
        coupleImage: {
        height: 150,
        width: 100,
        borderRadius: 8,
        marginHorizontal: 4,
      },
      sectionImage: {
        height: 150,
        width: 100,
        borderRadius: 8,
        marginHorizontal: 4,
      },
});

