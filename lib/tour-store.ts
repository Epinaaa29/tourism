import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { TourProgress, TourRoute } from '../types';

// Import JSON data
import tourRoutesData from '../assets/data/tour-routes.json';

interface TourStore {
  // State
  routes: TourRoute[];
  activeTour: TourProgress | null;
  tourHistory: TourProgress[];
  isLoading: boolean;
  
  // Actions
  loadTourRoutes: () => Promise<void>;
  startTour: (tourId: string) => Promise<void>;
  completeCheckpoint: (checkpointId: string) => Promise<void>;
  pauseTour: () => Promise<void>;
  resumeTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  getTourByDestinationId: (destinationId: string) => TourRoute | undefined;
  getTourHistory: () => Promise<void>;
  clearTourHistory: () => Promise<void>;
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

  // Load tour routes from JSON
  loadTourRoutes: async () => {
    set({ isLoading: true });
    try {
      // Try to load from AsyncStorage first
      const storedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_ROUTES);
      
      if (storedRoutes) {
        const routes = JSON.parse(storedRoutes);
        set({ routes });
      } else {
        // Load from JSON file
        const routes = tourRoutesData as TourRoute[];
        
        // Store in AsyncStorage for future use
        await AsyncStorage.setItem(STORAGE_KEYS.TOUR_ROUTES, JSON.stringify(routes));
        set({ routes });
      }
    } catch (error) {
      console.error('Error loading tour routes:', error);
    } finally {
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

  // Get tour route by destination ID
  getTourByDestinationId: (destinationId: string) => {
    const { routes } = get();
    return routes.find(route => route.destinationId === destinationId);
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
}));
