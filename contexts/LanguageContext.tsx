import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  isHindi: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language_preference';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isHindi, setIsHindi] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load language preference from AsyncStorage on app start
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage !== null) {
          setIsHindi(savedLanguage === 'hindi');
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadLanguagePreference();
  }, []);
  
  const toggleLanguage = async () => {
    const newLanguage = !isHindi;
    setIsHindi(newLanguage);
    
    // Save language preference to AsyncStorage
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage ? 'hindi' : 'english');
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Don't render children until language preference is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ isHindi, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
