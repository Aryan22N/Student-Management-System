import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentTop?: boolean;
}

  export const Card: React.FC<CardProps> = ({ children, style, accentTop = false }) => {
    const { theme, isDark } = useTheme();

              return(
    <View
      style = {
                  [
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderTopColor: accentTop ? '#0F9D58' : theme.border,
                    borderTopWidth: accentTop ? 3 : 1,
                  },
                  Platform.select({
                    web: {
                      boxShadow: isDark
                        ? '0 2px 12px rgba(13, 17, 23, 0.5)'
                        : '0 1px 3px rgba(32, 33, 36, 0.05), 0 1px 2px rgba(32, 33, 36, 0.03)',
                    } as any,
                  }),
                  style,
      ]}
                  >
  { children }
    </View >
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.md,
  },
});
