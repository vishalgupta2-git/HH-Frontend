import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

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

function extractYouTubeId(url) {
  let videoId = null;
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
  const [currentMedia, setCurrentMedia] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youtubePlaying, setYoutubePlaying] = useState(false);
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [deityDropdownOpen, setDeityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await axios.get('http://192.168.1.5:3000/api/media-files');
        setMediaFiles(res.data);
      } catch (e) {
        Alert.alert('Failed to fetch media files');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handlePlay = (media) => {
    setCurrentMedia(media);
    setModalVisible(true);
    if (media.Link && (media.Link.includes('youtube.com') || media.Link.includes('youtu.be'))) {
      setYoutubePlaying(true);
    }
  };

  const iconRowAndDropdown = (
    <View style={styles.iconRowTight}>
      <TouchableOpacity style={styles.iconButton}>
        <MaterialCommunityIcons name="music" size={28} color="#FF6A00" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <MaterialCommunityIcons name="video" size={28} color="#FF6A00" />
      </TouchableOpacity>
      <View style={styles.deityDropdownWrapper}>
        <TouchableOpacity
          style={styles.deityDropdown}
          onPress={() => setDeityDropdownOpen(open => !open)}
        >
          <Text style={styles.deityDropdownText}>
            {selectedDeity || 'Deity'}
          </Text>
          <MaterialCommunityIcons
            name={deityDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
        <Modal
          visible={deityDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeityDropdownOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setDeityDropdownOpen(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <View style={styles.deityDropdownModalList}>
                <ScrollView style={{ maxHeight: 320 }}>
                  {deityList.map(deity => (
                    <TouchableOpacity
                      key={deity}
                      style={[
                        styles.deityDropdownItem,
                        selectedDeity === deity && styles.deityDropdownItemSelected
                      ]}
                      onPress={() => {
                        if (selectedDeity === deity) {
                          setSelectedDeity(null);
                        } else {
                          setSelectedDeity(deity);
                        }
                        setDeityDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.deityDropdownItemText,
                          selectedDeity === deity && styles.deityDropdownItemTextSelected
                        ]}
                      >
                        {deity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Music" extraContent={iconRowAndDropdown} />
      {/* Media List */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeader}>Audio/Video Library</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          mediaFiles
            .filter(media => !selectedDeity || media.Deity === selectedDeity)
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
            ))
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
  topContent: {
    backgroundColor: '#fff',
    paddingBottom: 0,
    paddingTop: 0,
  },
  iconRowTight: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#FFF6EE',
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  deityDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownModalList: {
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 320,
    paddingVertical: 4,
    zIndex: 1000,
    elevation: 20,
  },
  deityDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deityDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  deityDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  deityDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
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