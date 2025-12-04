import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { useAppStore } from '@/lib/store';
import { Category } from '@/types';
import { setAdminAuth } from '@/lib/data';

export const options = {
  title: 'Admin Panel',
  headerShown: false,
};

const CategoryCard = ({ 
  category, 
  count, 
  onPress 
}: { 
  category: Category; 
  count: number; 
  onPress: () => void; 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  const categoryInfo = {
    tourism: { title: 'Tourism', icon: 'camera-outline' as const, color: colors.primary },
    culinary: { title: 'Culinary', icon: 'restaurant-outline' as const, color: colors.secondary },
    hotel: { title: 'Hotels', icon: 'bed-outline' as const, color: colors.accent },
    event: { title: 'Events', icon: 'calendar-outline' as const, color: '#F59E0B' },
  };

  const info = categoryInfo[category];

  return (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: info.color + '20' }]}>
        <Ionicons name={info.icon} size={32} color={info.color} />
      </View>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {info.title}
      </Text>
      <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
        {count} items
      </Text>
    </TouchableOpacity>
  );
};

export default function AdminScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { data } = useAppStore();

  const categories: Category[] = ['tourism', 'culinary', 'hotel', 'event'];
  
  const getCategoryCount = (category: Category) => {
    return data[category]?.length || 0;
  };

  const handleCategoryPress = (category: Category) => {
    router.push(`/admin/${category}`);
  };

  const handleTourGuidesPress = () => {
    router.push('/admin/tour-guides');
  };

  const handleBack = async () => {
    // Exit admin mode when going back
    await setAdminAuth(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Admin Panel
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <SectionTitle 
          title="Manage Content" 
          subtitle="Add, edit, or delete items in each category"
        />

        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              count={getCategoryCount(category)}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
          
          {/* Tour Guides Card */}
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: colors.card }]}
            onPress={handleTourGuidesPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
              <Ionicons name="map-outline" size={32} color="#8B5CF6" />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              Tour Guides
            </Text>
            <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
              Manage routes
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Total Items
          </Text>
          <Text style={[styles.statsNumber, { color: colors.primary }]}>
            {categories.reduce((total, category) => total + getCategoryCount(category), 0)}
          </Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
  },
  statsContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
});

