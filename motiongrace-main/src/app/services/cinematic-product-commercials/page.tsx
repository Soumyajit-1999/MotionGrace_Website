'use client';

import React, { useState, useEffect } from 'react';
import LazySection from '@/app/components/LazySection';
import Footer from '@/components/Footer';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';
import ServicePageNav from '@/app/components/ServicePageNav';

const shotMedia = [
  { type: 'gif', src: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777310022/Light-Reveal-close-_002_ybzv65.gif' },
  { type: 'gif', src: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298110/002.1_rm3dok.gif' },
  { type: 'gif', src: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298112/003_cmducs.gif' },
  { type: 'gif', src: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298360/Exploded_003_ynbnau.gif' },
  { type: 'gif', src: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777310295/Bubble_sim_004_2_ibalqz.gif' },
  { type: 'video', src: 'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297901/gel_pour_r64tpy.mp4' },
];

function ShotCarousel() {
  const [current, setCurrent] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (shotMedia[current].type === 'video') {
      timer = setTimeout(() => {
        setCurrent(i => (i + 1) % shotMedia.length);
      }, 6000);
    } else {
      timer = setTimeout(() => {
        setCurrent(i => (i + 1) % shotMedia.length);
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [current]);

  React.useEffect(() => {
    if (shotMedia[current].type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [current]);

  const item = shotMedia[current];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        aspectRatio: '16/9',
        border: '1px solid rgba(201,169,110,0.12)',
        position: 'relative',
        background: '#04040A',
      }}
    >
      {item.type === 'gif' ? (
        <img
          key={current}
          src={item.src}
          alt={`Shot ${current + 1}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <video
          key={current}
          ref={videoRef}
          src={item.src}
          autoPlay
          loop={false}
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Bottom fade */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(4,4,10,0.5) 100%)', pointerEvents: 'none' }} />

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
        {shotMedia.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: idx === current ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: idx === current ? '#C9A96E' : 'rgba(237,233,227,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(237,233,227,0.5)', background: 'rgba(4,4,10,0.5)', padding: '3px 10px', borderRadius: 4, zIndex: 10 }}>
        {current + 1} / {shotMedia.length}
      </div>
    </div>
  );
}

export default function CinematicProductCommercials() {
  const [activeSpec, setActiveSpec] = useState<number | null>(null);
  const [activeGif, setActiveGif] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Tiny delay so the browser has painted the initial frame before animating in
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const brandGifs = [
    'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777300309/001.1_gonsxq.gif',
    'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777300666/VSET_004_1_kltd8x.gif',
    'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298112/003_cmducs.gif',
    'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298110/002.1_rm3dok.gif',
  ];

  const prevGif = () => setActiveGif(i => (i - 1 + brandGifs.length) % brandGifs.length);
  const nextGif = () => setActiveGif(i => (i + 1) % brandGifs.length);

  const stylePillars = [
    {
      id: 1,
      title: 'High Energy',
      description: 'Explosive kinetic motion with precise timing. Every frame engineered to trigger an emotional response and demand attention.',
      icon: '⚡',
      gradient: 'from-amber-500/10 to-orange-500/5',
    },
    {
      id: 2,
      title: 'Sensory Physics',
      description: 'Liquid dynamics, particle systems, and tactile material simulation. Physics-accurate rendering that makes viewers reach for the screen.',
      icon: '◈',
      gradient: 'from-purple-500/10 to-blue-500/5',
    },
    {
      id: 3,
      title: 'Luxury Flow',
      description: 'Slow, deliberate camera movements. Cinematic depth of field. The unhurried confidence of a premium brand with nothing to prove.',
      icon: '◎',
      gradient: 'from-yellow-500/10 to-amber-500/5',
    },
    {
      id: 4,
      title: 'Organic Story',
      description: 'Narrative-first productions where the product is the hero. Context, environment, and emotion working in concert.',
      icon: '◐',
      gradient: 'from-emerald-500/10 to-teal-500/5',
    },
  ];

  const specs = [
    {
      label: '4K Ultra HD',
      detail: '3840 × 2160px',
      desc: 'Every delivery at full cinematic resolution, print-ready and future-proof.',
      icon: '▣',
    },
    {
      label: 'Cinematic Motion',
      detail: '24fps / 60fps',
      desc: 'Frame rates matched to output — filmic depth or buttery-smooth social.',
      icon: '◈',
    },
    {
      label: 'Broadcast Ready',
      detail: 'Rec. 709 / HDR10',
      desc: 'Calibrated for broadcast, OTT, and premium digital placement.',
      icon: '◉',
    },
  ];

  return (
    <main className="relative bg-background [overflow-x:clip]">
      <ScrollAnimationInit />
      <ServicePageNav accentColor="#C9A96E" accentRgb="201,169,110" />
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        }}
      >

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero GIF cover */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298099/VSET_006_x9f8mj.gif"
            alt="Hero background"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(4,4,10,0.45) 0%, rgba(4,4,10,0.55) 60%, rgba(4,4,10,1) 100%)',
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,169,110,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.6) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-32 pb-24">
          {/* Tagline pill */}
          <div data-reveal="scale" className="inline-flex items-center gap-2 mb-8">
            <div
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-[0.22em] uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))',
                border: '1px solid rgba(201,169,110,0.3)',
                color: '#C9A96E',
                boxShadow: '0 0 30px rgba(201,169,110,0.12)',
                letterSpacing: '0.25em',
              }}
            >
              ✦ Beyond Reality
            </div>
          </div>

          <h1
            data-reveal="up"
            data-delay="100"
            className="mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
            }}
          >
            <span className="text-gradient-gold">Cinematic Product</span>
            <br />
            <span style={{ color: '#EDE9E3' }}>Commercials</span>
          </h1>

          <p
            data-reveal="up"
            data-delay="200"
            className="mx-auto mt-6 max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(237,233,227,0.5)',
              lineHeight: 1.75,
              fontWeight: 300,
            }}
          >
            High-fidelity 3D commercials engineered to stop the scroll and lower your CPA.
          </p>

          <div data-reveal="up" data-delay="300" className="mt-10">
            <a
              href="#cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm tracking-[0.12em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #B8935A 0%, #E8D4A0 45%, #D4B87A 75%, #C9A96E 100%)',
                color: '#04040A',
                boxShadow: '0 0 40px rgba(201,169,110,0.25), 0 4px 24px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.02)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(201,169,110,0.4), 0 8px 32px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = '';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(201,169,110,0.25), 0 4px 24px rgba(0,0,0,0.4)';
              }}
            >
              Start Project
              <span style={{ opacity: 0.7 }}>→</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#EDE9E3' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(201,169,110,0.6), transparent)' }} />
        </div>
      </section>

      <LazySection minHeight="600px" rootMargin="400px">
      {/* ── STYLE PILLARS ── */}
      <section data-gsap-section="style-pillars" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.6)', marginBottom: '1rem' }}>
              Creative Direction
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              Four Style Pillars
            </h2>
          </div>

          {(() => {
            const pillarVideos = [
              'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297860/Lipstick_ymuas8.mp4',
              'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297972/Bubbles_mebtrj.mp4',
              'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297901/gel_pour_r64tpy.mp4',
              'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297859/perfume_yrsaxj.mp4',
            ];
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stylePillars.map((pillar, i) => (
                  <div
                    key={pillar.id}
                    data-gsap-card
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
                    style={{
                      background: `linear-gradient(145deg, rgba(201,169,110,0.04) 0%, rgba(10,10,18,0.95) 100%)`,
                      border: '1px solid rgba(201,169,110,0.1)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px) scale(1.01)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.25)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(201,169,110,0.06)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = '';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.1)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                    }}
                  >
                    {/* Large video frame */}
                    <div className="relative overflow-hidden" style={{ height: 380 }}>
                      <video
                        src={pillarVideos[i]}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Bottom gradient fade into card content */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, transparent, rgba(10,10,18,0.95))' }} />
                      {/* Icon badge */}
                      <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 22, color: '#C9A96E', opacity: 0.85 }}>
                        {pillar.icon}
                      </div>
                    </div>

                    {/* Card text */}
                    <div style={{ padding: '1.25rem 1.5rem 1.75rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#EDE9E3', marginBottom: '0.55rem', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                        {pillar.title}
                      </h3>
                      <p style={{ fontSize: 13, color: 'rgba(237,233,227,0.4)', lineHeight: 1.7 }}>
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── SHOTS MONEY CAN'T BUY ── */}
      <section data-gsap-section="shots" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-reveal="left">
              <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.6)', marginBottom: '1.5rem' }}>
                Visual Mastery
              </p>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1.5rem' }}>
                Shots Money<br />
                <span className="text-gradient-gold">Can't Buy</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(237,233,227,0.45)', lineHeight: 1.85, marginBottom: '1.5rem', maxWidth: 480 }}>
                We build environments that don't exist. Camera angles that physics won't allow. 
                Macro details invisible to the naked eye. Every frame is an act of authorship, 
                not just production.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(237,233,227,0.35)', lineHeight: 1.85, maxWidth: 480 }}>
                When you remove the physical constraints of a shoot, you're left with pure creative 
                possibility. That's where we live.
              </p>
            </div>

            <div data-reveal="right" style={{ position: 'relative' }}>
              <ShotCarousel />
              {/* Decorative glow */}
              <div
                className="absolute -inset-8 -z-10 opacity-30"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.12) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      </LazySection>
      <LazySection minHeight="500px" rootMargin="350px">
      {/* ── IMMERSIVE BRAND WORLDS ── */}
      <section data-gsap-section="brand-worlds" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* GIF Carousel left */}
            <div data-reveal="left" style={{ position: 'relative', order: 1 }}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '4/3',
                  border: '1px solid rgba(139,92,246,0.2)',
                  position: 'relative',
                }}
              >
                {/* GIF display */}
                <img
                  key={activeGif}
                  src={brandGifs[activeGif]}
                  alt={`Brand world ${activeGif + 1}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Dark overlay edges */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,4,10,0.15) 0%, transparent 30%, transparent 70%, rgba(4,4,10,0.4) 100%)', pointerEvents: 'none' }} />

                {/* Left Arrow */}
                <button
                  onClick={prevGif}
                  style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(4,4,10,0.65)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#EDE9E3',
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.35)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.7)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(4,4,10,0.65)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                  }}
                  aria-label="Previous"
                >
                  ←
                </button>

                {/* Right Arrow */}
                <button
                  onClick={nextGif}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(4,4,10,0.65)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#EDE9E3',
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.35)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.7)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(4,4,10,0.65)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                  }}
                  aria-label="Next"
                >
                  →
                </button>

                {/* Dot indicators */}
                <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
                  {brandGifs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGif(idx)}
                      style={{
                        width: idx === activeGif ? 20 : 6,
                        height: 6, borderRadius: 3,
                        background: idx === activeGif ? '#8B5CF6' : 'rgba(237,233,227,0.3)',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        padding: 0,
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(237,233,227,0.5)', background: 'rgba(4,4,10,0.5)', padding: '3px 10px', borderRadius: 4, zIndex: 10 }}>
                  {activeGif + 1} / {brandGifs.length}
                </div>
              </div>
            </div>

            <div data-reveal="right" style={{ order: 2 }}>
              <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: '1.5rem' }}>
                Total Immersion
              </p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1.5rem' }}>
                Immersive<br />
                <span style={{ color: '#8B5CF6' }}>Brand Worlds</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(237,233,227,0.45)', lineHeight: 1.85, maxWidth: 480 }}>
                We construct entire universes around your product. Bespoke environments with 
                full atmospheric control — lighting, weather, gravity, time of day. The camera 
                moves through these worlds with absolute precision.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {['Fully lit volumetric environments', 'CG-accurate material rendering', 'Infinite scene scalability'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C9A96E', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(237,233,227,0.5)', letterSpacing: '0.02em' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      </LazySection>
      {/* ── DIGITAL TWIN ── */}
      <section data-gsap-section="digital-twin" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-reveal="left">
              <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.6)', marginBottom: '1.5rem' }}>
                The Asset Advantage
              </p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1.5rem' }}>
                Digital Twin<br />
                <span className="text-gradient-gold">Technology</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(237,233,227,0.45)', lineHeight: 1.85, marginBottom: '2rem', maxWidth: 480 }}>
                Every commercial we create begins with a precision digital twin of your product. 
                Built once. Used forever. No more booking studios or coordinating shoots 
                for every new campaign.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Built once, reused forever', detail: 'One master asset powers all future content' },
                  { label: 'No reshoots. Ever.', detail: 'Retouching and iteration in hours, not weeks' },
                  { label: 'Scalable campaigns', detail: 'Deploy across 20 markets simultaneously' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.07)' }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: '#C9A96E', fontSize: 9 }}>✓</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#EDE9E3', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: 'rgba(237,233,227,0.35)', lineHeight: 1.6 }}>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal="right">
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  aspectRatio: '1/1',
                  border: '1px solid rgba(201,169,110,0.1)',
                }}
              >
                <video
                  src="https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297856/Digital_Twin_2_crm8bc.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="absolute bottom-6 left-0 right-0 text-center" style={{ pointerEvents: 'none' }}>
                  <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.5)', background: 'rgba(4,4,10,0.5)', padding: '3px 10px', borderRadius: 4 }}>
                    Digital Twin Technology
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LazySection minHeight="400px" rootMargin="300px">
      {/* ── TECHNICAL SPECS ── */}
      <section data-gsap-section="specs" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="text-center mb-16" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.6)', marginBottom: '1rem' }}>
              Delivery Standards
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              Technical Specifications
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specs.map((spec, i) => (
              <div
                key={spec.label}
                data-gsap-card
                className="relative rounded-2xl p-8 text-center cursor-pointer group transition-all duration-500"
                style={{
                  background: 'linear-gradient(145deg, rgba(201,169,110,0.04) 0%, rgba(10,10,18,0.95) 100%)',
                  border: activeSpec === i ? '1px solid rgba(201,169,110,0.35)' : '1px solid rgba(201,169,110,0.1)',
                  boxShadow: activeSpec === i ? '0 0 40px rgba(201,169,110,0.08)' : 'none',
                }}
                onClick={() => setActiveSpec(activeSpec === i ? null : i)}
                onMouseEnter={e => { if (activeSpec !== i) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.2)'; }}
                onMouseLeave={e => { if (activeSpec !== i) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.1)'; }}
              >
                <div style={{ fontSize: 28, color: '#C9A96E', opacity: 0.5, marginBottom: '1.5rem' }}>{spec.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EDE9E3', marginBottom: '0.5rem', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>{spec.label}</h3>
                <p style={{ fontSize: 12, color: '#C9A96E', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{spec.detail}</p>
                <p style={{ fontSize: 12, color: 'rgba(237,233,227,0.35)', lineHeight: 1.65 }}>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" data-gsap-section="cta" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-divider mb-24" />
          <div data-reveal="scale">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.6)', marginBottom: '1.5rem' }}>
              Ready to Begin
            </p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.04em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', lineHeight: 1.05, marginBottom: '1.5rem' }}>
              Let's Create<br />
              <span className="text-gradient-gold">Something Iconic</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(237,233,227,0.4)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto 2.5rem' }}>
              Every brand deserves visuals that command attention. Tell us about your vision 
              and we'll engineer a commercial that changes how people see your product.
            </p>
            <a
              href="mailto:hello@motiongrace.com"
              data-gsap-button
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-sm tracking-[0.14em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #B8935A 0%, #E8D4A0 45%, #D4B87A 75%, #C9A96E 100%)',
                color: '#04040A',
                boxShadow: '0 0 60px rgba(201,169,110,0.3), 0 8px 40px rgba(0,0,0,0.5)',
                animation: 'pulse-glow-gold 5s ease-in-out infinite',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px) scale(1.03)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 80px rgba(201,169,110,0.45), 0 16px 60px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = '';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(201,169,110,0.3), 0 8px 40px rgba(0,0,0,0.5)';
              }}
            >
              Start Project
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      </LazySection>
      <Footer />
      </div>
    </main>
  );
}