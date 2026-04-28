'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type LenisInstance = {
  destroy: () => void;
  on: (event: 'scroll', callback: () => void) => void;
  off?: (event: 'scroll', callback: () => void) => void;
  raf: (time: number) => void;
  resize: () => void;
};

/**
 * SmoothScroll
 * ─────────────
 * Desktop  → Lenis smooth scroll synced with GSAP ticker + ScrollTrigger.
 * Mobile   → Native scroll with momentum-friendly CSS:
 *            - touch-action: pan-y
 *            - overscroll-behavior: contain
 *            - -webkit-overflow-scrolling: touch (Safari momentum)
 *            - will-change: scroll-position (GPU compositing hint)
 */
export default function SmoothScroll() {
  const pathname  = usePathname();
  const lenisRef  = useRef<LenisInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isNarrow       = window.innerWidth <= 1024;
    const isMobile       = isTouchDevice || isNarrow;

    /* ─── Mobile: native-scroll optimisations ─── */
    if (isMobile || prefersReduced) {
      (document.documentElement.style as any)['-webkit-overflow-scrolling'] = 'touch';
      document.body.style.touchAction = 'pan-y';
      document.body.style.overscrollBehaviorY = 'contain';
      // NOTE: will-change:scroll-position intentionally omitted — on low-RAM
      // devices it promotes the entire page to its own compositor layer and
      // increases memory pressure more than it saves.

      if (!prefersReduced) {
        void (async () => {
          const [{ gsap }, { ScrollTrigger }] = await Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger'),
          ]);
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.config({
            ignoreMobileResize: true,
            autoRefreshEvents: 'DOMContentLoaded,load,visibilitychange,resize',
          });
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            (window as any).__lenisReady = true;
            window.dispatchEvent(new CustomEvent('lenisReady'));
          });
        })();
      }

      return () => {
        document.body.style.touchAction = '';
        document.body.style.overscrollBehaviorY = '';
      };
    }

    /* ─── Desktop: Lenis + GSAP ─── */
    let mounted = true;
    let cleanup = () => {};

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      const cores   = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8;
      const memory  = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const isLow   = cores <= 4 || memory <= 4;
      const isMid   = !isLow && (cores <= 6 || memory <= 8);

      const lenis = new Lenis({
        lerp            : isLow ? 0.22 : isMid ? 0.16 : 0.1,
        smoothWheel     : true,
        syncTouch       : false,
        wheelMultiplier : 1.0,
        touchMultiplier : 2.0,
        autoRaf         : false,
        anchors         : true,
        autoResize      : true,
        allowNestedScroll: true,
        prevent: (node: HTMLElement) =>
          !!node.closest('.story-scroll-inner, [data-lenis-prevent], [data-lenis-prevent-wheel]'),
      });

      lenisRef.current = lenis as LenisInstance;

      const handleScroll      = () => ScrollTrigger.update();
      const handleTick        = (time: number) => lenis.raf(time * 1000);
      const handleRefresh     = () => lenis.resize();
      const handleVisibility  = () => {
        // Pause GSAP ticker (and therefore Lenis) while tab is hidden —
        // prevents rAF accumulation on low-end devices.
        if (document.hidden) gsap.ticker.sleep();
        else gsap.ticker.wake();
      };

      lenis.on('scroll', handleScroll);
      gsap.ticker.add(handleTick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.addEventListener('refresh', handleRefresh);
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: 'DOMContentLoaded,load,visibilitychange',
      });
      document.addEventListener('visibilitychange', handleVisibility);

      // Two-pass refresh: first rAF lets component useEffects register their
      // ScrollTriggers, second rAF ensures layout is fully committed.
      // Signal lenisReady AFTER the final refresh so HeroSection's ScrollTriggers
      // are measured against the correct layout.
      requestAnimationFrame(() => {
        lenis.resize();
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          (window as any).__lenisReady = true;
          window.dispatchEvent(new CustomEvent('lenisReady'));
        });
      });

      cleanup = () => {
        (window as any).__lenisReady = false;
        document.removeEventListener('visibilitychange', handleVisibility);
        ScrollTrigger.removeEventListener('refresh', handleRefresh);
        gsap.ticker.remove(handleTick);
        // lenis.off is typed optional — guard to avoid listener leak on older versions
        if (typeof lenis.off === 'function') lenis.off('scroll', handleScroll);
        lenis.destroy();
        lenisRef.current = null;
      };
    })();

    return () => {
      mounted = false;
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    requestAnimationFrame(() => lenisRef.current?.resize());
  }, [pathname]);

  return null;
}