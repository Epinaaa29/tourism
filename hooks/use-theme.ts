/**
 * Custom theme hook that uses store preference with system fallback
 * This allows users to manually override the system theme
 */

import { useColorScheme } from 'react-native';
import { useAppStore } from '@/lib/store';

export type ThemeMode = 'light' | 'dark';

/**
 * Returns the current theme mode
 * Uses store preference if user has set one, otherwise falls back to system theme
 */
export function useTheme(): ThemeMode {
  const systemColorScheme = useColorScheme();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const hasUserPreference = useAppStore((state) => state.hasDarkModePreference);
  
  // If user has explicitly set a preference, use it
  // Otherwise, use system theme
  if (hasUserPreference) {
    return isDarkMode ? 'dark' : 'light';
  }
  
  // Fall back to system theme if no preference is stored
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Returns whether dark mode is currently active
 */
export function useIsDarkMode(): boolean {
  return useTheme() === 'dark';
}

