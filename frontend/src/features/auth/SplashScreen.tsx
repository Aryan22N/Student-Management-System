import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { restoreAuth } from '../../store/slices/authSlice';
import { Icon } from '../../components/common/Icon';
import { spacing, typography } from '../../theme';

export const SplashScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { isRestoringAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
        <View style={[styles.container, { backgroundColor: isDark ? '#082F49' : '#E6F4EA' }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#0F9D58' }]}>
            <Icon name="GraduationCap" size={44} color="#FFFFFF" />
          </View>
            <Text style={[styles.eyebrow, { color: '#0F9D58' }]}>INSTITUTIONAL SUITE</Text>
            <Text style={[styles.title, { color: isDark ? '#E6F4EA' : '#137333' }]}>ACADEMIA SMS</Text>
            <Text style={[styles.subtitle, { color: '#5F6368' }]}>
              Academic Performance & Point System
            </Text>
            {isRestoringAuth && (
              <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="small" color="#0F9D58" />
                  <Text style={styles.loadingText}>
                    Restoring encrypted session...
                  </Text>
              </View>
            )}
        </View>
        );
};

        const styles = StyleSheet.create({
          container: {
          flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
  },
        iconContainer: {
        width: 80,
        height: 80,
        borderRadius: spacing.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
  },
        eyebrow: {
          fontSize: 10,
        fontWeight: typography.weights.extrabold,
        letterSpacing: 1.2,
        marginBottom: 4,
  },
        title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.extrabold,
        letterSpacing: 0.5,
  },
        subtitle: {
        fontSize: typography.sizes.xs,
        marginTop: 4,
  },
        loadingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: 8,
  },
        loadingText: {
        fontSize: typography.sizes.xs,
        color: '#5F6368',
  },
});
