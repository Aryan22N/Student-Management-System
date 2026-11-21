import { Platform } from 'react-native';
import { LinkingOptions, getStateFromPath } from '@react-navigation/native';

const prefixes = [
  Platform.OS === 'web' && typeof window !== 'undefined' && window?.location?.origin
    ? window.location.origin
    : 'http://localhost:8081',
  'http://localhost:8081',
  'http://localhost',
  'sms://',
  '/',
];

const documentTitle = {
  formatter: (_options: any, route: any) => {
    const titles: { [key: string]: string } = {
      Login: 'Sign In — Academia SMS',
      Register: 'Create Account — Academia SMS',
      TeacherDashboard: 'Faculty Dashboard — Academia SMS',
      StudentDirectory: 'Student Directory — Academia SMS',
      AwardPoints: 'Award Points — Academia SMS',
      Leaderboard: 'Rank Standings — Academia SMS',
      Settings: 'Preferences — Academia SMS',
      StudentDetails: 'Student Profile — Academia SMS',
      ClassDetails: 'Classroom Management — Academia SMS',
      StudentDashboard: 'Student Workspace — Academia SMS',
      PointHistory: 'Merit Ledger — Academia SMS',
      StudentProfile: 'Student Profile — Academia SMS',
    };
    return titles[route?.name || ''] || 'Academia — Student Management System';
  },
};

export const authLinking: LinkingOptions<any> = {
  prefixes,
  config: {
    screens: {
      Login: '',
      Register: 'register',
    },
  },
  getStateFromPath: (path, options) => {
    let clean = path.split('?')[0].replace(/\/+$/, '') || '/';
    if (clean === '/login' || clean === '/') clean = '';
    return getStateFromPath(clean, options);
  },
} as any;

export const teacherLinking: LinkingOptions<any> = {
  prefixes,
  config: {
    screens: {
      TeacherTabs: {
        path: '',
        initialRouteName: 'TeacherDashboard' as any,
        screens: {
          TeacherDashboard: 'faculty-dashboard',
          StudentDirectory: 'student-directory',
          AwardPoints: 'award-points',
          Leaderboard: 'rank-standings',
          Settings: 'preferences',
        },
      },
      StudentDetails: 'student-details/:studentId',
      ClassDetails: 'class-details/:classId',
    },
  },
  getStateFromPath: (path, options) => {
    let clean = path.split('?')[0].replace(/\/+$/, '') || '/';
    const query = path.includes('?') ? '?' + path.split('?')[1] : '';
    if (clean === '/' || clean === '' || clean === '/dashboard' || clean === '/login') {
      clean = '/faculty-dashboard';
    } else if (clean === '/students' || clean === '/directory') {
      clean = '/student-directory';
    } else if (clean === '/award' || clean === '/points') {
      clean = '/award-points';
    } else if (clean === '/leaderboard' || clean === '/ranks') {
      clean = '/rank-standings';
    } else if (clean === '/settings') {
      clean = '/preferences';
    }
    return getStateFromPath(clean + query, options);
  },
} as any;

export const studentLinking: LinkingOptions<any> = {
  prefixes,
  config: {
    screens: {
      StudentDashboard: 'dashboard',
      PointHistory: 'merit-ledger',
      StudentProfile: 'student-profile',
      Leaderboard: 'rank-standings',
      Settings: 'preferences',
    },
  },
  getStateFromPath: (path, options) => {
    let clean = path.split('?')[0].replace(/\/+$/, '') || '/';
    const query = path.includes('?') ? '?' + path.split('?')[1] : '';
    if (clean === '/' || clean === '' || clean === '/login') {
      clean = '/dashboard';
    } else if (clean === '/profile' || clean === '/dossier' || clean === '/student-dossier') {
      clean = '/student-profile';
    } else if (clean === '/merits' || clean === '/history') {
      clean = '/merit-ledger';
    } else if (clean === '/leaderboard' || clean === '/ranks') {
      clean = '/rank-standings';
    } else if (clean === '/settings') {
      clean = '/preferences';
    }
    return getStateFromPath(clean + query, options);
  },
} as any;

export const getLinkingForRole = (
  isAuthenticated: boolean,
  role?: string | null
): LinkingOptions<any> => {
  if (!isAuthenticated) return authLinking;
  if (role === 'TEACHER') return teacherLinking;
  return studentLinking;
};
