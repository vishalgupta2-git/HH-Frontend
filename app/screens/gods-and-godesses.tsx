import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function GodsAndGodessesScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const translations = {
    sections: {
      foundation: { en: 'The Divine Foundation', hi: 'दिव्य आधार' },
      trimurti: { en: 'The Trimurti: The Core Trinity', hi: 'त्रिमूर्ति: मूल त्रिमूर्ति' },
      feminine: { en: 'The Divine Feminine: Major Goddesses and Shakti', hi: 'दिव्य स्त्रीत्व: प्रमुख देवियां और शक्ति' },
      regional: { en: 'Regional and Specialized Goddesses', hi: 'क्षेत्रीय और विशिष्ट देवियां' },
      popular: { en: 'Beloved Popular Deities', hi: 'प्रिय लोकप्रिय देवता' },
      vedic: { en: 'Vedic Solar and Cosmic Deities', hi: 'वैदिक सौर और ब्रह्मांडीय देवता' },
      secondary: { en: 'Important Secondary Deities', hi: 'महत्वपूर्ण द्वितीयक देवता' },
      shakti: { en: 'The Concept of Shakti', hi: 'शक्ति की अवधारणा' },
      couples: { en: 'Divine Couples and Their Significance', hi: 'दिव्य जोड़े और उनका महत्व' },
      cultural: { en: 'Cultural and Spiritual Significance', hi: 'सांस्कृतिक और आध्यात्मिक महत्व' }
    },
    content: {
      title: { en: 'Hindu Gods & Goddesses', hi: 'हिंदू देवी-देवता' },
      intro: { 
        en: 'This complete guide combines all the divine deities from Hindu mythology, presenting both the major pantheon and the extensive array of specialized gods and goddesses that form the rich tapestry of Hindu theology, with enhanced focus on the divine feminine aspect.',
        hi: 'यह संपूर्ण गाइड हिंदू पौराणिक कथाओं के सभी दिव्य देवी-देवताओं को जोड़ती है, जो प्रमुख देवताओं और विशिष्ट देवी-देवताओं की व्यापक श्रृंखला दोनों को प्रस्तुत करती है जो हिंदू धर्मशास्त्र के समृद्ध ताने-बाने का निर्माण करते हैं, जिसमें दिव्य स्त्रीत्व पहलू पर बढ़ा हुआ ध्यान है।'
      },
      foundation: {
        title: { en: 'The Divine Foundation', hi: 'दिव्य आधार' },
        description: { 
          en: 'Hindu mythology presents one of the world\'s most diverse pantheons, where deities serve as accessible manifestations of the ultimate reality called Brahman. The tradition places equal importance on both masculine and feminine divine aspects, recognizing that cosmic balance requires both energies. Followers can approach divinity through multiple paths - polytheistic, pantheistic, monotheistic, monistic, or even agnostic worship.',
          hi: 'हिंदू पौराणिक कथाएं दुनिया के सबसे विविध देवताओं में से एक प्रस्तुत करती हैं, जहां देवता परम वास्तविकता ब्रह्म के सुलभ अभिव्यक्तियों के रूप में कार्य करते हैं। परंपरा पुरुष और स्त्री दिव्य पहलुओं दोनों पर समान महत्व देती है, यह मानते हुए कि ब्रह्मांडीय संतुलन के लिए दोनों ऊर्जाओं की आवश्यकता है। अनुयायी कई मार्गों के माध्यम से दिव्यता तक पहुंच सकते हैं - बहुदेववादी, सर्वेश्वरवादी, एकेश्वरवादी, एकात्मवादी, या यहां तक कि अज्ञेयवादी पूजा।'
        }
      },
      trimurti: {
        title: { en: 'The Trimurti: The Core Trinity', hi: 'त्रिमूर्ति: मूल त्रिमूर्ति' },
        brahma: {
          title: { en: 'Brahma - The Creator', hi: 'ब्रह्मा - सृष्टिकर्ता' },
          description: { 
            en: 'Lord Brahma creates the universe and all life forms, depicted with four heads representing the four Vedas and four arms. Despite his fundamental role, he receives limited worship today.',
            hi: 'भगवान ब्रह्मा ब्रह्मांड और सभी जीवन रूपों का निर्माण करते हैं, चार सिरों के साथ चित्रित किया गया है जो चार वेदों का प्रतिनिधित्व करते हैं और चार भुजाएं हैं। अपनी मौलिक भूमिका के बावजूद, आज उन्हें सीमित पूजा प्राप्त होती है।'
          }
        },
        vishnu: {
          title: { en: 'Vishnu - The Preserver', hi: 'विष्णु - पालनकर्ता' },
          description: { 
            en: 'Lord Vishnu maintains cosmic order and dharma, incarnating on Earth as Rama and Krishna when chaos threatens universal balance. He appears with blue skin, four arms, holding a conch, discus, lotus, and mace.',
            hi: 'भगवान विष्णु ब्रह्मांडीय व्यवस्था और धर्म को बनाए रखते हैं, जब अराजकता सार्वभौमिक संतुलन को खतरा देती है तो पृथ्वी पर राम और कृष्ण के रूप में अवतार लेते हैं। वे नीली त्वचा, चार भुजाओं के साथ प्रकट होते हैं, शंख, चक्र, कमल और गदा धारण करते हैं।'
          }
        },
        shiva: {
          title: { en: 'Shiva - The Destroyer and Transformer', hi: 'शिव - विनाशक और रूपांतरक' },
          description: { 
            en: 'Lord Shiva embodies destruction necessary for regeneration, depicted with a third eye, crescent moon, and snake around his neck. His destruction enables new creation and cosmic renewal.',
            hi: 'भगवान शिव पुनर्जन्म के लिए आवश्यक विनाश का प्रतीक हैं, तीसरी आंख, अर्धचंद्र और गर्दन के चारों ओर सांप के साथ चित्रित किया गया है। उनका विनाश नई सृष्टि और ब्रह्मांडीय नवीकरण को सक्षम बनाता है।'
          }
        }
      },
      feminine: {
        title: { en: 'The Divine Feminine: Major Goddesses and Shakti', hi: 'दिव्य स्त्रीत्व: प्रमुख देवियां और शक्ति' },
        lakshmi: {
          title: { en: 'Lakshmi - Goddess of Wealth and Prosperity', hi: 'लक्ष्मी - धन और समृद्धि की देवी' },
          description: { 
            en: 'Goddess Lakshmi, Vishnu\'s consort, embodies wealth and good fortune. She emerged from the Ocean of Milk and is particularly worshipped during Diwali. Lakshmi is typically depicted sitting or standing on a lotus, carrying a lotus in one or two hands, symbolizing purity and prosperity regardless of circumstances.',
            hi: 'देवी लक्ष्मी, विष्णु की पत्नी, धन और सौभाग्य का प्रतीक हैं। वे क्षीर सागर से प्रकट हुईं और विशेष रूप से दीवाली के दौरान पूजी जाती हैं। लक्ष्मी आमतौर पर कमल पर बैठी या खड़ी दिखाई जाती हैं, एक या दो हाथों में कमल धारण करती हैं, जो परिस्थितियों की परवाह किए बिना पवित्रता और समृद्धि का प्रतीक है।'
          }
        },
        saraswati: {
          title: { en: 'Saraswati - Goddess of Knowledge and Arts', hi: 'सरस्वती - ज्ञान और कलाओं की देवी' },
          description: { 
            en: 'Goddess Saraswati governs wisdom, knowledge, and creative arts. Depicted on a white swan holding a veena, she inspires scholars, musicians, and artists. As Brahma\'s consort, she represents the creative force behind knowledge and learning.',
            hi: 'देवी सरस्वती ज्ञान, विद्या और रचनात्मक कलाओं का शासन करती हैं। वीणा धारण करते हुए सफेद हंस पर चित्रित, वे विद्वानों, संगीतकारों और कलाकारों को प्रेरित करती हैं। ब्रह्मा की पत्नी के रूप में, वे ज्ञान और सीखने के पीछे रचनात्मक शक्ति का प्रतिनिधित्व करती हैं।'
          }
        },
        parvati: {
          title: { en: 'Parvati - The Divine Mother', hi: 'पार्वती - दिव्य माता' },
          description: { 
            en: 'Goddess Parvati, Shiva\'s consort, represents the gentle, nurturing aspect of the divine feminine. She is the universal mother figure and takes many forms including Durga and Kali. Parvati embodies love, fertility, devotion, and divine strength.',
            hi: 'देवी पार्वती, शिव की पत्नी, दिव्य स्त्रीत्व के कोमल, पालन-पोषण पहलू का प्रतिनिधित्व करती हैं। वे सार्वभौमिक मातृ आकृति हैं और दुर्गा और काली सहित कई रूप लेती हैं। पार्वती प्रेम, प्रजनन क्षमता, भक्ति और दिव्य शक्ति का प्रतीक हैं।'
          }
        },
        durga: {
          title: { en: 'Durga - The Warrior Goddess', hi: 'दुर्गा - योद्धा देवी' },
          description: { 
            en: 'Goddess Durga represents fierce divine protection against evil forces. She rides a lion or tiger and carries multiple weapons given by various gods. Durga emerged to defeat the buffalo demon Mahishasura, symbolizing the triumph of good over evil. She is especially revered during Navratri festivals.',
            hi: 'देवी दुर्गा बुरी शक्तियों के खिलाफ भयंकर दिव्य सुरक्षा का प्रतिनिधित्व करती हैं। वे शेर या बाघ की सवारी करती हैं और विभिन्न देवताओं द्वारा दिए गए कई हथियार धारण करती हैं। दुर्गा भैंस राक्षस महिषासुर को हराने के लिए प्रकट हुईं, जो बुराई पर अच्छाई की जीत का प्रतीक है। वे विशेष रूप से नवरात्रि त्योहारों के दौरान पूजी जाती हैं।'
          }
        },
        kali: {
          title: { en: 'Kali - The Fierce Destroyer of Evil', hi: 'काली - बुराई की भयंकर विनाशक' },
          description: { 
            en: 'Goddess Kali, born from Durga\'s forehead during battle, embodies time, change, and transformative power. Depicted with dark blue or black skin, wearing a skirt of severed arms and a necklace of heads, she represents the fierce aspect of time that devours everything. Despite her fearsome appearance, Kali is deeply loved as a protective mother figure.',
            hi: 'देवी काली, युद्ध के दौरान दुर्गा के माथे से जन्मी, समय, परिवर्तन और रूपांतरण शक्ति का प्रतीक हैं। गहरे नीले या काले रंग की त्वचा के साथ चित्रित, कटे हुए हाथों की स्कर्ट और सिरों की माला पहने, वे समय के भयंकर पहलू का प्रतिनिधित्व करती हैं जो सब कुछ निगल जाता है। अपने भयानक रूप के बावजूद, काली को एक सुरक्षात्मक मातृ आकृति के रूप में गहराई से प्यार किया जाता है।'
          }
        },
        sita: {
          title: { en: 'Sita - Goddess of Virtue and Devotion', hi: 'सीता - सदाचार और भक्ति की देवी' },
          description: { 
            en: 'Goddess Sita, Rama\'s wife and Lakshmi\'s incarnation, represents ideal womanhood, purity, and unwavering devotion. Her life story in the Ramayana exemplifies strength through adversity and moral righteousness.',
            hi: 'देवी सीता, राम की पत्नी और लक्ष्मी के अवतार, आदर्श नारीत्व, पवित्रता और अटूट भक्ति का प्रतिनिधित्व करती हैं। रामायण में उनकी जीवन कथा कठिनाई के माध्यम से शक्ति और नैतिक धार्मिकता का उदाहरण है।'
          }
        },
        radha: {
          title: { en: 'Radha - Goddess of Divine Love', hi: 'राधा - दिव्य प्रेम की देवी' },
          description: { 
            en: 'Goddess Radha, Krishna\'s beloved, represents pure, selfless divine love (bhakti). She embodies the soul\'s longing for union with the divine and is worshipped alongside Krishna as the epitome of devotional love.',
            hi: 'देवी राधा, कृष्ण की प्रिय, शुद्ध, निःस्वार्थ दिव्य प्रेम (भक्ति) का प्रतिनिधित्व करती हैं। वे दिव्य के साथ मिलन की आत्मा की लालसा का प्रतीक हैं और भक्ति प्रेम के प्रतीक के रूप में कृष्ण के साथ पूजी जाती हैं।'
          }
        }
      },
      regional: {
        title: { en: 'Regional and Specialized Goddesses', hi: 'क्षेत्रीय और विशिष्ट देवियां' },
        ganga: {
          title: { en: 'Ganga - River Goddess', hi: 'गंगा - नदी देवी' },
          description: { 
            en: 'Goddess Ganga is the personification of the sacred Ganges River. She descended from heaven to purify the earth and is depicted as a beautiful woman riding a crocodile or standing on a lotus. Ganga represents purification, salvation, and the life-giving force of water.',
            hi: 'देवी गंगा पवित्र गंगा नदी का मूर्त रूप हैं। वे पृथ्वी को शुद्ध करने के लिए स्वर्ग से उतरीं और मगरमच्छ की सवारी करती या कमल पर खड़ी एक सुंदर महिला के रूप में चित्रित की जाती हैं। गंगा शुद्धिकरण, मोक्ष और पानी की जीवनदायिनी शक्ति का प्रतिनिधित्व करती हैं।'
          }
        },
        yamuna: {
          title: { en: 'Yamuna - Sacred River Goddess', hi: 'यमुना - पवित्र नदी देवी' },
          description: { 
            en: 'Goddess Yamuna, sister of Yama (god of death), is the divine personification of the Yamuna River. She is particularly associated with Krishna\'s childhood and represents the purifying power of sacred waters.',
            hi: 'देवी यमुना, यम (मृत्यु के देवता) की बहन, यमुना नदी का दिव्य मूर्त रूप हैं। वे विशेष रूप से कृष्ण के बचपन से जुड़ी हैं और पवित्र जल की शुद्धिकरण शक्ति का प्रतिनिधित्व करती हैं।'
          }
        },
        annapurna: {
          title: { en: 'Annapurna - Goddess of Food and Nourishment', hi: 'अन्नपूर्णा - भोजन और पोषण की देवी' },
          description: { 
            en: 'Goddess Annapurna is the divine provider of food and nourishment. Depicted holding a jeweled vessel containing food, she ensures that no devotee goes hungry. She represents the nurturing aspect of the divine mother who feeds all beings.',
            hi: 'देवी अन्नपूर्णा भोजन और पोषण की दिव्य प्रदाता हैं। भोजन से भरे रत्नजड़ित बर्तन को धारण करते हुए चित्रित, वे सुनिश्चित करती हैं कि कोई भी भक्त भूखा न रहे। वे दिव्य माता के पालन-पोषण पहलू का प्रतिनिधित्व करती हैं जो सभी प्राणियों को भोजन देती हैं।'
          }
        },
        bhumi: {
          title: { en: 'Bhumi Devi - Earth Goddess', hi: 'भूमि देवी - पृथ्वी देवी' },
          description: { 
            en: 'Goddess Bhumi Devi (or Prithvi) personifies Mother Earth. She represents fertility, abundance, and the nurturing ground that supports all life. Often depicted as a woman emerging from or standing on the earth, holding vegetation.',
            hi: 'देवी भूमि देवी (या पृथ्वी) माता पृथ्वी का मूर्त रूप हैं। वे उर्वरता, प्रचुरता और सभी जीवन का समर्थन करने वाली पोषण भूमि का प्रतिनिधित्व करती हैं। अक्सर पृथ्वी से निकलती या पृथ्वी पर खड़ी एक महिला के रूप में चित्रित, वनस्पति धारण करती हैं।'
          }
        },
        chandi: {
          title: { en: 'Chandi - The Fierce Protector', hi: 'चंडी - भयंकर रक्षक' },
          description: { 
            en: 'Goddess Chandi is a fierce form of Durga who manifests during times of great evil. She represents divine wrath against injustice and is invoked for protection against negative forces. Her worship is particularly prominent in Bengal and Assam.',
            hi: 'देवी चंडी दुर्गा का एक भयंकर रूप हैं जो बड़ी बुराई के समय प्रकट होती हैं। वे अन्याय के खिलाफ दिव्य क्रोध का प्रतिनिधित्व करती हैं और नकारात्मक शक्तियों से सुरक्षा के लिए आह्वान की जाती हैं। उनकी पूजा विशेष रूप से बंगाल और असम में प्रमुख है।'
          }
        },
        ambika: {
          title: { en: 'Ambika - The Divine Mother', hi: 'अंबिका - दिव्य माता' },
          description: { 
            en: 'Goddess Ambika is another name for the great mother goddess, representing the source of all creation. She encompasses all feminine divine qualities and is considered the primordial mother of the universe.',
            hi: 'देवी अंबिका महान मातृ देवी का दूसरा नाम है, जो सभी सृष्टि के स्रोत का प्रतिनिधित्व करती हैं। वे सभी स्त्री दिव्य गुणों को समाहित करती हैं और ब्रह्मांड की आदिम माता मानी जाती हैं।'
          }
        },
        gayatri: {
          title: { en: 'Gayatri - Goddess of Sacred Sound', hi: 'गायत्री - पवित्र ध्वनि की देवी' },
          description: { 
            en: 'Goddess Gayatri personifies the most sacred Vedic mantra. She represents divine knowledge, spiritual enlightenment, and the power of sacred sound. Depicted with five heads representing the five elements, she is the mother of the Vedas.',
            hi: 'देवी गायत्री सबसे पवित्र वैदिक मंत्र का मूर्त रूप हैं। वे दिव्य ज्ञान, आध्यात्मिक ज्ञानोदय और पवित्र ध्वनि की शक्ति का प्रतिनिधित्व करती हैं। पांच तत्वों का प्रतिनिधित्व करने वाले पांच सिरों के साथ चित्रित, वे वेदों की माता हैं।'
          }
        },
        bagalamukhi: {
          title: { en: 'Bagalamukhi - The Goddess Who Paralyzes Enemies', hi: 'बगलामुखी - शत्रुओं को पंगु बनाने वाली देवी' },
          description: { 
            en: 'Goddess Bagalamukhi is one of the ten Mahavidyas (great wisdom goddesses) who represents the power to control and paralyze enemies. She is depicted holding the tongue of a demon, symbolizing control over negative speech and harmful forces.',
            hi: 'देवी बगलामुखी दस महाविद्याओं (महान ज्ञान देवियों) में से एक हैं जो शत्रुओं को नियंत्रित और पंगु बनाने की शक्ति का प्रतिनिधित्व करती हैं। वे एक राक्षस की जीभ को धारण करते हुए चित्रित हैं, जो नकारात्मक भाषण और हानिकारक शक्तियों पर नियंत्रण का प्रतीक है।'
          }
        },
        bhuvaneshwari: {
          title: { en: 'Bhuvaneshwari - Goddess of the Universe', hi: 'भुवनेश्वरी - ब्रह्मांड की देवी' },
          description: { 
            en: 'Goddess Bhuvaneshwari represents the divine mother as the ruler of the universe. She embodies the cosmic creative power and is depicted sitting on a lotus, symbolizing her role as the supreme creatrix of all worlds.',
            hi: 'देवी भुवनेश्वरी ब्रह्मांड के शासक के रूप में दिव्य माता का प्रतिनिधित्व करती हैं। वे ब्रह्मांडीय रचनात्मक शक्ति का प्रतीक हैं और कमल पर बैठी चित्रित हैं, जो सभी दुनियाओं की सर्वोच्च रचनाकार के रूप में उनकी भूमिका का प्रतीक है।'
          }
        }
      },
      popular: {
        title: { en: 'Beloved Popular Deities', hi: 'प्रिय लोकप्रिय देवता' },
        ganesha: {
          title: { en: 'Ganesha - The Remover of Obstacles', hi: 'गणेश - बाधाओं को दूर करने वाले' },
          description: { 
            en: 'Lord Ganesha, the elephant-headed deity, removes obstacles and brings success to new ventures. He represents wisdom, intellect, and auspicious beginnings.',
            hi: 'भगवान गणेश, हाथी के सिर वाले देवता, बाधाओं को दूर करते हैं और नए उद्यमों में सफलता लाते हैं। वे ज्ञान, बुद्धि और शुभ शुरुआत का प्रतिनिधित्व करते हैं।'
          }
        },
        krishna: {
          title: { en: 'Krishna - The Divine Cowherd', hi: 'कृष्ण - दिव्य ग्वाला' },
          description: { 
            en: 'Lord Krishna, Vishnu\'s eighth incarnation, remains one of India\'s most beloved divinities through his stories of divine love, wisdom, and heroic deeds.',
            hi: 'भगवान कृष्ण, विष्णु के आठवें अवतार, दिव्य प्रेम, ज्ञान और वीरतापूर्ण कार्यों की अपनी कहानियों के माध्यम से भारत के सबसे प्रिय देवताओं में से एक बने हुए हैं।'
          }
        },
        hanuman: {
          title: { en: 'Hanuman - The Devoted Monkey God', hi: 'हनुमान - भक्त वानर देवता' },
          description: { 
            en: 'Lord Hanuman embodies devotion, strength, and service. As Rama\'s greatest devotee, he symbolizes unwavering faith and is widely worshipped for protection and courage.',
            hi: 'भगवान हनुमान भक्ति, शक्ति और सेवा का प्रतीक हैं। राम के सबसे बड़े भक्त के रूप में, वे अटूट विश्वास का प्रतीक हैं और सुरक्षा और साहस के लिए व्यापक रूप से पूजे जाते हैं।'
          }
        }
      },
      vedic: {
        title: { en: 'Vedic Solar and Cosmic Deities', hi: 'वैदिक सौर और ब्रह्मांडीय देवता' },
        surya: {
          title: { en: 'Surya - The Sun God', hi: 'सूर्य - सूर्य देव' },
          description: { 
            en: 'Lord Surya represents solar energy and cosmic consciousness. He is traditionally depicted as a strong and radiant man riding a golden chariot pulled by seven horses, symbolizing the seven days of the week and the colors of the rainbow.',
            hi: 'भगवान सूर्य सौर ऊर्जा और ब्रह्मांडीय चेतना का प्रतिनिधित्व करते हैं। वे पारंपरिक रूप से सात घोड़ों द्वारा खींचे जाने वाले सुनहरे रथ पर सवार एक मजबूत और चमकदार व्यक्ति के रूप में चित्रित किए जाते हैं, जो सप्ताह के सात दिनों और इंद्रधनुष के रंगों का प्रतीक है।'
          }
        },
        indra: {
          title: { en: 'Indra - King of Gods', hi: 'इंद्र - देवताओं के राजा' },
          description: { 
            en: 'Lord Indra rules heaven and governs weather, storms, and warfare, wielding the thunderbolt Vajra as king of the gods. In temple sculptures, Indra is depicted in human form with four arms, riding the celestial elephant Airavata.',
            hi: 'भगवान इंद्र स्वर्ग पर शासन करते हैं और मौसम, तूफान और युद्ध का शासन करते हैं, देवताओं के राजा के रूप में वज्र को धारण करते हैं। मंदिर की मूर्तियों में, इंद्र को चार भुजाओं के साथ मानव रूप में चित्रित किया गया है, जो दिव्य हाथी ऐरावत की सवारी करते हैं।'
          }
        },
        agni: {
          title: { en: 'Agni - God of Fire', hi: 'अग्नि - अग्नि देव' },
          description: { 
            en: 'Lord Agni serves as the divine fire god and messenger between humans and gods, carrying offerings through sacred sacrificial fires.',
            hi: 'भगवान अग्नि दिव्य अग्नि देव और मनुष्यों और देवताओं के बीच दूत के रूप में कार्य करते हैं, पवित्र यज्ञ अग्नि के माध्यम से भेंट ले जाते हैं।'
          }
        },
        vayu: {
          title: { en: 'Vayu - Wind God', hi: 'वायु - वायु देव' },
          description: { 
            en: 'Lord Vayu controls air and wind, representing life force (prana). Father of Hanuman and Bhima, he appears prominently in epic literature.',
            hi: 'भगवान वायु हवा और पवन को नियंत्रित करते हैं, जीवन शक्ति (प्राण) का प्रतिनिधित्व करते हैं। हनुमान और भीम के पिता, वे महाकाव्य साहित्य में प्रमुखता से दिखाई देते हैं।'
          }
        },
        varuna: {
          title: { en: 'Varuna - Lord of Waters', hi: 'वरुण - जल के स्वामी' },
          description: { 
            en: 'Lord Varuna governs oceans, rivers, and rain while overseeing cosmic order and moral law. He is depicted riding on a crocodile or in a chariot drawn by seven swans.',
            hi: 'भगवान वरुण समुद्र, नदियों और बारिश का शासन करते हैं जबकि ब्रह्मांडीय व्यवस्था और नैतिक कानून की देखरेख करते हैं। वे मगरमच्छ पर सवार या सात हंसों द्वारा खींचे जाने वाले रथ में चित्रित हैं।'
          }
        }
      },
      secondary: {
        title: { en: 'Important Secondary Deities', hi: 'महत्वपूर्ण द्वितीयक देवता' },
        kubera: {
          title: { en: 'Kubera - God of Wealth', hi: 'कुबेर - धन के देवता' },
          description: { 
            en: 'Lord Kubera serves as divine treasurer and keeper of wealth. He is typically depicted as a dwarf with a stout body, adorned with jewels, maintaining cosmic prosperity.',
            hi: 'भगवान कुबेर दिव्य कोषाध्यक्ष और धन के रक्षक के रूप में कार्य करते हैं। वे आमतौर पर मोटे शरीर वाले बौने के रूप में चित्रित किए जाते हैं, जो रत्नों से सजे हैं, ब्रह्मांडीय समृद्धि को बनाए रखते हैं।'
          }
        },
        kartikeya: {
          title: { en: 'Kartikeya/Skanda - Divine Commander', hi: 'कार्तिकेय/स्कंद - दिव्य सेनापति' },
          description: { 
            en: 'Lord Kartikeya (Murugan in South India) commands the gods\' armies as Shiva\'s son, representing youth, valor, and spiritual warrior energy.',
            hi: 'भगवान कार्तिकेय (दक्षिण भारत में मुरुगन) शिव के पुत्र के रूप में देवताओं की सेनाओं का नेतृत्व करते हैं, जो युवावस्था, वीरता और आध्यात्मिक योद्धा ऊर्जा का प्रतिनिधित्व करते हैं।'
          }
        },
        kamadeva: {
          title: { en: 'Kamadeva - God of Love', hi: 'कामदेव - प्रेम के देवता' },
          description: { 
            en: 'Lord Kamadeva governs love and desire with his sugarcane bow and flower arrows, representing the creative force driving cosmic creation.',
            hi: 'भगवान कामदेव अपने गन्ने के धनुष और फूल के तीरों के साथ प्रेम और इच्छा का शासन करते हैं, जो ब्रह्मांडीय सृष्टि को चलाने वाली रचनात्मक शक्ति का प्रतिनिधित्व करते हैं।'
          }
        },
        dhanvantari: {
          title: { en: 'Dhanvantari - Divine Physician', hi: 'धन्वंतरी - दिव्य चिकित्सक' },
          description: { 
            en: 'Lord Dhanvantari, an incarnation of Vishnu, governs Ayurvedic medicine and emerged from the ocean carrying immortality\'s nectar.',
            hi: 'भगवान धन्वंतरी, विष्णु के अवतार, आयुर्वेदिक चिकित्सा का शासन करते हैं और अमरता के अमृत को लेकर समुद्र से प्रकट हुए।'
          }
        },
        vishvakarma: {
          title: { en: 'Vishvakarma - Divine Architect', hi: 'विश्वकर्मा - दिव्य वास्तुकार' },
          description: { 
            en: 'Lord Vishvakarma serves as master craftsman of the gods, designing celestial palaces, divine weapons, and cosmic infrastructure.',
            hi: 'भगवान विश्वकर्मा देवताओं के मास्टर कारीगर के रूप में कार्य करते हैं, दिव्य महल, दिव्य हथियार और ब्रह्मांडीय बुनियादी ढांचे को डिजाइन करते हैं।'
          }
        }
      },
      shakti: {
        title: { en: 'The Concept of Shakti', hi: 'शक्ति की अवधारणा' },
        description: { 
          en: 'In Hindu philosophy, Shakti represents the divine feminine creative power that animates the universe. Every male deity is believed to have a female counterpart (Shakti) without whom he remains inactive. This principle emphasizes that:',
          hi: 'हिंदू दर्शन में, शक्ति दिव्य स्त्री रचनात्मक शक्ति का प्रतिनिधित्व करती है जो ब्रह्मांड को जीवंत बनाती है। माना जाता है कि हर पुरुष देवता का एक स्त्री समकक्ष (शक्ति) होता है जिसके बिना वह निष्क्रिय रहता है। यह सिद्धांत इस बात पर जोर देता है कि:'
        },
        points: {
          point1: { 
            en: '• Creation requires both masculine and feminine principles',
            hi: '• सृष्टि के लिए पुरुष और स्त्री दोनों सिद्धांतों की आवश्यकता है'
          },
          point2: { 
            en: '• The goddess is not subordinate but equal to her male counterpart',
            hi: '• देवी अपने पुरुष समकक्ष के अधीन नहीं बल्कि बराबर हैं'
          },
          point3: { 
            en: '• Feminine energy is the active, dynamic force while masculine energy provides structure',
            hi: '• स्त्री ऊर्जा सक्रिय, गतिशील शक्ति है जबकि पुरुष ऊर्जा संरचना प्रदान करती है'
          },
          point4: { 
            en: '• The ultimate reality encompasses both aspects in perfect balance',
            hi: '• परम वास्तविकता दोनों पहलुओं को पूर्ण संतुलन में समाहित करती है'
          }
        }
      },
      couples: {
        title: { en: 'Divine Couples and Their Significance', hi: 'दिव्य जोड़े और उनका महत्व' },
        description: { 
          en: 'Divine couples in Hinduism represent the perfect balance of masculine and feminine energies, each embodying complementary aspects of the divine:',
          hi: 'हिंदू धर्म में दिव्य जोड़े पुरुष और स्त्री ऊर्जाओं के पूर्ण संतुलन का प्रतिनिधित्व करते हैं, प्रत्येक दिव्य के पूरक पहलुओं का प्रतीक है:'
        },
        points: {
          point1: { 
            en: '• Shiva-Parvati: Consciousness and creative energy',
            hi: '• शिव-पार्वती: चेतना और रचनात्मक ऊर्जा'
          },
          point2: { 
            en: '• Vishnu-Lakshmi: Preservation and prosperity',
            hi: '• विष्णु-लक्ष्मी: संरक्षण और समृद्धि'
          },
          point3: { 
            en: '• Rama-Sita: Dharma and virtue',
            hi: '• राम-सीता: धर्म और सदाचार'
          },
          point4: { 
            en: '• Krishna-Radha: Divine love and devotion',
            hi: '• कृष्ण-राधा: दिव्य प्रेम और भक्ति'
          }
        },
        conclusion: { 
          en: 'These divine unions symbolize the fundamental principle that creation and cosmic order require both masculine and feminine principles working in harmony.',
          hi: 'ये दिव्य मिलन मौलिक सिद्धांत का प्रतीक है कि सृष्टि और ब्रह्मांडीय व्यवस्था के लिए पुरुष और स्त्री दोनों सिद्धांतों के सामंजस्य में काम करने की आवश्यकता है।'
        }
      },
      cultural: {
        title: { en: 'Cultural and Spiritual Significance', hi: 'सांस्कृतिक और आध्यात्मिक महत्व' },
        description: { 
          en: 'These deities collectively represent:',
          hi: 'ये देवता सामूहिक रूप से प्रतिनिधित्व करते हैं:'
        },
        points: {
          point1: { 
            en: '• Moral and ethical guidance through divine examples',
            hi: '• दिव्य उदाहरणों के माध्यम से नैतिक और नैतिक मार्गदर्शन'
          },
          point2: { 
            en: '• Cosmic process explanations of creation, preservation, and destruction',
            hi: '• सृष्टि, संरक्षण और विनाश की ब्रह्मांडीय प्रक्रिया की व्याख्या'
          },
          point3: { 
            en: '• Spiritual guidance for daily life challenges',
            hi: '• दैनिक जीवन की चुनौतियों के लिए आध्यात्मिक मार्गदर्शन'
          },
          point4: { 
            en: '• Universal themes of dharma, karma, and cyclical existence',
            hi: '• धर्म, कर्म और चक्रीय अस्तित्व के सार्वभौमिक विषय'
          },
          point5: { 
            en: '• Gender balance recognizing both masculine and feminine divine aspects',
            hi: '• लिंग संतुलन जो पुरुष और स्त्री दोनों दिव्य पहलुओं को पहचानता है'
          }
        },
        paragraph1: { 
          en: 'Each deity offers specific qualities and powers that devotees invoke for different life situations - whether seeking Saraswati\'s wisdom, Lakshmi\'s prosperity, Durga\'s protection, or Ganesha\'s obstacle removal.',
          hi: 'प्रत्येक देवता विशिष्ट गुण और शक्तियां प्रदान करते हैं जिन्हें भक्त विभिन्न जीवन स्थितियों के लिए आह्वान करते हैं - चाहे सरस्वती की बुद्धि, लक्ष्मी की समृद्धि, दुर्गा की सुरक्षा, या गणेश की बाधा दूर करने की शक्ति की तलाश हो।'
        },
        paragraph2: { 
          en: 'This vast pantheon reflects Hinduism\'s fundamental belief in unity underlying diversity - that one ultimate reality manifests in countless forms to meet humanity\'s varied spiritual needs. The inclusion of powerful goddesses demonstrates the religion\'s recognition that divine feminine energy is equally important and powerful as masculine energy, creating one of the world\'s most comprehensive and balanced theological systems.',
          hi: 'यह विशाल देवताओं का समूह हिंदू धर्म के विविधता के तहत एकता में मौलिक विश्वास को दर्शाता है - कि एक परम वास्तविकता मानवता की विविध आध्यात्मिक आवश्यकताओं को पूरा करने के लिए अनगिनत रूपों में प्रकट होती है। शक्तिशाली देवियों का समावेश धर्म की इस मान्यता को दर्शाता है कि दिव्य स्त्री ऊर्जा पुरुष ऊर्जा के समान महत्वपूर्ण और शक्तिशाली है, जो दुनिया के सबसे व्यापक और संतुलित धार्मिक सिद्धांतों में से एक का निर्माण करती है।'
        }
      }
    }
  };

  const sections = [
    { key: 'foundation', title: isHindi ? translations.sections.foundation.hi : translations.sections.foundation.en },
    { key: 'trimurti', title: isHindi ? translations.sections.trimurti.hi : translations.sections.trimurti.en },
    { key: 'feminine', title: isHindi ? translations.sections.feminine.hi : translations.sections.feminine.en },
    { key: 'regional', title: isHindi ? translations.sections.regional.hi : translations.sections.regional.en },
    { key: 'popular', title: isHindi ? translations.sections.popular.hi : translations.sections.popular.en },
    { key: 'vedic', title: isHindi ? translations.sections.vedic.hi : translations.sections.vedic.en },
    { key: 'secondary', title: isHindi ? translations.sections.secondary.hi : translations.sections.secondary.en },
    { key: 'shakti', title: isHindi ? translations.sections.shakti.hi : translations.sections.shakti.en },
    { key: 'couples', title: isHindi ? translations.sections.couples.hi : translations.sections.couples.en },
    { key: 'cultural', title: isHindi ? translations.sections.cultural.hi : translations.sections.cultural.en },
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
      case 'foundation':
        return 'Hinduism presents a vast and diverse pantheon of deities that represent different aspects of the divine. These gods and goddesses are not separate entities but manifestations of the one ultimate reality, Brahman.';
      case 'trimurti':
        return 'The Trimurti consists of Brahma (the creator), Vishnu (the preserver), and Shiva (the destroyer). These three deities represent the fundamental cosmic functions of creation, preservation, and dissolution.';
      case 'feminine':
        return 'The Divine Feminine, or Shakti, represents the creative and transformative energy of the universe. Major goddesses include Durga, Lakshmi, Saraswati, and Kali, each embodying different aspects of feminine power.';
      case 'regional':
        return 'Regional and specialized goddesses represent local traditions and specific aspects of divine energy. These deities often have unique characteristics and worship practices specific to their regions.';
      case 'popular':
        return 'Beloved popular deities include Ganesha, Hanuman, and Krishna, who are widely worshipped across India and beyond. These deities represent accessible forms of the divine that devotees can easily connect with.';
      case 'vedic':
        return 'Vedic solar and cosmic deities represent the ancient understanding of natural forces and cosmic principles. These deities include Surya (the sun), Indra (the king of gods), and Agni (the fire).';
      case 'secondary':
        return 'Important secondary deities play crucial roles in Hindu mythology and cosmology. These include various celestial beings, nature spirits, and divine attendants who serve the major deities.';
      case 'shakti':
        return 'The concept of Shakti represents the dynamic, creative energy that animates all existence. This feminine principle is considered the source of all power and manifestation in the universe.';
      case 'couples':
        return 'Divine couples represent the balance of masculine and feminine energies in creation. These pairs, such as Shiva-Parvati and Vishnu-Lakshmi, symbolize the harmony and interdependence of opposite forces.';
      case 'cultural':
        return 'The cultural and spiritual significance of Hindu deities extends beyond religious worship to influence art, literature, music, and social practices throughout Indian history and contemporary society.';
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

  const handleSelect = (key: string, title: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      // Reset dropdown label after navigating
      setDropdownLabel(isHindi ? 'विषय' : 'Topic');
    });
  };

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search deities, aspects, stories..."
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Gods and Goddesses content..."
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
              <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={[styles.content, { paddingBottom: 200 }]} 
          showsVerticalScrollIndicator={false}
        >
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.card}>
          <Text style={styles.h1}>
            {isHindi ? translations.content.title.hi : translations.content.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.intro.hi : translations.content.intro.en}
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
          <Text style={styles.h2}>
            {isHindi ? translations.content.foundation.title.hi : translations.content.foundation.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.foundation.description.hi : translations.content.foundation.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.trimurti.title.hi : translations.content.trimurti.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.trimurti.brahma.title.hi : translations.content.trimurti.brahma.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.trimurti.brahma.description.hi : translations.content.trimurti.brahma.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.trimurti.vishnu.title.hi : translations.content.trimurti.vishnu.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.trimurti.vishnu.description.hi : translations.content.trimurti.vishnu.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.trimurti.shiva.title.hi : translations.content.trimurti.shiva.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.trimurti.shiva.description.hi : translations.content.trimurti.shiva.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.feminine.title.hi : translations.content.feminine.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.lakshmi.title.hi : translations.content.feminine.lakshmi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.lakshmi.description.hi : translations.content.feminine.lakshmi.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.saraswati.title.hi : translations.content.feminine.saraswati.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.saraswati.description.hi : translations.content.feminine.saraswati.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.parvati.title.hi : translations.content.feminine.parvati.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.parvati.description.hi : translations.content.feminine.parvati.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.durga.title.hi : translations.content.feminine.durga.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.durga.description.hi : translations.content.feminine.durga.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.kali.title.hi : translations.content.feminine.kali.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.kali.description.hi : translations.content.feminine.kali.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.sita.title.hi : translations.content.feminine.sita.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.sita.description.hi : translations.content.feminine.sita.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.feminine.radha.title.hi : translations.content.feminine.radha.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.feminine.radha.description.hi : translations.content.feminine.radha.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.regional.title.hi : translations.content.regional.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.ganga.title.hi : translations.content.regional.ganga.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.ganga.description.hi : translations.content.regional.ganga.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.yamuna.title.hi : translations.content.regional.yamuna.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.yamuna.description.hi : translations.content.regional.yamuna.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.annapurna.title.hi : translations.content.regional.annapurna.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.annapurna.description.hi : translations.content.regional.annapurna.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.bhumi.title.hi : translations.content.regional.bhumi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.bhumi.description.hi : translations.content.regional.bhumi.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.chandi.title.hi : translations.content.regional.chandi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.chandi.description.hi : translations.content.regional.chandi.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.ambika.title.hi : translations.content.regional.ambika.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.ambika.description.hi : translations.content.regional.ambika.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.gayatri.title.hi : translations.content.regional.gayatri.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.gayatri.description.hi : translations.content.regional.gayatri.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.bagalamukhi.title.hi : translations.content.regional.bagalamukhi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.bagalamukhi.description.hi : translations.content.regional.bagalamukhi.description.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.bhuvaneshwari.title.hi : translations.content.regional.bhuvaneshwari.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.bhuvaneshwari.description.hi : translations.content.regional.bhuvaneshwari.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.popular.title.hi : translations.content.popular.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.popular.ganesha.title.hi : translations.content.popular.ganesha.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.popular.ganesha.description.hi : translations.content.popular.ganesha.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.popular.krishna.title.hi : translations.content.popular.krishna.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.popular.krishna.description.hi : translations.content.popular.krishna.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.popular.hanuman.title.hi : translations.content.popular.hanuman.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.popular.hanuman.description.hi : translations.content.popular.hanuman.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.vedic.title.hi : translations.content.vedic.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.vedic.surya.title.hi : translations.content.vedic.surya.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vedic.surya.description.hi : translations.content.vedic.surya.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.vedic.indra.title.hi : translations.content.vedic.indra.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vedic.indra.description.hi : translations.content.vedic.indra.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.vedic.agni.title.hi : translations.content.vedic.agni.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vedic.agni.description.hi : translations.content.vedic.agni.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.vedic.vayu.title.hi : translations.content.vedic.vayu.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vedic.vayu.description.hi : translations.content.vedic.vayu.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.vedic.varuna.title.hi : translations.content.vedic.varuna.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.vedic.varuna.description.hi : translations.content.vedic.varuna.description.en}
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

          <Text style={styles.h2}>
            {isHindi ? translations.content.secondary.title.hi : translations.content.secondary.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.secondary.kubera.title.hi : translations.content.secondary.kubera.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.secondary.kubera.description.hi : translations.content.secondary.kubera.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.secondary.kartikeya.title.hi : translations.content.secondary.kartikeya.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.secondary.kartikeya.description.hi : translations.content.secondary.kartikeya.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.secondary.kamadeva.title.hi : translations.content.secondary.kamadeva.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.secondary.kamadeva.description.hi : translations.content.secondary.kamadeva.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.secondary.dhanvantari.title.hi : translations.content.secondary.dhanvantari.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.secondary.dhanvantari.description.hi : translations.content.secondary.dhanvantari.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.secondary.vishvakarma.title.hi : translations.content.secondary.vishvakarma.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.secondary.vishvakarma.description.hi : translations.content.secondary.vishvakarma.description.en}
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['shakti'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.h2}>
            {isHindi ? translations.content.shakti.title.hi : translations.content.shakti.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.shakti.description.hi : translations.content.shakti.description.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.shakti.points.point1.hi : translations.content.shakti.points.point1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.shakti.points.point2.hi : translations.content.shakti.points.point2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.shakti.points.point3.hi : translations.content.shakti.points.point3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.shakti.points.point4.hi : translations.content.shakti.points.point4.en}
          </Text>
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
          
          <Text style={styles.h2}>
            {isHindi ? translations.content.couples.title.hi : translations.content.couples.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.couples.description.hi : translations.content.couples.description.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.couples.points.point1.hi : translations.content.couples.points.point1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.couples.points.point2.hi : translations.content.couples.points.point2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.couples.points.point3.hi : translations.content.couples.points.point3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.couples.points.point4.hi : translations.content.couples.points.point4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.couples.conclusion.hi : translations.content.couples.conclusion.en}
          </Text>
        </View>

        <View
          style={styles.cardPlain}
          onLayout={(e) => {
            sectionY.current['cultural'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.h2}>
            {isHindi ? translations.content.cultural.title.hi : translations.content.cultural.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.description.hi : translations.content.cultural.description.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.points.point1.hi : translations.content.cultural.points.point1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.points.point2.hi : translations.content.cultural.points.point2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.points.point3.hi : translations.content.cultural.points.point3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.points.point4.hi : translations.content.cultural.points.point4.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.points.point5.hi : translations.content.cultural.points.point5.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.paragraph1.hi : translations.content.cultural.paragraph1.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.paragraph2.hi : translations.content.cultural.paragraph2.en}
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

