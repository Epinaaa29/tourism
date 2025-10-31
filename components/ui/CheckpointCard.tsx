import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { Checkpoint, Transport } from '../../types';

interface CheckpointCardProps {
  checkpoint?: Checkpoint;
  transport?: Transport;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

export const CheckpointCard: React.FC<CheckpointCardProps> = ({
  checkpoint,
  transport,
  order,
  isCompleted,
  isCurrent,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');

  const isTransport = !!transport;
  const item = checkpoint || transport;

  if (!item) return null;

  const getIcon = () => {
    if (isTransport) {
      switch (transport.type) {
        case 'boat':
          return 'boat-outline';
        case 'plane':
          return 'airplane-outline';
        case 'bus':
          return 'bus-outline';
        case 'train':
          return 'train-outline';
        default:
          return 'car-outline';
      }
    }

    switch (checkpoint?.type) {
      case 'landmark':
        return 'location-outline';
      case 'restaurant':
        return 'restaurant-outline';
      case 'accommodation':
        return 'bed-outline';
      default:
        return 'pin-outline';
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return colors.success;
    if (isCurrent) return colors.primary;
    return colors.textMuted;
  };

  const getStatusIcon = () => {
    if (isCompleted) return 'checkmark-circle';
    if (isCurrent) return 'radio-button-on';
    return 'radio-button-off';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: getStatusColor(),
          shadowColor: colors.shadow,
        },
        isCurrent && styles.currentCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.orderBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.orderText}>{order}</Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getIcon() as any} 
            size={24} 
            color={getStatusColor()} 
          />
        </View>

        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={20} 
            color={getStatusColor()} 
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.description}
        </Text>

        {isTransport && (
          <View style={styles.transportInfo}>
            <View style={styles.transportDetail}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.transportText, { color: colors.textMuted }]}>
                {transport.duration}
              </Text>
            </View>
            <View style={styles.transportDetail}>
              <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.transportText, { color: colors.textMuted }]}>
                {transport.price}
              </Text>
            </View>
          </View>
        )}

        {!!checkpoint?.estimatedTime && (
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {checkpoint.estimatedTime} min
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.actionText, { color: colors.primary }]}>
          {isTransport ? 'View Transport Details' : 'View Checkpoint Details'}
        </Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={colors.primary} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  currentCard: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconContainer: {
    flex: 1,
  },
  statusContainer: {
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    marginBottom: 12,
  },
  transportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
