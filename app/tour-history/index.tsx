import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';
import { useTourStore } from '../../lib/tour-store';
import { TourProgress } from '../../types';

export default function TourHistoryScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  
  const { 
    tourHistory, 
    activeTour,
    routes, 
    getTourHistory, 
    clearTourHistory,
    deleteTourFromHistory,
    startTour 
  } = useTourStore();

  useEffect(() => {
    getTourHistory();
  }, []);

  const getTourRoute = (tourId: string) => {
    return routes.find(route => route.id === tourId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'active':
        return colors.primary;
      case 'paused':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'play-circle';
      case 'paused':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  };

  const handleResumeTour = async (tour: TourProgress) => {
    try {
      await startTour(tour.tourId);
      router.push({
        pathname: '/tour-tracking',
        params: { tourId: tour.tourId }
      });
    } catch (error) {
      console.error('Error resuming tour:', error);
      Alert.alert('Error', 'Failed to resume tour');
    }
  };

  const handleViewTour = (tour: TourProgress) => {
    if (tour.status === 'completed') {
      // For completed tours, we could show a summary or allow viewing details
      Alert.alert('Tour Completed', 'This tour has been completed successfully!');
    } else {
      // For active/paused tours, resume them
      handleResumeTour(tour);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all tour history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearTourHistory();
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear tour history');
            }
          },
        },
      ]
    );
  };

  const handleDeleteTour = (tour: TourProgress) => {
    // Prevent deleting active tour
    if (activeTour && activeTour.tourId === tour.tourId) {
      Alert.alert(
        'Cannot Delete Active Tour',
        'Please complete or cancel the active tour before deleting it.',
      );
      return;
    }

    const route = getTourRoute(tour.tourId);
    Alert.alert(
      'Delete Tour',
      `Are you sure you want to delete the tour for "${route?.destinationName || 'Unknown Destination'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTourFromHistory(tour.tourId);
            } catch (error) {
              console.error('Error deleting tour:', error);
              Alert.alert('Error', 'Failed to delete tour');
            }
          },
        },
      ]
    );
  };

  const renderTourItem = ({ item }: { item: TourProgress }) => {
    const route = getTourRoute(item.tourId);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={[
          styles.tourItem,
          {
            backgroundColor: colors.card,
            borderColor: statusColor,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => handleViewTour(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tourHeader}>
          <View style={styles.tourInfo}>
            <Text style={[styles.tourName, { color: colors.text }]} numberOfLines={1}>
              {route?.destinationName || 'Unknown Destination'}
            </Text>
            <Text style={[styles.tourDate, { color: colors.textSecondary }]}>
              Started: {item.startTime.toLocaleDateString()} at {item.startTime.toLocaleTimeString()}
            </Text>
            {item.endTime && (
              <Text style={[styles.tourEndDate, { color: colors.textSecondary }]}>
                Completed: {item.endTime.toLocaleDateString()} at {item.endTime.toLocaleTimeString()}
              </Text>
            )}
          </View>

          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={24} 
              color={statusColor} 
            />
          </View>
        </View>

        <View style={styles.tourStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Progress
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {item.completedCheckpoints.length} checkpoints
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Duration
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {item.endTime 
                ? `${Math.round((item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60))} min`
                : `${Math.round((new Date().getTime() - item.startTime.getTime()) / (1000 * 60))} min`
              }
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Status
            </Text>
            <Text style={[styles.statValue, { color: statusColor, textTransform: 'capitalize' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.tourFooter}>
          <TouchableOpacity
            onPress={() => handleDeleteTour(item)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={colors.error} 
            />
          </TouchableOpacity>
          <View style={styles.actionContainer}>
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {item.status === 'completed' ? 'View Details' : 'Resume Tour'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={colors.primary} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const allTours = activeTour ? [activeTour, ...tourHistory] : tourHistory;

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tour History
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {allTours.length} tours
          </Text>
        </View>

        {allTours.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Active Tour Section */}
      {activeTour && (
        <View style={[styles.activeTourSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={styles.activeTourHeader}>
            <Ionicons name="play-circle" size={20} color={colors.primary} />
            <Text style={[styles.activeTourTitle, { color: colors.text }]}>
              Currently Active
            </Text>
          </View>
          <Text style={[styles.activeTourDescription, { color: colors.textSecondary }]}>
            You have an active tour in progress
          </Text>
        </View>
      )}

      {/* Tours List */}
      {allTours.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Tours Yet
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Start your first tour from the Tourism section to see your history here.
          </Text>
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/tourism')}
          >
            <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Explore Tourism</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allTours}
          renderItem={renderTourItem}
          keyExtractor={(item) => item.tourId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  clearButton: {
    padding: 8,
  },
  activeTourSection: {
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
  activeTourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTourTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTourDescription: {
    fontSize: 14,
    marginLeft: 28,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  tourItem: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  tourHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  tourInfo: {
    flex: 1,
  },
  tourName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tourDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  tourEndDate: {
    fontSize: 14,
  },
  statusContainer: {
    marginLeft: 12,
  },
  tourStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  deleteButton: {
    padding: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
