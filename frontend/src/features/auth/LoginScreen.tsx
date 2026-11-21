import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearAuthError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid academic email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    dispatch(clearAuthError());
    dispatch(login(data));
  };

  return (
    <ScreenContainer maxWidth={480} centered noSidebar>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
                  {/* Main Auth Card */}
                  <Card accentTop style={styles.authCard}>
                    {/* Header / Brand Crest */}
                    <View style={styles.header}>
                      <View
                        style={[
                          styles.logoCircle,
                          {
                            backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA',
                            borderColor: '#0F9D58',
                          },
                        ]}
                      >
                        <Icon name="GraduationCap" size={32} color="#0F9D58" />
                      </View>
                      <Text style={styles.eyebrow}>ACADEMIA MANAGEMENT SUITE</Text>
                      <Text style={[styles.title, { color: theme.text }]}>
                        Institutional Sign In
                      </Text>
                      <Text style={styles.subtitle}>
                        Access your academic standing, merit ledger, and courses
                      </Text>
                    </View>

                    {/* Error Banner */}
                    {error ? (
                      <View
                        style={[
                          styles.errorBanner,
                          { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' },
                        ]}
                      >
                        <Icon name="AlertCircle" size={18} color="#EA4335" />
                        <Text style={styles.errorBannerText}>{error}</Text>
                      </View>
                    ) : null}

                      {/* Form Fields */}
                      <View style={styles.form}>
                        <Controller
                          control={control}
                          name="email"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              label="Academic Email"
                              placeholder="name@university.edu"
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoCorrect={false}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              error={errors.email?.message}
                              leftIcon={<Icon name="Mail" size={18} color="#5F6368" />}
                            />
                          )}
                        />

                        <Controller
                          control={control}
                          name="password"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              label="Account Password"
                              placeholder="Enter your secure password"
                              secureTextEntry={!showPassword}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              error={errors.password?.message}
                              leftIcon={<Icon name="Lock" size={18} color="#5F6368" />}
                              rightIcon={
                                <TouchableOpacity
                                  onPress={() => setShowPassword(!showPassword)}
                                  style={Platform.select({ web: { cursor: 'pointer' } as any })}
                                >
                                  <Icon
                                    name={showPassword ? 'EyeOff' : 'Eye'}
                                    size={18}
                                    color="#5F6368"
                                  />
                                </TouchableOpacity>
                              }
                            />
                          )}
                        />

                        <Button
                          title="Authenticate & Enter"
                          onPress={handleSubmit(onSubmit)}
                          loading={isLoading}
                          style={styles.submitButton}
                        />

                  {/* Switch to Register */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                      New to the institution?{' '}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        dispatch(clearAuthError());
                        navigation.navigate('Register');
                      }}
                      style={Platform.select({ web: { cursor: 'pointer' } as any })}
                    >
                      <Text style={styles.registerLink}>Create Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
      );
};

      const styles = StyleSheet.create({
        keyboardView: {
        flex: 1,
      width: '100%',
      justifyContent: 'center',
  },
      scrollContent: {
        padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
  },
      authCard: {
        width: '100%',
      maxWidth: 440,
      padding: spacing.xl,
  },
      header: {
        alignItems: 'center',
      marginBottom: spacing.lg,
  },
      logoCircle: {
        width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
  },
      eyebrow: {
        fontSize: 10,
      fontWeight: typography.weights.extrabold,
      color: '#0F9D58',
      letterSpacing: 1.2,
      marginBottom: 4,
  },
      title: {
        fontSize: typography.sizes.xl,
      fontWeight: typography.weights.extrabold,
      textAlign: 'center',
      letterSpacing: -0.2,
  },
      subtitle: {
        fontSize: typography.sizes.xs,
      color: '#5F6368',
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 18,
  },
      errorBanner: {
        flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: spacing.borderRadius.sm,
      marginBottom: spacing.md,
      gap: 8,
  },
      errorBannerText: {
        color: '#EA4335',
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      flex: 1,
  },
      form: {
        width: '100%',
  },
      submitButton: {
        marginTop: spacing.sm,
  },
      footerRow: {
        flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.lg,
  },
      footerText: {
        fontSize: typography.sizes.xs,
      color: '#5F6368',
  },
      registerLink: {
        fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: '#0F9D58',
  },
});
