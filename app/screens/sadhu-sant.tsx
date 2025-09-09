import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function SadhuSantScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Hindi translations for sections and content
  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      rishis: { en: 'Rishis – The Ancient Seers', hi: 'ऋषि – प्राचीन द्रष्टा' },
      sadhus: { en: 'Sadhus – The Renunciates', hi: 'साधु – त्यागी' },
      sants: { en: 'Sants – The Saints of Devotion', hi: 'संत – भक्ति के संत' },
      commonValues: { en: 'Common Values', hi: 'सामान्य मूल्य' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
    },
    content: {
      title: { en: 'Rishis, Sadhus, and Sants in Hindu Tradition', hi: 'हिंदू परंपरा में ऋषि, साधु और संत' },
      intro: { 
        en: 'Hindu spiritual life has always been guided by three great streams of seekers and teachers: Rishis, Sadhus, and Sants. Though different in their roles and eras, all three embody the quest for truth (satya), liberation (moksha), and devotion (bhakti). They continue to shape the moral and spiritual fabric of India.',
        hi: 'हिंदू आध्यात्मिक जीवन हमेशा से तीन महान साधकों और शिक्षकों के प्रवाह द्वारा निर्देशित रहा है: ऋषि, साधु और संत। अपनी भूमिकाओं और युगों में भिन्न होने के बावजूद, तीनों ही सत्य (सत्य), मोक्ष और भक्ति की खोज का प्रतीक हैं। वे भारत के नैतिक और आध्यात्मिक ताने-बाने को आकार देते रहते हैं।'
      },
      rishis: {
        intro: {
          en: 'Rishis were the inspired sages of Vedic times who received divine knowledge through deep meditation and intuition. They are credited with composing the Vedas, Upanishads, and other scriptures.',
          hi: 'ऋषि वैदिक काल के प्रेरित संत थे जिन्होंने गहरे ध्यान और अंतर्ज्ञान के माध्यम से दिव्य ज्ञान प्राप्त किया। उन्हें वेद, उपनिषद और अन्य ग्रंथों की रचना का श्रेय दिया जाता है।'
        },
        examples: {
          vyasa: {
            en: 'Maharishi Veda Vyasa: Compiler of the Vedas, author of the Mahabharata and Bhagavata Purana.',
            hi: 'महर्षि वेद व्यास: वेदों के संकलनकर्ता, महाभारत और भागवत पुराण के लेखक।'
          },
          valmiki: {
            en: 'Maharishi Valmiki: Author of the Ramayana, revered as the Adi Kavi (first poet).',
            hi: 'महर्षि वाल्मीकि: रामायण के लेखक, आदि कवि (प्रथम कवि) के रूप में पूज्य।'
          },
          vishwamitra: {
            en: 'Rishi Vishwamitra: Once a king, later a Brahmarishi, credited with giving the Gayatri Mantra.',
            hi: 'ऋषि विश्वामित्र: एक बार राजा, बाद में ब्रह्मर्षि, गायत्री मंत्र देने का श्रेय।'
          },
          vasishtha: {
            en: 'Rishi Vasishtha: Guru of Lord Rama, known for wisdom and spiritual guidance.',
            hi: 'ऋषि वसिष्ठ: भगवान राम के गुरु, ज्ञान और आध्यात्मिक मार्गदर्शन के लिए जाने जाते हैं।'
          },
          patanjali: {
            en: 'Rishi Patanjali: Systematized Yoga in the Yoga Sutras, laying the foundation for modern yoga practice.',
            hi: 'ऋषि पतंजलि: योग सूत्रों में योग को व्यवस्थित किया, आधुनिक योग अभ्यास की नींव रखी।'
          }
        },
        significance: {
          en: 'Rishis symbolize the origin of spiritual knowledge, laying the intellectual and spiritual foundation for Hindu dharma.',
          hi: 'ऋषि आध्यात्मिक ज्ञान की उत्पत्ति का प्रतीक हैं, हिंदू धर्म के लिए बौद्धिक और आध्यात्मिक नींव रखते हैं।'
        }
      },
      sadhus: {
        intro: {
          en: 'Sadhus are ascetics who renounce worldly life to pursue liberation through austerity, yoga, and meditation. They embody complete detachment and often wander across holy places in India.',
          hi: 'साधु तपस्वी हैं जो मोक्ष की खोज के लिए सांसारिक जीवन का त्याग करते हैं, तपस्या, योग और ध्यान के माध्यम से। वे पूर्ण वैराग्य का प्रतीक हैं और अक्सर भारत के पवित्र स्थानों में भटकते हैं।'
        },
        examples: {
          shankaracharya: {
            en: 'Adi Shankaracharya (8th century CE): Reviver of Advaita Vedanta, unifier of Hinduism, and founder of four major mathas (monastic centers).',
            hi: 'आदि शंकराचार्य (8वीं शताब्दी ईस्वी): अद्वैत वेदांत के पुनरुत्थानकर्ता, हिंदू धर्म के एकीकरणकर्ता, और चार प्रमुख मठों (मठ केंद्रों) के संस्थापक।'
          },
          trailanga: {
            en: 'Trailanga Swami (1607–1887): A Shaiva Sadhu of Varanasi, remembered for his yogic powers and long lifespan.',
            hi: 'त्रैलंग स्वामी (1607-1887): वाराणसी के एक शैव साधु, अपनी योगिक शक्तियों और लंबी आयु के लिए याद किए जाते हैं।'
          },
          vivekananda: {
            en: 'Swami Vivekananda (1863–1902): Disciple of Sri Ramakrishna, who spread Vedanta and Yoga globally and emphasized service to humanity.',
            hi: 'स्वामी विवेकानंद (1863-1902): श्री रामकृष्ण के शिष्य, जिन्होंने वेदांत और योग को विश्व स्तर पर फैलाया और मानवता की सेवा पर जोर दिया।'
          },
          neemKaroli: {
            en: 'Neem Karoli Baba (1900–1973): A saintly Sadhu known for compassion, simplicity, and miracles; revered by seekers in India and abroad.',
            hi: 'नीम करोली बाबा (1900-1973): करुणा, सरलता और चमत्कारों के लिए जाने जाने वाले एक संत साधु; भारत और विदेश में साधकों द्वारा पूज्य।'
          },
          nagaSadhus: {
            en: 'Naga Sadhus: Warrior ascetics devoted to Shiva, known for their fierce vows and presence at the Kumbh Mela.',
            hi: 'नागा साधु: शिव के प्रति समर्पित योद्धा तपस्वी, अपनी कठोर प्रतिज्ञाओं और कुंभ मेले में उपस्थिति के लिए जाने जाते हैं।'
          }
        },
        significance: {
          en: 'Sadhus embody renunciation, reminding society of the higher purpose of life beyond material pursuits.',
          hi: 'साधु त्याग का प्रतीक हैं, समाज को भौतिक खोजों से परे जीवन के उच्च उद्देश्य की याद दिलाते हैं।'
        }
      },
      sants: {
        intro: {
          en: 'Sants are saintly figures, often poet-mystics, who lived among the people and spread spirituality through bhakti (devotion), compassion, and reform. They made the divine accessible in simple words and songs.',
          hi: 'संत संत व्यक्तित्व हैं, अक्सर कवि-रहस्यवादी, जो लोगों के बीच रहते थे और भक्ति, करुणा और सुधार के माध्यम से आध्यात्मिकता फैलाते थे। उन्होंने दिव्य को सरल शब्दों और गीतों में सुलभ बनाया।'
        },
        examples: {
          kabir: {
            en: 'Sant Kabir (15th century): Mystic poet who rejected caste divisions and preached the unity of God.',
            hi: 'संत कबीर (15वीं शताब्दी): रहस्यवादी कवि जिन्होंने जाति विभाजन को अस्वीकार किया और ईश्वर की एकता का उपदेश दिया।'
          },
          tulsidas: {
            en: 'Sant Tulsidas (1532–1623): Author of Ramcharitmanas, bringing Rama\'s story to common people in Hindi.',
            hi: 'संत तुलसीदास (1532-1623): रामचरितमानस के लेखक, राम की कहानी को हिंदी में आम लोगों तक पहुंचाया।'
          },
          mirabai: {
            en: 'Sant Mirabai (1498–1547): Princess-turned-poetess, celebrated for her songs of love for Lord Krishna.',
            hi: 'संत मीराबाई (1498-1547): राजकुमारी से कवयित्री बनीं, भगवान कृष्ण के प्रति प्रेम के गीतों के लिए प्रसिद्ध।'
          },
          tukaram: {
            en: 'Sant Tukaram (1608–1649): Varkari saint from Maharashtra, composer of devotional abhangs dedicated to Vithoba.',
            hi: 'संत तुकाराम (1608-1649): महाराष्ट्र के वारकरी संत, विठोबा को समर्पित भक्ति अभंगों के रचयिता।'
          },
          dnyaneshwar: {
            en: 'Sant Dnyaneshwar (1275–1296): Wrote the Dnyaneshwari, a commentary on the Bhagavad Gita in Marathi, emphasizing spiritual equality.',
            hi: 'संत ज्ञानेश्वर (1275-1296): ज्ञानेश्वरी लिखी, भगवद गीता पर मराठी में टीका, आध्यात्मिक समानता पर जोर दिया।'
          },
          ramakrishna: {
            en: 'Ramakrishna Paramahamsa (1836–1886): Taught the harmony of religions and inspired the modern bhakti and spiritual revival.',
            hi: 'रामकृष्ण परमहंस (1836-1886): धर्मों की सामंजस्य सिखाई और आधुनिक भक्ति और आध्यात्मिक पुनरुत्थान को प्रेरित किया।'
          }
        },
        significance: {
          en: 'Sants emphasized love, compassion, and equality, making them accessible guides for society.',
          hi: 'संतों ने प्रेम, करुणा और समानता पर जोर दिया, उन्हें समाज के लिए सुलभ मार्गदर्शक बनाया।'
        }
      },
      commonValues: {
        en: 'Despite differences in time and approach, Rishis, Sadhus, and Sants share common values:\n\n• Pursuit of truth and liberation.\n• Deep meditation and devotion.\n• Renunciation of ego and material attachment.\n• Service and guidance to uplift humanity.',
        hi: 'समय और दृष्टिकोण में भिन्नता के बावजूद, ऋषि, साधु और संत सामान्य मूल्य साझा करते हैं:\n\n• सत्य और मोक्ष की खोज।\n• गहरे ध्यान और भक्ति।\n• अहंकार और भौतिक आसक्ति का त्याग।\n• मानवता को उत्थान के लिए सेवा और मार्गदर्शन।'
      },
      conclusion: {
        en: 'Rishis gave us the eternal wisdom of the Vedas and scriptures.\n\nSadhus live out renunciation and spiritual discipline as an example for seekers.\n\nSants bring divine love and moral teachings to ordinary people in simple language.\n\nTogether, they form the living spiritual heritage of Hinduism, reminding humanity that the true purpose of life is to realize the divine within.',
        hi: 'ऋषियों ने हमें वेदों और ग्रंथों का शाश्वत ज्ञान दिया।\n\nसाधु त्याग और आध्यात्मिक अनुशासन को साधकों के लिए उदाहरण के रूप में जीते हैं।\n\nसंत दिव्य प्रेम और नैतिक शिक्षाओं को सरल भाषा में आम लोगों तक लाते हैं।\n\nसाथ मिलकर, वे हिंदू धर्म की जीवंत आध्यात्मिक विरासत बनाते हैं, मानवता को याद दिलाते हैं कि जीवन का वास्तविक उद्देश्य भीतर के दिव्य को पहचानना है।'
      }
    }
  };

  const sections = [
    'intro', 'rishis', 'sadhus', 'sants', 'commonValues', 'conclusion'
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

          {/* Introduction */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('intro', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.intro.hi : translations.sections.intro.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.intro.hi : translations.content.intro.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Rishis Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('rishis', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.rishis.hi : translations.sections.rishis.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.rishis.intro.hi : translations.content.rishis.intro.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
            
            <Text style={styles.subsectionTitle}>
              {isHindi ? 'प्रमुख ऋषि' : 'Notable Rishis'}
            </Text>
            
            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'महर्षि वेद व्यास' : 'Maharishi Veda Vyasa'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.rishis.examples.vyasa.hi : translations.content.rishis.examples.vyasa.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'महर्षि वाल्मीकि' : 'Maharishi Valmiki'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.rishis.examples.valmiki.hi : translations.content.rishis.examples.valmiki.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'ऋषि विश्वामित्र' : 'Rishi Vishwamitra'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.rishis.examples.vishwamitra.hi : translations.content.rishis.examples.vishwamitra.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'ऋषि वसिष्ठ' : 'Rishi Vasishtha'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.rishis.examples.vasishtha.hi : translations.content.rishis.examples.vasishtha.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'ऋषि पतंजलि' : 'Rishi Patanjali'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.rishis.examples.patanjali.hi : translations.content.rishis.examples.patanjali.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <HighlightedText 
              text={isHindi ? translations.content.rishis.significance.hi : translations.content.rishis.significance.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Sadhus Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('sadhus', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.sadhus.hi : translations.sections.sadhus.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.sadhus.intro.hi : translations.content.sadhus.intro.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
            
            <Text style={styles.subsectionTitle}>
              {isHindi ? 'प्रसिद्ध साधु' : 'Famous Sadhus'}
            </Text>
            
            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'आदि शंकराचार्य' : 'Adi Shankaracharya'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sadhus.examples.shankaracharya.hi : translations.content.sadhus.examples.shankaracharya.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'त्रैलंग स्वामी' : 'Trailanga Swami'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sadhus.examples.trailanga.hi : translations.content.sadhus.examples.trailanga.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'स्वामी विवेकानंद' : 'Swami Vivekananda'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sadhus.examples.vivekananda.hi : translations.content.sadhus.examples.vivekananda.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'नीम करोली बाबा' : 'Neem Karoli Baba'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sadhus.examples.neemKaroli.hi : translations.content.sadhus.examples.neemKaroli.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'नागा साधु' : 'Naga Sadhus'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sadhus.examples.nagaSadhus.hi : translations.content.sadhus.examples.nagaSadhus.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <HighlightedText 
              text={isHindi ? translations.content.sadhus.significance.hi : translations.content.sadhus.significance.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Sants Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('sants', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.sants.hi : translations.sections.sants.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.sants.intro.hi : translations.content.sants.intro.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
            
            <Text style={styles.subsectionTitle}>
              {isHindi ? 'महान संत' : 'Great Sants'}
            </Text>
            
            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'संत कबीर' : 'Sant Kabir'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.kabir.hi : translations.content.sants.examples.kabir.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'संत तुलसीदास' : 'Sant Tulsidas'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.tulsidas.hi : translations.content.sants.examples.tulsidas.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'संत मीराबाई' : 'Sant Mirabai'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.mirabai.hi : translations.content.sants.examples.mirabai.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'संत तुकाराम' : 'Sant Tukaram'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.tukaram.hi : translations.content.sants.examples.tukaram.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'संत ज्ञानेश्वर' : 'Sant Dnyaneshwar'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.dnyaneshwar.hi : translations.content.sants.examples.dnyaneshwar.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleTitle}>
                {isHindi ? 'रामकृष्ण परमहंस' : 'Ramakrishna Paramahamsa'}
              </Text>
              <HighlightedText 
                text={isHindi ? translations.content.sants.examples.ramakrishna.hi : translations.content.sants.examples.ramakrishna.en}
                highlight={searchHighlight}
                style={styles.exampleText}
              />
            </View>

            <HighlightedText 
              text={isHindi ? translations.content.sants.significance.hi : translations.content.sants.significance.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Common Values Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('commonValues', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.commonValues.hi : translations.sections.commonValues.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.commonValues.hi : translations.content.commonValues.en}
              highlight={searchHighlight}
              style={styles.paragraph}
            />
          </View>

          {/* Conclusion Section */}
          <View 
            style={styles.section}
            onLayout={(event) => onSectionLayout('conclusion', event)}
          >
            <Text style={styles.sectionTitle}>
              {isHindi ? translations.sections.conclusion.hi : translations.sections.conclusion.en}
            </Text>
            <HighlightedText 
              text={isHindi ? translations.content.conclusion.hi : translations.content.conclusion.en}
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
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 15,
  },
  exampleItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    textAlign: 'justify',
  },
});
