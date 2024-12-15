// theme/colors.js
export const colors = {
    primary: {
        50: '#EBF5FF',
        100: '#CCE5FF',
        200: '#99C9FF',
        300: '#66ADFF',
        400: '#3392FF',
        500: '#0066FF',
        600: '#0052CC',
        700: '#003D99',
        800: '#002966',
        900: '#001433'
    },
    secondary: {
        50: '#F5F3FF',
        100: '#E9E5FF',
        200: '#D4CCFF',
        300: '#B3A3FF',
        400: '#927AFF',
        500: '#7152FF',
        600: '#5A41CC',
        700: '#433199',
        800: '#2C2066',
        900: '#151033'
    },
    success: {
        light: '#4CAF50',
        main: '#2E7D32',
        dark: '#1B5E20'
    },
    error: {
        light: '#EF5350',
        main: '#D32F2F',
        dark: '#C62828'
    },
    warning: {
        light: '#FFB74D',
        main: '#F57C00',
        dark: '#E65100'
    },
    info: {
        light: '#4FC3F7',
        main: '#0288D1',
        dark: '#01579B'
    },
    gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A'
    }
};

// theme/typography.js
export const typography = {
    fontFamily: {
        sans: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
        mono: [
            'JetBrains Mono',
            'Menlo',
            'Monaco',
            'Consolas',
            '"Liberation Mono"',
            '"Courier New"',
            'monospace'
        ].join(',')
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem'     // 48px
    },
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2'
    }
};

// theme/index.js
import { colors } from './colors';
import { typography } from './typography';

export const theme = {
    colors,
    typography,
    spacing: {
        0: '0',
        1: '0.25rem',  // 4px
        2: '0.5rem',   // 8px
        3: '0.75rem',  // 12px
        4: '1rem',     // 16px
        5: '1.25rem',  // 20px
        6: '1.5rem',   // 24px
        8: '2rem',     // 32px
        10: '2.5rem',  // 40px
        12: '3rem',    // 48px
        16: '4rem',    // 64px
        20: '5rem',    // 80px
        24: '6rem'     // 96px
    },
    borderRadius: {
        none: '0',
        sm: '0.125rem',   // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        full: '9999px'
    }
};