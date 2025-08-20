import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import '../global.css';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, getProfile } = useAuthStore();

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        // Initialize auth state
        if (isAuthenticated) {
          await getProfile();
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [isAuthenticated, getProfile]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order-detail" options={{ headerShown: false }} />
        <Stack.Screen name="menu-detail" options={{ headerShown: false }} />
        <Stack.Screen name="create-order" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}