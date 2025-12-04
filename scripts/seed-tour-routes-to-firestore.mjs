/**
 * Script to seed tour routes to Firestore
 * This uploads all tour routes from tour-routes.json to Firebase
 * Run with: node scripts/seed-tour-routes-to-firestore.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
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

// Read tour routes from JSON file
const tourRoutesPath = path.join(__dirname, '..', 'assets', 'data', 'tour-routes.json');
let tourRoutes = [];
try {
  if (fs.existsSync(tourRoutesPath)) {
    const data = fs.readFileSync(tourRoutesPath, 'utf8');
    tourRoutes = JSON.parse(data);
  } else {
    console.error('❌ tour-routes.json not found!');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading tour-routes.json:', error);
  process.exit(1);
}

/**
 * Upload tour routes to Firestore
 */
async function seedTourRoutesToFirestore() {
  console.log('\n🌱 Starting tour route seeding to Firestore...\n');
  console.log('='.repeat(60));
  console.log(`📋 Found ${tourRoutes.length} tour routes to upload\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Check existing routes
  const existingRoutes = new Set();
  try {
    const snapshot = await getDocs(collection(db, 'tour_routes'));
    snapshot.forEach((doc) => {
      existingRoutes.add(doc.id);
    });
    console.log(`📋 Found ${existingRoutes.size} existing routes in Firestore\n`);
  } catch (error) {
    console.log('⚠️ Could not check existing routes, will try to upload all\n');
  }

  for (const route of tourRoutes) {
    try {
      const routeId = route.id;

      // Check if route already exists
      if (existingRoutes.has(routeId)) {
        console.log(`   ⊘ Skipped (already exists): ${route.destinationName} (${routeId})`);
        skippedCount++;
        continue;
      }

      // Prepare route data for Firestore
      const routeData = {
        ...route,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Remove id from data (it's the document ID)
      delete routeData.id;

      // Upload to Firestore
      const docRef = doc(db, 'tour_routes', routeId);
      await setDoc(docRef, routeData);

      successCount++;
      console.log(`   ✓ Uploaded: ${route.destinationName} (${routeId})`);
    } catch (error) {
      errorCount++;
      console.error(`   ✗ Error uploading ${route.id}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Uploaded: ${successCount}`);
  console.log(`⊘ Skipped: ${skippedCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log(`📊 Total: ${tourRoutes.length}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Tour routes successfully uploaded to Firestore!');
    console.log('📍 Collection: tour_routes');
    console.log('💡 The app will now load routes from Firestore instead of JSON file.');
  }
}

// Run the script
seedTourRoutesToFirestore().catch((error) => {
  console.error('❌ Error seeding tour routes:', error);
  process.exit(1);
});

