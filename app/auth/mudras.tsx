import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export const options = { headerShown: false };

export default function MudrasScreen() {
  const router = useRouter();
  const [showMudrasModal, setShowMudrasModal] = useState(false);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Mudras</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.title}>Current Mudras</Text>
        {/* Placeholder for current mudras list */}
        <View style={styles.mudraListPlaceholder}>
          <Text style={{ color: '#888', fontSize: 16 }}>No mudras to show.</Text>
        </View>
        <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/auth/mudra-history')}>
          <Text style={styles.historyLinkText}>View Mudra History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyLink} onPress={() => setShowMudrasModal(true)}>
          <Text style={styles.historyLinkText}>How to earn Mudras</Text>
        </TouchableOpacity>
      </View>
      
      {/* How to Earn Mudras Modal */}
      <Modal
        visible={showMudrasModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMudrasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How to Earn Mudras</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMudrasModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Puja Activities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Puja Activities</Text>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Book any Puja: <Text style={styles.mudraCount}>500 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Refer a Friend: <Text style={styles.mudraCount}>100 Mudras</Text></Text>
                </View>
              </View>
              
              {/* One-time Activities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>One-time Activities</Text>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Complete Profile:</Text>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDetail}>• Phone Number: <Text style={styles.mudraCount}>10 Mudras</Text></Text>
                    <Text style={styles.activityDetail}>• Date of Birth: <Text style={styles.mudraCount}>10 Mudras</Text></Text>
                    <Text style={styles.activityDetail}>• Father's date of birth: <Text style={styles.mudraCount}>10 Mudras</Text></Text>
                    <Text style={styles.activityDetail}>• Mother's date of birth: <Text style={styles.mudraCount}>10 Mudras</Text></Text>
                    <Text style={styles.activityDetail}>• Children's name and date of birth: <Text style={styles.mudraCount}>15 Mudras / children</Text></Text>
                  </View>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Setup your Temple: <Text style={styles.mudraCount}>50 Mudras</Text></Text>
                </View>
              </View>
              
              {/* Daily Activities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Activities</Text>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Daily Login: <Text style={styles.mudraCount}>10 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Offer flowers to god: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Do aarti: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Ring the bell: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Play Shankh: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Offer Dhoop to God: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Listen to Audio / Video: <Text style={styles.mudraCount}>5 Mudras per audio / video</Text></Text>
                  <Text style={styles.activitySubtext}>(Max 25 Mudras per day)</Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>Check Rashifal: <Text style={styles.mudraCount}>5 Mudras</Text></Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  mudraListPlaceholder: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  historyLink: {
    marginTop: 8,
    alignSelf: 'center',
  },
  historyLinkText: {
    color: '#FF6A00',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FFF6EE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activityItem: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDetails: {
    marginLeft: 16,
    marginTop: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  mudraCount: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  activitySubtext: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 16,
    marginTop: 2,
  },
}); 