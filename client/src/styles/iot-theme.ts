// IoT Tech-Savvy Design System

export const iotTheme = {
  colors: {
    // Primary - Tech Blue
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    // Secondary - Cyan/Teal
    secondary: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00BCD4',
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
    },
    // Accent - Electric Purple
    accent: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    // Dark theme
    dark: {
      bg: '#0A0E27',
      bgSecondary: '#10172E',
      bgTertiary: '#1A2238',
      surface: '#1E2846',
      surfaceLight: '#252F4A',
      border: '#2D3A5F',
      text: '#E8EAED',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
    },
    // Status colors
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      dark: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    neon: '0 0 20px rgba(59, 130, 246, 0.5)',
    neonCyan: '0 0 20px rgba(6, 182, 212, 0.5)',
    neonPurple: '0 0 20px rgba(168, 85, 247, 0.5)',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    dark: 'rgba(0, 0, 0, 0.2)',
    blur: 'blur(10px)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

export type IoTTheme = typeof iotTheme;
