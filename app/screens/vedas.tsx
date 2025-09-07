import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function VedasScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Hindi translations for sections and content
  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      divineNature: { en: 'The Divine Nature of Vedic Knowledge', hi: 'वैदिक ज्ञान की दिव्य प्रकृति' },
      historical: { en: 'Historical Context and Chronology', hi: 'ऐतिहासिक संदर्भ और कालक्रम' },
      fourVedas: { en: 'The Four Vedas: Structure and Content', hi: 'चार वेद: संरचना और सामग्री' },
      fourFold: { en: 'The Four-Fold Structure of Each Veda', hi: 'प्रत्येक वेद की चतुर्भुज संरचना' },
      spiritual: { en: 'Spiritual and Philosophical Significance', hi: 'आध्यात्मिक और दार्शनिक महत्व' },
      scientific: { en: 'Scientific and Practical Knowledge', hi: 'वैज्ञानिक और व्यावहारिक ज्ञान' },
      cultural: { en: 'Cultural Impact and Influence', hi: 'सांस्कृतिक प्रभाव और प्रभाव' },
      modern: { en: 'Modern Preservation and Study', hi: 'आधुनिक संरक्षण और अध्ययन' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
      references: { en: 'References', hi: 'संदर्भ' },
    },
    content: {
      title: { en: 'The Vedas: The Sacred Foundation of Hindu Knowledge', hi: 'वेद: हिंदू ज्ञान की पवित्र नींव' },
      intro: { 
        en: 'The Vedas represent the oldest and most sacred scriptures of Hinduism, forming the foundational texts that have guided Hindu spiritual and philosophical thought for millennia. These ancient Sanskrit texts constitute the earliest layer of Sanskrit literature and serve as the bedrock upon which all Hindu religious practice and philosophy is built.',
        hi: 'वेद हिंदू धर्म के सबसे पुराने और सबसे पवित्र ग्रंथों का प्रतिनिधित्व करते हैं, जो हजारों वर्षों से हिंदू आध्यात्मिक और दार्शनिक विचार का मार्गदर्शन करने वाले मूलभूत ग्रंथों का निर्माण करते हैं। ये प्राचीन संस्कृत ग्रंथ संस्कृत साहित्य की सबसे पुरानी परत का निर्माण करते हैं और सभी हिंदू धार्मिक अभ्यास और दर्शन की आधारशिला के रूप में कार्य करते हैं।'
      },
      divineNature: {
        meaningOrigin: {
          title: { en: 'The Meaning and Origin', hi: 'अर्थ और उत्पत्ति' },
          text1: { 
            en: 'The word "Veda" derives from the Sanskrit root "vid," meaning "knowledge" or "wisdom". The Vedas are considered apauruṣeya (not of human origin) and are believed to have been revealed to ancient sages (rishis) through divine inspiration during deep meditation. This divine knowledge was directly received from the ultimate source and represents the cosmic wisdom of the entire universe.',
            hi: 'शब्द "वेद" संस्कृत मूल "विद्" से निकला है, जिसका अर्थ है "ज्ञान" या "बुद्धिमत्ता"। वेदों को अपौरुषेय (मानवीय उत्पत्ति का नहीं) माना जाता है और माना जाता है कि ये गहरे ध्यान के दौरान दिव्य प्रेरणा के माध्यम से प्राचीन ऋषियों को प्रकट किए गए थे। यह दिव्य ज्ञान सीधे परम स्रोत से प्राप्त किया गया था और पूरे ब्रह्मांड के ब्रह्मांडीय ज्ञान का प्रतिनिधित्व करता है।'
          },
          text2: { 
            en: 'The Vedas are also referred to as Śruti (meaning "that which is heard"), emphasizing their nature as divine revelation rather than human composition. They are considered eternal and vibrate in the outer dimensions of the world of Brahmans, existing as uncreated, eternal sound syllables.',
            hi: 'वेदों को श्रुति (जिसका अर्थ है "जो सुना गया है") भी कहा जाता है, जो मानवीय रचना के बजाय दिव्य प्रकटीकरण के रूप में उनकी प्रकृति पर जोर देता है। उन्हें शाश्वत माना जाता है और ब्रह्मांड के बाहरी आयामों में कंपन करते हैं, अविकसित, शाश्वत ध्वनि शब्दांश के रूप में मौजूद हैं।'
          }
        },
        oralTradition: {
          title: { en: 'The Oral Tradition', hi: 'मौखिक परंपरा' },
          text: { 
            en: 'The Vedas were famously script-averse and were probably the last sacred texts to be written down. For centuries, they were preserved through intricate systems of verbatim memorization, passed down orally from guru to shishya (student) through the guru-shishya parampara tradition. The gurus carefully selected only certain individuals whom they deemed capable of correctly understanding, retaining, and applying these sacred teachings.',
            hi: 'वेद प्रसिद्ध रूप से लिपि-विरोधी थे और शायद लिखे जाने वाले अंतिम पवित्र ग्रंथ थे। सदियों तक, उन्हें शब्दशः स्मरण की जटिल प्रणालियों के माध्यम से संरक्षित किया गया था, गुरु-शिष्य परंपरा के माध्यम से गुरु से शिष्य (छात्र) तक मौखिक रूप से पारित किया गया था। गुरुओं ने सावधानीपूर्वक केवल कुछ व्यक्तियों का चयन किया जिन्हें वे इन पवित्र शिक्षाओं को सही ढंग से समझने, बनाए रखने और लागू करने में सक्षम मानते थे।'
          }
        }
      },
      historical: {
        dating: {
          title: { en: 'Dating the Vedas', hi: 'वेदों की तिथि' },
          text1: { 
            en: 'The composition of the Vedas spans a significant period in ancient Indian history. The bulk of the Rigveda Samhita was composed in the northwestern region (Punjab) of the Indian subcontinent, most likely between c. 1500 and 1200 BCE, although some scholars suggest a wider timeframe of c. 1700–1100 BCE. The other three Samhitas are dated to approximately c. 1200–900 BCE during the time of the Kuru Kingdom.',
            hi: 'वेदों की रचना प्राचीन भारतीय इतिहास में एक महत्वपूर्ण अवधि में फैली हुई है। ऋग्वेद संहिता का अधिकांश भाग भारतीय उपमहाद्वीप के उत्तर-पश्चिमी क्षेत्र (पंजाब) में रचा गया था, सबसे अधिक संभावना c. 1500 और 1200 BCE के बीच, हालांकि कुछ विद्वान c. 1700–1100 BCE के व्यापक समय सीमा का सुझाव देते हैं। अन्य तीन संहिताएं कुरु राज्य के समय के दौरान लगभग c. 1200–900 BCE की तिथि हैं।'
          },
          text2: { 
            en: 'The Vedas were finally documented and compiled by Ved Vyasa between 1500-500 BCE, a period historians refer to as the Vedic Age. The entire Vedic period spans from the mid-2nd to mid-1st millennium BCE, encompassing the Late Bronze Age and Iron Age.',
            hi: 'वेदों को अंततः 1500-500 BCE के बीच वेद व्यास द्वारा दस्तावेज और संकलित किया गया था, एक अवधि जिसे इतिहासकार वैदिक युग कहते हैं। पूरी वैदिक अवधि मध्य-2 से मध्य-1 सहस्राब्दी BCE तक फैली हुई है, जिसमें उत्तर कांस्य युग और लौह युग शामिल है।'
          }
        },
        cultural: {
          title: { en: 'Cultural Context', hi: 'सांस्कृतिक संदर्भ' },
          text: { 
            en: 'The Vedic texts emerged during the period when Sanskrit-speaking peoples began to dominate life and thought in the Indus Valley, probably between 2000 and 1500 BCE. These peoples, who called themselves Aryans (meaning "free" or "noble"), brought with them a rich Indo-Iranian cultural tradition that would profoundly shape the Indian subcontinent.',
            hi: 'वैदिक ग्रंथ उस अवधि के दौरान उभरे जब संस्कृत बोलने वाले लोग सिंधु घाटी में जीवन और विचार पर हावी होने लगे, शायद 2000 और 1500 BCE के बीच। ये लोग, जो खुद को आर्य (जिसका अर्थ है "मुक्त" या "कुलीन") कहते थे, अपने साथ एक समृद्ध भारत-ईरानी सांस्कृतिक परंपरा लाए जो भारतीय उपमहाद्वीप को गहराई से आकार देगी।'
          }
        }
      },
      fourVedas: {
        rigveda: {
          title: { en: 'Rigveda - The Foundation of Praise', hi: 'ऋग्वेद - प्रशंसा की नींव' },
          intro: { 
            en: 'The Rigveda (Sanskrit: "Rig" meaning "to praise") is the oldest and most important of the four Vedas. It consists of:',
            hi: 'ऋग्वेद (संस्कृत: "ऋग्" जिसका अर्थ है "प्रशंसा करना") चार वेदों में सबसे पुराना और सबसे महत्वपूर्ण है। इसमें शामिल है:'
          },
          list: {
            item1: { en: '• 10 books (mandalas)', hi: '• 10 पुस्तकें (मंडल)' },
            item2: { en: '• 1,028 hymns', hi: '• 1,028 भजन' },
            item3: { en: '• 10,600 verses', hi: '• 10,600 छंद' },
            item4: { en: '• The famous Gayatri Mantra', hi: '• प्रसिद्ध गायत्री मंत्र' }
          },
          description: { 
            en: 'The Rigveda contains hymns that are reflections of divine vibrations experienced by ancient sages. These verses praise natural forces like Earth (Prithvi), water (Jalam), fire (Agni), wind (Vayu), and sky (Akash), as well as deities such as Indra, Soma, Agni, Varuna, and Mitra. The text addresses fundamental questions about the origin of the universe, the purpose of human existence, and deep existential mysteries.',
            hi: 'ऋग्वेद में ऐसे भजन शामिल हैं जो प्राचीन ऋषियों द्वारा अनुभव किए गए दिव्य कंपनों के प्रतिबिंब हैं। ये छंद पृथ्वी (पृथ्वी), जल (जलम), अग्नि (अग्नि), वायु (वायु), और आकाश (आकाश) जैसी प्राकृतिक शक्तियों के साथ-साथ इंद्र, सोम, अग्नि, वरुण और मित्र जैसे देवताओं की प्रशंसा करते हैं। यह पाठ ब्रह्मांड की उत्पत्ति, मानव अस्तित्व के उद्देश्य और गहरे अस्तित्वगत रहस्यों के बारे में मौलिक प्रश्नों को संबोधित करता है।'
          }
        },
        yajurveda: {
          title: { en: 'Yajurveda - The Knowledge of Sacrifice', hi: 'यजुर्वेद - बलिदान का ज्ञान' },
          description: { 
            en: 'The Yajurveda ("Knowledge of the Sacrifice") contains sacred formulas known as mantras that were recited by the adhvaryu priest responsible for the sacrificial fire and conducting ceremonies. This Veda provides detailed instructions for religious rituals and sacrificial procedures.',
            hi: 'यजुर्वेद ("बलिदान का ज्ञान") में पवित्र सूत्र शामिल हैं जिन्हें मंत्र के रूप में जाना जाता है जो अध्वर्यु पुजारी द्वारा पढ़े जाते थे जो बलिदान की आग और समारोहों के संचालन के लिए जिम्मेदार था। यह वेद धार्मिक अनुष्ठानों और बलिदान प्रक्रियाओं के लिए विस्तृत निर्देश प्रदान करता है।'
          }
        },
        samaveda: {
          title: { en: 'Samaveda - The Knowledge of Chants', hi: 'सामवेद - मंत्रों का ज्ञान' },
          description: { 
            en: 'The Samaveda ("Knowledge of the Chants") consists mainly of hymns about religious rituals, drawn almost entirely from the Rigveda but arranged for melodic recitation. These verses were performed by the udgatri ("chanter") and his group of priests during ceremonial chanting.',
            hi: 'सामवेद ("मंत्रों का ज्ञान") मुख्य रूप से धार्मिक अनुष्ठानों के बारे में भजनों से बना है, जो लगभग पूरी तरह से ऋग्वेद से लिया गया है लेकिन मधुर पाठ के लिए व्यवस्थित किया गया है। ये छंद औपचारिक मंत्र के दौरान उद्गात्रि ("गायक") और उनके पुजारियों के समूह द्वारा प्रदर्शित किए गए थे।'
          }
        },
        atharvaveda: {
          title: { en: 'Atharvaveda - The Knowledge of the Fire Priest', hi: 'अथर्ववेद - अग्नि पुजारी का ज्ञान' },
          description: { 
            en: 'The Atharvaveda ("Knowledge of the Fire Priest") includes various local traditions and contains spells against enemies, sorcerers, and diseases. This collection incorporates magic spells, incantations, and practical knowledge that remained partly outside the traditional Vedic sacrifice system.',
            hi: 'अथर्ववेद ("अग्नि पुजारी का ज्ञान") में विभिन्न स्थानीय परंपराएं शामिल हैं और दुश्मनों, जादूगरों और बीमारियों के खिलाफ मंत्र शामिल हैं। यह संग्रह जादू के मंत्र, मंत्र और व्यावहारिक ज्ञान को शामिल करता है जो पारंपरिक वैदिक बलिदान प्रणाली के बाहर आंशिक रूप से बना रहा।'
          }
        }
      },
      fourFold: {
        title: { en: 'The Four-Fold Structure of Each Veda', hi: 'प्रत्येक वेद की चतुर्भुज संरचना' },
        samhitas: {
          title: { en: 'Samhitas - The Core Mantras', hi: 'संहिताएं - मूल मंत्र' },
          description: { 
            en: 'The Samhitas contain the fundamental mantras, hymns, and benedictions that form the essential verses of each Veda.',
            hi: 'संहिताओं में मौलिक मंत्र, भजन और आशीर्वाद शामिल हैं जो प्रत्येक वेद के आवश्यक छंद बनाते हैं।'
          }
        },
        brahmanas: {
          title: { en: 'Brahmanas - Ritual Commentaries', hi: 'ब्राह्मण - अनुष्ठान टिप्पणियां' },
          description: { 
            en: 'The Brahmanas provide detailed commentaries and explanations of rituals, ceremonies, and sacrifices (Yajñas), serving as practical guides for priests.',
            hi: 'ब्राह्मण अनुष्ठानों, समारोहों और बलिदानों (यज्ञ) के विस्तृत टिप्पणियां और स्पष्टीकरण प्रदान करते हैं, जो पुजारियों के लिए व्यावहारिक मार्गदर्शक के रूप में कार्य करते हैं।'
          }
        },
        aranyakas: {
          title: { en: 'Aranyakas - Forest Texts', hi: 'आरण्यक - वन ग्रंथ' },
          description: { 
            en: 'The Aranyakas (literally "forest texts") contain instructions on rituals, ceremonies, and symbolic sacrifices, meant for those in the Vanaprastha (forest dweller) stage of life.',
            hi: 'आरण्यक (शाब्दिक रूप से "वन ग्रंथ") में अनुष्ठानों, समारोहों और प्रतीकात्मक बलिदानों पर निर्देश शामिल हैं, जो जीवन के वानप्रस्थ (वन निवासी) चरण में रहने वालों के लिए हैं।'
          }
        },
        upanishads: {
          title: { en: 'Upanishads - Philosophical Wisdom', hi: 'उपनिषद - दार्शनिक ज्ञान' },
          description: { 
            en: 'The Upanishads contain texts discussing meditation, philosophy, and spiritual knowledge, intended for those in the Sannyasa (renunciant) stage of life. These texts explore metaphysical concepts and the nature of ultimate reality (Brahman).',
            hi: 'उपनिषदों में ध्यान, दर्शन और आध्यात्मिक ज्ञान पर चर्चा करने वाले ग्रंथ शामिल हैं, जो जीवन के संन्यास (त्यागी) चरण में रहने वालों के लिए हैं। ये ग्रंथ आध्यात्मिक अवधारणाओं और परम वास्तविकता (ब्रह्म) की प्रकृति का अन्वेषण करते हैं।'
          }
        }
      },
      spiritual: {
        title: { en: 'Spiritual and Philosophical Significance', hi: 'आध्यात्मिक और दार्शनिक महत्व' },
        cosmicKnowledge: {
          title: { en: 'Cosmic Knowledge and Divine Understanding', hi: 'ब्रह्मांडीय ज्ञान और दिव्य समझ' },
          description: { 
            en: 'The Vedas serve as a vast repository of cosmic knowledge, encompassing hymns, rituals, philosophy, and metaphysical insights that have shaped Hindu culture for millennia. They bridge the gap between the supersensuous dimension beyond human intellect and humanity\'s everyday consciousness.',
            hi: 'वेद ब्रह्मांडीय ज्ञान के एक विशाल भंडार के रूप में कार्य करते हैं, जिसमें भजन, अनुष्ठान, दर्शन और आध्यात्मिक अंतर्दृष्टि शामिल है जिसने हजारों वर्षों से हिंदू संस्कृति को आकार दिया है। वे मानव बुद्धि से परे अतींद्रिय आयाम और मानवता की रोजमर्रा की चेतना के बीच की खाई को पाटते हैं।'
          }
        },
        liberation: {
          title: { en: 'The Path to Liberation', hi: 'मुक्ति का मार्ग' },
          intro: { 
            en: 'The fundamental message of the Vedas centers on achieving moksha (liberation from the cycle of birth and death). They describe:',
            hi: 'वेदों का मौलिक संदेश मोक्ष (जन्म और मृत्यु के चक्र से मुक्ति) प्राप्त करने पर केंद्रित है। वे वर्णन करते हैं:'
          },
          list: {
            item1: { en: '• The creation, preservation, and ultimate dissolution of the universe', hi: '• ब्रह्मांड की रचना, संरक्षण और अंतिम विघटन' },
            item2: { en: '• The development of the soul - its evolution, destiny, bondage, and freedom', hi: '• आत्मा का विकास - इसका विकास, भाग्य, बंधन और स्वतंत्रता' },
            item3: { en: '• The deep-rooted relationship between matter and soul, the universe and living beings', hi: '• पदार्थ और आत्मा, ब्रह्मांड और जीवित प्राणियों के बीच गहरी जड़ें वाला संबंध' }
          }
        },
        divineManifestation: {
          title: { en: 'Divine Manifestation', hi: 'दिव्य अभिव्यक्ति' },
          description: { 
            en: 'The Vedas describe God in multiple forms - both as cosmic forces and ultimate reality. Deities like Agni (fire), Surya (sun), Indra (warrior-ruler), and Vayu (wind) symbolize natural and moral principles. Beyond these personified forces, Brahman represents the formless, infinite consciousness underlying all existence.',
            hi: 'वेद भगवान का वर्णन कई रूपों में करते हैं - ब्रह्मांडीय शक्तियों और परम वास्तविकता दोनों के रूप में। अग्नि (अग्नि), सूर्य (सूर्य), इंद्र (योद्धा-शासक), और वायु (वायु) जैसे देवता प्राकृतिक और नैतिक सिद्धांतों का प्रतीक हैं। इन मानवीकृत शक्तियों से परे, ब्रह्म सभी अस्तित्व के अंतर्निहित निराकार, अनंत चेतना का प्रतिनिधित्व करता है।'
          }
        }
      },
      scientific: {
        title: { en: 'Scientific and Practical Knowledge', hi: 'वैज्ञानिक और व्यावहारिक ज्ञान' },
        ancientWisdom: {
          title: { en: 'Ancient Wisdom for Modern Times', hi: 'आधुनिक समय के लिए प्राचीन ज्ञान' },
          intro: { 
            en: 'Beyond their spiritual significance, the Vedas provide mankind with values for everyday life and contain remarkable insights into various fields of knowledge. They include information about:',
            hi: 'उनके आध्यात्मिक महत्व से परे, वेद मानवता को रोजमर्रा के जीवन के लिए मूल्य प्रदान करते हैं और ज्ञान के विभिन्न क्षेत्रों में उल्लेखनीय अंतर्दृष्टि शामिल करते हैं। इनमें निम्नलिखित के बारे में जानकारी शामिल है:'
          },
          list: {
            item1: { en: '• Astronomy and mathematics', hi: '• खगोल विज्ञान और गणित' },
            item2: { en: '• Medicine and healing practices', hi: '• चिकित्सा और उपचार प्रथाएं' },
            item3: { en: '• Agriculture and environmental science', hi: '• कृषि और पर्यावरण विज्ञान' },
            item4: { en: '• Psychology and consciousness studies', hi: '• मनोविज्ञान और चेतना अध्ययन' },
            item5: { en: '• Social organization and governance', hi: '• सामाजिक संगठन और शासन' }
          },
          timelessRelevance: {
            title: { en: 'Timeless Relevance', hi: 'कालातीत प्रासंगिकता' },
            description: { 
              en: 'The Vedas continue to be relevant in today\'s world as they advocate solutions to all worldly problems through their comprehensive understanding of the relationship between matter and consciousness. Modern practitioners and scholars find valuable insights in Vedic approaches to wellness, sustainable living, and spiritual development.',
              hi: 'वेद आज की दुनिया में प्रासंगिक बने हुए हैं क्योंकि वे पदार्थ और चेतना के बीच संबंध की अपनी व्यापक समझ के माध्यम से सभी सांसारिक समस्याओं के समाधान की वकालत करते हैं। आधुनिक अभ्यासकर्ता और विद्वान कल्याण, सतत जीवन और आध्यात्मिक विकास के लिए वैदिक दृष्टिकोण में मूल्यवान अंतर्दृष्टि पाते हैं।'
            }
          }
        }
      },
      cultural: {
        title: { en: 'Cultural Impact and Influence', hi: 'सांस्कृतिक प्रभाव और प्रभाव' },
        foundation: {
          title: { en: 'Foundation of Hindu Tradition', hi: 'हिंदू परंपरा की नींव' },
          description: { 
            en: 'The Vedas established the theological and philosophical foundation for what would become Hinduism. The historical Vedic religion (also called Vedism or Brahmanism) constituted the religious ideas and practices of the Indo-Aryan peoples during the Vedic period (c. 1500–500 BCE).',
            hi: 'वेदों ने हिंदू धर्म बनने वाली चीज के लिए धार्मिक और दार्शनिक नींव स्थापित की। ऐतिहासिक वैदिक धर्म (जिसे वैदिकवाद या ब्राह्मणवाद भी कहा जाता है) ने वैदिक काल (c. 1500–500 BCE) के दौरान भारत-आर्य लोगों के धार्मिक विचारों और प्रथाओं का गठन किया।'
          }
        },
        socialStructure: {
          title: { en: 'Social Structure', hi: 'सामाजिक संरचना' },
          description: { 
            en: 'The Vedic texts influenced the development of important social concepts, including the Indian caste system, which is based on a fable from the Vedas about the sacrifice of the deity Purusha. While this system has evolved and been reinterpreted over time, its origins trace back to Vedic social organization.',
            hi: 'वैदिक ग्रंथों ने महत्वपूर्ण सामाजिक अवधारणाओं के विकास को प्रभावित किया, जिसमें भारतीय जाति व्यवस्था भी शामिल है, जो वेदों से देवता पुरुष के बलिदान के बारे में एक कथा पर आधारित है। हालांकि यह व्यवस्था समय के साथ विकसित और पुनर्व्याख्या की गई है, इसकी उत्पत्ति वैदिक सामाजिक संगठन से जुड़ी है।'
          }
        },
        continuousTradition: {
          title: { en: 'Continuous Tradition', hi: 'निरंतर परंपरा' },
          description: { 
            en: 'The Vedic thought and culture reflected in the Rig Veda has maintained a continuous history of dominance in India for the last thirty-five hundred years. This remarkable continuity demonstrates the enduring relevance and adaptability of Vedic wisdom across changing historical periods.',
            hi: 'ऋग्वेद में परिलक्षित वैदिक विचार और संस्कृति ने पिछले तीन हजार पांच सौ वर्षों से भारत में प्रभुत्व का निरंतर इतिहास बनाए रखा है। यह उल्लेखनीय निरंतरता बदलते ऐतिहासिक कालों में वैदिक ज्ञान की स्थायी प्रासंगिकता और अनुकूलनशीलता को प्रदर्शित करती है।'
          }
        }
      },
      modern: {
        title: { en: 'Modern Preservation and Study', hi: 'आधुनिक संरक्षण और अध्ययन' },
        academicRecognition: {
          title: { en: 'Academic Recognition', hi: 'शैक्षणिक मान्यता' },
          description: { 
            en: 'Contemporary scholarship recognizes the Vedas as among the world\'s most important ancient literary and religious texts. They represent invaluable sources for understanding ancient Indian history, culture, and spiritual development.',
            hi: 'समकालीन विद्वता वेदों को दुनिया के सबसे महत्वपूर्ण प्राचीन साहित्यिक और धार्मिक ग्रंथों में से एक के रूप में पहचानती है। वे प्राचीन भारतीय इतिहास, संस्कृति और आध्यात्मिक विकास को समझने के लिए अमूल्य स्रोतों का प्रतिनिधित्व करते हैं।'
          }
        },
        livingTradition: {
          title: { en: 'Living Tradition', hi: 'जीवित परंपरा' },
          description: { 
            en: 'Despite their ancient origins, the Vedas remain living texts within Hindu practice. Some Vedic rituals are still practiced today, maintaining an unbroken chain of tradition spanning thousands of years. Modern practitioners continue to chant Vedic mantras, perform Vedic ceremonies, and study Vedic philosophy as living wisdom rather than historical artifacts.',
            hi: 'उनकी प्राचीन उत्पत्ति के बावजूद, वेद हिंदू अभ्यास के भीतर जीवित ग्रंथ बने हुए हैं। कुछ वैदिक अनुष्ठान आज भी प्रचलित हैं, जो हजारों वर्षों तक फैली परंपरा की एक अटूट श्रृंखला को बनाए रखते हैं। आधुनिक अभ्यासकर्ता ऐतिहासिक कलाकृतियों के बजाय जीवित ज्ञान के रूप में वैदिक मंत्रों का जाप करना, वैदिक समारोहों का प्रदर्शन करना और वैदिक दर्शन का अध्ययन करना जारी रखते हैं।'
          }
        },
        digitalAge: {
          title: { en: 'Digital Age Accessibility', hi: 'डिजिटल युग की पहुंच' },
          description: { 
            en: 'In the digital age, the Vedas have become more accessible than ever before. Online platforms, digital libraries, and mobile applications have made Vedic texts, translations, and commentaries available to a global audience, ensuring that this ancient wisdom continues to reach new generations of seekers.',
            hi: 'डिजिटल युग में, वेद पहले से कहीं अधिक सुलभ हो गए हैं। ऑनलाइन प्लेटफॉर्म, डिजिटल पुस्तकालय और मोबाइल अनुप्रयोगों ने वैदिक ग्रंथों, अनुवादों और टिप्पणियों को वैश्विक दर्शकों के लिए उपलब्ध कराया है, यह सुनिश्चित करते हुए कि यह प्राचीन ज्ञान साधकों की नई पीढ़ियों तक पहुंचना जारी रखे।'
          }
        }
      },
      conclusion: {
        text1: {
          en: 'The Vedas represent humanity\'s earliest systematic exploration of cosmic truth, divine reality, and human purpose. As repositories of both spiritual wisdom and practical knowledge, they continue to offer guidance for those seeking understanding of life\'s deepest questions.',
          hi: 'वेद ब्रह्मांडीय सत्य, दिव्य वास्तविकता और मानव उद्देश्य की मानवता की सबसे पुरानी व्यवस्थित खोज का प्रतिनिधित्व करते हैं। आध्यात्मिक ज्ञान और व्यावहारिक ज्ञान दोनों के भंडार के रूप में, वे जीवन के सबसे गहरे प्रश्नों की समझ चाहने वालों के लिए मार्गदर्शन प्रदान करना जारी रखते हैं।'
        },
        text2: {
          en: 'These sacred texts bridge the ancient and modern worlds, offering timeless insights into the nature of existence, consciousness, and the path to spiritual liberation. Their influence extends far beyond religious boundaries, contributing to humanity\'s understanding of philosophy, science, and the pursuit of wisdom. The Vedas remain a testament to the profound spiritual achievements of ancient India and continue to illuminate the path toward truth and enlightenment for seekers across the globe.',
          hi: 'ये पवित्र ग्रंथ प्राचीन और आधुनिक दुनिया के बीच सेतु बनाते हैं, अस्तित्व, चेतना और आध्यात्मिक मुक्ति के मार्ग की प्रकृति में कालातीत अंतर्दृष्टि प्रदान करते हैं। उनका प्रभाव धार्मिक सीमाओं से कहीं आगे तक फैला है, दर्शन, विज्ञान और ज्ञान की खोज में मानवता की समझ में योगदान देता है। वेद प्राचीन भारत की गहरी आध्यात्मिक उपलब्धियों के प्रमाण बने हुए हैं और दुनिया भर के साधकों के लिए सत्य और ज्ञानोदय के मार्ग को प्रकाशित करना जारी रखते हैं।'
        }
      }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'divineNature', title: isHindi ? translations.sections.divineNature.hi : translations.sections.divineNature.en },
    { key: 'historical', title: isHindi ? translations.sections.historical.hi : translations.sections.historical.en },
    { key: 'fourVedas', title: isHindi ? translations.sections.fourVedas.hi : translations.sections.fourVedas.en },
    { key: 'fourFold', title: isHindi ? translations.sections.fourFold.hi : translations.sections.fourFold.en },
    { key: 'spiritual', title: isHindi ? translations.sections.spiritual.hi : translations.sections.spiritual.en },
    { key: 'scientific', title: isHindi ? translations.sections.scientific.hi : translations.sections.scientific.en },
    { key: 'cultural', title: isHindi ? translations.sections.cultural.hi : translations.sections.cultural.en },
    { key: 'modern', title: isHindi ? translations.sections.modern.hi : translations.sections.modern.en },
    { key: 'conclusion', title: isHindi ? translations.sections.conclusion.hi : translations.sections.conclusion.en },
    { key: 'references', title: isHindi ? translations.sections.references.hi : translations.sections.references.en },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(isHindi ? 'विषय' : 'Topic');
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
      setDropdownLabel(isHindi ? 'विषय' : 'Topic');
    });
  };

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
      case 'divineNature':
        return 'The word "Veda" derives from the Sanskrit root "vid," meaning "knowledge" or "wisdom". The Vedas are considered apauruṣeya (not of human origin) and are believed to have been revealed to ancient sages (rishis) through divine inspiration during deep meditation. This divine knowledge was directly received from the ultimate source and represents the cosmic wisdom of the entire universe. The Vedas are also referred to as Śruti (meaning "that which is heard"), emphasizing their nature as divine revelation rather than human composition. They are considered eternal and vibrate in the outer dimensions of the world of Brahmans, existing as uncreated, eternal sound syllables. The Vedas were famously script-averse and were probably the last sacred texts to be written down. For centuries, they were preserved through intricate systems of verbatim memorization, passed down orally from guru to shishya (student) through the guru-shishya parampara tradition. The gurus carefully selected only certain individuals whom they deemed capable of correctly understanding, retaining, and applying these sacred teachings.';
      case 'historical':
        return 'The composition of the Vedas spans a significant period in ancient Indian history. The bulk of the Rigveda Samhita was composed in the northwestern region (Punjab) of the Indian subcontinent, most likely between c. 1500 and 1200 BCE, although some scholars suggest a wider timeframe of c. 1700–1100 BCE. The other three Samhitas are dated to approximately c. 1200–900 BCE during the time of the Kuru Kingdom. The Vedas were finally documented and compiled by Ved Vyasa between 1500-500 BCE, a period historians refer to as the Vedic Age. The entire Vedic period spans from the mid-2nd to mid-1st millennium BCE, encompassing the Late Bronze Age and Iron Age. The Vedic texts emerged during the period when Sanskrit-speaking peoples began to dominate life and thought in the Indus Valley, probably between 2000 and 1500 BCE. These peoples, who called themselves Aryans (meaning "free" or "noble"), brought with them a rich Indo-Iranian cultural tradition that would profoundly shape the Indian subcontinent.';
      case 'fourVedas':
        return 'The Rigveda (Sanskrit: "Rig" meaning "to praise") is the oldest and most important of the four Vedas. It consists of 10 books (mandalas), 1,028 hymns, 10,600 verses, and the famous Gayatri Mantra. The Rigveda contains hymns that are reflections of divine vibrations experienced by ancient sages. These verses praise natural forces like Earth (Prithvi), water (Jalam), fire (Agni), wind (Vayu), and sky (Akash), as well as deities such as Indra, Soma, Agni, Varuna, and Mitra. The text addresses fundamental questions about the origin of the universe, the purpose of human existence, and deep existential mysteries. The Yajurveda ("Knowledge of the Sacrifice") contains sacred formulas known as mantras that were recited by the adhvaryu priest responsible for the sacrificial fire and conducting ceremonies. This Veda provides detailed instructions for religious rituals and sacrificial procedures. The Samaveda ("Knowledge of the Chants") consists mainly of hymns about religious rituals, drawn almost entirely from the Rigveda but arranged for melodic recitation. These verses were performed by the udgatri ("chanter") and his group of priests during ceremonial chanting. The Atharvaveda ("Knowledge of the Fire Priest") includes various local traditions and contains spells against enemies, sorcerers, and diseases. This collection incorporates magic spells, incantations, and practical knowledge that remained partly outside the traditional Vedic sacrifice system.';
      case 'fourFold':
        return 'The Samhitas contain the fundamental mantras, hymns, and benedictions that form the essential verses of each Veda. The Brahmanas provide detailed commentaries and explanations of rituals, ceremonies, and sacrifices (Yajñas), serving as practical guides for priests. The Aranyakas (literally "forest texts") contain instructions on rituals, ceremonies, and symbolic sacrifices, meant for those in the Vanaprastha (forest dweller) stage of life. The Upanishads contain texts discussing meditation, philosophy, and spiritual knowledge, intended for those in the Sannyasa (renunciant) stage of life. These texts explore metaphysical concepts and the nature of ultimate reality (Brahman).';
      case 'spiritual':
        return 'The Vedas serve as a vast repository of cosmic knowledge, encompassing hymns, rituals, philosophy, and metaphysical insights that have shaped Hindu culture for millennia. They bridge the gap between the supersensuous dimension beyond human intellect and humanity\'s everyday consciousness. The fundamental message of the Vedas centers on achieving moksha (liberation from the cycle of birth and death). They describe the creation, preservation, and ultimate dissolution of the universe, the development of the soul - its evolution, destiny, bondage, and freedom, and the deep-rooted relationship between matter and soul, the universe and living beings. The Vedas describe God in multiple forms - both as cosmic forces and ultimate reality. Deities like Agni (fire), Surya (sun), Indra (warrior-ruler), and Vayu (wind) symbolize natural and moral principles. Beyond these personified forces, Brahman represents the formless, infinite consciousness underlying all existence.';
      case 'scientific':
        return 'Beyond their spiritual significance, the Vedas provide mankind with values for everyday life and contain remarkable insights into various fields of knowledge. They include information about astronomy and mathematics, medicine and healing practices, agriculture and environmental science, psychology and consciousness studies, and social organization and governance. The Vedas continue to be relevant in today\'s world as they advocate solutions to all worldly problems through their comprehensive understanding of the relationship between matter and consciousness. Modern practitioners and scholars find valuable insights in Vedic approaches to wellness, sustainable living, and spiritual development.';
      case 'cultural':
        return 'The Vedas established the theological and philosophical foundation for what would become Hinduism. The historical Vedic religion (also called Vedism or Brahmanism) constituted the religious ideas and practices of the Indo-Aryan peoples during the Vedic period (c. 1500–500 BCE). The Vedic texts influenced the development of important social concepts, including the Indian caste system, which is based on a fable from the Vedas about the sacrifice of the deity Purusha. While this system has evolved and been reinterpreted over time, its origins trace back to Vedic social organization. The Vedic thought and culture reflected in the Rig Veda has maintained a continuous history of dominance in India for the last thirty-five hundred years. This remarkable continuity demonstrates the enduring relevance and adaptability of Vedic wisdom across changing historical periods.';
      case 'modern':
        return 'Contemporary scholarship recognizes the Vedas as among the world\'s most important ancient literary and religious texts. They represent invaluable sources for understanding ancient Indian history, culture, and spiritual development. Despite their ancient origins, the Vedas remain living texts within Hindu practice. Some Vedic rituals are still practiced today, maintaining an unbroken chain of tradition spanning thousands of years. Modern practitioners continue to chant Vedic mantras, perform Vedic ceremonies, and study Vedic philosophy as living wisdom rather than historical artifacts. In the modern era, digital platforms and educational institutions work to preserve and disseminate Vedic knowledge, making these ancient texts more accessible to contemporary students and practitioners worldwide.';
      case 'conclusion':
        return 'The Vedas represent humanity\'s earliest systematic exploration of cosmic truth, divine reality, and human purpose. As repositories of both spiritual wisdom and practical knowledge, they continue to offer guidance for those seeking understanding of life\'s deepest questions. For millions of Hindus, the Vedas are not just ancient scriptures but the eternal voice of Dharma, whose verses form the foundation upon which modern Hindu society stands. These sacred texts bridge the ancient and modern worlds, offering timeless insights into the nature of existence, consciousness, and the path to spiritual liberation. Their influence extends far beyond religious boundaries, contributing to humanity\'s understanding of philosophy, science, and the pursuit of wisdom. The Vedas remain a testament to the profound spiritual achievements of ancient India and continue to illuminate the path toward truth and enlightenment for seekers across the globe.';
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
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        showLanguageToggle={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Vedas content..."
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
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>
            {isHindi ? translations.content.title.hi : translations.content.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.intro.hi : translations.content.intro.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['divineNature'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.divineNature.hi : translations.sections.divineNature.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.divineNature.meaningOrigin.title.hi : translations.content.divineNature.meaningOrigin.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.divineNature.meaningOrigin.text1.hi : translations.content.divineNature.meaningOrigin.text1.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <HighlightedText 
            text={isHindi ? translations.content.divineNature.meaningOrigin.text2.hi : translations.content.divineNature.meaningOrigin.text2.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.divineNature.oralTradition.title.hi : translations.content.divineNature.oralTradition.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.divineNature.oralTradition.text.hi : translations.content.divineNature.oralTradition.text.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['historical'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.historical.hi : translations.sections.historical.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.historical.dating.title.hi : translations.content.historical.dating.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.historical.dating.text1.hi : translations.content.historical.dating.text1.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <HighlightedText 
            text={isHindi ? translations.content.historical.dating.text2.hi : translations.content.historical.dating.text2.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.historical.cultural.title.hi : translations.content.historical.cultural.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.historical.cultural.text.hi : translations.content.historical.cultural.text.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['fourVedas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.fourVedas.hi : translations.sections.fourVedas.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.fourVedas.rigveda.title.hi : translations.content.fourVedas.rigveda.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourVedas.rigveda.intro.hi : translations.content.fourVedas.rigveda.intro.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.li}>
            {isHindi ? translations.content.fourVedas.rigveda.list.item1.hi : translations.content.fourVedas.rigveda.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.fourVedas.rigveda.list.item2.hi : translations.content.fourVedas.rigveda.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.fourVedas.rigveda.list.item3.hi : translations.content.fourVedas.rigveda.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.fourVedas.rigveda.list.item4.hi : translations.content.fourVedas.rigveda.list.item4.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourVedas.rigveda.description.hi : translations.content.fourVedas.rigveda.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.fourVedas.yajurveda.title.hi : translations.content.fourVedas.yajurveda.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourVedas.yajurveda.description.hi : translations.content.fourVedas.yajurveda.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.fourVedas.samaveda.title.hi : translations.content.fourVedas.samaveda.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourVedas.samaveda.description.hi : translations.content.fourVedas.samaveda.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.fourVedas.atharvaveda.title.hi : translations.content.fourVedas.atharvaveda.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourVedas.atharvaveda.description.hi : translations.content.fourVedas.atharvaveda.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['fourFold'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.fourFold.title.hi : translations.content.fourFold.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.fourFold.samhitas.title.hi : translations.content.fourFold.samhitas.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourFold.samhitas.description.hi : translations.content.fourFold.samhitas.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.fourFold.brahmanas.title.hi : translations.content.fourFold.brahmanas.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourFold.brahmanas.description.hi : translations.content.fourFold.brahmanas.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.fourFold.aranyakas.title.hi : translations.content.fourFold.aranyakas.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourFold.aranyakas.description.hi : translations.content.fourFold.aranyakas.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.fourFold.upanishads.title.hi : translations.content.fourFold.upanishads.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.fourFold.upanishads.description.hi : translations.content.fourFold.upanishads.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.spiritual.title.hi : translations.content.spiritual.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.spiritual.cosmicKnowledge.title.hi : translations.content.spiritual.cosmicKnowledge.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.spiritual.cosmicKnowledge.description.hi : translations.content.spiritual.cosmicKnowledge.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.spiritual.liberation.title.hi : translations.content.spiritual.liberation.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.spiritual.liberation.intro.hi : translations.content.spiritual.liberation.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.spiritual.liberation.list.item1.hi : translations.content.spiritual.liberation.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.spiritual.liberation.list.item2.hi : translations.content.spiritual.liberation.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.spiritual.liberation.list.item3.hi : translations.content.spiritual.liberation.list.item3.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.spiritual.divineManifestation.title.hi : translations.content.spiritual.divineManifestation.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.spiritual.divineManifestation.description.hi : translations.content.spiritual.divineManifestation.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['scientific'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.scientific.title.hi : translations.content.scientific.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.scientific.ancientWisdom.title.hi : translations.content.scientific.ancientWisdom.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.scientific.ancientWisdom.intro.hi : translations.content.scientific.ancientWisdom.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.scientific.ancientWisdom.list.item1.hi : translations.content.scientific.ancientWisdom.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.scientific.ancientWisdom.list.item2.hi : translations.content.scientific.ancientWisdom.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.scientific.ancientWisdom.list.item3.hi : translations.content.scientific.ancientWisdom.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.scientific.ancientWisdom.list.item4.hi : translations.content.scientific.ancientWisdom.list.item4.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.scientific.ancientWisdom.list.item5.hi : translations.content.scientific.ancientWisdom.list.item5.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.scientific.ancientWisdom.timelessRelevance.title.hi : translations.content.scientific.ancientWisdom.timelessRelevance.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.scientific.ancientWisdom.timelessRelevance.description.hi : translations.content.scientific.ancientWisdom.timelessRelevance.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.cultural.title.hi : translations.content.cultural.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.foundation.title.hi : translations.content.cultural.foundation.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.cultural.foundation.description.hi : translations.content.cultural.foundation.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.socialStructure.title.hi : translations.content.cultural.socialStructure.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.cultural.socialStructure.description.hi : translations.content.cultural.socialStructure.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.continuousTradition.title.hi : translations.content.cultural.continuousTradition.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.cultural.continuousTradition.description.hi : translations.content.cultural.continuousTradition.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['modern'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.modern.title.hi : translations.content.modern.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.modern.academicRecognition.title.hi : translations.content.modern.academicRecognition.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.modern.academicRecognition.description.hi : translations.content.modern.academicRecognition.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.modern.livingTradition.title.hi : translations.content.modern.livingTradition.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.modern.livingTradition.description.hi : translations.content.modern.livingTradition.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.modern.digitalAge.title.hi : translations.content.modern.digitalAge.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.modern.digitalAge.description.hi : translations.content.modern.digitalAge.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? 'निष्कर्ष: शाश्वत ज्ञान' : 'Conclusion: The Eternal Wisdom'}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.conclusion.text1.hi : translations.content.conclusion.text1.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <HighlightedText 
            text={isHindi ? translations.content.conclusion.text2.hi : translations.content.conclusion.text2.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.references.hi : translations.sections.references.en}
          </Text>
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
  searchContainer: {
    width: '88%',
    marginTop: 14,
    marginBottom: 16,
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
  searchResultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsInfo: {
    flex: 1,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  searchNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#CCC',
  },
  navButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: '#999',
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
  navButtonTextInline: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});