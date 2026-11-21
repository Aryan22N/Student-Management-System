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
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { studentApi } from '../../api/studentApi';
import { PointTransaction } from '../../types/points';
import { spacing, typography } from '../../theme';

export const PointHistoryScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { studentProfile } = useAppSelector((state) => state.auth);

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const studentId = studentProfile?.id;

  const fetchTransactions = useCallback(
    async (pageToLoad: number, refresh: boolean = false) => {
      if (!studentId) return;

      if (refresh) {
        setIsRefreshing(true);
      } else if (pageToLoad > 0) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await studentApi.getStudentTransactions(studentId, pageToLoad, 15);
        if (refresh || pageToLoad === 0) {
          setTransactions(res.content);
        } else {
          setTransactions((prev) => [...prev, ...res.content]);
        }
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.warn('Failed to load transaction history', e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  const onRefresh = () => {
    fetchTransactions(0, true);
  };

  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && page + 1 < totalPages) {
      fetchTransactions(page + 1);
    }
  };

  const filteredTransactions = categoryFilter === 'ALL'
    ? transactions
    : transactions.filter((t) => t.transactionType === categoryFilter);

  return (
    <ScreenContainer
      title="Merit & Demerit Ledger"
      subtitle="Complete chronological history of points awards and adjustments"
      breadcrumbs={[
        { label: 'STUDENT' },
        { label: 'MERIT LEDGER' },
      ]}
      activeRoute="PointHistory"
      maxWidth={1000}
    >
      <View style={styles.container}>
        {/* Category Filter Pills */}
        <View style={styles.header}>
          <View style={styles.filterChipRow}>
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'ACADEMIC', label: 'Academic' },
              { id: 'PARTICIPATION', label: 'Participation' },
              { id: 'BEHAVIOR', label: 'Behavior' },
              { id: 'PENALTY', label: 'Penalty' },
            ].map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setCategoryFilter(cat.id)}
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
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

  {
    isLoading && !isRefreshing ? (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F9D58" />
        <Text style={styles.loadingText}>Loading point history from database...</Text>
      </View>
    ) : (
    <FlatList
      data={filteredTransactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
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
          icon="receipt-outline"
          title="No transaction records"
          subtitle="Your academic and extracurricular points history will show here."
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
  )
  }
      </View >
    </ScreenContainer >
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
          paddingBottom: spacing.xs,
        },
          filterChipRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
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
