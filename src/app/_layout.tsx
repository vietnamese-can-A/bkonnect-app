import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStateProvider, useAppState } from '@/features/app-state/app-state-context';



function RootNavigator() {
  const { isAuthenticated } = useAppState();
  const router = useRouter();
  useEffect(() => {
      async function checkAutoLogin() {
        // Đọc refresh token từ bộ nhớ an toàn
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (refreshToken) {
          // Đã ghi nhớ -> Vào thẳng Trang chủ
          router.replace('/(tabs)');
        } else {
          // Không ghi nhớ -> Ở lại trang Đăng nhập
          router.replace('/login');
        }
      }

      checkAutoLogin();
    }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="found/[id]" />
        <Stack.Screen name="matches/index" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar barStyle="light-content" backgroundColor="#030391" />
      <RootNavigator />
    </AppStateProvider>
  );
}
