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

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  console.log('🔍 [DEBUG] RootLayout: Starting...');
  
  const colorScheme = useColorScheme();
  console.log('🔍 [DEBUG] RootLayout: ColorScheme =', colorScheme);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Function to play welcome bell sound
  const playWelcomeBell = async () => {
    try {
      console.log('🔔 Playing welcome bell sound...');
      
      // Load and play the temple bell sound
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/TempleBell.mp3'),
        { shouldPlay: true, isLooping: false }
      );
      
      // Stop the sound after 2 seconds
      setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log('🔔 Error stopping bell sound:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.log('🔔 Error playing welcome bell sound:', error);
    }
  };
  
  // Check authentication status, award daily login mudras, and play welcome bell
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Play welcome bell sound
        await playWelcomeBell();
        
        const userData = await AsyncStorage.getItem('user');
        console.log('🔍 [DEBUG] RootLayout: Checking auth, user data:', userData ? 'exists' : 'none');
        setIsAuthenticated(!!userData);
        
        // Award daily login mudras if user is authenticated
        if (userData) {
          const hasEarnedToday = await hasEarnedDailyMudras('DAILY_LOGIN');
          if (!hasEarnedToday) {
            try {
              const mudraResult = await awardMudras('DAILY_LOGIN');
              if (mudraResult.success) {
                console.log('✅ Daily login mudras awarded:', mudraResult.mudrasEarned);
              } else {
                console.log('⚠️ Failed to award daily login mudras:', mudraResult.error);
              }
            } catch (mudraError) {
              console.log('⚠️ Error awarding daily login mudras:', mudraError);
            }
          } else {
            console.log('✅ Daily login mudras already earned today');
          }
        }
      } catch (error) {
        console.error('🔍 [DEBUG] RootLayout: Error during app initialization:', error);
        setIsAuthenticated(false);
      }
    };
    
    initializeApp();
  }, []);
  
  console.log('🔍 [DEBUG] RootLayout: Fonts loaded =', loaded);
  console.log('🔍 [DEBUG] RootLayout: Is authenticated =', isAuthenticated);

  if (!loaded) {
    console.log('🔍 [DEBUG] RootLayout: Fonts not loaded, returning null');
    // Async font loading only occurs in development.
    return null;
  }
  
  console.log('🔍 [DEBUG] RootLayout: Rendering main layout');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
