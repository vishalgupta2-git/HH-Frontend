import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Animated } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { PanGestureHandler as RNGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAudioVideoModal } from '@/contexts/AudioVideoModalContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to get image source
const getImageSource = (imageName: string) => {
  switch (imageName) {
    case 'MaaShailputri_1.jpg':
      return require('@/assets/images/Navratri2025/MaaShailputri_1.jpg');
    case 'MaaShailputri_2.jpg':
      return require('@/assets/images/Navratri2025/MaaShailputri_2.jpg');
    case 'MaaShailputri_3.jpg':
      return require('@/assets/images/Navratri2025/MaaShailputri_3.jpg');
    case 'MaaBhramcharini_1.jpg':
      return require('@/assets/images/Navratri2025/MaaBhramcharini_1.jpg');
    case 'MaaBhramcharini_2.jpg':
      return require('@/assets/images/Navratri2025/MaaBhramcharini_2.jpg');
    case 'MaaBhramcharini_3.jpg':
      return require('@/assets/images/Navratri2025/MaaBhramcharini_3.jpg');
    case 'ChandraGhanta_1.jpg':
      return require('@/assets/images/Navratri2025/ChandraGhanta_1.jpg');
    case 'ChandraGhanta_2.jpg':
      return require('@/assets/images/Navratri2025/ChandraGhanta_2.jpg');
    case 'Kushmanda_1.jpg':
      return require('@/assets/images/Navratri2025/Kushmanda_1.jpg');
    case 'Kushmanda_2.jpg':
      return require('@/assets/images/Navratri2025/Kushmanda_2.jpg');
    case 'Kushmanda_3.jpg':
      return require('@/assets/images/Navratri2025/Kushmanda_3.jpg');
    case 'Skandamata_1.jpg':
      return require('@/assets/images/Navratri2025/Skandamata_1.jpg');
    case 'Skandamata_2.jpg':
      return require('@/assets/images/Navratri2025/Skandamata_2.jpg');
    case 'Katyayani_1.jpg':
      return require('@/assets/images/Navratri2025/Katyayani_1.jpg');
    case 'Katyayani_2.jpg':
      return require('@/assets/images/Navratri2025/Katyayani_2.jpg');
    case 'Kalratri_1.jpg':
      return require('@/assets/images/Navratri2025/Kalratri_1.jpg');
    case 'Kalratri_2.jpg':
      return require('@/assets/images/Navratri2025/Kalratri_2.jpg');
    case 'Mahagauri_1.jpg':
      return require('@/assets/images/Navratri2025/Mahagauri_1.jpg');
    case 'Mahagauri_2.jpg':
      return require('@/assets/images/Navratri2025/Mahagauri_2.jpg');
    case 'Siddhidatri.jpg':
      return require('@/assets/images/Navratri2025/Siddhidatri.jpg');
    default:
      return require('@/assets/images/Navratri2025/MaaShailputri_1.jpg'); // Fallback
  }
};


// Temple data structure based on the spreadsheet
const templeData = [
  {
    day: 1,
    name: 'Maa Shailputri',
    date: '22-Sep',
    images: [
      { name: 'MaaShailputri_1.jpg', width: 736, height: 1330 },
      { name: 'MaaShailputri_2.jpg', width: 736, height: 1308 },
      { name: 'MaaShailputri_3.jpg', width: 736, height: 1307 }
    ]
  },
  {
    day: 2,
    name: 'Maa Bhramcharini',
    date: '23-Sep',
    images: [
      { name: 'MaaBhramcharini_1.jpg', width: 736, height: 1312 },
      { name: 'MaaBhramcharini_2.jpg', width: 736, height: 1318 },
      { name: 'MaaBhramcharini_3.jpg', width: 736, height: 1320 }
    ]
  },
  {
    day: 3,
    name: 'Maa Chandraghanta',
    date: '24-Sep',
    images: [
      { name: 'ChandraGhanta_1.jpg', width: 736, height: 1319 },
      { name: 'ChandraGhanta_2.jpg', width: 736, height: 1303 }
    ]
  },
  {
    day: 4,
    name: 'Maa Kushmanda',
    date: '25-Sep',
    images: [
      { name: 'Kushmanda_1.jpg', width: 736, height: 1306 },
      { name: 'Kushmanda_2.jpg', width: 736, height: 1350 },
      { name: 'Kushmanda_3.jpg', width: 736, height: 1312 }
    ]
  },
  {
    day: 5,
    name: 'Maa Skandamata',
    date: '26-Sep',
    images: [
      { name: 'Skandamata_1.jpg', width: 736, height: 1303 },
      { name: 'Skandamata_2.jpg', width: 736, height: 1311 }
    ]
  },
  {
    day: 6,
    name: 'Maa Katyayani',
    date: '27-Sep',
    images: [
      { name: 'Katyayani_1.jpg', width: 736, height: 1318 },
      { name: 'Katyayani_2.jpg', width: 736, height: 1320 }
    ]
  },
  {
    day: 7,
    name: 'Maa Kalratri',
    date: '28-Sep',
    images: [
      { name: 'Kalratri_1.jpg', width: 736, height: 1350 },
      { name: 'Kalratri_2.jpg', width: 736, height: 1303 }
    ]
  },
  {
    day: 8,
    name: 'Maa Mahagauri',
    date: '29-Sep',
    images: [
      { name: 'Mahagauri_1.jpg', width: 736, height: 1311 },
      { name: 'Mahagauri_2.jpg', width: 736, height: 1312 }
    ]
  },
  {
    day: 9,
    name: 'Maa Siddhidatri',
    date: '30-Sep',
    images: [
      { name: 'Siddhidatri.jpg', width: 736, height: 1318 }
    ]
  }
];

export default function NavratriVirtualDarshan2025() {
  const { currentLanguage } = useLanguage();
  const { showAudioVideoModal } = useAudioVideoModal();
  const [currentDay, setCurrentDay] = useState(0); // Index in templeData array
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Puja icon states
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [showAartiModal, setShowAartiModal] = useState(false);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  
  // Audio refs
  const conchSoundRef = useRef<Audio.Sound | null>(null);
  const [isConchPlaying, setIsConchPlaying] = useState(false);
  
  // Bell swing animation refs
  const leftBellSwing = useRef(new Animated.Value(0)).current;
  const rightBellSwing = useRef(new Animated.Value(0)).current;
  
  // Gradient animation refs
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  
  // Flower animation state
  const [flowers, setFlowers] = useState<Array<{
    id: string;
    type: string;
    x: number;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rotation: number;
    baseY?: number;
    fadeStart?: number;
    fadeEnd?: number;
  }>>([]);
  const flowerIdCounter = useRef(0);
  
  const currentTemple = templeData[currentDay];
  const currentImage = currentTemple.images[currentImageIndex];
  
  // Calculate image scaling
  const scaleWidth = (screenWidth * 1.02) / currentImage.width;
  const scaledHeight = currentImage.height * scaleWidth;
  const scaledWidth = currentImage.width * scaleWidth;

  // Handle gesture events
  const onGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const threshold = 50;
      
      // Check if it's primarily a horizontal or vertical swipe
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe - change day
        if (Math.abs(translationX) > threshold) {
          if (translationX > 0) {
            // Swipe right - previous day
            setCurrentDay(prev => prev === 0 ? templeData.length - 1 : prev - 1);
            setCurrentImageIndex(0);
          } else {
            // Swipe left - next day
            setCurrentDay(prev => prev === templeData.length - 1 ? 0 : prev + 1);
            setCurrentImageIndex(0);
          }
        }
      } else {
        // Vertical swipe - change image within same day
        if (Math.abs(translationY) > threshold) {
          if (translationY > 0) {
            // Swipe down - previous image
            setCurrentImageIndex(prev => 
              prev === 0 ? currentTemple.images.length - 1 : prev - 1
            );
          } else {
            // Swipe up - next image
            setCurrentImageIndex(prev => 
              prev === currentTemple.images.length - 1 ? 0 : prev + 1
            );
          }
        }
      }
    }
  };

  // Format day with leading zero
  const formatDay = (day: number) => day.toString().padStart(2, '0');

  // Flower animation functions
  const generateUniqueFlowerId = () => {
    flowerIdCounter.current += 1;
    return `flower_${Date.now()}_${flowerIdCounter.current}`;
  };

  const dropFlowers = async (flowerType: string = 'hibiscus') => {
    if (isFlowerAnimationRunning) return;
    setShowFlowerModal(false);
    setIsFlowerAnimationRunning(true);


    const rows = 12;
    const flowersPerRow = 7;
    const totalFlowers = rows * flowersPerRow;
    const startY = 125; // Start at 125px from top
    const endY = screenHeight * 0.8; // End at 80% of screen height
    
    // Define available flower types for mixed flowers
    const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'jasmine', 'yellowShevanthi', 'whiteShevanthi', 'redShevanthi', 'tulsi', 'rajnigandha', 'parajita', 'datura'];
    
    const newFlowers: Array<{
      id: string;
      type: string;
      x: number;
      y: Animated.Value;
      opacity: Animated.Value;
      scale: Animated.Value;
      rotation: number;
      baseY?: number;
      fadeStart?: number;
      fadeEnd?: number;
    }> = [];

    // Create flowers
    for (let i = 0; i < totalFlowers; i++) {
      const row = Math.floor(i / flowersPerRow);
      const col = i % flowersPerRow;
      
      const x = (screenWidth / flowersPerRow) * col + (screenWidth / flowersPerRow) / 2;
      
      // If flowerType is 'mix', randomly select from available flower types
      const actualFlowerType = flowerType === 'mix' 
        ? flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
        : flowerType;
      
      const flower = {
        id: generateUniqueFlowerId(),
        type: actualFlowerType,
        x: x,
        y: new Animated.Value(0), // Start at 0 translateY (relative to top: 125)
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.3),
        rotation: Math.random() * 360,
        baseY: startY,
        fadeStart: 1000 + row * 200, // Start fading earlier
        fadeEnd: 2000 + row * 200,
      };
      
      newFlowers.push(flower);
    }

    setFlowers(newFlowers);

    // Animate flowers
    newFlowers.forEach((flower, index) => {
      const row = Math.floor(index / flowersPerRow);
      const delay = row * 200; // Reduced delay between rows

      // Scale in animation
      Animated.timing(flower.scale, {
        toValue: 1,
        duration: 300,
        delay: delay,
        useNativeDriver: true,
      }).start();

      // Fall down animation - translateY from 0 to (endY - startY)
      Animated.timing(flower.y, {
        toValue: endY - startY, // Translate from 0 to the distance to travel
        duration: 3000, // 3 seconds to fall
        delay: delay,
        useNativeDriver: true,
      }).start();

      // Fade out animation - starts when flower reaches 60% of the way down
      const fadeDelay = delay + (3000 * 0.6); // Start fading at 60% of fall time
      setTimeout(() => {
        Animated.timing(flower.opacity, {
          toValue: 0,
          duration: 1000, // 1 second fade out
          useNativeDriver: true,
        }).start();
      }, fadeDelay);
    });

    const totalDuration = 5000; // 5 seconds total
    setTimeout(() => {
      setIsFlowerAnimationRunning(false);
      setFlowers([]);
    }, totalDuration);
  };

  // Puja icon functions
  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  const handleAarti = () => {
    setShowAartiModal(true);
  };

  const handleMusic = () => {
    showAudioVideoModal();
  };

  const preloadConchSound = React.useCallback(async () => {
    try {
      if (!conchSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/conch.mp3'));
        conchSoundRef.current = sound;
      }
    } catch (error) {
      console.log('Error preloading conch sound:', error);
    }
  }, []);

  const playConch = async () => {
    try {
      if (!conchSoundRef.current) {
        await preloadConchSound();
      }
      setIsConchPlaying(true);
      await conchSoundRef.current?.replayAsync();
      // Stop after 4s similar to test temple
      setTimeout(async () => { 
        try { 
          await conchSoundRef.current?.stopAsync(); 
        } catch {} 
        finally { 
          setIsConchPlaying(false); 
        } 
      }, 4000);
    } catch (e) {
      console.warn('Conch sound failed', e);
      setIsConchPlaying(false);
    }
  };

  const triggerBells = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/TempleBell.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      // Trigger bell swing animation
      swingBells();
    } catch (error) {
      console.log('Error playing bell sound:', error);
    }
  };

  // Gradient animation function
  const startGradientAnimation = () => {
    const animateGradient = () => {
      Animated.sequence([
        Animated.timing(gradientAnimation, {
          toValue: 1,
          duration: 2000, // 2 seconds
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnimation, {
          toValue: 0,
          duration: 2000, // 2 seconds
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Loop the animation
        animateGradient();
      });
    };
    animateGradient();
  };

  // Start gradient animation on component mount
  React.useEffect(() => {
    startGradientAnimation();
  }, []);

  const swingBells = () => {
    // Left bell custom animation: 0s straight, 0.5s angle, 1s straight, 1.5s angle, 2s straight
    Animated.sequence([
      Animated.timing(leftBellSwing, {
        toValue: 0, // 0s: Start straight (0 degrees)
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: -20, // 0.5s: Swing to -20 degrees
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: 0, // 1s: Return to straight (0 degrees)
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: -20, // 1.5s: Swing to -20 degrees again
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: 0, // 2s: Return to straight (0 degrees)
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
    ]).start();

    // Right bell custom animation: 0s straight, 0.5s angle, 1s straight, 1.5s angle, 2s straight
    Animated.sequence([
      Animated.timing(rightBellSwing, {
        toValue: 0, // 0s: Start straight (0 degrees)
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(rightBellSwing, {
        toValue: -20, // 0.5s: Swing to -20 degrees
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(rightBellSwing, {
        toValue: 0, // 1s: Return to straight (0 degrees)
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(rightBellSwing, {
        toValue: -20, // 1.5s: Swing to -20 degrees again
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
      Animated.timing(rightBellSwing, {
        toValue: 0, // 2s: Return to straight (0 degrees)
        duration: 500, // 0.5 seconds
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Temple Bells - Z-index 101 */}
      <Animated.View
        style={[
          styles.templeBells,
          {
            transform: [
              { translateY: -60 }, // Move up by half the bell height to set pivot at top
              { rotate: rightBellSwing.interpolate({
                inputRange: [-15, 15],
                outputRange: ['15deg', '-15deg'],
              })},
              { translateY: 60 } // Move back down
            ]
          }
        ]}
      >
        <Image
          source={require('@/assets/images/temple/templeBellIcon2.png')}
          style={styles.templeBellImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.templeBellsLeft,
          {
            transform: [
              { translateY: -60 }, // Move up by half the bell height to set pivot at top
              { rotate: leftBellSwing.interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              })},
              { translateY: 60 } // Move back down
            ]
          }
        ]}
      >
        <Image
          source={require('@/assets/images/temple/templeBellIcon2.png')}
          style={styles.templeBellImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Gradient Header - Z-index 151 */}
      <AnimatedLinearGradient
        colors={[
          gradientAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#FFAE51', '#FF8C42'], // Slight color shift
          }),
          gradientAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E87C00', '#FF6B35'], // Slight color shift
          }),
        ]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Temple Name and Day - Z-index 201 */}
      <View style={styles.templeInfo}>
        <Text style={styles.templeTitle}>
          {currentTemple.date} • Navratri 2025 Day {formatDay(currentTemple.day)}
        </Text>
        <Text style={styles.templeSubtitle}>
          {currentTemple.name}
        </Text>
      </View>

      {/* Main Image Container with Gesture Handler */}
      <RNGestureHandler
        onHandlerStateChange={onGestureEvent}
        onGestureEvent={onGestureEvent}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={getImageSource(currentImage.name)}
            style={[
              styles.templeImage,
              {
                width: scaledWidth,
                height: scaledHeight,
              }
            ]}
            resizeMode="contain"
          />
        </View>
      </RNGestureHandler>

      {/* Puja Icons */}
      {/* Left Puja Icons Column - Flowers, Aarti, Music */}
      <View style={styles.leftPujaIconsColumn}>
        <TouchableOpacity 
          style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
          disabled={isFlowerAnimationRunning}
          onPress={openFlowerModal}
          activeOpacity={0.7}
        >
          <Image 
            source={require('@/assets/images/icons/own temple/jasmine.png')}
            style={styles.pujaIconImage}
            resizeMode="contain"
          />
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">Flowers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]}
          disabled={isFlowerAnimationRunning}
          onPress={handleAarti}
          activeOpacity={0.7}
        >
          <Image 
            source={require('@/assets/images/icons/own temple/PujaThali1.png')}
            style={styles.pujaIconImage}
            resizeMode="contain"
          />
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">Aarti</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.pujaIconItem}
          onPress={handleMusic}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="music-note" 
            size={36} 
            color="#FFFFFF" 
          />
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">Music</Text>
        </TouchableOpacity>
      </View>

      {/* Right Puja Icons Column - Shankh, Ghanti */}
      <View style={styles.rightPujaIconsColumn}>
        <TouchableOpacity 
          style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
          disabled={isFlowerAnimationRunning}
          onPress={playConch}
          activeOpacity={0.7}
        >
          <Image 
            source={require('@/assets/images/icons/own temple/sankha.png')}
            style={styles.pujaIconImage}
            resizeMode="contain"
          />
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">Shankh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
          disabled={isFlowerAnimationRunning}
          onPress={triggerBells}
          activeOpacity={0.7}
        >
          <Text style={styles.pujaIcon}>🔔</Text>
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">Ghanti</Text>
        </TouchableOpacity>
      </View>

      {flowers.map((flower) => (
        <Animated.View
          key={flower.id}
          style={{
            position: 'absolute',
            left: flower.x - 15,
            top: 125, // Fixed top position
            opacity: flower.opacity,
            transform: [
              { translateY: flower.y },
              { scale: flower.scale },
              { rotate: `${flower.rotation}deg` }
            ],
            zIndex: 100,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {flower.type === 'redRose' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/rose.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'whiteRose' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/whiterose.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'jasmine' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/jasmine.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'yellowShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/YellowShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'whiteShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'redShevanthi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/RedShevanthi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'rajnigandha' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/rajnigandha.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'parajita' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/parajita.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'datura' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/Datura.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : flower.type === 'tulsi' ? (
            <Image 
              source={require('@/assets/images/icons/own temple/tulsi.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 24 }}>🌸</Text>
          )}
        </Animated.View>
      ))}

      {/* Flower Selection Modal */}
      <Modal
        visible={showFlowerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFlowerModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1, width: '100%' }}
            activeOpacity={1}
            onPress={() => setShowFlowerModal(false)}
          >
            <View style={[styles.flowerModalContent, { top: screenHeight * 0.30, height: screenHeight * 0.30, left: 3 }]}>
              <ScrollView 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.flowerOptions}
              >
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('hibiscus')}>
                  <View style={styles.flowerIconContainer}><Text style={styles.flowerOptionEmoji}>🌺</Text></View>
                  <Text style={styles.flowerOptionLabel}>Hibiscus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('redRose')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/rose.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('whiteRose')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/whiterose.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('jasmine')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/jasmine.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Jasmine</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('yellowShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/YellowShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Yellow Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('whiteShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('redShevanthi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/RedShevanthi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Shevanthi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('tulsi')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/tulsi.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Tulsi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('rajnigandha')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/rajnigandha.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Rajnigandha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('parajita')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/parajita.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Parajita</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('datura')}>
                  <View style={styles.flowerIconContainer}>
                    <Image source={require('@/assets/images/icons/own temple/Datura.png')} style={styles.flowerOptionImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Datura</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flowerOption} onPress={() => dropFlowers('mix')}>
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🌸</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Mixed Flowers</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showAartiModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAartiModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAartiModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Aarti</Text>
              <Text style={styles.modalText}>Aarti feature coming soon!</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowAartiModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  templeBells: {
    position: 'absolute',
    width: 52,
    height: 120,
    top: 140,
    left: screenWidth - 70, // 30px from right edge
    zIndex: 101,
  },
  templeBellsLeft: {
    position: 'absolute',
    width: 52,
    height: 120,
    top: 140,
    left: 20, // 30px from left edge
    zIndex: 101,
  },
  templeBellImage: {
    width: 52,
    height: 120,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 151,
    zIndex: 151,
  },
  templeInfo: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 201,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  templeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  templeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  imageContainer: {
    position: 'absolute',
    top: 150, // 150px from top
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 51,
  },
  templeImage: {
    // Dynamic sizing applied via style prop
  },
  // Puja Icons Styles
  leftPujaIconsColumn: {
    position: 'absolute',
    left: 10,
    top: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 240,
  },
  rightPujaIconsColumn: {
    position: 'absolute',
    right: 10,
    top: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 240,
  },
  pujaIconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 106, 0, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20, // Space for the label below
  },
  pujaIconItemDisabled: {
    opacity: 0.5,
  },
  pujaIcon: {
    fontSize: 24,
  },
  pujaIconImage: {
    width: 35,
    height: 35,
  },
  pujaIconLabel: {
    position: 'absolute',
    top: 42, // space below the 40x40 icon
    width: 50,
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Flower Modal Styles
  flowerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    width: 62,
    paddingVertical: 8,
    paddingHorizontal: 3,
  },
  flowerOptions: {
    paddingHorizontal: 2,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  flowerOption: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  flowerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  flowerOptionEmoji: {
    fontSize: 28,
  },
  flowerOptionImage: {
    width: 36,
    height: 36,
  },
  flowerOptionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  flowerEmoji: {
    fontSize: 30,
  },
});