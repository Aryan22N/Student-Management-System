import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { Icon, IconName } from '../common/Icon';
import { Badge } from '../common/Badge';
import { spacing, typography } from '../../theme';

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  screen: string;
  params?: any;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; route?: string }[];
  activeRoute?: string;
  maxWidth?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  activeRoute,
  maxWidth,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAppSelector((state) => state.auth);

  const isTeacher = user?.role === 'TEACHER';
  const currentRouteName = activeRoute || route.name;

  const teacherNavSections: NavSection[] = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { id: 'TeacherDashboard', label: 'Faculty Dashboard', icon: 'LayoutDashboard', screen: 'TeacherDashboard' },
        { id: 'StudentDirectory', label: 'Student Directory', icon: 'Users', screen: 'StudentDirectory' },
        { id: 'AwardPoints', label: 'Award Points', icon: 'Award', screen: 'AwardPoints' },
      ],
    },
    {
      title: 'ACADEMICS & METRICS',
      items: [
        { id: 'Leaderboard', label: 'Rank Standings', icon: 'Trophy', screen: 'Leaderboard' },
        { id: 'Settings', label: 'Preferences', icon: 'Settings', screen: 'Settings' },
      ],
    },
  ];

  const studentNavSections: NavSection[] = [
    {
      title: 'STUDENT WORKSPACE',
      items: [
        { id: 'StudentDashboard', label: 'Student Dashboard', icon: 'LayoutDashboard', screen: 'StudentDashboard' },
        { id: 'Leaderboard', label: 'Rank Standings', icon: 'Trophy', screen: 'Leaderboard' },
      ],
    },
    {
      title: 'ACADEMIC LEDGER',
      items: [
        { id: 'PointHistory', label: 'Merit Ledger', icon: 'ReceiptText', screen: 'PointHistory' },
        { id: 'StudentProfile', label: 'Student Dossier', icon: 'CircleUserRound', screen: 'StudentProfile' },
        { id: 'Settings', label: 'Preferences', icon: 'Settings', screen: 'Settings' },
      ],
    },
  ];

  const navSections = isTeacher ? teacherNavSections : studentNavSections;

  const handleNavigate = (item: NavItem) => {
    try {
      if (isTeacher) {
        navigation.navigate('TeacherTabs', { screen: item.screen, params: item.params });
      } else {
        navigation.navigate(item.screen, item.params);
      }
    } catch {
      navigation.navigate(item.screen, item.params);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const initials = `${user?.firstName?.charAt(0) || 'U'}${user?.lastName?.charAt(0) || ''}`;

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      {/* Desktop Fixed Sidebar */}
      {isDesktop && (
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: isDark ? '#161B22' : '#FFFFFF',
              borderRightColor: theme.border,
            },
            Platform.select({
              web: {
                boxShadow: isDark
                  ? '1px 0 0 rgba(255, 255, 255, 0.05)'
                  : '1px 0 0 rgba(32, 33, 36, 0.06)',
              } as any,
            }),
          ]}
        >
          {/* Institutional Brand Crest Header */}
          <View style={[styles.brandBox, { borderBottomColor: theme.border }]}>
            <View style={styles.brandRow}>
              <View style={[styles.crestIconBox, { backgroundColor: '#0F9D58' }]}>
                <Icon name="GraduationCap" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.brandTitleCol}>
                <Text style={[styles.brandTitle, { color: theme.text }]}>
                  ACADEMIA
                </Text>
                <Text style={styles.brandSubtitle}>STUDENT PORTAL</Text>
              </View>
            </View>
            <View style={styles.roleBadgeContainer}>
              <View
                style={[
                  styles.rolePill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(15, 157, 88, 0.15)'
                      : '#E6F4EA',
                    borderColor: '#0F9D58',
                  },
                ]}
              >
                <View style={[styles.roleDot, { backgroundColor: '#0F9D58' }]} />
                <Text style={styles.rolePillText}>
                  {isTeacher ? 'FACULTY PORTAL' : 'STUDENT PORTAL'}
                </Text>
              </View>
            </View>
          </View>

          {/* Navigation Items */}
          <ScrollView style={styles.navScrollView} showsVerticalScrollIndicator={false}>
            {navSections.map((section, idx) => (
              <View key={idx} style={styles.navSectionGroup}>
                <Text style={styles.navSectionHeader}>
                  {section.title}
                </Text>
                {section.items.map((item) => {
                  const isActive =
                    currentRouteName === item.id ||
                    (item.id === 'TeacherDashboard' && currentRouteName === 'ClassDetails');

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleNavigate(item)}
                      style={[
                        styles.navItemBtn,
                        isActive && {
                          backgroundColor: isDark
                            ? 'rgba(15, 157, 88, 0.15)'
                            : '#E6F4EA',
                          borderLeftColor: '#0F9D58',
                          borderLeftWidth: 3,
                        },
                        Platform.select({ web: { cursor: 'pointer' } as any }),
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={18}
                        color={isActive ? (isDark ? '#4285F4' : '#0F9D58') : '#5F6368'}
                      />
                      <Text
                        style={[
                          styles.navItemText,
                          {
                            color: isActive
                              ? isDark
                                ? '#E6EDF3'
                                : '#0F9D58'
                              : isDark
                                ? '#8B949E'
                                : '#5F6368',
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {
                        isActive && (
                          <View
                            style={[
                              styles.activeDot,
                              { backgroundColor: isDark ? '#4285F4' : '#0F9D58' },
                            ]}
                          />
                        )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* User Profile & Actions Footer */}
          <View
            style={[
              styles.sidebarFooter,
              {
                borderTopColor: theme.border,
                backgroundColor: isDark ? '#161B22' : '#F1F3F4',
              },
            ]}
          >
            <View style={styles.profileRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#0F9D58' }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <View style={styles.profileTextCol}>
                <Text
                  style={[styles.profileName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileRole} numberOfLines={1}>
                  {isTeacher ? 'Academic Faculty' : 'Active Student'}
                </Text>
              </View>
            </View>

            {/* Logout Action */}
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={[
                styles.sidebarLogoutBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: isDark ? '#162538' : '#FFFFFF',
                },
                Platform.select({ web: { cursor: 'pointer' } as any }),
              ]}
            >
              <Icon name="LogOut" size={14} color="#EA4335" />
              <Text style={styles.sidebarLogoutText}>Sign Out of Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
      }

      {/* Main Content Area */}
      < View style={styles.mainContentArea} >
        {/* Top Header Bar */}
        < View
          style={
            [
              styles.headerBar,
              {
                backgroundColor: isDark ? '#161B22' : '#FFFFFF',
                borderBottomColor: theme.border,
              },
              Platform.select({
                web: {
                  boxShadow: isDark
                    ? '0 1px 0 rgba(255, 255, 255, 0.05)'
                    : '0 1px 2px rgba(32, 33, 36, 0.04)',
                } as any,
              }),
            ]}
        >
          <View style={styles.headerLeftCol}>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <View style={styles.breadcrumbsRow}>
                {breadcrumbs.map((b, i) => (
                  <View key={i} style={styles.breadcrumbItem}>
                    <Text style={styles.breadcrumbText}>{b.label}</Text>
                    {i < breadcrumbs.length - 1 && (
                      <Icon
                        name="ChevronRight"
                        size={11}
                        color="#5F6368"
                        style={{ marginHorizontal: 4 }}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
            {title && (
              <Text
                style={[
                  styles.headerTitle,
                  { color: theme.text },
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
          </View>

          {/* Header Right Cluster */}
          <View style={styles.headerRightCluster}>
            {/* System Status Pill */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDark
                    ? 'rgba(52, 168, 83, 0.12)'
                    : '#E6F4EA',
                  borderColor: isDark ? '#34A853' : '#A8D5B5',
                },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: '#34A853' }]} />
              <Text style={styles.statusText}>
                Campus ERP Online
              </Text>
            </View>

            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              style={[
                styles.headerActionBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: isDark ? '#162538' : '#FFFFFF',
                },
                Platform.select({ web: { cursor: 'pointer' } as any }),
              ]}
            >
              <Icon
                name={isDark ? 'Sun' : 'Moon'}
                size={16}
                color={isDark ? '#FBBC04' : '#0F9D58'}
              />
            </TouchableOpacity>

            {/* Profile Avatar Pill */}
            <View style={[styles.headerAvatar, { backgroundColor: '#0F9D58' }]}>
              <Text style={styles.headerAvatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        {/* Inner Page Body */}
        <View
          style={[
            styles.pageBody,
            maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : null,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    minHeight: '100%' as any,
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
      },
    }),
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandBox: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  crestIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#0F9D58',
    letterSpacing: 0.8,
  },
  roleBadgeContainer: {
    marginTop: 10,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: '#0F9D58',
    letterSpacing: 0.6,
  },
  navScrollView: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 14,
  },
  navSectionGroup: {
    marginBottom: 16,
  },
  navSectionHeader: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: '#80868B',
    letterSpacing: 1,
    paddingHorizontal: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  navItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
    gap: 10,
  },
  navItemText: {
    fontSize: typography.sizes.xs,
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sidebarFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  profileRole: {
    fontSize: 10,
    color: '#5F6368',
    fontWeight: typography.weights.medium,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  sidebarLogoutText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#EA4335',
  },
  mainContentArea: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  headerBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  headerLeftCol: {
    flex: 1,
    minWidth: 200,
  },
  breadcrumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#0F9D58',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.extrabold,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#5F6368',
    marginTop: 1,
  },
    headerRightCluster: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      gap: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 10,
      fontWeight: typography.weights.extrabold,
      color: '#34A853',
      letterSpacing: 0.4,
    },
    headerActionBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: typography.weights.bold,
    },
    pageBody: {
      flex: 1,
      width: '100%',
    },
  });
