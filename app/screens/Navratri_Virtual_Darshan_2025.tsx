import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Animated, PanResponder } from 'react-native';
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

// Draggable Thali component for Aarti
const DraggableThali: React.FC<{ onImageLoad: () => void }> = ({ onImageLoad }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value || 0,
          y: pan.y._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.thaliContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Image
        source={require('@/assets/images/icons/own temple/PujaThali1.png')}
        style={styles.thaliImage}
        resizeMode="contain"
        onLoad={onImageLoad}
      />
    </Animated.View>
  );
};

export default function NavratriVirtualDarshan2025() {
  const { currentLanguage } = useLanguage();
  const { showAudioVideoModal } = useAudioVideoModal();
  const [currentDay, setCurrentDay] = useState(0); // Index in templeData array
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Puja icon states
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [showAartiModal, setShowAartiModal] = useState(false);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [thaliImageLoaded, setThaliImageLoaded] = useState(false);
  
  // Audio refs
  const conchSoundRef = useRef<Audio.Sound | null>(null);
  const [isConchPlaying, setIsConchPlaying] = useState(false);
  
  // Bell swing animation refs
  const leftBellSwing = useRef(new Animated.Value(0)).current;
  const rightBellSwing = useRef(new Animated.Value(0)).current;
  
  // Gradient animation refs
  const gradientAnimation = useRef(new Animated.Value(0)).current; // Start at 0 degrees
  
  // Scrolling text animation refs
  const scrollTextAnimation = useRef(new Animated.Value(0)).current;
  
  // Twinkling lights animation refs
  const twinkleAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
    }))
  ).current;
  
  // Light positions and colors state
  const [lightPositions, setLightPositions] = useState(
    Array.from({ length: 20 }, () => ({
      left: Math.random() * (screenWidth - 20),
      top: Math.random() * (screenHeight - 200) + 100,
      color: Math.floor(Math.random() * 5), // 0-4 for different colors
    }))
  );
  
  // String lights animation refs
  const leftStringLights = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(1)) // Always at 100% intensity
  ).current;
  const rightStringLights = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(1)) // Always at 100% intensity
  ).current;
  
  // Bulb colors state
  const [leftBulbData, setLeftBulbData] = useState(
    Array.from({ length: 15 }, () => ({
      color: Math.floor(Math.random() * 4), // 0-3 for 4 colors
    }))
  );
  const [rightBulbData, setRightBulbData] = useState(
    Array.from({ length: 15 }, () => ({
      color: Math.floor(Math.random() * 4), // 0-3 for 4 colors
    }))
  );
  
  
  // Lights on/off state
  const [lightsOn, setLightsOn] = useState(true);
  
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

  const toggleLights = () => {
    setLightsOn(!lightsOn);
  };

  // Gradient animation function - rotate angle every 2 seconds
  const startGradientAnimation = () => {
    let currentAngle = 0;
    const animateGradient = () => {
      currentAngle = (currentAngle + 5) % 360; // Rotate 5 degrees clockwise, wrap at 360
      Animated.timing(gradientAnimation, {
        toValue: currentAngle,
        duration: 2000, // 2 seconds
        useNativeDriver: false,
      }).start(() => {
        // Loop the animation
        animateGradient();
      });
    };
    animateGradient();
  };

  // Scrolling text animation function
  const startScrollingTextAnimation = () => {
    const animateScrollingText = () => {
      Animated.sequence([
        Animated.timing(scrollTextAnimation, {
          toValue: 1,
          duration: 25000, // 25 seconds to cross the screen - very slow
          useNativeDriver: true,
        }),
        Animated.delay(10000), // 10 second pause before next cycle
      ]).start(() => {
        // Reset and loop the animation
        scrollTextAnimation.setValue(0);
        animateScrollingText();
      });
    };
    animateScrollingText();
  };

  // Function to get color style based on color index
  const getLightColorStyle = (colorIndex: number) => {
    const colorStyles = [
      { textShadowColor: 'rgba(255, 215, 0, 0.8)' }, // Gold
      { textShadowColor: 'rgba(255, 255, 255, 0.8)' }, // White
      { textShadowColor: 'rgba(255, 182, 193, 0.8)' }, // Pink
      { textShadowColor: 'rgba(144, 238, 144, 0.8)' }, // Light Green
      { textShadowColor: 'rgba(173, 216, 230, 0.8)' }, // Light Blue
    ];
    return colorStyles[colorIndex] || colorStyles[0];
  };

  // 4 specified colors
  const bulbColors = [
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00FF00', // Green
    '#FFFF00', // Yellow
  ];

  // Function to get bulb color
  const getBulbColor = (colorIndex: number) => {
    return bulbColors[colorIndex] || bulbColors[0];
  };

  // Function to get bulb shape component
  const getBulbShape = (shapeIndex: number, color: string, size: number) => {
    switch (shapeIndex) {
      case 0: // Star
        return <Text style={[styles.starShape, { color, fontSize: size }]}>⭐</Text>;
      case 1: // Round
        return <View style={[styles.roundShape, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
      case 2: // Triangle
        return <View style={[styles.triangleShape, { borderBottomColor: color, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size }]} />;
      default:
        return <View style={[styles.roundShape, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
    }
  };

  // Function to randomize light positions and colors
  const randomizeLights = () => {
    setLightPositions(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * (screenWidth - 20),
        top: Math.random() * (screenHeight - 200) + 100,
        color: Math.floor(Math.random() * 5), // 0-4 for different colors
      }))
    );
  };

  // String lights animation function
  const startStringLightsAnimation = () => {
    // Use setInterval instead of recursive setTimeout to avoid useInsertionEffect issues
    const colorChangeInterval = setInterval(() => {
      // Randomize colors for next cycle
      setLeftBulbData(Array.from({ length: 15 }, () => ({
        color: Math.floor(Math.random() * 4), // 0-3 for 4 colors
      })));
      setRightBulbData(Array.from({ length: 15 }, () => ({
        color: Math.floor(Math.random() * 4), // 0-3 for 4 colors
      })));
    }, 2000); // Change colors every 2 seconds

    // Return cleanup function
    return () => clearInterval(colorChangeInterval);
  };


  // Twinkling lights animation function
  const startTwinklingLightsAnimation = () => {
    twinkleAnimations.forEach((light, index) => {
      const animateLight = () => {
        const delay = Math.random() * 2000; // Random delay up to 2 seconds
        const duration = 1000 + Math.random() * 2000; // Random duration 1-3 seconds
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(light.opacity, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(light.scale, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(light.opacity, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(light.scale, {
              toValue: 0.5,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Loop the animation
          animateLight();
        });
      };
      animateLight();
    });
  };

  // Start animations on component mount
  React.useEffect(() => {
    startGradientAnimation();
    startScrollingTextAnimation();
    startTwinklingLightsAnimation();
    const stringLightsCleanup = startStringLightsAnimation();
    
    // Randomize light positions every 5 seconds
    const positionInterval = setInterval(() => {
      randomizeLights();
    }, 5000);
    
    return () => {
      clearInterval(positionInterval);
      if (stringLightsCleanup) {
        stringLightsCleanup();
      }
    };
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
        {/* Right Bell Shadow */}
        <Animated.View
          style={[
            styles.bellShadow,
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
          {/* Bell-shaped shadow using multiple elements */}
          <View style={styles.bellShadowTop} />
          <View style={styles.bellShadowMiddle} />
          <View style={styles.bellShadowBottom} />
        </Animated.View>
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
        {/* Left Bell Shadow */}
        <Animated.View
          style={[
            styles.bellShadow,
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
          {/* Bell-shaped shadow using multiple elements */}
          <View style={styles.bellShadowTop} />
          <View style={styles.bellShadowMiddle} />
          <View style={styles.bellShadowBottom} />
        </Animated.View>
      </Animated.View>

      {/* Gradient Header - Z-index 151 */}
      <AnimatedLinearGradient
        colors={['#FFAE51', '#FF8C42', '#E87C00', '#FF6B35']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{
          x: gradientAnimation.interpolate({
            inputRange: [0, 360],
            outputRange: [1, 0],
          }),
          y: gradientAnimation.interpolate({
            inputRange: [0, 360],
            outputRange: [0, 1],
          }),
        }}
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

      {/* Scrolling Text - Z-index 201 */}
      <View style={styles.scrollingTextContainer}>
        <Animated.View
          style={[
            styles.scrollingTextWrapper,
            {
              transform: [
                {
                  translateX: scrollTextAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth + 200, -screenWidth * 2 - 200], // Scroll from outside right to outside left with wider range
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.scrollingText} numberOfLines={1}>
            Swipe up / down for other temples of {currentTemple.name}, Swipe left / right for temples of other Maa
          </Text>
        </Animated.View>
      </View>

      {/* Twinkling Lights - Z-index 101 */}
      {lightsOn && twinkleAnimations.map((light, index) => {
        const lightPosition = lightPositions[index];
        const colorStyles = getLightColorStyle(lightPosition.color);
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.twinklingLight,
              {
                left: lightPosition.left,
                top: lightPosition.top,
                opacity: light.opacity,
                transform: [{ scale: light.scale }],
              },
            ]}
          >
            <Text style={[styles.starIcon, colorStyles]}>✨</Text>
          </Animated.View>
        );
      })}

      {/* Left String Lights - Z-index 250 */}
      {lightsOn && leftStringLights.map((light, index) => {
        const bulbSize = screenHeight * 0.02; // 2% of screen height
        const bulbData = leftBulbData[index];
        const bulbColor = getBulbColor(bulbData.color);
        const startY = 140; // Start at 140px
        const endY = screenHeight * 0.9; // End at 90% of screen height
        const totalHeight = endY - startY;
        const top = startY + (index * totalHeight / 14); // Distribute 15 bulbs evenly
        
        return (
          <Animated.View
            key={`left-${index}`}
            style={[
              styles.stringLightBulb,
              {
                left: 10,
                top: top,
                opacity: light,
                width: bulbSize,
                height: bulbSize,
              },
            ]}
          >
            <Text style={[styles.starIcon, { 
              color: bulbColor, 
              fontSize: bulbSize, 
              textShadowColor: bulbColor,
              textShadowRadius: 8 
            }]}>✦</Text>
          </Animated.View>
        );
      })}

      {/* Right String Lights - Z-index 250 */}
      {lightsOn && rightStringLights.map((light, index) => {
        const bulbSize = screenHeight * 0.02; // 2% of screen height
        const bulbData = rightBulbData[index];
        const bulbColor = getBulbColor(bulbData.color);
        const startY = 140; // Start at 140px
        const endY = screenHeight * 0.9; // End at 90% of screen height
        const totalHeight = endY - startY;
        const top = startY + (index * totalHeight / 14); // Distribute 15 bulbs evenly
        
        return (
          <Animated.View
            key={`right-${index}`}
            style={[
              styles.stringLightBulb,
              {
                right: 10,
                top: top,
                opacity: light,
                width: bulbSize,
                height: bulbSize,
              },
            ]}
          >
            <Text style={[styles.starIcon, { 
              color: bulbColor, 
              fontSize: bulbSize, 
              textShadowColor: bulbColor,
              textShadowRadius: 8 
            }]}>✦</Text>
          </Animated.View>
        );
      })}


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
        
        {/* Light Switch */}
        <TouchableOpacity 
          style={[styles.pujaIconItem, isFlowerAnimationRunning && styles.pujaIconItemDisabled]} 
          disabled={isFlowerAnimationRunning}
          onPress={toggleLights}
          activeOpacity={0.7}
        >
          <Text style={[styles.pujaIcon, { opacity: lightsOn ? 1 : 0.3 }]}>
            {lightsOn ? '💡' : '🔌'}
          </Text>
          <Text style={styles.pujaIconLabel} numberOfLines={1} ellipsizeMode="tail">
            {lightsOn ? 'Lights ON' : 'Lights OFF'}
          </Text>
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
        animationType="none"
        onRequestClose={() => setShowAartiModal(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setShowAartiModal(false)}>
          <View style={styles.aartiModalOverlay}>
            {!thaliImageLoaded && (
              <View style={styles.thaliLoadingContainer}>
                <Text style={styles.thaliLoadingText}>Loading Aarti Thali...</Text>
              </View>
            )}
            <DraggableThali onImageLoad={() => setThaliImageLoaded(true)} />
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
  bellShadow: {
    position: 'absolute',
    width: 52,
    height: 120,
    top: 8, // Offset shadow down
    left: 0,
    zIndex: -1, // Behind the bell
    // Create bell-shaped shadow using multiple elements
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Darker shadow
    shadowRadius: 8,
    elevation: 8,
  },
  bellShadowTop: {
    position: 'absolute',
    top: 0,
    left: 8,
    width: 36,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 18,
    transform: [{ scaleY: 0.6 }],
  },
  bellShadowMiddle: {
    position: 'absolute',
    top: 15,
    left: 4,
    width: 44,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 22,
    transform: [{ scaleY: 0.8 }],
  },
  bellShadowBottom: {
    position: 'absolute',
    top: 70,
    left: 6,
    width: 40,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    transform: [{ scaleY: 0.7 }],
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
  scrollingTextContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 201,
    overflow: 'hidden',
  },
  scrollingTextWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 30,
    justifyContent: 'center',
    width: screenWidth * 3, // Much wider to accommodate full text
  },
  scrollingText: {
    fontSize: 20, // 6 points bigger than 14
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  twinklingLight: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
  starIcon: {
    fontSize: 20,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stringLightBulb: {
    position: 'absolute',
    zIndex: 60, // Above image container (z-index 51)
    justifyContent: 'center',
    alignItems: 'center',
  },
  starShape: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  coloredBulb: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  roundShape: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  triangleShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  thaliContainer: {
    position: 'absolute',
    left: screenWidth * 0.5 - 50, // Center horizontally (50 is half of thali width)
    top: screenHeight * 0.7 - 50, // 70% from top (50 is half of thali height)
    width: 100, // 30% smaller than default
    height: 100,
    zIndex: 1000,
  },
  thaliImage: {
    width: '100%',
    height: '100%',
  },
  thaliLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thaliLoadingText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  aartiModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aartiModalOverlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});