import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { 
  Dimensions, 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { getApiUrl } from '@/constants/ApiConfig';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

export const options = { headerShown: false };

interface TemplePuja {
  deityName: string;
  dayOfTheWeek: string;
  folderName: string;
  files?: Array<{
    key: string;
    name: string;
    size: number;
    lastModified: string;
    url: string;
  }>;
  fileCount?: number;
  s3Error?: string;
  images?: Array<{
    key: string;
    name: string;
    url: string;
    size: number;
  }>;
}

interface TodayPujasModalProps {
  visible: boolean;
  onClose: () => void;
  pujas: TemplePuja[];
  dayOfWeek: string;
  loading: boolean;
}

const TodayPujasModal: React.FC<TodayPujasModalProps> = ({ 
  visible, 
  onClose, 
  pujas, 
  dayOfWeek, 
  loading 
}) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Auto-close timer
  useEffect(() => {
    if (visible && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (visible && timeLeft === 0) {
      onClose();
    }
  }, [visible, timeLeft, onClose]);

  // Reset timer when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTimeLeft(15);
    }
  }, [visible]);

  const handleImageLoad = (imageKey: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageError = (imageKey: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
    console.log(`❌ Failed to load image: ${imageKey}`);
  };

  const handleImageLoadStart = (imageKey: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageKey]: true }));
    console.log(`🔄 Starting to load image: ${imageKey}`);
  };



  const getDayEmoji = (day: string) => {
    const dayEmojis: { [key: string]: string } = {
      'Monday': '🌙',
      'Tuesday': '🔴',
      'Wednesday': '🟢',
      'Thursday': '🟡',
      'Friday': '⚪',
      'Saturday': '🟤',
      'Sunday': '🔴'
    };
    return dayEmojis[day] || '🕉️';
  };

  const getDeityEmoji = (deityName: string) => {
    const deityEmojis: { [key: string]: string } = {
      'Ganesh': '🐘',
      'Shiv': '🕉️',
      'Vishnu': '🔵',
      'Krishna': '🎵',
      'Ram': '🏹',
      'Hanuman': '🐒',
      'Durga': '🗡️',
      'Lakshmi': '🌸',
      'Saraswati': '🎵',
      'Kali': '🌑',
      'Ganesha': '🐘',
      'Shiva': '🕉️',
      'Brahma': '📚',
      'Surya': '☀️',
      'Kartikeya': '🦚'
    };
    
    for (const [deity, emoji] of Object.entries(deityEmojis)) {
      if (deityName.toLowerCase().includes(deity.toLowerCase())) {
        return emoji;
      }
    }
    return '🕉️';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {getDayEmoji(dayOfWeek)} Today's Pujas - {dayOfWeek}
            </Text>
            <Text style={styles.modalSubtitle}>
              Divine blessings for {dayOfWeek.toLowerCase()}
            </Text>
          </View>

          {/* Timer indicator */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Auto-closes in {timeLeft}s</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9800" />
                <Text style={styles.loadingText}>Loading today's pujas...</Text>
              </View>
            ) : pujas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🙏</Text>
                <Text style={styles.emptyTitle}>No Pujas Today</Text>
                <Text style={styles.emptyText}>
                  No specific pujas are scheduled for {dayOfWeek}. 
                  You can still perform your daily prayers and meditation.
                </Text>
              </View>
            ) : (
              pujas.map((puja, index) => (
                <View key={index} style={styles.pujaCard}>
                  <View style={styles.pujaHeader}>
                    <Text style={styles.deityEmoji}>
                      {getDeityEmoji(puja.deityName)}
                    </Text>
                    <View style={styles.pujaInfo}>
                      <Text style={styles.deityName}>{puja.deityName}</Text>
                      <Text style={styles.dayText}>{puja.dayOfTheWeek}</Text>
                    </View>
                                                              <View style={styles.countsContainer}>
                        {puja.files && puja.files.length > 0 && (
                          <View style={styles.fileCount}>
                            <Text style={styles.fileCountText}>{puja.files.length}</Text>
                            <Text style={styles.fileCountLabel}>files</Text>
                          </View>
                        )}
                        {puja.images && puja.images.length > 0 && (
                          <View style={styles.imageCount}>
                            <Text style={styles.imageCountText}>{puja.images.length}</Text>
                            <Text style={styles.imageCountLabel}>images</Text>
                          </View>
                        )}
                      </View>
                  </View>
                  
                  {puja.s3Error && (
                    <Text style={styles.errorText}>⚠️ {puja.s3Error}</Text>
                  )}
                  
                                     {puja.images && puja.images.length > 0 && (
                     <View style={styles.imagesContainer}>
                       <Text style={styles.imagesTitle}>🖼️ Divine Images:</Text>
                       <FlatList
                         data={puja.images}
                         horizontal
                         showsHorizontalScrollIndicator={false}
                         keyExtractor={(item, index) => `${item.key}-${index}`}
                         renderItem={({ item }) => (
                           <View style={styles.imageItem}>
                             <View style={styles.imageContainer}>
                               {imageLoadingStates[item.key] !== false && (
                                 <ActivityIndicator 
                                   size="small" 
                                   color="#FF9800" 
                                   style={styles.imageLoader}
                                 />
                               )}
                                                               <Image
                                  source={{ uri: item.url }}
                                  style={styles.deityImage}
                                  resizeMode="cover"
                                  onLoadStart={() => handleImageLoadStart(item.key)}
                                  onLoad={() => handleImageLoad(item.key)}
                                  onError={() => handleImageError(item.key)}
                                />
                             </View>
                             <Text style={styles.imageName} numberOfLines={1}>
                               {item.name}
                             </Text>
                           </View>
                         )}
                         contentContainerStyle={styles.imagesList}
                       />
                     </View>
                   )}
                   
                   {puja.files && puja.files.length > 0 && (
                     <View style={styles.filesContainer}>
                       <Text style={styles.filesTitle}>📄 Other Resources:</Text>
                       {puja.files.slice(0, 3).map((file, fileIndex) => (
                         <View key={fileIndex} style={styles.fileItem}>
                           <Text style={styles.fileName}>📄 {file.name}</Text>
                           <Text style={styles.fileSize}>
                             {(file.size / 1024 / 1024).toFixed(2)} MB
                           </Text>
                         </View>
                       ))}
                       {puja.files.length > 3 && (
                         <Text style={styles.moreFiles}>
                           +{puja.files.length - 3} more files
                         </Text>
                       )}
                     </View>
                   )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.startPujaButton} onPress={onClose}>
              <LinearGradient
                colors={['#FFA040', '#FF6A00']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startPujaButtonText}>Start Today's Puja</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function NumerologyScreen() {
  const [showModal, setShowModal] = useState(false);
  const [todayPujas, setTodayPujas] = useState<TemplePuja[]>([]);
  const [loading, setLoading] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');

  // All Daily Temples modal state
  const [showAllTemplesModal, setShowAllTemplesModal] = useState(false);
  const [allTempleImages, setAllTempleImages] = useState<Array<{ key: string; name: string; url: string; size: number }>>([]);
  const [allTemplesLoading, setAllTemplesLoading] = useState(false);
  const [allTemplesPrefix, setAllTemplesPrefix] = useState<string>('');

  const getTodayDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const fetchTodayPujas = async () => {
    try {
      setLoading(true);
      const today = getTodayDayOfWeek();
      setDayOfWeek(today);
      
      console.log('🔍 Fetching pujas for:', today);
      
             const response = await fetch(getApiUrl(`/api/temples-by-day?dayOfWeek=${today.toLowerCase()}`));
       const data = await response.json();
       
                // Test S3 connection and files API directly for debugging
         console.log('🔍 Testing S3 connection...');
         try {
           // Test environment variables
           const debugResponse = await fetch(getApiUrl('/api/debug'));
           const debugData = await debugResponse.json();
           console.log('🔍 Backend Debug Info:', debugData);
           
           // Test basic S3 connection
           const s3TestResponse = await fetch(getApiUrl('/api/test-s3'));
           const s3TestData = await s3TestResponse.json();
           console.log('🔍 S3 Connection Test:', s3TestData);
         
         // Test specific folder if connection works
         if (s3TestData.success && data.temples && data.temples.length > 0) {
           const testFolder = data.temples[0].folderName;
           console.log('🔍 Testing S3 files API for folder:', testFolder);
           const s3FilesResponse = await fetch(getApiUrl(`/api/s3/files?prefix=${testFolder}/`));
           const s3FilesData = await s3FilesResponse.json();
           console.log('🔍 Direct S3 Files API response:', s3FilesData);
         }
       } catch (error) {
         console.error('❌ S3 API error:', error);
       }
      
             if (data.success && data.temples) {
         console.log('✅ Found pujas for today:', data.temples.length);
         console.log('🔍 Full API response:', JSON.stringify(data, null, 2));
         console.log('🔍 Sample puja data:', JSON.stringify(data.temples[0], null, 2));
        
                 // Process the pujas - files are already included from the backend
         const pujasWithImages = data.temples.map((puja: TemplePuja) => {
           console.log(`🔍 Processing puja: ${puja.deityName} with ${puja.files?.length || 0} files`);
           console.log(`🔍 Folder name: ${puja.folderName}`);
           console.log(`🔍 S3 Error: ${puja.s3Error || 'None'}`);
           
                       if (puja.files && puja.files.length > 0) {
              console.log(`🔍 Files for ${puja.deityName}:`, puja.files);
              // Filter for image files from the already fetched files
              const imageFiles = puja.files.filter((file: any) => {
               const fileName = file.name.toLowerCase();
               return fileName.endsWith('.jpg') || 
                      fileName.endsWith('.jpeg') || 
                      fileName.endsWith('.png') || 
                      fileName.endsWith('.webp') ||
                      fileName.endsWith('.gif');
             });
             
             // Convert to image format
             const images = imageFiles.map((file: any) => ({
               key: file.key,
               name: file.name,
               url: file.url, // URL is already provided by the backend
               size: file.size
             }));
             
             console.log(`✅ Found ${images.length} images for ${puja.deityName}`);
             return { ...puja, images };
           }
           
           return puja;
         });
        
                 setTodayPujas(pujasWithImages);
         
         // Test direct image URL access for debugging
         if (pujasWithImages.length > 0 && pujasWithImages[0].images && pujasWithImages[0].images.length > 0) {
           const testImageUrl = pujasWithImages[0].images[0].url;
           console.log('🔍 Testing direct image URL access:', testImageUrl);
           
           fetch(testImageUrl)
             .then(response => {
               console.log('🔍 Image fetch response status:', response.status);
               console.log('🔍 Image fetch response headers:', response.headers);
               if (!response.ok) {
                 console.log('❌ Image fetch failed with status:', response.status);
               } else {
                 console.log('✅ Image fetch successful');
               }
             })
             .catch(error => {
               console.error('❌ Image fetch error:', error);
             });
         }
       } else {
         console.log('⚠️ No pujas found for today');
         setTodayPujas([]);
       }
    } catch (error) {
      console.error('❌ Error fetching today\'s pujas:', error);
      Alert.alert('Error', 'Failed to fetch today\'s pujas. Please try again.');
      setTodayPujas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPujas = async () => {
    await fetchTodayPujas();
    setShowModal(true);
  };

  // Helpers for All Temples
  const candidateDailyPrefixes = [
    'deailytemples/', // as provided by user
    'dailytemples/',
    'daily temples/',
    'DailyTemples/',
    'Daily Temples/',
  ];

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

  const fetchPresignedUrl = async (key: string): Promise<string | null> => {
    try {
      const res = await fetch(getApiUrl(`/api/s3/download-url?key=${encodeURIComponent(key)}&expiresIn=3600`));
      const data = await res.json();
      if (data && data.success && data.presignedUrl) return data.presignedUrl;
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchAllDailyTemplesImages = async () => {
    setAllTemplesLoading(true);
    try {
      let chosenPrefix: string | null = null;
      let files: Array<{ key: string; size: number }> = [];

      for (const prefix of candidateDailyPrefixes) {
        try {
          const res = await fetch(getApiUrl(`/api/s3/files?prefix=${encodeURIComponent(prefix)}&maxKeys=2000`));
          const data = await res.json();
          if (data && data.success && Array.isArray(data.files) && data.files.length > 0) {
            // Filter out the folder marker itself and non-images
            const filtered = data.files.filter((f: any) => f && typeof f.key === 'string' && f.key !== prefix && isImageKey(f.key));
            if (filtered.length > 0) {
              chosenPrefix = prefix;
              files = filtered.map((f: any) => ({ key: f.key, size: f.size || 0 }));
              break;
            }
          }
        } catch (e) {
          // try next prefix
        }
      }

      if (!chosenPrefix) {
        Alert.alert('No Images Found', 'Could not find images under daily temples.');
        setAllTempleImages([]);
        return;
      }

      setAllTemplesPrefix(chosenPrefix);

      // Limit to avoid too many parallel requests
      const LIMITED_MAX = 300;
      const limitedFiles = files.slice(0, LIMITED_MAX);

      const results = await Promise.all(
        limitedFiles.map(async (f) => {
          const url = await fetchPresignedUrl(f.key);
          return {
            key: f.key,
            name: f.key.split('/').pop() || f.key,
            url: url || '',
            size: f.size,
          };
        })
      );

      const images = results.filter(img => img.url);
      setAllTempleImages(images);
    } finally {
      setAllTemplesLoading(false);
    }
  };

  const handleShowAllTemples = async () => {
    await fetchAllDailyTemplesImages();
    setShowAllTemplesModal(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Today's Pujas</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      <View style={styles.card}>
        <Text style={styles.title}>🕉️ Daily Pujas</Text>
        <Text style={styles.subtitle}>
          Discover the divine pujas and rituals recommended for today
        </Text>
        
        <TouchableOpacity style={styles.showPujasButton} onPress={handleShowPujas}>
          <LinearGradient
            colors={['#FFA040', '#FF6A00']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>View Today's Pujas</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.showPujasButton} onPress={handleShowAllTemples}>
          <LinearGradient
            colors={["#8BC34A", "#4CAF50"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Show All Temples</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📅 Today is {getTodayDayOfWeek()}</Text>
          <Text style={styles.infoText}>
            Each day of the week is associated with specific deities and pujas. 
            Performing these pujas on their designated days brings special blessings.
          </Text>
        </View>
      </View>

      {/* Today's Pujas Modal */}
      <TodayPujasModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        pujas={todayPujas}
        dayOfWeek={dayOfWeek}
        loading={loading}
      />

      {/* All Daily Temples Modal */}
      <Modal
        visible={showAllTemplesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllTemplesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowAllTemplesModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Daily Temples</Text>
              {!!allTemplesPrefix && (
                <Text style={styles.modalSubtitle}>Source: {allTemplesPrefix}</Text>
              )}
            </View>

            <View style={styles.modalContent}>
              {allTemplesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Loading all temples...</Text>
                </View>
              ) : allTempleImages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🛕</Text>
                  <Text style={styles.emptyTitle}>No Images Found</Text>
                  <Text style={styles.emptyText}>
                    We couldn't find images in the daily temples folder.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={allTempleImages}
                  keyExtractor={(item) => item.key}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
                  renderItem={({ item }) => (
                    <View style={{ width: '32%', alignItems: 'center' }}>
                      <Image source={{ uri: item.url }} style={styles.deityImage} resizeMode="cover" />
                      <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
                    </View>
                  )}
                />
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.startPujaButton} onPress={() => setShowAllTemplesModal(false)}>
                <LinearGradient
                  colors={["#8BC34A", "#4CAF50"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.startPujaButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8,
    height: 120 * 0.8,
    left: width * -0.25 * 0.8,
    bottom: CARD_TOP + CARD_MARGIN_TOP - 120 - 60,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  showPujasButton: {
    width: '100%',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 2,
    height: '95%',
    width: '99%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalHeader: {
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  timerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  timerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  pujaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pujaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deityEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  pujaInfo: {
    flex: 1,
  },
  deityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  countsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileCount: {
    alignItems: 'center',
  },
  fileCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  fileCountLabel: {
    fontSize: 10,
    color: '#666',
  },
  imageCount: {
    alignItems: 'center',
  },
  imageCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  imageCountLabel: {
    fontSize: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
    marginTop: 4,
  },
  filesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  fileSize: {
    fontSize: 10,
    color: '#999',
  },
  moreFiles: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  imagesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  imagesList: {
    paddingRight: 16,
  },
  imageItem: {
    marginRight: 20,
    alignItems: 'center',
    width: 120,
  },
  imageContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    zIndex: 1,
  },
  deityImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  imageName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    width: '100%',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  startPujaButton: {
    width: '100%',
  },
  startPujaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 