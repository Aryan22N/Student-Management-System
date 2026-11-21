import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { AppLayout } from './AppLayout';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  maxWidth?: number;
  centered?: boolean;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; route?: string }[];
  activeRoute?: string;
  noSidebar?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
  maxWidth,
  centered = false,
  title,
  subtitle,
  breadcrumbs,
  activeRoute,
  noSidebar = false,
}) => {
  const { theme, isDark } = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  // If user is authenticated and noSidebar is false, use AppLayout
  if (user && !noSidebar) {
    return (
      <SafeAreaView
        edges={edges}
        style={[
          styles.container,
          { backgroundColor: theme.background },
          style,
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <AppLayout
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          activeRoute={activeRoute}
          maxWidth={maxWidth}
        >
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        </AppLayout>
      </SafeAreaView>
    );
  }

  // Standalone container for Auth / Splash screens
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.background },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View
        style={[
          styles.content,
          maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : null,
          centered && styles.centeredContent,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
      },
    }),
  },
  content: {
    flex: 1,
    width: '100%',
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
