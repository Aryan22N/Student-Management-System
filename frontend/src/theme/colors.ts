export interface ColorTheme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  primary: string;
  primaryDark: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  podiumGold: string;
  podiumSilver: string;
  podiumBronze: string;
  inputBackground: string;
  placeholder: string;
  statusBar: 'light' | 'dark';
}

/**
 * Google Classroom-Inspired Color Palette:
 * Primary Green:        #0F9D58
 * Dark Green:           #137333
 * Light Green:          #E6F4EA
 * Green Hover:          #0B8043
 * Light Green Surface:  #F1F8F3
 * Google Blue:          #4285F4
 * Google Yellow:        #FBBC04
 * Google Red:           #EA4335
 * Supporting Green:     #34A853
 * Main Background:      #F8FAF9
 * Card Background:      #FFFFFF
 * Secondary Background: #F1F3F4
 * Primary Text:         #202124
 * Secondary Text:       #5F6368
 * Muted Text:           #80868B
 * Border:               #DADCE0
 * Divider:              #E8EAED
 */
export const lightColors: ColorTheme = {
  background: '#F8FAF9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#202124',
  textSecondary: '#5F6368',
  textMuted: '#80868B',
  border: '#DADCE0',
  borderFocus: '#0F9D58',
  primary: '#0F9D58',
  primaryDark: '#137333',
  primaryHover: '#0B8043',
  primaryLight: '#E6F4EA',
  secondary: '#202124',
  accent: '#FBBC04',
  success: '#34A853',
  successLight: '#E6F4EA',
  warning: '#FBBC04',
  warningLight: '#FEF7E0',
  danger: '#EA4335',
  dangerLight: '#FCE8E6',
  podiumGold: '#F9AB00',
  podiumSilver: '#0F9D58',
  podiumBronze: '#34A853',
  inputBackground: '#FFFFFF',
  placeholder: '#80868B',
  statusBar: 'dark',
};

export const darkColors: ColorTheme = {
  background: '#0D1117',
  surface: '#161B22',
  card: '#1C2128',
  text: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  border: '#30363D',
  borderFocus: '#0F9D58',
  primary: '#0F9D58',
  primaryDark: '#137333',
  primaryHover: '#0B8043',
  primaryLight: 'rgba(15, 157, 88, 0.2)',
  secondary: '#4285F4',
  accent: '#FBBC04',
  success: '#34A853',
  successLight: 'rgba(52, 168, 83, 0.2)',
  warning: '#FBBC04',
  warningLight: 'rgba(251, 188, 4, 0.2)',
  danger: '#EA4335',
  dangerLight: 'rgba(234, 67, 53, 0.2)',
  podiumGold: '#F9AB00',
  podiumSilver: '#4285F4',
  podiumBronze: '#34A853',
  inputBackground: '#0D1117',
  placeholder: '#6E7681',
  statusBar: 'light',
};
