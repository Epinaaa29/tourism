import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';

interface RatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  showStars?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  size = 'medium',
  showStars = true 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  const sizeStyles = {
    small: { fontSize: 12, iconSize: 12, padding: 4 },
    medium: { fontSize: 14, iconSize: 14, padding: 6 },
    large: { fontSize: 16, iconSize: 16, padding: 8 },
  };

  const currentSize = sizeStyles[size];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return colors.success;
    if (rating >= 4.0) return colors.info;
    if (rating >= 3.0) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {showStars && (
        <Ionicons 
          name="star" 
          size={currentSize.iconSize} 
          color={getRatingColor(rating)} 
          style={styles.star}
        />
      )}
      <Text style={[
        styles.rating, 
        { 
          color: colors.text, 
          fontSize: currentSize.fontSize,
          marginLeft: showStars ? 4 : 0,
        }
      ]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  star: {
    marginRight: 2,
  },
  rating: {
    fontWeight: '600',
  },
});

