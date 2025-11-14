import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  subtitle, 
  rightAction 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <View style={styles.actionContainer}>
          {rightAction}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionContainer: {
    marginLeft: 16,
  },
});

