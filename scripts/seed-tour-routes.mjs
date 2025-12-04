/**
 * Script to seed tour routes for all items from Firestore
 * This ensures every item has a tour guide
 * Run with: node scripts/seed-tour-routes.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7RGqlToFYYVugp5kPP1gd0Za-Q6zGnBs",
  authDomain: "tourism-1d046.firebaseapp.com",
  projectId: "tourism-1d046",
  storageBucket: "tourism-1d046.firebasestorage.app",
  messagingSenderId: "934736403877",
  appId: "1:934736403877:web:c326034b57280fba519c4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
const COLLECTIONS = {
  tourism: 'tourism',
  culinary: 'culinary',
  hotel: 'hotels',
  event: 'events',
};

// Read existing tour routes
const tourRoutesPath = path.join(__dirname, '..', 'assets', 'data', 'tour-routes.json');
let existingRoutes = [];
try {
  if (fs.existsSync(tourRoutesPath)) {
    const data = fs.readFileSync(tourRoutesPath, 'utf8');
    existingRoutes = JSON.parse(data);
  }
} catch (error) {
  console.error('Error reading existing routes:', error);
}

const existingDestinationIds = new Set(existingRoutes.map(route => route.destinationId));
console.log(`📋 Found ${existingRoutes.length} existing tour routes`);

/**
 * Generate a basic tour route for an item
 */
function generateTourRoute(item, category) {
  const routeId = `route-${item.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
  const destinationId = item.id;
  const destinationName = item.name;

  // Generate basic checkpoints based on item location
  const checkpoints = [
    {
      id: `checkpoint-${item.id}-1`,
      name: `Pintu Masuk ${item.name}`,
      description: `Titik awal kunjungan ke ${item.name}. Dapatkan informasi dan peta lokasi.`,
      latitude: item.latitude,
      longitude: item.longitude,
      type: 'landmark',
      order: 1,
      estimatedTime: 0,
      notes: `Selamat datang di ${item.name}. Nikmati pengalaman wisata yang menyenangkan.`
    },
    {
      id: `checkpoint-${item.id}-2`,
      name: item.name,
      description: item.description || `Lokasi utama ${item.name}.`,
      latitude: item.latitude,
      longitude: item.longitude,
      type: category === 'culinary' ? 'restaurant' : category === 'hotel' ? 'accommodation' : 'landmark',
      order: 2,
      estimatedTime: category === 'culinary' ? 60 : category === 'hotel' ? 0 : 120,
      notes: `Jelajahi dan nikmati ${item.name}. Ambil foto dan buat kenangan indah.`
    }
  ];

  // Add a third checkpoint for tourism/events
  if (category === 'tourism' || category === 'event') {
    checkpoints.push({
      id: `checkpoint-${item.id}-3`,
      name: `Area Sekitar ${item.name}`,
      description: `Jelajahi area sekitar ${item.name} untuk pengalaman lebih lengkap.`,
      latitude: item.latitude + (Math.random() * 0.01 - 0.005), // Slight variation
      longitude: item.longitude + (Math.random() * 0.01 - 0.005),
      type: 'landmark',
      order: 3,
      estimatedTime: 60,
      notes: `Temukan spot-spot menarik di sekitar ${item.name}.`
    });
  }

  // Calculate total time
  const totalEstimatedTime = checkpoints.reduce((sum, cp) => sum + cp.estimatedTime, 0);

  // Determine difficulty based on category
  const difficulty = category === 'hotel' || category === 'culinary' ? 'easy' : 
                     category === 'event' ? 'medium' : 'medium';

  return {
    id: routeId,
    destinationId: destinationId,
    destinationName: destinationName,
    checkpoints: checkpoints,
    transports: [],
    totalEstimatedTime: totalEstimatedTime,
    difficulty: difficulty,
    description: `Tur terpandu ke ${item.name}. ${item.description || ''}`
  };
}

/**
 * Fetch all items from a collection
 */
async function fetchItems(category) {
  try {
    const collectionName = COLLECTIONS[category] || category;
    const snapshot = await getDocs(collection(db, collectionName));
    const items = [];
    
    snapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
        category: category
      });
    });
    
    return items;
  } catch (error) {
    console.error(`Error fetching ${category} items:`, error);
    return [];
  }
}

/**
 * Main seeding function
 */
async function seedTourRoutes() {
  console.log('\n🌱 Starting tour route seeding...\n');
  console.log('='.repeat(60));

  const newRoutes = [];
  const updatedRoutes = [...existingRoutes];

  // Fetch all items from each category
  const categories = ['tourism', 'culinary', 'hotel', 'event'];
  
  for (const category of categories) {
    console.log(`\n📦 Fetching ${category} items...`);
    const items = await fetchItems(category);
    console.log(`   Found ${items.length} ${category} items`);

    for (const item of items) {
      // Check if route already exists
      if (existingDestinationIds.has(item.id)) {
        console.log(`   ✓ Route exists for: ${item.name} (${item.id})`);
        continue;
      }

      // Generate new route
      console.log(`   ➕ Generating route for: ${item.name} (${item.id})`);
      const route = generateTourRoute(item, category);
      newRoutes.push(route);
      updatedRoutes.push(route);
      existingDestinationIds.add(item.id);
    }
  }

  // Write updated routes to file
  if (newRoutes.length > 0) {
    console.log(`\n📝 Writing ${newRoutes.length} new routes to tour-routes.json...`);
    
    // Sort routes by category and name for better organization
    updatedRoutes.sort((a, b) => {
      const aCategory = a.destinationId.split('-')[0];
      const bCategory = b.destinationId.split('-')[0];
      if (aCategory !== bCategory) {
        return aCategory.localeCompare(bCategory);
      }
      return a.destinationName.localeCompare(b.destinationName);
    });

    fs.writeFileSync(
      tourRoutesPath,
      JSON.stringify(updatedRoutes, null, 2),
      'utf8'
    );

    console.log(`\n✅ Successfully added ${newRoutes.length} new tour routes!`);
    console.log(`📊 Total routes: ${updatedRoutes.length}`);
  } else {
    console.log('\n✅ All items already have tour routes!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Existing routes: ${existingRoutes.length}`);
  console.log(`New routes created: ${newRoutes.length}`);
  console.log(`Total routes: ${updatedRoutes.length}`);
  console.log('='.repeat(60));
}

// Run the script
seedTourRoutes().catch((error) => {
  console.error('❌ Error seeding tour routes:', error);
  process.exit(1);
});

