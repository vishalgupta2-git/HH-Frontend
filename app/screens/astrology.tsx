import HomeHeader from '@/components/Home/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export const options = { headerShown: false };

export default function AstrologyScreen() {
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [rashiDropdownOpen, setRashiDropdownOpen] = useState(false);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);

  const rashiList = [
    'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
    'Leo (Singh)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
    'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
  ];

  const frequencyList = ['Daily', 'Weekly', 'Monthly'];

  // Content from astrologyFixedContent.txt (without the headline)
  const astrologyContent = `Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.

Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.`;

  const filterRow = (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setRashiDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedRashi || 'Select Rashi'}
            </Text>
            <MaterialCommunityIcons
              name={rashiDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={rashiDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setRashiDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setRashiDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {rashiList.map(rashi => (
                      <TouchableOpacity
                        key={rashi}
                        style={[
                          styles.filterDropdownItem,
                          selectedRashi === rashi && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedRashi === rashi) {
                            setSelectedRashi(null);
                          } else {
                            setSelectedRashi(rashi);
                          }
                          setRashiDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedRashi === rashi && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {rashi}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>

        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setFrequencyDropdownOpen(open => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {selectedFrequency || 'Duration'}
            </Text>
            <MaterialCommunityIcons
              name={frequencyDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
          <Modal
            visible={frequencyDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setFrequencyDropdownOpen(false)}
          >
            <TouchableWithoutFeedback onPress={() => setFrequencyDropdownOpen(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <View style={styles.filterDropdownModalList}>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {frequencyList.map(frequency => (
                      <TouchableOpacity
                        key={frequency}
                        style={[
                          styles.filterDropdownItem,
                          selectedFrequency === frequency && styles.filterDropdownItemSelected
                        ]}
                        onPress={() => {
                          if (selectedFrequency === frequency) {
                            setSelectedFrequency(null);
                          } else {
                            setSelectedFrequency(frequency);
                          }
                          setFrequencyDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterDropdownItemText,
                            selectedFrequency === frequency && styles.filterDropdownItemTextSelected
                          ]}
                        >
                          {frequency}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>
      
      <TouchableOpacity style={styles.rashifalButton}>
        <Text style={styles.rashifalButtonText}>Show my rashifal now</Text>
      </TouchableOpacity>
      <View style={styles.rashifalHelpText}>
        <Text style={styles.rashifalHelpTextRegular}>Don't know your Rashi? </Text>
        <TouchableOpacity>
          <Text style={styles.rashifalHelpTextLink}>Click here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HomeHeader extraContent={filterRow} showDailyPujaButton={false} showSearchBar={false} />
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <Text style={styles.headline}>Discover the timeless wisdom of the stars.</Text>
          <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.contentText}>
              Astrology isn't just about predicting the future. It's a guide to understanding yourself, your relationships, and the energies shaping your life.
            </Text>
            <Text style={styles.contentText}>
              In our astrology section, you'll soon find personalized insights — from your birth chart to daily cosmic updates — helping you align your thoughts and actions with the rhythms of the universe.
            </Text>
            <Text style={styles.contentText}>
              Whether you seek clarity on your career, relationships, or simply wish to explore the mysteries of your zodiac sign, this space will become your trusted spiritual companion.
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
  filterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 0,
    alignItems: 'center',
    marginBottom: 14,
  },
  rashifalButton: {
    width: '80%',
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
  rashifalButtonText: {
    color: '#FF6A00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rashifalHelpText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  rashifalHelpTextRegular: {
    fontSize: 14,
    color: '#333',
  },
  rashifalHelpTextLink: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  filterDropdownWrapper: {
    position: 'relative',
    marginTop: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
    elevation: 20,
    flex: 1,
    marginHorizontal: 8,
  },
  filterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownModalList: {
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 320,
    paddingVertical: 4,
    zIndex: 1000,
    elevation: 20,
  },
  filterDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterDropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  filterDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  filterDropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
}); 