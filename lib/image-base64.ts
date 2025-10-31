import * as ImagePicker from 'expo-image-picker';
import { ImageSourcePropType } from 'react-native';

/**
 * Convert an image URI to base64 string
 * @param uri - The image URI (local file path or remote URL)
 * @returns Promise<string> - Base64 encoded string with data URI prefix
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    // If it's already a base64 string, return it
    if (uri.startsWith('data:image')) {
      return uri;
    }

    // For React Native, use fetch and convert blob to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Convert blob to base64 using a helper
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Convert a React Native Image source to base64
 * @param source - Image source (require() or { uri: string })
 * @returns Promise<string> - Base64 encoded string
 */
export async function imageSourceToBase64(source: ImageSourcePropType): Promise<string> {
  try {
    // If it's a number (require() result), we can't directly convert
    // This would require additional native modules, so we'll handle differently
    if (typeof source === 'number') {
      throw new Error('Cannot convert require() image source to base64. Use pickImageFromGallery instead.');
    }

    // If it's an object with uri
    if (source && typeof source === 'object' && 'uri' in source) {
      return await imageToBase64(source.uri);
    }

    throw new Error('Invalid image source format');
  } catch (error) {
    console.error('Error converting image source to base64:', error);
    throw error;
  }
}

/**
 * Pick an image from the device gallery and convert to base64
 * @param options - Image picker options
 * @returns Promise<string | null> - Base64 encoded string or null if cancelled
 */
export async function pickImageAndConvertToBase64(
  options?: ImagePicker.ImagePickerOptions
): Promise<string | null> {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    // Launch image picker with base64 enabled for direct conversion
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true, // Get base64 directly from expo-image-picker
      ...options,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    // If base64 is available directly, use it
    if (asset.base64) {
      // Determine MIME type from URI or default to jpeg
      const mimeType = asset.type === 'image' ? (asset.uri.includes('.png') ? 'image/png' : 'image/jpeg') : 'image/jpeg';
      return `data:${mimeType};base64,${asset.base64}`;
    }

    // Fallback: convert URI to base64
    return await imageToBase64(asset.uri);
  } catch (error) {
    console.error('Error picking and converting image:', error);
    throw error;
  }
}

/**
 * Convert base64 string back to a format usable by React Native Image component
 * @param base64String - Base64 encoded string (with or without data URI prefix)
 * @returns Object with uri property for Image component
 */
export function base64ToImageUri(base64String: string): { uri: string } {
  // Ensure it has the data URI prefix
  if (!base64String.startsWith('data:')) {
    // Assume it's a JPEG if no prefix is provided
    base64String = `data:image/jpeg;base64,${base64String}`;
  }
  
  return { uri: base64String };
}

/**
 * Check if a string is a base64 image
 * @param str - String to check
 * @returns boolean
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image') || (str.length > 100 && /^[A-Za-z0-9+/=]+$/.test(str));
}

