import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { 
  Dimensions, 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { API_CONFIG, getApiUrl } from '@/constants/ApiConfig';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

export const options = { headerShown: false };

interface ApiResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  responseTime?: number;
}

interface ApiTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  description: string;
  category: string;
}

const API_TESTS: ApiTest[] = [
  // Health & Status
  { name: 'Health Check', endpoint: '/', method: 'GET', description: 'Basic health check', category: 'Health & Status' },
  { name: 'Test Route', endpoint: '/test', method: 'GET', description: 'Simple test route', category: 'Health & Status' },
  { name: 'API Test', endpoint: '/api/test', method: 'GET', description: 'API routing test', category: 'Health & Status' },
  { name: 'Ping', endpoint: '/api/ping', method: 'GET', description: 'Server status check', category: 'Health & Status' },
  { name: 'Debug', endpoint: '/api/debug', method: 'GET', description: 'Environment variables debug', category: 'Health & Status' },
  { name: 'Test Connection', endpoint: '/api/test-connection', method: 'GET', description: 'Supabase connection test', category: 'Health & Status' },
  { name: 'Mongo Status', endpoint: '/api/mongo-status', method: 'GET', description: 'MongoDB status check', category: 'Health & Status' },
  { name: 'Status', endpoint: '/api/status', method: 'GET', description: 'Overall system status', category: 'Health & Status' },
  { name: 'Test Users', endpoint: '/api/test-users', method: 'GET', description: 'Test users table', category: 'Health & Status' },
  
  // Temple & Deity
  { name: 'Deity Statues', endpoint: '/api/deity-statues', method: 'GET', description: 'Get deity statues', category: 'Temple & Deity' },
  
  // Puja Services
  { name: 'Professional Pujas', endpoint: '/api/professional-pujas', method: 'GET', description: 'Get professional pujas', category: 'Puja Services' },
  { name: 'Special Puja', endpoint: '/api/special-puja', method: 'GET', description: 'Get special puja info', category: 'Puja Services' },
  
  // Media & Content
  { name: 'Media Files', endpoint: '/api/media-files', method: 'GET', description: 'Get audio/video files', category: 'Media & Content' },
  { name: 'Check AudioVideo', endpoint: '/api/check-audiovideo', method: 'GET', description: 'Check audiovideo data', category: 'Media & Content' },
  
  // S3 Storage
  { name: 'S3 Debug', endpoint: '/api/s3/debug', method: 'GET', description: 'S3 configuration debug', category: 'S3 Storage' },
  { name: 'S3 Test', endpoint: '/api/s3/test', method: 'GET', description: 'S3 connectivity test', category: 'S3 Storage' },
  { name: 'S3 Files', endpoint: '/api/s3/files', method: 'GET', description: 'List S3 files', category: 'S3 Storage' },
  { name: 'S3 Download URL', endpoint: '/api/s3/download-url?key=test', method: 'GET', description: 'Generate download URL', category: 'S3 Storage' },
  { name: 'S3 File Info', endpoint: '/api/s3/file-info?key=test', method: 'GET', description: 'Get file metadata', category: 'S3 Storage' },
  { name: 'S3 Media', endpoint: '/api/s3/media', method: 'GET', description: 'Get media files from S3', category: 'S3 Storage' },
  
  // Temple Management
  { name: 'Temples by Day', endpoint: '/api/temples-by-day?dayOfWeek=monday', method: 'GET', description: 'Get temples by day', category: 'Temple Management' },
  { name: 'Get User Temple', endpoint: '/api/get-user-temple', method: 'GET', description: 'Get user temple', category: 'Temple Management' },
  
  // User Management
  { name: 'User Profile', endpoint: '/api/user', method: 'GET', description: 'Get user profile', category: 'User Management' },
  { name: 'User Mudras', endpoint: '/api/user-mudras', method: 'GET', description: 'Get user mudras', category: 'User Management' },
  { name: 'Mudra History', endpoint: '/api/mudra-history', method: 'GET', description: 'Get mudra history', category: 'User Management' },
  
  // Testing Endpoints
  { name: 'Test Special Puja', endpoint: '/api/test-special-puja', method: 'GET', description: 'Test special puja functionality', category: 'Testing' },
  { name: 'Test Puja Bookings', endpoint: '/api/test-puja-bookings', method: 'GET', description: 'Test puja bookings', category: 'Testing' },
  { name: 'Test OTPs', endpoint: '/api/test-otps', method: 'GET', description: 'Test OTP functionality', category: 'Testing' },
  { name: 'Test OTP Upsert', endpoint: '/api/test-otp-upsert', method: 'GET', description: 'Test OTP upsert', category: 'Testing' },
  { name: 'Test User Temples', endpoint: '/api/test-usertemples', method: 'GET', description: 'Test user temples', category: 'Testing' },
  { name: 'Test DB', endpoint: '/api/test-db', method: 'GET', description: 'Test database connectivity', category: 'Testing' },
];

export default function ApiTestScreen() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, error: 0, pending: 0 });

  const testApi = async (apiTest: ApiTest): Promise<ApiResult> => {
    const startTime = Date.now();
    
    try {
      const url = getApiUrl(apiTest.endpoint);
      console.log(`🧪 Testing ${apiTest.name}: ${url}`);
      
      const response = await fetch(url, {
        method: apiTest.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok) {
        return {
          endpoint: apiTest.name,
          status: 'success',
          data,
          responseTime,
        };
      } else {
        return {
          endpoint: apiTest.name,
          status: 'error',
          error: `HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}`,
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: apiTest.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    const newResults: ApiResult[] = [];
    
    for (const apiTest of API_TESTS) {
      // Add pending result
      const pendingResult: ApiResult = {
        endpoint: apiTest.name,
        status: 'pending',
      };
      newResults.push(pendingResult);
      setResults([...newResults]);
      
      // Test the API
      const result = await testApi(apiTest);
      
      // Update the result
      const index = newResults.findIndex(r => r.endpoint === apiTest.name);
      if (index !== -1) {
        newResults[index] = result;
        setResults([...newResults]);
      }
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLoading(false);
    updateSummary(newResults);
  };

  const updateSummary = (currentResults: ApiResult[]) => {
    const total = currentResults.length;
    const success = currentResults.filter(r => r.status === 'success').length;
    const error = currentResults.filter(r => r.status === 'error').length;
    const pending = currentResults.filter(r => r.status === 'pending').length;
    
    setSummary({ total, success, error, pending });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await runAllTests();
    setRefreshing(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const groupResultsByCategory = () => {
    const grouped: { [key: string]: ApiResult[] } = {};
    
    results.forEach(result => {
      const apiTest = API_TESTS.find(test => test.name === result.endpoint);
      const category = apiTest?.category || 'Other';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(result);
    });
    
    return grouped;
  };

  const renderResultItem = (result: ApiResult) => {
    const apiTest = API_TESTS.find(test => test.name === result.endpoint);
    
    return (
      <View key={result.endpoint} style={styles.resultItem}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{result.endpoint}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon(result.status)}</Text>
            <Text style={[styles.statusText, { color: getStatusColor(result.status) }]}>
              {result.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {apiTest && (
          <Text style={styles.resultDescription}>{apiTest.description}</Text>
        )}
        
        {result.responseTime && (
          <Text style={styles.responseTime}>Response time: {result.responseTime}ms</Text>
        )}
        
        {result.status === 'error' && result.error && (
          <Text style={styles.errorText}>Error: {result.error}</Text>
        )}
        
        {result.status === 'success' && result.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Response Data:</Text>
            <Text style={styles.dataText} numberOfLines={3}>
              {JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>API Test Dashboard</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>API Test Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.total}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>{summary.success}</Text>
                <Text style={styles.summaryLabel}>Success</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#F44336' }]}>{summary.error}</Text>
                <Text style={styles.summaryLabel}>Error</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#FF9800' }]}>{summary.pending}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={runAllTests}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Run All Tests</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => {
                Alert.alert(
                  'API Base URL',
                  `Current base URL: ${API_CONFIG.BASE_URL}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.buttonText}>Show Base URL</Text>
            </TouchableOpacity>
          </View>

          {/* Results by Category */}
          {Object.entries(groupResultsByCategory()).map(([category, categoryResults]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {categoryResults.map(renderResultItem)}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 24,
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
  scrollView: {
    flex: 1,
    marginTop: CARD_MARGIN_TOP,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF9800',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  responseTime: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
  },
  dataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
}); 