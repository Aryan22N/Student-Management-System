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
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAuthError, register } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types/navigation';
import { Role } from '../../types/auth';
import { spacing, typography } from '../../theme';

const registerSchema = z.object({
  email: z.string().min(1, 'Academic email is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  studentIdNumber: z.string().optional(),
  gradeLevel: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  invitationCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [roleValidationError, setRoleValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      studentIdNumber: '',
      gradeLevel: '',
      employeeId: '',
      department: '',
      invitationCode: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setRoleValidationError(null);
    dispatch(clearAuthError());

    if (selectedRole === 'STUDENT') {
      if (!data.studentIdNumber?.trim()) {
        setRoleValidationError('Student ID number is required');
        return;
      }
      if (!data.gradeLevel?.trim()) {
        setRoleValidationError('Grade level is required');
        return;
      }
      dispatch(
        register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STUDENT',
          studentIdNumber: data.studentIdNumber.trim(),
          gradeLevel: data.gradeLevel.trim(),
        })
      );
    } else {
      if (!data.employeeId?.trim()) {
        setRoleValidationError('Faculty Employee ID is required');
        return;
      }
      if (!data.department?.trim()) {
        setRoleValidationError('Academic department is required');
        return;
      }
      if (!data.invitationCode?.trim()) {
        setRoleValidationError('Faculty invitation authorization code is required');
        return;
      }
      dispatch(
        register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'TEACHER',
          employeeId: data.employeeId.trim(),
          department: data.department.trim(),
          invitationCode: data.invitationCode.trim(),
        })
      );
    }
  };

  const isStudent = selectedRole === 'STUDENT';

  return (
    <ScreenContainer maxWidth={520} centered noSidebar>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                <Icon name="GraduationCap" size={30} color="#0F9D58" />
              </View>
              <Text style={styles.eyebrow}>ACADEMIA ONBOARDING</Text>
              <Text style={[styles.title, { color: theme.text }]}>
                Create Account
              </Text>
              <Text style={styles.subtitle}>
                Join the verified campus merit ledger and course directory
              </Text>
            </View>

            {/* Segmented Role Selector */}
            <View
              style={[
                styles.roleTabsContainer,
                {
                  backgroundColor: isDark ? '#162538' : '#F8FAF9',
                  borderColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedRole('STUDENT');
                  setRoleValidationError(null);
                }}
                style={[
                  styles.roleTab,
                  isStudent && styles.activeRoleTab,
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Icon
                  name="School"
                  size={16}
                  color={isStudent ? '#FFFFFF' : '#5F6368'}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    { color: isStudent ? '#FFFFFF' : '#5F6368' },
                    isStudent && { fontWeight: '700' },
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedRole('TEACHER');
                  setRoleValidationError(null);
                }}
                style={[
                  styles.roleTab,
                  !isStudent && styles.activeRoleTab,
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Icon
                  name="CircleUserRound"
                  size={16}
                  color={!isStudent ? '#FFFFFF' : '#5F6368'}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    { color: !isStudent ? '#FFFFFF' : '#5F6368' },
                    !isStudent && { fontWeight: '700' },
                  ]}
                >
                  Faculty Member
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {(error || roleValidationError) && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' },
                ]}
              >
                <Icon name="AlertCircle" size={18} color="#EA4335" />
                <Text style={styles.errorBannerText}>
                  {roleValidationError || error}
                </Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* First Name & Last Name */}
              <View style={styles.nameRow}>
                <View style={styles.halfInput}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="First Name"
                        placeholder="Elena"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.firstName?.message}
                      />
                    )}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Last Name"
                        placeholder="Rostova"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.lastName?.message}
                      />
                    )}
                  />
                </View>
              </View>

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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    leftIcon={<Icon name="Mail" size={17} color="#5F6368" />}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Security Password"
                    placeholder="At least 6 characters"
                    secureTextEntry={!showPassword}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.password?.message}
                    leftIcon={<Icon name="Lock" size={17} color="#5F6368" />}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={Platform.select({ web: { cursor: 'pointer' } as any })}
                      >
                        <Icon
                          name={showPassword ? 'EyeOff' : 'Eye'}
                          size={17}
                          color="#5F6368"
                        />
                      </TouchableOpacity>
                    }
                  />
                )}
              />

              {/* Role specific inputs */}
              {isStudent ? (
                <>
                  <Controller
                    control={control}
                    name="studentIdNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Student ID Number"
                        placeholder="STU-2026-001"
                        autoCapitalize="characters"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        leftIcon={<Icon name="CircleUserRound" size={17} color="#5F6368" />}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="gradeLevel"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Grade / Class Level"
                        placeholder="Grade 11, Section A"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        leftIcon={<Icon name="BookOpen" size={17} color="#5F6368" />}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="employeeId"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Faculty Employee ID"
                        placeholder="FAC-2026-101"
                        autoCapitalize="characters"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        leftIcon={<Icon name="CircleUserRound" size={17} color="#5F6368" />}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="department"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Department"
                        placeholder="Computer Science & Engineering"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        leftIcon={<Icon name="School" size={17} color="#5F6368" />}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="invitationCode"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Faculty Invitation Secret"
                        placeholder="TEACHER_SECRET_2026"
                        autoCapitalize="none"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        leftIcon={<Icon name="Key" size={17} color="#5F6368" />}
                      />
                    )}
                  />

                  {/* Secret Hint and Quick-Fill Helper */}
                  <View style={styles.codeHintRow}>
                    <Text style={styles.codeHintText}>
                      Faculty authorization key required
                    </Text>
                    <TouchableOpacity
                      onPress={() => setValue('invitationCode', 'TEACHER_SECRET_2026')}
                      activeOpacity={0.7}
                      style={[
                        styles.quickFillPill,
                        {
                          backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA',
                        },
                        Platform.select({ web: { cursor: 'pointer' } as any }),
                      ]}
                    >
                      <Icon name="Key" size={11} color="#0F9D58" style={{ marginRight: 4 }} />
                      <Text style={styles.quickFillText}>
                        Fill Code (TEACHER_SECRET_2026)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Button
                title={isStudent ? 'Enroll as Student' : 'Verify & Join Faculty'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.submitButton}
              />

              {/* Switch to Login */ }
  <View style={styles.footerRow}>
    <Text style={styles.footerText}>
      Already have an institutional account?{' '}
    </Text>
    <TouchableOpacity
      onPress={() => {
        dispatch(clearAuthError());
        navigation.navigate('Login');
      }}
      activeOpacity={0.7}
      style={Platform.select({ web: { cursor: 'pointer' } as any })}
    >
      <Text style={styles.footerLink}>
        Sign in here
      </Text>
    </TouchableOpacity>
  </View>
            </View >
          </Card >
        </ScrollView >
      </KeyboardAvoidingView >
    </ScreenContainer >
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
    maxWidth: 500,
    padding: spacing.xl,
    borderRadius: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F9D58',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 340,
    lineHeight: 18,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  activeRoleTab: {
    backgroundColor: '#0F9D58',
    shadowColor: '#0F9D58',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#EA4335',
  },
  errorBannerText: {
    color: '#EA4335',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    marginLeft: spacing.xs,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
  },
  footerLink: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: '#0F9D58',
    textDecorationLine: 'underline',
  },
  codeHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 6,
  },
  codeHintText: {
    fontSize: 11,
    color: '#5F6368',
  },
  quickFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0F9D58',
  },
  quickFillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F9D58',
  },
});
