import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '../lib/auth-store';
import { useAppStore } from '../lib/store';
import { useTourStore } from '../lib/tour-store';
import { getColors } from '@/constants/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading: authLoading, initializeAuth } = useAuthStore();
  const loadAppData = useAppStore((state) => state.loadAppData);
  const loadTourRoutes = useTourStore((state) => state.loadTourRoutes);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadAppData(user.uid);
      }
      loadTourRoutes();
    }
  }, [user, authLoading]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    // Only redirect authenticated users away from auth screens
    // Allow unauthenticated users to access the app freely
    if (user && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [user, segments, authLoading]);

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="tour-tracking" options={{ headerShown: false }} />
          <Stack.Screen name="checkpoint-detail" options={{ headerShown: false }} />
          <Stack.Screen name="transport-detail" options={{ headerShown: false }} />
          <Stack.Screen name="tour-history" options={{ headerShown: false }} />
        </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
