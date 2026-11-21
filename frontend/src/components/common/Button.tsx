import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme, isDark } = useTheme();

  let backgroundColor = theme.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = isDark ? '#1C2128' : '#FFFFFF';
    textColor = isDark ? '#E6EDF3' : '#0F9D58';
    borderColor = '#0F9D58';
    borderWidth = 1.2;
  } else if (variant === 'accent') {
    backgroundColor = '#F28C28';
    textColor = '#FFFFFF';
  } else if (variant === 'danger') {
    backgroundColor = '#EA4335';
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = isDark ? '#4285F4' : '#0F9D58';
    borderColor = isDark ? '#0F9D58' : '#DADCE0';
    borderWidth = 1.2;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = theme.textSecondary;
  }

  const height = size === 'sm' ? 36 : size === 'lg' ? 48 : 42;
  const paddingHorizontal = size === 'sm' ? 14 : size === 'lg' ? 22 : 16;
  const fontSize =
    size === 'sm'
      ? typography.sizes.xs
      : size === 'lg'
          ? typography.sizes.md
          : typography.sizes.sm;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          height,
          paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
        },
        Platform.select({
          web: {
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            boxShadow:
              variant === 'primary'
                    ? '0 2px 6px rgba(15, 157, 88, 0.22)'
                    : variant === 'accent'
                      ? '0 2px 6px rgba(251, 188, 4, 0.22)'
                      : 'none',
            transition: 'all 0.15s ease-in-out',
          } as any,
        }),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize,
                marginLeft: icon ? spacing.xs + 2 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
