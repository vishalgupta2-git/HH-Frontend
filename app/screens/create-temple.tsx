import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Audio } from 'expo-av';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { loadTempleConfiguration, saveTempleConfiguration, checkUserAuthentication, saveTempleToDatabase, loadTempleFromDatabase } from '@/utils/templeUtils';

export const options = { headerShown: false };

const { width: screenWidth } = Dimensions.get('window');
const GRADIENT_OPTION_GAP = 8;
const GRADIENT_OPTION_SIDE_PADDING = 16;
const GRADIENT_OPTION_WIDTH = (screenWidth - 3 * GRADIENT_OPTION_GAP - 2 * GRADIENT_OPTION_SIDE_PADDING) / 4;

function ArchSVG(props: { width?: number; height?: number; style?: any }) {
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
}

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

const gradientPresets = [
  ['#8B5CF6', '#7C3AED', '#6D28D9'], // purple
  ['#43CEA2', '#185A9D'], // green-blue
  ['#FFDEE9', '#B5FFFC'], // pink-blue
  ['#F953C6', '#B91D73'], // pink-violet
  ['#00F2FE', '#4FACFE'], // cyan-blue
  ['#43E97B', '#38F9D7'], // green-turquoise
  ['#667EEA', '#764BA2'], // blue-purple
  ['#9795f0', '#fbc7d4'], // purple-pink
  ['#C33764', '#1D2671'], // magenta-indigo
  ['#11998e', '#38ef7d'], // green
  ['#FF5F6D', '#FFC371'], // red-orange
];

interface DeityData {
  _id?: string;
  'Deity': {
    'Name': string;
    'Statues': string[];
  };
  'Icon': string;
}

// Function to get local asset based on icon path - Dynamic mapping
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
  { key: 'radha', label: 'Radha Krisna', icon: require('@/assets/images/temple/Krishna1.png') },
  { key: 'kali', label: 'Kali Mata', icon: '🌑' },
  { key: 'saraswati', label: 'Saraswati Mata', icon: '🎵' },
  { key: 'loknath', label: 'Loknath Baba', icon: '🧘' },
  { key: 'santoshi', label: 'Santoshi Mata', icon: '🌺' },
  { key: 'extra', label: 'Other', icon: '✨' },
];

// Helper for draggable/scalable deity overlay
const DraggableDeity: React.FC<{ source?: any; emoji?: string; initialX: number; initialY: number }> = ({ source, emoji, initialX, initialY }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const lastScale = useSharedValue(1);

  const panHandler = useAnimatedGestureHandler({
    onStart: (_: any, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event: any, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
  });

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_: any, ctx: any) => {
      ctx.startScale = scale.value;
    },
    onActive: (event: any, ctx: any) => {
      scale.value = ctx.startScale * event.scale;
    },
    onEnd: () => {
      lastScale.value = scale.value;
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    position: 'absolute',
    zIndex: 10,
  }));

  return (
    <PanGestureHandler onGestureEvent={panHandler}>
      <Animated.View style={style}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View>
            {source ? (
              <Image source={source} style={{ width: 72, height: 72 }} resizeMode="contain" />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF6A00' }}>
                <Text style={{ fontSize: 40 }}>{emoji}</Text>
              </View>
            )}
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

// Helper to compute luminance and pick label color
function getLabelColor(gradient: string[]): string {
  // Simple average luminance of first color
  function hexToRgb(hex: string) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }
  const rgb = hexToRgb(gradient[0]);
  // Perceived luminance formula
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.6 ? '#222' : '#fff';
}

const TEMPLE_CONFIG_KEY = 'templeConfig';
const SELECTED_DEITIES_KEY = 'selectedDeities';

export default function CreateTempleScreen() {
  const router = useRouter();
  const [modal, setModal] = useState<null | 'temple' | 'deities' | 'background' | 'statues' | 'temples-deities'>(null);
  // State initializers
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [bgGradient, setBgGradient] = useState(gradientPresets[0]);
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({}); // deityId -> statueUrl
  const [deityError, setDeityError] = useState('');
  const [deityData, setDeityData] = useState<DeityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeityForStatues, setSelectedDeityForStatues] = useState<DeityData | null>(null);
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Function to play welcome bell sound
  const playWelcomeBell = async () => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play the temple bell sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/TempleBell.mp3'),
        { shouldPlay: true, isLooping: false }
      );
      
      setSound(newSound);

      // Stop the sound after 2 seconds
      setTimeout(async () => {
        try {
          await newSound.stopAsync();
          await newSound.unloadAsync();
          setSound(null);
        } catch (error) {
          // Error stopping sound
        }
      }, 2000);

    } catch (error) {
      console.error('Error playing welcome bell sound:', error);
    }
  };

  // Function to load temple configuration with proper priority: DB -> AsyncStorage -> Defaults
  const loadTempleConfig = useCallback(async () => {
    try {
      console.log('🔄 [CREATE TEMPLE] Loading temple configuration...');
      
      // First check if user is authenticated
      const { isAuthenticated, userData } = await checkUserAuthentication();
      console.log('🔍 [CREATE TEMPLE] Authentication check:', { isAuthenticated, userEmail: userData?.email });
      
      let templeConfig = null;
      
      if (isAuthenticated) {
        // User is logged in - try to load from database first
        console.log('🔄 [CREATE TEMPLE] User authenticated, trying database first...');
        try {
          const dbTemple = await loadTempleFromDatabase();
          if (dbTemple) {
            console.log('✅ [CREATE TEMPLE] Temple found in database');
            templeConfig = dbTemple;
          } else {
            console.log('⚠️ [CREATE TEMPLE] No temple in database, falling back to AsyncStorage');
          }
        } catch (error) {
          console.log('⚠️ [CREATE TEMPLE] Database load failed, falling back to AsyncStorage:', error);
        }
      }
      
      // If no database temple, try AsyncStorage
      if (!templeConfig) {
        console.log('🔄 [CREATE TEMPLE] Loading from AsyncStorage...');
        templeConfig = await loadTempleConfiguration();
      }
      
              if (templeConfig) {
          console.log('✅ [CREATE TEMPLE] Temple configuration loaded successfully');
          console.log('🔍 [CREATE TEMPLE] Raw temple config:', JSON.stringify(templeConfig, null, 2));
          console.log('🔍 [CREATE TEMPLE] Config structure analysis:', {
            hasSelectedStyle: !!templeConfig.selectedStyle,
            hasBgGradient: !!templeConfig.bgGradient,
            hasDeityState: !!templeConfig.deityState,
            hasTempleInformation: !!templeConfig.templeInformation,
            templeInfoKeys: templeConfig.templeInformation ? Object.keys(templeConfig.templeInformation) : [],
            rootKeys: Object.keys(templeConfig)
          });
          
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
            console.log('🔍 [CREATE TEMPLE] Loaded deities:', Object.keys(deities));
            
            // Debug: Check if deityState keys match selectedDeities keys
            if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
              const deityStateKeys = templeConfig.deityState.map((d: any) => d.key);
              const selectedDeityKeys = Object.keys(deities);
              console.log('🔍 [CREATE TEMPLE] Key matching check:', {
                deityStateKeys,
                selectedDeityKeys,
                matches: selectedDeityKeys.every(key => deityStateKeys.includes(key))
              });
            }
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
            console.log('🔍 [CREATE TEMPLE] Loaded temple style:', templeStyle);
          } else {
            console.log('⚠️ [CREATE TEMPLE] No temple style found');
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
            console.log('🔍 [CREATE TEMPLE] Loaded background gradient');
          } else {
            console.log('⚠️ [CREATE TEMPLE] No background gradient found');
          }
          
          // Load deity state (positions, scales, sizes) - this is crucial for deity positioning
          if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
            setDeityState(templeConfig.deityState);
            console.log('🔍 [CREATE TEMPLE] Loaded deity state with', templeConfig.deityState.length, 'deities');
            templeConfig.deityState.forEach((deity: any, index: number) => {
              console.log(`🔍 [CREATE TEMPLE] Deity ${index}:`, {
                key: deity.key,
                x: deity.x,
                y: deity.y,
                scale: deity.scale
              });
            });
          } else if (templeConfig.templeInformation && templeConfig.templeInformation.deityState && Array.isArray(templeConfig.templeInformation.deityState)) {
            // Check if deityState is nested in templeInformation (database structure)
            setDeityState(templeConfig.templeInformation.deityState);
            console.log('🔍 [CREATE TEMPLE] Loaded deity state from templeInformation with', templeConfig.templeInformation.deityState.length, 'deities');
            templeConfig.templeInformation.deityState.forEach((deity: any, index: number) => {
              console.log(`🔍 [CREATE TEMPLE] Deity ${index}:`, {
                key: deity.key,
                x: deity.x,
                y: deity.y,
                scale: deity.scale
              });
            });
          } else {
            console.log('⚠️ [CREATE TEMPLE] No deity state found or invalid format');
            console.log('🔍 [CREATE TEMPLE] deityState value:', templeConfig.deityState);
            console.log('🔍 [CREATE TEMPLE] templeInformation.deityState value:', templeConfig.templeInformation?.deityState);
          }
          
          console.log('🎉 [CREATE TEMPLE] Temple configuration applied successfully');
      } else {
        console.log('🔍 [CREATE TEMPLE] No temple configuration found anywhere, using defaults');
        // Set default values
        setSelectedStyle('temple1');
        setBgGradient(['#8B5CF6', '#7C3AED', '#6D28D9']);
        setSelectedDeities({});
        setDeityState([]);
      }
    } catch (error) {
      console.error('❌ [CREATE TEMPLE] Error loading temple configuration:', error);
      // Set default values on error
      setSelectedStyle('temple1');
      setBgGradient(['#8B5CF6', '#7C3AED', '#6D28D9']);
      setSelectedDeities({});
      setDeityState([]);
    }
  }, []);

  // Load config on mount
  useEffect(() => {
    console.log('🚀 [CREATE TEMPLE] Component mounted, starting temple configuration load...');
    loadTempleConfig();
    
    // Play welcome bell after a short delay
    setTimeout(() => {
      playWelcomeBell();
    }, 1000);
  }, [loadTempleConfig]);

  // Reload config when screen comes into focus (e.g., returning from preview screen)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused, reloading temple configuration...');
      loadTempleConfig();
    }, [loadTempleConfig])
  );

  // Fetch deity data from MongoDB
  useEffect(() => {
    const fetchDeityData = async () => {
      try {
        const res = await axios.get(getEndpointUrl('DEITY_STATUES'), {
          headers: getAuthHeaders()
        });
        setDeityData(res.data);
      } catch (e: any) {
        Alert.alert(
          'Failed to fetch deity data', 
          `Error: ${e.response?.data?.error || e.message || 'Unknown error'}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDeityData();
  }, []);
  // Note: No automatic saving - only save when user clicks "Save Temple" or "Edit Deities" buttons

  // Debug modal state
  useEffect(() => {
    // Modal state changed
  }, [modal, selectedDeityForStatues]);

  // Debug state changes after loading (only log when there are actual changes)
  useEffect(() => {
    if (Object.keys(selectedDeities).length > 0 || deityState.length > 0) {
      console.log('🔍 [CREATE TEMPLE] State updated:', {
        selectedStyle,
        bgGradient: bgGradient?.length || 0,
        selectedDeities: Object.keys(selectedDeities),
        selectedDeitiesCount: Object.keys(selectedDeities).length,
        deityStateCount: deityState.length
      });
    }
  }, [selectedStyle, bgGradient, selectedDeities, deityState]);

  // Handle deityState changes to ensure proper rendering
  useEffect(() => {
    if (deityState.length > 0) {
      console.log('🔍 [CREATE TEMPLE] DeityState updated, re-rendering deities with positions and scales');
      deityState.forEach((deity: any, index: number) => {
        console.log(`🔍 [CREATE TEMPLE] Deity ${index} ready for rendering:`, {
          key: deity.key,
          x: deity.x,
          y: deity.y,
          scale: deity.scale
        });
      });
    }
  }, [deityState]);

  const labelColor = getLabelColor(bgGradient);

  // Dynamic style for temple scroll content positioning
  const templeScrollContentStyle = useMemo(() => ({
    ...styles.templeScrollContent,
            paddingTop: selectedStyle === 'temple1' ? 300 : selectedStyle === 'temple2' ? 225 : 475,
  }), [selectedStyle]);

  return (
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
          style={[
            styles.templeImage,
            {
              width: selectedStyle === 'temple3' ? screenWidth * 0.9 : screenWidth * 1.38,
            }
          ]}
          resizeMode="contain"
        />
      </ScrollView>
      
      {/* Bells: left and right */}
      <Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={styles.bellLeft}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={styles.bellRight}
        resizeMode="contain"
      />
      {/* Arch on top */}
      <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
      
      {/* Temple Configuration Icons - Positioned at 50px from top */}
      <View style={styles.templeConfigIconsContainer}>
        <View style={styles.configIconWrapper}>
          <TouchableOpacity 
            style={styles.configIconItem}
            onPress={() => setModal('temple')}
          >
            <Image 
              source={require('@/assets/images/temple/Temple1.png')} 
              style={styles.configIconImage} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.configIconLabel} numberOfLines={1}>Temple Style</Text>
        </View>
        
        <View style={styles.configIconWrapper}>
          <TouchableOpacity 
            style={styles.configIconItem}
            onPress={() => setModal('deities')}
          >
            <Image 
              source={require('@/assets/images/temple/Ganesha1.png')} 
              style={styles.configIconImage} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.configIconLabel} numberOfLines={1}>Deity</Text>
        </View>
        
        <View style={styles.configIconWrapper}>
          <TouchableOpacity 
            style={styles.configIconItem}
            onPress={() => setModal('background')}
          >
            <View style={styles.gradientIconContainer}>
              <LinearGradient
                colors={bgGradient as any}
                style={styles.gradientIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.configIconLabel} numberOfLines={1}>Background</Text>
        </View>
      </View>
      
      {/* Deities positioned in their saved locations */}
      <View style={styles.deityContainer}>
        {Object.keys(selectedDeities).length > 0 ? (
          Object.keys(selectedDeities).map((key: string, idx: number) => {
            const selectedStatueUrl = selectedDeities[key];
            const statueImage = getImageSource(selectedStatueUrl);
            
            // Find saved position and scale for this deity
            const savedDeity = deityState.find(d => d.key === key);
            
            // Debug: Log what we found for this deity
            if (savedDeity) {
              console.log(`🔍 [CREATE TEMPLE] Rendering deity ${key}:`, {
                foundInDeityState: true,
                savedPosition: { x: savedDeity.x, y: savedDeity.y, scale: savedDeity.scale }
              });
            } else {
              console.log(`🔍 [CREATE TEMPLE] Rendering deity ${key}:`, {
                foundInDeityState: false,
                usingDefaultPosition: { x: 50 + idx * 100, y: 300 + idx * 100, scale: 2 }
              });
            }
            
            // Use saved coordinates or default
            const initialX = savedDeity?.x ?? (50 + idx * 100);
            const initialY = savedDeity?.y ?? (300 + idx * 100);
            const initialScale = savedDeity?.scale ?? 2;
            
            return (
              <View
                key={`deity-${key}`}
                style={[
                  styles.deity,
                  {
                    transform: [
                      { translateX: initialX },
                      { translateY: initialY },
                      { scale: initialScale }
                    ]
                  }
                ]}
              >
                <Image source={statueImage} style={styles.deityImage} resizeMode="contain" />
              </View>
            );
          })
        ) : null}
      </View>
       
               {/* Transparent area for icons and next button */}
        <View 
          style={styles.scrollableArea}
        >
          <View style={styles.scrollableContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={async () => {
                  // Save current configuration with dual saving logic
                  try {
                    const templeConfig = {
                      selectedStyle,
                      bgGradient,
                      selectedDeities,
                      deityState,
                    };
                    
                    console.log('🔍 [SAVE TEMPLE] Temple config to save:', {
                      selectedStyle,
                      bgGradient: bgGradient?.length || 0,
                      selectedDeities: Object.keys(selectedDeities),
                      selectedDeitiesCount: Object.keys(selectedDeities).length,
                      deityStateCount: deityState.length
                    });
                    
                    console.log('🔄 [SAVE TEMPLE] Starting dual save process...');
                    
                    // Always save to AsyncStorage first
                    console.log('🔄 [SAVE TEMPLE] Saving to AsyncStorage...');
                    const asyncStorageSuccess = await saveTempleConfiguration(templeConfig);
                    
                    if (asyncStorageSuccess) {
                      console.log('✅ [SAVE TEMPLE] Successfully saved to AsyncStorage');
                      
                      // Verify what was actually saved by reading it back
                      try {
                        const savedConfig = await AsyncStorage.getItem('templeConfig');
                        if (savedConfig) {
                          const parsed = JSON.parse(savedConfig);
                          console.log('🔍 [SAVE TEMPLE] Verification - What was saved to AsyncStorage:', {
                            keys: Object.keys(parsed),
                            hasSelectedDeities: !!parsed.selectedDeities,
                            selectedDeitiesKeys: parsed.selectedDeities ? Object.keys(parsed.selectedDeities) : [],
                            selectedDeitiesCount: parsed.selectedDeities ? Object.keys(parsed.selectedDeities).length : 0
                          });
                        }
                      } catch (verifyError) {
                        console.log('⚠️ [SAVE TEMPLE] Could not verify saved data:', verifyError);
                      }
                    } else {
                      console.log('❌ [SAVE TEMPLE] Failed to save to AsyncStorage');
                    }
                    
                    // Check if user is authenticated for database save
                    const { isAuthenticated, userData } = await checkUserAuthentication();
                    console.log('🔍 [SAVE TEMPLE] Authentication check:', { isAuthenticated, userEmail: userData?.email });
                    
                    if (isAuthenticated) {
                      // User is logged in - also save to database
                      console.log('🔄 [SAVE TEMPLE] User authenticated, saving to database...');
                      try {
                        const dbSuccess = await saveTempleToDatabase(templeConfig);
                        if (dbSuccess) {
                          console.log('✅ [SAVE TEMPLE] Successfully saved to database');
                        } else {
                          console.log('⚠️ [SAVE TEMPLE] Failed to save to database');
                        }
                      } catch (dbError) {
                        console.error('❌ [SAVE TEMPLE] Database save error:', dbError);
                      }
                    } else {
                      console.log('ℹ️ [SAVE TEMPLE] User not authenticated, skipping database save');
                    }
                    
                    console.log('🎉 [SAVE TEMPLE] Dual save process completed');
                  } catch (error) {
                    console.error('❌ [SAVE TEMPLE] Error in dual save process:', error);
                  }
                  
                  // Navigate to homepage instead of back to daily puja
                  router.push('/');
                }}
              >
                <Text style={styles.backButtonText}>Save{'\n'}Temple</Text>
              </TouchableOpacity>
              

              
              <TouchableOpacity
                style={styles.nextButton}
                onPress={async () => {
                  // Save current configuration with dual saving logic before navigating
                  try {
                    const templeConfig = {
                      selectedStyle,
                      bgGradient,
                      selectedDeities,
                      deityState,
                    };
                    
                    console.log('🔍 [ADJUST DEITIES] Temple config to save:', {
                      selectedStyle,
                      bgGradient: bgGradient?.length || 0,
                      selectedDeities: Object.keys(selectedDeities),
                      selectedDeitiesCount: Object.keys(selectedDeities).length,
                      deityStateCount: deityState.length
                    });
                    
                    console.log('🔄 [ADJUST DEITIES] Starting dual save process...');
                    
                    // Always save to AsyncStorage first
                    console.log('🔄 [ADJUST DEITIES] Saving to AsyncStorage...');
                    const asyncStorageSuccess = await saveTempleConfiguration(templeConfig);
                    
                    if (asyncStorageSuccess) {
                      console.log('✅ [ADJUST DEITIES] Successfully saved to AsyncStorage');
                      
                      // Verify what was actually saved by reading it back
                      try {
                        const savedConfig = await AsyncStorage.getItem('templeConfig');
                        if (savedConfig) {
                          const parsed = JSON.parse(savedConfig);
                          console.log('🔍 [ADJUST DEITIES] Verification - What was saved to AsyncStorage:', {
                            keys: Object.keys(parsed),
                            hasSelectedDeities: !!parsed.selectedDeities,
                            selectedDeitiesKeys: parsed.selectedDeities ? Object.keys(parsed.selectedDeities) : [],
                            selectedDeitiesCount: parsed.selectedDeities ? Object.keys(parsed.selectedDeities).length : 0
                          });
                        }
                      } catch (verifyError) {
                        console.log('⚠️ [ADJUST DEITIES] Could not verify saved data:', verifyError);
                      }
                    } else {
                      console.log('❌ [ADJUST DEITIES] Failed to save to AsyncStorage');
                    }
                    
                    // Check if user is authenticated for database save
                    const { isAuthenticated, userData } = await checkUserAuthentication();
                    console.log('🔍 [ADJUST DEITIES] Authentication check:', { isAuthenticated, userEmail: userData?.email });
                    
                    if (isAuthenticated) {
                      // User is logged in - also save to database
                      console.log('🔄 [ADJUST DEITIES] User authenticated, saving to database...');
                      try {
                        const dbSuccess = await saveTempleToDatabase(templeConfig);
                        if (dbSuccess) {
                          console.log('✅ [ADJUST DEITIES] Successfully saved to database');
                        } else {
                          console.log('⚠️ [ADJUST DEITIES] Failed to save to database');
                        }
                      } catch (dbError) {
                        console.error('❌ [ADJUST DEITIES] Database save error:', dbError);
                      }
                    } else {
                      console.log('ℹ️ [ADJUST DEITIES] User not authenticated, skipping database save');
                    }
                    
                    console.log('🎉 [ADJUST DEITIES] Dual save process completed');
                  } catch (error) {
                    console.error('❌ [ADJUST DEITIES] Error in dual save process:', error);
                  }
                  
                  router.push('/screens/temple-preview');
                }}
              >
                <Text style={styles.nextButtonText}>Adjust Deity{'\n'}Size / Position</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      {/* Minimal Modal Implementation for Each Icon */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal !== null}
        onRequestClose={() => setModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setModal(null)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              {modal === 'temple' ? (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Temple</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModal(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                                     <ScrollView 
                                       horizontal 
                                       showsHorizontalScrollIndicator={false}
                                       contentContainerStyle={styles.modalStyleList}
                                     >
                                       {templeStyles.map(style => (
                                         <TouchableOpacity
                                           key={style.id}
                                           style={[styles.modalStyleOption, selectedStyle === style.id && styles.modalStyleOptionSelected]}
                                           onPress={() => {
                                             setSelectedStyle(style.id);
                                             setModal(null);
                                           }}
                                         >
                                           <Image source={style.image} style={styles.modalTempleImage} resizeMode="contain" />
                                           <Text style={styles.modalStyleOptionText}>{style.name}</Text>
                                         </TouchableOpacity>
                                       ))}
                                     </ScrollView>
                </View>
              ) : modal === 'background' ? (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Background</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModal(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.gradientPresetList}>
                    {gradientPresets.map((preset, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.gradientPresetOption}
                        onPress={() => {
                          setBgGradient(preset);
                          setModal(null);
                        }}
                      >
                        <LinearGradient
                          colors={preset as any}
                          style={styles.gradientPresetCircle}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : modal === 'deities' ? (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Deities</Text>
                      {Object.keys(selectedDeities).length > 0 && (
                        <Text style={styles.selectionCounter}>
                          {Object.keys(selectedDeities).length}/3 selected
                        </Text>
                      )}
                    </View>
                    <View style={styles.modalHeaderButtons}>
                      {Object.keys(selectedDeities).length > 0 && (
                        <TouchableOpacity 
                          style={styles.clearAllButton}
                          onPress={() => {
                            setSelectedDeities({});
                            setDeityError('');
                          }}
                        >
                          <Text style={styles.clearAllButtonText}>Clear All</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setModal(null)}
                      >
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading deities...</Text>
                    </View>
                  ) : (
                                         <View style={styles.deityGrid}>
                       {deityData.map((deity) => {
                         // Add null check for deity.Deity
                         if (!deity.Deity) {
                           return null;
                         }
                         
                         const isSelected = selectedDeities.hasOwnProperty(deity._id || '');
                         const selectedStatueUrl = selectedDeities[deity._id || ''];
                         return (
                           <TouchableOpacity
                             key={deity._id}
                             style={styles.deityOption}
                             onPress={() => {
                               // Add null check before accessing deity.Deity
                               if (!deity.Deity) {
                                 return;
                               }
                               
                               if (isSelected) {
                                 // Remove this deity from selection
                                 const newSelectedDeities = { ...selectedDeities };
                                 delete newSelectedDeities[deity._id || ''];
                                 setSelectedDeities(newSelectedDeities);
                               } else {
                                 // Check if we can add more deities (max 3)
                                 if (Object.keys(selectedDeities).length >= 3) {
                                   setDeityError('Maximum 3 deities allowed');
                                   setTimeout(() => setDeityError(''), 2000);
                                   return;
                                 }
                                 
                                 // Handle different possible formats of Statues
                                 let statuesArray: string[] = [];
                                 if (Array.isArray(deity.Deity.Statues)) {
                                   statuesArray = deity.Deity.Statues as string[];
                                 } else if (deity.Deity.Statues && typeof deity.Deity.Statues === 'object') {
                                   // If it's an object, try to convert to array
                                   statuesArray = Object.values(deity.Deity.Statues) as string[];
                                 }
                                 
                                 if (statuesArray.length > 0) {
                                   // Create a copy of deity with processed statues
                                   const deityWithProcessedStatues = {
                                     ...deity,
                                     Deity: {
                                       ...deity.Deity,
                                       Statues: statuesArray
                                     }
                                   };
                                   setSelectedDeityForStatues(deityWithProcessedStatues);
                                   setModal('statues');
                                 }
                               }
                             }}
                           >
                             <View style={[styles.deityIconCircle, isSelected && styles.deityIconCircleSelected]}>
                               {deity.Icon ? (
                                 <Image 
                                   source={getImageSource(deity.Icon)} 
                                   style={{ width: 36, height: 36, borderRadius: 18 }} 
                                   resizeMode="contain" 
                                 />
                               ) : (
                                 <Text style={styles.deityIcon}>🕉️</Text>
                               )}
                               {isSelected && (
                                 <View style={styles.deityCheckmark}>
                                   <MaterialCommunityIcons name="check-circle" size={22} color="#FF6A00" />
                                 </View>
                               )}
                             </View>
                             <Text style={styles.deityLabel}>{deity.Deity?.Name || 'Unknown Deity'}</Text>
                             {isSelected && selectedStatueUrl && (
                               <Text style={styles.selectedStatueText}>✓ Idol Selected</Text>
                             )}
                           </TouchableOpacity>
                         );
                       })}
                     </View>
                  )}
                  {deityError ? (
                    <Text style={styles.deityError}>{deityError}</Text>
                  ) : null}
                </View>
              ) : modal === 'temples-deities' ? (
                 <View style={styles.modalContent}>
                   <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Temples & Deities</Text>
                     <TouchableOpacity 
                       style={styles.closeButton}
                       onPress={() => setModal(null)}
                     >
                       <Text style={styles.closeButtonText}>✕</Text>
                     </TouchableOpacity>
                   </View>
                   <ScrollView 
                     horizontal 
                     showsHorizontalScrollIndicator={false}
                     contentContainerStyle={styles.templesDeitiesScrollView}
                   >
                     <View style={styles.templesDeitiesContainer}>
                       <TouchableOpacity style={styles.templesDeitiesButton} onPress={() => setModal('temple')}>
                         <Image source={require('@/assets/images/temple/Temple1.png')} style={styles.templesDeitiesIcon} resizeMode="contain" />
                         <Text style={styles.templesDeitiesLabel}>Temple</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.templesDeitiesButton} onPress={() => setModal('deities')}>
                         <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.templesDeitiesIcon} resizeMode="contain" />
                         <Text style={styles.templesDeitiesLabel}>Deities</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.templesDeitiesButton} onPress={() => setModal('background')}>
                         <LinearGradient colors={bgGradient as any} style={styles.templesDeitiesGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                         <Text style={styles.templesDeitiesLabel}>Background</Text>
                       </TouchableOpacity>

                     </View>
                   </ScrollView>
                 </View>
               ) : modal === 'statues' && selectedDeityForStatues ? (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Choose {selectedDeityForStatues.Deity?.Name || 'Deity'} Idol</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => {
                        setModal('deities');
                        setSelectedDeityForStatues(null);
                      }}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.statuesScrollView}>
                    <View style={styles.statuesGrid}>
                      {selectedDeityForStatues.Deity.Statues.map((statueUrl, index) => {
                        const isSelected = selectedDeities[selectedDeityForStatues._id || ''] === statueUrl;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.statueItem, isSelected && styles.statueItemSelected]}
                            onPress={() => {
                              // Add this deity and statue to selection
                              const newSelectedDeities = { ...selectedDeities };
                              newSelectedDeities[selectedDeityForStatues._id || ''] = statueUrl;
                              setSelectedDeities(newSelectedDeities);
                              setModal('deities');
                              setSelectedDeityForStatues(null);
                            }}
                          >
                            <Image 
                              source={getImageSource(statueUrl)} 
                              style={styles.statueImage} 
                              resizeMode="contain" 
                            />
                            <Text style={styles.statueLabel}>Statue {index + 1}</Text>
                            {isSelected && (
                              <View style={styles.statueCheckmark}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#FF6A00" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
                             ) : null}

            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bellLeft: {
    position: 'absolute',
    top: 195,
    left: 40,
    width: 62.4,
    height: 117,
    zIndex: 1,
  },
  bellRight: {
    position: 'absolute',
    top: 195,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 220,
  },
  purpleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  mainTempleImage: {
    position: 'absolute',
    width: screenWidth * 1.38,
    height: undefined,
    aspectRatio: 1.2,
    left: -(screenWidth * 0.19), // Center the wider temple by offsetting left
    zIndex: 3,
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
  horizontalScrollView: {
    maxWidth: screenWidth - 40, // Leave some margin on sides
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 20,
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  circleButtonImage: {
    width: 40,
    height: 40,
  },
  gradientCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buttonFooter: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearAllButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionCounter: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
     modalStyleList: {
     flexDirection: 'row',
     justifyContent: 'flex-start',
     gap: 20,
     paddingHorizontal: 20,
   },
  modalStyleOption: {
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    minWidth: 140,
  },
  modalStyleOptionSelected: {
    backgroundColor: '#FFEDD2',
    borderColor: '#FF6A00',
  },
  modalTempleImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  modalStyleOptionText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  modalStyleOptionTextSelected: {
    color: '#FF6A00',
  },
  gradientPresetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GRADIENT_OPTION_GAP,
    marginTop: 8,
    paddingHorizontal: GRADIENT_OPTION_SIDE_PADDING,
  },
  gradientPresetOption: {
    width: GRADIENT_OPTION_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
  },
  gradientPresetCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
     deityGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     justifyContent: 'center',
     gap: 8,
     marginTop: 8,
   },
     deityOption: {
     width: '22%',
     alignItems: 'center',
     marginBottom: 18,
   },
  deityIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  deityIconCircleSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  deityIcon: {
    fontSize: 32,
  },
  deityCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  deityLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  deityError: {
    color: '#FF6A00',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statuesButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statuesButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statuesScrollView: {
    maxHeight: 400,
  },
  statuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  statueItem: {
    alignItems: 'center',
    width: '45%',
  },
  statueImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  statueLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  statueItemSelected: {
    borderWidth: 3,
    borderColor: '#FF6A00',
    borderRadius: 16,
    padding: 4,
  },
  statueCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
     selectedStatueText: {
     fontSize: 10,
     color: '#FF6A00',
     fontWeight: 'bold',
     textAlign: 'center',
     marginTop: 2,
   },
   // Preview modal styles
   previewModalContainer: {
     width: screenWidth,
     height: '100%',
     position: 'relative',
   },
   previewBackground: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 0,
   },
   previewTempleScrollView: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 0,
   },
   previewTempleScrollContent: {
     alignItems: 'center',
     paddingTop: 200,
   },
   previewTempleImage: {
     width: screenWidth * 1.38,
     height: undefined,
     aspectRatio: 1.2,
     alignSelf: 'center',
   },
   previewBellLeft: {
     position: 'absolute',
     top: 195,
     left: 40,
     width: 62.4,
     height: 117,
     zIndex: 1,
   },
   previewBellRight: {
     position: 'absolute',
     top: 195,
     right: 40,
     width: 62.4,
     height: 117,
     zIndex: 1,
   },
   previewArchImage: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     zIndex: 2,
   },
   previewDeityContainer: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 5,
   },
   previewDeity: {
     position: 'absolute',
     width: 60,
     height: 60,
   },
   previewDeityImage: {
     width: 60,
     height: 60,
   },
   previewNoDeities: {
     position: 'absolute',
     top: '50%',
     left: '50%',
     transform: [{ translateX: -50 }, { translateY: -50 }],
     alignItems: 'center',
     justifyContent: 'center',
   },
   previewNoDeitiesText: {
     color: '#fff',
     fontSize: 18,
     fontWeight: 'bold',
     textAlign: 'center',
   },
   previewCloseButton: {
     position: 'absolute',
     bottom: 40,
     left: '50%',
     transform: [{ translateX: -50 }],
     backgroundColor: '#FF6A00',
     paddingHorizontal: 24,
     paddingVertical: 12,
     borderRadius: 24,
     zIndex: 10,
   },
       previewCloseButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Deity display styles
    deityContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 5,
    },
    deity: {
      position: 'absolute',
      width: 60,
      height: 60,
    },
    deityImage: {
      width: 60,
      height: 60,
    },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               scrollableArea: {
                  position: 'absolute',
                  top: 620, // Moved down by 100 pixels from 520
                  left: 0,
                  right: 0,
            bottom: 0,
            zIndex: 10,
          },
       scrollableContent: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 40,
      minHeight: 300, // Ensure minimum height for content
    },
       navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 32,
      paddingHorizontal: 20,
      gap: 20,
    },
     backButton: {
    backgroundColor: '#FF6A00', // Changed from '#666' to match Edit Deities button
    borderRadius: 8, // Reduced from 24 to 8 for very lightly rounded corners
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: 150, // Fixed width of 150px
    alignItems: 'center',
    justifyContent: 'center',
  },
   backButtonText: {
     color: '#fff',
     fontWeight: 'bold',
     fontSize: 14, // Restored to 14px
     textAlign: 'center',
     lineHeight: 18,
   },
   nextButton: {
     backgroundColor: '#FF6A00',
     borderRadius: 8, // Reduced from 24 to 8 for very lightly rounded corners
     paddingVertical: 14,
     paddingHorizontal: 20,
     width: 150, // Fixed width of 150px
     alignItems: 'center',
     justifyContent: 'center',
   },
       nextButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14, // Restored to 14px
      textAlign: 'center',
      lineHeight: 18,
    },
    templesDeitiesScrollView: {
      paddingHorizontal: 20,
    },
    templesDeitiesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -12,
      paddingVertical: 5,
    },
    templesDeitiesButton: {
      alignItems: 'center',
      minWidth: 100,
    },
    templesDeitiesIcon: {
      width: 70,
      height: 70,
      marginBottom: 8,
    },
    templesDeitiesGradient: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginBottom: 8,
    },
    templesDeitiesLabel: {
      fontSize: 12,
      color: '#333',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    // Temple Configuration Icons Styles
    templeConfigIconsContainer: {
      position: 'absolute',
      top: 50, // Moved up 30px from 80 to 50
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 15,
      paddingHorizontal: 20,
    },
    configIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    configIconItem: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 50, // Changed to 50 for circular shape
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      width: 50, // Reduced from 60 to 50 for smaller circle
      height: 50, // Reduced from 60 to 50 for smaller circle
    },
    configIconImage: {
      width: 40,
      height: 40,
      marginBottom: 0, // Remove margin since text is now outside
    },
    configIconLabel: {
      fontSize: 10,
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      marginTop: 4, // Reduced from 8 to 4 for closer positioning
      position: 'absolute',
      top: 58, // Position below the icon (50px icon height + 4px margin + 4px for spacing)
      width: 80, // Fixed width to ensure text fits in one line
    },
    gradientIconContainer: {
      width: 40,
      height: 40,
      marginBottom: 0, // Remove margin since text is now outside
      borderRadius: 20, // Half of width/height for circular shape
      overflow: 'hidden',
    },
    gradientIcon: {
      width: '100%',
      height: '100%',
    },
}); 