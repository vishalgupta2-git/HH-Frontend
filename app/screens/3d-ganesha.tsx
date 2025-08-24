// GaneshaTint.js
import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert } from "react-native";
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
  const [templeName, setTempleName] = useState("My Ganesha Temple");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get device dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Load userId from AsyncStorage when component mounts
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUserId(userData.userId);
        }
      } catch (error) {
        console.error('Error loading userId:', error);
      }
    };
    
    loadUserId();
  }, []);
  
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
      alert('Please log in to save your temple configuration');
      return;
    }

    try {
      const templeData = {
        userId: userId,
        templeName: templeName,
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
        alert('Temple saved successfully!');
      } else {
        alert('Failed to save temple');
      }
    } catch (error) {
      console.error('Error saving temple:', error);
      alert('Error saving temple');
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
                templeName: templeName,
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
       
       {/* Temple Name Input */}
       <View style={styles.templeNameContainer}>
         <Text style={styles.label}>Temple Name:</Text>
         <TextInput
           style={styles.templeNameInput}
           value={templeName}
           onChangeText={setTempleName}
           placeholder="Enter temple name"
           placeholderTextColor="#666"
         />
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
  canvas: {
    flex: 1,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  controls: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    zIndex: 100,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  colorButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  activeColorButton: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  intensityControls: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  intensityButton: {
    padding: 15,
    borderRadius: 25,
    marginHorizontal: 10,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
    tintColorContainer: {
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
    tintIntensityContainer: {
      position: 'absolute',
      top: 180,
      width: 'auto',
      height: 80,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    templeNameContainer: {
      position: 'absolute',
      top: 260,
      width: 'auto',
      alignSelf: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    templeNameInput: {
      backgroundColor: '#333',
      color: 'white',
      borderWidth: 1,
      borderColor: '#666',
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
      minWidth: 200,
      textAlign: 'center',
    },
  });
