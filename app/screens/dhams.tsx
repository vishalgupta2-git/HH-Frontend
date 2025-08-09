import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

export const options = { headerShown: false };

export default function DhamsScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});

  const sections = [
    { key: 'foundation', title: 'The Divine Foundation' },
    { key: 'charDham', title: 'The Char Dham: Four Sacred Abodes and Their Yatras' },
    { key: 'badaCharDham', title: 'Bada Char Dham - The Primary Four Dhams' },
    { key: 'chotaCharDham', title: 'Chota Char Dham - The Himalayan Circuit' },
    { key: 'majorYatras', title: 'Major Hindu Yatras (Pilgrimages)' },
    { key: 'jyotirlinga', title: 'The Twelve Jyotirlingas Yatra' },
    { key: 'shaktiPeetha', title: 'The Shakti Peetha Yatra' },
    { key: 'regional', title: 'Regional Sacred Circuits' },
    { key: 'seasonal', title: 'Seasonal and Festival Yatras' },
    { key: 'spiritual', title: 'Spiritual Significance and Benefits' },
    { key: 'cultural', title: 'Cultural and Religious Impact' },
    { key: 'references', title: 'References' },
  ];

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://www.pilgrimpackages.com/blog/8-most-important-hindu-pilgrimage-circuits-in-india.html' },
    { id: 2, url: 'https://templemate.com/popular-yatras/' },
    { id: 3, url: 'https://www.namasteindiatrip.org/famous-hindu-yatras/' },
    { id: 4, url: 'https://www.treksandtrails.org/blog/top-8-hindu-pilgrimage-sites-in-india/' },
    { id: 5, url: 'http://cpreecenvis.nic.in/Database/FamousHinduYatras_2234.aspx' },
    { id: 6, url: 'https://en.wikipedia.org/wiki/Yatra' },
    { id: 7, url: 'https://www.nativeplanet.com/travel-guide/7-most-popular-yatras-made-in-india-004091.html' },
    { id: 8, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites_in_India' },
    { id: 9, url: 'https://tripcosmos.co/hindu-pilgrimage-tour-across-india/' },
    { id: 10, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites' },
    { id: 11, url: 'https://www.yatra.com/travelideas/12-most-visited-pilgrimage-places-in-india' },
    { id: 12, url: 'https://vajiramandravi.com/upsc-exam/pilgrimage-sites-in-india/' },
    { id: 13, url: 'https://www.tourmyindia.com/pilgrimage/hindu-pilgrimage-tour.html' },
    { id: 14, url: 'https://www.holidify.com/collections/temples-of-india' },
    { id: 15, url: 'https://iskconeducationalservices.org/HoH/practice/pilgrimage/important-places-of-pilgrimage/' },
    { id: 16, url: 'https://www.hidmc.com/blog-posts/top-hindu-pilgrimages-in-india-a-spiritual-journey' },
    { id: 17, url: 'https://www.triptotemples.com/blogs/bada-char-dham/a-guide-to-bada-char-dham-tirth-yatra' },
    { id: 18, url: 'https://www.trawell.in/india/pilgrimages' },
    { id: 19, url: 'https://www.makemytrip.com/tripideas/pilgrimage-destinations' },
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

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search Dhams, yatras, circuits..."
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
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop}>
          <Text style={styles.h1}>Dhams & Yatras</Text>
          <Text style={styles.p}>
            This complete guide combines all the divine deities from Hindu mythology, presenting both the major pantheon and the extensive array of specialized gods and goddesses that form the rich tapestry of Hindu theology, with enhanced focus on the divine feminine aspect, now expanded to include the most important yatras (pilgrimages) that connect devotees to these sacred sites.
          </Text>
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

        <View style={styles.card} onLayout={(e) => (sectionY.current['majorYatras'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Major Hindu Yatras (Pilgrimages)</Text>

          <Text style={styles.h3}>Amarnath Yatra - The Sacred Ice Lingam Pilgrimage</Text>
          <Text style={styles.p}>
            The Amarnath Yatra is one of the most challenging and revered pilgrimages in Hinduism. Located in Jammu and Kashmir, the Amarnath Cave is dedicated to Lord Shiva. Every year, an ice Shiva Lingam forms naturally inside the cave, along with two other ice formations representing Ganesha and Mother Parvati. The main Shiva lingam waxes and wanes with the phases of the moon, reaching its peak during summer. Over 600,000 devotees visit during the season, undertaking a physically demanding 5-day journey on foot from Srinagar or Pahalgam.[5][3]
          </Text>

          <Text style={styles.h3}>Jagannath Rath Yatra - The Festival of Chariots</Text>
          <Text style={styles.p}>
            The Puri Rath Yatra is one of the oldest and most spectacular chariot festivals in India. The elaborately decorated chariots carry the idols of Lord Jagannath (Krishna), Lord Balabhadra, and Goddess Subhadra from the main Jagannath Temple to the Gundicha Temple. This ten-day festival commemorates Jagannath's annual visit to his aunt's temple. Thousands of devotees participate in pulling the massive chariots with ropes, believing this act to be extremely auspicious. This is the only day when non-Hindus and foreigners, normally restricted from the temple premises, can have darshan (sight) of the deities.[6][7]
          </Text>

          <Text style={styles.h3}>Kashi Yatra - The Ultimate Sacred Journey</Text>
          <Text style={styles.p}>
            Kashi Yatra to Varanasi is considered "the greatest of all yatras". This comprehensive pilgrimage traditionally involves multiple sacred acts: taking a holy dip in the Ganges, performing Saikatha pooja at Rameswaram, collecting sand to immerse in the Holy Ganga at Triveni Sangam (where Ganga, Yamuna, and Saraswati rivers meet), visiting Kashi Vishwanath Temple for darshan, and collecting Ganga water to perform abhisheka to Lord Ramanathaswamy at Rameswaram. Pilgrims also visit Gaya to perform Shraddha rituals for their ancestors.[5][2]
          </Text>

          <Text style={styles.h3}>Vaishno Devi Yatra - The Divine Mother's Call</Text>
          <Text style={styles.p}>
            The Vaishno Devi Yatra in Jammu and Kashmir is one of India's most popular pilgrimages. Millions of devotees trek to the sacred cave shrine of Mata Vaishno Devi, believed to fulfill the wishes of sincere devotees. The journey involves a trek through mountainous terrain to reach the holy cave where the goddess is worshipped in the form of three natural rock formations (pindies).[3]
          </Text>

          <Text style={styles.h3}>Kailash Mansarovar Yatra - The Ultimate Shiva Pilgrimage</Text>
          <Text style={styles.p}>
            The Kailash Mansarovar Yatra is considered the most sacred and challenging pilgrimage for devotees of Lord Shiva. Mount Kailash in Tibet is believed to be Shiva's heavenly abode, while Lake Mansarovar is considered the most sacred lake. This high-altitude pilgrimage requires significant physical preparation and is considered the ultimate spiritual journey for Shiva devotees.[3]
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['jyotirlinga'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Twelve Jyotirlingas Yatra: Shiva's Sacred Light Circuit</Text>
          <Text style={styles.p}>
            The Dwadasha Jyotirlinga Yatra involves visiting all twelve sacred Shiva temples where the deity manifests as infinite pillars of light. This comprehensive pilgrimage circuit includes:[2]
          </Text>
          <Text style={styles.li}>1. Somnath (Gujarat) - The first Jyotirlinga on the western coast</Text>
          <Text style={styles.li}>2. Mallikarjuna (Andhra Pradesh) - Located in Srisailam</Text>
          <Text style={styles.li}>3. Mahakaleshwar (Madhya Pradesh) - Famous for its Bhasma Aarti in Ujjain</Text>
          <Text style={styles.li}>4. Omkareshwar (Madhya Pradesh) - Situated on Mandhata Island in the Narmada River</Text>
          <Text style={styles.li}>5. Kedarnath (Uttarakhand) - High in the Himalayas</Text>
          <Text style={styles.li}>6. Bhimashankar (Maharashtra) - In the Sahyadri range</Text>
          <Text style={styles.li}>7. Kashi Vishwanath (Uttar Pradesh) - In sacred Varanasi</Text>
          <Text style={styles.li}>8. Trimbakeshwar (Maharashtra) - Important pilgrimage destination</Text>
          <Text style={styles.li}>9. Vaidyanath (Jharkhand) - Sacred healing shrine</Text>
          <Text style={styles.li}>10. Nageshwar (Gujarat) - Divine serpent temple</Text>
          <Text style={styles.li}>11. Rameshwaram (Tamil Nadu) - Also part of the Char Dham circuit</Text>
          <Text style={styles.li}>12. Grishneshwar (Maharashtra) - The final Jyotirlinga</Text>
          <Text style={styles.p}>Completing this yatra is believed to bring divine blessings and fulfillment of wishes.[2]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['shaktiPeetha'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>The Shakti Peetha Yatra: Divine Feminine Energy Circuit</Text>
          <Text style={styles.p}>
            The Ashtadasha Shakti Peeth Yatra involves visiting eighteen primary sites among the fifty-one Shakti Peethas. These sacred locations mark where parts of Goddess Sati's body fell, making them powerful centers of divine feminine energy. The pilgrimage is considered one of the most important for devotees of Goddess Shakti, believed to grant blessings, prosperity, and liberation.[2]
          </Text>
          <Text style={styles.h3}>Key Shakti Peethas Include:</Text>
          <Text style={styles.li}>• Kamakhya Temple (Assam) - One of the most powerful Shakti centers</Text>
          <Text style={styles.li}>• Kalighat Kali Temple (Kolkata) - Famous for Kali worship</Text>
          <Text style={styles.li}>• Vaishno Devi (Jammu & Kashmir) - Popular mother goddess shrine</Text>
          <Text style={styles.li}>• Jwalamukhi (Himachal Pradesh) - Where the goddess manifests as eternal flame</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['regional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Regional Sacred Circuits</Text>
          <Text style={styles.h3}>Sapta Puri Yatra - The Seven Sacred Cities</Text>
          <Text style={styles.p}>The Sapta Puri circuit involves visiting seven holy cities particularly significant for achieving moksha:[8]</Text>
          <Text style={styles.li}>• Ayodhya (Uttar Pradesh) - Lord Rama's birthplace</Text>
          <Text style={styles.li}>• Mathura (Uttar Pradesh) - Lord Krishna's birthplace</Text>
          <Text style={styles.li}>• Haridwar (Uttarakhand) - Gateway to the gods</Text>
          <Text style={styles.li}>• Varanasi (Uttar Pradesh) - The eternal city</Text>
          <Text style={styles.li}>• Kanchipuram (Tamil Nadu) - Temple city of South India</Text>
          <Text style={styles.li}>• Ujjain (Madhya Pradesh) - Ancient spiritual center</Text>
          <Text style={styles.li}>• Dwarka (Gujarat) - Krishna's kingdom</Text>

          <Text style={styles.h3}>Panch Kedar Yatra - Five Forms of Shiva</Text>
          <Text style={styles.p}>The Panch Kedar Yatra in Uttarakhand involves visiting five temples where different parts of Lord Shiva are worshipped:</Text>
          <Text style={styles.li}>• Kedarnath - The hump (most famous)</Text>
          <Text style={styles.li}>• Tungnath - The arms</Text>
          <Text style={styles.li}>• Rudranath - The face</Text>
          <Text style={styles.li}>• Madhyamaheshwar - The belly</Text>
          <Text style={styles.li}>• Kalpeshwar - The hair</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['seasonal'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Seasonal and Festival Yatras</Text>
          <Text style={styles.h3}>Kumbh Mela - The Grand Gathering</Text>
          <Text style={styles.p}>The Kumbh Mela is the largest religious gathering in the world, rotating between four sacred cities every twelve years:[8]</Text>
          <Text style={styles.li}>• Prayagraj (Uttar Pradesh) - At the confluence of three holy rivers</Text>
          <Text style={styles.li}>• Haridwar (Uttarakhand) - Where Ganga enters the plains</Text>
          <Text style={styles.li}>• Ujjain (Madhya Pradesh) - On the banks of Shipra River</Text>
          <Text style={styles.li}>• Nashik (Maharashtra) - On the banks of Godavari River</Text>

          <Text style={styles.h3}>Specialized Regional Yatras</Text>
          <Text style={styles.h4}>Tirupati Balaji Yatra</Text>
          <Text style={styles.p}>Tirupati in Andhra Pradesh houses one of India's most visited temples, dedicated to Lord Venkateswara (Vishnu). The temple receives millions of pilgrims annually and is famous for its elaborate rituals and darshan procedures.[4]</Text>
          <Text style={styles.h4}>Shirdi Sai Baba Yatra</Text>
          <Text style={styles.p}>Shirdi in Maharashtra attracts devotees of Sai Baba, considered a saint who transcended religious boundaries. The pilgrimage represents faith beyond traditional Hindu boundaries.[8]</Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
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