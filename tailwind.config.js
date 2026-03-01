/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#fdf6ee',
        primary: {
          DEFAULT: '#edbf8c',
          light: '#f5d5a8',
          dark: '#d9a56c',
        },
        secondary: {
          DEFAULT: '#10302b',
          light: '#1a4a42',
          dark: '#0a1f1c',
        },
        accent: {
          DEFAULT: '#ead3b9',
          light: '#f5e6d5',
          dark: '#d9c19d',
        },
      },
      fontFamily: {
        dubai: ['var(--font-dubai)', 'sans-serif'],
        bristone: ['var(--font-bristone)', 'sans-serif'],
      },
      backgroundImage: {
        'pattern-vertical-white': "url('/patterns/pattern-vertical-white.png')",
        'pattern-vertical-dark': "url('/patterns/pattern-vertical-dark.png')",
        'pattern-horizontal-white': "url('/patterns/pattern-horizontal-white.png')",
        'pattern-horizontal-dark': "url('/patterns/pattern-horizontal-dark.png')",
        // Gradient utilities
        'linear-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
        'linear-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'linear-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
        'linear-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'linear-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
        'linear-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
        'linear-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
        'linear-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      // Modern border radius system
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',    // 4px
        DEFAULT: '0.5rem',  // 8px
        'md': '0.625rem',   // 10px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.25rem',   // 20px
        '3xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      // Modern shadow system
      boxShadow: {
        'soft': '0 2px 8px rgba(16, 48, 43, 0.08)',
        'medium': '0 4px 16px rgba(16, 48, 43, 0.12)',
        'large': '0 8px 32px rgba(16, 48, 43, 0.16)',
        'xl': '0 12px 48px rgba(16, 48, 43, 0.2)',
        'glow': '0 0 20px rgba(237, 191, 140, 0.3)',
        'glow-lg': '0 0 40px rgba(237, 191, 140, 0.4)',
        'inner-soft': 'inset 0 2px 4px rgba(16, 48, 43, 0.06)',
      },
      // Additional aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '16/9': '16 / 9',
        '21/9': '21 / 9',
      },
      // Backdrop blur configuration
      backdropBlur: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Animation improvements
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      // Screen sizes for better responsiveness
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
