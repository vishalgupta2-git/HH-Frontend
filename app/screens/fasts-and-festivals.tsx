import React, { useRef, useState, useCallback } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, TextInput, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HomeHeader from '@/components/Home/HomeHeader';
import HighlightedText from '@/components/Home/HighlightedText';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function FastsAndFestivalsScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      majorFestivals: { en: 'Major Hindu Festivals', hi: 'प्रमुख हिंदू त्योहार' },
      sacredFasting: { en: 'Sacred Fasting Days', hi: 'पवित्र उपवास दिवस' },
      seasonalRegional: { en: 'Seasonal and Regional Festivals', hi: 'मौसमी और क्षेत्रीय त्योहार' },
      spiritualSignificance: { en: 'Spiritual Significance of Fasting', hi: 'उपवास का आध्यात्मिक महत्व' },
      modernRelevance: { en: 'Modern Relevance', hi: 'आधुनिक प्रासंगिकता' },
      references: { en: 'References', hi: 'संदर्भ' }
    },
    content: {
      title: { en: 'Fasts and Festivals: Sacred Traditions Based on Lunar Calendar', hi: 'उपवास और त्योहार: चंद्र कैलेंडर पर आधारित पवित्र परंपराएं' },
      intro: { 
        en: 'Hindu festivals and fasts are deeply rooted in the lunar calendar and astronomical calculations. These sacred observances mark important spiritual milestones, honor deities, and celebrate the eternal cycle of creation, preservation, and dissolution. Each festival carries profound spiritual significance and connects devotees to divine consciousness.',
        hi: 'हिंदू त्योहार और उपवास चंद्र कैलेंडर और खगोलीय गणनाओं में गहराई से निहित हैं। ये पवित्र अनुष्ठान महत्वपूर्ण आध्यात्मिक मील के पत्थरों को चिह्नित करते हैं, देवताओं का सम्मान करते हैं, और सृष्टि, संरक्षण और विघटन के शाश्वत चक्र का जश्न मनाते हैं। प्रत्येक त्योहार गहरे आध्यात्मिक महत्व को वहन करता है और भक्तों को दिव्य चेतना से जोड़ता है।'
      },
      majorFestivals: {
        title: { en: 'Major Hindu Festivals', hi: 'प्रमुख हिंदू त्योहार' },
        diwali: {
          title: { en: 'Diwali - Festival of Lights', hi: 'दीवाली - रोशनी का त्योहार' },
          description: { 
            en: 'Celebrated on the new moon day of Kartik month, Diwali symbolizes the victory of light over darkness and knowledge over ignorance. It commemorates Lord Rama\'s return to Ayodhya and the triumph of good over evil. Homes are illuminated with diyas, rangolis are created, and families gather for prayers and celebrations.',
            hi: 'कार्तिक माह की अमावस्या के दिन मनाया जाने वाला दीवाली अंधकार पर प्रकाश और अज्ञान पर ज्ञान की जीत का प्रतीक है। यह भगवान राम की अयोध्या वापसी और बुराई पर अच्छाई की जीत का स्मरण कराता है। घरों को दीयों से रोशन किया जाता है, रंगोली बनाई जाती है, और परिवार प्रार्थना और उत्सव के लिए एकत्र होते हैं।'
          }
        },
        holi: {
          title: { en: 'Holi - Festival of Colors', hi: 'होली - रंगों का त्योहार' },
          description: { 
            en: 'Observed on the full moon day of Phalgun month, Holi celebrates divine love between Radha and Krishna. It represents the victory of devotion over ego and the arrival of spring. People play with colors, sing devotional songs, and share sweets, symbolizing unity and joy.',
            hi: 'फाल्गुन माह की पूर्णिमा के दिन मनाया जाने वाला होली राधा और कृष्ण के बीच दिव्य प्रेम का जश्न मनाता है। यह अहंकार पर भक्ति की जीत और वसंत के आगमन का प्रतिनिधित्व करता है। लोग रंगों से खेलते हैं, भक्ति गीत गाते हैं, और मिठाइयां बांटते हैं, जो एकता और खुशी का प्रतीक है।'
          }
        },
        makarSankranti: {
          title: { en: 'Makar Sankranti - Sun\'s Journey', hi: 'मकर संक्रांति - सूर्य की यात्रा' },
          description: { 
            en: 'Celebrated when the sun enters Capricorn (Makar), this festival marks the beginning of Uttarayan (northward journey of the sun). It symbolizes spiritual awakening and the triumph of light. Kite flying, sesame sweets, and holy dips in sacred rivers are traditional practices.',
            hi: 'जब सूर्य मकर राशि में प्रवेश करता है तो मनाया जाने वाला यह त्योहार उत्तरायण (सूर्य की उत्तर की ओर यात्रा) की शुरुआत का प्रतीक है। यह आध्यात्मिक जागृति और प्रकाश की जीत का प्रतीक है। पतंग उड़ाना, तिल की मिठाइयां, और पवित्र नदियों में पवित्र स्नान पारंपरिक प्रथाएं हैं।'
          }
        },
        rakshaBandhan: {
          title: { en: 'Raksha Bandhan - Bond of Protection', hi: 'रक्षा बंधन - सुरक्षा का बंधन' },
          description: { 
            en: 'Observed on the full moon day of Shravan month, this festival celebrates the sacred bond between brothers and sisters. Sisters tie rakhi (sacred thread) on brothers\' wrists, symbolizing love, protection, and the eternal bond of family.',
            hi: 'श्रावण माह की पूर्णिमा के दिन मनाया जाने वाला यह त्योहार भाइयों और बहनों के बीच पवित्र बंधन का जश्न मनाता है। बहनें भाइयों की कलाई पर राखी (पवित्र धागा) बांधती हैं, जो प्रेम, सुरक्षा और परिवार के शाश्वत बंधन का प्रतीक है।'
          }
        },
        janmashtami: {
          title: { en: 'Janmashtami - Birth of Krishna', hi: 'जन्माष्टमी - कृष्ण का जन्म' },
          description: { 
            en: 'Celebrated on the eighth day of the dark fortnight of Bhadrapada month, Janmashtami commemorates Lord Krishna\'s birth. Devotees observe fasts, sing bhajans, and perform special pujas to honor the divine incarnation who delivered the Bhagavad Gita.',
            hi: 'भाद्रपद माह के कृष्ण पक्ष की अष्टमी के दिन मनाया जाने वाला जन्माष्टमी भगवान कृष्ण के जन्म का स्मरण कराता है। भक्त उपवास रखते हैं, भजन गाते हैं, और भगवद गीता देने वाले दिव्य अवतार का सम्मान करने के लिए विशेष पूजा करते हैं।'
          }
        }
      },
      sacredFasting: {
        title: { en: 'Sacred Fasting Days', hi: 'पवित्र उपवास दिवस' },
        ekadashi: {
          title: { en: 'Ekadashi - Eleventh Day Fast', hi: 'एकादशी - ग्यारहवें दिन का उपवास' },
          description: { 
            en: 'Observed on the eleventh day of both lunar fortnights, Ekadashi is dedicated to Lord Vishnu. Fasting on this day purifies the body and mind, enhances spiritual awareness, and helps overcome negative tendencies. Different Ekadashis have unique significance and benefits.',
            hi: 'दोनों चंद्र पक्षों के ग्यारहवें दिन मनाया जाने वाला एकादशी भगवान विष्णु को समर्पित है। इस दिन उपवास रखना शरीर और मन को शुद्ध करता है, आध्यात्मिक जागरूकता बढ़ाता है, और नकारात्मक प्रवृत्तियों पर काबू पाने में मदद करता है। अलग-अलग एकादशी का अद्वितीय महत्व और लाभ है।'
          }
        },
        pradosha: {
          title: { en: 'Pradosha - Thirteenth Day Fast', hi: 'प्रदोष - तेरहवें दिन का उपवास' },
          description: { 
            en: 'Observed on the thirteenth day of both lunar fortnights, Pradosha is dedicated to Lord Shiva.',
            hi: 'दोनों चंद्र पक्षों के तेरहवें दिन मनाया जाने वाला प्रदोष भगवान शिव को समर्पित है।'
          }
        },
        sankashti: {
          title: { en: 'Sankashti Chaturthi - Ganesha Fast', hi: 'संकष्टी चतुर्थी - गणेश उपवास' },
          description: { 
            en: 'Observed on the fourth day of the waning moon, this fast is dedicated to Lord Ganesha. It helps remove obstacles, brings success, and fulfills wishes. Devotees break their fast after sighting the moon and offering prayers to Ganesha.',
            hi: 'कृष्ण पक्ष की चतुर्थी के दिन मनाया जाने वाला यह उपवास भगवान गणेश को समर्पित है। यह बाधाओं को दूर करने, सफलता लाने और इच्छाओं को पूरा करने में मदद करता है। भक्त चंद्रमा को देखने और गणेश की प्रार्थना करने के बाद अपना उपवास तोड़ते हैं।'
          }
        },
        monday: {
          title: { en: 'Mondays - Shiva Fasting', hi: 'सोमवार - शिव उपवास' },
          description: { 
            en: 'Monday fasts are dedicated to Lord Shiva and Goddess Parvati. This practice helps control emotions, brings mental peace, and strengthens marital harmony. Devotees consume only fruits, milk, and light meals while focusing on spiritual practices.',
            hi: 'सोमवार का उपवास भगवान शिव और देवी पार्वती को समर्पित है। यह अभ्यास भावनाओं को नियंत्रित करने, मानसिक शांति लाने और वैवाहिक सामंजस्य को मजबूत बनाने में मदद करता है। भक्त आध्यात्मिक अभ्यास पर ध्यान केंद्रित करते हुए केवल फल, दूध और हल्का भोजन ग्रहण करते हैं।'
          }
        }
      },
      navratri: {
        title: { en: 'Navratri - Nine Nights of Goddess', hi: 'नवरात्रि - देवी के नौ रात्रि' },
        description: { 
          en: 'Celebrated twice a year (Chaitra and Ashwin months), Navratri honors the divine feminine energy. For nine nights, devotees worship different forms of Goddess Durga, observe fasts, and perform traditional dances like Garba and Dandiya. The festival culminates with Dussehra, celebrating the victory of good over evil.',
          hi: 'साल में दो बार (चैत्र और आश्विन माह) मनाया जाने वाला नवरात्रि दिव्य स्त्री ऊर्जा का सम्मान करता है। नौ रातों तक, भक्त देवी दुर्गा के विभिन्न रूपों की पूजा करते हैं, उपवास रखते हैं, और गरबा और डांडिया जैसे पारंपरिक नृत्य करते हैं। त्योहार दशहरा के साथ समाप्त होता है, जो बुराई पर अच्छाई की जीत का जश्न मनाता है।'
        }
      },
      seasonalRegional: {
        title: { en: 'Seasonal and Regional Festivals', hi: 'मौसमी और क्षेत्रीय त्योहार' },
        ganeshChaturthi: {
          title: { en: 'Ganesh Chaturthi - Ganesha Festival', hi: 'गणेश चतुर्थी - गणेश त्योहार' },
          description: { 
            en: 'Celebrated on the fourth day of Bhadrapada month, this festival honors Lord Ganesha\'s birth. Clay idols are installed in homes and public places, worshipped for ten days, and then immersed in water bodies. It symbolizes the cycle of creation and dissolution.',
            hi: 'भाद्रपद माह की चतुर्थी के दिन मनाया जाने वाला यह त्योहार भगवान गणेश के जन्म का सम्मान करता है। मिट्टी की मूर्तियां घरों और सार्वजनिक स्थानों पर स्थापित की जाती हैं, दस दिनों तक पूजी जाती हैं, और फिर जल निकायों में विसर्जित की जाती हैं। यह सृष्टि और विघटन के चक्र का प्रतीक है।'
          }
        },
        karthigaiDeepam: {
          title: { en: 'Karthigai Deepam - Festival of Lamps', hi: 'कार्तिक दीपम - दीपों का त्योहार' },
          description: { 
            en: 'Observed on the full moon day of Karthigai month, this festival involves lighting numerous lamps to dispel darkness and ignorance. It commemorates the divine light that emerged from the cosmic ocean and represents the eternal flame of knowledge and wisdom.',
            hi: 'कार्तिक माह की पूर्णिमा के दिन मनाया जाने वाला यह त्योहार अंधकार और अज्ञान को दूर करने के लिए कई दीपक जलाने से जुड़ा है। यह ब्रह्मांडीय समुद्र से निकले दिव्य प्रकाश का स्मरण कराता है और ज्ञान और बुद्धि की शाश्वत लौ का प्रतिनिधित्व करता है।'
          }
        }
      },
      spiritualSignificance: {
        title: { en: 'Spiritual Significance of Fasting', hi: 'उपवास का आध्यात्मिक महत्व' },
        description: { 
          en: 'Fasting in Hinduism is not merely abstaining from food but a comprehensive spiritual practice. It helps control the senses, purify the mind, and develop willpower. Different types of fasts (Nirjala, Phalahara, Ekabhukta) serve various spiritual purposes and help devotees progress on their spiritual journey.',
          hi: 'हिंदू धर्म में उपवास केवल भोजन से परहेज करना नहीं बल्कि एक व्यापक आध्यात्मिक अभ्यास है। यह इंद्रियों को नियंत्रित करने, मन को शुद्ध करने और इच्छाशक्ति विकसित करने में मदद करता है। विभिन्न प्रकार के उपवास (निर्जला, फलाहार, एकभुक्त) विभिन्न आध्यात्मिक उद्देश्यों की पूर्ति करते हैं और भक्तों को उनकी आध्यात्मिक यात्रा में प्रगति करने में मदद करते हैं।'
        }
      },
      modernRelevance: {
        title: { en: 'Modern Relevance', hi: 'आधुनिक प्रासंगिकता' },
        description: { 
          en: 'In today\'s fast-paced world, Hindu festivals and fasts provide much-needed spiritual grounding and cultural continuity. They remind us of our ancient wisdom, strengthen community bonds, and offer opportunities for spiritual growth. These traditions continue to inspire millions worldwide, preserving the rich cultural heritage of Hinduism.',
          hi: 'आज की तेज गति वाली दुनिया में, हिंदू त्योहार और उपवास बहुत आवश्यक आध्यात्मिक आधार और सांस्कृतिक निरंतरता प्रदान करते हैं। वे हमें हमारे प्राचीन ज्ञान की याद दिलाते हैं, सामुदायिक बंधनों को मजबूत बनाते हैं, और आध्यात्मिक विकास के अवसर प्रदान करते हैं। ये परंपराएं दुनिया भर में लाखों लोगों को प्रेरित करना जारी रखती हैं, हिंदू धर्म की समृद्ध सांस्कृतिक विरासत को संरक्षित करती हैं।'
        }
      }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'majorFestivals', title: isHindi ? translations.sections.majorFestivals.hi : translations.sections.majorFestivals.en },
    { key: 'sacredFasting', title: isHindi ? translations.sections.sacredFasting.hi : translations.sections.sacredFasting.en },
    { key: 'seasonalRegional', title: isHindi ? translations.sections.seasonalRegional.hi : translations.sections.seasonalRegional.en },
    { key: 'spiritualSignificance', title: isHindi ? translations.sections.spiritualSignificance.hi : translations.sections.spiritualSignificance.en },
    { key: 'modernRelevance', title: isHindi ? translations.sections.modernRelevance.hi : translations.sections.modernRelevance.en },
    { key: 'references', title: isHindi ? translations.sections.references.hi : translations.sections.references.en },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(isHindi ? 'विषय' : 'Topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        return 'Hindu festivals and fasts are deeply rooted in the lunar calendar and astronomical calculations. These sacred observances mark important spiritual milestones, honor deities, and celebrate the eternal cycle of creation, preservation, and dissolution.';
      case 'majorFestivals':
        return 'Major Hindu festivals include Diwali, Holi, Navratri, and many others that celebrate different aspects of divine energy and spiritual significance. These festivals bring communities together in celebration and devotion.';
      case 'sacredFasting':
        return 'Sacred fasting days are observed to purify the body and mind, enhance spiritual awareness, and demonstrate devotion to specific deities. Fasting practices vary from complete abstinence to partial restrictions.';
      case 'seasonalRegional':
        return 'Seasonal and regional festivals reflect the diverse cultural traditions across India, celebrating harvests, seasonal changes, and local deities with unique customs and practices.';
      case 'spiritualSignificance':
        return 'The spiritual significance of fasting extends beyond physical discipline to include mental purification, increased concentration, and deeper connection with divine consciousness.';
      case 'modernRelevance':
        return 'Modern relevance of Hindu festivals and fasts continues to grow as people seek spiritual meaning, community connection, and cultural preservation in contemporary society.';
      default:
        return '';
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchHighlight(text);
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
    setSearchHighlight('');
  };

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel(isHindi ? 'विषय' : 'Topic');
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      // You can add actual refresh logic here, such as:
      // - Reloading data from an API
      // - Clearing search results
      // - Resetting any cached content
      setSearchQuery('');
      setSearchResults([]);
      setCurrentResultIndex(-1);
      setShowSearchResults(false);
      setSearchHighlight('');
      setDropdownLabel(isHindi ? 'विषय' : 'Topic');
    }, 1000);
  }, []);

  const references = [
    "https://en.wikipedia.org/wiki/Hindu_festivals",
    "https://www.britannica.com/topic/Hindu-festivals",
    "https://www.hinduwebsite.com/hinduism/h_festivals.asp",
    "https://www.exoticindiaart.com/blog/hindu-festivals-and-celebrations/",
    "https://www.hinduismtoday.com/modules/smartsection/item.php?itemid=5076",
    "https://www.sanskritimagazine.com/hindu-festivals/",
    "https://www.hinduism.co.za/festival.htm",
    "https://www.hinduismfacts.org/hindu-festivals/",
    "https://www.hinduwebsite.com/hinduism/h_fasting.asp",
    "https://www.speakingtree.in/allslides/hindu-fasting-days",
    "https://www.hinduismtoday.com/modules/smartsection/item.php?itemid=5077",
    "https://www.hinduwebsite.com/hinduism/h_calendar.asp",
    "https://www.drikpanchang.com/festivals/festivals.html",
    "https://www.hinduism.co.za/calendar.htm",
    "https://www.hinduwebsite.com/hinduism/h_astrology.asp"
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search festivals, fasts, traditions..."
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
                placeholder="Search through Fasts and Festivals content..."
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF9800']}
              tintColor="#FF9800"
              title="Pull to refresh"
              titleColor="#FF9800"
            />
          }
        >
        {/* Intro */}
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

        {/* Major Festivals */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['majorFestivals'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.majorFestivals.title.hi : translations.content.majorFestivals.title.en}
          </Text>
          
          <Image 
            source={require('@/assets/images/fastsAndFestivals/Diwali6.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.majorFestivals.diwali.title.hi : translations.content.majorFestivals.diwali.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.majorFestivals.diwali.description.hi : translations.content.majorFestivals.diwali.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Image 
            source={require('@/assets/images/fastsAndFestivals/Holi1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.majorFestivals.holi.title.hi : translations.content.majorFestivals.holi.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.majorFestivals.holi.description.hi : translations.content.majorFestivals.holi.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Image 
            source={require('@/assets/images/fastsAndFestivals/MakarSakranti1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.majorFestivals.makarSankranti.title.hi : translations.content.majorFestivals.makarSankranti.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.majorFestivals.makarSankranti.description.hi : translations.content.majorFestivals.makarSankranti.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Image 
            source={require('@/assets/images/fastsAndFestivals/RakshaBandhan1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.majorFestivals.rakshaBandhan.title.hi : translations.content.majorFestivals.rakshaBandhan.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.majorFestivals.rakshaBandhan.description.hi : translations.content.majorFestivals.rakshaBandhan.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Image 
            source={require('@/assets/images/fastsAndFestivals/Janmashtami1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.majorFestivals.janmashtami.title.hi : translations.content.majorFestivals.janmashtami.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.majorFestivals.janmashtami.description.hi : translations.content.majorFestivals.janmashtami.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        {/* Sacred Fasting */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['sacredFasting'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.sacredFasting.title.hi : translations.content.sacredFasting.title.en}
          </Text>
          
          <Text style={styles.h3}>
            {isHindi ? translations.content.sacredFasting.ekadashi.title.hi : translations.content.sacredFasting.ekadashi.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.sacredFasting.ekadashi.description.hi : translations.content.sacredFasting.ekadashi.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.sacredFasting.pradosha.title.hi : translations.content.sacredFasting.pradosha.title.en}
          </Text>
          <HighlightedText 
            text={isHindi ? translations.content.sacredFasting.pradosha.description.hi : translations.content.sacredFasting.pradosha.description.en}
            highlight={searchHighlight}
            textStyle={styles.p}
          />

          <Text style={styles.h3}>
            {isHindi ? translations.content.sacredFasting.sankashti.title.hi : translations.content.sacredFasting.sankashti.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.sacredFasting.sankashti.description.hi : translations.content.sacredFasting.sankashti.description.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.sacredFasting.monday.title.hi : translations.content.sacredFasting.monday.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.sacredFasting.monday.description.hi : translations.content.sacredFasting.monday.description.en}
          </Text>
        </View>

        {/* Seasonal and Regional */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['seasonalRegional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>Seasonal and Regional Festivals</Text>
          
          <Image 
            source={require('@/assets/images/fastsAndFestivals/Navratri1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.navratri.title.hi : translations.content.navratri.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.navratri.description.hi : translations.content.navratri.description.en}
          </Text>

          <Image 
            source={require('@/assets/images/fastsAndFestivals/GaneshChaturthi1.jpg')} 
            style={styles.festivalImage} 
            resizeMode="contain"
          />
          <Text style={styles.h3}>
            {isHindi ? translations.content.seasonalRegional.ganeshChaturthi.title.hi : translations.content.seasonalRegional.ganeshChaturthi.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.seasonalRegional.ganeshChaturthi.description.hi : translations.content.seasonalRegional.ganeshChaturthi.description.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.seasonalRegional.karthigaiDeepam.title.hi : translations.content.seasonalRegional.karthigaiDeepam.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.seasonalRegional.karthigaiDeepam.description.hi : translations.content.seasonalRegional.karthigaiDeepam.description.en}
          </Text>
        </View>

        {/* Spiritual Significance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritualSignificance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.spiritualSignificance.title.hi : translations.content.spiritualSignificance.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.spiritualSignificance.description.hi : translations.content.spiritualSignificance.description.en}
          </Text>
        </View>

        {/* Modern Relevance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['modernRelevance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.modernRelevance.title.hi : translations.content.modernRelevance.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.modernRelevance.description.hi : translations.content.modernRelevance.description.en}
          </Text>
        </View>

        {/* References */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>References</Text>
          {references.map((url, index) => (
            <Text key={index} style={[styles.p, styles.link]} onPress={() => Linking.openURL(url)}>
              [{index + 1}] {url}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { padding: 16, paddingBottom: 32 },
  cardTop: { borderRadius: 16, padding: 16, marginBottom: 14 },
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
  h1: { fontSize: 20, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: '600', color: '#FF9800', marginTop: 6, marginBottom: 4 },
  festivalImage: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
    alignSelf: 'center',
  },
  p: { fontSize: 14, color: '#555', lineHeight: 20 },
  link: { color: '#1a73e8', textDecorationLine: 'underline' },
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
    color: '#333' 
  },
  dropdownChevron: { 
    color: '#666',
    fontSize: 20 
  },
  dropdownOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24 
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
    color: '#333' 
  },
  searchInputContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 0,
  },
  searchNavigationInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#fff',
    marginRight: 10,
  },
  navButtonInline: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navButtonTextInline: {
    fontSize: 18,
    color: '#fff',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#fff',
  },
}); 