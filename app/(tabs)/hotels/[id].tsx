import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { OpenStreetMapView } from '@/components/ui/OpenStreetMapView';

import { LocationRow } from '@/components/ui/LocationRow';
import { RatingBadge } from '@/components/ui/RatingBadge';
import { ImageSlider } from '@/components/ui/ImageSlider';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getImagesForItem } from '@/lib/image-utils';
import { getColors } from '@/constants/colors';
import { useAppStore } from '@/lib/store';
import { useTourStore } from '@/lib/tour-store';
import { Item } from '@/types';

export default function HotelDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data, isFavorite, toggleFavorite, getNearbyItems } = useAppStore();
  const { getTourByDestinationId, loadTourRoutes } = useTourStore();
  const [item, setItem] = useState<Item | null>(null);
  const [nearbyItems, setNearbyItems] = useState<Item[]>([]);
  const [hasTourRoute, setHasTourRoute] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (id && data.hotel) {
        const foundItem = data.hotel.find(item => item.id === id);
        if (foundItem) {
          setItem(foundItem);
          const nearby = getNearbyItems(foundItem, 'hotel');
          setNearbyItems(nearby);
          
          // Load tour routes and check if this destination has a tour
          await loadTourRoutes();
          const tourRoute = getTourByDestinationId(id);
          setHasTourRoute(!!tourRoute);
        }
      }
    };

    initializeData();
  }, [id, data]);

  const handleOpenMaps = () => {
    if (item) {
      const url = `https://maps.google.com/maps?q=${item.latitude},${item.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps');
      });
    }
  };

  const handleToggleFavorite = () => {
    if (item) {
      toggleFavorite(item.id);
    }
  };

  const handleNearbyPress = (itemId: string) => {
    router.push(`/hotels/${itemId}`);
  };

  const handleStartTour = async () => {
    if (!id) return;
    
    const tourRoute = getTourByDestinationId(id);
    if (!tourRoute) {
      Alert.alert('No Tour Available', 'This destination does not have a guided tour route.');
      return;
    }

    try {
      await useTourStore.getState().startTour(tourRoute.id);
      router.push({
        pathname: '/tour-tracking',
        params: { tourId: tourRoute.id }
      });
    } catch (error) {
      console.error('Error starting tour:', error);
      Alert.alert('Error', 'Failed to start tour. Please try again.');
    }
  };

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Item not found
          </Text>
        </View>
      </View>
    );
  }

  const hotelItem = item as any;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <ImageSlider 
          images={getImagesForItem('hotels', item.image, item.images)}
          category="hotels"
          name={item.name}
          style={styles.image}
        />
        <View style={styles.ratingOverlay}>
          <RatingBadge rating={item.rating} size="medium" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.name}
          </Text>
          <LocationRow district={item.district} />
        </View>

        {hasTourRoute && (
          <TouchableOpacity
            style={[styles.startTourButton, { backgroundColor: colors.accent }]}
            onPress={handleStartTour}
          >
            <Ionicons name="compass" size={24} color="#FFFFFF" />
            <Text style={styles.startTourButtonText}>Start Guided Tour</Text>
          </TouchableOpacity>
        )}

            <View style={styles.mapSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
              <View style={[styles.mapContainer, { borderColor: colors.border }]}>
                <OpenStreetMapView
                  latitude={item.latitude}
                  longitude={item.longitude}
                  title={item.name}
                  description={item.district}
                  style={styles.map}
                />
                <TouchableOpacity
                  style={[styles.mapOverlayButton, { backgroundColor: colors.primary }]}
                  onPress={handleOpenMaps}
                >
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                  <Text style={styles.mapOverlayButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { 
                backgroundColor: isFavorite(item.id) ? colors.error : colors.surface,
                borderWidth: 1,
                borderColor: isFavorite(item.id) ? colors.error : colors.border,
              }
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(item.id) ? "#FFFFFF" : colors.text} 
            />
            <Text style={[
              styles.actionButtonText,
              { color: isFavorite(item.id) ? "#FFFFFF" : colors.text }
            ]}>
              {isFavorite(item.id) ? "Favorited" : "Add to Favorites"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>

        {item.operatingHours && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Operating Hours
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {item.operatingHours}
            </Text>
          </View>
        )}

        {item.priceRange && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Range
            </Text>
            <Text style={[styles.priceText, { color: colors.accent }]}>
              {item.priceRange}
            </Text>
          </View>
        )}

        {hotelItem.starRating && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Star Rating
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {hotelItem.starRating} stars
            </Text>
          </View>
        )}

        {nearbyItems.length > 0 && (
          <View style={styles.detailsSection}>
            <SectionTitle title="Nearby Hotels" />
            {nearbyItems.map((nearbyItem) => (
              <TouchableOpacity
                key={nearbyItem.id}
                style={[styles.nearbyItem, { backgroundColor: colors.card }]}
                onPress={() => handleNearbyPress(nearbyItem.id)}
              >
                <View style={styles.nearbyContent}>
                  <Text style={[styles.nearbyTitle, { color: colors.text }]}>
                    {nearbyItem.name}
                  </Text>
                  <LocationRow district={nearbyItem.district} size="small" />
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  startTourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startTourButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  mapSection: {
    marginBottom: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlayButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapOverlayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  nearbyContent: {
    flex: 1,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

