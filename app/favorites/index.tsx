import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Category, Item } from '@/types';

export default function FavoritesScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { data, favorites, addToRecent, loadAppData, isLoading } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Get all favorite items from all categories
  const favoriteItems = useMemo(() => {
    const allItems: (Item & { category: Category })[] = [];
    
    // Collect items from all categories
    const categories: Category[] = ['tourism', 'culinary', 'hotel', 'event'];
    
    categories.forEach(category => {
      const categoryItems = data[category] || [];
      categoryItems.forEach(item => {
        if (favorites.includes(item.id)) {
          allItems.push({ ...item, category });
        }
      });
    });
    
    return allItems;
  }, [data, favorites]);

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

  const handleItemPress = (item: Item & { category: Category }) => {
    addToRecent(item.id);
    const routeMap: Record<Category, string> = {
      tourism: '/tourism',
      culinary: '/culinary',
      hotel: '/hotels',
      event: '/events',
    };
    router.push(`${routeMap[item.category]}/${item.id}`);
  };

  const getPriceRange = (item: Item & { category: Category }) => {
    if (item.category === 'tourism' && 'admissionFee' in item) {
      return item.admissionFee;
    }
    if ('priceRange' in item) {
      return item.priceRange;
    }
    return undefined;
  };

  const renderItem = ({ item }: { item: Item & { category: Category } }) => (
    <Card
      title={item.name}
      district={item.district}
      rating={item.rating}
      description={item.description}
      image={item.image}
      category={item.category}
      priceRange={getPriceRange(item)}
      onPress={() => handleItemPress(item)}
    />
  );

  if (favoriteItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader showLocation={true} />
        <View style={styles.header}>
          <SectionTitle 
            title="Favorites" 
            subtitle="Your saved items"
          />
        </View>
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          description="Start exploring and add items to your favorites to see them here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showLocation={true} />
      <View style={styles.header}>
        <SectionTitle 
          title="Favorites" 
          subtitle={`${favoriteItems.length} ${favoriteItems.length === 1 ? 'item' : 'items'} favorited`}
        />
      </View>

      <FlatList
        data={favoriteItems}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.category}-${item.id}`}
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



