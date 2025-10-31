import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getColors } from '../../constants/colors';

interface LocationRowProps {
  district: string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const LocationRow: React.FC<LocationRowProps> = ({ 
  district, 
  size = 'medium',
  showIcon = true 
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  const sizeStyles = {
    small: { fontSize: 12, iconSize: 12 },
    medium: { fontSize: 14, iconSize: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons 
          name="location-outline" 
          size={currentSize.iconSize} 
          color={colors.textMuted} 
          style={styles.icon}
        />
      )}
      <Text style={[
        styles.district, 
        { 
          color: colors.textMuted, 
          fontSize: currentSize.fontSize 
        }
      ]}>
        {district}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  district: {
    fontWeight: '500',
  },
});

