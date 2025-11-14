import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '../lib/auth-store';
import { useAppStore } from '../lib/store';
import { useTourStore } from '../lib/tour-store';
import { useLocationStore } from '../lib/location-store';
import { getColors } from '@/constants/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading: authLoading, initializeAuth } = useAuthStore();
  const loadAppData = useAppStore((state) => state.loadAppData);
  const loadTourRoutes = useTourStore((state) => state.loadTourRoutes);
  const loadDarkModePreference = useAppStore((state) => state.loadDarkModePreference);
  const initializeLocation = useLocationStore((state) => state.initializeLocation);

  // Initialize auth, dark mode preference, and location on mount
  useEffect(() => {
    initializeAuth();
    loadDarkModePreference();
    initializeLocation();
  }, []);

  // Load data when user changes or when auth is ready
  useEffect(() => {
    if (!authLoading) {
      // Load data - if user is logged in, use their ID, otherwise load global data
      loadAppData(user?.uid).catch((error) => {
        console.error('Failed to load app data:', error);
        // Error is logged but app continues - data will be empty if Firestore is unavailable
      });
      loadTourRoutes().catch((error) => {
        console.error('Failed to load tour routes:', error);
      });
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
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
    </ThemeProvider>
  );
}
