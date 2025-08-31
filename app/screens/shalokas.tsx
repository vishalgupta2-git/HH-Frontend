import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, SafeAreaView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const shalokas = [
  {
    id: 1,
    title: 'Shaloka 1',
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥ परित्राणाय साधूनां विनाशाय च दुष्कृताम् । धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥',
    english: 'Yadā yadā hi dharmasya glānir bhavati Bhārata, Abhyutthānam adharmasya tadātmānaṁ sṛjāmyaham. Paritrāṇāya sādhūnāṁ vināśāya cha duṣkṛitām, Dharma-saṁsthāpanārthāya sambhavāmi yuge yuge.',
    reference: 'Bhagavad Gītā 4.7–8',
    meaning: 'Whenever righteousness (dharma) declines, O Bhārata, and unrighteousness (adharma) rises, then I manifest Myself. For the protection of the good, the destruction of the wicked, and the re-establishment of dharma, I appear age after age.'
  },
  {
    id: 2,
    title: 'Shaloka 2',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    english: 'karmaṇy-evādhikāras te mā phaleṣhu kadāchana mā karma-phala-hetur bhūr mā te saṅgo \'stvakarmaṇi',
    reference: 'Bhagavad Gita 2.47',
    meaning: 'You have the right only to perform your duties, but never to the results of your actions. Do not be motivated by the fruits of action, nor give in to inaction.'
  },
  {
    id: 3,
    title: 'Shaloka 3',
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय । सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥',
    english: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya siddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate',
    reference: 'Bhagavad Gītā 2.48',
    meaning: 'Perform your duty with equanimity, O Arjuna, abandoning attachment, and being the same in success and failure. This evenness of mind is called Yoga.'
  },
  {
    id: 4,
    title: 'Shaloka 4',
    sanskrit: 'धर्मो रक्षति रक्षितः ।',
    english: 'dharmo rakṣati rakṣitaḥ',
    reference: 'Mahābhārata, Vana Parva 313.117',
    meaning: 'Dharma protects those who protect it. If you uphold Dharma, it will uphold you.'
  },
  {
    id: 5,
    title: 'Shaloka 5',
    sanskrit: 'अहिंसा परमो धर्मः ।',
    english: 'ahiṁsā paramo dharmaḥ',
    reference: 'Mahābhārata, Adi Parva 11.13',
    meaning: 'Non-violence is the highest Dharma.'
  },
  {
    id: 6,
    title: 'Shaloka 6',
    sanskrit: 'न जायते म्रियते वा कदाचि- न्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥',
    english: 'na jāyate mriyate vā kadācin nāyaṁ bhūtvā bhavitvā vā na bhūyaḥ ajo nityaḥ śāśvato \'yaṁ purāṇo na hanyate hanyamāne śarīre',
    reference: 'Bhagavad Gītā 2.20',
    meaning: 'The soul is never born, nor does it die; it has never come into being, nor will it ever cease to be. It is unborn, eternal, everlasting, and primeval; even though the body is slain, the soul is not.'
  },
  {
    id: 7,
    title: 'Shaloka 7',
    sanskrit: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि। तथा शरीराणि विहाय जीर्णा- न्यन्यानि संयाति नवानि देही॥',
    english: "vāsāṁsi jīrṇāni yathā vihāya navāni gṛhṇāti naro 'parāṇi tathā śarīrāṇi vihāya jīrṇāny anyāni saṁyāti navāni dehī",
    reference: 'Bhagavad Gita 2.22',
    meaning: 'Just as a person puts on new clothes, discarding old ones, so the soul discards worn-out bodies and takes on new ones.'
  },
  {
    id: 8,
    title: 'Shaloka 8',
    sanskrit: 'रामो विग्रहवान् धर्मः साधुः सत्यपराक्रमः। राजा सर्वस्य लोकस्य देवस्येव महात्मनः॥',
    english: 'Rāmo vigrahavān dharmaḥ sādhuḥ satyaparākramaḥ। Rājā sarvasya lokasya devasy-eva mahātmanaḥ॥',
    reference: 'Vālmīki Rāmāyaṇa, Ayodhyākāṇḍa 1.18',
    meaning: 'Rāma is described as the very embodiment of Dharma, righteous and truthful in valor, and a protector of his people like a divine being.'
  },
  {
    id: 9,
    title: 'Shaloka 9',
    sanskrit: 'सत्यं हि परमं धर्मं धर्मस्य परमो गुरुः। सत्ये नास्ति परं नास्ति पश्य धर्मं सनातनम्॥',
    english: 'Satyaṁ hi paramaṁ dharmaṁ dharmasya paramo guruḥ। Satye nāsti paraṁ nāsti paśya dharmaṁ sanātanam॥',
    reference: 'Rāmāyaṇa, Ayodhyākāṇḍa 109.11',
    meaning: 'Truth is declared as the highest form of Dharma and eternal in nature.'
  },
  {
    id: 10,
    title: 'Shaloka 10',
    sanskrit: 'पितुराज्ञा परं ब्रह्म पितुराज्ञा परं तपः। पितुराज्ञा परं सत्यं तस्मात्पितुरवस्थितः॥',
    english: 'Piturājñā paraṁ brahma piturājñā paraṁ tapaḥ। Piturājñā paraṁ satyaṁ tasmāt pituravasthitaḥ॥',
    reference: 'Rāmāyaṇa, Ayodhyākāṇḍa 19.31',
    meaning: 'Rāma declares that a father\'s command is supreme and must be followed, even above personal happiness.'
  },
  {
    id: 11,
    title: 'Shaloka 11',
    sanskrit: 'शरीरं मे भवेत् नाशः प्राणाः स्युर्वा पराभवम्। न त्वां त्यजामि रामेति सत्यं प्रतिजने मम॥',
    english: 'Sharīraṁ me bhavet nāśaḥ prāṇāḥ syurvā parābhavam। Na tvāṁ tyajāmi Rāmeti satyaṁ pratijane mama॥',
    reference: 'Rāmāyaṇa, Sundarakāṇḍa',
    meaning: 'Hanumān vows that even if his body is destroyed and his life is lost, he will never abandon Lord Rāma.'
  }
];

export default function ShalokasScreen() {
  const [selectedShaloka, setSelectedShaloka] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shuffledShalokas, setShuffledShalokas] = useState<any[]>([]);
  const router = useRouter();

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle shalokas when component mounts
  React.useEffect(() => {
    setShuffledShalokas(shuffleArray(shalokas));
  }, []);

  const openShalokaModal = (shaloka: any) => {
    setSelectedShaloka(shaloka);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedShaloka(null);
  };

  const speakShaloka = async (text: string) => {
    try {
      // Stop any currently playing speech
      Speech.stop();
      
      // Speak the Sanskrit text with male voice
      // Note: For better Sanskrit pronunciation, you might want to use
      // a specialized TTS service that supports Sanskrit
      await Speech.speak(text, {
        language: 'hi-IN', // Hindi/Devanagari script
        pitch: 0.8, // Lower pitch for male voice
        rate: 0.8, // Slightly slower for better clarity
        voice: 'male', // Try to use male voice if available
        onDone: () => console.log('Finished speaking'),
        onError: (error) => console.error('Speech error:', error),
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      // Fallback: try with default language and male pitch
      try {
        await Speech.speak(text, {
          pitch: 0.8, // Lower pitch for male voice
          rate: 0.8,
        });
      } catch (fallbackError) {
        console.error('Fallback speech also failed:', fallbackError);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Numerology screen */}
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
             <Text style={styles.screenTitle}>Shalokas</Text>
           </View>
         </View>
        
                 <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
           <View style={styles.tilesContainer}>
             {shuffledShalokas.length === 0 ? (
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>Loading Shalokas...</Text>
               </View>
             ) : (
               shuffledShalokas.map((shaloka) => (
                 <TouchableOpacity
                   key={shaloka.id}
                   style={styles.tile}
                   onPress={() => openShalokaModal(shaloka)}
                   activeOpacity={0.8}
                                >
                    <View style={styles.tileHeader}>
                      <Text style={styles.tileSanskrit} numberOfLines={2}>{shaloka.sanskrit}</Text>
                      <TouchableOpacity 
                        style={styles.speakerButton}
                        onPress={() => speakShaloka(shaloka.sanskrit)}
                        activeOpacity={0.7}
                      >
                                              <Text style={styles.speakerIcon}>▶️</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.tileEnglish} numberOfLines={2}>{shaloka.english}</Text>
                    <Text style={styles.tileReference}>{shaloka.reference}</Text>
                  </TouchableOpacity>
               ))
             )}
           </View>
         </ScrollView>
      </View>

      {/* Modal for detailed view */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
                 <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
           <View style={styles.modalContent}>
             <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
               {selectedShaloka && (
                 <View style={styles.modalInner}>
                   <View style={styles.modalHeader}>
                     <TouchableOpacity 
                       style={styles.modalSpeakerButton}
                       onPress={() => speakShaloka(selectedShaloka.sanskrit)}
                       activeOpacity={0.7}
                     >
                       <Text style={styles.modalSpeakerIcon}>▶️</Text>
                     </TouchableOpacity>
                   </View>
                   <Text style={styles.modalSanskrit}>{selectedShaloka.sanskrit}</Text>
                   <Text style={styles.modalEnglish}>{selectedShaloka.english}</Text>
                   <Text style={styles.modalReference}>Reference: {selectedShaloka.reference}</Text>
                   <Text style={styles.modalMeaning}>{selectedShaloka.meaning}</Text>
                 </View>
               )}
             </TouchableOpacity>
           </View>
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
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 12,
  },
  tileSanskrit: {
    fontSize: 16,
    color: '#FF6A00',
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: 'System',
  },
  tileEnglish: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tileReference: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalInner: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSpeakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSpeakerIcon: {
    fontSize: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSanskrit: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalEnglish: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalReference: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalMeaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export const options = { headerShown: false };
