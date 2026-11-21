import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PodiumCard } from '../../components/leaderboard/PodiumCard';
import { LeaderboardRow } from '../../components/leaderboard/LeaderboardRow';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchLeaderboard, refreshLeaderboard } from '../../store/slices/leaderboardSlice';
import { spacing, typography } from '../../theme';

export const LeaderboardScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { entries, page, hasNext, isLoading, isRefreshing } = useAppSelector(
    (state) => state.leaderboard
  );
  const { studentProfile } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: 0, size: 20 }));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(refreshLeaderboard());
  };

  const onEndReached = () => {
    if (!isLoading && hasNext) {
      dispatch(fetchLeaderboard({ page: page + 1, size: 20, append: true }));
    }
  };

  const topThree = entries.slice(0, 3);
  const currentStudentId = studentProfile?.id;

  return (
          <ScreenContainer
            title="Institutional Leaderboard"
            subtitle="Academic merit rankings & student points competition"
            breadcrumbs={[
              { label: 'ACADEMICS' },
              { label: 'LEADERBOARD' },
            ]}
            activeRoute="Leaderboard"
            maxWidth={900}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.eyebrow}>ACADEMIC MERIT RANKINGS</Text>
                <Text style={[styles.title, { color: theme.text }]}>
                  Institutional Leaderboard
                </Text>
                <Text style={styles.subtitle}>
                  Dynamic standard competition rankings based on verified student merit points
                </Text>
              </View>

              {isLoading && entries.length === 0 ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#0F9D58" />
                </View>
          ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => `${item.studentId}-${item.rank}`}
            renderItem={({ item }) => (
              <LeaderboardRow
                entry={item}
                isCurrentUser={item.studentId === currentStudentId}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              topThree.length > 0 ? (
                <PodiumCard topThree={topThree} currentStudentId={currentStudentId} />
              ) : null
            }
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
                icon="trophy-outline"
                title="Leaderboard is Empty"
                subtitle="Students and scores will populate here as faculty allocate merit points."
              />
            }
            ListFooterComponent={
              isLoading && entries.length > 0 ? (
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
        padding: spacing.md,
        width: '100%',
      },
        header: {
          marginBottom: spacing.md,
        },
          eyebrow: {
            fontSize: 10,
            fontWeight: typography.weights.extrabold,
            color: '#0F9D58',
            letterSpacing: 1.2,
            marginBottom: 2,
          },
            title: {
              fontSize: typography.sizes.xl,
              fontWeight: typography.weights.extrabold,
              letterSpacing: -0.2,
            },
              subtitle: {
                fontSize: typography.sizes.xs,
                color: '#5F6368',
                marginTop: 2,
                lineHeight: 18,
              },
                listContent: {
                  paddingBottom: spacing.xxl,
                },
                  centerContainer: {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: spacing.xxl,
                  },
                    footerLoader: {
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  });
