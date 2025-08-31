import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTransparent: true,
        headerBackVisible: false,
        headerTitle: '',
      }}
    />
  );
}

