import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';
import { useTourStore } from '../../lib/tour-store';
import { Checkpoint } from '../../types';

import { OpenStreetMapView } from '../../components/ui/OpenStreetMapView';

export default function CheckpointDetailScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { checkpointId } = useLocalSearchParams<{ checkpointId: string }>();
  
  const { routes, activeTour, completeCheckpoint } = useTourStore();
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    findCheckpoint();
  }, [checkpointId]);

  const findCheckpoint = () => {
    try {
      setIsLoading(true);
      
      for (const route of routes) {
        const foundCheckpoint = route.checkpoints.find(cp => cp.id === checkpointId);
        if (foundCheckpoint) {
          setCheckpoint(foundCheckpoint);
          break;
        }
      }
    } catch (error) {
      console.error('Error finding checkpoint:', error);
      Alert.alert('Error', 'Failed to load checkpoint details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInMaps = () => {
    if (!checkpoint) return;
    
    const url = `https://maps.google.com/maps?q=${checkpoint.latitude},${checkpoint.longitude}`;
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Failed to open maps');
    });
  };

  const handleCompleteCheckpoint = async () => {
    if (!checkpoint) return;

    Alert.alert(
      'Complete Checkpoint',
      `Mark "${checkpoint.name}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await completeCheckpoint(checkpoint.id);
              Alert.alert('Success', 'Checkpoint completed!');
              router.back();
            } catch (error) {
              console.error('Error completing checkpoint:', error);
              Alert.alert('Error', 'Failed to complete checkpoint');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landmark':
        return 'location-outline';
      case 'restaurant':
        return 'restaurant-outline';
      case 'accommodation':
        return 'bed-outline';
      case 'transport':
        return 'car-outline';
      default:
        return 'pin-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'landmark':
        return colors.primary;
      case 'restaurant':
        return colors.secondary;
      case 'accommodation':
        return colors.accent;
      case 'transport':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const isCompleted = activeTour?.completedCheckpoints.includes(checkpointId || '') || false;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading checkpoint...
          </Text>
        </View>
      </View>
    );
  }

  if (!checkpoint) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Checkpoint Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            The requested checkpoint could not be found.
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {checkpoint.name}
          </Text>
          <View style={styles.headerSubtitle}>
            <Ionicons 
              name={getTypeIcon(checkpoint.type) as any} 
              size={16} 
              color={getTypeColor(checkpoint.type)} 
            />
            <Text style={[styles.typeText, { color: getTypeColor(checkpoint.type) }]}>
              {checkpoint.type.charAt(0).toUpperCase() + checkpoint.type.slice(1)}
            </Text>
          </View>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={[styles.mapSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location
          </Text>
          
          <View style={styles.mapContainer}>
            <OpenStreetMapView
              latitude={checkpoint.latitude}
              longitude={checkpoint.longitude}
              title={checkpoint.name}
              description={checkpoint.description}
              style={styles.map}
            />
          </View>

          <TouchableOpacity 
            style={[styles.mapsButton, { backgroundColor: colors.primary }]}
            onPress={handleOpenInMaps}
          >
            <Ionicons name="map-outline" size={20} color="#FFFFFF" />
            <Text style={styles.mapsButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={[styles.descriptionSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {checkpoint.description}
          </Text>
        </View>

        {/* Details Section */}
        <View style={[styles.detailsSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Details
          </Text>
          
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  Coordinates
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {checkpoint.latitude.toFixed(6)}, {checkpoint.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            {!!checkpoint.estimatedTime && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    Estimated Time
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                    {checkpoint.estimatedTime} minutes
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  Order
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  Checkpoint #{checkpoint.order}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {checkpoint.notes && (
          <View style={[styles.notesSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Important Notes
            </Text>
            <Text style={[styles.notes, { color: colors.textSecondary }]}>
              {checkpoint.notes}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {activeTour && !isCompleted && (
        <View style={[styles.actionSection, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: colors.success }]}
            onPress={handleCompleteCheckpoint}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  completedBadge: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
  },
  notesSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionSection: {
    padding: 16,
    paddingBottom: 30,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
