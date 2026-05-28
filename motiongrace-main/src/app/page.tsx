import React from 'react';
import type { Metadata } from 'next';
import Preloader from '@/app/components/Preloader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import HeroBridge from '@/app/components/HeroBridge';
import ServicesSection from '@/app/components/ServicesSection';
import ProcessSection from '@/app/components/ProcessSection';
import TransformationSection from '@/app/components/TransformationSection';
import ShowcaseSection from '@/app/components/ShowcaseSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import FAQSection from '@/app/components/FAQSection';
import HowItWorksSection from '@/app/components/HowItWorksSection';
import VideoShowcase from '@/app/components/VideoShowcase';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';
import LazySection from '@/app/components/LazySection';

export const metadata: Metadata = {
  title: 'MotionGrace | High-End Animation Studio for Ads, UI & Product Videos',
  icons: {
    icon: [
      { url: '/motion_grace_logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/motion_grace_logo.png', type: 'image/png' }],
    shortcut: '/motion_grace_logo.png',
  },
};

export default function HomePage() {
  return (
    <main data-page-shell="home" className="relative bg-background [overflow-x:clip]">
      <Preloader />
      <ScrollAnimationInit />
      <Header />

      {/* 1. Hero + Bridge — always eager: first paint */}
      <HeroSection />
      <HeroBridge />

      {/* 2. Services — first section below fold, eager */}
      <ServicesSection />

      {/* 3. Showcase — lazy on mobile (heavy media) */}
      <LazySection minHeight="600px">
        <ShowcaseSection />
      </LazySection>

      {/* 4. Process — lazy (scroll video + GSAP, biggest perf hit) */}
      <LazySection minHeight="500vh">
        <ProcessSection />
      </LazySection>

      {/* 5. How It Works */}
      <LazySection minHeight="80vh">
        <HowItWorksSection />
      </LazySection>

      {/* 6. Transformation */}
      <LazySection minHeight="80vh">
        <TransformationSection />
      </LazySection>

      {/* 7. Testimonials */}
      <LazySection minHeight="60vh">
        <TestimonialsSection />
      </LazySection>

      {/* 8. FAQ */}
      <LazySection minHeight="60vh">
        <FAQSection />
      </LazySection>

      {/* 9. Video CTA */}
      <LazySection minHeight="60vh">
        <VideoShowcase />
      </LazySection>

      <Footer />
    </main>
  );
}
