import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'hindi' | 'bangla' | 'kannada' | 'punjabi' | 'tamil' | 'telugu';

interface LanguageContextType {
  currentLanguage: Language;
  isHindi: boolean;
  isBangla: boolean;
  isKannada: boolean;
  isPunjabi: boolean;
  isTamil: boolean;
  isTelugu: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void; // Keep for backward compatibility
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language_preference';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Computed properties for backward compatibility
  const isHindi = currentLanguage === 'hindi';
  const isBangla = currentLanguage === 'bangla';
  const isKannada = currentLanguage === 'kannada';
  const isPunjabi = currentLanguage === 'punjabi';
  const isTamil = currentLanguage === 'tamil';
  const isTelugu = currentLanguage === 'telugu';
  
  // Load language preference from AsyncStorage on app start
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage !== null && ['english', 'hindi', 'bangla', 'kannada', 'punjabi', 'tamil', 'telugu'].includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadLanguagePreference();
  }, []);
  
  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    
    // Save language preference to AsyncStorage
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };
  
  // Keep toggleLanguage for backward compatibility (cycles through languages)
  const toggleLanguage = async () => {
    const nextLanguage: Language = 
      currentLanguage === 'english' ? 'hindi' : 
      currentLanguage === 'hindi' ? 'bangla' : 
      currentLanguage === 'bangla' ? 'kannada' :
      currentLanguage === 'kannada' ? 'punjabi' :
      currentLanguage === 'punjabi' ? 'tamil' :
      currentLanguage === 'tamil' ? 'telugu' : 'english';
    setLanguage(nextLanguage);
  };

  // Don't render children until language preference is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      isHindi, 
      isBangla, 
      isKannada, 
      isPunjabi,
      isTamil,
      isTelugu,
      setLanguage, 
      toggleLanguage 
    }}>
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
