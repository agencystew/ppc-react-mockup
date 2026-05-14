// Unified design primitives — the single source of truth for the editorial
// rhythm across the app. Every page composes from these so the app reads
// as ONE product, not seven floating pages.
//
// The brief these answer:
//   - One canonical card chrome (radius, border, padding, hover)
//   - One canonical row primitive for editorial lists (clients, runs, agents)
//   - One canonical metric tile (eyebrow + display value + sub)
//   - One canonical hero stack (eyebrow + display H1 + lede + actions)
//   - One canonical section divider rhythm
//
// Type scale (locked):
//   Display H1   60-68px Outfit 800, leading 0.96, tracking -0.035em
//   Display H2   34px Outfit 700, leading 1.08, tracking -0.020em
//   Card H3      22-24px Outfit 700, leading 1.10, tracking -0.020em
//   Body         15-16px Figtree 400, leading 1.55, tracking -0.005em
//   Sub-body     13.5-14px Figtree 400, leading 1.45, tracking -0.005em
//   Eyebrow      11px Space Mono 600 uppercase tracking 0.08em
//   Mono row     12-13px Space Mono 500, tabular-nums
//
// Hover treatment (locked):
//   Cards/rows  → border-color → ppc-purple-300, NO underline, NO scale,
//                 small chevron translate inside the affordance only.
//   Buttons     → as defined by .ppcio-cta / .btn-ghost / .btn-outline.

import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

// ─── Layout rhythm ───────────────────────────────────────────────────────

export const PAGE_STACK = 'space-y-12';      // between major sections
export const SECTION_STACK = 'space-y-5';    // within a section

// ─── Eyebrow ─────────────────────────────────────────────────────────────

export function Eyebrow({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'purple' | 'inverse';
  className?: string;
}) {
  const toneCls =
    tone === 'purple'  ? 'text-ppc-purple-500'
  : tone === 'inverse' ? 'text-white/70'
  : 'text-ppc-neutral-500';
  return (
    <div
      className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] ${toneCls} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Display H1 (with the signature purple-period flourish) ──────────────

export function DisplayH1({
  text,
  tone = 'dark',
  className = '',
}: {
  text: string;            // a trailing "." renders in purple
  tone?: 'dark' | 'light'; // "dark" on light bg, "light" on dark bg
  className?: string;
}) {
  const hasPeriod = text.endsWith('.');
  const body = hasPeriod ? text.slice(0, -1) : text;
  const color = tone === 'light' ? 'text-white' : 'text-ppc-black';
  return (
    <h1
      className={`font-display text-[52px] font-extrabold leading-[0.96] tracking-[-0.035em] sm:text-[62px] ${color} ${className}`}
    >
      {body}
      {hasPeriod && <span className="text-ppc-purple-500">.</span>}
    </h1>
  );
}

// ─── Section H2 ──────────────────────────────────────────────────────────

export function SectionH2({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const hasPeriod = text.endsWith('.');
  const body = hasPeriod ? text.slice(0, -1) : text;
  return (
    <h2
      className={`font-display text-[30px] font-bold leading-[1.08] tracking-[-0.020em] text-ppc-black sm:text-[34px] ${className}`}
    >
      {body}
      {hasPeriod && <span className="text-ppc-purple-500">.</span>}
    </h2>
  );
}

// ─── Page hero stack ─────────────────────────────────────────────────────

interface PageHeroProps {
  eyebrow: string;
  headline: string;          // trailing period rendered purple
  description?: string;
  actions?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export function PageHero({
  eyebrow, headline, description, actions, variant = 'light',
}: PageHeroProps) {
  if (variant === 'dark') {
    return (
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-10 py-12 sm:px-14 sm:py-14">
        <div className="relative">
          <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
          <div className="mt-3">
            <DisplayH1 text={headline} tone="light" />
          </div>
          {description && (
            <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] tracking-tight text-white/70">
              {description}
            </p>
          )}
          {actions && <div className="mt-8 flex flex-wrap gap-2.5">{actions}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-[820px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <div className="mt-3">
          <DisplayH1 text={headline} tone="dark" />
        </div>
        {description && (
          <p className="mt-5 max-w-[620px] text-[17px] leading-[1.55] tracking-tight text-ppc-neutral-700">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </section>
  );
}

// ─── Section header (eyebrow + H2 + optional action) ─────────────────────

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionH2 className="mt-2" text={title} />
      </div>
      {action}
    </div>
  );
}

// ─── Editorial card ──────────────────────────────────────────────────────
//
// The canonical card chrome. White surface, soft border, small shadow,
// generous padding, ONE hover treatment (border-color → purple-300 +
// shadow lift). No translateY, no scale, no underline.

export function EditorialCard({
  as = 'div',
  to,
  children,
  className = '',
  padding = 'md',
}: {
  as?: 'div' | 'link' | 'button';
  to?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}) {
  const pad =
    padding === 'sm' ? 'p-5'
  : padding === 'lg' ? 'p-8 sm:p-10'
  : 'p-7';
  const base =
    `block rounded-2xl border border-ppc-neutral-100 bg-white shadow-ppc-sm transition-colors ${pad} ${className}`;
  const hover = (as === 'link' || as === 'button')
    ? 'hover:border-ppc-purple-300 hover:shadow-ppc-md'
    : '';
  if (as === 'link' && to) {
    return (
      <Link to={to} className={`${base} ${hover} group`}>
        {children}
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button type="button" className={`${base} ${hover} group w-full text-left`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

// ─── Metric stat (eyebrow + display value + sub) ─────────────────────────

export function MetricStat({
  eyebrow, value, sub, trend, tone = 'dark',
}: {
  eyebrow: string;
  value: string;
  sub: string;
  trend?: string;
  tone?: 'dark' | 'light';
}) {
  const valueColor   = tone === 'light' ? 'text-white' : 'text-ppc-black';
  const subColor     = tone === 'light' ? 'text-white/60' : 'text-ppc-neutral-600';
  const trendColor   = tone === 'light' ? 'text-ppc-purple-300' : 'text-ppc-purple-500';
  return (
    <div>
      <Eyebrow tone={tone === 'light' ? 'inverse' : 'neutral'}>{eyebrow}</Eyebrow>
      <div className={`tabular mt-3 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] sm:text-[44px] ${valueColor}`}>
        {value}
      </div>
      <div className={`mt-2 text-[13px] leading-snug ${subColor}`}>{sub}</div>
      {trend && (
        <div className={`mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] ${trendColor}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── Editorial list (rounded white container with divider rows) ──────────

export function EditorialList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white shadow-ppc-sm">
      {children}
    </ul>
  );
}

// Single row inside an EditorialList. Renders as <Link> when `to` is set.
export function EditorialRow({
  to,
  children,
  onClick,
}: {
  to?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const cls =
    'group flex w-full items-center gap-5 px-7 py-5 text-left transition-colors hover:bg-ppc-purple-50/40';
  if (to) {
    return (
      <li>
        <Link to={to} className={cls}>{children}</Link>
      </li>
    );
  }
  return (
    <li>
      <button type="button" onClick={onClick} className={cls}>{children}</button>
    </li>
  );
}

// ─── Chevron link (for "View all →" affordances) ─────────────────────────

export function ChevronLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="ppc-link inline-flex items-center gap-1.5 text-[13.5px] font-semibold tracking-tight text-ppc-purple-500 transition-colors hover:text-ppc-purple-700"
    >
      {children} <ArrowRight size={13} weight="bold" />
    </Link>
  );
}

// ─── Sheen divider ───────────────────────────────────────────────────────

export function Sheen({ className = '' }: { className?: string }) {
  return <hr className={`ppc-sheen border-0 ${className}`} />;
}

// ─── Secondary button ────────────────────────────────────────────────────

export function SecondaryButton({
  children, onClick, variant = 'light',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'light' | 'dark';
}) {
  const cls = variant === 'dark'
    ? 'border-white/15 text-white hover:bg-white/5'
    : 'border-ppc-neutral-200 bg-white text-ppc-black hover:border-ppc-purple-300';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-3 text-[14px] font-semibold tracking-tight transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

// ─── Primary CTA (re-export for symmetry; identical to the .ppcio-cta) ──

export function PrimaryCTA({
  children, onClick, to, size = 'md',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  size?: 'md' | 'lg';
}) {
  const cls = `ppcio-cta ${size === 'lg' ? 'ppcio-cta--lg' : ''}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

// ─── Health pill (used across Project / Dashboard / sidebar) ─────────────

export function HealthPill({ health, label }: {
  health: 'good' | 'warning' | 'attention';
  label?: string;
}) {
  const map = {
    good:      { dot: 'bg-ppc-success', text: 'text-ppc-success', default: 'Healthy' },
    warning:   { dot: 'bg-ppc-warning', text: 'text-ppc-warning', default: 'Watch' },
    attention: { dot: 'bg-ppc-error',   text: 'text-ppc-error',   default: 'Attention' },
  }[health];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${map.text}`}>
      <span className={`h-2 w-2 rounded-full ${map.dot}`} />
      {label ?? map.default}
    </span>
  );
}
