import { create } from 'zustand';
import { Category, FilterOptions, Item } from '../types';
import { addFavorite, addRecent, getFavorites, getRecent, loadData, removeFavorite } from './data';

interface AppState {
  // Data
  data: Record<Category, Item[]>;
  favorites: string[];
  recent: string[];
  
  // UI State
  isLoading: boolean;
  isDarkMode: boolean;
  
  // Filter State
  searchQuery: string;
  filters: FilterOptions;
  
  // Actions
  loadAppData: () => Promise<void>;
  setDarkMode: (isDark: boolean) => void;
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
  searchQuery: '',
  filters: {},
  
  // Load all app data
  loadAppData: async () => {
    set({ isLoading: true });
    try {
      const [data, favorites, recent] = await Promise.all([
        loadData(),
        getFavorites(),
        getRecent(),
      ]);
      
      set({
        data,
        favorites,
        recent,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading app data:', error);
      set({ isLoading: false });
    }
  },
  
  // Theme
  setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
  
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
    const isCurrentlyFavorite = favorites.includes(itemId);
    
    if (isCurrentlyFavorite) {
      await removeFavorite(itemId);
      set({ favorites: favorites.filter(id => id !== itemId) });
    } else {
      await addFavorite(itemId);
      set({ favorites: [...favorites, itemId] });
    }
  },
  
  isFavorite: (itemId: string) => {
    const { favorites } = get();
    return favorites.includes(itemId);
  },
  
  // Recent
  addToRecent: async (itemId: string) => {
    await addRecent(itemId);
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

