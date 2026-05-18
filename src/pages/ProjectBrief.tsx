import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowUp, ArrowDown, ArrowRight,
  CaretRight, CaretLeft,
  Printer, ShareNetwork,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';
import { getBrief, type BriefPeriod, type BriefRow, type BriefNumber } from '../mock/briefs';

/* Client briefing · /projects/:id/brief
 *
 * Aggregates one project's worth of agent runs over a period (week / month)
 * into a single editorial recap for the client. Wins lead, needs-attention
 * follow, every row cites the agent run it came from, and the bottom strip
 * lists every run that fed into the brief. Audit trail end to end.
 *
 * Design language extends `/projects/:id` (Overview): same lavender canvas,
 * white cards with #d9d4ec border, dark hero recipe (black-led vertical
 * gradient + radial purple bloom masked at top, italic-period accent on the
 * H2). No mono UPPERCASE eyebrows, no "walk away with" listicles, no
 * pre-period $ estimates — every figure is a post-period actual that traces
 * to a real run.
 */

// ─── Tokens (mirror Project.tsx) ──────────────────────────────────────────
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
  green:     '#16a34a',
  greenDot:  '#22c55e',
  greenDark: '#15803d',
  amber:     '#d97706',
  amberDot:  '#f59e0b',
  red:       '#dc2626',
  redDot:    '#ef4444',
} as const;

// Mirror of Project.tsx avatar palette so the hero pip matches.
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

export function ProjectBriefPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  const [searchParams, setSearchParams] = useSearchParams();

  const period: BriefPeriod = searchParams.get('period') === 'month' ? 'month' : 'week';
  const setPeriod = (p: BriefPeriod) => {
    const next = new URLSearchParams(searchParams);
    next.set('period', p);
    setSearchParams(next, { replace: true });
  };

  if (!project) return <Navigate to="/projects" replace />;
  const avatar = AVATAR[project.id] ?? { bg: '#7F5AF0', fg: '#FFFFFF' };
  const brief = getBrief(project.id, period, project.name);
  const isStub = brief.wins.length === 0 && brief.needs.length === 0;

  return (
    <div
      className="rounded-[14px] border px-7 py-7 sm:px-9 sm:py-9"
      style={{ background: C.pageBg, borderColor: C.pageBor, color: C.ink }}
    >
      {/* 1 · Breadcrumb + Share */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.neutral5 }}>
          <Link to="/projects" className="hover:text-[#18181b] transition-colors">Projects</Link>
          <span style={{ color: C.neutral3 }}>/</span>
          <Link to={`/projects/${project.id}`} className="hover:text-[#18181b] transition-colors">{project.name}</Link>
          <span style={{ color: C.neutral3 }}>/</span>
          <span style={{ color: C.neutral7 }}>Brief</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border bg-white px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-neutral-50"
            style={{ borderColor: C.border, color: C.neutral6 }}
            title="Print this brief"
          >
            <Printer size={14} weight="bold" />
            Print
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border bg-white px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-neutral-50"
            style={{ borderColor: C.border, color: C.neutral6 }}
            title="Share a client-safe link"
          >
            <ShareNetwork size={14} weight="bold" />
            Share with client
          </button>
        </div>
      </div>

      {/* 2 · Hero */}
      <header className="mt-7 flex flex-wrap items-end justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-[12px] text-[24px] font-semibold"
            style={{ background: avatar.bg, color: avatar.fg }}
          >
            {project.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium" style={{ color: C.neutral5 }}>
              {project.name} · client brief
            </div>
            <h1
              className="mt-1 text-[40px] font-extrabold leading-[1.02]"
              style={{ color: C.ink, letterSpacing: '-0.025em' }}
            >
              {brief.periodLabel}<span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]" style={{ color: C.neutral5 }}>
              <span>{brief.prevPeriodLabel}</span>
              <span style={{ color: C.neutral3 }}>·</span>
              <span>{brief.receipts.length || '—'} agent {brief.receipts.length === 1 ? 'run' : 'runs'} amalgamated</span>
              <span style={{ color: C.neutral3 }}>·</span>
              <span>{brief.generatedAt}</span>
            </div>
          </div>
        </div>

        {/* Period toggle + stepper */}
        <div className="flex items-center gap-3">
          <div
            className="inline-flex rounded-[10px] border bg-white p-1"
            style={{ borderColor: C.border }}
          >
            <SegmentBtn label="Week" active={period === 'week'} onClick={() => setPeriod('week')} />
            <SegmentBtn label="Month" active={period === 'month'} onClick={() => setPeriod('month')} />
          </div>
          <div
            className="inline-flex items-center rounded-[10px] border bg-white"
            style={{ borderColor: C.border }}
            title="Step through periods"
          >
            <button
              className="grid h-[34px] w-[34px] place-items-center rounded-l-[10px] transition-colors hover:bg-neutral-50"
              style={{ color: C.neutral6 }}
              aria-label="Previous period"
            >
              <CaretLeft size={13} weight="bold" />
            </button>
            <span
              className="px-2 text-[12px] font-medium"
              style={{ color: C.neutral6 }}
            >
              {period === 'week' ? 'This week' : 'This month'}
            </span>
            <button
              className="grid h-[34px] w-[34px] place-items-center rounded-r-[10px] opacity-40"
              style={{ color: C.neutral6 }}
              aria-label="Next period"
              disabled
            >
              <CaretRight size={13} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* 3 · Big numbers row */}
      <section className="mt-9">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {brief.numbers.map((n) => <BigNumberCard key={n.label} n={n} />)}
        </div>
      </section>

      {/* 4 · The week/month in a sentence — dark hero card */}
      <NarrativeCard text={brief.narrative} periodLabel={brief.periodLabel} period={period} />

      {/* 5 · Wins */}
      <section className="mt-9">
        <SectionHeading
          title={period === 'week' ? 'Wins this week' : 'Wins this month'}
          count={brief.wins.length}
        />
        <div
          className="mt-4 overflow-hidden rounded-[12px] border bg-white"
          style={{ borderColor: C.border }}
        >
          {brief.wins.length === 0 ? (
            <EmptyState text="No wins logged for this period yet." />
          ) : (
            brief.wins.map((w, i) => (
              <BriefRowItem
                key={i}
                row={w}
                isLast={i === brief.wins.length - 1}
                projectId={project.id}
              />
            ))
          )}
        </div>
      </section>

      {/* 6 · Needs attention */}
      <section className="mt-9">
        <SectionHeading
          title="Needed attention"
          count={brief.needs.length}
          subtitle="Open issues amalgamated from this period's runs"
        />
        <div
          className="mt-4 overflow-hidden rounded-[12px] border bg-white"
          style={{ borderColor: C.border }}
        >
          {brief.needs.length === 0 ? (
            <EmptyState text="Nothing urgent for this period." />
          ) : (
            brief.needs.map((r, i) => (
              <BriefRowItem
                key={i}
                row={r}
                isLast={i === brief.needs.length - 1}
                projectId={project.id}
              />
            ))
          )}
        </div>
      </section>

      {/* 7 · Receipts — audit trail */}
      <section className="mt-9">
        <SectionHeading
          title="The agents behind this brief"
          subtitle={
            isStub
              ? 'Aggregation will populate once agents start running for this project.'
              : 'Every claim above traces back to one of these runs.'
          }
        />
        <div
          className="mt-4 overflow-hidden rounded-[12px] border bg-white"
          style={{ borderColor: C.border }}
        >
          {brief.receipts.length === 0 ? (
            <EmptyState text="No runs in this window." />
          ) : (
            brief.receipts.map((r, i) => (
              <Link
                key={i}
                to={`/projects/${project.id}/runs/${r.runId}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50"
                style={{
                  borderBottom: i === brief.receipts.length - 1 ? 'none' : `1px solid ${C.rowBorder}`,
                }}
              >
                <span className="text-[18px] leading-none">{r.agentEmoji}</span>
                <span className="flex-1 truncate text-[13.5px] font-semibold" style={{ color: C.ink }}>
                  {r.agentName}
                </span>
                <span className="text-[12.5px]" style={{ color: C.neutral5 }}>
                  {r.findingsCount} {r.findingsCount === 1 ? 'finding' : 'findings'}
                </span>
                <span className="w-[100px] text-right text-[12.5px]" style={{ color: C.neutral5 }}>
                  {r.finishedLabel}
                </span>
                <ArrowRight size={13} weight="bold" style={{ color: C.neutral4 }} />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function SegmentBtn({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
      style={{
        background: active ? C.purple : 'transparent',
        color: active ? '#ffffff' : C.neutral6,
      }}
    >
      {label}
    </button>
  );
}

function BigNumberCard({ n }: { n: BriefNumber }) {
  const deltaColor =
    n.deltaTone === 'good' ? C.greenDark :
    n.deltaTone === 'bad'  ? C.red       :
                             C.neutral5;
  const sparkColor =
    n.deltaTone === 'good' ? '#22c55e' :
    n.deltaTone === 'bad'  ? '#ef4444' :
                             '#a1a1aa';
  const Arrow =
    n.delta.startsWith('+') ? ArrowUp :
    n.delta.startsWith('−') || n.delta.startsWith('-') ? ArrowDown :
    null;

  return (
    <div
      className="rounded-[12px] border bg-white px-5 pb-4 pt-4"
      style={{ borderColor: C.border }}
    >
      <div className="text-[12px] font-medium" style={{ color: C.neutral5 }}>
        {n.label}
      </div>
      <div
        className="mt-2 text-[44px] font-extrabold leading-none tabular-nums"
        style={{ color: C.ink, letterSpacing: '-0.030em' }}
      >
        {n.value}
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold tabular-nums"
          style={{ color: deltaColor }}
        >
          {Arrow && <Arrow size={11} weight="bold" />}
          <span>{n.delta}</span>
        </span>
        <Sparkline points={n.spark} color={sparkColor} />
      </div>
    </div>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length === 0) return null;
  const W = 80;
  const H = 22;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = W / (points.length - 1 || 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = H - ((p - min) / range) * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} className="block">
      <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NarrativeCard({
  text, periodLabel, period,
}: { text: string; periodLabel: string; period: BriefPeriod }) {
  return (
    <div
      className="relative mt-9 overflow-hidden rounded-[16px] border"
      style={{
        background: 'linear-gradient(180deg, #07050D 0%, #0C0A14 100%)',
        borderColor: '#1a1a22',
      }}
    >
      {/* Radial purple bloom — same recipe as Project.tsx TodaysBriefCard */}
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
      <div className="relative px-7 py-8 sm:px-9 sm:py-9">
        <h2
          className="text-[22px] font-bold tracking-[-0.025em] text-white"
        >
          The {period === 'week' ? 'week' : 'month'} in a sentence
          <span style={{ color: '#A89BFF', fontStyle: 'italic' }}>.</span>
        </h2>
        <p
          className="mt-4 max-w-[68ch] text-[16px] leading-[1.6]"
          style={{ color: 'rgba(255,255,255,0.86)' }}
        >
          {text}
        </p>
        <div
          className="mt-5 text-[12px]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Composed from this period's agent runs · {periodLabel}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title, count, subtitle,
}: { title: string; count?: number; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2
        className="text-[20px] font-bold leading-[1.05]"
        style={{ color: C.ink, letterSpacing: '-0.02em' }}
      >
        {title}<span style={{ color: C.purple, fontStyle: 'italic' }}>.</span>
        {typeof count === 'number' && (
          <span
            className="ml-2 text-[14px] font-semibold"
            style={{ color: C.neutral4 }}
          >
            {count}
          </span>
        )}
      </h2>
      {subtitle && (
        <span className="text-[12.5px]" style={{ color: C.neutral5 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

function BriefRowItem({
  row, isLast, projectId,
}: { row: BriefRow; isLast: boolean; projectId: string }) {
  const dot =
    row.impact === 'healthy'  ? C.greenDot :
    row.impact === 'critical' ? C.redDot :
                                C.amberDot;
  const halo =
    row.impact === 'healthy'  ? '0 0 0 3px rgba(34,197,94,0.22), 0 0 10px rgba(34,197,94,0.18)' :
    row.impact === 'critical' ? '0 0 0 3px rgba(239,68,68,0.22), 0 0 10px rgba(239,68,68,0.18)' :
                                '0 0 0 3px rgba(245,158,11,0.20)';

  return (
    <Link
      to={`/projects/${projectId}/runs/${row.source.runId}`}
      className="grid grid-cols-[14px_1fr_auto_14px] items-start gap-5 px-6 py-5 transition-colors hover:bg-neutral-50"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${C.rowBorder}`,
      }}
    >
      <span
        className="mt-[7px] h-[10px] w-[10px] shrink-0 rounded-full"
        style={{ background: dot, boxShadow: halo }}
      />
      <div className="min-w-0">
        <div
          className="text-[16.5px] font-bold leading-[1.3]"
          style={{ color: C.ink, letterSpacing: '-0.015em' }}
        >
          {row.headline}
        </div>
        <div
          className="mt-1.5 text-[13.5px] leading-[1.5]"
          style={{ color: C.neutral6 }}
        >
          {row.body}
        </div>
      </div>
      <div className="text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: C.neutral7 }}>
          <span className="text-[14px] leading-none">{row.source.agentEmoji}</span>
          <span>{row.source.agentName}</span>
        </div>
        <div className="mt-1 text-[11.5px]" style={{ color: C.neutral5 }}>
          {row.source.whenLabel}
        </div>
      </div>
      <CaretRight
        size={14}
        weight="bold"
        className="mt-[7px]"
        style={{ color: C.neutral4 }}
      />
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-6 py-8 text-center text-[13px]" style={{ color: C.neutral5 }}>
      {text}
    </div>
  );
}
