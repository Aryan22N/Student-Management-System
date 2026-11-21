export const brand = {
  primary: '#0F9D58',
  primaryDark: '#137333',
  secondary: '#202124',
  background: '#F8FAF9',
  white: '#FFFFFF',
  accent: '#FBBC04',
  success: '#34A853',
  warning: '#FBBC04',
  danger: '#EA4335',
  text: '#202124',
  textSecondary: '#5F6368',
  border: '#DADCE0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  layout: {
    maxContentWidth: 1100,
    maxFormWidth: 460,
    maxRegisterWidth: 540,
    maxDetailWidth: 780,
    maxSettingsWidth: 680,
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    hero: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    xs: 16,
    sm: 19,
    md: 22,
    lg: 25,
    xl: 28,
    xxl: 34,
    hero: 40,
  },
};

export * from './colors';
