import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import HighlightedText from '@/components/Home/HighlightedText';
import { useLanguage } from '@/contexts/LanguageContext';

export default function YatraScreen() {
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
    searchPlaceholder: { 
      en: 'Search for Yatra', 
      hi: 'यात्रा की खोज करें',
      bangla: 'যাত্রা অনুসন্ধান করুন',
      kannada: 'ಯಾತ್ರೆಯನ್ನು ಹುಡುಕಿ',
      punjabi: 'ਯਾਤਰਾ ਖੋਜੋ',
      tamil: 'யாத்திரையைத் தேடுங்கள்',
      telugu: 'యాత్రను వెతకండి'
    },
    searchContentPlaceholder: { 
      en: 'Search through Yatra content...', 
      hi: 'यात्रा सामग्री में खोजें...',
      bangla: 'যাত্রা বিষয়বস্তুতে অনুসন্ধান করুন...',
      kannada: 'ಯಾತ್ರೆ ವಿಷಯದಲ್ಲಿ ಹುಡುಕಿ...',
      punjabi: 'ਯਾਤਰਾ ਸਮੱਗਰੀ ਵਿੱਚ ਖੋਜੋ...',
      tamil: 'யாத்திரை உள்ளடக்கத்தில் தேடுங்கள்...',
      telugu: 'యాత్ర విషయంలో వెతకండి...'
    },
    topic: { 
      en: 'Topic', 
      hi: 'विषय',
      bangla: 'বিষয়',
      kannada: 'ವಿಷಯ',
      punjabi: 'ਵਿਸ਼ਾ',
      tamil: 'தலைப்பு',
      telugu: 'విషయం'
    },
    cancel: { 
      en: 'Cancel', 
      hi: 'रद्द करें',
      bangla: 'বাতিল করুন',
      kannada: 'ರದ್ದುಗೊಳಿಸಿ',
      punjabi: 'ਰੱਦ ਕਰੋ',
      tamil: 'ரத்து செய்',
      telugu: 'రద్దు చేయండి'
    },
    sections: {
      intro: { 
        en: 'Introduction', 
        hi: 'परिचय',
        bangla: 'ভূমিকা',
        kannada: 'ಪರಿಚಯ',
        punjabi: 'ਪਰਿਚਯ',
        tamil: 'அறிமுகம்',
        telugu: 'పరిచయం'
      },
      pilgrimage: { 
        en: 'Pilgrimage Traditions', 
        hi: 'तीर्थयात्रा परंपराएं',
        bangla: 'তীর্থযাত্রা ঐতিহ্য',
        kannada: 'ತೀರ್ಥಯಾತ್ರೆ ಸಂಪ್ರದಾಯಗಳು',
        punjabi: 'ਤੀਰਥਯਾਤਰਾ ਪਰੰਪਰਾਵਾਂ',
        tamil: 'தீர்த்தயாத்திரை பாரம்பரியங்கள்',
        telugu: 'తీర్థయాత్ర సంప్రదాయాలు'
      },
      sacred: { 
        en: 'Sacred Sites', 
        hi: 'पवित्र स्थल',
        bangla: 'পবিত্র স্থান',
        kannada: 'ಪವಿತ್ರ ಸ್ಥಳಗಳು',
        punjabi: 'ਪਵਿੱਤਰ ਸਥਾਨ',
        tamil: 'புனித இடங்கள்',
        telugu: 'పవిత్ర స్థలాలు'
      },
      spiritual: { 
        en: 'Spiritual Journey', 
        hi: 'आध्यात्मिक यात्रा',
        bangla: 'আধ্যাত্মিক যাত্রা',
        kannada: 'ಆಧ್ಯಾತ್ಮಿಕ ಯಾತ್ರೆ',
        punjabi: 'ਆਧਿਆਤਮਿਕ ਯਾਤਰਾ',
        tamil: 'ஆன்மீக யாத்திரை',
        telugu: 'ఆధ్యాత్మిక యాత్ర'
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
    },
    content: {
      title: { 
        en: 'Yatra: The Sacred Journey of Spiritual Pilgrimage', 
        hi: 'यात्रा: आध्यात्मिक तीर्थयात्रा की पवित्र यात्रा',
        bangla: 'যাত্রা: আধ্যাত্মিক তীর্থযাত্রার পবিত্র যাত্রা',
        kannada: 'ಯಾತ್ರೆ: ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಯಾತ್ರೆಯ ಪವಿತ್ರ ಪ್ರಯಾಣ',
        punjabi: 'ਯਾਤਰਾ: ਆਧਿਆਤਮਿਕ ਤੀਰਥਯਾਤਰਾ ਦੀ ਪਵਿੱਤਰ ਯਾਤਰਾ',
        tamil: 'யாத்திரை: ஆன்மீக தீர்த்தயாத்திரையின் புனித பயணம்',
        telugu: 'యాత్ర: ఆధ్యాత్మిక తీర్థయాత్ర యొక్క పవిత్ర ప్రయాణం'
      },
      intro: { 
        en: 'Yatra represents the sacred journey of spiritual pilgrimage in Hinduism. These journeys connect devotees to divine energy centers and sacred sites, allowing them to experience spiritual transformation through physical travel and ritual observance.', 
        hi: 'यात्रा हिंदू धर्म में आध्यात्मिक तीर्थयात्रा की पवित्र यात्रा का प्रतिनिधित्व करती है। ये यात्राएं भक्तों को दिव्य ऊर्जा केंद्रों और पवित्र स्थलों से जोड़ती हैं, जिससे वे शारीरिक यात्रा और अनुष्ठानिक पालन के माध्यम से आध्यात्मिक परिवर्तन का अनुभव कर सकते हैं।',
        bangla: 'যাত্রা হিন্দুধর্মে আধ্যাত্মিক তীর্থযাত্রার পবিত্র যাত্রার প্রতিনিধিত্ব করে। এই যাত্রাগুলি ভক্তদের দিব্য শক্তি কেন্দ্র এবং পবিত্র স্থানের সাথে সংযুক্ত করে, তাদের শারীরিক ভ্রমণ এবং আচার-অনুষ্ঠানের মাধ্যমে আধ্যাত্মিক রূপান্তর অনুভব করতে দেয়।',
        kannada: 'ಯಾತ್ರೆ ಹಿಂದೂ ಧರ್ಮದಲ್ಲಿ ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಯಾತ್ರೆಯ ಪವಿತ್ರ ಪ್ರಯಾಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ। ಈ ಪ್ರಯಾಣಗಳು ಭಕ್ತರನ್ನು ದಿವ್ಯ ಶಕ್ತಿ ಕೇಂದ್ರಗಳು ಮತ್ತು ಪವಿತ್ರ ಸ್ಥಳಗಳಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತವೆ, ಅವರಿಗೆ ಶಾರೀರಿಕ ಪ್ರಯಾಣ ಮತ್ತು ಆಚರಣಾತ್ಮಕ ಪಾಲನೆಯ ಮೂಲಕ ಆಧ್ಯಾತ್ಮಿಕ ರೂಪಾಂತರವನ್ನು ಅನುಭವಿಸಲು ಅನುವು ಮಾಡಿಕೊಡುತ್ತವೆ।',
        punjabi: 'ਯਾਤਰਾ ਹਿੰਦੂ ਧਰਮ ਵਿੱਚ ਆਧਿਆਤਮਿਕ ਤੀਰਥਯਾਤਰਾ ਦੀ ਪਵਿੱਤਰ ਯਾਤਰਾ ਦਾ ਪ੍ਰਤੀਨਿਧਤਵ ਕਰਦੀ ਹੈ। ਇਹ ਯਾਤਰਾਵਾਂ ਭਗਤਾਂ ਨੂੰ ਦਿਵਿਆ ਊਰਜਾ ਕੇਂਦਰਾਂ ਅਤੇ ਪਵਿੱਤਰ ਸਥਾਨਾਂ ਨਾਲ ਜੋੜਦੀਆਂ ਹਨ, ਜਿਸ ਨਾਲ ਉਹ ਸਰੀਰਕ ਯਾਤਰਾ ਅਤੇ ਰੀਤੀ-ਰਿਵਾਜਾਂ ਦੇ ਪਾਲਣ ਦੇ ਮਾਧਿਅਮ ਨਾਲ ਆਧਿਆਤਮਿਕ ਪਰਿਵਰਤਨ ਦਾ ਅਨੁਭਵ ਕਰ ਸਕਦੇ ਹਨ।',
        tamil: 'யாத்திரை இந்து மதத்தில் ஆன்மீக தீர்த்தயாத்திரையின் புனித பயணத்தைக் குறிக்கிறது। இந்த பயணங்கள் பக்தர்களை தெய்வீக ஆற்றல் மையங்கள் மற்றும் புனித இடங்களுடன் இணைக்கின்றன, அவர்கள் உடல் பயணம் மற்றும் சடங்கு கடைபிடிப்பு மூலம் ஆன்மீக மாற்றத்தை அனுபவிக்க அனுமதிக்கின்றன।',
        telugu: 'యాత్ర హిందూ మతంలో ఆధ్యాత్మిక తీర్థయాత్ర యొక్క పవిత్ర ప్రయాణాన్ని సూచిస్తుంది। ఈ ప్రయాణాలు భక్తులను దివ్య శక్తి కేంద్రాలు మరియు పవిత్ర స్థలాలతో కలుపుతాయి, వారు శారీరక ప్రయాణం మరియు ఆచార పాటన ద్వారా ఆధ్యాత్మిక రూపాంతరాన్ని అనుభవించడానికి అనుమతిస్తాయి।'
      },
      pilgrimage: { 
        en: 'Pilgrimage traditions in Hinduism date back thousands of years and continue to be a vital part of spiritual practice for millions of devotees worldwide. The concept of yatra encompasses both physical journeys to sacred sites and the inner spiritual journey of the soul.', 
        hi: 'हिंदू धर्म में तीर्थयात्रा परंपराएं हजारों वर्ष पुरानी हैं और दुनिया भर के लाखों भक्तों के लिए आध्यात्मिक अभ्यास का एक महत्वपूर्ण हिस्सा बनी हुई हैं। यात्रा की अवधारणा में पवित्र स्थलों की शारीरिक यात्राएं और आत्मा की आंतरिक आध्यात्मिक यात्रा दोनों शामिल हैं।',
        bangla: 'হিন্দুধর্মে তীর্থযাত্রার ঐতিহ্য হাজার হাজার বছর পুরানো এবং বিশ্বব্যাপী লক্ষ লক্ষ ভক্তের জন্য আধ্যাত্মিক অনুশীলনের একটি গুরুত্বপূর্ণ অংশ হয়ে রয়েছে। যাত্রার ধারণায় পবিত্র স্থানের শারীরিক যাত্রা এবং আত্মার অভ্যন্তরীণ আধ্যাত্মিক যাত্রা উভয়ই অন্তর্ভুক্ত।',
        kannada: 'ಹಿಂದೂ ಧರ್ಮದಲ್ಲಿ ತೀರ್ಥಯಾತ್ರೆಯ ಸಂಪ್ರದಾಯಗಳು ಸಾವಿರಾರು ವರ್ಷಗಳಷ್ಟು ಹಳೆಯದು ಮತ್ತು ಪ್ರಪಂಚದಾದ್ಯಂತ ಮಿಲಿಯನ್ ಭಕ್ತರಿಗೆ ಆಧ್ಯಾತ್ಮಿಕ ಅಭ್ಯಾಸದ ಪ್ರಮುಖ ಭಾಗವಾಗಿ ಮುಂದುವರಿದಿದೆ। ಯಾತ್ರೆಯ ಪರಿಕಲ್ಪನೆಯು ಪವಿತ್ರ ಸ್ಥಳಗಳಿಗೆ ಶಾರೀರಿಕ ಪ್ರಯಾಣಗಳು ಮತ್ತು ಆತ್ಮದ ಆಂತರಿಕ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣ ಎರಡನ್ನೂ ಒಳಗೊಂಡಿದೆ।',
        punjabi: 'ਹਿੰਦੂ ਧਰਮ ਵਿੱਚ ਤੀਰਥਯਾਤਰਾ ਦੀਆਂ ਪਰੰਪਰਾਵਾਂ ਹਜ਼ਾਰਾਂ ਸਾਲ ਪੁਰਾਣੀਆਂ ਹਨ ਅਤੇ ਦੁਨੀਆ ਭਰ ਦੇ ਲੱਖਾਂ ਭਗਤਾਂ ਲਈ ਆਧਿਆਤਮਿਕ ਅਭਿਆਸ ਦਾ ਇੱਕ ਮਹੱਤਵਪੂਰਨ ਹਿੱਸਾ ਬਣੀਆਂ ਹੋਈਆਂ ਹਨ। ਯਾਤਰਾ ਦੀ ਧਾਰਣਾ ਵਿੱਚ ਪਵਿੱਤਰ ਸਥਾਨਾਂ ਦੀਆਂ ਸਰੀਰਕ ਯਾਤਰਾਵਾਂ ਅਤੇ ਆਤਮਾ ਦੀ ਅੰਦਰੂਨੀ ਆਧਿਆਤਮਿਕ ਯਾਤਰਾ ਦੋਵੇਂ ਸ਼ਾਮਲ ਹਨ।',
        tamil: 'இந்து மதத்தில் தீர்த்தயாத்திரை பாரம்பரியங்கள் ஆயிரக்கணக்கான ஆண்டுகள் பழமையானவை மற்றும் உலகெங்கிலும் உள்ள மில்லியன் கணக்கான பக்தர்களுக்கு ஆன்மீக பயிற்சியின் முக்கியமான பகுதியாகத் தொடர்கிறது। யாத்திரையின் கருத்து புனித இடங்களுக்கான உடல் பயணங்கள் மற்றும் ஆன்மாவின் உள் ஆன்மீக பயணம் ஆகிய இரண்டையும் உள்ளடக்கியது।',
        telugu: 'హిందూ మతంలో తీర్థయాత్ర సంప్రదాయాలు వేలాది సంవత్సరాల పురాతనమైనవి మరియు ప్రపంచవ్యాప్తంగా మిలియన్ల మంది భక్తులకు ఆధ్యాత్మిక అభ్యాసం యొక్క ముఖ్యమైన భాగంగా కొనసాగుతున్నాయి। యాత్ర యొక్క భావన పవిత్ర స్థలాలకు శారీరక ప్రయాణాలు మరియు ఆత్మ యొక్క అంతర్గత ఆధ్యాత్మిక ప్రయాణం రెండింటినీ కలిగి ఉంటుంది।'
      },
      sacred: { 
        en: 'Sacred sites serve as important centers for spiritual practice and cultural preservation. These destinations maintain ancient traditions and knowledge, offering devotees a direct connection to divine energy and spiritual wisdom.', 
        hi: 'पवित्र स्थल आध्यात्मिक अभ्यास और सांस्कृतिक संरक्षण के महत्वपूर्ण केंद्र के रूप में कार्य करते हैं। ये गंतव्य प्राचीन परंपराओं और ज्ञान को बनाए रखते हैं, भक्तों को दिव्य ऊर्जा और आध्यात्मिक ज्ञान से सीधा संबंध प्रदान करते हैं।',
        bangla: 'পবিত্র স্থানগুলি আধ্যাত্মিক অনুশীলন এবং সাংস্কৃতিক সংরক্ষণের গুরুত্বপূর্ণ কেন্দ্র হিসাবে কাজ করে। এই গন্তব্যগুলি প্রাচীন ঐতিহ্য এবং জ্ঞান বজায় রাখে, ভক্তদের দিব্য শক্তি এবং আধ্যাত্মিক জ্ঞানের সাথে সরাসরি সংযোগ প্রদান করে।',
        kannada: 'ಪವಿತ್ರ ಸ್ಥಳಗಳು ಆಧ್ಯಾತ್ಮಿಕ ಅಭ್ಯಾಸ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಸಂರಕ್ಷಣೆಗೆ ಮುಖ್ಯ ಕೇಂದ್ರಗಳಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ। ಈ ಗಮ್ಯಸ್ಥಾನಗಳು ಪ್ರಾಚೀನ ಸಂಪ್ರದಾಯಗಳು ಮತ್ತು ಜ್ಞಾನವನ್ನು ನಿರ್ವಹಿಸುತ್ತವೆ, ಭಕ್ತರಿಗೆ ದಿವ್ಯ ಶಕ್ತಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನದೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕವನ್ನು ನೀಡುತ್ತವೆ।',
        punjabi: 'ਪਵਿੱਤਰ ਸਥਾਨ ਆਧਿਆਤਮਿਕ ਅਭਿਆਸ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਸੰਭਾਲ ਲਈ ਮਹੱਤਵਪੂਰਨ ਕੇਂਦਰਾਂ ਵਜੋਂ ਕੰਮ ਕਰਦੇ ਹਨ। ਇਹ ਗੰਤਵਯ ਪ੍ਰਾਚੀਨ ਪਰੰਪਰਾਵਾਂ ਅਤੇ ਗਿਆਨ ਨੂੰ ਬਣਾਈ ਰੱਖਦੇ ਹਨ, ਭਗਤਾਂ ਨੂੰ ਦਿਵਿਆ ਊਰਜਾ ਅਤੇ ਆਧਿਆਤਮਿਕ ਗਿਆਨ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।',
        tamil: 'புனித இடங்கள் ஆன்மீக பயிற்சி மற்றும் கலாச்சார பாதுகாப்புக்கான முக்கியமான மையங்களாக செயல்படுகின்றன। இந்த இலக்குகள் பண்டைய பாரம்பரியங்கள் மற்றும் அறிவை பராமரிக்கின்றன, பக்தர்களுக்கு தெய்வீக ஆற்றல் மற்றும் ஆன்மீக ஞானத்துடன் நேரடி இணைப்பை வழங்குகின்றன।',
        telugu: 'పవిత్ర స్థలాలు ఆధ్యాత్మిక అభ్యాసం మరియు సాంస్కృతిక సంరక్షణకు ముఖ్యమైన కేంద్రాలుగా పనిచేస్తాయి। ఈ గమ్యస్థానాలు ప్రాచీన సంప్రదాయాలు మరియు జ్ఞానాన్ని నిర్వహిస్తాయి, భక్తులకు దివ్య శక్తి మరియు ఆధ్యాత్మిక జ్ఞానంతో నేరుగా కనెక్షన్ అందిస్తాయి।'
      },
      spiritual: { 
        en: 'The spiritual significance of pilgrimage extends beyond mere physical travel, representing the inner journey of the soul toward divine realization. Each step of the yatra is a step closer to spiritual enlightenment and self-realization.', 
        hi: 'तीर्थयात्रा का आध्यात्मिक महत्व केवल शारीरिक यात्रा से आगे बढ़कर, दिव्य साक्षात्कार की ओर आत्मा की आंतरिक यात्रा का प्रतिनिधित्व करता है। यात्रा का हर कदम आध्यात्मिक ज्ञानोदय और आत्म-साक्षात्कार के करीब एक कदम है।',
        bangla: 'তীর্থযাত্রার আধ্যাত্মিক তাৎপর্য কেবল শারীরিক ভ্রমণের বাইরে প্রসারিত, দিব্য উপলব্ধির দিকে আত্মার অভ্যন্তরীণ যাত্রার প্রতিনিধিত্ব করে। যাত্রার প্রতিটি পদক্ষেপ আধ্যাত্মিক জ্ঞানোদয় এবং আত্ম-উপলব্ধির দিকে আরও এক ধাপ এগিয়ে।',
        kannada: 'ತೀರ್ಥಯಾತ್ರೆಯ ಆಧ್ಯಾತ್ಮಿಕ ಮಹತ್ವವು ಕೇವಲ ಶಾರೀರಿಕ ಪ್ರಯಾಣದಿಂದ ಮೀರಿ, ದಿವ್ಯ ಸಾಕ್ಷಾತ್ಕಾರದ ಕಡೆಗೆ ಆತ್ಮದ ಆಂತರಿಕ ಪ್ರಯಾಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ। ಯಾತ್ರೆಯ ಪ್ರತಿ ಹೆಜ್ಜೆಯು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನೋದಯ ಮತ್ತು ಆತ್ಮ-ಸಾಕ್ಷಾತ್ಕಾರಕ್ಕೆ ಹತ್ತಿರವಾದ ಒಂದು ಹೆಜ್ಜೆ।',
        punjabi: 'ਤੀਰਥਯਾਤਰਾ ਦਾ ਆਧਿਆਤਮਿਕ ਮਹੱਤਵ ਸਿਰਫ ਸਰੀਰਕ ਯਾਤਰਾ ਤੋਂ ਪਰੇ ਜਾ ਕੇ, ਦਿਵਿਆ ਸਾਕਸ਼ਾਤਕਾਰ ਵੱਲ ਆਤਮਾ ਦੀ ਅੰਦਰੂਨੀ ਯਾਤਰਾ ਦਾ ਪ੍ਰਤੀਨਿਧਤਵ ਕਰਦਾ ਹੈ। ਯਾਤਰਾ ਦਾ ਹਰ ਕਦਮ ਆਧਿਆਤਮਿਕ ਗਿਆਨੋਦਯ ਅਤੇ ਆਤਮ-ਸਾਕਸ਼ਾਤਕਾਰ ਦੇ ਨੇੜੇ ਇੱਕ ਕਦਮ ਹੈ।',
        tamil: 'தீர்த்தயாத்திரையின் ஆன்மீக முக்கியத்துவம் உடல் பயணத்தைத் தாண்டி நீண்டு, தெய்வீக உணர்வுக்கு ஆன்மாவின் உள் பயணத்தைக் குறிக்கிறது। யாத்திரையின் ஒவ்வொரு அடியும் ஆன்மீக ஞானோதயம் மற்றும் தன்னை உணர்தலுக்கு நெருக்கமான ஒரு அடி।',
        telugu: 'తీర్థయాత్ర యొక్క ఆధ్యాత్మిక ప్రాముఖ్యత కేవలం శారీరక ప్రయాణానికి మించి, దివ్య సాక్షాత్కారం వైపు ఆత్మ యొక్క అంతర్గత ప్రయాణాన్ని సూచిస్తుంది। యాత్ర యొక్క ప్రతి అడుగు ఆధ్యాత్మిక జ్ఞానోదయం మరియు ఆత్మ-సాక్షాత్కారానికి దగ్గరగా ఒక అడుగు।'
      },
      conclusion: { 
        en: 'Yatra remains a fundamental aspect of Hindu spiritual practice, offering devotees a path to spiritual growth and divine connection. Through these sacred journeys, individuals can experience the transformative power of spiritual pilgrimage and deepen their connection to the divine.', 
        hi: 'यात्रा हिंदू आध्यात्मिक अभ्यास का एक मौलिक पहलू बनी हुई है, जो भक्तों को आध्यात्मिक विकास और दिव्य संबंध का मार्ग प्रदान करती है। इन पवित्र यात्राओं के माध्यम से, व्यक्ति आध्यात्मिक तीर्थयात्रा की परिवर्तनकारी शक्ति का अनुभव कर सकते हैं और दिव्य के साथ अपने संबंध को गहरा कर सकते हैं।',
        bangla: 'যাত্রা হিন্দু আধ্যাত্মিক অনুশীলনের একটি মৌলিক দিক হিসাবে রয়ে গেছে, ভক্তদের আধ্যাত্মিক বৃদ্ধি এবং দিব্য সংযোগের পথ প্রদান করে। এই পবিত্র যাত্রার মাধ্যমে, ব্যক্তিরা আধ্যাত্মিক তীর্থযাত্রার রূপান্তরকারী শক্তির অভিজ্ঞতা লাভ করতে পারে এবং দিব্যের সাথে তাদের সংযোগকে গভীর করতে পারে।',
        kannada: 'ಯಾತ್ರೆ ಹಿಂದೂ ಆಧ್ಯಾತ್ಮಿಕ ಅಭ್ಯಾಸದ ಮೂಲಭೂತ ಅಂಶವಾಗಿ ಉಳಿದಿದೆ, ಭಕ್ತರಿಗೆ ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ದಿವ್ಯ ಸಂಪರ್ಕದ ಮಾರ್ಗವನ್ನು ನೀಡುತ್ತದೆ। ಈ ಪವಿತ್ರ ಪ್ರಯಾಣಗಳ ಮೂಲಕ, ವ್ಯಕ್ತಿಗಳು ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಯಾತ್ರೆಯ ರೂಪಾಂತರಕಾರಿ ಶಕ್ತಿಯನ್ನು ಅನುಭವಿಸಬಹುದು ಮತ್ತು ದಿವ್ಯದೊಂದಿಗೆ ತಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಆಳವಾಗಿಸಬಹುದು।',
        punjabi: 'ਯਾਤਰਾ ਹਿੰਦੂ ਆਧਿਆਤਮਿਕ ਅਭਿਆਸ ਦਾ ਇੱਕ ਮੂਲ ਪਹਿਲੂ ਬਣੀ ਰਹਿੰਦੀ ਹੈ, ਭਗਤਾਂ ਨੂੰ ਆਧਿਆਤਮਿਕ ਵਿਕਾਸ ਅਤੇ ਦਿਵਿਆ ਸੰਪਰਕ ਦਾ ਰਸਤਾ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ। ਇਨ੍ਹਾਂ ਪਵਿੱਤਰ ਯਾਤਰਾਵਾਂ ਦੇ ਮਾਧਿਅਮ ਨਾਲ, ਵਿਅਕਤੀ ਆਧਿਆਤਮਿਕ ਤੀਰਥਯਾਤਰਾ ਦੀ ਰੂਪਾਂਤਰਕਾਰੀ ਸ਼ਕਤੀ ਦਾ ਅਨੁਭਵ ਕਰ ਸਕਦੇ ਹਨ ਅਤੇ ਦਿਵਿਆ ਨਾਲ ਆਪਣੇ ਸੰਪਰਕ ਨੂੰ ਡੂੰਘਾ ਕਰ ਸਕਦੇ ਹਨ।',
        tamil: 'யாத்திரை இந்து ஆன்மீக பயிற்சியின் அடிப்படை அம்சமாக உள்ளது, பக்தர்களுக்கு ஆன்மீக வளர்ச்சி மற்றும் தெய்வீக இணைப்புக்கான பாதையை வழங்குகிறது। இந்த புனித பயணங்கள் மூலம், தனிநபர்கள் ஆன்மீக தீர்த்தயாத்திரையின் மாற்றும் சக்தியை அனுபவிக்கலாம் மற்றும் தெய்வீகத்துடனான தங்கள் இணைப்பை ஆழப்படுத்தலாம்।',
        telugu: 'యాత్ర హిందూ ఆధ్యాత్మిక అభ్యాసం యొక్క మౌలిక అంశంగా ఉంది, భక్తులకు ఆధ్యాత్మిక వృద్ధి మరియు దివ్య సంపర్కానికి మార్గాన్ని అందిస్తుంది। ఈ పవిత్ర ప్రయాణాల ద్వారా, వ్యక్తులు ఆధ్యాత్మిక తీర్థయాత్ర యొక్క రూపాంతర శక్తిని అనుభవించవచ్చు మరియు దివ్యంతో తమ సంపర్కాన్ని లోతుచేయవచ్చు।'
      }
    }
  };

  const sections = [
    { key: 'intro', title: getTranslation(translations.sections.intro) },
    { key: 'pilgrimage', title: getTranslation(translations.sections.pilgrimage) },
    { key: 'sacred', title: getTranslation(translations.sections.sacred) },
    { key: 'spiritual', title: getTranslation(translations.sections.spiritual) },
    { key: 'conclusion', title: getTranslation(translations.sections.conclusion) },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLabel, setDropdownLabel] = useState(getTranslation(translations.topic));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{section: string, text: string, index: number, sectionKey: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
        return getTranslation(translations.content.intro);
      case 'pilgrimage':
        return getTranslation(translations.content.pilgrimage);
      case 'sacred':
        return getTranslation(translations.content.sacred);
      case 'spiritual':
        return getTranslation(translations.content.spiritual);
      case 'conclusion':
        return getTranslation(translations.content.conclusion);
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
      setDropdownLabel(getTranslation(translations.topic));
    });
  };

  return (
    <View style={styles.root}>
      <HomeHeader 
        searchPlaceholder={getTranslation(translations.searchPlaceholder)} 
        showDailyPujaButton={false}
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
                placeholder={getTranslation(translations.searchContentPlaceholder)}
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
                    <Text style={[styles.dropdownItemText, { color: '#999' }]}>{getTranslation(translations.cancel)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        }
      />
      <ScrollView 
        ref={scrollRef} 
        contentContainerStyle={[styles.content, { paddingBottom: 150 }]} 
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#FFF7ED", "#FFF"]} style={styles.cardTop} onLayout={(e) => (sectionY.current['intro'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h1}>{getTranslation(translations.content.title)}</Text>
          <HighlightedText 
            text={getTranslation(translations.content.intro)}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </LinearGradient>

        <View style={styles.card} onLayout={(e) => (sectionY.current['pilgrimage'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{getTranslation(translations.sections.pilgrimage)}</Text>
          <HighlightedText 
            text={getTranslation(translations.content.pilgrimage)}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['sacred'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{getTranslation(translations.sections.sacred)}</Text>
          <HighlightedText 
            text={getTranslation(translations.content.sacred)}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['spiritual'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{getTranslation(translations.sections.spiritual)}</Text>
          <HighlightedText 
            text={getTranslation(translations.content.spiritual)}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
        </View>

        <View style={styles.card} onLayout={(e) => (sectionY.current['conclusion'] = e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{getTranslation(translations.sections.conclusion)}</Text>
          <HighlightedText 
            text={getTranslation(translations.content.conclusion)}
            highlight={searchHighlight}
            textStyle={styles.p}
          />
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
  p: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownChevron: {
    color: '#fff',
    fontSize: 18,
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