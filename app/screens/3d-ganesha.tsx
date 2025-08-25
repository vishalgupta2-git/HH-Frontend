// GaneshaTint.js
import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert, Image, Animated } from "react-native";
import { Canvas, Image as SkiaImage, useImage, ColorMatrix, Group } from "@shopify/react-native-skia";
import { useWindowDimensions } from 'react-native';
import { getApiUrl, getAuthHeaders } from '../../constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GaneshaTint() {
  const [tintColor, setTintColor] = useState("gold");
  const [tintIntensity, setTintIntensity] = useState(0.3);
  const [imageSize, setImageSize] = useState(0.4); // 0.1 to 1.2 range
  const [imageX, setImageX] = useState(0); // -100 to 100 range
  const [imageY, setImageY] = useState(0); // -100 to 100 range
  const [activePanel, setActivePanel] = useState<string | null>(null); // null, 'tint', 'size', 'position'
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  // Get device dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animated values for swinging bells
  const topBellsSwing = useRef(new Animated.Value(0)).current;
  const bottomBellsSwing = useRef(new Animated.Value(0)).current;

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

  // Start swinging bells animation
  useEffect(() => {
    const createSwingingAnimation = (animatedValue: Animated.Value, delay: number = 0) => {
      const swingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: -1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      
      setTimeout(() => swingAnimation.start(), delay);
      return swingAnimation;
    };

    const topBellsAnimation = createSwingingAnimation(topBellsSwing, 0);
    const bottomBellsAnimation = createSwingingAnimation(bottomBellsSwing, 1000); // Slight delay for variety

    return () => {
      topBellsAnimation.stop();
      bottomBellsAnimation.stop();
    };
  }, [topBellsSwing, bottomBellsSwing]);
  
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
      
      const response = await fetch(getApiUrl('/api/save-temple'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templeData)
      });
      
      if (response.ok) {
        // Show quick notification instead of modal
        setMessage('Temple Saved');
        setMessageType('success');
        // Clear message after 2 seconds
        setTimeout(() => {
          setMessage('');
        }, 2000);
      } else {
        setMessage('Failed to save temple');
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
    }
  };

  // Handle back button with save confirmation
  const handleBackButton = () => {
    Alert.alert(
      "Save Changes?",
      "Do you want to save your temple changes before going back?",
      [
        {
          text: "Don't Save",
          style: "destructive",
          onPress: () => {
            // Go back without saving
            console.log('Going back without saving');
            // Navigate to previous screen
            if (typeof window !== 'undefined' && window.history) {
              window.history.back();
            }
          }
        },
        {
          text: "Save",
          onPress: async () => {
            // Save first, then go back
            if (!userId) {
              alert('Please log in to save your temple configuration');
              // Still go back even without saving
              if (typeof window !== 'undefined' && window.history) {
                window.history.back();
              }
              return;
            }

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
              
              const response = await fetch(getApiUrl('/api/save-temple'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(templeData),
              });
              
              if (response.ok) {
                console.log('✅ Temple saved successfully, going back');
                // Navigate to previous screen after successful save
                if (typeof window !== 'undefined' && window.history) {
                  window.history.back();
                }
              } else {
                console.error('❌ Failed to save temple');
                // Still go back even if save fails
                if (typeof window !== 'undefined' && window.history) {
                  window.history.back();
                }
              }
            } catch (error) {
              console.error('❌ Error saving temple:', error);
              // Still go back even if save fails
              if (typeof window !== 'undefined' && window.history) {
                window.history.back();
              }
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Don't render until image is loaded
  if (!image) {
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
                inputRange: [-1, 1],
                outputRange: ['-15deg', '15deg']
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
                inputRange: [-1, 1],
                outputRange: ['-15deg', '15deg']
              })},
              { translateX: -80 } // Move back to original position
            ]
          }
        ]}
        resizeMode="contain"
      />
      
      <Canvas style={[styles.canvas, { width: screenWidth, height: screenHeight }]}>
        <Group>
          <ColorMatrix matrix={getColorMatrix(tintColor, tintIntensity)} />
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
          <Text style={styles.iconText}>📏</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.iconButton, activePanel === 'position' && styles.activeIconButton]}
          onPress={() => setActivePanel(activePanel === 'position' ? null : 'position')}
        >
          <Text style={styles.iconText}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSaveTemple}
        >
          <Text style={styles.iconText}>💾</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBackButton}
        >
          <Text style={styles.iconText}>⬅️</Text>
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
        <TouchableOpacity style={styles.bottomIconButton}>
          <Text style={[styles.bottomIconText, { transform: [{ rotate: '90deg' }] }]}>🎵</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomIconButton}>
          <Image 
            source={require("../../assets/images/icons/own temple/PujaThali1.png")}
            style={styles.bottomIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomIconButton}>
          <Text style={styles.bottomIconText}>🌸</Text>
        </TouchableOpacity>
      </View>
      
      {/* Dynamic Control Panel */}
      <View style={[
        styles.controls, 
        { 
          top: activePanel === 'position' || activePanel === 'tint' || activePanel === 'size' ? 0 : 200,
          left: 0
        }
      ]}>
        {activePanel === 'tint' && (
          <>
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
            
            <View style={[styles.positionContainer, { top: 180 }]}>
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
          </>
        )}
        
        {activePanel === 'size' && (
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
        )}
        
        {activePanel === 'position' && (
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
        )}
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
    backgroundColor: '#333',
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
  iconText: {
    fontSize: 24,
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
    backgroundColor: '#333',
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
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 15,
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
    bottom: 100,
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
    backgroundColor: '#333',
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
  bottomIconImage: {
    width: 50,
    height: 50,
    transform: [{ rotate: '90deg' }],
  },
});
