import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated, PanResponder, Alert } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Audio } from 'expo-av';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { markDailyPujaVisited } from '@/utils/dailyPujaUtils';
import { loadTempleConfiguration } from '@/utils/templeUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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
          source={require('@/assets/images/temple/GoldenBell.png')}
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
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({});
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [assetPreloading, setAssetPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [bgGradient, setBgGradient] = useState(["#8B5CF6", "#7C3AED", "#6D28D9"]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [flowers, setFlowers] = useState<{ id: number; x: number; y: number; rotation: number; scale: number; opacity: number; type: string }[]>([]);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [smoke, setSmoke] = useState<{ id: number; x: number; y: number; opacity: number; scale: number; rotation: number; animatedY: Animated.Value; animatedOpacity: Animated.Value; animatedScale: Animated.Value }[]>([]);
  const [isSmokeAnimationRunning, setIsSmokeAnimationRunning] = useState(false);
  const [showSmokeModal, setShowSmokeModal] = useState(false);
  const [showAartiModal, setShowAartiModal] = useState(false);
  const [thaliPosition, setThaliPosition] = useState({ x: 0, y: 0 });
  const [leftBellSwing, setLeftBellSwing] = useState(new Animated.Value(0));
  const [rightBellSwing, setRightBellSwing] = useState(new Animated.Value(0));
  const [thaliImageLoaded, setThaliImageLoaded] = useState(false);
  const smokeAnimationRef = useRef(false);
  const router = useRouter();

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

  // Mark that user has visited daily puja screen today and play welcome bell
  useEffect(() => {
    const markVisit = async () => {
      try {
        await markDailyPujaVisited();
        console.log('✅ Daily puja visit marked for today');
      } catch (error) {
        console.error('❌ Error marking daily puja visit:', error);
      }
    };
    
    markVisit();
    
    // Comprehensive preloading of all essential assets for smooth daily puja experience
    const preloadAllAssets = async () => {
      console.log('🚀 Starting comprehensive asset preloading...');
      setAssetPreloading(true);
      setPreloadProgress(0);
      
      // Helper function to safely preload images
      const safePrefetchImage = async (imagePath: any, description: string) => {
        try {
          // Validate that imagePath is a valid require statement
          if (typeof imagePath === 'string' || typeof imagePath === 'number') {
            console.log(`⚠️ Skipping invalid image path for ${description}:`, imagePath);
            return false;
          }
          
          await Image.prefetch(imagePath);
          return true;
        } catch (error) {
          console.log(`⚠️ Failed to preload ${description}:`, error);
          return false;
        }
      };
      
      try {
        let completedSteps = 0;
        const totalSteps = 7; // Total number of preloading steps
        
        const updateProgress = () => {
          completedSteps++;
          const progress = Math.min(Math.round((completedSteps / totalSteps) * 100), 100);
          setPreloadProgress(progress);
          console.log(`📊 Preloading progress: ${progress}%`);
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
        
        console.log('🌸 Preloading flower images...');
        const flowerResults = await Promise.all(flowerImages.map(async (image, index) => {
          const flowerNames = ['rose', 'whiterose', 'jasmine', 'YellowShevanthi', 'WhiteShevanthi', 'RedShevanthi'];
          return await safePrefetchImage(image, `flower ${flowerNames[index]}`);
        }));
        const successfulFlowers = flowerResults.filter(result => result).length;
        console.log(`✅ ${successfulFlowers}/${flowerImages.length} flower images preloaded successfully`);
        updateProgress();
        
        // Preload arti thali
        console.log('🪔 Preloading arti thali...');
        const thaliSuccess = await safePrefetchImage(
          require('@/assets/images/icons/own temple/PujaThali1.png'),
          'arti thali'
        );
        if (thaliSuccess) {
          console.log('✅ Arti thali preloaded successfully');
        }
        updateProgress();
        
        // Preload bell images
        console.log('🔔 Preloading bell images...');
        const bellImages = [
          require('@/assets/images/temple/GoldenBell.png'),
          require('@/assets/images/temple/Glow.png'),
        ];
        
        const bellResults = await Promise.all(bellImages.map(async (image, index) => {
          const bellNames = ['GoldenBell', 'Glow'];
          return await safePrefetchImage(image, `bell ${bellNames[index]}`);
        }));
        const successfulBells = bellResults.filter(result => result).length;
        console.log(`✅ ${successfulBells}/${bellImages.length} bell images preloaded successfully`);
        updateProgress();
        
        // Preload shankh image
        console.log('🐚 Preloading shankh image...');
        const shankhSuccess = await safePrefetchImage(
          require('@/assets/images/icons/own temple/sankha.png'),
          'shankh'
        );
        if (shankhSuccess) {
          console.log('✅ Shankh image preloaded successfully');
        }
        updateProgress();
        
        // Preload dhoop image
        console.log('💨 Preloading dhoop image...');
        const dhoopSuccess = await safePrefetchImage(
          require('@/assets/images/icons/own temple/puja essential/Dhoop.png'),
          'dhoop'
        );
        if (dhoopSuccess) {
          console.log('✅ Dhoop image preloaded successfully');
        }
        updateProgress();
        
        // Preload essential deity images for better performance
        console.log('🙏 Preloading essential deity images...');
        const essentialDeityImages = [
          require('@/assets/images/temple/VishnuIcon.png'),
          require('@/assets/images/temple/Ganesha1.png'),
          require('@/assets/images/temple/Krishna1.png'),
          require('@/assets/images/temple/Lakshmi1.png'),
          require('@/assets/images/temple/Saraswati1.png'),
          require('@/assets/images/temple/Durga1.png'),
          require('@/assets/images/temple/Hanuman1.png'),
        ];
        
        const deityResults = await Promise.all(essentialDeityImages.map(async (image, index) => {
          const deityNames = ['VishnuIcon', 'Ganesha1', 'Krishna1', 'Lakshmi1', 'Saraswati1', 'Durga1', 'Hanuman1'];
          return await safePrefetchImage(image, `deity ${deityNames[index]}`);
        }));
        const successfulDeities = deityResults.filter(result => result).length;
        console.log(`✅ ${successfulDeities}/${essentialDeityImages.length} essential deity images preloaded successfully`);
        updateProgress();
        
        // Preload temple background images
        console.log('🏛️ Preloading temple background images...');
        const templeImages = [
          require('@/assets/images/temple/Temple1.png'),
          require('@/assets/images/temple/Temple2.png'),
          require('@/assets/images/temple/Temple-bg.png'),
          require('@/assets/images/temple/TempleStar.png'),
        ];
        
        const templeResults = await Promise.all(templeImages.map(async (image, index) => {
          const templeNames = ['Temple1', 'Temple2', 'Temple-bg', 'TempleStar'];
          return await safePrefetchImage(image, `temple ${templeNames[index]}`);
        }));
        const successfulTemples = templeResults.filter(result => result).length;
        console.log(`✅ ${successfulTemples}/${templeImages.length} temple background images preloaded successfully`);
        updateProgress();
        
        // Preload sound files
        console.log('🔊 Preloading sound files...');
        try {
          // Preload temple bell sound
          const templeBellSound = new Audio.Sound();
          await templeBellSound.loadAsync(require('@/assets/sounds/TempleBell.mp3'));
          await templeBellSound.unloadAsync();
          console.log('✅ Temple bell sound preloaded successfully');
          
          // Preload conch sound
          const conchSound = new Audio.Sound();
          await conchSound.loadAsync(require('@/assets/sounds/conch.mp3'));
          await conchSound.unloadAsync();
          console.log('✅ Conch sound preloaded successfully');
        } catch (error) {
          console.log('⚠️ Failed to preload sound files:', error);
        }
        updateProgress();
        
        console.log('🎉 All assets preloaded successfully! Daily puja is ready for smooth experience.');
        
        // Log summary of preloading results
        const totalAssets = flowerImages.length + 1 + bellImages.length + 1 + 1 + essentialDeityImages.length + templeImages.length + 2; // +2 for sounds
        const successfulAssets = successfulFlowers + (thaliSuccess ? 1 : 0) + successfulBells + (shankhSuccess ? 1 : 0) + (dhoopSuccess ? 1 : 0) + successfulDeities + successfulTemples + 2; // +2 for sounds
        console.log(`📊 Preloading Summary: ${successfulAssets}/${totalAssets} assets loaded successfully`);
        
        // Show completion message for a moment before transitioning
        setTimeout(() => {
          setAssetPreloading(false);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error during asset preloading:', error);
        setAssetPreloading(false);
      }
    };
    
    // Start preloading all assets
    preloadAllAssets();
    
    // Play welcome bell after a short delay
    setTimeout(() => {
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
  }, []);

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
      try {
        console.log('🔄 [DAILY PUJA] Loading temple configuration...');
        
        const templeConfig = await loadTempleConfiguration();
        
        if (templeConfig) {
          console.log('✅ [DAILY PUJA] Temple configuration loaded:', templeConfig);
          
          // Load from configuration
          if (templeConfig.selectedDeities) {
            setSelectedDeities(templeConfig.selectedDeities);
          }
          if (templeConfig.selectedStyle) {
            setSelectedStyle(templeConfig.selectedStyle);
          }
          if (templeConfig.bgGradient) {
            setBgGradient(templeConfig.bgGradient);
          }
          if (templeConfig.deityState) {
            setDeityState(templeConfig.deityState);
          }
        } else {
          console.log('🔍 [DAILY PUJA] No temple configuration found');
          Alert.alert(
            'No Temple Configured',
            'Please go to "My Virtual Temple" on the home page to create a temple.',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('🔄 [DAILY PUJA] Navigating back to home...');
                  router.replace('/(tabs)');
                }
              }
            ]
          );
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ [DAILY PUJA] Error loading temple configuration:', error);
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





  const swingBothBells = async () => {
    // Award mudras for ringing the bell
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('RING_BELL');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('RING_BELL');
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for ringing the bell:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for ringing the bell:', mudraResult.error);
        }
      } else {
        console.log('✅ Daily bell ringing mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for ringing the bell:', mudraError);
    }

    // Play temple bell sound twice and start animations
    const playTempleBellSound = async () => {
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
        // Error playing temple bell sound
        console.error('Error playing temple bell sound:', error);
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
    // Award mudras for playing shankh
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('PLAY_SHANKH');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('PLAY_SHANKH');
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for playing shankh:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for playing shankh:', mudraResult.error);
        }
      } else {
        console.log('✅ Daily shankh playing mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for playing shankh:', mudraError);
    }

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
      console.log('❌ Error playing conch sound:', error);
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
    
    // Award mudras for offering flowers
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
        console.log('✅ Daily flower offering mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for offering flowers:', mudraError);
    }
    
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
    
    // Award mudras for offering flowers
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
        console.log('✅ Daily flower offering mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for offering flowers:', mudraError);
    }
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
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
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for doing aarti:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for doing aarti:', mudraResult.error);
        }
      } else {
        console.log('✅ Daily aarti mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for doing aarti:', mudraError);
    }
  };

  // Function to start dhoop smoke effect
  const startDhoopSmoke = async () => {
    // Award mudras for offering dhoop
    try {
      const hasEarnedToday = await hasEarnedDailyMudras('OFFER_DHOOP');
      if (!hasEarnedToday) {
        const mudraResult = await awardMudras('OFFER_DHOOP');
        if (mudraResult.success) {
          console.log('✅ Mudras awarded for offering dhoop:', mudraResult.mudrasEarned);
        } else {
          console.log('⚠️ Failed to award mudras for offering dhoop:', mudraResult.error);
        }
      } else {
        console.log('✅ Daily dhoop offering mudras already earned today');
      }
    } catch (mudraError) {
      console.log('⚠️ Error awarding mudras for offering dhoop:', mudraError);
    }

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
    }, 50); // Reduced from 200ms to 50ms for faster response
    
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
    paddingTop: selectedStyle === 'temple1' ? 300 : 225,
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
                {preloadProgress < 15 && '🌸 Loading sacred flowers...'}
                {preloadProgress >= 15 && preloadProgress < 30 && '🪔 Preparing arti thali...'}
                {preloadProgress >= 30 && preloadProgress < 45 && '🔔 Loading divine bells...'}
                {preloadProgress >= 45 && preloadProgress < 60 && '🐚 Preparing shankh...'}
                {preloadProgress >= 60 && preloadProgress < 75 && '💨 Loading dhoop...'}
                {preloadProgress >= 75 && preloadProgress < 90 && '🙏 Loading deities...'}
                {preloadProgress >= 90 && preloadProgress < 100 && '🏛️ Preparing temple...'}
                {preloadProgress === 100 && '🎉 Ready for divine puja!'}
              </Text>
            </View>
          </View>
        </LinearGradient>
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
      <SwingableBell position="left" swingValue={leftBellSwing} />
      <SwingableBell position="right" swingValue={rightBellSwing} />
             {/* Arch on top */}
       <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
       
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
        
        {/* Left Puja Icons Column - Flowers, Aarti, Dhoop */}
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
        </View>

        {/* Right Puja Icons Column - Ghanti, Shankh */}
        <View style={styles.rightPujaIconsColumn}>
          <TouchableOpacity style={styles.pujaIconItem} onPress={swingBothBells}>
            <Text style={styles.pujaIcon}>🔔</Text>
            <Text style={styles.pujaIconLabel}>Ghanti</Text>
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
           {/* Multiple Dhoop images horizontally centered */}
           {[0, 1, 2, 3, 4].map((index) => {
             const totalWidth = 128 * 5; // 5 images * 128px width
             const spacing = 10; // 10px gap between images
             const totalSpacing = spacing * 4; // 4 gaps between 5 images
             const totalGroupWidth = totalWidth + totalSpacing;
             const startX = (screenWidth - totalGroupWidth) / 2; // Center the group
             const leftPosition = startX + (index * (128 + spacing));
             
             return (
               <Image
                 key={index}
                 source={require('@/assets/images/icons/own temple/puja essential/Dhoop.png')}
                 style={[
                   styles.dhoopImage,
                   {
                     left: leftPosition,
                     bottom: selectedStyle === 'temple1' ? 285 : 335, // 50px lower (closer to bottom) for temple1
                     width: 128, // 20% smaller (160 * 0.8)
                     height: 128, // 20% smaller (160 * 0.8)
                   }
                 ]}
                 resizeMode="contain"
               />
             );
           })}
           
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
     leftPujaIconsColumn: {
      position: 'absolute',
      left: 0, // Align with left edge of screen
      top: 250, // Moved down 100 pixels from 150 to 250
      width: 80, // Reduced width for narrower icon bar
      zIndex: 10, // Above temple but below bells and arch
      backgroundColor: 'transparent', // Transparent background
      borderRightWidth: 0, // Remove border
      paddingVertical: 20,
      paddingHorizontal: 5, // Reduced horizontal padding
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
     rightPujaIconsColumn: {
      position: 'absolute',
      right: 0, // Align with right edge of screen
      top: 250, // Moved down 100 pixels from 150 to 250
      width: 80, // Same width as left column
      zIndex: 10, // Above temple but below bells and arch
      backgroundColor: 'transparent', // Transparent background
      borderLeftWidth: 0, // Remove border
      paddingVertical: 20,
      paddingHorizontal: 5, // Same padding as left column
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
          width: 28, // Reduced size for narrower column
          height: 28, // Reduced size for narrower column
          marginBottom: 6,
        },
                                                                               modalOverlay: {
               flex: 1,
               backgroundColor: 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               zIndex: 1000,
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
    dhoopImage: {
      position: 'absolute',
      zIndex: 25, // Above smoke particles
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
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
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
  });  