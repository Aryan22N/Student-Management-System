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
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { classApi } from '../../api/classApi';
import { LeaderboardEntry } from '../../types/leaderboard';
import { ClassRoom } from '../../types/class';
import { TeacherTabParamList, TeacherStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type TeacherDashboardNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TeacherTabParamList, 'TeacherDashboard'>,
  NativeStackNavigationProp<TeacherStackParamList>
>;

interface TeacherDashboardProps {
  navigation: TeacherDashboardNavProp;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isSmallMobile = width < 480;
  const { user, teacherProfile } = useAppSelector((state) => state.auth);

  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [topStudents, setTopStudents] = useState<LeaderboardEntry[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create Class Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [sectionInput, setSectionInput] = useState('A');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [studentsRes, lbRes, classesRes] = await Promise.all([
        studentApi.getStudents('', 0, 1),
        leaderboardApi.getLeaderboard(0, 5),
        classApi.getMyClasses(),
      ]);

      setTotalStudentsCount(studentsRes.totalElements);
      setTopStudents(lbRes.content);
      setClasses(classesRes);
    } catch (e) {
      console.warn('Failed to load teacher dashboard data', e);
    }
  }, []);

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

  const handleCreateClass = async () => {
    setCreateError(null);
    if (!classNameInput.trim()) {
      setCreateError('Classroom name is required');
      return;
    }
    if (!subjectInput.trim()) {
      setCreateError('Subject / Department is required');
      return;
    }

    setIsCreating(true);
    try {
      await classApi.createClass({
        className: classNameInput.trim(),
        subject: subjectInput.trim(),
        section: sectionInput.trim() || 'A',
      });
      setClassNameInput('');
      setSubjectInput('');
      setSectionInput('A');
      setIsCreateModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create classroom. Please try again.';
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyEnrollmentCode = (code: string) => {
    setCopiedCode(code);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const totalPointsPool = topStudents.reduce((acc, curr) => acc + curr.totalPoints, 0);

  return (
    <ScreenContainer
      title="Faculty Dashboard"
      subtitle={`${teacherProfile?.department ?? 'Academic Faculty'} • Welcome, ${user?.firstName} ${user?.lastName}`}
      breadcrumbs={[
        { label: 'FACULTY' },
        { label: 'DASHBOARD' },
      ]}
      activeRoute="TeacherDashboard"
      maxWidth={1100}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          !isDesktop && styles.scrollContentMobile,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0F9D58"
          />
        }
      >
        {/* Welcome Identity Banner */}
              <Card accentTop style={[styles.welcomeCard, !isDesktop && styles.welcomeCardMobile]}>
                <View style={[styles.welcomeRow, isSmallMobile && styles.welcomeRowSmall]}>
                  <View style={[styles.welcomeLeft, isSmallMobile && { width: '100%' }]}>
                    <View style={[styles.avatarBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' }]}>
                      <Text style={styles.avatarText}>
                        {user?.firstName?.charAt(0) || 'F'}
                        {user?.lastName?.charAt(0) || ''}
                      </Text>
                    </View>
                      <View style={[styles.welcomeInfo, { flex: 1 }]}>
                        <View style={styles.nameBadgesRow}>
                            <Text style={[styles.userNameText, { color: theme.text }]} numberOfLines={1}>
                              {user?.firstName} {user?.lastName}
                            </Text>
                            <Badge
                              label={teacherProfile?.employeeId ? `ID: ${teacherProfile.employeeId}` : 'FACULTY'}
                              variant="primary"
                              size="sm"
                            />
                            <Badge
                              label={teacherProfile?.department ?? 'Academic Staff'}
                              variant="neutral"
                              size="sm"
                            />
                        </View>
                          <Text style={styles.userEmailText} numberOfLines={1}>
                            {user?.email} • Faculty Evaluation Desk
                          </Text>
                      </View>
                    </View>

                      <View style={[styles.headerActions, isSmallMobile && styles.headerActionsSmall]}>
                        <Button
                          title="Award Points"
                          onPress={() => navigation.navigate('AwardPoints')}
                          icon={<Icon name="Award" size={15} color="#FFFFFF" />}
                          size="sm"
                          style={isSmallMobile ? { flex: 1 } : undefined}
                        />
                        <Button
                          title="New Class"
                          variant="outline"
                          onPress={() => setIsCreateModalOpen(true)}
                          icon={<Icon name="Plus" size={14} color={isDark ? '#4285F4' : '#0F9D58'} />}
                          size="sm"
                          style={isSmallMobile ? { flex: 1 } : undefined}
                        />
                      </View>
                    </View>
                  </Card>

                  {/* 4 Polished KPI Cards */}
                    <View style={[styles.kpiGrid, !isDesktop && styles.kpiGridMobile]}>
                      {/* Card 1: Total Enrolled Students */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('StudentDirectory')}
                        style={[
                          styles.kpiCardWrap,
                          !isDesktop && styles.kpiCardWrapMobile,
                          Platform.select({ web: { cursor: 'pointer' } as any }),
                        ]}
                      >
                          <Card style={[styles.kpiCard, !isDesktop && styles.kpiCardMobile]}>
                            <View style={styles.kpiHeaderRow}>
                              <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
                                <Icon name="Users" size={isSmallMobile ? 15 : 18} color="#0F9D58" />
                              </View>
                              <Text style={[styles.kpiLabel, isSmallMobile && { fontSize: 9 }]}>TOTAL STUDENTS</Text>
                            </View>
                              <Text style={[styles.kpiValue, { color: isDark ? '#4285F4' : '#0F9D58' }, isSmallMobile && { fontSize: 20 }]}>
                                {totalStudentsCount}
                              </Text>
                                <Text style={[styles.kpiDescription, isSmallMobile && { fontSize: 10 }]} numberOfLines={2}>
                                  Active students registered in database
                                </Text>
                              </Card>
                            </TouchableOpacity>

                            {/* Card 2: Active Classrooms */}
                                <View style={[styles.kpiCardWrap, !isDesktop && styles.kpiCardWrapMobile]}>
                                  <Card style={[styles.kpiCard, !isDesktop && styles.kpiCardMobile]}>
                                    <View style={styles.kpiHeaderRow}>
                                      <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(32, 33, 36, 0.3)' : '#EEF2F6' }]}>
                                        <Icon name="School" size={isSmallMobile ? 15 : 18} color={isDark ? '#4285F4' : '#202124'} />
                                      </View>
                                      <Text style={[styles.kpiLabel, isSmallMobile && { fontSize: 9 }]}>ACTIVE CLASSES</Text>
                                    </View>
                                      <Text style={[styles.kpiValue, { color: theme.text }, isSmallMobile && { fontSize: 20 }]}>
                                        {classes.length}
                                      </Text>
                                        <Text style={[styles.kpiDescription, isSmallMobile && { fontSize: 10 }]} numberOfLines={2}>
                                          Courses managed by your faculty profile
                                        </Text>
                                      </Card>
                                    </View>

                                    {/* Card 3: Points Allocated */}
                                    <TouchableOpacity
                                      activeOpacity={0.8}
                                      onPress={() => navigation.navigate('Leaderboard')}
                                      style={[
                                        styles.kpiCardWrap,
                                        !isDesktop && styles.kpiCardWrapMobile,
                                        Platform.select({ web: { cursor: 'pointer' } as any }),
                                      ]}
                                    >
                                        <Card style={[styles.kpiCard, !isDesktop && styles.kpiCardMobile]}>
                                          <View style={styles.kpiHeaderRow}>
                                            <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(52, 168, 83, 0.15)' : '#E6F4EA' }]}>
                                              <Icon name="Award" size={isSmallMobile ? 15 : 18} color="#34A853" />
                                            </View>
                                            <Text style={[styles.kpiLabel, isSmallMobile && { fontSize: 9 }]}>TOP POINTS POOL</Text>
                                          </View>
                                            <Text style={[styles.kpiValue, { color: '#34A853' }, isSmallMobile && { fontSize: 20 }]}>
                                              {totalPointsPool}
                                              <Text style={styles.kpiUnit}> pts</Text>
                                            </Text>
                                              <Text style={[styles.kpiDescription, isSmallMobile && { fontSize: 10 }]} numberOfLines={2}>
                                                Accumulated across top 5 scholars
                                              </Text>
                                            </Card>
                                          </TouchableOpacity>

                                          {/* Card 4: Leaderboard Top Rank */}
                                          <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => navigation.navigate('Leaderboard')}
                                            style={[
                                              styles.kpiCardWrap,
                                              !isDesktop && styles.kpiCardWrapMobile,
                                              Platform.select({ web: { cursor: 'pointer' } as any }),
                                            ]}
                                          >
                                              <Card style={[styles.kpiCard, !isDesktop && styles.kpiCardMobile]}>
                                                <View style={styles.kpiHeaderRow}>
                                                  <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(251, 188, 4, 0.15)' : '#FEF7E0' }]}>
                                                    <Icon name="Trophy" size={isSmallMobile ? 15 : 18} color="#F28C28" />
                                                  </View>
                                                  <Text style={[styles.kpiLabel, isSmallMobile && { fontSize: 9 }]}>LEADERBOARD</Text>
                                                </View>
                                                  <Text style={[styles.kpiValue, { color: '#F28C28' }, isSmallMobile && { fontSize: 20 }]}>
                                                    {topStudents[0]?.totalPoints ? `${topStudents[0].totalPoints} pts` : 'No Merits'}
                                                  </Text>
                                                    <Text style={[styles.kpiDescription, isSmallMobile && { fontSize: 10 }]} numberOfLines={1}>
                                                      {topStudents[0]?.studentName ? `Leader: ${topStudents[0].studentName}` : 'Standings active'}
                                                    </Text>
                                                  </Card>
                                                </TouchableOpacity>
                                              </View>

                                              {/* My Classrooms Roster Section */}
                                                  <View style={[styles.sectionHeaderRow, isSmallMobile && styles.sectionHeaderRowSmall]}>
                                                    <View style={{ flex: 1, minWidth: 180 }}>
                                                      <Text style={[styles.sectionHeading, { color: theme.text }]}>
                                                        My Active Classrooms ({classes.length})
                                                      </Text>
                                                        <Text style={styles.sectionSubtitle} numberOfLines={isSmallMobile ? 1 : 2}>
                                                          Classroom rosters, enrollment codes, and student registries
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                      onPress={() => setIsCreateModalOpen(true)}
                                                      style={[
                                                        styles.sectionActionBtn,
                                                        { borderColor: theme.border, backgroundColor: theme.card },
                                                        Platform.select({ web: { cursor: 'pointer' } as any }),
                                                      ]}
                                                    >
                                                      <Icon name="Plus" size={14} color="#0F9D58" />
                                                      <Text style={styles.sectionActionBtnText}>Create Course</Text>
                                                    </TouchableOpacity>
                                                  </View>

                                                  {classes.length === 0 ? (
                                                    <Card style={styles.emptyCard}>
                                                      <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA' }]}>
                                                        <Icon name="School" size={28} color="#0F9D58" />
                                                      </View>
                                                      <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                                        No Classrooms Created Yet
                                                      </Text>
                                                      <Text style={styles.emptySubtitle}>
                                                        Create your first classroom to generate a unique enrollment code and link students to award points.
                                                      </Text>
                                                      <Button
                                                        title="Create New Classroom"
                                                        onPress={() => setIsCreateModalOpen(true)}
                                                        icon={<Icon name="Plus" size={15} color="#FFFFFF" />}
                                                        style={{ marginTop: spacing.md, alignSelf: 'center' }}
                                                      />
                                                    </Card>
                                                  ) : (
                                                    <View style={styles.classroomsGrid}>
                                                      {classes.map((cls) => {
                                                        const isCopied = copiedCode === cls.enrollmentCode;
                                                        return (
                                                            <Card
                                                              key={cls.id}
                                                              style={[
                                                                styles.classCard,
                                                                !isDesktop && styles.classCardMobile,
                                                              ]}
                                                            >
                                                              <TouchableOpacity
                                                                activeOpacity={0.7}
                                                                onPress={() => navigation.navigate('ClassDetails', { classId: cls.id })}
                                                                style={Platform.select({ web: { cursor: 'pointer' } as any })}
                                                              >
                                                                <View style={styles.classTopRow}>
                                                                  <Badge label={cls.subject} variant="primary" size="sm" />
                                                                  <Badge label={`Sec ${cls.section}`} variant="neutral" size="sm" />
                                                                </View>
                                                                <Text style={[styles.classCardTitle, { color: theme.text }]} numberOfLines={1}>
                                                                  {cls.className}
                                                                </Text>
                                                                <Text style={styles.classStudentCount}>
                                                                  {cls.studentCount} {cls.studentCount === 1 ? 'enrolled student' : 'enrolled students'}
                                                                </Text>
                                                              </TouchableOpacity>

                                                              {/* Enrollment Key & Quick Copy */}
                                                              <View style={[styles.codeBox, { backgroundColor: isDark ? '#111C2B' : '#F8FAF9', borderColor: theme.border }]}>
                                                                <View style={styles.codeLabelRow}>
                                                                  <Icon name="Key" size={12} color="#0F9D58" />
                                                                  <Text style={styles.codeText}>{cls.enrollmentCode}</Text>
                                                                </View>
                                                                <TouchableOpacity
                                                                  onPress={() => handleCopyEnrollmentCode(cls.enrollmentCode)}
                                                                  style={[
                                                                    styles.copyBtn,
                                                                    isCopied && { backgroundColor: isDark ? 'rgba(52, 168, 83, 0.2)' : '#E6F4EA' },
                                                                    Platform.select({ web: { cursor: 'pointer' } as any }),
                                                                  ]}
                                                                >
                                                                  <Icon name={isCopied ? 'Check' : 'Copy'} size={13} color={isCopied ? '#34A853' : '#5F6368'} />
                                                                  <Text style={[styles.copyBtnText, isCopied && { color: '#34A853' }]}>
                                                                    {isCopied ? 'Copied' : 'Copy'}
                                                                  </Text>
                                                                </TouchableOpacity>
                                                              </View>

                                                              <View style={[styles.classCardFooter, { borderTopColor: theme.border }]}>
                                                                <TouchableOpacity
                                                                  onPress={() => navigation.navigate('ClassDetails', { classId: cls.id })}
                                                                  style={styles.detailsLinkRow}
                                                                >
                                                                  <Text style={styles.detailsLinkText}>View Roster</Text>
                                                                  <Icon name="ChevronRight" size={13} color="#0F9D58" />
                                                                </TouchableOpacity>
                                                                <Text style={styles.createdDateText}>{formatDate(cls.createdAt)}</Text>
                                                              </View>
                                                            </Card>
                                                            );
            })}
                                                          </View>
                                                        )
                                                      }

        {/* Leaderboard Quick Standings Preview */ }
                                                          <View style={[styles.sectionHeaderRow, { marginTop: spacing.xl }, isSmallMobile && styles.sectionHeaderRowSmall]}>
                                                            <View style={{ flex: 1, minWidth: 180 }}>
                                                              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                                                                Top Performing Students
                                                              </Text>
                                                                <Text style={styles.sectionSubtitle} numberOfLines={isSmallMobile ? 1 : 2}>
                                                                  Current academic merit leaderboard leaders
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                              onPress={() => navigation.navigate('Leaderboard')}
                                                              style={Platform.select({ web: { cursor: 'pointer' } as any })}
                                                            >
                                                              <Text style={styles.viewLeaderboardLink}>
                                                                View Full Standings →
                                                              </Text>
                                                            </TouchableOpacity>
                                                          </View>

                                                          {topStudents.length === 0 ? (
                                                            <Card style={styles.emptyCard}>
                                                              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Students Evaluated Yet</Text>
                                                              <Text style={styles.emptySubtitle}>Award points to recognized students to populate the institutional leaderboard.</Text>
                                                            </Card>
                                                          ) : (
                                                            topStudents.slice(0, 4).map((entry) => (
                                                                <Card
                                                                  key={entry.studentId}
                                                                  style={[styles.rankRowCard, !isDesktop && styles.rankRowCardMobile]}
                                                                >
                                                                  <View style={styles.rankRow}>
                                                                    <View
                                                                      style={[
                                                                        styles.rankBadgeBox,
                                                                        isSmallMobile && { width: 28, height: 28, borderRadius: 14 },
                                                                        {
                                                                          backgroundColor:
                                                                            entry.rank === 1
                                                                              ? '#FEF7E0'
                                                                              : entry.rank === 2
                                                                                ? '#E6F4EA'
                                                                                : entry.rank === 3
                                                                                  ? '#E6F4EA'
                                                                                  : isDark
                                                                                    ? '#1B2D42'
                                                                                    : '#F1F5F9',
                                                                          borderColor:
                                                                            entry.rank === 1
                                                                              ? '#F28C28'
                                                                              : entry.rank === 2
                                                                                ? '#0F9D58'
                                                                                : entry.rank === 3
                                                                                  ? '#34A853'
                                                                                  : theme.border,
                                                                        },
                                                                      ]}
                                                                    >
                                                                      <Text
                                                                        style={[
                                                                          styles.rankBadgeText,
                                                                          isSmallMobile && { fontSize: 11 },
                                                                          {
                                                                            color:
                                                                              entry.rank === 1
                                                                                ? '#F28C28'
                                                                                : entry.rank === 2
                                                                                  ? '#0F9D58'
                                                                                  : entry.rank === 3
                                                                                    ? '#34A853'
                                                                                    : '#5F6368',
                                                                          },
                                                                        ]}
                                                                      >
                                                                        #{entry.rank}
                                                                      </Text>
                                                                    </View>

                                                                        <View style={[styles.studentInfoCol, { flex: 1 }]}>
                                                                          <Text style={[styles.studentFullName, { color: theme.text }]} numberOfLines={1}>
                                                                            {entry.studentName}
                                                                          </Text>
                                                                            <Text style={styles.studentSubMeta} numberOfLines={1}>
                                                                              ID: {entry.studentIdNumber} • {entry.gradeLevel}
                                                                            </Text>
                                                                        </View>

                                                                        <View style={styles.pointsCol}>
                                                                          <Badge label={`${entry.totalPoints} pts`} variant="primary" size={isSmallMobile ? 'sm' : 'md'} />
                                                                        </View>
                                                                    </View>
                                                                </Card>
                                                                ))
        )}
                                                              </ScrollView>

      {/* Create Class Modal */ }
                                                              < Modal
        visible = { isCreateModalOpen }
        transparent
        animationType = "fade"
        onRequestClose = {() => setIsCreateModalOpen(false)}
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
                                                                  <Icon name="School" size={18} color="#0F9D58" />
                                                                </View>
                                                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                                                  Create New Classroom
                                                                </Text>
                                                              </View>

                                                              {createError && (
                                                                <View style={[styles.modalBanner, { backgroundColor: isDark ? 'rgba(234, 67, 53, 0.2)' : '#FCE8E6' }]}>
                                                                  <Icon name="AlertCircle" size={16} color="#EA4335" />
                                                                  <Text style={[styles.modalBannerText, { color: '#EA4335' }]}>
                                                                    {createError}
                                                                  </Text>
                                                                </View>
                                                              )}

                                                              <Input
                                                                label="Classroom Name"
                                                                placeholder="e.g. Advanced Physics 101"
                                                                value={classNameInput}
                                                                onChangeText={setClassNameInput}
                                                              />

                                                              <Input
                                                                label="Subject / Field"
                                                                placeholder="e.g. Physics, Mathematics, Literature"
                                                                value={subjectInput}
                                                                onChangeText={setSubjectInput}
                                                              />

                                                              <Input
                                                                label="Section"
                                                                placeholder="e.g. A, B, Honors"
                                                                value={sectionInput}
                                                                onChangeText={setSectionInput}
                                                              />

                                                              <View style={styles.modalActions}>
                                                                <Button
                                                                  title="Cancel"
                                                                  variant="outline"
                                                                  onPress={() => {
                                                                    setIsCreateModalOpen(false);
                                                                    setCreateError(null);
                                                                  }}
                                                                  disabled={isCreating}
                                                                  style={{ flex: 1, marginRight: spacing.sm }}
                                                                />
                                                                <Button
                                                                  title="Create Classroom"
                                                                  variant="primary"
                                                                  onPress={handleCreateClass}
                                                                  loading={isCreating}
                                                                  style={{ flex: 1 }}
                                                                />
                                                              </View>
                                                            </View>
                                                          </View>
                                                        </Modal>
    </ScreenContainer>
                                                  );
};

                                                  const styles = StyleSheet.create({
                                                    scrollContent: {
                                                    padding: spacing.lg,
                                                  paddingBottom: spacing.xxl,
                                                  width: '100%',
  },
                                                  scrollContentMobile: {
                                                    padding: 12,
                                                  paddingBottom: 24,
  },
                                                  welcomeCard: {
                                                    padding: spacing.md,
                                                  marginBottom: spacing.md,
  },
                                                  welcomeCardMobile: {
                                                    padding: 12,
                                                  marginBottom: 10,
  },
                                                  welcomeRow: {
                                                    flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  flexWrap: 'wrap',
                                                  gap: 12,
  },
                                                  welcomeRowSmall: {
                                                    flexDirection: 'column',
                                                  alignItems: 'stretch',
                                                  gap: 10,
  },
                                                  welcomeLeft: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 12,
  },
                                                  avatarBox: {
                                                    width: 44,
                                                  height: 44,
                                                  borderRadius: spacing.borderRadius.sm,
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
  },
                                                  avatarText: {
                                                    fontSize: 16,
                                                  fontWeight: typography.weights.extrabold,
                                                  color: '#0F9D58',
  },
                                                  welcomeInfo: {
                                                    justifyContent: 'center',
  },
                                                  nameBadgesRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  flexWrap: 'wrap',
                                                  gap: 8,
                                                  marginBottom: 4,
  },
                                                  userNameText: {
                                                    fontSize: 16,
                                                  fontWeight: typography.weights.extrabold,
                                                  letterSpacing: -0.2,
  },
                                                  userEmailText: {
                                                    fontSize: 11,
                                                  color: '#5F6368',
  },
                                                  headerActions: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 8,
  },
                                                  headerActionsSmall: {
                                                    width: '100%',
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                  gap: 8,
                                                  marginTop: 4,
  },
                                                  kpiGrid: {
                                                    flexDirection: 'row',
                                                  gap: 12,
                                                  marginBottom: spacing.lg,
                                                  flexWrap: 'wrap',
  },
                                                  kpiGridMobile: {
                                                    gap: 8,
                                                  marginBottom: 12,
  },
                                                  kpiCardWrap: {
                                                    flex: 1,
                                                  minWidth: 200,
  },
                                                  kpiCardWrapMobile: {
                                                    flex: 1,
                                                  minWidth: '47%',
  },
                                                  kpiCard: {
                                                    padding: spacing.md,
                                                  marginBottom: 0,
  },
                                                  kpiCardMobile: {
                                                    padding: 10,
  },
                                                  kpiHeaderRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 8,
                                                  marginBottom: 8,
  },
                                                  kpiIconBox: {
                                                    width: 32,
                                                  height: 32,
                                                  borderRadius: 8,
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
  },
                                                  kpiLabel: {
                                                    fontSize: 10,
                                                  fontWeight: typography.weights.extrabold,
                                                  color: '#5F6368',
                                                  letterSpacing: 0.8,
  },
                                                  kpiValue: {
                                                    fontSize: 26,
                                                  fontWeight: typography.weights.extrabold,
                                                  letterSpacing: -0.5,
                                                  marginBottom: 4,
  },
                                                  kpiUnit: {
                                                    fontSize: 14,
                                                  fontWeight: typography.weights.medium,
                                                  color: '#5F6368',
  },
                                                  kpiDescription: {
                                                    fontSize: 11,
                                                  color: '#5F6368',
                                                  lineHeight: 16,
  },
                                                  sectionHeaderRow: {
                                                    flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  marginBottom: spacing.sm,
  },
                                                  sectionHeaderRowSmall: {
                                                    alignItems: 'flex-start',
                                                  flexWrap: 'wrap',
                                                  gap: 6,
  },
                                                  sectionHeading: {
                                                    fontSize: 15,
                                                  fontWeight: typography.weights.extrabold,
                                                  letterSpacing: -0.2,
  },
                                                  sectionSubtitle: {
                                                    fontSize: 11,
                                                  color: '#5F6368',
                                                  marginTop: 2,
  },
                                                  sectionActionBtn: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  paddingHorizontal: 10,
                                                  paddingVertical: 5,
                                                  borderRadius: spacing.borderRadius.sm,
                                                  borderWidth: 1,
                                                  gap: 4,
  },
                                                  sectionActionBtnText: {
                                                    fontSize: 11,
                                                  fontWeight: typography.weights.bold,
                                                  color: '#0F9D58',
  },
                                                  emptyCard: {
                                                    alignItems: 'center',
                                                  justifyContent: 'center',
                                                  paddingVertical: spacing.xl,
                                                  paddingHorizontal: spacing.lg,
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
                                                  classroomsGrid: {
                                                    flexDirection: 'row',
                                                  flexWrap: 'wrap',
                                                  gap: 12,
  },
                                                  classCard: {
                                                    flex: 1,
                                                  minWidth: 280,
                                                  padding: spacing.md,
  },
                                                  classCardMobile: {
                                                    minWidth: '100%',
                                                  flex: 0,
                                                  width: '100%',
                                                  padding: 12,
  },
                                                  classTopRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 6,
                                                  marginBottom: 8,
  },
                                                  classCardTitle: {
                                                    fontSize: 15,
                                                  fontWeight: typography.weights.extrabold,
                                                  marginBottom: 2,
  },
                                                  classStudentCount: {
                                                    fontSize: 11,
                                                  color: '#5F6368',
                                                  marginBottom: 10,
  },
                                                  codeBox: {
                                                    flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  paddingHorizontal: 10,
                                                  paddingVertical: 6,
                                                  borderRadius: 6,
                                                  borderWidth: 1,
                                                  marginBottom: 10,
  },
                                                  codeLabelRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 6,
  },
                                                  codeText: {
                                                    fontSize: 12,
                                                  fontWeight: typography.weights.bold,
                                                  letterSpacing: 0.6,
  },
                                                  copyBtn: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  paddingHorizontal: 6,
                                                  paddingVertical: 2,
                                                  borderRadius: 4,
                                                  gap: 4,
  },
                                                  copyBtnText: {
                                                    fontSize: 10,
                                                  fontWeight: typography.weights.semibold,
                                                  color: '#5F6368',
  },
                                                  classCardFooter: {
                                                    flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  paddingTop: 8,
                                                  borderTopWidth: 1,
  },
                                                  detailsLinkRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 4,
  },
                                                  detailsLinkText: {
                                                    fontSize: 11,
                                                  fontWeight: typography.weights.bold,
                                                  color: '#0F9D58',
  },
                                                  createdDateText: {
                                                    fontSize: 10,
                                                  color: '#5F6368',
  },
                                                  viewLeaderboardLink: {
                                                    fontSize: 11,
                                                  fontWeight: typography.weights.bold,
                                                  color: '#0F9D58',
  },
                                                  rankRowCard: {
                                                    marginBottom: spacing.xs,
                                                  padding: spacing.md,
  },
                                                  rankRowCardMobile: {
                                                    padding: 10,
  },
                                                  rankRow: {
                                                    flexDirection: 'row',
                                                  alignItems: 'center',
                                                  gap: 12,
  },
                                                  rankBadgeBox: {
                                                    width: 32,
                                                  height: 32,
                                                  borderRadius: 16,
                                                  borderWidth: 1,
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
  },
                                                  rankBadgeText: {
                                                    fontSize: 12,
                                                  fontWeight: typography.weights.extrabold,
  },
                                                  studentInfoCol: {
                                                    flex: 1,
  },
                                                  studentFullName: {
                                                    fontSize: 13,
                                                  fontWeight: typography.weights.bold,
  },
                                                  studentSubMeta: {
                                                    fontSize: 11,
                                                  color: '#5F6368',
                                                  marginTop: 1,
  },
                                                  pointsCol: {
                                                    alignItems: 'flex-end',
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
