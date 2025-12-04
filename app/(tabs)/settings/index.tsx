import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { SectionTitle } from '@/components/ui/SectionTitle';
import { getColors } from '@/constants/colors';
import { useIsDarkMode } from '@/hooks/use-theme';
import { clearAllData, getAdminAuth, setAdminAuth, updateAdminCredentialsLocal, verifyAdminCredentialsLocal } from '@/lib/data';
import { useAppStore } from '@/lib/store';

export default function SettingsScreen() {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);
  const { setDarkMode, clearFilters } = useAppStore();
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check admin auth status when screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkAdminAuth = async () => {
        const auth = await getAdminAuth();
        setIsAdminAuthenticated(auth.isAuthenticated);
      };
      checkAdminAuth();
    }, [])
  );

  const handleToggleTheme = async () => {
    await setDarkMode(!isDarkMode);
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
    if (!adminUsername.trim() || !adminPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate username: must contain letters and numbers
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(adminUsername)) {
      Alert.alert('Error', 'Username must contain both letters and numbers');
      return;
    }

    // Validate password: must contain letters and numbers
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(adminPassword)) {
      Alert.alert('Error', 'Password must contain both letters and numbers');
      return;
    }

    const isValid = await verifyAdminCredentialsLocal(adminUsername.trim(), adminPassword);
    if (isValid) {
      setIsAdminAuthenticated(true);
      await setAdminAuth(true);
      setShowAdminModal(false);
      setAdminUsername('');
      setAdminPassword('');
      router.push('/admin');
    } else {
      Alert.alert('Error', 'Invalid username or password');
      setAdminUsername('');
      setAdminPassword('');
    }
  };

  const handleChangePassword = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate username: must contain letters and numbers
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newUsername)) {
      Alert.alert('Error', 'Username must contain both letters and numbers');
      return;
    }

    // Validate password: must contain letters and numbers
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain both letters and numbers');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await updateAdminCredentialsLocal(newUsername.trim(), newPassword);
      Alert.alert('Success', 'Admin credentials updated successfully');
      setShowChangePasswordModal(false);
      setNewUsername('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update credentials');
    }
  };

  const handleExitAdminMode = async () => {
    Alert.alert(
      'Exit Admin Mode',
      'Are you sure you want to exit Admin Mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            setIsAdminAuthenticated(false);
            await setAdminAuth(false);
            router.back();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              clearAuth();
              // Stay on settings screen after logout
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
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
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data Management
          </Text>
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
          {isAdminAuthenticated && (
            <>
              <SettingItem
                icon="key-outline"
                title="Change Admin Password"
                subtitle="Update admin credentials"
                onPress={() => setShowChangePasswordModal(true)}
              />
              <SettingItem
                icon="log-out-outline"
                title="Exit Admin Mode"
                subtitle="Exit admin mode and return to settings"
                onPress={handleExitAdminMode}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <SettingItem
            icon="information-circle-outline"
            title="Visiting Sangihe"
            subtitle="Version 1.0.0"
          />
        </View>
      </View>

      <Modal
        visible={showAdminModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAdminModal(false);
          setAdminUsername('');
          setAdminPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Login Admin
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Username dan password harus kombinasi huruf + angka
            </Text>
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
              value={adminUsername}
              onChangeText={setAdminUsername}
              placeholder="Username (huruf + angka)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
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
              value={adminPassword}
              onChangeText={setAdminPassword}
              placeholder="Password (huruf + angka)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setShowAdminModal(false);
                  setAdminUsername('');
                  setAdminPassword('');
                }}
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
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* Change Password Modal */}
        <Modal
          visible={showChangePasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowChangePasswordModal(false);
            setNewUsername('');
            setNewPassword('');
            setConfirmNewPassword('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Change Admin Credentials
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Username dan password harus kombinasi huruf + angka
              </Text>
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
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="New Username (huruf + angka)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
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
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password (min 6 karakter, huruf + angka)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
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
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowChangePasswordModal(false);
                    setNewUsername('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleChangePassword}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Change
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
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

