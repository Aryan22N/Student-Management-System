import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

export type IconName =
  | 'GraduationCap'
  | 'LogOut'
  | 'CircleUserRound'
  | 'User'
  | 'Clock'
  | 'AlertCircle'
  | 'Mail'
  | 'Lock'
  | 'Eye'
  | 'EyeOff'
  | 'School'
  | 'Plus'
  | 'Award'
  | 'Trophy'
  | 'CheckCircle'
  | 'ReceiptText'
  | 'ChevronRight'
  | 'Key'
  | 'BookOpen'
  | 'CalendarDays'
  | 'Trash2'
  | 'ArrowLeft'
  | 'Users'
  | 'RefreshCw'
  | 'Search'
  | 'Check'
  | 'Copy'
  | 'Sun'
  | 'Moon'
  | 'LayoutDashboard'
  | 'Settings'
  | 'SlidersHorizontal'
  | 'Shield'
  | 'Flame'
  | 'TrendingUp'
  | 'ExternalLink'
  | 'Sparkles'
  | string;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  color = '#5F6368',
  style,
}) => {
  switch (name) {
    case 'GraduationCap':
      return <Ionicons name="school" size={size} color={color} style={style} />;
    case 'School':
      return <Ionicons name="school-outline" size={size} color={color} style={style} />;
    case 'LayoutDashboard':
      return <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} style={style} />;
    case 'LogOut':
      return <Feather name="log-out" size={size} color={color} style={style} />;
    case 'CircleUserRound':
    case 'User':
      return <Feather name="user" size={size} color={color} style={style} />;
    case 'Users':
      return <Feather name="users" size={size} color={color} style={style} />;
    case 'Clock':
      return <Feather name="clock" size={size} color={color} style={style} />;
    case 'AlertCircle':
      return <Feather name="alert-circle" size={size} color={color} style={style} />;
    case 'CheckCircle':
      return <Feather name="check-circle" size={size} color={color} style={style} />;
    case 'Mail':
      return <Feather name="mail" size={size} color={color} style={style} />;
    case 'Lock':
      return <Feather name="lock" size={size} color={color} style={style} />;
    case 'Eye':
      return <Feather name="eye" size={size} color={color} style={style} />;
    case 'EyeOff':
      return <Feather name="eye-off" size={size} color={color} style={style} />;
    case 'Plus':
      return <Feather name="plus" size={size} color={color} style={style} />;
    case 'Award':
      return <Feather name="award" size={size} color={color} style={style} />;
    case 'Trophy':
      return <Ionicons name="trophy-outline" size={size} color={color} style={style} />;
    case 'ReceiptText':
      return <Ionicons name="receipt-outline" size={size} color={color} style={style} />;
    case 'ChevronRight':
      return <Feather name="chevron-right" size={size} color={color} style={style} />;
    case 'ArrowLeft':
      return <Feather name="arrow-left" size={size} color={color} style={style} />;
    case 'Key':
      return <Ionicons name="key-outline" size={size} color={color} style={style} />;
    case 'BookOpen':
      return <Feather name="book-open" size={size} color={color} style={style} />;
    case 'CalendarDays':
      return <Feather name="calendar" size={size} color={color} style={style} />;
    case 'Trash2':
      return <Feather name="trash-2" size={size} color={color} style={style} />;
    case 'RefreshCw':
      return <Feather name="refresh-cw" size={size} color={color} style={style} />;
    case 'Search':
      return <Feather name="search" size={size} color={color} style={style} />;
    case 'Check':
      return <Feather name="check" size={size} color={color} style={style} />;
    case 'Copy':
      return <Feather name="copy" size={size} color={color} style={style} />;
    case 'Sun':
      return <Feather name="sun" size={size} color={color} style={style} />;
    case 'Moon':
      return <Feather name="moon" size={size} color={color} style={style} />;
    case 'Settings':
      return <Feather name="settings" size={size} color={color} style={style} />;
    case 'SlidersHorizontal':
      return <Feather name="sliders" size={size} color={color} style={style} />;
    case 'Shield':
      return <Feather name="shield" size={size} color={color} style={style} />;
    case 'Flame':
      return <Ionicons name="flame-outline" size={size} color={color} style={style} />;
    case 'TrendingUp':
      return <Feather name="trending-up" size={size} color={color} style={style} />;
    case 'ExternalLink':
      return <Feather name="external-link" size={size} color={color} style={style} />;
    case 'Sparkles':
      return <Ionicons name="sparkles-outline" size={size} color={color} style={style} />;
    case 'MoreVertical':
      return <Feather name="more-vertical" size={size} color={color} style={style} />;
    case 'Folder':
      return <Feather name="folder" size={size} color={color} style={style} />;
    case 'CheckSquare':
      return <Feather name="check-square" size={size} color={color} style={style} />;
    case 'FileText':
      return <Feather name="file-text" size={size} color={color} style={style} />;
    default:
      return <Feather name="circle" size={size} color={color} style={style} />;
  }
};

