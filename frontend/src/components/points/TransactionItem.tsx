import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { PointTransaction } from '../../types/points';
import { formatDate, formatPoints, formatTransactionType } from '../../utils/formatters';
import { spacing, typography } from '../../theme';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';

interface TransactionItemProps {
  transaction: PointTransaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { theme, isDark } = useTheme();
  const isPositive = transaction.points > 0;

  let badgeVariant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent' = 'primary';
  if (transaction.transactionType === 'ACADEMIC') badgeVariant = 'success';
  else if (transaction.transactionType === 'PENALTY') badgeVariant = 'danger';
  else if (transaction.transactionType === 'BEHAVIOR') badgeVariant = 'primary';
  else if (transaction.transactionType === 'PARTICIPATION') badgeVariant = 'accent';
  else badgeVariant = 'neutral';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderLeftWidth: 3.5,
          borderLeftColor: isPositive ? '#34A853' : '#EA4335',
        },
        Platform.select({
          web: {
            boxShadow: isDark
              ? '0 1px 4px rgba(11, 19, 30, 0.4)'
            : '0 1px 3px rgba(32, 33, 36, 0.04), 0 1px 2px rgba(32, 33, 36, 0.02)',
        } as any,
        }),
      ]}
    >
  <View style={styles.topRow}>
    <View style={styles.categoryRow}>
      <Icon
        name={isPositive ? 'TrendingUp' : 'TrendingDown'}
        size={14}
        color={isPositive ? '#34A853' : '#EA4335'}
        style={{ marginRight: 6 }}
      />
      <Badge
        label={formatTransactionType(transaction.transactionType)}
        variant={badgeVariant}
        size="sm"
      />
    </View>

    <View
      style={[
        styles.pointsTag,
        {
          backgroundColor: isPositive
            ? isDark
                ? 'rgba(52, 168, 83, 0.15)'
                : '#E6F4EA'
            : isDark
                  ? 'rgba(234, 67, 53, 0.15)'
          : '#FCE8E6',
        borderColor: isPositive ? '#34A853' : '#EA4335',
            },
          ]}
        >
    <Text
      style={[
        styles.pointsText,
        {
          color: isPositive
            ? isDark
                ? '#81C995'
                : '#34A853'
            : isDark
                    ? '#F28B82'
          : '#EA4335',
              },
            ]}
          >
    {formatPoints(transaction.points)} pts
  </Text>
        </View >
      </View >

    <Text style={[styles.reason, { color: theme.text }]}>
      {transaction.reason}
    </Text>

      <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
        <View style={styles.facultyRow}>
          <Icon name="CircleUserRound" size={13} color="#5F6368" style={{ marginRight: 4 }} />
          <Text style={[styles.metaText, { color: '#5F6368' }]}>
            Faculty:{' '}
              <Text style={{ color: isDark ? '#4285F4' : '#0F9D58', fontWeight: '700' }}>
                {transaction.teacherName}
              </Text>
            </Text>
        </View>

        <View style={styles.dateRow}>
          <Icon name="Clock" size={12} color="#5F6368" style={{ marginRight: 4 }} />
          <Text style={[styles.dateText, { color: '#5F6368' }]}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
      </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.3,
  },
  reason: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginVertical: 4,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.8,
    flexWrap: 'wrap',
    gap: 8,
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  dateText: {
    fontSize: 11,
  },
});
