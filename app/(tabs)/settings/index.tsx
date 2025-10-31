import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { clearAllData, getAdminAuth, setAdminAuth, updateAdminPin, verifyAdminPinLocal } from '@/lib/data';
import { useAppStore } from '@/lib/store';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark');
  const { isDarkMode, setDarkMode, favorites, clearFilters } = useAppStore();
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleToggleTheme = () => {
    setDarkMode(!isDarkMode);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including favorites and recent items. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            clearFilters();
            // Additional cache clearing logic can be added here
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will reset all app data including admin changes. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  const handleAdminAccess = () => {
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async () => {
    const isValid = await verifyAdminPinLocal(adminPin);
    if (isValid) {
      setIsAdminAuthenticated(true);
      await setAdminAuth(true);
      setShowAdminModal(false);
      setAdminPin('');
      router.push('/admin');
    } else {
      Alert.alert('Error', 'Invalid PIN');
      setAdminPin('');
    }
  };

  const handleChangePin = async () => {
    if (!newPin || newPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmNewPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await updateAdminPin(newPin);
      Alert.alert('Success', 'PIN updated successfully');
      setShowChangePinModal(false);
      setNewPin('');
      setConfirmNewPin('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update PIN');
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    rightElement?: React.ReactNode; 
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <SectionTitle title="Settings" subtitle="Customize your experience" />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? '#FFFFFF' : colors.textMuted}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tour Management
          </Text>
          <SettingItem
            icon="map-outline"
            title="Tour History"
            subtitle="View your tour history and progress"
            onPress={() => router.push('/tour-history')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data Management
          </Text>
          <SettingItem
            icon="heart-outline"
            title="Favorites"
            subtitle={`${favorites.length} items favorited`}
            onPress={() => {
              // Navigate to favorites list
            }}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Remove cached data and filters"
            onPress={handleClearCache}
          />
          <SettingItem
            icon="refresh-outline"
            title="Reset All Data"
            subtitle="Reset app to initial state"
            onPress={handleResetData}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Admin
          </Text>
          <SettingItem
            icon="shield-checkmark-outline"
            title="Admin Mode"
            subtitle="Manage app content"
            onPress={handleAdminAccess}
          />
          <SettingItem
            icon="key-outline"
            title="Change Admin PIN"
            subtitle="Update admin access PIN"
            onPress={() => setShowChangePinModal(true)}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <SettingItem
            icon="information-circle-outline"
            title="City Explorer"
            subtitle="Version 1.0.0"
          />
        </View>
      </View>

      <Modal
        visible={showAdminModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enter Admin PIN
            </Text>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              value={adminPin}
              onChangeText={setAdminPin}
              placeholder="Enter PIN"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowAdminModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAdminSubmit}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Enter
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </Modal>

        {/* Change PIN Modal */}
        <Modal
          visible={showChangePinModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowChangePinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Change Admin PIN
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="New PIN (min 4 digits)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                    marginTop: 12,
                  }
                ]}
                value={confirmNewPin}
                onChangeText={setConfirmNewPin}
                placeholder="Confirm New PIN"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                keyboardType="numeric"
                maxLength={10}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowChangePinModal(false);
                    setNewPin('');
                    setConfirmNewPin('');
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleChangePin}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Change PIN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

