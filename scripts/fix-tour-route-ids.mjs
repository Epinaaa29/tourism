/**
 * Script to fix tour route destinationIds to match actual Firebase item IDs
 * This ensures all tour routes have the correct destinationId that matches the item's document ID
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyC7RGqlToFYYVugp5kPP1gd0Za-Q6zGnBs",
  authDomain: "tourism-1d046.firebaseapp.com",
  projectId: "tourism-1d046",
  storageBucket: "tourism-1d046.firebasestorage.app",
  messagingSenderId: "934736403877",
  appId: "1:934736403877:web:c326034b57280fba519c4c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  tourism: 'tourism',
  culinary: 'culinary',
  hotel: 'hotels',
  event: 'events',
};

/**
 * Find item by name (fuzzy match)
 */
function findItemByName(items, name) {
  const nameLower = name.toLowerCase();
  return items.find(item => {
    const itemNameLower = item.name.toLowerCase();
    return itemNameLower.includes(nameLower) || 
           nameLower.includes(itemNameLower) ||
           itemNameLower.replace(/\s+/g, '') === nameLower.replace(/\s+/g, '');
  });
}

async function fixTourRouteIds() {
  console.log('\n🔧 Starting tour route ID fix...\n');
  console.log('='.repeat(60));

  // Load all items from all categories
  const allItems = {};
  for (const [category, collectionName] of Object.entries(COLLECTIONS)) {
    const snapshot = await getDocs(collection(db, collectionName));
    allItems[category] = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    console.log(`📋 Loaded ${allItems[category].length} ${category} items`);
  }

  // Load all tour routes
  const routesSnapshot = await getDocs(collection(db, 'tour_routes'));
  const routes = routesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(`📋 Found ${routes.length} tour routes\n`);

  let fixedCount = 0;
  let notFoundCount = 0;
  const fixedRoutes = [];

  for (const route of routes) {
    const currentDestinationId = route.destinationId;
    const routeName = route.destinationName;

    // Try to find matching item by ID first
    let matchingItem = null;
    for (const category of Object.keys(COLLECTIONS)) {
      matchingItem = allItems[category].find(item => item.id === currentDestinationId);
      if (matchingItem) break;
    }

    // If not found by ID, try to find by name
    if (!matchingItem) {
      for (const category of Object.keys(COLLECTIONS)) {
        matchingItem = findItemByName(allItems[category], routeName);
        if (matchingItem) break;
      }
    }

    if (matchingItem && matchingItem.id !== currentDestinationId) {
      // Update the route with correct destinationId
      const routeRef = doc(db, 'tour_routes', route.id);
      await updateDoc(routeRef, {
        destinationId: matchingItem.id,
      });
      fixedCount++;
      fixedRoutes.push({
        routeId: route.id,
        oldId: currentDestinationId,
        newId: matchingItem.id,
        name: routeName,
      });
      console.log(`   ✓ Fixed: ${routeName}`);
      console.log(`     ${currentDestinationId} → ${matchingItem.id}`);
    } else if (!matchingItem) {
      notFoundCount++;
      console.log(`   ✗ Not found: ${routeName} (${currentDestinationId})`);
    } else {
      console.log(`   ⊘ Already correct: ${routeName} (${currentDestinationId})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Fixed: ${fixedCount}`);
  console.log(`✗ Not found: ${notFoundCount}`);
  console.log(`📊 Total: ${routes.length}`);
  console.log('='.repeat(60));

  if (fixedCount > 0) {
    console.log('\n✨ Tour route IDs successfully fixed!');
    console.log('💡 The app should now be able to match routes correctly.');
  }
}

fixTourRouteIds().catch((error) => {
  console.error('❌ Error fixing tour route IDs:', error);
  process.exit(1);
});

