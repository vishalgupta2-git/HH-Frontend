import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { State as GestureState, LongPressGestureHandler, PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

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
  { id: 'temple1', image: require('@/assets/images/temple/Temple1.png') },
  { id: 'temple2', image: require('@/assets/images/temple/Temple2.png') },
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

// Draggable/scalable deity overlay
const DraggableDeity: React.FC<{
  source?: any;
  emoji?: string;
  initialX: number;
  initialY: number;
  initialScale?: number;
  onLongPress?: (setScale: (s: number) => void, currentScale: number) => void;
  onMoveOrScale?: (x: number, y: number, scale: number) => void;
}> = ({ source, emoji, initialX, initialY, initialScale = 1, onLongPress, onMoveOrScale }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const lastScale = useSharedValue(initialScale);
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState({ x: 0, y: 0 });

  const panRef = React.useRef(null);
  const pinchRef = React.useRef(null);
  const longPressRef = React.useRef(null);

  const panHandler = useAnimatedGestureHandler({
    onStart: (_: any, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event: any, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      if (onMoveOrScale) runOnJS(onMoveOrScale)(translateX.value, translateY.value, scale.value);
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
      if (onMoveOrScale) runOnJS(onMoveOrScale)(translateX.value, translateY.value, scale.value);
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

  // Long press handler
  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === GestureState.ACTIVE) {
      if (onLongPress) onLongPress((s: number) => { scale.value = s; }, scale.value);
    }
  };

  // Remove local menu rendering

  return (
    <LongPressGestureHandler
      onHandlerStateChange={handleLongPress}
      minDurationMs={3000}
      ref={longPressRef}
      simultaneousHandlers={[panRef, pinchRef]}
    >
      <Animated.View>
        <PanGestureHandler onGestureEvent={panHandler} ref={panRef} simultaneousHandlers={[pinchRef, longPressRef]}>
          <Animated.View style={style}>
            <PinchGestureHandler onGestureEvent={pinchHandler} ref={pinchRef} simultaneousHandlers={[panRef, longPressRef]}>
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
      </Animated.View>
    </LongPressGestureHandler>
  );
};

export default function TemplePreviewScreen() {
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({});
  const [selectedStyle, setSelectedStyle] = useState<string>('temple1');
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  // Modal state for scaling
  const [scaleModal, setScaleModal] = useState<{ key: string; currentScale: number; setScale: (s: number) => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgGradient, setBgGradient] = useState(["#8B5CF6", "#7C3AED", "#6D28D9"]);
  const router = useRouter();

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
        } catch {}
      }
      // Merge: keep state for present deities, add new, remove missing
      const deityKeys = Object.keys(loadedDeities);
      const mergedState = deityKeys.map((key, idx) => {
        const found = loadedState.find(d => d.key === key);
        return found || { key, x: -60 + idx * 80, y: 0, scale: 3 };
      });
      setDeityState(mergedState);
      setLoading(false);
    })();
  }, []);

  // When selectedDeities changes, only add new or remove missing, never overwrite existing state
  useEffect(() => {
    setDeityState(prev => {
      const deityKeys = Object.keys(selectedDeities);
      // Remove missing
      let filtered = prev.filter(d => deityKeys.includes(d.key));
      // Add new
      deityKeys.forEach((key: string, idx: number) => {
        if (!filtered.find(d => d.key === key)) {
          filtered.push({ key, x: -60 + idx * 80, y: 0, scale: 3 });
        }
      });
      return filtered;
    });
  }, [selectedDeities]);

  // Only update AsyncStorage when deityState changes due to user interaction
  useEffect(() => {
    if (deityState.length > 0) {
      AsyncStorage.setItem(DEITY_STATE_KEY, JSON.stringify(deityState));
    }
  }, [deityState]);

  const updateDeityState = (key: string, x: number, y: number, scale: number) => {
    setDeityState(prev => {
      const idx = prev.findIndex(d => d.key === key);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { key, x, y, scale };
        return updated;
      } else {
        return [...prev, { key, x, y, scale }];
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  console.log('temple-preview deityState:', deityState);

  const templeImage = templeStyles.find(t => t.id === selectedStyle)?.image;

  const handleSaveTemple = async () => {
    await AsyncStorage.setItem('templeConfig', JSON.stringify({
      selectedStyle,
      bgGradient,
      selectedDeities,
      deityState,
    }));
    router.push('/');
  };



  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={bgGradient as any}
        style={StyleSheet.absoluteFill}
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
      <Image source={templeImage} style={styles.templeImage} resizeMode="contain" />
      <TouchableOpacity
        style={{ marginTop: 24, backgroundColor: '#FF6A00', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, alignSelf: 'center' }}
        onPress={handleSaveTemple}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Save my temple</Text>
      </TouchableOpacity>
      {Object.keys(selectedDeities).map((key: string, idx: number) => {
        const state = deityState.find(d => d.key === key);
        const x = state ? state.x : -60 + idx * 80;
        const y = state ? state.y : 0;
        const scale = state ? state.scale : 3;
        const transform = [
          { translateX: x },
          { translateY: y },
          { scale: scale },
        ];
        
        // Get the selected statue URL for this deity
        const selectedStatueUrl = selectedDeities[key];
        console.log('temple-preview', key, 'selectedStatueUrl:', selectedStatueUrl, { x, y, scale, transform });
        
        // Use the actual selected statue image
        const statueImage = getImageSource(selectedStatueUrl);
        
        return (
          <DraggableDeity
            key={key}
            source={statueImage}
            initialX={x}
            initialY={y}
            initialScale={scale}
            onLongPress={(setScale, currentScale) => {
              setScaleModal({ key, currentScale, setScale });
            }}
            onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
          />
        );
      })}
      
      {/* Scale Modal */}
      <Modal
        visible={scaleModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setScaleModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scale Deity</Text>
            <Text style={styles.scaleValue}>
              {scaleModal ? `${Math.round(scaleModal.currentScale * 100)}%` : '100%'}
            </Text>
            
            <View style={styles.scaleButtons}>
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => {
                  if (scaleModal) {
                    const newScale = Math.max(0.5, scaleModal.currentScale - 0.2);
                    scaleModal.setScale(newScale);
                    setScaleModal({ ...scaleModal, currentScale: newScale });
                  }
                }}
              >
                <Text style={styles.scaleButtonText}>-20%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => {
                  if (scaleModal) {
                    const newScale = Math.max(0.5, scaleModal.currentScale - 0.1);
                    scaleModal.setScale(newScale);
                    setScaleModal({ ...scaleModal, currentScale: newScale });
                  }
                }}
              >
                <Text style={styles.scaleButtonText}>-10%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => {
                  if (scaleModal) {
                    const newScale = Math.min(5, scaleModal.currentScale + 0.1);
                    scaleModal.setScale(newScale);
                    setScaleModal({ ...scaleModal, currentScale: newScale });
                  }
                }}
              >
                <Text style={styles.scaleButtonText}>+10%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => {
                  if (scaleModal) {
                    const newScale = Math.min(5, scaleModal.currentScale + 0.2);
                    scaleModal.setScale(newScale);
                    setScaleModal({ ...scaleModal, currentScale: newScale });
                  }
                }}
              >
                <Text style={styles.scaleButtonText}>+20%</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setScaleModal(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
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
  templeImage: {
    width: screenWidth * 1.38,
    height: undefined,
    aspectRatio: 1.2,
    marginBottom: 20,
  },
  deityOverlay: {
    position: 'absolute',
    top: 180,
    width: 72,
    height: 72,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  scaleValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 20,
  },
  scaleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  scaleButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  scaleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 