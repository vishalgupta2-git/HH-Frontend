import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Linking, TextInput, Dimensions, Animated } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const options = { headerShown: false };

function DhamsScreen() {
  const { isHindi, currentLanguage } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});
  const [searchHighlight, setSearchHighlight] = useState('');

  // Helper function to get translation
  const getTranslation = (key: any) => {
    const lang = currentLanguage === 'hindi' ? 'hi' : 
                 currentLanguage === 'bangla' ? 'bangla' : 
                 currentLanguage === 'kannada' ? 'kannada' :
                 currentLanguage === 'punjabi' ? 'punjabi' :
                 currentLanguage === 'tamil' ? 'tamil' :
                 currentLanguage === 'telugu' ? 'telugu' : 'en';
    return key[lang] || key.en;
  };

  const translations = {
    sections: {
      intro: { 
        en: 'Introduction to Hindu Dhams', 
        hi: 'हिंदू धामों का परिचय',
        bangla: 'হিন্দু ধামের পরিচয়',
        kannada: 'ಹಿಂದೂ ಧಾಮಗಳ ಪರಿಚಯ',
        punjabi: 'ਹਿੰਦੂ ਧਾਮਾਂ ਦਾ ਪਰਿਚਯ',
        tamil: 'இந்து தாம்களின் அறிமுகம்',
        telugu: 'హిందూ ధామ్ల పరిచయం'
      },
      charDham: { 
        en: 'Char Dham - The Four Sacred Abodes', 
        hi: 'चार धाम - चार पवित्र निवास',
        bangla: 'চার ধাম - চার পবিত্র আবাস',
        kannada: 'ಚಾರ್ ಧಾಮ - ನಾಲ್ಕು ಪವಿತ್ರ ನಿವಾಸಗಳು',
        punjabi: 'ਚਾਰ ਧਾਮ - ਚਾਰ ਪਵਿੱਤਰ ਨਿਵਾਸ',
        tamil: 'சார் தாம் - நான்கு புனித இருப்பிடங்கள்',
        telugu: 'చార్ ధామ్ - నాలుగు పవిత్ర నివాసాలు'
      },
      chhotaCharDham: { 
        en: 'Chhota Char Dham - Sacred Himalayan Circuit', 
        hi: 'छोटा चार धाम - पवित्र हिमालयी सर्किट',
        bangla: 'ছোট চার ধাম - পবিত্র হিমালয় সাক্ষাৎ',
        kannada: 'ಚೋಟಾ ಚಾರ್ ಧಾಮ - ಪವಿತ್ರ ಹಿಮಾಲಯ ಸರ್ಕ್ಯೂಟ್',
        punjabi: 'ਛੋਟਾ ਚਾਰ ਧਾਮ - ਪਵਿੱਤਰ ਹਿਮਾਲਿਆ ਸਰਕਟ',
        tamil: 'சோட்டா சார் தாம் - புனித இமாலய சுற்று',
        telugu: 'చోటా చార్ ధామ్ - పవిత్ర హిమాలయ సర్క్యూట్'
      },
      saptaPuri: { 
        en: 'Sapta Puri - Seven Holy Cities', 
        hi: 'सप्त पुरी - सात पवित्र नगर',
        bangla: 'সপ্ত পুরী - সাত পবিত্র নগর',
        kannada: 'ಸಪ್ತ ಪುರಿ - ಏಳು ಪವಿತ್ರ ನಗರಗಳು',
        punjabi: 'ਸਪਤ ਪੁਰੀ - ਸੱਤ ਪਵਿੱਤਰ ਸ਼ਹਿਰ',
        tamil: 'சப்த புரி - ஏழு புனித நகரங்கள்',
        telugu: 'సప్త పురి - ఏడు పవిత్ర నగరాలు'
      },
      jyotirlingas: { 
        en: 'Jyotirlingas - Twelve Sacred Shrines of Shiva', 
        hi: 'ज्योतिर्लिंग - शिव के बारह पवित्र मंदिर',
        bangla: 'জ্যোতির্লিঙ্গ - শিবের বারো পবিত্র মন্দির',
        kannada: 'ಜ್ಯೋತಿರ್ಲಿಂಗಗಳು - ಶಿವನ ಹನ್ನೆರಡು ಪವಿತ್ರ ದೇವಾಲಯಗಳು',
        punjabi: 'ਜੌਤਿਰਲਿੰਗ - ਸ਼ਿਵ ਦੇ ਬਾਰਾਂ ਪਵਿੱਤਰ ਮੰਦਰ',
        tamil: 'ஜோதிர்லிங்கங்கள் - சிவனின் பன்னிரண்டு புனித கோவில்கள்',
        telugu: 'జ్యోతిర్లింగాలు - శివుని పన్నెండు పవిత్ర దేవాలయాలు'
      },
      shaktiPeethas: { 
        en: 'Shakti Peethas - Sacred Shrines of Divine Mother', 
        hi: 'शक्ति पीठ - दिव्य माता के पवित्र मंदिर',
        bangla: 'শক্তি পীঠ - দিব্য মাতার পবিত্র মন্দির',
        kannada: 'ಶಕ್ತಿ ಪೀಠಗಳು - ದಿವ್ಯ ಮಾತೃದ ಪವಿತ್ರ ದೇವಾಲಯಗಳು',
        punjabi: 'ਸ਼ਕਤੀ ਪੀਠ - ਦਿਵਿਆ ਮਾਤਾ ਦੇ ਪਵਿੱਤਰ ਮੰਦਰ',
        tamil: 'சக்தி பீடங்கள் - தெய்வீக தாயின் புனித கோவில்கள்',
        telugu: 'శక్తి పీఠాలు - దివ్య మాత యొక్క పవిత్ర దేవాలయాలు'
      },
      significance: { 
        en: 'Spiritual Significance of Dhams', 
        hi: 'धामों का आध्यात्मिक महत्व',
        bangla: 'ধামের আধ্যাত্মিক তাৎপর্য',
        kannada: 'ಧಾಮಗಳ ಆಧ್ಯಾತ್ಮಿಕ ಮಹತ್ವ',
        punjabi: 'ਧਾਮਾਂ ਦਾ ਆਧਿਆਤਮਿਕ ਮਹੱਤਵ',
        tamil: 'தாம்களின் ஆன்மீக முக்கியத்துவம்',
        telugu: 'ధామ్ల ఆధ్యాత్మిక ప్రాముఖ్యత'
      },
      conclusion: { 
        en: 'Conclusion', 
        hi: 'निष्कर्ष',
        bangla: 'উপসংহার',
        kannada: 'ತೀರ್ಮಾನ',
        punjabi: 'ਨਿਰਣਾ',
        tamil: 'முடிவுரை',
        telugu: 'ముగింపు'
      }
    }
  };

  // TODO: Add your section content function here
  const getSectionContent = (key: string): string => {
    switch (key) {
      // Add your cases here
      // Example:
      case 'intro':
        return getTranslation({
          en: 'In Hinduism, Dham means a divine place of residence where God or Goddess manifests for devotees. Visiting these Dhams is considered a path to Moksha (liberation). India has multiple sacred pilgrimage circuits, the most famous being the Char Dham, Chhota Char Dham, Sapta Puri, Jyotirlingas, and Shakti Peethas.',
          hi: 'हिंदू धर्म में, धाम का अर्थ है एक दिव्य निवास स्थान जहाँ भगवान या देवी भक्तों के लिए प्रकट होते हैं। इन धामों की यात्रा को मोक्ष (मुक्ति) का मार्ग माना जाता है। भारत में कई पवित्र तीर्थ सर्किट हैं, जिनमें सबसे प्रसिद्ध चार धाम, छोटा चार धाम, सप्त पुरी, ज्योतिर्लिंग और शक्ति पीठ हैं।',
          bangla: 'হিন্দুধর্মে, ধাম মানে একটি দিব্য বাসস্থান যেখানে ভগবান বা দেবী ভক্তদের জন্য প্রকাশিত হন। এই ধামগুলিতে যাওয়াকে মোক্ষ (মুক্তি) এর পথ হিসাবে বিবেচনা করা হয়। ভারতের একাধিক পবিত্র তীর্থ সাক্ষাৎ রয়েছে, যার মধ্যে সবচেয়ে বিখ্যাত চার ধাম, ছোট চার ধাম, সপ্ত পুরী, জ্যোতির্লিঙ্গ এবং শক্তি পীঠ।',
          kannada: 'ಹಿಂದೂ ಧರ್ಮದಲ್ಲಿ, ಧಾಮ ಎಂದರೆ ದೇವರು ಅಥವಾ ದೇವಿ ಭಕ್ತರಿಗಾಗಿ ಪ್ರಕಟವಾಗುವ ದಿವ್ಯ ನಿವಾಸ ಸ್ಥಳ. ಈ ಧಾಮಗಳನ್ನು ಭೇಟಿ ಮಾಡುವುದು ಮೋಕ್ಷ (ವಿಮುಕ್ತಿ) ದ ಮಾರ್ಗವೆಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. ಭಾರತದಲ್ಲಿ ಅನೇಕ ಪವಿತ್ರ ತೀರ್ಥ ಸರ್ಕ್ಯೂಟ್ಗಳಿವೆ, ಅತ್ಯಂತ ಪ್ರಸಿದ್ಧವಾದವು ಚಾರ್ ಧಾಮ, ಚೋಟಾ ಚಾರ್ ಧಾಮ, ಸಪ್ತ ಪುರಿ, ಜ್ಯೋತಿರ್ಲಿಂಗಗಳು ಮತ್ತು ಶಕ್ತಿ ಪೀಠಗಳು.',
          punjabi: 'ਹਿੰਦੂ ਧਰਮ ਵਿੱਚ, ਧਾਮ ਦਾ ਮਤਲਬ ਇੱਕ ਦਿਵਿਆ ਨਿਵਾਸ ਸਥਾਨ ਹੈ ਜਿੱਥੇ ਭਗਵਾਨ ਜਾਂ ਦੇਵੀ ਭਗਤਾਂ ਲਈ ਪ੍ਰਗਟ ਹੁੰਦੇ ਹਨ। ਇਨ੍ਹਾਂ ਧਾਮਾਂ ਦਾ ਦੌਰਾ ਕਰਨਾ ਮੋਕਸ਼ (ਮੁਕਤੀ) ਦਾ ਰਸਤਾ ਮੰਨਿਆ ਜਾਂਦਾ ਹੈ। ਭਾਰਤ ਵਿੱਚ ਕਈ ਪਵਿੱਤਰ ਤੀਰਥ ਸਰਕਟ ਹਨ, ਸਭ ਤੋਂ ਮਸ਼ਹੂਰ ਚਾਰ ਧਾਮ, ਛੋਟਾ ਚਾਰ ਧਾਮ, ਸਪਤ ਪੁਰੀ, ਜੌਤਿਰਲਿੰਗ ਅਤੇ ਸ਼ਕਤੀ ਪੀਠ ਹਨ।',
          tamil: 'இந்து மதத்தில், தாம் என்றால் கடவுள் அல்லது தெய்வம் பக்தர்களுக்காக வெளிப்படும் ஒரு தெய்வீக வாழிடம். இந்த தாம்களை வழிபடுவது மோட்சம் (விடுதலை) வழியாக கருதப்படுகிறது. இந்தியாவில் பல புனித தீர்த்த சுற்றுகள் உள்ளன, அவற்றில் மிகவும் பிரபலமானவை சார் தாம், சோட்டா சார் தாம், சப்த புரி, ஜோதிர்லிங்கங்கள் மற்றும் சக்தி பீடங்கள்।',
          telugu: 'హిందూ మతంలో, ధామ్ అంటే భగవంతుడు లేదా దేవత భక్తుల కోసం అవతరించే దివ్య నివాస స్థలం. ఈ ధామ్లను సందర్శించడం మోక్షం (విముక్తి) యొక్క మార్గంగా పరిగణిస్తారు. భారతదేశంలో అనేక పవిత్ర తీర్థ సర్క్యూట్లు ఉన్నాయి, అత్యంత ప్రసిద్ధమైనవి చార్ ధామ్, చోటా చార్ ధామ్, సప్త పురి, జ్యోతిర్లింగాలు మరియు శక్తి పీఠాలు.'
        });
      case 'charDham':
        return getTranslation({
          en: 'The Char Dham (Badrinath, Dwarka, Puri, Rameshwaram) were established by Adi Shankaracharya as the four sacred corners of India. Pilgrimage to all four symbolizes spiritual completeness – Vishnu (Badrinath), Krishna (Dwarka), Jagannath (Puri), and Shiva (Rameshwaram).',
          hi: 'चार धाम (बद्रीनाथ, द्वारका, पुरी, रामेश्वरम) आदि शंकराचार्य द्वारा भारत के चार पवित्र कोनों के रूप में स्थापित किए गए थे। सभी चारों की यात्रा आध्यात्मिक पूर्णता का प्रतीक है – विष्णु (बद्रीनाथ), कृष्ण (द्वारका), जगन्नाथ (पुरी), और शिव (रामेश्वरम)।',
          bangla: 'চার ধাম (বদ্রীনাথ, দ্বারকা, পুরী, রামেশ্বরম) আদি শঙ্করাচার্য কর্তৃক ভারতের চারটি পবিত্র কোণ হিসাবে প্রতিষ্ঠিত হয়েছিল। চারটিরই তীর্থযাত্রা আধ্যাত্মিক সম্পূর্ণতার প্রতীক – বিষ্ণু (বদ্রীনাথ), কৃষ্ণ (দ্বারকা), জগন্নাথ (পুরী), এবং শিব (রামেশ্বরম)।',
          kannada: 'ಚಾರ್ ಧಾಮ (ಬದ್ರಿನಾಥ, ದ್ವಾರಕ, ಪುರಿ, ರಾಮೇಶ್ವರ) ಅನ್ನು ಆದಿ ಶಂಕರಾಚಾರ್ಯರು ಭಾರತದ ನಾಲ್ಕು ಪವಿತ್ರ ಮೂಲೆಗಳಾಗಿ ಸ್ಥಾಪಿಸಿದರು। ನಾಲ್ಕರಲ್ಲೂ ತೀರ್ಥಯಾತ್ರೆ ಆಧ್ಯಾತ್ಮಿಕ ಪೂರ್ಣತೆಯ ಸಂಕೇತ – ವಿಷ್ಣು (ಬದ್ರಿನಾಥ), ಕೃಷ್ಣ (ದ್ವಾರಕ), ಜಗನ್ನಾಥ (ಪುರಿ), ಮತ್ತು ಶಿವ (ರಾಮೇಶ್ವರ).',
          punjabi: 'ਚਾਰ ਧਾਮ (ਬਦਰੀਨਾਥ, ਦਵਾਰਕਾ, ਪੁਰੀ, ਰਾਮੇਸ਼ਵਰਮ) ਆਦਿ ਸ਼ੰਕਰਾਚਾਰਿਆ ਦੁਆਰਾ ਭਾਰਤ ਦੇ ਚਾਰ ਪਵਿੱਤਰ ਕੋਨਿਆਂ ਵਜੋਂ ਸਥਾਪਿਤ ਕੀਤੇ ਗਏ ਸਨ। ਚਾਰਾਂ ਦੀ ਯਾਤਰਾ ਆਧਿਆਤਮਿਕ ਪੂਰਨਤਾ ਦਾ ਪ੍ਰਤੀਕ ਹੈ – ਵਿਸ਼ਨੂੰ (ਬਦਰੀਨਾਥ), ਕ੍ਰਿਸ਼ਨ (ਦਵਾਰਕਾ), ਜਗਨਨਾਥ (ਪੁਰੀ), ਅਤੇ ਸ਼ਿਵ (ਰਾਮੇਸ਼ਵਰਮ)।',
          tamil: 'சார் தாம் (பத்ரிநாத், துவாரகா, புரி, ராமேஸ்வரம்) ஆதி சங்கராச்சாரியரால் இந்தியாவின் நான்கு புனித மூலைகளாக நிறுவப்பட்டன। நான்கின் யாத்திரையும் ஆன்மீக முழுமையின் சின்னம் – விஷ்ணு (பத்ரிநாத்), கிருஷ்ணன் (துவாரகா), ஜகந்நாத் (புரி), மற்றும் சிவன் (ராமேஸ்வரம்)।',
          telugu: 'చార్ ధామ్ (బద్రినాథ్, ద్వారక, పురి, రామేశ్వరం) ఆది శంకరాచార్యులచే భారతదేశం యొక్క నాలుగు పవిత్ర మూలలుగా స్థాపించబడ్డాయి. నలుగుటి యాత్ర ఆధ్యాత్మిక సంపూర్ణతకు చిహ్నం – విష్ణు (బద్రినాథ్), కృష్ణ (ద్వారక), జగన్నాథ్ (పురి), మరియు శివ (రామేశ్వరం).'
        });
      case 'chhotaCharDham':
        return getTranslation({
          en: 'In Uttarakhand\'s Himalayas, the Chhota Char Dham (Yamunotri, Gangotri, Kedarnath, Badrinath) represent sacred rivers and deities. Devotees undertake this yatra to purify body and soul, with rivers Yamuna and Ganga being lifelines of India.',
          hi: 'उत्तराखंड के हिमालय में, छोटा चार धाम (यमुनोत्री, गंगोत्री, केदारनाथ, बद्रीनाथ) पवित्र नदियों और देवताओं का प्रतिनिधित्व करते हैं। भक्त शरीर और आत्मा को शुद्ध करने के लिए इस यात्रा पर निकलते हैं, यमुना और गंगा नदियाँ भारत की जीवनरेखा हैं।',
          bangla: 'উত্তরাখণ্ডের হিমালয়ে, ছোট চার ধাম (যমুনোত্রী, গঙ্গোত্রী, কেদারনাথ, বদ্রীনাথ) পবিত্র নদী এবং দেবতাদের প্রতিনিধিত্ব করে। ভক্তরা শরীর এবং আত্মাকে শুদ্ধ করার জন্য এই যাত্রা শুরু করেন, যমুনা এবং গঙ্গা নদী ভারতের জীবনরেখা।',
          kannada: 'ಉತ್ತರಾಖಂಡದ ಹಿಮಾಲಯದಲ್ಲಿ, ಚೋಟಾ ಚಾರ್ ಧಾಮ (ಯಮುನೋತ್ರಿ, ಗಂಗೋತ್ರಿ, ಕೇದಾರನಾಥ, ಬದ್ರಿನಾಥ) ಪವಿತ್ರ ನದಿಗಳು ಮತ್ತು ದೇವತೆಗಳನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತವೆ. ಭಕ್ತರು ದೇಹ ಮತ್ತು ಆತ್ಮವನ್ನು ಶುದ್ಧೀಕರಿಸಲು ಈ ಯಾತ್ರೆಯನ್ನು ಕೈಗೊಳ್ಳುತ್ತಾರೆ, ಯಮುನಾ ಮತ್ತು ಗಂಗಾ ನದಿಗಳು ಭಾರತದ ಜೀವನ ರೇಖೆಗಳು.',
          punjabi: 'ਉੱਤਰਾਖੰਡ ਦੇ ਹਿਮਾਲਿਆ ਵਿੱਚ, ਛੋਟਾ ਚਾਰ ਧਾਮ (ਯਮੁਨੋਤਰੀ, ਗੰਗੋਤਰੀ, ਕੇਦਾਰਨਾਥ, ਬਦਰੀਨਾਥ) ਪਵਿੱਤਰ ਨਦੀਆਂ ਅਤੇ ਦੇਵਤਿਆਂ ਦਾ ਪ੍ਰਤੀਨਿਧਤਵ ਕਰਦੇ ਹਨ। ਭਗਤ ਸਰੀਰ ਅਤੇ ਆਤਮਾ ਨੂੰ ਸ਼ੁੱਧ ਕਰਨ ਲਈ ਇਸ ਯਾਤਰਾ \'ਤੇ ਜਾਂਦੇ ਹਨ, ਯਮੁਨਾ ਅਤੇ ਗੰਗਾ ਨਦੀਆਂ ਭਾਰਤ ਦੀਆਂ ਜੀਵਨ ਰੇਖਾਵਾਂ ਹਨ।',
          tamil: 'உத்தராகண்டின் இமாலயத்தில், சோட்டா சார் தாம் (யமுனோத்ரி, கங்கோத்ரி, கேதார்நாத், பத்ரிநாத்) புனித நதிகள் மற்றும் தெய்வங்களை பிரதிபலிக்கின்றன. பக்தர்கள் உடல் மற்றும் ஆன்மாவை சுத்தப்படுத்த இந்த யாத்திரையை மேற்கொள்கிறார்கள், யமுநா மற்றும் கங்கை நதிகள் இந்தியாவின் வாழ்க்கைக் கோடுகள்.',
          telugu: 'ఉత్తరాఖండ్ యొక్క హిమాలయాలలో, చోటా చార్ ధామ్ (యమునోత్రి, గంగోత్రి, కేదార్నాథ్, బద్రినాథ్) పవిత్ర నదులు మరియు దేవతలను ప్రతిబింబిస్తాయి. భక్తులు శరీరం మరియు ఆత్మను శుద్ధీకరించడానికి ఈ యాత్రను చేపట్టుతారు, యమున మరియు గంగా నదులు భారతదేశం యొక్క జీవన రేఖలు.'
        });
      case 'saptaPuri':
        return getTranslation({
          en: 'The seven holy cities – Ayodhya, Mathura, Haridwar, Kashi, Kanchipuram, Ujjain, and Dwarka – are believed to grant liberation. Each is linked with an avatar: Rama (Ayodhya), Krishna (Mathura/Dwarka), Shiva (Kashi/Ujjain), Devi (Kanchipuram), and Ganga (Haridwar).',
          hi: 'सात पवित्र नगर – अयोध्या, मथुरा, हरिद्वार, काशी, कांचीपुरम, उज्जैन, और द्वारका – मुक्ति प्रदान करने वाले माने जाते हैं। प्रत्येक एक अवतार से जुड़ा है: राम (अयोध्या), कृष्ण (मथुरा/द्वारका), शिव (काशी/उज्जैन), देवी (कांचीपुरम), और गंगा (हरिद्वार)।',
          bangla: 'সাত পবিত্র নগর – অযোধ্যা, মথুরা, হরিদ্বার, কাশী, কাঞ্চীপুরম, উজ্জয়িনী, এবং দ্বারকা – মুক্তি প্রদানকারী বলে বিশ্বাস করা হয়। প্রতিটি একটি অবতারের সাথে যুক্ত: রাম (অযোধ্যা), কৃষ্ণ (মথুরা/দ্বারকা), শিব (কাশী/উজ্জয়িনী), দেবী (কাঞ্চীপুরম), এবং গঙ্গা (হরিদ্বার)।',
          kannada: 'ಏಳು ಪವಿತ್ರ ನಗರಗಳು – ಅಯೋಧ್ಯೆ, ಮಥುರೆ, ಹರಿದ್ವಾರ, ಕಾಶಿ, ಕಾಂಚೀಪುರಂ, ಉಜ್ಜಯಿನಿ, ಮತ್ತು ದ್ವಾರಕ – ಮುಕ್ತಿಯನ್ನು ನೀಡುವವೆಂದು ನಂಬಲಾಗಿದೆ. ಪ್ರತಿಯೊಂದೂ ಒಂದು ಅವತಾರದೊಂದಿಗೆ ಸಂಬಂಧಿಸಿದೆ: ರಾಮ (ಅಯೋಧ್ಯೆ), ಕೃಷ್ಣ (ಮಥುರೆ/ದ್ವಾರಕ), ಶಿವ (ಕಾಶಿ/ಉಜ್ಜಯಿನಿ), ದೇವಿ (ಕಾಂಚೀಪುರಂ), ಮತ್ತು ಗಂಗಾ (ಹರಿದ್ವಾರ).',
          punjabi: 'ਸੱਤ ਪਵਿੱਤਰ ਸ਼ਹਿਰ – ਅਯੋਧਿਆ, ਮਥੁਰਾ, ਹਰਿਦਵਾਰ, ਕਾਸ਼ੀ, ਕਾਂਚੀਪੁਰਮ, ਉਜੈਨ, ਅਤੇ ਦਵਾਰਕਾ – ਮੁਕਤੀ ਦੇਣ ਵਾਲੇ ਮੰਨੇ ਜਾਂਦੇ ਹਨ। ਹਰ ਇੱਕ ਇੱਕ ਅਵਤਾਰ ਨਾਲ ਜੁੜਿਆ ਹੈ: ਰਾਮ (ਅਯੋਧਿਆ), ਕ੍ਰਿਸ਼ਨ (ਮਥੁਰਾ/ਦਵਾਰਕਾ), ਸ਼ਿਵ (ਕਾਸ਼ੀ/ਉਜੈਨ), ਦੇਵੀ (ਕਾਂਚੀਪੁਰਮ), ਅਤੇ ਗੰਗਾ (ਹਰਿਦਵਾਰ)।',
          tamil: 'ஏழு புனித நகரங்கள் – அயோத்தி, மதுரா, ஹரித்வார், காசி, காஞ்சிபுரம், உஜ்ஜைன், மற்றும் துவாரகா – விடுதலை வழங்குவதாக நம்பப்படுகிறது. ஒவ்வொன்றும் ஒரு அவதாரத்துடன் இணைக்கப்பட்டுள்ளது: ராமன் (அயோத்தி), கிருஷ்ணன் (மதுரா/துவாரகா), சிவன் (காசி/உஜ்ஜைன்), தேவி (காஞ்சிபுரம்), மற்றும் கங்கை (ஹரித்வார்)।',
          telugu: 'ఏడు పవిత్ర నగరాలు – అయోధ్య, మథుర, హరిద్వార్, కాశీ, కాంచీపురం, ఉజ్జయిని, మరియు ద్వారక – ముక్తిని ప్రసాదించేవిగా నమ్ముతారు. ప్రతి ఒక్కటి ఒక అవతారంతో అనుబంధించబడి ఉంది: రామ (అయోధ్య), కృష్ణ (మథుర/ద్వారక), శివ (కాశీ/ఉజ్జయిని), దేవి (కాంచీపురం), మరియు గంగ (హరిద్వార్).'
        });
      case 'jyotirlingas':
        return getTranslation({
          en: 'There are 12 Jyotirlingas across India, each a manifestation of Lord Shiva\'s infinite light. Among them, Kedarnath, Kashi Vishwanath, Mahakaleshwar, Rameshwaram overlap with the Dhams, showing Shiva\'s central role in pilgrimage.',
          hi: 'भारत भर में 12 ज्योतिर्लिंग हैं, प्रत्येक भगवान शिव के अनंत प्रकाश की अभिव्यक्ति है। इनमें से केदारनाथ, काशी विश्वनाथ, महाकालेश्वर, रामेश्वरम धामों के साथ मेल खाते हैं, जो तीर्थयात्रा में शिव की केंद्रीय भूमिका दिखाते हैं।',
          bangla: 'ভারত জুড়ে ১২টি জ্যোতির্লিঙ্গ রয়েছে, প্রতিটি ভগবান শিবের অসীম আলোর প্রকাশ। এর মধ্যে কেদারনাথ, কাশী বিশ্বনাথ, মহাকালেশ্বর, রামেশ্বরম ধামের সাথে মিলে যায়, যা তীর্থযাত্রায় শিবের কেন্দ্রীয় ভূমিকা দেখায়।',
          kannada: 'ಭಾರತದಾದ್ಯಂತ 12 ಜ್ಯೋತಿರ್ಲಿಂಗಗಳಿವೆ, ಪ್ರತಿಯೊಂದೂ ಭಗವಾನ್ ಶಿವನ ಅನಂತ ಬೆಳಕಿನ ಅಭಿವ್ಯಕ್ತಿ. ಇವುಗಳಲ್ಲಿ ಕೇದಾರನಾಥ, ಕಾಶಿ ವಿಶ್ವನಾಥ, ಮಹಾಕಾಲೇಶ್ವರ, ರಾಮೇಶ್ವರ ಧಾಮಗಳೊಂದಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ, ತೀರ್ಥಯಾತ್ರೆಯಲ್ಲಿ ಶಿವನ ಕೇಂದ್ರೀಯ ಪಾತ್ರವನ್ನು ತೋರಿಸುತ್ತವೆ.',
          punjabi: 'ਭਾਰਤ ਭਰ ਵਿੱਚ 12 ਜੌਤਿਰਲਿੰਗ ਹਨ, ਹਰ ਇੱਕ ਭਗਵਾਨ ਸ਼ਿਵ ਦੇ ਅਨੰਤ ਪ੍ਰਕਾਸ਼ ਦਾ ਪ੍ਰਗਟਾਵਾ ਹੈ। ਇਨ੍ਹਾਂ ਵਿੱਚੋਂ ਕੇਦਾਰਨਾਥ, ਕਾਸ਼ੀ ਵਿਸ਼ਵਨਾਥ, ਮਹਾਕਾਲੇਸ਼ਵਰ, ਰਾਮੇਸ਼ਵਰਮ ਧਾਮਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਹਨ, ਜੋ ਤੀਰਥਯਾਤਰਾ ਵਿੱਚ ਸ਼ਿਵ ਦੀ ਕੇਂਦਰੀ ਭੂਮਿਕਾ ਦਿਖਾਉਂਦੇ ਹਨ।',
          tamil: 'இந்தியா முழுவதும் 12 ஜோதிர்லிங்கங்கள் உள்ளன, ஒவ்வொன்றும் சிவனின் முடிவிலா ஒளியின் வெளிப்பாடு. இவற்றில் கேதார்நாத், காசி விஸ்வநாத், மகாகாலேஸ்வர், ராமேஸ்வரம் தாம்களுடன் ஒத்துப்போகின்றன, இது தீர்த்தயாத்திரையில் சிவனின் மைய பாத்திரத்தைக் காட்டுகிறது.',
          telugu: 'భారతదేశం అంతటా 12 జ్యోతిర్లింగాలు ఉన్నాయి, ప్రతి ఒక్కటి భగవాన్ శివుని అనంత కాంతి యొక్క అభివ్యక్తి. వీటిలో కేదార్నాథ్, కాశీ విశ్వనాథ్, మహాకాలేశ్వర్, రామేశ్వరం ధామ్లతో ఏకీభవిస్తాయి, తీర్థయాత్రలో శివుని కేంద్ర పాత్రను చూపిస్తాయి.'
        });
      case 'shaktiPeethas':
        return getTranslation({
          en: 'Associated with Goddess Shakti, these shrines are where body parts of Sati fell during Shiva\'s grief-stricken tandava. They are spread across India, Nepal, and Bangladesh.',
          hi: 'देवी शक्ति से जुड़े, ये मंदिर वे स्थान हैं जहाँ शिव के दुःख से भरे तांडव के दौरान सती के शरीर के अंग गिरे थे। ये भारत, नेपाल और बांग्लादेश में फैले हुए हैं।',
          bangla: 'দেবী শক্তির সাথে যুক্ত, এই মন্দিরগুলি সেই স্থান যেখানে শিবের দুঃখে কাতর তাণ্ডবের সময় সতীর দেহের অঙ্গগুলি পড়েছিল। এগুলি ভারত, নেপাল এবং বাংলাদেশে ছড়িয়ে আছে।',
          kannada: 'ದೇವಿ ಶಕ್ತಿಯೊಂದಿಗೆ ಸಂಬಂಧಿಸಿದ, ಈ ದೇವಾಲಯಗಳು ಶಿವನ ದುಃಖದಿಂದ ಕೂಡಿದ ತಾಂಡವದ ಸಮಯದಲ್ಲಿ ಸತಿಯ ದೇಹದ ಭಾಗಗಳು ಬಿದ್ದ ಸ್ಥಳಗಳು. ಇವು ಭಾರತ, ನೇಪಾಳ ಮತ್ತು ಬಾಂಗ್ಲಾದೇಶದಾದ್ಯಂತ ಹರಡಿವೆ.',
          punjabi: 'ਦੇਵੀ ਸ਼ਕਤੀ ਨਾਲ ਜੁੜੇ, ਇਹ ਮੰਦਰ ਉਹ ਸਥਾਨ ਹਨ ਜਿੱਥੇ ਸ਼ਿਵ ਦੇ ਦੁੱਖ ਭਰੇ ਤਾਂਡਵ ਦੇ ਦੌਰਾਨ ਸਤੀ ਦੇ ਸਰੀਰ ਦੇ ਅੰਗ ਡਿੱਗੇ ਸਨ। ਇਹ ਭਾਰਤ, ਨੇਪਾਲ ਅਤੇ ਬੰਗਲਾਦੇਸ਼ ਵਿੱਚ ਫੈਲੇ ਹੋਏ ਹਨ।',
          tamil: 'தேவி சக்தியுடன் தொடர்புடைய, இந்த கோவில்கள் சிவனின் துக்கத்தால் நிறைந்த தாண்டவத்தின் போது சதியின் உடல் பாகங்கள் விழுந்த இடங்கள். இவை இந்தியா, நேபாளம் மற்றும் வங்காளதேசம் முழுவதும் பரவியுள்ளன.',
          telugu: 'దేవి శక్తితో అనుబంధించబడిన, ఈ దేవాలయాలు శివుని దుఃఖంతో నిండిన తాండవ సమయంలో సతి యొక్క శరీర భాగాలు పడిన స్థలాలు. ఇవి భారతదేశం, నేపాల్ మరియు బంగ్లాదేశ్ అంతటా వ్యాపించి ఉన్నాయి.'
        });
      case 'significance':
        return getTranslation({
          en: 'Together, these Dhams form the backbone of Hindu pilgrimage traditions. They connect geography with mythology, devotion with liberation, and unite diverse sects of Hinduism under the journey of faith.',
          hi: 'मिलकर, ये धाम हिंदू तीर्थयात्रा परंपराओं की रीढ़ बनाते हैं। वे भूगोल को पौराणिक कथाओं से, भक्ति को मुक्ति से जोड़ते हैं, और विश्वास की यात्रा के तहत हिंदू धर्म के विविध संप्रदायों को एकजुट करते हैं।',
          bangla: 'একসাথে, এই ধামগুলি হিন্দু তীর্থযাত্রা ঐতিহ্যের মেরুদণ্ড গঠন করে। এগুলি ভূগোলকে পুরাণের সাথে, ভক্তিকে মুক্তির সাথে সংযুক্ত করে, এবং বিশ্বাসের যাত্রার অধীনে হিন্দুধর্মের বিভিন্ন সম্প্রদায়কে একত্রিত করে।',
          kannada: 'ಒಟ್ಟಿಗೆ, ಈ ಧಾಮಗಳು ಹಿಂದೂ ತೀರ್ಥಯಾತ್ರಾ ಸಂಪ್ರದಾಯಗಳ ಬೆನ್ನೆಲುಬನ್ನು ರೂಪಿಸುತ್ತವೆ. ಅವು ಭೂಗೋಳವನ್ನು ಪುರಾಣಗಳೊಂದಿಗೆ, ಭಕ್ತಿಯನ್ನು ಮುಕ್ತಿಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತವೆ, ಮತ್ತು ನಂಬಿಕೆಯ ಪ್ರಯಾಣದ ಅಡಿಯಲ್ಲಿ ಹಿಂದೂ ಧರ್ಮದ ವಿವಿಧ ಪಂಥಗಳನ್ನು ಒಗ್ಗೂಡಿಸುತ್ತವೆ.',
          punjabi: 'ਮਿਲ ਕੇ, ਇਹ ਧਾਮ ਹਿੰਦੂ ਤੀਰਥਯਾਤਰਾ ਪਰੰਪਰਾਵਾਂ ਦੀ ਰੀੜ੍ਹ ਦੀ ਹੱਡੀ ਬਣਾਉਂਦੇ ਹਨ। ਇਹ ਭੂਗੋਲ ਨੂੰ ਪੁਰਾਣਾਂ ਨਾਲ, ਭਗਤੀ ਨੂੰ ਮੁਕਤੀ ਨਾਲ ਜੋੜਦੇ ਹਨ, ਅਤੇ ਵਿਸ਼ਵਾਸ ਦੀ ਯਾਤਰਾ ਦੇ ਅਧੀਨ ਹਿੰਦੂ ਧਰਮ ਦੇ ਵੱਖ-ਵੱਖ ਸੰਪ੍ਰਦਾਵਾਂ ਨੂੰ ਇਕਜੁੱਟ ਕਰਦੇ ਹਨ।',
          tamil: 'ஒன்றாக, இந்த தாம்கள் இந்து தீர்த்தயாத்திரை மரபுகளின் முதுகெலும்பை உருவாக்குகின்றன. அவை புவியியலை புராணங்களுடன், பக்தியை விடுதலையுடன் இணைக்கின்றன, மற்றும் நம்பிக்கையின் பயணத்தின் கீழ் இந்து மதத்தின் பல்வேறு பிரிவுகளை ஒன்றிணைக்கின்றன.',
          telugu: 'కలిసి, ఈ ధామ్లు హిందూ తీర్థయాత్ర సంప్రదాయాల వెన్నుపూసను ఏర్పరుస్తాయి. అవి భౌగోళికాన్ని పురాణాలతో, భక్తిని ముక్తితో కలుపుతాయి, మరియు విశ్వాస యాత్ర క్రింద హిందూ మతం యొక్క వివిధ శాఖలను ఏకం చేస్తాయి.'
        });
      case 'conclusion':
        return getTranslation({
          en: 'These sacred pilgrimage sites continue to inspire millions of devotees worldwide, offering spiritual transformation and divine connection through the timeless journey of faith.',
          hi: 'ये पवित्र तीर्थ स्थल दुनिया भर के लाखों भक्तों को प्रेरित करते रहते हैं, विश्वास की कालातीत यात्रा के माध्यम से आध्यात्मिक परिवर्तन और दिव्य संबंध प्रदान करते हैं।',
          bangla: 'এই পবিত্র তীর্থ স্থানগুলি বিশ্বব্যাপী লক্ষ লক্ষ ভক্তদের অনুপ্রাণিত করতে থাকে, বিশ্বাসের চিরন্তন যাত্রার মাধ্যমে আধ্যাত্মিক রূপান্তর এবং দিব্য সংযোগ প্রদান করে।',
          kannada: 'ಈ ಪವಿತ್ರ ತೀರ್ಥ ಸ್ಥಳಗಳು ವಿಶ್ವಾದ್ಯಂತ ಮಿಲಿಯನ್ ಭಕ್ತರನ್ನು ಪ್ರೇರೇಪಿಸುತ್ತಲೇ ಇರುತ್ತವೆ, ನಂಬಿಕೆಯ ಕಾಲಾತೀತ ಪ್ರಯಾಣದ ಮೂಲಕ ಆಧ್ಯಾತ್ಮಿಕ ರೂಪಾಂತರ ಮತ್ತು ದಿವ್ಯ ಸಂಪರ್ಕವನ್ನು ನೀಡುತ್ತವೆ.',
          punjabi: 'ਇਹ ਪਵਿੱਤਰ ਤੀਰਥ ਸਥਾਨ ਦੁਨੀਆ ਭਰ ਦੇ ਲੱਖਾਂ ਭਗਤਾਂ ਨੂੰ ਪ੍ਰੇਰਿਤ ਕਰਦੇ ਰਹਿੰਦੇ ਹਨ, ਵਿਸ਼ਵਾਸ ਦੀ ਕਾਲਾਤੀਤ ਯਾਤਰਾ ਦੇ ਮਾਧਿਅਮ ਰਾਹੀਂ ਆਧਿਆਤਮਿਕ ਪਰਿਵਰਤਨ ਅਤੇ ਦਿਵਿਆ ਜੁੜਾਅ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।',
          tamil: 'இந்த புனித தீர்த்த இடங்கள் உலகெங்கிலும் உள்ள மில்லியன் கணக்கான பக்தர்களை ஊக்குவிக்கத் தொடர்கின்றன, நம்பிக்கையின் காலமற்ற பயணத்தின் மூலம் ஆன்மீக மாற்றம் மற்றும் தெய்வீக இணைப்பை வழங்குகின்றன.',
          telugu: 'ఈ పవిత్ర తీర్థ స్థలాలు ప్రపంచవ్యాప్తంగా మిలియన్ల మంది భక్తులను ప్రేరేపిస్తూనే ఉంటాయి, విశ్వాసం యొక్క కాలాతీత యాత్ర ద్వారా ఆధ్యాత్మిక రూపాంతరం మరియు దివ్య సంబంధాన్ని అందిస్తాయి.'
        });
      default:
        return 'Content will be added here...';
    }
  };

  const sections = [
    { key: 'intro', title: getTranslation(translations.sections.intro) },
    { key: 'charDham', title: getTranslation(translations.sections.charDham) },
    { key: 'chhotaCharDham', title: getTranslation(translations.sections.chhotaCharDham) },
    { key: 'saptaPuri', title: getTranslation(translations.sections.saptaPuri) },
    { key: 'jyotirlingas', title: getTranslation(translations.sections.jyotirlingas) },
    { key: 'shaktiPeethas', title: getTranslation(translations.sections.shaktiPeethas) },
    { key: 'significance', title: getTranslation(translations.sections.significance) },
    { key: 'conclusion', title: getTranslation(translations.sections.conclusion) },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(getTranslation({ en: 'Topic', hi: 'विषय', bangla: 'বিষয়', kannada: 'ವಿಷಯ', punjabi: 'ਵਿਸ਼ਾ', tamil: 'தலைப்பு', telugu: 'విషయం' }));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Flower animation states
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [flowers, setFlowers] = useState<Array<{
    id: string;
    type: string;
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rotation: number;
  }>>([]);

  const handleSelect = (key: string) => {
    setDropdownOpen(false);
    const y = sectionY.current[key] ?? 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
      setDropdownLabel(getTranslation({ en: 'Topic', hi: 'विषय', bangla: 'বিষয়', kannada: 'ವಿಷಯ', punjabi: 'ਵਿਸ਼ਾ', tamil: 'தலைப்பு', telugu: 'విషయం' }));
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      setCurrentResultIndex(-1);
      return;
    }

    const results: Array<{section: string, text: string, index: number, sectionKey: string}> = [];
    
    sections.forEach((section, sectionIndex) => {
      const content = getSectionContent(section.key);
      if (content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            section: section.title,
          text: content,
          index: sectionIndex,
            sectionKey: section.key
          });
      }
    });

    setSearchResults(results);
    setShowSearchResults(true);
    setCurrentResultIndex(0);
  };

  const handlePreviousResult = () => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1);
    }
  };

  const handleNextResult = () => {
    if (currentResultIndex < searchResults.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setCurrentResultIndex(-1);
  };

  const references: Array<{ id: number; url: string }> = [
    { id: 1, url: 'https://en.wikipedia.org/wiki/Char_Dham' },
    { id: 2, url: 'https://en.wikipedia.org/wiki/Chota_Char_Dham' },
    { id: 3, url: 'https://en.wikipedia.org/wiki/Sapta_Puri' },
    { id: 4, url: 'https://en.wikipedia.org/wiki/Jyotirlinga' },
    { id: 5, url: 'https://en.wikipedia.org/wiki/Shakti_Pitha' },
    { id: 6, url: 'https://www.badrinath-kedarnath.gov.in/' },
    { id: 7, url: 'https://www.dwarkadhish.org/' },
    { id: 8, url: 'https://www.jagannath.nic.in/' },
    { id: 9, url: 'https://www.rameshwaram.org/' },
    { id: 10, url: 'https://www.vaishnodevi.org/' }
  ];

  return (
    <View style={styles.root}>
      <HomeHeader
        showDailyPujaButton={false}
        searchPlaceholder={getTranslation({ 
          en: 'Search for Dhams', 
          hi: 'धाम खोजें', 
          bangla: 'ধাম অনুসন্ধান করুন', 
          kannada: 'ಧಾಮಗಳನ್ನು ಹುಡುಕಿ', 
          punjabi: 'ਧਾਮ ਖੋਜੋ', 
          tamil: 'தாம்களைத் தேடுங்கள்', 
          telugu: 'ధామ్లను వెతకండి' 
        })}
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
                placeholder={getTranslation({ 
                  en: 'Search through Dhams content...', 
                  hi: 'धाम सामग्री में खोजें...',
                  bangla: 'ধাম বিষয়বস্তুতে অনুসন্ধান করুন...',
                  kannada: 'ಧಾಮ ವಿಷಯದಲ್ಲಿ ಹುಡುಕಿ...',
                  punjabi: 'ਧਾਮ ਸਮੱਗਰੀ ਵਿੱਚ ਖੋਜੋ...',
                  tamil: 'தாம் உள்ளடக்கத்தில் தேடுங்கள்...',
                  telugu: 'ధామ్ విషయంలో వెతకండి...'
                })}
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
          </>
        }
      />

      {/* Main Content */}
              <ScrollView 
          ref={scrollRef} 
        style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              {getTranslation({ 
                en: 'Search Results', 
                hi: 'खोज परिणाम', 
                bangla: 'অনুসন্ধান ফলাফল', 
                kannada: 'ಹುಡುಕುವ ಫಲಿತಾಂಶಗಳು', 
                punjabi: 'ਖੋਜ ਨਤੀਜੇ', 
                tamil: 'தேடல் முடிவுகள்', 
                telugu: 'వెతుకుట ఫలితాలు' 
              })}
          </Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.searchResultItem,
                  index === currentResultIndex && styles.searchResultItemActive
                ]}
                onPress={() => {
                  setCurrentResultIndex(index);
                  const y = sectionY.current[result.sectionKey] ?? 0;
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
                }}
              >
                <Text style={styles.searchResultSection}>{result.section}</Text>
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {result.text}
          </Text>
              </TouchableOpacity>
            ))}
        </View>
        )}

        {/* Sections */}
        {sections.map((section, index) => (
          <View
            key={section.key}
            ref={(ref) => {
              if (ref) {
                ref.measure((x, y, width, height, pageX, pageY) => {
                  sectionY.current[section.key] = pageY;
                });
              }
            }}
            style={styles.sectionTile}
          >
            <View style={styles.tileHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.sectionContent}>
                {getSectionContent(section.key)}
              </Text>
            </View>
          </View>
        ))}

        {/* References Section */}
        {references.length > 0 && (
          <View style={styles.referencesSection}>
            <Text style={styles.referencesTitle}>
              {getTranslation({ 
                en: 'References', 
                hi: 'संदर्भ',
                bangla: 'তথ্যসূত্র',
                kannada: 'ಉಲ್ಲೇಖಗಳು',
                punjabi: 'ਹਵਾਲੇ',
                tamil: 'குறிப்புகள்',
                telugu: 'సూచనలు'
              })}
          </Text>
            <Text style={styles.referencesContent}>
              {getTranslation({ 
                en: 'References and further reading materials for the sacred pilgrimage sites and their spiritual significance.', 
                hi: 'पवित्र तीर्थ स्थलों और उनके आध्यात्मिक महत्व के लिए संदर्भ और आगे की पढ़ाई सामग्री।', 
                bangla: 'পবিত্র তীর্থ স্থান এবং তাদের আধ্যাত্মিক তাৎপর্যের জন্য তথ্যসূত্র এবং আরও পড়ার উপকরণ।', 
                kannada: 'ಪವಿತ್ರ ತೀರ್ಥ ಸ್ಥಳಗಳು ಮತ್ತು ಅವುಗಳ ಆಧ್ಯಾತ್ಮಿಕ ಮಹತ್ವಕ್ಕಾಗಿ ಉಲ್ಲೇಖಗಳು ಮತ್ತು ಮುಂದಿನ ಓದುವ ಸಾಮಗ್ರಿಗಳು।', 
                punjabi: 'ਪਵਿੱਤਰ ਤੀਰਥ ਸਥਾਨਾਂ ਅਤੇ ਉਹਨਾਂ ਦੇ ਆਧਿਆਤਮਿਕ ਮਹੱਤਵ ਲਈ ਹਵਾਲੇ ਅਤੇ ਹੋਰ ਪੜ੍ਹਾਈ ਸਮੱਗਰੀ।', 
                tamil: 'புனித தீர்த்த இடங்கள் மற்றும் அவற்றின் ஆன்மீக முக்கியத்துவத்திற்கான குறிப்புகள் மற்றும் மேலும் படிப்பதற்கான பொருட்கள்।', 
                telugu: 'పవిత్ర తీర్థ స్థలాలు మరియు వాటి ఆధ్యాత్మిక ప్రాముఖ్యతకు సూచనలు మరియు మరింత చదవడానికి సామగ్రి।' 
              })}
          </Text>
            <View style={styles.referencesList}>
              {references.map((ref) => (
                <TouchableOpacity
                  key={ref.id}
                  style={styles.referenceItem}
                  onPress={() => Linking.openURL(ref.url)}
                >
                  <Text style={styles.referenceText}>{ref.url}</Text>
                </TouchableOpacity>
              ))}
        </View>
        </View>
        )}

        {/* Empty State */}
        {sections.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {getTranslation({ 
                en: 'Content Coming Soon', 
                hi: 'सामग्री जल्द आ रही है',
                bangla: 'বিষয়বস্তু শীঘ্রই আসছে',
                kannada: 'ವಿಷಯವು ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತದೆ',
                punjabi: 'ਸਮੱਗਰੀ ਜਲਦੀ ਆ ਰਹੀ ਹੈ',
                tamil: 'உள்ளடக்கம் விரைவில் வருகிறது',
                telugu: 'విషయం త్వరలో వస్తోంది'
              })}
          </Text>
            <Text style={styles.emptyStateText}>
              {getTranslation({ 
                en: 'We are working on adding comprehensive information about sacred pilgrimage sites. Please check back soon!', 
                hi: 'हम पवित्र तीर्थ स्थलों के बारे में व्यापक जानकारी जोड़ने पर काम कर रहे हैं। कृपया जल्द ही वापस जांचें!',
                bangla: 'আমরা পবিত্র তীর্থ স্থান সম্পর্কে বিস্তৃত তথ্য যোগ করার কাজ করছি। দয়া করে শীঘ্রই আবার চেক করুন!',
                kannada: 'ನಾವು ಪವಿತ್ರ ತೀರ್ಥ ಸ್ಥಳಗಳ ಬಗ್ಗೆ ಸಮಗ್ರ ಮಾಹಿತಿಯನ್ನು ಸೇರಿಸುವ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇವೆ। ದಯವಿಟ್ಟು ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ!',
                punjabi: 'ਅਸੀਂ ਪਵਿੱਤਰ ਤੀਰਥ ਸਥਾਨਾਂ ਬਾਰੇ ਵਿਆਪਕ ਜਾਣਕਾਰੀ ਸ਼ਾਮਲ ਕਰਨ \'ਤੇ ਕੰਮ ਕਰ ਰਹੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਜਲਦੀ ਹੀ ਵਾਪਸ ਜਾਂਚ ਕਰੋ!',
                tamil: 'புனித தீர்த்த இடங்கள் பற்றிய விரிவான தகவல்களைச் சேர்ப்பதில் நாங்கள் வேலை செய்து கொண்டிருக்கிறோம். தயவுசெய்து விரைவில் மீண்டும் சரிபாருங்கள்!',
                telugu: 'మేము పవిత్ర తీర్థ స్థలాల గురించి సమగ్ర సమాచారాన్ని జోడించడంపై పని చేస్తున్నాము. దయచేసి త్వరలో తిరిగి తనిఖీ చేయండి!'
              })}
          </Text>
        </View>
        )}
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {getTranslation({ 
                en: 'Select Topic', 
                hi: 'विषय चुनें', 
                bangla: 'বিষয় নির্বাচন করুন', 
                kannada: 'ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ', 
                punjabi: 'ਵਿਸ਼ਾ ਚੁਣੋ', 
                tamil: 'தலைப்பைத் தேர்ந்தெடுக்கவும்', 
                telugu: 'విషయాన్ని ఎంచుకోండి' 
              })}
            </Text>
            <ScrollView style={styles.dropdownList}>
              {sections.map((section) => (
                <TouchableOpacity
                  key={section.key}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(section.key)}
                >
                  <Text style={styles.dropdownItemText}>{section.title}</Text>
                </TouchableOpacity>
              ))}
      </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTile: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tileHeader: {
    backgroundColor: '#FFF8F0', // Light saffron background
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5D9',
  },
  tileContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35', // Saffron color
    textAlign: 'center',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'justify',
  },
  referencesSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  referencesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35', // Saffron color
    marginBottom: 15,
    textAlign: 'center',
  },
  referencesContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'justify',
    marginBottom: 20,
  },
  referencesList: {
    gap: 10,
  },
  referenceItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  referenceText: {
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, // Less rounded - reduced from 25
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
  searchNavigationInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  resultsCount: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  navButtonInline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navButtonTextInline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownTrigger: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  searchResultsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchResultItemActive: {
    backgroundColor: '#e3f2fd',
  },
  searchResultSection: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DhamsScreen;