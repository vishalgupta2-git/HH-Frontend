import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

export default function DiwaliScreen() {
  const router = useRouter();
  const [isHindi, setIsHindi] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const toggleLanguage = () => {
    setIsHindi(!isHindi);
  };

  const tabs = [
    { id: 0, en: 'Information', hi: 'जानकारी' },
    { id: 1, en: '5 Days of Diwali', hi: 'दीपावली के 5 दिन' },
    { id: 2, en: 'Puja method - Dhanteras', hi: 'पूजा विधि - धनतेरस' },
    { id: 3, en: 'Puja method - Choti Diwali', hi: 'पूजा विधि - छोटी दीपावली' },
    { id: 4, en: 'Puja method - Diwali', hi: 'पूजा विधि - दीपावली' },
    { id: 5, en: 'Puja method - Govardan Puja', hi: 'पूजा विधि - गोवर्धन पूजा' },
    { id: 6, en: 'Puja method - Bhai Dooj', hi: 'पूजा विधि - भाई दूज' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FF6A00', '#FF8C00', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo */}
        <Image
          source={require('@/assets/images/hindu heritage.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Temple illustration */}
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.templeIllustration}
          resizeMode="contain"
        />
        {/* Hindi Toggle - moved inside gradient header */}
        <View style={styles.toggleContainerInHeader}>
          <TouchableOpacity style={styles.hindiToggle} onPress={toggleLanguage}>
            <Text style={styles.toggleText}>{isHindi ? 'English' : 'हिंदी'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>
              {isHindi ? 'दीपावली' : 'Diwali'}
            </Text>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText
                ]}>
                  {isHindi ? tab.hi : tab.en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Tab Content */}
            {selectedTab === 0 && (
              <View style={styles.tabContent} onLayout={(event) => {
                const {width, height} = event.nativeEvent.layout;
                console.log('Tab content layout - Width:', width, 'Height:', height);
              }}>
                {/* Information Tab Image */}
                <Image
                  source={isHindi 
                    ? require('../../assets/images/fastsAndFestivals/DiwaliInfoGraphic_Hindi.jpg')
                    : require('../../assets/images/fastsAndFestivals/DiwaliInfoGraphic_Eng.jpg')
                  }
                  style={styles.infoImage}
                  resizeMode="contain"
                  onError={(error) => {}}
                  onLoad={() => {}}
                  onLayout={(event) => {
                    const {width, height} = event.nativeEvent.layout;
                  }}
                />
                
                {/* Information Tab Text */}
                {!isHindi ? (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🌟 Diwali (Deepavali)</Text>
                    
                    <Text style={styles.subHeading}>🪔 Meaning of Diwali</Text>
                    <Text style={styles.bulletPoint}>• The word "Deepavali" comes from Sanskrit: Deepa (lamp, light) + Avali (row, series), meaning "a row of lights."</Text>
                    <Text style={styles.bulletPoint}>• Symbolizes the victory of light over darkness, good over evil, and knowledge over ignorance.</Text>
                    
                    <Text style={styles.subHeading}>📖 Mythological Significance</Text>
                    <Text style={styles.paragraph}>Diwali is associated with different legends across India:</Text>
                    
                    <Text style={styles.subHeading}>1. Lord Rama's Return (North India)</Text>
                    <Text style={styles.bulletPoint}>• Celebrates Lord Rama's return to Ayodhya with Sita and Lakshmana after 14 years of exile and his victory over Ravana.</Text>
                    <Text style={styles.bulletPoint}>• People lit diyas (lamps) to welcome them, which became the tradition.</Text>
                    
                    <Text style={styles.subHeading}>2. Lord Krishna & Narakasura (South India)</Text>
                    <Text style={styles.bulletPoint}>• Marks Lord Krishna's victory over Narakasura, a demon king.</Text>
                    <Text style={styles.bulletPoint}>• Symbolizes liberation from evil and darkness.</Text>
                    
                    <Text style={styles.subHeading}>3. Goddess Lakshmi (Western India)</Text>
                    <Text style={styles.bulletPoint}>• Diwali is also celebrated as the day Goddess Lakshmi emerged during the Samudra Manthan (churning of the ocean).</Text>
                    <Text style={styles.bulletPoint}>• Considered the festival of wealth, prosperity, and fortune.</Text>
                    
                    <Text style={styles.subHeading}>4. Lord Mahavira (Jainism)</Text>
                    <Text style={styles.bulletPoint}>• Jains celebrate Diwali as the day Lord Mahavira attained Nirvana (moksha).</Text>
                    
                    <Text style={styles.subHeading}>5. Guru Hargobind Ji (Sikhism)</Text>
                    <Text style={styles.bulletPoint}>• Sikhs celebrate Bandi Chhor Divas on Diwali, marking the day Guru Hargobind Ji was released from prison with 52 kings.</Text>
                    
                    <Text style={styles.subHeading}>📅 When is Diwali Celebrated?</Text>
                    <Text style={styles.bulletPoint}>• Falls on the Amavasya (new moon) of Kartik month (October–November).</Text>
                    <Text style={styles.bulletPoint}>• Usually celebrated over five days.</Text>
                    
                    <Text style={styles.subHeading}>🗓️ Five Days of Diwali</Text>
                    <Text style={styles.subHeading}>1. Day 1 – Dhanteras</Text>
                    <Text style={styles.bulletPoint}>• Dedicated to Dhanvantari, the god of health, and Lakshmi, the goddess of wealth.</Text>
                    <Text style={styles.bulletPoint}>• People buy gold, silver, and utensils for good luck.</Text>
                    
                    <Text style={styles.subHeading}>2. Day 2 – Naraka Chaturdashi / Choti Diwali</Text>
                    <Text style={styles.bulletPoint}>• Marks Krishna's victory over Narakasura.</Text>
                    <Text style={styles.bulletPoint}>• People light diyas and burst small crackers.</Text>
                    
                    <Text style={styles.subHeading}>3. Day 3 – Lakshmi Puja (Main Diwali Day)</Text>
                    <Text style={styles.bulletPoint}>• The most important day.</Text>
                    <Text style={styles.bulletPoint}>• Families clean and decorate homes, light diyas, draw rangolis, and worship Goddess Lakshmi for wealth and prosperity.</Text>
                    <Text style={styles.bulletPoint}>• Fireworks symbolize the joy of victory.</Text>
                    
                    <Text style={styles.subHeading}>4. Day 4 – Govardhan Puja / Annakut</Text>
                    <Text style={styles.bulletPoint}>• Celebrates Krishna lifting Govardhan Hill to protect people from rain.</Text>
                    <Text style={styles.bulletPoint}>• Devotees prepare a large variety of food as an offering (Annakut).</Text>
                    
                    <Text style={styles.subHeading}>5. Day 5 – Bhai Dooj</Text>
                    <Text style={styles.bulletPoint}>• Celebrates the bond between brothers and sisters.</Text>
                    <Text style={styles.bulletPoint}>• Sisters pray for their brothers' long life and happiness.</Text>
                    
                    <Text style={styles.subHeading}>🎉 How Diwali is Celebrated</Text>
                    <Text style={styles.bulletPoint}>• Cleaning & Decoration: Homes are cleaned, renovated, and decorated with lights, diyas, and rangolis.</Text>
                    <Text style={styles.bulletPoint}>• Lakshmi Puja: People perform puja for wealth and prosperity.</Text>
                    <Text style={styles.bulletPoint}>• Exchanging Gifts & Sweets: Families and friends exchange gifts, sweets, and dry fruits.</Text>
                    <Text style={styles.bulletPoint}>• Fireworks & Crackers: Symbolize joy and festivity (though eco-friendly alternatives are encouraged).</Text>
                    <Text style={styles.bulletPoint}>• Festive Feasts: Delicious food, sweets (like laddus, barfis), and snacks are prepared.</Text>
                    
                    <Text style={styles.subHeading}>🌏 Regional Variations</Text>
                    <Text style={styles.bulletPoint}>• North India: Focuses on Lord Rama's return; homes lit with lamps.</Text>
                    <Text style={styles.bulletPoint}>• South India: Emphasis on Krishna's victory over Narakasura.</Text>
                    <Text style={styles.bulletPoint}>• West India (Gujarat, Maharashtra): Strongly associated with Goddess Lakshmi and business prosperity.</Text>
                    <Text style={styles.bulletPoint}>• East India (Bengal, Odisha, Assam): Celebrated as Kali Puja, worshipping Goddess Kali.</Text>
                    
                    <Text style={styles.subHeading}>🌼 Cultural & Social Importance</Text>
                    <Text style={styles.bulletPoint}>• Brings families together.</Text>
                    <Text style={styles.bulletPoint}>• Strengthens community bonds through gatherings, fairs, and markets.</Text>
                    <Text style={styles.bulletPoint}>• Marks the Hindu New Year in some regions (especially Gujarat).</Text>
                    <Text style={styles.bulletPoint}>• Promotes values of sharing, unity, and gratitude.</Text>
                    
                    <Text style={styles.subHeading}>🌍 Global Celebration</Text>
                    <Text style={styles.bulletPoint}>• Celebrated by Hindus, Sikhs, Jains, and Buddhists worldwide.</Text>
                    <Text style={styles.bulletPoint}>• Recognized in countries like Nepal, Sri Lanka, Malaysia, Singapore, Fiji, Mauritius, Trinidad & Tobago, UK, USA, Canada, Australia.</Text>
                    <Text style={styles.bulletPoint}>• Many governments officially recognize it as a cultural festival.</Text>
                    
                    <Text style={styles.subHeading}>✨ Symbolism</Text>
                    <Text style={styles.bulletPoint}>• Light: Knowledge, wisdom, truth.</Text>
                    <Text style={styles.bulletPoint}>• Diyas: Destroy ignorance and invite positivity.</Text>
                    <Text style={styles.bulletPoint}>• Lakshmi: Wealth & prosperity.</Text>
                    <Text style={styles.bulletPoint}>• Rangoli: Welcoming auspiciousness and happiness.</Text>
                    
                    <Text style={styles.conclusion}>✅ In essence, Diwali is not just a festival of lights, but of joy, hope, family bonding, and spiritual renewal.</Text>
                  </View>
                ) : (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🌟 दीपावली त्योहार (दीपावली)</Text>
                    
                    <Text style={styles.subHeading}>🪔 दीपावली का अर्थ</Text>
                    <Text style={styles.bulletPoint}>• "दीपावली" शब्द संस्कृत से आया है: दीप (दीपक, प्रकाश) + आवली (पंक्ति, श्रृंखला), जिसका अर्थ है "दीपों की पंक्ति।"</Text>
                    <Text style={styles.bulletPoint}>• अंधकार पर प्रकाश, बुराई पर अच्छाई, और अज्ञान पर ज्ञान की विजय का प्रतीक है।</Text>
                    
                    <Text style={styles.subHeading}>📖 पौराणिक महत्व</Text>
                    <Text style={styles.paragraph}>दीपावली भारत भर में विभिन्न किंवदंतियों से जुड़ी है:</Text>
                    
                    <Text style={styles.subHeading}>1. भगवान राम की वापसी (उत्तर भारत)</Text>
                    <Text style={styles.bulletPoint}>• 14 वर्ष के वनवास के बाद सीता और लक्ष्मण के साथ अयोध्या लौटने और रावण पर विजय का जश्न मनाता है।</Text>
                    <Text style={styles.bulletPoint}>• लोगों ने उनका स्वागत करने के लिए दीप जलाए, जो परंपरा बन गई।</Text>
                    
                    <Text style={styles.subHeading}>2. भगवान कृष्ण और नरकासुर (दक्षिण भारत)</Text>
                    <Text style={styles.bulletPoint}>• भगवान कृष्ण की नरकासुर, एक राक्षस राजा पर विजय का प्रतीक है।</Text>
                    <Text style={styles.bulletPoint}>• बुराई और अंधकार से मुक्ति का प्रतीक है।</Text>
                    
                    <Text style={styles.subHeading}>3. देवी लक्ष्मी (पश्चिमी भारत)</Text>
                    <Text style={styles.bulletPoint}>• दीपावली को समुद्र मंथन के दौरान देवी लक्ष्मी के प्रकट होने के दिन के रूप में भी मनाया जाता है।</Text>
                    <Text style={styles.bulletPoint}>• धन, समृद्धि और सौभाग्य का त्योहार माना जाता है।</Text>
                    
                    <Text style={styles.subHeading}>4. भगवान महावीर (जैन धर्म)</Text>
                    <Text style={styles.bulletPoint}>• जैन दीपावली को भगवान महावीर के निर्वाण (मोक्ष) प्राप्त करने के दिन के रूप में मनाते हैं।</Text>
                    
                    <Text style={styles.subHeading}>5. गुरु हरगोबिंद जी (सिख धर्म)</Text>
                    <Text style={styles.bulletPoint}>• सिख दीपावली पर बंदी छोड़ दिवस मनाते हैं, जो गुरु हरगोबिंद जी के 52 राजाओं के साथ जेल से मुक्त होने का दिन है।</Text>
                    
                    <Text style={styles.subHeading}>📅 दीपावली कब मनाई जाती है?</Text>
                    <Text style={styles.bulletPoint}>• कार्तिक मास (अक्टूबर-नवंबर) की अमावस्या (नई चांद) पर पड़ती है।</Text>
                    <Text style={styles.bulletPoint}>• आमतौर पर पांच दिनों तक मनाई जाती है।</Text>
                    
                    <Text style={styles.subHeading}>🗓️ दीपावली के पांच दिन</Text>
                    <Text style={styles.subHeading}>1. दिन 1 – धनतेरस</Text>
                    <Text style={styles.bulletPoint}>• स्वास्थ्य के देवता धन्वंतरी और धन की देवी लक्ष्मी को समर्पित।</Text>
                    <Text style={styles.bulletPoint}>• लोग शुभकामना के लिए सोना, चांदी और बर्तन खरीदते हैं।</Text>
                    
                    <Text style={styles.subHeading}>2. दिन 2 – नरक चतुर्दशी / छोटी दीपावली</Text>
                    <Text style={styles.bulletPoint}>• कृष्ण की नरकासुर पर विजय का प्रतीक।</Text>
                    <Text style={styles.bulletPoint}>• लोग दीप जलाते हैं और छोटे पटाखे फोड़ते हैं।</Text>
                    
                    <Text style={styles.subHeading}>3. दिन 3 – लक्ष्मी पूजा (मुख्य दीपावली दिवस)</Text>
                    <Text style={styles.bulletPoint}>• सबसे महत्वपूर्ण दिन।</Text>
                    <Text style={styles.bulletPoint}>• परिवार घरों को साफ और सजाते हैं, दीप जलाते हैं, रंगोली बनाते हैं, और धन और समृद्धि के लिए देवी लक्ष्मी की पूजा करते हैं।</Text>
                    <Text style={styles.bulletPoint}>• आतिशबाजी विजय की खुशी का प्रतीक है।</Text>
                    
                    <Text style={styles.subHeading}>4. दिन 4 – गोवर्धन पूजा / अन्नकूट</Text>
                    <Text style={styles.bulletPoint}>• बारिश से लोगों की रक्षा के लिए कृष्ण द्वारा गोवर्धन पर्वत उठाने का जश्न।</Text>
                    <Text style={styles.bulletPoint}>• भक्त भेंट के रूप में भोजन की विभिन्न किस्में तैयार करते हैं (अन्नकूट)।</Text>
                    
                    <Text style={styles.subHeading}>5. दिन 5 – भाई दूज</Text>
                    <Text style={styles.bulletPoint}>• भाइयों और बहनों के बीच बंधन का जश्न।</Text>
                    <Text style={styles.bulletPoint}>• बहनें अपने भाइयों की लंबी उम्र और खुशी के लिए प्रार्थना करती हैं।</Text>
                    
                    <Text style={styles.subHeading}>🎉 दीपावली कैसे मनाई जाती है</Text>
                    <Text style={styles.bulletPoint}>• सफाई और सजावट: घरों को साफ किया जाता है, नवीनीकरण किया जाता है, और रोशनी, दीप और रंगोली से सजाया जाता है।</Text>
                    <Text style={styles.bulletPoint}>• लक्ष्मी पूजा: लोग धन और समृद्धि के लिए पूजा करते हैं।</Text>
                    <Text style={styles.bulletPoint}>• उपहार और मिठाई का आदान-प्रदान: परिवार और दोस्त उपहार, मिठाई और सूखे मेवे का आदान-प्रदान करते हैं।</Text>
                    <Text style={styles.bulletPoint}>• आतिशबाजी और पटाखे: खुशी और उत्सव का प्रतीक (हालांकि पर्यावरण के अनुकूल विकल्पों को प्रोत्साहित किया जाता है)।</Text>
                    <Text style={styles.bulletPoint}>• त्योहारी भोज: स्वादिष्ट भोजन, मिठाई (जैसे लड्डू, बर्फी) और नाश्ता तैयार किया जाता है।</Text>
                    
                    <Text style={styles.subHeading}>🌏 क्षेत्रीय विविधताएं</Text>
                    <Text style={styles.bulletPoint}>• उत्तर भारत: भगवान राम की वापसी पर ध्यान केंद्रित; दीपों से जगमगाते घर।</Text>
                    <Text style={styles.bulletPoint}>• दक्षिण भारत: नरकासुर पर कृष्ण की विजय पर जोर।</Text>
                    <Text style={styles.bulletPoint}>• पश्चिमी भारत (गुजरात, महाराष्ट्र): देवी लक्ष्मी और व्यावसायिक समृद्धि से दृढ़ता से जुड़ा।</Text>
                    <Text style={styles.bulletPoint}>• पूर्वी भारत (बंगाल, ओडिशा, असम): काली पूजा के रूप में मनाया जाता है, देवी काली की पूजा।</Text>
                    
                    <Text style={styles.subHeading}>🌼 सांस्कृतिक और सामाजिक महत्व</Text>
                    <Text style={styles.bulletPoint}>• परिवारों को एक साथ लाता है।</Text>
                    <Text style={styles.bulletPoint}>• सभाओं, मेलों और बाजारों के माध्यम से सामुदायिक बंधन को मजबूत करता है।</Text>
                    <Text style={styles.bulletPoint}>• कुछ क्षेत्रों में हिंदू नव वर्ष का प्रतीक (विशेष रूप से गुजरात)।</Text>
                    <Text style={styles.bulletPoint}>• साझा करने, एकता और कृतज्ञता के मूल्यों को बढ़ावा देता है।</Text>
                    
                    <Text style={styles.subHeading}>🌍 वैश्विक उत्सव</Text>
                    <Text style={styles.bulletPoint}>• दुनिया भर में हिंदुओं, सिखों, जैनों और बौद्धों द्वारा मनाया जाता है।</Text>
                    <Text style={styles.bulletPoint}>• नेपाल, श्रीलंका, मलेशिया, सिंगापुर, फिजी, मॉरीशस, त्रिनिदाद और टोबैगो, यूके, यूएसए, कनाडा, ऑस्ट्रेलिया जैसे देशों में मान्यता प्राप्त।</Text>
                    <Text style={styles.bulletPoint}>• कई सरकारें इसे आधिकारिक तौर पर सांस्कृतिक त्योहार के रूप में मान्यता देती हैं।</Text>
                    
                    <Text style={styles.subHeading}>✨ प्रतीकवाद</Text>
                    <Text style={styles.bulletPoint}>• प्रकाश: ज्ञान, बुद्धि, सच्चाई।</Text>
                    <Text style={styles.bulletPoint}>• दीप: अज्ञान को नष्ट करें और सकारात्मकता को आमंत्रित करें।</Text>
                    <Text style={styles.bulletPoint}>• लक्ष्मी: धन और समृद्धि।</Text>
                    <Text style={styles.bulletPoint}>• रंगोली: शुभता और खुशी का स्वागत।</Text>
                    
                    <Text style={styles.conclusion}>✅ संक्षेप में, दीपावली सिर्फ प्रकाश का त्योहार नहीं है, बल्कि खुशी, आशा, पारिवारिक बंधन और आध्यात्मिक नवीनीकरण का त्योहार है।</Text>
                  </View>
                )}
              </View>
            )}

            {/* 5 Days of Diwali Tab */}
            {selectedTab === 1 && (
              <View style={styles.tabContent}>
                {!isHindi ? (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🪔 Five Days of Diwali</Text>
                    
                    <Text style={styles.subHeading}>Dhanteras (Day 1)</Text>
                    <Text style={styles.bulletPoint}>• Meaning: "Dhan" = wealth, "Teras" = 13th day of Kartik month.</Text>
                    <Text style={styles.bulletPoint}>• Significance: Dedicated to Lord Dhanvantari (god of Ayurveda and health) and Goddess Lakshmi.</Text>
                    <Text style={styles.bulletPoint}>• Traditions:</Text>
                    <Text style={styles.bulletPoint}>  - People buy gold, silver, or new utensils — believed to bring prosperity.</Text>
                    <Text style={styles.bulletPoint}>  - Homes are cleaned and decorated to welcome Lakshmi.</Text>
                    <Text style={styles.bulletPoint}>  - Diyas are lit in the evening to ward off evil spirits.</Text>
                    <Text style={styles.bulletPoint}>• Modern practice: Also marks the start of Diwali shopping and new business account books in some communities.</Text>
                    
                    <Text style={styles.subHeading}>Naraka Chaturdashi / Choti Diwali (Day 2)</Text>
                    <Text style={styles.bulletPoint}>• Meaning: Commemorates Lord Krishna's victory over Narakasura, symbolizing triumph of good over evil.</Text>
                    <Text style={styles.bulletPoint}>• Significance: People believe bathing with oil and herbal pastes on this day cleanses them of sins.</Text>
                    <Text style={styles.bulletPoint}>• Traditions:</Text>
                    <Text style={styles.bulletPoint}>  - Early morning Abhyanga Snan (ritual bath with oil and ubtan).</Text>
                    <Text style={styles.bulletPoint}>  - Lighting diyas to banish darkness.</Text>
                    <Text style={styles.bulletPoint}>  - In some regions, people burst a few firecrackers.</Text>
                    <Text style={styles.bulletPoint}>• Regional variation: In South India, this is considered the main Diwali day.</Text>
                    
                    <Text style={styles.subHeading}>Lakshmi Puja / Main Diwali (Day 3)</Text>
                    <Text style={styles.bulletPoint}>• The most important day of the festival.</Text>
                    <Text style={styles.bulletPoint}>• Significance: Worship of Goddess Lakshmi (wealth and prosperity), Lord Ganesha (remover of obstacles), and Kuber (god of riches).</Text>
                    <Text style={styles.bulletPoint}>• Traditions:</Text>
                    <Text style={styles.bulletPoint}>  - Houses decorated with rangoli, flowers, and lit diyas.</Text>
                    <Text style={styles.bulletPoint}>  - Lakshmi Puja performed in the evening with family.</Text>
                    <Text style={styles.bulletPoint}>  - Fireworks and crackers after puja.</Text>
                    <Text style={styles.bulletPoint}>  - Exchanging sweets and gifts with relatives and friends.</Text>
                    <Text style={styles.bulletPoint}>• Business communities often start their new financial year on this day.</Text>
                    
                    <Text style={styles.subHeading}>Govardhan Puja / Annakut (Day 4)</Text>
                    <Text style={styles.bulletPoint}>• Significance: Marks Lord Krishna lifting Govardhan Hill to protect villagers from torrential rains sent by Indra.</Text>
                    <Text style={styles.bulletPoint}>• Traditions:</Text>
                    <Text style={styles.bulletPoint}>  - Preparing Annakut (mountain of food) as offerings to Krishna.</Text>
                    <Text style={styles.bulletPoint}>  - Devotees arrange a variety of vegetarian dishes in temples.</Text>
                    <Text style={styles.bulletPoint}>  - In North India, people create Govardhan hill replicas with cow dung, decorating with flowers and food.</Text>
                    <Text style={styles.bulletPoint}>• Regional variation: In Gujarat, this day is celebrated as New Year (Bestu Varas).</Text>
                    
                    <Text style={styles.subHeading}>Bhai Dooj (Day 5)</Text>
                    <Text style={styles.bulletPoint}>• Meaning: Celebrates the bond between brothers and sisters (similar to Raksha Bandhan).</Text>
                    <Text style={styles.bulletPoint}>• Legend: Yama (god of death) visited his sister Yamuna, who applied tilak on his forehead, prayed for his long life, and offered food.</Text>
                    <Text style={styles.bulletPoint}>• Traditions:</Text>
                    <Text style={styles.bulletPoint}>  - Sisters invite brothers for a meal, apply tilak on their forehead, and pray for their well-being.</Text>
                    <Text style={styles.bulletPoint}>  - Brothers give gifts in return and vow to protect their sisters.</Text>
                    <Text style={styles.bulletPoint}>• Symbolism: Strengthening family ties and sibling love.</Text>
                    
                    <Text style={styles.conclusion}>✅ So, Diwali isn't just one day, but a five-day journey of rituals — beginning with wealth and health, moving through cleansing, worship, and prosperity, and ending with love and family bonds.</Text>
                  </View>
                ) : (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🪔 दीपावली के पांच दिन</Text>
                    
                    <Text style={styles.subHeading}>धनतेरस (दिन 1)</Text>
                    <Text style={styles.bulletPoint}>• अर्थ: "धन" = संपत्ति, "तेरस" = कार्तिक मास का 13वां दिन।</Text>
                    <Text style={styles.bulletPoint}>• महत्व: आयुर्वेद और स्वास्थ्य के देवता भगवान धन्वंतरी और देवी लक्ष्मी को समर्पित।</Text>
                    <Text style={styles.bulletPoint}>• परंपराएं:</Text>
                    <Text style={styles.bulletPoint}>  - लोग सोना, चांदी या नए बर्तन खरीदते हैं — माना जाता है कि यह समृद्धि लाता है।</Text>
                    <Text style={styles.bulletPoint}>  - लक्ष्मी का स्वागत करने के लिए घरों को साफ और सजाया जाता है।</Text>
                    <Text style={styles.bulletPoint}>  - शाम को दीप जलाए जाते हैं ताकि बुरी आत्माओं को दूर किया जा सके।</Text>
                    <Text style={styles.bulletPoint}>• आधुनिक प्रथा: कुछ समुदायों में दीपावली की खरीदारी और नई व्यावसायिक खाता पुस्तकों की शुरुआत का भी प्रतीक है।</Text>
                    
                    <Text style={styles.subHeading}>नरक चतुर्दशी / छोटी दीपावली (दिन 2)</Text>
                    <Text style={styles.bulletPoint}>• अर्थ: भगवान कृष्ण की नरकासुर पर विजय का स्मरण, जो अच्छाई की बुराई पर विजय का प्रतीक है।</Text>
                    <Text style={styles.bulletPoint}>• महत्व: लोग मानते हैं कि इस दिन तेल और जड़ी-बूटियों के साथ स्नान करने से उनके पाप धुल जाते हैं।</Text>
                    <Text style={styles.bulletPoint}>• परंपराएं:</Text>
                    <Text style={styles.bulletPoint}>  - सुबह जल्दी अभ्यंग स्नान (तेल और उबटन के साथ अनुष्ठानिक स्नान)।</Text>
                    <Text style={styles.bulletPoint}>  - अंधकार को दूर करने के लिए दीप जलाना।</Text>
                    <Text style={styles.bulletPoint}>  - कुछ क्षेत्रों में, लोग कुछ पटाखे फोड़ते हैं।</Text>
                    <Text style={styles.bulletPoint}>• क्षेत्रीय भिन्नता: दक्षिण भारत में, इसे मुख्य दीपावली दिवस माना जाता है।</Text>
                    
                    <Text style={styles.subHeading}>लक्ष्मी पूजा / मुख्य दीपावली (दिन 3)</Text>
                    <Text style={styles.bulletPoint}>• त्योहार का सबसे महत्वपूर्ण दिन।</Text>
                    <Text style={styles.bulletPoint}>• महत्व: देवी लक्ष्मी (धन और समृद्धि), भगवान गणेश (बाधाओं को दूर करने वाले), और कुबेर (धन के देवता) की पूजा।</Text>
                    <Text style={styles.bulletPoint}>• परंपराएं:</Text>
                    <Text style={styles.bulletPoint}>  - रंगोली, फूलों और जलते दीपों से घरों को सजाया जाता है।</Text>
                    <Text style={styles.bulletPoint}>  - शाम को परिवार के साथ लक्ष्मी पूजा की जाती है।</Text>
                    <Text style={styles.bulletPoint}>  - पूजा के बाद आतिशबाजी और पटाखे।</Text>
                    <Text style={styles.bulletPoint}>  - रिश्तेदारों और दोस्तों के साथ मिठाई और उपहारों का आदान-प्रदान।</Text>
                    <Text style={styles.bulletPoint}>• व्यावसायिक समुदाय अक्सर इस दिन अपना नया वित्तीय वर्ष शुरू करते हैं।</Text>
                    
                    <Text style={styles.subHeading}>गोवर्धन पूजा / अन्नकूट (दिन 4)</Text>
                    <Text style={styles.bulletPoint}>• महत्व: भगवान कृष्ण द्वारा इंद्र द्वारा भेजी गई मूसलाधार बारिश से ग्रामीणों की रक्षा के लिए गोवर्धन पर्वत उठाने का प्रतीक।</Text>
                    <Text style={styles.bulletPoint}>• परंपराएं:</Text>
                    <Text style={styles.bulletPoint}>  - कृष्ण को भेंट के रूप में अन्नकूट (भोजन का पहाड़) तैयार करना।</Text>
                    <Text style={styles.bulletPoint}>  - भक्त मंदिरों में शाकाहारी व्यंजनों की विविधता व्यवस्थित करते हैं।</Text>
                    <Text style={styles.bulletPoint}>  - उत्तर भारत में, लोग गोबर से गोवर्धन पहाड़ की प्रतिकृतियां बनाते हैं, फूलों और भोजन से सजाते हैं।</Text>
                    <Text style={styles.bulletPoint}>• क्षेत्रीय भिन्नता: गुजरात में, इस दिन को नया साल (बेस्टु वरस) के रूप में मनाया जाता है।</Text>
                    
                    <Text style={styles.subHeading}>भाई दूज (दिन 5)</Text>
                    <Text style={styles.bulletPoint}>• अर्थ: भाइयों और बहनों के बीच बंधन का जश्न (रक्षा बंधन के समान)।</Text>
                    <Text style={styles.bulletPoint}>• कथा: यम (मृत्यु के देवता) ने अपनी बहन यमुना का दौरा किया, जिन्होंने उनके माथे पर तिलक लगाया, उनकी लंबी उम्र के लिए प्रार्थना की, और भोजन परोसा।</Text>
                    <Text style={styles.bulletPoint}>• परंपराएं:</Text>
                    <Text style={styles.bulletPoint}>  - बहनें भाइयों को भोजन के लिए आमंत्रित करती हैं, उनके माथे पर तिलक लगाती हैं, और उनकी भलाई के लिए प्रार्थना करती हैं।</Text>
                    <Text style={styles.bulletPoint}>  - भाई बदले में उपहार देते हैं और अपनी बहनों की रक्षा करने की कसम खाते हैं।</Text>
                    <Text style={styles.bulletPoint}>• प्रतीकवाद: पारिवारिक बंधन और भाई-बहन के प्रेम को मजबूत करना।</Text>
                    
                    <Text style={styles.conclusion}>✅ तो, दीपावली सिर्फ एक दिन नहीं है, बल्कि अनुष्ठानों की पांच-दिवसीय यात्रा है — धन और स्वास्थ्य से शुरू होकर, शुद्धि, पूजा और समृद्धि से गुजरते हुए, और प्रेम और पारिवारिक बंधनों के साथ समाप्त होती है।</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Puja method - Dhanteras Tab */}
            {selectedTab === 2 && (
              <View style={styles.tabContent}>
                {/* Dhanteras Puja Method Image */}
                <Image
                  source={isHindi 
                    ? require('../../assets/images/fastsAndFestivals/DhanterasChecklist_Hindi.jpg')
                    : require('../../assets/images/fastsAndFestivals/DhanterasChecklist_Eng.jpg')
                  }
                  style={styles.infoImage}
                  resizeMode="cover"
                  onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
                
                {/* Dhanteras Puja Method Text */}
                {!isHindi ? (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>📅 Date & Timings (2025)</Text>
                    <Text style={styles.bulletPoint}>• Dhanteras Date: Tuesday, 21 October 2025</Text>
                    <Text style={styles.bulletPoint}>• Pradosh Kaal Muhurat: 06:57 PM – 08:41 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>• Vrishabha Kaal: 07:07 PM – 09:03 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>  👉 Perform Lakshmi Puja during Pradosh Kaal for best results.</Text>
                    
                    <Text style={styles.subHeading}>🧭 Directions</Text>
                    <Text style={styles.bulletPoint}>• Sit facing East or North.</Text>
                    <Text style={styles.bulletPoint}>• Place idols so that Lakshmi is in the center, Ganesha on her left, Kuber/Dhanvantari on her right.</Text>
                    <Text style={styles.bulletPoint}>• Place a south-facing diya at the main entrance (for Yamraj).</Text>
                    
                    <Text style={styles.subHeading}>📜 Puja Samagri (Required Items)</Text>
                    <Text style={styles.bulletPoint}>• Idols/Images: Lakshmi, Ganesha, Dhanvantari (and Kuber, optional)</Text>
                    <Text style={styles.bulletPoint}>• Kalash with water, mango leaves, coconut</Text>
                    <Text style={styles.bulletPoint}>• Cloths: Red/yellow puja cloth</Text>
                    <Text style={styles.bulletPoint}>• Puja items: Kumkum, haldi, akshat (rice), chandan, betel leaves & nuts</Text>
                    <Text style={styles.bulletPoint}>• Offerings: Flowers, garlands, sweets (ladoos, kheel-batashe), fruits, dry fruits, Panchamrit</Text>
                    <Text style={styles.bulletPoint}>• Lighting: Clay diyas, ghee/oil, cotton wicks, camphor, incense sticks, dhoop</Text>
                    <Text style={styles.bulletPoint}>• New items: Gold/silver coins, ornaments, or utensils bought on Dhanteras</Text>
                    <Text style={styles.bulletPoint}>• Aarti thali with bell and conch</Text>
                    
                    <Text style={styles.subHeading}>🙏 Step-by-Step Puja Vidhi</Text>
                    <Text style={styles.bulletPoint}>1. Shuddhi (Purification) – Clean house & entrance, make rangoli.</Text>
                    <Text style={styles.bulletPoint}>2. Kalash Sthapana – Place water-filled kalash with mango leaves & coconut.</Text>
                    <Text style={styles.bulletPoint}>3. Ganesh Puja – Begin with Ganesh mantra: "Om Gan Ganapataye Namah"</Text>
                    <Text style={styles.bulletPoint}>4. Lakshmi & Dhanvantari Puja – Offer flowers, kumkum, rice, coins, ornaments.</Text>
                    <Text style={styles.bulletPoint}>   • Lakshmi Mantra: "Om Shreem Mahalakshmyai Namah"</Text>
                    <Text style={styles.bulletPoint}>   • Dhanvantari Mantra: "Om Namo Bhagavate Vasudevaya Dhanvantaraye…"</Text>
                    <Text style={styles.bulletPoint}>5. Naivedya – Offer sweets, fruits, Panchamrit.</Text>
                    <Text style={styles.bulletPoint}>6. Kuber Puja (Optional) – Pray for prosperity.</Text>
                    <Text style={styles.bulletPoint}>7. Aarti & Diyas – Perform Lakshmi-Ganesh aarti, light 13 diyas, and place one diya at Tulsi plant & one at main door (south-facing).</Text>
                    
                    <Text style={styles.subHeading}>💰 Buying Gold/Silver on Dhanteras</Text>
                    <Text style={styles.bulletPoint}>• Considered highly auspicious – symbolizes everlasting wealth & prosperity.</Text>
                    <Text style={styles.bulletPoint}>• Items usually purchased:</Text>
                    <Text style={styles.bulletPoint}>  • Gold or silver coins (often engraved with Goddess Lakshmi & Lord Ganesha).</Text>
                    <Text style={styles.bulletPoint}>  • Jewelry (rings, bangles, chains).</Text>
                    <Text style={styles.bulletPoint}>  • Silver utensils (kalash, thali, diya).</Text>
                    <Text style={styles.bulletPoint}>• Belief: New purchases invite Mata Lakshmi's blessings and bring prosperity into the household.</Text>
                    <Text style={styles.bulletPoint}>• If gold/silver is too costly, buying steel, copper, or brass utensils is equally auspicious.</Text>
                    <Text style={styles.bulletPoint}>• Many families also place the newly bought item on the puja altar for blessings before use.</Text>
                  </View>
                ) : (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>📅 तिथि और समय (2025)</Text>
                    <Text style={styles.bulletPoint}>• धनतेरस की तिथि: मंगलवार, 21 अक्टूबर 2025</Text>
                    <Text style={styles.bulletPoint}>• प्रदोष काल मुहूर्त: 06:57 PM – 08:41 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>• वृषभ काल: 07:07 PM – 09:03 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>  👉 सर्वोत्तम परिणामों के लिए प्रदोष काल के दौरान लक्ष्मी पूजा करें।</Text>
                    
                    <Text style={styles.subHeading}>🧭 दिशाएं</Text>
                    <Text style={styles.bulletPoint}>• पूर्व या उत्तर की ओर मुख करके बैठें।</Text>
                    <Text style={styles.bulletPoint}>• मूर्तियों को इस तरह रखें कि लक्ष्मी केंद्र में, गणेश उनके बाएं, कुबेर/धन्वंतरी उनके दाएं हों।</Text>
                    <Text style={styles.bulletPoint}>• मुख्य द्वार पर दक्षिण की ओर मुख वाला दीपक रखें (यमराज के लिए)।</Text>
                    
                    <Text style={styles.subHeading}>📜 पूजा सामग्री (आवश्यक वस्तुएं)</Text>
                    <Text style={styles.bulletPoint}>• मूर्तियां/चित्र: लक्ष्मी, गणेश, धन्वंतरी (और कुबेर, वैकल्पिक)</Text>
                    <Text style={styles.bulletPoint}>• पानी, आम के पत्ते, नारियल के साथ कलश</Text>
                    <Text style={styles.bulletPoint}>• कपड़े: लाल/पीला पूजा कपड़ा</Text>
                    <Text style={styles.bulletPoint}>• पूजा की वस्तुएं: कुमकुम, हल्दी, अक्षत (चावल), चंदन, पान के पत्ते और सुपारी</Text>
                    <Text style={styles.bulletPoint}>• भेंट: फूल, मालाएं, मिठाई (लड्डू, खील-बताशे), फल, सूखे मेवे, पंचामृत</Text>
                    <Text style={styles.bulletPoint}>• प्रकाश: मिट्टी के दीपक, घी/तेल, रूई की बत्ती, कपूर, अगरबत्ती, धूप</Text>
                    <Text style={styles.bulletPoint}>• नई वस्तुएं: धनतेरस पर खरीदे गए सोने/चांदी के सिक्के, आभूषण या बर्तन</Text>
                    <Text style={styles.bulletPoint}>• घंटी और शंख के साथ आरती थाली</Text>
                    
                    <Text style={styles.subHeading}>🙏 चरणबद्ध पूजा विधि</Text>
                    <Text style={styles.bulletPoint}>1. शुद्धि (शुद्धिकरण) – घर और प्रवेश द्वार साफ करें, रंगोली बनाएं।</Text>
                    <Text style={styles.bulletPoint}>2. कलश स्थापना – आम के पत्तों और नारियल के साथ पानी से भरा कलश रखें।</Text>
                    <Text style={styles.bulletPoint}>3. गणेश पूजा – गणेश मंत्र से शुरू करें: "ओम गं गणपतये नमः"</Text>
                    <Text style={styles.bulletPoint}>4. लक्ष्मी और धन्वंतरी पूजा – फूल, कुमकुम, चावल, सिक्के, आभूषण अर्पित करें।</Text>
                    <Text style={styles.bulletPoint}>   • लक्ष्मी मंत्र: "ओम श्रीम महालक्ष्म्यै नमः"</Text>
                    <Text style={styles.bulletPoint}>   • धन्वंतरी मंत्र: "ओम नमो भगवते वासुदेवाय धन्वंतराय…"</Text>
                    <Text style={styles.bulletPoint}>5. नैवेद्य – मिठाई, फल, पंचामृत अर्पित करें।</Text>
                    <Text style={styles.bulletPoint}>6. कुबेर पूजा (वैकल्पिक) – समृद्धि के लिए प्रार्थना करें।</Text>
                    <Text style={styles.bulletPoint}>7. आरती और दीपक – लक्ष्मी-गणेश आरती करें, 13 दीपक जलाएं, और एक दीपक तुलसी के पौधे पर और एक मुख्य द्वार पर रखें (दक्षिण की ओर मुख वाला)।</Text>
                    
                    <Text style={styles.subHeading}>💰 धनतेरस पर सोना/चांदी खरीदना</Text>
                    <Text style={styles.bulletPoint}>• अत्यधिक शुभ माना जाता है – स्थायी धन और समृद्धि का प्रतीक।</Text>
                    <Text style={styles.bulletPoint}>• आमतौर पर खरीदी जाने वाली वस्तुएं:</Text>
                    <Text style={styles.bulletPoint}>  • सोने या चांदी के सिक्के (अक्सर देवी लक्ष्मी और भगवान गणेश के साथ उत्कीर्ण)।</Text>
                    <Text style={styles.bulletPoint}>  • आभूषण (अंगूठी, चूड़ियां, चेन)।</Text>
                    <Text style={styles.bulletPoint}>  • चांदी के बर्तन (कलश, थाली, दीपक)।</Text>
                    <Text style={styles.bulletPoint}>• मान्यता: नई खरीदारी माता लक्ष्मी के आशीर्वाद को आमंत्रित करती है और घर में समृद्धि लाती है।</Text>
                    <Text style={styles.bulletPoint}>• यदि सोना/चांदी बहुत महंगा है, तो स्टील, तांबा या पीतल के बर्तन खरीदना भी उतना ही शुभ है।</Text>
                    <Text style={styles.bulletPoint}>• कई परिवार उपयोग से पहले आशीर्वाद के लिए नई खरीदी गई वस्तु को पूजा वेदी पर भी रखते हैं।</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Puja method - Chhoti Diwali Tab */}
            {selectedTab === 3 && (
              <View style={styles.tabContent}>
                {/* Chhoti Diwali Puja Method Image */}
                <Image
                  source={isHindi 
                    ? require('../../assets/images/fastsAndFestivals/NarakaChaturthi_Hindi.jpg')
                    : require('../../assets/images/fastsAndFestivals/NarakaChaturthi_Eng.jpg')
                  }
                  style={styles.infoImage}
                  resizeMode="cover"
                  onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
                
                {/* Chhoti Diwali Puja Method Text */}
                {!isHindi ? (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🌸 Naraka Chaturdashi (Chhoti Diwali) – Detailed Guide</Text>
                    
                    <Text style={styles.subHeading}>📅 Date (2025)</Text>
                    <Text style={styles.bulletPoint}>• Wednesday, 22nd October 2025</Text>
                    <Text style={styles.bulletPoint}>• Chaturdashi Tithi starts: 09:59 PM (21st Oct)</Text>
                    <Text style={styles.bulletPoint}>• Chaturdashi Tithi ends: 09:51 PM (22nd Oct)</Text>
                    
                    <Text style={styles.subHeading}>✨ Significance</Text>
                    <Text style={styles.bulletPoint}>• Marks Lord Krishna's victory over Narakasura → triumph of good over evil.</Text>
                    <Text style={styles.bulletPoint}>• Rituals destroy sins, negativity, and misfortune.</Text>
                    <Text style={styles.bulletPoint}>• Abhyang Snan on this day brings health, prosperity, and protection.</Text>
                    
                    <Text style={styles.subHeading}>⏰ Puja & Ritual Timings</Text>
                    <Text style={styles.bulletPoint}>• Abhyang Snan Muhurat: 04:45 AM – 06:15 AM (IST)</Text>
                    <Text style={styles.bulletPoint}>• Chaturdashi Puja Muhurat (Pradosh Kaal): 06:00 PM – 08:30 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>• Diya Lighting (Yamadeep Daan): After Sunset till night</Text>
                    
                    <Text style={styles.subHeading}>🧭 Idol / Diya Direction</Text>
                    <Text style={styles.bulletPoint}>• Lord Krishna idol: Face East</Text>
                    <Text style={styles.bulletPoint}>• Yamadeep Diya: Place in South direction (to ward off untimely death)</Text>
                    <Text style={styles.bulletPoint}>• Tulsi Diya: Place before Tulsi plant, facing East</Text>
                    
                    <Text style={styles.subHeading}>✅ Puja Checklist (Required Items)</Text>
                    <Text style={styles.bulletPoint}>• Idol/photo of Lord Krishna, Goddess Lakshmi, and Yama Raj</Text>
                    <Text style={styles.bulletPoint}>• Kalash with water, mango leaves, coconut</Text>
                    <Text style={styles.bulletPoint}>• Sesame oil & ubtan (for Abhyang Snan)</Text>
                    <Text style={styles.bulletPoint}>• Flowers, incense, dhoop, sandalwood paste</Text>
                    <Text style={styles.bulletPoint}>• Rice, kumkum, haldi, betel leaves, paan, supari</Text>
                    <Text style={styles.bulletPoint}>• Clay diyas (one special diya for Yamadeep, placed South)</Text>
                    <Text style={styles.bulletPoint}>• Prasad: sweets like boondi, kheel, batashe, til laddoo, sugarcane</Text>
                    <Text style={styles.bulletPoint}>• Aarti thali with bell, ghee/oil lamps</Text>
                    
                    <Text style={styles.subHeading}>🪔 Puja Method (Step by Step)</Text>
                    <Text style={styles.bulletPoint}>1. Abhyang Snan</Text>
                    <Text style={styles.bulletPoint}>   • Before sunrise, bathe with sesame oil ubtan for purification.</Text>
                    <Text style={styles.bulletPoint}>2. Sankalp (Resolution)</Text>
                    <Text style={styles.bulletPoint}>   • Take a vow for puja, praying for prosperity, health, and protection.</Text>
                    <Text style={styles.bulletPoint}>3. Kalash Sthapana</Text>
                    <Text style={styles.bulletPoint}>   • Place Kalash with water, mango leaves, and coconut before deities.</Text>
                    <Text style={styles.bulletPoint}>4. Puja of Lord Krishna, Yama, and Lakshmi</Text>
                    <Text style={styles.bulletPoint}>   • Offer flowers, sweets, kumkum, haldi, and diyas.</Text>
                    <Text style={styles.bulletPoint}>   • Recite mantras of Krishna, Lakshmi, and Yama Raj.</Text>
                    <Text style={styles.bulletPoint}>5. Yamadeep Daan</Text>
                    <Text style={styles.bulletPoint}>   • Light diya in South direction after sunset for protection from untimely death.</Text>
                    <Text style={styles.bulletPoint}>6. Aarti & Bhajans</Text>
                    <Text style={styles.bulletPoint}>   • Perform aarti of Lord Krishna, Lakshmi, and Yama Raj.</Text>
                    <Text style={styles.bulletPoint}>   • Sing bhajans and distribute prasad.</Text>
                    
                    <Text style={styles.subHeading}>🌟 Benefits</Text>
                    <Text style={styles.bulletPoint}>• Removes negativity and ill luck</Text>
                    <Text style={styles.bulletPoint}>• Grants long life, health, and prosperity</Text>
                    <Text style={styles.bulletPoint}>• Protects family from untimely death</Text>
                    <Text style={styles.bulletPoint}>• Ensures peace, happiness, and well-being</Text>
                  </View>
                ) : (
                  <View style={styles.textContent}>
                    <Text style={styles.heading}>🌸 नरक चतुर्दशी (छोटी दीपावली) – विस्तृत गाइड</Text>
                    
                    <Text style={styles.subHeading}>📅 तिथि (2025)</Text>
                    <Text style={styles.bulletPoint}>• बुधवार, 22 अक्टूबर 2025</Text>
                    <Text style={styles.bulletPoint}>• चतुर्दशी तिथि शुरू: 09:59 PM (21 अक्टूबर)</Text>
                    <Text style={styles.bulletPoint}>• चतुर्दशी तिथि समाप्त: 09:51 PM (22 अक्टूबर)</Text>
                    
                    <Text style={styles.subHeading}>✨ महत्व</Text>
                    <Text style={styles.bulletPoint}>• भगवान कृष्ण की नरकासुर पर विजय का प्रतीक → अच्छाई की बुराई पर विजय।</Text>
                    <Text style={styles.bulletPoint}>• अनुष्ठान पाप, नकारात्मकता और दुर्भाग्य को नष्ट करते हैं।</Text>
                    <Text style={styles.bulletPoint}>• इस दिन अभ्यंग स्नान स्वास्थ्य, समृद्धि और सुरक्षा लाता है।</Text>
                    
                    <Text style={styles.subHeading}>⏰ पूजा और अनुष्ठान समय</Text>
                    <Text style={styles.bulletPoint}>• अभ्यंग स्नान मुहूर्त: 04:45 AM – 06:15 AM (IST)</Text>
                    <Text style={styles.bulletPoint}>• चतुर्दशी पूजा मुहूर्त (प्रदोष काल): 06:00 PM – 08:30 PM (IST)</Text>
                    <Text style={styles.bulletPoint}>• दीपक जलाना (यमदीप दान): सूर्यास्त के बाद रात तक</Text>
                    
                    <Text style={styles.subHeading}>🧭 मूर्ति / दीपक दिशा</Text>
                    <Text style={styles.bulletPoint}>• भगवान कृष्ण की मूर्ति: पूर्व की ओर मुख</Text>
                    <Text style={styles.bulletPoint}>• यमदीप दीपक: दक्षिण दिशा में रखें (अकाल मृत्यु से बचाव के लिए)</Text>
                    <Text style={styles.bulletPoint}>• तुलसी दीपक: तुलसी के पौधे के सामने, पूर्व की ओर मुख करके रखें</Text>
                    
                    <Text style={styles.subHeading}>✅ पूजा चेकलिस्ट (आवश्यक वस्तुएं)</Text>
                    <Text style={styles.bulletPoint}>• भगवान कृष्ण, देवी लक्ष्मी और यमराज की मूर्ति/फोटो</Text>
                    <Text style={styles.bulletPoint}>• पानी, आम के पत्ते, नारियल के साथ कलश</Text>
                    <Text style={styles.bulletPoint}>• तिल का तेल और उबटन (अभ्यंग स्नान के लिए)</Text>
                    <Text style={styles.bulletPoint}>• फूल, अगरबत्ती, धूप, चंदन का पेस्ट</Text>
                    <Text style={styles.bulletPoint}>• चावल, कुमकुम, हल्दी, पान के पत्ते, पान, सुपारी</Text>
                    <Text style={styles.bulletPoint}>• मिट्टी के दीपक (यमदीप के लिए एक विशेष दीपक, दक्षिण में रखा गया)</Text>
                    <Text style={styles.bulletPoint}>• प्रसाद: बूंदी, खील, बताशे, तिल लड्डू, गन्ना जैसी मिठाई</Text>
                    <Text style={styles.bulletPoint}>• घंटी, घी/तेल के दीपक के साथ आरती थाली</Text>
                    
                    <Text style={styles.subHeading}>🪔 पूजा विधि (चरणबद्ध)</Text>
                    <Text style={styles.bulletPoint}>1. अभ्यंग स्नान</Text>
                    <Text style={styles.bulletPoint}>   • सूर्योदय से पहले, शुद्धिकरण के लिए तिल के तेल उबटन के साथ स्नान करें।</Text>
                    <Text style={styles.bulletPoint}>2. संकल्प (प्रतिज्ञा)</Text>
                    <Text style={styles.bulletPoint}>   • पूजा के लिए प्रतिज्ञा लें, समृद्धि, स्वास्थ्य और सुरक्षा के लिए प्रार्थना करें।</Text>
                    <Text style={styles.bulletPoint}>3. कलश स्थापना</Text>
                    <Text style={styles.bulletPoint}>   • देवताओं के सामने पानी, आम के पत्तों और नारियल के साथ कलश रखें।</Text>
                    <Text style={styles.bulletPoint}>4. भगवान कृष्ण, यम और लक्ष्मी की पूजा</Text>
                    <Text style={styles.bulletPoint}>   • फूल, मिठाई, कुमकुम, हल्दी और दीपक अर्पित करें।</Text>
                    <Text style={styles.bulletPoint}>   • कृष्ण, लक्ष्मी और यमराज के मंत्रों का पाठ करें।</Text>
                    <Text style={styles.bulletPoint}>5. यमदीप दान</Text>
                    <Text style={styles.bulletPoint}>   • अकाल मृत्यु से सुरक्षा के लिए सूर्यास्त के बाद दक्षिण दिशा में दीपक जलाएं।</Text>
                    <Text style={styles.bulletPoint}>6. आरती और भजन</Text>
                    <Text style={styles.bulletPoint}>   • भगवान कृष्ण, लक्ष्मी और यमराज की आरती करें।</Text>
                    <Text style={styles.bulletPoint}>   • भजन गाएं और प्रसाद वितरित करें।</Text>
                    
                    <Text style={styles.subHeading}>🌟 लाभ</Text>
                    <Text style={styles.bulletPoint}>• नकारात्मकता और बुरे भाग्य को दूर करता है</Text>
                    <Text style={styles.bulletPoint}>• लंबी उम्र, स्वास्थ्य और समृद्धि प्रदान करता है</Text>
                    <Text style={styles.bulletPoint}>• परिवार को अकाल मृत्यु से बचाता है</Text>
                    <Text style={styles.bulletPoint}>• शांति, खुशी और कल्याण सुनिश्चित करता है</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Puja method - Diwali Tab */}
            {selectedTab === 4 && (
              <View style={styles.tabContent}>
                <View style={styles.textContent}>
                  <Text style={styles.heading}>
                    {isHindi ? "🪔 दीपावली पूजा विधि - विस्तृत मार्गदर्शन" : "🪔 Diwali Puja Method - Detailed Guide"}
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "📅 तिथि (2025)" : "📅 Date (2025)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi 
                      ? "• **गुरुवार, 23 अक्टूबर 2025**\n• **अमावस्या तिथि** शुरू: 21 अक्टूबर को रात 9:51 बजे\n• **अमावस्या तिथि** समाप्त: 23 अक्टूबर को शाम 7:27 बजे"
                      : "• **Thursday, 23rd October 2025**\n• **Amavasya Tithi** starts: 09:51 PM (22nd Oct)\n• **Amavasya Tithi** ends: 07:27 PM (23rd Oct)"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "✨ महत्व" : "✨ Significance"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• 14 वर्ष के वनवास के बाद **भगवान राम के अयोध्या लौटने** का जश्न मनाता है।\n• **मां लक्ष्मी (धन और समृद्धि की देवी)** को समर्पित।\n• माना जाता है कि **लक्ष्मी घरों में आती हैं** और भक्तों को **धन, खुशी और समृद्धि** का आशीर्वाद देती हैं।\n• दीप जलाने से अंधकार दूर होता है → **अंधकार पर प्रकाश, अज्ञान पर ज्ञान की जीत** का प्रतीक।"
                      : "• Celebrates the **return of Lord Rama to Ayodhya** after 14 years of exile.\n• Dedicated to **Maa Lakshmi (Goddess of Wealth & Prosperity)**.\n• Believed that **Lakshmi visits homes** and blesses devotees with **wealth, happiness, and prosperity**.\n• Lighting lamps removes darkness → symbolizes **victory of light over darkness, knowledge over ignorance**."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "⏰ पूजा और अनुष्ठान समय" : "⏰ Puja & Ritual Timings"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **लक्ष्मी पूजा मुहूर्त**: शाम 5:40 बजे – 7:36 बजे (IST)\n• **प्रदोष काल**: शाम 5:40 बजे – 8:16 बजे\n• **निशित काल (मध्यरात्रि पूजा)**: रात 11:39 बजे – 12:31 बजे"
                      : "• **Lakshmi Puja Muhurat**: 05:40 PM – 07:36 PM (IST)\n• **Pradosh Kaal**: 05:40 PM – 08:16 PM\n• **Nishita Kaal (Midnight Puja)**: 11:39 PM – 12:31 AM"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🧭 मूर्ति / दीया दिशा" : "🧭 Idol / Diya Direction"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **मां लक्ष्मी मूर्ति**: **पूर्व या उत्तर** की ओर मुंह\n• **भगवान गणेश मूर्ति**: **लक्ष्मी के बाएं** रखें\n• **दीये**: घर के चारों ओर, विशेष रूप से **प्रवेश द्वार, खिड़कियां, तुलसी पौधा**\n• **पूर्वजों के लिए विशेष दीया (पितृ दीप)**: दक्षिण दिशा"
                      : "• **Maa Lakshmi idol**: Face **East or North**\n• **Lord Ganesha idol**: Place on **Lakshmi's left**\n• **Diyas**: Place around house, especially **entrances, windows, Tulsi plant**\n• **Special Diya for ancestors (Pitru Deep)**: South direction"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "✅ पूजा चेकलिस्ट (आवश्यक वस्तुएं)" : "✅ Puja Checklist (Required Items)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **लक्ष्मी और गणेश की मूर्तियां/तस्वीरें**\n• **चौकी या लकड़ी का मंच** लाल कपड़े से ढका हुआ\n• पानी, आम के पत्ते, नारियल के साथ **कलश**\n• **सिक्के, खाता पुस्तिकाएं, व्यवसाय खाता (बही-खाता)**\n• फूल (गेंदा, कमल), मालाएं, अगरबत्ती, धूप\n• चावल, कुमकुम, हल्दी, गुलाल, पान के पत्ते, पान, सुपारी\n• **13 दीये** (घी या तेल) + मोमबत्तियां\n• मिठाई: खील, बताशे, लड्डू, खीर, गन्ने के टुकड़े\n• पंचमेवा (5 प्रकार के सूखे मेवे)\n• **धन लक्ष्मी पूजा** के लिए चांदी/सोने के आभूषण, मुद्रा नोट\n• घंटी और शंख के साथ आरती थाली"
                      : "• Idols/photos of **Lakshmi & Ganesha**\n• **Chowki or Wooden platform** covered with red cloth\n• Kalash with water, mango leaves, coconut\n• **Coins, account books, business ledger (Bahi-Khata)**\n• Flowers (marigold, lotus), garlands, incense sticks, dhoop\n• Rice, kumkum, haldi, gulal, betel leaves, paan, supari\n• **13 diyas** (ghee or oil) + candles\n• Sweets: Kheel, batashe, laddoos, kheer, sugarcane pieces\n• Panchmeva (5 types of dry fruits)\n• Silver/gold ornaments, currency notes for **Dhan Lakshmi Puja**\n• Aarti thali with bell and conch"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🪔 पूजा विधि (कदम दर कदम)" : "🪔 Puja Method (Step by Step)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "1. **सफाई और रंगोली** – घर साफ करें और प्रवेश द्वार को रंगोली और दीयों से सजाएं।\n\n2. **कलश स्थापना** – पानी, आम के पत्तों और नारियल के साथ कलश रखें।\n\n3. **भगवान गणेश का आह्वान** – विघ्नहर्ता के रूप में पहले गणेश की पूजा करें।\n\n4. **लक्ष्मी पूजा** – चौकी पर लक्ष्मी की मूर्ति/तस्वीर रखें।\n   • फूल, कुमकुम, चावल, मिठाई, आभूषण अर्पित करें और दीये जलाएं।\n   • **लक्ष्मी अष्टोत्तर (108 नाम)** या **लक्ष्मी चालीसा** का पाठ करें।\n\n5. **बही-खाता पूजा** – व्यवसाय खातों और नई खाता पुस्तिकाओं की पूजा करें।\n   • मां लक्ष्मी के सामने सिक्के और नोट रखें।\n\n6. **दीये जलाना** – घर के हर कोने में दीये रखें।\n   • सुरक्षा के लिए दक्षिण में विशेष **यमदीप**।\n\n7. **आरती** – परिवार के साथ लक्ष्मी और गणेश की आरती करें।\n   • मिठाई और प्रसाद वितरित करें।"
                      : "1. **Cleaning & Rangoli** – Clean home & decorate entrance with rangoli & diyas.\n\n2. **Kalash Sthapana** – Place Kalash with water, mango leaves, and coconut.\n\n3. **Invoke Lord Ganesha** – Worship Ganesha first as Vighnaharta.\n\n4. **Lakshmi Puja** – Place idol/photo of Lakshmi on chowki.\n   • Offer flowers, kumkum, rice, sweets, ornaments, and light diyas.\n   • Recite **Lakshmi Ashtottara (108 names)** or **Lakshmi Chalisa**.\n\n5. **Bahi-Khata Puja** – Worship business ledgers and new account books.\n   • Place coins and notes before Maa Lakshmi.\n\n6. **Lighting Diyas** – Place diyas in every corner of home.\n   • Special **Yamadeep** in South for protection.\n\n7. **Aarti** – Perform aarti of Lakshmi & Ganesha with family.\n   • Distribute sweets and prasad."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🌟 लाभ" : "🌟 Benefits"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• घर में **समृद्धि, धन और प्रचुरता** आमंत्रित करता है।\n• **गरीबी, कर्ज और बाधाओं** को दूर करता है।\n• **व्यवसाय वृद्धि, वित्तीय स्थिरता और शांति** सुनिश्चित करता है।\n• परिवार को **नकारात्मकता और दुर्भाग्य** से बचाता है।"
                      : "• Invites **prosperity, wealth, and abundance** into home.\n• Removes **poverty, debts, and obstacles**.\n• Ensures **business growth, financial stability, and peace**.\n• Protects family from **negativity and misfortune**."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "💰 धन की परंपरा" : "💰 Tradition of Wealth"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• लोग दीपावली पर **सोना, चांदी या नए बर्तन** खरीदते हैं क्योंकि यह **शुभ शुरुआत** का प्रतीक है।\n• कुछ लोग नए व्यवसाय वर्ष के लिए **खाता पुस्तिकाएं, कलम और खाते** भी खरीदते हैं।\n• दीपावली पर शुरू किए गए **नए निवेश या उद्यम** भाग्यशाली माने जाते हैं।"
                      : "• People **buy gold, silver, or new utensils** on Diwali as it symbolizes **auspicious beginnings**.\n• Some also buy **account books, pens, and ledgers** for starting fresh business year.\n• **New investments or ventures** started on Diwali are considered lucky."
                    }
                  </Text>
                </View>
              </View>
            )}

            {selectedTab === 5 && (
              <View style={styles.tabContent}>
                <View style={styles.textContent}>
                  <Text style={styles.heading}>
                    {isHindi ? "🪔 गोवर्धन पूजा विधि - विस्तृत मार्गदर्शन" : "🪔 Govardhan Puja Method - Detailed Guide"}
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "📅 तिथि (2025)" : "📅 Date (2025)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi 
                      ? "• **शुक्रवार, 24 अक्टूबर 2025**\n• **गोवर्धन पूजा मुहूर्त**: सुबह 6:20 बजे – 8:40 बजे (IST)\n• **प्रतिपदा तिथि** शुरू: 23 अक्टूबर को रात 9:51 बजे\n• **प्रतिपदा तिथि** समाप्त: 25 अक्टूबर को रात 12:11 बजे"
                      : "• **Friday, 24th October 2025**\n• **Govardhan Puja Muhurat**: 06:20 AM – 08:40 AM (IST)\n• **Pratipada Tithi** begins: 09:51 PM (23rd Oct)\n• **Pratipada Tithi** ends: 12:11 AM (25th Oct)"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "✨ महत्व" : "✨ Significance"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• दीपावली के अगले दिन मनाया जाता है **भगवान कृष्ण के गोवर्धन पर्वत उठाने** को चिह्नित करने के लिए जो ग्रामीणों को भगवान इंद्र के क्रोध से बचाता था।\n• **अन्नकूट पूजा** भी कहा जाता है, क्योंकि भक्त **56 या 108 प्रकार के भोजन** तैयार करते हैं भगवान कृष्ण को अर्पित करने के लिए।\n• **प्रकृति के प्रति कृतज्ञता** (गोवर्धन पर्वत, गायें, भूमि, भोजन और पानी) का प्रतीक।\n• **समृद्धि, सुरक्षा और सामुदायिक बंधन** को बढ़ावा देता है।"
                      : "• Celebrated the day after Diwali to mark **Lord Krishna's lifting of Govardhan Hill** to protect villagers from Lord Indra's wrath.\n• Also called **Annakut Puja**, as devotees prepare **56 or 108 varieties of food** to offer to Lord Krishna.\n• Symbolizes **gratitude to nature** (Govardhan mountain, cows, land, food, and water).\n• Promotes **prosperity, protection, and community bonding**."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "⏰ पूजा और अनुष्ठान समय" : "⏰ Puja & Ritual Timings"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **सुबह गोवर्धन पूजा मुहूर्त**: सुबह 6:20 बजे – 8:40 बजे\n• **अन्नकूट भोग अर्पण**: सुबह से दोपहर तक\n• **गाय पूजा (गौ पूजा)**: दोपहर से पहले"
                      : "• **Morning Govardhan Puja Muhurat**: 06:20 AM – 08:40 AM\n• **Annakut Bhog offering**: Morning till afternoon\n• **Cow worship (Gau Puja)**: Before noon"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🧭 मूर्ति / सेटअप दिशा" : "🧭 Idol / Setup Direction"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **गोवर्धन पर्वत प्रतीक (गोबर/मिट्टी की छवि या लघु)** → **पूर्व** की ओर रखा गया।\n• **कृष्ण मूर्ति/तस्वीर** → **पश्चिम** की ओर (पूर्व की ओर मुंह किए भक्तों की ओर)।\n• **गायें (यदि वास्तविक या प्रतीकात्मक मूर्तियां)** → पास में रखी गई, सजाई और पूजी गई।"
                      : "• **Govardhan hill symbol (cow dung/soil image or miniature)** → placed facing **East**.\n• **Krishna idol/photo** → face **West (towards devotees facing East)**.\n• **Cows (if real or symbolic statues)** → placed nearby, decorated and worshipped."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "✅ पूजा चेकलिस्ट (आवश्यक वस्तुएं)" : "✅ Puja Checklist (Required Items)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• गोबर / मिट्टी (प्रतीकात्मक गोवर्धन पर्वत बनाने के लिए)\n• **भगवान कृष्ण की मूर्ति/तस्वीर**\n• 56 भोग वस्तुएं (या प्रतीकात्मक भोजन अर्पण) – मिठाई, फल, चावल, दालें, सब्जियां\n• फूल, मालाएं, अगरबत्ती, धूप\n• दीये, कपूर, घी/तेल के दीपक\n• रोली, चावल, हल्दी, कुमकुम, चंदन का पेस्ट\n• गाय का चारा (घास, गुड़, अनाज)\n• अभिषेक के लिए पानी, पंचामृत\n• घंटी और दीया के साथ आरती थाली"
                      : "• Cow dung / soil (to create symbolic Govardhan hill)\n• Idol/photo of **Lord Krishna**\n• 56 Bhog items (or symbolic food offering) – sweets, fruits, rice, pulses, vegetables\n• Flowers, garlands, incense, dhoop\n• Diyas, camphor, ghee/oil lamps\n• Roli, chawal, haldi, kumkum, sandalwood paste\n• Cow feed (grass, jaggery, grains)\n• Water, panchamrit for abhishek\n• Aarti thali with bell and diya"
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🪔 पूजा विधि (कदम दर कदम)" : "🪔 Puja Method (Step by Step)"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "### 1. **तैयारी**\n• घर और आंगन साफ करें।\n• गोबर या मिट्टी से **गोवर्धन पर्वत** बनाएं, फूलों, रंगोली और जानवरों और पेड़ों की छोटी मूर्तियों से सजाएं।\n\n### 2. **संकल्प**\n• पूजा के लिए व्रत लें, **भगवान कृष्ण और गोवर्धन** से सुरक्षा और समृद्धि के लिए प्रार्थना करें।\n\n### 3. **देवताओं का आह्वान**\n• प्रतीकात्मक पर्वत के पास कृष्ण मूर्ति/तस्वीर रखें।\n• पानी, फूल, चावल और कुमकुम अर्पित करें।\n\n### 4. **अन्नकूट भोग**\n• **56/108 प्रकार के भोजन** या प्रतीकात्मक व्यंजन तैयार करें।\n• भक्ति के साथ भगवान कृष्ण को अर्पित करें।\n• गोवर्धन और कृष्ण भजन गाएं।\n\n### 5. **परिक्रमा**\n• परिवार के सदस्य गोवर्धन पर्वत प्रतीक के चारों ओर **परिक्रमा (circumambulation)** करें।\n• फूल, पानी और दीये अर्पित करें।\n\n### 6. **गौ पूजा (गाय पूजा)**\n• यदि संभव हो तो गायों को नहलाएं और सजाएं।\n• तिलक, मालाएं लगाएं और उन्हें मिठाई/घास खिलाएं।\n\n### 7. **आरती और प्रसाद**\n• दीयों और भजनों के साथ कृष्ण आरती करें।\n• परिवार, पड़ोसियों और जरूरतमंद लोगों को प्रसाद और अन्नकूट भोजन वितरित करें।"
                      : "### 1. **Preparation**\n• Clean the house and courtyard.\n• Make **Govardhan hill** from cow dung or soil, decorate with flowers, rangoli, and small figures of animals and trees.\n\n### 2. **Sankalp**\n• Take a vow for worship, praying to **Lord Krishna and Govardhan** for protection and prosperity.\n\n### 3. **Invocation of Deities**\n• Place Krishna idol/photo near the symbolic hill.\n• Offer water, flowers, rice, and kumkum.\n\n### 4. **Annakut Bhog**\n• Prepare **56/108 varieties of food** or symbolic dishes.\n• Offer them to Lord Krishna with devotion.\n• Chant Govardhan and Krishna bhajans.\n\n### 5. **Circumambulation (Parikrama)**\n• Family members do **parikrama (circumambulation)** around Govardhan hill symbol.\n• Offer flowers, water, and diyas.\n\n### 6. **Gau Puja (Cow Worship)**\n• Bathe and decorate cows (if possible).\n• Apply tilak, garlands, and feed them sweets/grass.\n\n### 7. **Aarti & Prasad**\n• Perform Krishna aarti with diyas and bhajans.\n• Distribute prasad and annakut food to family, neighbors, and needy people."
                    }
                  </Text>
                  
                  <Text style={styles.subHeading}>
                    {isHindi ? "🌟 गोवर्धन पूजा के लाभ" : "🌟 Benefits of Govardhan Puja"}
                  </Text>
                  <Text style={styles.paragraph}>
                    {isHindi
                      ? "• **भगवान कृष्ण की सुरक्षा, समृद्धि और आशीर्वाद** लाता है।\n• **प्रकृति, भोजन और गायों के प्रति सम्मान** को बढ़ावा देता है।\n• परिवार के लिए **धन, खुशी और स्वास्थ्य** सुनिश्चित करता है।\n• बाधाओं को दूर करता है और प्राकृतिक आपदाओं से बचाता है।"
                      : "• Brings **protection, prosperity, and blessings of Lord Krishna**.\n• Promotes **respect for nature, food, and cows**.\n• Ensures **wealth, happiness, and health** for the family.\n• Removes obstacles and shields from natural calamities."
                    }
                  </Text>
                </View>
              </View>
            )}

            {selectedTab === 6 && (
              <View style={styles.tabContent}>
                <Text style={styles.heading}>
                  {isHindi ? "भाई दूज पूजा - विधि" : "Bhai Dooj Puja - Method"}
                </Text>
                
                <Text style={styles.subHeading}>
                  {isHindi ? "📅 तिथि (2025)" : "📅 Date (2025)"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi 
                    ? "• शनिवार, 25 अक्टूबर 2025\n• भाई दूज पूजा मुहूर्त: सुबह 01:10 बजे – 03:30 बजे (IST)\n• द्वितीया तिथि शुरू: 24 अक्टूबर रात 12:11 बजे\n• द्वितीया तिथि समाप्त: 26 अक्टूबर सुबह 02:31 बजे"
                    : "• Saturday, 25th October 2025\n• Bhai Dooj Puja Muhurat: 01:10 AM – 03:30 AM (IST)\n• Dwitiya Tithi begins: 12:11 AM (25th Oct)\n• Dwitiya Tithi ends: 02:31 AM (26th Oct)"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "✨ महत्व" : "✨ Significance"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• भाई-बहन के प्यार और बंधन का प्रतीक\n• यमुना ने अपने भाई यमराज की पूजा की थी, जिससे यह त्योहार शुरू हुआ\n• भाई-बहन के रिश्ते को मजबूत करता है और दीर्घायु प्रदान करता है\n• परिवार में सद्भाव और एकता को बढ़ावा देता है"
                    : "• Symbolizes the love and bond between brothers and sisters\n• Yamuna worshipped her brother Yama Raj, which started this festival\n• Strengthens the brother-sister relationship and grants long life\n• Promotes harmony and unity in the family"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "⏰ पूजा और अनुष्ठान समय" : "⏰ Puja & Ritual Timings"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• भाई दूज पूजा मुहूर्त: सुबह 01:10 बजे – 03:30 बजे\n• भाई-बहन मिलन: सुबह से दोपहर तक\n• तिलक और आरती: सुबह के समय"
                    : "• Bhai Dooj Puja Muhurat: 01:10 AM – 03:30 AM\n• Brother-Sister Meeting: Morning till afternoon\n• Tilak and Aarti: Morning time"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "🧭 मूर्ति / सेटअप दिशा" : "🧭 Idol / Setup Direction"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• यमराज और यमुना की मूर्ति/फोटो → पूर्व की ओर रखें\n• भाई-बहन पूर्व की ओर मुंह करके बैठें\n• पूजा सामग्री उत्तर की ओर रखें"
                    : "• Yama Raj and Yamuna idol/photo → placed facing East\n• Brother-sister sit facing East\n• Puja items placed towards North"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "✅ पूजा चेकलिस्ट (आवश्यक वस्तुएं)" : "✅ Puja Checklist (Required Items)"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• यमराज और यमुना की मूर्ति/फोटो\n• कलश जल, आम के पत्ते, नारियल के साथ\n• लाल/पीला पूजा कपड़ा\n• फूल, माला, अगरबत्ती, धूप\n• कुमकुम, हल्दी, अक्षत (चावल), चंदन, पान के पत्ते और सुपारी\n• मिठाई: लड्डू, खील-बताशे, तिल के लड्डू\n• फल, सूखे मेवे, पंचामृत\n• दीये, घी/तेल, रूई की बत्ती, कपूर\n• आरती थाली बेल के साथ"
                    : "• Idol/photo of Yama Raj and Yamuna\n• Kalash with water, mango leaves, coconut\n• Red/yellow puja cloth\n• Flowers, garlands, incense sticks, dhoop\n• Kumkum, haldi, akshat (rice), chandan, betel leaves & nuts\n• Sweets: laddoos, kheel-batashe, til laddoo\n• Fruits, dry fruits, Panchamrit\n• Diyas, ghee/oil, cotton wicks, camphor\n• Aarti thali with bell"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "🪔 पूजा विधि (चरणबद्ध)" : "🪔 Puja Method (Step by Step)"}
                </Text>
                
                <Text style={styles.subHeading}>
                  {isHindi ? "1. शुद्धि (शुद्धिकरण)" : "1. Shuddhi (Purification)"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• घर और पूजा स्थान को साफ करें\n• रंगोली बनाएं और दीये जलाएं"
                    : "• Clean the house and puja area\n• Make rangoli and light diyas"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "2. कलश स्थापना" : "2. Kalash Sthapana"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• आम के पत्ते और नारियल के साथ जल से भरा कलश रखें"
                    : "• Place water-filled kalash with mango leaves and coconut"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "3. गणेश पूजा" : "3. Ganesh Puja"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• विघ्नहर्ता के रूप में गणेश की पूजा से शुरू करें\n• गणेश मंत्र: \"ओम गण गणपतये नमः\""
                    : "• Begin with Ganesh mantra as Vighnaharta\n• Ganesh Mantra: \"Om Gan Ganapataye Namah\""
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "4. यमराज और यमुना पूजा" : "4. Yama Raj and Yamuna Puja"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• यमराज और यमुना की मूर्ति/फोटो पर फूल, कुमकुम, चावल, मिठाई अर्पण करें\n• यमराज मंत्र: \"ओम यमाय नमः\"\n• यमुना मंत्र: \"ओम यमुनायै नमः\""
                    : "• Offer flowers, kumkum, rice, sweets to Yama Raj and Yamuna idol/photo\n• Yama Raj Mantra: \"Om Yamaya Namah\"\n• Yamuna Mantra: \"Om Yamunayai Namah\""
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "5. भाई-बहन तिलक" : "5. Brother-Sister Tilak"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• बहन भाई के माथे पर तिलक लगाएं (कुमकुम, चावल, हल्दी)\n• भाई बहन को उपहार और आशीर्वाद दें\n• दोनों एक-दूसरे की आरती करें"
                    : "• Sister applies tilak on brother's forehead (kumkum, rice, haldi)\n• Brother gives gifts and blessings to sister\n• Both perform aarti for each other"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "6. नैवेद्य और आरती" : "6. Naivedya and Aarti"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• मिठाई, फल, पंचामृत अर्पण करें\n• यमराज और यमुना की आरती करें\n• परिवार के साथ भजन गाएं"
                    : "• Offer sweets, fruits, Panchamrit\n• Perform aarti of Yama Raj and Yamuna\n• Sing bhajans with family"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "🌟 भाई दूज के लाभ" : "🌟 Benefits of Bhai Dooj"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• भाई-बहन के रिश्ते को मजबूत करता है\n• दीर्घायु और स्वास्थ्य प्रदान करता है\n• परिवार में सद्भाव और एकता लाता है\n• यमराज की कृपा से मृत्यु के भय से मुक्ति मिलती है"
                    : "• Strengthens the brother-sister relationship\n• Grants long life and good health\n• Brings harmony and unity in the family\n• Freedom from fear of death by Yama Raj's grace"
                  }
                </Text>

                <Text style={styles.subHeading}>
                  {isHindi ? "💝 परंपरा और रीति-रिवाज" : "💝 Traditions and Customs"}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi
                    ? "• बहनें भाई के लिए विशेष भोजन तैयार करती हैं\n• भाई बहन को उपहार, कपड़े या पैसे देते हैं\n• परिवार के सभी सदस्य एक साथ भोजन करते हैं\n• यह त्योहार भाई-बहन के प्यार का प्रतीक है"
                    : "• Sisters prepare special meals for brothers\n• Brothers give gifts, clothes, or money to sisters\n• All family members eat together\n• This festival symbolizes the love between brothers and sisters"
                  }
                </Text>
              </View>
            )}

            {/* Placeholder for other tabs */}
            {selectedTab > 6 && (
              <View style={styles.tabContent}>
                <Text style={styles.heading}>
                  {isHindi ? "जल्द आ रहा है..." : "Coming Soon..."}
                </Text>
                <Text style={styles.paragraph}>
                  {isHindi 
                    ? "इस टैब के लिए सामग्री जल्द ही जोड़ी जाएगी।"
                    : "Content for this tab will be added soon."
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
  toggleContainerInHeader: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 2,
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  templeIllustration: {
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
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 200,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  hindiToggle: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  tabsContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  tabsScrollContent: {
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  activeTab: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoImage: {
    width: 320,
    height: 320 * 1.5, // Height as width * 1.5
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'center',
    resizeMode: 'cover', // Add resizeMode here as well
  },
  textContent: {
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 15,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginLeft: 20,
    marginBottom: 8,
  },
  conclusion: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export const options = { headerShown: false };
