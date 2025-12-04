import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import { Image } from 'expo-image';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { saveLocalEdit } from '@/lib/data';
import { pickImageAndConvertToBase64, base64ToImageUri } from '@/lib/image-base64';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Category, CulinaryItem, EventItem, HotelItem, TourismItem } from '@/types';

// InputField component - defined outside to prevent recreation on each render
const InputField = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  multiline = false,
  inputColors
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  multiline?: boolean;
  inputColors: any;
}) => {
  return (
    <View style={inputFieldStyles.inputGroup}>
      <Text style={[inputFieldStyles.inputLabel, { color: inputColors.text }]}>
        {label}
      </Text>
      <TextInput
        style={[
          inputFieldStyles.input,
          {
            backgroundColor: inputColors.surface,
            color: inputColors.text,
            borderColor: inputColors.border,
          },
          multiline && inputFieldStyles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={inputColors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        blurOnSubmit={false}
        returnKeyType={multiline ? 'default' : 'next'}
      />
    </View>
  );
});

// 14 Kecamatan di Kabupaten Kepulauan Sangihe
const DISTRICTS = [
  'Kendahe',
  'Kepulauan Marore',
  'Manganitu',
  'Manganitu Selatan',
  'Nusa Tabukan',
  'Tabukan Selatan',
  'Tabukan Selatan Tengah',
  'Tabukan Selatan Tenggara',
  'Tabukan Tengah',
  'Tabukan Utara',
  'Tahuna',
  'Tahuna Barat',
  'Tahuna Timur',
  'Tamako',
  'Tatoareng',
];

// 4 Jenis Wisata
const TOURISM_TYPES = [
  'Wisata Kuliner',
  'Wisata Alam',
  'Wisata Buatan',
  'Wisata Budaya',
];

// Dropdown Component
const DropdownField = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  placeholder,
  inputColors
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  inputColors: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={inputFieldStyles.inputGroup}>
      <Text style={[inputFieldStyles.inputLabel, { color: inputColors.text }]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          inputFieldStyles.input,
          {
            backgroundColor: inputColors.surface,
            borderColor: inputColors.border,
          }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[
          { color: value ? inputColors.text : inputColors.textMuted },
          { fontSize: 16 }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={inputColors.textMuted} />
      </TouchableOpacity>
      
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={dropdownStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[dropdownStyles.modalContent, { backgroundColor: colors.card }]}>
            <View style={dropdownStyles.modalHeader}>
              <Text style={[dropdownStyles.modalTitle, { color: colors.text }]}>
                Pilih {label}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={dropdownStyles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dropdownStyles.optionItem,
                    { 
                      backgroundColor: value === option ? colors.primary + '20' : 'transparent',
                      borderBottomColor: colors.border 
                    }
                  ]}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    dropdownStyles.optionText,
                    { 
                      color: value === option ? colors.primary : colors.text,
                      fontWeight: value === option ? '600' : '400'
                    }
                  ]}>
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const inputFieldStyles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

const dropdownStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});

export default function AdminItemScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { category, id } = useLocalSearchParams<{ category: Category; id: string }>();
  const { data } = useAppStore();
  const { user } = useAuthStore();
  
  const isEditing = id !== 'new';
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    rating: '4.0',
    description: '',
    latitude: '-6.200000',
    longitude: '106.816666',
    operatingHours: '',
    priceRange: '',
    // Category-specific fields
    admissionFee: '',
    tourismType: '', // Jenis Wisata untuk kategori tourism
    cuisineType: '',
    starRating: '3',
    amenities: '',
    startDate: '',
    endDate: '',
    venue: '',
  });
  const [mainImage, setMainImage] = useState<string | null>(null); // base64 string
  const [additionalImages, setAdditionalImages] = useState<string[]>([]); // array of base64 strings

  useEffect(() => {
    if (isEditing && category && id) {
      const existingItem = data[category]?.find(item => item.id === id);
      if (existingItem) {
        setFormData({
          name: existingItem.name,
          district: existingItem.district,
          rating: existingItem.rating.toString(),
          description: existingItem.description,
          latitude: existingItem.latitude.toString(),
          longitude: existingItem.longitude.toString(),
          operatingHours: existingItem.operatingHours || '',
          priceRange: existingItem.priceRange || '',
          admissionFee: (existingItem as TourismItem).admissionFee || '',
          tourismType: (existingItem as TourismItem).tourismType || '',
          cuisineType: (existingItem as CulinaryItem).cuisineType || '',
          starRating: ((existingItem as HotelItem).starRating || 3).toString(),
          amenities: ((existingItem as HotelItem).amenities || []).join(', '),
          startDate: (existingItem as EventItem).startDate || '',
          endDate: (existingItem as EventItem).endDate || '',
          venue: (existingItem as EventItem).venue || '',
        });
        
        // Load images (could be base64 or local keys)
        setMainImage(existingItem.image || null);
        setAdditionalImages(existingItem.images || []);
      }
    }
  }, [isEditing, category, id, data]);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim() || !formData.district.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate main image is required
    if (!mainImage) {
      Alert.alert('Error', 'Please select a main image');
      return;
    }

    const rating = parseFloat(formData.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      Alert.alert('Error', 'Rating must be between 0 and 5');
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    try {
      let itemData: any = {
        // For new items, let Firestore generate the ID
        // For editing, use the existing ID
        id: isEditing ? id : undefined,
        category: category!,
        name: formData.name.trim(),
        district: formData.district.trim(),
        rating: rating,
        description: formData.description.trim(),
        latitude: latitude,
        longitude: longitude,
        image: mainImage, // Always use the actual image, no placeholder fallback
        images: additionalImages.length > 0 ? additionalImages : undefined,
        operatingHours: formData.operatingHours.trim() || undefined,
        priceRange: formData.priceRange.trim() || undefined,
      };

      // Add category-specific fields
      if (category === 'tourism') {
        itemData.admissionFee = formData.admissionFee.trim() || undefined;
        itemData.tourismType = formData.tourismType.trim() || undefined;
      } else if (category === 'culinary') {
        itemData.cuisineType = formData.cuisineType.trim() || undefined;
        itemData.priceRange = formData.priceRange.trim() || '$';
      } else if (category === 'hotel') {
        const starRating = parseInt(formData.starRating);
        if (!isNaN(starRating)) {
          itemData.starRating = starRating;
        }
        itemData.priceRange = formData.priceRange.trim() || '$';
        itemData.amenities = formData.amenities.trim() 
          ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
          : undefined;
      } else if (category === 'event') {
        itemData.startDate = formData.startDate.trim() || undefined;
        itemData.endDate = formData.endDate.trim() || undefined;
        itemData.venue = formData.venue.trim() || undefined;
      }

      await saveLocalEdit({
        id: isEditing ? itemData.id : '', // For new items, ID will be generated by Firestore
        action: isEditing ? 'update' : 'create',
        data: itemData,
        timestamp: new Date().toISOString(),
      }, user?.uid);

      // Reload data after saving
      const { loadAppData } = useAppStore.getState();
      await loadAppData(user?.uid);

      Alert.alert(
        'Success',
        `Item ${isEditing ? 'updated' : 'created'} successfully`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error saving item:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to save item';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePickMainImage = async () => {
    try {
      const base64Image = await pickImageAndConvertToBase64();
      if (base64Image) {
        setMainImage(base64Image);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handlePickAdditionalImage = async () => {
    try {
      const base64Image = await pickImageAndConvertToBase64();
      if (base64Image) {
        setAdditionalImages([...additionalImages, base64Image]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const getImageSource = (base64: string) => {
    if (base64.startsWith('data:image')) {
      return { uri: base64 };
    }
    return base64ToImageUri(base64);
  };

  // Memoize colors to prevent InputField re-renders
  const inputColors = useMemo(() => colors, [isDarkMode]);

  // Create stable callback handlers for all form fields
  const handleNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleDistrictChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, district: text }));
  }, []);

  const handleTourismTypeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, tourismType: text }));
  }, []);

  const handleRatingChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, rating: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handleLatitudeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, latitude: text }));
  }, []);

  const handleLongitudeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, longitude: text }));
  }, []);

  const handleOperatingHoursChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, operatingHours: text }));
  }, []);

  const handlePriceRangeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, priceRange: text }));
  }, []);

  const handleAdmissionFeeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, admissionFee: text }));
  }, []);

  const handleCuisineTypeChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, cuisineType: text }));
  }, []);

  const handleStarRatingChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, starRating: text }));
  }, []);

  const handleAmenitiesChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, amenities: text }));
  }, []);

  const handleStartDateChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, startDate: text }));
  }, []);

  const handleEndDateChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, endDate: text }));
  }, []);

  const handleVenueChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, venue: text }));
  }, []);

  const categoryInfo = {
    tourism: { title: 'Tourism', icon: 'camera-outline' as const },
    culinary: { title: 'Culinary', icon: 'restaurant-outline' as const },
    hotel: { title: 'Hotels', icon: 'bed-outline' as const },
    event: { title: 'Events', icon: 'calendar-outline' as const },
  };

  const info = categoryInfo[category!];
  const screenTitle = info ? `${isEditing ? 'Edit' : 'Add'} ${info.title}` : 'Admin';

  if (!category || !info) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin', headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Invalid category
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: screenTitle, headerShown: false }} />
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name={info.icon} size={24} color={colors.primary} />
          <Text style={[styles.headerTitleText, { color: colors.text }]}>
            {isEditing ? 'Edit' : 'Add'} {info.title} Item
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SectionTitle 
          title={isEditing ? 'Edit Item' : 'Add New Item'} 
          subtitle={`Fill in the details for this ${info.title.toLowerCase()} item`}
        />

        <View style={styles.form}>
          <InputField
            label="Name *"
            value={formData.name}
            onChangeText={handleNameChange}
            placeholder="Enter item name"
            inputColors={inputColors}
          />

          <DropdownField
            label="District *"
            value={formData.district}
            options={DISTRICTS}
            onSelect={handleDistrictChange}
            placeholder="Pilih Kecamatan"
            inputColors={inputColors}
          />

          <InputField
            label="Rating *"
            value={formData.rating}
            onChangeText={handleRatingChange}
            placeholder="0.0 - 5.0"
            keyboardType="numeric"
            inputColors={inputColors}
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={handleDescriptionChange}
            placeholder="Enter detailed description"
            multiline
            inputColors={inputColors}
          />

          {/* Image Upload Section */}
          <View style={inputFieldStyles.inputGroup}>
            <Text style={[inputFieldStyles.inputLabel, { color: colors.text }]}>
              Main Image *
            </Text>
            {mainImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={getImageSource(mainImage)} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveMainImage}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imagePickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickMainImage}
              >
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={[styles.imagePickerText, { color: colors.text }]}>
                  Pick Main Image
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Additional Images */}
          <View style={inputFieldStyles.inputGroup}>
            <Text style={[inputFieldStyles.inputLabel, { color: colors.text }]}>
              Additional Images ({additionalImages.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.additionalImagesContainer}>
              {additionalImages.map((img, index) => (
                <View key={index} style={styles.additionalImageWrapper}>
                  <Image 
                    source={getImageSource(img)} 
                    style={styles.additionalImagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeAdditionalImageButton}
                    onPress={() => handleRemoveAdditionalImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addImageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickAdditionalImage}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
                <Text style={[styles.addImageText, { color: colors.text }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.coordinatesRow}>
            <InputField
              label="Latitude *"
              value={formData.latitude}
              onChangeText={handleLatitudeChange}
              placeholder="-6.200000"
              keyboardType="numeric"
              inputColors={inputColors}
            />
            <InputField
              label="Longitude *"
              value={formData.longitude}
              onChangeText={handleLongitudeChange}
              placeholder="106.816666"
              keyboardType="numeric"
              inputColors={inputColors}
            />
          </View>

          <InputField
            label="Operating Hours"
            value={formData.operatingHours}
            onChangeText={handleOperatingHoursChange}
            placeholder="e.g., 9:00 AM - 5:00 PM"
            inputColors={inputColors}
          />

          <InputField
            label="Price Range"
            value={formData.priceRange}
            onChangeText={handlePriceRangeChange}
            placeholder="e.g., $, $$, $$$, $$$$"
            inputColors={inputColors}
          />

          {/* Category-specific fields */}
          {category === 'tourism' && (
            <>
              <DropdownField
                label="Jenis Wisata *"
                value={formData.tourismType}
                options={TOURISM_TYPES}
                onSelect={handleTourismTypeChange}
                placeholder="Pilih Jenis Wisata"
                inputColors={inputColors}
              />
              <InputField
                label="Admission Fee"
                value={formData.admissionFee}
                onChangeText={handleAdmissionFeeChange}
                placeholder="e.g., Free, $5, $10"
                inputColors={inputColors}
              />
            </>
          )}

          {category === 'culinary' && (
            <InputField
              label="Cuisine Type"
              value={formData.cuisineType}
              onChangeText={handleCuisineTypeChange}
              placeholder="e.g., Italian, Japanese, Local"
              inputColors={inputColors}
            />
          )}

          {category === 'hotel' && (
            <>
              <InputField
                label="Star Rating"
                value={formData.starRating}
                onChangeText={handleStarRatingChange}
                placeholder="1-5"
                keyboardType="numeric"
                inputColors={inputColors}
              />
              <InputField
                label="Amenities"
                value={formData.amenities}
                onChangeText={handleAmenitiesChange}
                placeholder="WiFi, Pool, Spa, Gym (comma separated)"
                inputColors={inputColors}
              />
            </>
          )}

          {category === 'event' && (
            <>
              <InputField
                label="Start Date"
                value={formData.startDate}
                onChangeText={handleStartDateChange}
                placeholder="2024-07-15T18:00:00.000Z"
                inputColors={inputColors}
              />
              <InputField
                label="End Date"
                value={formData.endDate}
                onChangeText={handleEndDateChange}
                placeholder="2024-07-17T23:00:00.000Z"
                inputColors={inputColors}
              />
              <InputField
                label="Venue"
                value={formData.venue}
                onChangeText={handleVenueChange}
                placeholder="Event venue name"
                inputColors={inputColors}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 20,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  additionalImagesContainer: {
    marginTop: 8,
  },
  additionalImageWrapper: {
    position: 'relative',
    marginRight: 12,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  additionalImagePreview: {
    width: '100%',
    height: '100%',
  },
  removeAdditionalImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  addImageButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

