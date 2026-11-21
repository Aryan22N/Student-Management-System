import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();

  let bg = isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA';
  let textCol = isDark ? '#4285F4' : '#0F9D58';
  let borderCol = isDark ? '#0F9D58' : '#A8D5B5';

  if (variant === 'accent' || variant === 'warning') {
    bg = isDark ? 'rgba(251, 188, 4, 0.2)' : '#FEF7E0';
    textCol = '#FBBC04';
    borderCol = isDark ? '#FBBC04' : '#FEE9B4';
  } else if (variant === 'secondary') {
    bg = isDark ? 'rgba(32, 33, 36, 0.1)' : '#EEF2F6';
    textCol = isDark ? '#8AB4F8' : '#202124';
    borderCol = isDark ? '#30363D' : '#DADCE0';
  } else if (variant === 'success') {
    bg = isDark ? 'rgba(52, 168, 83, 0.2)' : '#E6F4EA';
    textCol = isDark ? '#81C995' : '#34A853';
    borderCol = isDark ? '#34A853' : '#A8D5B5';
  } else if (variant === 'danger') {
    bg = isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6';
    textCol = isDark ? '#F28B82' : '#EA4335';
    borderCol = isDark ? '#EA4335' : '#F5C6C2';
  } else if (variant === 'neutral') {
    bg = isDark ? '#1C2128' : '#F1F5F9';
    textCol = '#5F6368';
    borderCol = isDark ? '#30363D' : '#DADCE0';
  }

  const isSm = size === 'sm';

      return (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: bg,
              borderColor: borderCol,
              paddingVertical: isSm ? 2 : 4,
              paddingHorizontal: isSm ? 8 : 10,
            },
            style,
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                color: textCol,
                fontSize: isSm ? typography.sizes.xs : typography.sizes.sm,
              },
              textStyle,
            ]}
          >
{ label }
      </Text >
    </View >
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },
});
