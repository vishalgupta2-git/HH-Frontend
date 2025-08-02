import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Audio } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');
const TEMPLE_CONFIG_KEY = 'templeConfig';
const SELECTED_DEITIES_KEY = 'selectedDeities';
const DEITY_STATE_KEY = 'deityState';

const deityList = [
  { key: 'ganesh', label: 'Ganesh Ji', icon: '🕉️' },
  { key: 'vishnu', label: 'Vishnu Ji', icon: '🙏' },
  { key: 'krishna', label: 'Lord Krishna', icon: require('@/assets/images/temple/Krishna1.png') },
  { key: 'lakshmi', label: 'Lakshmi Mata', icon: '🌸' },
  { key: 'khatu', label: 'Khatu Shyam Ji', icon: '🛕' },
  { key: 'hanuman', label: 'Hanuman Ji', icon: '🐒' },
  { key: 'durga', label: 'Durga Maa', icon: '🗡️' },
  { key: 'shiv', label: 'Shiv ji', icon: '🕉️' },
  { key: 'darshan', label: 'Daily Divine Darshan', icon: '🔆' },
  { key: 'shanidev', label: 'Shanidev', icon: '🌑' },
  { key: 'ram', label: 'Shri Ram', icon: '🏹' },
  { key: 'radha', label: 'Radha Krisna', icon: '🎶' },
  { key: 'kali', label: 'Kali Mata', icon: '🌑' },
  { key: 'saraswati', label: 'Saraswati Mata', icon: '🎵' },
  { key: 'loknath', label: 'Loknath Baba', icon: '🧘' },
  { key: 'santoshi', label: 'Santoshi Mata', icon: '🌺' },
  { key: 'extra', label: 'Other', icon: '✨' },
];

const templeStyles = [
  {
    id: 'temple1',
    name: 'Temple Style 1',
    image: require('@/assets/images/temple/Temple1.png'),
  },
  {
    id: 'temple2', 
    name: 'Temple Style 2',
    image: require('@/assets/images/temple/Temple2.png'),
  },
];

const ArchSVG = (props: { width?: number; height?: number; style?: any }) => {
  return (
    <Svg
      width={props.width || screenWidth}
      height={props.height || (screenWidth * 195) / 393}
      viewBox="0 0 393 195"
      fill="none"
      style={props.style}
    >
      <Path
        d="M196.41 50.5308C196.41 50.5308 191.28 93.7515 124.46 91.3237C124.46 91.3237 83.9203 87.722 89.6775 122.405C89.6775 122.405 35.5653 117.176 33.0297 177.151C33.0297 177.151 4.09425 175.444 1.02173 195H-120V0H361.73H513V195H391.799C391.799 195 392.754 176.858 359.791 177.151C359.791 177.151 361.223 121.712 303.143 122.352C303.143 122.352 311.496 95.1389 273.731 91.4838C273.701 91.4838 213.503 101.035 196.41 50.5308Z"
        fill="url(#archGradient)"
      />
      <Defs>
        <SvgLinearGradient id="archGradient" x1="196.5" y1="29.2058" x2="196.5" y2="151.717" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFAE51" />
          <Stop offset="0.9888" stopColor="#E87C00" />
        </SvgLinearGradient>
      </Defs>
    </Svg>
  );
};

                               // Static deity display component
      const StaticDeity: React.FC<{
        source?: any;
        emoji?: string;
        x: number;
        y: number;
        scale?: number;
        size?: number;
        label?: string;
      }> = ({ source, emoji, x, y, scale = 1, size = 72, label }) => {
        return (
          <View
            style={{
              position: 'absolute',
              left: x,
              top: y,
              zIndex: 15,
              transform: [{ scale }],
              width: size,
              height: size,
            }}
          >
            {source ? (
              <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
            ) : (
              <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF6A00' }}>
                <Text style={{ fontSize: size * 0.6 }}>{emoji}</Text>
              </View>
            )}
          </View>
        );
      };

export default function DailyPujaCustomTemple() {
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({});
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [bgGradient, setBgGradient] = useState(["#8B5CF6", "#7C3AED", "#6D28D9"]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [flowers, setFlowers] = useState<{ id: number; x: number; y: number; rotation: number; scale: number; opacity: number; type: string }[]>([]);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [smoke, setSmoke] = useState<{ id: number; x: number; y: number; opacity: number; scale: number; rotation: number; animatedY: Animated.Value; animatedOpacity: Animated.Value; animatedScale: Animated.Value }[]>([]);
  const [isSmokeAnimationRunning, setIsSmokeAnimationRunning] = useState(false);
  const [showSmokeModal, setShowSmokeModal] = useState(false);
  const smokeAnimationRef = useRef(false);
  const router = useRouter();

  // Function to get image source from MongoDB data using static require calls
  const getImageSource = (imagePath: string) => {
    // Handle different possible path formats
    let filename = '';
    
    if (imagePath.startsWith('assets/images/temple/')) {
      filename = imagePath.replace('assets/images/temple/', '');
    } else if (imagePath.startsWith('assets/temple/')) {
      filename = imagePath.replace('assets/temple/', '');
    } else if (imagePath.startsWith('temple/')) {
      filename = imagePath.replace('temple/', '');
    } else if (imagePath.includes('/')) {
      // Extract filename from any path
      filename = imagePath.split('/').pop() || '';
    } else {
      filename = imagePath;
    }
    
    // Map MongoDB paths to static require calls
    switch (filename) {
      // Original icons
      case 'VishnuIcon.png':
        return require('@/assets/images/temple/VishnuIcon.png');
      case 'Ganesha1.png':
        return require('@/assets/images/temple/Ganesha1.png');
      case 'Ganesha2.png':
        return require('@/assets/images/temple/Ganesha2.png');
      case 'Krishna1.png':
        return require('@/assets/images/temple/Krishna1.png');
      case 'Krishna2.png':
        return require('@/assets/images/temple/Krishna2.png');
      case 'Vishnu1.png':
        return require('@/assets/images/temple/Vishnu1.png');
      case 'Lakshmi1.png':
        return require('@/assets/images/temple/Lakshmi1.png');
      case 'Saraswati1.png':
        return require('@/assets/images/temple/Saraswati1.png');
      case 'Durga1.png':
        return require('@/assets/images/temple/Durga1.png');
      case 'Durga2.png':
        return require('@/assets/images/temple/Durga2.png');
      case 'Brahma1.png':
        return require('@/assets/images/temple/Brahma1.png');
      case 'Shiv2.png':
        return require('@/assets/images/temple/Shiv2.png');
      case 'ShivParvati1.png':
        return require('@/assets/images/temple/ShivParvati1.png');
      case 'Rama1.png':
        return require('@/assets/images/temple/Rama1.png');
      case 'Hanuman1.png':
        return require('@/assets/images/temple/Hanuman1.png');
      case 'Surya1.png':
        return require('@/assets/images/temple/Surya1.png');
      
      // New icons from "New folder"
      case 'Ganesha3.png':
        return require('@/assets/images/temple/New folder/Ganesha3.png');
      case 'Ganesha4.png':
        return require('@/assets/images/temple/New folder/Ganesha4.png');
      case 'Ganesha5.png':
        return require('@/assets/images/temple/New folder/Ganesha5.png');
      case 'Krishna3.png':
        return require('@/assets/images/temple/New folder/Krishna3.png');
      case 'Krishna4.png':
        return require('@/assets/images/temple/New folder/Krishna4.png');
      case 'Krishna5.png':
        return require('@/assets/images/temple/New folder/Krishna5.png');
      case 'Vishnu2.png':
        return require('@/assets/images/temple/New folder/Vishnu2.png');
      case 'Vishnu3.png':
        return require('@/assets/images/temple/New folder/Vishnu3.png');
      case 'Lakshmi2.png':
        return require('@/assets/images/temple/New folder/Lakshmi2.png');
      case 'Saraswati2.png':
        return require('@/assets/images/temple/New folder/Saraswati2.png');
      case 'Saraswati3.png':
        return require('@/assets/images/temple/New folder/Saraswati3.png');
      case 'Durga3.png':
        return require('@/assets/images/temple/New folder/Durga3.png');
      case 'Shiv3.png':
        return require('@/assets/images/temple/New folder/Shiv3.png');
      case 'Shiv4.png':
        return require('@/assets/images/temple/New folder/Shiv4.png');
      case 'ShivParvati2.png':
        return require('@/assets/images/temple/New folder/ShivParvati2.png');
      case 'Rama2.png':
        return require('@/assets/images/temple/New folder/Rama2.png');
      case 'Rama3.png':
        return require('@/assets/images/temple/New folder/Rama3.png');
      case 'Rama4.png':
        return require('@/assets/images/temple/New folder/Rama4.png');
      case 'Hanuman2.png':
        return require('@/assets/images/temple/New folder/Hanuman2.png');
      case 'Hanuman3.png':
        return require('@/assets/images/temple/New folder/Hanuman3.png');
      case 'Hanuman4.png':
        return require('@/assets/images/temple/New folder/Hanuman4.png');
      case 'Kali1.png':
        return require('@/assets/images/temple/New folder/Kali1.png');
      
      // Temple and other assets
      case 'Temple1.png':
        return require('@/assets/images/temple/Temple1.png');
      case 'Temple2.png':
        return require('@/assets/images/temple/Temple2.png');
      case 'Temple-bg.png':
        return require('@/assets/images/temple/Temple-bg.png');
      case 'TempleStar.png':
        return require('@/assets/images/temple/TempleStar.png');
      case 'GoldenBell.png':
        return require('@/assets/images/temple/GoldenBell.png');
      case 'Glow.png':
        return require('@/assets/images/temple/Glow.png');
      case 'arch.svg':
        return require('@/assets/images/temple/arch.svg');
      default:
        return require('@/assets/images/temple/Ganesha1.png');
    }
  };

  // On mount, load and merge state
  useEffect(() => {
    (async () => {
      const deitiesStr = await AsyncStorage.getItem(SELECTED_DEITIES_KEY);
      let loadedDeities: {[deityId: string]: string} = {};
      if (deitiesStr) {
        try {
          loadedDeities = JSON.parse(deitiesStr);
          setSelectedDeities(loadedDeities);
        } catch {}
      }
      const configStr = await AsyncStorage.getItem(TEMPLE_CONFIG_KEY);
      if (configStr) {
        try {
          const config = JSON.parse(configStr);
          if (config.selectedStyle) setSelectedStyle(config.selectedStyle);
          if (config.bgGradient) setBgGradient(config.bgGradient);
        } catch {}
      }
                             const stateStr = await AsyncStorage.getItem(DEITY_STATE_KEY);
         let loadedState: { key: string; x: number; y: number; scale: number }[] = [];
         if (stateStr) {
           try {
             loadedState = JSON.parse(stateStr);
           } catch (error) {
             // Error parsing loaded deity state
           }
         }
                       // Merge: keep state for present deities, add new, remove missing
         const deityKeys = Object.keys(loadedDeities);
         
         // Always preserve test deities from loaded state
         const testDeities = loadedState.filter(d => d.key.startsWith('test-'));
         
         const mergedState = deityKeys.map((key, idx) => {
           const found = loadedState.find(d => d.key === key);
           const result = found || { key, x: 20 + idx * 80, y: 0, scale: 2 };
           return result;
         });
         
         // Combine selected deities with test deities
         const finalState = [...mergedState, ...testDeities];
         setDeityState(finalState);
       setLoading(false);
     })();
   }, []);

      // When selectedDeities changes, only add new or remove missing, never overwrite existing state
    useEffect(() => {
      setDeityState(prev => {
        const deityKeys = Object.keys(selectedDeities);
        
        // Always preserve test deities
        const testDeities = prev.filter(d => d.key.startsWith('test-'));
        
        // Remove missing (but keep test deities)
        let filtered = prev.filter(d => deityKeys.includes(d.key) || d.key.startsWith('test-'));
        
        // Add new
        deityKeys.forEach((key: string, idx: number) => {
          if (!filtered.find(d => d.key === key)) {
            filtered.push({ key, x: 20 + idx * 80, y: 0, scale: 2 });
          }
        });
        
        return filtered;
      });
    }, [selectedDeities]);

  // Only update AsyncStorage when deityState changes due to user interaction
  useEffect(() => {
    if (deityState.length > 0) {
      AsyncStorage.setItem(DEITY_STATE_KEY, JSON.stringify(deityState))
        .catch((error) => {
          // Error saving deity state to AsyncStorage
        });
    }
  }, [deityState]);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Auto-start smoke animation when modal opens
  useEffect(() => {
    if (showSmokeModal && !isSmokeAnimationRunning) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        if (showSmokeModal) {
          startDhoopSmoke();
        }
      }, 100);
    }
  }, [showSmokeModal]); // Remove isSmokeAnimationRunning from dependencies





  // Function to play conch sound
  const playConchSound = async () => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play the conch sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/conch.mp3'),
        { shouldPlay: true, isLooping: false }
      );
      
      setSound(newSound);

      // Stop the sound after 5 seconds
      setTimeout(async () => {
        try {
          await newSound.stopAsync();
          await newSound.unloadAsync();
          setSound(null);
        } catch (error) {
          // Error stopping sound
        }
      }, 5000);

    } catch (error) {
      // Error playing conch sound
      // Fallback alert if audio fails
      alert('🔔 Conch sound played!');
    }
  };

  // Function to get flower emoji based on type
  const getFlowerEmoji = (type: string) => {
    switch (type) {
      case 'hibiscus':
        return '🌺';
      case 'redRose':
        return '🌹';
      case 'whiteRose':
        return '🌷';
      case 'sunflower':
        return '🌻';
      case 'marigold':
        return '🌼';
      case 'belPatra':
        return '🍃';
      default:
        return '🌸';
    }
  };

  // Function to open flower selection modal
  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  // Function to drop flowers
  const dropFlowers = (flowerType: string = 'hibiscus') => {
    if (isFlowerAnimationRunning) return; // Prevent multiple animations
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
    // Calculate temple width and position for flower spread
    const templeWidth = screenWidth * 1.38; // Same as temple image width
    const templeCenterX = screenWidth / 2;
    const templeLeftX = templeCenterX - (templeWidth / 2);
    const templeRightX = templeCenterX + (templeWidth / 2);
    
    let totalFlowers = 0;
    let completedFlowers = 0;
    
    // Create 3 rows of flowers
    for (let row = 0; row < 3; row++) {
      // Create 15 flowers per row
      for (let i = 0; i < 15; i++) {
        totalFlowers++;
        const flowerId = Date.now() + (row * 1000) + i; // Unique ID for each flower
        
        // Spread flowers evenly across temple width with some randomness
        const baseX = templeLeftX + (templeWidth * i / 14); // Evenly spaced (15 flowers = 14 gaps)
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
        const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
        
        const randomRotation = Math.random() * 360; // Random rotation
        const randomScale = 0.4 + Math.random() * 0.2; // Half size: 0.4-0.6 scale
        const randomStartY = -50 - (Math.random() * 100) - (row * 150); // Stagger rows vertically

        const newFlower = {
          id: flowerId,
          x: x,
          y: randomStartY, // Start from above the screen with random height
          rotation: randomRotation,
          scale: randomScale,
          opacity: 1, // Start fully visible
          type: flowerType,
        };

        setFlowers(prev => [...prev, newFlower]);

        // Animate flower falling
        const fallDuration = 3000 + (Math.random() * 1000) + (row * 500); // Stagger duration by row
        const fallDistance = 800 + (row * 100); // Increase fall distance for each row
        const templeY = selectedStyle === 'temple1' ? 400 : 325; // Temple position
        const vanishY = templeY + 200; // Vanish point below temple

        let startTime = Date.now();
        
        const animateFall = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fallDuration, 1);
          
          setFlowers(prev => prev.map(flower => {
            if (flower.id === flowerId) {
              const newY = randomStartY + (fallDistance * progress);
              let newOpacity = 1;
              
              // Start fading when approaching temple
              if (newY > templeY - 50) {
                const fadeProgress = (newY - (templeY - 50)) / (vanishY - (templeY - 50));
                newOpacity = Math.max(0, 1 - fadeProgress);
              }
              
              return {
                ...flower,
                y: newY,
                opacity: newOpacity,
              };
            }
            return flower;
          }));

          if (progress < 1) {
            requestAnimationFrame(animateFall);
          } else {
            // Remove flower when animation completes
            setTimeout(() => {
              setFlowers(prev => prev.filter(flower => flower.id !== flowerId));
              completedFlowers++;
              
              // Check if all flowers have completed
              if (completedFlowers >= totalFlowers) {
                setIsFlowerAnimationRunning(false);
              }
            }, 500);
          }
        };

        // Stagger the animation start by row and flower
        setTimeout(() => {
          requestAnimationFrame(animateFall);
        }, (row * 200) + (i * 30)); // 200ms delay between rows, 30ms between flowers
      }
    }
  };

  // Function to drop mix flowers (one row of each type)
  const dropMixFlowers = () => {
    if (isFlowerAnimationRunning) return; // Prevent multiple animations
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
    // Calculate temple width and position for flower spread
    const templeWidth = screenWidth * 1.38; // Same as temple image width
    const templeCenterX = screenWidth / 2;
    const templeLeftX = templeCenterX - (templeWidth / 2);
    const templeRightX = templeCenterX + (templeWidth / 2);
    
    const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'sunflower', 'marigold', 'belPatra'];
    let totalFlowers = 0;
    let completedFlowers = 0;
    
    // Create 3 rows with mixed flower types
    for (let row = 0; row < 3; row++) {
      // Create 15 flowers per row with mixed types
      for (let i = 0; i < 15; i++) {
        totalFlowers++;
        const flowerId = Date.now() + (row * 1000) + i; // Unique ID for each flower
        
        // Randomly select a flower type for each flower
        const randomFlowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        
        // Spread flowers evenly across temple width with some randomness
        const baseX = templeLeftX + (templeWidth * i / 14); // Evenly spaced (15 flowers = 14 gaps)
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
        const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
        
        const randomRotation = Math.random() * 360; // Random rotation
        const randomScale = 0.4 + Math.random() * 0.2; // Half size: 0.4-0.6 scale
        const randomStartY = -50 - (Math.random() * 100) - (row * 150); // Stagger rows vertically

        const newFlower = {
          id: flowerId,
          x: x,
          y: randomStartY, // Start from above the screen with random height
          rotation: randomRotation,
          scale: randomScale,
          opacity: 1, // Start fully visible
          type: randomFlowerType,
        };

        setFlowers(prev => [...prev, newFlower]);

        // Animate flower falling
        const fallDuration = 3000 + (Math.random() * 1000) + (row * 500); // Stagger duration by row
        const fallDistance = 800 + (row * 100); // Increase fall distance for each row
        const templeY = selectedStyle === 'temple1' ? 400 : 325; // Temple position
        const vanishY = templeY + 200; // Vanish point below temple

        let startTime = Date.now();
        
        const animateFall = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fallDuration, 1);
          
          setFlowers(prev => prev.map(flower => {
            if (flower.id === flowerId) {
              const newY = randomStartY + (fallDistance * progress);
              let newOpacity = 1;
              
              // Start fading when approaching temple
              if (newY > templeY - 50) {
                const fadeProgress = (newY - (templeY - 50)) / (vanishY - (templeY - 50));
                newOpacity = Math.max(0, 1 - fadeProgress);
              }
              
              return {
                ...flower,
                y: newY,
                opacity: newOpacity,
              };
            }
            return flower;
          }));

          if (progress < 1) {
            requestAnimationFrame(animateFall);
          } else {
            // Remove flower when animation completes
            setTimeout(() => {
              setFlowers(prev => prev.filter(flower => flower.id !== flowerId));
              completedFlowers++;
              
              // Check if all flowers have completed
              if (completedFlowers >= totalFlowers) {
                setIsFlowerAnimationRunning(false);
              }
            }, 500);
          }
        };

        // Stagger the animation start by row and flower
        setTimeout(() => {
          requestAnimationFrame(animateFall);
        }, (row * 200) + (i * 30)); // 200ms delay between rows, 30ms between flowers
      }
    }
  };

  // Function to start dhoop smoke effect
  const startDhoopSmoke = () => {
    if (smokeAnimationRef.current) {
      return; // Prevent multiple animations
    }
    
    setIsSmokeAnimationRunning(true);
    smokeAnimationRef.current = true;
    setSmoke([]); // Clear any existing smoke particles
    
    // Calculate dhoop position for modal (center of modal)
    const modalDhoopX = screenWidth / 2;
    const modalDhoopY = 580; // 100 pixels lower than before
    
    let smokeId = 0;
    
    const createSmokeParticle = () => {
      // Check if animation should continue - use ref instead of state
      if (!smokeAnimationRef.current) {
        return;
      }
      
      const particleId = Date.now() + smokeId++;
      
      // Random offset across full screen width
      const randomOffsetX = (Math.random() - 0.5) * screenWidth; // Full screen width spread
      const startX = modalDhoopX + randomOffsetX;
      const startY = modalDhoopY;
      
      // Random properties for natural smoke effect in modal (half of current size)
      const randomScale = 0.1125 + Math.random() * 0.1125; // 0.1125-0.225 scale (50% bigger than current)
      const randomRotation = Math.random() * 360;
      const riseDuration = 4000 + Math.random() * 3000; // 4-7 seconds
      const riseDistance = 200 + Math.random() * 150; // Rise 200-350px
      
      // Create animated values for smooth animation
      const animatedY = new Animated.Value(startY);
      const animatedOpacity = new Animated.Value(1.0);
      const animatedScale = new Animated.Value(randomScale);
      
      const newSmoke = {
        id: particleId,
        x: startX,
        y: startY,
        opacity: 1.0, // Fully opaque to start
        scale: randomScale,
        rotation: randomRotation,
        animatedY,
        animatedOpacity,
        animatedScale,
      };
      
      setSmoke(prev => {
        const newSmokeArray = [...prev, newSmoke];
        return newSmokeArray;
      });
      
      // Animate smoke rising using Animated.timing
      const riseAnimation = Animated.timing(animatedY, {
        toValue: startY - riseDistance,
        duration: riseDuration,
        useNativeDriver: false, // We need to animate position
      });
      
      const opacityAnimation = Animated.timing(animatedOpacity, {
        toValue: 0.1, // Fade out to 10% opacity
        duration: riseDuration,
        useNativeDriver: false,
      });
      
      const scaleAnimation = Animated.timing(animatedScale, {
        toValue: randomScale * 1.4, // Expand as it rises
        duration: riseDuration,
        useNativeDriver: false,
      });
      
      // Run all animations in parallel
      Animated.parallel([riseAnimation, opacityAnimation, scaleAnimation]).start(() => {
        // Remove smoke particle when animation completes
        setTimeout(() => {
          setSmoke(prev => {
            const filteredSmoke = prev.filter(particle => particle.id !== particleId);
            return filteredSmoke;
          });
        }, 300);
      });
      
      // Create next smoke particle after a delay (only if animation is still running)
      if (smokeAnimationRef.current) {
        setTimeout(() => {
          createSmokeParticle();
        }, 50 + Math.random() * 67); // 50-117ms between particles (3x quantity)
      }
    };
    
    // Start creating smoke particles for modal after a small delay to ensure modal is rendered
    setTimeout(() => {
      createSmokeParticle();
    }, 200);
    
    // Automatically stop smoke animation after 10 seconds
    setTimeout(() => {
      smokeAnimationRef.current = false;
      setIsSmokeAnimationRunning(false);
      setSmoke([]); // Clear all smoke particles
      setShowSmokeModal(false); // Close the modal
    }, 10000);
  };

  // Dynamic style for temple scroll content positioning
  const templeScrollContentStyle = useMemo(() => ({
    ...styles.templeScrollContent,
    paddingTop: selectedStyle === 'temple1' ? 200 : 125,
  }), [selectedStyle]);



  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  const handleSaveTemple = async () => {
    await AsyncStorage.setItem('templeConfig', JSON.stringify({
      selectedStyle,
      bgGradient,
      selectedDeities,
      deityState,
    }));
    router.back();
  };

  return (
    <>
      <View style={styles.container}>
      {/* Purple Gradient Background (dynamic) */}
      <LinearGradient
        colors={bgGradient as any}
        style={styles.purpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Invisible ScrollView for temple positioning */}
      <ScrollView 
        style={styles.templeScrollView}
        contentContainerStyle={templeScrollContentStyle}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Temple image chosen by user */}
        <Image
          source={templeStyles.find(t => t.id === selectedStyle)?.image}
          style={styles.templeImage}
          resizeMode="contain"
        />
      </ScrollView>
      
      {/* Bells: left and right */}
      <Image
        source={require('@/assets/images/temple/GoldenBell.png')}
        style={styles.bellLeft}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/temple/GoldenBell.png')}
        style={styles.bellRight}
        resizeMode="contain"
      />
             {/* Arch on top */}
       <ArchSVG width={screenWidth} height={(screenWidth * 195) / 393} style={styles.archImage} />
       
               {/* Flowers dropped in front of temple */}
         {flowers.map((flower) => (
           <Animated.View
             key={flower.id}
             style={[
               styles.flower,
               {
                 left: flower.x,
                 top: flower.y,
                 opacity: flower.opacity,
                 transform: [
                   { rotate: `${flower.rotation}deg` },
                   { scale: flower.scale },
                 ],
               },
             ]}
           >
             {flower.type === 'redRose' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/rose.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : (
               <Text style={styles.flowerEmoji}>{getFlowerEmoji(flower.type)}</Text>
             )}
           </Animated.View>
         ))}
         
         {/* Transparent area for save button */}
         <View 
           style={styles.scrollableArea}
         >
          <View style={styles.scrollableContent}>
                         {/* Display selected deity images */}
          </View>
        </View>
        
        {/* Invisible Screen-Sized Box for Deities */}
        <View style={styles.deityContainer}>
          {/* Deities positioned in screen-sized container */}
          {Object.keys(selectedDeities).length > 0 ? (
            Object.keys(selectedDeities).map((key: string, idx: number) => {
              const selectedStatueUrl = selectedDeities[key];
              const statueImage = getImageSource(selectedStatueUrl);
              
              // Find saved position and scale for this deity
              const savedDeity = deityState.find(d => d.key === key);
              
              // Use simple screen coordinates
              const initialX = savedDeity?.x ?? (50 + idx * 100);
              const initialY = savedDeity?.y ?? (300 + idx * 100);
              const initialScale = savedDeity?.scale ?? 2;
              
              return (
                <StaticDeity
                  key={`${key}-${deityState.length}`}
                  source={statueImage}
                  x={initialX}
                  y={initialY}
                  scale={initialScale}
                  size={60}
                  label={deityList.find(d => d.key === key)?.label || key}
                />
              );
            })
          ) : null}
        </View>
        
        {/* Puja Icons Row */}
        <View style={styles.pujaIconsRow}>
          <TouchableOpacity 
            style={[
              styles.pujaIconItem, 
              isFlowerAnimationRunning && styles.pujaIconItemDisabled
            ]} 
                         onPress={() => {
               openFlowerModal();
             }}
            disabled={isFlowerAnimationRunning}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pujaIcon,
              isFlowerAnimationRunning && styles.pujaIconDisabled
            ]}>🌸</Text>
            <Text style={[
              styles.pujaIconLabel,
              isFlowerAnimationRunning && styles.pujaIconLabelDisabled
            ]}>Flowers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pujaIconItem}>
            <Text style={styles.pujaIcon}>🕉️</Text>
            <Text style={styles.pujaIconLabel}>Aarti</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.pujaIconItem,
              isSmokeAnimationRunning && styles.pujaIconItemDisabled
            ]} 
            onPress={() => setShowSmokeModal(true)}
            disabled={isSmokeAnimationRunning}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pujaIcon,
              isSmokeAnimationRunning && styles.pujaIconDisabled
            ]}>💨</Text>
            <Text style={[
              styles.pujaIconLabel,
              isSmokeAnimationRunning && styles.pujaIconLabelDisabled
            ]}>Dhoop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pujaIconItem} onPress={playConchSound}>
            <Image 
              source={require('@/assets/images/icons/own temple/sankha.png')}
              style={styles.pujaIconImage}
              resizeMode="contain"
            />
            <Text style={styles.pujaIconLabel}>Shankh</Text>
          </TouchableOpacity>
        </View>
      </View>
  
             {/* Flower Selection Modal - Moved outside main container */}
       <Modal
         visible={showFlowerModal}
         transparent={true}
         animationType="fade"
         onRequestClose={() => {
           setShowFlowerModal(false);
         }}
         statusBarTranslucent={true}
       >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowFlowerModal(false)}
          >
            <View style={styles.modalContent}>
               <View style={styles.flowerOptions}>
                 <TouchableOpacity 
                   style={styles.flowerOption} 
                   onPress={() => dropFlowers('hibiscus')}
                 >
                   <Text style={styles.flowerOptionEmoji}>🌺</Text>
                   <Text style={styles.flowerOptionLabel}>Hibiscus</Text>
                 </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('redRose')}
                >
                  <Image 
                    source={require('@/assets/images/icons/own temple/rose.png')}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.flowerOptionLabel}>Red Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('whiteRose')}
                >
                  <Text style={styles.flowerOptionEmoji}>🌷</Text>
                  <Text style={styles.flowerOptionLabel}>Pink Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('sunflower')}
                >
                  <Text style={styles.flowerOptionEmoji}>🌻</Text>
                  <Text style={styles.flowerOptionLabel}>Sunflower</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('marigold')}
                >
                  <Text style={styles.flowerOptionEmoji}>🌼</Text>
                  <Text style={styles.flowerOptionLabel}>Marigold</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('belPatra')}
                >
                  <Text style={styles.flowerOptionEmoji}>🍃</Text>
                  <Text style={styles.flowerOptionLabel}>Bel Patra</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropMixFlowers()}
                >
                  <Text style={styles.flowerOptionEmoji}>🌸</Text>
                  <Text style={styles.flowerOptionLabel}>Mix Flowers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
       
       {/* Smoke Effect Modal - Fully transparent background */}
       <Modal
         visible={showSmokeModal}
         transparent={true}
         animationType="none"
         onRequestClose={() => {
           setIsSmokeAnimationRunning(false);
           smokeAnimationRef.current = false;
           setShowSmokeModal(false);
           setSmoke([]); // Clear all smoke particles
         }}
         statusBarTranslucent={true}
       >
         <TouchableOpacity 
           style={styles.smokeModalOverlay}
           activeOpacity={1}
           onPress={() => {
             setIsSmokeAnimationRunning(false);
             smokeAnimationRef.current = false;
             setShowSmokeModal(false);
             setSmoke([]); // Clear all smoke particles
           }}
         >
           {/* Smoke particles rendered in the modal */}
           {smoke.map((particle) => (
             <Animated.View
               key={particle.id}
               style={[
                 styles.smokeParticle,
                 {
                   left: particle.x,
                   top: particle.animatedY,
                   opacity: particle.animatedOpacity,
                   transform: [
                     { rotate: `${particle.rotation}deg` },
                     { scale: particle.animatedScale },
                   ],
                 },
               ]}
             >
               <Text style={styles.smokeEmoji}>💨</Text>
             </Animated.View>
           ))}
         </TouchableOpacity>
       </Modal>
     </>
   );
}

 const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: '#fff' },
   purpleGradient: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 0,
   },
   templeScrollView: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 0, // Moved behind bells and arch
   },
   templeScrollContent: {
     alignItems: 'center',
   },
   templeImage: {
     width: screenWidth * 1.38,
     height: undefined,
     aspectRatio: 1.2,
     alignSelf: 'center',
   },
   bellLeft: {
     position: 'absolute',
     top: 95,
     left: 40,
     width: 62.4,
     height: 117,
     zIndex: 1,
   },
   bellRight: {
     position: 'absolute',
     top: 95,
     right: 40,
     width: 62.4,
     height: 117,
     zIndex: 1,
   },
   archImage: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     zIndex: 2,
   },
   scrollableArea: {
     position: 'absolute',
     top: 590,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 10,
   },
   scrollableContent: {
     alignItems: 'center',
     paddingTop: 20,
     paddingBottom: 40,
     minHeight: 300,
   },
   saveButton: {
     marginTop: 32,
     backgroundColor: '#FF6A00',
     borderRadius: 24,
     paddingVertical: 14,
     paddingHorizontal: 40,
     alignSelf: 'center',
   },
   saveButtonText: {
     color: '#fff',
     fontWeight: 'bold',
     fontSize: 17,
   },
   
        deityRow: {
       flexDirection: 'row',
       justifyContent: 'center',
       alignItems: 'center',
       gap: 20,
       marginTop: -5,
       flexWrap: 'wrap',
       zIndex: 20,
     },
     deityItem: {
       alignItems: 'center',
       marginHorizontal: 10,
       zIndex: 20,
     },
        deityImage: {
       width: 60,
       height: 60,
       marginBottom: 8,
       zIndex: 20,
     },
         deityLabel: {
       color: '#fff',
       fontSize: 12,
       fontWeight: 'bold',
       textAlign: 'center',
     },
     pujaIconsRow: {
      position: 'absolute',
      top: 500, // Position below temple area
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
      width: '100%',
      zIndex: 10, // Above temple but below bells and arch
      marginTop: 60,
    },
     pujaIconItem: {
       alignItems: 'center',
       justifyContent: 'center',
       paddingVertical: 10,
       paddingHorizontal: 15,
     },
     pujaIcon: {
       fontSize: 32,
       marginBottom: 8,
     },
                       pujaIconLabel: {
         color: '#FFE5B4',
         fontSize: 14,
         fontWeight: 'bold',
         textAlign: 'center',
         textShadowColor: 'rgba(0, 0, 0, 0.8)',
         textShadowOffset: { width: 1, height: 1 },
         textShadowRadius: 2,
       },
               flower: {
          position: 'absolute',
          zIndex: 25, // Above deities (zIndex: 15) and temple but below bells and arch
        },
               flowerEmoji: {
          fontSize: 40,
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        flowerImage: {
          width: 40, // Adjust size as needed
          height: 40, // Adjust size as needed
        },
        pujaIconItemDisabled: {
          opacity: 0.5,
        },
        pujaIconDisabled: {
          opacity: 0.5,
        },
                 pujaIconLabelDisabled: {
           opacity: 0.5,
         },
         pujaIconImage: {
           width: 32, // Adjust size as needed
           height: 32, // Adjust size as needed
           marginBottom: 8,
         },
                                                                               modalOverlay: {
               flex: 1,
               backgroundColor: 'transparent',
               justifyContent: 'flex-end',
               alignItems: 'center',
               zIndex: 1000,
             },
             modalOverlayTouchable: {
               flex: 1,
               width: '100%',
               justifyContent: 'flex-end',
               alignItems: 'center',
             },
             modalContent: {
               backgroundColor: '#fff',
               borderRadius: 15,
               padding: 20,
               marginBottom: 150,
               alignItems: 'center',
               minWidth: 250,
               zIndex: 1001,
               elevation: 10,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: -2 },
               shadowOpacity: 0.25,
               shadowRadius: 4,
             },
         modalTitle: {
           fontSize: 18,
           fontWeight: 'bold',
           color: '#333',
           marginBottom: 15,
           textAlign: 'center',
         },
         flowerOptions: {
           flexDirection: 'row',
           flexWrap: 'wrap',
           justifyContent: 'center',
           gap: 15,
           marginBottom: 15,
         },
         flowerOption: {
           alignItems: 'center',
           padding: 10,
           borderRadius: 10,
           backgroundColor: '#f8f9fa',
           minWidth: 60,
         },
         flowerOptionEmoji: {
           fontSize: 30,
           marginBottom: 5,
         },
         flowerOptionLabel: {
           fontSize: 12,
           fontWeight: 'bold',
           color: '#333',
           textAlign: 'center',
         },
         flowerOptionImage: {
           width: 30,
           height: 30,
           marginBottom: 5,
         },
          deityContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5, // Above temple but below bells and arch
          },
    smokeParticle: {
      position: 'absolute',
      zIndex: 30, // Above deities (zIndex: 15) in the same container
    },
    smokeEmoji: {
      fontSize: 60, // Increased from 40
      textShadowColor: 'rgba(0, 0, 0, 0.9)', // Much darker shadow
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 6, // Increased shadow radius
      color: '#000000', // Black color for better visibility on white background
    },
    smokeModalOverlay: {
      flex: 1,
      backgroundColor: 'transparent', // Changed from white to transparent
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },

  });  