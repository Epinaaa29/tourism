import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { FilterModal } from '@/components/ui/FilterModal';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Category } from '@/types';

export default function HotelsScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { searchQuery, setSearchQuery, getFilteredData, addToRecent, loadAppData, isLoading, filters, setFilters, data } = useAppStore();
  const { user } = useAuthStore();

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const allItems = data.hotel || [];
  const items = getFilteredData('hotel' as Category);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData(user?.uid);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (itemId: string) => {
    addToRecent(itemId);
    router.push(`/hotels/${itemId}`);
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card
      title={item.name}
      district={item.district}
      rating={item.rating}
      description={item.description}
      image={item.image}
      category="hotels"
      priceRange={item.priceRange}
      onPress={() => handleItemPress(item.id)}
    />
  );

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader showLocation={true} />
        <View style={styles.header}>
          <SectionTitle title="Hotels" subtitle="Find comfortable stays" />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hotels..."
            onFilterPress={handleFilterPress}
          />
        </View>
        <EmptyState
          icon="bed-outline"
          title="No hotels found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showLocation={true} />
      <View style={styles.header}>
        <SectionTitle 
          title="Hotels" 
          subtitle="Find comfortable stays"
        />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search hotels..."
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

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        items={allItems}
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

