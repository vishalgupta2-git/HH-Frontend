/**
 * Puja Screen - Upcoming Pujas
 * 
 * Architecture:
 * 1. Initial Load: Uses base /api/upcoming-pujas endpoint to fetch 100 records
 * 2. Local Filtering: Date and temple filtering done locally for instant response
 * 3. Local Search: Text search performed on loaded data for fast results
 * 4. Specific Endpoints: Temple and date filtering use dedicated endpoints when needed
 * 5. Pagination: Loads more data as user scrolls (100 records per page)
 * 
 * Performance Benefits:
 * - Faster initial load (single API call)
 * - Instant filtering and search (no API delays)
 * - Progressive loading (only load what's needed)
 * - Reduced server load (fewer API calls)
 */

import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

export const options = { headerShown: false };

interface UpcomingPuja {
  id: string;
  pujaName: string;
  templeId: string;
  pujaDate: string;
  startTime: string;
  endTime: string;
  description: string;
  pujaOptions: any;
  createdAt: string;
  updatedAt: string;
  // Joined fields from templesAndCharities
  templeName?: string;
  templeType?: string;
  templeDeity?: string;
  templeCity?: string;
  templeState?: string;
}

export default function PujaScreen() {
  const { isHindi } = useLanguage();
  
  const translations = {
    searchPlaceholder: { en: 'Search upcoming pujas...', hi: 'आगामी पूजाओं की खोज करें...' },
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
    noDataFound: { en: 'No upcoming pujas found.', hi: 'कोई आगामी पूजा नहीं मिली।' },
    errorLoading: { en: 'Error loading data. Please try again.', hi: 'डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।' },
    pullToRefresh: { en: 'Pull to refresh', hi: 'रिफ्रेश करने के लिए खींचें' },
    pujaDetails: {
      title: { en: 'Puja Details', hi: 'पूजा विवरण' },
      temple: { en: 'Temple', hi: 'मंदिर' },
      date: { en: 'Date', hi: 'तारीख' },
      time: { en: 'Time', hi: 'समय' },
      description: { en: 'Description', hi: 'विवरण' },
      close: { en: 'Close', hi: 'बंद करें' }
    },
    loadingMore: { en: 'Loading more...', hi: 'और लोड हो रहा है...' },
    loadingPujas: { en: 'Loading upcoming pujas...', hi: 'आगामी पूजाएं लोड हो रही हैं...' },
    noItemsToDisplay: { en: 'No items to display', hi: 'दिखाने के लिए कोई आइटम नहीं' },
    error: { en: 'Error:', hi: 'त्रुटि:' },
    noMatches: { en: 'No pujas match your current filters. Try adjusting your search or filters.', hi: 'आपके वर्तमान फिल्टर से कोई पूजा मेल नहीं खाती। अपनी खोज या फिल्टर को समायोजित करने का प्रयास करें।' }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<UpcomingPuja[]>([]);
  const [filteredData, setFilteredData] = useState<UpcomingPuja[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    total: 0,
    hasMore: false
  });
  
  // Modal state
  const [modalLoading, setModalLoading] = useState(false);
  
  // Expanded tiles state
  const [expandedTiles, setExpandedTiles] = useState<Set<string>>(new Set());
  
  // Text modal state
  const [showTextModal, setShowTextModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextTitle, setSelectedTextTitle] = useState('');
  
  // Fetch upcoming pujas data - always use base endpoint
  const fetchData = async (offset = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const endpoint = getEndpointUrl('UPCOMING_PUJAS');
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: {
          limit: 100,
          offset: offset
        }
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        const newPagination = response.data.pagination;
        
        console.log('🔍 PujaScreen: API response received:', {
          success: response.data.success,
          dataLength: fetchedData.length,
          pagination: newPagination,
          status: response.status
        });
        
        if (append) {
          // Append new data for pagination
          setData(prev => [...prev, ...fetchedData]);
        } else {
          // Replace data for fresh load
          setData(fetchedData);
        }
        
        setPagination(newPagination);
      } else {
        setError(response.data.message || 'Failed to fetch pujas');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pujas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more data for pagination
  const loadMoreData = () => {
    if (pagination.hasMore && !loading) {
      fetchData(pagination.offset + pagination.limit, true);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData(0, false);
  };

  // Handle retry
  const handleRetry = () => {
    fetchData(0, false);
  };

  // Filter data based on search query and date filter
  useEffect(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.pujaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.templeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.templeCity?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [data, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchData(0, false);
  }, []);

  // Handle tile expansion toggle
  const toggleTileExpansion = (itemId: string) => {
    setExpandedTiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle showing text modal
  const showTextModalHandler = (text: string, title: string) => {
    setSelectedText(text);
    setSelectedTextTitle(title);
    setShowTextModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render individual puja tile
  const renderPujaTile = (item: UpcomingPuja) => {
    const isExpanded = expandedTiles.has(item.id);
    
    return (
      <View
        key={item.id}
        style={styles.pujaTile}
      >
        <View style={styles.tileHeader}>
          <View style={styles.tileLeft}>
            <View style={styles.tileInfo}>
              <Text style={styles.pujaName} numberOfLines={2}>
                {item.pujaName}
              </Text>
              <Text style={styles.templeName} numberOfLines={1}>
                {item.templeName || 'Temple Name'}
              </Text>
            </View>
          </View>
          <View style={styles.tileRight}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{formatDate(item.pujaDate)}</Text>
              <Text style={styles.timeText}>
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </Text>
            </View>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.tileFooter}>
          <Text style={styles.locationText}>
            {item.templeCity}, {item.templeState}
          </Text>
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => toggleTileExpansion(item.id)}
          >
            <Text style={styles.expandText}>Details</Text>
            <Text style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Details Section */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <Text style={styles.expandedTitle}>Puja Options</Text>
            {item.pujaOptions && item.pujaOptions.PujaOptions ? (
              Object.entries(item.pujaOptions.PujaOptions).map(([pujaType, pujaData]: [string, any]) => (
                <View key={pujaType} style={styles.pujaOptionSection}>
                  <Text style={styles.pujaTypeTitle}>{pujaType}</Text>
                  <Text style={styles.pujaTypeDetails}>{pujaData.details}</Text>
                  {pujaData.time && (
                    <Text style={styles.pujaTypeTime}>Time: {formatTime(pujaData.time)}</Text>
                  )}
                  
                  {pujaData.offerings && (
                    <View style={styles.offeringsSection}>
                      <Text style={styles.offeringsTitle}>Offerings:</Text>
                      {Object.entries(pujaData.offerings).map(([offeringName, offeringData]: [string, any]) => (
                        <View key={offeringName} style={styles.offeringItem}>
                          <Text style={styles.offeringName}>{offeringName}</Text>
                          <Text style={styles.offeringDetails}>{offeringData.details}</Text>
                          {offeringData.pricingOptions && (
                            <View style={styles.pricingSection}>
                              {Object.entries(offeringData.pricingOptions).map(([option, price]: [string, any]) => (
                                <View key={option} style={styles.pricingRow}>
                                  <TouchableOpacity 
                                    style={styles.optionTextContainer}
                                    onPress={() => showTextModalHandler(option, 'Option Details')}
                                  >
                                    <Text style={styles.optionText} numberOfLines={1}>
                                      {option}
                                    </Text>
                                    {option.length > 20 && (
                                      <Text style={styles.ellipsis}>...</Text>
                                    )}
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                    style={styles.pricingButton}
                                    onPress={() => {
                                      // Handle booking for this specific option
                                      console.log(`Book ${offeringName} - ${option} for ₹${price}`);
                                    }}
                                  >
                                    <Text style={styles.pricingButtonText}>
                                      Book Now ₹{price}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noOptionsText}>No puja options available</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>{isHindi ? translations.loadingPujas.hi : translations.loadingPujas.en}</Text>
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder={isHindi ? translations.searchPlaceholder.hi : translations.searchPlaceholder.en}
        onSearchChange={setSearchQuery}
        showSearchBar={true}
        showDailyPujaButton={false}
        showLanguageToggle={false}
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            loadMoreData();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {pagination.total > 0 
              ? `Showing ${filteredData.length} of ${pagination.total} total pujas`
              : filteredData.length > 0 
                ? `Showing ${filteredData.length} pujas`
                : (isHindi ? 'कोई पूजा नहीं मिली' : 'No pujas found')
            }
          </Text>
          {pagination.hasMore && (
            <Text style={styles.loadMoreText}>Scroll down to load more</Text>
          )}
        </View>

        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{isHindi ? translations.noDataFound.hi : translations.noDataFound.en}</Text>
            <Text style={styles.emptySubtext}>
              {isHindi ? translations.noMatches.hi : translations.noMatches.en}
            </Text>
          </View>
        ) : (
          <View style={styles.pujaGrid}>
            {filteredData.map(renderPujaTile)}
          </View>
        )}

        {pagination.hasMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#FF6B35" />
            <Text style={styles.loadingMoreText}>{isHindi ? translations.loadingMore.hi : translations.loadingMore.en}</Text>
          </View>
        )}
      </ScrollView>

      {/* Text Modal for Full Text Display */}
      <Modal
        visible={showTextModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTextModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTextModal(false)}
        >
          <View style={styles.textModalContent}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
            >
              <View style={styles.textModalBody}>
                <View style={styles.textModalHeader}>
                  <Text style={styles.textModalTitle}>{isHindi ? translations.pujaDetails.title.hi : translations.pujaDetails.title.en}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowTextModal(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.textModalText}>{selectedText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadMoreText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  pujaGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pujaTile: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tileLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  tileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  pujaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templeName: {
    fontSize: 14,
    color: '#666',
  },
  tileRight: {
    alignItems: 'flex-end',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tileFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  textModalBody: {
    padding: 24,
  },
  textModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  textModalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 24,
    color: '#666',
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  expandedDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pujaOptionSection: {
    marginBottom: 16,
  },
  pujaTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pujaTypeDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pujaTypeTime: {
    fontSize: 13,
    color: '#999',
  },
  offeringsSection: {
    marginTop: 8,
  },
  offeringsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  offeringItem: {
    marginBottom: 12,
  },
  offeringName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  offeringDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  pricingSection: {
    marginTop: 8,
    gap: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  ellipsis: {
    fontSize: 14,
    color: '#999',
  },
  pricingButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pricingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noOptionsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
}); 