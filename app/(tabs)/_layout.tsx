import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  console.log('🔍 [DEBUG] TabLayout: Starting...');
  const colorScheme = useColorScheme();
  console.log('🔍 [DEBUG] TabLayout: ColorScheme =', colorScheme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />, // Home
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Darshan',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="temple-hindu" color={color} />, // Darshan
        }}
      />
      <Tabs.Screen
        name="special-puja"
        options={{
          title: 'Puja',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="puja" color={color} />, // Puja
        }}
      />
      <Tabs.Screen
        name="yatra"
        options={{
          title: 'Yatra',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="yatra" color={color} />, // Yatra
        }}
      />
      <Tabs.Screen
        name="audio-video"
        options={{
          title: 'Audio Video',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="video" color={color} />, // Audio Video
        }}
      />
    </Tabs>
  );
}
