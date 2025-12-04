import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Hero } from '@/components/ui/Hero';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Item } from '@/types';

const DiscoverCard = ({ 
  title, 
  icon, 
  color, 
  description,
  onPress 
}: { 
  title: string; 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string; 
  description: string;
  onPress: () => void; 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <TouchableOpacity
      style={[
        styles.discoverCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.iconContainer}
      >
        <Ionicons name={icon} size={32} color={color} />
      </LinearGradient>
      <Text style={[styles.discoverTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.discoverDescription, { color: colors.textMuted }]}>
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const TrendingCard = ({ item }: { item: Item }) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const addToRecent = useAppStore((state) => state.addToRecent);

  const handlePress = () => {
    addToRecent(item.id);
    router.push(`/${item.category}/${item.id}`);
  };


  return (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.trendingImageContainer}>
        <PlaceholderImage 
          category={item.category}
          name={item.name}
          image={item.image}
          style={styles.trendingImage}
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.ratingText}>
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.trendingContent}>
        <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.trendingDistrict, { color: colors.textMuted }]} numberOfLines={1}>
            {item.district}
          </Text>
        </View>
        <TouchableOpacity style={[styles.viewButton, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.viewButtonText, { color: colors.primary }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { getTrendingItems, loadAppData, isLoading } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const trendingItems = getTrendingItems();

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

  const discoverItems = [
    { 
      title: 'Tourism', 
      icon: 'leaf-outline' as const, 
      color: colors.primary, 
      description: 'Beautiful places to visit',
      route: '/tourism' 
    },
    { 
      title: 'Culinary', 
      icon: 'restaurant-outline' as const, 
      color: colors.secondary, 
      description: 'Delicious local food',
      route: '/culinary' 
    },
    { 
      title: 'Hotels', 
      icon: 'bed-outline' as const, 
      color: colors.accent, 
      description: 'Comfortable stays',
      route: '/hotels' 
    },
    { 
      title: 'Events', 
      icon: 'calendar-outline' as const, 
      color: '#F59E0B', 
      description: 'Exciting events',
      route: '/events' 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showLocation={true} />
    <ScrollView 
        style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Hero 
        title="Explore the Best Tourism"
        subtitle="in Your City"
      />
      
      <View style={styles.content}>
        <SectionTitle 
          title="🔥 Trending Destinations" 
          subtitle="Most popular places this week"
        />
        
        <FlatList
          data={trendingItems}
          renderItem={({ item }) => <TrendingCard item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
        />
        
        <SectionTitle 
          title="Discover More" 
          subtitle="Explore different categories"
        />
        
        <View style={styles.discoverGrid}>
          {discoverItems.map((item, index) => (
            <DiscoverCard
              key={index}
              title={item.title}
              icon={item.icon}
              color={item.color}
              description={item.description}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  trendingList: {
    paddingRight: 20,
  },
  trendingCard: {
    width: 220,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  trendingImageContainer: {
    position: 'relative',
    height: 140,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#1F2937',
  },
  trendingContent: {
    padding: 16,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingDistrict: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  discoverCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  discoverTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  discoverDescription: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
});