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
      },
    },
  },
  plugins: [],
}
