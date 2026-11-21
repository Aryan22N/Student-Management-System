import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LeaderboardEntry } from '../../types/leaderboard';
import { spacing, typography } from '../../theme';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isCurrentUser }) => {
  const { theme, isDark } = useTheme();

  let rankBg = isDark ? '#1B2D42' : '#F1F5F9';
  let rankColor = isDark ? '#80868B' : '#5F6368';
  let rankBorder = isDark ? '#334155' : '#DADCE0';

  if (entry.rank === 1) {
    rankBg = '#F28C28';
    rankColor = '#FFFFFF';
    rankBorder = '#F28C28';
  } else if (entry.rank === 2) {
    rankBg = '#0F9D58';
    rankColor = '#FFFFFF';
    rankBorder = '#0F9D58';
  } else if (entry.rank === 3) {
    rankBg = '#34A853';
    rankColor = '#FFFFFF';
    rankBorder = '#34A853';
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrentUser
            ? isDark
            ? 'rgba(15, 157, 88, 0.15)'
            : '#E6F4EA'
          : theme.card,
        borderColor: isCurrentUser ? '#0F9D58' : theme.border,
        borderLeftWidth: isCurrentUser ? 4 : 1,
        borderLeftColor: isCurrentUser ? '#0F9D58' : theme.border,
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
    {/* Rank Number Badge */ }
    < View
        style = {
      [
      styles.rankCircle,
      { backgroundColor: rankBg, borderColor: rankBorder, borderWidth: 1 },
        ]}
      >
  <Text style={[styles.rankText, { color: rankColor }]}>#{entry.rank}</Text>
      </View >

          {/* Student Information */}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.name,
                  { color: theme.text },
                ]}
                numberOfLines={1}
              >
                {entry.studentName}
              </Text>
              {isCurrentUser && (
                <View style={[styles.youTag, { backgroundColor: '#0F9D58' }]}>
                  <Text style={styles.youText}>YOU</Text>
                </View>
              )}
            </View>
              <Text style={styles.subText}>
                ID: {entry.studentIdNumber} • Grade {entry.gradeLevel}
              </Text>
          </View>

      {/* Total Points Pill */}
      <View
        style={[
          styles.pointsBadge,
          {
            backgroundColor: isDark ? 'rgba(15, 157, 88, 0.15)' : '#E6F4EA',
            borderColor: isDark ? '#0F9D58' : '#A8D5B5',
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.pointsValue, { color: isDark ? '#4285F4' : '#0F9D58' }]}>
          {entry.totalPoints}
        </Text>
        <Text style={styles.pointsUnit}>pts</Text>
      </View>
    </View>
  );
};

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: spacing.borderRadius.sm,
        borderWidth: 1,
        marginBottom: spacing.xs + 2,
        width: '100%',
      },
        rankCircle: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        },
          rankText: {
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.extrabold,
          },
            infoContainer: {
              flex: 1,
              marginRight: spacing.sm,
            },
              nameRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              },
                name: {
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.bold,
                },
                  youTag: {
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 4,
                  },
                    youText: {
                      color: '#FFFFFF',
                      fontSize: 9,
                      fontWeight: typography.weights.extrabold,
                      letterSpacing: 0.5,
                    },
                      subText: {
                        fontSize: typography.sizes.xs,
                        color: '#5F6368',
                        marginTop: 2,
                      },
                        pointsBadge: {
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: spacing.borderRadius.sm,
                          minWidth: 56,
                        },
                          pointsValue: {
                            fontSize: typography.sizes.sm,
                            fontWeight: typography.weights.extrabold,
                          },
                            pointsUnit: {
                              fontSize: 9,
                              fontWeight: typography.weights.semibold,
                              color: '#5F6368',
                            },
                          });
