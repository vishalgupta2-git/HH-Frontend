import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl } from 'react-native';
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

  // Fetch temples and charities data
  const fetchData = async () => {
    try {
      console.log('🔍 DonationScreen: Starting to fetch data...');
      setLoading(true);
      setError(null);
      
      const endpoint = getEndpointUrl('TEMPLES_CHARITIES');
      console.log('🔍 DonationScreen: API endpoint:', endpoint);
      console.log('🔍 DonationScreen: Request params:', { limit: 100, offset: 0 });
      
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: {
          limit: 100, // Get more items for better user experience
          offset: 0
        }
      });

      console.log('🔍 DonationScreen: API response received:', {
        status: response.status,
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        pagination: response.data.pagination
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        console.log('🔍 DonationScreen: Data fetched successfully:', {
          totalItems: fetchedData.length,
          firstItem: fetchedData[0] || 'No items',
          types: [...new Set(fetchedData.map((item: TempleCharity) => item.type))],
          sampleNames: fetchedData.slice(0, 3).map((item: TempleCharity) => item.name)
        });
        setData(fetchedData);
      } else {
        console.error('❌ DonationScreen: API returned success: false');
        setError('Failed to fetch data');
      }
    } catch (err: any) {
      console.error('❌ DonationScreen: Error fetching data:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          headers: err.config?.headers,
          params: err.config?.params
        }
      });
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      console.log('🔍 DonationScreen: Setting loading to false');
      setLoading(false);
    }
  };

  // Filter data based on search query and toggle states
  useEffect(() => {
    console.log('🔍 DonationScreen: Filtering data...', {
      totalData: data.length,
      searchQuery,
      templesEnabled,
      charitiesEnabled
    });

    let filtered = data;

    // Filter by type (Temple or Charity)
    if (templesEnabled && charitiesEnabled) {
      console.log('🔍 DonationScreen: Both types enabled, showing all items');
      // Show all
    } else if (templesEnabled) {
      filtered = filtered.filter(item => item.type === 'Temple');
      console.log('🔍 DonationScreen: Only temples enabled, filtered to:', filtered.length, 'items');
    } else if (charitiesEnabled) {
      filtered = filtered.filter(item => item.type === 'Charity');
      console.log('🔍 DonationScreen: Only charities enabled, filtered to:', filtered.length, 'items');
    } else {
      console.log('🔍 DonationScreen: Both types disabled, showing no items');
      filtered = []; // Both disabled
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      console.log('🔍 DonationScreen: Applying search filter for query:', query);
      
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
      
      console.log('🔍 DonationScreen: Search filter applied:', {
        beforeSearch,
        afterSearch: filtered.length,
        searchQuery: query
      });
    }

    console.log('🔍 DonationScreen: Final filtered data:', {
      totalFiltered: filtered.length,
      sampleItems: filtered.slice(0, 2).map(item => ({
        name: item.name,
        type: item.type,
        city: item.city
      }))
    });

    console.log('🔍 DonationScreen: Setting filteredData state to:', filtered.length, 'items');
    setFilteredData(filtered);
  }, [data, searchQuery, templesEnabled, charitiesEnabled]);

  // Add logging for filteredData state changes
  useEffect(() => {
    console.log('🔍 DonationScreen: filteredData state changed:', {
      length: filteredData.length,
      sampleItems: filteredData.slice(0, 2).map(item => ({
        name: item.name,
        type: item.type
      }))
    });
  }, [filteredData]);

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
    console.log('🔍 DonationScreen: renderTile called for item:', {
      id: item.id,
      name: item.name,
      type: item.type
    });
    
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
                  <View key={item.id} style={{
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
                  }}>
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
                    
                    {/* Deity */}
                    {item.deity && (
                      <Text style={{
                        fontSize: 13,
                        color: '#666',
                        marginBottom: 4,
                        fontWeight: '500'
                      }} numberOfLines={1}>
                        🕉️ {item.deity}
                      </Text>
                    )}
                    
                    {/* Cause */}
                    {item.cause && (
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
                  </View>
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