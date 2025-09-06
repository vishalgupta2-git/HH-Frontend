import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback, ScrollView, Image, Alert } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient, Line } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { loadTempleConfigurationNewStyle, saveTempleConfigurationNewStyle, checkUserAuthentication } from '@/utils/templeUtils';

export const options = { headerShown: false };

const { width: screenWidth, height: screenHeight, scale } = Dimensions.get('window');


// Function to get temple image dimensions
const getTempleImageDimensions = (templeId: string) => {
  const templeImageSources = {
    temple1: require('@/assets/images/temple/Temple1_new.png'),
    temple2: require('@/assets/images/temple/Temple2_new.png'),
    temple3: require('@/assets/images/temple/Temple3.png'),
  };

  return new Promise<{width: number, height: number}>((resolve, reject) => {
    Image.getSize(
      Image.resolveAssetSource(templeImageSources[templeId as keyof typeof templeImageSources]).uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const templeStyles = [
  {
    id: 'temple3',
    image: require('@/assets/images/temple/Temple3.png'),
  },
  {
    id: 'temple1',
    image: require('@/assets/images/temple/Temple1_new.png'),
  },
  {
    id: 'temple2', 
    image: require('@/assets/images/temple/Temple2_new.png'),
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

function GridSVG(props: { width?: number; height?: number; style?: any }) {
  const width = props.width || screenWidth;
  const height = props.height || screenHeight;
  
  // Grid lines every 10% of width and height
  const verticalSpacing = width / 10; // 10% of width
  const horizontalSpacing = height / 10; // 10% of height
  
  // Calculate number of lines needed (10 lines for 10% spacing)
  const verticalLines = 10;
  const horizontalLines = 10;
  
  // Generate vertical lines with alternating colors
  const verticalLineElements = [];
  for (let i = 0; i <= verticalLines; i++) {
    const x = i * verticalSpacing;
    const strokeColor = i % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
    verticalLineElements.push(
      <Line
        key={`v-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }
  
  // Generate horizontal lines with alternating colors
  const horizontalLineElements = [];
  for (let i = 0; i <= horizontalLines; i++) {
    const y = i * horizontalSpacing;
    const strokeColor = i % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
    horizontalLineElements.push(
      <Line
        key={`h-${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }
  
  return (
    <Svg
      width={width}
      height={height}
      style={props.style}
    >
      {verticalLineElements}
      {horizontalLineElements}
    </Svg>
  );
}

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

export default function TestTempleScreen() {
  const router = useRouter();
  
  // State management for temple configuration
  const [modal, setModal] = useState<null | 'temple' | 'deities' | 'background' | 'statues'>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(templeStyles[0].id);
  const [bgGradient, setBgGradient] = useState(gradientPresets[0]);
  const [selectedDeities, setSelectedDeities] = useState<{[deityId: string]: string}>({}); // deityId -> statueUrl
  const [deityError, setDeityError] = useState('');
  const [deityData, setDeityData] = useState<DeityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeityForStatues, setSelectedDeityForStatues] = useState<DeityData | null>(null);
  const [templeDimensions, setTempleDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  // State management: 'puja' | 'configuringTemple'
  const [templeState, setTempleState] = useState<'puja' | 'configuringTemple'>('puja');
  
  // Wizard state management
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDeityForEdit, setSelectedDeityForEdit] = useState<string | null>(null);
  const [showDeityDropdown, setShowDeityDropdown] = useState(false);
  
  // Deity editing state
  const [deityPositions, setDeityPositions] = useState<{[deityId: string]: {x: number, y: number}}>({});
  const [deitySizes, setDeitySizes] = useState<{[deityId: string]: {width: number, height: number}}>({});
  
  // Continuous press state
  const [isPressing, setIsPressing] = useState<{
    sizeIncrease: boolean;
    sizeDecrease: boolean;
    positionLeft: boolean;
    positionRight: boolean;
    positionUp: boolean;
    positionDown: boolean;
  }>({
    sizeIncrease: false,
    sizeDecrease: false,
    positionLeft: false,
    positionRight: false,
    positionUp: false,
    positionDown: false,
  });
  
  // Debug modal state changes
  React.useEffect(() => {
    console.log('Modal state changed to:', modal);
  }, [modal]);
  
  // Debug temple state changes
  React.useEffect(() => {
    console.log('Temple state changed to:', templeState);
  }, [templeState]);
  
  // Save temple configuration
  const saveTempleConfig = async () => {
    try {
      const templeConfig = {
        selectedStyle,
        bgGradient,
        selectedDeities,
        deityPositions,
        deitySizes
      };
      
      const success = await saveTempleConfigurationNewStyle(templeConfig);
      if (success) {
        console.log('Temple configuration saved successfully');
      } else {
        console.error('Failed to save temple configuration');
      }
    } catch (error) {
      console.error('Error saving temple configuration:', error);
    }
  };

  // Reset wizard when entering configuringTemple mode
  React.useEffect(() => {
    if (templeState === 'configuringTemple') {
      setWizardStep(1);
    } else {
      // Clear selected deity when exiting configuring mode
      setSelectedDeityForEdit(null);
      setShowDeityDropdown(false);
    }
  }, [templeState]);
  
  // Flashing animation state
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Flash animation for current step icon
  React.useEffect(() => {
    if (templeState === 'configuringTemple') {
      const interval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [templeState, wizardStep]);
  
  // Initialize deity positions and sizes when NEW deities are selected
  React.useEffect(() => {
    const newPositions: {[deityId: string]: {x: number, y: number}} = {...deityPositions};
    const newSizes: {[deityId: string]: {width: number, height: number}} = {...deitySizes};
    
    let hasNewDeities = false;
    
    Object.entries(selectedDeities).forEach(([deityId, statueUrl], index) => {
      // Only initialize if this deity doesn't already have position/size data
      if (!deityPositions[deityId] || !deitySizes[deityId]) {
        hasNewDeities = true;
        
        // Calculate initial position: 10%, 40%, 70% from left
        const leftPositions = [0.1, 0.4, 0.7];
        const leftPosition = leftPositions[index] || 0.1;
        
        // Initial size: 30% screen width
        const initialImageWidth = screenWidth * 0.3;
        const initialImageHeight = initialImageWidth * 1.2;
        
        // Vertical position: 70% screen height - calculated image height
        const initialTopPosition = (screenHeight * 0.7) - initialImageHeight;
        
        newPositions[deityId] = {
          x: screenWidth * leftPosition,
          y: initialTopPosition
        };
        
        newSizes[deityId] = {
          width: initialImageWidth,
          height: initialImageHeight
        };
      }
    });
    
    // Only update state if there are new deities to initialize
    if (hasNewDeities) {
      setDeityPositions(newPositions);
      setDeitySizes(newSizes);
    }
  }, [selectedDeities]);
  
  // Control functions
  const handleSizeChange = (direction: 'increase' | 'decrease') => {
    if (!selectedDeityForEdit) return;
    
    const currentSize = deitySizes[selectedDeityForEdit] || { width: screenWidth * 0.3, height: screenWidth * 0.36 };
    const scaleFactor = direction === 'increase' ? 1.05 : 0.95; // 5% change
    
    const newWidth = currentSize.width * scaleFactor;
    const newHeight = currentSize.height * scaleFactor;
    
    setDeitySizes(prev => ({
      ...prev,
      [selectedDeityForEdit]: { width: newWidth, height: newHeight }
    }));
  };
  
  const handlePositionChange = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!selectedDeityForEdit) return;
    
    const currentPosition = deityPositions[selectedDeityForEdit] || { x: screenWidth * 0.1, y: screenHeight * 0.7 };
    const moveAmount = 5; // 5 pixels
    
    let newX = currentPosition.x;
    let newY = currentPosition.y;
    
    switch (direction) {
      case 'left':
        newX = Math.max(0, currentPosition.x - moveAmount);
        break;
      case 'right':
        newX = Math.min(screenWidth - (deitySizes[selectedDeityForEdit]?.width || screenWidth * 0.3), currentPosition.x + moveAmount);
        break;
      case 'up':
        newY = Math.max(0, currentPosition.y - moveAmount);
        break;
      case 'down':
        newY = Math.min(screenHeight - (deitySizes[selectedDeityForEdit]?.height || screenWidth * 0.36), currentPosition.y + moveAmount);
        break;
    }
    
    setDeityPositions(prev => ({
      ...prev,
      [selectedDeityForEdit]: { x: newX, y: newY }
    }));
  };
  
  // Continuous press handlers
  const startContinuousPress = (action: keyof typeof isPressing) => {
    if (!selectedDeityForEdit) return;
    
    setIsPressing(prev => ({ ...prev, [action]: true }));
  };
  
  const stopContinuousPress = (action: keyof typeof isPressing) => {
    setIsPressing(prev => ({ ...prev, [action]: false }));
  };
  
  // Continuous press effect
  React.useEffect(() => {
    if (!selectedDeityForEdit) return;
    
    const interval = setInterval(() => {
      if (isPressing.sizeIncrease) {
        handleSizeChange('increase');
      }
      if (isPressing.sizeDecrease) {
        handleSizeChange('decrease');
      }
      if (isPressing.positionLeft) {
        handlePositionChange('left');
      }
      if (isPressing.positionRight) {
        handlePositionChange('right');
      }
      if (isPressing.positionUp) {
        handlePositionChange('up');
      }
      if (isPressing.positionDown) {
        handlePositionChange('down');
      }
    }, 100); // 100ms interval for smooth continuous action
    
    return () => clearInterval(interval);
  }, [isPressing, selectedDeityForEdit, deitySizes, deityPositions]);


  // Load temple configuration on component mount
  useEffect(() => {
    const loadTempleConfig = async () => {
      try {
        const templeConfig = await loadTempleConfigurationNewStyle();
        
        if (templeConfig) {
          // Check if templeConfig has templeInformation field (from database)
          const configData = templeConfig.templeInformation || templeConfig;
          
          // Load temple style
          if (configData.selectedStyle) {
            setSelectedStyle(configData.selectedStyle);
          }
          
          // Load background gradient
          if (configData.bgGradient) {
            setBgGradient(configData.bgGradient);
          }
          
          // Load selected deities
          if (configData.selectedDeities) {
            setSelectedDeities(configData.selectedDeities);
          }
          
          // Load deity positions and sizes
          if (configData.deityPositions) {
            setDeityPositions(configData.deityPositions);
          }
          if (configData.deitySizes) {
            setDeitySizes(configData.deitySizes);
          }
        }
      } catch (error) {
        console.error('Error loading temple configuration:', error);
      }
    };

    loadTempleConfig();
  }, []);

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

  // Load temple image dimensions
  useEffect(() => {
    const loadTempleDimensions = async () => {
      const dimensions: {[key: string]: {width: number, height: number}} = {};
      
      for (const temple of templeStyles) {
        try {
          const dims = await getTempleImageDimensions(temple.id);
          dimensions[temple.id] = dims;
          console.log(`${temple.id} dimensions:`, dims);
        } catch (error) {
          console.error(`Failed to get dimensions for ${temple.id}:`, error);
        }
      }
      
      setTempleDimensions(dimensions);
    };
    
    loadTempleDimensions();
  }, []);

  // Debug: Log screen dimensions
  console.log('Screen dimensions:', {
    width: screenWidth,
    height: screenHeight,
    scale: scale,
    verticalSpacing: screenWidth / 10,
    horizontalSpacing: screenHeight / 10,
    verticalLines: 10,
    horizontalLines: 10
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={bgGradient as any}
        style={styles.purpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Grid overlay */}
      <GridSVG width={screenWidth} height={screenHeight} style={styles.gridOverlay} />
      
      {/* Arch on top */}
      <ArchSVG width={screenWidth} height={(screenWidth * 295) / 393} style={styles.archImage} />
      
      {/* Temple Display */}
      {templeDimensions[selectedStyle] && (
        <Image
          source={templeStyles.find(t => t.id === selectedStyle)?.image}
          style={[styles.templeDisplay, {
            width: screenWidth * 0.95,
            height: (() => {
              const availableScreenWidth = screenWidth * 0.95;
              const imageWidth = templeDimensions[selectedStyle].width;
              const imageHeight = templeDimensions[selectedStyle].height;
              const templeScale = availableScreenWidth / imageWidth;
              return templeScale * imageHeight;
            })(),
            left: '50%',
            transform: [
              { translateX: -screenWidth * 0.475 },
              { translateY: (() => {
                const availableScreenWidth = screenWidth * 0.95;
                const imageWidth = templeDimensions[selectedStyle].width;
                const imageHeight = templeDimensions[selectedStyle].height;
                const templeScale = availableScreenWidth / imageWidth;
                const templeHeight = templeScale * imageHeight;
                return (screenHeight * 0.75) - templeHeight;
              })()
            }]
          }]}
          resizeMode="stretch"
        />
      )}
      
      {/* Selected Deities Display */}
              {Object.entries(selectedDeities).map(([deityId, statueUrl], index) => {
          const deity = deityData.find(d => d._id === deityId);
          if (!deity) return null;

          // Get current position and size from state, or use defaults
          const currentPosition = deityPositions[deityId] || { 
            x: screenWidth * 0.1, 
            y: screenHeight * 0.7 
          };
          const currentSize = deitySizes[deityId] || { 
            width: screenWidth * 0.3, 
            height: screenWidth * 0.36 
          };


          return (
            <View
              key={deityId}
              style={[styles.selectedDeityImageContainer, {
                position: 'absolute',
                left: currentPosition.x,
                top: currentPosition.y,
                width: currentSize.width,
                height: currentSize.height,
                // Highlight selected deity for editing (only in step 4)
                borderWidth: (wizardStep === 4 && selectedDeityForEdit === deityId) ? 2 : 0,
                borderColor: (wizardStep === 4 && selectedDeityForEdit === deityId) ? '#FF6A00' : 'transparent',
              }]}
            >
            <TouchableOpacity
              onPress={() => {
                // In step 4, select this deity for editing
                if (wizardStep === 4) {
                  setSelectedDeityForEdit(deityId);
                }
              }}
              activeOpacity={0.7}
              style={{ width: '100%', height: '100%' }}
            >
              <Image
                source={getImageSource(statueUrl)}
                style={styles.selectedDeityFullImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        );
      })}
      
      {/* Temple Bells */}
      <Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={styles.templeBells}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/temple/templeBellIcon2.png')}
        style={styles.templeBellsLeft}
        resizeMode="contain"
      />
      
      {/* Temple Configuration Controls */}
      {templeState === 'puja' ? (
        // Create/Modify Temple Button
        <TouchableOpacity
          style={styles.createModifyButton}
          onPress={() => setTempleState('configuringTemple')}
        >
          <Text style={styles.createModifyButtonText}>
            {Object.keys(selectedDeities).length > 0 ? 'Modify my Temple' : 'Create my Temple'}
          </Text>
        </TouchableOpacity>
      ) : templeState === 'configuringTemple' ? (
        <>
          {/* Temple Configuration Icons - Positioned at 50px from top */}
          <View style={styles.templeConfigIconsContainer}>
            <View style={styles.configIconWrapper}>
              <TouchableOpacity 
                style={[
                  styles.configIconItem,
                  wizardStep === 2 && isFlashing && styles.flashingIcon
                ]}
                onPress={() => {
                  console.log('Temple button pressed');
                  setModal('temple');
                }}
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
                style={[
                  styles.configIconItem,
                  wizardStep === 3 && isFlashing && styles.flashingIcon
                ]}
                onPress={() => {
                  console.log('Deity button pressed');
                  setModal('deities');
                }}
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
                style={[
                  styles.configIconItem,
                  wizardStep === 1 && isFlashing && styles.flashingIcon
                ]}
                onPress={() => {
                  console.log('Background button pressed');
                  setModal('background');
                }}
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
          
          {/* Save Temple Button */}
          <TouchableOpacity
            style={styles.saveTempleButton}
            onPress={async () => {
              await saveTempleConfig();
              setTempleState('puja');
            }}
          >
            <Text style={styles.saveTempleButtonText}>Save My Temple</Text>
          </TouchableOpacity>
        </>
      ) : null}
      
      {/* Content */}
      <View style={styles.content}>
      </View>
      
      {/* Wizard Banner - Only show in configuringTemple mode */}
      {templeState === 'configuringTemple' && (
        <TouchableWithoutFeedback onPress={() => setShowDeityDropdown(false)}>
          <View style={styles.wizardBanner}>
          <View style={styles.wizardContent}>
            <Text style={styles.wizardStepText}>
              Step {wizardStep} of 4 - {wizardStep === 1 && 'Select Background'}
              {wizardStep === 2 && 'Select Temple Style'}
              {wizardStep === 3 && 'Select up to 3 Deities'}
              {wizardStep === 4 && 'Adjust Deities Size & Position'}
            </Text>
            
            {/* Step 4: Size and Position Controls */}
            {wizardStep === 4 && (
              <View style={styles.controlsContainer}>
                {/* Size Controls */}
                <View style={styles.sizeControls}>
                  <Image 
                    source={require('@/assets/images/icons/otherIcons/scalingIcon.png')} 
                    style={styles.sizeIcon} 
                    resizeMode="contain" 
                  />
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('sizeIncrease')}
                    onPressOut={() => stopContinuousPress('sizeIncrease')}
                    onPress={() => handleSizeChange('increase')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('sizeDecrease')}
                    onPressOut={() => stopContinuousPress('sizeDecrease')}
                    onPress={() => handleSizeChange('decrease')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>▼</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Position Controls */}
                <View style={styles.positionControls}>
                  <Image 
                    source={require('@/assets/images/icons/otherIcons/positionIcon.png')} 
                    style={styles.positionIcon} 
                    resizeMode="contain" 
                  />
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('positionLeft')}
                    onPressOut={() => stopContinuousPress('positionLeft')}
                    onPress={() => handlePositionChange('left')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('positionRight')}
                    onPressOut={() => stopContinuousPress('positionRight')}
                    onPress={() => handlePositionChange('right')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>→</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('positionUp')}
                    onPressOut={() => stopContinuousPress('positionUp')}
                    onPress={() => handlePositionChange('up')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={!selectedDeityForEdit ? styles.arrowButtonDisabled : styles.arrowButton}
                    onPressIn={() => startContinuousPress('positionDown')}
                    onPressOut={() => stopContinuousPress('positionDown')}
                    onPress={() => handlePositionChange('down')}
                    disabled={!selectedDeityForEdit}
                  >
                    <Text style={[styles.arrowText, !selectedDeityForEdit && { color: '#999' }]}>↓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Step 4: Deity Dropdown */}
            {wizardStep === 4 && (
              <View style={styles.deityDropdownContainer}>
                <TouchableOpacity 
                  style={styles.deityDropdown}
                  onPress={() => setShowDeityDropdown(true)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedDeityForEdit 
                      ? (() => {
                          const deity = deityData.find(d => d._id === selectedDeityForEdit);
                          return deity ? deity.Deity?.Name || 'Unknown Deity' : 'Unknown Deity';
                        })()
                      : 'Select a deity to edit...'
                    }
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Action Buttons */}
            <View style={styles.wizardButtonsContainer}>
              {/* Back Button - Only show if not on step 1 */}
              {wizardStep > 1 && (
                <TouchableOpacity
                  style={styles.wizardBackButton}
                  onPress={() => {
                    setWizardStep((wizardStep - 1) as 1 | 2 | 3 | 4);
                  }}
                >
                  <Text style={styles.wizardBackButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {/* Next/Save Button */}
              <TouchableOpacity
                style={[
                  styles.wizardActionButton,
                  {
                    opacity: (
                      wizardStep === 1 || // Always allow step 1
                      wizardStep === 2 || // Always allow step 2
                      (wizardStep === 3 && Object.keys(selectedDeities).length > 0) || // Step 3 if at least 1 deity
                      wizardStep === 4 // Always allow step 4
                    ) ? 1 : 0.5
                  }
                ]}
                onPress={async () => {
                  if (wizardStep < 4) {
                    setWizardStep((wizardStep + 1) as 1 | 2 | 3 | 4);
                  } else {
                    // Step 4: Save temple
                    await saveTempleConfig();
                    setTempleState('puja');
                  }
                }}
                disabled={!(
                  wizardStep === 1 || // Always allow step 1
                  wizardStep === 2 || // Always allow step 2
                  (wizardStep === 3 && Object.keys(selectedDeities).length > 0) || // Step 3 if at least 1 deity
                  wizardStep === 4 // Always allow step 4
                )}
              >
                <Text style={styles.wizardActionButtonText}>
                  {wizardStep === 4 ? 'Save' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </TouchableWithoutFeedback>
      )}
      

      {/* Bottom Action Buttons - Only show in puja mode */}
      {templeState === 'puja' && (
        <>
          {/* Perform Puja Button - 79% from top, 90% width, 5% height */}
          <TouchableOpacity
            style={[styles.performPujaButton, {
              top: screenHeight * 0.77,
              width: screenWidth * 0.90,
              height: screenHeight * 0.05,
            }]}
            onPress={() => {
              // Handle perform puja action
              console.log('Perform Puja pressed');
            }}
          >
            <Text style={styles.performPujaButtonText}>Perform Puja</Text>
          </TouchableOpacity>
          
          {/* Second Row Buttons - 83% from top (77% + 5% + 1%), 29% width each, 1.5% spacing */}
          <View style={[styles.secondRowContainer, {
            top: screenHeight * 0.83,
            height: screenHeight * 0.05,
            width: screenWidth * 0.90, // Same width as Perform Puja button
            left: '50%',
            transform: [{ translateX: -screenWidth * 0.45 }], // Center the container
          }]}>
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
              }]}
              onPress={() => {
                console.log('My Temple pressed');
              }}
            >
              <Text style={styles.secondRowButtonText}>My Temple</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
              }]}
              onPress={() => {
                console.log('Today\'s Pujas pressed');
              }}
            >
              <Text style={styles.secondRowButtonText}>Today's Pujas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondRowButton, {
                width: screenWidth * 0.29,
                height: screenHeight * 0.05,
              }]}
              onPress={() => {
                console.log('All Temples pressed');
              }}
            >
              <Text style={styles.secondRowButtonText}>All Temples</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {/* Modal Implementation for Temple Configuration */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal !== null}
        onRequestClose={() => setModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setModal(null)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
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
                <View style={[styles.modalContent, { height: screenHeight * 0.3 }]}>
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
                  <ScrollView 
                    style={styles.deitiesScrollView}
                    showsVerticalScrollIndicator={true}
                  >
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
                  </ScrollView>
                </View>
              ) : modal === 'statues' && selectedDeityForStatues ? (
                <View style={styles.statuesModalContent}>
                  <ScrollView 
                    horizontal
                    style={styles.statuesScrollView}
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.statuesScrollContent}
                  >
                      {selectedDeityForStatues.Deity.Statues.map((statueUrl, index) => {
                        const isSelected = selectedDeities[selectedDeityForStatues._id || ''] === statueUrl;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.statueItemHorizontal, isSelected && styles.statueItemSelected]}
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
                            {isSelected && (
                              <View style={styles.statueCheckmark}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#FF6A00" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
              ) : null}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Deity Selection Modal for Step 4 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeityDropdown}
        onRequestClose={() => setShowDeityDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeityDropdown(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.deitySelectionModal}>
                <View style={styles.deitySelectionHeader}>
                  <Text style={styles.deitySelectionTitle}>Select Deity to Edit</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowDeityDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.deitySelectionList}>
                  {Object.entries(selectedDeities).map(([deityId, statueUrl]) => {
                    const deity = deityData.find(d => d._id === deityId);
                    return (
                      <TouchableOpacity
                        key={deityId}
                        style={[
                          styles.deitySelectionOption,
                          selectedDeityForEdit === deityId && styles.deitySelectionOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedDeityForEdit(deityId);
                          setShowDeityDropdown(false);
                        }}
                      >
                        <Image 
                          source={getImageSource(statueUrl)} 
                          style={styles.deitySelectionImage} 
                          resizeMode="contain" 
                        />
                        <Text style={[
                          styles.deitySelectionText,
                          selectedDeityForEdit === deityId && styles.deitySelectionTextSelected
                        ]}>
                          {deity ? deity.Deity?.Name || 'Unknown Deity' : 'Unknown Deity'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  purpleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  archImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  templeDisplay: {
    position: 'absolute',
    zIndex: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 220,
    zIndex: 3,
  },
  dimensionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 300,
  },
  dimensionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dimensionRow: {
    marginBottom: 8,
  },
  dimensionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  backButton: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // New Button Styles
  performPujaButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }], // Center the 90% width button
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  performPujaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  secondRowContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  secondRowButton: {
    backgroundColor: '#FF6A00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  secondRowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // Temple Configuration Icons Styles
  templeConfigIconsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 25,
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
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    height: 50,
  },
  configIconImage: {
    width: 40,
    height: 40,
    marginBottom: 0,
  },
  configIconLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
    position: 'absolute',
    top: 58,
    width: 80,
  },
  gradientIconContainer: {
    width: 40,
    height: 40,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientIcon: {
    width: '100%',
    height: '100%',
  },
  // Modal Styles
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
    zIndex: 101,
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
    justifyContent: 'flex-start',
    gap: 20,
    paddingHorizontal: 20,
  },
  modalStyleOption: {
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  modalStyleOptionSelected: {
    backgroundColor: '#FFEDD2',
    borderColor: '#FF6A00',
  },
  modalTempleImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  modalStyleOptionText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  gradientPresetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  gradientPresetOption: {
    width: 40,
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
  deityPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  // Deity Selection Styles
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  selectedStatueText: {
    fontSize: 10,
    color: '#FF6A00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  // Statue Selection Styles
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
  templeBells: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 200,
    left: screenWidth * 0.8 - 60,
    zIndex: 1,
  },
  templeBellsLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 200,
    left: screenWidth * 0.2 - 60,
    zIndex: 1,
  },
  selectedDeityImageContainer: {
    position: 'absolute',
    zIndex: 10,
    // Removed justifyContent and alignItems to avoid interference with sizing
  },
  selectedDeityFullImage: {
    width: '100%',
    height: '100%',
  },
  deitiesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    height: screenHeight * 0.3,
    zIndex: 101,
  },
  deitiesScrollView: {
    flex: 1,
    marginTop: 8,
  },
  statuesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    height: screenHeight * 0.2,
    position: 'absolute',
    top: screenHeight * 0.71,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }], // Center based on screen width
  },
  statuesScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statueItemHorizontal: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 100,
  },
  createModifyButton: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.35 }],
    width: screenWidth * 0.7,
    height: 40,
    backgroundColor: 'rgba(255, 106, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 30,
  },
  createModifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  saveTempleButton: {
    position: 'absolute',
    top: 130,
    left: '50%',
    transform: [{ translateX: -screenWidth * 0.45 }],
    width: screenWidth * 0.9,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 30,
  },
  saveTempleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  // Wizard Banner Styles
  wizardBanner: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  wizardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  // Controls Styles
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeIcon: {
    width: 30,
    height: 30,
  },
  positionIcon: {
    width: 30,
    height: 30,
  },
  arrowButton: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    width: 30,
    height: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  positionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Deity Dropdown Styles
  deityDropdownContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  deityDropdown: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  deityDropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 150,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deityDropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deityDropdownOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  deityDropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  deityDropdownOptionTextSelected: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  // Action Button Styles
  wizardButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  wizardBackButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
    minWidth: 80,
  },
  wizardBackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  wizardActionButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
  },
  wizardActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  // Flashing Animation
  flashingIcon: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  // Deity Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deitySelectionModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deitySelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deitySelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deitySelectionList: {
    maxHeight: 300,
  },
  deitySelectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deitySelectionOptionSelected: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF6A00',
  },
  deitySelectionImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  deitySelectionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deitySelectionTextSelected: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
});
