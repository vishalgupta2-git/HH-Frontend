import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import axios from 'axios';

export const options = { headerShown: false };

interface TempleCharity {
  id: string;
  name: string;
  type: string;
  deity: string;
  cause: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  about: string;
  '80G': string;
  zip_pinCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function DonationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templesEnabled, setTemplesEnabled] = useState(true);
  const [charitiesEnabled, setCharitiesEnabled] = useState(true);
  const [data, setData] = useState<TempleCharity[]>([]);
  const [filteredData, setFilteredData] = useState<TempleCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TempleCharity | null>(null);
  const [modalImages, setModalImages] = useState<Array<{key: string, url: string}>>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Image viewer modal state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch temples and charities data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = getEndpointUrl('TEMPLES_CHARITIES');
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: {
          limit: 100, // Get more items for better user experience
          offset: 0
        }
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setData(fetchedData);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search query and toggle states
  useEffect(() => {
    let filtered = data;

    // Filter by type (Temple or Charity)
    if (templesEnabled && charitiesEnabled) {
      // Show all
    } else if (templesEnabled) {
      filtered = filtered.filter(item => item.type === 'Temple');
    } else if (charitiesEnabled) {
      filtered = filtered.filter(item => item.type === 'Charity');
    } else {
      filtered = []; // Both disabled
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      const beforeSearch = filtered.length;
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.about?.toLowerCase().includes(query) ||
        item.deity?.toLowerCase().includes(query) ||
        item.cause?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.state?.toLowerCase().includes(query) ||
        item.zip_pinCode?.includes(query)
      );
      
    }

    setFilteredData(filtered);
  }, [data, searchQuery, templesEnabled, charitiesEnabled]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Handle tile click - fetch images and open modal
  const handleTileClick = async (item: TempleCharity) => {
    try {
      setModalLoading(true);
      setSelectedItem(item);
      setShowModal(true);
      
      // Fetch images from S3
      const response = await axios.get(getEndpointUrl('TEMPLES_CHARITIES_IMAGES') + `/${item.id}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setModalImages(response.data.images || []);
      } else {
        setModalImages([]);
      }
    } catch (err: any) {
      setModalImages([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalImages([]);
  };

  // Handle image click to open viewer
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  // Handle next image
  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === modalImages.length - 1 ? 0 : prev + 1
    );
  };

  // Handle previous image
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? modalImages.length - 1 : prev - 1
    );
  };

  // Handle image viewer close
  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImageIndex(0);
  };

  // Handle toggle changes
  const handleTemplesToggle = () => {
    setTemplesEnabled(!templesEnabled);
  };

  const handleCharitiesToggle = () => {
    setCharitiesEnabled(!charitiesEnabled);
  };

  const toggleControls = (
    <View style={styles.toggleRow}>
      {/* Temples Toggle */}
      <TouchableOpacity 
        style={styles.toggleItem}
        onPress={handleTemplesToggle}
      >
        <LinearGradient
          colors={templesEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
          style={styles.toggleTrack}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            style={[
              styles.toggleThumb,
              templesEnabled && styles.toggleThumbActive
            ]}
          />
        </LinearGradient>
        <Text style={styles.toggleLabel}>Temples</Text>
      </TouchableOpacity>

      {/* Charities Toggle */}
      <TouchableOpacity 
        style={styles.toggleItem}
        onPress={handleCharitiesToggle}
      >
        <LinearGradient
          colors={charitiesEnabled ? ['#4CAF50', '#81C784'] : ['#E0E0E0', '#F5F5F5']}
          style={styles.toggleTrack}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            style={[
              styles.toggleThumb,
              charitiesEnabled && styles.toggleThumbActive
            ]}
          />
        </LinearGradient>
        <Text style={styles.toggleLabel}>Charities</Text>
      </TouchableOpacity>
    </View>
  );

  // Render individual tile
  const renderTile = (item: TempleCharity) => {
    
    return (
      <View key={item.id} style={{
        width: '48%',
        backgroundColor: 'green',
        height: 150,
        marginBottom: 15,
        padding: 10,
        borderWidth: 2,
        borderColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
          {item.name}
        </Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
          {item.type}
        </Text>
        <Text style={{ color: 'white', fontSize: 12, marginTop: 5, textAlign: 'center' }}>
          {item.city}, {item.state}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder="Search for Temple or Charity" 
        showDailyPujaButton={false} 
        onSearchChange={setSearchQuery}
        extraContent={toggleControls}
      />

      <View style={styles.content}>
        {/* Show data if available */}
        {filteredData.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                Showing {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
                {searchQuery && ` for "${searchQuery}"`}
              </Text>
            </View>
            
            {/* Grid layout */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}>
                {filteredData.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={{
                      width: '48%',
                      backgroundColor: '#fff',
                      padding: 15,
                      marginBottom: 15,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: '#e0e0e0'
                    }}
                    onPress={() => handleTileClick(item)}
                    activeOpacity={0.8}
                  >
                    {/* Header with type icon */}
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}>
                      <Image 
                        source={item.type === 'Temple' 
                          ? require('@/assets/images/icons/home page icons/temple.png')
                          : require('@/assets/images/icons/home page icons/charityIcon.png')
                        }
                        style={{
                          width: 24,
                          height: 24,
                          resizeMode: 'contain'
                        }}
                      />
                      
                      {item['80G'] && (
                        (() => {
                          const value = item['80G'].toString().toLowerCase();
                          let badgeText = '';
                          let showBadge = false;
                          
                          if (value === 'true' || value === '100' || value === '100%') {
                            badgeText = 'Tax-Free';
                            showBadge = true;
                          } else if (value === '50' || value === '50%') {
                            badgeText = 'Tax-Free-50%';
                            showBadge = true;
                          }
                          
                          return showBadge ? (
                            <View style={{
                              backgroundColor: '#FF6A00',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 5
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                {badgeText}
                              </Text>
                            </View>
                          ) : null;
                        })()
                      )}
                    </View>
                    
                    {/* Title */}
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#FF6A00',
                      marginBottom: 8,
                      lineHeight: 20
                    }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    {/* Show deity for temples, cause for charities */}
                    {item.type === 'Temple' && item.deity && (
                      <Text style={{
                        fontSize: 13,
                        color: '#666',
                        marginBottom: 6,
                        fontWeight: '500'
                      }} numberOfLines={1}>
                        🕉️ {item.deity}
                      </Text>
                    )}
                    
                    {item.type === 'Charity' && item.cause && (
                      <Text style={{
                        fontSize: 13,
                        color: '#4CAF50',
                        marginBottom: 6,
                        fontWeight: '500'
                      }} numberOfLines={1}>
                        🎯 {item.cause}
                      </Text>
                    )}
                    
                    {/* Location */}
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{
                        fontSize: 12,
                        color: '#333',
                        fontWeight: '500',
                        marginBottom: 2
                      }} numberOfLines={1}>
                        📍 {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Show empty state if no data */}
        {filteredData.length === 0 && !loading && !error && (
          <View style={{ 
            backgroundColor: 'orange', 
            padding: 20, 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              No items to display
            </Text>
            <Text>Data length: {data.length}</Text>
            <Text>Filtered length: {filteredData.length}</Text>
          </View>
        )}

        {/* Show loading state */}
        {loading && (
          <View style={{ 
            backgroundColor: 'blue', 
            padding: 20, 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginTop: 10 }}>
              Loading...
            </Text>
          </View>
        )}

        {/* Show error state */}
        {error && (
          <View style={{ 
            backgroundColor: 'red', 
            padding: 20, 
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Error:
            </Text>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              {error}
            </Text>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'white', 
                padding: 10, 
                borderRadius: 5, 
                marginTop: 10 
              }} 
              onPress={fetchData}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Temple/Charity Details Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity 
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxHeight: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FF6A00'
              }}>
                {selectedItem?.name}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={{
                  fontSize: 24,
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            {selectedItem?.about && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: 10
                }}>
                  About
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 20,
                  textAlign: 'justify'
                }}>
                  {selectedItem.about}
                </Text>
              </View>
            )}

            {/* Donate Button */}
            <TouchableOpacity style={{
              backgroundColor: '#FF6A00',
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold'
              }}>
                Donate
              </Text>
            </TouchableOpacity>

            {/* Image Gallery */}
            <View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: 15
              }}>
                Gallery
              </Text>
              
              {modalLoading ? (
                <View style={{
                  alignItems: 'center',
                  padding: 20
                }}>
                  <ActivityIndicator size="large" color="#FF6A00" />
                  <Text style={{
                    marginTop: 10,
                    color: '#666'
                  }}>
                    Loading images...
                  </Text>
                </View>
              ) : modalImages.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: 20
                  }}
                >
                  {modalImages.map((image, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={{
                        marginRight: 15,
                        borderRadius: 10,
                        overflow: 'hidden',
                        alignItems: 'center'
                      }}
                      onPress={() => handleImageClick(index)}
                    >
                      <Image
                        source={{ uri: image.url }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 10
                        }}
                        resizeMode="cover"
                      />
                      <Text style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: '#666',
                        textAlign: 'center',
                        maxWidth: 120
                      }} numberOfLines={2}>
                        {image.key.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Image'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={{
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 10
                }}>
                  <Text style={{
                    color: '#666',
                    fontSize: 14
                  }}>
                    No images available
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseImageViewer}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Close button */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10
            }}
            onPress={handleCloseImageViewer}
          >
            <Text style={{
              color: '#fff',
              fontSize: 30,
              fontWeight: 'bold'
            }}>
              ×
            </Text>
          </TouchableOpacity>

          {/* Image counter */}
          <Text style={{
            position: 'absolute',
            top: 50,
            left: 20,
            color: '#fff',
            fontSize: 16,
            zIndex: 10
          }}>
            {selectedImageIndex + 1} / {modalImages.length}
          </Text>

          {/* Main image */}
          <Image
            source={{ uri: modalImages[selectedImageIndex]?.url }}
            style={{
              width: '90%',
              height: '70%',
              borderRadius: 10,
              resizeMode: 'contain'
            }}
          />

          {/* Image name */}
          <Text style={{
            color: '#fff',
            fontSize: 16,
            marginTop: 20,
            textAlign: 'center',
            paddingHorizontal: 20
          }} numberOfLines={2}>
            {modalImages[selectedImageIndex]?.key.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Image'}
          </Text>

          {/* Navigation buttons */}
          <View style={{
            flexDirection: 'row',
            position: 'absolute',
            bottom: 50,
            justifyContent: 'space-between',
            width: '80%'
          }}>
            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: '#fff'
              }}
              onPress={handlePrevImage}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }}>
                ← Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: '#fff'
              }}
              onPress={handleNextImage}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 40,
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
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  contentScrollView: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 16,
    marginTop: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF6EE',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD6A0',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6A00',
    textAlign: 'center',
  },
  tilesContainer: {
    flex: 1,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  tile: {
    width: '48%', // Two tiles per row
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
    minHeight: 200,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  g80Badge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  g80Text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 8,
    lineHeight: 20,
  },
  tileDeity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  tileCause: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 6,
    fontWeight: '500',
  },
  tileLocation: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  zipText: {
    fontSize: 12,
    color: '#666',
  },
  tileAbout: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6A00',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 