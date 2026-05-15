import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  CaretRight, CaretDown, CaretUp, Share, Plus, ArrowRight, ArrowUp,
  ArrowUpRight, ArrowsClockwise, Flag, ShieldCheck, Target, ChartBar,
  Binoculars,
} from '@phosphor-icons/react';
import { StagePage } from '../components/StagePage';
import { SpyMascot } from '../components/SpyMascot';
import { RUNS } from '../mock/runs';
import { PROJECTS } from '../mock/projects';
import type { AgentRun } from '../types/agent';

// /reports/:runId — the agent results surface.
//
// For the canonical competitor-spy completed run we render the full
// pixel-perfect "report" layout: breadcrumb + title + dark hero card with
// the spy mascot + tabbed body + audit-the-work footer. Other completed
// runs fall back to the dark StagePage canvas that ships with the rest of
// the app — the new layout is purpose-built for the competitor-spy story
// and isn't expected to be the universal report shell yet.

export function AgentResults() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;
  if (!run) return <Navigate to="/" replace />;

  const completedRun = { ...run, status: 'completed' as const };

  if (completedRun.runId === 'run-competitor-spy-completed') {
    return <CompetitorSpyReport run={completedRun} />;
  }

  return (
    <div className="mx-auto max-w-[860px]">
      <StagePage run={completedRun} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Competitor Spy · pixel-perfect report
// ════════════════════════════════════════════════════════════════════════

function CompetitorSpyReport({ run }: { run: AgentRun }) {
  const project = PROJECTS.find((p) => p.id === run.projectId);
  const projectName = project?.name ?? '';

  return (
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Reports', run.parentAgent.name, projectName]} />
      <TitleRow agentName={run.parentAgent.name} />
      <MetaLine date="May 13, 2025" time="2:14 PM" rivals={8} />
      <HeroCard run={run} />
      <Tabs />
      <BodyCard run={run} />
      <AuditFooter />
    </div>
  );
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────

function Breadcrumbs({ trail }: { trail: string[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-[6px] text-[13px] text-ppc-text-muted">
      {trail.map((label, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={i} className="flex items-center gap-[6px]">
            <span
              className={
                last
                  ? 'font-medium text-ppc-ink'
                  : 'transition-colors hover:text-ppc-ink'
              }
            >
              {label}
            </span>
            {!last && (
              <CaretRight
                size={10}
                weight="bold"
                className="text-ppc-text-faint"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ─── Title row ───────────────────────────────────────────────────────────

function TitleRow({ agentName }: { agentName: string }) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[40px] font-extrabold leading-none tracking-[-0.025em] text-ppc-ink">
          {agentName}
        </h1>
        <OnTrackPill />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SecondaryButton icon={<Share size={14} weight="bold" />}>
          Share
          <CaretDown size={11} weight="bold" className="ml-1 text-ppc-text-muted" />
        </SecondaryButton>
        <PrimaryButton icon={<Plus size={14} weight="bold" />}>
          Audit the work
        </PrimaryButton>
      </div>
    </div>
  );
}

function OnTrackPill() {
  return (
    <span
      className="inline-flex items-center gap-[6px] rounded-full px-[11px] py-[5px] text-[12px] font-semibold"
      style={{
        background: '#DEF7E7',
        color: '#1F8A5A',
        boxShadow: 'inset 0 0 0 1px rgba(31,138,90,0.18)',
      }}
    >
      <span
        aria-hidden
        className="h-[6px] w-[6px] rounded-full"
        style={{
          background: '#1F8A5A',
          boxShadow: '0 0 0 3px rgba(31,138,90,0.18)',
        }}
      />
      On track
    </span>
  );
}

function SecondaryButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-[10px] border border-ppc-card-border bg-white px-[14px] py-[9px] text-[13px] font-medium text-ppc-ink transition-colors hover:bg-ppc-panel-soft"
    >
      {icon}
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-[10px] px-[16px] py-[10px] text-[13px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
      style={{
        background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Meta line ───────────────────────────────────────────────────────────

function MetaLine({
  date,
  time,
  rivals,
}: {
  date: string;
  time: string;
  rivals: number;
}) {
  return (
    <p className="mb-7 text-[13.5px] text-ppc-text-muted">
      Generated {date}
      <span className="mx-2 text-ppc-text-faint">·</span>
      {time}
      <span className="mx-2 text-ppc-text-faint">·</span>
      Compared to {rivals} rivals
    </p>
  );
}

// ─── Dark hero card ──────────────────────────────────────────────────────

function HeroCard({ run }: { run: AgentRun }) {
  const headline = run.headline;
  const hasPeriod = headline.endsWith('.');
  const body = hasPeriod ? headline.slice(0, -1) : headline;

  return (
    <section
      className="relative mb-10 overflow-hidden rounded-[20px] text-white"
      style={{
        background:
          'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      {/* Top-right purple bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.30) 0%, rgba(127,90,240,0.10) 35%, transparent 65%)',
        }}
      />
      {/* Soft bottom-left bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-[8%] h-[280px] w-[280px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)',
        }}
      />
      {/* Subtle starfield grain */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative grid gap-6 px-10 pb-7 pt-11 sm:grid-cols-[1fr_minmax(220px,300px)] sm:gap-10 sm:px-12 sm:pt-12">
        {/* Copy column */}
        <div className="min-w-0">
          <h2 className="font-display text-[44px] font-extrabold leading-[1.04] tracking-[-0.025em] text-white sm:text-[52px]">
            {body}
            {hasPeriod && <span style={{ color: '#9F86FF' }}>.</span>}
          </h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-white/65">
            {run.description}
          </p>
        </div>

        {/* Mascot column */}
        <div className="relative flex items-end justify-end sm:items-center">
          <SpyMascot />
        </div>
      </div>

      {/* Stat tiles inside the dark card */}
      <div className="relative grid gap-3 px-10 pb-10 sm:grid-cols-3 sm:gap-4 sm:px-12">
        {run.stats?.map((s, i) => (
          <DarkStatTile key={i} value={s.value} label={s.label} />
        ))}
      </div>
    </section>
  );
}

function DarkStatTile({ value, label }: { value: string; label: string }) {
  const m = value.match(/^(.+?)(\/\w+)$/);
  const main = m ? m[1] : value;
  const suffix = m ? m[2] : null;
  return (
    <div
      className="rounded-[14px] px-6 py-[22px]"
      style={{
        background: 'rgba(255,255,255,0.025)',
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.02) inset',
      }}
    >
      <div className="font-display text-[44px] font-extrabold leading-none tracking-[-0.025em] text-white">
        {main}
        {suffix && (
          <span className="ml-[1px] text-[18px] font-medium text-white/55">
            {suffix}
          </span>
        )}
      </div>
      <p className="mt-3 text-[12.5px] leading-[1.45] text-white/55">{label}</p>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────

const TAB_LABELS = ['Overview', 'Rivals', 'Gaps', 'Recommendations', 'Methodology'];

function Tabs() {
  const [active, setActive] = useState(0);
  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-1"
      style={{ borderBottom: '1px solid #e6e1ef' }}
    >
      {TAB_LABELS.map((label, i) => {
        const on = i === active;
        return (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i)}
            className={`relative px-3 py-3 text-[14px] font-medium tracking-[-0.005em] transition-colors ${
              on ? 'text-ppc-ink' : 'text-ppc-text-muted hover:text-ppc-ink'
            }`}
          >
            {label}
            {on && (
              <span
                aria-hidden
                className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full"
                style={{ background: '#7F5AF0' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Body card ───────────────────────────────────────────────────────────

function BodyCard({ run }: { run: AgentRun }) {
  return (
    <section
      className="mb-7 rounded-[16px] bg-white px-7 py-7"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
      }}
    >
      <WhatWeFoundHeader />
      <FindingTiles />
      <RecommendationsSection
        recs={run.findings?.slice(0, 3).map((f) => f.action ?? f.finding) ?? []}
      />
    </section>
  );
}

function WhatWeFoundHeader() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ppc-ink">
        What we found
      </h3>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        View full analysis
        <ArrowRight size={12} weight="bold" />
      </button>
    </div>
  );
}

// Static finding tiles — purpose-built for the competitor-spy overview.
// (The longer `run.findings` content lives further down the report in the
// full analysis view, which this tab summary points to.)
const FINDING_TILES: FindingTile[] = [
  {
    title: 'Bidding gaps on core terms',
    description:
      'Rivals are consistently outranking you on high-intent terms with higher bids and better ad rank.',
    impact: 'high',
    metrics: [
      { value: '$3.1K/mo', label: 'Potential upside' },
      { value: '8',        label: 'Affected' },
    ],
  },
  {
    title: 'Winning copy patterns',
    description:
      'Top rivals convert 64% of impression share with outcome-driven headlines and strong CTAs.',
    impact: 'high',
    metrics: [
      { value: '+64%', label: 'Impression share' },
      { value: '12',   label: 'Examples identified' },
    ],
  },
  {
    title: 'Auction overlap risk',
    description:
      'Rivals overlap with you on 41% of spend, driving up CPCs on key terms.',
    impact: 'medium',
    metrics: [
      { value: '41%', label: 'Overlap rate' },
      { value: '5',   label: 'Rivals competing' },
    ],
  },
];

interface FindingTile {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metrics: { value: string; label: string }[];
}

function FindingTiles() {
  return (
    <div className="mb-9 grid gap-4 sm:grid-cols-3">
      {FINDING_TILES.map((t, i) => (
        <FindingTileCard key={i} {...t} />
      ))}
    </div>
  );
}

function FindingTileCard({ title, description, impact, metrics }: FindingTile) {
  return (
    <div
      className="flex flex-col rounded-[14px] px-5 py-5"
      style={{
        background: '#FAF7FB',
        boxShadow:
          'inset 0 0 0 1px #eae3f1, 0 1px 0 rgba(15,10,30,0.02)',
      }}
    >
      <h4 className="text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">
        {title}
      </h4>
      <p className="mt-2 flex-1 text-[13px] leading-[1.55] text-ppc-text-muted">
        {description}
      </p>
      <div className="mt-3">
        <ImpactChip impact={impact} />
      </div>
      <div className="mt-4 flex items-end gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="min-w-0">
            <p className="font-display text-[20px] font-extrabold leading-none tracking-[-0.015em] text-ppc-ink">
              {m.value}
            </p>
            <p className="mt-1.5 text-[11.5px] leading-[1.35] text-ppc-text-muted">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactChip({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: {
      bg: '#FFE3DE',
      fg: '#B7321E',
      ring: 'rgba(183,50,30,0.20)',
      label: 'HIGH IMPACT',
    },
    medium: {
      bg: '#FFE8C7',
      fg: '#915214',
      ring: 'rgba(145,82,20,0.20)',
      label: 'MEDIUM IMPACT',
    },
    low: {
      bg: '#EEEBF7',
      fg: '#534AB7',
      ring: 'rgba(83,74,183,0.18)',
      label: 'LOW IMPACT',
    },
  }[impact];
  return (
    <span
      className="inline-flex items-center rounded-[6px] px-[9px] py-[4px] text-[10.5px] font-bold tracking-[0.06em]"
      style={{
        background: styles.bg,
        color: styles.fg,
        boxShadow: `inset 0 0 0 1px ${styles.ring}`,
      }}
    >
      {styles.label}
    </span>
  );
}

// ─── Top recommendations ─────────────────────────────────────────────────

interface RecRow {
  title: string;
  chips: { label: string; tone: 'win' | 'impact' }[];
  icon: 'rise' | 'refresh' | 'shield';
}

const RECS: RecRow[] = [
  {
    title: 'Raise bids on 8 high-intent keywords',
    chips: [
      { label: 'Quick win',   tone: 'win' },
      { label: 'High impact', tone: 'impact' },
    ],
    icon: 'rise',
  },
  {
    title: 'Refresh headlines to match winning patterns',
    chips: [{ label: 'High impact', tone: 'impact' }],
    icon: 'refresh',
  },
  {
    title: 'Add negative keywords to stop wasted spend',
    chips: [{ label: 'Quick win', tone: 'win' }],
    icon: 'shield',
  },
];

function RecommendationsSection({ recs }: { recs?: string[] }) {
  // recs param reserved for future per-run wiring; for now we render the
  // canonical three rows that match the design.
  void recs;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ppc-ink">
          Top recommendations
        </h3>
      </div>
      <p className="mb-4 text-[13px] text-ppc-text-muted">
        Prioritized actions to close the gaps
      </p>
      <div
        className="mb-4 overflow-hidden rounded-[12px]"
        style={{ boxShadow: 'inset 0 0 0 1px #ece6f3' }}
      >
        {RECS.map((r, i) => (
          <RecRowItem key={i} {...r} isLast={i === RECS.length - 1} />
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        View all recommendations
        <ArrowRight size={12} weight="bold" />
      </button>
    </div>
  );
}

function RecRowItem({
  title,
  chips,
  icon,
  isLast,
}: RecRow & { isLast: boolean }) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FBF9FD] ${
        isLast ? '' : 'border-b border-[#efeaf4]'
      }`}
    >
      <RecIcon kind={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ppc-text-muted">
          {chips.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              <RecChip {...c} />
              {i < chips.length - 1 && (
                <span className="text-ppc-text-faint">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecIcon({ kind }: { kind: 'rise' | 'refresh' | 'shield' }) {
  if (kind === 'rise') {
    return (
      <span
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px]"
        style={{
          background: 'linear-gradient(155deg, #6FE0AC 0%, #3FB985 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.45) inset, 0 6px 14px -6px rgba(63,185,133,0.45)',
        }}
      >
        <ArrowUp size={18} weight="bold" className="text-white" />
      </span>
    );
  }
  if (kind === 'refresh') {
    return (
      <span
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px]"
        style={{
          background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 60%, #5A3FE0 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
        }}
      >
        <ArrowsClockwise size={18} weight="bold" className="text-white" />
      </span>
    );
  }
  return (
    <span
      className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px]"
      style={{
        background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 60%, #5A3FE0 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
      }}
    >
      <Flag size={18} weight="fill" className="text-white" />
    </span>
  );
}

function RecChip({ label, tone }: { label: string; tone: 'win' | 'impact' }) {
  const styles =
    tone === 'win'
      ? { bg: '#E6F7EE', fg: '#1F8A5A', ring: 'rgba(31,138,90,0.18)' }
      : { bg: '#FFE6E0', fg: '#B7321E', ring: 'rgba(183,50,30,0.18)' };
  return (
    <span
      className="inline-flex items-center rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
      style={{
        background: styles.bg,
        color: styles.fg,
        boxShadow: `inset 0 0 0 1px ${styles.ring}`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Audit the work footer ───────────────────────────────────────────────

interface AuditRow {
  icon: 'target' | 'binoculars' | 'shield';
  agent: string;
  detail: string;
}

const AUDIT_ROWS: AuditRow[] = [
  {
    icon: 'target',
    agent: 'Competitor Discovery',
    detail: '45 tool calls · 8 rivals · 12 keywords · 7-day window',
  },
  {
    icon: 'binoculars',
    agent: 'Auction Intelligence',
    detail: '18 tool calls · 120 data points · 8 rivals · 15 keywords',
  },
  {
    icon: 'shield',
    agent: 'Audit the work',
    detail: '161 tool invocations across 6 specialists',
  },
];

function AuditFooter() {
  const [open, setOpen] = useState(true);
  return (
    <section
      className="relative overflow-hidden rounded-[16px] px-7 py-6"
      style={{
        background: '#F2EEFB',
        boxShadow: 'inset 0 0 0 1px #e1d8f0',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AuditShield />
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ppc-ink">
              Audit the work
            </h3>
            <p className="mt-[2px] text-[13px] text-ppc-text-muted">
              Every data point, every AI judgment. Transparent and verifiable.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-[10px] px-[14px] py-[9px] text-[13px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
          style={{
            background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
          }}
        >
          {open ? 'Hide audit details' : 'Show audit details'}
          {open ? (
            <CaretUp size={11} weight="bold" />
          ) : (
            <CaretDown size={11} weight="bold" />
          )}
        </button>
      </div>

      {open && (
        <div
          className="mt-5 overflow-hidden rounded-[12px] bg-white"
          style={{ boxShadow: 'inset 0 0 0 1px #ece6f3' }}
        >
          {AUDIT_ROWS.map((r, i) => (
            <AuditRowItem key={i} {...r} isLast={i === AUDIT_ROWS.length - 1} />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
        >
          View methodology
          <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </section>
  );
}

function AuditShield() {
  return (
    <span
      className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[12px]"
      style={{
        background: 'linear-gradient(155deg, #C9B5FF 0%, #8B6CF5 60%, #5A3FE0 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
      }}
    >
      <ShieldCheck size={22} weight="fill" className="text-white" />
    </span>
  );
}

function AuditRowItem({
  icon,
  agent,
  detail,
  isLast,
}: AuditRow & { isLast: boolean }) {
  const Icon =
    icon === 'target' ? Target : icon === 'binoculars' ? Binoculars : ChartBar;
  return (
    <button
      type="button"
      className={`group flex w-full items-center gap-4 px-5 py-[14px] text-left transition-colors hover:bg-[#FBF9FD] ${
        isLast ? '' : 'border-b border-[#efeaf4]'
      }`}
    >
      <span
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px]"
        style={{
          background: '#F0EBFA',
          boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.20)',
        }}
      >
        <Icon size={16} weight="bold" style={{ color: '#7F5AF0' }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {agent}
        </p>
        <p className="mt-[2px] text-[12.5px] text-ppc-text-muted">{detail}</p>
      </div>
      <ArrowUpRight
        size={14}
        weight="bold"
        className="text-ppc-text-faint transition-colors group-hover:text-ppc-ink"
      />
    </button>
  );
}
