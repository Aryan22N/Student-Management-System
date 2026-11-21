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
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { studentApi } from '../../api/studentApi';
import { StudentDetail } from '../../types/student';
import { TeacherStackParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

interface StudentDirectoryProps {
  navigation: NativeStackNavigationProp<TeacherStackParamList>;
}

export const StudentDirectoryScreen: React.FC<StudentDirectoryProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchStudents = useCallback(
    async (pageToLoad: number, query: string, refresh: boolean = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageToLoad > 0) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await studentApi.getStudents(query, pageToLoad, 10);
        if (refresh || pageToLoad === 0) {
          setStudents(res.content);
        } else {
          setStudents((prev) => [...prev, ...res.content]);
        }
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.warn('Failed to load students directory', e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchStudents(0, searchQuery, true);
    }, [fetchStudents, searchQuery])
  );

  useEffect(() => {
    fetchStudents(0, searchQuery);
  }, [fetchStudents, searchQuery]);

  const onRefresh = () => {
    fetchStudents(0, searchQuery, true);
  };

  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && page + 1 < totalPages) {
      fetchStudents(page + 1, searchQuery);
    }
  };

  const filteredStudents = gradeFilter === 'ALL'
    ? students
    : students.filter((s) => s.gradeLevel === gradeFilter);

  return (
    <ScreenContainer
      title="Student Directory"
      subtitle="Institutional student registry, student profiles, and academic records"
      breadcrumbs={[
        { label: 'FACULTY' },
        { label: 'STUDENT DIRECTORY' },
      ]}
      activeRoute="StudentDirectory"
      maxWidth={1100}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Search Bar */}
          <Input
            placeholder="Search by student name, ID number, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            leftIcon={<Icon name="Search" size={18} color="#5F6368" />}
          />

          {/* Grade Level Filter Chips */}
          <View style={styles.filterChipRow}>
            {['ALL', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((grade) => {
              const active = gradeFilter === grade;
              return (
                <TouchableOpacity
                  key={grade}
                  activeOpacity={0.7}
                  onPress={() => setGradeFilter(grade)}
                  style={[
                    styles.filterChip,
                    active && {
                      backgroundColor: '#0F9D58',
                      borderColor: '#0F9D58',
                    },
                    !active && {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: active ? '#FFFFFF' : '#5F6368',
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {grade === 'ALL' ? 'All Grades' : grade}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0F9D58" />
            <Text style={styles.loadingText}>Fetching registry from database...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
                style={Platform.select({ web: { cursor: 'pointer' } as any })}
              >
                <Card style={styles.studentCard}>
                  <View style={styles.cardRow}>
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: isDark ? 'rgba(15, 157, 88, 0.2)' : '#E6F4EA' },
                      ]}
                    >
                      <Text style={[styles.avatarText, { color: '#0F9D58' }]}>
                        {item.firstName.charAt(0)}
                        {item.lastName.charAt(0)}
                      </Text>
                    </View>

                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.studentName, { color: theme.text }]}>
                          {item.firstName} {item.lastName}
                        </Text>
                        <Badge label={item.gradeLevel} variant="neutral" size="sm" style={{ marginLeft: 6 }} />
                      </View>
                      <Text style={styles.studentMeta}>
                        ID: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.studentIdNumber}</Text> • {item.email}
                      </Text>
                    </View>

                    <View style={styles.pointsCol}>
                      <Badge
                        label={`${item.totalPoints} pts`}
                        variant="primary"
                        size="md"
                      />
                      <Icon
                        name="ChevronRight"
                        size={16}
                        color="#5F6368"
                        style={{ marginTop: 4, alignSelf: 'center' }}
                      />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#0F9D58"
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No students found"
                subtitle="Try searching with a different name or student ID number."
              />
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#0F9D58" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchInputContainer: {
    marginBottom: spacing.xs,
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  studentCard: {
    marginBottom: spacing.xs + 2,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  infoCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  studentMeta: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 2,
  },
  pointsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
