const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Coordinates mapping from user's list
const coordinatesMap = {
  // Wisata Alam
  'Air Terjun Kadadima': { lat: 3.4468730, lng: 125.6000416 },
  'Air terjun kadadima': { lat: 3.4468730, lng: 125.6000416 },
  'Air Terjun Nguralawo': { lat: 3.4928220, lng: 125.5462490 },
  'Air terjun nguralawo': { lat: 3.4928220, lng: 125.5462490 },
  'Gunung Awu': { lat: 3.6818985, lng: 125.4538565 },
  'Gunung sahendarumang': { lat: 3.4982066, lng: 125.5129939 },
  'Gunung Sahendarumang': { lat: 3.4982066, lng: 125.5129939 },
  'bowong banua': { lat: 3.3700991, lng: 125.6122869 },
  'Puncak Bowong Banua': { lat: 3.3700991, lng: 125.6122869 },
  'Bowong Banua': { lat: 3.3700991, lng: 125.6122869 },
  'Mangrove Tahuna': { lat: 3.6009298, lng: 125.5067198 },
  'Mangrove PRPM Tahuna': { lat: 3.6009298, lng: 125.5067198 },
  'Mangrov PRPM Tahuna': { lat: 3.6009298, lng: 125.5067198 },
  'kakewang': { lat: 3.6688121, lng: 125.4030491 },
  'Kakewang': { lat: 3.6688121, lng: 125.4030491 },
  'air terjun pempanikiang': { lat: 3.7002482, lng: 125.4141005 },
  'Air Terjun Pempanikiang': { lat: 3.7002482, lng: 125.4141005 },
  'mangrove talengen': { lat: 3.5912762, lng: 125.5654377 },
  'Mangrove Talengen': { lat: 3.5912762, lng: 125.5654377 },
  
  // Wisata Bahari
  'para lelle': { lat: 3.0666724, lng: 125.5013400 },
  'Para Lelle': { lat: 3.0666724, lng: 125.5013400 },
  'pantai marahi': { lat: 3.4877651, lng: 125.6690102 },
  'Pantai Malahi': { lat: 3.4877651, lng: 125.6690102 },
  'Pantai marahi': { lat: 3.4877651, lng: 125.6690102 },
  'tanjung bebu': { lat: 3.4077222, lng: 125.5334879 },
  'Tanjung Bebu': { lat: 3.4077222, lng: 125.5334879 },
  'tanjung lelapide': { lat: 3.4679429, lng: 125.4848333 },
  'Tanjung Lelapide': { lat: 3.4679429, lng: 125.4848333 },
  'pantai sapaeng': { lat: 3.5816970, lng: 125.5795039 },
  'Pantai Sapaeng': { lat: 3.5816970, lng: 125.5795039 },
  'pantai pananuareng': { lat: 3.6237452, lng: 125.5857015 },
  'Pantai Pananualeng': { lat: 3.6237452, lng: 125.5857015 },
  'Pantai Pananuareng': { lat: 3.6237452, lng: 125.5857015 },
  'gunung api banua wuhu': { lat: 3.1366977, lng: 125.4909816 },
  'Banua Wuhu': { lat: 3.1366977, lng: 125.4909816 },
  'pantai kapehetang': { lat: 3.4599103, lng: 125.4945704 },
  'Pantai Kapehetang': { lat: 3.4599103, lng: 125.4945704 },
  'pantai poa': { lat: 3.7963837, lng: 125.5666313 },
  'Pantai Poa': { lat: 3.7963837, lng: 125.5666313 },
  'pantai embuhanga': { lat: 3.6430123, lng: 125.5744101 },
  'Pantai Embuhanga': { lat: 3.6430123, lng: 125.5744101 },
  'talengen': { lat: 3.5912926, lng: 125.5659943 },
  'Talengen': { lat: 3.5912926, lng: 125.5659943 },
  
  // Wisata Buatan
  'Puncak Alfa': { lat: 3.6300475, lng: 125.5071671 },
  'Puncak Lose': { lat: 3.6285535, lng: 125.5239581 },
  'Kolam taman teletubies': { lat: 3.6203025, lng: 125.4747667 },
  'Kolam teletubies': { lat: 3.6203025, lng: 125.4747667 },
  'Kolam Teletubies': { lat: 3.6203025, lng: 125.4747667 },
  'taman teletubies manente': { lat: 3.6199203, lng: 125.4749678 },
  'camping ground glamping lose': { lat: 3.6230252, lng: 125.5296819 },
  'Glamping Lose': { lat: 3.6230252, lng: 125.5296819 },
  'boulevard tahuna': { lat: 3.6083683, lng: 125.4912096 },
  'Boulevard Tahuna': { lat: 3.6083683, lng: 125.4912096 },
  'kolam renang kolongan beha': { lat: 3.6315602, lng: 125.4305756 },
  'Kolam Kolongan Beha': { lat: 3.6315602, lng: 125.4305756 },
  'kolam renang manganitu': { lat: 3.5764528, lng: 125.5172552 },
  'Kolam Manganitu': { lat: 3.5764528, lng: 125.5172552 },
  'puncak peding bio': { lat: 3.4352696, lng: 125.5372682 },
  'Puncak Peding Bio': { lat: 3.4352696, lng: 125.5372682 },
  'Puncak Peding Bio': { lat: 3.4352696, lng: 125.5372682 },
  'puncak nawirahi': { lat: 3.4340929, lng: 125.5438939 },
  'Puncak Nawirahi': { lat: 3.4340929, lng: 125.5438939 },
  
  // Wisata Budaya
  'Makam raja bataha santiago': { lat: 3.5472541, lng: 125.4996797 },
  'Makam Raja Bataha Santiago': { lat: 3.5472541, lng: 125.4996797 },
  'Makam Raja "Tatehe Woba"': { lat: 3.6155755, lng: 125.4840532 },
  'Makam Raja Tatehe Woba': { lat: 3.6155755, lng: 125.4840532 },
  'Rumah raja manganitu': { lat: 3.5658419, lng: 125.5177310 },
  'Rumah Raja Manganitu': { lat: 3.5658419, lng: 125.5177310 },
  'Makam Raja Mocodompis': { lat: 3.5658419, lng: 125.5177310 },
  'makam raja m.h mocodompis': { lat: 3.5698279, lng: 125.5120289 },
  'Makam Raja M.H Mocodompis': { lat: 3.5698279, lng: 125.5120289 },
  
  // Kuliner
  'Mie Che Tahuna': { lat: 3.6091402, lng: 125.4898400 },
  'Teluk Tahuna': { lat: 3.6071309, lng: 125.4873258 },
  'Teluk Tahuna Food Park': { lat: 3.6071309, lng: 125.4873258 },
  'Kopi Tiam': { lat: 3.6136796, lng: 125.4632516 },
  'Kedai Oscar': { lat: 3.6097897, lng: 125.4904083 },
  'RM palo sendiri': { lat: 3.6007846, lng: 125.5052369 },
  'RM Eci Palo Sendiri': { lat: 3.6007846, lng: 125.5052369 },
  'Rumah Makan G': { lat: 3.6112235, lng: 125.5017018 },
  'Rm mahkota': { lat: 3.6116040, lng: 125.5040658 },
  'Sakaeng Solata': { lat: 3.6118536, lng: 125.5052004 },
  'mas rakidi': { lat: 3.6098319, lng: 125.4898296 },
  'rumah makan ma gina': { lat: 3.6110519, lng: 125.4907644 },
  'sri rejeki': { lat: 3.6107708, lng: 125.4910805 },
  'kue kering': { lat: 3.6102916, lng: 125.4964570 },
  
  // Event
  'Festival Seni Budaya Sangihe 2025': { lat: 3.6084831, lng: 125.4899989 },
  'Seke maneke': { lat: 3.0668890, lng: 125.5004384 },
  'Seke Maneke 2025': { lat: 3.0668890, lng: 125.5004384 },
  'Seke Maneke': { lat: 3.0668890, lng: 125.5004384 },
  'sangihe idol 2': { lat: 3.6141303, lng: 125.4669695 },
  'Sangihe Idol 2025': { lat: 3.6141303, lng: 125.4669695 },
  'tulude 2026': { lat: 3.6096428, lng: 125.5075721 },
  'Tulude 2026': { lat: 3.6096428, lng: 125.5075721 },
  'Tulude': { lat: 3.6096428, lng: 125.5075721 },
};

function normalizeName(name) {
  return name.toLowerCase().trim();
}

function findCoordinates(name) {
  const normalized = normalizeName(name);
  for (const [key, coords] of Object.entries(coordinatesMap)) {
    if (normalizeName(key) === normalized) {
      return coords;
    }
  }
  return null;
}

function getImageFiles(dir, projectRoot) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .map(file => {
      const fullPath = path.join(dir, file);
      return path.relative(projectRoot, fullPath).replace(/\\/g, '/');
    });
}

function getDocFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const docFile = files.find(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.docx', '.doc', '.pdf'].includes(ext);
  });
  return docFile ? { path: path.join(dir, docFile), ext: path.extname(docFile).toLowerCase() } : null;
}

async function extractDocumentContent(filePath, fileExt) {
  try {
    if (!fs.existsSync(filePath)) return null;
    
    if (fileExt === '.pdf') {
      // pdf-parse v2 uses PDFParse class
      const pdfParseModule = await import('pdf-parse');
      const PDFParse = pdfParseModule.PDFParse;
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      return result.text;
    } else if (['.docx', '.doc'].includes(fileExt)) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading document file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Normalize price range to format: 'Rp xxx.xxx - Rp xxx.xxx'
 * Handles various input formats and converts them to the standard format
 */
function normalizePriceRange(priceRange) {
  if (!priceRange || typeof priceRange !== 'string') {
    return undefined;
  }
  
  // Remove extra whitespace
  let normalized = priceRange.trim();
  
  // Remove period after Rp (Rp. -> Rp)
  normalized = normalized.replace(/Rp\./g, 'Rp');
  
  // Handle cases where there's no space after Rp
  normalized = normalized.replace(/Rp([0-9])/g, 'Rp $1');
  
  // Extract numbers and format them
  // Pattern: matches "Rp" followed by numbers, optional dash, and more numbers
  const priceMatch = normalized.match(/Rp\s*([0-9.,]+)(?:\s*-\s*Rp\s*([0-9.,]+))?/i);
  
  if (priceMatch) {
    const minPrice = priceMatch[1].replace(/[.,]/g, '');
    const maxPrice = priceMatch[2] ? priceMatch[2].replace(/[.,]/g, '') : null;
    
    // Format with dots as thousand separators
    const formatNumber = (num) => {
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    
    if (maxPrice) {
      return `Rp ${formatNumber(minPrice)} - Rp ${formatNumber(maxPrice)}`;
    } else {
      return `Rp ${formatNumber(minPrice)}`;
    }
  }
  
  // Try to extract any price-like pattern and reformat
  const anyPriceMatch = normalized.match(/([0-9.,]+)\s*-\s*([0-9.,]+)/);
  if (anyPriceMatch) {
    const minPrice = anyPriceMatch[1].replace(/[.,]/g, '');
    const maxPrice = anyPriceMatch[2].replace(/[.,]/g, '');
    const formatNumber = (num) => {
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    return `Rp ${formatNumber(minPrice)} - Rp ${formatNumber(maxPrice)}`;
  }
  
  // If we can't parse it, return undefined
  return undefined;
}

function parseDocxContent(text) {
  if (!text) return {};
  
  const info = {
    description: '',
    district: 'Sangihe', // Default
    rating: 4.5, // Default
    admissionFee: undefined,
    priceRange: undefined,
    cuisineType: undefined,
    starRating: undefined,
    venue: undefined,
    operatingHours: undefined,
  };
  
  // Clean up text - remove common PDF artifacts and page markers
  let cleanedText = text
    // Remove page markers like "-- 1 of 2 --", "-- 2 of 2 --"
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    // Remove common PDF artifacts
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/^\d+$/gm, '') // Remove standalone page numbers
    .replace(/^\s*-\s*$/gm, '') // Remove lines with just dashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Extract description (usually the main content)
  // Try to find common patterns
  const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for district information (Kecamatan, Kabupaten, etc.)
  const districtPatterns = [
    /(?:Kecamatan|Kec\.|Kabupaten|Kab\.|Kota)\s*:?\s*([^\n,]+)/i,
    /(?:Lokasi|Alamat)[\s:]+[^\n]*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  ];
  
  for (const pattern of districtPatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      info.district = match[1].trim();
      break;
    }
  }
  
  // Extract description - take the longest paragraph or all text if no clear structure
  // Filter out meaningless content (just markers, very short text, etc.)
  const paragraphs = cleanedText.split(/\n\s*\n/).filter(p => {
    const trimmed = p.trim();
    // Filter out very short paragraphs, page markers, and meaningless content
    return trimmed.length > 20 && 
           !/^[-–—\s]*$/.test(trimmed) && // Not just dashes
           !/^--\s*\d+/.test(trimmed) && // Not page markers
           !/^\d+$/.test(trimmed); // Not just numbers
  });
  
  if (paragraphs.length > 0) {
    // Use the longest paragraph as description, or combine first few paragraphs
    const description = paragraphs
      .slice(0, 3)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Only use if it's meaningful (not just artifacts)
    if (description.length > 30 && !/^[-–—\s]*$/.test(description)) {
      info.description = description;
    }
  } else if (cleanedText.length > 30) {
    // If no clear paragraphs but text is long enough, use the whole text (cleaned up)
    const description = cleanedText.replace(/\s+/g, ' ').trim();
    if (!/^[-–—\s]*$/.test(description)) {
      info.description = description;
    }
  }
  
  // If description is still empty or just artifacts, don't set it (will use default)
  if (info.description && (info.description.length < 30 || /^[-–—\s]*$/.test(info.description))) {
    info.description = ''; // Will fall back to default in the calling code
  }
  
  // Look for admission fee
  const admissionPatterns = [
    /(?:Tiket|Harga\s+Tiket|Biaya\s+Masuk|Admission)[\s:]+([^\n]+)/i,
    /(?:Rp|IDR)[\s:]*([0-9.,]+(?:\s*-\s*[0-9.,]+)?)/i,
  ];
  
  for (const pattern of admissionPatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      info.admissionFee = match[1].trim();
      break;
    }
  }
  
  // Look for price range
  const pricePatterns = [
    /(?:Harga|Price|Range)[\s:]+([^\n]+)/i,
    /Rp\s*\.?\s*([0-9.,]+(?:\s*-\s*Rp\s*\.?\s*[0-9.,]+)?)/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      const rawPriceRange = match[1].trim();
      info.priceRange = normalizePriceRange(rawPriceRange);
      if (info.priceRange) {
        break;
      }
    }
  }
  
  // Look for operating hours
  const hoursPatterns = [
    /(?:Jam\s+Buka|Operating\s+Hours|Buka)[\s:]+([^\n]+)/i,
    /(?:Senin|Monday|Selasa|Tuesday|Rabu|Wednesday|Kamis|Thursday|Jumat|Friday|Sabtu|Saturday|Minggu|Sunday)[\s:]+([^\n]+)/i,
  ];
  
  for (const pattern of hoursPatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      info.operatingHours = match[1].trim();
      break;
    }
  }
  
  // Look for rating
  const ratingMatch = cleanedText.match(/(?:Rating|Bintang)[\s:]+([0-9.]+)/i);
  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[1]);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      info.rating = rating;
    }
  }
  
  // Look for star rating (for hotels)
  const starMatch = cleanedText.match(/(?:Bintang|Star)[\s:]+([0-9]+)/i);
  if (starMatch) {
    const stars = parseInt(starMatch[1]);
    if (!isNaN(stars) && stars >= 1 && stars <= 5) {
      info.starRating = stars;
    }
  }
  
  // Look for venue (for events)
  const venueMatch = cleanedText.match(/(?:Venue|Tempat|Lokasi\s+Acara)[\s:]+([^\n]+)/i);
  if (venueMatch) {
    info.venue = venueMatch[1].trim();
  }
  
  // Look for cuisine type
  const cuisineMatch = cleanedText.match(/(?:Jenis\s+Makanan|Cuisine|Masakan)[\s:]+([^\n]+)/i);
  if (cuisineMatch) {
    info.cuisineType = cuisineMatch[1].trim();
  }
  
  return info;
}

/**
 * Clean up item data fields - second pass cleanup
 * Removes misplaced text from district, operatingHours, admissionFee, and cuisineType
 * Returns: { item: cleanedItem, stats: { descriptionDeduplicated: boolean, admissionFeeCleaned: boolean } }
 */
function cleanupItemData(item) {
  const cleaned = { ...item };
  const itemStats = {
    descriptionDeduplicated: false,
    admissionFeeCleaned: false,
  };
  
  // 1) DISTRICT FIELD CLEANUP
  if (cleaned.district) {
    let district = cleaned.district.trim();
    
    // Specific fixes by id
    if (cleaned.id === 'tourism_puncak_bowong_banua') {
      // Extract "Manganitu Selatan" from text like "Manganitu Selatan dengan koordinat..."
      const match = district.match(/^(Manganitu Selatan)/i);
      if (match) {
        district = 'Manganitu Selatan';
      }
    } else if (cleaned.id === 'culinary_rm_om_robert') {
      // Extract "Dumuhung" from long string
      const match = district.match(/Dumuhung/i);
      if (match) {
        district = 'Dumuhung';
        // Move the rest to description
        const extraText = cleaned.district.replace(/.*?Dumuhung\s*/i, '').trim();
        if (extraText) {
          cleaned.description = (cleaned.description || '') + '\n\n' + extraText;
        }
      }
    } else if (cleaned.id === 'culinary_sakaeng_solata') {
      // Keep only "Kepulauan Sangihe"
      if (district.includes('Kepulauan Sangihe')) {
        const extraText = district.replace(/^Kepulauan Sangihe\.?\s*/i, '').trim();
        district = 'Kepulauan Sangihe';
        if (extraText) {
          cleaned.description = (cleaned.description || '') + '\n\n' + extraText;
        }
      }
    } else if (cleaned.id === 'tourism_glamping_lose' || cleaned.id === 'tourism_camping_ground_glamping_lose') {
      // Keep only "Kepulauan Sangihe"
      if (district.includes('Kepulauan Sangihe')) {
        const extraText = district.replace(/^Kepulauan Sangihe\.?\s*/i, '').trim();
        district = 'Kepulauan Sangihe';
        if (extraText) {
          cleaned.description = (cleaned.description || '') + '\n\n' + extraText;
        }
      }
    } else if (cleaned.id === 'tourism_makam_raja_tatehe_woba') {
      // Remove trailing parenthesis
      district = district.replace(/\)$/, '').trim();
      if (district.endsWith('Tahuna')) {
        district = 'Tahuna';
      }
    } else if (cleaned.id === 'tourism_tulude' || cleaned.id === 'event_tulude_2026') {
      // Keep only "Kepulauan Sangihe"
      if (district.includes('Kepulauan Sangihe')) {
        const extraText = district.replace(/^Kepulauan Sangihe[^.]*\.?\s*/i, '').trim();
        district = 'Kepulauan Sangihe';
        if (extraText) {
          cleaned.description = (cleaned.description || '') + '\n\n' + extraText;
        }
      }
    } else if (cleaned.id === 'event_sangihe_idol_2025' || cleaned.id === 'event_sangihe_idol_2') {
      // Keep only "Tahuna"
      if (district.includes('Tahuna')) {
        const extraText = district.replace(/^Tahuna\.?\s*/i, '').trim();
        district = 'Tahuna';
        if (extraText) {
          cleaned.description = (cleaned.description || '') + '\n\n' + extraText;
        }
      }
    }
    
    // General cleanup: if district contains sentence delimiters, keep only the first part
    if (district.includes('. ') || district.includes('Alamat') || district.includes('Lokasi') || district.includes('koordinat')) {
      // Split at first period, "Alamat", "Lokasi", or "koordinat"
      const separators = ['. ', ' Alamat', ' Lokasi', ' koordinat'];
      let firstPart = district;
      let restPart = '';
      
      for (const sep of separators) {
        const index = district.indexOf(sep);
        if (index > 0) {
          firstPart = district.substring(0, index).trim();
          restPart = district.substring(index + sep.length).trim();
          break;
        }
      }
      
      // Keep only meaningful location name (first part)
      district = firstPart;
      
      // Move rest to description if it's meaningful
      if (restPart && restPart.length > 10) {
        cleaned.description = (cleaned.description || '') + '\n\n' + restPart;
      }
    }
    
    cleaned.district = district;
  }
  
  // 2) OPERATING HOURS MISUSED AS DESCRIPTION
  if (cleaned.operatingHours && cleaned.operatingHours.trim()) {
    const hours = cleaned.operatingHours.trim();
    // Check if it contains any digits (0-9)
    if (!/\d/.test(hours)) {
      // No digits = not a time range, move to description
      cleaned.description = (cleaned.description || '') + '\n\n' + hours;
      cleaned.operatingHours = '';
    } else if (hours.length > 100) {
      // Even if it has digits, if it's too long (>100 chars), it's probably descriptive text with time mentioned
      // Try to extract just the time part (e.g., "09:00-23:00" or "Senin-Sabtu 06:00-02:00")
      const timePattern = /(?:Senin|Monday|Selasa|Tuesday|Rabu|Wednesday|Kamis|Thursday|Jumat|Friday|Sabtu|Saturday|Minggu|Sunday)?\s*[–-]?\s*(?:Senin|Monday|Selasa|Tuesday|Rabu|Wednesday|Kamis|Thursday|Jumat|Friday|Sabtu|Saturday|Minggu|Sunday)?\s*[:\d\s–-]+(?:WITA|WIB|AM|PM)?/i;
      const timeMatch = hours.match(timePattern);
      if (timeMatch && timeMatch[0].length < 80) {
        // Found a reasonable time pattern, keep only that
        cleaned.operatingHours = timeMatch[0].trim();
        // Move the rest to description
        const restText = hours.replace(timeMatch[0], '').trim();
        if (restText && restText.length > 10) {
          cleaned.description = (cleaned.description || '') + '\n\n' + restText;
        }
      } else {
        // No clear time pattern, move all to description
        cleaned.description = (cleaned.description || '') + '\n\n' + hours;
        cleaned.operatingHours = '';
      }
    }
  }
  
  // 3) ADMISSION FEE TOO LONG / MIXED WITH FACILITIES
  if (cleaned.admissionFee && cleaned.admissionFee.trim()) {
    const fee = cleaned.admissionFee.trim();
    
    // Check if it's too long (>160 chars) or contains "Fasilitas"
    if (fee.length > 160 || /Fasilitas|fasilitas/i.test(fee)) {
      let feePart = fee;
      let extraPart = '';
      
      // Priority: Split at "Fasilitas" if present
      const fasilitasIndex = fee.search(/Fasilitas|fasilitas/i);
      if (fasilitasIndex > 0) {
        // Find the period or line break before "Fasilitas" if possible
        const beforeFasilitas = fee.substring(0, fasilitasIndex);
        const lastPeriod = beforeFasilitas.lastIndexOf('. ');
        const lastNewline = beforeFasilitas.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > 0) {
          feePart = fee.substring(0, breakPoint + (lastPeriod > lastNewline ? 2 : 1)).trim();
          extraPart = fee.substring(breakPoint + (lastPeriod > lastNewline ? 2 : 1)).trim();
        } else {
          // Split right before "Fasilitas"
          feePart = beforeFasilitas.trim();
          extraPart = fee.substring(fasilitasIndex).trim();
        }
      } else if (fee.length > 160) {
        // No "Fasilitas" but too long - use first sentence
        const firstPeriod = fee.indexOf('. ');
        if (firstPeriod > 0 && firstPeriod < 120) {
          feePart = fee.substring(0, firstPeriod + 1).trim();
          extraPart = fee.substring(firstPeriod + 2).trim();
        } else {
          // No period found, skip this item (don't modify)
          return cleaned;
        }
      }
      
      // Set cleaned values
      cleaned.admissionFee = feePart;
      if (extraPart && extraPart.length > 10) {
        cleaned.description = (cleaned.description || '') + '\n\n' + extraPart;
      }
    }
  }
  
  // 4) CUISINE TYPE TOO LONG / MISUSED
  if (cleaned.category === 'culinary' && cleaned.cuisineType && cleaned.cuisineType.trim()) {
    const cuisine = cleaned.cuisineType.trim();
    
    // Check if it's too long (>80 chars) or contains descriptive phrases
    if (cuisine.length > 80 || /Keunggulan|Catatan|Alamat|Lokasi/i.test(cuisine)) {
      // Move to description
      cleaned.description = (cleaned.description || '') + '\n\n' + cuisine;
      
      // Try to infer a short label
      let shortLabel = 'Lokal';
      if (/Chinese|Cina|Tionghoa/i.test(cuisine)) {
        shortLabel = 'Lokal dan Chinese food';
      } else if (/Seafood|Ikan|Laut/i.test(cuisine)) {
        shortLabel = 'Seafood';
      } else if (/Sangihe/i.test(cuisine)) {
        shortLabel = 'Local Sangihe';
      }
      
      cleaned.cuisineType = shortLabel;
    }
  }
  
  // Clean up description - remove duplicate leading text and deduplicate paragraphs
  if (cleaned.description) {
    // Remove any duplicate item name at the start
    const namePattern = new RegExp(`^${cleaned.name}\\s+`, 'i');
    cleaned.description = cleaned.description.replace(namePattern, '').trim();
    
    // Remove duplicate paragraphs - exact match while preserving order
    // Split by double newlines first, then also check for long duplicate phrases
    let paragraphs = cleaned.description.split(/\n\s*\n/);
    const originalCount = paragraphs.filter(p => p.trim().length > 0).length;
    const uniqueParagraphs = [];
    const seen = new Set();
    
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed.length === 0) continue;
      
      // Use exact trimmed text for comparison
      if (!seen.has(trimmed)) {
        uniqueParagraphs.push(trimmed);
        seen.add(trimmed);
      }
    }
    
    // Also check for duplicate long phrases/sentences within the text
    let finalDescription = uniqueParagraphs.join('\n\n');
    const originalDescLength = finalDescription.length;
    
    // Find and remove duplicate long phrases (150+ chars) that appear verbatim
    // Look for exact duplicate substrings - check from longest to shortest
    let maxIterations = 10; // Prevent infinite loops
    let iterations = 0;
    
    while (iterations < maxIterations) {
      let foundDuplicate = false;
      
      // Check for duplicate substrings of various lengths
      for (let len = 250; len >= 150 && !foundDuplicate; len -= 25) {
        for (let i = 0; i <= finalDescription.length - len && !foundDuplicate; i++) {
          const substring = finalDescription.substring(i, i + len);
          const lastIndex = finalDescription.lastIndexOf(substring);
          
          // Found duplicate if it appears again later in the text
          if (lastIndex > i + 50) { // Ensure it's not just overlapping
            // Check if it's at a reasonable boundary (newline, period, or start/end)
            const beforeFirst = i > 0 ? finalDescription[i - 1] : '\n';
            const afterFirst = i + len < finalDescription.length ? finalDescription[i + len] : '\n';
            const beforeSecond = lastIndex > 0 ? finalDescription[lastIndex - 1] : '\n';
            const afterSecond = lastIndex + len < finalDescription.length ? finalDescription[lastIndex + len] : '\n';
            
            // Prefer boundaries at newlines, periods, or sentence endings
            const isGoodBoundary = /[\n.]/.test(beforeFirst) || /[\n.]/.test(afterFirst) ||
                                   /[\n.]/.test(beforeSecond) || /[\n.]/.test(afterSecond) ||
                                   i === 0 || lastIndex + len === finalDescription.length;
            
            if (isGoodBoundary) {
              // Remove the second occurrence
              // Try to find a complete sentence boundary to avoid cutting mid-sentence
              let removeStart = lastIndex;
              let removeEnd = lastIndex + len;
              
              // Extend backwards to find sentence start (period, newline, or start of text)
              while (removeStart > 0 && !/[.\n]/.test(finalDescription[removeStart - 1]) && removeStart > lastIndex - 50) {
                removeStart--;
              }
              
              // Extend forwards to find sentence end (period, newline, or end of text)
              while (removeEnd < finalDescription.length && !/[.\n]/.test(finalDescription[removeEnd]) && removeEnd < lastIndex + len + 50) {
                removeEnd++;
              }
              
              // If we extended, make sure we're removing a complete phrase
              if (removeStart < lastIndex || removeEnd > lastIndex + len) {
                // Check if the extended section is still a duplicate or just similar
                const extendedSubstring = finalDescription.substring(removeStart, removeEnd);
                const firstOccurrence = finalDescription.indexOf(extendedSubstring);
                if (firstOccurrence >= 0 && firstOccurrence < lastIndex - 10) {
                  // Extended section is also duplicated, remove it
                  finalDescription = finalDescription.substring(0, removeStart) + finalDescription.substring(removeEnd);
                } else {
                  // Just remove the original duplicate
                  finalDescription = finalDescription.substring(0, lastIndex) + finalDescription.substring(lastIndex + len);
                }
              } else {
                // Remove the second occurrence
                finalDescription = finalDescription.substring(0, lastIndex) + finalDescription.substring(lastIndex + len);
              }
              
              itemStats.descriptionDeduplicated = true;
              foundDuplicate = true;
              break;
            }
          }
        }
      }
      
      if (!foundDuplicate) break; // No more duplicates found
      iterations++;
    }
    
    // If we removed duplicates, the length should be shorter
    if (finalDescription.length < originalDescLength) {
      itemStats.descriptionDeduplicated = true;
    }
    
    const uniqueCount = uniqueParagraphs.length;
    if (uniqueCount < originalCount) {
      itemStats.descriptionDeduplicated = true;
    }
    
    // Final cleanup: remove orphaned fragments and trailing artifacts
    finalDescription = finalDescription
      .replace(/\n\n\.\s*$/g, '') // Remove trailing ".\n\n"
      .replace(/\n\.\s*$/g, '') // Remove trailing ".\n"
      .replace(/^\s*\.\s*/g, '') // Remove leading "."
      .replace(/\s{3,}/g, ' ') // Normalize multiple spaces
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();
    
    // Remove orphaned sentence fragments at the end
    // Look for patterns like "\n\ncin saat hujan" or "\n\nword" (fragments starting with lowercase or period)
    finalDescription = finalDescription.replace(/\n\n(?:\.\s*)?[a-z][^\n]{0,50}(?:\n|$)/g, (match) => {
      // If it's a fragment starting with lowercase or period, remove it
      const fragment = match.replace(/\n\n/g, '').replace(/^\.\s*/, '').trim();
      if (fragment.length < 50 && /^[a-z]/.test(fragment) && !/[.!?]$/.test(fragment)) {
        return '';
      }
      return match;
    });
    
    // Also remove fragments that are duplicates of text that appears earlier
    // Check last 100 chars for duplicate patterns
    if (finalDescription.length > 100) {
      const last100 = finalDescription.substring(finalDescription.length - 100);
      const restOfText = finalDescription.substring(0, finalDescription.length - 100);
      
      // Check if last 100 chars contain a duplicate of something earlier
      for (let len = 50; len >= 20; len -= 10) {
        for (let i = 0; i <= last100.length - len; i++) {
          const candidate = last100.substring(i, i + len);
          if (restOfText.includes(candidate) && candidate.trim().length > 15) {
            // Found duplicate in last portion, remove it
            finalDescription = finalDescription.substring(0, finalDescription.length - 100 + i).trim();
            break;
          }
        }
      }
    }
    
    // Remove orphaned sentence fragments at the end (single words or very short phrases)
    const lines = finalDescription.split('\n');
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1].trim();
      // If last line is very short (< 40 chars) and doesn't end with punctuation, it might be a fragment
      if (lastLine.length < 40 && !/[.!?]$/.test(lastLine)) {
        // Check if it looks like a fragment (starts with lowercase, period, or is very short)
        if (/^[a-z.]/.test(lastLine) || lastLine.split(/\s+/).length <= 4) {
          finalDescription = lines.slice(0, -1).join('\n').trim();
        }
      }
    }
    
    cleaned.description = finalDescription.trim();
  }
  
  // Track admissionFee cleanup
  if (cleaned.admissionFee && cleaned.admissionFee.trim()) {
    const originalFee = cleaned.admissionFee.trim();
    if (originalFee.length > 160 || /Fasilitas|fasilitas/i.test(originalFee)) {
      itemStats.admissionFeeCleaned = true;
    }
  }
  
  return { item: cleaned, stats: itemStats };
}

function generateId(name, category) {
  return `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

async function scanDirectory(baseDir, category, subcategory = '', projectRoot, statsAccumulator = null) {
  const items = [];
  const fullPath = subcategory 
    ? path.join(baseDir, category, subcategory)
    : path.join(baseDir, category);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Path does not exist: ${fullPath}`);
    return items;
  }
  
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const itemDir = path.join(fullPath, entry.name);
      const images = getImageFiles(itemDir, projectRoot);
      const docFileInfo = getDocFile(itemDir);
      const coords = findCoordinates(entry.name);
      
      // Extract information from document file (docx or pdf) if available
      let docxInfo = {};
      if (docFileInfo) {
        const docText = await extractDocumentContent(docFileInfo.path, docFileInfo.ext);
        docxInfo = parseDocxContent(docText);
      }
      
      // Include item if it has coordinates, images, or docs
      if (coords || images.length > 0 || docFileInfo) {
        const categoryType = category === 'Destinasi Wisata' ? 'tourism' : 
                            category === 'Akomodasi' ? 'hotel' : 
                            category === 'Kuliner' ? 'culinary' : 
                            category.toLowerCase();
        
        const item = {
          id: generateId(entry.name, categoryType),
          category: categoryType,
          name: entry.name,
          district: docxInfo.district || 'Sangihe',
          rating: docxInfo.rating || 4.5,
          description: docxInfo.description || `Informasi tentang ${entry.name}`,
          latitude: coords?.lat || 0,
          longitude: coords?.lng || 0,
          image: images[0] || '',
          images: images.length > 0 ? images : undefined,
        };
        
        // Add category-specific fields from docx or defaults
        if (category === 'Destinasi Wisata') {
          item.admissionFee = docxInfo.admissionFee || 'Tersedia';
        } else if (category === 'Kuliner') {
          item.priceRange = docxInfo.priceRange ? normalizePriceRange(docxInfo.priceRange) : 'Rp 10.000 - Rp 100.000';
          item.cuisineType = docxInfo.cuisineType || 'Lokal';
        } else if (category === 'Akomodasi') {
          item.priceRange = docxInfo.priceRange ? normalizePriceRange(docxInfo.priceRange) : 'Rp 200.000 - Rp 500.000';
          item.starRating = docxInfo.starRating || 3;
        } else if (category === 'Event') {
          item.venue = docxInfo.venue || 'Sangihe';
        }
        
        // Add operating hours if found
        if (docxInfo.operatingHours) {
          item.operatingHours = docxInfo.operatingHours;
        }
        
        // Apply second pass cleanup
        const { item: cleanedItem, stats: itemStats } = cleanupItemData(item);
        items.push(cleanedItem);
        
        // Accumulate stats if accumulator provided
        if (statsAccumulator) {
          if (itemStats.descriptionDeduplicated) {
            statsAccumulator.descriptionDeduplicated++;
          }
          if (itemStats.admissionFeeCleaned) {
            statsAccumulator.admissionFeeCleaned++;
          }
        }
      }
    }
  }
  
  return items;
}

async function main() {
  const projectRoot = path.join(__dirname, '..');
  const baseDir = path.join(projectRoot, 'assets', 'Aplikasi Pariwisata');
  const allItems = [];
  
  console.log('Project root:', projectRoot);
  console.log('Base directory:', baseDir);
  
  // Post-processing: Track statistics and run diagnostics
  const stats = {
    descriptionDeduplicated: 0,
    admissionFeeCleaned: 0,
  };
  const diagnostics = {
    zeroCoordinates: [],
    nameMismatches: [],
  };
  
  // Scan Destinasi Wisata subcategories (nested structure)
  console.log('\nScanning Destinasi Wisata subcategories...');
  const wisataAlam = await scanDirectory(baseDir, 'Destinasi Wisata', 'Wisata Alam', projectRoot, stats);
  console.log(`Found ${wisataAlam.length} items in Wisata Alam`);
  
  const wisataBahari = await scanDirectory(baseDir, 'Destinasi Wisata', 'Wisata Bahari', projectRoot, stats);
  console.log(`Found ${wisataBahari.length} items in Wisata Bahari`);
  
  const wisataBuatan = await scanDirectory(baseDir, 'Destinasi Wisata', 'Wisata Buatan', projectRoot, stats);
  console.log(`Found ${wisataBuatan.length} items in Wisata Buatan`);
  
  const wisataBudaya = await scanDirectory(baseDir, 'Destinasi Wisata', 'Wisata Budaya', projectRoot, stats);
  console.log(`Found ${wisataBudaya.length} items in Wisata Budaya`);
  
  // Scan other categories (direct structure)
  console.log('\nScanning other categories...');
  const kuliner = await scanDirectory(baseDir, 'Kuliner', '', projectRoot, stats);
  console.log(`Found ${kuliner.length} items in Kuliner`);
  
  const event = await scanDirectory(baseDir, 'Event', '', projectRoot, stats);
  console.log(`Found ${event.length} items in Event`);
  
  const akomodasi = await scanDirectory(baseDir, 'Akomodasi', '', projectRoot, stats);
  console.log(`Found ${akomodasi.length} items in Akomodasi`);
  
  // Add Kakewang manually (not in folder structure but in coordinates list)
  const kakewangCoords = findCoordinates('kakewang');
  if (kakewangCoords) {
    const kakewangItem = {
      id: 'tourism_kakewang',
      category: 'tourism',
      name: 'Kakewang',
      district: 'Sangihe',
      rating: 4.5,
      description: 'Informasi tentang Kakewang',
      latitude: kakewangCoords.lat,
      longitude: kakewangCoords.lng,
      image: '',
      images: [],
      admissionFee: 'Tersedia',
    };
    const { item: cleanedKakewang, stats: kakewangStats } = cleanupItemData(kakewangItem);
    allItems.push(cleanedKakewang);
    if (kakewangStats.descriptionDeduplicated) stats.descriptionDeduplicated++;
    if (kakewangStats.admissionFeeCleaned) stats.admissionFeeCleaned++;
  }
  
  // Combine all items
  allItems.push(...wisataAlam, ...wisataBahari, ...wisataBuatan, ...wisataBudaya, ...kuliner, ...event, ...akomodasi);
  
  // Run diagnostics on all items
  for (const item of allItems) {
    // Diagnostic: Check for 0,0 coordinates
    if (item.latitude === 0 && item.longitude === 0) {
      diagnostics.zeroCoordinates.push({
        id: item.id,
        name: item.name,
        category: item.category,
      });
    }
    
    // Diagnostic: Check for name/description mismatches
    if (item.description) {
      const nameLower = item.name.toLowerCase();
      const descLower = item.description.toLowerCase();
      
      // Check if name appears in description
      if (!descLower.includes(nameLower)) {
        // Try to find similar names (simple heuristic: first 2-3 words)
        const nameWords = nameLower.split(/\s+/).slice(0, 3);
        const firstWord = nameWords[0];
        
        // Check if first word appears in description
        if (firstWord.length > 3 && descLower.includes(firstWord)) {
          // Find potential variant
          const words = descLower.split(/\s+/);
          for (let j = 0; j < words.length - nameWords.length + 1; j++) {
            const candidate = words.slice(j, j + nameWords.length).join(' ');
            // Simple similarity check (Levenshtein-like but simpler)
            if (candidate.length > 0 && candidate !== nameLower) {
              const similarity = calculateSimilarity(candidate, nameLower);
              if (similarity > 0.7 && similarity < 1.0) {
                diagnostics.nameMismatches.push({
                  id: item.id,
                  name: item.name,
                  foundInDescription: candidate,
                });
                break;
              }
            }
          }
        }
      }
    }
  }
  
  // Simple string similarity function (0-1 scale)
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  // Simple Levenshtein distance
  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }
  
  // Create output JSON
  const output = {
    items: allItems,
    metadata: {
      totalItems: allItems.length,
      categories: {
        tourism: allItems.filter(i => i.category === 'tourism').length,
        culinary: allItems.filter(i => i.category === 'culinary').length,
        hotel: allItems.filter(i => i.category === 'hotel').length,
        event: allItems.filter(i => i.category === 'event').length,
      },
      generatedAt: new Date().toISOString(),
    },
  };
  
  // Write to file
  const outputPath = path.join(projectRoot, 'lib', 'items-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  
  // Log statistics
  console.log(`\n=== Cleanup Statistics ===`);
  console.log(`Description deduplicated: ${stats.descriptionDeduplicated} items`);
  console.log(`AdmissionFee cleaned: ${stats.admissionFeeCleaned} items`);
  
  // Log diagnostics
  if (diagnostics.zeroCoordinates.length > 0) {
    console.warn(`\n[items-data.json] Items with 0,0 coordinates (${diagnostics.zeroCoordinates.length}):`);
    diagnostics.zeroCoordinates.forEach(item => {
      console.warn(`  - ${item.id}: ${item.name} (${item.category})`);
    });
  }
  
  if (diagnostics.nameMismatches.length > 0) {
    console.warn(`\n[items-data.json] Possible name/description mismatches (${diagnostics.nameMismatches.length}):`);
    diagnostics.nameMismatches.forEach(item => {
      console.warn(`  - ${item.id}: name="${item.name}", found="${item.foundInDescription}"`);
    });
  }
  
  console.log(`\nGenerated ${allItems.length} items`);
  console.log(`Tourism: ${output.metadata.categories.tourism}`);
  console.log(`Culinary: ${output.metadata.categories.culinary}`);
  console.log(`Hotel: ${output.metadata.categories.hotel}`);
  console.log(`Event: ${output.metadata.categories.event}`);
  console.log(`Output written to: ${outputPath}`);
}

main();

