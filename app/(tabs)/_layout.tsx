import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the tab bar since we have global navigation
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="special-puja"
        options={{
          title: 'Puja',
        }}
      />
      <Tabs.Screen
        name="yatra"
        options={{
          title: 'Yatra',
        }}
      />
      <Tabs.Screen
        name="audio-video"
        options={{
          title: 'Audio Video',
        }}
      />
    </Tabs>
  );
}
