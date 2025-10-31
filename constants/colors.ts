export const Colors = {
  light: {
    primary: '#2563EB', // Blue
    primaryDark: '#1E40AF',
    secondary: '#60A5FA', // Light Blue
    accent: '#3B82F6', // Blue accent
    background: '#FFFFFF',
    surface: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: {
      primary: ['#2563EB', '#3B82F6'],
      secondary: ['#60A5FA', '#93C5FD'],
      accent: ['#3B82F6', '#2563EB'],
      hero: ['#2563EB', '#1E40AF'],
    },
  },
  dark: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#60A5FA',
    accent: '#3B82F6',
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#4B5563',
    borderLight: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    gradient: {
      primary: ['#3B82F6', '#60A5FA'],
      secondary: ['#60A5FA', '#93C5FD'],
      accent: ['#3B82F6', '#2563EB'],
      hero: ['#2563EB', '#1E40AF'],
    },
  },
};

export const getColors = (isDark: boolean) => isDark ? Colors.dark : Colors.light;

