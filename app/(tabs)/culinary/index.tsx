import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useAppStore } from '@/lib/store';
import { Category } from '@/types';

export default function CulinaryScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { searchQuery, setSearchQuery, getFilteredData, addToRecent, loadAppData, isLoading } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const items = getFilteredData('culinary' as Category);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (itemId: string) => {
    addToRecent(itemId);
    router.push(`/culinary/${itemId}`);
  };

  const handleFilterPress = () => {
    setShowFilters(!showFilters);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card
      title={item.name}
      district={item.district}
      rating={item.rating}
      description={item.description}
      image={item.image}
      category="culinary"
      priceRange={item.priceRange}
      onPress={() => handleItemPress(item.id)}
    />
  );

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <SectionTitle title="Culinary" subtitle="Discover delicious food" />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search restaurants..."
            onFilterPress={handleFilterPress}
          />
        </View>
        <EmptyState
          icon="restaurant-outline"
          title="No restaurants found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SectionTitle 
          title="Culinary" 
          subtitle="Discover delicious food"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/admin')}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants..."
          onFilterPress={handleFilterPress}
        />
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

