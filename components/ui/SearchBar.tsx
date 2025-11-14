import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { getColors } from '../../constants/colors';
import { useIsDarkMode } from '../../hooks/use-theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
  showFilter = true,
}) => {
  const isDarkMode = useIsDarkMode();
  const colors = getColors(isDarkMode);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }
    ]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={colors.textMuted} 
        style={styles.searchIcon}
      />
      
      <TextInput
        style={[
          styles.input,
          { color: colors.text }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
      />
      
      {showFilter && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
        >
          <Ionicons 
            name="options-outline" 
            size={20} 
            color={colors.textMuted} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
});

