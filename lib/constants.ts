// Simplified constants - keep essential branding only
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

export const logos = {
  main: '/logos/logo-white.png',
  white: '/logos/logo-white.png',
  dark: '/logos/logo-dark.png',
} as const;

export const fonts = {
  arabic: 'var(--font-dubai)',
  english: 'var(--font-bristone)',
} as const;
