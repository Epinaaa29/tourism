import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';

interface FullScreenImageViewerProps {
  visible: boolean;
  images: (string | any)[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to determine if image is URI or require
const isUri = (img: any): img is string => {
  return typeof img === 'string' && (img.startsWith('http') || img.startsWith('https'));
};

export function FullScreenImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: FullScreenImageViewerProps) {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden={true} />
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Image Carousel */}
        <Carousel
          width={screenWidth}
          height={screenHeight}
          data={images}
          defaultIndex={initialIndex}
          renderItem={({ item, index }) => {
            if (isUri(item)) {
              return (
                <Image
                  key={index}
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="contain"
                  contentFit="contain"
                />
              );
            } else {
              return (
                <Image
                  key={index}
                  source={item}
                  style={styles.image}
                  resizeMode="contain"
                  contentFit="contain"
                />
              );
            }
          }}
          onSnapToItem={(index) => setCurrentIndex(index)}
          autoPlay={false}
          scrollAnimationDuration={300}
        />

        {/* Image Counter */}
        {images.length > 1 && (
          <View style={styles.counterContainer}>
            <View style={styles.counter}>
              <View style={styles.counterBackground}>
                <View style={styles.counterTextContainer}>
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
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    alignItems: 'center',
  },
  counterBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterTextContainer: {
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },
});

