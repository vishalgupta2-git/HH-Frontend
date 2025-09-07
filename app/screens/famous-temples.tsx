import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image, TextInput } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

export default function FamousTemplesScreen() {
  const { isHindi } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});

  const translations = {
    sections: {
      intro: { en: 'Introduction', hi: 'परिचय' },
      mostVisited: { en: 'The Most Visited Sacred Sites', hi: 'सबसे अधिक देखे जाने वाले पवित्र स्थल' },
      charDham: { en: 'The Sacred Char Dham Circuit', hi: 'पवित्र चार धाम सर्किट' },
      architectural: { en: 'Architectural Marvels and Cultural Treasures', hi: 'स्थापत्य चमत्कार और सांस्कृतिक खजाने' },
      jyotirlingas: { en: 'Sacred Jyotirlingas', hi: 'पवित्र ज्योतिर्लिंग' },
      regional: { en: 'Regional Temple Treasures', hi: 'क्षेत्रीय मंदिर खजाने' },
      unique: { en: 'Unique and Rare Temples', hi: 'अद्वितीय और दुर्लभ मंदिर' },
      significance: { en: 'Spiritual Significance and Cultural Impact', hi: 'आध्यात्मिक महत्व और सांस्कृतिक प्रभाव' },
      pilgrimage: { en: 'Pilgrimage Traditions and Modern Accessibility', hi: 'तीर्थयात्रा परंपराएं और आधुनिक पहुंच' },
      conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
      references: { en: 'References', hi: 'संदर्भ' }
    },
    content: {
      title: { en: 'Famous Hindu Temples: Sacred Architectural Marvels and Spiritual Centers', hi: 'प्रसिद्ध हिंदू मंदिर: पवित्र स्थापत्य चमत्कार और आध्यात्मिक केंद्र' },
      intro: { 
        en: 'Hindu temples represent some of the world\'s most magnificent architectural achievements and serve as living centers of spiritual devotion, cultural preservation, and divine worship. These sacred structures, ranging from ancient cave temples to towering gopurams, embody thousands of years of religious tradition and continue to attract millions of pilgrims and visitors seeking spiritual transformation.',
        hi: 'हिंदू मंदिर दुनिया की कुछ सबसे शानदार स्थापत्य उपलब्धियों का प्रतिनिधित्व करते हैं और आध्यात्मिक भक्ति, सांस्कृतिक संरक्षण और दिव्य पूजा के जीवित केंद्रों के रूप में कार्य करते हैं। प्राचीन गुफा मंदिरों से लेकर ऊंचे गोपुरमों तक, ये पवित्र संरचनाएं हजारों वर्षों की धार्मिक परंपरा का प्रतीक हैं और आध्यात्मिक परिवर्तन की तलाश करने वाले लाखों तीर्थयात्रियों और आगंतुकों को आकर्षित करना जारी रखती हैं।'
      },
      mostVisited: {
        title: { en: 'The Most Visited Sacred Sites', hi: 'सबसे अधिक देखे जाने वाले पवित्र स्थल' },
        tirupati: {
          title: { en: 'Tirupati Balaji Temple - The Crown Jewel of Pilgrimage', hi: 'तिरुपति बालाजी मंदिर - तीर्थयात्रा का मुकुट रत्न' },
          description1: { 
            en: 'The Venkateswara Temple at Tirumala stands as the most visited Hindu temple in the world, attracting 30,000-40,000 visitors daily and up to 75,000 on New Year\'s Day. Located in the hills of Tirumala in Andhra Pradesh, this temple dedicated to Lord Venkateswara (a form of Vishnu) receives 30-40 million visitors annually, making it not just India\'s busiest temple but potentially the most visited religious site globally.',
            hi: 'तिरुमला में वेंकटेश्वर मंदिर दुनिया का सबसे अधिक देखा जाने वाला हिंदू मंदिर है, जो दैनिक 30,000-40,000 आगंतुकों को आकर्षित करता है और नए साल के दिन 75,000 तक। आंध्र प्रदेश के तिरुमला की पहाड़ियों में स्थित, भगवान वेंकटेश्वर (विष्णु का एक रूप) को समर्पित यह मंदिर सालाना 30-40 मिलियन आगंतुकों को प्राप्त करता है, जो इसे न केवल भारत का सबसे व्यस्त मंदिर बनाता है बल्कि संभावित रूप से दुनिया का सबसे अधिक देखा जाने वाला धार्मिक स्थल बनाता है।'
          },
          description2: { 
            en: 'The temple sits atop seven hills representing the seven heads of Adisesha, the cosmic serpent on which Vishnu rests. Devotees believe that Venkateswara appeared on earth to save mankind from the trials of Kali Yuga, making this pilgrimage especially significant for spiritual seekers.',
            hi: 'मंदिर सात पहाड़ियों के शीर्ष पर स्थित है जो आदिशेष के सात सिरों का प्रतिनिधित्व करती हैं, ब्रह्मांडीय सर्प जिस पर विष्णु विश्राम करते हैं। भक्तों का मानना है कि वेंकटेश्वर कलियुग की परीक्षाओं से मानवता को बचाने के लिए पृथ्वी पर प्रकट हुए, जो इस तीर्थयात्रा को आध्यात्मिक साधकों के लिए विशेष रूप से महत्वपूर्ण बनाता है।'
          }
        },
        shirdi: {
          title: { en: 'Shirdi Sai Baba Temple - Universal Spiritual Center', hi: 'शिरडी साई बाबा मंदिर - सार्वभौमिक आध्यात्मिक केंद्र' },
          description: { 
            en: 'The Sri Sai Baba Temple in Shirdi, Maharashtra attracts over 60,000 devotees daily, with numbers reaching 2-3 lakh on special occasions. This temple, built in 1922, honors Sai Baba of Shirdi, a spiritual master revered across religious boundaries. The temple receives more than 30 million devotees annually, making it one of the world\'s top pilgrimage destinations and India\'s second-richest temple.',
            hi: 'महाराष्ट्र के शिरडी में श्री साई बाबा मंदिर दैनिक 60,000 से अधिक भक्तों को आकर्षित करता है, विशेष अवसरों पर संख्या 2-3 लाख तक पहुंच जाती है। 1922 में निर्मित यह मंदिर शिरडी के साई बाबा का सम्मान करता है, एक आध्यात्मिक गुरु जो धार्मिक सीमाओं के पार पूजे जाते हैं। मंदिर सालाना 30 मिलियन से अधिक भक्तों को प्राप्त करता है, जो इसे दुनिया के शीर्ष तीर्थस्थलों में से एक और भारत का दूसरा सबसे अमीर मंदिर बनाता है।'
          }
        },
        ayodhya: {
          title: { en: 'Ayodhya Ram Janmabhoomi - The Sacred Birthplace', hi: 'अयोध्या राम जन्मभूमि - पवित्र जन्मस्थान' },
          description: { 
            en: 'The newly inaugurated Ram Mandir in Ayodhya represents one of the most significant recent developments in Hindu temple architecture. Consecrated on January 22, 2024, this temple is believed to be located at Ram Janmabhoomi, the birthplace of Lord Rama. Projections suggest it will receive 50 million visitors annually, potentially making it the world\'s top pilgrimage site.',
            hi: 'अयोध्या में नवनिर्मित राम मंदिर हिंदू मंदिर वास्तुकला में सबसे महत्वपूर्ण हालिया विकास का प्रतिनिधित्व करता है। 22 जनवरी, 2024 को समर्पित, यह मंदिर राम जन्मभूमि पर स्थित माना जाता है, भगवान राम का जन्मस्थान। अनुमान बताते हैं कि यह सालाना 50 मिलियन आगंतुकों को प्राप्त करेगा, संभावित रूप से इसे दुनिया का शीर्ष तीर्थस्थल बनाता है।'
          }
        }
      },
      charDham: {
        title: { en: 'The Sacred Char Dham Circuit', hi: 'पवित्र चार धाम सर्किट' },
        jagannath: {
          title: { en: 'Jagannath Temple, Puri - The Lord of the Universe', hi: 'जगन्नाथ मंदिर, पुरी - ब्रह्मांड के स्वामी' },
          description: { 
            en: 'The Jagannath Temple in Puri, Odisha represents one of the four sacred Char Dham sites and houses the famous wooden idols of Lord Jagannath (Krishna), Balabhadra, and Subhadra. The temple is renowned for its annual Rath Yatra (chariot festival).',
            hi: 'ओडिशा के पुरी में जगन्नाथ मंदिर चार पवित्र चार धाम स्थलों में से एक का प्रतिनिधित्व करता है और भगवान जगन्नाथ (कृष्ण), बलभद्र और सुभद्रा की प्रसिद्ध लकड़ी की मूर्तियों को रखता है। मंदिर अपने वार्षिक रथ यात्रा (रथ उत्सव) के लिए प्रसिद्ध है।'
          }
        },
        kashi: {
          title: { en: 'Kashi Vishwanath Temple - The Eternal City\'s Heart', hi: 'काशी विश्वनाथ मंदिर - शाश्वत शहर का हृदय' },
          description: { 
            en: 'The Kashi Vishwanath Temple in Varanasi holds special significance as one of the twelve sacred Jyotirlingas dedicated to Lord Shiva. Located in the ancient holy city on the banks of the Ganges, this temple recorded 3.35 lakh pilgrims on January 1, 2023.',
            hi: 'वाराणसी में काशी विश्वनाथ मंदिर भगवान शिव को समर्पित बारह पवित्र ज्योतिर्लिंगों में से एक के रूप में विशेष महत्व रखता है। गंगा के तट पर प्राचीन पवित्र शहर में स्थित, इस मंदिर ने 1 जनवरी, 2023 को 3.35 लाख तीर्थयात्रियों को दर्ज किया।'
          }
        },
        himalayan: {
          title: { en: 'Badrinath and Kedarnath - Himalayan Sacred Heights', hi: 'बद्रीनाथ और केदारनाथ - हिमालयी पवित्र ऊंचाइयां' },
          description: { 
            en: 'Badrinath Temple sits at 10,400 feet above sea level in the Garhwal Himalayas, positioned between the Nar and Narayan mountain ranges with the magnificent Neelkanth peak as backdrop. Kedarnath Temple serves both as a Char Dham site and one of the twelve Jyotirlingas.',
            hi: 'बद्रीनाथ मंदिर गढ़वाल हिमालय में समुद्र तल से 10,400 फीट की ऊंचाई पर स्थित है, जो नार और नारायण पर्वत श्रृंखलाओं के बीच स्थित है जिसमें शानदार नीलकंठ चोटी पृष्ठभूमि के रूप में है। केदारनाथ मंदिर चार धाम स्थल और बारह ज्योतिर्लिंगों में से एक दोनों के रूप में कार्य करता है।'
          }
        }
      },
      architectural: {
        title: { en: 'Architectural Marvels and Cultural Treasures', hi: 'स्थापत्य चमत्कार और सांस्कृतिक खजाने' },
        meenakshi: {
          title: { en: 'Meenakshi Amman Temple - South Indian Splendor', hi: 'मीनाक्षी अम्मन मंदिर - दक्षिण भारतीय वैभव' },
          description: { 
            en: 'The Meenakshi Amman Temple in Madurai exemplifies the pinnacle of South Indian temple architecture. This 17th-century complex features 12 towering gopurams adorned with over a thousand statues. The temple\'s Thousand Pillared Hall now houses the Temple Art Museum, while the famous musical pillars produce different notes when struck.',
            hi: 'मदुरै में मीनाक्षी अम्मन मंदिर दक्षिण भारतीय मंदिर वास्तुकला के शिखर का उदाहरण है। यह 17वीं शताब्दी का परिसर 12 ऊंचे गोपुरमों की विशेषता है जो एक हजार से अधिक मूर्तियों से सजे हैं। मंदिर का हजार स्तंभ हॉल अब मंदिर कला संग्रहालय का घर है, जबकि प्रसिद्ध संगीत स्तंभ मारे जाने पर अलग-अलग नोट उत्पन्न करते हैं।'
          }
        },
        konark: {
          title: { en: 'Konark Sun Temple - Architectural Wonder', hi: 'कोणार्क सूर्य मंदिर - स्थापत्य चमत्कार' },
          description: { 
            en: 'The Konark Sun Temple stands as a UNESCO World Heritage Site designed as a massive stone chariot dedicated to Surya (the Sun God), showcasing intricate carvings and precise astronomical alignments.',
            hi: 'कोणार्क सूर्य मंदिर यूनेस्को विश्व धरोहर स्थल के रूप में खड़ा है जो सूर्य (सूर्य देव) को समर्पित एक विशाल पत्थर के रथ के रूप में डिजाइन किया गया है, जो जटिल नक्काशी और सटीक खगोलीय संरेखण का प्रदर्शन करता है।'
          }
        },
        khajuraho: {
          title: { en: 'Khajuraho Temples - Artistic Excellence', hi: 'खजुराहो मंदिर - कलात्मक उत्कृष्टता' },
          description: { 
            en: 'The Khajuraho temple complex represents medieval Indian temple architecture at its finest, featuring intricate carvings and sculptures that celebrate life in all its forms. These 10th-11th century temples demonstrate sophisticated artistic traditions.',
            hi: 'खजुराहो मंदिर परिसर अपने सर्वोत्तम रूप में मध्यकालीन भारतीय मंदिर वास्तुकला का प्रतिनिधित्व करता है, जिसमें जटिल नक्काशी और मूर्तियां हैं जो अपने सभी रूपों में जीवन का जश्न मनाती हैं। ये 10वीं-11वीं शताब्दी के मंदिर परिष्कृत कलात्मक परंपराओं का प्रदर्शन करते हैं।'
          }
        }
      },
      jyotirlingas: {
        title: { en: 'Sacred Jyotirlingas - Shiva\'s Divine Light', hi: 'पवित्र ज्योतिर्लिंग - शिव का दिव्य प्रकाश' },
        somnath: {
          title: { en: 'Somnath Temple - The Eternal Shrine', hi: 'सोमनाथ मंदिर - शाश्वत मंदिर' },
          description: { 
            en: 'Somnath Temple in Gujarat stands as the first among the Jyotirlingas, representing Shiva\'s eternal and indestructible nature. Despite being destroyed and rebuilt multiple times, it symbolizes the undying nature of faith.',
            hi: 'गुजरात में सोमनाथ मंदिर ज्योतिर्लिंगों में पहले स्थान पर खड़ा है, जो शिव की शाश्वत और अविनाशी प्रकृति का प्रतिनिधित्व करता है। कई बार नष्ट और पुनर्निर्मित होने के बावजूद, यह विश्वास की अमर प्रकृति का प्रतीक है।'
          }
        },
        mahakaleshwar: {
          title: { en: 'Mahakaleshwar Temple - The Time Lord', hi: 'महाकालेश्वर मंदिर - समय के स्वामी' },
          description: { 
            en: 'Mahakaleshwar Temple in Ujjain is unique as the only south-facing Jyotirlinga and is famous for its Bhasma Aarti ceremony. The temple represents Shiva as Mahakaal, the lord of time and death.',
            hi: 'उज्जैन में महाकालेश्वर मंदिर एकमात्र दक्षिण-मुखी ज्योतिर्लिंग के रूप में अनूठा है और अपने भस्म आरती समारोह के लिए प्रसिद्ध है। मंदिर शिव को महाकाल के रूप में दर्शाता है, समय और मृत्यु के स्वामी।'
          }
        },
        mallikarjuna: {
          title: { en: 'Mallikarjuna Temple - Divine Union', hi: 'मल्लिकार्जुन मंदिर - दिव्य मिलन' },
          description: { 
            en: 'Mallikarjuna Temple at Srisailam signifies the divine union of Shiva and Parvati, serving as both a Jyotirlinga and a Shakti Peetha.',
            hi: 'श्रीशैलम में मल्लिकार्जुन मंदिर शिव और पार्वती के दिव्य मिलन का प्रतीक है, जो ज्योतिर्लिंग और शक्ति पीठ दोनों के रूप में कार्य करता है।'
          }
        }
      },
      regional: {
        title: { en: 'Regional Temple Treasures', hi: 'क्षेत्रीय मंदिर खजाने' },
        maharashtra: {
          title: { en: 'Maharashtra\'s Sacred Sites', hi: 'महाराष्ट्र के पवित्र स्थल' },
          description: { 
            en: 'Shirdi Sai Baba Temple leads Maharashtra\'s spiritual landscape, while Trimbakeshwar and Bhimashankar contribute to the state\'s Jyotirlinga heritage. Grishneshwar Temple completes the Jyotirlinga circuit in the state.',
            hi: 'शिरडी साई बाबा मंदिर महाराष्ट्र के आध्यात्मिक परिदृश्य का नेतृत्व करता है, जबकि त्र्यंबकेश्वर और भीमाशंकर राज्य की ज्योतिर्लिंग विरासत में योगदान करते हैं। गृहनेश्वर मंदिर राज्य में ज्योतिर्लिंग सर्किट को पूरा करता है।'
          }
        },
        karnataka: {
          title: { en: 'Karnataka\'s Divine Heritage', hi: 'कर्नाटक की दिव्य विरासत' },
          description: { 
            en: 'Murudeshwar Temple features the world\'s second-largest statue of Lord Shiva at 123 feet, situated on the Kanduka hill and surrounded by the Arabian Sea on three sides. Vitthala Temple in Hampi showcases exceptional architecture, renowned for its stone chariot and musical pillars. Gokarna Mahabaleshwar Temple is considered as sacred as Kashi.',
            hi: 'मुरुदेश्वर मंदिर में 123 फीट की दुनिया की दूसरी सबसे बड़ी भगवान शिव की मूर्ति है, जो कंदुका पहाड़ी पर स्थित है और तीन तरफ से अरब सागर से घिरा है। हम्पी में विट्ठल मंदिर असाधारण वास्तुकला का प्रदर्शन करता है, जो अपने पत्थर के रथ और संगीत स्तंभों के लिए प्रसिद्ध है। गोकर्ण महाबलेश्वर मंदिर को काशी के समान पवित्र माना जाता है।'
          }
        },
        tamilNadu: {
          title: { en: 'Tamil Nadu\'s Temple Grandeur', hi: 'तमिलनाडु की मंदिर भव्यता' },
          description: { 
            en: 'Beyond Meenakshi Temple, Tamil Nadu houses Ramanathaswamy Temple at Rameswaram, significant as both a Char Dham site and Jyotirlinga. Kanchipuram serves as one of the seven sacred Sapta Puri cities.',
            hi: 'मीनाक्षी मंदिर के अलावा, तमिलनाडु में रामेश्वरम में रामनाथस्वामी मंदिर है, जो चार धाम स्थल और ज्योतिर्लिंग दोनों के रूप में महत्वपूर्ण है। कांचीपुरम सात पवित्र सप्त पुरी शहरों में से एक के रूप में कार्य करता है।'
          }
        },
        gujarat: {
          title: { en: 'Gujarat\'s Sacred Legacy', hi: 'गुजरात की पवित्र विरासत' },
          description: { 
            en: 'Dwarka represents both a Char Dham site and one of the Sapta Puri cities, marking Lord Krishna\'s divine kingdom. Somnath and Nageshwar temples contribute to Gujarat\'s Jyotirlinga heritage.',
            hi: 'द्वारका चार धाम स्थल और सप्त पुरी शहरों में से एक दोनों का प्रतिनिधित्व करता है, जो भगवान कृष्ण के दिव्य राज्य को चिह्नित करता है। सोमनाथ और नागेश्वर मंदिर गुजरात की ज्योतिर्लिंग विरासत में योगदान करते हैं।'
          }
        }
      },
      unique: {
        title: { en: 'Unique and Rare Temples', hi: 'अद्वितीय और दुर्लभ मंदिर' },
        brahma: {
          title: { en: 'Brahma Temple, Pushkar - The Creator\'s Rare Shrine', hi: 'ब्रह्मा मंदिर, पुष्कर - सृष्टिकर्ता का दुर्लभ मंदिर' },
          description: { 
            en: 'The Brahma Temple in Pushkar, Rajasthan represents one of the world\'s few temples dedicated to Lord Brahma. This 14th-century structure features a distinctive red pinnacle and vibrant blue-painted pillars. Literature suggests Sage Vishwamitra built the original structure.',
            hi: 'राजस्थान के पुष्कर में ब्रह्मा मंदिर दुनिया के कुछ मंदिरों में से एक का प्रतिनिधित्व करता है जो भगवान ब्रह्मा को समर्पित है। यह 14वीं शताब्दी की संरचना में एक विशिष्ट लाल शिखर और जीवंत नीले रंग के खंभे हैं। साहित्य बताता है कि ऋषि विश्वामित्र ने मूल संरचना का निर्माण किया था।'
          }
        },
        vaishnoDevi: {
          title: { en: 'Vaishno Devi Temple - The Divine Mother\'s Abode', hi: 'वैष्णो देवी मंदिर - दिव्य माता का निवास' },
          description: { 
            en: 'Vaishno Devi Temple in Jammu & Kashmir requires pilgrims to trek 12 kilometers from Katra base camp to reach the sacred cave at 5,200 feet. The main deity appears as three natural rock formations representing different aspects of the Divine Mother.',
            hi: 'जम्मू और कश्मीर में वैष्णो देवी मंदिर में तीर्थयात्रियों को 5,200 फीट की ऊंचाई पर पवित्र गुफा तक पहुंचने के लिए कटरा बेस कैंप से 12 किलोमीटर की यात्रा करनी पड़ती है। मुख्य देवता तीन प्राकृतिक चट्टानी संरचनाओं के रूप में प्रकट होती हैं जो दिव्य माता के विभिन्न पहलुओं का प्रतिनिधित्व करती हैं।'
          }
        }
      },
      significance: {
        title: { en: 'Spiritual Significance and Cultural Impact', hi: 'आध्यात्मिक महत्व और सांस्कृतिक प्रभाव' },
        learning: {
          title: { en: 'Centers of Learning and Culture', hi: 'शिक्षा और संस्कृति के केंद्र' },
          description: { 
            en: 'Hindu temples serve as repositories of art, culture, and spiritual knowledge. Many temples maintain traditional music and dance schools, preserve ancient manuscripts, and continue centuries-old crafts and traditions.',
            hi: 'हिंदू मंदिर कला, संस्कृति और आध्यात्मिक ज्ञान के भंडार के रूप में कार्य करते हैं। कई मंदिर पारंपरिक संगीत और नृत्य स्कूलों को बनाए रखते हैं, प्राचीन पांडुलिपियों को संरक्षित करते हैं, और सदियों पुरानी शिल्प और परंपराओं को जारी रखते हैं।'
          }
        },
        economic: {
          title: { en: 'Economic and Social Impact', hi: 'आर्थिक और सामाजिक प्रभाव' },
          description: { 
            en: 'Major temples like Tirupati and Shirdi generate significant economic activity, supporting local communities through employment, tourism, and charitable activities. Temple trusts often run educational institutions, hospitals, and social welfare programs.',
            hi: 'तिरुपति और शिरडी जैसे प्रमुख मंदिर महत्वपूर्ण आर्थिक गतिविधि उत्पन्न करते हैं, रोजगार, पर्यटन और धर्मार्थ गतिविधियों के माध्यम से स्थानीय समुदायों का समर्थन करते हैं। मंदिर ट्रस्ट अक्सर शैक्षणिक संस्थान, अस्पताल और सामाजिक कल्याण कार्यक्रम चलाते हैं।'
          }
        },
        architectural: {
          title: { en: 'Architectural Heritage', hi: 'स्थापत्य विरासत' },
          description: { 
            en: 'These temples represent living museums of Indian architecture, showcasing evolution from cave temples to towering gopurams, and demonstrating knowledge of astronomy, acoustics, mathematics, and engineering.',
            hi: 'ये मंदिर भारतीय वास्तुकला के जीवित संग्रहालयों का प्रतिनिधित्व करते हैं, गुफा मंदिरों से लेकर ऊंचे गोपुरमों तक के विकास का प्रदर्शन करते हैं, और खगोल विज्ञान, ध्वनिकी, गणित और इंजीनियरिंग के ज्ञान का प्रदर्शन करते हैं।'
          }
        }
      },
      pilgrimage: {
        title: { en: 'Pilgrimage Traditions and Modern Accessibility', hi: 'तीर्थयात्रा परंपराएं और आधुनिक पहुंच' },
        traditional: {
          title: { en: 'Traditional Pilgrimage Circuits', hi: 'पारंपरिक तीर्थयात्रा सर्किट' },
          description: { 
            en: 'Hindu temples are often organized into spiritual circuits like the Char Dham Yatra, Jyotirlinga circuit, and Shakti Peetha pilgrimage, offering structured paths for spiritual growth.',
            hi: 'हिंदू मंदिर अक्सर चार धाम यात्रा, ज्योतिर्लिंग सर्किट और शक्ति पीठ तीर्थयात्रा जैसे आध्यात्मिक सर्किट में संगठित होते हैं, जो आध्यात्मिक विकास के लिए संरचित मार्ग प्रदान करते हैं।'
          }
        },
        modern: {
          title: { en: 'Modern Infrastructure', hi: 'आधुनिक बुनियादी ढांचा' },
          description: { 
            en: 'Contemporary temple management includes digital darshan booking, transportation, and improved accommodations while maintaining traditional practices. Many temples offer live streaming of ceremonies.',
            hi: 'समकालीन मंदिर प्रबंधन में पारंपरिक प्रथाओं को बनाए रखते हुए डिजिटल दर्शन बुकिंग, परिवहन और बेहतर आवास शामिल हैं। कई मंदिर समारोहों की लाइव स्ट्रीमिंग प्रदान करते हैं।'
          }
        },
        environmental: {
          title: { en: 'Environmental Consciousness', hi: 'पर्यावरणीय जागरूकता' },
          description: { 
            en: 'Temple management increasingly emphasizes eco-friendly practices, waste management, and sustainable tourism to preserve sacred sites for future generations.',
            hi: 'मंदिर प्रबंधन भविष्य की पीढ़ियों के लिए पवित्र स्थलों को संरक्षित करने के लिए पर्यावरण-अनुकूल प्रथाओं, अपशिष्ट प्रबंधन और सतत पर्यटन पर तेजी से जोर देता है।'
          }
        }
      },
      conclusion: {
        title: { en: 'Conclusion: Living Heritage of Faith', hi: 'निष्कर्ष: विश्वास की जीवित विरासत' },
        paragraph1: { 
          en: 'Hindu temples embody living traditions that continue to evolve while maintaining their spiritual essence. From bustling crowds at Tirupati to the serene heights of Kedarnath, and from the artistic splendor of Meenakshi Temple to village shrines, these sacred spaces offer accessible pathways to the divine.',
          hi: 'हिंदू मंदिर जीवित परंपराओं का प्रतीक हैं जो अपने आध्यात्मिक सार को बनाए रखते हुए विकसित होना जारी रखते हैं। तिरुपति में हलचल भरी भीड़ से लेकर केदारनाथ की शांत ऊंचाइयों तक, और मीनाक्षी मंदिर की कलात्मक भव्यता से लेकर गांव के मंदिरों तक, ये पवित्र स्थान दिव्य तक पहुंचने के सुलभ मार्ग प्रदान करते हैं।'
        },
        paragraph2: { 
          en: 'Each temple tells a unique story of faith, culture, and human aspiration, serving as bridges between earthly and divine realms. Their enduring popularity shows that humanity\'s need for sacred space, community worship, and divine connection remains as strong as ever.',
          hi: 'प्रत्येक मंदिर विश्वास, संस्कृति और मानवीय आकांक्षा की एक अनूठी कहानी बताता है, जो पार्थिव और दिव्य क्षेत्रों के बीच पुल के रूप में कार्य करता है। उनकी स्थायी लोकप्रियता दर्शाती है कि पवित्र स्थान, सामुदायिक पूजा और दिव्य संबंध की मानवता की आवश्यकता पहले की तरह मजबूत बनी हुई है।'
        }
      }
    }
  };

  const sections = [
    { key: 'intro', title: isHindi ? translations.sections.intro.hi : translations.sections.intro.en },
    { key: 'mostVisited', title: isHindi ? translations.sections.mostVisited.hi : translations.sections.mostVisited.en },
    { key: 'charDham', title: isHindi ? translations.sections.charDham.hi : translations.sections.charDham.en },
    { key: 'architectural', title: isHindi ? translations.sections.architectural.hi : translations.sections.architectural.en },
    { key: 'jyotirlingas', title: isHindi ? translations.sections.jyotirlingas.hi : translations.sections.jyotirlingas.en },
    { key: 'regional', title: isHindi ? translations.sections.regional.hi : translations.sections.regional.en },
    { key: 'unique', title: isHindi ? translations.sections.unique.hi : translations.sections.unique.en },
    { key: 'significance', title: isHindi ? translations.sections.significance.hi : translations.sections.significance.en },
    { key: 'pilgrimage', title: isHindi ? translations.sections.pilgrimage.hi : translations.sections.pilgrimage.en },
    { key: 'conclusion', title: isHindi ? translations.sections.conclusion.hi : translations.sections.conclusion.en },
    { key: 'references', title: isHindi ? translations.sections.references.hi : translations.sections.references.en },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(isHindi ? 'विषय' : 'Topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState('');

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      setShowSearchResults(false);
      setSearchHighlight('');
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
    setSearchHighlight(query);
  };

  // Helper function to get text content for each section
  const getSectionText = (sectionKey: string): string => {
    switch (sectionKey) {
      case 'intro':
        return 'Hindu temples represent some of the world\'s most magnificent architectural achievements and serve as living centers of spiritual devotion, cultural preservation, and divine worship.';
      case 'mostVisited':
        return 'The most visited sacred sites in India attract millions of devotees annually, representing the spiritual heart of Hinduism and serving as major pilgrimage destinations.';
      case 'charDham':
        return 'The Char Dham circuit consists of four sacred sites located in the four corners of India, representing a complete spiritual journey that every Hindu aspires to undertake.';
      case 'architectural':
        return 'Architectural marvels and cultural treasures showcase the incredible skill and devotion of ancient Indian craftsmen and architects who created these magnificent structures.';
      case 'jyotirlingas':
        return 'Sacred Jyotirlingas represent the most sacred abodes of Lord Shiva, where the divine light of consciousness is believed to be eternally present.';
      case 'regional':
        return 'Regional temple treasures reflect the diverse cultural and architectural traditions of different parts of India, each with unique characteristics and significance.';
      case 'unique':
        return 'Unique and rare temples represent extraordinary examples of Hindu architecture and spirituality, often featuring unusual designs or special religious significance.';
      case 'significance':
        return 'Spiritual significance and cultural impact of Hindu temples extends beyond religious worship to influence art, literature, music, and social practices throughout Indian history.';
      case 'pilgrimage':
        return 'Pilgrimage traditions and modern accessibility ensure that these sacred sites remain accessible to devotees while preserving their spiritual and cultural significance.';
      case 'conclusion':
        return 'Famous Hindu temples continue to inspire awe and devotion, serving as living monuments to the spiritual heritage and architectural genius of ancient India.';
      default:
        return '';
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
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

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites_in_India' },
    { id: 2, url: 'https://www.guinnessworldrecords.com/world-records/most-visited-hindu-temple-' },
    { id: 3, url: 'https://www.travelogyindia.com/blog/list-of-famous-temples-in-india/' },
    { id: 4, url: 'https://www.lonelyplanet.com/articles/top-temples-in-india' },
    { id: 5, url: 'https://www.lydiatravels.com/2023/03/the-most-beautiful-temples-in-india.html' },
    { id: 6, url: 'https://karnatakatourism.org/temples-in-karnataka/page/3/' },
    { id: 7, url: 'https://en.wikipedia.org/wiki/List_of_Hindu_temples_in_India' },
    { id: 8, url: 'https://www.holidify.com/collections/temples-of-india' },
    { id: 9, url: 'https://www.trawell.in/best-pilgrimage-sites-near-bangalore' },
    { id: 10, url: 'https://education.vikaspedia.in/viewcontent/education/childrens-corner/places-to-visit/famous-temples-in-india?lgn=en' },
    { id: 11, url: 'https://www.makemytrip.com/tripideas/pilgrimage-domestic-10000_budget-destinations-from-bengaluru' },
    { id: 12, url: 'https://testbook.com/ssc-jobs/famous-temples-in-india' },
    { id: 13, url: 'https://en.wikipedia.org/wiki/List_of_largest_Hindu_temples' },
    { id: 14, url: 'https://en.wikipedia.org/wiki/Hindu_pilgrimage_sites' },
    { id: 15, url: 'https://www.namasteindiatrip.com/blog/temples-in-india/' },
    { id: 16, url: 'https://www.holidify.com/collections/temples-in-bangalore' },
    { id: 17, url: 'https://www.tourmyindia.com/pilgrimage/hindu-pilgrimage-tour.html' },
    { id: 18, url: 'https://en.wikipedia.org/wiki/Hindu_temple' },
    { id: 19, url: 'https://tripcosmos.co/hindu-pilgrimage-tour-across-india/' },
    { id: 20, url: 'https://www.tripoto.com/india/trips/top-50-most-famous-hindu-temples-to-visit-in-india-6131cfd2efecc' },
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder="Search temples, circuits, regions..."
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
                placeholder="Search through Famous Temples content..."
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
        {/* Intro */}
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>
            {isHindi ? translations.content.title.hi : translations.content.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.intro.hi : translations.content.intro.en}
          </Text>
        </LinearGradient>

        {/* Most visited */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['mostVisited'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.mostVisited.title.hi : translations.content.mostVisited.title.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.mostVisited.tirupati.title.hi : translations.content.mostVisited.tirupati.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Balaji Image.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.mostVisited.tirupati.description1.hi : translations.content.mostVisited.tirupati.description1.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.mostVisited.tirupati.description2.hi : translations.content.mostVisited.tirupati.description2.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.mostVisited.shirdi.title.hi : translations.content.mostVisited.shirdi.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/SaiBaba.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.mostVisited.shirdi.description.hi : translations.content.mostVisited.shirdi.description.en}
          </Text>

          <Text style={styles.h3}>
            {isHindi ? translations.content.mostVisited.ayodhya.title.hi : translations.content.mostVisited.ayodhya.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Ram Mandir.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.mostVisited.ayodhya.description.hi : translations.content.mostVisited.ayodhya.description.en}
          </Text>
        </View>

        {/* Char Dham */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['charDham'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.charDham.title.hi : translations.content.charDham.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.charDham.jagannath.title.hi : translations.content.charDham.jagannath.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/JagannathPuri.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.jagannath.description.hi : translations.content.charDham.jagannath.description.en}
          </Text>
          
          <Text style={styles.h3}>
            {isHindi ? translations.content.charDham.kashi.title.hi : translations.content.charDham.kashi.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/KashiVishwanath.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.kashi.description.hi : translations.content.charDham.kashi.description.en}
          </Text>
          
          <Text style={styles.h3}>
            {isHindi ? translations.content.charDham.himalayan.title.hi : translations.content.charDham.himalayan.title.en}
          </Text>
          <View style={styles.imageRow}>
            <Image 
              source={require('@/assets/images/FamousTempleImages/BadrinathDham.jpg')} 
              style={styles.halfImage}
              resizeMode="cover"
            />
            <Image 
              source={require('@/assets/images/FamousTempleImages/KedarnathDham.jpg')} 
              style={styles.halfImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.p}>
            {isHindi ? translations.content.charDham.himalayan.description.hi : translations.content.charDham.himalayan.description.en}
          </Text>
        </View>

        {/* Architectural */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['architectural'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.architectural.title.hi : translations.content.architectural.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.architectural.meenakshi.title.hi : translations.content.architectural.meenakshi.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/MeenakshiAmmannTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.architectural.meenakshi.description.hi : translations.content.architectural.meenakshi.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.architectural.konark.title.hi : translations.content.architectural.konark.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/KonarkSunTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.architectural.konark.description.hi : translations.content.architectural.konark.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.architectural.khajuraho.title.hi : translations.content.architectural.khajuraho.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Khajuraho.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.architectural.khajuraho.description.hi : translations.content.architectural.khajuraho.description.en}
          </Text>
        </View>

        {/* Jyotirlingas */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['jyotirlingas'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.jyotirlingas.title.hi : translations.content.jyotirlingas.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.jyotirlingas.somnath.title.hi : translations.content.jyotirlingas.somnath.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/SomnathTemple.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.jyotirlingas.somnath.description.hi : translations.content.jyotirlingas.somnath.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.jyotirlingas.mahakaleshwar.title.hi : translations.content.jyotirlingas.mahakaleshwar.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/MahaKaleshwar.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.jyotirlingas.mahakaleshwar.description.hi : translations.content.jyotirlingas.mahakaleshwar.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.jyotirlingas.mallikarjuna.title.hi : translations.content.jyotirlingas.mallikarjuna.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/Mallikarjuna.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.jyotirlingas.mallikarjuna.description.hi : translations.content.jyotirlingas.mallikarjuna.description.en}
          </Text>
        </View>

        {/* Regional Treasures */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['regional'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.regional.title.hi : translations.content.regional.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.maharashtra.title.hi : translations.content.regional.maharashtra.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.maharashtra.description.hi : translations.content.regional.maharashtra.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.karnataka.title.hi : translations.content.regional.karnataka.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.karnataka.description.hi : translations.content.regional.karnataka.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.tamilNadu.title.hi : translations.content.regional.tamilNadu.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.tamilNadu.description.hi : translations.content.regional.tamilNadu.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.regional.gujarat.title.hi : translations.content.regional.gujarat.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.regional.gujarat.description.hi : translations.content.regional.gujarat.description.en}
          </Text>
        </View>

        {/* Unique */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['unique'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.unique.title.hi : translations.content.unique.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.unique.brahma.title.hi : translations.content.unique.brahma.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/BrahmaTemplePushkar.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.unique.brahma.description.hi : translations.content.unique.brahma.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.unique.vaishnoDevi.title.hi : translations.content.unique.vaishnoDevi.title.en}
          </Text>
          <Image 
            source={require('@/assets/images/FamousTempleImages/VaishnoDevi.jpg')} 
            style={styles.templeImage}
            resizeMode="cover"
          />
          <Text style={styles.p}>
            {isHindi ? translations.content.unique.vaishnoDevi.description.hi : translations.content.unique.vaishnoDevi.description.en}
          </Text>
        </View>

        {/* Significance */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['significance'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.significance.title.hi : translations.content.significance.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.learning.title.hi : translations.content.significance.learning.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.learning.description.hi : translations.content.significance.learning.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.economic.title.hi : translations.content.significance.economic.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.economic.description.hi : translations.content.significance.economic.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.significance.architectural.title.hi : translations.content.significance.architectural.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.significance.architectural.description.hi : translations.content.significance.architectural.description.en}
          </Text>
        </View>

        {/* Pilgrimage */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['pilgrimage'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.pilgrimage.title.hi : translations.content.pilgrimage.title.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.pilgrimage.traditional.title.hi : translations.content.pilgrimage.traditional.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.pilgrimage.traditional.description.hi : translations.content.pilgrimage.traditional.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.pilgrimage.modern.title.hi : translations.content.pilgrimage.modern.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.pilgrimage.modern.description.hi : translations.content.pilgrimage.modern.description.en}
          </Text>
          <Text style={styles.h3}>
            {isHindi ? translations.content.pilgrimage.environmental.title.hi : translations.content.pilgrimage.environmental.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.pilgrimage.environmental.description.hi : translations.content.pilgrimage.environmental.description.en}
          </Text>
        </View>

        {/* Conclusion */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>
            {isHindi ? translations.content.conclusion.title.hi : translations.content.conclusion.title.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.paragraph1.hi : translations.content.conclusion.paragraph1.en}
          </Text>
          <Text style={styles.p}>
            {isHindi ? translations.content.conclusion.paragraph2.hi : translations.content.conclusion.paragraph2.en}
          </Text>
        </View>

        {/* References */}
        <View style={styles.card} onLayout={(e) => (sectionY.current['references'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>References</Text>
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
  templeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  halfImage: {
    width: '48%',
    height: 150,
    borderRadius: 10,
  },
});