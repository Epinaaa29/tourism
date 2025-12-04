/**
 * Script to seed Firebase with new data from items-data.json
 * and generate tour routes for all items
 * Converts images to base64 before uploading
 * Run with: node scripts/seed-all-data.mjs
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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
  tour_routes: 'tour_routes',
};

/**
 * Convert image file to base64 with compression
 */
async function imageToBase64(filePath) {
  try {
    if (!filePath || filePath.trim() === '') {
      return null;
    }
    
    // If already base64, return as is
    if (filePath.startsWith('data:image')) {
      return filePath;
    }
    
    // Resolve the full path
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Image file not found: ${fullPath}`);
      return null;
    }
    
    // Get original file size
    const originalStats = fs.statSync(fullPath);
    const originalSize = originalStats.size;
    
    // If file is already small (< 200KB), skip compression
    if (originalSize < 200 * 1024) {
      const bitmap = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/jpeg';
      
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      
      const base64 = bitmap.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }
    
    // Compress and resize image using sharp
    // Max dimensions: 1024x1024, quality: 50%, convert to JPEG for better compression
    try {
      const compressedBuffer = await sharp(fullPath)
        .resize(1024, 1024, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 50,
          mozjpeg: true
        })
        .toBuffer();
      
      const compressedSize = compressedBuffer.length;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      
      if (compressionRatio > 0) {
        console.log(`   Compressed ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (${compressionRatio}% reduction)`);
      }
      
      // Convert to base64
      const base64 = compressedBuffer.toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (sharpError) {
      // If sharp fails, fall back to original method
      console.warn(`   Sharp compression failed for ${path.basename(filePath)}, using original: ${sharpError.message}`);
      const bitmap = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/jpeg';
      
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      
      const base64 = bitmap.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }
  } catch (error) {
    console.error(`Error converting ${filePath} to base64:`, error.message);
    return null;
  }
}

/**
 * Convert item images to base64 with compression
 * Limits number of images to prevent exceeding Firestore size limits
 */
async function convertItemImagesToBase64(item) {
  const converted = { ...item };
  const MAX_IMAGES = 3; // Limit to 3 images max
  const MAX_TOTAL_SIZE = 700 * 1024; // Max 700KB for all images combined (leaving room for other data)
  
  // Convert main image
  if (converted.image && converted.image.trim() !== '') {
    const base64Image = await imageToBase64(converted.image);
    if (base64Image) {
      converted.image = base64Image;
    } else {
      converted.image = '';
    }
  }
  
  // Convert images array with size and count limits
  if (converted.images && Array.isArray(converted.images) && converted.images.length > 0) {
    const originalCount = converted.images.length;
    const base64Images = [];
    let totalSize = 0;
    
    // Limit to first MAX_IMAGES images
    const imagesToProcess = converted.images.slice(0, MAX_IMAGES);
    
    for (const imgPath of imagesToProcess) {
      if (imgPath && imgPath.trim() !== '') {
        const base64Img = await imageToBase64(imgPath);
        if (base64Img) {
          // Calculate size of base64 image (approximate: base64 is ~33% larger than binary)
          const imgSize = (base64Img.length * 3) / 4;
          
          // Check if adding this image would exceed the limit
          if (totalSize + imgSize > MAX_TOTAL_SIZE) {
            console.log(`   Skipping additional images for ${item.name} (size limit reached)`);
            break;
          }
          
          base64Images.push(base64Img);
          totalSize += imgSize;
        }
      }
    }
    
    converted.images = base64Images.length > 0 ? base64Images : undefined;
    
    if (base64Images.length < originalCount) {
      console.log(`   Limited ${item.name} to ${base64Images.length} images (from ${originalCount})`);
    }
  }
  
  return converted;
}

/**
 * Read items-data.json
 */
function readItemsData() {
  try {
    const filePath = path.join(__dirname, '..', 'lib', 'items-data.json');
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
  console.log(`   Converting images to base64...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      // Convert images to base64 with compression before uploading
      const itemWithBase64 = await convertItemImagesToBase64(item);
      
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        ...itemWithBase64,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      successCount++;
      const imageStatus = itemWithBase64.image ? '✓' : '⊘';
      console.log(`  ${imageStatus} Uploaded: ${item.name} (${item.id})`);
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
  console.log('🌱 SEEDING FIREBASE WITH NEW DATA');
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

    // Separate items by category
    const itemsByCategory = {
      tourism: data.items.filter(item => item.category === 'tourism'),
      culinary: data.items.filter(item => item.category === 'culinary'),
      hotel: data.items.filter(item => item.category === 'hotel'),
      event: data.items.filter(item => item.category === 'event'),
    };

    const results = {
      tourism: { success: 0, error: 0 },
      culinary: { success: 0, error: 0 },
      hotel: { success: 0, error: 0 },
      event: { success: 0, error: 0 },
      tour_routes: { success: 0, error: 0 },
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
    console.log('\n✅ Seeding completed!\n');

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

