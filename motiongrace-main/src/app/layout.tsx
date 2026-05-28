import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/tailwind.css';
import HomeRouteTransition from '@/app/components/HomeRouteTransition';
import SmoothScroll from '@/app/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#04040A',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'MotionGrace | High-End Animation Studio for Ads, UI & Product Videos',
  description:
    'Motion Grace creates cinematic CGI product visuals and digital twins for cosmetic and beauty brands — replacing traditional photoshoots with infinite assets.',
  icons: {
    icon: [
      { url: '/motion_grace_logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/motion_grace_logo.png', type: 'image/png' }],
    shortcut: '/motion_grace_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className={inter.className}>
        <SmoothScroll />
        {children}
        <HomeRouteTransition />
      </body>
    </html>
  );
}
