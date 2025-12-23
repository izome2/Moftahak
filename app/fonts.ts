import localFont from 'next/font/local';

// Bristone English Font
export const bristone = localFont({
  src: [
    {
      path: '../public/fonts/bristone/Bristone-Thin.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/bristone/Bristone-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/bristone/Bristone-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-bristone',
  display: 'swap',
});

// Dubai Arabic Font
export const dubai = localFont({
  src: [
    {
      path: '../public/fonts/dubai/Dubai-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/dubai/Dubai-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/dubai/Dubai-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-dubai',
  display: 'swap',
});
