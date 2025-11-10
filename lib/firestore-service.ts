import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Item } from '../types';
import { isBase64Image, base64ToImageUri } from './image-base64';

const COLLECTIONS = {
  TOURISM: 'tourism',
  CULINARY: 'culinary',
  HOTELS: 'hotels',
  EVENTS: 'events',
  FAVORITES: 'favorites',
  RECENT: 'recent',
  ADMIN_AUTH: 'admin_auth',
  USERS: 'users',
} as const;

/**
 * Get user-specific collection path
 * If userId is provided, returns user-specific path, otherwise returns global path
 */
function getUserCollectionPath(collectionName: string, userId?: string): string {
  if (userId) {
    return `users/${userId}/${collectionName}`;
  }
  return collectionName;
}

const ADMIN_AUTH_DOC_ID = 'default';

/**
 * Get collection name for a category
 */
function getCollectionName(category: Category): string {
  switch (category) {
    case 'tourism':
      return COLLECTIONS.TOURISM;
    case 'culinary':
      return COLLECTIONS.CULINARY;
    case 'hotel':
      return COLLECTIONS.HOTELS;
    case 'event':
      return COLLECTIONS.EVENTS;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

/**
 * Convert Firestore timestamp to JavaScript Date
 */
function convertTimestamp(timestamp: any): Date | string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
}

/**
 * Process item data after fetching from Firestore
 * Converts base64 images to usable format
 */
function processItemData(data: any): Item {
  const item = { ...data };
  
  // Convert image field if it's base64
  if (item.image && isBase64Image(item.image)) {
    // Keep as base64 string - components will handle conversion
    // Or convert here if preferred
  }
  
  // Convert images array if present
  if (item.images && Array.isArray(item.images)) {
    item.images = item.images.map((img: string) => {
      if (isBase64Image(img)) {
        return img; // Keep as base64
      }
      return img;
    });
  }
  
  // Convert timestamps
  if (item.createdAt) {
    item.createdAt = convertTimestamp(item.createdAt);
  }
  if (item.updatedAt) {
    item.updatedAt = convertTimestamp(item.updatedAt);
  }
  
  return item as Item;
}

/**
 * Process item data before saving to Firestore
 * Ensures images are in base64 format and removes undefined values
 * @param item - The item to prepare
 * @param isNew - Whether this is a new item (for setting createdAt)
 */
function prepareItemForSave(item: Item, isNew: boolean = false): any {
  const data: any = {
    ...item,
    updatedAt: Timestamp.now(),
  };
  
  // Ensure createdAt timestamp if new item
  if (isNew || !item.id || item.id === 'new') {
    data.createdAt = Timestamp.now();
  }
  
  // Remove undefined values (Firestore doesn't allow undefined)
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Remove id from data object (it's the document ID, not a field)
  // But keep it for now as it might be needed for reference
  // Actually, Firestore allows custom document IDs, so we can keep it if needed
  // But typically we don't store id as a field since it's the document ID
  
  // Images should already be base64 at this point (from image picker)
  // But we can verify and convert if needed
  
  return data;
}

// ========== CRUD Operations ==========

/**
 * Get all items for a category (user-specific)
 */
export async function getItems(category: Category, userId?: string): Promise<Item[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const collectionPath = getUserCollectionPath(collectionName, userId);
    const q = query(collection(db, collectionPath));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    
    const items: Item[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      items.push(processItemData({ ...data, id: docSnapshot.id }));
    });
    
    return items;
  } catch (error) {
    console.error(`Error getting ${category} items:`, error);
    throw error;
  }
}

/**
 * Get a single item by ID (user-specific)
 */
export async function getItem(category: Category, id: string, userId?: string): Promise<Item | null> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const collectionPath = getUserCollectionPath(collectionName, userId);
    const docRef = doc(db, collectionPath, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return processItemData({ ...data, id: docSnap.id });
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting ${category} item ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new item (user-specific)
 */
export async function createItem(category: Category, item: Item, userId?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const collectionPath = getUserCollectionPath(collectionName, userId);
    const itemId = item.id || doc(collection(db, collectionPath)).id;
    
    // Prepare data for save - ensure createdAt is set for new items
    const itemData = prepareItemForSave({ ...item, id: itemId }, true);
    
    const docRef = doc(db, collectionPath, itemId);
    await setDoc(docRef, itemData);
    
    return itemId;
  } catch (error) {
    console.error(`Error creating ${category} item:`, error);
    throw error;
  }
}

/**
 * Update an existing item (user-specific)
 */
export async function updateItem(category: Category, item: Item, userId?: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    if (!item.id) {
      throw new Error('Item ID is required for update');
    }

    const collectionName = getCollectionName(category);
    const collectionPath = getUserCollectionPath(collectionName, userId);
    const itemData = prepareItemForSave(item, false);
    
    // Remove id from data (it's the document ID, not a field)
    delete itemData.id;
    
    const docRef = doc(db, collectionPath, item.id);
    await updateDoc(docRef, itemData);
  } catch (error) {
    console.error(`Error updating ${category} item ${item.id}:`, error);
    throw error;
  }
}

/**
 * Delete an item (user-specific)
 */
export async function deleteItem(category: Category, id: string, userId?: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const collectionPath = getUserCollectionPath(collectionName, userId);
    const docRef = doc(db, collectionPath, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting ${category} item ${id}:`, error);
    throw error;
  }
}

/**
 * Get all items across all categories (user-specific)
 */
export async function getAllItems(userId?: string): Promise<Record<Category, Item[]>> {
  try {
    const [tourism, culinary, hotels, events] = await Promise.all([
      getItems('tourism', userId),
      getItems('culinary', userId),
      getItems('hotel', userId),
      getItems('event', userId),
    ]);

    return {
      tourism,
      culinary,
      hotel: hotels,
      event: events,
    };
  } catch (error) {
    console.error('Error getting all items:', error);
    throw error;
  }
}

// ========== Favorites Operations ==========

/**
 * Get user favorites
 */
export async function getFavorites(userId: string = 'default'): Promise<string[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

/**
 * Add item to favorites
 */
export async function addFavorite(userId: string, itemId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const favorites = await getFavorites(userId);
    if (!favorites.includes(itemId)) {
      favorites.push(itemId);
      const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
      await setDoc(docRef, { items: favorites, updatedAt: Timestamp.now() }, { merge: true });
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Remove item from favorites
 */
export async function removeFavorite(userId: string, itemId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const favorites = await getFavorites(userId);
    const updated = favorites.filter(id => id !== itemId);
    const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
    await setDoc(docRef, { items: updated, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// ========== Recent Items Operations ==========

/**
 * Get recent items
 */
export async function getRecent(userId: string = 'default'): Promise<string[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(db, COLLECTIONS.RECENT, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting recent items:', error);
    return [];
  }
}

/**
 * Add item to recent
 */
export async function addRecent(userId: string, itemId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const recent = await getRecent(userId);
    const updated = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
    const docRef = doc(db, COLLECTIONS.RECENT, userId);
    await setDoc(docRef, { items: updated, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error('Error adding recent item:', error);
    throw error;
  }
}

// ========== Admin Auth Operations ==========

/**
 * Get admin PIN from Firestore
 */
export async function getAdminPin(): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_AUTH_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.pin || '1234'; // Default PIN if not set
    }
    
    // If document doesn't exist, create it with default PIN
    await setDoc(docRef, { pin: '1234', createdAt: Timestamp.now() });
    return '1234';
  } catch (error) {
    console.error('Error getting admin PIN:', error);
    // Fallback to default PIN
    return '1234';
  }
}

/**
 * Update admin PIN in Firestore
 */
export async function updateAdminPin(newPin: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    if (!newPin || newPin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }

    const docRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_AUTH_DOC_ID);
    await setDoc(docRef, { 
      pin: newPin, 
      updatedAt: Timestamp.now() 
    }, { merge: true });
  } catch (error) {
    console.error('Error updating admin PIN:', error);
    throw error;
  }
}

/**
 * Verify admin PIN
 */
export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const adminPin = await getAdminPin();
    return pin === adminPin;
  } catch (error) {
    console.error('Error verifying admin PIN:', error);
    return false;
  }
}

