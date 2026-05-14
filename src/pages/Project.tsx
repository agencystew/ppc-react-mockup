import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown,
  Lightning, CaretDown,
  ChatCircleDots, Command,
  Detective, Microscope, Drop,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';

// Project detail · /projects/:id
//
// Editorial-grade dashboard. Light page with a single signature moment —
// three dark "Run an agent" cards in the middle and a dark command bar at
// the foot. Every section title is punctuated by a purple period, the
// page's visual leitmotif.
//
// Sections, top to bottom:
//   1. Breadcrumb + Run agent CTA
//   2. Hero (avatar, name, industry, critical/warning pill)
//   3. Tabs (Overview default; others stubbed)
//   4. Today's brief — 3 prioritised findings, money on the right
//   5. Run an agent — 3 dark agent cards (signature moment)
//   6. Performance — 4 KPI cards + Daily spend trend chart
//   7. Recent activity — vertical timeline
//   8. Campaigns — Top performers vs Needs attention
//   9. Ask-about command bar (dark)

// ─── Tokens ────────────────────────────────────────────────────────────
// Mockup palette. Locked. Kept inline so the page reads top to bottom.
const C = {
  pageBg:    '#f7f6fc',
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
  greenSoft: '#052e16',
  amber:     '#d97706',
  amberDot:  '#f59e0b',
  red:       '#dc2626',
  redDot:    '#ef4444',

  // Dark surfaces — for the agent cards + command bar.
  darkBg:     '#0a0a0f',
  darkBorder: '#1a1a22',
  darkText:   '#b8b8c0',
  darkMuted:  '#7a7a86',
  darkKbdBg:  'rgba(255,255,255,0.04)',
  darkKbdBor: '#1f1f28',
} as const;

// ─── Mock data ─────────────────────────────────────────────────────────

type FindingTone = 'critical' | 'warning';
interface Finding {
  tone: FindingTone;
  title: string;
  source: string;
  meta: string;
  rightTop: React.ReactNode;
  rightTopColor: string;
  rightBottom: string;
}

const FINDINGS: Finding[] = [
  {
    tone: 'critical',
    title: 'Wasted spend in non-converting search terms',
    source: 'Search Term Audit',
    meta: '2h ago · 47 negative candidates surfaced',
    rightTop: <><span className="tabular">$4,200</span><span className="text-[10px] font-normal text-[#a1a1aa]">/mo</span></>,
    rightTopColor: 'text-[#16a34a]',
    rightBottom: 'recoverable',
  },
  {
    tone: 'warning',
    title: 'CPA up 43% in or_sud_search',
    source: 'CPA Monitor',
    meta: '1d ago · $76 to $109 week over week',
    rightTop: <><span className="tabular">$1,200</span><span className="text-[10px] font-normal text-[#a1a1aa]">/mo</span></>,
    rightTopColor: 'text-[#d97706]',
    rightBottom: 'at risk',
  },
  {
    tone: 'warning',
    title: '3 PMAX assets rated "Poor"',
    source: 'PMAX Asset Review',
    meta: '5h ago · headline and description swaps recommended',
    rightTop: 'CTR uplift',
    rightTopColor: 'text-[#3f3f46]',
    rightBottom: 'est. 0.4 to 0.8pp',
  },
];

const AGENT_CARDS = [
  {
    slug: 'competitor-spy',
    icon: Detective,
    chipBg: 'rgba(251,191,36,0.12)',
    chipFg: '#fbbf24',
    title: 'Competitor Spy',
    blurb: 'A live read on every competitor in your auction. The angles, the spend, the gaps.',
  },
  {
    slug: 'deep-account-audit',
    icon: Microscope,
    chipBg: 'rgba(96,165,250,0.12)',
    chipFg: '#60a5fa',
    title: 'Deep Account Audit',
    blurb: 'Structure, alignment, waste, growth ceilings. Client-ready output you hand straight to the meeting.',
  },
  {
    slug: 'spend-leak',
    icon: Drop,
    chipBg: 'rgba(34,211,238,0.12)',
    chipFg: '#22d3ee',
    title: 'Spend Leak Detector',
    blurb: "Every place your budget is bleeding without conversions, ranked by what's recoverable.",
  },
] as const;

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

// Daily spend, 32 points, follows mockup's mountain shape.
const SPEND_TREND = [
  3100,3300,3550,3800,4000,4400,4900,5100,5300,5500,5700,5900,
  6050,6200,6350,6450,6550,6500,6300,6050,5800,5500,5250,5000,
  4800,4650,4500,4350,4200,4050,3950,3850,
];

interface Campaign { name: string; meta: string; cpaTone?: 'bad' | 'good' | 'neutral'; cpa: string; }
const TOP_CAMPAIGNS: Campaign[] = [
  { name: 'oh_brand_search', meta: '$5,274 · 126 conv',  cpa: '$42 CPA', cpaTone: 'good'    },
  { name: 'or_brand_search', meta: '$4,810 · 56 conv',   cpa: '$86 CPA', cpaTone: 'neutral' },
  { name: 'oh_sud_search',   meta: '$5,362 · 87 conv',   cpa: '$62 CPA', cpaTone: 'neutral' },
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
      className="rounded-[14px] border px-7 py-7 sm:px-8 sm:py-8"
      style={{ background: C.pageBg, borderColor: '#e8e6f0', color: C.ink }}
    >
      {/* ── 1. Breadcrumb + Run agent ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.neutral5 }}>
          <Link to="/projects" className="hover:text-[#18181b] transition-colors">Projects</Link>
          <span style={{ color: C.neutral3 }}>/</span>
          <span style={{ color: C.neutral7 }}>{project.name}</span>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(124,109,255,0.35)] transition-transform hover:-translate-y-px"
          style={{ background: C.purple }}
        >
          <Lightning size={14} weight="fill" />
          Run agent
          <CaretDown size={11} weight="bold" className="opacity-70" />
        </button>
      </div>

      {/* ── 2. Hero ───────────────────────────────────────────────── */}
      <header className="mt-5 flex items-center gap-4">
        <div
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] text-[16px] font-semibold"
          style={{ background: avatar.bg, color: avatar.fg }}
        >
          {project.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h1
            className="text-[26px] font-semibold leading-[1.1]"
            style={{ color: C.ink, letterSpacing: '-0.018em' }}
          >
            {project.name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px]" style={{ color: C.neutral5 }}>
            <span>{project.industry}</span>
            <span style={{ color: C.neutral3 }}>·</span>
            <span>Lead gen</span>
            <span style={{ color: C.neutral3 }}>·</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: C.red }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.redDot }} />
              1 critical, 3 warnings
            </span>
          </div>
        </div>
      </header>

      {/* ── 3. Tabs ───────────────────────────────────────────────── */}
      <nav
        className="mt-6 flex items-center gap-0 border-b text-[12px]"
        style={{ borderColor: C.border }}
      >
        <Tab active>Overview</Tab>
        <Tab>Business context</Tab>
        <Tab>Competitors</Tab>
        <Tab>AI instructions</Tab>
        <Tab>Settings</Tab>
      </nav>

      {/* ── 4. Today's brief ──────────────────────────────────────── */}
      <SectionHeading
        title="Today's brief"
        sub={
          <>
            <span className="tabular">4</span> findings · est.{' '}
            <span className="tabular font-medium" style={{ color: C.green }}>$5,400/mo</span>{' '}
            recoverable · updated 2h ago
          </>
        }
        right={<HeaderLink to="#">Run all audits</HeaderLink>}
        marginTop="mt-6"
      />

      <div
        className="mt-3.5 overflow-hidden rounded-[10px] border"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        {FINDINGS.map((f, i) => {
          const isLast = i === FINDINGS.length - 1;
          const dot = f.tone === 'critical' ? C.redDot : C.amberDot;
          return (
            <a
              key={i}
              href="#"
              className="grid grid-cols-[14px_1fr_auto_14px] items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[#fafafd]"
              style={{
                borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}`,
              }}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{
                  background: dot,
                  boxShadow: f.tone === 'critical' ? `0 0 0 3px rgba(239,68,68,0.12)` : 'none',
                }}
              />
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium leading-tight" style={{ color: C.ink }}>
                  {f.title}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: C.neutral5 }}>
                  <span>{f.source}</span>
                  <span className="mx-1.5" style={{ color: C.neutral3 }}>·</span>
                  {f.meta}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[13px] font-semibold leading-none ${f.rightTopColor}`}>
                  {f.rightTop}
                </div>
                <div className="mt-1 text-[10px]" style={{ color: C.neutral4 }}>
                  {f.rightBottom}
                </div>
              </div>
              <ArrowRight size={13} weight="bold" style={{ color: C.neutral4 }} />
            </a>
          );
        })}
      </div>

      {/* ── 5. Run an agent — signature dark cards ───────────────── */}
      <SectionHeading
        title="Run an agent"
        right={<HeaderLink to="/agents">Browse all 24</HeaderLink>}
        marginTop="mt-12"
      />

      <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {AGENT_CARDS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.slug}
              to={`/agents/${a.slug}`}
              className="group relative flex flex-col rounded-[12px] border p-5 transition-all duration-200 hover:-translate-y-px hover:border-[#2a2a36]"
              style={{ background: C.darkBg, borderColor: C.darkBorder }}
            >
              <div
                className="grid h-[42px] w-[42px] place-items-center rounded-[10px]"
                style={{ background: a.chipBg }}
              >
                <Icon size={22} weight="duotone" style={{ color: a.chipFg }} />
              </div>

              <div className="mt-5 text-[15px] font-medium leading-snug tracking-[-0.005em] text-white">
                {a.title}<span style={{ color: C.purpleSoft }}>.</span>
              </div>
              <div className="mt-2 flex-1 text-[12px] leading-[1.55]" style={{ color: C.darkText }}>
                {a.blurb}
              </div>

              <div
                className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium"
                style={{ color: C.purpleSoft }}
              >
                Send in
                <ArrowRight size={12} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── 6. Performance ────────────────────────────────────────── */}
      <SectionHeading
        title="Performance"
        right={
          <button
            className="inline-flex items-center gap-1.5 rounded-[6px] border bg-white px-2.5 py-1 text-[11px] font-medium"
            style={{ borderColor: C.border, color: C.neutral7 }}
          >
            Last 30 days
            <CaretDown size={10} weight="bold" style={{ color: C.neutral4 }} />
          </button>
        }
        marginTop="mt-12"
      />

      <div className="mt-3.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {KPI_CARDS.map((k) => (
          <KpiCardBlock key={k.label} kpi={k} />
        ))}
      </div>

      <DailyTrendChart data={SPEND_TREND} />

      {/* ── 7. Recent activity ───────────────────────────────────── */}
      <SectionHeading
        title="Recent activity"
        right={
          <Link to="#" className="text-[12px] font-medium" style={{ color: C.purple }}>
            View all
          </Link>
        }
        marginTop="mt-10"
      />

      <div className="relative mt-3.5 pl-1">
        <div
          className="absolute bottom-3 left-[5.5px] top-3 w-px"
          style={{ background: C.border }}
        />
        {ACTIVITY.map((a) => (
          <div key={a.title} className="relative flex items-start gap-4 py-2.5">
            <span
              className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full"
              style={{
                background: C.greenDot,
                boxShadow: `0 0 0 2px ${C.pageBg}`,
              }}
            />
            <div className="flex flex-1 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: C.ink }}>
                  {a.title}
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: C.neutral5 }}>
                  {a.meta}
                </div>
              </div>
              <div className="text-[11px] whitespace-nowrap" style={{ color: C.neutral4 }}>
                {a.when}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 8. Campaigns ─────────────────────────────────────────── */}
      <SectionHeading
        title="Campaigns"
        sub={<><span className="tabular">152</span> total · <span className="tabular">8</span> types</>}
        right={
          <Link to="#" className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: C.purple }}>
            View all <ArrowRight size={11} weight="bold" />
          </Link>
        }
        marginTop="mt-10"
      />

      <div className="mt-3.5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CampaignCard title="Top performers" tone="good" items={TOP_CAMPAIGNS} />
        <CampaignCard title="Needs attention" tone="bad"  items={BAD_CAMPAIGNS} />
      </div>

      {/* ── 9. Ask command bar ───────────────────────────────────── */}
      <div
        className="mt-8 flex items-center gap-3 rounded-[12px] border px-4 py-3.5"
        style={{ background: C.darkBg, borderColor: C.darkBorder }}
      >
        <ChatCircleDots size={17} weight="duotone" style={{ color: C.purpleSoft }} />
        <span className="flex-1 text-[13px]" style={{ color: C.darkText }}>
          Ask about <span style={{ color: '#ffffff' }}>{project.name}</span>
          <span className="mx-1.5" style={{ color: C.darkMuted }}>·</span>
          try "where am I wasting spend?"
        </span>
        <kbd
          className="inline-flex items-center gap-[2px] rounded-[5px] border px-1.5 py-0.5 font-mono text-[10px] font-medium"
          style={{ background: C.darkKbdBg, borderColor: C.darkKbdBor, color: C.darkText }}
        >
          <Command size={9} weight="bold" />K
        </kbd>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

function SectionHeading({
  title, sub, right, marginTop = 'mt-10',
}: {
  title: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  marginTop?: string;
}) {
  return (
    <div className={`${marginTop} flex items-baseline justify-between gap-4`}>
      <div>
        <h2
          className="text-[16px] font-medium leading-tight"
          style={{ color: C.ink, letterSpacing: '-0.01em' }}
        >
          {title}<span style={{ color: C.purple }}>.</span>
        </h2>
        {sub && (
          <p className="mt-1 text-[11px]" style={{ color: C.neutral5 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function HeaderLink({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
      style={{ color: C.purple }}
    >
      {children}
      <ArrowRight size={11} weight="bold" />
    </Link>
  );
}

function Tab({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className="-mb-px border-b-2 px-3.5 py-2.5 transition-colors"
      style={{
        color: active ? C.ink : C.neutral5,
        fontWeight: active ? 500 : 400,
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
      className="rounded-[10px] border px-3.5 py-3.5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div
        className="text-[10px] font-medium uppercase"
        style={{ color: C.neutral5, letterSpacing: '0.1em' }}
      >
        {kpi.label}
      </div>
      <div className="tabular mt-2 text-[20px] font-semibold leading-none tracking-[-0.01em]" style={{ color: C.ink }}>
        {kpi.value}
      </div>
      <div className="tabular mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: deltaColor }}>
        <Arrow size={10} weight="bold" />
        {kpi.delta}
      </div>
      <Sparkline points={kpi.spark} color={C.purple} className="mt-1.5" />
    </div>
  );
}

function Sparkline({ points, color, className = '' }: { points: number[]; color: string; className?: string }) {
  const W = 120, H = 22, max = 22;
  const stepX = W / (points.length - 1);
  const path = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${max}`} className={`block ${className}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
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

  const W = 600, H = 130;
  const padL = 0, padR = 0, padT = 6, padB = 22;
  const maxY = Math.max(...data) * 1.1;
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
      className="mt-3 rounded-[10px] border px-4 pb-3 pt-3.5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[12px]" style={{ color: C.neutral7 }}>Daily spend trend</div>
        <div
          className="inline-flex gap-[2px] rounded-[6px] p-[3px]"
          style={{ background: '#f4f3f9' }}
        >
          {segments.map((s) => {
            const active = metric === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setMetric(s.id)}
                className="rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition-colors"
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

      <div className="mt-3.5">
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="projChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={C.purple} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#projChartFill)" />
          <path d={line} fill="none" stroke={C.purple} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-2 flex justify-between text-[10px] tabular" style={{ color: C.neutral4 }}>
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
      className="rounded-[10px] border px-4 py-3.5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
        <span
          className="font-mono text-[10px] font-medium uppercase"
          style={{ color: label, letterSpacing: '0.12em' }}
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
              className="block py-2.5 transition-colors hover:bg-[#fafafd]"
              style={{ borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}` }}
            >
              <div className="font-mono text-[12px] font-medium" style={{ color: C.ink }}>
                {c.name}
              </div>
              <div className="mt-1 tabular text-[10.5px]" style={{ color: C.neutral5 }}>
                {c.meta}
                <span className="mx-1.5" style={{ color: C.neutral3 }}>·</span>
                <span style={{ color: cpaColor, fontWeight: c.cpaTone === 'bad' ? 600 : 400 }}>{c.cpa}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
