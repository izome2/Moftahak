import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مفتاحك - Moftahak | العقارات الفاخرة والشقق الفندقية',
    short_name: 'مفتاحك',
    description: 'دليلك الشامل للعقارات الفاخرة والشقق الفندقية والإيجار اليومي في مصر',
    start_url: '/',
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#D4AF37',
    orientation: 'portrait-primary',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['business', 'real estate', 'education'],
    screenshots: [
      {
        src: '/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        label: 'مفتاحك - الصفحة الرئيسية',
      },
    ],
  };
}
