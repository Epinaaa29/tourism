/**
 * Script to seed Firebase with data from items-data.json
 * Converts all images to base64 format before uploading
 * Run with: node scripts/seed-with-base64-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

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
  tour_routes: 'tour_routes',
};

/**
 * Convert image file to base64
 */
function imageToBase64(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  Image not found: ${filePath}`);
      return null;
    }

    const bitmap = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/jpeg';
    
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    
    const base64 = bitmap.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`  ✗ Error converting ${filePath} to base64:`, error.message);
    return null;
  }
}

/**
 * Convert image path to base64
 * Handles relative paths from items-data.json
 */
function convertImagePathToBase64(imagePath) {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  // If already base64, return as is
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // Resolve relative path
  const fullPath = path.join(projectRoot, imagePath);
  return imageToBase64(fullPath);
}

/**
 * Convert all images in an item to base64
 */
function convertItemImagesToBase64(item) {
  const converted = { ...item };

  // Convert main image
  if (converted.image) {
    const base64Image = convertImagePathToBase64(converted.image);
    if (base64Image) {
      converted.image = base64Image;
    } else {
      converted.image = '';
    }
  }

  // Convert images array
  if (converted.images && Array.isArray(converted.images)) {
    const base64Images = [];
    for (const imgPath of converted.images) {
      const base64Img = convertImagePathToBase64(imgPath);
      if (base64Img) {
        base64Images.push(base64Img);
      }
    }
    converted.images = base64Images.length > 0 ? base64Images : undefined;
  }

  return converted;
}

/**
 * Read items-data.json
 */
function readItemsData() {
  try {
    const filePath = path.join(projectRoot, 'lib', 'items-data.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading items-data.json:', error);
    return null;
  }
}

/**
 * Upload items to Firestore by category
 */
async function uploadItems(category, items) {
  const collectionName = COLLECTIONS[category] || category;
  console.log(`\n📤 Uploading ${items.length} items to collection: ${collectionName}`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      // Convert images to base64
      const itemWithBase64 = convertItemImagesToBase64(item);
      
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        ...itemWithBase64,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
}

/**
 * Generate tour route for an item
 */
function generateTourRoute(item, category) {
  const routeId = `route-${item.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
  const destinationId = item.id;
  const destinationName = item.name;

  // Generate checkpoints based on item type
  const checkpoints = [];
  
  // Starting point (if coordinates are valid)
  if (item.latitude && item.longitude && item.latitude !== 0 && item.longitude !== 0) {
    checkpoints.push({
      id: `checkpoint-${item.id}-1`,
      name: `Pintu Masuk ${item.name}`,
      description: `Titik awal kunjungan ke ${item.name}. Dapatkan informasi dan peta lokasi di sini.`,
      latitude: item.latitude,
      longitude: item.longitude,
      type: 'landmark',
      order: 1,
      estimatedTime: 0,
      notes: `Selamat datang di ${item.name}. Nikmati pengalaman wisata yang menyenangkan.`
    });

    // Main destination checkpoint
    checkpoints.push({
      id: `checkpoint-${item.id}-2`,
      name: item.name,
      description: item.description ? item.description.substring(0, 200) : `Lokasi utama ${item.name}.`,
      latitude: item.latitude,
      longitude: item.longitude,
      type: category === 'culinary' ? 'restaurant' : 
            category === 'hotel' ? 'accommodation' : 
            category === 'event' ? 'venue' : 'landmark',
      order: 2,
      estimatedTime: category === 'culinary' ? 60 : 
                     category === 'hotel' ? 0 : 
                     category === 'event' ? 90 : 120,
      notes: `Jelajahi dan nikmati ${item.name}. Ambil foto dan buat kenangan indah.`
    });

    // Additional checkpoint for tourism/events
    if (category === 'tourism' || category === 'event') {
      // Add a nearby exploration point
      const latVariation = (Math.random() * 0.02 - 0.01); // ±0.01 degrees
      const lngVariation = (Math.random() * 0.02 - 0.01);
      
      checkpoints.push({
        id: `checkpoint-${item.id}-3`,
        name: `Area Sekitar ${item.name}`,
        description: `Jelajahi area sekitar ${item.name} untuk pengalaman lebih lengkap.`,
        latitude: item.latitude + latVariation,
        longitude: item.longitude + lngVariation,
        type: 'landmark',
        order: 3,
        estimatedTime: 60,
        notes: `Temukan spot-spot menarik di sekitar ${item.name}.`
      });
    }
  } else {
    // If no valid coordinates, create a single checkpoint
    checkpoints.push({
      id: `checkpoint-${item.id}-1`,
      name: item.name,
      description: item.description ? item.description.substring(0, 200) : `Lokasi ${item.name}.`,
      latitude: 3.6096428, // Default to Tahuna center
      longitude: 125.5075721,
      type: category === 'culinary' ? 'restaurant' : 
            category === 'hotel' ? 'accommodation' : 
            category === 'event' ? 'venue' : 'landmark',
      order: 1,
      estimatedTime: category === 'culinary' ? 60 : 
                     category === 'hotel' ? 0 : 
                     category === 'event' ? 90 : 120,
      notes: `Kunjungi ${item.name} dan nikmati pengalaman yang ditawarkan.`
    });
  }

  // Generate transports based on category and location
  const transports = [];
  
  if (category === 'tourism' && item.district && item.district.includes('Tatoareng')) {
    // For remote locations, add boat transport
    transports.push({
      id: `transport-${item.id}-1`,
      name: 'Perahu Tradisional',
      type: 'boat',
      description: `Perahu tradisional menuju ${item.name}`,
      price: 'Rp 50.000 - Rp 100.000',
      schedule: ['07:00', '09:00', '11:00', '13:00', '15:00'],
      duration: '30-60 menit',
      bookingUrl: '',
      departurePoint: 'Pelabuhan Tahuna',
      arrivalPoint: item.name
    });
  } else if (item.latitude && item.longitude && item.latitude !== 0 && item.longitude !== 0) {
    // For locations with coordinates, add car/motorcycle transport
    transports.push({
      id: `transport-${item.id}-1`,
      name: 'Kendaraan Pribadi / Ojek',
      type: 'car',
      description: `Akses menuju ${item.name} menggunakan kendaraan pribadi atau ojek lokal`,
      price: 'Rp 20.000 - Rp 50.000',
      schedule: ['Setiap saat'],
      duration: '15-45 menit',
      bookingUrl: '',
      departurePoint: 'Kota Tahuna',
      arrivalPoint: item.name
    });
  }

  // Calculate total time
  const totalEstimatedTime = checkpoints.reduce((sum, cp) => sum + cp.estimatedTime, 0);

  // Determine difficulty
  const difficulty = category === 'hotel' || category === 'culinary' ? 'easy' : 
                     category === 'event' ? 'medium' : 'medium';

  return {
    id: routeId,
    destinationId: destinationId,
    destinationName: destinationName,
    checkpoints: checkpoints,
    transports: transports,
    totalEstimatedTime: totalEstimatedTime,
    difficulty: difficulty,
    description: `Tur terpandu ke ${item.name}. ${item.description ? item.description.substring(0, 150) + '...' : 'Nikmati pengalaman wisata yang menyenangkan.'}`
  };
}

/**
 * Upload tour routes to Firestore
 */
async function uploadTourRoutes(routes) {
  console.log(`\n📤 Uploading ${routes.length} tour routes to collection: tour_routes`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const route of routes) {
    try {
      const docRef = doc(db, COLLECTIONS.tour_routes, route.id);
      const routeData = { ...route };
      delete routeData.id; // Remove id from data (it's the document ID)
      
      await setDoc(docRef, {
        ...routeData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      successCount++;
      console.log(`  ✓ Uploaded: ${route.destinationName} (${route.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Error uploading ${route.id}:`, error.message);
    }
  }

  console.log(`\n  Summary: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
}

/**
 * Main seeding function
 */
async function seedAllData() {
  console.log('='.repeat(60));
  console.log('🌱 SEEDING FIREBASE WITH BASE64 IMAGES');
  console.log('='.repeat(60));

  try {
    // Read items-data.json
    console.log('\n📖 Reading items-data.json...');
    const data = readItemsData();
    
    if (!data || !data.items) {
      console.error('❌ No items found in items-data.json');
      process.exit(1);
    }

    console.log(`✓ Found ${data.items.length} items total`);
    console.log(`  - Tourism: ${data.metadata.categories.tourism}`);
    console.log(`  - Culinary: ${data.metadata.categories.culinary}`);
    console.log(`  - Hotels: ${data.metadata.categories.hotel}`);
    console.log(`  - Events: ${data.metadata.categories.event}`);

    console.log('\n🖼️  Converting images to base64...');
    console.log('   (This may take a while for large images...)');

    // Separate items by category
    const itemsByCategory = {
      tourism: data.items.filter(item => item.category === 'tourism'),
      culinary: data.items.filter(item => item.category === 'culinary'),
      hotel: data.items.filter(item => item.category === 'hotel'),
      event: data.items.filter(item => item.category === 'event'),
    };

    const results = {
      tourism: { successCount: 0, errorCount: 0 },
      culinary: { successCount: 0, errorCount: 0 },
      hotel: { successCount: 0, errorCount: 0 },
      event: { successCount: 0, errorCount: 0 },
      tour_routes: { successCount: 0, errorCount: 0 },
    };

    // Upload items by category
    if (itemsByCategory.tourism.length > 0) {
      const result = await uploadItems('tourism', itemsByCategory.tourism);
      results.tourism = result;
    }

    if (itemsByCategory.culinary.length > 0) {
      const result = await uploadItems('culinary', itemsByCategory.culinary);
      results.culinary = result;
    }

    if (itemsByCategory.hotel.length > 0) {
      const result = await uploadItems('hotel', itemsByCategory.hotel);
      results.hotel = result;
    }

    if (itemsByCategory.event.length > 0) {
      const result = await uploadItems('event', itemsByCategory.event);
      results.event = result;
    }

    // Generate tour routes for all items
    console.log('\n🗺️  Generating tour routes for all items...');
    const tourRoutes = [];
    
    for (const item of data.items) {
      const route = generateTourRoute(item, item.category);
      tourRoutes.push(route);
    }

    console.log(`✓ Generated ${tourRoutes.length} tour routes`);

    // Upload tour routes
    if (tourRoutes.length > 0) {
      const result = await uploadTourRoutes(tourRoutes);
      results.tour_routes = result;
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Tourism:      ${results.tourism.successCount || 0} succeeded, ${results.tourism.errorCount || 0} failed`);
    console.log(`Culinary:     ${results.culinary.successCount || 0} succeeded, ${results.culinary.errorCount || 0} failed`);
    console.log(`Hotels:       ${results.hotel.successCount || 0} succeeded, ${results.hotel.errorCount || 0} failed`);
    console.log(`Events:       ${results.event.successCount || 0} succeeded, ${results.event.errorCount || 0} failed`);
    console.log(`Tour Routes:  ${results.tour_routes.successCount || 0} succeeded, ${results.tour_routes.errorCount || 0} failed`);
    console.log('='.repeat(60));
    
    const totalSuccess = Object.values(results).reduce((sum, r) => sum + (r.successCount || 0), 0);
    const totalError = Object.values(results).reduce((sum, r) => sum + (r.errorCount || 0), 0);
    
    console.log(`\n✨ Total: ${totalSuccess} items/routes uploaded successfully`);
    if (totalError > 0) {
      console.log(`⚠️  ${totalError} items/routes failed to upload`);
    }
    console.log('\n✅ Seeding completed with base64 images!\n');

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed script
seedAllData()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

