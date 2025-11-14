import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { deleteTourRoute } from '@/lib/firestore-service';
import { useTourStore } from '@/lib/tour-store';
import { TourRoute } from '@/types';

const TourGuideCard = ({ 
  route, 
  onEdit, 
  onDelete 
}: { 
  route: TourRoute; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {route.destinationName}
        </Text>
        <Text style={[styles.itemDistrict, { color: colors.textMuted }]}>
          Destination ID: {route.destinationId}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemMetaText, { color: colors.textMuted }]}>
            {route.checkpoints.length} checkpoints
          </Text>
          <Text style={[styles.itemMetaText, { color: colors.textMuted }]}>
            • {route.totalEstimatedTime} min
          </Text>
          <Text style={[styles.itemMetaText, { color: colors.primary }]}>
            • {route.difficulty}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onEdit}
        >
          <Ionicons name="pencil" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TourGuidesScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { routes, loadTourRoutes } = useTourStore();
  const [isLoading, setIsLoading] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTourRoutes(true); // Force refresh from Firestore
    }, [loadTourRoutes])
  );

  const handleAddRoute = () => {
    router.push('/admin/tour-guides/new');
  };

  const handleEditRoute = (routeId: string) => {
    router.push(`/admin/tour-guides/${routeId}`);
  };

  const handleDeleteRoute = (route: TourRoute) => {
    Alert.alert(
      'Delete Tour Guide',
      `Are you sure you want to delete the tour guide for "${route.destinationName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteTourRoute(route.id);
              // Refresh routes
              await loadTourRoutes(true);
              Alert.alert('Success', 'Tour guide deleted successfully');
            } catch (error) {
              console.error('Error deleting tour route:', error);
              Alert.alert('Error', 'Failed to delete tour guide');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }: { item: TourRoute }) => (
    <TourGuideCard
      route={item}
      onEdit={() => handleEditRoute(item.id)}
      onDelete={() => handleDeleteRoute(item)}
    />
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Tour Guides', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="map-outline" size={24} color={colors.primary} />
            <Text style={[styles.headerTitleText, { color: colors.text }]}>
              Tour Guides
            </Text>
          </View>
          <TouchableOpacity onPress={handleAddRoute} style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <SectionTitle 
            title="Manage Tour Guides" 
            subtitle={`${routes.length} tour routes`}
          />

          {routes.length === 0 ? (
            <EmptyState
              icon="map-outline"
              title="No tour guides"
              description="Create your first tour guide route to get started."
              action={
                <TouchableOpacity
                  style={[styles.addFirstButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddRoute}
                >
                  <Text style={styles.addFirstButtonText}>Create First Tour Guide</Text>
                </TouchableOpacity>
              }
            />
          ) : (
            <FlatList
              data={routes}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={true}
              style={styles.listContainer}
              refreshing={isLoading}
              onRefresh={() => loadTourRoutes(true)}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDistrict: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  itemMetaText: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

