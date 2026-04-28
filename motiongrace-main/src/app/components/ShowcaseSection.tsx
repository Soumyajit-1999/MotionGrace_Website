'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const showcaseItems = [
  {
    id: 1,
    image: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298360/Exploded_003_ynbnau.gif',
    mediaType: 'gif' as const,
    alt: 'Exploded product view',
    accent: '#C9A96E', accentRgb: '201,169,110', depth: 0,
  },
  {
    id: 2,
    image: 'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777298274/asset4_zw2lyr.mov',
    mediaType: 'video' as const,
    alt: 'Asset video',
    accent: '#4A9EFF', accentRgb: '74,158,255', depth: 1,
  },
  {
    id: 3,
    image: 'https://res.cloudinary.com/ddgyx80f6/image/upload/v1777298110/002.1_rm3dok.gif',
    mediaType: 'gif' as const,
    alt: 'Product animation',
    accent: '#8B5CF6', accentRgb: '139,92,246', depth: 2,
  },
  {
    id: 4,
    image: 'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297860/Lipstick_ymuas8.mp4',
    mediaType: 'video' as const,
    alt: 'Lipstick product video',
    accent: '#E879A0', accentRgb: '232,121,160', depth: 1,
  },
  {
    id: 5,
    image: 'https://res.cloudinary.com/ddgyx80f6/video/upload/v1777297901/gel_pour_r64tpy.mp4',
    mediaType: 'video' as const,
    alt: 'Gel pour video',
    accent: '#34D399', accentRgb: '52,211,153', depth: 2,
  },
];

type Item = typeof showcaseItems[0];


// ─── MediaBackground ──────────────────────────────────────────────────────────
// active = true  → video plays / GIF animates
// active = false → video paused on first frame / GIF frozen via canvas snapshot
const MediaBackground = React.memo(function MediaBackground({
  item, mediaRef, active,
}: {
  item: Item;
  mediaRef: React.MutableRefObject<HTMLVideoElement | HTMLImageElement | null>;
  active: boolean;
}) {
  const shared: React.CSSProperties = {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  };

  // ── Video: play/pause driven by active prop ──────────────────────────────
  useEffect(() => {
    if (item.mediaType !== 'video') return;
    const v = mediaRef.current as HTMLVideoElement | null;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, item.mediaType, mediaRef]);

  if (item.mediaType === 'video') {
    return (
      <video
        ref={mediaRef as React.MutableRefObject<HTMLVideoElement>}
        src={item.image}
        loop muted playsInline disablePictureInPicture
        // preload="auto" so first frame is ready before hover
        preload="auto"
        style={{ ...shared, transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      />
    );
  }

  // ── GIF: swap src to freeze/animate ─────────────────────────────────────
  // Browsers have no native "pause GIF" API. The standard trick:
  // while idle, point src at a canvas-captured still of the first frame.
  // On hover, restore the real GIF src — animation restarts from frame 1.
  const gifRef   = useRef<HTMLImageElement>(null);
  const stillRef = useRef<string>('');   // blob URL of the frozen first frame
  const realSrc  = item.image;

  // Capture the first frame as a blob URL once the image loads
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || 400;
        c.height = img.naturalHeight || 400;
        c.getContext('2d')?.drawImage(img, 0, 0);
        c.toBlob(blob => {
          if (blob) stillRef.current = URL.createObjectURL(blob);
          // Start frozen
          if (gifRef.current && stillRef.current) {
            gifRef.current.src = stillRef.current;
          }
        }, 'image/png');
      } catch {
        // Cross-origin canvas taint — fall back to keeping the real src (GIF plays)
      }
    };
    img.src = realSrc;
    return () => { if (stillRef.current) URL.revokeObjectURL(stillRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realSrc]);

  // Swap between still and animated src based on active
  useEffect(() => {
    const el = gifRef.current;
    if (!el) return;
    if (active) {
      // Restore real GIF — append cache-buster so browser re-fetches from
      // cache and restarts animation from frame 1 (already cached, no network hit)
      el.src = realSrc + (realSrc.includes('?') ? '&_p=1' : '?_p=1');
    } else {
      if (stillRef.current) el.src = stillRef.current;
    }
  }, [active, realSrc]);

  return (
    <img
      ref={(el) => {
        gifRef.current = el;
        (mediaRef as React.MutableRefObject<HTMLImageElement | null>).current = el;
      }}
      src={realSrc}   // initial src — will be swapped to still once canvas captures
      alt={item.alt}
      style={{ ...shared, transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    />
  );
});

// ─── ShowcaseCard ─────────────────────────────────────────────────────────────
const ShowcaseCard = React.memo(function ShowcaseCard({
  item, index, gsapRef, onEnter, onLeave,
}: {
  item: Item;
  index: number;
  gsapRef: React.MutableRefObject<typeof import('gsap').gsap | null>;
  onEnter: (id: number, wrapperEl: HTMLElement) => void;
  onLeave:  (wrapperEl: HTMLElement) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const mediaRef   = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  // active drives MediaBackground play/pause directly — no parent video juggling needed
  const [active, setActive] = useState(false);

  const floatAmplitude = [22, 34, 44][item.depth];
  const floatDuration  = [5.5, 6.8, 5.0][item.depth];
  const floatDelay     = -(index % 5) * 0.9;

  // ── GSAP hover-in: scale up + activate media ────────────────────────────
  const playHoverIn = useCallback(() => {
    const g = gsapRef.current;
    if (!g || !wrapperRef.current || !cardRef.current) return;
    setActive(true);
    g.to(wrapperRef.current, {
      width: 'clamp(480px,46vw,620px)',
      duration: 0.65, ease: 'power3.out', overwrite: 'auto',
    });
    g.to(cardRef.current, {
      height: 'clamp(420px,55vw,560px)',
      duration: 0.65, ease: 'power3.out', overwrite: 'auto',
    });
  }, [gsapRef]);

  // ── GSAP hover-out: shrink + deactivate media ───────────────────────────
  const playHoverOut = useCallback(() => {
    const g = gsapRef.current;
    if (!g || !wrapperRef.current || !cardRef.current) return;
    setActive(false);
    g.to(wrapperRef.current, {
      width: 'clamp(260px,26vw,340px)',
      duration: 0.6, ease: 'power3.out', overwrite: 'auto',
    });
    g.to(cardRef.current, {
      height: 'clamp(340px,44vw,460px)',
      duration: 0.6, ease: 'power3.out', overwrite: 'auto',
    });
  }, [gsapRef]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    (wrapperRef.current as any).__hoverIn  = playHoverIn;
    (wrapperRef.current as any).__hoverOut = playHoverOut;
  }, [playHoverIn, playHoverOut]);

  return (
    <div
      ref={wrapperRef}
      data-showcase-wrapper="true"
      onMouseEnter={() => onEnter(item.id, wrapperRef.current!)}
      onMouseLeave={() => onLeave(wrapperRef.current!)}
      style={{
        flexShrink: 0,
        width: 'clamp(260px,26vw,340px)',
        contain: 'layout style',
        transform: 'translateZ(0)',
        zIndex: 1, position: 'relative',
        animation: `card-float ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${floatDelay}s`,
        ['--float-y' as any]: `${floatAmplitude}px`,
      }}
    >
      <div
        ref={cardRef}
        style={{
          position: 'relative', borderRadius: '18px', overflow: 'hidden',
          height: 'clamp(340px,44vw,460px)',
          border: `1px solid rgba(${item.accentRgb},0.09)`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          isolation: 'isolate',
          // Smooth scale hint for GPU — only on the card, not every wrapper
          willChange: 'width, height',
        }}
      >
        <MediaBackground item={item} mediaRef={mediaRef} active={active} />
        {/* Subtle radial vignette to give depth without extra layers */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,2,8,0.5) 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />
      </div>
    </div>
  );
});

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = React.memo(function MobileCard({ item, index, isActive }: { item: Item; index: number; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play/pause based on active state to avoid concurrent video decoding
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <div style={{ flexShrink: 0, width: '100%', scrollSnapAlign: 'center' }}>
      <div style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden',
        height: '72vw', maxHeight: '420px', minHeight: '260px',
        border: `1px solid rgba(${item.accentRgb},0.14)`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(${item.accentRgb},0.07)`,
        isolation: 'isolate',
      }}>
        {item.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={item.image}
            loop muted playsInline disablePictureInPicture
            preload={index === 0 ? 'metadata' : 'none'}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transform:'translateZ(0)' }}
          />
        ) : (
          <img src={item.image} alt={item.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transform:'translateZ(0)' }}
          />
        )}

        {/* Bottom gradient */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(2,2,8,0.65) 0%, transparent 55%)', pointerEvents:'none' }} />
        {/* Accent bottom glow */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'35%', background:`linear-gradient(to top, rgba(${item.accentRgb},0.09), transparent)`, pointerEvents:'none' }} />

        {/* Corner brackets */}
        {([
          { top:12,    left:12,  borderTop:`1px solid rgba(${item.accentRgb},0.45)`,    borderLeft:`1px solid rgba(${item.accentRgb},0.45)`  },
          { top:12,    right:12, borderTop:`1px solid rgba(${item.accentRgb},0.45)`,    borderRight:`1px solid rgba(${item.accentRgb},0.45)` },
          { bottom:12, left:12,  borderBottom:`1px solid rgba(${item.accentRgb},0.45)`, borderLeft:`1px solid rgba(${item.accentRgb},0.45)`  },
          { bottom:12, right:12, borderBottom:`1px solid rgba(${item.accentRgb},0.45)`, borderRight:`1px solid rgba(${item.accentRgb},0.45)` },
        ] as React.CSSProperties[]).map((s, i) => (
          <div key={i} style={{ position:'absolute', width:14, height:14, pointerEvents:'none', ...s }} />
        ))}

        {/* Counter badge */}
        <div style={{
          position:'absolute', top:13, right:13,
          fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase',
          color:`rgba(${item.accentRgb},0.85)`,
          background:`rgba(${item.accentRgb},0.09)`,
          border:`1px solid rgba(${item.accentRgb},0.22)`,
          padding:'3px 9px', borderRadius:4,
          backdropFilter:'blur(8px)',
        }}>
          {index + 1} / {showcaseItems.length}
        </div>
      </div>
    </div>
  );
});

// ─── Mobile Carousel ──────────────────────────────────────────────────────────
function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive(Math.max(0, Math.min(idx, showcaseItems.length - 1)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Scrollable track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        className="mobile-carousel-track"
      >
        {showcaseItems.map((item, i) => (
          <MobileCard key={item.id} item={item} index={i} isActive={i === active} />
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'8px', marginTop:'20px' }}>
        {showcaseItems.map((item, i) => (
          <button
            key={item.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: active === i ? '24px' : '7px',
              height: '7px',
              borderRadius: '4px',
              background: active === i ? item.accent : 'rgba(237,233,227,0.18)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease',
              boxShadow: active === i ? `0 0 10px rgba(${item.accentRgb},0.5)` : 'none',
            }}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p style={{
        textAlign:'center', marginTop:'12px',
        fontSize:'9px', letterSpacing:'0.22em', textTransform:'uppercase',
        color:'rgba(237,233,227,0.18)',
      }}>
        Swipe to explore
      </p>
    </div>
  );
}

// ─── ShowcaseSection ──────────────────────────────────────────────────────────
export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const btnRef     = useRef<HTMLDivElement>(null);

  const gsapRef = useRef<typeof import('gsap').gsap | null>(null);

  const hoveredWrapperRef = useRef<HTMLElement | null>(null);
  const pendingIdRef      = useRef<number | null>(null);
  const switchTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null); // NEW: track leave timer separately

  const animFrameRef  = useRef<number>(0);
  const currentXRef   = useRef(0);
  const targetXRef    = useRef(0);
  const isPausedRef   = useRef(false);
  const velocityRef   = useRef(1);
  const arrowSpeedRef = useRef(0);
  const holdLRef      = useRef(false);
  const holdRRef      = useRef(false);

  const [sectionVisible, setSectionVisible] = useState(false);
  const [leftActive,  setLeftActive]  = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const handleEnter = useCallback((id: number, wrapperEl: HTMLElement) => {
    // FIX: pause carousel immediately
    isPausedRef.current = true;

    // Clear any pending leave timer — we're hovering again
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    pendingIdRef.current = id;
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

    // FIX card-to-card flicker: fire hoverOut on prev and hoverIn on next in
    // the same synchronous call. The old 28 ms setTimeout left both cards in
    // their resting state for ~2 frames, causing a visible flash.
    const g = gsapRef.current;
    if (!g) {
      // gsap not ready yet — tiny one-frame retry, no visible delay
      switchTimerRef.current = setTimeout(() => {
        const g2 = gsapRef.current;
        if (!g2) return;
        if (hoveredWrapperRef.current && hoveredWrapperRef.current !== wrapperEl) {
          const prevOut = (hoveredWrapperRef.current as any).__hoverOut;
          if (prevOut) prevOut();
        }
        hoveredWrapperRef.current = wrapperEl;
        const hoverIn = (wrapperEl as any).__hoverIn;
        if (hoverIn) hoverIn();
      }, 0);
      return;
    }

    if (hoveredWrapperRef.current && hoveredWrapperRef.current !== wrapperEl) {
      const prevOut = (hoveredWrapperRef.current as any).__hoverOut;
      if (prevOut) prevOut();
    }
    hoveredWrapperRef.current = wrapperEl;
    const hoverIn = (wrapperEl as any).__hoverIn;
    if (hoverIn) hoverIn();
  }, []);

  const handleLeave = useCallback((_wrapperEl: HTMLElement) => {
    // Clear any pending enter timer
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    
    pendingIdRef.current = null;
    
    // FIX #2: Clear existing leave timer to prevent race conditions
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    
    leaveTimerRef.current = setTimeout(() => {
      // Guard: Only proceed if no new card is pending
      if (pendingIdRef.current !== null) return;
      
      if (hoveredWrapperRef.current) {
        const hoverOut = (hoveredWrapperRef.current as any).__hoverOut;
        if (hoverOut) hoverOut();
      }
      hoveredWrapperRef.current = null;
      
      setTimeout(() => {
        if (!hoveredWrapperRef.current && !pendingIdRef.current) {
          isPausedRef.current = false;
        }
      }, 50);
      
      leaveTimerRef.current = null;
    }, 40);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    let mounted = true;
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (!mounted || !sectionRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef.current = gsap;

      ScrollTrigger.create({
        trigger: sectionRef.current, start: 'top 88%', once: true,
        onEnter: () => setSectionVisible(true),
      });
      if (headerRef.current) {
        const kids = Array.from(headerRef.current.children) as HTMLElement[];
        gsap.fromTo(kids,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 88%', once: true } }
        );
      }
      if (btnRef.current) {
        gsap.fromTo(btnRef.current,
          { autoAlpha: 0, y: 20, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: btnRef.current, start: 'top 95%', once: true } }
        );
      }
      ScrollTrigger.refresh();
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const BASE = 0.42, AMAX = 6, AACC = 0.18, ADEC = 0.88;
    let last = 0, inView = true;
    const observer = new IntersectionObserver(
      ([entry]) => { inView = entry.isIntersecting; }, { threshold: 0 }
    );
    if (trackRef.current) observer.observe(trackRef.current);

    const loop = (t: number) => {
      animFrameRef.current = requestAnimationFrame(loop);
      if (document.hidden || !inView) return;
      const dt = Math.min(t - last, 50); last = t;
      if (!trackRef.current) return;
      const tw = trackRef.current.scrollWidth / 2;

      if      (holdRRef.current) arrowSpeedRef.current = Math.min(arrowSpeedRef.current + AACC,  AMAX);
      else if (holdLRef.current) arrowSpeedRef.current = Math.max(arrowSpeedRef.current - AACC, -AMAX);
      else {
        arrowSpeedRef.current *= ADEC;
        if (Math.abs(arrowSpeedRef.current) < 0.02) arrowSpeedRef.current = 0;
      }
      velocityRef.current = isPausedRef.current
        ? Math.max(velocityRef.current - 0.05, 0)
        : Math.min(velocityRef.current + 0.02, 1);

      targetXRef.current  = (targetXRef.current + BASE * (dt/16) * velocityRef.current + arrowSpeedRef.current * (dt/16) + tw) % tw;
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.07;
      if (currentXRef.current < 0) currentXRef.current += tw;
      trackRef.current.style.transform = `translateX(-${currentXRef.current}px)`;
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animFrameRef.current); observer.disconnect(); };
  }, []);

  const startLeft  = useCallback(() => { holdLRef.current = true;  holdRRef.current = false; setLeftActive(true);  setRightActive(false); }, []);
  const startRight = useCallback(() => { holdRRef.current = true;  holdLRef.current = false; setRightActive(true); setLeftActive(false);  }, []);
  const stopArrows = useCallback(() => { holdLRef.current = false; holdRRef.current = false; setLeftActive(false); setRightActive(false); }, []);

  const allItems = [...showcaseItems, ...showcaseItems];

  const ArrowBtn = ({ dir }: { dir: 'left' | 'right' }) => {
    const isLeft = dir === 'left', isActive = isLeft ? leftActive : rightActive;
    return (
      <button
        onMouseDown={isLeft ? startLeft : startRight}
        onMouseUp={stopArrows} onMouseLeave={stopArrows}
        onTouchStart={e => { e.preventDefault(); isLeft ? startLeft() : startRight(); }}
        onTouchEnd={stopArrows}
        aria-label={isLeft ? 'Scroll left' : 'Scroll right'}
        style={{
          position:'absolute', top:'50%', [isLeft ? 'left' : 'right']:'16px',
          zIndex:30, width:'48px', height:'48px', borderRadius:'50%',
          border:`1px solid rgba(201,169,110,${isActive ? 0.6 : 0.2})`,
          background: isActive ? 'rgba(201,169,110,0.15)' : 'rgba(8,10,22,0.7)',
          backdropFilter:'blur(12px)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'border-color 0.2s, background 0.2s, box-shadow 0.2s',
          transform:`translateY(-50%) scale(${isActive ? 0.93 : 1})`,
          boxShadow: isActive
            ? '0 0 24px rgba(201,169,110,0.25),inset 0 0 12px rgba(201,169,110,0.08)'
            : '0 4px 20px rgba(0,0,0,0.5)',
          userSelect:'none', WebkitUserSelect:'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {isLeft
            ? <path d="M11 4L6 9L11 14" stroke={`rgba(201,169,110,${isActive ? 1 : 0.6})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            : <path d="M7 4L12 9L7 14"  stroke={`rgba(201,169,110,${isActive ? 1 : 0.6})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          }
        </svg>
      </button>
    );
  };

  return (
    <section
      ref={sectionRef}
      data-gsap-section="default"
      className="relative overflow-hidden py-28 sm:py-40"
      style={{ background: 'linear-gradient(180deg, #020208 0%, #04040c 50%, #030309 100%)' }}
    >
      {/* Background streaks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top:'18%', left:'-8%',  w:'55%', rot:'-7deg', color:'201,169,110', delay:'0s' },
          { top:'65%', right:'-8%', w:'45%', rot:'5deg',  color:'74,158,255',  delay:'3s' },
          { top:'42%', left:'20%',  w:'30%', rot:'-3deg', color:'139,92,246',  delay:'6s' },
        ].map((s, i) => (
          <div key={i} style={{
            position:'absolute', top:s.top, left:(s as any).left, right:(s as any).right,
            width:s.w, height:'1px',
            background:`linear-gradient(90deg, transparent, rgba(${s.color},0.1), transparent)`,
            transform:`rotate(${s.rot})`,
            animation:'streak 10s ease-in-out infinite', animationDelay:s.delay,
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:`linear-gradient(rgba(201,169,110,0.012) 1px, transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.012) 1px,transparent 1px)`,
        backgroundSize:'100px 100px',
      }} />

      {/* Header */}
      <div ref={headerRef} className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 mb-16">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ height:'1px', width:'28px', background:'rgba(201,169,110,0.5)' }} />
              <span style={{ fontSize:'9px', letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(201,169,110,0.55)' }}>Selected Work</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,5vw,3.5rem)', fontWeight:900, letterSpacing:'-0.045em', lineHeight:1, margin:0 }}>
              <span style={{ color:'rgba(237,233,227,0.9)' }}>See What&apos;s </span>
              <span style={{ background:'linear-gradient(135deg,#8B6F3E 0%,#F2E4C4 40%,#D4A96A 70%,#C9956E 100%)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>Possible</span>
            </h2>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div style={{ display:'flex', alignItems:'baseline', gap:'0.3rem' }}>
              <span style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-0.04em', background:'linear-gradient(135deg,#C9A96E,#f0d49a)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>48+</span>
              <span style={{ fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(237,233,227,0.25)' }}>Projects</span>
            </div>
            <p style={{ fontSize:'11px', color:'rgba(237,233,227,0.22)', letterSpacing:'0.06em', margin:0 }}>Where beauty meets computation</p>
          </div>
        </div>
      </div>

      {/* Catalog label */}
      <div style={{ textAlign:'center', marginBottom:'1.5rem', opacity: sectionVisible ? 0.4 : 0, transition:'opacity 0.6s ease' }}>
        <span style={{ fontSize:'9px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(237,233,227,0.4)' }}>Catalog</span>
      </div>

      {/* ── Desktop carousel ── */}
      <div className="hidden sm:block" style={{ position:'relative' }}>
        <ArrowBtn dir="left" />
        <ArrowBtn dir="right" />
        <div style={{
          position:'relative', width:'100%', overflow:'hidden',
          maskImage:'linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)',
          WebkitMaskImage:'linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)',
          paddingTop:'80px', paddingBottom:'96px',
        }}>
          <div ref={trackRef} style={{ display:'flex', gap:'14px', paddingLeft:'24px', willChange:'transform', alignItems:'center' }}>
            {allItems.map((item, i) => (
              <ShowcaseCard
                key={`${item.id}-${i}`}
                item={item}
                index={i}
                gsapRef={gsapRef}
                onEnter={handleEnter}
                onLeave={handleLeave}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile carousel ── */}
      <div className="sm:hidden px-5">
        <MobileCarousel />
      </div>

      {/* CTA */}
      <div ref={btnRef} style={{ display:'flex', justifyContent:'center', marginTop:'28px', position:'relative', zIndex:10 }}>
        <a href="https://app.motiongraceco.com/gallery" target="_blank" rel="noopener noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:'12px',
          padding:'14px 32px', borderRadius:'999px',
          border:'1px solid rgba(201,169,110,0.28)',
          background:'rgba(201,169,110,0.06)',
          backdropFilter:'blur(12px)',
          color:'rgba(237,233,227,0.75)',
          fontSize:'10px', fontWeight:700, letterSpacing:'0.22em',
          textTransform:'uppercase', textDecoration:'none',
          transition:'border-color 0.3s,background 0.3s,color 0.3s,box-shadow 0.3s',
          cursor:'pointer',
        }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor='rgba(201,169,110,0.65)'; el.style.background='rgba(201,169,110,0.13)'; el.style.color='#C9A96E'; el.style.boxShadow='0 0 32px rgba(201,169,110,0.15)'; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor='rgba(201,169,110,0.28)'; el.style.background='rgba(201,169,110,0.06)'; el.style.color='rgba(237,233,227,0.75)'; el.style.boxShadow='none'; }}
        >
          <span>View more works</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity:0.7 }}>
            <path d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      <style>{`
        @keyframes streak    { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        @keyframes dot-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.7); } }
        @keyframes card-float {
          0%,100% { transform: translateZ(0) translateY(0px); }
          50%     { transform: translateZ(0) translateY(calc(-1 * var(--float-y))); }
        }
        [data-showcase-wrapper="true"]:hover { animation-play-state: paused; }
        .mobile-carousel-track::-webkit-scrollbar { display: none; }
        /* Disable float animation on touch devices — 10 concurrent CSS animations
           with composite transforms cause scroll jank on Snapdragon 7s Gen 3 */
        @media (hover: none), (pointer: coarse) {
          [data-showcase-wrapper="true"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}