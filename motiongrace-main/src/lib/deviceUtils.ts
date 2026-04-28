/**
 * deviceUtils.ts — shared device / performance-tier detection
 *
 * Tiers
 * ──────
 * mobile   → hover:none OR pointer:coarse (phones, most tablets)
 * low-end  → quad-core or ≤4 GB RAM desktop/laptop
 * mid-end  → ≤6 cores or ≤8 GB RAM (the main new tier — covers most mid-range laptops)
 * high-end → everything else
 *
 * Strategy: coarse + pointer catches touch devices; hardwareConcurrency /
 * deviceMemory catches underpowered desktops; prefers-reduced-motion is
 * always respected.
 */

export type DeviceTier = 'mobile' | 'low' | 'mid' | 'high';

let _tier: DeviceTier | null = null;

export function getDeviceTier(): DeviceTier {
  if (_tier) return _tier;
  if (typeof window === 'undefined') return 'high';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    _tier = 'low';
    return _tier;
  }

  const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isMobile) { _tier = 'mobile'; return _tier; }

  const cores  = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (cores <= 4 || memory <= 4) { _tier = 'low';  return _tier; }
  if (cores <= 6 || memory <= 8) { _tier = 'mid';  return _tier; }
  _tier = 'high';
  return _tier;
}

/** True for phones and tablets */
export function isReducedDevice(): boolean {
  return getDeviceTier() === 'mobile';
}

/** True for low-end desktops/laptops (not mobile) */
export function isLowEndDesktop(): boolean {
  return getDeviceTier() === 'low';
}

/**
 * Should we use the lite animation path?
 * True for: mobile, low-end, and mid-range desktops (the main change vs old code).
 * High-end gets full effects.
 */
export function useLiteAnimations(): boolean {
  const tier = getDeviceTier();
  return tier === 'mobile' || tier === 'low' || tier === 'mid';
}

/**
 * Should we skip expensive effects entirely?
 * Stricter than useLiteAnimations — mobile + low only.
 */
export function useMinimalAnimations(): boolean {
  const tier = getDeviceTier();
  return tier === 'mobile' || tier === 'low';
}
