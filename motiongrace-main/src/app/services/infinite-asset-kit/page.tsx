'use client';

import React, { useState, useEffect, useRef } from 'react';
import LazySection from '@/app/components/LazySection';
import Footer from '@/components/Footer';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';
import ServicePageNav from '@/app/components/ServicePageNav';

export default function InfiniteAssetKit() {
  // Canva video play/pause + fullscreen
  const canvaVideoRef = useRef<HTMLVideoElement>(null);
  const canvaContainerRef = useRef<HTMLDivElement>(null);
  const [canvaPlaying, setCanvaPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const enterFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = canvaContainerRef.current;
    if (!container) return;
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if ((container as any).webkitRequestFullscreen) {
      (container as any).webkitRequestFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleCanva = () => {
    const v = canvaVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setCanvaPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setCanvaPlaying(false);
    }
  };

  // Accelerated pipeline: asset2 → asset3 → loop (flicker-free)
  const accelVideoRef = useRef<HTMLVideoElement>(null);
  const accelVideos = ['/videos/asset2.mp4', '/videos/asset3.mp4'];
  const accelIndex = useRef(0);

  useEffect(() => {
    const v = accelVideoRef.current;
    if (!v) return;

    // Mobile-optimised: pre-fetch both videos as blob URLs to eliminate
    // the gap/flash between clips caused by network re-fetching on src swap.
    const blobUrls: string[] = [];
    let cancelled = false;

    const fetchBlob = async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch {
        return url; // fallback to direct URL
      }
    };

    const init = async () => {
      // Fetch both videos concurrently
      const [blob0, blob1] = await Promise.all(accelVideos.map(fetchBlob));
      if (cancelled) {
        URL.revokeObjectURL(blob0);
        URL.revokeObjectURL(blob1);
        return;
      }
      blobUrls.push(blob0, blob1);

      v.src = blobUrls[0];
      v.load();
      // Use canplaythrough so mobile doesn't start before buffered
      const onReady = () => {
        v.play().catch(() => {});
        v.removeEventListener('canplaythrough', onReady);
      };
      v.addEventListener('canplaythrough', onReady);

      const playNext = () => {
        accelIndex.current = (accelIndex.current + 1) % blobUrls.length;
        v.src = blobUrls[accelIndex.current];
        v.load();
        v.play().catch(() => {});
      };
      v.addEventListener('ended', playNext);

      return () => { v.removeEventListener('ended', playNext); };
    };

    let innerCleanup: (() => void) | undefined;
    init().then(fn => { innerCleanup = fn; });

    return () => {
      cancelled = true;
      innerCleanup?.();
      blobUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);



  const kitContents = [
    {
      title: 'Standard Views',
      description: 'Every essential e-commerce angle — hero, flat lay, profile, and macro. Pixel-perfect.',
      images: ['/Standard/1.png', '/Standard/2.png', '/Standard/3.png', '/Standard/4.png', '/Standard/5.png'],
    },
    {
      title: 'Creative',
      description: 'Liquid splash, particle burst, material reveal. Social-first content that earns the pause.',
      images: ['/Creative/1.png', '/Creative/2.png'],
    },
    {
      title: 'Virtual Sets',
      description: 'Marble surfaces, abstract void, luxury shelves, outdoor golden hour. Context that elevates.',
      images: ['/Virtual/1.png', '/Virtual/2.png'],
    },
  ];

  const KitCard = ({ item, index }: { item: typeof kitContents[0]; index: number }) => {
    const [current, setCurrent] = React.useState(0);
    const [hovered, setHovered] = React.useState(false);
    const total = item.images.length;
    const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

    const resetTimer = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => setCurrent(p => (p + 1) % total), 3000 + index * 300);
    };

    React.useEffect(() => {
      resetTimer();
      return () => { if (timer.current) clearInterval(timer.current); };
    }, [total, index]);

    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(p => (p - 1 + total) % total); resetTimer(); };
    const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(p => (p + 1) % total); resetTimer(); };

    return (
      <div
        data-gsap-card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,16,0.95)',
          transition: 'border-color 0.35s ease, transform 0.35s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          borderColor: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Image area */}
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#080810' }}>
          {item.images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: i === current ? 1 : 0,
                transition: 'opacity 0.7s ease',
              }}
            />
          ))}

          {/* Arrows — appear on hover */}
          {hovered && (
            <>
              <button onClick={prev} aria-label="Previous" style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                zIndex: 5, width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#fff',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7.5 1.5 3 6 7.5 10.5" />
                </svg>
              </button>
              <button onClick={next} aria-label="Next" style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                zIndex: 5, width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#fff',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4.5 1.5 9 6 4.5 10.5" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5, zIndex: 4,
          }}>
            {item.images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); resetTimer(); }} style={{
                width: i === current ? 16 : 4, height: 4, borderRadius: 99, padding: 0, border: 'none',
                background: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Text */}
        <div style={{ padding: '1.1rem 1.25rem 1.35rem' }}>
          <h3 style={{
            margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 600,
            color: '#EDE9E3', fontFamily: 'var(--font-inter), Inter, sans-serif', letterSpacing: '-0.01em',
          }}>
            {item.title}
          </h3>
          <p style={{
            margin: 0, fontSize: 12, color: 'rgba(237,233,227,0.38)', lineHeight: 1.7,
          }}>
            {item.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="relative bg-background [overflow-x:clip]">
      <ScrollAnimationInit />
      <ServicePageNav accentColor="#4A9EFF" accentRgb="74,158,255" />
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        }}
      >

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Perfume video background — plays once per page load, freezes on last frame */}
          <video
            src="https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297859/perfume_yrsaxj.mp4"
            autoPlay
            muted
            playsInline
            onEnded={e => { (e.currentTarget as HTMLVideoElement).pause(); }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark overlay to keep text legible */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(4,4,10,0.55) 0%, rgba(4,4,10,0.45) 50%, rgba(4,4,10,1) 100%)',
            }}
          />
          {/* Subtle hex grid on top */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.018]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexgrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon points="30,1 59,16 59,36 30,51 1,36 1,16" fill="none" stroke="#4A9EFF" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexgrid)" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-36 pb-24">
          <div data-reveal="scale" className="inline-flex items-center gap-2 mb-8">
            <div
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-[0.22em] uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#8B5CF6',
                boxShadow: '0 0 30px rgba(139,92,246,0.1)',
              }}
            >
              ✦ The Asset System
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
            <span style={{ color: '#EDE9E3' }}>One Model.</span>
            <br />
            <span className="text-gradient-blue">Infinite Touchpoints.</span>
          </h1>

          <p
            data-reveal="up"
            data-delay="200"
            className="mx-auto mt-6 max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(237,233,227,0.45)',
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            Turn one product render into a full marketing asset system. Every channel, every format,
            every campaign — from a single master geometry.
          </p>

          <div data-reveal="up" data-delay="300" className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm tracking-[0.12em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #1A7FE8 0%, #78C0FF 45%, #3AACFF 75%, #4A9EFF 100%)',
                color: '#fff',
                boxShadow: '0 0 40px rgba(74,158,255,0.25), 0 4px 24px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(74,158,255,0.4), 0 8px 32px rgba(0,0,0,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(74,158,255,0.25), 0 4px 24px rgba(0,0,0,0.4)'; }}
            >
              Start Project →
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#EDE9E3' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(74,158,255,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── SOCIAL PREVIEW ── */}
      <LazySection minHeight="600px" rootMargin="400px">
      <section data-gsap-section="social-preview" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1rem' }}>
              Made for Modern Channels
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              Ready to Post. Everywhere.
            </h2>
          </div>

          {/* YouTube-frame mock post */}
          <div data-reveal="scale" className="flex justify-center">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: '100%',
                maxWidth: 1000,
                background: 'rgba(10,10,18,0.98)',
                border: '1px solid rgba(237,233,227,0.06)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74,158,255,0.05)',
              }}
            >
              <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid rgba(237,233,227,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF0000, #FF4444)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#EDE9E3' }}>@brandname</p>
                  <p style={{ fontSize: 11, color: 'rgba(237,233,227,0.3)' }}>Sponsored</p>
                </div>
                <div className="ml-auto" style={{ fontSize: 20, color: 'rgba(237,233,227,0.2)' }}>···</div>
              </div>
              <div style={{ aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
                <video
                  src="/videos/asset_start.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <span style={{ fontSize: 20, color: 'rgba(237,233,227,0.4)' }}>♡</span>
                  <span style={{ fontSize: 20, color: 'rgba(237,233,227,0.4)' }}>△</span>
                  <span style={{ fontSize: 20, color: 'rgba(237,233,227,0.4)' }}>✉</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#EDE9E3', marginBottom: 4 }}>4,891 likes</p>
                <p style={{ fontSize: 12, color: 'rgba(237,233,227,0.4)', lineHeight: 1.5 }}>
                  Introducing the new collection. <span style={{ color: '#4A9EFF' }}>#LuxuryBeauty</span>
                </p>
              </div>
            </div>
          </div>

          {/* Format chips */}
          <div data-reveal="up" data-delay="200" className="mt-12 flex flex-wrap justify-center gap-3">
            {['Instagram 1:1', 'Story 9:16', 'TikTok Video', 'YouTube Banner', 'Email Header', 'Print 300dpi', 'Web GIF/WebM'].map(format => (
              <div
                key={format}
                className="px-4 py-2 rounded-full text-xs"
                style={{
                  background: 'rgba(74,158,255,0.04)',
                  border: '1px solid rgba(74,158,255,0.12)',
                  color: 'rgba(237,233,227,0.45)',
                  letterSpacing: '0.08em',
                }}
              >
                {format}
              </div>
            ))}
          </div>
        </div>
      </section>
      </LazySection>

      {/* ── DRAG DROP DONE ── */}
      <section data-gsap-section="drag-drop" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-reveal="left">
              <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1.5rem' }}>
                Frictionless Delivery
              </p>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.0, fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1.5rem' }}>
                Drag.<br />Drop.<br />
                <span className="text-gradient-blue">Done.</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(237,233,227,0.45)', lineHeight: 1.85, maxWidth: 460 }}>
                Every asset arrives organized, labeled, and immediately usable.
                Cloud-delivered, version-controlled, and ready for your entire
                marketing team to access.
              </p>
              <div className="mt-10 flex flex-col gap-3">
                {[
                  'Organized by channel and format',
                  'Cloud-hosted with instant access',
                  'Unlimited revisions included',
                  'Source files retained on request',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(74,158,255,0.6)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(237,233,227,0.5)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal="right">
              {/* canva.mp4 with custom play/pause + fullscreen */}
              <div
                ref={canvaContainerRef}
                className="rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  background: '#000',
                  border: '1px solid rgba(139,92,246,0.18)',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.07)',
                  /* fullscreen styles applied via class when active */
                }}
                onClick={toggleCanva}
              >
                <video
                  ref={canvaVideoRef}
                  src="/videos/canva.mp4"
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />

                {/* Overlay: shown when paused */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: canvaPlaying ? 'transparent' : 'rgba(4,4,10,0.45)',
                    transition: 'background 0.4s ease',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Play button */}
                  <div
                    style={{
                      width: 72, height: 72,
                      borderRadius: '50%',
                      background: 'rgba(10,10,18,0.75)',
                      border: '1px solid rgba(139,92,246,0.4)',
                      backdropFilter: 'blur(12px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: canvaPlaying ? 0 : 1,
                      transform: canvaPlaying ? 'scale(0.85)' : 'scale(1)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      boxShadow: '0 0 32px rgba(139,92,246,0.25)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                      <path d="M6 4L16 10L6 16V4Z" fill="#8B5CF6" fillOpacity="0.9" />
                    </svg>
                  </div>
                </div>

                {/* Bottom controls bar */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(to top, rgba(4,4,10,0.75) 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Left: label */}
                  <span style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.55)' }}>
                    Demo Preview
                  </span>

                  {/* Right: pause indicator + fullscreen button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
                    {canvaPlaying && (
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(10,10,18,0.65)',
                          border: '1px solid rgba(139,92,246,0.25)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <rect x="2" y="2" width="3.5" height="10" rx="1" fill="#8B5CF6" fillOpacity="0.8" />
                          <rect x="8.5" y="2" width="3.5" height="10" rx="1" fill="#8B5CF6" fillOpacity="0.8" />
                        </svg>
                      </div>
                    )}

                    {/* Fullscreen button */}
                    <button
                      onClick={enterFullscreen}
                      title="Enter fullscreen"
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(10,10,18,0.7)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#8B5CF6',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.25)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.6)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,18,0.7)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.3)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                    >
                      {/* Fullscreen icon */}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ITERATION PIPELINE ── */}
      <section data-gsap-section="iteration" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1rem' }}>
              Compound Returns
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1rem' }}>
              Accelerated Iteration Pipeline
            </h2>
            <p className="mx-auto" style={{ fontSize: 15, color: 'rgba(237,233,227,0.4)', lineHeight: 1.75, maxWidth: 600 }}>
              The master geometry is your permanent asset. Every new campaign, colorway,
              or format request ships in hours — not weeks.
            </p>
          </div>

          <div data-reveal="scale" className="flex justify-center">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                maxWidth: 760,
                width: '100%',
                background: 'linear-gradient(145deg, rgba(74,158,255,0.04) 0%, rgba(10,10,18,0.97) 100%)',
                border: '1px solid rgba(74,158,255,0.1)',
              }}
            >
              <video
                ref={accelVideoRef}
                muted
                playsInline
                style={{
                  width: '100%',
                  display: 'block',
                  background: 'linear-gradient(145deg, rgba(74,158,255,0.04) 0%, rgba(10,10,18,0.97) 100%)',
                  // Prevents white flash between clips on mobile
                  minHeight: 120,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ── */}
      <LazySection minHeight="500px" rootMargin="300px">
      <section data-gsap-section="kit-contents" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="text-center mb-20" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1rem' }}>
              Included in Every Kit
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              What's Inside the Kit
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {kitContents.map((item, i) => (
              <KitCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      </LazySection>

      {/* ── TECHNICAL SPECS ── */}
      <LazySection minHeight="400px" rootMargin="300px">
      <section data-gsap-section="specs" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="text-center mb-16" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1rem' }}>Technical Standards</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              Delivery Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '◣', title: 'Print Ready', detail: '4K / 300 DPI', desc: 'Magazine, billboard, and large format print. Every pixel sharp at any size.' },
              { icon: '◈', title: 'Web Optimized', detail: 'GIF / WebM / MP4', desc: 'Compressed for speed without visible quality loss. Under 2MB per social asset.' },
              { icon: '◎', title: 'Cloud Delivery', detail: 'Organized & Versioned', desc: 'Shared folder access. Sorted by channel, format, and date. Instant team access.' },
            ].map((spec) => (
              <div
                key={spec.title}
                data-gsap-card
                className="rounded-2xl p-8 text-center transition-all duration-500"
                style={{ background: 'linear-gradient(145deg, rgba(74,158,255,0.04) 0%, rgba(10,10,18,0.95) 100%)', border: '1px solid rgba(74,158,255,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,158,255,0.22)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,158,255,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
              >
                <div style={{ fontSize: 28, color: '#4A9EFF', opacity: 0.4, marginBottom: '1.5rem' }}>{spec.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#EDE9E3', marginBottom: '0.5rem', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>{spec.title}</h3>
                <p style={{ fontSize: 11, color: '#4A9EFF', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{spec.detail}</p>
                <p style={{ fontSize: 12, color: 'rgba(237,233,227,0.35)', lineHeight: 1.65 }}>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </LazySection>

      {/* ── CTA ── */}
      <section id="cta" data-gsap-section="cta" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-divider mb-24" />
          <div data-reveal="scale">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.6)', marginBottom: '1.5rem' }}>
              Begin Your Asset System
            </p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.04em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', lineHeight: 1.05, marginBottom: '1.5rem' }}>
              One Investment.<br />
              <span className="text-gradient-blue">Limitless Output.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(237,233,227,0.4)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto 2.5rem' }}>
              Stop paying for every single shoot. Build the master asset once
              and scale your entire marketing engine from a single source of truth.
            </p>
            <a
              href="mailto:hello@motiongrace.com"
              data-gsap-button
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-sm tracking-[0.14em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #1A7FE8 0%, #78C0FF 45%, #3AACFF 75%, #4A9EFF 100%)',
                color: '#fff',
                boxShadow: '0 0 60px rgba(74,158,255,0.3), 0 8px 40px rgba(0,0,0,0.5)',
                animation: 'pulse-glow-blue 5s ease-in-out infinite',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px) scale(1.03)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 80px rgba(74,158,255,0.45), 0 16px 60px rgba(0,0,0,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(74,158,255,0.3), 0 8px 40px rgba(0,0,0,0.5)'; }}
            >
              Start Project →
            </a>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </main>
  );
}