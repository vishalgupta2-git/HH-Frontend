import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated, PanResponder, Alert } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Audio } from 'expo-av';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { markDailyPujaVisited } from '@/utils/dailyPujaUtils';
import { getApiUrl, getAuthHeaders } from '@/constants/ApiConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
}

// Top Arch SVG Component
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
  };

  return (
    <TouchableOpacity
      style={[
        styles.bell,
        position === 'left' ? styles.bellLeft : styles.bellRight,
      ]}
      onPress={swingBell}
      activeOpacity={0.7}
    >
      <Animated.View style={swingStyle}>
        <Text style={styles.bellEmoji}>🔔</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Draggable Thali component for Aarti
const DraggableThali: React.FC<{ onImageLoad: () => void }> = ({ onImageLoad }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: 0,
        });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.thaliContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Image
        source={require('@/assets/images/icons/own temple/PujaThali1.png')}
        style={styles.thaliImage}
        resizeMode="contain"
        onLoad={onImageLoad}
      />
    </Animated.View>
  );
};

// Static Image component for S3 images
const StaticImage: React.FC<{
  source: any;
  x: number;
  y: number;
  scale?: number;
  size?: number;
  label?: string;
}> = ({ source, x, y, scale = 1, size = 72, label }) => {
  return (
    <View
      style={[
        styles.staticImage,
        {
          left: x,
          top: y,
          width: size * scale,
          height: size * scale,
        },
      ]}
    >
      <Image source={source} style={styles.imageContent} resizeMode="contain" />
      {label && <Text style={styles.imageLabel}>{label}</Text>}
    </View>
  );
};

export default function DailyPujaWithS3Images() {
  const router = useRouter();
  
  // S3 Images state
  const [folders, setFolders] = useState<ImageFolder[]>([]);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  
  // Daily Puja state
  const [showAartiModal, setShowAartiModal] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [showSmokeModal, setShowSmokeModal] = useState(false);
  const [flowers, setFlowers] = useState<Array<{
    id: string;
    type: string;
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rotation: number;
  }>>([]);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [isSmokeAnimationRunning, setIsSmokeAnimationRunning] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<Array<{
    id: string;
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
  }>>([]);
  
  // Animation values
  const leftBellSwing = useRef(new Animated.Value(0)).current;
  const rightBellSwing = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const thaliImageLoaded = useRef(false);

  // Check if a file is an image
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

  // Extract folder names from API response
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

  // Fetch presigned URL for S3 image
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

  // Fetch all images from dailytemples and organize by folders
  const fetchAllImagesAndOrganize = async (): Promise<ImageFolder[]> => {
    try {
      const apiUrl = getApiUrl('/api/s3/files?prefix=dailytemples/&maxKeys=1000');
      
      const res = await fetch(apiUrl, {
        headers: getAuthHeaders()
      });
      
      const data = await res.json();
      
      if (data && data.success && Array.isArray(data.files)) {
        const folderNames = extractFolderNames(data.files);
        const organizedFolders: ImageFolder[] = [];
        
        for (const folderName of folderNames) {
          const folderPrefix = `dailytemples/${folderName}/`;
          
          const folderImages = data.files.filter((f: any) => 
            f && typeof f.key === 'string' && 
            f.key.startsWith(folderPrefix) && 
            f.key !== folderPrefix && 
            isImageKey(f.key)
          );
          
          if (folderImages.length > 0) {
            const images: S3Image[] = folderImages.map((f: any) => ({
              key: f.key,
              name: f.key.split('/').pop() || f.key,
              url: '', // Will be filled when needed
              size: f.size || 0,
            }));
            
            organizedFolders.push({
              name: folderName.replace(/([A-Z])/g, ' $1').trim(),
              prefix: folderPrefix,
              images: images
            });
          }
        }
        
        return organizedFolders;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const loadFirstFolder = async () => {
    try {
      const allFolders = await fetchAllImagesAndOrganize();
      
      if (allFolders.length > 0) {
        setFolders(allFolders);
        setCurrentFolderIndex(0);
        setCurrentImageIndex(0);
        
        const firstImage = allFolders[0].images[0];
        const firstImageUrl = await fetchPresignedUrl(firstImage.key);
        if (firstImageUrl) {
          setCurrentImageUrl(firstImageUrl);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // Load images on component mount
  useEffect(() => {
    loadFirstFolder();
  }, []);

  // Update current image when folder or image index changes
  useEffect(() => {
    if (folders.length > 0 && 
        currentFolderIndex < folders.length && 
        currentImageIndex < folders[currentFolderIndex].images.length) {
      
      const currentImage = folders[currentFolderIndex].images[currentImageIndex];
      
      fetchPresignedUrl(currentImage.key).then(presignedUrl => {
        if (presignedUrl) {
          setCurrentImageUrl(presignedUrl);
        }
      });
    }
  }, [currentFolderIndex, currentImageIndex, folders]);

  // Navigation functions
  const navigateToNextImage = () => {
    if (folders.length === 0) return;
    
    const currentFolder = folders[currentFolderIndex];
    if (currentImageIndex < currentFolder.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const navigateToPreviousImage = () => {
    if (folders.length === 0) return;
    
    const currentFolder = folders[currentFolderIndex];
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(currentFolder.images.length - 1);
    }
  };

  const navigateToNextFolder = () => {
    if (currentFolderIndex < folders.length - 1) {
      setCurrentFolderIndex(currentFolderIndex + 1);
      setCurrentImageIndex(0);
    } else {
      setCurrentFolderIndex(0);
      setCurrentImageIndex(0);
    }
  };

  const navigateToPreviousFolder = () => {
    if (currentFolderIndex > 0) {
      setCurrentFolderIndex(currentFolderIndex - 1);
      setCurrentImageIndex(0);
    } else {
      setCurrentFolderIndex(folders.length - 1);
      setCurrentImageIndex(0);
    }
  };

  // Bell and sound functions
  const swingBothBells = async () => {
    leftBellSwing.setValue(0);
    rightBellSwing.setValue(0);
    
    Animated.parallel([
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
      ]),
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
      ]),
    ]).start();

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/temple-bell.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing bell sound:', error);
    }
  };

  const playConchSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/conch.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing conch sound:', error);
    }
  };

  // Flower functions
  const getFlowerEmoji = (type: string) => {
    const flowerEmojis: { [key: string]: string } = {
      hibiscus: '🌺',
      redRose: '🌹',
      whiteRose: '🤍',
      jasmine: '🌸',
      yellowShevanthi: '🌼',
      whiteShevanthi: '⚪',
      redShevanthi: '🔴',
      marigold: '🌻',
      tulsi: '🌿',
      rajnigandha: '💐',
      parajita: '🌼',
      datura: '🌺',
    };
    return flowerEmojis[type] || '🌸';
  };

  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  const dropFlowers = async (flowerType: string = 'hibiscus') => {
    setShowFlowerModal(false);
    setIsFlowerAnimationRunning(true);

    const newFlower = {
      id: Date.now().toString(),
      type: flowerType,
      x: new Animated.Value(Math.random() * (screenWidth - 100) + 50),
      y: new Animated.Value(-50),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0.5),
      rotation: Math.random() * 360,
    };

    setFlowers(prev => [...prev, newFlower]);

    const animateFall = () => {
      Animated.parallel([
        Animated.timing(newFlower.y, {
          toValue: screenHeight + 100,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(newFlower.opacity, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(newFlower.scale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setFlowers(prev => prev.filter(f => f.id !== newFlower.id));
      });
    };

    requestAnimationFrame(animateFall);

    setTimeout(() => {
      setIsFlowerAnimationRunning(false);
    }, 3000);
  };

  const dropMixFlowers = async () => {
    setShowFlowerModal(false);
    setIsFlowerAnimationRunning(true);

    const flowerTypes = ['hibiscus', 'redRose', 'whiteRose', 'jasmine', 'yellowShevanthi'];
    const newFlowers = [];

    for (let i = 0; i < 5; i++) {
      const newFlower = {
        id: `${Date.now()}_${i}`,
        type: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
        x: new Animated.Value(Math.random() * (screenWidth - 100) + 50),
        y: new Animated.Value(-50 - (i * 20)),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.5),
        rotation: Math.random() * 360,
      };

      newFlowers.push(newFlower);
      setFlowers(prev => [...prev, newFlower]);

      const animateFall = () => {
        Animated.parallel([
          Animated.timing(newFlower.y, {
            toValue: screenHeight + 100,
            duration: 3000 + (i * 200),
            useNativeDriver: false,
          }),
          Animated.timing(newFlower.opacity, {
            toValue: 0,
            duration: 3000 + (i * 200),
            useNativeDriver: false,
          }),
          Animated.timing(newFlower.scale, {
            toValue: 1,
            duration: 1500 + (i * 100),
            useNativeDriver: false,
          }),
        ]).start(() => {
          setFlowers(prev => prev.filter(f => f.id !== newFlower.id));
        });
      };

      setTimeout(() => {
        requestAnimationFrame(animateFall);
      }, i * 100);
    }

    setTimeout(() => {
      setIsFlowerAnimationRunning(false);
    }, 5000);
  };

  // Aarti functions
  const handleAarti = async () => {
    if (!thaliImageLoaded.current) {
      return;
    }

    setShowAartiModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/aarti.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing aarti sound:', error);
    }
  };

  const handleCloseAartiModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAartiModal(false);
    });
  };

  // Dhoop functions
  const startDhoopSmoke = async () => {
    setShowSmokeModal(false);
    setIsSmokeAnimationRunning(true);

    const createSmokeParticle = () => {
      const newParticle = {
        id: Date.now().toString(),
        x: new Animated.Value(Math.random() * (screenWidth - 100) + 50),
        y: new Animated.Value(screenHeight - 200),
        opacity: new Animated.Value(0.8),
        scale: new Animated.Value(0.5),
      };

      setSmokeParticles(prev => [...prev, newParticle]);

      Animated.parallel([
        Animated.timing(newParticle.y, {
          toValue: -100,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(newParticle.opacity, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(newParticle.scale, {
          toValue: 2,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setSmokeParticles(prev => prev.filter(p => p.id !== newParticle.id));
      });
    };

    const smokeInterval = setInterval(createSmokeParticle, 200);

    setTimeout(() => {
      clearInterval(smokeInterval);
      setIsSmokeAnimationRunning(false);
    }, 3000);
  };

  if (loading || !currentImageUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={styles.loadingText}>Loading Daily Puja...</Text>
      </View>
    );
  }

  if (folders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No images found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFirstFolder}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentFolder = folders[currentFolderIndex];
  const currentImage = currentFolder.images[currentImageIndex];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Top Arch */}
      <ArchSVG width={screenWidth} height={(screenWidth * 195) / 393} style={styles.archImage} />
      
      {/* Bells: left and right */}
      <SwingableBell position="left" swingValue={leftBellSwing} />
      <SwingableBell position="right" swingValue={rightBellSwing} />

      {/* Test Layout - Simple Left/Right Split */}
      <View style={styles.testLayout}>
        {/* Left Side - Puja Icons */}
        <View style={styles.leftSide}>
          <Text style={styles.testText}>🌸 Flowers</Text>
          <Text style={styles.testText}>🕉️ Aarti</Text>
          <Text style={styles.testText}>💨 Dhoop</Text>
          <Text style={styles.testText}>🔔 Ghanti</Text>
          <Text style={styles.testText}>🐚 Shankh</Text>
        </View>
        
        {/* Right Side - Temple Content */}
        <View style={styles.rightSide}>
          {/* Main Image Display */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.mainImage}
              resizeMode="contain"
              onError={(error) => {
                Alert.alert('Error', 'Failed to load image');
              }}
            />
          </View>

          {/* Navigation Controls */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={navigateToPreviousFolder}
            >
              <Text style={styles.navButtonText}>◀ Previous Folder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={navigateToNextFolder}
            >
              <Text style={styles.navButtonText}>Next Folder ▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageNavigationContainer}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={navigateToPreviousImage}
            >
              <Text style={styles.navButtonText}>▲ Previous Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={navigateToNextImage}
            >
              <Text style={styles.navButtonText}>Next Image ▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Flowers dropped */}
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

      {/* Smoke particles */}
      {smokeParticles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.smokeParticle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
            },
          ]}
        >
          <Text style={styles.smokeEmoji}>💨</Text>
        </Animated.View>
      ))}

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.folderInfo}>
          Folder: {currentFolder.name} ({currentFolder.images.length} images)
        </Text>
        <Text style={styles.imageInfo}>
          Image: {currentImage.name}
        </Text>
      </View>

      {/* Flower Selection Modal */}
      <Modal
        visible={showFlowerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFlowerModal(false)}
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
                
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('marigold')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🌻</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Marigold</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.flowerOption} 
                  onPress={() => dropFlowers('tulsi')}
                >
                  <View style={styles.flowerIconContainer}>
                    <Text style={styles.flowerOptionEmoji}>🌿</Text>
                  </View>
                  <Text style={styles.flowerOptionLabel}>Tulsi</Text>
                </TouchableOpacity>
                
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
                  onPress={dropMixFlowers}
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

      {/* Dhoop Modal */}
      <Modal
        visible={showSmokeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSmokeModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.smokeModalOverlay}>
          <TouchableOpacity 
            style={styles.smokeModalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowSmokeModal(false)}
          >
            <View style={styles.smokeModalContent}>
              <Text style={styles.modalTitle}>Light Dhoop</Text>
              <TouchableOpacity 
                style={styles.smokeButton}
                onPress={startDhoopSmoke}
                disabled={isSmokeAnimationRunning}
              >
                <Text style={styles.smokeButtonText}>
                  {isSmokeAnimationRunning ? 'Dhoop Burning...' : 'Light Dhoop'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Aarti Modal */}
      <Modal
        visible={showAartiModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseAartiModal}
        statusBarTranslucent={true}
      >
        <View style={styles.aartiModalOverlay}>
          <TouchableOpacity 
            style={styles.aartiModalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseAartiModal}
          >
            <View style={styles.aartiContainer}>
              <DraggableThali onImageLoad={() => { thaliImageLoaded.current = true; }} />
              <Text style={styles.aartiText}>Perform Aarti</Text>
              <Text style={styles.aartiDescription}>
                Touch and drag the thali to perform aarti
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.3,
    zIndex: -1,
  },
  archImage: {
    position: 'absolute',
    top: screenHeight * 0.3,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  bell: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  bellLeft: {
    position: 'absolute',
    left: 20,
    top: -10,
  },
  bellRight: {
    position: 'absolute',
    right: 20,
    top: -10,
  },
  bellEmoji: {
    fontSize: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 0,
  },
  mainImage: {
    width: screenWidth - 40,
    height: screenHeight * 0.6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  imageNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    backgroundColor: 'rgba(255, 106, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testLayout: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'red', // Solid red to see the layout
    zIndex: 9999, // Very high z-index to ensure visibility
  },
  leftSide: {
    width: 100,
    backgroundColor: 'green', // Solid green for left side
    padding: 10,
    alignItems: 'center',
    zIndex: 9999, // High z-index
  },
  rightSide: {
    flex: 1,
    backgroundColor: 'blue', // Solid blue for right side
    padding: 10,
    zIndex: 9999, // High z-index
  },
  testText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  pujaIconsColumn: {
    width: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pujaIconItem: {
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 0,
    width: '100%',
  },
  pujaIconItemDisabled: {
    opacity: 0.5,
  },
  pujaIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  pujaIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  pujaIconDisabled: {
    opacity: 0.5,
  },
  pujaIconLabel: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  pujaIconLabelDisabled: {
    opacity: 0.5,
  },
  pujaIconImage: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  flower: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  flowerImage: {
    width: '100%',
    height: '100%',
  },
  flowerEmoji: {
    fontSize: 30,
  },
  smokeParticle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  smokeEmoji: {
    fontSize: 24,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 10,
  },
  folderInfo: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  imageInfo: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowerModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.7,
  },
  flowerOptions: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  flowerOption: {
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  flowerIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    borderRadius: 25,
    marginBottom: 8,
  },
  flowerOptionEmoji: {
    fontSize: 30,
  },
  flowerOptionImage: {
    width: 40,
    height: 40,
  },
  flowerOptionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  smokeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smokeModalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smokeModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  smokeButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  smokeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  aartiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aartiModalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aartiContainer: {
    alignItems: 'center',
    padding: 20,
  },
  thaliContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  thaliImage: {
    width: '100%',
    height: '100%',
  },
  aartiText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  aartiDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  staticImage: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    textAlign: 'center',
  },
});
