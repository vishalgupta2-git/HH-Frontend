import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function HolyBooksScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Hindi translations for sections
  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      twoTier: { en: 'The Two-Tier Classification: Shruti and Smriti', hi: 'दो-स्तरीय वर्गीकरण: श्रुति और स्मृति' },
      epics: { en: 'The Great Epics: Mahabharat and Ramayan', hi: 'महान महाकाव्य: महाभारत और रामायण' },
      gita: { en: 'The Bhagavad Gita', hi: 'भगवद गीता' },
      ramcharit: { en: 'Ramcharitmanas', hi: 'रामचरितमानस' },
      puranas: { en: 'The Puranas', hi: 'पुराण' },
      additional: { en: 'Additional Sacred Literature', hi: 'अतिरिक्त पवित्र साहित्य' },
      cultural: { en: 'Cultural and Spiritual Significance', hi: 'सांस्कृतिक और आध्यात्मिक महत्व' },
      modern: { en: 'Modern Relevance and Global Impact', hi: 'आधुनिक प्रासंगिकता और वैश्विक प्रभाव' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
      references: { en: 'References', hi: 'संदर्भ' },
    },
    content: {
      title: { en: 'Holy Books: The Sacred Literary Foundation of Hinduism', hi: 'पवित्र पुस्तकें: हिंदू धर्म की पवित्र साहित्यिक नींव' },
      intro: { 
        en: 'Hindu sacred literature encompasses a vast collection of texts that form the spiritual, philosophical, and cultural backbone of one of the world\'s oldest religious traditions. These holy books range from ancient hymns and philosophical treatises to epic narratives that continue to guide millions of devotees in their spiritual journey.',
        hi: 'हिंदू पवित्र साहित्य में ग्रंथों का एक विशाल संग्रह शामिल है जो दुनिया के सबसे पुराने धार्मिक परंपराओं में से एक की आध्यात्मिक, दार्शनिक और सांस्कृतिक रीढ़ का निर्माण करता है। ये पवित्र पुस्तकें प्राचीन भजनों और दार्शनिक ग्रंथों से लेकर महाकाव्य कथाओं तक हैं जो लाखों भक्तों को उनकी आध्यात्मिक यात्रा में मार्गदर्शन करना जारी रखती हैं।'
      },
      twoTier: {
        text1: { 
          en: 'Hindu sacred texts are traditionally classified into two main categories:',
          hi: 'हिंदू पवित्र ग्रंथों को परंपरागत रूप से दो मुख्य श्रेणियों में वर्गीकृत किया जाता है:'
        },
        text2: { 
          en: 'Shruti (\'that which is heard\') refers to divine revelation received by ancient sages, including the Vedas and Upanishads. Smriti (\'that which is remembered\') encompasses texts composed by human authors but based on divine inspiration, including the great epics and Puranas.',
          hi: 'श्रुति (\'जो सुना गया है\') प्राचीन ऋषियों द्वारा प्राप्त दिव्य प्रकटीकरण को संदर्भित करता है, जिसमें वेद और उपनिषद शामिल हैं। स्मृति (\'जो याद किया गया है\') मानव लेखकों द्वारा रचित लेकिन दिव्य प्रेरणा पर आधारित ग्रंथों को शामिल करता है, जिसमें महान महाकाव्य और पुराण शामिल हैं।'
        }
      },
      epics: {
        mahabharat: {
          title: { en: 'Mahabharat - The Great Epic of Bharata', hi: 'महाभारत - भरत का महान महाकाव्य' },
          intro: { 
            en: 'The Mahabharat stands as one of the world\'s longest epic poems and is considered the most comprehensive repository of Hindu philosophy, ethics, and mythology. Composed between 500 BCE and 100 CE, this monumental work chronicles the wars of the house of Bharata and serves as a cornerstone of Hindu literature.',
            hi: 'महाभारत दुनिया के सबसे लंबे महाकाव्य कविताओं में से एक के रूप में खड़ा है और हिंदू दर्शन, नैतिकता और पौराणिक कथाओं का सबसे व्यापक भंडार माना जाता है। 500 BCE और 100 CE के बीच रचित, यह स्मारकीय कार्य भरत के घर के युद्धों का वर्णन करता है और हिंदू साहित्य का आधारशिला के रूप में कार्य करता है।'
          },
          encompasses: {
            title: { en: 'The epic encompasses:', hi: 'महाकाव्य में शामिल है:' },
            list: {
              item1: { en: '• 100,000 verses arranged in 18 books (parvas)', hi: '• 18 पुस्तकों (पर्वों) में व्यवस्थित 100,000 छंद' },
              item2: { en: '• Complex family saga centered on the conflict between the Pandavas and Kauravas', hi: '• पांडवों और कौरवों के बीच संघर्ष पर केंद्रित जटिल पारिवारिक गाथा' },
              item3: { en: '• Philosophical discussions on dharma (righteous duty), karma, and the nature of existence', hi: '• धर्म (धार्मिक कर्तव्य), कर्म और अस्तित्व की प्रकृति पर दार्शनिक चर्चाएं' },
              item4: { en: '• Multiple sub-stories that weave together to create a comprehensive worldview', hi: '• कई उप-कथाएं जो एक व्यापक विश्वदृष्टि बनाने के लिए एक साथ बुनी जाती हैं' }
            }
          },
          significance: { 
            en: 'The Mahabharat is more than just a war narrative - it serves as a dharmic text that explores moral and ethical dilemmas through its characters and their choices. The epic gave greater focus to the gods Vishnu and Shiva and introduced profound theological concepts that continue to influence Hindu thought.',
            hi: 'महाभारत केवल एक युद्ध कथा से अधिक है - यह एक धार्मिक ग्रंथ के रूप में कार्य करता है जो अपने पात्रों और उनके चुनावों के माध्यम से नैतिक और नैतिक दुविधाओं का अन्वेषण करता है। महाकाव्य ने देवताओं विष्णु और शिव पर अधिक ध्यान दिया और गहरे धार्मिक अवधारणाओं को पेश किया जो हिंदू विचार को प्रभावित करना जारी रखते हैं।'
          }
        },
        ramayan: {
          title: { en: 'Ramayan - The Romance of Rama', hi: 'रामायण - राम का रोमांस' },
          intro: { 
            en: 'The Ramayan, attributed to the sage Valmiki, consists of 24,000 verses organized into seven books and tells the story of Prince Rama, an incarnation of Vishnu. This epic, composed around the 2nd century BCE, chronicles the life and adventures of Rama, the King of Ayodhya and embodiment of truth and righteousness.',
            hi: 'ऋषि वाल्मीकि को जिम्मेदार ठहराए गए रामायण में सात पुस्तकों में व्यवस्थित 24,000 छंद शामिल हैं और विष्णु के अवतार राजकुमार राम की कहानी बताती है। 2वीं शताब्दी BCE के आसपास रचित यह महाकाव्य अयोध्या के राजा और सत्य और धर्म के अवतार राम के जीवन और रोमांच का वर्णन करता है।'
          },
          narrative: {
            title: { en: 'The narrative encompasses:', hi: 'कथा में शामिल है:' },
            list: {
              item1: { en: '• Rama\'s exile to the forest for fourteen years with his wife Sita and brother Lakshmana', hi: '• राम का अपनी पत्नी सीता और भाई लक्ष्मण के साथ चौदह वर्षों के लिए वन में निर्वासन' },
              item2: { en: '• Sita\'s abduction by the demon king Ravana', hi: '• राक्षस राजा रावण द्वारा सीता का अपहरण' },
              item3: { en: '• The rescue mission aided by Hanuman and the monkey army', hi: '• हनुमान और वानर सेना की सहायता से बचाव मिशन' },
              item4: { en: '• The ultimate triumph of good over evil', hi: '• बुराई पर अच्छाई की अंतिम विजय' }
            }
          },
          significance: { 
            en: 'The Ramayan serves as the story of dharma or duty and presents ideal models of relationships - the perfect king (Rama), the devoted wife (Sita), the loyal brother (Lakshmana), and the faithful devotee (Hanuman). The epic emphasizes themes of justice, sacrifice, loyalty, and the consequences of ethical choices.',
            hi: 'रामायण धर्म या कर्तव्य की कहानी के रूप में कार्य करती है और रिश्तों के आदर्श मॉडल प्रस्तुत करती है - परिपूर्ण राजा (राम), समर्पित पत्नी (सीता), वफादार भाई (लक्ष्मण), और भक्त भक्त (हनुमान)। महाकाव्य न्याय, बलिदान, वफादारी और नैतिक चुनावों के परिणामों के विषयों पर जोर देता है।'
          }
        }
      },
      gita: {
        title: { en: 'The Bhagavad Gita - The Divine Song', hi: 'भगवद गीता - दिव्य गीत' },
        crownJewel: {
          title: { en: 'The Crown Jewel of Hindu Philosophy', hi: 'हिंदू दर्शन का मुकुट रत्न' },
          description: { 
            en: 'The Bhagavad Gita ("Song of the Lord") forms part of the sixth book of the Mahabharat and stands as one of the most popular sacred texts of Hinduism. Dated to the second or first century BCE, this dialogue between Prince Arjuna and his charioteer Krishna (an avatar of Vishnu) addresses fundamental questions of duty, action, and spiritual liberation.',
            hi: 'भगवद गीता ("भगवान का गीत") महाभारत की छठी पुस्तक का हिस्सा है और हिंदू धर्म के सबसे लोकप्रिय पवित्र ग्रंथों में से एक के रूप में खड़ा है। दूसरी या पहली शताब्दी BCE की तिथि, राजकुमार अर्जुन और उनके सारथी कृष्ण (विष्णु के अवतार) के बीच यह संवाद कर्तव्य, कर्म और आध्यात्मिक मुक्ति के मौलिक प्रश्नों को संबोधित करता है।'
          }
        },
        philosophical: {
          title: { en: 'The Philosophical Framework', hi: 'दार्शनिक ढांचा' },
          intro: { 
            en: 'The Gita presents itself at the moment before the great battle of Kurukshetra, where Arjuna faces a moral crisis about fighting against friends and relatives. Krishna\'s teachings encompass:',
            hi: 'गीता खुद को कुरुक्षेत्र के महान युद्ध से पहले के क्षण में प्रस्तुत करती है, जहां अर्जुन दोस्तों और रिश्तेदारों के खिलाफ लड़ने के बारे में एक नैतिक संकट का सामना करता है। कृष्ण की शिक्षाओं में शामिल हैं:'
          },
          paths: {
            item1: { en: '• Karma Yoga - The path of righteous action', hi: '• कर्म योग - धार्मिक कर्म का मार्ग' },
            item2: { en: '• Bhakti Yoga - The path of devotion', hi: '• भक्ति योग - भक्ति का मार्ग' },
            item3: { en: '• Jnana Yoga - The path of knowledge', hi: '• ज्ञान योग - ज्ञान का मार्ग' }
          },
          concepts: {
            title: { en: 'Core Philosophical Concepts:', hi: 'मूल दार्शनिक अवधारणाएं:' },
            list: {
              item1: { en: '• Dharma - Righteous duty according to one\'s position in life', hi: '• धर्म - जीवन में अपनी स्थिति के अनुसार धार्मिक कर्तव्य' },
              item2: { en: '• Detached Action - Performing duty without attachment to results', hi: '• निर्लिप्त कर्म - परिणामों से लगाव के बिना कर्तव्य का पालन करना' },
              item3: { en: '• Immortality of the Soul - The eternal nature of the atman (soul)', hi: '• आत्मा की अमरता - आत्मन (आत्मा) की शाश्वत प्रकृति' },
              item4: { en: '• Divine Presence - God\'s accessibility to all sincere devotees', hi: '• दिव्य उपस्थिति - सभी ईमानदार भक्तों के लिए भगवान की पहुंच' }
            }
          },
          synthesis: { 
            en: 'The Gita represents a synthesis of various strands of Indian religious thought, including Vedic concepts of dharma, Samkhya-based yoga and jnana (knowledge), and bhakti (devotion). Krishna reminds Arjuna that it is best to fulfill one\'s destiny with detachment because detachment leads to liberation.',
            hi: 'गीता भारतीय धार्मिक विचार की विभिन्न धाराओं का एक संश्लेषण का प्रतिनिधित्व करती है, जिसमें धर्म की वैदिक अवधारणाएं, सांख्य-आधारित योग और ज्ञान, और भक्ति शामिल हैं। कृष्ण अर्जुन को याद दिलाते हैं कि निर्लिप्तता के साथ अपने भाग्य को पूरा करना सबसे अच्छा है क्योंकि निर्लिप्तता मुक्ति की ओर ले जाती है।'
          }
        },
        universal: {
          title: { en: 'Universal Appeal and Influence', hi: 'सार्वभौमिक अपील और प्रभाव' },
          description: { 
            en: 'The Bhagavad Gita has transcended religious boundaries to become a universal spiritual text. Its teachings on duty, righteousness, and the nature of reality have influenced philosophers, leaders, and spiritual seekers worldwide. The text\'s emphasis on performing one\'s duty without attachment to results has found resonance in various philosophical traditions and continues to guide millions in their spiritual journey.',
            hi: 'भगवद गीता ने धार्मिक सीमाओं को पार करके एक सार्वभौमिक आध्यात्मिक ग्रंथ बन गई है। कर्तव्य, धार्मिकता और वास्तविकता की प्रकृति पर इसकी शिक्षाओं ने दुनिया भर के दार्शनिकों, नेताओं और आध्यात्मिक साधकों को प्रभावित किया है। परिणामों से लगाव के बिना अपने कर्तव्य का पालन करने पर पाठ का जोर विभिन्न दार्शनिक परंपराओं में प्रतिध्वनि पाया है और लाखों लोगों को उनकी आध्यात्मिक यात्रा में मार्गदर्शन करना जारी रखता है।'
          }
        }
      },
      ramcharit: {
        title: { en: 'Ramcharitmanas - The Lake of Rama\'s Deeds', hi: 'रामचरितमानस - राम के कर्मों की झील' },
        description: { 
          en: 'The Ramcharitmanas, composed by the poet-saint Tulsidas in the 16th century, represents a devotional retelling of the Ramayan in the Awadhi dialect of Hindi. This beloved text makes the story of Rama accessible to common people and emphasizes bhakti (devotion) as the primary path to spiritual realization.',
          hi: '16वीं शताब्दी में कवि-संत तुलसीदास द्वारा रचित रामचरितमानस, हिंदी की अवधी बोली में रामायण का भक्तिपूर्ण पुनर्कथन का प्रतिनिधित्व करता है। यह प्रिय पाठ राम की कहानी को आम लोगों के लिए सुलभ बनाता है और आध्यात्मिक साक्षात्कार के प्राथमिक मार्ग के रूप में भक्ति पर जोर देता है।'
        },
        differences: {
          title: { en: 'The Ramcharitmanas differs from Valmiki\'s Sanskrit Ramayan by:', hi: 'रामचरितमानस वाल्मीकि की संस्कृत रामायण से भिन्न है:' },
          list: {
            item1: { en: '• Devotional emphasis over purely narrative approach', hi: '• शुद्ध कथात्मक दृष्टिकोण पर भक्तिपूर्ण जोर' },
            item2: { en: '• Accessibility through vernacular language', hi: '• स्थानीय भाषा के माध्यम से पहुंच' },
            item3: { en: '• Emotional connection between devotee and deity', hi: '• भक्त और देवता के बीच भावनात्मक संबंध' },
            item4: { en: '• Musical composition suitable for congregational singing', hi: '• सामूहिक गायन के लिए उपयुक्त संगीत रचना' }
          }
        }
      },
      puranas: {
        title: { en: 'The Puranas - Mythological Treasures', hi: 'पुराण - पौराणिक खजाने' },
        description: { 
          en: 'The Puranas, composed starting from around 300 CE, contain extensive mythologies and are central to distributing common themes of Hinduism through vivid narratives. These eighteen major texts and eighteen sub-puranas, traditionally attributed to Sage Vyasa, include:',
          hi: 'लगभग 300 CE से शुरू होकर रचित पुराणों में व्यापक पौराणिक कथाएं हैं और जीवंत कथाओं के माध्यम से हिंदू धर्म के सामान्य विषयों को वितरित करने में केंद्रीय हैं। ये अठारह प्रमुख ग्रंथ और अठारह उप-पुराण, जो परंपरागत रूप से ऋषि व्यास को जिम्मेदार ठहराए गए हैं, शामिल हैं:'
        },
        major: {
          title: { en: 'Major Puranas:', hi: 'प्रमुख पुराण:' },
          list: {
            item1: { en: '• Bhagavata Purana - Stories of Vishnu\'s incarnations, especially Krishna', hi: '• भागवत पुराण - विष्णु के अवतारों की कहानियां, विशेष रूप से कृष्ण' },
            item2: { en: '• Shiva Purana - Tales and teachings related to Lord Shiva', hi: '• शिव पुराण - भगवान शिव से संबंधित कहानियां और शिक्षाएं' },
            item3: { en: '• Devi Bhagavata Purana - Stories of the Divine Mother', hi: '• देवी भागवत पुराण - दिव्य माता की कहानियां' },
            item4: { en: '• Vishnu Purana - Comprehensive account of Vishnu\'s manifestations', hi: '• विष्णु पुराण - विष्णु की अभिव्यक्तियों का व्यापक विवरण' }
          }
        },
        significance: { 
          en: 'The Puranas generally emphasize valued Hindu morals through stories about Hindu deities fighting to uphold these principles. They serve as accessible repositories of complex philosophical concepts presented through engaging narratives.',
          hi: 'पुराण आमतौर पर इन सिद्धांतों को बनाए रखने के लिए लड़ने वाले हिंदू देवताओं की कहानियों के माध्यम से मूल्यवान हिंदू नैतिकता पर जोर देते हैं। वे जटिल दार्शनिक अवधारणाओं के सुलभ भंडार के रूप में कार्य करते हैं जो आकर्षक कथाओं के माध्यम से प्रस्तुत की जाती हैं।'
        }
      },
      additional: {
        title: { en: 'Additional Sacred Literature', hi: 'अतिरिक्त पवित्र साहित्य' },
        upanishads: {
          title: { en: 'The Upanishads - Philosophical Wisdom', hi: 'उपनिषद - दार्शनिक ज्ञान' },
          description: { 
            en: 'The Upanishads form the concluding portion of the Vedas and contain profound philosophical discussions on the nature of reality, consciousness, and liberation. These texts explore concepts like Brahman (ultimate reality), Atman (individual soul), and moksha (liberation).',
            hi: 'उपनिषद वेदों का समापन भाग बनाते हैं और वास्तविकता, चेतना और मुक्ति की प्रकृति पर गहन दार्शनिक चर्चाएं शामिल करते हैं। ये ग्रंथ ब्रह्म (परम वास्तविकता), आत्मन (व्यक्तिगत आत्मा), और मोक्ष (मुक्ति) जैसी अवधारणाओं का अन्वेषण करते हैं।'
          }
        },
        agamas: {
          title: { en: 'The Agamas - Tantric Literature', hi: 'आगम - तांत्रिक साहित्य' },
          description: { 
            en: 'The Agamas represent a collection of Tantric literature and scriptures from various Hindu schools. The term means "tradition" or "that which has come down," and these texts cover philosophical doctrines, meditation practices, deity worship, and temple construction.',
            hi: 'आगम विभिन्न हिंदू स्कूलों से तांत्रिक साहित्य और शास्त्रों का संग्रह का प्रतिनिधित्व करते हैं। शब्द का अर्थ है "परंपरा" या "जो नीचे आया है," और ये ग्रंथ दार्शनिक सिद्धांतों, ध्यान प्रथाओं, देवता पूजा और मंदिर निर्माण को कवर करते हैं।'
          }
        },
        regional: {
          title: { en: 'Regional and Sectarian Texts', hi: 'क्षेत्रीय और संप्रदायिक ग्रंथ' },
          description: { 
            en: 'Hindu literature also includes numerous regional works and sectarian texts that preserve local traditions while maintaining connection to the broader Hindu philosophical framework.',
            hi: 'हिंदू साहित्य में कई क्षेत्रीय कार्य और संप्रदायिक ग्रंथ भी शामिल हैं जो व्यापक हिंदू दार्शनिक ढांचे से संबंध बनाए रखते हुए स्थानीय परंपराओं को संरक्षित करते हैं।'
          }
        }
      },
      cultural: {
        title: { en: 'Cultural and Spiritual Significance', hi: 'सांस्कृतिक और आध्यात्मिक महत्व' },
        living: {
          title: { en: 'Living Traditions', hi: 'जीवित परंपराएं' },
          intro: { 
            en: 'These sacred texts remain living documents that continue to influence contemporary Hindu practice and thought. They are not merely historical artifacts but active guides for:',
            hi: 'ये पवित्र ग्रंथ जीवित दस्तावेज बने हुए हैं जो समकालीन हिंदू अभ्यास और विचार को प्रभावित करना जारी रखते हैं। वे केवल ऐतिहासिक कलाकृतियां नहीं हैं बल्कि सक्रिय मार्गदर्शक हैं:'
          },
          list: {
            item1: { en: '• Daily spiritual practice through prayer, meditation, and study', hi: '• प्रार्थना, ध्यान और अध्ययन के माध्यम से दैनिक आध्यात्मिक अभ्यास' },
            item2: { en: '• Moral guidance in ethical decision-making', hi: '• नैतिक निर्णय लेने में नैतिक मार्गदर्शन' },
            item3: { en: '• Cultural identity preservation across diverse communities', hi: '• विविध समुदायों में सांस्कृतिक पहचान संरक्षण' },
            item4: { en: '• Philosophical exploration of life\'s fundamental questions', hi: '• जीवन के मौलिक प्रश्नों का दार्शनिक अन्वेषण' }
          }
        },
        universal: {
          title: { en: 'Universal Themes', hi: 'सार्वभौमिक विषय' },
          intro: { 
            en: 'The Hindu holy books address universal human concerns:',
            hi: 'हिंदू पवित्र पुस्तकें सार्वभौमिक मानवीय चिंताओं को संबोधित करती हैं:'
          },
          list: {
            item1: { en: '• The struggle between good and evil', hi: '• अच्छाई और बुराई के बीच संघर्ष' },
            item2: { en: '• The nature of duty and responsibility', hi: '• कर्तव्य और जिम्मेदारी की प्रकृति' },
            item3: { en: '• The quest for meaning and purpose', hi: '• अर्थ और उद्देश्य की खोज' },
            item4: { en: '• The relationship between individual and cosmic consciousness', hi: '• व्यक्तिगत और ब्रह्मांडीय चेतना के बीच संबंध' },
            item5: { en: '• The path to spiritual liberation and fulfillment', hi: '• आध्यात्मिक मुक्ति और पूर्ति का मार्ग' }
          }
        },
        educational: {
          title: { en: 'Educational and Literary Value', hi: 'शैक्षिक और साहित्यिक मूल्य' },
          intro: { 
            en: 'Beyond their religious significance, these texts represent:',
            hi: 'उनके धार्मिक महत्व से परे, ये ग्रंथ प्रतिनिधित्व करते हैं:'
          },
          list: {
            item1: { en: '• Literary masterpieces showcasing sophisticated narrative techniques', hi: '• परिष्कृत कथात्मक तकनीकों का प्रदर्शन करने वाले साहित्यिक कृतियां' },
            item2: { en: '• Historical documents preserving ancient Indian culture and values', hi: '• प्राचीन भारतीय संस्कृति और मूल्यों को संरक्षित करने वाले ऐतिहासिक दस्तावेज' },
            item3: { en: '• Philosophical treatises exploring complex metaphysical concepts', hi: '• जटिल आध्यात्मिक अवधारणाओं का अन्वेषण करने वाले दार्शनिक ग्रंथ' },
            item4: { en: '• Psychological insights into human nature and behavior', hi: '• मानव प्रकृति और व्यवहार में मनोवैज्ञानिक अंतर्दृष्टि' }
          }
        }
      },
      modern: {
        title: { en: 'Modern Relevance and Global Impact', hi: 'आधुनिक प्रासंगिकता और वैश्विक प्रभाव' },
        contemporary: {
          title: { en: 'Contemporary Application', hi: 'समकालीन अनुप्रयोग' },
          intro: { 
            en: 'The teachings of these holy books continue to offer guidance for modern challenges:',
            hi: 'इन पवित्र पुस्तकों की शिक्षाएं आधुनिक चुनौतियों के लिए मार्गदर्शन प्रदान करना जारी रखती हैं:'
          },
          list: {
            item1: { en: '• Leadership principles from Rama\'s ideal kingship', hi: '• राम के आदर्श राजत्व से नेतृत्व सिद्धांत' },
            item2: { en: '• Conflict resolution through Krishna\'s diplomatic wisdom', hi: '• कृष्ण की कूटनीतिक बुद्धिमत्ता के माध्यम से संघर्ष समाधान' },
            item3: { en: '• Work-life balance through the Gita\'s concept of detached action', hi: '• गीता की निर्लिप्त कर्म की अवधारणा के माध्यम से कार्य-जीवन संतुलन' },
            item4: { en: '• Environmental consciousness reflected in Vedic reverence for nature', hi: '• प्रकृति के लिए वैदिक श्रद्धा में परिलक्षित पर्यावरणीय चेतना' }
          }
        },
        global: {
          title: { en: 'Global Influence', hi: 'वैश्विक प्रभाव' },
          intro: { 
            en: 'Hindu sacred literature has influenced thinkers, writers, and spiritual seekers worldwide, contributing to:',
            hi: 'हिंदू पवित्र साहित्य ने दुनिया भर के विचारकों, लेखकों और आध्यात्मिक साधकों को प्रभावित किया है, जो योगदान देता है:'
          },
          list: {
            item1: { en: '• Comparative philosophy and religious studies', hi: '• तुलनात्मक दर्शन और धार्मिक अध्ययन' },
            item2: { en: '• Literary traditions in various cultures', hi: '• विभिन्न संस्कृतियों में साहित्यिक परंपराएं' },
            item3: { en: '• Spiritual movements emphasizing meditation and inner transformation', hi: '• ध्यान और आंतरिक रूपांतरण पर जोर देने वाले आध्यात्मिक आंदोलन' },
            item4: { en: '• Ethical frameworks for personal and social conduct', hi: '• व्यक्तिगत और सामाजिक आचरण के लिए नैतिक ढांचे' }
          }
        }
      },
      conclusion: {
        title: { en: 'Conclusion: The Eternal Wisdom', hi: 'निष्कर्ष: शाश्वत ज्ञान' },
        text1: { 
          en: 'The Hindu holy books collectively represent humanity\'s most comprehensive exploration of spiritual wisdom, ethical conduct, and the quest for ultimate truth. From the cosmic hymns of the Vedas to the intimate devotional poetry of the Ramcharitmanas, these texts offer multiple paths to understanding the divine and achieving human fulfillment.',
          hi: 'हिंदू पवित्र पुस्तकें सामूहिक रूप से आध्यात्मिक ज्ञान, नैतिक आचरण और परम सत्य की खोज की मानवता की सबसे व्यापक खोज का प्रतिनिधित्व करती हैं। वेदों के ब्रह्मांडीय भजनों से लेकर रामचरितमानस की अंतरंग भक्तिपूर्ण कविता तक, ये ग्रंथ दिव्य को समझने और मानव पूर्ति प्राप्त करने के लिए कई मार्ग प्रदान करते हैं।'
        },
        text2: { 
          en: 'For millions of Hindus, these are not just ancient scriptures but living guides that continue to illuminate the path toward truth, righteousness, and liberation. Their enduring relevance lies in their ability to address the eternal questions of human existence while providing practical guidance for navigating life\'s complexities with wisdom, compassion, and spiritual insight.',
          hi: 'लाखों हिंदुओं के लिए, ये केवल प्राचीन शास्त्र नहीं हैं बल्कि जीवित मार्गदर्शक हैं जो सत्य, धार्मिकता और मुक्ति की ओर मार्ग को प्रकाशित करना जारी रखते हैं। उनकी स्थायी प्रासंगिकता मानव अस्तित्व के शाश्वत प्रश्नों को संबोधित करने की उनकी क्षमता में निहित है जबकि ज्ञान, करुणा और आध्यात्मिक अंतर्दृष्टि के साथ जीवन की जटिलताओं को नेविगेट करने के लिए व्यावहारिक मार्गदर्शन प्रदान करते हैं।'
        },
        text3: { 
          en: 'These sacred texts stand as testament to the profound spiritual achievements of ancient India and continue to serve as beacons of wisdom for seekers across the globe, regardless of their cultural or religious background. Their universal messages of duty, devotion, and the ultimate unity of all existence remain as relevant today as they were thousands of years ago.',
          hi: 'ये पवित्र ग्रंथ प्राचीन भारत की गहरी आध्यात्मिक उपलब्धियों के प्रमाण के रूप में खड़े हैं और उनकी सांस्कृतिक या धार्मिक पृष्ठभूमि की परवाह किए बिना दुनिया भर के साधकों के लिए ज्ञान के प्रकाशस्तंभ के रूप में कार्य करना जारी रखते हैं। कर्तव्य, भक्ति और सभी अस्तित्व की परम एकता के उनके सार्वभौमिक संदेश आज भी उतने ही प्रासंगिक हैं जितने हजारों वर्ष पहले थे।'
        }
      }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'twoTier', title: isHindi ? translations.sections.twoTier.hi : translations.sections.twoTier.en },
    { key: 'epics', title: isHindi ? translations.sections.epics.hi : translations.sections.epics.en },
    { key: 'gita', title: isHindi ? translations.sections.gita.hi : translations.sections.gita.en },
    { key: 'ramcharit', title: isHindi ? translations.sections.ramcharit.hi : translations.sections.ramcharit.en },
    { key: 'puranas', title: isHindi ? translations.sections.puranas.hi : translations.sections.puranas.en },
    { key: 'additional', title: isHindi ? translations.sections.additional.hi : translations.sections.additional.en },
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
          if (context.pageId === 'holy-books' && context.query) {
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
        return 'Hinduism boasts one of the world\'s most extensive and ancient collections of sacred literature, encompassing thousands of texts that have been preserved and transmitted across generations. These texts form the foundation of Hindu philosophy, spirituality, and cultural practices, offering guidance for every aspect of human life.';
      case 'twoTier':
        return 'Hindu sacred literature is traditionally classified into two main categories: Shruti (that which is heard) and Smriti (that which is remembered). Shruti texts are considered divinely revealed and include the Vedas, Upanishads, and Brahmanas. Smriti texts are human compositions that interpret and expand upon the Shruti teachings.';
      case 'epics':
        return 'The Mahabharata and Ramayana are the two great epics of Hinduism, each containing profound spiritual teachings embedded within their narrative structures. These epics have shaped Hindu culture and philosophy for thousands of years and continue to inspire millions of people worldwide.';
      case 'gita':
        return 'The Bhagavad Gita, often called the "Song of the Lord," is one of the most important texts in Hinduism. It presents a dialogue between Lord Krishna and Arjuna on the battlefield of Kurukshetra, addressing fundamental questions about duty, righteousness, and the nature of reality.';
      case 'ramcharit':
        return 'Ramcharitmanas, written by Tulsidas, is a retelling of the Ramayana in the Awadhi language. This text has become one of the most popular and accessible versions of the Ramayana story, particularly in North India.';
      case 'puranas':
        return 'The Puranas are a collection of ancient texts that contain mythological stories, genealogies, and philosophical teachings. There are eighteen major Puranas, each focusing on different aspects of Hindu cosmology and theology.';
      case 'additional':
        return 'Beyond the major texts, Hinduism includes numerous other sacred writings such as the Agamas, Tantras, and various commentaries by ancient and medieval scholars. These texts provide additional perspectives on Hindu philosophy and practice.';
      case 'cultural':
        return 'Hindu sacred literature has had a profound impact on Indian culture, influencing art, music, literature, and social practices. These texts continue to provide guidance for contemporary Hindu communities worldwide.';
      case 'modern':
        return 'In the modern era, Hindu sacred texts have gained global recognition and are studied by scholars and spiritual seekers from diverse backgrounds. Their universal themes of dharma, karma, and spiritual liberation continue to resonate with people across cultures.';
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
        searchPlaceholder="Search for Holy Books"
        enableSpiritualSearch={true}
        showSearchBar={false}
        showTopicDropdown={false}
        extraContent={
          <>
            {/* Custom Search Box - Inside the gradient */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search through Holy Books content..."
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

        <View style={styles.card} onLayout={(e) => (sectionY.current['twoTier'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.twoTier.hi : translations.sections.twoTier.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.twoTier.text1.hi : translations.content.twoTier.text1.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
          <HighlightedText 
            text={isHindi ? translations.content.twoTier.text2.hi : translations.content.twoTier.text2.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['epics'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.sections.epics.hi : translations.sections.epics.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.epics.mahabharat.title.hi : translations.content.epics.mahabharat.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.mahabharat.intro.hi : translations.content.epics.mahabharat.intro.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.mahabharat.encompasses.title.hi : translations.content.epics.mahabharat.encompasses.title.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.mahabharat.encompasses.list.item1.hi : translations.content.epics.mahabharat.encompasses.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.mahabharat.encompasses.list.item2.hi : translations.content.epics.mahabharat.encompasses.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.mahabharat.encompasses.list.item3.hi : translations.content.epics.mahabharat.encompasses.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.mahabharat.encompasses.list.item4.hi : translations.content.epics.mahabharat.encompasses.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.mahabharat.significance.hi : translations.content.epics.mahabharat.significance.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.epics.ramayan.title.hi : translations.content.epics.ramayan.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.ramayan.intro.hi : translations.content.epics.ramayan.intro.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.ramayan.narrative.title.hi : translations.content.epics.ramayan.narrative.title.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.ramayan.narrative.list.item1.hi : translations.content.epics.ramayan.narrative.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.ramayan.narrative.list.item2.hi : translations.content.epics.ramayan.narrative.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.ramayan.narrative.list.item3.hi : translations.content.epics.ramayan.narrative.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.epics.ramayan.narrative.list.item4.hi : translations.content.epics.ramayan.narrative.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.epics.ramayan.significance.hi : translations.content.epics.ramayan.significance.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['gita'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.gita.title.hi : translations.content.gita.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.gita.crownJewel.title.hi : translations.content.gita.crownJewel.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.gita.crownJewel.description.hi : translations.content.gita.crownJewel.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.gita.philosophical.title.hi : translations.content.gita.philosophical.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.gita.philosophical.intro.hi : translations.content.gita.philosophical.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.paths.item1.hi : translations.content.gita.philosophical.paths.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.paths.item2.hi : translations.content.gita.philosophical.paths.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.paths.item3.hi : translations.content.gita.philosophical.paths.item3.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.gita.philosophical.concepts.title.hi : translations.content.gita.philosophical.concepts.title.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.concepts.list.item1.hi : translations.content.gita.philosophical.concepts.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.concepts.list.item2.hi : translations.content.gita.philosophical.concepts.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.concepts.list.item3.hi : translations.content.gita.philosophical.concepts.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.gita.philosophical.concepts.list.item4.hi : translations.content.gita.philosophical.concepts.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.gita.philosophical.synthesis.hi : translations.content.gita.philosophical.synthesis.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.gita.universal.title.hi : translations.content.gita.universal.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.gita.universal.description.hi : translations.content.gita.universal.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['ramcharit'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.ramcharit.title.hi : translations.content.ramcharit.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.ramcharit.description.hi : translations.content.ramcharit.description.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.ramcharit.differences.title.hi : translations.content.ramcharit.differences.title.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.ramcharit.differences.list.item1.hi : translations.content.ramcharit.differences.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.ramcharit.differences.list.item2.hi : translations.content.ramcharit.differences.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.ramcharit.differences.list.item3.hi : translations.content.ramcharit.differences.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.ramcharit.differences.list.item4.hi : translations.content.ramcharit.differences.list.item4.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['puranas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.puranas.title.hi : translations.content.puranas.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.puranas.description.hi : translations.content.puranas.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.puranas.major.title.hi : translations.content.puranas.major.title.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.puranas.major.list.item1.hi : translations.content.puranas.major.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.puranas.major.list.item2.hi : translations.content.puranas.major.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.puranas.major.list.item3.hi : translations.content.puranas.major.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.puranas.major.list.item4.hi : translations.content.puranas.major.list.item4.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.puranas.significance.hi : translations.content.puranas.significance.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['additional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.additional.title.hi : translations.content.additional.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.additional.upanishads.title.hi : translations.content.additional.upanishads.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.additional.upanishads.description.hi : translations.content.additional.upanishads.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.additional.agamas.title.hi : translations.content.additional.agamas.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.additional.agamas.description.hi : translations.content.additional.agamas.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.additional.regional.title.hi : translations.content.additional.regional.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.additional.regional.description.hi : translations.content.additional.regional.description.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['cultural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.cultural.title.hi : translations.content.cultural.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.living.title.hi : translations.content.cultural.living.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.living.intro.hi : translations.content.cultural.living.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.living.list.item1.hi : translations.content.cultural.living.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.living.list.item2.hi : translations.content.cultural.living.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.living.list.item3.hi : translations.content.cultural.living.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.living.list.item4.hi : translations.content.cultural.living.list.item4.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.universal.title.hi : translations.content.cultural.universal.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.universal.intro.hi : translations.content.cultural.universal.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.universal.list.item1.hi : translations.content.cultural.universal.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.universal.list.item2.hi : translations.content.cultural.universal.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.universal.list.item3.hi : translations.content.cultural.universal.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.universal.list.item4.hi : translations.content.cultural.universal.list.item4.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.universal.list.item5.hi : translations.content.cultural.universal.list.item5.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.cultural.educational.title.hi : translations.content.cultural.educational.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.cultural.educational.intro.hi : translations.content.cultural.educational.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.educational.list.item1.hi : translations.content.cultural.educational.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.educational.list.item2.hi : translations.content.cultural.educational.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.educational.list.item3.hi : translations.content.cultural.educational.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.cultural.educational.list.item4.hi : translations.content.cultural.educational.list.item4.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['modern'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.modern.title.hi : translations.content.modern.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.modern.contemporary.title.hi : translations.content.modern.contemporary.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.modern.contemporary.intro.hi : translations.content.modern.contemporary.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.contemporary.list.item1.hi : translations.content.modern.contemporary.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.contemporary.list.item2.hi : translations.content.modern.contemporary.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.contemporary.list.item3.hi : translations.content.modern.contemporary.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.contemporary.list.item4.hi : translations.content.modern.contemporary.list.item4.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.modern.global.title.hi : translations.content.modern.global.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.modern.global.intro.hi : translations.content.modern.global.intro.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.global.list.item1.hi : translations.content.modern.global.list.item1.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.global.list.item2.hi : translations.content.modern.global.list.item2.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.global.list.item3.hi : translations.content.modern.global.list.item3.en}
          </Text>
          <Text style={styles.li}>
            {isHindi ? translations.content.modern.global.list.item4.hi : translations.content.modern.global.list.item4.en}
          </Text>
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.conclusion.title.hi : translations.content.conclusion.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.text1.hi : translations.content.conclusion.text1.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.text2.hi : translations.content.conclusion.text2.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.text3.hi : translations.content.conclusion.text3.en}
          </Text>
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
});