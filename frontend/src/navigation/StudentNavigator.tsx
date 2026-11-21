import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StudentDashboardScreen } from '../features/student/StudentDashboardScreen';
import { LeaderboardScreen } from '../features/leaderboard/LeaderboardScreen';
import { PointHistoryScreen } from '../features/student/PointHistoryScreen';
import { StudentProfileScreen } from '../features/student/StudentProfileScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { StudentTabParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<StudentTabParamList>();

export const StudentNavigator: React.FC = () => {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: isDesktop ? 'none' : 'flex',
          backgroundColor: isDark ? '#111C2B' : '#FFFFFF',
          borderTopColor: isDark ? '#223850' : '#DADCE0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          ...Platform.select({
            web: {
              boxShadow: isDark
                ? '0 -2px 12px rgba(11, 19, 30, 0.4)'
                : '0 -2px 10px rgba(32, 33, 36, 0.04)',
            } as any,
          }),
        },
        tabBarActiveTintColor: isDark ? '#4285F4' : '#0F9D58',
        tabBarInactiveTintColor: '#5F6368',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'StudentDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'PointHistory') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'StudentProfile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Standings' }}
      />
      <Tab.Screen
        name="PointHistory"
        component={PointHistoryScreen}
        options={{ tabBarLabel: 'Merits' }}
      />
      <Tab.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator >
  );
};
