'use client';

import React, { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    quote: 'Motion Grace delivered 80 campaign-ready assets in 4 days. Our traditional agency needed 6 weeks and triple the budget for half the output.',
    name: 'Camille Fontaine',
    title: 'Brand Director',
    company: 'Maison Elite Paris',
    initials: 'CF',
    accent: '#C9A96E',
  },
  {
    quote: 'The digital twin they built of our serum is indistinguishable from a photograph. We launched three new colorways without a single shoot day.',
    name: 'Priya Nair',
    title: 'Head of Marketing',
    company: 'Glace Beauty London',
    initials: 'PN',
    accent: '#4A9EFF',
  },
  {
    quote: 'Our AR try-on feature increased add-to-cart rate by 38% in the first month. The interactive 3D viewer alone paid for the entire project.',
    name: 'Sofia Marchetti',
    title: 'E-Commerce Director',
    company: 'Rouge Atelier Milan',
    initials: 'SM',
    accent: '#8B5CF6',
  },
  {
    quote: 'We replaced an entire in-house photography workflow with their pipeline. The quality is higher and our turnaround time dropped from weeks to hours.',
    name: 'Lena Hartmann',
    title: 'Creative Lead',
    company: 'Lumiere Studios Berlin',
    initials: 'LH',
    accent: '#F97066',
  },
  {
    quote: 'I was skeptical at first. Now our seasonal lookbook is entirely CGI and our customers cannot tell the difference — conversion is up 52%.',
    name: 'Yuki Tanaka',
    title: 'VP of Digital',
    company: 'Sora Collective Tokyo',
    initials: 'YT',
    accent: '#34D399',
  },
  {
    quote: 'The level of craft in every render is astonishing. Our fragrance campaign visuals looked like a $500K production for a fraction of the cost.',
    name: 'Isabelle Dupont',
    title: 'CMO',
    company: 'Velour Parfums Paris',
    initials: 'ID',
    accent: '#FBBF24',
  },
];

/* ── Float params per card ─────────────────────────────────────────────────────
   Pre-computed so the CSS @keyframes string can be built server-side-safe.
   y range kept small (8–16px) — enough to feel alive, cheap to composite.
   x drift is ≤ 6px to avoid layout reflow (transform only).
──────────────────────────────────────────────────────────────────────────────── */
const floatParams = testimonials.map((_, i) => ({
  yPx:      8 + (i % 3) * 4,           // 8 | 12 | 16
  xPx:      ((i * 3 + 1) % 7) - 3,     // –3 … +3
  duration: 4.4 + i * 0.3,             // seconds
  delay:    i * 0.18,                  // seconds
}));

/* ── Device check ──────────────────────────────────────────────────────────── */
function isLowCapabilityDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobile  = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1024px)').matches;
  const cores     = (navigator as any).hardwareConcurrency ?? 8;
  const memory    = (navigator as any).deviceMemory ?? 8;
  const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return isMobile || cores <= 4 || memory <= 4 || prefersRM;
}

/* ── Card component ────────────────────────────────────────────────────────── */
function TestimonialCard({
  item,
  index,
  isLow,
}: {
  item: typeof testimonials[number];
  index: number;
  isLow: boolean;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  // Reveal on scroll into view (once)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fp = floatParams[index];

  return (
    <div
      ref={ref}
      style={{
        /* Reveal animation */
        opacity: 0,
        transform: 'translateY(32px) scale(0.96)',
        animation: vis
          ? `ftc-in 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s forwards${
              /* Chained float via CSS animation — compositor-only, no JS */
              isLow ? '' : `, ftc-float-${index} ${fp.duration}s ${fp.delay + 0.8}s ease-in-out infinite alternate`
            }`
          : 'none',
        // Promote to GPU layer only on high-end (avoids unnecessary layers on mobile)
        willChange: isLow ? 'auto' : 'transform, opacity',
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'rgba(10,10,18,0.8)',
          border: '1px solid rgba(255,255,255,0.04)',
          backdropFilter: isLow ? 'none' : 'blur(12px)',   // skip blur on low-end
          WebkitBackdropFilter: isLow ? 'none' : 'blur(12px)',
          boxShadow: `0 0 40px rgba(0,0,0,0.4), 0 0 0 1px ${item.accent}0A`,
          contain: 'content',
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{
          background: `radial-gradient(ellipse 60% 50% at 30% 30%, ${item.accent}08 0%, transparent 72%)`,
        }} />

        <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 0.8, marginBottom: '0.5rem', color: item.accent, opacity: 0.25, fontFamily: 'Georgia, serif' }}>
          &ldquo;
        </div>

        <p style={{ fontSize: '0.82rem', lineHeight: 1.8, color: 'rgba(237,233,227,0.65)', fontWeight: 300, margin: '0 0 1.5rem', fontStyle: 'italic' }}>
          {item.quote}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${item.accent}18`, border: `1px solid ${item.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: item.accent, flexShrink: 0,
          }}>
            {item.initials}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(237,233,227,0.9)', letterSpacing: '0.03em' }}>{item.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(237,233,227,0.35)', letterSpacing: '0.05em', marginTop: 1 }}>{item.title} · {item.company}</div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${item.accent}30, transparent)` }} />
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────────────── */
export default function FloatingTestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const [low, setLow] = useState(true);  // start conservative, update on mount

  useEffect(() => {
    setLow(isLowCapabilityDevice());

    // Glow parallax — simple CSS transition driven by IntersectionObserver,
    // no GSAP scrub needed here (saves a ScrollTrigger instance)
    const section = sectionRef.current;
    const glow    = glowRef.current;
    const header  = headerRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (glow) {
          glow.style.opacity   = String(0.18 + ratio * 0.64);
          glow.style.transform = `scale(${0.92 + ratio * 0.12})`;
        }
        if (header && ratio > 0.1) {
          header.style.opacity   = '1';
          header.style.transform = 'translateY(0)';
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  /* Build per-card @keyframes strings once — avoids inline style pollution */
  const floatKeyframes = testimonials.map((_, i) => {
    const fp = floatParams[i];
    return `
      @keyframes ftc-float-${i} {
        from { transform: translate(0, 0); }
        to   { transform: translate(${fp.xPx}px, -${fp.yPx}px); }
      }
    `;
  }).join('');

  return (
    <section
      ref={sectionRef}
      data-gsap-section="default"
      className="relative overflow-hidden py-32 sm:py-48 px-6 sm:px-10"
      style={{ background: 'linear-gradient(180deg, #020208 0%, #04040c 50%, #030309 100%)' }}
    >
      {/* Ambient glow — transitioned via IntersectionObserver */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(74,158,255,0.025) 0%, transparent 70%)',
          opacity: 0.18, transform: 'scale(0.92)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      />

      {/* Header */}
      <div
        ref={headerRef}
        className="relative z-10 text-center mb-20"
        style={{
          opacity: 0, transform: 'translateY(24px)',
          transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
          <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(201,169,110,0.5)' }}>Client Stories</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)' }} />
        </div>

        <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          <span style={{ color: 'rgba(237,233,227,0.85)' }}>Brands that </span>
          <span style={{
            background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>never look back.</span>
        </h2>
      </div>

      {/* Cards grid */}
      <div
        className="relative z-10 max-w-6xl mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {testimonials.map((item, i) => (
          <TestimonialCard key={item.name} item={item} index={i} isLow={low} />
        ))}
      </div>

      {/* CSS keyframes for reveal + per-card floats */}
      <style>{`
        @keyframes ftc-in {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        ${floatKeyframes}
      `}</style>
    </section>
  );
}
