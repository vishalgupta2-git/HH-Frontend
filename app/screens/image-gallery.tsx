import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dimensions, 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  PanResponder,
  Animated
} from 'react-native';
import { getApiUrl } from '@/constants/ApiConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const options = { headerShown: false };

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

export default function ImageGalleryScreen() {
  const [folders, setFolders] = useState<ImageFolder[]>([]);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<string>('Initializing...');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Animation values for swipe gestures
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
        // Extract folder name from pattern: dailytemples/folderName/
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
      
      const res = await fetch(presignedUrl);
      
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
      
      const res = await fetch(apiUrl);
      
      const data = await res.json();
      
      if (data && data.success && Array.isArray(data.files)) {
        // Extract folder names from the API response
        const folderNames = extractFolderNames(data.files);
        
        // Create folder objects with their respective images
        const organizedFolders: ImageFolder[] = [];
        
        for (const folderName of folderNames) {
          const folderPrefix = `dailytemples/${folderName}/`;
          
          // Filter images for this specific folder
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
              name: folderName.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to readable
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
        
        // Set the first image URL
        const firstImage = allFolders[0].images[0];
        const firstImageUrl = await fetchPresignedUrl(firstImage.key);
        if (firstImageUrl) {
          setCurrentImageUrl(firstImageUrl);
          setLoading(false); // Stop loading when first image is ready
        }
        
        // In the background, preload all images from all folders
        preloadAllImages(allFolders);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const preloadAllImages = async (allFolders: ImageFolder[]) => {
    for (const folder of allFolders) {
      for (const image of folder.images) {
        try {
          const presignedUrl = await fetchPresignedUrl(image.key);
          if (presignedUrl) {
            await Image.prefetch(presignedUrl);
          }
        } catch (error) {
          // Continue with next image
        }
      }
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
      
      // Get the current image key and fetch its presigned URL
      const currentImage = folders[currentFolderIndex].images[currentImageIndex];
      
      fetchPresignedUrl(currentImage.key).then(presignedUrl => {
        if (presignedUrl) {
          setCurrentImageUrl(presignedUrl);
        }
      });
    }
  }, [currentFolderIndex, currentImageIndex, folders]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // Reset offset to current position
        pan.setOffset({
          x: 0,
          y: 0,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        const { dx, dy } = gestureState;
        const swipeThreshold = 50;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > swipeThreshold) {
            // Swipe right - previous folder
            navigateToPreviousFolder();
          } else if (dx < -swipeThreshold) {
            // Swipe left - next folder
            navigateToNextFolder();
          }
        } else {
          // Vertical swipe
          if (dy > swipeThreshold) {
            // Swipe down - previous image
            navigateToPreviousImage();
          } else if (dy < -swipeThreshold) {
            // Swipe up - next image
            navigateToNextImage();
          }
        }
        
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Navigation functions
  const navigateToNextImage = () => {
    if (folders.length === 0) return;
    
    const currentFolder = folders[currentFolderIndex];
    if (currentImageIndex < currentFolder.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Loop back to first image
      setCurrentImageIndex(0);
    }
  };

  const navigateToPreviousImage = () => {
    if (folders.length === 0) return;
    
    const currentFolder = folders[currentFolderIndex];
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // Loop to last image
      setCurrentImageIndex(currentFolder.images.length - 1);
    }
  };

  const navigateToNextFolder = () => {
    if (currentFolderIndex < folders.length - 1) {
      setCurrentFolderIndex(currentFolderIndex + 1);
      setCurrentImageIndex(0);
    } else {
      // Loop back to first folder
      setCurrentFolderIndex(0);
      setCurrentImageIndex(0);
    }
  };

  const navigateToPreviousFolder = () => {
    if (currentFolderIndex > 0) {
      setCurrentFolderIndex(currentFolderIndex - 1);
      setCurrentImageIndex(0);
    } else {
      // Loop to last folder
      setCurrentFolderIndex(folders.length - 1);
      setCurrentImageIndex(0);
    }
  };

  if (loading || !currentImageUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={styles.loadingText}>Loading Images...</Text>
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
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Image Gallery</Text>
        <Text style={styles.headerSubtitle}>
          {currentFolder.name} • {currentImageIndex + 1} of {currentFolder.images.length}
        </Text>
        {isLoadingMore && (
          <View style={styles.loadingProgressContainer}>
            <Text style={styles.loadingProgressText}>{loadingProgress}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              transform: pan.getTranslateTransform(),
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: currentImageUrl }}
            style={styles.mainImage}
            resizeMode="contain"
            onError={(error) => {
              Alert.alert('Error', 'Failed to load image');
            }}
          />
        </Animated.View>
      </View>

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

      <View style={styles.infoContainer}>
        <Text style={styles.folderInfo}>
          Folder: {currentFolder.name} ({currentFolder.images.length} images)
        </Text>
        <Text style={styles.imageInfo}>
          Image: {currentImage.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    width: screenWidth - 40,
    height: screenHeight * 0.6,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainImage: {
    width: '100%',
    height: '100%',
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
  loadingProgressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  loadingProgressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
