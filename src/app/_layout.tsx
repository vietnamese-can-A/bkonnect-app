import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import { AppStateProvider } from '@/features/app-state/app-state-context';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar barStyle="light-content" backgroundColor="#030391" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="found/[id]" />
        <Stack.Screen name="matches/index" />
      </Stack>
    </AppStateProvider>
  );
}
