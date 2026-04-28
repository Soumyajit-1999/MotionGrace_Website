'use client';

import React, { useState, useEffect, useRef } from 'react';
import LazySection from '@/app/components/LazySection';
import Footer from '@/components/Footer';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';
import ServicePageNav from '@/app/components/ServicePageNav';

const specs = [
  {
    icon: '◈',
    title: 'Optimized Topology',
    detail: 'Sub-5MB delivery',
    desc: 'Draco-compressed meshes. LOD-ready geometry. Maximum visual fidelity at minimal file size.',
  },
  {
    icon: '◉',
    title: 'Real-World Scale',
    detail: '1:1 physical accuracy',
    desc: 'Models calibrated to exact physical dimensions. What you see in AR is exactly what arrives.',
  },
  {
    icon: '◎',
    title: 'Cross-Platform',
    detail: 'iOS / Android / Web',
    desc: 'WebGL2, Quick Look, Scene Viewer, and native app pipelines all supported from one asset.',
  },
];

export default function Interactive3D() {
  const [mounted, setMounted] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <main className="relative bg-background [overflow-x:clip]">
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.15), 0 0 40px rgba(74,158,255,0.08); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(74,158,255,0.12); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(139,92,246,0.2); }
          50% { border-color: rgba(74,158,255,0.35); }
        }
        .viewer-block {
          animation: border-glow 4s ease-in-out infinite;
          animation-play-state: paused;
        }
        .viewer-block:hover {
          animation-play-state: running;
        }
        .feature-accordion {
          overflow: hidden;
          transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease;
        }
      `}</style>

      <ScrollAnimationInit />
      <ServicePageNav accentColor="#8B5CF6" accentRgb="139,92,246" />
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
          {/* Video background */}
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="https://res.cloudinary.com/ddgyx80f6/video/upload/v1777306339/1992-153555258_faiaiq.mp4" type="video/mp4" />
          </video>
          {/* Overlay to keep text legible */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(4,4,10,0.45)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(4,4,10,0) 0%, rgba(4,4,10,0.55) 70%, rgba(4,4,10,1) 100%)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-36 pb-24">
          <div data-reveal="scale" className="inline-flex items-center gap-2 mb-8">
            <div
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-[0.22em] uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(74,158,255,0.06))',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#8B5CF6',
                boxShadow: '0 0 30px rgba(139,92,246,0.12), 0 0 60px rgba(74,158,255,0.06)',
              }}
            >
              ✦ Interactive Experience
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
              lineHeight: 1.0,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
            }}
          >
            <span style={{ color: '#EDE9E3' }}>Don't Just Show.</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #4A9EFF 0%, #8B5CF6 50%, #C9A96E 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Let Them Play.
            </span>
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
            Interactive 3D experiences that increase engagement and conversion.
            Rotate, zoom, configure, and place — across every device.
          </p>

          {/* Stat pills */}
          <div data-reveal="up" data-delay="300" className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { value: '4×', label: 'Engagement uplift' },
              { value: '31%', label: 'Conversion increase' },
              { value: '65%', label: 'Return reduction' },
            ].map(stat => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-6 py-4 rounded-2xl"
                style={{
                  background: 'rgba(139,92,246,0.04)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>{stat.value}</span>
                <span style={{ fontSize: 10, color: 'rgba(237,233,227,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div data-reveal="up" data-delay="400" className="mt-10">
            <a
              href="#cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm tracking-[0.12em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #4A9EFF 0%, #8B5CF6 100%)',
                color: '#fff',
                boxShadow: '0 0 40px rgba(139,92,246,0.25), 0 4px 24px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(139,92,246,0.4), 0 8px 32px rgba(0,0,0,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(139,92,246,0.25), 0 4px 24px rgba(0,0,0,0.4)'; }}
            >
              Explore Interactive →
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#EDE9E3' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(139,92,246,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── AR VIEWER TOOL — replaces gallery → AR ── */}
      <section data-gsap-section="ar-viewer" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: '1rem' }}>
              Live Demo
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', marginBottom: '1rem' }}>
              Try It Now
            </h2>
            <p className="mx-auto" style={{ fontSize: 14, color: 'rgba(237,233,227,0.35)', lineHeight: 1.8, maxWidth: 520 }}>
              Interact with a live 3D AR experience — rotate, zoom, and place products in your space.
            </p>
          </div>

          {/* iframe embed — lazy-loaded, only injected after IntersectionObserver fires */}
          <LazySection
            minHeight="clamp(400px, 70vh, 720px)"
            rootMargin="200px"
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <div
              data-reveal="up"
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(139,92,246,0.2)',
                boxShadow: '0 0 80px rgba(139,92,246,0.08), 0 0 160px rgba(74,158,255,0.04), 0 40px 120px rgba(0,0,0,0.5)',
                background: 'rgba(4,4,10,0.95)',
              }}
            >
              {/* Loading skeleton shown until iframe fires onLoad */}
              {!iframeLoaded && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    zIndex: 2,
                    background: 'rgba(4,4,10,0.95)',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '2px solid rgba(139,92,246,0.15)',
                    borderTopColor: '#8B5CF6',
                    animation: 'spin 0.9s linear infinite',
                  }} />
                  <p style={{ fontSize: 11, color: 'rgba(237,233,227,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Loading viewer…
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src="https://ar-product-viewer-coolio.netlify.app"
                title="AR Product Viewer"
                allow="camera; gyroscope; accelerometer; xr-spatial-tracking; fullscreen"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                style={{
                  width: '100%',
                  // Taller on desktop, fits viewport on mobile without overflow
                  height: 'clamp(380px, 75vw, 900px)',
                  border: 'none',
                  display: 'block',
                  opacity: iframeLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              />
            </div>
          </LazySection>

          {/* Hint pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {[
              { icon: '◉', label: 'Drag to rotate' },
              { icon: '⊕', label: 'Scroll to zoom' },
              { icon: '◐', label: 'Place in AR' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ color: '#8B5CF6', fontSize: 12, opacity: 0.6 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: 'rgba(237,233,227,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── TECHNICAL SPECS ── */}
      <LazySection minHeight="400px" rootMargin="300px">
      <section data-gsap-section="specs" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-divider mb-24" />
          <div className="text-center mb-16" data-reveal="up">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: '1rem' }}>Technical Standards</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3' }}>
              Built for Production
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specs.map((spec, i) => (
              <div
                key={spec.title}
                data-gsap-card
                className="rounded-2xl p-8 text-center transition-all duration-500"
                style={{
                  background: 'linear-gradient(145deg, rgba(139,92,246,0.04) 0%, rgba(10,10,18,0.95) 100%)',
                  border: '1px solid rgba(139,92,246,0.1)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(139,92,246,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
              >
                <div style={{ fontSize: 28, color: '#8B5CF6', opacity: 0.5, marginBottom: '1.5rem' }}>{spec.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#EDE9E3', marginBottom: '0.5rem', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>{spec.title}</h3>
                <p style={{ fontSize: 11, color: '#8B5CF6', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{spec.detail}</p>
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
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: '1.5rem' }}>
              Let's Build It
            </p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-0.04em', fontFamily: 'var(--font-inter), Inter, sans-serif', color: '#EDE9E3', lineHeight: 1.05, marginBottom: '1.5rem' }}>
              Give Your Customers<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #4A9EFF 0%, #8B5CF6 50%, #C9A96E 100%)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                Something to Touch
              </span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(237,233,227,0.4)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 2.5rem' }}>
              Interactive 3D isn't the future of e-commerce — it's the present. 
              Brands using it now are compounding an insurmountable conversion advantage.
            </p>
            <a
              href="mailto:hello@motiongrace.com"
              data-gsap-button
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-sm tracking-[0.14em] uppercase transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #4A9EFF 0%, #8B5CF6 100%)',
                color: '#fff',
                boxShadow: '0 0 60px rgba(139,92,246,0.3), 0 8px 40px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px) scale(1.03)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 80px rgba(139,92,246,0.45), 0 16px 60px rgba(0,0,0,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(139,92,246,0.3), 0 8px 40px rgba(0,0,0,0.5)'; }}
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