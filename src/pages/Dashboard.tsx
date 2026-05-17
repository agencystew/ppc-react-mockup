import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown, CaretRight, Sparkle,
  MagnifyingGlass, Funnel, Eye,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';
import { AgentMascot } from '../components/AgentMascot';
import { PATTERNS, type Pattern } from '../mock/patterns';

/* Dashboard · /
 *
 * Brief from Stewart 2026-05-15: take the reference dashboard layout
 * (greeting · big dark hero · portfolio table · 2-up bottom row) and
 * make it PPC.io. Top dark box surfaces RECENT AGENT ACTIVITY with a
 * see-all-reports CTA. Below is the projects table. Below that, a
 * 2-up: Chat CTA + Quick actions.
 *
 * Design language is lifted directly from the competitor-spy report
 * hero card (radial purple bloom + starfield grain + italic purple
 * period in headlines). Same world, same hand.
 *
 *   1 · Greeting strip       Morning, Stewy · THU · 14 MAY date pill
 *   2 · Activity hero        Dark surface, recent runs feed, glowing orb
 *   3 · Portfolio table      Filter chips + projects table with sparklines
 *   4 · Bottom duo           Chat CTA (dark) + Quick actions (light)
 */

const TODAY_PILL = 'THU · 14 MAY';

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

/* ─── Recent agent activity feed (lifts from RECENT_RUNS_SUMMARY but
 *     adds richer per-row context). */
interface ActivityRow {
  runId: string;
  agentEmoji: string;
  agentName: string;
  projectName: string;
  projectAvatarBg: string;
  headline: string;
  upside: string;
  finishedAt: string;
}

const ACTIVITY: ActivityRow[] = [
  {
    runId: 'run-competitor-spy-completed',
    agentEmoji: '🕵️',
    agentName: 'Competitor Spy',
    projectName: 'Boulder Care',
    projectAvatarBg: PROJECT_META['boulder-care'].avatarBg,
    headline: '11 gaps your rivals are exploiting',
    upside: '+$8.2K/mo',
    finishedAt: '2h ago',
  },
  {
    runId: 'run-spend-leak-rocket',
    agentEmoji: '🔍',
    agentName: 'Spend Leak Detector',
    projectName: 'The HOTH',
    projectAvatarBg: PROJECT_META['the-hoth'].avatarBg,
    headline: '6 dead campaigns burning $3.4K/mo',
    upside: '+$3.4K/mo',
    finishedAt: 'Yesterday',
  },
];

/* ════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  return (
    <div className="space-y-6">
      <GreetingStrip />
      <ActivityHero />
      <PortfolioTable />
      <PatternsLiveStrip />
    </div>
  );
}

/* ─── 1 · Greeting strip ─────────────────────────────────────────────── */

function GreetingStrip() {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 font-display text-[48px] font-black leading-[1.05] tracking-[-0.02em] text-ppc-ink">
          Morning, Stewy
          <span aria-hidden className="inline-block text-[44px] leading-none">👋</span>
        </h1>
      </div>
      <span
        className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-[7px] font-mono text-[11px] uppercase tracking-[0.10em] text-ppc-ink"
        style={{ boxShadow: 'inset 0 0 0 1px #d9d4ec' }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
        {TODAY_PILL}
      </span>
    </div>
  );
}

/* ─── 2 · Activity hero (dark) ───────────────────────────────────────── */

/* Brand language: pure dark base, faint perspective grid masked at the
 * edges, single soft purple bloom up top, bold Figtree headline with a
 * lavender period, Courier mono eyebrow with a status dot, and a friendly
 * AgentMascot anchor in the right column. */

function ActivityHero() {
  return (
    <section
      className="relative overflow-hidden rounded-[20px] text-white"
      style={{
        background: '#08060F',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      {/* Perspective grid, faded toward edges. The signature marketing-site
          dark-hero treatment — replaces the previous radial-purple-bloom move,
          which read as generic SaaS dashboard. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          backgroundPosition: '0 0, 0 0',
          maskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)',
        }}
      />
      {/* Single soft purple glow up top, no second bloom. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[820px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.20) 0%, transparent 65%)',
        }}
      />

      <div className="relative grid gap-10 px-10 pb-10 pt-8 sm:grid-cols-[1fr_minmax(260px,320px)] sm:gap-12 sm:px-14 sm:pt-10">
        {/* ─── Copy column ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <h2 className="font-display text-[60px] font-black leading-[0.95] tracking-[-0.030em] text-white sm:text-[76px]">
            Your agents have been busy<span style={{ color: '#9F86FF' }}>.</span>
          </h2>

          <div className="mt-8 flex flex-col gap-2">
            {ACTIVITY.map((row) => (
              <ActivityCard key={row.runId} row={row} />
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
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
              to="/agents"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/65 transition-colors hover:text-white"
            >
              Or send a new specialist out
              <CaretRight size={11} weight="bold" />
            </Link>
          </div>
        </div>

        {/* ─── Right column · friendly mascot ─────────────────────── */}
        <div className="relative flex min-w-0 items-center justify-center sm:justify-end">
          <AgentMascot size={240} />
        </div>
      </div>
    </section>
  );
}

function ActivityCard({ row }: { row: ActivityRow }) {
  return (
    <Link
      to={`/reports/${row.runId}`}
      className="group flex items-center gap-4 rounded-[12px] px-4 py-3 transition-colors hover:bg-white/[0.05]"
      style={{
        background: 'rgba(255,255,255,0.025)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {/* Project avatar. Tonal chip per project. */}
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-[13px] font-bold text-white"
        style={{
          background: row.projectAvatarBg,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
        }}
      >
        {row.projectName.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[12px] text-white/55">
          <span aria-hidden className="text-[14px] leading-none">{row.agentEmoji}</span>
          <span className="font-medium text-white/85">{row.agentName}</span>
          <span className="text-white/30">·</span>
          <span>{row.projectName}</span>
        </div>
        <p className="mt-1 truncate text-[14px] font-medium text-white">
          {row.headline}
        </p>
      </div>
      <span className="hidden text-[11px] text-white/45 sm:inline">{row.finishedAt}</span>
      <CaretRight
        size={13}
        weight="bold"
        className="shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70"
      />
    </Link>
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
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ppc-ink">
            Your portfolio<span className="text-ppc-purple-500">.</span>
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
      <span className="font-mono text-[10.5px] tabular-nums opacity-80">{trendPct}</span>
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
        className="rounded-[5px] px-[6px] py-[1px] font-mono text-[10.5px] tabular-nums"
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
 * Purple billboard at the bottom of /dashboard. Owns the "experimental
 * brain" surface — the COO / data-scientist autopilot watching across
 * every account. Composition top-down:
 *
 *   - status strip (PATTERNS · EXPERIMENTAL + LIVE indicator)
 *   - hero zone: massive count (left) + network graph (right)
 *   - card shelf: 3 BLACK callout cards, one per top-3 pattern
 *   - ghost CTA into /patterns
 *
 * Network graph shows 8 project nodes around an io brain centre, with
 * colored polylines connecting the nodes affected by each of the top 3
 * patterns. That's the "brain connection" — io literally drew lines
 * between the accounts where it noticed the same thing.
 *
 * ?empty=1 flips to onboarding: 0 count, no graph lines, 4 ghost
 * "Watching for…" cards, "Launch first audit" CTA. */

function PatternsLiveStrip() {
  const [params] = useSearchParams();
  const isEmpty = params.get('empty') === '1';
  const top3 = PATTERNS.slice(0, 3);
  const totalCount = PATTERNS.length;
  const projectsTouched = countUniqueProjects(PATTERNS);

  return (
    <section
      className="relative overflow-hidden rounded-[24px]"
      style={{
        background:
          'linear-gradient(135deg, #7F5AF0 0%, #6A45E2 70%, #5A3FE0 100%)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.10) inset, 0 28px 70px -30px rgba(90,63,224,0.55)',
      }}
    >
      {/* Top-right luminous bloom for depth */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 60%)',
        }}
      />
      {/* Faint star grain */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 20%, white 1px, transparent 1px), radial-gradient(circle at 75% 70%, white 1px, transparent 1px)',
          backgroundSize: '140px 140px, 100px 100px',
        }}
      />
      {/* Bottom hairline pull for footing */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
        }}
      />

      <div className="relative px-7 py-8 sm:px-10 sm:py-9">
        {/* Status strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-[5px] text-[10px] uppercase tracking-[0.18em] text-white/90"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
          >
            <Eye size={11} weight="bold" />
            Patterns
            <span className="text-white/45">·</span>
            Experimental
          </span>
          <span
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/75"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Live
            <span className="text-white/40">·</span>
            <span className="tabular-nums">{projectsTouched} projects watched</span>
          </span>
        </div>

        {/* Hero zone */}
        <div className="mt-7 grid items-center gap-8 lg:grid-cols-[1fr_minmax(260px,320px)] lg:gap-8">
          {/* Massive numeric hero */}
          <div className="flex items-baseline gap-5">
            <span className="font-display text-[110px] font-black leading-[0.88] tracking-[-0.045em] tabular-nums text-white sm:text-[140px]">
              {isEmpty ? 0 : totalCount}
            </span>
            <div className="pb-3 sm:pb-4">
              <h3 className="font-display text-[24px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-[30px]">
                {isEmpty ? 'patterns yet' : 'patterns this week'}
                <span className="italic" style={{ color: '#E0D4FF' }}>.</span>
              </h3>
              <p className="mt-1.5 max-w-[420px] text-[13px] leading-[1.5] text-white/70">
                {isEmpty
                  ? "io needs a few agent runs across 2+ accounts. Launch your first audit and we'll start watching."
                  : `across ${projectsTouched} projects, refreshes whenever your agents do`}
              </p>
            </div>
          </div>

          {/* Network graph */}
          <div className="flex justify-center lg:justify-end">
            <NetworkGraph isEmpty={isEmpty} patterns={top3} />
          </div>
        </div>

        {/* Card shelf */}
        <div className="mt-8">
          {isEmpty ? (
            <WatchingForGrid />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {top3.map((p, i) => (
                <PatternCard key={p.id} pattern={p} isFresh={i === 0} />
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-6 flex justify-end">
          <Link
            to={isEmpty ? '/agents' : '/patterns'}
            className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/[0.08] px-[18px] py-[10px] text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/[0.16]"
          >
            {isEmpty ? 'Launch first audit' : `See all ${totalCount} patterns`}
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PatternCard({ pattern, isFresh }: { pattern: Pattern; isFresh: boolean }) {
  const accent = categoryAccent(pattern.category);
  const firstTwo = pattern.affected.slice(0, 2);
  const overflow = pattern.affected.length - firstTwo.length;

  return (
    <Link
      to={`/patterns#${pattern.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-[16px] p-5 transition-transform hover:-translate-y-0.5"
      style={{
        background: '#0C0C0E',
        boxShadow:
          '0 18px 44px -22px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}
    >
      {/* Top color bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: accent }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[9.5px] uppercase tracking-[0.14em]"
          style={{
            borderColor: `${accent}66`,
            color: accent,
            fontFamily: '"Courier New", ui-monospace, monospace',
          }}
        >
          <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
          {shortCategory(pattern.category)}
        </span>
        {pattern.spotted && (
          <span
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
          >
            {isFresh && (
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
            {pattern.spotted}
          </span>
        )}
      </div>

      {/* Headline */}
      <p className="line-clamp-3 text-[14px] font-semibold leading-[1.4] text-white">
        {pattern.headline}
      </p>

      {/* Footer: projects + arrow */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/65">
          {firstTwo.map((p, idx) => (
            <span key={p.id} className="inline-flex min-w-0 items-center gap-1">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accent }}
              />
              <span className="truncate">{p.name}</span>
              {idx < firstTwo.length - 1 && (
                <span className="text-white/30">·</span>
              )}
            </span>
          ))}
          {overflow > 0 && (
            <span className="shrink-0 text-white/45">+{overflow}</span>
          )}
        </div>
        <CaretRight
          size={11}
          weight="bold"
          className="shrink-0 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
    </Link>
  );
}

function WatchingForGrid() {
  const items = [
    { label: 'Cross-account CPA spikes',          color: '#F87171' },
    { label: 'Recurring negative-kw themes',      color: '#FB923C' },
    { label: 'PMAX intent drift',                  color: '#A88CFF' },
    { label: 'Auction landscape shifts',           color: '#22D3EE' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2.5 rounded-[16px] border border-dashed border-white/30 bg-white/[0.04] px-4 py-4 text-[12.5px] text-white/75"
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: it.color, opacity: 0.85 }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/* NetworkGraph — 8 project nodes around an io centre. Pattern arcs
 * connect the nodes each top-pattern affects, in the pattern's
 * category color. Visually proves the connection. */
function NetworkGraph({
  isEmpty,
  patterns,
}: {
  isEmpty: boolean;
  patterns: Pattern[];
}) {
  // Project order is chosen so the canonical top-3 patterns form
  // visually coherent arcs around the perimeter, not zigzags.
  const center = { x: 140, y: 120 };
  const radius = 86;
  const projectOrder = [
    'boulder-care',        // P0 — top
    'the-hoth',            // P1 — NE   (p-01 trio)
    'linkbuilder',         // P2 — E    (p-01 trio)
    'authority-builders',  // P3 — SE   (p-01 trio)
    'livingyoung',         // P4 — S    (p-02 trio)
    'edwin-novel',         // P5 — SW   (p-02 trio)
    'flock',               // P6 — W    (p-02 + p-03)
    'durable',             // P7 — NW   (p-03)
  ];
  const nodes = projectOrder.map((id, i) => {
    const angle = -Math.PI / 2 + (i * (Math.PI * 2)) / 8;
    return {
      id,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });
  const nodeById = (id: string) => nodes.find((n) => n.id === id);

  // Pattern polylines (skipped in empty state).
  const arcs = isEmpty
    ? []
    : patterns.map((p) => ({
        id: p.id,
        color: categoryAccent(p.category),
        points: p.affected
          .map((a) => nodeById(a.id))
          .filter((n): n is { id: string; x: number; y: number } => Boolean(n)),
      }));

  // First-pattern-wins coloring for the node halos.
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
    <svg
      viewBox="0 0 280 240"
      className="h-[220px] w-[280px]"
      aria-hidden
    >
      {/* Base hairlines from io centre to each project */}
      {nodes.map((n) => (
        <line
          key={n.id}
          x1={center.x}
          y1={center.y}
          x2={n.x}
          y2={n.y}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={0.6}
          strokeDasharray="2 3"
        />
      ))}

      {/* Pattern arcs (skipped when empty) */}
      {arcs.map((arc) => (
        <polyline
          key={arc.id}
          fill="none"
          stroke={arc.color}
          strokeWidth={1.8}
          strokeOpacity={0.95}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={arc.points.map((p) => `${p.x},${p.y}`).join(' ')}
          style={{ filter: `drop-shadow(0 0 5px ${arc.color}cc)` }}
        />
      ))}

      {/* Project nodes */}
      {nodes.map((n) => {
        const color = nodeColor.get(n.id);
        return (
          <g key={n.id}>
            {color && (
              <circle
                cx={n.x}
                cy={n.y}
                r={7.5}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.45}
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={color ? 4 : 3}
              fill={color || 'rgba(255,255,255,0.85)'}
            />
          </g>
        );
      })}

      {/* Centre io brain node */}
      <circle cx={center.x} cy={center.y} r={18} fill="white" fillOpacity={0.10} />
      <circle cx={center.x} cy={center.y} r={11} fill="white" />
      <text
        x={center.x}
        y={center.y + 3.5}
        textAnchor="middle"
        fontSize="10"
        fontFamily="Figtree, system-ui, sans-serif"
        fontWeight={900}
        fill="#6A45E2"
        letterSpacing="-0.5"
      >
        io
      </text>
    </svg>
  );
}

function shortCategory(category: string): string {
  // Tighten long labels for the card chip.
  return category
    .toUpperCase()
    .replace('AUCTION INSIGHTS — NEW ENTRANT', 'NEW ENTRANT')
    .replace('AUDIENCE SIGNAL OPPORTUNITY',    'AUDIENCE SIGNAL')
    .replace('VERTICAL-WIDE BRAND EROSION',    'BRAND EROSION')
    .replace('SEARCH LOST IMPRESSION SHARE',   'LOST IMPR. SHARE');
}

function categoryAccent(category: string): string {
  // Brighter palette so accents pop on the saturated purple BG
  // and inside the black cards.
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

/* Suppress unused warnings on the shared mock. */
void RECENT_RUNS_SUMMARY;
