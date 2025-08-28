import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated, PanResponder, Alert, Easing, TextInput, AppState } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { markDailyPujaVisited } from '@/utils/dailyPujaUtils';
import { loadTempleConfiguration, checkUserAuthentication, loadTempleFromDatabase } from '@/utils/templeUtils';
import { getApiUrl, getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const TEMPLE_CONFIG_KEY = 'templeConfig';
const SELECTED_DEITIES_KEY = 'selectedDeities';
const DEITY_STATE_KEY = 'deityState';

// S3 Image Gallery Interfaces
interface S3Image {
  key: string;
  name: string;
  url: string;
  size: number;
}

interface ImageFolder {
  name: string;
  prefix: string;
  images: S3Image[];
  iconImage?: S3Image | null; // Add icon image field for navigation
  godName?: string; // Add god name field
}

// Flower type for animations
type Flower = { id: string; x: number; y: number; rotation: number; scale: number; opacity: number; type: string };

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
  {
    id: 'temple3', 
    name: 'Temple Style 3',
    image: require('@/assets/images/temple/Temple3.png'),
  },
];

const ArchSVG = (props: { width?: number; height?: number; style?: any }) => {
  return (
    <Svg
      width={props.width || screenWidth}
      height={props.height || (screenWidth * 295) / 393}
      viewBox="0 0 393 295"
      fill="none"
      style={props.style}
    >
      <Path
        d="m195.41,144.53c0,0 -5.13,43.22 -71.95,40.79c0,0 -40.54,-3.6 -34.78,31.09c0,0 -54.11,-5.23 -56.65,54.74c0,0 -28.94,-1.71 -32.01,17.85l-121.02,0c0,-65 -1,-283 -1,-348l480.57,-1.99c145.81,0.66 72.76,-0.67 163.57,1l-10.14,348.99l-121.2,0c0,0 0.95,-18.14 -32.01,-17.85c0,0 1.43,-55.44 -56.65,-54.8c0,0 8.36,-27.21 -29.41,-30.87c-0.03,0 -60.23,9.55 -77.32,-40.95z"
        fill="url(#archGradient)"
      />
      <Defs>
        <SvgLinearGradient id="archGradient" x1="0.5" y1="0.15" x2="0.5" y2="0.78" gradientUnits="objectBoundingBox">
          <Stop stopColor="#FFAE51" />
          <Stop offset="0.99" stopColor="#E87C00" />
        </SvgLinearGradient>
      </Defs>
    </Svg>
  );
};

// Swingable Bell component
const SwingableBell: React.FC<{ position: 'left' | 'right'; swingValue: Animated.Value }> = ({ position, swingValue }) => {
  const swingBell = () => {
    Animated.sequence([
      Animated.timing(swingValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(swingValue, {
        toValue: -1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(swingValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const swingStyle = {
    transform: [
      {
        rotate: swingValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-30deg', '0deg', '30deg'],
        }),
      },
    ],
    transformOrigin: 'top',
  };

  return (
    <TouchableOpacity onPress={swingBell} activeOpacity={0.8}>
      <Animated.View style={[position === 'left' ? styles.bellLeft : styles.bellRight, swingStyle]}>
        <Image
          source={require('@/assets/images/temple/templeBellIcon2.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Draggable Thali component
const DraggableThali: React.FC<{ onImageLoad: () => void }> = ({ onImageLoad }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        // Optional: Add boundaries or snap behavior here
      },
    })
  ).current;

  const handleImageLoad = () => {
    onImageLoad();
    // Fade in the thali smoothly
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        { 
          transform: pan.getTranslateTransform(),
          position: 'absolute',
          bottom: 100,
          left: (screenWidth - 200) / 2, // Center horizontally
          width: 200,
          height: 200,
          zIndex: 1000,
          opacity: fadeAnim,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <Image 
        source={require('@/assets/images/icons/own temple/PujaThali1.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
        onLoad={handleImageLoad}
        onError={(error) => console.error('🔍 [DEBUG] PujaThali1.png failed to load:', error)}
      />
    </Animated.View>
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
  const [selectedDeities, setSelectedDeities] = useState<{[key: string]: string}>({});
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [assetPreloading, setAssetPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [bgGradient, setBgGradient] = useState<string[]>(["#8B5CF6", "#7C3AED", "#6D28D9"]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [ghantiSound, setGhantiSound] = useState<Audio.Sound | null>(null);
  const [isPlayingGhanti, setIsPlayingGhanti] = useState(false);
  const [welcomeBellPlayed, setWelcomeBellPlayed] = useState(false);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [flowerAnimations, setFlowerAnimations] = useState<{[key: string]: Animated.Value}>({});
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);

  const [showAartiModal, setShowAartiModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [selectedMusicFilter, setSelectedMusicFilter] = useState('All');
  const [musicFiles, setMusicFiles] = useState<any[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingMusicId, setLoadingMusicId] = useState<string | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [thaliPosition, setThaliPosition] = useState({ x: 0, y: 0 });
  const [leftBellSwing, setLeftBellSwing] = useState(new Animated.Value(0));
  const [rightBellSwing, setRightBellSwing] = useState(new Animated.Value(0));
  const [thaliImageLoaded, setThaliImageLoaded] = useState(false);
  
  // S3 Image Gallery State
  const [s3Folders, setS3Folders] = useState<ImageFolder[]>([]);
  const [currentS3FolderIndex, setCurrentS3FolderIndex] = useState(0);
  const [currentS3ImageIndex, setCurrentS3ImageIndex] = useState(0);
  const [currentS3ImageUrl, setCurrentS3ImageUrl] = useState<string>('');
  const [showS3Gallery, setShowS3Gallery] = useState(false);
  const [s3Loading, setS3Loading] = useState(false);
  const [godNames, setGodNames] = useState<{[folderId: string]: string}>({});
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  
  // Today's Special State
  const [todaySpecialDeities, setTodaySpecialDeities] = useState<string[]>([]);
  const [isTodaySpecialMode, setIsTodaySpecialMode] = useState(false);
  
  // Temple Configuration State
  const [hasTempleConfigured, setHasTempleConfigured] = useState(false);
  const [userChoseContinueWithoutTemple, setUserChoseContinueWithoutTemple] = useState(false);
  
  // Puja Ritual State
  const [isPujaRitualActive, setIsPujaRitualActive] = useState(false);
  const [thaliEllipseAnimation] = useState(new Animated.Value(0));
  const [flowerDropAnimation] = useState(new Animated.Value(0));
  
  // Unique flower ID counter to prevent duplicate keys
  const flowerIdCounter = useRef(0);
  
  // Function to generate unique flower ID
  const generateUniqueFlowerId = () => {
    flowerIdCounter.current += 1;
    return `flower_${Date.now()}_${flowerIdCounter.current}`;
  };
  
  // PanResponder for swipe gestures on images
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // More responsive: lower threshold and allow some horizontal movement
        const shouldRespond = Math.abs(dy) > 15 && Math.abs(dy) > Math.abs(dx) * 1.5;
        return shouldRespond;
      },
      onPanResponderGrant: () => {
        setSwipeDirection(null);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        if (Math.abs(dy) > 20) {
          const direction = dy > 0 ? 'down' : 'up';
          setSwipeDirection(direction);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;
        const minSwipeDistance = 50; // Reduced threshold for better responsiveness
        const minVelocity = 0.3; // Lower velocity threshold
        
        // Check if S3 data is ready before allowing navigation
        if (s3Folders.length === 0) {
          setSwipeDirection(null);
          return;
        }
        
        if (Math.abs(dy) > minSwipeDistance || Math.abs(vy) > minVelocity) {
          if (dy > 0) {
            // Swipe down - go to previous image
            navigateToPreviousS3Image();
          } else {
            // Swipe up - go to next image
            navigateToNextS3Image();
          }
        }
        
        // Reset swipe direction after a short delay
        setTimeout(() => setSwipeDirection(null), 300);
      },
      onPanResponderTerminate: () => {
        setSwipeDirection(null);
      },
    }), [s3Folders.length, showS3Gallery, s3Loading, currentS3FolderIndex, currentS3ImageIndex]
  );

  const router = useRouter();

  // Configure audio session for background playback
  useEffect(() => {
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to configure audio session:', error);
      }
    };

    configureAudioSession();
  }, []);

  // Handle app state changes for background audio
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Resume audio if it was playing before going to background
        if (sound && currentlyPlaying) {
          sound.playAsync().catch(error => {
            console.error('Error resuming audio:', error);
          });
        }
      }
      // Audio will continue playing in background due to staysActiveInBackground: true
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, currentlyPlaying]);

  // Function to play welcome bell sound
  const playWelcomeBell = async () => {
    // Prevent multiple welcome bell calls
    if (welcomeBellPlayed) {
      return;
    }

    // Prevent multiple simultaneous sounds
    if (isPlayingGhanti) {
      console.log('🔔 [WELCOME] Already playing ghanti sound, skipping...');
      return;
    }

    let newGhantiSound: any = null;
    try {
      setIsPlayingGhanti(true);
      
      // Stop any currently playing ghanti sound
      if (ghantiSound) {
        try {
          const status = await ghantiSound.getStatusAsync();
          if (status.isLoaded) {
            await ghantiSound.stopAsync();
            await ghantiSound.unloadAsync();
            console.log('🔔 [WELCOME] Stopped existing ghanti sound');
          }
        } catch (error) {
          console.error('🔔 [WELCOME] Error stopping existing ghanti sound:', error);
        }
      }

      // Load the temple bell sound first
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('@/assets/sounds/TempleBell.mp3'),
        { shouldPlay: false, isLooping: false } // Don't auto-play, load first
      );
      
      newGhantiSound = soundObject;
      
      // Wait a moment for the sound to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now play the sound
      await newGhantiSound.playAsync();
      
      setGhantiSound(newGhantiSound);
      setWelcomeBellPlayed(true);

      // Stop the sound after 2 seconds
      setTimeout(async () => {
        try {
          if (newGhantiSound) {
            const status = await newGhantiSound.getStatusAsync();
            if (status.isLoaded) {
              await newGhantiSound.stopAsync();
              await newGhantiSound.unloadAsync();
            }
          }
          setGhantiSound(null);
          setIsPlayingGhanti(false);
        } catch (error) {
          console.error('🔔 [WELCOME] Error stopping welcome bell:', error);
          setIsPlayingGhanti(false);
        }
      }, 2000);

    } catch (error) {
      console.error('🔔 [WELCOME] Error playing welcome bell sound:', error);
      setIsPlayingGhanti(false);
      // Don't set sound state if there's an error
    }
  };

  // Function to perform puja ritual
  const performPujaRitual = async () => {
    if (isPujaRitualActive) return; // Prevent multiple simultaneous rituals
    
        setIsPujaRitualActive(true);
    
    try {
      // 1. Swing bells in parallel
      const swingBells = async () => {
        const bellSwingDuration = 2000;
        
        // Left bell swing
        Animated.sequence([
          Animated.timing(leftBellSwing, {
            toValue: 1,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(leftBellSwing, {
            toValue: -1,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(leftBellSwing, {
            toValue: 0,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
        ]).start();

        // Right bell swing
        Animated.sequence([
          Animated.timing(rightBellSwing, {
            toValue: 1,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: -1,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: 0,
            duration: bellSwingDuration / 4,
            useNativeDriver: true,
          }),
        ]).start();
      };

      // 2. Play ghanti sound in parallel
      const playGhantiSound = async () => {
        try {
          const { sound: newGhantiSound } = await Audio.Sound.createAsync(
            require('@/assets/sounds/TempleBell.mp3'),
            { shouldPlay: true, isLooping: false, volume: 0.8 }
          );
          
          setTimeout(async () => {
            try {
              await newGhantiSound.stopAsync();
              await newGhantiSound.unloadAsync();
            } catch (error) {
              console.error('Error stopping ghanti sound:', error);
            }
          }, 3000);
        } catch (error) {
          console.error('Error playing ghanti sound:', error);
        }
      };

      // 3. Drop mixed flowers in parallel
      const dropMixedFlowers = async () => {
        const flowerTypes = ['rose', 'jasmine', 'lotus', 'marigold', 'tulsi'];
        let flowerCounter = 0; // Counter for unique flower IDs
        
        // Calculate temple width and position for flower spread
        const templeWidth = screenWidth * 1.38; // Same as temple image width
        const templeCenterX = screenWidth / 2;
        const templeLeftX = templeCenterX - (templeWidth / 2);
        const templeRightX = templeCenterX + (templeWidth / 2);
        
        // Create 11 rows of flowers using the same system as individual flower dropping (reduced by 30%)
        for (let row = 0; row < 11; row++) {
          // Create 11 flowers per row (reduced by 30%)
          for (let i = 0; i < 11; i++) {
            const flowerId = generateUniqueFlowerId(); // Generate truly unique ID for each flower
            const randomType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            
            // Spread flowers evenly across temple width with some randomness
            const baseX = templeLeftX + (templeWidth * i / 10); // Evenly spaced (11 flowers = 10 gaps)
            const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
            const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
            
            const randomRotation = Math.random() * 360; // Random rotation
            const randomScale = 0.4 + Math.random() * 0.2; // Half size: 0.4-0.6 scale
            const randomStartY = -50 - (Math.random() * 100) - (row * 150); // Stagger rows vertically

            const newFlower: Flower = {
              id: flowerId,
              x: x,
              y: randomStartY, // Start from above the screen with random height
              rotation: randomRotation,
              scale: randomScale,
              opacity: 1, // Start fully visible
              type: randomType,
            };

            setFlowers(prev => {
              return [...prev, newFlower];
            });

            // Animate flower falling using the same animation system
            const fallDuration = 3000 + (Math.random() * 1000) + (row * 500); // Stagger duration by row
            const fallDistance = 800 + (row * 100); // Increase fall distance for each row
            const templeY = selectedStyle === 'temple1' ? 400 : selectedStyle === 'temple2' ? 325 : 350; // Temple position
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
                setFlowers(prev => prev.filter(f => f.id !== flowerId));
              }
            };
            
            // Start animation immediately
            requestAnimationFrame(animateFall);
          }
        }
      };

      // 4. Move Puja Thali in clockwise ellipse in parallel
      const movePujaThali = async () => {
        const ellipseWidth = screenWidth * 0.7; // 70% of screen width
        const ellipseHeight = ellipseWidth * 0.6; // Maintain aspect ratio
        const startY = 1000; // Start at 1000px from top
        const centerX = screenWidth / 2;
        const centerY = startY + ellipseHeight / 2;
        
        // Reset animation
        thaliEllipseAnimation.setValue(0);
        
        // Start continuous bell ringing with proper cleanup
        let bellInterval: any;
        let flowerInterval: any;
        
        // Start continuous bell ringing
        bellInterval = setInterval(() => {
          // Create new bell animations each time to avoid conflicts
          const leftBellSwing = new Animated.Value(0);
          const rightBellSwing = new Animated.Value(0);
          
          // Left bell swing
          Animated.sequence([
            Animated.timing(leftBellSwing, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(leftBellSwing, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Right bell swing
          Animated.sequence([
            Animated.timing(rightBellSwing, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rightBellSwing, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Play bell sound
          playConchSound();
        }, 3000); // Ring bells every 3 seconds
        
        // Start continuous flower dropping
        flowerInterval = setInterval(() => {
          dropMixedFlowers();
        }, 3000); // Drop flowers every 3 seconds for smoother experience
        
        // Create smooth orbital path - 5 complete orbits
        // Duration: 6000ms for one complete orbit, so 5 orbits = 30 seconds
        const animation = Animated.timing(thaliEllipseAnimation, {
          toValue: 5, // 0 to 5 for 5 complete orbits
          duration: 30000, // 30 seconds for 5 orbits
          useNativeDriver: true,
        });
        
        animation.start(({ finished }) => {
          // Clear intervals when animation completes
          if (bellInterval) clearInterval(bellInterval);
          if (flowerInterval) clearInterval(flowerInterval);
          
          // Reset all states properly
          setTimeout(() => {
            setIsPujaRitualActive(false);
            setFlowers([]); // Clear all flowers
            setFlowerAnimations({}); // Clear all flower animations
          }, 1000); // Small delay to ensure cleanup
        });
      };

      // Execute flower dropping and thali animation in parallel
      await Promise.all([
        dropMixedFlowers(),
        movePujaThali()
      ]);
      
    } catch (error) {
      // Silent error handling
    } finally {
      // Don't reset state here - let the animation callback handle it
    }
  };

  // S3 Image Gallery Functions
  const isImageKey = (key: string) => {
    const lower = key.toLowerCase();
    return (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif')
    );
  };

  const extractFolderNames = (files: any[]): string[] => {
    const folderNames = new Set<string>();
    
    files.forEach(file => {
      if (file.key && file.key.startsWith('dailytemples/')) {
        const parts = file.key.split('/');
        if (parts.length >= 2 && parts[0] === 'dailytemples' && parts[1] && parts[1] !== '') {
          folderNames.add(parts[1]);
        }
      }
    });
    
    return Array.from(folderNames).sort();
  };

  const fetchPresignedUrl = async (key: string): Promise<string | null> => {
    try {
      const presignedUrl = getApiUrl(`/api/s3/download-url?key=${encodeURIComponent(key)}&expiresIn=3600`);
      const res = await fetch(presignedUrl, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data && data.success && data.presignedUrl) {
        return data.presignedUrl;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  };

  const fetchGodNames = async (): Promise<{[folderId: string]: string}> => {
    // Hardcoded deity names data
    const hardcodedGodNames = [
      { "id": "01ganesha", "name": "Vighnaharta Ganesh" },
      { "id": "02shiv", "name": "Mahadev Shiv Ji" },
      { "id": "03vishnu", "name": "Vishnu Bhagwan" },
      { "id": "04durga", "name": "Durga Maa" },
      { "id": "05lakshmi", "name": "Lakshmi Maa" },
      { "id": "06hanuman", "name": "Mahaveer Hanuman" },
      { "id": "07ram", "name": "Shri Ram" },
      { "id": "08krishna", "name": "Shri Krishna" },
      { "id": "09balgopal", "name": "Bal Gopal" },
      { "id": "10kali", "name": "Maa Kali" },
      { "id": "11saraswati", "name": "Saraswati Maa" },
      { "id": "12ganga", "name": "Ganga Maiya" },
      { "id": "13shani", "name": "Shani Dev" },
      { "id": "14surya", "name": "Surya Dev" },
      { "id": "15tirupatibalaji", "name": "Tirupati Bala Ji" },
      { "id": "16brihaspati", "name": "Brihaspati Dev" }
    ];
    
    // Convert array format to key-value mapping
    const godNamesMap: {[folderId: string]: string} = {};
    hardcodedGodNames.forEach((item: {id: string, name: string}) => {
      godNamesMap[item.id] = item.name;
    });
    
    return godNamesMap;
  };

  const fetchAllImagesAndOrganize = async (godNamesData: {[folderId: string]: string}): Promise<ImageFolder[]> => {
    try {
      const apiUrl = getApiUrl('/api/s3/files?prefix=dailytemples/&maxKeys=1000');
      
      const res = await fetch(apiUrl, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        return [];
      }
      
      const data = await res.json();
      
      // Check if we got a valid response
      if (!data) {
        return [];
      }
      
      if (!data.success) {
        return [];
      }
      
      if (!Array.isArray(data.files)) {
        return [];
      }
      
      if (data.files.length === 0) {
        return [];
      }
      
      if (data && data.success && Array.isArray(data.files)) {
        const folderNames = extractFolderNames(data.files);
        
        const organizedFolders: ImageFolder[] = [];
        
        for (const folderName of folderNames) {
          // Skip rahu-ketu and brihaspati folders
          if (folderName.toLowerCase().includes('rahu') || 
              folderName.toLowerCase().includes('ketu') || 
              folderName.toLowerCase().includes('brihaspati')) {
            continue;
          }
          
          const folderPrefix = `dailytemples/${folderName}/`;
          const folderImages = data.files.filter((f: any) => 
            f && typeof f.key === 'string' && 
            f.key.startsWith(folderPrefix) && 
            f.key !== folderPrefix && 
            isImageKey(f.key)
          );
        
        if (folderImages.length > 0) {
          // Separate Icon.png for folder navigation
          const iconImage = folderImages.find((f: any) => {
            const fileName = f.key.split('/').pop() || f.key;
            return fileName === 'Icon.png';
          });
          
          // Filter out Icon.png for main images
          const mainImages: S3Image[] = folderImages
            .filter((f: any) => {
              const fileName = f.key.split('/').pop() || f.key;
              return fileName !== 'Icon.png'; // Filter out Icon.png files
            })
            .map((f: any) => ({
            key: f.key,
            name: f.key.split('/').pop() || f.key,
            url: '',
            size: f.size || 0,
          }));
          
          // Try to find matching god name from JSON
          let godName = godNamesData[folderName];
          
          if (!godName) {
            // Try different variations of the folder name
            const variations = [
              folderName.toLowerCase(),
              folderName.replace(/\d+/g, ''), // Remove numbers
              folderName.replace(/\d+/g, '').toLowerCase(), // Remove numbers and lowercase
              folderName.replace(/[0-9]/g, ''), // Alternative number removal
              folderName.replace(/[0-9]/g, '').toLowerCase()
            ];
            
            for (const variation of variations) {
              if (godNamesData[variation]) {
                godName = godNamesData[variation];
                break;
              }
            }
          }
          
          const organizedFolder = {
            name: folderName.replace(/([A-Z])/g, ' $1').trim(),
            prefix: folderPrefix,
            images: mainImages, // Main images without Icon.png
            iconImage: iconImage ? { // Separate icon image for navigation
              key: iconImage.key,
              name: iconImage.key.split('/').pop() || iconImage.key,
              url: '',
              size: iconImage.size || 0,
            } : null,
            godName: godName
          };
          
          organizedFolders.push(organizedFolder);
        }
      }
      
      return organizedFolders;
    }
    
    return [];
  } catch (e) {
    return [];
  }
};

  // Helper function to get deity name from folder prefix
  const getDeityNameFromFolder = (folderPrefix: string | undefined): string => {
    if (!folderPrefix) return 'Divine Darshan';
    
    // Extract folder name from prefix (e.g., "dailytemples/01ganesha/" -> "01ganesha")
    const folderName = folderPrefix.split('/')[1];
    if (!folderName) return 'Divine Darshan';
    
    // First, try to get deity name from the organized folders data (which has godNames from JSON)
    if (s3Folders && s3Folders.length > 0) {
      const folderData = s3Folders.find(folder => folder.prefix === folderPrefix);
      if (folderData && folderData.godName) {
        return folderData.godName;
      }
    }
    
    // Check if godNames state is ready
    if (Object.keys(godNames).length === 0) {
      return 'Loading...';
    }
    
    // Try to get deity name from godNames mapping using the exact folder name
    let deityName = godNames[folderName];
    if (deityName) {
      return deityName;
    }
    
    // Try different variations of the folder name
    const variations = [
      folderName.toLowerCase(),
      folderName.replace(/\d+/g, ''), // Remove numbers
      folderName.replace(/\d+/g, '').toLowerCase(), // Remove numbers and lowercase
      folderName.replace(/[0-9]/g, ''), // Alternative number removal
      folderName.replace(/[0-9]/g, '').toLowerCase()
    ];
    
    for (const variation of variations) {
      if (godNames[variation]) {
        deityName = godNames[variation];
        break;
      }
      }
    
    if (deityName) return deityName;
    
    // If no match found, format the folder name nicely
    const fallbackName = folderName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\d+/g, '') // Remove numbers
      .trim();
    
    return fallbackName;
  };

  const handleNextToS3Gallery = async () => {
    // Remove deity requirement - All Temples should work without deities
    // since it fetches data from S3, not from local deity configuration
    
    // Reset Today's Special mode when showing all temples
    setIsTodaySpecialMode(false);
    
    setS3Loading(true);
    try {
      // Fetch god names first
      try {
        const godNamesData = await fetchGodNames();
        setGodNames(godNamesData);
      } catch (error) {
        // Set empty state to prevent infinite loading
        setGodNames({});
      }
      const allFolders = await fetchAllImagesAndOrganize(godNames || {});
      
      if (allFolders.length > 0) {
        setS3Folders(allFolders);
        setCurrentS3FolderIndex(0);
        setCurrentS3ImageIndex(0);
        
        const firstImage = allFolders[0].images[0];
        
        const firstImageUrl = await fetchPresignedUrl(firstImage.key);
        
        if (firstImageUrl) {
          setCurrentS3ImageUrl(firstImageUrl);
          setShowS3Gallery(true);
        } else {
          Alert.alert('Error', 'Failed to load first image. Please try again.');
        }
      } else {
        Alert.alert('No Images Found', 'No temple images are currently available.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load temple images. Please try again.');
    } finally {
      setS3Loading(false);
    }
  };

  const navigateToNextS3Folder = () => {
    if (currentS3FolderIndex < s3Folders.length - 1) {
      setCurrentS3FolderIndex(currentS3FolderIndex + 1);
      setCurrentS3ImageIndex(0);
    } else {
      // Return to deities after last folder
      setShowS3Gallery(false);
      setS3Folders([]);
      setCurrentS3FolderIndex(0);
      setCurrentS3ImageIndex(0);
      setCurrentS3ImageUrl('');
    }
  };

  const navigateToPreviousS3Folder = () => {
    if (currentS3FolderIndex > 0) {
      setCurrentS3FolderIndex(currentS3FolderIndex - 1);
      setCurrentS3ImageIndex(0);
    }
  };

  const navigateToNextS3Image = () => {
    if (s3Folders.length === 0) {
      return;
    }
    
    const currentFolder = s3Folders[currentS3FolderIndex];
    if (!currentFolder || !currentFolder.images || currentFolder.images.length === 0) {
      return;
    }
    
    if (currentS3ImageIndex < currentFolder.images.length - 1) {
      const newIndex = currentS3ImageIndex + 1;
      setCurrentS3ImageIndex(newIndex);
    } else {
        setCurrentS3ImageIndex(0);
    }
  };

  const navigateToPreviousS3Image = () => {
    if (s3Folders.length === 0) {
      return;
    }
    
    const currentFolder = s3Folders[currentS3FolderIndex];
    if (!currentFolder || !currentFolder.images || currentFolder.images.length === 0) {
      return;
    }
    
    if (currentS3ImageIndex > 0) {
      setCurrentS3ImageIndex(currentS3ImageIndex - 1);
    } else {
      // Cycle to last image in the same folder
      setCurrentS3ImageIndex(currentFolder.images.length - 1);
    }
  };

  // Update S3 image URL when folder or image index changes
  useEffect(() => {
    if (showS3Gallery && s3Folders.length > 0 && 
        currentS3FolderIndex < s3Folders.length && 
        currentS3ImageIndex < s3Folders[currentS3FolderIndex].images.length) {
      
      const currentImage = s3Folders[currentS3FolderIndex].images[currentS3ImageIndex];
      
      // Skip Icon.png files - they're only for navigation
      if (currentImage.name === 'Icon.png') {
        // Move to next image if current is Icon.png
        if (currentS3ImageIndex < s3Folders[currentS3FolderIndex].images.length - 1) {
          setCurrentS3ImageIndex(currentS3ImageIndex + 1);
        } else if (currentS3FolderIndex < s3Folders.length - 1) {
          // Move to next folder if at end of current folder
          setCurrentS3FolderIndex(currentS3FolderIndex + 1);
          setCurrentS3ImageIndex(0);
        }
        return;
      }
      
      fetchPresignedUrl(currentImage.key).then(url => {
        if (url) {
          setCurrentS3ImageUrl(url);
        }
      });
    }
  }, [currentS3FolderIndex, currentS3ImageIndex, s3Folders, showS3Gallery]);

  // Debug: Log when godNames changes
  useEffect(() => {
    // Silent godNames state monitoring
  }, [godNames]);

  // Check temple availability when screen comes into focus (e.g., returning from create temple)
  useFocusEffect(
    React.useCallback(() => {
      const checkTempleAvailability = async () => {
        try {
          // First check if user is authenticated
          const { isAuthenticated, userData } = await checkUserAuthentication();
          
          let templeConfig = null;
          
          if (isAuthenticated) {
            // User is logged in - try to load from database first
            try {
              const dbTemple = await loadTempleFromDatabase();
              if (dbTemple) {
                templeConfig = dbTemple;
              }
            } catch (error) {
              // Silent error handling
            }
          }
          
          // If no database temple, try AsyncStorage
          if (!templeConfig) {
            templeConfig = await loadTempleConfiguration();
          }
          
          if (templeConfig) {
            // Config structure analysis removed for cleaner logging
            
            // Check for deities in different possible locations
            let deities = null;
            if (templeConfig.deities) {
              deities = templeConfig.deities;

            } else if (templeConfig.selectedDeities) {
              deities = templeConfig.selectedDeities;

            } else if (templeConfig.templeInformation && templeConfig.templeInformation.selectedDeities) {
              deities = templeConfig.templeInformation.selectedDeities;

            }
            
            if (deities && Object.keys(deities).length > 0) {

              setHasTempleConfigured(true);
              setUserChoseContinueWithoutTemple(false);
              
              // Update selectedDeities
              setSelectedDeities(deities);

              
              // Show a brief success message

            } else {

              setHasTempleConfigured(false);
            }
          } else {

            setHasTempleConfigured(false);
          }
        } catch (error) {
          // Silent error handling
        }
      };
      
      checkTempleAvailability();
    }, [])
  );

  // Mark that user has visited daily puja screen today and play welcome bell
  useEffect(() => {
    const markVisit = async () => {
      try {
        await markDailyPujaVisited();
      } catch (error) {
        // Silent error handling
      }
    };
    
    markVisit();
    
    // Simplified preloading of essential assets for smooth daily puja experience
    const preloadAllAssets = async () => {
      // Prevent multiple executions
      if (assetPreloading) {
        console.log('Preloading already in progress, skipping...');
        return;
      }
      
      setAssetPreloading(true);
      setPreloadProgress(0);
      
      // Helper function to safely preload images
      const safePrefetchImage = async (imagePath: any, description: string) => {
        try {
          // Validate that imagePath is a valid require statement
          if (typeof imagePath === 'string' || typeof imagePath === 'number') {
            return false;
          }
          
          await Image.prefetch(imagePath);
          return true;
        } catch (error) {
          return false;
        }
      };
      
      try {
        let completedSteps = 0;
        const totalSteps = 6; // Reduced total steps for faster loading
        
        const updateProgress = () => {
          completedSteps++;
          const progress = Math.min(Math.round((completedSteps / totalSteps) * 100), 100);
                  setPreloadProgress(progress);
        };
        
        // Preload all flower images
        const flowerImages = [
          require('@/assets/images/icons/own temple/rose.png'),
          require('@/assets/images/icons/own temple/whiterose.png'),
          require('@/assets/images/icons/own temple/jasmine.png'),
          require('@/assets/images/icons/own temple/YellowShevanthi.png'),
          require('@/assets/images/icons/own temple/WhiteShevanthi.png'),
          require('@/assets/images/icons/own temple/RedShevanthi.png'),
        ];
        
        await Promise.all(flowerImages.map(async (image, index) => {
          const flowerNames = ['rose', 'whiterose', 'jasmine', 'YellowShevanthi', 'WhiteShevanthi', 'RedShevanthi'];
          return await safePrefetchImage(image, `flower ${flowerNames[index]}`);
        }));
        updateProgress();
        
        // Preload arti thali
        await safePrefetchImage(
          require('@/assets/images/icons/own temple/PujaThali1.png'),
          'arti thali'
        );
        updateProgress();
        
        // Preload bell images
        const bellImages = [
          require('@/assets/images/temple/templeBellIcon2.png'),
        ];
        
        await Promise.all(bellImages.map(async (image, index) => {
          const bellNames = ['templeBellIcon2'];
          return await safePrefetchImage(image, `bell ${bellNames[index]}`);
        }));
        updateProgress();
        
        // Preload shankh image
        await safePrefetchImage(
          require('@/assets/images/icons/own temple/sankha.png'),
          'shankh'
        );
        updateProgress();
        
        // Preload essential deity images for better performance
        const essentialDeityImages = [
          require('@/assets/images/temple/VishnuIcon.png'),
          require('@/assets/images/temple/Ganesha1.png'),
          require('@/assets/images/temple/Krishna1.png'),
          require('@/assets/images/temple/Lakshmi1.png'),
          require('@/assets/images/temple/Saraswati1.png'),
          require('@/assets/images/temple/Durga1.png'),
          require('@/assets/images/temple/Hanuman1.png'),
        ];
        
        await Promise.all(essentialDeityImages.map(async (image, index) => {
          const deityNames = ['VishnuIcon', 'Ganesha1', 'Krishna1', 'Lakshmi1', 'Saraswati1', 'Durga1', 'Hanuman1'];
          return await safePrefetchImage(image, `deity ${deityNames[index]}`);
        }));
        updateProgress();
        
        // Preload temple background images
        const templeImages = [
          require('@/assets/images/temple/Temple1.png'),
          require('@/assets/images/temple/Temple2.png'),
        ];
        
        await Promise.all(templeImages.map(async (image, index) => {
          const templeNames = ['Temple1', 'Temple2'];
          return await safePrefetchImage(image, `temple ${templeNames[index]}`);
        }));
        updateProgress();
        
        // Preload sound files (non-blocking)
        try {
          // Preload temple bell sound
          const templeBellSound = new Audio.Sound();
          await templeBellSound.loadAsync(require('@/assets/sounds/TempleBell.mp3'));
          await templeBellSound.unloadAsync();
          
          // Preload conch sound
          const conchSound = new Audio.Sound();
          await conchSound.loadAsync(require('@/assets/sounds/conch.mp3'));
          await conchSound.unloadAsync();
        } catch (error) {
          // Silent error handling
        }
        
        // Start S3 preloading in background without blocking the UI
        setTimeout(() => {
          const preloadS3Images = async () => {
            try {
              const godNamesData = await fetchGodNames();
              
              if (godNamesData && Object.keys(godNamesData).length > 0) {
                // Fetch and organize S3 images in background
                const allFolders = await fetchAllImagesAndOrganize(godNamesData);
                
                if (allFolders.length > 0) {
                  // Store the organized data for immediate use when gallery opens
                  setS3Folders(allFolders);
                }
              }
            } catch (error) {
              // Silent fail for preloading
            }
          };
          
          preloadS3Images();
        }, 100);
        
        // Show completion message for a moment before transitioning
        setTimeout(() => {
          setAssetPreloading(false);
        }, 200);
        
        // Progress-based fallback: if progress reaches 100%, hide loading after 1 second
        if (preloadProgress === 100) {
          setTimeout(() => {
            setAssetPreloading(false);
          }, 1000);
        }
        
        // Absolute fallback: ensure loading is hidden after 3 seconds maximum
        setTimeout(() => {
          setAssetPreloading(false);
        }, 3000);
        
        // Ultra-aggressive fallback: force transition after 5 seconds
        setTimeout(() => {
          setAssetPreloading(false);
          setPreloadProgress(0); // Reset progress
        }, 5000);
        
      } catch (error) {
        console.error('Error in asset preloading:', error);
        setAssetPreloading(false);
      }
    };
    
      // Start preloading all assets
      preloadAllAssets();
    }, []); // Remove dependency to prevent multiple executions

  // Separate useEffect for welcome bell and animations - runs only once
  useEffect(() => {
    // Play welcome bell after a short delay
    const welcomeBellTimer = setTimeout(() => {
      playWelcomeBell();
      
      // Swing left bell
      Animated.sequence([
        Animated.timing(leftBellSwing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(leftBellSwing, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(leftBellSwing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Swing right bell with slight delay
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(rightBellSwing, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: -1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    }, 1000);

    // Cleanup timer on unmount
    return () => {
      clearTimeout(welcomeBellTimer);
    };
  }, []); // Empty dependency array - runs only once

  // Function to get today's day of the week
  const getTodayDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Function to fetch today's special pujas and filter S3 folders
  const fetchTodaySpecialPujas = async () => {
    try {
      setS3Loading(true);
      const today = getTodayDayOfWeek();
      
      const response = await fetch(getApiUrl(`/api/temples-by-day?dayOfWeek=${today.toLowerCase()}`), {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success && data.temples && data.temples.length > 0) {
        // Extract deity names from today's pujas and normalize them
        const todayDeityNames = data.temples.map((puja: any) => {
          const normalizedName = puja.deityName.toLowerCase().trim();
          return normalizedName;
        });
        setTodaySpecialDeities(todayDeityNames);
        
        // Fetch god names first
        const godNamesData = await fetchGodNames();
        setGodNames(godNamesData);
        
        // Fetch and organize all S3 images
        const allFolders = await fetchAllImagesAndOrganize(godNamesData);
        
        if (allFolders.length > 0) {
          // Filter folders to only show today's special deities
          const filteredFolders = allFolders.filter(folder => {
            // Normalize folder names for case-insensitive comparison
            const folderNameNormalized = folder.name.toLowerCase().trim();
            const folderNameWithoutSpaces = folder.name.replace(/\s+/g, '').toLowerCase().trim();
            const folderNameWithoutSpecialChars = folder.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const folderNameWithoutNumbers = folder.name.replace(/[0-9]/g, '').toLowerCase().trim();
            
            // Check if any of today's deity names match the folder name
            return todayDeityNames.some((deityName: string) => {
              const normalizedDeityName = deityName.toLowerCase().trim();
              const deityNameWithoutSpaces = deityName.replace(/\s+/g, '').toLowerCase().trim();
              const deityNameWithoutSpecialChars = deityName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              const deityNameWithoutNumbers = deityName.replace(/[0-9]/g, '').toLowerCase().trim();
              
              // Debug logging for better understanding
              
              // Multiple comparison strategies for better matching
              const isMatch = (
                // Direct case-insensitive comparison
                folderNameNormalized === normalizedDeityName ||
                folderNameWithoutSpaces === deityNameWithoutSpaces ||
                folderNameWithoutSpecialChars === deityNameWithoutSpecialChars ||
                folderNameWithoutNumbers === deityNameWithoutNumbers ||
                
                // Partial matching (contains) - check if key words match
                folderNameNormalized.includes(normalizedDeityName) ||
                normalizedDeityName.includes(folderNameNormalized) ||
                
                // Space-removed matching
                folderNameWithoutSpaces.includes(deityNameWithoutSpaces) ||
                deityNameWithoutSpaces.includes(folderNameWithoutSpaces) ||
                
                // Special character removed matching
                folderNameWithoutSpecialChars.includes(deityNameWithoutSpecialChars) ||
                deityNameWithoutSpecialChars.includes(folderNameWithoutSpecialChars) ||
                
                // Number-removed matching (for cases like "05lakshmi" vs "lakshmi")
                folderNameWithoutNumbers.includes(deityNameWithoutNumbers) ||
                deityNameWithoutNumbers.includes(folderNameWithoutNumbers) ||
                
                // Key word matching - check if main deity name is contained
                (() => {
                  // Extract main deity name (remove common suffixes like "maa", "ji", "dev")
                  const mainDeityName = normalizedDeityName
                    .replace(/\b(maa|ji|dev|baba|swami|guru)\b/g, '')
                    .trim();
                  
                  const mainFolderName = folderNameNormalized
                    .replace(/\b(maa|ji|dev|baba|swami|guru)\b/g, '')
                    .trim();
                  
                  return mainDeityName.length > 2 && (
                    folderNameNormalized.includes(mainDeityName) ||
                    mainDeityName.includes(mainFolderName)
                  );
                })()
              );
              
              return isMatch;
            });
          });
          

          
          if (filteredFolders.length > 0) {
            setS3Folders(filteredFolders);
            setCurrentS3FolderIndex(0);
            setCurrentS3ImageIndex(0);
            
            const firstImage = filteredFolders[0].images[0];
            const firstImageUrl = await fetchPresignedUrl(firstImage.key);
            
            if (firstImageUrl) {
              setCurrentS3ImageUrl(firstImageUrl);
              setShowS3Gallery(true);
              setIsTodaySpecialMode(true);
            } else {
              Alert.alert('Error', 'Failed to load first image. Please try again.');
            }
          } else {
            Alert.alert('No Special Pujas Today', 'No special pujas are available for today. Try the "All Temples" option instead.');
          }
        } else {
          Alert.alert('No Images Found', 'No temple images are currently available.');
        }
      } else {
        Alert.alert('No Special Pujas', 'No special pujas are available for today.');
      }
    } catch (error) {
      console.error('❌ Error fetching today\'s special pujas:', error);
      Alert.alert('Error', 'Failed to load today\'s special pujas. Please try again.');
    } finally {
      setS3Loading(false);
    }
  };

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
              case 'templeBellIcon2.png':
          return require('@/assets/images/temple/templeBellIcon2.png');
      case 'arch.svg':
        return require('@/assets/images/temple/arch.svg');
      default:
        return require('@/assets/images/temple/Ganesha1.png');
    }
  };

  // On mount, load and merge state
  useEffect(() => {
    (async () => {
      try {
        // First check if user is authenticated
        const { isAuthenticated, userData } = await checkUserAuthentication();
        
        let templeConfig = null;
        
        if (isAuthenticated) {
          // User is logged in - try to load from database first
          try {
            const dbTemple = await loadTempleFromDatabase();
            if (dbTemple) {
              templeConfig = dbTemple;
            }
          } catch (error) {
            // Silent error handling
          }
        }
        
        // If no database temple, try AsyncStorage
        if (!templeConfig) {
          templeConfig = await loadTempleConfiguration();
        }
        
        if (templeConfig) {
          // Load from configuration
          setHasTempleConfigured(true);
          
          // Check for deities in different possible locations
          let deities = null;
          if (templeConfig.deities) {
            deities = templeConfig.deities;
          } else if (templeConfig.selectedDeities) {
            deities = templeConfig.selectedDeities;
          } else if (templeConfig.templeInformation && templeConfig.templeInformation.selectedDeities) {
            deities = templeConfig.templeInformation.selectedDeities;
          }
          
          if (deities && Object.keys(deities).length > 0) {
            setSelectedDeities(deities);
          }
          
          // Load temple style - check both root and nested locations
          let templeStyle = null;
          if (templeConfig.selectedStyle) {
            templeStyle = templeConfig.selectedStyle;
          } else if (templeConfig.templeInformation && templeConfig.templeInformation.selectedStyle) {
            templeStyle = templeConfig.templeInformation.selectedStyle;
          }
          
          if (templeStyle) {
            setSelectedStyle(templeStyle);
          }
          
          // Load background gradient - check both root and nested locations
          let backgroundGradient = null;
          if (templeConfig.bgGradient) {
            backgroundGradient = templeConfig.bgGradient;
          } else if (templeConfig.templeInformation && templeConfig.templeInformation.bgGradient) {
            backgroundGradient = templeConfig.templeInformation.bgGradient;
          }
          
          if (backgroundGradient) {
            setBgGradient(backgroundGradient);
          }
          
          // Load deity state - check both root and nested locations
          let deityStateData = null;
          if (templeConfig.deityState) {
            deityStateData = templeConfig.deityState;
          } else if (templeConfig.templeInformation && templeConfig.templeInformation.deityState) {
            deityStateData = templeConfig.templeInformation.deityState;
          }
          
          if (deityStateData) {
            setDeityState(deityStateData);
          }
        } else {
          // No temple configured - show options to user
          setHasTempleConfigured(false);
          Alert.alert(
            'No Temple Configured',
            'You can continue without a custom temple or create your own virtual temple.',
            [
              {
                text: 'Continue Without Temple',
                onPress: () => {
                  setUserChoseContinueWithoutTemple(true);
                  // Start directly in All Temples mode - no deities needed
                  setShowS3Gallery(true);
                  setIsTodaySpecialMode(false);
                  handleNextToS3Gallery();
                }
              },
              {
                text: 'Create My Virtual Temple',
                onPress: () => {
                  router.push('/screens/create-temple');
                }
              }
            ]
          );
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ [TEMPLE] Error in main temple load:', error);
        setLoading(false);
      }
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
        try {
          sound.unloadAsync().catch(error => {
            console.error('❌ [MUSIC] Error unloading sound in cleanup:', error);
          });
        } catch (error) {
          console.error('❌ [MUSIC] Error accessing sound in cleanup:', error);
        }
      }
      if (ghantiSound) {
        try {
          ghantiSound.unloadAsync().catch(error => {
            console.error('❌ [MUSIC] Error unloading ghantiSound in cleanup:', error);
          });
        } catch (error) {
          console.error('❌ [MUSIC] Error accessing ghantiSound in cleanup:', error);
        }
      }
    };
  }, [sound, ghantiSound]);







  const swingBothBells = async () => {
    // Prevent multiple simultaneous sounds
    if (isPlayingGhanti) {
      console.log('🔔 [BELL] Already playing ghanti sound, skipping...');
      return;
    }

    // Award mudras for ringing the bell
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('RING_BELL');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('RING_BELL');
        if (mudraResult.success) {
          // Mudras awarded successfully
        } else {
          // Failed to award mudras
        }
      } else {
        // Daily mudras already earned
      }
    } catch (mudraError) {
      // Silent error handling
    }

    // Play temple bell sound twice and start animations
    const playTempleBellSound = async () => {
      try {
        // Remember if music was playing before bell sound
        const wasMusicPlaying = sound && currentlyPlaying;
        const musicFileToRestart = wasMusicPlaying ? musicFiles.find(f => f.avld === currentlyPlaying) : null;
        

        
        // Stop any currently playing ghanti sound
        if (ghantiSound) {
          try {
            // Check if ghantiSound is loaded before attempting to stop it
            const status = await ghantiSound.getStatusAsync();
            if (status.isLoaded) {
              await ghantiSound.stopAsync();
              await ghantiSound.unloadAsync();
              console.log('🔔 [BELL] Successfully stopped and unloaded ghanti sound');
            } else {
              console.log('🔔 [BELL] Ghanti sound was not loaded, skipping stop/unload');
            }
          } catch (error) {
            console.error('🔔 [BELL] Error stopping ghanti sound:', error);
            // Try to unload anyway to clean up the state
            try {
              await ghantiSound.unloadAsync();
            } catch (unloadError) {
              console.error('🔔 [BELL] Error unloading ghanti sound after stop failure:', unloadError);
            }
          }
        }

        // Load and play the temple bell sound
        const { sound: newBellSound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/TempleBell.mp3'),
          { shouldPlay: true, isLooping: false }
        );
        
        setGhantiSound(newBellSound);
        setIsPlayingGhanti(true);

        // Stop the sound after 2 seconds
        setTimeout(async () => {
          try {
            if (newBellSound) {
              // Check if bell sound is loaded before attempting to stop it
              try {
                const status = await newBellSound.getStatusAsync();
                if (status.isLoaded) {
                  await newBellSound.stopAsync();
                  await newBellSound.unloadAsync();
                }
              } catch (stopError) {
                console.error('🔔 [BELL] Error checking bell sound status:', stopError);
                // Try to unload anyway to clean up the state
                try {
                  await newBellSound.unloadAsync();
                } catch (unloadError) {
                  console.error('🔔 [BELL] Error unloading bell sound after status check failure:', unloadError);
                }
              }
            }
            setGhantiSound(null);
            setIsPlayingGhanti(false);
            
            // Restart music if it was playing before bell sound
            if (wasMusicPlaying && musicFileToRestart) {
              try {
                await playMusicFile(musicFileToRestart);
              } catch (error) {
                console.error('🔔 [BELL] Error restarting music after bell:', error);
              }
            }
          } catch (error) {
            console.error('🔔 [BELL] Error in bell sound timeout:', error);
            // Still try to restart music even if stopping bell fails
            if (wasMusicPlaying && musicFileToRestart) {
              try {
                await playMusicFile(musicFileToRestart);
              } catch (error) {
                console.error('🔔 [BELL] Error restarting music after bell error:', error);
              }
            }
          }
        }, 2000);

      } catch (error) {
        console.error('Error playing temple bell sound:', error);
        // If bell fails to play, still try to restart music if it was playing
        if (sound && currentlyPlaying) {
          const currentFile = musicFiles.find(f => f.avld === currentlyPlaying);
          if (currentFile) {
            try {
              await playMusicFile(currentFile);
            } catch (error) {
              console.error('Error restarting music after bell failure:', error);
            }
          }
        }
      }
    };

    // Play first bell sound
    playTempleBellSound();

    // Swing left bell immediately (parallel with first sound)
    Animated.sequence([
      Animated.timing(leftBellSwing, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: -1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(leftBellSwing, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Swing right bell with slight delay (still parallel with first sound)
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(rightBellSwing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightBellSwing, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rightBellSwing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Play second bell sound after 2.5 seconds
    setTimeout(() => {
      playTempleBellSound();
      
      // Swing left bell again for second ring
      Animated.sequence([
        Animated.timing(leftBellSwing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(leftBellSwing, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(leftBellSwing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Swing right bell again with slight delay
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(rightBellSwing, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: -1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(rightBellSwing, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    }, 2500);
  };

  const playConchSound = async () => {
    // Prevent multiple simultaneous sounds
    if (isPlayingGhanti) {
      return;
    }

    // Award mudras for playing shankh
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('PLAY_SHANKH');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('PLAY_SHANKH');
        if (mudraResult.success) {
          // Mudras awarded successfully
        } else {
          // Failed to award mudras
        }
      } else {
        // Daily mudras already earned
      }
    } catch (mudraError) {
      // Silent error handling
    }

    try {
      // Remember if music was playing before conch sound
      const wasMusicPlaying = sound && currentlyPlaying;
      const musicFileToRestart = wasMusicPlaying ? musicFiles.find(f => f.avld === currentlyPlaying) : null;
      

      
      // Stop any currently playing ghanti sound
      if (ghantiSound) {
        try {
          // Check if ghantiSound is loaded before attempting to stop it
          const status = await ghantiSound.getStatusAsync();
          if (status.isLoaded) {
            await ghantiSound.stopAsync();
            await ghantiSound.unloadAsync();
          } else {
            setGhantiSound(null);
          }
        } catch (error) {
          console.error('🔔 [CONCH] Error stopping ghanti sound:', error);
          // Try to unload anyway to clean up the state
          try {
            await ghantiSound.unloadAsync();
          } catch (unloadError) {
            console.error('🔔 [CONCH] Error unloading ghanti sound after stop failure:', unloadError);
          }
          setGhantiSound(null);
        }
      }

      // Load and play the conch sound
      const { sound: newConchSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/conch.mp3'),
        { shouldPlay: true, isLooping: false }
      );
      
      setGhantiSound(newConchSound);
      setIsPlayingGhanti(true);

      // Stop the sound after 5 seconds
      setTimeout(async () => {
        try {
          if (newConchSound) {
            // Check if conch sound is loaded before attempting to stop it
            try {
              const status = await newConchSound.getStatusAsync();
              if (status.isLoaded) {
                await newConchSound.stopAsync();
                await newConchSound.unloadAsync();
              } else {
                // Conch sound was not loaded
              }
            } catch (stopError) {
              console.error('🔔 [CONCH] Error checking conch sound status:', stopError);
              // Try to unload anyway to clean up the state
              try {
                await newConchSound.unloadAsync();
              } catch (unloadError) {
                console.error('🔔 [CONCH] Error unloading conch sound after status check failure:', unloadError);
              }
            }
                      }
            setGhantiSound(null);
            setIsPlayingGhanti(false);
            
            // Restart music if it was playing before conch sound
          if (wasMusicPlaying && musicFileToRestart) {
            try {
              await playMusicFile(musicFileToRestart);
            } catch (error) {
              console.error('🔔 [CONCH] Error restarting music after conch:', error);
            }
          }
        } catch (error) {
          console.error('🔔 [CONCH] Error in conch sound timeout:', error);
          // Still try to restart music even if stopping conch fails
          if (wasMusicPlaying && musicFileToRestart) {
            try {
              await playMusicFile(musicFileToRestart);
            } catch (error) {
              console.error('🔔 [CONCH] Error restarting music after conch error:', error);
            }
          }
        }
      }, 5000);

    } catch (error) {
      console.error('Error playing conch sound:', error);
      // If conch fails to play, still try to restart music if it was playing
      if (sound && currentlyPlaying) {
        const currentFile = musicFiles.find(f => f.avld === currentlyPlaying);
        if (currentFile) {
          try {
            await playMusicFile(currentFile);
          } catch (error) {
            console.error('Error restarting music after conch failure:', error);
          }
        }
      }
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
      case 'jasmine':
        return '🌸';
      case 'yellowShevanthi':
        return '🌼';
      case 'whiteShevanthi':
        return '🌸';
      case 'redShevanthi':
        return '🌹';
      case 'tulsi':
        return '🌿';
      case 'rajnigandha':
        return '💐';
      case 'parajita':
        return '🌼';
      case 'datura':
        return '🌸';
      default:
        return '🌸';
    }
  };

  // Function to open flower selection modal
  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  // Function to drop flowers
  const dropFlowers = async (flowerType: string = 'hibiscus') => {
    if (isFlowerAnimationRunning) return; // Prevent multiple animations
    
    // Award mudras for offering flowers (but still drop flowers even if already earned)
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('OFFER_FLOWERS');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('OFFER_FLOWERS');
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for offering flowers:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for offering flowers:', mudraResult.error);
        }
      } else {
        console.log('✅ Daily flower offering mudras already earned today - but still dropping flowers');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for offering flowers:', mudraError);
    }
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
    // Reset flower drop animation to start (FIRST FUNCTION)
    flowerDropAnimation.setValue(0);
    
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
        const flowerId = generateUniqueFlowerId(); // Generate truly unique ID for each flower
        
        // Spread flowers evenly across temple width with some randomness
        const baseX = templeLeftX + (templeWidth * i / 14); // Evenly spaced (15 flowers = 14 gaps)
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
        const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
        
        const randomRotation = Math.random() * 360; // Random rotation
        const randomScale = 0.4 + Math.random() * 0.2; // Half size: 0.4-0.6 scale
        const randomStartY = -50 - (Math.random() * 100) - (row * 150); // Stagger rows vertically

        const newFlower: Flower = {
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
            // Start animation immediately instead of with delays
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

        // Start animation immediately instead of with delays
        requestAnimationFrame(animateFall);
      }
    }
  };

  // Function to drop mix flowers (one row of each type)
  const dropMixFlowers = async () => {
    if (isFlowerAnimationRunning) return; // Prevent multiple animations
    
    // Award mudras for offering flowers (but still drop flowers even if already earned)
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('OFFER_FLOWERS');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('OFFER_FLOWERS');
        // Silent mudra awarding
      }
      // Silent error handling
    } catch (mudraError) {
      // Silent error handling
    }
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
    // Reset flower drop animation to start (SECOND FUNCTION)
    flowerDropAnimation.setValue(0);
    
    // Calculate temple width and position for flower spread
    const templeWidth = screenWidth * 1.38; // Same as temple image width
    const templeCenterX = screenWidth / 2;
    const templeLeftX = templeCenterX - (templeWidth / 2);
    const templeRightX = templeCenterX + (templeWidth / 2);
    
            const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'sunflower', 'marigold', 'belPatra', 'jasmine', 'yellowShevanthi', 'whiteShevanthi', 'redShevanthi', 'tulsi', 'rajnigandha', 'parajita', 'datura'];
    let totalFlowers = 0;
    let completedFlowers = 0;
    
    // Create 3 rows with mixed flower types
    for (let row = 0; row < 3; row++) {
      // Create 15 flowers per row with mixed types
      for (let i = 0; i < 15; i++) {
        totalFlowers++;
        const flowerId = generateUniqueFlowerId(); // Generate truly unique ID for each flower
        
        // Randomly select a flower type for each flower
        const randomFlowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        
        // Spread flowers evenly across temple width with some randomness
        const baseX = templeLeftX + (templeWidth * i / 14); // Evenly spaced (15 flowers = 14 gaps)
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
        const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
        
        const randomRotation = Math.random() * 360; // Random rotation
        const randomScale = 0.4 + Math.random() * 0.2; // Half size: 0.4-0.6 scale
        const randomStartY = -50 - (Math.random() * 100) - (row * 150); // Stagger rows vertically

        const newFlower: Flower = {
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
            // Start animation immediately instead of with delays
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

        // Start animation immediately instead of with delays
        requestAnimationFrame(animateFall);
      }
    }
  };

  // Function to handle aarti action
  const handleAarti = async () => {
    // Show modal immediately for better user experience
    setShowAartiModal(true);
    
    // Award mudras for doing aarti (moved after showing modal)
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('DO_AARTI');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('DO_AARTI');
        // Silent mudra awarding
      }
      // Silent error handling
    } catch (mudraError) {
      // Silent error handling
    }
  };

  // Function to fetch music files from media-files API
  const fetchMusicFiles = async () => {
    try {
      setMusicLoading(true);
      const url = getEndpointUrl('MEDIA_FILES');
      
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Filter for audio files based on Classification or Type
        const audioFiles = data.filter((file: any) => {
          // Check if it's an audio file based on Classification or Type
          const isAudio = file.Classification?.toLowerCase() === 'audio' || 
                         file.Type?.toLowerCase().includes('audio') ||
                         file.MediaType?.toLowerCase() === 'mp3';
          
          return isAudio;
        });
        
        setMusicFiles(audioFiles);
      } else {
        setMusicFiles([]);
      }
    } catch (error) {
      console.error('❌ [MUSIC] Error fetching music files:', error);
      setMusicFiles([]);
    } finally {
      setMusicLoading(false);
    }
  };

  // Function to play next song in playlist
  const playNextSong = async () => {
    if (!autoPlayEnabled || currentPlaylist.length === 0) return;
    
    // Clean up current sound state
    setSound(null);
    setCurrentlyPlaying(null);
    
    const nextIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
    setCurrentPlaylistIndex(nextIndex);
    
    const nextSong = currentPlaylist[nextIndex];
    if (nextSong) {
      await playMusicFile(nextSong);
    }
  };

  // Function to play a specific music file
  const playMusicFile = async (file: any) => {
    try {
      // Validate file object
      if (!file || !file.avld) {
        console.error('❌ [MUSIC] Invalid file object:', file);
        return;
      }

      setLoadingMusicId(file.avld);
      const metadata = extractMusicMetadata(file);
      
      // Stop any currently playing sound
      if (sound) {
        try {
          // Check if sound is loaded before attempting to stop it
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
            // Successfully stopped and unloaded current sound
          } else {
            // Sound was not loaded, skipping stop/unload
          }
        } catch (error) {
          console.error('❌ [MUSIC] Error stopping current sound:', error);
          // Try to unload anyway to clean up the state
          try {
            await sound.unloadAsync();
          } catch (unloadError) {
            console.error('❌ [MUSIC] Error unloading sound after stop failure:', unloadError);
          }
        }
      }

      // Use the Link field from the API response (contains S3 filename)
      if (!metadata.link) {
        console.error('❌ [MUSIC] No audio link available for file:', file.avld);
        console.error('❌ [MUSIC] File object:', file);
        console.error('❌ [MUSIC] Metadata:', metadata);
        setLoadingMusicId(null);
        return;
      }

      // Get presigned URL from backend API (same as audio-video screen)
      const apiUrl = getEndpointUrl('S3_AUDIO_URL');
      
      const response = await fetch(`${apiUrl}?filename=${encodeURIComponent(metadata.link)}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get presigned URL from API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.success || !responseData.presignedUrl) {
        throw new Error(`Invalid API response: ${JSON.stringify(responseData)}`);
      }
      
      const presignedUrl = responseData.presignedUrl;

      // Load and play the music using the presigned URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: presignedUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setCurrentlyPlaying(file.avld);
      setLoadingMusicId(null);

      // Set up auto-play next song when current ends (using proper completion detection)
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Song naturally finished, playing next...
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            playNextSong();
          }, 100);
        }
      });

    } catch (error) {
      console.error('❌ [MUSIC] Error playing music:', error);
      console.error('❌ [MUSIC] File that failed:', file);
      console.error('❌ [MUSIC] Error details:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : 'No stack trace');
      
      // Don't show alert for background music restart attempts
      if (!file.avld.includes('background')) {
        Alert.alert('Error', 'Failed to play music file');
      }
      
      setLoadingMusicId(null);
    }
  };

  // Function to extract music metadata from MediaFile
  const extractMusicMetadata = (file: any) => {
    return {
      title: file.VideoName || 'Untitled',
      category: file.Type || file.Classification || 'Music',
      duration: file.Duration || '--:--',
      deity: file.Deity || '',
      language: file.Language || '',
      artists: file.Artists || '',
      link: file.Link || ''
    };
  };

  // Function to stop current music
  const stopCurrentMusic = async () => {
    try {
      if (sound) {
        try {
          // Check if sound is loaded before attempting to stop it
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
                    // Successfully stopped and unloaded music
      } else {
        // Music was not loaded, skipping stop/unload
      }
        } catch (error) {
          console.error('❌ [MUSIC] Error stopping music:', error);
          // Try to unload anyway to clean up the state
          try {
            await sound.unloadAsync();
          } catch (unloadError) {
            console.error('❌ [MUSIC] Error unloading music after stop failure:', unloadError);
          }
        }
      }
      setSound(null);
      setCurrentlyPlaying(null);
      setCurrentPlaylist([]);
      setCurrentPlaylistIndex(0);
    } catch (error) {
      console.error('❌ [MUSIC] Error stopping music:', error);
    }
  };

  // Function to handle music action
  const handleMusic = async () => {
    setShowMusicModal(true);
    // Fetch music files when modal opens
    fetchMusicFiles();
  };



  // Dynamic style for temple scroll content positioning
  const templeScrollContentStyle = useMemo(() => ({
    ...styles.templeScrollContent,
            paddingTop: selectedStyle === 'temple1' ? 300 : selectedStyle === 'temple2' ? 225 : 475,
  }), [selectedStyle]);



  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  
  if (assetPreloading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <Image 
              source={require('@/assets/images/hindu heritage.png')}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <Text style={styles.loadingTitle}>Preparing Your Daily Puja</Text>
            <Text style={styles.loadingSubtitle}>Loading sacred elements for a divine experience</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${preloadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{preloadProgress}%</Text>
            </View>
            
            <View style={styles.loadingSteps}>
              <Text style={styles.loadingStepText}>
                {preloadProgress < 17 && '🌸 Loading sacred flowers...'}
                {preloadProgress >= 17 && preloadProgress < 33 && '🪔 Preparing arti thali...'}
                {preloadProgress >= 33 && preloadProgress < 50 && '🔔 Loading divine bells...'}
                {preloadProgress >= 50 && preloadProgress < 67 && '🐚 Preparing shankh...'}
                {preloadProgress >= 67 && preloadProgress < 83 && '🙏 Loading deities...'}
                {preloadProgress >= 83 && preloadProgress < 100 && '🏛️ Preparing temple...'}
                {preloadProgress === 100 && '🎉 Ready for divine puja!'}
              </Text>
            </View>
            
            {/* Debug button to force transition */}
            {preloadProgress === 100 && (
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔧 [DEBUG] Manual force transition');
                  setAssetPreloading(false);
                }}
              >
                <Text style={styles.debugButtonText}>Continue to Puja</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Force stop all sounds (emergency function)
  const forceStopAllSounds = async () => {
    try {
      console.log('🔔 [EMERGENCY] Force stopping all sounds...');
      
      if (ghantiSound) {
        try {
          const status = await ghantiSound.getStatusAsync();
          if (status.isLoaded) {
            await ghantiSound.stopAsync();
            await ghantiSound.unloadAsync();
            console.log('🔔 [EMERGENCY] Stopped ghanti sound');
          }
        } catch (error) {
          console.error('🔔 [EMERGENCY] Error stopping ghanti sound:', error);
        }
      }
      
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
            console.log('🔔 [EMERGENCY] Stopped music sound');
          }
        } catch (error) {
          console.error('🔔 [EMERGENCY] Error stopping music sound:', error);
        }
      }
      
      setGhantiSound(null);
      setIsPlayingGhanti(false);
      setCurrentlyPlaying(null);
      setSound(null);
      setWelcomeBellPlayed(false); // Reset welcome bell flag
      
      console.log('🔔 [EMERGENCY] All sounds stopped');
    } catch (error) {
      console.error('🔔 [EMERGENCY] Error in force stop:', error);
    }
  };

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
      {!showS3Gallery && (
        <ScrollView 
          style={styles.templeScrollView}
          contentContainerStyle={templeScrollContentStyle}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Temple image chosen by user */}
          <Image
            source={templeStyles.find(t => t.id === selectedStyle)?.image}
            style={[
              styles.templeImage,
              {
                width: selectedStyle === 'temple3' ? screenWidth * 0.9 : screenWidth * 1.38,
              }
            ]}
            resizeMode="contain"
          />
        </ScrollView>
      )}
      
      {/* Bells: left and right */}
      {!showS3Gallery && (
        <>
          <SwingableBell position="left" swingValue={leftBellSwing} />
          <SwingableBell position="right" swingValue={rightBellSwing} />
        </>
      )}
             {/* Arch on top */}
       <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
       

       
               {/* Flowers dropped in front of temple */}
         {flowers.map((flower) => (
           <View
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
             ) : flower.type === 'whiteRose' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/whiterose.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'jasmine' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/jasmine.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'yellowShevanthi' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/YellowShevanthi.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'whiteShevanthi' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'redShevanthi' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/RedShevanthi.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'rajnigandha' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/rajnigandha.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'parajita' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/parajita.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'datura' ? (
               <Image 
                 source={require('@/assets/images/icons/own temple/Datura.png')}
                 style={styles.flowerImage}
                 resizeMode="contain"
               />
             ) : flower.type === 'rose' ? (
               <Text style={styles.flowerEmoji}>🌹</Text>
             ) : flower.type === 'jasmine' ? (
               <Text style={styles.flowerEmoji}>🌸</Text>
             ) : flower.type === 'lotus' ? (
               <Text style={styles.flowerEmoji}>🪷</Text>
             ) : flower.type === 'marigold' ? (
               <Text style={styles.flowerEmoji}>🌼</Text>
             ) : flower.type === 'tulsi' ? (
               <Text style={styles.flowerEmoji}>🌿</Text>
             ) : (
               <Text style={styles.flowerEmoji}>{getFlowerEmoji(flower.type)}</Text>
             )}
           </View>
         ))}
         
         {/* Real Puja Thali Modal for ritual animation */}
         <Modal
           visible={isPujaRitualActive}
           transparent={true}
           animationType="fade"
           onRequestClose={() => setIsPujaRitualActive(false)}
           statusBarTranslucent={true}
         >
           <View style={styles.aartiModalOverlay}>
             <TouchableOpacity 
               style={styles.aartiModalOverlayTouchable}
               activeOpacity={1}
               onPress={() => setIsPujaRitualActive(false)}
             >
               {(() => {
                 const ellipseWidth = screenWidth * 0.7; // 70% of screen width
                 const ellipseHeight = ellipseWidth * 0.6; // Maintain aspect ratio
                 

                 
                 return (
                   <Animated.View
                                              style={[
                           styles.pujaThali,
                           {
                             position: 'absolute',
                             left: (screenWidth - 200) / 2, // Center horizontally (200px width like aarti)
                             top: (screenHeight - 200) / 2 + 100, // Center vertically + 100px lower
                             width: 200, // Same size as aarti thali
                             height: 200,
                         transform: [
                           {
                             translateX: thaliEllipseAnimation.interpolate({
                               inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5],
                               outputRange: [
                                 0, // Start at 6 o'clock (bottom)
                                 -ellipseWidth / 2, // Quarter at 3 o'clock (right)
                                 0, // Half at 12 o'clock (top)
                                 ellipseWidth / 2, // 3 quarters at 9 o'clock (left)
                                 0, // Complete first orbit at 6 o'clock (bottom)
                                 -ellipseWidth / 2, // Start second orbit - 3 o'clock (right)
                                 0, // Second orbit - 12 o'clock (top)
                                 ellipseWidth / 2, // Second orbit - 9 o'clock (left)
                                 0, // Second orbit complete - 6 o'clock (bottom)
                                 -ellipseWidth / 2, // Third orbit - 3 o'clock (right)
                                 0, // Third orbit - 12 o'clock (top)
                                 ellipseWidth / 2, // Third orbit - 9 o'clock (left)
                                 0, // Third orbit complete - 6 o'clock (bottom)
                                 -ellipseWidth / 2, // Fourth orbit - 3 o'clock (right)
                                 0, // Fourth orbit - 12 o'clock (top)
                                 ellipseWidth / 2, // Fourth orbit - 9 o'clock (left)
                                 0, // Fourth orbit complete - 6 o'clock (bottom)
                                 -ellipseWidth / 2, // Fifth orbit - 3 o'clock (right)
                                 0, // Fifth orbit - 12 o'clock (top)
                                 ellipseWidth / 2, // Fifth orbit - 9 o'clock (left)
                                 0, // Fifth orbit complete - 6 o'clock (bottom)
                               ],
                             }),
                           },
                           {
                             translateY: thaliEllipseAnimation.interpolate({
                               inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5],
                               outputRange: [
                                 ellipseHeight / 2, // Start at 6 o'clock (bottom)
                                 0, // Quarter at 9 o'clock (center)
                                 -ellipseHeight / 2, // Half at 12 o'clock (top)
                                 0, // 3 quarters at 3 o'clock (center)
                                 ellipseHeight / 2, // Complete first orbit at 6 o'clock (bottom)
                                 0, // Start second orbit - 9 o'clock (center)
                                 -ellipseHeight / 2, // Second orbit - 12 o'clock (top)
                                 0, // Second orbit - 3 o'clock (center)
                                 ellipseHeight / 2, // Second orbit complete - 6 o'clock (bottom)
                                 0, // Third orbit - 9 o'clock (center)
                                 -ellipseHeight / 2, // Third orbit - 12 o'clock (top)
                                 0, // Third orbit - 3 o'clock (center)
                                 ellipseHeight / 2, // Third orbit complete - 6 o'clock (bottom)
                                 0, // Fourth orbit - 9 o'clock (center)
                                 -ellipseHeight / 2, // Fourth orbit - 12 o'clock (top)
                                 0, // Fourth orbit - 3 o'clock (center)
                                 ellipseHeight / 2, // Fourth orbit complete - 6 o'clock (bottom)
                                 0, // Fifth orbit - 9 o'clock (center)
                                 -ellipseHeight / 2, // Fifth orbit - 12 o'clock (top)
                                 0, // Fifth orbit - 3 o'clock (center)
                                 ellipseHeight / 2, // Fifth orbit complete - 6 o'clock (bottom)
                               ],
                             }),
                           },
                         ],
                       },
                     ]}
                   >
                     <Image
                       source={require('@/assets/images/icons/own temple/PujaThali1.png')}
                       style={{ width: '100%', height: '100%' }} // Use full container size
                       resizeMode="contain"
                     />
                   </Animated.View>
                 );
               })()}
             </TouchableOpacity>
           </View>
         </Modal>
         
         {/* Duplicate thali section removed - using modal version above */}
         
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
        
        {/* Left Puja Icons Column - Flowers, Aarti - Always Visible */}
          <View style={styles.leftPujaIconsColumn}>
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
            {isFlowerAnimationRunning ? (
              <View style={styles.pujaIconContainer}>
                <ActivityIndicator size="small" color="#FF6A00" />
              </View>
            ) : (
              <Text style={[
                styles.pujaIcon,
                isFlowerAnimationRunning && styles.pujaIconDisabled
              ]}>🌸</Text>
            )}
            <Text style={[
              styles.pujaIconLabel,
              isFlowerAnimationRunning && styles.pujaIconLabelDisabled
            ]}>
              {isFlowerAnimationRunning ? 'Dropping...' : 'Flowers'}
            </Text>
            {isFlowerAnimationRunning && (
              <View style={styles.flowerProgressBar}>
                <View style={styles.flowerProgressFill} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.pujaIconItem}
            onPress={handleAarti}
            activeOpacity={0.7}
          >
            <Text style={styles.pujaIcon}>🕉️</Text>
            <Text style={styles.pujaIconLabel}>Aarti</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.pujaIconItem}
            onPress={handleMusic}
            activeOpacity={0.7}
          >
            <Text style={styles.pujaIcon}>🎵</Text>
            <Text style={styles.pujaIconLabel}>Music</Text>
          </TouchableOpacity>

        </View>

        {/* Right Puja Icons Column - Shankh, Ghanti - Always Visible */}
          <View style={styles.rightPujaIconsColumn}>
            <TouchableOpacity style={styles.pujaIconItem} onPress={playConchSound}>
              <Image 
                source={require('@/assets/images/icons/own temple/sankha.png')}
                style={styles.pujaIconImage}
                resizeMode="contain"
              />
              <Text style={styles.pujaIconLabel}>Shankh</Text>
            </TouchableOpacity>
          <TouchableOpacity style={styles.pujaIconItem} onPress={swingBothBells}>
            <Text style={styles.pujaIcon}>🔔</Text>
            <Text style={styles.pujaIconLabel}>Ghanti</Text>
          </TouchableOpacity>
          </View>



        {/* Perform Puja Button - Above Navigation Buttons */}
        <View style={styles.performPujaButtonContainer}>
            <TouchableOpacity 
              style={[
                styles.performPujaButton,
                isPujaRitualActive && { opacity: 0.6 }
              ]}
              onPress={performPujaRitual}
              activeOpacity={0.7}
              disabled={isPujaRitualActive}
            >
              <Text style={styles.performPujaButtonText}>
                {isPujaRitualActive ? 'Performing Puja...' : 'Perform Puja'}
              </Text>
            </TouchableOpacity>
            

          </View>

        {/* Navigation Buttons - Always Visible */}
        <View style={styles.mainNavigationButtonsContainer}>
                       <TouchableOpacity 
               style={[
                 styles.mainNavigationButton,
                 !showS3Gallery && styles.mainNavigationButtonActive,
                 !hasTempleConfigured && styles.createTempleButton
               ]}
               onPress={() => {
                 if (hasTempleConfigured) {
                   setShowS3Gallery(false); // Close S3 gallery if open
                   setIsTodaySpecialMode(false); // Reset Today's Special mode
                   // Add your navigation logic here for temple deities
                 } else {
                   // Navigate to create temple page if no temple configured
                   router.push('/screens/create-temple');
                 }
               }}
               activeOpacity={0.7}
             >
               <Text style={[
                 styles.mainNavigationButtonText,
                 !showS3Gallery && styles.mainNavigationButtonTextActive,
                 !hasTempleConfigured && { color: 'white', fontWeight: '700' }
               ]} numberOfLines={2}>
                 {hasTempleConfigured ? 'My Temple' : 'Create\nmy temple'}
               </Text>
             </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.mainNavigationButton,
              showS3Gallery && isTodaySpecialMode && styles.mainNavigationButtonActive
            ]}
            onPress={() => {
              if (!showS3Gallery) {
                // First time opening - set highlighting immediately and fetch today's special pujas
                setShowS3Gallery(true);
                setIsTodaySpecialMode(true);
                fetchTodaySpecialPujas();
              } else if (showS3Gallery && !isTodaySpecialMode) {
                // Already in gallery but showing all temples - switch highlighting immediately and fetch today's special
                setIsTodaySpecialMode(true);
                fetchTodaySpecialPujas();
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.mainNavigationButtonText,
              showS3Gallery && isTodaySpecialMode && styles.mainNavigationButtonTextActive
            ]} numberOfLines={1}>Today's Special</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.mainNavigationButton,
              showS3Gallery && !isTodaySpecialMode && styles.mainNavigationButtonActive
            ]}
            onPress={() => {
              if (!showS3Gallery) {
                // First time opening - set highlighting immediately and show all temples
                setShowS3Gallery(true);
                setIsTodaySpecialMode(false);
                handleNextToS3Gallery();
              } else if (showS3Gallery && isTodaySpecialMode) {
                // Already in gallery but showing today's special - switch highlighting immediately and show all temples
                setIsTodaySpecialMode(false);
                handleNextToS3Gallery();
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.mainNavigationButtonText,
              showS3Gallery && !isTodaySpecialMode && styles.mainNavigationButtonTextActive
            ]} numberOfLines={1}>All Temples</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* S3 Image Gallery - Overlay when active */}
      {showS3Gallery && (
        <View style={styles.s3GalleryOverlay}>
          {/* Purple Gradient Background (same as main screen) */}
          <LinearGradient
            colors={bgGradient as any}
            style={styles.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Arch on top (same as main screen) */}
          <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
          
          {/* Bells: left and right (same as main screen) */}
          <SwingableBell position="left" swingValue={leftBellSwing} />
          <SwingableBell position="right" swingValue={rightBellSwing} />
          

          


          {/* Header - Show Deity Name when in All Temples mode */}
          {!isTodaySpecialMode && (
            <View style={styles.deityNameHeader}>
              <Text style={styles.deityNameText}>
                {getDeityNameFromFolder(s3Folders[currentS3FolderIndex]?.prefix)}
              </Text>
            </View>
          )}

          {/* Folder Navigation Icons - Horizontal Scroll */}
          <View style={styles.folderNavigationContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.folderNavigationContent}
            >
              {s3Folders.map((folder, index) => {
                const isActive = index === currentS3FolderIndex;
                const iconImage = folder.iconImage;
                
                return (
                  <TouchableOpacity
                    key={folder.prefix}
                    style={[
                      styles.folderIconItem,
                      isActive && styles.folderIconItemActive
                    ]}
                    onPress={() => {
                      setCurrentS3FolderIndex(index);
                      setCurrentS3ImageIndex(0);
                    }}
                    activeOpacity={0.7}
                  >
                    {iconImage ? (
                      <Image
                        source={iconImage.url ? { uri: iconImage.url } : require('@/assets/images/icons/own temple/sankha.png')}
                        style={[
                          styles.folderIconImage,
                          isActive && styles.folderIconImageActive
                        ]}
                        resizeMode="cover"
                        onError={() => {}}
                        onLoadStart={() => {
                          // Fetch presigned URL for folder icon if not already loaded
                          if (!iconImage.url) {
                            fetchPresignedUrl(iconImage.key).then(url => {
                              if (url) {
                                // Update the icon image URL in the folder
                                setS3Folders(prev => prev.map((f, i) => 
                                  i === index ? {
                                    ...f,
                                    iconImage: f.iconImage ? { ...f.iconImage, url } : null
                                  } : f
                                ));
                              }
                            });
                          }
                        }}
                      />
                    ) : (
                      <View style={[styles.folderIconPlaceholder, isActive && styles.folderIconPlaceholderActive]}>
                        <Text style={styles.folderIconPlaceholderText}>?</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>



          {/* Main Image with Swipe Gestures */}
          <View style={styles.s3ImageContainer}>
            {currentS3ImageUrl ? (
              <>
                <View
                  style={styles.swipeableImageContainer}
                  {...panResponder.panHandlers}
                >
              <Image
                source={{ uri: currentS3ImageUrl }}
                style={styles.s3MainImage}
                resizeMode="contain"
                onError={() => Alert.alert('Error', 'Failed to load image')}
              />
                  

                </View>
                
                {/* God Name Display - Right below the image */}
                {s3Folders[currentS3FolderIndex]?.godName && (
                  <View style={styles.godNameContainer}>
                    <Text style={styles.godNameText}>
                      {s3Folders[currentS3FolderIndex].godName}
                    </Text>
                  </View>
                )}
                
                {/* Swipe Status Message */}
                {s3Folders.length === 0 && (
                  <View style={styles.swipeStatusContainer}>
                    <Text style={styles.swipeStatusText}>
                      Loading images... Swipe will be available soon
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.s3ImagePlaceholder}>
                <ActivityIndicator size="large" color="#FF6A00" />
                <Text style={styles.s3ImagePlaceholderText}>Loading...</Text>
              </View>
            )}
          </View>



          <View style={styles.s3ImageNavigationContainer}>
            <TouchableOpacity 
              style={[styles.s3NavButton, styles.s3NavButtonLeft]} 
              onPress={() => {
                navigateToPreviousS3Image();
              }}
              disabled={false}
            >
              <Text style={styles.s3NavButtonText}>
                ▲
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.s3NavButton, styles.s3NavButtonRight]} 
              onPress={() => {
                navigateToNextS3Image();
              }}
              disabled={currentS3ImageIndex === s3Folders[currentS3FolderIndex]?.images.length - 1 && currentS3FolderIndex === s3Folders.length - 1}
            >
              <Text style={[styles.s3NavButtonText, currentS3ImageIndex === s3Folders[currentS3FolderIndex]?.images.length - 1 && currentS3FolderIndex === s3Folders.length - 1 && styles.s3NavButtonTextDisabled]}>
                ▼
              </Text>
            </TouchableOpacity>
          </View>



          {/* Puja Icons - Left Column */}
          <View style={styles.s3LeftPujaIconsColumn}>
            <TouchableOpacity 
              style={styles.pujaIconItem} 
              onPress={() => setShowFlowerModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.pujaIcon}>🌸</Text>
              <Text style={styles.pujaIconLabel}>Flowers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pujaIconItem}
              onPress={handleAarti}
              activeOpacity={0.7}
            >
              <Text style={styles.pujaIcon}>🕉️</Text>
              <Text style={styles.pujaIconLabel}>Aarti</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pujaIconItem}
              onPress={handleMusic}
              activeOpacity={0.7}
            >
              <Text style={styles.pujaIcon}>🎵</Text>
              <Text style={styles.pujaIconLabel}>Music</Text>
            </TouchableOpacity>

          </View>

          {/* Puja Icons - Right Column */}
          <View style={styles.s3RightPujaIconsColumn}>
            <TouchableOpacity style={styles.pujaIconItem} onPress={playConchSound}>
              <Image 
                source={require('@/assets/images/icons/own temple/sankha.png')}
                style={styles.pujaIconImage}
                resizeMode="contain"
              />
              <Text style={styles.pujaIconLabel}>Shankh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pujaIconItem} onPress={swingBothBells}>
              <Text style={styles.pujaIcon}>🔔</Text>
              <Text style={styles.pujaIconLabel}>Ghanti</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
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
                        <View style={styles.flowerModalContent}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.flowerOptions}
                >
                 <TouchableOpacity 
                   style={styles.flowerOption} 
                   onPress={() => dropFlowers('hibiscus')}
                 >
                   <View style={styles.flowerIconContainer}>
                     <Text style={styles.flowerOptionEmoji}>🌺</Text>
                   </View>
                   <Text style={styles.flowerOptionLabel}>Hibiscus</Text>
                 </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('redRose')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/rose.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('whiteRose')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/whiterose.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Rose</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('sunflower')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🌻</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Sunflower</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('marigold')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🌼</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Marigold</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('belPatra')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🍃</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Bel Patra</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('jasmine')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/jasmine.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Jasmine</Text>
                </TouchableOpacity>
                
                {/* Yellow Shevanthi */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('yellowShevanthi')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/YellowShevanthi.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Yellow Shevanthi</Text>
                </TouchableOpacity>
                
                {/* White Shevanthi */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('whiteShevanthi')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/WhiteShevanthi.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>White Shevanthi</Text>
                </TouchableOpacity>
                
                {/* Red Shevanthi */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('redShevanthi')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/RedShevanthi.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Red Shevanthi</Text>
                </TouchableOpacity>
                
                {/* Tulsi */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('tulsi')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/tulsi.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Tulsi</Text>
                </TouchableOpacity>
                
                {/* Rajnigandha */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('rajnigandha')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/rajnigandha.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Rajnigandha</Text>
                </TouchableOpacity>
                
                {/* Parajita */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('parajita')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/parajita.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Parajita</Text>
                </TouchableOpacity>
                
                {/* Datura */}
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('datura')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Image 
                      source={require('@/assets/images/icons/own temple/Datura.png')}
                      style={styles.flowerOptionImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.flowerOptionLabel}>Datura</Text>
                </TouchableOpacity>
                                 <TouchableOpacity 
                   style={styles.flowerOption} 
                   onPress={() => dropMixFlowers()}
                 >
                   <View style={styles.flowerIconContainer}>
                     <Text style={styles.flowerOptionEmoji}>🌸</Text>
                   </View>
                   <Text style={styles.flowerOptionLabel}>Mix Flowers</Text>
                 </TouchableOpacity>
               </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Music Modal */}
      <Modal
        visible={showMusicModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowMusicModal(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowMusicModal(false)}
          >
            <View style={styles.musicModalContent}>
              {/* Header */}
              <View style={styles.musicModalHeader}>
                <Text style={styles.musicModalTitle}>🎵 Divine Music</Text>
                <View style={styles.musicModalHeaderButtons}>
                  <TouchableOpacity 
                    style={styles.musicModalCloseButton}
                    onPress={() => {
                      setShowMusicModal(false);
                    }}
                  >
                    <Text style={styles.musicModalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.musicSearchContainer}>
                <TextInput
                  style={styles.musicSearchInput}
                  placeholder="Search for bhajans, aartis, mantras..."
                  placeholderTextColor="#999"
                  value={musicSearchQuery}
                  onChangeText={setMusicSearchQuery}
                />
                <MaterialCommunityIcons 
                  name="magnify" 
                  size={20} 
                  color="#666" 
                  style={styles.musicSearchIcon}
                />
              </View>

              {/* Filter Buttons */}
              <View style={styles.musicFilterContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.musicFilterContent}
                >
                  {['All', 'Aarti', 'Bhajan', 'Chalisa', 'Katha', 'Paath / Strotam', 'Famous'].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.musicFilterButton,
                        selectedMusicFilter === filter && styles.musicFilterButtonActive
                      ]}
                      onPress={() => setSelectedMusicFilter(filter)}
                    >
                      <Text style={[
                        styles.musicFilterText,
                        selectedMusicFilter === filter && styles.musicFilterButtonActive
                      ]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Stop Music Button */}
                <TouchableOpacity 
                  style={[
                    styles.stopMusicButton,
                    currentlyPlaying ? styles.stopMusicButtonActive : styles.stopMusicButtonDisabled
                  ]}
                  onPress={stopCurrentMusic}
                  disabled={!currentlyPlaying}
                >
                  <Text style={[
                    styles.stopMusicButtonText,
                    currentlyPlaying ? styles.stopMusicButtonTextActive : styles.stopMusicButtonTextDisabled
                  ]}>⏹️ Stop Music</Text>
                </TouchableOpacity>
              </View>

              {/* Music List */}
              <ScrollView 
                style={styles.musicListContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {musicLoading ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6A00" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
                      Loading music library...
                    </Text>
                  </View>
                ) : musicFiles.length === 0 ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="music-off" size={48} color="#ccc" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
                      No music files found in S3
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' }}>
                      Please upload music files to the 'music/' folder in S3
                    </Text>
                  </View>
                ) : (
                  // Filter music files based on search and category
                  musicFiles
                    .filter(file => {
                      if (!file) return false;
                      
                      // Apply search filter
                      if (musicSearchQuery.trim()) {
                        const searchLower = musicSearchQuery.toLowerCase();
                        const title = file.VideoName?.toLowerCase() || '';
                        const deity = file.Deity?.toLowerCase() || '';
                        const artists = file.Artists?.toLowerCase() || '';
                        return title.includes(searchLower) || deity.includes(searchLower) || artists.includes(searchLower);
                      }
                      
                      // Apply category filter
                      if (selectedMusicFilter !== 'All') {
                        if (selectedMusicFilter === 'Famous') {
                          return file.famous === true;
                        }
                        return file.Type === selectedMusicFilter;
                      }
                      
                      return true;
                    })
                    .map((file, index) => {
                      const metadata = extractMusicMetadata(file);
                      
                      return (
                        <TouchableOpacity key={file.avld || index} style={styles.musicItem}>
                          <View style={styles.musicItemContent}>
                            <Text style={styles.musicItemTitle}>{metadata.title}</Text>
                            <Text style={styles.musicItemSubtitle}>
                              {metadata.deity ? `${metadata.deity} • ${metadata.category}` : metadata.category}
                            </Text>
                            <Text style={styles.musicItemDuration}>
                              {metadata.duration} {metadata.language ? `• ${metadata.language}` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.musicPlayButton}
                            onPress={async () => {
                              // If this music is already playing, stop it
                              if (currentlyPlaying === file.avld) {
                                await stopCurrentMusic();
                                return;
                              }

                                                              // Otherwise, play this music
                                // Set up playlist for auto-play functionality
                                const filteredFiles = musicFiles.filter(file => {
                                  if (!file) return false;
                                  
                                  // Apply search filter
                                  if (musicSearchQuery.trim()) {
                                    const searchLower = musicSearchQuery.trim().toLowerCase();
                                    const title = file.VideoName?.toLowerCase() || '';
                                    const deity = file.Deity?.toLowerCase() || '';
                                    const artists = file.Artists?.toLowerCase() || '';
                                    return title.includes(searchLower) || deity.includes(searchLower) || artists.includes(searchLower);
                                  }
                                  
                                  // Apply category filter
                                  if (selectedMusicFilter !== 'All') {
                                    if (selectedMusicFilter === 'Famous') {
                                      return file.famous === true;
                                    }
                                    return file.Type === selectedMusicFilter;
                                  }
                                  
                                  return true;
                                });
                                
                                setCurrentPlaylist(filteredFiles);
                                setCurrentPlaylistIndex(filteredFiles.findIndex(f => f.avld === file.avld));
                                
                                // Play the selected music file
                                await playMusicFile(file);
                            }}
                          >
                            {loadingMusicId === file.avld ? (
                              <ActivityIndicator size="small" color="#FF6A00" />
                            ) : (
                              <MaterialCommunityIcons 
                                name={currentlyPlaying === file.avld ? "pause-circle" : "play-circle"} 
                                size={32} 
                                color="#FF6A00" 
                              />
                            )}
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Mini Music Player - Shows when music is playing */}


       
       {/* Aarti Modal */}
       <Modal
         visible={showAartiModal}
         transparent={true}
         animationType="none"
         onRequestClose={() => {
           setShowAartiModal(false);
         }}
         statusBarTranslucent={true}
       >
         <View style={styles.aartiModalOverlay}>
           <TouchableOpacity 
             style={styles.aartiModalOverlayTouchable}
             activeOpacity={1}
             onPress={() => setShowAartiModal(false)}
           >
             {!thaliImageLoaded && (
               <View style={styles.thaliLoadingContainer}>
                 <ActivityIndicator size="large" color="#FF6A00" />
                 <Text style={styles.thaliLoadingText}>Loading Aarti Thali...</Text>
               </View>
             )}
             <DraggableThali onImageLoad={() => setThaliImageLoaded(true)} />
           </TouchableOpacity>
         </View>
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
     top: 195,
     left: 40,
     width: 62.4,
     height: 117,
     zIndex: 1100,
   },
   bellRight: {
     position: 'absolute',
     top: 195,
     right: 40,
     width: 62.4,
     height: 117,
     zIndex: 1100,
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
   

   // Deity Name Header Styles (for All Temples mode)
   deityNameHeader: {
     position: 'absolute',
     top: 30, // 30px from top as requested
     left: 20,
     right: 20,
     zIndex: 1000,
     backgroundColor: 'transparent',
     borderRadius: 15,
     padding: 15,
     alignItems: 'center',
   },
   deityNameText: {
     color: '#fff',
     fontSize: 14, // 14px text size as requested
     fontWeight: 'bold',
     textAlign: 'center',
     textShadowColor: 'rgba(0, 0, 0, 0.8)',
     textShadowOffset: { width: 1, height: 1 },
     textShadowRadius: 2,
   },
         deityLabel: {
       color: '#fff',
       fontSize: 12,
       fontWeight: 'bold',
       textAlign: 'center',
     },
     leftPujaIconsColumn: {
      position: 'absolute',
      left: 0, // Align with left edge of screen
      top: 300, // Moved down 50 pixels from 250 to 300
      width: 60, // Reduced width to align icons with edge
      zIndex: 10, // Above temple but below bells and arch
      backgroundColor: 'transparent', // Transparent background
      borderRightWidth: 0, // Remove border
      paddingVertical: 20,
      paddingHorizontal: 0, // No horizontal padding to align with edge
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
     rightPujaIconsColumn: {
      position: 'absolute',
      right: 0, // Align with right edge of screen
      top: 300, // Moved down 50 pixels from 250 to 300
      width: 60, // Same width as left column
      zIndex: 10, // Above temple but below bells and arch
      backgroundColor: 'transparent', // Transparent background
      borderLeftWidth: 0, // Remove border
      paddingVertical: 20,
      paddingHorizontal: 0, // No horizontal padding to align with edge
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
     pujaIconsContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      gap: 10, // Reduced spacing between icons
    },
     pujaIconItem: {
       alignItems: 'center',
       justifyContent: 'center',
       padding: 8,
       borderRadius: 0, // Remove border radius from item container
       marginVertical: 3, // Reduced from 8 to 3 (5px less)
       marginHorizontal: 0,
       width: '100%',
       minHeight: 50,
       backgroundColor: 'transparent', // Remove background from item container
     },
     pujaIconContainer: {
       alignItems: 'center',
       justifyContent: 'center',
       width: 52, // Keep the size for consistent spacing
       height: 52, // Keep the size for consistent spacing
       borderRadius: 0, // Remove border radius
       backgroundColor: 'transparent', // Remove background
     },
     pujaIcon: {
       fontSize: 28,
       marginBottom: 6,
     },
     pujaIconBackground: {
       alignItems: 'center',
       justifyContent: 'center',
       width: 52, // Keep the size for consistent spacing
       height: 52, // Keep the size for consistent spacing
       borderRadius: 0, // Remove border radius
       backgroundColor: 'transparent', // Remove background
       marginBottom: 6,
     },
                       pujaIconLabel: {
         color: '#FFE5B4',
         fontSize: 12, // Smaller font size
         fontWeight: 'bold',
         textAlign: 'center',
         textShadowColor: 'rgba(0, 0, 0, 0.8)',
         textShadowOffset: { width: 1, height: 1 },
         textShadowRadius: 2,
       },
               flower: {
          position: 'absolute',
          zIndex: 9997, // Very high zIndex, just below thali to ensure visibility
          backgroundColor: 'rgba(255, 255, 255, 0)', // White background, 100% transparent
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
          transform: [{ scale: 0.95 }],
          shadowColor: '#FF6A00',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        },
        pujaIconDisabled: {
          opacity: 0.5,
        },
        pujaIconLabelDisabled: {
          opacity: 0.5,
          fontStyle: 'italic',
        },
        pujaIconImage: {
          width: 50, // Set to exactly 50x50 pixels
          height: 50, // Set to exactly 50x50 pixels
          marginBottom: 6,
        },
                                                                               modalOverlay: {
               flex: 1,
               backgroundColor: 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               zIndex: 2000,
             },
             modalOverlayTouchable: {
               flex: 1,
               width: '100%',
               justifyContent: 'center',
               alignItems: 'center',
             },
             modalContent: {
               backgroundColor: 'transparent',
               borderRadius: 0,
               padding: 0,
               margin: 0,
               alignItems: 'center',
               justifyContent: 'center',
               width: '100%',
               height: '100%',
               zIndex: 1001,
               elevation: 10,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: -2 },
               shadowOpacity: 0.25,
               shadowRadius: 4,
             },
             flowerModalContent: {
               backgroundColor: '#ffffff',
               borderRadius: 16,
               padding: 24,
               marginTop: 420, // Moved up by 50 pixels from 470
               marginHorizontal: 20,
               alignItems: 'center',
               justifyContent: 'center',
               width: '90%',
               height: 110,
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
           alignItems: 'center',
           paddingHorizontal: 20,
           paddingVertical: 15,
         },
         flowerOption: {
           alignItems: 'center',
           marginRight: 8,
           minWidth: 70,
         },
         flowerIconContainer: {
           alignItems: 'center',
           justifyContent: 'center',
           width: 40,
           height: 40,
           borderRadius: 8,
           backgroundColor: '#f8f9fa',
           marginBottom: 5,
         },
         flowerOptionEmoji: {
           fontSize: 28,
           marginBottom: 5,
         },
         flowerOptionLabel: {
           fontSize: 12,
           fontWeight: 'bold',
           color: '#333',
           textAlign: 'center',
         },
         flowerOptionImage: {
           width: 28,
           height: 28,
           marginBottom: 5,
         },
         
         // Music Modal Styles
         musicModalContent: {
           backgroundColor: '#ffffff',
           borderRadius: 20,
           padding: 24,
           marginHorizontal: 20,
           width: '90%',
           height: '80%',
           zIndex: 1001,
           elevation: 10,
           shadowColor: '#000',
           shadowOffset: { width: 0, height: -2 },
           shadowOpacity: 0.25,
           shadowRadius: 4,
         },
         musicModalHeader: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           marginBottom: 20,
         },
         musicModalHeaderButtons: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 12,
         },
         musicModalAutoPlayButton: {
           width: 32,
           height: 32,
           borderRadius: 16,
           backgroundColor: '#f0f0f0',
           justifyContent: 'center',
           alignItems: 'center',
         },
         musicModalRefreshButton: {
           width: 32,
           height: 32,
           borderRadius: 16,
           backgroundColor: '#f0f0f0',
           justifyContent: 'center',
           alignItems: 'center',
         },
         musicModalTitle: {
           fontSize: 24,
           fontWeight: 'bold',
           color: '#FF6A00',
         },
         musicModalCloseButton: {
           width: 32,
           height: 32,
           borderRadius: 16,
           backgroundColor: '#f0f0f0',
           justifyContent: 'center',
           alignItems: 'center',
         },
         musicModalCloseText: {
           fontSize: 18,
           color: '#666',
           fontWeight: 'bold',
         },
         musicSearchContainer: {
           position: 'relative',
           marginBottom: 20,
         },
         musicSearchInput: {
           backgroundColor: '#f8f9fa',
           borderRadius: 12,
           paddingHorizontal: 16,
           paddingVertical: 12,
           fontSize: 16,
           color: '#333',
           paddingRight: 50,
         },
         musicSearchIcon: {
           position: 'absolute',
           right: 16,
           top: 12,
         },
         musicFilterContainer: {
           marginBottom: 20,
         },
         musicFilterContent: {
           paddingHorizontal: 20,
         },
         musicFilterButton: {
           backgroundColor: '#f5f5f5',
           paddingHorizontal: 16,
           paddingVertical: 8,
           borderRadius: 20,
           marginHorizontal: 6,
           borderWidth: 1,
           borderColor: '#e0e0e0',
         },
         musicFilterText: {
           fontSize: 12,
           color: '#666',
           fontWeight: '500',
         },
         musicFilterButtonActive: {
           backgroundColor: '#FF6A00',
           borderColor: '#FF6A00',
         },
         musicFilterTextActive: {
           color: '#fff',
           fontWeight: '600',
         },
         stopMusicButton: {
           marginTop: 10,
           paddingHorizontal: 20,
           paddingVertical: 10,
           borderRadius: 8,
           borderWidth: 2,
           alignItems: 'center',
           justifyContent: 'center',
           minWidth: 120,
           alignSelf: 'center',
         },
         stopMusicButtonActive: {
           backgroundColor: '#FF6A00',
           borderColor: '#FF6A00',
         },
         stopMusicButtonDisabled: {
           backgroundColor: '#f0f0f0',
           borderColor: '#ddd',
         },
         stopMusicButtonText: {
           fontSize: 14,
           fontWeight: '600',
         },
         stopMusicButtonTextActive: {
           color: 'white',
         },
         stopMusicButtonTextDisabled: {
           color: '#999',
         },
         musicListContainer: {
           flex: 1,
           minHeight: 300,
         },
         musicItem: {
           flexDirection: 'row',
           alignItems: 'center',
           paddingVertical: 16,
           paddingHorizontal: 20,
           borderBottomWidth: 1,
           borderBottomColor: '#f0f0f0',
         },
         musicItemContent: {
           flex: 1,
         },
         musicItemTitle: {
           fontSize: 16,
           fontWeight: 'bold',
           color: '#333',
           marginBottom: 4,
         },
         musicItemSubtitle: {
           fontSize: 14,
           color: '#666',
           marginBottom: 2,
         },
         musicItemDuration: {
           fontSize: 12,
           color: '#999',
         },
         musicPlayButton: {
           padding: 8,
         },
         
         // Mini Music Player Styles
         miniMusicPlayer: {
           position: 'absolute',
           bottom: 0,
           left: 0,
           right: 0,
           backgroundColor: '#fff',
           borderTopWidth: 1,
           borderTopColor: '#e0e0e0',
           zIndex: 1000,
           elevation: 10,
         },
         miniMusicPlayerContent: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           paddingHorizontal: 20,
           paddingVertical: 12,
         },
         miniMusicPlayerInfo: {
           flexDirection: 'row',
           alignItems: 'center',
           flex: 1,
         },
         miniMusicPlayerTitle: {
           fontSize: 14,
           fontWeight: '500',
           color: '#333',
           marginLeft: 8,
           flex: 1,
         },
         miniMusicPlayerControls: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 12,
         },
         miniMusicPlayerButton: {
           width: 32,
           height: 32,
           borderRadius: 16,
           backgroundColor: '#f0f0f0',
           justifyContent: 'center',
           alignItems: 'center',
         },
          deityContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5, // Above temple but below bells and arch
          },

    aartiContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      flex: 1,
      width: '100%',
      height: '100%',
    },
    aartiPlate: {
      width: '60%',
      height: '60%',
      marginBottom: 20,
    },
    aartiText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FF6A00',
      marginBottom: 15,
      textAlign: 'center',
    },
    aartiDescription: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24,
    },
    thaliLoadingContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -100 }, { translateY: -50 }],
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: 10,
      padding: 20,
      zIndex: 1002,
    },
    thaliLoadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#FF6A00',
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    loadingGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingContent: {
      alignItems: 'center',
    },
    loadingLogo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
    },
    loadingSubtitle: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 20,
    },
    progressContainer: {
      width: '80%',
      marginBottom: 20,
    },
    progressBar: {
      height: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FF6A00',
      borderRadius: 5,
    },
    progressText: {
      fontSize: 14,
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    loadingSteps: {
      alignItems: 'center',
    },
    loadingStepText: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
      fontWeight: '500',
    },
    aartiModalOverlay: {
      flex: 1,
      backgroundColor: 'transparent', // 100% transparent background
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9998, // Very high zIndex, just below thali
    },
    aartiModalOverlayTouchable: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    flowerProgressBar: {
      height: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2.5,
      overflow: 'hidden',
      marginTop: 5,
      width: '80%',
    },
    flowerProgressFill: {
      height: '100%',
      backgroundColor: '#FF6A00',
      borderRadius: 2.5,
      width: '100%',
    },
    // Next Button Styles
    nextButtonContainer: {
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 15,
    },
    nextButton: {
      backgroundColor: '#FF6A00',
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 40,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    nextButtonDisabled: {
      backgroundColor: '#ccc',
      opacity: 0.7,
    },
    nextButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    nextButtonSubtext: {
      color: '#fff',
      fontSize: 12,
      opacity: 0.9,
    },
    // S3 Gallery Styles
    s3GalleryOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 1000,
    },
    s3GalleryHeader: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 15,
      margin: 20,
      marginTop: 100,
    },
    s3GalleryTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 5,
    },
    s3GallerySubtitle: {
      fontSize: 16,
      color: 'white',
      opacity: 0.9,
    },
    s3ImageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      minHeight: 400,
      marginTop: 100,
    },
    s3MainImage: {
      borderRadius: 15,
      minHeight: 200,
      minWidth: 200,
      transform: [{ scale: 2 }],
    },
    s3ImagePlaceholder: {
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    s3ImagePlaceholderText: {
      color: 'white',
      fontSize: 16,
      marginTop: 10,
    },

    s3NavigationContainer: {
      position: 'absolute',
      top: 200, // Positioned 100 pixels up from original position
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      zIndex: 1020,
    },
    s3ImageNavigationContainer: {
      position: 'absolute',
      top: 130, // Moved another 20 pixels up from 150
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 0, // Remove horizontal padding to allow custom positioning
      paddingVertical: 15,
      zIndex: 1020,
      backgroundColor: 'transparent', // Make background transparent
    },
    s3NavButton: {
      backgroundColor: 'transparent', // Remove button background
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      minWidth: 30, // Reduced by 75% from 120 to 30
      alignItems: 'center',
      position: 'absolute', // Enable absolute positioning
    },
    s3NavButtonText: {
      color: 'white',
      fontSize: 28, // 2x size from 14 to 28
      fontWeight: '600',
    },
    s3NavButtonTextDisabled: {
      opacity: 0.5,
    },
    s3NavButtonLeft: {
      left: 10, // Moved another 10 pixels left from 20 to 10
      top: 10, // Moved 10 pixels down
    },
    s3NavButtonRight: {
      right: 10, // Moved another 10 pixels left from 20 to 10
      top: 10, // Moved 10 pixels down
    },
    s3InfoContainer: {
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      margin: 20,
      borderRadius: 15,
    },
    s3FolderInfo: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 5,
    },
    s3ImageInfo: {
      color: 'white',
      fontSize: 14,
      opacity: 0.8,
    },
    // S3 Puja Icons Styles
    s3LeftPujaIconsColumn: {
      position: 'absolute',
      left: 0,
      top: 250,
      width: 60, // Reduced width to align icons with edge
      zIndex: 1010,
      backgroundColor: 'transparent',
      borderRightWidth: 0,
      paddingVertical: 20,
      paddingHorizontal: 0, // No horizontal padding to align with edge
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    s3RightPujaIconsColumn: {
      position: 'absolute',
      right: 0,
      top: 250,
      width: 60, // Reduced width to align icons with edge
      zIndex: 1010,
      backgroundColor: 'transparent',
      borderLeftWidth: 0,
      paddingVertical: 20,
      paddingHorizontal: 0, // No horizontal padding to align with edge
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    // God Name Display Styles
    godNameContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginTop: 100, // Position 100 pixels below the image
    },
    godNameText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    // Folder Navigation Icons Styles
    folderNavigationContainer: {
      position: 'absolute',
      top: 60, // Moved down 15 pixels from 45 to 60
      left: 0,
      right: 0,
      height: 80, // Reduced height to accommodate 35x35 icons + padding + borders
      zIndex: 1030,
      justifyContent: 'flex-start', // Ensure content aligns to top
    },
    folderNavigationContent: {
      paddingHorizontal: 20,
      paddingTop: 10, // Add top padding to position icons properly
      alignItems: 'center',
      justifyContent: 'flex-start', // Align to top so bottom gets clipped if needed
    },
    folderIconItem: {
      alignItems: 'center',
      marginHorizontal: 2, // Further reduced margin for tighter spacing
      paddingVertical: 8, // Increased padding for larger icons
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 45, // Reduced width to accommodate 35x35 icons
    },
    folderIconItemActive: {
      backgroundColor: 'rgba(255, 106, 0, 0.3)',
      borderColor: '#FF6A00',
    },
    folderIconImage: {
      width: 35, // Icon size as requested
      height: 35, // Icon size as requested
      borderRadius: 5,
      marginBottom: 0, // No margin since no label
    },
    folderIconImageActive: {
      borderWidth: 2,
      borderColor: '#FF6A00',
    },
    folderIconPlaceholder: {
      width: 35, // Icon size as requested
      height: 35, // Icon size as requested
      borderRadius: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0, // No margin since no label
    },
    folderIconPlaceholderActive: {
      backgroundColor: 'rgba(255, 106, 0, 0.3)',
      borderWidth: 2,
      borderColor: '#FF6A00',
    },
    folderIconPlaceholderText: {
      fontSize: 20,
      color: 'white',
      fontWeight: 'bold',
    },
    folderIconLabel: {
      fontSize: 10,
      color: 'white',
      textAlign: 'center',
      fontWeight: '500',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    folderIconLabelActive: {
      color: '#FF6A00',
      fontWeight: 'bold',
    },
    // Deity Dropdown Styles
    deityDropdownContainer: {
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: [{ translateX: -20 }], // Center the 40% width dropdown
      width: '40%',
      zIndex: 1040,
    },
    deityDropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // 80% transparent background
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: '#FF6A00',
    },
    deityDropdownButtonText: {
      fontSize: 10, // Reduced to 10px
      fontWeight: '600',
      color: '#333',
    },
    deityDropdownArrow: {
      fontSize: 10, // Reduced to 10px
      color: '#FF6A00',
      fontWeight: 'bold',
    },
    deityDropdownList: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // 80% transparent background
      borderRadius: 15,
      marginTop: 5,
      maxHeight: 200,
      borderWidth: 2,
      borderColor: '#FF6A00',
    },
    deityDropdownScroll: {
      paddingVertical: 10,
    },
    deityDropdownItem: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    deityDropdownItemActive: {
      backgroundColor: 'rgba(255, 106, 0, 0.1)',
    },
    deityDropdownItemText: {
      fontSize: 10, // Reduced to 10px
      color: '#333',
      textAlign: 'center',
    },
    deityDropdownItemTextActive: {
      color: '#FF6A00',
      fontWeight: 'bold',
    },
    // Swipe Gesture Styles
    swipeableImageContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      // Ensure touch events are captured
      backgroundColor: 'transparent',
    },
    swipeIndicator: {
      position: 'absolute',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 106, 0, 0.9)',
      zIndex: 1050,
    },
    swipeIndicatorUp: {
      top: 20,
    },
    swipeIndicatorDown: {
      bottom: 20,
    },
    swipeIndicatorText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    swipeStatusContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: 'rgba(255, 106, 0, 0.1)',
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#FF6A00',
    },
    swipeStatusText: {
      color: '#FF6A00',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Action Buttons Styles
    actionButtonsContainer: {
      position: 'absolute',
      bottom: 175, // Moved 75 pixels down from 250 to 175
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1020,
    },
    actionButton: {
      backgroundColor: 'rgba(255, 106, 0, 0.8)',
      width: 100, // Button width 100px
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 5, // Very less round corners
      marginHorizontal: 5, // 5px spacing on each side = 10px total spacing
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 10, // Font size 10 pixels
      fontWeight: '600',
      textAlign: 'center',
    },
    // Main Navigation Buttons Styles (Always Visible)
    mainNavigationButtonsContainer: {
      position: 'absolute',
      top: 700, // Moved up 60 pixels from 760 to 700
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1020,
    },
    mainNavigationButton: {
      backgroundColor: 'rgba(255, 106, 0, 0.8)',
      width: 100, // Button width 100px
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 5, // Very less round corners
      marginHorizontal: 5, // 5px spacing on each side = 10px total spacing
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainNavigationButtonText: {
      color: 'white',
      fontSize: 10, // Font size 10 pixels
      fontWeight: '600',
      textAlign: 'center',
    },
    mainNavigationButtonActive: {
      backgroundColor: 'rgba(255, 106, 0, 1)', // Fully opaque orange when active
      borderWidth: 2,
      borderColor: '#fff', // White border for active state
      shadowColor: '#FF6A00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 8,
    },
    mainNavigationButtonTextActive: {
      color: 'white',
      fontSize: 11, // Slightly larger font when active
      fontWeight: '700', // Bolder when active
    },
    mainNavigationButtonDisabled: {
      backgroundColor: 'rgba(128, 128, 128, 0.5)', // Grayed out when disabled
      opacity: 0.6,
    },
    mainNavigationButtonTextDisabled: {
      color: 'rgba(255, 255, 255, 0.6)', // Dimmed text when disabled
    },
    createTempleButton: {
      backgroundColor: '#4CAF50', // Green color for create action
      borderWidth: 2,
      borderColor: '#45a049',
    },
    disabledButtonInfo: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 8,
      textAlign: 'center',
      marginTop: 2,
      fontStyle: 'italic',
    },
    noTempleMessage: {
      position: 'absolute',
      top: 80,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    noTempleMessageText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
    },
    // Perform Puja Button Styles
    performPujaButtonContainer: {
      position: 'absolute',
      top: 560, // Moved up 60 pixels from 620 to 560
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1020,
      marginTop: 80, // Changed from 50 to 80
    },
    performPujaButton: {
      backgroundColor: 'rgba(255, 106, 0, 0.9)', // Slightly more opaque than navigation buttons
      width: 320, // Width to match 3 navigation buttons: (100px + 10px margin) × 3 = 330px, reduced to 320px for better fit
      paddingVertical: 15, // Slightly taller than navigation buttons
      paddingHorizontal: 20,
      borderRadius: 8, // Slightly more rounded than navigation buttons
      alignItems: 'center',
      justifyContent: 'center',
    },
    performPujaButtonText: {
      color: 'white',
      fontSize: 14, // Larger font than navigation buttons
      fontWeight: '700', // Bolder than navigation buttons
      textAlign: 'center',
    },
    // Puja Thali Animation Styles
    pujaThali: {
      position: 'absolute',
      zIndex: 9999, // Very high zIndex to ensure visibility
      alignItems: 'center',
      justifyContent: 'center',
    },



    // Debug Button Styles
    debugButton: {
      backgroundColor: '#FF6A00',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    debugButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },

  }); // End of StyleSheet