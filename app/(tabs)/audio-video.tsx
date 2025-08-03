import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
}

const deityList = [
  'Lord Agni',
  'Lord Brahma',
  'Lord Ganesha',
  'Lord Hanuman',
  'Lord Indra',
  'Lord Krishna',
  'Lord Rama',
  'Lord Shiva',
  'Lord Skanda (also known as Kartikeya or Murugan)',
  'Lord Vishnu',
  'Khatu Shyam Ji',
  'Goddess Durga',
  'Goddess Kali',
  'Goddess Lakshmi',
  'Goddess Parvati',
  'Goddess Saraswati',
];

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
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [deityDropdownOpen, setDeityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const url = getEndpointUrl('MEDIA_FILES');
        console.log('🔍 Fetching media files from:', url);
        console.log('🔍 Full URL:', url);
        
        const res = await axios.get(url);
        console.log('📱 Response status:', res.status);
        console.log('📱 Response headers:', res.headers);
        console.log('📱 Received media files:', res.data);
        console.log('📱 Number of files:', res.data?.length || 0);
        console.log('📱 Type of data:', typeof res.data);
        console.log('📱 Is array?', Array.isArray(res.data));
        
        if (Array.isArray(res.data)) {
          console.log('📱 First item sample:', res.data[0]);
        }
        
        setMediaFiles(res.data || []);
      } catch (e: any) {
        console.error('❌ Error fetching media files:', e);
        console.error('❌ Error message:', e.message);
        console.error('❌ Error response status:', e.response?.status);
        console.error('❌ Error response data:', e.response?.data);
        console.error('❌ Error response headers:', e.response?.headers);
        Alert.alert('Failed to fetch media files', e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handlePlay = (media: MediaFile) => {
    setCurrentMedia(media);
    setModalVisible(true);
    if (media.Link && (media.Link.includes('youtube.com') || media.Link.includes('youtu.be'))) {
      setYoutubePlaying(true);
    }
  };

  const filterContent = (
    <View style={styles.filterContainer}>
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
        
        {/* Deity Filter - Moved to the right */}
        <View style={styles.deityFilterWrapper}>
          <TouchableOpacity 
            style={styles.filterDropdown}
            onPress={() => setDeityDropdownOpen(!deityDropdownOpen)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedDeity || 'Deity'}
            </Text>
            <MaterialCommunityIcons 
              name={deityDropdownOpen ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {deityDropdownOpen && (
            <View style={styles.filterDropdownModal}>
              <TouchableOpacity 
                style={[styles.filterDropdownItem, styles.filterDropdownItemDisabled]}
                disabled={true}
              >
                <Text style={styles.filterDropdownItemTextDisabled}>Deity</Text>
              </TouchableOpacity>
              
              {deityList.map(deity => (
                <TouchableOpacity 
                  key={deity}
                  style={styles.filterDropdownItem}
                  onPress={() => {
                    setSelectedDeity(selectedDeity === deity ? null : deity);
                    setDeityDropdownOpen(false);
                  }}
                >
                  <Text style={styles.filterDropdownItemText}>{deity}</Text>
                  {selectedDeity === deity && (
                    <MaterialCommunityIcons name="check" size={16} color="#FF6A00" style={styles.filterDropdownItemTick} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Music" extraContent={filterContent} showDailyPujaButton={false} />
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
                                       {mediaFiles
                .filter(media => !selectedDeity || media.Deity === selectedDeity)
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
                    (media.Deity && media.Deity.toLowerCase().includes(q))
                  );
                })
               .map((media, idx) => (
                 <TouchableOpacity
                   key={media.Link || idx}
                   style={{ marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, padding: 10, elevation: 2 }}
                   onPress={() => handlePlay(media)}
                 >
                   <Text style={{ fontWeight: 'bold' }}>{media.VideoName || 'Untitled'}</Text>
                   <Text style={{ color: '#888' }}>
                     {media.Type} | {media.Language}
                     {media.Deity ? ` | ${media.Deity}` : ''}
                   </Text>
                   {(media.Duration || media.Artists) && (
                     <Text style={{ color: '#555', fontSize: 13 }}>
                       {media.Duration ? media.Duration : ''}
                       {media.Duration && media.Artists ? ' | ' : ''}
                       {media.Artists ? media.Artists : ''}
                     </Text>
                   )}
                 </TouchableOpacity>
               ))}
          </>
        )}
      </ScrollView>
      {/* YouTube Modal */}
      <Modal
        animationType="slide"
        visible={modalVisible}
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
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Not a YouTube link</Text>
            )
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
    position: 'relative',
    width: '82%',
    alignSelf: 'center',
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
  deityFilterWrapper: {
    position: 'relative',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120,
  },
  filterDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  filterDropdownModal: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    marginTop: 4,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterDropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  filterDropdownItemDisabled: {
    backgroundColor: '#f8f8f8',
  },
  filterDropdownItemTextDisabled: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  filterDropdownItemTick: {
    marginLeft: 'auto',
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
}); 