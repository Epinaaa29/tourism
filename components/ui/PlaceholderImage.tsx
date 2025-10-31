import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { isBase64Image, base64ToImageUri } from '@/lib/image-base64';

interface PlaceholderImageProps {
  category: string;
  name: string;
  image?: string;
  style?: any;
}

// Image mapping for real images
const tourismImages: { [key: string]: any } = {
  pulau_para: require('../../assets/images/tourism/pulau_para.jpg'),
  mahengetang: require('../../assets/images/tourism/mahengetang.jpg'),
  mangrove: require('../../assets/images/tourism/mangrove.jpg'),
  boulevard: require('../../assets/images/tourism/boulevard.jpg'),
  kadadima: require('../../assets/images/tourism/kadadima.jpg'),
  pananualeng: require('../../assets/images/tourism/pananualeng.jpg'),
  hesang: require('../../assets/images/tourism/hesang.jpg'),
  lenganeng: require('../../assets/images/tourism/lenganeng.jpg'),
  bebalang: require('../../assets/images/tourism/bebalang.jpg'),
  palareng: require('../../assets/images/tourism/palareng.jpg'),
  kuma: require('../../assets/images/tourism/kuma.jpg'),
  utaurano: require('../../assets/images/tourism/utaurano.jpg'),
  lelipang: require('../../assets/images/tourism/lelipang.jpg'),
  bukide_timur: require('../../assets/images/tourism/bukide_timur.jpg'),
};

const hotelImages: { [key: string]: any } = {
  tahuna_beach: require('../../assets/images/tourism/pananualeng.jpg'),
  bintang_utara: require('../../assets/images/tourism/bebalang.jpg'),
  hotel_hayana: require('../../assets/images/tourism/hesang.jpg'),
  hotel_madina: require('../../assets/images/tourism/kuma.jpg'),
  mafana_seaside_hotel: require('../../assets/images/tourism/bebalang.jpg'),
  penginapan_setia: require('../../assets/images/tourism/hesang.jpg'),
  wisma_melia: require('../../assets/images/tourism/kuma.jpg'),
};

const culinaryImages: { [key: string]: any } = {
  seafood: require('../../assets/images/culinary/seafood.jpg'),
};

const eventImages: { [key: string]: any } = {
  festival: require('../../assets/images/events/festival.jpg'),
};

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  category, 
  name, 
  image,
  style 
}) => {
  const getGradientColors = (category: string) => {
    switch (category) {
      case 'tourism':
        return ['#3B82F6', '#1D4ED8'];
      case 'culinary':
        return ['#EF4444', '#DC2626'];
      case 'hotel':
      case 'hotels':
        return ['#10B981', '#059669'];
      case 'event':
      case 'events':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'tourism':
        return '🏔️';
      case 'culinary':
        return '🍜';
      case 'hotel':
      case 'hotels':
        return '🏨';
      case 'event':
      case 'events':
        return '🎉';
      default:
        return '📍';
    }
  };

  // Try to get the real image
  const getRealImage = () => {
    if (!image) return null;
    
    // Check if it's a base64 image
    if (isBase64Image(image)) {
      return base64ToImageUri(image);
    }
    
    // Check if it's a URL
    if (image.startsWith('http') || image.startsWith('https')) {
      return { uri: image };
    }
    
    // Try to find local image
    if (category === 'tourism' && tourismImages[image]) {
      return tourismImages[image];
    } else if ((category === 'hotel' || category === 'hotels') && hotelImages[image]) {
      return hotelImages[image];
    } else if (category === 'culinary' && culinaryImages[image]) {
      return culinaryImages[image];
    } else if ((category === 'event' || category === 'events') && eventImages[image]) {
      return eventImages[image];
    }
    return null;
  };

  const realImage = getRealImage();

  // If we have a real image, display it
  if (realImage) {
    return (
      <Image
        source={realImage}
        style={[styles.container, style]}
        resizeMode="cover"
      />
    );
  }

  // Otherwise show the gradient placeholder
  return (
    <LinearGradient
      colors={getGradientColors(category)}
      style={[styles.container, style]}
    >
      <Text style={styles.icon}>{getIcon(category)}</Text>
      <Text style={styles.text} numberOfLines={2}>
        {name}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
