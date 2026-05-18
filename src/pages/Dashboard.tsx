import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown, CaretRight, Sparkle,
  MagnifyingGlass, Funnel,
  FileText, Warning, Eye, ShieldCheck,
  CurrencyDollar, ChartLineUp, Browser,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { AgentMascot } from '../components/AgentMascot';
import { PATTERNS, type Pattern } from '../mock/patterns';

/* Dashboard · /
 *
 *   1 · Portfolio Command Brief   Wide dark hero — eyebrow, headline, stats,
 *                                 priority queue, dual CTA, right-column slot
 *                                 reserved for the upcoming hero illustration.
 *   2 · Portfolio table           Filter chips + projects table with sparklines.
 *   3 · Patterns live strip       Purple billboard with cross-account graph.
 *
 * The hero breaks out of the standard 1240px page wrap and sits in a wider
 * container so its border lands close to the sidebar; the rest of the page
 * stays centered. AppShell.tsx flags '/' as fullBleed, so Dashboard manages
 * its own wrappers.
 */

/* ─── Per-project surface meta. Lives in the dashboard so the
 *     canonical PROJECTS mock stays minimal. */
type Trend = 'up' | 'down' | 'flat';
type Signal = { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' };
interface ProjectMeta {
  industry: string;
  spend: number;          // monthly $
  conv: number;           // last 30d
  cpa: number;            // $
  trend: Trend;           // 30-day direction
  trendPct: string;       // formatted "+12%"
  spark: number[];        // 12 normalized points 0..1
  signal: Signal;
  avatarBg: string;
  avatarRing: string;
}

const PROJECT_META: Record<string, ProjectMeta> = {
  'boulder-care': {
    industry: 'Addiction Recovery', spend: 83280, conv: 1068, cpa: 77.95,
    trend: 'up', trendPct: '+12%',
    spark: [0.30, 0.36, 0.42, 0.40, 0.48, 0.55, 0.50, 0.62, 0.66, 0.71, 0.75, 0.82],
    signal: { label: 'Growth', tone: 'good' },
    avatarBg: 'linear-gradient(155deg, #34D399 0%, #10A36C 100%)',
    avatarRing: 'rgba(16,163,108,0.35)',
  },
  'the-hoth': {
    industry: 'SEO Software', spend: 12783, conv: 16, cpa: 798.95,
    trend: 'up', trendPct: '+38%',
    spark: [0.42, 0.36, 0.40, 0.48, 0.55, 0.62, 0.68, 0.72, 0.80, 0.86, 0.92, 0.98],
    signal: { label: 'CPA spike', tone: 'bad' },
    avatarBg: 'linear-gradient(155deg, #F87171 0%, #DC2626 100%)',
    avatarRing: 'rgba(220,38,38,0.35)',
  },
  'durable': {
    industry: 'AI Website Builder', spend: 20373, conv: 1217, cpa: 16.74,
    trend: 'flat', trendPct: '+1%',
    spark: [0.50, 0.55, 0.52, 0.58, 0.55, 0.60, 0.58, 0.62, 0.60, 0.61, 0.62, 0.63],
    signal: { label: 'Budget pacing', tone: 'warn' },
    avatarBg: 'linear-gradient(155deg, #2DD4BF 0%, #0E9488 100%)',
    avatarRing: 'rgba(14,148,136,0.35)',
  },
  'linkbuilder': {
    industry: 'SEO Tool', spend: 1256, conv: 7, cpa: 179.51,
    trend: 'down', trendPct: '−6%',
    spark: [0.62, 0.58, 0.55, 0.50, 0.48, 0.46, 0.44, 0.42, 0.40, 0.38, 0.34, 0.30],
    signal: { label: 'Limited assets', tone: 'warn' },
    avatarBg: 'linear-gradient(155deg, #86EFAC 0%, #16A34A 100%)',
    avatarRing: 'rgba(22,163,74,0.35)',
  },
  'livingyoung': {
    industry: 'Med Spa', spend: 8414, conv: 28, cpa: 296.95,
    trend: 'up', trendPct: '+11%',
    spark: [0.40, 0.45, 0.42, 0.50, 0.55, 0.60, 0.62, 0.68, 0.70, 0.74, 0.78, 0.82],
    signal: { label: 'Growth', tone: 'good' },
    avatarBg: 'linear-gradient(155deg, #60A5FA 0%, #2563EB 100%)',
    avatarRing: 'rgba(37,99,235,0.35)',
  },
  'authority-builders': {
    industry: 'Link Building', spend: 6421, conv: 44, cpa: 145.93,
    trend: 'up', trendPct: '+9%',
    spark: [0.35, 0.40, 0.38, 0.45, 0.48, 0.52, 0.55, 0.58, 0.62, 0.65, 0.70, 0.74],
    signal: { label: 'Efficiency', tone: 'good' },
    avatarBg: 'linear-gradient(155deg, #A5B4FC 0%, #6366F1 100%)',
    avatarRing: 'rgba(99,102,241,0.35)',
  },
  'edwin-novel': {
    industry: 'D2C Jewelry', spend: 3214, conv: 31, cpa: 103.68,
    trend: 'flat', trendPct: '0%',
    spark: [0.55, 0.52, 0.56, 0.54, 0.55, 0.58, 0.55, 0.56, 0.55, 0.57, 0.55, 0.56],
    signal: { label: 'Stable', tone: 'neutral' },
    avatarBg: 'linear-gradient(155deg, #F0ABFC 0%, #C026D3 100%)',
    avatarRing: 'rgba(192,38,211,0.35)',
  },
  'flock': {
    industry: 'Travel SaaS', spend: 4677, conv: 73, cpa: 64.07,
    trend: 'up', trendPct: '+8%',
    spark: [0.42, 0.45, 0.48, 0.50, 0.52, 0.55, 0.58, 0.60, 0.63, 0.66, 0.68, 0.72],
    signal: { label: 'Growth', tone: 'good' },
    avatarBg: 'linear-gradient(155deg, #FCD34D 0%, #B45309 100%)',
    avatarRing: 'rgba(180,83,9,0.35)',
  },
};

/* ─── Top-of-hero stats row (5 chips) ────────────────────────────────── */

interface StatChip {
  Icon: typeof MagnifyingGlass;
  iconTint: string;     // foreground icon color
  iconBg: string;       // squircle bg behind icon
  iconRing: string;     // 1px inset border on squircle
  value: string;
  label: string;
}

const STATS: StatChip[] = [
  { Icon: MagnifyingGlass, iconTint: '#C7B0FF', iconBg: 'rgba(127,90,240,0.20)', iconRing: 'rgba(127,90,240,0.40)', value: '50', label: 'accounts\nscanned' },
  { Icon: FileText,        iconTint: '#C7B0FF', iconBg: 'rgba(127,90,240,0.20)', iconRing: 'rgba(127,90,240,0.40)', value: '18', label: 'reports\nready' },
  { Icon: Warning,         iconTint: '#FF8A7A', iconBg: 'rgba(224,82,79,0.18)',  iconRing: 'rgba(224,82,79,0.45)',  value: '6',  label: 'urgent' },
  { Icon: Eye,             iconTint: '#F0C57A', iconBg: 'rgba(214,154,53,0.18)', iconRing: 'rgba(214,154,53,0.45)', value: '12', label: 'watch' },
  { Icon: ShieldCheck,     iconTint: '#7CDDB5', iconBg: 'rgba(93,194,162,0.18)', iconRing: 'rgba(93,194,162,0.40)', value: '32', label: 'healthy' },
];

/* ─── Priority queue rows (4 rows) ───────────────────────────────────── */

interface PriorityRow {
  Icon: typeof Warning;
  iconTint: string;
  iconBg: string;
  iconRing: string;
  label: string;
  /** Initials shown as account avatars (in order). */
  initials: string[];
  /** Avatar gradient backgrounds matched 1:1 to initials. */
  avatarBgs: string[];
  overflow: number;
  count: string;
  pillTint: string;
  pillBg: string;
  pillRing: string;
  to: string;
}

const QUEUE: PriorityRow[] = [
  {
    Icon: Warning, iconTint: '#FF8A7A',
    iconBg: 'rgba(224,82,79,0.18)', iconRing: 'rgba(224,82,79,0.45)',
    label: 'Critical accounts',
    initials: ['B', 'T', 'H'],
    avatarBgs: [
      PROJECT_META['boulder-care'].avatarBg,
      PROJECT_META['the-hoth'].avatarBg,
      'linear-gradient(155deg, #FB7185 0%, #DC2626 100%)',
    ],
    overflow: 8, count: '14 accounts',
    pillTint: '#FFB1A4', pillBg: 'rgba(224,82,79,0.16)', pillRing: 'rgba(224,82,79,0.38)',
    to: '/reports?filter=critical',
  },
  {
    Icon: CurrencyDollar, iconTint: '#F0C57A',
    iconBg: 'rgba(214,154,53,0.18)', iconRing: 'rgba(214,154,53,0.45)',
    label: 'Budget shifts',
    initials: ['A', 'G', 'M'],
    avatarBgs: [
      PROJECT_META['authority-builders'].avatarBg,
      'linear-gradient(155deg, #FCD34D 0%, #B45309 100%)',
      'linear-gradient(155deg, #F472B6 0%, #BE185D 100%)',
    ],
    overflow: 12, count: '18 accounts',
    pillTint: '#F0C57A', pillBg: 'rgba(214,154,53,0.16)', pillRing: 'rgba(214,154,53,0.38)',
    to: '/reports?filter=budget',
  },
  {
    Icon: ChartLineUp, iconTint: '#C7B0FF',
    iconBg: 'rgba(127,90,240,0.20)', iconRing: 'rgba(127,90,240,0.42)',
    label: 'Competitor moves',
    initials: ['S', 'R', 'D'],
    avatarBgs: [
      'linear-gradient(155deg, #C4B5FD 0%, #7C3AED 100%)',
      'linear-gradient(155deg, #FCA5A5 0%, #B91C1C 100%)',
      PROJECT_META['durable'].avatarBg,
    ],
    overflow: 6, count: '9 accounts',
    pillTint: '#C7B0FF', pillBg: 'rgba(127,90,240,0.16)', pillRing: 'rgba(127,90,240,0.42)',
    to: '/reports?filter=competitor',
  },
  {
    Icon: Browser, iconTint: '#9CC4FF',
    iconBg: 'rgba(96,165,250,0.18)', iconRing: 'rgba(96,165,250,0.40)',
    label: 'Landing page checks',
    initials: ['L', 'W', 'P'],
    avatarBgs: [
      PROJECT_META['linkbuilder'].avatarBg,
      'linear-gradient(155deg, #93C5FD 0%, #1D4ED8 100%)',
      'linear-gradient(155deg, #F0ABFC 0%, #7E22CE 100%)',
    ],
    overflow: 10, count: '12 accounts',
    pillTint: '#9CC4FF', pillBg: 'rgba(96,165,250,0.16)', pillRing: 'rgba(96,165,250,0.38)',
    to: '/reports?filter=landing',
  },
];

/* ════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  return (
    <>
      {/* Wider hero — breaks out of the standard 1240px wrap so its border
          sits close to the sidebar on widescreen displays. */}
      <div className="mx-auto w-full max-w-[1720px] px-4 pt-6 sm:px-5 sm:pt-7 lg:px-6 lg:pt-8">
        <ActivityHero />
      </div>

      {/* Rest of the dashboard — back to the standard centered column so the
          table and pattern strip stay readable at any viewport width. */}
      <div className="mx-auto w-full max-w-[1240px] space-y-6 px-6 pb-10 pt-6 lg:px-8 lg:pb-12 lg:pt-8">
        <PortfolioTable />
        <PatternsLiveStrip />
      </div>
    </>
  );
}

/* ─── 1 · Portfolio Command Brief (dark hero) ────────────────────────── */

function ActivityHero() {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background: '#08060F',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      {/* Faint perspective grid, masked toward the edges. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
        }}
      />
      {/* Single soft purple bloom anchored top-left, biased to the copy column. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[860px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.22) 0%, transparent 65%)',
        }}
      />

      <div className="relative grid gap-10 px-8 pb-9 pt-8 sm:px-12 sm:pb-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:gap-14">
        {/* ─── Copy column ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <EyebrowChip>Portfolio Command Brief</EyebrowChip>

          <h1 className="ppc-h1 mt-6 text-white">
            Morning, <span style={{ color: '#9F86FF' }}>Stewy.</span>
          </h1>

          <p className="ppc-h3 mt-3 text-white">
            Your portfolio brief is ready.
          </p>

          <p className="mt-2.5 max-w-[520px] text-[14px] leading-[1.55] text-white/65">
            Agents scanned accounts, grouped the noise, and queued{' '}
            <span style={{ color: '#9F86FF' }} className="font-medium">the work that matters most</span>.
          </p>

          <StatsBar />

          <div className="mt-7">
            <PriorityHeader />
            <ul className="mt-3 flex flex-col gap-[6px]">
              {QUEUE.map((row) => (
                <PriorityQueueRow key={row.label} row={row} />
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              to="/reports"
              className="ppcio-cta group relative inline-flex items-center gap-2 rounded-full px-[18px] py-[11px] text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-[1px]"
              style={{
                background:
                  'linear-gradient(135deg, #9F86FF 0%, #7F5AF0 50%, #6A45E2 100%)',
                boxShadow:
                  '0 4px 18px rgba(70,49,134,0.55), 0 0 12px rgba(209,133,236,0.50) inset, 0 0 0 1px rgba(255,255,255,0.10)',
              }}
            >
              <Sparkle size={14} weight="fill" />
              See all reports
            </Link>
            <Link
              to="/reports?queue=1"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C7B0FF] transition-colors hover:text-white"
            >
              Review priority queue
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </div>

        {/* ─── Right column · hero-graphic slot ────────────────────
         *
         * Stewart is supplying a new hero illustration (brain mascot +
         * arcade controller + URGENT/WATCH/HEALTHY cluster bubbles).
         * The existing AgentMascot holds the slot open at the correct
         * column width so the layout doesn't reflow when the asset
         * lands — swap the inner block for the new graphic when ready.
         */}
        <div className="relative hidden min-w-0 items-center justify-center lg:flex">
          <AgentMascot size={300} />
        </div>
      </div>
    </section>
  );
}

function EyebrowChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-[5px] text-[11px] font-semibold text-white/80">
      <Sparkle size={11} weight="fill" className="text-[#C7B0FF]" />
      {children}
    </span>
  );
}

/* ─── Stats bar — 5 chips, icon left + number/label stack right ──────── */

function StatsBar() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-[12px] px-3 py-[10px]"
          style={{
            background: 'rgba(255,255,255,0.025)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
          }}
        >
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px]"
            style={{
              background: s.iconBg,
              boxShadow: `inset 0 0 0 1px ${s.iconRing}`,
            }}
          >
            <s.Icon size={17} weight="bold" style={{ color: s.iconTint }} />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="font-display text-[22px] font-black leading-none tracking-[-0.020em] text-white tabular-nums">
              {s.value}
            </div>
            <div className="mt-[3px] whitespace-pre-line text-[11px] font-medium leading-[1.15] text-white/55">
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Priority queue header + rows ───────────────────────────────────── */

function PriorityHeader() {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
      Priority queue
      <Sparkle size={11} weight="fill" className="text-[#C7B0FF]" />
    </div>
  );
}

function PriorityQueueRow({ row }: { row: PriorityRow }) {
  return (
    <li>
      <Link
        to={row.to}
        className="group flex items-center gap-3 rounded-[12px] px-3 py-[10px] transition-colors hover:bg-white/[0.05] sm:gap-4 sm:px-4"
        style={{
          background: 'rgba(255,255,255,0.025)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px]"
          style={{
            background: row.iconBg,
            boxShadow: `inset 0 0 0 1px ${row.iconRing}`,
          }}
        >
          <row.Icon size={17} weight="bold" style={{ color: row.iconTint }} />
        </span>

        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.005em] text-white">
          {row.label}
        </span>

        {/* Avatar stack — single-letter initials per affected account. */}
        <span className="hidden items-center sm:flex">
          {row.initials.map((initial, i) => (
            <span
              key={`${initial}-${i}`}
              className={`grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] font-bold text-white ${i > 0 ? '-ml-[7px]' : ''}`}
              style={{
                background: row.avatarBgs[i],
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 2px #08060F',
              }}
            >
              {initial}
            </span>
          ))}
          <span
            className="ml-1.5 inline-flex items-center rounded-full px-[7px] py-[3px] text-[10.5px] font-bold text-white/70 tabular-nums"
            style={{
              background: 'rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
            }}
          >
            +{row.overflow}
          </span>
        </span>

        <span
          className="inline-flex shrink-0 items-center rounded-full px-2.5 py-[4px] text-[11.5px] font-semibold tabular-nums"
          style={{
            background: row.pillBg,
            color: row.pillTint,
            boxShadow: `inset 0 0 0 1px ${row.pillRing}`,
          }}
        >
          {row.count}
        </span>

        <CaretRight
          size={13}
          weight="bold"
          className="shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70"
        />
      </Link>
    </li>
  );
}

/* ─── 3 · Portfolio table ────────────────────────────────────────────── */

function PortfolioTable() {
  const counts = {
    all: PROJECTS.length,
    critical: PROJECTS.filter((p) => projectHealth(p.id) === 'critical').length,
    watch:    PROJECTS.filter((p) => projectHealth(p.id) === 'watch').length,
    healthy:  PROJECTS.filter((p) => projectHealth(p.id) === 'healthy').length,
  };

  return (
    <section className="space-y-4">
      {/* Filter row + section title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="ppc-h3 text-ppc-ink">
            Your portfolio<span className="ppc-period">.</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="All" count={counts.all} active />
          <FilterChip label="Critical" count={counts.critical} tone="bad" />
          <FilterChip label="Watch" count={counts.watch} tone="warn" />
          <FilterChip label="Healthy" count={counts.healthy} tone="good" />
          <SearchPill />
          <FilterButton />
        </div>
      </div>

      {/* The table card */}
      <div
        className="overflow-hidden rounded-[16px] bg-white"
        style={{ boxShadow: '0 0 0 1px #e7e2ef' }}
      >
        <div className="hidden grid-cols-[minmax(220px,1.4fr)_92px_120px_92px_72px_88px_minmax(120px,1fr)] gap-4 border-b border-[#efeaf4] bg-[#FBF9FD] px-5 py-[10px] sm:grid">
          <ColHead>Account</ColHead>
          <ColHead>Health</ColHead>
          <ColHead>Trend (30d)</ColHead>
          <ColHead align="right">Spend</ColHead>
          <ColHead align="right">Conv.</ColHead>
          <ColHead align="right">CPA</ColHead>
          <ColHead>Top signal</ColHead>
        </div>
        <div>
          {PROJECTS.map((p, i) => (
            <ProjectRow
              key={p.id}
              project={p}
              isLast={i === PROJECTS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ColHead({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <span
      className={`text-[10.5px] font-bold uppercase tracking-[0.08em] text-ppc-text-muted ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </span>
  );
}

function ProjectRow({
  project,
  isLast,
}: {
  project: typeof PROJECTS[number];
  isLast: boolean;
}) {
  const meta = PROJECT_META[project.id];
  const health = projectHealth(project.id);
  return (
    <Link
      to={`/projects/${project.id}`}
      className={`group grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-[#FBF9FD] sm:grid-cols-[minmax(220px,1.4fr)_92px_120px_92px_72px_88px_minmax(120px,1fr)] sm:items-center ${
        isLast ? '' : 'border-b border-[#f1ecf6]'
      }`}
    >
      {/* Account */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-[14px] font-bold text-white"
          style={{
            background: meta.avatarBg,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.30), 0 0 0 1px ${meta.avatarRing}`,
          }}
        >
          {project.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink">
            {project.name}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-ppc-text-muted">
            {meta.industry}
          </p>
        </div>
      </div>

      {/* Health */}
      <div>
        <HealthPill health={health} />
      </div>

      {/* Trend */}
      <div>
        <Sparkline points={meta.spark} health={health} />
      </div>

      {/* Spend */}
      <div className="text-right text-[13.5px] font-semibold tabular-nums text-ppc-ink">
        ${formatMoney(meta.spend)}
      </div>

      {/* Conv */}
      <div className="text-right text-[13.5px] tabular-nums text-ppc-ink">
        {meta.conv.toLocaleString('en-US')}
      </div>

      {/* CPA */}
      <div className="text-right text-[13.5px] tabular-nums text-ppc-ink">
        ${meta.cpa.toFixed(2)}
      </div>

      {/* Top signal */}
      <div className="flex items-center justify-between gap-2">
        <SignalPill signal={meta.signal} trend={meta.trend} trendPct={meta.trendPct} />
        <CaretRight
          size={12}
          weight="bold"
          className="shrink-0 text-ppc-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ppc-purple-500"
        />
      </div>
    </Link>
  );
}

function HealthPill({ health }: { health: 'healthy' | 'watch' | 'critical' }) {
  const styles = {
    healthy:  { bg: '#E6F7EE', fg: '#1F8A5A', dot: '#1F8A5A', label: 'Good' },
    watch:    { bg: '#FFF1D9', fg: '#915214', dot: '#915214', label: 'Watch' },
    critical: { bg: '#FFE3DE', fg: '#B7321E', dot: '#B7321E', label: 'Critical' },
  }[health];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[11.5px] font-semibold"
      style={{
        background: styles.bg,
        color: styles.fg,
        boxShadow: `inset 0 0 0 1px ${styles.fg}25`,
      }}
    >
      <span
        aria-hidden
        className="h-[5px] w-[5px] rounded-full"
        style={{ background: styles.dot, boxShadow: `0 0 0 2px ${styles.dot}25` }}
      />
      {styles.label}
    </span>
  );
}

function SignalPill({
  signal,
  trend,
  trendPct,
}: {
  signal: Signal;
  trend: Trend;
  trendPct: string;
}) {
  const tones = {
    good:    { bg: '#E6F7EE', fg: '#1F8A5A', ring: 'rgba(31,138,90,0.18)' },
    warn:    { bg: '#FFF1D9', fg: '#915214', ring: 'rgba(145,82,20,0.18)' },
    bad:     { bg: '#FFE3DE', fg: '#B7321E', ring: 'rgba(183,50,30,0.18)' },
    neutral: { bg: '#EEEDFE', fg: '#534AB7', ring: 'rgba(83,74,183,0.18)' },
  }[signal.tone];

  const Arrow =
    trend === 'up'   ? ArrowUp :
    trend === 'down' ? ArrowDown :
                       null;

  return (
    <span
      className="inline-flex min-w-0 items-center gap-1.5 rounded-[7px] px-[9px] py-[4px] text-[11.5px] font-semibold"
      style={{
        background: tones.bg,
        color: tones.fg,
        boxShadow: `inset 0 0 0 1px ${tones.ring}`,
      }}
    >
      <span className="truncate">{signal.label}</span>
      {Arrow && <Arrow size={10} weight="bold" />}
      <span className="text-[11px] font-semibold tabular-nums opacity-80">{trendPct}</span>
    </span>
  );
}

function Sparkline({
  points,
  health,
}: {
  points: number[];
  health: 'healthy' | 'watch' | 'critical';
}) {
  const stroke =
    health === 'critical' ? '#B7321E' :
    health === 'watch'    ? '#915214' :
                            '#7F5AF0';
  const fill =
    health === 'critical' ? 'rgba(183,50,30,0.15)' :
    health === 'watch'    ? 'rgba(145,82,20,0.13)' :
                            'rgba(127,90,240,0.18)';

  const W = 92;
  const H = 28;
  const PAD = 2;
  const stepX = (W - PAD * 2) / (points.length - 1);
  const toY = (v: number) => PAD + (1 - v) * (H - PAD * 2);
  const linePath = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${PAD + i * stepX} ${toY(v)}`)
    .join(' ');
  const areaPath = `${linePath} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;
  const lastX = PAD + (points.length - 1) * stepX;
  const lastY = toY(points[points.length - 1]);

  return (
    <svg width={W} height={H} aria-hidden className="block">
      <path d={areaPath} fill={fill} />
      <path d={linePath} stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} />
      <circle cx={lastX} cy={lastY} r={4} fill={stroke} opacity={0.18} />
    </svg>
  );
}

function FilterChip({
  label,
  count,
  active,
  tone,
}: {
  label: string;
  count: number;
  active?: boolean;
  tone?: 'good' | 'warn' | 'bad';
}) {
  const toneFg =
    tone === 'good' ? '#1F8A5A' :
    tone === 'warn' ? '#915214' :
    tone === 'bad'  ? '#B7321E' :
                      undefined;
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-[6px] text-[12.5px] font-semibold transition-colors ${
        active
          ? 'text-white'
          : 'text-ppc-ink hover:bg-white'
      }`}
      style={
        active
          ? {
              background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 10px -4px rgba(127,90,240,0.45)',
            }
          : { background: 'transparent', boxShadow: 'inset 0 0 0 1px #d9d4ec' }
      }
    >
      <span style={!active && toneFg ? { color: toneFg } : undefined}>{label}</span>
      <span
        className="rounded-[5px] px-[6px] py-[1px] text-[11px] font-semibold tabular-nums"
        style={{
          background: active ? 'rgba(255,255,255,0.18)' : '#EEEDFE',
          color: active ? '#fff' : (toneFg ?? '#6b6480'),
        }}
      >
        {count}
      </span>
    </button>
  );
}

function SearchPill() {
  return (
    <div
      className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-[7px] text-[12.5px] text-ppc-text-muted"
      style={{ boxShadow: 'inset 0 0 0 1px #d9d4ec' }}
    >
      <MagnifyingGlass size={12} weight="bold" />
      <span>Search accounts</span>
    </div>
  );
}

function FilterButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-[7px] text-[12.5px] font-medium text-ppc-ink transition-colors hover:bg-[#FBF9FD]"
      style={{ boxShadow: 'inset 0 0 0 1px #d9d4ec' }}
    >
      <Funnel size={12} weight="bold" />
      Filters
    </button>
  );
}


/* ─── 4 · Patterns live strip ───────────────────────────────────────────
 *
 * Editorial purple billboard. Centered vertical composition matching
 * the v5 hero family (HoldTightBand, AgentCatalog hero):
 *   - status strip (LIVE left, EXPERIMENTAL right)
 *   - sparkle ornament divider
 *   - massive headline with PF-Marlet-Display italic-serif accent
 *   - body line
 *   - LARGE network graph (io brain centre + 8 project nodes around,
 *     3 colored arcs drawing this week's connections)
 *   - stats line with bold numbers (proper text size, not tiny mono)
 *   - 3 black callout cards, color-matched to graph arcs
 *   - centered ghost CTA
 * ?empty=1 flips to onboarding state. */

function PatternsLiveStrip() {
  const [params] = useSearchParams();
  const isEmpty = params.get('empty') === '1';
  const top3 = PATTERNS.slice(0, 3);
  const totalCount = PATTERNS.length;
  const projectsTouched = countUniqueProjects(PATTERNS);

  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-center"
      style={{
        background:
          'radial-gradient(120% 100% at 50% 0%, #8767F3 0%, #6A45E2 55%, #4D2EC9 100%)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.10) inset, 0 32px 80px -32px rgba(70,49,134,0.55)',
      }}
    >
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[-40%] h-[640px] w-[640px] -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 18% 30%, white 1px, transparent 1px), radial-gradient(circle at 78% 65%, white 1px, transparent 1px), radial-gradient(circle at 50% 90%, white 1px, transparent 1px)', backgroundSize: '160px 160px, 110px 110px, 200px 200px' }} />

      <div className="relative flex items-center justify-between px-7 pt-7 sm:px-10 sm:pt-8">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/80">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Live
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 px-2.5 py-[3px] text-[11px] font-semibold text-white/85">
          Experimental
        </span>
      </div>

      <div className="relative mx-auto max-w-[860px] px-7 pb-10 pt-7 sm:px-12 sm:pb-12 sm:pt-9">
        <Ornament />
        <h2 className="ppc-h1 mx-auto text-white">
          {isEmpty ? (
            <>Listening across <SerifAccent>your accounts</SerifAccent><SerifPeriod /></>
          ) : (
            <>Patterns this <SerifAccent>week</SerifAccent><SerifPeriod /></>
          )}
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[15.5px] leading-[1.55] text-white/75">
          {isEmpty
            ? 'Patterns surface after a few agent runs across 2+ accounts. Launch your first audit and io starts connecting the dots.'
            : `Across ${projectsTouched} projects this week, io surfaced ${totalCount} cross-account connections. The three worth seeing first:`}
        </p>
        <div className="mt-8 flex justify-center">
          <BrainGraph isEmpty={isEmpty} patterns={top3} />
        </div>
        <p className="mt-6 text-[13.5px] text-white/65">
          <span className="font-display font-extrabold text-white tabular-nums">{isEmpty ? 0 : totalCount}</span> patterns
          <span className="mx-2 text-white/30">·</span>
          <span className="font-display font-extrabold text-white tabular-nums">{projectsTouched}</span> projects watched
          {!isEmpty && (
            <>
              <span className="mx-2 text-white/30">·</span>
              <span className="font-display font-extrabold text-white tabular-nums">{top3.length}</span> worth seeing first
            </>
          )}
        </p>
      </div>

      <div className="relative px-7 pb-8 sm:px-10 sm:pb-9">
        {isEmpty ? (
          <WatchingForList />
        ) : (
          <div className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
            {top3.map((p, i) => (<PatternCard key={p.id} pattern={p} isFresh={i === 0} />))}
          </div>
        )}
      </div>

      <div className="relative flex justify-center px-7 pb-10 sm:px-10 sm:pb-12">
        <Link
          to={isEmpty ? '/agents' : '/patterns'}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/[0.08] px-[20px] py-[11px] text-[13.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-white/[0.18]"
        >
          {isEmpty ? 'Launch first audit' : `See all ${totalCount} patterns`}
          <ArrowRight size={13} weight="bold" />
        </Link>
      </div>
    </section>
  );
}

function SerifAccent({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif italic font-bold" style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif', color: '#E0D4FF' }}>
      {children}
    </span>
  );
}

function SerifPeriod() {
  return (
    <span className="font-serif italic" style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif', color: '#E0D4FF' }}>.</span>
  );
}

function Ornament() {
  return (
    <div className="relative mx-auto mb-6 flex items-center justify-center gap-3" aria-hidden>
      <span className="block h-px w-[56px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.32) 100%)' }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 0.5L8.2 5.8L13.5 7L8.2 8.2L7 13.5L5.8 8.2L0.5 7L5.8 5.8L7 0.5Z" fill="#E0D4FF" opacity="0.9" />
      </svg>
      <span className="block h-px w-[56px]" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.32) 0%, transparent 100%)' }} />
    </div>
  );
}

function PatternCard({ pattern, isFresh }: { pattern: Pattern; isFresh: boolean }) {
  const accent = categoryAccent(pattern.category);
  const firstTwo = pattern.affected.slice(0, 2);
  const overflow = pattern.affected.length - firstTwo.length;
  return (
    <Link
      to={`/patterns#${pattern.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-[16px] p-5 text-left transition-transform hover:-translate-y-0.5"
      style={{ background: '#0C0C0E', boxShadow: '0 20px 48px -22px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          {shortCategory(pattern.category)}
        </span>
        {pattern.spotted && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60">
            {isFresh && (
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
            {pattern.spotted}
          </span>
        )}
      </div>
      <p className="line-clamp-3 text-[15px] font-semibold leading-[1.4] text-white">{pattern.headline}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-white/70">
          {firstTwo.map((p, idx) => (
            <span key={p.id} className="inline-flex min-w-0 items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
              <span className="truncate">{p.name}</span>
              {idx < firstTwo.length - 1 && <span className="text-white/30">·</span>}
            </span>
          ))}
          {overflow > 0 && <span className="shrink-0 text-white/50">+{overflow}</span>}
        </div>
        <CaretRight size={12} weight="bold" className="shrink-0 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
      </div>
    </Link>
  );
}

function WatchingForList() {
  const items = [
    { label: 'Cross-account CPA spikes',          color: '#F87171' },
    { label: 'Recurring negative-keyword themes', color: '#FB923C' },
    { label: 'PMAX intent drift',                  color: '#A88CFF' },
    { label: 'Auction landscape shifts',           color: '#22D3EE' },
  ];
  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((it) => (
          <span key={it.label} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.05] px-3.5 py-[7px] text-[12.5px] text-white/80">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: it.color, opacity: 0.9 }} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BrainGraph({ isEmpty, patterns }: { isEmpty: boolean; patterns: Pattern[] }) {
  const W = 560;
  const H = 320;
  const center = { x: W / 2, y: H / 2 };
  const radiusX = 230;
  const radiusY = 130;
  const projectOrder = ['boulder-care','the-hoth','linkbuilder','authority-builders','livingyoung','edwin-novel','flock','durable'];
  const nodes = projectOrder.map((id, i) => {
    const angle = -Math.PI / 2 + (i * (Math.PI * 2)) / 8;
    return { id, x: center.x + radiusX * Math.cos(angle), y: center.y + radiusY * Math.sin(angle) };
  });
  const nodeById = (id: string) => nodes.find((n) => n.id === id);
  const arcs = isEmpty ? [] : patterns.map((p) => ({
    id: p.id,
    color: categoryAccent(p.category),
    points: p.affected.map((a) => nodeById(a.id)).filter((n): n is { id: string; x: number; y: number } => Boolean(n)),
  }));
  const nodeColor = new Map<string, string>();
  if (!isEmpty) {
    for (const p of patterns) {
      const color = categoryAccent(p.category);
      for (const a of p.affected) {
        if (!nodeColor.has(a.id)) nodeColor.set(a.id, color);
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[560px]" aria-hidden>
      <defs>
        <radialGradient id="brainCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="white" stopOpacity="1" />
          <stop offset="60%" stopColor="white" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0D4FF" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {nodes.map((n) => (
        <line key={n.id} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.28)" strokeWidth={0.8} strokeDasharray="3 4" />
      ))}
      {arcs.map((arc) => (
        <polyline key={arc.id} fill="none" stroke={arc.color} strokeWidth={3} strokeOpacity={0.96} strokeLinecap="round" strokeLinejoin="round" points={arc.points.map((p) => `${p.x},${p.y}`).join(' ')} style={{ filter: `drop-shadow(0 0 10px ${arc.color}cc)` }} />
      ))}
      {nodes.map((n) => {
        const color = nodeColor.get(n.id);
        return (
          <g key={n.id}>
            {color && <circle cx={n.x} cy={n.y} r={16} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />}
            <circle cx={n.x} cy={n.y} r={color ? 7 : 5} fill={color || 'rgba(255,255,255,0.92)'} />
          </g>
        );
      })}
      <circle cx={center.x} cy={center.y} r={56} fill="url(#brainGlow)" />
      <circle cx={center.x} cy={center.y} r={32} fill="url(#brainCore)" />
      <text x={center.x} y={center.y + 7} textAnchor="middle" fontSize="24" fontFamily="Figtree, system-ui, sans-serif" fontWeight={900} fill="#5A3FE0" letterSpacing="-1.2">io</text>
    </svg>
  );
}

function shortCategory(category: string): string {
  return category.toUpperCase()
    .replace('AUCTION INSIGHTS — NEW ENTRANT', 'NEW ENTRANT')
    .replace('AUDIENCE SIGNAL OPPORTUNITY',    'AUDIENCE SIGNAL')
    .replace('VERTICAL-WIDE BRAND EROSION',    'BRAND EROSION')
    .replace('SEARCH LOST IMPRESSION SHARE',   'LOST IMPR. SHARE');
}

function categoryAccent(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('pmax') || c.includes('audience') || c.includes('asset'))   return '#A88CFF';
  if (c.includes('budget') || c.includes('pacing') || c.includes('bid'))     return '#FBBF24';
  if (c.includes('daypart') || c.includes('leak') || c.includes('spend') ||
      c.includes('fraud')   || c.includes('geo'))                              return '#FB923C';
  if (c.includes('tracking') || c.includes('attribution') ||
      c.includes('conversion'))                                                return '#22D3EE';
  if (c.includes('brand') || c.includes('competitor') || c.includes('entry')) return '#F472B6';
  if (c.includes('auction') || c.includes('quality') || c.includes('ctr') ||
      c.includes('erosion'))                                                   return '#F87171';
  return '#A88CFF';
}

function countUniqueProjects(patterns: Pattern[]): number {
  const set = new Set<string>();
  patterns.forEach((p) => p.affected.forEach((a) => set.add(a.id)));
  return set.size;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function projectHealth(projectId: string): 'healthy' | 'watch' | 'critical' {
  const accounts = ACCOUNTS.filter((a) => a.projectId === projectId);
  if (accounts.some((a) => a.health === 'attention')) return 'critical';
  if (accounts.some((a) => a.health === 'warning'))   return 'watch';
  return 'healthy';
}

function formatMoney(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 100 ? `${Math.round(k)}K` : `${k.toFixed(k >= 10 ? 1 : 2)}K`;
  }
  return n.toLocaleString('en-US');
}

