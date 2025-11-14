import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: colors.surface }
      ]}>
        <Ionicons 
          name={icon} 
          size={48} 
          color={colors.textMuted} 
        />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    marginTop: 16,
  },
});

