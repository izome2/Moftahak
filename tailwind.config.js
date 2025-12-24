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
      // Force sharp corners globally - NO BORDER RADIUS
      borderRadius: {
        'none': '0',
        DEFAULT: '0',
      },
      // Additional aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '16/9': '16 / 9',
        '21/9': '21 / 9',
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
