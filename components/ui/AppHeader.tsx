import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { useAuthStore } from '@/lib/auth-store';
import { useLocationStore } from '@/lib/location-store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  showLocation?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ showLocation = true }) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { user } = useAuthStore();
  const { locationName, getCurrentLocation, requestLocationPermission, permissionAsked } = useLocationStore();
  const [greeting, setGreeting] = useState('');

  // Update greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Selamat pagi');
      } else if (hour < 15) {
        setGreeting('Selamat siang');
      } else if (hour < 19) {
        setGreeting('Selamat sore');
      } else {
        setGreeting('Selamat malam');
      }
    };
    
    updateGreeting();
    // Update greeting every hour
    const interval = setInterval(updateGreeting, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Request location permission on first render if not asked
  useEffect(() => {
    if (showLocation && !permissionAsked) {
      requestLocationPermission().then((granted) => {
        if (granted) {
          getCurrentLocation();
        }
      });
    } else if (showLocation && permissionAsked && !locationName) {
      getCurrentLocation();
    }
  }, [showLocation, permissionAsked]);

  // Get user display name
  const getUserName = (): string => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Guest';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentRow}>
        <View style={styles.leftSection}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {greeting} {getUserName()}
          </Text>
          {showLocation && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.location, { color: colors.textMuted }]} numberOfLines={1}>
                {locationName || 'Loading location...'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});


