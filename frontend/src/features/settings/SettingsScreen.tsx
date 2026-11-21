import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { getDefaultBaseUrl } from '../../utils/env';
import { secureStorage } from '../../utils/secureStorage';
import { apiClient } from '../../api/client';
import { spacing, typography } from '../../theme';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [apiUrl, setApiUrl] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    secureStorage.getCustomApiUrl().then((saved) => {
      setApiUrl(saved || getDefaultBaseUrl());
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) {
      const def = getDefaultBaseUrl();
      setApiUrl(def);
      await secureStorage.saveCustomApiUrl(def);
    } else {
      await secureStorage.saveCustomApiUrl(apiUrl.trim());
    }
    setIsEditingUrl(false);
    testConnection();
  };

  const handleResetApiUrl = async () => {
    const def = getDefaultBaseUrl();
    setApiUrl(def);
    await secureStorage.saveCustomApiUrl(def);
    setIsEditingUrl(false);
    testConnection();
  };

  const testConnection = async () => {
    setTestResult('Testing...');
    try {
      const res = await apiClient.get('/health');
      if (res.data?.success) {
        setTestResult('Connected (Status: UP)');
      } else {
        setTestResult('Unexpected response');
      }
    } catch (e: any) {
      setTestResult('Connection failed');
    }
  };

  return (
    <ScreenContainer
      title="System Preferences"
      subtitle="Application theme, gateway host configuration, and session credentials"
      breadcrumbs={[
        { label: 'SYSTEM' },
        { label: 'PREFERENCES' },
      ]}
      activeRoute="Settings"
      maxWidth={720}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Card */}
        <Card accentTop>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Interface Theme & Appearance
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                <Icon
                  name={isDark ? 'Moon' : 'Sun'}
                  size={16}
                  color={isDark ? '#F28C28' : '#0F9D58'}
                />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Dark Mode
                </Text>
                <Text style={styles.settingDesc}>
                  {isDark ? 'Dark campus navy active' : 'Soft fresh campus off-white active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#DADCE0', true: '#0F9D58' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Account Details */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Authenticated Academic Session
          </Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabelMuted}>Full Name</Text>
            <Text style={[styles.settingValue, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabelMuted}>Institutional Role</Text>
            <Badge label={user?.role ?? 'STUDENT'} variant="primary" size="sm" />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabelMuted}>Academic Email</Text>
            <Text style={[styles.settingValue, { color: theme.text }]}>
              {user?.email}
            </Text>
          </View>
        </Card>

        {/* System & Connection Info */}
        <Card>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Backend API Gateway
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditingUrl(!isEditingUrl)}
              style={Platform.select({ web: { cursor: 'pointer' } as any })}
            >
              <Text style={styles.editLink}>
                {isEditingUrl ? 'Cancel' : 'Configure Host'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingUrl ? (
            <View style={styles.editUrlBox}>
              <TextInput
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
                style={[
                  styles.urlInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                  Platform.select({
                    web: {
                      outlineStyle: 'none',
                    } as any,
                  }),
                ]}
              />
              <View style={styles.urlBtnRow}>
                <Button
                  title="Save & Test"
                  onPress={handleSaveApiUrl}
                  size="sm"
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Reset Default"
                  variant="secondary"
                  onPress={handleResetApiUrl}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabelMuted}>Gateway URL</Text>
              <Text style={[styles.settingValue, { color: theme.text }]} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabelMuted}>Connection Status</Text>
            <TouchableOpacity
              onPress={testConnection}
              style={Platform.select({ web: { cursor: 'pointer' } as any })}
            >
              <Text style={styles.testResultLink}>
                {testResult || 'Ping Server'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabelMuted}>Authorization Standard</Text>
            <Text style={styles.authBadge}>
              HMAC-SHA256 Bearer JWT
            </Text>
          </View>
        </Card>

        {/* Sign Out Action */}
  <Button
    title="Sign Out of Session"
    variant="outline"
    onPress={() => dispatch(logout())}
    icon={<Icon name="LogOut" size={18} color="#EA4335" />}
    style={styles.logoutBtn}
  />
      </ScrollView >
    </ScreenContainer >
  );
};

    const styles = StyleSheet.create({
      scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
        width: '100%',
      },
        cardTitle: {
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.extrabold,
          marginBottom: spacing.xs,
          letterSpacing: -0.1,
        },
          sectionTitleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xs,
          },
            editLink: {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              color: '#0F9D58',
            },
              editUrlBox: {
                marginVertical: spacing.sm,
              },
                urlInput: {
                  borderWidth: 1.2,
                  borderRadius: spacing.borderRadius.sm,
                  paddingHorizontal: spacing.md,
                  height: 40,
                  fontSize: typography.sizes.xs,
                  marginBottom: spacing.xs,
                },
                  urlBtnRow: {
                    flexDirection: 'row',
                  },
                    settingRow: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 11,
                      borderBottomWidth: 0.8,
                      borderBottomColor: 'rgba(100, 116, 139, 0.12)',
                    },
                      settingTextGroup: {
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                        iconBox: {
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: spacing.sm,
                        },
                          settingLabel: {
                            fontSize: typography.sizes.xs,
                            fontWeight: typography.weights.bold,
                          },
                            settingLabelMuted: {
                              fontSize: typography.sizes.xs,
                              color: '#5F6368',
                              fontWeight: typography.weights.medium,
                            },
                              settingDesc: {
                                fontSize: 11,
                                color: '#5F6368',
                                marginTop: 1,
                              },
                                settingValue: {
                                  fontSize: typography.sizes.xs,
                                  fontWeight: typography.weights.bold,
                                  maxWidth: '65%',
                                },
                                  testResultLink: {
                                    fontSize: typography.sizes.xs,
                                    fontWeight: typography.weights.bold,
                                    color: '#0F9D58',
                                  },
                                    authBadge: {
                                      fontSize: typography.sizes.xs,
                                      fontWeight: typography.weights.bold,
                                      color: '#0F9D58',
                                    },
                                      logoutBtn: {
                                        marginTop: spacing.md,
                                      },
                                    });
