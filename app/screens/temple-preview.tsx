import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { saveTempleConfiguration, loadTempleConfiguration, checkUserAuthentication, loadTempleFromDatabase } from '@/utils/templeUtils';

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

      // Draggable/scalable deity overlay
   const DraggableDeity: React.FC<{
     source?: any;
     emoji?: string;
     initialX: number;
     initialY: number;
     initialScale?: number;
     size?: number;
     label?: string;
     onMoveOrScale?: (x: number, y: number, scale: number) => void;
   }> = ({ source, emoji, initialX, initialY, initialScale = 1, size = 72, label, onMoveOrScale }) => {
           const translateX = useSharedValue(initialX);
      const translateY = useSharedValue(initialY);
      const scale = useSharedValue(initialScale);
      const lastScale = useSharedValue(initialScale);
      const panRef = React.useRef(null);
      const pinchRef = React.useRef(null);

            // Update shared values when props change
      React.useEffect(() => {
        translateX.value = initialX;
        translateY.value = initialY;
        scale.value = initialScale;
        lastScale.value = initialScale;
      }, [initialX, initialY, initialScale]);

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
     zIndex: 20, // Increased to be above temple and gradient area
   }));

        return (
     <Animated.View>
       <PanGestureHandler onGestureEvent={panHandler} ref={panRef} simultaneousHandlers={[pinchRef]}>
         <Animated.View style={style}>
           <PinchGestureHandler onGestureEvent={pinchHandler} ref={pinchRef} simultaneousHandlers={[panRef]}>
             <Animated.View>
               {source ? (
                 <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
               ) : (
                 <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF6A00' }}>
                   <Text style={{ fontSize: size * 0.6 }}>{emoji}</Text>
                 </View>
               )}
             </Animated.View>
           </PinchGestureHandler>
         </Animated.View>
       </PanGestureHandler>
     </Animated.View>
   );
};

export default function TemplePreviewScreen() {
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({});
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [deityState, setDeityState] = useState<{ key: string; x: number; y: number; scale: number }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [bgGradient, setBgGradient] = useState(["#8B5CF6", "#7C3AED", "#6D28D9"]);
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
              case 'templeBellIcon2.png':
          return require('@/assets/images/temple/templeBellIcon2.png');
      case 'arch.svg':
        return require('@/assets/images/temple/arch.svg');
      default:
        return require('@/assets/images/temple/Ganesha1.png');
    }
  };

  // Function to load temple configuration with proper priority: DB -> AsyncStorage -> Defaults
  const loadTempleConfig = useCallback(async () => {
    try {
      // Loading temple configuration
      
      // First check if user is authenticated
      const { isAuthenticated, userData } = await checkUserAuthentication();
      
      let templeConfig = null;
      
      if (isAuthenticated) {
        // User is logged in - try to load from database first
        try {
          const dbTemple = await loadTempleFromDatabase();
          if (dbTemple) {
            // Temple found in database
            templeConfig = dbTemple;
          } else {
            // No temple in database, falling back to AsyncStorage
          }
        } catch (error) {
          // Database load failed, falling back to AsyncStorage
        }
      }
      
      // If no database temple, try AsyncStorage
      if (!templeConfig) {
        // Loading from AsyncStorage
        templeConfig = await loadTempleConfiguration();
      }
      
      if (templeConfig) {
        // Temple configuration loaded successfully
        
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
          
          // Debug: Check if deityState keys match selectedDeities keys
          if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
            const deityStateKeys = templeConfig.deityState.map((d: any) => d.key);
            const selectedDeityKeys = Object.keys(deities);
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
        } else {
          // No temple style found
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
        } else {
          // No background gradient found
        }
        
        // Load deity state (positions, scales, sizes) - this is crucial for deity positioning
        if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
          setDeityState(templeConfig.deityState);
        } else if (templeConfig.templeInformation && templeConfig.templeInformation.deityState && Array.isArray(templeConfig.templeInformation.deityState)) {
          // Check if deityState is nested in templeInformation (database structure)
          setDeityState(templeConfig.templeInformation.deityState);
        } else {
          // No deity state found or invalid format
        }
        
        // Temple configuration applied successfully
      } else {
        // No temple configuration found anywhere, using defaults
      }
    } catch (error) {
      console.error('Error loading temple configuration:', error);
    }
  }, []);

  // On mount, load and merge state with enhanced loading logic
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
            } else {

            }
          } catch (error) {

          }
        }
        
        // If no database temple, try AsyncStorage
        if (!templeConfig) {

          templeConfig = await loadTempleConfiguration();
        }
        
        if (templeConfig) {

          
          // Load from configuration - check multiple possible locations for deities
          let deities = null;
          
          // Check database structure first (if loaded from database)
          if (templeConfig.templeInformation && templeConfig.templeInformation.selectedDeities) {
            deities = templeConfig.templeInformation.selectedDeities;
          } else if (templeConfig.deities) {
            deities = templeConfig.deities;
          } else if (templeConfig.selectedDeities) {
            deities = templeConfig.selectedDeities;
          }
          
          if (deities && Object.keys(deities).length > 0) {
            setSelectedDeities(deities);

            
            // Debug: Check if deityState keys match selectedDeities keys
            if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
              const deityStateKeys = templeConfig.deityState.map((d: any) => d.key);
              const selectedDeityKeys = Object.keys(deities);

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

          } else {

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

          } else {

          }
          
          // Load deity state (positions, scales, sizes) - this is crucial for deity positioning
          if (templeConfig.deityState && Array.isArray(templeConfig.deityState)) {
            setDeityState(templeConfig.deityState);

          } else if (templeConfig.templeInformation && templeConfig.templeInformation.deityState && Array.isArray(templeConfig.templeInformation.deityState)) {
            // Check if deityState is nested in templeInformation (database structure)
            setDeityState(templeConfig.templeInformation.deityState);

          } else {

          }
          

        } else {

          // Set default values
          setSelectedStyle('temple1');
          setBgGradient(['#8B5CF6', '#7C3AED', '#6D28D9']);
          setSelectedDeities({});
          setDeityState([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading temple configuration:', error);
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

   // Handle deityState changes to ensure proper rendering
   useEffect(() => {

   }, [deityState]);

  // Note: No automatic saving - only save when user clicks "Done, Go back" button

  const updateDeityState = (key: string, x: number, y: number, scale: number) => {
    // Save positions directly as they are in the full screen scrollable area
    setDeityState(prev => {
      const idx = prev.findIndex(d => d.key === key);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { key, x, y, scale }; // Save position directly
        return updated;
      } else {
        const newState = [...prev, { key, x, y, scale }]; // Save position directly
        return newState;
      }
    });
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

  const handleSaveTemple = async () => {
    try {
      const templeConfig = {
        selectedStyle,
        bgGradient,
        selectedDeities,
        deityState,
      };

      const success = await saveTempleConfiguration(templeConfig);
      

      
      router.back();
         } catch (error: any) {
          console.error('❌ [TEMPLE PREVIEW] Error saving temple configuration:', error);
        }
  };

  return (
    <View style={styles.container}>
      {/* Purple Gradient Background (dynamic) */}
      <LinearGradient
        colors={bgGradient as any}
        style={styles.purpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Invisible Screen-Sized Box for Deities */}
      <View style={styles.deityContainer}>
        {/* Deities positioned in screen-sized container */}
        {Object.keys(selectedDeities).length > 0 ? (
          Object.keys(selectedDeities).map((key: string, idx: number) => {
            const selectedStatueUrl = selectedDeities[key];
            const statueImage = getImageSource(selectedStatueUrl);
            
            // Find saved position and scale for this deity
            const savedDeity = deityState.find(d => d.key === key);
            

            
            // Use saved coordinates or default
            const initialX = savedDeity?.x ?? (50 + idx * 100);
            const initialY = savedDeity?.y ?? (300 + idx * 100);
            const initialScale = savedDeity?.scale ?? 2;
            
            return (
              <DraggableDeity
                key={`${key}-${deityState.length}`}
                source={statueImage}
                initialX={initialX}
                initialY={initialY}
                initialScale={initialScale}
                size={60}
                label={deityList.find(d => d.key === key)?.label || key}
                
                onMoveOrScale={(x, y, scale) => updateDeityState(key, x, y, scale)}
              />
            );
          })
        ) : (
          // Show test deities if none are selected
          <>
            {(() => {
              const testGanesha = deityState.find(d => d.key === 'test-ganesha');
              const testKrishna = deityState.find(d => d.key === 'test-krishna');
              
              return (
                <>
                  <DraggableDeity
                    key={`test-ganesha-${deityState.length}`}
                    source={require('@/assets/images/temple/Ganesha1.png')}
                    initialX={testGanesha?.x ?? 50}
                    initialY={testGanesha?.y ?? 300}
                    initialScale={testGanesha?.scale ?? 2}
                    size={60}
                    label="Test Ganesha"
                    
                    onMoveOrScale={(x, y, scale) => updateDeityState('test-ganesha', x, y, scale)}
                  />
                  <DraggableDeity
                    key={`test-krishna-${deityState.length}`}
                    source={require('@/assets/images/temple/Krishna1.png')}
                    initialX={testKrishna?.x ?? 150}
                    initialY={testKrishna?.y ?? 300}
                    initialScale={testKrishna?.scale ?? 2}
                    size={60}
                    label="Test Krishna"
                    
                    onMoveOrScale={(x, y, scale) => updateDeityState('test-krishna', x, y, scale)}
                  />
                </>
              );
            })()}
          </>
        )}
      </View>
      
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
      
      {/* Transparent area for save button */}
      <View 
        style={styles.scrollableArea}
      >
       <View style={styles.scrollableContent}>
         {/* Display selected deity images */}
         <View style={styles.deityRow}>
           {/* Deity selection row - now just for display */}
         </View>
       
         <TouchableOpacity
           style={styles.saveButton}
           onPress={() => {
         
             handleSaveTemple();
           }}
         >
           <Text style={styles.saveButtonText}>Done, Go back</Text>
         </TouchableOpacity>
         
         
       </View>
      </View>
      {/* Removed duplicate draggable deities since they're now in the full screen scrollable area */}
    
    
  </View>
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
    top: 640, // Moved down by 100 pixels from 540
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
  deityContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // Above temple but below bells and arch
  },
}); 

export const options = { headerShown: false }; 