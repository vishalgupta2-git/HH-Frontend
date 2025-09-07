import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { awardMudras, hasEarnedDailyMudras, MUDRA_ACTIVITIES } from '@/utils/mudraUtils';
import { hasVisitedDailyPujaToday, getUserFirstName } from '@/utils/dailyPujaUtils';
import { getUpcomingSpecialPujas, UpcomingPuja } from '@/utils/specialDaysUtils';
import DailyPujaReminderModal from '@/components/Home/DailyPujaReminderModal';
import SpecialDaysModal from '@/components/Home/SpecialDaysModal';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MaterialIcons } from '@expo/vector-icons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';

// Global Bottom Navigation Component
function GlobalBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  // Hide bottom navigation on 3D Ganesha screen and Daily Puja Custom Temple screen
  if (pathname === '/screens/3d-ganesha' || pathname === '/screens/DailyPujaCustomTemple') {
    return null;
  }

  const isActive = (route: string) => {
    if (route === 'home') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    if (route === 'puja') {
      return pathname === '/screens/puja';
    }
    if (route === 'yatra') {
      return pathname === '/(tabs)/yatra';
    }
    if (route === 'audio-video') {
      return pathname === '/(tabs)/audio-video';
    }
    return false;
  };

  const navigateTo = (route: string) => {
    if (route === 'home') {
      router.push('/(tabs)');
    } else if (route === 'puja') {
      router.push('/screens/puja');
    } else if (route === 'yatra') {
      router.push('/(tabs)/yatra');
    } else if (route === 'audio-video') {
      router.push('/(tabs)/audio-video');
    }
  };

  return (
    <View style={[styles.bottomNav, Platform.select({
      ios: { position: 'absolute' },
      default: {},
    })]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, isActive('home') && styles.activeTab]} 
          onPress={() => navigateTo('home')}
        >
          <IconSymbol size={28} name="house.fill" color={isActive('home') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('home') && styles.activeTabText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('puja') && styles.activeTab]} 
          onPress={() => navigateTo('puja')}
        >
          <Image 
            source={require('@/assets/images/icons/home page icons/puja.png')} 
            style={[styles.tabIcon, isActive('puja') && styles.activeTabIcon]} 
            resizeMode="contain" 
          />
          <Text style={[styles.tabText, isActive('puja') && styles.activeTabText]}>Puja</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('yatra') && styles.activeTab]} 
          onPress={() => navigateTo('yatra')}
        >
          <MaterialIcons size={28} name="route" color={isActive('yatra') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('yatra') && styles.activeTabText]}>Yatra</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('audio-video') && styles.activeTab]} 
          onPress={() => navigateTo('audio-video')}
        >
          <MaterialIcons size={28} name="ondemand-video" color={isActive('audio-video') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('audio-video') && styles.activeTabText]}>Divine Music</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Bottom Navigation with Language Support
function BottomNavigationWithLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isHindi } = useLanguage();

  // Hide bottom navigation on 3D Ganesha screen and Daily Puja Custom Temple screen
  if (pathname === '/screens/3d-ganesha' || pathname === '/screens/DailyPujaCustomTemple') {
    return null;
  }

  const isActive = (route: string) => {
    if (route === 'home') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    if (route === 'puja') {
      return pathname === '/screens/puja';
    }
    if (route === 'yatra') {
      return pathname === '/(tabs)/yatra';
    }
    if (route === 'audio-video') {
      return pathname === '/(tabs)/audio-video';
    }
    return false;
  };

  const navigateTo = (route: string) => {
    if (route === 'home') {
      router.push('/(tabs)');
    } else if (route === 'puja') {
      router.push('/screens/puja');
    } else if (route === 'yatra') {
      router.push('/(tabs)/yatra');
    } else if (route === 'audio-video') {
      router.push('/(tabs)/audio-video');
    }
  };

  return (
    <View style={[styles.bottomNav, Platform.select({
      ios: { position: 'absolute' },
      default: {},
    })]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, isActive('home') && styles.activeTab]} 
          onPress={() => navigateTo('home')}
        >
          <IconSymbol size={28} name="house.fill" color={isActive('home') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('home') && styles.activeTabText]}>
            {isHindi ? 'होम' : 'Home'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('puja') && styles.activeTab]} 
          onPress={() => navigateTo('puja')}
        >
          <Image 
            source={require('@/assets/images/icons/home page icons/puja.png')} 
            style={[styles.tabIcon, isActive('puja') && styles.activeTabIcon]} 
            resizeMode="contain" 
          />
          <Text style={[styles.tabText, isActive('puja') && styles.activeTabText]}>
            {isHindi ? 'पूजा' : 'Puja'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('yatra') && styles.activeTab]} 
          onPress={() => navigateTo('yatra')}
        >
          <MaterialIcons size={28} name="route" color={isActive('yatra') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('yatra') && styles.activeTabText]}>
            {isHindi ? 'यात्रा' : 'Yatra'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, isActive('audio-video') && styles.activeTab]} 
          onPress={() => navigateTo('audio-video')}
        >
          <MaterialIcons size={28} name="ondemand-video" color={isActive('audio-video') ? '#FF6A00' : '#666'} />
          <Text style={[styles.tabText, isActive('audio-video') && styles.activeTabText]}>
            {isHindi ? 'भक्ति संगीत' : 'Divine Music'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showDailyPujaModal, setShowDailyPujaModal] = useState(false);
  const [showSpecialPujaModal, setShowSpecialPujaModal] = useState(false);
  const [upcomingPujas, setUpcomingPujas] = useState<UpcomingPuja[]>([]);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const [dailyPujaShown, setDailyPujaShown] = useState(false);
  
  // Function to handle daily puja modal close
  const handleDailyPujaModalClose = () => {
    setShowDailyPujaModal(false);
          // Show special puja modal after daily puja modal closes (if there are upcoming pujas)
      if (upcomingPujas.length > 0) {
        setTimeout(() => {
          setShowSpecialPujaModal(true);
        }, 1000); // 1 second delay after daily puja modal closes
      }
  };

  // Function to check and show modals
  const checkAndShowModals = async () => {
    try {
      // Get user first name
      const firstName = await getUserFirstName();
      setUserFirstName(firstName);
      
      // Check if user has visited daily puja today
      const hasVisitedToday = await hasVisitedDailyPujaToday();
      
      // Check for upcoming special pujas
      const specialPujas = await getUpcomingSpecialPujas();
      setUpcomingPujas(specialPujas);
      
              // Show modals with delay to ensure app is fully loaded
        setTimeout(() => {
          // Show daily puja modal first if user hasn't visited today
          if (!hasVisitedToday) {
            setShowDailyPujaModal(true);
            setDailyPujaShown(true);
          } else {
            // If daily puja already done, show special puja modal immediately
            if (specialPujas.length > 0) {
              setShowSpecialPujaModal(true);
            }
          }
        }, 2000); // 2 second delay after app initialization
      
    } catch (error) {
      console.error('🔍 [DEBUG] Error checking modals:', error);
    }
  };
  
  // Check authentication status, award daily login mudras, and play welcome bell
  useEffect(() => {
    let sound: any = null;
    
    const initializeApp = async () => {
      try {
        // Play welcome bell sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/TempleBell.mp3'),
          { shouldPlay: true, isLooping: false }
        );
        
        sound = newSound;
        
        // Stop the sound after 2 seconds
        setTimeout(async () => {
          try {
            if (sound) {
              await sound.stopAsync();
              await sound.unloadAsync();
            }
          } catch (error) {
            // Error stopping sound - ignore as sound might have already finished
          }
        }, 2000);
        
        const userData = await AsyncStorage.getItem('user');
        setIsAuthenticated(!!userData);
        
        // Award daily login mudras
        try {
          const mudraResult = await awardMudras('DAILY_LOGIN');
          if (mudraResult.success) {
            // Daily login mudras awarded successfully
          } else {
            // Failed to award mudras
          }
        } catch (mudraError) {
          // Error awarding mudras
        }
        
        // Mark app as initialized
        setAppInitialized(true);
        
      } catch (error) {
        console.error('🔍 [DEBUG] RootLayout: Error during app initialization:', error);
        setIsAuthenticated(false);
        setAppInitialized(true);
      }
    };
    
    initializeApp();
    
    // Cleanup function to unload sound if component unmounts
    return () => {
      if (sound) {
        try {
          sound.unloadAsync();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Check and show modals after app is initialized
  useEffect(() => {
    if (appInitialized) {
      checkAndShowModals();
    }
  }, [appInitialized]);
  
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          
          {/* Global Bottom Navigation */}
          <BottomNavigationWithLanguage />
          
          {/* Daily Puja Reminder Modal */}
          <DailyPujaReminderModal
            visible={showDailyPujaModal}
            onClose={handleDailyPujaModalClose}
            firstName={userFirstName || undefined}
          />
          
          {/* Special Days Modal */}
          <SpecialDaysModal
            visible={showSpecialPujaModal}
            onClose={() => setShowSpecialPujaModal(false)}
            upcomingPujas={upcomingPujas}
          />
        </ThemeProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling - can add background or other visual indicators if needed
  },
  tabIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  activeTabIcon: {
    // Active icon styling - can add transform or other effects if needed
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6A00',
    fontWeight: '700',
    fontSize: 13,
  },
});
