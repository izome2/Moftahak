import type { Metadata, Viewport } from "next";
import { airbnbArabicDisplay, bristone, dubai } from "./fonts";
import "./globals.css";
import CustomScrollbar from "@/components/CustomScrollbar";
import Providers from "@/components/Providers";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "مفتاحك - Moftahak | العقارات الفاخرة والشقق الفندقية في مصر",
    template: "%s | مفتاحك - Moftahak",
  },
  description: "مفتاحك - دليلك الشامل للعقارات الفاخرة والشقق الفندقية والإيجار اليومي في مصر. نقدم أفضل العقارات مع دورات تدريبية متخصصة في الإدارة العقارية والإيجار القصير. ✨ استثمر في مستقبلك العقاري معنا",
  keywords: [
    "عقارات مصر",
    "شقق فندقية القاهرة",
    "إيجار يومي مصر",
    "عقارات فاخرة",
    "استثمار عقاري",
    "دورات عقارية",
    "إدارة عقارية",
    "الإيجار القصير",
    "شقق مفروشة",
    "عقارات للبيع",
    "عقارات للإيجار",
    "مفتاحك",
    "Moftahak",
    "real estate Egypt",
    "property management",
  ],
  authors: [
    { name: "مفتاحك - Moftahak", url: "https://moftahak.com" }
  ],
  creator: "مفتاحك - Moftahak",
  publisher: "مفتاحك - Moftahak",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://moftahak.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ar-EG': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    url: 'https://moftahak.com',
    siteName: 'مفتاحك - Moftahak',
    title: 'مفتاحك | العقارات الفاخرة والشقق الفندقية في مصر',
    description: 'دليلك الشامل للعقارات الفاخرة والشقق الفندقية والإيجار اليومي مع دورات تدريبية احترافية. استثمر في مستقبلك العقاري معنا 🏢✨',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'مفتاحك - العقارات الفاخرة والشقق الفندقية',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-square.jpg',
        width: 800,
        height: 800,
        alt: 'مفتاحك - أفضل العقارات في مصر',
        type: 'image/jpeg',
      },
    ],
    countryName: 'Egypt',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@moftahak',
    creator: '@moftahak',
    title: 'مفتاحك | العقارات الفاخرة والشقق الفندقية',
    description: 'دليلك الشامل للعقارات الفاخرة والشقق الفندقية والإيجار اليومي في مصر 🏢✨',
    images: {
      url: '/og-image.jpg',
      alt: 'مفتاحك - العقارات الفاخرة',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logos/logo-white-icon.png', sizes: 'any' },
      { url: '/logos/logo-white-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos/logo-white-icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logos/logo-white-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logos/logo-white-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
  category: 'Real Estate',
  classification: 'Real Estate & Property Management',
  referrer: 'origin-when-cross-origin',
  appleWebApp: {
    capable: true,
    title: 'مفتاحك',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Preload critical images for instant loading */}
        <link rel="preload" as="image" href="/images/hero/hero-bg.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/hero/slide-1.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/hero/slide-2.jpg" />
        <link rel="preload" as="image" href="/images/hero/slide-3.jpg" />
        <link rel="preload" as="image" href="/logos/logo-white.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/logos/logo-white-icon.png" fetchPriority="high" />
        {/* DNS prefetch for external images */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://i.pravatar.cc" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.pravatar.cc" crossOrigin="anonymous" />
      </head>
      <body
        className={`${dubai.variable} ${bristone.variable} ${airbnbArabicDisplay.variable} antialiased font-dubai`}
      >
        <Providers>
          {children}
          <CustomScrollbar />
        </Providers>
      </body>
    </html>
  );
}
