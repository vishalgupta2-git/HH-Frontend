import HomeHeader from '@/components/Home/HomeHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const options = { headerShown: false };

export default function DonationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templesEnabled, setTemplesEnabled] = useState(true);
  const [charitiesEnabled, setCharitiesEnabled] = useState(true);

  const toggleControls = (
    <View style={styles.toggleRow}>
      {/* Temples Toggle */}
      <TouchableOpacity 
        style={styles.toggleItem}
        onPress={() => setTemplesEnabled(!templesEnabled)}
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
        onPress={() => setCharitiesEnabled(!charitiesEnabled)}
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

  return (
    <View style={styles.container}>
      <HomeHeader 
        searchPlaceholder="Search for Temple, Charity or Cause" 
        showDailyPujaButton={false} 
        onSearchChange={setSearchQuery}
        extraContent={toggleControls}
      />

      <View style={styles.content}>
        <View style={styles.contentCard}>
          <Text style={styles.headline}>Offer your devotion. Support temples and charities.</Text>
          <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.contentText}>
              Your donations help keep age-old rituals alive and temples vibrant. By contributing, you become part of a sacred chain of faith that nurtures priests, preserves heritage, and ensures that pujas continue unbroken.
            </Text>
            <Text style={styles.contentText}>
              Select a temple close to your heart, enter your details, and make your offering. Your support, small or large, is a blessing that comes full circle.
            </Text>
          </ScrollView>
        </View>
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
}); 