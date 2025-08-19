import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Audio } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';

interface MediaFile {
  avld: string;
  Type: string;
  Classification: string;
  VideoName: string;
  Link: string;
  Deity: string;
  Language: string;
  Artists: string;
  Duration: string;
  MediaType: string;
  CreatedAt: string;
  famous?: boolean; // Optional boolean field for famous content
}



function extractYouTubeId(url: string): string | null {
  let videoId: string | null = null;
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  const embedMatch = url.match(/embed\/([\w-]+)/);
  if (embedMatch) videoId = embedMatch[1];
  return videoId;
}

export default function AudioVideoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  // Audio playback state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  useEffect(() => {
    // Configure audio session for background playback
    const configureAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio session configured for background playback');
      } catch (error) {
        console.error('❌ Failed to configure audio session:', error);
      }
    };

    configureAudioSession();
    
    const fetchMedia = async () => {
      try {
        const url = getEndpointUrl('MEDIA_FILES');
        console.log('🔍 [AUDIO-VIDEO] ===== STARTING API CALL =====');
        console.log('🔍 [AUDIO-VIDEO] Fetching media files from:', url);
        console.log('🔍 [AUDIO-VIDEO] Full URL:', url);
        console.log('🔍 [AUDIO-VIDEO] Request timestamp:', new Date().toISOString());
        
        const res = await axios.get(url, {
          headers: getAuthHeaders()
        });
        console.log('📱 [AUDIO-VIDEO] ===== API RESPONSE RECEIVED =====');
        console.log('📱 [AUDIO-VIDEO] Response status:', res.status);
        console.log('📱 [AUDIO-VIDEO] Response headers:', JSON.stringify(res.headers, null, 2));
        console.log('📱 [AUDIO-VIDEO] Response data type:', typeof res.data);
        console.log('📱 [AUDIO-VIDEO] Response data length:', res.data?.length || 0);
        console.log('📱 [AUDIO-VIDEO] Is array?', Array.isArray(res.data));
        console.log('📱 [AUDIO-VIDEO] Full response data:', JSON.stringify(res.data, null, 2));
        
        if (Array.isArray(res.data)) {
          console.log('📱 [AUDIO-VIDEO] First item sample:', JSON.stringify(res.data[0], null, 2));
          console.log('📱 [AUDIO-VIDEO] Total items received:', res.data.length);
          
          // Log the actual field names from the API response
          if (res.data.length > 0) {
            const firstItem = res.data[0];
            console.log('📱 [AUDIO-VIDEO] Available fields in API response:', Object.keys(firstItem));
            console.log('📱 [AUDIO-VIDEO] Field values from first item:', {
              avld: firstItem.avld,
              Type: firstItem.Type,
              Classification: firstItem.Classification,
              VideoName: firstItem.VideoName,
              Link: firstItem.Link,
              Deity: firstItem.Deity,
              Language: firstItem.Language,
              Artists: firstItem.Artists,
              Duration: firstItem.Duration,
              MediaType: firstItem.MediaType,
              CreatedAt: firstItem.CreatedAt,
              // Check if famous field exists
              famous: firstItem.famous,
              // Log any other fields that might exist
              allFields: firstItem
            });
          }
          
          // Log some statistics about the data
          const audioCount = res.data.filter((item: MediaFile) => item.Type?.toLowerCase().includes('audio')).length;
          const videoCount = res.data.filter((item: MediaFile) => item.Type?.toLowerCase().includes('video')).length;
          console.log('📱 [AUDIO-VIDEO] Audio files count:', audioCount);
          console.log('📱 [AUDIO-VIDEO] Video files count:', videoCount);
        } else {
          console.log('📱 [AUDIO-VIDEO] Response is not an array, actual type:', typeof res.data);
          console.log('📱 [AUDIO-VIDEO] Response structure:', Object.keys(res.data || {}));
        }
        
        setMediaFiles(res.data || []);
        console.log('📱 [AUDIO-VIDEO] ===== API CALL COMPLETED SUCCESSFULLY =====');
      } catch (e: any) {
        console.error('❌ [AUDIO-VIDEO] ===== API CALL FAILED =====');
        console.error('❌ [AUDIO-VIDEO] Error type:', typeof e);
        console.error('❌ [AUDIO-VIDEO] Error message:', e.message);
        console.error('❌ [AUDIO-VIDEO] Error name:', e.name);
        console.error('❌ [AUDIO-VIDEO] Error stack:', e.stack);
        
        if (e.response) {
          console.error('❌ [AUDIO-VIDEO] Error response status:', e.response.status);
          console.error('❌ [AUDIO-VIDEO] Error response data:', JSON.stringify(e.response.data, null, 2));
          console.error('❌ [AUDIO-VIDEO] Error response headers:', JSON.stringify(e.response.headers, null, 2));
        } else if (e.request) {
          console.error('❌ [AUDIO-VIDEO] No response received, request details:', e.request);
        } else {
          console.error('❌ [AUDIO-VIDEO] Error setting up request:', e.message);
        }
        
        Alert.alert('Failed to fetch media files', e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
        console.log('📱 [AUDIO-VIDEO] Loading state set to false');
      }
    };
    fetchMedia();
  }, []);

  // Handle app state changes for background audio
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active, resuming audio if needed');
        // Resume audio if it was playing before going to background
        if (sound && isPlaying) {
          sound.playAsync();
        }
      } else if (nextAppState === 'background') {
        console.log('📱 App went to background, audio should continue playing');
        // Audio will continue playing in background due to staysActiveInBackground: true
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, isPlaying]);



  // Timer effect to track elapsed time and detect song end
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && sound) {
      interval = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setElapsedTime(status.positionMillis || 0);
            setAudioDuration(status.durationMillis || 0);
            
            // Check if song has ended
            if (status.positionMillis && status.durationMillis && status.positionMillis >= status.durationMillis) {
              console.log('🎵 [AUDIO-VIDEO] Song ended, auto-playing next song');
              setIsPlaying(false);
              setElapsedTime(0);
              // Auto-play next song
              playNextSong();
            }
          }
        } catch (error) {
          console.error('❌ [AUDIO-VIDEO] Error getting audio status:', error);
        }
      }, 1000); // Update every second
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, sound]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlay = (media: MediaFile) => {
    console.log('🎬 [AUDIO-VIDEO] ===== HANDLE PLAY CALLED =====');
    console.log('🎬 [AUDIO-VIDEO] Media file to play:', JSON.stringify(media, null, 2));
    console.log('🎬 [AUDIO-VIDEO] Media type:', media.Type);
    console.log('🎬 [AUDIO-VIDEO] Media link:', media.Link);
    console.log('🎬 [AUDIO-VIDEO] Deity:', media.Deity);
    console.log('🎬 [AUDIO-VIDEO] Video name:', media.VideoName);
    
    if (media.Link && (media.Link.includes('youtube.com') || media.Link.includes('youtu.be'))) {
      console.log('🎬 [AUDIO-VIDEO] YouTube link detected, opening modal');
      setCurrentMedia(media);
      setModalVisible(true);
      setYoutubePlaying(true);
    } else if (media.MediaType === 'mp3') {
      console.log('🎵 [AUDIO-VIDEO] MP3 file detected, playing inline');
      // For MP3 files, play inline without opening modal
      if (currentMedia?.avld === media.avld && sound) {
        // If same audio is already loaded, toggle play/pause
        if (isPlaying) {
          pauseAudio();
        } else {
          playAudio();
        }
      } else {
        // Load new audio
        setCurrentMedia(media);
        loadAndPlayAudio(media);
      }
    } else {
      console.log('🎬 [AUDIO-VIDEO] Unsupported media type');
    }
    
    console.log('🎬 [AUDIO-VIDEO] Handle play completed');
  };

  const loadAndPlayAudio = async (media: MediaFile) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      
      // Get presigned URL from backend API
      const apiUrl = getEndpointUrl('S3_AUDIO_URL');
      const response = await axios.get(apiUrl, {
        params: { filename: media.Link },
        headers: getAuthHeaders()
      });
      
      if (response.data.success && response.data.presignedUrl) {
        const presignedUrl = response.data.presignedUrl;
        console.log('🎵 [AUDIO-VIDEO] Got presigned URL from API:', presignedUrl);
        
        // Load the audio using the presigned URL
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: presignedUrl },
          { shouldPlay: true } // Auto-play when loaded
        );
        
        // Get initial duration
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setAudioDuration(status.durationMillis || 0);
        }
        
        setSound(newSound);
        setIsPlaying(true); // Set playing state to true
        setIsLoading(false);
        console.log('🎵 [AUDIO-VIDEO] MP3 loaded and started playing automatically');
      } else {
        throw new Error('Failed to get presigned URL from API');
      }
      
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error loading MP3:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load audio file. Please try again.');
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        console.log('🎵 [AUDIO-VIDEO] Audio started playing');
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const pauseAudio = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log('🎵 [AUDIO-VIDEO] Audio paused');
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error pausing audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        console.log('🎵 [AUDIO-VIDEO] Audio stopped');
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error stopping audio:', error);
    }
  };

  const rewindAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, (status.positionMillis || 0) - 10000); // 10 seconds back
          await sound.setPositionAsync(newPosition);
          console.log('🎵 [AUDIO-VIDEO] Audio rewound by 10 seconds');
        }
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error rewinding audio:', error);
    }
  };

  const forwardAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.min((status.durationMillis || 0), (status.positionMillis || 0) + 10000); // 10 seconds forward
          await sound.setPositionAsync(newPosition);
          console.log('🎵 [AUDIO-VIDEO] Audio forwarded by 10 seconds');
        }
      }
    } catch (error) {
      console.error('❌ [AUDIO-VIDEO] Error forwarding audio:', error);
    }
  };

  const playPreviousSong = () => {
    // Get the current filtered list for navigation
    const currentFilteredList = getCurrentFilteredList();
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    handlePreviousSong(currentFilteredList);
  };

  const playNextSong = () => {
    // Get the current filtered list for navigation
    const currentFilteredList = getCurrentFilteredList();
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    handleNextSong(currentFilteredList);
  };

  // Helper function to get current filtered list
  const getCurrentFilteredList = () => {
    return mediaFiles
      .filter(media => !selectedDeity || media.Deity === selectedDeity)
      .filter(media => {
        // Filter by selected filter button
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Famous') return media.famous === true;
        return media.Type === selectedFilter;
      })
      .filter(media => {
        // If both toggles are off, show nothing
        if (!audioEnabled && !videoEnabled) return false;
        // If only audio is enabled, show only audio items
        if (audioEnabled && !videoEnabled) return media.Classification === 'Audio';
        // If only video is enabled, show only video items
        if (!audioEnabled && videoEnabled) return media.Classification === 'Video';
        // If both are enabled, show both audio and video items
        return media.Classification === 'Audio' || media.Classification === 'Video';
      })
      .filter(media => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (
          (media.VideoName && media.VideoName.toLowerCase().includes(q)) ||
          (media.Artists && media.Artists.toLowerCase().includes(q)) ||
          (media.Deity && media.Deity.toLowerCase().includes(q)) ||
          (media.Language && media.Language.toLowerCase().includes(q)) ||
          (media.Type && media.Type.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Sort audio first, then video
        if (a.Classification === 'Audio' && b.Classification === 'Video') return -1;
        if (a.Classification === 'Video' && b.Classification === 'Audio') return 1;
        // If both are same type, sort by name
        return (a.VideoName || '').localeCompare(b.VideoName || '');
      });
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSearchChange = (query: string) => {
    console.log('🔍 [AUDIO-VIDEO] Search query changed:', query);
    console.log('🔍 [AUDIO-VIDEO] Current media files count:', mediaFiles.length);
    setSearchQuery(query);
  };

  const handleDeitySelect = (deity: string) => {
    const newDeity = selectedDeity === deity ? null : deity;
    setSelectedDeity(newDeity);
    console.log('🔍 [AUDIO-VIDEO] Deity filter changed:', newDeity || 'None');
  };

  // Navigation functions for next/previous in filtered list (MP3 only)
  const getCurrentMediaIndex = (filteredList: MediaFile[]) => {
    if (!currentMedia) return -1;
    return filteredList.findIndex(media => media.avld === currentMedia.avld);
  };

  const handleNextSong = (filteredList: MediaFile[]) => {
    if (!currentMedia || filteredList.length === 0) return;
    
    // Get only MP3 files from the filtered list
    const mp3OnlyList = filteredList.filter(media => media.MediaType === 'mp3');
    if (mp3OnlyList.length === 0) return;
    
    const currentIndex = mp3OnlyList.findIndex(media => media.avld === currentMedia.avld);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % mp3OnlyList.length;
    const nextMedia = mp3OnlyList[nextIndex];
    
    console.log('⏭️ [AUDIO-VIDEO] Next MP3 song:', nextMedia.VideoName);
    handlePlay(nextMedia);
  };

  const handlePreviousSong = (filteredList: MediaFile[]) => {
    if (!currentMedia || filteredList.length === 0) return;
    
    // Get only MP3 files from the filtered list
    const mp3OnlyList = filteredList.filter(media => media.MediaType === 'mp3');
    if (mp3OnlyList.length === 0) return;
    
    const currentIndex = mp3OnlyList.findIndex(media => media.avld === currentMedia.avld);
    if (currentIndex === -1) return;
    
    const previousIndex = currentIndex === 0 ? mp3OnlyList.length - 1 : currentIndex - 1;
    const previousMedia = mp3OnlyList[previousIndex];
    
    console.log('⏮️ [AUDIO-VIDEO] Previous MP3 song:', previousMedia.VideoName);
    handlePlay(previousMedia);
  };

  const filterContent = (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for music, artists, or deities..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color="#666" 
          style={styles.searchIcon}
        />
      </View>
      
      <View style={styles.filterRow}>
        {/* Audio/Video Toggle Controls */}
        <View style={styles.toggleContainer}>
          {/* Audio Toggle */}
          <TouchableOpacity 
            style={styles.toggleItem}
            onPress={() => setAudioEnabled(!audioEnabled)}
          >
            <LinearGradient
              colors={audioEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
              style={styles.toggleTrack}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View
                style={[
                  styles.toggleThumb,
                  audioEnabled && styles.toggleThumbActive
                ]}
              />
            </LinearGradient>
            <Text style={styles.toggleLabel}>Audio</Text>
          </TouchableOpacity>

          {/* Video Toggle */}
          <TouchableOpacity 
            style={styles.toggleItem}
            onPress={() => setVideoEnabled(!videoEnabled)}
          >
            <LinearGradient
              colors={videoEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
              style={styles.toggleTrack}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View
                style={[
                  styles.toggleThumb,
                  videoEnabled && styles.toggleThumbActive
                ]}
              />
            </LinearGradient>
            <Text style={styles.toggleLabel}>Video</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder="Search for Music" 
        extraContent={filterContent} 
        showDailyPujaButton={false}
        onSearchChange={handleSearchChange}
        showSearchBar={false}
      />
      
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
            <Text style={styles.deityIconLabel} numberOfLines={1}>Brahma Ji</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Brihaspati Dev' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Brihaspati Dev')}
          >
            <Image source={require('@/assets/images/temple/BrihaspatiIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Brihaspati Dev</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Durga Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Durga Maa')}
          >
            <Image source={require('@/assets/images/temple/Durga1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Durga Maa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Ganga Maiya' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Ganga Maiya')}
          >
            <Image source={require('@/assets/images/temple/gangaMaiyaaIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Ganga Maiya</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Khatu Shyam Ji' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Khatu Shyam Ji')}
          >
            <Image source={require('@/assets/images/temple/KhatuShyamIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Khatu Shyam Ji</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Lakshmi Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Lakshmi Maa')}
          >
            <Image source={require('@/assets/images/temple/Lakshmi1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Lakshmi Maa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Maa Kali' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Maa Kali')}
          >
            <Image source={require('@/assets/images/temple/maaKaliIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Maa Kali</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Mahadev Shiv Ji' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Mahadev Shiv Ji')}
          >
            <Image source={require('@/assets/images/temple/New folder/Shiv4.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Mahadev Shiv Ji</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Mahaveer Hanuman' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Mahaveer Hanuman')}
          >
            <Image source={require('@/assets/images/temple/Hanuman1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Mahaveer Hanuman</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Navgrah' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Navgrah')}
          >
            <Image source={require('@/assets/images/temple/navgrahIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Navgrah</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Rahu Ketu' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Rahu Ketu')}
          >
            <Image source={require('@/assets/images/temple/RahuKetuIcon.jpg')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Rahu Ketu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Saraswati Maa' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Saraswati Maa')}
          >
            <Image source={require('@/assets/images/temple/Saraswati1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Saraswati Maa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shani Dev' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shani Dev')}
          >
            <Image source={require('@/assets/images/temple/shaniDevIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Shani Dev</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shri Krishna' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shri Krishna')}
          >
            <Image source={require('@/assets/images/temple/Krishna1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Shri Krishna</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Shri Ram' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Shri Ram')}
          >
            <Image source={require('@/assets/images/temple/Rama1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Shri Ram</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Vighnaharta Ganesh' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Vighnaharta Ganesh')}
          >
            <Image source={require('@/assets/images/temple/Ganesha1.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Vighnaharta Ganesh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.deityIconItem,
              selectedDeity === 'Vishnu Bhagwan' && styles.deityIconItemSelected
            ]}
            onPress={() => handleDeitySelect('Vishnu Bhagwan')}
          >
            <Image source={require('@/assets/images/temple/VishnuIcon.png')} style={styles.deityIconImage} resizeMode="contain" />
            <Text style={styles.deityIconLabel}>Vishnu Bhagwan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Filter Buttons Row */}
      <View style={styles.filterButtonsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsContent}
        >
          {['All', 'Aarti', 'Bhajan', 'Chalisa', 'Paath / Strotam', 'Famous'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Media List */}
      <ScrollView style={styles.content}>
         {loading ? (
           <Text>Loading...</Text>
         ) : (
           <>
             {mediaFiles.length === 0 && (
               <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                 No media files found. Please check the database.
               </Text>
             )}
             {(() => {
               console.log('🔍 [AUDIO-VIDEO] ===== FILTERING MEDIA FILES =====');
               console.log('🔍 [AUDIO-VIDEO] Total media files:', mediaFiles.length);
               console.log('🔍 [AUDIO-VIDEO] Selected deity:', selectedDeity);
               console.log('🔍 [AUDIO-VIDEO] Selected filter:', selectedFilter);
               console.log('🔍 [AUDIO-VIDEO] Audio enabled:', audioEnabled);
               console.log('🔍 [AUDIO-VIDEO] Video enabled:', videoEnabled);
               console.log('🔍 [AUDIO-VIDEO] Search query:', searchQuery);
               
               // Create filtered media list for navigation
               const filteredMedia = mediaFiles
                 .filter(media => !selectedDeity || media.Deity === selectedDeity)
                 .filter(media => {
                   // Filter by selected filter button
                   if (selectedFilter === 'All') return true;
                   if (selectedFilter === 'Famous') return media.famous === true;
                   return media.Type === selectedFilter;
                 })
                 .filter(media => {
                   // If both toggles are off, show nothing
                   if (!audioEnabled && !videoEnabled) return false;
                   // If only audio is enabled, show only audio items
                   if (audioEnabled && !videoEnabled) return media.Classification === 'Audio';
                   // If only video is enabled, show only video items
                   if (!audioEnabled && videoEnabled) return media.Classification === 'Video';
                   // If both are enabled, show both audio and video items
                   return media.Classification === 'Audio' || media.Classification === 'Video';
                 })
                 .filter(media => {
                   if (!searchQuery.trim()) return true;
                   const q = searchQuery.trim().toLowerCase();
                   return (
                     (media.VideoName && media.VideoName.toLowerCase().includes(q)) ||
                     (media.Artists && media.Artists.toLowerCase().includes(q)) ||
                     (media.Deity && media.Deity.toLowerCase().includes(q)) ||
                     (media.Language && media.Language.toLowerCase().includes(q)) ||
                     (media.Type && media.Type.toLowerCase().includes(q))
                   );
                 })
                 .sort((a, b) => {
                   // Sort audio first, then video
                   if (a.Classification === 'Audio' && b.Classification === 'Video') return -1;
                   if (a.Classification === 'Video' && b.Classification === 'Audio') return 1;
                   // If both are same type, sort by name
                   return (a.VideoName || '').localeCompare(b.VideoName || '');
                 });
               
               console.log('🔍 [AUDIO-VIDEO] Filtered media count:', filteredMedia.length);
               console.log('🔍 [AUDIO-VIDEO] Filtered media types:', filteredMedia.map(m => ({ name: m.VideoName, type: m.Type, classification: m.Classification })));
               
               if (filteredMedia.length === 0) {
                 console.log('🔍 [AUDIO-VIDEO] No media files match current filters');
                 return (
                   <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                     No media files match your current filters. Try adjusting your search or filters.
                   </Text>
                 );
               }
               
               return filteredMedia.map((media, idx) => {
                 console.log(`🔍 [AUDIO-VIDEO] Rendering media item ${idx + 1}:`, {
                   name: media.VideoName,
                   type: media.Type,
                   classification: media.Classification,
                   deity: media.Deity,
                   language: media.Language
                 });
                 
                 return (
                   <TouchableOpacity
                     key={media.Link || idx}
                     style={[
                       styles.mediaTile,
                       media.Classification === 'Audio' && styles.audioTile,
                       media.Classification === 'Video' && styles.videoTile
                     ]}
                     onPress={() => handlePlay(media)}
                   >
                     {/* Audio/Video Icon with Type and Language */}
                     <View style={styles.mediaIconContainer}>
                       {media.Classification === 'Audio' ? (
                         <MaterialCommunityIcons name="music-note" size={20} color="#FF6A00" />
                       ) : (
                         <MaterialCommunityIcons name="video" size={20} color="#FF6A00" />
                       )}
                       <Text style={styles.mediaIconType}>{media.Type}</Text>
                       <Text style={styles.mediaIconLanguage}>{media.Language}</Text>
                     </View>
                     
                     {/* Media Content */}
                     <View style={styles.mediaContent}>
                       <Text style={styles.mediaTitle}>{media.VideoName || 'Untitled'}</Text>
                       <Text style={styles.mediaType}>
                         {media.Deity ? media.Deity : ''}
                       </Text>
                       {(media.Duration || media.Artists) && (
                         <Text style={styles.mediaDetails}>
                           {media.Duration ? media.Duration : ''}
                           {media.Duration && media.Artists ? ' | ' : ''}
                           {media.Artists ? media.Artists : ''}
                         </Text>
                       )}
                     </View>
                     
                     {/* Play Button - Different for MP3 vs Other Media */}
                     <View style={styles.playButtonContainer}>
                       {media.MediaType === 'mp3' ? (
                         // Inline audio controls for MP3
                         <View style={styles.audioControlsInline}>
                           {currentMedia?.avld === media.avld && isLoading ? (
                             <Text style={styles.loadingTextInline}>Loading...</Text>
                           ) : currentMedia?.avld === media.avld && sound ? (
                             <View style={styles.audioControlsContainer}>
                               {/* Timer Display - Above Audio Controls */}
                               <Text style={styles.elapsedTimeText}>
                                 {formatTime(elapsedTime)}
                               </Text>
                               
                               {/* Main Audio Controls - Middle */}
                               <View style={styles.audioControlsInline}>
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={rewindAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name="rewind-10"
                                     size={18}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={isPlaying ? pauseAudio : playAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name={isPlaying ? 'pause' : 'play'}
                                     size={24}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.audioControlButtonInline}
                                   onPress={forwardAudio}
                                 >
                                   <MaterialCommunityIcons
                                     name="fast-forward-10"
                                     size={18}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                               </View>
                               
                               {/* Forward/Back Navigation - Below Audio Controls */}
                               <View style={styles.navigationControlsInline}>
                                 <TouchableOpacity
                                   style={styles.navigationButtonInline}
                                   onPress={playPreviousSong}
                                 >
                                   <MaterialCommunityIcons
                                     name="skip-previous"
                                     size={16}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity
                                   style={styles.navigationButtonInline}
                                   onPress={playNextSong}
                                 >
                                   <MaterialCommunityIcons
                                     name="skip-next"
                                     size={16}
                                     color="#FF6A00"
                                   />
                                 </TouchableOpacity>
                               </View>
                             </View>
                           ) : (
                             <MaterialCommunityIcons name="play-circle" size={32} color="#FF6A00" />
                           )}
                         </View>
                       ) : (
                         // Regular play button for non-MP3 media
                         <MaterialCommunityIcons name="play-circle" size={32} color="#FF6A00" />
                       )}
                     </View>
                   </TouchableOpacity>
                 );
               });
             })()}
          </>
        )}
      </ScrollView>
      {/* YouTube Modal - Only for YouTube videos */}
      <Modal
        animationType="slide"
        visible={modalVisible && !!currentMedia?.Link && (currentMedia.Link.includes('youtube.com') || currentMedia.Link.includes('youtu.be'))}
        onRequestClose={() => {
          setModalVisible(false);
          setCurrentMedia(null);
          setYoutubePlaying(false);
        }}
      >
        <View style={styles.videoModalBackground}>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setCurrentMedia(null);
              setYoutubePlaying(false);
              // Stop and unload audio if playing
              if (sound) {
                sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
                setIsLoading(false);
              }
            }}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {currentMedia && currentMedia.Link && (
            currentMedia.Link.includes('youtube.com') || currentMedia.Link.includes('youtu.be') ? (
              <YoutubePlayer
                height={300}
                play={youtubePlaying}
                videoId={extractYouTubeId(currentMedia.Link)}
                forceAndroidAutoplay
                webViewProps={{ allowsInlineMediaPlayback: true }}
              />
            ) : currentMedia.MediaType === 'mp3' ? (
              <View style={styles.audioPlayerContainer}>
                <View style={styles.audioInfo}>
                  <MaterialCommunityIcons name="music-note" size={48} color="#FF6A00" />
                  <Text style={styles.audioTitle}>{currentMedia.VideoName}</Text>
                  <Text style={styles.audioDetails}>
                    {currentMedia.Type} | {currentMedia.Language}
                    {currentMedia.Deity ? ` | ${currentMedia.Deity}` : ''}
                  </Text>
                  {currentMedia.Artists && (
                    <Text style={styles.audioArtist}>by {currentMedia.Artists}</Text>
                  )}
                </View>
                
                <View style={styles.audioControls}>
                  {isLoading ? (
                    <Text style={styles.loadingText}>Loading audio...</Text>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.audioControlButton}
                        onPress={isPlaying ? pauseAudio : playAudio}
                      >
                        <MaterialCommunityIcons
                          name={isPlaying ? 'pause' : 'play'}
                          size={32}
                          color="#FF6A00"
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.audioControlButton}
                        onPress={stopAudio}
                      >
                        <MaterialCommunityIcons
                          name="stop"
                          size={32}
                          color="#FF6A00"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Unsupported media type</Text>
            )
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  // Deity Icons Styles
  deityIconsContainer: {
    position: 'absolute',
    top: 170, // Moved up 10px from 180 to 170
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  deityIconsContent: {
    paddingHorizontal: 20,
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
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  deityIconItemSelected: {
    backgroundColor: 'rgba(255, 106, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  filterStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 0, 0.3)',
  },
  filterStatusText: {
    fontSize: 12,
    color: '#FF6A00',
    fontWeight: '500',
  },
  clearFilterButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearFilterText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
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
  },
  filterButtonActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topContent: {
    backgroundColor: '#fff',
    paddingBottom: 0,
    paddingTop: 0,
  },
  filterContainer: {
    marginBottom: 20,
    marginTop: -10, // Moved up 10px
    position: 'relative',
    width: '88%',
    alignSelf: 'center',
  },
  searchInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
    color: '#fff',
  },

  content: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  videoModalBackground: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  // Media Tile Styles
  mediaTile: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioTile: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  videoTile: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  mediaIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    padding: 6,
  },
  mediaIconType: {
    fontSize: 11,
    color: '#FF6A00',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  mediaIconLanguage: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 1,
  },
  mediaContent: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mediaType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  mediaDetails: {
    fontSize: 10,
    color: '#888',
  },
  playButtonContainer: {
    marginLeft: 16,
  },
  // Audio Player Styles
  audioPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  audioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  audioDetails: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
  },
  audioArtist: {
    fontSize: 18,
    color: '#FF6A00',
    textAlign: 'center',
    fontWeight: '600',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  audioControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  // Inline Audio Controls Styles
  audioControlsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  audioControlButtonInline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  loadingTextInline: {
    fontSize: 12,
    color: '#FF6A00',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Additional inline audio styles
  elapsedTimeText: {
    fontSize: 8,
    color: '#FF6A00',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  navigationControlsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  navigationButtonInline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  audioControlsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
}); 