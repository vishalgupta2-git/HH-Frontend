import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  console.log('🔍 [DEBUG] RootLayout: Starting...');
  
  const colorScheme = useColorScheme();
  console.log('🔍 [DEBUG] RootLayout: ColorScheme =', colorScheme);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  console.log('🔍 [DEBUG] RootLayout: Fonts loaded =', loaded);

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
