import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

export const StudentProfileScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { user, studentProfile } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const initials = `${user?.firstName?.charAt(0) || 'S'}${user?.lastName?.charAt(0) || ''}`;

  const rawGrade = studentProfile?.gradeLevel || '';
  const formattedGrade = rawGrade
    ? rawGrade.toLowerCase().includes('grade') || rawGrade.toLowerCase().includes('class')
      ? rawGrade
      : `Grade ${rawGrade}`
    : 'Active Student';

  return (
    <ScreenContainer
      title="Student Dossier"
      subtitle="Institutional student credential and academic standing"
      breadcrumbs={[
        { label: 'STUDENT' },
        { label: 'DOSSIER' },
      ]}
      activeRoute="StudentProfile"
      maxWidth={720}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome & Status Bar matching Google Classroom */}
        <Card style={styles.headerGreetingCard}>
          <View style={styles.greetingHeaderRow}>
            <Text style={[styles.greetingHeaderText, { color: theme.text }]}>
              Academic Dossier • {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.pillsRow}>
            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
              <Icon name="Award" size={14} color="#0F9D58" />
              <Text style={styles.statusPillText}>
                {studentProfile?.totalPoints ?? 0} Merits
              </Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
              <Icon name="BookOpen" size={14} color="#0F9D58" />
              <Text style={styles.statusPillText}>
                {studentProfile?.studentIdNumber ?? 'ID Pending'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Header Avatar Card */}
        <Card accentTop style={styles.profileHeaderCard}>
          <View style={[styles.avatarLarge, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
            <Text style={[styles.avatarInitials, { color: '#0F9D58' }]}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email}
          </Text>
          <View style={styles.badgeRow}>
            <Badge label="STUDENT" variant="primary" size="sm" />
            <Badge label="Active Enrollment" variant="success" size="sm" />
          </View>
        </Card>

        {/* Academic Details Card */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Academic Record & Credentials
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Icon name="CircleUserRound" size={16} color="#0F9D58" />
              <Text style={styles.detailLabel}>Student ID Number</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {studentProfile?.studentIdNumber ?? 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Icon name="BookOpen" size={16} color="#0F9D58" />
              <Text style={styles.detailLabel}>Assigned Grade Level</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formattedGrade}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Icon name="Trophy" size={16} color="#F28C28" />
              <Text style={styles.detailLabel}>Total Point Balance</Text>
            </View>
            <Text style={styles.pointBalanceValue}>
              {studentProfile?.totalPoints ?? 0} pts
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailLabelGroup}>
              <Icon name="CalendarDays" size={16} color="#5F6368" />
              <Text style={styles.detailLabel}>Registration Date</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(user?.createdAt || '')}
            </Text>
          </View>
        </Card>

  {/* Logout Action */ }
  <Button
    title="Sign Out of Portal"
    variant="outline"
    onPress={handleLogout}
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
        profileHeaderCard: {
          alignItems: 'center',
          paddingVertical: spacing.xl,
          marginBottom: spacing.md,
        },
          avatarLarge: {
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          },
            avatarInitials: {
              fontSize: 26,
              fontWeight: typography.weights.extrabold,
            },
              userName: {
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.extrabold,
                letterSpacing: -0.2,
                marginBottom: 2,
              },
                userEmail: {
                  fontSize: typography.sizes.xs,
                  color: '#5F6368',
                  marginBottom: spacing.sm,
                },
                  badgeRow: {
                    flexDirection: 'row',
                    gap: 8,
                  },
                    cardTitle: {
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.extrabold,
                      marginBottom: spacing.sm,
                      letterSpacing: -0.1,
                    },
                      detailRow: {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: 0.8,
                        borderBottomColor: 'rgba(100, 116, 139, 0.12)',
                      },
                        detailLabelGroup: {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        },
                          detailLabel: {
                            fontSize: typography.sizes.xs,
                            color: '#5F6368',
                            fontWeight: typography.weights.medium,
                          },
                            detailValue: {
                              fontSize: typography.sizes.xs,
                              fontWeight: typography.weights.bold,
                            },
                              pointBalanceValue: {
                                fontSize: typography.sizes.sm,
                                fontWeight: typography.weights.extrabold,
                                color: '#0F9D58',
                              },
                                logoutBtn: {
                                  marginTop: spacing.md,
                                },
  headerGreetingCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 14,
  },
  greetingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  greetingIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingHeaderText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: '#0F9D58',
  },
});
