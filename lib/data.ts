import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Item, LocalEdit } from '../types';
import { 
  getAllItems, 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem 
} from './firestore-service';

// Import JSON data as fallback
import culinaryData from '../assets/data/culinary.json';
import eventData from '../assets/data/events.json';
import hotelData from '../assets/data/hotels.json';
import tourismData from '../assets/data/tourism.json';

const DATA_KEYS = {
  FAVORITES: 'city_explorer_favorites',
  RECENT: 'city_explorer_recent',
  ADMIN_AUTH: 'city_explorer_admin_auth',
} as const;

// Fallback data from JSON files (used if Firestore fails)
const fallbackData: Record<Category, Item[]> = {
  tourism: tourismData as Item[],
  culinary: culinaryData as Item[],
  hotel: hotelData as Item[],
  event: eventData as Item[],
};

/**
 * Load all data from Firestore
 * Falls back to JSON data if Firestore is not available
 */
export const loadData = async (): Promise<Record<Category, Item[]>> => {
  try {
    // Try to load from Firestore
    const data = await getAllItems();
    return data;
  } catch (error) {
    console.error('Error loading data from Firestore, using fallback:', error);
    // Return fallback data if Firestore fails
    return fallbackData;
  }
};

/**
 * Save an item (create or update) to Firestore
 * This replaces the old saveLocalEdit function
 */
export const saveLocalEdit = async (edit: LocalEdit): Promise<void> => {
  try {
    if (!edit.data) {
      throw new Error('Item data is required');
    }

    const category = edit.data.category;
    if (!category) {
      throw new Error('Category is required');
    }

    switch (edit.action) {
      case 'create':
        await createItem(category, edit.data);
        break;
      case 'update':
        await updateItem(category, edit.data);
        break;
      case 'delete':
        if (edit.id) {
          await deleteItem(category, edit.id);
        }
        break;
      default:
        throw new Error(`Unknown action: ${edit.action}`);
    }
  } catch (error) {
    console.error('Error saving item to Firestore:', error);
    throw error;
  }
};

/**
 * Clear all local edits (deprecated - items are now in Firestore)
 * This function is kept for backward compatibility
 */
export const clearLocalEdits = async (): Promise<void> => {
  console.warn('clearLocalEdits is deprecated. Items are now stored in Firestore.');
};

// Favorites management
// Using AsyncStorage for user-specific data (can work offline)
export const getFavorites = async (): Promise<string[]> => {
  try {
    const favoritesJson = await AsyncStorage.getItem(DATA_KEYS.FAVORITES);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (itemId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(itemId)) {
      favorites.push(itemId);
      await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

export const removeFavorite = async (itemId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(id => id !== itemId);
    await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

export const isFavorite = async (itemId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(itemId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Recent items management
// Using AsyncStorage for user-specific data (can work offline)
export const getRecent = async (): Promise<string[]> => {
  try {
    const recentJson = await AsyncStorage.getItem(DATA_KEYS.RECENT);
    return recentJson ? JSON.parse(recentJson) : [];
  } catch (error) {
    console.error('Error getting recent:', error);
    return [];
  }
};

export const addRecent = async (itemId: string): Promise<void> => {
  try {
    const recent = await getRecent();
    const updatedRecent = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
    await AsyncStorage.setItem(DATA_KEYS.RECENT, JSON.stringify(updatedRecent));
  } catch (error) {
    console.error('Error adding recent:', error);
  }
};

// Admin authentication
// PIN is stored in Firestore, session state is stored locally
import { getAdminPin, verifyAdminPin, updateAdminPin as updateAdminPinFirestore } from './firestore-service';

export const getAdminAuth = async (): Promise<{ isAuthenticated: boolean; pin: string }> => {
  try {
    // Get PIN from Firestore
    const pin = await getAdminPin();
    
    // Get session state from local storage
    const authJson = await AsyncStorage.getItem(DATA_KEYS.ADMIN_AUTH);
    let isAuthenticated = false;
    
    if (authJson) {
      const auth = JSON.parse(authJson);
      isAuthenticated = auth.isAuthenticated || false;
    }
    
    return { isAuthenticated, pin };
  } catch (error) {
    console.error('Error getting admin auth:', error);
    // Fallback to default
    return { isAuthenticated: false, pin: '1234' };
  }
};

export const setAdminAuth = async (isAuthenticated: boolean): Promise<void> => {
  try {
    // Only store session state locally (not the PIN)
    await AsyncStorage.setItem(DATA_KEYS.ADMIN_AUTH, JSON.stringify({ isAuthenticated }));
  } catch (error) {
    console.error('Error setting admin auth:', error);
  }
};

/**
 * Verify admin PIN against Firestore
 */
export const verifyAdminPinLocal = async (pin: string): Promise<boolean> => {
  try {
    return await verifyAdminPin(pin);
  } catch (error) {
    console.error('Error verifying admin PIN:', error);
    return false;
  }
};

/**
 * Update admin PIN in Firestore
 */
export const updateAdminPin = async (newPin: string): Promise<void> => {
  try {
    await updateAdminPinFirestore(newPin);
  } catch (error) {
    console.error('Error updating admin PIN:', error);
    throw error;
  }
};

// Clear all app data (local storage only - Firestore data is not cleared)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      DATA_KEYS.FAVORITES,
      DATA_KEYS.RECENT,
      DATA_KEYS.ADMIN_AUTH,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};

