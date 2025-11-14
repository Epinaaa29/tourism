import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { getTourRoute, saveTourRoute } from '@/lib/firestore-service';
import { useTourStore } from '@/lib/tour-store';
import { useAppStore } from '@/lib/store';
import { Checkpoint, TourRoute, Transport } from '@/types';

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
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default function TourGuideEditScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppStore();
  const { loadTourRoutes } = useTourStore();
  
  const isEditing = id !== 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    destinationId: '',
    destinationName: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    totalEstimatedTime: '0',
  });
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null);
  const [checkpointForm, setCheckpointForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    type: 'landmark' as 'landmark' | 'restaurant' | 'accommodation',
    estimatedTime: '0',
    notes: '',
  });

  // Get all items for destination selection
  const allItems = [
    ...(data.tourism || []),
    ...(data.culinary || []),
    ...(data.hotel || []),
    ...(data.event || []),
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadRouteData();
    }
  }, [id, isEditing]);

  const loadRouteData = async () => {
    try {
      setIsLoading(true);
      const route = await getTourRoute(id);
      if (route) {
        setFormData({
          destinationId: route.destinationId,
          destinationName: route.destinationName,
          description: route.description || '',
          difficulty: route.difficulty,
          totalEstimatedTime: route.totalEstimatedTime.toString(),
        });
        setCheckpoints(route.checkpoints || []);
      }
    } catch (error) {
      console.error('Error loading route:', error);
      Alert.alert('Error', 'Failed to load tour route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationSelect = (itemId: string, itemName: string) => {
    setFormData(prev => ({
      ...prev,
      destinationId: itemId,
      destinationName: itemName,
    }));
  };

  const handleAddCheckpoint = () => {
    setEditingCheckpoint(null);
    setCheckpointForm({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      type: 'landmark',
      estimatedTime: '0',
      notes: '',
    });
    setShowCheckpointModal(true);
  };

  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setEditingCheckpoint(checkpoint);
    setCheckpointForm({
      name: checkpoint.name,
      description: checkpoint.description,
      latitude: checkpoint.latitude.toString(),
      longitude: checkpoint.longitude.toString(),
      type: checkpoint.type,
      estimatedTime: checkpoint.estimatedTime.toString(),
      notes: checkpoint.notes || '',
    });
    setShowCheckpointModal(true);
  };

  const handleDeleteCheckpoint = (checkpointId: string) => {
    Alert.alert(
      'Delete Checkpoint',
      'Are you sure you want to delete this checkpoint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = checkpoints.filter(cp => cp.id !== checkpointId);
            // Reorder checkpoints
            const reordered = updated.map((cp, index) => ({
              ...cp,
              order: index + 1,
            }));
            setCheckpoints(reordered);
          },
        },
      ]
    );
  };

  const handleSaveCheckpoint = () => {
    // Validation
    if (!checkpointForm.name.trim()) {
      Alert.alert('Validation Error', 'Please enter checkpoint name');
      return;
    }
    if (!checkpointForm.latitude.trim() || !checkpointForm.longitude.trim()) {
      Alert.alert('Validation Error', 'Please enter latitude and longitude');
      return;
    }

    const newCheckpoint: Checkpoint = {
      id: editingCheckpoint?.id || `checkpoint-${formData.destinationId}-${Date.now()}`,
      name: checkpointForm.name,
      description: checkpointForm.description,
      latitude: parseFloat(checkpointForm.latitude) || 0,
      longitude: parseFloat(checkpointForm.longitude) || 0,
      type: checkpointForm.type,
      order: editingCheckpoint ? editingCheckpoint.order : checkpoints.length + 1,
      estimatedTime: parseInt(checkpointForm.estimatedTime) || 0,
      notes: checkpointForm.notes || undefined,
    };

    if (editingCheckpoint) {
      // Update existing checkpoint
      const updated = checkpoints.map(cp => 
        cp.id === editingCheckpoint.id ? newCheckpoint : cp
      );
      setCheckpoints(updated);
    } else {
      // Add new checkpoint
      setCheckpoints([...checkpoints, newCheckpoint]);
    }

    setShowCheckpointModal(false);
    setEditingCheckpoint(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.destinationId.trim() || !formData.destinationName.trim()) {
      Alert.alert('Validation Error', 'Please select a destination');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return;
    }

    if (checkpoints.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one checkpoint');
      return;
    }

    try {
      setIsLoading(true);

      // Calculate total estimated time from checkpoints
      const totalTime = checkpoints.reduce((sum, cp) => sum + cp.estimatedTime, 0);

      // Get existing route or create new
      let route: TourRoute;
      if (isEditing && id) {
        const existing = await getTourRoute(id);
        if (existing) {
          route = {
            ...existing,
            destinationId: formData.destinationId,
            destinationName: formData.destinationName,
            description: formData.description,
            difficulty: formData.difficulty,
            totalEstimatedTime: totalTime,
            checkpoints: checkpoints,
          };
        } else {
          throw new Error('Route not found');
        }
      } else {
        // Create new route
        const routeId = `route-${formData.destinationId.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
        route = {
          id: routeId,
          destinationId: formData.destinationId,
          destinationName: formData.destinationName,
          description: formData.description,
          difficulty: formData.difficulty,
          totalEstimatedTime: totalTime,
          checkpoints: checkpoints,
          transports: [],
        };
      }

      await saveTourRoute(route);
      
      // Refresh routes
      await loadTourRoutes(true);
      
      Alert.alert('Success', isEditing ? 'Tour guide updated successfully' : 'Tour guide created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving tour route:', error);
      Alert.alert('Error', 'Failed to save tour guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const selectedItem = allItems.find(item => item.id === formData.destinationId);

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Edit Tour Guide' : 'Create Tour Guide', headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditing ? 'Edit Tour Guide' : 'Create Tour Guide'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle 
            title={isEditing ? 'Edit Tour Guide' : 'Create New Tour Guide'} 
            subtitle="Configure the tour route details"
          />

          {/* Destination Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Destination
            </Text>
            {formData.destinationId ? (
              <View style={[styles.selectedItem, { backgroundColor: colors.card }]}>
                <View style={styles.selectedItemContent}>
                  <Text style={[styles.selectedItemName, { color: colors.text }]}>
                    {formData.destinationName}
                  </Text>
                  <Text style={[styles.selectedItemId, { color: colors.textMuted }]}>
                    ID: {formData.destinationId}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFormData(prev => ({ ...prev, destinationId: '', destinationName: '' }))}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.itemsList} nestedScrollEnabled>
                {allItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemOption, { backgroundColor: colors.card }]}
                    onPress={() => handleDestinationSelect(item.id, item.name)}
                  >
                    <Text style={[styles.itemOptionName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemOptionId, { color: colors.textMuted }]}>
                      {item.category} • {item.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <InputField
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter tour guide description"
            multiline={true}
            inputColors={colors}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Difficulty
            </Text>
            <View style={styles.difficultyOptions}>
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    {
                      backgroundColor: formData.difficulty === difficulty ? colors.primary : colors.card,
                      borderColor: formData.difficulty === difficulty ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, difficulty }))}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    { color: formData.difficulty === difficulty ? '#FFFFFF' : colors.text }
                  ]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Checkpoints Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Checkpoints ({checkpoints.length})
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCheckpoint}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {checkpoints.length === 0 ? (
              <View style={[styles.emptyCheckpoints, { backgroundColor: colors.card }]}>
                <Ionicons name="location-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyCheckpointsText, { color: colors.textMuted }]}>
                  No checkpoints yet
                </Text>
                <Text style={[styles.emptyCheckpointsSubtext, { color: colors.textMuted }]}>
                  Add checkpoints to create a tour route
                </Text>
              </View>
            ) : (
              <View style={styles.checkpointsList}>
                {checkpoints
                  .sort((a, b) => a.order - b.order)
                  .map((checkpoint) => (
                    <View key={checkpoint.id} style={[styles.checkpointCard, { backgroundColor: colors.card }]}>
                      <View style={styles.checkpointHeader}>
                        <View style={[styles.checkpointOrder, { backgroundColor: colors.primary }]}>
                          <Text style={styles.checkpointOrderText}>{checkpoint.order}</Text>
                        </View>
                        <View style={styles.checkpointInfo}>
                          <Text style={[styles.checkpointName, { color: colors.text }]}>
                            {checkpoint.name}
                          </Text>
                          <Text style={[styles.checkpointType, { color: colors.textMuted }]}>
                            {checkpoint.type} • {checkpoint.estimatedTime} min
                          </Text>
                        </View>
                        <View style={styles.checkpointActions}>
                          <TouchableOpacity
                            style={[styles.checkpointActionButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleEditCheckpoint(checkpoint)}
                          >
                            <Ionicons name="pencil" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.checkpointActionButton, { backgroundColor: colors.error }]}
                            onPress={() => handleDeleteCheckpoint(checkpoint.id)}
                          >
                            <Ionicons name="trash" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {checkpoint.description && (
                        <Text style={[styles.checkpointDescription, { color: colors.textMuted }]} numberOfLines={2}>
                          {checkpoint.description}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.noteText, { color: colors.textMuted }]}>
              Add checkpoints to define the tour route. Each checkpoint represents a location visitors will visit during the tour.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Tour Guide' : 'Create Tour Guide'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Checkpoint Modal */}
        <Modal
          visible={showCheckpointModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCheckpointModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingCheckpoint ? 'Edit Checkpoint' : 'Add Checkpoint'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCheckpointModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <InputField
                  label="Checkpoint Name *"
                  value={checkpointForm.name}
                  onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Entrance, Main Area"
                  inputColors={colors}
                />

                <InputField
                  label="Description"
                  value={checkpointForm.description}
                  onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, description: text }))}
                  placeholder="Describe this checkpoint"
                  multiline={true}
                  inputColors={colors}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Latitude *"
                      value={checkpointForm.latitude}
                      onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, latitude: text.replace(/[^0-9.-]/g, '') }))}
                      placeholder="3.604"
                      keyboardType="numeric"
                      inputColors={colors}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Longitude *"
                      value={checkpointForm.longitude}
                      onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, longitude: text.replace(/[^0-9.-]/g, '') }))}
                      placeholder="125.494"
                      keyboardType="numeric"
                      inputColors={colors}
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Type
                  </Text>
                  <View style={styles.typeOptions}>
                    {(['landmark', 'restaurant', 'accommodation'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor: checkpointForm.type === type ? colors.primary : colors.card,
                            borderColor: checkpointForm.type === type ? colors.primary : colors.border,
                          }
                        ]}
                        onPress={() => setCheckpointForm(prev => ({ ...prev, type }))}
                      >
                        <Text style={[
                          styles.typeButtonText,
                          { color: checkpointForm.type === type ? '#FFFFFF' : colors.text }
                        ]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <InputField
                  label="Estimated Time (minutes)"
                  value={checkpointForm.estimatedTime}
                  onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, estimatedTime: text.replace(/[^0-9]/g, '') }))}
                  placeholder="0"
                  keyboardType="numeric"
                  inputColors={colors}
                />

                <InputField
                  label="Notes (optional)"
                  value={checkpointForm.notes}
                  onChangeText={(text) => setCheckpointForm(prev => ({ ...prev, notes: text }))}
                  placeholder="Additional notes or tips"
                  multiline={true}
                  inputColors={colors}
                />
              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowCheckpointModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveCheckpoint}
                >
                  <Text style={styles.modalButtonText}>Save Checkpoint</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedItemContent: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedItemId: {
    fontSize: 14,
  },
  itemsList: {
    maxHeight: 200,
  },
  itemOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemOptionId: {
    fontSize: 12,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginBottom: 24,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCheckpoints: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyCheckpointsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCheckpointsSubtext: {
    fontSize: 14,
  },
  checkpointsList: {
    gap: 12,
  },
  checkpointCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkpointOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkpointType: {
    fontSize: 12,
  },
  checkpointActions: {
    flexDirection: 'row',
    gap: 8,
  },
  checkpointActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointDescription: {
    fontSize: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '95%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
    paddingBottom: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

