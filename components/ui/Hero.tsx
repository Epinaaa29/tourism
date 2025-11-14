import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';

const { width } = Dimensions.get('window');

interface HeroProps {
  title: string;
  subtitle?: string;
  height?: number;
}

export const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  height = 220 
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={['#3B82F6', '#F59E0B']}
        style={styles.gradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.pattern}>
          <View style={[styles.triangle, styles.triangle1]} />
          <View style={[styles.triangle, styles.triangle2]} />
          <View style={[styles.triangle, styles.triangle3]} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  triangle1: {
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    top: 20,
    left: 50,
  },
  triangle2: {
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 52,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    top: 60,
    right: 80,
  },
  triangle3: {
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 43,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    bottom: 40,
    left: 100,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

