import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { LocationRow } from './LocationRow';
import { PlaceholderImage } from './PlaceholderImage';
import { RatingBadge } from './RatingBadge';

interface CardProps {
  title: string;
  district: string;
  rating: number;
  description?: string;
  image?: string;
  priceRange?: string;
  category?: string;
  onPress?: () => void;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  title,
  district,
  rating,
  description,
  image,
  priceRange,
  category,
  onPress,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <PlaceholderImage 
          category={category || 'tourism'}
          name={title}
          image={image}
          style={styles.image}
        />
        <View style={styles.ratingContainer}>
          <RatingBadge rating={rating} size="small" />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        
        <LocationRow district={district} size="small" />
        
        {description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        )}
        
        <View style={styles.footer}>
          {priceRange && (
            <Text style={[styles.priceRange, { color: colors.accent }]}>
              {priceRange}
            </Text>
          )}
          
          <View style={styles.actionContainer}>
            <Text style={[styles.actionText, { color: colors.primary }]}>
              View Details
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={colors.primary} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
