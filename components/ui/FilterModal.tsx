import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { FilterOptions, Item } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  items: Item[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  items,
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(currentFilters.district);
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(currentFilters.minRating);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | undefined>(currentFilters.priceRange);

  // Get unique districts and price ranges from items
  const districts = Array.from(new Set(items.map(item => item.district))).sort();
  const priceRanges = Array.from(new Set(items.map(item => item.priceRange).filter(Boolean))).sort();

  const handleApply = () => {
    const filters: FilterOptions = {};
    if (selectedDistrict) filters.district = selectedDistrict;
    if (selectedMinRating !== undefined) filters.minRating = selectedMinRating;
    if (selectedPriceRange) filters.priceRange = selectedPriceRange;
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedDistrict(undefined);
    setSelectedMinRating(undefined);
    setSelectedPriceRange(undefined);
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* District Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>District</Text>
              <View style={styles.optionsContainer}>
                {districts.map((district) => (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selectedDistrict === district ? colors.primary : colors.card,
                        borderColor: selectedDistrict === district ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDistrict(selectedDistrict === district ? undefined : district)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: selectedDistrict === district ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Minimum Rating</Text>
              <View style={styles.optionsContainer}>
                {[4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selectedMinRating === rating ? colors.primary : colors.card,
                        borderColor: selectedMinRating === rating ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedMinRating(selectedMinRating === rating ? undefined : rating)}
                  >
                    <View style={styles.ratingOption}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={selectedMinRating === rating ? '#FFFFFF' : '#FBBF24'}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          { color: selectedMinRating === rating ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {rating}+
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range Filter */}
            {priceRanges.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
                <View style={styles.optionsContainer}>
                  {priceRanges.map((priceRange) => (
                    <TouchableOpacity
                      key={priceRange}
                      style={[
                        styles.option,
                        {
                          backgroundColor: selectedPriceRange === priceRange ? colors.primary : colors.card,
                          borderColor: selectedPriceRange === priceRange ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedPriceRange(selectedPriceRange === priceRange ? undefined : priceRange)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: selectedPriceRange === priceRange ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {priceRange}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

