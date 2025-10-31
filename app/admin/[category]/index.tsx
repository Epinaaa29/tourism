import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { saveLocalEdit } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Category, Item } from '@/types';

const AdminItemCard = ({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: Item; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  return (
    <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.itemDistrict, { color: colors.textMuted }]}>
          {item.district}
        </Text>
        <Text style={[styles.itemRating, { color: colors.primary }]}>
          ⭐ {item.rating.toFixed(1)}
        </Text>
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

export default function AdminCategoryScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { category } = useLocalSearchParams<{ category: Category }>();
  const { data } = useAppStore();

  const items = data[category!] || [];

  const categoryInfo = {
    tourism: { title: 'Tourism', icon: 'camera-outline' as const },
    culinary: { title: 'Culinary', icon: 'restaurant-outline' as const },
    hotel: { title: 'Hotels', icon: 'bed-outline' as const },
    event: { title: 'Events', icon: 'calendar-outline' as const },
  };

  const info = categoryInfo[category!];
  const screenTitle = info ? `Manage ${info.title}` : 'Admin';

  const handleAddItem = () => {
    router.push(`/admin/${category}/new`);
  };

  const handleEditItem = (itemId: string) => {
    router.push(`/admin/${category}/${itemId}`);
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await saveLocalEdit({
              id: item.id,
              action: 'delete',
              timestamp: new Date().toISOString(),
            });
            // Refresh data by reloading the store
            const { loadAppData } = useAppStore.getState();
            loadAppData();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }: { item: Item }) => (
    <AdminItemCard
      item={item}
      onEdit={() => handleEditItem(item.id)}
      onDelete={() => handleDeleteItem(item)}
    />
  );

  if (!category || !info) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin', headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <EmptyState
            icon="alert-circle-outline"
            title="Invalid Category"
            description="The requested category does not exist."
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: screenTitle, headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name={info.icon} size={24} color={colors.primary} />
          <Text style={[styles.headerTitleText, { color: colors.text }]}>
            {info.title}
          </Text>
        </View>
        <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SectionTitle 
          title={`Manage ${info.title}`} 
          subtitle={`${items.length} items`}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={info.icon}
            title={`No ${info.title.toLowerCase()} items`}
            description="Add your first item to get started."
            action={
              <TouchableOpacity
                style={[styles.addFirstButton, { backgroundColor: colors.primary }]}
                onPress={handleAddItem}
              >
                <Text style={styles.addFirstButtonText}>Add First Item</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
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
    padding: 20,
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
  itemRating: {
    fontSize: 14,
    fontWeight: '500',
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
