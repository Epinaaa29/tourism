import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useTourStore } from '../../lib/tour-store';
import { Transport } from '../../types';

export default function TransportDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { transportId } = useLocalSearchParams<{ transportId: string }>();
  
  const { routes } = useTourStore();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    findTransport();
  }, [transportId]);

  const findTransport = () => {
    try {
      setIsLoading(true);
      
      for (const route of routes) {
        const foundTransport = route.transports.find(t => t.id === transportId);
        if (foundTransport) {
          setTransport(foundTransport);
          break;
        }
      }
    } catch (error) {
      console.error('Error finding transport:', error);
      Alert.alert('Error', 'Failed to load transport details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTransport = () => {
    if (!transport?.bookingUrl) {
      Alert.alert('Booking Not Available', 'Online booking is not available for this transport. Please contact the service directly.');
      return;
    }

    Linking.openURL(transport.bookingUrl).catch(err => {
      console.error('Error opening booking URL:', err);
      Alert.alert('Error', 'Failed to open booking website');
    });
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
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
  };

  const getTransportColor = (type: string) => {
    switch (type) {
      case 'boat':
        return '#3B82F6';
      case 'plane':
        return '#10B981';
      case 'bus':
        return '#F59E0B';
      case 'train':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading transport details...
          </Text>
        </View>
      </View>
    );
  }

  if (!transport) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Transport Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            The requested transport could not be found.
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {transport.name}
          </Text>
          <View style={styles.headerSubtitle}>
            <Ionicons 
              name={getTransportIcon(transport.type) as any} 
              size={16} 
              color={getTransportColor(transport.type)} 
            />
            <Text style={[styles.typeText, { color: getTransportColor(transport.type) }]}>
              {transport.type.charAt(0).toUpperCase() + transport.type.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description Section */}
        <View style={[styles.descriptionSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {transport.description}
          </Text>
        </View>

        {/* Route Information */}
        <View style={[styles.routeSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Route Information
          </Text>
          
          <View style={styles.routeInfo}>
            <View style={styles.routeItem}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.routeContent}>
                <Text style={[styles.routeLabel, { color: colors.text }]}>
                  Departure
                </Text>
                <Text style={[styles.routeValue, { color: colors.textSecondary }]}>
                  {transport.departurePoint}
                </Text>
              </View>
            </View>

            <View style={styles.routeArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
            </View>

            <View style={styles.routeItem}>
              <Ionicons name="flag-outline" size={20} color={colors.primary} />
              <View style={styles.routeContent}>
                <Text style={[styles.routeLabel, { color: colors.text }]}>
                  Arrival
                </Text>
                <Text style={[styles.routeValue, { color: colors.textSecondary }]}>
                  {transport.arrivalPoint}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={[styles.scheduleSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Schedule
          </Text>
          
          <View style={styles.scheduleList}>
            {transport.schedule.map((time, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={[styles.timeBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.timeText, { color: colors.primary }]}>
                    {time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Details Section */}
        <View style={[styles.detailsSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Details
          </Text>
          
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  Duration
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {transport.duration}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  Price
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {transport.price}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  Frequency
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {transport.schedule.length} departures daily
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Section */}
        {transport.bookingUrl && (
          <View style={[styles.bookingSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Booking
            </Text>
            <Text style={[styles.bookingDescription, { color: colors.textSecondary }]}>
              You can book tickets online through our partner website.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionSection, { backgroundColor: colors.background }]}>
        {transport.bookingUrl ? (
          <TouchableOpacity 
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
            onPress={handleBookTransport}
          >
            <Ionicons name="card-outline" size={24} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Book Online</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.contactSection, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              Online booking not available. Please contact the service directly.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  routeSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeContent: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 14,
  },
  routeArrow: {
    marginHorizontal: 16,
  },
  scheduleSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scheduleItem: {
    marginBottom: 8,
  },
  timeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
  },
  bookingSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    padding: 16,
    paddingBottom: 30,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
});
