import React, { useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { PlaceholderImage } from './PlaceholderImage';
import { FullScreenImageViewer } from './FullScreenImageViewer';

interface ImageSliderProps {
  images: (string | any)[];
  category?: string;
  name?: string;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

// Helper function to determine if image is URI or require
const isUri = (img: any): img is string => {
  return typeof img === 'string' && (img.startsWith('http') || img.startsWith('https'));
};

export function ImageSlider({ images, category = 'tourism', name = '', style }: ImageSliderProps) {
  const carouselRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <PlaceholderImage category={category} name={name} style={styles.image} />
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, style]}>
        <Carousel
          ref={carouselRef}
          width={screenWidth}
          height={300}
          data={images}
          renderItem={({ item, index }) => {
            const imageComponent = isUri(item) ? (
              <Image
                key={index}
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Image
                key={index}
                source={item}
                style={styles.image}
                resizeMode="cover"
              />
            );

            return (
              <Pressable
                onPress={() => {
                  setCurrentIndex(index);
                  setIsFullScreenVisible(true);
                }}
                style={styles.imagePressable}
              >
                {imageComponent}
              </Pressable>
            );
          }}
          onSnapToItem={(index) => setCurrentIndex(index)}
          autoPlay={false}
          scrollAnimationDuration={300}
        />
        
        {images.length > 1 && (
          <>
            <View style={styles.indicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          </>
        )}
      </View>

      <FullScreenImageViewer
        visible={isFullScreenVisible}
        images={images}
        initialIndex={currentIndex}
        onClose={() => setIsFullScreenVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#000',
  },
  imagePressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

