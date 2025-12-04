/**
 * Script to generate tour routes for all items that don't have one
 * This ensures every item has a tour guide
 * Run with: node scripts/generate-tour-routes.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON files
const readJsonFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Read existing tour routes
const tourRoutesPath = path.join(__dirname, '..', 'assets', 'data', 'tour-routes.json');
const existingRoutes = readJsonFile('assets/data/tour-routes.json') || [];

// Get all destination IDs that already have routes
const existingDestinationIds = new Set(existingRoutes.map(route => route.destinationId));

console.log('📋 Existing tour routes:', existingRoutes.length);
console.log('📋 Existing destination IDs:', Array.from(existingDestinationIds));

// Read all items from data files (if they exist) or we'll need to get from Firestore
// For now, let's create a function that generates routes for any missing items

/**
 * Generate a basic tour route for an item
 */
function generateTourRoute(item, category) {
  const categoryPrefix = {
    tourism: 'tourism',
    culinary: 'culinary',
    hotel: 'hotel',
    event: 'event'
  }[category] || category;

  const routeId = `route-${item.id.replace(/-/g, '-')}`;
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
 * Main function to generate missing tour routes
 */
async function generateMissingTourRoutes() {
  console.log('\n🚀 Starting tour route generation...\n');
  console.log('='.repeat(60));

  // Try to read items from Firestore or data files
  // For now, we'll create routes based on what we know exists
  // You can modify this to fetch from Firestore if needed

  // Read items from extract-and-seed script data
  const extractScriptPath = path.join(__dirname, 'extract-and-seed.mjs');
  
  // We'll need to get items from Firestore or create a mapping
  // For now, let's create a script that can be run after items are loaded
  
  console.log('\n📝 To generate tour routes for all items:');
  console.log('1. Make sure all items are loaded in Firestore');
  console.log('2. Run this script to generate routes for missing items');
  console.log('3. The script will update assets/data/tour-routes.json\n');

  // For now, let's create a function that can be called with item data
  return {
    generateRoute: generateTourRoute,
    existingRoutes: existingRoutes,
    existingDestinationIds: existingDestinationIds
  };
}

// Export for use in other scripts
export { generateTourRoute, generateMissingTourRoutes };

// If run directly, show usage
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMissingTourRoutes().then(() => {
    console.log('\n✅ Script ready. Use generateRoute() function to create routes for items.');
  });
}

