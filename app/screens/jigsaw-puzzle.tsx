import { useLanguage } from '@/contexts/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  
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
    
    console.log(`Generated ${pieces.length} pieces for ${difficulty} difficulty`);
    return shuffledPieces;
  };

  // Start game
  const startGame = () => {
    const pieces = generatePuzzlePieces(selectedImage.source, difficulty);
    console.log('Generated pieces:', pieces.length);
    console.log('Selected image:', selectedImage.name);
    console.log('Difficulty:', difficulty);
    setPuzzlePieces(pieces);
    setGameStarted(true);
    setGameCompleted(false);
    setMoves(0);
    setTimeElapsed(0);
    setShowImageSelection(false);
    setShowDifficultySelection(false);
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

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get translations
  const getTranslation = (key: string) => {
    const translations: { [key: string]: { [key: string]: string } } = {
      title: {
        en: 'Temple Jigsaw Puzzle',
        hi: 'मंदिर जिग्सॉ पहेली',
        bangla: 'মন্দির জিগস পাজল',
        kannada: 'ದೇವಾಲಯ ಜಿಗ್ಸಾ ಪಜಲ್',
        punjabi: 'ਮੰਦਰ ਜਿਗਸਾ ਪਜ਼ਲ',
        tamil: 'கோவில் ஜிக்ஸா புதிர்',
        telugu: 'దేవాలయ జిగ్సా పజిల్',
      },
      selectImage: {
        en: 'Select Temple Image',
        hi: 'मंदिर छवि चुनें',
        bangla: 'মন্দিরের ছবি নির্বাচন করুন',
        kannada: 'ದೇವಾಲಯದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        punjabi: 'ਮੰਦਰ ਦੀ ਤਸਵੀਰ ਚੁਣੋ',
        tamil: 'கோவில் படத்தைத் தேர்ந்தெடுக்கவும்',
        telugu: 'దేవాలయ చిత్రాన్ని ఎంచుకోండి',
      },
      selectDifficulty: {
        en: 'Select Difficulty',
        hi: 'कठिनाई चुनें',
        bangla: 'কঠিনতা নির্বাচন করুন',
        kannada: 'ಕಷ್ಟತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        punjabi: 'ਮੁਸ਼ਕਲ ਚੁਣੋ',
        tamil: 'கடினத்தைத் தேர்ந்தெடுக்கவும்',
        telugu: 'కష్టతను ఎంచుకోండి',
      },
      startGame: {
        en: 'Start Puzzle',
        hi: 'पहेली शुरू करें',
        bangla: 'পাজল শুরু করুন',
        kannada: 'ಪಜಲ್ ಪ್ರಾರಂಭಿಸಿ',
        punjabi: 'ਪਜ਼ਲ ਸ਼ੁਰੂ ਕਰੋ',
        tamil: 'புதிரைத் தொடங்கவும்',
        telugu: 'పజిల్ ప్రారంభించండి',
      },
      moves: {
        en: 'Moves',
        hi: 'चालें',
        bangla: 'চাল',
        kannada: 'ಚಲನೆಗಳು',
        punjabi: 'ਚਾਲਾਂ',
        tamil: 'நகர்வுகள்',
        telugu: 'కదలికలు',
      },
      time: {
        en: 'Time',
        hi: 'समय',
        bangla: 'সময়',
        kannada: 'ಸಮಯ',
        punjabi: 'ਸਮਾਂ',
        tamil: 'நேரம்',
        telugu: 'సమయం',
      },
      congratulations: {
        en: 'Congratulations!',
        hi: 'बधाई हो!',
        bangla: 'অভিনন্দন!',
        kannada: 'ಅಭಿನಂದನೆಗಳು!',
        punjabi: 'ਵਧਾਈਆਂ!',
        tamil: 'வாழ்த்துக்கள்!',
        telugu: 'అభినందనలు!',
      },
      puzzleComplete: {
        en: 'Puzzle Complete!',
        hi: 'पहेली पूरी!',
        bangla: 'পাজল সম্পূর্ণ!',
        kannada: 'ಪಜಲ್ ಪೂರ್ಣ!',
        punjabi: 'ਪਜ਼ਲ ਪੂਰਾ!',
        tamil: 'புதிர் முடிந்தது!',
        telugu: 'పజిల్ పూర్తయింది!',
      },
      playAgain: {
        en: 'Play Again',
        hi: 'फिर से खेलें',
        bangla: 'আবার খেলুন',
        kannada: 'ಮತ್ತೆ ಆಡಿ',
        punjabi: 'ਦੁਬਾਰਾ ਖੇਡੋ',
        tamil: 'மீண்டும் விளையாடுங்கள்',
        telugu: 'మళ్లీ ఆడండి',
      },
      back: {
        en: 'Back',
        hi: 'वापस',
        bangla: 'ফিরে যান',
        kannada: 'ಹಿಂದಕ್ಕೆ',
        punjabi: 'ਵਾਪਸ',
        tamil: 'திரும்பவும்',
        telugu: 'వెనుకకు',
      },
    };
    return translations[key]?.[currentLanguage] || translations[key]?.en || key;
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
                    onPress={() => setSelectedImage(image)}
                  >
                    <Image source={image.source} style={styles.imageOptionImage} />
                    <Text style={styles.imageOptionText}>{image.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setShowDifficultySelection(true)}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Difficulty Selection */}
          {showDifficultySelection && (
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
                    <Text style={styles.difficultyText}>{level.name}</Text>
                    <Text style={styles.difficultyPieces}>{level.pieces} pieces</Text>
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
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={shufflePieces}
            >
              <Text style={styles.shuffleButtonText}>Shuffle</Text>
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
  nextButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});
