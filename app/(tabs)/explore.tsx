import HomeHeader from '@/components/Home/HomeHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function DarshanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Temples or Darshan" showDailyPujaButton={false} />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeader}>Darshan</Text>
        
        {/* Virtual Darshan Card */}
        <TouchableOpacity style={styles.galleryCard}>
          <LinearGradient
            colors={["#FFA040", "#FF6A00"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🏛️</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Virtual Darshan</Text>
                <Text style={styles.cardSubtitle}>Experience temple darshan virtually (coming soon...)</Text>
              </View>
              <View style={styles.cardArrowContainer}>
                <Text style={styles.cardArrow}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Live Darshan Card */}
        <TouchableOpacity style={styles.galleryCard}>
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🙏</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Live Darshan</Text>
                <Text style={styles.cardSubtitle}>Watch live temple ceremonies (coming soon...)</Text>
              </View>
              <View style={styles.cardArrowContainer}>
                <Text style={styles.cardArrow}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Darshan Schedule Card */}
        <TouchableOpacity style={styles.galleryCard}>
          <LinearGradient
            colors={["#2196F3", "#1976D2"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>📱</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Darshan Schedule</Text>
                <Text style={styles.cardSubtitle}>Check temple timings and schedules (coming soon...)</Text>
              </View>
              <View style={styles.cardArrowContainer}>
                <Text style={styles.cardArrow}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
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
});
