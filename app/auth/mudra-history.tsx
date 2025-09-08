import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMudraHistory } from '@/utils/mudraUtils';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export const options = { headerShown: false };

interface MudraHistoryEntry {
  id: string;
  activityType: string;
  mudrasEarned: number;
  activityDate: string;
  createdAt: string;
}

export default function MudraHistoryScreen() {
  const router = useRouter();
  const { isHindi } = useLanguage();
  const [history, setHistory] = useState<MudraHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMudras, setTotalMudras] = useState(0);

  const translations = {
    headerTitle: { en: 'Mudra History', hi: 'मुद्रा इतिहास' },
    totalMudrasEarned: { en: 'Total Mudras Earned', hi: 'कुल अर्जित मुद्राएं' },
    activities: { en: 'Activities', hi: 'गतिविधियां' },
    loadingHistory: { en: 'Loading history...', hi: 'इतिहास लोड हो रहा है...' },
    noMudraHistory: { en: 'No mudra history yet', hi: 'अभी तक कोई मुद्रा इतिहास नहीं' },
    startEarningMudras: { en: 'Start earning mudras by completing activities!', hi: 'गतिविधियां पूरी करके मुद्राएं कमाना शुरू करें!' },
    backToMudras: { en: 'Back to Mudras', hi: 'मुद्राओं पर वापस जाएं' }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getMudraHistory();
        if (result.success && result.history) {
          setHistory(result.history);
          const total = result.history.reduce((sum, entry) => sum + entry.mudrasEarned, 0);
          setTotalMudras(total);
        }
      } catch (error) {
        console.error('Error fetching mudra history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Text style={styles.headerTitle}>{isHindi ? translations.headerTitle.hi : translations.headerTitle.en}</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      <View style={styles.card}>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>{isHindi ? translations.totalMudrasEarned.hi : translations.totalMudrasEarned.en}</Text>
          <Text style={styles.totalMudras}>{totalMudras}</Text>
          <Text style={styles.summarySubtitle}>{history.length} {isHindi ? translations.activities.hi : translations.activities.en}</Text>
        </View>

        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{isHindi ? translations.loadingHistory.hi : translations.loadingHistory.en}</Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{isHindi ? translations.noMudraHistory.hi : translations.noMudraHistory.en}</Text>
              <Text style={styles.emptySubtext}>{isHindi ? translations.startEarningMudras.hi : translations.startEarningMudras.en}</Text>
            </View>
          ) : (
            history.map((entry, index) => (
              <View key={entry.id || index} style={styles.historyItem}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityType}>{entry.activityType}</Text>
                  <Text style={styles.activityDate}>
                    {formatDate(entry.activityDate)} at {formatTime(entry.createdAt)}
                  </Text>
                </View>
                <View style={styles.mudrasEarned}>
                  <Text style={styles.mudrasText}>+{entry.mudrasEarned}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{isHindi ? translations.backToMudras.hi : translations.backToMudras.en}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

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
    flex: 1,
  },
  summarySection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalMudras: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#888',
  },
  historyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  mudrasEarned: {
    alignItems: 'flex-end',
  },
  mudrasText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  backButton: {
    backgroundColor: '#FF6A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 