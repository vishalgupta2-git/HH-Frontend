import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  birthDayNumber: number;
  lifePathMeaning: string;
  destinyMeaning: string;
  soulMeaning: string;
  personalityMeaning: string;
  birthDayMeaning: string;
}

interface CompatibilityResult {
  compatibility: number;
  meaning: string;
  advice: string;
}

const NumerologyCalculator: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [results, setResults] = useState<NumerologyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'compatibility' | 'daily'>('calculator');
  
  // Compatibility inputs
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState(new Date());
  const [showPartnerDatePicker, setShowPartnerDatePicker] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);

  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoDescription, setInfoDescription] = useState('');

  // Numerology meanings
  const numberMeanings = {
    1: {
      lifePath: "Natural born leader with strong individuality and determination. You're ambitious, independent, and have a pioneering spirit.",
      destiny: "Destined for leadership roles. Your path involves creating new opportunities and inspiring others.",
      soul: "You seek independence and recognition. Your inner self craves achievement and being first.",
      personality: "Others see you as confident, ambitious, and sometimes aggressive. You appear strong-willed and determined.",
      birthDay: "You're a natural leader with strong willpower and determination."
    },
    2: {
      lifePath: "Diplomatic and peaceful nature. You're cooperative, supportive, and excel in partnerships and teamwork.",
      destiny: "Your destiny involves bringing harmony and balance. You're meant to work with others and create peace.",
      soul: "Your inner self seeks harmony, love, and cooperation. You value relationships deeply.",
      personality: "You appear gentle, diplomatic, and cooperative. Others see you as a peacemaker.",
      birthDay: "You're diplomatic, peaceful, and excel in partnerships and cooperation."
    },
    3: {
      lifePath: "Creative and expressive individual. You're artistic, optimistic, and have a natural ability to communicate.",
      destiny: "Your destiny involves creative expression and communication. You're meant to inspire and entertain others.",
      soul: "Your inner self craves self-expression, creativity, and joy. You're naturally optimistic.",
      personality: "Others see you as creative, expressive, and enthusiastic. You appear vibrant and inspiring.",
      birthDay: "You're creative, expressive, and have natural communication abilities."
    },
    4: {
      lifePath: "Practical and organized person. You're reliable, hardworking, and excel in building solid foundations.",
      destiny: "Your destiny involves creating stability and structure. You're meant to build lasting foundations.",
      soul: "Your inner self seeks security, order, and practical achievement. You value stability.",
      personality: "You appear reliable, practical, and organized. Others see you as dependable and methodical.",
      birthDay: "You're practical, organized, and excel in building solid foundations."
    },
    5: {
      lifePath: "Adventurous and freedom-loving individual. You're versatile, adaptable, and seek new experiences.",
      destiny: "Your destiny involves exploration and change. You're meant to experience life's variety and freedom.",
      soul: "Your inner self craves freedom, adventure, and new experiences. You're naturally restless.",
      personality: "Others see you as adventurous, versatile, and sometimes unpredictable. You appear dynamic.",
      birthDay: "You're adventurous, freedom-loving, and seek new experiences and change."
    },
    6: {
      lifePath: "Nurturing and responsible person. You're caring, compassionate, and excel in service to others.",
      destiny: "Your destiny involves caring for others and creating harmony. You're meant to be a nurturer.",
      soul: "Your inner self seeks to love and care for others. You're naturally compassionate and responsible.",
      personality: "You appear caring, responsible, and nurturing. Others see you as reliable and loving.",
      birthDay: "You're nurturing, responsible, and excel in caring for others and creating harmony."
    },
    7: {
      lifePath: "Analytical and spiritual individual. You're introspective, wise, and seek deeper understanding.",
      destiny: "Your destiny involves spiritual growth and intellectual pursuits. You're meant to seek wisdom.",
      soul: "Your inner self craves knowledge, wisdom, and spiritual understanding. You're naturally introspective.",
      personality: "Others see you as analytical, spiritual, and sometimes mysterious. You appear wise and thoughtful.",
      birthDay: "You're analytical, spiritual, and seek deeper understanding and wisdom."
    },
    8: {
      lifePath: "Ambitious and material-oriented person. You're powerful, efficient, and excel in business and finance.",
      destiny: "Your destiny involves material success and achievement. You're meant to build wealth and power.",
      soul: "Your inner self seeks material success, recognition, and achievement. You're naturally ambitious.",
      personality: "You appear powerful, ambitious, and efficient. Others see you as a natural leader in business.",
      birthDay: "You're ambitious, material-oriented, and excel in business, finance, and achievement."
    },
    9: {
      lifePath: "Humanitarian and compassionate individual. You're idealistic, generous, and seek to help humanity.",
      destiny: "Your destiny involves humanitarian work and universal love. You're meant to serve humanity.",
      soul: "Your inner self craves to help others and make the world better. You're naturally compassionate.",
      personality: "Others see you as humanitarian, generous, and idealistic. You appear caring and wise.",
      birthDay: "You're humanitarian, compassionate, and seek to help others and make the world better."
    },
    11: {
      lifePath: "Intuitive and spiritually gifted person. You're a master number with heightened intuition and spiritual awareness.",
      destiny: "Your destiny involves spiritual leadership and enlightenment. You're meant to inspire spiritual growth.",
      soul: "Your inner self is highly intuitive and spiritually aware. You have a deep connection to the divine.",
      personality: "Others see you as spiritually gifted, intuitive, and sometimes mysterious. You appear enlightened.",
      birthDay: "You're spiritually gifted with heightened intuition and spiritual awareness."
    },
    22: {
      lifePath: "Master builder and visionary. You're a master number with the ability to manifest dreams into reality.",
      destiny: "Your destiny involves building great things and manifesting grand visions. You're meant to create on a large scale.",
      soul: "Your inner self has grand visions and the power to manifest them. You're naturally ambitious and capable.",
      personality: "Others see you as a visionary and master builder. You appear capable of great achievements.",
      birthDay: "You're a master builder with the ability to manifest grand visions into reality."
    },
    33: {
      lifePath: "Master teacher and healer. You're a master number with the highest spiritual calling.",
      destiny: "Your destiny involves teaching, healing, and spiritual leadership. You're meant to guide others spiritually.",
      soul: "Your inner self is deeply spiritual and compassionate. You have a calling to heal and teach.",
      personality: "Others see you as a spiritual master, teacher, and healer. You appear enlightened and wise.",
      birthDay: "You're a master teacher and healer with the highest spiritual calling."
    }
  };

  // Number type explanations
  const numberTypeExplanations = {
    lifePath: {
      title: "Life Path Number",
      description: "The Life Path Number is the most important number in numerology, calculated from your birth date. It represents your life's purpose, the path you're meant to follow, and the lessons you need to learn in this lifetime. This number reveals your natural talents, abilities, and the direction your life should take to fulfill your destiny."
    },
    destiny: {
      title: "Destiny Number",
      description: "The Destiny Number, also known as the Expression Number, is calculated from your full name at birth. It represents your life's mission and what you're destined to accomplish. This number reveals your natural abilities, talents, and the ultimate goal you're working toward in this lifetime."
    },
    soul: {
      title: "Soul Number",
      description: "The Soul Number, also called the Heart's Desire Number, is calculated from the vowels in your full name. It represents your inner self, your true desires, and what your soul truly wants to experience. This number reveals your deepest motivations, emotional needs, and the inner drive that guides your decisions."
    },
    personality: {
      title: "Personality Number",
      description: "The Personality Number is calculated from the consonants in your full name. It represents how others see you and the impression you make on the world. This number reveals your outer personality, social behavior, and the way you present yourself to others in various situations."
    },
    birthDay: {
      title: "Birth Day Number",
      description: "The Birth Day Number is simply the day of the month you were born, reduced to a single digit (unless it's 11, 22, or 33). It represents your natural talents and abilities, as well as the specific gifts you bring to the world. This number influences your approach to life and the unique qualities that make you special."
    }
  };

  // Show info modal
  const showInfo = (numberType: keyof typeof numberTypeExplanations) => {
    setInfoTitle(numberTypeExplanations[numberType].title);
    setInfoDescription(numberTypeExplanations[numberType].description);
    setShowInfoModal(true);
  };

  // Close info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  // Handle modal overlay click
  const handleModalOverlayClick = () => {
    closeInfoModal();
  };

  // Calculate single digit from number (unless it's a master number)
  const reduceToSingleDigit = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) return num;
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  // Calculate Life Path Number from birth date
  const calculateLifePathNumber = (date: Date): number => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const daySum = reduceToSingleDigit(day);
    const monthSum = reduceToSingleDigit(month);
    const yearSum = reduceToSingleDigit(year);
    
    const total = daySum + monthSum + yearSum;
    return reduceToSingleDigit(total);
  };

  // Calculate Destiny Number from full name
  const calculateDestinyNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
      'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      total += letterValues[cleanName[i]] || 0;
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Soul Number (vowels only)
  const calculateSoulNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      const letter = cleanName[i];
      if (letterValues[letter]) {
        total += letterValues[letter];
      }
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Personality Number (consonants only)
  const calculatePersonalityNumber = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      'B': 2, 'C': 3, 'D': 4, 'F': 6, 'G': 7, 'H': 8, 'J': 1, 'K': 2, 'L': 3,
      'M': 4, 'N': 5, 'P': 7, 'Q': 8, 'R': 9, 'S': 1, 'T': 2, 'V': 4, 'W': 5, 'X': 6, 'Z': 8
    };
    
    let total = 0;
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    for (let i = 0; i < cleanName.length; i++) {
      const letter = cleanName[i];
      if (letterValues[letter]) {
        total += letterValues[letter];
      }
    }
    
    return reduceToSingleDigit(total);
  };

  // Calculate Birth Day Number
  const calculateBirthDayNumber = (date: Date): number => {
    return reduceToSingleDigit(date.getDate());
  };

  // Calculate compatibility between two people
  const calculateCompatibility = () => {
    if (!fullName.trim() || !partnerName.trim()) {
      Alert.alert('Error', 'Please enter both names');
      return;
    }

    const person1LifePath = calculateLifePathNumber(birthDate);
    const person2LifePath = calculateLifePathNumber(partnerBirthDate);
    
    // Simple compatibility calculation based on life path numbers
    const difference = Math.abs(person1LifePath - person2LifePath);
    let compatibility = 0;
    let meaning = '';
    let advice = '';

    if (difference === 0) {
      compatibility = 95;
      meaning = 'Excellent compatibility! You share the same life path number, indicating a deep spiritual connection.';
      advice = 'This relationship has great potential for growth and understanding. Focus on supporting each other\'s life purpose.';
    } else if (difference <= 2) {
      compatibility = 85;
      meaning = 'Very good compatibility. Your life path numbers are close, suggesting harmony and mutual understanding.';
      advice = 'Your differences complement each other well. Embrace the variety and learn from each other.';
    } else if (difference <= 4) {
      compatibility = 70;
      meaning = 'Good compatibility. You have moderate differences that can create balance in the relationship.';
      advice = 'Communication is key. Work on understanding each other\'s perspectives and life goals.';
    } else if (difference <= 6) {
      compatibility = 55;
      meaning = 'Moderate compatibility. Your life paths are quite different, which may require more effort to understand each other.';
      advice = 'Focus on finding common ground and respecting each other\'s individual paths. Patience and compromise are essential.';
    } else {
      compatibility = 40;
      meaning = 'Challenging compatibility. Your life paths are very different, which may lead to misunderstandings.';
      advice = 'This relationship will require significant effort, understanding, and compromise. Consider if your goals align.';
    }

    setCompatibilityResult({ compatibility, meaning, advice });
  };

  // Get daily lucky numbers
  const getDailyLuckyNumbers = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    const luckyNumbers = [
      reduceToSingleDigit(dayOfYear),
      reduceToSingleDigit(today.getDate()),
      reduceToSingleDigit(today.getMonth() + 1),
      reduceToSingleDigit(today.getFullYear())
    ];

    return [...new Set(luckyNumbers)]; // Remove duplicates
  };

  // Main calculation function
  const calculateNumerology = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setIsCalculating(true);

    try {
      const lifePathNumber = calculateLifePathNumber(birthDate);
      const destinyNumber = calculateDestinyNumber(fullName);
      const soulNumber = calculateSoulNumber(fullName);
      const personalityNumber = calculatePersonalityNumber(fullName);
      const birthDayNumber = calculateBirthDayNumber(birthDate);

      const result: NumerologyResult = {
        lifePathNumber,
        destinyNumber,
        soulNumber,
        personalityNumber,
        birthDayNumber,
        lifePathMeaning: numberMeanings[lifePathNumber as keyof typeof numberMeanings]?.lifePath || 'Meaning not available',
        destinyMeaning: numberMeanings[destinyNumber as keyof typeof numberMeanings]?.destiny || 'Meaning not available',
        soulMeaning: numberMeanings[soulNumber as keyof typeof numberMeanings]?.soul || 'Meaning not available',
        personalityMeaning: numberMeanings[personalityNumber as keyof typeof numberMeanings]?.personality || 'Meaning not available',
        birthDayMeaning: numberMeanings[birthDayNumber as keyof typeof numberMeanings]?.birthDay || 'Meaning not available',
      };

      setResults(result);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while calculating. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Handle partner date change
  const onPartnerDateChange = (event: any, selectedDate?: Date) => {
    setShowPartnerDatePicker(false);
    if (selectedDate) {
      setPartnerBirthDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCalculatorTab = () => (
    <>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Birth Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Birth Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(birthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateNumerology}
          disabled={isCalculating}
        >
          <LinearGradient
            colors={['#FFA040', '#FF6A00']}
            style={styles.calculateButtonGradient}
          >
            <Text style={styles.calculateButtonText}>
              {isCalculating ? 'Calculating...' : 'Calculate Numerology'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Your Numerology Numbers</Text>
          <Text style={styles.clickInstruction}>Click any tile to know more</Text>
          
          {/* Life Path Number */}
          <TouchableOpacity onPress={() => showInfo('lifePath')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>Life Path Number</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.lifePathNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.lifePathMeaning}</Text>
          </TouchableOpacity>

          {/* Destiny Number */}
          <TouchableOpacity onPress={() => showInfo('destiny')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>Destiny Number</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.destinyNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.destinyMeaning}</Text>
          </TouchableOpacity>

          {/* Soul Number */}
          <TouchableOpacity onPress={() => showInfo('soul')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>Soul Number</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.soulNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.soulMeaning}</Text>
          </TouchableOpacity>

          {/* Personality Number */}
          <TouchableOpacity onPress={() => showInfo('personality')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>Personality Number</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.personalityNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.personalityMeaning}</Text>
          </TouchableOpacity>

          {/* Birth Day Number */}
          <TouchableOpacity onPress={() => showInfo('birthDay')} style={styles.numberCard}>
            <View style={styles.numberHeader}>
              <Text style={styles.numberTitle}>Birth Day Number</Text>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{results.birthDayNumber}</Text>
              </View>
            </View>
            <Text style={styles.numberMeaning}>{results.birthDayMeaning}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderCompatibilityTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Compatibility Calculator</Text>
        
        {/* Person 1 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Birth Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(birthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Person 2 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Partner's Name</Text>
          <TextInput
            style={styles.textInput}
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Enter partner's full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Partner's Birth Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPartnerDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(partnerBirthDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateCompatibility}
        >
          <LinearGradient
            colors={['#FFA040', '#FF6A00']}
            style={styles.calculateButtonGradient}
          >
            <Text style={styles.calculateButtonText}>Calculate Compatibility</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {compatibilityResult && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Compatibility Results</Text>
          
          <View style={styles.compatibilityCard}>
            <View style={styles.compatibilityHeader}>
              <Text style={styles.compatibilityScore}>{compatibilityResult.compatibility}%</Text>
              <Text style={styles.compatibilityLabel}>Compatibility</Text>
            </View>
            <Text style={styles.compatibilityMeaning}>{compatibilityResult.meaning}</Text>
            <Text style={styles.compatibilityAdvice}>{compatibilityResult.advice}</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderDailyTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Daily Numerology</Text>
        
        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>Today's Lucky Numbers</Text>
          <View style={styles.luckyNumbersContainer}>
            {getDailyLuckyNumbers().map((number, index) => (
              <View key={index} style={styles.luckyNumberCircle}>
                <Text style={styles.luckyNumberText}>{number}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.dailyInfo}>
            These numbers are calculated based on today's date and may bring you good fortune throughout the day.
          </Text>
        </View>

        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>Daily Affirmation</Text>
          <Text style={styles.dailyAffirmation}>
            "Today I align with the positive vibrations of the universe and embrace the opportunities that come my way."
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calculator' && styles.activeTab]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabText, activeTab === 'calculator' && styles.activeTabText]}>
            Calculator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compatibility' && styles.activeTab]}
          onPress={() => setActiveTab('compatibility')}
        >
          <Text style={[styles.tabText, activeTab === 'compatibility' && styles.activeTabText]}>
            Compatibility
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'compatibility' && renderCompatibilityTab()}
        {activeTab === 'daily' && renderDailyTab()}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Numerology</Text>
          <Text style={styles.infoText}>
            Numerology is an ancient mystical science that reveals the hidden meanings of numbers and their influence on our lives. Each number carries specific vibrations and energies that shape our personality, destiny, and life path.
          </Text>
          <Text style={styles.infoText}>
            Your Life Path Number is the most important number in numerology, calculated from your birth date. It reveals your life's purpose and the path you're meant to follow.
          </Text>
        </View>
      </View>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {showPartnerDatePicker && (
        <DateTimePicker
          value={partnerBirthDate}
          mode="date"
          display="default"
          onChange={onPartnerDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeInfoModal}
        onDismiss={closeInfoModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleModalOverlayClick}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoTitle}</Text>
              <TouchableOpacity
                onPress={closeInfoModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{infoDescription}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeInfoModal}
            >
              <LinearGradient
                colors={['#FFA040', '#FF6A00']}
                style={styles.modalCloseButtonGradient}
              >
                <Text style={styles.modalCloseButtonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFA040',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  calculateButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 20,
  },
  numberCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  numberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  numberTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  numberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberMeaning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  clickInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  compatibilityCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compatibilityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compatibilityScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFA040',
  },
  compatibilityLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  compatibilityMeaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  compatibilityAdvice: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dailyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  luckyNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  luckyNumberCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  luckyNumberText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  dailyAffirmation: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: 'white',
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
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'center',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalCloseButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NumerologyCalculator;
