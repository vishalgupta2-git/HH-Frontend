import HomeHeader from '@/components/Home/HomeHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function DarshanScreen() {
  const router = useRouter();

  const handleImageGalleryPress = () => {
    router.push('/screens/image-gallery');
  };

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Temples or Darshan" showDailyPujaButton={false} />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeader}>Darshan</Text>
        
        {/* Image Gallery Card */}
        <TouchableOpacity style={styles.galleryCard} onPress={handleImageGalleryPress}>
          <LinearGradient
            colors={["#FFA040", "#FF6A00"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🖼️</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Image Gallery</Text>
                <Text style={styles.cardSubtitle}>Explore divine images from temples and deities</Text>
              </View>
              <View style={styles.cardArrowContainer}>
                <Text style={styles.cardArrow}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Additional Darshan Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsHeader}>More Darshan Options</Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🏛️</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Virtual Darshan</Text>
              <Text style={styles.optionDescription}>Experience temple darshan virtually</Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🙏</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Live Darshan</Text>
              <Text style={styles.optionDescription}>Watch live temple ceremonies</Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>📱</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Darshan Schedule</Text>
              <Text style={styles.optionDescription}>Check temple timings and schedules</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  content: { 
    padding: 15 
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  galleryCard: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 15,
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardArrowContainer: {
    width: 30,
    alignItems: 'center',
  },
  cardArrow: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});
