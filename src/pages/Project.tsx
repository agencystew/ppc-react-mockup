import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown,
  Lightning, CaretDown, CaretRight,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';

/* Project detail · /projects/:id
 *
 * Editorial-grade dashboard, sized to match Stewart's reference screenshots.
 * Light page on a soft lavender field (#f7f6fc) punctuated by three dark
 * "Run an agent" cards in the middle and a dark command bar at the foot —
 * the page's signature visual move. Every section heading is bold display
 * sans with a single purple period dot.
 *
 * Top → bottom: breadcrumb + run agent ▸ hero ▸ tabs ▸ Today's brief
 * ▸ Run an agent ▸ Performance ▸ Recent activity ▸ Campaigns ▸ ask bar.
 */

// ─── Tokens ────────────────────────────────────────────────────────────
const C = {
  pageBg:    '#f7f6fc',
  pageBor:   '#e8e6f0',
  ink:       '#18181b',
  neutral7:  '#3f3f46',
  neutral6:  '#52525b',
  neutral5:  '#71717a',
  neutral4:  '#a1a1aa',
  neutral3:  '#d4d4d8',
  border:    '#ebeaf2',
  rowBorder: '#f4f3f9',
  cardBg:    '#ffffff',
  purple:    '#7c6dff',
  purpleSoft:'#c9c1ff',
  green:     '#16a34a',
  greenDot:  '#22c55e',
  amber:     '#d97706',
  amberDot:  '#f59e0b',
  red:       '#dc2626',
  redDot:    '#ef4444',
} as const;

// ─── Data ──────────────────────────────────────────────────────────────

type FindingTone = 'critical' | 'warning';
type FindingValueTone = 'good' | 'warn' | 'neutral';
interface Finding {
  tone: FindingTone;
  title: string;
  source: string;
  meta: string;
  valueMain: string;       // "$4,200" or "CTR uplift"
  valueSuffix?: string;    // "/mo" — rendered smaller + dimmer
  valueTone: FindingValueTone;
  valueLabel: string;      // "recoverable" | "at risk" | "est. 0.4–0.8pp"
}
const FINDINGS: Finding[] = [
  {
    tone: 'critical',
    title: 'Wasted spend in non-converting search terms',
    source: 'Search Term Audit',
    meta: '2h ago · 47 negative candidates surfaced',
    valueMain: '$4,200',
    valueSuffix: '/mo',
    valueTone: 'good',
    valueLabel: 'recoverable',
  },
  {
    tone: 'warning',
    title: 'CPA up 43% in or_sud_search',
    source: 'CPA Monitor',
    meta: '1d ago · $76 → $109 week over week',
    valueMain: '$1,200',
    valueSuffix: '/mo',
    valueTone: 'warn',
    valueLabel: 'at risk',
  },
  {
    tone: 'warning',
    title: '3 PMAX assets rated "Poor"',
    source: 'PMAX Asset Review',
    meta: '5h ago · headline & description swaps recommended',
    valueMain: 'CTR uplift',
    valueTone: 'neutral',
    valueLabel: 'est. 0.4–0.8pp',
  },
];

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  deltaTone: 'up-bad' | 'up-good' | 'down-good' | 'flat';
  spark: number[];
}
const KPI_CARDS: KpiCard[] = [
  { label: 'Spend',       value: '$87,575', delta: '132.8%', deltaTone: 'up-bad',    spark: [16,14,11,11, 9, 7, 5, 4, 7, 9,12] },
  { label: 'Conversions', value: '1,118',   delta: '193.1%', deltaTone: 'up-good',   spark: [18,17,14,12,11, 9, 8, 6, 5, 4, 3] },
  { label: 'CPA',         value: '$78.27',  delta: '20.5%',  deltaTone: 'down-good', spark: [ 4, 6, 8, 9,11,12,14,15,14,15,16] },
  { label: 'CTR',         value: '3.42%',   delta: '-0.3%',  deltaTone: 'flat',      spark: [10, 9,11,10,12,10,11,10,12,11,13] },
];

// Daily spend, 32 points, mountain shape.
const SPEND_TREND = [
  3100,3300,3550,3800,4000,4400,4900,5100,5300,5500,5700,5900,
  6050,6200,6350,6450,6550,6500,6300,6050,5800,5500,5250,5000,
  4800,4650,4500,4350,4200,4050,3950,3850,
];

interface Campaign { name: string; meta: string; cpaTone?: 'bad' | 'good' | 'neutral'; cpa: string; }
const TOP_CAMPAIGNS: Campaign[] = [
  { name: 'oh_brand_search', meta: '$5,274 · 126 conv',  cpa: '$42 CPA',  cpaTone: 'good'    },
  { name: 'or_brand_search', meta: '$4,810 · 56 conv',   cpa: '$86 CPA',  cpaTone: 'neutral' },
  { name: 'oh_sud_search',   meta: '$5,362 · 87 conv',   cpa: '$62 CPA',  cpaTone: 'neutral' },
];
const BAD_CAMPAIGNS: Campaign[] = [
  { name: 'nm_sud_search',   meta: '$2,603 · 9 conv',    cpa: '$289 CPA', cpaTone: 'bad' },
  { name: 'nc_brand_search', meta: '$5,043 · 28 conv',   cpa: '$180 CPA', cpaTone: 'bad' },
  { name: 'co_sud_search',   meta: '$2,990 · 19 conv',   cpa: '$157 CPA', cpaTone: 'bad' },
];

interface ActivityRow { title: string; meta: string; when: string; }
const ACTIVITY: ActivityRow[] = [
  { title: 'Search Term Audit', meta: 'Surfaced 47 negative keyword candidates · $4,200/mo recoverable', when: '2h ago' },
  { title: 'PMAX Asset Review', meta: 'Flagged 3 assets rated "Poor" with replacement suggestions',       when: '5h ago' },
  { title: 'CPA Monitor',       meta: 'Detected anomaly: or_sud_search CPA up 43% week over week',         when: '1d ago' },
];

// ─── Schedule ──────────────────────────────────────────────────────────
// Next-up agents queued for this project. Empty → ScheduleCard falls back
// to industry suggestions so the slot never reads dead.
interface ScheduledAgent {
  slug: string;
  emoji: string;
  name: string;
  cadence: string;   // "MON 9AM" | "EVERY FRI" | "DAILY" — mono uppercase chip
  nextRun: string;   // "in 2 days" | "tomorrow 9am" — relative
}

const SCHEDULE: Record<string, ScheduledAgent[]> = {
  'boulder-care': [
    { slug: 'weekly-audit',     emoji: '📊', name: 'Weekly Audit',        cadence: 'MON 9AM',   nextRun: 'in 2 days' },
    { slug: 'spend-leak',       emoji: '💧', name: 'Spend Leak Detector', cadence: 'EVERY FRI', nextRun: 'in 5 days' },
    { slug: 'negative-keyword', emoji: '🛡️', name: 'Negative Keyword',    cadence: 'BIWEEKLY',  nextRun: 'in 11 days' },
  ],
  'the-hoth': [
    { slug: 'deep-account-audit', emoji: '🔍', name: 'Deep Account Audit', cadence: 'MONTHLY', nextRun: 'in 8 days' },
    { slug: 'budget-pacer',       emoji: '⏱️', name: 'Budget Pacer',       cadence: 'DAILY',   nextRun: 'tomorrow 9am' },
  ],
  'durable': [
    { slug: 'pmax',          emoji: '🎯', name: 'PMAX',          cadence: 'WED 9AM',   nextRun: 'in 4 days' },
    { slug: 'budget-pacer',  emoji: '⏱️', name: 'Budget Pacer',  cadence: 'DAILY',     nextRun: 'tomorrow 9am' },
    { slug: 'shopping-feed', emoji: '🛒', name: 'Shopping Feed', cadence: 'EVERY MON', nextRun: 'in 2 days' },
  ],
  'flock': [
    { slug: 'weekly-audit',   emoji: '📊', name: 'Weekly Audit',   cadence: 'MON 9AM',   nextRun: 'in 2 days' },
    { slug: 'competitor-spy', emoji: '🕵️', name: 'Competitor Spy', cadence: 'EVERY THU', nextRun: 'in 4 days' },
  ],
};

const SCHEDULE_SUGGESTIONS: ScheduledAgent[] = [
  { slug: 'weekly-audit',       emoji: '📊', name: 'Weekly Audit',        cadence: 'SUGGESTED', nextRun: 'set cadence' },
  { slug: 'spend-leak',         emoji: '💧', name: 'Spend Leak Detector', cadence: 'SUGGESTED', nextRun: 'set cadence' },
  { slug: 'deep-account-audit', emoji: '🔍', name: 'Deep Account Audit', cadence: 'SUGGESTED', nextRun: 'set cadence' },
];

// ─── Avatar palette ────────────────────────────────────────────────────
const AVATAR: Record<string, { bg: string; fg: string }> = {
  'boulder-care':       { bg: '#22C55E', fg: '#052E16' },
  'the-hoth':           { bg: '#EF4444', fg: '#450A0A' },
  'durable':            { bg: '#14B8A6', fg: '#042F2C' },
  'linkbuilder':        { bg: '#65D6A1', fg: '#053723' },
  'livingyoung':        { bg: '#3B82F6', fg: '#0B1F4F' },
  'authority-builders': { bg: '#5B7CF8', fg: '#0E1A4D' },
  'edwin-novel':        { bg: '#D946A8', fg: '#3F0D2E' },
  'flock':              { bg: '#C08A2E', fg: '#3A2406' },
};

// ─── Page ──────────────────────────────────────────────────────────────
export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return <Navigate to="/projects" replace />;
  const avatar = AVATAR[project.id] ?? { bg: '#7F5AF0', fg: '#FFFFFF' };

  return (
    <div
      className="rounded-[14px] border px-7 py-7 sm:px-9 sm:py-9"
      style={{ background: C.pageBg, borderColor: C.pageBor, color: C.ink }}
    >
      {/* ── 1. Breadcrumb + Run agent ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.neutral5 }}>
          <Link to="/projects" className="hover:text-[#18181b] transition-colors">Projects</Link>
          <span style={{ color: C.neutral3 }}>/</span>
          <span style={{ color: C.neutral7 }}>{project.name}</span>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-[10px] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(124,109,255,0.35),0_10px_24px_-8px_rgba(124,109,255,0.5)] transition-transform hover:-translate-y-px"
          style={{ background: C.purple }}
        >
          <Lightning size={15} weight="fill" />
          Run agent
          <CaretDown size={11} weight="bold" className="opacity-75" />
        </button>
      </div>

      {/* ── 2. Hero ───────────────────────────────────────────────── */}
      <header className="mt-7 flex items-center gap-4">
        <div
          className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-[12px] text-[24px] font-semibold"
          style={{ background: avatar.bg, color: avatar.fg }}
        >
          {project.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h1
            className="text-[40px] font-extrabold leading-[1.02]"
            style={{ color: C.ink, letterSpacing: '-0.025em' }}
          >
            {project.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13.5px]" style={{ color: C.neutral5 }}>
            <span>{project.industry}</span>
            <span style={{ color: C.neutral3 }}>·</span>
            <span>Lead gen</span>
            <span style={{ color: C.neutral3 }}>·</span>
            <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: C.red }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.redDot }} />
              1 critical, 3 warnings
            </span>
          </div>
        </div>
      </header>

      {/* ── 3. Tabs ───────────────────────────────────────────────── */}
      <nav
        className="mt-8 flex items-center gap-1 border-b text-[13.5px]"
        style={{ borderColor: C.border }}
      >
        <Tab active>Overview</Tab>
        <Tab>Business context</Tab>
        <Tab>Competitors</Tab>
        <Tab>AI instructions</Tab>
        <Tab>Settings</Tab>
      </nav>

      {/* ── 4. Today's brief — unified dark hero card ─────────────── */}
      <TodaysBriefCard findings={FINDINGS} />

      {/* ── 5. Performance ────────────────────────────────────────── */}
      <SectionHeading
        title="Performance"
        right={
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border bg-white px-3 py-1.5 text-[12.5px] font-medium"
            style={{ borderColor: C.border, color: C.neutral7 }}
          >
            Last 30 days
            <CaretDown size={11} weight="bold" style={{ color: C.neutral4 }} />
          </button>
        }
        marginTop="mt-14"
      />

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {KPI_CARDS.map((k) => (
          <KpiCardBlock key={k.label} kpi={k} />
        ))}
      </div>

      <DailyTrendChart data={SPEND_TREND} />

      {/* ── 6. Schedule + Recent activity (2-up) ──────────────────── */}
      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScheduleCard projectId={project.id} />
        <RecentActivityCard rows={ACTIVITY} />
      </div>

      {/* ── 7. Campaigns ─────────────────────────────────────────── */}
      <SectionHeading
        title="Campaigns"
        sub={<><span className="tabular">152</span> total · <span className="tabular">8</span> types</>}
        right={
          <Link to="#" className="inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: C.purple }}>
            View all <ArrowRight size={12} weight="bold" />
          </Link>
        }
        marginTop="mt-14"
      />

      <div className="mt-5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <CampaignCard title="Top performers" tone="good" items={TOP_CAMPAIGNS} />
        <CampaignCard title="Needs attention" tone="bad"  items={BAD_CAMPAIGNS} />
      </div>

    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

/**
 * Today's brief — the page's signature dark hero card.
 *
 * Recipe lifts directly from Dashboard activity hero (radial purple bloom
 * masked at top + black-led vertical gradient body) so the design language
 * stays one hand. Left column: eyebrow → narrative sentence → primary CTA.
 * Right column: purple wave chart (pure decoration, no axis). Findings
 * are nested inside the same card on a low-opacity inner surface — they
 * belong to the brief, not a separate block.
 */
function TodaysBriefCard({ findings }: { findings: Finding[] }) {
  // Wave shape (24 control points, mountain rising right).
  const wavePts = [
    0.62, 0.58, 0.54, 0.51, 0.48, 0.46, 0.42, 0.38,
    0.34, 0.36, 0.32, 0.28, 0.24, 0.22, 0.26, 0.22,
    0.18, 0.14, 0.10, 0.16, 0.20, 0.16, 0.12, 0.18,
  ];
  const W = 560;
  const H = 200;
  const pts = wavePts.map((y, i) => ({
    x: (i / (wavePts.length - 1)) * W,
    y: y * H,
  }));
  let line = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div
      className="relative mt-9 overflow-hidden rounded-[16px] border"
      style={{
        background: 'linear-gradient(180deg, #07050D 0%, #0C0A14 100%)',
        borderColor: '#1a1a22',
      }}
    >
      {/* Top purple bloom — same radial recipe as Dashboard activity hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[280px]"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(127,90,240,0.22) 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
        }}
      />

      {/* Top row: narrative + CTA on left, wave chart on right */}
      <div className="relative grid grid-cols-1 gap-6 px-7 pb-7 pt-8 md:grid-cols-[1fr_minmax(300px,460px)] md:gap-8 md:px-9 md:pb-8 md:pt-9">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h2
              className="text-[22px] font-bold tracking-[-0.02em] text-white"
              style={{ letterSpacing: '-0.025em' }}
            >
              Today's brief
              <span style={{ color: '#A89BFF', fontStyle: 'italic' }}>.</span>
            </h2>
            <span
              className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Updated 2h ago
            </span>
          </div>

          <p
            className="mt-4 max-w-[52ch] text-[15.5px] leading-[1.55]"
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            Search inefficiencies are driving up CPA. We found{' '}
            <span className="font-semibold text-white">$5,400/mo</span> in
            recoverable spend across 47 keywords and 3 campaigns.
          </p>

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(124,109,255,0.5),0_12px_28px_-10px_rgba(124,109,255,0.65)] transition-transform hover:-translate-y-px"
            style={{ background: C.purple }}
          >
            Run all audits
            <ArrowRight size={13} weight="bold" />
          </button>
        </div>

        {/* Wave chart — decoration only */}
        <div className="relative -mr-1 self-end md:-mr-2 md:self-stretch">
          <svg
            width="100%"
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="block"
          >
            <defs>
              <linearGradient id="briefWaveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A89BFF" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#A89BFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="briefWaveStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7C6DFF" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#D4CDFF" stopOpacity={1} />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#briefWaveFill)" />
            <path
              d={line}
              fill="none"
              stroke="url(#briefWaveStroke)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Findings nested inside the same card */}
      <div className="relative px-3 pb-3 md:px-4 md:pb-4">
        <div
          className="rounded-[12px] border"
          style={{
            background: 'rgba(255,255,255,0.025)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {findings.map((f, i) => {
            const isLast = i === findings.length - 1;
            const dot = f.tone === 'critical' ? C.redDot : C.amberDot;
            const valueColor =
              f.valueTone === 'good' ? '#4ADE80' :     // green-400 — lifts on dark
              f.valueTone === 'warn' ? '#FBBF24' :     // amber-400
                                       'rgba(255,255,255,0.92)';
            const dotHalo =
              f.tone === 'critical'
                ? '0 0 0 3px rgba(239,68,68,0.22), 0 0 12px rgba(239,68,68,0.18)'
                : '0 0 0 3px rgba(245,158,11,0.18)';
            return (
              <a
                key={i}
                href="#"
                className="grid grid-cols-[16px_1fr_auto_16px] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span
                  className="h-[8px] w-[8px] rounded-full"
                  style={{ background: dot, boxShadow: dotHalo }}
                />
                <div className="min-w-0">
                  <div
                    className="text-[14.5px] font-semibold leading-tight text-white"
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    {f.title}
                  </div>
                  <div
                    className="mt-1 text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <span>{f.source}</span>
                    <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                    {f.meta}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="tabular text-[15px] font-semibold leading-none"
                    style={{ color: valueColor }}
                  >
                    {f.valueMain}
                    {f.valueSuffix && (
                      <span
                        className="ml-0.5 text-[11.5px] font-medium"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {f.valueSuffix}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1 text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.42)' }}
                  >
                    {f.valueLabel}
                  </div>
                </div>
                <CaretRight size={14} weight="bold" style={{ color: 'rgba(255,255,255,0.35)' }} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * On the schedule — next-up agents queued for this project.
 *
 * Mono uppercase cadence chips ("MON 9AM", "EVERY FRI") signal cadence
 * not duration. Empty project → falls back to industry suggestions with
 * a "SUGGESTED" chip + "Set schedule" footer link.
 */
function ScheduleCard({ projectId }: { projectId: string }) {
  const scheduled = SCHEDULE[projectId];
  const rows = scheduled && scheduled.length > 0 ? scheduled : SCHEDULE_SUGGESTIONS;
  const isSuggestion = !scheduled || scheduled.length === 0;

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-[20px] font-bold leading-[1.05]"
            style={{ color: C.ink, letterSpacing: '-0.02em' }}
          >
            {isSuggestion ? 'Suggested cadence' : 'On the schedule'}
            <span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
          </h2>
          <p className="mt-1.5 text-[12px]" style={{ color: C.neutral5 }}>
            {isSuggestion
              ? "No schedule yet — here's a starter for this industry"
              : (
                <>
                  <span className="tabular">{rows.length}</span>
                  {' '}agents queued for this project
                </>
              )}
          </p>
        </div>
        <Link
          to="#"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
          style={{ color: C.purple }}
        >
          {isSuggestion ? 'Set schedule' : 'Adjust schedule'}
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-[12px] border"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          return (
            <Link
              key={`${r.slug}-${i}`}
              to={`/agents/${r.slug}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fafafd]"
              style={{ borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}` }}
            >
              <span
                className="grid h-[36px] w-[36px] place-items-center rounded-[9px] text-[16px]"
                style={{ background: '#f1f0f8' }}
                aria-hidden
              >
                {r.emoji}
              </span>
              <div className="min-w-0">
                <div
                  className="text-[13.5px] font-semibold leading-tight"
                  style={{ color: C.ink, letterSpacing: '-0.005em' }}
                >
                  {r.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11.5px]" style={{ color: C.neutral5 }}>
                  <span
                    className="font-mono uppercase"
                    style={{
                      color: isSuggestion ? C.purple : C.neutral7,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {r.cadence}
                  </span>
                  <span style={{ color: C.neutral3 }}>·</span>
                  <span className="tabular">{r.nextRun}</span>
                </div>
              </div>
              <CaretRight size={14} weight="bold" style={{ color: C.neutral4 }} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Recent activity — green-dotted timeline of the last 3 runs. Lives in a
 * light card to balance the Schedule card on the right of the 2-up.
 */
function RecentActivityCard({ rows }: { rows: ActivityRow[] }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-[20px] font-bold leading-[1.05]"
            style={{ color: C.ink, letterSpacing: '-0.02em' }}
          >
            Recent activity
            <span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
          </h2>
          <p className="mt-1.5 text-[12px]" style={{ color: C.neutral5 }}>
            Last <span className="tabular">{rows.length}</span> completed runs
          </p>
        </div>
        <Link
          to="#"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
          style={{ color: C.purple }}
        >
          View all
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      <div
        className="mt-4 rounded-[12px] border px-5 py-4"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        <div className="relative pl-1">
          <div
            className="absolute bottom-3.5 left-[6px] top-3.5 w-px"
            style={{ background: C.border }}
          />
          {rows.map((a) => (
            <div key={a.title} className="relative flex items-start gap-4 py-3">
              <span
                className="relative z-10 mt-2 h-[13px] w-[13px] shrink-0 rounded-full"
                style={{
                  background: C.greenDot,
                  boxShadow: `0 0 0 3px ${C.cardBg}`,
                }}
              />
              <div className="flex flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="text-[13.5px] font-semibold"
                    style={{ color: C.ink, letterSpacing: '-0.005em' }}
                  >
                    {a.title}
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: C.neutral5 }}>
                    {a.meta}
                  </div>
                </div>
                <div className="whitespace-nowrap text-[11.5px]" style={{ color: C.neutral4 }}>
                  {a.when}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  title, sub, right, marginTop = 'mt-12',
}: {
  title: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  marginTop?: string;
}) {
  return (
    <div className={`${marginTop} flex items-end justify-between gap-4`}>
      <div>
        <h2
          className="text-[26px] font-bold leading-[1.05]"
          style={{ color: C.ink, letterSpacing: '-0.02em' }}
        >
          {title}<span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
        </h2>
        {sub && (
          <p className="mt-2 text-[12.5px]" style={{ color: C.neutral5 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function Tab({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className="-mb-px border-b-2 px-4 py-3.5 transition-colors"
      style={{
        color: active ? C.ink : C.neutral5,
        fontWeight: active ? 600 : 500,
        borderColor: active ? C.purple : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function KpiCardBlock({ kpi }: { kpi: KpiCard }) {
  const deltaColor =
    kpi.deltaTone === 'up-bad'    ? C.red :
    kpi.deltaTone === 'up-good'   ? C.green :
    kpi.deltaTone === 'down-good' ? C.green :
                                    C.neutral5;
  const Arrow =
    kpi.deltaTone === 'flat'      ? ArrowRight :
    kpi.deltaTone === 'down-good' ? ArrowDown :
                                    ArrowUp;
  return (
    <div
      className="rounded-[12px] border px-4 py-4"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div
        className="font-mono text-[10.5px] font-semibold uppercase"
        style={{ color: C.neutral5, letterSpacing: '0.12em' }}
      >
        {kpi.label}
      </div>
      <div
        className="tabular mt-3 text-[30px] font-bold leading-none"
        style={{ color: C.ink, letterSpacing: '-0.02em' }}
      >
        {kpi.value}
      </div>
      <div className="tabular mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: deltaColor }}>
        <Arrow size={11} weight="bold" />
        {kpi.delta}
      </div>
      <Sparkline points={kpi.spark} color={C.purple} className="mt-2.5" />
    </div>
  );
}

function Sparkline({ points, color, className = '' }: { points: number[]; color: string; className?: string }) {
  const W = 120, H = 26, max = 22;
  const stepX = W / (points.length - 1);
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
  const line = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  const area = `${line} L ${W.toFixed(2)},${max.toFixed(2)} L 0,${max.toFixed(2)} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${max}`} className={`block ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DailyTrendChart({ data }: { data: number[] }) {
  const [metric, setMetric] = useState<'spend' | 'conv' | 'cpa' | 'ctr'>('spend');
  const segments = [
    { id: 'spend', label: 'Spend' },
    { id: 'conv',  label: 'Conv' },
    { id: 'cpa',   label: 'CPA' },
    { id: 'ctr',   label: 'CTR' },
  ] as const;

  const W = 1100, H = 200;
  const padL = 0, padR = 0, padT = 10, padB = 30;
  const maxY = Math.max(...data) * 1.12;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const pts = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * innerW,
    y: padT + innerH - (v / maxY) * innerH,
  }));

  function smoothPath(p: { x: number; y: number }[]) {
    if (p.length < 2) return '';
    let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${(padT + innerH).toFixed(2)} L ${pts[0].x.toFixed(2)} ${(padT + innerH).toFixed(2)} Z`;

  const xLabels = ['14 Apr', '20 Apr', '26 Apr', '2 May', '8 May', '14 May'];

  return (
    <div
      className="mt-3.5 rounded-[12px] border px-5 pb-4 pt-5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold" style={{ color: C.ink }}>Daily spend trend</div>
        <div
          className="inline-flex gap-[2px] rounded-[8px] p-[3px]"
          style={{ background: '#f4f3f9' }}
        >
          {segments.map((s) => {
            const active = metric === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setMetric(s.id)}
                className="rounded-[5px] px-3 py-1 text-[12px] font-medium transition-colors"
                style={{
                  background: active ? '#ffffff' : 'transparent',
                  color:      active ? C.ink     : C.neutral5,
                  border:     active ? `1px solid ${C.border}` : '1px solid transparent',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="projChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={C.purple} stopOpacity={0.20} />
              <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#projChartFill)" />
          <path d={line} fill="none" stroke={C.purple} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-3 flex justify-between font-mono text-[11px] tabular" style={{ color: C.neutral4 }}>
          {xLabels.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({
  title, tone, items,
}: {
  title: string;
  tone: 'good' | 'bad';
  items: Campaign[];
}) {
  const dot   = tone === 'good' ? C.greenDot : C.redDot;
  const label = tone === 'good' ? C.green    : C.red;
  return (
    <div
      className="rounded-[12px] border px-5 py-5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
        <span
          className="font-mono text-[11px] font-semibold uppercase"
          style={{ color: label, letterSpacing: '0.14em' }}
        >
          {title}
        </span>
      </div>
      <div>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          const cpaColor = c.cpaTone === 'bad' ? C.red : c.cpaTone === 'good' ? C.green : C.neutral7;
          return (
            <a
              key={c.name}
              href="#"
              className="block py-3.5 transition-colors hover:bg-[#fafafd]"
              style={{ borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}` }}
            >
              <div className="font-mono text-[14px] font-semibold" style={{ color: C.ink }}>
                {c.name}
              </div>
              <div className="mt-1.5 tabular text-[12px]" style={{ color: C.neutral5 }}>
                {c.meta}
                <span className="mx-1.5" style={{ color: C.neutral3 }}>·</span>
                <span style={{ color: cpaColor, fontWeight: c.cpaTone === 'bad' ? 600 : 500 }}>{c.cpa}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
