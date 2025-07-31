import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';

export const options = { headerShown: false };

const { width: screenWidth } = Dimensions.get('window');
const GRADIENT_OPTION_GAP = 8;
const GRADIENT_OPTION_SIDE_PADDING = 16;
const GRADIENT_OPTION_WIDTH = (screenWidth - 3 * GRADIENT_OPTION_GAP - 2 * GRADIENT_OPTION_SIDE_PADDING) / 4;

function ArchSVG(props: { width?: number; height?: number; style?: any }) {
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
];

const gradientPresets = [
  ['#8B5CF6', '#7C3AED', '#6D28D9'], // purple
  ['#43CEA2', '#185A9D'], // green-blue
  ['#FFDEE9', '#B5FFFC'], // pink-blue
  ['#1FA2FF', '#FFD200', '#21D4FD'], // blue-teal-yellow
  ['#F7971E', '#FFD200', '#21D4FD'], // yellow-blue
  ['#F953C6', '#B91D73'], // pink-violet
  ['#00F2FE', '#4FACFE'], // cyan-blue
  ['#F7971E', '#FFD200'], // yellow-orange
  ['#43E97B', '#38F9D7'], // green-turquoise
  ['#667EEA', '#764BA2'], // blue-purple
  ['#FCE38A', '#F38181'], // yellow-pink
  ['#FAD961', '#F76B1C'], // yellow-orange
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
  console.log('Getting image source for:', imagePath);
  
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
  
  console.log('Extracted filename:', filename);
  
  // Map MongoDB paths to static require calls
  switch (filename) {
    case 'VishnuIcon.png':
      console.log('✅ Mapping to VishnuIcon.png');
      return require('@/assets/images/temple/VishnuIcon.png');
    case 'Ganesha1.png':
      console.log('✅ Mapping to Ganesha1.png');
      return require('@/assets/images/temple/Ganesha1.png');
    case 'Ganesha2.png':
      console.log('✅ Mapping to Ganesha2.png');
      return require('@/assets/images/temple/Ganesha2.png');
    case 'Krishna1.png':
      console.log('✅ Mapping to Krishna1.png');
      return require('@/assets/images/temple/Krishna1.png');
    case 'Krishna2.png':
      console.log('✅ Mapping to Krishna2.png');
      return require('@/assets/images/temple/Krishna2.png');
    case 'Vishnu1.png':
      console.log('✅ Mapping to Vishnu1.png');
      return require('@/assets/images/temple/Vishnu1.png');
    case 'Lakshmi1.png':
      console.log('✅ Mapping to Lakshmi1.png');
      return require('@/assets/images/temple/Lakshmi1.png');
    case 'Saraswati1.png':
      console.log('✅ Mapping to Saraswati1.png');
      return require('@/assets/images/temple/Saraswati1.png');
    case 'Durga1.png':
      console.log('✅ Mapping to Durga1.png');
      return require('@/assets/images/temple/Durga1.png');
    case 'Durga2.png':
      console.log('✅ Mapping to Durga2.png');
      return require('@/assets/images/temple/Durga2.png');
    case 'Brahma1.png':
      console.log('✅ Mapping to Brahma1.png');
      return require('@/assets/images/temple/Brahma1.png');
    case 'Shiv2.png':
      console.log('✅ Mapping to Shiv2.png');
      return require('@/assets/images/temple/Shiv2.png');
    case 'ShivParvati1.png':
      console.log('✅ Mapping to ShivParvati1.png');
      return require('@/assets/images/temple/ShivParvati1.png');
    case 'Rama1.png':
      console.log('✅ Mapping to Rama1.png');
      return require('@/assets/images/temple/Rama1.png');
    case 'Hanuman1.png':
      console.log('✅ Mapping to Hanuman1.png');
      return require('@/assets/images/temple/Hanuman1.png');
    case 'Surya1.png':
      console.log('✅ Mapping to Surya1.png');
      return require('@/assets/images/temple/Surya1.png');
    case 'Temple1.png':
      console.log('✅ Mapping to Temple1.png');
      return require('@/assets/images/temple/Temple1.png');
    case 'Temple2.png':
      console.log('✅ Mapping to Temple2.png');
      return require('@/assets/images/temple/Temple2.png');
    case 'Temple-bg.png':
      console.log('✅ Mapping to Temple-bg.png');
      return require('@/assets/images/temple/Temple-bg.png');
    case 'TempleStar.png':
      console.log('✅ Mapping to TempleStar.png');
      return require('@/assets/images/temple/TempleStar.png');
    case 'GoldenBell.png':
      console.log('✅ Mapping to GoldenBell.png');
      return require('@/assets/images/temple/GoldenBell.png');
    case 'Glow.png':
      console.log('✅ Mapping to Glow.png');
      return require('@/assets/images/temple/Glow.png');
    case 'arch.svg':
      console.log('✅ Mapping to arch.svg');
      return require('@/assets/images/temple/arch.svg');
    default:
      console.log('❌ Image not found in mapping, using fallback. Filename:', filename);
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
  const [modal, setModal] = useState<null | 'temple' | 'deities' | 'background' | 'lights' | 'statues'>(null);
  // State initializers
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [bgGradient, setBgGradient] = useState(gradientPresets[0]);
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({}); // deityId -> statueUrl
  const [deityError, setDeityError] = useState('');
  const [deityData, setDeityData] = useState<DeityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeityForStatues, setSelectedDeityForStatues] = useState<DeityData | null>(null);

  // Load config on mount
  useEffect(() => {
    (async () => {
      const configStr = await AsyncStorage.getItem(TEMPLE_CONFIG_KEY);
      if (configStr) {
        try {
          const config = JSON.parse(configStr);
          if (config.selectedStyle) setSelectedStyle(config.selectedStyle);
          if (config.bgGradient) setBgGradient(config.bgGradient);
          if (config.selectedDeities) setSelectedDeities(config.selectedDeities);
        } catch {}
      }
    })();
  }, []);

  // Fetch deity data from MongoDB
  useEffect(() => {
    const fetchDeityData = async () => {
      try {
            console.log('Fetching deity data from: https://backend-ot2766akl-surbhi-guptas-projects-4a5bc02c.vercel.app/api/deity-statues');
    const res = await axios.get(getEndpointUrl('DEITY_STATUES'));
        console.log('Fetched deity data:', res.data);
        
        // Log detailed statue information
        res.data.forEach((deity: any, index: number) => {
          console.log(`Deity ${index + 1}:`, {
            name: deity.Deity?.Name,
            icon: deity.Icon,
            statues: deity.Deity?.Statues,
            statuesType: typeof deity.Deity?.Statues,
            statuesLength: deity.Deity?.Statues?.length,
            isArray: Array.isArray(deity.Deity?.Statues)
          });
        });
        
        setDeityData(res.data);
      } catch (e: any) {
        console.error('Error fetching deity data:', e);
        console.error('Error response:', e.response?.data);
        console.error('Error status:', e.response?.status);
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
  // Save config on change
  useEffect(() => {
    AsyncStorage.setItem(
      TEMPLE_CONFIG_KEY,
      JSON.stringify({ selectedStyle, bgGradient, selectedDeities })
    );
  }, [selectedStyle, bgGradient, selectedDeities]);

  // Save selectedDeities for next screen
  useEffect(() => {
    AsyncStorage.setItem(SELECTED_DEITIES_KEY, JSON.stringify(selectedDeities));
  }, [selectedDeities]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', modal, 'selectedDeityForStatues:', selectedDeityForStatues?.Deity?.Name);
  }, [modal, selectedDeityForStatues]);

  const labelColor = getLabelColor(bgGradient);

  return (
    <View style={styles.container}>
      {/* Purple Gradient Background (dynamic) */}
      <LinearGradient
        colors={bgGradient as any}
        style={styles.purpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
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
      <ScrollView contentContainerStyle={{ alignItems: 'center', marginTop: 75, paddingBottom: 40 }}>
        {/* Temple image chosen by user */}
        <Image
          source={templeStyles.find(t => t.id === selectedStyle)?.image}
          style={
            selectedStyle === 'temple2'
              ? [styles.mainTempleImage, { width: styles.mainTempleImage.width * 1.3, marginTop: (styles.mainTempleImage.marginTop || 0) + 75, marginBottom: 0 }]
            : selectedStyle === 'temple1'
              ? [styles.mainTempleImage, { width: styles.mainTempleImage.width * 1.2, marginTop: (styles.mainTempleImage.marginTop || 0) + 75, marginBottom: 0 }]
              : [styles.mainTempleImage, { marginTop: (styles.mainTempleImage.marginTop || 0) + 75, marginBottom: 0 }]
          }
          resizeMode="contain"
        />
        {/* Move only the icon row and button up by 75px */}
        <View style={{ alignItems: 'center', marginTop: -60 }}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.circleButton} onPress={() => setModal('temple')}>
                <Image source={require('@/assets/images/temple/Temple1.png')} style={styles.circleButtonImage} resizeMode="contain" />
              </TouchableOpacity>
              <Text style={[styles.buttonFooter, { color: labelColor }]}>Temple</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.circleButton} onPress={() => setModal('deities')}>
                <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.circleButtonImage} resizeMode="contain" />
              </TouchableOpacity>
              <Text style={[styles.buttonFooter, { color: labelColor }]}>Deities</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.circleButton} onPress={() => setModal('background')}>
                <LinearGradient colors={bgGradient as any} style={styles.gradientCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              </TouchableOpacity>
              <Text style={[styles.buttonFooter, { color: labelColor }]}>Background</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.circleButton} onPress={() => setModal('lights')}>
                <MaterialCommunityIcons name="lightbulb" size={40} color="#FF6A00" />
              </TouchableOpacity>
              <Text style={[styles.buttonFooter, { color: labelColor }]}>Lights</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ marginTop: 32, backgroundColor: '#FF6A00', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, alignSelf: 'center' }}
            onPress={() => router.push('/screens/temple-preview')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
                  <View style={styles.modalStyleList}>
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
                  </View>
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
                          console.log('⚠️ Skipping deity with no Deity property:', deity);
                          return null;
                        }
                        
                        console.log('Rendering deity:', {
                          id: deity._id,
                          name: deity.Deity?.Name,
                          icon: deity.Icon,
                          statues: deity.Deity?.Statues?.length || 0
                        });
                        const isSelected = selectedDeities.hasOwnProperty(deity._id || '');
                        const selectedStatueUrl = selectedDeities[deity._id || ''];
                        return (
                          <TouchableOpacity
                            key={deity._id}
                            style={styles.deityOption}
                            onPress={() => {
                              // Add null check before accessing deity.Deity
                              if (!deity.Deity) {
                                console.log('⚠️ Cannot access deity with no Deity property');
                                return;
                              }
                              
                              console.log('Deity clicked:', deity.Deity.Name, 'Statues:', deity.Deity.Statues);
                              console.log('Statues type:', typeof deity.Deity.Statues, 'Is array:', Array.isArray(deity.Deity.Statues));
                              
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
                                
                                console.log('Processed statues array:', statuesArray);
                                
                                if (statuesArray.length > 0) {
                                  console.log('Opening statues modal for:', deity.Deity.Name);
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
                                } else {
                                  console.log('No statues available for:', deity.Deity.Name);
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
                        console.log('Rendering statue:', { index, statueUrl });
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
              ) : (
                <View style={{ width: 240, height: 180, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                    {modal === 'lights' && 'Coming Soon'}
                  </Text>
                  <TouchableOpacity onPress={() => setModal(null)} style={{ marginTop: 16, padding: 10, backgroundColor: '#FF6A00', borderRadius: 8 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    width: screenWidth * 1.15,
    height: undefined,
    aspectRatio: 1.2,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 16,
    zIndex: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 50,
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
    justifyContent: 'center',
    gap: 20,
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
}); 