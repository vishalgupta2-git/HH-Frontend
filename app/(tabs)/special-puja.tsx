import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const options = [
  {
    label: 'Birthdays & Anniversaries',
    icon: require('@/assets/images/icons/special puja icons/birthdays-anniversaries.png'),
  },
  {
    label: 'Exams & Job Interviews',
    icon: require('@/assets/images/icons/special puja icons/exams-job-interviews.png'),
  },
  {
    label: 'Welcoming a newborn',
    icon: require('@/assets/images/icons/special puja icons/welcoming-a-newborn.png'),
  },
  {
    label: 'Important results',
    icon: require('@/assets/images/icons/special puja icons/important-results.png'),
  },
  {
    label: 'Death anniversaries',
    icon: require('@/assets/images/icons/special puja icons/death-anniversaries.png'),
  },
  {
    label: 'Even first dates & proposals',
    icon: require('@/assets/images/icons/special puja icons/first-date-proposals.png'),
  },
];

const timeSlots = [
  '8:00-10:00 AM', '10:00-12:00 PM', '12:00-2:00 PM', '2:00-4:00 PM',
  '4:00-6:00 PM', '6:00-8:00 PM', '8:00-10:00 PM'
];

export default function SpecialPujaScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDate, setShowDate] = useState(false);
  const [slot, setSlot] = useState(timeSlots[0]);

  const handleBook = () => {
    setModalVisible(true);
  };

  const handleConfirm = () => {
    if (!name.trim() || phone.length < 7) {
      Alert.alert('Please enter a valid name and phone number.');
      return;
    }
    setModalVisible(false);
    setConfirmVisible(true);
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
        <Text style={styles.headerTitle}>Hindu Heritage</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.title}>Special Puja For</Text>
        <View style={styles.grid}>
          {options.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.tile, selected === idx && styles.tileSelected]}
              activeOpacity={0.8}
              onPress={() => setSelected(idx)}
            >
              <View style={[styles.iconCircle, selected === idx && styles.iconCircleSelected]}>
                <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
              </View>
              <Text style={[styles.label, selected === idx && styles.labelSelected]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <LinearGradient
        colors={["#FF9800", "#FFA040"]}
        style={styles.ctaButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.8} onPress={handleBook}>
          <Text style={styles.ctaText}>Book a puja and let divine energy guide your journey.</Text>
        </TouchableOpacity>
      </LinearGradient>
      {/* Modal for booking */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Thanks for requesting {options[selected].label}, please enter the following to let us contact you
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.datePickerBtn}>
              <Text style={styles.datePickerText}>Date: {date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, d) => {
                  setShowDate(false);
                  if (d) setDate(d);
                }}
              />
            )}
            <View style={styles.slotRow}>
              {timeSlots.map(ts => (
                <TouchableOpacity
                  key={ts}
                  style={[styles.slotBtn, slot === ts && styles.slotBtnSelected]}
                  onPress={() => setSlot(ts)}
                >
                  <Text style={[styles.slotText, slot === ts && styles.slotTextSelected]}>{ts}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalConfirmBtn, {flex: 1, marginRight: 8}]} onPress={handleConfirm}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, {flex: 1, marginLeft: 8}]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Confirmation Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* X button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setConfirmVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              We have received your request for {options[selected].label} and will contact you on {date.toLocaleDateString()} between {slot}
            </Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => setConfirmVisible(false)}>
              <Text style={styles.modalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;
const tileSize = (width - 64) / 3;

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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tile: {
    width: tileSize,
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF6EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FFD6A0',
  },
  iconImage: {
    width: 32,
    height: 32,
    tintColor: '#FF9800',
  },
  label: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  ctaButton: {
    marginTop: 18,
    marginHorizontal: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  tileSelected: {
    borderColor: '#FF9800',
    borderWidth: 2,
    backgroundColor: '#FFF3E0',
  },
  iconCircleSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  labelSelected: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#222',
    backgroundColor: '#FAFAFA',
    width: '100%',
  },
  datePickerBtn: {
    backgroundColor: '#FFF6EE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  slotBtn: {
    borderWidth: 1,
    borderColor: '#FFD6A0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#FFF6EE',
  },
  slotBtnSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFE0B2',
  },
  slotText: {
    color: '#888',
    fontSize: 15,
  },
  slotTextSelected: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    backgroundColor: '#3A3939',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}); 