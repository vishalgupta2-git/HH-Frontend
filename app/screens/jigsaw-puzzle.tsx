import { useLanguage } from '@/contexts/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Puzzle images
const PUZZLE_IMAGES = [
  {
    id: 'dandiya',
    name: 'Dandiya',
    source: require('@/assets/images/JigsawImages/Dandiya.jpg'),
    difficulty: 'easy',
  },
  {
    id: 'diwali1',
    name: 'Diwali 1',
    source: require('@/assets/images/JigsawImages/Diwali 1.jpg'),
    difficulty: 'medium',
  },
  {
    id: 'diwali2',
    name: 'Diwali 2',
    source: require('@/assets/images/JigsawImages/Diwali 2.jpg'),
    difficulty: 'medium',
  },
  {
    id: 'durga',
    name: 'Durga Maa',
    source: require('@/assets/images/JigsawImages/Durga Maa.jpg'),
    difficulty: 'easy',
  },
  {
    id: 'golden',
    name: 'Golden Temple',
    source: require('@/assets/images/JigsawImages/Golden Temple.jpg'),
    difficulty: 'medium',
  },
  {
    id: 'rammandir',
    name: 'Ram Mandir',
    source: require('@/assets/images/JigsawImages/Ram Mandir.jpg'),
    difficulty: 'hard',
  },
  {
    id: 'shivji',
    name: 'Shiv Ji',
    source: require('@/assets/images/JigsawImages/Shiv Ji ji.jpg'),
    difficulty: 'medium',
  },
  {
    id: 'sriram',
    name: 'Sri Ram',
    source: require('@/assets/images/JigsawImages/Sri Ram.jpg'),
    difficulty: 'easy',
  },
];

// Difficulty levels
const DIFFICULTY_LEVELS = {
  easy: { pieces: 4, rows: 2, cols: 2, name: 'Easy' },
  medium: { pieces: 9, rows: 3, cols: 3, name: 'Medium' },
  hard: { pieces: 16, rows: 4, cols: 4, name: 'Hard' },
};

interface PuzzlePiece {
  id: number;
  correctPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  imageSource: any;
  isPlaced: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  row: number;
  col: number;
}

export default function JigsawPuzzleScreen() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(PUZZLE_IMAGES[0]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(true);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Audio
  const [successSound, setSuccessSound] = useState<Audio.Sound | null>(null);
  const [completionSound, setCompletionSound] = useState<Audio.Sound | null>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: success } = await Audio.Sound.createAsync(
          require('@/assets/sounds/TempleBell.mp3')
        );
        const { sound: completion } = await Audio.Sound.createAsync(
          require('@/assets/sounds/conch.mp3')
        );
        setSuccessSound(success);
        setCompletionSound(completion);
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };
    loadSounds();

    return () => {
      successSound?.unloadAsync();
      completionSound?.unloadAsync();
    };
  }, [successSound, completionSound]);

  // Pulse animation for story button
  useEffect(() => {
    if (gameCompleted) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [gameCompleted, pulseAnim]);

  // Shuffle array function
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate puzzle pieces
  const generatePuzzlePieces = (imageSource: any, difficulty: 'easy' | 'medium' | 'hard') => {
    const { rows, cols } = DIFFICULTY_LEVELS[difficulty];
    const pieces: PuzzlePiece[] = [];
    const pieceWidth = 100; // Larger piece width
    const pieceHeight = 100; // Larger piece height

    for (let i = 0; i < rows * cols; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      pieces.push({
        id: i,
        correctPosition: {
          x: col * pieceWidth + 20, // Start from left edge with padding
          y: row * pieceHeight + 250, // Position below reference image
        },
        currentPosition: {
          x: Math.random() * (screenWidth - pieceWidth - 100) + 50, // Random horizontal position
          y: row * pieceHeight + 250 + (DIFFICULTY_LEVELS[difficulty].rows * pieceHeight) + 50 + Math.random() * 100, // Random vertical position below solving area
        },
        imageSource: imageSource,
        isPlaced: false,
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        row,
        col,
      });
    }

    // Shuffle the pieces to randomize their positions
    const shuffledPieces = shuffleArray(pieces);
    
    return shuffledPieces;
  };

  // Start game
  const startGame = () => {
    const pieces = generatePuzzlePieces(selectedImage.source, difficulty);
    setPuzzlePieces(pieces);
    setGameStarted(true);
    setGameCompleted(false);
    setMoves(0);
    setTimeElapsed(0);
    setShowImageSelection(false);
  };

  // Check if piece is in correct position
  const isPieceInCorrectPosition = (piece: PuzzlePiece, tolerance = 30) => {
    const dx = Math.abs(piece.currentPosition.x - piece.correctPosition.x);
    const dy = Math.abs(piece.currentPosition.y - piece.correctPosition.y);
    return dx < tolerance && dy < tolerance;
  };

  // Handle piece placement
  const handlePiecePlacement = (pieceId: number) => {
    const piece = puzzlePieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    if (isPieceInCorrectPosition(piece)) {
      // Correct placement
      const updatedPieces = puzzlePieces.map(p => 
        p.id === pieceId 
          ? { 
              ...p, 
              currentPosition: p.correctPosition,
              isPlaced: true,
            }
          : p
      );
      setPuzzlePieces(updatedPieces);
      setMoves(prev => prev + 1);

      // Play success sound
      successSound?.replayAsync();

      // Check if game is completed
      const allPlaced = updatedPieces.every(p => p.isPlaced);
      if (allPlaced) {
        setGameCompleted(true);
        completionSound?.replayAsync();
      }
    } else {
      // Wrong placement - add some visual feedback
      const piece = puzzlePieces.find(p => p.id === pieceId);
      if (piece) {
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
      setMoves(prev => prev + 1);
    }
  };

  // Create pan responder for piece dragging
  const createPanResponder = (piece: PuzzlePiece) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setDraggedPiece(piece.id);
        Animated.spring(piece.scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (piece.isPlaced) return;
        
        const newX = Math.max(0, Math.min(screenWidth - 80, piece.currentPosition.x + gestureState.dx));
        const newY = Math.max(0, Math.min(screenHeight - 80, piece.currentPosition.y + gestureState.dy));
        
        setPuzzlePieces(prev => prev.map(p => 
          p.id === piece.id 
            ? { ...p, currentPosition: { x: newX, y: newY } }
            : p
        ));
      },
      onPanResponderRelease: () => {
        Animated.spring(piece.scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        setDraggedPiece(null);
        handlePiecePlacement(piece.id);
      },
    });
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setPuzzlePieces([]);
    setMoves(0);
    setTimeElapsed(0);
    setShowImageSelection(true);
  };

  // Shuffle pieces
  const shufflePieces = () => {
    if (puzzlePieces.length > 0) {
      const shuffledPieces = puzzlePieces.map(piece => ({
        ...piece,
        currentPosition: {
          x: Math.random() * (screenWidth - 100 - 100) + 50,
          y: piece.correctPosition.y + (DIFFICULTY_LEVELS[difficulty].rows * 100) + 50 + Math.random() * 100,
        },
        isPlaced: false,
      }));
      setPuzzlePieces(shuffledPieces);
    }
  };

  // Handle image selection and scroll to start puzzle button
  const handleImageSelection = (image: any) => {
    setSelectedImage(image);
    // Scroll to start puzzle button after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play story audio
  const playStoryAudio = async () => {
    if (isPlayingAudio) {
      Speech.stop();
      setIsPlayingAudio(false);
      return;
    }

    try {
      const storyContent = getStoryContent();
      if (!storyContent) return;

      // Extract text content from the story
      const extractTextFromContent = (content: any): string => {
        if (typeof content === 'string') {
          return content.trim();
        }
        
        if (content && typeof content === 'object') {
          if (content.props && content.props.children) {
            if (Array.isArray(content.props.children)) {
              return content.props.children
                .map((child: any) => extractTextFromContent(child))
                .filter(text => text && text.trim())
                .join(' ');
            } else {
              return extractTextFromContent(content.props.children);
            }
          }
        }
        
        return '';
      };

      const textToSpeak = extractTextFromContent(storyContent.content);
      
      // Set language for speech - with better language detection
      let speechLanguage = 'en-US'; // default
      
      if (currentLanguage === 'hindi') {
        speechLanguage = 'hi-IN';
      } else if (currentLanguage === 'bangla') {
        speechLanguage = 'bn-IN';
      } else if (currentLanguage === 'kannada') {
        speechLanguage = 'kn-IN';
      } else if (currentLanguage === 'punjabi') {
        speechLanguage = 'pa-IN';
      } else if (currentLanguage === 'tamil') {
        speechLanguage = 'ta-IN';
      } else if (currentLanguage === 'telugu') {
        speechLanguage = 'te-IN';
      }
      
      const speechOptions = {
        language: speechLanguage,
        pitch: 1.0,
        rate: 0.8,
        onStart: () => setIsPlayingAudio(true),
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      };

      await Speech.speak(textToSpeak, speechOptions);
    } catch (error) {
      console.log('Error playing story audio:', error);
      setIsPlayingAudio(false);
    }
  };

  // Stop audio when modal closes
  useEffect(() => {
    if (!showStoryModal && isPlayingAudio) {
      Speech.stop();
      setIsPlayingAudio(false);
    }
  }, [showStoryModal, isPlayingAudio]);

  // Get translations
  const getTranslation = (key: string) => {
    const translations: { [key: string]: { [key: string]: string } } = {
      title: {
        english: 'Temple Jigsaw Puzzle',
        hindi: 'मंदिर जिग्सॉ पहेली',
        bangla: 'মন্দির জিগস পাজল',
        kannada: 'ದೇವಾಲಯ ಜಿಗ್ಸಾ ಪಜಲ್',
        punjabi: 'ਮੰਦਰ ਜਿਗਸਾ ਪਜ਼ਲ',
        tamil: 'கோவில் ஜிக்ஸா புதிர்',
        telugu: 'దేవాలయ జిగ్సా పజిల్',
      },
      selectImage: {
        english: 'Select Temple Image',
        hindi: 'मंदिर छवि चुनें',
        bangla: 'মন্দিরের ছবি নির্বাচন করুন',
        kannada: 'ದೇವಾಲಯದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        punjabi: 'ਮੰਦਰ ਦੀ ਤਸਵੀਰ ਚੁਣੋ',
        tamil: 'கோவில் படத்தைத் தேர்ந்தெடுக்கவும்',
        telugu: 'దేవాలయ చిత్రాన్ని ఎంచుకోండి',
      },
      selectDifficulty: {
        english: 'Select Difficulty',
        hindi: 'कठिनाई चुनें',
        bangla: 'কঠিনতা নির্বাচন করুন',
        kannada: 'ಕಷ್ಟತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        punjabi: 'ਮੁਸ਼ਕਲ ਚੁਣੋ',
        tamil: 'கடினத்தைத் தேர்ந்தெடுக்கவும்',
        telugu: 'కష్టతను ఎంచుకోండి',
      },
      startGame: {
        english: 'Start Puzzle',
        hindi: 'पहेली शुरू करें',
        bangla: 'পাজল শুরু করুন',
        kannada: 'ಪಜಲ್ ಪ್ರಾರಂಭಿಸಿ',
        punjabi: 'ਪਜ਼ਲ ਸ਼ੁਰੂ ਕਰੋ',
        tamil: 'புதிரைத் தொடங்கவும்',
        telugu: 'పజిల్ ప్రారంభించండి',
      },
      moves: {
        english: 'Moves',
        hindi: 'चालें',
        bangla: 'চাল',
        kannada: 'ಚಲನೆಗಳು',
        punjabi: 'ਚਾਲਾਂ',
        tamil: 'நகர்வுகள்',
        telugu: 'కదలికలు',
      },
      time: {
        english: 'Time',
        hindi: 'समय',
        bangla: 'সময়',
        kannada: 'ಸಮಯ',
        punjabi: 'ਸਮਾਂ',
        tamil: 'நேரம்',
        telugu: 'సమయం',
      },
      congratulations: {
        english: 'Congratulations!',
        hindi: 'बधाई हो!',
        bangla: 'অভিনন্দন!',
        kannada: 'ಅಭಿನಂದನೆಗಳು!',
        punjabi: 'ਵਧਾਈਆਂ!',
        tamil: 'வாழ்த்துக்கள்!',
        telugu: 'అభినందనలు!',
      },
      puzzleComplete: {
        english: 'Puzzle Complete!',
        hindi: 'पहेली पूरी!',
        bangla: 'পাজল সম্পূর্ণ!',
        kannada: 'ಪಜಲ್ ಪೂರ್ಣ!',
        punjabi: 'ਪਜ਼ਲ ਪੂਰਾ!',
        tamil: 'புதிர் முடிந்தது!',
        telugu: 'పజిల్ పూర్తయింది!',
      },
      playAgain: {
        english: 'Play Again',
        hindi: 'फिर से खेलें',
        bangla: 'আবার খেলুন',
        kannada: 'ಮತ್ತೆ ಆಡಿ',
        punjabi: 'ਦੁਬਾਰਾ ਖੇਡੋ',
        tamil: 'மீண்டும் விளையாடுங்கள்',
        telugu: 'మళ్లీ ఆడండి',
      },
      back: {
        english: 'Back',
        hindi: 'वापस',
        bangla: 'ফিরে যান',
        kannada: 'ಹಿಂದಕ್ಕೆ',
        punjabi: 'ਵਾਪਸ',
        tamil: 'திரும்பவும்',
        telugu: 'వెనుకకు',
      },
      next: {
        english: 'Next',
        hindi: 'अगला',
        bangla: 'পরবর্তী',
        kannada: 'ಮುಂದೆ',
        punjabi: 'ਅਗਲਾ',
        tamil: 'அடுத்து',
        telugu: 'తదుపరి',
      },
      reset: {
        english: 'Reset',
        hindi: 'रीसेट',
        bangla: 'রিসেট',
        kannada: 'ರೀಸೆಟ್',
        punjabi: 'ਰੀਸੈਟ',
        tamil: 'மீட்டமை',
        telugu: 'రీసెట్',
      },
      shuffle: {
        english: 'Shuffle',
        hindi: 'फेंटें',
        bangla: 'মিশান',
        kannada: 'ಮಿಶ್ರಣ',
        punjabi: 'ਮਿਲਾਓ',
        tamil: 'கலக்கு',
        telugu: 'మిశ్రమం',
      },
      puzzlePieces: {
        english: 'Puzzle Pieces',
        hindi: 'पहेली के टुकड़े',
        bangla: 'পাজল টুকরা',
        kannada: 'ಪಜಲ್ ತುಣುಕುಗಳು',
        punjabi: 'ਪਜ਼ਲ ਟੁਕੜੇ',
        tamil: 'புதிர் துண்டுகள்',
        telugu: 'పజిల్ ముక్కలు',
      },
      easy: {
        english: 'Easy',
        hindi: 'आसान',
        bangla: 'সহজ',
        kannada: 'ಸುಲಭ',
        punjabi: 'ਆਸਾਨ',
        tamil: 'எளிது',
        telugu: 'సులభం',
      },
      medium: {
        english: 'Medium',
        hindi: 'मध्यम',
        bangla: 'মাঝারি',
        kannada: 'ಮಧ್ಯಮ',
        punjabi: 'ਮੱਧਮ',
        tamil: 'நடுத்தரம்',
        telugu: 'మధ్యస్థం',
      },
      hard: {
        english: 'Hard',
        hindi: 'कठिन',
        bangla: 'কঠিন',
        kannada: 'ಕಷ್ಟ',
        punjabi: 'ਕਠਿਨ',
        tamil: 'கடினம்',
        telugu: 'కష్టం',
      },
      pieces: {
        english: 'pieces',
        hindi: 'टुकड़े',
        bangla: 'টুকরা',
        kannada: 'ತುಣುಕುಗಳು',
        punjabi: 'ਟੁਕੜੇ',
        tamil: 'துண்டுகள்',
        telugu: 'ముక్కలు',
      },
      storyOf: {
        english: 'Story of',
        hindi: 'की कहानी',
        bangla: 'এর গল্প',
        kannada: 'ದ ಕಥೆ',
        punjabi: 'ਦੀ ਕਹਾਣੀ',
        tamil: 'வரலாறு',
        telugu: 'కథ',
      },
      dandiya: {
        english: 'Dandiya',
        hindi: 'डांडिया',
        bangla: 'ডান্ডিয়া',
        kannada: 'ಡಾಂಡಿಯಾ',
        punjabi: 'ਡਾਂਡੀਆ',
        tamil: 'டாண்டியா',
        telugu: 'డాండియా',
      },
    };
    return translations[key]?.[currentLanguage] || translations[key]?.english || key;
  };

  // Get story content based on selected image
  const getStoryContent = () => {
    if (selectedImage.id === 'dandiya') {
      return getDandiyaStory();
    } else if (selectedImage.id === 'diwali1' || selectedImage.id === 'diwali2') {
      return getDiwaliStory();
    } else if (selectedImage.id === 'durga') {
      return getDurgaStory();
    } else if (selectedImage.id === 'golden') {
      return getGoldenTempleStory();
    } else if (selectedImage.id === 'rammandir') {
      return getRamMandirStory();
    } else if (selectedImage.id === 'shivji') {
      return getShivJiStory();
    } else if (selectedImage.id === 'sriram') {
      return getSriRamStory();
    }
    return null;
  };

  // Get Dandiya story content
  const getDandiyaStory = () => {
    const stories = {
      english: {
        title: "Dandiya – The Dance of Devotion and Joy",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              Dandiya is a vibrant and energetic folk dance that originates from the western Indian state of Gujarat. It is one of the most popular dance forms performed during the Navratri festival, celebrated in honor of Goddess Durga. Known for its rhythmic clashing of decorated sticks, colorful costumes, and lively music, Dandiya has grown from a regional tradition into an internationally recognized celebration of Indian culture.
            </Text>

            <Text style={styles.storyHeading}>Origins and Significance</Text>
            <Text style={styles.storySubHeading}>Historical Roots:</Text>
            <Text style={styles.storyText}>
              Dandiya traces its roots to ancient times when it was performed as a form of devotional dance dedicated to Goddess Durga. Traditionally, it represents the mock battle between the Goddess and the demon Mahishasura, where the sticks symbolize the swords of Durga.
            </Text>
            <Text style={styles.storySubHeading}>Religious Significance:</Text>
            <Text style={styles.storyText}>
              Dandiya is performed during the nine nights of Navratri to honor the victory of good over evil. Each movement and rhythm of the dance is an offering of devotion and energy to the Goddess.
            </Text>

            <Text style={styles.storyHeading}>How Dandiya is Performed</Text>
            <Text style={styles.storySubHeading}>The Sticks (Dandiyas)</Text>
            <Text style={styles.storyText}>
              Two sticks are used by each dancer, often made of wood and decorated with colored tapes, ribbons, or mirrors. When struck together, they produce a rhythmic sound that keeps the tempo of the dance.
            </Text>
            <Text style={styles.storySubHeading}>Dance Style</Text>
            <Text style={styles.storyText}>
              Dancers form circles, moving in coordinated steps and striking each other's sticks in rhythm with the music. The movements are simple yet graceful, starting slow and gradually becoming faster as the energy builds. The circular formations represent the eternal cycle of life and the cosmic energy of the universe.
            </Text>
            <Text style={styles.storySubHeading}>Music</Text>
            <Text style={styles.storyText}>
              Traditional instruments like the dhol, nagada, and shehnai accompany the dance, along with devotional folk songs. In modern times, Dandiya music has blended with Bollywood and fusion beats, making it popular with younger generations.
            </Text>
            <Text style={styles.storySubHeading}>Costumes</Text>
            <Text style={styles.storyText}>
              Women traditionally wear ghagra-cholis (lehenga choli) in bright colors, embellished with mirror work, embroidery, and beads. A dupatta (scarf) completes the look. Men wear kediyu (short kurta) with dhotis or trousers, often with turbans and colorful scarves. The vibrant costumes add to the festive spirit and make the dance visually stunning.
            </Text>

            <Text style={styles.storyHeading}>Modern Adaptations</Text>
            <Text style={styles.storyText}>
              Today, Dandiya Nights are organized not only in Gujarat but also across India and globally wherever Indian communities reside. Urban versions feature live DJs, Bollywood remixes, and even themed dance nights, making Dandiya a blend of tradition and modern entertainment. It has become a unifying cultural event where people of all ages, backgrounds, and even nationalities participate.
            </Text>

            <Text style={styles.storyHeading}>Cultural Impact</Text>
            <Text style={styles.storyText}>
              Dandiya is not just a dance—it's a social gathering that fosters community bonding, joy, and devotion. It showcases India's cultural richness, blending spirituality with art, music, and dance. For the Indian diaspora, Dandiya has become a way to connect with their roots and share Indian traditions with the world.
            </Text>

            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              Dandiya is much more than a festive performance; it is a celebration of life, energy, and devotion. With its roots in mythology and its modern-day popularity across the globe, it continues to be a symbol of India's living traditions. Whether performed in a temple courtyard in Gujarat or at a grand cultural event abroad, the clashing of dandiya sticks echoes the same message—the triumph of good over evil, and the joy of togetherness.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "डांडिया – भक्ति और आनंद का नृत्य",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              डांडिया एक जीवंत और ऊर्जावान लोक नृत्य है जो पश्चिमी भारतीय राज्य गुजरात से उत्पन्न हुआ है। यह नवरात्रि त्योहार के दौरान किया जाने वाला सबसे लोकप्रिय नृत्य रूपों में से एक है, जो देवी दुर्गा के सम्मान में मनाया जाता है। सजावटी छड़ियों की लयबद्ध टक्कर, रंगीन पोशाक और जीवंत संगीत के लिए जाना जाने वाला डांडिया, एक क्षेत्रीय परंपरा से भारतीय संस्कृति के अंतरराष्ट्रीय स्तर पर मान्यता प्राप्त उत्सव में विकसित हुआ है।
            </Text>

            <Text style={styles.storyHeading}>उत्पत्ति और महत्व</Text>
            <Text style={styles.storySubHeading}>ऐतिहासिक जड़ें:</Text>
            <Text style={styles.storyText}>
              डांडिया की जड़ें प्राचीन काल में मिलती हैं जब इसे देवी दुर्गा को समर्पित भक्ति नृत्य के रूप में किया जाता था। परंपरागत रूप से, यह देवी और राक्षस महिषासुर के बीच नकली युद्ध का प्रतिनिधित्व करता है, जहां छड़ियां दुर्गा की तलवारों का प्रतीक हैं।
            </Text>
            <Text style={styles.storySubHeading}>धार्मिक महत्व:</Text>
            <Text style={styles.storyText}>
              डांडिया नवरात्रि के नौ रातों के दौरान बुराई पर अच्छाई की जीत का सम्मान करने के लिए किया जाता है। नृत्य का हर आंदोलन और लय देवी को भक्ति और ऊर्जा का प्रसाद है।
            </Text>

            <Text style={styles.storyHeading}>डांडिया कैसे किया जाता है</Text>
            <Text style={styles.storySubHeading}>छड़ियां (डांडियास)</Text>
            <Text style={styles.storyText}>
              प्रत्येक नर्तक द्वारा दो छड़ियों का उपयोग किया जाता है, जो अक्सर लकड़ी से बनी होती हैं और रंगीन टेप, रिबन या दर्पण से सजाई जाती हैं। जब एक साथ मारा जाता है, तो वे एक लयबद्ध ध्वनि उत्पन्न करती हैं जो नृत्य की गति बनाए रखती है।
            </Text>
            <Text style={styles.storySubHeading}>नृत्य शैली</Text>
            <Text style={styles.storyText}>
              नर्तक चक्र बनाते हैं, समन्वित कदमों में चलते हैं और संगीत की लय के साथ एक दूसरे की छड़ियों को मारते हैं। आंदोलन सरल लेकिन सुंदर हैं, धीमी शुरुआत करते हैं और ऊर्जा बढ़ने के साथ धीरे-धीरे तेज होते जाते हैं। गोलाकार संरचनाएं जीवन के अनंत चक्र और ब्रह्मांड की ब्रह्मांडीय ऊर्जा का प्रतिनिधित्व करती हैं।
            </Text>
            <Text style={styles.storySubHeading}>संगीत</Text>
            <Text style={styles.storyText}>
              पारंपरिक वाद्ययंत्र जैसे ढोल, नगाड़ा और शहनाई नृत्य के साथ भक्ति लोक गीतों के साथ होते हैं। आधुनिक समय में, डांडिया संगीत बॉलीवुड और फ्यूजन बीट्स के साथ मिल गया है, जो इसे युवा पीढ़ी के बीच लोकप्रिय बनाता है।
            </Text>
            <Text style={styles.storySubHeading}>पोशाक</Text>
            <Text style={styles.storyText}>
              महिलाएं पारंपरिक रूप से उज्ज्वल रंगों में घाघरा-चोली (लेहंगा चोली) पहनती हैं, जो दर्पण काम, कढ़ाई और मोतियों से सजी होती हैं। एक दुपट्टा (स्कार्फ) लुक को पूरा करता है। पुरुष केदियू (छोटा कुर्ता) धोती या पतलून के साथ पहनते हैं, अक्सर पगड़ी और रंगीन स्कार्फ के साथ। जीवंत पोशाक उत्सव की भावना को जोड़ती है और नृत्य को दृश्य रूप से आकर्षक बनाती है।
            </Text>

            <Text style={styles.storyHeading}>आधुनिक अनुकूलन</Text>
            <Text style={styles.storyText}>
              आज, डांडिया नाइट्स न केवल गुजरात में बल्कि पूरे भारत और विश्व स्तर पर जहां भी भारतीय समुदाय रहते हैं, आयोजित किए जाते हैं। शहरी संस्करणों में लाइव डीजे, बॉलीवुड रीमिक्स और यहां तक कि थीम्ड डांस नाइट्स भी शामिल हैं, जो डांडिया को परंपरा और आधुनिक मनोरंजन का मिश्रण बनाते हैं। यह एक एकीकृत सांस्कृतिक कार्यक्रम बन गया है जहां सभी उम्र, पृष्ठभूमि और यहां तक कि राष्ट्रीयताओं के लोग भाग लेते हैं।
            </Text>

            <Text style={styles.storyHeading}>सांस्कृतिक प्रभाव</Text>
            <Text style={styles.storyText}>
              डांडिया सिर्फ एक नृत्य नहीं है—यह एक सामाजिक सभा है जो समुदाय के बंधन, आनंद और भक्ति को बढ़ावा देती है। यह भारत की सांस्कृतिक समृद्धि को प्रदर्शित करता है, आध्यात्मिकता को कला, संगीत और नृत्य के साथ मिलाता है। भारतीय प्रवासियों के लिए, डांडिया अपनी जड़ों से जुड़ने और भारतीय परंपराओं को दुनिया के साथ साझा करने का एक तरीका बन गया है।
            </Text>

            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              डांडिया एक उत्सव प्रदर्शन से कहीं अधिक है; यह जीवन, ऊर्जा और भक्ति का उत्सव है। पौराणिक कथाओं में इसकी जड़ों और दुनिया भर में इसकी आधुनिक लोकप्रियता के साथ, यह भारत की जीवित परंपराओं का प्रतीक बना हुआ है। चाहे गुजरात के मंदिर के आंगन में किया जाए या विदेश में एक भव्य सांस्कृतिक कार्यक्रम में, डांडिया छड़ियों की टक्कर एक ही संदेश को गूंजती है—बुराई पर अच्छाई की जीत, और एकता का आनंद।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "ডান্ডিয়া – ভক্তি এবং আনন্দের নৃত্য",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              ডান্ডিয়া একটি প্রাণবন্ত এবং শক্তিশালী লোকনৃত্য যা পশ্চিম ভারতীয় রাজ্য গুজরাত থেকে উদ্ভূত। এটি নবরাত্রি উৎসবের সময় পরিবেশিত সবচেয়ে জনপ্রিয় নৃত্য রূপগুলির মধ্যে একটি, যা দেবী দুর্গার সম্মানে উদযাপিত হয়। সজ্জিত লাঠির ছন্দময় সংঘর্ষ, রঙিন পোশাক এবং প্রাণবন্ত সংগীতের জন্য পরিচিত ডান্ডিয়া, একটি আঞ্চলিক ঐতিহ্য থেকে ভারতীয় সংস্কৃতির আন্তর্জাতিকভাবে স্বীকৃত উদযাপনে বিকশিত হয়েছে।
            </Text>

            <Text style={styles.storyHeading}>উৎপত্তি এবং তাৎপর্য</Text>
            <Text style={styles.storySubHeading}>ঐতিহাসিক শিকড়:</Text>
            <Text style={styles.storyText}>
              ডান্ডিয়ার শিকড় প্রাচীনকালে পাওয়া যায় যখন এটি দেবী দুর্গাকে উৎসর্গীকৃত ভক্তিমূলক নৃত্য হিসাবে পরিবেশিত হত। ঐতিহ্যগতভাবে, এটি দেবী এবং রাক্ষস মহিষাসুরের মধ্যে নকল যুদ্ধের প্রতিনিধিত্ব করে, যেখানে লাঠিগুলি দুর্গার তরবারির প্রতীক।
            </Text>
            <Text style={styles.storySubHeading}>ধর্মীয় তাৎপর্য:</Text>
            <Text style={styles.storyText}>
              ডান্ডিয়া নবরাত্রির নয় রাতের সময় মন্দের উপর ভালোর জয়ের সম্মান জানাতে পরিবেশিত হয়। নৃত্যের প্রতিটি আন্দোলন এবং ছন্দ দেবীর প্রতি ভক্তি এবং শক্তির নৈবেদ্য।
            </Text>

            <Text style={styles.storyHeading}>ডান্ডিয়া কীভাবে পরিবেশিত হয়</Text>
            <Text style={styles.storySubHeading}>লাঠি (ডান্ডিয়াস)</Text>
            <Text style={styles.storyText}>
              প্রতিটি নর্তকী দ্বারা দুটি লাঠি ব্যবহার করা হয়, প্রায়শই কাঠ দিয়ে তৈরি এবং রঙিন টেপ, রিবন বা আয়না দিয়ে সজ্জিত। একসাথে আঘাত করলে, তারা একটি ছন্দময় শব্দ উৎপন্ন করে যা নৃত্যের গতি বজায় রাখে।
            </Text>
            <Text style={styles.storySubHeading}>নৃত্য শৈলী</Text>
            <Text style={styles.storyText}>
              নর্তকীরা বৃত্ত গঠন করে, সমন্বিত পদক্ষেপে চলাফেরা করে এবং সংগীতের ছন্দের সাথে একে অপরের লাঠি আঘাত করে। আন্দোলনগুলি সহজ কিন্তু সুন্দর, ধীরে শুরু করে এবং শক্তি বৃদ্ধির সাথে ধীরে ধীরে দ্রুত হয়ে যায়। বৃত্তাকার গঠনগুলি জীবনের অনন্ত চক্র এবং মহাবিশ্বের মহাজাগতিক শক্তির প্রতিনিধিত্ব করে।
            </Text>
            <Text style={styles.storySubHeading}>সংগীত</Text>
            <Text style={styles.storyText}>
              ঐতিহ্যগত যন্ত্র যেমন ঢোল, নগাড়া এবং শাহনাই নৃত্যের সাথে ভক্তিমূলক লোকগানের সাথে থাকে। আধুনিক সময়ে, ডান্ডিয়া সংগীত বলিউড এবং ফিউশন বিটের সাথে মিশে গেছে, যা এটিকে তরুণ প্রজন্মের মধ্যে জনপ্রিয় করে তুলেছে।
            </Text>
            <Text style={styles.storySubHeading}>পোশাক</Text>
            <Text style={styles.storyText}>
              মহিলারা ঐতিহ্যগতভাবে উজ্জ্বল রঙে ঘাগরা-চোলি (লেহেঙ্গা চোলি) পরেন, আয়নার কাজ, সূচিকর্ম এবং পুঁতি দিয়ে সজ্জিত। একটি দুপাট্টা (স্কার্ফ) চেহারাটি সম্পূর্ণ করে। পুরুষরা কেডিয়ু (ছোট কুর্তা) ধুতি বা ট্রাউজারের সাথে পরেন, প্রায়শই পাগড়ি এবং রঙিন স্কার্ফের সাথে। প্রাণবন্ত পোশাক উৎসবের চেতনাকে যোগ করে এবং নৃত্যটিকে দৃশ্যত চমৎকার করে তোলে।
            </Text>

            <Text style={styles.storyHeading}>আধুনিক অভিযোজন</Text>
            <Text style={styles.storyText}>
              আজ, ডান্ডিয়া নাইটগুলি শুধুমাত্র গুজরাতে নয় বরং সারা ভারত এবং বিশ্বব্যাপী যেখানেই ভারতীয় সম্প্রদায় বাস করে সেখানে আয়োজিত হয়। শহুরে সংস্করণগুলিতে লাইভ ডিজে, বলিউড রিমিক্স এবং এমনকি থিমযুক্ত নৃত্য রাতও রয়েছে, যা ডান্ডিয়াকে ঐতিহ্য এবং আধুনিক বিনোদনের মিশ্রণে পরিণত করেছে। এটি একটি একীভূত সাংস্কৃতিক অনুষ্ঠান হয়ে উঠেছে যেখানে সব বয়স, পটভূমি এবং এমনকি জাতীয়তার লোকেরা অংশগ্রহণ করে।
            </Text>

            <Text style={styles.storyHeading}>সাংস্কৃতিক প্রভাব</Text>
            <Text style={styles.storyText}>
              ডান্ডিয়া শুধু একটি নৃত্য নয়—এটি একটি সামাজিক সমাবেশ যা সম্প্রদায়ের বন্ধন, আনন্দ এবং ভক্তিকে উৎসাহিত করে। এটি ভারতের সাংস্কৃতিক সমৃদ্ধিকে প্রদর্শন করে, আধ্যাত্মিকতাকে শিল্প, সংগীত এবং নৃত্যের সাথে মিশিয়ে। ভারতীয় প্রবাসীদের জন্য, ডান্ডিয়া তাদের শিকড়ের সাথে সংযোগ স্থাপন এবং ভারতীয় ঐতিহ্যকে বিশ্বের সাথে ভাগ করার একটি উপায় হয়ে উঠেছে।
            </Text>

            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              ডান্ডিয়া একটি উৎসব পরিবেশনা থেকে অনেক বেশি; এটি জীবন, শক্তি এবং ভক্তির উদযাপন। পুরাণে এর শিকড় এবং বিশ্বব্যাপী এর আধুনিক জনপ্রিয়তার সাথে, এটি ভারতের জীবন্ত ঐতিহ্যের প্রতীক হয়ে রয়ে গেছে। গুজরাতের মন্দির প্রাঙ্গনে পরিবেশিত হোক বা বিদেশে একটি মহৎ সাংস্কৃতিক অনুষ্ঠানে, ডান্ডিয়া লাঠির সংঘর্ষ একই বার্তা প্রতিধ্বনিত করে—মন্দের উপর ভালোর জয়, এবং একসাথে থাকার আনন্দ।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Diwali story content
  const getDiwaliStory = () => {
    const stories = {
      english: {
        title: "The Story of Diwali",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              Diwali, also known as Deepavali (meaning "row of lamps"), is one of the most celebrated festivals in India and across the world. It symbolizes the victory of light over darkness, knowledge over ignorance, and good over evil. The festival is associated with multiple legends across different regions of India, making it a truly pan-Indian celebration with diverse meanings.
            </Text>

            <Text style={styles.storyHeading}>The Return of Lord Rama</Text>
            <Text style={styles.storyText}>
              The most popular story of Diwali comes from the Ramayana. After 14 years of exile and defeating the demon king Ravana, Lord Rama returned to Ayodhya with his wife Sita and brother Lakshmana. The people of Ayodhya welcomed them by lighting rows of clay lamps (diyas), decorating the city, and celebrating with joy. This tradition of lighting lamps to symbolize the triumph of good over evil and the return of dharma is the essence of Diwali.
            </Text>

            <Text style={styles.storyHeading}>The Story of Narakasura</Text>
            <Text style={styles.storyText}>
              In many parts of India, especially in the south, Diwali also marks the victory of Lord Krishna over the demon king Narakasura. Narakasura had captured 16,000 women and terrorized the people. Lord Krishna, with his consort Satyabhama, defeated him, freeing the captives. The day before Diwali, known as Naraka Chaturdashi (Chhoti Diwali), commemorates this victory and the end of cruelty.
            </Text>

            <Text style={styles.storyHeading}>The Goddess Lakshmi</Text>
            <Text style={styles.storyText}>
              Diwali is also associated with Goddess Lakshmi, the goddess of wealth, prosperity, and fortune. According to legend, Lakshmi was born from the churning of the ocean (Samudra Manthan), and she chose Lord Vishnu as her consort. People light lamps and keep their homes clean and bright to invite the goddess into their homes during Diwali night.
            </Text>

            <Text style={styles.storyHeading}>The Story of Bali and Vamana</Text>
            <Text style={styles.storyText}>
              In some regions, Diwali is linked with the story of King Bali and Lord Vishnu in his dwarf incarnation, Vamana. Vishnu suppressed King Bali's growing power and sent him to the netherworld but granted him permission to visit his people once a year during Diwali. This story highlights humility, devotion, and the balance of power between gods and humans.
            </Text>

            <Text style={styles.storyHeading}>The Significance of Govardhan Puja & Bhai Dooj</Text>
            <Text style={styles.storySubHeading}>Govardhan Puja:</Text>
            <Text style={styles.storyText}>
              Govardhan Puja (the day after Diwali) recalls how Lord Krishna lifted the Govardhan Hill to protect villagers from Indra's wrath.
            </Text>
            <Text style={styles.storySubHeading}>Bhai Dooj:</Text>
            <Text style={styles.storyText}>
              Bhai Dooj celebrates the bond between brothers and sisters, much like Raksha Bandhan, emphasizing family love and protection.
            </Text>

            <Text style={styles.storyHeading}>Cultural Meaning</Text>
            <Text style={styles.storyText}>
              Across India, the legends may differ, but the essence is the same: Diwali celebrates the victory of righteousness, the power of devotion, and the spreading of light and happiness. People light diyas, burst fireworks, exchange sweets, and decorate their homes to express joy and hope.
            </Text>

            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              The story of Diwali is not just one tale but a collection of myths and traditions that together embody India's cultural richness. Whether it is the return of Rama, the triumph of Krishna, or the blessings of Lakshmi, Diwali remains a festival of joy, family bonding, and renewal of faith. It teaches that no matter how dark the night, the light of truth and goodness will always prevail.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "दीवाली की कहानी",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              दीवाली, जिसे दीपावली (अर्थात "दीपों की पंक्ति") भी कहा जाता है, भारत और दुनिया भर में सबसे अधिक मनाए जाने वाले त्योहारों में से एक है। यह अंधकार पर प्रकाश, अज्ञान पर ज्ञान, और बुराई पर अच्छाई की जीत का प्रतीक है। यह त्योहार भारत के विभिन्न क्षेत्रों में कई किंवदंतियों से जुड़ा है, जो इसे विविध अर्थों के साथ एक वास्तविक पैन-भारतीय उत्सव बनाता है।
            </Text>

            <Text style={styles.storyHeading}>भगवान राम की वापसी</Text>
            <Text style={styles.storyText}>
              दीवाली की सबसे लोकप्रिय कहानी रामायण से आती है। 14 वर्ष के वनवास और राक्षस राजा रावण को हराने के बाद, भगवान राम अपनी पत्नी सीता और भाई लक्ष्मण के साथ अयोध्या लौटे। अयोध्या के लोगों ने मिट्टी के दीपकों (दीयों) की पंक्तियां जलाकर, शहर को सजाकर और खुशी के साथ उत्सव मनाकर उनका स्वागत किया। बुराई पर अच्छाई की जीत और धर्म की वापसी का प्रतीक दीपक जलाने की यह परंपरा दीवाली का सार है।
            </Text>

            <Text style={styles.storyHeading}>नरकासुर की कहानी</Text>
            <Text style={styles.storyText}>
              भारत के कई हिस्सों में, विशेष रूप से दक्षिण में, दीवाली भगवान कृष्ण की राक्षस राजा नरकासुर पर जीत का भी प्रतीक है। नरकासुर ने 16,000 महिलाओं को बंदी बनाया था और लोगों को आतंकित किया था। भगवान कृष्ण ने अपनी पत्नी सत्यभामा के साथ उसे हराकर बंदियों को मुक्त कराया। दीवाली से एक दिन पहले, जिसे नरक चतुर्दशी (छोटी दीवाली) कहा जाता है, इस जीत और क्रूरता के अंत की याद दिलाता है।
            </Text>

            <Text style={styles.storyHeading}>देवी लक्ष्मी</Text>
            <Text style={styles.storyText}>
              दीवाली देवी लक्ष्मी, धन, समृद्धि और भाग्य की देवी से भी जुड़ी है। किंवदंती के अनुसार, लक्ष्मी का जन्म समुद्र मंथन से हुआ था, और उन्होंने भगवान विष्णु को अपना पति चुना। लोग दीवाली की रात अपने घरों में देवी को आमंत्रित करने के लिए दीपक जलाते हैं और अपने घरों को साफ और चमकदार रखते हैं।
            </Text>

            <Text style={styles.storyHeading}>बलि और वामन की कहानी</Text>
            <Text style={styles.storyText}>
              कुछ क्षेत्रों में, दीवाली राजा बलि और भगवान विष्णु के बौने अवतार वामन की कहानी से जुड़ी है। विष्णु ने राजा बलि की बढ़ती शक्ति को दबाया और उसे पाताल भेज दिया लेकिन उसे दीवाली के दौरान साल में एक बार अपने लोगों से मिलने की अनुमति दी। यह कहानी विनम्रता, भक्ति और देवताओं और मनुष्यों के बीच शक्ति के संतुलन को उजागर करती है।
            </Text>

            <Text style={styles.storyHeading}>गोवर्धन पूजा और भाई दूज का महत्व</Text>
            <Text style={styles.storySubHeading}>गोवर्धन पूजा:</Text>
            <Text style={styles.storyText}>
              गोवर्धन पूजा (दीवाली के अगले दिन) याद दिलाती है कि कैसे भगवान कृष्ण ने इंद्र के क्रोध से ग्रामीणों की रक्षा के लिए गोवर्धन पर्वत को उठाया था।
            </Text>
            <Text style={styles.storySubHeading}>भाई दूज:</Text>
            <Text style={styles.storyText}>
              भाई दूज भाइयों और बहनों के बीच के बंधन का उत्सव मनाता है, जो रक्षा बंधन की तरह, पारिवारिक प्रेम और सुरक्षा पर जोर देता है।
            </Text>

            <Text style={styles.storyHeading}>सांस्कृतिक अर्थ</Text>
            <Text style={styles.storyText}>
              भारत भर में, किंवदंतियां अलग हो सकती हैं, लेकिन सार एक ही है: दीवाली धर्म की जीत, भक्ति की शक्ति, और प्रकाश और खुशी के प्रसार का उत्सव मनाती है। लोग दीये जलाते हैं, पटाखे फोड़ते हैं, मिठाइयां बांटते हैं, और खुशी और आशा व्यक्त करने के लिए अपने घरों को सजाते हैं।
            </Text>

            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              दीवाली की कहानी सिर्फ एक कथा नहीं है बल्कि मिथकों और परंपराओं का एक संग्रह है जो मिलकर भारत की सांस्कृतिक समृद्धि को दर्शाते हैं। चाहे वह राम की वापसी हो, कृष्ण की जीत हो, या लक्ष्मी का आशीर्वाद हो, दीवाली खुशी, पारिवारिक बंधन और आस्था के नवीकरण का त्योहार बनी हुई है। यह सिखाती है कि रात कितनी भी अंधेरी क्यों न हो, सत्य और अच्छाई का प्रकाश हमेशा विजयी होगा।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "দীপাবলির গল্প",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              দীপাবলি, যাকে দীপাবলি (অর্থাৎ "দীপের সারি") বলা হয়, ভারত এবং সারা বিশ্বে সবচেয়ে বেশি উদযাপিত উৎসবগুলির মধ্যে একটি। এটি অন্ধকারের উপর আলোর, অজ্ঞতার উপর জ্ঞানের এবং মন্দের উপর ভালোর জয়ের প্রতীক। এই উৎসব ভারতের বিভিন্ন অঞ্চলে একাধিক কিংবদন্তির সাথে যুক্ত, যা এটিকে বৈচিত্র্যময় অর্থ সহ একটি সত্যিকারের প্যান-ভারতীয় উদযাপনে পরিণত করেছে।
            </Text>

            <Text style={styles.storyHeading}>ভগবান রামের প্রত্যাবর্তন</Text>
            <Text style={styles.storyText}>
              দীপাবলির সবচেয়ে জনপ্রিয় গল্প রামায়ণ থেকে আসে। 14 বছরের নির্বাসন এবং রাক্ষস রাজা রাবণকে পরাজিত করার পর, ভগবান রাম তার স্ত্রী সীতা এবং ভাই লক্ষ্মণের সাথে অযোধ্যায় ফিরে আসেন। অযোধ্যার মানুষরা মাটির প্রদীপের (দিয়ার) সারি জ্বালিয়ে, শহর সাজিয়ে এবং আনন্দের সাথে উৎসব করে তাদের স্বাগত জানায়। মন্দের উপর ভালোর জয় এবং ধর্মের প্রত্যাবর্তনের প্রতীক হিসাবে প্রদীপ জ্বালানোর এই ঐতিহ্য দীপাবলির সারমর্ম।
            </Text>

            <Text style={styles.storyHeading}>নরকাসুরের গল্প</Text>
            <Text style={styles.storyText}>
              ভারতের অনেক অংশে, বিশেষ করে দক্ষিণে, দীপাবলি ভগবান কৃষ্ণের রাক্ষস রাজা নরকাসুরের উপর জয়েরও প্রতীক। নরকাসুর 16,000 মহিলাকে বন্দী করেছিল এবং মানুষকে আতঙ্কিত করেছিল। ভগবান কৃষ্ণ তার সহধর্মিণী সত্যাভামার সাথে তাকে পরাজিত করে বন্দীদের মুক্ত করেছিলেন। দীপাবলির এক দিন আগে, যাকে নরক চতুর্দশী (ছোট দীপাবলি) বলা হয়, এই জয় এবং নিষ্ঠুরতার সমাপ্তির স্মরণ করে।
            </Text>

            <Text style={styles.storyHeading}>দেবী লক্ষ্মী</Text>
            <Text style={styles.storyText}>
              দীপাবলি দেবী লক্ষ্মীর সাথেও যুক্ত, যিনি ধন, সমৃদ্ধি এবং ভাগ্যের দেবী। কিংবদন্তি অনুসারে, লক্ষ্মী সমুদ্র মন্থন থেকে জন্মগ্রহণ করেছিলেন এবং তিনি ভগবান বিষ্ণুকে তার সহধর্মিণী হিসাবে বেছে নিয়েছিলেন। মানুষ দীপাবলির রাতে তাদের বাড়িতে দেবীকে আমন্ত্রণ জানাতে প্রদীপ জ্বালায় এবং তাদের বাড়ি পরিষ্কার এবং উজ্জ্বল রাখে।
            </Text>

            <Text style={styles.storyHeading}>বলি এবং বামনের গল্প</Text>
            <Text style={styles.storyText}>
              কিছু অঞ্চলে, দীপাবলি রাজা বলি এবং ভগবান বিষ্ণুর বামন অবতারের গল্পের সাথে যুক্ত। বিষ্ণু রাজা বলির ক্রমবর্ধমান শক্তিকে দমন করেছিলেন এবং তাকে পাতালে পাঠিয়েছিলেন কিন্তু তাকে দীপাবলির সময় বছরে একবার তার লোকদের সাথে দেখা করার অনুমতি দিয়েছিলেন। এই গল্পটি বিনয়, ভক্তি এবং দেবতা ও মানুষের মধ্যে শক্তির ভারসাম্যকে তুলে ধরে।
            </Text>

            <Text style={styles.storyHeading}>গোবর্ধন পূজা এবং ভাই ফোটা-এর তাৎপর্য</Text>
            <Text style={styles.storySubHeading}>গোবর্ধন পূজা:</Text>
            <Text style={styles.storyText}>
              গোবর্ধন পূজা (দীপাবলির পরের দিন) স্মরণ করে যে কীভাবে ভগবান কৃষ্ণ ইন্দ্রের ক্রোধ থেকে গ্রামবাসীদের রক্ষা করতে গোবর্ধন পাহাড় তুলেছিলেন।
            </Text>
            <Text style={styles.storySubHeading}>ভাই ফোটা:</Text>
            <Text style={styles.storyText}>
              ভাই ফোটা ভাই ও বোনের মধ্যে বন্ধনের উদযাপন করে, রক্ষা বন্ধনের মতো, পারিবারিক ভালোবাসা এবং সুরক্ষার উপর জোর দেয়।
            </Text>

            <Text style={styles.storyHeading}>সাংস্কৃতিক অর্থ</Text>
            <Text style={styles.storyText}>
              সারা ভারত জুড়ে, কিংবদন্তিগুলি আলাদা হতে পারে, কিন্তু সারমর্ম একই: দীপাবলি ধার্মিকতার জয়, ভক্তির শক্তি এবং আলো ও সুখের বিস্তারের উদযাপন করে। মানুষ দিয়ার জ্বালায়, আতশবাজি ফাটায়, মিষ্টি বিনিময় করে এবং আনন্দ ও আশা প্রকাশ করতে তাদের বাড়ি সাজায়।
            </Text>

            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              দীপাবলির গল্প শুধু একটি গল্প নয় বরং কিংবদন্তি এবং ঐতিহ্যের একটি সংগ্রহ যা একসাথে ভারতের সাংস্কৃতিক সমৃদ্ধিকে মূর্ত করে। তা রামের প্রত্যাবর্তন হোক, কৃষ্ণের জয় হোক, বা লক্ষ্মীর আশীর্বাদ হোক, দীপাবলি আনন্দ, পারিবারিক বন্ধন এবং বিশ্বাসের নবায়নের উৎসব হিসাবে রয়ে গেছে। এটি শেখায় যে রাত যতই অন্ধকার হোক না কেন, সত্য এবং ভালোর আলো সর্বদা জয়ী হবে।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Durga story content
  const getDurgaStory = () => {
    const stories = {
      english: {
        title: "Durga Maa – The Divine Mother and Protector",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              Durga Maa, also known as Maa Durga, is one of the most revered and powerful goddesses in Hinduism. She embodies Shakti (divine feminine energy) and is worshipped as the supreme mother who protects her devotees from evil forces and restores balance in the universe. Durga is not only a symbol of power but also of compassion, love, and motherhood.
            </Text>

            <Text style={styles.storyHeading}>Origin and Mythology</Text>
            <Text style={styles.storyText}>
              According to Hindu mythology, Maa Durga was created by the combined energies of the gods Brahma, Vishnu, and Shiva to defeat the demon Mahishasura, who could not be killed by any man or god. She emerged as a radiant warrior goddess with ten arms, each carrying a weapon gifted by different gods. Riding a lion or tiger, she fought a fierce battle and finally killed Mahishasura, earning the title Mahishasura Mardini (the slayer of Mahishasura). This victory represents the triumph of good over evil and is celebrated during Navratri and Durga Puja.
            </Text>

            <Text style={styles.storyHeading}>Symbolism of Durga Maa</Text>
            <Text style={styles.storySubHeading}>Ten Arms:</Text>
            <Text style={styles.storyText}>Represent her ability to protect devotees from all directions and her many powers.</Text>
            <Text style={styles.storySubHeading}>Weapons:</Text>
            <Text style={styles.storyText}>Each weapon symbolizes divine attributes, such as wisdom (trident), strength (sword), and protection (chakra).</Text>
            <Text style={styles.storySubHeading}>Lion/Tiger:</Text>
            <Text style={styles.storyText}>Represents courage and strength, showing that Durga controls even the most ferocious creatures.</Text>
            <Text style={styles.storySubHeading}>Tranquil Face:</Text>
            <Text style={styles.storyText}>Despite being a warrior, her calm and motherly expression shows she destroys evil with compassion, not hatred.</Text>

            <Text style={styles.storyHeading}>Festivals Dedicated to Maa Durga</Text>
            <Text style={styles.storySubHeading}>Navratri (Nine Nights)</Text>
            <Text style={styles.storyText}>
              Celebrated twice a year (Sharad Navratri in autumn and Chaitra Navratri in spring). Devotees worship the nine forms of Durga (Navadurga), each representing different powers of the goddess.
            </Text>
            <Text style={styles.storySubHeading}>Durga Puja</Text>
            <Text style={styles.storyText}>
              A grand festival in West Bengal, Odisha, Assam, and other parts of India. Celebrates her victory over Mahishasura, with artistic idols, processions, cultural performances, and prayers.
            </Text>
            <Text style={styles.storySubHeading}>Vijayadashami (Dussehra)</Text>
            <Text style={styles.storyText}>
              Marks the day of victory of Maa Durga over Mahishasura and Lord Rama over Ravana. Symbolizes the end of negativity and the beginning of righteousness.
            </Text>

            <Text style={styles.storyHeading}>Spiritual Significance</Text>
            <Text style={styles.storyText}>
              Maa Durga represents inner strength and resilience. She teaches us that true power lies in facing challenges with courage while remaining compassionate. Worshipping her is believed to bring protection, prosperity, wisdom, and peace.
            </Text>

            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              Durga Maa is the eternal mother and protector, a divine force that nurtures her children while destroying evil. Her presence assures devotees that no matter how strong negativity may seem, the light of truth, courage, and love will always prevail. Celebrating Maa Durga is not just a religious act—it is an acknowledgment of the Shakti within every being.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "दुर्गा माँ – दिव्य माता और रक्षक",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              दुर्गा माँ, जिसे माँ दुर्गा भी कहा जाता है, हिंदू धर्म में सबसे पूजनीय और शक्तिशाली देवी-देवताओं में से एक हैं। वे शक्ति (दिव्य स्त्री ऊर्जा) का प्रतीक हैं और सर्वोच्च माता के रूप में पूजी जाती हैं जो अपने भक्तों को बुरी शक्तियों से बचाती हैं और ब्रह्मांड में संतुलन बहाल करती हैं। दुर्गा न केवल शक्ति का प्रतीक हैं बल्कि करुणा, प्रेम और मातृत्व का भी।
            </Text>

            <Text style={styles.storyHeading}>उत्पत्ति और पौराणिक कथा</Text>
            <Text style={styles.storyText}>
              हिंदू पौराणिक कथाओं के अनुसार, माँ दुर्गा को देवताओं ब्रह्मा, विष्णु और शिव की संयुक्त ऊर्जा से राक्षस महिषासुर को हराने के लिए बनाया गया था, जिसे कोई भी मनुष्य या देवता नहीं मार सकता था। वे दस भुजाओं वाली एक चमकदार योद्धा देवी के रूप में प्रकट हुईं, जिनमें से प्रत्येक भुजा में विभिन्न देवताओं द्वारा दिए गए अस्त्र-शस्त्र थे। शेर या बाघ पर सवार होकर, उन्होंने एक भयंकर युद्ध लड़ा और अंततः महिषासुर को मार डाला, महिषासुर मर्दिनी (महिषासुर की हत्यारी) की उपाधि प्राप्त की। यह जीत बुराई पर अच्छाई की जीत का प्रतीक है और नवरात्रि और दुर्गा पूजा के दौरान मनाई जाती है।
            </Text>

            <Text style={styles.storyHeading}>दुर्गा माँ का प्रतीकवाद</Text>
            <Text style={styles.storySubHeading}>दस भुजाएं:</Text>
            <Text style={styles.storyText}>सभी दिशाओं से भक्तों की रक्षा करने की उनकी क्षमता और उनकी कई शक्तियों का प्रतीक हैं।</Text>
            <Text style={styles.storySubHeading}>अस्त्र-शस्त्र:</Text>
            <Text style={styles.storyText}>प्रत्येक अस्त्र दिव्य गुणों का प्रतीक है, जैसे ज्ञान (त्रिशूल), शक्ति (तलवार), और सुरक्षा (चक्र)।</Text>
            <Text style={styles.storySubHeading}>शेर/बाघ:</Text>
            <Text style={styles.storyText}>साहस और शक्ति का प्रतीक है, यह दिखाता है कि दुर्गा सबसे भयंकर प्राणियों को भी नियंत्रित करती हैं।</Text>
            <Text style={styles.storySubHeading}>शांत चेहरा:</Text>
            <Text style={styles.storyText}>योद्धा होने के बावजूद, उनका शांत और मातृत्वपूर्ण भाव दिखाता है कि वे घृणा नहीं बल्कि करुणा से बुराई का विनाश करती हैं।</Text>

            <Text style={styles.storyHeading}>माँ दुर्गा को समर्पित त्योहार</Text>
            <Text style={styles.storySubHeading}>नवरात्रि (नौ रातें)</Text>
            <Text style={styles.storyText}>
              साल में दो बार मनाई जाती है (शरद नवरात्रि शरद ऋतु में और चैत्र नवरात्रि वसंत में)। भक्त दुर्गा के नौ रूपों (नवदुर्गा) की पूजा करते हैं, जिनमें से प्रत्येक देवी की विभिन्न शक्तियों का प्रतिनिधित्व करता है।
            </Text>
            <Text style={styles.storySubHeading}>दुर्गा पूजा</Text>
            <Text style={styles.storyText}>
              पश्चिम बंगाल, ओडिशा, असम और भारत के अन्य हिस्सों में एक भव्य त्योहार। कलात्मक मूर्तियों, जुलूसों, सांस्कृतिक प्रदर्शनों और प्रार्थनाओं के साथ महिषासुर पर उनकी जीत का जश्न मनाता है।
            </Text>
            <Text style={styles.storySubHeading}>विजयदशमी (दशहरा)</Text>
            <Text style={styles.storyText}>
              माँ दुर्गा की महिषासुर पर और भगवान राम की रावण पर जीत के दिन को चिह्नित करता है। नकारात्मकता के अंत और धर्म की शुरुआत का प्रतीक है।
            </Text>

            <Text style={styles.storyHeading}>आध्यात्मिक महत्व</Text>
            <Text style={styles.storyText}>
              माँ दुर्गा आंतरिक शक्ति और लचीलेपन का प्रतीक हैं। वे हमें सिखाती हैं कि सच्ची शक्ति करुणा बनाए रखते हुए साहस के साथ चुनौतियों का सामना करने में निहित है। उनकी पूजा करने से सुरक्षा, समृद्धि, ज्ञान और शांति मिलती है।
            </Text>

            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              दुर्गा माँ शाश्वत माता और रक्षक हैं, एक दिव्य शक्ति जो बुराई का विनाश करते हुए अपने बच्चों का पालन-पोषण करती है। उनकी उपस्थिति भक्तों को आश्वस्त करती है कि नकारात्मकता कितनी भी मजबूत क्यों न लगे, सत्य, साहस और प्रेम का प्रकाश हमेशा विजयी होगा। माँ दुर्गा का जश्न मनाना केवल एक धार्मिक कार्य नहीं है—यह हर प्राणी के भीतर की शक्ति की स्वीकृति है।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "দুর্গা মা – দিব্য মাতা এবং রক্ষক",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              দুর্গা মা, যাকে মা দুর্গাও বলা হয়, হিন্দুধর্মের সবচেয়ে শ্রদ্ধেয় এবং শক্তিশালী দেবীদের মধ্যে একজন। তিনি শক্তি (দিব্য নারী শক্তি) এর প্রতীক এবং সর্বোচ্চ মাতা হিসেবে পূজিত হন যিনি তার ভক্তদের দুষ্ট শক্তি থেকে রক্ষা করেন এবং মহাবিশ্বে ভারসাম্য পুনরুদ্ধার করেন। দুর্গা কেবল শক্তির প্রতীক নন, বরং করুণা, প্রেম এবং মাতৃত্বেরও।
            </Text>

            <Text style={styles.storyHeading}>উৎপত্তি এবং পুরাণ</Text>
            <Text style={styles.storyText}>
              হিন্দু পুরাণ অনুসারে, মা দুর্গাকে দেবতাদের ব্রহ্মা, বিষ্ণু এবং শিবের সম্মিলিত শক্তি দিয়ে মহিষাসুর রাক্ষসকে পরাজিত করার জন্য তৈরি করা হয়েছিল, যাকে কোনো মানুষ বা দেবতা হত্যা করতে পারত না। তিনি দশটি বাহু সহ একটি উজ্জ্বল যোদ্ধা দেবী হিসেবে আবির্ভূত হন, যার প্রতিটি বাহুতে বিভিন্ন দেবতাদের দেওয়া অস্ত্র ছিল। সিংহ বা বাঘে চড়ে, তিনি একটি ভয়াবহ যুদ্ধ করেছিলেন এবং অবশেষে মহিষাসুরকে হত্যা করেছিলেন, মহিষাসুর মর্দিনী (মহিষাসুরের হত্যাকারী) উপাধি অর্জন করেছিলেন। এই বিজয় মন্দের উপর ভালোর জয়ের প্রতীক এবং নবরাত্রি এবং দুর্গা পূজার সময় উদযাপিত হয়।
            </Text>

            <Text style={styles.storyHeading}>দুর্গা মা এর প্রতীকবাদ</Text>
            <Text style={styles.storySubHeading}>দশ বাহু:</Text>
            <Text style={styles.storyText}>সব দিক থেকে ভক্তদের রক্ষা করার এবং তার অনেক শক্তির প্রতীক।</Text>
            <Text style={styles.storySubHeading}>অস্ত্র:</Text>
            <Text style={styles.storyText}>প্রতিটি অস্ত্র দিব্য গুণাবলীর প্রতীক, যেমন জ্ঞান (ত্রিশূল), শক্তি (তরবারি), এবং সুরক্ষা (চক্র)।</Text>
            <Text style={styles.storySubHeading}>সিংহ/বাঘ:</Text>
            <Text style={styles.storyText}>সাহস এবং শক্তির প্রতীক, দেখায় যে দুর্গা সবচেয়ে ভয়ঙ্কর প্রাণীদেরও নিয়ন্ত্রণ করেন।</Text>
            <Text style={styles.storySubHeading}>শান্ত মুখ:</Text>
            <Text style={styles.storyText}>যোদ্ধা হওয়া সত্ত্বেও, তার শান্ত এবং মাতৃসুলভ অভিব্যক্তি দেখায় যে তিনি ঘৃণা নয়, করুণা দিয়ে মন্দকে ধ্বংস করেন।</Text>

            <Text style={styles.storyHeading}>মা দুর্গার প্রতি উৎসর্গিত উৎসব</Text>
            <Text style={styles.storySubHeading}>নবরাত্রি (নয় রাত)</Text>
            <Text style={styles.storyText}>
              বছরে দুবার উদযাপিত হয় (শরৎ নবরাত্রি শরতে এবং চৈত্র নবরাত্রি বসন্তে)। ভক্তেরা দুর্গার নয়টি রূপের (নবদুর্গা) পূজা করেন, যার প্রতিটি দেবীর বিভিন্ন শক্তির প্রতিনিধিত্ব করে।
            </Text>
            <Text style={styles.storySubHeading}>দুর্গা পূজা</Text>
            <Text style={styles.storyText}>
              পশ্চিমবঙ্গ, ওড়িশা, আসাম এবং ভারতের অন্যান্য অংশে একটি মহান উৎসব। শৈল্পিক মূর্তি, শোভাযাত্রা, সাংস্কৃতিক অনুষ্ঠান এবং প্রার্থনার সাথে মহিষাসুরের উপর তার বিজয় উদযাপন করে।
            </Text>
            <Text style={styles.storySubHeading}>বিজয়াদশমী (দশেরা)</Text>
            <Text style={styles.storyText}>
              মা দুর্গার মহিষাসুরের উপর এবং ভগবান রামের রাবণের উপর বিজয়ের দিন চিহ্নিত করে। নেতিবাচকতার শেষ এবং ধার্মিকতার শুরুকে প্রতীকায়িত করে।
            </Text>

            <Text style={styles.storyHeading}>আধ্যাত্মিক তাৎপর্য</Text>
            <Text style={styles.storyText}>
              মা দুর্গা অভ্যন্তরীণ শক্তি এবং সহনশীলতার প্রতীক। তিনি আমাদের শেখান যে সত্যিকারের শক্তি সাহসের সাথে চ্যালেঞ্জ মোকাবেলা করার মধ্যে নিহিত, করুণা বজায় রেখে। তাকে পূজা করলে সুরক্ষা, সমৃদ্ধি, জ্ঞান এবং শান্তি আনে বলে বিশ্বাস করা হয়।
            </Text>

            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              দুর্গা মা হলেন চিরন্তন মাতা এবং রক্ষক, একটি দিব্য শক্তি যা মন্দকে ধ্বংস করার সময় তার সন্তানদের লালন-পালন করে। তার উপস্থিতি ভক্তদের আশ্বস্ত করে যে নেতিবাচকতা যতই শক্তিশালী মনে হোক না কেন, সত্য, সাহস এবং প্রেমের আলো সর্বদা জয়ী হবে। মা দুর্গার উদযাপন কেবল একটি ধর্মীয় কাজ নয়—এটি প্রতিটি প্রাণীর মধ্যে শক্তির স্বীকৃতি।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Golden Temple story content
  const getGoldenTempleStory = () => {
    const stories = {
      english: {
        title: "The Golden Temple – Harmandir Sahib",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              The Golden Temple, also known as Sri Harmandir Sahib, is the holiest shrine of Sikhism. Located in Amritsar, Punjab (India), it is a symbol of equality, peace, and spirituality. The temple attracts millions of devotees and visitors from all over the world, not only for its stunning architecture but also for the message of unity and devotion it represents.
            </Text>
            <Text style={styles.storyHeading}>History and Foundation</Text>
            <Text style={styles.storyText}>
              The Golden Temple was founded in 1581 by Guru Arjan Dev Ji, the fifth Sikh Guru. He envisioned a central place of worship for all Sikhs and laid the foundation of the shrine in the holy city of Amritsar. The temple's foundation stone was laid by the Muslim saint Sai Mian Mir, symbolizing inclusivity and respect for all faiths.
            </Text>
            <Text style={styles.storyHeading}>Architecture</Text>
            <Text style={styles.storyText}>
              The Golden Temple is a stunning blend of Hindu and Islamic architectural styles, symbolizing harmony. It is built on a square platform, surrounded by the Amrit Sarovar (holy pool of nectar), from which the city Amritsar derives its name. The temple's dome and upper floors are covered in pure gold, which glitters beautifully under sunlight and moonlight.
            </Text>
            <Text style={styles.storyHeading}>Langar – The Community Kitchen</Text>
            <Text style={styles.storyText}>
              One of the most remarkable features of the Golden Temple is the Langar, a free community kitchen that serves meals to over 50,000 people daily. Everyone, regardless of religion, caste, or status, sits together on the floor to share a simple meal, reflecting the Sikh values of equality, humility, and selfless service.
            </Text>
            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              The Golden Temple stands as a shining symbol of faith, equality, and human unity. With its golden dome reflecting in the sacred waters, the sound of divine hymns filling the air, and the spirit of service alive in every corner, Harmandir Sahib continues to inspire millions.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "स्वर्ण मंदिर – हरमंदिर साहिब",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              स्वर्ण मंदिर, जिसे श्री हरमंदिर साहिब भी कहा जाता है, सिख धर्म का सबसे पवित्र तीर्थ स्थल है। पंजाब के अमृतसर में स्थित, यह समानता, शांति और आध्यात्मिकता का प्रतीक है। यह मंदिर दुनिया भर से लाखों भक्तों और पर्यटकों को आकर्षित करता है।
            </Text>
            <Text style={styles.storyHeading}>इतिहास और नींव</Text>
            <Text style={styles.storyText}>
              स्वर्ण मंदिर की स्थापना 1581 में पांचवें सिख गुरु गुरु अर्जुन देव जी ने की थी। उन्होंने सभी सिखों के लिए एक केंद्रीय पूजा स्थल की कल्पना की और पवित्र शहर अमृतसर में इस तीर्थ की नींव रखी।
            </Text>
            <Text style={styles.storyHeading}>वास्तुकला</Text>
            <Text style={styles.storyText}>
              स्वर्ण मंदिर हिंदू और इस्लामी वास्तुकला शैलियों का एक शानदार मिश्रण है, जो सामंजस्य का प्रतीक है। यह एक वर्गाकार मंच पर बना है, जो अमृत सरोवर (अमृत का पवित्र तालाब) से घिरा है।
            </Text>
            <Text style={styles.storyHeading}>लंगर – सामुदायिक रसोई</Text>
            <Text style={styles.storyText}>
              स्वर्ण मंदिर की सबसे उल्लेखनीय विशेषताओं में से एक लंगर है, एक मुफ्त सामुदायिक रसोई जो प्रतिदिन 50,000 से अधिक लोगों को भोजन परोसती है।
            </Text>
            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              स्वर्ण मंदिर आस्था, समानता और मानव एकता का एक चमकदार प्रतीक है। अपने स्वर्ण गुंबद के साथ पवित्र जल में परावर्तित होते हुए, हरमंदिर साहिब लाखों लोगों को प्रेरित करता रहता है।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "সোনার মন্দির – হরমন্দির সাহিব",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              সোনার মন্দির, যাকে শ্রী হরমন্দির সাহিবও বলা হয়, শিখ ধর্মের সবচেয়ে পবিত্র তীর্থস্থান। পাঞ্জাবের অমৃতসরে অবস্থিত, এটি সমতা, শান্তি এবং আধ্যাত্মিকতার প্রতীক। এই মন্দির বিশ্বজুড়ে লক্ষ লক্ষ ভক্ত এবং দর্শনার্থীদের আকর্ষণ করে।
            </Text>
            <Text style={styles.storyHeading}>ইতিহাস এবং প্রতিষ্ঠা</Text>
            <Text style={styles.storyText}>
              সোনার মন্দির ১৫৮১ সালে পঞ্চম শিখ গুরু গুরু অর্জুন দেব জি প্রতিষ্ঠা করেছিলেন। তিনি সব শিখদের জন্য একটি কেন্দ্রীয় উপাসনা স্থলের কল্পনা করেছিলেন এবং পবিত্র শহর অমৃতসরে এই তীর্থের ভিত্তি স্থাপন করেছিলেন।
            </Text>
            <Text style={styles.storyHeading}>স্থাপত্য</Text>
            <Text style={styles.storyText}>
              সোনার মন্দির হিন্দু এবং ইসলামিক স্থাপত্য শৈলীর একটি চমৎকার মিশ্রণ, যা সাদৃশ্যের প্রতীক। এটি একটি বর্গাকার প্ল্যাটফর্মে নির্মিত, যা অমৃত সরোবর (অমৃতের পবিত্র পুকুর) দ্বারা বেষ্টিত।
            </Text>
            <Text style={styles.storyHeading}>লঙ্গর – সম্প্রদায়ের রান্নাঘর</Text>
            <Text style={styles.storyText}>
              সোনার মন্দিরের সবচেয়ে উল্লেখযোগ্য বৈশিষ্ট্যগুলির মধ্যে একটি হল লঙ্গর, একটি বিনামূল্যের সম্প্রদায় রান্নাঘর যা প্রতিদিন ৫০,০০০ এরও বেশি লোককে খাবার পরিবেশন করে।
            </Text>
            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              সোনার মন্দির বিশ্বাস, সমতা এবং মানব ঐক্যের একটি উজ্জ্বল প্রতীক। তার সোনার গম্বুজ পবিত্র জলে প্রতিফলিত হয়ে, হরমন্দির সাহিব লক্ষ লক্ষ মানুষকে অনুপ্রাণিত করে চলেছে।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Ram Mandir story content
  const getRamMandirStory = () => {
    const stories = {
      english: {
        title: "Ram Mandir – Ayodhya",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              The Ram Mandir in Ayodhya, Uttar Pradesh, is one of the most significant temples in India, dedicated to Lord Rama, the seventh avatar of Lord Vishnu. The temple is being built on the sacred site believed to be the birthplace (Janmabhoomi) of Lord Rama, making it a deeply revered pilgrimage center for Hindus across the world.
            </Text>
            <Text style={styles.storyHeading}>Historical and Religious Significance</Text>
            <Text style={styles.storyText}>
              Ayodhya, situated on the banks of the river Sarayu, is described in ancient scriptures like the Ramayana, Skanda Purana, and Atharva Veda as the birthplace of Lord Rama. The site has been a center of devotion for centuries, with pilgrims visiting to pay homage to Lord Rama.
            </Text>
            <Text style={styles.storyHeading}>The Temple Movement</Text>
            <Text style={styles.storyText}>
              Over the centuries, the site became the subject of historical and political conflict. In recent times, after long legal proceedings, the Supreme Court of India in 2019 ruled in favor of building a temple at the Ram Janmabhoomi site. The historic Bhoomi Pujan (foundation ceremony) for the new temple took place on 5 August 2020.
            </Text>
            <Text style={styles.storyHeading}>Architecture and Design</Text>
            <Text style={styles.storyText}>
              The Ram Mandir has been designed in the Nagara style of temple architecture, known for its grandeur and intricacy. The temple will stand 161 feet high with three stories, five domes and one main spire (shikhara). The sanctum will house the idol of Ram Lalla (child form of Lord Rama).
            </Text>
            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              The Ram Mandir in Ayodhya is more than a temple—it is a symbol of heritage, faith, and cultural pride. Rising from centuries of devotion and struggle, the temple stands as a beacon of Hindu spirituality and the timeless message of Lord Rama: dharma, truth, and righteousness will always triumph.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "राम मंदिर – अयोध्या",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              उत्तर प्रदेश के अयोध्या में स्थित राम मंदिर भारत के सबसे महत्वपूर्ण मंदिरों में से एक है, जो भगवान राम, भगवान विष्णु के सातवें अवतार को समर्पित है। यह मंदिर उस पवित्र स्थल पर बनाया जा रहा है जिसे भगवान राम का जन्मस्थान (जन्मभूमि) माना जाता है।
            </Text>
            <Text style={styles.storyHeading}>ऐतिहासिक और धार्मिक महत्व</Text>
            <Text style={styles.storyText}>
              सरयू नदी के तट पर स्थित अयोध्या को रामायण, स्कंद पुराण और अथर्ववेद जैसे प्राचीन ग्रंथों में भगवान राम का जन्मस्थान बताया गया है। यह स्थल सदियों से भक्ति का केंद्र रहा है।
            </Text>
            <Text style={styles.storyHeading}>मंदिर आंदोलन</Text>
            <Text style={styles.storyText}>
              सदियों से यह स्थल ऐतिहासिक और राजनीतिक संघर्ष का विषय रहा। हाल के समय में, लंबी कानूनी कार्यवाही के बाद, भारत के सुप्रीम कोर्ट ने 2019 में राम जन्मभूमि स्थल पर मंदिर बनाने के पक्ष में फैसला दिया।
            </Text>
            <Text style={styles.storyHeading}>वास्तुकला और डिजाइन</Text>
            <Text style={styles.storyText}>
              राम मंदिर को नागर शैली के मंदिर वास्तुकला में डिजाइन किया गया है, जो अपनी भव्यता और जटिलता के लिए जानी जाती है। मंदिर 161 फीट ऊंचा होगा और इसमें तीन मंजिल, पांच गुंबद और एक मुख्य शिखर होगा।
            </Text>
            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              अयोध्या का राम मंदिर केवल एक मंदिर नहीं है—यह विरासत, आस्था और सांस्कृतिक गौरव का प्रतीक है। सदियों की भक्ति और संघर्ष से उत्पन्न, यह मंदिर हिंदू आध्यात्मिकता का प्रकाशस्तंभ है।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "রাম মন্দির – অযোধ্যা",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              উত্তরপ্রদেশের অযোধ্যায় অবস্থিত রাম মন্দির ভারতের সবচেয়ে গুরুত্বপূর্ণ মন্দিরগুলির মধ্যে একটি, যা ভগবান রাম, ভগবান বিষ্ণুর সপ্তম অবতারের প্রতি উৎসর্গীকৃত। এই মন্দিরটি সেই পবিত্র স্থানে নির্মিত হচ্ছে যাকে ভগবান রামের জন্মস্থান (জন্মভূমি) বলে মনে করা হয়।
            </Text>
            <Text style={styles.storyHeading}>ঐতিহাসিক এবং ধর্মীয় তাৎপর্য</Text>
            <Text style={styles.storyText}>
              সরযু নদীর তীরে অবস্থিত অযোধ্যাকে রামায়ণ, স্কন্দ পুরাণ এবং অথর্ববেদের মতো প্রাচীন শাস্ত্রে ভগবান রামের জন্মস্থান হিসেবে বর্ণনা করা হয়েছে। এই স্থানটি শতাব্দী ধরে ভক্তির কেন্দ্র ছিল।
            </Text>
            <Text style={styles.storyHeading}>মন্দির আন্দোলন</Text>
            <Text style={styles.storyText}>
              শতাব্দী ধরে এই স্থানটি ঐতিহাসিক এবং রাজনৈতিক সংঘাতের বিষয় হয়ে উঠেছিল। সাম্প্রতিক সময়ে, দীর্ঘ আইনি কার্যক্রমের পর, ভারতের সুপ্রিম কোর্ট ২০১৯ সালে রাম জন্মভূমি স্থানে মন্দির নির্মাণের পক্ষে রায় দিয়েছিল।
            </Text>
            <Text style={styles.storyHeading}>স্থাপত্য এবং নকশা</Text>
            <Text style={styles.storyText}>
              রাম মন্দিরটি নাগর শৈলীর মন্দির স্থাপত্যে নকশা করা হয়েছে, যা তার মহিমা এবং জটিলতার জন্য পরিচিত। মন্দিরটি ১৬১ ফুট উঁচু হবে এবং এতে তিনটি তলা, পাঁচটি গম্বুজ এবং একটি প্রধান শিখর থাকবে।
            </Text>
            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              অযোধ্যার রাম মন্দির কেবল একটি মন্দির নয়—এটি ঐতিহ্য, বিশ্বাস এবং সাংস্কৃতিক গর্বের প্রতীক। শতাব্দীর ভক্তি এবং সংগ্রাম থেকে উত্থিত, এই মন্দির হিন্দু আধ্যাত্মিকতার একটি আলোকস্তম্ভ।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Shiv Ji story content
  const getShivJiStory = () => {
    const stories = {
      english: {
        title: "Lord Shiva – The Supreme Being",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              Lord Shiva, often called Mahadeva (the Great God), is one of the principal deities of Hinduism and a member of the Trimurti, along with Brahma (the creator) and Vishnu (the preserver). Revered as both the destroyer and transformer, Shiv Ji symbolizes the eternal cycle of creation, preservation, and dissolution.
            </Text>
            <Text style={styles.storyHeading}>Iconography and Symbolism</Text>
            <Text style={styles.storySubHeading}>Trinetra (Third Eye):</Text>
            <Text style={styles.storyText}>Represents wisdom and the power to destroy ignorance and evil.</Text>
            <Text style={styles.storySubHeading}>Crescent Moon:</Text>
            <Text style={styles.storyText}>Symbolizes time and its cycles, showing Shiva's mastery over it.</Text>
            <Text style={styles.storySubHeading}>River Ganga Flowing from Hair:</Text>
            <Text style={styles.storyText}>Represents purity and life-giving energy, as Shiva released the Ganga from his locks to save the earth.</Text>
            <Text style={styles.storySubHeading}>Blue Throat (Neelkanth):</Text>
            <Text style={styles.storyText}>After consuming the deadly poison during the churning of the ocean, his throat turned blue, symbolizing his role as protector of creation.</Text>
            <Text style={styles.storyHeading}>Spiritual Significance</Text>
            <Text style={styles.storyText}>
              Shiva represents detachment, meditation, and self-realization, teaching that true happiness lies within. As Bholenath (the innocent lord), he is easily pleased by sincere devotion and grants blessings generously. He embodies the union of opposites: fierce yet compassionate, ascetic yet householder, destroyer yet savior.
            </Text>
            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              Lord Shiva is not only a destroyer of evil but also the compassionate father and protector of the universe. He teaches balance—between worldly life and spiritual pursuit, between creation and dissolution. To devotees, Shiv Ji is both a fearsome force of nature and the kind, benevolent Bholenath, always ready to bless those who call upon him with love and sincerity.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "भगवान शिव – सर्वोच्च सत्ता",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              भगवान शिव, जिन्हें अक्सर महादेव (महान देवता) कहा जाता है, हिंदू धर्म के प्रमुख देवताओं में से एक हैं और त्रिमूर्ति के सदस्य हैं, जिसमें ब्रह्मा (सृष्टिकर्ता) और विष्णु (पालनकर्ता) भी शामिल हैं। विनाशक और रूपांतरक दोनों के रूप में पूजे जाने वाले शिव जी सृष्टि, पालन और विनाश के अनंत चक्र का प्रतीक हैं।
            </Text>
            <Text style={styles.storyHeading}>प्रतीकवाद</Text>
            <Text style={styles.storySubHeading}>त्रिनेत्र (तीसरी आंख):</Text>
            <Text style={styles.storyText}>ज्ञान और अज्ञान तथा बुराई को नष्ट करने की शक्ति का प्रतीक है।</Text>
            <Text style={styles.storySubHeading}>अर्धचंद्र:</Text>
            <Text style={styles.storyText}>समय और उसके चक्रों का प्रतीक है, जो शिव के उस पर नियंत्रण को दिखाता है।</Text>
            <Text style={styles.storySubHeading}>जटाओं से बहती गंगा:</Text>
            <Text style={styles.storyText}>पवित्रता और जीवनदायी ऊर्जा का प्रतीक है, क्योंकि शिव ने पृथ्वी को बचाने के लिए अपनी जटाओं से गंगा को मुक्त किया था।</Text>
            <Text style={styles.storySubHeading}>नीला कंठ (नीलकंठ):</Text>
            <Text style={styles.storyText}>समुद्र मंथन के दौरान घातक विष पीने के बाद उनका कंठ नीला हो गया, जो सृष्टि के रक्षक के रूप में उनकी भूमिका का प्रतीक है।</Text>
            <Text style={styles.storyHeading}>आध्यात्मिक महत्व</Text>
            <Text style={styles.storyText}>
              शिव वैराग्य, ध्यान और आत्म-साक्षात्कार का प्रतीक हैं, यह सिखाते हैं कि सच्ची खुशी भीतर निहित है। भोलेनाथ (निर्दोष प्रभु) के रूप में, वे सच्ची भक्ति से आसानी से प्रसन्न हो जाते हैं और उदारतापूर्वक आशीर्वाद देते हैं।
            </Text>
            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              भगवान शिव न केवल बुराई के विनाशक हैं बल्कि ब्रह्मांड के करुणामय पिता और रक्षक भी हैं। वे संतुलन सिखाते हैं—सांसारिक जीवन और आध्यात्मिक खोज के बीच, सृष्टि और विनाश के बीच।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "ভগবান শিব – সর্বোচ্চ সত্তা",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              ভগবান শিব, যাকে প্রায়ই মহাদেব (মহান দেবতা) বলা হয়, হিন্দুধর্মের প্রধান দেবতাদের মধ্যে একজন এবং ত্রিমূর্তির সদস্য, ব্রহ্মা (স্রষ্টা) এবং বিষ্ণু (পালনকারী) এর সাথে। ধ্বংসকারী এবং রূপান্তরকারী উভয় হিসাবে পূজিত, শিব জি সৃষ্টি, সংরক্ষণ এবং বিলুপ্তির অনন্ত চক্রের প্রতীক।
            </Text>
            <Text style={styles.storyHeading}>প্রতীকবাদ</Text>
            <Text style={styles.storySubHeading}>ত্রিনেত্র (তৃতীয় চোখ):</Text>
            <Text style={styles.storyText}>জ্ঞান এবং অজ্ঞতা ও মন্দকে ধ্বংস করার শক্তির প্রতীক।</Text>
            <Text style={styles.storySubHeading}>অর্ধচন্দ্র:</Text>
            <Text style={styles.storyText}>সময় এবং তার চক্রের প্রতীক, শিবের উপর তার আধিপত্য দেখায়।</Text>
            <Text style={styles.storySubHeading}>চুল থেকে প্রবাহিত গঙ্গা:</Text>
            <Text style={styles.storyText}>পবিত্রতা এবং জীবনদায়ী শক্তির প্রতীক, শিব পৃথিবীকে বাঁচাতে তার চুল থেকে গঙ্গাকে মুক্ত করেছিলেন।</Text>
            <Text style={styles.storySubHeading}>নীল গলা (নীলকণ্ঠ):</Text>
            <Text style={styles.storyText}>সমুদ্র মন্থনের সময় মারাত্মক বিষ পান করার পর তার গলা নীল হয়ে গিয়েছিল, সৃষ্টির রক্ষক হিসেবে তার ভূমিকার প্রতীক।</Text>
            <Text style={styles.storyHeading}>আধ্যাত্মিক তাৎপর্য</Text>
            <Text style={styles.storyText}>
              শিব বৈরাগ্য, ধ্যান এবং আত্ম-উপলব্ধির প্রতীক, শেখান যে সত্যিকারের সুখ ভিতরে নিহিত। ভোলেনাথ (নির্দোষ প্রভু) হিসেবে, তিনি আন্তরিক ভক্তিতে সহজেই সন্তুষ্ট হন এবং উদারভাবে আশীর্বাদ দেন।
            </Text>
            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              ভগবান শিব কেবল মন্দের ধ্বংসকারী নন, বরং মহাবিশ্বের করুণাময় পিতা এবং রক্ষক। তিনি ভারসাম্য শেখান—সাংসারিক জীবন এবং আধ্যাত্মিক সাধনার মধ্যে, সৃষ্টি এবং বিলুপ্তির মধ্যে।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  // Get Sri Ram story content
  const getSriRamStory = () => {
    const stories = {
      english: {
        title: "Lord Sri Ram – Maryada Purushottam",
        content: (
          <View>
            <Text style={styles.storyHeading}>Introduction</Text>
            <Text style={styles.storyText}>
              Lord Sri Ram, the seventh incarnation (avatar) of Lord Vishnu, is one of the most revered deities in Hinduism. Known as Maryada Purushottam (the ideal man of righteousness), he is celebrated as the embodiment of truth, virtue, honor, and duty. His life and teachings, as narrated in the great epic Ramayana, continue to inspire millions across the world.
            </Text>
            <Text style={styles.storyHeading}>Birth and Early Life</Text>
            <Text style={styles.storyText}>
              Sri Ram was born in Ayodhya, in the royal family of King Dasharatha and Queen Kaushalya. His birth is celebrated as Ram Navami, one of the most important Hindu festivals. From a young age, Ram was known for his humility, courage, and devotion to dharma (righteousness).
            </Text>
            <Text style={styles.storyHeading}>Marriage to Sita</Text>
            <Text style={styles.storyText}>
              Sri Ram won the hand of Mata Sita, daughter of King Janaka, by lifting and stringing the divine bow of Lord Shiva at her swayamvar. Their marriage is considered a symbol of purity, devotion, and eternal love.
            </Text>
            <Text style={styles.storyHeading}>Exile and Struggles</Text>
            <Text style={styles.storyText}>
              Due to a promise made by King Dasharatha, Ram was sent into 14 years of exile, accompanied by Sita and his brother Lakshman. During this exile, the demon king Ravana abducted Sita, leading to the great battle between Ram and Ravana. With the help of Hanuman, Sugriva, Jambavan, and the Vanara Sena, Sri Ram built a bridge (Rama Setu) across the sea and rescued Sita, defeating Ravana in Lanka.
            </Text>
            <Text style={styles.storyHeading}>Return to Ayodhya</Text>
            <Text style={styles.storyText}>
              After completing his exile and defeating evil, Sri Ram returned to Ayodhya. His homecoming was celebrated with lamps and festivity, marking the origin of Diwali, the festival of lights.
            </Text>
            <Text style={styles.storyHeading}>Conclusion</Text>
            <Text style={styles.storyText}>
              Sri Ram is more than a divine figure—he is a timeless guide for humanity. His life teaches that righteousness, devotion, and compassion must always prevail over greed, ego, and evil. To this day, the chant "Sri Ram Jai Ram Jai Jai Ram" echoes in the hearts of devotees, keeping alive the eternal message of dharma.
            </Text>
          </View>
        )
      },
      hindi: {
        title: "भगवान श्री राम – मर्यादा पुरुषोत्तम",
        content: (
          <View>
            <Text style={styles.storyHeading}>परिचय</Text>
            <Text style={styles.storyText}>
              भगवान श्री राम, भगवान विष्णु के सातवें अवतार, हिंदू धर्म में सबसे पूजनीय देवताओं में से एक हैं। मर्यादा पुरुषोत्तम (धर्म का आदर्श पुरुष) के रूप में जाने जाने वाले, वे सत्य, सदाचार, सम्मान और कर्तव्य के प्रतीक के रूप में मनाए जाते हैं।
            </Text>
            <Text style={styles.storyHeading}>जन्म और प्रारंभिक जीवन</Text>
            <Text style={styles.storyText}>
              श्री राम का जन्म अयोध्या में राजा दशरथ और रानी कौशल्या के राजपरिवार में हुआ था। उनका जन्म राम नवमी के रूप में मनाया जाता है, जो सबसे महत्वपूर्ण हिंदू त्योहारों में से एक है।
            </Text>
            <Text style={styles.storyHeading}>सीता से विवाह</Text>
            <Text style={styles.storyText}>
              श्री राम ने राजा जनक की पुत्री माता सीता का हाथ उनके स्वयंवर में भगवान शिव के दिव्य धनुष को उठाकर और उसमें प्रत्यंचा चढ़ाकर जीता था। उनका विवाह पवित्रता, भक्ति और अनंत प्रेम का प्रतीक माना जाता है।
            </Text>
            <Text style={styles.storyHeading}>वनवास और संघर्ष</Text>
            <Text style={styles.storyText}>
              राजा दशरथ द्वारा दिए गए वचन के कारण, राम को 14 वर्ष के वनवास पर भेजा गया, जिसमें सीता और उनके भाई लक्ष्मण साथ गए। इस वनवास के दौरान, राक्षस राजा रावण ने सीता का अपहरण कर लिया, जिससे राम और रावण के बीच महान युद्ध हुआ।
            </Text>
            <Text style={styles.storyHeading}>अयोध्या वापसी</Text>
            <Text style={styles.storyText}>
              अपना वनवास पूरा करने और बुराई को हराने के बाद, श्री राम अयोध्या लौटे। उनकी वापसी का जश्न दीपकों और उत्सव के साथ मनाया गया, जो दीवाली, प्रकाश के त्योहार की उत्पत्ति का प्रतीक है।
            </Text>
            <Text style={styles.storyHeading}>निष्कर्ष</Text>
            <Text style={styles.storyText}>
              श्री राम एक दिव्य व्यक्तित्व से कहीं अधिक हैं—वे मानवता के लिए एक कालातीत मार्गदर्शक हैं। उनका जीवन सिखाता है कि धर्म, भक्ति और करुणा हमेशा लोभ, अहंकार और बुराई पर विजयी होनी चाहिए।
            </Text>
          </View>
        )
      },
      bangla: {
        title: "ভগবান শ্রী রাম – মর্যাদা পুরুষোত্তম",
        content: (
          <View>
            <Text style={styles.storyHeading}>ভূমিকা</Text>
            <Text style={styles.storyText}>
              ভগবান শ্রী রাম, ভগবান বিষ্ণুর সপ্তম অবতার, হিন্দুধর্মের সবচেয়ে শ্রদ্ধেয় দেবতাদের মধ্যে একজন। মর্যাদা পুরুষোত্তম (ধার্মিকতার আদর্শ মানুষ) হিসেবে পরিচিত, তিনি সত্য, সদাচার, সম্মান এবং কর্তব্যের মূর্ত প্রতীক হিসেবে উদযাপিত হন।
            </Text>
            <Text style={styles.storyHeading}>জন্ম এবং প্রারম্ভিক জীবন</Text>
            <Text style={styles.storyText}>
              শ্রী রামের জন্ম অযোধ্যায় রাজা দশরথ এবং রানী কৌশল্যার রাজপরিবারে হয়েছিল। তার জন্ম রাম নবমী হিসেবে উদযাপিত হয়, যা সবচেয়ে গুরুত্বপূর্ণ হিন্দু উৎসবগুলির মধ্যে একটি।
            </Text>
            <Text style={styles.storyHeading}>সীতার সাথে বিবাহ</Text>
            <Text style={styles.storyText}>
              শ্রী রাম রাজা জনকের কন্যা মাতা সীতার হাত জিতেছিলেন তার স্বয়ম্বরে ভগবান শিবের দিব্য ধনুক তুলে এবং তার মধ্যে জ্যা পরিয়ে। তাদের বিবাহ পবিত্রতা, ভক্তি এবং অনন্ত প্রেমের প্রতীক হিসেবে বিবেচিত হয়।
            </Text>
            <Text style={styles.storyHeading}>বনবাস এবং সংগ্রাম</Text>
            <Text style={styles.storyText}>
              রাজা দশরথের দেওয়া প্রতিশ্রুতির কারণে, রামকে ১৪ বছরের বনবাসে পাঠানো হয়েছিল, সীতা এবং তার ভাই লক্ষ্মণের সাথে। এই বনবাসের সময়, রাক্ষস রাজা রাবণ সীতাকে অপহরণ করেছিলেন, যার ফলে রাম এবং রাবণের মধ্যে মহান যুদ্ধ শুরু হয়েছিল।
            </Text>
            <Text style={styles.storyHeading}>অযোধ্যায় প্রত্যাবর্তন</Text>
            <Text style={styles.storyText}>
              তার বনবাস সম্পূর্ণ করে এবং মন্দকে পরাজিত করার পর, শ্রী রাম অযোধ্যায় ফিরে আসেন। তার প্রত্যাবর্তন দীপক এবং উৎসবের সাথে উদযাপিত হয়েছিল, যা দীপাবলি, আলোর উৎসবের উৎপত্তি চিহ্নিত করে।
            </Text>
            <Text style={styles.storyHeading}>উপসংহার</Text>
            <Text style={styles.storyText}>
              শ্রী রাম একটি দিব্য চরিত্রের চেয়েও বেশি—তিনি মানবতার জন্য একটি কালাতীত পথপ্রদর্শক। তার জীবন শেখায় যে ধার্মিকতা, ভক্তি এবং করুণা সর্বদা লোভ, অহংকার এবং মন্দের উপর জয়ী হতে হবে।
            </Text>
          </View>
        )
      }
    };
    return stories[currentLanguage] || stories.english;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6A00', '#FF9933', '#FFB366']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTranslation('title')}</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {!gameStarted ? (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Image Selection */}
          {showImageSelection && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{getTranslation('selectImage')}</Text>
              <View style={styles.imageGrid}>
                {PUZZLE_IMAGES.map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    style={[
                      styles.imageOption,
                      selectedImage.id === image.id && styles.selectedImageOption,
                    ]}
                    onPress={() => handleImageSelection(image)}
                  >
                    <Image source={image.source} style={styles.imageOptionImage} />
                    <Text style={styles.imageOptionText}>{image.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Difficulty Selection - Always visible */}
          {showImageSelection && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{getTranslation('selectDifficulty')}</Text>
              <View style={styles.difficultyGrid}>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.difficultyOption,
                      difficulty === key && styles.selectedDifficultyOption,
                    ]}
                    onPress={() => setDifficulty(key as 'easy' | 'medium' | 'hard')}
                  >
                    <Text style={styles.difficultyText}>{getTranslation(key as 'easy' | 'medium' | 'hard')}</Text>
                    <Text style={styles.difficultyPieces}>{level.pieces} {getTranslation('pieces')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
              >
                <Text style={styles.startButtonText}>{getTranslation('startGame')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.gameContainer}>
           {/* Game Stats */}
           <View style={styles.gameStats}>
             <View style={styles.statItem}>
               <Text style={styles.statLabel}>{getTranslation('moves')}</Text>
               <Text style={styles.statValue}>{moves}</Text>
             </View>
             <View style={styles.statItem}>
               <Text style={styles.statLabel}>{getTranslation('time')}</Text>
               <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
             </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetGame}
            >
              <Text style={styles.resetButtonText}>{getTranslation('reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={shufflePieces}
            >
              <Text style={styles.shuffleButtonText}>{getTranslation('shuffle')}</Text>
            </TouchableOpacity>
           </View>

          {/* Puzzle Board */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            horizontal={false}
          >
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              <View style={styles.puzzleBoard}>
             {/* Debug info */}
             <Text style={styles.debugText}>
               Pieces: {puzzlePieces.length} | Difficulty: {difficulty}
             </Text>
             
             {/* Show full image as reference */}
             <Image
               source={selectedImage.source}
               style={styles.referenceImage}
               resizeMode="contain"
             />
             
            {/* Show target positions */}
            {puzzlePieces.map((piece) => (
              <View
                key={`target-${piece.id}`}
                style={[
                  styles.targetPosition,
                  {
                    left: piece.correctPosition.x,
                    top: piece.correctPosition.y,
                  },
                ]}
              />
            ))}
            
            {/* Divider between solving area and pieces area */}
            <View 
              style={[
                styles.areaDivider,
                {
                  top: 250 + (DIFFICULTY_LEVELS[difficulty].rows * 100) + 25,
                  left: 20,
                  right: 20,
                }
              ]} 
            />
            
            {/* Puzzle pieces area label */}
            <Text 
              style={[
                styles.piecesAreaLabel,
                {
                  top: 250 + (DIFFICULTY_LEVELS[difficulty].rows * 100) + 35,
                  left: 20,
                }
              ]}
            >
              {getTranslation('puzzlePieces')}
            </Text>
             
             {puzzlePieces.map((piece) => {
               const panResponder = createPanResponder(piece);
               return (
                 <Animated.View
                   key={piece.id}
                   style={[
                     styles.puzzlePiece,
                     {
                       left: piece.currentPosition.x,
                       top: piece.currentPosition.y,
                       transform: [{ scale: piece.scale }],
                       opacity: piece.opacity,
                       zIndex: draggedPiece === piece.id ? 1000 : 1,
                     },
                   ]}
                   {...panResponder.panHandlers}
                 >
                   <View style={styles.pieceImageContainer}>
                     <Image
                       source={piece.imageSource}
                       style={[
                         styles.pieceImage,
                         {
                           width: 100 * DIFFICULTY_LEVELS[difficulty].cols,
                           height: 100 * DIFFICULTY_LEVELS[difficulty].rows,
                           transform: [
                             { translateX: -piece.col * 100 },
                             { translateY: -piece.row * 100 }
                           ]
                         },
                       ]}
                       resizeMode="cover"
                     />
                   </View>
                   {piece.isPlaced && (
                     <View style={styles.placedIndicator}>
                       <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                     </View>
                   )}
                 </Animated.View>
               );
            })}
              </View>
            </ScrollView>
            
            {/* Add white space at the bottom */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Game Complete Modal */}
          <Modal
            visible={gameCompleted}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.completionModal}>
              <View style={styles.completionContent}>
                <MaterialCommunityIcons name="trophy" size={60} color="#FFD700" />
                <Text style={styles.completionTitle}>{getTranslation('congratulations')}</Text>
                <Text style={styles.completionSubtitle}>{getTranslation('puzzleComplete')}</Text>
                <Text style={styles.completionStats}>
                  {getTranslation('moves')}: {moves} | {getTranslation('time')}: {formatTime(timeElapsed)}
                </Text>
                <TouchableOpacity
                  style={styles.playAgainButton}
                  onPress={resetGame}
                >
                  <Text style={styles.playAgainButtonText}>{getTranslation('playAgain')}</Text>
                </TouchableOpacity>
                
                {getStoryContent() && (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      style={styles.storyButton}
                      onPress={() => setShowStoryModal(true)}
                    >
                      <Text style={styles.storyButtonText}>
                        {selectedImage.id === 'diwali1' || selectedImage.id === 'diwali2' ? (
                          currentLanguage === 'hindi' ? 'दीवाली की कहानी' : 
                          currentLanguage === 'bangla' ? 'দীপাবলির গল্প' :
                          'Story of Diwali'
                        ) : (
                          currentLanguage === 'hindi' ? `${selectedImage.name} की कहानी` : 
                          currentLanguage === 'bangla' ? `${selectedImage.name} এর গল্প` :
                          `${getTranslation('storyOf')} ${selectedImage.name}`
                        )}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>
          </Modal>

          {/* Story Modal */}
          <Modal
            visible={showStoryModal}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.storyModal}>
              <View style={styles.storyContent}>
                <View style={styles.storyHeader}>
                  <Text style={styles.storyTitle}>{getStoryContent()?.title}</Text>
                  <View style={styles.storyHeaderButtons}>
                    <TouchableOpacity
                      style={styles.audioButton}
                      onPress={playStoryAudio}
                    >
                      <MaterialCommunityIcons 
                        name={isPlayingAudio ? "stop" : "play"} 
                        size={24} 
                        color="#FF6A00" 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowStoryModal(false)}
                    >
                      <MaterialCommunityIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
                <ScrollView style={styles.storyScrollView} showsVerticalScrollIndicator={true}>
                  {getStoryContent()?.content}
                  <View style={styles.storyBottomSpacer} />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 170, // Add 150px + 20px padding = 170px total space
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageOption: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImageOption: {
    borderWidth: 3,
    borderColor: '#FF6A00',
  },
  imageOptionImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  difficultyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDifficultyOption: {
    borderWidth: 3,
    borderColor: '#FF6A00',
  },
  difficultyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  difficultyPieces: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center', // Center horizontally
  },
  horizontalScrollContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: Math.max(screenWidth, 500), // Ensure enough width for 4x4 grid
  },
  puzzleBoard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    minHeight: screenHeight * 1.5, // Ensure enough height for all pieces
    minWidth: Math.max(screenWidth, 500), // Ensure enough width for 4x4 grid (4 * 100 + padding)
    padding: 20,
    alignItems: 'flex-start', // Align to left for consistent positioning
  },
  bottomSpacer: {
    height: 200,
    backgroundColor: '#fff',
  },
  puzzlePiece: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pieceImageContainer: {
    width: 100,
    height: 100,
    overflow: 'hidden',
    borderRadius: 8,
  },
  pieceImage: {
    borderRadius: 8,
  },
  placedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  completionModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  completionSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  completionStats: {
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
  },
  playAgainButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 12,
    color: '#666',
    zIndex: 1000,
  },
  resetButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shuffleButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  referenceImage: {
    width: Math.min(screenWidth * 0.8, 400), // Responsive width, max 400px
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  targetPosition: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
  },
  areaDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  piecesAreaLabel: {
    position: 'absolute',
    left: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  storyButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  storyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  storyModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    height: '90%',
    width: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    flex: 1,
    marginRight: 10,
  },
  storyHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  closeButton: {
    padding: 5,
  },
  storyScrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    textAlign: 'left',
    marginBottom: 15,
  },
  storyHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
  },
  storySubHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'left',
  },
  storyBottomSpacer: {
    height: 200,
    backgroundColor: 'transparent',
  },
});
