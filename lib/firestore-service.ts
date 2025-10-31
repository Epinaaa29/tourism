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
} as const;

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
 * Ensures images are in base64 format
 */
function prepareItemForSave(item: Item): any {
  const data: any = {
    ...item,
    updatedAt: Timestamp.now(),
  };
  
  // Ensure createdAt timestamp if new item
  if (!item.id || item.id === 'new') {
    data.createdAt = Timestamp.now();
  }
  
  // Images should already be base64 at this point (from image picker)
  // But we can verify and convert if needed
  
  return data;
}

// ========== CRUD Operations ==========

/**
 * Get all items for a category
 */
export async function getItems(category: Category): Promise<Item[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const q = query(collection(db, collectionName));
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
 * Get a single item by ID
 */
export async function getItem(category: Category, id: string): Promise<Item | null> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const docRef = doc(db, collectionName, id);
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
 * Create a new item
 */
export async function createItem(category: Category, item: Item): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const itemId = item.id || doc(collection(db, collectionName)).id;
    const itemData = prepareItemForSave({ ...item, id: itemId });
    
    const docRef = doc(db, collectionName, itemId);
    await setDoc(docRef, itemData);
    
    return itemId;
  } catch (error) {
    console.error(`Error creating ${category} item:`, error);
    throw error;
  }
}

/**
 * Update an existing item
 */
export async function updateItem(category: Category, item: Item): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    if (!item.id) {
      throw new Error('Item ID is required for update');
    }

    const collectionName = getCollectionName(category);
    const itemData = prepareItemForSave(item);
    
    // Remove id from data (it's the document ID, not a field)
    delete itemData.id;
    
    const docRef = doc(db, collectionName, item.id);
    await updateDoc(docRef, itemData);
  } catch (error) {
    console.error(`Error updating ${category} item ${item.id}:`, error);
    throw error;
  }
}

/**
 * Delete an item
 */
export async function deleteItem(category: Category, id: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const collectionName = getCollectionName(category);
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting ${category} item ${id}:`, error);
    throw error;
  }
}

/**
 * Get all items across all categories
 */
export async function getAllItems(): Promise<Record<Category, Item[]>> {
  try {
    const [tourism, culinary, hotels, events] = await Promise.all([
      getItems('tourism'),
      getItems('culinary'),
      getItems('hotel'),
      getItems('event'),
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

