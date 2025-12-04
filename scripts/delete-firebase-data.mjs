/**
 * Script to delete all data from Firebase collections:
 * - tourism
 * - culinary
 * - hotels
 * - events
 * - tour_routes (tour guides)
 * 
 * Run with: node scripts/delete-firebase-data.mjs
 * 
 * WARNING: This will permanently delete all data from these collections!
 */

import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore } from 'firebase/firestore';

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

// Collections to delete
const COLLECTIONS_TO_DELETE = [
  'tourism',
  'culinary',
  'hotels',
  'events',
  'tour_routes',
];

/**
 * Delete all documents from a collection
 */
async function deleteCollection(collectionName) {
  console.log(`\n🗑️  Deleting collection: ${collectionName}`);
  console.log('─'.repeat(50));
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const docCount = snapshot.size;
    console.log(`   Found ${docCount} documents`);
    
    if (docCount === 0) {
      console.log(`   ✓ Collection is already empty`);
      return { deleted: 0, errors: 0 };
    }
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Delete each document
    for (const docSnapshot of snapshot.docs) {
      try {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        deletedCount++;
        console.log(`   ✓ Deleted: ${docSnapshot.id}`);
      } catch (error) {
        errorCount++;
        console.error(`   ✗ Error deleting ${docSnapshot.id}:`, error.message);
      }
    }
    
    console.log(`\n   Summary: ${deletedCount} deleted, ${errorCount} errors`);
    return { deleted: deletedCount, errors: errorCount };
    
  } catch (error) {
    console.error(`   ✗ Error accessing collection ${collectionName}:`, error.message);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Main deletion function
 */
async function deleteAllData() {
  console.log('='.repeat(60));
  console.log('🔥 FIREBASE DATA DELETION');
  console.log('='.repeat(60));
  console.log('\n⚠️  WARNING: This will permanently delete all data from:');
  COLLECTIONS_TO_DELETE.forEach(col => console.log(`   - ${col}`));
  console.log('\nStarting deletion in 2 seconds...\n');
  
  // Small delay to allow user to cancel if needed
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = {};
  let totalDeleted = 0;
  let totalErrors = 0;
  
  // Delete each collection
  for (const collectionName of COLLECTIONS_TO_DELETE) {
    const result = await deleteCollection(collectionName);
    results[collectionName] = result;
    totalDeleted += result.deleted;
    totalErrors += result.errors;
  }
  
  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DELETION SUMMARY');
  console.log('='.repeat(60));
  
  for (const [collectionName, result] of Object.entries(results)) {
    console.log(`${collectionName.padEnd(15)}: ${result.deleted} deleted, ${result.errors} errors`);
  }
  
  console.log('─'.repeat(60));
  console.log(`Total: ${totalDeleted} documents deleted, ${totalErrors} errors`);
  console.log('='.repeat(60));
  
  if (totalErrors === 0) {
    console.log('\n✅ All data deleted successfully!');
  } else {
    console.log(`\n⚠️  Deletion completed with ${totalErrors} error(s)`);
  }
}

// Run the deletion script
deleteAllData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deletion failed:', error);
    process.exit(1);
  });









