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

import { useColorScheme } from '@/hooks/useColorScheme';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        
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
  );
}
