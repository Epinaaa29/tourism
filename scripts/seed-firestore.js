/**
 * Script to seed Firestore with data from JSON files
 * Run with: node scripts/seed-firestore.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import Firebase (ES modules)
const { initializeApp } = await import('firebase/app');
const { getFirestore, doc, setDoc } = await import('firebase/firestore');

// Firebase configuration (same as lib/firebase.ts)
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

// Read JSON files
const readJsonFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Upload items to Firestore
const uploadItems = async (category, items) => {
  const collectionName = COLLECTIONS[category] || category;
  console.log(`\n📤 Uploading ${items.length} items to collection: ${collectionName}`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      successCount++;
      console.log(`  ✓ Uploaded: ${item.name} (${item.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Error uploading ${item.id}:`, error.message);
    }
  }

  console.log(`\n  Summary: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
};

// Main seeding function
const seedFirestore = async () => {
  console.log('🌱 Starting Firestore seeding...\n');

  try {
    // Read all JSON files
    const tourismData = readJsonFile('assets/data/tourism.json');
    const culinaryData = readJsonFile('assets/data/culinary.json');
    const hotelsData = readJsonFile('assets/data/hotels.json');
    const eventsData = readJsonFile('assets/data/events.json');

    const results = {
      tourism: { success: 0, error: 0 },
      culinary: { success: 0, error: 0 },
      hotel: { success: 0, error: 0 },
      event: { success: 0, error: 0 },
    };

    // Upload each category
    if (tourismData) {
      const result = await uploadItems('tourism', tourismData);
      results.tourism = result;
    }

    if (culinaryData) {
      const result = await uploadItems('culinary', culinaryData);
      results.culinary = result;
    }

    if (hotelsData) {
      const result = await uploadItems('hotel', hotelsData);
      results.hotel = result;
    }

    if (eventsData) {
      const result = await uploadItems('event', eventsData);
      results.event = result;
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tourism:   ${results.tourism.success} succeeded, ${results.tourism.error} failed`);
    console.log(`Culinary:   ${results.culinary.success} succeeded, ${results.culinary.error} failed`);
    console.log(`Hotels:     ${results.hotel.success} succeeded, ${results.hotel.error} failed`);
    console.log(`Events:     ${results.event.success} succeeded, ${results.event.error} failed`);
    console.log('='.repeat(50));
    
    const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
    const totalError = Object.values(results).reduce((sum, r) => sum + r.error, 0);
    
    console.log(`\n✨ Total: ${totalSuccess} items uploaded successfully`);
    if (totalError > 0) {
      console.log(`⚠️  ${totalError} items failed to upload`);
    }
    console.log('\n✅ Seeding completed!\n');

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
};

// Run the seed script
seedFirestore()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

