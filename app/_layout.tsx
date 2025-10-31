import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '../lib/store';
import { useTourStore } from '../lib/tour-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loadAppData = useAppStore((state) => state.loadAppData);
  const loadTourRoutes = useTourStore((state) => state.loadTourRoutes);

  useEffect(() => {
    loadAppData();
    loadTourRoutes();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
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
