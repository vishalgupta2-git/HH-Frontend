import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Linking, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function DhamsScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Hindi translations for sections
  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      charDham: { en: 'Char Dham: The Four Sacred Abodes', hi: 'चार धाम: चार पवित्र निवास' },
      chotaCharDham: { en: 'Chota Char Dham: Sacred Sites in Uttarakhand', hi: 'छोटा चार धाम: उत्तराखंड के पवित्र स्थल' },
      amarnath: { en: 'Amarnath Yatra: Sacred Cave Pilgrimage', hi: 'अमरनाथ यात्रा: पवित्र गुफा तीर्थयात्रा' },
      vaishnoDevi: { en: 'Vaishno Devi: Divine Mother Pilgrimage', hi: 'वैष्णो देवी: दिव्य माता तीर्थयात्रा' },
      kailash: { en: 'Kailash Mansarovar: Sacred Mountain and Lake', hi: 'कैलाश मानसरोवर: पवित्र पर्वत और झील' },
      varanasi: { en: 'Varanasi: City of Spiritual Enlightenment', hi: 'वाराणसी: आध्यात्मिक ज्ञानोदय का शहर' },
      haridwar: { en: 'Haridwar: Gateway to the Gods', hi: 'हरिद्वार: देवताओं का प्रवेश द्वार' },
      rishikesh: { en: 'Rishikesh: Yoga Capital of the World', hi: 'ऋषिकेश: विश्व की योग राजधानी' },
      significance: { en: 'Spiritual Significance of Pilgrimage', hi: 'तीर्थयात्रा का आध्यात्मिक महत्व' },
      cultural: { en: 'Cultural and Religious Importance', hi: 'सांस्कृतिक और धार्मिक महत्व' },
      historical: { en: 'Historical Background of Sacred Sites', hi: 'पवित्र स्थलों का ऐतिहासिक पृष्ठभूमि' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
      references: { en: 'References', hi: 'संदर्भ' },
    },
    content: {
      title: { en: 'Dhams and Yatras: Sacred Pilgrimage Sites of India', hi: 'धाम और यात्रा: भारत के पवित्र तीर्थ स्थल' },
      intro: { 
        en: 'India is home to countless sacred pilgrimage sites that have drawn devotees for thousands of years. These holy places, known as Dhams and Yatras, represent the spiritual heart of Hindu culture and tradition.',
        hi: 'भारत अनगिनत पवित्र तीर्थ स्थलों का घर है जो हजारों वर्षों से भक्तों को आकर्षित करते रहे हैं। ये पवित्र स्थान, जिन्हें धाम और यात्रा के रूप में जाना जाता है, हिंदू संस्कृति और परंपरा के आध्यात्मिक केंद्र का प्रतिनिधित्व करते हैं।'
      },
      foundation: {
        title: { en: 'The Divine Foundation', hi: 'दिव्य नींव' },
        text: { 
          en: 'Hindu tradition recognizes several types of sacred sites called "Dhams" (meaning "abodes"), which serve as divine dwelling places and pilgrimage destinations central to spiritual practice. These holy sites represent the physical manifestations of divine energy across the Indian subcontinent and form the backbone of Hindu pilgrimage culture. The yatra (Sanskrit for "journey") tradition connects these sacred spaces through transformative spiritual journeys.',
          hi: 'हिंदू परंपरा "धाम" (जिसका अर्थ है "निवास") नामक कई प्रकार के पवित्र स्थलों को पहचानती है, जो आध्यात्मिक अभ्यास के केंद्र में दिव्य निवास स्थान और तीर्थयात्रा गंतव्य के रूप में कार्य करते हैं। ये पवित्र स्थल भारतीय उपमहाद्वीप में दिव्य ऊर्जा के भौतिक अभिव्यक्ति का प्रतिनिधित्व करते हैं और हिंदू तीर्थयात्रा संस्कृति की रीढ़ बनाते हैं। यात्रा (संस्कृत में "यात्रा") परंपरा इन पवित्र स्थानों को रूपांतरकारी आध्यात्मिक यात्राओं के माध्यम से जोड़ती है।'
        }
      },
      charDham: {
        title: { en: 'The Char Dham: Four Sacred Abodes and Their Yatras', hi: 'चार धाम: चार पवित्र निवास और उनकी यात्राएं' },
        badaCharDham: {
          title: { en: 'Bada Char Dham - The Primary Four Dhams', hi: 'बड़ा चार धाम - प्राथमिक चार धाम' },
          intro: { 
            en: 'The Char Dham or Chatur Dhama is a set of four primary Hindu pilgrimage sites established by Adi Shankaracharya in the 8th century. These four sacred destinations are strategically located in the four cardinal directions of India, representing cosmic balance and spiritual completeness:',
            hi: 'चार धाम या चतुर्धाम 8वीं शताब्दी में आदि शंकराचार्य द्वारा स्थापित चार प्राथमिक हिंदू तीर्थ स्थलों का एक समूह है। ये चार पवित्र गंतव्य भारत के चार मुख्य दिशाओं में रणनीतिक रूप से स्थित हैं, जो ब्रह्मांडीय संतुलन और आध्यात्मिक पूर्णता का प्रतिनिधित्व करते हैं:'
          },
          badrinath: {
            title: { en: 'Badrinath - The Northern Sanctuary', hi: 'बद्रीनाथ - उत्तरी अभयारण्य' },
            description: { 
              en: 'Badrinath is situated at 10,400 feet above sea level in the Garhwal Himalayas of Uttarakhand. Built in the early ninth century AD, this temple is one of India\'s most revered Hindu shrines. The Badrinath temple is positioned between the Nar and Narayan mountain ranges with the magnificent Neelkanth peak as its backdrop. This shrine of Lord Vishnu represents Satya Yuga (the age of truth). The temple features the Tap Kund, a hot spring believed to wash away sins of devotees who take a sacred dip.',
              hi: 'बद्रीनाथ उत्तराखंड के गढ़वाल हिमालय में समुद्र तल से 10,400 फीट की ऊंचाई पर स्थित है। नौवीं शताब्दी ईस्वी की शुरुआत में निर्मित, यह मंदिर भारत के सबसे प्रतिष्ठित हिंदू मंदिरों में से एक है। बद्रीनाथ मंदिर नार और नारायण पर्वत श्रृंखलाओं के बीच स्थित है जिसकी पृष्ठभूमि में भव्य नीलकंठ चोटी है। भगवान विष्णु का यह मंदिर सतयुग (सत्य का युग) का प्रतिनिधित्व करता है। मंदिर में तप कुंड है, एक गर्म झरना जो माना जाता है कि पवित्र स्नान करने वाले भक्तों के पापों को धो देता है।'
            }
          },
          dwarka: {
            title: { en: 'Dwarka - The Western Divine City', hi: 'द्वारका - पश्चिमी दिव्य शहर' },
            description: { 
              en: 'Dwarka in Gujarat serves as the western pilgrimage point, representing Lord Krishna\'s divine kingdom. This shrine of Lord Vishnu symbolizes Dvapara Yuga (the third cosmic age). According to Hindu mythology, Lord Vishnu retires at Dwarka after completing his daily cosmic duties.',
              hi: 'गुजरात में द्वारका पश्चिमी तीर्थयात्रा बिंदु के रूप में कार्य करता है, जो भगवान कृष्ण के दिव्य राज्य का प्रतिनिधित्व करता है। भगवान विष्णु का यह मंदिर द्वापर युग (तीसरा ब्रह्मांडीय युग) का प्रतीक है। हिंदू पौराणिक कथाओं के अनुसार, भगवान विष्णु अपने दैनिक ब्रह्मांडीय कर्तव्यों को पूरा करने के बाद द्वारका में विश्राम करते हैं।'
            }
          },
          puri: {
            title: { en: 'Puri - The Eastern Sacred Center', hi: 'पुरी - पूर्वी पवित्र केंद्र' },
            description: { 
              en: 'Jagannath Puri in Odisha holds tremendous religious significance due to its famous Jagannath Temple. This eastern shrine represents Kali Yuga (the current age) and is where Lord Vishnu is believed to dine. The temple is renowned for its annual Rath Yatra (chariot festival) that attracts millions of devotees. The temple features the world\'s largest kitchen and houses idols of Lord Jagannath (Krishna), Lord Balabhadra, and Goddess Subhadra.',
              hi: 'ओडिशा में जगन्नाथ पुरी अपने प्रसिद्ध जगन्नाथ मंदिर के कारण अत्यधिक धार्मिक महत्व रखता है। यह पूर्वी मंदिर कलियुग (वर्तमान युग) का प्रतिनिधित्व करता है और यहीं भगवान विष्णु भोजन करते हैं। मंदिर अपने वार्षिक रथ यात्रा (रथ उत्सव) के लिए प्रसिद्ध है जो लाखों भक्तों को आकर्षित करता है। मंदिर में दुनिया का सबसे बड़ा रसोईघर है और भगवान जगन्नाथ (कृष्ण), भगवान बलभद्र और देवी सुभद्रा की मूर्तियां हैं।'
            }
          },
          rameswaram: {
            title: { en: 'Rameswaram - The Southern Holy Island', hi: 'रामेश्वरम - दक्षिणी पवित्र द्वीप' },
            description: { 
              en: 'Rameswaram in Tamil Nadu is unique as the only Shiva temple among the four Dhams. Located on an island, it represents Treta Yuga (the second cosmic age). The Ramanathaswamy Temple features forty wells where each well\'s water tastes different from the others. The temple boasts the world\'s longest corridor, measuring 690 feet east-west and 435 feet north-south, supported by 1,212 intricately carved pillars. According to Hindu mythology, Lord Vishnu takes his sacred bath at Rameswaram. The temple has many holy water bodies called tirthams, where taking a bath is considered highly auspicious.',
              hi: 'तमिलनाडु में रामेश्वरम चार धामों में से एकमात्र शिव मंदिर के रूप में अनूठा है। एक द्वीप पर स्थित, यह त्रेता युग (दूसरा ब्रह्मांडीय युग) का प्रतिनिधित्व करता है। रामनाथस्वामी मंदिर में चालीस कुएं हैं जहां प्रत्येक कुएं का पानी दूसरों से अलग स्वाद का है। मंदिर में दुनिया का सबसे लंबा गलियारा है, जो पूर्व-पश्चिम में 690 फीट और उत्तर-दक्षिण में 435 फीट मापता है, जो 1,212 जटिल रूप से नक्काशीदार स्तंभों द्वारा समर्थित है। हिंदू पौराणिक कथाओं के अनुसार, भगवान विष्णु रामेश्वरम में अपना पवित्र स्नान करते हैं। मंदिर में कई पवित्र जल निकाय हैं जिन्हें तीर्थम कहा जाता है, जहां स्नान करना अत्यधिक शुभ माना जाता है।'
            }
          }
        }
      },
      chotaCharDham: {
        title: { en: 'Chota Char Dham - The Himalayan Circuit', hi: 'छोटा चार धाम - हिमालयी सर्किट' },
        intro: { 
          en: 'The Chota Char Dham (meaning "Small Four Dhams") comprises four sacred sites nestled in the Himalayan region of Uttarakhand. This circuit includes:',
          hi: 'छोटा चार धाम (जिसका अर्थ है "छोटे चार धाम") उत्तराखंड के हिमालयी क्षेत्र में स्थित चार पवित्र स्थलों से बना है। इस सर्किट में शामिल हैं:'
        },
        list: {
          item1: { en: '• Yamunotri - Dedicated to Goddess Yamuna, the source of the Yamuna River', hi: '• यमुनोत्री - देवी यमुना को समर्पित, यमुना नदी का स्रोत' },
          item2: { en: '• Gangotri - Sacred to Goddess Ganga, the origin of the Ganges River', hi: '• गंगोत्री - देवी गंगा को पवित्र, गंगा नदी की उत्पत्ति' },
          item3: { en: '• Kedarnath - A revered Shiva temple and one of the twelve Jyotirlingas', hi: '• केदारनाथ - एक प्रतिष्ठित शिव मंदिर और बारह ज्योतिर्लिंगों में से एक' },
          item4: { en: '• Badrinath - The Vishnu shrine also part of the main Char Dham', hi: '• बद्रीनाथ - विष्णु मंदिर जो मुख्य चार धाम का भी हिस्सा है' }
        },
        description: { 
          en: 'The Chota Char Dham pilgrimage typically follows the sequence of Yamunotri, Gangotri, Kedarnath, and Badrinath. These temples remain closed during winter months and open with summer\'s arrival, welcoming thousands of pilgrims annually. The Kedarnath Temple is particularly significant as it remains open for only six months each year due to heavy snowfall, yet attracts millions of devotees during this short period.',
          hi: 'छोटा चार धाम तीर्थयात्रा आमतौर पर यमुनोत्री, गंगोत्री, केदारनाथ और बद्रीनाथ के क्रम का पालन करती है। ये मंदिर सर्दियों के महीनों के दौरान बंद रहते हैं और गर्मियों के आगमन के साथ खुलते हैं, जो हजारों तीर्थयात्रियों का वार्षिक स्वागत करते हैं। केदारनाथ मंदिर विशेष रूप से महत्वपूर्ण है क्योंकि भारी बर्फबारी के कारण यह प्रति वर्ष केवल छह महीने खुला रहता है, फिर भी इस छोटी अवधि के दौरान लाखों भक्तों को आकर्षित करता है।'
        }
      },
      amarnath: {
        title: { en: 'Amarnath Yatra - The Sacred Ice Lingam Pilgrimage', hi: 'अमरनाथ यात्रा - पवित्र बर्फ लिंग तीर्थयात्रा' },
        description: { 
          en: 'The Amarnath Yatra is one of the most challenging and revered pilgrimages in Hinduism. Located in Jammu and Kashmir, the Amarnath Cave is dedicated to Lord Shiva. Every year, an ice Shiva Lingam forms naturally inside the cave, along with two other ice formations representing Ganesha and Mother Parvati. The main Shiva lingam waxes and wanes with the phases of the moon, reaching its peak during summer. Over 600,000 devotees visit during the season, undertaking a physically demanding 5-day journey on foot from Srinagar or Pahalgam.',
          hi: 'अमरनाथ यात्रा हिंदू धर्म में सबसे चुनौतीपूर्ण और प्रतिष्ठित तीर्थयात्राओं में से एक है। जम्मू और कश्मीर में स्थित, अमरनाथ गुफा भगवान शिव को समर्पित है। हर साल, गुफा के अंदर एक बर्फ का शिव लिंग प्राकृतिक रूप से बनता है, साथ ही गणेश और माता पार्वती का प्रतिनिधित्व करने वाले दो अन्य बर्फ के निर्माण भी। मुख्य शिव लिंग चंद्रमा के चरणों के साथ बढ़ता और घटता है, गर्मियों के दौरान अपने चरम पर पहुंचता है। मौसम के दौरान 600,000 से अधिक भक्त श्रीनगर या पहलगाम से पैदल 5 दिन की शारीरिक रूप से मांग वाली यात्रा करते हुए आते हैं।'
        }
      },
      vaishnoDevi: {
        title: { en: 'Vaishno Devi Yatra - The Divine Mother\'s Call', hi: 'वैष्णो देवी यात्रा - दिव्य माता का आह्वान' },
        description: { 
          en: 'The Vaishno Devi Yatra in Jammu and Kashmir is one of India\'s most popular pilgrimages. Millions of devotees trek to the sacred cave shrine of Mata Vaishno Devi, believed to fulfill the wishes of sincere devotees. The journey involves a trek through mountainous terrain to reach the holy cave where the goddess is worshipped in the form of three natural rock formations (pindies).',
          hi: 'जम्मू और कश्मीर में वैष्णो देवी यात्रा भारत की सबसे लोकप्रिय तीर्थयात्राओं में से एक है। लाखों भक्त माता वैष्णो देवी के पवित्र गुफा मंदिर की यात्रा करते हैं, जो ईमानदार भक्तों की इच्छाओं को पूरा करने के लिए माना जाता है। यात्रा में पहाड़ी इलाके से होकर पवित्र गुफा तक पहुंचना शामिल है जहां देवी की तीन प्राकृतिक चट्टानी निर्माणों (पिंडियों) के रूप में पूजा की जाती है।'
        }
      },
      kailash: {
        title: { en: 'Kailash Mansarovar Yatra - The Ultimate Shiva Pilgrimage', hi: 'कैलाश मानसरोवर यात्रा - परम शिव तीर्थयात्रा' },
        description: { 
          en: 'The Kailash Mansarovar Yatra is considered the most sacred and challenging pilgrimage for devotees of Lord Shiva. Mount Kailash in Tibet is believed to be Shiva\'s heavenly abode, while Lake Mansarovar is considered the most sacred lake. This high-altitude pilgrimage requires significant physical preparation and is considered the ultimate spiritual journey for Shiva devotees.',
          hi: 'कैलाश मानसरोवर यात्रा भगवान शिव के भक्तों के लिए सबसे पवित्र और चुनौतीपूर्ण तीर्थयात्रा मानी जाती है। तिब्बत में कैलाश पर्वत को शिव का स्वर्गीय निवास माना जाता है, जबकि मानसरोवर झील को सबसे पवित्र झील माना जाता है। इस उच्च-ऊंचाई वाली तीर्थयात्रा के लिए महत्वपूर्ण शारीरिक तैयारी की आवश्यकता होती है और इसे शिव भक्तों के लिए परम आध्यात्मिक यात्रा माना जाता है।'
        }
      },
      varanasi: {
        title: { en: 'Varanasi: City of Spiritual Enlightenment', hi: 'वाराणसी: आध्यात्मिक ज्ञानोदय का शहर' },
        description: { 
          en: 'Varanasi, also known as Kashi, is one of the oldest continuously inhabited cities in the world. It is considered the spiritual capital of India and is revered as the holiest city for Hindus. The city is home to numerous sacred sites, including the Ganga Aarti at the Dashashwamedh Ghat, the Kashi Vishwanath Temple, and the Sankat Mochan Hanuman Temple. Varanasi is believed to be the birthplace of Lord Shiva and is associated with Lord Krishna\'s divine birth. The city\'s spiritual significance is further enhanced by the fact that Lord Vishnu, Lord Shiva, and Lord Brahma are believed to have appeared here in different avatars.',
          hi: 'वाराणसी, जिसे काशी के नाम से भी जाना जाता है, दुनिया के सबसे पुराने लगातार बसे शहरों में से एक है। इसे भारत की आध्यात्मिक राजधानी माना जाता है और हिंदुओं के लिए सबसे पवित्र शहर के रूप में पूजा जाता है। शहर में कई पवित्र स्थल हैं, जिनमें दशाश्वमेध घाट पर गंगा आरती, काशी विश्वनाथ मंदिर और संकट मोचन हनुमान मंदिर शामिल हैं। वाराणसी को भगवान शिव का जन्मस्थान माना जाता है और यह भगवान कृष्ण के दिव्य जन्म से जुड़ा है। शहर का आध्यात्मिक महत्व इस तथ्य से और बढ़ जाता है कि भगवान विष्णु, भगवान शिव और भगवान ब्रह्मा के विभिन्न अवतारों में यहां प्रकट होने का माना जाता है।'
        }
      },
      haridwar: {
        title: { en: 'Haridwar: Gateway to the Gods', hi: 'हरिद्वार: देवताओं का प्रवेश द्वार' },
        description: { 
          en: 'Haridwar is one of the four most important pilgrimage sites in India, known as Pancha Bhoota Stalam (Five Abodes of the Elements). It is situated on the banks of the River Ganga, which is considered the most sacred river in Hinduism. The city is home to the famous Har Ki Pauri, where Lord Vishnu is believed to have appeared as a child. Haridwar is also known for its numerous temples, including the Mansa Devi Temple, the Neelkanth Mahadev Temple, and the Bharat Mata Mandir. It is considered a gateway to the Himalayas and is a place of pilgrimage for both Hindus and Buddhists.',
          hi: 'हरिद्वार भारत के चार सबसे महत्वपूर्ण तीर्थ स्थलों में से एक है, जिसे पंच भूत स्थलम (तत्वों के पांच निवास) के रूप में जाना जाता है। यह गंगा नदी के तट पर स्थित है, जिसे हिंदू धर्म में सबसे पवित्र नदी माना जाता है। शहर में प्रसिद्ध हर की पौड़ी है, जहां भगवान विष्णु के बच्चे के रूप में प्रकट होने का माना जाता है। हरिद्वार अपने कई मंदिरों के लिए भी जाना जाता है, जिनमें मनसा देवी मंदिर, नीलकंठ महादेव मंदिर और भारत माता मंदिर शामिल हैं। इसे हिमालय का प्रवेश द्वार माना जाता है और यह हिंदुओं और बौद्धों दोनों के लिए तीर्थ स्थल है।'
        }
      },
      rishikesh: {
        title: { en: 'Rishikesh: Yoga Capital of the World', hi: 'ऋषिकेश: विश्व की योग राजधानी' },
        description: { 
          en: 'Rishikesh is a holy city located in the Himalayan foothills of Uttarakhand, known for its association with Lord Vishnu\'s incarnation as Lord Rama. It is also a renowned center for yoga and meditation. The city is home to the famous Laxman Jhula, a suspension bridge over the River Ganga, and the famous Beatles Ashram. Rishikesh is considered a gateway to the Himalayas and is a place of pilgrimage for devotees of Lord Rama and Lord Shiva.',
          hi: 'ऋषिकेश उत्तराखंड के हिमालयी तलहटी में स्थित एक पवित्र शहर है, जो भगवान विष्णु के भगवान राम के रूप में अवतार के साथ अपने संबंध के लिए जाना जाता है। यह योग और ध्यान के लिए भी एक प्रसिद्ध केंद्र है। शहर में प्रसिद्ध लक्ष्मण झूला है, गंगा नदी पर एक सस्पेंशन ब्रिज, और प्रसिद्ध बीटल्स आश्रम। ऋषिकेश को हिमालय का प्रवेश द्वार माना जाता है और यह भगवान राम और भगवान शिव के भक्तों के लिए तीर्थ स्थल है।'
        }
      },
      significance: {
        title: { en: 'Spiritual Significance and Benefits', hi: 'आध्यात्मिक महत्व और लाभ' },
        moksha: {
          title: { en: 'The Path to Moksha', hi: 'मोक्ष का मार्ग' },
          intro: { 
            en: 'Visiting these various Dhams and completing their associated yatras is believed to help devotees achieve moksha (liberation from the cycle of birth and death). Each type of sacred journey offers unique spiritual benefits:',
            hi: 'इन विभिन्न धामों का दौरा करना और उनकी संबंधित यात्राओं को पूरा करना भक्तों को मोक्ष (जन्म और मृत्यु के चक्र से मुक्ति) प्राप्त करने में मदद करने के लिए माना जाता है। प्रत्येक प्रकार की पवित्र यात्रा अद्वितीय आध्यात्मिक लाभ प्रदान करती है:'
          },
          list: {
            item1: { en: '• Char Dham completion brings overall spiritual purification and divine blessings', hi: '• चार धाम पूरा करना समग्र आध्यात्मिक शुद्धि और दिव्य आशीर्वाद लाता है' },
            item2: { en: '• Jyotirlinga circuits provide connection with Shiva\'s infinite light and protection', hi: '• ज्योतिर्लिंग सर्किट शिव के अनंत प्रकाश और सुरक्षा के साथ संबंध प्रदान करते हैं' },
            item3: { en: '• Shakti Peetha pilgrimages offer access to divine feminine energy and transformation', hi: '• शक्ति पीठ तीर्थयात्राएं दिव्य स्त्री ऊर्जा और रूपांतरण तक पहुंच प्रदान करती हैं' },
            item4: { en: '• Seasonal yatras like Kumbh Mela provide collective spiritual energy and community bonding', hi: '• कुंभ मेला जैसी मौसमी यात्राएं सामूहिक आध्यात्मिक ऊर्जा और समुदायिक बंधन प्रदान करती हैं' }
          }
        },
        transformative: {
          title: { en: 'Transformative Journey Experience', hi: 'रूपांतरकारी यात्रा अनुभव' },
          intro: { 
            en: 'Hindu yatras represent more than mere travel - they are transformative spiritual experiences that:',
            hi: 'हिंदू यात्राएं केवल यात्रा से अधिक का प्रतिनिधित्व करती हैं - वे रूपांतरकारी आध्यात्मिक अनुभव हैं जो:'
          },
          list: {
            item1: { en: '• Test devotion through physical and mental challenges', hi: '• शारीरिक और मानसिक चुनौतियों के माध्यम से भक्ति की परीक्षा लेते हैं' },
            item2: { en: '• Purify consciousness through sacred rituals and holy site visits', hi: '• पवित्र अनुष्ठानों और पवित्र स्थलों की यात्राओं के माध्यम से चेतना को शुद्ध करते हैं' },
            item3: { en: '• Build community through shared pilgrimage experiences', hi: '• साझा तीर्थयात्रा अनुभवों के माध्यम से समुदाय का निर्माण करते हैं' },
            item4: { en: '• Develop surrender by placing trust in divine providence during the journey', hi: '• यात्रा के दौरान दिव्य प्रदान में विश्वास रखकर समर्पण विकसित करते हैं' }
          }
        },
        modernInfrastructure: {
          title: { en: 'Modern Pilgrimage Infrastructure', hi: 'आधुनिक तीर्थयात्रा बुनियादी ढांचा' },
          intro: { 
            en: 'Contemporary yatra infrastructure includes:',
            hi: 'समकालीन यात्रा बुनियादी ढांचे में शामिल हैं:'
          },
          list: {
            item1: { en: '• Organized tour circuits facilitating group pilgrimages', hi: '• समूह तीर्थयात्राओं को सुविधाजनक बनाने वाले संगठित दौरे सर्किट' },
            item2: { en: '• Government support for safety and accessibility', hi: '• सुरक्षा और पहुंच के लिए सरकारी सहायता' },
            item3: { en: '• Digital platforms for registration and information', hi: '• पंजीकरण और जानकारी के लिए डिजिटल प्लेटफॉर्म' },
            item4: { en: '• Transportation improvements making remote sites more accessible', hi: '• परिवहन सुधार जो दूरस्थ स्थलों को अधिक सुलभ बनाते हैं' },
            item5: { en: '• Accommodation facilities along pilgrimage routes', hi: '• तीर्थयात्रा मार्गों के साथ आवास सुविधाएं' }
          }
        }
      },
      cultural: {
        title: { en: 'Cultural and Religious Impact', hi: 'सांस्कृतिक और धार्मिक प्रभाव' },
        intro: { 
          en: 'The Hindu yatra system creates a vast network of spiritual connectivity across India, promoting:',
          hi: 'हिंदू यात्रा प्रणाली भारत भर में आध्यात्मिक संपर्क का एक विशाल नेटवर्क बनाती है, जो प्रोत्साहित करती है:'
        },
        list: {
          item1: { en: '• National integration through inter-regional pilgrimage', hi: '• अंतर-क्षेत्रीय तीर्थयात्रा के माध्यम से राष्ट्रीय एकीकरण' },
          item2: { en: '• Cultural preservation of ancient traditions and practices', hi: '• प्राचीन परंपराओं और प्रथाओं का सांस्कृतिक संरक्षण' },
          item3: { en: '• Economic development of pilgrimage centers and routes', hi: '• तीर्थ केंद्रों और मार्गों का आर्थिक विकास' },
          item4: { en: '• Spiritual democracy making divine access available to all social levels', hi: '• आध्यात्मिक लोकतंत्र जो सभी सामाजिक स्तरों के लिए दिव्य पहुंच उपलब्ध कराता है' }
        },
        conclusion: { 
          en: 'This comprehensive system of Dhams and yatras represents one of humanity\'s most extensive sacred geography, offering multiple pathways to spiritual fulfillment and divine realization. Whether through the cosmic completeness of the Char Dham, the transformative power of Himalayan yatras, or the community experience of festival pilgrimages, these sacred journeys continue to provide millions of Hindus with profound spiritual experiences and lasting transformation.',
          hi: 'धामों और यात्राओं की यह व्यापक प्रणाली मानवता के सबसे व्यापक पवित्र भूगोल में से एक का प्रतिनिधित्व करती है, जो आध्यात्मिक पूर्ति और दिव्य साक्षात्कार के लिए कई मार्ग प्रदान करती है। चाहे चार धाम की ब्रह्मांडीय पूर्णता के माध्यम से, हिमालयी यात्राओं की रूपांतरकारी शक्ति के माध्यम से, या त्योहार तीर्थयात्राओं के सामुदायिक अनुभव के माध्यम से, ये पवित्र यात्राएं लाखों हिंदुओं को गहन आध्यात्मिक अनुभव और स्थायी रूपांतरण प्रदान करना जारी रखती हैं।'
        }
      },
      historical: {
        title: { en: 'Historical Background of Sacred Sites', hi: 'पवित्र स्थलों का ऐतिहासिक पृष्ठभूमि' },
        description: { 
          en: 'The Char Dham, Chota Char Dham, and other major yatras have deep historical roots. Many of these sites were established by revered Hindu saints and sages, and their significance has been documented in ancient texts and scriptures. The yatra tradition itself is believed to have originated from the teachings of Lord Rama and Lord Krishna, who themselves undertook extensive pilgrimages. Over time, these sacred journeys evolved into organized pilgrimages, with specific rituals, timings, and routes. The yatra system is not only a means of spiritual purification but also a means of preserving and promoting ancient Hindu traditions and cultural heritage.',
          hi: 'चार धाम, छोटा चार धाम और अन्य प्रमुख यात्राओं की गहरी ऐतिहासिक जड़ें हैं। इनमें से कई स्थलों की स्थापना प्रतिष्ठित हिंदू संतों और ऋषियों द्वारा की गई थी, और उनके महत्व को प्राचीन ग्रंथों और शास्त्रों में दस्तावेज किया गया है। यात्रा परंपरा का मूल स्वयं भगवान राम और भगवान कृष्ण की शिक्षाओं से माना जाता है, जिन्होंने स्वयं व्यापक तीर्थयात्राएं कीं। समय के साथ, ये पवित्र यात्राएं विशिष्ट अनुष्ठानों, समय और मार्गों के साथ संगठित तीर्थयात्राओं में विकसित हुईं। यात्रा प्रणाली न केवल आध्यात्मिक शुद्धि का साधन है बल्कि प्राचीन हिंदू परंपराओं और सांस्कृतिक विरासत को संरक्षित और प्रोत्साहित करने का भी साधन है।'
        }
      },
      conclusion: {
        title: { en: 'Conclusion', hi: 'निष्कर्ष' },
        description: { 
          en: 'The Hindu yatra system is a comprehensive and intricate network of sacred pilgrimage sites and spiritual journeys. These holy destinations, known as Dhams, represent the physical manifestations of divine energy and provide devotees with opportunities to experience profound spiritual awakening. The yatra tradition, with its diverse range of sites and rituals, serves as a powerful tool for spiritual transformation, community bonding, and cultural preservation. Whether one undertakes a simple pilgrimage to a local temple or a challenging journey to a remote sacred site, the experience is transformative and deeply meaningful for those who undertake it with devotion and sincerity.',
          hi: 'हिंदू यात्रा प्रणाली पवित्र तीर्थ स्थलों और आध्यात्मिक यात्राओं का एक व्यापक और जटिल नेटवर्क है। ये पवित्र गंतव्य, जिन्हें धाम के नाम से जाना जाता है, दिव्य ऊर्जा के भौतिक अभिव्यक्ति का प्रतिनिधित्व करते हैं और भक्तों को गहन आध्यात्मिक जागृति का अनुभव करने के अवसर प्रदान करते हैं। यात्रा परंपरा, अपनी विविध स्थलों और अनुष्ठानों के साथ, आध्यात्मिक रूपांतरण, समुदायिक बंधन और सांस्कृतिक संरक्षण के लिए एक शक्तिशाली उपकरण के रूप में कार्य करती है। चाहे कोई स्थानीय मंदिर की साधारण तीर्थयात्रा करे या दूरस्थ पवित्र स्थल की चुनौतीपूर्ण यात्रा करे, अनुभव रूपांतरकारी और उन लोगों के लिए गहरा अर्थपूर्ण है जो इसे भक्ति और ईमानदारी के साथ करते हैं।'
        }
      }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'charDham', title: isHindi ? translations.sections.charDham.hi : translations.sections.charDham.en },
    { key: 'chotaCharDham', title: isHindi ? translations.sections.chotaCharDham.hi : translations.sections.chotaCharDham.en },
    { key: 'amarnath', title: isHindi ? translations.sections.amarnath.hi : translations.sections.amarnath.en },
    { key: 'vaishnoDevi', title: isHindi ? translations.sections.vaishnoDevi.hi : translations.sections.vaishnoDevi.en },
    { key: 'kailash', title: isHindi ? translations.sections.kailash.hi : translations.sections.kailash.en },
    { key: 'varanasi', title: isHindi ? translations.sections.varanasi.hi : translations.sections.varanasi.en },
    { key: 'haridwar', title: isHindi ? translations.sections.haridwar.hi : translations.sections.haridwar.en },
    { key: 'rishikesh', title: isHindi ? translations.sections.rishikesh.hi : translations.sections.rishikesh.en },
    { key: 'significance', title: isHindi ? translations.sections.significance.hi : translations.sections.significance.en },
    { key: 'cultural', title: isHindi ? translations.sections.cultural.hi : translations.sections.cultural.en },
    { key: 'historical', title: isHindi ? translations.sections.historical.hi : translations.sections.historical.en },
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
          if (context.pageId === 'dhams' && context.query) {
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
      case 'intro':
        return 'The concept of Dhams (sacred abodes) and Yatras (pilgrimages) represents one of the most profound aspects of Hindu spiritual practice. These sacred journeys connect devotees to divine energy centers, allowing them to experience spiritual transformation through physical travel and ritual observance. The tradition of pilgrimage in Hinduism dates back thousands of years and continues to be a vital part of spiritual practice for millions of devotees worldwide.';
      case 'charDham':
        return 'The Char Dham (Four Sacred Abodes) represents the four most important pilgrimage sites in Hinduism. These sacred destinations are located in the four cardinal directions of India and are considered essential for achieving moksha (liberation). The four sites are: Badrinath in the North (Uttarakhand), Dwarka in the West (Gujarat), Rameshwaram in the South (Tamil Nadu), and Puri in the East (Odisha). Each of these sacred sites is associated with different aspects of the divine and offers unique spiritual experiences.';
      case 'chotaCharDham':
        return 'The Chota Char Dham (Small Four Sacred Abodes) consists of four sacred sites located in the Garhwal region of Uttarakhand. These sites are: Yamunotri (source of Yamuna River), Gangotri (source of Ganga River), Kedarnath (abode of Lord Shiva), and Badrinath (abode of Lord Vishnu). This circuit is particularly popular among devotees seeking spiritual purification and connection with the divine through nature.';
      case 'amarnath':
        return 'The Amarnath Yatra is one of the most challenging and spiritually significant pilgrimages in Hinduism. Located in the Kashmir Valley, this sacred cave houses a naturally formed ice lingam that represents Lord Shiva. The journey to Amarnath involves trekking through difficult terrain at high altitudes, symbolizing the spiritual discipline required for divine realization.';
      case 'vaishnoDevi':
        return 'Vaishno Devi is one of the most visited pilgrimage sites in India, dedicated to the Divine Mother in her form as Vaishno Devi. Located in the Trikuta Mountains of Jammu and Kashmir, this sacred cave temple attracts millions of devotees annually. The pilgrimage involves a challenging trek that symbolizes the spiritual journey toward divine grace and protection.';
      case 'kailash':
        return 'Mount Kailash and Lake Mansarovar represent the ultimate pilgrimage destination for many Hindu devotees. Located in Tibet, this sacred mountain is believed to be the abode of Lord Shiva and represents the pinnacle of spiritual achievement. The journey to Kailash Mansarovar is considered one of the most spiritually transformative experiences in Hinduism.';
      case 'varanasi':
        return 'Varanasi, also known as Kashi, is one of the oldest continuously inhabited cities in the world and represents the spiritual heart of Hinduism. This sacred city is located on the banks of the Ganga River and is considered the ultimate destination for spiritual seekers. Varanasi is famous for its ghats, temples, and the spiritual atmosphere that permeates every aspect of life in the city.';
      case 'haridwar':
        return 'Haridwar, meaning "Gateway to the Gods," is one of the seven holiest cities in Hinduism. Located where the Ganga River enters the plains from the mountains, this sacred city is famous for its ghats, temples, and the Kumbh Mela festival. Haridwar serves as a major center for spiritual learning and practice.';
      case 'rishikesh':
        return 'Rishikesh, known as the "Yoga Capital of the World," is a sacred city located in the foothills of the Himalayas. This spiritual center is famous for its ashrams, yoga schools, and the peaceful atmosphere that attracts spiritual seekers from around the world. Rishikesh represents the perfect environment for spiritual practice and self-realization.';
      case 'significance':
        return 'The spiritual significance of pilgrimage in Hinduism extends beyond mere physical travel. These sacred journeys represent the inner journey of the soul toward divine realization. Through pilgrimage, devotees develop qualities such as patience, discipline, humility, and devotion, which are essential for spiritual progress.';
      case 'cultural':
        return 'Pilgrimage sites serve as important centers for cultural preservation and transmission. These sacred destinations maintain ancient traditions, rituals, and knowledge that might otherwise be lost. The cultural significance of pilgrimage extends beyond religious boundaries and contributes to the preservation of India\'s rich cultural heritage.';
      case 'historical':
        return 'The historical background of sacred sites reveals the deep roots of Hindu spiritual practice. Many of these sites have been centers of spiritual activity for thousands of years, serving as meeting points for sages, scholars, and devotees. The historical significance of these sites adds to their spiritual value and authenticity.';
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

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel(isHindi ? 'विषय' : 'Topic');
    });
  };

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Char_Dham' },
    { id: 2, url: 'https://www.badrinath-kedarnath.gov.in/' },
    { id: 3, url: 'https://www.shrijagannathtemplepuri.com/' },
    { id: 4, url: 'https://www.rameshwaramtemple.tn.gov.in/' },
    { id: 5, url: 'https://www.amarnath.org/' },
    { id: 6, url: 'https://www.maavaishnodevi.org/' },
    { id: 7, url: 'https://kailashmansarovar.org/' },
    { id: 8, url: 'https://varanasi.nic.in/' },
    { id: 9, url: 'https://haridwar.nic.in/' },
    { id: 10, url: 'https://rishikesh.nic.in/' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search for Dhams"
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
                placeholder="Search through Dhams content..."
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

        <View style={styles.card} onLayout={(e) => (sectionY.current['foundation'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.foundation.title.hi : translations.content.foundation.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.foundation.text.hi : translations.content.foundation.text.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['charDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.charDham.title.hi : translations.content.charDham.title.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.charDham.badaCharDham.title.hi : translations.content.charDham.badaCharDham.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.badaCharDham.intro.hi : translations.content.charDham.badaCharDham.intro.en}
          </Text>

          <Text style={styles.h4}>
            {isHindi ? translations.content.charDham.badaCharDham.badrinath.title.hi : translations.content.charDham.badaCharDham.badrinath.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.badaCharDham.badrinath.description.hi : translations.content.charDham.badaCharDham.badrinath.description.en}
          </Text>

          <Text style={styles.h4}>
            {isHindi ? translations.content.charDham.badaCharDham.dwarka.title.hi : translations.content.charDham.badaCharDham.dwarka.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.badaCharDham.dwarka.description.hi : translations.content.charDham.badaCharDham.dwarka.description.en}
          </Text>

          <Text style={styles.h4}>
            {isHindi ? translations.content.charDham.badaCharDham.puri.title.hi : translations.content.charDham.badaCharDham.puri.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.badaCharDham.puri.description.hi : translations.content.charDham.badaCharDham.puri.description.en}
          </Text>

          <Text style={styles.h4}>
            {isHindi ? translations.content.charDham.badaCharDham.rameswaram.title.hi : translations.content.charDham.badaCharDham.rameswaram.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.badaCharDham.rameswaram.description.hi : translations.content.charDham.badaCharDham.rameswaram.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['chotaCharDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h3}>
            {isHindi ? translations.content.chotaCharDham.title.hi : translations.content.chotaCharDham.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.chotaCharDham.intro.hi : translations.content.chotaCharDham.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.chotaCharDham.list.item1.hi : translations.content.chotaCharDham.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.chotaCharDham.list.item2.hi : translations.content.chotaCharDham.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.chotaCharDham.list.item3.hi : translations.content.chotaCharDham.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.chotaCharDham.list.item4.hi : translations.content.chotaCharDham.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.chotaCharDham.description.hi : translations.content.chotaCharDham.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['amarnath'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.amarnath.title.hi : translations.content.amarnath.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.amarnath.description.hi : translations.content.amarnath.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['vaishnoDevi'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.vaishnoDevi.title.hi : translations.content.vaishnoDevi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vaishnoDevi.description.hi : translations.content.vaishnoDevi.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['kailash'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.kailash.title.hi : translations.content.kailash.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.kailash.description.hi : translations.content.kailash.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['varanasi'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.varanasi.title.hi : translations.content.varanasi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.varanasi.description.hi : translations.content.varanasi.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['haridwar'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.haridwar.title.hi : translations.content.haridwar.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.haridwar.description.hi : translations.content.haridwar.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['rishikesh'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.rishikesh.title.hi : translations.content.rishikesh.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.rishikesh.description.hi : translations.content.rishikesh.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['significance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.significance.title.hi : translations.content.significance.title.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.moksha.title.hi : translations.content.significance.moksha.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.moksha.intro.hi : translations.content.significance.moksha.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.moksha.list.item1.hi : translations.content.significance.moksha.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.moksha.list.item2.hi : translations.content.significance.moksha.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.moksha.list.item3.hi : translations.content.significance.moksha.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.moksha.list.item4.hi : translations.content.significance.moksha.list.item4.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.transformative.title.hi : translations.content.significance.transformative.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.transformative.intro.hi : translations.content.significance.transformative.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.transformative.list.item1.hi : translations.content.significance.transformative.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.transformative.list.item2.hi : translations.content.significance.transformative.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.transformative.list.item3.hi : translations.content.significance.transformative.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.transformative.list.item4.hi : translations.content.significance.transformative.list.item4.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.modernInfrastructure.title.hi : translations.content.significance.modernInfrastructure.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.modernInfrastructure.intro.hi : translations.content.significance.modernInfrastructure.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.modernInfrastructure.list.item1.hi : translations.content.significance.modernInfrastructure.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.modernInfrastructure.list.item2.hi : translations.content.significance.modernInfrastructure.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.modernInfrastructure.list.item3.hi : translations.content.significance.modernInfrastructure.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.modernInfrastructure.list.item4.hi : translations.content.significance.modernInfrastructure.list.item4.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.significance.modernInfrastructure.list.item5.hi : translations.content.significance.modernInfrastructure.list.item5.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.cultural.title.hi : translations.content.cultural.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.intro.hi : translations.content.cultural.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.list.item1.hi : translations.content.cultural.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.list.item2.hi : translations.content.cultural.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.list.item3.hi : translations.content.cultural.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.list.item4.hi : translations.content.cultural.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.conclusion.hi : translations.content.cultural.conclusion.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['historical'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.historical.title.hi : translations.content.historical.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.historical.description.hi : translations.content.historical.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.conclusion.title.hi : translations.content.conclusion.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.description.hi : translations.content.conclusion.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.references.hi : translations.sections.references.en}
          </Text>
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
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});