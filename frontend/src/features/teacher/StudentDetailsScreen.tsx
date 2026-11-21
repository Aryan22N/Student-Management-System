import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { studentApi } from '../../api/studentApi';
import { StudentDetail } from '../../types/student';
import { PointTransaction } from '../../types/points';
import { TeacherStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type StudentDetailsRouteProp = RouteProp<TeacherStackParamList, 'StudentDetails'>;

interface StudentDetailsProps {
  route: StudentDetailsRouteProp;
  navigation: NativeStackNavigationProp<TeacherStackParamList>;
}

export const StudentDetailsScreen: React.FC<StudentDetailsProps> = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { studentId } = route.params;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [studentData, txData] = await Promise.all([
        studentApi.getStudentById(studentId),
        studentApi.getStudentTransactions(studentId, 0, 15),
      ]);
      setStudent(studentData);
      setTransactions(txData.content);
    } catch (e) {
      console.warn('Failed to load student details', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const navigateToAwardPoints = () => {
    if (!student) return;
    navigation.navigate('TeacherTabs', {
      screen: 'AwardPoints',
      params: {
        preselectedStudentId: student.id,
        preselectedStudentName: `${student.firstName} ${student.lastName}`,
      },
    });
  };

  if (isLoading && !isRefreshing) {
    return (
      <ScreenContainer
        title="Student Record"
        subtitle="Retrieving profile dossier..."
        breadcrumbs={[
          { label: 'FACULTY' },
          { label: 'DOSSIER' },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F9D58" />
          <Text style={styles.loadingText}>Loading student profile and ledger...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!student) {
    return (
      <ScreenContainer
        title="Student Record"
        subtitle="Profile not found"
        breadcrumbs={[
          { label: 'FACULTY' },
          { label: 'NOT FOUND' },
        ]}
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Student not found"
          subtitle="The requested student profile could not be loaded."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title={`${student.firstName} ${student.lastName}`}
      subtitle={`Student ID: ${student.studentIdNumber} • ${student.gradeLevel}`}
      breadcrumbs={[
        { label: 'FACULTY' },
        { label: 'STUDENTS' },
        { label: `${student.firstName} ${student.lastName}` },
      ]}
      activeRoute="StudentDirectory"
      maxWidth={1000}
    >
      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: { item: any }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0F9D58"
          />
        }
        ListHeaderComponent={
          <>
            {/* Top Back Navigation Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
                style={[
                  styles.backButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Icon name="ArrowLeft" size={15} color={theme.text} />
                <Text style={[styles.backButtonText, { color: theme.text }]}>
                  Back to Student Directory
                </Text>
              </TouchableOpacity>
            </View>

            {/* Student Profile Card */}
            <Card accentTop style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarCircle, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                  <Text style={[styles.avatarText, { color: '#0F9D58' }]}>
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={[styles.studentName, { color: theme.text }]}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                  <View style={styles.badgeRow}>
                    <Badge label={`ID: ${student.studentIdNumber}`} variant="primary" size="sm" />
                    <Badge label={student.gradeLevel} variant="neutral" size="sm" />
                  </View>
                </View>
              </View>

              {/* Total Points Highlight & Award CTA */}
              <View
                style={[
                  styles.scoreBox,
                  {
                    backgroundColor: isDark ? '#111C2B' : '#F1F3F4',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View>
                  <Text style={styles.scoreLabel}>Current Academic Points Pool</Text>
                  <Text style={[styles.scoreValue, { color: isDark ? '#4285F4' : '#0F9D58' }]}>
                    {student.totalPoints} pts
                  </Text>
                </View>
                <Button
                  title="Award / Adjust Points"
                  onPress={navigateToAwardPoints}
                  size="sm"
                  icon={<Icon name="Award" size={15} color="#FFFFFF" />}
                />
              </View>

              <View style={styles.metaRow}>
                <Icon name="CalendarDays" size={13} color="#5F6368" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>
                  Enrolled in SMS system on: {formatDate(student.createdAt)}
                </Text>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Merit & Demerit Transaction Ledger ({transactions.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Itemized faculty distribution history from database
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="ribbon-outline"
            title="No points recorded yet"
            subtitle="Award points to recognize this student's academic excellence or participation."
          />
        }
      />
    </ScreenContainer >
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xs,
    color: '#5F6368',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    gap: 6,
  },
  backButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
  studentEmail: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    marginTop: spacing.md,
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#5F6368',
    letterSpacing: 0.8,
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extrabold,
    marginTop: 2,
  },
  metaRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  metaText: {
    fontSize: 11,
    color: '#5F6368',
  },
  sectionHeader: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extrabold,
    letterSpacing: -0.1,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
});
