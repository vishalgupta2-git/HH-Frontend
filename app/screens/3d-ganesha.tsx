// GaneshaTint.js
import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert, Image, Animated, Easing, ScrollView, ActivityIndicator, Modal } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Canvas, Image as SkiaImage, useImage, ColorMatrix, Group } from "@shopify/react-native-skia";
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { getApiUrl, getEndpointUrl, getAuthHeaders } from '../../constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GaneshaTint() {
  const router = useRouter();
  const [tintColor, setTintColor] = useState("gold");
  const [tintIntensity, setTintIntensity] = useState(0.3);
  const [imageSize, setImageSize] = useState(0.4); // 0.1 to 1.2 range
  const [imageX, setImageX] = useState(0); // -100 to 100 range
  const [imageY, setImageY] = useState(0); // -100 to 100 range
  const [activePanel, setActivePanel] = useState<string | null>(null); // null, 'tint', 'size', 'position'
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [bellsLoaded, setBellsLoaded] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [flowers, setFlowers] = useState<any[]>([]);
  const [isFlowerAnimationRunning, setIsFlowerAnimationRunning] = useState(false);
  const [isBellAnimationRunning, setIsBellAnimationRunning] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicFiles, setMusicFiles] = useState<any[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [selectedMusicFilter, setSelectedMusicFilter] = useState('All');
  const [ganeshaOnly, setGaneshaOnly] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingMusicId, setLoadingMusicId] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get device dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animated values for swinging bells
  const topBellsSwing = useRef(new Animated.Value(0)).current;
  const bottomBellsSwing = useRef(new Animated.Value(0)).current;
  
  // Bell sound reference
  const bellSound = useRef<Audio.Sound | null>(null);

  // Preload bell sound and create one-time swing animation
  useEffect(() => {
    const preloadBellSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/TempleBell.mp3'),
          { shouldPlay: false }
        );
        bellSound.current = sound;
        setBellsLoaded(true);
      } catch (error) {
        console.error('Error preloading bell sound:', error);
        setBellsLoaded(true); // Continue even if sound fails to load
      }
    };

    preloadBellSound();
  }, []);

  // Load userId and temple configuration from database when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const currentUserId = userData.userId;
          setUserId(currentUserId);
          
          // Load existing temple configuration from database
          if (currentUserId) {
            try {
              const response = await fetch(getApiUrl('/api/get-ganesha-temple') + `?userId=${currentUserId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.temple) {
                  const temple = result.temple;
                  console.log('✅ Loaded existing temple configuration:', temple);
                  
                  // Update state with loaded configuration
                  if (temple.templeInformation) {
                    const info = temple.templeInformation;
                    setTintColor(info.tintColor || "gold");
                    setTintIntensity(info.tintIntensity || 0.3);
                    setImageSize(info.imageSize || 0.4);
                    setImageX(info.imageX || 0);
                    setImageY(info.imageY || 0);
                  }
                }
              } else if (response.status === 404) {
                console.log('ℹ️ No existing temple configuration found, using defaults');
              } else {
                console.error('❌ Error loading temple configuration:', response.status);
              }
            } catch (error) {
              console.error('❌ Error fetching temple configuration:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading userId:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Start one-time swinging bells animation when screen loads (matching daily puja pattern)
  useEffect(() => {
    if (!bellsLoaded) return;

    const playBellSound = async () => {
      try {
        if (bellSound.current) {
          await bellSound.current.replayAsync();
        }
      } catch (error) {
        console.error('Error playing bell sound:', error);
      }
    };

    // Play bell sound immediately
    playBellSound();

    // Swing top bell immediately
    Animated.sequence([
      Animated.timing(topBellsSwing, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(topBellsSwing, {
        toValue: -1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(topBellsSwing, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Swing bottom bell with slight delay
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(bottomBellsSwing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomBellsSwing, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bottomBellsSwing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    return () => {
      // Cleanup not needed for one-time animations
    };
  }, [bellsLoaded, topBellsSwing, bottomBellsSwing]);

  // Cleanup bell sound when component unmounts
  useEffect(() => {
    return () => {
      if (bellSound.current) {
        bellSound.current.unloadAsync();
      }
    };
  }, []);

  // Cleanup music sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);
  
  // Function to trigger bell swing and sound (matching daily puja exactly)
  const triggerBells = async () => {
    if (isBellAnimationRunning) return; // Prevent multiple animations
    
    setIsBellAnimationRunning(true);
    
    try {
      // Play first bell sound
      if (bellSound.current) {
        await bellSound.current.replayAsync();
      }
      
      // Reset bell animations
      topBellsSwing.setValue(0);
      bottomBellsSwing.setValue(0);
      
      // Swing top bell immediately (parallel with first sound)
      Animated.sequence([
        Animated.timing(topBellsSwing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(topBellsSwing, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(topBellsSwing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Swing bottom bell with slight delay (still parallel with first sound)
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(bottomBellsSwing, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bottomBellsSwing, {
            toValue: -1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bottomBellsSwing, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      // Play second bell sound after 2.5 seconds
      setTimeout(async () => {
        try {
          if (bellSound.current) {
            await bellSound.current.replayAsync();
          }
        } catch (error) {
          console.error('Error playing second bell sound:', error);
        }
        
        // Swing top bell again for second ring
        Animated.sequence([
          Animated.timing(topBellsSwing, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(topBellsSwing, {
            toValue: -1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(topBellsSwing, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Swing bottom bell again with slight delay
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(bottomBellsSwing, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(bottomBellsSwing, {
              toValue: -1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(bottomBellsSwing, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }, 200);
      }, 2500);
      
      // Reset bell animation state after complete sequence
      setTimeout(() => {
        setIsBellAnimationRunning(false);
      }, 3500); // Total animation time: 2.5s + 1s for final swings
      
    } catch (error) {
      console.error('Error triggering bells:', error);
    }
  };

  // Function to open flower selection modal
  const openFlowerModal = () => {
    setShowFlowerModal(true);
  };

  // Function to handle music action
  const handleMusic = () => {
    setShowMusicModal(true);
    fetchMusicFiles();
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

  // Function to play a specific music file
  const playMusicFile = async (file: any) => {
    try {
      // Validate file object
      if (!file || !file.avld) {
        console.error('❌ [MUSIC] Invalid file object:', file);
        return;
      }

      setLoadingMusicId(file.avld);
      
      // Stop any currently playing sound
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
            await sound.unloadAsync();
            // Successfully stopped and unloaded current sound
          }
        } catch (error) {
          console.error('❌ [MUSIC] Error stopping current sound:', error);
        }
      }

      // Get presigned URL from backend API (same as daily puja custom temple)
      const apiUrl = getEndpointUrl('S3_AUDIO_URL');
      
      const response = await fetch(`${apiUrl}?filename=${encodeURIComponent(file.Link)}`, {
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
      
      console.log('🎵 [MUSIC] Audio loaded successfully, setting up playback...');
      
      setSound(newSound);
      setCurrentlyPlaying(file.avld);
      setLoadingMusicId(null);
      
    } catch (error) {
      console.error('❌ [MUSIC] Error playing music file:', error);
      setLoadingMusicId(null);
    }
  };

  // Function to stop current music
  const stopCurrentMusic = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      }
      setSound(null);
      setCurrentlyPlaying(null);
    } catch (error) {
      console.error('❌ [MUSIC] Error stopping music:', error);
    }
  };

  // Function to drop flowers (right to left, matching garland width)
  const dropFlowers = async (flowerType: string = 'hibiscus') => {
    if (isFlowerAnimationRunning) return; // Prevent multiple animations
    
    setIsFlowerAnimationRunning(true);
    setShowFlowerModal(false); // Close modal when dropping flowers
    
    // Generate unique flower ID
    const generateUniqueFlowerId = () => `flower_${Date.now()}_${Math.random()}`;
    
    // Calculate flower spread area (matching garland dimensions)
    const garlandWidth = 420; // Same as garland width
    const garlandHeight = 420; // Same as garland height
    const garlandRight = screenWidth; // Garland is positioned at right edge
    const garlandLeft = garlandRight - garlandWidth; // Left edge of garland
    const animationTop = (screenHeight - garlandHeight) / 2; // Center the animation vertically
    
    let totalFlowers = 0;
    let completedFlowers = 0;
    
    // Create 3 rows of flowers
    for (let row = 0; row < 3; row++) {
      // Create 15 flowers per row
      for (let i = 0; i < 15; i++) {
        totalFlowers++;
        const flowerId = generateUniqueFlowerId();
        
        // Spread flowers across garland width with some randomness
        const baseX = garlandLeft + (garlandWidth * i / 14); // Evenly spaced across garland width
        const randomOffset = (Math.random() - 0.5) * 60; // ±30px random offset
        const x = Math.max(30, Math.min(screenWidth - 30, baseX + randomOffset));
        
        // Start flowers from right side (off-screen) and move left
        const startX = screenWidth + 50 + (Math.random() * 100); // Start from right edge with random offset
        const endX = x; // End at calculated position
        
        const randomRotation = Math.random() * 360;
        const randomScale = 0.6 + Math.random() * 0.3; // 50% bigger: 0.6-0.9 scale (was 0.4-0.6)
        const randomStartY = animationTop + (garlandHeight * row / 3) + (Math.random() * 60); // Position within garland height area

        const newFlower = {
          id: flowerId,
          x: startX,
          y: randomStartY,
          rotation: randomRotation,
          scale: randomScale,
          opacity: 1,
          type: flowerType,
        };

        setFlowers(prev => [...prev, newFlower]);

        // Animate flower moving from right to left
        const moveDuration = 3000 + (Math.random() * 1000) + (row * 500);
        const moveDistance = startX - endX;

        let startTime = Date.now();
        
        const animateMove = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / moveDuration, 1);
          
          setFlowers(prev => prev.map(flower => {
            if (flower.id === flowerId) {
              const newX = startX - (moveDistance * progress);
              let newOpacity = 1;
              
              // Start fading when approaching final position
              if (progress > 0.8) {
                const fadeProgress = (progress - 0.8) / 0.2;
                newOpacity = Math.max(0, 1 - fadeProgress);
              }
              
              return {
                ...flower,
                x: newX,
                opacity: newOpacity,
              };
            }
            return flower;
          }));
          
          if (progress < 1) {
            requestAnimationFrame(animateMove);
          } else {
            // Remove flower when animation completes
            setFlowers(prev => prev.filter(flower => flower.id !== flowerId));
            completedFlowers++;
            
            if (completedFlowers === totalFlowers) {
              setIsFlowerAnimationRunning(false);
            }
          }
        };
        
        animateMove();
      }
    }
  };

  // Function to get flower emoji or image
  const getFlowerDisplay = (flowerType: string) => {
    switch (flowerType) {
      case 'hibiscus':
        return '🌺';
      case 'redRose':
        return require('../../assets/images/icons/own temple/rose.png');
      case 'whiteRose':
        return require('../../assets/images/icons/own temple/whiterose.png');
      case 'sunflower':
        return '🌻';
      case 'marigold':
        return '🌼';
      case 'belPatra':
        return '🍃';
      case 'jasmine':
        return require('../../assets/images/icons/own temple/jasmine.png');
      case 'yellowShevanthi':
        return require('../../assets/images/icons/own temple/YellowShevanthi.png');
      case 'whiteShevanthi':
        return require('../../assets/images/icons/own temple/WhiteShevanthi.png');
      case 'redShevanthi':
        return require('../../assets/images/icons/own temple/RedShevanthi.png');
      case 'tulsi':
        return require('../../assets/images/icons/own temple/tulsi.png');
      case 'rajnigandha':
        return require('../../assets/images/icons/own temple/rajnigandha.png');
      case 'parajita':
        return require('../../assets/images/icons/own temple/parajita.png');
      case 'datura':
        return require('../../assets/images/icons/own temple/Datura.png');
      default:
        return '🌸';
    }
  };
  
  // Load the PNG
  const image = useImage(require("../../assets/images/temple/Ganesha1.png"));

  // Always use landscape layout for Ganesha
  const imageDims = useMemo(() => {
    // Landscape layout: wider image, with size and position controls
    const baseSize = Math.min(screenWidth * imageSize, screenHeight * imageSize);
    const finalSize = Math.max(50, Math.min(baseSize, Math.min(screenWidth * 1.2, screenHeight * 1.2)));
    
    // Calculate center position with offset controls
    const centerX = (screenWidth - finalSize) / 2;
    const centerY = (screenHeight - finalSize) / 2;
    
    // Apply X/Y offsets (scaled to screen dimensions)
    const offsetX = (imageX / 100) * (screenWidth * 0.3);
    const offsetY = (imageY / 100) * (screenHeight * 0.3);
    
    return {
      width: finalSize,
      height: finalSize,
      x: centerX + offsetX,
      y: centerY + offsetY
    };
  }, [screenWidth, screenHeight, imageSize, imageX, imageY]);

  // Color matrix for different tint effects - preserves all details
  const getColorMatrix = (color: string, intensity: number) => {
    switch (color) {
      case "gold":
        return [
          1 + intensity * 0.5, intensity * 0.2, 0, 0, 0,
          0, 1 + intensity * 0.3, 0, 0, 0,
          0, 0, 1 - intensity * 0.1, 0, 0,
          0, 0, 0, 1, 0
        ];
      case "red":
        return [
          1 + intensity * 0.5, 0, 0, 0, 0,
          0, 1 - intensity * 0.2, 0, 0, 0,
          0, 0, 1 - intensity * 0.2, 0, 0,
          0, 0, 0, 1, 0
        ];
      case "blue":
        return [
          1 - intensity * 0.2, 0, 0, 0, 0,
          0, 1 - intensity * 0.2, 0, 0, 0,
          0, 0, 1 + intensity * 0.5, 0, 0,
          0, 0, 0, 1, 0
        ];
      case "green":
        return [
          1 - intensity * 0.2, 0, 0, 0, 0,
          0, 1 + intensity * 0.5, 0, 0, 0,
          0, 0, 1 - intensity * 0.2, 0, 0,
          0, 0, 0, 1, 0
        ];
      case "purple":
        return [
          1 + intensity * 0.3, 0, intensity * 0.3, 0, 0,
          0, 1 - intensity * 0.1, 0, 0, 0,
          0, 0, 1 + intensity * 0.3, 0, 0,
          0, 0, 0, 1, 0
        ];
      default:
        return [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    }
  };

  // Handle saving temple
  const handleSaveTemple = async () => {
    if (!userId) {
      setMessage('Please log in to save your temple configuration');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
      }, 2000);
      return;
    }

    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);
    try {
      const templeData = {
        userId: userId,
        templeName: "My Ganesha Temple", // Default name since input is removed
        templeInformation: {
          tintColor,
          tintIntensity,
          imageSize,
          imageX,
          imageY,
          createdAt: new Date().toISOString()
        }
      };
      
      const response = await fetch(getApiUrl('/api/save-ganesha-temple'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templeData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Temple saved successfully:', result);
        // Show quick notification instead of modal
        setMessage('Temple Saved');
        setMessageType('success');
        // Clear message after 2 seconds
        setTimeout(() => {
          setMessage('');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save temple:', response.status, errorData);
        setMessage(`Failed to save temple: ${errorData.error || 'Unknown error'}`);
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving temple:', error);
      setMessage('Error saving temple');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back button with save confirmation
  const handleBackButton = () => {
    console.log('Opening exit modal');
    setShowExitModal(true);
  };

  // Handle exit without saving
  const handleExitWithoutSaving = () => {
    setShowExitModal(false);
    router.back();
  };

  // Handle exit with saving
  const handleExitWithSaving = async () => {
    if (isSaving) return; // Prevent multiple saves
    
    setIsSaving(true);
    try {
      // Save current state before going back
      const templeData = {
        userId: userId,
        templeName: "My Ganesha Temple",
        templeInformation: {
          tintColor,
          tintIntensity,
          imageSize,
          imageX,
          imageY,
          createdAt: new Date().toISOString()
        }
      };

      const response = await fetch(getApiUrl('/api/save-ganesha-temple'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templeData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage('Temple saved successfully!');
          setMessageType('success');
          setTimeout(() => {
            setMessage('');
            setMessageType('info');
            // Go back after showing success message
            setShowExitModal(false);
            router.back();
          }, 2000);
        } else {
          setMessage('Error saving temple');
          setMessageType('error');
          setTimeout(() => {
            setMessage('');
            setMessageType('info');
          }, 2000);
        }
      } else {
        setMessage('Error saving temple');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('info');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving temple:', error);
      setMessage('Error saving temple');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('info');
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render until image and bells are loaded
  if (!image || !bellsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Ganesha...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/ganesha2025/Ganesha_BG_1.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Garland Image */}
      <Image
        source={require("../../assets/images/ganesha2025/Garland.png")}
        style={styles.garlandImage}
        resizeMode="contain"
      />
      
      {/* Temple Bells */}
      <Animated.Image
        source={require("../../assets/images/temple/templeBellIcon2_90.png")}
        style={[
          styles.templeBellsImage,
          {
            transform: [
              { translateX: 80 }, // Move pivot point to right edge
              { rotate: topBellsSwing.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-15deg', '0deg', '15deg']
              })},
              { translateX: -80 } // Move back to original position
            ]
          }
        ]}
        resizeMode="contain"
      />
      
      {/* Temple Bells - Bottom Copy */}
      <Animated.Image
        source={require("../../assets/images/temple/templeBellIcon2_90.png")}
        style={[
          styles.templeBellsBottomImage,
          {
            transform: [
              { translateX: 80 }, // Move pivot point to right edge
              { rotate: bottomBellsSwing.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-15deg', '0deg', '15deg']
              })},
              { translateX: -80 } // Move back to original position
            ]
          }
        ]}
        resizeMode="contain"
      />
      
      {/* Standing Lamps - Left Side */}
      <Image
        source={require("../../assets/images/temple/standingLampIcon.png")}
        style={styles.standingLampTopImage}
        resizeMode="contain"
      />
      
      <Image
        source={require("../../assets/images/temple/standingLampIcon.png")}
        style={styles.standingLampBottomImage}
        resizeMode="contain"
      />
      
      <Canvas style={[styles.canvas, { width: screenWidth, height: screenHeight }]}>
        <Group>
          <ColorMatrix matrix={getColorMatrix(tintColor, tintIntensity)} />
          {/* Shadow Layer */}
          <Group>
            <ColorMatrix matrix={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]} />
            <SkiaImage
              image={image}
              x={imageDims.x - 12}
              y={imageDims.y - 6}
              width={imageDims.width}
              height={imageDims.height}
              transform={[
                { translateX: imageDims.x - 12 + imageDims.width / 2 },
                { translateY: imageDims.y - 6 + imageDims.height / 2 },
                { rotate: Math.PI / 2 }, // Exactly 90 degrees
                { translateX: -(imageDims.x - 12 + imageDims.width / 2) },
                { translateY: -(imageDims.y - 6 + imageDims.height / 2) }
              ]}
              opacity={0.3}
            />
          </Group>
          {/* Main Ganesha Image */}
          <SkiaImage
            image={image}
            x={imageDims.x}
            y={imageDims.y}
            width={imageDims.width}
            height={imageDims.height}
            transform={[
              { translateX: imageDims.x + imageDims.width / 2 },
              { translateY: imageDims.y + imageDims.height / 2 },
              { rotate: Math.PI / 2 }, // Exactly 90 degrees
              { translateX: -(imageDims.x + imageDims.width / 2) },
              { translateY: -(imageDims.y + imageDims.height / 2) }
            ]}
          />
        </Group>
      </Canvas>
      
      {/* Render Falling Flowers */}
      {flowers.map((flower) => {
        const flowerDisplay = getFlowerDisplay(flower.type);
        return (
          <View
            key={flower.id}
            style={[
              styles.fallingFlower,
              {
                position: 'absolute',
                left: flower.x,
                top: flower.y,
                opacity: flower.opacity,
                transform: [
                  { rotate: `${flower.rotation}deg` },
                  { scale: flower.scale },
                ],
                zIndex: 15,
              },
            ]}
          >
            {typeof flowerDisplay === 'string' ? (
              <Text style={styles.flowerEmoji}>{flowerDisplay}</Text>
            ) : (
              <Image source={flowerDisplay} style={styles.flowerImage} resizeMode="contain" />
            )}
          </View>
        );
      })}
      
      {/* Top Icon Bar */}
      <View style={styles.topIconBar}>
        <TouchableOpacity
          style={[styles.iconButton, activePanel === 'tint' && styles.activeIconButton]}
          onPress={() => setActivePanel(activePanel === 'tint' ? null : 'tint')}
        >
          <Text style={styles.iconText}>🎨</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.iconButton, activePanel === 'size' && styles.activeIconButton]}
          onPress={() => setActivePanel(activePanel === 'size' ? null : 'size')}
        >
          <Image 
            source={require("../../assets/images/icons/otherIcons/scalingIcon.png")}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.iconButton, activePanel === 'position' && styles.activeIconButton]}
          onPress={() => setActivePanel(activePanel === 'position' ? null : 'position')}
        >
          <Image 
            source={require("../../assets/images/icons/otherIcons/positionIcon.png")}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.iconButton, isSaving && styles.disabledIconButton]}
          onPress={handleSaveTemple}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.iconText}>💾</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBackButton}
        >
          <Ionicons 
            name="arrow-undo" 
            size={31} 
            color="#fff" 
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </TouchableOpacity>
      </View>
      
      {/* Quick Notification */}
      {message && (
        <View style={[
          styles.notification,
          messageType === 'success' && styles.notificationSuccess,
          messageType === 'error' && styles.notificationError
        ]}>
          <Text style={styles.notificationText}>{message}</Text>
        </View>
      )}
      
      {/* Bottom Icon Container */}
      <View style={styles.bottomIconContainer}>
        <TouchableOpacity style={styles.bottomIconButton} onPress={handleMusic}>
          <Text style={[styles.bottomIconText, { transform: [{ rotate: '90deg' }] }]}>🎵</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.bottomIconButton, 
            isBellAnimationRunning && styles.disabledBottomIconButton
          ]} 
          onPress={triggerBells}
          disabled={isBellAnimationRunning}
        >
          <Text style={[
            styles.bottomIconText, 
            { transform: [{ rotate: '90deg' }] },
            isBellAnimationRunning && styles.disabledBottomIconText
          ]}>🔔</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomIconButton}>
          <Image 
            source={require("../../assets/images/icons/own temple/PujaThali1.png")}
            style={styles.bottomIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.bottomIconButton, 
            isFlowerAnimationRunning && styles.disabledBottomIconButton
          ]} 
          onPress={() => setShowFlowerModal(!showFlowerModal)}
          disabled={isFlowerAnimationRunning}
        >
          <Text style={[
            styles.bottomIconText,
            isFlowerAnimationRunning && styles.disabledBottomIconText
          ]}>🌸</Text>
        </TouchableOpacity>
      </View>
      
      {/* Flower Selection Modal */}
      {showFlowerModal && (
        <TouchableOpacity 
          style={styles.flowerMenuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFlowerModal(false)}
        >
          <View style={styles.flowerMenu}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flowerOptions}
            >
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('hibiscus')}
              >
                <Text style={styles.flowerOptionLabel}>Hibiscus</Text>
                <View style={styles.flowerIconContainer}>
                  <Text style={styles.flowerOptionEmoji}>🌺</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('redRose')}
              >
                <Text style={styles.flowerOptionLabel}>Red Rose</Text>
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/rose.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('whiteRose')}
              >
                <Text style={styles.flowerOptionLabel}>White Rose</Text>
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/whiterose.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('sunflower')}
              >
                <Text style={styles.flowerOptionLabel}>Sunflower</Text>
                <View style={styles.flowerIconContainer}>
                  <Text style={styles.flowerOptionEmoji}>🌻</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('marigold')}
              >
                <Text style={styles.flowerOptionLabel}>Marigold</Text>
                <View style={styles.flowerIconContainer}>
                  <Text style={styles.flowerOptionEmoji}>🌼</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('belPatra')}
              >
                <Text style={styles.flowerOptionLabel}>Bel Patra</Text>
                <View style={styles.flowerIconContainer}>
                  <Text style={styles.flowerOptionEmoji}>🍃</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('jasmine')}
              >
                <Text style={styles.flowerOptionLabel}>Jasmine</Text>
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/jasmine.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('yellowShevanthi')}
              >
                <Text style={styles.flowerOptionLabel}>Yellow Shevanthi</Text>
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/YellowShevanthi.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('whiteShevanthi')}
              >
                <Text style={styles.flowerOptionLabel}>White Shevanthi</Text>
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/WhiteShevanthi.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('redShevanthi')}
              >
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/RedShevanthi.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.flowerOptionLabel}>Red Shevanthi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('tulsi')}
              >
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/tulsi.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.flowerOptionLabel}>Tulsi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flowerOption} 
                onPress={() => dropFlowers('rajnigandha')}
              >
                <View style={styles.flowerIconContainer}>
                  <Image 
                    source={require("../../assets/images/icons/own temple/rajnigandha.png")}
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
                    source={require("../../assets/images/icons/own temple/parajita.png")}
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
                    source={require("../../assets/images/icons/own temple/Datura.png")}
                    style={styles.flowerOptionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.flowerOptionLabel}>Datura</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Music Modal */}
      {showMusicModal && (
        <View style={styles.musicModalOverlay}>
          <TouchableOpacity 
            style={styles.musicModalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowMusicModal(false)}
          >
            <View style={styles.musicModalContent}>
              {/* Header */}
              <View style={styles.musicModalHeader}>
                <Text style={styles.musicModalTitle}>🎵 Divine Music</Text>
                <TouchableOpacity 
                  style={styles.musicModalCloseButton}
                  onPress={() => setShowMusicModal(false)}
                >
                  <Text style={styles.musicModalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Ganesha Toggle */}
              <View style={styles.ganeshaToggleContainer}>
                <TouchableOpacity 
                  style={styles.toggleItem}
                  onPress={() => setGaneshaOnly(!ganeshaOnly)}
                >
                  <LinearGradient
                    colors={ganeshaOnly ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
                    style={styles.toggleTrack}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        ganeshaOnly && styles.toggleThumbActive
                      ]}
                    />
                  </LinearGradient>
                  <Text style={styles.toggleLabel}>Ganesha Only</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Buttons */}
              <View style={styles.musicFilterContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.musicFilterContent}
                >
                  {['All', 'Aarti', 'Bhajan', 'Chalisa', 'Paath / Strotam', 'Famous'].map((filter) => (
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
                        selectedMusicFilter === filter && styles.musicFilterTextActive
                      ]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Music List */}
              <ScrollView style={styles.musicListContainer} showsVerticalScrollIndicator={false}>
                {musicLoading ? (
                  <View style={styles.musicLoadingContainer}>
                    <Text style={styles.musicLoadingText}>Loading music library...</Text>
                  </View>
                ) : musicFiles.length === 0 ? (
                  <View style={styles.musicEmptyContainer}>
                    <Text style={styles.musicEmptyText}>No music files found</Text>
                  </View>
                ) : (
                  // Filter music files based on Ganesha preference and category
                  musicFiles
                    .filter(file => {
                      if (!file) return false;
                      
                      // Apply Ganesha filter (default: ON)
                      if (ganeshaOnly) {
                        const title = file.VideoName?.toLowerCase() || '';
                        const deity = file.Deity?.toLowerCase() || '';
                        const isGanesha = title.includes('ganesh') || title.includes('ganesha') || 
                                         title.includes('ganpati') || title.includes('ganpati') ||
                                         deity.includes('ganesh') || deity.includes('ganesha') ||
                                         deity.includes('ganpati') || deity.includes('ganpati');
                        if (!isGanesha) return false;
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
      )}
      
      {/* Dynamic Control Panel */}
      <View style={[
        styles.controls, 
        { 
          top: activePanel === 'position' || activePanel === 'tint' || activePanel === 'size' ? 0 : 200,
          left: 0
        }
      ]}>
        {activePanel === 'tint' && (
          <TouchableOpacity 
            style={styles.controlPanelOverlay} 
            activeOpacity={1} 
            onPress={() => setActivePanel(null)}
          >
            <View style={styles.controlPanelContent}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.positionContainer, { top: 100 }]}>
                  {["gold", "red", "blue", "green", "purple"].map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton, 
                        { backgroundColor: color === "gold" ? "#FFD700" : color },
                        tintColor === color && styles.activeColorButton
                      ]}
                      onPress={() => setTintColor(color)}
                    />
                  ))}
                </View>
                
                <View style={[styles.positionContainer, { top: 140 }]}>
                  <TouchableOpacity
                    style={styles.intensityButton}
                    onPress={() => setTintIntensity(prev => Math.max(0, prev - 0.1))}
                  >
                    <Text style={styles.buttonText}>⬅️</Text>
                  </TouchableOpacity>
                  <Text style={styles.label}>Intensity: {Math.round(tintIntensity * 100)}%</Text>
                  <TouchableOpacity
                    style={styles.intensityButton}
                    onPress={() => setTintIntensity(prev => Math.min(1, prev + 0.1))}
                  >
                    <Text style={styles.buttonText}>➡️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        
        {activePanel === 'size' && (
          <TouchableOpacity 
            style={styles.controlPanelOverlay} 
            activeOpacity={1} 
            onPress={() => setActivePanel(null)}
          >
            <View style={styles.controlPanelContent}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.positionContainer, { top: 100 }]}>
                  <TouchableOpacity
                    style={styles.intensityButton}
                    onPress={() => setImageSize(prev => Math.max(0.1, prev - 0.1))}
                  >
                    <Text style={styles.buttonText}>⬅️</Text>
                  </TouchableOpacity>
                  <Text style={styles.label}>Size: {Math.round(imageSize * 100)}%</Text>
                  <TouchableOpacity
                    style={styles.intensityButton}
                    onPress={() => setImageSize(prev => Math.min(1.2, prev + 0.1))}
                  >
                    <Text style={styles.buttonText}>➡️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        
        {activePanel === 'position' && (
          <TouchableOpacity 
            style={styles.controlPanelOverlay} 
            activeOpacity={1} 
            onPress={() => setActivePanel(null)}
          >
            <View style={styles.controlPanelContent}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={styles.positionContainer}>
                  <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => setImageY(prev => Math.min(100, prev + 10))}
                  >
                    <Text style={styles.arrowText}>⬇️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => setImageY(prev => Math.max(-100, prev - 10))}
                  >
                    <Text style={styles.arrowText}>⬆️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => setImageX(prev => Math.max(-100, prev - 10))}
                  >
                    <Text style={styles.arrowText}>⬅️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => setImageX(prev => Math.min(100, prev + 10))}
                  >
                    <Text style={styles.arrowText}>➡️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Exit Modal */}
        <Modal
          visible={showExitModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowExitModal(false)}
        >
          <TouchableOpacity 
            style={styles.exitModalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowExitModal(false)}
          >
            <View style={styles.exitModalContent}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.exitModalTitle}>Exit Temple</Text>
                <Text style={styles.exitModalMessage}>Do you want to save your changes before leaving?</Text>
                
                <View style={styles.exitModalButtons}>
                  <TouchableOpacity 
                    style={[styles.exitModalButton, styles.cancelButton]}
                    onPress={() => setShowExitModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.exitModalButton, styles.dontSaveButton]}
                    onPress={handleExitWithoutSaving}
                  >
                    <Text style={styles.dontSaveButtonText}>Don't Save</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.exitModalButton, styles.saveButton]}
                    onPress={handleExitWithSaving}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // so the transparent background is visible
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0, // Behind everything
  },
  garlandImage: {
    position: 'absolute',
    right: 0, // At the very right edge
    top: '50%',
    transform: [{ translateY: -210 }], // Perfect center: half of 420px height
    width: 420, // 3.5x original size (120 * 3.5)
    height: 420, // 3.5x original size (120 * 3.5)
    zIndex: 1, // Above background, below Ganesha
  },
  templeBellsImage: {
    position: 'absolute',
    right: -10, // 10px from right edge
    top: 150, // Positioned above the Garland
    width: 160, // 2x original size (80 * 2)
    height: 160, // 2x original size (80 * 2)
    zIndex: 1, // Above background, below Ganesha
  },
  templeBellsBottomImage: {
    position: 'absolute',
    right: -10, // 10px from right edge
    bottom: 150, // Positioned below the Garland
    width: 160, // 2x original size (80 * 2)
    height: 160, // 2x original size (80 * 2)
    zIndex: 1, // Above background, below Ganesha
  },
  standingLampTopImage: {
    position: 'absolute',
    left: -10, // 10px from left edge
    top: 150, // Same height as top temple bell
    width: 160, // 2x original size (80 * 2)
    height: 160, // 2x original size (80 * 2)
    zIndex: 1, // Above background, below Ganesha
  },
  standingLampBottomImage: {
    position: 'absolute',
    left: -10, // 10px from left edge
    bottom: 150, // Same height as bottom temple bell
    width: 160, // 2x original size (80 * 2)
    height: 160, // 2x original size (80 * 2)
    zIndex: 1, // Above background, below Ganesha
  },
  canvas: {
    flex: 1,
    zIndex: 10, // Above Garland
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 200,
  },
  controls: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
  },
  topIconBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 1001,
  },
  activeIconButton: {
    backgroundColor: '#FFD700',
    borderColor: 'white',
  },
  disabledIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  iconText: {
    fontSize: 24,
    transform: [{ rotate: '90deg' }],
  },
  iconImage: {
    width: 29,
    height: 29,
    transform: [{ rotate: '90deg' }],
  },
  positionContainer: {
    position: 'absolute',
    top: 100,
    width: 'auto',
    height: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  arrowButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorButton: {
    borderColor: 'white',
    borderWidth: 3,
  },
  intensityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 22,
    color: '#000000',
    fontWeight: 'bold',
  },
  label: {
    color: '#000000',
    fontSize: 18,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  notification: {
    position: 'absolute',
    top: 320,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#666',
    zIndex: 1000,
  },
  notificationSuccess: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  notificationError: {
    backgroundColor: '#f44336',
    borderColor: '#da190b',
  },
  notificationText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomIconContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  bottomIconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bottomIconText: {
    fontSize: 28,
    color: 'white',
  },
  disabledBottomIconButton: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledBottomIconText: {
    opacity: 0.5,
  },
  bottomIconImage: {
    width: 50,
    height: 50,
    transform: [{ rotate: '90deg' }],
  },
  flowerMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1999,
  },
  flowerMenu: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  flowerModalContent: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  flowerModalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  flowerOptions: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  flowerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  flowerIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6, // 25% smaller: 8 * 0.75 = 6
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flowerOptionEmoji: {
    fontSize: 18,
  },
  flowerOptionImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  flowerOptionLabel: {
    color: 'black',
    fontSize: 9, // 25% smaller: 12 * 0.75 = 9
    textAlign: 'center',
    fontWeight: '500',
    transform: [{ rotate: '90deg' }],
    marginRight: -2,
  },
  closeFlowerModalButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  closeFlowerModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fallingFlower: {
    position: 'absolute',
    zIndex: 15,
  },
  flowerEmoji: {
    fontSize: 36, // 50% bigger: 24 * 1.5 = 36
  },
  flowerImage: {
    width: 36, // 50% bigger: 24 * 1.5 = 36
    height: 36, // 50% bigger: 24 * 1.5 = 36
  },
  musicModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  musicModalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'stretch',
    marginTop: -100,
  },
  musicModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  musicModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  musicModalCloseButton: {
    backgroundColor: '#FF6A00',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  musicModalBody: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  musicModalBodyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  ganeshaToggleContainer: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  toggleItem: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 21,
  },
  toggleLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  musicFilterContainer: {
    width: '100%',
    marginBottom: 15,
  },
  musicFilterContent: {
    paddingHorizontal: 10,
  },
  musicFilterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  musicFilterButtonActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  musicFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  musicFilterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  musicListContainer: {
    flex: 1,
    width: '100%',
    minHeight: 200,
  },
  musicLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  musicLoadingText: {
    fontSize: 16,
    color: '#666',
  },
  musicEmptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  musicEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  musicItemContent: {
    flex: 1,
  },
  musicItemTitle: {
    fontSize: 16,
    fontWeight: '600',
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

  // Exit Modal Styles
  exitModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    flex: 1,
  },
  exitModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: 400,
    minHeight: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'red',
    transform: [{ rotate: '90deg' }],
  },
  exitModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  exitModalMessage: {
    fontSize: 16,
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  exitModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  exitModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  dontSaveButton: {
    backgroundColor: '#ff9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  dontSaveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // Control Panel Overlay Styles
  controlPanelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
    width: '100%',
    height: '100%',
  },
  controlPanelContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

});
