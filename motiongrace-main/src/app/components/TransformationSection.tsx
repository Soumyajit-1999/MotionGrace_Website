'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { pricingPlans, type PricingPlan } from '@/app/pricing/pricingData';

// ─── Palette ──────────────────────────────────────────────────────────────────
const BF = ['#0894ff', '#c959dd', '#ff2e54', '#ff9004'] as const;
const BF_RGB = ['8,148,255', '201,89,221', '255,46,84', '255,144,4'] as const;

// ─── Currency config (INR is base — all rates are INR → target) ───────────────
type Currency = { code: string; symbol: string; rate: number };

// rate = how many target-currency units per 1 INR
const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹',   rate: 1          },
  { code: 'USD', symbol: '$',   rate: 1 / 93.5   },  // ~$0.0107 per ₹1
  { code: 'EUR', symbol: '€',   rate: 1 / 101.5  },
  { code: 'GBP', symbol: '£',   rate: 1 / 118.0  },
  { code: 'AED', symbol: 'AED', rate: 1 / 25.45  },
  { code: 'AUD', symbol: 'A$',  rate: 1 / 61.0   },
  { code: 'CAD', symbol: 'C$',  rate: 1 / 68.5   },
  { code: 'JPY', symbol: '¥',   rate: 93.5 / 152 },  // ₹1 = ¥0.615
];

// Exact INR prices — index 0 = Essentials, index 1 = Viral Impact
const PLAN_PRICES_BY_INDEX: number[] = [34999, 74999];
const PLAN_PRICES_BY_KEY: Record<string, number> = {
  essentials: 34999, essential: 34999,
  viral_impact: 74999, viralimpact: 74999, viral: 74999, signature: 74999,
};

function getPlanPriceINR(plan: PricingPlan, index: number): number {
  if (PLAN_PRICES_BY_INDEX[index] !== undefined) return PLAN_PRICES_BY_INDEX[index];
  const idKey   = (plan.id   ?? '').toLowerCase().replace(/[\s-]/g, '_');
  const nameKey = (plan.name ?? '').toLowerCase().trim();
  return PLAN_PRICES_BY_KEY[idKey] ?? PLAN_PRICES_BY_KEY[nameKey] ?? 34999;
}

function formatPrice(inr: number, currency: Currency): string {
  const val = inr * currency.rate;
  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(val).toLocaleString('en-IN')}`;
  }
  if (currency.code === 'INR') {
    return `${currency.symbol}${Math.round(val).toLocaleString('en-IN')}`;
  }
  return `${currency.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Upgrade stats ────────────────────────────────────────────────────────────
type UpgradeStat = {
  label: string; before: string; after: string;
  accent: string; accentRgb: string; kicker: string; icon: string;
};

const upgradeStats: UpgradeStat[] = [
  { label: 'Timeline',  before: '6 weeks',  after: '5 days',  accent: BF[0], accentRgb: BF_RGB[0], kicker: '12× faster', icon: '◷' },
  { label: 'Cost',      before: '$80k',     after: '$8k',     accent: BF[1], accentRgb: BF_RGB[1], kicker: '90% leaner', icon: '◈' },
  { label: 'Assets',    before: '20',       after: '100+',    accent: BF[2], accentRgb: BF_RGB[2], kicker: '5× output',  icon: '◫' },
  { label: 'Revisions', before: 'Reshoots', after: 'Instant', accent: BF[3], accentRgb: BF_RGB[3], kicker: 'Zero drag',  icon: '◎' },
];

// ─── Currency Selector ────────────────────────────────────────────────────────
function CurrencySelector({ currency, onChange }: { currency: Currency; onChange: (c: Currency) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(237,233,227,0.75)',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
          cursor: 'pointer', transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <span style={{ fontSize: '13px' }}>{currency.symbol}</span>
        <span>{currency.code}</span>
        <span style={{ fontSize: '8px', opacity: 0.5, marginLeft: '1px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, minWidth: '140px',
          background: 'rgba(8,8,18,0.96)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          animation: 'fadeInDown 0.15s ease',
        }}>
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 16px',
                background: currency.code === c.code ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: 'none', color: currency.code === c.code ? '#F7F1E2' : 'rgba(237,233,227,0.55)',
                fontSize: '12px', fontWeight: currency.code === c.code ? 700 : 500,
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = currency.code === c.code ? 'rgba(255,255,255,0.07)' : 'transparent'; }}
            >
              <span style={{ fontSize: '15px', minWidth: '20px' }}>{c.symbol}</span>
              <span>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PricingCard ──────────────────────────────────────────────────────────────
const PricingCard = React.memo(function PricingCard({
  plan, currency, index,
}: { plan: PricingPlan; currency: Currency; index: number }) {
  const isSignature = !!plan.badge;
  const inrVal = getPlanPriceINR(plan, index);
  const displayPrice = formatPrice(inrVal, currency);
  const suffix = plan.price.includes('/mo') ? '/mo' : plan.price.includes('/yr') ? '/yr' : '';

  return (
    <div style={{
      position: 'relative', borderRadius: '24px', overflow: 'hidden',
      border: '1px solid transparent',
      background: `
        linear-gradient(160deg, rgba(12,12,22,0.99) 0%, rgba(5,5,14,0.99) 100%) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.07) 0%, ${plan.accent}${isSignature ? '40' : '20'} 60%, rgba(255,255,255,0.03) 100%) border-box
      `,
      boxShadow: isSignature
        ? `0 0 0 1px ${plan.accent}18, 0 28px 56px rgba(0,0,0,0.45)`
        : '0 20px 40px rgba(0,0,0,0.35)',
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
      (e.currentTarget as HTMLElement).style.boxShadow = isSignature
        ? `0 0 0 1px ${plan.accent}30, 0 40px 70px rgba(0,0,0,0.55), 0 0 60px ${plan.accent}12`
        : '0 32px 64px rgba(0,0,0,0.50)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.boxShadow = isSignature
        ? `0 0 0 1px ${plan.accent}18, 0 28px 56px rgba(0,0,0,0.45)`
        : '0 20px 40px rgba(0,0,0,0.35)';
    }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${plan.accent}80, transparent)` }} />

      {/* Corner glow */}
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '55%', height: '55%', background: `radial-gradient(circle, ${plan.accent}10 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(32px)' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 36px)', display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${plan.accent}cc`, fontWeight: 800, marginBottom: '14px' }}>{plan.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.06em', color: '#F7F1E2', lineHeight: 1, transition: 'all 0.25s ease' }}>
                {displayPrice}
              </div>
              {suffix && <span style={{ fontSize: '13px', color: 'rgba(237,233,227,0.35)', fontWeight: 500 }}>{suffix}</span>}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(237,233,227,0.4)', marginTop: '8px', fontWeight: 400 }}>{plan.line}</div>
          </div>
          {plan.badge && (
            <div style={{
              padding: '5px 12px', borderRadius: '999px',
              background: `${plan.accent}15`, border: `1px solid ${plan.accent}30`,
              color: plan.accent, fontSize: '8px', letterSpacing: '0.22em',
              textTransform: 'uppercase', fontWeight: 800,
              boxShadow: `0 0 20px ${plan.accent}18`, flexShrink: 0,
            }}>
              {plan.badge}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${plan.accent}28, transparent 75%)`, marginBottom: '24px' }} />

        {/* Metrics */}
        {plan.metrics && plan.metrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plan.metrics.length}, 1fr)`, gap: '8px', marginBottom: '24px' }}>
            {plan.metrics.map((m) => (
              <div key={m.label} style={{
                borderRadius: '14px', padding: '14px 10px', textAlign: 'center',
                background: 'rgba(255,255,255,0.028)', border: `1px solid ${plan.accent}12`,
              }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F7F1E2', letterSpacing: '-0.03em' }}>{m.value}</div>
                <div style={{ fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: `${plan.accent}80`, marginTop: '4px' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {plan.features.map((f) => (
            <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '999px', flexShrink: 0, marginTop: '6px', background: plan.accent, boxShadow: `0 0 8px ${plan.accent}70` }} />
              <span style={{ fontSize: '12px', color: 'rgba(237,233,227,0.65)', lineHeight: 1.6 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {plan.turnaround && (
            <div style={{ fontSize: '9px', color: 'rgba(237,233,227,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>{plan.turnaround}</div>
          )}
          <div style={{ display: 'flex' }}>
            <Link href="https://www.motiongraceco.com/pricing" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 20px', borderRadius: '999px',
              border: `1px solid ${plan.accent}40`,
              background: `${plan.accent}10`,
              color: 'rgba(237,233,227,0.80)', fontSize: '9px',
              letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800,
              textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s, background 0.2s',
              flex: 1,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${plan.accent}70`;
              (e.currentTarget as HTMLElement).style.color = '#F7F1E2';
              (e.currentTarget as HTMLElement).style.background = `${plan.accent}1e`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${plan.accent}40`;
              (e.currentTarget as HTMLElement).style.color = 'rgba(237,233,227,0.80)';
              (e.currentTarget as HTMLElement).style.background = `${plan.accent}10`;
            }}
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── UpgradeCard ──────────────────────────────────────────────────────────────
const UpgradeCard = React.memo(function UpgradeCard({ stat }: { stat: UpgradeStat }) {
  return (
    <div style={{
      position: 'relative', borderRadius: '22px', overflow: 'hidden',
      border: `1px solid rgba(${stat.accentRgb},0.15)`,
      background: 'rgba(10,10,20,0.98)',
      padding: 'clamp(24px, 4vw, 36px)',
      boxShadow: `0 0 40px rgba(${stat.accentRgb},0.05)`,
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px rgba(${stat.accentRgb},0.12)`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px rgba(${stat.accentRgb},0.05)`;
    }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, rgba(${stat.accentRgb},0.5), transparent)` }} />
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', background: `radial-gradient(circle, rgba(${stat.accentRgb},0.08) 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(28px)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '14px', color: stat.accent }}>{stat.icon}</span>
            <span style={{ fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: `rgba(${stat.accentRgb},0.7)`, fontWeight: 800 }}>{stat.label}</span>
          </div>
          <div style={{ padding: '4px 9px', borderRadius: '999px', background: `rgba(${stat.accentRgb},0.1)`, border: `1px solid rgba(${stat.accentRgb},0.22)`, color: stat.accent, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800 }}>
            {stat.kicker}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '5px' }}>Before</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', textDecoration: 'line-through', textDecorationColor: 'rgba(255,80,80,0.3)', letterSpacing: '-0.02em' }}>{stat.before}</div>
          </div>
          <div style={{ width: '30px', height: '30px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${stat.accentRgb},0.12)`, border: `1px solid rgba(${stat.accentRgb},0.25)`, color: stat.accent, fontSize: '12px' }}>→</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: `rgba(${stat.accentRgb},0.7)`, marginBottom: '5px' }}>After</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#ffffff', textShadow: `0 0 16px rgba(${stat.accentRgb},0.8), 0 0 32px rgba(${stat.accentRgb},0.4)` }}>{stat.after}</div>
          </div>
        </div>

        <div style={{ marginTop: '18px', height: '2px', borderRadius: '999px', background: `linear-gradient(90deg, rgba(${stat.accentRgb},0.6), rgba(${stat.accentRgb},0.1))` }} />
      </div>
    </div>
  );
});

// ─── Pill Toggle ──────────────────────────────────────────────────────────────
function PillToggle({ active, onChange }: { active: 'pricing' | 'why'; onChange: (v: 'pricing' | 'why') => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '999px', padding: '4px', gap: '2px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      {(['pricing', 'why'] as const).map(tab => {
        const isActive = active === tab;
        const accent = tab === 'pricing' ? BF[0] : BF[1];
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '9px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
              transition: 'all 0.28s cubic-bezier(0.34,1.3,0.64,1)',
              background: isActive
                ? `linear-gradient(135deg, ${accent}25 0%, ${accent}15 100%)`
                : 'transparent',
              color: isActive ? accent : 'rgba(237,233,227,0.38)',
              boxShadow: isActive ? `0 0 0 1px ${accent}30, 0 4px 16px ${accent}20` : 'none',
            }}
          >
            {tab === 'pricing' ? 'Pricing' : 'Why'}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TransformationSection() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'why'>('pricing');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]); // INR default
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevTab = useRef(activeTab);

  const handleTabChange = useCallback((tab: 'pricing' | 'why') => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      prevTab.current = activeTab;
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 180);
  }, [activeTab]);

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideOutUp {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-18px) scale(0.98); }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          background: 'rgba(4,4,10,1)',
          overflow: 'hidden',
          padding: 'clamp(60px, 10vw, 120px) 0',
          isolation: 'isolate',
        }}
      >
        {/* Background grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none', zIndex: 0 }}>
          <defs>
            <pattern id="tgrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tgrid)" />
        </svg>

        {/* Ambient glow per tab */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: activeTab === 'pricing'
            ? 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(8,148,255,0.07) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(201,89,221,0.07) 0%, transparent 60%)',
          transition: 'background 0.6s ease',
          filter: 'blur(20px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

          {/* ── Section header ── */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '1px', background: activeTab === 'pricing' ? 'rgba(8,148,255,0.5)' : 'rgba(201,89,221,0.5)', transition: 'background 0.4s' }} />
              <span style={{ fontSize: '8px', letterSpacing: '0.32em', textTransform: 'uppercase', color: activeTab === 'pricing' ? 'rgba(8,148,255,0.75)' : 'rgba(201,89,221,0.75)', fontWeight: 800, transition: 'color 0.4s' }}>
                {activeTab === 'pricing' ? 'Owned Production' : 'The Upgrade'}
              </span>
              <div style={{ width: '28px', height: '1px', background: activeTab === 'pricing' ? 'rgba(8,148,255,0.5)' : 'rgba(201,89,221,0.5)', transition: 'background 0.4s' }} />
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1.0, color: '#F7F1E2', margin: '0 0 16px' }}>
              {activeTab === 'pricing' ? (
                <>Pricing <span style={{ color: '#0894ff', textShadow: '0 0 20px rgba(8,148,255,0.7), 0 0 40px rgba(8,148,255,0.3)' }}>.</span></>
              ) : (
                <>The <span style={{ color: '#c959dd', textShadow: '0 0 20px rgba(201,89,221,0.7), 0 0 40px rgba(201,89,221,0.3)' }}>Upgrade.</span></>
              )}
            </h2>

            <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', lineHeight: 1.7, color: 'rgba(237,233,227,0.38)', maxWidth: '36ch', margin: '0 auto 28px' }}>
              {activeTab === 'pricing'
                ? 'Luxury motion, cleaner scale, one owned production system.'
                : 'Less friction. More output. Every campaign lives inside the same premium world.'}
            </p>

            {/* ── Pill toggle + currency ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <PillToggle active={activeTab} onChange={handleTabChange} />
              {activeTab === 'pricing' && (
                <CurrencySelector currency={currency} onChange={setCurrency} />
              )}
            </div>
          </div>

          {/* ── Content panels ── */}
          <div style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(12px) scale(0.99)' : 'translateY(0) scale(1)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}>
            {activeTab === 'pricing' && (
              <div>
                {/* Pricing cards grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                  gap: 'clamp(14px, 2.5vw, 24px)',
                  alignItems: 'stretch',
                  marginBottom: 'clamp(16px, 3vw, 32px)',
                }}>
                  {pricingPlans.map((plan, i) => (
                    <PricingCard key={plan.id} plan={plan} currency={currency} index={i} />
                  ))}
                </div>

                {/* Currency note */}
                <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(237,233,227,0.22)', letterSpacing: '0.1em' }}>
                  {currency.code === 'INR'
                    ? 'Prices in INR · GST applicable'
                    : `Prices shown in ${currency.code} · Billed in INR at current rates`}
                </p>
              </div>
            )}

            {activeTab === 'why' && (
              <div>
                {/* Upgrade stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                  gap: 'clamp(14px, 2.5vw, 24px)',
                  alignItems: 'stretch',
                  marginBottom: 'clamp(16px, 3vw, 32px)',
                }}>
                  {upgradeStats.map(stat => (
                    <UpgradeCard key={stat.label} stat={stat} />
                  ))}
                </div>

                {/* Chip row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap', marginTop: 'clamp(16px, 3vw, 32px)' }}>
                  {[
                    { label: '1 digital twin',   accent: BF[0], accentRgb: BF_RGB[0] },
                    { label: 'Every campaign',   accent: BF[1], accentRgb: BF_RGB[1] },
                    { label: 'Forever reusable', accent: BF[2], accentRgb: BF_RGB[2] },
                  ].map(({ label, accent, accentRgb }) => (
                    <div
                      key={label}
                      style={{ padding: '8px 16px', borderRadius: '999px', border: `1px solid rgba(${accentRgb},0.2)`, background: `rgba(${accentRgb},0.08)`, color: accent, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800 }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}