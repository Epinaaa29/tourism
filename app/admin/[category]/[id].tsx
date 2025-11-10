import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Image } from 'expo-image';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { saveLocalEdit } from '@/lib/data';
import { pickImageAndConvertToBase64, base64ToImageUri } from '@/lib/image-base64';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Category, CulinaryItem, EventItem, HotelItem, TourismItem } from '@/types';

export default function AdminItemScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
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

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    multiline = false 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: any;
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          },
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );

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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter item name"
          />

          <InputField
            label="District *"
            value={formData.district}
            onChangeText={(text) => setFormData({ ...formData, district: text })}
            placeholder="e.g., City Center, North District"
          />

          <InputField
            label="Rating *"
            value={formData.rating}
            onChangeText={(text) => setFormData({ ...formData, rating: text })}
            placeholder="0.0 - 5.0"
            keyboardType="numeric"
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter detailed description"
            multiline
          />

          {/* Image Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
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
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
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
              onChangeText={(text) => setFormData({ ...formData, latitude: text })}
              placeholder="-6.200000"
              keyboardType="numeric"
            />
            <InputField
              label="Longitude *"
              value={formData.longitude}
              onChangeText={(text) => setFormData({ ...formData, longitude: text })}
              placeholder="106.816666"
              keyboardType="numeric"
            />
          </View>

          <InputField
            label="Operating Hours"
            value={formData.operatingHours}
            onChangeText={(text) => setFormData({ ...formData, operatingHours: text })}
            placeholder="e.g., 9:00 AM - 5:00 PM"
          />

          <InputField
            label="Price Range"
            value={formData.priceRange}
            onChangeText={(text) => setFormData({ ...formData, priceRange: text })}
            placeholder="e.g., $, $$, $$$, $$$$"
          />

          {/* Category-specific fields */}
          {category === 'tourism' && (
            <InputField
              label="Admission Fee"
              value={formData.admissionFee}
              onChangeText={(text) => setFormData({ ...formData, admissionFee: text })}
              placeholder="e.g., Free, $5, $10"
            />
          )}

          {category === 'culinary' && (
            <InputField
              label="Cuisine Type"
              value={formData.cuisineType}
              onChangeText={(text) => setFormData({ ...formData, cuisineType: text })}
              placeholder="e.g., Italian, Japanese, Local"
            />
          )}

          {category === 'hotel' && (
            <>
              <InputField
                label="Star Rating"
                value={formData.starRating}
                onChangeText={(text) => setFormData({ ...formData, starRating: text })}
                placeholder="1-5"
                keyboardType="numeric"
              />
              <InputField
                label="Amenities"
                value={formData.amenities}
                onChangeText={(text) => setFormData({ ...formData, amenities: text })}
                placeholder="WiFi, Pool, Spa, Gym (comma separated)"
              />
            </>
          )}

          {category === 'event' && (
            <>
              <InputField
                label="Start Date"
                value={formData.startDate}
                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                placeholder="2024-07-15T18:00:00.000Z"
              />
              <InputField
                label="End Date"
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                placeholder="2024-07-17T23:00:00.000Z"
              />
              <InputField
                label="Venue"
                value={formData.venue}
                onChangeText={(text) => setFormData({ ...formData, venue: text })}
                placeholder="Event venue name"
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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

