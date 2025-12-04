import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Item, LocalEdit } from '../types';
import { 
  getAllItems, 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem,
  getFavorites as getFavoritesFirestore, 
  addFavorite as addFavoriteFirestore, 
  removeFavorite as removeFavoriteFirestore,
  getRecent as getRecentFirestore, 
  addRecent as addRecentFirestore,
  getAdminCredentials, 
  verifyAdminCredentials, 
  updateAdminCredentials as updateAdminCredentialsFirestore 
} from './firestore-service';

const DATA_KEYS = {
  FAVORITES: 'city_explorer_favorites',
  RECENT: 'city_explorer_recent',
  ADMIN_AUTH: 'city_explorer_admin_auth',
} as const;

/**
 * Load all data from Firestore (user-specific)
 * Merges global/default data with user-specific data to ensure default content is always visible
 */
export const loadData = async (userId?: string): Promise<Record<Category, Item[]>> => {
  try {
    // Always load global data first (default content)
    const globalData = await getAllItems(undefined);
    
    // If user is logged in, also load their user-specific data and merge it
    if (userId) {
      try {
        const userData = await getAllItems(userId);
        
        // Merge user data with global data for each category
        // User-specific items are added to the global items
        const mergedData: Record<Category, Item[]> = {
          tourism: [...globalData.tourism, ...userData.tourism],
          culinary: [...globalData.culinary, ...userData.culinary],
          hotel: [...globalData.hotel, ...userData.hotel],
          event: [...globalData.event, ...userData.event],
        };
        
        console.log('Merged data:', {
          global: {
            tourism: globalData.tourism.length,
            culinary: globalData.culinary.length,
            hotel: globalData.hotel.length,
            event: globalData.event.length,
          },
          user: {
            tourism: userData.tourism.length,
            culinary: userData.culinary.length,
            hotel: userData.hotel.length,
            event: userData.event.length,
          },
          merged: {
            tourism: mergedData.tourism.length,
            culinary: mergedData.culinary.length,
            hotel: mergedData.hotel.length,
            event: mergedData.event.length,
          },
        });
        
        return mergedData;
      } catch (userDataError) {
        console.error('Error loading user-specific data:', userDataError);
        // If user data fails, still return global data
        return globalData;
      }
    }
    
    // If no userId, return global data only
    return globalData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

/**
 * Save an item (create or update) to Firestore (user-specific)
 * This replaces the old saveLocalEdit function
 */
export const saveLocalEdit = async (edit: LocalEdit, userId?: string): Promise<void> => {
  try {
    switch (edit.action) {
      case 'create':
      case 'update':
        if (!edit.data) {
          throw new Error('Item data is required');
        }
        const category = edit.data.category;
        if (!category) {
          throw new Error('Category is required');
        }
        if (edit.action === 'create') {
          await createItem(category, edit.data, userId);
        } else {
          await updateItem(category, edit.data, userId);
        }
        break;
      case 'delete':
        if (!edit.id) {
          throw new Error('Item ID is required for delete');
        }
        if (!edit.category) {
          throw new Error('Category is required for delete');
        }
        await deleteItem(edit.category, edit.id, userId);
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
// Use Firestore when userId is provided, AsyncStorage otherwise
export const getFavorites = async (userId?: string): Promise<string[]> => {
  try {
    if (userId) {
      // Use Firestore for logged-in users
      return await getFavoritesFirestore(userId);
    } else {
      // Use AsyncStorage for non-logged-in users
      const favoritesJson = await AsyncStorage.getItem(DATA_KEYS.FAVORITES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    }
  } catch (error) {
    console.error('Error getting favorites:', error);
    // Fallback to AsyncStorage if Firestore fails
    try {
      const favoritesJson = await AsyncStorage.getItem(DATA_KEYS.FAVORITES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch {
      return [];
    }
  }
};

export const addFavorite = async (itemId: string, userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Use Firestore for logged-in users
      await addFavoriteFirestore(userId, itemId);
    } else {
      // Use AsyncStorage for non-logged-in users
      const favorites = await getFavorites();
      if (!favorites.includes(itemId)) {
        favorites.push(itemId);
        await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(favorites));
      }
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    // Fallback to AsyncStorage if Firestore fails
    if (userId) {
      try {
        const favoritesJson = await AsyncStorage.getItem(DATA_KEYS.FAVORITES);
        const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
        if (!favorites.includes(itemId)) {
          favorites.push(itemId);
          await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(favorites));
        }
      } catch {
        // Ignore fallback errors
      }
    }
  }
};

export const removeFavorite = async (itemId: string, userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Use Firestore for logged-in users
      await removeFavoriteFirestore(userId, itemId);
    } else {
      // Use AsyncStorage for non-logged-in users
      const favorites = await getFavorites();
      const updatedFavorites = favorites.filter(id => id !== itemId);
      await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
    // Fallback to AsyncStorage if Firestore fails
    if (userId) {
      try {
        const favoritesJson = await AsyncStorage.getItem(DATA_KEYS.FAVORITES);
        const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
        const updatedFavorites = favorites.filter(id => id !== itemId);
        await AsyncStorage.setItem(DATA_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      } catch {
        // Ignore fallback errors
      }
    }
  }
};

export const isFavorite = async (itemId: string, userId?: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites(userId);
    return favorites.includes(itemId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Recent items management
// Use Firestore when userId is provided, AsyncStorage otherwise
export const getRecent = async (userId?: string): Promise<string[]> => {
  try {
    if (userId) {
      // Use Firestore for logged-in users
      return await getRecentFirestore(userId);
    } else {
      // Use AsyncStorage for non-logged-in users
      const recentJson = await AsyncStorage.getItem(DATA_KEYS.RECENT);
      return recentJson ? JSON.parse(recentJson) : [];
    }
  } catch (error) {
    console.error('Error getting recent:', error);
    // Fallback to AsyncStorage if Firestore fails
    try {
      const recentJson = await AsyncStorage.getItem(DATA_KEYS.RECENT);
      return recentJson ? JSON.parse(recentJson) : [];
    } catch {
      return [];
    }
  }
};

export const addRecent = async (itemId: string, userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Use Firestore for logged-in users
      await addRecentFirestore(userId, itemId);
    } else {
      // Use AsyncStorage for non-logged-in users
      const recent = await getRecent();
      const updatedRecent = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
      await AsyncStorage.setItem(DATA_KEYS.RECENT, JSON.stringify(updatedRecent));
    }
  } catch (error) {
    console.error('Error adding recent:', error);
    // Fallback to AsyncStorage if Firestore fails
    if (userId) {
      try {
        const recentJson = await AsyncStorage.getItem(DATA_KEYS.RECENT);
        const recent = recentJson ? JSON.parse(recentJson) : [];
        const updatedRecent = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
        await AsyncStorage.setItem(DATA_KEYS.RECENT, JSON.stringify(updatedRecent));
      } catch {
        // Ignore fallback errors
      }
    }
  }
};

// Admin authentication
// Credentials are stored in Firestore, session state is stored locally
export const getAdminAuth = async (): Promise<{ isAuthenticated: boolean }> => {
  try {
    // Get session state from local storage
    const authJson = await AsyncStorage.getItem(DATA_KEYS.ADMIN_AUTH);
    let isAuthenticated = false;
    
    if (authJson) {
      const auth = JSON.parse(authJson);
      isAuthenticated = auth.isAuthenticated || false;
    }
    
    return { isAuthenticated };
  } catch (error) {
    console.error('Error getting admin auth:', error);
    // Fallback to default
    return { isAuthenticated: false };
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
 * Verify admin credentials against Firestore
 */
export const verifyAdminCredentialsLocal = async (username: string, password: string): Promise<boolean> => {
  try {
    return await verifyAdminCredentials(username, password);
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return false;
  }
};

/**
 * Update admin credentials in Firestore
 */
export const updateAdminCredentialsLocal = async (newUsername: string, newPassword: string): Promise<void> => {
  try {
    await updateAdminCredentialsFirestore(newUsername, newPassword);
  } catch (error) {
    console.error('Error updating admin credentials:', error);
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

