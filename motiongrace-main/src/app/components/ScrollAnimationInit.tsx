'use client';

import { useEffect } from 'react';

/**
 * ScrollAnimationInit
 * ────────────────────
 * Registers all GSAP scroll-driven entrance animations.
 *
 * Tiers:
 *  mobile  → simple fade-up only, no filter, no scale, minimal y
 *  low/mid → fade-up + slight y, no blur (filter compositing = GPU jank)
 *  high    → full effects with optional blur (high-end desktops only)
 *
 * Key mobile optimisations:
 *  - No filter: blur() at all (biggest GPU killer on mobile)
 *  - No parallax
 *  - Stagger reduced to 0.035s
 *  - Durations cut to 0.5–0.65s
 *  - will-change released after 2 s
 */
export default function ScrollAnimationInit() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile  = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1024px)').matches;
    const cores     = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8;
    const memory    = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const isLowEnd  = !isMobile && (cores <= 4 || memory <= 4);
    const isMidRange = !isMobile && !isLowEnd && (cores <= 6 || memory <= 8);
    const useBlur   = !isMobile && !isLowEnd && !isMidRange;  // high-end only
    const useLite   = isMobile || isLowEnd || isMidRange;

    let mounted  = true;
    let teardown = () => {};

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: 'DOMContentLoaded,load,visibilitychange',
      });

      const ctx = gsap.context(() => {

        /* ── Header entrance ── */
        gsap.fromTo(
          'header',
          { autoAlpha: 0, y: isMobile ? -10 : -18 },
          { autoAlpha: 1, y: 0, duration: isMobile ? 0.6 : 1, ease: 'power3.out', clearProps: 'transform' }
        );

        /* ── [data-reveal] elements ── */
        const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
        reveals.forEach((element) => {
          const type  = element.dataset.reveal ?? 'up';
          const delay = Number(element.dataset.delay ?? 0) / 1000;

          const fromVars: gsap.TweenVars = isMobile
            ? { autoAlpha: 0, y: 14 }
            : type === 'left'
              ? { autoAlpha: 0, x: -36, y: 0, scale: 1 }
              : type === 'right'
                ? { autoAlpha: 0, x: 36, y: 0, scale: 1 }
                : type === 'scale'
                  ? { autoAlpha: 0, x: 0, y: 18, scale: 0.94 }
                  : { autoAlpha: 0, x: 0, y: 28, scale: 1 };

          if (useBlur) {
            fromVars.filter = 'blur(10px)';
            fromVars.willChange = 'transform, opacity, filter';
          }

          const toVars: gsap.TweenVars = {
            autoAlpha  : 1,
            x          : 0,
            y          : 0,
            scale      : 1,
            duration   : useLite ? 0.6 : 1.1,
            delay,
            ease       : 'power3.out',
            scrollTrigger: {
              trigger: element,
              start  : 'top 90%',
              once   : true,
            },
          };
          if (useBlur) {
            toVars.filter = 'blur(0px)';
            toVars.clearProps = 'willChange';
          }

          gsap.fromTo(element, fromVars, toVars);
        });

        /* ── [data-gsap-section] blocks ── */
        const sections = gsap.utils.toArray<HTMLElement>('[data-gsap-section]');
        sections.forEach((section, index) => {
          const mode  = section.dataset.gsapSection ?? 'default';
          const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-gsap-card]'));
          const media = Array.from(section.querySelectorAll<HTMLElement>('[data-gsap-media]'));
          const glow  = section.querySelector<HTMLElement>('[data-gsap-glow]');

          if (mode !== 'sticky' && mode !== 'hero' && mode !== 'bridge') {
            gsap.fromTo(
              section,
              { autoAlpha: 0.75, y: useLite ? 8 : 28 },
              {
                autoAlpha : 1,
                y         : 0,
                duration  : useLite ? 0.55 : 1.1,
                ease      : 'power3.out',
                clearProps: 'transform',
                scrollTrigger: {
                  trigger: section,
                  start  : 'top 85%',
                  once   : true,
                },
              }
            );
          }

          if (cards.length > 0) {
            const cardFrom: gsap.TweenVars = { autoAlpha: 0, y: isMobile ? 10 : 22 };
            if (!isMobile && !isLowEnd) cardFrom.scale = 0.985;

            const cardTo: gsap.TweenVars = {
              autoAlpha: 1,
              y        : 0,
              scale    : 1,
              duration : useLite ? 0.5 : 0.95,
              stagger  : useLite ? 0.035 : 0.07,
              ease     : 'power3.out',
              scrollTrigger: {
                trigger: section,
                start  : 'top 80%',
                once   : true,
              },
            };
            gsap.fromTo(cards, cardFrom, cardTo);
          }

          /* Parallax — high-end desktops only */
          if (!isMobile && !isLowEnd && !isMidRange) {
            media.forEach((el) => {
              const speed = Number(el.dataset.gsapMedia ?? 10);
              gsap.to(el, {
                yPercent: speed,
                ease    : 'none',
                scrollTrigger: {
                  trigger: section,
                  start  : 'top bottom',
                  end    : 'bottom top',
                  scrub  : 1.4,
                },
              });
            });
          }

          /* Ambient glow pulse — high-end only */
          if (glow && !isMobile && !isLowEnd && !isMidRange) {
            gsap.fromTo(
              glow,
              { opacity: 0.45, scale: 0.94 },
              {
                opacity : 1,
                scale   : 1.06,
                duration: 2.4,
                ease    : 'sine.inOut',
                yoyo    : true,
                repeat  : -1,
                delay   : index * 0.08,
              }
            );
          }
        });

        /* ── [data-gsap-button] ── */
        gsap.utils.toArray<HTMLElement>('[data-gsap-button]').forEach((button, i) => {
          gsap.fromTo(
            button,
            { autoAlpha: 0, y: useLite ? 6 : 16, scale: useLite ? 1 : 0.96 },
            {
              autoAlpha: 1,
              y        : 0,
              scale    : 1,
              duration : useLite ? 0.4 : 0.8,
              delay    : i * 0.055,
              ease     : 'power3.out',
              scrollTrigger: {
                trigger: button,
                start  : 'top 92%',
                once   : true,
              },
            }
          );
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      /* Release GPU layers after animations complete */
      const releaseDelay = isMobile ? 1500 : 2500;
      const releaseTimer = setTimeout(() => {
        document.querySelectorAll<HTMLElement>('[data-reveal],[data-gsap-card]').forEach(el => {
          el.style.willChange = 'auto';
          // Also clear transform-style on mobile to free compositing layers
          if (isMobile) el.style.transform = '';
        });
      }, releaseDelay);

      teardown = () => {
        ctx.revert();
        clearTimeout(releaseTimer);
      };
    })();

    return () => {
      mounted = false;
      teardown();
    };
  }, []);

  return null;
}
