import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  onLongPress?: (showMenu: boolean, x: number, y: number, setScale: (s: number) => void, currentScale: number) => void;
  onMoveOrScale?: (x: number, y: number, scale: number) => void;
}> = ({ source, emoji, initialX, initialY, initialScale = 1, onLongPress, onMoveOrScale }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const lastScale = useSharedValue(initialScale);
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

  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === GestureState.ACTIVE) {
      if (onLongPress) onLongPress(true, event.nativeEvent.absoluteX, event.nativeEvent.absoluteY, (s) => { scale.value = s; }, scale.value);
    }
  };

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

export default function DailyPujaCustomTemple() {
  const [selectedDeity, setSelectedDeity] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('temple1');
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  const [menu, setMenu] = useState<{ key: string; x: number; y: number; setScale: (s: number) => void; currentScale: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgGradient, setBgGradient] = useState(["#8B5CF6", "#7C3AED", "#6D28D9"]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const deitiesStr = await AsyncStorage.getItem(SELECTED_DEITIES_KEY);
      let loadedDeities: string[] = [];
      if (deitiesStr) {
        try {
          loadedDeities = JSON.parse(deitiesStr);
          setSelectedDeity(loadedDeities);
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
      const mergedState = (loadedDeities.length ? loadedDeities : selectedDeity).map((key, idx) => {
        const found = loadedState.find(d => d.key === key);
        return found || { key, x: -60 + idx * 80, y: 0, scale: 3 };
      });
      setDeityState(mergedState);
      setLoading(false);
    })();
  }, []);

  // When selectedDeity changes, only add new or remove missing, never overwrite existing state
  useEffect(() => {
    setDeityState(prev => {
      // Remove missing
      let filtered = prev.filter(d => selectedDeity.includes(d.key));
      // Add new
      selectedDeity.forEach((key, idx) => {
        if (!filtered.find(d => d.key === key)) {
          filtered.push({ key, x: -60 + idx * 80, y: 0, scale: 3 });
        }
      });
      return filtered;
    });
  }, [selectedDeity]);

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

  const templeImage = templeStyles.find(t => t.id === selectedStyle)?.image;

  const handleSaveTemple = async () => {
    await AsyncStorage.setItem('templeConfig', JSON.stringify({
      selectedStyle,
      bgGradient,
      selectedDeity,
      deityState,
    }));
    router.push('/');
  };

  // Menu for scaling
  const renderMenu = () => menu && (
    <View style={{ position: 'absolute', left: menu.x, top: menu.y, backgroundColor: '#fff', borderRadius: 8, padding: 8, elevation: 8, zIndex: 100 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Scale</Text>
      <Text style={{ padding: 4 }} onPress={() => { menu.setScale(menu.currentScale * 1.2); setMenu(null); }}>Up 20%</Text>
      <Text style={{ padding: 4 }} onPress={() => { menu.setScale(menu.currentScale * 1.5); setMenu(null); }}>Up 50%</Text>
      <Text style={{ padding: 4 }} onPress={() => { menu.setScale(menu.currentScale * 0.8); setMenu(null); }}>Down 20%</Text>
      <Text style={{ padding: 4 }} onPress={() => { menu.setScale(menu.currentScale * 0.5); setMenu(null); }}>Down 50%</Text>
      <Text style={{ color: '#FF6A00', marginTop: 4 }} onPress={() => setMenu(null)}>Cancel</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgGradient as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
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
      <ArchSVG width={screenWidth} height={(screenWidth * 195) / 393} style={styles.archImage} />
      <Image source={templeImage} style={styles.templeImage} resizeMode="contain" />
      <TouchableOpacity
        style={{ marginTop: 24, backgroundColor: '#FF6A00', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, alignSelf: 'center' }}
        onPress={handleSaveTemple}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Save my temple</Text>
      </TouchableOpacity>
      {selectedDeity.map((key, idx) => {
        const state = deityState.find(d => d.key === key);
        const x = state ? state.x : -60 + idx * 80;
        const y = state ? state.y : 0;
        const scale = state ? state.scale : 3;
        if (key === 'ganesh') {
          return (
            <DraggableDeity
              key={key}
              source={require('@/assets/images/temple/Ganesha1.png')}
              initialX={x}
              initialY={y}
              initialScale={scale}
              onLongPress={(show, x, y, setScale, currentScale) => {
                if (show) setMenu({ key, x, y, setScale, currentScale });
              }}
              onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
            />
          );
        } else if (key === 'vishnu') {
          return (
            <DraggableDeity
              key={key}
              source={require('@/assets/images/temple/Vishnu1.png')}
              initialX={x}
              initialY={y}
              initialScale={scale}
              onLongPress={(show, x, y, setScale, currentScale) => {
                if (show) setMenu({ key, x, y, setScale, currentScale });
              }}
              onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
            />
          );
        } else if (key === 'krishna' || key === 'radha') {
          return (
            <DraggableDeity
              key={key}
              source={require('@/assets/images/temple/Krishna1.png')}
              initialX={x}
              initialY={y}
              initialScale={scale}
              onLongPress={(show, x, y, setScale, currentScale) => {
                if (show) setMenu({ key, x, y, setScale, currentScale });
              }}
              onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
            />
          );
        } else {
          const deity = deityList.find(d => d.key === key);
          return (
            <DraggableDeity
              key={key}
              emoji={deity?.icon || '?'}
              initialX={x}
              initialY={y}
              initialScale={scale}
              onLongPress={(show, x, y, setScale, currentScale) => {
                if (show) setMenu({ key, x, y, setScale, currentScale });
              }}
              onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
            />
          );
        }
      })}
      {renderMenu()}
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
  deityImage: {
    position: 'absolute',
    width: 72,
    height: 72,
    zIndex: 10,
  },
}); 