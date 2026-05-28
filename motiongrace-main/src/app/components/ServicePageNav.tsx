'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AI_STRATEGIST_HREF = 'https://app.motiongraceco.com/strategist';

interface ServicePageNavProps {
  accentColor?: string;
  accentRgb?: string;
}

export default function ServicePageNav({
  accentColor = '#C9A96E',
  accentRgb = '201,169,110',
}: ServicePageNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Observe hero section to know when we've scrolled past it
  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Track scroll for compact nav styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth scroll to hash on entry from another page
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const tryScroll = (attempts = 0) => {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      } else if (attempts < 10) {
        setTimeout(() => tryScroll(attempts + 1), 120);
      }
    };
    tryScroll();
  }, []);

  // Close menu on route or scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  const scrollToHero = () => {
    setMenuOpen(false);
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        /* ── AI glow text ── */
        .spn-ai-text {
          background: linear-gradient(to right, #0894ff 0%, #c959dd 45%, #ff9004 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 5px rgba(201,89,221,0.5));
          animation: spn-ai-glow 4s ease-in-out infinite;
        }
        @keyframes spn-ai-glow {
          0%,100% { filter: drop-shadow(0 0 4px rgba(201,89,221,0.45)) drop-shadow(0 0 8px rgba(8,148,255,0.2)); }
          50%      { filter: drop-shadow(0 0 8px rgba(255,144,4,0.5))  drop-shadow(0 0 14px rgba(201,89,221,0.35)); }
        }
        .spn-ai-btn { position:relative; transition: background 0.3s; }
        .spn-ai-btn:hover .spn-ai-text {
          filter: drop-shadow(0 0 10px rgba(201,89,221,0.7)) drop-shadow(0 0 20px rgba(8,148,255,0.4)) !important;
          animation: none !important;
        }
        .spn-ai-btn:hover { background: rgba(201,89,221,0.08) !important; }

        /* ── Mobile drawer ── */
        .spn-drawer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 49;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.42s cubic-bezier(0.16,1,0.3,1);
        }
        .spn-drawer.open {
          max-height: 400px;
        }
        .spn-drawer-inner {
          padding: 5rem 1.5rem 1.5rem;
          background: rgba(4,4,10,0.96);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* ── Hamburger ── */
        .spn-ham {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(237,233,227,0.05);
          border: 1px solid rgba(237,233,227,0.08);
          cursor: pointer;
          padding: 0 9px;
          transition: background 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .spn-ham:hover {
          background: rgba(237,233,227,0.09);
          border-color: rgba(237,233,227,0.15);
        }
        .spn-ham-line {
          height: 1.5px;
          border-radius: 2px;
          background: rgba(237,233,227,0.7);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s, width 0.35s;
          transform-origin: center;
        }
        .spn-ham.active .spn-ham-line:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .spn-ham.active .spn-ham-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .spn-ham.active .spn-ham-line:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── Drawer items ── */
        .spn-drawer-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.2s;
          border: 1px solid transparent;
        }
        .spn-drawer-link:active { opacity: 0.7; }

        /* ── Overlay backdrop ── */
        .spn-backdrop {
          position: fixed;
          inset: 0;
          top: 0;
          z-index: 48;
          background: rgba(0,0,0,0);
          pointer-events: none;
          transition: background 0.3s;
        }
        .spn-backdrop.open {
          background: rgba(0,0,0,0.45);
          pointer-events: auto;
        }

        /* ── Header transition ── */
        .spn-header-full {
          transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1),
                      background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, padding 0.4s ease;
        }
        /* Scrolled past hero: show frosted glass bar */
        .spn-header-full.spn-scrolled {
          background: rgba(4,4,10,0.85) !important;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 40px rgba(0,0,0,0.5);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
        }

        @media (min-width: 768px) {
          .spn-ham { display: none; }
          .spn-drawer { display: none !important; }
          .spn-backdrop { display: none !important; }
          .spn-desktop-right { display: flex !important; }
          .spn-mobile-right { display: none !important; }
        }
        @media (max-width: 767px) {
          .spn-desktop-right { display: none !important; }
          .spn-mobile-right { display: flex !important; }
        }

      `}</style>

      {/* ── Fixed top bar — transparent wrapper, pill floats inside ── */}
      <header className={`spn-header-full ${scrolled ? 'spn-scrolled' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'transparent',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'0.625rem', textDecoration:'none', flexShrink:0 }}>
          <div style={{ position:'relative', width:32, height:32, flexShrink:0 }}>
            <Image src="/motion_grace_logo.png" alt="Motion Grace" fill
              style={{ objectFit:'contain', filter:'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize:'0.875rem', fontWeight:700, letterSpacing:'-0.01em', color:'#ffffff', display:'none' }}
            className="sm:block">
            <span>Motion</span><span>Grace</span>
          </span>
        </Link>

        {/* Desktop center pill nav — All Services + service links + AI Strategist all inside one pill */}
        <nav className="spn-desktop-right" style={{ alignItems:'center', gap:'0.25rem' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:0,
            padding:'0.375rem 0.5rem', borderRadius:9999,
            background:'rgba(4,4,10,0.75)',
            backdropFilter:'blur(24px) saturate(1.6)', WebkitBackdropFilter:'blur(24px) saturate(1.6)',
            border:'1px solid rgba(237,233,227,0.08)',
            boxShadow:'0 4px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(237,233,227,0.03) inset',
          }}>
            {/* All Services — first item inside pill */}
            <Link href="/#services"
              style={{ fontSize:'0.625rem', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase',
                color:'rgba(237,233,227,0.4)', textDecoration:'none', padding:'0.375rem 1rem',
                borderRadius:9999, transition:'color 0.5s, background 0.5s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(237,233,227,0.75)'; (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(237,233,227,0.4)'; (e.currentTarget as HTMLAnchorElement).style.background='transparent'; }}
            >
              ← All Services
            </Link>
            {/* Thin divider */}
            <div style={{ width:1, height:14, background:'rgba(237,233,227,0.1)', flexShrink:0 }} />
            <Link href="/services/infinite-asset-kit"
              style={{ fontSize:'0.625rem', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase',
                color:'rgba(237,233,227,0.65)', textDecoration:'none', padding:'0.375rem 1rem',
                borderRadius:9999, transition:'color 0.5s, background 0.5s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='#EDE9E3'; (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(237,233,227,0.65)'; (e.currentTarget as HTMLAnchorElement).style.background='transparent'; }}
            >
              Asset Kit
            </Link>
            <Link href="/services/cinematic-product-commercials"
              style={{ fontSize:'0.625rem', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase',
                color:'rgba(237,233,227,0.65)', textDecoration:'none', padding:'0.375rem 1rem',
                borderRadius:9999, transition:'color 0.5s, background 0.5s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='#EDE9E3'; (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(237,233,227,0.65)'; (e.currentTarget as HTMLAnchorElement).style.background='transparent'; }}
            >
              Commercials
            </Link>
            <Link href="/services/interactive-3d"
              style={{ fontSize:'0.625rem', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase',
                color:'rgba(237,233,227,0.65)', textDecoration:'none', padding:'0.375rem 1rem',
                borderRadius:9999, transition:'color 0.5s, background 0.5s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='#EDE9E3'; (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(237,233,227,0.65)'; (e.currentTarget as HTMLAnchorElement).style.background='transparent'; }}
            >
              Interactive 3D
            </Link>
            <a href={AI_STRATEGIST_HREF} target="_blank" rel="noopener noreferrer"
              className="spn-ai-btn"
              style={{ fontSize:'0.625rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase',
                textDecoration:'none', padding:'0.375rem 1rem', borderRadius:9999, background:'transparent' }}
            >
              <span className="spn-ai-text">AI Strategist</span>
            </a>
          </div>
        </nav>

        {/* Right side: Start Project + mobile hamburger */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {/* Start Project — desktop */}
          <a href="mailto:hello@motiongrace.com"
            className="spn-desktop-right"
            style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase',
              color: accentColor, textDecoration:'none', padding:'0.625rem 1.25rem', borderRadius:9999,
              border:`1px solid rgba(${accentRgb},0.3)`, background:`rgba(${accentRgb},0.06)`,
              backdropFilter:'blur(16px) saturate(1.2)', WebkitBackdropFilter:'blur(16px) saturate(1.2)',
              transition:'all 0.25s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background=`rgba(${accentRgb},0.14)`; (e.currentTarget as HTMLAnchorElement).style.borderColor=`rgba(${accentRgb},0.55)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background=`rgba(${accentRgb},0.06)`; (e.currentTarget as HTMLAnchorElement).style.borderColor=`rgba(${accentRgb},0.3)`; }}
          >
            Start Project
          </a>

          {/* Mobile: Start Project pill + hamburger */}
          <div className="spn-mobile-right" style={{ alignItems:'center', gap:'0.5rem' }}>
            <a href="mailto:hello@motiongrace.com"
              style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
                color: accentColor, textDecoration:'none', padding:'0.3rem 0.75rem', borderRadius:999,
                border:`1px solid rgba(${accentRgb},0.35)`, background:`rgba(${accentRgb},0.07)` }}
            >
              Start Project
            </a>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`spn-ham ${menuOpen ? 'active' : ''}`}
              aria-label="Toggle menu"
            >
              <div className="spn-ham-line" />
              <div className="spn-ham-line" />
              <div className="spn-ham-line" />
            </button>
          </div>
        </div>

        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`spn-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="spn-drawer-inner">

          {/* All Services */}
          <Link href="/#services" onClick={() => setMenuOpen(false)}
            className="spn-drawer-link"
            style={{ background:'rgba(237,233,227,0.04)', borderColor:'rgba(237,233,227,0.07)' }}
          >
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(237,233,227,0.06)',
              border:'1px solid rgba(237,233,227,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="rgba(237,233,227,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#EDE9E3', letterSpacing:'-0.01em' }}>All Services</p>
              <p style={{ fontSize:'0.65rem', color:'rgba(237,233,227,0.35)', marginTop:1 }}>Back to services overview</p>
            </div>
          </Link>

          {/* Service page links */}
          <Link href="/services/infinite-asset-kit" onClick={() => setMenuOpen(false)}
            className="spn-drawer-link"
            style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }}
          >
            <div>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#ffffff', letterSpacing:'-0.01em' }}>Asset Kit</p>
            </div>
          </Link>
          <Link href="/services/cinematic-product-commercials" onClick={() => setMenuOpen(false)}
            className="spn-drawer-link"
            style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }}
          >
            <div>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#ffffff', letterSpacing:'-0.01em' }}>Commercials</p>
            </div>
          </Link>
          <Link href="/services/interactive-3d" onClick={() => setMenuOpen(false)}
            className="spn-drawer-link"
            style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }}
          >
            <div>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#ffffff', letterSpacing:'-0.01em' }}>Interactive 3D</p>
            </div>
          </Link>

          {/* AI Strategist */}
          <a href={AI_STRATEGIST_HREF} target="_blank" rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="spn-drawer-link"
            style={{ background:'rgba(201,89,221,0.05)', borderColor:'rgba(201,89,221,0.12)' }}
          >
            <div style={{ width:34, height:34, borderRadius:10,
              background:'linear-gradient(135deg,rgba(8,148,255,0.15),rgba(201,89,221,0.15))',
              border:'1px solid rgba(201,89,221,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#aiGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#aiGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0894ff"/>
                    <stop offset="50%" stopColor="#c959dd"/>
                    <stop offset="100%" stopColor="#ff9004"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span className="spn-ai-text" style={{ fontSize:'0.78rem', fontWeight:700, letterSpacing:'-0.01em' }}>AI Strategist</span>
              <p style={{ fontSize:'0.65rem', color:'rgba(237,233,227,0.35)', marginTop:1 }}>Open AI planning tool ↗</p>
            </div>
          </a>

          {/* Divider */}
          <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'0.25rem 0' }} />

          {/* Scroll to Hero */}
          <button onClick={scrollToHero}
            className="spn-drawer-link"
            style={{ width:'100%', textAlign:'left', cursor:'pointer', background:`rgba(${accentRgb},0.05)`,
              border:`1px solid rgba(${accentRgb},0.14)` }}
          >
            <div style={{ width:34, height:34, borderRadius:10, background:`rgba(${accentRgb},0.1)`,
              border:`1px solid rgba(${accentRgb},0.2)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7-7 7 7" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#EDE9E3', letterSpacing:'-0.01em' }}>Back to Top</p>
              <p style={{ fontSize:'0.65rem', color:'rgba(237,233,227,0.35)', marginTop:1 }}>Scroll to hero section</p>
            </div>
          </button>

        </div>
      </div>

      {/* ── Backdrop ── */}
      <div
        className={`spn-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />


    </>
  );
}