// Helper function to get images array for an item
// Combines local require() images with any additional image URLs or base64 images

import { isBase64Image, base64ToImageUri } from './image-base64';

const tourismImages: { [key: string]: any } = {
  pulau_para: require('../assets/images/tourism/pulau_para.jpg'),
  mahengetang: require('../assets/images/tourism/mahengetang.jpg'),
  mangrove: require('../assets/images/tourism/mangrove.jpg'),
  boulevard: require('../assets/images/tourism/boulevard.jpg'),
  kadadima: require('../assets/images/tourism/kadadima.jpg'),
  pananualeng: require('../assets/images/tourism/pananualeng.jpg'),
  hesang: require('../assets/images/tourism/hesang.jpg'),
  lenganeng: require('../assets/images/tourism/lenganeng.jpg'),
  bebalang: require('../assets/images/tourism/bebalang.jpg'),
  palareng: require('../assets/images/tourism/palareng.jpg'),
  kuma: require('../assets/images/tourism/kuma.jpg'),
  utaurano: require('../assets/images/tourism/utaurano.jpg'),
  lelipang: require('../assets/images/tourism/lelipang.jpg'),
  bukide_timur: require('../assets/images/tourism/bukide_timur.jpg'),
};

const hotelImages: { [key: string]: any } = {
  tahuna_beach: require('../assets/images/tourism/pananualeng.jpg'),
  bintang_utara: require('../assets/images/tourism/bebalang.jpg'),
  hotel_hayana: require('../assets/images/tourism/hesang.jpg'),
  hotel_madina: require('../assets/images/tourism/kuma.jpg'),
  mafana_seaside_hotel: require('../assets/images/tourism/bebalang.jpg'),
  penginapan_setia: require('../assets/images/tourism/hesang.jpg'),
  wisma_melia: require('../assets/images/tourism/kuma.jpg'),
};

const culinaryImages: { [key: string]: any } = {
  seafood: require('../assets/images/culinary/seafood.jpg'),
  local_cuisine: require('../assets/images/culinary/local_cuisine.jpg'),
  traditional_food: require('../assets/images/culinary/traditional_food.jpg'),
};

const eventImages: { [key: string]: any } = {
  festival: require('../assets/images/events/festival.jpg'),
};

/**
 * Convert image string to React Native Image compatible format
 */
function processImageString(img: string): string | any {
  // Check if it's a base64 image
  if (isBase64Image(img)) {
    // Convert base64 to Image component format
    return base64ToImageUri(img).uri;
  }
  return img;
}

export function getImagesForItem(category: string, image: string, images?: string[]): (string | any)[] {
  let result: (string | any)[] = [];
  
  // Check if main image is base64 first
  if (image && isBase64Image(image)) {
    result.push(base64ToImageUri(image).uri);
  } else {
    // Try to get local image
    let mainImage: any = null;
    if (category === 'tourism' && tourismImages[image]) {
      mainImage = tourismImages[image];
    } else if ((category === 'hotel' || category === 'hotels') && hotelImages[image]) {
      mainImage = hotelImages[image];
    } else if (category === 'culinary' && culinaryImages[image]) {
      mainImage = culinaryImages[image];
    } else if ((category === 'event' || category === 'events') && eventImages[image]) {
      mainImage = eventImages[image];
    }
    
    // Add main image if found
    if (mainImage) {
      result.push(mainImage);
    } else if (image && (image.startsWith('http') || image.startsWith('https'))) {
      // It's a URL
      result.push(image);
    }
  }
  
  // Add additional images from images array (URLs, local image keys, or base64)
  if (images && images.length > 0) {
    images.forEach(img => {
      if (isBase64Image(img)) {
        // It's a base64 image
        result.push(base64ToImageUri(img).uri);
      } else if (img.startsWith('http') || img.startsWith('https')) {
        // It's a URL
        result.push(img);
      } else {
        // It's a local image key, try to find it
        let localImg: any = null;
        if (category === 'tourism' && tourismImages[img]) {
          localImg = tourismImages[img];
        } else if ((category === 'hotel' || category === 'hotels') && hotelImages[img]) {
          localImg = hotelImages[img];
        } else if (category === 'culinary' && culinaryImages[img]) {
          localImg = culinaryImages[img];
        } else if ((category === 'event' || category === 'events') && eventImages[img]) {
          localImg = eventImages[img];
        }
        if (localImg) {
          result.push(localImg);
        } else if (img) {
          // If not found, add as URL (might be a placeholder)
          result.push(img);
        }
      }
    });
  }
  
  // If no images found at all, return empty array (ImageSlider will show placeholder)
  return result;
}

