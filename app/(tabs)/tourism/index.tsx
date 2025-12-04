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

/**
 * Extract and format price range from admissionFee text
 * Converts admissionFee text to format: 'Rp xxx.xxx - Rp xxx.xxx' or 'Gratis'
 * Returns 'Gratis' as fallback if no price information is found
 */
function formatAdmissionFeeAsPriceRange(admissionFee?: string): string {
  if (!admissionFee || typeof admissionFee !== 'string') {
    return 'Gratis';
  }

  const text = admissionFee.trim();
  
  // Check if it's free
  if (/gratis|free|tidak ada biaya|tidak ada retribusi/i.test(text)) {
    return 'Gratis';
  }

  const prices: number[] = [];
  
  // Pattern 1: Extract "Rp" followed by numbers (with or without dots/commas)
  const rpPattern = /Rp\s*\.?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:\.?[0-9]+)?)/gi;
  let match;
  while ((match = rpPattern.exec(text)) !== null) {
    const numStr = match[1].replace(/\./g, ''); // Remove thousand separators
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > 0) {
      prices.push(num);
    }
  }

  // Pattern 2: Extract numbers followed by "per" or "untuk" (like "10000 per orang")
  const perPattern = /([0-9]{1,3}(?:\.[0-9]{3})*(?:\.?[0-9]+)?)\s*(?:per|untuk|rp)/gi;
  while ((match = perPattern.exec(text)) !== null) {
    const numStr = match[1].replace(/\./g, '');
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > 0 && num >= 1000) { // Only consider numbers >= 1000 as prices
      prices.push(num);
    }
  }

  // Pattern 3: Extract standalone large numbers (4+ digits) that are likely prices
  if (prices.length === 0) {
    const standalonePattern = /\b([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,})\b/g;
    while ((match = standalonePattern.exec(text)) !== null) {
      const numStr = match[1].replace(/\./g, '');
      const num = parseInt(numStr, 10);
      // Only consider numbers >= 1000 as prices (to avoid matching years, etc.)
      if (!isNaN(num) && num >= 1000 && num < 100000000) { // Reasonable price range
        prices.push(num);
      }
    }
  }

  // Pattern 4: Extract numbers from phrases like "Mulai dari 100.000" or "Harga 5000"
  if (prices.length === 0) {
    const hargaPattern = /(?:mulai\s+dari|harga|tarif|biaya)\s+([0-9]{1,3}(?:\.[0-9]{3})*(?:\.?[0-9]+)?)/gi;
    while ((match = hargaPattern.exec(text)) !== null) {
      const numStr = match[1].replace(/\./g, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > 0) {
        prices.push(num);
      }
    }
  }

  // Format numbers with dots as thousand separators
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (prices.length === 0) {
    // No prices found, return "Gratis" as fallback
    return 'Gratis';
  }

  // Remove duplicates and sort
  const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);

  if (uniquePrices.length === 1) {
    return `Rp ${formatNumber(uniquePrices[0])}`;
  } else if (uniquePrices.length >= 2) {
    // Use min and max
    const min = uniquePrices[0];
    const max = uniquePrices[uniquePrices.length - 1];
    // Only show range if there's a meaningful difference
    if (max > min * 1.5) {
      return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)}`;
    } else {
      // If prices are close, just show the average or min
      return `Rp ${formatNumber(min)}`;
    }
  }

  // Fallback to "Gratis" if something unexpected happens
  return 'Gratis';
}

export default function TourismScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { searchQuery, setSearchQuery, getFilteredData, addToRecent, loadAppData, isLoading, filters, setFilters, data } = useAppStore();
  const { user } = useAuthStore();

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const allItems = data.tourism || [];
  const items = getFilteredData('tourism' as Category);

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
    router.push(`/tourism/${itemId}`);
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const renderItem = ({ item }: { item: any }) => {
    // Extract price range from admissionFee for display
    const priceRange = formatAdmissionFeeAsPriceRange(item.admissionFee);
    
    return (
      <Card
        title={item.name}
        district={item.district}
        rating={item.rating}
        description={item.description}
        image={item.image}
        category="tourism"
        priceRange={priceRange}
        onPress={() => handleItemPress(item.id)}
      />
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader showLocation={true} />
        <View style={styles.header}>
          <SectionTitle title="Tourism" subtitle="Discover amazing places" />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tourism spots..."
            onFilterPress={handleFilterPress}
          />
        </View>
        <EmptyState
          icon="leaf-outline"
          title="No tourism spots found"
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
          title="Tourism" 
          subtitle="Discover amazing places"
        />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tourism spots..."
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

