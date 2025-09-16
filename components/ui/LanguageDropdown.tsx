import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LanguageDropdownProps {
  style?: any;
  textStyle?: any;
  showIcon?: boolean;
}

const languageOptions = [
  { key: 'english' as Language, label: 'English' },
  { key: 'hindi' as Language, label: 'हिंदी' },
  { key: 'bangla' as Language, label: 'বাংলা' },
  // Temporarily hidden languages - functionality preserved
  // { key: 'kannada' as Language, label: 'ಕನ್ನಡ' },
  // { key: 'punjabi' as Language, label: 'ਪੰਜਾਬੀ' },
  // { key: 'tamil' as Language, label: 'தமிழ்' },
  // { key: 'telugu' as Language, label: 'తెలుగు' },
];

export default function LanguageDropdown({ 
  style, 
  textStyle, 
  showIcon = true 
}: LanguageDropdownProps) {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = languageOptions.find(option => option.key === currentLanguage);

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, style]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, textStyle]}>
          {currentOption?.label}
        </Text>
        {showIcon && (
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={textStyle?.color || '#fff'} 
            style={styles.dropdownIcon}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.dropdownOption,
                  currentLanguage === option.key && styles.selectedOption
                ]}
                onPress={() => handleLanguageSelect(option.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  currentLanguage === option.key && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {currentLanguage === option.key && (
                  <Ionicons name="checkmark" size={20} color="#FF6A00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 100,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#FFF6EE',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FF6A00',
    fontWeight: '600',
  },
});
