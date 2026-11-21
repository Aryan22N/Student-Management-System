import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputWrapperStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  containerStyle,
  inputWrapperStyle,
  style,
  ...rest
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? theme.danger
    : isFocused
        ? '#0F9D58'
        : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
          <Text style={[styles.label, { color: isDark ? '#E6EDF3' : '#137333' }]}>
            {label}
          </Text>
      ) : null}

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.inputBackground,
                borderColor,
              },
              isFocused && {
                borderWidth: 1.5,
                borderColor: '#0F9D58',
                ...(Platform.OS === 'web'
                  ? ({
                    boxShadow: '0 0 0 3px rgba(15, 157, 88, 0.15)',
                  } as any)
                  : {}),
              },
              error ? styles.inputWrapperError : null,
              inputWrapperStyle,
            ]}
          >
            {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

            <TextInput
              placeholderTextColor="#5F6368"
              secureTextEntry={isPassword && !showPassword}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={[
                styles.input,
                {
                  color: theme.text,
                },
                Platform.select({
                  web: {
                    outlineStyle: 'none',
                    outlineWidth: 0,
                  } as any,
                }),
                style,
              ]}
              {...rest}
            />

            {isPassword ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#5F6368"
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          ) : null}
        </View>
      );
};

      const styles = StyleSheet.create({
        container: {
        marginBottom: spacing.md,
      width: '100%',
  },
      label: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
  },
      inputWrapper: {
        flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.2,
      borderRadius: spacing.borderRadius.sm,
      paddingHorizontal: spacing.md,
      height: 46,
  },
      inputWrapperError: {
        borderWidth: 1.5,
  },
      leftIconContainer: {
        marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
  },
      input: {
        flex: 1,
      fontSize: typography.sizes.sm,
      height: '100%',
      paddingVertical: 0,
  },
      eyeIcon: {
        paddingLeft: spacing.sm,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: {
        cursor: 'pointer' as any,
      },
    }),
  },
      errorText: {
        fontSize: typography.sizes.xs,
      marginTop: 4,
      fontWeight: typography.weights.medium,
  },
});
