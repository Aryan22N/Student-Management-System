import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LeaderboardEntry } from '../../types/leaderboard';
import { spacing, typography } from '../../theme';

interface PodiumCardProps {
  topThree: LeaderboardEntry[];
  currentStudentId?: number;
}

export const PodiumCard: React.FC<PodiumCardProps> = ({ topThree, currentStudentId }) => {
  const { theme, isDark } = useTheme();

  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree.length > 1 ? topThree[1] : null;
  const third = topThree.length > 2 ? topThree[2] : null;

  const renderPodiumItem = (
    entry: LeaderboardEntry | null,
    place: 1 | 2 | 3,
    color: string,
    pedestalBg: string
  ) => {
    if (!entry) {
      return <View style={styles.emptySlot} />;
    }

    const isCurrent = entry.studentId === currentStudentId;
    const height = place === 1 ? 130 : place === 2 ? 105 : 85;

    return (
      <View style={[styles.column, place === 1 && styles.firstPlaceColumn]}>
        {/* Medallion Badge */}
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: isDark ? '#162538' : '#FFFFFF',
              borderColor: color,
            },
          ]}
        >
          <Ionicons
            name={place === 1 ? 'trophy' : 'medal'}
            size={place === 1 ? 24 : 18}
            color={color}
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: theme.text },
            isCurrent && { color: '#0F9D58', fontWeight: typography.weights.extrabold },
          ]}
        >
          {entry.studentName}
        </Text>

        <Text style={[styles.pointsText, { color }]}>
          {entry.totalPoints} <Text style={styles.ptsUnit}>pts</Text>
        </Text>

        {/* Architectural Podium Stand */}
        <View
          style={[
            styles.stand,
            {
              height,
              backgroundColor: pedestalBg,
              borderColor: color,
              borderTopWidth: 3,
            },
          ]}
        >
          <Text style={[styles.placeText, { color: '#FFFFFF' }]}>#{entry.rank}</Text>
          <Text style={styles.placeSubText}>
            {place === 1 ? 'GOLD' : place === 2 ? 'SILVER' : 'BRONZE'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {renderPodiumItem(second, 2, '#0F9D58', '#137333')}
        {renderPodiumItem(first, 1, '#F9AB00', '#0F9D58')}
        {renderPodiumItem(third, 3, '#34A853', '#1B5E20')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    width: '100%',
    maxWidth: 480,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  firstPlaceColumn: {
    marginBottom: spacing.xs,
  },
  emptySlot: {
    flex: 1,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    maxWidth: 90,
    marginBottom: 2,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
    marginBottom: spacing.xs,
  },
  ptsUnit: {
    fontSize: 9,
    fontWeight: typography.weights.medium,
  },
  stand: {
    width: '92%',
    borderTopLeftRadius: spacing.borderRadius.sm,
    borderTopRightRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  placeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  placeSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
});
