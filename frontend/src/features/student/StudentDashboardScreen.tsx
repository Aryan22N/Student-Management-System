import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { refreshProfile } from '../../store/slices/authSlice';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { classApi } from '../../api/classApi';
import { quizApi } from '../../api/quizApi';
import { Quiz, QuizSubmissionResponse } from '../../types/quiz';
import { TakeQuizModal } from '../../components/quiz/TakeQuizModal';
import { PointTransaction } from '../../types/points';
import { ClassEnrollment } from '../../types/class';
import { StudentTabParamList, RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type StudentDashboardNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'StudentDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface StudentDashboardProps {
  navigation: StudentDashboardNavProp;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const dispatch = useAppDispatch();
  const { user, studentProfile } = useAppSelector((state) => state.auth);

  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassEnrollment[]>([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState<Quiz[]>([]);
  const [activeQuizForModal, setActiveQuizForModal] = useState<Quiz | null>(null);
  const [isTakeQuizModalOpen, setIsTakeQuizModalOpen] = useState(false);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active 3-dots class dropdown menu
  const [activeMenuClassId, setActiveMenuClassId] = useState<number | null>(null);

  // Tab filter: 'all' | 'quizzes' | 'merits'
  const [activeStreamTab, setActiveStreamTab] = useState<'all' | 'quizzes' | 'merits'>('all');

  // Join Class Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [enrollmentCodeInput, setEnrollmentCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const studentProfileId = studentProfile?.id;

  const loadDashboardData = useCallback(async () => {
    if (!studentProfileId) return;

    try {
      const [txRes, lbRes, classesRes, quizzesRes] = await Promise.all([
        studentApi.getStudentTransactions(studentProfileId, 0, 10),
        leaderboardApi.getLeaderboard(0, 100),
        classApi.getEnrolledClasses(),
        quizApi.getPendingQuizzes().catch(() => []),
      ]);

      setRecentTransactions(txRes.content);
      setEnrolledClasses(classesRes);
      setAssignedQuizzes(quizzesRes || []);

      const myEntry = lbRes.content.find((e) => e.studentId === studentProfileId);
      if (myEntry) {
        setCurrentRank(myEntry.rank);
      }

      dispatch(refreshProfile());
    } catch (e) {
      console.warn('Failed to load student dashboard data', e);
    }
  }, [studentProfileId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleJoinClass = async () => {
    setJoinError(null);
    setJoinSuccess(null);

    const cleanCode = enrollmentCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a valid class enrollment code');
      return;
    }

    setIsJoining(true);
    try {
      const res = await classApi.joinClass({ enrollmentCode: cleanCode });
      setJoinSuccess(`Enrolled successfully in ${res.className} (${res.teacherName})!`);
      setEnrollmentCodeInput('');
      await loadDashboardData();
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinSuccess(null);
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to enroll. Please check the code and try again.';
      setJoinError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  // Find recent quiz for a class
  const getRecentQuizForClass = (classId: number, className: string) => {
    return assignedQuizzes.find((q) => q.classId === classId || q.className === className);
  };

  return (
    <ScreenContainer
      title="Student Workspace"
      subtitle="Overview of academic credentials, merit balance, and active enrollments"
      breadcrumbs={[
        { label: 'STUDENT' },
        { label: 'DASHBOARD' },
      ]}
      activeRoute="StudentDashboard"
      maxWidth={1140}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0F9D58"
          />
        }
      >
        {/* 1. Header Greeting Section with Top "Join Classroom" Button */}
        <Card style={styles.headerGreetingCard}>
          <View style={[styles.welcomeMainRow, !isDesktop && styles.welcomeMainRowMobile]}>
            <View style={styles.welcomeTextCol}>
              <Text style={[styles.greetingHeaderText, { color: theme.text }]}>
                Welcome back, {user?.firstName} {user?.lastName}
              </Text>

                  <View style={styles.pillsRow}>
                    {/* Merits Pill */}
                    <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
                      <Icon name="Award" size={14} color="#0F9D58" />
                      <Text style={styles.statusPillText}>
                        {studentProfile?.totalPoints ?? 0} Merits
                      </Text>
                    </View>

                    {/* Rank Pill */}
                    <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
                      <Icon name="Trophy" size={14} color="#0F9D58" />
                      <Text style={styles.statusPillText}>
                        Rank #{currentRank !== null ? currentRank : '1'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Top Join Classroom Action Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsJoinModalOpen(true)}
                  style={[
                    styles.topJoinClassBtn,
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Icon name="Plus" size={15} color="#FFFFFF" />
                  <Text style={styles.topJoinClassBtnText}>Join Classroom</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* 2. Responsive Google Classroom Cards Grid */}
            {enrolledClasses.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
                  <Icon name="School" size={26} color="#0F9D58" />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Classrooms Joined Yet
                </Text>
                <Text style={styles.emptySubtitle}>
                  Ask your instructor for their classroom code to link your student profile and participate in coursework.
                </Text>
                <Button
                  title="Enter Classroom Code"
                  onPress={() => setIsJoinModalOpen(true)}
                  icon={<Icon name="Key" size={15} color="#FFFFFF" />}
                  style={{ marginTop: spacing.md, alignSelf: 'center' }}
                />
              </Card>
            ) : (
              <View style={styles.classroomCardsContainer}>
                {enrolledClasses.map((cls) => {
                  const recentQuiz = getRecentQuizForClass(cls.id, cls.className);
                  const teacherInitials = cls.teacherName
                    ? cls.teacherName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                    : 'AN';

                  return (
                    <View
                      key={cls.id}
                      style={[
                        styles.classroomCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          minWidth: isDesktop ? 340 : '100%',
                        },
                        Platform.select({
                          web: {
                            boxShadow: '0 2px 8px rgba(32, 33, 36, 0.08)',
                          } as any,
                        }),
                      ]}
                    >
                      {/* Google Classroom Green Banner */}
                      <View style={styles.classroomBanner}>
                        {/* Top Row: ENROLLED tag and 3 dots context menu */}
                        <View style={styles.bannerTopRow}>
                          <View style={styles.enrolledTag}>
                            <Text style={styles.enrolledTagText}>ENROLLED</Text>
                          </View>

                          {/* 3 Dots Menu */}
                          <View style={styles.threeDotsWrapper}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() =>
                                setActiveMenuClassId(activeMenuClassId === cls.id ? null : cls.id)
                              }
                              style={[
                                styles.threeDotsBtn,
                                Platform.select({ web: { cursor: 'pointer' } as any }),
                              ]}
                            >
                              <Icon name="MoreVertical" size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            {/* Floating Context Menu for 3 dots */}
                            {activeMenuClassId === cls.id && (
                              <View
                                style={[
                                  styles.classroomDropdownMenu,
                                  {
                                    backgroundColor: isDark ? '#1C2633' : '#FFFFFF',
                                    borderColor: isDark ? '#2E3D4F' : '#DADCE0',
                                  },
                                  Platform.select({
                                    web: {
                                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                    } as any,
                                  }),
                                ]}
                              >
                                <TouchableOpacity
                                  style={styles.dropdownMenuItem}
                                  onPress={() => {
                                    setActiveStreamTab('quizzes');
                                    setActiveMenuClassId(null);
                                  }}
                                >
                                  <Icon name="BookOpen" size={14} color="#0F9D58" />
                                  <Text style={[styles.dropdownMenuItemText, { color: theme.text }]}>
                                    View Classwork
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.dropdownMenuItem}
                                  onPress={() => {
                                    navigation.navigate('Leaderboard');
                                    setActiveMenuClassId(null);
                                  }}
                                >
                                  <Icon name="Trophy" size={14} color="#F28C28" />
                                  <Text style={[styles.dropdownMenuItemText, { color: theme.text }]}>
                                    Class Standings
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.dropdownMenuItem,
                                    {
                                      borderTopWidth: 0.8,
                                      borderTopColor: isDark ? '#2E3D4F' : '#E8EAED',
                                    },
                                  ]}
                                  onPress={() => {
                                    setActiveMenuClassId(null);
                                    alert(
                                      `Enrolled in ${cls.className} (${cls.teacherName}). To unenroll, please contact your instructor.`
                                    );
                                  }}
                                >
                                  <Icon name="LogOut" size={14} color="#EA4335" />
                                  <Text style={[styles.dropdownMenuItemText, { color: '#EA4335' }]}>
                                    Unenroll
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Class Title & Details */}
                        <Text style={styles.bannerClassTitle} numberOfLines={1}>
                          {cls.className}
                        </Text>
                        <Text style={styles.bannerSectionText}>
                          Sec {cls.section}
                        </Text>
                        <Text style={styles.bannerTeacherText}>
                          {cls.teacherName}
                        </Text>

                        {/* Circular Avatar at Bottom Right overlapping banner */}
                        <View style={styles.overlappingAvatar}>
                          <Text style={styles.overlappingAvatarText}>{teacherInitials}</Text>
                        </View>
                      </View>

                      {/* Middle Row: Recent Quiz / Assignment */}
                      <View style={[styles.recentQuizSection, { borderBottomColor: theme.border }]}>
                        <Icon
                          name={recentQuiz?.hasSubmitted ? 'CheckCircle' : 'CheckSquare'}
                          size={18}
                          color="#0F9D58"
                          style={styles.recentQuizIcon}
                        />
                        <View style={styles.recentQuizInfo}>
                          <Text style={[styles.recentQuizTitle, { color: theme.text }]} numberOfLines={1}>
                            Recent: {recentQuiz ? recentQuiz.title : 'Course Syllabus & Objectives'}
                            {recentQuiz?.hasSubmitted ? ` (${recentQuiz.previousScore ?? 0}/${recentQuiz.questionCount})` : ''}
                          </Text>
                          <Text style={styles.recentQuizSubtext}>
                            {recentQuiz?.hasSubmitted ? 'Submitted' : 'Assigned'} • Due {recentQuiz ? formatDate(recentQuiz.createdAt) : formatDate(cls.enrolledAt)}
                          </Text>
                        </View>
                      </View>

                      {/* Footer: Action Icons */}
                      <View style={styles.classroomFooter}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.footerIconsRow}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                              setActiveStreamTab('quizzes');
                            }}
                            style={[styles.footerIconBtn, Platform.select({ web: { cursor: 'pointer' } as any })]}
                          >
                            <Icon name="Folder" size={17} color="#5F6368" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Leaderboard')}
                            style={[styles.footerIconBtn, Platform.select({ web: { cursor: 'pointer' } as any })]}
                          >
                            <Icon name="Trophy" size={17} color="#5F6368" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('StudentProfile')}
                            style={[styles.footerIconBtn, Platform.select({ web: { cursor: 'pointer' } as any })]}
                          >
                            <Icon name="CircleUserRound" size={17} color="#5F6368" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 3. Classwork & Merit Stream Section */}
            <View style={styles.streamContainer}>
              <View style={styles.streamHeaderRow}>
                <Text style={[styles.streamHeaderText, { color: theme.text }]}>
                  Classwork & Merit Stream
                </Text>
                <Text style={styles.streamLiveBadge}>
                  Live updates
                </Text>
              </View>

              {/* Filter Tabs matching Google Classroom */}
              <View style={[styles.streamTabsBar, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => setActiveStreamTab('all')}
                  style={[
                    styles.streamTabItem,
                    activeStreamTab === 'all' && styles.streamTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.streamTabItemText,
                      activeStreamTab === 'all' && styles.streamTabItemTextActive,
                    ]}
                  >
                    All Activity
                  </Text>
                  {activeStreamTab === 'all' && <View style={styles.activeTabUnderline} />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveStreamTab('quizzes')}
                  style={[
                    styles.streamTabItem,
                    activeStreamTab === 'quizzes' && styles.streamTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.streamTabItemText,
                      activeStreamTab === 'quizzes' && styles.streamTabItemTextActive,
                    ]}
                  >
                    Quizzes
                  </Text>
                  {activeStreamTab === 'quizzes' && <View style={styles.activeTabUnderline} />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveStreamTab('merits')}
                  style={[
                    styles.streamTabItem,
                    activeStreamTab === 'merits' && styles.streamTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.streamTabItemText,
                      activeStreamTab === 'merits' && styles.streamTabItemTextActive,
                    ]}
                  >
                    Merit Ledger
                  </Text>
                  {activeStreamTab === 'merits' && <View style={styles.activeTabUnderline} />}
                </TouchableOpacity>
              </View>

              {/* Stream Cards List */}
              <View style={styles.streamItemsList}>
                {/* 3.1 Quizzes in Stream */}
                {(activeStreamTab === 'all' || activeStreamTab === 'quizzes') &&
                  assignedQuizzes.map((quiz) => (
                    <View
                      key={`quiz-${quiz.id}`}
                      style={[
                        styles.streamCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                        Platform.select({
                          web: {
                            boxShadow: '0 1px 3px rgba(32, 33, 36, 0.04)',
                          } as any,
                        }),
                      ]}
                    >
                      <View style={[styles.streamIconSquare, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                        <Icon name="CheckSquare" size={18} color="#0F9D58" />
                      </View>

                      <View style={styles.streamCardMiddle}>
                        <Text style={[styles.streamCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {quiz.title}
                        </Text>
                        <Text style={styles.streamCardSubtext} numberOfLines={1}>
                          {quiz.hasSubmitted ? 'Graded' : 'Formative Check'} • {quiz.className || 'Academic Coursework'}
                        </Text>
                      </View>

                      {quiz.hasSubmitted ? (
                        <View style={styles.gradedPill}>
                          <Text style={styles.gradedPillText}>
                            Graded {quiz.previousScore ?? 0}/{quiz.questionCount}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => {
                            setActiveQuizForModal(quiz);
                            setIsTakeQuizModalOpen(true);
                          }}
                          style={styles.reviewBtn}
                        >
                          <Text style={styles.reviewBtnText}>Take Quiz</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                {/* 3.2 Merit Points in Stream */}
                {(activeStreamTab === 'all' || activeStreamTab === 'merits') &&
                  recentTransactions.map((tx) => (
                    <View
                      key={`tx-${tx.id}`}
                      style={[
                        styles.streamCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                        Platform.select({
                          web: {
                            boxShadow: '0 1px 3px rgba(32, 33, 36, 0.04)',
                          } as any,
                        }),
                      ]}
                    >
                      <View style={[styles.streamIconCircle, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                        <Icon name="Trophy" size={17} color="#0F9D58" />
                      </View>

                      <View style={styles.streamCardMiddle}>
                        <Text style={[styles.streamCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {tx.reason || 'Academic Excellence Recognition'}
                        </Text>
                        <Text style={styles.streamCardSubtext} numberOfLines={1}>
                          Merit Award • Department of {user?.department || 'Academics'}
                        </Text>
                      </View>

                      <View style={styles.meritAwardPill}>
                        <Text style={styles.meritAwardPillText}>
                          +{tx.amount} pts
                        </Text>
                      </View>
                    </View>
                  ))}

                {/* Empty state for active tab */}
                {((activeStreamTab === 'quizzes' && assignedQuizzes.length === 0) ||
                  (activeStreamTab === 'merits' && recentTransactions.length === 0) ||
                  (activeStreamTab === 'all' && assignedQuizzes.length === 0 && recentTransactions.length === 0)) && (
                    <View style={[styles.streamEmptyBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
                      <Icon name="CheckCircle" size={24} color="#0F9D58" />
                      <Text style={[styles.streamEmptyTitle, { color: theme.text }]}>No stream activity</Text>
                      <Text style={styles.streamEmptySubtext}>
                        {activeStreamTab === 'quizzes'
                          ? 'No quizzes available currently.'
                          : activeStreamTab === 'merits'
                            ? 'No merit records awarded yet.'
                            : 'Check back later for newly published assignments and merit records.'}
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          </ScrollView>

          {/* Join Class Modal */}
          <Modal
            visible={isJoinModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsJoinModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalDialog,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                    <Icon name="Key" size={18} color="#0F9D58" />
                  </View>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Enroll in Classroom
                  </Text>
                </View>

                {joinSuccess && (
                  <View style={[styles.modalBanner, { backgroundColor: isDark ? 'rgba(52, 168, 83, 0.2)' : '#E6F4EA' }]}>
                    <Icon name="CheckCircle" size={16} color="#34A853" />
                    <Text style={[styles.modalBannerText, { color: '#34A853' }]}>
                      {joinSuccess}
                    </Text>
                  </View>
                )}

                {joinError && (
                  <View style={[styles.modalBanner, { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' }]}>
                    <Icon name="AlertCircle" size={16} color="#EA4335" />
                    <Text style={[styles.modalBannerText, { color: '#EA4335' }]}>
                      {joinError}
                    </Text>
                  </View>
                )}

                <Input
                  label="Classroom Enrollment Code"
                  placeholder="e.g. CLS-MNQDLH"
                  autoCapitalize="characters"
                  value={enrollmentCodeInput}
                  onChangeText={setEnrollmentCodeInput}
                />

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      setIsJoinModalOpen(false);
                      setJoinError(null);
                      setJoinSuccess(null);
                    }}
                    disabled={isJoining}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                  <Button
                    title="Enroll Now"
                    variant="primary"
                    onPress={handleJoinClass}
                    loading={isJoining}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Take Quiz Modal */}
          <TakeQuizModal
            visible={isTakeQuizModalOpen}
            quiz={activeQuizForModal}
            onClose={() => {
              setIsTakeQuizModalOpen(false);
              setActiveQuizForModal(null);
            }}
            onSubmitted={() => {
              loadDashboardData();
              dispatch(refreshProfile());
            }}
          />
        </ScreenContainer>
        );
};

        const styles = StyleSheet.create({
          scrollContent: {
          padding: spacing.md,
        paddingBottom: spacing.xxl,
        width: '100%',
  },

        // 1. Header Greeting Styles
        headerGreetingCard: {
          padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 14,
  },
          welcomeMainRow: {
          flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
  },
        welcomeMainRowMobile: {
          flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 14,
  },
        welcomeTextCol: {
          flex: 1,
  },
        greetingHeaderText: {
        fontSize: 16,
        fontWeight: typography.weights.bold,
        marginBottom: 8,
  },
        pillsRow: {
          flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
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
        topJoinClassBtn: {
          flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#0F9D58',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 8,
        alignSelf: 'flex-start',
  },
        topJoinClassBtnText: {
          color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
  },

        // 2. Classroom Cards Grid Styles (Responsive for mobile & laptop)
        classroomCardsContainer: {
          flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: spacing.lg,
  },
        classroomCard: {
          flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'visible',
        position: 'relative',
  },
        classroomBanner: {
          backgroundColor: '#1E7E44',
        padding: 16,
        paddingBottom: 22,
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        position: 'relative',
  },
        bannerTopRow: {
          flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
  },
        enrolledTag: {
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
  },
        enrolledTagText: {
          color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.6,
  },
        threeDotsWrapper: {
          position: 'relative',
        zIndex: 999,
  },
        threeDotsBtn: {
        padding: 4,
        borderRadius: 4,
  },
        classroomDropdownMenu: {
          position: 'absolute',
        top: 28,
        right: 0,
        width: 175,
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 4,
        zIndex: 9999,
  },
        dropdownMenuItem: {
          flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 9,
  },
        dropdownMenuItemText: {
          fontSize: 12,
        fontWeight: '600',
  },
        bannerClassTitle: {
          color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 3,
  },
        bannerSectionText: {
          color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
  },
        bannerTeacherText: {
          color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 12,
        fontWeight: '400',
  },
        overlappingAvatar: {
          position: 'absolute',
        right: 16,
        bottom: -18,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#144D29',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
  },
        overlappingAvatarText: {
          color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
  },
        recentQuizSection: {
          flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        gap: 10,
  },
        recentQuizIcon: {
          marginTop: 2,
  },
        recentQuizInfo: {
          flex: 1,
  },
        recentQuizTitle: {
          fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
  },
        recentQuizSubtext: {
          fontSize: 11,
        color: '#5F6368',
  },
        classroomFooter: {
          flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
  },
        footerIconsRow: {
          flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
  },
        footerIconBtn: {
          padding: 6,
  },

        // 3. Classwork & Merit Stream Styles
        streamContainer: {
          marginTop: spacing.sm,
  },
        streamHeaderRow: {
          flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
  },
        streamHeaderText: {
          fontSize: 16,
        fontWeight: '800',
  },
        streamLiveBadge: {
          fontSize: 11,
        color: '#5F6368',
        fontWeight: '500',
  },
        streamTabsBar: {
          flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: 12,
  },
        streamTabItem: {
          paddingVertical: 10,
        paddingHorizontal: 14,
        position: 'relative',
  },
        streamTabItemActive: { },
        streamTabItemText: {
          fontSize: 13,
        color: '#5F6368',
        fontWeight: '600',
  },
        streamTabItemTextActive: {
          color: '#0F9D58',
        fontWeight: '700',
  },
        activeTabUnderline: {
          position: 'absolute',
        bottom: -1,
        left: 14,
        right: 14,
        height: 3,
        backgroundColor: '#0F9D58',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
  },
        streamItemsList: {
          gap: 10,
  },
        streamCard: {
          flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
  },
        streamIconSquare: {
          width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
  },
        streamIconCircle: {
          width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
  },
        streamCardMiddle: {
          flex: 1,
  },
        streamCardTitle: {
          fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
  },
        streamCardSubtext: {
          fontSize: 11,
        color: '#5F6368',
  },
        gradedPill: {
          backgroundColor: '#E6F4EA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CEEAD6',
  },
        gradedPillText: {
          color: '#137333',
        fontSize: 11,
        fontWeight: '700',
  },
        reviewBtn: {
          backgroundColor: '#F1F3F4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
  },
        reviewBtnText: {
          color: '#202124',
        fontSize: 11,
        fontWeight: '700',
  },
        meritAwardPill: {
          backgroundColor: '#E6F4EA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CEEAD6',
  },
        meritAwardPillText: {
          color: '#137333',
        fontSize: 11,
        fontWeight: '700',
  },
        streamEmptyBox: {
          padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
  },
        streamEmptyTitle: {
          fontSize: 13,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
  },
        streamEmptySubtext: {
          fontSize: 11,
        color: '#5F6368',
        textAlign: 'center',
  },

        // Modal & Empty States
        emptyCard: {
          padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.md,
  },
        emptyIconCircle: {
          width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
  },
        emptyTitle: {
          fontSize: 14,
        fontWeight: typography.weights.bold,
        marginBottom: 4,
  },
        emptySubtitle: {
          fontSize: 12,
        color: '#5F6368',
        textAlign: 'center',
        maxWidth: 380,
        lineHeight: 18,
  },
        modalOverlay: {
          flex: 1,
        backgroundColor: 'rgba(23, 50, 77, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
  },
        modalDialog: {
          width: '100%',
        maxWidth: 420,
        borderRadius: spacing.borderRadius.md,
        borderWidth: 1,
        padding: spacing.lg,
        ...Platform.select({
          web: {
          boxShadow: '0 16px 36px rgba(23, 50, 77, 0.35)',
      } as any,
    }),
  },
        modalHeader: {
          flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.md,
  },
        modalIconBox: {
          width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
  },
        modalTitle: {
          fontSize: 16,
        fontWeight: typography.weights.extrabold,
  },
        modalBanner: {
          flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: spacing.borderRadius.xs,
        marginBottom: spacing.sm,
        gap: 6,
  },
        modalBannerText: {
          fontSize: 11,
        fontWeight: typography.weights.bold,
        flex: 1,
  },
        modalActions: {
          flexDirection: 'row',
        marginTop: spacing.md,
  },
});
