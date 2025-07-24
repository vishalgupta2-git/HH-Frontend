import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

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

const deityList = [
  { key: 'ganesh', label: 'Ganesh Ji', icon: '🕉️' },
  { key: 'vishnu', label: 'Vishnu Ji', icon: '🙏' },
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

// Helper for draggable/scalable deity overlay
type DraggableDeityProps = {
  source: any;
  initialX: number;
  initialY: number;
  initialScale?: number;
};

const DraggableDeity: React.FC<DraggableDeityProps> = ({ source, initialX, initialY, initialScale = 1 }) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const lastScale = useSharedValue(initialScale);

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
            <Image source={source} style={{ width: 72, height: 72 }} resizeMode="contain" />
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function CreateTempleScreen() {
  const [modal, setModal] = useState<null | 'temple' | 'deities' | 'background' | 'lights'>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id); // Temple1 by default
  const [bgGradient, setBgGradient] = useState(gradientPresets[0]);
  const [selectedDeity, setSelectedDeity] = useState([deityList[0].key]);
  const [deityError, setDeityError] = useState('');

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
      <View style={styles.content}>
        {/* Deity overlays in front of temple */}
        {/* Temple image chosen by user */}
        <Image
          source={templeStyles.find(t => t.id === selectedStyle)?.image}
          style={styles.mainTempleImage}
          resizeMode="contain"
        />
        {/* Circular buttons row */}
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setModal('temple')}>
              <Image source={require('@/assets/images/temple/Temple1.png')} style={styles.circleButtonImage} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.buttonFooter}>Temple</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setModal('deities')}>
              <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.circleButtonImage} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.buttonFooter}>Deities</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setModal('background')}>
              <LinearGradient colors={bgGradient as any} style={styles.gradientCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            </TouchableOpacity>
            <Text style={styles.buttonFooter}>Background</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setModal('lights')}>
              <MaterialCommunityIcons name="lightbulb" size={40} color="#FF6A00" />
            </TouchableOpacity>
            <Text style={styles.buttonFooter}>Lights</Text>
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
                    <Text style={styles.modalTitle}>Deities</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModal(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.deityGrid}>
                    {deityList.map((deity) => {
                      const isSelected = selectedDeity.includes(deity.key);
                      return (
                        <TouchableOpacity
                          key={deity.key}
                          style={styles.deityOption}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedDeity(selectedDeity.filter(k => k !== deity.key));
                            } else if (selectedDeity.length < 3) {
                              setSelectedDeity([...selectedDeity, deity.key]);
                            } else {
                              setDeityError('Only 3 deities allowed');
                              setTimeout(() => setDeityError(''), 2000);
                            }
                          }}
                        >
                          <View style={[styles.deityIconCircle, isSelected && styles.deityIconCircleSelected]}>
                            {deity.key === 'ganesh' ? (
                              <Image source={require('@/assets/images/temple/Ganesha1.png')} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="contain" />
                            ) : deity.key === 'vishnu' ? (
                              <View style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={require('@/assets/images/temple/VishnuIcon.png')} style={{ width: 36, height: 36 }} resizeMode="cover" />
                              </View>
                            ) : (
                              <Text style={styles.deityIcon}>{deity.icon}</Text>
                            )}
                            {isSelected && (
                              <View style={styles.deityCheckmark}>
                                <MaterialCommunityIcons name="check-circle" size={22} color="#FF6A00" />
                              </View>
                            )}
                          </View>
                          <Text style={styles.deityLabel}>{deity.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {deityError ? (
                    <Text style={styles.deityError}>{deityError}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={{ width: 240, height: 180, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                    {modal === 'lights' && 'Lights Modal'}
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
}); 