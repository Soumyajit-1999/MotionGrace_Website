'use client';

/**
 * LazySection
 * ─────────────
 * Mounts children only when the placeholder enters the viewport.
 * On mobile (hover:none / pointer:coarse) uses a larger rootMargin
 * so components start loading slightly before they're needed.
 *
 * Usage:
 *   <LazySection minHeight="100vh">
 *     <HeavyComponent />
 *   </LazySection>
 */

import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** CSS min-height for the placeholder before component mounts */
  minHeight?: string | number;
  /** Extra root margin override */
  rootMargin?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LazySection({
  children,
  minHeight = '400px',
  rootMargin,
  className,
  style,
}: LazySectionProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mobile: start loading 300px before viewport; desktop: 150px
    const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const margin   = rootMargin ?? (isMobile ? '300px' : '150px');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: mount ? undefined : minHeight, ...style }}
    >
      {mount ? children : null}
    </div>
  );
}
