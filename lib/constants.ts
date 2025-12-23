// Brand Colors
export const colors = {
  primary: {
    DEFAULT: '#edbf8c',
    rgb: 'rgba(237, 191, 140, 1)',
    hsl: 'hsl(32, 73%, 74%)',
  },
  secondary: {
    DEFAULT: '#10302b',
    rgb: 'rgba(16, 48, 43, 1)',
    hsl: 'hsl(171, 50%, 13%)',
  },
  accent: {
    DEFAULT: '#ead3b9',
    rgb: 'rgba(234, 211, 185, 1)',
    hsl: 'hsl(32, 54%, 82%)',
  },
} as const;

// Logo paths
export const logos = {
  white: '/logos/logo-white.png',
  dark: '/logos/logo-dark.png',
  whiteIcon: '/logos/logo-white-icon.png',
  darkIcon: '/logos/logo-dark-icon.png',
} as const;

// Pattern paths
export const patterns = {
  verticalWhite: '/patterns/pattern-vertical-white.png',
  verticalDark: '/patterns/pattern-vertical-dark.png',
  horizontalWhite: '/patterns/pattern-horizontal-white.png',
  horizontalDark: '/patterns/pattern-horizontal-dark.png',
} as const;

// Font families
export const fonts = {
  arabic: 'var(--font-dubai)',
  english: 'var(--font-bristone)',
} as const;
