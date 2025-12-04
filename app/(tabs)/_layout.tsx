import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getColors } from '@/constants/colors';

export default function TabLayout() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        tabBarInactiveTintColor: Colors[theme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 70 + Math.max(insets.bottom - 8, 0),
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tourism"
        options={{
          title: 'Tourism',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'leaf' : 'leaf-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="culinary"
        options={{
          title: 'Culinary',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'restaurant' : 'restaurant-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: 'Hotels',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'bed' : 'bed-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'construct' : 'construct-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
