import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function NavratriScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Hindi translations for sections and content
  const translations = {
    sections: {
      importance: { en: 'Importance of Navratri', hi: 'नवरात्रि का महत्व' },
      dates: { en: 'When is Navratri Celebrated?', hi: 'नवरात्रि कब मनाई जाती है?' },
      poojaVidhi: { en: 'Navratri Pooja Vidhi (Step by Step)', hi: 'नवरात्रि पूजा विधि (चरणबद्ध)' },
      difference: { en: 'Difference Between Chaitra & Sharad Navratri', hi: 'चैत्र और शारदीय नवरात्रि में अंतर' },
      story: { en: 'Navratri Story (Summary)', hi: 'नवरात्रि की कहानी (सारांश)' },
    },
    content: {
      title: { en: '🌸 Navratri – Importance, Dates, Pooja & Katha', hi: '🌸 नवरात्रि – महत्व, तिथियां, पूजा और कथा' },
      importance: {
        intro: {
          en: 'Navratri (literally "Nine Nights") is one of the most sacred Hindu festivals dedicated to Goddess Durga and her nine forms (Navadurga). It symbolizes:',
          hi: 'नवरात्रि (शाब्दिक रूप से "नौ रातें") देवी दुर्गा और उनके नौ रूपों (नवदुर्गा) को समर्पित सबसे पवित्र हिंदू त्योहारों में से एक है। यह प्रतीक है:'
        },
        points: {
          en: '• The victory of good over evil – Goddess Durga defeating Mahishasura.\n• The celebration of Shakti (Divine Feminine energy).\n• A time for spiritual discipline through fasting, prayers, devotion, and self-control.\n• The nine nights represent nine divine forms of Maa Durga – Shailputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, and Siddhidatri.\n• By worshipping the Goddess in these forms, devotees receive strength, wisdom, protection, prosperity, and liberation (moksha).',
          hi: '• बुराई पर अच्छाई की जीत – देवी दुर्गा द्वारा महिषासुर का वध।\n• शक्ति (दिव्य स्त्री ऊर्जा) का उत्सव।\n• उपवास, प्रार्थना, भक्ति और आत्म-नियंत्रण के माध्यम से आध्यात्मिक अनुशासन का समय।\n• नौ रातें मां दुर्गा के नौ दिव्य रूपों का प्रतिनिधित्व करती हैं – शैलपुत्री, ब्रह्मचारिणी, चंद्रघंटा, कूष्मांडा, स्कंदमाता, कात्यायनी, कालरात्रि, महागौरी, और सिद्धिदात्री।\n• इन रूपों में देवी की पूजा करके, भक्तों को शक्ति, ज्ञान, सुरक्षा, समृद्धि और मोक्ष प्राप्त होता है।'
        }
      },
      dates: {
        chaitra: {
          title: { en: 'Chaitra Navratri', hi: 'चैत्र नवरात्रि' },
          text: {
            en: 'Celebrated in the Hindu month of Chaitra (March–April).\nStarts from Pratipada (1st day) of Shukla Paksha and ends on Navami (9th day) with Ram Navami (birth of Lord Rama).',
            hi: 'हिंदू महीने चैत्र (मार्च-अप्रैल) में मनाई जाती है।\nशुक्ल पक्ष की प्रतिपदा (1 दिन) से शुरू होकर राम नवमी (भगवान राम का जन्म) के साथ नवमी (9वें दिन) पर समाप्त होती है।'
          }
        },
        sharad: {
          title: { en: 'Sharad Navratri', hi: 'शारदीय नवरात्रि' },
          text: {
            en: 'Celebrated in the Hindu month of Ashwin (September–October).\nStarts from Pratipada of Shukla Paksha and ends on Navami (9th day).\nThe 10th day is celebrated as Vijaya Dashami (Dussehra).',
            hi: 'हिंदू महीने आश्विन (सितंबर-अक्टूबर) में मनाई जाती है।\nशुक्ल पक्ष की प्रतिपदा से शुरू होकर नवमी (9वें दिन) पर समाप्त होती है।\n10वें दिन को विजया दशमी (दशहरा) के रूप में मनाया जाता है।'
          }
        },
        note: {
          en: 'These two Navratris are the most important, though there are also Magha Gupt Navratri and Ashadha Gupt Navratri celebrated in some traditions.',
          hi: 'ये दो नवरात्रि सबसे महत्वपूर्ण हैं, हालांकि कुछ परंपराओं में माघ गुप्त नवरात्रि और आषाढ़ गुप्त नवरात्रि भी मनाई जाती हैं।'
        }
      },
      poojaVidhi: {
        kalashSthapana: {
          title: { en: '1. Kalash Sthapana (Ghatasthapana)', hi: '1. कलश स्थापना (घटस्थापना)' },
          steps: {
            en: '• Bathe early in the morning and wear clean clothes.\n• Place a wooden platform, cover it with a red cloth.\n• Sow barley/wheat seeds on the platform.\n• Place a water-filled Kalash (pot) with mango leaves and coconut on it.\n• Light an Akhand Jyoti (unbroken flame).',
            hi: '• सुबह जल्दी स्नान करें और साफ कपड़े पहनें।\n• एक लकड़ी का मंच रखें, उसे लाल कपड़े से ढकें।\n• मंच पर जौ/गेहूं के बीज बोएं।\n• उस पर आम के पत्तों और नारियल के साथ पानी से भरा कलश (बर्तन) रखें।\n• एक अखंड ज्योति (अखंड लौ) जलाएं।'
          }
        },
        deviPooja: {
          title: { en: '2. Devi Pooja', hi: '2. देवी पूजा' },
          steps: {
            en: '• Install an idol or image of Maa Durga.\n• Offer flowers, sindoor, rice, garland, and red cloth.\n• Recite Durga Saptashati / Devi Mahatmya.\n• Offer bhog daily (fruits, sweets, milk-based food, kheer, halwa).',
            hi: '• मां दुर्गा की मूर्ति या चित्र स्थापित करें।\n• फूल, सिंदूर, चावल, माला और लाल कपड़ा अर्पित करें।\n• दुर्गा सप्तशती / देवी महात्म्य का पाठ करें।\n• दैनिक भोग अर्पित करें (फल, मिठाई, दूध आधारित भोजन, खीर, हलवा)।'
          }
        },
        katha: {
          title: { en: '3. Katha (Story of Navratri)', hi: '3. कथा (नवरात्रि की कहानी)' },
          text: {
            en: 'The story comes from Devi Mahatmya (Durga Saptashati):\n\nGoddess Durga was created from the combined powers of Brahma, Vishnu, and Shiva to destroy the demon Mahishasura.\n\nShe fought for nine days and killed him on the 10th day (Vijaya Dashami).\n\nShe also defeated Chanda, Munda, Raktabeej, Shumbha, and Nishumbha in later battles, manifesting as Mahakali, Mahalakshmi, and Mahasaraswati.',
            hi: 'कहानी देवी महात्म्य (दुर्गा सप्तशती) से आती है:\n\nदेवी दुर्गा को राक्षस महिषासुर को नष्ट करने के लिए ब्रह्मा, विष्णु और शिव की संयुक्त शक्तियों से बनाया गया था।\n\nउन्होंने नौ दिनों तक लड़ाई की और 10वें दिन (विजया दशमी) उसे मार डाला।\n\nउन्होंने बाद की लड़ाइयों में चंड, मुंड, रक्तबीज, शुंभ और निशुंभ को भी हराया, महाकाली, महालक्ष्मी और महासरस्वती के रूप में प्रकट होकर।'
          }
        },
        fasting: {
          title: { en: '4. Fasting Rules', hi: '4. उपवास के नियम' },
          steps: {
            en: '• Take a vow (sankalp) in front of Maa Durga.\n• Eat only sattvik food, avoiding onion, garlic, alcohol, and non-vegetarian items.\n• Many devotees eat once a day with fruits and milk.',
            hi: '• मां दुर्गा के सामने संकल्प लें।\n• केवल सात्विक भोजन खाएं, प्याज, लहसुन, शराब और मांसाहारी वस्तुओं से बचें।\n• कई भक्त फल और दूध के साथ दिन में एक बार खाते हैं।'
          }
        },
        havan: {
          title: { en: '5. Havan (On Ashtami or Navami)', hi: '5. हवन (अष्टमी या नवमी पर)' },
          steps: {
            en: '• After recitation of Durga Saptashati, perform havan.\n• Offer ghee, sesame, rice, herbs with each mantra "Swaha."',
            hi: '• दुर्गा सप्तशती के पाठ के बाद, हवन करें।\n• प्रत्येक मंत्र "स्वाहा" के साथ घी, तिल, चावल, जड़ी-बूटियां अर्पित करें।'
          }
        },
        kanyaPoojan: {
          title: { en: '6. Kanya Poojan (Ashtami or Navami)', hi: '6. कन्या पूजन (अष्टमी या नवमी पर)' },
          steps: {
            en: '• Invite 7, 9, or 11 girls (aged 2–10 years).\n• Wash their feet, apply tilak, and worship them as forms of the Goddess.\n• Serve them food (puri, halwa, chana).\n• Offer gifts and dakshina.',
            hi: '• 7, 9, या 11 लड़कियों (2-10 वर्ष की आयु) को आमंत्रित करें।\n• उनके पैर धोएं, तिलक लगाएं, और उन्हें देवी के रूपों के रूप में पूजें।\n• उन्हें भोजन परोसें (पूरी, हलवा, चना)।\n• उपहार और दक्षिणा अर्पित करें।'
          }
        }
      },
      difference: {
        en: 'Chaitra Navratri ends with Ram Navami (birth of Lord Rama).\n\nSharad Navratri ends with Vijaya Dashami (Dussehra), symbolizing Durga\'s victory over Mahishasura and Lord Rama\'s victory over Ravana.',
        hi: 'चैत्र नवरात्रि राम नवमी (भगवान राम का जन्म) के साथ समाप्त होती है।\n\nशारदीय नवरात्रि विजया दशमी (दशहरा) के साथ समाप्त होती है, जो दुर्गा की महिषासुर पर जीत और भगवान राम की रावण पर जीत का प्रतीक है।'
      },
      story: {
        en: 'Once upon a time, the demon king Mahishasura conquered heaven and drove out the gods. The gods prayed to Brahma, Vishnu, and Shiva, who combined their powers to create Goddess Durga.\n\nThe Goddess, armed with divine weapons, fought Mahishasura for nine nights and ten days. Finally, she killed him on the tenth day, restoring peace to heaven.\n\nShe also destroyed other powerful demons like Chanda, Munda, Raktabeej, Shumbha, and Nishumbha, showing her different forms – Mahakali, Mahalakshmi, and Mahasaraswati.\n\nThus, Navratri celebrates the victory of divine power (Shakti) over evil and reminds devotees that faith, devotion, and discipline lead to triumph.',
        hi: 'एक समय की बात है, राक्षस राजा महिषासुर ने स्वर्ग पर विजय प्राप्त की और देवताओं को बाहर निकाल दिया। देवताओं ने ब्रह्मा, विष्णु और शिव से प्रार्थना की, जिन्होंने देवी दुर्गा को बनाने के लिए अपनी शक्तियों को मिलाया।\n\nदेवी, दिव्य हथियारों से सुसज्जित, नौ रातों और दस दिनों तक महिषासुर से लड़ीं। अंत में, उन्होंने दसवें दिन उसे मार डाला, स्वर्ग में शांति बहाल की।\n\nउन्होंने चंड, मुंड, रक्तबीज, शुंभ और निशुंभ जैसे अन्य शक्तिशाली राक्षसों को भी नष्ट किया, अपने विभिन्न रूपों को दिखाते हुए – महाकाली, महालक्ष्मी और महासरस्वती।\n\nइस प्रकार, नवरात्रि दिव्य शक्ति (शक्ति) की बुराई पर जीत का उत्सव मनाती है और भक्तों को याद दिलाती है कि विश्वास, भक्ति और अनुशासन विजय की ओर ले जाते हैं।'
      }
    }
  };

  const sections = [
    'importance', 'dates', 'poojaVidhi', 'difference', 'story'
  ];

  const scrollToSection = (section: string) => {
    if (sectionY.current[section] && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: sectionY.current[section] - 100,
        animated: true,
      });
    }
  };

  const onSectionLayout = (section: string, event: any) => {
    const { y } = event.nativeEvent.layout;
    sectionY.current[section] = y;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFA040', '#FF6A00']}
        style={styles.gradient}
      />
      
      <HomeHeader 
        enableSpiritualSearch={true} 
        showSearchBar={true} 
        showDailyPujaButton={false}
        showLanguageToggle={false}
        showTopicDropdown={false}
        onSearchChange={setSearchHighlight}
      />
      
      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {isHindi ? translations.content.title.hi : translations.content.title.en}
          </Text>

          {/* Importance Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('importance', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.importance.hi : translations.sections.importance.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.importance.intro.hi : translations.content.importance.intro.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
            <HighlightedText 
              text={isHindi ? translations.content.importance.points.hi : translations.content.importance.points.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Dates Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('dates', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.dates.hi : translations.sections.dates.en}
            </Text>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.dates.chaitra.title.hi : translations.content.dates.chaitra.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.dates.chaitra.text.hi : translations.content.dates.chaitra.text.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.dates.sharad.title.hi : translations.content.dates.sharad.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.dates.sharad.text.hi : translations.content.dates.sharad.text.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <HighlightedText 
              text={isHindi ? translations.content.dates.note.hi : translations.content.dates.note.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Pooja Vidhi Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('poojaVidhi', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.poojaVidhi.hi : translations.sections.poojaVidhi.en}
            </Text>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.kalashSthapana.title.hi : translations.content.poojaVidhi.kalashSthapana.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.kalashSthapana.steps.hi : translations.content.poojaVidhi.kalashSthapana.steps.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.deviPooja.title.hi : translations.content.poojaVidhi.deviPooja.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.deviPooja.steps.hi : translations.content.poojaVidhi.deviPooja.steps.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.katha.title.hi : translations.content.poojaVidhi.katha.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.katha.text.hi : translations.content.poojaVidhi.katha.text.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.fasting.title.hi : translations.content.poojaVidhi.fasting.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.fasting.steps.hi : translations.content.poojaVidhi.fasting.steps.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.havan.title.hi : translations.content.poojaVidhi.havan.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.havan.steps.hi : translations.content.poojaVidhi.havan.steps.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                {isHindi ? translations.content.poojaVidhi.kanyaPoojan.title.hi : translations.content.poojaVidhi.kanyaPoojan.title.en}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.poojaVidhi.kanyaPoojan.steps.hi : translations.content.poojaVidhi.kanyaPoojan.steps.en}
                highlight={searchHighlight}
                style={styles.paragraph}
              />
            </View>
          </View>

          {/* Difference Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('difference', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.difference.hi : translations.sections.difference.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.difference.hi : translations.content.difference.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Story Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('story', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.story.hi : translations.sections.story.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.story.hi : translations.content.story.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background for the screen
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120, // Only cover the header area
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subsection: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 15,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6A00',
    marginBottom: 10,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 15,
  },
});
