import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  console.log('🔍 [DEBUG] RootLayout: Starting...');
  
  const colorScheme = useColorScheme();
  console.log('🔍 [DEBUG] RootLayout: ColorScheme =', colorScheme);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('🔍 [DEBUG] RootLayout: Checking auth, user data:', userData ? 'exists' : 'none');
        setIsAuthenticated(!!userData);
      } catch (error) {
        console.error('🔍 [DEBUG] RootLayout: Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
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
