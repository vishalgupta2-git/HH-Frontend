import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
const TOP_PADDING = (Platform.OS === 'android' ? statusBarHeight : 0) + 24;

export default function HomeHeader({ searchPlaceholder, extraContent }: { searchPlaceholder?: string, extraContent?: ReactNode }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      {/* Top Row: Hamburger, Title, Language */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.centeredTitle}>The Hindu Heritage</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="translate" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Search Bar and Button */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder || "Search for ‘puja ‘"}
            placeholderTextColor="#fff"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.micButton}>
            <Feather name="mic" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Extra content below search bar */}
      {extraContent && <View style={{ width: '100%', alignItems: 'center' }}>{extraContent}</View>}
      {/* Modal for options */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/login'); }}>
              <Text style={styles.modalText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setModalVisible(false); router.push('/signup'); }}>
              <Text style={styles.modalText}>Sign-Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalText}>Mudras</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 275,
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? -statusBarHeight : 0,
    paddingTop: TOP_PADDING,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 275,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    minHeight: 48,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  centeredTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  searchSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    width: '88%',
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  micButton: {
    marginLeft: 8,
    padding: 4,
  },
  dailyPujaButton: {
    width: '88%',
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyPujaButtonText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    marginTop: 60,
    marginLeft: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalText: {
    fontSize: 18,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
}); 