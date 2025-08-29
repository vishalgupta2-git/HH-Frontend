import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const mantras = [
  {
    sanskrit: "ॐ गं गणपतये नमः",
    english: "Om Gam Ganapataye Namah",
    deity: "Vighnaharta Ganesh",
    reference: "Ganesh Mantra",
    meaning: "Removes obstacles and blesses with wisdom and success."
  },
  {
    sanskrit: "ॐ नमः शिवाय",
    english: "Om Namah Shivaya",
    deity: "Mahadev Shiv Ji",
    reference: "Panchakshari Shiva Mantra",
    meaning: "Invokes Shiva for inner peace, liberation, and destruction of ego."
  },
  {
    sanskrit: "ॐ दुं दुर्गायै नमः",
    english: "Om Dum Durgaye Namah",
    deity: "Durga Maa",
    reference: "Durga Beej Mantra",
    meaning: "Protection from evil forces and grant of courage."
  },
  {
    sanskrit: "ॐ श्रीं महालक्ष्म्यै नमः",
    english: "Om Shreem Mahalakshmyai Namah",
    deity: "Lakshmi Maa",
    reference: "Lakshmi Beej Mantra",
    meaning: "Blessings of wealth, prosperity, and fortune."
  },
  {
    sanskrit: "ॐ हं हनुमते नमः",
    english: "Om Han Hanumate Namah",
    deity: "Mahaveer Hanuman",
    reference: "Hanuman Mantra",
    meaning: "Grants strength, fearlessness, and protection."
  },
  {
    sanskrit: "श्री राम जय राम जय जय राम",
    english: "Shri Ram Jai Ram Jai Jai Ram",
    deity: "Shri Ram",
    reference: "Rama Mantra",
    meaning: "Devotional mantra for peace, righteousness, and bhakti."
  },
  {
    sanskrit: "ॐ नमो भगवते वासुदेवाय",
    english: "Om Namo Bhagavate Vasudevaya",
    deity: "Shri Krishna",
    reference: "Krishna Moksha Mantra",
    meaning: "Surrender to Lord Krishna, seeking liberation and divine love."
  },
  {
    sanskrit: "ॐ बालकृष्णाय नमः",
    english: "Om Balakrishnaya Namah",
    deity: "Bal Gopal",
    reference: "Krishna child form mantra",
    meaning: "Invokes innocence, joy, and divine blessings of child Krishna."
  },
  {
    sanskrit: "ॐ क्रीं कालीकायै नमः",
    english: "Om Kreem Kalikayai Namah",
    deity: "Maa Kali",
    reference: "Kali Beej Mantra",
    meaning: "Protection from negativity, destroys ego, grants spiritual strength."
  },
  {
    sanskrit: "ॐ ऐं सरस्वत्यै नमः",
    english: "Om Aim Saraswatyai Namah",
    deity: "Saraswati Maa",
    reference: "Saraswati Beej Mantra",
    meaning: "Enhances wisdom, knowledge, and learning."
  },
  {
    sanskrit: "ॐ गंगे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरी जलेऽस्मिन्सन्निधिं कुरु॥",
    english: "Om Gange Cha Yamune Chaiva Godavari Saraswati, Narmade Sindhu Kaveri Jalesmin Sannidhim Kuru",
    deity: "Ganga Maiya",
    reference: "Snan Mantra",
    meaning: "Invokes sacred rivers for purification and spiritual cleansing."
  },
  {
    sanskrit: "ॐ शनैश्चराय नमः",
    english: "Om Shanaishcharaya Namah",
    deity: "Shani Dev",
    reference: "Shani Mantra",
    meaning: "Reduces malefic effects of Saturn, grants discipline and justice."
  },
  {
    sanskrit: "ॐ घृणिः सूर्याय नमः",
    english: "Om Ghrinih Suryaya Namah",
    deity: "Surya Dev",
    reference: "Surya Mantra (Sandhya Vandana)",
    meaning: "Worships the Sun for health, vitality, and energy."
  },
  {
    sanskrit: "ॐ नमो नारायणाय",
    english: "Om Namo Narayanaya",
    deity: "Tirupati Bala Ji (Lord Venkateswara)",
    reference: "Vishnu Mantra",
    meaning: "Complete surrender to Lord Vishnu for protection and salvation."
  },
  {
    sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥",
    english: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat",
    deity: "Mahadev Shiv Ji (as Tryambaka)",
    reference: "Mahamrityunjaya Mantra (Rigveda 7.59.12)",
    meaning: "Grants healing, longevity, and liberation from fear of death."
  },
  {
    sanskrit: "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः",
    english: "Om Shreem Hreem Kleem Mahalakshmyai Namah",
    deity: "Lakshmi Maa",
    reference: "Powerful Lakshmi Mantra",
    meaning: "Attracts abundance, prosperity, and fortune."
  },
  {
    sanskrit: "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
    english: "Om Aim Hreem Kleem Chamundayai Vichche",
    deity: "Durga Maa (Chamunda form)",
    reference: "Devi Kavach",
    meaning: "Protects from enemies, grants strength and victory."
  },
  {
    sanskrit: "ॐ रामदूताय विद्महे कपिराजाय धीमहि। तन्नो हनुमान् प्रचोदयात्॥",
    english: "Om Ramdutaya Vidmahe Kapirajaya Dhimahi, Tanno Hanuman Prachodayat",
    deity: "Mahaveer Hanuman",
    reference: "Hanuman Gayatri",
    meaning: "Honors Hanuman as messenger of Ram, seeking strength and wisdom."
  },
  {
    sanskrit: "ॐ नमो भगवते रुक्मिणीवल्लभाय स्वाहा",
    english: "Om Namo Bhagavate Rukminivallabhaya Swaha",
    deity: "Shri Krishna",
    reference: "Krishna Mantra (Vaishnav)",
    meaning: "Brings divine love, joy, and blessings of Krishna."
  },
  {
    sanskrit: "ॐ ऐं ह्रीं सरस्वत्यै नमः",
    english: "Om Aim Hreem Saraswatyai Namah",
    deity: "Saraswati Maa",
    reference: "Saraswati Vedic Mantra",
    meaning: "Enhances concentration, arts, wisdom, and eloquence."
  }
];

export default function MantrasScreen() {
  const router = useRouter();
  const [selectedMantra, setSelectedMantra] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shuffledMantras, setShuffledMantras] = useState<any[]>([]);

  // Fisher-Yates shuffle algorithm - keep Ganesha mantra always first
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    // Keep the first mantra (Ganesha) always on top
    const firstMantra = shuffled[0];
    const remainingMantras = shuffled.slice(1);
    
    // Shuffle only the remaining mantras
    for (let i = remainingMantras.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingMantras[i], remainingMantras[j]] = [remainingMantras[j], remainingMantras[i]];
    }
    
    return [firstMantra, ...remainingMantras];
  };

  useEffect(() => {
    setShuffledMantras(shuffleArray(mantras));
  }, []);

  const openMantraModal = (mantra: any) => {
    setSelectedMantra(mantra);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMantra(null);
  };

  const speakMantra = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'hi-IN',
      pitch: 0.8,
      rate: 0.8,
      voice: 'male'
    });
  };

  if (shuffledMantras.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Mantras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Shalokas screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Hindu Heritage</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>Mantras</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tilesContainer}>
            {shuffledMantras.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Mantras...</Text>
              </View>
            ) : (
              shuffledMantras.map((mantra, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tile}
                  onPress={() => openMantraModal(mantra)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeader}>
                    <Text style={styles.tileSanskrit} numberOfLines={2}>{mantra.sanskrit}</Text>
                    <TouchableOpacity 
                      style={styles.speakerButton}
                      onPress={() => speakMantra(mantra.sanskrit)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.speakerIcon}>▶️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tileEnglish} numberOfLines={2}>{mantra.english}</Text>
                  <Text style={styles.tileDeity}>Deity: {mantra.deity}</Text>
                  <Text style={styles.tileReference}>Reference: {mantra.reference}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Mantra Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalSpeakerButton}
                onPress={() => speakMantra(selectedMantra?.sanskrit || '')}
              >
                <Text style={styles.modalSpeakerIcon}>▶️</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSanskrit}>{selectedMantra?.sanskrit}</Text>
            <Text style={styles.modalEnglish}>{selectedMantra?.english}</Text>
            <Text style={styles.modalDeity}>Deity: {selectedMantra?.deity}</Text>
            <Text style={styles.modalReference}>Reference: {selectedMantra?.reference}</Text>
            <Text style={styles.modalMeaning}>{selectedMantra?.meaning}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8 * 1.2, // 120% size
    height: 120 * 0.8 * 1.2, // 120% size
    left: width * -0.25 * 0.8,
    bottom: 0, // Same positioning as home screen
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tilesContainer: {
    paddingVertical: 20,
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  speakerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  speakerIcon: {
    fontSize: 16,
  },
  tileSanskrit: {
    fontSize: 16,
    color: '#FF6A00',
    flex: 1,
    marginBottom: 8,
  },
  tileEnglish: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  tileDeity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tileReference: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  modalSpeakerButton: {
    padding: 8,
  },
  modalSpeakerIcon: {
    fontSize: 24,
  },
  modalSanskrit: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalEnglish: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalDeity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalReference: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMeaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});
