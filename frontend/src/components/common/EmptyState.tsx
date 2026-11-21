import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  subtitle,
  action,
  style,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? '#137333' : '#E6F4EA',
              borderColor: isDark ? '#0F9D58' : '#A8D5B5',
            },
          ]}
        >
          <Ionicons name={icon} size={32} color={isDark ? '#4285F4' : '#0F9D58'} />
        </View>
        <Text style={[styles.title, { color: isDark ? '#E6F4EA' : '#137333' }]}>{title}</Text>
        {subtitle ? (
        <Text style={[styles.subtitle, { color: '#5F6368' }]}>{subtitle}</Text>
        ) : null}
        {action && <View style={styles.actionContainer}>{action}</View>}
      </View>
      );
};

      const styles = StyleSheet.create({
        container: {
        alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
  },
      iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
  },
      title: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      textAlign: 'center',
      marginBottom: 4,
      letterSpacing: 0.2,
  },
      subtitle: {
        fontSize: typography.sizes.sm,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 320,
  },
      actionContainer: {
      marginTop: spacing.md,
  },
});
