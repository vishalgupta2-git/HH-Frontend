import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  AppState,
} from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AudioVideoModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MusicFile {
  avld: string;
  VideoName: string;
  Deity: string;
  Artists: string;
  Type: string;
  Duration: string;
  Language: string;
  Link: string;
  MediaType: string;
  Classification: string;
  famous?: boolean;
}

const AudioVideoModal: React.FC<AudioVideoModalProps> = ({ visible, onClose }) => {
  const { isHindi } = useLanguage();
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);

  const translations = {
    title: { en: 'Divine Music', hi: 'भक्ति संगीत' },
    searchPlaceholder: { en: 'Search music...', hi: 'संगीत खोजें...' },
    loading: { en: 'Loading music...', hi: 'संगीत लोड हो रहा है...' },
    noMusic: { en: 'No music available', hi: 'कोई संगीत उपलब्ध नहीं' },
    audio: { en: 'Audio', hi: 'ऑडियो' },
    video: { en: 'Video', hi: 'वीडियो' },
    all: { en: 'All', hi: 'सभी' },
    famous: { en: 'Famous', hi: 'प्रसिद्ध' },
    aarti: { en: 'Aarti', hi: 'आरती' },
    bhajan: { en: 'Bhajan', hi: 'भजन' },
    chalisa: { en: 'Chalisa', hi: 'चालीसा' },
    katha: { en: 'Katha', hi: 'कथा' },
    paath: { en: 'Paath / Strotam', hi: 'पाठ / स्तोत्र' },
    stopMusic: { en: 'Stop Music', hi: 'संगीत बंद करें' },
    playMusic: { en: 'Play Music', hi: 'संगीत चलाएं' },
    previousSong: { en: 'Previous', hi: 'पिछला' },
    nextSong: { en: 'Next', hi: 'अगला' },
    rewind: { en: 'Rewind', hi: 'पीछे' },
    forward: { en: 'Forward', hi: 'आगे' },
    play: { en: 'Play', hi: 'चलाएं' },
    pause: { en: 'Pause', hi: 'रोकें' },
    stop: { en: 'Stop', hi: 'बंद' },
    deityNames: {
      brahma: { en: 'Brahma Ji', hi: 'ब्रह्मा जी' },
      brihaspati: { en: 'Brihaspati Dev', hi: 'बृहस्पति देव' },
      durga: { en: 'Durga Maa', hi: 'दुर्गा मां' },
      ganga: { en: 'Ganga Maiya', hi: 'गंगा मैया' },
      khatuShyam: { en: 'Khatu Shyam Ji', hi: 'खाटू श्याम जी' },
      lakshmi: { en: 'Lakshmi Maa', hi: 'लक्ष्मी मां' },
      kali: { en: 'Maa Kali', hi: 'मां काली' },
      shiv: { en: 'Mahadev Shiv Ji', hi: 'महादेव शिव जी' },
      hanuman: { en: 'Mahaveer Hanuman', hi: 'महावीर हनुमान' },
      navgrah: { en: 'Navgrah', hi: 'नवग्रह' },
      rahuKetu: { en: 'Rahu Ketu', hi: 'राहु केतु' },
      saraswati: { en: 'Saraswati Maa', hi: 'सरस्वती मां' },
      shani: { en: 'Shani Dev', hi: 'शनि देव' },
      krishna: { en: 'Shri Krishna', hi: 'श्री कृष्ण' },
      ram: { en: 'Shri Ram', hi: 'श्री राम' },
      ganesh: { en: 'Vighnaharta Ganesh', hi: 'विघ्नहर्ता गणेश' },
      vishnu: { en: 'Vishnu Bhagwan', hi: 'विष्णु भगवान' }
    }
  };

  // Extract metadata from music file
  const extractMusicMetadata = (file: MusicFile) => {
    return {
      title: file.VideoName || 'Unknown Title',
      deity: file.Deity || 'Unknown Deity',
      category: file.Type || 'Unknown Category',
      duration: file.Duration || 'Unknown Duration',
      language: file.Language || 'Unknown Language',
      artists: file.Artists || 'Unknown Artist',
    };
  };

  // Fetch music files
  const fetchMusicFiles = async () => {
    try {
      setLoading(true);
      const url = getEndpointUrl('MEDIA_FILES');
      
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setMusicFiles(data);
      }
    } catch (error) {
      console.error('Error fetching music files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Play music file
  const playMusicFile = async (file: MusicFile) => {
    try {
      // Stop current music if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

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
      
      // Ensure audio session is configured for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      
      setSound(newSound);
      setCurrentlyPlaying(file.avld);
      setIsPlaying(true);

      // Set up auto-play next song when current ends
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentlyPlaying(null);
          setSound(null);
        }
      });

    } catch (error) {
      console.error('Error playing music:', error);
      Alert.alert('Error', 'Failed to play music file');
    }
  };

  // Stop current music
  const stopCurrentMusic = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      setSound(null);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  };

  // Audio control functions
  const rewindAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, (status.positionMillis || 0) - 10000); // 10 seconds back
          await sound.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.error('Error rewinding audio:', error);
    }
  };

  const forwardAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.min((status.durationMillis || 0), (status.positionMillis || 0) + 10000); // 10 seconds forward
          await sound.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.error('Error forwarding audio:', error);
    }
  };

  const playPreviousSong = () => {
    const currentFilteredList = filteredMusicFiles;
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    const currentIndex = currentFilteredList.findIndex(file => file.avld === currentlyPlaying);
    if (currentIndex === -1) return;
    
    const previousIndex = currentIndex === 0 ? currentFilteredList.length - 1 : currentIndex - 1;
    const previousFile = currentFilteredList[previousIndex];
    
    playMusicFile(previousFile);
  };

  const playNextSong = () => {
    const currentFilteredList = filteredMusicFiles;
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    const currentIndex = currentFilteredList.findIndex(file => file.avld === currentlyPlaying);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % currentFilteredList.length;
    const nextFile = currentFilteredList[nextIndex];
    
    playMusicFile(nextFile);
  };

  const togglePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          // Ensure audio session is configured for background playback before resuming
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          });
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Handle deity selection
  const handleDeitySelect = (deity: string) => {
    const newDeity = selectedDeity === deity ? null : deity;
    setSelectedDeity(newDeity);
  };

  // Filter music files - only show audio files
  const filteredMusicFiles = musicFiles.filter(file => {
    if (!file) return false;
    
    // Only show audio files
    if (file.Classification !== 'Audio') {
      return false;
    }
    
    // Apply deity filter
    if (selectedDeity && file.Deity !== selectedDeity) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.trim().toLowerCase();
      const title = file.VideoName?.toLowerCase() || '';
      const deity = file.Deity?.toLowerCase() || '';
      const artists = file.Artists?.toLowerCase() || '';
      return title.includes(searchLower) || deity.includes(searchLower) || artists.includes(searchLower);
    }
    
    // Apply category filter
    if (selectedFilter !== 'All') {
      if (selectedFilter === 'Famous') {
        return file.famous === true;
      }
      return file.Type === selectedFilter;
    }
    
    return true;
  });

  // Configure audio session for background playback
  useEffect(() => {
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
      } catch (error) {
        console.error('Error configuring audio session:', error);
      }
    };

    configureAudioSession();
  }, []);

  // Handle app state changes to maintain audio playback
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && sound && isPlaying) {
        // Keep audio playing in background
      } else if (nextAppState === 'active' && sound && isPlaying) {
        // App came back to foreground
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, isPlaying]);

  // Load music files when modal opens and reconfigure audio session
  useEffect(() => {
    if (visible) {
      fetchMusicFiles();
      // Reconfigure audio session when modal opens to ensure background playback
      const reconfigureAudio = async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          });
        } catch (error) {
          console.error('Error reconfiguring audio session:', error);
        }
      };
      reconfigureAudio();
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>
            ॐ {isHindi ? translations.title.hi : translations.title.en} ॐ
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Audio Controls Row */}
        <View style={styles.audioControlsRow}>
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={playPreviousSong}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons name="skip-previous" size={20} color={currentlyPlaying ? "#FF6A00" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={rewindAudio}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons name="rewind-10" size={20} color={currentlyPlaying ? "#FF6A00" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={stopCurrentMusic}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons name="stop" size={20} color={currentlyPlaying ? "#FF6A00" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={togglePlayPause}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color={currentlyPlaying ? "#FF6A00" : "#ccc"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={forwardAudio}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons name="fast-forward-10" size={20} color={currentlyPlaying ? "#FF6A00" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.audioControlButton}
            onPress={playNextSong}
            disabled={!currentlyPlaying}
          >
            <MaterialCommunityIcons name="skip-next" size={20} color={currentlyPlaying ? "#FF6A00" : "#ccc"} />
          </TouchableOpacity>
        </View>

        {/* Deity Icons - Horizontal Scrollable */}
        <View style={styles.deityIconsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.deityIconsContent}
          >
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Brahma Ji' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Brahma Ji')}
            >
              <Image source={require('@/assets/images/temple/Brahma1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel} numberOfLines={1}>{isHindi ? translations.deityNames.brahma.hi : translations.deityNames.brahma.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Brihaspati Dev' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Brihaspati Dev')}
            >
              <Image source={require('@/assets/images/temple/BrihaspatiIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.brihaspati.hi : translations.deityNames.brihaspati.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Durga Maa' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Durga Maa')}
            >
              <Image source={require('@/assets/images/temple/Durga1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.durga.hi : translations.deityNames.durga.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Ganga Maiya' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Ganga Maiya')}
            >
              <Image source={require('@/assets/images/temple/gangaMaiyaaIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.ganga.hi : translations.deityNames.ganga.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Khatu Shyam Ji' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Khatu Shyam Ji')}
            >
              <Image source={require('@/assets/images/temple/KhatuShyamIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.khatuShyam.hi : translations.deityNames.khatuShyam.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Lakshmi Maa' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Lakshmi Maa')}
            >
              <Image source={require('@/assets/images/temple/Lakshmi1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.lakshmi.hi : translations.deityNames.lakshmi.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Maa Kali' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Maa Kali')}
            >
              <Image source={require('@/assets/images/temple/maaKaliIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.kali.hi : translations.deityNames.kali.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Mahadev Shiv Ji' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Mahadev Shiv Ji')}
            >
              <Image source={require('@/assets/images/temple/New folder/Shiv4.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.shiv.hi : translations.deityNames.shiv.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Mahaveer Hanuman' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Mahaveer Hanuman')}
            >
              <Image source={require('@/assets/images/temple/Hanuman1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.hanuman.hi : translations.deityNames.hanuman.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Navgrah' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Navgrah')}
            >
              <Image source={require('@/assets/images/temple/navgrahIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.navgrah.hi : translations.deityNames.navgrah.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Rahu Ketu' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Rahu Ketu')}
            >
              <Image source={require('@/assets/images/temple/RahuKetuIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.rahuKetu.hi : translations.deityNames.rahuKetu.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Saraswati Maa' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Saraswati Maa')}
            >
              <Image source={require('@/assets/images/temple/Saraswati1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.saraswati.hi : translations.deityNames.saraswati.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Shani Dev' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Shani Dev')}
            >
              <Image source={require('@/assets/images/temple/shaniDevIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.shani.hi : translations.deityNames.shani.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Shri Krishna' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Shri Krishna')}
            >
              <Image source={require('@/assets/images/temple/Krishna1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.krishna.hi : translations.deityNames.krishna.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Shri Ram' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Shri Ram')}
            >
              <Image source={require('@/assets/images/temple/Rama1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.ram.hi : translations.deityNames.ram.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Vighnaharta Ganesh' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Vighnaharta Ganesh')}
            >
              <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.ganesh.hi : translations.deityNames.ganesh.en}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.deityIconItem,
                selectedDeity === 'Vishnu Bhagwan' && styles.deityIconItemSelected
              ]}
              onPress={() => handleDeitySelect('Vishnu Bhagwan')}
            >
              <Image source={require('@/assets/images/temple/VishnuIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
              <Text style={styles.deityIconLabel}>{isHindi ? translations.deityNames.vishnu.hi : translations.deityNames.vishnu.en}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterButtonsContent}
          >
          {[
            { key: 'All', label: isHindi ? translations.all.hi : translations.all.en },
            { key: 'Aarti', label: isHindi ? translations.aarti.hi : translations.aarti.en },
            { key: 'Bhajan', label: isHindi ? translations.bhajan.hi : translations.bhajan.en },
            { key: 'Chalisa', label: isHindi ? translations.chalisa.hi : translations.chalisa.en },
            { key: 'Katha', label: isHindi ? translations.katha.hi : translations.katha.en },
            { key: 'Paath / Strotam', label: isHindi ? translations.paath.hi : translations.paath.en },
            { key: 'Famous', label: isHindi ? translations.famous.hi : translations.famous.en }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.activeFilterButtonText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>

        {/* Music List */}
        <ScrollView style={styles.musicList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6A00" />
              <Text style={styles.loadingText}>
                {isHindi ? translations.loading.hi : translations.loading.en}
              </Text>
            </View>
          ) : filteredMusicFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="music-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {isHindi ? translations.noMusic.hi : translations.noMusic.en}
              </Text>
            </View>
          ) : (
            filteredMusicFiles.map((file, index) => {
              const metadata = extractMusicMetadata(file);
              const isCurrentlyPlaying = currentlyPlaying === file.avld;
              
              return (
                <TouchableOpacity
                  key={file.avld || index}
                  style={[styles.musicItem, isCurrentlyPlaying && styles.currentlyPlayingItem]}
                  onPress={() => {
                    if (isCurrentlyPlaying) {
                      stopCurrentMusic();
                    } else {
                      playMusicFile(file);
                    }
                  }}
                >
                  <View style={styles.musicItemContent}>
                    <Text style={styles.musicItemTitle}>{metadata.title}</Text>
                    <Text style={styles.musicItemSubtitle}>
                      {metadata.deity ? `${metadata.deity} • ${metadata.category}` : metadata.category}
                    </Text>
                    <Text style={styles.musicItemDuration}>
                      {metadata.duration} {metadata.language ? `• ${metadata.language}` : ''}
                    </Text>
                  </View>
                  <View style={styles.musicItemActions}>
                    {isCurrentlyPlaying ? (
                      <MaterialCommunityIcons name="stop" size={24} color="#FF6A00" />
                    ) : (
                      <MaterialCommunityIcons name="play" size={24} color="#FF6A00" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Bottom Controls */}
        {currentlyPlaying && (
          <View style={styles.bottomControls}>
            <View style={styles.currentTrackInfo}>
              <Text style={styles.currentTrackTitle}>
                {extractMusicMetadata(musicFiles.find(f => f.avld === currentlyPlaying) || {}).title}
              </Text>
              <Text style={styles.currentTrackSubtitle}>
                {isPlaying ? 'Playing' : 'Paused'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopCurrentMusic}
            >
              <Text style={styles.stopButtonText}>
                {isHindi ? translations.stopMusic.hi : translations.stopMusic.en}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  audioControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 15,
  },
  audioControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterButtonsContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  filterButtonsContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  musicList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentlyPlayingItem: {
    backgroundColor: '#fff5f0',
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
  musicItemActions: {
    padding: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  currentTrackInfo: {
    flex: 1,
  },
  currentTrackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentTrackSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stopButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Deity Icons Styles
  deityIconsContainer: {
    marginVertical: 5,
    paddingHorizontal: 20,
    height: 80,
  },
  deityIconsContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  deityIconItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    minWidth: 60,
    minHeight: 60,
  },
  deityIconImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  deityIconLabel: {
    fontSize: 8,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  deityIconItemSelected: {
    backgroundColor: 'rgba(255, 106, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
});

export default AudioVideoModal;
