import type { Metadata } from "next";
import { bristone, dubai } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "مفتاحك - Moftahak | العقارات والشقق الفندقية",
  description: "مفتاحك - دليلك الشامل للعقارات والشقق الفندقية والإيجار اليومي مع دورات تدريبية احترافية",
  keywords: "عقارات, شقق فندقية, إيجار يومي, دورات تدريبية, مفتاحك",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${dubai.variable} ${bristone.variable} antialiased font-dubai`}
      >
        {children}
      </body>
    </html>
  );
}
