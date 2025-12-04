import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { TourProgress, TourRoute } from '../types';
import { getTourRoutes as getTourRoutesFirestore } from './firestore-service';

// Import JSON data as fallback
import tourRoutesData from '../assets/data/tour-routes.json';

interface TourStore {
  // State
  routes: TourRoute[];
  activeTour: TourProgress | null;
  tourHistory: TourProgress[];
  isLoading: boolean;
  
  // Actions
  loadTourRoutes: (forceRefresh?: boolean) => Promise<void>;
  startTour: (tourId: string) => Promise<void>;
  completeCheckpoint: (checkpointId: string) => Promise<void>;
  pauseTour: () => Promise<void>;
  resumeTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  cancelTour: () => Promise<void>;
  getTourByDestinationId: (destinationId: string) => TourRoute | undefined;
  getTourHistory: () => Promise<void>;
  clearTourHistory: () => Promise<void>;
  deleteTourFromHistory: (tourId: string) => Promise<void>;
}

const STORAGE_KEYS = {
  TOUR_ROUTES: 'tour_routes',
  ACTIVE_TOUR: 'active_tour',
  TOUR_HISTORY: 'tour_history',
};

export const useTourStore = create<TourStore>((set, get) => ({
  // Initial state
  routes: [],
  activeTour: null,
  tourHistory: [],
  isLoading: false,

  // Load tour routes from Firestore (with fallback to JSON)
  loadTourRoutes: async (forceRefresh: boolean = false) => {
    set({ isLoading: true });
    try {
      // If force refresh, skip cache
      if (!forceRefresh) {
        // Try to load from AsyncStorage first (cached)
        const storedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_ROUTES);
        
        if (storedRoutes) {
          const routes = JSON.parse(storedRoutes);
          console.log('📦 Loaded tour routes from cache:', routes.length);
          set({ routes, isLoading: false });
          
          // Also try to refresh from Firestore in background
          try {
            const firestoreRoutes = await getTourRoutesFirestore();
            if (firestoreRoutes.length > 0) {
              console.log('📦 Refreshed tour routes from Firestore:', firestoreRoutes.length);
              await AsyncStorage.setItem(STORAGE_KEYS.TOUR_ROUTES, JSON.stringify(firestoreRoutes));
              set({ routes: firestoreRoutes });
            }
          } catch (firestoreError) {
            console.log('⚠️ Could not refresh from Firestore, using cached routes');
          }
          return;
        }
      } else {
        // Clear cache if forcing refresh
        await AsyncStorage.removeItem(STORAGE_KEYS.TOUR_ROUTES);
        console.log('🔄 Cleared tour routes cache, loading fresh from Firestore');
      }

      // Try to load from Firestore
      try {
        const firestoreRoutes = await getTourRoutesFirestore();
        if (firestoreRoutes.length > 0) {
          console.log('📦 Loaded tour routes from Firestore:', firestoreRoutes.length);
          console.log('📦 Destination IDs:', firestoreRoutes.map(r => r.destinationId));
          
          // Cache in AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.TOUR_ROUTES, JSON.stringify(firestoreRoutes));
          set({ routes: firestoreRoutes, isLoading: false });
          return;
        }
      } catch (firestoreError) {
        console.log('⚠️ Firestore not available, falling back to JSON');
      }

      // Fallback to JSON file
      const routes = tourRoutesData as TourRoute[];
      console.log('📦 Loaded tour routes from JSON (fallback):', routes.length);
      console.log('📦 Destination IDs:', routes.map(r => r.destinationId));
      
      // Store in AsyncStorage for future use
      await AsyncStorage.setItem(STORAGE_KEYS.TOUR_ROUTES, JSON.stringify(routes));
      set({ routes, isLoading: false });
    } catch (error) {
      console.error('Error loading tour routes:', error);
      set({ isLoading: false });
    }
  },

  // Start a new tour
  startTour: async (tourId: string) => {
    try {
      const { routes } = get();
      const tour = routes.find(r => r.id === tourId);
      
      if (!tour) {
        throw new Error('Tour not found');
      }

      const newTour: TourProgress = {
        tourId,
        startTime: new Date(),
        currentCheckpointIndex: 0,
        completedCheckpoints: [],
        status: 'active',
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOUR, JSON.stringify(newTour));
      set({ activeTour: newTour });
    } catch (error) {
      console.error('Error starting tour:', error);
      throw error;
    }
  },

  // Complete a checkpoint
  completeCheckpoint: async (checkpointId: string) => {
    try {
      const { activeTour } = get();
      if (!activeTour) return;

      const updatedTour: TourProgress = {
        ...activeTour,
        completedCheckpoints: [...activeTour.completedCheckpoints, checkpointId],
        currentCheckpointIndex: activeTour.currentCheckpointIndex + 1,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOUR, JSON.stringify(updatedTour));
      set({ activeTour: updatedTour });
    } catch (error) {
      console.error('Error completing checkpoint:', error);
    }
  },

  // Pause current tour
  pauseTour: async () => {
    try {
      const { activeTour } = get();
      if (!activeTour) return;

      const updatedTour: TourProgress = {
        ...activeTour,
        status: 'paused',
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOUR, JSON.stringify(updatedTour));
      set({ activeTour: updatedTour });
    } catch (error) {
      console.error('Error pausing tour:', error);
    }
  },

  // Resume paused tour
  resumeTour: async () => {
    try {
      const { activeTour } = get();
      if (!activeTour) return;

      const updatedTour: TourProgress = {
        ...activeTour,
        status: 'active',
      };

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOUR, JSON.stringify(updatedTour));
      set({ activeTour: updatedTour });
    } catch (error) {
      console.error('Error resuming tour:', error);
    }
  },

  // Complete the current tour
  completeTour: async () => {
    try {
      const { activeTour, tourHistory } = get();
      if (!activeTour) return;

      const completedTour: TourProgress = {
        ...activeTour,
        status: 'completed',
        endTime: new Date(),
      };

      // Add to history
      const updatedHistory = [...tourHistory, completedTour];
      await AsyncStorage.setItem(STORAGE_KEYS.TOUR_HISTORY, JSON.stringify(updatedHistory));

      // Clear active tour
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TOUR);
      
      set({ 
        activeTour: null, 
        tourHistory: updatedHistory 
      });
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  },

  // Cancel the current tour
  cancelTour: async () => {
    try {
      const { activeTour } = get();
      if (!activeTour) return;

      // Clear active tour without adding to history
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TOUR);
      
      set({ activeTour: null });
    } catch (error) {
      console.error('Error canceling tour:', error);
      throw error;
    }
  },

  // Get tour route by destination ID or name (with fallback matching)
  getTourByDestinationId: (destinationId: string, itemName?: string) => {
    const { routes } = get();
    
    // First try exact match by destinationId
    let tourRoute = routes.find(route => route.destinationId === destinationId);
    
    // If no match and itemName provided, try name matching
    if (!tourRoute && itemName) {
      const itemNameLower = itemName.toLowerCase();
      tourRoute = routes.find(route => {
        const routeNameLower = route.destinationName.toLowerCase();
        // Check if item name contains route name or vice versa
        return routeNameLower.includes(itemNameLower) || 
               itemNameLower.includes(routeNameLower) ||
               // Also check for common variations
               itemNameLower.replace(/\s+/g, '') === routeNameLower.replace(/\s+/g, '');
      });
    }
    
    return tourRoute;
  },

  // Load tour history
  getTourHistory: async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_HISTORY);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        // Convert date strings back to Date objects
        const parsedHistory = history.map((tour: any) => ({
          ...tour,
          startTime: new Date(tour.startTime),
          endTime: tour.endTime ? new Date(tour.endTime) : undefined,
        }));
        set({ tourHistory: parsedHistory });
      }
    } catch (error) {
      console.error('Error loading tour history:', error);
    }
  },

  // Clear tour history
  clearTourHistory: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOUR_HISTORY);
      set({ tourHistory: [] });
    } catch (error) {
      console.error('Error clearing tour history:', error);
    }
  },

  // Delete a single tour from history
  deleteTourFromHistory: async (tourId: string) => {
    try {
      const { tourHistory } = get();
      const updatedHistory = tourHistory.filter(tour => tour.tourId !== tourId);
      await AsyncStorage.setItem(STORAGE_KEYS.TOUR_HISTORY, JSON.stringify(updatedHistory));
      set({ tourHistory: updatedHistory });
    } catch (error) {
      console.error('Error deleting tour from history:', error);
      throw error;
    }
  },
}));
