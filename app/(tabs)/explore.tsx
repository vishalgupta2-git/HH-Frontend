import HomeHeader from '@/components/Home/HomeHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DarshanScreen() {
  return (
    <View style={styles.container}>
      <HomeHeader searchPlaceholder="Search for Temples or Darshan" showDailyPujaButton={false} />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeader}>Darshan</Text>
        {/* Placeholder for Darshan content */}
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Darshan content coming soon...</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 15 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  placeholderBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
});
