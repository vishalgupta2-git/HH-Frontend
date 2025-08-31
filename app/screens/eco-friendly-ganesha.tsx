import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Modal, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import HomeHeader from '@/components/Home/HomeHeader';

const { width, height } = Dimensions.get('window');

export const options = { headerShown: false };

export default function EcoFriendlyGaneshaScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
             <HomeHeader 
         searchPlaceholder="Eco-Friendly Ganesha" 
         showDailyPujaButton={false}
         showSearchBar={false}
                   extraContent={
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                World's most <Text style={styles.greenText}>sustainable</Text> <Text style={styles.boldText}>Ganesha Chaturthi</Text> Celebration
              </Text>
              <TouchableOpacity 
                style={styles.clickableTextContainer}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.clickableText}>Why should I choose e-Ganesha?</Text>
              </TouchableOpacity>
            </View>
          }
       />
       
               <LinearGradient
          colors={['#FFFFFF', '#FFF8E1', '#FFECB3']}
          style={styles.contentContainer}
        >
          {/* 3D Ganesha Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.ganesha3DButton}
              onPress={() => router.push('/screens/3d-ganesha')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="cube" size={32} color="#FF6A00" />
                <Text style={styles.buttonTitle}>3D Ganesha Darshan</Text>
                <Text style={styles.buttonSubtitle}>Experience Lord Ganesha in 3D</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FF6A00" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

       {/* Modal */}
       <Modal
         visible={modalVisible}
         transparent
         animationType="fade"
         onRequestClose={() => setModalVisible(false)}
       >
                   <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Why Choose sustainable e-Ganesha?</Text>
              <View style={styles.modalItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.modalText}>Get Ganesha blessings anytime anywhere</Text>
              </View>
              <View style={styles.modalItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.modalText}>No crowds</Text>
              </View>
              <View style={styles.modalItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.modalText}>Never forget to do Puja with our timely reminders</Text>
              </View>
              <View style={styles.modalItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.modalText}>Puja Vidhi explained in detail with our videos</Text>
              </View>
              <View style={styles.modalItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.modalText}>All Aarti's and Bhajans available at your fingertips</Text>
              </View>
            </View>
          </Pressable>
       </Modal>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 0,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    lineHeight: 30,
  },
  greenText: {
    fontWeight: '600',
  },
  boldText: {
    fontWeight: 'bold',
  },
  clickableTextContainer: {
    marginTop: 15,
  },
  clickableText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#FF6A00',
    marginRight: 10,
    marginTop: 2,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    lineHeight: 22,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ganesha3DButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flex: 1,
    marginRight: 10,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginTop: 5,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
});
