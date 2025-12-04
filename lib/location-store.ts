import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { create } from 'zustand';

const STORAGE_KEYS = {
  LOCATION_PERMISSION_ASKED: 'location_permission_asked',
  LAST_LOCATION: 'last_location',
} as const;

interface LocationState {
  location: Location.LocationObject | null;
  locationName: string | null;
  isLoading: boolean;
  hasPermission: boolean;
  permissionAsked: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  getLocationName: (latitude: number, longitude: number) => Promise<string | null>;
  initializeLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  locationName: null,
  isLoading: false,
  hasPermission: false,
  permissionAsked: false,
  error: null,

  requestLocationPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      set({ 
        hasPermission, 
        permissionAsked: true,
        error: hasPermission ? null : 'Location permission denied',
      });
      
      // Save permission status
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED, 'true');
      
      return hasPermission;
    } catch (error: any) {
      console.error('Error requesting location permission:', error);
      set({ 
        hasPermission: false, 
        permissionAsked: true,
        error: error.message || 'Failed to request location permission',
      });
      return false;
    }
  },

  getCurrentLocation: async () => {
    const { hasPermission } = get();
    
    if (!hasPermission) {
      const permissionGranted = await get().requestLocationPermission();
      if (!permissionGranted) {
        return;
      }
    }

    // Check if location services are enabled
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        set({ 
          isLoading: false, 
          error: 'Location services are disabled. Please enable location services in your device settings.',
        });
        return;
      }
    } catch (error) {
      // If we can't check, continue anyway (might be a platform issue)
    }

    set({ isLoading: true, error: null });
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      set({ location, isLoading: false });
      
      // Get location name
      const locationName = await get().getLocationName(location.coords.latitude, location.coords.longitude);
      set({ locationName });
      
      // Save last location
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationName,
      }));
    } catch (error: any) {
      // Only log error if it's not a common "unavailable" error
      const errorMessage = error.message || 'Failed to get current location';
      if (!errorMessage.includes('unavailable') && !errorMessage.includes('disabled')) {
        console.error('Error getting current location:', error);
      }
      set({ 
        isLoading: false, 
        error: errorMessage,
      });
    }
  },

  getLocationName: async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (result) {
        // Format: City, Country or District, City, Country
        const parts = [];
        if (result.city) parts.push(result.city);
        if (result.region) parts.push(result.region);
        if (result.country) parts.push(result.country);
        
        return parts.length > 0 ? parts.join(', ') : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting location name:', error);
      return null;
    }
  },

  initializeLocation: async () => {
    try {
      // Check if permission was previously asked
      const permissionAskedStorage = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED);
      const wasPermissionAsked = !!permissionAskedStorage;
      
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      set({ 
        hasPermission, 
        permissionAsked: wasPermissionAsked,
      });
      
      // Load last known location
      const lastLocation = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      if (lastLocation) {
        try {
          const parsed = JSON.parse(lastLocation);
          if (parsed.locationName) {
            set({ locationName: parsed.locationName });
          }
        } catch (e) {
          console.error('Error parsing last location:', e);
        }
      }
      
      // If permission not asked yet (first app start), request it
      if (!wasPermissionAsked) {
        const permissionGranted = await get().requestLocationPermission();
        if (permissionGranted) {
          // Check if location services are enabled before trying to get location
          try {
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (isEnabled) {
              await get().getCurrentLocation();
            }
          } catch (error) {
            // If we can't check, try anyway
            await get().getCurrentLocation();
          }
        }
      } else if (hasPermission) {
        // Permission was already asked and granted, check if services are enabled
        try {
          const isEnabled = await Location.hasServicesEnabledAsync();
          if (isEnabled) {
            await get().getCurrentLocation();
          }
        } catch (error) {
          // If we can't check, try anyway
          await get().getCurrentLocation();
        }
      }
    } catch (error: any) {
      console.error('Error initializing location:', error);
      set({ error: error.message || 'Failed to initialize location' });
    }
  },
}));

