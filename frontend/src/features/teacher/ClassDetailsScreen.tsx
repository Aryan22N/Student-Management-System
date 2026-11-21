import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { classApi } from '../../api/classApi';
import { quizApi } from '../../api/quizApi';
import { ClassRoom, ClassStudent } from '../../types/class';
import { Quiz } from '../../types/quiz';
import { CreateQuizModal } from '../../components/quiz/CreateQuizModal';
import { TeacherStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type ClassDetailsRouteProp = RouteProp<TeacherStackParamList, 'ClassDetails'>;

interface ClassDetailsScreenProps {
  route: ClassDetailsRouteProp;
}

export const ClassDetailsScreen: React.FC<ClassDetailsScreenProps> = ({ route }) => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { classId } = route.params;

  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enrollment Code Copy State
  const [copiedCode, setCopiedCode] = useState(false);

  // Regenerate Code Modal State
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Quizzes State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);

  const loadData = useCallback(async (query?: string, showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [classData, studentsData, quizData] = await Promise.all([
        classApi.getClassById(classId),
        classApi.getClassStudents(classId, query),
        quizApi.getClassQuizzes(classId).catch(() => []),
      ]);
      setClassRoom(classData);
      setStudents(studentsData);
      setQuizzes(quizData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load classroom details. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData(searchQuery);
  }, [loadData, searchQuery]);

  const onRefresh = () => {
    loadData(searchQuery, true);
  };

  const handleCopyCode = () => {
    if (!classRoom) return;
    setCopiedCode(true);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(classRoom.enrollmentCode);
    }
    setTimeout(() => {
      setCopiedCode(false);
    }, 2500);
  };

  const handleRegenerateCode = async () => {
    if (!classRoom) return;
    setIsRegenerating(true);
    try {
      const updated = await classApi.regenerateCode(classRoom.id);
      setClassRoom(updated);
      setIsRegenerateModalOpen(false);
      setActionFeedback(`Enrollment code successfully updated: ${updated.enrollmentCode}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to regenerate code.';
      setErrorMessage(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const navigateToAwardPoints = (student: ClassStudent) => {
    navigation.navigate('TeacherTabs', {
      screen: 'AwardPoints',
      params: {
        preselectedStudentId: student.studentId,
        preselectedStudentName: `${student.firstName} ${student.lastName} (${student.studentIdNumber})`,
      },
    });
  };

  if (isLoading && !isRefreshing) {
    return (
      <ScreenContainer
        title="Classroom Management"
        subtitle="Loading enrolled student roster..."
        breadcrumbs={[
          { label: 'FACULTY' },
          { label: 'CLASSROOM ROSTER' },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F9D58" />
          <Text style={styles.loadingText}>
            Retrieving classroom data from database...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (errorMessage && !classRoom) {
    return (
      <ScreenContainer
        title="Classroom Error"
        subtitle="Could not load classroom record"
        breadcrumbs={[
          { label: 'FACULTY' },
          { label: 'ERROR' },
        ]}
      >
        <View style={styles.errorContainer}>
          <Icon name="AlertCircle" size={48} color="#EA4335" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Unable to Load Class
          </Text>
          <Text style={styles.errorSub}>{errorMessage}</Text>
          <Button
            title="Retry Connection"
            variant="primary"
            onPress={() => loadData(searchQuery)}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title={classRoom?.className || 'Classroom Dossier'}
      subtitle={`Course Subject: ${classRoom?.subject || 'N/A'} • Section ${classRoom?.section || 'A'}`}
      breadcrumbs={[
        { label: 'FACULTY' },
        { label: 'CLASSROOMS' },
        { label: classRoom?.className || 'DETAILS' },
      ]}
      activeRoute="TeacherDashboard"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0F9D58" />
        }
      >
        {/* Navigation Back Bar */}
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
              Back to Faculty Overview
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: isDark ? 'rgba(52, 168, 83, 0.15)' : '#E6F4EA',
                borderColor: '#34A853',
              },
            ]}
          >
            <Icon name="CheckCircle" size={18} color="#34A853" />
            <Text style={styles.feedbackText}>{actionFeedback}</Text>
          </View>
        )}

        {/* Class Overview Hero Card */}
        <Card accentTop style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewTitleCol}>
              <View style={styles.classBadgeRow}>
                <Badge label={classRoom?.subject || 'Class'} variant="primary" size="sm" />
                <Badge
                  label={`Section ${classRoom?.section || 'A'}`}
                  variant="neutral"
                  size="sm"
                  style={{ marginLeft: 6 }}
                />
              </View>
              <Text style={[styles.className, { color: theme.text }]}>
                {classRoom?.className}
              </Text>
              <Text style={styles.classInstructor}>
                Lead Faculty: <Text style={{ color: '#0F9D58', fontWeight: '700' }}>{classRoom?.teacherName}</Text> • Established{' '}
                {classRoom?.createdAt ? formatDate(classRoom.createdAt) : ''}
              </Text>
            </View>

            {/* Quick KPI Stat Pill */}
            <View style={[styles.studentCountBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
              <Icon name="Users" size={20} color="#0F9D58" />
              <Text style={[styles.studentCountNumber, { color: '#0F9D58' }]}>
                {classRoom?.studentCount ?? 0}
              </Text>
              <Text style={styles.studentCountLabel}>
                {classRoom?.studentCount === 1 ? 'Enrolled Student' : 'Enrolled Students'}
              </Text>
            </View>
          </View>

          {/* Access Key Section */}
          <View style={[styles.keyContainer, { backgroundColor: isDark ? '#1C2128' : '#F8FAF9', borderColor: theme.border }]}>
            <View style={styles.keyInfo}>
              <Text style={styles.keyLabel}>COURSE ENROLLMENT ACCESS KEY</Text>
              <Text style={styles.keySub}>
                Share this secure alphanumeric key with students to allow course self-enrollment.
              </Text>
              <View style={styles.codeRow}>
                <View style={[styles.codePill, { backgroundColor: isDark ? '#0D1117' : '#FFFFFF', borderColor: theme.border }]}>
                  <Icon name="Key" size={14} color="#0F9D58" style={{ marginRight: 6 }} />
                  <Text style={styles.codeText}>{classRoom?.enrollmentCode}</Text>
                </View>

                {/* Copy Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyCode}
                  style={[
                    styles.codeActionBtn,
                    {
                      borderColor: copiedCode ? '#34A853' : theme.border,
                      backgroundColor: copiedCode ? (isDark ? 'rgba(52, 168, 83, 0.15)' : '#E6F4EA') : (isDark ? '#1C2128' : '#FFFFFF'),
                    },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Icon
                    name={copiedCode ? 'Check' : 'Copy'}
                    size={14}
                    color={copiedCode ? '#34A853' : theme.text}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.codeActionBtnText, { color: copiedCode ? '#34A853' : theme.text }]}>
                    {copiedCode ? 'Copied!' : 'Copy Key'}
                  </Text>
                </TouchableOpacity>

                {/* Regenerate Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsRegenerateModalOpen(true)}
                  style={[
                    styles.codeActionBtn,
                    { borderColor: theme.border, backgroundColor: isDark ? '#1C2128' : '#FFFFFF' },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Icon name="RefreshCw" size={14} color="#5F6368" style={{ marginRight: 4 }} />
                  <Text style={[styles.codeActionBtnText, { color: theme.text }]}>
                    Regenerate Key
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Classwork & Assessments Section */}
        <View style={styles.rosterSectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Classwork & Quizzes ({quizzes.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Interactive assessments that award merit points directly to student rankings
            </Text>
          </View>
          <Button
            title="+ Create Assessment"
            size="sm"
            variant="primary"
            icon={<Icon name="Plus" size={13} color="#FFFFFF" />}
            onPress={() => setIsCreateQuizOpen(true)}
          />
        </View>

        {quizzes.length === 0 ? (
          <Card style={styles.emptyQuizCard}>
            <View style={[styles.emptyQuizIconCircle, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
              <Icon name="Award" size={24} color="#0F9D58" />
            </View>
            <Text style={[styles.emptyQuizTitle, { color: theme.text }]}>No Assessments Created Yet</Text>
            <Text style={styles.emptyQuizSub}>
              Create your first multiple-choice quiz for this class. When students complete it, merit points are automatically added to their profile and their rank updates immediately!
            </Text>
            <Button
              title="Create First Quiz"
              size="sm"
              variant="outline"
              icon={<Icon name="Plus" size={13} color="#0F9D58" />}
              onPress={() => setIsCreateQuizOpen(true)}
              style={{ marginTop: spacing.sm, alignSelf: 'center' }}
            />
          </Card>
        ) : (
          <View style={styles.quizzesGrid}>
            {quizzes.map((quiz) => (
              <Card key={quiz.id} style={styles.quizCard}>
                <View style={styles.quizCardTop}>
                  <Badge label={`${quiz.questionCount} Questions`} variant="primary" size="sm" />
                  <Badge label={`+${quiz.pointsReward} Bonus pts`} variant="accent" size="sm" />
                </View>
                <Text style={[styles.quizTitle, { color: theme.text }]} numberOfLines={1}>
                  {quiz.title}
                </Text>
                {quiz.description ? (
                  <Text style={styles.quizDesc} numberOfLines={2}>
                    {quiz.description}
                  </Text>
                ) : null}
                <View style={[styles.quizCardFooter, { borderTopColor: theme.border }]}>
                  <Text style={styles.quizDate}>Published {formatDate(quiz.createdAt)}</Text>
                  <View style={styles.quizActivePill}>
                    <View style={styles.quizActiveDot} />
                    <Text style={styles.quizActiveText}>Live</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Enrolled Students Header & Search */}
        <View style={styles.rosterSectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Classroom Roster ({students.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Students registered and active in this course section
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <Input
            placeholder="Search students by name, ID number, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Icon name="Search" size={18} color="#5F6368" />}
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
        </View>

        {/* Student List */}
        {students.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="school-outline"
              title={searchQuery ? 'No Students Match Filter' : 'No Students Enrolled Yet'}
              subtitle={
                searchQuery
                  ? `No students matching "${searchQuery}" found in this classroom roster.`
                  : 'Share the enrollment key above with students. When they join, they will appear here.'
              }
            />
          </Card>
        ) : (
          <View style={styles.studentList}>
            {students.map((student) => {
              const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
              return (
                <Card key={student.studentId} style={styles.studentCard}>
                  <View style={styles.studentRow}>
                    {/* Student Avatar */}
                    <View style={[styles.avatarBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    {/* Student Info */}
                    <View style={styles.studentDetails}>
                      <View style={styles.studentNameRow}>
                        <Text style={[styles.studentName, { color: theme.text }]}>
                          {student.firstName} {student.lastName}
                        </Text>
                        <Badge label={student.gradeLevel} variant="neutral" size="sm" />
                      </View>
                      <Text style={styles.studentMeta}>
                        ID: {student.studentIdNumber} • {student.email}
                      </Text>
                      <Text style={styles.studentEnrolledDate}>
                        Joined {formatDate(student.enrolledAt)}
                      </Text>
                    </View>

                    {/* Points & Award Action */}
                    <View style={styles.studentActionCol}>
                      <View style={[styles.pointsBadge, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA', borderColor: '#0F9D58' }]}>
                        <Icon name="Award" size={14} color="#0F9D58" style={{ marginRight: 4 }} />
                        <Text style={styles.pointsText}>{student.totalPoints} pts</Text>
                      </View>
                      <Button
                        title="Award Points"
                        size="sm"
                        variant="primary"
                        icon={<Icon name="Award" size={13} color="#FFFFFF" />}
                        onPress={() => navigateToAwardPoints(student)}
                        style={styles.awardBtn}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Regenerate Key Modal */}
      <Modal
        visible={isRegenerateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRegenerateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: 'rgba(251, 188, 4, 0.15)' }]}>
                <Icon name="Key" size={20} color="#FBBC04" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Regenerate Enrollment Key?
              </Text>
            </View>

            <Text style={styles.modalDescription}>
              Generating a new code will immediately invalidate the current code (
              <Text style={{ fontWeight: '700', color: '#0F9D58' }}>{classRoom?.enrollmentCode}</Text>
              ). Already enrolled students will not be affected.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsRegenerateModalOpen(false)}
                disabled={isRegenerating}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Regenerate Key"
                variant="primary"
                onPress={handleRegenerateCode}
                loading={isRegenerating}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {/* Create Quiz Modal */}
      {classRoom && (
        <CreateQuizModal
          visible={isCreateQuizOpen}
          classId={classRoom.id}
          className={classRoom.className}
          onClose={() => setIsCreateQuizOpen(false)}
          onSuccess={() => {
            setActionFeedback('Assessment published successfully! Enrolled students can now take it.');
            loadData(searchQuery);
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
  },
  topBar: {
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  backButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 8,
  },
  feedbackText: {
    color: '#34A853',
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 250,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: '#5F6368',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  errorSub: {
    fontSize: typography.sizes.sm,
    color: '#5F6368',
    marginTop: 4,
    textAlign: 'center',
  },
  overviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  overviewTitleCol: {
    flex: 1,
    minWidth: 260,
  },
  classBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  className: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  classInstructor: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 4,
  },
  studentCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  studentCountNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
  },
  studentCountLabel: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    fontWeight: '600',
  },
  keyContainer: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  keyInfo: {
    width: '100%',
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5F6368',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  keySub: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  codeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#0F9D58',
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  codeActionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  rosterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 2,
  },
  searchRow: {
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  studentList: {
    gap: spacing.sm,
  },
  studentCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 10,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F9D58',
  },
  studentDetails: {
    flex: 1,
    minWidth: 180,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  studentMeta: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
  },
  studentEnrolledDate: {
    fontSize: 10,
    color: '#80868B',
    marginTop: 2,
  },
  studentActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: '#0F9D58',
  },
  awardBtn: {
    height: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  modalDescription: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyQuizCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderRadius: 10,
  },
  emptyQuizIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyQuizTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyQuizSub: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  quizzesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quizCard: {
    flex: 1,
    minWidth: 260,
    padding: spacing.md,
    borderRadius: 10,
  },
  quizCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quizTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    marginBottom: 4,
  },
  quizDesc: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginBottom: 8,
    lineHeight: 16,
  },
  quizCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  quizDate: {
    fontSize: 10,
    color: '#80868B',
  },
  quizActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F9D58',
  },
  quizActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F9D58',
  },
});