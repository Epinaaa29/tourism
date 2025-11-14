import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckpointCard } from '../../components/ui/CheckpointCard';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';
import { useTourStore } from '../../lib/tour-store';
import { Checkpoint, TourRoute, Transport } from '../../types';

export default function TourTrackingScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { tourId } = useLocalSearchParams<{ tourId: string }>();
  
  const { 
    routes, 
    activeTour, 
    loadTourRoutes, 
    completeCheckpoint, 
    pauseTour, 
    resumeTour, 
    completeTour 
  } = useTourStore();

  const [currentRoute, setCurrentRoute] = useState<TourRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    if (!tourId || isInitialized) return;
    
    initializeTour();
  }, [tourId]); // Removed routes from dependencies to prevent infinite loop

  // Auto-complete tour when all checkpoints are completed
  useEffect(() => {
    if (!currentRoute || !activeTour || activeTour.status !== 'active' || hasAutoCompletedRef.current) return;
    
    const totalItems = currentRoute.checkpoints.length + currentRoute.transports.length;
    const completedCount = activeTour.completedCheckpoints.length;
    
    if (completedCount >= totalItems && totalItems > 0) {
      hasAutoCompletedRef.current = true; // Prevent multiple triggers
      console.log('🎉 All checkpoints completed! Auto-completing tour...', {
        completedCount,
        totalItems
      });
      
      // Small delay to ensure UI updates
      setTimeout(async () => {
        try {
          await completeTour();
          Alert.alert(
            'Tour Completed!',
            'Congratulations! You have completed the tour.',
            [
              {
                text: 'View History',
                onPress: () => router.push('/tour-history'),
              },
              {
                text: 'OK',
                onPress: () => {},
              },
            ]
          );
        } catch (error) {
          console.error('Error auto-completing tour:', error);
          hasAutoCompletedRef.current = false; // Reset on error
        }
      }, 500);
    }
  }, [activeTour?.completedCheckpoints.length, currentRoute, activeTour?.status]);

  const initializeTour = async () => {
    if (isInitialized) return; // Prevent multiple initializations
    
    try {
      setIsLoading(true);
      hasAutoCompletedRef.current = false; // Reset auto-complete flag for new tour
      
      // Only load routes if not already loaded
      const currentRoutes = useTourStore.getState().routes;
      if (currentRoutes.length === 0) {
        await loadTourRoutes();
      }
      
      // Get routes from store after loading
      const updatedRoutes = useTourStore.getState().routes;
      
      if (tourId) {
        const route = updatedRoutes.find(r => r.id === tourId);
        if (route) {
          setCurrentRoute(route);
          setIsInitialized(true);
          setIsLoading(false);
        } else {
          console.error('Tour route not found:', tourId);
          console.log('Available routes:', updatedRoutes.map(r => ({ id: r.id, destinationId: r.destinationId, name: r.destinationName })));
          Alert.alert('Error', 'Tour route not found');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing tour:', error);
      Alert.alert('Error', 'Failed to load tour data');
      setIsLoading(false);
    }
  };

  const handleCheckpointPress = (checkpoint: Checkpoint | Transport, index: number) => {
    if ('type' in checkpoint && checkpoint.type === 'transport') {
      router.push({
        pathname: '/transport-detail',
        params: { transportId: checkpoint.id }
      });
    } else {
      router.push({
        pathname: '/checkpoint-detail',
        params: { checkpointId: checkpoint.id }
      });
    }
  };

  const handleCompleteCheckpoint = async (checkpointId: string) => {
    try {
      await completeCheckpoint(checkpointId);
      
      // Get updated tour state after completing checkpoint
      const updatedTour = useTourStore.getState().activeTour;
      
      // Check if tour is completed
      if (currentRoute && updatedTour) {
        const totalItems = currentRoute.checkpoints.length + currentRoute.transports.length;
        const completedCount = updatedTour.completedCheckpoints.length;
        
        console.log('✅ Checkpoint completed:', {
          checkpointId,
          completedCount,
          totalItems,
          isComplete: completedCount >= totalItems
        });
        
        if (completedCount >= totalItems) {
          // Small delay to ensure state is updated
          setTimeout(() => {
            Alert.alert(
              'Tour Completed!',
              'Congratulations! You have completed the tour.',
              [
                {
                  text: 'View History',
                  onPress: async () => {
                    await completeTour();
                    router.push('/tour-history');
                  },
                },
                {
                  text: 'OK',
                  onPress: async () => {
                    await completeTour();
                  },
                },
              ]
            );
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error completing checkpoint:', error);
      Alert.alert('Error', 'Failed to complete checkpoint');
    }
  };

  const handlePauseTour = async () => {
    try {
      await pauseTour();
      Alert.alert('Tour Paused', 'Your tour has been paused. You can resume it anytime from the history.');
    } catch (error) {
      console.error('Error pausing tour:', error);
    }
  };

  const handleResumeTour = async () => {
    try {
      await resumeTour();
    } catch (error) {
      console.error('Error resuming tour:', error);
    }
  };

  const getTourItems = () => {
    if (!currentRoute) return [];
    
    const items: (Checkpoint | Transport)[] = [];
    const checkpointMap = new Map(currentRoute.checkpoints.map(cp => [cp.order, cp]));
    const transportMap = new Map(currentRoute.transports.map(t => [t.departurePoint, t]));
    
    // Create a combined list sorted by order
    const maxOrder = Math.max(
      ...currentRoute.checkpoints.map(cp => cp.order),
      currentRoute.transports.length > 0 ? currentRoute.transports.length : 0
    );
    
    for (let i = 1; i <= maxOrder; i++) {
      const checkpoint = checkpointMap.get(i);
      if (checkpoint) {
        items.push(checkpoint);
      }
    }
    
    // Add transports at appropriate positions
    currentRoute.transports.forEach(transport => {
      const insertIndex = items.findIndex(item => 
        'type' in item && item.type !== 'transport' && 
        item.name === transport.departurePoint
      );
      if (insertIndex !== -1) {
        items.splice(insertIndex + 1, 0, transport);
      }
    });
    
    return items;
  };

  const getProgressPercentage = () => {
    if (!activeTour || !currentRoute) return 0;
    const totalItems = currentRoute.checkpoints.length + currentRoute.transports.length;
    return (activeTour.completedCheckpoints.length / totalItems) * 100;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading tour...
          </Text>
        </View>
      </View>
    );
  }

  if (!currentRoute) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Tour Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            The requested tour could not be found.
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

  const tourItems = getTourItems();
  const progressPercentage = getProgressPercentage();

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
            {currentRoute.destinationName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Tour Progress
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.push('/tour-history')}
        >
          <Ionicons name="list-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={[styles.progressSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Progress
          </Text>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${progressPercentage}%` 
              }
            ]} 
          />
        </View>

        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {activeTour?.completedCheckpoints.length || 0} of {tourItems.length} checkpoints completed
          </Text>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Estimated time: {currentRoute.totalEstimatedTime} minutes
          </Text>
        </View>
      </View>

      {/* Tour Status */}
      {activeTour && (
        <View style={[styles.statusSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              Status: <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {activeTour.status.toUpperCase()}
              </Text>
            </Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Started: {activeTour.startTime.toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.statusActions}>
            {activeTour.status === 'active' ? (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.warning }]}
                onPress={handlePauseTour}
              >
                <Ionicons name="pause-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleResumeTour}
              >
                <Ionicons name="play-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Resume</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Checkpoints List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.checkpointsHeader}>
          <Text style={[styles.checkpointsTitle, { color: colors.text }]}>
            Tour Route
          </Text>
          <Text style={[styles.checkpointsSubtitle, { color: colors.textSecondary }]}>
            Follow the checkpoints in order
          </Text>
        </View>

        <FlatList
          data={tourItems}
          renderItem={({ item, index }) => {
            const isCompleted = activeTour?.completedCheckpoints.includes(item.id) || false;
            const isCurrent = activeTour?.currentCheckpointIndex === index;
            
            return (
              <CheckpointCard
                checkpoint={'type' in item && item.type !== 'transport' ? item as Checkpoint : undefined}
                transport={'type' in item && item.type === 'transport' ? item as Transport : undefined}
                order={index + 1}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                onPress={() => handleCheckpointPress(item, index)}
              />
            );
          }}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
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
    fontSize: 14,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  progressSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    gap: 4,
  },
  progressText: {
    fontSize: 14,
  },
  statusSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusActions: {
    marginLeft: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  checkpointsHeader: {
    marginBottom: 16,
  },
  checkpointsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  checkpointsSubtitle: {
    fontSize: 14,
  },
});
