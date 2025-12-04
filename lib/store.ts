import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Category, FilterOptions, Item } from '../types';
import { addFavorite, addRecent, getFavorites, getRecent, loadData, removeFavorite } from './data';
import { useAuthStore } from './auth-store';

const STORAGE_KEYS = {
  DARK_MODE: 'city_explorer_dark_mode',
} as const;

interface AppState {
  // Data
  data: Record<Category, Item[]>;
  favorites: string[];
  recent: string[];
  
  // UI State
  isLoading: boolean;
  isDarkMode: boolean;
  hasDarkModePreference: boolean; // Whether user has explicitly set a preference
  
  // Filter State
  searchQuery: string;
  filters: FilterOptions;
  
  // Actions
  loadAppData: (userId?: string) => Promise<void>;
  loadDarkModePreference: () => Promise<void>;
  setDarkMode: (isDark: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  
  // Favorites
  toggleFavorite: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  
  // Recent
  addToRecent: (itemId: string) => Promise<void>;
  
  // Filtered Data
  getFilteredData: (category: Category) => Item[];
  getTrendingItems: () => Item[];
  getNearbyItems: (item: Item, category: Category) => Item[];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  data: {
    tourism: [],
    culinary: [],
    hotel: [],
    event: [],
  },
  favorites: [],
  recent: [],
  isLoading: false,
  isDarkMode: false,
  hasDarkModePreference: false,
  searchQuery: '',
  filters: {},
  
  // Load all app data (user-specific)
  loadAppData: async (userId?: string) => {
    const currentState = get();
    set({ isLoading: true });
    try {
      const [data, favorites, recent] = await Promise.all([
        loadData(userId),
        getFavorites(userId),
        getRecent(userId),
      ]);
      
      console.log('Loaded data:', {
        tourism: data.tourism?.length || 0,
        culinary: data.culinary?.length || 0,
        hotel: data.hotel?.length || 0,
        event: data.event?.length || 0,
        favorites: favorites.length,
        recent: recent.length,
        userId: userId || 'none (global)',
      });
      
      // Only update if we got data, otherwise keep existing data
      const hasData = Object.values(data).some(items => items.length > 0);
      if (hasData || !currentState.data || Object.values(currentState.data).every(items => items.length === 0)) {
        set({
          data,
          favorites,
          recent,
          isLoading: false,
        });
      } else {
        // Keep existing data but update favorites and recent
        set({
          favorites,
          recent,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading app data:', error);
      // Don't reset data on error - keep existing data if any
      // But still set loading to false
      set({ isLoading: false });
      // Re-throw error so callers can handle it
      throw error;
    }
  },
  
  // Load dark mode preference from storage
  loadDarkModePreference: async () => {
    try {
      const storedPreference = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (storedPreference !== null) {
        const isDark = JSON.parse(storedPreference);
        set({ 
          isDarkMode: isDark,
          hasDarkModePreference: true,
        });
      } else {
        // No stored preference - user hasn't set one yet
        set({ hasDarkModePreference: false });
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
      set({ hasDarkModePreference: false });
    }
  },
  
  // Theme - persist to storage
  setDarkMode: async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
      set({ 
        isDarkMode: isDark,
        hasDarkModePreference: true, // User has now set a preference
      });
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
      // Still update state even if storage fails
      set({ 
        isDarkMode: isDark,
        hasDarkModePreference: true,
      });
    }
  },
  
  // Search and filters
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setFilters: (filters: FilterOptions) => set({ filters }),
  
  clearFilters: () => set({ 
    searchQuery: '',
    filters: {},
  }),
  
  // Favorites
  toggleFavorite: async (itemId: string) => {
    const { favorites } = get();
    const { user } = useAuthStore.getState();
    const isCurrentlyFavorite = favorites.includes(itemId);
    
    if (isCurrentlyFavorite) {
      await removeFavorite(itemId, user?.uid);
      set({ favorites: favorites.filter(id => id !== itemId) });
    } else {
      await addFavorite(itemId, user?.uid);
      set({ favorites: [...favorites, itemId] });
    }
  },
  
  isFavorite: (itemId: string) => {
    const { favorites } = get();
    return favorites.includes(itemId);
  },
  
  // Recent
  addToRecent: async (itemId: string) => {
    const { user } = useAuthStore.getState();
    await addRecent(itemId, user?.uid);
    const { recent } = get();
    const updatedRecent = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
    set({ recent: updatedRecent });
  },
  
  // Filtered data
  getFilteredData: (category: Category) => {
    const { data, searchQuery, filters } = get();
    let items = data[category] || [];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.district) {
      items = items.filter(item => item.district === filters.district);
    }
    
    if (filters.minRating !== undefined) {
      items = items.filter(item => item.rating >= filters.minRating!);
    }
    
    if (filters.priceRange) {
      items = items.filter(item => item.priceRange === filters.priceRange);
    }
    
    return items;
  },
  
  // Get trending items (highest rated)
  getTrendingItems: () => {
    const { data } = get();
    const allItems = [
      ...data.tourism,
      ...data.culinary,
      ...data.hotel,
      ...data.event,
    ];
    
    return allItems
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  },
  
  // Get nearby items (same district)
  getNearbyItems: (item: Item, category: Category) => {
    const { data } = get();
    const items = data[category] || [];
    
    return items
      .filter(i => i.id !== item.id && i.district === item.district)
      .slice(0, 3);
  },
}));

