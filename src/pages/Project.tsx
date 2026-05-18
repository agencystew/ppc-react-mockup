import { useState } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown, ArrowUpRight,
  Lightning, CaretDown, CaretRight,
  ChartLineUp, Briefcase, Brain, Gear,
  Sparkle, PencilSimple,
  Lightbulb, Target as TargetIcon, Compass, ShieldCheck, ClockCounterClockwise,
  PaperPlaneTilt, Plus, Database,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';

/* Project detail · /projects/:id
 *
 * Three big-bold tabs sit under the hero — Overview, Business Context,
 * Memory — plus a gear icon flush right for Settings. The tab card style
 * mirrors `/reports/:runId` V5: white active card with 2px purple ring +
 * 44px icon tile + 18px label + 13.5px subtitle.
 *
 * Overview keeps the original signature: dark "Weekly brief" hero card,
 * Performance KPIs, Schedule + Recent activity, Campaigns. Business Context
 * folds the old Competitors + AI Instructions tabs into one beautifully
 * structured surface. Memory is the new addition — io's accumulated
 * project context with an ask-anything composer pinned to the bottom.
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

// Campaigns — visual language matches AgentDetail launch form: human-friendly
// name + type chip + mono spend + KPI ribbon. No raw monospace identifiers.
type CampaignType = 'SEARCH' | 'PMAX' | 'SHOPPING' | 'DISPLAY';
type CampaignTone = 'good' | 'bad' | 'neutral';
interface Campaign {
  name: string;
  type: CampaignType;
  spend: number;     // monthly $
  conv: number;
  cpa: number;
  tone: CampaignTone;
}
const TOP_CAMPAIGNS: Campaign[] = [
  { name: 'Brand · Recovery Centers',    type: 'SEARCH', spend: 5274, conv: 126, cpa: 42, tone: 'good'    },
  { name: 'Brand · Sober Living',        type: 'SEARCH', spend: 4810, conv: 56,  cpa: 86, tone: 'neutral' },
  { name: 'Non-Brand · Detox Programs',  type: 'SEARCH', spend: 5362, conv: 87,  cpa: 62, tone: 'good'    },
];
const BAD_CAMPAIGNS: Campaign[] = [
  { name: 'Non-Brand · NM Treatment',    type: 'SEARCH', spend: 2603, conv: 9,  cpa: 289, tone: 'bad' },
  { name: 'Brand · NC Recovery Centers', type: 'SEARCH', spend: 5043, conv: 28, cpa: 180, tone: 'bad' },
  { name: 'PMax · Treatment Locator',    type: 'PMAX',   spend: 2990, conv: 19, cpa: 157, tone: 'bad' },
];

const CAMPAIGN_TYPE_STYLES: Record<CampaignType, { bg: string; fg: string }> = {
  SEARCH:   { bg: '#E6E0FA', fg: '#534AB7' },
  PMAX:     { bg: '#FDE9D7', fg: '#9C5A1A' },
  SHOPPING: { bg: '#DAF3E5', fg: '#1F7A4F' },
  DISPLAY:  { bg: '#FCE0E4', fg: '#A12A3A' },
};

function formatSpend(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${n}`;
}

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

type ProjectTab = 'overview' | 'context' | 'memory';

// ─── Page ──────────────────────────────────────────────────────────────
export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  // Initial tab honours `?tab=memory` / `?tab=context` so deep-links from
  // Patterns (and elsewhere) land users on the right tab. Falls back to
  // Overview when no valid param is present.
  const [searchParams] = useSearchParams();
  const initialTab: ProjectTab = (() => {
    const t = searchParams.get('tab');
    return t === 'memory' || t === 'context' ? t : 'overview';
  })();
  const [tab, setTab] = useState<ProjectTab>(initialTab);
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

      {/* ── 3. Big bold tab bar + gear ─────────────────────────────
         Same card-style as `/reports/:runId` V5 tab bar — white active
         card with 2px purple ring, 44px icon tile, 18px label, 13.5px
         subtitle. Gear icon (Settings) sits flush right as a circular
         affordance, not a 4th tab. */}
      <ProjectTabBar active={tab} onChange={setTab} />

      {/* ── 4. Tab body ─────────────────────────────────────────── */}
      {tab === 'overview' && <OverviewView projectId={project.id} />}
      {tab === 'context'  && <BusinessContextView projectId={project.id} />}
      {tab === 'memory'   && <MemoryView projectName={project.name} />}
    </div>
  );
}

// ─── Tab bar ───────────────────────────────────────────────────────────

interface ProjectTabDef {
  id: ProjectTab;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const PROJECT_TABS: ProjectTabDef[] = [
  { id: 'overview', label: 'Overview',         subtitle: 'Today\'s brief, performance, campaigns',  icon: <ChartLineUp size={22} weight="duotone" /> },
  { id: 'context',  label: 'Business Context', subtitle: 'Personas, goals, competitors, AI instructions', icon: <Briefcase  size={22} weight="duotone" /> },
  { id: 'memory',   label: 'Memory',           subtitle: 'Everything learned about this account, week by week',  icon: <Brain      size={22} weight="duotone" /> },
];

function ProjectTabBar({
  active, onChange,
}: { active: ProjectTab; onChange: (t: ProjectTab) => void }) {
  return (
    <div className="mt-8 flex items-stretch gap-3">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        {PROJECT_TABS.map(({ id, label, subtitle, icon }) => {
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={on}
              className="group relative flex flex-1 items-center gap-4 rounded-[18px] px-6 py-5 text-left transition-all"
              style={{
                background: on ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                boxShadow: on
                  ? '0 0 0 2px #7F5AF0, 0 24px 40px -28px rgba(127,90,240,0.45)'
                  : '0 0 0 1px #d9d4ec',
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] transition-colors"
                style={{
                  background: on ? '#EEEDFE' : 'rgba(127,90,240,0.06)',
                  color:      on ? '#7F5AF0' : '#85819a',
                }}
              >
                {icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  className="text-[18px] font-bold leading-[1.15]"
                  style={{ color: on ? '#1a1625' : '#3c3849', letterSpacing: '-0.018em' }}
                >
                  {label}
                </span>
                <span
                  className="mt-1 text-[12.5px] leading-[1.3] truncate"
                  style={{ color: on ? '#534AB7' : '#85819a' }}
                >
                  {subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        title="Project settings"
        aria-label="Project settings"
        className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-[18px] text-[#534AB7] transition-all hover:-translate-y-[1px] hover:text-[#7F5AF0]"
        style={{
          background: 'rgba(255,255,255,0.55)',
          boxShadow: '0 0 0 1px #d9d4ec',
        }}
      >
        <Gear size={24} weight="duotone" />
      </button>
    </div>
  );
}

// ─── Overview view (the original page body) ────────────────────────────

function OverviewView({ projectId }: { projectId: string }) {
  return (
    <>
      <TodaysBriefCard findings={FINDINGS} projectId={projectId} />

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

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScheduleCard projectId={projectId} />
        <RecentActivityCard rows={ACTIVITY} />
      </div>

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
    </>
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
function TodaysBriefCard({ findings, projectId }: { findings: Finding[]; projectId: string }) {
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
              Weekly brief
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

          <Link
            to={`/projects/${projectId}/brief`}
            className="mt-5 inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(124,109,255,0.5),0_12px_28px_-10px_rgba(124,109,255,0.65)] transition-transform hover:-translate-y-px"
            style={{ background: C.purple }}
          >
            Open full brief
            <ArrowRight size={13} weight="bold" />
          </Link>
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
                className="grid grid-cols-[16px_1fr_auto_16px] items-center gap-5 px-6 py-5 transition-colors hover:bg-white/[0.04]"
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span
                  className="h-[10px] w-[10px] rounded-full"
                  style={{ background: dot, boxShadow: dotHalo }}
                />
                <div className="min-w-0">
                  <div
                    className="text-[22px] font-bold leading-tight text-white"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {f.title}
                  </div>
                  <div
                    className="mt-2 text-[12.5px]"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <span>{f.source}</span>
                    <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                    {f.meta}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="tabular text-[20px] font-bold leading-none"
                    style={{ color: valueColor, letterSpacing: '-0.02em' }}
                  >
                    {f.valueMain}
                    {f.valueSuffix && (
                      <span
                        className="ml-0.5 text-[13px] font-medium"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {f.valueSuffix}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1.5 text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {f.valueLabel}
                  </div>
                </div>
                <CaretRight size={16} weight="bold" style={{ color: 'rgba(255,255,255,0.4)' }} />
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

function CampaignTypeChip({ type }: { type: CampaignType }) {
  const s = CAMPAIGN_TYPE_STYLES[type];
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-[5px] py-[1px] font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
      style={{ background: s.bg, color: s.fg }}
    >
      {type}
    </span>
  );
}

function CampaignCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: 'good' | 'bad';
  items: Campaign[];
}) {
  const dot   = tone === 'good' ? C.greenDot : C.redDot;
  const label = tone === 'good' ? C.green    : C.red;
  return (
    <section
      className="rounded-[14px] border px-5 py-5"
      style={{ background: C.cardBg, borderColor: C.border }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="h-[8px] w-[8px] rounded-full" style={{ background: dot }} />
        <span
          className="font-mono text-[11px] font-semibold uppercase"
          style={{ color: label, letterSpacing: '0.14em' }}
        >
          {title}
        </span>
      </div>
      <div className="-mx-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          const cpaColor = c.tone === 'bad' ? C.red : c.tone === 'good' ? C.green : C.neutral7;
          const cpaWeight = c.tone === 'neutral' ? 500 : 600;
          return (
            <a
              key={c.name}
              href="#"
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[8px] px-2 py-3 transition-colors hover:bg-[#FBF9FD]"
              style={{ borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}` }}
            >
              <div className="flex min-w-0 flex-col gap-[6px] leading-tight">
                <span
                  className="truncate text-[13.5px] font-semibold"
                  style={{ color: C.ink, letterSpacing: '-0.005em' }}
                >
                  {c.name}
                </span>
                <span className="flex flex-wrap items-center gap-[6px]">
                  <CampaignTypeChip type={c.type} />
                  <span
                    className="inline-flex items-center gap-[3px] font-mono text-[10.5px] tabular"
                    style={{ color: C.neutral5 }}
                  >
                    {formatSpend(c.spend)}/mo
                  </span>
                  <span className="text-[10.5px]" style={{ color: C.neutral4 }}>·</span>
                  <span
                    className="font-mono text-[10.5px] tabular"
                    style={{ color: C.neutral5 }}
                  >
                    {c.conv} conv
                  </span>
                </span>
              </div>
              <div className="text-right">
                <div
                  className="tabular text-[15px] leading-none"
                  style={{ color: cpaColor, fontWeight: cpaWeight, letterSpacing: '-0.01em' }}
                >
                  ${c.cpa}
                </div>
                <div
                  className="mt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
                  style={{ color: C.neutral4 }}
                >
                  CPA
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ─── Business Context view ─────────────────────────────────────────────
//
// Folds in what used to live across three menu items (Business context,
// Competitors, AI instructions). Reads as a single editorial brief about
// the client: who they sell to, what they want, who they compete with,
// and how io should think about them. Closes with a dark "Improve this
// context" CTA so updates feel like a moment, not a chore.

interface Persona {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  body: string;
}
const PERSONAS: Persona[] = [
  {
    name: 'Struggling-but-Searching Sam',
    priority: 'High',
    body:  'A working-age adult (25–54) with OUD or AUD in one of Boulder Care\'s 7 states who searches privately for telehealth MAT after being burned by traditional clinics or fearing stigma and job loss.',
  },
  {
    name: 'Desperate-for-Them Dana',
    priority: 'Medium',
    body:  'A spouse, parent, or family member searching on behalf of a loved one with OUD or AUD after a crisis moment, needing guidance on how to get someone into non-coercive, low-barrier care.',
  },
];

interface Competitor {
  name: string;
  domain: string;
  positioning: string;
  threat: 'High' | 'Medium' | 'Watch';
}
const COMPETITORS: Competitor[] = [
  { name: 'Bicycle Health',    domain: 'bicyclehealth.com',  positioning: 'Largest telehealth MAT provider · employer-channel heavy',         threat: 'High' },
  { name: 'Workit Health',     domain: 'workithealth.com',   positioning: 'App-first OUD/AUD recovery · self-pay + Medicaid mix',           threat: 'High' },
  { name: 'Ophelia',           domain: 'ophelia.com',        positioning: 'Premium telehealth MAT · D2C affordability angle',               threat: 'Medium' },
  { name: 'Hey Charlie',       domain: 'heycharlie.com',     positioning: 'Recovery app + community · light competitor on the search side', threat: 'Watch' },
];

interface InstructionRule { text: string; }
const INSTRUCTIONS: InstructionRule[] = [
  { text: 'Treat compliance and HIPAA as a hard floor. Never recommend creative that names a specific drug or makes diagnostic claims.' },
  { text: 'Prefer "non-coercive", "judgment-free", "private" over performance language like "fast results" or "guaranteed". Trust beats urgency in this category.' },
  { text: 'Geography is binary: in-network in 7 states, out elsewhere. Always confirm Boulder Care operates in the search location before approving any geo-expansion.' },
  { text: 'Bicycle Health is the threat to size against. Workit Health is the second read. Don\'t spend bid budget chasing Ophelia.' },
];

function BusinessContextView({ projectId }: { projectId: string }) {
  void projectId;
  return (
    <div className="mt-10 space-y-12">
      <ContextSection
        eyebrow="Who they sell to"
        title="Target personas"
        action={<EditChip />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PERSONAS.map((p) => (
            <PersonaCard key={p.name} persona={p} />
          ))}
        </div>
      </ContextSection>

      <ContextSection
        eyebrow="What success looks like"
        title="Goals & targets"
        action={<EditChip />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GoalCard label="Primary KPI"  value="Conversions"  hint="Booked intake calls inside the funnel" />
          <GoalCard label="Target CPA"   value="$184"         hint="Last reviewed 14 days ago" />
          <GoalCard label="Monthly budget" value="$72,000"    hint="Across both Boulder Care accounts" />
        </div>
      </ContextSection>

      <ContextSection
        eyebrow="Read from the live site"
        title="AI business intelligence"
        action={
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: C.neutral5 }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: C.purple }} />
            boulder.care · refreshed 1 week ago
          </span>
        }
      >
        <BusinessIntelligenceCard />
      </ContextSection>

      <ContextSection
        eyebrow="Who they compete with"
        title="Competitors"
        action={<EditChip label="Manage" />}
      >
        <CompetitorPanel competitors={COMPETITORS} />
      </ContextSection>

      <ContextSection
        eyebrow="House rules"
        title="AI instructions"
        action={<EditChip />}
      >
        <InstructionsPanel rules={INSTRUCTIONS} />
      </ContextSection>

      <ImproveContextCta />
    </div>
  );
}

function ContextSection({
  eyebrow, title, action, children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div
            className="font-mono text-[10.5px] font-semibold uppercase"
            style={{ color: C.neutral5, letterSpacing: '0.14em' }}
          >
            {eyebrow}
          </div>
          <h2
            className="mt-2 text-[26px] font-bold leading-[1.05]"
            style={{ color: C.ink, letterSpacing: '-0.02em' }}
          >
            {title}<span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EditChip({ label = 'Edit' }: { label?: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[10px] border bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3f3f46] transition-colors hover:border-[#c8bcff] hover:text-[#534AB7]"
      style={{ borderColor: C.border }}
    >
      <PencilSimple size={12} weight="bold" />
      {label}
    </button>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  const priorityStyle = persona.priority === 'High'
    ? { bg: '#E2F4EC', fg: '#1F8458', dot: '#3FB58C' }
    : persona.priority === 'Medium'
      ? { bg: '#FAEFDD', fg: '#82500A', dot: '#D49021' }
      : { bg: '#EFEEF6', fg: '#5C5773', dot: '#8a8398' };
  return (
    <div
      className="relative rounded-[14px] border bg-white px-6 py-6 transition-colors hover:border-[#c8bcff]"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-[18px] font-bold leading-[1.2]"
          style={{ color: C.ink, letterSpacing: '-0.012em' }}
        >
          {persona.name}
        </h3>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-bold tracking-tight"
          style={{ background: priorityStyle.bg, color: priorityStyle.fg }}
        >
          <span className="h-[5px] w-[5px] rounded-full" style={{ background: priorityStyle.dot }} />
          {persona.priority}
        </span>
      </div>
      <p className="mt-3 text-[13.5px] leading-[1.6]" style={{ color: C.neutral7 }}>
        {persona.body}
      </p>
    </div>
  );
}

function GoalCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div
      className="rounded-[14px] border bg-white px-5 py-5"
      style={{ borderColor: C.border }}
    >
      <div
        className="font-mono text-[10.5px] font-semibold uppercase"
        style={{ color: C.neutral5, letterSpacing: '0.14em' }}
      >
        {label}
      </div>
      <div
        className="tabular mt-2 text-[28px] font-extrabold leading-[1.0]"
        style={{ color: C.ink, letterSpacing: '-0.022em' }}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px]" style={{ color: C.neutral5 }}>
        {hint}
      </div>
    </div>
  );
}

function BusinessIntelligenceCard() {
  return (
    <div
      className="relative overflow-hidden rounded-[16px]"
      style={{
        background: 'linear-gradient(155deg, #F5F2FF 0%, #EEEDFE 70%, #E5DEFC 100%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
      }}
    >
      <div className="grid grid-cols-1 gap-6 px-7 py-7 md:grid-cols-[1.6fr_1fr] md:px-9 md:py-9">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="grid h-[28px] w-[28px] place-items-center rounded-[8px]"
              style={{
                background: 'linear-gradient(155deg, #E9E3FF 0%, #C9BAFF 100%)',
                boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.28)',
              }}
            >
              <Sparkle size={13} weight="duotone" style={{ color: '#534AB7' }} />
            </span>
            <span
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#534AB7', letterSpacing: '0.14em' }}
            >
              Business overview
            </span>
          </div>
          <p className="mt-4 text-[16px] leading-[1.6]" style={{ color: '#1a1625' }}>
            Boulder Care is a telehealth addiction-treatment provider offering medication-assisted treatment (MAT),
            clinical services, and recovery support for opioid and alcohol use disorders. They operate nationally
            across 7 states (Colorado, Michigan, New Mexico, North Carolina, Ohio, Oregon, Vermont), accept Medicaid
            in every market, and lean hard on a non-coercive, low-barrier brand voice.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <IntelChip label="Founded" value="2015" />
            <IntelChip label="Coverage" value="7 states" />
            <IntelChip label="Channels" value="Medicaid + self-pay" />
            <IntelChip label="Category" value="Telehealth MAT" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <IntelLine icon={<TargetIcon  size={14} weight="duotone" />} label="Primary offer"  value="Free clinical assessment within 24 hrs" />
          <IntelLine icon={<Compass     size={14} weight="duotone" />} label="Brand stance"   value="Non-coercive · judgment-free · stigma-aware" />
          <IntelLine icon={<ShieldCheck size={14} weight="duotone" />} label="Compliance"     value="HIPAA + state-by-state Medicaid rules" />
          <IntelLine icon={<Lightbulb   size={14} weight="duotone" />} label="What's working" value="Long-form recovery story video ads in OR + CO" />
        </div>
      </div>
    </div>
  );
}

function IntelChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[10px] bg-white/65 px-3 py-2.5"
      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.15)' }}
    >
      <div
        className="font-mono text-[10px] font-semibold uppercase"
        style={{ color: '#534AB7', letterSpacing: '0.14em' }}
      >
        {label}
      </div>
      <div className="mt-1 text-[13.5px] font-semibold" style={{ color: '#1a1625' }}>
        {value}
      </div>
    </div>
  );
}

function IntelLine({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-[12px] bg-white/70 px-4 py-3"
      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.15)' }}
    >
      <span
        aria-hidden
        className="mt-[2px] grid h-[24px] w-[24px] place-items-center rounded-[7px]"
        style={{
          background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
          color: '#534AB7',
          boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.22)',
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="font-mono text-[10px] font-semibold uppercase"
          style={{ color: '#534AB7', letterSpacing: '0.14em' }}
        >
          {label}
        </div>
        <div className="mt-1 text-[13.5px] leading-[1.4]" style={{ color: '#1a1625' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function CompetitorPanel({ competitors }: { competitors: Competitor[] }) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-white"
      style={{ borderColor: C.border }}
    >
      {competitors.map((c, i) => {
        const isLast = i === competitors.length - 1;
        const threatStyle = c.threat === 'High'
          ? { bg: '#FBE6E5', fg: '#9F2624', dot: '#E24B4A' }
          : c.threat === 'Medium'
            ? { bg: '#FAEFDD', fg: '#82500A', dot: '#D49021' }
            : { bg: '#EFEEF6', fg: '#5C5773', dot: '#8a8398' };
        return (
          <div
            key={c.domain}
            className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FBFAFF]"
            style={{ borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}` }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div
                  className="text-[15px] font-bold"
                  style={{ color: C.ink, letterSpacing: '-0.008em' }}
                >
                  {c.name}
                </div>
                <a
                  href={`https://${c.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 font-mono text-[11px] text-[#85819a] transition-colors hover:text-[#534AB7]"
                  style={{ letterSpacing: '0.02em' }}
                >
                  {c.domain}
                  <ArrowUpRight size={10} weight="bold" />
                </a>
              </div>
              <div className="mt-1 text-[12.5px]" style={{ color: C.neutral5 }}>
                {c.positioning}
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold tracking-tight"
              style={{ background: threatStyle.bg, color: threatStyle.fg }}
            >
              <span className="h-[5px] w-[5px] rounded-full" style={{ background: threatStyle.dot }} />
              {c.threat}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InstructionsPanel({ rules }: { rules: InstructionRule[] }) {
  return (
    <div
      className="rounded-[14px] border bg-white px-6 py-5"
      style={{ borderColor: C.border }}
    >
      <ul className="space-y-4">
        {rules.map((r, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-[2px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] font-mono text-[11px] font-bold"
              style={{ background: '#EEEDFE', color: '#534AB7' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-[13.5px] leading-[1.6]" style={{ color: C.neutral7 }}>
              {r.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImproveContextCta() {
  return (
    <div
      className="relative mt-2 overflow-hidden rounded-[16px]"
      style={{ background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-[260px] w-[260px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.32) 0%, transparent 65%)' }}
      />
      <div className="relative flex flex-col items-start gap-5 px-7 py-6 md:flex-row md:items-center md:justify-between md:px-9 md:py-7">
        <div>
          <h3
            className="text-[22px] font-bold leading-[1.15] text-white"
            style={{ letterSpacing: '-0.018em' }}
          >
            Sharpen the context on Boulder Care
            <span style={{ color: '#A89BFF', fontStyle: 'italic' }}>.</span>
          </h3>
          <p
            className="mt-2 max-w-[58ch] text-[13.5px] leading-[1.55]"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Every detail added here gets pulled into every agent run, every chat, and every recommendation.
            One paragraph here saves an hour of prompting later.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-px"
          style={{
            background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 12px 28px -10px rgba(127,90,240,0.65)',
          }}
        >
          <PencilSimple size={13} weight="bold" />
          Improve this context
        </button>
      </div>
    </div>
  );
}

// ─── Memory view ───────────────────────────────────────────────────────
//
// The new idea: a single living surface for everything io has remembered
// about this client. Top: stat hero with the "io" purple roundel + a
// human-readable rollup ("Remembering Boulder Care for 47 days"). Middle:
// timeline of memories grouped by week — each card is one durable
// learning io has captured, tagged by type. Bottom: dark composer to
// chat with the memory itself. The composer reuses the `/chat` dark-input
// recipe so it reads as a continuation of the chat surface, not a new one.

type MemoryType = 'discovery' | 'pattern' | 'decision' | 'preference';
interface Memory {
  type: MemoryType;
  headline: string;
  body: string;
  source: string;
}

const MEMORIES_BY_WEEK: Array<{ label: string; items: Memory[] }> = [
  {
    label: 'This week',
    items: [
      {
        type: 'discovery',
        headline: 'Bicycle Health is overlapping on 73% of Brand keywords',
        body:  'Auction insights shows Bicycle Health appearing alongside Boulder Care brand searches across CO, OR, MI. Their impression share on "boulder care reviews" is 41% — they\'re buying the brand defensively.',
        source:'Competitor Spy · 2 days ago',
      },
      {
        type: 'preference',
        headline: '"Non-coercive" is the locked brand word',
        body:  'Stewart confirmed: ad copy should default to "non-coercive" / "judgment-free" framing. Avoid "fast" or "guaranteed" — Boulder Care\'s legal flagged anything that sounds promissory in this category.',
        source:'Chat · 3 days ago',
      },
      {
        type: 'pattern',
        headline: 'Tuesday-morning CPA is consistently 22% lower than weekend',
        body:  'Eight-week pattern. Tues/Wed 7–11am consistently beat the weekend on intake-call conversions. Likely a quiet-moment / privacy-window behaviour pattern. Worth dayparting non-brand spend.',
        source:'Spend Leak Detector · 4 days ago',
      },
    ],
  },
  {
    label: 'Last week',
    items: [
      {
        type: 'decision',
        headline: 'Pause "Detox Programs" ad group in NM',
        body:  'Non-Brand · NM Treatment ad group reached $289 CPA against a $184 target. Stewart approved a 7-day pause to assess auction-insights spillover from Workit Health.',
        source:'Weekly Audit · 8 days ago',
      },
      {
        type: 'discovery',
        headline: '3 PMAX assets rated "Poor" — headline-only swap recommended',
        body:  'PMAX Asset Review flagged three asset combinations where the long-form recovery video pulls the rating down. CTR uplift estimated at 0.4–0.8pp from headline swaps alone — no creative spend required.',
        source:'PMAX Asset Review · 9 days ago',
      },
      {
        type: 'preference',
        headline: 'Medicaid messaging stays out of brand campaigns',
        body:  'Stewart\'s call: keep Medicaid-accepting language to non-brand acquisition only. Brand campaign visitors are warmer and the Medicaid disclosure can suppress organic click intent.',
        source:'Chat · 11 days ago',
      },
    ],
  },
  {
    label: 'Two weeks ago',
    items: [
      {
        type: 'pattern',
        headline: 'Workit Health is laddering down on price',
        body:  'Their LP messaging shifted from "premium telehealth" to "starting at $99/mo" between Apr 12 and May 1. Cross-reference: their Brand impression share dropped 14% in the same window. Reads like a self-pay acquisition push, not a sustainable repositioning.',
        source:'Competitor Spy · 15 days ago',
      },
      {
        type: 'decision',
        headline: 'Target CPA locked at $184 across both accounts',
        body:  'After the Q1 LTV recalculation, Stewart locked $184 as the unified Target CPA. Previous accounts were running $159 (Brand) and $221 (Non-brand) — unified target prevents the algorithm starving the lower-CPA campaign.',
        source:'Chat · 16 days ago',
      },
    ],
  },
];

function MemoryView({ projectName }: { projectName: string }) {
  return (
    <div className="mt-10 space-y-10">
      <MemoryHero projectName={projectName} />
      <div className="space-y-10">
        {MEMORIES_BY_WEEK.map((group) => (
          <MemoryWeek key={group.label} label={group.label} items={group.items} />
        ))}
      </div>
      <MemoryComposer projectName={projectName} />
    </div>
  );
}

function MemoryHero({ projectName }: { projectName: string }) {
  const totalMemories = MEMORIES_BY_WEEK.reduce((sum, w) => sum + w.items.length, 0);
  return (
    <section
      className="relative overflow-hidden rounded-[18px]"
      style={{
        background: 'linear-gradient(155deg, #F5F2FF 0%, #EEEDFE 70%, #E5DEFC 100%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full opacity-70"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.22) 0%, transparent 65%)' }}
      />
      <div className="relative grid grid-cols-1 gap-8 px-7 py-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 md:px-9 md:py-9">
        <span
          aria-hidden
          className="grid h-[68px] w-[68px] place-items-center rounded-full text-white"
          style={{
            background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 60%, #6E47E0 100%)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.45), 0 18px 36px -14px rgba(127,90,240,0.55)',
          }}
        >
          <Brain size={28} weight="duotone" />
        </span>

        <div className="min-w-0">
          <div
            className="text-[12px] font-semibold tracking-[-0.005em]"
            style={{ color: '#534AB7' }}
          >
            Project memory
          </div>
          <h2
            className="mt-2 text-[28px] font-extrabold leading-[1.05]"
            style={{ color: '#1a1625', letterSpacing: '-0.022em' }}
          >
            <span className="tabular">47</span> days of context on {projectName}
            <span style={{ color: '#7F5AF0', fontStyle: 'italic' }}>.</span>
          </h2>
          <p className="mt-2 max-w-[60ch] text-[13.5px] leading-[1.6]" style={{ color: C.neutral6 }}>
            Every chat, every agent run, every decision — all carried forward.
            Ask anything from the composer below and the answer draws straight from this memory.
          </p>
        </div>

        <div className="flex flex-row gap-3 md:flex-col md:items-end md:gap-3">
          <MemoryStat label="Memories"  value={totalMemories.toString()} />
          <MemoryStat label="Agent runs" value="32" />
          <MemoryStat label="Decisions"  value="11" />
        </div>
      </div>
    </section>
  );
}

function MemoryStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[12px] bg-white/70 px-4 py-2.5 text-right"
      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)' }}
    >
      <div
        className="tabular text-[20px] font-extrabold leading-none"
        style={{ color: '#1a1625', letterSpacing: '-0.018em' }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-mono text-[10px] font-semibold uppercase"
        style={{ color: '#534AB7', letterSpacing: '0.14em' }}
      >
        {label}
      </div>
    </div>
  );
}

const MEMORY_TYPE_META: Record<MemoryType, {
  label: string;
  bg: string;
  fg: string;
  icon: React.ReactNode;
}> = {
  discovery:  { label: 'Discovery',  bg: '#E2F4EC', fg: '#1F8458', icon: <Sparkle      size={11} weight="fill" /> },
  pattern:    { label: 'Pattern',    bg: '#F0EBFF', fg: '#5742A8', icon: <ChartLineUp  size={11} weight="bold" /> },
  decision:   { label: 'Decision',   bg: '#FAEFDD', fg: '#82500A', icon: <ShieldCheck  size={11} weight="bold" /> },
  preference: { label: 'Preference', bg: '#FBE6E5', fg: '#9F2624', icon: <Lightbulb    size={11} weight="fill" /> },
};

function MemoryWeek({ label, items }: { label: string; items: Memory[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <ClockCounterClockwise size={13} weight="duotone" style={{ color: C.neutral5 }} />
        <span
          className="font-mono text-[10.5px] font-semibold uppercase"
          style={{ color: C.neutral5, letterSpacing: '0.14em' }}
        >
          {label}
        </span>
        <span className="h-px flex-1" style={{ background: C.border }} />
        <span className="tabular text-[11.5px]" style={{ color: C.neutral4 }}>
          {items.length} {items.length === 1 ? 'memory' : 'memories'}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((m, i) => (
          <MemoryCard key={i} memory={m} />
        ))}
      </div>
    </section>
  );
}

function MemoryCard({ memory }: { memory: Memory }) {
  const meta = MEMORY_TYPE_META[memory.type];
  return (
    <article
      className="relative rounded-[14px] border bg-white px-6 py-5 transition-colors hover:border-[#c8bcff]"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold tracking-tight"
          style={{ background: meta.bg, color: meta.fg }}
        >
          {meta.icon}
          {meta.label}
        </span>
        <span style={{ color: C.neutral3 }}>·</span>
        <span className="text-[11.5px]" style={{ color: C.neutral5 }}>
          {memory.source}
        </span>
      </div>
      <h3
        className="mt-3 text-[17px] font-bold leading-[1.25]"
        style={{ color: C.ink, letterSpacing: '-0.012em' }}
      >
        {memory.headline}
      </h3>
      <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: C.neutral6 }}>
        {memory.body}
      </p>
    </article>
  );
}

function MemoryComposer({ projectName }: { projectName: string }) {
  const suggestions = [
    'What has Competitor Spy found about Bicycle Health?',
    'How has our CPA trended over the last 60 days?',
    'What\'s our locked stance on brand voice?',
    'Which decisions are still open from last week?',
  ];
  return (
    <section className="sticky bottom-4 z-20 mt-12">
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(180deg, #15101F 0%, #0F0A1E 55%, #0A0617 100%)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 48px -22px rgba(15,10,30,0.55), 0 0 0 1px rgba(127,90,240,0.14)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-[240px] w-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.26) 0%, transparent 65%)' }}
        />
        <div className="relative px-6 pt-6 pb-5">
          <div className="flex items-center gap-2">
            <Database size={12} weight="duotone" style={{ color: '#A89BFF' }} />
            <span
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#A89BFF', letterSpacing: '0.14em' }}
            >
              Ask the memory
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <input
              type="text"
              placeholder={`Ask anything about ${projectName}'s history…`}
              className="flex-1 bg-transparent text-[15.5px] text-white outline-none placeholder:text-white/45"
            />
            <button
              type="button"
              title="Send"
              className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-[10px] text-white transition-transform hover:-translate-y-[1px]"
              style={{
                background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 60%, #6E47E0 100%)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.20) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 8px 22px -6px rgba(127,90,240,0.55)',
              }}
            >
              <PaperPlaneTilt size={14} weight="bold" />
            </button>
          </div>

          <div
            className="mt-4 flex flex-wrap gap-2 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-[6px] text-[11.5px] font-medium text-white/85 transition-colors hover:bg-white/[0.09]"
              >
                <Plus size={9} weight="bold" className="text-white/55" />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
