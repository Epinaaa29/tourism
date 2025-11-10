/**
 * Script to extract all data from Aplikasi Pariwisata folder and seed Firestore
 * This script reads images from folders, converts them to base64, and uploads to Firestore
 * Run with: node scripts/extract-and-seed.mjs
 */

import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
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

// Base path to Aplikasi Pariwisata folder
const basePath = path.join(__dirname, '..', 'assets', 'Aplikasi Pariwisata');

/**
 * Convert image file to base64
 */
function imageToBase64(filePath) {
  try {
    const bitmap = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/jpeg';
    
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.heic') mimeType = 'image/heic';
    
    const base64 = bitmap.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting ${filePath} to base64:`, error.message);
    return null;
  }
}

/**
 * Read all image files from a directory
 */
function readImagesFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    // Only use jpg/jpeg/png/gif, exclude HEIC due to size issues
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });

  const images = [];
  for (const file of imageFiles.slice(0, 2)) { // Limit to 2 images per destination to avoid Firestore size limits
    const filePath = path.join(dirPath, file);
    const base64 = imageToBase64(filePath);
    if (base64) {
      images.push(base64);
    }
  }
  
  return images;
}

/**
 * Tourism destinations data
 */
const tourismDestinations = [
  {
    id: 'tourism-batuwingkung',
    name: 'Batuwingkung',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Batuwingkung yang indah dengan pantai berpasir putih dan pemandangan laut yang memukau. Destinasi ini menawarkan pengalaman wisata bahari yang menyegarkan.',
    rating: 4.5,
    latitude: 3.609000,
    longitude: 125.489000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-hesang',
    name: 'Hesang',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Hesang menawarkan wisata mangrove yang unik, pertanian tradisional, dan pantai yang indah. Pengunjung dapat menikmati keindahan alam tropis yang asri.',
    rating: 4.7,
    latitude: 3.600000,
    longitude: 125.500000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-kuma',
    name: 'Kuma',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Desa Wisata Malaesang Kuma adalah destinasi wisata yang menyajikan keindahan alam pedesaan dengan pantai yang eksotis dan budaya lokal yang kaya.',
    rating: 4.6,
    latitude: 3.580000,
    longitude: 125.450000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-laine',
    name: 'Laine',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Laine menawarkan air terjun yang menakjubkan, hutan yang lebat, dan atraksi budaya seperti musik bambu dan tarian tradisional.',
    rating: 4.8,
    latitude: 3.620000,
    longitude: 125.520000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-lelipang',
    name: 'Lelipang',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Lelipang menawarkan keindahan hutan Sahendaruman, air terjun yang indah, dan kopi lokal yang terkenal.',
    rating: 4.6,
    latitude: 3.640000,
    longitude: 125.540000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-palareng',
    name: 'Palareng',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Palareng menawarkan pantai Mehong dan Tanjung Melepe dengan pemandangan laut yang mempesona.',
    rating: 4.5,
    latitude: 3.560000,
    longitude: 125.470000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-utaurano',
    name: 'Utaurano',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Utaurano menawarkan keindahan alam dan budaya lokal Sangihe yang autentik.',
    rating: 4.5,
    latitude: 3.570000,
    longitude: 125.480000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-bukide-timur',
    name: 'Bukide Timur',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Bukide Timur menawarkan lokasi snorkeling yang indah dengan terumbu karang yang masih alami.',
    rating: 4.7,
    latitude: 3.590000,
    longitude: 125.510000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-lenganeng',
    name: 'Lenganeng',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Lenganeng menawarkan Museum Anggar Apapuhang dan kerajinan parang besi tradisional.',
    rating: 4.4,
    latitude: 3.610000,
    longitude: 125.530000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-pananualeng',
    name: 'Pananualeng',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Pananualeng menawarkan pantai yang indah dengan berbagai atraksi wisata bahari dan ikan segar.',
    rating: 4.6,
    latitude: 3.550000,
    longitude: 125.460000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
  {
    id: 'tourism-bebalang',
    name: 'Bebalang',
    district: 'Sangihe',
    category: 'tourism',
    description: 'Kampung Wisata Bebalang menawarkan keindahan alam dan budaya lokal yang menarik.',
    rating: 4.5,
    latitude: 3.630000,
    longitude: 125.550000,
    admissionFee: 'Rp 5.000',
    images: [],
    image: '',
  },
];

/**
 * Culinary data
 */
const culinary = [
  {
    id: 'culinary-ikan-bakar-sangihe',
    name: 'Ikan Bakar Sangihe',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Ikan segar yang dibakar dengan bumbu khas Sangihe, disajikan dengan sambal dabu-dabu dan nasi hangat. Menu favorit wisatawan dengan cita rasa laut yang autentik.',
    rating: 4.7,
    latitude: 3.609000,
    longitude: 125.489000,
    cuisineType: 'Seafood',
    priceRange: 'Rp 50.000 - Rp 150.000',
    operatingHours: '10:00 - 22:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-lapola',
    name: 'Lapola (Ikan Cakalang Roa)',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Makanan tradisional Sangihe berupa ikan cakalang yang diasap dan diolah dengan cara khas. Disajikan dengan sayur ubi dan sambal rica-rica.',
    rating: 4.6,
    latitude: 3.608000,
    longitude: 125.490000,
    cuisineType: 'Traditional',
    priceRange: 'Rp 40.000 - Rp 100.000',
    operatingHours: '08:00 - 20:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-papeda-sagu',
    name: 'Papeda Sagu dengan Kuah Ikan',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Papeda yang terbuat dari sagu lokal, disajikan dengan kuah ikan segar dan sayuran. Hidangan khas yang menggugah selera dengan tekstur unik.',
    rating: 4.5,
    latitude: 3.607000,
    longitude: 125.491000,
    cuisineType: 'Traditional',
    priceRange: 'Rp 30.000 - Rp 80.000',
    operatingHours: '07:00 - 19:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-kopi-sangihe',
    name: 'Kopi Sangihe',
    district: 'Lelipang',
    category: 'culinary',
    description: 'Kopi lokal Sangihe yang terkenal dengan aroma harum dan rasa yang khas. Ditanam di lereng gunung dengan ketinggian optimal, menghasilkan kopi berkualitas premium.',
    rating: 4.8,
    latitude: 3.640000,
    longitude: 125.540000,
    cuisineType: 'Beverage',
    priceRange: 'Rp 15.000 - Rp 50.000',
    operatingHours: '06:00 - 18:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-cakalang-fufu',
    name: 'Cakalang Fufu',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Ikan cakalang yang diasap dengan teknik tradisional, kemudian diolah menjadi hidangan lezat. Biasanya disajikan dengan sayur gedi dan nasi putih.',
    rating: 4.6,
    latitude: 3.606000,
    longitude: 125.492000,
    cuisineType: 'Traditional',
    priceRange: 'Rp 45.000 - Rp 120.000',
    operatingHours: '09:00 - 21:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-kue-sagu-sangihe',
    name: 'Kue Sagu Sangihe',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Kue tradisional yang terbuat dari sagu lokal dengan berbagai varian rasa. Camilan khas yang cocok dinikmati sambil menikmati pemandangan pantai.',
    rating: 4.4,
    latitude: 3.605000,
    longitude: 125.493000,
    cuisineType: 'Snack',
    priceRange: 'Rp 10.000 - Rp 30.000',
    operatingHours: '08:00 - 20:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-ubud-udang',
    name: 'Ubud Udang Sangihe',
    district: 'Pananualeng',
    category: 'culinary',
    description: 'Hidangan udang segar yang diolah dengan bumbu rempah khas, disajikan dengan nasi dan sayur segar. Lokasi tepat di tepi pantai dengan pemandangan yang menawan.',
    rating: 4.7,
    latitude: 3.550000,
    longitude: 125.460000,
    cuisineType: 'Seafood',
    priceRange: 'Rp 60.000 - Rp 180.000',
    operatingHours: '11:00 - 22:00',
    images: [],
    image: '',
  },
  {
    id: 'culinary-bubur-manado-sangihe',
    name: 'Bubur Manado Sangihe',
    district: 'Tahuna',
    category: 'culinary',
    description: 'Bubur khas Manado yang diadaptasi dengan rasa lokal Sangihe. Berisi sayuran segar, ikan, dan bumbu rempah yang membuatnya menjadi hidangan yang sehat dan lezat.',
    rating: 4.5,
    latitude: 3.604000,
    longitude: 125.494000,
    cuisineType: 'Traditional',
    priceRange: 'Rp 25.000 - Rp 60.000',
    operatingHours: '06:00 - 18:00',
    images: [],
    image: '',
  },
];

/**
 * Events data
 */
const events = [
  {
    id: 'event-festival-bahari-sangihe',
    name: 'Festival Bahari Sangihe',
    district: 'Tahuna',
    category: 'event',
    description: 'Festival tahunan yang menampilkan keindahan bahari Sangihe dengan berbagai atraksi budaya, lomba perahu tradisional, kuliner seafood, dan pertunjukan seni budaya lokal.',
    rating: 4.8,
    latitude: 3.609000,
    longitude: 125.489000,
    startDate: '2024-07-15',
    endDate: '2024-07-20',
    venue: 'Pantai Tahuna',
    operatingHours: '08:00 - 22:00',
    images: [],
    image: '',
  },
  {
    id: 'event-pesta-adat-tulude',
    name: 'Pesta Adat Tulude',
    district: 'Sangihe',
    category: 'event',
    description: 'Perayaan adat tahunan masyarakat Sangihe yang penuh makna. Menampilkan tarian tradisional, musik bambu, dan ritual adat yang melestarikan budaya leluhur.',
    rating: 4.7,
    latitude: 3.600000,
    longitude: 125.500000,
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    venue: 'Desa Hesang',
    operatingHours: '07:00 - 23:00',
    images: [],
    image: '',
  },
  {
    id: 'event-lomba-dayung-tradisional',
    name: 'Lomba Dayung Perahu Tradisional',
    district: 'Tahuna',
    category: 'event',
    description: 'Kompetisi dayung perahu tradisional antar desa yang menunjukkan kekuatan dan kebersamaan masyarakat Sangihe. Acara yang meriah dengan semangat gotong royong.',
    rating: 4.6,
    latitude: 3.609000,
    longitude: 125.489000,
    startDate: '2024-08-17',
    endDate: '2024-08-17',
    venue: 'Teluk Tahuna',
    operatingHours: '07:00 - 17:00',
    images: [],
    image: '',
  },
  {
    id: 'event-festival-kopi-sangihe',
    name: 'Festival Kopi Sangihe',
    district: 'Lelipang',
    category: 'event',
    description: 'Festival yang mempromosikan kopi lokal Sangihe dengan berbagai aktivitas seperti cupping session, pameran produk kopi, dan workshop pembuatan kopi.',
    rating: 4.7,
    latitude: 3.640000,
    longitude: 125.540000,
    startDate: '2024-09-10',
    endDate: '2024-09-12',
    venue: 'Desa Lelipang',
    operatingHours: '08:00 - 20:00',
    images: [],
    image: '',
  },
  {
    id: 'event-pentas-seni-budaya',
    name: 'Pentas Seni Budaya Sangihe',
    district: 'Tahuna',
    category: 'event',
    description: 'Pertunjukan seni budaya yang menampilkan tarian tradisional, musik bambu, lagu daerah, dan teater rakyat. Menggambarkan kekayaan budaya masyarakat Sangihe.',
    rating: 4.6,
    latitude: 3.608000,
    longitude: 125.490000,
    startDate: '2024-10-05',
    endDate: '2024-10-07',
    venue: 'Aula Kantor Bupati',
    operatingHours: '18:00 - 22:00',
    images: [],
    image: '',
  },
  {
    id: 'event-lomba-foto-wisata',
    name: 'Lomba Foto Wisata Sangihe',
    district: 'Sangihe',
    category: 'event',
    description: 'Kompetisi fotografi yang mengajak peserta menangkap keindahan alam dan budaya Sangihe. Terbuka untuk fotografer amatir dan profesional dengan hadiah menarik.',
    rating: 4.5,
    latitude: 3.609000,
    longitude: 125.489000,
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    venue: 'Seluruh Kabupaten Sangihe',
    operatingHours: '24 Jam',
    images: [],
    image: '',
  },
  {
    id: 'event-festival-mangrove',
    name: 'Festival Mangrove dan Konservasi',
    district: 'Hesang',
    category: 'event',
    description: 'Acara edukasi dan konservasi lingkungan yang menampilkan keindahan hutan mangrove Hesang. Termasuk penanaman pohon, edukasi lingkungan, dan pameran produk lokal.',
    rating: 4.6,
    latitude: 3.600000,
    longitude: 125.500000,
    startDate: '2024-06-05',
    endDate: '2024-06-07',
    venue: 'Kampung Wisata Hesang',
    operatingHours: '08:00 - 18:00',
    images: [],
    image: '',
  },
  {
    id: 'event-natal-dan-tahun-baru',
    name: 'Perayaan Natal dan Tahun Baru Sangihe',
    district: 'Tahuna',
    category: 'event',
    description: 'Perayaan keagamaan dan tahun baru yang meriah dengan berbagai pertunjukan, pesta kembang api, dan acara kebersamaan masyarakat. Suasana yang hangat dan penuh sukacita.',
    rating: 4.7,
    latitude: 3.609000,
    longitude: 125.489000,
    startDate: '2024-12-24',
    endDate: '2025-01-01',
    venue: 'Kota Tahuna',
    operatingHours: '18:00 - 01:00',
    images: [],
    image: '',
  },
];

/**
 * Hotels data
 */
const hotels = [
  {
    id: 'hotel-tahuna-beach',
    name: 'Tahuna Beach Hotel',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Hotel tepi pantai dengan pemandangan laut yang menakjubkan dan fasilitas lengkap untuk kenyamanan tamu.',
    rating: 4.5,
    latitude: 3.609000,
    longitude: 125.489000,
    starRating: 4,
    priceRange: 'Rp 500.000 - Rp 2.000.000',
    amenities: ['WiFi', 'Parkir', 'Restoran', 'Air Conditioning', 'Kolam Renang'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-bintang-utara',
    name: 'Hotel Bintang Utara',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Hotel nyaman di jantung kota dengan akses mudah ke berbagai tempat wisata.',
    rating: 4.2,
    latitude: 3.608000,
    longitude: 125.490000,
    starRating: 3,
    priceRange: 'Rp 300.000 - Rp 1.500.000',
    amenities: ['WiFi', 'Parkir', 'Restoran', 'Air Conditioning'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-hayana',
    name: 'Hotel Hayana',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Hotel modern dengan pelayanan ramah dan fasilitas memadai.',
    rating: 4.3,
    latitude: 3.607000,
    longitude: 125.491000,
    starRating: 3,
    priceRange: 'Rp 400.000 - Rp 1.800.000',
    amenities: ['WiFi', 'Parkir', 'Restoran', 'Air Conditioning'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-madina',
    name: 'Hotel Madina',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Hotel dengan desain Islami dan suasana yang tenang serta nyaman.',
    rating: 4.4,
    latitude: 3.606000,
    longitude: 125.492000,
    starRating: 3,
    priceRange: 'Rp 350.000 - Rp 1.600.000',
    amenities: ['WiFi', 'Parkir', 'Restoran', 'Air Conditioning', 'Tempat Sholat'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-mafana-seaside',
    name: 'Mafana Seaside Hotel',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Hotel tepi pantai dengan konsep modern dan pemandangan laut yang menawan.',
    rating: 4.6,
    latitude: 3.605000,
    longitude: 125.493000,
    starRating: 4,
    priceRange: 'Rp 450.000 - Rp 2.200.000',
    amenities: ['WiFi', 'Parkir', 'Restoran', 'Air Conditioning', 'Kolam Renang', 'Beach Access'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-penginapan-setia',
    name: 'Penginapan Setia',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Penginapan yang nyaman dengan harga terjangkau dan pelayanan ramah.',
    rating: 4.1,
    latitude: 3.604000,
    longitude: 125.494000,
    starRating: 2,
    priceRange: 'Rp 200.000 - Rp 800.000',
    amenities: ['WiFi', 'Parkir', 'Air Conditioning'],
    images: [],
    image: '',
  },
  {
    id: 'hotel-wisma-melia',
    name: 'Wisma Melia',
    district: 'Tahuna',
    category: 'hotel',
    description: 'Wisma yang nyaman dengan fasilitas standar dan lokasi strategis.',
    rating: 4.0,
    latitude: 3.603000,
    longitude: 125.495000,
    starRating: 2,
    priceRange: 'Rp 250.000 - Rp 1.000.000',
    amenities: ['WiFi', 'Parkir', 'Air Conditioning'],
    images: [],
    image: '',
  },
];

// Map tourism destinations to their folders
const tourismFolders = {
  'tourism-batuwingkung': 'DINAS PARIWISATA/BATUWINGKUNG',
  'tourism-hesang': 'DINAS PARIWISATA/HESANG',
  'tourism-kuma': 'DINAS PARIWISATA/KUMA',
  'tourism-laine': 'DINAS PARIWISATA/LAINE',
  'tourism-lelipang': 'DINAS PARIWISATA/LELIPANG',
  'tourism-palareng': 'DINAS PARIWISATA/Palareng',
  'tourism-utaurano': 'DINAS PARIWISATA/UTAURANO',
  'tourism-bukide-timur': 'DINAS PARIWISATA/Bukide Timur',
  'tourism-lenganeng': 'DINAS PARIWISATA/LENGANENG',
  'tourism-pananualeng': 'DINAS PARIWISATA/pananualeng',
  'tourism-bebalang': 'DINAS PARIWISATA/bebalang',
};

// Map hotels to their folders
const hotelFolders = {
  'hotel-tahuna-beach': 'Tahuna Beach Hotel',
  'hotel-bintang-utara': 'Hotel Bintang Utara',
  'hotel-hayana': 'Hotel Hayana',
  'hotel-madina': 'Hotel Madina',
  'hotel-mafana-seaside': 'Mafana Seaside Hotell',
  'hotel-penginapan-setia': 'Penginapan Setia',
  'hotel-wisma-melia': 'Wisma Melia',
};

// Map culinary to their folders (if folders exist)
const culinaryFolders = {
  // Add mappings here if you have culinary folders
};

// Map events to their folders (if folders exist)
const eventFolders = {
  // Add mappings here if you have event folders
};

/**
 * Load images for all items
 */
function loadImagesForItems() {
  console.log('📸 Loading images for tourism destinations...\n');
  
  // Load tourism images
  for (const dest of tourismDestinations) {
    const folder = tourismFolders[dest.id];
    if (folder) {
      const fullPath = path.join(basePath, folder);
      const images = readImagesFromDir(fullPath);
      
      if (images.length > 0) {
        dest.images = images;
        dest.image = images[0]; // First image as main image
        console.log(`  ✓ Loaded ${images.length} images for ${dest.name}`);
      } else {
        console.warn(`  ⚠ No images found for ${dest.name}`);
      }
    }
  }
  
  console.log('\n📸 Loading images for hotels...\n');
  
  // Load hotel images
  for (const hotel of hotels) {
    const folder = hotelFolders[hotel.id];
    if (folder) {
      const fullPath = path.join(basePath, folder);
      const images = readImagesFromDir(fullPath);
      
      if (images.length > 0) {
        hotel.images = images;
        hotel.image = images[0]; // First image as main image
        console.log(`  ✓ Loaded ${images.length} images for ${hotel.name}`);
      } else {
        console.warn(`  ⚠ No images found for ${hotel.name}`);
      }
    }
  }
  
  console.log('\n📸 Loading images for culinary...\n');
  
  // Load culinary images
  for (const item of culinary) {
    const folder = culinaryFolders[item.id];
    if (folder) {
      const fullPath = path.join(basePath, folder);
      const images = readImagesFromDir(fullPath);
      
      if (images.length > 0) {
        item.images = images;
        item.image = images[0]; // First image as main image
        console.log(`  ✓ Loaded ${images.length} images for ${item.name}`);
      } else {
        console.warn(`  ⚠ No images found for ${item.name}`);
      }
    }
  }
  
  console.log('\n📸 Loading images for events...\n');
  
  // Load event images
  for (const item of events) {
    const folder = eventFolders[item.id];
    if (folder) {
      const fullPath = path.join(basePath, folder);
      const images = readImagesFromDir(fullPath);
      
      if (images.length > 0) {
        item.images = images;
        item.image = images[0]; // First image as main image
        console.log(`  ✓ Loaded ${images.length} images for ${item.name}`);
      } else {
        console.warn(`  ⚠ No images found for ${item.name}`);
      }
    }
  }
}

/**
 * Upload items to Firestore
 */
async function uploadItems(category, items) {
  const collectionName = COLLECTIONS[category] || category;
  console.log(`\n📤 Uploading ${items.length} items to collection: ${collectionName}`);
  
  // Log if array is empty
  if (items.length === 0) {
    console.log(`  ⚠ Warning: No items to upload for category ${category}`);
    return { successCount: 0, skippedCount: 0, errorCount: 0 };
  }
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    try {
      // Validate required fields
      if (!item.id) {
        console.error(`  ✗ Error: Item missing id:`, item);
        errorCount++;
        continue;
      }
      if (!item.name) {
        console.error(`  ✗ Error: Item missing name:`, item.id);
        errorCount++;
        continue;
      }
      
      const docRef = doc(db, collectionName, item.id);
      
      // Check if document already exists
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        skippedCount++;
        console.log(`  ⊘ Skipped (already exists): ${item.name} (${item.id})`);
        continue;
      }
      
      // Document doesn't exist, create it
      await setDoc(docRef, {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      successCount++;
      console.log(`  ✓ Uploaded: ${item.name} (${item.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Error uploading ${item.id}:`, error.message);
      console.error(`    Full error:`, error);
    }
  }

  console.log(`\n  Summary: ${successCount} succeeded, ${skippedCount} skipped, ${errorCount} failed`);
  return { successCount, skippedCount, errorCount };
}

/**
 * Main seeding function
 */
async function seedFirestore() {
  console.log('🌱 Starting Firestore seeding from Aplikasi Pariwisata folder...\n');
  console.log('=' .repeat(60));

  try {
    // Load images for all items
    loadImagesForItems();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    
    // Upload tourism destinations
    const tourismResult = await uploadItems('tourism', tourismDestinations);
    
    // Upload hotels
    const hotelResult = await uploadItems('hotel', hotels);
    
    // Upload culinary
    console.log(`\n🔍 Debug: Culinary array has ${culinary.length} items`);
    if (culinary.length > 0) {
      console.log(`  First item: ${culinary[0].name} (${culinary[0].id})`);
    }
    const culinaryResult = await uploadItems('culinary', culinary);
    
    // Upload events
    const eventResult = await uploadItems('event', events);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Tourism:   ${tourismResult.successCount} succeeded, ${tourismResult.skippedCount} skipped, ${tourismResult.errorCount} failed`);
    console.log(`Hotels:    ${hotelResult.successCount} succeeded, ${hotelResult.skippedCount} skipped, ${hotelResult.errorCount} failed`);
    console.log(`Culinary:  ${culinaryResult.successCount} succeeded, ${culinaryResult.skippedCount} skipped, ${culinaryResult.errorCount} failed`);
    console.log(`Events:    ${eventResult.successCount} succeeded, ${eventResult.skippedCount} skipped, ${eventResult.errorCount} failed`);
    console.log('='.repeat(60));
    
    const totalSuccess = tourismResult.successCount + hotelResult.successCount + culinaryResult.successCount + eventResult.successCount;
    const totalSkipped = tourismResult.skippedCount + hotelResult.skippedCount + culinaryResult.skippedCount + eventResult.skippedCount;
    const totalError = tourismResult.errorCount + hotelResult.errorCount + culinaryResult.errorCount + eventResult.errorCount;
    
    console.log(`\n✨ Total: ${totalSuccess} items uploaded successfully`);
    if (totalSkipped > 0) {
      console.log(`⊘ Total: ${totalSkipped} items skipped (already exist)`);
    }
    if (totalError > 0) {
      console.log(`⚠️  ${totalError} items failed to upload`);
    }
    console.log('\n✅ Seeding completed!\n');
    
    // Seed admin auth with default PIN
    console.log('🔐 Seeding admin auth...');
    try {
      const adminAuthRef = doc(db, 'admin_auth', 'default');
      const adminAuthSnap = await getDoc(adminAuthRef);
      
      if (adminAuthSnap.exists()) {
        console.log('  ⊘ Admin auth already exists, skipping...');
      } else {
        await setDoc(adminAuthRef, {
          pin: '1234',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log('  ✓ Admin auth seeded with default PIN: 1234');
      }
    } catch (error) {
      console.error('  ✗ Error seeding admin auth:', error.message);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

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

